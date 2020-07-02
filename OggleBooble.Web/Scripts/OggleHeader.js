let hdrFolderId, hdrSubdomain, hdrRowW;

function setOggleHeader(folderId, subdomain) {
    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("setOggleHeader subdomain " + subdomain + "  folderId: " + folderId + " containsImageLinks: " + containsImageLinks);
    if (subdomain === undefined) subdomain = "boobs";
    hdrFolderId = folderId;
    hdrSubdomain = subdomain;
    $('.oggleHeader').html(headerHtml(folderId, subdomain));
    $('#dashboardMenuItem').html(subdomain);
    
    //if(subdomain.contains("porn,"))
    $('.oggleHeader').addClass("boobsHeader");
    //$('header').switchClass('pornHeader', 'boobsHeader');

    $('#draggableDialog').resizable({
        resize: function (event, ui) {
            //$('#headerMessage').html("onresize: " + event.pageX + " note-editable.height: " + $('.note-editable').height());
            //$('#headerMessage').html("dH: " + $('#draggableDialog').height() + " sH: " + $('.note-editable').height());
            $('.note-editable').height($('#draggableDialog').height() - 360);
        }
    });
    setHeaderDetails(hdrFolderId, hdrSubdomain);
    setMenubar(subdomain);
    setLoginSection(subdomain);
    window.addEventListener("resize", mediaSavyHdrResize);
}

function setHeaderDetails(folderId, subdomain) {
    //alert("setHeaderDetails folderId: " + folderId + ", subdomain: " + subdomain);
    $('#bannerTitle').html("OggleBooble");
    switch (subdomain) {
        case "Index": {
            //$('header').switchClass('pornHeader', 'boobsHeader');
            if (folderId === 3909)
                showPornHeader(folderId);
            else {
                $('#breadcrumbContainer').html(
                    "<div class='headerBanner'><a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'>babes ranker</a></div>\n" +
                    "<div class='headerBanner'><a href='javascript:rtpe(\"BAC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n" +
                    "<div class='headerBanner'><a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");
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

            //$('#hdrBtmRowSec3').html("<div id='rankerTag' class='headerBanner'>" +
            //    "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'" +
            //    " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");

            //$('#hdrBtmRowSec3').append("<div class='headerBanner'>" +
            //    "\n<a href='javascript:rtpe(\"EPC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n");

            break;
        }
        case "boobs": {
            //$('#bannerContainer').html("<div id='rankerTag' class='headerBanner'>" +
            //    "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");
            //$('#bannerContainer').append("<div id='rankerTag' class='headerBanner'>" +
            //    "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"boobs\"," + folderId + ")'" +
            //    " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n");
            break;
        }
        case "playboy":
        case "centerfold": {

            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#bannerContainer').html("<div id='rankerTag' class='headerBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3," + folderId + ")'>big tits archive</a></div>\n");
            $('#bannerContainer').append("<div id='rankerTag' class='headerBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"playboy\"," + folderId + ")' " +
                "title='Spin through the links to land on random portrait images.'>playmate ranker</a></div>\n");
            break;
        }
        case "porn":
        case "sluts": {

            $('header').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            changeFavoriteIcon();
            $('body').addClass('pornBodyColors');
            $('#bannerContainer').html("<div id='rankerTag' class='headerBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440,440)'>slut archive</a></div>\n");
            $('#bannerContainer').append("<div id='rankerTag' class='headerBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\"," + folderId + ")' " +
                "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n");
            $('#bannerTitle').html("OgglePorn");
            break;
        }
        default: {
            if (document.domain === "localhost")
                alert("setHeaderDetails switch case not handled. FolderId: " + folderId + ", Subdomain: " + subdomain);
            else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "BUG",
                    Severity: 2,
                    ErrorMessage: "switch case not handled. FolderId: " + folderId + ", Subdomain: " + subdomain,
                    CalledFrom: "OggleHeader setOggleHeader"
                });
        }
    }
}

