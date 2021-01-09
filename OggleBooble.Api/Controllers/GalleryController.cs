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
                    albumInfo.FileCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                    albumInfo.FolderCount = db.CategoryFolders.Where(f => f.Parent == folderId).Count();

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
                        dbFolderDetails = new FolderDetail() { FolderId = folderId };
                        db.FolderDetails.Add(dbFolderDetails);
                        db.SaveChanges();
                    }

                    if (dbFolderDetails.TotalChildFiles != null)
                    {
                        subFolderModel.TtlFileCount = dbFolderDetails.TotalChildFiles.Value;
                        subFolderModel.TtlFolderCount = dbFolderDetails.SubFolderCount ?? 0;
                        subFolderModel.Success = "ok";
                        return subFolderModel;
                    }
                    else
                    {
                        subFolderModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == folderId).Count();
                        var dbSubfolders = db.CategoryFolders.Where(f => f.Parent == folderId);
                        foreach (CategoryFolder subFolder in dbSubfolders)
                        {
                            GetSubFolderCountsRecurr(subFolderModel, subFolder);
                        }
                        SaveFileCounts(folderId, subFolderModel.TtlFileCount, subFolderModel.TtlFolderCount);
                    }
                }
                subFolderModel.Success = "ok";
            }
            catch (Exception ex) { subFolderModel.Success = Helpers.ErrorDetails(ex); }
            return subFolderModel;
        }
        private void GetSubFolderCountsRecurr(SubFolderCountModel subFolderModel, CategoryFolder vFolder)
        {
            subFolderModel.TtlFolderCount++;
            using (var db = new OggleBoobleMySqlContext())
            {
                if (vFolder.FolderType == "StepChild")
                    subFolderModel.TtlFileCount += db.CategoryImageLinks.Where(i => i.ImageCategoryId == vFolder.Id).Count();
                else
                    subFolderModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == vFolder.Id).Count();
                var dbSubfolders = db.CategoryFolders.Where(f => f.Parent == vFolder.Id);
                foreach (CategoryFolder subFolder in dbSubfolders)
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
        [Route("api/GalleryPage/GetStaticPage")]
        public SuccessModel GetStaticPage(int folderId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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
                        var slideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();
                        GetChildGalleryItems(folderId, slideshowItems, db);
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

        private void GetChildGalleryItems(int parentFolderId, List<VwSlideshowItem> slideshowItems, OggleBoobleMySqlContext db)
        {
            var subFolders = db.CategoryFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (CategoryFolder subFolder in subFolders)
            {
                slideshowItems.AddRange(db.VwSlideshowItems.Where(s => s.FolderId == subFolder.Id).ToList());
                GetChildGalleryItems(subFolder.Id, slideshowItems, db);
            }
        }

        [HttpGet]
        [Route("api/GalleryPage/UpdateFolderCounts")]
        public SubFolderCountModel UpdateFolderCounts(int folderId)
        {
            var updateFolderCountsModel = new SubFolderCountModel() { FolderId = folderId };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbUpdateFolderDetails = db.FolderDetails.Where(d => d.FolderId == folderId).First();
                    {

                        updateFolderCountsModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == folderId).Count();
                        var dbSubfolders = db.CategoryFolders.Where(f => f.Parent == folderId);
                        foreach (CategoryFolder subFolder in dbSubfolders)
                        {
                            UpdateFolderCountsRecurr(updateFolderCountsModel, subFolder);
                        }
                        int[] stepChildren = db.StepChildren.Where(s => s.Parent == folderId).Select(s => s.Child).ToArray();
                        foreach (int stepChild in stepChildren)
                        {
                            var dbStepFolder = db.CategoryFolders.Where(v => v.Id == stepChild).FirstOrDefault();
                            UpdateFolderCountsRecurr(updateFolderCountsModel, dbStepFolder);
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
            return updateFolderCountsModel;
        }
        private void UpdateFolderCountsRecurr(SubFolderCountModel subFolderModel, CategoryFolder subFolder)
        {
            subFolderModel.TtlFolderCount++;
            using (var db = new OggleBoobleMySqlContext())
            {
                if (subFolder.FolderType == "StepChild")
                    subFolderModel.TtlFileCount += db.CategoryImageLinks.Where(i => i.ImageCategoryId == subFolder.Id).Count();
                else
                {
                    subFolderModel.TtlFileCount += db.ImageFiles.Where(i => i.FolderId == subFolder.Id).Count();
                    var dbSubfolders = db.CategoryFolders.Where(f => f.Parent == subFolder.Id);
                    foreach (CategoryFolder subsubFolder in dbSubfolders)
                    {
                        //if ((subFolder.FolderType == "multiFolder") || (subFolder.FolderType == "singleParent"))
                        UpdateFolderCountsRecurr(subFolderModel, subsubFolder);
                    }
                }
            }
        }

        [HttpGet]
        [Route("api/GalleryPage/HardcoreFilecounts")]
        public string HardcoreFilecounts()
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var allFolders = db.CategoryFolders.ToList();
                    foreach (CategoryFolder catFolder in allFolders)
                    {
                        catFolder.Files = db.CategoryImageLinks.Where(l => l.ImageCategoryId == catFolder.Id).Count();
                        catFolder.SubFolders = db.CategoryFolders.Where(f => f.Parent == catFolder.Id).Count();
                        catFolder.SubFolders += db.StepChildren.Where(f => f.Parent == catFolder.Id).Count();
                        db.SaveChanges();
                    }
                    Rundown(0, db);
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        private void Rundown(int parentFolder, OggleBoobleMySqlContext db )
        {
            CategoryFolder dbParentFolder = db.CategoryFolders.Where(f => f.Id == parentFolder).First();
            var childFolders = db.CategoryFolders.Where(f => f.Parent == parentFolder).ToList();
            int totalChildFiles = 0;
            int totalSubFolders = 0;
            foreach (CategoryFolder childFolder in childFolders)
            {
                totalChildFiles += db.CategoryImageLinks.Where(l => l.ImageCategoryId == childFolder.Id).Count();
                totalSubFolders += db.CategoryFolders.Where(f => f.Parent == childFolder.Id).Count();
                totalSubFolders += db.StepChildren.Where(f => f.Parent == childFolder.Id).Count();
                Rundown(childFolder.Id, db);
            }
            if (totalSubFolders > 0)
            {
                dbParentFolder.TotalSubFolders = totalSubFolders;
                db.SaveChanges();
            }
            if (totalChildFiles > 0)
            {
                dbParentFolder.TotalChildFiles = totalChildFiles;
                db.SaveChanges();
            }
        }
    }
}
