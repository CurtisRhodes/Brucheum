let hdrFolderId, hdrRowW, mediaDebug;

function setOggleHeader(headerContext) {

    $('#oggleHeader').html(headerHtml());

    $('#centeredDialogContents').resizable({
        resize: function () {
            $('.note-editable').height($('#centeredDialogContents').height() - 360);
        }
    });

    mediaDebug = false;
    if (mediaDebug) {
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

    switch (headerContext) {
        case "loading": {
            $("#divLoginArea").hide();
            document.title = "loading : OggleBooble";
            break;
        }
        case "album":
            break;
        case "welcome": {
            changeFavoriteIcon("redBallon");
            $('#oggleHeader').addClass('boobsHeader');
            $('#mainMenuContainer').html("Home of the Big Naturals");
            document.title = "welcome : OggleBooble";
            $("#divLoginArea").show();
            setHeaderMenu("boobs")
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
            $('#mainMenuContainer').html("dashboard");
            $("#divLoginArea").hide();
            headerMenu = "dashboard";
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
        default:
            $('#oggleHeader').addClass('boobsHeader');
            break;
    }
    setHeaderMenu(hdrFolderId, subdomain);
    setLoginSection(subdomain);
    mediaSavyHdrResize();
    window.addEventListener("resize", mediaSavyHdrResize);
}

function resetOggleHeader(folderId, rootFolder) {
    switch (rootFolder) {
        case "archive":
            changeFavoriteIcon("redBallon");
            $('#oggleHeader').addClass('boobsHeader');
            $('#divSiteLogo').attr("src", "/Images/redballon.png");
            $('#oggleHeaderTitle').html("OggleBooble");
            $('#hdrBtmRowSec3').html(addSpaButton(3, "big naturals archive"));
            $('#hdrBtmRowSec3').append(addSpaButton(72, "every Playboy Centefold"));
            $('#topRowRightContainer').html(addRankerButton("boobs"));
            break;
        case "playboyIndex":
        case "playboy":
        case "cybergirl":
        case "muses":
        case "plus":
        case "magazine":
        case "centerfold":
            //window.open("index.html?spa=72");
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            setHeaderMenu("playboy");
            break;
        case "soft": {
            // JULIA
            window.open("album.html?folder=5233");
            $('#oggleHeader').switchClass('boobsHeader', 'oggleSoft');
            $('#divSiteLogo').attr("src", "/Images/redwoman.png");
            $('#oggleHeaderTitle').html("OggleSoftcore");
            document.title = "softcore : OggleBooble";
            changeFavoriteIcon("soft");
            $('#hdrBtmRowSec3').html(addBannerButton("backToOggle"));
            $('#hdrBtmRowSec3').append(addBannerButton("porn", "OgglePorn"));
            setHeaderMenu("soft");
            break;
        }
        case "porn": {
            changeFavoriteIcon("porn");
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/csLips02.png");
            $('#oggleHeaderTitle').html("PornStar Archive ");
            setHeaderMenu("soft");
        }
        case "sluts":
            window.open("index.html?spa=3909");
            changeFavoriteIcon("porn");
            $('#oggleHeader').switchClass('boobsHeader', 'pornHeader');
            $('#divSiteLogo').attr("src", "/Images/csLips02.png");
            $('#oggleHeaderTitle').html("PornStar Archive ");
            break;
        default:
            window.location.href = "Index.html";
    }
}

function setHeaderMenu(menu) {
    switch (menu) {
        case "boobs": {
            $('#mainMenuContainer').html(
                "<span class='bigTits' onclick='headerMenuClick(3)'>BIG Naturals</span></a > organized by\n" +
                "<span onclick='headerMenuClick(3916)'>poses, </span>\n" +
                "<span onclick='headerMenuClick(136)'> positions,</span>\n" +
                "<span onclick='headerMenuClick(159)'> topics,</span>\n" +
                "<span onclick='headerMenuClick(199)'> shape,</span>\n" +
                "<span onclick='headerMenuClick(241)'> sizes</span>\n");
            if (subdomain == "root") {
            }
            if (subdomain == "index") {
                $('#topRowRightContainer').append(addRankerButton("boobs"));
            }
            if (subdomain == "archive") {
            }
            if (subdomain == "boobs") {
                $('#topRowRightContainer').html(addRankerButton("poses"));
                $('#hdrBtmRowSec3').html(addSpaButton(3, "big naturals archive"));
            }
            $('#hdrBtmRowSec3').append(addPgLinkButton("soft","softcore"));
            $('#hdrBtmRowSec3').append(addBannerButton("porn","OgglePorn"));
            break;
        }
        case "soft": {
            $('#mainMenuContainer').html(
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"soft\",243)'>pussy</a>, \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"soft\",420)'>boob suckers</a>, \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"soft\",498)'>big tit lezies</a>, \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"soft\",357)'>fondle</a>, \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"soft\",397)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"soft\",411)'>naughty behaviour</a>\n");
            break;
        }
        case "playboyIndex":
            $('#oggleHeader').switchClass('boobsHeader', 'playboyHeader');
            document.title = "every Playboy Centerfold : OggleBooble";
            // top row
            $('#divSiteLogo').attr("src", "/Images/playboyBallon.png");
            $('#oggleHeaderTitle').html("<span style='color:#fff;'>every playboy centerfold</span>");  // 1132
            $('#mainMenuContainer').html(
                //"<a href='javascript:rtpe(\"PBB\",72,\"magazine covers\",1986)'>magazine covers</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"pictorials\",4015)'>pictorials</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"extras\",2601)'>extras</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"plus\",6368)'>plus</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"muses\",6095)'>muses</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"special\",6076)'>special editions</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"lingerie\",3393)'>lingerie</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\",72,\"cybergirls\",3796)'>cybergirls</a>,\n");
                //"<a href='javascript:rtpe(\"PBB\",72,\"Pmoy\",4013)'>Pmoy</a>,\n" +
                //"<a href='javascript:rtpe(\"PBB\",72,\"Pmoy\",4932)'>just centerfolds</a>\n");
            // <div id='topRowRightContainer'></div>" +
            $('#topRowRightContainer').append(addBannerButton("ranker", "centerfold"));
            // bottom row
            // <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
            $('#breadcrumbContainer').html(
                "<a href='javascript:rtpe(\"PYC\",72,\"Playboy\",472)'>Playboy</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"1950\",621)'>1950's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"1960\",638)'>1960's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"1970\",639)'>1970's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"1980\",640)'>1980's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"1990\",628)'>1990's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"2000\",641)'>2000's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"2010\",513)'>2010's</a>,\n" +
                "<a href='javascript:rtpe(\"PYC\",72,\"2020\",4128)'>2020's</a>\n");
            // <div id='badgesContainer' class='badgesSection'></div>\n" +
            // <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
            $('#hdrBtmRowSec3').append(addBannerButton("archive"));
            $('#hdrBtmRowSec3').append(addBannerButton("porn", "OgglePorn"));
            break;
        case "playboy":
        case "cybergirl": 
        case "muses": 
        case "plus": 
        case "special": 
        case "magazine": 
        case "centerfold": {
            $('#mainMenuContainer').html(
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"playboy\",1132)'>Centerfolds,</a>\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"magazine covers\",1986)'>magazine covers</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"pictorials\",4015)'>pictorials</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"extras\",2601)'>extras</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"plus\",6368)'>plus</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"special\",6076)'>special editions</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"cybergirls\",3796)'>cybergirls</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"muses\",6095)'>muses</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"lingerie\",3393)'>lingerie</a>,\n" +
                "<a href='javascript:rtpe(\"PBB\"," + folderId + ",\"Pmoy\",4013)'>Pmoy</a>\n");
            $('#topRowRightContainer').append(addBannerButton("ranker", "centerfold"));
            // bottom row
            // <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
            $('#breadcrumbContainer').html("every playboy centerfold");
            $('#hdrBtmRowSec3').append(addBannerButton("backToOggle"));
            $('#hdrBtmRowSec3').append(addBannerButton("archive"));
            $('#hdrBtmRowSec3').append(addBannerButton("porn", "OgglePorn"));
            // <div id='badgesContainer' class='badgesSection'></div>\n" +
            // <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
            break;
        }
        case "porn": {
            $('#mainMenuContainer').html(
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"porn\",243)'>cock suckers</a>, \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"porn\",460)'>titty fuck</a>,\n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"porn\",426)'>penetration</a>,\n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"porn\",357)'>cum shots</a>, \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"porn\",694)'>kinky</a> and \n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"porn\",411)'>naughty behaviour</a>\n");
            break;
        }
        case "sluts": {
            $('#mainMenuContainer').html(
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",1174)'>big titters gone bad</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",2677)'>cocksucker lipps</a>,\n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3728)'>blonde cocksuckers</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3730)'>amatures</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3731)'>sweet nasty girls</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4022)'>big girls</a>,\n" +
                //"<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4198)'>milf cocksuckers</a>,\n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",4271)'>retro porn stars</a>,\n" +
                "<a href='javascript:rtpe(\"TLM\"," + folderId + ",\"sluts\",3739)'>exploited teens</a>\n");

            $('#hdrBtmRowSec3').html(addBannerButton("backToOggle"));
            $('#hdrBtmRowSec3').append(addBannerButton("porn", "back to porn"));
            $('#hdrBtmRowSec3').append(addRankerButton("porn"));
            break;
        }
        default: {
            logError("SWT", folderId, "subdomain: " + subdomain, "setHdrBottomRow");
        }
    }
}

