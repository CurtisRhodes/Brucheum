var hdrFolderId, hdrSubdomain;
function setOggleHeader(folderId, subdomain) {
    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("setOggleHeader subdomain " + subdomain + "  folderId: " + folderId + " containsImageLinks: " + containsImageLinks);
    if (subdomain === undefined) subdomain = "boobs";
    hdrFolderId = folderId;
    hdrSubdomain = subdomain;

    //if(subdomain.contains("porn,"))
    $('.oggleHeader').addClass("boobsHeader");

    $('.oggleHeader').html(headerHtml(folderId));
    $('.oggleHeader').append(draggableDialogHtml());

//    $('.oggleHeader').append(modalDialogHtml());

    $('#draggableDialog').resizable({
        resize: function (event, ui) {
            //$('#headerMessage').html("onresize: " + event.pageX + " note-editable.height: " + $('.note-editable').height());
            $('#headerMessage').html("dH: " + $('#draggableDialog').height() + " sH: " + $('.note-editable').height());
            $('.note-editable').height($('#draggableDialog').height() - 360);
        }
    });

    setMenubar(subdomain);
    setHeaderDetails(folderId, subdomain);
    setLoginHeaderSection(subdomain);

    $('#badgesContainer').append("<a href='/album.html?folder=4013'><img src='/Images/pmoy.png' title='Playmate of the year' class='badgeImage'></a>");
    $('#badgesContainer').append("<a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='badgeImage'></a>");
    $('#badgesContainer').append("<div class='blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>");
    $('#badgesContainer').append("<a href='/album.html?folder=3904'><img src='/Images/gemini03.png' title='Hef likes twins' class='badgeImage'></a>");

    window.addEventListener("resize", headerResize);
    headerResize(subdomain);
}

function headerResize() {
    let hdrBottRowW = $('.headerBottomRow').width();
    let hdrBottRowSectionsW = $('#badgesContainer').width() + $('#divLoginArea').width() + $('#breadcrumbContainer').width() + $('#headerMessage').width();
    $('#txtSearch').val("BotW: " + hdrBottRowW + " Secs: " + hdrBottRowSectionsW);

    // header reset
    if (hdrBottRowSectionsW < hdrBottRowW) {
        setMenubar(subdomain);
        $('.oggleHeader').css("background-color", "var(--brucheumBlue)");
        $('#divLoginArea').css("fon-t-size", 14);
    }
    if (hdrBottRowSectionsW >= hdrBottRowW) {
        $('.oggleHeader').css("background-color", "#ccffcc");  // green
        $('#divLoginArea').css("font-size", 12);
        $('#headerMessage').html(hdrBottRowSectionsW - hdrBottRowW)
        hdrBottRowSectionsW = $('#badgesContainer').width() + $('#divLoginArea').width() + $('#breadcrumbContainer').width() + $('#headerMessage').width();
    }
    if (hdrBottRowSectionsW >= hdrBottRowW) {
        $('#divLoginArea').css("font-size", 12);
        $('header').switchClass('.headerFeatureBanner', 'littleBanners');
        hdrBottRowSectionsW = $('#badgesContainer').width() + $('#divLoginArea').width() + $('#breadcrumbContainer').width() + $('#headerMessage').width();
    }
    if (hdrBottRowSectionsW >= hdrBottRowW) {
        $('.oggleHeader').css("background-color", "#ecc6c6"); // brown
    }

    //if (hdrW < 1320 && hdrW > 1260) {
    //    $('#divLoginArea').css("font-size", 14);
    //    setMenubar(hdrSubdomain);
    //}
    //if (hdrW < 1320 && hdrW > 1260) {
    //    $('#mainMenuContainer').css("font-size", 17);
    //    $('#divLoginArea').css("font-size", 10);
    //    setMenubar(hdrSubdomain);
    //}
    //if (hdrW < 1260) {
    //    $('#mainMenuContainer').css("font-size", 17);
    //    $('#divLoginArea').css("font-size", 10);

    //    setMenubar(hdrSubdomain);
    //}
    if (hdrBottRowW < 800) {
        $('#breadcrumbContainer').hide();
        $('#mainMenuContainer').html("<img src='/Images/hamburger.png' onclick='$('#hamburgerCtx').show()' height=50px />");
    }
    //$('#headerMessage').html("hdrW: " + hdrW);


    //<div id='breadcrumbContainer' class='breadCrumbArea'>
    //$('.headerBodyContainer').css("font-size", 10);
    //$('.headerBodyContainer').css("font-size", 10);
    //$('#breadcrumbContainer').html("<div id='rankerTag'><a href='javascript:rtpe(\"RNK\"," + hdrFolderId + ",\"archive\")'" +
    //    " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n" +
    //    "<div><a href='javascript:rtpe(\"BAC\"," + hdrFolderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n" +
    //    "<div id='rankerTag'><a href='javascript:rtpe(\"BAC\"," + hdrFolderId + ",3,3)'>babes archive</a></div>\n");
    // $('#breadcrumbContainer').html("");

}

