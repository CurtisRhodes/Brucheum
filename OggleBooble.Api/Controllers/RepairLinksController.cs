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

                string imageFileName = ftpPath.Substring(ftpPath.LastIndexOf("/") + 1);
                if (dbCategoryFolder.FolderType == "singleChild")
                {
                    CategoryFolder dbParentFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                    imageFileName = dbParentFolder.FolderName;
                }
                RenamePhyscialFiles(ftpPath, imageFileName, repairReport);

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
                    expectedFileName = imageFileName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
                    if (imageFile.FileName != expectedFileName)
                    {
                        imageFile.FileName = expectedFileName;
                        db.SaveChanges();
                        repairReport.ImageFilesRenamed++;
                    }
                }
                #endregion

                #region 1. make sure every physicalFile has an ImageFile row
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var physcialFileName = physcialFiles[i];
                    var physcialFileLinkId = physcialFileName.Substring(physcialFileName.LastIndexOf("_") + 1, 36);
                    var dbFolderImageFile = dbFolderImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbFolderImageFile == null)
                    {
                        var dbMisplacedImageFile = db.ImageFiles.Where(m => m.Id == physcialFileLinkId).FirstOrDefault();
                        if (dbMisplacedImageFile != null)
                        {
                            if (dbMisplacedImageFile.FolderId == -6)
                            {
                                // should have moved file to rejects
                                //string newFileName = ftpPath + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
                                string ftpFileName = ftpPath + "/" + physcialFileName;
                                string rejectFolder = ftpHost + "/archive.OggleBooble.com/rejects/" + dbMisplacedImageFile.FileName;
                                if (FtpUtilies.MoveFile(ftpFileName, rejectFolder) == "ok")
                                    repairReport.ImageFilesMoved++;
                                var dbRejCatlinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == dbMisplacedImageFile.Id).ToList();
                                if (dbRejCatlinks.Count > 0)
                                {
                                    foreach (CategoryImageLink dbRejCatlink in dbRejCatlinks)
                                    {
                                        if (dbRejCatlink.ImageCategoryId != -6)
                                        {
                                            db.CategoryImageLinks.Remove(dbRejCatlink);
                                        }
                                    }
                                    db.SaveChanges();
                                }
                            }
                            else
                            {
                                dbMisplacedImageFile.FolderId = folderId;
                                db.SaveChanges();
                                repairReport.ImageFilesMoved++;
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
                                db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == dbFolderImageFile.Id).ToList());
                                db.ImageFiles.Remove(dbFolderImageFile);
                                db.SaveChanges();
                                repairReport.ZeroLenImageFilesRemoved++;
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
                    repairReport.Errors.Add("physcialFiles: " + physcialFileLinkIds.Count() + " ImageFiles: " + dbFolderImageFiles.Count() +
                        " " + imageFileName);
                }

                foreach (ImageFile imageFile in dbFolderImageFiles)
                {
                    if (!physcialFileLinkIds.Contains(imageFile.Id))
                    {
                        if (imageFile.ExternalLink != "?")
                        {
                            // Download missing File
                            //public SuccessModel AddImageLink(AddLinkModel addLinkModel)
                            //string xpname = imageFile.Id
                            expectedFileName = imageFileName + "_" + imageFile.Id + imageFile.FileName.Substring(imageFile.FileName.LastIndexOf("."));
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
                    string defaultVisitorId = "";
                    List<Visitor> badIps = db.Database.SqlQuery<Visitor>(
                        "select * from OggleBooble.Visitor group by IpAddress having count(*) > 1;").ToList();

                    for (int i = 0; i < badIps.Count; i++)
                    {
                        try
                        {
                            if (i == 0)
                            {
                                defaultVisitorId = badIps[0].VisitorId;
                            }
                            else
                            {
                                imageHitsChanged = db.Database.ExecuteSqlCommand(
                                    "Update OggleBooble.ImageHit set VisitorId = '" + defaultVisitorId + "' where VisitorId='" + badIps[i].VisitorId + "';");
                                pageHitsChanged = db.Database.ExecuteSqlCommand(
                                    "Update OggleBooble.PageHit set VisitorId = '" + defaultVisitorId + "' where VisitorId='" + badIps[i].VisitorId + "';");
                                activityLogsChanged = db.Database.ExecuteSqlCommand(
                                    "Update OggleBooble.ActivityLog set VisitorId = '" + defaultVisitorId + "' where VisitorId='" + badIps[i].VisitorId + "';");

                                if (imageHitsChanged > 0)
                                    repairReport.ImageHitsUpdated += imageHitsChanged;

                                repairReport.PageHitsUpdated += pageHitsChanged;
                                repairReport.ActivityLogsUpdated += activityLogsChanged;

                                string visIdtoRemove = badIps[i].VisitorId;
                                Visitor rowToRemove = db.Visitors.Where(v => v.VisitorId == visIdtoRemove).First();
                                db.Visitors.Remove(rowToRemove);
                                db.SaveChanges();
                                repairReport.VisitorRowsRemoved++;
                            }
                        }
                        catch (Exception ex)
                        {
                            repairReport.Errors.Add(Helpers.ErrorDetails(ex));
                        }
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