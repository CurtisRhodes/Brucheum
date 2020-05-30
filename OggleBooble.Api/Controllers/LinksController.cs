using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
//using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class LinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);


        [HttpGet]
        [Route("api/Links/BuildCatTree")]
        public DirTreeSuccessModel BuildCatTree(int root)
        {
            DirTreeSuccessModel dirTreeModel = new DirTreeSuccessModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                IEnumerable<MsSqlDataContext.VwDirTree> vwDirTrees = new List<MsSqlDataContext.VwDirTree>();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    // wow did this speed things up
                    vwDirTrees = db.VwDirTrees.ToList().OrderBy(v => v.Id);
                }

                MsSqlDataContext.VwDirTree vRootNode = vwDirTrees.Where(v => v.Id == root).First();
                DirTreeModelNode rootNode = new DirTreeModelNode() { vwDirTree = vRootNode };
                dirTreeModel.SubDirs.Add(rootNode);

                //GetDirTreeChildNodes(dirTreeModel, rootNode, vwDirTrees);
                GetDirTreeChildNodes(dirTreeModel, rootNode, vwDirTrees, "");
                timer.Stop();
                dirTreeModel.TimeTook = timer.Elapsed;
                //System.Diagnostics.Debug.WriteLine("RebuildCatTree took: " + timer.Elapsed);
                dirTreeModel.Success = "ok";
            }
            catch (Exception ex)
            {
                dirTreeModel.Success = Helpers.ErrorDetails(ex);
            }
            return dirTreeModel;
        }
        private void GetDirTreeChildNodes(DirTreeSuccessModel dirTreeModel, DirTreeModelNode parentNode, IEnumerable<MsSqlDataContext.VwDirTree> vwDirTree, string dPath)
        {
            var vwDirTreeNodes = vwDirTree.Where(v => v.Parent == parentNode.vwDirTree.Id).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();
            foreach (VwDirTree vNode in vwDirTreeNodes)
            {
                DirTreeModelNode childNode = new DirTreeModelNode() { vwDirTree = vNode, DanniPath = (dPath + "/" + vNode.FolderName).Replace(" ", "%20") };
                parentNode.SubDirs.Add(childNode);
                if (vNode.IsStepChild == 0)
                    GetDirTreeChildNodes(dirTreeModel, childNode, vwDirTree, (dPath + "/" + vNode.FolderName).Replace(" ", "%20"));
            }
        }



        [HttpGet]
        [Route("api/Links/RepairLinks")]
        public RepairReportModel RepairLinks(int folderId, bool recurr)
        {
            RepairReportModel repairReport = new RepairReportModel();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();

                string rootFolder = dbCategoryFolder.RootFolder;
                if (rootFolder == "centerfold") rootFolder = "playboy";

                string ftpPath = ftpHost + "/" + rootFolder + ".ogglebooble.com/" + Helpers.GetParentPath(folderId) + dbCategoryFolder.FolderName;
                string[] imageFiles = FtpUtilies.GetFiles(ftpPath);
                List<string> imageFileLinkIds = new List<string>();
                foreach (string imageFile in imageFiles)
                {
                    imageFileLinkIds.Add(imageFile.Substring(imageFile.IndexOf("_") + 1, 36));
                }

                List<ImageLink> goDaddyLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     && g.Link.Contains(dbCategoryFolder.FolderName)
                     && g.FolderLocation == dbCategoryFolder.Id
                     select (g)).ToList();

                // 1 check if there is a file in the folder for every link in the table.
                foreach (string linkId in imageFileLinkIds)
                {
                    if (!goDaddyLinks.Exists(g => g.Id == linkId))
                    {
                        // physical file located that does not contain a link record
                        // and I will not have external link info
                        repairReport.Errors.Add("file with no link: " + linkId);
                        //goDaddyLinks.Add(new ImageLink() { Id = linkId });
                    }
                }

                // 2 check if there is a link for every file 
                foreach (ImageLink imageLink in goDaddyLinks)
                {
                    if (imageFileLinkIds.Find(t => t == imageLink.Id) == "")
                    {
                        repairReport.Errors.Add("link with no file: " + imageLink.Id);
                    }
                }
            }
            repairReport.Success = "ok";
            return repairReport;
        }



        public RepairReportModel XXRepairLinks(int startFolderId, string drive)
        {
            RepairReportModel repairReport = new RepairReportModel() { isSubFolder = false };
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var timer = new System.Diagnostics.Stopwatch();
                    timer.Start();
                    RepairLinksRecurr(startFolderId, repairReport, db);
                    timer.Stop();
                    System.Diagnostics.Debug.WriteLine("VerifyLinksRecurr took: " + timer.Elapsed);
                }
                repairReport.Success = "ok";
            }
            catch (Exception ex) { repairReport.Success = Helpers.ErrorDetails(ex); }
            return repairReport;
        }
        private void RepairLinksRecurr(int folderId, RepairReportModel repairReport, OggleBoobleContext db)
        {
            try
            {
                CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();

                string rootFolder = dbCategoryFolder.RootFolder;
                if (rootFolder == "centerfold")
                    rootFolder = "playboy";

                string ftpPath = ftpHost + "/" + rootFolder + ".ogglebooble.com/"
                    + Helpers.GetParentPath(folderId) + dbCategoryFolder.FolderName;

                if (!FtpUtilies.DirectoryExists(ftpPath))
                {
                    repairReport.DirNotFound++;
                    FtpUtilies.CreateDirectory(ftpPath);
                    repairReport.Errors.Add("created directory " + ftpPath);
                }
                int folderRowsProcessed = 0;

                //if (repairReport.isSubFolder)
                //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                //else
                //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);

                List<ImageLink> goDaddyLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     && g.Link.Contains(dbCategoryFolder.FolderName)
                     && g.FolderLocation == dbCategoryFolder.Id
                     select (g)).ToList();

                string[] imageFiles = FtpUtilies.GetFiles(ftpPath);

                string goDaddyPrefix = "http://" + rootFolder + ".ogglebooble.com/";
                string expectedLinkName = goDaddyPrefix + Helpers.GetParentPath(folderId) + dbCategoryFolder.FolderName;
                string ext = "";
                bool fileNameInExpectedForm;
                string linkId = "";

                foreach (string fileName in imageFiles)
                {
                    //EnsureCorrectFileName(fileName, ftpPath);
                    if ((fileName.LastIndexOf("_") > 0) && (fileName.Substring(fileName.LastIndexOf("_")).Length > 40))
                    {
                        fileNameInExpectedForm = true;
                        if (fileName.IndexOf(".") > 0)
                        {
                            ext = fileName.Substring(fileName.Length - 4);
                            linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                            //expectedFileName = dbCategoryFolder.FolderName + "_" + linkId + ext;
                            //if (fileName == expectedFileName)

                            var folderNameWhereImageSayItShouldBe = fileName.Substring(0, fileName.IndexOf("_"));
                            if (folderNameWhereImageSayItShouldBe != dbCategoryFolder.FolderName)
                            {
                                CategoryFolder categoryFolderWhereImageSayItShouldBe = db.CategoryFolders.Where(f => f.FolderName == folderNameWhereImageSayItShouldBe).FirstOrDefault();
                                if (categoryFolderWhereImageSayItShouldBe != null)
                                {
                                    string ftpPathWhereImageSayItShouldBe = ftpHost + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                        + Helpers.GetParentPath(categoryFolderWhereImageSayItShouldBe.Id) + categoryFolderWhereImageSayItShouldBe.FolderName;
                                    string[] ArrayWhereImageSayItShouldBe = FtpUtilies.GetFiles(ftpPathWhereImageSayItShouldBe);
                                    if (ArrayWhereImageSayItShouldBe.Contains(categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext))
                                    {
                                        FtpUtilies.DeleteFile(ftpPath + categoryFolderWhereImageSayItShouldBe.FolderName + "_" + linkId + ext);
                                        repairReport.LinksRemoved++;
                                    }
                                }
                                else
                                {  // move file 
                                    string source = ftpPath + "/" + fileName;
                                    string destination = ftpHost + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                        + Helpers.GetParentPath(categoryFolderWhereImageSayItShouldBe.Id) + categoryFolderWhereImageSayItShouldBe.FolderName;
                                    if (source != destination)
                                    {
                                        FtpUtilies.MoveFile(source, destination);
                                        ImageLink extraLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                        if (extraLink != null)
                                        {
                                            db.ImageLinks.Remove(extraLink);
                                            db.SaveChanges();
                                        }
                                        repairReport.ImagesMoved++;
                                    }
                                }
                            }

                            ImageLink goDaddyLinkExists = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                            if (goDaddyLinkExists == null)
                            {
                                if (FtpUtilies.DirectoryExists(ftpPath + "/" + fileName))
                                {
                                    ImageLink newLink = new ImageLink() { Id = linkId, Link = expectedLinkName + "/" + fileName, ExternalLink = "unknown", FolderLocation = folderId };
                                    db.ImageLinks.Add(newLink);
                                    db.SaveChanges();
                                    repairReport.NewLinksAdded++;
                                }
                            }
                            else
                            {
                                // if (goDaddyLinkExists.Link.ToUpper() != (expectedLinkName + "/" + fileName).ToUpper())
                                if (goDaddyLinkExists.Link != expectedLinkName + "/" + fileName)
                                {
                                    goDaddyLinkExists.Link = expectedLinkName + "/" + fileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                            }
                            if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).Where(c => c.ImageCategoryId == folderId).FirstOrDefault() == null)
                            {
                                CategoryImageLink newCatLink = new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = linkId };
                                db.CategoryImageLinks.Add(newCatLink);
                                db.SaveChanges();
                                repairReport.CatLinksAdded++;
                            }
                        }
                        else
                        {
                            repairReport.Errors.Add("extension problem");
                            fileNameInExpectedForm = false;
                        }
                    }
                    else
                    {
                        fileNameInExpectedForm = false;
                        ext = fileName.Substring(fileName.Length - 4);
                        linkId = Guid.NewGuid().ToString();
                        //expectedFileName = dbCategoryFolder.FolderName + "_" + linkId + ext;
                    }
                    if (!fileNameInExpectedForm)
                    {
                        // rename file
                        string renameSuccess = FtpUtilies.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + fileName);
                        if (renameSuccess == "ok")
                        {
                            repairReport.ImagesRenamed++;
                            ImageLink oldImageLink = goDaddyLinks.Where(g => g.Link == expectedLinkName + "/" + fileName).FirstOrDefault();
                            if (oldImageLink != null)
                            {
                                if (oldImageLink.Link != expectedLinkName + "/" + fileName)
                                {
                                    // update godaddy link
                                    oldImageLink.Link = expectedLinkName + "/" + fileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                            }
                            else
                            {
                                // link not found in this folder's links
                                ImageLink goDaddyLink = db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault();
                                if (goDaddyLink != null)
                                {
                                    goDaddyLink.Link = expectedLinkName + "/" + fileName;
                                    db.SaveChanges();
                                    repairReport.LinksEdited++;
                                }
                                else
                                {
                                    var newImageLink = new ImageLink()
                                    {
                                        Id = linkId,
                                        FolderLocation = folderId,
                                        Link = expectedLinkName + "/" + fileName,
                                        ExternalLink = ""
                                    };
                                    db.ImageLinks.Add(newImageLink);
                                    db.SaveChanges();
                                    repairReport.NewLinksAdded++;
                                }

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
                            }
                        }
                        else
                        {
                            repairReport.Errors.Add("rename Failed: " + renameSuccess);
                        }
                    }

                    //if (repairReport.isSubFolder)
                    //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                    //else
                    //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);


                    repairReport.RowsProcessed++;
                    folderRowsProcessed++;
                }

                if (goDaddyLinks.Count() != imageFiles.Count())
                {
                    if (goDaddyLinks.Count() > imageFiles.Count())
                    {

                        string expectedFileName = "";
                        foreach (ImageLink goDaddyLink in goDaddyLinks)
                        {
                            expectedFileName = goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("/") + 1);
                            linkId = goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("_") + 1, 36);
                            if (!imageFiles.Contains(expectedFileName))
                            {
                                ImageLink imageLink = db.ImageLinks.Where(i => i.Id == linkId).FirstOrDefault();
                                if (imageLink == null)
                                {
                                    repairReport.Errors.Add("image file in folder with no imageLink row");
                                }
                                else
                                {
                                    if (imageLink.FolderLocation == folderId)
                                    {
                                        CategoryImageLink categoryImageLink = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId && l.ImageLinkId == linkId).FirstOrDefault();
                                        //if (categoryImageLink == null)
                                        {
                                            //repairReport.Errors.Add("image file in folder with no imageLink row");
                                            List<ImageLink> flinks = db.ImageLinks.Where(i => i.ExternalLink == imageLink.ExternalLink).ToList();


                                            string downLoadSuccess = DownLoadImage(ftpPath, goDaddyLink.ExternalLink, expectedFileName);
                                            if (downLoadSuccess == "ok")
                                                repairReport.ImagesDownLoaded++;
                                            else
                                            {
                                                // problem with links to child folder files
                                                repairReport.Errors.Add(goDaddyLink.ExternalLink + " " + downLoadSuccess);
                                                db.ImageLinks.Remove(goDaddyLink);
                                                var badCatFolderImageLink = db.CategoryImageLinks.Where(c => c.ImageCategoryId == dbCategoryFolder.Id && c.ImageLinkId == goDaddyLink.Id).FirstOrDefault();
                                                if (badCatFolderImageLink != null)
                                                {
                                                    db.CategoryImageLinks.Remove(badCatFolderImageLink);
                                                }
                                                db.SaveChanges();
                                                repairReport.LinksRemoved++;
                                            }
                                        }
                                    }
                                }
                            }
                            //if (repairReport.isSubFolder)
                            //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                            //else
                            //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
                        }
                    }

                    if (imageFiles.Count() > goDaddyLinks.Count())
                    {
                        repairReport.Errors.Add("Extra Links Found in " + ftpPath);
                        foreach (string imageFile in imageFiles)
                        {
                            linkId = imageFile.Substring(imageFile.IndexOf("_") - 1);
                            var x = db.ImageLinks.Where(i => i.Link == imageFile).FirstOrDefault();
                            if (x == null)
                            {
                                // add a link
                                db.ImageLinks.Add(new ImageLink()
                                {
                                    Id = Guid.NewGuid().ToString(),
                                    Link = imageFile,
                                    ExternalLink = "gg"
                                });
                                db.SaveChanges();
                            }
                        }
                    }
                }


                int[] subDirs = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
                foreach (int subDir in subDirs)
                {
                    repairReport.isSubFolder = true;
                    RepairLinksRecurr(subDir, repairReport, db);
                }
            }
            catch (Exception ex) { repairReport.Success = Helpers.ErrorDetails(ex); }
        }

        private string DownLoadImage(string ftpPath, string link, string newFileName)
        {
            string success = "ok";
            try
            {
                string extension = newFileName.Substring(newFileName.Length - 4);
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                using (WebClient wc = new WebClient())
                {
                    wc.DownloadFile(new Uri(link), appDataPath + "tempImage" + extension);
                }

                FtpWebRequest webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                using (Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = System.IO.File.ReadAllBytes(appDataPath + "tempImage" + extension);
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
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