using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.DataContext;
using WebApi.Models;

namespace WebApi.Controllers
{
    [EnableCors("*", "*", "*")]
    public class StaticPageController : ApiController
    {
        private readonly string httpLocation = "https://ogglebooble.com/static/";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        //private int totalFiles = 0;
        //private int filesProcessed = 0;
        private int imagesCount;

        [HttpGet]
        public string Build(int folderId, bool recurr)
        {
            string success = "";
            {
                try
                { 
                    using (OggleBoobleContext db = new OggleBoobleContext())
                    {
                        //SignalRHost.ProgressHub.PostToClient("Creating static files");
                        //VwDirTree vwDirTree = db.VwDirTrees.Where(v => v.Id == folderId).First();
                        //totalFiles = Math.Max(vwDirTree.GrandTotalFiles, vwDirTree.TotalFiles);
                        //SignalRHost.ProgressHub.ShowProgressBar(totalFiles, 0);
                        CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                        success = ProcessFolder(folderId, categoryFolder.RootFolder, categoryFolder.FolderName, db, recurr);
                    }
                }
                catch (Exception e) { success = Helpers.ErrorDetails(e); }
                return success;
            }
        }

        private string ProcessFolder(int folderId, string rootFolder, string folderName, OggleBoobleContext db, bool recurr)
        {
            string success = "";
            try
            {
                //SignalRHost.ProgressHub.PostToClient("Creating static files: " + folderName + ".html");
                folderName = Helpers.GetCustomStaticFolderName(folderId, folderName.Replace(".OGGLEBOOBLE.COM", ""));
                string staticContent =
                    "<!DOCTYPE html>\n<html>\n" + HeadHtml(folderId, folderName) +
                    "\n<body style='margin-top:105px'>\n<header></header>" + 
                    GalleryPageBodyHtml(folderId, rootFolder) +
                    CommentDialog() + CategoryDialog() + ModelInfoDialog() +
                    "<div id='staticCatTreeContainer' class='displayHidden categoryListContainer' title=" + rootFolder + "></div>" +
                    "<script>var staticPageFolderId=" + folderId + "; " +
                    "var staticPageFolderName='" + folderName + "'; " +
                    "var staticPageImagesCount='" + imagesCount + "'; " +
                    "var staticPageRootFolderId='" + rootFolder + "';</script>\n" +
                    Slideshow() + FooterHtml(rootFolder) +
                    "<script src='/scripts/StaticPage.js'></script>\n" +
                    "\n</body>\n</html>";

                success = WriteFileToDisk(staticContent, rootFolder, folderName);
                if (success == "ok")
                {
                    if (recurr)
                    {
                        List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                        foreach (CategoryFolder dbCategoryFolder in categoryFolders)
                        {
                            //VwDirTree vwDirTree = db.VwDirTrees.Where(v => v.Id == dbCategoryFolder.Id).First();
                            //filesProcessed += Math.Max(vwDirTree.TotalFiles, vwDirTree.FileCount);
                            //filesProcessed += vwDirTree.FileCount;
                            //SignalRHost.ProgressHub.ShowProgressBar(totalFiles, filesProcessed);
                            //var cFolderName = Helpers.GetParentPath(dbCategoryFolder.Id) + dbCategoryFolder.FolderName;

                            ProcessFolder(dbCategoryFolder.Id, rootFolder, dbCategoryFolder.FolderName, db, true);
                        }
                    }
                }
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }

        private string WriteFileToDisk(string staticContent, string rootFolder, string pageTitle)
        {
            string success = "";
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
                string ftpPath = ftpHost + "oggle/static";

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

        private string HeadHtml(int folderId, string folderName)
        {
            var articleTagString = "";
            MetaTagResultsModel metaTagResults = new MetaTagController().GetTags(folderId, "undefined");
            foreach (MetaTagModel metaTag in metaTagResults.MetaTags)
            {
                articleTagString += "," + metaTag.Tag;
            }
            return "<head>\n" +
                "   <meta charset='utf-8'>\n" +
                "   <script src='https://code.jquery.com/jquery-latest.min.js' type='text/javascript'></script>\n" +
                "   <script src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js' type='text/javascript'></script>\n" +
                "   <link href='https://netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.css' rel='stylesheet'>\n" +
                "   <script src='https://netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.js'></script>\n" +
                "   <link href='https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote.css' rel='stylesheet'>\n" +
                "   <script src='https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote.js'></script>\n" +
                "   <link href='/Styles/jqueryui.css' rel='stylesheet' />\n" +
                "   <link rel='icon' type='image/png' href='/static/favicon.png' />" +
                "   <script src='/Scripts/Login.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/Common.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/OggleHeader.js'></script>\n"+
                "   <script src='/Scripts/Album.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/Slideshow.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/ImageCommentDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/FolderCategoryDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/ModelInfoDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/DirTree.js'></script>\n" +

                "   <link href='/Styles/Common.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/Header.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/Slideshow.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/FolderCategoryDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/ImageCommentDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/Carousel.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/ModelInfoDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/ImagePage.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/LoginDialog.css' rel='stylesheet'/>\n" +
                "   <title>" + folderName + " : OggleBooble</title>" +
                "   <meta name='Title' content='" + folderName + "' property='og:title'/>\n" +
                "   <meta name='description' content='" + metaTagResults.MetaDescription + "'/>\n" +
                "   <meta property='og:type' content='website' />\n" +
                "   <meta property='og:url' content='" + httpLocation + folderName + ".html'/>\n" +
                "   <meta name='Keywords' content='" + articleTagString + "'/>\n" +
                "</head>";
        }

        private string GalleryPageBodyHtml(int folderId, string rootFolder)
        {
            string bodyHtml =
            "<div class='threeColumnLayout'>\n" +
                "<div id='leftColumn'></div>\n" +
                "<div id='middleColumn'>\n" +
                    "<div id='divStatusMessage'></div>\n" +
                    "<div id='imageContainer' class='flexWrapContainer'>\n";

            //ImageLink[] imageArray = null;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                imagesCount = 0;
                string imageFrameClass = "folderImageOutterFrame";
                string subDirLabelClass = "subDirLabel";
                if (rootFolder == "porn" && rootFolder == "sluts")
                {
                    imageFrameClass = "pornFolderImageOutterFrame";
                    subDirLabelClass = "pornSubDirLabel";
                }
                // IMAGES 
                List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
                int idx = 0;
                foreach (VwLink link in vwLinks)
                {
                    bodyHtml += "<div id='img" + idx + "' class='" + imageFrameClass + "'><img class='thumbImage' " +
                         "oncontextmenu='ctxSAP(\"img" + idx + "\")' onclick='startSlideShow(" + idx++ + ")' src='" + link.Link + "'/></div>\n";
                    imagesCount++;
                }
                //  SUBFOLDERS
                List<VwDirTree> subDirs = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.SortOrder).ThenBy(f => f.Id).ToList();
                foreach (VwDirTree subDir in subDirs)
                {
                    string fullerFolderName = subDir.RootFolder + "/" + Helpers.GetCustomStaticFolderName(subDir.Id, subDir.FolderName);

                    int subDirFileCount = subDir.FileCount + subDir.TotalFiles + subDir.GrandTotalFiles;
                    bodyHtml += "<div class='" + imageFrameClass + "'>" +
                        "<div class='folderImageFrame' onclick='window.location.href=\"" + httpLocation + fullerFolderName + ".html\"'>" +
                        "<img class='folderImage' src='" + subDir.Link + "'/>" +
                        "<div class='" + subDirLabelClass + "'>" + subDir.FolderName + " (" + subDirFileCount + ")</div></div></div>\n";
                    imagesCount++;
                }
            }

            bodyHtml +=
                "   </div>\n" +
                "       <div id='fileCount' class='countContainer'></div>\n" +
                "       <div id='thumbImageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut();'>\n" +
                "           <div id='ctxModelName' onclick='contextMenuActionShow()'>model name</div>\n" +
                "           <div id='ctxSeeMore' onclick='contextMenuAction(\"jump\")'>see more of her</div>\n" +
                "           <div onclick='contextMenuAction(\"comment\")'>comment</div>\n" +
                "           <div onclick='contextMenuAction(\"explode\")'>explode</div>\n" +
                "           <div onclick= 'contextMenuAction(\"showLinks\")' > Show Links</div>\n" +
                "           <div id='linkInfo' class='innerContextMenuInfo'>\n" +
                "               <div id='linkInfoContainer'></div>\n" +
                "           </div>\n" +
                "      </div>\n" +
                "   </div>\n" +
                "<div id='rightColumn'></div>\n" +
            "</div>";
            return bodyHtml;
        }

