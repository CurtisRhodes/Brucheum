function setOggleHeader(subdomain, folderId) {
    //alert("setLoginHeader: " + subdomain);
    var headerHtml;
    var lang = "en";
    var subheaderContent;
    var boobsRankerLink = "";
    var bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\",3908)'><img src='/Images/redballon.png' class='bannerImage'/></a>\n";

    if (subdomain === "special") {
        // comming in from staticPage.js
        switch (folderId) {
            case 1139: subdomain = "blog"; break;
            case 3907: subdomain = "ranker"; break;
            case 3909: subdomain = "ranker"; break;
            //3906	Transitions
            //3907	Ranker
            //3908	Index
            //3909	Porn Index
            //3910	Admin Dashboard
            default: subdomain = "boobs";
        }
        sendEmailToYourself("Someone click on a special page from a staic",
            "special page: " + subdomain + "  folderId: " + folderId + "  ip: " + getCookieValue("IpAddress"));
    }

    switch (subdomain) {
        case "boobs":
        case "archive":
        //case "special":
            subheaderContent =
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",136)'> poses,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",3916)'> positions,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",159)'> topics,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",199)'> shapes</a> and\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",241)'>sizes</a>\n";

            //subheaderContent =
            //    "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
            //    "                <a href='/album.html?folder=136'> rejser,</a>\n" +
            //    "                <a href='/album.html?folder=159'> emne,</a>\n" +
            //    "                <a href='/album.html?folder=199'> figurer</a> og\n" +
            //    "                <a href='/album.html?folder=241'>størrelser</a>\n";
            bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\",3908)'><img  class='bannerImage' src='/Images/redballon.png' title='home. Find lots of cool things here.'/></a>\n";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>\n<a href='javascript:reportThenPerformEvent(\"RNK\",\"boobs\")' title='Spin through the links to land on random portrait images. ' >boobs ranker</a></div>\n";
            break;
        case "playboy":
        case "playmates":
            subheaderContent =
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",1132)'>Centerfolds,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",1986)'> magazine covers,</a>\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",3796)'> cybergirls,</a> and\n" +
                "                <a href='javascript:reportThenPerformEvent(\"BLC\",2601)'> extras</a>\n";

            bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\",1132)'><img  class='bannerImage' src='/Images/redballon.png' title='home. Find lots of cool things here.'/></a>\n";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>\n<a href='javascript:reportThenPerformEvent(\"RNK\",\"playboy\")' title='Spin through the links to land on random portrait images. ' >Playmate Ranker</a></div>\n";
            break;
        case "porn":
        case "sluts":
            $('body').addClass('pornBodyColors');
            subheaderContent =
                "               <a href='javascript:reportThenPerformEvent(\"BLC\",243)'>cock suckers</a>, \n" +
                "               <a href=''javascript:reportThenPerformEvent(\"BLC\",420)'>boob suckers</a>, \n" +
                "               <a href=''javascript:reportThenPerformEvent(\"BLC\",357)'>cum shots</a>, \n" +
                "               <a href=''javascript:reportThenPerformEvent(\"BLC\",397)'>kinky</a> and \n" +
                "               <a href=''javascript:reportThenPerformEvent(\"BLC\",411)'>naughty behaviour</a>\n";

            bannerImageLink = "<a href='javascript:reportThenPerformEvent(\"HBC\",3909)'><img src='/Images/cslips02.png' title='porn home' class='bannerImage'/></a>\n";
            boobsRankerLink = "<div id='rankerTag' class='boobRankerBanner'>\n<a href='javascript:reportThenPerformEvent(\"RNK\",\"porn\")' title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n";
            break;
        case "admin":
            subheaderContent = "Admin";
            break;
        case "blog":
            subheaderContent = "Blog";
            break;
        case "ranker":
            subheaderContent = "Hotness Rater";
            break;
        default:
            sendEmailToYourself("ERROR in OggleHeader setOggleHeader",
                "Message: " + successModel.Success + "subdomain: " + subdomain + "  ip: " + getCookieValue("IpAddress") + "  folderId: " + folderId);
                
            //alert("subdomain: " + subdomain + "  not found");
            //console.log("subdomain: " + subdomain + "  not found");
    }

    if (isNullorUndefined(subheaderContent)) {
        sendEmailToYourself("ERROR in OggleHeader setOggleHeader", "isNullorUndefined(subheaderContent)");
        alert("ERROR in OggleHeader setOggleHeader:  isNullorUndefined(subheaderContent)");
    }
    else {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" + bannerImageLink + "</div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div id='' class='headerTopRow'>\n" +
            "           <div id='bannerTitle' class='headerTitle'>OggleBooble</div>\n" +
            "           <div id='headerSubTitle' class='headerSubTitle'>\n" + subheaderContent + "</div>\n" + boobsRankerLink +
            "           <div class='OggleSearchBox'>\n" +
            "               <span id='notUserName'>search</span> <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
            "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
            "           </div>\n" +
            "       </div>\n" +
            "       <div class='headerBottomRow'>\n" +
            "           <div id='headerMessage' class='bottomLeftBottomHeaderArea'></div>\n" +
            "           <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
            "           <div class='menuTabs replaceableMenuItems'>\n" +
            "               <div id='twinsLink' class='menuTabs displayHidden'>\n" +
            "                   <a href='/album.html?folder=3904'><img src='/Images/geminiSymbol1.png' title='Hef likes twins' class='trackbackImage'></a>" +
            "               </div>\n" +
            "               <div id='breastfulPlaymatesLink' class='menuTabs displayHidden'>\n" +
            "                   <a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='trackbackImage'></a>" +
            "               </div>\n" +
            "               <div id='blackCenterfoldsLink' class='menuTabs displayHidden'>\n" +
            "                   <div class='blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>\n" +
            "               </div>\n" +
            "               <div id='freeonesLink' class='menuTabs displayHidden'>\n" +
            //"                   <a href='http://www.freeones.com' target='_top'><img src='http://www.freeones.com/webmasters/banners/freeones_new.gif' width='120' height='60' title='FreeOnes - The ultimate babes site' alt='models, babes and porn stars'/></a>\n"+
            "                   <a href='http://www.freeones.com' target='_blank' text='free porn'><img src='/Images/freeones.png' title='FreeOnes - The ultimate babes site' alt='models, babes and porn stars' class='trackbackImage'></a>" +
            "               </div>\n" +
            "               <div id='babapediaLink' class='menuTabs displayHidden'>\n" +
            "                   <a href='https://www.babepedia.com' target='_blank'><img src='/Images/babepedia.png' class='trackbackImage'></a>" +
            "               </div>\n" +
            "           </div>\n" +
            "           <div class='loginArea'>\n" +
            "               <div id='optionLoggedIn' class='displayHidden'>\n" +
            "                   <div class='menuTab adminLevelRequired displayHidden'><a href='/Dashboard.html'>Dashboard</a></div>\n" +
            "                   <div class='menuTab' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
            "                   <div class='menuTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
            "               </div>\n" +
            "               <div id='optionNotLoggedIn'>\n" +
            "                   <div id='btnLayoutRegister' class='menuTab'><a href='javascript:onRegisterClick()'  onmouseover='slowlyShowCustomMessage(69)' onmouseout='forgetShowingCustomMessage=true;' >Register</a></div>\n" +
            "                   <div id='btnLayoutLogin' class='menuTab'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
            "               </div>\n" +
            "           </div>\n" +
            "       </div>\n" +
            "   </div>\n" +
            "<div id='customMessage' class='displayHidden customMessageContainer'></div>\n" +
            "<div id='indexCatTreeContainer' class='oggleHidden'></div>";
        $('header').html(headerHtml);
    }

    //  function setLoginHeader(folderId) {
    if (document.domain === 'localhost') {  //        if (ipAddress !== "68.203.90.183" && ipAddress !== "50.62.160.105") {
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
    }
    else {
        var user = getCookieValue("User");
        if (isNullorUndefined(user)) {
            $('#optionLoggedIn').hide();
            $('#optionNotLoggedIn').show();
        }
        else {
            //alert("setLoginHeader user: " + user);
            $('#spnUserName').html(user);
            $('#optionLoggedIn').show();
            $('#optionNotLoggedIn').hide();
        }
    }
    showSpecialHeaderIcons(folderId);
}

