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

function setOggleHeader(subdomain, folderId, containsImageLinks, isStaticPage) {
    //alert("setOggleHeader called from " + folderId);
    var headerHtml;
    var lang = "en";
    var subheaderContent;
    var websiteName = "OggleBooble";
    var boobsRankerLink = "";
    var bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\"," + folderId + ",\"boobs\")'><img src='/Images/redballon.png' class='bannerImage'/></a>\n";
    var archiveLink = "";

    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("setOggleHeader subdomain " + subdomain + "  folderId: " + folderId + " containsImageLinks: " + containsImageLinks);

    $('header').switchClass('pornHeader', 'boobsHeader');
    switch (subdomain) {
        case "blog":
            subheaderContent = "blog";
            break;
        case "ranker":
            subheaderContent = "ranker";
            break;
        case "archive":
            subheaderContent = "Archive";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>" +
                "\n<a href='javascript:reportThenPerformEvent(\"RNK\"," + folderId + ",\"archive\")'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n";
            break;
        case "boobs":
            subheaderContent =
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",136)'> poses,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",3916)'> positions,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",159)'> topics,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",199)'> shapes</a> and\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",241)'>sizes</a>\n";

            //DUTCH subheaderContent =
            //    "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
            //    "                <a href='/album.html?folder=136'> rejser,</a>\n" +
            //    "                <a href='/album.html?folder=159'> emne,</a>\n" +
            //    "                <a href='/album.html?folder=199'> figurer</a> og\n" +
            //    "                <a href='/album.html?folder=241'>størrelser</a>\n";
            archiveLink = "<a href='javascript:reportThenPerformEvent(\"BAC\"," + folderId + ",3)' class='babesArchive'>babes archive</a>";

            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>" +
                "\n<a href='javascript:reportThenPerformEvent(\"RNK\"," + folderId + ",\"boobs\")'" +
                " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n";


            //alert("setLoginHeader. top strings built.<br/>subdomain: " + subdomain + "  folderId: " + folderId);


            break;
        case "playboy":
        case "playmates":
            $('header').switchClass('pornHeader', 'boobsHeader');
            bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\"," + folderId + ",\"playboy\")'><img src='/Images/playboyBallon.png' class='bannerImage'/></a>\n";
            //bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\",1132)'><img  class='bannerImage' src='/Images/redballon.png' title='home. Find lots of cool things here.'/></a>\n";
            subheaderContent =
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",1132)'>Centerfolds,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",1986)'> magazine covers,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",3796)'> cybergirls,</a> and\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",2601)'> extras</a>\n";

            archiveLink = "  <a href='javascript:reportThenPerformEvent(\"BAC\"," + folderId + ",3)' class='babesArchive'>big tit archive</a>";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>\n<a href='javascript:reportThenPerformEvent(\"RNK\"," + folderId + ",\"playboy\")' " +
                "title='Spin through the links to land on random portrait images.'>playmate ranker</a></div>\n";
            break;
        case "porn":
        case "sluts":
            $('header').switchClass('boobsHeader', 'pornHeader');

            //changeFavicon(src);

            $('body').addClass('pornBodyColors');
            subheaderContent =
                "               <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",243)'>cock suckers</a>, \n" +
                "               <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",420)'>boob suckers</a>, \n" +
                "               <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",357)'>cum shots</a>, \n" +
                "               <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",397)'>kinky</a> and \n" +
                "               <a href='javascript:reportThenPerformEvent(\"BLC\"," + folderId + ",411)'>naughty behaviour</a>\n";

            bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\"," + folderId + ",\"porn\")'><img src='/Images/csLips02.png' class='bannerImage'/></a>\n";
            archiveLink = "  <a href='javascript:reportThenPerformEvent(\"BAC\"," + folderId + ",440)' class='babesArchive'>slut archive</a>";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>\n<a href='javascript:reportThenPerformEvent(\"RNK\"," + folderId + ",\"" + subdomain + "\")' " +
                "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n";
            //bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\",3909)'><img src='/Images/cslips02.png' title='porn home' class='bannerImage'/></a>\n";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>\n<a href='javascript:reportThenPerformEvent(\"RNK\",3909)' title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n";
            websiteName = "OgglePorn";
            break;
        case "admin":
            $('header').switchClass('pornHeader', 'boobsHeader');
            $("#divLoginArea").hide();
            subheaderContent = "Admin";
            break;
        default:
            sendEmailToYourself("OggleHeader switch ","folderId: " + folderId+ "<br/>subdomain: " + subdomain);

        //alert("subdomain: " + subdomain + "  not found");
        //console.log("subdomain: " + subdomain + "  not found");
    }

    // HEADER HTML
    {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" + bannerImageLink + "</div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div id='' class='headerTopRow'>\n" +
            "           <div id='bannerTitle' class='headerTitle'>" + websiteName + "</div >\n" +
            //"                  <img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
            //"                   title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
            //"                   \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
            //"                   \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +
            "           <div id='headerSubTitle' class='topLinkRow'>\n" + subheaderContent + "</div>\n" + archiveLink + boobsRankerLink +
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
            "<div id='notConnectMessage' class='displayHidden customMessageContainer'></div>\n" +
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
    if (isLoggedIn()) {
        $('#spnUserName').html(getCookieValue("UserName"));
        $('#optionLoggedIn').show();
        //alert(getCookieValue("UserName") + " isLoggedIn(): " + isLoggedIn());
        $('#optionNotLoggedIn').hide();
        //setTimeout(function () { if (isInRole("Oggle admin")) { $('#dashboardMenuItem').show(); } }, 400);
        if (isInRole("Oggle admin"))
            $('#dashboardMenuItem').show();
    }
    else {
        $('#dashboardMenuItem').hide();
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
    }
    // LOOK UP FOLDER DETAIL FOR BADGES AND TRACKBACK LINKS
    if (containsImageLinks) {
        //if (getCookieValue("IpAddress") === "68.203.90.183") alert("isStaticPage: " + isStaticPage);
        showSpecialHeaderIcons(folderId);
        if (!isStaticPage) {
            setTrackbackLinks(folderId);
        }
    }
}