        private string Slideshow()
        {
            return
            "\n<div id='imageViewerDialog' class='fullScreenViewer'>\n" +
                "<div id = 'viewerButtonsRow' class='imageViewerHeaderRow'>\n" +
                    "<div class='viewerButtonsRowSection'>\n" +
                        "<img id = 'imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='/images/comment.png' />" +
                    "</div>\n" +
                    "<span id = 'imageViewerHeaderTitle' class='imageViewerTitle'></span>" +
                    "<div class='viewerButtonsRowSection'>" +
                        "<div class='floatRight' style='margin-left: 44px;' onclick='closeViewer();'><img src='/images/close.png' /></div>\n" +
                        "<div class='floatRight' onclick=\"runSlideShow('faster')\"><img id='fasterSlideshow' title='faster slideshow' src='/images/slideshowFaster.png' /></div>\n" +
                        "<div class='floatRight' onclick=\"runSlideShow('start')\"><img id='showSlideshow' title='start slideshow' src='/images/slideshow.png' /></div>\n" +
                        "<div class='floatRight' onclick=\"runSlideShow('slower')\"><img id='slowerSlideShow' title='slower slideshow' src='/images/slideshowSlower.png' /></div>\n" +
                        "<div class='floatRight' onclick=\"blowupImage()\"><img class='popoutBox' src='/images/expand02.png' /></div>\n" +
                    "</div>\n" +
                "</div>\n" +
                "<div id='leftClickArea' class='hiddeClickArea' oncontextmenu='slideshowContexMenu()' onclick='slide(\"prev\")'></div>" +
                "<div id='rightClickArea' class='hiddeClickArea' oncontextmenu='slideshowContexMenu()' onclick='slide(\"next\")' ></div>\n" +
                "<div id='viewerImageContainer' class='expandoImageDiv'>\n" +
                    "<img id='viewerImage' class='expandoImage'/>\n" +
                "</div>\n" +
             "</div>\n";
        }

