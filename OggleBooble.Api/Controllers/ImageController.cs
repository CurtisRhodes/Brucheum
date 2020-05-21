using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
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
        private readonly string repoPath = "F:/Danni/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Image/GetImageDetail")]
        public ImageInfoSuccessModel GetImageDetail(int folderId, string linkId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var imageInfo = new ImageInfoSuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (dbCategoryFolder == null)
                    {
                        imageInfo.Success = "no dategory folder found";
                        return imageInfo;
                    }

                    imageInfo.FolderName = dbCategoryFolder.FolderName;
                    if (Helpers.ContainsRomanNumeral(dbCategoryFolder.FolderName)) {
                        CategoryFolder dbCategoryFolderParent = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).FirstOrDefault();
                        if (dbCategoryFolderParent != null)
                        {
                            imageInfo.FolderName = dbCategoryFolderParent.FolderName;
                        }
                    }

                    ImageLink dbImageLink = db.ImageLinks.Where(i => i.Id == linkId).FirstOrDefault();
                    if (dbImageLink == null) {
                        imageInfo.Success = "no image link found";
                        return imageInfo;
                    }

                    imageInfo.IsLinkJustaLink = (dbImageLink.FolderLocation != folderId);
                    imageInfo.LinkId = dbImageLink.Link;
                    imageInfo.FolderLocation = dbImageLink.FolderLocation;
                    imageInfo.Height = dbImageLink.Height;
                    imageInfo.Width = dbImageLink.Width;
                    imageInfo.LastModified = dbImageLink.LastModified;
                    imageInfo.Link = dbImageLink.Link;
                    imageInfo.ExternalLink = dbImageLink.ExternalLink;
                    imageInfo.InternalLinks = (from l in db.CategoryImageLinks
                                               join f in db.CategoryFolders on l.ImageCategoryId equals f.Id
                                               where l.ImageLinkId == linkId && l.ImageCategoryId != folderId
                                               select new { folderId = f.Id, folderName = f.FolderName })
                                               .ToDictionary(i => i.folderId, i => i.folderName);

                    if (dbCategoryFolder == null)
                    {
                        imageInfo.Success = "no dategory folder found";
                        return imageInfo;
                    }
                }

                imageInfo.Success = "ok";
            }
            catch (Exception ex)
            {
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
            try
            {
                if (model.SourceFolderId == model.DestinationFolderId)
                {
                    successModel.Success = "Source and Destination the same";
                    return successModel;
                }

                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    ImageLink dbImageLink = db.ImageLinks.Where(l => l.Link.Replace("%20", " ") == model.Link.Replace("%20", " ")).FirstOrDefault();
                    if (dbImageLink == null)
                    {
                        successModel.Success = "link [" + model.Link.Replace("%20", " ") + "] not found";
                        return successModel;
                    }
                    List<CategoryImageLink> categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == model.DestinationFolderId).ToList();
                    if (model.Mode == "Copy")
                    {
                        CategoryImageLink existingLink = categoryImageLinks.Where(l => l.ImageLinkId == dbImageLink.Id).FirstOrDefault();
                        if (existingLink != null)
                            successModel.Success = "Link already exists";
                        else
                        {
                            db.CategoryImageLinks.Add(new CategoryImageLink()
                            {
                                ImageCategoryId = model.DestinationFolderId,
                                ImageLinkId = dbImageLink.Id,
                                SortOrder = 999
                            });
                            db.SaveChanges();
                            successModel.Success = "ok";
                        }
                    }
                    else  // Archive / Move
                    {
                        CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).First();
                        string linkId = model.Link.Substring(model.Link.LastIndexOf("_") + 1, 36);
                        ImageLink imageLink = db.ImageLinks.Where(i => i.Id == linkId).FirstOrDefault();
                        if (imageLink == null)
                        {
                            successModel.Success = "ImageLink record not found";
                            return successModel;
                        }

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
                            #region move file on local drive 
                            string localDestinationPath = "";
                            try
                            {
                                string localServerPath = "F:/Danni/";
                                string localSourcePath = localServerPath + Helpers.GetLocalParentPath(model.SourceFolderId) + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + dbImageLink.Id + extension;
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

                            //2. update ImageLinks 
                            string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                            string newInternalLink = linkPrefix + Helpers.GetParentPath(model.DestinationFolderId) + dbDestinationFolder.FolderName + "/" + newFileName;
                            #region do it for sql server

                            ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                            if (goDaddyrow != null)
                            {
                                goDaddyrow.Link = newInternalLink;
                                goDaddyrow.FolderLocation = dbDestinationFolder.Id;
                            }
                            else
                                Console.WriteLine("imageLink.FolderLocation() != categoryFolder.Id()");
                            CategoryImageLink oldCatImageLink = db.CategoryImageLinks
                                 .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageLink.Id).First();
                            db.CategoryImageLinks.Add(new CategoryImageLink()
                            {
                                ImageCategoryId = model.DestinationFolderId,
                                ImageLinkId = dbImageLink.Id,
                                SortOrder = oldCatImageLink.SortOrder
                            });
                            db.SaveChanges();
                            if (model.Mode == "Move")
                            {
                                db.CategoryImageLinks.Remove(oldCatImageLink);
                            }
                            db.SaveChanges();
                            #endregion

                            #region do it for my sql
                            using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                            {
                                MySqlDataContext.ImageLink mdbImageLink = mdb.ImageLinks.Where(g => g.Id == dbImageLink.Id).FirstOrDefault();
                                if (mdbImageLink != null)
                                {
                                    mdbImageLink.Link = newInternalLink;
                                    mdbImageLink.FolderLocation = dbDestinationFolder.Id;
                                }
                                else
                                    Console.WriteLine("imageLink.FolderLocation() != categoryFolder.Id()");
                                MySqlDataContext.CategoryImageLink oldMdbCatImageLink = mdb.CategoryImageLinks
                                     .Where(c => c.ImageCategoryId == model.SourceFolderId && c.ImageLinkId == dbImageLink.Id).First();
                                mdb.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                                {
                                    ImageCategoryId = model.DestinationFolderId,
                                    ImageLinkId = dbImageLink.Id,
                                    SortOrder = oldMdbCatImageLink.SortOrder
                                });
                                db.SaveChanges();
                                if (model.Mode == "Move")
                                {
                                    db.CategoryImageLinks.Remove(oldCatImageLink);
                                }
                                db.SaveChanges();
                            }
                            #endregion
                        }
                        else
                        {
                            successModel.Success = ftpMoveSuccess;
                            return successModel;
                        }
                    }
                    // determine if this is the first image added to folder 
                    successModel.ReturnValue = db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Count().ToString();
                    successModel.Success = "ok";
                } // using
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
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string imageLinkId = Guid.NewGuid().ToString();
                    var existingLink = db.ImageLinks.Where(l => l.ExternalLink == newLink.Link).FirstOrDefault();
                    if (existingLink != null)
                    {
                        imageLinkId = existingLink.Id;
                        successModel.Success = "Link Already Added";
                    }
                    else
                    {
                        CategoryFolder dbCategory = db.CategoryFolders.Where(f => f.Id == newLink.FolderId).First();
                        string extension = newLink.Link.Substring(newLink.Link.LastIndexOf("."));
                        string newFileName = dbCategory.FolderName + "_" + imageLinkId + extension;
                        //var trimPath = newLink.Path.Substring(newLink.Path.IndexOf("Root/") + 1);
                        string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                        string trimPath = newLink.Path.Replace("/Root/", "").Replace("%20", " ");

                        // USE WEBCLIENT TO CREATE THE FILE
                        using (WebClient wc = new WebClient())
                        {
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
                            string ftpPath = ftpHost + trimPath;
                            if (!FtpUtilies.DirectoryExists(ftpPath))
                                FtpUtilies.CreateDirectory(ftpPath);

                            webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                            webRequest.Credentials = networkCredentials;
                            var zz = webRequest.Method = WebRequestMethods.Ftp.UploadFile;
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
                            LastModified = DateTime.Now,
                            Link = "http://" + trimPath + "/" + newFileName
                        });
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = newLink.FolderId,
                            ImageLinkId = imageLinkId,
                            SortOrder = 999
                        });
                        db.SaveChanges();

                        using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                        {
                            mdb.ImageLinks.Add(new MySqlDataContext.ImageLink()
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
                            mdb.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                            {
                                ImageCategoryId = newLink.FolderId,
                                ImageLinkId = imageLinkId,
                                SortOrder = 99
                            });
                            mdb.SaveChanges();
                        }
                        successModel.Success = "ok";
                    }
                    try
                    {
                        int lnkCount = db.CategoryImageLinks.Where(c => c.ImageCategoryId == newLink.FolderId).Count();
                        if (lnkCount == 0)
                            successModel.ReturnValue = imageLinkId;
                        else
                            successModel.ReturnValue = "0";

                        CategoryImageLink categoryImageLink = db.CategoryImageLinks.Where(c => c.ImageLinkId == imageLinkId && c.ImageCategoryId == newLink.FolderId).FirstOrDefault();
                        if (categoryImageLink == null)
                        {
                            db.CategoryImageLinks.Add(new CategoryImageLink()
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
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex) + " please try again";
            }
            return successModel;
        }

    }
}
