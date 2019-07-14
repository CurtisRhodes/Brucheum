using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.DataContext;
using System.Xml;
//using System.IO;
//using System.Net;
//using System.Text;

namespace WebApi
{
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
                    int folderId = db.ImageLinks.Where(g => g.Id == linkId).First().FolderLocation;
                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();

                    imageDetail.FolderId = folderId;
                    imageDetail.FolderName = dbCategoryFolder.FolderName;
                    imageDetail.RootFolder = dbCategoryFolder.RootFolder;
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
        public CategoryFolderDetailModel Get(int folderId)
        {
            CategoryFolderDetailModel model = new CategoryFolderDetailModel();
            try
            {
                if (folderId == 0)
                {
                    model.FolderName = "Unknown";
                }
                else
                {
                    using (OggleBoobleContext db = new OggleBoobleContext())
                    {
                        CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(xn => xn.FolderId == folderId).FirstOrDefault();
                        //CategoryFolder dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                        if (categoryFolderDetails == null)
                            model.FolderName = "";
                        else
                        {
                            model.Measurements = categoryFolderDetails.Measurements;
                            model.Nationality = categoryFolderDetails.Nationality;
                            model.ExternalLinks = categoryFolderDetails.ExternalLinks;
                            model.FolderImageLink = categoryFolderDetails.FolderImage;
                            model.CommentText = categoryFolderDetails.CommentText;
                            model.Born = categoryFolderDetails.Born;
                            model.FolderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
                            model.FolderId = categoryFolderDetails.FolderId;
                        }
                        if (model.FolderImageLink == null)
                            model.FolderImage = Helpers.GetFirstImage(folderId);
                        else
                            model.FolderImage = db.ImageLinks.Where(g => g.Id == categoryFolderDetails.FolderImage).First().Link;
                    }
                }
                model.Success = "ok";
            }
            catch (Exception ex) { model.Success = Helpers.ErrorDetails(ex); }
            return model;
        }

        // create new folder in Posers Identified
        [HttpPost]
        public string Insert(CategoryFolderDetailModel model)
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

        [HttpPut]
        public string Update(CategoryFolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolderDetail dbFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == model.FolderId).First();
                    dbFolderDetail.Born = model.Born;
                    dbFolderDetail.Nationality = model.Nationality;
                    dbFolderDetail.ExternalLinks = model.ExternalLinks;
                    dbFolderDetail.CommentText = model.CommentText;
                    dbFolderDetail.Measurements = model.Measurements;
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
    public class ImagePageController : ApiController
    {
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

                    List<VwDirTree> vwTrees = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    string folderImage = null;

