﻿using OggleBooble.Api.Models;
//using OggleBooble.Api.MSSqlDataContext;
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
    public class DirTreeController : ApiController
    {
        //private readonly string httpLocation = "https://ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private readonly string settingsImgRepo = "https://img.ogglebooble.com/";

        string strDirTree = "";
        int dirTreeTab = 0, dirTreeTabIndent = 2, expandDepth = 2;

        [HttpGet]
        public DirTreeSuccessModel BuildDirTree(int root)
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
                System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);

                strDirTree = "<dir>";
                buildDirTreeRecurr(dirTreeModel.SubDirs[0]);
                WriteFileToDisk(strDirTree);

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

        private void buildDirTreeRecurr(DirTreeModelNode parentNode)
        {
            dirTreeTab += dirTreeTabIndent;
            string txtFileCount = "";
            string expandClass = "", expandMode = "-";
            string folderImage = "";
            foreach(DirTreeModelNode thisNode in parentNode.SubDirs) {  //$.each(parentNode.SubDirs, function(idx, thisNode) {
                VwDirTree vwDir = thisNode.ThisNode;

                if (vwDir.FolderImage==null)
                    folderImage = "Images/redballon.png";
                else
                    folderImage = settingsImgRepo + vwDir.FolderImage;
                expandMode = "-";
                expandClass = "";
                if (dirTreeTab / dirTreeTabIndent > expandDepth)
                {
                    expandClass = "displayHidden";
                    if (thisNode.SubDirs==null)    //!isNullorUndefined(thisNode.SubDirs))
                    {
                        if (thisNode.SubDirs.Count > 0)
                            expandMode = "+";
                    }
                }
                if (vwDir.SubFolderCount > 0)
                {
                    //txtFileCount = "(" + parentNode.SubDirs.length + ")";
                    if (vwDir.FileCount > 0)
                        txtFileCount = "[" + vwDir.SubFolderCount.ToString("0") + "] (" + vwDir.TotalChildFiles.ToString("0") + ")" +
                            " {" + vwDir.FileCount + "}";
                    else
                    {
                        if (thisNode.SubDirs.Count == vwDir.SubFolderCount)
                            txtFileCount = thisNode.SubDirs.Count + " (" + vwDir.TotalChildFiles.ToString("0") + ")";
                        else
                            txtFileCount = thisNode.SubDirs.Count + " [" + vwDir.SubFolderCount.ToString("0") + " / " +
                                vwDir.TotalChildFiles.ToString("0") + "]";
                    }
                }
                else
                    txtFileCount = "(" + vwDir.FileCount + ")";

                string randomId = Guid.NewGuid().ToString();

                string treeNodeClass = "treeLabelDiv";
                if (vwDir.IsStepChild == 1)
                {
                    treeNodeClass = "stepchildTreeLabel";
                }

                if (vwDir.FolderName==null)
                {
                    vwDir.FolderName = "unknown";
                }

                strDirTree +=
                    "<div class='dirTreeNode clickable' style='text-indent:" + dirTreeTab + "px'>"
                    + "<span id='DQ33" + randomId + "' onclick='toggleDirTree(\"" + randomId + "\")' >[" + expandMode + "] </span>"
                    + "<div id='" + randomId + "aq' class='" + treeNodeClass + "' "
                    + "onclick=commonDirTreeClick('" + thisNode.DanniPath + "'," + vwDir.Id + ") "
                    + "oncontextmenu=showDirTreeContextMenu(" + vwDir.Id + ") "
                    + "onmouseover=showFolderImage('encodeURI(" + folderImage + ")') onmouseout=$('.dirTreeImageContainer').hide()>"
                    + vwDir.FolderName + "</div><span class='fileCount'>  : "
                    + txtFileCount + "</span></div>" + "\n<div class='" + expandClass + "' id='Q88" + randomId + "'>";

                dirTreeTabIndent = 22;
                buildDirTreeRecurr(thisNode);
                strDirTree += "</div>";
                dirTreeTab -= dirTreeTabIndent;
            }
        }

        private string WriteFileToDisk(string staticContent)
        {
            string success;
            try
            {
                // todo  write the image as a file to x.ogglebooble  4/1/19
                //string tempFilePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data");
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");

                using (var staticFile = System.IO.File.Open(appDataPath + "/temp.html", System.IO.FileMode.Create))
                {
                    Byte[] byteArray = System.Text.Encoding.ASCII.GetBytes(staticContent);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                FtpWebRequest webRequest = null;
                //string ftpPath = ftpHost + "/pages.OGGLEBOOBLE.COM/";
                //string ftpFileName = ftpHost + "ogglebooble/" + pageTitle + ".html";
                //string httpFileName = httpLocation + "/" + pageTitle + ".html";

                string ftpFileName = ftpHost + "ogglebooble/data/dirTree.html";

                webRequest = (FtpWebRequest)WebRequest.Create(ftpFileName);
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                using (System.IO.Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = File.ReadAllBytes(appDataPath + "/temp.html");
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }

                //success = RecordPageCreation(folderId, httpFileName, db);
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class LinksController : ApiController
    {
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Links/GetLinkCount")]
        public int GetLinkCount(string imageLinkId)
        {
            int linkCount;
            using (var db = new OggleBoobleMySqlContext())
            {
                linkCount = db.CategoryImageLinks.Where(l => l.ImageLinkId == imageLinkId).Count();
            }
            return linkCount;
        }

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

        [HttpPut]
        [Route("api/Links/AutoIncriment")]
        public SuccessModel AutoIncriment(int folderId, bool recurr)
        {
            SuccessModel successModel = new SuccessModel();
            int changes = 0;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    AutoIncrimentRecurr(folderId, recurr, db);
                }
                successModel.ReturnValue = changes.ToString();
                successModel.Success = "ok";
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }
        private void AutoIncrimentRecurr(int parent, bool recurr, OggleBoobleMySqlContext db)
        {
            int incri = 0;
            var links = db.CategoryImageLinks.Where(l => l.ImageCategoryId == parent).OrderBy(l => l.SortOrder).ToList();
            foreach (CategoryImageLink link in links)
            {
                link.SortOrder = incri++;
            }
            db.SaveChanges();
            if (recurr)
            {
                var subFolders = db.CategoryFolders.Where(f => f.Parent == parent).ToList();
                foreach (CategoryFolder subFolder in subFolders)
                {
                    AutoIncrimentRecurr(subFolder.Id, true, db);
                }
            }
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
        public string UpdateSortOrder(List<SortOrderItem> links)
        {
            string success = "";
            int folderId = links[0].FolderId;
            using (var db = new OggleBoobleMySqlContext())
            {
                List<CategoryImageLink> catLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                foreach (SortOrderItem link in links)
                {
                    CategoryImageLink catLink = catLinks.Where(x => x.ImageLinkId == link.ItemId).FirstOrDefault();
                    if (catLink != null)
                        catLink.SortOrder = link.SortOrder;
                }
                db.SaveChanges();
                success = "ok";
            }
            return success;
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

                    if (!FtpUtilies.DirectoryExists(destFtpPath))
                        FtpUtilies.CreateDirectory(destFtpPath);

                    var dbSourceFolder = db.CategoryFolders.Where(f => f.Id == moveManyModel.SourceFolderId).First();
                    string sourceFtpPath = ftpHost + ftpRepo + "/" + dbSourceFolder.FolderPath;

                    ImageFile dbImageFile = null;
                    string oldFileName;
                    string newFileName;
                    string linkId;
                    int sortOrder;
                    for (int i = 0; i < moveManyModel.ImageLinkIds.Length; i++) {
                        linkId = moveManyModel.ImageLinkIds[i];
                        if (moveManyModel.Context == "copy") //only
                        {
                            db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                            {
                                ImageCategoryId = dbDestFolder.Id,
                                ImageLinkId = linkId,
                                SortOrder = 9876
                            });
                            db.SaveChanges();
                        }
                        else
                        {
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
                                if (moveManyModel.Context == "move")
                                {
                                    db.CategoryImageLinks.Remove(oldLink);
                                    db.SaveChanges();
                                }

                                db.CategoryImageLinks.Add(new CategoryImageLink()
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
                    }
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/MoveLink")]
        public string MoveLink(string linkId, int destinationFolderId, string request)
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

                    if (!FtpUtilies.DirectoryExists(destFtpPath))
                        FtpUtilies.CreateDirectory(destFtpPath);

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
    }
}