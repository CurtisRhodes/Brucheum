var article = new Object();
var metaTagsStringArray = new Array();
let categoriesDDloaded = false, avitorsDDloaded = false;

function editArticle(articleId) {
    setUpEditPage();
    let dots = "";
    let ddWaiter = setInterval(function () {
        if (!categoriesDDloaded || !avitorsDDloaded) {
            dots += ". ";
            $('#dots').html(dots);
        }
        else {
            clearInterval(ddWaiter);
            getArticle(articleId);
        }
    }, 300);
}

function newArticle() {
    setUpEditPage();
    article.Id = create_UUID();
    document.title = "editing : CurtisRhodes.com";
    $("#headerSubTitle").html("new article");
    $('#dateEnteredRow').hide();
    $('#btnSave').text("Add New");
}

function editPageLeftColumnHtml() {
    $('#leftColumn').html(`
       <div id="articleViewLeftColumn" class="displayHidden">
            <div class="staticFileLinks">
                <div id="lnkStaticify" class="clickable" onclick="staticify()">staticify</div>
                <div id="lnkFacebook" class="fb-share-button" data-href="' + pageName + '" data-layout="button" data-size="large" data-mobile-iframe="false">
                    <a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=' + pageName + '&src=sdkpreparse">Share on Facebook</a>
                </div>
                <div id="lnkPermalink" class="clickable" onclick="goToPermaLink()">permalink</div>
            </div>
       </div>`
    );
}

function setUpEditPage() {
    showArticleEditorHtml();

    $('#imgArticleJog').css("height", $('#imgArticleJogContainer').height());

    resetSpaPage();
    
    $('#txtUpdated').datepicker();
    getCategories();
    getAvatars();
    $('#articleSummaryEditor').jqte();
    //$('#articleSummaryEditor').summernote({
    //    height: 50,
    //    codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
    //    toolbar: [
    //        ['codeview'],
    //        ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
    //    ]
    //});
    $('#articleContentEditor').jqte();
//    $('#articleContentEditor').summernote({
//        height: 385,
//        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
//        toolbar: [
//            ['codeview'],
//            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']],
//            ['style', ['bold', 'italic', 'underline', 'clear']],
//            ['font', ['strikethrough', 'superscript', 'subscript']],
//            ['insert', ['picture', 'link', 'video', 'table', 'hr']],
//            ['para', ['ul', 'ol', 'paragraph']],
//            ['height', ['height']]
//        ]
//    });
}

