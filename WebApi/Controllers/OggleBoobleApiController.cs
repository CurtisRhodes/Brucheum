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
                            model.Src = Helpers.GetFirstImage(folderId);
                        else
                            model.Src = db.ImageLinks.Where(g => g.Id == categoryFolderDetails.FolderImage).First().Link;
                    }
                }
                model.Success = "ok";
            }
            catch (Exception ex) { model.Success = Helpers.ErrorDetails(ex); }
            return model;
        }

        [HttpPost]
        public string Insert(CategoryFolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int folderId = 0;                    
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.FolderId).First();
                    CategoryFolder dbParent = db.CategoryFolders.Where(f => f.FolderName == "posers identified").First();

                    CategoryFolder poser = new CategoryFolder()
                    {
                        FolderName = model.FolderName,
                        RootFolder = dbParent.RootFolder,
                        Parent = dbParent.Id
                    };
                    db.CategoryFolders.Add(poser);
                    db.SaveChanges();
                    folderId = poser.Id;

                    string extension = model.Src.Substring(model.Src.LastIndexOf("."));
                    string sourceOriginPath = Helpers.GetParentPath(model.FolderId, true);
                    string ftpSource = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/" + sourceOriginPath + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + model.ImageLinkId + extension;
                    string expectedFileName = model.FolderName + "_" + model.ImageLinkId + extension;
                    string ftpDestinationPath = "ftp://50.62.160.105/archive.ogglebooble.com/posers identified/" + model.FolderName;

                    if (!FtpIO.DirectoryExists(ftpDestinationPath))
                        FtpIO.CreateDirectory(ftpDestinationPath);

                    success = FtpIO.MoveFile(ftpSource, ftpDestinationPath + "/" + expectedFileName);

                    ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == model.ImageLinkId).First();
                    goDaddyLink.Link = "http://archive.ogglebooble.com/posers identified/" + model.FolderName + "/" + expectedFileName;
                    db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = model.ImageLinkId });
                    db.SaveChanges();

                    db.CategoryFolderDetails.Add(new CategoryFolderDetail()
                    {
                        CommentText = model.CommentText,
                        ExternalLinks = model.ExternalLinks,
                        FolderId = folderId,
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
    }

    [EnableCors("*", "*", "*")]
    public class CategoryFolderController : ApiController
    {
        [HttpGet]
        public CategoryFolderModel GetParent(int folderId)
        {
            CategoryFolderModel categoryFolder = new CategoryFolderModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder x = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    CategoryFolder p = db.CategoryFolders.Where(f => f.Id == x.Parent).First();
                    categoryFolder.FolderName = p.FolderName;
                    categoryFolder.Id = p.Id;
                }
            }
            catch (Exception ex)
            {
                categoryFolder.Success = Helpers.ErrorDetails(ex);
            }
            return categoryFolder;
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
                    imageLinks.Origin = dbCategoryFolder.RootFolder;

                    List<VwDirTree> subDirs  = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    string folderImage = null;

                    foreach (VwDirTree subDir in subDirs)
                    {
                        if (subDir.Link == null)
                            folderImage = Helpers.GetFirstImage(subDir.Id);

                        imageLinks.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            //DanniPath = folderId,
                            FolderId = subDir.Id,
                            DirectoryName = subDir.FolderName,
                            Length = Math.Max(subDir.FileCount, subDir.SubDirCount),
                            Link = subDir.Link
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

        // imagePage copy
        [HttpPut]
        public string CopyImageLink(MoveCopyImageModel model)
        {
            string success = "";
            try
            {
                string linkId = model.Link.Substring(model.Link.LastIndexOf("_") + 1, 36);
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryImageLink existingLink = db.CategoryImageLinks
                        .Where(l => l.ImageCategoryId == model.DestinationFolderId)
                        .Where(l => l.ImageLinkId == linkId).FirstOrDefault();
                    if (existingLink != null)
                        success = "Link already exists";
                    else
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = model.DestinationFolderId,
                            ImageLinkId = linkId
                        });
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class CarouselController : ApiController
    {
        [HttpGet]
        public CarouselInfoModel GetLinks(string root, int take)
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
                         }).Take(take).ToList();
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
    public class DashBoardController : ApiController
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
                // wowdid this speed things up
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
            var childFolders = vwDirTree.Where(f => f.Parent == parent.FolderId).OrderBy(f => f.FolderName).ToList();
            foreach (VwDirTree childFolder in childFolders)
            {
                var subChild = new CategoryTreeModel()
                {
                    FolderId = childFolder.Id,
                    ParentId = childFolder.Parent,
                    DirectoryName = childFolder.FolderName,
                    Link = childFolder.Link,
                    Length = Math.Max(childFolder.FileCount, childFolder.SubDirCount),
                    DanniPath = (path + "/" + childFolder.FolderName).Replace(" ", "%20")
                };
                subChild.LinkId = subChild.GetHashCode().ToString();

                parent.SubDirs.Add(subChild);

                GetCatTreeRecurr(subChild, vwDirTree, (path + "/" + childFolder.FolderName).Replace(" ", "%20"));
            }
        }

        [HttpGet]
        public BreadCrumbModel GetBreadCrumbs(int folderId)
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

        // dashboard
        [HttpPut]
        public string CreateFolder(CategoryFolderModel model)
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
        public MetaTagResultsModel Get(string tagType)
        {
            MetaTagResultsModel metaTagResults = new MetaTagResultsModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    if (tagType.Length == 36) // we are looking at a single image
                    {
                        ImageLink dbImageLink = db.ImageLinks.Where(l => l.Id == tagType).FirstOrDefault();
                        if (dbImageLink != null)
                        {
                            metaTagResults.Source = db.CategoryFolders.Where(f => f.Id == dbImageLink.FolderLocation).First().FolderName;
                            string rootFolder = db.CategoryFolders.Where(f => f.Id == dbImageLink.FolderLocation).First().RootFolder;
                            List<MetaTag> rootTags = db.MetaTags.Where(m => m.TagType == rootFolder).ToList();
                            foreach (MetaTag rootTag in rootTags)
                            {
                                metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = rootTag.TagId, Tag = rootTag.Tag, TagType = "Root" });
                            }

                            List<MetaTag> folderTags = db.MetaTags.Where(m => m.TagType == dbImageLink.FolderLocation.ToString()).ToList();
                            foreach (MetaTag folderTag in folderTags)
                            {
                                metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = folderTag.TagId, Tag = folderTag.Tag, TagType = "Folder" });
                            }
                            List<MetaTag> dbMetaTags = db.MetaTags.Where(m => m.TagType == tagType).ToList();
                            foreach (MetaTag dbMetaTag in dbMetaTags)
                            {
                                metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = dbMetaTag.TagId, Tag = dbMetaTag.Tag, TagType = "Image" });
                            }
                        }
                    }
                    else
                    {
                        if (tagType.Length > 3) // must be a root
                        {
                            metaTagResults.Source = tagType;
                            List<MetaTag> dbMetaTags = db.MetaTags.Where(m => m.TagType == tagType).ToList();
                            foreach (MetaTag dbMetaTag in dbMetaTags)
                            {
                                metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = dbMetaTag.TagId, Tag = dbMetaTag.Tag, TagType = "Root" });
                            }
                        }
                        else // must be a folder
                        {
                            CategoryFolder folder = db.CategoryFolders.Where(f => f.Id.ToString() == tagType).FirstOrDefault();
                            if (folder != null)
                            {
                                metaTagResults.Source = folder.FolderName;
                                List<MetaTag> dbRootTags = db.MetaTags.Where(m => m.TagType == folder.RootFolder).ToList();
                                foreach (MetaTag dbMetaTag in dbRootTags)
                                {
                                    metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = dbMetaTag.TagId, Tag = dbMetaTag.Tag, TagType = "Root" });
                                }
                                List<MetaTag> dbFolderTags = db.MetaTags.Where(m => m.TagType == folder.Id.ToString()).ToList();
                                foreach (MetaTag dbMetaTag in dbFolderTags)
                                {
                                    metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = dbMetaTag.TagId, Tag = dbMetaTag.Tag, TagType = "Folder" });
                                }
                            }
                        }

                    }
                    metaTagResults.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                metaTagResults.Success = Helpers.ErrorDetails(ex);
            }
            return metaTagResults;
        }

        [HttpGet]
        public MetaTagModel Get(int tagId, string kludge)
        {
            MetaTagModel metaTag = new MetaTagModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    MetaTag dbMetaTag = db.MetaTags.Where(m => m.TagId == tagId).First();
                    metaTag.TagId = dbMetaTag.TagId;
                    metaTag.Tag = dbMetaTag.Tag;
                    metaTag.TagType = dbMetaTag.TagType;
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
                    db.MetaTags.Add(new MetaTag() { Tag = model.Tag, TagType = model.TagType });
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
                        metaTag.TagType = model.TagType;
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
                    success.Success= "ok";
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
                        categoryComment.Success = "ok";
                    }
                    else
                        categoryComment.Success = "not found";
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
}

