function setOggleHeader(subdomain) {
    var headerHtml;
    var lang = "en";
    var subheaderContent;
    var bannerImageLink = "/Images/redballon.png";

    if (subdomain === "boobs" || subdomain === "archive") {
        if (lang === "en") {
            subheaderContent =
                "                <a href='/album.html?folder=2'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
                "                <a href='/album.html?folder=136'> poses,</a>\n" +
                "                <a href='/album.html?folder=159'> topic,</a>\n" +
                "                <a href='/album.html?folder=199'> shapes</a> and\n" +
                "                <a href='/album.html?folder=241'>sizes</a>\n";
        }
        if (lang === "DE") {
            subheaderContent =
                "                <a href='/album.html?folder=2'><span class='bigTits'>STORE </span>bryster</a> organiseret af\n" +
                "                <a href='/album.html?folder=136'> rejser,</a>\n" +
                "                <a href='/album.html?folder=159'> emne,</a>\n" +
                "                <a href='/album.html?folder=199'> figurer</a> og\n" +
                "                <a href='/album.html?folder=241'>størrelser</a>\n";
        }

        bannerImageLink = "<a href='/'><img src='/Images/redballon.png' title='home. Find lots of cool things here.' class='bannerImage' /></a>\n";
    }
    if (subdomain === "playboy" || subdomain === "playmates") {
        subheaderContent =
            "                <a href='/album.html?folder=2'><span class='everyCenterfold'>Every Playboy Centerfold</span></a>\n" +
            "                <a href='/album.html?folder=136'> poses,</a>\n" +
            "                <a href='/album.html?folder=159'> topic,</a>\n" +
            "                <a href='/album.html?folder=199'> shapes</a> and\n" +
            "                <a href='/album.html?folder=241'>sizes</a>\n";

        bannerImageLink = "<a href='/'><img src='/Images/playboyBallon.png' title='home. Find lots of cool things here.' class='bannerImage' /></a>\n";




    }
    if (subdomain === "admin") {
        subheaderContent = "Admin";
        bannerImageLink = "<a href='/'><img src='/Images/redballon.png' title='home. Find lots of cool things here.' class='bannerImage' /></a>\n";
    }
    if (subdomain === "porn" || subdomain === "sluts") {
        $('body').addClass('pornBodyColors');
        subheaderContent =
            "               <a href='/album.html?folder=243'>cock suckers</a>, \n" +
            "               <a href='/album.html?folder=420'>boob suckers</a>, \n" +
            "               <a href='/album.html?folder=357'>cum shots</a>, \n" +
            "               <a href='/album.html?folder=397'>kinky</a> and \n" +
            "               <a href='/album.html?folder=411'>naughty behaviour</a>\n";

        bannerImageLink = "<a href='/Index.html?subdomain=porn'><img src='/Images/cslips02.png' title='porn home.' class='bannerImage' /></a>\n";
    }

    headerHtml =
        "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" + bannerImageLink + "</div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div id='' class='headerTopRow'>\n" +
        "           <div id='bannerTitle' class='headerTitle'>OggleBooble</div>\n" +
        "           <div id='headerSubTitle' class='headerSubTitle'>\n" + subheaderContent + "</div>\n" +
        "           <div id='rankerTag' class='boobRankerBanner'>\n" +
        "               <a href='/Ranker.html' title='check out a masterpiece of web design. Spin through the links to land on random portrait images. ' >Boobs Ranker</a>" +
        "           </div>\n" +
        "           <div class='OggleSearchBox'>\n" +
        "               <span id='notUserName'>search</span> <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
        "               <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='headerBottomRow'>\n" +
        "           <div id='headerMessage' class='bottomLeftBottomHeaderArea'></div>\n" +
        "           <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "           <div class='menuTabs replaceableMenuItems'>\n" +
        "               <div id='freeonesLink' class='menuTabs displayHidden'>\n" +
        "                   <a href='http://www.freeones.com' target='_blank'><img src='/Images/freeones.png' class='freeones'></a>" +
        "               </div>\n" +
        "               <div id='babapediaLink' class='menuTabs displayHidden'>\n" +
        "                   <a href='https://www.babepedia.com' target='_blank'><img src='/Images/babepedia.png' class='freeones'></a>" +
        "               </div>\n" +
        "           </div>\n" +
        "           <div class='loginArea'>\n" +
        "               <div id='optionLoggedIn' class='displayHidden'>\n" +
        "                   <div class='menuTab adminLevelRequired displayHidden'><a href='/Dashboard.html'>Dashboard</a></div>\n" +
        "                   <div class='menuTab'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "                   <div class='menuTab' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "               </div>\n" +
        "               <div id='optionNotLoggedIn'>\n" +
        "                   <div id='btnLayoutRegister' class='menuTab'><a href='javascript:onRegisterClick()'>Register</a></div>\n" +
        "                   <div id='btnLayoutLogin' class='menuTab'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n"; 

    $('header').html(headerHtml);
}
var busy = false;
var searchString = "";

function oggleSearchKeyDown(event) {
    var ev = event.keyCode;
    $('#testtxt').text(ev);
    if (ev === 27) {
        clearSearch();
        return;
    }
    if (ev === 8) {
        searchString = searchString.substring(0, searchString.length - 1);
        $('#testtxt').text(searchString);
    }
    else {
        searchString += String.fromCharCode(ev);
    }
    if (searchString.length > 2) {
        if (!busy) {
            busy = true;
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/OggleSearch/GetSearchResults?searchString=" + searchString,
                success: function (SearchResultsModel) {
                    var kluge = "<ul>";
                    $.each(SearchResultsModel.SearchResults, function (idx, searchResult) {
                       kluge += "<li onclick='jumpToSelected(" + searchResult.FolderId + ")'>" + searchResult.FolderName + "</li>";
                    });
                    kluge += "</ul>";
                    $('#searchResultsDiv').show().html(kluge);
                    $('.loginArea').hide();
                    busy = false;
                },
                error: function (xhr) {
                    alert("createNewFolder xhr error: " + getXHRErrorDetails(xhr));
                }
            });
        }
    }
}

function clearSearch() {
    $('#searchResultsDiv').hide().html("");
    $('.loginArea').show();
    searchString = "";
    $('#txtSearch').val("");
    $('#testtxt').text("");
}

function jumpToSelected(folderId) {
    //alert("open(album.html?folder=" + folderId);
    window.open("/album.html?folder=" + folderId, "_blank");
    clearSearch();
}
