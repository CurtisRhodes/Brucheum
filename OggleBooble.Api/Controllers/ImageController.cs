using OggleBooble.Api.Models;
using OggleBooble.Api.MSSqlDataContext;
//using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class ImageController : ApiController
    {
        //private readonly string localRepoPath = "F:/Danni/";
        private readonly string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Image/GetLimitedImageDetail")]
        public ImageInfoModel GetLimitedImageDetail(int folderId, string linkId)
        {
            //var timer = new System.Diagnostics.Stopwatch();
            //timer.Start();
            var imageInfo = new ImageInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbPageFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    imageInfo.FolderName = dbPageFolder.FolderName;
                    imageInfo.FolderType = dbPageFolder.FolderType;

                    var dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).FirstOrDefault();
                    if (dbImageFile == null) { imageInfo.Success = "no image link found"; return imageInfo; }
                    if (dbImageFile.FolderId != folderId)
                    {
                        var dbModelFolder = db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).FirstOrDefault();
                        if (dbModelFolder == null) { imageInfo.Success = "no image link folderId file found"; return imageInfo; }
                        imageInfo.ModelFolderId = dbModelFolder.Id;
                        imageInfo.ModelFolderName = dbModelFolder.FolderName;
                    }
                }
                imageInfo.Success = "ok";
            }
            catch (Exception ex) { imageInfo.Success = Helpers.ErrorDetails(ex); }
            //timer.Stop();
            //System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return imageInfo;
        }

        [HttpGet]
        [Route("api/Image/getFullImageDetails")]
        public ImageInfoModel getFullImageDetails(int folderId, string linkId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var imageInfo = new ImageInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    //CategoryImageLink dbCategoryImageLink= db.CategoryImageLinks.Where(l=>l.ImageLinkId)
                    
                    CategoryFolder dbPageFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    imageInfo.RootFolder = dbPageFolder.RootFolder;
                    imageInfo.FolderPath = dbPageFolder.FolderPath;

                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).FirstOrDefault();
                    if (dbImageFile == null) { imageInfo.Success = "no image link found"; return imageInfo; }

                    if (dbImageFile.FolderId != folderId)
                    {
                        var dbModelFolder = db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).FirstOrDefault();
                        if (dbModelFolder == null) { imageInfo.Success = "no image link folderId file found"; return imageInfo; }
                        imageInfo.ModelFolderId = dbModelFolder.Id;
                        imageInfo.ModelFolderName = dbModelFolder.FolderName;
                    }

                    imageInfo.FolderName = dbPageFolder.FolderName;
                    imageInfo.Height = dbImageFile.Height;
                    imageInfo.FileName = dbImageFile.FileName;
                    imageInfo.Link = dbImageFile.Id;
                    imageInfo.Width = dbImageFile.Width;
                    imageInfo.Size = dbImageFile.Size;
                    imageInfo.LastModified = dbImageFile.Acquired.ToShortDateString();
                    imageInfo.ExternalLink = dbImageFile.ExternalLink;
                    imageInfo.InternalLinks = (from l in db.CategoryImageLinks
                                               join f in db.CategoryFolders on l.ImageCategoryId equals f.Id
                                               where l.ImageLinkId == linkId && l.ImageCategoryId != folderId
                                               select new { folderId = f.Id, folderName = f.FolderName })
                                               .ToDictionary(i => i.folderId, i => i.folderName);
                }
                imageInfo.Success = "ok";
            }
            catch (Exception ex) {
                imageInfo.Success = Helpers.ErrorDetails(ex);
            }
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return imageInfo;
        }

        [HttpPut]
        [Route("api/OggleFile/MoveCopyArchive")]
        public SuccessModel MoveCopyArchive(MoveCopyImageModel model)
        {
            SuccessModel successModel = new SuccessModel();
            if (model.SourceFolderId == model.DestinationFolderId)
            {
                successModel.Success = "Source and Destination the same";
                return successModel;
            }
            try
            {
                string imageLinkId;
                using (var db = new OggleBoobleMySqlContext())
                {
                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == model.LinkId).FirstOrDefault();
                    if (dbImageFile == null)
                    {
                        successModel.Success = "link [" + model.LinkId + "] not found";
                        return successModel;
                    }
                    imageLinkId = dbImageFile.Id;

                    var categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == model.DestinationFolderId).ToList();
                    if (model.Mode == "Copy")  // just add a rec to CategoryImageLink (which should be called File_Image)
                    {
                        MySqlDataContext.CategoryImageLink existingLink = categoryImageLinks.Where(l => l.ImageLinkId == imageLinkId).FirstOrDefault();
                        if (existingLink != null)
                            successModel.Success = "Link already exists";
                        else
                        {
                            db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                            {
                                ImageCategoryId = model.DestinationFolderId,
                                ImageLinkId = imageLinkId,
                                SortOrder = 999
                            });
                            db.SaveChanges();
                            successModel.Success = "ok";
                        }
                    }
                    else  // Archive / Move
                    {
                        var oldCatImageLink = db.CategoryImageLinks
                             .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageFile.Id).First();
                        db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                        {
                            ImageCategoryId = model.DestinationFolderId,
                            ImageLinkId = dbImageFile.Id,
                            SortOrder = oldCatImageLink.SortOrder
                        });
                        db.SaveChanges();
                        if (model.Mode == "Move")
                        {
                            db.CategoryImageLinks.Remove(oldCatImageLink);
                        }
                        db.SaveChanges();
                    }
                    // determine if this is the first image added to folder 
                    successModel.ReturnValue = db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Count().ToString();
                } 
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpPost]
        [Route("api/OggleFile/AddImageLink")]
        public SuccessModel AddImageLink(AddLinkModel addLinkModel)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                string mySqlDestPath;
                string newFileName;
                string newLink = addLinkModel.Link;
                string imageLinkId = Guid.NewGuid().ToString();
                string extension = newLink.Substring(newLink.LastIndexOf("."));
                using (var db = new OggleBoobleMySqlContext())
                {
                    if (newLink.IndexOf("?") > 0)
                    {
                        newLink = newLink.Substring(0, newLink.IndexOf("?"));
                        extension = newLink.Substring(newLink.LastIndexOf("."));
                    }

                    var existingLink = db.ImageFiles.Where(l => l.ExternalLink.Substring(l.ExternalLink.IndexOf(":")) == newLink.Substring(newLink.IndexOf(":"))).FirstOrDefault();
                    if (existingLink != null)
                    {
                        successModel.Success = "Link Already Added";
                        return successModel;
                    }
                    var destinationFolder = db.CategoryFolders.Where(f => f.Id == addLinkModel.FolderId).First();
                    //mySqlDestPath = db.CategoryFolders.Where(f => f.Id == addLinkModel.FolderId).FirstOrDefault().FolderPath;
                    mySqlDestPath = destinationFolder.FolderPath;

                    if (destinationFolder.FolderType == "singleChild")
                    {
                        var destinationParent = db.CategoryFolders.Where(f => f.Id == destinationFolder.Parent).First();
                        newFileName = destinationParent.FolderName + "_" + imageLinkId + extension;
                    }
                    else
                    newFileName = destinationFolder.FolderName + "_" + imageLinkId + extension;
                }
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                string trimPath = addLinkModel.Path.Replace("/Root/", "").Replace("%20", " ");

                // USE WEBCLIENT TO CREATE THE FILE
                using (WebClient wc = new WebClient())
                {
                    try
                    {
                        wc.DownloadFile(new Uri(newLink), appDataPath + "tempImage" + extension);
                    }
                    catch 
                    {
                        if (newLink.StartsWith("https")) {
                            try
                            {
                                newLink = "http" + newLink.Substring(5);
                                wc.DownloadFile(new Uri(newLink), appDataPath + "tempImage" + extension);
                            }
                            catch (Exception ex)
                            {
                                successModel.Success = "wc. download didnt work " + ex.Message;
                                return successModel;
                            }
                        }
                    }
                }
                // USE WEBREQUEST TO UPLOAD THE FILE
                FtpWebRequest webRequest = null;
                try
                {
                    // todo  write the image as a file to x.ogglebooble  4/1/19
                    //webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                    //webRequest.Credentials = networkCredentials;
                    //var zz = webRequest.Method = WebRequestMethods.Ftp.UploadFile;

                    //var mmDom = repoDomain.Substring(8);

                    string destPath = ftpHost + repoDomain.Substring(8) + "/" + mySqlDestPath;

                    if (!FtpUtilies.DirectoryExists(destPath))
                        FtpUtilies.CreateDirectory(destPath);

                    webRequest = (FtpWebRequest)WebRequest.Create(destPath + "/" + newFileName);
                    webRequest.Credentials = networkCredentials;
                    webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                }
                catch (Exception ex)
                {
                    successModel.Success = " webRequest didnt work " + ex.Message;
                    return successModel;
                }
                // TAKE THE WEBREQUEST FILE STREAM TO 
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
                // turn the tempfile into a fileStream to get its size attributes
                int fWidth = 0; int fHeight = 0; long fSize = 0;
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
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageFiles.Add(new ImageFile()
                    {
                        Id = imageLinkId,
                        FolderId = addLinkModel.FolderId,
                        ExternalLink = newLink,
                        Width = fWidth,
                        Height = fHeight,
                        Size = fSize,
                        Acquired = DateTime.Now,
                        FileName = newFileName
                    });

                    //int nextSortOrder = db.CategoryImageLinks.Where(l=>l.ImageCategoryId==addLinkModel.FolderId).Select(Math.Max(sort))

                    db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                    {
                        ImageCategoryId = addLinkModel.FolderId,
                        ImageLinkId = imageLinkId,
                        SortOrder = 9996
                    });
                    db.SaveChanges();
                }
                successModel.Success = "ok";
            }
            catch (Exception ex) { successModel.Success = Helpers.ErrorDetails(ex); }
            return successModel;
            // COPY FILE TO LOCAL ?
            //try
            //{
            //    string localRoot = dbCategory.RootFolder;
            //    if (localRoot == "centerfold")
            //        localRoot = "playboy";

            //    var test = newLink.Path.Remove(0, newLink.Path.IndexOf("/", newLink.Path.IndexOf("/") + 1));
            //    var localPath = localRepoPath + localRoot + ".OGGLEBOOBLE.COM" + newLink.Path.Remove(0, newLink.Path.IndexOf("/", newLink.Path.IndexOf("/") + 1));
            //    DirectoryInfo dirInfo = new DirectoryInfo(localPath);
            //    if (!dirInfo.Exists)
            //        dirInfo.Create();
            //    wc.DownloadFile(new Uri(newLink.Link), localPath + "/" + newFileName);
            //}
            //catch (Exception ex)
            //{
            //    var err = Helpers.ErrorDetails(ex);
            //    System.Diagnostics.Debug.WriteLine("wc. download didnt work " + err);
            //}

            // see if this is the first image in the folder. If so make it the folder image
            //try
            //{
            //    int lnkCount = db.CategoryImageLinks.Where(c => c.ImageCategoryId == newLink.FolderId).Count();
            //    if (lnkCount == 0)
            //        successModel.ReturnValue = imageLinkId;
            //    else
            //        successModel.ReturnValue = "0";
            //}
            //catch (Exception ex)
            //{
            //    successModel.Success = Helpers.ErrorDetails(ex);
            //    if (successModel.Success.StartsWith("ERROR: Cannot insert duplicate key row in object"))
            //        successModel.Success = "Alredy Added";
            //}
        }

        [HttpGet]
        [Route("api/ImageComment/GetImageComment")]
        public ImageCommentModel GetImageComment(string linkId)
        {
            var imageComment = new ImageCommentModel();
            try
            {
            using (var db = new OggleBoobleMySqlContext())
            {
                imageComment = (from c in db.ImageComments
                                join i in db.ImageFiles on c.ImageLinkId equals i.Id
                                join f in db.CategoryFolders on i.FolderId equals f.Id
                                select new ImageCommentModel()
                                {
                                    CommentId = c.Id,
                                    CommentText = c.CommentText,
                                    CommentTitle = c.CommentTitle,
                                    ImageName = f.FolderPath + "/" + i.FileName,
                                    Posted = c.Posted
                                }).Where(c => c.ImageLinkId == linkId).FirstOrDefault();
                imageComment.Success = "ok";
            }

            }
            catch (Exception ex)
            {
                imageComment.Success = Helpers.ErrorDetails(ex);
            }
            return imageComment;
        }

        [HttpPost]
        [Route("api/ImageComment/Add")]
        public string Add(ImageCommentModel imageCommentModel)
        {
            string success;
            try
            {
                ImageComment imageComment = new ImageComment();
                imageComment.Id = Guid.NewGuid().ToString();
                imageComment.Posted = DateTime.Now;
                imageComment.ImageLinkId = imageCommentModel.ImageLinkId;
                imageComment.CommentText = imageCommentModel.CommentText;
                imageComment.CommentTitle = imageCommentModel.CommentTitle;
                imageComment.CalledFrom = imageCommentModel.CalledFrom;
                imageComment.VisitorId = imageCommentModel.VisitorId;
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageComments.Add(imageComment);
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
        [Route("api/ImageComment/Update")]
        public string Update(ImageComment imageComment)
        {
            string success;
            try
            {
                imageComment.Id = Guid.NewGuid().ToString();
                imageComment.Posted = DateTime.Now;
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.ImageComments.Add(imageComment);
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

        private string FtpMove(string currentFileName, MoveCopyImageModel model)
        {
            string success;
            string linkId = model.LinkId;
            using (var db = new OggleBoobleMySqlContext())
            {
                ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).FirstOrDefault();
                if (dbImageFile == null)
                {
                    return "link [" + linkId + "] not found";
                }
                //imageLinkId = dbImageFile.Id;

                // ? physcially more and rename .jpg 
                CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).First();
                //string currentFileName = dbImageFile.FileName;
                string newFileName = dbSourceFolder.FolderName + "_" + linkId;
                string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.SourceFolderId) + newFileName;

                if (!FtpUtilies.DirectoryExists(destinationFtpPath))
                    FtpUtilies.CreateDirectory(destinationFtpPath);

                success = FtpUtilies.MoveFile(sourceFtpPath + "/" + dbImageFile.FileName, destinationFtpPath + "/" + newFileName);
                if (success == "ok")
                {
                    #region move file on local drive 
                    string localDestinationPath = "";
                    try
                    {
                        string localServerPath = "F:/Danni/";
                        string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName + "/" + dbImageFile.FileName;
                        //dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension;
                        localDestinationPath = localServerPath + Helpers.GetLocalParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                        FileInfo localFile = new FileInfo(localSourcePath);
                        DirectoryInfo directoryInfo = new DirectoryInfo(localDestinationPath);
                        if (!directoryInfo.Exists)
                            directoryInfo.Create();
                        localFile.MoveTo(localDestinationPath + "/" + newFileName);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex) + " " + localDestinationPath);
                    }
                    #endregion

                    //2. update ImageFile
                    //string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                    //newInternalLink = linkPrefix + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName + "/" + newFileName;
                    //var goDaddyrow = db.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                    var oldCatImageLink = db.CategoryImageLinks
                         .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageFile.Id).First();
                    db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                    {
                        ImageCategoryId = model.DestinationFolderId,
                        ImageLinkId = dbImageFile.Id,
                        SortOrder = oldCatImageLink.SortOrder
                    });
                    db.SaveChanges();
                    if (model.Mode == "Move")
                    {
                        db.CategoryImageLinks.Remove(oldCatImageLink);
                    }
                    db.SaveChanges();
                }
                return success;
            }
        }

        private string LocalRepoMove(MoveCopyImageModel model)
        {
            string localDestinationPath = "";
            try
            {
                string localServerPath = "F:/Danni/";
                string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + model.SourceFolderName; // + "/" + dbImageFile.FileName;
                //dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension;
                localDestinationPath = localServerPath + Helpers.GetLocalParentPath(model.DestinationFolderId) + model.DestinationFolderName;
                FileInfo localFile = new FileInfo(localSourcePath);
                DirectoryInfo directoryInfo = new DirectoryInfo(localDestinationPath);
                if (!directoryInfo.Exists)
                    directoryInfo.Create();
                localFile.MoveTo(localDestinationPath + "/" + "newFileName");
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine("move file on local drive : " + Helpers.ErrorDetails(ex) + " " + localDestinationPath);
            }
            return "ok";
        }
    }
}
