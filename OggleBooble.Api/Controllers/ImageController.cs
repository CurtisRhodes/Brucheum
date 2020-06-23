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
        private readonly string localRepoPath = "F:/Danni/";
        private readonly string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Image/GetImageDetail")]
        public ImageInfoModel GetImageDetail(int folderId, string linkId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var imageInfo = new ImageInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (dbCategoryFolder == null)
                    {
                        imageInfo.Success = "no dategory folder found";
                        return imageInfo;
                    }

                    if (Helpers.ContainsRomanNumeral(dbCategoryFolder.FolderName))
                    {
                        var dbCategoryFolderParent = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).FirstOrDefault();
                        if (dbCategoryFolderParent != null)
                        {
                            imageInfo.FolderName = dbCategoryFolderParent.FolderName;
                        }
                    }

                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).FirstOrDefault();
                    if (dbImageFile == null)
                    {
                        imageInfo.Success = "no image link found";
                        return imageInfo;
                    }
                    if (dbImageFile.FolderId != folderId)
                    {
                        MySqlDataContext.CategoryFolder dbModelFolder = db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).FirstOrDefault();
                        imageInfo.ModelFolderName = dbModelFolder.FolderName;                    
                    }

                    List<string> subFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.FolderName).ToList();
                    var folderTypeModel = new FolderTypeModel()
                    {
                        ContainsRomanNumeral = Helpers.ContainsRomanNumeral(dbCategoryFolder.FolderName),
                        ContainsRomanNumeralChildren = Helpers.ContainsRomanNumeralChildren(subFolders),
                        HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0,
                        HasSubFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Count() > 0,
                        RootFolder = dbCategoryFolder.RootFolder
                    };
                    imageInfo.FolderType = Helpers.DetermineFolderType(folderTypeModel);

                    imageInfo.FolderName = dbCategoryFolder.FolderName;
                    imageInfo.LinkId = dbImageFile.Id;
                    imageInfo.ModelFolderId = dbImageFile.FolderId;
                    imageInfo.Height = dbImageFile.Height;
                    imageInfo.Width = dbImageFile.Width;
                    imageInfo.LastModified = dbImageFile.Acquired.ToShortDateString();
                    imageInfo.Link = dbImageFile.FileName;
                    imageInfo.ExternalLink = dbImageFile.ExternalLink;
                    imageInfo.InternalLinks = (from l in db.CategoryImageLinks
                                               join f in db.CategoryFolders on l.ImageCategoryId equals f.Id
                                               where l.ImageLinkId == linkId && l.ImageCategoryId != folderId
                                               select new { folderId = f.Id, folderName = f.FolderName })
                                               .ToDictionary(i => i.folderId, i => i.folderName);

                    if (dbCategoryFolder == null)
                    {
                        imageInfo.Success = "folder not found. "+ folderId;
                        return imageInfo;
                    }
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
                string imageLinkId, newFileName, newInternalLink = "";
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
                        // ? physcially more and rename .jpg 
                        MySqlDataContext.CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                        MySqlDataContext.CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).First();
                        string currentFileName = dbImageFile.FileName;
                        newFileName = dbSourceFolder.FolderName + "_" + model.LinkId;
                        string destinationFtpPath = ftpHost + dbDestinationFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName;
                        string sourceFtpPath = ftpHost + dbSourceFolder.RootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(model.SourceFolderId) + newFileName;

                        if (!FtpUtilies.DirectoryExists(destinationFtpPath))
                            FtpUtilies.CreateDirectory(destinationFtpPath);

                        string ftpMoveSuccess = FtpUtilies.MoveFile(sourceFtpPath + "/" + dbImageFile.FileName, destinationFtpPath + "/" + newFileName);
                        if (ftpMoveSuccess == "ok")
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
                        else
                        {
                            successModel.Success = ftpMoveSuccess;
                            return successModel;
                        }
                    }
                    // determine if this is the first image added to folder 
                    successModel.ReturnValue = db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Count().ToString();
                } // using
                using (var db = new OggleBoobleMSSqlContext())
                {
                    if (model.Mode == "Copy")
                    {
                        MSSqlDataContext.CategoryImageLink existingLink = db.CategoryImageLinks.Where(l => l.ImageLinkId == imageLinkId).FirstOrDefault();
                        if (existingLink != null)
                            successModel.Success = "Link already exists";
                        else
                        {
                            db.CategoryImageLinks.Add(new MSSqlDataContext.CategoryImageLink()
                            {
                                ImageCategoryId = model.DestinationFolderId,
                                ImageLinkId = imageLinkId,
                                SortOrder = 997
                            });
                            db.SaveChanges();
                            successModel.Success = "ok";
                        }
                    }
                    else  // Archive / Move
                    {
                        MSSqlDataContext.CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                        
                        string linkId = model.Link.Substring(model.Link.LastIndexOf("_") + 1, 36);
                        var imageFile = db.ImageLinks.Where(i => i.Id == linkId).First();

                        MSSqlDataContext.ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == imageLinkId).First();

                        goDaddyrow.Link = newInternalLink;
                        goDaddyrow.FolderLocation = model.DestinationFolderId;
                        db.SaveChanges();

                        MSSqlDataContext.CategoryImageLink oldCatImageLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == imageLinkId).First();
                        db.CategoryImageLinks.Add(new MSSqlDataContext.CategoryImageLink()
                        {
                            ImageCategoryId = model.DestinationFolderId,
                            ImageLinkId = imageLinkId,
                            SortOrder = oldCatImageLink.SortOrder
                        });
                        if (model.Mode == "Move")
                            db.CategoryImageLinks.Remove(oldCatImageLink);
                        db.SaveChanges();
                    }
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
        public SuccessModel AddImageLink(AddLinkModel newLink)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                string imageLinkId = Guid.NewGuid().ToString();
                int fWidth = 0;
                int fHeight = 0;
                long fSize = 0;
                string trimPath = "", newFileName = "", mySqlDestPath;

                using (var mdb = new OggleBoobleMySqlContext())
                {
                    mySqlDestPath = repoDomain + mdb.CategoryFolders.Where(f => f.Id == newLink.FolderId).FirstOrDefault().FolderPath;
                }

                using (var db = new OggleBoobleMSSqlContext())
                {
                    var existingLink = db.ImageLinks.Where(l => l.ExternalLink == newLink.Link).FirstOrDefault();
                    if (existingLink != null)
                    {
                        imageLinkId = existingLink.Id;
                        successModel.Success = "Link Already Added";
                    }
                    else
                    {
                        MSSqlDataContext.CategoryFolder dbCategory = db.CategoryFolders.Where(f => f.Id == newLink.FolderId).First();
                        string extension = newLink.Link.Substring(newLink.Link.LastIndexOf("."));
                        newFileName = dbCategory.FolderName + "_" + imageLinkId + extension;
                        //var trimPath = newLink.Path.Substring(newLink.Path.IndexOf("Root/") + 1);
                        string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                        trimPath = newLink.Path.Replace("/Root/", "").Replace("%20", " ");

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



                        // USE WEBCLIENT TO CREATE THE FILE
                        using (WebClient wc = new WebClient())
                        {
                            try
                            {
                                wc.DownloadFile(new Uri(newLink.Link), appDataPath + "tempImage" + extension);
                            }
                            catch (Exception ex)
                            {
                                successModel.Success = "wc. download didnt work " + ex.Message;
                                return successModel;
                            }
                        }
                        FtpWebRequest webRequest = null;
                        // USE WEBREQUEST TO UPLOAD THE FILE
                        try
                        {
                            // todo  write the image as a file to x.ogglebooble  4/1/19
                            //string localRoot = dbCategory.RootFolder;
                            //if (localRoot == "centerfold")
                            //    localRoot = "playboy";
                            ////var localPath = repoPath + localRoot + ".OGGLEBOOBLE.COM" + newLink.Path.Remove(0, newLink.Path.IndexOf("/", newLink.Path.IndexOf("/") + 1));
                            //string ftpPath = ftpHost + localRoot + ".OGGLEBOOBLE.COM" + newLink.Path.Remove(0, newLink.Path.IndexOf("/", newLink.Path.IndexOf("/") + 1));
                            //if (!FtpUtilies.DirectoryExists(ftpPath))
                            //    FtpUtilies.CreateDirectory(ftpPath);



                            //webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                            //webRequest.Credentials = networkCredentials;
                            //var zz = webRequest.Method = WebRequestMethods.Ftp.UploadFile;




                            webRequest = (FtpWebRequest)WebRequest.Create(ftpHost + repoDomain + "/" + mySqlDestPath + "/" + newFileName);
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
                        db.ImageLinks.Add(new MSSqlDataContext.ImageLink()
                        {
                            Id = imageLinkId,
                            FolderLocation = newLink.FolderId,
                            ExternalLink = newLink.Link,
                            Width = fWidth,
                            Height = fHeight,
                            Size = fSize,
                            LastModified = DateTime.Now,
                            Link = "http://" + trimPath + "/" + newFileName
                        });
                        db.CategoryImageLinks.Add(new MSSqlDataContext.CategoryImageLink()
                        {
                            ImageCategoryId = newLink.FolderId,
                            ImageLinkId = imageLinkId,
                            SortOrder = 999
                        });
                        db.SaveChanges();
                    }
                    try
                    {
                        int lnkCount = db.CategoryImageLinks.Where(c => c.ImageCategoryId == newLink.FolderId).Count();
                        if (lnkCount == 0)
                            successModel.ReturnValue = imageLinkId;
                        else
                            successModel.ReturnValue = "0";

                        MSSqlDataContext.CategoryImageLink categoryImageLink = db.CategoryImageLinks.Where(c => c.ImageLinkId == imageLinkId && c.ImageCategoryId == newLink.FolderId).FirstOrDefault();
                        if (categoryImageLink == null)
                        {
                            db.CategoryImageLinks.Add(new MSSqlDataContext.CategoryImageLink()
                            {
                                ImageCategoryId = newLink.FolderId,
                                ImageLinkId = imageLinkId,
                                SortOrder = 799
                            });
                            db.SaveChanges();
                            if (successModel.Success == "Link Already Added")
                            {
                                successModel.Success = "Link to existing image added to folder";
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        successModel.Success = Helpers.ErrorDetails(ex);
                        if (successModel.Success.StartsWith("ERROR: Cannot insert duplicate key row in object"))
                            successModel.Success = "Alredy Added";
                    }
                }

                using (var mdb = new OggleBoobleMySqlContext())
                {
                    mdb.ImageFiles.Add(new ImageFile()
                    {
                        Id = imageLinkId,
                        FolderId = newLink.FolderId,
                        ExternalLink = newLink.Link,
                        Width = fWidth,
                        Height = fHeight,
                        Size = fSize,
                        Acquired = DateTime.Now,
                        FileName= newFileName
                        //Link = "http://" + trimPath + "/" + newFileName

                    });
                    mdb.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                    {
                        ImageCategoryId = newLink.FolderId,
                        ImageLinkId = imageLinkId,
                        SortOrder = 996
                    });
                    mdb.SaveChanges();
                }
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex) + " please try again";
            }
            return successModel;
        }

    }
}
