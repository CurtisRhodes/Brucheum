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

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class NudeModelInfoController : ApiController
    {
        [HttpGet]
        public NudeModelInfoModel GetModelName(string linkId)
        {
            var modelInfoModel = new NudeModelInfoModel() { ModelName = "unknown model" };
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //modelInfoModel.RootFolder = db.CategoryFolders.Where(f => f.Id == folderId).First().RootFolder;

                    NudeModelImage dbNudeModelImage = db.NudeModelImages.Where(i => i.LinkId == linkId).FirstOrDefault();
                    if (dbNudeModelImage != null)
                    {
                        NudeModelInfo nudeModelInfo = db.NudeModelInfos.Where(n => n.ModelId == dbNudeModelImage.ModelId).FirstOrDefault();
                        if (nudeModelInfo != null)
                        {
                            modelInfoModel.ModelName = nudeModelInfo.ModelName;
                            modelInfoModel.CommentText = nudeModelInfo.CommentText;
                            modelInfoModel.FolderId = nudeModelInfo.FolderId;
                        }
                    }
                }
            }
            catch (Exception ex) { modelInfoModel.Success = Helpers.ErrorDetails(ex); }
            return modelInfoModel;
        }

        [HttpPost]
        public string Insert(NudeModelInfoModel nudeModelInfoModel)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    // first check if she exists
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == nudeModelInfoModel.FolderId).First();
                    CategoryFolder dbParent = db.CategoryFolders.Where(f => f.FolderName == "posers identified").First();
                    CategoryFolder poser = new CategoryFolder() { FolderName = nudeModelInfoModel.ModelName, RootFolder = dbParent.RootFolder, Parent = dbParent.Id };
                    db.CategoryFolders.Add(poser);
                    db.SaveChanges();

                    string sourceOriginPath = Helpers.GetParentPath(nudeModelInfoModel.FolderId, true);
                    string ftpSource = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/" + sourceOriginPath + dbSourceFolder.FolderName + "/" + nudeModelInfoModel.Link.Substring(nudeModelInfoModel.Link.LastIndexOf("/"));
                    string expectedFileName = nudeModelInfoModel.ModelName + "_" + nudeModelInfoModel.LinkId + ".jpg";

                    

                    string ftpDestinationPath = "ftp://50.62.160.105/archive.ogglebooble.com/posers identified/" + nudeModelInfoModel.ModelName;

                    if (!FtpIO.DirectoryExists(ftpDestinationPath))
                        FtpIO.CreateDirectory(ftpDestinationPath);

                    success = FtpIO.MoveFile(ftpSource, ftpDestinationPath + "/" + expectedFileName);

                    NudeModelInfo newNudeModelInfo = new NudeModelInfo()
                    {                        
                        CommentText = nudeModelInfoModel.CommentText,
                        ExternalLinks = nudeModelInfoModel.ExternalLinks,
                        FolderId = poser.Id,
                        Nationality = nudeModelInfoModel.Nationality,
                        ModelName = nudeModelInfoModel.ModelName,
                        Posted = DateTime.Now
                    };

                    if (nudeModelInfoModel.Born != null)
                        newNudeModelInfo.Born = DateTime.Parse(nudeModelInfoModel.Born);

                    db.NudeModelInfos.Add(newNudeModelInfo);
                    db.SaveChanges();

                    GoDaddyLink goDaddyLink = db.GoDaddyLinks.Where(g => g.Id == nudeModelInfoModel.LinkId).First();
                    goDaddyLink.Link = "http://archive.ogglebooble.com/posers identified/" + nudeModelInfoModel.ModelName + "/" + expectedFileName;


                    db.NudeModelImages.Add(new NudeModelImage() { LinkId = nudeModelInfoModel.LinkId, ModelId = newNudeModelInfo.ModelId });
                    db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = poser.Id, ImageLinkId = nudeModelInfoModel.LinkId });

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
        public string Update(NudeModelInfoModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    NudeModelInfo nudeModel = db.NudeModelInfos.Where(m => m.ModelId == model.ModelId).FirstOrDefault();
                    nudeModel.ModelName = model.ModelName;
                    if (model.Born != null)
                        nudeModel.Born = DateTime.Parse(model.Born);
                    nudeModel.Nationality = model.Nationality;
                    nudeModel.ExternalLinks = model.ExternalLinks;
                    nudeModel.CommentText = model.CommentText;
                    nudeModel.FolderId = model.FolderId;
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
        public string EditFolderCategory(int folderId, string commentText)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    NudeModelInfo dbNudeModelInfo = db.NudeModelInfos.Where(m => m.FolderId == folderId).FirstOrDefault();
                    if (dbNudeModelInfo == null)
                    {
                        CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                        db.NudeModelInfos.Add(new NudeModelInfo() { ModelName = dbDestinationFolder.FolderName, FolderId = folderId, CommentText = commentText, Posted = DateTime.Now });
                    }
                    else
                    {
                        dbNudeModelInfo.CommentText = commentText;
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
    public class NudeModelImageController : ApiController
    {
        [HttpGet]
        public NudeModelInfoModel Get(string linkId)
        {
            var model = new NudeModelInfoModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    NudeModelImage nudeModel = db.NudeModelImages.Where(i => i.LinkId == linkId).FirstOrDefault();
                    if (nudeModel == null)
                    {
                        //db.
                    }
                    else
                    {
                        NudeModelInfo dbNudeModelInfo = db.NudeModelInfos.Where(n => n.ModelId == nudeModel.ModelId).First();
                        model.ModelId = dbNudeModelInfo.ModelId;
                        model.ModelName = dbNudeModelInfo.ModelName;
                        model.FolderId = dbNudeModelInfo.FolderId;
                        model.Nationality = dbNudeModelInfo.Nationality;
                        model.ExternalLinks = dbNudeModelInfo.ExternalLinks;
                        model.CommentText = dbNudeModelInfo.CommentText;
                        if (dbNudeModelInfo.Born != null)
                            model.Born = dbNudeModelInfo.Born.Value.ToShortDateString();
                    }
                    if (model.ExternalLinks == null)
                    {
                        List<CategoryImageLinkModel> linkModels = new CategoryImageLinkController().Get(linkId);
                        foreach (CategoryImageLinkModel linkModel in linkModels)
                        {
                            model.ExternalLinks += "<a href='home/ImagePage?folder=" + linkModel.ImageCategoryId + "'>" + linkModel.FolderName + "</a><br/>";
                        }
                    }
                }
                model.Success = "ok";
            }
            catch (Exception ex)
            {
                model.Success = Helpers.ErrorDetails(ex);
            }
            return model;
        }
        [HttpPost]
        public string Insert(NudeModelImageModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.NudeModelImages.Add(new NudeModelImage()
                    {
                        ModelId = model.ModelId,
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
    }

    [EnableCors("*", "*", "*")]
    public class CategoryFolderController : ApiController
    {        
        // used by _CategoryDialog
        [HttpGet]
        public CategoryFolderModel Get(int id)
        {
            CategoryFolderModel categoryFolderModel = new CategoryFolderModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    NudeModelInfo folderInfo = db.NudeModelInfos.Where(n => n.FolderId == id).FirstOrDefault();
                    if (folderInfo != null)
                        categoryFolderModel.CategoryText = folderInfo.CommentText;

                    CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == id).First();
                    categoryFolderModel.Id = dbCategoryFolder.Id;
                    categoryFolderModel.Parent = dbCategoryFolder.Parent;
                    categoryFolderModel.FolderName = dbCategoryFolder.FolderName;
                    categoryFolderModel.RootFolder = dbCategoryFolder.RootFolder;
                    categoryFolderModel.FolderImage = dbCategoryFolder.FolderImage;
                    categoryFolderModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                categoryFolderModel.Success = Helpers.ErrorDetails(ex);
            }
            return categoryFolderModel;
        }

        [HttpPut]
        public string setFolderImage(string linkId, int folderId, string level)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder dbCategoryFolder = null;
                    dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    if (level == "folder")
                        dbCategoryFolder.FolderImage = linkId;
                    else
                    {
                        CategoryFolder dbCategoryParentFolder = db.CategoryFolders.Where(f => f.Id == dbCategoryFolder.Parent).First();
                        dbCategoryParentFolder.FolderImage = linkId;
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
        public CategoryImageModel GetImageLinks(int folderId)
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var imageLinks = new CategoryImageModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //var childFolders = db.ImageCategories.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    var childFolders = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    string folderImage = null;
                    foreach (VwDirTree childFolder in childFolders)
                    {
                        if (childFolder.FolderImage == null)
                            folderImage = GetFirstImage(childFolder.Id);
                        else
                            folderImage = db.GoDaddyLinks.Where(g => g.Id == childFolder.FolderImage).First().Link;

                        imageLinks.SubDirs.Add(new CategoryTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            CategoryId = childFolder.Id,
                            DirectoryName = childFolder.FolderName,
                            Length = Math.Max(childFolder.FileCount, childFolder.SubDirCount),
                            FirstImage = folderImage
                        });
                    }

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
        public string CopyImageLink(CopyLinkModel newLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryImageLink existingLink = db.CategoryImageLinks.Where(l => l.ImageCategoryId == newLink.CopyToFolderId).Where(l => l.ImageLinkId == newLink.ImageId).FirstOrDefault();
                    if (existingLink != null)
                        success = "Link already exists";
                    else
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = newLink.CopyToFolderId,
                            ImageLinkId = newLink.ImageId
                        });
                        db.SaveChanges();
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        // impagePage remove
        [HttpDelete]
        public string DeleteImageLink(DeleteLinkModel badLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbBadLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == badLink.FolderId && c.ImageLinkId == badLink.ImageId).First();
                    db.CategoryImageLinks.Remove(dbBadLink);

                    ///TODO:   move image to reject folder

                    db.SaveChanges();
                    success = "ok";
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
                             //ModelName = db.NudeModelInfos.Where(n => n.FolderId == f.Id).FirstOrDefault() == null ? "unknown" : db.NudeModelInfos.Where(n => n.FolderId == f.Id).First().ModelName,
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
        [HttpPatch]
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

        // dashboard
         private string OldMoveFolder(MoveFolderModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbFolderToMove = db.CategoryFolders.Where(f => f.Id == model.FolderToMoveId).First();

                    var dbNewParent = db.CategoryFolders.Where(f => f.Id == model.NewParentId).First();
                    //var newFolderPath = dbNewParent.FolderPath + "/" + dbFolderToMove.FolderName;

                    dbFolderToMove.Parent = model.NewParentId;
                    //dbFolderToMove.FolderPath = newFolderPath;

                    //List<ImageFolder> subdirs = db.ImageFolders.Where(f => f.Parent == model.FolderToMoveId).ToList();
                    //foreach (ImageFolder subdir in subdirs)
                    //{
                    //    subdir.FolderPath = newFolderPath + "/" + subdir.FolderName;
                    //}
                    db.SaveChanges();
                    success = dbNewParent.FolderName;
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        // dashboard
        private string OldRenameFolder(int folderId, string newName)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                    dbFolder.FolderName = newName;
                    ////todo: rename images here 
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
        public MetaTagModel GetOne(int tagId,int folderId)
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
                   MetaTag metaTag= db.MetaTags.Where(m => m.TagId == tagId).FirstOrDefault();
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

    [EnableCors("*", "*", "*")]
    public class CategoryImageLinkController : ApiController
    {
        [HttpGet]
        public List<CategoryImageLinkModel> Get(string linkId)
        {
            List<CategoryImageLinkModel> links = null;
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    links = (from c in db.CategoryImageLinks
                                   join f in db.CategoryFolders on c.ImageCategoryId equals f.Id
                                   where c.ImageLinkId == linkId
                                   select new CategoryImageLinkModel() {
                                       ImageCategoryId = f.Id,
                                       FolderName = f.FolderName
                                   }).ToList();
                }
            }
            catch (Exception ex)
            {
                links.Add(new CategoryImageLinkModel() { ImageLinkId = Helpers.ErrorDetails(ex) });
            }
            return links;
        }
    }
}


