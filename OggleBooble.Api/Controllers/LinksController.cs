using OggleBooble.Api.Models;
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
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
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
                    CategoryImageLink link = db.CategoryImageLinks.Where(l => l.ImageCategoryId == item.PageId && l.ImageLinkId == item.ItemId).FirstOrDefault();
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

        [HttpGet]
        [Route("api/Links/RepairLinks")]
        public RepairReportModel RepairLinks(int folderId, bool recurr)
        {
            RepairReportModel repairReport = new RepairReportModel();
            using (var db = new OggleBoobleMySqlContext())
            {
                CheckFolder(folderId, repairReport, db, recurr);

                int test1 = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                RemoveLinks(repairReport.OrphanLinks);
                int test2 = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).Count();
                repairReport.LinksRemoved = test1 - test2;

                repairReport.Success = "ok";
            }
            
            return repairReport;
        }
        private string CheckFolder(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db, bool recurr)
        {
            string success;
            try
            {
                VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                repairReport.OrphanLinks = new List<string>();
                var categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                // 1. check for physicalFiles with no link
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var lId = physcialFiles[i];

                    if (categoryImageLinks.Where(il => il.ImageLinkId == physcialFiles[i]).FirstOrDefault() == null)
                    {
                        repairReport.MissingFiles.Add(physcialFiles[i]);

                        if (db.ImageFiles.Where(f => f.Id == physcialFiles[i]).FirstOrDefault() == null)
                        {
                            db.ImageFiles.Add(new ImageFile()
                            {
                                Id = lId,
                                FolderId = folderId,
                                FileName = lId

                            });
                        }
                        db.CategoryImageLinks.Add(new CategoryImageLink() { 
                            ImageLinkId = lId, 
                            ImageCategoryId = folderId, 
                            SortOrder = 876 });
                        db.SaveChanges();
                    }
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
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);;
            }
            return success;
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
    public class RemoveLinksController : ApiController
    {

    }
}