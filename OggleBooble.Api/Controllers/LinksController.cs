using OggleBooble.Api.Models;
using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.InteropServices;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class LinksController : ApiController
    {
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Links/GetImageLinks")]
        public ImageLinksModel GetImageLinks(int folderId)
        {
            var imgLinks = new ImageLinksModel();
            using (var db = new OggleBoobleMySqlContext())
            {
                imgLinks.Links = db.VwLinks.Where(l => l.FolderId == folderId).OrderBy(l => l.SortOrder).ToList();
            }
            imgLinks.Success = "ok";
            return imgLinks;
        }

        [HttpGet]
        [Route("api/Links/GetMoveableImageLinks")]
        public ImageLinksModel GetMoveableImageLinks(int folderId)
        {
            var imgLinks = new ImageLinksModel();
            using (var db = new OggleBoobleMySqlContext())
            {
                imgLinks.Links = db.VwLinks.Where(l => (l.FolderId == folderId) && (l.FolderId == l.SrcId)).OrderBy(l => l.SortOrder).ToList();
            }
            imgLinks.Success = "ok";
            return imgLinks;
        }

        [HttpPut]
        [Route("api/Links/UpdateSortOrder")]
        public string UpdateSortOrder(List<SortOrderItem> SortOrderItems)
        {
            string success = "";
            using (var db = new OggleBoobleMySqlContext())
            {
                foreach (SortOrderItem item in SortOrderItems)
                {
                    var link = db.CategoryImageLinks.Where(l => l.ImageCategoryId == item.PageId && l.ImageLinkId == item.ItemId).FirstOrDefault();
                    if (link != null)
                        link.SortOrder = item.InputValue;
                }
                db.SaveChanges();
                success = "ok";
            }
            return success;
        }

        [HttpGet]
        [Route("api/Links/BuildCatTree")]
        public DirTreeSuccessModel BuildCatTree(int root)
        {
            DirTreeSuccessModel dirTreeModel = new DirTreeSuccessModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                IEnumerable<VwDirTree> VwDirTrees = new List<VwDirTree>();
                //var vwDirTrees;
                using (var db = new OggleBoobleMySqlContext())
                {
                    // wow did this speed things up
                    VwDirTrees = db.VwDirTrees.ToList().OrderBy(v => v.Id);
                }

                var vRootNode = VwDirTrees.Where(v => v.Id == root).First();
                DirTreeModelNode rootNode = new DirTreeModelNode() { ThisNode = vRootNode };
                dirTreeModel.SubDirs.Add(rootNode);

                //GetDirTreeChildNodes(dirTreeModel, rootNode, vwDirTrees);
                GetDirTreeChildNodes(dirTreeModel, rootNode, VwDirTrees, "");
                timer.Stop();
                dirTreeModel.TimeTook = timer.Elapsed;
                //System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
                dirTreeModel.Success = "ok";
            }
            catch (Exception ex)
            {
                dirTreeModel.Success = Helpers.ErrorDetails(ex);
            }
            return dirTreeModel;
        }
        private void GetDirTreeChildNodes(DirTreeSuccessModel dirTreeModel, DirTreeModelNode parentNode, IEnumerable<VwDirTree> VwDirTrees, string dPath)
        {
            List<VwDirTree> vwDirTreeNodes = VwDirTrees.Where(v => v.Parent == parentNode.ThisNode.Id).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();
            foreach (VwDirTree vNode in vwDirTreeNodes)
            {
                DirTreeModelNode childNode = new DirTreeModelNode() { ThisNode = vNode, DanniPath = (dPath + "/" + vNode.FolderName).Replace(" ", "%20") };
                parentNode.SubDirs.Add(childNode);
                if (vNode.IsStepChild == 0)
                    GetDirTreeChildNodes(dirTreeModel, childNode, VwDirTrees, (dPath + "/" + vNode.FolderName).Replace(" ", "%20"));
            }
        }

        [HttpPost]
        [Route("api/Links/AddLink")]
        public string AddLink(string linkId, int destinationId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                    {
                        ImageCategoryId = destinationId,
                        ImageLinkId = linkId,
                        SortOrder = 1456
                    });
                    db.SaveChanges();
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
        [Route("api/Links/RenameFolder")]
        public string RenameFolder(int folderId, string newFolderName)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder rowToRename = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    rowToRename.FolderName = newFolderName;
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpDelete]
        [Route("api/Links/AttemptRemoveLink")]
        public string AttemptRemoveLink(string linkId, int folderId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var imageLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId).ToList();
                    if (imageLinks.Count > 1)
                    {
                        var imageFile = db.ImageFiles.Where(i => i.Id == linkId).First();
                        if (imageFile.FolderId == folderId)
                            success = "home folder Link";
                        else
                        {
                            var linkToRemove = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId && l.ImageCategoryId == folderId).First();
                            db.CategoryImageLinks.Remove(linkToRemove);
                            db.SaveChanges();
                            success = "ok";
                        }
                    }
                    else
                        success = "single link";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpDelete]
        [Route("api/Links/RemoveHomeFolderLink")]
        public string RemoveHomeFolderLink(string linkId, int folderId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var linkToRemove = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId && l.ImageCategoryId == folderId).First();
                    db.CategoryImageLinks.Remove(linkToRemove);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/MoveImageToRejects")]
        public string MoveImageToRejects(string linkId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbSourceImage = db.ImageFiles.Where(f => f.Id == linkId).First();
                    string dbRejectFolder = ftpHost + "/archive.OggleBooble.com/rejects/" + dbSourceImage.FileName;
                    var dbSourceFolder = db.CategoryFolders.Where(f => f.Id == dbSourceImage.FolderId).First();
                    string ftpRepo = imgRepo.Substring(7);
                    string sourceFtpPath = ftpHost + ftpRepo + "/" + dbSourceFolder.FolderPath + "/" + dbSourceImage.FileName;
                    success = FtpUtilies.MoveFile(sourceFtpPath, dbRejectFolder);

                    var linksToRemove = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId).ToList();
                    db.CategoryImageLinks.RemoveRange(linksToRemove);
                    ImageFile reject = db.ImageFiles.Where(i => i.Id == linkId).First();
                    reject.FolderId = -6;
                    //db.ImageFiles.Remove(reject);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/MoveMany")]
        public string MoveMany(MoveManyModel moveManyModel)
        {
            string success;
            try
            {
                string ftpRepo = imgRepo.Substring(7);
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbDestFolder = db.CategoryFolders.Where(i => i.Id == moveManyModel.DestinationFolderId).First();
                    string destFtpPath = ftpHost + ftpRepo + "/" + dbDestFolder.FolderPath;
                    
                    var dbSourceFolder = db.CategoryFolders.Where(f => f.Id == moveManyModel.SourceFolderId).First();
                    string sourceFtpPath = ftpHost + ftpRepo + "/" + dbSourceFolder.FolderPath;

                    ImageFile dbImageFile = null;
                    string oldFileName;
                    string newFileName;
                    string linkId;
                    int sortOrder;
                    for (int i = 0; i < moveManyModel.ImageLinkIds.Length; i++) {
                        linkId = moveManyModel.ImageLinkIds[i];
                        dbImageFile = db.ImageFiles.Where(f => f.Id == linkId).First();
                        oldFileName = dbImageFile.FileName;
                        string ext = dbImageFile.FileName.Substring(dbImageFile.FileName.LastIndexOf("."));
                        newFileName = dbDestFolder.FolderName + "_" + linkId + ext;
                        if (dbDestFolder.Parent == dbSourceFolder.Id)
                            newFileName = oldFileName;

                        success = FtpUtilies.MoveFile(sourceFtpPath + "/" + oldFileName, destFtpPath + "/" + newFileName);
                        if (success == "ok")
                        {                            
                            dbImageFile.FolderId = moveManyModel.DestinationFolderId;
                            dbImageFile.FileName = newFileName;
                            db.SaveChanges();

                            var oldLink = db.CategoryImageLinks.Where(l => l.ImageCategoryId == dbSourceFolder.Id && l.ImageLinkId == linkId).First();
                            sortOrder = oldLink.SortOrder;
                            db.CategoryImageLinks.Remove(oldLink);
                            db.SaveChanges();
                            db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink() 
                            { 
                                ImageCategoryId = dbDestFolder.Id, 
                                ImageLinkId = linkId, 
                                SortOrder = sortOrder 
                            });
                            db.SaveChanges();
                        }
                        else
                            return success;
                    }
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/MoveLink")]
        public string MoveFile(string linkId, int destinationFolderId, string request)
        {
            string success;
            try
            {
                string ftpRepo = imgRepo.Substring(7);
                using (var db = new OggleBoobleMySqlContext())
                {
                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).First();
                    string ext = dbImageFile.FileName.Substring(dbImageFile.FileName.LastIndexOf("."));

                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == dbImageFile.FolderId).First();
                    string sourceFtpPath = ftpHost + ftpRepo + "/" + dbSourceFolder.FolderPath;
                    string fileName = dbImageFile.FileName;
                    //string assumedFileName = dbSourceFolder.FolderName + "_" + linkId + ext;

                    CategoryFolder dbDestFolder = db.CategoryFolders.Where(i => i.Id == destinationFolderId).First();
                    string destFtpPath = ftpHost + ftpRepo + "/" + dbDestFolder.FolderPath;

                    string newFileName = dbDestFolder.FolderName + "_" + linkId + ext;
                    if (dbSourceFolder.Id == dbDestFolder.Parent)
                        newFileName = dbSourceFolder.FolderName + "_" + linkId + ext;

                    success = FtpUtilies.MoveFile(sourceFtpPath + "/" + fileName, destFtpPath + "/" + newFileName);

                    if (success == "ok")
                    {  // update ImageFile
                        dbImageFile.FileName = newFileName;
                        dbImageFile.FolderId = destinationFolderId;

                        // create new link
                        db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                        {
                            ImageCategoryId = destinationFolderId,
                            ImageLinkId = linkId,
                            SortOrder = 1746
                        });

                        if (request == "MOV")
                        {  // update link
                            MySqlDataContext.CategoryImageLink existinglink = db.CategoryImageLinks
                                .Where(l => l.ImageLinkId == linkId && l.ImageCategoryId == dbSourceFolder.Id).First();
                            db.CategoryImageLinks.Remove(existinglink);
                        }
                        //if (request == "ARK")


                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
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
    }
}