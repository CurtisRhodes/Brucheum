using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi;
using WebApi.Models;
using WebApi.DataContext;
using static System.Net.WebRequestMethods;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class FtpImagePageController : ApiController
    {
        [HttpGet]
        public string CollapseFolder(int folderId)
        {
            string success = "";
            CategoryFolderModel categoryFolder = new CategoryFolderModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int parent = db.CategoryFolders.Where(f => f.Id == folderId).First().Parent;
                    List<MoveCopyImageModel> links = (from l in db.CategoryImageLinks
                             join g in db.ImageLinks on l.ImageLinkId equals g.Id
                             where l.ImageCategoryId == folderId
                             select new MoveCopyImageModel() {
                                 DestinationFolderId = parent,
                                 Mode = "Move",
                                 SourceFolderId = folderId,
                                 Link = g.Link
                             }).ToList();
                    int i = 0;
                    int linkCount = links.Count;
                    foreach (MoveCopyImageModel model in links)
                    {
                        success = MoveImage(model);
                        if (success != "ok")
                            System.Diagnostics.Debug.WriteLine("move file on local drive : " + success);
                        //    return success;
                        SignalRHost.ProgressHub.ShowProgressBar(linkCount, ++i);
                        SignalRHost.ProgressHub.PostToClient("Moving: " + i + " of " + linkCount);
                    }

                    CategoryFolder emptyFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();

                    string originPath = Helpers.GetParentPath(emptyFolder.Id, true);
                    string ftpPath = "ftp://50.62.160.105/" + emptyFolder.RootFolder + ".ogglebooble.com/" + originPath + emptyFolder.FolderName;
                    success = FtpIO.RemoveDirectory(ftpPath);
                    if(success!="ok")
                        System.Diagnostics.Debug.WriteLine("failed to remove FTP folder : " + success);

                    CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(n => n.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetail != null)
                    {
                        db.CategoryFolderDetails.Remove(dbFolderDetail);
                        db.SaveChanges();
                    }
                    db.CategoryFolders.Remove(emptyFolder);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string MoveImage(MoveCopyImageModel model)
        {
            if (model.SourceFolderId == model.DestinationFolderId)
                return "ok";

            string success = "ok";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).FirstOrDefault();
                    CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).FirstOrDefault();

                    string extension = model.Link.Substring(model.Link.LastIndexOf("."));
                    string linkId = model.Link.Substring(model.Link.LastIndexOf("_") + 1, 36);
                    string destinationFtpPath = "ftp://50.62.160.105/" + dbDestinationFolder.RootFolder + ".ogglebooble.com/" +
                         Helpers.GetParentPath(model.DestinationFolderId, true) + dbDestinationFolder.FolderName;
                    string newFileName = dbDestinationFolder.FolderName + "_" + linkId + extension;

                    string sourceFileName = model.Link.Substring(model.Link.LastIndexOf("/") + 1);



                    string sourceFtpPath = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/"
                        + Helpers.GetParentPath(model.SourceFolderId, true) + dbSourceFolder.FolderName;

                    if (!FtpIO.DirectoryExists(destinationFtpPath))
                        FtpIO.CreateDirectory(destinationFtpPath);

                    success = FtpIO.MoveFile(sourceFtpPath + "/" + sourceFileName, destinationFtpPath + "/" + newFileName);
                    if (success == "ok")
                    {
#if DEBUG
                        // move file on local drive 
                        try
                        {
                            string localServerPath = "F:/Danni/";
                            string localSourcePath = localServerPath + Helpers.GetParentPath(model.SourceFolderId, false) + dbSourceFolder.FolderName;
                            DirectoryInfo dirInfo = new DirectoryInfo(localSourcePath);
                            if (dirInfo.Exists)
                            {
                                FileInfo fileInfo = dirInfo.GetFiles(dbSourceFolder.FolderName + "_" + linkId + extension).FirstOrDefault();
                                if (fileInfo != null)
                                {
                                    string localDestinationPath = localServerPath + Helpers.GetParentPath(model.DestinationFolderId, false) + "/" + dbDestinationFolder.FolderName;
                                    if (!System.IO.Directory.Exists(localDestinationPath))
                                        System.IO.Directory.CreateDirectory(localDestinationPath);
                                    fileInfo.MoveTo(localDestinationPath + "/" + newFileName);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex));
                        }
                    
#endif
                        //2. update ImageLink 
                        string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                        string goDaddyLink = linkPrefix + Helpers.GetParentPath(model.DestinationFolderId, true) +
                            dbDestinationFolder.FolderName + "/" + dbDestinationFolder.FolderName + "_" + linkId + extension;
                        ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                        goDaddyrow.Link = goDaddyLink;
                        goDaddyrow.FolderLocation = dbDestinationFolder.Id;
                        db.SaveChanges();

                        //3 create new link for new location if necessary
                        if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault() == null)
                        {
                            CategoryImageLink newCatImageLink = new CategoryImageLink() { ImageCategoryId = model.DestinationFolderId, ImageLinkId = linkId };
                            db.CategoryImageLinks.Add(newCatImageLink);
                            db.SaveChanges();
                        }
                    }

                    if (model.Mode == "Move")
                    {
                        // remove current link
                        CategoryImageLink oldCatImageLink = db.CategoryImageLinks
                             .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == linkId).First();

                        db.CategoryImageLinks.Remove(oldCatImageLink);
                        db.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpDelete]
        public string RemoveImage(DeleteLinkModel badLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int linkCount = db.CategoryImageLinks.Where(c => c.ImageLinkId == badLink.ImageId).ToList().Count;
                    if (linkCount == 1)
                    {
                        ///  move image to reject folder
                        CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == badLink.FolderId).FirstOrDefault();
                        ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == badLink.ImageId).FirstOrDefault();
                        string fileName = goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("/") + 1);

                        //string ext = goDaddyLink.Link.Substring(goDaddyLink.Link.Length - 4);
                        //string expectedFileName = dbFolder.FolderName + "_" + badLink.ImageId + ext;
                        //if (fileName != expectedFileName)
                        //    success = "oh well";

                        string folderPath = Helpers.GetParentPath(badLink.FolderId, true);
                        string ftpPath = "ftp://50.62.160.105/" + dbFolder.RootFolder + ".OGGLEBOOBLE.COM/" + folderPath + "/" + dbFolder.FolderName + "/" + fileName;


                        string rejectPath = "ftp://50.62.160.105/archive.OGGLEBOOBLE.COM/rejects/" + dbFolder.RootFolder + "/" + fileName;
                        FtpIO.MoveFile(ftpPath, rejectPath);
                        goDaddyLink.Link = "http://archive.OGGLEBOOBLE.COM/rejects/" + dbFolder.RootFolder + fileName;
                        db.SaveChanges();
                        try
                        {
                            var junkFolder = db.CategoryFolders.Where(f => f.Parent == 908 && f.FolderName == dbFolder.RootFolder).First();
                            db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = junkFolder.Id, ImageLinkId = badLink.ImageId });
                            db.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            success = ex.Message;
                        }
                    }
                    CategoryImageLink dbBadLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == badLink.FolderId).Where(c => c.ImageLinkId == badLink.ImageId).First();
                    db.CategoryImageLinks.Remove(dbBadLink);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class FtpDashBoardController : ApiController
    {
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
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }
        private void RepairLinksRecurr(int folderId, RepairReportModel repairReport, OggleBoobleContext db)
        {
            CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
            string ftpPath = "ftp://50.62.160.105/" + dbCategoryFolder.RootFolder + ".ogglebooble.com/"
                + Helpers.GetParentPath(folderId, true) + dbCategoryFolder.FolderName;

            if (!FtpIO.DirectoryExists(ftpPath))
            {
                repairReport.DirNotFound++;
                FtpIO.CreateDirectory(ftpPath);
                repairReport.Errors.Add("created directory " + ftpPath);
            }
            int folderRowsProcessed = 0;
            if(repairReport.isSubFolder)
                SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
            else
                SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
            List<ImageLink> goDaddyLinks =
                (from c in db.CategoryImageLinks
                 join g in db.ImageLinks on c.ImageLinkId equals g.Id
                 where c.ImageCategoryId == folderId
                 select (g)).ToList();

            string[] files = FtpIO.GetFiles(ftpPath);
            string goDaddyPrefix = "http://" + dbCategoryFolder.RootFolder + ".ogglebooble.com/";
            string expectedLinkName = goDaddyPrefix + Helpers.GetParentPath(folderId, true) + dbCategoryFolder.FolderName;
            string expectedFileName = "";
            string linkId = "";
            string ext = "";
            bool fileNameInExpectedForm;
            bool anyChangesMade = false;

            foreach (string fileName in files)
            {
                if ((fileName.LastIndexOf("_") > 0) && (fileName.Substring(fileName.LastIndexOf("_")).Length > 40))
                {
                    fileNameInExpectedForm = true;
                    if (fileName.IndexOf(".") > 0)
                    {
                        ext = fileName.Substring(fileName.Length - 4);
                        linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                        expectedFileName = dbCategoryFolder.FolderName + "_" + linkId + ext;
                        if (fileName == expectedFileName)
                        {
                            var folderNameWhereImageSayItShouldBe = fileName.Substring(0, fileName.IndexOf("_"));
                            if (folderNameWhereImageSayItShouldBe != dbCategoryFolder.FolderName)
                            {
                                CategoryFolder categoryFolderWhereImageSayItShouldBe = db.CategoryFolders.Where(f => f.FolderName == folderNameWhereImageSayItShouldBe).FirstOrDefault();
                                if (categoryFolderWhereImageSayItShouldBe != null)
                                {
                                    string ftpPathWhereImageSayItShouldBe = "ftp://50.62.160.105/" + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                        + Helpers.GetParentPath(categoryFolderWhereImageSayItShouldBe.Id, true) + categoryFolderWhereImageSayItShouldBe.FolderName;
                                    string[] ArrayWhereImageSayItShouldBe = FtpIO.GetFiles(ftpPathWhereImageSayItShouldBe);
                                    if (ArrayWhereImageSayItShouldBe.Contains(categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext))
                                    {
                                        FtpIO.DeleteFile(ftpPath + categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext);
                                        repairReport.LinksRemoved++;
                                    }
                                }
                                else
                                {  // move file 
                                    string source = ftpPath + "/" + fileName;
                                    string destination = "ftp://50.62.160.105/" + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                        + Helpers.GetParentPath(categoryFolderWhereImageSayItShouldBe.Id, true) + categoryFolderWhereImageSayItShouldBe.FolderName;
                                    if (source != destination)
                                    {
                                        FtpIO.MoveFile(source, destination);
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

                            if (db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault() == null)
                            {
                                // no godaddyLink found // add row
                                ImageLink newLink = new ImageLink() { Id = linkId, Link = expectedLinkName + "/" + expectedFileName, ExternalLink = linkId };
                                db.ImageLinks.Add(newLink);
                                db.SaveChanges();
                                repairReport.NewLinksAdded++;
                                anyChangesMade = true;
                            }
                            if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).Where(c => c.ImageCategoryId == folderId).FirstOrDefault() == null)
                            {
                                CategoryImageLink newCatLink = new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = linkId };
                                db.CategoryImageLinks.Add(newCatLink);
                                db.SaveChanges();
                                repairReport.CatLinksAdded++;
                                anyChangesMade = true;
                            }
                        }
                        else
                            fileNameInExpectedForm = false;
                    }
                    else
                        repairReport.Errors.Add("extension problem");
                }
                else 
                    fileNameInExpectedForm = false;

                if (!fileNameInExpectedForm)
                {
                    // rename file
                    string renameSuccess = FtpIO.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + expectedFileName);
                    if (renameSuccess == "ok")
                    {
                        repairReport.ImagesRenamed++;
                        ImageLink oldImageLink = goDaddyLinks.Where(g => g.Link == expectedLinkName + "/" + expectedFileName).FirstOrDefault();
                        if (oldImageLink != null)
                        {
                            if (oldImageLink.Link != expectedLinkName + "/" + expectedFileName)
                            {
                                // update godaddy link
                                oldImageLink.Link = expectedLinkName + "/" + expectedFileName;
                                db.SaveChanges();
                                repairReport.LinksEdited++;
                            }
                        }
                        else
                        {
                            // link not found in this folder's links
                            ImageLink goDaddyLink   = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                            if (goDaddyLink != null)
                            {
                                if (goDaddyLink.Link != expectedLinkName + "/" + expectedFileName)
                                {
                                    goDaddyLink.Link = expectedLinkName + "/" + expectedFileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                            }
                            else
                            {
                                var newImageLink = new ImageLink()
                                {
                                    Id = linkId,
                                    Link = expectedLinkName + "/" + expectedFileName,
                                    ExternalLink = linkId
                                };
                                db.ImageLinks.Add(newImageLink);
                                db.SaveChanges();
                                repairReport.NewLinksAdded++;
                                anyChangesMade = true;
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
                                anyChangesMade = true;
                            }
                        }
                    }
                    else
                    {
                        repairReport.Errors.Add("rename Failed: " + renameSuccess);
                    }
                }

                repairReport.RowsProcessed++;
                folderRowsProcessed++;
                if (repairReport.isSubFolder)
                    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                else
                    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
            }

            if (anyChangesMade)
            {
                goDaddyLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     select (g)).ToList();
            }
            if (goDaddyLinks.Count() != files.Count())
            {
                if (goDaddyLinks.Count() > files.Count())
                {
                    foreach (ImageLink goDaddyLink in goDaddyLinks)
                    {
                        bool found = false;
                        if (goDaddyLink.Link.Length < 4)
                            repairReport.Errors.Add("file name problem");
                        else
                        {
                            expectedFileName = dbCategoryFolder.FolderName + "_" + goDaddyLink.Id + goDaddyLink.Link.Substring(goDaddyLink.Link.Length - 4);
                            for (int i = 0; i < files.Count(); i++)
                            {
                                if (files[i].Contains(expectedFileName))
                                {
                                    found = true;
                                    break;
                                }
                            }
                            if (!found)
                            {
                                //var missingLinkExternalFile
                                List<CategoryImageLink> links = db.CategoryImageLinks.Where(l => l.ImageLinkId == goDaddyLink.Id).ToList();
                                if (links.Count == 0)
                                {
                                    db.ImageLinks.Remove(goDaddyLink);
                                    db.SaveChanges();
                                    repairReport.LinksRemoved++;
                                }
                                else
                                {                                    
                                    // download image?
                                    string downLoadSuccess = DownLoadImage(ftpPath, goDaddyLink.ExternalLink, expectedFileName);
                                    if (downLoadSuccess == "ok")
                                        repairReport.ImagesDownLoaded++;
                                    else
                                    {
                                        repairReport.Errors.Add(goDaddyLink.Id + " " + goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("/") + 1) + " " + downLoadSuccess);
                                        db.ImageLinks.Remove(goDaddyLink);
                                        db.SaveChanges();
                                        repairReport.LinksRemoved++;
                                    }
                                }
                            }
                        }
                        repairReport.RowsProcessed++;
                        folderRowsProcessed++;
                        if (repairReport.isSubFolder)
                            SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                        else
                            SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
                    }
                }

                if (files.Count() > goDaddyLinks.Count())
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

        [HttpGet]
        public string JodiPiperEmergency(int folderId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var trimPath = "/pipers/Jodie Piper/";
                    CategoryFolder dbCategory = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    trimPath = Helpers.GetParentPath(folderId, true) + dbCategory.FolderName;
                    List<ImageLink> folderLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     select (g)).ToList();

                    var appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                    string extension = "";
                    string ftpPath = "ftp://50.62.160.105/" + dbCategory.RootFolder + ".OGGLEBOOBLE.COM/" + trimPath;
                    using (WebClient wc = new WebClient())
                    {
                        foreach (ImageLink g in folderLinks)
                        {
                            extension = g.ExternalLink.Substring(g.ExternalLink.Length - 4);
                            wc.DownloadFile(new Uri(g.ExternalLink), appDataPath + "tempImage" + extension);

                            if (!FtpIO.DirectoryExists(ftpPath))
                                FtpIO.CreateDirectory(ftpPath);

                            FtpWebRequest webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + dbCategory.FolderName + "_" + g.Id + extension);
                            webRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
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
                    }
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
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
                webRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
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

        [HttpPost]
        public string AddImageLink(AddLinkModel newLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string imageLinkId = Guid.NewGuid().ToString();
                    var existingLink = db.ImageLinks.Where(l => l.ExternalLink == newLink.Link).FirstOrDefault();
                    if (existingLink != null)
                        imageLinkId = existingLink.Id;
                    else
                    {
                        CategoryFolder dbCategory = db.CategoryFolders.Where(f => f.Id == newLink.FolderId).First();
                        string extension = newLink.Link.Substring(newLink.Link.Length - 4);
                        string newFileName = dbCategory.FolderName + "_" + imageLinkId + extension;
                        var trimPath = newLink.Path.Substring(newLink.Path.IndexOf("/") + 1);
                        var appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                        using (WebClient wc = new WebClient())
                        {
#if DEBUG
                            try
                            {
                                string danniPath = "F:/Danni/";
                                DirectoryInfo dirInfo = new DirectoryInfo(danniPath + newLink.Path);
                                if (!dirInfo.Exists)
                                    dirInfo.Create();
                                wc.DownloadFile(new Uri(newLink.Link), danniPath + newLink.Path + "/" + newFileName);
                            }
                            catch (Exception ex)
                            {
                                var err = Helpers.ErrorDetails(ex);
                                System.Diagnostics.Debug.WriteLine("wc. download didnt work " + err);
                            }
#endif
                            try
                            {
                                wc.DownloadFile(new Uri(newLink.Link), appDataPath + "tempImage" + extension);
                            }
                            catch (Exception ex)
                            {
                                success = "wc. download didnt work " + ex.Message;
                            }
                        }
                        FtpWebRequest webRequest = null;
                        try
                        {
                            string destPath = newLink.Path.Substring(0, newLink.Path.IndexOf("."));
                            // todo  write the image as a file to x.ogglebooble  4/1/19
                            string ftpPath = "ftp://50.62.160.105/" + destPath + ".OGGLEBOOBLE.COM/" + trimPath;
                            if (!FtpIO.DirectoryExists(ftpPath))
                                FtpIO.CreateDirectory(ftpPath);

                            webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                            webRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
                            webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                        }
                        catch (Exception ex)
                        {
                            return " webRequest didnt work " + ex.Message;
                        }
                        try
                        {
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
                            return "GetRequestStream didn't work " + ex.Message;
                        }

                        try
                        {
                            DirectoryInfo directory = new DirectoryInfo(appDataPath);
                            FileInfo tempFile = directory.GetFiles("tempImage" + extension).FirstOrDefault();
                            if (tempFile != null)
                                tempFile.Delete();
                            System.Diagnostics.Debug.WriteLine("delete worked ");
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine("delete didn't work " + ex.Message);
                        }

                        var goDaddyLink = "http://" + dbCategory.RootFolder + ".ogglebooble.com/";
                        //var goDaddyLinkTest = goDaddyLink + trimPath + "/" + newFileName;
                        db.ImageLinks.Add(new ImageLink()
                        {
                            Id = imageLinkId,
                            FolderLocation = newLink.FolderId,
                            ExternalLink = newLink.Link,
                            Link = goDaddyLink + trimPath + "/" + newFileName
                        });

                        db.SaveChanges();
                    }
                    try
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = newLink.FolderId,
                            ImageLinkId = imageLinkId
                        });
                        db.SaveChanges();
                        success += "ok";
                    }
                    catch (Exception)
                    {
                        success = "Alredy Added";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex) + "please try again";
            }
            return success;
        }

        [HttpPut]
        public RepairReportModel RenameFolder(int folderId, int kludge, string newFolderName)
        {
            RepairReportModel renameReport = new RepairReportModel() { Success = "ono" };
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder folder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();

                    string ftpPath = "ftp://50.62.160.105/" + folder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(folderId, true) + folder.FolderName;
                    string linkId = "";
                    string ext = "";
                    string expectedFileName = "";
                    string expectedLinkName = "";
                    string goDaddyPrefix = "http://" + folder.RootFolder + ".ogglebooble.com/";
                    string folderPath = Helpers.GetParentPath(folderId, true);

                    string[] files = FtpIO.GetFiles(ftpPath);
                    foreach (string fileName in files)
                    {
                        linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                        ext = fileName.Substring(fileName.Length - 4);
                        expectedFileName = newFolderName + "_" + linkId + ext;
                        if (fileName != expectedFileName)
                        {
                            var success = FtpIO.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + expectedFileName);
                            if (success == "ok")
                                renameReport.ImagesRenamed++;
                            else
                            {
                                renameReport.Errors.Add("unable to rename " + fileName + " Message: " + success);
                                renameReport.Success = "unable to rename ";
                            }
                        }
                        if (renameReport.Success == "ono")
                        {
                            ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                            if (goDaddyLink != null)
                            {
                                expectedLinkName = goDaddyPrefix + folderPath + newFolderName + "/" + expectedFileName;
                                if (goDaddyLink.Link != expectedLinkName)
                                {
                                    goDaddyLink.Link = expectedLinkName;
                                    db.SaveChanges();
                                    renameReport.LinksEdited++;

                                    SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName +  "  LinksEdited: " + renameReport.LinksEdited);
                                }
                            }
                            else
                                renameReport.Errors.Add("missing link: " + linkId);
                        }
                        renameReport.RowsProcessed++;
                    }
                    if (renameReport.Success == "ono")
                    {
                        List<CategoryFolder> subDirs = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                        foreach (CategoryFolder subDir in subDirs)
                        {
                            RenameChildFolderLinks(subDir, folderPath + "/" + newFolderName, renameReport, db);
                        }
                    }
                    renameReport.Success = FtpIO.RenameFolder(ftpPath, newFolderName);
                    folder.FolderName = newFolderName;
                    db.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                renameReport.Success = Helpers.ErrorDetails(ex);
            }
            return renameReport;
        }
        private void RenameChildFolderLinks(CategoryFolder folder, string newFolderPath, RepairReportModel renameReport, OggleBoobleContext db)
        { 
            string ftpPath = "ftp://50.62.160.105/" + folder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(folder.Id, true) + folder.FolderName;
            string linkId = "";
            string expectedLinkName = "";
            string goDaddyPrefix = "http://" + folder.RootFolder + ".ogglebooble.com/";
            string[] files = FtpIO.GetFiles(ftpPath);
            int folderRows = 0;
            foreach (string fileName in files)
            {
                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                if (goDaddyLink != null)
                {
                    expectedLinkName = goDaddyPrefix + newFolderPath + "/" + folder.FolderName + "/" + fileName;
                    if (goDaddyLink.Link != expectedLinkName)
                    {
                        goDaddyLink.Link = expectedLinkName;
                        db.SaveChanges();
                        renameReport.LinksEdited++;

                        SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + " " + ++folderRows + "  LinksEdited: " + renameReport.LinksEdited);

                    }
                }
                else
                    renameReport.Errors.Add("missing link: " + linkId);

                renameReport.RowsProcessed++;
            }
            List<CategoryFolder> subDirs = db.CategoryFolders.Where(f => f.Parent == folder.Id).ToList();
            foreach (CategoryFolder subDir in subDirs)
            {
                RenameChildFolderLinks(subDir, newFolderPath + "/" + folder.FolderName, renameReport, db);
            }
        }

        [HttpPut]
        public string MoveFolder(int orignFolderId, int destinationParentId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == orignFolderId).FirstOrDefault();
                    string originPath = Helpers.GetParentPath(orignFolderId, true);
                    success = MoveFolderRecurr(orignFolderId, originPath, destinationParentId, dbSourceFolder.FolderName, db);
                    if (success == "ok")
                    {
                        string sourceFtpPath = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath + dbSourceFolder.FolderName;
                        success = RemoveFolder(sourceFtpPath);
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        private string MoveFolderRecurr(int orignFolderId, string originPath, int destinationParentId, string destinationPath, OggleBoobleContext db)
        {
            string success = "";
            CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == orignFolderId).FirstOrDefault();
            CategoryFolder dbDestinationParentFolder = db.CategoryFolders.Where(f => f.Id == destinationParentId).FirstOrDefault();

            string sourceFtpPath = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath + dbSourceFolder.FolderName;
            string destinationFtpPath = "ftp://50.62.160.105/" + dbDestinationParentFolder.RootFolder + ".ogglebooble.com/" +
                Helpers.GetParentPath(destinationParentId, true) + dbDestinationParentFolder.FolderName + "/" + dbSourceFolder.FolderName;

            string createDirectory = "";
            if (FtpIO.DirectoryExists(destinationFtpPath))
                createDirectory = "ok";
            else
                createDirectory = FtpIO.CreateDirectory(destinationFtpPath);

            if (createDirectory == "ok")
            {
                string linkId = "";
                string[] folderContents = FtpIO.GetFiles(sourceFtpPath);
                int folderRows = 0;
                int fileCount = folderContents.Length;
                foreach (string currentFile in folderContents)
                {
                    linkId = currentFile.Substring(currentFile.LastIndexOf("_") + 1, 36);

                    SignalRHost.ProgressHub.PostToClient("Moving files from: " + dbSourceFolder.FolderName + " to " + dbDestinationParentFolder.FolderName +  "  " + folderRows);
                    

                    success = FtpIO.MoveFile(sourceFtpPath + "/" + currentFile, destinationFtpPath + "/" + currentFile);
                    if (success == "ok")
                    {
                        // update godaddy link
                        string linkPrefix = "http://" + dbDestinationParentFolder.RootFolder + ".ogglebooble.com";
                        string goDaddyLink = linkPrefix + Helpers.GetParentPath(destinationParentId, true) + "/" +
                            dbDestinationParentFolder.FolderName + "/" + dbSourceFolder.FolderName + "/" +
                            dbSourceFolder.FolderName + "_" + linkId + currentFile.Substring(currentFile.Length - 4);
                        ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                        goDaddyrow.Link = goDaddyLink;

                        SignalRHost.ProgressHub.ShowProgressBar(fileCount, ++folderRows);

                        db.SaveChanges();
                    }
                    else return success;
                }

                dbSourceFolder.Parent = dbDestinationParentFolder.Id;
                db.SaveChanges();
                List<CategoryFolder> subdirs = db.CategoryFolders.Where(f => f.Parent == orignFolderId).ToList();
                foreach (CategoryFolder subdir in subdirs)
                {
                    MoveFolderRecurr(subdir.Id, originPath + dbSourceFolder.FolderName + "/", orignFolderId, destinationPath + "/" + dbSourceFolder.FolderName, db);
                }
                success = "ok";
            }
            return success;
        }
        
        private string RemoveFolder(string ftpPath)
        {
            string success = "ok";
            try
            {
                foreach (string subDir in FtpIO.GetDirectories(ftpPath))
                {
                    if (success == "ok")
                    {
                        RemoveFolder(ftpPath + "/" + subDir);
                        success = FtpIO.RemoveDirectory(ftpPath + "/" + subDir);
                        if (success != "ok")
                        {
                            break;
                        }
                    }
                }
                if (success == "ok")
                    success = FtpIO.RemoveDirectory(ftpPath);
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string CreateFolder(CategoryFolderModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string rootFolder = db.CategoryFolders.Where(f => f.Id == model.Parent).First().RootFolder;
                    if (rootFolder == "root")
                        rootFolder = model.FolderName;

                    CategoryFolder newFolder = new CategoryFolder()
                    {
                        Parent = model.Parent,
                        FolderName = model.FolderName,
                        RootFolder = rootFolder
                    };
                    db.CategoryFolders.Add(newFolder);
                    db.SaveChanges();
                    int newFolderId = newFolder.Id;

                    string destinationFtpPath = "ftp://50.62.160.105/" + rootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(newFolderId, true) + model.FolderName;
                    success = FtpIO.CreateDirectory(destinationFtpPath);

                    //if (rootFolder == "archive" || Helpers.IsSlut(newFolder.Id))
                    {
                        db.CategoryFolderDetails.Add(new CategoryFolderDetail() {  FolderId = newFolder.Id });
                        db.SaveChanges();
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }

    public class FtpIO
    {
        static readonly NetworkCredential networkCredentials = new NetworkCredential("curtisrhodes", "R@quel77");

        public static string[] GetDirectories(string ftpPath)
        {
            IList<string> dirs = new List<string>();
            try
            {
                FtpWebRequest ftpRequest = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                ftpRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
                ftpRequest.Method = Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)ftpRequest.GetResponse();
                StreamReader streamReader = new StreamReader(response.GetResponseStream());

                string line = streamReader.ReadLine();
                while (!string.IsNullOrEmpty(line))
                {
                    dirs.Add(line);
                    line = streamReader.ReadLine();
                }
                streamReader.Close();
            }
            catch (Exception ex)
            {
                dirs.Add(Helpers.ErrorDetails(ex));
            }
            return dirs.ToArray();
        }

        private void GetDirectoryDetails(string ftpPath)
        {
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
            request.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            StreamReader reader = new StreamReader(request.GetResponse().GetResponseStream());

            string pattern = @"^(\d+-\d+-\d+\s+\d+:\d+(?:AM|PM))\s+(<DIR>|\d+)\s+(.+)$";
            Regex regex = new Regex(pattern);
            IFormatProvider culture = System.Globalization.CultureInfo.GetCultureInfo("en-us");
            while (!reader.EndOfStream)
            {
                string line = reader.ReadLine();
                Match match = regex.Match(line);
                DateTime modified =
                   DateTime.ParseExact(
                       match.Groups[1].Value, "MM-dd-yy  hh:mmtt", culture, System.Globalization.DateTimeStyles.None);
                long size = (match.Groups[2].Value != "<DIR>") ? long.Parse(match.Groups[2].Value) : 0;
                string name = match.Groups[3].Value;



                Console.WriteLine(
                    "{0,-16} size = {1,9}  modified = {2}",
                    name, size, modified.ToString("yyyy-MM-dd HH:mm"));
            }
        }

        public static string[] GetFiles(string ftpPath)
        {
            IList<string> ftpFiles = new List<string>();
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
                request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
                request.Credentials = networkCredentials;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();

                Stream responseStream = response.GetResponseStream();
                string line = "";
                StreamReader reader = new StreamReader(responseStream);
                {
                    while (!reader.EndOfStream)
                    {
                        line = reader.ReadLine();
                        if (!line.Contains("<DIR>"))
                            ftpFiles.Add(line.Substring(39, line.Length - 39));
                    }
                }
                reader.Close();
                response.Close();
            }
            catch (Exception ex)
            {
                ftpFiles.Add(Helpers.ErrorDetails(ex));
            }
            return ftpFiles.ToArray();
        }

        public static string MoveFolder(string source, string destination)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(source);
                requestDir.Credentials = networkCredentials;
                requestDir.UseBinary = true;
                requestDir.UsePassive = false;
                requestDir.KeepAlive = false;
                requestDir.Proxy = null;
                requestDir.Method = Ftp.Rename;
                requestDir.RenameTo = destination;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                response.Close();
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static bool DirectoryExists(string ftpPath)
        {
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
                request.Credentials = networkCredentials;
                request.Method = Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static string CreateDirectory(string ftpPath)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.MakeDirectory;
                requestDir.UsePassive = true;
                requestDir.UseBinary = true;
                requestDir.KeepAlive = false;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string MoveFile(string source, string destination)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(source);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.DownloadFile;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                if (response.StatusCode != FtpStatusCode.CommandOK)
                    success = response.StatusCode.ToString();
                Stream ftpStream = response.GetResponseStream();
                success = Upload(destination, ToByteArray(ftpStream));
                if (success == "ok")
                    success = DeleteFile(source);
                ftpStream.Close();
                response.Close();
                requestDir = null;
            }
            catch (Exception ex) {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string Upload(string FileName, byte[] Image)
        {
            string success = "";
            try
            {
                FtpWebRequest clsRequest = (FtpWebRequest)WebRequest.Create(FileName);
                clsRequest.Credentials = networkCredentials;
                clsRequest.Method = Ftp.UploadFile;
                Stream clsStream = clsRequest.GetRequestStream();
                clsStream.Write(Image, 0, Image.Length);
                clsStream.Close();
                clsStream.Dispose();
                clsRequest = null;
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static string DeleteFile(string fileToDelete)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(fileToDelete);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.DeleteFile;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                success = "ok";
            }
            catch (Exception ex)

            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string RemoveDirectory(string ftpPath)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(ftpPath);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.RemoveDirectory;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string RenameFolder(string ftpPath, string newName)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(ftpPath);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.Rename;
                requestDir.RenameTo = newName;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        static Byte[] ToByteArray(Stream stream)
        {
            MemoryStream ms = new MemoryStream();
            byte[] chunk = new byte[4096];
            int bytesRead;
            while ((bytesRead = stream.Read(chunk, 0, chunk.Length)) > 0)
            {
                ms.Write(chunk, 0, bytesRead);
            }

            return ms.ToArray();
        }
    }
}
