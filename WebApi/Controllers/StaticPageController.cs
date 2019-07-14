using System;
using System.Collections.Generic;
using System.Configuration;
using System.Drawing;
using System.Linq;
using System.Net;
using System.Net.Http;
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
        private readonly string ftpHost = ConfigurationManager.AppSettings["ftpHost"];
        private readonly string ftpUserName = ConfigurationManager.AppSettings["ftpUserName"];
        private readonly string ftpPassword = ConfigurationManager.AppSettings["ftpPassword"];
        private int totalFiles = 0;
        private int filesProcessed = 0;

        [HttpGet]
        public string Build(int parentFolder, string userName, string service)
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
                        success = ProcessFolder(parentFolder, categoryFolder.RootFolder, folderName, userName, db, service);
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
                string ftpPath = ftpHost + "/pages.OGGLEBOOBLE.COM/";
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

        private string ProcessFolder(int folderId, string rootFolder, string folderName, string userName, OggleBoobleContext db, string service)
        {
            string success = "";
            try
            {
                SignalRHost.ProgressHub.PostToClient("Creating static files: " + folderName + ".html");
                string pageTitle = folderName;
                if (folderName.LastIndexOf('/') > 0)
                {
                    pageTitle = folderName.Substring(folderName.LastIndexOf('/') + 1);
                }

                string staticContent =
                    "<!DOCTYPE html>\n<html>\n" + HeadHtml(folderId, pageTitle) +
                    "\n<body style='margin-top:105px'>\n" +
                    HeaderHtml(folderId) +
                    BodyHtml(folderId, rootFolder, userName) + CommentDialog() + CategoryDialog() + ModelInfoDialog() +
                    "<div id='staticCatTreeContainer' class='oggleHidden categoryListContainer' title=" + rootFolder + "></div>" +
                    "<script>var staticPageFolderId=" + folderId + "; var staticPageFolderName='" + folderName + "' var service='" + service + "'; " +
                    "var staticPageRootFolder='" + rootFolder + "'; var staticPageCurrentUser ='" + userName + "'; </script>\n" +
                    "<script src='http://pages.ogglebooble.com/script/staticPage.js'></script>\n" +
                    "<script> $(document).ready(function () { window.addEventListener('resize', resizeStaticPage);resizeStaticPage();loadImageLinks()});</script>\n" +
                    ImageViewer() + RegisterDialog() + FooterHtml(rootFolder) + "\n</body>\n</html>";

                success = WriteFileToDisk(staticContent, rootFolder, pageTitle);
                if (success == "ok")
                {
                    List<CategoryFolder> categoryFolders = db.CategoryFolders.Where(f => f.Parent == folderId).ToList();
                    foreach (CategoryFolder dbCategoryFolder in categoryFolders)
                    {
                        VwDirTree vwDirTree = db.VwDirTrees.Where(v => v.Id == dbCategoryFolder.Id).First();
                        //filesProcessed += Math.Max(vwDirTree.TotalFiles, vwDirTree.FileCount);
                        filesProcessed += vwDirTree.FileCount;
                        SignalRHost.ProgressHub.ShowProgressBar(totalFiles, filesProcessed);

                        ProcessFolder(dbCategoryFolder.Id, rootFolder, dbCategoryFolder.RootFolder + "/" + dbCategoryFolder.FolderName, userName, db, service);
                    }
                }
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
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
                "   <script src='https://code.jquery.com/jquery-latest.min.js' type='text/javascript'></script>\n" +
                "   <script src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js' type='text/javascript'></script>\n" +
                "   <script src='https://code.jquery.com/jquery-latest.min.js' type='text/javascript'></script>\n" +
                "   <script src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js' type='text/javascript'></script>\n" +
                "   <link href='https://netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.css' rel='stylesheet'>\n" +
                "   <script src='https://netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.js'></script>\n" +
                "   <link href='https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote.css' rel='stylesheet'>\n" +
                "   <script src='https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote.js'></script>\n" +
                "   <link href='http://pages.ogglebooble.com/css/jqueryui.css' rel='stylesheet' />\n" +
                "   <link rel='icon' type='image/png' href='pages.ogglebooble.com/images/favicon.png' />" +
                "   <script src='http://pages.ogglebooble.com/script/GlobalFunctions.js' type='text/javascript'></script>\n" +
                "   <script src='http://pages.ogglebooble.com/script/ResizeThreeColumnPage.js' type='text/javascript'></script>\n" +
                "   <script src='http://pages.ogglebooble.com/script/ImageViewer.js' type='text/javascript'></script>\n" +
                "   <script src='http://pages.ogglebooble.com/script/CommentDialog.js' type='text/javascript'></script>\n" +
                "   <script src='http://pages.ogglebooble.com/script/CategoryDialog.js' type='text/javascript'></script>\n" +
                "   <script src='http://pages.ogglebooble.com/script/ModelInfoDialog.js' type='text/javascript'></script>\n" +
                "   <script src='http://pages.ogglebooble.com/script/DirTree.js'></script>\n" +
                "   <link href='http://pages.ogglebooble.com/css/default.css'     rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/fixedHeader.css' rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/imageViewer.css' rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/categoryDialog.css' rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/carousel.css' rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/modelInfoDialog.css' rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/footer.css'      rel='stylesheet'/>\n" +
                "   <link href='http://pages.ogglebooble.com/css/ImagePage.css'   rel='stylesheet'/>\n" +
                "   <title>" + pageName + " - OggleBooble</title>" +
                "   <meta name='Title' content='" + pageName + "' property='og:title'/>\n" +
                "   <meta name='description' content='" + Uri.EscapeUriString(metaTagResults.Description) + "'/>\n" +
                "   <meta property='og:type' content='website' />\n" +
                "   <meta property='og:url' content='https://pages.OggleBooble.com/" + pageName + ".html'/>\n" +
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
            BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                string root = thisFolder.RootFolder;
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
                    headerSubtitle = "<a href='http://pages.ogglebooble.com/porn/cock suckers.html'> blowjobs </a>," +
                    "<a href='http://pages.ogglebooble.com/porn/cum shots.html'> cum shots</a>," +
                    "<a href='http://pages.ogglebooble.com/porn/kinky.html'> kinky </ a >, and other" +
                    "<a href='http://pages.ogglebooble.com/porn/naughty.html'> naughty behavior</a> categorized";
                    colorClass = "pornColors";
                    bannerLogo = "http://pages.ogglebooble.com/images/csLips02.png";
                    homeLink = "http://pages.ogglebooble.com/porn.html";
                }
                else
                {
                    headerSubtitle = "<a href='http://pages.ogglebooble.com/boobs/boobs.html'>big tits</a> and " +
                     "<a href='http://pages.ogglebooble.com/boobs/nice ass.html'>ass</a> organized by" +
                     "<a href='http://pages.ogglebooble.com/boobs/poses.html'> poses</a> " +
                     "<a href='http://pages.ogglebooble.com/boobs/shapes.html'> shapes</a> and " +
                     "<a href='http://pages.ogglebooble.com/boobs/sizes.html'> sizes</a> ";
                    colorClass = "classicColors";
                    bannerLogo = "http://pages.ogglebooble.com/images/redballon.png";
                    homeLink = "http://pages.ogglebooble.com/";
                }
            }
            return "<div class='fixedHeader flexContainer " + colorClass + "' id='oggleBoobleHeader'>\n" +
                "<div class='bannerImageContainer' id='divTopLeftLogo'>\n" +
                    "<a href='" + homeLink + "'><img class='bannerImage' id='logo' src='" + bannerLogo + "'/></a>\n" +
                "</div>\n" +
                    "<div class='headerBodyContainer' id='largeFixedHeader'>\n" +
                        "<div id='headerTopRow'>\n" +
                            "<div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
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
                                    "<div class='menuTab floatRight'><a href='javascript:logoutPlease()'>Log Out</a></div>\n" +
                                    "<div title='modify profile' class='menuTab floatRight'><a href='javascript:profilePease()'>Hello  </a></div>\n" +
                                "</div>\n" +
                                "<div class='oggleHidden inline floatRight' id='divNotLogedIn' style='display: block;'>\n" +
                                    "<div class='menuTab floatRight' id='btnLayoutRegister'>\n" +
                                        "<a href='javascript:staticPageShowRegisterDialog()'>Register</a>\n" +
                                        "<img class='btnSpinnerImage' id='btnHeaderRegisterSpinner' src='http://pages.ogglebooble.com/images/loader.gif'/>\n" +
                                    "</div>\n" +
                                "<div class='menuTab floatRight' id='btnLayoutLogin'>\n" +
                                    "<a href='javascript:loginPlease()'>Log In</a>\n" +
                                    "<img class='btnSpinnerImage' id='btnHeaderLoginSpinner' src='http://pages.ogglebooble.com/images/loader.gif'/>\n" +
                                "</div>\n" +
                            "</div>\n" +
                        "</div>\n" +
                    "</div>\n" +
                "</div>\n" +
            "</div>";
        }

        private string BodyHtml(int folderId, string rootFolder, string currentUser)
        {
            string bodyHtml = 
            "<div class='threeColumnArray'>\n" +
                "<div id='leftColumn'></div>\n" +
                "<div id='middleColumn'>\n" +
                    "<div id='divStatusMessage'></div>\n" +
                    "<div id='imageContainer' class='flexWrapContainer'>\n";

            var idx = 0;
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
                                "<div class='folderImageFrameName'>" + subDir.FolderName + " (" + subDirFileCount + ")</div></div></div>\n";
                }
                // IMAGES 
                List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).ToList();
                foreach (VwLink vwLink in vwLinks)
                {
                    bodyHtml += "<div class='imageFrame'><img id='" + vwLink.LinkId + "' idx='" + idx +
                        "' oncontextmenu='staticPageContextMenu(\"" + vwLink.LinkId + "\",\"" + vwLink.Link + "\")' " +
                        " onclick='imgClick(\"" + idx + "\")' " +
                        " class='thumbImage' src='" + vwLink.Link + "'/></div>\n";
                    idx++;
                }
            }

            bodyHtml += 
                    "</div>\n"+
                    "<script>resizePage();</script>\n" +
                    "<div id='thumbImageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut();'>\n" +
                        "<div id='staticPagectxModelName' onclick='contextMenuActionShow()'>model name</div>\n" +
                        "<div id='ctxSeeMore' onclick='contextMenuActionJump()'>see more of her</div>\n" +
                        "<div onclick='contextMenuActionComment()'>comment</div>\n" +
                        "<div onclick='contextMenuActionExplode()'>open in new tab</div>\n" +
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
                    "<img id = 'imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='http://pages.ogglebooble.com/images/comment.png' />" +
                  "</div>\n" +
                  "<span id = 'imageViewerHeaderTitle' class='imageViewerTitle'></span>" +
                  "<div class='viewerButtonsRowSection'>" +
                    "<div class='floatRight' style='margin-left: 44px;' onclick=\"$('#imageViewerDialog').effect('blind', {mode:'hide', direction:'vertical' }, 500); viewerShowing = 'false';\">" +
                      "<img src='http://pages.ogglebooble.com/images/close.png' />" +
                    "</div>\n" +
                     "<div class='floatRight' onclick=\"runSlideShow('faster')\"><img id='fasterSlideshow' title='faster slideshow' src='http://pages.ogglebooble.com/images/slideshowFaster.png' /></div>\n" +
                      "<div class='floatRight' onclick=\"runSlideShow('start')\"><img id='showSlideshow' title='start slideshow' src='http://pages.ogglebooble.com/images/slideshow.png' /></div>\n" +
                      "<div class='floatRight' onclick=\"runSlideShow('slower')\"><img id='slowerSlideShow' title='slower slideshow' src='http://pages.ogglebooble.com/images/slideshowSlower.png' /></div>\n" +
                     "<div class='floatRight' onclick=\"blowupImage()\"><img class='popoutBox' src='http://pages.ogglebooble.com/images/expand02.png' /></div>\n" +
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
                        "                <img id = 'modelDialogThumbNailImage' src='http://pages.ogglebooble.com/images/redballon.png' class='modelDialogImage' />\n" +
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
                              "<div><a href='http://pages.ogglebooble.com'>Oggle Booble</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='http://ogglebooble.com/Home/BoobsRanker'>Boobs Rater</a></div>\n" +
                              "<div><a href='/Home/ImagePage?folder=908'>Rejects</a></div>\n" +
                              "<div><a href='http://ogglebooble.com/Home/Videos'>Nasty Videos</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
                              "<div><a href='http://ogglebooble.com/Admin/Blog'>Blog</a></div>\n" +
                              "<div><a href='http://pages.ogglebooble.com/porn/sluts.html'>Archive</a></div>\n" +
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
                            "<div><a href='http://pages.ogglebooble.com/porn.html'>Nasty Porn</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='http://ogglebooble.com/Home/BoobsRanker'>Boobs Rater</a></div>\n" +
                              "<div id='Rejects'></div>\n" +
                              "<div><a href='http://pages.ogglebooble.com/playboy/playboy.html'>Centerfolds</a></div>\n" +
                          "</div>\n" +
                          "<div class='footerCol'>\n" +
                              "<div><a href='mailto:curtishrhodes@hotmail.com'>email site developer</a></div>\n" +
                              "<div><a href='http://ogglebooble.com/Admin/Blog'>Blog</a></div>\n" +
                              "<div><a href='http://pages.ogglebooble.com/archive/archive.html'>Archive</a></div>\n" +
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
            "    < div class='dialogHeader'>\n" +
            "        welcome to<span>OggleBooble</span>\n" +
            "        <div id = 'btnClose' class='divCloseButton'>\n" +
            "            <img height = '19' src='http://pages.ogglebooble.com/images/powerOffRed01.png'/>\n" +
            "        </div>\n" +
            "    </div>\n" +
            "    <div class='registerUserDialogCrudContainer'>\n" +
            "        <div style = 'clear:both' ></div>\n" +
            "        < div id='errUserName' class='validationError'>Required</div>\n" +
            "        <label>user name</label><br>\n" +
            "        <input id = 'txtUserName' type='text' class='roundedInput' placeholder='your go by name'><br>\n" +
            "        <div id = 'errPassword' class='validationError'>Required</div>\n" +
            "        <label>password</label><br>\n" +
            "        <input id = 'clearPassword' type='password' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
            "        <label>retype password</label><br>\n" +
            "        <input id = 'clearPasswordRetype' type= 'password' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
            "        <div id = 'divRememberMe' >\n" +
            "            < input id='ckRememberMe' type='checkbox' checked='checked' />Remember Me ?  (<span>uses a cookie</span>)\n" +
            "        </div>\n" +
            "        <div id = 'divShowDetails'>Extra Details\n" +
            "            <div class='divCloseButton'>\n" +
            "                <img id='upDownCaret' height='19' src='http://pages.ogglebooble.com/images/caretDown.png' />\n" +
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

        private string IndexPageHtml()
        {
            return "<div class='threeColumnArray'>\n" +
                "    <div id='leftColumn'>\n" +
                "        <div class='leftColumnList'>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Home/Tramsitions\"'>Transitions</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Home/BoobsRanker\"'>Boobs Rater</div>\n" +
                "            <div onclick='showCustomMessage(38)'>Let me Expalin</div>\n" +
                "            <div onclick='showCatListDialog()'>Category List</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Admin/Blog\"'>Blog</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Home/Mobile?folder=boobs\"'>Mobile</div>\n" +
                "            <div onclick='showCustomMessage(35)'>Nasty Porn</div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <div id='middleColumn'>\n" +
                "        <div id='customMessage' class='oggleHidden customMessageContainer'></div>\n" +
                "        <div id='divStatusMessage'></div>\n" +
                "        <div class='flexContainer'>\n" +
                "            <div class='floatLeft'>\n" +
                "                <div class='galleryCheckBox'><input type='checkbox' onchange=\"loadImages(\'playboy\', $(this).is(\':checked\'), 50000)\" /> Include Centerfolds</div>\n" +
                "                <div class='galleryCheckBox'><input type='checkbox' onchange=\"loadImages(\'archive\', $(this).is(\':checked\'), 50000)\" /> Include Archive</div>\n" +
                "            </div>\n" +
                "            <div class='floatLeft'>\n" +
                "               <div class='centeredDivShell randomImageContainer'>\n" +
                "                   <div class='centeredDivInner'>\n" +
                "                       <div id='categoryTitle' class='floatingLabel' onmouseover='slowlyShowFolderCategoryDialog();" +
                "                           forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;'></div>\n" +
                "                       <div id='laCarousel' class='carouselContainer'>\n" +
                "                           <div id='laCarouselImageContainer' class='carouselImageContainer'>\n" +
                "                               <img class='carouselImage' src='http://pages.ogglebooble.com/images/ingranaggi3.gif' />\n" +
                "                           </div>\n" +
                "                           <div class='imgBottom'>\n" +
                "                                    <img class='speedButton floatLeft' src='http://pages.ogglebooble.com/images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
                "                                    <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
                "                                    <div id='categoryLabel' class='carouselCategoryLabel' onclick='clickViewParentGallery()'></div>\n" +
                "                                    <img class='speedButton floatRight' src='http://pages.ogglebooble.com/images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
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

        private string PornIndexPageHtml()
        {
            return "<div class='threeColumnArray'>\n" +
                "    <div id='leftColumn'>\n" +
                "        <div class='leftColumnList'>\n" +
                "            <div onclick='window.location.href=\"http://pages.ogglebooble.com/index.html\"'>OggleBooble</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Home/BoobsRanker\"'>Boobs Rater</div>\n" +
                "            <div onclick='showCatListDialog()'>Category List</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Admin/Blog\"'>Blog</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Home/Mobile?folder=boobs\"'>Mobile</div>\n" +
                "            <div onclick='window.location.href=\"http://ogglebooble.com/Home/Videos\"'>Videos</div>\n" +
                "        </div>\n" +
                "    </div>\n" +
                "    <div id='middleColumn'>\n" +
                "        <div id='customMessage' class='oggleHidden customMessageContainer'></div>\n" +
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
                "                               <img class='carouselImage' src='http://pages.ogglebooble.com/images/ingranaggi3.gif' />\n" +
                "                           </div>\n" +
                "                           <div class='imgBottom'>\n" +
                "                                    <img class='speedButton floatLeft' src='http://pages.ogglebooble.com/images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
                "                                    <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
                "                                    <div id='categoryLabel' class='carouselCategoryLabel' onclick='clickViewParentGallery()'></div>\n" +
                "                                    <img class='speedButton floatRight' src='http://pages.ogglebooble.com/images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
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
        public string CreateIndexPage(string rootFolder, string userName, string service, string pageTitle, int metaTagFolderId)
        {
            string success = "";
            try
            {
                StringBuilder sb = new StringBuilder("<div id='carouselImageContainer' class='oggleHidden'>");
                List<VwLink> vwLinks = null;
                var timer = new System.Diagnostics.Stopwatch();
                timer.Start();
                using (OggleBoobleContext db = new OggleBoobleContext())
                {
                    vwLinks = db.VwLinks.Where(l => l.RootFolder == rootFolder).OrderBy(l => l.Link).Take(145).ToList();
                }
                for (int i = 0; i < vwLinks.Count; i++)
                {
                    sb.Append("<img id='image" + i + "' folderName='" + vwLinks[i].FolderName + "' rootFolder='" + vwLinks[i].RootFolder
                        + "' folderId='" + vwLinks[i].FolderId + "' parentName='" + vwLinks[i].ParentName + "' linkId='" + vwLinks[i].LinkId + "' src='" + vwLinks[i].Link + "'/>\n");
                }
                timer.Stop();
                System.Diagnostics.Debug.WriteLine("get VwLinks took: " + timer.Elapsed);
                sb.Append("</div>");

                string staticContent =
                    "<!DOCTYPE html>\n<html>\n" + HeadHtml(metaTagFolderId, pageTitle) +
                    "\n<body style='margin-top:105px'>\n" + HeaderHtml(metaTagFolderId);

                if (rootFolder == "boobs")
                    staticContent += IndexPageHtml();
                else
                    staticContent += PornIndexPageHtml();

                staticContent += sb.ToString() +
                    "<script>var staticPageFolderId=" + metaTagFolderId + "; var staticPageRootFolder='" + rootFolder +
                    "'; var service='" + service + "' var staticPageCurrentUser ='" + userName + "'; </script>\n" +
                    "<script src='http://pages.ogglebooble.com/script/staticPage.js'></script>\n" +
                    "<script src='http://pages.ogglebooble.com/script/staticIndexPage.js'></script>\n" +
                    FooterHtml(rootFolder) + "\n</body>\n</html>";

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
                vwLinks = db.VwLinks.Where(l => l.RootFolder == rootFolder).OrderBy(l => l.Link).Skip(skip).Take(take).ToList();
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
    }
}
