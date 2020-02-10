using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using System.Xml;
using WebApi.OggleBoobleSqlContext;
using System.Data.SqlClient;
using System.IO;
using System.Net;
using System.Text;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class ImagePageController : ApiController
    {
        int totalChildren = 0;
        private int GetTotalChildFiles(int folderId)
        {
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                totalChildren += db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                var childFolders = db.CategoryFolders.Where(f => f.Parent == folderId);
                foreach (CategoryFolder subDir in childFolders)
                {
                    GetTotalChildFiles(subDir.Id);
                }
            }
            return totalChildren;
        }


        // used by ImagePage
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

                    foreach (VwDirTree vwTree in vwTrees)
                    {
                        if (vwTree.Link == null)
                            folderImage = Helpers.GetFirstImage(vwTree.Id);

                        totalChildren = 0;
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
        public CategoryImageModel GetAllImageLinks(int topFolderId, bool showAll)
        {
            var imageLinks = new CategoryImageModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    GetAllImagesRecurr(imageLinks, topFolderId, db);
                }
                imageLinks.Success = "ok";
            }
            catch (Exception ex)
            {
                imageLinks.Success = Helpers.ErrorDetails(ex);
            }
            return imageLinks;
        }
        private void GetAllImagesRecurr(CategoryImageModel imageLinks, int folderId, OggleBoobleContext db)
        {
            List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
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
            List<CategoryFolder> childFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
            foreach (CategoryFolder subDir in childFolders)
            {
                GetAllImagesRecurr(imageLinks, subDir.Id, db);
            }
            //int[] childFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
            //foreach (int childFolderId in childFolders)
            //{
            //    //var xx = db.VwLinks.Where(v => v.FolderId == childFolderId;

            //    imageLinks.Files.Add(x);
            //    //imageLinks.Files.AddRange(db.VwLinks.Where(v => v.FolderId == childFolderId).ToList());
            //}
        }

        [HttpPatch]
        public LinksModel GetLinks(string linkId)
        {
            var links = new LinksModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {

                    links.Links =
                        (from l in db.CategoryImageLinks
                         join f in db.CategoryFolders on l.ImageCategoryId equals f.Id
                         join p in db.CategoryFolders on f.Parent equals p.Id
                         where l.ImageLinkId == linkId
                         select (new LinkModel()
                         {
                             FolderId = f.Id,
                             PathName = p.FolderName + "/" + f.FolderName
                         })).ToList();
                }
                links.Success = "ok";
            }
            catch (Exception ex)
            {
                links.Success = Helpers.ErrorDetails(ex);
            }
            return links;
        }

        [HttpPut]
        public string UpdateSortOrder(List<SortOrderItem> SortOrderItems)
        {
            string success = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                foreach (SortOrderItem item in SortOrderItems)
                {
                    if (item.InputValue != 99)
                    {
                        CategoryImageLink link = db.CategoryImageLinks.Where(l => l.ImageCategoryId == item.PageId && l.ImageLinkId == item.ItemId).FirstOrDefault();
                        if (link != null)
                            link.SortOrder = item.InputValue;
                    }
                }
                db.SaveChanges();
                success = "ok";
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class BreadCrumbsController : ApiController
    {
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
    }

    [EnableCors("*", "*", "*")]
    public class AlbumPageController : ApiController
    {
        [HttpGet]
        public SuccessModel GetStaticPage(int folderId)
        {
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    string staticPageFileName = Helpers.GetParentPath(folderId).Replace(".OGGLEBOOBLE.COM", "");
                    //string staticPageFileName = Helpers.GetCustomStaticFolderName(folderId, dbCategoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", ""));
                    successModel.ReturnValue = "http://ogglebooble.com/static/" + dbCategoryFolder.RootFolder + "/" + staticPageFileName + ".html?calledFrom=internal";
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
        [Route("api/AlbumPage/GetRootFolder")]
        public RootFolderModel GetRootFolder(int folderId)
        {
            RootFolderModel rootFolderModel = new RootFolderModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    rootFolderModel.ContainsImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count() > 0;
                    rootFolderModel.RootFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault().RootFolder;
                    rootFolderModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                rootFolderModel.Success = Helpers.ErrorDetails(ex);
            }
            return rootFolderModel;
        }
    }

    [EnableCors("*", "*", "*")]
    public class CarouselController : ApiController
    {
        [HttpGet]
        public CarouselInfoModel GetLinks(string root, int skip, int take)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    carouselInfo.Links = db.Database.SqlQuery<CarouselItemModel>(
                        "select f.RootFolder, f.Id FolderId, p.Id ParentId, g.Id LinkId, f.FolderName, p.FolderName FolderPath, g.Link " +
                        "from OggleBooble.CategoryImageLink c " +
                        "join OggleBooble.CategoryFolder f on c.ImageCategoryId = f.Id " +
                        "join OggleBooble.CategoryFolder p on f.Parent = p.Id " +
                        "join OggleBooble.ImageLink g on c.ImageLinkId = g.Id " +
                        "where f.RootFolder = @param1", new SqlParameter("param1", root)).OrderBy(m => m.LinkId).Skip(skip).Take(take).ToList();

                    //var x = db.CategoryFolders.Where(f => f.Id == 1).FirstOrDefault();
                    //carouselInfo.Links =
                    //    (from c in db.CategoryImageLinks
                    //     join f in db.CategoryFolders on c.ImageCategoryId equals f.Id
                    //     join p in db.CategoryFolders on f.Parent equals p.Id
                    //     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                    //     where f.RootFolder == root
                    //     select new CarouselItemModel()
                    //     {
                    //         RootFolder = f.RootFolder,
                    //         FolderId = f.Id,
                    //         ParentId = p.Id,
                    //         LinkId = g.Id,
                    //         FolderName = f.FolderName,
                    //         FolderPath = p.FolderName,
                    //         Link = g.Link.StartsWith("http") ? g.Link : g.ExternalLink
                    //     }).OrderBy(m => m.LinkId).Skip(skip).Take(take).ToList();
                }
                carouselInfo.FolderCount = carouselInfo.Links.GroupBy(l => l.FolderName).Count();
                timer.Stop();
                System.Diagnostics.Debug.WriteLine("Select " + take + " from vLinks took: " + timer.Elapsed);
                carouselInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                carouselInfo.Success = Helpers.ErrorDetails(ex);
            }
            return carouselInfo;
        }

        [HttpGet]
        public SuccessModel VerifyConnection()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            SuccessModel successModel = new SuccessModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var test = db.CategoryFolders.Count().ToString();
                    successModel.Success = "ok";
                }
                timer.Stop();

                successModel.ReturnValue = timer.Elapsed.ToString();
                System.Diagnostics.Debug.WriteLine("VerifyConnection took: " + timer.Elapsed);
            }
            catch (Exception ex)
            {
                successModel.Success = Helpers.ErrorDetails(ex);
            }
            return successModel;
        }


        [HttpPost]
        public string XMLPost(CarouselInfoModel model)
        {
            try
            {
                string fileName = "";
                XmlDocument xdoc = new XmlDocument();
                xdoc.Load(fileName);
                XmlNode xmlNode = null;
                string id = Guid.NewGuid().ToString();
                //model.Links.
                foreach (CarouselItemModel i in model.Links)
                {
                    xmlNode = xdoc.CreateElement("Article");
                    XmlAttribute articleId = xdoc.CreateAttribute("Id"); articleId.Value = id; xmlNode.Attributes.Append(articleId);
                    XmlAttribute title = xdoc.CreateAttribute("Title"); title.Value = i.FolderName; xmlNode.Attributes.Append(title);
                    XmlAttribute byLine = xdoc.CreateAttribute("ByLine"); byLine.Value = i.Link; xmlNode.Attributes.Append(byLine);
                    XmlAttribute linkId = xdoc.CreateAttribute("LinkId"); linkId.Value = i.LinkId; xmlNode.Attributes.Append(linkId);
                    xdoc.DocumentElement.AppendChild(xmlNode);
                }
                xdoc.Save(fileName);
                xdoc = null;
                return id;
            }
            catch (Exception e)
            {
                return "ERROR: " + e.Message;
            }
        }
    }

    [EnableCors("*", "*", "*")]
    public class DirTreeController : ApiController
    {
        // dashboard -- returns a fully loaded dir tree
        [HttpGet]
        public CategoryTreeModel RebuildCatTree(int root)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var dirTree = new CategoryTreeModel() { FolderId = root };
            IEnumerable<VwDirTree> vwDirTrees = new List<VwDirTree>();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                // wow did this speed things up
                vwDirTrees = db.VwDirTrees.ToList().OrderBy(v => v.Id);
                //GetCatTreeRecurr(danni, db);
            }
            GetDirTreeRecurr(dirTree, vwDirTrees, "");

            timer.Stop();
            System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
            return dirTree;
        }
        private void GetDirTreeRecurr(CategoryTreeModel parent, IEnumerable<VwDirTree> vwDirTree, string path)
        {
            //var vwTrees = vwDirTree.Where(f => f.Parent == parent.FolderId).Distinct();
            //var vwTrees = vwDirTree.Where(f => f.Parent == parent.FolderId).Distinct().OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();
            //var vwTrees = vwDirTree.Where(f => f.Parent == parent.FolderId).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();

            var unsoredList = vwDirTree.Where(f => f.Parent == parent.FolderId);
            //var vwTrees = test1.OrderBy(f => f.SortOrder).ToList();

            if (parent.FolderId == 650)
            {
            }

            List<VwDirTree> vwTrees = unsoredList.OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).Distinct().ToList();

            foreach (VwDirTree vwTree in vwTrees)
            {
                var subChild = new CategoryTreeModel()
                {
                    FolderId = vwTree.Id,
                    ParentId = vwTree.Parent,
                    RootFolder = vwTree.RootFolder,
                    DirectoryName = vwTree.FolderName,
                    Link = vwTree.Link,
                    LinkId = vwTree.LinkId,
                    SubDirCount = vwTree.SubDirCount,
                    FileCount = vwTree.FileCount,
                    IsStepChild = vwTree.IsStepChild,
                    DanniPath = (path + "/" + vwTree.FolderName).Replace(" ", "%20")
                };
                subChild.LinkId = subChild.GetHashCode().ToString();

                parent.SubDirs.Add(subChild);

                GetDirTreeRecurr(subChild, vwDirTree, (path + "/" + vwTree.FolderName).Replace(" ", "%20"));
            }
        }

        string XXCreateFolder(CategoryFolderModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var rootFolder = db.CategoryFolders.Where(f => f.Id == model.Parent).FirstOrDefault().RootFolder;
                    if (rootFolder == "root")
                        rootFolder = model.FolderName;

                    db.CategoryFolders.Add(new CategoryFolder()
                    {
                        Parent = model.Parent,
                        FolderName = model.FolderName,
                        RootFolder = rootFolder
                    });
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
    }

    [EnableCors("*", "*", "*")]
    public class MetaTagController : ApiController
    {
        [HttpGet]
        public MetaTagResultsModel GetTags(int folderId, string linkId)
        {
            MetaTagResultsModel metaTagResults = new MetaTagResultsModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var catFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    if (catFolder != null)
                        metaTagResults.MetaDescription = "free naked pics of " + catFolder.FolderName;

                    //CategoryFolderDetail categoryFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    //if (categoryFolderDetail != null)
                    //{
                    //    metaTagResults.Source = categoryFolderDetail.FolderImage;
                    //    metaTagResults.MetaDescription = categoryFolderDetail.MetaDescription;
                    //}
                    //else
                    //{
                    //    metaTagResults.Source = linkId;
                    //    //metaTagResults.MetaDescription = "";
                    //}

                    List<MetaTag> metaTags = db.MetaTags.Where(m => m.LinkId == linkId).ToList();
                    foreach (MetaTag metaTag in metaTags)
                        metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = metaTag.TagId, LinkId = linkId, Tag = metaTag.Tag });

                    //metaTagResults.Source = db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.FolderName).First();

                    //metaTagResults.MetaDescription = "";


                    GetMetaTagsRecurr(metaTagResults, folderId, db);
                }
                metaTagResults.Success = "ok";
            }
            catch (Exception ex)
            {
                metaTagResults.Success = Helpers.ErrorDetails(ex);
            }
            return metaTagResults;
        }
        private void GetMetaTagsRecurr(MetaTagResultsModel metaTagResults, int folderId, OggleBoobleContext db)
        {
            List<MetaTag> metaTags = db.MetaTags.Where(m => m.FolderId == folderId).ToList();
            metaTagResults.MetaTags.Add(new MetaTagModel()
            {
                FolderId = folderId,
                Tag = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName
            });

            foreach (MetaTag metaTag in metaTags)
                metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = metaTag.TagId, FolderId = metaTag.FolderId, Tag = metaTag.Tag });

            int parent = db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.Parent).FirstOrDefault();
            if (parent > 1)
                GetMetaTagsRecurr(metaTagResults, parent, db);
        }

        [HttpGet]
        public MetaTagModel Get(int tagId)
        {
            MetaTagModel metaTag = new MetaTagModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    MetaTag dbMetaTag = db.MetaTags.Where(m => m.TagId == tagId).First();
                    metaTag.TagId = dbMetaTag.TagId;
                    metaTag.Tag = dbMetaTag.Tag;
                    metaTag.FolderId = dbMetaTag.FolderId;
                }
            }
            catch (Exception ex)
            {
                metaTag.Tag = Helpers.ErrorDetails(ex);
            }
            return metaTag;
        }

        [HttpPost]
        public string Insert(MetaTagModel model)
        {
            if (model.Tag == null) { return "ok"; }
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.MetaTags.Add(new MetaTag()
                    {
                        Tag = model.Tag,
                        FolderId = model.FolderId,
                        LinkId = model.LinkId
                    });
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

        [HttpPut]
        public string Update(MetaTagModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    MetaTag metaTag = db.MetaTags.Where(m => m.TagId == model.TagId).FirstOrDefault();
                    if (metaTag == null)
                        success = "not found";
                    else
                    {
                        metaTag.Tag = model.Tag;
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;

        }

        [HttpDelete]
        public string Delete(int tagId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    MetaTag metaTag = db.MetaTags.Where(m => m.TagId == tagId).FirstOrDefault();
                    db.MetaTags.Remove(metaTag);

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
    }

    [EnableCors("*", "*", "*")]
    public class VideoLinkController : ApiController
    {
        [HttpGet]
        public List<VideoLinkModel> Get()
        {            
            var videoLinks = new List<VideoLinkModel>();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                var dbVideoLinks = db.VideoLinks.ToList();
                foreach (VideoLink videoLink in dbVideoLinks)
                {
                    videoLinks.Add(new VideoLinkModel()
                    {
                        Id = Guid.NewGuid().ToString(),
                        ImageId = videoLink.ImageId,
                        Title = videoLink.Title,
                        FolderId = videoLink.FolderId,
                        Link = videoLink.Link
                    });
                }
            }
            return videoLinks;
        }

        [HttpPost]
        public string Write(VideoLinkModel videoLinkModel)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.VideoLinks.Add(new VideoLink()
                    {
                        Id = Guid.NewGuid().ToString(),
                        Link = videoLinkModel.Link,
                        FolderId = videoLinkModel.FolderId,
                        ImageId = videoLinkModel.ImageId,
                        Title = videoLinkModel.Title
                    });
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

        //string[] GetTransitions(string folder)
        //{
        //    string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/transitions") + "/" + folder;
        //    FileInfo[] files = new DirectoryInfo(danni).GetFiles();
        //    List<string> images = new List<string>();
        //    foreach (FileInfo img in files)
        //        images.Add(img.Name);
        //    return images.ToArray();
        //}

    }

    [EnableCors("*", "*", "*")]
    public class OggleBlogController : ApiController
    {
        [HttpGet]
        public BlogCommentModel Get(int blogId)
        {
            BlogCommentModel entry = new BlogCommentModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.Id == blogId).FirstOrDefault();
                    if (dbBlogComment != null)
                    {
                        entry.CommentTitle = dbBlogComment.CommentTitle;
                        entry.CommentText = dbBlogComment.CommentText;
                        entry.CommentType = dbBlogComment.CommentType;
                        entry.Link = dbBlogComment.Link;
                        entry.Id = dbBlogComment.Id;
                        entry.Success = "ok";
                    }
                    else
                        entry.Success = "blogId " + blogId + " not found";
                }
            }
            catch (Exception ex)
            {
                entry.Success = Helpers.ErrorDetails(ex);
            }
            return entry;
        }

        [HttpGet]
        public BlogCommentModelContainer GetBlogList(string commentType)
        {
            BlogCommentModelContainer blogCommentsContainer = new BlogCommentModelContainer();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    List<BlogComment> dbBlogCommentsContainer = db.BlogComments.Where(b => b.CommentType == commentType).ToList();
                    foreach (BlogComment dbBlogComment in dbBlogCommentsContainer)
                    {
                        blogCommentsContainer.blogComments.Add(new BlogCommentModel()
                        {
                            Id = dbBlogComment.Id,
                            CommentTitle = dbBlogComment.CommentTitle,
                            CommentText = dbBlogComment.CommentText,
                            Link = dbBlogComment.Link
                        });
                    }
                    blogCommentsContainer.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                blogCommentsContainer.Success = Helpers.ErrorDetails(ex);
            }
            return blogCommentsContainer;
        }

        [HttpPatch]
        public BlogCommentModel GetImageComment(string linkId, string userId)
        {
            BlogCommentModel entry = new BlogCommentModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    BlogComment dbBlogComment = db.BlogComments.Where(b => b.LinkId == linkId).Where(b => b.UserId == userId).FirstOrDefault();
                    if (dbBlogComment != null)
                    {
                        entry.CommentTitle = dbBlogComment.CommentTitle;
                        entry.CommentText = dbBlogComment.CommentText;
                        entry.Id = dbBlogComment.Id;
                    }
                    else
                        entry.Id = 0;
                }
                entry.Success = "ok";
            }
            catch (Exception ex)
            {
                entry.CommentTitle = Helpers.ErrorDetails(ex);
            }
            return entry;
        }

        [HttpPost]
        public SuccessModel Insert(BlogComment entry)
        {
            SuccessModel success = new SuccessModel();
            try
            {
                entry.Posted = DateTime.Now;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.BlogComments.Add(entry);
                    db.SaveChanges();
                    success.Success = "ok";
                    success.ReturnValue = entry.Id.ToString();
                }
            }
            catch (Exception e)
            {
                success.Success = Helpers.ErrorDetails(e);
            }
            return success;
        }

        [HttpPut]
        public string Update(BlogComment entry)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbEntry = db.BlogComments.Where(b => b.Id == entry.Id).FirstOrDefault();
                    if (dbEntry == null)
                        return "Entry not found";

                    dbEntry.CommentTitle = entry.CommentTitle;
                    dbEntry.CommentText = entry.CommentText;
                    dbEntry.CommentType = entry.CommentType;
                    dbEntry.Link = entry.Link;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception e)
            {
                success = Helpers.ErrorDetails(e);
            }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class TrackbackLinkController : ApiController
    {
        [HttpGet]
        public TrackBackModel GetTrackBacks(int folderId)
        {
            TrackBackModel trackBackModel = new TrackBackModel(); 
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    List<TrackbackLink> trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
                    foreach (TrackbackLink trackbackLink in trackbackLinks)
                    {
                        var ttrTrackBackLink = trackbackLink.TrackBackLink.Replace("target=\"_blank\"", "'").Replace("target='_blank'", "'");

                        trackBackModel.TrackBackItems.Add(new TrackBackItem()
                        {
                            Site = trackbackLink.Site,
                            TrackBackLink = ttrTrackBackLink,
                            LinkStatus = trackbackLink.LinkStatus
                        });
                    }
                    trackBackModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                trackBackModel.Success = Helpers.ErrorDetails(ex);
            }
            return trackBackModel;
        }

        [HttpPost]
        public string Insert(TrackBackItem trackBackItem)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var ttrTrackBackLink = trackBackItem.TrackBackLink.Replace("target=\"_blank\"", "");

                    db.TrackbackLinks.Add(new TrackbackLink()
                    {
                        PageId = trackBackItem.PageId,
                        LinkStatus = trackBackItem.LinkStatus,
                        Site = trackBackItem.Site,
                        TrackBackLink = ttrTrackBackLink
                    });
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

        [HttpPut]
        public string Update(TrackBackItem item)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    TrackbackLink trackbackLink = db.TrackbackLinks.Where(t => t.PageId == item.PageId).FirstOrDefault();
                    trackbackLink.Site = item.Site;
                    trackbackLink.LinkStatus = item.LinkStatus;
                    trackbackLink.Site = item.Site;
                    trackbackLink.TrackBackLink = item.TrackBackLink;
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
    }

    [EnableCors("*", "*", "*")]
    public class ImageCategoryDetailController : ApiController
    {
        [HttpGet]
        public GetModelNameModel GetModelName(string linkId)
        {
            GetModelNameModel imageDetail = new GetModelNameModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var expectedImageDetail = (from l in db.ImageLinks
                                               join f in db.CategoryFolders on l.FolderLocation equals f.Id
                                               where l.Id == linkId
                                               select new GetModelNameModel()
                                               {
                                                   FolderId = f.Id,
                                                   Link = l.Link,
                                                   FolderName = f.FolderName,
                                                   RootFolder = f.RootFolder
                                               }).FirstOrDefault();
                    if (expectedImageDetail != null)
                        imageDetail = expectedImageDetail;
                    else
                        System.Diagnostics.Debug.WriteLine(linkId + " didnt work ");

                    imageDetail.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                imageDetail.Success = Helpers.ErrorDetails(ex);
            }
            return imageDetail;
        }

        [HttpGet]
        public FolderDetailModel Get(int folderId)
        {
            FolderDetailModel folderDetailModel = new FolderDetailModel();
            try
            {
                if (folderId == 0)
                {
                    folderDetailModel.FolderName = "Unknown";
                }
                else
                {
                    using (OggleBoobleContext db = new OggleBoobleContext())
                    {
                        //CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                        
                        //if(categoryFolder.w)


                        CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(xn => xn.FolderId == folderId).FirstOrDefault();
                        //CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                        if (categoryFolderDetails == null)
                            folderDetailModel.FolderName = "";
                        else
                        {
                            folderDetailModel.Measurements = categoryFolderDetails.Measurements;
                            folderDetailModel.Nationality = categoryFolderDetails.Nationality;
                            folderDetailModel.ExternalLinks = categoryFolderDetails.ExternalLinks;
                            folderDetailModel.FolderImageLink = categoryFolderDetails.FolderImage;
                            folderDetailModel.CommentText = categoryFolderDetails.CommentText;
                            folderDetailModel.Born = categoryFolderDetails.Born;
                            folderDetailModel.Boobs = categoryFolderDetails.Boobs;
                            folderDetailModel.FolderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
                            folderDetailModel.FolderId = categoryFolderDetails.FolderId;
                            folderDetailModel.LinkStatus = categoryFolderDetails.LinkStatus;
                        }
                        if (folderDetailModel.FolderImageLink == null)
                            folderDetailModel.FolderImage = Helpers.GetFirstImage(folderId);
                        else
                        {
                            ImageLink imageLink = db.ImageLinks.Where(g => g.Id == categoryFolderDetails.FolderImage).FirstOrDefault();
                            if (imageLink != null)
                            {
                                folderDetailModel.FolderImage = imageLink.Link;
                                folderDetailModel.IsLandscape = (imageLink.Width > imageLink.Height);
                            }
                            //folderDetailModel.FolderImage = db.ImageLinks.Where(g => g.Id == categoryFolderDetails.FolderImage).First().Link;
                        }
                    }
                }
                folderDetailModel.Success = "ok";
            }
            catch (Exception ex)
            {
                folderDetailModel.Success = Helpers.ErrorDetails(ex);
            }
            return folderDetailModel;
        }
        //[HttpGet]
        //public SuccessModel GetExternalLinksText(int folderId)
        //{
        //    SuccessModel success = new SuccessModel() { ReturnValue = "no" };
        //    try
        //    {
        //        using (OggleBoobleContext db = new OggleBoobleContext())
        //        {
        //            SuccessModel dbRow = (from f in db.CategoryFolders
        //                                  join d in db.CategoryFolderDetails on f.Id equals d.FolderId
        //                                  where d.ExternalLinks.Contains(hrefTextSubstring) && f.Id == folderId
        //                                  select (new SuccessModel { ReturnValue = d.ExternalLinks })).FirstOrDefault();
        //            if (dbRow != null)
        //            {
        //                success.ReturnValue = dbRow.ReturnValue;
        //            }
        //            success.Success = "ok";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        success.Success = Helpers.ErrorDetails(ex);
        //    }
        //    return success;
        //}

        // create new folder in Posers Identified
        [HttpPost]
        public string Insert(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int newFolderId = 0;
                    CategoryFolder dbParent = db.CategoryFolders.Where(f => f.FolderName == "posers identified").First();
                    CategoryFolder poser = new CategoryFolder()
                    {
                        FolderName = model.FolderName,
                        RootFolder = dbParent.RootFolder,
                        Parent = dbParent.Id
                    };
                    db.CategoryFolders.Add(poser);
                    db.SaveChanges();
                    newFolderId = poser.Id;

                    db.CategoryFolderDetails.Add(new CategoryFolderDetail()
                    {
                        CommentText = model.CommentText,
                        ExternalLinks = model.ExternalLinks,
                        FolderId = newFolderId,
                        Nationality = model.Nationality,
                        Measurements = model.Measurements,
                        Boobs = model.Boobs,
                        LinkStatus = model.LinkStatus,
                        Born = model.Born
                    });
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

        //FolderDetailModel.Boobs = $('#selBoobs').val();
        [HttpPut]
        public string Update(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == model.FolderId).First();
                    dbFolderDetail.Born = model.Born;
                    dbFolderDetail.Boobs = model.Boobs;
                    dbFolderDetail.Nationality = model.Nationality;
                    dbFolderDetail.ExternalLinks = model.ExternalLinks;
                    dbFolderDetail.CommentText = model.CommentText;
                    dbFolderDetail.Measurements = model.Measurements;
                    dbFolderDetail.LinkStatus = model.LinkStatus;
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string UpdateFolderImage(string linkId, int folderId, string level)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    if (level == "folder")
                    {
                        CategoryFolderDetail dbCategoryFolderDetail = db.CategoryFolderDetails.Where(n => n.FolderId == folderId).FirstOrDefault();
                        if (dbCategoryFolderDetail == null)
                            db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = folderId, FolderImage = linkId });
                        else
                            dbCategoryFolderDetail.FolderImage = linkId;
                    }
                    else
                    {
                        int parent = db.CategoryFolders.Where(f => f.Id == folderId).First().Parent;
                        CategoryFolderDetail dbCategoryFolderDetail = db.CategoryFolderDetails.Where(n => n.FolderId == parent).FirstOrDefault();
                        if (dbCategoryFolderDetail == null)
                        {
                            CategoryFolderDetail CategoryFolderDetail = new CategoryFolderDetail() { FolderId = parent, FolderImage = linkId };
                            db.CategoryFolderDetails.Add(CategoryFolderDetail);
                        }
                        else
                        {
                            dbCategoryFolderDetail.FolderImage = linkId;
                        }
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
    }

    [EnableCors("*", "*", "*")]
    public class CategoryCommentController : ApiController
    {
        [HttpGet]
        public CategoryCommentModel Get(int folderId)
        {
            CategoryCommentModel categoryComment = new CategoryCommentModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryCommentModel dbCategoryComment =
                        (from f in db.CategoryFolders
                         join d in db.CategoryFolderDetails on f.Id equals d.FolderId
                         join l in db.ImageLinks on d.FolderImage equals l.Id
                         where f.Id == folderId
                         select new CategoryCommentModel()
                         {
                             FolderId = f.Id,
                             Link = l.Link,
                             FolderName = f.FolderName,
                             CommentText = d.CommentText
                         }).FirstOrDefault();

                    if (dbCategoryComment != null)
                    {
                        categoryComment = dbCategoryComment;
                    }
                    //else
                    //    categoryComment.Success = "not found";
                    categoryComment.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                categoryComment.Success = Helpers.ErrorDetails(ex);
            }
            return categoryComment;
        }

        [HttpGet]
        public CategoryCommentContainer GetCategoryComments()
        {
            CategoryCommentContainer categoryCommentContainer = new CategoryCommentContainer();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    categoryCommentContainer.CategoryComments =
                    (from f in db.CategoryFolders
                     join d in db.CategoryFolderDetails on f.Id equals d.FolderId
                     join l in db.ImageLinks on d.FolderImage equals l.Id
                     //where d.
                     select new CategoryCommentModel()
                     {
                         FolderId = f.Id,
                         Link = l.Link,
                         FolderName = f.FolderName,
                         CommentText = d.CommentText
                     }).ToList();

                    categoryCommentContainer.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                categoryCommentContainer.Success = Helpers.ErrorDetails(ex);
            }
            return categoryCommentContainer;
        }

        [HttpPut]
        public string EditFolderCategory(int folderId, string commentText)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolderDetail dbCategoryFolderDetail = db.CategoryFolderDetails.Where(m => m.FolderId == folderId).FirstOrDefault();
                    if (dbCategoryFolderDetail == null)
                    {
                        db.CategoryFolderDetails.Add(new CategoryFolderDetail() { FolderId = folderId, CommentText = commentText });
                    }
                    else
                    {
                        dbCategoryFolderDetail.CommentText = commentText;
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
    }

    [EnableCors("*", "*", "*")]
    public class BoobsRankerController : ApiController
    {
        [HttpGet]
        public ImageRankerModelContainer LoadImages(string rootFolder, int skip, int take)
        {
            ImageRankerModelContainer imageRankerModelContainer = new ImageRankerModelContainer();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    if (rootFolder == "playmates")
                    {
                        imageRankerModelContainer.RankerLinks =
                            (from f in db.CategoryFolders
                             join p in db.CategoryFolders on f.Parent equals p.Id
                             join g in db.CategoryFolders on p.Parent equals g.Id
                             join gg in db.CategoryFolders on g.Parent equals gg.Id
                             join c in db.CategoryFolders on f.Id equals c.Parent
                             join l in db.CategoryImageLinks on f.Id equals l.ImageCategoryId
                             join i in db.ImageLinks on l.ImageLinkId equals i.Id
                             where gg.FolderName == "centerfolds"
                             where i.Height > i.Width
                             select new ImageRankerModel()
                             {
                                 FolderId = f.Id,
                                 LinkId = l.ImageLinkId,
                                 Link = i.Link,
                                 FolderName = f.FolderName + " " + c.FolderName
                             }).OrderBy(i => i.LinkId).Skip(skip).Take(take).ToList();
                        imageRankerModelContainer.Success = "ok";
                    }
                    else
                    {
                        imageRankerModelContainer.RankerLinks =
                            (from i in db.VwLinks
                             where i.RootFolder == rootFolder
                             where i.Orientation == "P"
                             select new ImageRankerModel()
                             {
                                 FolderId = i.FolderId,
                                 LinkId = i.LinkId,
                                 Link = i.Link,
                                 FolderName = i.FolderName
                             }).OrderBy(i => i.LinkId).Skip(skip).Take(take).ToList();
                        imageRankerModelContainer.Success = "ok";
                    }
                }
            }
            catch (Exception ex)
            {
                imageRankerModelContainer.Success = Helpers.ErrorDetails(ex);
            }
            return imageRankerModelContainer;
        }

        [HttpPost]
        public string InsertVote(RankerVoteModel vote)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    RankerVote rankerVote = new RankerVote()
                    {
                        PkId = Guid.NewGuid().ToString(),
                        Winner = vote.Winner,
                        Looser = vote.Looser,
                        UserId = vote.UserName,
                        VoteDate = DateTime.Now
                    };
                    db.RankerVotes.Add(rankerVote);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class OggleSearchController : ApiController
    {
        [HttpGet]
        public SearchResultsModel GetSearchResults(string searchString)
        {
            SearchResultsModel searchResultsModel = new SearchResultsModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    searchResultsModel.SearchResults =
                        (from f in db.CategoryFolders
                         //join p in db.CategoryFolders on f.Parent equals p.Id
                         where f.FolderName.StartsWith(searchString)
                         select new SearchResult() { FolderId = f.Id, FolderName = f.FolderName, Parent = f.RootFolder }).ToList();


                    //.Where(f => f.FolderName.StartsWith(searchString)).ToList();
                    //foreach (CategoryFolder folder in startsWithSearchResults)
                    //{
                    //    searchResultsModel.SearchResults.Add(new SearchResultModel() { FolderId = folder.Id, FolderName = folder.FolderName });
                    //}
                    List<SearchResult> containsSearchResults = (from f in db.CategoryFolders
                                             //join p in db.CategoryFolders on f.Parent equals p.Id
                                             where f.FolderName.Contains(searchString)
                                             select new SearchResult() { FolderId = f.Id, FolderName = f.FolderName, Parent = f.RootFolder }).ToList();

                    //List <CategoryFolder> containsSearchResults = db.CategoryFolders.Where(f => f.FolderName.Contains(searchString)).ToList();
                    foreach (SearchResult searchResult in containsSearchResults)
                    {
                        if (!searchResult.FolderName.ToLower().StartsWith(searchString.ToLower()))
                            searchResultsModel.SearchResults.Add(searchResult);
                        //searchResultsModel.SearchResults.Add(new SearchResultModel() { FolderId = folder.Id, FolderName = folder.FolderName });
                    }
                }
                searchResultsModel.Success = "ok";
            }
            catch (Exception ex)
            {
                searchResultsModel.Success = Helpers.ErrorDetails(ex);
            }
            return searchResultsModel;
        }
    }
}
