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
    public class DirectoryIOController : ApiController
    {
        [HttpGet]
        public string[] GetTransitions(string folder)
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
        public RepairReport RepealAndReplace(GalleryItem data)
        {
            int rootId = data.FolderId;
            string destination = data.FolderName;
            //int rootId, string destination
            var repairReport = new RepairReport() { LinksEdited = 0, ImagesRenamed = 0, NewLinksAdded = 0, LinksRemoved = 0 };
            try
            {
                var folderName = "";
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbRoot = db.ImageCategories.Where(f => f.Id == rootId).First();
                    folderName = dbRoot.FolderName;

                    RepairRecurr(
                        folderId: rootId,
                        rootFolder: dbRoot.RootFolder,
                        folderPath: destination + "/" + GetParentPath(rootId),
                        goDaddyPath: folderName,
                        subFolderPrefix: folderName,
                        repairReport: repairReport,
                        db: db);
                }
                repairReport.FolderName = folderName;
                //repairReport.ErrorArray = repairReport.Errors.ToArray();
                repairReport.Success = "ok";
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }
        private List<DownloadLink> GetDownloadLinks(int folderId, OggleBoobleContext db)
        {
            return (from l in db.GoDaddyLinks
                       join c in db.Category_ImageLinks on l.Id equals c.ImageLinkId
                       join f in db.ImageCategories on c.ImageCategoryId equals f.Id
                       where c.ImageCategoryId == folderId
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

        private int RemoveBadLinks(List<DownloadLink> dbLinks, FileInfo[] fileInfos, string properLink, int folderId, OggleBoobleContext db, RepairReport repairReport)
        {
            int linksRemoved = 0;
            foreach (DownloadLink dbLink in dbLinks)
            {
                try
                {
                    var test = dbLink.GoDaddyLink.Substring(dbLink.GoDaddyLink.LastIndexOf("/") + 1);
                    if (fileInfos.Where(f => f.Name == dbLink.GoDaddyLink.Substring(dbLink.GoDaddyLink.LastIndexOf("/") + 1)).FirstOrDefault() == null)
                    {
                        GoDaddyLink badGoDaddyLink = db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).First();
                        db.GoDaddyLinks.Remove(badGoDaddyLink);
                        List<Category_ImageLink> badLinks = db.Category_ImageLinks.Where(c => c.ImageLinkId == dbLink.LinkId).Where(c => c.ImageCategoryId == folderId).ToList();
                        foreach (Category_ImageLink badLink in badLinks)
                        {
                            db.Category_ImageLinks.Remove(badLink);
                            db.SaveChanges();
                            linksRemoved++;
                        }
                    }
                }
                catch (Exception ex)
                {
                    repairReport.Errors.Add("unable to remove GoDaddyLink: " + dbLink.LinkId + " error: " + ex.Message);
                }
            }
            if (dbLinks.Count() != fileInfos.Count())
            {
                foreach (DownloadLink dbLink in dbLinks)
                {
                    try
                    {
                        if (dbLink.GoDaddyLink.Substring(0, dbLink.GoDaddyLink.LastIndexOf("/")) != properLink)
                        {
                            GoDaddyLink malformedLink = db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).First();
                            db.GoDaddyLinks.Remove(malformedLink);
                            db.SaveChanges();
                            linksRemoved++;
                        }
                    }
                    catch (Exception ex)
                    {
                        var x = Helpers.ErrorDetails(ex);
                        repairReport.Errors.Add("unable to remove GoDaddyLink: " + dbLink.LinkId + " error: " + Helpers.ErrorDetails(ex));
                    }
                }
            }
            return linksRemoved;
        }

        private int AddMissingLinks(FileInfo[] fileInfos, string goDaddyPrefix, int folderId, OggleBoobleContext db, RepairReport repairReport)
        {
            int linksAdded = 0;
            string fullGoDaddayLink = "";
            foreach (FileInfo file in fileInfos)
            {
                try
                {
                    fullGoDaddayLink = goDaddyPrefix + file.Name;
                    if (db.GoDaddyLinks.Where(g => g.Link == fullGoDaddayLink).FirstOrDefault() == null)
                    {
                        var linkId = Guid.NewGuid().ToString();
                        db.GoDaddyLinks.Add(new GoDaddyLink() { Id = linkId, ExternalLink = fullGoDaddayLink, Link = fullGoDaddayLink });
                        db.Category_ImageLinks.Add(new Category_ImageLink() { ImageCategoryId = folderId, ImageLinkId = linkId });
                        db.SaveChanges();
                        linksAdded++;
                    }
                }
                catch (Exception ex)
                {
                    var x = Helpers.ErrorDetails(ex);
                    repairReport.Errors.Add("unable to add GoDaddyLink: " + fullGoDaddayLink + " error: " + Helpers.ErrorDetails(ex));
                }
            }
            return linksAdded;
        }

        private void RepairRecurr(int folderId, string rootFolder, string folderPath, string goDaddyPath, string subFolderPrefix, RepairReport repairReport, OggleBoobleContext db)
        {
            var fileName = "";
            var folderName = "";
            FileInfo[] fileInfos = null;
            List<DownloadLink> dbLinks = GetDownloadLinks(folderId, db);
            if (dbLinks.Count() == 0)
            {
                string emptyFolder = db.ImageCategories.Where(f => f.Id == folderId).First().FolderName;
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
                folderName = dbLinks[0].FolderName;
                if (subFolderPrefix != folderName)
                {
                    if (!subFolderPrefix.EndsWith(folderName))
                    {
                        if (subFolderPrefix == "")
                            subFolderPrefix = folderName;
                        else
                        {
                            if (subFolderPrefix.Contains("_"))
                                subFolderPrefix = subFolderPrefix.Substring(subFolderPrefix.IndexOf("_")) + "_" + folderName;
                            else
                                subFolderPrefix += "_" + folderName;
                        }
                    }
                    goDaddyPath += "/" + folderName;
                }

                folderPath += "/" + folderName;
                DirectoryInfo dirInfo = new DirectoryInfo(folderPath);
                if (!dirInfo.Exists)
                    dirInfo.Create();
                fileInfos = dirInfo.GetFiles();

                var linkPrefix = "http://" + rootFolder + ".ogglebooble.com/";

                while (dbLinks.Count() != fileInfos.Count())
                {
                    if (fileInfos.Count() > dbLinks.Count())
                    {
                        int linksAdded = AddMissingLinks(fileInfos, linkPrefix + goDaddyPath + "/", folderId, db, repairReport);
                        if (linksAdded > 0)
                        {
                            dbLinks = GetDownloadLinks(folderId, db);
                            repairReport.NewLinksAdded += linksAdded;
                        }
                    }
                    if (dbLinks.Count() > fileInfos.Count())
                    {
                        int linksRemoved = RemoveBadLinks(dbLinks, fileInfos, linkPrefix + goDaddyPath, folderId, db, repairReport);
                        if (linksRemoved > 0)
                        {
                            dbLinks = GetDownloadLinks(folderId, db);
                            repairReport.LinksRemoved += linksRemoved;
                        }
                    }
                }

                #region step 3 rename 
                var fileIncrimentor = 0;
                var trimlink = "";
                foreach (DownloadLink dbLink in dbLinks)
                {
                    if (rootFolder == "centerfolds")
                        fileName = "Playboy centerfold " + GetMonthName(fileIncrimentor++) + " " + dbLink.FolderName + fileInfos[fileIncrimentor].Extension;
                    else
                        fileName = dbLink.FolderName + "_" + dbLink.LinkId + fileInfos[fileIncrimentor].Extension;
                    string fullGoDaddayLink = linkPrefix + goDaddyPath + "/" + fileName;
                    trimlink = dbLink.GoDaddyLink.Substring(0, 10) + dbLink.GoDaddyLink.Substring(10).Replace("//", "/");
                    if (trimlink != fullGoDaddayLink)
                    {
                        try
                        {
                            if (fileInfos[fileIncrimentor].Name != fileName)
                            {
                                if (fileInfos.Where(f => f.Name == fileName).FirstOrDefault() == null)
                                {
                                    fileInfos[fileIncrimentor].MoveTo(folderPath + "/" + fileName);
                                    repairReport.ImagesRenamed++;
                                }
                                else
                                {
                                    repairReport.Errors.Add("fileName: " + fileName + " file not found: " + dbLink.LinkId + " not found");
                                }
                            }
                            if (db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).Where(g => g.Link == fullGoDaddayLink).FirstOrDefault() == null)
                            {
                                GoDaddyLink goDaddyRowWithBadName = db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).FirstOrDefault();
                                if (goDaddyRowWithBadName != null)
                                {
                                    goDaddyRowWithBadName.Link = fullGoDaddayLink;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                                else
                                {
                                    repairReport.Errors.Add("fileName: " + fileName + " message: GoDaddy row with Id: " + dbLink + " not found");
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
                        }
                    }
                    if (db.Category_ImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == dbLink.LinkId).FirstOrDefault() == null)
                    {
                        db.Category_ImageLinks.Add(new Category_ImageLink() { ImageCategoryId = folderId, ImageLinkId = dbLink.LinkId });
                        db.SaveChanges();
                    }
                    fileIncrimentor++;
                }
                #endregion
            }
            #region  step 4 look for missing links
            if (fileInfos == null) //&& (dbLinks.Count() > 0))
            {
                var dbCategory = db.ImageCategories.Where(f => f.Id == folderId).First();
                folderName = dbCategory.FolderName;
                rootFolder = dbCategory.RootFolder;
                DirectoryInfo dirInfo = new DirectoryInfo(folderPath);
                if (!dirInfo.Exists)
                    dirInfo.Create();

                fileInfos = dirInfo.GetFiles();

                if ((fileInfos != null) && (fileInfos.Count() > dbLinks.Count()))
                {
                    for (int i = 0; i < fileInfos.Count(); i++)
                    {
                        try
                        {
                            string newId = Guid.NewGuid().ToString();
                            if (fileInfos[i].Name.Length > 40)
                            {
                                newId = fileInfos[i].Name.Substring(fileInfos[i].Name.Length - 40, 36);
                            }
                            var extension = fileInfos[i].Extension;
                            if (extension == "")
                                extension = ".jpg";

                            if (rootFolder == "centerfolds")
                                fileName = "Playboy centerfold " + GetMonthName(i) + " " + folderName + extension;
                            else
                            {
                                fileName = folderName + "_" + newId + extension;
                                //fileName = subFolderPrefix + "_" + newId + extension;
                            }

                            var ppLink = "http://" + rootFolder + ".ogglebooble.com/" + goDaddyPath + "/" + fileName;
                            GoDaddyLink d = new GoDaddyLink()
                            {
                                ExternalLink = fileName,
                                Link = ppLink,
                                Id = newId
                            };
                            db.GoDaddyLinks.Add(d);
                            Category_ImageLink c = new Category_ImageLink() { ImageCategoryId = folderId, ImageLinkId = newId };
                            db.Category_ImageLinks.Add(c);
                            db.SaveChanges();

                            fileInfos[i].MoveTo(folderPath + "/" + fileName);
                            repairReport.NewLinksAdded++;
                        }
                        catch (Exception ex)
                        {
                            var x = ex.Message;
                            repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
                        }
                    }
                }
            }
            #endregion
            var subFolderIds = db.ImageCategories.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
            foreach (var subFolderId in subFolderIds)
            {
                RepairRecurr(subFolderId, rootFolder, folderPath, goDaddyPath, subFolderPrefix, repairReport, db);
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


        [HttpPut]
        public string MoveImage(MoveImageModel model)
        {
            string success = "";
            try
            {
                string localServerPath = "F:/Danni/";
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string imageName = model.ImageName.Substring(model.ImageName.LastIndexOf("/") + 1).Replace("%20", " ");
                    string linkId = model.ImageName.Substring(model.ImageName.LastIndexOf("_") + 1, 36);
                    ImageCategory dbSourceFolder = db.ImageCategories.Where(f => f.Id == model.SourceFolderId).FirstOrDefault();
                    ImageCategory dbDestinationFolder = db.ImageCategories.Where(f => f.Id == model.DestinationFolderId).FirstOrDefault();

                    string sourcePath = localServerPath + GetParentPath(model.SourceFolderId) + "/" + dbSourceFolder.FolderName;

                    DirectoryInfo dirInfo = new DirectoryInfo(sourcePath);
                    FileInfo fileInfo = dirInfo.GetFiles(imageName).FirstOrDefault();
                    if (fileInfo == null)
                    {
                        success = "unable to find file";
                    }
                    else
                    {
                        string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/" +
                            GetParentPath(model.DestinationFolderId).Substring(dbDestinationFolder.RootFolder.Length) + "/" + dbDestinationFolder.FolderName + "/";
                        string newImageName = dbDestinationFolder.FolderName + "_" + linkId + fileInfo.Extension;

                        // 1. update existing Godaddy folder info (will not work untill plesk move)
                        GoDaddyLink goDaddyLink = db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault();
                        goDaddyLink.Link = linkPrefix + newImageName;
                        db.SaveChanges();

                        //2. no need update existing link
                        //3 create new link for new 
                        if (db.Category_ImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault() == null)
                        {
                            Category_ImageLink newCatImageLink = new Category_ImageLink() { ImageCategoryId = model.DestinationFolderId, ImageLinkId = linkId };
                            db.Category_ImageLinks.Add(newCatImageLink);
                            db.SaveChanges();
                        }

                        // 4. move physical file
                        string destinationPath = localServerPath + GetParentPath(model.DestinationFolderId) + "/" + dbDestinationFolder.FolderName;
                        //fileInfo.Name = "ll";
                        fileInfo.MoveTo(destinationPath + "/" + newImageName);

                        string pleskDestinationPath = "G:/PleskVhosts//curtisrhodes.com/" + dbDestinationFolder.RootFolder + ".ogglebooble.com/" +
                            GetParentPath(model.DestinationFolderId) + "/" + dbDestinationFolder.FolderName;
                        var pleskDestionationDir = new DirectoryInfo(pleskDestinationPath);
                        if (!pleskDestionationDir.Exists)
                            pleskDestionationDir.Create();
                        fileInfo.MoveTo(pleskDestinationPath + "/" + newImageName);
                    }
                    success = "ok";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPatch]
        public string RestoreLinks(string path, int folderId)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var dbCategory = db.ImageCategories.Where(c => c.Id == folderId).First();
                    string rootFolder = dbCategory.RootFolder;
                    string folderPath = GetParentPath(folderId) + "/" + dbCategory.FolderName;
                    DirectoryInfo dirInfo = new DirectoryInfo(path + folderPath);
                    FileInfo[] fileInfos = dirInfo.GetFiles();
                    var linkPrefix = "";
                    foreach (FileInfo file in fileInfos)
                    {
                        linkPrefix = "http://" + rootFolder + ".ogglebooble.com" +
                            file.DirectoryName.Substring(file.DirectoryName.ToUpper().IndexOf(rootFolder.ToUpper()) + rootFolder.Length);

                        string linkId = Guid.NewGuid().ToString();
                        if (file.Name.IndexOf("_") > 0)
                        {
                            linkId = file.Name.Substring(file.Name.IndexOf("_") + 1, 36);
                        }

                        GoDaddyLink existingGoDaddyink = db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault();
                        if (existingGoDaddyink != null)
                        {
                            if (existingGoDaddyink.Link != linkPrefix + "/" + file.Name)
                            {
                                existingGoDaddyink.Link = linkPrefix + "/" + file.Name;
                                db.SaveChanges();
                            }
                        }
                        else
                        {
                            var test = linkPrefix + "/" + file.DirectoryName + "_" + linkId + file.Extension;
                            test = linkPrefix + "/" + file.Name;
                            db.GoDaddyLinks.Add(new GoDaddyLink()
                            {
                                Id = linkId,
                                ExternalLink = file.Name,
                                Link = linkPrefix + "/" + file.Name
                                //Link = linkPrefix + "/" + file.DirectoryName + "_" + linkId + file.Extension
                            });
                            db.SaveChanges();
                        }
                        var existingCatLink = db.Category_ImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault();
                        if (existingCatLink == null)
                        {
                            db.Category_ImageLinks.Add(new Category_ImageLink()
                            {
                                ImageCategoryId = folderId,
                                ImageLinkId = linkId
                            });
                            db.SaveChanges();
                        }
                    }
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
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
