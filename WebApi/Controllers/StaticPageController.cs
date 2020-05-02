using System;
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
                    "\n<body style='margin-top:105px'>\n" +
                    GetStaticPageHeader(folderId, rootFolder) +
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
                    "<script>function getBreadCrumbs(staticPageFolderId){setOggleFooter(" + folderId + ",'" + rootFolder + "')};</script>\n" +
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

        private string HeadHtml(int folderId, string folderName)
        {
            MetaTagResultsModel metaTagResults = new MetaTagResultsModel();
            string articleTagString = "";

            //using (OggleBoobleContext db = new OggleBoobleContext())
            //{
            //    GetMetaTagsRecurr(metaTagResults, folderId, db);
            //    foreach (MetaTagModel metaTag in metaTagResults.MetaTags)
            //        articleTagString += metaTag.Tag + ",";

            //    metaTagResults.MetaDescription = "free naked pics of " + folderName;
            //}

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
                "   <script src='/Scripts/FeedbackDialog.js'></script>\n" +
                "   <script src='/Scripts/ModelInfoDialog.js'></script>\n" +
                "   <script src='/Scripts/OggleEventLog.js'></script>\n" +
                "   <script src='/Scripts/OggleSearch.js'></script>\n" +
                "   <script src='/Scripts/Slideshow.js'></script>\n" +
                "   <script src='/Scripts/OggleFooter.js'></script>\n" +
                "   <script src='/Scripts/Permissions.js'></script>\n" +
                "   <script src='/Scripts/OggleHeader.js'></script>\n" +
                "   <script src='/Scripts/Slideshow.js'></script>\n" +
                "   <script src='/Scripts/ImageCommentDialog.js'></script>\n" +
                "   <script src='/Scripts/FolderCategoryDialog.js'></script>\n" +
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

        private string GetStaticPageHeader(int folderId, string rootFolder)
        {
            string headerClass = "boobsHeader";
            string topLeftLogo = "/Images/redballon.png";
            string bannerTitle = "OggleBooble";
            string subheaderContent = "";
            string rankerLink = "";
            string playboyLink = "";
            string archiveLink = "";
            switch (rootFolder)
            {
                case "admin":
                    subheaderContent = "admin";
                    //$('header').switchClass('pornHeader', 'boobsHeader');
                    //$("#divLoginArea").hide();
                    //$('#subheaderContent').html("admin");
                    break;
                case "blank":
                    subheaderContent = "loading"; // $('#subheaderContent').html("loading");
                    break;
                case "dashboard":
                    subheaderContent = "dashboard"; // $('#subheaderContent').html("dashboard");
                    break;
                case "blog":
                    subheaderContent = "blog";  // $('#subheaderContent').html("blog");
                    break;
                case "ranker":
                    subheaderContent = "ranker"; // $('#subheaderContent').html("ranker");
                    break;
                case "archive":
                    subheaderContent = "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",4)'>milk cows,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1103)'>russian spys,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1093)'>highschool fantasy girls,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1107)'>sweater meat,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",123)'>ultra juggs</a> \n";
                    rankerLink = "<div id='rankerTag' class='headerFeatureBanner'>" +
                        "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'" +
                        " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n";

                    playboyLink = "<div class='headerFeatureBanner'>" +
                        "\n<a href='javascript:rtpe(\"BAC\"," + folderId + ",1132)'>every Playboy Centerfold</a></div>\n";
                    break;
                case "special":
                case "boobs":
                    subheaderContent =
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",136)'> poses,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3916)'> positions,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",159)'> topics,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",199)'> shapes</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",241)'>sizes</a>\n";

                    //DUTCH subheaderContent =
                    //    "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
                    //    "                <a href='/album.html?folder=136'> rejser,</a>\n" +
                    //    "                <a href='/album.html?folder=159'> emne,</a>\n" +
                    //    "                <a href='/album.html?folder=199'> figurer</a> og\n" +
                    //    "                <a href='/album.html?folder=241'>størrelser</a>\n";

                    archiveLink = "<div id='rankerTag' class='headerFeatureBanner'>" +
                        "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3)'>babes archive</a></div>\n";
                    rankerLink = "<div id='rankerTag' class='headerFeatureBanner'>" +
                        "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"boobs\")'" +
                        " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n";
                    break;
                case "playboy":
                case "playmates":
                    headerClass = "boobsHeader";
                    topLeftLogo = "/Images/playboyBallon.png";
                    subheaderContent =
                        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1132)'>Centerfolds,</a>\n" +
                        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1986)'> magazine covers,</a>\n" +
                        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3796)'> cybergirls,</a> and\n" +
                        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2601)'> extras</a>\n";

                    archiveLink = "<div id='rankerTag' class='headerFeatureBanner'>" +
                        "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3)'>big tits archive</a></div>\n";
                    rankerLink = "<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"playboy\")' " +
                        "title='Spin through the links to land on random portrait images.'>playmate ranker</a></div>\n";
                    break;
                case "porn":
                case "sluts":
                    headerClass = "pornHeader";
                    //changeFavoriteIcon();
                    //$('body').addClass('pornBodyColors');
                    subheaderContent =
                        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",243)'>cock suckers</a>, \n" +
                        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",420)'>boob suckers</a>, \n" +
                        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",357)'>cum shots</a>, \n" +
                        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",397)'>kinky</a> and \n" +
                        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",411)'>naughty behaviour</a>\n";
                    topLeftLogo = "/Images/csLips02.png";
                    archiveLink = "<div id='rankerTag' class='headerFeatureBanner'>" +
                        "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440)'>slut archive</a></div>\n";
                    rankerLink = "<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + rootFolder + "\")' " +
                        "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n";
                    bannerTitle = "OgglePorn";
                    break;

                    //sendEmailToYourself("OggleHeader switch ","folderId: " + folderId+ "<br/>subdomain: " + subdomain);
                    //alert("subdomain: " + subdomain + "  not found");
                    //console.log("subdomain: " + subdomain + "  not found");
            }
            StringBuilder staticPageHeader = new StringBuilder(
                "<header class='" + headerClass + "'>" +
                "<div id='divTopLeftLogo' class='bannerImageContainer'>" +
                "   <a href = 'javascript:rtpe(\"HBC\"," + folderId + ",\"boobs\")' ><img class='bannerImage' src = '" + topLeftLogo + "'/></a>\n" +
                "</div>\n" +
                "   <div class='headerBodyContainer'>\n" +
                "       <div id='' class='headerTopRow'>\n" +
                "           <div id='bannerTitle' class='headerTitle'>" + bannerTitle + "</div >\n" +
                "           <div id='subheaderContent' class='topLinkRow'>" + subheaderContent + "</div>\n<span id='archiveLink'>" + archiveLink +
                "               </span><span id='rankerLink'>" + rankerLink + "</span><span id='playboyLink'>" + playboyLink + "</span>\n" +
                "           <div class='OggleSearchBox'>\n" +
                "               <span id='notUserName' title='this is a progressive single letter search. Esc clears search.'>search</span>" +
                "                   <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
                "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
                "           </div>\n" +
                "       </div>\n");
            //BreadCrumbModel breadCrumbModel = new BreadCrumbsController().Get(folderId);
            BreadCrumbModel breadCrumbModel = new BreadCrumbModel();
            string badgesText = "";
            using (OggleBoobleContext db = new OggleBoobleContext())
            {
                #region breadcrumbs
                var thisFolder = db.CategoryFolders.Where(f => f.Id == folderId).First();
                var parent = thisFolder.Parent;
                breadCrumbModel.BreadCrumbs.Add(new BreadCrumbItemModel()
                {
                    FolderId = thisFolder.Id,
                    FolderName = thisFolder.FolderName,
                    ParentId = thisFolder.Parent,
                    IsInitialFolder = true
                });
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

                CategoryFolderDetail dbCategoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
                if (dbCategoryFolderDetails != null)
                    badgesText = dbCategoryFolderDetails.ExternalLinks;

            }
            StringBuilder breadCrumbString = new StringBuilder("<a class='activeBreadCrumb' href='javascript:rtpe(\"HBX\"," +
                folderId + ",\"" + rootFolder + "\")'>home  &#187</a>");

            int breadcrumbCount = breadCrumbModel.BreadCrumbs.Count;
            for (int i = breadcrumbCount - 1; i >= 0; i--)
            //for (int i = 0; i < breadCrumbModel.BreadCrumbs.Count; i++)
            {
                if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder)
                {
                    breadCrumbString.Append("<a class='inactiveBreadCrumb' " +
                    (breadCrumbModel.BreadCrumbs.Count - i) + "'," +
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
            #endregion
            int pageHits = 0;
            using (var db = new MySqDataContext.OggleBoobleMySqContext())
            {
                pageHits += db.PageHits.Where(h => h.PageId == folderId).Count();
                pageHits += db.PageHitTotal.Where(h => h.PageId == folderId).Count();
            }

            staticPageHeader.Append("       <div class='headerBottomRow'>\n" +
                "           <div id='headerMessage' class='bottomLeftBottomHeaderArea'>page hits: " + pageHits + "</div>\n" +
                "           <div id='breadcrumbContainer' class='breadCrumbArea'>" + breadCrumbString.ToString() + "</div>\n" +
                "           <div class='menuTabs replaceableMenuItems'>\n");

            //CategoryFolderDetail categoryFolderDetails = db.CategoryFolderDetails.Where(d => d.FolderId == folderId).FirstOrDefault();
            if (badgesText != null)
            {
                if (badgesText.IndexOf("Playmate Of The Year") > -1)
                {
                    staticPageHeader.Append(
                    "               <div id='pmoyLink' class='menuTabs'>\n" +
                    "                   <a href='/album.html?folder=4013'><img src='/Images/pmoy.png' title='Playmate of the year' class='badgeImage'></a>" +
                    "               </div>\n");
                }
                if (badgesText.IndexOf("biggest breasted centerfolds") > -1)
                {
                    staticPageHeader.Append(
                        "               <div id='breastfulPlaymatesLink' class='menuTabs'>\n" +
                        "                   <a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='badgeImage'></a>" +
                        "               </div>\n");
                }
                if (badgesText.IndexOf("black centerfolds") > -1)
                {
                    staticPageHeader.Append(
                        "               <div id='blackCenterfoldsLink' class='menuTabs'>\n" +
                        "                   <div class='blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>\n" +
                        "               </div>\n");
                }
                if (badgesText.IndexOf("Hef likes twins") > -1)
                {
                    staticPageHeader.Append(
                        "               <div id='twinsLink' class='menuTabs'>\n" +
                        "                   <a href='/album.html?folder=3904'><img src='/Images/gemini03.png' title='Hef likes twins' class='badgeImage'></a>" +
                        "               </div>\n");
                }
            }
            
            staticPageHeader.Append(
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
                "</div>\n</header>\n");
            //staticPageHeader.Append(
            //    "<div id='feedbackDialog' class='modalDialog' title='Feedback'>\n" +
            //    "   <div><input type='radio' name='feedbackRadio' value='complement' checked='checked'> complement\n" +
            //    "       <input type='radio' name='feedbackRadio' value='suggestion'> suggestion\n" +
            //    "       <input type='radio' name='feedbackRadio' value='report error'> report error" +
            //    "   </div>\n" +
            //    "   <div id='feedbackDialogSummerNoteTextArea'></div>\n" +
            //    "   <div id='btnfeedbackDialogSave' class='roundendButton' onclick='saveFeedbackDialog(" + folderId + ")'>Send</div>\n" +
            //    "   <div id='btnfeedbackDialogCancel' class='roundendButton' onclick='closeFeedbackDialog()'>Cancel</div>\n" +
            //    "</div>");
            return staticPageHeader.ToString();

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