function openBannerButton(bannerType) {
    switch (bannerType) {
        case "archive":
            location.href = "album.html?folder=3";
            break;
        case "centerfold":
            location.href = "index.html?spa=72";
            break;
        case "porn":
            location.href = "index.html?spa=3909";
            break;
        case "soft":
            location.href = "album.html?folder=5233";
            break;
        case "poses":
            location.href = "album.html?folder=2";
            break;
        case "sluts":
            location.href = "album.html?folder=440";
            break;
        case "backToOggle":
            location.href = "index.html";
            break;
        default:
            logError("SWT", hdrFolderId, "bannerType: " + bannerType, "openBannerButton");
    }
}

function addBannerButton(buttonType, folderId) {
    return "<div class='headerBannerButton'>" +
        "   <div class='clickable' onclick='location.href=\"album.html?folder=" + folderId + "'</div>" +
        "</div>\n";
}

function addRankerButton(rankerType) {
    return "<div class='headerBannerButton'>\n" +
        "<div class='clickable' onclick=\"location.href=\'index.html?spa=ranker&bp=" + rankerType + "\' " +
        "title='Spin through the links to land on random portrait images.'>" + rankerType + " ranker</div>" +
        "</div>\n";
}

function addPgLinkButton(folderId, labelText) {
    return "<div class='headerBannerButton'>" +
        "   <div class='clickable' onclick='location.href=\"album.html?folder=" + folderId + "'</div>" + labelText + "</div>\n";
}

