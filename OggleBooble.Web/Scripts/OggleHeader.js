let hdrFolderId, hdrSubdomain, hdrRowW, mediaDebug;

function setOggleHeader(folderId, subdomain) {
    if (subdomain === undefined) subdomain = "boobs";
    hdrFolderId = folderId;
    hdrSubdomain = subdomain;

    $('#oggleHeader').html(headerHtml(folderId, subdomain));
    $('#oggleHeader').addClass('boobsHeader');
    $('#divSiteLogo').attr("src", "/Images/redballon.png");
    $('#bannerTitle').html("OggleBooble");

    //$('header').switchClass('pornHeader', 'boobsHeader');

    //changeFavoriteIcon("loading");
    //changeFavoriteIcon("redBallon");

    $('#centeredDialogContents').resizable({
        resize: function (event, ui) {
            $('.note-editable').height($('#centeredDialogContents').height() - 360);
        }
    });

    mediaDebug = false;
    if (mediaDebug) {        
        //$('#bannerTitle').css("border", "solid thin red");
        $('#mainMenuContainer').css("border", "solid thin red");
        //$('#topRowRightContainer').css("border", "solid thin red");
        $('#searchBox').css("border", "solid thin red");
        $('.headerBottomRow').css("border", "solid thin lime");
        $('#headerMessage').css("border", "solid thin red");
        $('#breadcrumbContainer').css("border", "solid thin red");
        $('#badgesContainer').css("border", "solid thin red");
        $('#hdrBtmRowSec3').css("border", "solid thin red");
        $('#divLoginArea').css("border", "solid thin red");
    }

    $('#mainMenuContainer').html(setHeaderMenu(folderId, subdomain));
    setHdrBottomRow(hdrFolderId, subdomain);
    setLoginSection(subdomain);
    mediaSavyHdrResize();
    window.addEventListener("resize", mediaSavyHdrResize);
}

function setHdrBottomRow(folderId, subdomain) {
    switch (subdomain) {
        case "index": 
        case "root": {
            $('#breadcrumbContainer').append(addBannerButton("ranker", "big naturals"));
            $('#breadcrumbContainer').append(addBannerButton("centerfold"));
            $('#breadcrumbContainer').append(addBannerButton("archive"));
            break;
        }
        case "loading": {
            $('#mainMenuContainer').html("loading");
            $("#divLoginArea").hide();
            break;
        }
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
        case "boobs": // poses        
            $('#topRowRightContainer').html(addBannerButton("centerfold"));
            $('#topRowRightContainer').append(addBannerButton("archive"));
            $('#topRowRightContainer').append(addBannerButton("ranker", "poses"));
            changeFavoriteIcon("redBallon");
            break;

        case "archive": {
            $('#topRowRightContainer').html(addBannerButton("centerfold"));
            $('#topRowRightContainer').append(addBannerButton("poses"));
            $('#topRowRightContainer').append(addBannerButton("ranker", "boobs"));
            changeFavoriteIcon("redBallon");
            break;
        }
        case "soft": {
            $('#oggleHeader').switchClass('boobsHeader', 'oggleSoft');
            $('#divSiteLogo').attr("src", "/Images/redwoman.png");
            $('#bannerTitle').html("OggleSoftcore");
            changeFavoriteIcon("soft");
            break;
        }
        case "playboy":
        case "cybergirl":
        case "centerfold": {
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#topRowRightContainer').html(addBannerButton("archive"));
            $('#topRowRightContainer').append(addBannerButton("ranker", "centerfold"));
            break;
        }
        case "porn":
        case "sluts": {
            changeFavoriteIcon("porn");
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/csLips02.png");
            $('#bannerTitle').html("OgglePorn");
            $('#topRowRightContainer').html(addBannerButton("archive"));
            $('#topRowRightContainer').append(addBannerButton("ranker", "porn"));
            break;
        }
        default: {
            logError("SWT", folderId, "subdomain: " + subdomain, "setHdrBottomRow");
        }
    }
    setTimeout(function () { mediaSavyHdrResize(); }, 400);
}

