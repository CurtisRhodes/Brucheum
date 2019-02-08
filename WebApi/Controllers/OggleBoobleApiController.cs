using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
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

        [HttpPost]
        public string CreateVirtualFolder (ImageFolderModel model)
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

        [HttpPut]
        public string MoveVirtualFolder(ImageFolderModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    /// replace parent

                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }




        //writeFolderArrayItems
        string Add(List<ImageFolderModel> treeItems)
        {
            string success = "";
            try
            {
                //using (OggleBoobleContext db = new OggleBoobleContext())
                //{
                //    // save custom links
                //    db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.CustomLink");

                //    List<ImageLinkModel> customLinks = (from il in db.ImageLinks
                //                                   join cl in db.Category_ImageLinks on il.Id equals cl.ImageLinkId
                //                                   join f in db.ImageFolders on cl.ImageCategoryId equals f.Id
                //                                   where !il.Link.Contains("https://api.curtisrhodes.com/App_Data/Danni")
                //                                   select new ImageLinkModel() { Link = il.Link, Path = f.FolderPath }).ToList();
                //    foreach (ImageLinkModel linkModel in customLinks)
                //    {
                //        db.CustomLinks.Add(new CustomLink() {
                //            Link = linkModel.Link,
                //            FolderPath = linkModel.Path
                //        });
                //    }
                //    db.SaveChanges();

                //    db.Database.ExecuteSqlCommand("DROP TABLE OggleBooble.Category_ImageLink");
                //    db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.ImageLink");
                //    db.Database.ExecuteSqlCommand("create table OggleBooble.Category_ImageLink(" +
                //        "ImageCategoryId int foreign key references OggleBooble.ImageFolder(Id)," +
                //        "ImageLinkId nvarchar(128) foreign key references OggleBooble.ImageLink(Id)," +
                //        "primary key(ImageCategoryId, ImageLinkId))");
                //    success = "ok";
                //}
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return "Obsolete";
        }

        [HttpPatch]
        public int GetFolderCount()
        {
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //return db.ImageFolders.ToList().Count();
                return db.ImageFolders.Count();
            }
        }
    }

    [EnableCors("*", "*", "*")]
    public class ImageLinkController : ApiController
    {
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

        [HttpPost]
        public string writeImageLinks(string[] imageFolders)
        {
            //writeFolderArrayItems step 2  datify images saved in folder 
            string success = "";
            var totalFilesAdded = 0;
            try
            {
                //string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");
                //DirectoryInfo dir = new DirectoryInfo(fullFolderPath);
                string danniPath = "https://api.curtisrhodes.com/App_Data/Danni/";
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    foreach (string folderPath in imageFolders)
                    {
                        FileInfo[] fileInfos = new DirectoryInfo(folderPath).GetFiles();
                        var filesAdded = 0;
                        foreach (FileInfo fileInfo in fileInfos)
                        {
                            if (fileInfo.Extension != ".db")
                            {
                                var imageLinkRow = new ImageLink();
                                imageLinkRow.Id = Guid.NewGuid().ToString();
                                imageLinkRow.Link = danniPath + "/" + fileInfo.Name.Replace(" ", "%20");

                                db.ImageLinks.Add(imageLinkRow);
                                filesAdded++;
                            }
                            else
                                success = "db";
                        }
                        if (filesAdded > 0)
                        {
                            db.SaveChanges();
                            totalFilesAdded += filesAdded;
                        }
                    }
                }
                success = " " + totalFilesAdded;
            }
            catch (Exception ex) {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        //[HttpPut]
        //public string Update(int parentId, string pathName)
        //{
        //    string success = "";
        //    try
        //    {
        //        // check for files added to a folder
        //        string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + pathName);
        //        DirectoryInfo dir = new DirectoryInfo(fullFolderPath);
        //        var danniPath = "https://api.curtisrhodes.com/App_Data/Danni/" + pathName;
        //        var filesAdded = 0;
        //        using (OggleBoobleContext db = new OggleBoobleContext())
        //        {
        //            foreach (FileInfo file in dir.GetFiles())
        //            {
        //                if (file.Name.Contains(" "))
        //                {
        //                    var reName = fullFolderPath + "/" + file.Name.Replace(" ", "_");
        //                    file.MoveTo(reName);
        //                }

        //                var exitingLink = db.ImageLinks.Where(l => l.Link == danniPath + "/" + file.Name).FirstOrDefault();
        //                if (exitingLink == null)
        //                {
        //                    var imageLinkRow = new ImageLink();
        //                    imageLinkRow.Id = Guid.NewGuid().ToString();
        //                    imageLinkRow.Link = danniPath + "/" + file.Name; //.Replace(' ', '_');
        //                    db.ImageLinks.Add(imageLinkRow);

        //                    var categoryImageLink = new Category_ImageLink();
        //                    categoryImageLink.ImageLinkId = imageLinkRow.Id;
        //                    categoryImageLink.ImageCategoryId = parentId;
        //                    db.Category_ImageLinks.Add(categoryImageLink);
        //                    db.SaveChanges();
        //                    filesAdded++;
        //                }
        //            }
        //        }
        //        success = " " + filesAdded;
        //    }
        //    catch (Exception ex)
        //    {
        //        success = Helpers.ErrorDetails(ex);
        //    }
        //    return success;
        //}

        [HttpPatch]
        public string rebuildCategory_ImageLink()
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink " +
                        "select f.Id ImageCategoryId, l.Id imageLinkId " +
                        "from OggleBooble.ImageLink l " +
                        "join OggleBooble.ImageFolder f on f.FolderPath = substring(l.Link, 45, len(Link) " +
                        " - 44 - charindex('/', reverse(l.Link)))");

                    //--put custom links back into ImageLink and CatLink
                    db.Database.ExecuteSqlCommand("insert OggleBooble.ImageLink select max(newid()), link from OggleBooble.CustomLink group by link");
                    db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink select f.Id, l.Id from OggleBooble.CustomLink c " +
                        "join OggleBooble.ImageFolder f on f.FolderPath = c.FolderPath join OggleBooble.ImageLink l on l.Link = c.Link");

                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpDelete]
        public string Delete()
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //db.ImageLinks.RemoveRange
                    db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageLink");
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
    public class ImageLinkCategoryController : ApiController
    {

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
                    //int imageCatId = db.ImageFolders.Where(f => f.FolderPath == newLink.Path).First().Id;
                    db.Category_ImageLinks.Add(new Category_ImageLink()
                    {
                        ImageCategoryId = newLink.PathId,
                        ImageLinkId = imageLinkId
                    });
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
    public class ImageFolderTreeController : ApiController
    {
        [HttpGet]
        public DirectoryModel GetCatTree()
        {
            var danni = new DirectoryModel() { DirectoryName = "RoOt", CategoryId = 0 };
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                ImageFolderGetRecurr(danni, db);
            }
            return danni;
        }
        private void ImageFolderGetRecurr(DirectoryModel parent, OggleBoobleContext db)
        {
            var childFolders = db.ImageFolders.Where(f => f.Parent == parent.CategoryId).ToList();
            foreach (ImageFolder childFolder in childFolders)
            {
                if (childFolder.FolderName != "RoOt")
                {

                    var subChild = new DirectoryModel()
                    {
                        CategoryId = childFolder.Id,
                        ParentId = childFolder.Parent,
                        DirectoryName = childFolder.FolderName,
                        Length=childFolder.FileCount,
                        DanniPath = childFolder.FolderPath.Replace(" ", "%20"),
                        Path = childFolder.FolderPath + "/" + childFolder.FolderName,
                    };
                    subChild.LinkId = subChild.GetHashCode().ToString();
                    parent.SubDirs.Add(subChild);
                    ImageFolderGetRecurr(subChild, db);
                }
            }
        }




    }

    [EnableCors("*", "*", "*")]
    public class FolderLinkController : ApiController
    {
        // used by carosel headstart
        [HttpGet]
        public List<FolderLinkModel> Get(string root, int headStart)
        {
            var firstFewImages = new List<FolderLinkModel>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int rand = new Random().Next(10000);
                    firstFewImages = (from f in db.FolderLinks
                                      where f.RootFolder == root
                                      select new FolderLinkModel()
                                      {
                                          LinkId = f.LinkId,
                                          FolderName = f.FolderName,
                                          Link = f.Link,
                                          Parent = f.Parent,
                                          FolderPath = f.FolderPath,
                                      }).OrderBy(f => f.LinkId).Skip(rand).Take(headStart).ToList();
                }
            }
            catch (Exception ex)
            {
                firstFewImages.Add(new FolderLinkModel() { FolderName = Helpers.ErrorDetails(ex) });
            }
            return firstFewImages;
        }
        // used by carosel get all
        [HttpGet]
        public List<FolderLink> Get(string root)
        {
            var allImages = new List<FolderLink>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    allImages = db.FolderLinks.Where(l => l.RootFolder == root).ToList();
                }
                allImages.RemoveRange(0, 12);
            }
            catch (Exception ex)
            {
                allImages.Add(new FolderLink() { FolderName = Helpers.ErrorDetails(ex) });
            }
            return allImages;
        }

        // buildFolderLinkTable  
        [HttpPost]
        public string Write()
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.FolderLink");
                    var fileProgress = 0;
                    var totalFiles = 0;
                    Helpers.SendProgress("performing the linq", fileProgress, totalFiles);
                    var folderLinks =
                        (from c in db.Category_ImageLinks
                         join l in db.ImageLinks on c.ImageLinkId equals l.Id
                         join f in db.ImageFolders on c.ImageCategoryId equals f.Id
                         join p in db.ImageFolders on f.Parent equals p.Id
                         select new FolderLinkModel()
                         {
                             LinkId = l.Id,
                             RootFolder = f.FolderPath.Substring(0, f.FolderPath.IndexOf("/")),
                             FolderName = f.FolderName,
                             FolderPath = f.FolderPath,
                             Parent = p.FolderName,
                             Link = l.Link
                         }).ToList();

                    totalFiles = folderLinks.Count();


                    foreach (FolderLinkModel folderLink in folderLinks)
                    {

                        db.FolderLinks.Add(new FolderLink()
                        {
                            RootFolder = folderLink.RootFolder,
                            Parent = folderLink.Parent,
                            FolderName = folderLink.FolderName,
                            FolderPath = folderLink.FolderPath,
                            Link = folderLink.Link,
                            LinkId = folderLink.LinkId
                        });
                        if (++fileProgress % 1000 == 0)
                        {
                            db.SaveChanges();
                            Helpers.SendProgress("...", fileProgress, ++totalFiles);
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


/// Rules to rebuild Image link files
/// 
/// 1. rebuildFolderTable()  "/api/Directory/GetDirTree" 
/// 2. writeFolderArrayItems() [post] "/api/ImageFolder"  TRUCATING DONE HERE 
/// 3. rebuildImageTable() [get] "api/ImageFolder"    AVOIDABLE?
/// 4. rebuildImageTable() [post] "/api/ImageLink/RebuildImageTable"
/// 5. rebuildImageTable() [patch] "/api/ImageFolder/LoadCategoryImageLink" REBUILD CAT_LINK TABLE
/// 
