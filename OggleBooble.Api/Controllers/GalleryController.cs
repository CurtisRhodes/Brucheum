﻿using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using OggleBooble.Api.MSSqlDataContext;
using System.Data.Entity.Migrations.Model;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class GalleryPageController : ApiController
    {
        [HttpGet]
        [Route("api/GalleryPage/UpdateDirTree")]
        public string UpdateDirTree() 
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.Database.ExecuteSqlCommand("TRUNCATE TABLE Entity");
                    db.Database.ExecuteSqlCommand("insert OggleBooble.DirTree select * from OggleBooble.VwDirTree");
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetAlbumImages")]
        public GalleryImagesAndFoldersModel GetAlbumImages(int folderId)
        {
            var albumImageInfo = new GalleryImagesAndFoldersModel() { FolderId = folderId };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    albumImageInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumImageInfo.FolderType = dbCategoryFolder.FolderType;

                    // SUB FOLDERS
                    List<VwDirTree> dbFolderRows = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();
                    foreach (VwDirTree row in dbFolderRows)
                    {
                        albumImageInfo.Folders.Add(new GalleryFolderModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            FolderId = row.Id,
                            DirectoryName = row.FolderName,
                            ParentId = row.Parent,
                            FileCount = row.FileCount,
                            IsStepChild = row.IsStepChild,
                            FolderImage = row.FolderImage,
                            RootFolder = row.RootFolder
                        });
                    }

                    // IMAGES
                    albumImageInfo.ImageLinks = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                }
                albumImageInfo.Success = "ok";
            }
            catch (Exception ex) { albumImageInfo.Success = Helpers.ErrorDetails(ex); }
            return albumImageInfo;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetAlbumPageInfo")]
        public AlbumInfoModel GetAlbumPageInfo(string visitorId, int folderId) 
        {
            var albumInfo = new AlbumInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    albumInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumInfo.FolderName = dbCategoryFolder.FolderName;
                    albumInfo.FolderType = dbCategoryFolder.FolderType;

                    albumInfo.FileCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                    albumInfo.SubFolderCount = db.VirtualFolders.Where(f => f.Parent == folderId).Count();

                    //List<string> subFolderNames = db.VirtualFolders.Where(f => f.Parent == folderId).Select(f=>f.FolderName).ToList();
                    var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        albumInfo.TrackBackItems.Add(new TrackbackLink()
                        {
                            SiteCode = trackbackLink.SiteCode,
                            Href = trackbackLink.Href,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    if(db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault() != null) 
                        albumInfo.FolderComments = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault().FolderComments;

                    #region BreadCrumbs
                    VirtualFolder thisFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    albumInfo.BreadCrumbs.Add(new BreadCrumbItemModel()
                    {
                        FolderId = thisFolder.Id,
                        FolderName = thisFolder.FolderName,
                        ParentId = thisFolder.Parent,
                        IsInitialFolder = true
                    });
                    var parent = thisFolder.Parent;
                    while (parent > 1)
                    {
                        VirtualFolder parentDb = db.VirtualFolders.Where(f => f.Id == parent).First();
                        albumInfo.BreadCrumbs.Add(new BreadCrumbItemModel()
                        {
                            FolderId = parentDb.Id,
                            FolderName = parentDb.FolderName,
                            IsInitialFolder = false
                        });
                        parent = parentDb.Parent;
                    }
                    #endregion                
                    albumInfo.PageHits = db.PageHits.Where(h => h.PageId == folderId).Count();
                    var dbPageHitTotals = db.PageHitTotal.Where(h => h.PageId == folderId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        albumInfo.PageHits += dbPageHitTotals.Hits;
                    }
                    VirtualFolder categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    //if (categoryFolder != null) albumInfo.RootFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First().RootFolder;
                    albumInfo.UserPageHits = db.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    albumInfo.UserImageHits = db.ImageHits.Where(h => h.VisitorId == visitorId).Count();
                }
                albumInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                albumInfo.Success = Helpers.ErrorDetails(ex);
            }
            return albumInfo;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetSubFolderCounts")]
        public SubFolderCountModel GetSubFolderCounts(int folderId)
        {
            //step 1 get this data from the database
            // step 2 use this to Refresh the database after changes are made
            var subFolderModel = new SubFolderCountModel() { FolderId = folderId };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetail != null)
                        if (dbFolderDetail.TotalChildFiles != 0)
                        {
                            subFolderModel.TtlFileCount = dbFolderDetail.TotalChildFiles;
                            subFolderModel.TtlFolderCount = dbFolderDetail.SubFolderCount;
                            subFolderModel.Success = "ok";
                            return subFolderModel;
                        }
                    //subFolderModel.RootFolder = db.VirtualFolders.Where(f => f.Parent == folderId).First().RootFolder;
                    subFolderModel.TtlFileCount = subFolderModel.FileCount = db.CategoryImageLinks.Where(l => l .ImageCategoryId == folderId).Count();
                    
                    
                    subFolderModel.TtlFolderCount = db.VirtualFolders.Where(f => f.Parent == folderId).Count();
                    AddChildSubFolders(folderId, subFolderModel, db);
                    SaveFileCounts(subFolderModel, db);
                    AddChildSubFolders(folderId, subFolderModel, db);
                    subFolderModel.Success = "ok";
                }
            }
            catch (Exception ex) {
                subFolderModel.Success = Helpers.ErrorDetails(ex); 
            }
            return subFolderModel;
        }
        private void AddChildSubFolders(int parentId, SubFolderCountModel parentFolderModel, OggleBoobleMySqlContext db)
        {
            var subDirs = db.VirtualFolders.Where(f => f.Parent == parentId).ToList();
            foreach (VirtualFolder subDir in subDirs)
            {
                var thisSubFolder = new SubFolderCountModel();
                parentFolderModel.SubFolders.Add(thisSubFolder);
                thisSubFolder.FolderId = subDir.Id;
                thisSubFolder.FileCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subDir.Id).Count();
                var subsubFolders = db.VirtualFolders.Where(f => f.Parent == subDir.Id).ToList();
                foreach (VirtualFolder subsubFolder in subsubFolders)
                {
                    AddChildSubFolders(subsubFolder.Id, thisSubFolder, db);
                }
            }
        }

        private void SaveFileCounts(SubFolderCountModel parentFolderModel, OggleBoobleMySqlContext db) {
            foreach (SubFolderCountModel subFolder in parentFolderModel.SubFolders)
            {  // drop down to last node
                subFolder.TtlFileCount = subFolder.FileCount;
                subFolder.TtlFolderCount = subFolder.SubFolders.Count();
                parentFolderModel.TtlFolderCount += subFolder.SubFolders.Count();
                parentFolderModel.TtlFileCount += subFolder.FileCount;
            }
            if (parentFolderModel.TtlFileCount > 0)
            {
                var folderDetail = db.FolderDetails.Where(d => d.FolderId == parentFolderModel.FolderId).FirstOrDefault();
                if (folderDetail != null)
                {
                    //folderDetail = new FolderDetail() { FolderId = parentFolderModel.FolderId };
                    folderDetail.TotalChildFiles = parentFolderModel.TtlFileCount;
                    folderDetail.SubFolderCount = parentFolderModel.TtlFolderCount;
                    db.SaveChanges();
                }
            }
        }

        [HttpPut]
        [Route("api/GalleryPage/UpdateFolderImage")]
        public string UpdateFolderImage(string linkId, int folderId, string level)
        {
            string success = "";
            try
            {
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    VirtualFolder dbCategoryFolder = mdb.VirtualFolders.Where(f => f.Id == folderId).First();
                    if (level == "folder")
                    {
                        dbCategoryFolder.FolderImage = linkId;
                    }
                    else
                    {
                        VirtualFolder dbParentCategoryFolder = mdb.VirtualFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                        dbParentCategoryFolder.FolderImage = linkId;
                    }
                    mdb.SaveChanges();
                }
                //using (var db = new OggleBoobleMSSqlContext())
                //{
                //    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                //    if (level == "folder")
                //    {
                //        dbCategoryFolder.FolderImage = linkId;
                //    }
                //    else
                //    {
                //        CategoryFolder dbParentCategoryFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                //        dbParentCategoryFolder.FolderImage = linkId;
                //    }
                //    db.SaveChanges();
                //}
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetStaticPage")]
        public SuccessModel GetStaticPage(int folderId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    string staticPageFileName = dbCategoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", "");
                    //string staticPageFileName = Helpers.GetCustomStaticFolderName(folderId, dbCategoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", ""));
                    successModel.ReturnValue = "http://ogglebooble.com/static/" + dbCategoryFolder.RootFolder + "/" + staticPageFileName + ".html";
                    successModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetSlideShowItems")]
        public SlideshowItemsModel GetSlideShowItems(int folderId, bool includeSubFolders)
        {
            //var timer = new System.Diagnostics.Stopwatch();
            //timer.Start();
            var slideshowItemModel = new SlideshowItemsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId " + folderId + " not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = categoryFolder.FolderName;
                    slideshowItemModel.RootFolder = categoryFolder.RootFolder;

                    if (includeSubFolders)
                    {
                        var unsortedList = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                        GetChildGalleryItems(folderId, unsortedList, db);
                        //slideshowItemModel.SlideshowItems = (IList<VwSlideshowItem>)unsortedList.OrderBy(i => i.LinkId).ToList();
                        slideshowItemModel.SlideshowItems = unsortedList.OrderBy(i => i.LinkId).ToList();
                    }
                    else {
                        slideshowItemModel.SlideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                    } 
                }
                slideshowItemModel.Success = "ok";
            }
            catch (Exception ex)
            {
                slideshowItemModel.Success = Helpers.ErrorDetails(ex);
            }
            //timer.Stop();
            //System.Diagnostics.Debug.WriteLine("GetImageFiles took: " + timer.Elapsed);
            return slideshowItemModel;
        }

        private void GetChildGalleryItems(int parentFolderId, List<VwSlideshowItem> unsortedList, OggleBoobleMySqlContext db)
        {
            var subFolders = db.VirtualFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (VirtualFolder subFolder in subFolders)
            {
                unsortedList.AddRange(db.VwSlideshowItems.Where(s => s.FolderId == subFolder.Id).ToList());
                GetChildGalleryItems(subFolder.Id, unsortedList, db);
            }
        }
    }
}