// rtpe(eventCode, calledFrom, eventDetail, pageId)
function setMenubar(subdomain) {
    switch (subdomain) {
        case "archive": {
            $('#mainMenuContainer').html(
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",4,4,)'>milk cows,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1103,1103)'>russian spys,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1093,1093)'>highschool fantasy girls,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1107,1107)'>sweater meat,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",123,123)'>ultra juggs</a> \n");
            break;
        }
        case "playboy":
        case "centerfold": {
            $('header').switchClass('pornHeader', 'boobsHeader');
            $('#mainMenuContainer').html(
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1132," + hdrFolderId + ")'>Centerfolds,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1986," + hdrFolderId + ")'> magazine covers,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",3796," + hdrFolderId + ")'> cybergirls,</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",2601," + hdrFolderId + ")'> extras</a>\n");
            break;
        }
        case "porn":
        case "sluts": {
            $('#mainMenuContainer').html(
                "               <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",243," + hdrFolderId + ")'>cock suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",420," + hdrFolderId + ")'>boob suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",357," + hdrFolderId + ")'>cum shots</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",397," + hdrFolderId + ")'>kinky</a> and \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",411," + hdrFolderId + ")'>naughty behaviour</a>\n");
            break;
        }
        default:
            $('#mainMenuContainer').html(
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",2,2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",136,136)'> poses,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",3916,3916)'> positions,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",159,159)'> topics,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",199,199)'> shapes</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",241,241)'>sizes</a>\n");
    }
}

function setHeaderDetails(folderId, subdomain) {
    //alert("setHeaderDetails folderId: " + folderId + ", subdomain: " + subdomain);
    $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"boobs\"," + folderId + ")'><img src='/Images/redballon.png' class='bannerImage'/></a>\n");
    $('#bannerTitle').html("OggleBooble");
    switch (subdomain) {
        case "Index": {
            //$('header').switchClass('pornHeader', 'boobsHeader');
            if (folderId === 3909)
                showPornHeader(folderId);
            else {
                $('#breadcrumbContainer').html("<div id='rankerTag' class='headerFeatureBanner'><a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'" +
                    " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n" +
                    "<div class='headerFeatureBanner'><a href='javascript:rtpe(\"BAC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n" +
                    "<div id='rankerTag' class='headerFeatureBanner'><a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");
            }
            break;
        }
        case "loading": $('#mainMenuContainer').html("loading"); break;
        case "dashboard": {
            $('#mainMenuContainer').html("dashboard");
            $("#divLoginArea").hide();
            break;
        }
        case "blog": {
            $('#mainMenuContainer').html("blog");
            break;
        }
        case "ranker": {
            $('#mainMenuContainer').html("ranker");
            break;
        }
        case "archive": {

            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");

            $('#playboyLink').html("<div class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"BAC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n");
            break;
        }
        case "boobs": {
            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"boobs\"," + folderId +")'" +
                " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n");
            break;
        }
        case "playboy":
        case "centerfold": {
            $('header').switchClass('pornHeader', 'boobsHeader');
            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"playboy\")'><img src='/Images/playboyBallon.png' class='bannerImage'/></a>\n");
            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3," + folderId +")'>big tits archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"playboy\"," + folderId +")' " +
                "title='Spin through the links to land on random portrait images.'>playmate ranker</a></div>\n");
            break;
        }
        case "porn":
        case "sluts": {
            $('header').switchClass('boobsHeader', 'pornHeader');
            changeFavoriteIcon();
            $('body').addClass('pornBodyColors');
            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId +
                +

                -",\"porn\"," + folderId + ")'><img src='/Images/csLips02.png' class='bannerImage'/></a>\n");
            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440," + folderId + ")'>slut archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\"," + folderId + ")' " +
                "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n");
            $('#bannerTitle').html("OgglePorn");
            break;
        }
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BUG",
                Severity: 2,
                ErrorMessage: "switch case not handled. FolderId: " + folderId + ", Subdomain: " + subdomain,
                CalledFrom: "OggleHeader setOggleHeader"
            });
    }
}

