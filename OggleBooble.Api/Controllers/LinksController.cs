using OggleBooble.Api.Models;
using OggleBooble.Api.MSSqlDataContext;
using OggleBooble.Api.MySqlDataContext;
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
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
        //static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

        [HttpGet]
        [Route("api/Links/GetImageLinks")]
        public ImageLinksModel GetImageLinks(int folderId)
        {
            var imgLinks = new ImageLinksModel();
            using (var db = new OggleBoobleMySqlContext())
            {
                imgLinks.Links = db.VwLinks.Where(l => l.Id == folderId).OrderBy(l => l.SortOrder).ToList();
            }
            imgLinks.Success = "ok";
            return imgLinks;
        }

        [HttpPut]
        [Route("api/Links/GetImageLinks")]
        public string UpdateSortOrder(List<SortOrderItem> SortOrderItems)
        {
            string success = "";
            using (var db = new OggleBoobleMySqlContext())
            {
                foreach (SortOrderItem item in SortOrderItems)
                {
                    var link = db.CategoryImageLinks.Where(l => l.ImageCategoryId == item.PageId && l.ImageLinkId == item.ItemId).FirstOrDefault();
                    if (link != null)
                        link.SortOrder = item.InputValue;
                }
                db.SaveChanges();
                success = "ok";
            }
            return success;
        }

        [HttpGet]
        [Route("api/Links/BuildCatTree")]
        public DirTreeSuccessModel BuildCatTree(int root)
        {
            DirTreeSuccessModel dirTreeModel = new DirTreeSuccessModel();
            try
            {
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                IEnumerable<VwDirTree> VwDirTrees = new List<VwDirTree>();
                //var vwDirTrees;
                using (var db = new OggleBoobleMySqlContext())
                {
                    // wow did this speed things up
                    VwDirTrees = db.VwDirTrees.ToList().OrderBy(v => v.Id);
                }

                var vRootNode = VwDirTrees.Where(v => v.Id == root).First();
                DirTreeModelNode rootNode = new DirTreeModelNode() { VwDirTree = vRootNode };
                dirTreeModel.SubDirs.Add(rootNode);

                //GetDirTreeChildNodes(dirTreeModel, rootNode, vwDirTrees);
                GetDirTreeChildNodes(dirTreeModel, rootNode, VwDirTrees, "");
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
        private void GetDirTreeChildNodes(DirTreeSuccessModel dirTreeModel, DirTreeModelNode parentNode, IEnumerable<VwDirTree> VwDirTrees, string dPath)
        {
            var vwDirTreeNodes = VwDirTrees.Where(v => v.Parent == parentNode.VwDirTree.Id).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();
            foreach (VwDirTree vNode in vwDirTreeNodes)
            {
                DirTreeModelNode childNode = new DirTreeModelNode() { VwDirTree = vNode, DanniPath = (dPath + "/" + vNode.FolderName).Replace(" ", "%20") };
                parentNode.SubDirs.Add(childNode);
                if (vNode.IsStepChild == 0)
                    GetDirTreeChildNodes(dirTreeModel, childNode, VwDirTrees, (dPath + "/" + vNode.FolderName).Replace(" ", "%20"));
            }
        }

        [HttpPost]
        [Route("api/Links/AddLink")]
        public string AddLink(string linkId, int destinationId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                    {
                        ImageCategoryId = destinationId,
                        ImageLinkId = linkId,
                        SortOrder = 1456
                    });
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        [HttpPost]
        [Route("api/Links/MoveLink")]
        public string MoveLink(string linkId, int sourceId, int destinationId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink() { ImageCategoryId = destinationId, ImageLinkId = linkId, SortOrder = 1456 });
                    var linkToRemove = db.CategoryImageLinks.Where(l => l.ImageCategoryId == sourceId && l.ImageLinkId == linkId).First();
                    db.CategoryImageLinks.Remove(linkToRemove);
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/RenameFolder")]
        public string RenameFolder(int folderId, string newFolderName)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    VirtualFolder rowToRename = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    rowToRename.FolderName = newFolderName;
                    db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpDelete]
        [Route("api/Links/RemoveLink")]
        public string RemoveLink(string linkId, int folderId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var imageLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId).ToList();
                    if (imageLinks.Count > 1)
                    {
                        var imageFile = db.ImageFiles.Where(i => i.Id == linkId).First();
                        if (imageFile.FolderId == folderId)
                            success = "home folder Link";
                        else
                        {
                            var linkToRemove = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId && l.ImageCategoryId == folderId).First();
                            db.CategoryImageLinks.Remove(linkToRemove);
                            db.SaveChanges();
                            success = "ok";
                        }
                    }
                    else
                        success = "single Link";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/MoveLinkToRejects")]
        public string MoveLinkToRejects(string linkId, int folderId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    var linksToRemove = db.CategoryImageLinks.Where(l => l.ImageLinkId == linkId).ToList();
                    db.CategoryImageLinks.RemoveRange(linksToRemove);
                    ImageFile reject = db.ImageFiles.Where(i => i.Id == linkId).First();
                    db.ImageFiles.Remove(reject);
                    db.SaveChanges();
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/MoveFile")]
        public string MoveFile(string linkId, int newFolderId)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    ImageFile dbImageFile = db.ImageFiles.Where(i => i.Id == linkId).First();
                    VirtualFolder dbSourceFolder = db.VirtualFolders.Where(f => f.Id == dbImageFile.FolderId).First();
                    string sourceFtpPath = ftpHost + imgRepo + dbSourceFolder.FolderPath; // + dbSourceFolder.FolderName;
                    VirtualFolder dbDestFolder = db.VirtualFolders.Where(i => i.Id == newFolderId).First();
                    string destFtpPath = ftpHost + imgRepo + dbDestFolder.FolderPath;// + "/" + sourceFolder.FolderName;
                    string ext = dbImageFile.FileName.Substring(dbImageFile.FileName.LastIndexOf("."));
                    string assumedFileName = dbSourceFolder.FolderName + "_" + linkId + ext;
                    string newFileName = dbDestFolder.FolderName + "_" + linkId + ext;

                    if (FtpUtilies.MoveFile(sourceFtpPath + "/" + assumedFileName, destFtpPath + "/" + newFileName) == "ok")
                    {
                        dbImageFile.FileName = assumedFileName;
                        dbImageFile.FolderId = newFolderId;
                        MySqlDataContext.CategoryImageLink moveLink = db.CategoryImageLinks.Where(l => l.ImageCategoryId == dbSourceFolder.Id && l.ImageLinkId == linkId).First();
                        moveLink.ImageCategoryId = newFolderId;
                        db.SaveChanges();
                    }
                    success = "ok";
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        [Route("api/Links/FtpMoveFolder")]
        public string FtpMoveFolder(int folderId, string newFolderName)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    VirtualFolder rowToRename = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    rowToRename.FolderName = newFolderName;
                    var files = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();
                    foreach (ImageFile file in files)
                    {
                        var fileLinkId = file.FileName.Substring(file.FileName.LastIndexOf("_"));
                        file.FileName = newFolderName + fileLinkId;
                    }
                    //db.SaveChanges();
                }
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
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

    [EnableCors("*", "*", "*")]
    public class RepairLinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];

        [HttpGet]
        [Route("api/RepairLinks/RepairLinks")]
        public RepairReportModel RepairLinks(int folderId, bool recurr)
        {
            RepairReportModel repairReport = new RepairReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    CheckFolder(folderId, repairReport, db, recurr);

                    if (repairReport.Success == "ok")
                    {
                        int test1 = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                        RemoveLinks(repairReport.OrphanLinks);
                        int test2 = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                        repairReport.LinksRemoved = test1 - test2;
                    }
                }
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }

        private void CheckFolder(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db, bool recurr)
        {
            try
            {
                VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                var categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                // 1. check for physicalFiles with no link
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var physcialFileName = physcialFiles[i];
                    var physcialFileLinkId = physcialFileName.Substring(physcialFileName.IndexOf("_") + 1, 36);

                    if (categoryImageLinks.Where(il => il.ImageLinkId == physcialFileLinkId).FirstOrDefault() == null)
                    {
                        repairReport.MissingFiles.Add(physcialFiles[i]);
                        db.EventLogs.Add(new EventLog()
                        {
                            EventCode = "MIL",
                            EventDetail = physcialFileName,
                            PageId = folderId,
                            VisitorId = "admin",
                            Occured = DateTime.Now
                        });
                        db.SaveChanges();


                        //if (db.ImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault() == null)
                        //{
                        //    db.ImageFiles.Add(new ImageFile()
                        //    {
                        //        Id = physcialFileLinkId,
                        //        FolderId = folderId,
                        //        FileName = physcialFileName
                        //    });
                        //    repairReport.ImageFileAdded++;
                        //}
                        //db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                        //{
                        //    ImageLinkId = physcialFileLinkId,
                        //    ImageCategoryId = folderId,
                        //    SortOrder = 872
                        //});
                        ////db.SaveChanges();                        
                        //repairReport.NewLinksAdded++;
                    }
                    repairReport.RowsProcessed++;
                }

                List<ImageFile> existingLinks =
                    (from c in db.CategoryImageLinks
                     join i in db.ImageFiles on c.ImageLinkId equals i.Id
                     where c.ImageCategoryId == folderId
                     //join f in db.CategoryFolders on i.FolderId equals f.Id
                     select (i)).ToList();

                // 2 check if there is a file in the folder for every link in the table.
                foreach (ImageFile imageLink in existingLinks)
                {
                    //var results = Array.FindAll(physcialFiles, s => s.Equals(imageLink.FileName));
                    if (!physcialFiles.Contains(imageLink.FileName))
                    {
                        repairReport.OrphanLinks.Add(imageLink.Id);
                        //repairReport.Errors.Add("link with no file: " + imageLink.Id);
                    }
                }
                if (recurr)
                {
                    var childFolders = db.VirtualFolders.Where(c => c.Parent == folderId).ToList();
                    foreach (VirtualFolder childFolder in childFolders)
                    {
                        CheckFolder(childFolder.Id, repairReport, db, recurr);
                    }
                }
                repairReport.Success = "ok";
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
                return;
            }
        }
        private string RemoveLinks(List<string> orphanLinks)
        {
            string success;
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    foreach (string orphanLink in orphanLinks)
                    {
                        var dbImageLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == orphanLink).ToList();
                        db.CategoryImageLinks.RemoveRange(db.CategoryImageLinks.Where(l => l.ImageLinkId == orphanLink).ToList());
                        var imageFile = db.ImageFiles.Where(i => i.Id == orphanLink).First();
                        db.ImageFiles.Remove(imageFile);
                    }
                    db.SaveChanges();
                    success = "0k";
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        private void RepairLinksRecurr(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db)
        {
            try
            {
                VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();

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
                //int folderRowsProcessed = 0;

                //if (repairReport.isSubFolder)
                //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                //else
                //    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);

                List<ImageFile> goDaddyLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageFiles on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     //&& g.Link.Contains(dbCategoryFolder.FolderName)
                     && g.FolderId == dbCategoryFolder.Id
                     select (g)).ToList();

                string[] imageFiles = FtpUtilies.GetFiles(ftpPath);

                string goDaddyPrefix = "http://" + rootFolder + ".ogglebooble.com/";
                string expectedLinkName = goDaddyPrefix + Helpers.GetParentPath(folderId) + dbCategoryFolder.FolderName;

                if (goDaddyLinks.Count() != imageFiles.Count())
                {
                    if (goDaddyLinks.Count() > imageFiles.Count())
                    {
                    }

                    if (imageFiles.Count() > goDaddyLinks.Count())
                    {
                        repairReport.Errors.Add("Extra Links Found in " + ftpPath);
                        foreach (string imageFile in imageFiles)
                        {
                        }
                    }
                }
                int[] subDirs = db.VirtualFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();
                foreach (int subDir in subDirs)
                {
                    repairReport.isSubFolder = true;
                    RepairLinksRecurr(subDir, repairReport, db);
                }
            }
            catch (Exception ex) { repairReport.Success = Helpers.ErrorDetails(ex); }
        }
    }

}