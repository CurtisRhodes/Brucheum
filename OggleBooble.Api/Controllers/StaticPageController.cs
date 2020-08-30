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
        private readonly string httpLocation = "https://ogglebooble.com/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];

        [HttpGet]
        public StaticPageResultsModel Build(int folderId, bool recurr)
        {
            var resultsModel = new StaticPageResultsModel() { Success = "ok" };
            try
            {
                using (var db = new OggleBoobleMySqlContext())
                {
                    VirtualFolder categoryFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
                    CreatePage(folderId, resultsModel, db, recurr);
                }
            }
            catch (Exception e) { resultsModel.Success = Helpers.ErrorDetails(e); }
            return resultsModel;
        }
        private void CreatePage(int folderId, StaticPageResultsModel resultsModel, OggleBoobleMySqlContext db, bool recurr)
        {
            if (resultsModel.Success != "ok")
                return;
            try
            {                
                var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).FirstOrDefault();
                if ((dbFolder.FolderType == "singleModel") || (dbFolder.FolderType == "singleParent"))
                {
                    string folderImage = "";
                    var dbVwDirTree = db.VwDirTrees.Where(t => t.Id == folderId).FirstOrDefault();
                    if (dbVwDirTree != null)
                        folderImage = "https://ogglebooble.com/img/" + dbVwDirTree.FolderImage;
                    var staticContent = new StringBuilder(
                    "<html>\n" +
                    " <head>\n" +
                    "    <link rel='shortcut icon' href='Images/favicon.png' type='image/x-icon' />" +
                    "    <title>" + dbFolder.FolderName + " : OggleBooble</title>" +
                    "    <meta http-equiv='Content-Type' content='text/html; charset = UTF-8' />" +
                    "    <meta name='referrer' content='always'/>\n" +
                    "    <meta name='description' content='Ogglebooble is a large collection of natural big breasted girls." +
                            " You'll find hundreds of photos of each model. Ogglebooble also has the web's largest collection of free Playboy images" +
                            "Ogglebooble also has a large galley for every Playboy Centerfold. Pictures organized by poses.'/>\n" +
                    "    <meta name='keywords' content='" + dbFolder.FolderName + ",big naturals, naked, nude, big boobs, big tits, Every Playboy Centerfold," +
                    "        centerfolds, Playboy Playmates, poses, naked ladies by poses '/>\n" +

                    "   <meta property='og:title' content='" + dbFolder.FolderName + "- Free pics, videos & biography'/>\n" +
                    "   <meta property='og:description' content='" + dbFolder.FolderName + " - Free pics, videos & biography'/>\n" +
                    "   <meta property='og:url' content='https://www.Ogglebooble.com/" + dbFolder.FolderName + "'/>\n" +
                    "   <meta property='og:site_name' content='OggleBooble'/>\n" +
                    "   <meta name='og:type' content='website'>\n" +
                    "<meta property='og:type' content='website'/><meta property='og:image' content='" + folderImage + "'/>\n" +

                    //<link rel="search" href="https://www.Oggglebooble.com/data/opensearchdescription.xml" 
                    //"   <OpenSearchDescription xmlns = 'http://a9.com/-/spec/opensearch/1.1/' >\n" +
                    //< ShortName > Babepedia </ ShortName >
                    //< Tags > babepedia pornstars babes models photos videos free galleries pics </ Tags >
                    //< Url type = "text/html" template = "http://www.babepedia.com/search/{searchTerms}" />
                    //< Image height = "24" width = "24" type = "image/x-icon" > http://www.babepedia.com/favicon.ico</Image>
                    //< Query role = "example" searchTerms = "Tiffany" />
                    //< AdultContent > TRUE </ AdultContent >
                    //</ OpenSearchDescription >

                    "    <link href='/Styles/Common.css' rel='stylesheet'/>\n" +
                    "    <link href='/Styles/OggleHeader.css' rel='stylesheet'/>\n" +
                    "    <link href='/Styles/AlbumPage.css' rel='stylesheet'/>\n" +
                    "</head>\n" +

                    " <body>\n");

                    staticContent.Append(StaticHeader(db, folderId));
                    staticContent.Append(CreateBody(folderId));

                    staticContent.Append(
                    "   <script>\n" +
                    "     function goHome() {" +
                    "       window.location.href='https://ogglebooble.com/album.html?folder=" + folderId + "&tic=si';" +
                    "       }\n" +
                    "   </script>\n" +
                    " </body>\n" +
                    "</html>");

                    string writeToDiskSuccess = WriteFileToDisk(staticContent.ToString(), dbFolder.FolderName, folderId, db);
                    if (writeToDiskSuccess != "ok")
                    {
                        resultsModel.Errors.Add(writeToDiskSuccess + "  " + dbFolder.FolderName);
                        resultsModel.Success = writeToDiskSuccess + "  " + dbFolder.FolderName;
                    }
                    else
                        resultsModel.PagesCreated++;
                }
                if (recurr)
                {
                    if (resultsModel.Success == "ok")
                    {
                        List<VirtualFolder> categoryFolders = db.VirtualFolders.Where(f => f.Parent == folderId).ToList();
                        foreach (VirtualFolder dbCategoryFolder in categoryFolders)
                        {
                            CreatePage(dbCategoryFolder.Id, resultsModel, db, true);
                        }
                    }
                }
                resultsModel.FoldersProcessed++;
            }
            catch (Exception e) {
                resultsModel.Errors.Add(Helpers.ErrorDetails(e));
                resultsModel.Success = "err";
            }
        }

        private string CreateBody(int folderId)
        {
            string settingsImgRepo = ConfigurationManager.AppSettings["ImageRepository"];
            var teaserBody = new StringBuilder();
            using (var db = new OggleBoobleMySqlContext())
            {
                var dbImages = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                if (dbImages.Count < 16) {
                    dbImages.AddRange(db.VwLinks.Where(v => v.Parent == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList());
                }
                //var dbImages = db.ImageFiles.Where(i => i.FolderId == folderId).ToList();
                teaserBody.Append(
                "<div class='threeColumnLayout'><div class='leftColumn'></div>" +
                "<div class='middleColumn'><div id='imageContainer' class='galleryContainer'>\n");
                for (int i = 0; i < Math.Min(dbImages.Count, 18); i++)
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

        private string StaticHeader(OggleBoobleMySqlContext db, int folderId)
        {
            StringBuilder staticHeaderHtml = new StringBuilder("<div id='oggleHeader' class='stickyHeader boobsHeader'>" +
            "   <div class='siteLogoContainer'>\n" +
            "       <img id='divSiteLogo' class='siteLogo' src='/Images/redballon.png' style='height: 60px;' onclick='goHome()'>" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' style='color: rgb(0, 0, 0); height: 28px;'>OggleBooble</div>\n" +
            "           <div class='hdrTopRowMenu' style='font-size: 25px;margin-left:14px;margin-top:4px;'>\n");
            //                "handpicked images organized by category
            var dbFolder = db.VirtualFolders.Where(f => f.Id == folderId).First();
            var trackbackLinks = db.TrackbackLinks.Where(t => t.PageId == folderId).ToList();
            foreach (TrackbackLink trackbackLink in trackbackLinks)
            {
                switch (trackbackLink.SiteCode)
                {
                    case "BAB":
                        staticHeaderHtml.Append("<div class=\"trackBackLink\"><a href='" + trackbackLink.Href + "' target=\"_blank\">Babepedia</a></div>\n");
                        break;
                    case "FRE":
                        staticHeaderHtml.Append("<div class='trackBackLink'><a href='" + trackbackLink.Href + "' target=\"_blank\">" + dbFolder.FolderName + " Free Porn</a></div>\n");
                        break;
                }
            }
            staticHeaderHtml.Append("</div style='margin-left:20px;' onclick='goHome()'>(this is a static page for search engines and trackback links<br/>" +
            "   click on any image to go to the main page)" +
            "       </div>\n" +  // headerTopRow
            "       <div class='headerBottomRow'>\n" +
            "           <div style='display:inline-block' >" + dbFolder.RootFolder + "</div>\n" +
            "           <div style='display:inline-block; text-align:center; font-size:18px' onclick='goHome()'>");
            var dbParent = db.VirtualFolders.Where(p => p.Id == dbFolder.Parent).First();
            staticHeaderHtml.Append(dbParent.FolderName + " / " + dbFolder.FolderName + "</div>\n</div>\n</div>\n</div>\n");
            return staticHeaderHtml.ToString();
        }

        private string WriteFileToDisk(string staticContent, string pageTitle, int folderId, OggleBoobleMySqlContext db)
        {
            string success;
            try
            {
                // todo  write the image as a file to x.ogglebooble  4/1/19
                //string tempFilePath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data");
                string appDataPath = System.Web.HttpContext.Current.Server.MapPath("~/App_Data/temp/");

                using (var staticFile = System.IO.File.Open(appDataPath + "/temp.html", System.IO.FileMode.Create))
                {
                    Byte[] byteArray = System.Text.Encoding.ASCII.GetBytes(staticContent);
                    staticFile.Write(byteArray, 0, byteArray.Length);
                }
                FtpWebRequest webRequest = null;
                //string ftpPath = ftpHost + "/pages.OGGLEBOOBLE.COM/";
               
                string ftpFileName = ftpHost + "ogglebooble/" + pageTitle + ".html";
                string httpFileName = httpLocation + "/" + pageTitle + ".html";

                webRequest = (FtpWebRequest)WebRequest.Create(ftpFileName);
                webRequest.Credentials = new NetworkCredential(ftpUserName, ftpPassword);
                webRequest.Method = WebRequestMethods.Ftp.UploadFile;
                using (System.IO.Stream requestStream = webRequest.GetRequestStream())
                {
                    byte[] fileContents = System.IO.File.ReadAllBytes(appDataPath + "/temp.html");
                    webRequest.ContentLength = fileContents.Length;
                    requestStream.Write(fileContents, 0, fileContents.Length);
                    requestStream.Flush();
                    requestStream.Close();
                }

                success = RecordPageCreation(folderId, httpFileName, db);
                //success = "ok";
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }

        private string RecordPageCreation(int folderId, string httpFileName, OggleBoobleMySqlContext db)
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
                        StaticFile = httpFileName,
                        StaticFileUpdate = DateTime.Now
                    });
                }
                else
                {
                    dbFolderDetail.StaticFile = httpFileName;
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
