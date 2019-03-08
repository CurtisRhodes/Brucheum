using IWshRuntimeLibrary;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Directory.Models;
using WebApi.OggleBooble.DataContext;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class DirectoryController : ApiController
    {
        //  978
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
        //int indentId = 0;
        //public DirectoryModel GetDirTree()
        //{
        //    var danniTree = new DirectoryModel();
        //    string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");

        //    var boobsFolder = new DirectoryModel()
        //    {
        //        DirectoryName = "boobs",
        //        Path = fullFolderPath + "boobs",
        //        CategoryId = ++indentId,
        //        DanniPath = "boobs"
        //    };
        //    danniTree.SubDirs.Add(boobsFolder);
        //    RecurrGetDirTree(boobsFolder);

        //    var pornFolder = new DirectoryModel()
        //    {
        //        DirectoryName = "porn",
        //        Path = fullFolderPath + "Porn",
        //        CategoryId = ++indentId,
        //        DanniPath = "porn"
        //    };
        //    danniTree.SubDirs.Add(pornFolder);
        //    RecurrGetDirTree(pornFolder);

        //    return danniTree;
        //}
        //private void RecurrGetDirTree(DirectoryModel parentFolder)
        //{
        //    try
        //    {
        //        DirectoryInfo directory = new DirectoryInfo(parentFolder.Path);
        //        foreach (FileInfo fileInfo in directory.GetFiles())
        //        {
        //            if (fileInfo.Extension != ".db")
        //            {
        //                parentFolder.Files.Add(new FileModel()
        //                {
        //                    FileName = fileInfo.Name,
        //                    FullName = fileInfo.FullName,
        //                    Created = fileInfo.CreationTime,
        //                    Extension = fileInfo.Extension,
        //                    Length = fileInfo.Length
        //                });
        //            }
        //            else
        //                Console.Write(directory.Name);
        //        }

        //        foreach (DirectoryInfo subDirInfo in directory.GetDirectories())
        //        {
        //            var subDir = new DirectoryModel()
        //            {
        //                CategoryId = ++indentId,
        //                ParentId = parentFolder.CategoryId,
        //                LinkId = Guid.NewGuid().ToString(),
        //                Path = subDirInfo.FullName,
        //                Length = subDirInfo.GetFiles().Length,
        //                DanniPath = parentFolder.DanniPath + "/" + subDirInfo.Name,
        //                DirectoryName = subDirInfo.Name
        //            };
        //            parentFolder.SubDirs.Add(subDir);
        //            RecurrGetDirTree(subDir);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        parentFolder.DirectoryName = Helpers.ErrorDetails(ex);
        //    }
        //}

        [HttpPost]
        public string DownLoadLinks(int rootId, string destination)
        {
            string success = "";
            try
            {
                //string fullFolderPath = "https: //api.curtisrhodes.com/App_Data/Danni/";
                //System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");
                _destination = destination;
                DownLoadLinksRecurr(rootId, "");
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        string _destination = "";

        private void DownLoadLinksRecurr(int rootId, string innerPath)
        {
            try
            {
                var links = new List<DownloadLink>();
                int[] subFolders;
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    links = (from c in db.Category_ImageLinks
                             join l in db.ImageLinks on c.ImageLinkId equals l.Id
                             join f in db.ImageFolders on c.ImageCategoryId equals f.Id
                             where c.ImageCategoryId == rootId
                             select new DownloadLink()
                             {
                                 Link = l.Link,
                                 LinkId = l.Id,
                                 FolderId = f.Id,
                                 ParentId = f.Parent,
                                 //FolderPath = f.FolderPath,
                                 FolderName = f.FolderName
                             }).ToList();

                    subFolders = db.ImageFolders.Where(f => f.Parent == rootId).Select(f => f.Id).ToArray();
                }

                if (links.Count > 0)
                {
                    if (links[0].FolderPath.Contains("centerfolds"))
                        innerPath = "Playboy";

                    if (innerPath == "")
                        innerPath += links[0].FolderName;
                    else
                    {
                        if (innerPath != "Playboy")
                            innerPath += "-" + links[0].FolderName;
                    }

                    //new FileInfo(_destination + links[0].FolderPath + "/").Directory.Create();
                    var dirInfo = new DirectoryInfo(_destination + links[0].FolderPath);
                    if (!dirInfo.Exists)
                        dirInfo.Create();
                    else
                        foreach (FileInfo file in dirInfo.GetFiles()) file.Delete();
                    byte[] bytes;
                    using (WebClient client = new WebClient())
                    {
                        var folderIncrimentor = 0;
                        var fileName = "";
                        var extension = "";
                        foreach (DownloadLink link in links)
                        {
                            //var imageName = link.FolderPath.Substring(link.FolderPath.IndexOf("/") + 1).Replace("/", "-");
                            //var imageName = links[0].FolderPath.Substring(link.FolderPath.LastIndexOf("/") + 1);
                            if (link.Link != null)
                            {
                                extension = link.Link.Substring(link.Link.LastIndexOf("."));
                                if (innerPath == "Playboy")
                                    fileName = "Playboy centerfold " + GetMonthName(folderIncrimentor++) + " " + link.FolderName + extension;
                                else
                                    fileName = innerPath + "_" + (++folderIncrimentor).ToString("0000") + extension;

                                try
                                {
                                    bytes = client.DownloadData(link.Link);
                                    System.IO.File.WriteAllBytes(_destination + link.FolderPath + "/" + fileName, bytes);
                                }
                                catch (Exception ex)
                                {
                                    if (ex.Message != "FileNotFound")
                                        folderIncrimentor--;


                                }
                                //downloadResults.LinksAdded++;
                                //System.IO.File.WriteAllBytes(_destination + link.FolderPath + "/" + link.LinkId + extension, bytes);
                            }
                        }
                    }
                }
                foreach (int subFolder in subFolders)
                {
                    DownLoadLinksRecurr(subFolder, innerPath);
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        private string GetMonthName(int m)
        {
            switch (m)
            {
                case 0: return "January";
                case 1: return "February";
                case 2: return "March";
                case 3: return "April";
                case 4: return "May";
                case 5: return "June";
                case 6: return "July";
                case 7: return "August";
                case 8: return "September";
                case 9: return "October";
                case 10: return "November";
                case 11: return "December";
                default: return "";
            }
        }

        private void CreateShortcut(string target, string destination)
        {
            object shDesktop = (object)"Desktop";
            WshShell shell = new WshShell();
            //string shortcutAddress = (string)shell.SpecialFolders.Item(ref shDesktop) + @"\Notepad.lnk";
            IWshShortcut shortcut = (IWshShortcut)shell.CreateShortcut(target);
            //shortcut.Description = "New shortcut for a Notepad";
            //shortcut.Hotkey = "Ctrl+Shift+N";
            //shortcut.TargetPath = Environment.GetFolderPath(Environment.SpecialFolder.System) + @"\notepad.exe";
            shortcut.TargetPath = destination;
            shortcut.Save();
            //public object ShellLink { get; private set; }
        }

        // THE BIG ONE too dangerous to now use
        //int fileProgress = 0;
        //private string BuildImageFolderTable()
        //{
        //    string success = "";
        //    string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");
        //    try
        //    {
        //        Helpers.SendProgress("Getting Image Count", fileProgress, totalFiles);
        //        totalFiles = getImageCount();
        //        Helpers.SendProgress("...", fileProgress, totalFiles);

        //        DirectoryInfo dir = new DirectoryInfo(fullFolderPath);

        //        using (OggleBoobleContext db = new OggleBoobleContext())
        //        {
        //            //$('#dataifyInfo').show().html("rebuild ImageLink and ImageFolder tables");
        //            db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageFolder");
        //            db.Database.ExecuteSqlCommand("dbcc checkident ('OggleBooble.ImageFolder', RESEED, 0)");
        //            db.Database.ExecuteSqlCommand("DELETE OggleBooble.ImageLink");

        //            var dbRoot = new ImageFolder()
        //            {
        //                FolderName = "Root",
        //                FolderPath = "/",
        //                FileCount = 0
        //            };
        //            db.ImageFolders.Add(dbRoot);
        //            db.SaveChanges();

        //            Helpers.SendProgress("opening data context ", fileProgress, totalFiles);
        //            var subDirs = new DirectoryInfo(fullFolderPath).GetDirectories();
        //            foreach (DirectoryInfo subDir in subDirs)
        //            {
        //                var dbRow = new ImageFolder()
        //                {
        //                    FolderName = subDir.Name,
        //                    FolderPath = subDir.Name,
        //                    FileCount = subDir.GetFiles().Length,
        //                    Parent = 0
        //                };
        //                db.ImageFolders.Add(dbRow);
        //                db.SaveChanges();
        //                Helpers.SendProgress("Processing " + subDir.FullName, fileProgress, totalFiles);
        //                RecurrbuildImageFolderTable(dbRow.Id, subDir.Name, subDir.FullName, db);
        //            }
        //            success = "ok";

        //            Helpers.SendProgress("building Cat_Link table", fileProgress, totalFiles);
        //            db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink " +
        //                "select f.Id ImageCategoryId, l.Id imageLinkId " +
        //                "from OggleBooble.ImageLink l " +
        //                "join OggleBooble.ImageFolder f on f.FolderPath = substring(l.Link, 45, len(Link) " +
        //                " - 44 - charindex('/', reverse(l.Link)))");

        //            Helpers.SendProgress("adding custom links back into ImageLink and CatLink", fileProgress, totalFiles);
        //            //--put custom links back into ImageLink and CatLink
        //            db.Database.ExecuteSqlCommand("insert OggleBooble.ImageLink select max(newid()), link from OggleBooble.CustomLink group by link");
        //            db.Database.ExecuteSqlCommand("insert OggleBooble.Category_ImageLink select f.Id, l.Id from OggleBooble.CustomLink c " +
        //                "join OggleBooble.ImageFolder f on f.FolderPath = c.FolderPath join OggleBooble.ImageLink l on l.Link = c.Link");
        //        }
        //        success = "ok";
        //    }
        //    catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
        //    return success;
        //}
        //private void RecurrbuildImageFolderTable(int parentId, string danniPath, string folderPath, OggleBoobleContext db)
        //{
        //    var subDirs = new DirectoryInfo(folderPath).GetDirectories();
        //    string linkPath = "https://api.curtisrhodes.com/App_Data/Danni/";

        //    foreach (DirectoryInfo subDir in subDirs)
        //    {
        //        var dbRow = new ImageFolder()
        //        {
        //            FolderName = subDir.Name,
        //            FolderPath = danniPath + "/" + subDir.Name,
        //            FileCount = subDir.GetFiles().Length,
        //            Parent = parentId
        //        };
        //        db.ImageFolders.Add(dbRow);

        //        foreach (FileInfo file in subDir.GetFiles())
        //        {
        //            if (file.Extension != ".db")
        //            {
        //                db.ImageLinks.Add(new ImageLink()
        //                {
        //                    Id = Guid.NewGuid().ToString(),
        //                    Link = linkPath + danniPath + "/" + subDir.Name + "/" + file.Name.Replace(" ", "%20")
        //                });

        //                fileProgress++;
        //            }
        //        }
        //        db.SaveChanges();

        //        Helpers.SendProgress("...", fileProgress, totalFiles);

        //        RecurrbuildImageFolderTable(dbRow.Id, danniPath + "/" + subDir.Name, subDir.FullName, db);
        //    }
        //}

        //private int getImageCount()
        //{
        //    int totalFiles = 0;
        //    string fullFolderPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/");
        //    var subDirs = new DirectoryInfo(fullFolderPath + "boobs").GetDirectories();
        //    foreach (DirectoryInfo subDir in subDirs)
        //    {
        //        totalFiles += getImageCountRecurr(subDir);
        //    }
        //    return totalFiles;
        //}
        //private int getImageCountRecurr(DirectoryInfo subdir)
        //{
        //    int fileCount = subdir.GetFiles().Length;
        //    foreach (DirectoryInfo dir in subdir.GetDirectories())
        //    {
        //        fileCount += getImageCountRecurr(dir);
        //    }

        //    return fileCount;
        //}

        [HttpPut]
        public string rebiuldPhy(int folderId, string dirPath, string danniPathHint)
        {
            string success = "";
            string danniPath = "https://api.curtisrhodes.com/App_Data/Danni/";

            try
            {
                FileInfo[] imgs = new DirectoryInfo(dirPath).GetFiles();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    foreach (FileInfo fileInfo in imgs)
                    {
                        string newId = Guid.NewGuid().ToString();
                        db.ImageLinks.Add(new ImageLink()
                        {
                            Id = newId,
                            Link = danniPath + "/" + danniPathHint + "/" + fileInfo.Name
                        });
                        db.Category_ImageLinks.Add(new Category_ImageLink()
                        {
                            ImageCategoryId = folderId,
                            ImageLinkId = newId
                        });
                        db.SaveChanges();
                    }
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }
}
