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
                IEnumerable<DirTree> vwDirTrees = new List<DirTree>();
                //var vwDirTrees;
                using (var db = new OggleBoobleMySqlContext())
                {
                    // wow did this speed things up
                    vwDirTrees = db.DirTrees.ToList().OrderBy(v => v.Id);
                }

                var vRootNode = vwDirTrees.Where(v => v.Id == root).First();
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
        private void GetDirTreeChildNodes(DirTreeSuccessModel dirTreeModel, DirTreeModelNode parentNode, IEnumerable<DirTree> vwDirTree, string dPath)
        {
            var vwDirTreeNodes = vwDirTree.Where(v => v.Parent == parentNode.vwDirTree.Id).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();
            foreach (DirTree vNode in vwDirTreeNodes)
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
            using (var db = new OggleBoobleMySqlContext())
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

                List<ImageFile> goDaddyLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageFiles on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     //&& g.Link.Contains(dbCategoryFolder.FolderName)
                     && g.FolderId == dbCategoryFolder.Id
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
                foreach (ImageFile imageLink in goDaddyLinks)
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
                using (var db = new OggleBoobleMySqlContext())
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
        private void RepairLinksRecurr(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db)
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