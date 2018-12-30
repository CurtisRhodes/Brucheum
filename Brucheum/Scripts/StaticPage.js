function saveAsStaticFile(thisArticle) {
    var strWebPage = "<!DOCTYPE html>";
    strWebPage += "<html>";
    strWebPage += staticPageMetaHead(thisArticle);
    strWebPage += "<body>";
    strWebPage += staticLayoutHeader(thisArticle);
    strWebPage += staticPageBody(thisArticle);
    strWebPage += "</body>";
    strWebPage += "</html>";

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

    var mtags = "";
    $.each(thisArticle.Tags, function (idx, tag) {
        mtags += tag.TagName + ", ";
    });

    return `
    <head>
    <title>` + beautify(thisArticle.Title) + `</title>
    <link href='/Styles/default.css' rel="stylesheet" />
    <link href='/Styles/fixedHeader.css' rel="stylesheet" />
    <link href='/Styles/articleView.css' rel="stylesheet" />
    <link href="/Styles/footer.css" rel="stylesheet" />
    <script src='/Scripts/GlobalFunctions.js'></script>
    <script src="/Scripts/3rd Party/jquery.min.js"></script>
    <script src='/Scripts/ResizeThreeColumnPage.js'></script>
    <meta name="Title" content="` + thisArticle.Title + `" property="og:title" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://api.curtisrhodes.com/app_data/images/` + thisArticle.ImageName + `" />
    <meta property="og:url" content="https://Curtisrhodes.com/static_pages/` + thisArticle.Title.replace(/ /g, "_") + `.html" />
    <meta name="Keywords" content="`+ mtags + ` /">;
    <meta property="og:description" content="Article written by an old fat guy no one should listen to" />
    </head>`;

    //<meta property="og:description" content="` + thisArticle.Summary.substr(0, 222).replace(/'/g, "''") + `" >


}

function staticLayoutHeader(thisArticle) {
    return `
    <div class='standardHeader' id='bheader'>
        <div class='bannerImageContainer' id='divTopLeftLogo'>
            <a href='/Home/Index'><img class='bannerImage' src='../images/house.gif'></a>
        </div>
        <div class='headerBodyContainer'>
            <div class='headerTitle' id='bannerTitle'>
                The Brucheum
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
            js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.2&appId=264735744158135&autoLogAppEvents=1';
            fjs.parentNode.insertBefore(js, fjs);
          }(document, 'script', 'facebook-jssdk'));</script>
        <div id='leftColumn'>
            <div class="fb-share-button staticFaceBookButton" data-href="/static_pages/` + thisArticle.Title.replace(/ /g, "_") + `.html" data-layout="button" data-size="small" 
              data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fcurtisrhodes.com%2F&amp;src=sdkpreparse" 
              class="fb-xfbml-parse-ignore">Share</a></div>
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
        </div>`+ staticFooter() + `
        <div id='rightColumn'></div>
    </div>`;
}

function staticFooter() {
    return `
    <footer>
        <div class="flexContainer">
            <div class="footerCol">
                <div><a href="~/Home/Index">Articles</a></div>
                <div><a href="~/Book/MyBooks">Books</a></div>
                <div><a href="~/IntelDsgn/Index">Professional</a></div>
                <div><a href="#">Apps</a></div>
            </div>
            <div class="footerCol">
                <div><a href="#">About us</a></div>
                <div><a href="mailto:curtishrhodes@hotmail.com">Love Letters</a></div>
                <div><a href="mailto:curtis,rhodes@gmail.com">Death Threats</a></div>
                <div><a href="#">Archive</a></div>
            </div>
            <div class="footerCol">
                <div><a href="#">Site Map</a></div>
                <div><a href="#">Search</a></div>
                <div><a href="#">Research</a></div>
                <div><a href="#">Advertize</a></div>
            </div>
        </div>
        <div class="footerFooter">
            <div id="footerMessage"></div>
            <div id="copyright">&copy; 2019 <a href="/IntelDsgn/Index">Intelligent Design SoftWare</a></div>
        </div>
    </footer>`;
}