function setMenubar(subdomain) {
    let headerMenu;
    switch (subdomain) {
        case "loading":
            headerMenu = "loading";
            break;
        case "archive": {
            headerMenu = "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",4,4,)'>milk cows,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1103,1103)'>russian spys,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1093,1093)'>highschool fantasy girls,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1107,1107)'>sweater meat,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",123,123)'>ultra juggs</a> \n";
            break;
        }
        case "playboy":
        case "centerfold": {
            $('header').switchClass('pornHeader', 'boobsHeader');
            headerMenu = "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1132," + hdrFolderId + ")'>Centerfolds,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",1986," + hdrFolderId + ")'> magazine covers,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",3796," + hdrFolderId + ")'> cybergirls,</a> and\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",2601," + hdrFolderId + ")'> extras</a>\n";
            break;
        }
        case "porn":
        case "sluts": {
            headerMenu = "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + "," + hdrFolderId + ",243)'>cock suckers</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ',' + hdrFolderId + ",420)'>boob suckers</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ',' + hdrFolderId + ",357)'>cum shots</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ',' + hdrFolderId + ",397)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ',' + hdrFolderId + ",411)'>naughty behaviour</a>\n";
            break;
        }
        default:
            headerMenu = "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",2,2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",136,136)'> poses,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",3916,3916)'> positions,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",159,159)'> topics,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",199,199)'> shapes</a> and\n" +
                "<a href='javascript:rtpe(\"BLC\"," + hdrFolderId + ",241,241)'>sizes</a>\n";
    }
    return headerMenu;
}

function setLoginSection(subdomain) {
    if (subdomain === "loading") {
        $('#divLoginArea').hide();
        return;
    }
    $('#divLoginArea').show();
    var isLoggedIn = getCookieValue("IsLoggedIn");

    if (isNullorUndefined(isLoggedIn)) {
        setCookieValue("IsLoggedIn", "true");
        isLoggedIn = "true";
        console.log("isNullorUndefined(isLoggedIn)");
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

function mediaSavyHdrResize() {
    hdrRowW = $('.headerTopRow').width();
    // bottom Row  
    {
        if (hdrBottRowSectionsW() < hdrRowW) {
            $('.oggleHeader').css("background-color", "var(--brucheumBlue)");
            $('.siteLogo').css("height", "80px");
            $('#divLoginArea').css("font-size", "17px");
            if (hdrSubdomain === "Index") {
                $('.headerBanner').css("font-size", "12px"); // banner tabs contents
                $('.headerBanner').css("color", "yellow").show(); // banner tabs contents
            }
            $('#breadcrumbContainer').css("font-size", "18px").show();
            $('.badgeImage').css("height", "31px");
            $('.blackCenterfoldsBanner').css("font-size", "16px");
            $('#mainMenuContainer').html(setMenubar(hdrSubdomain));
            showResizeMessage("RESET: ");
        }
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('.oggleHeader').css("background-color", "#ccffcc");  // green
            $('.siteLogo').css("height", "80px");
            $('#divLoginArea').css("font-size", "15px");
            $('#breadcrumbContainer').css("font-size", "15px").show();
            $('.badgeImage').css("height", "31px");
            $('.blackCenterfoldsBanner').css("font-size", "15px");
            $('#mainMenuContainer').html(setMenubar(hdrSubdomain));

            showResizeMessage("80/15: ");
        }
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('.oggleHeader').css("background-color", "#e6de3b");  // sn
            $('.siteLogo').css("height", "60px");
            $('#divLoginArea').css("font-size", "13px");
            $('#breadcrumbContainer').css("font-size", "13px").show();
            $('.badgeImage').css("height", "28px");
            $('.blackCenterfoldsBanner').css("font-size", "13px");
            $('#mainMenuContainer').html(setMenubar(hdrSubdomain));

            showResizeMessage("60/13: ");
        }
        //if (hdrBottRowSectionsW() >= hdrRowW) {
        //    $('.siteLogo').css("height", "60px");
        //    $('#divLoginArea').css("font-size", "12px");
        //    $('#breadcrumbContainer').css("font-size", "12px").show();
        //    $('.headerBanner').css("font-size", "10px").show();
        //    $('.badgeImage').css("height", "22px");
        //    $('.blackCenterfoldsBanner').css("font-size", "10px");
        //    showResizeMessage("brown?: ");
        //}
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('.oggleHeader').css("background-color", "#e9b5e7");  // sn
            $('.siteLogo').css("height", "50px");
            $('#divLoginArea').css("font-size", "12px");
            $('#breadcrumbContainer').css("font-size", "12px").show();
            $('.blackCenterfoldsBanner').css("font-size", "12px");
            $('.badgeImage').css("height", "22px");
            $('#mainMenuContainer').html("<img class='hamburger' src='/Images/hamburger.png' onclick='showHamburger()'/>");

            showResizeMessage("iPad 50/12 : ");
        }
        //if (hdrBottRowSectionsW() >= hdrRowW) {
        //    $('.oggleHeader').css("background-color", "#e6de3b");  // sn
        //    $('.siteLogo').css("height", "40px");
        //    $('#divLoginArea').css("font-size", "12px");
        //    $('#breadcrumbContainer').css("font-size", "10px").show();
        //    $('.headerBanner').css("font-size", "12px").show();
        //    $('.blackCenterfoldsBanner').css("font-size", "10px");
        //    $('.badgeImage').css("height", "20px");
        //    showResizeMessage("iPad 40/12 : ");
        //}
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('.oggleHeader').css("background-color", "#a58383");  // brown        
            $('.siteLogo').css("height", "30px");
            $('#breadcrumbContainer').hide();
            $('#divLoginArea').css("font-size", "12px");
            $('.headerBanner').css("font-size", "12px").show();
            $('.badgeImage').css("height", "18px");
            $('#mainMenuContainer').html("<img class='hamburger' src='/Images/hamburger.png' onclick='showHamburger()'/>");

            showResizeMessage("iPhone: ");
        }
    }
