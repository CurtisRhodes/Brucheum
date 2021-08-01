function setHeader(headerContext) {
    $('header').html(headerHtml());
    switch (headerContext) {
        case "Brucheum":
            $("#bannerTitle").html("The Brucheum");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displaySpaPage(\"ArticleList\")'>Latest Articles</div>\n
                <div class='menuTab floatLeft' onclick='displaySpaPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft' onclick='openAt(\"Books\")'>Apps</div>\n
                <div class='menuTab floatLeft'>Intelligent Design</div>\n`);
            break;
        case "Books":
            $("#bannerTitle").html("Curtis Rhodes.com : Books");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft'>Latest Articles'</div>\n
                <div class='menuTab floatLeft'>Books</div>\n
                <div class='menuTab floatLeft'>Apps</div>\n
                <div class='menuTab floatLeft'>Intelligent Design</div>\n`);
            break;
        case "Articles":
            $("#bannerTitle").html("Curtis Rhodes.com : Articles");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft'>Latest Articles'</div>\n
                <div class='menuTab floatLeft'>Books</div>\n
                <div class='menuTab floatLeft'>Apps</div>\n
                <div class='menuTab floatLeft'>Intelligent Design</div>\n`);
            break;
        default:
            $("#bannerTitle").html("whaa whooo");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft'>Latest Articles'</div>\n
                <div class='menuTab floatLeft'>Books</div>\n
                <div class='menuTab floatLeft'>Apps</div>\n
                <div class='menuTab floatLeft'>Intelligent Design</div>\n`);
            break;
    }
}

//"   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +

function headerHtml() {
    return "<div class='siteLogoContainer' onclick='displaySpaPage(\"Brucheum\")'>" +
        "       <img id='divSiteLogo' title='home' class='bannerImage' src='Images/house.gif' />" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div class='headerTitle' id='bannerTitle'>Curtis Rhodes.com</div>\n" +
        "           <div class='headerSubTitle' id='headerSubTitle'></div>\n" +
        "           <div id='topRowRightContainer'></div>" +
        //"           <div id='searchBox' class='searchBox'>\n" +
        //"               <span id='notUserName' title='Esc clears search.'>search</span>" +
        //"                   <input class='searchBoxText' id='txtSearch' onkeydown='searchKeyDown(event)'></input>" +
        //"               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        //"           </div>\n" +
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

        "<div id='indexCatTreeContainer' class='dialogContainer'></div>\n" +

        "<div id='customMessageContainer' class='dialogContainer'>\n" +
        "    <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='centeredDialogContainer' class='dialogContainer'>\n" +
        "           <div id='centeredDialogHeader'class='dialogHeader'>" +
        "               <div id='centeredDialogTitle' class='dialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='dialogCloseButton'>" +
        "               <img src='/images/poweroffRed01.png' onclick='$(\"#centeredDialogContainer\").hide()'/></div>\n" +
        "           </div>\n" +
        "           <div id='centeredDialogContents' class='dialogContents'></div>\n" +
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

