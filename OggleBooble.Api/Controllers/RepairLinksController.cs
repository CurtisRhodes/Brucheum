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
        private readonly string tempFolder = ConfigurationManager.AppSettings["tempFolder"];
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

        private string CreateImageFileRecord(int folderId, string linkId, string path, string fileName, OggleBoobleMySqlContext db)
        {
            string success;
            try
            {
                int fWidth = 0; int fHeight = 0; long fSize = 0;
                string imgFileName = tempFolder + "/" + path + "/" + fileName;
                using (var fileStream = new FileStream(imgFileName, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    fSize = fileStream.Length;
                    if (fileStream.Length == 0)
                    {
                        return "zero length file";
                    }
                    using (var image = System.Drawing.Image.FromStream(fileStream, false, false))
                    { fWidth = image.Width; fHeight = image.Height; }
                }

                db.ImageFiles.Add(new ImageFile()
                {
                    Id = linkId,
                    Acquired = DateTime.Today,
                    ExternalLink = "?",
                    FileName = fileName,
                    FolderId = folderId,
                    Height = fHeight,
                    Size = fSize,
                    Width = fWidth
                });
                db.SaveChanges();

                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        
        private void PerformFolderChecks(int folderId, RepairReportModel repairReport, OggleBoobleMySqlContext db, bool recurr)
        {
            try
            { 
                VirtualFolder dbCategoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                string ftpPath = ftpHost + "/" + imgRepo.Substring(8) + "/" + dbCategoryFolder.FolderPath;
                string[] physcialFiles = FtpUtilies.GetFiles(ftpPath);
                if (physcialFiles.Length > 0 && physcialFiles[0].StartsWith("ERROR"))
                {
                    repairReport.Success = physcialFiles[0];
                    return;
                }
                string physcialFileLinkId, createImageFileSuccess;
                var categoryImageLinks = db.CategoryImageLinks.Where(l => l.ImageCategoryId == folderId).ToList();
                // 1 loop through physcial files
                for (int i = 0; i < physcialFiles.Length; i++)
                {
                    physcialFileLinkId = physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36);
                    // 1. check if there is an ImageLink record for every file in the directory
                    var dbImageFilesInFolder = db.ImageFiles.Where(f => f.Id == physcialFileLinkId).FirstOrDefault();
                    if (dbImageFilesInFolder == null)
                    {
                        var dbImageFileInAnyFolder = db.ImageFiles.Where(a => a.Id == physcialFileLinkId).FirstOrDefault();
                        if (dbImageFileInAnyFolder == null)
                        {
                            createImageFileSuccess = CreateImageFileRecord(folderId, physcialFileLinkId, dbCategoryFolder.FolderPath, physcialFiles[i], db);
                            if (createImageFileSuccess == "ok")
                                repairReport.ImageFilesAdded++;
                            else
                            {
                                if (createImageFileSuccess == "zero length file")
                                {
                                    var badCatlink = db.CategoryImageLinks.Where(l => l.ImageLinkId == physcialFileLinkId && l.ImageCategoryId == folderId).FirstOrDefault();
                                    if (badCatlink != null)
                                    {
                                        db.CategoryImageLinks.Remove(badCatlink);
                                        db.SaveChanges();
                                        repairReport.CatLinksRemoved++;
                                    }
                                    repairReport.ZeroLenFileRemoved++;
                                }
                                else
                                    repairReport.Errors.Add("unable to go local: " + physcialFiles[i]);
                            }
                        }
                        else {
                            if (dbImageFileInAnyFolder.FolderId != folderId)
                            {
                                dbImageFileInAnyFolder.FolderId = folderId;
                                db.SaveChanges();
                                repairReport.ImageFilesMoved++;
                            }
                            else
                                repairReport.Errors.Add("file not found: " + physcialFiles[i]);
                        }
                    }
                    // 2. check if there is a CategoryImageLinks record for every file in the directory
                    if (categoryImageLinks.Where(l => l.ImageLinkId == physcialFileLinkId && l.ImageCategoryId == folderId).FirstOrDefault() == null)
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = physcialFileLinkId, SortOrder = 8162 });
                        db.SaveChanges();
                        repairReport.CatLinksAdded++;
                    }
                    repairReport.PhyscialFilesProcessed++;
                }
                // 2 loop through database records
                var imageFiles = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();
                var physcialFileLinkIds = new List<string>();
                for (int i = 0; i < physcialFiles.Length; i++) { physcialFileLinkIds.Add(physcialFiles[i].Substring(physcialFiles[i].IndexOf("_") + 1, 36)); }
                // check if there is a physcial file in the folder for every imageFile row with FolderId in the table.
                foreach (ImageFile imageFileRec in imageFiles)
                {
                    if (!physcialFileLinkIds.Contains(imageFileRec.Id))
                    { // extra imagelink file?
                        repairReport.Errors.Add("Orphan ImageFile row: " + imageFileRec.Id);
                    }
                    repairReport.LinkRecordsProcessed++;
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
            }
        }
    }
    //Warning The following assembly has dependencies on a version of the.NET Framework that is higher than the target and might not load correctly 
    //during runtime causing a failure: 
    //System.Net.Http.Formatting, Version = 5.2.7.0, Culture = neutral, PublicKeyToken = 31bf3856ad364e35.
    //The dependencies are: System.Net.Http, Version = 4.0.0.0, Culture = neutral, PublicKeyToken = b03f5f7f11d50a3a.
    //You should either ensure that the dependent assembly is correct for the target framework,
    //or ensure that the target framework you are addressing is that of the dependent assembly.OggleBooble.Api ASPNETCOMPILER  0
}