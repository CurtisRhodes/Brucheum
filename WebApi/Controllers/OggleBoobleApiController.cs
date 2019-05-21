using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.DataContext;
//using System.IO;
//using System.Net;
//using System.Text;
//Turn off the computer

//    Press power on your computer and immediately and repeatedly press "esc" to get to the start-up menu
//    Press F10 to go to the “BIOS Setup”
//    Once in the “BIOS Setup” press the arrow keys to "System Configurations"
//    Scroll Down to “Action Keys Mode”
//    Disable “Action Keys Modes”

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class FolderDetailController : ApiController
    {
        [HttpGet]
        public FolderDetailModel GetModelName(string linkId)
        {
            FolderDetailModel nudeModelInfo = null;
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    nudeModelInfo =
                        (from g in db.GoDaddyLinks
                         join f in db.CategoryFolders on g.FolderId equals f.Id
                         where g.Id == linkId
                         select new FolderDetailModel()
                         {
                             FolderName = f.FolderName,
                             FolderId = f.Id,
                             Success = "ok"
                         }).FirstOrDefault();
                }
            }
            catch (Exception ex) {
                if (nudeModelInfo == null)
                    nudeModelInfo = new FolderDetailModel() ;
                nudeModelInfo.Success=Helpers.ErrorDetails(ex); }
            return nudeModelInfo;
        }

        [HttpGet]
        public FolderDetailModel Get(int folderId)
        {
            FolderDetailModel model = new FolderDetailModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    FolderDetail folderDetail = db.FolderDetails.Where(xn => xn.FolderId == folderId).FirstOrDefault();
                    CategoryFolder f = db.CategoryFolders.Where(xf => xf.Id == folderId).FirstOrDefault();

                    model.FolderId = folderDetail.FolderId;
                    model.FolderName = f.FolderName;
                    model.Measurements = folderDetail.Measurements;
                    model.Nationality = folderDetail.Nationality;
                    model.ExternalLinks = folderDetail.ExternalLinks;
                    model.FolderImageLink = folderDetail.FolderImage;
                    model.Born = folderDetail.Born;
                    //nudemodelInfo.Link = g.Link;
                    //nudemodelInfo.LinkId = g.Id;
                    model.CommentText = folderDetail.CommentText;
                    model.Success = "ok";
                    if (model.FolderImageLink == null)
                    {
                        folderDetail.FolderImage = db.GoDaddyLinks.Where(g=> g.FolderId == folderId).First().Id;
                        db.SaveChanges();
                    }
                    model.Src = db.GoDaddyLinks.Where(g => g.Id == folderDetail.FolderImage).First().Link;
                }
            }
            catch (Exception ex) { model.Success = Helpers.ErrorDetails(ex); }
            return model;
        }

        [HttpPost]
        public string Insert(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int folderId = 0;
                    int modelId = 0;
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.FolderId).First();
                    CategoryFolder dbParent = db.CategoryFolders.Where(f => f.FolderName == "posers identified").First();

                    CategoryFolder dbExistingCategoryFolder = db.CategoryFolders.Where(f => f.Parent == dbParent.Id && f.FolderName.ToUpper() == model.FolderName.ToUpper()).FirstOrDefault();
                    if (dbExistingCategoryFolder != null)
                    {
                        folderId = dbExistingCategoryFolder.Id;
                        FolderDetail dbExistingFolderDetail = db.FolderDetails.Where(n => n.FolderId == folderId).FirstOrDefault();
                        if (dbExistingFolderDetail != null)
                            modelId = dbExistingFolderDetail.ModelId;
                    }
                    else
                    {
                        CategoryFolder poser = new CategoryFolder()
                        {
                            FolderName = model.FolderName,
                            RootFolder = dbParent.RootFolder,
                            Parent = dbParent.Id
                        };
                        db.CategoryFolders.Add(poser);
                        db.SaveChanges();
                        folderId = poser.Id;
                    }
                    string extension = model.Src.Substring(model.Src.LastIndexOf("."));
                    string sourceOriginPath = Helpers.GetParentPath(model.FolderId, true);
                    string ftpSource = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/" + sourceOriginPath + dbSourceFolder.FolderName + "/" + dbSourceFolder.FolderName + "_" + model.ImageLinkId + extension;
                    string expectedFileName = model.FolderName + "_" + model.ImageLinkId + extension;
                    string ftpDestinationPath = "ftp://50.62.160.105/archive.ogglebooble.com/posers identified/" + model.FolderName;

                    if (!FtpIO.DirectoryExists(ftpDestinationPath))
                        FtpIO.CreateDirectory(ftpDestinationPath);

                    success = FtpIO.MoveFile(ftpSource, ftpDestinationPath + "/" + expectedFileName);

                    GoDaddyLink goDaddyLink = db.GoDaddyLinks.Where(g => g.Id == model.ImageLinkId).First();
                    goDaddyLink.Link = "http://archive.ogglebooble.com/posers identified/" + model.FolderName + "/" + expectedFileName;
                    db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = model.ImageLinkId });
                    db.SaveChanges();

                    if (modelId == 0)
                        modelId = Helpers.GetNextModelId();
                    db.FolderDetails.Add(new FolderDetail()
                    {
                        ModelId = modelId,
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
        public string Update(FolderDetailModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    FolderDetail dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == model.FolderId).First();

                    dbFolderDetail.Born = model.Born;
                    dbFolderDetail.Nationality = model.Nationality;
                    dbFolderDetail.ExternalLinks = model.ExternalLinks;
                    dbFolderDetail.CommentText = model.CommentText;
                    dbFolderDetail.Measurements = model.Measurements;
                    //nudeModelInfo.FolderId = model.FolderId;
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
        // used by _CategoryDialog
        [HttpGet]
        public CategoryCommentModel GetCommentText(int folderId)
        {
            CategoryCommentModel categoryComment = new CategoryCommentModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    categoryComment.FolderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
                    FolderDetail dbFolderDetail = db.FolderDetails.Where(n => n.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetail != null)
                        categoryComment.CommentText = dbFolderDetail.CommentText;

                    categoryComment.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                categoryComment.Success = Helpers.ErrorDetails(ex);
            }
            return categoryComment;
        }

        [HttpPut]
        public string EditFolderCategory(int folderId, string commentText)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    FolderDetail dbFolderDetail = db.FolderDetails.Where(m => m.FolderId == folderId).FirstOrDefault();
                    if (dbFolderDetail == null)
                    {
                        db.FolderDetails.Add(new FolderDetail() { FolderId = folderId, ModelId = 0, CommentText = commentText });
                    }
                    else
                    {
                        dbFolderDetail.CommentText = commentText;
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
                        FolderDetail nudeModelInfo = db.FolderDetails.Where(n => n.FolderId == folderId).FirstOrDefault();
                        if (nudeModelInfo == null)
                        {
                            db.FolderDetails.Add(new FolderDetail() { FolderId = folderId, FolderImage = linkId });
                        }
                        else
                        {
                            nudeModelInfo.FolderImage = linkId;
                        }
                    }
                    else
                    {
                        int parent = db.CategoryFolders.Where(f => f.Id == folderId).First().Parent;
                        FolderDetail nudeModelInfo = db.FolderDetails.Where(n => n.FolderId == parent).FirstOrDefault();
                        if (nudeModelInfo == null)
                        {
                            db.FolderDetails.Add(new FolderDetail() { FolderId = parent, FolderImage = linkId });
                        }
                        else
                        {
                            nudeModelInfo.FolderImage = linkId;
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
        private string GetFirstImage(int parentFolder)
        {
            string goodLink = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                goodLink = (from l in db.GoDaddyLinks
                            join c in db.CategoryImageLinks on l.Id equals c.ImageLinkId
                            where c.ImageCategoryId == parentFolder
                            select l.Link.StartsWith("http") ? l.Link : l.ExternalLink).FirstOrDefault();
                if (goodLink == null)
                {
                    var categoryFolders = db.CategoryFolders.Where(f => f.Parent == parentFolder).ToList();
                    foreach (CategoryFolder subFolder in categoryFolders)
                    {
                        goodLink = (from l in db.GoDaddyLinks
                                    join c in db.CategoryImageLinks on l.Id equals c.ImageLinkId
                                    where c.ImageCategoryId == subFolder.Id
                                    select l.Link).FirstOrDefault();
                        if (goodLink == null)
                        {
                            var subSubFolders = db.CategoryFolders.Where(f => f.Parent == subFolder.Id).ToList();
                            foreach (CategoryFolder subSubFolder in subSubFolders)
                            {
                                goodLink = (from l in db.GoDaddyLinks
                                            join c in db.CategoryImageLinks on l.Id equals c.ImageLinkId
                                            where c.ImageCategoryId == subSubFolder.Id
                                            select l.Link).FirstOrDefault();
                                if (goodLink != null)
                                    break;
                            }
                        }
                        if (goodLink != null)
                            break;
                    }
                }
            }
            return goodLink;
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
                    imageLinks.Origin = dbCategoryFolder.RootFolder;

                    var childFolders = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    string folderImage = null;

                    foreach (VwDirTree childFolder in childFolders)
                    {
                        if (childFolder.FolderImage == null)
                            folderImage = GetFirstImage(childFolder.Id);
                        else
                        {
                            GoDaddyLink dbGodaddyLink = db.GoDaddyLinks.Where(g => g.Id == childFolder.FolderImage).FirstOrDefault();
                            if (dbGodaddyLink != null)
                                folderImage = dbGodaddyLink.Link;
                            else
                                folderImage = GetFirstImage(childFolder.Id);
                        }

                        imageLinks.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            //DanniPath = folderId,
                            CategoryId = childFolder.Id,
                            DirectoryName = childFolder.FolderName,
                            Length = Math.Max(childFolder.FileCount, childFolder.SubDirCount),
                            FirstImage = folderImage
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
                            ImageLinkId = model.Link
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
                         join g in db.CategoryFolders on p.Parent equals g.Id
                         join l in db.GoDaddyLinks on c.ImageLinkId equals l.Id
                         where f.RootFolder == root
                         select new CarouselItemModel()
                         {
                             RootFolder = f.RootFolder,
                             FolderId = f.Id,
                             ParentId = p.Id,
                             LinkId = l.Id,
                             FolderName = f.FolderName,
                             FolderPath = g.FolderName + "/" + p.FolderName,
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

        int folderCount = 0;
        int fileCount = 0;
        [HttpGet]
        public int[] GetCounts(string root)
        {
            folderCount = 0;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //var ccc = 
                var dbRootId = db.CategoryFolders.Where(f => f.FolderName == root).First().Id;
                GetFolderCountRecurr(dbRootId, db);
                //if (root == "boobs")
                //    folderCount = db.ImageFolders.Where(f => (f.FolderPath.Contains("boobs")) && (!f.FolderPath.Contains("archive"))).Count();
                //if (root == "porn")
                //    folderCount = db.ImageFolders.Where(f => (f.FolderPath.Contains("porn")) && (!f.FolderPath.Contains("sluts"))).Count();
            }
            int[] x = { folderCount, fileCount };
            return x;
        }
        private void GetFolderCountRecurr(int rootId, OggleBoobleContext db)
        {
            var childDirs = db.CategoryFolders.Where(f => f.Parent == rootId).ToList();
            folderCount += childDirs.Count();
            foreach (CategoryFolder subFolder in childDirs)
            {
                fileCount += db.CategoryImageLinks.Where(c => c.ImageCategoryId == rootId).Count();
                GetFolderCountRecurr(subFolder.Id, db);
            }
        }

    }

    [EnableCors("*", "*", "*")]
    public class DashBoardController : ApiController
    {
        // dashboard -- returns a fully loaded dir tree
        [HttpGet]
        public CategoryTreeModel RebuildCatTree()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var dirTree = new CategoryTreeModel() { CategoryId = 0 };
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
            var childFolders = vwDirTree.Where(f => f.Parent == parent.CategoryId).OrderBy(f => f.FolderName).ToList();
            foreach (VwDirTree childFolder in childFolders)
            {
                var subChild = new CategoryTreeModel()
                {
                    CategoryId = childFolder.Id,
                    ParentId = childFolder.Parent,
                    DirectoryName = childFolder.FolderName,
                    Length = Math.Max(childFolder.FileCount, childFolder.SubDirCount),
                    DanniPath = (path + "/" + childFolder.FolderName).Replace(" ", "%20")
                };
                subChild.LinkId = subChild.GetHashCode().ToString();

                parent.SubDirs.Add(subChild);

                GetCatTreeRecurr(subChild, vwDirTree, (path + "/" + childFolder.FolderName).Replace(" ", "%20"));
            }
        }

        [HttpGet]
        public List<GalleryItem> GetBreadCrumbs(int folderId)
        {
            var parents = new List<GalleryItem>();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                parents.Add(new GalleryItem() { FolderId = thisFolder.Id, FolderName = thisFolder.FolderName });
                var parent = thisFolder.Parent;
                while (parent > 1)
                {
                    var parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
                    parents.Add(new GalleryItem() { FolderId = parentDb.Id, FolderName = parentDb.FolderName });
                    parent = parentDb.Parent;
                }
            }
            return parents;
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
        public MetaTagModel GetOne(int tagId, int folderId)
        {
            var metaTag = new MetaTagModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbMetaTag = db.MetaTags.Where(m => m.TagId == tagId).FirstOrDefault();
                    metaTag.FolderId = dbMetaTag.FolderId;
                    metaTag.TagId = dbMetaTag.TagId;
                    metaTag.TagType = dbMetaTag.TagType;
                    metaTag.TagValue = dbMetaTag.TagValue;
                }
            }
            catch (Exception ex)
            {
                metaTag.TagValue = Helpers.ErrorDetails(ex);
            }
            return metaTag;
        }
        [HttpGet]
        public MetaTagInfo GetMetaTags(int folderId)
        {
            MetaTagInfo metaTagInfo = new MetaTagInfo();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    metaTagInfo.FolderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
                    var dbMetaTags = db.MetaTags.Where(m => m.FolderId == folderId).ToList();
                    foreach (MetaTag tag in dbMetaTags)
                    {
                        metaTagInfo.MetaTags.Add(new MetaTagModel()
                        {
                            FolderId = folderId,
                            TagId = tag.TagId,
                            TagType = tag.TagType,
                            TagValue = tag.TagValue
                        });
                    }
                }
                metaTagInfo.Success = "ok";
            }
            catch (Exception ex)
            {
                metaTagInfo.Success = Helpers.ErrorDetails(ex);
            }
            return metaTagInfo;
        }

        [HttpPost]
        public string Insert(MetaTagModel model)
        {
            if (model.TagValue == null)
            {
                return "ok";
            }
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.MetaTags.Add(new MetaTag()
                    {
                        FolderId = model.FolderId,
                        TagType = model.TagType,
                        TagValue = model.TagValue
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
                    metaTag.TagType = model.TagType;
                    metaTag.TagValue = model.TagValue;
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
        public List<BlogComment> Get()
        {
            List<BlogComment> blogComments = new List<BlogComment>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    return db.BlogComments.ToList();
                }
            }
            catch (Exception ex)
            {
                blogComments.Add(new BlogComment() { CommentTitle = Helpers.ErrorDetails(ex) });
            }
            return blogComments;
        }

        [HttpGet]
        public BlogComment Get(int id)
        {
            BlogComment entry = null;
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    entry = db.BlogComments.Where(b => b.Id == id).First();
                }
            }
            catch (Exception ex)
            {
                entry.CommentTitle = Helpers.ErrorDetails(ex);
            }
            return entry;
        }

        [HttpPost]
        public string Insert(BlogComment entry)
        {
            string success = "";
            try
            {
                entry.Posted = DateTime.Now;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.BlogComments.Add(entry);
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
}

