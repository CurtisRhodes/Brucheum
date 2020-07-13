let hdrFolderId, hdrSubdomain, hdrRowW, mediaDebug;

function setOggleHeader(folderId, subdomain) {
    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("setOggleHeader subdomain " + subdomain + "  folderId: " + folderId + " containsImageLinks: " + containsImageLinks);
    if (subdomain === undefined) subdomain = "boobs";
    hdrFolderId = folderId;
    hdrSubdomain = subdomain;
    $('#oggleHeader').html(headerHtml(folderId, subdomain));

    $('#draggableDialog').resizable({
        resize: function (event, ui) {
            //$('#headerMessage').html("onresize: " + event.pageX + " note-editable.height: " + $('.note-editable').height());
            //$('#headerMessage').html("dH: " + $('#draggableDialog').height() + " sH: " + $('.note-editable').height());
            $('.note-editable').height($('#draggableDialog').height() - 360);
        }
    });

    mediaDebug = false;
    if (mediaDebug) {        
        $('.headerTopRow').css("border", "solid thin lime");
        //return $('#bannerTitle').width() + $('#mainMenuContainer').width() + $('#topRowRightContainer').width() + $('#searchBox').width() + topRowFudgeFactor;
        $('#bannerTitle').css("border", "solid thin red");
        $('#mainMenuContainer').css("border", "solid thin red");
        $('#topRowRightContainer').css("border", "solid thin red");
        $('#searchBox').css("border", "solid thin red");
    }

    setHdrBottomRow(hdrFolderId, subdomain);
    $('#mainMenuContainer').html(setMenubar(folderId, subdomain));
    setLoginSection(subdomain);
    setTimeout(function () { mediaSavyHdrResize(); }, 400);

    window.addEventListener("resize", mediaSavyHdrResize);
}

