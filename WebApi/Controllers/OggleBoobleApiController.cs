using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Directory.Models;
using WebApi.OggleBooble.DataContext;

namespace WebApi.OggleBooble
{
    [EnableCors("*", "*", "*")]
    public class ImageFolderController : ApiController
    {
        [HttpGet]
        public ImageCategoryModel Get(int id)
        {
            var model = new ImageCategoryModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbImageCategories = db.ImageCategories.Where(f => f.Id == id).First();
                    model.Id = dbImageCategories.Id;
                    model.Parent = dbImageCategories.Parent;
                    model.FolderName = dbImageCategories.FolderName;
                    model.RootFolder = dbImageCategories.RootFolder;
                }
            }
            catch (Exception ex)
            {
                model.FolderName = Helpers.ErrorDetails(ex);
            }
            return model;
        }

        [HttpPut]
        public string Update(ImageCategoryModel model, string field)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //var dbImageFolder = db.ImageCategories.Where(f => f.Id == model.Id).First();
                    //if (field == "fileCount")
                    //    dbImageFolder.FileCount = model.FileCount;
                    //if (field == "description")
                    //    dbImageFolder.CatergoryDescription = model.CatergoryDescription;
                    ////dbImageFolder.FolderPath = model.FolderPath;
                    ////dbImageFolder.FolderName = model.FolderName;
                    ////dbImageFolder.Parent = model.Parent;
                    //db.SaveChanges();
                    success = "xxx";
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

        // imagePage copy
        [HttpPut]
        public string CopyImageLink(ImageLinkModel newLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.Category_ImageLinks.Add(new Category_ImageLink()
                    {
                        ImageCategoryId = newLink.CopyToFolderId,
                        ImageLinkId = newLink.ImageId
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        // impagePage remove
        [HttpDelete]
        public string DeleteImageLink(ImageLinkModel badLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbBadLink = db.Category_ImageLinks.Where(c => c.ImageCategoryId == badLink.FolderId && c.ImageLinkId == badLink.ImageId).First();
                    db.Category_ImageLinks.Remove(dbBadLink);

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
        public CarouselInfoModel GetLinks(string root, int headstart)
        {
            CarouselInfoModel carouselInfo = new CarouselInfoModel();

            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    carouselInfo.Links =
                        (from c in db.Category_ImageLinks
                         join f in db.ImageCategories on c.ImageCategoryId equals f.Id
                         join p in db.ImageCategories on f.Parent equals p.Id
                         join g in db.ImageCategories on p.Parent equals g.Id
                         join l in db.GoDaddyLinks on c.ImageLinkId equals l.Id
                         where f.RootFolder == root
                         select new CarouselItemModel()
                         {
                             RootFolder = f.RootFolder,
                             FolderId = f.Id,
                             ParentId = p.Id,
                             FolderName = f.FolderName,
                             FolderPath = g.FolderName + "/" + p.FolderName,
                             Link = l.Link.StartsWith("http") ? l.Link : l.ExternalLink
                         }).Take(headstart).ToList();
                }
                carouselInfo.FolderCount = carouselInfo.Links.GroupBy(l => l.FolderName).Count();
                timer.Stop();
                System.Diagnostics.Debug.WriteLine("Select " + headstart + " from vLinks took: " + timer.Elapsed);
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
                var dbRootId = db.ImageCategories.Where(f => f.FolderName == root).First().Id;
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
            var childDirs = db.ImageCategories.Where(f => f.Parent == rootId).ToList();
            folderCount += childDirs.Count();
            foreach (ImageCategory subFolder in childDirs)
            {
                fileCount += db.Category_ImageLinks.Where(c => c.ImageCategoryId == rootId).Count();
                GetFolderCountRecurr(subFolder.Id, db);
            }
        }

    }

    [EnableCors("*", "*", "*")]
    public class DashBoardController : ApiController
    {
        // dashboard -- returns a fully loaded dir tree
        [HttpGet]
        public DirTreeModel RebuildCatTree()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var dirTree = new DirTreeModel() { DirectoryName = "RoOt", CategoryId = 0 };
            List<VDirTree> vwDirTree = null;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                // wowdid this speed things up
                vwDirTree = db.VDirTrees.ToList();
                //GetCatTreeRecurr(danni, db);
            }
            GetCatTreeRecurr(dirTree, vwDirTree, "");

            timer.Stop();
            System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
            return dirTree;
        }
        private void GetCatTreeRecurr(DirTreeModel parent, List<VDirTree> vwDirTree, string path)
        {
            //List<ImageFolder> childFolders = db.ImageFolders.Where(f => f.Parent == parent.CategoryId).OrderBy(f => f.FolderName).ToList();
            var childFolders = vwDirTree.Where(f => f.Parent == parent.CategoryId).OrderBy(f => f.FolderName).ToList();
            foreach (VDirTree childFolder in childFolders)
            {
                var subChild = new DirTreeModel()
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
                var thisFolder = db.ImageCategories.Where(f => f.Id == folderId).First();
                parents.Add(new GalleryItem() { FolderId = thisFolder.Id, FolderName = thisFolder.FolderName });
                var parent = thisFolder.Parent;
                while (parent > 1)
                {
                    var parentDb = db.ImageCategories.Where(f => f.Id == parent).First();
                    parents.Add(new GalleryItem() { FolderId = parentDb.Id, FolderName = parentDb.FolderName });
                    parent = parentDb.Parent;
                }
            }
            return parents;
        }

        // dashboard   
        [HttpPost]
        public string AddImageLink(ImageLinkModel newLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string imageLinkId = Guid.NewGuid().ToString();
                    var existingLink = db.GoDaddyLinks.Where(l => l.ExternalLink == newLink.Link).FirstOrDefault();
                    if (existingLink != null)
                        imageLinkId = existingLink.Id;
                    else
                    {
                        ImageCategory dbCategory = db.ImageCategories.Where(f => f.Id == newLink.FolderId).First();
                        string pleskPath = "G:/PleskVhosts//curtisrhodes.com/" + dbCategory.RootFolder + ".ogglebooble.com/";
                        string danniPath = "F:/Danni/";
                        string extension = newLink.Link.Substring(newLink.Link.Length - 4);
                        string newFileName = dbCategory.FolderName + "_" + imageLinkId + extension;
                        var trimPath = newLink.Path.Substring(newLink.Path.IndexOf("/") + 1);

                        // todo  write the image as a file to x.ogglebooble
                        System.IO.DirectoryInfo dirInfo = new System.IO.DirectoryInfo(danniPath + newLink.Path);
                        if (!dirInfo.Exists)
                            dirInfo.Create();
                        dirInfo = new System.IO.DirectoryInfo(pleskPath + trimPath);
                        if (!dirInfo.Exists)
                            dirInfo.Create();

                        using (WebClient wc = new WebClient())
                        {
                            wc.DownloadFile(new Uri(newLink.Link), pleskPath + trimPath + "/" + newFileName);
                            wc.DownloadFile(new Uri(newLink.Link), danniPath + newLink.Path + "/" + newFileName);
                        }

                        var goDaddyLink = "http://" + dbCategory.RootFolder + ".ogglebooble.com/";
                        db.GoDaddyLinks.Add(new GoDaddyLink()
                        {
                            Id = imageLinkId,
                            ExternalLink = newLink.Link,
                            Link = goDaddyLink + trimPath + "/" + newFileName
                        });
                        db.SaveChanges();
                    }
                    db.Category_ImageLinks.Add(new Category_ImageLink()
                    {
                        ImageCategoryId = newLink.FolderId,
                        ImageLinkId = imageLinkId
                    });
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        // dashboard
        [HttpPatch]
        public string CreateFolder(ImageCategoryModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var rootFolder = db.ImageCategories.Where(f => f.Id == model.Parent).FirstOrDefault().RootFolder;
                    if (rootFolder == "root")
                        rootFolder = model.FolderName;

                    db.ImageCategories.Add(new ImageCategory()
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
        [HttpPut]
        public string MoveFolder(MoveFolderModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbFolderToMove = db.ImageCategories.Where(f => f.Id == model.FolderToMoveId).First();

                    var dbNewParent = db.ImageCategories.Where(f => f.Id == model.NewParentId).First();
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
        [HttpPut]
        public string RenameFolder(int folderId, string newName)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbFolder = db.ImageCategories.Where(f => f.Id == folderId).First();
                    //var newFolderPath = dbFolder.FolderPath.Substring(0, dbFolder.FolderPath.LastIndexOf("/") + 1) + newName;
                    //dbFolder.FolderPath = newFolderPath;
                    dbFolder.FolderName = newName;

                    ////todo: rename images here 


                    //List<ImageFolder> subdirs = db.ImageFolders.Where(f => f.Parent == folderId).ToList();
                    //foreach (ImageFolder subdir in subdirs)
                    //{
                    //    subdir.FolderPath = newFolderPath + "/" + subdir.FolderName;
                    //}
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
    public class ImageLinkController : ApiController
    {
        private string GetFirstImage(int parentFolder)
        {
            string goodLink = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                goodLink = (from l in db.GoDaddyLinks
                            join c in db.Category_ImageLinks on l.Id equals c.ImageLinkId
                            where c.ImageCategoryId == parentFolder
                            select  l.Link.StartsWith("http") ? l.Link : l.ExternalLink).FirstOrDefault();
                if (goodLink == null)
                {
                    var imageCategories = db.ImageCategories.Where(f => f.Parent == parentFolder).ToList();
                    foreach (ImageCategory subFolder in imageCategories)
                    {
                        goodLink = (from l in db.GoDaddyLinks
                                    join c in db.Category_ImageLinks on l.Id equals c.ImageLinkId
                                    where c.ImageCategoryId == subFolder.Id
                                    select l.Link).FirstOrDefault();
                        if (goodLink == null)
                        {
                            var subSubFolders = db.ImageCategories.Where(f => f.Parent == subFolder.Id).ToList();
                            foreach (ImageCategory subSubFolder in subSubFolders)
                            {
                                goodLink = (from l in db.GoDaddyLinks
                                            join c in db.Category_ImageLinks on l.Id equals c.ImageLinkId
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
        public DirTreeModel Get(int folderId)
        {
            var folderModel = new DirTreeModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //var childFolders = db.ImageCategories.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    var childFolders = db.VDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                    foreach (VDirTree childFolder in childFolders)
                    {
                        folderModel.SubDirs.Add(new DirTreeModel()
                        {
                            LinkId = Guid.NewGuid().ToString(),
                            CategoryId = childFolder.Id,
                            DirectoryName = childFolder.FolderName,
                            Length = Math.Max(childFolder.FileCount, childFolder.SubDirCount),
                            //Path = childFolder.FolderPath,
                            FirstImage = GetFirstImage(childFolder.Id)
                        });
                    }

                    folderModel.Files =
                        (from c in db.Category_ImageLinks
                         join il in db.GoDaddyLinks on c.ImageLinkId equals il.Id
                         where c.ImageCategoryId == folderId
                         select new FileModel()
                         {
                             //FullName = ? "": c.ImageLinkId,
                             ImageId = il.Id,
                             FileName = il.Link.StartsWith("http") ? il.Link : il.ExternalLink
                         }).ToList();
                }
                folderModel.DirectoryName = "ok";
            }
            catch (Exception ex)
            {
                folderModel.DirectoryName = Helpers.ErrorDetails(ex);
            }
            return folderModel;
        }
         
        string RebuildLinkTables()
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.Database.ExecuteSqlCommand("truncate table OggleBooble.BoobsLink");
                    db.Database.ExecuteSqlCommand("insert OggleBooble.BoobsLink " +
                        " select Id, FolderName, FolderPath, LinkId, Link from OggleBooble.vwLinks" +
                        " where RootFolder = 'boobs' and FolderPath not like '%archive%'" +
                        " order by LinkId");

                    db.Database.ExecuteSqlCommand("truncate table OggleBooble.PornLink");
                    db.Database.ExecuteSqlCommand("insert OggleBooble.PornLink "+
                        " select Id, FolderName, FolderPath, LinkId, Link from OggleBooble.vwLinks" +
                        " where RootFolder = 'porn' and FolderPath not like '%sluts%'"+
                        " order by LinkId");

                    //// reset filecount   --  
                    //db.Database.ExecuteSqlCommand("update OggleBooble.ImageFolder set filecount =" +
                    //    " (select count(*) from OggleBooble.Category_ImageLink c where c.ImageCategoryId = OggleBooble.ImageFolder.id)");

                    //db.Database.ExecuteSqlCommand("update OggleBooble.ImageFolder set OggleBooble.ImageFolder.filecount = " +
                    //    "(select SubDirCount from OggleBooble.vwDirTree where Id = OggleBooble.ImageFolder.Id )" +
                    //    " where OggleBooble.ImageFolder.FileCount = 0");

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
            List<BlogComment> entries = null;
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    entries = db.BlogComments.ToList();
                }
            }
            catch (Exception ex)
            {
                entries.Add(new BlogComment() { CommentTitle = Helpers.ErrorDetails(ex) });
            }
            return entries;
        }

        [HttpGet]
        public BlogComment Get(string title)
        {
            BlogComment entry = null;
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    entry = db.BlogComments.Where(b => b.CommentTitle == title).First();
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
                    var dbEntry = db.BlogComments.Where(b => b.CommentTitle == entry.CommentTitle).First();
                    //dbEntry.CommentTitle = entry.CommentTitle;
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


