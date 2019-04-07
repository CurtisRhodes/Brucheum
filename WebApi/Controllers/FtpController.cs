using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi;
using WebApi.Directory.Models;
using WebApi.OggleBooble.DataContext;
using static System.Net.WebRequestMethods;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class FtpImagePageController : ApiController
    {
        // image page
        [HttpPut]
        public string MoveImage(MoveImageModel model)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string imageName = model.ImageName.Substring(model.ImageName.LastIndexOf("/") + 1).Replace("%20", " ");
                    string linkId = model.ImageName.Substring(model.ImageName.LastIndexOf("_") + 1, 36);
                    CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == model.SourceFolderId).FirstOrDefault();
                    CategoryFolder dbDestinationFolder = db.CategoryFolders.Where(f => f.Id == model.DestinationFolderId).FirstOrDefault();

                    string extension = model.ImageName.Substring(model.ImageName.LastIndexOf("."));
                    string newImageName = dbDestinationFolder.FolderName + "_" + linkId + extension;

                    // ftp move file !!!!
                    string source = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/"
                        + Helpers.GetParentPath(model.SourceFolderId, true) + dbSourceFolder.FolderName + "/" + imageName;
                    string destinationFtpPath = "ftp://50.62.160.105/" + dbDestinationFolder.RootFolder + ".ogglebooble.com/"
                        + Helpers.GetParentPath(model.DestinationFolderId, true) + dbDestinationFolder.FolderName;
                    if (!FtpIO.DirectoryExists(destinationFtpPath))
                        FtpIO.CreateDirectory(destinationFtpPath);
                    success = FtpIO.MoveFile(source, destinationFtpPath + "/" + newImageName);
                    if (success == "ok")
                    {
#if DEBUG
                        // move file on local drive 
                        string localServerPath = "F:/Danni/";
                        string localSourcePath = localServerPath + Helpers.GetParentPath(model.SourceFolderId, false) + "/" + dbSourceFolder.FolderName;
                        DirectoryInfo dirInfo = new DirectoryInfo(localSourcePath);
                        FileInfo fileInfo = dirInfo.GetFiles(imageName).FirstOrDefault();
                        if (fileInfo == null)
                            success = "unable to find file";
                        else
                        {
                            string localDestinationPath = localServerPath + Helpers.GetParentPath(model.DestinationFolderId, false) + "/" + dbDestinationFolder.FolderName;
                            fileInfo.MoveTo(localDestinationPath + "/" + dbDestinationFolder.FolderName + "_" + linkId + fileInfo.Extension);
                        }
#endif
                        //2. update GoDaddyLink 
                        string linkPrefix = "http://" + dbDestinationFolder.RootFolder + ".ogglebooble.com/";
                        string goDaddyLink = linkPrefix + Helpers.GetParentPath(model.DestinationFolderId, true) +
                            dbDestinationFolder.FolderName + "/" + dbDestinationFolder.FolderName + "_" + linkId + extension;
                        GoDaddyLink goDaddyrow = db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault();
                        goDaddyrow.Link = goDaddyLink;
                        db.SaveChanges();

                        // no need update existing link
                        //3 create new link for new location if necessary
                        if (db.CategoryImageLinks.Where(c => c.ImageCategoryId == model.DestinationFolderId).Where(c => c.ImageLinkId == linkId).FirstOrDefault() == null)
                        {
                            CategoryImageLink newCatImageLink = new CategoryImageLink() { ImageCategoryId = model.DestinationFolderId, ImageLinkId = linkId };
                            db.CategoryImageLinks.Add(newCatImageLink);
                            db.SaveChanges();
                        }
                        success = "ok";
                    }
                }
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }
    }

    [EnableCors("*", "*", "*")]
    public class FtpDashBoardController : ApiController
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
                    string folderPath = Helpers.GetParentPath(startFolderId, false);
                    RepairLinksRecurr(startFolderId, folderPath, repairReport, db);
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
        public void RepairLinksRecurr(int folderId, string folderPath, RepairReportModel repairReport, OggleBoobleContext db)
        {
            CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
            folderPath += "/" + categoryFolder.FolderName;
            string ftpPath = "ftp://50.62.160.105/" + categoryFolder.RootFolder + ".ogglebooble.com/"
                + Helpers.GetParentPath(folderId, true) + categoryFolder.FolderName;

            if (FtpIO.DirectoryExists(ftpPath))
            {
                //FileInfo[] fileInfos = dirInfo.GetFiles();

                List<GoDaddyLink> folderLinks =
                    (from c in db.CategoryImageLinks
                     join g in db.GoDaddyLinks on c.ImageLinkId equals g.Id
                     where c.ImageCategoryId == folderId
                     select (g)).ToList();

                string linkId = "";
                string derivedLink = "";
                string expectedFileName = "";

                string[] files = FtpIO.GetFiles(ftpPath);
                for (int i = 0; i < files.Count(); i++)
                {
                    if ((files[i].LastIndexOf("_") > 0) && (files[i].Substring(files[i].LastIndexOf("_")).Length > 40))
                    {
                        repairReport.BadFileNames++;
                        repairReport.Errors.Add("file name " + files[i]);
                    }
                    else
                    {
                        linkId = files[i].Substring(files[i].LastIndexOf("_") + 1, 36);
                        if (folderLinks.Where(g => g.Id == linkId).FirstOrDefault() == null)
                        {
                            if (db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault() != null)
                            {
                                // exists but not in this folder
                            }
                            else
                            {
                                string extension = files[i].Substring(files[i].Length - 4);
                                expectedFileName = categoryFolder.FolderName + "_" + linkId + extension;
                                string goDaddyPrefix = "http://" + categoryFolder.RootFolder + ".ogglebooble.com/";
                                derivedLink = Path.Combine(goDaddyPrefix, folderPath, expectedFileName);

                                if (files[i] != expectedFileName)
                                {
                                    FtpIO.MoveFile(folderPath + "/" + files[i], folderPath + "/" + expectedFileName);
                                    repairReport.ImagesRenamed++;
                                }
                                GoDaddyLink newLink = new GoDaddyLink()
                                {
                                    Id = linkId,
                                    Link = derivedLink,
                                    ExternalLink = linkId
                                };
                                db.GoDaddyLinks.Add(newLink);
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

                foreach (GoDaddyLink goDaddyLink in folderLinks)
                {
                    bool found = false;
                    expectedFileName = categoryFolder.FolderName + "_" + goDaddyLink.Id;
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
                        if (goDaddyLink.Link.Contains(categoryFolder.FolderName))
                        {
                            repairReport.BadLinks++;
                            repairReport.Errors.Add("missing link: " + goDaddyLink.Id);
                        }
                    }
                }





                //if (folderLinks.Where(g => g.Link.Contains(fileInfo.Name)).FirstOrDefault() == null)
                //List<CategoryImageLink> categoryImageLinks = db.CategoryImageLinks.Where(c => c.ImageCategoryId == folderId).ToList();
                //foreach (CategoryImageLink categoryImageLink in categoryImageLinks)
                //{
                //    //expectedFileName = goDaddyPrefix + "/" + categoryFolder.FolderName + "/" + categoryFolder.FolderName + "_" + categoryImageLink.ImageLinkId;
                //    expectedFileName = categoryFolder.FolderName + "_" + categoryImageLink.ImageLinkId;
                //    FileInfo coorespondingImageFile = fileInfos.Where(f => f.Name.Contains(expectedFileName)).FirstOrDefault();
                //    if (coorespondingImageFile == null)
                //    {
                //        repairReport.BadLinks.Add(db.GoDaddyLinks.Where(g => g.Id == categoryImageLink.ImageLinkId).FirstOrDefault());
                //        repairReport.ImagesRenamed++;
                //    }
                //}
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

        [HttpPost]
        public string AddImageLink(AddLinkModel newLink)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    string imageLinkId = Guid.NewGuid().ToString();
                    var existingLink = db.GoDaddyLinks.Where(l => l.ExternalLink == newLink.Link).FirstOrDefault();
                    if (existingLink != null)
                        imageLinkId = existingLink.Id;
                    else
                    {
                        CategoryFolder dbCategory = db.CategoryFolders.Where(f => f.Id == newLink.FolderId).First();
                        string extension = newLink.Link.Substring(newLink.Link.Length - 4);
                        string newFileName = dbCategory.FolderName + "_" + imageLinkId + extension;
                        //string pleskPath = "G:/PleskVhosts//curtisrhodes.com/" + dbCategory.RootFolder + ".ogglebooble.com/";
                        var trimPath = newLink.Path.Substring(newLink.Path.IndexOf("/") + 1);
                        var appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");
                        using (WebClient wc = new WebClient())
                        {
#if DEBUG
                            string danniPath = "F:/Danni/";
                            DirectoryInfo dirInfo = new DirectoryInfo(danniPath + newLink.Path);
                            if (!dirInfo.Exists)
                                dirInfo.Create();
                            wc.DownloadFile(new Uri(newLink.Link), danniPath + newLink.Path + "/" + newFileName);
#endif
                            try
                            {
                                wc.DownloadFile(new Uri(newLink.Link), appDataPath + "tempImage" + extension);
                            }
                            catch (Exception ex)
                            {
                                return "wc. download didnt work " + ex.Message;
                            }
                        }

                        FtpWebRequest webRequest = null;
                        try
                        {
                            // todo  write the image as a file to x.ogglebooble  4/1/19
                            string ftpPath = "ftp://50.62.160.105/" + dbCategory.RootFolder + ".OGGLEBOOBLE.COM/" + trimPath;
                            if (!FtpIO.DirectoryExists(ftpPath))
                                FtpIO.CreateDirectory(ftpPath);

                            webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + newFileName);
                            webRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
                            webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                        }
                        catch (Exception ex)
                        {
                            return " webRequest didnt work " + ex.Message;
                        }


                        try
                        {
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
                            return "GetRequestStream didn't work " + ex.Message;
                        }

                        try
                        {
                            DirectoryInfo directory = new DirectoryInfo(appDataPath);
                            FileInfo tempFile = directory.GetFiles("tempImage" + extension).FirstOrDefault();
                            if (tempFile != null)
                                tempFile.Delete();
                            System.Diagnostics.Debug.WriteLine("delete worked ");
                        }
                        catch (Exception ex)
                        {
                            System.Diagnostics.Debug.WriteLine("delete didn't work " + ex.Message);
                            //success += "delete didn't work " + ex.Message + " ";
                        }

                        var goDaddyLink = "http://" + dbCategory.RootFolder + ".ogglebooble.com/";
                        var goDaddyLinkTest = goDaddyLink + trimPath + "/" + newFileName;
                        db.GoDaddyLinks.Add(new GoDaddyLink()
                        {
                            Id = imageLinkId,
                            ExternalLink = newLink.Link,
                            Link = goDaddyLink + trimPath + "/" + newFileName
                        });
                        db.SaveChanges();
                    }
                    try
                    {
                        db.CategoryImageLinks.Add(new CategoryImageLink()
                        {
                            ImageCategoryId = newLink.FolderId,
                            ImageLinkId = imageLinkId
                        });
                        db.SaveChanges();
                        success += "ok";
                    }
                    catch (Exception)
                    {
                        success = "Alredy Added";
                    }
                }
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex) + " try 5";
            }
            return success;
        }

        [HttpPut]
        public string RenameFolder(int folderId, int kludge, string newFolderName)
        {
            string success = "";
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
                    string ftpPath = "ftp://50.62.160.105/" + categoryFolder.RootFolder + ".ogglebooble.com/"
                        + Helpers.GetParentPath(folderId, true) + categoryFolder.FolderName;

                    // first rename files
                    string linkId = "";
                    string newFileName = "";
                    string[] folderContents = FtpIO.GetFiles(ftpPath);
                    foreach (string currentFile in folderContents)
                    {

                        linkId = currentFile.Substring(currentFile.LastIndexOf("_") + 1, 36);
                        newFileName = newFolderName + "_" + currentFile.Substring(currentFile.LastIndexOf("_") + 1);
                        //FtpIO.Rename(Path.Combine(ftpPath, currentFile), Path.Combine(ftpPath, newFileName));
                        FtpIO.Rename(Path.Combine(ftpPath, currentFile), newFileName);

                        string linkPrefix = "http://" + categoryFolder.RootFolder + ".ogglebooble.com/";
                        string goDaddyLink = Path.Combine(linkPrefix, Helpers.GetParentPath(folderId, true), newFolderName, newFileName);
                        GoDaddyLink goDaddyrow = db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault();
                        goDaddyrow.Link = goDaddyLink;
                        db.SaveChanges();
                    }
                                                         
                    FtpIO.Rename(ftpPath, newFolderName);

                    categoryFolder.FolderName = newFolderName;
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

        [HttpPut]
        public string MoveFolder(int orignFolderId, int destinationParentId)
        {
            string success = "";
            try
            {
                MoveFolderRecurr(orignFolderId, destinationParentId, "");
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
        private void MoveFolderRecurr(int orignFolderId, int destinationParentId, string destinationPath)
        {
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                CategoryFolder dbSourceFolder = db.CategoryFolders.Where(f => f.Id == orignFolderId).FirstOrDefault();
                CategoryFolder dbDestinationParentFolder = db.CategoryFolders.Where(f => f.Id == destinationParentId).FirstOrDefault();
                destinationPath += dbDestinationParentFolder.FolderName + "/";
                string sourceFtpPath = "ftp://50.62.160.105/" + dbSourceFolder.RootFolder + ".ogglebooble.com/"
                    + Helpers.GetParentPath(orignFolderId, true) + dbSourceFolder.FolderName;
                string destinationFtpPath = "ftp://50.62.160.105/" + dbDestinationParentFolder.RootFolder + ".ogglebooble.com/"
                    + Helpers.GetParentPath(destinationParentId, true) + destinationPath + dbSourceFolder.FolderName;

                FtpIO.CreateDirectory(destinationFtpPath);

                string linkId = "";
                string[] folderContents = FtpIO.GetFiles(sourceFtpPath);
                foreach (string currentFile in folderContents)
                {
                    linkId = currentFile.Substring(currentFile.LastIndexOf("_") + 1, 36);
                    FtpIO.MoveFile(Path.Combine(sourceFtpPath, currentFile), Path.Combine(destinationFtpPath, currentFile));

                    string linkPrefix = "http://" + dbDestinationParentFolder.RootFolder + ".ogglebooble.com/";
                    string goDaddyLink = Path.Combine(linkPrefix, Helpers.GetParentPath(destinationParentId, true), destinationPath,
                        dbSourceFolder.FolderName, dbSourceFolder.FolderName + "_" + linkId + currentFile.Substring(currentFile.Length - 4));
                    GoDaddyLink goDaddyrow = db.GoDaddyLinks.Where(g => g.Id == linkId).FirstOrDefault();
                    goDaddyrow.Link = goDaddyLink;
                    db.SaveChanges();
                }
                dbSourceFolder.Parent = dbDestinationParentFolder.Id;
                db.SaveChanges();

                int[] subdirs = db.CategoryFolders.Where(f => f.Parent == orignFolderId).Select(f => f.Id).ToArray();
                foreach (int subdir in subdirs)
                {
                    MoveFolderRecurr(subdir, orignFolderId, destinationPath);
                }

                FtpIO.RemoveDirectory(sourceFtpPath);
            }
        }
    }

    public class FtpIO
    {
        static readonly NetworkCredential networkCredentials = new NetworkCredential("curtisrhodes", "R@quel77");

        public static string[] GetDirectories(string ftpPath)
        {
            IList<string> dirs = new List<string>();
            try
            {
                FtpWebRequest ftpRequest = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                ftpRequest.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
                ftpRequest.Method = Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)ftpRequest.GetResponse();
                StreamReader streamReader = new StreamReader(response.GetResponseStream());

                string line = streamReader.ReadLine();
                while (!string.IsNullOrEmpty(line))
                {
                    dirs.Add(line);
                    line = streamReader.ReadLine();
                }
                streamReader.Close();
            }
            catch (Exception ex)
            {
                dirs.Add(Helpers.ErrorDetails(ex));
            }
            return dirs.ToArray();
        }

        private void GetDirectoryDetails(string ftpPath)
        {
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
            request.Credentials = new NetworkCredential("curtisrhodes", "R@quel77");
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            StreamReader reader = new StreamReader(request.GetResponse().GetResponseStream());

            string pattern = @"^(\d+-\d+-\d+\s+\d+:\d+(?:AM|PM))\s+(<DIR>|\d+)\s+(.+)$";
            Regex regex = new Regex(pattern);
            IFormatProvider culture = System.Globalization.CultureInfo.GetCultureInfo("en-us");
            while (!reader.EndOfStream)
            {
                string line = reader.ReadLine();
                Match match = regex.Match(line);
                DateTime modified =
                   DateTime.ParseExact(
                       match.Groups[1].Value, "MM-dd-yy  hh:mmtt", culture, System.Globalization.DateTimeStyles.None);
                long size = (match.Groups[2].Value != "<DIR>") ? long.Parse(match.Groups[2].Value) : 0;
                string name = match.Groups[3].Value;



                Console.WriteLine(
                    "{0,-16} size = {1,9}  modified = {2}",
                    name, size, modified.ToString("yyyy-MM-dd HH:mm"));
            }
        }

        public static string[] GetFiles(string ftpPath)
        {
            IList<string> ftpFiles = new List<string>();
            FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
            request.Method = WebRequestMethods.Ftp.ListDirectoryDetails;
            request.Credentials = networkCredentials;
            FtpWebResponse response = (FtpWebResponse)request.GetResponse();

            Stream responseStream = response.GetResponseStream();
            string line = "";
            StreamReader reader = new StreamReader(responseStream);
            {
                while (!reader.EndOfStream)
                {
                    line = reader.ReadLine();
                    if (!line.Contains("<DIR>"))
                        ftpFiles.Add(line.Substring(39, line.Length - 39));
                }
            }
            reader.Close();
            response.Close();
            return ftpFiles.ToArray();
        }

        public static string MoveFolder(string source, string destination)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(source);
                requestDir.Credentials = networkCredentials;
                requestDir.UseBinary = true;
                requestDir.UsePassive = false;
                requestDir.KeepAlive = false;
                requestDir.Proxy = null;
                requestDir.Method = Ftp.Rename;
                requestDir.RenameTo = destination;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                response.Close();
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static bool DirectoryExists(string ftpPath)
        {
            try
            {
                FtpWebRequest request = (FtpWebRequest)WebRequest.Create(ftpPath);
                request.Credentials = networkCredentials;
                request.Method = Ftp.ListDirectory;
                FtpWebResponse response = (FtpWebResponse)request.GetResponse();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public static string CreateDirectory(string ftpPath)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(new Uri(ftpPath));
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.MakeDirectory;
                requestDir.UsePassive = true;
                requestDir.UseBinary = true;
                requestDir.KeepAlive = false;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string MoveFile(string source, string destination)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(source);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.DownloadFile;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                success = Upload(destination, ToByteArray(ftpStream));
                ftpStream.Close();
                response.Close();
                DeleteFile(source);
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static string Upload(string FileName, byte[] Image)
        {
            string success = "";
            try
            {
                FtpWebRequest clsRequest = (FtpWebRequest)WebRequest.Create(FileName);
                clsRequest.Credentials = networkCredentials;
                clsRequest.Method = Ftp.UploadFile;
                Stream clsStream = clsRequest.GetRequestStream();
                clsStream.Write(Image, 0, Image.Length);
                clsStream.Close();
                clsStream.Dispose();
                success = "ok";
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        public static string DeleteFile(string fileToDelete)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(fileToDelete);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.DeleteFile;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                success = "ok";
            }
            catch (Exception ex)

            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string RemoveDirectory(string ftpPath)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(ftpPath);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.RemoveDirectory;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        public static string Rename(string ftpPath, string newName)
        {
            string success = "";
            try
            {
                FtpWebRequest requestDir = (FtpWebRequest)WebRequest.Create(ftpPath);
                requestDir.Credentials = networkCredentials;
                requestDir.Method = Ftp.Rename;
                requestDir.RenameTo = newName;
                FtpWebResponse response = (FtpWebResponse)requestDir.GetResponse();
                Stream ftpStream = response.GetResponseStream();
                ftpStream.Close();
                response.Close();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }

        static Byte[] ToByteArray(Stream stream)
        {
            MemoryStream ms = new MemoryStream();
            byte[] chunk = new byte[4096];
            int bytesRead;
            while ((bytesRead = stream.Read(chunk, 0, chunk.Length)) > 0)
            {
                ms.Write(chunk, 0, bytesRead);
            }

            return ms.ToArray();
        }
    }
}
