﻿//var settingsArray.ApiServer = '@ViewBag.Service';
//var articleId = '@ViewBag.ArticleId';
//var userId = '@ViewBag.UserId';
//var userName = '@ViewBag.UserName';
//var filePath = '@ViewBag.FilePath';
//var ipAddress = '@ViewBag.IpAddress';
var thisArticleId;
var hitSession = "";

function loadArticle(articleId) {
    thisArticleId = articleId;
    $('#lnkPermalink').hide();
    $('#lnkFacebook').hide();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/DbArticle?articleId=" + articleId,
            //dataType: "json",
            success: function (article) {
                if (article.Success === "ok") {
                    thisArticle = article;
                    $('#divImage').attr("src", "https://api.curtisrhodes.com" + "/App_Data/Images/" + article.ImageName);
                    $('#divCategory').html(thisArticle.CategoryLabel);
                    $('#divTitle').html(thisArticle.Title);
                    $('#divArticleDate').html(thisArticle.LastUpdated);
                    $('#divSummary').html(thisArticle.Summary);
                    $('#divByline').html("by " + thisArticle.ByLineLabel);
                    $('#divContent').html(thisArticle.Contents);

                    //hitSession = logPageHit(settingsArray.ApiServer, userName, ipAddress, "ViewArticle", article.Title);

                    //var emailSubject = "CONGRATULATIONS: " + loginVM.UserName + " just logged onto The Brucheum";
                    //sendEmail(emailSubject, "someday it will be someone other than you");

                    //stickCommentsButton();
                    var mch = $('#middleColumn').height();
                    $('#middleColumn').height(mch + $('#contentArea').height());
                    var mch2 = $('#middleColumn').height();

                    //var hdr = $('.Header').height();
                    //var cch = $('#divCommentsBody').height()
                    $('.threeColumnLayout').height(mch2);
                    resizePage();
                }
                else
                    alert("loadDBArticle: " + article.Success);
            },
            error: function (jqXHR, exception) {
                alert("loadArticle jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("load article catch: " + e);
    }
}

function staticify() {
    saveAsStaticFile(thisArticle);
}
function goToPermaLink() {
    window.location.href = "/static_pages/" + beautify(thisArticle.Title).replace(/ /g, "_") + ".html", "target='_blank'";
};
$('#divCommentsButton').click(function () {
    if ($('#divCommentsSection').css("display") === "none") {
        $('#divCommentsSection').show();
        getComments();
    }
    else {
        $('#divCommentsSection').hide();
    }
});


$(window).unload(function () {
    // log page visit End
    if (hitSession !== "") {
        logPageVisitEnd(hitSession);
    }
    alert("page move");
});
function gotoArticleEdit() {
    //alert("thisArticle.Id: " + thisArticleId);
    window.location.href = "Article.html?ArticleEditId=" + thisArticleId;
}

///////////////////////////////////////////////////

function saveAsStaticFile2() {
    $('head').append('<meta name="Title" content="' + thisArticle.Title + '" property="og:title"/>');
    //$('head').append('<meta property="og:description" content="' + beautify(summary.substr(0, 300)) + '" />');
    $('head').append('<meta name="Keywords" content="' + articleTagString + '/>');
    $('head').append('<meta property="og:type" content="website"/>');
    $('head').append("<meta property='og:image' content='https://api.curtisrhodes.com/app_data/images/" + articleImageName + "'/>");
    var pageName = "https://Curtisrhodes.com/static_pages/" + thisArticle.Title.replace(/ /g, "_") + ".html";
    $('head').append('<br/><meta property="og:url" content="' + pageName + '"/>');
    //var html = $('html').html();
    var data = new Object();
    data.html = "<!DOCTYPE html>" + $('html').html();
    $.ajax({
        type: "POST",
        url: "CreateStaticFile",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
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
function saveAsStaticFile00() {
    ////alert("thisArticle.Title: " + thisArticle.Title);
    //var underscorePageName = beautify(thisArticle.Title).replace(/ /g, "_") + ".html";
    //var strWebPage = "<!DOCTYPE html>";

    //strWebPage += "<body>";
    //strWebPage += staticHeader();
    //strWebPage += $('bheader').html();
    //strWebPage += "<div class='threeColumnArray'>";
    //strWebPage += "<div id='leftColumn'>";
    //strWebPage += "<div id='lnkFacebook' class='fb-share-button' data-href='https://Curtisrhodes.com/static_pages/"  + underscorePageName + "' data-layout='button' data-size='large' data-mobile-iframe='false'>";
    //strWebPage += "<a target='_blank' href='https://www.facebook.com/sharer/sharer.php?u=" + underscorePageName + "&src=sdkpreparse'>Share on Facebook</a>";
    //strWebPage += "</div>"; 
    //strWebPage += "<div id='middleColumn'>";

    //strWebPage += "<div id='pollybox'><div id='divTopLine'><div class='floatLeft'>" + thisArticle.LastUpdated +"</div>";
    //strWebPage += "<div class='floatRightDiv'>" + thisArticle.CategoryLabel + "</div></div>";
    //strWebPage += "<div class='articleTitle'>" + thisArticle.Title + "</div>";
    //strWebPage += "<div class='flexContainer'><div class='byline'>" + thisArticle.ByLineLabel +"</div></div></div>";
    //strWebPage += "<div id='contentArea'><div class='articleImageContainer'>";
    //strWebPage += "<img class='articleViewImage' src=https://api.curtisrhodes.com/app_data/images/" + thisArticle.ImageName + "'/></div>";
    //strWebPage += "<div class='summaryText'>" + thisArticle.Summary + "</div>";
    //strWebPage += "<div class='articleContent'>" + beautify(thisArticle.Contents) + "</div></div>";
    //strWebPage += "<div id='rightColumn'></div>";
    //strWebPage += "</body>";

    ////    <div id="divCommentsButton" class="roundendButton">comments</div>
    ////strWebPage += "<div class='Footer' id='footer'></div>";
    ////strWebPage += $('#footer').html();

    //var myObj = new Object();
    //myObj.html = strWebPage;
    //myObj.filename = underscorePageName;
    //try {
    //    $.ajax({
    //        type: "POST",
    //        url: "CreateStaticFile",
    //        data: JSON.stringify(myObj),
    //        dataType: "json",
    //        contentType: "application/json; charset=utf-8",
    //        success: function (success) {
    //            if (success === "ok") {
    //                $('#lnkPermalink').show();
    //                $('#lnkStaticify').hide();
    //            }
    //            else
    //                alert("/api//File returned: " + success);
    //        },
    //        error: function (jqXHR, exception) {
    //            alert("CreateStaticFile error: " + getXHRErrorDetails(jqXHR, exception));
    //        }
    //    });
    //}
    //catch (e) {
    //    alert("saveAsStaticFile catch: " + e);
    //}
}

$('#btnTest').click(function () {
    location.href = "/Home/get_image?w=" + article.ImageName;
});
$('#btnSpinnerTest').click(function () {
    $(this).append("<img src='/Images/loader.gif' class='tinyLoader'>");
});
$('#btnSpinnerTest').dblclick(function () {
    $(this).html("Add");
});
