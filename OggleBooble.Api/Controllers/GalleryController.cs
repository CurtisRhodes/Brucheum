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
        private readonly string devlVisitorId = System.Configuration.ConfigurationManager.AppSettings["ImageRepository"];

        [HttpGet]
        public BreadCrumbSuccessModel GetBreadcrumbs(int folderId)
        {
            var breadCrumbs = new BreadCrumbSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    breadCrumbs.BreadCrumbs.Add(new BreadCrumbItemModel()
                    {
                        FolderId = thisFolder.Id,
                        FolderName = thisFolder.FolderName,
                        ParentId = thisFolder.Parent,
                        IsInitialFolder = true
                    });
                    var parent = thisFolder.Parent;
                    while (parent > 1)
                    {
                        CategoryFolder parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
                        breadCrumbs.BreadCrumbs.Add(new BreadCrumbItemModel()
                        {
                            FolderId = parentDb.Id,
                            FolderName = parentDb.FolderName,
                            IsInitialFolder = false
                        });
                        parent = parentDb.Parent;
                    }
                    breadCrumbs.Success = "ok";
                }
            }
            catch (Exception ex) { breadCrumbs.Success = Helpers.ErrorDetails(ex); }
            return breadCrumbs;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetAlbumImages")]
        public GalleryImagesAndFoldersModel GetAlbumImages(int folderId)
        {
            var albumImageInfo = new GalleryImagesAndFoldersModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
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
                            FolderType = row.FolderType,
                            SubDirCount = row.SubFolderCount,
                            TotalChildFiles = row.TotalChildFiles,
                            FolderImage = row.FolderImage,
                            RootFolder = row.RootFolder,
                            IsStepChild = row.IsStepChild
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
        public AlbumInfoModel GetAlbumPageInfo(int folderId)
        {
            var albumInfo = new AlbumInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    albumInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumInfo.FolderName = dbCategoryFolder.FolderName;
                    albumInfo.FolderType = dbCategoryFolder.FolderType;
                    albumInfo.FileCount = dbCategoryFolder.Files;
                    albumInfo.FolderCount = dbCategoryFolder.SubFolders;
                    albumInfo.TotalChildFiles = dbCategoryFolder.TotalChildFiles;
                    albumInfo.TotalSubFolders = dbCategoryFolder.TotalSubFolders;
                    //albumInfo.FileCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                    //albumInfo.FolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();

                    #region 1. trackbackLinks
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
                    var dbFolderDetails = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetails != null)
                    {
                        albumInfo.FolderComments = dbFolderDetails.FolderComments;
                        albumInfo.StaticFile = dbFolderDetails.StaticFile;
                        if (dbFolderDetails.StaticFileUpdate != null)
                        {
                            albumInfo.StaticFileUpdate = dbFolderDetails.StaticFileUpdate.Value.ToShortDateString();
                        }
                    }
                    #endregion

                    #region 2. BreadCrumbs
                    //CategoryFolder thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    //albumInfo.BreadCrumbs.Add(new BreadCrumbItemModel()
                    //{
                    //    FolderId = thisFolder.Id,
                    //    FolderName = thisFolder.FolderName,
                    //    ParentId = thisFolder.Parent,
                    //    IsInitialFolder = true
                    //});
                    //var parent = thisFolder.Parent;
                    //while (parent > 1)
                    //{
                    //    CategoryFolder parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
                    //    albumInfo.BreadCrumbs.Add(new BreadCrumbItemModel()
                    //    {
                    //        FolderId = parentDb.Id,
                    //        FolderName = parentDb.FolderName,
                    //        IsInitialFolder = false
                    //    });
                    //    parent = parentDb.Parent;
                    //}
                    #endregion

                    db.PageHits.RemoveRange(db.PageHits.Where(h => h.VisitorId == devlVisitorId));
                    db.ImageHits.RemoveRange(db.ImageHits.Where(i => i.VisitorId == devlVisitorId));

                    albumInfo.PageHits = db.PageHits.Where(h => h.PageId == folderId).Count();
                    var dbPageHitTotals = db.PageHitTotal.Where(h => h.PageId == folderId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        albumInfo.PageHits += dbPageHitTotals.Hits;
                    }
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    //if (categoryFolder != null) albumInfo.RootFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First().RootFolder;
                    //albumInfo.UserPageHits = db.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    //albumInfo.UserImageHits = db.ImageHits.Where(h => h.VisitorId == visitorId).Count();
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
        [Route("api/GalleryPage/GetQucikHeader")]
        public AlbumInfoModel GetQucikHeader(int folderId)
        {
            var albumInfo = new AlbumInfoModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    albumInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumInfo.FolderName = dbCategoryFolder.FolderName;
                    albumInfo.FolderType = dbCategoryFolder.FolderType;

                }
                albumInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                albumInfo.Success = Helpers.ErrorDetails(ex);
            }
            return albumInfo;
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
                    CategoryFolder dbCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First();
                    if (level == "folder")
                    {
                        dbCategoryFolder.FolderImage = linkId;
                    }
                    else
                    {
                        CategoryFolder dbParentCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
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
                //        dbParentCategoryFolders.FolderImage = linkId;
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
                    slideshowItemModel.SlideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                    if (includeSubFolders)
                    {
                        var slideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                        GetEntireGallery(folderId, slideshowItems, db);
                        slideshowItemModel.SlideshowItems = slideshowItems.OrderBy(i => i.LinkId).ToList();
                    }
                    else
                    {
                        slideshowItemModel.SlideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).OrderBy(s => s.SortOrder).ToList();
                    }
                    var dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (dbCategoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId " + folderId + " not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = dbCategoryFolder.FolderName;
                    slideshowItemModel.RootFolder = dbCategoryFolder.RootFolder;
                    slideshowItemModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                slideshowItemModel.Success = Helpers.ErrorDetails(ex);
            }
            //timer.Stop();
            //System.Diagnostics.Debug.WriteLine("GetImageFiles took: " + timer.Elapsed);
            return slideshowItemModel;
        }
        private void GetEntireGallery(int parentFolderId, List<VwSlideshowItem> slideshowItems, OggleBoobleMySqlContext db)
        {
            var subFolders = db.CategoryFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (CategoryFolder subFolder in subFolders)
            {
                slideshowItems.AddRange(db.VwSlideshowItems.Where(s => s.FolderId == subFolder.Id).ToList());
                GetEntireGallery(subFolder.Id, slideshowItems, db);
            }
        }
    }

    [EnableCors("*", "*", "*")]
    public class PageCountController : ApiController
    {
        [HttpGet]
        public SubFolderCountModel GetDeepFolderCounts(int folderId)
        {
            var countModel = new SubFolderCountModel() { FolderId = folderId };
            try
            {
                //GoDeepRecurr(folderId);
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder dbThisCatFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    int fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                    int subFolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();
                    subFolderCount += db.StepChildren.Where(s => s.Parent == folderId).Count();
                    if ((dbThisCatFolder.Files != fileLinkCount) || (dbThisCatFolder.SubFolders != subFolderCount))
                    {
                        dbThisCatFolder.Files = fileLinkCount;
                        dbThisCatFolder.SubFolders = subFolderCount;
                        db.SaveChanges();
                    }
                    int ttlChildFiles = 0;
                    int ttlSubFolders = 0;
                    var subFolders1 = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                    foreach (var subFolder1 in subFolders1)
                    {
                        int sub1ttlChildFiles = 0;
                        int sub1ttlSubFolders = 0;
                        fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subFolder1.Id).Count();
                        subFolderCount = db.CategoryFolders.Where(f => f.Parent == subFolder1.Id).Count();
                        ttlChildFiles += fileLinkCount;
                        if ((fileLinkCount != subFolder1.Files) || (subFolderCount != subFolder1.SubFolders))
                        {
                            subFolder1.Files = fileLinkCount;
                            subFolder1.SubFolders = subFolderCount;
                            db.SaveChanges();
                        }

                        var subFolders2 = db.CategoryFolders.Where(f => f.Parent == subFolder1.Id).ToList();
                        ttlSubFolders += subFolders2.Count();
                        sub1ttlSubFolders += subFolders2.Count();
                        foreach (CategoryFolder subFolder2 in subFolders2)
                        {
                            int sub2ttlChildFiles = 0;
                            int sub2ttlSubFolders = 0;
                            fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subFolder2.Id).Count();
                            subFolderCount = db.CategoryFolders.Where(f => f.Parent == subFolder2.Id).Count();
                            ttlChildFiles += fileLinkCount;
                            sub1ttlChildFiles += fileLinkCount;
                            if ((fileLinkCount != subFolder2.Files) || (subFolderCount != subFolder2.SubFolders))
                            {
                                subFolder2.Files = fileLinkCount;
                                subFolder2.SubFolders = subFolderCount;
                                db.SaveChanges();
                            }

                            var subFolders3 = db.CategoryFolders.Where(f => f.Parent == subFolder2.Id).ToList();
                            ttlSubFolders += subFolders3.Count();
                            sub1ttlSubFolders += subFolders3.Count();
                            sub2ttlSubFolders += subFolders3.Count();
                            foreach (CategoryFolder subFolder3 in subFolders3)
                            {
                                subFolderCount = db.CategoryFolders.Where(f => f.Parent == subFolder3.Id).Count();
                                fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subFolder3.Id).Count();
                                ttlChildFiles += fileLinkCount;
                                sub1ttlChildFiles += fileLinkCount;
                                sub2ttlChildFiles += fileLinkCount;
                                if ((fileLinkCount != subFolder3.Files) || (subFolderCount != subFolder3.SubFolders))
                                {
                                    subFolder3.SubFolders = subFolderCount;
                                    subFolder3.Files = fileLinkCount;
                                    db.SaveChanges();
                                }

                                var subFolders4 = db.CategoryFolders.Where(f => f.Parent == subFolder3.Id).ToList();
                                ttlSubFolders += subFolders4.Count();
                                sub2ttlSubFolders += subFolders4.Count();
                                //sub3ttlSubFolders += subFolders4.Count();
                                foreach (CategoryFolder subFolder4 in subFolders4)
                                {
                                    fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subFolder4.Id).Count();
                                    subFolderCount = db.CategoryFolders.Where(f => f.Parent == subFolder4.Id).Count();

                                    ttlChildFiles += fileLinkCount;
                                    sub1ttlChildFiles += fileLinkCount;
                                    sub2ttlChildFiles += fileLinkCount;
                                    if ((fileLinkCount != subFolder4.Files) || (subFolderCount != subFolder4.SubFolders))
                                    {
                                        subFolder4.Files = fileLinkCount;
                                        subFolder4.SubFolders = subFolderCount;
                                        db.SaveChanges();
                                    }
                                }
                            }
                            if ((subFolder2.TotalChildFiles != sub2ttlChildFiles) || (subFolder2.TotalSubFolders != sub2ttlSubFolders))
                            {
                                subFolder2.TotalChildFiles = sub2ttlChildFiles;
                                subFolder2.TotalSubFolders = sub2ttlSubFolders;
                                db.SaveChanges();
                            }
                        }
                        if ((subFolder1.TotalChildFiles != sub1ttlChildFiles) || (subFolder1.TotalSubFolders != sub1ttlSubFolders))
                        {
                            subFolder1.TotalChildFiles = sub1ttlChildFiles;
                            subFolder1.TotalSubFolders = sub1ttlSubFolders;
                            db.SaveChanges();
                        }

                    }
                    if ((dbThisCatFolder.TotalChildFiles != ttlChildFiles) || (dbThisCatFolder.TotalSubFolders != ttlSubFolders))
                    {
                        dbThisCatFolder.TotalChildFiles = ttlChildFiles;
                        dbThisCatFolder.TotalSubFolders = ttlSubFolders;
                        db.SaveChanges();
                    }

                    countModel.FileCount = dbThisCatFolder.Files;
                    countModel.FolderCount = dbThisCatFolder.SubFolders;
                    countModel.TtlFileCount = dbThisCatFolder.TotalChildFiles;
                    countModel.TtlFolderCount = dbThisCatFolder.TotalSubFolders;
                }
                countModel.Success = "ok";
            }
            catch (Exception ex) { countModel.Success = Helpers.ErrorDetails(ex); }
            return countModel;
        }

        private void XXGoDeepRecurr(int parentNode)
        {
            List<int> childFolders = null;
            CategoryFolder dbThisCatFolder = null;
            using (var db = new OggleBoobleMySqlContext())
            {
                dbThisCatFolder = db.CategoryFolders.Where(f => f.Id == parentNode).First();
                int fileLinkCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == parentNode).Count();
                childFolders = db.CategoryFolders.Where(f => f.Parent == parentNode).Select(f => f.Id).ToList();
                childFolders.AddRange(db.StepChildren.Where(s => s.Parent == parentNode).Select(s => s.Child).ToList());
                if ((dbThisCatFolder.Files != fileLinkCount) || (dbThisCatFolder.SubFolders != childFolders.Count()))
                {
                    dbThisCatFolder.Files = fileLinkCount;
                    dbThisCatFolder.SubFolders = childFolders.Count();
                    db.SaveChanges();
                }
            }

            int thisLevelTotalFiles = 0;
            int thisLevelTotalSubDirs = 0;
            foreach (int childFolder in childFolders)
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    thisLevelTotalFiles += db.ImageFiles.Where(i => i.FolderId == childFolder).Count();
                    if (db.CategoryFolders.Where(i => i.Parent == childFolder).FirstOrDefault() != null)
                        thisLevelTotalSubDirs += db.CategoryFolders.Where(f => f.Parent == childFolder).Count();
                }
                //GoDeepRecurr(childFolder);
            }

            using (var db = new OggleBoobleMySqlContext())
            {
                if (db.CategoryFolders.Where(i => i.Parent == parentNode).FirstOrDefault() != null)
                {
                    thisLevelTotalFiles = db.CategoryFolders.Where(i => i.Parent == parentNode).Select(f => f.Files).Sum();
                    thisLevelTotalSubDirs = db.CategoryFolders.Where(f => f.Parent == parentNode).Select(f => f.SubFolders).Sum();
                }

                if ((dbThisCatFolder.TotalSubFolders != thisLevelTotalSubDirs) || (dbThisCatFolder.TotalChildFiles != thisLevelTotalFiles))
                {
                    dbThisCatFolder.TotalSubFolders = thisLevelTotalSubDirs;
                    dbThisCatFolder.TotalChildFiles = thisLevelTotalFiles;
                    db.SaveChanges();
                }
            }
        }
    }
}
