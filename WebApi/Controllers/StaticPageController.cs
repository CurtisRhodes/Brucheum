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
                    "\n<body style='margin-top:105px'>\n" +
                    HeaderHtml(folderId) +
                    GalleryPageBodyHtml(folderId, rootFolder) +
                    CommentDialog() + CategoryDialog() + ModelInfoDialog() +
                    "<div id='staticCatTreeContainer' class='displayHidden categoryListContainer' title=" + rootFolder + "></div>" +
                    "<script>var staticPageFolderId=" + folderId + "; " +
                    "var staticPageFolderName='" + folderName + "'; " +
                    "var staticPageImagesCount='" + imagesCount + "'; " +
                    "var currentFolderRoot='" + rootFolder + "';</script>\n" +
                    Slideshow() + LoginDialog() + RegisterDialog() + FooterHtml(rootFolder) +
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

        private BreadCrumbModel GetBreadCrumbs(int folderId)
        {
            BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
            try
            {
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
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
                    string breadCrumbs = "";
                    string staticPageFileName = "";
                    int breadCrumbModelCount = breadCrumbModel.BreadCrumbs.Count;
                    for (int i = breadCrumbModelCount - 1; i >= 0; i--)
                    {
                        if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder)
                        {
                            //function showHomeFolderInfoDialog(index, folderName, folderId, rootFolder)
                            breadCrumbs += "<a class='inactiveBreadCrumb' " +
                            "onclick='showHomeFolderInfoDialog(\"" + (breadCrumbModelCount - i) + "\",\"" + staticPageFileName + "\",\"" +
                            breadCrumbModel.BreadCrumbs[i].FolderId + "\",\"" + breadCrumbModel.RootFolder + "\")'>" +
                            breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") + "</a>";
                        }
                        else
                        {
                            // a woman commited suicide when pictures of her "came out"
                            staticPageFileName = httpLocation + breadCrumbModel.RootFolder + "/" + 
                               Helpers.GetCustomStaticFolderName(breadCrumbModel.BreadCrumbs[i].FolderId, breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "")) + ".html";

                            breadCrumbs += "<a class='activeBreadCrumb' " + "href='" + staticPageFileName + "'>" +
                             breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") + "</a>\n";
                        }
                    }
                    breadCrumbModel.Html = breadCrumbs;
                    breadCrumbModel.Success = "ok";
                }
            }
            catch (Exception ex)
            {
                breadCrumbModel.Success = Helpers.ErrorDetails(ex);
            }
            return breadCrumbModel;
        }

        private string HeaderHtml(int folderId)
        {
            BreadCrumbModel breadCrumbModel = GetBreadCrumbs(folderId);
            string headerSubtitle = "";
            string colorClass = "";
            string bannerLogo = "";
            string homeLink = "";
            //string rootFolder = "";

            if (breadCrumbModel.RootFolder == "porn" || breadCrumbModel.RootFolder == "sluts")
            {
                headerSubtitle = "<a href='" + httpLocation + "porn/cock suckers.html'> blowjobs </a>," +
                "<a href='" + httpLocation + "porn/cum shots.html'> cum shots</a>," +
                "<a href='" + httpLocation + "porn/kinky.html'> kinky </a>, and other" +
                "<a href='" + httpLocation + "porn/naughty.html'> naughty behavior</a> categorized";
                colorClass = "pornColors";
                bannerLogo = "/images/csLips02.png";
                //homeLink = "" + httpLocation + "/porn.html";
                homeLink = "/index.html?subdomain=porn";
            }
                else
            {
                headerSubtitle = "<a href='" + httpLocation + "boobs/boobs.html'>big tits</a> organized by " +
                 "<a href='" + httpLocation + "boobs/poses.html'>poses</a>, " +
                 "<a href='" + httpLocation + "boobs/nice tits.html'>topic</a>, " +
                 "<a href='" + httpLocation + "boobs/shapes.html'>shapes</a> and " +
                 "<a href='" + httpLocation + "boobs/sizes.html'>sizes</a>";
                colorClass = "classicColors";
                bannerLogo = "/images/redballon.png";
                homeLink = "/";
            }

            return
                "<header class='" + colorClass + "'>\n" +
                "    <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
                "        <a href='" + homeLink + "'><img class='bannerImage' id='logo' src='" + bannerLogo + "'/></a>\n" +
                "    </div>\n" +
                "    <div class='headerBodyContainer'>\n" +
                "        <div class='headerTopRow'>\n" +
                "            <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
                "            <div class='headerSubTitle' id='headerSubTitle'>" + headerSubtitle + "</div>\n" +
                "            <div class='headerSubTitle' id='headerSubTitle'>\n</div>\n" +
                "        </div>\n" +
                "        <div class='headerBottomRow'>\n" +
                "            <div id='headerMessage' class='floatLeft'></div>\n" +
                "            <div id='breadcrumbContainer' class='breadCrumbArea'>" + breadCrumbModel.Html + "</div>\n" +
                "            <div class='menuTabs replaceableMenuItems'>\n" +
                "            </div>\n" +
                //"            <div id='optionLoggedIn' class='displayHidden'>\n" +
                //"                <div class='menuTab floatRight'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
                //"                <div class='menuTab floatRight' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
                //"            </div>\n" +
                //"            <div id='optionNotLoggedIn'>\n" +
                //"                <div id='btnLayoutRegister' class='menuTab floatRight'><a href='javascript:onRegisterClick()'>Register</a></div>\n" +
                //"                <div id='btnLayoutLogin' class='menuTab floatRight'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
                //"            </div>\n" +
                //"            <div class='menuTabs displayHidden' id='adminTabs'>\n" +
                //"              <div id='menuTabUpload' class='menuTab displayHidden loginRequired floatRight'><a href='/Upload.html'>Upload</a></div>\n" +
                //"              <div id='menuTabAdmin' class='menuTab  displayHidden loginRequired floatRight'><a href='/Admin.html'>Admin</a></div>\n" +
                //"            </div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</header>\n";
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
                List<VwDirTree> subDirs = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.FolderName).ToList();
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

        private string RegisterDialog()
        {
            return
            "<div id='registerUserDialog' class='displayHidden'>\n" +
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
                "<div id = 'loginDialog' class='modalDialog' title='Log In to OggleBooble'>\n" +
                "    <div class='dialogBody'>\n" +
                "        <div id = 'loginValidationSummary' class='validationError'></div>\n" +
                "        <div id = 'errLoginUserName' class='validationError'>Required</div>\n" +
                "        <label>User Name</label><br>\n" +
                "        <input id = 'txtLoginUserName' class='roundedInput'><br>\n" +
                "        <div id = 'errLoginPassword' class='validationError'>Required</div>\n" +
                "        <label>Password</label><br>\n" +
                "        <input id = 'txtLoginClearPassword' type='password' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
                "        <button id = 'btnLoginPopupLogin' class='roundendButton' onclick='postLogin()'>\n" +
                "            <img id = 'btnLoginSpinnerImage' class='btnSpinnerImage' src='/images/loader.gif' />\n" +
                "            Log in\n" +
                "        </button>\n" +
                "        <div class='ckRemember'>\n" +
                "            <input id = 'ckRememberMe' type='checkbox' checked='checked' />  Remember Me ?  (<span>uses a cookie</span>)\n" +
                "        </div>\n" +
                "        <div class='forgot'>\n" +
                "            <a id = 'forgot-pw' href='/users/account-recovery'>forgot password ?</a>\n" +
                "        </div>\n" +
                "        <div>\n" +
                "            <div class='clickable inline' onclick='transferToRegisterPopup()'>Register</div>\n" +
                "            <div onclick = '$(\"#loginDialog\").dialog(\"close\");' class='clickable inline'>Cancel</div>\n" +
                "        </div>\n" +
                "        <div class='or'>or</div>\n" +
                "        <div class='externalLogin'>\n" +
                "            <div class='fb-login-button' data-max-rows='1' data-size='medium' data-button-type='login_with'\n" +
                "                 data-show-faces='false' data-auto-logout-link='false' data-use-continue-as='false'\n" +
                "                 scope='public_profile,email' onlogin='checkFaceBookLoginState();'>\n" +
                "            </div>\n" +
                "            <FB:login-button scope = 'public_profile,email' onlogin='checkFaceBookLoginState();'>\n" +
                "                <svg class='svg-icon iconFacebook' width='18' height='18' viewBox='0 0 18 18'>\n" +
                "                    <path d = 'M1.88 1C1.4 1 1 1.4 1 1.88v14.24c0 .48.4.88.88.88h7.67v-6.2H7.46V8.4h2.09V6.61c0-2.07 1.26-3.2 3.1-3.2.88 0 1.64.07 1.87.1v2.16h-1.29c-1 0-1.19.48-1.19 1.18V8.4h2.39l-.31 2.42h-2.08V17h4.08c.48 0 .88-.4.88-.88V1.88c0-.48-.4-.88-.88-.88H1.88z' fill='#3C5A96'></path>\n" +
                "                </svg>\n" +
                "                Facebook\n" +
                "            </FB:login-button>\n" +
                "        </div>\n" +
                "        <div class='externalLogin google-login' data-provider='google' data-oauthserver='https://accounts.google.com/o/oauth2/auth' data-oauthversion='2.0'>\n" +
                "            <svg aria-hidden='true' class='svg-icon native iconGoogle' width='18' height='18' viewBox='0 0 18 18'>\n" +
                "                <g>\n" +
                "                    <path d = 'M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z' fill='#4285F4'></path>\n" +
                "                    <path d = 'M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z' fill='#34A853'></path>\n" +
                "                    <path d = 'M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z' fill='#FBBC05'></path>\n" +
                "                    <path d = 'M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z' fill='#EA4335'></path>\n" +
                "                </g>\n" +
                "            </svg>\n" +
                "            Google\n" +
                "        </div>\n" +
                "    </div>\n" +
                "</div>\n";
        }
        
        [HttpPut]
        public List<VwLink> AddMoreImages(string rootFolder, int skip, int take)
        {
            //StringBuilder sb = new StringBuilder("<div class='displayHidden'>");
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