function showSpecialHeaderIcons(folderId) {
    //alert("showSpecialHeaderIcons: " + folderId);
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
                if (folderDetailModel.Success.indexOf("Option not supported") > -1) {
                    checkFor404(folderDetailModel.Success, "showSpecialHeaderIcons");
                    sendEmailToYourself("SERVICE DOWN", "from showSpecialHeaderIcons<br/>folderId=" + folderId + "<br/>IpAddress: " +
                        getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
                }
                else
                    sendEmailToYourself("Error in showSpecialHeaderIcons", +
                        "ip: " + getCookieValue("IpAddress") +
                        "<br/>folderId: " + folderId +
                        "<br/>" + folderDetailModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "showSpecialHeaderIcons")) {
                sendEmailToYourself("XHR ERROR IN OggleHeader.JS showSpecialHeaderIcons",
                    "/api/ImageCategoryDetail/Get?folderId=" + folderId +
                    " IpAddress: " + getCookieValue("IpAddress") +
                    " Message : " + errorMessage);
                //alert("containsLink xhr: " + getXHRErrorDetails(xhr));
            }
        }
    });
}

function setTrackbackLinks(folderId) {
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
                if (trackBackModel.Success.indexOf("Option not supported") > -1) {
                    checkFor404(trackBackModel.Success, "setTrackbackLinks");
                    sendEmailToYourself("SERVICE DOWN", "from setTrackbackLinks<br/>folderId=" + folderId + "<br/>IpAddress: " +
                        getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
                }
                else
                    sendEmailToYourself("setTrackbackLinks", "folderId=" + folderId + "<br/>IpAddress: " +
                        getCookieValue("IpAddress") + "<br/>Message : " + errorMessage);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (document.domain === 'localhost') {
                alert("XHR ERROR IN setTrackbackLinks\nfolderId=" + folderId +
                    "\nurl: " + settingsArray.ApiServer + "api/TrackbackLink/GetTrackBacks?folderId=" + folderId +
                    "\nIpAddress: " + getCookieValue("IpAddress") +
                    "<br/>Message : " + errorMessage);
            }
            else {
                if (!checkFor404(errorMessage, "setTrackbackLinks")) {
                    sendEmailToYourself("XHR ERROR IN setTrackbackLinks",
                        "folderId=" + folderId + "<br/>IpAddress: " +
                        getCookieValue("IpAddress") + "<br/>Message : " + errorMessage);
                }
            }
        }
    });
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

    alert("radio: " + $('#feedbackDialog input[type=\'radio\']:checked').val());
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
                sendEmailToYourself("FeedBack", "ip: " + getCookieValue("IpAddress") + "<br/>"
                    + $('#feedbackDialogSummerNoteTextArea').summernote('code'));
                $('#feedbackDialog').dialog("close");
                alert("Thank you for your feedback");
            }
            else {
                sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                if (document.domain === 'localhost')
                    alert("EditFolderCategory: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "saveCategoryDialogText")) {
                sendEmailToYourself("XHR ERROR in FolderCategory.js saveCategoryDialogText",
                    "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" +
                    $('#catDlgSummerNoteTextArea').summernote('code') + " Message: " + errorMessage);
            }
        }
    });


}
function closeFeedbackDialog() {
    $("#feedbackDialog").dialog('close');
}