// top row
    {
        if (hdrTopRowSectionsW() < hdrRowW) {
            $('#bannerTitle').css("font-size", "33px");
            $('#bannerTitle').css("color", "blue");
            $('#mainMenuContainer').css("font-size", "20px").show();
            $('#bannerContainer').show();
            $('.headerBanner').css("font-size", "17px").show(); // banner tabs contents
            //"           <div id='bannerContainer'></div>" +
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            showResizeMessage("TOP RESET: ");
        }
        //let testing = false;
        //if (false) {
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#bannerTitle').css("font-size", "22px");
            $('#bannerTitle').css("color", "orange");
            $('#bannerContainer').show();
            $('#mainMenuContainer').css("font-size", "18px").show();
            $('.headerBanner').css("font-size", "15px").show(); // banner tabs contents
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            showResizeMessage("q1: ");
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#bannerContainer').hide();
            $('#mainMenuContainer').css("font-size", "18px");
            $('.headerBanner').css("font-size", "15px").show(); // banner tabs contents
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            showResizeMessage("q2: ");
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#bannerContainer').hide();
            $('#mainMenuContainer').hide();
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            showResizeMessage("q3: ");
        }

    }
}

function showHamburger() {
    var picpos = $('#breadcrumbContainer').offset();
    var picLeft = Math.max(0, picpos.left + $('#hamburgerCtx').width());
    $('#hamburgerCtx').css("top", picpos.top + 5);
    $('#hamburgerCtx').css("left", picLeft);
    $('#hamburgerCtx').show();
}
function hdrBottRowSectionsW() {
    let calcIssue = 47;
    return $('#headerMessage').width() + $('#breadcrumbContainer').width() + $('#badgesContainer').width() + $('#divLoginArea').width() + calcIssue;
}
function hdrTopRowSectionsW() {
    let topRowKludge = 0;
    return $('#bannerTitle').width() + $('#mainMenuContainer').width() + $('#bannerContainer').width() + $('#searchBox').width() + topRowKludge;
}
function showResizeMessage(secMsg) {
    $('#aboveImageContainerMessageArea').html(secMsg + "hdrTopRow: " + $('.headerTopRow').width().toLocaleString() +
        " bottomSecs: " + hdrBottRowSectionsW().toLocaleString() +
        " hdrTopSecs: " + hdrTopRowSectionsW().toLocaleString());
}

