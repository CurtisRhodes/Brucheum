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
using WebApi.Ftp;
using System.Configuration;

namespace WebApi
{
    [EnableCors("*", "*", "*")]
    public class RepairLinksController : ApiController
    {
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        static readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        static readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];

        [HttpGet]
        public RepairReportModel RepairLinks(int startFolderId, string drive)
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
            catch (Exception ex)
            {
                repairReport.Success = Helpers.ErrorDetails(ex);
            }
            return repairReport;
        }


        private string EnsureCorrectFileName(string suspectFileName, string folderName, string ftpPath)
        {
            string correctFileName = "";
            string ext = suspectFileName.Substring(suspectFileName.Length - 4);
            if (!ext.StartsWith("."))
                correctFileName = "Unexpected extension";
            else
            {
                if ((suspectFileName.LastIndexOf("_") > 0) && (suspectFileName.Substring(suspectFileName.LastIndexOf("_")).Length > 40))
                {
                    correctFileName = suspectFileName;
                }
                else
                {
                    correctFileName = folderName + Guid.NewGuid().ToString() + ext;



                    FtpUtilies.MoveFile(ftpPath + suspectFileName, ftpPath + correctFileName);
                }
            }

            return correctFileName;
        }




        private void RepairLinksRecurr(int folderId, RepairReportModel repairReport, OggleBoobleContext db)
        {
            CategoryFolder dbCategoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
            string ftpPath = ftpHost + "/" + dbCategoryFolder.RootFolder + ".ogglebooble.com/"
                + Helpers.GetFtpParentPathWithoutRoot(folderId) + dbCategoryFolder.FolderName;

            if (!FtpUtilies.DirectoryExists(ftpPath))
            {
                repairReport.DirNotFound++;
                FtpUtilies.CreateDirectory(ftpPath);
                repairReport.Errors.Add("created directory " + ftpPath);
            }
            int folderRowsProcessed = 0;




            if (repairReport.isSubFolder)
                SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
            else
                SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);

            List<ImageLink> goDaddyLinks =
                (from c in db.CategoryImageLinks
                 join g in db.ImageLinks on c.ImageLinkId equals g.Id
                 where c.ImageCategoryId == folderId
                 select (g)).ToList();

            string[] files = FtpUtilies.GetFiles(ftpPath);
            if (files.Length == 0)
                repairReport.Errors.Add(ftpPath + " no files");
            else
            {
                if (files[0].StartsWith("ERROR"))
                {
                    repairReport.Errors.Add("FtpUtilies.GetFiles(" + ftpPath + ") " + files[0]);
                }
                else
                {

                    string goDaddyPrefix = "http://" + dbCategoryFolder.RootFolder + ".ogglebooble.com/";
                    string expectedLinkName = goDaddyPrefix + Helpers.GetFtpParentPathWithoutRoot(folderId) + dbCategoryFolder.FolderName;


                    string expectedFileName = "";
                    string linkId = "";
                    string ext = "";
                    bool fileNameInExpectedForm;
                    bool anyChangesMade = false;

                    foreach (string fileName in files)
                    {



                        //EnsureCorrectFileName(fileName, ftpPath);


                        if ((fileName.LastIndexOf("_") > 0) && (fileName.Substring(fileName.LastIndexOf("_")).Length > 40))
                        {
                            fileNameInExpectedForm = true;
                            if (fileName.IndexOf(".") > 0)
                            {
                                ext = fileName.Substring(fileName.Length - 4);
                                linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                                expectedFileName = dbCategoryFolder.FolderName + "_" + linkId + ext;
                                if (fileName == expectedFileName)
                                {
                                    var folderNameWhereImageSayItShouldBe = fileName.Substring(0, fileName.IndexOf("_"));
                                    if (folderNameWhereImageSayItShouldBe != dbCategoryFolder.FolderName)
                                    {
                                        CategoryFolder categoryFolderWhereImageSayItShouldBe = db.CategoryFolders.Where(f => f.FolderName == folderNameWhereImageSayItShouldBe).FirstOrDefault();
                                        if (categoryFolderWhereImageSayItShouldBe != null)
                                        {
                                            string ftpPathWhereImageSayItShouldBe = ftpHost + categoryFolderWhereImageSayItShouldBe.RootFolder + ".ogglebooble.com/"
                                                + Helpers.GetFtpParentPathWithoutRoot(categoryFolderWhereImageSayItShouldBe.Id) + categoryFolderWhereImageSayItShouldBe.FolderName;
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
                                                + Helpers.GetFtpParentPathWithoutRoot(categoryFolderWhereImageSayItShouldBe.Id) + categoryFolderWhereImageSayItShouldBe.FolderName;
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

                                    if (db.ImageLinks.Where(g => g.Id == linkId).FirstOrDefault() == null)
                                    {
                                        // no godaddyLink found // add row
                                        ImageLink newLink = new ImageLink() { Id = linkId, Link = expectedLinkName + "/" + expectedFileName, ExternalLink = "unknown" + linkId, FolderLocation = folderId };
                                        db.ImageLinks.Add(newLink);
                                        db.SaveChanges();
                                        repairReport.NewLinksAdded++;
                                        anyChangesMade = true;
                                    }
                                    if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).Where(c => c.ImageLinkId == linkId).Where(c => c.ImageCategoryId == folderId).FirstOrDefault() == null)
                                    {
                                        CategoryImageLink newCatLink = new CategoryImageLink() { ImageCategoryId = folderId, ImageLinkId = linkId };
                                        db.CategoryImageLinks.Add(newCatLink);
                                        db.SaveChanges();
                                        repairReport.CatLinksAdded++;
                                        anyChangesMade = true;
                                    }
                                }
                                else
                                    fileNameInExpectedForm = false;
                            }
                            else
                                repairReport.Errors.Add("extension problem");
                        }
                        else
                            fileNameInExpectedForm = false;

                        if (!fileNameInExpectedForm)
                        {
                            // rename file
                            string renameSuccess = FtpUtilies.MoveFile(ftpPath + "/" + fileName, ftpPath + "/" + expectedFileName);
                            if (renameSuccess == "ok")
                            {
                                repairReport.ImagesRenamed++;
                                ImageLink oldImageLink = goDaddyLinks.Where(g => g.Link == expectedLinkName + "/" + expectedFileName).FirstOrDefault();
                                if (oldImageLink != null)
                                {
                                    if (oldImageLink.Link != expectedLinkName + "/" + expectedFileName)
                                    {
                                        // update godaddy link
                                        oldImageLink.Link = expectedLinkName + "/" + expectedFileName;
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
                                        if (goDaddyLink.Link != expectedLinkName + "/" + expectedFileName)
                                        {
                                            goDaddyLink.Link = expectedLinkName + "/" + expectedFileName;
                                            db.SaveChanges();
                                            repairReport.LinksEdited++;
                                        }
                                    }
                                    else
                                    {
                                        var newImageLink = new ImageLink()
                                        {
                                            Id = linkId,
                                            Link = expectedLinkName + "/" + expectedFileName,
                                            ExternalLink = linkId
                                        };
                                        db.ImageLinks.Add(newImageLink);
                                        db.SaveChanges();
                                        repairReport.NewLinksAdded++;
                                        anyChangesMade = true;
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
                                        anyChangesMade = true;
                                    }
                                }
                            }
                            else
                            {
                                repairReport.Errors.Add("rename Failed: " + renameSuccess);
                            }
                        }

                        repairReport.RowsProcessed++;
                        folderRowsProcessed++;
                        if (repairReport.isSubFolder)
                            SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                        else
                            SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
                    }

                    if (anyChangesMade)
                    {
                        goDaddyLinks =
                            (from c in db.CategoryImageLinks
                             join g in db.ImageLinks on c.ImageLinkId equals g.Id
                             where c.ImageCategoryId == folderId
                             select (g)).ToList();
                    }
                    if (goDaddyLinks.Count() != files.Count())
                    {
                        if (goDaddyLinks.Count() > files.Count())
                        {
                            foreach (ImageLink goDaddyLink in goDaddyLinks)
                            {
                                bool found = false;
                                if (goDaddyLink.Link.Length < 4)
                                    repairReport.Errors.Add("file name problem");
                                else
                                {
                                    expectedFileName = dbCategoryFolder.FolderName + "_" + goDaddyLink.Id + goDaddyLink.Link.Substring(goDaddyLink.Link.Length - 4);
                                    for (int i = 0; i < files.Count(); i++)
                                    {
                                        if (files[i].Contains(expectedFileName))
                                        {
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (!found)
                                    {
                                        //var missingLinkExternalFile
                                        List<CategoryImageLink> links = db.CategoryImageLinks.Where(l => l.ImageLinkId == goDaddyLink.Id).ToList();
                                        if (links.Count == 0)
                                        {
                                            db.ImageLinks.Remove(goDaddyLink);
                                            db.SaveChanges();
                                            repairReport.LinksRemoved++;
                                        }
                                        else
                                        {
                                            // download image?
                                            string downLoadSuccess = DownLoadImage(ftpPath, goDaddyLink.ExternalLink, expectedFileName);
                                            if (downLoadSuccess == "ok")
                                                repairReport.ImagesDownLoaded++;
                                            else
                                            {
                                                repairReport.Errors.Add(goDaddyLink.Id + " " + goDaddyLink.Link.Substring(goDaddyLink.Link.LastIndexOf("/") + 1) + " " + downLoadSuccess);
                                                db.ImageLinks.Remove(goDaddyLink);
                                                db.SaveChanges();
                                                repairReport.LinksRemoved++;
                                            }
                                        }
                                    }
                                }
                                repairReport.RowsProcessed++;
                                folderRowsProcessed++;
                                if (repairReport.isSubFolder)
                                    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed + "  Total: " + repairReport.RowsProcessed);
                                else
                                    SignalRHost.ProgressHub.PostToClient("Processing: " + dbCategoryFolder.FolderName + "  Rows: " + folderRowsProcessed);
                            }
                        }

                        if (files.Count() > goDaddyLinks.Count())
                        {
                            repairReport.Errors.Add("Extra Links Found in " + ftpPath);
                        }
                    }

                    int[] subDirs = db.CategoryFolders.Where(f => f.Parent == folderId).Select(f => f.Id).ToArray();

                    foreach (int subDir in subDirs)
                    {
                        repairReport.isSubFolder = true;
                        RepairLinksRecurr(subDir, repairReport, db);
                    }

                }
            }
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
