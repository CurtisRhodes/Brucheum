function getHeader(subdomain) {
    var headerHtml;
    var lang = "en";

    if (subdomain === "boobs" || subdomain === "archive") {
        if (lang === "en") {
            headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
            "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div id='' class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
            "                <a href='/album.html?folder=2'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
            "                <a href='/album.html?folder=136'> poses,</a>\n" +
            "                <a href='/album.html?folder=159'> topic,</a>\n" +
            "                <a href='/album.html?folder=199'> shapes</a> and\n" +
            "                <a href='/album.html?folder=241'>sizes</a>\n" +
            "            </div>\n" +
            "                <div class='menuTabs boobRankerBanner' >\n" +
            "                    <a href='/Ranker.html' target='_blank'>Boobs Ranker</a>" +
            "               </div>\n";
            "       </div>\n";
        }
        if (lang === "DE") {
            headerHtml =
                "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
                "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
                "   </div>\n" +
                "   <div class='headerBodyContainer'>\n" +
                "       <div id='' class='headerTopRow'>\n" +
                "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
                "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
                "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
                "                <a href='/album.html?folder=136'> rejser,</a>\n" +
                "                <a href='/album.html?folder=159'> emne,</a>\n" +
                "                <a href='/album.html?folder=199'> figurer</a> og\n" +
                "                <a href='/album.html?folder=241'>størrelser</a>\n" +
                "            </div>\n" +
                "        </div>\n" +
                "       <div class='menuTabs boobRankerBanner' >\n" +
                "          <a href='/Ranker.html' target='_blank'>Boobs Ranker</a>" +
                "        </div>\n";
        }
    }


    if (subdomain === "playboy" || subdomain === "playmates") {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
            "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>Every Playboy Centerfold" +
            "            </div>\n" +
            "        </div>\n";
    }


    if (subdomain === "admin") {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
            "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>Admin" +
            "            </div>\n" +
            "        </div>\n";
    }

    if (subdomain === "porn" || subdomain === "sluts") {
        $('body').addClass('pornBodyColors');
        headerHtml =
            "   <div id='divTopLeftLogo' class='pornHeaderColors bannerImageContainer'>\n" +
            "       <a href='/index.html?subdomain=porn'><img src='Images/csLips02.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='pornHeaderColors headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OgglePorn</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
            "               <a href='/album.html?folder=243'>cock suckers</a>, \n" +
            "               <a href='/album.html?folder=420'>boob suckers</a>, \n" +
            "               <a href='/album.html?folder=357'>cum shots</a>, \n" +
            "               <a href='/album.html?folder=397'>kinky</a> and \n" +
            "               <a href='/album.html?folder=411'>naughty behaviour</a>\n" +
            "           </div>\n" +
            "       </div>\n";
    }

    headerHtml +=
        "   <div class='headerBottomRow'>\n" +
        "       <div id='headerMessage' class='floatLeft'></div>\n" +
        "       <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "       <div class='menuTabs replaceableMenuItems'>\n" +
        "           <div id='freeonesLink' class='menuTabs displayHidden'>\n" +
        "              <a href='http://www.freeones.com' target='_blank'><img src='/Images/freeones.png' class='freeones'></a>" +
        "           </div>\n" +
        "           <div id='babapediaLink' class='menuTabs displayHidden'>\n" +
        "              <a href='https://www.babepedia.com' target='_blank'><img src='/Images/babepedia.png' class='freeones'></a>" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div id='optionLoggedIn' class='displayHidden'>\n" +
        "           <div class='menuTab floatRight'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "           <div class='menuTab floatRight' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "       </div>\n" +
        "       <div id='optionNotLoggedIn'>\n" +
        "           <div id='btnLayoutRegister' class='menuTab floatRight'><a href='javascript:onRegisterClick()'>Register</a></div>\n" +
        "               <div id='btnLayoutLogin' class='menuTab floatRight'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
        "           </div>\n" +
        "           <div class='menuTabs' id='adminTabs'>\n" +
        "              <div id='menuTabAdmin' class='menuTab displayHidden loginRequired floatRight'><a href='/Dashboard.html'>dashboard</a></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n";

    $('header').html(headerHtml);
}
