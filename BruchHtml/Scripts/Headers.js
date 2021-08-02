function displayCustomPage(pageName) {
    switch (pageName) {
        case "Carosuel":
            $('#bruchCaveImage').show();
            $('#tanBlue').show();
            $("#bannerTitle").html("The Brucheum");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Latest Articles\")'>Latest Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Apps\")'>Apps</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Get a Gig\")'>Get a Gig</div>\n`
            );
            $('#middleColumn').html(`
                <div id="bruchCaveImage" class="caveImage">
                    <div id="customMessage" class="displayHidden customMessageContainer"></div>
                    <div id="divStatusMessage"></div>
                    <div id="dots" style="color:white"></div>
                    <div class="centeredDivShell">
                        <div class="centeredDivInner">
                            <div id="carosuelContainer" class="carosuelContainer">
                                <img id="leftFbutton" class="arrowButton" src="Images/blueCircleLeft.png" onclick="clickPrevious()" />
                                <img id="rightFbutton" class="arrowButton" src="Images/blueCircleRight.png" onclick="clickNext()" />
                                <div id='articleTitle' class='carouselLabel'></div>
                                <div id='articleCat' class='carouselLabel'></div>
                                <div class="carouselImageContainer">
                                    <img id="carouselImage" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
            );
            loadAndStartCarousel();
            break;
        case "Latest Articles":
            $("#bannerTitle").html("The Brucheum- lastest articles");
            $('#tanBlue').hide();
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"New Article\")'>New Article</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Get a Gig\")'>Get a Gig</div>\n`
            );
            $('#middleColumn').html(`
                <div id="divArticleList">
                    <div id="divlistHeader" class="articleListHeader"></div>
                    <div id="articleListContainer" class="articleListContainer"></div>
                    <div id="divMoreButton" class="roundendButton" onclick="showMoreButtonClick()">More</div>
                </div>`
            );
            getArticleList("Latest Articles", "all");
            break;
        case "New Article":
            $("#bannerTitle").html("The Brucheum- new article");
            $('#tanBlue').hide();
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Latest Articles\")'>Latest Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Get a Gig\")'>Get a Gig</div>\n`
            );
            newArticle();
            break;
        case "Books":
            $("#bannerTitle").html("The Brucheum- My Books");
            $('#tanBlue').hide();
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Latest Articles\")'>Latest Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Get a Gig\")'>Get a Gig</div>\n`
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
            $('#tanBlue').hide();
            $('#middleColumn').html(`<div class='landingPageHeader'>Apps</div>`);
            break;
        case "Intelligent Design":
            $('#tanBlue').hide();
            $('#middleColumn').html(`<div class='landingPageHeader'>Intelligent Design</div>`);
            break;
        case "Get a Gig":
            $('#tanBlue').hide();
            $('#middleColumn').html(`<div class='landingPageHeader'>Get a Gig"</div>`);
            break;
        default:
    }
}

function headerHtml() {
    return "<div class='siteLogoContainer' onclick='javascript:displayCustomPage(\"Carosuel\")'>" +
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

function loadHeader() {
    $('header').html(headerHtml());
}