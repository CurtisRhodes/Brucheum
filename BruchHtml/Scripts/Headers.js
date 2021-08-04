function displayCustomPage(pageName) {
    $('#divSiteLogo').html(`<img title='home' class='bannerImage' src='Images/house.gif' onclick='javascript:displayCustomPage(\"Carosuel\")'/>`);
    $('#tanBlue').hide();
    $("#bannerTitle").html("The Brucheum");
    $("#headerSubTitle").html("");
    switch (pageName) {
        case "Carosuel":
            $('#bruchCaveImage').show();
            $('#tanBlue').show();
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
            $("#headerSubTitle").html("lastest articles");
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
            $("#headerSubTitle").html("new article");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Latest Articles\")'>Latest Articles</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Get a Gig\")'>Get a Gig</div>\n`
            );
            newArticle();
            break;
        case "Books":
            $("#headerSubTitle").html("My Books");
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
            $('#middleColumn').html(`<div class='landingPageHeader'>Apps</div>`);
            break;
        case "Intelligent Design":
            $("#bannerTitle").html("Intelligent Design Software");
            $('#divSiteLogo').html(`<img title='home' class='bannerImage' src='Images/intel01.jpg' onclick='javascript:displayCustomPage(\"Carosuel\")'/>`);
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"About Me\")'>About Me</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"My Resume\")'>My Resume</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Skills Cloud\")'>My Skills</div>`
            );
            $('#middleColumn').html(`
                <div class="intelDsgnBackground">
                    <div id="divWelcomeMessage" class="welcomeMessage">
                        <div class="algerian">Welcome to Intelligent Design Software</div>
                        <p>This web site demonstrates the work of an experienced if socially autistic web applications developer</p>
                        <p>Check out the scection describing the <a href="~/IntelDsgn/Skills">skills used to build this site</a></p>
                        <p>Read some of my <a href="Blog?filter=2">articles on computer programming</a></p>
                        <p>Learn about <a href="?a=Our_Approach">our approach to application development</a></p>
                        <p>See <a href="~/IntelDsgn/MyResume">My resume</a> with over thirty years experience. (yes I am old)</p>
                        <p>If you might be interested in having me do some work for you</p>
                        <p>(remote only) (direct hire only) please <a href="?a=Contact_Us">contact me</a> </p>
                    </div>
                </div>`
            );
            break;
        case "Skills Cloud":
            $('#middleColumn').html(`
                <div class="intelDsgnBackground">
                    <h2>My Skills</h2>
                    <div id="skillsloadingGif" class="loadingGif"><img src="Images/loader.gif" /></div>
                    <div id="skillsCloud" class="wordCloudContainer"></div>
                    <div class="centeredDivShell">
                        <div id="skillDetails" class="centeredDivInner skillDialogPopupBox" onmouseout="$(this).fadeOut()" onclick="$(this).fadeOut()">
                            <div id="skillName" class="skillTitle"></div>
                            <div id="skillProficiency" class="skillProficiency"></div>
                            <div id="skillNarrative" class="skillNarrative"></div>
                        </div>
                    </div>
                </div>`
            );
            break;
        case "Get a Gig":
            $('#tanBlue').hide();
            $('#middleColumn').html(`<div class='landingPageHeader'>Get a Gig"</div>`);
            break;
        default:
    }
}

function headerHtml() {
    return "<div id='divSiteLogo' class='siteLogoContainer'" +
        "       <img title='home' class='bannerImage' src='Images/house.gif' onclick='javascript:displayCustomPage(\"Carosuel\")' />" +
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