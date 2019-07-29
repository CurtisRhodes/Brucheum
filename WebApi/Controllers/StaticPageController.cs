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
        //private readonly string httpLocation = "http://pages.oggle.com";
        private readonly string httpLocation = "https://ogglebooble.com/static";
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private int initialTake = 145;
        private int totalFiles = 0;
        private int filesProcessed = 0;

        [HttpGet]
        public string Build(int parentFolder, bool recurr)
        {
            string success = "";
            {
                try
                { 
                    using (OggleBoobleContext db = new OggleBoobleContext())
                    {
                        SignalRHost.ProgressHub.PostToClient("Creating static files");
                        VwDirTree vwDirTree = db.VwDirTrees.Where(v => v.Id == parentFolder).First();
                        totalFiles = Math.Max(vwDirTree.GrandTotalFiles, vwDirTree.TotalFiles);
                        SignalRHost.ProgressHub.ShowProgressBar(totalFiles, 0);



                        CategoryFolder categoryFolder = db.CategoryFolders.Where(f => f.Id == parentFolder).First();
                        //SignalRHost.ProgressHub.PostToClient("Creating index page");
                        //CreateIndexPage(categoryFolder.RootFolder, userName);
                        string folderName = categoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", "");
                        success = ProcessFolder(parentFolder, categoryFolder.RootFolder, folderName, db, recurr);
                    }
                }
                catch (Exception e) { success = Helpers.ErrorDetails(e); }
                return success;
            }
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

        private string ProcessFolder(int folderId, string rootFolder, string folderName, OggleBoobleContext db, bool recurr)
        {
            string success = "";
            try
            {
                SignalRHost.ProgressHub.PostToClient("Creating static files: " + folderName + ".html");

                string pageTitle = folderName;
                if (folderName.LastIndexOf('/') > 0)
                    pageTitle = folderName.Substring(folderName.LastIndexOf('/') + 1);

                string staticContent =
                    "<!DOCTYPE html>\n<html>\n" + HeadHtml(folderId, pageTitle) +
                    "\n<body style='margin-top:105px'>\n" +
                    HeaderHtml(folderId) + GalleryPageBodyHtml(folderId, rootFolder) + CommentDialog() + CategoryDialog() + ModelInfoDialog() +
                    "<div id='staticCatTreeContainer' class='oggleHidden categoryListContainer' title=" + rootFolder + "></div>" +
                    "<script>var staticPageFolderId=" + folderId + "; var staticPageFolderName='" + folderName + "'; " +
                    "var staticPageRootFolder='" + rootFolder + "';</script>\n" +
                    ImageViewer() + LoginDialog() + RegisterDialog() + FooterHtml(rootFolder) +
                    "<script src='/scripts/StaticPage.js'></script>\n" +
                    "\n</body>\n</html>";

                success = WriteFileToDisk(staticContent, rootFolder, pageTitle);
                if (recurr)
                {
                    List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                    foreach (CategoryFolder dbCategoryFolder in categoryFolders)
                    {
                        VwDirTree vwDirTree = db.VwDirTrees.Where(v => v.Id == dbCategoryFolder.Id).First();
                        //filesProcessed += Math.Max(vwDirTree.TotalFiles, vwDirTree.FileCount);
                        filesProcessed += vwDirTree.FileCount;
                        SignalRHost.ProgressHub.ShowProgressBar(totalFiles, filesProcessed);

                        ProcessFolder(dbCategoryFolder.Id, rootFolder, dbCategoryFolder.RootFolder + "/" + dbCategoryFolder.FolderName, db, true);
                    }
                }
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }

        private string HeadHtmlx(int folderId, string pageName)
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
                "   <link href='/styles/jqueryui.css' rel='stylesheet' />\n" +
                "   <link rel='icon' type='image/png' href='/static/favicon.png' />" +
                "   <script src='/scripts/GlobalFunctions.js' type='text/javascript'></script>\n" +
                "   <script src='/scripts/ResizeThreeColumnPage.js' type='text/javascript'></script>\n" +
                "   <script src='/scripts/ImageViewer.js' type='text/javascript'></script>\n" +
                "   <script src='/scripts/CommentDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/scripts/CategoryDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/scripts/ModelInfoDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/scripts/DirTree.js'></script>\n" +
                "   <link href='/styles/default.css'     rel='stylesheet'/>\n" +
                "   <link href='/styles/fixedHeader.css' rel='stylesheet'/>\n" +
                "   <link href='/styles/imageViewer.css' rel='stylesheet'/>\n" +
                "   <link href='/styles/categoryDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/styles/carousel.css' rel='stylesheet'/>\n" +
                "   <link href='/styles/modelInfoDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/styles/footer.css'      rel='stylesheet'/>\n" +
                "   <link href='/styles/ImagePage.css'   rel='stylesheet'/>\n" +
                "   <link href='/styles/loginDialog.css'   rel='stylesheet'/>\n" +
                "   <title>" + pageName + " - OggleBooble</title>" +
                "   <meta name='Title' content='" + pageName + "' property='og:title'/>\n" +
                "   <meta name='description' content='" + metaTagResults.Description + "'/>\n" +
                "   <meta property='og:type' content='website' />\n" +
                "   <meta property='og:url' content='" + httpLocation + "/" + pageName + ".html'/>\n" +
                "   <meta name='Keywords' content='" + articleTagString + "'/>\n" +
                "</head>";
        }

        private string HeadHtml(int folderId, string pageName)
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
                "   <script src='/Scripts/Common.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/Slideshow.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/ImageCommentDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/CategoryDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/ModelInfoDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/DirTree.js'></script>\n" +
                "   <link href='/Styles/Common.css'     rel='stylesheet'/>\n" +
                "   <link href='/Styles/Header.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/Slideshow.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/CategoryDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/Carousel.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/ModelInfoDialog.css' rel='stylesheet'/>\n" +
                "   <link href='/Styles/ImagePage.css'   rel='stylesheet'/>\n" +
                "   <link href='/Styles/LoginDialog.css'   rel='stylesheet'/>\n" +
                "   <title>" + pageName + " - OggleBooble</title>" +
                "   <meta name='Title' content='" + pageName + "' property='og:title'/>\n" +
                "   <meta name='description' content='" + metaTagResults.Description + "'/>\n" +
                "   <meta property='og:type' content='website' />\n" +
                "   <meta property='og:url' content='" + httpLocation + "/" + pageName + ".html'/>\n" +
                "   <meta name='Keywords' content='" + articleTagString + "'/>\n" +
                "</head>";
        }

        private string HeaderHtml(int folderId)
        {
            string breadCrumbs = "";
            string headerSubtitle = "";
            string colorClass = "";
            string bannerLogo = "";
            string homeLink = "";
            //string rootFolder = "";
            BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                //string root = thisFolder.RootFolder;
                breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
                {
                    FolderId = thisFolder.Id,
                    FolderName = thisFolder.FolderName,
                    IsInitialFolder = true
                });
                breadCrumbModel.RootFolder = thisFolder.RootFolder;
                breadCrumbModel.FolderName = thisFolder.FolderName;

                var parent = thisFolder.Parent;
                while (parent > 1)
                {
                    var parentDb = db.CategoryFolders.Where(f => f.Id == parent).First();
                    breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
                    {
                        FolderId = parentDb.Id,
                        FolderName = parentDb.FolderName,
                        IsInitialFolder = false
                    });
                    parent = parentDb.Parent;
                }
                for (int i = breadCrumbModel.BreadCrumbs.Count - 1; i >= 0; i--)
                {
                    if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder)
                    {
                        breadCrumbs += "<a class='inactiveBreadCrumb' " +
                            "onmouseover='slowlyShowCatDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + "); forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' >" +
                            breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") + "</a>";
                    }
                    else
                    {
                        // a woman commited suicide when pictures of her "came out"
                        breadCrumbs += "<a class='activeBreadCrumb' " +
                            "href='" + breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") + ".html'>" +
                            breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") + "</a>";
                    }
                }

                if (thisFolder.RootFolder == "porn" || thisFolder.RootFolder == "sluts")
                {
                    headerSubtitle = "<a href='" + httpLocation + "/porn/cock suckers.html'> blowjobs </a>," +
                    "<a href='" + httpLocation + "/porn/cum shots.html'> cum shots</a>," +
                    "<a href='" + httpLocation + "/porn/kinky.html'> kinky </a>, and other" +
                    "<a href='" + httpLocation + "/porn/naughty.html'> naughty behavior</a> categorized";
                    colorClass = "pornColors";
                    bannerLogo = "/images/csLips02.png";
                    homeLink = "" + httpLocation + "/porn.html";
                }
                else
                {
                    headerSubtitle = "<a href='" + httpLocation + "/boobs/boobs.html'>big tits</a> and " +
                     "<a href='" + httpLocation + "/boobs/rear view.html'>ass</a> organized by" +
                     "<a href='" + httpLocation + "/boobs/poses.html'> poses</a> " +
                     "<a href='" + httpLocation + "/boobs/shapes.html'> shapes</a> and " +
                     "<a href='" + httpLocation + "/boobs/sizes.html'> sizes</a> ";
                    colorClass = "classicColors";
                    bannerLogo = "/images/redballon.png";
                    homeLink = httpLocation;
                }
            }
            return "<div class='fixedHeader flexContainer " + colorClass + "' id='oggleBoobleHeader'>\n" +
                "<div class='bannerImageContainer' id='divTopLeftLogo'>\n" +
                    "<a href='" + homeLink + "'><img class='bannerImage' id='logo' src='" + bannerLogo + "'/></a>\n" +
                "</div>\n" +
                    "<div class='headerBodyContainer' id='largeFixedHeader'>\n" +
                        "<div id='headerTopRow'>\n" +
                            "<div class='headerTitle' id='bannerTitle'>OggleBooble2</div>\n" +
                            "<div class='headerSubTitle' id='headerSubTitle'>" + headerSubtitle + "</div>\n" +
                        "</div>\n" +
                        "<div class='flexContainer' id='headerBottomRow'>\n" +
                            "<div class='breadCrumbArea' id='breadcrumbContainer'>" + breadCrumbs + "</div>\n" +
                            "<div class='menuTabContainer' id='menuContainer'>\n" +
                                "<div class='floatLeft' id='dynamicOnly' style='display: none;'>\n" +
                                "<div class='menuTab floatLeft' id='replaceableMenuItems'>\n" +
                                    "<a href='/Admin/Blog'>Blog</a>\n" +
                                    "</div> \n" +
                                    "<div class='oggleHidden inline floatLeft' id='divPornEditor' style='display: block;'>\n" +
                                        "<div class='menuTab floatLeft'><a href='/Admin/Dashboard'>Admin</a></div>\n" +
                                    "</div>\n" +
                                "</div>\n" +
                                "<div class='oggleHidden inline floatRight' id='divLogedIn' style='display: none;'>\n" +
                                    "<div class='menuTab floatRight'><a href='javascript:logoutSimple()'>Log Out</a></div>\n" +
                                    "<div id='helloUser' title='modify profile' class='menuTab floatRight'><a href='javascript:profilePease()'>Hello  </a></div>\n" +
                                "</div>\n" +
                                "<div class='oggleHidden inline floatRight' id='divNotLogedIn' style='display: block;'>\n" +
                                    "<div class='menuTab floatRight' id='btnLayoutRegister'>\n" +
                                        "<a href='javascript:showRegisterDialog()'>Register</a>\n" +
                                        "<img class='btnSpinnerImage' id='btnHeaderRegisterSpinner' src='/images/loader.gif'/>\n" +
                                    "</div>\n" +
                                "<div class='menuTab floatRight' id='btnLayoutLogin'>\n" +
                                    "<a href='javascript:showLoginDialog()'>Log In</a>\n" +
                                    "<img class='btnSpinnerImage' id='btnHeaderLoginSpinner' src='/images/loader.gif'/>\n" +
                                "</div>\n" +
                            "</div>\n" +
                        "</div>\n" +
                    "</div>\n" +
                "</div>\n" +
            "</div>";
        }

        private string GalleryPageBodyHtml(int folderId, string rootFolder)
        {
            string bodyHtml = 
            "<div class='threeColumnArray'>\n" +
                "<div id='leftColumn'></div>\n" +
                "<div id='middleColumn'>\n" +
                    "<div id='divStatusMessage'></div>\n" +
                    "<div id='imageContainer' class='flexWrapContainer'>\n";

            string imageFolderFrame = "folderImageFrameName";
            if (rootFolder == "porn")
                imageFolderFrame = "pornFolderImageFrame";

            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                //  SUBFOLDERS
                List<VwDirTree> subDirs = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
                foreach (VwDirTree subDir in subDirs)
                {
                    int subDirFileCount = subDir.FileCount + subDir.TotalFiles + subDir.GrandTotalFiles;
                    bodyHtml += "<div class='folderImageOutterFrame'>" +
                        "<div class='folderImageFrame' onclick='window.location.href=\"" + subDir.FolderName + ".html\"'>" +
                        "<img class='folderImage' src='" + subDir.Link + "'/>" +
                        "<div class='"+ imageFolderFrame + "'>" + subDir.FolderName + " (" + subDirFileCount + ")</div></div></div>\n";
                }
                // IMAGES 
                //List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
                List<ImageLink> links = db.ImageLinks.Where(l => l.FolderLocation == folderId).OrderBy(l => l.Id).ToList();
                int idx = 0;
                foreach (ImageLink link in links)
                {
                    bodyHtml += "<div class='imageFrame'><img id='" + link.Id + "' class='thumbImage' " +
                         "oncontextmenu='ctxSAP()' onclick='imgClick(" + idx++ + ")' src='" + link.Link + "'/></div>\n";

                    //bodyHtml += "<div class='imageFrame'><img id='"+ link.Id + "'+ idx=" + idx +
                    //    "' oncontextmenu='ctxSAP(\"" + link.Id + "\")' onclick='imgClick(" + idx++ + ")' " +
                    //    " class='thumbImage' src='" + link.Link + "'/></div>\n";
                }
            }

            bodyHtml += 
                    "</div>\n"+
                    "<script>resizePage();</script>\n" +
                    "<div id='thumbImageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut();'>\n" +
                        "<div id='staticPagectxModelName' onclick='contextMenuActionShow()'>model name</div>\n" +
                        "<div id='ctxSeeMore' onclick='contextMenuActionJump()'>see more of her</div>\n" +
                        "<div onclick='contextMenuActionComment()'>comment</div>\n" +
                        "<div onclick='contextMenuActionExplode()'>explode</div>\n" +
                    "</div>\n" +
                "</div>\n" +
                "<div id='rightColumn'></div>\n" +
            "</div>";
            return bodyHtml;
        }

        private string ImageViewer()
        {
            return
             "\n<div id = 'imageViewerDialog' class='fullScreenViewer'>\n" +
               "<div id = 'viewerButtonsRow' class='imageViewerHeaderRow'>\n" +
                  "<div class='viewerButtonsRowSection'>\n" +
                    "<img id = 'imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='/images/comment.png' />" +
                  "</div>\n" +
                  "<span id = 'imageViewerHeaderTitle' class='imageViewerTitle'></span>" +
                  "<div class='viewerButtonsRowSection'>" +
                    "<div class='floatRight' style='margin-left: 44px;' onclick=\"$('#imageViewerDialog').effect('blind', {mode:'hide', direction:'vertical' }, 500); viewerShowing = 'false';\">" +
                      "<img src='/images/close.png' />" +
                    "</div>\n" +
                     "<div class='floatRight' onclick=\"runSlideShow('faster')\"><img id='fasterSlideshow' title='faster slideshow' src='/images/slideshowFaster.png' /></div>\n" +
                      "<div class='floatRight' onclick=\"runSlideShow('start')\"><img id='showSlideshow' title='start slideshow' src='/images/slideshow.png' /></div>\n" +
                      "<div class='floatRight' onclick=\"runSlideShow('slower')\"><img id='slowerSlideShow' title='slower slideshow' src='/images/slideshowSlower.png' /></div>\n" +
                     "<div class='floatRight' onclick=\"blowupImage()\"><img class='popoutBox' src='/images/expand02.png' /></div>\n" +
                  "</div>\n" +
               "</div>\n" +
               "<div id = 'leftClickArea' onclick='slide(\"prev\")' class='hiddeClickArea'></div>" +
               "<div id = 'rightClickArea' onclick='slide(\"next\")' class='hiddeClickArea'></div>\n" +
               "<div id = 'viewerImageContainer' class='expandoImageDiv'>\n" +
                "<img id = 'viewerImage' class='expandoImage'/>\n" +
               "</div>" +
             "</div>\n" +

            //staticPageContextMenu

            "<div id='imageViewerContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut();'>\n" +
                "<div id='ctxImageViewerModelName' onclick='imageViewerContextMenuAction(\"show\")'>model name</div>\n" +
                "<div id='ctxImageViewerSeeMore' onclick= 'imageViewerContextMenuAction(\"jump\")'>see more of her</div>\n" +
                "<div onclick='imageViewerContextMenuAction(\"comment\")'>Comment</div>\n" +
                "<div onclick='imageViewerContextMenuAction(\"explode\")'>Explode</div>\n" +
            "</div>\n";
        }

        private string CommentDialog()
        {
            return "\n<div id='imageCommentDialog' class='oggleHidden commentDialog' title='Write a fantasy about this image'>\n" +
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
            return "<div id='folderCategoryDialog' class='oggleHidden' title='' onmouseleave='considerClosingCategoryDialog()'>\n" +
            "    <div><textarea id='catDlgDescription' class='catDlgTextArea'></textarea></div>\n" +
            "</div>\n";
        }

        private string ModelInfoDialog()
        {
            return "<div id = 'modelInfoDialog' class='oggleHidden' onmouseleave='considerClosingModelInfoDialog()'>\n" +
                        "    <div id = 'modelInfoEditArea' class='oggleHidden'>\n" +
                        "        <div class='flexContainer'>\n" +
                        "            <div class='floatLeft'>\n" +
                        "                <label>name</label><input id = 'txtFolderName' class='roundedInput modelDialogInput inline' /><br />\n" +
                        "                <label>nationality</label><input id = 'txtNationality' class='roundedInput modelDialogInput inline' /><br />\n" +
                        "                <label>born</label><input id = 'txtBorn' class='roundedInput modelDialogInput inline' /><br />\n" +
                        "                <label>measurements</label><input id = 'txtMeasurements' class='roundedInput modelDialogInput inline' />\n" +
                        "            </div>\n" +
                        "            <div class='floatLeft'>\n" +
                        "                <img id = 'modelDialogThumbNailImage' src='/images/redballon.png' class='modelDialogImage' />\n" +
                        "            </div>\n" +
                        "        </div>\n" +
                        "        <label>comment</label>\n" +
                        "        <div><textarea id = 'txaModelComment' class='smallTextArea'></textarea></div>\n" +
                        "        <div class='hrefLabel'>href</div><input id = 'txtLinkHref' class='roundedInput inline' />\n" +
                        "        <div class='hrefLabel'>label</div><input id = 'txtLinkLabel' class='roundedInput' onblur='addHrefToExternalLinks()' />\n" +
                        "        <span class='addLinkIcon' onclick='addHrefToExternalLinks()'>+</span>\n" +
                        "        <div id = 'externalLinks' class='smallTextArea'></div>\n" +
                        "    </div>\n" +
                        "    <div id = 'modelInfoViewOnlyArea' class='oggleHidden'>\n" +
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
                              "<div><a href='/Home/Index'>Let Me Explain</a></div>\n" +
                              "<div onclick='showCatListDialog(242)'>Category List</div>\n" +
                              "<div><a href='" + httpLocation + "'>Oggle Booble</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='https://ogglebooble.com/Home/BoobsRanker'>Boobs Rater</a></div>\n" +
                              "<div><a href='/Home/ImagePage?folder=908'>Rejects</a></div>\n" +
                              "<div><a href='https://ogglebooble.com/Home/Videos'>Nasty Videos</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
                              "<div><a href='https://ogglebooble.com/Admin/Blog'>Blog</a></div>\n" +
                              "<div><a href='" + httpLocation + "/sluts/sluts.html'>Archive</a></div>\n" +
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
                            "<div><a href='" + httpLocation + "/porn.html'>Nasty Porn</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='https://ogglebooble.com/Home/BoobsRanker'>Boobs Rater</a></div>\n" +
                              "<div id='Rejects'></div>\n" +
                              "<div><a href='" + httpLocation + "/playboy/playboy.html'>Centerfolds</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
                              "<div><a href='https://ogglebooble.com/Admin/Blog'>Blog</a></div>\n" +
                              "<div><a href='" + httpLocation + "/archive/archive.html'>Archive</a></div>\n" +
                          "</div>\n" +
                    "</div>\n" +
                    "<div class='footerVersionMessage'>built " + DateTime.Now.ToShortDateString() + "</div>\n" +
                    "<div class='footerFooter'>" +
                          "<div id='footerMessage'></div>" +
                          "<div id='copyright'>&copy; 2019 - <a href='/IntelDsgn/Index'>Intelligent Design SoftWare</a></div>" +
                    "</div>\n" +
                "</footer>";
        }

        private string RegisterDialog()
        {
            return
            "<div id='registerUserDialog' class='oggleHidden'>\n" +
            "    <div class='dialogHeader'>\n" +
            "        welcome to<span>OggleBooble</span>\n" +
            "        <div id = 'btnClose' class='divCloseButton'>\n" +
            "            <img height = '19' src='/images/powerOffRed01.png'/>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "    <div class='registerUserDialogCrudContainer'>\n" +
            "        <div style = 'clear:both' ></div>\n" +
            "        <div id='errUserName' class='validationError'>Required</div>\n" +
            "        <label>user name</label><br>\n" +
            "        <input id = 'txtUserName' type='text' class='roundedInput' placeholder='your go by name'><br>\n" +
            "        <div id = 'errPassword' class='validationError'>Required</div>\n" +
            "        <label>password</label><br>\n" +
            "        <input id = 'clearPassword' type='password' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
            "        <label>retype password</label><br>\n" +
            "        <input id = 'clearPasswordRetype' type= 'password' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
            "        <div id = 'divRememberMe' >\n" +
            "            <input id='ckRememberMe' type='checkbox' checked='checked' />Remember Me ?  (<span>uses a cookie</span>)\n" +
            "        </div>\n" +
            "        <div id = 'divShowDetails'>Extra Details\n" +
            "            <div class='divCloseButton'>\n" +
            "                <img id='upDownCaret' height='19' src='/images/caretDown.png' />\n" +
            "            </div>\n" +
            "        </div>\n" +
            "        <div id='divExtraDetails'>\n" +
            "            <label>Email(not required) </label>\n" +
            "            <input id='txtEmail' type='email' class='roundedInput' placeholder='you@example.org'><br>\n" +
            "            <label>FirstName(not required)</label>\n" +
            "            <input id='txtFirstName' type='text' class='roundedInput'><br>\n" +
            "            <label>Last Name(not required)</label>\n" +
            "            <input id='txtLastName' type='text' class='roundedInput'><br>\n" +
            "            <label>Phone Number(not required)</label>\n" +
            "            <input id='txtPhone' type='tel' class='roundedInput'><br>\n" +
            "            <label>Pin(not required)</label>\n" +
            "            <input id='txtPin' type='text' class='roundedInput' placeholder='you may use this in place of your password'><br>\n" +
            "        </div>\n" +
            "        <button class='roundendButton' style='float:right; margin-bottom:6px;' id='btnRegister'>Submit</button>\n" +
            "    </div>\n" +
            "</div>\n";
        }

        private string LoginDialog() {
            return
            "<div id='loginDialog' title='Log In to <span>OggleBooble</span>'>\n" +
            //"    <div id='divStatusMessage'></div>\n" +
            //"    <div class='dialogHeader'>\n" +
            //"        Log In to <span>OggleBooble</span>\n" +
            //"        <div onclick='$(\"#loginDialog\").hide();' class='dialogCloseButton'>\n" +
            //"            <img height='19' src='/images/powerOffRed01.png' />\n" +
            //"        </div>\n" +
            //"    </div>\n" +
            "    <div class='dialogBody'>\n" +
            "        <div id='errSummary' class='validationError'></div>\n" +
            "        <div id='errUserName' class='validationError'>Required</div>\n" +
            "        <label>User Name</label><br>\n" +

            "        <input id='txtLoginUserName' class='roundedInput'><br>\n" +

            "        <div id='errPassword' class='validationError'>Required</div>\n" +
            "        <label>Password</label><br>\n" +
            "        <input id='clearPassword' type='password' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
            "        <button id='btnLoginPopupLogin' class='roundendButton' onclick='postLogin()'>\n" +
            "            <img id='btnLoginSpinnerImage' class='btnSpinnerImage' src='/images/loader.gif' />\n" +
            "            Log in\n" +
            "        </button>\n" +
            "        <div class='ckRemember'>\n" +
            "            <input id='ckRememberMe' type='checkbox' checked='checked' />  Remember Me ?  (<span>uses a cookie</span>)\n" +
            "        </div>\n" +
            "        <div class='forgot'>\n" +
            "            <a id='forgot-pw' href='/users/account-recovery'>forgot password ?</a>\n" +
            "        </div>\n" +

            "        <div>\n" +
            "            <div class='clickable inline' onclick='transferToRegisterPopup()'>Register</div>\n" +
            "            <div onclick='$(\"#loginDialog\").hide();' class='clickable inline'>Cancel</div>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "    <div style='clear:both'></div>\n" +
            //"    <div class='or-container'>\n" +
            //"        <hr class='or-hr' />\n" +
            "        <div class='or'>or</div>\n" +
            //"    </div>\n" +
            //"    <div>\n" +
            "        <div class='externalLogin'>\n" +
            "            <div class='fb-login-button' data-max-rows='1' data-size='medium' data-button-type='login_with'\n" +
            "                 data-show-faces='false' data-auto-logout-link='false' data-use-continue-as='false'\n" +
            "                 scope='public_profile,email' onlogin='checkFaceBookLoginState();'>\n" +
            //"                login with facebook\n" +
            "            </div>\n" +
            "            <FB:login-button scope='public_profile,email' onlogin='checkFaceBookLoginState();'>\n" +
            "                    <svg class='svg-icon iconFacebook' width='18' height='18' viewBox='0 0 18 18'>\n" +
            "                        <path d='M1.88 1C1.4 1 1 1.4 1 1.88v14.24c0 .48.4.88.88.88h7.67v-6.2H7.46V8.4h2.09V6.61c0-2.07 1.26-3.2 3.1-3.2.88 0 1.64.07 1.87.1v2.16h-1.29c-1 0-1.19.48-1.19 1.18V8.4h2.39l-.31 2.42h-2.08V17h4.08c.48 0 .88-.4.88-.88V1.88c0-.48-.4-.88-.88-.88H1.88z' fill='#3C5A96'></path>\n" +
            "                    </svg>\n" +
            "                    Facebook\n" +
            "                </FB:login-button>\n" +
            "        </div>\n" +
            "        <div class='externalLogin google-login' data-provider='google' data-oauthserver='https://accounts.google.com/o/oauth2/auth' data-oauthversion='2.0'>\n" +
            "            <svg aria-hidden='true' class='svg-icon native iconGoogle' width='18' height='18' viewBox='0 0 18 18'>\n" +
            "                <g>\n" +
            "                    <path d='M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z' fill='#4285F4'></path>\n" +
            "                    <path d='M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z' fill='#34A853'></path>\n" +
            "                    <path d='M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z' fill='#FBBC05'></path>\n" +
            "                    <path d='M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z' fill='#EA4335'></path>\n" +
            "                </g>\n" +
            "            </svg>\n" +
            "            Google\n" +
            "        </div>\n" +
            "    </div>\n" +
            "</div>\n";


        }

        private string IndexPageHtml()
        {
            return "<div class='threeColumnArray'>\n" +
                "    <div id='leftColumn'>\n" +
                "        <div class='leftColumnList'>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Home/Transitions?folder=boobs\"'>Transitions</div>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Home/BoobsRanker\"'>Boobs Rater</div>\n" +
                "            <div onclick='showCustomMessage(38)'>Let me Explain</div>\n" +
                "            <div onclick='showCatListDialog(2)'>Category List</div>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Admin/Blog\"'>Blog</div>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Home/Mobile?folder=boobs\"'>Mobile</div>\n" +
                "            <div onclick='showCustomMessage(35)'>Nasty Porn</div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <div id='middleColumn'>\n" +
                "        <div id='customMessage' class='oggleHidden customMessageContainer'></div>\n" +
                "        <div id='staticCatTreeContainer' class='oggleHidden categoryListContainer' title='boob folders'></div>" +
                "        <div id='divStatusMessage'></div>\n" +
                "        <div class='flexContainer'>\n" +
                //"            <div class='floatLeft'>\n" +
                //"                <div class='galleryCheckBox'><input type='checkbox' onchange=\"loadImages(\'playboy\', $(this).is(\':checked\'), 50000)\" /> Include Centerfolds</div>\n" +
                //"                <div class='galleryCheckBox'><input type='checkbox' onchange=\"loadImages(\'archive\', $(this).is(\':checked\'), 50000)\" /> Include Archive</div>\n" +
                //"            </div>\n" +
                "            <div class='floatLeft'>\n" +
                "               <div class='centeredDivShell randomImageContainer'>\n" +
                "                   <div class='centeredDivInner'>\n" +
                "                       <div id='categoryTitle' class='floatingLabel' onmouseover='slowlyShowFolderCategoryDialog();" +
                "                           forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;'></div>\n" +
                "                       <div id='laCarousel' class='carouselContainer'>\n" +
                "                           <div id='laCarouselImageContainer' class='carouselImageContainer'>\n" +
                "                               <img class='carouselImage' oncontextmenu='showContextMenu()' src='/images/ingranaggi3.gif'/>\n" +
                "                           </div>\n" +
                "                           <div class='imgBottom'>\n" +
                "                                    <img class='speedButton floatLeft' src='/images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
                "                                    <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
                "                                    <div id='categoryLabel' class='carouselCategoryLabel' onclick='clickViewParentGallery()'></div>\n" +
                "                                    <img class='speedButton floatRight' src='/images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
                "                           </div>\n" +
                "                       </div>\n" +
                "                   </div>\n" +
                "               </div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <div id='rightColumn'></div>\n" +
                "</div>\n" +
                "<div id='promoContainer' class='ogglePromoContainer' onclick='killPromoMessages()'>\n" +
                "    <div id='promoContainerTitle' class='ogglePromoTitle'></div>\n" +
                "    <div id='promoContainerText' class='ogglePromoText'></div>\n" +
                "</div>\n" +
                "<div id='carouselContextMenu' class='ogContextMenu' onmouseleave='considerHidingContextMenu()'>\n" +
                "    <div id='ctxModelName' onclick='carouselContextMenuAction(\"showDialog\")'>model name</div>\n" +
                "    <div id='ctxSeeMore' onclick='carouselContextMenuAction(\"seeMore\")'>See More</div>\n" +
                "    <div onclick='carouselContextMenuAction(\"explode\")'>Explode</div>\n" +
                "    <div onclick='carouselContextMenuAction(\"comment\")'>Comment</div>\n" +
                "    <div onclick='carouselContextMenuAction(\"tags\")'>Tags</div>\n" +
                "    <div id='ctxMove' onclick='carouselContextMenuAction(\"archive\")'>Archive</div>\n" +
                "</div>\n";
        }

        private string PornIndexPageHtml()
        {
            return "<div class='threeColumnArray'>\n" +
                "    <div id='leftColumn'>\n" +
                "        <div class='leftColumnList'>\n" +
                "            <div onclick='window.location.href=\"" + httpLocation + "\"'>OggleBooble</div>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Home/Transitions?folder=porn\"'>Transitions</div>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Home/BoobsRanker\"'>Boobs Rater</div>\n" +
                "            <div onclick='showCatListDialog(242)'>Category List</div>\n" +
                "            <div onclick='window.location.href=\"https://ogglebooble.com/Home/Videos\"'>Videos</div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <div id='middleColumn'>\n" +
                "        <div id='customMessage' class='oggleHidden customMessageContainer'></div>\n" +
                "        <div id='staticCatTreeContainer' class='oggleHidden categoryListContainer' title='porn folders'></div>" +
                "        <div id='divStatusMessage'></div>\n" +
                "        <div class='flexContainer'>\n" +
                "            <div class='floatLeft'>\n" +
                "                <div class='galleryCheckBox'><input type='checkbox' onchange=\"loadImages(\'sluts\', $(this).is(\':checked\'), 50000)\" /> Include Archive</div>\n" +
                "            </div>\n" +
                "            <div class='floatLeft'>\n" +
                "               <div class='centeredDivShell randomImageContainer'>\n" +
                "                   <div class='centeredDivInner'>\n" +
                "                       <div id='categoryTitle' class='floatingLabel' onmouseover='slowlyShowFolderCategoryDialog();" +
                "                           forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;'></div>\n" +
                "                       <div id='laCarousel' class='carouselContainer'>\n" +
                "                           <div id='laCarouselImageContainer' class='carouselImageContainer'>\n" +
                "                               <img class='carouselImage' src='/images/ingranaggi3.gif' />\n" +
                "                           </div>\n" +
                "                           <div class='imgBottom'>\n" +
                "                                    <img class='speedButton floatLeft' src='/images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
                "                                    <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
                "                                    <div id='categoryLabel' class='carouselCategoryLabel' onclick='clickViewParentGallery()'></div>\n" +
                "                                    <img class='speedButton floatRight' src='/images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
                "                           </div>\n" +
                "                       </div>\n" +
                "                   </div>\n" +
                "               </div>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <div id='rightColumn'></div>\n" +
                "</div>\n";
        }

        [HttpGet]
        public string CreateIndexPage(string rootFolder, string userName, string pageTitle, int metaTagFolderId)
        {
            string success = "";
            try
            {
                StringBuilder hardcodedImages = new StringBuilder("<div id='hardcodedImagesContainer' class='oggleHidden'>");
                List<VwLink> vwLinks = null;
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    vwLinks = db.VwLinks.Where(l => l.RootFolder == rootFolder).OrderBy(l => l.LinkId).Take(initialTake).ToList();
                }
                for (int i = 0; i < vwLinks.Count; i++)
                {
                    hardcodedImages.Append("<img id='image" + i + "' folderName='" + vwLinks[i].FolderName + "' rootFolder='" + vwLinks[i].RootFolder
                        + "' folderId='" + vwLinks[i].FolderId + "' parentName='" + vwLinks[i].ParentName + "' linkId='" + vwLinks[i].LinkId + "' src='" + vwLinks[i].Link + "'/>\n");
                }
                hardcodedImages.Append("</div>");

                timer.Stop();
                System.Diagnostics.Debug.WriteLine("get VwLinks took: " + timer.Elapsed);

                string staticContent =
                    "<!DOCTYPE html>\n<html>\n" + HeadHtml(metaTagFolderId, "Welcome") +
                    "\n<body style='margin-top:105px'>\n" + HeaderHtml(metaTagFolderId);

                if (rootFolder == "boobs")
                    staticContent += IndexPageHtml();
                else
                    staticContent += PornIndexPageHtml();

                staticContent += 
                    "<script>var staticPageFolderId=" + metaTagFolderId + "; var staticPageRootFolder='" + rootFolder + "'; " +
                    "var staticPageCurrentUser ='" + userName + "'; </script>\n" +
                    "<script src='/scripts/staticIndexPage.js'></script>\n" +
                    hardcodedImages.ToString() +
                    LoginDialog() + RegisterDialog() + FooterHtml(rootFolder)+
                    "<script src='/scripts/StaticPage.js'></script>\n</body>\n</html>";

                success = WriteFileToDisk(staticContent, "", pageTitle);
            }
            catch (Exception ex) { success = Helpers.ErrorDetails(ex); }
            return success;
        }

        [HttpPut]
        public List<VwLink> AddMoreImages(string rootFolder, int skip, int take)
        {
            //StringBuilder sb = new StringBuilder("<div class='oggleHidden'>");
            List<VwLink> vwLinks = null;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                vwLinks = db.VwLinks.Where(l => l.RootFolder == rootFolder).OrderBy(l => l.LinkId).Skip(skip).Take(take).ToList();
            }
            return vwLinks;
        }

        [HttpGet]
        public int GetImageCount(string rootFolder)
        {
            int totalRows = 0;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                totalRows = db.VwLinks.Where(l => l.RootFolder == rootFolder).Count();
            }
            return totalRows;
        }

        [HttpGet]
        public string StaticPageGetIPAddress()
        {
            String address = "";
            WebRequest request = WebRequest.Create("http://checkip.dyndns.org/");
            using (WebResponse response = request.GetResponse())
            {
                using (var stream = new System.IO.StreamReader(response.GetResponseStream()))
                {
                    address = stream.ReadToEnd();
                }
                int first = address.IndexOf("Address: ") + 9;
                int last = address.LastIndexOf("</body>");
                address = address.Substring(first, last - first);

                return address;
            }
        }
    }
}

