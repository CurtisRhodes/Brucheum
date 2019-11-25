//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Web.Http;
//using System.Web.Http.Cors;
//using WebApi.Models;
//using System.Xml;
////using WebApi.OggleBoobleSqlContext;
//using System.Data.SqlClient;
//using WebApi.MySqDataContext;
////using System.IO;
////using System.Net;
////using System.Text;

//namespace WebApi2
//{
//    [EnableCors("*", "*", "*")]
//    public class ImagePageController : ApiController
//    {
//        // used by ImagePage
//        [HttpGet]
//        public ImageLinksModel GetImageLinks(int folderId)
//        {
//            var timer = new System.Diagnostics.Stopwatch();
//            timer.Start();
//            var imageLinks = new ImageLinksModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
//                    imageLinks.RootFolder = dbCategoryFolder.RootFolder;
//                    imageLinks.FolderName = dbCategoryFolder.FolderName;

//                    List<VwDirTree> vwTrees = db.VwDirTrees.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.FolderName).ToList();
//                    string folderImage = null;

//                    foreach (VwDirTree vwTree in vwTrees)
//                    {
//                        if (vwTree.Link == null)
//                            folderImage = WebApi.Helpers.GetFirstImage(vwTree.Id);

//                        imageLinks.SubDirs.Add(new CategoryTreeModel()
//                        {
//                            LinkId = Guid.NewGuid().ToString(),
//                            //DanniPath = folderId,
//                            FolderId = vwTree.Id,
//                            DirectoryName = vwTree.FolderName,
//                            ParentId = vwTree.Parent,
//                            SubDirCount = vwTree.SubDirCount,
//                            FileCount = vwTree.FileCount,
//                            //Length = vwTree.FileCount + vwTree.TotalFiles + vwTree.GrandTotalFiles,
//                            IsStepChild = vwTree.IsStepChild,
//                            Link = vwTree.Link
//                        });
//                    }
//                    //string expectedLink = "";
//                    List<VwLink> vwLinks  = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ToList();
//                    foreach (VwLink vwLink in vwLinks)
//                    {
//                        VwLinkModel vwLinkModel = new VwLinkModel()
//                        {
//                            FolderId = vwLink.FolderId,
//                            FolderName = vwLink.FolderName,
//                            Link = vwLink.Link,
//                            LinkId = vwLink.LinkId,
//                            LinkCount = vwLink.LinkCount,
//                            Orientation = vwLink.Orientation,
//                            RootFolder = vwLink.RootFolder,
//                            SortOrder = vwLink.SortOrder,
//                            ParentName = vwLink.ParentName
//                        };
//                        imageLinks.Files.Add(vwLinkModel);
//                    }
//                    //imageLinks.Files = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ToList();
//                }
//                imageLinks.Success = "ok";
//            }
//            catch (Exception ex)
//            {
//                imageLinks.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            timer.Stop();
//            System.Diagnostics.Debug.WriteLine("GetImageLinks took: " + timer.Elapsed);
//            return imageLinks;
//        }

//        [HttpGet]
//        public CategoryImageModel GetAllImageLinks(int topFolderId, bool showAll)
//        {
//            var imageLinks = new CategoryImageModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    GetAllImagesRecurr(imageLinks, topFolderId, db);
//                }
//                imageLinks.Success = "ok";
//            }
//            catch (Exception ex)
//            {
//                imageLinks.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return imageLinks;
//        }

//        private void GetAllImagesRecurr(CategoryImageModel imageLinks, int folderId, OggleBoobleMySqContext db)
//        {
//            List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
//            foreach (VwLink vwLink in vwLinks)
//            {
//                VwLinkModel vwLinkModel = new VwLinkModel()
//                {
//                    FolderId = vwLink.FolderId,
//                    FolderName = vwLink.FolderName,
//                    Link = vwLink.Link,
//                    LinkId = vwLink.LinkId,
//                    LinkCount = vwLink.LinkCount,
//                    Orientation = vwLink.Orientation,
//                    RootFolder = vwLink.RootFolder,
//                    SortOrder = vwLink.SortOrder,
//                    ParentName = vwLink.ParentName
//                };
//                imageLinks.Files.Add(vwLinkModel);
//            }
//            List<CategoryFolder> childFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
//            foreach (CategoryFolder subDir in childFolders)
//            {
//                GetAllImagesRecurr(imageLinks, subDir.Id, db);
//            }

