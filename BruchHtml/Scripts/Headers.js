function resetCustomPage() {
    $('#tanBlue').hide();
    $("#bannerTitle").html("The Brucheum");
    $("#headerSubTitle").html("");
    $('body').css("background-color", "#eeddbb");
    changeFavoriteIcon("default");
    stopCarousel();
    $("#optionNotLoggedIn").show();
    $("#optionLoggedIn").hide();    
}

function displayCustomPage(pageName) {
    resetCustomPage();
    //alert("this.html(): " + $(this).html());
    switch (pageName) {
        case "Carosuel":
            document.title = "welcome : Brucheum";
            $('#tanBlue').show();
            $("#breadcrumbContainer").html(`
                <div class='hoverTab'><a href='javascript:displayArticleList()'>Latest Articles</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"Books\")'>Books</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"Apps\")'>Apps</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"IntelDesign\")'>Intelligent Design</a></div>\n
                <div class='hoverTab'><a href='javascript:displayCustomPage(\"GetaGig\")'>Get a Gig</a></div>\n`
            );
            loadAndStartCarousel();
            break;
        case "Books":
            document.title = "books : CurtisRhodes.com";
            $("#headerSubTitle").html("My Books");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Carosuel\")'>Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Apps\")'>Apps</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"GetaGig\")'>Get a Gig</div>\n`
            );
            $("#middleColumn").html(`
                    <div id="tocLoadingGif"><img class="loadingGif" src="Images/loader.gif" /></div>
                    <div class="pageTitle" id="divBooksWriting">Books I am writing</div>
                    <div class="divMyBooks">
                        <div class="divBook" book="The Blond Jew" onclick="showBook(1)">
                            <img class="bookImage" src="Images/TheBlondJew.jpg" />
                        </div>
                        <div class="divBook" book="Time Squared" onclick="showBook(2)">
                            <img class="bookImage" src="Images/TimeSquared.jpg" />
                        </div>
                        <div class="divBook" book="Ready; Fire; Aim" onclick="showBook(3)'">
                            <img class="bookImage" src="Images/ReadyFireAim.jpg" />
                        </div>
                    </div>
                    <div class="divLibrayPages" id="divBooksRead">Books I have Read</div>
                    <div class="divLibrayPages" id="divBooksIOwn">Book I Own</div>
                `);
            break;
        case "Apps":
            document.title = "apps : CurtisRhodes.com";
            $('#middleColumn').html(`<div class='landingPageHeader'>Apps</div>`);
            break;
        case "IntelDesign":
            document.title = "Intelligent Design Software";
            changeFavoriteIcon("intelDesign");
            $('#divSiteLogo').attr("src", "Images/intel01.jpg");
            $("#bannerTitle").html("Intelligent Design Software");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Carosuel\")'>The Brucheum</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelBlogPost(3)'>About Me</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelArticles(0)'>Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayMyResume()'>My Resume</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelArticles(2)'>Programming for Girls</div>\n
                <div class='menuTab floatLeft' onclick='displaySkillsCloud()'>My Skills</div>`
            );
            intelDesignHtml();
            break;
        case "GetaGig":
            $('#divSiteLogo').attr("src", "Images/GetaJob.png")
            document.title = "CurtisRhodes.com";
            changeFavoriteIcon("getaJob");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayNewJobSearch()'>New Job Search</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Carosuel\")'>Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Apps\")'>Apps</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n`
            );
            displayGetaGig();
            break;
        default:
    }
}

function headerHtml() {
    return "<div class='siteLogoContainer'>" +
        "       <img id='divSiteLogo' class='bannerImage' title='home' src='Images/house.gif' onclick='javascript:displayCustomPage(\"Carosuel\")' />" +
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
        "       <div id='headerBottomRow'>\n" +
        //"           <div class='bottomRowSection1'>\n" +
        "               <div id='headerMessage' class='bottomLeftHeaderArea'></div>\n" +
        "               <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "               <div id='badgesContainer' class='badgesSection'></div>\n" +
        "               <div id='hdrBtmRowSec3' class='hdrBtmRowOverflow'></div>\n" +
        //"           </div>\n" +
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

function loadHeader() {
    $('header').html(headerHtml());
}