function setHdrBottomRow(folderId, subdomain) {
    $('#oggleHeader').addClass('boobsHeader');
    $('#divSiteLogo').attr("src", "/Images/redballon.png");
    $('#bannerTitle').html("OggleBooble");
    changeFavoriteIcon("redBallon");
    switch (subdomain) {
        case "index": 
        case "root": {
            //$('#breadcrumbContainer').html(
            //    "<div class='headerBanner'><a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'>babes ranker</a></div>\n" +
            //    "<div class='headerBanner'><a href='javascript:rtpe(\"BAC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n" +
            //    "<div class='headerBanner'><a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");

            $('#breadcrumbContainer').append(tinkyTak("ranker", "big naturals"));
            $('#breadcrumbContainer').append(tinkyTak("centerfold"));
            $('#breadcrumbContainer').append(tinkyTak("archive"));
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
        case "boobs": // poses        
            $('#topRowRightContainer').html(tinkyTak("centerfold"));
            $('#topRowRightContainer').append(tinkyTak("archive"));
            $('#topRowRightContainer').append(tinkyTak("ranker", "big naturals"));
            break;
        case "archive": {
            $('#topRowRightContainer').html(tinkyTak("centerfold"));
            $('#topRowRightContainer').append(tinkyTak("poses"));
            $('#topRowRightContainer').append(tinkyTak("ranker", "big naturals"));
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
            $('#topRowRightContainer').html(tinkyTak("archive"));
            $('#topRowRightContainer').append(tinkyTak("ranker", "centerfold"));
            break;
        }
        case "porn":
        case "sluts": {
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/csLips02.png");
            $('#bannerTitle').html("OgglePorn");
            changeFavoriteIcon("porn");
            $('#topRowRightContainer').html(tinkyTak("archive"));
            $('#topRowRightContainer').append(tinkyTak("ranker", "porn"));

            //$('body').addClass('pornBodyColors');
            //$('#topRowRightContainer').html("<div id='rankerTag' class='headerBanner'>" +
            //    "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440,440)'>slut archive</a></div>\n");
            //$('#topRowRightContainer').append("<div id='rankerTag' class='headerBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\"," + folderId + ")' " +
            //    "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n");
            break;
        }
        default: {
            if (document.domain === "localhost")
                alert("setHdrBottomRow switch case not handled. FolderId: " + folderId + ", Subdomain: " + subdomain);
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
    setTimeout(function () { mediaSavyHdrResize(); }, 400);
}

function setMenubar(folderId, subdomain) {
    let headerMenu;
    //rtpe(eventCode, calledFrom, eventDetail, pageId)
    switch (subdomain) {
        case "loading":
            headerMenu = "loading";
            break;
        case "archive": {
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",4)'>milk cows,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",1103)'>russian spys,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",1093)'>highschool fantasy girls,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",1107)'>sweater meat,</a> \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"archive\",123)'>ultra juggs</a> \n";
            break;
        }
        case "playboy":
        case "centerfold": {
            $('header').switchClass('pornHeader', 'boobsHeader');
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",1132)'>Centerfolds,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",1986)'> magazine covers,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",3796)'> cybergirls,</a> and\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"playboy\",2601)'> extras</a>\n";
            break;
        }
        case "soft":
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",243)'>pussy</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",420)'>boob suckers</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",498)'>big tit lezies</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",357)'>fondle</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",397)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"soft\",411)'>naughty behaviour</a>\n";
            break;
        case "porn": {
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",243)'>cock suckers</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",420)'>boob suckers</a>,\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",357)'>cum shots</a>, \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",397)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"porn\",411)'>naughty behaviour</a>\n";
            break;
        }
        case "sluts":
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
        default:
            headerMenu =
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",136)'> poses,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",,3916)'> positions,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",159)'> topics,</a>\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",199)'> shapes</a> and\n" +
                "<a href='javascript:rtpe(\"BLC\"," + folderId + ",\"default\",241)'>sizes</a>\n";
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
    let LasttopRowOption = "t0", lastBottomRowOption = "b0";
    // bottom Row  
    {
        if (hdrBottRowSectionsW() >= hdrRowW) {
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
            lastBottomRowOption="b1";
        }
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('.oggleHeader').css("background-color", "#ccffcc");  // green
            $('.siteLogo').css("height", "80px");
            $('#divLoginArea').css("font-size", "15px");
            $('#breadcrumbContainer').css("font-size", "15px").show();
            $('.badgeImage').css("height", "31px");
            $('.blackCenterfoldsBanner').css("font-size", "15px");
            lastBottomRowOption = "b2";
        }
        if (hdrBottRowSectionsW() >= hdrRowW) {
            $('.oggleHeader').css("background-color", "#e6de3b");  // sn
            $('.siteLogo').css("height", "60px");
            $('#divLoginArea').css("font-size", "13px");
            $('#breadcrumbContainer').css("font-size", "13px").show();
            $('.badgeImage').css("height", "28px");
            $('.blackCenterfoldsBanner').css("font-size", "13px");
            lastBottomRowOption = "b3";
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
            lastBottomRowOption = "b4";
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
            lastBottomRowOption = "b5";
        }
    }
    // top row
    {
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#bannerTitle').css("font-size", "33px");
            $('#mainMenuContainer').css("font-size", "20px").show();
            $('#topRowRightContainer').show();
            $('.headerBanner').css("font-size", "17px").show(); // banner tabs contents
            //"           <div id='topRowRightContainer'></div>" +
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            LasttopRowOption = "t1";
        }
        //let testing = false;
        //if (false) {
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#bannerTitle').css("font-size", "22px");
            $('#bannerTitle').css("color", "orange");
            $('#topRowRightContainer').show();
            $('#mainMenuContainer').css("font-size", "18px").show();
            $('.headerBanner').css("font-size", "15px").show(); // banner tabs contents
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            LasttopRowOption="t2"
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#topRowRightContainer').hide();
            $('#mainMenuContainer').css("font-size", "18px");
            $('.headerBanner').css("font-size", "15px").show(); // banner tabs contents
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            LasttopRowOption ="t3";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#topRowRightContainer').hide();
            $('#mainMenuContainer').hide();
            //"           <div id='searchBox' class='oggleSearchBox'>\n" +
            LasttopRowOption ="t4";
        }

    }
    showResizeMessage(LasttopRowOption, lastBottomRowOption);
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
        $('#aboveImageContainerMessageArea').html("r: " + $('.headerTopRow').width().toLocaleString() +
            "    T: " + lasttopRowOption + " : " + hdrTopRowSectionsW().toLocaleString() +
            " B: " + lastBottomRowOption + " : " + hdrBottRowSectionsW().toLocaleString());

        //alert("banner: " + $('#bannerTitle').width() + " menu: " + $('#mainMenuContainer').width() + " rightRow: " + $('#topRowRightContainer').width() + " sbox: " + $('#searchBox').width());
    }
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

function tinkyTak(bannerType, rankerType) {
    switch (bannerType) {
        case "ranker":
            // Ranker tags
            //"boobs":
            //"playboy":
            //"centerfold":
            //"porn":
            //"sluts":
            //"archive":
            return "<div class='headerBanner'>\n" +
                "<div class='clickable' onclick='window.open(\"/index.html?spa=3907&bp=" + rankerType + "\", \"_blank\")' " +
                "title='Spin through the links to land on random portrait images.'>" + rankerType + " ranker</div>" +
                "</div>\n";
        case "archive":
            return "<div class='headerBanner'>" +
                "   <div class='clickable' onclick='window.open(\"album.html?folder=3\", \"_blank\")'>big tits archive</div>" +
                "</div>\n";
        case "centerfold":
            return "<div class='headerBanner'>\n" +
                "   <div class='clickable' onclick='window.open(\"album.html?folder=1132\", \"_blank\")'>every Playboy Centefold</div>" +
                "</div>\n";
        case "poses":
            return "<div class='headerBanner'>\n" +
                "   <div class='clickable' onclick='window.open(\"album.html?folder=2\", \"_blank\")'>poses</div>" +
                "</div>\n";
        default:
    }
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
