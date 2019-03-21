using IWshRuntimeLibrary;
using Microsoft.AspNet.SignalR;
using Microsoft.AspNet.SignalR.Hubs;
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

        private string GetParentPath(int folderId)
        {
            string parentPath = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //var thisFolder = db.ImageFolders.Where(f => f.Id == folderId).First();
                //parentPath = thisFolder.FolderName;
                int parentId = db.ImageCategories.Where(f => f.Id == folderId).Select(f => f.Parent).First();
                while (parentId > 1)
                {
                    var parentDb = db.ImageCategories.Where(f => f.Id == parentId).First();
                    parentPath = parentDb.FolderName + "/" + parentPath;
                    parentId = parentDb.Parent;
                }
            }
            return parentPath;
        }

        [HttpPost]
        public RepairReport Repair(int rootId, string destination)
        {
            var repairReport = new RepairReport() { LinksEdited = 0, ImagesRenamed = 0, NewLinksAdded = 0, LinksRemoved = 0 };
            try
            {
                var folderName = "";
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbRoot = db.ImageCategories.Where(f => f.Id == rootId).First();
                    folderName = dbRoot.FolderName;

                    RepairRecurr(
                        parentId: rootId,
                        folderPath: destination + "/" + GetParentPath(rootId),
                        goDaddyPath: folderName,
                        subFolderPrefix: folderName,
                        repairReport: repairReport,
                        db: db);
                }
                repairReport.FolderName = folderName;
                repairReport.ErrorArray = repairReport.Errors.ToArray();
                repairReport.Success = "ok";
            }
            catch (Exception ex) { repairReport.Success = Helpers.ErrorDetails(ex); }
            return repairReport;
        }
        private void RepairRecurr(int parentId, string folderPath, string goDaddyPath, string subFolderPrefix, RepairReport repairReport, OggleBoobleContext db)
        {
            var fileIncrimentor = 0;
            if (parentId == 299)
            {
                fileIncrimentor = 0;
            }
            List<DownloadLink> dbLinks = null;
            {
                dbLinks = (from l in db.GoDaddyLinks
                           join c in db.Category_ImageLinks on l.Id equals c.ImageLinkId
                           join f in db.ImageCategories on c.ImageCategoryId equals f.Id
                           where c.ImageCategoryId == parentId
                           select new DownloadLink()
                           {
                               LinkId = l.Id,
                               FolderId = f.Id,
                               ParentId = f.Parent,
                               RootFolder = f.RootFolder,
                               ExternalLink = l.ExternalLink,
                               GoDaddyLink = l.Link,
                               FolderName = f.FolderName
                           }).ToList();
            }

            if (dbLinks.Count() == 0)
            {
                string emptyFolder = db.ImageCategories.Where(f => f.Id == parentId).First().FolderName;
                folderPath += "/" + emptyFolder;
                if (subFolderPrefix.EndsWith(emptyFolder))
                    subFolderPrefix = "";
                else
                {
                    if (subFolderPrefix == "")
                        subFolderPrefix = emptyFolder;
                    if (subFolderPrefix.Contains("_"))
                        subFolderPrefix = subFolderPrefix.Substring(subFolderPrefix.IndexOf("_")) + "_" + emptyFolder;
                }
                if (!goDaddyPath.EndsWith(emptyFolder))
                {
                    goDaddyPath += "/" + emptyFolder;
                }
            }


            if (dbLinks.Count() > 0)
            {
                if (subFolderPrefix != dbLinks[0].FolderName)
                {
                    if (!subFolderPrefix.EndsWith(dbLinks[0].FolderName))
                    {
                        if (subFolderPrefix == "")
                            subFolderPrefix = dbLinks[0].FolderName;
                        else
                        {
                            if (subFolderPrefix.Contains("_"))
                                subFolderPrefix = subFolderPrefix.Substring(subFolderPrefix.IndexOf("_")) + "_" + dbLinks[0].FolderName;
                            else
                                subFolderPrefix += "_" + dbLinks[0].FolderName;
                        }
                    }
                    goDaddyPath += "/" + dbLinks[0].FolderName;

                }

                folderPath += "/" + dbLinks[0].FolderName;
                DirectoryInfo dirInfo = new DirectoryInfo(folderPath);
                if (!dirInfo.Exists)
                {
                    dirInfo.Create();
                }
                FileInfo[] fileInfos = dirInfo.GetFiles();


                var linkPrefix = "http://" + dbLinks[0].RootFolder + ".ogglebooble.com/";
                fileIncrimentor = 0;
                var fileName = "";
                var extension = "";
                var goDaddyLink = "";

                // step 1 rename 
                foreach (DownloadLink dbLink in dbLinks)
                {
                    extension = dbLink.ExternalLink.Substring(dbLink.ExternalLink.LastIndexOf("."));
                    if (dbLink.RootFolder == "centerfolds")
                        fileName = "Playboy centerfold " + GetMonthName(fileIncrimentor++) + " " + dbLink.FolderName + extension;
                    else
                    {
                        if (dbLink.RootFolder == "porn")
                            fileName = dbLink.FolderName + "_" + dbLink.LinkId + extension;
                        else
                            fileName = subFolderPrefix + "_" + dbLink.LinkId + fileInfos[fileIncrimentor].Extension;

                    }

                    goDaddyLink = linkPrefix + goDaddyPath + "/" + fileName;
                    if (fileIncrimentor < fileInfos.Count())
                    {
                        if (dbLink.GoDaddyLink != goDaddyLink)
                        {
                            try
                            {
                                if(db.Category_ImageLinks.Where(c => c.ImageLinkId == dbLink.LinkId).Where(c => c.ImageCategoryId == parentId).FirstOrDefault() == null)
                                {
                                    if (fileInfos.Where(f => f.Name == fileName).FirstOrDefault() == null)
                                    {
                                        fileInfos[fileIncrimentor].MoveTo(folderPath + "/" + fileName);
                                        repairReport.ImagesRenamed++;
                                    }
                                    db.Database.ExecuteSqlCommand("update OggleBooble.GoDaddyLink set Link = '" + goDaddyLink + "' where Id = '" + dbLink.LinkId + "'");
                                    repairReport.LinksEdited++;
                                }
                            }
                            catch (Exception ex)
                            {
                                var x = ex.Message;
                                repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
                            }
                        }
                    }
                    fileIncrimentor++;
                }


                //  step 2 look for missing links
                if (dbLinks.Count() > fileInfos.Count())
                {
                    foreach (DownloadLink dbLink in dbLinks)
                    {
                        var catLinkS = db.Category_ImageLinks.Where(C => C.ImageLinkId == dbLink.LinkId).ToList();
                        if ((catLinkS.Count == 1) && (catLinkS[0].ImageCategoryId == dbLink.FolderId))
                        {
                            db.MissingLinks.Add(new MissingLink() { ExternalLink = dbLink.ExternalLink, LinkId = dbLink.LinkId });
                        }
                        else
                        {
                            // could be a 

                        }
                    }
                }

                //  step 3 look for missing images
                if (fileInfos.Count() > dbLinks.Count())
                {
                    foreach (FileInfo file in fileInfos)
                    {
                        try
                        {

                            if ((file.Name.Length > 40) && (dbLinks.Select(l => l.LinkId).Contains(file.Name.Substring(file.Name.Length - 40, 36))))
                            {

                            }
                            else
                            {
                                string newId = Guid.NewGuid().ToString();
                                fileName = subFolderPrefix + "_" + newId + extension;
                                GoDaddyLink d = new GoDaddyLink()
                                {
                                    ExternalLink = fileName,
                                    Link = fileName,
                                    Id = newId
                                };
                                db.GoDaddyLinks.Add(d);
                                Category_ImageLink c = new Category_ImageLink()
                                {
                                    ImageCategoryId = dbLinks[0].FolderId,
                                    ImageLinkId = newId
                                };
                                db.Category_ImageLinks.Add(c);
                                db.SaveChanges();

                                file.MoveTo(folderPath + "/" + fileName);
                                repairReport.NewLinksAdded++;
                            }
                        }
                        catch (Exception ex)
                        {
                            var x = ex.Message;
                            repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
                        }
                    }
                }






                // step 3 make sure all links are right
                //List<FileInfo> missingImages = new List<FileInfo>();
                //foreach (FileInfo file in fileInfos)
                //{
                //    if (!((file.Name.Length > 40) && (dbLinks.Select(l => l.LinkId).Contains(file.Name.Substring(file.Name.Length - 40, 36)))))
                //    {
                //        missingImages.Add(file);

                //    }
                //}
                //List<DownloadLink> missingLinks = new List<DownloadLink>();


                //var linkFileExists = false;
                //foreach (DownloadLink dbLink in dbLinks)
                //{
                //    linkFileExists = false;
                //    foreach (FileInfo file in fileInfos)
                //    {
                //        if (file.Name == dbLink.GoDaddyLink.Substring(dbLink.GoDaddyLink.LastIndexOf("/") + 1))
                //        {
                //            linkFileExists = true;
                //            break;
                //        }
                //    }
                //    if (!linkFileExists)
                //    {
                //        missingLinks.Add(dbLink);
                //        db.MissingLinks.Add(new MissingLink() { ExternalLink = dbLink.ExternalLink, LinkId = dbLink.LinkId });
                //        db.SaveChanges();
                //    }
                //}
                //if (missingImages.Count() > 0)
               // {
                    //if (missingLinks.Count() > 0)
                    //{
                    //    //if (missingLinks.Count() >= missingImages.Count())
                    //    //{
                    //    //    for (int i = 0; i < missingImages.Count(); i++)
                    //    //    {
                    //    //        try
                    //    //        {
                    //    //            fileName = subFolderPrefix + "_" + missingLinks[i].LinkId + missingImages[i].Extension;
                    //    //            missingImages[i].MoveTo(folderPath + "/" + fileName);
                    //    //            missingLinks[i].LinkId = "xxx";
                    //    //            repairReport.ImagesRenamed++;
                    //    //        }
                    //    //        catch (Exception ex)
                    //    //        {
                    //    //            var x = ex.Message;
                    //    //            repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
                    //    //        }
                    //    //    }
                    //    //}
                    //    //else
                    //    //{
                    //    //    for (int i = 0; i < missingLinks.Count(); i++)
                    //    //    {
                    //    //        try
                    //    //        {

                    //    //            fileName = subFolderPrefix + "_" + missingLinks[i].LinkId + missingImages[i].Extension;
                    //    //            missingImages[i].MoveTo(folderPath + "/" + fileName);
                    //    //            missingLinks[i].LinkId = "xxx";
                                    
                    //    //            repairReport.ImagesRenamed++;
                    //    //        }
                    //    //        catch (Exception ex)
                    //    //        {
                    //    //            var x = ex.Message;
                    //    //            repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
                    //    //        }
                    //    //    }
                    //    //}
                    //}

                    //for (int i = 0; i < missingLinks.Count(); i++)
                    //{
                    //    goDaddyLink = linkPrefix + goDaddyPath + "/" + missingImages[i].Name;
                    //    if(!dbLinks.Select(l=>l.GoDaddyLink).Contains(goDaddyLink))
                    //    {
                    //        GoDaddyLink d = new GoDaddyLink()
                    //        {
                    //            ExternalLink = missingImages[i].,
                    //            Link = fileName,
                    //            Id = newId
                    //        };
                    //        db.GoDaddyLinks.Add(d);
                    //        Category_ImageLink c = new Category_ImageLink()
                    //        {
                    //            ImageCategoryId = dbLinks[0].FolderId,
                    //            ImageLinkId = newId
                    //        };
                    //        db.Category_ImageLinks.Add(c);
                    //        db.SaveChanges();

                    //        file.MoveTo(folderPath + "/" + fileName);
                    //        repairReport.NewLinksAdded++;

                    //    }

                    //}


               // }

                //if (missingLinks.Count() > 0)
                //{
                //    if (missingImages.Count() == 0)
                //    {
                //        foreach (DownloadLink downloadLink in missingLinks)
                //        {
                //            try
                //            {
                //                var otherLinks = db.Category_ImageLinks.Where(g => g.ImageLinkId == downloadLink.ExternalLink).ToList();
                //                if (otherLinks.Count() == 0)
                //                {
                //                    //GoDaddyLink badLink = db.GoDaddyLinks.Where(g => g.Id == downloadLink.LinkId).FirstOrDefault();
                //                    //if (badLink != null)
                //                    //{
                //                    //    db.GoDaddyLinks.Remove(badLink);
                //                    //    db.SaveChanges();
                //                    //}
                //                    repairReport.LinksRemoved++;
                //                }
                //            }
                //            catch (Exception ex)
                //            {
                //                var x = ex.Message;
                //                repairReport.Errors.Add("LinkId: " + downloadLink.LinkId + " message: " + ex.Message);
                //            }
                //        }
                //    }
                //}


            }
            var subFolderIds = db.ImageCategories.Where(f => f.Parent == parentId).Select(f => f.Id).ToArray();
            foreach (var subFolderId in subFolderIds)
            {
                RepairRecurr(subFolderId, folderPath, goDaddyPath, subFolderPrefix, repairReport, db);
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

        private void DownloadImage (string externalLink, string newFileName)
        {
            using (WebClient wc = new WebClient())
            {
                wc.DownloadFileAsync(new System.Uri(externalLink), newFileName);
               
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
        public string ReName(int folderId, string destination)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    //var rootPath = db.ImageFolders.Where(f => f.Id == folderId).First().FolderName;
                    
                    RenameRecurr(folderId, destination,  db);
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
        private void RenameRecurr(int folderId, string folderPath, OggleBoobleContext db)
        {
        }


        [HttpPatch]
        public string RestoreLinks()
        {
            string success = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //db.Database.ExecuteSqlCommand("");


            }
            return success;
        }
    }




    public abstract class ApiControllerWithHub<THub> : ApiController
           where THub : IHub
    {
        Lazy<IHubContext> hub = new Lazy<IHubContext>(
            () => GlobalHost.ConnectionManager.GetHubContext<THub>()
        );

        protected IHubContext Hub
        {
            get { return hub.Value; }
        }
    }
}
