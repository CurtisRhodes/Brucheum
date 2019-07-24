﻿using System;
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
using WebApi.Ftp;
using System.Configuration;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class FtpImageRemoveController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string danniPath = "F:/Danni/";

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
                    string folderPath = Helpers.GetFtpParentPathWithoutRoot(badLink.PreviousLocation);
                    string ftpPath = ftpHost + dbFolder.RootFolder + ".OGGLEBOOBLE.COM/" + folderPath + "/" + fileName;
                    string rejectPath = ftpHost + "/library.Curtisrhodes.com/working folders/rejects/" + dbFolder.RootFolder + "/" + fileName;
                    FtpUtilies.MoveFile(ftpPath, rejectPath);

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

                    try
                    {
                        FileInfo file = new FileInfo(danniPath + dbFolder.RootFolder + "/" + badLink.ExternalLink.Substring(20));
                        file.Delete();
                    }
                    catch (Exception ex)
                    {
                        var err = Helpers.ErrorDetails(ex);
                        System.Diagnostics.Debug.WriteLine("wc. download didnt work " + err);
                    }

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
    public class MoveImageController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];

        [HttpPut]
        public string MoveImage(MoveCopyImageModel model)
        {
            if (model.SourceFolderId == model.DestinationFolderId)
                return "Source and Destination the same";
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string link = model.Link.Replace("%20", " ");

                    ImageLink dbImageLink = db.ImageLinks.Where(l => l.Link.Replace("%20", " ") == link.Replace("%20", " ")).FirstOrDefault();
                    if (dbImageLink == null)
                    {
                        success = "link [" + link + "] not found";
                    }
                    else
                    {
                        string linkId = dbImageLink.Id;
                        if (model.Mode == "Copy")
                        {
                            CategoryImageLink existingLink = db.CategoryImageLinks
                                .Where(l => l.ImageCategoryId == model.DestinationFolderId)
                                .Where(l => l.ImageLinkId == dbImageLink.Id).FirstOrDefault();
                            if (existingLink != null)
                                success = "Link already exists";
                            else
                            {
                                db.CategoryImageLinks.Add(new CategoryImageLink()
                                {
                                    ImageCategoryId = model.DestinationFolderId,
                                    ImageLinkId = dbImageLink.Id
                                });
                                db.SaveChanges();
                                success = "ok";
                            }
                        }
                        else  // Archive Move
                        {
                            CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                            CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).First();
                            string extension = model.Link.Substring(model.Link.LastIndexOf("."));
                            //if (dbImageLink.FolderLocation == model.SourceFolderId)
                            {

                                string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" +
                                Helpers.GetFtpParentPathWithoutRoot(model.DestinationFolderId);  // + dbDestinationFolder.FolderName;

                                string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" +
                                    Helpers.GetFtpParentPathWithoutRoot(model.SourceFolderId); // + dbSourceFolder.FolderName;


                                string newFileName = dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
                                string sourceFileName = "";
                                sourceFileName = model.Link.Substring(model.Link.LastIndexOf("/") + 1);

                                if (!FtpUtilies.DirectoryExists(destinationFtpPath))
                                    FtpUtilies.CreateDirectory(destinationFtpPath);

                                success = FtpUtilies.MoveFile(sourceFtpPath + "/" + sourceFileName, destinationFtpPath + "/" + newFileName);
                                if (success == "ok")
                                {
                                    // move file on local drive 
                                    try
                                    {
                                        string localServerPath = "F:/Danni/";
                                        string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName+ "/" + dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension;
                                        string localDestination = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName + "/" + dbDestinationFolder.FolderName + "/" + newFileName;
                                        //FileInfo fileInfo = dirInfo.GetFiles(dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension).FirstOrDefault();

                                        FileInfo localFile = new FileInfo(localSourcePath) ;
                                        localFile.MoveTo(localDestination);


                                        //if (fileInfo != null)
                                        //{
                                        //    string localDestinationPath = localServerPath + Helpers.GetLocalParentPath(model.DestinationFolderId) + "/" + dbDestinationFolder.FolderName;
                                        //    if (!System.IO.Directory.Exists(localDestinationPath))
                                        //        System.IO.Directory.CreateDirectory(localDestinationPath);
                                        //    fileInfo.MoveTo(localDestinationPath + "/" + newFileName);
                                        //}
                                    }
                                    catch (Exception ex)
                                    {
                                        System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex));
                                    }
                                }
                            }
                            if (success == "ok")
                            {
                                //2. update ImageLink 
                                string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                                string goDaddyLink = linkPrefix + Helpers.GetFtpParentPathWithoutRoot(model.DestinationFolderId) + "/" + dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
                                ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                                goDaddyrow.Link = goDaddyLink;
                                goDaddyrow.FolderLocation = dbDestinationFolder.Id;
                                db.SaveChanges();

                                //3 create new link for new location if necessary
                                if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Where(c => c.ImageLinkId == dbImageLink.Id).FirstOrDefault() == null)
                                {
                                    CategoryImageLink newCatImageLink = new CategoryImageLink() { ImageCategoryId = model.DestinationFolderId, ImageLinkId = dbImageLink.Id };
                                    db.CategoryImageLinks.Add(newCatImageLink);
                                    db.SaveChanges();
                                }
                                if (model.Mode == "Move")
                                {
                                    // remove current link
                                    CategoryImageLink oldCatImageLink = db.CategoryImageLinks
                                         .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageLink.Id).First();
                                    db.CategoryImageLinks.Remove(oldCatImageLink);
                                    db.SaveChanges();
                                }
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

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
                                                      select new MoveCopyImageModel()
                                                      {
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

                    string originPath = Helpers.GetFtpParentPathWithoutRoot(emptyFolder.Id);
                    string ftpPath = ftpHost + emptyFolder.RootFolder + ".ogglebooble.com/" + originPath + emptyFolder.FolderName;
                    success = FtpUtilies.RemoveDirectory(ftpPath);
                    if (success != "ok")
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
    }

    [EnableCors("*", "*", "*")]
    public class FtpDashBoardController : ApiController
    {
        private readonly string danniPath = "F:/Danni/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

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
                        string extension = newLink.Link.Substring(newLink.Link.LastIndexOf("."));
                        string newFileName = dbCategory.FolderName + "_" + imageLinkId + extension;
                        //var trimPath = newLink.Path.Substring(newLink.Path.IndexOf("Root/") + 1);
                        var trimPath = newLink.Path.Replace("/Root/", "").Replace("%20", " ");
                        var appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                        using (WebClient wc = new WebClient())
                        {
#if DEBUG
                            try
                            {
                                DirectoryInfo dirInfo = new DirectoryInfo(danniPath + trimPath);
                                if (!dirInfo.Exists)
                                    dirInfo.Create();
                                wc.DownloadFile(new Uri(newLink.Link), danniPath + trimPath + "/" + newFileName);
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
                            // todo  write the image as a file to x.ogglebooble  4/1/19
                            string ftpPath = ftpHost + trimPath;
                            if (!FtpUtilies.DirectoryExists(ftpPath))
                                FtpUtilies.CreateDirectory(ftpPath);

                            webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                            webRequest.Credentials = networkCredentials;
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

                        int fWidth = 0;
                        int fHeight = 0;
                        long fSize = 0;
                        try
                        {
                            using (var fileStream = new FileStream(appDataPath + "tempImage" + extension, FileMode.Open, FileAccess.Read, FileShare.Read))
                            {
                                fSize = fileStream.Length;
                                using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                                {
                                    fWidth = image.Width;
                                    fHeight = image.Height;
                                }
                            }
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

                        //var goDaddyLink = "http://" + dbCategory.RootFolder + ".ogglebooble.com/";
                        //var goDaddyLinkTest = goDaddyLink + trimPath + "/" + newFileName;

                        db.ImageLinks.Add(new ImageLink()
                        {
                            Id = imageLinkId,
                            FolderLocation = newLink.FolderId,
                            ExternalLink = newLink.Link,
                            Width = fWidth,
                            Height = fHeight,
                            Size = fSize,
                            Link = "http://" + trimPath + "/" + newFileName
                            //Link = goDaddyLink + trimPath + "/" + newFileName
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
                        success = "ok";
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

                    string ftpPath = ftpHost + folder.RootFolder + ".ogglebooble.com/";

                    #region rename files
                    //string linkId = "";
                    //string extension = "";
                    //string expectedFileName = "";
                    //string expectedLinkName = "";
                    //string[] files = FtpUtilies.GetFiles(ftpPath + folderPath);
                    //string goDaddyPrefix = "http://" + folder.RootFolder + ".ogglebooble.com/";
                    //string parentFolderPath = Helpers.GetFtpParentPathWithoutRoot(folder.Parent);
                    //string folderPath = Helpers.GetFtpParentPathWithoutRoot(folderId);

                    //foreach (string fileName in files)
                    //{
                    //    linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                    //    extension = fileName.Substring(fileName.LastIndexOf("."));

                    //    expectedFileName = newFolderName.Trim() + "_" + linkId + extension;
                    //    string sourceFile = ftpPath + "/" + folderPath + "/" + fileName;
                    //    string destinationFile = ftpPath + parentFolderPath + "/" + newFolderName + "/" + expectedFileName;
                    //    var success = FtpUtilies.MoveFile(sourceFile, destinationFile);
                    //    if (success == "ok")
                    //    {
                    //        try
                    //        {
                    //            FileInfo file = new FileInfo(danniPath + ftpPath.Substring(20) + "/" + fileName);
                    //            file.MoveTo(danniPath + ftpPath.Substring(20) + "/" + expectedFileName);
                    //        }
                    //        catch (Exception ex)
                    //        {
                    //            var err = Helpers.ErrorDetails(ex);
                    //            System.Diagnostics.Debug.WriteLine("file.MoveTo didnt work " + err);
                    //        }
                    //        renameReport.ImagesRenamed++;
                    //        //SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + "  " + renameReport.ImagesRenamed);
                    //        //SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + " " + renameReport.ImagesRenamed + "  LinksEdited: " + renameReport.LinksEdited);

                    //        ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                    //        if (goDaddyLink != null)
                    //        {

                    //            expectedLinkName = goDaddyPrefix + Helpers.GetFtpParentPathWithoutRoot(folder.Id) + "/" + expectedFileName;




                    //            if (goDaddyLink.Link != expectedLinkName)
                    //            {
                    //                goDaddyLink.Link = expectedLinkName;
                    //                db.SaveChanges();
                    //                renameReport.LinksEdited++;

                    //                SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + "  Images Renamed: " + renameReport.ImagesRenamed + " of: " + files.Count());
                    //            }
                    //        }
                    //        else
                    //            renameReport.Errors.Add("missing link: " + linkId);
                    //        renameReport.RowsProcessed++;
                    //    }
                    //    else
                    //    {
                    //        renameReport.Errors.Add("unable to rename " + fileName + " Message: " + success);
                    //        renameReport.Success = "unable to rename ";
                    //    }
                    //}
                    //if (renameReport.Success == "ono")
                    //{
                    //    List<CategoryFolder> subDirs = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                    //    foreach (CategoryFolder subDir in subDirs)
                    //    {
                    //        RenameChildFolderLinks(subDir, folderPath + "/" + newFolderName, renameReport, db);
                    //    }
                    //}
                    #endregion

                    renameReport.Success = FtpUtilies.RenameFolder(ftpPath, newFolderName);
                    folder.FolderName = newFolderName;
                    db.SaveChanges();

                    try
                    {
                        DirectoryInfo directoryInfo = new DirectoryInfo(danniPath + ftpPath.Substring(20));
                        directoryInfo.MoveTo(danniPath + ftpPath.Substring(20, ftpPath.LastIndexOf("/") - 19) + newFolderName);
                    }
                    catch (Exception ex)
                    {
                        var err = Helpers.ErrorDetails(ex);
                        System.Diagnostics.Debug.WriteLine("file.MoveTo didnt work " + err);
                    }
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
            string ftpPath = ftpHost + folder.RootFolder + ".ogglebooble.com/" + Helpers.GetFtpParentPathWithoutRoot(folder.Id) + folder.FolderName;
            string linkId = "";
            string expectedLinkName = "";
            string goDaddyPrefix = "http://" + folder.RootFolder + ".ogglebooble.com/";
            string[] files = FtpUtilies.GetFiles(ftpPath);
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
        public string MoveFolder(int sourceFolderId, int destinationFolderId)
        {
            string success = "";
            try
            {
                List<CategoryFolder> subdirs = null;
                string originPath = Helpers.GetFtpParentPathWithoutRoot(sourceFolderId);
                string destinationPath = Helpers.GetFtpParentPathWithoutRoot(destinationFolderId);
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == sourceFolderId).FirstOrDefault();
                    CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == destinationFolderId).FirstOrDefault();

                    string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath;
                    string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + destinationPath + "/" + dbSourceFolder.FolderName;
                    string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + destinationPath;
                    //if (dbDestinationFolder.FolderName.Contains("OGGLEBOOBLE.COM"))                        dbDestinationFolder.FolderName = "";

                    string createDirectorySuccess = "";
                    if (FtpUtilies.DirectoryExists(destinationFtpPath))
                        createDirectorySuccess = "ok";
                    else
                        createDirectorySuccess = FtpUtilies.CreateDirectory(destinationFtpPath);
                    if (createDirectorySuccess == "ok")
                    {
                        string linkId = "";
                        string[] folderContents = FtpUtilies.GetFiles(sourceFtpPath);
                        int folderRows = 0;
                        int fileCount = folderContents.Length;
                        ImageLink goDaddyrow = null;
                        string newGoDaddyLink = "";
                        string moveFileSuccess = "";
                        foreach (string fileName in folderContents)
                        {
                            moveFileSuccess = FtpUtilies.MoveFile(sourceFtpPath + "/" + fileName, destinationFtpPath + "/" + fileName);
                            if (moveFileSuccess == "ok")
                            {
                                // update godaddy link
                                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                if (goDaddyrow != null)
                                {
                                    newGoDaddyLink = linkPrefix + "/" + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + linkId + fileName.Substring(fileName.Length - 4);
                                    goDaddyrow.Link = newGoDaddyLink;
                                    db.SaveChanges();
                                }
                                SignalRHost.ProgressHub.ShowProgressBar(fileCount, ++folderRows);
                                SignalRHost.ProgressHub.PostToClient("Moving files from: " + dbSourceFolder.FolderName + " to " + dbDestinationFolder.FolderName + "  " +
                                    folderRows + " of " + fileCount);
                            }
                            else
                                return moveFileSuccess;
                        }

                        // local repository
                        try
                        {
                            //string localFolder = 
                            DirectoryInfo directoryInfo = new DirectoryInfo(danniPath + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath);
                            directoryInfo.MoveTo(danniPath + dbSourceFolder.RootFolder + ".ogglebooble.com/" + destinationPath + dbSourceFolder.FolderName);
                        }
                        catch (Exception ex)
                        {
                            var err = Helpers.ErrorDetails(ex);
                            System.Diagnostics.Debug.WriteLine("wc. download didnt work " + err);
                        }

                        string removeFolderSuccess = RemoveFolder(sourceFtpPath);

                        subdirs = db.CategoryFolders.Where(f => f.Parent == dbSourceFolder.Id).ToList();

                        dbSourceFolder.Parent = dbDestinationFolder.Id;
                        db.SaveChanges();
                        success = "ok";
                    }

                    foreach (CategoryFolder subdir in subdirs)
                    {
                        MoveFolder(subdir.Id, 22);
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        private string RemoveFolder(string ftpPath)
        {
            string success = "ok";
            try
            {
                foreach (string subDir in FtpUtilies.GetDirectories(ftpPath))
                {
                    FtpUtilies.RemoveDirectory(ftpPath + "/" + subDir);
                }
                FtpUtilies.RemoveDirectory(ftpPath);
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        public SuccessModel CreateFolder(int parentId, string newFolderName)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string rootFolder = db.CategoryFolders.Where(f => f.Id == parentId).First().RootFolder;
                    if (rootFolder == "root")
                        rootFolder = newFolderName;
                    string parentPath = Helpers.GetFtpParentPathWithoutRoot(parentId);
                    if (parentPath == "sluts")
                        parentPath = "";

                    string destinationFtpPath = ftpHost + rootFolder + ".ogglebooble.com/" + parentPath + "/" + newFolderName.Trim();

                    if (FtpUtilies.DirectoryExists(destinationFtpPath))
                        successModel.Success = "folder already exists";
                    else
                    {
                        successModel.Success = FtpUtilies.CreateDirectory(destinationFtpPath);
                        if (successModel.Success == "ok")
                        {
                            CategoryFolder newFolder = new CategoryFolder()
                            {
                                Parent = parentId,
                                FolderName = newFolderName.Trim(),
                                RootFolder = rootFolder
                            };
                            db.CategoryFolders.Add(newFolder);
                            db.SaveChanges();
                            successModel.ReturnValue = newFolder.Id.ToString();

                            if (successModel.Success == "ok")
                            {
                                db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = newFolder.Id });
                                db.SaveChanges();
                            }
                        }
                    }                    
                }
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
        }

        [HttpPatch]
        public string GetFileProps(int folderId)
        {
            string success = "";
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    string danniPath = "F:/Danni/" + dbCategoryFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetFtpParentPathWithoutRoot(folderId) + dbCategoryFolder.FolderName;
                    //string modelName =   //fileName.Substring(0, fileName.IndexOf("_"));
                    string[] files = Directory.GetFiles(danniPath);
                    var linkId = "";
                    var extension = "";
                    int knt = 0;
                    string fullFileName = "";
                    foreach (string rawFileName in files)
                    {
                        fullFileName = rawFileName.Replace("\\", "/");

                        linkId = fullFileName.Substring(fullFileName.LastIndexOf("_") + 1, 36);
                        extension = fullFileName.Substring(fullFileName.LastIndexOf("."));



                        SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  : " + ++knt + " of " + files.Count());




                            if (System.IO.File.Exists(fullFileName))
                        {
                            using (var fileStream = new FileStream(fullFileName, FileMode.Open, FileAccess.Read, FileShare.Read))
                            {
                                try
                                {
                                    using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                                    {
                                        ImageLink dbImageLink = null;
                                        if (fullFileName.Contains("Playboy centerfold"))
                                            dbImageLink = db.ImageLinks.Where(l => l.Link.Contains(fullFileName.Substring(10))).FirstOrDefault();
                                        else
                                        {
                                            linkId = fullFileName.Substring(fullFileName.LastIndexOf("_") + 1, 36);
                                            dbImageLink = db.ImageLinks.Where(l => l.Id == linkId).FirstOrDefault();
                                        }
                                        if (dbImageLink != null)
                                        {
                                            dbImageLink.Size = fileStream.Length;
                                            dbImageLink.Height = image.Height;
                                            dbImageLink.Width = image.Width;

                                            db.SaveChanges();
                                        }
                                    }
                                }
                                catch (Exception ex)
                                {
                                    success = Helpers.ErrorDetails(ex);
                                }

                            }
                        }
                    }

                    foreach (int subDirId in db.CategoryFolders.Where(f => f.Parent == dbCategoryFolder.Id).Select(f => f.Id).ToArray())
                    {
                        GetFileProps(subDirId);
                    }
                    success = "ok";
                }
                timer.Stop();
                System.Diagnostics.Debug.WriteLine("GetFileProps took: " + timer.Elapsed);
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}
