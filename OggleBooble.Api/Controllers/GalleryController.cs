using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using OggleBooble.Api.MSSqlDataContext;

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
        public AlbumImagesModel GetAlbumImages(int folderId)
        {
            var albumImageInfo = new AlbumImagesModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    albumImageInfo.RootFolder = dbCategoryFolder.RootFolder;
                    List<string> subFolders = db.VirtualFolders.Where(f => f.Parent == folderId).Select(f => f.FolderName).ToList();
                    // SUB FOLDERS
                    var dbFolderRows = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();
                    foreach (VwDirTree row in dbFolderRows)
                    {
                        albumImageInfo.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            FolderId = row.Id,
                            DirectoryName = row.FolderName,
                            ParentId = row.Parent,
                            FileCount = row.FileCount,
                            IsStepChild = row.IsStepChild,
                            FolderImage = row.FolderImage
                        }); 
                    }

                    // IMAGES
                    albumImageInfo.ImageLinks = db.VwLinks.Where(v => v.Id == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                }
                albumImageInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                albumImageInfo.Success = Helpers.ErrorDetails(ex);
            }
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
                    List<string> subFolderNames = db.VirtualFolders.Where(f => f.Parent == folderId).Select(f=>f.FolderName).ToList();
                    var folderTypeModel = new FolderTypeModel()   // 1.618  
                    {
                        RootFolder = dbCategoryFolder.RootFolder,
                        ContainsRomanNumeral = Helpers.ContainsRomanNumeral(dbCategoryFolder.FolderName),
                        ContainsNonRomanNumeralChildren = Helpers.ContainsNonRomanNumeralChildren(subFolderNames),
                        HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0,
                        HasSubFolders = db.VirtualFolders.Where(f => f.Parent == folderId).Count() > 0,
                    };
                    albumInfo.FolderType = Helpers.DetermineFolderType(folderTypeModel);
                    var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (MySqlDataContext.TrackbackLink trackbackLink in trackbackLinks)
                    {
                        albumInfo.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.SiteCode,
                            TrackBackLink = trackbackLink.Href,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    //MySqlDataContext.CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    //if (categoryFolderDetails != null) albumInfo.ExternalLinks = categoryFolderDetails.ExternalLinks;
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


            var subFolderCounts = new SubFolderCountModel() { FolderId = folderId };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    GetDeepFileCount(folderId, subFolderCounts, db);
                    SaveFileCounts(subFolderCounts);
                    subFolderCounts.Success = "ok";
                }
            }
            catch (Exception ex) { 
                subFolderCounts.Success = Helpers.ErrorDetails(ex); 
            }
            return subFolderCounts;
        }
        private void GetDeepFileCount(int parentId, SubFolderCountModel subFolderModel, OggleBoobleMySqlContext db)
        {
            var subDirs = db.VirtualFolders.Where(f => f.Parent == parentId).ToList();
            foreach (VirtualFolder subDir in subDirs)
            {
                var thisSubFolder = new SubFolderCountItem();
                thisSubFolder.SubFolderId = subDir.Id;
                thisSubFolder.ParentId = parentId;
                thisSubFolder.SubFolderCount = subDirs.Count();
                thisSubFolder.FileCount = db.CategoryImageLinks.Where(l => l.ImageCategoryId == subDir.Id).Count();

                if (parentId == subFolderModel.FolderId)
                {
                    subFolderModel.TotalChildFiles += thisSubFolder.FileCount;
                }
                else
                {
                    var parent = subFolderModel.SubFolderCountItems.Find(i => i.ParentId == parentId);
                    if (parent != null)
                    {
                        parent.TotalChildFiles += thisSubFolder.FileCount;
                        //while (parent.SubFolderId != subFolderModel.FolderId)
                        //{
                        //    parent = subFolderModel.SubFolderCountItems.Find(i => i.ParentId == parent.ParentId);

                        //    parent.TotalChildFiles += thisSubFolder.FileCount;
                        //}
                    }
                }
                var subsubFolders = db.VirtualFolders.Where(f => f.Parent == subDir.Id).ToList();
                foreach (VirtualFolder subsubFolder in subsubFolders)
                {
                    thisSubFolder.ChildFiles += db.CategoryImageLinks.Where(l => l.ImageCategoryId == subsubFolder.Id).Count();
                    GetDeepFileCount(subsubFolder.Id, subFolderModel, db);
                }
                subFolderModel.SubFolderCountItems.Add(thisSubFolder);
            }
        }

        private void SaveFileCounts(SubFolderCountModel countModel) {
            int rootFolder = countModel.FolderId;
            int ttl1 = 0;
            using (var db = new OggleBoobleMySqlContext())
            {
                var childFolders = db.VirtualFolders.Where(f => f.Parent == rootFolder).ToList();
                foreach (var childFolder in childFolders) 
                {
                    ttl1 += countModel.SubFolderCountItems.Find(c => c.SubFolderId == childFolder.Id).FileCount;                
                }
                var dbFolderDetail = db.FolderDetails.Where(f => f.FolderId == rootFolder).FirstOrDefault();
                if (dbFolderDetail == null)
                { 
                //db.FolderDetails.Add(new FolderDetail() { FolderId=rootFolder, })
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
                using (var db = new OggleBoobleMSSqlContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (level == "folder")
                    {
                        dbCategoryFolder.FolderImage = linkId;
                    }
                    else
                    {
                        CategoryFolder dbParentCategoryFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                        dbParentCategoryFolder.FolderImage = linkId;
                    }
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
