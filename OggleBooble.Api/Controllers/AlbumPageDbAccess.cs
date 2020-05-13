using OggleBooble.Api.MsSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class AlbumPageController : ApiController
    {
        [HttpGet]
        [Route("api/AlbumPage/GetAllAlbumPageInfo")]
        public GetAlbumInfoSuccessModel GetAllAlbumPageInfo(string visitorId, int folderId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var albumInfo = new GetAlbumInfoSuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    albumInfo.RootFolder = dbCategoryFolder.RootFolder;
                    albumInfo.FolderName = dbCategoryFolder.FolderName;

                    List<VwDirTree> vwTrees = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();
                    foreach (VwDirTree vwTree in vwTrees)
                    {
                        //if (vwTree.Link == null)
                        //    folderImage = Helpers.GetFirstImage(vwTree.Id);
                        //totalChildren = 0;
                        //int childFilesCount = GetTotalChildFiles(folderId);

                        albumInfo.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            //DanniPath = folderId,
                            FolderId = vwTree.Id,
                            DirectoryName = vwTree.FolderName,
                            ParentId = vwTree.Parent,
                            SubDirCount = vwTree.SubDirCount,
                            FileCount = vwTree.FileCount,
                            ChildFiles = vwTree.ChildFiles,
                            //FileCount = childFilesCount,
                            //Length = vwTree.FileCount + vwTree.TotalFiles + vwTree.GrandTotalFiles,
                            IsStepChild = vwTree.IsStepChild,
                            Link = vwTree.Link
                        });
                    }
                    List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.Link).ToList();
                    foreach (VwLink vwLink in vwLinks)
                    {
                        VwLinkModel vwLinkModel = new VwLinkModel()
                        {
                            FolderId = vwLink.FolderId,
                            FolderName = vwLink.FolderName,
                            Link = vwLink.Link,
                            LinkId = vwLink.LinkId,
                            LinkCount = vwLink.LinkCount,
                            Orientation = vwLink.Orientation,
                            RootFolder = vwLink.RootFolder,
                            SortOrder = vwLink.SortOrder,
                            ParentName = vwLink.ParentName
                        };
                        albumInfo.Files.Add(vwLinkModel);
                    }

                    List<TrackbackLink> trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        albumInfo.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.Site,
                            TrackBackLink = trackbackLink.TrackBackLink,
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

                albumInfo.LastModified = GetLastModified(folderId);
                using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                {
                    albumInfo.PageHits = mdb.PageHits.Where(h => h.PageId == folderId).Count();
                    var dbPageHitTotals = mdb.PageHitTotal.Where(h => h.PageId == folderId).FirstOrDefault();
                    if (dbPageHitTotals != null)
                    {
                        albumInfo.PageHits += dbPageHitTotals.Hits;
                    }
                    MySqlDataContext.CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder != null)
                        albumInfo.RootFolder = mdb.CategoryFolders.Where(f => f.Id == folderId).First().RootFolder;
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

        private string GetLastModified(int pageId)
        {
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                DateTime? lastModified = (from i in db.ImageLinks
                                          where i.FolderLocation == pageId
                                          select i.LastModified).Max();

                if (lastModified == null)
                {

                    lastModified = (from i in db.ImageLinks
                                    join f in db.CategoryFolders on i.FolderLocation equals f.Parent
                                    where i.FolderLocation == pageId
                                    select i.LastModified).Max();

                    if (lastModified == null)
                        lastModified = (from i in db.ImageLinks
                                        join f in db.CategoryFolders on i.FolderLocation equals f.Parent
                                        where i.FolderLocation == pageId
                                        select i.LastModified).Max();

                }
                if (lastModified == null)
                    lastModified = DateTime.MinValue;

                return lastModified.Value.ToShortDateString();
            }
        }

        [HttpGet]
        [Route("api/AlbumPage/GetStaticPage")]
        public SuccessModel GetStaticPage(int folderId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
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
    }

    [EnableCors("*", "*", "*")]
    public class SlideshowController : ApiController
    {
        SlideshowItemsModel slideshowItemModel = null;
        [HttpGet]
        public SlideshowItemsModel GetSlideShowItems(int folderId, bool includeSubFolders)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            slideshowItemModel = new SlideshowItemsModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (categoryFolder == null)
                    {
                        slideshowItemModel.Success = "folderId " + folderId + " not found";
                        return slideshowItemModel;
                    }
                    slideshowItemModel.FolderName = categoryFolder.FolderName;
                    slideshowItemModel.RootFolder = categoryFolder.RootFolder;

                    slideshowItemModel.SlideshowItems = db.Database.SqlQuery<vwSlideshowItem>(
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
            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return slideshowItemModel;
        }

        private void GetChildGalleryItems(int parentFolderId, OggleBoobleContext db)
        {
            slideshowItemModel.SlideshowItems.AddRange(db.Database.SqlQuery<vwSlideshowItem>(
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