function setHeaderMenu(folderId, subdomain) {
    let headerMenu;
    //rtpe(eventCode, calledFrom, eventDetail, pageId)
    switch (subdomain) {
        case "index":
        case "root":
        case "boobs":
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",136)'> poses,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",,3916)'> positions,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",159)'> topics,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",199)'> shapes</a> and\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",241)'>sizes</a>\n";
        case "archive": {
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",1103)'>russian spys,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",1107)'>sweater meat,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",123)'>ultra juggs</a> \n";
            break;
        }
        case "cybergirl":
        case "playboy":
        case "centerfold": {
            headerMenu = "every playboy centerfold";
                //"<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",1132)'>Centerfolds,</a>\n" +
                //"<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",1986)'> magazine covers,</a>\n" +
                //"<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",3796)'> cybergirls,</a> and\n" +
                //"<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",2601)'> extras</a>\n";
            break;
        }
        case "soft": {
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",243)'>pussy</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",420)'>boob suckers</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",498)'>big tit lezies</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",357)'>fondle</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",397)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",411)'>naughty behaviour</a>\n";
            break;
        }
        case "porn": {
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",243)'>cock suckers</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",420)'>boob suckers</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",357)'>cum shots</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",397)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",411)'>naughty behaviour</a>\n";
            break;
        }
        case "sluts": {
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",1174)'>big titters gone bad</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",2677)'>cocksucker lipps</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",3728)'>blonde cocksuckers</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",3730)'>amatures</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",3731)'>sweet nasty girls</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",3739)'>exploited teens</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",4022)'>big girls</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",4198)'>milf cocksuckers</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"sluts\",4271)'>retro</a>,\n";
            break;
        }
        case "dashboard": {
            headerMenu = "dashboard";
            break;
        }
        case "loading": {
            headerMenu = "loading";
            break;
        }
        default:
            logError("SWT", hdrFolderId, "subdomain: " + subdomain, "setHeaderMenu");
            headerMenu = "? " + subdomain;

    }
    return headerMenu;
}

function setLoginSection(subdomain) {
    if (subdomain === "loading" || subdomain === "dashboard") {
        $('#divLoginArea').hide();
        return;
    }
    $('#divLoginArea').show();
    $('#optionLoggedIn').hide();
    $('#optionNotLoggedIn').show();

    let userName = getCookieValue("UserName");
    if (!isNullorUndefined(userName)) {
        let isLoggedIn = getCookieValue("IsLoggedIn");
        if (!isNullorUndefined(isLoggedIn)) {
            $('#spnUserName').html(userName);
            $('#optionLoggedIn').show();
            $('#optionNotLoggedIn').hide();
        }
    }
}

