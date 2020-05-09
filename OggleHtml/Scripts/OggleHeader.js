
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
function setOggleHeader(folderId, subdomain) {

    if (subdomain === undefined) {
        //if (document.domain === 'localhost') alert("subdomain === undefined");
        subdomain = "boobs";
    }
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
            "                   <div class='menuTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
            "               </div>\n" +
            "               <div id='optionNotLoggedIn'>\n" +
            "                   <div id='btnLayoutRegister' class='menuTab'><a href='javascript:showRegisterDialog()'>Register</a></div>\n" +
            "                   <div id='btnLayoutLogin' class='menuTab'><a href='javascript:showLoginDialog(" + folderId + ")'>Log In</a></div>\n" +
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
            "<div id='indexCatTreeContainer' class='oggleHidden'></div>\n" +
            "<div id='customMessageContainer' class='centeredDivShell'>\n" +
            "   <div class='centeredDivInner'>\n" +
            "       <div id='customMessage' class='displayHidden' ></div>\n" +
            "   </div>\n" +
            "</div>\n" +
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
    setHeaderDetails(folderId, subdomain);
    setOggleFooter(folderId, subdomain);
    setDashbordMenuItem();
}

// requires no database call
function setHeaderDetails(folderId, subdomain) {
    $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"boobs\"," + folderId + ")'><img src='/Images/redballon.png' class='bannerImage'/></a>\n");
    $('#bannerTitle').html("OggleBooble");
    switch (subdomain) {
        case "admin":
            $('header').switchClass('pornHeader', 'boobsHeader');
            $("#divLoginArea").hide();
            $('#subheaderContent').html("admin");
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
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId +",\"archive\",3907)'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");

            
            $('#playboyLink').html("<div class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"BAC\"," + folderId + ",1132,1132)'>every Playboy Centerfold</a></div>\n");


            break;
        case "special":
        case "boobs": 
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + "\",2)'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + "\",136)'> poses,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + "\",3916)'> positions,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + "\",159)'> topics,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + "\",199)'> shapes</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + "\",241)'>sizes</a>\n");

            //DUTCH subheaderContent =
            //    "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
            //    "                <a href='/album.html?folder=136'> rejser,</a>\n" +
            //    "                <a href='/album.html?folder=159'> emne,</a>\n" +
            //    "                <a href='/album.html?folder=199'> figurer</a> og\n" +
            //    "                <a href='/album.html?folder=241'>størrelser</a>\n";

            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>babes archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\",3907)'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");
            break;
        case "playboy":
        case "cybergirl":
        case "centerfold":
        case "center": 
            $('header').switchClass('pornHeader', 'boobsHeader');
            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\",3908,\"playboy\")'><img src='/Images/playboyBallon.png' class='bannerImage'/></a>\n");
            $('#subheaderContent').html(
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1132," + folderId + ")'>Centerfolds,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",1986," + folderId + ")'> magazine covers,</a>\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",3796," + folderId + ")'> cybergirls,</a> and\n" +
                "                <a href='javascript:rtpe(\"BLC\"," + folderId + ",2601," + folderId + ")'> extras</a>\n");

            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",3,3)'>big tits archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "\n<a href='javascript:rtpe(\"RNK\"," + folderId +",\"playboy\",3907)'" +
                " title='Spin through the links to land on random portrait images.'>babes ranker</a></div>\n");
            break;
        
        case "porn":   // rtpe(eventCode, calledFrom, eventDetail, pageId)
        case "sluts":
            $('header').switchClass('boobsHeader', 'pornHeader');
            changeFavoriteIcon();
            $('body').addClass('pornBodyColors');
            $('#subheaderContent').html(
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + ",243)'>cock suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + ",420)'>boob suckers</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + ",357)'>cum shots</a>, \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + ",397)'>kinky</a> and \n" +
                "               <a href='javascript:rtpe(\"BLC\"," + folderId + "," + subdomain + ",411)'>naughty behaviour</a>\n");

            $('#divTopLeftLogo').html("<a href='javascript:rtpe(\"HBC\"," + folderId + ",\"porn\"," + folderId +")'><img src='/Images/csLips02.png' class='bannerImage'/></a>\n");
            $('#archiveLink').html("<div id='rankerTag' class='headerFeatureBanner'>" +
                "<a href='javascript:rtpe(\"BAC\"," + folderId + ",440," + folderId + ")'>slut archive</a></div>\n");
            $('#rankerLink').html("<div id='rankerTag' class='headerFeatureBanner'>\n" +
                "<a href='javascript:rtpe(\"RNK\"," + folderId + ",\"" + subdomain + "\",3907)' " +
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

function setDashbordMenuItem() {
    if (isLoggedIn()) {
        $('#spnUserName').html(getCookieValue("UserName"));
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();

        if (isInRole("Oggle admin")) {
            $('#dashboardMenuItem').show();
            console.log("isInRole Oggle admin");
        }
        else {
            $('#dashboardMenuItem').hide();
            //console.error("NOT isInRole Oggle admin");
            //alert("NOT isInRole Oggle admin");
        }
    }
    else {
        $('#dashboardMenuItem').hide();
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
    }
}
