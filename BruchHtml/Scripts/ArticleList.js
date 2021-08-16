//var isArticeEditor = '@User.IsInRole("Article Editor")';
let articleTake = 5;
let articleStart = 0;
let thisFilterType = "Latest", thisFilter = "all";
let imageRepository = "img.OGGLEBOOBLE.COM/jogs/";

function displayArticleList(listMode) {
    resetSpaPage();
    switch (listMode) {
        case 0:
            thisFilterType = "Latest";
            thisFilter = "all";
            document.title = "articles : Brucheum";
            $("#headerSubTitle").html("lastest articles");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='newArticle()'>New Article</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Books\")'>Books</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Intelligent Design\")'>Intelligent Design</div>\n
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Get a Gig\")'>Get a Gig</div>\n`
            );
            break;
        case 1:
            thisFilterType = "Category";
            thisFilter = "COM";
            document.title = "articles : Intel Design";
            $("#headerSubTitle").html("lastest computer articles");
            $("#breadcrumbContainer").html(`
                <div class='menuTab floatLeft' onclick='displayCustomPage(\"Carosuel\")'>The Brucheum</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelBlogPost(3)'>About Me</div>\n
                <div class='menuTab floatLeft' onclick='displayMyResume()'>My Resume</div>\n
                <div class='menuTab floatLeft' onclick='displayIntelArticles(2)'>Programming for Girls</div>\n
                <div class='menuTab floatLeft' onclick='displaySkillsCloud()'>My Skills</div>`
            );
            break;
        default:
    }
    $('#middleColumn').html(`
        <div id="divArticleList">
            <div id="divlistHeader" class="articleListHeader"></div>
            <div id="articleListContainer" class="articleListContainer"></div>
            <div id="divMoreButton" class="roundendButton" onclick="getMoreArticles()">More</div>
        </div>`
    );
    $('#divMoreButton').show();
    articleStart = 0;
    getMoreArticles();
}

function displayArticleListItemStyle1(article) {
    try {
        $('#articleListContainer').append(`
            <div class='articleListItem'>\n
                <div id='divImg'><a href='javascript:viewArticle("` + article.Id + `")'><img src=https://` + imageRepository + article.ImageName + `></a></div>\n
                <div class='articleDetail'>\n
                    <div class='articleTopRow'>\n
                        <div class='articleRowItemLeft'><a href='javascript:getArticleList("Category","` + article.CategoryRef + `")'>` + article.Category + `</a></div>\n
                        <div class='articleRowItemCenter'><a href='javascript:viewArticle("` + article.Id + `")'>` + article.Title + `</a></div>\n
                        <div class='articleRowItemRight'>` + article.LastUpdated + `</div>\n
                    </div>\n
                    <a href='javascript:viewArticle("` + article.Id + `")'><div class='articleSummary'>` + article.Summary + `</div></a>\n
                    <div class='articleBottomRow'>\n
                        <div class='articleRowItemLeft'> By: <a href='javascript:getArticleList("Byline","` + article.ByLineRef + `")'>` + article.ByLine + `</a></div>\n
                        <div class='articleRowItemRight'><a href='javascript:editArticle("` + article.Id + `")'>edit</a></div>\n 
                    </div>\n 
                </div>\n 
            </div>`
        );
    } catch (e) {
        $('#articleListContainer').append("<div>" + e + "  " + article.Title+ "</div>");
    }
}

function viewArticle(articleId) {
    console.log("log event viewArticle: " + articleId);
    //window.location.href = "index?viewArticle=" + articleId;
    displayViewArticle(articleId);
}

function getMoreArticles() {
    try {
        $('#loadingGif').show();
        $.ajax({
            url: settingsArray.ApiServer + "/api/Article/GetArticleList?start=" + articleStart + "&take=" + articleTake +
                "&filterType=" + thisFilterType + "&filter=" + thisFilter,
            type: "get",
            success: function (articles) {
                $('#loadingGif').hide();
                if (articles.Success == "ok") {
                    $.each(articles.ArticleList, function (idx, article) {
                        displayArticleListItemStyle1(article)
                    });
                    articleStart += articleTake;
                    $("#headerSubTitle").html("lastest articles " + articleStart);
                    if (articles.ArticleList.length < articleTake)
                        $('#divMoreButton').html("looks like you reached the end " + articles.ArticleList.length);
                }
                else
                    alert("getArticleList: " + articles.Success);
            },
            error: function (jqXHR, exception) {
                alert("getArticleList jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
    catch (e) {
        $('#loadingGif').hide();
        displayStatusMessage("error", "tERROR" + e);
        alert("getArticleList catch: " + e);
    }
}

function displaySortFilterHeader(refCode) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/D",
        success: function (refDescription) {
            $('#divlistHeader').html(refDescription);
        },
        error: function (jqXHR, exception) {
            alert("getArticleList jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

