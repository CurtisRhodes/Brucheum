

function setOggleHeader(headerContext) {

    $('#oggleHeader').html(headerHtml());

    switch (headerContext) {
        case "root":
        case "index": {
            changeFavoriteIcon("redBallon");
            $('#oggleHeader').addClass('boobsHeader');
            $('#mainMenuContainer').html("Home of the Big Naturals");
            document.title = "welcome : OggleBooble";
            break;
        }
        case "album":
        case "loading": {
            $("#divLoginArea").hide();
            document.title = "loading : OggleBooble";
            break;
        }
        case "playboyIndex":
            changeFavoriteIcon("centerfold");
            document.title = "Every Playboy Centerfold : OggleBooble";
            break;
        case "porn":
            changeFavoriteIcon("porn");
            document.title = "welcome : OgglePorn";
            break;
        case "dashboard": {
            $('#headerMessage').html("dashboard");
            headerMenu = "dashboard";
            break;
        }
        case "blog": {
            // <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
            $('#headerMessage').html("blog");
            changeFavoriteIcon("redBallon");
            break;
        }
        case "ranker": {
            $('#headerMessage').html("ranker");
            break;
        }
        default:
            alert("headerContext " + headerContext + " not handled");
            break;
    }
    //mediaSavyHdrResize();
    //window.addEventListener("resize", mediaSavyHdrResize);
}

function setFavoriteIcon(rootFolder) {
    switch (rootFolder) {
        case "root":
        case "dashboard":
        case "index":
        case "blog":
        case "album":
        case "ranker":
        case "loading":
            changeFavoriteIcon("redBallon");
            break;
        case "playboyIndex":
            changeFavoriteIcon("centerfold");
            break;
        case "porn":
            changeFavoriteIcon("porn");
            break;
        default:
            alert("headerContext " + headerContext + " not handled");
            changeFavoriteIcon("redBallon");
            break;
    }
} 

