function saveAsStaticFile(thisArticle) {
    var strWebPage = "<!DOCTYPE html>";
    strWebPage += "<html>";
    strWebPage += staticPageMetaHead(thisArticle);
    strWebPage += "<body>";
    strWebPage += staticLayoutHeader(thisArticle);
    strWebPage += staticPageBody(thisArticle);
    //strWebPage += "</body>";
    strWebPage += "</html>";

    //    <div id="divCommentsButton" class="roundendButton">comments</div>
    //strWebPage += "<div class='Footer' id='footer'></div>";
    //strWebPage += $('#footer').html();

    var myObj = new Object();
    myObj.html = strWebPage;
    myObj.filename = beautify(thisArticle.Title).replace(/ /g, "_") + ".html";
    try {
        $.ajax({
            type: "POST",
            url: "CreateStaticFile",
            data: JSON.stringify(myObj),
            dataType: "json",
            contentType: "application/json; charset=utf-8",
            success: function (success) {
                if (success === "ok") {
                    $('#lnkPermalink').show();
                    $('#lnkStaticify').hide();
                }
                else
                    alert("/api//File returned: " + success);
            },
            error: function (jqXHR, exception) {
                alert("CreateStaticFile error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
    catch (e) {
        alert("saveAsStaticFile catch: " + e);
    }
}

function staticPageMetaHead(thisArticle) {
    return `
    <head>
        <title>` + beautify(thisArticle.Title) + `</title>
        <link href='/Styles/default.css' rel='stylesheet'>
        <link href='/Styles/fixedHeader.css' rel='stylesheet'>
        <link href='/Styles/articleView.css' rel='stylesheet'>
        <script src='/Scripts/GlobalFunctions.js'></script>
        <script src="/Scripts/3rd Party/jquery.min.js"></script>
        <script src='/Scripts/ResizeThreeColumnPage.js'></script>
        <meta name="Title" content="` + thisArticle.Title + `" property="og:title">
        <meta property="og:description" content="` + thisArticle.Summary.substr(0, 300).replace(/'/g, "''") + `">
        <meta name="Keywords" content="` + thisArticle.Tags + `">
        <meta property="og:type" content="website">
        <meta property="og:image" content="https://api.curtisrhodes.com/app_data/images/` + thisArticle.ImageName + `">
        <meta property="og:url" content="https://Curtisrhodes.com/static_pages/` + thisArticle.Title.replace(/ /g, "_") + `.html">
    </head>`;
}

function staticLayoutHeader(thisArticle) {
    return `
    <div class='standardHeader' id='bheader'>
        <div class='bannerImageContainer' id='divTopLeftLogo'>
            <a href='/Home/Index'><img class='bannerImage' src='../images/house.gif'></a>
        </div>
        <div class='headerBodyContainer'>
            <div class='headerTitle' id='bannerTitle'>
                Curtis Rhodes.com
            </div>
            <div class='menuTabContainer' id='menuContainer'>
                <div id='replaceableMenuItems'>
                    <div class='menuTab floatLeft'><a href='/Article/ArticleList'>Latest Articles</a></div>
                    <div class='menuTab floatLeft'><a href='/Article/ArticleList?filterLabel=Political Rants&amp;filterType=Category&amp;filter=POL'>Political Rants</a></div>
                    <div class='menuTab floatLeft'><a href='/Article/ArticleList?filterLabel=Conspiracy Theories&amp;filterType=Category&amp;filter=CON'>Conspiracy Theories</a></div>
                    <div class='menuTab floatLeft'><a href='/BookDb/Index'>Books</a></div>
                    <div class='menuTab floatLeft'><a href='/Home/Apps'>Apps</a></div>
                    <div class='menuTab floatLeft'><a href='/IntelDsgn/Index'>Intelligent Design</a></div>
                </div>
            </div>
        </div>
    </div>`;
}

function staticPageBody(thisArticle) {
    return `
    <div class='threeColumnArray'>
        <div id="fb-root"></div>
        <script>(function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) return;
            js = d.createElement(s); js.id = id;
            js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0";
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));</script>
        <div id='leftColumn'>
            <div class="fb-share-button staticFaceBookButton" data-href="https://Curtisrhodes.com/static_pages/"` + thisArticle.Title.replace(/ /g, "_") + `.html " data-layout="button_count"></div>
        </div>
        <div id='middleColumn'>
            <div class='pollybox30'>
                <div class='divTopLine'>
                    <div class='floatLeft'>` + thisArticle.LastUpdated + `</div>
                    <div class='floatRightDiv'>` + thisArticle.CategoryLabel + `</div>
                </div>
                <div class='articleTitle'>` + thisArticle.Title + `</div>
                <div class='flexContainer'><div class='byline'>` + thisArticle.ByLineLabel + `</div></div>
            </div>
            <div id='contentArea'><div class='articleImageContainer'>
                <img id="divImage" class="articleCenterImage" src=https://api.curtisrhodes.com/app_data/images/` + thisArticle.ImageName + ` />
            </div>
            <div class='summaryText'>` + thisArticle.Summary + `</div>
            <div class='articleContent'>` + thisArticle.Contents + `</div>
        </div>
        <div id='rightColumn'></div>
    </div>`;
}

//<div id='lnkFacebook' class="fb-share-button staticFaceBookButton" data-href="https://Curtisrhodes.com/static_pages/` + beautify(thisArticle.Title).replace(/ /g, " _") + `.html"
//  data - layout='button' data - size='large' data - mobile - iframe='false' >
//    <a target='_blank' href="https://www.facebook.com/sharer/sharer.php?u=` + thisArticle.Title + `&src=sdkpreparse">Share on Facebook</a>
//</div >
