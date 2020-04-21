﻿using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Text;
using System.Web.Http;
using System.Web.Http.Cors;
using WebApi.Models;
using WebApi.OggleBoobleSqlContext;

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

        private void GetMetaTagsRecurr(MetaTagResultsModel metaTagResults, int folderId, OggleBoobleContext db)
        {
            CategoryFolder thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).FirstOrDefault();
            if (thisFolder.FolderName.IndexOf("OGGLEBOOBLE.COM") > 0)
            {
                thisFolder.FolderName = thisFolder.FolderName.Substring(0, thisFolder.FolderName.IndexOf("OGGLEBOOBLE.COM") - 1);
            }
            metaTagResults.MetaTags.Add(new MetaTagModel() { Tag = thisFolder.FolderName });
            List<MetaTag> metaTags = db.MetaTags.Where(m => m.FolderId == folderId).ToList();
            foreach (MetaTag metaTag in metaTags)
            {
                metaTagResults.MetaTags.Add(new MetaTagModel() { Tag = metaTag.Tag });
            }
            //metaTagResults.MetaTags.Add(new MetaTagModel() { TagId = metaTag.TagId, FolderId = metaTag.FolderId, Tag = metaTag.Tag });

            if (thisFolder.Parent > 1)
                GetMetaTagsRecurr(metaTagResults, thisFolder.Parent, db);
        }

        //public class MetaTagResultsModel
        //{
        //    public MetaTagResultsModel()
        //    {
        //        MetaTags = new List<MetaTagModel>();
        //    }
        //    public List<MetaTagModel> MetaTags { get; set; }
        //    public string Source { get; set; }
        //    public string MetaDescription { get; set; }
        //    public string Success { get; set; }
        //}

        //public class MetaTagModel
        //{
        //    public int TagId { get; set; }
        //    public int FolderId { get; set; }
        //    public string LinkId { get; set; }
        //    public string Tag { get; set; }
        //}

        private string HeadHtml(int folderId, string folderName)
        {
            MetaTagResultsModel metaTagResults = new MetaTagResultsModel();
            string articleTagString = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                GetMetaTagsRecurr(metaTagResults, folderId, db);
                foreach (MetaTagModel metaTag in metaTagResults.MetaTags)
                    articleTagString += metaTag.Tag + ",";

                metaTagResults.MetaDescription = "free naked pics of " + folderName;
            }

            return "<head>\n" +
                "   <meta charset='utf-8'>\n" +
                "   <title>" + folderName + " : OggleBooble</title>" +
                "   <link rel='icon' type='image/png' href='/static/favicon.png' />" +
                "   <meta name='Title' content='" + folderName + "' property='og:title'/>\n" +
                "   <meta name='description' content='" + metaTagResults.MetaDescription + "'/>\n" +
                "   <meta name='viewport' content='width=device-width, initial-scale=.07'>\n" +
                "   <meta http-equiv='cache-control' content='max-age=0'>\n" +
                "   <meta http-equiv='cache-control' content='no-cache'>\n" +
                "   <meta http-equiv='expires' content='-1'>\n" +
                "   <meta http-equiv='expires' content='Tue, 01 Jan 1980 11:00:00 GMT'>\n" +
                "   <meta http-equiv='pragma' content='no-cache'>\n" +
                "   <meta property='og:type' content='website' />\n" +
                "   <meta property='og:url' content='" + httpLocation + folderName + ".html'/>\n" +
                "   <meta name='Keywords' content='" + articleTagString + "'/>\n" +
                "   <script src='https://code.jquery.com/jquery-latest.min.js' type='text/javascript'></script>\n" +
                "   <script src='https://code.jquery.com/ui/1.12.1/jquery-ui.min.js' type='text/javascript'></script>\n" +
                "   <link href='https://netdna.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.css' rel='stylesheet'>\n" +
                "   <script src='https://netdna.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.js'></script>\n" +
                "   <link href='https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote.css' rel='stylesheet'>\n" +
                "   <script src='https://cdnjs.cloudflare.com/ajax/libs/summernote/0.8.12/summernote.js'></script>\n" +

                "   <script src='/Scripts/Common.js'></script>\n" +
                "   <script src='/Scripts/HitCounter.v2.js'></script>\n" +
                "   <script src='/Scripts/Login.js'></script>\n" +
                "   <script src='/Scripts/OggleHeader.js'></script>\n" +
                "   <script src='/Scripts/ModelInfoDialog.js'></script>\n" +
                "   <script src='/Scripts/OggleEventLog.js'></script>\n" +
                "   <script src='/Scripts/OggleSearch.js'></script>\n" +
                "   <script src='/Scripts/Slideshow.js'></script>\n" +
                "   <script src='/Scripts/OggleFooter.js'></script>\n" +
                "   <script src='/Scripts/Permissions.js'></script>\n" +
                "   <script src='/Scripts/Album.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/Slideshow.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/ImageCommentDialog.js' type='text/javascript'></script>\n" +
                "   <script src='/Scripts/FolderCategoryDialog.js' type='text/javascript'></script>\n" +
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
                "   <link href='/Styles/jqueryui.css' rel='stylesheet' />\n" +
                "</head>";
        }

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
                        success = CreatePage(folderId, categoryFolder.RootFolder, 
                            categoryFolder.FolderName.Replace(".OGGLEBOOBLE.COM", ""), db, recurr);
                    }
                }
                catch (Exception e) { success = Helpers.ErrorDetails(e); }
                return success;
            }
        }

        private string CreatePage(int folderId, string rootFolder, string folderName, OggleBoobleContext db, bool recurr)
        {
            string success = "";
            try
            {
                //SignalRHost.ProgressHub.PostToClient("Creating static files: " + folderName + ".html");

                string staticContent =
                    "<!DOCTYPE html>\n<html lang='en'>\n" + HeadHtml(folderId, folderName) +
                    "\n<body style='margin-top:105px'>\n<header>" + StaticPageHeader(folderId, rootFolder) + "</header>" +
                    GalleryPageBodyHtml(folderId, folderName, rootFolder) +
                    "<footer></footer>\n" +
                    // Slideshow() + CommentDialog() + ModelInfoDialog() +
                    "<div id='staticCatTreeContainer' class='displayHidden categoryListContainer' title=" + rootFolder + "></div>" +
                    "<script>var staticPageFolderId=" + folderId + "; " +
                    "var staticPageFolderName='" + folderName + "'; " +
                    "var currentFolderRoot='" + rootFolder + "';</script>\n" +
                    "<div w3-include-html='/Snippets/Slideshow.html'></div>\n" +
                    "<div w3-include-html='/Snippets/AdminDialogs.html'></div>\n" +
                    "<div w3-include-html='/Snippets/Login.html'></div>\n" +
                    "<div w3-include-html='/Snippets/Register.html'></div>\n" +
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

                            CreatePage(dbCategoryFolder.Id, rootFolder, dbCategoryFolder.FolderName, db, true);
                        }
                    }
                }
            }
            catch (Exception e) { success = Helpers.ErrorDetails(e); }
            return success;
        }

        private string StaticPageHeader(int folderId, string rootFolder)
        {
            BreadCrumbModel breadCrumbModel = new BreadCrumbsController().Get(folderId);
            StringBuilder breadCrumbString = new StringBuilder("<a class='activeBreadCrumb' href='javascript:rtpe(\"HBX\"," + folderId + ",\"" +
                      rootFolder + "\")'>home  &#187</a>");
                int breadcrumbCount = breadCrumbModel.BreadCrumbs.Count;
                for (int i = breadcrumbCount - 1; i >= 0; i--)
                {
                    if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder)
                    {
                        breadCrumbString.Append("<a class='inactiveBreadCrumb' " +
                        (breadCrumbModel.BreadCrumbs.Count - i) + "," +
                        breadCrumbModel.FolderName + "\",\"" +
                        breadCrumbModel.BreadCrumbs[i].FolderId + "\",\"" +
                        breadCrumbModel.BreadCrumbs[i].ParentId + "\",\"" +
                        breadCrumbModel.RootFolder + "\"); forgetHomeFolderInfoDialog=false;' onmouseout='forgetHomeFolderInfoDialog=true;' " +
                        "onclick='showEitherModelorFolderInfoDialog(" + (breadCrumbModel.BreadCrumbs.Count - i) + ",\"" +
                        breadCrumbModel.FolderName + "\",\"" +
                        breadCrumbModel.BreadCrumbs[i].FolderId + "\",\"" +
                        breadCrumbModel.BreadCrumbs[i].ParentId + "\",\"" +
                        breadCrumbModel.RootFolder + "\")' >" +
                        breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") +
                        "</a>");
                    }
                    else
                    {
                        breadCrumbString.Append("<a class='activeBreadCrumb'" +
                            //	HBX	Home Breadcrumb Clicked
                            "href='javascript:rtpe(\"BCC\"," + folderId + "," + breadCrumbModel.BreadCrumbs[i].FolderId + ")'>" +
                            breadCrumbModel.BreadCrumbs[i].FolderName.Replace(".OGGLEBOOBLE.COM", "") + " &#187</a>");
                    }
                }

            return
                "   <div id='divTopLeftLogo' class='bannerImageContainer'></div>\n" +
                "   <div class='headerBodyContainer'>\n" +
                "       <div id='' class='headerTopRow'>\n" +
                "           <div id='bannerTitle' class='headerTitle'></div >\n" +
                //"                  <img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
                //"                   title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
                //"                   \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
                //"                   \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +
                "           <div id='subheaderContent' class='topLinkRow'>KKK</div>\n<span id='archiveLink'></span><span id='rankerLink'></span><span id='playboyLink'></span>\n" +
                "           <div class='OggleSearchBox'>\n" +
                "               <span id='notUserName' title='this is a progressive single letter search. Esc clears search.'>search</span>" +
                "                   <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
                "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
                "           </div>\n" +
                "       </div>\n" +
                "       <div class='headerBottomRow'>\n" +
                "           <div id='headerMessage' class='bottomLeftBottomHeaderArea'></div>\n" +
                "           <div id='breadcrumbContainer' class='breadCrumbArea'>" + breadCrumbString.ToString() + "</div>\n" +
                "           <div class='menuTabs replaceableMenuItems'>\n" +
                "               <div id='twinsLink' class='menuTabs displayHidden'>\n" +
                "                   <a href='/album.html?folder=3904'><img src='/Images/geminiSymbol1.png' title='Hef likes twins' class='badgeImage'></a>" +
                "               </div>\n" +
                "               <div id='breastfulPlaymatesLink' class='menuTabs displayHidden'>\n" +
                "                   <a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='badgeImage'></a>" +
                "               </div>\n" +
                "               <div id='pmoyLink' class='menuTabs displayHidden'>\n" +
                "                   <a href='/album.html?folder=4013'><img src='/Images/pmoy.png' title='Playmate of the year' class='badgeImage'></a>" +
                "               </div>\n" +
                "               <div id='blackCenterfoldsLink' class='menuTabs displayHidden'>\n" +
                "                   <div class='blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>\n" +
                "               </div>\n" +
                "           </div>\n" +
                "           <div id='divLoginArea' class='loginArea'>\n" +
                "               <div id='optionLoggedIn' class='displayHidden'>\n" +
                "                   <div class='menuTab' id='dashboardMenuItem' class='displayHidden'><a href='/Dashboard.html'>Dashboard</a></div>\n" +
                "                   <div class='menuTab' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
                "                   <div class='menuTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
                "               </div>\n" +
                "               <div id='optionNotLoggedIn'>\n" +
                "                   <div id='btnLayoutRegister' class='menuTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
                "                   <div id='btnLayoutLogin' class='menuTab'><a href='javascript:showLoginDialog()'>Log In</a></div>\n" +
                "               </div>\n" +
                "           </div>\n" +
                "       </div>\n" +
                "   </div>\n" +
                "<div id='draggableDialog' class='oggleDraggableDialog'>\n" +
                "   <div id='draggableDialogHeader'class='oggleDraggableDialogHeader'>" +
                "       <div id='draggableDialogTitle' class='oggleDraggableDialogTitle'></div>" +
                "       <div id='draggableDialogCloseButton' class='oggleDraggableDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='dragableDialogClose()'></div>\n" +
                "   </div>\n" +
                "   <div id='draggableDialogContents' class='oggleDraggableDialogContents'></div>\n" +
                "</div>\n" +
                "<div id='indexCatTreeContainer' class='oggleHidden'></div>\n" +
                "<div id='customMessageContainer' class='centeredDivShell'>\n" +
                "   <div class='centeredDivInner'>\n" +
                "       <div id='customMessage' class='displayHidden' ></div>\n" +
                "   </div>\n" +
                "</div>\n" +
                "<div id='feedbackDialog' class='modalDialog' title='Feedback'>\n" +
                "   <div><input type='radio' name='feedbackRadio' value='complement' checked='checked'> complement\n" +
                "       <input type='radio' name='feedbackRadio' value='suggestion'> suggestion\n" +
                "       <input type='radio' name='feedbackRadio' value='report error'> report error" +
                "   </div>\n" +
                "   <div id='feedbackDialogSummerNoteTextArea'></div>\n" +
                "   <div id='btnfeedbackDialogSave' class='roundendButton' onclick='saveFeedbackDialog(" + folderId + ")'>Send</div>\n" +
                "   <div id='btnfeedbackDialogCancel' class='roundendButton' onclick='closeFeedbackDialog()'>Cancel</div>\n" +
                "</div>";
        }

        private string GalleryPageBodyHtml(int folderId, string folderName, string rootFolder)
        {
            StringBuilder bodyHtml = new StringBuilder(
            "<div class='threeColumnLayout'>\n" +
            "   <div id='leftColumn'>\n" +
            "       <div id = 'TrackbackLinkArea' class='leftColumnTrackbackArea'>\n");
            TrackBackModel trackBackModel = new TrackbackLinkController().GetTrackBacks(folderId);
            if (trackBackModel.Success == "ok")
            {
                foreach(TrackBackItem trackBackItem in trackBackModel.TrackBackItems) { 
                    if (trackBackItem.Site == "Babepedia")
                    {
                        bodyHtml.Append("           <div id='babapediaLink' class='leftColumnTrackbackLink'>" + trackBackItem.TrackBackLink + "</div>\n");
                    }
                    if (trackBackItem.Site == "Freeones")
                    {
                        bodyHtml.Append("           <div id='freeonesLink' class='leftColumnTrackbackLink'>" + trackBackItem.TrackBackLink + "</div>\n");
                    }
                    if (trackBackItem.Site == "Indexxx")
                    {
                        bodyHtml.Append("           <div id='indexxxLink' class='leftColumnTrackbackLink'>"+ trackBackItem.TrackBackLink + "</div>\n");
                    }
                }
            }
            bodyHtml.Append("      </div>\n" +
            "   </div>\n" +
            "<div id='middleColumn'>\n" +
            "   <div class='floatLeft' id='googleSearchText'>" + folderName + "</div>\n" +
            "   <div class='displayHidden'>" + folderName + " naked</div>\n" +
            "   <div class='displayHidden'>free pics of " + folderName + "</div>\n" +
            "   <div id='divStatusMessage'></div>\n");
            //ImageLink[] imageArray = null;
            int imagesCount = 0;
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                string imageFrameClass = "folderImageOutterFrame";
                string subDirLabelClass = "subDirLabel";
                if (rootFolder == "porn" && rootFolder == "sluts")
                {
                    imageFrameClass = "pornFolderImageOutterFrame";
                    subDirLabelClass = "pornSubDirLabel";
                }
                List<VwDirTree> subDirs = db.VwDirTrees.Where(f => f.Parent == folderId).OrderBy(f => f.SortOrder).ThenBy(f => f.FolderName).ToList();
                if (subDirs.Count() > 1)
                {
                    foreach (VwDirTree subDir in subDirs) {
                        if (subDir.FileCount > 1) {
                            bodyHtml.Append("   <div id='staticPageDeepSlideshow' class='floatRight displayHiddes' title='include all child folders'" +
                            " style='cursor: pointer;' onclick='launchViewer(" + folderId + ", 1, true);'>slideshow</div>\n");
                            break;
                        }
                    }
                }
                bodyHtml.Append("   <div id='imageContainer' class='flexWrapContainer'>\n");

                // IMAGES 
                List<VwLink> vwLinks = db.VwLinks.Where(v => v.FolderId == folderId).OrderBy(v => v.SortOrder).ThenBy(v => v.LinkId).ToList();
                int idx = 0;
                foreach (VwLink link in vwLinks)
                {
                    bodyHtml.Append("<div id='img" + idx + "' class='" + imageFrameClass + "'><img class='thumbImage' " +
                         "oncontextmenu='ctxSAP(\"img" + idx + "\")' onclick='launchViewer(" + folderId + ",\"" + link.LinkId + "\",false)' src='" + link.Link + "'/></div>\n");
                    imagesCount++;
                }
                //  SUBFOLDERS
                string countText, fullerFolderName;
                foreach (VwDirTree subDir in subDirs)
                {
                    fullerFolderName = subDir.RootFolder + "/" + Helpers.GetParentPath(folderId).Replace(".OGGLEBOOBLE.COM", "");
                    countText = subDir.FileCount.ToString();
                    //int subDirFileCount = Math.Max(subDir.FileCount, subDir.SubDirCount);
                    if (subDir.SubDirCount > 1)
                    {
                        int subDirCnt = subDir.SubDirCount;
                        if (subDir.FileCount > 0)
                            subDirCnt++;
                        deepChildCount = 0;
                        GetDeepChildCount(subDir, db);
                        countText = subDirCnt + "/" + String.Format("{0:n0}", deepChildCount);
                    }
                    bodyHtml.Append("<div class='" + imageFrameClass + "'>" +
                        //"<div class='folderImageFrame' onclick='reportThenPerformEvent(\"SUB\"," + folderId + "," + subDir.Id + ")'>" +
                        "<div class='folderImageFrame' onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.Id + "\")'>" +
                        "<img class='folderImage' src='" + subDir.Link + "'/>" +
                        "<div class='" + subDirLabelClass + "'>" + subDir.FolderName +
                        " (" + countText + ")</div></div></div>\n");
                }
            }

            bodyHtml.Append("   </div>\n" +
                "       <div id='fileCount' class='countContainer'>" + imagesCount + "</div>\n" +
                "       <div id='thumbImageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut();'>\n" +
                "           <div id='ctxModelName' onclick='contextMenuAction(\"show\")'>model name</div>\n" +
                "           <div id='ctxSeeMore' onclick='contextMenuAction(\"jump\")'>see more of her</div>\n" +
                "           <div onclick='contextMenuAction(\"comment\")'>comment</div>\n" +
                "           <div onclick='contextMenuAction(\"explode\")'>explode</div>\n" +
                "           <div onclick= 'contextMenuAction(\"showLinks\")' > Show Links</div>\n" +
                "           <div id='linkInfo' class='innerContextMenuInfo'>\n" +
                "               <div id='linkInfoContainer'></div>\n" +
                "           </div>\n" +
                "      </div>\n" +
                "   </div>\n" +
                "   <div id='rightColumn'>\n" +
                "      <div id='feedbackBanner' class='fixedMessageButton displayHidden' " +
                "       title='I built this website entirely by myself\nusing only Html and JavaScript. Any comments or suggestions are greatly appreciated.'>feedback</div>\n" +
                "   </div>\n" +
                "</div>");
            return bodyHtml.ToString();
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

        int deepChildCount = 0;
        private void GetDeepChildCount(VwDirTree parentDir, OggleBoobleContext db) 
        {
            deepChildCount += parentDir.FileCount;
            List<VwDirTree> subDirs = db.VwDirTrees.Where(f => f.Parent == parentDir.Id).ToList();
            foreach (VwDirTree dirTree in subDirs)
            {
                if (dirTree.IsStepChild == 0)
                    GetDeepChildCount(dirTree, db);
            }
        }
    }
}