function addSpaButton(spa,labelText) {
    return "<div class='headerBannerButton'>" +
        "   <div class='clickable' onclick='location.href=\"index.html?spa=" + labelText + "'</div>" +
        "</div>\n";








    switch (bannerType) {
        case "porn":
            return "<div class='headerBannerButton'>" +
                "   <div class='clickable' onclick='location.href=\"index.html?spa=3909'</div>" +
                "</div>\n";
            break;
        case "soft":
            return "<div class='headerBannerButton'>" +
                "   <div class='clickable' onclick='location.href=\"index.html?spa=" + spa + "'</div>" +
                "</div>\n";
            break;
        case "backToOggle":
            return "<div class='headerBannerButton'>" +
                "   <div class='clickable' onclick='openBannerButton(\"" + bannerType + "\",\"" + rankerType + "\")'>back to OggleBooble</div>" +
                "</div>\n";
            break;
        case "sluts":
            return "<div class='headerBannerButton'>" +
                "   <div class='clickable' onclick='openBannerButton(\"" + bannerType + "\",\"" + rankerType + "\")'>porn star archive</div>" +
                "</div>\n";
        case "archive":
            // alert("addBannerButton('archive')");
           return "<div class='headerBannerButton'>" +
                "   <div class='clickable' onclick='openBannerButton(\"" + bannerType + "\",\"" + rankerType + "\")'>big naturals archive</div>" +
                "</div>\n";
        case "centerfold":
            return "<div class='headerBannerButton'>\n" +
                "   <div class='clickable' onclick='openBannerButton(\"" + bannerType + "\",\"" + rankerType + "\")'>every Playboy Centefold</div>" +
                "</div>\n";
        case "poses":
            return "<div class='headerBannerButton'>\n" +
                "   <div class='clickable' onclick='openBannerButton(\"" + bannerType + "\",\"" + rankerType + "\")'>poses</div>" +
                "</div>\n";
        default:
            logError("SWT", hdrFolderId, "bannerType: " + bannerType, "addBannerButton");
    }
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
        //alert("isLoggedIn: " + isLoggedIn);
        if (isLoggedIn == "true") {
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
            //$('.badgeImage').css("height", "25px");
            //$('.badgeImage').css("font-size", "10px").show();            
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
        $('#mainMenuContainer').css("font-size", "20px").show();  // id='mainMenuContainer' class='hdrTopRowMenu' font-size: 32px; font-family: Comic Sans MS; color: var(--oggleTitleColor); vertical-align: top; padding-left: 28px; margin-right: 8px; margin-top: 1px;    padding: 0;
        $('.headerBannerButton').css("font-size", "14px");
        $('#topRowRightContainer').show();
        $('#oggleHeaderTitle').css("color", "black").css("height", "28px").show(); ; // font-size: 28px;
        //<div id='topRowRightContainer'></div>" +
        // searchBox class='oggleSearchBox'

        if (hdrTopRowSectionsW() > hdrRowW) {
            //$('#divSiteLogo').css("height", "70px").show(); 
            $('#oggleHeaderTitle').css("color", "blue").css("height", "25px");
            //$('#mainMenuContainer').css("font-size", "25px").show();
            $('.headerBannerButton').css("font-size", "14px");

            //$('.badgeImage').css("height", "25px");
            $('.badgeImage').css("font-size", "10px");            
            $('#searchBox').css("font-size", "10px");
            lasttopRowOption = "t1";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            //$('#divSiteLogo').css("height", "60px"); 
            $('#oggleHeaderTitle').css("color", "orange").css("height", "23px");
            $('#mainMenuContainer').css("font-size", "22px").show();
            $('.headerBannerButton').css("font-size", "13px");
            lasttopRowOption = "t2";
        }
        if (hdrTopRowSectionsW() > hdrRowW) {
            $('#divSiteLogo').css("height", "50px"); 
            $('#oggleHeaderTitle').css("color", "red").css("height", "20px");
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

function hdrBottRowSectionsW() {
    let calcIssue = 47;
    return $('#headerMessage').width() + $('#breadcrumbContainer').width() + $('#badgesContainer').width() + $('#divLoginArea').width() + calcIssue;
}
function hdrTopRowSectionsW() {
    let topRowFudgeFactor = 16;
    return $('#oggleHeaderTitle').width() + $('#mainMenuContainer').width() + $('#topRowRightContainer').width() + $('#searchBox').width() + topRowFudgeFactor;
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

function topLogoClick(subdomain) {
    //    if (document.domain == "localhost") alert("subdomain: " + subdomain);
    //logEvent("TLC", hdrFolderId, "", subdomain);
    //if ($('divSiteLogo').prop("src") == "/Images/redballon.png")

    switch ($('#divSiteLogo').prop("src")) {
        case "/Images/redwoman.png":
            window.open("index.html?spa=3909");
            break;
        case "/Images/playboyBallon.png":
            window.location.href = "Index.html?spa=72";
            break;
        case "/Images/csLips02.png":
            window.location.href = "Index.html?spa=72";
            break;

        default:
    }
}

//<img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
// title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
// \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
// \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +

function headerHtml(subdomain) {
    return "<div class='siteLogoContainer' onclick='topLogoClick()' >" +
        //"       <a href='javascript:(\"" + subdomain + "\")'>" +
        "       <img id='divSiteLogo' class='siteLogo' src='/Images/redballon.png'/>" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div id='oggleHeaderTitle' class='calligraphyTitle'></div >\n" +
        "           <div id='mainMenuContainer' class='hdrTopRowMenu'></div>" +
        "           <div id='topRowRightContainer'></div>" +
        "           <div id='searchBox' class='oggleSearchBox'>\n" +
        "               <span id='notUserName' title='Esc clears search.'>search</span>" +
        "                   <input class='oggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
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
        "                   <div class='hoverTab' title='modify profile'><a href='javascript:showUserProfileDialog()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                   <div class='hoverTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn' class='displayHidden'>\n" +
        "                   <div id='btnLayoutRegister' class='hoverTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='hoverTab'><a href='javascript:showLoginDialog()'>Log In</a></div>\n" +
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
