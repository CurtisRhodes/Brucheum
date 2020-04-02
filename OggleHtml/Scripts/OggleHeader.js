
function changeFavicon(src) {
    var link = document.createElement('link'),
        oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = src;
    if (oldLink) {
        document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
}

function changeFavoriteIcon () {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';    
    link.href = 'https://ogglebooble.com/images/cslips03.png';
    document.getElementsByTagName('head')[0].appendChild(link);
}

function setAlbumPageHeader(folderId) {
    setOggleHeader(folderId);
}

var currentFolderId;
function setOggleHeader(folderId) {

    //alert("setOggleHeader called from " + folderId);
    currentFolderId = folderId;
    var headerHtml;
    var lang = "en";

    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("setOggleHeader subdomain " + subdomain + "  folderId: " + folderId + " containsImageLinks: " + containsImageLinks);

    $('header').switchClass('pornHeader', 'boobsHeader');

    // HEADER HTML
    {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'></div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div id='' class='headerTopRow'>\n" +
            "           <div id='bannerTitle' class='headerTitle'></div >\n" +
            //"                  <img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
            //"                   title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
            //"                   \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
            //"                   \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +
            "           <div id='subheaderContent' class='topLinkRow'></div>\n<span id='archiveLink'></span><span id='rankerLink'></span><span id='playboyLink'></span>\n" +
            "           <div class='OggleSearchBox'>\n" +
            "               <span id='notUserName' title='this is a progressive single letter search. Esc clears search.'>search</span>" +
            "                   <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
            "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
            "           </div>\n" +
            "       </div>\n" +
            "       <div class='headerBottomRow'>\n" +
            "           <div id='headerMessage' class='bottomLeftBottomHeaderArea'></div>\n" +
            "           <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
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
            "<div id='customMessage' class='displayHidden customMessageContainer'></div>\n" +
            "<div id='indexCatTreeContainer' class='oggleHidden'></div>\n" +
            "<div id='feedbackDialog' class='modalDialog' title='Feedback'>\n" +
            "   <div><input type='radio' name='feedbackRadio' value='complement' checked='checked'> complement\n" +
            "       <input type='radio' name='feedbackRadio' value='suggestion'> suggestion\n" +
            "       <input type='radio' name='feedbackRadio' value='report error'> report error" +
            "   </div>\n" +
            "   <div id='feedbackDialogSummerNoteTextArea'></div>\n" +
            "   <div id='btnfeedbackDialogSave' class='roundendButton' onclick='saveFeedbackDialog(" + folderId + ")'>Send</div>\n" +
            "   <div id='btnfeedbackDialogCancel' class='roundendButton' onclick='closeFeedbackDialog()'>Cancel</div>\n" +
            "</div>";
        $('header').html(headerHtml);
    }

    getFolderInfo(folderId);

    if (isLoggedIn()) {
        $('#spnUserName').html(getCookieValue("UserName"));
        $('#optionLoggedIn').show();
        //alert(getCookieValue("UserName") + " isLoggedIn(): " + isLoggedIn());
        $('#optionNotLoggedIn').hide();
        //setTimeout(function () { if (isInRole("Oggle admin")) { $('#dashboardMenuItem').show(); } }, 400);
        if (isInRole("Oggle admin")) {
            //alert("is in role Oggle admin");
            $('#dashboardMenuItem').show();
        }
        else
            $('#dashboardMenuItem').hide();
    }
    else {
        $('#dashboardMenuItem').hide();
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
    }
    // LOOK UP FOLDER DETAIL FOR BADGES AND TRACKBACK LINKS
    //if (containsImageLinks)
    {
        if (settingsArray.ApiServer !== undefined) {
            //if (getCookieValue("IpAddress") === "68.203.90.183") alert("isStaticPage: " + isStaticPage);
            showSpecialHeaderIcons(folderId);
            setTrackbackLinks(folderId);
        }
    }
}

function getFolderInfo(folderId) {
    try {
        if (!isNullorUndefined(settingsArray.ApiServer)) {
            // [Route("api/AlbumPage/GetFolderInfo")]
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/Folder/GetFolderInfo?folderId=" + folderId,
                success: function (rootFolderModel) {
                    if (rootFolderModel.Success === "ok") {
                        setHeaderDetails(rootFolderModel.RootFolder, folderId);
                        setOggleFooter(rootFolderModel.RootFolder, folderId);
                    }
                    else {
                        if (document.domain === 'localhost')
                            alert("GetFolderInfo: " + rootFolderModel.Success);
                        if (rootFolderModel.Success.indexOf("Option not supported") > -1) {
                            if (!checkFor404(rootFolderModel.Success, "setAlbumPageHeader")) {
                                logError({
                                    VisitorId: getCookieValue("VisitorId"),
                                    ActivityCode: "ERR",
                                    Severity: 1,
                                    ErrorMessage: rootFolderModel.Success,
                                    CalledFrom: "Album.js setAlbumPageHeader"
                                });
                            }
                            //sendEmailToYourself("SERVICE DOWN", "from getBreadCrumbs<br/>folderId=" + folderId + "<br/>IpAddress: " +
                            //    getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
                        }
                        else {
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "ERR",
                                Severity: 1,
                                ErrorMessage: folderDetailModel.Success,
                                CalledFrom: "Album.js setAlbumPageHeader"
                            });
                            //sendEmailToYourself("setAlbumPageHeader FAILURE", "api/AlbumPage/GetFolderInfo?folderId=" + folderId + "<br>" + successModel.Success);
                        }
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "setAlbumPageHeader")) {
                        if (document.domain === 'localhost')
                            alert("GetFolderInfo XHR: " + errorMessage + " id:" + folderId + "\nsettingsArray.ApiServer: " + settingsArray.ApiServer);
                        else {
                            if (isNullorUndefined(getCookieValue("IpAddress")))
                                logVisitor(folderId, "setAlbumPageHeader");
                            else {
                                logError({
                                    VisitorId: getCookieValue("VisitorId"),
                                    ActivityCode: "XHR",
                                    Severity: 1,
                                    ErrorMessage: errorMessage,
                                    CalledFrom: "Album.js setAlbumPageHeader"
                                });
                                //sendEmailToYourself("XHR Error setAlbumPageHeader",
                                //    "settingsArray.ApiServer: " + settingsArray.ApiServer +
                                //    "<br/>folderId: " + folderId +
                                //    "<br/>isStaticPage: " + isStaticPage +
                                //    "<br/>IpAddress: " + getCookieValue("IpAddress") +
                                //    "<br/>" + errorMessage);
                            }
                        }
                        setHeaderDetails("boobs", folderId);
                        setOggleFooter("boobs", folderId);
                    }
                    else {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 1,
                            ErrorMessage: errorMessage,
                            CalledFrom: "Album.js setAlbumPageHeader"
                        });
                        //sendEmailToYourself("XHR ERROR IN ALBUM.JS setAlbumPageHeader", "api/AlbumPage/GetRootFolder?folderId=" + folderId + " <br/>" + errorMessage);
                    }
                }
            });
        }
        else {
            if (document.domain === 'localhost')
                alert("settingsArray null");
            //else {
            //    logError({
            //        VisitorId: getCookieValue("VisitorId"),
            //        ActivityCode: "XHR",
            //        Severity: 1,
            //        ErrorMessage: errorMessage,
            //        CalledFrom: "Album.js setAlbumPageHeader"
            //    });
            //}
            setHeaderDetails("boobs", folderId);
            setOggleFooter("boobs", folderId);
        }
    } catch (e) {
        if (document.domain === 'localhost')
            alert("setAlbumPageHeader: " + e);
        else {
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CAT",
                Severity: 1,
                ErrorMessage: e,
                CalledFrom: "Album.js setAlbumPageHeader"
            });
            //sendEmailToYourself("setAlbumPageHeader", e);
        }
    }
}

