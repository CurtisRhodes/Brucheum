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
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpGet]
        [Route("api/GalleryPage/GetAlbumImages")]
        public AlbumImagesModel GetAlbumImages(int folderId)
        {
            var imagesModel = new AlbumImagesModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    List<string> subFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.FolderName).ToList();
                    // SUB FOLDERS
                    var dbFolderRows = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();
                    foreach (VwDirTree row in dbFolderRows)
                    {
                        imagesModel.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            FolderId = row.Id,
                            DirectoryName = row.FolderName,
                            ParentId = row.Parent,
                            FileCount = row.FileCount,
                            //SubDirCount = db.CategoryFolders.Where(f => f.Parent == row.Id).Count(),
                            //ChildFiles = row.ChildFiles,
                            IsStepChild = row.IsStepChild,
                            FolderImage = row.FolderImage
                        });
                    }

                    // IMAGES
                    imagesModel.Files = db.VwLinks.Where(v => v.Id == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                }
                imagesModel.Success = "ok";
            }
            catch (Exception ex)
            {
                imagesModel.Success = Helpers.ErrorDetails(ex);
            }
            return imagesModel;
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
                    var dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    albumInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumInfo.FolderName = dbCategoryFolder.FolderName;

                    List<string> subFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.FolderName).ToList();
                    var folderTypeModel = new FolderTypeModel()   // 1.618
                    {
                        RootFolder = dbCategoryFolder.RootFolder,
                        ContainsRomanNumeral = Helpers.ContainsRomanNumeral(dbCategoryFolder.FolderName),
                        ContainsRomanNumeralChildren = Helpers.ContainsRomanNumeralChildren(subFolders),
                        HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0,
                        HasSubFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Count() > 0,
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

                    MySqlDataContext.CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (categoryFolderDetails != null) albumInfo.ExternalLinks = categoryFolderDetails.ExternalLinks;

                    #region BreadCrumbs
                    var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
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
                        var parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
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
                    MySqlDataContext.CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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

        [HttpPut]
        [Route("api/GalleryPage/UpdateFolderImage")]
        public string UpdateFolderImage(string linkId, int folderId, string level)
        {
            string success = "";
            try
            {
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    var dbCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First();
                    if (level == "folder")
                    {
                        dbCategoryFolder.FolderImage = linkId;
                    }
                    else
                    {
                        var dbParentCategoryFolder = mdb.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                        dbParentCategoryFolder.FolderImage = linkId;
                    }
                    mdb.SaveChanges();
                }
                using (var db = new OggleBoobleMSSqlContext())
                {
                    MSSqlDataContext.CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (level == "folder")
                    {
                        dbCategoryFolder.FolderImage = linkId;
                    }
                    else
                    {
                        MSSqlDataContext.CategoryFolder dbParentCategoryFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
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
                    MySqlDataContext.CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
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

        SlideshowItemsModel slideshowItemModel = null;
        [HttpGet]
        [Route("api/GalleryPage/GetSlideShowItems")]
        public SlideshowItemsModel GetSlideShowItems(int folderId, bool includeSubFolders)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            slideshowItemModel = new SlideshowItemsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId " + folderId + " not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = categoryFolder.FolderName;
                    slideshowItemModel.RootFolder = categoryFolder.RootFolder;

                    //vwSlideshowItem x = new vwSlideshowItem();
                    // List<VwSlideshowItem> x = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();

                    slideshowItemModel.SlideshowItems = db.VwSlideshowItems.Where(s => s.FolderId == folderId).ToList();

                    //slideshowItemModel.SlideshowItems = db.Database.SqlQuery<VwSlideshowItem>(
                    //    "select row_number() over(order by SortOrder, FolderId, LinkId) 'Index', * from OggleBooble.vwSlideshowItems " +
                    //    "where FolderId = " + folderId).ToList();

                    //slideshowItemModel.SlideshowItems = db.Database.SqlQuery<VwSlideshowItem>(
                    //"select row_number() over(order by SortOrder, FolderId, LinkId) 'Index', * from OggleBooble.vwSlideshowItems " +
                    //"where FolderId = " + folderId).ToList();

                    if (includeSubFolders)
                    {
                        GetChildGalleryItems(folderId, db);
                    }
                }
                slideshowItemModel.Success = "ok";
            }
            catch (Exception ex)
            {
                slideshowItemModel.Success = Helpers.ErrorDetails(ex);
            }
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("GetImageFiles took: " + timer.Elapsed);
            return slideshowItemModel;
        }

        private void GetChildGalleryItems(int parentFolderId, OggleBoobleMySqlContext db)
        {
            slideshowItemModel.SlideshowItems.AddRange(db.Database.SqlQuery<VwSlideshowItem>(
                "select row_number() over(order by LinkId) 'Index', * from OggleBooble.vwSlideshowItems " +
                "where ImageParentId = " + parentFolderId).ToList());

            var subFolders = db.CategoryFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (MySqlDataContext.CategoryFolder subFolder in subFolders)
            {
                GetChildGalleryItems(subFolder.Id, db);
            }
        }
    }
}