function mediaSavyHdrResize() {
    //return;
    hdrRowW = $('.headerTopRow').width();
    let lasttopRowOption = "t0", lastBottomRowOption = "b0";
    // bottom Row
    {
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('#oggleHeader').css("background-color", "var(--brucheumBlue)");
            $('#divSiteLogo').css("height", "70px");
            $('#topRowRightContainer').css("color", "yellow").show(); // banner tabs contents
            $('.headerBannerButton').css("font-size", "18px").show();            
            $('#breadcrumbContainer').css("font-size", "18px").show();
            $('.badgeImage').css("height", "25px");
            $('.badgeImage').css("font-size", "10px").show();            
            $('#divLoginArea').css("font-size", "17px");
            lastBottomRowOption="b1";
        }
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('#oggleHeader').css("background-color", "#ccffcc");  // green
            $('#divSiteLogo').css("height", "60px");
            $('#divLoginArea').css("font-size", "15px");
            $('#breadcrumbContainer').css("font-size", "15px").show();
            $('.badgeImage').css("height", "20px");
            lastBottomRowOption = "b2";
        }
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('#oggleHeader').css("background-color", "#e6de3b");  // sn
            $('#divSiteLogo').css("height", "50px");
            $('#divLoginArea').css("font-size", "13px");
            $('#breadcrumbContainer').css("font-size", "13px").show();
            $('.badgeImage').css("height", "18px");
            lastBottomRowOption = "b3";
        }
        //if (hdrBottRowSectionsW() >= hdrRowW) {
        //    $('#divSiteLogo').css("height", "60px");
        //    $('#divLoginArea').css("font-size", "12px");
        //    $('#breadcrumbContainer').css("font-size", "12px").show();
        //    $('.badgeImage').css("height", "22px");
        //    $('.blackCenterfoldsBanner').css("font-size", "10px");
        //    showResizeMessage("brown?: ");
        //}
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('#oggleHeader').css("background-color", "#e9b5e7");  // sn
            $('#divSiteLogo').css("height", "50px");
            $('#divLoginArea').css("font-size", "12px");
            $('#breadcrumbContainer').css("font-size", "12px").show();
            $('.blackCenterfoldsBanner').css("font-size", "12px");
            $('.badgeImage').css("height", "15px");
            $('#mainMenuContainer').html("<img class='hamburger' src='/Images/hamburger.png' onclick='showHamburger()'/>");
            lastBottomRowOption = "b4";
        }
        //if (hdrBottRowSectionsW() >= hdrRowW) {
        //    $('#oggleHeader').css("background-color", "#e6de3b");  // sn
        //    $('#divSiteLogo').css("height", "40px");
        //    $('#divLoginArea').css("font-size", "12px");
        //    $('#breadcrumbContainer').css("font-size", "10px").show();
        //    $('.blackCenterfoldsBanner').css("font-size", "10px");
        //    $('.badgeImage').css("height", "20px");
        //    showResizeMessage("iPad 40/12 : ");
        //}
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('#oggleHeader').css("background-color", "#a58383");  // brown        
            $('#divSiteLogo').css("height", "30px");
           // $('#breadcrumbContainer').hide();
            //if (debugMode)
            $('#hdrBtmRowSec3').html("hdrBottRowSectionsW() >= hdrRowW");
            $('#footerMessage2').html("hdrBottRowSectionsW() >= hdrRowW");
            //alert("hdrBottRowSectionsW() >= hdrRowW");

            $('#divLoginArea').css("font-size", "12px");
            $('.badgeImage').css("height", "18px");
            $('#mainMenuContainer').html("<img class='hamburger' src='/Images/hamburger.png' onclick='showHamburger()'/>");
            lastBottomRowOption = "b5";
        }
    }
    // top row
    {
        //default top
        $('#divSiteLogo').css("height", "60px").show(); 
        $('#mainMenuContainer').css("font-size", "25px").show();  // id='mainMenuContainer' class='hdrTopRowMenu' font-size: 32px; font-family: Comic Sans MS; color: var(--oggleTitleColor); vertical-align: top; padding-left: 28px; margin-right: 8px; margin-top: 1px;    padding: 0;
        $('.headerBannerButton').css("font-size", "14px"); //id='bannerTitle' class='headerTitle' font-size: 28px; padding-left: 6px; padding-top: 1px; font-family: 'Lucida Calligraphy';
        $('#topRowRightContainer').show();
        $('#bannerTitle').css("color", "black").css("height", "28px").show(); ; // font-size: 28px;
        //<div id='topRowRightContainer'></div>" +
        // searchBox class='oggleSearchBox'

        if (hdrTopRowSectionsW() > hdrRowW) {
            //$('#divSiteLogo').css("height", "70px").show(); 
            $('#bannerTitle').css("color", "blue").css("height", "25px");
            $('#mainMenuContainer').css("font-size", "25px").show();
            $('.headerBannerButton').css("font-size", "14px");

            $('.badgeImage').css("height", "25px");
            $('.badgeImage').css("font-size", "10px");            
            $('#searchBox').css("font-size", "10px");
            lasttopRowOption = "t1";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            //$('#divSiteLogo').css("height", "60px"); 
            $('#bannerTitle').css("color", "orange").css("height", "23px");
            $('#mainMenuContainer').css("font-size", "22px").show();
            $('.headerBannerButton').css("font-size", "13px");
            lasttopRowOption = "t2";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#divSiteLogo').css("height", "50px"); 
            $('#bannerTitle').css("color", "red").css("height", "20px");
            $('#mainMenuContainer').css("font-size", "20px");
            $('.headerBannerButton').css("font-size", "12px");
            lasttopRowOption ="t3";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#mainMenuContainer').html($('#hamburgerCtx'));
            lasttopRowOption ="t4";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#mainMenuContainer').html($('#hamburgerCtx'));
            lasttopRowOption = "t5";
        }
    }
    //alert("mediaSavyHdrResize " + lasttopRowOption);
    showResizeMessage(lasttopRowOption, lastBottomRowOption);
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
    let topRowFudgeFactor = 16;
    return $('#bannerTitle').width() + $('#mainMenuContainer').width() + $('#topRowRightContainer').width() + $('#searchBox').width() + topRowFudgeFactor;
}
function showResizeMessage(lasttopRowOption, lastBottomRowOption) {
    if (mediaDebug) {
        //if (!secMsg.includes("RESET"))
        $('#aboveImageContainerMessageArea').html("Top: " + lasttopRowOption + " : " + hdrTopRowSectionsW().toLocaleString() +
            " Bot: " + lastBottomRowOption + " : " + hdrBottRowSectionsW().toLocaleString() +
            "<span style='margin-left:45px;'>rW: </span> (" + $('.headerTopRow').width().toLocaleString() + ")");
        //alert("banner: " + $('#bannerTitle').width() + " menu: " + $('#mainMenuContainer').width() + " rightRow: " + $('#topRowRightContainer').width() + " sbox: " + $('#searchBox').width());
    }
}

