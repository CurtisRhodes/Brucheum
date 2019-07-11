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
using WebApi.Ftp;
using System.Configuration;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class FtpImageRemoveController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];

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
                    string ftpPath = ftpHost + dbFolder.RootFolder + ".OGGLEBOOBLE.COM/" + folderPath + "/" + dbFolder.FolderName + "/" + fileName;
                    string rejectPath = ftpHost+ "/library.Curtisrhodes.com/working folders/rejects/" + dbFolder.RootFolder + "/" + fileName;
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
                    //string linkId = model.Link.Substring(model.Link.LastIndexOf("_") + 1, 36);
                    ImageLink dbImageLink = db.ImageLinks.Where(l => l.Link == model.Link).First();
                    string linkId = db.ImageLinks.Where(l => l.Link == model.Link).First().Id;
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
                            Helpers.GetFtpParentPathWithoutRoot(model.DestinationFolderId) + dbDestinationFolder.FolderName;

                            string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" +
                                Helpers.GetFtpParentPathWithoutRoot(model.SourceFolderId) + dbSourceFolder.FolderName;


                            string newFileName = dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
                            string sourceFileName = "";
                            //if (model.Link.Contains("Playboy centerfold"))
                            //{
                            //    // rename 
                            //    sourceFileName = model.Link;
                            //}
                            //else

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
                                    string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName;
                                    DirectoryInfo dirInfo = new DirectoryInfo(localSourcePath);
                                    if (!dirInfo.Exists)
                                    {
                                        Directory.CreateDirectory(localSourcePath);
                                    }

                                    FileInfo fileInfo = dirInfo.GetFiles(dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension).FirstOrDefault();
                                    if (fileInfo != null)
                                    {
                                        string localDestinationPath = localServerPath + Helpers.GetLocalParentPath(model.DestinationFolderId) + "/" + dbDestinationFolder.FolderName;
                                        if (!System.IO.Directory.Exists(localDestinationPath))
                                            System.IO.Directory.CreateDirectory(localDestinationPath);
                                        fileInfo.MoveTo(localDestinationPath + "/" + newFileName);
                                    }
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
                            string goDaddyLink = linkPrefix + Helpers.GetFtpParentPathWithoutRoot(model.DestinationFolderId) +
                                dbDestinationFolder.FolderName + "/" + dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
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
                            string ftpPath = ftpHost + destPath + ".OGGLEBOOBLE.COM/" + trimPath;
                            if (!FtpUtilies.DirectoryExists(ftpPath))
                                FtpUtilies.CreateDirectory(ftpPath);

                            webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                            //webRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
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

                        var goDaddyLink = "http://" + dbCategory.RootFolder + ".ogglebooble.com/";
                        //var goDaddyLinkTest = goDaddyLink + trimPath + "/" + newFileName;

                        db.ImageLinks.Add(new ImageLink()
                        {
                            Id = imageLinkId,
                            FolderLocation = newLink.FolderId,
                            ExternalLink = newLink.Link,
                            Width = fWidth,
                            Height = fHeight,
                            Size = fSize,
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

                    string folderPath = Helpers.GetFtpParentPathWithoutRoot(folderId);
                    string ftpPath = ftpHost + folder.RootFolder + ".ogglebooble.com/" + folderPath + folder.FolderName;
                    string linkId = "";
                    string ext = "";
                    string expectedFileName = "";
                    string expectedLinkName = "";
                    string goDaddyPrefix = "http://" + folder.RootFolder + ".ogglebooble.com/";
                                                         
                    string[] files = FtpUtilies.GetFiles(ftpPath);
                    foreach (string fileName in files)
                    {
                        linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                        ext = fileName.Substring(fileName.Length - 4);
                        expectedFileName = newFolderName.Trim() + "_" + linkId + ext;
                        if (fileName != expectedFileName)
                        {
                            var success = FtpUtilies.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + expectedFileName);
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

                                    SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + "  Links Edited: " + renameReport.LinksEdited);
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
                    renameReport.Success = FtpUtilies.RenameFolder(ftpPath, newFolderName);
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
        public string MoveFolder(int orignFolderId, int destinationParentId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == orignFolderId).FirstOrDefault();
                    string originPath = Helpers.GetFtpParentPathWithoutRoot(orignFolderId);
                    success = MoveFolderRecurr(orignFolderId, originPath, destinationParentId, dbSourceFolder.FolderName, db);
                    if (success == "ok")
                    {
                        string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath + dbSourceFolder.FolderName;
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

            string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath + dbSourceFolder.FolderName;

            if (dbDestinationParentFolder.FolderName.Contains("OGGLEBOOBLE.COM"))
                dbDestinationParentFolder.FolderName = "";


            string destinationFtpPath = ftpHost + dbDestinationParentFolder.RootFolder + ".ogglebooble.com/" +
                Helpers.GetFtpParentPathWithoutRoot(destinationParentId) + dbDestinationParentFolder.FolderName + "/" + dbSourceFolder.FolderName;


            string linkPrefix = "http://" + dbDestinationParentFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetFtpParentPathWithoutRoot(destinationParentId);
            string createDirectory = "";
            if (FtpUtilies.DirectoryExists(destinationFtpPath))
                createDirectory = "ok";
            else
                createDirectory = FtpUtilies.CreateDirectory(destinationFtpPath);

            if (createDirectory == "ok")
            {
                string linkId = "";
                string[] folderContents = FtpUtilies.GetFiles(sourceFtpPath);
                int folderRows = 0;
                int fileCount = folderContents.Length;
                ImageLink goDaddyrow = null;
                string newGoDaddyLink = "";
                foreach (string fileName in folderContents)
                {
                    try
                    {
                        success = FtpUtilies.MoveFile(sourceFtpPath + "/" + fileName, destinationFtpPath + "/" + fileName);
                        if (success == "ok")
                        {
                            // update godaddy link
                            if (fileName.StartsWith("Playboy"))
                            {
                                goDaddyrow = db.ImageLinks.Where(l => l.Link.Contains(fileName)).FirstOrDefault();
                                if (goDaddyrow != null)
                                {
                                    newGoDaddyLink = linkPrefix + dbDestinationParentFolder.FolderName + "/" + dbSourceFolder.FolderName + "/" + fileName;
                                    goDaddyrow.Link = newGoDaddyLink;
                                    db.SaveChanges();
                                }
                            }
                            else
                            {
                                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                if (goDaddyrow != null)
                                {
                                    newGoDaddyLink = linkPrefix + dbDestinationParentFolder.FolderName + "/" + dbSourceFolder.FolderName + "/" +
                                        dbSourceFolder.FolderName + "_" + linkId + fileName.Substring(fileName.Length - 4);
                                    goDaddyrow.Link = newGoDaddyLink;
                                    db.SaveChanges();
                                }
                            }
                        }
                        else
                            success = "x";

                        SignalRHost.ProgressHub.ShowProgressBar(fileCount, ++folderRows);
                        SignalRHost.ProgressHub.PostToClient("Moving files from: " + dbSourceFolder.FolderName + " to " + dbDestinationParentFolder.FolderName + "  " +
                            folderRows + " of " + fileCount);
                    }
                    catch (Exception ex)
                    {
                        success = Helpers.ErrorDetails(ex);
                    }
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
            else
                success = createDirectory;
            return success;
        }

        private string RemoveFolder(string ftpPath)
        {
            string success = "ok";
            try
            {
                foreach (string subDir in FtpUtilies.GetDirectories(ftpPath))
                {
                    if (subDir.Contains("ERROR"))
                        break;
                    else
                    {
                        RemoveFolder(ftpPath + "/" + subDir);
                        if (!subDir.Contains("ERROR"))
                            FtpUtilies.RemoveDirectory(ftpPath + "/" + subDir);
                    }
                }
                if (!ftpPath.Contains("ERROR"))
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

                    CategoryFolder newFolder = new CategoryFolder()
                    {
                        Parent = parentId,
                        FolderName = newFolderName.Trim(),
                        RootFolder = rootFolder
                    };
                    db.CategoryFolders.Add(newFolder);
                    db.SaveChanges();
                    successModel.ReturnValue = newFolder.Id.ToString();

                    string destinationFtpPath = ftpHost + rootFolder + ".ogglebooble.com/" + Helpers.GetFtpParentPathWithoutRoot(newFolder.Id) + newFolderName.Trim();

                    successModel.Success = FtpUtilies.CreateDirectory(destinationFtpPath);
                    if (successModel.Success == "ok")
                    {
                        db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = newFolder.Id });
                        db.SaveChanges();
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
                        extension = fullFileName.Substring(fullFileName.Length - 4);


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
