//var isArticeEditor = '@User.IsInRole("Article Editor")';
let page = 1;
let articlePageLimit = 5;
let articleCount;
let showMore = false;
let thisFilterType, thisFilter;

function getListHeader(refCode) {
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
    getArticleList("Latest", "all");
}

function getArticleList(filterType, filter) {
    try {
        if (showMore === false) {
            $('#articleList').html('');
            thisFilterType = filterType;
            thisFilter = filter;
        }
        else {
            page += articlePageLimit;
        }

        $('#loadingGif').show();
        $.ajax({
            url: settingsArray.ApiServer + "/api/Article/GetArticleList?pageLen=" + articlePageLimit + "&page=" + page +
                "&filterType=" + filterType + "&filter=" + filter,
            type: "get",
            success: function (articles) {
                if (articles.Success == "ok") {
                    articleCount = 0;
                    $.each(articles.ArticleList, function (idx, article) {
                        try {
                            //var imgSrc = webService + "/App_Data/Images/" + article.ImageName;
                            //var articleHref = "Article.html?ArticleViewId=" + article.Id;
                            $('#articleListContainer').append("<div class='articleListItem'>\n" +
                                "<div id='divImg'><a href='javascript:viewArticle(\"" + article.Id + "\")'><img src=https://" + article.ImageName + "></a></div>\n" +
                                "<div class='articleDetail'>\n" +
                                "<div class='articleTopRow'>\n" +
                                "<div class='articleRowItemLeft'><a href='javascript:getArticleList(\"Category\",\"" + article.CategoryRef + "\)'>" + article.Category + "</a></div>\n" +
                                "<div class='articleRowItemCenter'><a href='javascript:viewArticle(\"" + article.Id + "\")'>" + article.Title + "</a></div>\n" +
                                "<div class='articleRowItemRight'>" + article.Updated + "</div>\n" +
                                "</div>\n" +  // top row
                                "<a href='javascript:viewArticle(\"" + article.Id + "\")'><div class='articleSummary'>" + article.Summary + "</div></a>\n" +
                                "<div class='articleBottomRow'>\n" +
                                "<div class='articleRowItemLeft'> By: <a href='javascript:getArticleList(\"Byline\",\"" + article.ByLineRef + ")'>" +article.ByLine + "</a></div>\n" +
                                "<div class='articleRowItemRight'><a href='javascript:editArticle(\""+ article.Id +"\")'>edit</a></div>\n" +
                                "</div>\n" +  // bottom row
                                "</div>\n" +  // article detail
                                "</div>"  // article listItem
                            );
                            articleCount++;
                        } catch (e) {
                            alert("get Article List error: " + e);
                        }
                    });
                    $('#loadingGif').hide();
                    if (articleCount < articlePageLimit)
                        $('#divMoreButton').hide();
                    else
                        $('#divMoreButton').show();

                    $('#hrefAddNew').show();
                    $('#divBookPannel').show();

                    //if (showMore) {
                    //    //var mch = $('#middleColumn').height();
                    //}

                    $('#articleListContainer').css('height', parseInt($('#middleColumn').css('height')) - 100);
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
    getArticleList(thisFilterType, thisFilter);
}