        private string CommentDialog()
        {
            return "\n<div id='imageCommentDialog' class='displayHidden commentDialog' title='Write a fantasy about this image'>\n" +
              "<div class='commentDialogContentArea'>\n" +
                "<div class='center'><img id='commentDialogImage' class='commentDialogImage' /></div>\n" +
                "<div><input id='txtCommentTitle' tabindex='1' class='roundedInput commentTitleText' placeholder='Give your comment a title' /></div>\n" +
                "<div id='imageCommentEditor' tabindex='2'></div>\n" +
                "<div id='divSaveFantasy' class='roundendButton clickable commentDialogButton inline' onclick='saveComment()'>save</div>\n" +
                "<div id='commentInstructions' class='loginComment inline'>log in to view comments</div>\n" +
              "</div>\n" +
            "</div>\n";
        }

        private string CategoryDialog()
        {
            return "<div id='folderCategoryDialog' class='displayHidden' title='' onmouseleave='considerClosingCategoryDialog()'>\n" +
            "    <div><textarea id='catDlgDescription' class='catDlgTextArea'></textarea></div>\n" +
            "</div>\n";
        }

        private string ModelInfoDialog()
        {
            return "<div id = 'modelInfoDialog' class='oggleDialogWindow' onmouseleave='considerClosingModelInfoDialog()'>\n" +
            "       <div id = 'modelInfoEditArea' class='displayHidden'>\n" +
            "        <div class='flexContainer'>\n" +
            "            <div class='floatLeft'>\n" +
            "                <div class='modelInfoDialogLabel'>name</div><input id='txtFolderName' class='modelDialogInput' /><br />\n" +
            "                <div class='modelInfoDialogLabel'>from</div><input id='txtNationality' class='modelDialogInput' /><br />\n" +
            "                <div class='modelInfoDialogLabel'>born</div><input id='txtBorn' class='modelDialogInput' /><br />\n" +
            "                <div class='modelInfoDialogLabel'>boobs</div><input id='txtBoobs' class='modelDialogInput' /><br />\n" +
            "                <div class='modelInfoDialogLabel'>figure</div><input id='txtMeasurements' class='modelDialogInput' />\n" +
            "            </div>\n" +
            "            <div class='floatLeft'>\n" +
            "                <img id = 'modelDialogThumbNailImage' src='/images/redballon.png' class='modelDialogImage' />\n" +
            "            </div>\n" +
            "       </div>\n" +
            "       <div class='modelInfoDialogLabel'>comment</div>\n" +
            "       <div><textarea id='modelInfoDialogComment' class='modelInfoCommentArea'></textarea></div>\n" +
            "       <div class='modelInfoDialogLabel'>trackbacks</div>\n" +
            "       <div id='modelInfoDialogTrackBack'>\n" +
            "           <div class='hrefLabel'>href</div><input id = 'txtLinkHref' class='modelDialogInput' />\n" +
            "            <div class='hrefLabel'>label</div><input id = 'txtLinkLabel' class='modelDialogInput' onblur='addHrefToExternalLinks()' />\n" +
            "            <span class='addLinkIcon' onclick='addHrefToExternalLinks()'>+</span>\n" +
            "       </div>\n" +
            "        <div id = 'externalLinks' class='trackbackLinksArea'></div>\n" +
            "    </div>\n" +
            "    <div id = 'modelInfoViewOnlyArea' class='displayHidden'>\n" +
            "        <div class='viewOnlyMessage'>If you you know who this is Please click Edit</div>\n" +
            "        <div id = 'unknownModelLinks' class='smallTextArea'></div>\n" +
            "    </div>\n" +
            "    <a id = 'modelInfoEdit' class='dialogEditButton' href='javascript:toggleMode()'>Edit</a>\n" +
            "</div>\n";
        }