function setHeaderDetails(subdomain, folderId) {
    $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"boobs\")'><img src='/Images/redballon.png' class='bannerImage'/></a>\n");
    $('#bannerTitle').html("OggleBooble");
    switch (subdomain) {
        case "admin":
            $('header').switchClass('pornHeader', 'boobsHeader');
            $("#divLoginArea").hide();
            $('#subheaderContent').html("admin");
            break;
        case "blog":
            $('#subheaderContent').html("blog");
            break;
        case "ranker":
            $('#subheaderContent').html("ranker");
            break;
        case "archive":
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",4)'>milk cows,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1103)'>russian spys,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1093)'>highschool fantasy girls,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1107)'>sweater meat,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",123)'>ultra juggs</a> \n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");

            
            $('#playboyLink').html("<div class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"BAC\"," + folderId + ",1132)'>every Playboy Centerfold</a></div>\n");


            break;
        case "special":
        case "boobs": {
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",136)'> poses,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3916)'> positions,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",159)'> topics,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",199)'> shapes</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",241)'>sizes</a>\n");

            //DUTCH subheaderContent =
            //    "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
            //    "                <a href='/album.html?folder=136'> rejser,</a>\n" +
            //    "                <a href='/album.html?folder=159'> emne,</a>\n" +
            //    "                <a href='/album.html?folder=199'> figurer</a> og\n" +
            //    "                <a href='/album.html?folder=241'>størrelser</a>\n";

            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3)'>babes archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"boobs\")'" +
                " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n");
        }
            break;
        case "playboy":
        case "playmates": {
            $('header').switchClass('pornHeader', 'boobsHeader');
            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"playboy\")'><img src='/Images/playboyBallon.png' class='bannerImage'/></a>\n");
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1132)'>Centerfolds,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1986)'> magazine covers,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3796)'> cybergirls,</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2601)'> extras</a>\n");

            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3)'>big tits archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"playboy\")' " +
                "title='Spin through the links to land on random portrait images.'>playmate ranker</a></div>\n");
            break;
        }
        case "porn":
        case "sluts":
            $('header').switchClass('boobsHeader', 'pornHeader');
            changeFavoriteIcon();
            $('body').addClass('pornBodyColors');
            $('#subheaderContent').html(
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",243)'>cock suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",420)'>boob suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",357)'>cum shots</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",397)'>kinky</a> and \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",411)'>naughty behaviour</a>\n");

            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"porn\")'><img src='/Images/csLips02.png' class='bannerImage'/></a>\n");
            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440)'>slut archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\")' " +
                "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n");
            $('#bannerTitle').html("OgglePorn");
            break;
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BUG",
                Severity: 2,
                ErrorMessage: "switch case not handled. FolderId: " + folderId + ", Subdomain: " + subdomain,
                CalledFrom: "OggleHeader setOggleHeader"
            });
        //sendEmailToYourself("OggleHeader switch ","folderId: " + folderId+ "<br/>subdomain: " + subdomain);
        //alert("subdomain: " + subdomain + "  not found");
        //console.log("subdomain: " + subdomain + "  not found");
    }



}

