using OggleBooble.Api.Models;
using OggleBooble.Api.MsSqlDataContext;
//using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
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
        [Route("api/Links/RepairLinks")]
        public RepairReportModel RepairLinks(int folderId)
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
                    imageFileLinkIds.Add(imageFile.Substring(imageFile.IndexOf("_") - 1));
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











            return repairReport;

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
    }
}