//            //imageLinks.Files = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
//            //int[] childFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
//            //foreach (int childFolderId in childFolders)
//            //{
//            //    imageLinks.Files.AddRange(db.VwLinks.Where(v => v.FolderId == childFolderId).ToList());
//            //}
//        }

//        [HttpPatch]
//        public LinksModel GetLinks(string linkId)
//        {
//            var links = new LinksModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    links.Links =
//                        (from l in db.CategoryImageLinks
//                         join f in db.CategoryFolders on l.ImageCategoryId equals f.Id
//                         join p in db.CategoryFolders on f.Parent equals p.Id
//                         where l.ImageLinkId == linkId
//                         select (new LinkModel()
//                         {
//                             FolderId = f.Id,
//                             PathName = p.FolderName + "/" + f.FolderName
//                         })).ToList();
//                }
//                links.Success = "ok";
//            }
//            catch (Exception ex)
//            {
//                links.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return links;
//        }

//        [HttpPut]
//        public string UpdateSortOrder(List<SortOrderItem> SortOrderItems) 
//        {
//            string success = "";
//            using (var db = new OggleBoobleMySqContext())
//            {
//                foreach (SortOrderItem item in SortOrderItems)
//                {
//                    if (item.InputValue != 99)
//                    {
//                        CategoryImageLink link = db.CategoryImageLinks.Where(l => l.ImageCategoryId == item.PageId && l.ImageLinkId == item.ItemId).FirstOrDefault();
//                        if (link != null)
//                            link.SortOrder = item.InputValue;
//                    }
//                }
//                db.SaveChanges();
//                success = "ok";
//            }
//            return success;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class BreadCrumbsController : ApiController
//    {
//        [HttpGet]
//        public BreadCrumbModel Get(int folderId)
//        {
//            BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
//            try
//            {
//                                using (var db = new OggleBoobleMySqContext())
//                {
//                    var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
//                    breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
//                    {
//                        FolderId = thisFolder.Id,
//                        FolderName = thisFolder.FolderName,
//                        ParentId = thisFolder.Parent,
//                        IsInitialFolder = true
//                    });
//                    breadCrumbModel.RootFolder = thisFolder.RootFolder;
//                    breadCrumbModel.FolderName = thisFolder.FolderName;

//                    var parent = thisFolder.Parent;
//                    while (parent > 1)
//                    {
//                        var parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
//                        breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
//                        {
//                            FolderId = parentDb.Id,
//                            FolderName = parentDb.FolderName,
//                            IsInitialFolder = false
//                        });
//                        parent = parentDb.Parent;
//                    }
//                    breadCrumbModel.Success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                breadCrumbModel.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return breadCrumbModel;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class AlbumPageController : ApiController
//    {
//        [HttpGet]
//        public SuccessModel GetStaticPage(int folderId)
//        {
//            SuccessModel successModel = new SuccessModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
//                    string staticPageFileName = WebApi.Helpers.GetCustomStaticFolderName(folderId, dbCategoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", ""));
//                    successModel.ReturnValue = "http://ogglebooble.com/static/" + dbCategoryFolder.RootFolder + "/" + staticPageFileName + ".html";
//                    successModel.Success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                successModel.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return successModel;
//        }

