function getHeader(subdomain) {
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
        "               <div class='menuTab floatLeft'><a href='Article.html?ArticleList=0'>Latest Articles</a></div>\n" +
        "               <div class='menuTab floatLeft'><a href='~/BookDb/Index'>Books</a></div>\n" +
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