function showSpecialHeaderIcons(folderId) {
    //alert("showSpecialHeaderIcons: " + folderId);
    if (!isNullorUndefined(settingsArray.ApiServer)) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/ImageCategoryDetail/Get?folderId=" + folderId,
            success: function (folderDetailModel) {
                if (folderDetailModel.Success === "ok") {
                    if (!isNullorUndefined(folderDetailModel.ExternalLinks)) {
                        if (folderDetailModel.ExternalLinks.indexOf("Playmate Of The Year") > -1) {
                            $('#pmoyLink').show();
                        }
                        if (folderDetailModel.ExternalLinks.indexOf("biggest breasted centerfolds") > -1) {
                            $('#breastfulPlaymatesLink').show();
                        }
                        if (folderDetailModel.ExternalLinks.indexOf("black centerfolds") > -1) {
                            $('#blackCenterfoldsLink').show();
                        }
                        if (folderDetailModel.ExternalLinks.indexOf("Hef likes twins") > -1) {
                            $('#twinsLink').show();
                        }
                    }
                }
                else {
                    if (verbosity > 20) {
                        if (folderDetailModel.Success.indexOf("Option not supported") > -1) {
                            if (!checkFor404(folderDetailModel.Success, "showSpecialHeaderIcons")) {
                                logError({
                                    VisitorId: getCookieValue("VisitorId"),
                                    ActivityCode: "404",
                                    Severity: 1,
                                    ErrorMessage: folderDetailModel.Success,
                                    CalledFrom: "OggleHeader showSpecialHeaderIcons"
                                });
                            }
                        }
                        else {
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "BUG",
                                Severity: 1,
                                ErrorMessage: folderDetailModel.Success,
                                CalledFrom: "OggleHeader showSpecialHeaderIcons"
                            });
                        }
                        //sendEmailToYourself("SERVICE DOWN", "from showSpecialHeaderIcons<br/>folderId=" + folderId + "<br/>IpAddress: " +
                        //    getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
                    }
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "showSpecialHeaderIcons")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "OggleHeader showSpecialHeaderIcons"
                    });
                    //sendEmailToYourself("XHR ERROR IN OggleHeader.JS showSpecialHeaderIcons",
                    //    "/api/ImageCategoryDetail/Get?folderId=" + folderId +
                    //    " IpAddress: " + getCookieValue("IpAddress") +
                    //    " Message : " + errorMessage);
                    //alert("containsLink xhr: " + getXHRErrorDetails(xhr));
                }
            }
        });
    }
}

