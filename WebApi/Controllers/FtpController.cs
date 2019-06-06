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
    public class FtpImageRemoveController : ApiController
    {
        [HttpGet]
        public string CheckLinkCount(string imageLinkId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int linkCount = db.CategoryImageLinks.Where(c => c.ImageLinkId == imageLinkId).Count();
                    //List<CategoryImageLink> links = db.CategoryImageLinks.Where(c => c.ImageLinkId == imageLinkId).ToList();
                    if (linkCount > 1)
                        success = "ok";
                    else
                    {
                        //successModel.ReturnValue = db.ImageLinks.Where(g => g.FolderLocation == links[0].ImageCategoryId).First().Id;
                        success = "only link";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPut]
        public string MoveReject(RejectLinkModel badLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    ///  move image to reject folder
                    CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == badLink.PreviousLocation).FirstOrDefault();
                    ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == badLink.Id).FirstOrDefault();
                    string fileName = goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("/") + 1);
                    string folderPath = Helpers.GetParentPath(badLink.PreviousLocation, true);
                    string ftpPath = "ftp://50.62.160.105/" + dbFolder.RootFolder + ".OGGLEBOOBLE.COM/" + folderPath + "/" + dbFolder.FolderName + "/" + fileName;
                    string rejectPath = "ftp://50.62.160.105/library.Curtisrhodes.com/working folders/rejects/" + dbFolder.RootFolder + "/" + fileName;
                    FtpDirectory.MoveFile(ftpPath, rejectPath);

                    db.CategoryImageLinks.Remove(db.CategoryImageLinks.Where(l => l.ImageLinkId == badLink.Id).First());
                    db.ImageLinks.Remove(db.ImageLinks.Where(g => g.Id == badLink.Id).First());
                    db.SaveChanges();

                    db.RejectLinks.Add(new RejectLink()
                    {
                        Id = badLink.Id,
                        ExternalLink = badLink.ExternalLink,
                        PreviousLocation = badLink.PreviousLocation,
                        RejectionReason = badLink.RejectionReason
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpDelete]
        public string RemoveImageLink(int folderId, string imageId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryImageLink dbBadLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == imageId).First();
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
                    success = FtpDirectory.RemoveDirectory(ftpPath);
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

                    if (!FtpDirectory.DirectoryExists(destinationFtpPath))
                        FtpDirectory.CreateDirectory(destinationFtpPath);

                    success = FtpDirectory.MoveFile(sourceFtpPath + "/" + sourceFileName, destinationFtpPath + "/" + newFileName);
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

            if (!FtpDirectory.DirectoryExists(ftpPath))
            {
                repairReport.DirNotFound++;
                FtpDirectory.CreateDirectory(ftpPath);
                repairReport.Errors.Add("created directory " + ftpPath);
            }
            int folderRowsProcessed = 0;
            if (repairReport.isSubFolder)
                SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
            else
                SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
            List<ImageLink> goDaddyLinks =
                (from c in db.CategoryImageLinks
                 join g in db.ImageLinks on c.ImageLinkId equals g.Id
                 where c.ImageCategoryId == folderId
                 select (g)).ToList();

            string[] files = FtpDirectory.GetFiles(ftpPath);
            if (files.Length == 0)
                repairReport.Errors.Add(ftpPath + " no files");
            else
            {
                if (files[0].StartsWith("ERROR"))
                {
                    repairReport.Errors.Add("FtpDirectory.GetFiles(" + ftpPath + ") " + files[0]);
                }
                else
                {

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
                                            string[] ArrayWhereImageSayItShouldBe = FtpDirectory.GetFiles(ftpPathWhereImageSayItShouldBe);
                                            if (ArrayWhereImageSayItShouldBe.Contains(categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext))
                                            {
                                                FtpDirectory.DeleteFile(ftpPath + categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext);
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
                                                FtpDirectory.MoveFile(source, destination);
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
                                        ImageLink newLink = new ImageLink() { Id = linkId, Link = expectedLinkName + "/" + expectedFileName, ExternalLink = "unknown" + linkId, FolderLocation = folderId };
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
                            string renameSuccess = FtpDirectory.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + expectedFileName);
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
                                    ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
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

                            if (!FtpDirectory.DirectoryExists(ftpPath))
                                FtpDirectory.CreateDirectory(ftpPath);

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
                            if (!FtpDirectory.DirectoryExists(ftpPath))
                                FtpDirectory.CreateDirectory(ftpPath);

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

                    string[] files = FtpDirectory.GetFiles(ftpPath);
                    foreach (string fileName in files)
                    {
                        linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                        ext = fileName.Substring(fileName.Length - 4);
                        expectedFileName = newFolderName.Trim() + "_" + linkId + ext;
                        if (fileName != expectedFileName)
                        {
                            var success = FtpDirectory.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + expectedFileName);
                            if (success == "ok")
                            {
                                renameReport.ImagesRenamed++;
                                SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + "  " + renameReport.ImagesRenamed);
                            }
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
                                expectedLinkName = goDaddyPrefix + folderPath + newFolderName.Trim() + "/" + expectedFileName;
                                if (goDaddyLink.Link != expectedLinkName)
                                {
                                    goDaddyLink.Link = expectedLinkName;
                                    db.SaveChanges();
                                    renameReport.LinksEdited++;

                                    SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName +  "  Links Edited: " + renameReport.LinksEdited);
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
                    renameReport.Success = FtpDirectory.RenameFolder(ftpPath, newFolderName);
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
            string[] files = FtpDirectory.GetFiles(ftpPath);
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
            if (FtpDirectory.DirectoryExists(destinationFtpPath))
                createDirectory = "ok";
            else
                createDirectory = FtpDirectory.CreateDirectory(destinationFtpPath);

            if (createDirectory == "ok")
            {
                string linkId = "";
                string[] folderContents = FtpDirectory.GetFiles(sourceFtpPath);
                int folderRows = 0;
                int fileCount = folderContents.Length;
                foreach (string currentFile in folderContents)
                {
                    linkId = currentFile.Substring(currentFile.LastIndexOf("_") + 1, 36);

                    SignalRHost.ProgressHub.PostToClient("Moving files from: " + dbSourceFolder.FolderName + " to " + dbDestinationParentFolder.FolderName +  "  " + folderRows);
                    

                    success = FtpDirectory.MoveFile(sourceFtpPath + "/" + currentFile, destinationFtpPath + "/" + currentFile);
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

                dbSourceFolder.RootFolder = dbDestinationParentFolder.RootFolder;
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
                foreach (string subDir in FtpDirectory.GetDirectories(ftpPath))
                {
                    if (success == "ok")
                    {
                        RemoveFolder(ftpPath + "/" + subDir);
                        success = FtpDirectory.RemoveDirectory(ftpPath + "/" + subDir);
                        if (success != "ok")
                        {
                            break;
                        }
                    }
                }
                if (success == "ok")
                    success = FtpDirectory.RemoveDirectory(ftpPath);
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
                        FolderName = model.FolderName.Trim(),
                        RootFolder = rootFolder
                    };
                    db.CategoryFolders.Add(newFolder);
                    db.SaveChanges();
                    int newFolderId = newFolder.Id;

                    string destinationFtpPath = "ftp://50.62.160.105/" + rootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(newFolderId, true) + model.FolderName.Trim();
                    success = FtpDirectory.CreateDirectory(destinationFtpPath);

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

}
