using OggleBooble.Api.Models;
using OggleBooble.Api.MySqlDataContext;
using Org.BouncyCastle.Crypto.Engines;
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
                    VirtualFolder categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    var rootFolder = categoryFolder.RootFolder;
                    if (rootFolder == "centerfold")
                        rootFolder = "playboy";

                    CreatePage(folderId, rootFolder, categoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", ""), resultsModel, db, recurr);
                }
            }
            catch (Exception e) { resultsModel.Success = Helpers.ErrorDetails(e); }
            return resultsModel;

        }
        private void CreatePage(int folderId, string rootFolder, string folderName, StaticPageResultsModel resultsModel, OggleBoobleMySqlContext db, bool recurr)
        {
            try
            {
                var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                if ((dbFolder.FolderType == "singleModel") || (dbFolder.FolderType == "singleParent"))
                {
                    var staticContent = new StringBuilder(
                    "<html>\n" +
                    " <head>\n" +
                    "    <link href='/Styles/Common.css' rel='stylesheet'/>\n" +
                    "    <link href='/Styles/OggleHeader.css' rel='stylesheet'/>\n" +
                    "    <link href='/Styles/AlbumPage.css' rel='stylesheet'/>\n" +
                    "</head>\n" +
                    " <body>\n");

                    staticContent.Append(StaticHeader(db, folderId, folderName));
                    staticContent.Append(CreateBody(folderId));

                    staticContent.Append(
                    "   <script>\n" +
                    "     function goHome() {" +
                    "       window.location.href='https://ogglebooble.com/album.html?folder=" + folderId + "';" +
                    "       }\n" +
                    "   </script>\n" +
                    " </body>\n" +
                    "</html>");

                    string success = WriteFileToDisk(staticContent.ToString(), rootFolder, folderName, folderId, db);
                    if (success != "ok")
                    {
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

        private string CreateBody(int folderId)
        {
            string settingsImgRepo = ConfigurationManager.AppSettings["ImageRepository"];
            var teaserBody = new StringBuilder();
            using (var db = new OggleBoobleMySqlContext())
            {
                var dbImages = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                //var dbImages = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();
                teaserBody.Append(
                "<div class='threeColumnLayout'><div class='leftColumn'></div>" +
                "<div class='middleColumn'><div id='imageContainer' class='galleryContainer'>\n");
                for (int i = 0; i < 16; i++)
                {
                    teaserBody.Append("<div class='folderImageOutterFrame'>" +
                        "<img class='thumbImage' onclick='goHome()'" +
                        " src='" + settingsImgRepo + "/" + dbImages[i].FileName + "'/></div>\n");
                }
                teaserBody.Append(
                "</div></div><div class='rightColumn'></div></div>\n");
            }
            return teaserBody.ToString();
        }

        private string StaticHeader(OggleBoobleMySqlContext db, int folderId, string folderName)
        {
            StringBuilder staticHeaderHtml = new StringBuilder("<div id='oggleHeader' class='stickyHeader boobsHeader'>" +
            "   <div class='siteLogoContainer' onclick='window.location.href=\"OggleBooble.com\"'>\n" +
            "       <img id='divSiteLogo' class='siteLogo' src='/Images/redballon.png' style='height: 60px;'>" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' style='color: rgb(0, 0, 0); height: 28px;'>OggleBooble</div>\n" +
            "           <div class='hdrTopRowMenu' style='font-size: 25px;margin-left:14px;' onclick='goHome()'>handpicked images organized by category</div>\n" +
            "           <div id='searchBox' class='oggleSearchBox'>\n" +
            "               <input class='oggleSearchBoxText'>" +
            "           </div>\n" +
            "       </div>\n" +
            "       <div class='headerBottomRow'>\n" +
            "         <div class='bottomLeftHeaderArea clickable' onclick='goHome()'>go to live page</div>\n" +
            "           <div class='breadCrumbArea'>");
            //$('#trackbackContainer').css("display", "inline-block");
            var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
            foreach (TrackbackLink trackbackLink in trackbackLinks)
            {
                switch (trackbackLink.SiteCode)
                {
                    case "FRE":
                        staticHeaderHtml.Append("<div class='trackBackLink'><a href='" + trackbackLink.Href + "' target=\"_blank\">" + folderName + " Free Porn</a></div>");
                        break;
                    case "BAB":
                        staticHeaderHtml.Append("<div class='trackBackLink'><a href='" + trackbackLink.Href + "' target=\"_blank\">Babepedia</a></div>");
                        break;
                }
            }
            staticHeaderHtml.Append("</div>\n</div>\n</div>\n</div>\n");
            return staticHeaderHtml.ToString();
        }

        private string StaticStyle()
        {
            return "<style>" +
            ":root {" +
            "   --brucheumBlue: #74bac3;" +
            "   --oggleBackgroundColor: #c1bad1;" +
            "   --thumbnailBorderColor: #74bac3;" +
            "}" +
            "body {" +
            "    background - color: var(--oggleBackgroundColor);" +
            "    font - family: Verdana;" +
            "    font - size: var(--normalFont);" +
            "}" +
            ".galleryContainer {" +
            "    display: flex;" +
            "    text - align: center;" +
            "    background - color: #fff;" +
            "    border: solid thin black;" +
            "    min - height: 200px;" +
            "    flex - wrap: wrap;" +
            "    max - height: inherit;" +
            "    overflow - y: scroll;" +
            "    }" +
            ".labelClass {" +
            "   display: inline - block;" +
            "   text - align: center;" +
            "   margin - right: 4px;" +
            "}" +
            ".imageFrameClass {" +
            "    background - color: var(--thumbnailBorderColor);" +
            "    border: solid 6px var(--thumbnailBorderColor);" +
            "    border - radius: 4px;" +
            "    margin: 4px;" +
            "    }" +
            "</style>";
        }

        private string WriteFileToDisk(string staticContent, string rootFolder, string pageTitle, int folderId, OggleBoobleMySqlContext db)
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
                string destination = ftpPath + "/" + rootFolder + "/" + pageTitle + ".html";
                if (rootFolder == "")
                    destination = ftpPath + "/" + pageTitle + ".html";

                webRequest = (FtpWebRequest)WebRequest.Create(destination);
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

                success = recordPageCreation(rootFolder, folderId, destination, db);


                success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }

        private string recordPageCreation(string rootFolder, int folderId, string staticFileName, OggleBoobleMySqlContext db)
        {
            string success;
            try
            {
                var dbFolderDetail = db.FolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                if (dbFolderDetail == null)
                {
                    db.FolderDetails.Add(new FolderDetail()
                    {
                        FolderId = folderId,
                        StaticFile = staticFileName,
                        StaticFileUpdate = DateTime.Now
                    });
                }
                else
                {
                    dbFolderDetail.StaticFile = staticFileName;
                    dbFolderDetail.StaticFileUpdate = DateTime.Now;
                }
                db.SaveChanges();
                success = "ok";
            }
            catch (Exception ex)
            {
                success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}