function getArticle(articleId) {
    article.Id = articleId;
    let url = settingsArray.ApiServer + "/api/Article/GetSingleArticle?articleId=" + articleId;
    $.ajax({
        type: "GET",
        url: url,
        success: function (articleModel) {
            if (articleModel.Success === "ok") {
                bind(articleModel.Article);
                document.title = articleModel.Article.Title + ": editing";
                $('#btnSave').text("Update");
                setTimeout(function () { adjust() }, 1000);
            }
            else
                alert("getArticle: " + articleModel.Success);
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
        $('#ddAvatars').val(response.ByLineRef);
        $('#txtCreated').val(response.Created.substring(0, 10));
        $('#txtUpdated').val(todayString());
        //$('#articleSummaryEditor').summernote('code', response.Summary);
        //$('#articleContentEditor').summernote('code', response.Contents);
        $("#articleSummaryEditor").jqteVal(response.Summary);
        $('#articleContentEditor').jqteVal(response.Content);
        $('#chosenImageName').text(response.ImageName);
        article.ImageName = response.ImageName;
        $('#imgArticleJog').attr("src", settingsArray.ImageArchive + response.ImageName);
    //    $.each(response.Tags, function (idx, tag) {
    //        if (tag.TagName !== null)
    //            $("#divTagContainer").append("<div class='tagItem' id=" + tag.Id + ">" + tag.TagName + "</div>");
    //    });
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
        article.Summary = $('#articleSummaryEditor').val();
        article.Content = $('#articleContentEditor').val();
    //    article.Tags = new Array;
    //    $('#divTagContainer>div').each(function () {
    //        var dbArticleTagModel = new Object();
    //        dbArticleTagModel.TagName = $(this).html();
    //        dbArticleTagModel.Id = $(this).attr("Id");
    //        //alert("dbArticleTagModel.Id: " + dbArticleTagModel.Id);
    //        article.Tags.push(dbArticleTagModel);
    //    });
    }
    catch (e) {
        alert("unBind: " + e);
    }
}

function addUpdateArticle() {
    if ($('#btnSave').text() === "Add New")
        postArticle();
    else
        updateArticle();
}

function saveAndView() {
    if ($('#btnSave').text() != "Add New")
        updateArticle();
    viewArticle(article.Id);
}

function postArticle(view) {
    try {
        unBind();
        if (article.Title === "") {
            displayStatusMessage("severityWarning", "Title Required");
            return;
        }
        $('#updateArticleSpinner').show();
        $.ajax({
            url: settingsArray.ApiServer + "/api/Article/AddNewArticle",
            type: "POST",
            data: article,
            success: function (successModel) {
                $('#updateArticleSpinner').hide();
                if (successModel.Success == "ok") {
                    article.Id = successModel.ReturnValue;
                    displayStatusMessage("ok", "Saved");
                    $('#btnSave').text("Update");
                }
                else
                    alert("postArticle: " + successModel.Success);
            },
            error: function (jqXHR, exception) {
                alert("Post Article jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) { alert("catch ERROR: " + e); }
}

function updateArticle(view) {
    try {
        $('#updateArticleSpinner').show();
        unBind();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/Article/UpdateArticle",
            //async: "false",
            //dataType: "json",
            data: article,
            success: function (success) {
                $('#updateArticleSpinner').hide();
                if (success === "ok")
                    if (view === "View")
                        window.location = "Article.html?ArticleViewId=" + article.Id;
                    else
                        displayStatusMessage("ok", "updated");
                else
                    displayStatusMessage("error", "updateArticle: " + success);
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
        url: settingsArray.ApiServer + "/api/Ref/GetRefsForRefType?refType=CAT",
        type: "get",
        success: function (refModel) {
            $('#ddCategory').html("<option class= 'ddOption' value ='0'>-- select category --</option >");
            $.each(refModel.RefItems, function (idx, obj) {
                $('#ddCategory').append("<option class='ddOption' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
            });
            categoriesDDloaded = true;
        },
        error: function (jqXHR, exception) {
            alert("getCategories jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function getAvatars() {
    $.ajax({
        url: settingsArray.ApiServer + "/api/Ref/GetRefsForRefType?refType=AVT",
        type: "get",
        success: function (response) {
            $('#ddAvatars').html("<option class= 'ddOption' value ='0'>-- select avatar --</option >");
            $.each(response.RefItems, function (idx, obj) {
                //obj = obj.split(",");
                $('#ddAvatars').append("<option class='ddOption' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
            });
            avitorsDDloaded = true;
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
    try {
        let input = document.getElementById("uplImage");
        let fReader = new FileReader();
        fReader.readAsDataURL(input.files[0]);
        fReader.onloadend = function (event) {
            let img = document.getElementById("imgArticleJog");
            img.src = event.target.result;
            //let url = ;

            alert("img.src: " + event.target.result)


            $.ajax({
                type: "PUT",
                data: {
                    ArticleId: article.Id,
                    FileName: input.files[0].name,
                    Data: event.target.result
                },
                url: settingsArray.ApiServer + "/api/Image/AddImage",
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        //bind(response);
                        article.ImageName = successModel.ReturnValue;
                        //$('#btnSave').text("Update");
                        //setTimeout(function () { adjust() }, 1000);
                    }
                    else
                        alert("getArticle: " + response.Success);
                },
                error: function (jqXHR, exception) {
                    alert("loadImage jqXHR : " + jqXHR.responseText + "\n md: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    } catch (e) {
        alert("loadImage Catch: " + e);
    }
}

function adjust() {
    // percentage of container   var wPic = $('#imgArticleJog').width();
    // var wAcl = $('#divEditArticleContainer').width();
    //$('#divArticleRowContainer').width(wAcl - wPic);
    //var wAcr = $('#divArticleRowContainer').width();
    //var wlbl = $('#divEditArticleLabel').width() + 20;
    //$('#articleSummaryEditor').width(wAcr - wlbl);
    //$('#txtTitle').width(wAcr - wlbl);
    $('#imgArticleJog').css("height", $('#imgArticleJogContainer').height());
}

function showArticleEditorHtml() {
    $('#middleColumn').html(`
        <div id="dots" style="color:white"></div>
        <div class="editArticleFlexContainer">
            <div class="editArticleFloatContainer">
                <div class="editArticleRow">
                    <div class="editArticleLabel">Title:</div>
                    <div class="editArticleInput"><input id="txtTitle" style="font-size: 20px; width:700px" /></div>
                </div>
                <div class="editArticleRow">
                    <div class="editArticleLabel">Category:</div>
                    <div class="editArticleInput"><select id="ddCategory" class="crudDropDown"></select></div>
                    <div class="editArticleLabel align-right">Byline:</div>
                    <div class="editArticleInput"><select id="ddAvatars" class="crudDropDown"></select></div>
                </div>
                <div id="dateEnteredRow" class="editArticleRow">
                    <div class="editArticleLabel">Created:</div>
                    <div class="editArticleInput"><input id="txtCreated" readonly="readonly"/></div>
                    <div class="editArticleLabel">Last Updated:</div>
                    <div class="editArticleInput"><input id="txtUpdated"/></div>
                </div>
                <div class="editArticleRow">
                    <div class="editArticleLabel">Image:</div>
                    <input id="uplImage" type="file" style="display:inline;" onchange="loadImage($(this).val())" />                                
                </div>
                <div class="editArticleRow">
                    <div class="editArticleLabel">Summary:</div>
                    <div id="articleSummaryEditor"></div>
                </div>
            </div>
            <div id="imgArticleJogContainer" class="editArticleFloatContainer">
                <img id="imgArticleJog" class="articleJog" />
            </div>
        </div>
        <div id="articleContentEditor"></div>
        <div id="divStatusMessage"></div>
        <div class="btnRow">
            <img id="updateArticleSpinner" class="btnSpinnerImage articleSaveSpinner" src="Images/loader.gif" />
            <button id="btnSave" class="roundendButton" onclick="addUpdateArticle()">Save</button>
            <button id="btnView" class="roundendButton" onclick="saveAndView()">View</button>
        </div>`
    );
}