//        [HttpPatch]
//        public SuccessModel GetRootFolder(int folderId)
//        {
//            SuccessModel successModel = new SuccessModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
//                    successModel.ReturnValue = dbCategoryFolder.RootFolder;
//                    successModel.Success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                successModel.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return successModel;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class CarouselController : ApiController
//    {
//        [HttpGet]
//        public CarouselInfoModel GetLinks(string root, int skip, int take)
//        {
//            CarouselInfoModel carouselInfo = new CarouselInfoModel();
//            try
//            {
//                var timer = new System.Diagnostics.Stopwatch();
//                timer.Start();
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    carouselInfo.Links = db.Database.SqlQuery<CarouselItemModel>(
//                        "select f.RootFolder, f.Id FolderId, p.Id ParentId, g.Id LinkId, f.FolderName, p.FolderName FolderPath, g.Link " +
//                        "from OggleBooble.CategoryImageLink c " +
//                        "join OggleBooble.CategoryFolder f on c.ImageCategoryId = f.Id " +
//                        "join OggleBooble.CategoryFolder p on f.Parent = p.Id " +
//                        "join OggleBooble.ImageLink g on c.ImageLinkId = g.Id " +
//                        "where f.RootFolder = @param1", new SqlParameter("param1", root)).OrderBy(m => m.LinkId).Skip(skip).Take(take).ToList();
//                }
//                carouselInfo.FolderCount = carouselInfo.Links.GroupBy(l => l.FolderName).Count();
//                timer.Stop();
//                System.Diagnostics.Debug.WriteLine("Select " + take + " from vLinks took: " + timer.Elapsed);
//                carouselInfo.Success = "ok";
//            }
//            catch (Exception ex)
//            {
//                carouselInfo.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return carouselInfo;
//        }

//        [HttpGet]
//        public SuccessModel VerifyConnection()
//        {
//            var timer = new System.Diagnostics.Stopwatch();
//            timer.Start();
//            SuccessModel successModel = new SuccessModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    var test = db.CategoryFolders.Count().ToString();
//                    successModel.Success = "ok";
//                }
//                timer.Stop();

//                successModel.ReturnValue = timer.Elapsed.ToString();
//                System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
//            }
//            catch (Exception ex)
//            {
//                successModel.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return successModel;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class DirTreeController : ApiController
//    {
//        // dashboard -- returns a fully loaded dir tree
//        [HttpGet]
//        public CategoryTreeModel RebuildCatTree(int root)
//        {
//            var timer = new System.Diagnostics.Stopwatch();
//            timer.Start();
//            var dirTree = new CategoryTreeModel() { FolderId = root };
//            var vwDirTrees = new List<WebApi.OggleBoobleSqlContext.VwDirTree>();
//            using (var db = new WebApi.OggleBoobleSqlContext.OggleBoobleContext())
//            {
//                // wow did this speed things up
//                vwDirTrees = db.VwDirTrees.ToList();
//                //GetCatTreeRecurr(danni, db);
//            }
//            GetDirTreeRecurr(dirTree, vwDirTrees, "");

//            timer.Stop();
//            System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
//            return dirTree;
//        }

//        private void GetDirTreeRecurr(CategoryTreeModel parent, List<WebApi.OggleBoobleSqlContext.VwDirTree> vwDirTree, string path)
//        {
//            var vwTrees = vwDirTree.Where(f => f.Parent == parent.FolderId).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).Distinct().ToList();
//            foreach (WebApi.OggleBoobleSqlContext.VwDirTree vwTree in vwTrees)
//            {
//                var subChild = new CategoryTreeModel()
//                {
//                    FolderId = vwTree.Id,
//                    ParentId = vwTree.Parent,
//                    RootFolder = vwTree.RootFolder,
//                    DirectoryName = vwTree.FolderName,
//                    Link = vwTree.Link,
//                    LinkId = vwTree.LinkId,
//                    SubDirCount = vwTree.SubDirCount,
//                    FileCount = vwTree.FileCount,
//                    IsStepChild = vwTree.IsStepChild,
//                    DanniPath = (path + "/" + vwTree.FolderName).Replace(" ", "%20")
//                };
//                subChild.LinkId = subChild.GetHashCode().ToString();

//                parent.SubDirs.Add(subChild);

//                GetDirTreeRecurr(subChild, vwDirTree, (path + "/" + vwTree.FolderName).Replace(" ", "%20"));
//            }
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class ImageCategoryDetailController : ApiController
//    {
//        [HttpGet]
//        public GetModelNameModel GetModelName(string linkId)
//        {
//            GetModelNameModel imageDetail = new GetModelNameModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    var expectedImageDetail =
//                        (from l in db.ImageLinks
//                         join f in db.CategoryFolders on l.FolderLocation equals f.Id
//                         where l.Id == linkId
//                         select new GetModelNameModel()
//                         {
//                             FolderId = f.Id,
//                             Link = l.Link,
//                             FolderName = f.FolderName,
//                             RootFolder = f.RootFolder
//                         }).FirstOrDefault();
//                    if (expectedImageDetail != null)
//                        imageDetail = expectedImageDetail;
//                    else
//                        System.Diagnostics.Debug.WriteLine(linkId + " didnt work ");

//                    imageDetail.Success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                imageDetail.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return imageDetail;
//        }

//        [HttpGet]
//        public FolderDetailModel Get(int folderId)
//        {
//            FolderDetailModel folderDetailModel = new FolderDetailModel();
//            try
//            {
//                if (folderId == 0)
//                {
//                    folderDetailModel.FolderName = "Unknown";
//                }
//                else
//                {
//                    using (var db = new OggleBoobleMySqContext())
//                    {
//                        CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(xn => xn.FolderId == folderId).FirstOrDefault();
//                        //CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
//                        if (categoryFolderDetails == null)
//                            folderDetailModel.FolderName = "";
//                        else
//                        {
//                            folderDetailModel.Measurements = categoryFolderDetails.Measurements;
//                            folderDetailModel.Nationality = categoryFolderDetails.Nationality;
//                            folderDetailModel.ExternalLinks = categoryFolderDetails.ExternalLinks;
//                            folderDetailModel.FolderImageLink = categoryFolderDetails.FolderImage;
//                            folderDetailModel.CommentText = categoryFolderDetails.CommentText;
//                            //folderDetailModel.Born = categoryFolderDetails.Born;
//                            folderDetailModel.Boobs = categoryFolderDetails.Boobs;
//                            folderDetailModel.FolderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
//                            folderDetailModel.FolderId = categoryFolderDetails.FolderId;
//                        }
//                        if (folderDetailModel.FolderImageLink == null)
//                            folderDetailModel.FolderImage = WebApi.Helpers.GetFirstImage(folderId);
//                        else
//                        {
//                            ImageLink imageLink = db.ImageLinks.Where(g => g.Id == categoryFolderDetails.FolderImage).FirstOrDefault();
//                            if (imageLink != null)
//                                folderDetailModel.FolderImage = imageLink.Link;
//                            //folderDetailModel.FolderImage = db.ImageLinks.Where(g => g.Id == categoryFolderDetails.FolderImage).First().Link;
//                        }
//                    }
//                }
//                folderDetailModel.Success = "ok";
//            }
//            catch (Exception ex)
//            {
//                folderDetailModel.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return folderDetailModel;
//        }

//        // create new folder in Posers Identified
//        [HttpPost]
//        public string Insert(FolderDetailModel model)
//        {
//            string success = "";
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    int newFolderId = 0;
//                    CategoryFolder dbParent = db.CategoryFolders.Where(f => f.FolderName == "posers identified").First();
//                    CategoryFolder poser = new CategoryFolder()
//                    {
//                        FolderName = model.FolderName,
//                        RootFolder = dbParent.RootFolder,
//                        Parent = dbParent.Id
//                    };
//                    db.CategoryFolders.Add(poser);
//                    db.SaveChanges();
//                    newFolderId = poser.Id;

//                    db.CategoryFolderDetails.Add(new CategoryFolderDetail()
//                    {
//                        CommentText = model.CommentText,
//                        ExternalLinks = model.ExternalLinks,
//                        FolderId = newFolderId,
//                        Nationality = model.Nationality,
//                        Measurements = model.Measurements,
//                        Boobs = model.Boobs,
//                        Born = model.Born
//                    });
//                    db.SaveChanges();
//                    success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return success;
//        }

//        //FolderDetailModel.Boobs = $('#selBoobs').val();
//        [HttpPut]
//        public string Update(FolderDetailModel model)
//        {
//            string success = "";
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == model.FolderId).First();
//                    dbFolderDetail.Born = model.Born;
//                    dbFolderDetail.Boobs = model.Boobs;
//                    dbFolderDetail.Nationality = model.Nationality;
//                    dbFolderDetail.ExternalLinks = model.ExternalLinks;
//                    dbFolderDetail.CommentText = model.CommentText;
//                    dbFolderDetail.Measurements = model.Measurements;
//                    db.SaveChanges();
//                    success = "ok";
//                }
//            }
//            catch (Exception ex) { success = WebApi.Helpers.ErrorDetails(ex); }
//            return success;
//        }