function centeredDialogEnterDragMode() {
    //$('#headerMessage').html("entering drag mode");
    $('#centeredDialogContents').draggable({ disabled: false });
    $('#centeredDialogContents').draggable();
}
function centeredDialogCancelDragMode() {
    //$('#headerMessage').html("end drag");
    $('#centeredDialogContents').draggable({ disabled: true });
}
function dragableDialogClose() {
    $('#centeredDialogContainer').fadeOut();
    if (typeof resume === 'function') resume();
}

function addBannerButton(bannerType, rankerType) {
    switch (bannerType) {
        case "ranker":
            // Ranker tags
            //"boobs":
            //"playboy":
            //"centerfold":
            //"porn":
            //"sluts":
            //"archive":
            return "<div class='headerBannerButton'>\n" +
                "<div class='clickable' onclick='window.open(\"/index.html?spa=3907&bp=" + rankerType + "\", \"_blank\")' " +
                "title='Spin through the links to land on random portrait images.'>" + rankerType + " ranker</div>" +
                "</div>\n";
        case "archive":
            return "<div class='headerBannerButton'>" +
                "   <div class='clickable' onclick='window.open(\"album.html?folder=3\", \"_blank\")'>big naturals archive</div>" +
                "</div>\n";
        case "centerfold":
            return "<div class='headerBannerButton'>\n" +
                "   <div class='clickable' onclick='window.open(\"index.html?spa=3912\", \"_blank\")'>every Playboy Centefold</div>" +
                "</div>\n";
        case "poses":
            return "<div class='headerBannerButton'>\n" +
                "   <div class='clickable' onclick='window.open(\"album.html?folder=2\", \"_blank\")'>poses</div>" +
                "</div>\n";
        default:
            logError("SWT", folderId, "bannerType: " + bannerType, "addBannerButton");

    }
}

function topLogoClick(folderId, subdomain) {
    if ((subdomain == "centerfold") || (subdomain == "playboy")) {
        window.open("index.html?spa=3912");
    }
    if ((subdomain == "porn") || (subdomain == "sluts"))
        window.open("index.html?spa=3909");
    else
        alert("topLogoClick  folderId: " + folderId + ", subdomain: " + subdomain);
}

//<img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
// title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
// \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
// \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +

function headerHtml(folderId, subdomain) {
    return "<div class='siteLogoContainer'>" +
        "       <a href='javascript:topLogoClick(" + folderId + ",\"" + subdomain + "\")'>" +
        "       <img id='divSiteLogo' class='siteLogo' src='/Images/redballon.png'/></a>" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div id='bannerTitle' class='headerTitle'></div >\n" +
        "           <div id='mainMenuContainer' class='hdrTopRowMenu'></div>" +
        "           <div id='topRowRightContainer'></div>" +
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
        "               <div id='optionNotLoggedIn' class='displayHidden'>\n" +
        "                   <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog(" + folderId + ")'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +

        "<div id='indexCatTreeContainer' class='oggleDialogContainer'></div>\n" +

        "<div id='customMessageContainer' class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "       <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='centeredDialogContainer' class='oggleDialogContainer'>\n" +    // draggableDialog
        "           <div id='centeredDialogHeader'class='oggleDialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>" +
        "               <div id='centeredDialogTitle' class='oggleDialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='oggleDialogCloseButton'>" +
        "               <img src='/images/poweroffRed01.png' onclick='dragableDialogClose()'/></div>\n" +
        "           </div>\n" +
        "           <div id='centeredDialogContents' class='oggleDialogContents'></div>\n" +
        "      </div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div id='dirTreeContainer' class='dirTreeImageContainer floatingDirTreeImage'>\n" +
        "   <img class='dirTreeImage'/>\n" +
        "</div>\n" +

        "<div id='vailShell' class='modalVail'></div>\n" +

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