let hdrFolderId, hdrRootFolder;
function resetOggleHeader(folderId, rootFolder) {
    hdrFolderId = folderId;
    hdrRootFolder = rootFolder;
    $('#divLoginArea').show();
    //$('#hdrBtmRowSec3').html("");
    $('#oggleHeaderTitle').html(rootFolder);
    switch (rootFolder) {
        case "boobs":
            $('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
        case "root":
        case "index":
            $('#hdrBtmRowSec3').append(addSpaButton(3909, "Oggle Porn"));
            $('#hdrBtmRowSec3').append(addPgLinkButton(5233, "softcore"));
            $('#hdrBtmRowSec3').append(addPgLinkButton(846, "Gent Archive"));
            $('#hdrBtmRowSec3').append(addSpaButton(72, "every playboy centerfold"));
        case "archive": {
            changeFavoriteIcon("redBallon");
            $('#oggleHeader').switchClass('playboyHeader', 'boobsHeader');
            $('#divSiteLogo').attr("src", "/Images/redballon.png");
            $('#oggleHeaderTitle').html("OggleBooble");
            $('#topRowRightContainer').html(addRankerButton("010000000", "big naturals ranker"));
            setHeaderMenu("boobs");
            break;
        }
        case "playboyIndex":
            $('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            document.title = "every Playboy Centerfold : OggleBooble";
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#oggleHeaderTitle').html("<span style='color:#fff;'>every playboy centerfold</span>");
            $('#topRowRightContainer').append(addRankerButton("001000000", "centerfold ranker"));
            $('#hdrBtmRowSec3').append(addSpaButton(3908, "back to OggleBooble"));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            //$('#hdrBtmRowSec3').append(addSpaButton(3909, "Oggle Porn"));
            setHeaderMenu("playboyIndex");
            break;
        case "playboy":
            $('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Playboy");
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("001000000", "centerfold ranker"));
            $('#hdrBtmRowSec3').append(addSpaButton(3908, "back to OggleBooble"));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            //$('#hdrBtmRowSec3').append(addSpaButton(3909, "Oggle Porn"));
            setHeaderMenu("playboy");
            break;
        case "cybergirl":
            $('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Cybergirls");
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000100000", "Cybergirls ranker"));
            // bottom row
            $('#hdrBtmRowSec3').append(addSpaButton(3908, "back to OggleBooble"));
            $('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            $('#hdrBtmRowSec3').append(addSpaButton(3909, "Oggle Porn"));
            setHeaderMenu("playboy");
            break;
        case "muses":
            $('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("muses");
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000010000", "Muses ranker"));
            // bottom row
            $('#badgesContainer').append(addSpaButton(3908, "back to OggleBooble"));
            //$('#hdrBtmRowSec3').append(addPgLinkButton(3, "big naturals archive"));
            //$('#hdrBtmRowSec3').append(addSpaButton(3909, "Oggle Porn"));
            setHeaderMenu("playboy");
            break;
        case "plus":
            $('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("Playboy Plus");
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("000001000", "Muses ranker"));
            // bottom row
            $('#badgesContainer').append(addSpaButton(3908, "back to OggleBooble"));
            setHeaderMenu("playboy");
            break;
        case "magazine":
        case "centerfold": {
            //$('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            $('#oggleHeaderTitle').html("playboy centerfold");
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#topRowRightContainer').append(addRankerButton("001000000", "centerfold ranker"));
            // bottom row
            $('#hdrBtmRowSec3').append(addSpaButton(3908, "back to OggleBooble"));
            setHeaderMenu("playboy");
            break;
        }
        case "soft": {
            $('#oggleHeader').switchClass('boobsHeader', 'oggleSoft');
            $('#divSiteLogo').attr("src", "/Images/redwoman.png");
            document.title = "softcore : OggleBooble";
            changeFavoriteIcon("soft");
            $('#oggleHeaderTitle').html("OggleSoftcore 2");
            // bottom row
            $('#badgesContainer').append(addSpaButton(3908, "back to OggleBooble"));
            $('#badgesContainer').append(addSpaButton(3909, "OgglePorn"));
            $('#badgesContainer').append(addPgLinkButton(440, "porn actresses archive"));
            setHeaderMenu("soft");
            break;
        }
        case "porn": {
            changeFavoriteIcon("porn");
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/csLips02.png");
            $('#oggleHeaderTitle').html("OgglePorn ");
            $('#topRowRightContainer').html(addRankerButton("000000010", "porn ranker"));
            // bottom row
            $('#badgesContainer').append(addSpaButton(3908, "back to OggleBooble"));
            $('#badgesContainer').append(addPgLinkButton(440, "porn actresses archive"));
            $('#badgesContainer').append(addPgLinkButton(5233, "softcore"));
            setHeaderMenu("porn");
            break;
        }
        case "sluts":
            changeFavoriteIcon("porn");
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/csLips02.png");
            $('#oggleHeaderTitle').html("PornStar Archive ");
            $('#topRowRightContainer').html(addRankerButton("000000001", "porn star ranker"));
            // bottom row
            $('#badgesContainer').append(addSpaButton(3908, "back to OggleBooble"));
            $('#badgesContainer').append(addSpaButton(3909, "back to porn"));
            setHeaderMenu("sluts");
            break;
        default:
            alert("resetOggleHeader rootFolder " + rootFolder + " not handled");
            window.location.href = "Index.html";
    }

    //console.log("header says IsLoggedIn = " + localStorage["IsLoggedIn"]);
    if (isNullorUndefined(localStorage["IsLoggedIn"])) {
        localStorage["IsLoggedIn"] = "false";
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
        $('#footerCol5').hide();

        logError("LSH", folderId, "rootFolder: " + rootFolder, "resetOggleHeader");  // localStorage isLoggedIn Undefined in header
        loadUserProfile(folderId, "resetOggleHeader");

    }
    else {
        if (localStorage["IsLoggedIn"] == "true") {
            //console.log("I say IsLoggedIn is true: " + localStorage["IsLoggedIn"]);
            $('#spnUserName').html(localStorage["UserName"]);
            $('#optionNotLoggedIn').hide();
            $('#optionLoggedIn').show();
            $('#footerCol5').show();
        }
        else {
            //console.log("I say IsLoggedIn is false: " + localStorage["IsLoggedIn"]);
            $('#optionLoggedIn').hide();
            $('#optionNotLoggedIn').show();
            $('#footerCol5').hide();
        }
    }
}

function setHeaderMenu(menu) {
    switch (menu) {
        case "boobs": {
            $('#mainMenuContainer').html(
                "<span class='bigTits' onclick='headerMenuClick(\"boobs\",3)'>BIG Naturals</span></a > organized by\n" +
                "<span onclick='headerMenuClick(\"boobs\",3916)'>poses, </span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",136)'> positions,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",159)'> topics,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",199)'> shape,</span>\n" +
                "<span onclick='headerMenuClick(\"boobs\",241)'> sizes</span>\n");
            break;
        }
        case "soft": {
            $('#mainMenuContainer').html(
                "<span onclick='headerMenuClick(\"soft\",243)'>pussy, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",420)'>boob suckers, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",498)'>big tit lezies, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",357)'>fondle, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",397)'>kinky, </span>\n" +
                "<span onclick='headerMenuClick(\"soft\",411)'>naughty behaviour</span>\n");
            break;
        }
        case "playboy":
            $('#mainMenuContainer').html(
                "<span onclick='headerMenuClick(\"centerfold\",4015)'>pictorials, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",2601)'>extras, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",6368)'>plus, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",6076)'>specials, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",3393)'>lingerie, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",1986)'>magazine covers, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"centerfold\",3796)'>cybergirls</span>\n"
            );
            break;
        case "playboyIndex":
            $('#mainMenuContainer').html(
                "<span onclick='headerMenuClick(\"playboyIndex\",4015)'>pictorials, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",2601)'>extras, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6368)'>plus, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6095)'>muses, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",6076)'>specials, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",3393)'>lingerie, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",3796)'>cybergirls </span>\n"
            );
            $('#breadcrumbContainer').html(
                "<span onclick='headerMenuClick(\"playboyIndex\",621)'>1950's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",638)'>1960's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",339)'>1970's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",640)'>1980's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",628)'>1990's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",641)'>2000's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",513)'>2010's, </span>\n" +
                "<span onclick='headerMenuClick(\"playboyIndex\",4128)'>2020's, </span>\n" 
            );
                //"<a href='javascript:rtpe(\"PBB\",72,\"magazine covers\",1986)'>magazine covers</a>,\n" +
                //"<a href='javascript:rtpe(\"PBB\",72,\"Pmoy\",4013)'>Pmoy</a>,\n" +
                //"<a href='javascript:rtpe(\"PBB\",72,\"Pmoy\",4932)'>just centerfolds</a>\n");
            //$('#breadcrumbContainer').html(
            //"<span onclick='headerMenuClick(\"centerfold\",3796)'>cybergirls, </span>\n"

            //    "<span onclick='headerMenuClick('playboyCarousel',4015)'>pictorials, </span>\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"Playboy\",472)'>Playboy</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1950\",621)'>1950's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1960\",638)'>1960's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1970\",639)'>1970's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1980\",640)'>1980's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"1990\",628)'>1990's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"2000\",641)'>2000's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"2010\",513)'>2010's</a>,\n" +
            //    "<a href='javascript:rtpe(\"PYC\",72,\"2020\",4128)'>2020's</a>\n");
            // <div id='badgesContainer' class='badgesSection'></div>\n" +
            // <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
            break;
        case "porn": {
            $('#mainMenuContainer').html(
                "<span onclick='headerMenuClick(\"porn\",243)'>cock suckers, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",460)'>titty fuck, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",426)'>penetration, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",357)'>cum shots, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",694)'>kinky, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",411)'>naughty behaviour</span>\n");
            break;
        }
        case "sluts": {
            $('#mainMenuContainer').html(
                "<span onclick='headerMenuClick(\"porn\",1174)'>big titters gone bad, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",3728)'>blonde cocksuckers, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",4271)'>retro porn stars, </span>\n" +
                "<span onclick='headerMenuClick(\"porn\",3739)'>exploited teens<span>\n");
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",2677)'>cocksucker lipps</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3730)'>amatures</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3731)'>sweet nasty girls</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4022)'>big girls</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4198)'>milf cocksuckers</a>,\n" +
            break;
        }
        default: {
            alert("menu: " + menu + " unhandled");
            logError("SWT", folderId, "subdomain: " + subdomain, "setHdrBottomRow");
        }
    }
}