function showSpecialHeaderIcons(folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/Get?folderId=" + folderId,
        //url: settingsArray.ApiServer + "api/StaticPage/HasLink?folderId=" + folderId + "&hrefTextSubstring=" + hrefTextSubstring,
        success: function (folderDetailModel) {
            //folderDetailModel.ExternalLinks = categoryFolderDetails.ExternalLinks;
            if (folderDetailModel.Success === "ok") {
                //checkForLink(params.folder, "black centerfolds");
                //checkForLink(params.folder, "freeones");
                //checkForLink(params.folder, "babepedia");
                //alert("folderDetailModel.ExternalLinks: " + folderDetailModel.ExternalLinks);

                // 
                if (!isNullorUndefined(folderDetailModel.ExternalLinks)) {

                    if (folderDetailModel.ExternalLinks.indexOf("biggest breasted centerfolds") > 0) {
                        $('#breastfulPlaymatesLink').show();
                    }
                    if (folderDetailModel.ExternalLinks.indexOf("black centerfolds") > 0) {
                        $('#blackCenterfoldsLink').show();
                    }
                    if (folderDetailModel.ExternalLinks.indexOf("Hef likes twins") > 0) {
                        $('#twinsLink').show();
                    }
                    if (folderDetailModel.ExternalLinks.indexOf("www.freeones.com") > 0) {
                        $('#freeonesLink').show();
                    }
                    if (folderDetailModel.ExternalLinks.indexOf("www.babepedia.com") > 0) {
                        $('#babapediaLink').show();
                    }
                }
            }
            else {
                //alert("ERROR in OggleHeader ImageCategoryDetail  " + successModel.Success + "  ip: " + getCookieValue("IpAddress") + "  folderId: " + folderId);
                if (!checkFor404(successModel.Success, "showSpecialHeaderIcons")) {
                    sendEmailToYourself("ERROR in OggleHeader showSpecialHeaderIcons",
                        "Message: " + successModel.Success + "  ip: " + getCookieValue("IpAddress") + "  folderId: " + folderId);
                    // verify network
                }
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "setSpecialLinks")) {
                sendEmailToYourself("XHR ERROR IN OggleHeader.JS showSpecialHeaderIcons", "/api/ImageCategoryDetail/Get?folderId=" + folderId +
                    " Message : " + errorMessage);
                //alert("containsLink xhr: " + getXHRErrorDetails(xhr));
            }
        }
    });
}
    



