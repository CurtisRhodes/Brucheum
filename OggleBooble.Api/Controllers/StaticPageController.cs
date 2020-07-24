using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;

namespace OggleBooble.Api.Controllers
{
    [EnableCors("*", "*", "*")]
    public class StaticPageController : ApiController
    {
        //private readonly string httpLocation = "https://ogglebooble.com/static/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];

        [HttpGet]
        public StaticPageResultsModel Build(int folderId, bool recurr)
        {
            var resultsModel = new StaticPageResultsModel();
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    //SignalRHost.ProgressHub.PostToClient("Creating static files");
                    //VwDirTree vwDirTree = db.VwDirTrees.Where(v => v.Id == folderId).First();
                    //totalFiles = Math.Max(vwDirTree.GrandTotalFiles, vwDirTree.TotalFiles);
                    //SignalRHost.ProgressHub.ShowProgressBar(totalFiles, 0);
                    VirtualFolder categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    var rootFolder = categoryFolder.RootFolder;
                    if (rootFolder == "centerfold")
                    {
                        rootFolder = "playboy";
                    }
                    CreatePage(folderId, rootFolder, categoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", ""), resultsModel, db, recurr);
                }
            }
            catch (Exception e) { resultsModel.Success = Helpers.ErrorDetails(e); }
            return resultsModel;

        }

        private void CreatePage(int folderId, string rootFolder, string folderName,
            StaticPageResultsModel resultsModel, OggleBoobleMySqlContext db, bool recurr)        {
            try
            {
                var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                if ((dbFolder.FolderType == "singleModel") || (dbFolder.FolderType == "singleParent"))
                {
                    string staticContent =
                    "<html>\n" +
                    " <head></head>\n" +
                    " <body>\n" +
                    "   <script>\n" +
                    "     (function(){window.location.href='https://ogglebooble.com/album.html?folder=" + folderId + "';})();\n" +
                    "   </script>\n" +
                    " </body>\n" +
                    "</html>";
                   string success = WriteFileToDisk(staticContent, rootFolder, folderName);
                    if (success != "ok") {
                        resultsModel.Success = success;
                        return;
                    }
                    resultsModel.PagesCreated++;
                }
                if (recurr)
                {
                    List<VirtualFolder> categoryFolders = db.VirtualFolders.Where(f => f.Parent == folderId).ToList();
                    foreach (VirtualFolder dbCategoryFolder in categoryFolders)
                    {
                        CreatePage(dbCategoryFolder.Id, rootFolder, dbCategoryFolder.FolderName, resultsModel, db, true);
                    }
                }
                resultsModel.FoldersProcessed++;
            }
            catch (Exception e) { resultsModel.Success = Helpers.ErrorDetails(e); }
            resultsModel.Success = "ok";
        }

        private string WriteFileToDisk(string staticContent, string rootFolder, string pageTitle)
        {
            string success;
            try
            {
                // todo  write the image as a file to x.ogglebooble  4/1/19
                string tempFilePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data");

                using (var staticFile = System.IO.File.Open(tempFilePath + "/temp.html", System.IO.FileMode.Create))
                {
                    Byte[] byteArray = System.Text.Encoding.ASCII.GetBytes(staticContent);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                FtpWebRequest webRequest = null;
                //string ftpPath = ftpHost + "/pages.OGGLEBOOBLE.COM/";
                string ftpPath = ftpHost + "ogglebooble/static";

                if (rootFolder == "")
                    webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + pageTitle + ".html");
                else
                    webRequest = (FtpWebRequest)WebRequest.Create(ftpPath + "/" + rootFolder + "/" + pageTitle + ".html");
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                using (System.IO.Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = System.IO.File.ReadAllBytes(tempFilePath + "/temp.html");
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }
                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }
    }
}