function addRankerButton(rankerType, labelText) {
    return "<div class='headerBannerButton'>\n" +
        "<div class='clickable' onclick='location.href=\"index.html?spa=3907&bp=" + rankerType + "\"'" +
        "title='Spin through the links to land on random portrait images.'>" + labelText + "</div>" +
        "</div>\n";
}

function addPgLinkButton(folderId, labelText) {
    return "<div class='headerBannerButton'>" +
        //"   <div class='clickable' onclick='location.href=\"album.html?folder=" + folderId + "\"'>" + labelText + "</div>" +
        "   <div class='clickable' onclick='rtpe(\"HB2\",\"" + hdrRootFolder + "\"," + hdrFolderId + "," + folderId + ")'>" + labelText + "</div>" +
        "</div>\n";
}

function addSpaButton(spaId, labelText) {
    return "<div class='headerBannerButton'>" +
        "   <div class='clickable' onclick='rtpe(\"HBC\",\"" + hdrRootFolder + "\"," + spaId + "," + hdrFolderId + ")'>" + labelText + "</div>" +
        "</div>\n";
}

function showHamburger() {
    var picpos = $('#breadcrumbContainer').offset();
    var picLeft = Math.max(0, picpos.left + $('#hamburgerCtx').width());
    $('#hamburgerCtx').css("top", picpos.top + 5);
    $('#hamburgerCtx').css("left", picLeft);
    $('#hamburgerCtx').show();
}