//        [HttpPut]
//        public string UpdateFolderImage(string linkId, int folderId, string level)
//        {
//            string success = "";
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    if (level == "folder")
//                    {
//                        CategoryFolderDetail dbCategoryFolderDetail = db.CategoryFolderDetails.Where(n => n.FolderId == folderId).FirstOrDefault();
//                        if (dbCategoryFolderDetail == null)
//                            db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = folderId, FolderImage = linkId });
//                        else
//                            dbCategoryFolderDetail.FolderImage = linkId;
//                    }
//                    else
//                    {
//                        int parent = db.CategoryFolders.Where(f => f.Id == folderId).First().Parent;
//                        CategoryFolderDetail dbCategoryFolderDetail = db.CategoryFolderDetails.Where(n => n.FolderId == parent).FirstOrDefault();
//                        if (dbCategoryFolderDetail == null)
//                        {
//                            CategoryFolderDetail CategoryFolderDetail = new CategoryFolderDetail() { FolderId = parent, FolderImage = linkId };
//                            db.CategoryFolderDetails.Add(CategoryFolderDetail);
//                        }
//                        else
//                        {
//                            dbCategoryFolderDetail.FolderImage = linkId;
//                        }
//                    }
//                    db.SaveChanges();
//                    success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return success;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class CategoryCommentController : ApiController
//    {
//        [HttpGet]
//        public CategoryCommentModel Get(int folderId)
//        {
//            CategoryCommentModel categoryComment = new CategoryCommentModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    CategoryCommentModel dbCategoryComment =
//                        (from f in db.CategoryFolders
//                         join d in db.CategoryFolderDetails on f.Id equals d.FolderId
//                         join l in db.ImageLinks on d.FolderImage equals l.Id
//                         where f.Id == folderId
//                         select new CategoryCommentModel()
//                         {
//                             FolderId = f.Id,
//                             Link = l.Link,
//                             FolderName = f.FolderName,
//                             CommentText = d.CommentText
//                         }).FirstOrDefault();

