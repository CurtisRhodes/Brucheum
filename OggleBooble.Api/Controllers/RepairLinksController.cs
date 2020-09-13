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
                var dbFolderCatLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                var dbFolderImageFiles = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();

                // loop through physcial files
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var physcialFileName = physcialFiles[i];
                    var physcialFileLinkId = physcialFileName.Substring(physcialFileName.IndexOf("_") + 1, 36);

                    // 1. check for physicalFile in folder with no ImageFile row
                    var dbFolderImageFile = dbFolderImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbFolderImageFile== null)
                    {
                        var dbOtherFoldeImageLink = db.ImageFiles.Where(il => il.Id == physcialFileLinkId).FirstOrDefault();
                        if (dbOtherFoldeImageLink != null)
                        {
                            if (dbOtherFoldeImageLink.FolderId != folderId)
                            {
                                dbOtherFoldeImageLink.FolderId = folderId;
                                db.SaveChanges();
                                repairReport.ImageFilesMoved++;
                            }
                            else
                                repairReport.Errors.Add("how did this happen");
                        }
                        else
                        {
                            // create new ImageFile record
                            try
                            {
                                // USE WEBCLIENT TO CREATE THE FILE
                                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                                string imgFileName = imgRepo + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
                                using (WebClient wc = new WebClient())
                                {
                                    wc.DownloadFile(new Uri(imgFileName), appDataPath + "tempImage.tmp");
                                }
                                int fWidth = 0; int fHeight = 0; long fSize = 0;
                                using (var fileStream = new FileStream(appDataPath + "tempImage.tmp", FileMode.Open, FileAccess.Read, FileShare.Read))
                                {
                                    fSize = fileStream.Length;
                                    using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                                    {
                                        fWidth = image.Width;
                                        fHeight = image.Height;
                                    }
                                }
                                db.ImageFiles.Add(new ImageFile()
                                {
                                    Id = physcialFileLinkId,
                                    Acquired = DateTime.Today,
                                    ExternalLink = "?",
                                    FileName = physcialFileName,
                                    FolderId = folderId,
                                    Height = fHeight,
                                    Size = fSize,
                                    Width = fWidth
                                });
                                db.SaveChanges();
                                repairReport.ImageFilesAdded++;
                            }
                            catch (Exception ex)
                            {
                                repairReport.Errors.Add(Helpers.ErrorDetails(ex));
                            }
                        }
                    }
                    else {
                        if (dbFolderImageFile.FileName != physcialFileName)
                        {
                            dbFolderImageFile.FileName = physcialFileName;
                            db.SaveChanges();
                            repairReport.ImagesRenamed++;
                        }
                    }
                    // 2. check for physicalFiles with no link
                    if (dbFolderCatLinks.Where(il => il.ImageLinkId == physcialFileLinkId && il.ImageCategoryId == folderId).FirstOrDefault() == null)
                    {
                        //var otherFolderCatLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == physcialFileLinkId).FirstOrDefault();
                        ///if (otherFolderCatLinks == null)
                        {
                            db.CategoryImageLinks.Add(new CategoryImageLink()
                            {
                                ImageCategoryId = folderId,
                                ImageLinkId = physcialFileLinkId,
                                SortOrder = 7313
                            });
                            db.SaveChanges();
                            repairReport.CatLinksAdded++;
                        }
                    }
                    repairReport.PhyscialFilesProcessed++;
                }

                // loop through folder catLinks
                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36));
                }

                // check if there is a physcial file in the folder for every link in the table.
                // there can be more links than files. That's the point.
                foreach (CategoryImageLink folderCatLink in dbFolderCatLinks)
                {
                    if (!physcialFileLinkIds.Contains(folderCatLink.ImageLinkId))
                    {
                        // we have an extra cat link
                        var nonLocallink = db.ImageFiles.Where(i => i.Id == folderCatLink.ImageLinkId && i.FolderId != folderId).FirstOrDefault();
                        if (nonLocallink == null)
                        {
                            var dbOtherFolderFileLink = db.ImageFiles.Where(i => i.Id == folderCatLink.ImageLinkId).FirstOrDefault();
                            if (dbOtherFolderFileLink == null)
                            {
                                db.CategoryImageLinks.Remove(folderCatLink);
                                db.SaveChanges();
                                repairReport.CatLinksRemoved++;
                            }
                        }
                    }
                    repairReport.LinkRecordsProcessed++;
                }

                // loop 3
                foreach (ImageFile existingImageFile in dbFolderImageFiles)
                {
                    // check if there is a physcial file in the folder for every ImageFile with a FolderId equaling the folderId.
                    if (!physcialFileLinkIds.Contains(existingImageFile.Id))
                    {
                        var otherFolderCatFiles = db.CategoryImageLinks.Where(l => l.ImageLinkId == existingImageFile.Id).ToList();
                        if (otherFolderCatFiles == null)
                        {// orphan image file 
                            repairReport.Errors.Add("orphan image file");
                            existingImageFile.FolderId = 0;

                        }

                        // I'd have to scann ever physical folder's links prove there is no file for this file link.
                        //var dbImageFile = db.ImageFiles.Where(i => i.Id == existingImageFile.Id).FirstOrDefault();
                        //if ((dbImageFile == null) || (dbImageFile.FolderId == folmagederId))

                        //repairReport.OrphanImageFileRecs.Add(existingImageFile.Id);
                        //db.ImageFiles.Remove(existingImageFile);

                        //var dbBadLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == existingImageFile.Id).ToList();
                        //db.CategoryImageLinks.RemoveRange(dbBadLinks);

                        //db.SaveChanges();
                        //repairReport.DirNotFound++;
                        //repairReport.LinksRemoved += dbBadLinks.Count();

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
                return;
            }
        }
    }
}