function showResizeMessage(lasttopRowOption, lastBottomRowOption) {
    if (mediaDebug) {
        //if (!secMsg.includes("RESET"))
        $('#aboveImageContainerMessageArea').html("Top: " + lasttopRowOption + " : " + hdrTopRowSectionsW().toLocaleString() +
            " Bot: " + lastBottomRowOption + " : " + hdrBottRowSectionsW().toLocaleString() +
            "<span style='margin-left:45px;'>rW: </span> (" + $('.headerTopRow').width().toLocaleString() + ")");
    }
}

function headerMenuClick(calledFrom, folderId) {
    //alert("headerMenuClick folderId: " + folderId);
    logEvent("TMC", folderId, calledFrom);
    location.href = "album.html?folder=" + folderId;
}

function topLogoClick() {
    let logoImage = $('#divSiteLogo').prop("src").substr($('#divSiteLogo').prop("src").lastIndexOf("/") + 1);
    switch (logoImage) {
        case "redballon.png": location.href = "index.html"; break;
        case "redwoman.png": window.open("index.html?folder=440"); break;
        case "playboyBallon.png": window.location.href = "Index.html?spa=72"; break;
        case "csLips02.png": window.location.href = "Index.html?spa=3909"; break;
        default:
            alert("topLogoClick: " + logoImage + " not handled");
            location.href = "index.html"; break;
    }
}

function headerTitleClick() {
    alert("headerTitle: " + $('#oggleHeaderTitle').html());
}

function headerHtml() {
    return "<div class='siteLogoContainer' onclick='topLogoClick()' >" +
        "       <img id='divSiteLogo' title='home' class='siteLogo' src='/Images/redballon.png'/>" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div id='oggleHeaderTitle' onclick='headerTitleClick()' class='calligraphyTitle'></div >\n" +
        "           <div id='mainMenuContainer' class='hdrTopRowMenu'></div>" +
        "           <div id='topRowRightContainer'></div>" +
        "           <div id='searchBox' class='oggleSearchBox'>\n" +
        "               <span id='notUserName' title='Esc clears search.'>search</span>" +
        "                   <input class='oggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)'></input>" +
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
        "                   <div class='hoverTab' title='modify profile'><a href='javascript:showUserProfileDialog()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                   <div class='hoverTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn' class='displayHidden'>\n" +
        "                   <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog(\"true\")'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog()'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +

        "<div id='indexCatTreeContainer' class='oggleDialogContainer'></div>\n" +

        "<div id='customMessageContainer' class='oggleDialogContainer'>\n" +
        "    <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='centeredDialogContainer' class='oggleDialogContainer'>\n" +
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
        "</div>\n";
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
    $("#vailShell").fadeOut();
    $('#centeredDialogContainer').fadeOut();
    if (typeof resume === 'function') resume();
}
