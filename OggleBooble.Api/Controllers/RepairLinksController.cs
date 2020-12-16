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
                CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
                //string folderName = dbCategoryFolder.FolderName;

                string imageFileName = ftpPath.Substring(ftpPath.LastIndexOf("/") + 1);
                if (dbCategoryFolder.FolderType == "singleChild") {
                    CategoryFolder dbParentFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    imageFileName = dbParentFolder.FolderName;
                }
                RenamePhyscialFiles(ftpPath, imageFileName, repairReport);

                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                if (physcialFiles.Length > 0 && physcialFiles[0].StartsWith("ERROR")) { repairReport.Success = physcialFiles[0]; return; }

                #region 0 rename ImageFiles
                var dbFolderImageFiles = db.ImageFiles.Where(if1 => if1.FolderId == folderId).ToList();
                string expectedFileName;
                foreach (ImageFile imageFile in dbFolderImageFiles)
                {
                    expectedFileName = imageFileName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
                    if (imageFile.FileName != expectedFileName)
                    {
                        imageFile.FileName = expectedFileName;
                        //ImageFile realImageFile = db.ImageFiles.Where(i => i.Id == imageFile.Id).First();
                        //realImageFile.FileName = expectedFileName;
                        db.SaveChanges();
                        repairReport.ImageFilesRenamed++;
                    }
                }
                #endregion

                #region 1. make sure every physicalFile has an ImageFile row
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var physcialFileName = physcialFiles[i];
                    var physcialFileLinkId = physcialFileName.Substring(physcialFileName.IndexOf("_") + 1, 36);

                    var dbFolderImageFile = dbFolderImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbFolderImageFile == null)
                    {
                        var dbMisplacedImageFile = db.ImageFiles.Where(m => m.Id == physcialFileLinkId).FirstOrDefault();
                        if (dbMisplacedImageFile != null)
                        {
                            dbMisplacedImageFile.FolderId = folderId;
                            db.SaveChanges();
                            repairReport.ImageFilesMoved++;
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
                                        repairReport.Errors.Add("problem getting filesize" + Helpers.ErrorDetails(ex));
                                }
                            }
                            ImageFile imageFile = new ImageFile()
                            {
                                Id = physcialFileLinkId,
                                Acquired = DateTime.Today,
                                ExternalLink = "?",
                                FileName = physcialFileName,
                                FolderId = folderId,
                                Height = fHeight,
                                Size = fSize,
                                Width = fWidth
                            };
                            db.ImageFiles.Add(imageFile);
                            dbFolderImageFiles.Add(imageFile);
                            CategoryImageLink ktest = db.CategoryImageLinks.Where(l => (l.ImageCategoryId == folderId) && (l.ImageLinkId == physcialFileLinkId)).FirstOrDefault();
                            if (ktest == null)
                            {
                                db.CategoryImageLinks.Add(new CategoryImageLink()
                                {
                                    ImageCategoryId = folderId,
                                    ImageLinkId = physcialFileLinkId,
                                    SortOrder = 0
                                });
                            }
                            db.SaveChanges();
                            repairReport.CatLinksAdded++;
                            repairReport.ImageFilesAdded++;
                        }
                    }
                }
                #endregion

                #region 2. Make sure every ImageFile row has a physcial file
                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++) { physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36)); }
                if (physcialFileLinkIds.Count() != dbFolderImageFiles.Count())
                {
                    repairReport.Errors.Add("physcialFiles: " + physcialFileLinkIds.Count() + " ImageFiles: " + dbFolderImageFiles.Count() +
                        " " + imageFileName);
                }
                foreach (string physcialFileLinkId in physcialFileLinkIds)
                {
                    if (dbFolderImageFiles.Where(i => i.Id == physcialFileLinkId).FirstOrDefault() == null)
                    {
                        var dbMisplacedImageFile = db.ImageFiles.Where(i => i.Id == physcialFileLinkId).FirstOrDefault();
                        if (dbMisplacedImageFile != null)
                        {
                            if (dbMisplacedImageFile.FolderId != folderId)
                            {
                                dbMisplacedImageFile.FolderId = folderId;
                                db.SaveChanges();
                                repairReport.ImageFilesMoved++;
                            }
                            //repairReport.Errors.Add("tried to move but already there: " + physcialFileLinkId);
                            else
                            {
                                repairReport.Errors.Add("physcial file with no ImageFile: " + physcialFileLinkId);
                            }
                        }
                    }
                    repairReport.PhyscialFilesProcessed++;
                }
                foreach (ImageFile imageFile in dbFolderImageFiles)
                {
                    if (!physcialFileLinkIds.Contains(imageFile.Id))
                    {
                        //repairReport.Errors.Add("ImageFile with no physcial file "+ imageFile.Id);
                        db.ImageFiles.Remove(imageFile);
                        db.SaveChanges();
                        repairReport.ImageFilesRemoved++;
                    }
                    repairReport.ImageFilesProcessed++;
                }
                
                #endregion

                #region 3. check if there is a catlink for every physcial file 
                var dbCatLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                foreach (string physcialFileLinkId in physcialFileLinkIds)
                {
                    if (dbCatLinks.Where(il => il.ImageLinkId == physcialFileLinkId).FirstOrDefault() == null)
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = folderId,
                            ImageLinkId = physcialFileLinkId,
                            SortOrder = 0
                        });
                        db.SaveChanges();
                        repairReport.CatLinksAdded++;
                    }
                    repairReport.LinkRecordsProcessed++;
                }
                #endregion

                if (recurr)
                {
                    var childFolders = db.CategoryFolders.Where(c => c.Parent == folderId).ToList();
                    foreach (CategoryFolder childFolder in childFolders)
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

        private string RenamePhyscialFiles(string ftpPath, string folderName, RepairReportModel repairReport)
        {
            string success;
            try
            {
                // use parent foldername for path
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
                                        repairReport.PhyscialFileRenamed++;
                                    }
                                }
                            }
                            catch (Exception)
                            {
                                newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                                FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                                repairReport.PhyscialFileRenamed++;
                            }
                        }
                        else
                        {
                            newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                            FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                            repairReport.PhyscialFileRenamed++;
                        }
                    } 
                    else
                    {
                        newFileName = folderName + "_" + Guid.NewGuid().ToString() + ext;
                        FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                        repairReport.PhyscialFileRenamed++;
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