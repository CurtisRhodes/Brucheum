using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class RepairLinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string imgRepo = ConfigurationManager.AppSettings["ImageRepository"];
        private readonly string repoDomain = ConfigurationManager.AppSettings["ImageRepository"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        static readonly NetworkCredential networkCredentials = new NetworkCredential(ftpUserName, ftpPassword);

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
                        try
                        {

                            int fWidth = 0; int fHeight = 0; long fSize = 0;
                            //if()

                            string imgFileName = "/"+imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath + "/" + physcialFileName;
                            using (var fileStream = new FileStream(imgFileName, FileMode.Open, FileAccess.Read, FileShare.Read))
                            {
                                fSize = fileStream.Length;
                                using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                                {
                                    fWidth = image.Width;
                                    fHeight = image.Height;
                                }
                            }

                            db.ImageFiles.Add(new ImageFile()
                            {
                                Id = physcialFileLinkId,
                                Acquired = DateTime.Today,
                                ExternalLink = "?",
                                FileName = physcialFileName,
                                FolderId = folderId,
                                Height = fHeight,
                                Size = fSize,
                                Width = fWidth
                            });
                            db.SaveChanges();
                        }
                        catch (Exception ex)
                        {
                            repairReport.Errors.Add(Helpers.ErrorDetails(ex));

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
                    }
                    //                    else
                    {
                        // 2. check for physicalFiles with no link
                        if (categoryImageLinks.Where(il => il.ImageLinkId == physcialFileLinkId && il.ImageCategoryId == folderId).FirstOrDefault() == null)
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
                            var dbImageFile = db.ImageFiles.Where(i => i.Id == folderLink.ImageLinkId).FirstOrDefault();
                            if (dbImageFile == null)
                            {
                                db.CategoryImageLinks.Remove(folderLink);
                                db.SaveChanges();
                                repairReport.LinksRemoved++;
                            }
                            else
                            {
                                if (dbImageFile.FolderId != folderId)
                                {
                                    dbImageFile.FolderId = folderId;
                                    //db.SaveChanges();
                                    //repairReport.ImageFileAdded++;

                                }
                            }

                            // we have a valid link
                        }
                        else
                        {
                            var dbAllImageLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == folderLink.ImageLinkId).ToList();
                            if (dbAllImageLinks.Count() == 1)
                            {
                                repairReport.OrphanCatLinkRecs.Add(folderLink.ImageLinkId);
                                db.CategoryImageLinks.Remove(folderLink);
                                db.SaveChanges();
                                repairReport.LinksRemoved++;
                            }
                            else
                            {
                                repairReport.BadFileNames++;

                            }
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
                        //var dbImageFile = db.ImageFiles.Where(i => i.Id == existingImageFile.Id).FirstOrDefault();
                        //if ((dbImageFile == null) || (dbImageFile.FolderId == folderId))
                        {
                            repairReport.OrphanImageFileRecs.Add(existingImageFile.Id);
                            db.ImageFiles.Remove(existingImageFile);

                            var dbBadLinks = db.CategoryImageLinks.Where(l => l.ImageLinkId == existingImageFile.Id).ToList();
                            db.CategoryImageLinks.RemoveRange(dbBadLinks);

                            db.SaveChanges();
                            repairReport.DirNotFound++;
                            repairReport.LinksRemoved += dbBadLinks.Count();
                        }
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
    }
}