function setHeader(headerContext) {
    $('header').html(headerHtml());
    switch (headerContext) {
        case "Brucheum":
            $("#bannerTitle").html("The Brucheum");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displaySpaPage(\"ArticleList\")'>Latest Articles</div>\n
                <div class='menuTab floatLeft' onclick='displaySpaPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft'>Apps</div>\n
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
        //"           <div id='oggleHeaderTitle' onclick='headerTitleClick()' class='calligraphyTitle'></div >\n" +
        //"           <div id='mainMenuContainer' class='hdrTopRowMenu'></div>" +
        "           <div id='topRowRightContainer'></div>" +
        //"           <div id='searchBox' class='oggleSearchBox'>\n" +
        //"               <span id='notUserName' title='Esc clears search.'>search</span>" +
        //"                   <input class='oggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)'></input>" +
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

        "<div id='indexCatTreeContainer' class='oggleDialogContainer'></div>\n" +

        "<div id='customMessageContainer' class='oggleDialogContainer'>\n" +
        "    <div id='customMessage' class='customMessageContainer' ></div>\n" +
        "</div>\n" +

        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='centeredDialogContainer' class='dialogContainer'>\n" +
        "           <div id='centeredDialogHeader'class='dialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>" +
        "               <div id='centeredDialogTitle' class='dialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='dialogCloseButton'>" +
        "               <img src='/images/poweroffRed01.png' onclick='dragableDialogClose()'/></div>\n" +
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

function XXgetHeader(subdomain) {
    var headerHtml;
    if (subdomain === "bruch" || subdomain === "playmates") {
        headerHtml =
        "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
        "       <a href='index.html'><img src='Images/house.gif' class='bannerImage' /></a>\n" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div class='headerTitle' id='bannerTitle'>Curtis Rhodes.com</div>\n" +
        "           <div class='headerSubTitle' id='headerSubTitle'></div>\n" +
        "       </div>\n"+
        "       <div class='headerBottomRow'>\n" +
        "           <div id='headerMessage' class='floatLeft'></div>\n" +
        "           <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "               <div class='menuTabs replaceableMenuItems'>\n" +
        "               <div class='menuTab floatLeft'><a href='Article.html?ArticleList=Latest Articles'>Latest Articles</a></div>\n" +
        "               <div class='menuTab floatLeft'><a href='Index.html?spa=Books'>Books</a></div>\n" +
        "               <div class='menuTab floatLeft'><a href='~/Home/Apps'>Apps</a></div>\n" +
        "               <div class='menuTab floatLeft'><a href='/IntelDsgn/Index'>Intelligent Design</a></div>\n" +
        "           </div>\n" ;
    }
    headerHtml +=
    "           <div id='optionLoggedIn' class='displayHidden'>\n" +
    "               <div class='menuTab floatRight'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
    "               <div class='menuTab floatRight' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
    "           </div>\n" +
    "           <div id='optionNotLoggedIn'>\n" +
    "               <div id='btnLayoutRegister' class='menuTab floatRight'><a href='javascript:onRegisterClick()'>Register</a></div>\n" +
    "               <div id='btnLayoutLogin' class='menuTab floatRight'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
    "           </div>\n" +
    "           <div class='menuTabs' id='adminTabs'>\n" +
    "              <div id='menuTabAdmin' class='menuTab displayHidden loginRequired floatRight'><a href='/Dashboard.html'>dashboard</a></div>\n" +
    "           </div>\n" +
    "       </div>\n" +
    "   </div>\n";
    
    $('header').html(headerHtml);
}