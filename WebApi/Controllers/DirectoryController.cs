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
        public RepairReportModel RepairLinks(int startFolderId, string drive)
        {
            RepairReportModel repairReport = new RepairReportModel() { LinksEdited = 0, ImagesRenamed = 0, NewLinksAdded = 0, LinksRemoved = 0 };
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var timer = new System.Diagnostics.Stopwatch();
                    timer.Start();
                    drive += Helpers.GetParentPath(startFolderId, false);

                    RepairLinksRecurr(startFolderId, drive, repairReport, db);
                                       
                    timer.Stop();
                    System.Diagnostics.Debug.WriteLine("VerifyLinksRecurr took: " + timer.Elapsed);

                }
                //repairReport.BadLinksArray = repairReport.BadLinks.Select(b => b.Id).ToArray();
                //repairReport.MissingImagesArray = repairReport.MissingImages.Select(m => m.FullName).ToArray<string>();
                //repairReport.ErrorsArray = repairReport.Errors.ToArray();
                repairReport.Success = "ok";
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }
        public void RepairLinksRecurr(int folderId, string folderPath, RepairReportModel repairReport, OggleBoobleContext db)
        {
            CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
            folderPath += "/" + categoryFolder.FolderName;
            DirectoryInfo dirInfo = new DirectoryInfo(folderPath);
            if (dirInfo.Exists)
            {
                FileInfo[] fileInfos = dirInfo.GetFiles();

                List<GoDaddyLink> folderLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.GoDaddyLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     select (g)).ToList();

                var linkId = "";
                var derivedLink = "";
                var expectedFileName = "";
                var goDaddyPrefix = "http://" + categoryFolder.RootFolder + ".ogglebooble.com/";








                foreach (FileInfo fileInfo in fileInfos)
                {
                    if (fileInfo.Name.Length < 40)
                        repairReport.BadFileNames++;
                    else
                    {
                        linkId = fileInfo.Name.Substring(fileInfo.Name.LastIndexOf("_") + 1, 36);
                        if (folderLinks.Where(g => g.Id == linkId).FirstOrDefault() == null)
                        {
                            if (db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault() != null)
                            {
                                // exists but not in this folder
                            }
                            else
                            {
                                expectedFileName = categoryFolder.FolderName + "_" + linkId + fileInfo.Extension;
                                var fileNamePrefix = folderPath.Substring(folderPath.IndexOf("://") + 4);
                                derivedLink = goDaddyPrefix + fileNamePrefix + "/" + expectedFileName;

                                if (fileInfo.Name != expectedFileName)
                                {
                                    fileInfo.MoveTo(folderPath + "/" + expectedFileName);
                                    repairReport.ImagesRenamed++;
                                }
                                GoDaddyLink newLink = new GoDaddyLink()
                                {
                                    Id = linkId,
                                    Link = derivedLink,
                                    ExternalLink = linkId
                                };
                                db.GoDaddyLinks.Add(newLink);
                                db.SaveChanges();
                                repairReport.NewLinksAdded++;

                                if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault() == null)
                                {
                                    CategoryImageLink newCatLink = new CategoryImageLink()
                                    {
                                        ImageCategoryId = folderId,
                                        ImageLinkId = linkId
                                    };
                                    db.CategoryImageLinks.Add(newCatLink);
                                    db.SaveChanges();
                                    repairReport.CatLinksAdded++;
                                }
                                //repairReport.MissingImages.Add(fileInfo);
                            }
                        }
                    }
                    repairReport.RowsProcessed++;
                }



                //if (folderLinks.Where(g => g.Link.Contains(fileInfo.Name)).FirstOrDefault() == null)
                //List<CategoryImageLink> categoryImageLinks = db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).ToList();
                //foreach (CategoryImageLink categoryImageLink in categoryImageLinks)
                //{
                //    //expectedFileName = goDaddyPrefix + "/" + categoryFolder.FolderName + "/" + categoryFolder.FolderName + "_" + categoryImageLink.ImageLinkId;
                //    expectedFileName = categoryFolder.FolderName + "_" + categoryImageLink.ImageLinkId;
                //    FileInfo coorespondingImageFile = fileInfos.Where(f => f.Name.Contains(expectedFileName)).FirstOrDefault();
                //    if (coorespondingImageFile == null)
                //    {
                //        repairReport.BadLinks.Add(db.GoDaddyLinks.Where(g => g.Id == categoryImageLink.ImageLinkId).FirstOrDefault());
                //        repairReport.ImagesRenamed++;
                //    }
                //}
            }
            else
            {
                repairReport.DirNotFound++;
            }
            int[] subDirs = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
            foreach (int subDir in subDirs)
            {
                RepairLinksRecurr(subDir, folderPath, repairReport, db);
            }
        }

        //  500 lines of junk
        //private List<RepairLinkModel> GetDownloadLinks(int folderId, OggleBoobleContext db)
        //{
        //    return (from l in db.GoDaddyLinks
        //            join c in db.CategoryImageLinks on l.Id equals c.ImageLinkId
        //            join f in db.CategoryFolders on c.ImageCategoryId equals f.Id
        //            where c.ImageCategoryId == folderId
        //            select new RepairLinkModel()
        //            {
        //                LinkId = l.Id,
        //                FolderId = f.Id,
        //                ParentId = f.Parent,
        //                RootFolder = f.RootFolder,
        //                ExternalLink = l.ExternalLink,
        //                GoDaddyLink = l.Link,
        //                FolderName = f.FolderName
        //            }).ToList();
        //}

        //private int RemoveBadLinks(List<RepairLinkModel> dbLinks, FileInfo[] fileInfos, string properLink, int folderId, OggleBoobleContext db, RepairReportModel repairReport)
        //{
        //    int linksRemoved = 0;
        //    foreach (RepairLinkModel dbLink in dbLinks)
        //    {
        //        try
        //        {
        //            var test = dbLink.GoDaddyLink.Substring(dbLink.GoDaddyLink.LastIndexOf("/") + 1);
        //            if (fileInfos.Where(f => f.Name == dbLink.GoDaddyLink.Substring(dbLink.GoDaddyLink.LastIndexOf("/") + 1)).FirstOrDefault() == null)
        //            {
        //                GoDaddyLink badGoDaddyLink = db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).First();
        //                db.GoDaddyLinks.Remove(badGoDaddyLink);
        //                List<CategoryImageLink> badLinks = db.CategoryImageLinks.Where(c => c.ImageLinkId == dbLink.LinkId).Where(c => c.ImageCategoryId == folderId).ToList();
        //                foreach (CategoryImageLink badLink in badLinks)
        //                {
        //                    db.CategoryImageLinks.Remove(badLink);
        //                    db.SaveChanges();
        //                    linksRemoved++;
        //                }
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            repairReport.Errors.Add("unable to remove GoDaddyLink: " + dbLink.LinkId + " error: " + ex.Message);
        //        }
        //    }
        //    if (dbLinks.Count() != fileInfos.Count())
        //    {
        //        foreach (RepairLinkModel dbLink in dbLinks)
        //        {
        //            try
        //            {
        //                if (dbLink.GoDaddyLink.Substring(0, dbLink.GoDaddyLink.LastIndexOf("/")) != properLink)
        //                {
        //                    GoDaddyLink malformedLink = db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).First();
        //                    db.GoDaddyLinks.Remove(malformedLink);
        //                    db.SaveChanges();
        //                    linksRemoved++;
        //                }
        //            }
        //            catch (Exception ex)
        //            {
        //                var x = Helpers.ErrorDetails(ex);
        //                repairReport.Errors.Add("unable to remove GoDaddyLink: " + dbLink.LinkId + " error: " + Helpers.ErrorDetails(ex));
        //            }
        //        }
        //    }
        //    return linksRemoved;
        //}

        //private int AddMissingLinks(FileInfo[] fileInfos, string goDaddyPrefix, int folderId, OggleBoobleContext db, RepairReportModel repairReport)
        //{
        //    int linksAdded = 0;
        //    string fullGoDaddayLink = "";
        //    foreach (FileInfo file in fileInfos)
        //    {
        //        try
        //        {
        //            var linkId = file.Name.Substring(file.Name.IndexOf("_") + 1, 36);
        //            if (db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault() == null)
        //            {
        //                fullGoDaddayLink = goDaddyPrefix + file.Name;
        //                db.GoDaddyLinks.Add(new GoDaddyLink() { Id = linkId, ExternalLink = fullGoDaddayLink, Link = fullGoDaddayLink });
        //                if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault() == null)
        //                    db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = linkId });
        //                db.SaveChanges();
        //                linksAdded++;
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            var x = Helpers.ErrorDetails(ex);
        //            repairReport.Errors.Add("unable to add GoDaddyLink: " + fullGoDaddayLink + " error: " + Helpers.ErrorDetails(ex));
        //        }
        //    }
        //    return linksAdded;
        //}

        //private string GetMonthName(int m)
        //{
        //    switch (m)
        //    {
        //        case 0: return "January";
        //        case 1: return "February";
        //        case 2: return "March";
        //        case 3: return "April";
        //        case 4: return "May";
        //        case 5: return "June";
        //        case 6: return "July";
        //        case 7: return "August";
        //        case 8: return "September";
        //        case 9: return "October";
        //        case 10: return "November";
        //        case 11: return "December";
        //        default: return "";
        //    }
        //}

        // 400 lines of junk
        //private RepairReportModel RepealAndReplace(GalleryItem data)
        //{
        //    int rootId = data.FolderId;
        //    string destination = data.FolderName;
        //    //int rootId, string destination
        //    var repairReport = new RepairReportModel() { LinksEdited = 0, ImagesRenamed = 0, NewLinksAdded = 0, LinksRemoved = 0 };
        //    try
        //    {
        //        var folderName = "";
        //        using (OggleBoobleContext db = new OggleBoobleContext())
        //        {
        //            var dbRoot = db.CategoryFolders.Where(f => f.Id == rootId).First();
        //            folderName = dbRoot.FolderName;
        //            //RepairRecurr(
        //            //    folderId: rootId,
        //            //    rootFolder: dbRoot.RootFolder,
        //            //    folderPath: destination + "/" + GetParentPath(rootId),
        //            //    goDaddyPath: folderName,
        //            //    subFolderPrefix: folderName,
        //            //    repairReport: repairReport,
        //            //    db: db);
        //        }
        //        //repairReport.FolderName = folderName;
        //        //repairReport.ErrorArray = repairReport.Errors.ToArray();
        //        repairReport.Success = "ok";
        //    }
        //    catch (Exception ex)
        //    {
        //        repairReport.Success = Helpers.ErrorDetails(ex);
        //    }
        //    return repairReport;
        //}

        //private void RepairRecurr(int folderId, string folderPath, OggleBoobleContext db)
        //{
        //timer.Start();
        //bool fixedit = false;
        //foreach (FileInfo missingImage in repairReport.MissingImages)
        //{
        //    if (missingImage.Name.Length > 40)
        //    {
        //        if (missingImage.Name.IndexOf("_") > 0)
        //        {
        //            var linkId = missingImage.Name.Substring(missingImage.Name.LastIndexOf("_") + 1, 36);
        //            if (linkId.Length == 36)
        //            {
        //                RepairReport repairReportRow = new RepairReport()
        //                {
        //                    LinkId = linkId,
        //                    ProblemType = "Orphan Image",
        //                    Problem = missingImage.FullName,
        //                    Created = DateTime.Now
        //                };
        //                db.RepairReports.Add(repairReportRow);
        //                db.SaveChanges();
        //                if (repairReport.BadLinks.Where(g => g.Id == linkId).FirstOrDefault() != null)
        //                {
        //                    GoDaddyLink goDaddyLink = db.GoDaddyLinks.Where(g => g.Id == linkId).First();
        //                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.FolderName == missingImage.DirectoryName).FirstOrDefault();
        //                    if (categoryFolder != null)
        //                    {
        //                        var newLocalFileName = missingImage.DirectoryName + "_" + linkId + missingImage.Extension;
        //                        var goDaddyPrefix = "http://" + categoryFolder.RootFolder + ".ogglebooble.com/";
        //                        var goDaddyPath = missingImage.FullName.Substring(44, missingImage.FullName.LastIndexOf("/"));
        //                        var newGoDaddyLink = goDaddyPrefix + goDaddyPath + newLocalFileName;
        //                        if (newLocalFileName != missingImage.Name)
        //                        {
        //                            goDaddyLink.Link = goDaddyPrefix + missingImage.DirectoryName + newLocalFileName;
        //                            var movePath = missingImage.FullName.Substring(0, missingImage.FullName.LastIndexOf("/"));
        //                            //missingImage.MoveTo(movePath + newFileName);
        //                        }
        //                        //db.SaveChanges();
        //                        repairReport.LinksRemoved++;
        //                        fixedit = true;
        //                    }
        //                }
        //            }
        //        }
        //    }                    
        //    if (!fixedit)
        //    {
        //        if (repairReport.BadLinks.Where(g => g.ExternalLink.Contains(missingImage.Name)).FirstOrDefault() != null)
        //        {
        //            //if (db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault() != null)
        //            //{
        //            //    // pair a missing image with a bad link
        //            //}
        //            // match them
        //            // pop them
        //            //$('#dataifyInfo').append(", missing links: " + 
        //            GoDaddyLink wierd = db.GoDaddyLinks.Where(g => g.ExternalLink.Contains(missingImage.Name)).First();
        //        }
        //        else
        //        {
        //            // create a new link
        //        }
        //    }
        //    fixedit = false;
        //}
        //foreach (GoDaddyLink goDaddyLink in repairReport.BadLinks)
        //{
        //    RepairReport repairReportRow = new RepairReport()
        //    {
        //        LinkId = goDaddyLink.Id,
        //        ProblemType = "Bad Link",
        //        Problem = "link: " + goDaddyLink.Link,
        //        Created = DateTime.Now
        //    };
        //    db.RepairReports.Add(repairReportRow);
        //    db.SaveChanges();
        //}
        //timer.Stop();
        //System.Diagnostics.Debug.WriteLine("MissingImages took: " + timer.Elapsed);


        //private void RepairRecurr(int folderId, string rootFolder, string folderPath, string goDaddyPath, string subFolderPrefix, RepairReport repairReport, OggleBoobleContext db)

        //var subFolderIds = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
        //foreach (var subFolderId in subFolderIds)
        //{
        //    RepairRecurr(subFolderId, rootFolder, folderPath, goDaddyPath, subFolderPrefix, repairReport, db);
        //}



        //var fileName = "";
        //var folderName = "";
        //FileInfo[] fileInfos = null;
        //List<RepairLinkModel> dbLinks = GetDownloadLinks(folderId, db);
        //if (dbLinks.Count() == 0)
        //{
        //    string emptyFolder = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
        //    folderPath += "/" + emptyFolder;
        //    if (subFolderPrefix.EndsWith(emptyFolder))
        //        subFolderPrefix = "";
        //    else
        //    {
        //        if (subFolderPrefix == "")
        //            subFolderPrefix = emptyFolder;
        //        if (subFolderPrefix.Contains("_"))
        //            subFolderPrefix = subFolderPrefix.Substring(subFolderPrefix.IndexOf("_")) + "_" + emptyFolder;
        //    }
        //    if (!goDaddyPath.EndsWith(emptyFolder))
        //    {
        //        goDaddyPath += "/" + emptyFolder;
        //    }
        //}

        //folderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;


        //folderName = db.CategoryFolders.Where(f => f.Id == folderId).First().FolderName;
        //folderPath += "/" + folderName;



        //if (dbLinks.Count() > 0)
        //{
        //    folderName = dbLinks[0].FolderName;
        //    if (subFolderPrefix != folderName)
        //    {
        //        if (!subFolderPrefix.EndsWith(folderName))
        //        {
        //            if (subFolderPrefix == "")
        //                subFolderPrefix = folderName;
        //            else
        //            {
        //                if (subFolderPrefix.Contains("_"))
        //                    subFolderPrefix = subFolderPrefix.Substring(subFolderPrefix.IndexOf("_")) + "_" + folderName;
        //                else
        //                    subFolderPrefix += "_" + folderName;
        //            }
        //        }
        //        goDaddyPath += "/" + folderName;
        //    }





        //var linkPrefix = "http://" + rootFolder + ".ogglebooble.com/";

        //    while (dbLinks.Count() != fileInfos.Count())
        //    {
        //        if (fileInfos.Count() > dbLinks.Count())
        //        {
        //            int linksAdded = AddMissingLinks(fileInfos, linkPrefix + goDaddyPath + "/", folderId, db, repairReport);
        //            if (linksAdded > 0)
        //            {
        //                dbLinks = GetDownloadLinks(folderId, db);
        //                repairReport.NewLinksAdded += linksAdded;
        //            }
        //        }
        //        if (dbLinks.Count() > fileInfos.Count())
        //        {
        //            int linksRemoved = RemoveBadLinks(dbLinks, fileInfos, linkPrefix + goDaddyPath, folderId, db, repairReport);
        //            if (linksRemoved > 0)
        //            {
        //                dbLinks = GetDownloadLinks(folderId, db);
        //                repairReport.LinksRemoved += linksRemoved;
        //            }
        //        }
        //    }

        //#region step 3 rename 
        //var fileIncrimentor = 0;
        //var trimlink = "";
        //        if (rootFolder == "centerfolds")
        //            fileName = "Playboy centerfold " + GetMonthName(fileIncrimentor++) + " " + dbLink.FolderName + fileInfos[fileIncrimentor].Extension;
        //        else
        //            fileName = dbLink.FolderName + "_" + dbLink.LinkId + fileInfos[fileIncrimentor].Extension;
        //        string fullGoDaddayLink = linkPrefix + goDaddyPath + "/" + fileName;
        //        if (trimlink != fullGoDaddayLink)
        //        {
        //            try
        //            {
        //                if (fileInfos[fileIncrimentor].Name != fileName)
        //                {
        //                    if (fileInfos.Where(f => f.Name == fileName).FirstOrDefault() == null)
        //                    {
        //                        fileInfos[fileIncrimentor].MoveTo(folderPath + "/" + fileName);
        //                        repairReport.ImagesRenamed++;
        //                    }
        //                    else
        //                    {
        //                        repairReport.Errors.Add("fileName: " + fileName + " file not found: " + dbLink.LinkId + " not found");
        //                    }
        //                }
        //                if (db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).Where(g => g.Link == fullGoDaddayLink).FirstOrDefault() == null)
        //                {
        //                    GoDaddyLink goDaddyRowWithBadName = db.GoDaddyLinks.Where(g => g.Id == dbLink.LinkId).FirstOrDefault();
        //                    if (goDaddyRowWithBadName != null)
        //                    {
        //                        goDaddyRowWithBadName.Link = fullGoDaddayLink;
        //                        db.SaveChanges();
        //                        repairReport.LinksEdited++;
        //                    }
        //                    else
        //                    {
        //                        repairReport.Errors.Add("fileName: " + fileName + " message: GoDaddy row with Id: " + dbLink + " not found");
        //                    }
        //                }
        //            }
        //            catch (Exception ex)
        //            {
        //                repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
        //            }
        //        }
        //        if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == dbLink.LinkId).FirstOrDefault() == null)
        //        {
        //            db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = dbLink.LinkId });
        //            db.SaveChanges();
        //        }
        //    }
        //    fileIncrimentor++;
        //}
        //#endregion
        //if (fileInfos == null) //&& (dbLinks.Count() > 0))
        //{
        //    var dbCategory = db.CategoryFolders.Where(f => f.Id == folderId).First();
        //    folderName = dbCategory.FolderName;
        //    rootFolder = dbCategory.RootFolder;
        //    DirectoryInfo dirInfo2 = new DirectoryInfo(folderPath);
        //    if (!dirInfo.Exists)
        //        dirInfo.Create();

        //    fileInfos = dirInfo2.GetFiles();

        //    if ((fileInfos != null) && (fileInfos.Count() > dbLinks.Count()))
        //    {
        //        for (int i = 0; i < fileInfos.Count(); i++)
        //        {
        //            try
        //            {
        //                string newId = Guid.NewGuid().ToString();
        //                if (fileInfos[i].Name.Length > 40)
        //                {
        //                    newId = fileInfos[i].Name.Substring(fileInfos[i].Name.Length - 40, 36);
        //                }
        //                var extension = fileInfos[i].Extension;
        //                if (extension == "")
        //                    extension = ".jpg";

        //                if (rootFolder == "centerfolds")
        //                    fileName = "Playboy centerfold " + GetMonthName(i) + " " + folderName + extension;
        //                else
        //                {
        //                    fileName = folderName + "_" + newId + extension;
        //                    //fileName = subFolderPrefix + "_" + newId + extension;
        //                }

        //                var ppLink = "http://" + rootFolder + ".ogglebooble.com/" + goDaddyPath + "/" + fileName;
        //                GoDaddyLink d = new GoDaddyLink()
        //                {
        //                    ExternalLink = fileName,
        //                    Link = ppLink,
        //                    Id = newId
        //                };
        //                db.GoDaddyLinks.Add(d);
        //                CategoryImageLink c = new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = newId };
        //                db.CategoryImageLinks.Add(c);
        //                db.SaveChanges();

        //                fileInfos[i].MoveTo(folderPath + "/" + fileName);
        //                repairReport.NewLinksAdded++;
        //            }
        //            catch (Exception ex)
        //            {
        //                var x = ex.Message;
        //                repairReport.Errors.Add("fileName: " + fileName + " message: " + ex.Message);
        //            }
        //        }
        //    }
        //}
        //private void DownloadImage(string externalLink, string newFileName)
        //{
        //    using (WebClient wc = new WebClient())
        //    {
        //        wc.DownloadFileAsync(new System.Uri(externalLink), newFileName);

        //    }
        //}
        //}

        //private void CreateShortcut(string target, string destination)
        //{
        //    object shDesktop = (object)"Desktop";
        //    WshShell shell = new WshShell();
        //    //string shortcutAddress = (string)shell.SpecialFolders.Item(ref shDesktop) + @"\Notepad.lnk";
        //    IWshShortcut shortcut = (IWshShortcut)shell.CreateShortcut(target);
        //    //shortcut.Description = "New shortcut for a Notepad";
        //    //shortcut.Hotkey = "Ctrl+Shift+N";
        //    //shortcut.TargetPath = Environment.GetFolderPath(Environment.SpecialFolder.System) + @"\notepad.exe";
        //    shortcut.TargetPath = destination;
        //    shortcut.Save();
        //    //public object ShellLink { get; private set; }
        //}

        //[HttpPatch]
        //public string RestoreLinks(string path, int folderId)
        //{
        //    string success = "";
        //    try
        //    {
        //        using (OggleBoobleContext db = new OggleBoobleContext())
        //        {
        //            var dbCategory = db.CategoryFolders.Where(c => c.Id == folderId).First();
        //            string rootFolder = dbCategory.RootFolder;
        //            string folderPath = Helpers.GetParentPath(folderId, false) + "/" + dbCategory.FolderName;
        //            DirectoryInfo dirInfo = new DirectoryInfo(path + folderPath);
        //            FileInfo[] fileInfos = dirInfo.GetFiles();
        //            var linkPrefix = "";
        //            foreach (FileInfo file in fileInfos)
        //            {
        //                linkPrefix = "http://" + rootFolder + ".ogglebooble.com" +
        //                    file.DirectoryName.Substring(file.DirectoryName.ToUpper().IndexOf(rootFolder.ToUpper()) + rootFolder.Length);

        //                string linkId = Guid.NewGuid().ToString();
        //                if (file.Name.IndexOf("_") > 0)
        //                {
        //                    linkId = file.Name.Substring(file.Name.IndexOf("_") + 1, 36);
        //                }

        //                GoDaddyLink existingGoDaddyink = db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault();
        //                if (existingGoDaddyink != null)
        //                {
        //                    if (existingGoDaddyink.Link != linkPrefix + "/" + file.Name)
        //                    {
        //                        existingGoDaddyink.Link = linkPrefix + "/" + file.Name;
        //                        db.SaveChanges();
        //                    }
        //                }
        //                else
        //                {
        //                    var test = linkPrefix + "/" + file.DirectoryName + "_" + linkId + file.Extension;
        //                    test = linkPrefix + "/" + file.Name;
        //                    db.GoDaddyLinks.Add(new GoDaddyLink()
        //                    {
        //                        Id = linkId,
        //                        ExternalLink = file.Name,
        //                        Link = linkPrefix + "/" + file.Name
        //                        //Link = linkPrefix + "/" + file.DirectoryName + "_" + linkId + file.Extension
        //                    });
        //                    db.SaveChanges();
        //                }
        //                var existingCatLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault();
        //                if (existingCatLink == null)
        //                {
        //                    db.CategoryImageLinks.Add(new CategoryImageLink()
        //                    {
        //                        ImageCategoryId = folderId,
        //                        ImageLinkId = linkId
        //                    });
        //                    db.SaveChanges();
        //                }
        //            }
        //        }
        //        success = "ok";
        //    }
        //    catch (Exception ex)
        //    {
        //        success = Helpers.ErrorDetails(ex);
        //    }
        //    return success;
        //}

        string[] GetTransitions(string folder)
        {
            string danni = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/Danni/transitions") + "/" + folder;
            FileInfo[] files = new DirectoryInfo(danni).GetFiles();
            List<string> images = new List<string>();
            foreach (FileInfo img in files)
                images.Add(img.Name);
            return images.ToArray();
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
