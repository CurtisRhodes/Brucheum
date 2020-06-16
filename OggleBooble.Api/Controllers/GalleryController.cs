using OggleBooble.Api.MySqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class GalleryPageController : ApiController
    {
        [HttpGet]
        [Route("api/GalleryPage/GetAllAlbumPageInfo")]
        public GetAlbumInfoSuccessModel GetAllAlbumPageInfo(string visitorId, int folderId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var albumInfo = new GetAlbumInfoSuccessModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    albumInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumInfo.FolderName = dbCategoryFolder.FolderName;

                    List<string> subFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.FolderName).ToList();
                    var folderTypeModel = new FolderTypeModel()
                    {
                        RootFolder = dbCategoryFolder.RootFolder,
                        ContainsRomanNumeral = Helpers.ContainsRomanNumeral(dbCategoryFolder.FolderName),
                        ContainsRomanNumeralChildren = Helpers.ContainsRomanNumeralChildren(subFolders),
                        HasImages = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0,
                        HasSubFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Count() > 0,
                    };
                    albumInfo.FolderType = Helpers.DetermineFolderType(folderTypeModel);

                    var vwTrees = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();

                    //CategoryTreeModel

                    int subDirCount = 0;
                    int childFiles = 0;
                    foreach (VwDirTree vwTree in vwTrees)
                    {
                        var dbChildFiles = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                        subDirCount = dbChildFiles.Count();
                        subDirCount += db.StepChildren.Where(s => s.Parent == folderId).Count();
                        var childFolderIds = dbChildFiles.Select(c => c.Id).ToList();
                        childFiles = db.CategoryImageLinks.Where(l => childFolderIds.Contains(l.ImageCategoryId)).Count();

                        albumInfo.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            FolderId = vwTree.Id,
                            DirectoryName = vwTree.FolderName,
                            ParentId = vwTree.Parent,
                            FileCount = vwTree.FileCount,
                            SubDirCount = subDirCount,
                            ChildFiles = childFiles,
                            //FileCount = childFilesCount,
                            //Length = vwTree.FileCount + vwTree.TotalFiles + vwTree.GrandTotalFiles,
                            IsStepChild = vwTree.IsStepChild,
                            FileName=vwTree.FileName
                            //Link = vwTree.Link
                        });
                    }

                    List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                    foreach (VwLink vwLink in vwLinks)
                    {
                        VwLinkModel vwLinkModel = new VwLinkModel()
                        {
                            FolderId = vwLink.FolderId,
                            FolderName = vwLink.FolderName,
                            ParentName = vwLink.ParentName,
                            FileName = vwLink.FileName,
                            RootFolder = vwLink.RootFolder,
                            Orientation = vwLink.Orientation,
                            LinkId = vwLink.LinkId,
                            SortOrder = vwLink.SortOrder
                        };
                        albumInfo.Files.Add(vwLinkModel);
                    }


                    List<TrackbackLink> trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        albumInfo.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.SiteCode,
                            TrackBackLink = trackbackLink.Href,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (categoryFolderDetails != null)
                        albumInfo.ExternalLinks = categoryFolderDetails.ExternalLinks;
                    //BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
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
                }

                //albumInfo.LastModified = GetLastModified(folderId);
                using (var mdb = new OggleBoobleMySqlContext())
                {
                    albumInfo.PageHits = mdb.PageHits.Where(h => h.PageId == folderId).Count();
                    var dbPageHitTotals = mdb.PageHitTotal.Where(h => h.PageId == folderId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        albumInfo.PageHits += dbPageHitTotals.Hits;
                    }
                    CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    //if (categoryFolder != null) albumInfo.RootFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First().RootFolder;
                    albumInfo.UserPageHits = mdb.PageHits.Where(h => h.VisitorId == visitorId).Count();
                    albumInfo.UserImageHits = mdb.ImageHits.Where(h => h.VisitorId == visitorId).Count();
                }
                albumInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                albumInfo.Success = Helpers.ErrorDetails(ex);
            }
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return albumInfo;
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
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId " + folderId + " not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = categoryFolder.FolderName;
                    slideshowItemModel.RootFolder = categoryFolder.RootFolder;

                    //vwSlideshowItem x = new vwSlideshowItem();

                    slideshowItemModel.SlideshowItems = db.Database.SqlQuery<VwSlideshowItem>(
                        "select row_number() over(order by SortOrder, FolderId, LinkId) 'Index', * from OggleBooble.vwSlideshowItems " +
                        "where FolderId = " + folderId).ToList();

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

            List<CategoryFolder> subFolders = db.CategoryFolders.Where(f => f.Parent == parentFolderId).ToList();
            foreach (CategoryFolder subFolder in subFolders)
            {
                GetChildGalleryItems(subFolder.Id, db);
            }
        }
    }
}
