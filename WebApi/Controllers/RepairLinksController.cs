using IWshRuntimeLibrary;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.OggleBoobleSqlContext;
using WebApi.Ftp;
using System.Configuration;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class RepairLinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];

        [HttpGet]
        public RepairReportModel RepairLinks(int startFolderId, string drive)
        {
            RepairReportModel repairReport = new RepairReportModel() { isSubFolder = false };
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var timer = new System.Diagnostics.Stopwatch();
                    timer.Start();
                    RepairLinksRecurr(startFolderId, repairReport, db);
                    timer.Stop();
                    System.Diagnostics.Debug.WriteLine("VerifyLinksRecurr took: " + timer.Elapsed);
                }
                repairReport.Success = "ok";
            }
            catch (Exception ex) { repairReport.Success = Helpers.ErrorDetails(ex); }
            return repairReport;
        }
        private string EnsureCorrectFileName(string suspectFileName, string folderName, string ftpPath)
        {
            string correctFileName = "";
            string ext = suspectFileName.Substring(suspectFileName.Length - 4);
            if (!ext.StartsWith("."))
                correctFileName = "Unexpected extension";
            else
            {
                if ((suspectFileName.LastIndexOf("_") > 0) && (suspectFileName.Substring(suspectFileName.LastIndexOf("_")).Length > 40))
                {
                    correctFileName = suspectFileName;
                }
                else
                {
                    correctFileName = folderName + Guid.NewGuid().ToString() + ext;



                    FtpUtilies.MoveFile(ftpPath + suspectFileName, ftpPath + correctFileName);
                }
            }

            return correctFileName;
        }
        private void RepairLinksRecurr(int folderId, RepairReportModel repairReport, OggleBoobleContext db)
        {
            try
            {

                CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + dbCategoryFolder.RootFolder + ".ogglebooble.com/"
                    + Helpers.GetParentPath(folderId) + dbCategoryFolder.FolderName;

                if (!FtpUtilies.DirectoryExists(ftpPath))
                {
                    repairReport.DirNotFound++;
                    FtpUtilies.CreateDirectory(ftpPath);
                    repairReport.Errors.Add("created directory " + ftpPath);
                }
                int folderRowsProcessed = 0;

                //if (repairReport.isSubFolder)
                //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                //else
                //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);

                List<ImageLink> goDaddyLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     && g.Link.Contains(dbCategoryFolder.FolderName)
                     && g.FolderLocation == dbCategoryFolder.Id
                     select (g)).ToList();

                string[] imageFiles = FtpUtilies.GetFiles(ftpPath);

                string goDaddyPrefix = "http://" + dbCategoryFolder.RootFolder + ".ogglebooble.com/";                
                string expectedLinkName = goDaddyPrefix + Helpers.GetParentPath(folderId) + dbCategoryFolder.FolderName;
                string ext = "";
                bool fileNameInExpectedForm;
                string linkId = "";

                foreach (string fileName in imageFiles)
                {
                    //EnsureCorrectFileName(fileName, ftpPath);
                    if ((fileName.LastIndexOf("_") > 0) && (fileName.Substring(fileName.LastIndexOf("_")).Length > 40))
                    {
                        fileNameInExpectedForm = true;
                        if (fileName.IndexOf(".") > 0)
                        {
                            ext = fileName.Substring(fileName.Length - 4);
                            linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                            //expectedFileName = dbCategoryFolder.FolderName + "_" + linkId + ext;
                            //if (fileName == expectedFileName)

                            var folderNameWhereImageSayItShouldBe = fileName.Substring(0, fileName.IndexOf("_"));
                            if (folderNameWhereImageSayItShouldBe != dbCategoryFolder.FolderName)
                            {
                                CategoryFolder categoryFolderWhereImageSayItShouldBe = db.CategoryFolders.Where(f => f.FolderName == folderNameWhereImageSayItShouldBe).FirstOrDefault();
                                if (categoryFolderWhereImageSayItShouldBe != null)
                                {
                                    string ftpPathWhereImageSayItShouldBe = ftpHost + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                        + Helpers.GetParentPath(categoryFolderWhereImageSayItShouldBe.Id) + categoryFolderWhereImageSayItShouldBe.FolderName;
                                    string[] ArrayWhereImageSayItShouldBe = FtpUtilies.GetFiles(ftpPathWhereImageSayItShouldBe);
                                    if (ArrayWhereImageSayItShouldBe.Contains(categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext))
                                    {
                                        FtpUtilies.DeleteFile(ftpPath + categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext);
                                        repairReport.LinksRemoved++;
                                    }
                                }
                                else
                                {  // move file 
                                    string source = ftpPath + "/" + fileName;
                                    string destination = ftpHost + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                        + Helpers.GetParentPath(categoryFolderWhereImageSayItShouldBe.Id) + categoryFolderWhereImageSayItShouldBe.FolderName;
                                    if (source != destination)
                                    {
                                        FtpUtilies.MoveFile(source, destination);
                                        ImageLink extraLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                        if (extraLink != null)
                                        {
                                            db.ImageLinks.Remove(extraLink);
                                            db.SaveChanges();
                                        }
                                        repairReport.ImagesMoved++;
                                    }
                                }
                            }

                            ImageLink goDaddyLinkExists = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                            if (goDaddyLinkExists == null)
                            {
                                if (FtpUtilies.DirectoryExists(ftpPath + "/" + fileName))
                                {
                                    ImageLink newLink = new ImageLink() { Id = linkId, Link = expectedLinkName + "/" + fileName, ExternalLink = "unknown", FolderLocation = folderId };
                                    db.ImageLinks.Add(newLink);
                                    db.SaveChanges();
                                    repairReport.NewLinksAdded++;
                                }
                            }
                            else
                            {
                                // if (goDaddyLinkExists.Link.ToUpper() != (expectedLinkName + "/" + fileName).ToUpper())
                                if (goDaddyLinkExists.Link != expectedLinkName + "/" + fileName)
                                {
                                    goDaddyLinkExists.Link = expectedLinkName + "/" + fileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                            }
                            if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).Where(c => c.ImageCategoryId == folderId).FirstOrDefault() == null)
                            {
                                CategoryImageLink newCatLink = new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = linkId };
                                db.CategoryImageLinks.Add(newCatLink);
                                db.SaveChanges();
                                repairReport.CatLinksAdded++;
                            }
                        }
                        else
                        {
                            repairReport.Errors.Add("extension problem");
                            fileNameInExpectedForm = false;
                        }
                    }
                    else
                    {
                        fileNameInExpectedForm = false;
                        ext = fileName.Substring(fileName.Length - 4);
                        linkId = Guid.NewGuid().ToString();
                        //expectedFileName = dbCategoryFolder.FolderName + "_" + linkId + ext;
                    }
                    if (!fileNameInExpectedForm)
                    {
                        // rename file
                        string renameSuccess = FtpUtilies.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + fileName);
                        if (renameSuccess == "ok")
                        {
                            repairReport.ImagesRenamed++;
                            ImageLink oldImageLink = goDaddyLinks.Where(g => g.Link == expectedLinkName + "/" + fileName).FirstOrDefault();
                            if (oldImageLink != null)
                            {
                                if (oldImageLink.Link != expectedLinkName + "/" + fileName)
                                {
                                    // update godaddy link
                                    oldImageLink.Link = expectedLinkName + "/" + fileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                            }
                            else
                            {
                                // link not found in this folder's links
                                ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                if (goDaddyLink != null)
                                {
                                    goDaddyLink.Link = expectedLinkName + "/" + fileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                                else
                                {
                                    var newImageLink = new ImageLink()
                                    {
                                        Id = linkId,
                                        FolderLocation = folderId,
                                        Link = expectedLinkName + "/" + fileName,
                                        ExternalLink = ""
                                    };
                                    db.ImageLinks.Add(newImageLink);
                                    db.SaveChanges();
                                    repairReport.NewLinksAdded++;
                                }

                                if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault() == null)
                                {
                                    CategoryImageLink newCatLink = new CategoryImageLink()
                                    {
                                        ImageCategoryId = folderId,
                                        ImageLinkId = linkId
                                    };
                                    db.CategoryImageLinks.Add(newCatLink);
                                    db.SaveChanges();
                                    repairReport.CatLinksAdded++;
                                }
                            }
                        }
                        else
                        {
                            repairReport.Errors.Add("rename Failed: " + renameSuccess);
                        }
                    }

                    //if (repairReport.isSubFolder)
                    //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                    //else
                    //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);


                    repairReport.RowsProcessed++;
                    folderRowsProcessed++;
                }

                if (goDaddyLinks.Count() != imageFiles.Count())
                {
                    if (goDaddyLinks.Count() > imageFiles.Count())
                    {
                        string expectedFileName = "";
                        foreach (ImageLink goDaddyLink in goDaddyLinks)
                        {
                            expectedFileName = goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("/") + 1);
                            if (!imageFiles.Contains(expectedFileName))
                            {
                                string downLoadSuccess = DownLoadImage(ftpPath, goDaddyLink.ExternalLink, expectedFileName);
                                if (downLoadSuccess == "ok")
                                    repairReport.ImagesDownLoaded++;
                                else
                                {
                                    // problem with links to child folder files
                                    repairReport.Errors.Add(goDaddyLink.ExternalLink + " " + downLoadSuccess);
                                    db.ImageLinks.Remove(goDaddyLink);
                                    var badCatFolderImageLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == dbCategoryFolder.Id && c.ImageLinkId == goDaddyLink.Id).FirstOrDefault();
                                    if (badCatFolderImageLink != null)
                                    {
                                        db.CategoryImageLinks.Remove(badCatFolderImageLink);
                                    }
                                    db.SaveChanges();
                                    repairReport.LinksRemoved++;
                                }
                            }
                            //if (repairReport.isSubFolder)
                            //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                            //else
                            //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
                        }
                    }

                    if (imageFiles.Count() > goDaddyLinks.Count())
                    {
                        repairReport.Errors.Add("Extra Links Found in " + ftpPath);
                    }
                }


                int[] subDirs = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
                foreach (int subDir in subDirs)
                {
                    repairReport.isSubFolder = true;
                    RepairLinksRecurr(subDir, repairReport, db);
                }
            }
            catch (Exception ex) { repairReport.Success = Helpers.ErrorDetails(ex); }
        }

        private string DownLoadImage(string ftpPath, string link, string newFileName)
        {
            string success = "ok";
            try
            {
                string extension = newFileName.Substring(newFileName.Length - 4);
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                using (WebClient wc = new WebClient())
                {
                    wc.DownloadFile(new Uri(link), appDataPath + "tempImage" + extension);
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
        [Route("api/RepairLinks/UpdateDates")]
        public RepairReportModel UpdateDates(int startFolderId)
        {
            RepairReportModel results = new RepairReportModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var timer = new System.Diagnostics.Stopwatch();
                    timer.Start();
                    UpDateDatesRecurr(startFolderId, results, db);
                    timer.Stop();
                    System.Diagnostics.Debug.WriteLine("VerifyLinksRecurr took: " + timer.Elapsed);
                }
                results.Success = "ok";
            }
            catch (Exception ex)
            {
                results.Success = Helpers.ErrorDetails(ex);
            }
            return results;
        }
        private string UpDateDatesRecurr(int folderId, RepairReportModel results, OggleBoobleContext db)
        {
            string success = "";
            try
            {
                //CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                //string ftpPath = ftpHost + "/" + dbCategoryFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(folderId);
                List<ImageLink> imageLinks = db.ImageLinks.Where(l => l.FolderLocation == folderId).ToList();
                DateTime imageFileDateTime= DateTime.MinValue;
                foreach (ImageLink imageLink in imageLinks)
                {
                    if (imageLink.LastModified == null)
                    {
                        try
                        {
                            imageFileDateTime = FtpUtilies.GetLastModified(imageLink.Link.Replace("http://", ftpHost));
                            imageLink.LastModified = imageFileDateTime;
                            db.SaveChanges();
                            results.NewLinksAdded++;
                        }
                        catch (Exception ex)
                        {
                            success = Helpers.ErrorDetails(ex);
                            results.Errors.Add(imageLink.Id + " date: " + imageFileDateTime + " error: " + success);
                            results.LinksRemoved++;
                        }
                    }
                    else {
                        results.ImagesRenamed++;
                    }
                    results.RowsProcessed++;
                }

                foreach (int subDirId in db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray())
                {
                    UpDateDatesRecurr(subDirId, results, db);
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }




        [HttpPut]
        [Route("api/RepairLinks/EmergencyFolderLocationFix")]
        public RepairReportModel EmergencyFolderLocationFix(int root)
        {
            RepairReportModel repairReportModel = new RepairReportModel();
            EmergencyFolderLocationRecurr(root, repairReportModel);
            return repairReportModel;
        }
        private void EmergencyFolderLocationRecurr(int root, RepairReportModel repairReportModel)
        {
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == root).ToList();
                    string linkId;
                    foreach (CategoryFolder categoryFolder in categoryFolders)
                    {
                        string ftpPath = ftpHost + "/" + categoryFolder.RootFolder + ".ogglebooble.com/"
                            + Helpers.GetParentPath(categoryFolder.Id) + categoryFolder.FolderName;
                        string[] files = FtpUtilies.GetFiles(ftpPath);
                        foreach (string fileName in files)
                        {
                            if (fileName.LastIndexOf("_") > 0)
                            {
                                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                ImageLink imageLink = db.ImageLinks.Where(l => l.Id == linkId).FirstOrDefault();
                                if (imageLink != null)
                                {
                                    if (imageLink.FolderLocation != categoryFolder.Id)
                                    {
                                        if (imageLink.FolderLocation == 4267)
                                        {
                                            imageLink.FolderLocation = categoryFolder.Id;
                                            db.SaveChanges();
                                            repairReportModel.LinksEdited++;
                                        }
                                    }
                                    else
                                    {
                                        repairReportModel.ImagesMoved++;
                                        if (imageLink.FolderLocation == 4267)
                                            Console.WriteLine("imageLink.FolderLocation() != categoryFolder.Id()");
                                    }
                                }
                                else
                                {
                                    repairReportModel.Errors.Add("no imagelink found for link " + linkId + " folder: " + categoryFolder.FolderName);
                                }
                            }
                            else
                            {
                                Console.WriteLine("bad filename?: " + fileName);
                                repairReportModel.Errors.Add("bad filename ?: " + fileName);
                            }
                            repairReportModel.RowsProcessed++;
                        }
                        EmergencyFolderLocationRecurr(categoryFolder.Id, repairReportModel);
                    }
                    repairReportModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                repairReportModel.Success = Helpers.ErrorDetails(ex);
            }
        }

        [HttpPut]
        [Route("api/RepairLinks/MoveManyCleanup")]
        public RepairReportModel MoveManyCleanup(int root)
        {
            RepairReportModel repairReportModel = new RepairReportModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder startFolder = db.CategoryFolders.Where(f => f.Id == root).FirstOrDefault();
                    string ftpPath = ftpHost + "/" + startFolder.RootFolder + ".ogglebooble.com/"
                        + Helpers.GetParentPath(startFolder.Id) + startFolder.FolderName;
                    string[] rootFiles = FtpUtilies.GetFiles(ftpPath);
                    //List<string> rootFileLinks = new List<string>();
                    //foreach (string fileName in rootFiles) rootFileLinks.Add(fileName.Substring(fileName.LastIndexOf("_") + 1, 36));
                    List<CategoryFolder> subDirs = db.CategoryFolders.Where(f => f.Parent == root).ToList();
                    string sourcePath = startFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(startFolder.Id) + startFolder.FolderName;
                    string moveFileSuccess, newLink, linkId, destinationPath;
                    string imageFileName = "";
                    foreach (CategoryFolder subDir in subDirs)
                    {
                        destinationPath = subDir.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(subDir.Id) + subDir.FolderName;
                        List<CategoryImageLink> subFolderLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subDir.Id).ToList();
                        foreach (CategoryImageLink subFolderLink in subFolderLinks) 
                        {
                            bool found = false;
                            foreach (string fileName in rootFiles)
                            {
                                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                if (linkId == subFolderLink.ImageLinkId) {
                                    found = true;
                                    imageFileName = fileName;
                                    break;
                                }
                            }
                            //if (rootFiles.Contains(subFolderLink.ImageLinkId))
                            if (found)
                            {
                                ImageLink imageLink = db.ImageLinks.Where(i => i.Id == subFolderLink.ImageLinkId).FirstOrDefault();
                                string ext = imageFileName.Substring(imageFileName.LastIndexOf("."));
                                string newImageFileName = subDir.FolderName + "_" + subFolderLink.ImageLinkId + imageFileName.Substring(imageFileName.LastIndexOf("."));


                                if (FtpUtilies.DirectoryExists(ftpHost + sourcePath + "/" + imageFileName))
                                {
                                    moveFileSuccess = FtpUtilies.MoveFile(ftpHost + sourcePath + "/" + imageFileName, ftpHost + destinationPath + "/" + newImageFileName);
                                    if (moveFileSuccess == "ok")
                                    {
                                        if (imageLink != null)
                                        {
                                            newLink = "http://" + destinationPath + "/" + newImageFileName;
                                            imageLink.Link = newLink;
                                            imageLink.FolderLocation = subDir.Id;
                                            db.SaveChanges();
                                            repairReportModel.LinksEdited++;
                                            CategoryImageLink badCategoryImageLink = db.CategoryImageLinks
                                                .Where(c => c.ImageLinkId == subFolderLink.ImageLinkId && c.ImageCategoryId == root).FirstOrDefault();
                                            if (badCategoryImageLink != null)
                                            {
                                                db.CategoryImageLinks.Remove(badCategoryImageLink);
                                                db.SaveChanges();
                                                repairReportModel.LinksRemoved++;
                                            }
                                        }
                                        else
                                        {
                                            repairReportModel.Errors.Add("no imagelink found for link " + subFolderLink.ImageLinkId + " folder: " + startFolder.FolderName);
                                        }
                                    }
                                    else
                                    {
                                        repairReportModel.Errors.Add("link " + ftpHost + sourcePath + imageFileName + " error: " + moveFileSuccess);
                                    }
                                }
                            }
                            repairReportModel.RowsProcessed++;
                        }
                    }
                    repairReportModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                repairReportModel.Success = Helpers.ErrorDetails(ex);
            }
            return repairReportModel;
        }

    }
}
