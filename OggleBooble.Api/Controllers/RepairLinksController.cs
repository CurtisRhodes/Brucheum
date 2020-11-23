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
                string folderName = dbCategoryFolder.FolderName;
                if (dbCategoryFolder.FolderType == "singleChild") {
                    VirtualFolder dbParentFolder = db.VirtualFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    folderName = dbParentFolder.FolderName;
                }
                RenameFiles(ftpPath, folderName, repairReport);

                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                if (physcialFiles.Length > 0 && physcialFiles[0].StartsWith("ERROR"))
                {
                    repairReport.Success = physcialFiles[0];
                    return;
                }
                var dbFolderCatLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                var dbFolderImageFiles = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();


                // loop1A through physcial files
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var physcialFileName = physcialFiles[i];
                    var physcialFileLinkId = physcialFileName.Substring(physcialFileName.IndexOf("_") + 1, 36);

                    // 1. check for physicalFile in folder with no ImageFile row
                    var dbFolderImageFile = dbFolderImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbFolderImageFile != null)
                    {
                        if (dbFolderImageFile.FileName != physcialFileName)
                        {
                            dbFolderImageFile.FileName = physcialFileName;
                            db.SaveChanges();
                            repairReport.ImageFileNamesRenamed++;
                        }
                    }
                    if (dbFolderImageFile == null)
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
                                try
                                {
                                    using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                                    {
                                        fWidth = image.Width;
                                        fHeight = image.Height;
                                    }
                                }
                                catch (Exception ex)
                                {
                                    if (Helpers.ErrorDetails(ex).ToString() == "{Parameter is not valid.}")
                                        repairReport.Errors.Add("unable to get width and height of " + physcialFileName);
                                    else
                                        repairReport.Errors.Add(Helpers.ErrorDetails(ex));
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
                    }

                    // 2. check for physicalFiles with no link
                    if (dbFolderCatLinks.Where(il => il.ImageLinkId == physcialFileLinkId && il.ImageCategoryId == folderId).FirstOrDefault() == null)
                    {
                        var otherFolderCatLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == physcialFileLinkId).FirstOrDefault();
                        if (otherFolderCatLinks == null)
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

                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36));
                }

                // loop 2A loop through image files
                foreach (ImageFile imageFile in dbFolderImageFiles)
                {
                    // check if there is a physcial file in the folder for every ImageFile with a FolderId equaling the folderId.
                    if (!physcialFileLinkIds.Contains(imageFile.Id))
                    {
                        var otherFolderImageFile = db.ImageFiles.Where(l => l.Id == imageFile.Id).FirstOrDefault();
                        if (otherFolderImageFile == null)
                        {
                            //db.ImageFiles.Remove(existingImageFile);
                            //db.SaveChanges();
                            //repairReport.ImageFilesRemoved++;
                            //var badLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).ToList();
                        }
                    }
                    //ext = existingImageFile.FileName.Substring(existingImageFile.FileName.LastIndexOf("."));
                    //if (existingImageFile.FileName != (folderName + "_" + existingImageFile.Id + ext)) 
                    //{
                    //    existingImageFile.FileName = folderName + "_" + existingImageFile.Id + ext;
                    //    db.SaveChanges();
                    //    repairReport.ImageFileNamesRenamed++;
                    //}
                    repairReport.ImageFilesProcessed++;
                }

                // loop 2B
                // check if there is a physcial file in the folder for every link in the table.
                // there can be more links than files. That's the point. 
                foreach (CategoryImageLink folderCatLink in dbFolderCatLinks)
                {
                    if (!physcialFileLinkIds.Contains(folderCatLink.ImageLinkId))
                    {
                        var dbMisplacedImageFile = db.ImageFiles.Where(i => i.Id == folderCatLink.ImageLinkId).FirstOrDefault();
                        if (dbMisplacedImageFile == null)
                        {
                            var badLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == folderCatLink.ImageLinkId).ToList();
                            db.CategoryImageLinks.RemoveRange(badLinks);
                            db.SaveChanges();
                            repairReport.CatLinksRemoved += badLinks.Count();
                        }
                        else
                        {
                            var nonLocallinks = db.CategoryImageLinks.Where(i => (i.ImageLinkId == folderCatLink.ImageLinkId) && (i.ImageCategoryId != folderId)).ToList();
                            if (nonLocallinks.Count() == 0)
                            {
                                repairReport.Errors.Add("Orphan image?: " + dbMisplacedImageFile.Id);
                                db.CategoryImageLinks.Remove(folderCatLink);
                                db.SaveChanges();
                                repairReport.CatLinksRemoved++;
                            }
                            else
                            {
                                if (nonLocallinks.Count() == 1)
                                {
                                    //var nonLocallink = db.ImageFiles.Where(i => i.Id == folderCatLink.ImageLinkId && i.FolderId != folderId).FirstOrDefault();
                                    var firstNonLocallink = db.CategoryImageLinks.Where(i => (i.ImageLinkId == folderCatLink.ImageLinkId) && (i.ImageCategoryId != folderId)).FirstOrDefault();
                                    repairReport.Errors.Add("Missplaced image?: " + folderCatLink.ImageLinkId);

                                    //var misplacededImage = db.ImageFiles.Where(f => f.Id == folderCatLink.ImageLinkId).First();
                                    //misplacededImage
                                }
                            }
                        }
                    }
                    repairReport.LinkRecordsProcessed++;
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

        private string RenameFiles(string ftpPath, string folderName, RepairReportModel repairReport)
        {
            string success;
            try
            {
                string fileName, newFileName, ext, possibleGuid = "";
                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    fileName = physcialFiles[i];
                    ext = fileName.Substring(fileName.LastIndexOf("."));
                    if (fileName.LastIndexOf("_") > 0)
                    {
                        if (fileName.Length > 40)
                        {
                            try
                            {
                                possibleGuid = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                if (Guid.TryParse(possibleGuid, out Guid outGuid))
                                {
                                    if (fileName != (folderName + "_" + possibleGuid + ext))
                                    {
                                        newFileName = folderName + "_" + possibleGuid + ext;
                                        FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                                        repairReport.ImagesRenamed++;
                                    }
                                }
                            }
                            catch (Exception)
                            {
                                newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                                FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                                repairReport.ImagesRenamed++;
                            }
                        }
                        else
                        {
                            newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                            FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                            repairReport.ImagesRenamed++;
                        }
                    } //newFileName = fileName.Substring(0, fileName.LastIndexOf(".")) + "_" + Guid.NewGuid().ToString() + ext;
                    else
                    {
                        newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                        FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                        repairReport.ImagesRenamed++;
                    }
                }

                success = "ok";
            }
            catch (Exception ex)
            { 
                success = Helpers.ErrorDetails(ex); 
            }
            return success;
        }
    }
}