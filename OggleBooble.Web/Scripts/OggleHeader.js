function setOggleHeader(folderId, subdomain) {
    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("setOggleHeader subdomain " + subdomain + "  folderId: " + folderId + " containsImageLinks: " + containsImageLinks);
    if (subdomain === undefined) {
        subdomain = "boobs";
    }
    //Include a script tag to https://smtpjs.com/v3/smtp.js

    $('.oggleHeader').addClass("boobsHeader");

    //var lang = "en";
    //$('header').switchClass('pornHeader', 'boobsHeader');

    $('.oggleHeader').html(headerHtml(folderId));
    $('.oggleHeader').append(draggableDialogHtml());
    $('.oggleHeader').append(modlaDialogHtml());

    $('#draggableDialog').resizable({
        resize: function (event, ui) {
            //$('#headerMessage').html("onresize: " + event.pageX + " note-editable.height: " + $('.note-editable').height());
            $('#headerMessage').html("dH: " + $('#draggableDialog').height() + " sH: " + $('.note-editable').height());
            $('.note-editable').height($('#draggableDialog').height() - 360);
        }
    });

    setHeaderDetails(folderId, subdomain);
    if (subdomain !== "blank")
        setLoginHeaderSection();
}


// requires no database call
function setHeaderDetails(folderId, subdomain) {

    //alert("setHeaderDetails folderId: " + folderId + ", subdomain: " + subdomain);

    $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"boobs\"," + folderId + ")'><img src='/Images/redballon.png' class='bannerImage'/></a>\n");
    $('#bannerTitle').html("OggleBooble");
    switch (subdomain) {
        case "admin":
            $('header').switchClass('pornHeader', 'boobsHeader');
            $("#divLoginArea").hide();
            $('#subheaderContent').html("admin");
            break;
        case "Index":
            if (folderId === 3909)
                showPornHeader(folderId);
            else
                showBoobsHeader(folderId);
            break;
        case "blank":
            $('#subheaderContent').html("loading");
            break;
        case "dashboard":
            $('#subheaderContent').html("dashboard");
            break;
        case "blog":
            $('#subheaderContent').html("blog");
            break;
        case "ranker":
            $('#subheaderContent').html("ranker");
            //rtpe(eventCode, CalledFrom, eventDetail, pageId);
            break;
        case "archive":
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",4,4,)'>milk cows,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1103,1103)'>russian spys,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1093,1093)'>highschool fantasy girls,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1107,1107)'>sweater meat,</a> \n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",123,123)'>ultra juggs</a> \n");

            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"archive\")'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");
            
            $('#playboyLink').html("<div class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"BAC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n");


            break;
        case "special":
        case "boobs": {
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2,2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",136,136)'> poses,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3916,3916)'> positions,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",159,159)'> topics,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",199,199)'> shapes</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",241,241)'>sizes</a>\n");

            //DUTCH subheaderContent =
            //    "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
            //    "                <a href='/album.html?folder=136'> rejser,</a>\n" +
            //    "                <a href='/album.html?folder=159'> emne,</a>\n" +
            //    "                <a href='/album.html?folder=199'> figurer</a> og\n" +
            //    "                <a href='/album.html?folder=241'>størrelser</a>\n";

            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"boobs\"," + folderId +")'" +
                " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n");
        }
            break;
        case "playboy":
        case "centerfold": {
            $('header').switchClass('pornHeader', 'boobsHeader');
            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"playboy\")'><img src='/Images/playboyBallon.png' class='bannerImage'/></a>\n");
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1132," + folderId + ")'>Centerfolds,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1986," + folderId + ")'> magazine covers,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3796," + folderId + ")'> cybergirls,</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2601," + folderId + ")'> extras</a>\n");

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
            $('#subheaderContent').html(
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",243," + folderId + ")'>cock suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",420," + folderId + ")'>boob suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",357," + folderId + ")'>cum shots</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",397," + folderId + ")'>kinky</a> and \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",411," + folderId + ")'>naughty behaviour</a>\n");

            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"porn\"," + folderId + ")'><img src='/Images/csLips02.png' class='bannerImage'/></a>\n");
            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440," + folderId + ")'>slut archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\"," + folderId + ")' " +
                "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n");
            $('#bannerTitle').html("OgglePorn");
        }
            break;
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

