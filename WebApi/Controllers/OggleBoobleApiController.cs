using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Directory.Models;
using WebApi.OggleBooble.DataContext;

namespace WebApi.OggleBooble
{
    [EnableCors("*", "*", "*")]
    public class ImageFolderController : ApiController
    {
        // used by rebuildLinkTables
        [HttpGet]
        public string[] Get()
        {
            List<string> folderPaths = new List<string>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var folders = db.ImageFolders.ToList();
                    foreach (ImageFolder f in folders)
                    {
                        folderPaths.Add(f.FolderPath);
                    }

                }
            }
            catch (Exception ex)
            {
                folderPaths.Add(Helpers.ErrorDetails(ex));
            }
            return folderPaths.ToArray();
        }

        // used by ImagePage
        [HttpGet]
        public DirectoryModel GetLinks(string folder)
        {
            var folderModel = new DirectoryModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    folderModel.CategoryId = db.ImageFolders.Where(f => f.FolderPath == folder).FirstOrDefault().Id;

                    folderModel.SubDirs.AddRange((from f1 in db.ImageFolders
                                                  join fp in db.ImageFolders on f1.Parent equals fp.Id
                                                  where fp.FolderPath == folder
                                                  select new DirectoryModel()
                                                  {
                                                      LinkId = Guid.NewGuid().ToString(),
                                                      CategoryId = f1.Id,
                                                      DirectoryName = f1.FolderName,
                                                      Path = f1.FolderPath,
                                                      FirstImage = (from f2 in db.ImageFolders
                                                                    join cl in db.Category_ImageLinks on f2.Id equals cl.ImageCategoryId
                                                                    join il in db.ImageLinks on cl.ImageLinkId equals il.Id
                                                                    where f2.FolderPath.StartsWith(f1.FolderPath)
                                                                    select il.Link).FirstOrDefault()
                                                  }).ToList());

                    // images
                    folderModel.Files = (from pp in db.ImageFolders
                                         join pl in db.Category_ImageLinks on pp.Id equals pl.ImageCategoryId
                                         join il in db.ImageLinks on pl.ImageLinkId equals il.Id
                                         where pp.FolderPath == folder
                                         select new FileModel()
                                         {
                                             ImageId = il.Id,
                                             FileName = il.Link
                                         }
                                      ).ToList();
                }
                folderModel.DirectoryName = "ok";
            }
            catch (Exception ex)
            {
                folderModel.DirectoryName = Helpers.ErrorDetails(ex);
            }
            return folderModel;
        }

        // dashboard
        [HttpPost]
        public string CreateFolder (ImageFolderModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.ImageFolders.Add(new ImageFolder()
                    {
                        Parent = model.Parent,
                        FolderName = model.FolderName,
                        FolderPath = model.FolderPath
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
                    var dbFolderToMove = db.ImageFolders.Where(f => f.Id == model.FolderToMoveId).First();

                    var dbNewParent = db.ImageFolders.Where(f => f.Id == model.NewParentId).First();
                    var newFolderPath = dbNewParent.FolderPath + "/" + dbFolderToMove.FolderName;

                    dbFolderToMove.Parent = model.NewParentId;
                    dbFolderToMove.FolderPath = newFolderPath;

                    db.SaveChanges();
                    success = dbNewParent.FolderPath;
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
        // used by viewer
        [HttpGet]
        public List<FileModel> GetFiles(string folderPath)
        {
            if (folderPath.StartsWith("/"))
                folderPath = folderPath.Substring(1);
                
            List<FileModel> links = new List<FileModel>();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                links = (from f in db.ImageFolders
                         join c in db.Category_ImageLinks on f.Id equals c.ImageCategoryId
                         join l in db.ImageLinks on c.ImageLinkId equals l.Id
                         where f.FolderPath == folderPath
                         select new FileModel() {
                             FileName = l.Link.Replace(" ", "%20")
                         }).ToList();

            }
            return links;
        }
    }

    [EnableCors("*", "*", "*")]
    public class ImageLinkCategoryController : ApiController
    {
        // dashboard
        [HttpGet]
        public DirectoryModel RebuildCatTree()
        {
            var timer = new System.Diagnostics.Stopwatch();
            timer.Start();
            var danni = new DirectoryModel() { DirectoryName = "RoOt", CategoryId = 0 };
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                GetCatTreeRecurr(danni, db);
            }
            timer.Stop();
            System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
            return danni;
        }
        private void GetCatTreeRecurr(DirectoryModel parent, OggleBoobleContext db)
        {
            var childFolders = db.ImageFolders.Where(f => f.Parent == parent.CategoryId).ToList();
            foreach (ImageFolder childFolder in childFolders)
            {
                if (childFolder.FolderName != "Root")
                {
                    var linkCount = db.Category_ImageLinks.Where(c => c.ImageCategoryId == childFolder.Id).Count();
                    if (childFolder.FileCount < linkCount)
                    {
                        childFolder.FileCount = linkCount;
                    }
                    var subChild = new DirectoryModel()
                    {
                        CategoryId = childFolder.Id,
                        ParentId = childFolder.Parent,
                        DirectoryName = childFolder.FolderName,
                        Length = childFolder.FileCount,
                        DanniPath = childFolder.FolderPath.Replace(" ", "%20"),
                        Path = childFolder.FolderPath + "/" + childFolder.FolderName,
                    };
                    subChild.LinkId = subChild.GetHashCode().ToString();

                    parent.SubDirs.Add(subChild);
                    GetCatTreeRecurr(subChild, db);
                }
            }
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
                    var existingLink = db.ImageLinks.Where(l => l.Link == newLink.Link).FirstOrDefault();
                    if (existingLink != null)
                        imageLinkId = existingLink.Id;
                    else
                    {
                        db.ImageLinks.Add(new ImageLink()
                        {
                            Id = imageLinkId,
                            Link = newLink.Link
                        });
                        db.SaveChanges();
                    }
                    db.Category_ImageLinks.Add(new Category_ImageLink()
                    {
                        ImageCategoryId = newLink.PathId,
                        ImageLinkId = imageLinkId
                    });
                    //var dbFolder = db.ImageFolders.Where(f => f.Id == newLink.PathId).First();
                    //var dbParentFoder = db.ImageFolders.Where(f => f.Id == dbFolder.Parent).First();
                    //var root = dbFolder.FolderPath.Substring(0, dbFolder.FolderPath.IndexOf("/"));
                    //db.FolderLinks.Add(new FolderLink()
                    //{
                    //    RootFolder = root,
                    //    Parent = dbParentFoder.FolderName,
                    //    FolderName = dbFolder.FolderName,
                    //    FolderPath = dbFolder.FolderPath,
                    //    Link = newLink.Link,
                    //    LinkId = imageLinkId
                    //});

                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

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
                        ImageCategoryId = newLink.PathId,
                        ImageLinkId = newLink.Link
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
                    var dbBadLink = db.Category_ImageLinks.Where(c => c.ImageCategoryId == badLink.PathId && c.ImageLinkId == badLink.Link).First();
                    db.Category_ImageLinks.Remove(dbBadLink);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class DirectoryController : ApiController
    {
        [HttpGet]
        public string[] Get(string folder)
        {
            string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/transitions") + "/" + folder;
            FileInfo[] files = new DirectoryInfo(danni).GetFiles();
            List<string> images = new List<string>();
            foreach (FileInfo img in files)
                images.Add(img.Name);
            return images.ToArray();
        }

        // Super Fast But Does Not Use Tables
        // step one in building ImageLink table
        int indentId = 0;
        [HttpGet]
        public DirectoryModel GetDirTree()
        {
            var danniTree = new DirectoryModel();
            string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");

            var boobsFolder = new DirectoryModel()
            {
                DirectoryName = "boobs",
                Path = fullFolderPath + "boobs",
                CategoryId = ++indentId,
                DanniPath = "boobs"
            };
            danniTree.SubDirs.Add(boobsFolder);
            RecurrGetDirTree(boobsFolder);

            var pornFolder = new DirectoryModel()
            {
                DirectoryName = "porn",
                Path = fullFolderPath + "Porn",
                CategoryId = ++indentId,
                DanniPath = "porn"
            };
            danniTree.SubDirs.Add(pornFolder);
            RecurrGetDirTree(pornFolder);

            return danniTree;
        }
        private void RecurrGetDirTree(DirectoryModel parentFolder)
        {
            try
            {
                DirectoryInfo directory = new DirectoryInfo(parentFolder.Path);
                foreach (FileInfo fileInfo in directory.GetFiles())
                {
                    if (fileInfo.Extension != ".db")
                    {
                        parentFolder.Files.Add(new FileModel()
                        {
                            FileName = fileInfo.Name,
                            FullName = fileInfo.FullName,
                            Created = fileInfo.CreationTime,
                            Extension = fileInfo.Extension,
                            Length = fileInfo.Length
                        });
                    }
                    else
                        Console.Write(directory.Name);
                }

                foreach (DirectoryInfo subDirInfo in directory.GetDirectories())
                {
                    var subDir = new DirectoryModel()
                    {
                        CategoryId = ++indentId,
                        ParentId = parentFolder.CategoryId,
                        LinkId = Guid.NewGuid().ToString(),
                        Path = subDirInfo.FullName,
                        Length = subDirInfo.GetFiles().Length,
                        DanniPath = parentFolder.DanniPath + "/" + subDirInfo.Name,
                        DirectoryName = subDirInfo.Name
                    };
                    parentFolder.SubDirs.Add(subDir);
                    RecurrGetDirTree(subDir);
                }
            }
            catch (Exception ex)
            {
                parentFolder.DirectoryName = Helpers.ErrorDetails(ex);
            }
        }


        // THE BIG ONE
        int totalFiles = 0;
        int fileProgress = 0;
        [HttpPost]
        public string BuildImageFolderTable()
        {
            string success = "";
            string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");
            try
            {
                Helpers.SendProgress("Getting Image Count", fileProgress, totalFiles);
                totalFiles = getImageCount();
                Helpers.SendProgress("...", fileProgress, totalFiles);

                DirectoryInfo dir = new DirectoryInfo(fullFolderPath);

                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //$('#dataifyInfo').show().html("rebuild ImageLink and ImageFolder tables");
                    db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageFolder");
                    db.Database.ExecuteSqlCommand("dbcc checkident ('OggleBooble.ImageFolder', RESEED, 0)");
                    db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageLink");

                    var dbRoot = new ImageFolder()
                    {
                        FolderName = "Root",
                        FolderPath = "/",
                        FileCount = 0
                    };
                    db.ImageFolders.Add(dbRoot);
                    db.SaveChanges();

                    Helpers.SendProgress("opening data context ", fileProgress, totalFiles);
                    var subDirs = new DirectoryInfo(fullFolderPath).GetDirectories();
                    foreach (DirectoryInfo subDir in subDirs)
                    {
                        var dbRow = new ImageFolder()
                        {
                            FolderName = subDir.Name,
                            FolderPath = subDir.Name,
                            FileCount = subDir.GetFiles().Length,
                            Parent = 0
                        };
                        db.ImageFolders.Add(dbRow);
                        db.SaveChanges();
                        Helpers.SendProgress("Processing " + subDir.FullName, fileProgress, totalFiles);
                        RecurrbuildImageFolderTable(dbRow.Id, subDir.Name, subDir.FullName, db);
                    }
                    success = "ok";

                    Helpers.SendProgress("building Cat_Link table", fileProgress, totalFiles);
                    db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink " +
                        "select f.Id ImageCategoryId, l.Id imageLinkId " +
                        "from OggleBooble.ImageLink l " +
                        "join OggleBooble.ImageFolder f on f.FolderPath = substring(l.Link, 45, len(Link) " +
                        " - 44 - charindex('/', reverse(l.Link)))");

                    Helpers.SendProgress("adding custom links back into ImageLink and CatLink", fileProgress, totalFiles);
                    //--put custom links back into ImageLink and CatLink
                    db.Database.ExecuteSqlCommand("insert OggleBooble.ImageLink select max(newid()), link from OggleBooble.CustomLink group by link");
                    db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink select f.Id, l.Id from OggleBooble.CustomLink c " +
                        "join OggleBooble.ImageFolder f on f.FolderPath = c.FolderPath join OggleBooble.ImageLink l on l.Link = c.Link");
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
        private void RecurrbuildImageFolderTable(int parentId, string danniPath, string folderPath, OggleBoobleContext db)
        {
            var subDirs = new DirectoryInfo(folderPath).GetDirectories();
            string linkPath = "https://api.curtisrhodes.com/App_Data/Danni/";

            foreach (DirectoryInfo subDir in subDirs)
            {
                var dbRow = new ImageFolder()
                {
                    FolderName = subDir.Name,
                    FolderPath = danniPath + "/" + subDir.Name,
                    FileCount = subDir.GetFiles().Length,
                    Parent = parentId
                };
                db.ImageFolders.Add(dbRow);

                foreach (FileInfo file in subDir.GetFiles())
                {
                    if (file.Extension != ".db")
                    {
                        db.ImageLinks.Add(new ImageLink()
                        {
                            Id = Guid.NewGuid().ToString(),
                            Link = linkPath + danniPath + "/" + subDir.Name + "/" + file.Name.Replace(" ", "%20")
                        });
                    
                        fileProgress++;
                    }
                }
                db.SaveChanges();

                Helpers.SendProgress("...", fileProgress, totalFiles);

                RecurrbuildImageFolderTable(dbRow.Id, danniPath + "/" + subDir.Name, subDir.FullName, db);
            }
        }

        private int getImageCount()
        {
            string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");
            var subDirs = new DirectoryInfo(fullFolderPath + "boobs").GetDirectories();
            foreach (DirectoryInfo subDir in subDirs)
            {
                totalFiles += getImageCountRecurr(subDir);
            }
            return totalFiles;
        }
        private int getImageCountRecurr(DirectoryInfo subdir)
        {
            int fileCount = subdir.GetFiles().Length;
            foreach (DirectoryInfo dir in subdir.GetDirectories())
            {
                fileCount += getImageCountRecurr(dir);
            }

            return fileCount;
        }
    }

    [EnableCors("*", "*", "*")]
    public class CarouselController : ApiController
    {
        // Carousel
        [HttpGet]
        public int GetFolderCount()
        {
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //return db.ImageFolders.ToList().Count();
                return db.ImageFolders.Count();
            }
        }

        // used by carosel get all
        [HttpGet]
        public List<VLink> GetAll(string root)
        {
            var allImages = new List<VLink>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var timer = new System.Diagnostics.Stopwatch();
                    timer.Start();
                    allImages = db.VLinks.Where(l => l.RootFolder == root).ToList();
                    timer.Stop();
                    System.Diagnostics.Debug.WriteLine("Select * from vLinks took: " + timer.Elapsed);
                }
            }
            catch (Exception ex)
            {
                allImages.Add(new VLink() { FolderName = Helpers.ErrorDetails(ex) });
            }
            return allImages;
        }

        // used by carosel get all
        [HttpGet]
        public List<VLink> GetaFew(string root, int headstart)
        {
            var afewImages = new List<VLink>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var timer = new System.Diagnostics.Stopwatch();
                    timer.Start();
                    afewImages = db.VLinks.Where(l => l.RootFolder == root).Take(headstart).ToList();
                    timer.Stop();
                    System.Diagnostics.Debug.WriteLine("Select " + headstart + " from vLinks took: " + timer.Elapsed);
                }
            }
            catch (Exception ex)
            {
                afewImages.Add(new VLink() { FolderName = Helpers.ErrorDetails(ex) });
            }
            return afewImages;
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
}


