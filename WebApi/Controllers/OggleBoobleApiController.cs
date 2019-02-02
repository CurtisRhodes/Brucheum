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
        [HttpGet]
        public List<ImageFolder> Get()
        {
            var folders = new List<ImageFolder>();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    folders = db.ImageFolders.ToList();
                }
            }
            catch (Exception ex)
            {
                folders.Add(new ImageFolder() { FolderName = Helpers.ErrorDetails(ex) });
            }
            return folders;
        }

        // used by ImagePage
        [HttpGet]
        public FolderModel GetLinks(string folder)
        {
            var folderModel = new FolderModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    folderModel.SubDirs.AddRange((from f1 in db.ImageFolders
                                                  join fp in db.ImageFolders on f1.Parent equals fp.Id
                                                  where fp.FolderPath == folder
                                                  select new FolderModel()
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

        //writeFolderArrayItems
        [HttpPost]
        public string Add(List<TreeItem> treeItems)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    // save custom links
                    db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.CustomLink");

                    List<LinkModel> customLinks = (from il in db.ImageLinks
                                                   join cl in db.Category_ImageLinks on il.Id equals cl.ImageLinkId
                                                   join f in db.ImageFolders on cl.ImageCategoryId equals f.Id
                                                   where !il.Link.Contains("https://api.curtisrhodes.com/App_Data/Danni")
                                                   select new LinkModel() { Link = il.Link, Path = f.FolderPath }).ToList();
                    foreach (LinkModel linkModel in customLinks)
                    {
                        db.CustomLinks.Add(new CustomLink() { Link = linkModel.Link, FolderPath = linkModel.Path });
                    }
                    db.SaveChanges();

                    db.Database.ExecuteSqlCommand("DROP TABLE OggleBooble.Category_ImageLink");
                    db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.ImageFolder");
                    db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.ImageLink");
                    //db.Database.ExecuteSqlCommand("dbcc checkident ('OggleBooble.ImageFolder', RESEED, 0)");
                    //db.Database.ExecuteSqlCommand("set identity_insert OggleBooble.ImageFolder on");
                    foreach (TreeItem treeItem in treeItems)
                    {
                        db.ImageFolders.Add(new ImageFolder()
                        {
                            Id = treeItem.Id,
                            FolderName = treeItem.FolderName,
                            FolderPath = treeItem.FolderPath,
                            FileCount = treeItem.FileCount,
                            Parent = treeItem.Parent
                        });
                    }
                    db.SaveChanges();
                    //db.Database.ExecuteSqlCommand("set identity_insert OggleBooble.ImageFolder off");
                    db.Database.ExecuteSqlCommand("create table OggleBooble.Category_ImageLink(" +
                        "ImageCategoryId int foreign key references OggleBooble.ImageFolder(Id)," +
                        "ImageLinkId nvarchar(128) foreign key references OggleBooble.ImageLink(Id)," +
                        "primary key(ImageCategoryId, ImageLinkId))");
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
        public string BlowAwayAll(string parent)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //db.Database.ExecuteSqlCommand("DELETE OggleBooble.Category_ImageLink
                    //where imagelinkid in (select Id from OggleBooble.ImageLink 
                    //where link not like 'https://api.curtisrhodes.com/App_Data/Danni%')");
                    //db.Database.ExecuteSqlCommand("TRUNCATE TABLE OggleBooble.Category_ImageLink");
                    //db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageLink");
                    //db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageFolder");
                    //db.Database.ExecuteSqlCommand("dbcc checkident ('OggleBooble.ImageFolder', RESEED, 0)");
                    //db.Database.ExecuteSqlCommand("set identity_insert OggleBooble.ImageFolder on");
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPatch]
        public string LoadCategoryImageLink()
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

        //writeFolderArrayItems step 2  datify images saved in folder 
        [HttpPost]
        public string RebuildImageTable(int parentId, string pathName)
        {
            string success = "";
            try
            {
                string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + pathName);
                DirectoryInfo dir = new DirectoryInfo(fullFolderPath);
                var danniPath = "https://api.curtisrhodes.com/App_Data/Danni/" + pathName;
                var filesAdded = 0;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    foreach (FileInfo file in dir.GetFiles())
                    {
                        if (file.Extension != "db")
                        {
                            var imageLinkRow = new ImageLink();
                            imageLinkRow.Id = Guid.NewGuid().ToString();
                            imageLinkRow.Link = danniPath + "/" + file.Name.Replace(" ", "%20");
                            db.ImageLinks.Add(imageLinkRow);
                            filesAdded++;
                        }
                        else
                            success = "db";
                    }
                    if (filesAdded > 0)
                        db.SaveChanges();
                }
                success = " " + filesAdded;
            }
            catch (Exception ex) { success = "pathName: " + pathName + " " + Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public string Update(int parentId, string pathName)
        {
            string success = "";
            try
            {
                // check for files added to a folder
                string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/" + pathName);
                DirectoryInfo dir = new DirectoryInfo(fullFolderPath);
                var danniPath = "https://api.curtisrhodes.com/App_Data/Danni/" + pathName;
                var filesAdded = 0;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    foreach (FileInfo file in dir.GetFiles())
                    {
                        if (file.Name.Contains(" "))
                        {
                            var reName = fullFolderPath + "/" + file.Name.Replace(" ", "_");
                            file.MoveTo(reName);
                        }

                        var exitingLink = db.ImageLinks.Where(l => l.Link == danniPath + "/" + file.Name).FirstOrDefault();
                        if (exitingLink == null)
                        {
                            var imageLinkRow = new ImageLink();
                            imageLinkRow.Id = Guid.NewGuid().ToString();
                            imageLinkRow.Link = danniPath + "/" + file.Name; //.Replace(' ', '_');
                            db.ImageLinks.Add(imageLinkRow);

                            var categoryImageLink = new Category_ImageLink();
                            categoryImageLink.ImageLinkId = imageLinkRow.Id;
                            categoryImageLink.ImageCategoryId = parentId;
                            db.Category_ImageLinks.Add(categoryImageLink);
                            db.SaveChanges();
                            filesAdded++;
                        }
                    }
                }
                success = " " + filesAdded;
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
        // add manual image link
        [HttpPost]
        public string Add(LinkModel newLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var imageLink = new ImageLink();
                    imageLink.Id = Guid.NewGuid().ToString();
                    imageLink.Link = newLink.Link;
                    db.ImageLinks.Add(imageLink);
                    db.SaveChanges();

                    db.Category_ImageLinks.Add(new Category_ImageLink()
                    { ImageCategoryId = int.Parse(newLink.Link), ImageLinkId = imageLink.Id });
                    db.SaveChanges();
                    success = "ok";

                    //var category_ImageLink = new Category_ImageLink();
                    //category_ImageLink.ImageCategoryId = newLink.PathId;
                    //category_ImageLink.ImageLinkId = imageLink.Id;
                    //db.Category_ImageLinks.Add(category_ImageLink);

                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        [HttpPut]
        public string ExtraPathLocation(LinkModel imageLinkModel)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var poseImageLink = new Category_ImageLink();
                    poseImageLink.ImageCategoryId = int.Parse(imageLinkModel.Path);
                    poseImageLink.ImageLinkId = imageLinkModel.Link;
                    db.Category_ImageLinks.Add(poseImageLink);
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
        public string Update()
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    int rtrn = db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink " +
                    "select f.Id ImageCategoryId, l.Id imageLinkId from OggleBooble.ImageLink l " +
                    "join OggleBooble.ImageFolder f on f.FolderPath = substring(l.Link, 45, len(Link) - 44 - charindex('/', reverse(l.Link))) " +
                    "where l.id not in (select c.ImageLinkId from OggleBooble.Category_ImageLink c where c.ImageLinkId = l.id)");

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
        public FolderModel GetDirTree()
        {
            var danniTree = new FolderModel();
            string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");

            var boobsFolder = new FolderModel()
            {
                DirectoryName = "boobs",
                Path = fullFolderPath + "boobs",
                CategoryId = ++indentId,
                DanniPath = "boobs"
            };
            danniTree.SubDirs.Add(boobsFolder);
            RecurrGetDirTree(boobsFolder);

            var pornFolder = new FolderModel()
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
        private void RecurrGetDirTree(FolderModel parentFolder)
        {
            try
            {
                DirectoryInfo directory = new DirectoryInfo(parentFolder.Path);
                foreach (FileInfo fileInfo in directory.GetFiles())
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

                foreach (DirectoryInfo subDirInfo in directory.GetDirectories())
                {
                    var subDir = new FolderModel()
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
    }

    [EnableCors("*", "*", "*")]
    public class ImageFolderTreeController : ApiController
    {
        [HttpGet]
        public FolderModel GetCatTree()
        {
            var danni = new FolderModel() { DirectoryName = "RoOt", CategoryId = 0 };
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                List<ImageFolder> imageFolders = db.ImageFolders.OrderBy(f => f.Parent).ToList();
                ImageFolderGetRecurr(imageFolders, danni);
            }
            return danni;
        }
        private void ImageFolderGetRecurr(List<ImageFolder> imageFolders, FolderModel parent)
        {
            foreach (ImageFolder imageFolder in imageFolders)
            {
                if (imageFolder.Parent == parent.CategoryId)
                {
                    var subChild = new FolderModel()
                    {
                        CategoryId = imageFolder.Id,
                        ParentId = imageFolder.Parent,
                        DirectoryName = imageFolder.FolderName,
                        LinkId = Guid.NewGuid().ToString(),
                        DanniPath = imageFolder.FolderPath.Replace(" ", "%20"),
                        Length = imageFolder.FileCount
                    };
                    parent.SubDirs.Add(subChild);
                    ImageFolderGetRecurr(imageFolders, subChild);
                }
            }
        }
    }

    [EnableCors("*", "*", "*")]
    public class VideoLinkController : ApiController
    {
        [HttpGet]
        public List<VideoLink> Get()
        {
            var videoLinks = new List<VideoLink>();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                 return db.VideoLinks.ToList();
            }
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


/// To rebuild Image link files
/// 
/// 1. rebuildFolderTable()  "/api/Directory/GetDirTree" 
/// 2. writeFolderArrayItems() [post] "/api/ImageFolder"  TRUCATING DONE HERE 
/// 3. rebuildImageTable() [get] "api/ImageFolder"    AVOIDABLE?
/// 4. rebuildImageTable() [post] "/api/ImageLink/RebuildImageTable"
/// 5. rebuildImageTable() [patch] "/api/ImageFolder/LoadCategoryImageLink" REBUILD CAT_LINK TABLE
/// 
