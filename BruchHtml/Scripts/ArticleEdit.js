var article = new Object();
var metaTagsStringArray = new Array();

function setUpEditPage() {
    getCategories();
    getAvatars();
    $('#articleSummaryEditor').summernote({
        height: 150,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
        ]
    });
    $('#articleContentEditor').summernote({
        height: 400,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']],
            ['style', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['strikethrough', 'superscript', 'subscript']],
            ['insert', ['picture', 'link', 'video', 'table', 'hr']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']]
        ]
    });
}

function getArticle(articleId) {
    article.Id = articleId;
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Article?articleId=" + articleId,
        success: function (response) {
            if (response.Success === "ok") {
                bind(response);
                article.ImageName = response.ImageName;
                $('#btnSave').text("Update");
                //setTimeout(function () { adjust() }, 1000);
            }
            else
                alert("getArticle: " + response.Success);
        },
        error: function (jqXHR, exception) {
            alert("getArticle jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function bind(response) {
    try {

        $('#txtTitle').val(response.Title);
        $('#ddCategory').val(response.CategoryRef);
        //alert("$('#ddCategory').val(): " + $('#ddCategory').val());
        //alert("BylineRef: " + response.ByLineRef)
        $('#ddAvatars').val(response.ByLineRef);
        $('#txtUpdated').val(response.LastUpdated);
        $('#articleSummaryEditor').summernote('code', response.Summary);
        $('#articleContentEditor').summernote('code', response.Contents);
        article.ImageName = response.ImageName;
        $('#imgArticleJog').attr("src", settingsArray.ImageArchive + response.ImageName);

        $.each(response.Tags, function (idx, tag) {
            if (tag.TagName !== null)
                $("#divTagContainer").append("<div class='tagItem' id=" + tag.Id + ">" + tag.TagName + "</div>");
        });
    } catch (e) {
        alert("bind(response): " + e);
    }
}

function unBind() {
    try {
        article.Title = $('#txtTitle').val();
        article.CategoryRef = $('#ddCategory').val();
        article.BylineRef = $('#ddAvatars').val();
        article.SubCategoryRef = 'AWC';
        article.LastUpdated = $('#txtUpdated').val();
        //article.Summary = beautify($('#articleSummaryEditor').summernote('code'));
        //article.Contents = beautify($('#articleContentEditor').summernote('code'));
        article.Summary = $('#articleSummaryEditor').summernote('code');
        article.Contents = $('#articleContentEditor').summernote('code');
        article.Tags = new Array;
        $('#divTagContainer>div').each(function () {
            var dbArticleTagModel = new Object();
            dbArticleTagModel.TagName = $(this).html();
            dbArticleTagModel.Id = $(this).attr("Id");
            //alert("dbArticleTagModel.Id: " + dbArticleTagModel.Id);
            article.Tags.push(dbArticleTagModel);
        });
    }
    catch (e) {
        alert("unBind: " + e);
    }
}

function addUpdateArticle() {
    $('#updateArticleSpinner').show();
    if ($('#btnSave').text() === "Save")
        postArticle();
    else
        updateArticle();
}

function saveAndView() {
    $('#updateArticleSpinner').show();
    if ($('#btnSave').text() === "Save")
        postArticle("View");
    else
        updateArticle("View");
}

function postArticle(view) {
    try {
        unBind();
        if (article.Title === "") {
            displayStatusMessage("severityWarning", "Title Required");
            return;
        }
        $.ajax({
            url: settingsArray.ApiServer + "/api/Article",
            type: "post",
            dataType: "Json",
            data: article,
            success: function (newArticleId) {
                if (!newArticleId.startsWith("ERROR")) {
                    if (view === "View")
                        window.location = "Article?Id=" + newArticleId;
                    article.Id = newArticleId;
                    $('#updateArticleSpinner').hide();
                    displayStatusMessage("ok", "Saved");
                    $('#btnSave').text("Update");
                }
                else
                    alert("postArticle: " + newArticleId);
            },
            error: function (jqXHR, exception) {
                alert("Post Article jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) { alert("catch ERROR: " + e); }
}

function updateArticle(view) {
    try {
        unBind();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/Article",
            //async: "false",
            //dataType: "json",
            data: article,
            success: function (success) {
                if (success === "ok")
                    if (view === "View")
                        window.location = "Article.html?ArticleViewId=" + article.Id;
                    else
                        displayStatusMessage("ok", "updated");
                else
                    displayStatusMessage("ok", "updateArticle: " + success);
                $('#updateArticleSpinner').hide();
            },
            error: function (jqXHR, exception) {
                alert("update Article jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        displayStatusMessage("error", "update Article CATCH error" + e);
    }
}

function getCategories() {
    $.ajax({
        url: settingsArray.ApiServer + "/api/Refs?refType=CAT",
        type: "get",
        dataType: "json",
        success: function (response) {
            $('#ddCategory').html("<option class= 'ddOption' value ='0'>-- select category --</option >");
            $.each(response, function (idx, obj) {
                //obj = obj.split(",");
                $('#ddCategory').append("<option class='ddOption' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
            });
        },
        error: function (jqXHR, exception) {
            alert("getCategories jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function getAvatars() {
    $.ajax({
        url: settingsArray.ApiServer + "/api/Refs?refType=AVT",
        type: "get",
        dataType: "json",
        success: function (response) {
            $('#ddAvatars').html("<option class= 'ddOption' value ='0'>-- select avatar --</option >");
            $.each(response, function (idx, obj) {
                //obj = obj.split(",");
                $('#ddAvatars').append("<option class='ddOption' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
            });
        },
        error: function (jqXHR, exception) {
            alert("getAvatars jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

$('#txtMetaTag').blur(function () {
    if ($('#txtMetaTag').val() !== "") {
        metaTagsStringArray.push($('#txtMetaTag').val());
        $('#divTagContainer').append("<div class='tagItem'>" + $('#txtMetaTag').val() + "</div>");
        $('#txtMetaTag').val("");
    }
});

function loadImage(imageFullFileName) {
    //article.ImageName = postImage($('#uplImage').val());
    //alert("article.ImageName: " + article.ImageName)
    //$('#imgArticleJog').attr("src", settingsArray.ApiServer + "/App_Data/Images/" + article.ImageName);
    //setTimeout(function () { adjust() }, 1000);
    alert("loadImage url: " + settingsArray.ApiServer + "api/Images/AddImage?imageFullFileName=" + imageFullFileName);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Images/AddImage?imageFullFileName=" + imageFullFileName,
        success: function (response) {
            if (response.Success === "ok") {
                bind(response);
                article.ImageName = response.ImageName;
                $('#btnSave').text("Update");
                //setTimeout(function () { adjust() }, 1000);
            }
            else
                alert("getArticle: " + response.Success);
        },
        error: function (jqXHR, exception) {
            alert("loadImage jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });



}

function adjust() {
    // percentage of container   var wPic = $('#imgArticleJog').width();
    // var wAcl = $('#divEditArticleContainer').width();
    //$('#divArticleRowContainer').width(wAcl - wPic);
    //var wAcr = $('#divArticleRowContainer').width();
    //var wlbl = $('#divEditArticleLabel').width() + 20;
    //$('#articleSummaryEditor').width(wAcr - wlbl);
    //$('#txtTitle').width(wAcr - wlbl);
}
