using OggleBooble.Api.MySqlDataContext;
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
            var subFolderModel = new SubFolderCountModel() { FolderId = folderId };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolderDetails = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetails == null)
                    {
                        db.FolderDetails.Add(new FolderDetail() { FolderId = folderId });
                        db.SaveChanges();
                    }

                    if (dbFolderDetails.TotalChildFiles != null)
                    {
                        subFolderModel.TtlFileCount = dbFolderDetails.TotalChildFiles.Value;
                        subFolderModel.TtlFolderCount = dbFolderDetails.SubFolderCount ?? 0;
                        UpdateFolderCounts(folderId);
                        subFolderModel.Success = "ok";
                        return subFolderModel;
                    }
                    else
                    {
                        subFolderModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == folderId).Count();
                        var dbSubfolders = db.VirtualFolders.Where(f => f.Parent == folderId);
                        foreach (VirtualFolder subFolder in dbSubfolders)
                        {
                            GetSubFolderCountsRecurr(subFolderModel, subFolder);
                            //var rootFolder = db.VirtualFolders.Where(f => f.Parent == folderId).First();
                            //SaveFileCounts(folderId, subFolderModel.TtlFileCount, subFolderModel.TtlFolderCount);
                        }
                    }
                }
                subFolderModel.Success = "ok";
            }
            catch (Exception ex) { subFolderModel.Success = Helpers.ErrorDetails(ex); }
            return subFolderModel;
        }
        private void GetSubFolderCountsRecurr(SubFolderCountModel subFolderModel, VirtualFolder vFolder)
        {
            subFolderModel.TtlFolderCount++;
            using (var db = new OggleBoobleMySqlContext())
            {
                if (vFolder.FolderType == "StepChild")
                    subFolderModel.TtlFileCount += db.CategoryImageLinks.Where(i => i.ImageCategoryId == vFolder.Id).Count();
                else
                    subFolderModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == vFolder.Id).Count();
                var dbSubfolders = db.VirtualFolders.Where(f => f.Parent == vFolder.Id);
                foreach (VirtualFolder subFolder in dbSubfolders)
                {
                    //if ((subFolder.FolderType == "multiFolder") || (subFolder.FolderType == "singleParent"))
                    GetSubFolderCountsRecurr(subFolderModel, subFolder);
                }
            }
        }

        private string SaveFileCounts(int folderId, int fileCount, int folderCount)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetail == null)
                    {
                        dbFolderDetail = new FolderDetail() { FolderId = folderId, TotalChildFiles = fileCount, SubFolderCount = folderCount };
                        db.FolderDetails.Add(dbFolderDetail);
                    }
                    else
                    {
                        dbFolderDetail.TotalChildFiles = fileCount;
                        dbFolderDetail.SubFolderCount = folderCount;
                    }
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
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
                    slideshowItemModel.SlideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                    if (includeSubFolders)
                    {
                        var unsortedList = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                        GetChildGalleryItems(folderId, unsortedList, db);
                        slideshowItemModel.SlideshowItems = unsortedList.ToList();
                    }
                    else
                    {
                        slideshowItemModel.SlideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).OrderBy(s => s.SortOrder).ToList();
                    }
                    var categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId " + folderId + " not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = categoryFolder.FolderName;
                    slideshowItemModel.RootFolder = categoryFolder.RootFolder;
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

        private void GetChildGalleryItems(int parentFolderId, List<VwSlideshowItem> unsortedList, OggleBoobleMySqlContext db)
        {
            var subFolders = db.VirtualFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (VirtualFolder subFolder in subFolders)
            {
                unsortedList.AddRange(db.VwSlideshowItems.Where(s => s.FolderId == subFolder.Id).ToList());
                GetChildGalleryItems(subFolder.Id, unsortedList, db);
            }
        }

        private void UpdateFolderCounts(int folderId)
        {
            var updateFolderCountsModel = new SubFolderCountModel() { FolderId = folderId };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbUpdateFolderDetails = db.FolderDetails.Where(d => d.FolderId == folderId).First();
                    {
                        updateFolderCountsModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == folderId).Count();
                        var dbSubfolders = db.VirtualFolders.Where(f => f.Parent == folderId);
                        foreach (VirtualFolder subFolder in dbSubfolders)
                        {
                            UpdateFolderCountsRecurr(updateFolderCountsModel, subFolder);
                        }

                        var dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == folderId).First();
                        dbFolderDetail.TotalChildFiles = updateFolderCountsModel.TtlFileCount;
                        dbFolderDetail.SubFolderCount = updateFolderCountsModel.TtlFolderCount;
                        db.SaveChanges();
                    }
                }
                updateFolderCountsModel.Success = "ok";
            }
            catch (Exception ex) { updateFolderCountsModel.Success = Helpers.ErrorDetails(ex); }
        }
        private void UpdateFolderCountsRecurr(SubFolderCountModel subFolderModel, VirtualFolder subFolder)
        {
            subFolderModel.TtlFolderCount++;
            using (var db = new OggleBoobleMySqlContext())
            {
                if (subFolder.FolderType == "StepChild")
                    subFolderModel.TtlFileCount += db.CategoryImageLinks.Where(i => i.ImageCategoryId == subFolder.Id).Count();
                else
                    subFolderModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == subFolder.Id).Count();
                var dbSubfolders = db.VirtualFolders.Where(f => f.Parent == subFolder.Id);
                foreach (VirtualFolder subsubFolder in dbSubfolders)
                {
                    //if ((subFolder.FolderType == "multiFolder") || (subFolder.FolderType == "singleParent"))
                    UpdateFolderCountsRecurr(subFolderModel, subsubFolder);
                }
            }
        }
    }
}




