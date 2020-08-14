using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RepairLinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string tempFolder = ConfigurationManager.AppSettings["tempFolder"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
        private readonly string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/RepairLinks/Repair")]
        public RepairReportModel RepairLinks(int folderId, bool recurr)
        {
            RepairReportModel repairReport = new RepairReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    PerformFolderChecks(folderId, repairReport, db, recurr);
                }
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }

        private string CreateImageFileRecord(int folderId,string linkId,string path, string fileName, OggleBoobleMySqlContext db)
        {
            string success;
            try
            {
                int fWidth = 0; int fHeight = 0; long fSize = 0;
                string imgFileName = tempFolder + "/" + path + "/" + fileName;
                using (var fileStream = new FileStream(imgFileName, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    fSize = fileStream.Length;
                    using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                    { fWidth = image.Width; fHeight = image.Height; }
                }

                db.ImageFiles.Add(new ImageFile()
                {
                    Id = linkId,
                    Acquired = DateTime.Today,
                    ExternalLink = "?",
                    FileName = fileName,
                    FolderId = folderId,
                    Height = fHeight,
                    Size = fSize,
                    Width = fWidth
                });
                db.SaveChanges();

                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }


        private void PerformFolderChecks(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db, bool recurr)
        {
            try
            { 
                VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                if (physcialFiles.Length > 0 && physcialFiles[0].StartsWith("ERROR"))
                {
                    repairReport.Success = physcialFiles[0];
                    return;
                }
                string physcialFileLinkId, createImageFileSuccess;
                var categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                // 1 loop through physcial files
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    physcialFileLinkId = physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36);
                    // 1. check if there is an ImageLink record for every file in the directory
                    var dbImageFile = db.ImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbImageFile == null)
                    {
                        createImageFileSuccess = CreateImageFileRecord(folderId, physcialFileLinkId, dbCategoryFolder.FolderPath, physcialFiles[i], db);
                        if (createImageFileSuccess == "ok")
                            repairReport.ImageFilesAdded++;
                        else
                            repairReport.Errors.Add(createImageFileSuccess);
                    }
                    else
                    {
                        if (dbImageFile.FolderId != folderId)
                        {
                            dbImageFile.FolderId = folderId;
                            db.SaveChanges();
                            repairReport.ImageFilesMoved++;
                        }
                    }
                    // 2. check if there is a CategoryImageLinks record for every file in the directory
                    if (categoryImageLinks.Where(il => il.ImageLinkId == physcialFileLinkId && il.ImageCategoryId == folderId).FirstOrDefault() == null)
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = physcialFileLinkId, SortOrder = 1313 });
                        db.SaveChanges();
                        repairReport.CatLinksAdded++;
                    }
                    repairReport.PhyscialFilesProcessed++;
                }
                // 2 loop through database records
                var folderLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++) { physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36)); }
                // check if there is a physcial file in the folder for every link in the table.
                foreach (CategoryImageLink folderLink in folderLinks)
                {
                    if (!physcialFileLinkIds.Contains(folderLink.ImageLinkId))
                    {
                        var nonLocallink = db.ImageFiles.Where(i => i.Id == folderLink.ImageLinkId && i.FolderId != folderId).FirstOrDefault();
                        if (nonLocallink == null)
                        {
                            // link does not exist in ImageFiles
                            var badImageLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == folderLink.ImageLinkId).ToList();
                            //repairReport.OrphanCatLinkRecs.Add(folderLink.ImageLinkId);
                            db.CategoryImageLinks.RemoveRange(badImageLinks);
                            db.SaveChanges();
                            repairReport.LinksRemoved += badImageLinks.Count();

                            var dbImageFile = db.ImageFiles.Where(i => i.Id == folderLink.ImageLinkId).FirstOrDefault();
                            if (dbImageFile != null)
                            {
                                dbImageFile.FolderId = 0;
                                db.SaveChanges();
                                repairReport.ImageFilesZeroed++;
                            }
                        }
                        else
                        {
                            var dbImageFile = db.ImageFiles.Where(i => i.Id == folderLink.ImageLinkId).FirstOrDefault();
                            if (dbImageFile == null)
                            {
                                db.CategoryImageLinks.Remove(folderLink);
                                db.SaveChanges();
                                repairReport.LinksRemoved++;
                            }
                            else
                            {
                                if (dbImageFile.FolderId != folderId)
                                {
                                    dbImageFile.FolderId = folderId;
                                    db.SaveChanges();
                                    repairReport.ImageFilesMoved++;
                                }
                            }

                        }
                    }
                    repairReport.LinkRecordsProcessed++;
                }

                // loop 3
                var dbImageFiles = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();
                foreach (ImageFile imageFile in dbImageFiles)
                {
                    // check if there is a physcial file in the folder for every ImageFile with a FolderId equaling the folderId.
                    if (!physcialFileLinkIds.Contains(imageFile.Id))
                    {
                        var dbAllImageFiles = db.ImageFiles.Where(i => i.Id == imageFile.Id).FirstOrDefault();
                        if (dbAllImageFiles == null)
                        {
                            //if (dbAllImageFiles.FolderId != folderId) 
                            //db.ImageFiles.Remove()
                            imageFile.FolderId = 0;
                            db.SaveChanges();
                            repairReport.ImageFilesZeroed++;
                        }
                        else
                        {
                            if (dbAllImageFiles.FolderId == folderId)
                                repairReport.Errors.Add("contains may not be working");
                            else
                            {
                                // MOVE FILE WHERE IT BELONGS

                                new LinksController().MoveFile(imageFile.Id, dbAllImageFiles.FolderId, "MOV");
                                repairReport.ImageFilesMoved++;
                            }
                        }

                        if (db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id && l.ImageCategoryId == folderId).FirstOrDefault() != null)
                        {
                            // but possibly a deleted dupe
                            db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = imageFile.Id, SortOrder = 871 });
                            db.SaveChanges();
                            repairReport.CatLinksAdded++;
                        }
                    }
                    repairReport.ImageFilesProcessed++;
                }
                if (recurr)
                {
                    var childFolders = db.VirtualFolders.Where(c => c.Parent == folderId).ToList();
                    foreach (VirtualFolder childFolder in childFolders)
                    {
                        PerformFolderChecks(childFolder.Id, repairReport, db, recurr);
                    }
                }
                repairReport.Success = "ok";
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
        }
    }
}