        private string FooterHtml(string rootFolder)
        {
            if (rootFolder == "porn" || rootFolder == "sluts")
            {
                return "\n<footer>\n" +
                    "<div class='flexContainer'>\n" +
                          "<div class='footerCol'>\n" +
                              "<div onclick='showCatListDialog(242)'>Category List</div>\n" +
                              "<div><a href='https://ogglebooble.com'>Oggle Booble</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='https://ogglebooble.com/Ranker.html?subdomain=porn'>Porn Rater</a></div>\n" +
                              "<div><a href='https://ogglebooble.com/Videos.html'>Nasty Videos</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
                              "<div><a href='https://ogglebooble.com/Blog.html'>Blog</a></div>\n" +
                              "<div><a href='" + httpLocation + "sluts/sluts.html'>Archive</a></div>\n" +
                          "</div>\n" +
                    "</div>\n" +
                    "<div class='footerVersionMessage'>built " + DateTime.Now.ToShortDateString() + "</div>\n" +
                    "<div class='footerFooter'>" +
                          "<div id='footerMessage'></div>" +
                          "<div id='copyright'>&copy; 2019 - <a href='/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>" +
                    "</div>\n" +
                "</footer>";
            }
            else
                return "\n<footer>\n" +
                    "<div class='flexContainer'>\n" +
                        "<div class='footerCol'>\n" +
                            "<div id='explain'></div>\n" +
                            "<div onclick='showCatListDialog(2)'>Category List</div>\n" +
                            "<div><a href='" + httpLocation + "porn/porn.html'>Nasty Porn</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='https://ogglebooble.com/Ranker.html'>Boobs Rater</a></div>\n" +
                              "<div id='Rejects'></div>\n" +
                              "<div><a href='" + httpLocation + "playboy/centerfolds.html'>Centerfolds</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
                              "<div><a href='https://ogglebooble.com/Blog.html'>Blog</a></div>\n" +
                              "<div><a href='" + httpLocation + "sluts/sluts.html'>Archive</a></div>\n" +
                          "</div>\n" +
                    "</div>\n" +
                    "<div class='footerVersionMessage'>built " + DateTime.Now.ToShortDateString() + "</div>\n" +
                    "<div class='footerFooter'>" +
                          "<div id='footerMessage'></div>" +
                          "<div id='copyright'>&copy; 2019 - <a href='/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>" +
                    "</div>\n" +
                "</footer>";
        }

        [HttpGet]
        public SuccessModel HasLink(int folderId, string hrefTextSubstring)
        {
            SuccessModel success = new SuccessModel() { ReturnValue = "no" };
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    SuccessModel dbRow = (from f in db.CategoryFolders
                                 join d in db.CategoryFolderDetails on f.Id equals d.FolderId
                                 where d.ExternalLinks.Contains(hrefTextSubstring) && f.Id == folderId
                                 select (new SuccessModel { ReturnValue = d.ExternalLinks })).FirstOrDefault();
                    if (dbRow != null)
                    {
                        success.ReturnValue = dbRow.ReturnValue;
                    }
                    success.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                success.Success = Helpers.ErrorDetails(ex);
            }
            return success;
        }
    }
}

