using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.DataContext;
//using static System.Net.WebRequestMethods;
using WebApi.Ftp;
using System.Configuration;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class FtpImageRemoveController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string repoPath = "F:/Danni/";

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
                    string folderPath = Helpers.GetParentPath(badLink.PreviousLocation);
                    string ftpPath = ftpHost + dbFolder.RootFolder + ".OGGLEBOOBLE.COM/" + folderPath + "/" + fileName;
                    string rejectPath = ftpHost + "/library.Curtisrhodes.com/working folders/rejects/" + dbFolder.RootFolder + "/" + fileName;
                    success = FtpUtilies.MoveFile(ftpPath, rejectPath);

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
                        string repoFolderCurrent = repoPath + Helpers.GetLocalParentPath(dbFolder.Id) + dbFolder.FolderName + badLink.ExternalLink.Substring(badLink.ExternalLink.LastIndexOf("/"));
                        FileInfo file = new FileInfo(repoFolderCurrent);
                        if(file.Exists)
                            file.Delete();
                    }
                    catch (Exception ex)
                    {
                        var err = Helpers.ErrorDetails(ex);
                        System.Diagnostics.Debug.WriteLine("repo delete didnt work " + err);
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
        public SuccessModel MoveImage(MoveCopyImageModel model)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                if (model.SourceFolderId == model.DestinationFolderId)
                    successModel.Success = "Source and Destination the same";
                else
                {
                    using (OggleBoobleContext db = new OggleBoobleContext())
                    {
                        string link = model.Link.Replace("%20", " ");
                        ImageLink dbImageLink = db.ImageLinks.Where(l => l.Link.Replace("%20", " ") == link.Replace("%20", " ")).FirstOrDefault();
                        if (dbImageLink == null)
                            successModel.Success = "link [" + link + "] not found";
                        else
                        {
                            string linkId = dbImageLink.Id;
                            List<CategoryImageLink> categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == model.DestinationFolderId).ToList();
                            if (model.Mode == "Copy")
                            {
                                //CategoryImageLink existingLink = db.CategoryImageLinks
                                //    .Where(l => l.ImageCategoryId == model.DestinationFolderId)
                                //    .Where(l => l.ImageLinkId == dbImageLink.Id).FirstOrDefault();

                                CategoryImageLink existingLink = categoryImageLinks.Where(l => l.ImageLinkId == dbImageLink.Id).FirstOrDefault();
                                if (existingLink != null)
                                    successModel.Success = "Link already exists";
                                else
                                {
                                    db.CategoryImageLinks.Add(new CategoryImageLink()
                                    {
                                        ImageCategoryId = model.DestinationFolderId,
                                        ImageLinkId = dbImageLink.Id
                                    });
                                    db.SaveChanges();
                                    successModel.Success = "ok";
                                }
                            }
                            else  // Archive / Move
                            {
                                CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                                CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).First();
                                string extension = model.Link.Substring(model.Link.LastIndexOf("."));
                                string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                                string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.SourceFolderId) + dbSourceFolder.FolderName;
                                string newFileName = dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
                                string sourceFileName = model.Link.Substring(model.Link.LastIndexOf("/") + 1);

                                if (!FtpUtilies.DirectoryExists(destinationFtpPath))
                                    FtpUtilies.CreateDirectory(destinationFtpPath);

                                string ftpMoveSuccess = FtpUtilies.MoveFile(sourceFtpPath + "/" + sourceFileName, destinationFtpPath + "/" + newFileName);
                                if (ftpMoveSuccess == "ok")
                                {
                                    // move file on local drive 
                                    string localDestinationPath = "";
                                    try
                                    {
                                        string localServerPath = "F:/Danni/";
                                        string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension;
                                        localDestinationPath = localServerPath + Helpers.GetLocalParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                                        FileInfo localFile = new FileInfo(localSourcePath);
                                        DirectoryInfo directoryInfo = new DirectoryInfo(localDestinationPath);
                                        if (!directoryInfo.Exists)
                                        {
                                            directoryInfo.Create();
                                        }
                                        localFile.MoveTo(localDestinationPath + "/" + newFileName);
                                    }
                                    catch (Exception ex)
                                    {
                                        System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex) + " " + localDestinationPath);
                                    }

                                    //2. update ImageLink 
                                    string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                                    string goDaddyLink = linkPrefix + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName + "/" + dbDestinationFolder.FolderName + "_" + dbImageLink.Id + extension;
                                    ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                                    goDaddyrow.Link = goDaddyLink;
                                    goDaddyrow.FolderLocation = dbDestinationFolder.Id;
                                    db.SaveChanges();

                                    //3 create new link for new location if necessary
                                    if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Where(c => c.ImageLinkId == dbImageLink.Id).FirstOrDefault() == null)
                                    {
                                        successModel.ReturnValue = db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Count().ToString();
                                        CategoryImageLink newCatImageLink = new CategoryImageLink()
                                        {
                                            ImageCategoryId = model.DestinationFolderId,
                                            ImageLinkId = dbImageLink.Id,
                                            SortOrder = 999
                                        };
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
                                        successModel.ReturnValue = categoryImageLinks.Count().ToString();
                                    }
                                    successModel.Success = "ok";
                                }
                                else
                                    successModel.Success = "file not found";
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
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
                        success = MoveImage(model).Success;
                        if (success != "ok")
                            System.Diagnostics.Debug.WriteLine("move file on local drive : " + success);
                        //    return success;
                        SignalRHost.ProgressHub.ShowProgressBar(linkCount, ++i);
                        SignalRHost.ProgressHub.PostToClient("Moving: " + i + " of " + linkCount);
                    }

                    CategoryFolder emptyFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();

                    string originPath = Helpers.GetParentPath(emptyFolder.Id);
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
        private readonly string repoPath = "F:/Danni/";
        private readonly string hostingPath = ".ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpPost]
        public SuccessModel AddImageLink(AddLinkModel newLink)
        {
            SuccessModel successModel = new SuccessModel();
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
                                DirectoryInfo dirInfo = new DirectoryInfo(repoPath + trimPath);
                                if (!dirInfo.Exists)
                                    dirInfo.Create();
                                wc.DownloadFile(new Uri(newLink.Link), repoPath + trimPath + "/" + newFileName);
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
                                successModel.Success = "wc. download didnt work " + ex.Message;
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
                            successModel.Success = " webRequest didnt work " + ex.Message;
                            return successModel;
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
                            successModel.Success = "GetRequestStream didn't work " + ex.Message;
                            return successModel;
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
                        });
                        db.SaveChanges();
                    }
                    try
                    {
                        int lnkCount = db.CategoryImageLinks.Where(c => c.ImageCategoryId == newLink.FolderId).Count();
                        if (lnkCount == 0)
                            successModel.ReturnValue = "0";
                        else
                            successModel.ReturnValue = imageLinkId;

                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = newLink.FolderId,
                            ImageLinkId = imageLinkId,
                            SortOrder = 99
                        });
                        db.SaveChanges();
                        successModel.Success = "ok";
                    }
                    catch (Exception ex)
                    {
                        successModel.Success = Helpers.ErrorDetails(ex);
                        if (successModel.Success.StartsWith("ERROR: Cannot insert duplicate key row in object"))
                            successModel.Success = "Alredy Added";
                    }
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex) + " please try again";
            }
            return successModel;
        }

        [HttpPut]
        public string RenameFolder(int folderId, string newFolderName)
        {
            string success = "";
            try
            {
                int parentId = 0;
                int rowsProcessed = 0;
                int imagesRenamed = 0;
                string godaddyUrlPrefix = "";
                string sourceFolderName = "";
                string patentPath = "";
                List<CategoryFolder> subdirs = null;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    string ftpSubDomain = ftpHost + dbSourceFolder.RootFolder + hostingPath;
                    parentId = dbSourceFolder.Parent;
                    godaddyUrlPrefix = "http://" + dbSourceFolder.RootFolder + ".ogglebooble.com/";

                    sourceFolderName = dbSourceFolder.FolderName;
                    patentPath = Helpers.GetParentPath(folderId);

                    #region local repo rename folder
                    string currentFullPath = ftpSubDomain + patentPath + "/" + dbSourceFolder.FolderName;
                    success = FtpUtilies.RenameFolder(currentFullPath, newFolderName);
                    if (success == "ok")
                    {
                        try
                        {
                            string repoFolderCurrent = repoPath + Helpers.GetLocalParentPath(folderId) + "/" + dbSourceFolder.FolderName;
                            string repoRename = repoPath + Helpers.GetLocalParentPath(folderId) + "/" + newFolderName;
                            DirectoryInfo directoryInfo = new DirectoryInfo(repoFolderCurrent);
                            directoryInfo.MoveTo(repoRename);
                        }
                        catch (Exception ex)
                        {
                            var err = Helpers.ErrorDetails(ex);
                            System.Diagnostics.Debug.WriteLine("file.MoveTo didnt work " + err);
                        }
                    }
                    #endregion

                    #region rename files

                    if (dbSourceFolder.FolderName.ToUpper() != newFolderName.ToUpper())
                    {
                        string linkid = "";
                        string extension = "";
                        string expectedfilename = "";
                        string expectedlinkname = "";
                        //string folderpath = Helpers.GetParentPath(folderId);
                        //string parentfolderpath = Helpers.GetParentPath(parentId);

                        string destinationPath = ftpSubDomain + patentPath + "/" + newFolderName;
                        string localPath = repoPath + Helpers.GetLocalParentPath(folderId) + newFolderName;

                        string[] files = FtpUtilies.GetFiles(destinationPath);
                        foreach (string filename in files)
                        {
                            linkid = filename.Substring(filename.LastIndexOf("_") + 1, 36);
                            extension = filename.Substring(filename.LastIndexOf("."));
                            expectedfilename = newFolderName + "_" + linkid + extension;

                            //string sourceFile = destinationPath + "/" + filename;
                            //string destinationfile = destinationPath + "/" + expectedfilename;

                            var fileMoveSuccess = FtpUtilies.MoveFile(destinationPath + "/" + filename, destinationPath + "/" + expectedfilename);
                            if (fileMoveSuccess == "ok")
                            {
                                #region move file in repository
                                try
                                {
                                    FileInfo localFile = new FileInfo(localPath + "/" + filename);
                                    if (localFile.Exists)
                                    {
                                        localFile.MoveTo(localPath + "/" + expectedfilename);
                                    }
                                }
                                catch (Exception ex)
                                {
                                    System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex));
                                }
                                #endregion

                                //expectedlinkname = "http://" + dbSourceFolder.RootFolder + hostingPath + Helpers.GetLocalParentPath(folderId) + newFolderName + expectedfilename;
                                expectedlinkname = "http://" + Helpers.GetLocalParentPath(folderId) + newFolderName + "/" + expectedfilename;

                                // update database
                                if (fileMoveSuccess == "ok")
                                {
                                    ImageLink godaddylink = db.ImageLinks.Where(g => g.Id == linkid).FirstOrDefault();
                                    if (godaddylink != null)
                                    {
                                        godaddylink.Link = expectedlinkname;
                                        db.SaveChanges();
                                        imagesRenamed++;
                                        SignalRHost.ProgressHub.PostToClient("renaminging files in: " + sourceFolderName + "  images renamed: " + imagesRenamed + " of: " + files.Count());
                                    }
                                    else
                                    {
                                        //renamereport.errors.add("missing link: " + linkid);
                                    }
                                    rowsProcessed++;
                                }
                                else
                                {
                                    //renamereport.errors.add("unable to rename " + filename + " message: " + success);
                                    //renamereport.success = "unable to rename ";
                                }
                            }
                        }  // each file
                    }
                    #endregion

                    dbSourceFolder.FolderName = newFolderName;
                    db.SaveChanges();

                    subdirs = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();

                }  // using
                if (success == "ok")
                {



                    foreach (CategoryFolder subdir in subdirs)
                    {
                        //renamechildfolderlinks(subdir, folderpath + "/" + newfoldername, renamereport, db);
                    }
               }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        //private void RenameChildFolderLinks(CategoryFolder folder, string newFolderPath, RepairReportModel renameReport, OggleBoobleContext db)
        //{
        //    string ftpPath = ftpHost + folder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(folder.Id) + folder.FolderName;
        //    string linkId = "";
        //    string expectedLinkName = "";
        //    string goDaddyPrefix = "http://" + folder.RootFolder + ".ogglebooble.com/";
        //    string[] files = FtpUtilies.GetFiles(ftpPath);
        //    int folderRows = 0;

        //    foreach (string fileName in files)
        //    {
        //        linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
        //        ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
        //        if (goDaddyLink != null)
        //        {
        //            expectedLinkName = goDaddyPrefix + newFolderPath + "/" + folder.FolderName + "/" + fileName;
        //            if (goDaddyLink.Link != expectedLinkName)
        //            {
        //                goDaddyLink.Link = expectedLinkName;
        //                db.SaveChanges();
        //                renameReport.LinksEdited++;

        //                SignalRHost.ProgressHub.PostToClient("Renaminging files in: " + folder.FolderName + " " + ++folderRows + "  LinksEdited: " + renameReport.LinksEdited);

        //            }
        //        }
        //        else
        //            renameReport.Errors.Add("missing link: " + linkId);
        //        renameReport.RowsProcessed++;
        //    }
        //    List<CategoryFolder> subDirs = db.CategoryFolders.Where(f => f.Parent == folder.Id).ToList();
        //    foreach (CategoryFolder subDir in subDirs)
        //    {
        //        RenameChildFolderLinks(subDir, newFolderPath + "/" + folder.FolderName, renameReport, db);
        //    }
        //}

        [HttpPut]
        public string MoveFolder(int sourceFolderId, int destinationFolderId)
        {
            string success = "";
            try
            {
                List<CategoryFolder> subdirs = null;
                string originPath = Helpers.GetParentPath(sourceFolderId);
                string destinationPath = Helpers.GetParentPath(destinationFolderId);
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == sourceFolderId).FirstOrDefault();
                    CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == destinationFolderId).FirstOrDefault();

                    string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath + dbSourceFolder.FolderName;
                    string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + destinationPath + dbDestinationFolder.FolderName + "/" + dbSourceFolder.FolderName;
                    string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + destinationPath;
                    //if (dbDestinationFolder.FolderName.Contains("OGGLEBOOBLE.COM"))                        dbDestinationFolder.FolderName = "";

                    if (FtpUtilies.DirectoryExists(destinationFtpPath))
                    {
                        success = "Directory Already Exists";
                        success = "ok";
                    }
                    else
                        success = FtpUtilies.CreateDirectory(destinationFtpPath);
                    if (success == "ok")
                    {
                        // local repository
                        string linkId = "";
                        string[] folderContents = FtpUtilies.GetFiles(sourceFtpPath);
                        //int folderRows = 0;
                        int fileCount = folderContents.Length;
                        ImageLink goDaddyrow = null;
                        string sourceFileName = "";
                        string destinationFileName = "";
                        string newGoDaddyLink = "";

                                // local repository
                        try
                        {
                            string newFolderPath = repoPath + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + dbDestinationFolder.FolderName + "/" + dbSourceFolder.FolderName;
                            DirectoryInfo newLocalFolder = new DirectoryInfo(newFolderPath);
                            if (!newLocalFolder.Exists)
                            {
                                DirectoryInfo repoParentFolder = new DirectoryInfo(repoPath + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + dbDestinationFolder.FolderName);
                                if (repoParentFolder.Exists)
                                {
                                    newLocalFolder.Create();

                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            var err = Helpers.ErrorDetails(ex);
                            System.Diagnostics.Debug.WriteLine("wc. download didnt work " + err);
                        }
                        //string localDestinationPath = repoPath + Helpers.GetLocalParentPath(destinationFolderId) + dbDestinationFolder.FolderName;

                        foreach (string fileName in folderContents)
                        {
                            success = FtpUtilies.MoveFile(sourceFtpPath + "/" + fileName, destinationFtpPath + "/" + fileName);
                            if (success == "ok")
                            {
                                // update godaddy link
                                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                if (goDaddyrow != null)
                                {
                                    newGoDaddyLink = linkPrefix + dbDestinationFolder.FolderName + "/" + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + linkId + fileName.Substring(fileName.Length - 4);
                                    goDaddyrow.Link = newGoDaddyLink;
                                    db.SaveChanges();
                                }
                                //SignalRHost.ProgressHub.ShowProgressBar(fileCount, ++folderRows);
                                //SignalRHost.ProgressHub.PostToClient("Moving files from: " + dbSourceFolder.FolderName + " to " + dbDestinationFolder.FolderName + "  " + folderRows + " of " + fileCount);

                                // local repository
                                try
                                {
                                    sourceFileName = repoPath + dbSourceFolder.RootFolder + ".ogglebooble.com/" + originPath + dbSourceFolder.FolderName + "/" + fileName;
                                    destinationFileName = repoPath + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + dbDestinationFolder.FolderName + "/" + dbSourceFolder.FolderName  + "/" + fileName;
                                    File.Move(sourceFileName, destinationFileName);
                                }
                                catch (Exception ex)
                                {
                                    var err = Helpers.ErrorDetails(ex);
                                    System.Diagnostics.Debug.WriteLine("wc. download didnt work " + err);
                                }
                            }
                            else
                            {
                                System.Diagnostics.Debug.WriteLine("wc. download didnt work " + success);

                            }
                        }
                    }
                    if (success == "ok")
                    {
                        subdirs = db.CategoryFolders.Where(f => f.Parent == dbSourceFolder.Id).ToList();
                        foreach (CategoryFolder subdir in subdirs)
                        {
                            MoveFolder(subdir.Id, destinationFolderId);
                        }
                        string removeFolderSuccess = RemoveFolder(sourceFtpPath);
                        dbSourceFolder.Parent = dbDestinationFolder.Id;
                        db.SaveChanges();
                        success = "ok";
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
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == parentId).FirstOrDefault();

                    var folderPath = dbSourceFolder.FolderName;
                    if (folderPath.ToUpper().Contains("OGGLEBOOBLE.COM"))
                        folderPath = "";

                    string destinationFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(parentId) + folderPath + "/" + newFolderName.Trim();
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
                                RootFolder = dbSourceFolder.RootFolder
                            };
                            db.CategoryFolders.Add(newFolder);
                            db.SaveChanges();
                            successModel.ReturnValue = newFolder.Id.ToString();

                            if (successModel.Success == "ok")
                            {
                                db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = newFolder.Id, SortOrder = 99 });
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
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    string danniPath = "F:/Danni/" + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(folderId) + dbSourceFolder.FolderName;
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



                        SignalRHost.ProgressHub.PostToClient("Processing: " + dbSourceFolder.FolderName + "  : " + ++knt + " of " + files.Count());




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

                    foreach (int subDirId in db.CategoryFolders.Where(f => f.Parent == dbSourceFolder.Id).Select(f => f.Id).ToArray())
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

    [EnableCors("*", "*", "*")]
    public class xHampsterController : ApiController
    {
        //static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        //static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpPost]
        public string CreatePage(int folderId)
        {
            string success = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                string folderName = db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.FolderName).First();

                List<string> links = (from i in db.CategoryImageLinks
                                      join g in db.ImageLinks on i.ImageLinkId equals g.Id
                                      where i.ImageCategoryId == folderId
                                      select g.Link).ToList();

                string destinationFolder = System.Web.HttpContext.Current.Server.MapPath("~/app_data/xhampster/");

                DirectoryInfo dirInfo = new DirectoryInfo(destinationFolder);
                foreach (FileInfo file in dirInfo.GetFiles())
                {
                    file.Delete();
                }
                using (WebClient wc = new WebClient())
                {
                    try
                    {
                        int k = 0;
                        string fileName = "";
                        foreach (string link in links)
                        {
                            fileName = destinationFolder + "/" + folderName + "_" + string.Format("{0:0000}", ++k) + link.Substring(link.LastIndexOf("."));
                            wc.DownloadFile(new Uri(link), fileName);
                        }
                        success = "ok";
                    }
                    catch (Exception ex)
                    {
                        success = ex.Message;
                    }
                }
            }
            return success;
        }
    }

}
