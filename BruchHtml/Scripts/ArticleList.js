//var isArticeEditor = '@User.IsInRole("Article Editor")';
let articleTake = 5;
let articleCount;
let showMore = false;
let thisFilterType = "Latest", thisFilter = "all";

function displayArticleList() {
    resetCustomPage();
    document.title = "articles : Brucheum";
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
    getInitialArticleList();
}

function displayArticleListItemStyle1(article) {
    $('#articleListContainer').append(`
        <div class='articleListItem'>\n +
            <div id='divImg'><a href='javascript:viewArticle("` + article.Id + `")'><img src=https://` + article.ImageName + `></a></div>\n
            <div class='articleDetail'>\n
                <div class='articleTopRow'>\n
                    <div class='articleRowItemLeft'><a href='javascript:getArticleList("Category",` + article.CategoryRef + `)'>` + article.Category + `</a></div>\n
                    <div class='articleRowItemCenter'><a href='javascript:viewArticle("` + article.Id + `")'>` + article.Title + `</a></div>\n
                    <div class='articleRowItemRight'>` + article.Updated + `</div>\n
                </div>\n
                <a href='javascript:viewArticle("` + article.Id + `")'><div class='articleSummary'>` + article.Summary + `</div></a>\n
                <div class='articleBottomRow'>\n
                    <div class='articleRowItemLeft'> By: <a href='javascript:getArticleList("Byline","` + article.ByLineRef + `")'>` + article.ByLine + `</a></div>\n
                    <div class='articleRowItemRight'><a href='javascript:editArticle("` + article.Id + `")'>edit</a></div>\n 
                </div>\n 
            </div>\n 
        </div>`
    );
}

function getInitialArticleList() {
    $.ajax({
        url: settingsArray.ApiServer + "/api/Article/GetArticleList?start=0&take=" + articleTake + "&filterType=Latest&filter=all",
        type: "get",
        success: function (articles) {
            if (articles.Success == "ok") {
                $.each(articles.ArticleList, function (idx, article) {
                    displayArticleListItemStyle1(article)
                });
                articleCount = articleTake;
                $('#loadingGif').hide();
                $('#divMoreButton').show();
                $('#hrefAddNew').show();
                $('#divBookPannel').show();
                $('#articleListContainer').css('height', parseInt($('#middleColumn').css('height')) - 100);
            }
            else
                alert("get InitialArticleList: " + articles.Success);
        },
        error: function (jqXHR, exception) {
            alert("getArticleList jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

//getArticleList("Latest", "all");
function getMoreArticles(filterType, filter) {
    try {
        $('#loadingGif').show();
        $.ajax({
            url: settingsArray.ApiServer + "/api/Article/GetArticleList?start=" + articleCount + "& page=" + articleTake +
                "&filterType=" + filterType + "&filter=" + filter,
            type: "get",
            success: function (articles) {
                $('#loadingGif').hide();
                if (articles.Success == "ok") {
                    articleCount = 0;
                    $.each(articles.ArticleList, function (idx, article) {
                        displayArticleListItemStyle1(article)
                    });

                    if (articles.articleList.Count() < articleTake)
                        $('#divMoreButton').html("looks like you reached the end");
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

function showMoreButtonClick() {
    page++;
    showMore = true;
    getMoreArticles(thisFilterType, thisFilter);
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