function setTrackbackLinks(folderId) {
    if (!isNullorUndefined(settingsArray.ApiServer)) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/TrackbackLink/GetTrackBacks?folderId=" + folderId,
            success: function (trackBackModel) {
                if (trackBackModel.Success === "ok") {
                    $.each(trackBackModel.TrackBackItems, function (idx, trackBackItem) {
                        if (trackBackItem.Site === "Babepedia") {
                            $('#babapediaLink').html(trackBackItem.TrackBackLink);
                            $('#babapediaLink').show();
                        }
                        if (trackBackItem.Site === "Freeones") {
                            $('#freeonesLink').html(trackBackItem.TrackBackLink);
                            $('#freeonesLink').show();
                        }
                        if (trackBackItem.Site === "Indexxx") {
                            $('#indexxxLink').html(trackBackItem.TrackBackLink);
                            $('#indexxxLink').show();
                        }
                    });
                }
                else {
                    if (verbosity > 20) {
                        //if (trackBackModel.Success.indexOf("Option not supported") > -1) {
                        //checkFor404(trackBackModel.Success, "setTrackbackLinks");
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BUG",
                            Severity: 3,
                            ErrorMessage: trackBackModel.Success,
                            CalledFrom: "OggleHeader setTrackbackLinks"
                        });
                    }
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "setTrackbackLinks")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 3,
                        ErrorMessage: errorMessage,
                        CalledFrom: "OggleHeader setTrackbackLinks"
                    });
                    //sendEmailToYourself("XHR ERROR IN setTrackbackLinks",
                    //    "folderId=" + folderId + "<br/>IpAddress: " +
                    //    getCookieValue("IpAddress") + "<br/>Message : " + errorMessage);

                    //http://localhost:56437/undefined/api/ImageCategoryDetail/Get?folderId=3908
                }
            }
        });
    }
}

function showFeedbackDialog() {
    $('#feedbackDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'center', at: 'top' },
        width: "560"
    });
    $('#feedbackDialogSummerNoteTextArea').summernote({
        height: 300,
        toolbar: [['codeview']]
    });
    //$('#feedbackDialog').dialog("show");
    //alert("showFeedbackDialog2");
}
function saveFeedbackDialog(pageId) {

    //alert("radio: " + $('#feedbackDialog input[type=\'radio\']:checked').val());
    var feedBackModel = {
        VisitorId: getCookieValue("VisitorId"),
        PageId: pageId,
        FeedBackComment: $('#feedbackDialogSummerNoteTextArea').summernote('code'),
        FeedBackType: $('#feedbackDialog input[type=\'radio\']:checked').val()
    };

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/FeedBack",
        data: feedBackModel,
        success: function (success) {
            if (success === "ok") {
                logEventActivity({
                    VisitorId: visitorId,
                    EventCode: "FED",
                    EventDetail: "FeedBack Sent !!",
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("FeedBack", "ip: " + getCookieValue("IpAddress") + "<br/>"
                //    + $('#feedbackDialogSummerNoteTextArea').summernote('code'));
                //console.log("is email working?");
                $('#feedbackDialog').dialog("close");
                alert("Thank you for your feedback");
            }
            else {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "DBL",
                    Severity: 3,
                    ErrorMessage: success,
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                //if (document.domain === 'localhost')
                //    alert("EditFolderCategory: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "saveFeedbackDialog")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("XHR ERROR in FolderCategory.js saveCategoryDialogText",
                //    "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" +
                //    $('#catDlgSummerNoteTextArea').summernote('code') + " Message: " + errorMessage);
            }
        }
    });


}
function closeFeedbackDialog() {
    $("#feedbackDialog").dialog('close');
}
