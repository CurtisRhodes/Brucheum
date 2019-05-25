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
using WebApi.Models;
using WebApi.DataContext;

namespace WebApi
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

                List<ImageLink> folderLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.ImageLinks on c.ImageLinkId equals g.Id
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
                            if (db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault() != null)
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
                                ImageLink newLink = new ImageLink()
                                {
                                    Id = linkId,
                                    Link = derivedLink,
                                    ExternalLink = linkId
                                };
                                db.ImageLinks.Add(newLink);
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
