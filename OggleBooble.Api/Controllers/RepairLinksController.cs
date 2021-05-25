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
        //private readonly string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

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
                ImageFile dbFolderImageFile, dbMisplacedImageFile;
                List<CategoryImageLink> dbRejCatlinks;
                string ftpFileName, physcialFileName, physcialFileLinkId, rejectFolder, ftpSuccess;
                string imageFolderName = ftpPath.Substring(ftpPath.LastIndexOf("/") + 1);
                if (dbCategoryFolder.FolderType == "singleChild")
                {
                    CategoryFolder dbParentFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    imageFolderName = dbParentFolder.FolderName;
                }
                string renameSuccess = RenamePhyscialFiles(ftpPath, imageFolderName, repairReport);
                if(renameSuccess!="ok")
                {
                    repairReport.Success = renameSuccess + "ftpPath: " + ftpPath + "  imageFolderName: " + imageFolderName;
                    return;
                }

                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                if (physcialFiles.Length > 0 && physcialFiles[0].StartsWith("ERROR"))
                {
                    repairReport.Success = physcialFiles[0];
                    return;
                }
                #region 0 rename ImageFiles to expected name 
                var dbFolderImageFiles = db.ImageFiles.Where(if1 => if1.FolderId == folderId).ToList();
                string expectedFileName;
                foreach (ImageFile imageFile in dbFolderImageFiles)
                {
                    if (imageFile.FileName.LastIndexOf(".") < 5)
                    {
                        repairReport.Errors.Add("bad filename: " + imageFile.FileName + "folder: " + imageFile.FolderId);
                    }
                    else
                    {
                        expectedFileName = imageFolderName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
                        if (imageFile.FileName != expectedFileName)
                        {
                            imageFile.FileName = expectedFileName;
                            db.SaveChanges();
                            repairReport.ImageFilesRenamed++;
                        }
                    }
                }
                #endregion

                #region 1. make sure every physicalFile has an ImageFile row
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    physcialFileName = physcialFiles[i];
                    physcialFileLinkId = physcialFileName.Substring(physcialFileName.LastIndexOf("_") + 1, 36);
                    dbFolderImageFile = dbFolderImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbFolderImageFile == null)
                    {
                        dbMisplacedImageFile = db.ImageFiles.Where(m => m.Id == physcialFileLinkId).FirstOrDefault();
                        if (dbMisplacedImageFile != null)
                        {
                            if (dbMisplacedImageFile.FolderId == -6)
                            {
                                // should have moved file to rejects
                                //string newFileName = ftpPath + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
                                ftpFileName = ftpPath + "/" + physcialFileName;
                                rejectFolder = ftpHost + "/archive.OggleBooble.com/rejects/" + dbMisplacedImageFile.FileName;
                                if (FtpUtilies.MoveFile(ftpFileName, rejectFolder) == "ok")
                                    repairReport.ImageFilesMoved++;
                                dbRejCatlinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == dbMisplacedImageFile.Id).ToList();
                                if (dbRejCatlinks.Count > 0)
                                {
                                    foreach (CategoryImageLink dbRejCatlink in dbRejCatlinks)
                                    {
                                        if (dbRejCatlink.ImageCategoryId != -6)
                                        {
                                            db.CategoryImageLinks.Remove(dbRejCatlink);
                                            repairReport.CatLinksRemoved++;
                                        }
                                    }
                                    db.SaveChanges();
                                }
                            }
                            else
                            {
                                var catLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == physcialFileLinkId).ToList();
                                bool itsok = false;
                                foreach (CategoryImageLink catLink in catLinks)
                                {
                                    if (catLink.ImageCategoryId == dbMisplacedImageFile.FolderId)
                                    {
                                        itsok = true;
                                        break;
                                    }
                                }
                                if (!itsok)
                                {
                                    dbMisplacedImageFile.FolderId = folderId;
                                    db.SaveChanges();
                                    repairReport.ImageFilesMoved++;
                                }
                            }
                        }
                        else
                        {
                           string newFileName = imgRepo + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
                            ImageFileInfo imageFileInfo = GetImageFileInfo(newFileName);
                            ImageFile imageFile = new ImageFile()
                            {
                                Id = physcialFileLinkId,
                                Acquired = DateTime.Today,
                                ExternalLink = newFileName,
                                FileName = physcialFileName,
                                FolderId = folderId,
                                Height = imageFileInfo.Height,
                                Size = imageFileInfo.Size,
                                Width = imageFileInfo.Width
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
                                repairReport.CatLinksAdded++;
                            }
                            db.SaveChanges();
                            repairReport.ImageFilesAdded++;
                        }
                    }
                    else
                    {
                        if (dbFolderImageFile.Size == 0)
                        {
                            string newFileName = imgRepo + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
                            ImageFileInfo imageFileInfo = GetImageFileInfo(newFileName);
                            if (imageFileInfo.Size == 0)
                            {

                                if (FtpUtilies.DeleteFile(ftpPath + "/" + dbFolderImageFile.FileName) == "ok")
                                {
                                    db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == dbFolderImageFile.Id).ToList());
                                    db.ImageFiles.Remove(dbFolderImageFile);
                                    db.SaveChanges();

                                    repairReport.ZeroLenImageFilesRemoved++;
                                }
                            }
                            else
                            {
                                dbFolderImageFile.Size = imageFileInfo.Size;
                                dbFolderImageFile.Height = imageFileInfo.Height;
                                dbFolderImageFile.Width = imageFileInfo.Width;
                                db.SaveChanges();
                                repairReport.ZeroLenFileResized++;
                            }
                        }
                    }
                    repairReport.PhyscialFilesProcessed++;
                }
                #endregion

                #region 2. Make sure every ImageFile row has a physcial file
                // rebuild list 
                dbFolderImageFiles = db.ImageFiles.Where(if1 => if1.FolderId == folderId).ToList();
                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++) { physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].LastIndexOf("_") + 1, 36)); }
                if (physcialFileLinkIds.Count() != dbFolderImageFiles.Count())
                {
                    if (physcialFileLinkIds.Count() > dbFolderImageFiles.Count())
                    {
                        foreach (string pflinkId in physcialFileLinkIds)
                        {
                            dbFolderImageFile = db.ImageFiles.Where(i => i.Id == pflinkId).FirstOrDefault();
                            if (dbFolderImageFile == null)
                            {
                                db.ImageFiles.Add(new ImageFile()
                                {
                                    Id = pflinkId,
                                    FolderId = folderId,
                                    FileName = ""
                                });

                            }
                            else if (dbFolderImageFile.FolderId != folderId)
                            {
                                List<CategoryImageLink> links = db.CategoryImageLinks.Where(l => l.ImageLinkId == dbFolderImageFile.Id).ToList();
                                if (links.Count() > 0)
                                {
                                    dbFolderImageFile.FolderId = folderId;
                                    db.SaveChanges();
                                    repairReport.NoLinkImageFiles++;                                }
                                else
                                {
                                    string imageFileToRemove = ftpPath + "/" + imageFolderName + "_" + pflinkId + ".jpg";
                                    rejectFolder = ftpHost + "/archive.OggleBooble.com/rejects/" + imageFolderName + "_" + pflinkId + ".jpg";
                                    ftpSuccess = FtpUtilies.MoveFile(imageFileToRemove, rejectFolder);
                                    //.DeleteFile(ftpPath + "/" + imageFolderName + "_" + pflinkId + ".jpg");
                                    //ftpSuccess = FtpUtilies.DeleteFile(ftpPath + "/" + imageFolderName + "_" + pflinkId + ".jpg");
                                    if (ftpSuccess == "ok")
                                    {
                                        repairReport.ImageFilesRemoved++;
                                        repairReport.Errors.Add("I moved a file to rejects : " + imageFolderName + "_" + pflinkId);
                                    }
                                    else
                                        repairReport.Errors.Add("I wanted to delete : " + imageFolderName + "_" + pflinkId);
                                }
                            }
                        }
                    }
                    else
                    {
                        repairReport.Errors.Add("Folder: " + folderId + " FolderName: " + imageFolderName +
                            "  physcialFiles: " + physcialFileLinkIds.Count() +
                            " ImageFiles: " + dbFolderImageFiles.Count());
                    }
                }

                foreach (ImageFile imageFile in dbFolderImageFiles)
                {
                    if (!physcialFileLinkIds.Contains(imageFile.Id))
                    {
                        if (imageFile.ExternalLink != "?")
                        {
                            // Download missing File
                            if (imageFile.FileName.LastIndexOf(".") < 2)
                            {
                                repairReport.Errors.Add("bad filename: " + imageFile.FileName + "folder: " + imageFile.FolderId);
                            }
                            else
                            {
                                expectedFileName = imageFolderName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
                                string newFileName = imgRepo + "/" + dbCategoryFolder.FolderPath + "/" + expectedFileName;
                                string downLoadSuccess = DownLoadImage(ftpPath, imageFile.ExternalLink, expectedFileName);
                                if (downLoadSuccess == "ok")
                                    repairReport.ImagesDownLoaded++;
                                else
                                {
                                    repairReport.Errors.Add("download faild: " + imageFile.ExternalLink);
                                    db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).ToList());
                                    db.ImageFiles.Remove(imageFile);
                                    db.SaveChanges();
                                    repairReport.ImageFilesRemoved++;
                                }
                            }
                        }
                        else
                        {
                            repairReport.Errors.Add("ImageFile with no physcial file " + imageFile.Id);
                            db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == imageFile.Id).ToList());
                            db.ImageFiles.Remove(imageFile);
                            db.SaveChanges();
                            repairReport.ImageFilesRemoved++;
                        }
                    }
                    repairReport.ImageFilesProcessed++;
                }

                #endregion

                #region 3. check if there is a catlink for every physcial file 
                var dbCatLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                foreach (string pfLinkId in physcialFileLinkIds)
                {
                    if (dbCatLinks.Where(il => il.ImageLinkId == pfLinkId).FirstOrDefault() == null)
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = folderId,
                            ImageLinkId = pfLinkId,
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
                if ((physcialFiles.Length == 1) && (physcialFiles[0].StartsWith("ERROR")))
                {
                    return physcialFiles[0];
                }
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
                        var sss = FtpUtilies.RenameFile(ftpPath + "/" + fileName, newFileName);
                        if(sss=="ok")
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

        private ImageFileInfo GetImageFileInfo(string imgFileName)
        {
            ImageFileInfo imageFileInfo = new ImageFileInfo();
            try
            {
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                using (WebClient wc = new WebClient())
                {
                    wc.DownloadFile(new Uri(imgFileName), appDataPath + "tempImage.tmp");
                }
                using (var fileStream = new FileStream(appDataPath + "tempImage.tmp", FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    imageFileInfo.Size = fileStream.Length;
                    try
                    {
                        using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                        {
                            imageFileInfo.Width = image.Width;
                            imageFileInfo.Height = image.Height;
                        }
                    }
                    catch (Exception ex)
                    {
                        if (Helpers.ErrorDetails(ex).ToString() == "{Parameter is not valid.}")
                            imageFileInfo.Success = "unable to get width and height of " + imgFileName;
                        else
                            imageFileInfo.Success = "problem getting filesize" + Helpers.ErrorDetails(ex);
                    }
                }
                imageFileInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                imageFileInfo.Success = Helpers.ErrorDetails(ex);
            }
            return imageFileInfo;
        }

        private string DownLoadImage(string ftpPath, string externalFileName, string newFileName)
        {
            string success = "ok";
            try
            {
                string extension = newFileName.Substring(newFileName.Length - 4);
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                using (WebClient wc = new WebClient())
                {
                    wc.DownloadFile(new Uri(externalFileName), appDataPath + "tempImage" + extension);
                }

                FtpWebRequest webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;


                using (Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = System.IO.File.ReadAllBytes(appDataPath + "tempImage" + extension);
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public class DupeGroup
        {
            public string IpAddress { get; set; }
            public int Count { get; set; }
        }

        [HttpGet]
        [Route("api/RepairLinks/RemoveDuplicateIps")]
        public DupeIpRepairReportModel RemoveDuplicateIps()
        {
            DupeIpRepairReportModel repairReport = new DupeIpRepairReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    int imageHitsChanged, pageHitsChanged, activityLogsChanged;

                    //List<Visitor> unregistedVisitors =
                    //    db.Database.SqlQuery<Visitor>("select * from OggleBooble.Visitor where VisitorId not in (select VisitorId from OggleBooble.RegisteredUser)").ToList();

                    List<DupeGroup> dupGroups = db.Database.SqlQuery<DupeGroup>("select IpAddress, count(*) from Visitor v left join RegisteredUser r " +
                    "on v.VisitorId = r.VisitorId where r.VisitorId is null group by IpAddress having count(*) > 1 order by count(*) desc").ToList();
                        
                    //"select IpAddress, count(*) from Visitor group by IpAddress having count(*) > 1 order by count(*) desc;").ToList();

                    foreach (DupeGroup dupGroup in dupGroups)
                    {
                        List<Visitor> duplicateIps = db.Visitors.Where(v => v.IpAddress == dupGroup.IpAddress).ToList();
                        Visitor firstVisitor = duplicateIps[0];
                        foreach (Visitor duplicateIp in duplicateIps)
                        {
                            if (duplicateIp.VisitorId != firstVisitor.VisitorId)
                            {
                                imageHitsChanged = db.Database.ExecuteSqlCommand(
                                    "Update OggleBooble.ImageHit set VisitorId = '" + firstVisitor.VisitorId + "' where VisitorId='" + duplicateIp.VisitorId + "';");
                                repairReport.ImageHitsUpdated += imageHitsChanged;

                                pageHitsChanged = db.Database.ExecuteSqlCommand(
                                    "Update OggleBooble.PageHit set VisitorId = '" + firstVisitor.VisitorId + "' where VisitorId='" + duplicateIp.VisitorId + "';");
                                repairReport.PageHitsUpdated += pageHitsChanged;

                                activityLogsChanged = db.Database.ExecuteSqlCommand(
                                    "Update OggleBooble.ActivityLog set VisitorId ='" + firstVisitor.VisitorId + "' where VisitorId='" + duplicateIp.VisitorId + "';");
                                repairReport.ActivityLogsUpdated += activityLogsChanged;

                                //unregistedVisitors.Remove(duplicateIp);
                                repairReport.VisitorRowsRemoved++;
                            }
                        }
                        db.Visitors.RemoveRange(duplicateIps);
                        db.SaveChanges();
                    }
                    repairReport.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }
    }
}