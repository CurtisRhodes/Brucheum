//var isArticeEditor = '@User.IsInRole("Article Editor")';
let page = 1;
let articlePageLimit = 5;
let articleCount;
let showMore = false;
let thisfilterType = "Latest Articles";

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

function getArticleList(filterType, filter) {
    try {
        $('#divlistHeader').html(filterType);

        if (showMore === false)
            $('#articleList').html('');
        else
            page += articlePageLimit;

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
                            var articleHref = "Article.html?ArticleViewId=" + article.Id;
                            $('#articleListContainer').append("<div class='articleListItem'>\n" +
                                "<div id='divImg'><a href=" + articleHref + "><img src=https://" + article.ImageName + "></a></div>\n" +
                                "<div class='articleDetail'>\n" +
                                "<div class='articleTopRow'>\n" +
                                "<div class='articleRowItemLeft'><a href=Article.html?ArticleList=Category&filter=" + article.CategoryLabel +
                                "&filterType=Category&filter=" + article.CategoryRef + ">" + article.Category + "</a></div>\n" +
                                "<div class='articleRowItemCenter'><a href=" + articleHref + ">" + article.Title + "</a></div>\n" +
                                "<div class='articleRowItemRight'>" + article.Updated + "</div>\n" +
                                "</div>\n" +  // top row
                                "<a href=" + articleHref + "><div class='articleSummary'>" + article.Summary + "</div></a>\n" +
                                "<div class='articleBottomRow'>\n" +
                                "<div class='articleRowItemLeft'> By: <a href=Article.html?ArticleList=Byline&filter=" + article.ByLineLabel +
                                "&filterType=Byline&filter=" + article.ByLineRef + ">" + article.ByLine + "</a></div>\n" +
                                "<div class='articleRowItemRight'><a href=Article.html?ArticleEditId=" + article.Id + ">edit</a></div>\n" +
                                "</div>\n" +  // bottom row
                                "</div>\n" +  // article detail
                                "</div>"  // article listItem
                            );
                            articleCount++;
                        } catch (e) {
                            alert("formatArticleJog error: " + e);
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
            //error: function (xmlhttprequest, textstatus, message) {
            //    $('#loadingGif').hide();
            //    if (textstatus === "timeout") {
            //        displayStatusMessage("error", "Server Timeout");
            //        alert("Sorry. Server timeout. \n This webside is down.     ");
            //    }
            //    else {
            //        displayStatusMessage("error", "status: " + textstatus + "   text: [" + textstatus + "]   error: " + message);
            //        alert("getArticleList ERROR: [" + xmlhttprequest.status + "]  textstatus: [" + xmlhttprequest.textstatus + "]   message: " + message);
            //    }
            //}
        });
    }
    catch (e) {
        $('#loadingGif').hide();
        displayStatusMessage("error", "tERROR" + e);
        alert("getArticleList catch: " + e);
    }
}

function formatArticleJog(article) {
    try {
        var webService = "https://api.curtisrhodes.com";
        var imgSrc = webService + "/App_Data/Images/" + article.ImageName;
        var articleHref = "Article.html?ArticleViewId=" + article.Id;
        $('#articleListContainer').append("<div class='articleListItem'>\n" +
            "<div id='divImg'><a href=" + articleHref + "><img src=" + imgSrc + "></a></div>\n" +
            "<div class='articleDetail'>\n" +
            "<div class='articleTopRow'>\n" +
            "<div class='articleRowItemLeft'><a href=Article.html?ArticleList=Category&filter=" + article.CategoryLabel +
            "&filterType=Category&filter=" + article.CategoryRef + ">" + article.CategoryLabel + "</a></div>\n" +
            "<div class='articleRowItemCenter'><a href=" + articleHref + ">" + article.Title + "</a></div>\n" +
            "<div class='articleRowItemRight'>" + article.LastUpdated + "</div>\n" +
            "</div>\n" +  // top row
            "<a href=" + articleHref + "><div class='articleSummary'>" + article.Summary + "</div></a>\n" +
            "<div class='articleBottomRow'>\n" +
            "<div class='articleRowItemLeft'> By: <a href=Article.html?ArticleList=Byline&filter=" + article.ByLineLabel +
            "&filterType=Byline&filter=" + article.ByLineRef + ">" + article.ByLineLabel + "</a></div>\n" +
            "<div class='articleRowItemRight'><a href=Article.html?ArticleEditId=" + article.Id + ">edit</a></div>\n" +
            "</div>\n" +  // bottom row
            "</div>\n" +  // article detail
            "</div>"  // article listItem
        );
        articleCount++;
    } catch (e) {
        alert("formatArticleJog error: " + e);
    }
}

function showMoreButtonClick() {
    page++;
    showMore = true;
    getArticleList();
}