function setLoginHeaderSection(subdomain) {
    if (subdomain === "loading") {
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
        return;
    }
    var isLoggedIn = getCookieValue("IsLoggedIn");

    if (isNullorUndefined(isLoggedIn)) {
        setCookieValue("IsLoggedIn", "true");
        isLoggedIn = "true";
       // alert("isNullorUndefined(isLoggedIn)");
    }

    if (isLoggedIn === "true") {
        $('#headerMessage').html("logged in");
        $('#spnUserName').html(getCookieValue("UserName"));
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
        if (isInRole("Oggle admin")) {
            $('#dashboardMenuItem').show();
        }
    }
    else {
        $('#dashboardMenuItem').hide();
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
    }
}

function draggableDialogHtml() {
    return "<div class='centeringOuterShell'>\n" +
    "   <div class='centeringInnerShell'>\n" +
    "      <div id='draggableDialog' class='oggleDraggableDialog'>\n" +
    "           <div id='draggableDialogHeader'class='oggleDialogHeader' onmousedown='draggableDialogEnterDragMode()' onmouseup='draggableDialogCancelDragMode()'>" +
    "               <div id='draggableDialogTitle' class='oggleDialogTitle'></div>" +
    "               <div id='draggableDialogCloseButton' class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='dragableDialogClose()'/></div>\n" +
    "           </div>\n" +
    "           <div id='draggableDialogContents' class='oggleDialogContents'></div>\n" +
    "      </div>\n" +
    "   </div>\n" +
    "</div>\n";
}

function draggableDialogEnterDragMode() {
    $('#headerMessage').html("entering drag mode");
    $('#draggableDialog').draggable({ disabled: false });
    $('#draggableDialog').draggable();
}
function draggableDialogCancelDragMode() {
    $('#headerMessage').html("end drag");
    $('#draggableDialog').draggable({ disabled: true });
}
function dragableDialogClose() {
    $('#draggableDialog').fadeOut();
    if (typeof resume === 'function')
        resume();
}

//<img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
// title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
// \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
// \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +
function headerHtml(folderId) {
    // HEADER HTML
    return "   <div id='divTopLeftLogo' class='bannerImageContainer'></div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div id='' class='headerTopRow'>\n" +
        "           <div id='bannerTitle' class='headerTitle'></div >\n" +
        "           <div id='mainMenuContainer' class='topLinkRow mainMenu'></div>" +
        "           <span id='archiveLink'></span>" +
        "           <span id='rankerLink'></span>" +
        "           <span id='playboyLink'></span>\n" +
        "           <div class='OggleSearchBox'>\n" +
        "               <span id='notUserName' title='Esc clears search.'>search</span>" +
        "                   <input class='OggleSearchBoxText' id='txtSearch' onfocus='startOggleSearch(" + folderId + ")' onkeydown='oggleSearchKeyDown(event)' />" +
        "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='headerBottomRow'>\n" +
        "           <div class='bottomRowSection1'>\n" +
        "               <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
        "               <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "               <div id='badgesContainer' class='badgesSection'></div>\n" +
        "           </div>\n" +
        "           <div id='divLoginArea' class='loginArea'>\n" +
        "               <div id='optionLoggedIn' class='displayHidden'>\n" +
        "                   <div class='menuTab' id='dashboardMenuItem' class='displayHidden'><a href='/index.html?subdomain=dashboard'>Dashboard</a></div>\n" +
        "                   <div class='menuTab' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                   <div class='menuTab'><a href='javascript:onLogoutClick(" + folderId + ")'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn'>\n" +
        "                   <div id='btnLayoutRegister' class='menuTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='menuTab'><a href='javascript:showLoginDialog(" + folderId + ")'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +

        "<div id='hamburgerCtx' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div onclick='contextMenuAction(\"show\")'>archive</div>\n" +
        "    <div onclick='contextMenuAction(\"showFolderLinks\")'>ranker</div>\n" +
        "    <div onclick='contextMenuAction(\"showLinks\")'>blog</div>\n" +
        "</div>\n" +

        "<div id='indexCatTreeContainer' class='oggleHidden'></div>\n" +

        "<div id='customMessageContainer' class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "       <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div id='dirTreeContainer' class='floatingDirTreeContainer'></div>\n" +

        "<div id='modalContainer' class='modalVail'>\n" +
        "   <div id='modalContent' class='modalContentStyle'></div>\n" +
        "</div>\n";
}