function draggableDialogEnterDragMode() {
    //$('#headerMessage').html("entering drag mode");
    $('#draggableDialog').draggable({ disabled: false });
    $('#draggableDialog').draggable();
}
function draggableDialogCancelDragMode() {
    //$('#headerMessage').html("end drag");
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

function headerHtml(folderId, subdomain) {
    return "<div class='siteLogoContainer'>" +
        "       <a href='javascript:rtpe(\"HBC\"," + folderId + ",\"" + subdomain + "\"," + folderId + ")'>" +
        "       <img id='divSiteLogo' class='siteLogo' src='/Images/redballon.png'/></a>" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div id='bannerTitle' class='headerTitle'></div >\n" +
        "           <div id='mainMenuContainer' class='hdrTopRowMenu'></div>" +
        "           <div id='bannerContainer'></div>" +
        "           <div id='searchBox' class='oggleSearchBox'>\n" +
        "               <span id='notUserName' title='Esc clears search.'>search</span>" +
        "                   <input class='oggleSearchBoxText' id='txtSearch' onfocus='startOggleSearch(" + folderId + ")' onkeydown='oggleSearchKeyDown(event)' />" +
        "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='headerBottomRow'>\n" +
        "           <div class='bottomRowSection1'>\n" +
        "               <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
        "               <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "               <div id='badgesContainer' class='badgesSection'></div>\n" +
        "               <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
        "           </div>\n" +
        "           <div id='divLoginArea' class='loginArea'>\n" +
        "               <div id='optionLoggedIn' class='displayHidden'>\n" +
        //"                   <div class='hoverTab' id='dashboardMenuItem' class='displayHidden'><a href='/index.html?subdomain=dashboard'>Dashboard</a></div>\n" +
        "                   <div class='hoverTab' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                   <div class='hoverTab'><a href='javascript:onLogoutClick(" + folderId + ")'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn'>\n" +
        "                   <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog(" + folderId + ")'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +

        // rtpe(eventCode, calledFrom, eventDetail, pageId)
        //case "RNK":  // Ranker Banner Clicked    window.location.href = "/Ranker.html?subdomain=" + eventDetail;

        "<div id='indexCatTreeContainer' class='oggleHidden'></div>\n" +

        "<div id='customMessageContainer' class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "       <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='draggableDialog' class='oggleDraggableDialog'>\n" +
        "           <div id='draggableDialogHeader'class='oggleDialogHeader'" +
        "                   onmousedown='draggableDialogEnterDragMode()' onmouseup='draggableDialogCancelDragMode()'>" +
        "               <div id='oggleDialogTitle' class='draggableDialogTitle'></div>" +
        "               <div id='draggableDialogCloseButton' class='oggleDialogCloseButton'>" +
        "               <img src='/images/poweroffRed01.png' onclick='dragableDialogClose()'/></div>\n" +
        "           </div>\n" +
        "           <div id='draggableDialogContents' class='oggleDialogContents'></div>\n" +
        "      </div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div id='dirTreeContainer' class='dirTreeImageContainer floatingDirTreeImage floatingDirTreeContainer'>\n" +
        "   <img class='dirTreeImage'/>\n" +
        "</div>\n" +

        "<div id='modalContainer' class='modalVail'>\n" +
        "   <div id='modalContent' class='modalContentStyle'></div>\n" +
        "</div>\n" +

        "<div id='contextMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
        "   <div id='contextMenuContent'></div>\n" +
        "</div>\n" +

        "<div id='hamburgerCtx' class='ogContextMenu displayHidden'>\n" +
        "    <div onclick='rtpe(\"BAC\"," + folderId + ",\"archive\")'>babes archive</div>\n" +
        "    <div onclick='rtpe(\"RNK\",\"hamburger\",\"" + subdomain + "\"," + folderId + ")'>ranker</div>\n" +
        "    <div onclick='window.location.href=\"/index.html?subdomain=blog\"'>blog</div>\n" +
        "    <div onclick='rtpe(\"EPC\",\"hamburger\",\"" + subdomain + "\"," + 1132 + ")'>every Playboy Centerfold</div>\n" +
        "</div>\n";
}