                    foreach (VwDirTree vwTree in vwTrees)
                    {
                        if (vwTree.Link == null)
                            folderImage = Helpers.GetFirstImage(vwTree.Id);

                        imageLinks.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            //DanniPath = folderId,
                            FolderId = vwTree.Id,
                            DirectoryName = vwTree.FolderName,
                            ParentId = vwTree.Parent,
                            Length = vwTree.FileCount + vwTree.TotalFiles + vwTree.GrandTotalFiles,
                            Link = vwTree.Link
                        });
                    }

                    //string expectedLink = "";

                    imageLinks.Files = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
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
            imageLinks.Files = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
            int[] childFolders = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
            foreach (int childFolderId in childFolders)
            {
                imageLinks.Files.AddRange(db.VwLinks.Where(v => v.FolderId == childFolderId).ToList());
            }
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
                    carouselInfo.Links =
                        (from c in db.CategoryImageLinks
                         join f in db.CategoryFolders on c.ImageCategoryId equals f.Id
                         join p in db.CategoryFolders on f.Parent equals p.Id
                         // join g in db.CategoryFolders on p.Parent equals g.Id
                         join l in db.ImageLinks on c.ImageLinkId equals l.Id
                         where f.RootFolder == root
                         select new CarouselItemModel()
                         {
                             RootFolder = f.RootFolder,
                             FolderId = f.Id,
                             ParentId = p.Id,
                             LinkId = l.Id,
                             FolderName = f.FolderName,
                             FolderPath = p.FolderName,
                             Link = l.Link.StartsWith("http") ? l.Link : l.ExternalLink
                         }).OrderBy(l=>l.LinkId).Skip(skip).Take(take).ToList();
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
    public class CatTreeController : ApiController
    {
        // dashboard -- returns a fully loaded dir tree
        [HttpGet]
        public CategoryTreeModel RebuildCatTree(int root)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var dirTree = new CategoryTreeModel() { FolderId = root };
            List<VwDirTree> vwDirTree = new List<VwDirTree>();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                // wow did this speed things up
                vwDirTree = db.VwDirTrees.ToList();
                //GetCatTreeRecurr(danni, db);
            }
            GetCatTreeRecurr(dirTree, vwDirTree, "");

            timer.Stop();
            System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
            return dirTree;
        }
        private void GetCatTreeRecurr(CategoryTreeModel parent, List<VwDirTree> vwDirTree, string path)
        {
            var vwTrees = vwDirTree.Where(f => f.Parent == parent.FolderId).OrderBy(f => f.FolderName).ToList();
            foreach (VwDirTree vwTree in vwTrees)
            {
                var subChild = new CategoryTreeModel()
                {
                    FolderId = vwTree.Id,
                    ParentId = vwTree.Parent,
                    RootFolder = vwTree.RootFolder,
                    DirectoryName = vwTree.FolderName,
                    Link = vwTree.Link,
                    SubDirCount = vwTree.SubDirCount,
                    Length = vwTree.FileCount + vwTree.TotalFiles + vwTree.GrandTotalFiles,
                    DanniPath = (path + "/" + vwTree.FolderName).Replace(" ", "%20")
                };
                subChild.LinkId = subChild.GetHashCode().ToString();

                parent.SubDirs.Add(subChild);

                GetCatTreeRecurr(subChild, vwDirTree, (path + "/" + vwTree.FolderName).Replace(" ", "%20"));
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
                    if (linkId != "undefined")
                    {
                        //metaTagResults.Source = "Image";
                        metaTagResults.Source = (from l in db.ImageLinks
                                                 join f in db.CategoryFolders on l.FolderLocation equals f.Id
                                                 where l.Id == linkId
                                                 select f.FolderName).First() + "(image)";

                        List<MetaTag> metaTags = db.MetaTags.Where(m => m.LinkId == linkId).ToList();
                        foreach (MetaTag metaTag in metaTags)
                            metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = metaTag.TagId, LinkId = linkId, Tag = metaTag.Tag });
                    }
                    else
                        metaTagResults.Source = db.CategoryFolders.Where(f => f.Id == folderId).Select(f => f.FolderName).First();

                    CategoryFolderDetail categoryFolderDetail = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                    if (categoryFolderDetail != null)
                    {
                        if (categoryFolderDetail.CommentText != null)
                            metaTagResults.Description = Uri.EscapeDataString(categoryFolderDetail.CommentText); //Helpers.Beautify(categoryFolderDetail.CommentText);
                        else
                            metaTagResults.Description = "free images of " + metaTagResults.Source;
                    }
                    GetMetaTasRecurr(metaTagResults, folderId, db);
                }
                metaTagResults.Success = "ok";
            }
            catch (Exception ex)
            {
                metaTagResults.Success = Helpers.ErrorDetails(ex);
            }
            return metaTagResults;
        }
        private void GetMetaTasRecurr(MetaTagResultsModel metaTagResults, int folderId, OggleBoobleContext db)
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
                GetMetaTasRecurr(metaTagResults, parent, db);
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
                        Image = videoLink.Image,
                        Title = videoLink.Title,
                        Link = videoLink.Link
                    });
                }
            }
            return videoLinks;
        }

        [HttpPost]
        public string Write(VideoLink videoLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.VideoLinks.Add(videoLink);
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
                    var dbEntry = db.BlogComments.Where(b => b.Id == entry.Id).First();
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
        public CategoryCommentContainer GetCategoryComments(string categoryType)
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
        public ImageRankerModelContainer LoadImages()
        {
            ImageRankerModelContainer imageRankerModelContainer = new ImageRankerModelContainer();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    imageRankerModelContainer.RankerLinks =
                        (from i in db.VwLinks
                         where i.RootFolder != "porn"
                         where i.Orientation == "P"
                         select new ImageRankerModel()
                         {
                             FolderId = i.FolderId,
                             LinkId = i.LinkId,
                             Link = i.Link
                         }).Take(500).ToList();
                    imageRankerModelContainer.Success = "ok";
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

}

