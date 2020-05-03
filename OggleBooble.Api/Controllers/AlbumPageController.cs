using OggleBooble.Api.MsSqlDataContext;
using OggleBooble.Api.Models;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace OggleBooble.Api.Controllers
{
    public class AlbumPageController : ApiController
    {
        [HttpGet]
        public ImageLinksModel GetImageLinks(int folderId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var imageLinks = new ImageLinksModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    imageLinks.RootFolder = dbCategoryFolder.RootFolder;
                    imageLinks.FolderName = dbCategoryFolder.FolderName;

                    List<VwDirTree> vwTrees = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();
                    string folderImage = null;

                    List<TrackbackLink> trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        imageLinks.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.Site,
                            TrackBackLink = trackbackLink.TrackBackLink,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }

                    CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (categoryFolderDetails != null)
                        imageLinks.ExternalLinks = categoryFolderDetails.ExternalLinks;

                    foreach (VwDirTree vwTree in vwTrees)
                    {
                        if (vwTree.Link == null)
                            folderImage = Helpers.GetFirstImage(vwTree.Id);

                        //totalChildren = 0;
                        //int childFilesCount = GetTotalChildFiles(folderId);

                        imageLinks.SubDirs.Add(new CategoryTreeModel()
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
                    //string expectedLink = "";
                    //imageLinks.Files = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ToList();
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
                        imageLinks.Files.Add(vwLinkModel);
                    }
                }
                imageLinks.Success = "ok";
            }
            catch (Exception ex)
            {
                imageLinks.Success = Helpers.ErrorDetails(ex);
            }
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
            return imageLinks;
        }

        [HttpGet]
        public BreadCrumbModel Get(int folderId)
        {
            BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
                    {
                        FolderId = thisFolder.Id,
                        FolderName = thisFolder.FolderName,
                        ParentId = thisFolder.Parent,
                        IsInitialFolder = true
                    });
                    breadCrumbModel.RootFolder = thisFolder.RootFolder;
                    breadCrumbModel.FolderName = thisFolder.FolderName;

                    var parent = thisFolder.Parent;
                    while (parent > 1)
                    {
                        var parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
                        breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
                        {
                            FolderId = parentDb.Id,
                            FolderName = parentDb.FolderName,
                            IsInitialFolder = false
                        });
                        parent = parentDb.Parent;
                    }
                    breadCrumbModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                breadCrumbModel.Success = Helpers.ErrorDetails(ex);
            }
            return breadCrumbModel;
        }

        [HttpPost]
        public PageHitSuccessModel LogPageHit(PageHitRequestModel pageHitModel)
        {
            PageHitSuccessModel pageHitSuccessModel = new PageHitSuccessModel();
            try
            {
                using (var mdb = new MySqlDataContext.OggleBoobleMySqContext())
                {
                    var twoMinutesAgo = DateTime.Now.AddMinutes(-2);

                    var lastHit = mdb.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId && h.PageId == pageHitModel.PageId && h.Occured > twoMinutesAgo).FirstOrDefault();
                    if (lastHit == null)
                    {
                        mdb.PageHits.Add(new MySqlDataContext.PageHit()
                        {
                            VisitorId = pageHitModel.VisitorId,
                            PageId = pageHitModel.PageId,
                            Occured = DateTime.Now  //.AddMilliseconds(getrandom.Next())
                        });
                        mdb.SaveChanges();
                    }
                    pageHitSuccessModel.Success = "ok";
                    try
                    {
                        pageHitSuccessModel.PageHits = mdb.PageHits.Where(h => h.PageId == pageHitModel.PageId).Count();
                        var dbPageHitTotals = mdb.PageHitTotal.Where(h => h.PageId == pageHitModel.PageId).FirstOrDefault();
                        if (dbPageHitTotals != null)
                        {
                            pageHitSuccessModel.PageHits += dbPageHitTotals.Hits;
                        }
                        pageHitSuccessModel.UserPageHits = mdb.PageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();
                        pageHitSuccessModel.UserImageHits = mdb.ImageHits.Where(h => h.VisitorId == pageHitModel.VisitorId).Count();

                        MySqlDataContext.CategoryFolder categoryFolder = mdb.CategoryFolders.Where(f => f.Id == pageHitModel.PageId).FirstOrDefault();
                        if (categoryFolder != null)
                        {
                            pageHitSuccessModel.RootFolder = categoryFolder.RootFolder;
                            pageHitSuccessModel.PageName = categoryFolder.FolderName;

                            if (categoryFolder.Parent == -1)
                            {
                                pageHitSuccessModel.ParentName = "special";
                            }
                            else
                            {
                                MySqlDataContext.CategoryFolder parentFolder = mdb.CategoryFolders.Where(f => f.Id == categoryFolder.Parent).FirstOrDefault();
                                if (parentFolder != null)
                                    pageHitSuccessModel.ParentName = parentFolder.FolderName;
                            }
                        }
                        else
                            pageHitSuccessModel.PageName = "Not Found";
                    }
                    catch (Exception ex)
                    {
                        pageHitSuccessModel.Success = "unrelated to insert, but: " + Helpers.ErrorDetails(ex);
                    }
                }
            }
            catch (Exception ex)
            {
                string err = Helpers.ErrorDetails(ex);
                if (err.Contains("Object reference not set to an instance of an object."))
                {
                    err = "Null reference. PageId: " + pageHitModel.PageId + " visId: " + pageHitModel.VisitorId;
                }
                pageHitSuccessModel.Success = err;

            }
            return pageHitSuccessModel;
        }
    }
}