// requires no database call
function setLoginHeaderSection() {

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

function headerHtml(folderId) {
    // HEADER HTML
    return "   <div id='divTopLeftLogo' class='bannerImageContainer'></div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div id='' class='headerTopRow'>\n" +
        "           <div id='bannerTitle' class='headerTitle'></div >\n" +
        "           <div id='subheaderContent' class='topLinkRow'></div>\n<span id='archiveLink'></span><span id='rankerLink'></span><span id='playboyLink'></span>\n" +
        "           <div class='OggleSearchBox'>\n" +
        "               <span id='notUserName' title='Esc clears search.'>search</span>" +
        "                   <input class='OggleSearchBoxText' id='txtSearch' onfocus='startOggleSearch(" + folderId + ")' onkeydown='oggleSearchKeyDown(event)' />" +
        "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='headerBottomRow'>\n" +
        "           <div id='headerMessage' class='bottomLeftBottomHeaderArea'></div>\n" +
        "           <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "           <div class='menuTabs replaceableMenuItems'>\n" +
        "               <div id='twinsLink' class='menuTabs displayHidden'>\n" +
        "                   <a href='/album.html?folder=3904'><img src='/Images/gemini03.png' title='Hef likes twins' class='badgeImage'></a>" +
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
        "                   <div class='menuTab'><a href='javascript:onLogoutClick(" + folderId + ")'>Log Out</a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn'>\n" +
        "                   <div id='btnLayoutRegister' class='menuTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='menuTab'><a href='javascript:showLoginDialog(" + folderId + ")'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +


        "<div id='indexCatTreeContainer' class='oggleHidden'></div>\n" +

        "<div id='customMessageContainer' class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "       <div id='customMessage' class='displayHidden' ></div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div id='dirTreeContainer' class='floatingDirTreeContainer'></div>\n" +

        "<div id='modalContainer' class='modalVail'>\n" +
        "   <div id='modalContent' class='modalContentStyle'></div>\n" +
        "</div>\n" +

        "<div id='launchingService' class='floatLeft displayHidden'>\n" +
        "    <div class='centeringOuterShell randomImageContainer'>\n" +
        "        <div class='centeringInnerShell'>\n" +
        "           <img src='Images/altair02.gif' />\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n";

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

function modlaDialogHtml() {
    return "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='oggleModlaDialog' class='oggleDraggableDialog modalVail'>\n" +
        "           <div id='modalDialogHeader'class='oggleDialogHeader'>" +
        "               <div id='modalDialogTitle' class='oggleDialogTitle'></div>" +
        "               <div id='modalDialogCloseButton' class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='modalDialogClose()'/></div>\n" +
        "           </div>\n" +
        "           <div id='modalDialogContents' class='oggleDialogContents'></div>\n" +
        "      </div>\n" +
        "   </div>\n" +
        "</div>\n";


}












//$(window).scroll(function () {
//    $('.oggleHeader').css("top", 0);
//    $('#headerMessage').html("scroll: " + $(window).scrollTop() + " hdr: " + $('.oggleHeader').position().top);
//    $('.oggleHeader').css("top", 0);
//    //if ($(window).scrollTop() > elementPosition.top) {
//    //    $('#navigation').css('position', 'fixed').css('top', '0');
//    //} else {
//    //    $('#navigation').css('position', 'static');
//    //}
//});

//$('#imageContainer').on("scroll", function () {
//    $('#headerMessage').html("SCROLL: " + $('#imageContainer').offset().top);
//    //    //var visH = $(window).height() - $('.oggleHeader').height();
//    //    //$('#feedbackBanner').css("bottom", 40);
//});

//function enterResizeMode() {
//    //alert("entering resize mode");
//    $('#headerMessage').html("entering resize mode");
//    $('#draggableDialog').resizable();

//    //$('#headerMessage').html("entering resize mode. dialog bott: " + currbott);
//    //currBott = $('#draggableDialog').offset().top; // + $('#draggableDialog').height();
//    //$('#draggableDialogResizeBar').draggable();
//}

//function cancelResize() {
//    $('#draggableDialog').resizable({ disabled: true });
//}

//unction makeResizableDiv(div) {
//    const element = document.querySelector(div);
//    const resizers = document.querySelectorAll(div + ' .resizer')
//    for (let i = 0; i < resizers.length; i++) {
//        const currentResizer = resizers[i];
//        currentResizer.addEventListener('mousedown', function (e) {
//            e.preventDefault()
//            window.addEventListener('mousemove', resize)
//            window.addEventListener('mouseup', stopResize)
//        })
//    }
//}

//function resize(e) {
//    if (currentResizer.classList.contains('bottom-right')) {
//        element.style.width = e.pageX - element.getBoundingClientRect().left + 'px'
//    }
//}

//function stopResize() {
//    window.removeEventListener('mousemove', resize)
//}

function showPornHeader(folderId) {
    $('header').switchClass('boobsHeader', 'pornHeader');
    changeFavoriteIcon();
    $('body').addClass('pornBodyColors');
    $('#subheaderContent').html(
        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",243," + folderId + ")'>cock suckers</a>, \n" +
        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",420," + folderId + ")'>boob suckers</a>, \n" +
        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",357," + folderId + ")'>cum shots</a>, \n" +
        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",397," + folderId + ")'>kinky</a> and \n" +
        "               <a href='javascript:rtpe(\"BLC\"," + folderId + ",411," + folderId + ")'>naughty behaviour</a>\n");

    $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"porn\"," + folderId + ")'><img src='/Images/csLips02.png' class='bannerImage'/></a>\n");
    $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
        "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440," + folderId + ")'>slut archive</a></div>\n");
    $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\"," + folderId + ")' " +
        "title='Spin through the links to land on random portrait images. ' >porn ranker</a></div>\n");
    $('#bannerTitle').html("OgglePorn");

}

function showBoobsHeader(folderId) {
    $('#subheaderContent').html(
        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2,2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",136,136)'> poses,</a>\n" +
        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3916,3916)'> positions,</a>\n" +
        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",159,159)'> topics,</a>\n" +
        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",199,199)'> shapes</a> and\n" +
        "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",241,241)'>sizes</a>\n");

    $('#breadcrumbContainer').html("<div class='headerFeatureBanner'>" +
        "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"boobs\"," + folderId + ")'" +
        " title='Spin through the links to land on random portrait images.'>boobs ranker</a></div>\n");

    $('#breadcrumbContainer').append("<div class='headerFeatureBanner'>" +
        "\n<a href='javascript:rtpe(\"BAC\"," + folderId + ",\"Playboy button\",1132)'>every Playboy Centerfold</a></div>\n");

    $('#breadcrumbContainer').append("<div id='rankerTag' class='headerFeatureBanner'>" +
        "<a href='javascript:rtpe(\"BAC\"," + folderId + ",\"archive button\",3)'>babes archive</a></div>\n");
}

//"                  <img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
//"                   title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
//"                   \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
//"                   \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +
