let blogObject = {};

function blogStartup() {
    setOggleHeader("blog");
    setOggleFooter(3911, "blog");
    document.title = "blog : OggleBooble";

    loadBlogHtmlBody();
    loadCommentTypesDD();

    window.addEventListener("resize", resizeBlogPage);

    blogObject.CommentType = "BLG";
    //blogObject.CommentType = $('#ddCommentType').val()

    showArticleJogs();

    //<img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
    // title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
    // \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
    // \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +

    //if (isInRole("BLG")) {
    //    //if (document.domain === 'localhost') alert("is in role blog editor");
    //    $('.adminOnly').show();
    //    $('.blogEditButton').show();
    //    $('#footerMessage').html("blog Editor");
    //}
}

function newEntry() {
    //"    <div id='blogEditArea' class='blogArea twoColumnFrame flexContainer'>\n" +   

    $('.blogArea').hide();
    $('#blogEditArea').show();
    clearBlogGets();
    $('#btnAddEdit').html("Add");
    $('.blogEditButton').hide();
    $('#leftColumnShowBlog').show();
    $("#txtPosted").datepicker();
}

function showArticleJogs() {
    $('.blogArea').hide();
    //alert("showArticleJogs()");
    $('#blogArticleJogListArea').show();
    $('.blogEditButton').hide();
    $('#leftColumnNew').show();
    loadArticleJogs();
}

function editArticle(blogId) {
    if (!isNullorUndefined(blogId))
        blogObject.Id = blogId;
    $('.blogEditButton').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnShowPage').show();
    //alert("$(window).width: " + $(window).width() * .88);

    $('.blogArea').hide();
    $('#blogEditArea').fadeIn();
    $('#btnAddEdit').html("Update");
    //$('#btnNewCancel').hide();

    $('#blogCrudBox').css("width", $(window).width() * .66);
    loadSingleBlogEntry("edit");
}

function showReadOnlyView(blogId) {
    if (!isNullorUndefined(blogId))
        blogObject.Id = blogId;

    loadSingleBlogEntry("readOnly");

    $('.blogEditButton').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnEdit').show();

    $('.blogArea').fadeOut();
    $('#blogPageArea').fadeIn();
}

function loadSingleBlogEntry(editMode) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleBlog/GetBlogItem?blogId=" + blogObject.Id,
            success: function (model) {
                if (model.Success === "ok") {
                    blogObject.ImageLink = model.ImageLink;
                    blogObject.ImgSrc = model.ImgSrc;
                    blogObject.CommentType = model.CommentType;
                    if (editMode == "edit") {
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#txtLink').val(model.Link);
                        $('#imgBlogLink').attr("src", settingsImgRepo + model.ImgSrc);
                        $('#summernoteContainer').summernote('code', model.CommentText);
                        $('#txtPosted').val(model.Pdate); //.datepicker();
                        $('#txtLink').val(model.ImageLink);
                        $('#summernoteContainer').summernote('code', model.CommentText);

                        $('#btnAddEdit').html("Update");
                        $('#btnNewCancel').html("Cancel");
                    }
                    if (editMode == "readOnly") {
                        $('#blogPageTitle').html(model.CommentTitle);
                        $('#blogPageBody').html(model.CommentText);
                        $('#blogPageImage').attr("src", settingsImgRepo + model.ImgSrc);
                    }
                }
                else {
                    logError("AJX", 3911, model.Success, "load SingleBlogEntry");
                }
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT", 3911, e, "load SingleBlogEntry");
    }
}

function loadArticleJogs() {
    try {
        $('#blogLoadingGif').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleBlog/GetBlogList?commentType=" + blogObject.CommentType,
            success: function (blogCommentsModel) {
                $('#blogLoadingGif').hide();
                if (blogCommentsModel.Success === "ok")
                {
                    $('#blogArticleJogContainer').html("");
                    if (blogCommentsModel.BlogComments.length == 0)
                        alert("no entries found " + blogCommentsModel.BlogComments.length + " commentType: " + blogObject.CommentType);
                    else {
                        settingsImgRepo = settingsArray.ImageRepo;
                        $.each(blogCommentsModel.BlogComments, function (idx, blogComment) {
                            $('#blogArticleJogContainer').append(`
                            <div class="blogArticleJog"> 
                                <div class="flexContainer">
                                    <div class='floatleft'>
                                        <img class="blogArticleJogImage" src="`+ settingsImgRepo + blogComment.ImgSrc + `" onclick="showReadOnlyView('` + blogComment.PkId + `');"/>
                                    </div>
                                    <div class='floatleft'>
                                        <div class="blogArticleTitle">`+ blogComment.CommentTitle + `</div>
                                        <div class="blogArticleText">`+ blogComment.CommentText + `</div>
                                        <div class="clickable" onclick="editArticle('`+ blogComment.PkId + `');"> ...</div>
                                    </div>
                                </div>
                            </div>`);
                            //<div class="blogArticleBottomRow flexContainer">
                            //    <div class="blogEditButton floatright" onclick="editArticle('` + blogComment.PkId + `');">edit</div>  
                            //</div>
                        });
                    }
                    loadBlogList();
                    resizeBlogPage();
                }
                else
                    alert("display Blog: " + blogCommentsContainer.Success);
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
            }
        });
    } catch (e) {
        $('#blogLoadingGif').hide();
        logError("CAT", 3911, e, "load BlogArticles");
    }
}

function loadCommentTypesDD() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/EntityAttribute/GetRefs?refType=BLG",
        success: function (refs) {
            if (refs.Success === "ok") {
                $('#ddCommentType').html("");
                $.each(refs.RefItems, function (idx, obj) {
                    $('#ddCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    $('#selBlogEditCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");

                    if (obj.RefCode == blogObject.CommentType) {

                    }


                });

                $('#ddCommentType').change(function () {
                    blogObject.CommentType = $('#ddCommentType').val()
                    loadArticleJogs();
                });

                $('#selBlogEditCommentType').change(function () {
                    //alert("ddCommentTypeChange(" + $('#selBlogEditCommentType option:selected').val() + ")");
                    blogObject.CommentType = $('#ddCommentType').val()
                    //blogObject.CommentType = $('#selBlogEditCommentType option:selected').val();
                    loadBlogList();
                });
            }
            else
                logError("AJX", 3911, refs.Success, "loadCommentTypes");
        },
        error: function (jqXHR) {
            $('#blogLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
        }
    });
}

function loadBlogList() {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleBlog/GetBlogList?commentType=" + blogObject.CommentType,
            success: function (blogCommentsModel) {
                $('#blogItemList').html("");
                if (blogCommentsModel.Success === "ok") {
                    if (blogCommentsModel.BlogComments == null) {
                        $('#blogItemList').html("<div class='blogListItem'>--- ---</div>");
                    }
                    else {
                        $.each(blogCommentsModel.BlogComments, function (idx, blogComment) {
                            $('#blogItemList').append("<div class='blogListItem' " +
                                "onclick=showReadOnlyView('" + blogComment.PkId + "') >" +
                                blogComment.CommentTitle + "</div>");
                        });
                    }
                }
                else {
                    logError("AJX", 3910, blogCommentsModel.Success, "load BlogList(");
                }
                resizeBlogPage();
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                if (!checkFor404()) {
                    logError("XHR", 3911, getXHRErrorDetails(jqXHR), "load Blog List");
                }
            }
        });

    } catch (e) {
        logError("CAT", folderId, e, "load Blog List");
    }
}

function clearBlogGets() {
    $('#txtCommentTitle').val("");
    $('#txtLink').val("");
    $('#summernoteContainer').summernote('code', "");
    //$('#imgBlogLink').attr("src", "http://boobs.ogglebooble.com/images/redballon.png");
    $('#imgBlogLink').attr("src", "");
    blogObject.Id = "";
}

function saveBlogEntry() {
    try {
        blogObject.CommentTitle = $('#txtCommentTitle').val();
        blogObject.VisitorId = globalVisitorId;
        blogObject.Link = $('#txtLink').val();
        blogObject.CommentText = $('#summernoteContainer').summernote('code');
        blogObject.CommentType = $('#selBlogEditCommentType').val();
        if ($('#btnAddEdit').html() === "Add") {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/OggleBlog/Insert",
                data: blogObject,
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        displayStatusMessage("ok", "Entry Saved");
                        $('#btnAddEdit').html("Edit");
                        //$('#btnNewCancel').show();
                        blogObject.Id = successModel.ReturnValue;
                    }
                    else 
                        logError("AJX", 3911, successModel.Success, "saveBlogEntry");
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
                }
            });
        }
        else {
            $.ajax({
                type: "PUT",
                url: settingsArray.ApiServer + "api/OggleBlog/Update",
                data: blogObject,
                success: function (success) {
                    if (success === "ok") {
                        displayStatusMessage("ok", "Entry Updated");
                    }
                    else 
                        logError("AJX", 3911, success, "saveBlogEntry");
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
                }
            });
        }
    } catch (e) {
        logError("CAT", 3911, e, "saveBlogEntry");
    }
}

function loadImage() {
    // get full html image name 
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/OggleBlog/GetImageLink?linkId=" + $('#txtLink').val(),
        success: function (imageAddress) {
            $('#imgBlogLink').attr("src", settingsImgRepo + imageAddress);
            blogObject.ImageLink = $('#txtLink').val();
        },
        error: function (jqXHR) {
            $('#blogLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            //let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, "loadImage")) logError("XHR", 3911, errMsg, "loadImage");
        }
    });
}

function btnNewCancelAction() {
    if ($('#btnNewCancel').html() === "Cancel") {
        showArticleJogs();
    }
}

function resizeBlogPage() {

    // set page width
    let winW = $(window).width(), lcW = $('.leftColumn').width(), rcW = $('.rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);

    //set page height
    let winH = $(window).height();
    let headerH = $('#oggleHeader').height();
    //$('.threeColumnLayout').css("height", $('#middleColumn').height() - headerH);
    //$('.threeColumnLayout').css("min-height", winH - headerH);

    //$('#blogArticleJogContainer').css("height", $('#middleColumn').height() - headerH);

}

function loadBlogHtmlBody() {

    $('#leftColumnArea').append("<div class='blogLeftColumnBlog'>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnShowBlog' onclick='showArticleJogs()'>Show Blog</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnNew' onclick='newEntry()'>New Entry</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnEdit' onclick='editArticle()'>Edit</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnShowPage' onclick='showReadOnlyView()'>Show Page</div>\n</div>\n"
    );

    $('#indexMiddleColumn').html(
        "   <div id='blogArticleJogListArea' class='blogArea blogDisplayArea'>\n" +
        "       <select id='ddCommentType' class='roundedInput blogDropdown'></select>\n" +
        "       <div id='blogArticleJogContainer' class='blogArticleJogContainer'></div>\n" +
        "   </div>\n" +
        "   <div id='blogEditArea' class='blogArea blogCrudArea'>\n" +
        "       <div class='blogEditAreaColumn1'>\n" +
        "            <div class='flexContainer'>\n" +
        "                <div id='blogCrudBox' class='maxWidth'>\n" +
        "                   <div class='rightBlogEditPane' >\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Title</div>\n" +
        "                            <input id='txtCommentTitle' class='oggleInput' />\n" +
        "                        </div>\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Type</div>\n" +
        "                            <select id='selBlogEditCommentType' class='oggleInput'></select>\n" +
        "                        </div>\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Link</div>\n" +
        "                            <input id='txtLink' class='oggleInput' onBlur='loadImage()' />\n" +
        "                        </div>\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Date</div>\n" +
        "                            <input id='txtPosted' class='oggleInput' />\n" +
        "                        </div>\n" +
        "                   </div>\n" +
        "                </div>\n" +
        "                <div class='floatRight'>\n" +
        "                    <img id='imgBlogLink' class='leftImage' />\n" +
        "                </div>\n" +
        "            </div>\n" +
        "           <textarea id='summernoteContainer'></textarea>\n" +
        "           <div class='oggleBlogFooterArea'>\n" +
        "               <div id='btnAddEdit' class='roundendButton' onclick='saveBlogEntry()'>Add</div>\n" +
        "               <div id='btnNewCancel' class='roundendButton' onclick='btnNewCancelAction()'>New</div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='blogEditAreaColumn2'>\n" +
        "       <div id='blogItemList' class='blogItemContainer'></div>\n" +
        "       </div>\n" +
        "   </div>\n" +
        "    <div id='blogPageArea' class='blogArea singleBlogEntryContainer'>\n" +
        "        <div id='blogPageTitle' class='blogPageSubHeader'></div>\n" +
        "        <div class='blogPageImageContainer'>\n" +
        "           <img id='blogPageImage' class='largeCenteredImage' />\n" +
        "           <div id='blogPageBody' class='blogPageBodyText'></div>\n" +
        "        </div>\n" +
        "           <div class='oggleBlogFooterArea'>\n" +
        "               <div id='btnPublish' class='roundendButton' onclick='publishBlogArticle()'>Publish</div>\n" +
        "           </div>\n" +
        "   </div>\n");

    $('#summernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "300",
        dialogsInBody: true
    });
    $(".note-editable").css('font-size', '19px');
}