//                    if (dbCategoryComment != null)
//                    {
//                        categoryComment = dbCategoryComment;
//                    }
//                    //else
//                    //    categoryComment.Success = "not found";
//                    categoryComment.Success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                categoryComment.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return categoryComment;
//        }

//        [HttpGet]
//        public CategoryCommentContainer GetCategoryComments(string categoryType)
//        {
//            CategoryCommentContainer categoryCommentContainer = new CategoryCommentContainer();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    categoryCommentContainer.CategoryComments =
//                    (from f in db.CategoryFolders
//                     join d in db.CategoryFolderDetails on f.Id equals d.FolderId
//                     join l in db.ImageLinks on d.FolderImage equals l.Id
//                     //where d.
//                     select new CategoryCommentModel()
//                     {
//                         FolderId = f.Id,
//                         Link = l.Link,
//                         FolderName = f.FolderName,
//                         CommentText = d.CommentText
//                     }).ToList();

//                    categoryCommentContainer.Success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                categoryCommentContainer.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return categoryCommentContainer;
//        }

//        [HttpPut]
//        public string EditFolderCategory(int folderId, string commentText)
//        {
//            string success = "";
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    CategoryFolderDetail dbCategoryFolderDetail = db.CategoryFolderDetails.Where(m => m.FolderId == folderId).FirstOrDefault();
//                    if (dbCategoryFolderDetail == null)
//                    {
//                        db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = folderId, CommentText = commentText });
//                    }
//                    else
//                    {
//                        dbCategoryFolderDetail.CommentText = commentText;
//                    }
//                    db.SaveChanges();
//                    success = "ok";
//                }
//            }
//            catch (Exception ex)
//            {
//                success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return success;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class BoobsRankerController : ApiController
//    {
//        [HttpGet]
//        public ImageRankerModelContainer LoadImages(string rootFolder, int skip, int take)
//        {
//            ImageRankerModelContainer imageRankerModelContainer = new ImageRankerModelContainer();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    if (rootFolder == "playmates")
//                    {
//                        imageRankerModelContainer.RankerLinks =
//                            (from f in db.CategoryFolders
//                             join p in db.CategoryFolders on f.Parent equals p.Id
//                             join g in db.CategoryFolders on p.Parent equals g.Id
//                             join gg in db.CategoryFolders on g.Parent equals gg.Id
//                             join c in db.CategoryFolders on f.Id equals c.Parent
//                             join l in db.CategoryImageLinks on f.Id equals l.ImageCategoryId
//                             join i in db.ImageLinks on l.ImageLinkId equals i.Id
//                             where gg.FolderName == "centerfolds"
//                             where i.Height > i.Width
//                             select new ImageRankerModel()
//                             {
//                                 FolderId = f.Id,
//                                 LinkId = l.ImageLinkId,
//                                 Link = i.Link,
//                                 FolderName = f.FolderName + " " + c.FolderName
//                             }).OrderBy(i => i.LinkId).Skip(skip).Take(take).ToList();
//                        imageRankerModelContainer.Success = "ok";
//                    }
//                    else
//                    {
//                        imageRankerModelContainer.RankerLinks =
//                            (from i in db.VwLinks
//                             where i.RootFolder == rootFolder
//                             where i.Orientation == "P"
//                             select new ImageRankerModel()
//                             {
//                                 FolderId = i.FolderId,
//                                 LinkId = i.LinkId,
//                                 Link = i.Link,
//                                 FolderName = i.FolderName
//                             }).OrderBy(i => i.LinkId).Skip(skip).Take(take).ToList();
//                        imageRankerModelContainer.Success = "ok";
//                    }
//                }
//            }
//            catch (Exception ex)
//            {
//                imageRankerModelContainer.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return imageRankerModelContainer;
//        }

