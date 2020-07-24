using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RepairLinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];

        [HttpGet]
        [Route("api/RepairLinks/Repair")]
        public RepairReportModel RepairLinks(int folderId, bool recurr)
        {
            RepairReportModel repairReport = new RepairReportModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    PerformFolderChecks(folderId, repairReport, db, recurr);
                }
            }
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }

        private void PerformFolderChecks(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db, bool recurr)
        {
            try
            {
                VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                var categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                // loop 1 
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    var physcialFileName = physcialFiles[i];
                    var physcialFileLinkId = physcialFileName.Substring(physcialFileName.IndexOf("_") + 1, 36);

                    // 1. check for physicalFiles with ImageFile row
                    if (db.ImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault() == null)
                    {
                        repairReport.MissingFiles.Add(physcialFileLinkId);

                        db.EventLogs.Add(new EventLog()
                        {
                            EventCode = "MIg",
                            EventDetail = physcialFileLinkId,
                            PageId = folderId,
                            VisitorId = "admin",
                            Occured = DateTime.Now
                        });
                        db.SaveChanges();




                    }
                    else
                    {
                        // 2. check for physicalFiles with no link
                        if (categoryImageLinks.Where(il => il.ImageLinkId == physcialFileLinkId).FirstOrDefault() == null)
                        {
                            db.CategoryImageLinks.Add(new MySqlDataContext.CategoryImageLink()
                            {
                                ImageCategoryId = folderId,
                                ImageLinkId = physcialFileLinkId,
                                SortOrder = 1313
                            });
                            repairReport.MissingLinks.Add(physcialFileLinkId);
                            db.EventLogs.Add(new EventLog()
                            {
                                EventCode = "MIL",
                                EventDetail = physcialFileLinkId,
                                PageId = folderId,
                                VisitorId = "admin",
                                Occured = DateTime.Now
                            });
                            db.SaveChanges();
                            repairReport.CatLinksAdded++;
                        }
                    }
                    repairReport.PhyscialFilesProcessed++;
                }

                // loop 2 
                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36));
                }
                var folderLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();

                // check if there is a physcial file in the folder for every link in the table.
                // there can be more links than files. That's the point.
                foreach (CategoryImageLink folderLink in folderLinks)
                {
                    if (!physcialFileLinkIds.Contains(folderLink.ImageLinkId))
                    {
                        var nonLocallink = db.ImageFiles.Where(i => i.Id == folderLink.ImageLinkId).FirstOrDefault();
                        if (nonLocallink != null)
                        {
                            // we have a valid link
                        }
                        else
                        {
                            repairReport.OrphanCatLinkRecs.Add(folderLink.ImageLinkId);
                            db.CategoryImageLinks.Remove(folderLink);
                            db.SaveChanges();
                            repairReport.LinksRemoved++;
                        }
                    }
                    repairReport.LinkRecordsProcessed++;
                }

                // loop 3
                var existingImageFiles = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();
                foreach (ImageFile existingImageFile in existingImageFiles)
                {
                    // check if there is a physcial file in the folder for every ImageFile with a FolderId equaling the folderId.
                    if (!physcialFileLinkIds.Contains(existingImageFile.Id))
                    {
                        // I'd have to scann ever physical folder's links prove there is no file for this file link.
                        repairReport.OrphanImageFileRecs.Add(existingImageFile.Id);
                        //db.ImageFiles.Remove(existingImageFile);
                        //db.SaveChanges();
                        repairReport.DirNotFound++;
                    }
                    repairReport.ImageFilesProcessed++;
                }
                if (recurr)
                {
                    var childFolders = db.VirtualFolders.Where(c => c.Parent == folderId).ToList();
                    foreach (VirtualFolder childFolder in childFolders)
                    {
                        PerformFolderChecks(childFolder.Id, repairReport, db, recurr);
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