//        [HttpPost]
//        public string InsertVote(RankerVoteModel vote)
//        {
//            string success = "";
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    RankerVote rankerVote = new RankerVote()
//                    {
//                        PkId = Guid.NewGuid().ToString(),
//                        Winner = vote.Winner,
//                        Looser = vote.Looser,
//                        UserId = vote.UserName,
//                        VoteDate = DateTime.Now
//                    };
//                    db.RankerVotes.Add(rankerVote);
//                    db.SaveChanges();
//                    success = "ok";
//                }
//            }
//            catch (Exception ex) { success = WebApi.Helpers.ErrorDetails(ex); }
//            return success;
//        }
//    }

//    [EnableCors("*", "*", "*")]
//    public class OggleSearchController : ApiController
//    {
//        [HttpGet]
//        public SearchResultsModel GetSearchResults(string searchString)
//        {
//            SearchResultsModel searchResultsModel = new SearchResultsModel();
//            try
//            {
//                using (var db = new OggleBoobleMySqContext())
//                {
//                    List<CategoryFolder> startsWithSearchResults = db.CategoryFolders.Where(f => f.FolderName.StartsWith(searchString)).ToList();
//                    foreach (CategoryFolder folder in startsWithSearchResults)
//                    {
//                        searchResultsModel.SearchResults.Add(new SearchResultModel() { FolderId = folder.Id, FolderName = folder.FolderName });
//                    }
//                    List<CategoryFolder> containsSearchResults = db.CategoryFolders.Where(f => f.FolderName.Contains(searchString)).ToList();
//                    foreach (CategoryFolder folder in containsSearchResults)
//                    {
//                        if (!folder.FolderName.ToLower().StartsWith(searchString.ToLower()))
//                            searchResultsModel.SearchResults.Add(new SearchResultModel() { FolderId = folder.Id, FolderName = folder.FolderName });
//                    }
//                }
//                searchResultsModel.Success = "ok";
//            }
//            catch (Exception ex)
//            {
//                searchResultsModel.Success = WebApi.Helpers.ErrorDetails(ex);
//            }
//            return searchResultsModel;
//        }
//    }
//}
