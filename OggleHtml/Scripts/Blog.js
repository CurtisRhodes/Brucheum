var blogObject = {};

function editItem(blogId, commentType) {
    $('#leftColumnEditor').hide();
    $('#leftColumnEditorNew').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnShowPage').show();
    $('#blogPageArea').fadeOut();
    $('#blogListArea').hide();
    $('#blogEditArea').fadeIn();
    loadBlogList(commentType);
    loadBlogEntry(blogId, commentType);
}

function showBlogEditor() {
    $('#leftColumnEditor').hide();
    $('#leftColumnEditorNew').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnShowPage').show();

    $('#blogPageArea').hide();
    $('#blogListArea').fadeOut();
    $('#blogEditArea').fadeIn();
    loadBlogList($('#blogDisplayCommentTypeSelect').val());
    $('#btnAddEdit').html("Add");
    $('#btnNewCancel').hide();
    clearGets();
}

function showBlogDisplay() {
    $('#leftColumnEditorNew').show();
    $('#leftColumnEditor').hide();
    $('#leftColumnShowBlog').hide();
    $('#leftColumnShowPage').hide();
    $('#blogPageArea').hide();
    $('#blogListArea').fadeIn();
    $('#blogEditArea').fadeOut();
}

function showBlogPage(blogId, commentType) {
    try {
        if (commentType === "FLD") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment/Get?folderId=" + blogId,
                success: function (categoryCommentModel) {
                    if (categoryCommentModel.Success === "ok") {
                        blogObject.Id = categoryCommentModel.FolderId;
                        $('#blogPageTitle').html(categoryCommentModel.FolderName);
                        $('#blogPageImage').attr("src", categoryCommentModel.Link);
                        $('#blogPageBody').html("fls");

                        if ($('#blogPageBody').height() > $('#middleColumn').height()) {
                            $('#middleColumn').height($('#blogPageBody').height() + $('#bheader').height());
                            resizePage();
                        }
                    }
                    else {
                        sendEmailToYourself("XHR ERROR in Blog.js showBlogPage", "showBlogPage FLD: " + categoryCommentModel.Success);
                        //alert("showBlogPage FLD: " + categoryCommentModel.Success);                        
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "showBlogPage")) {
                        sendEmailToYourself("XHR ERROR in Blog.js showBlogPage", "/api/CategoryComment/Get?folderId=" + blogId + " Message: " + errorMessage);
                    }
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog?blogId=" + blogId,
                success: function (model) {
                    if (model.Success === "ok") {
                        blogObject.Id = model.Id;
                        $('#blogPageTitle').html(model.CommentTitle);
                        $('#blogPageBody').html(model.CommentText);
                        $('#blogPageImage').attr("src", model.Link);

                        if ($('#blogPageBody').height() > $('#middleColumn').height()) {
                            $('#middleColumn').height($('#blogPageBody').height() + $('#bheader').height());
                            resizePage();
                        }
                    }
                    else {
                        sendEmailToYourself("jQuery fail in Blog.js showBlogPage", "displayBlogEntry: " + model.Success);
                        //alert("displayBlogEntry: " + model.Success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "showBlogPage")) {
                        sendEmailToYourself("XHR ERROR in Blog.js showBlogPage", "/api/OggleBlog?blogId=" + blogId + " Message: " + errorMessage);
                    }
                }
            });
        }

        $('#leftColumnEditor').click(function () {
            editArticle(blogId, commentType);
        });

        $('#blogListArea').fadeOut();
        $('#blogPageArea').fadeIn();
        $('#blogEditArea').hide();
        $('#leftColumnEditor').show();
        $('#leftColumnEditorNew').hide();
        $('#leftColumnShowBlog').show();

    } catch (e) {
        sendEmailToYourself("catch in Blog.js showBlogPage", "display BlogEntry catch: " + e);
        //alert("display BlogEntry catch: " + e);
    }
}

function loadBlogArticles(commentType) {
    try {
        $('#blogLoadingGif').show();
        if (commentType === "FLD") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment/GetCategoryComments",
                success: function (categoryCommentContainer) {
                    $('#blogLoadingGif').hide();
                    if (categoryCommentContainer.Success === "ok") {
                        $('#blogArticleJogContainer').html("");
                        $.each(categoryCommentContainer.CategoryComments, function (idx, categoryComment) {
                            $('#blogArticleJogContainer').append(`
                                <div class="blogArticleJog"> 
                                    <div class="flexContainer">
                                        <div class="floatLeft">
                                            <img class="blogArticleJogImage" src="`+ categoryComment.Link + `" onclick="editArticle('` + categoryComment.FolderId + `','FLD')" />
                                        </div>
                                        <div class="blogArticleJogBody">
                                            <div class="blogArticleTitle">`+ categoryComment.FolderName + `</div>
                                            <div class="blogArticleText">`+ categoryComment.CommentText + `</div>
                                            <div class="blogArticleBottomRow">
                                                <span class="clickable" onclick="createStaticBlogPage(`+ categoryComment.FolderId + `)">...</span>
                                                <div class="floatRight clickable" onclick="editArticle('`+ categoryComment.FolderId + `','FLD')">edit</div>  
                                            </div>
                                        </div>
                                    </div>
                                </div>`);
                        });
                        resizeBlogPage();
                    }
                    else {
                        sendEmailToYourself("jQuery fail in Blog.js showBlogPage", "display Blog: " + BlogCommentContainer.Success);
                        //alert("display Blog: " + BlogCommentContainer.Success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadBlogArticles")) {
                        sendEmailToYourself("XHR ERROR in Blog.js loadBlogArticles", "/api/CategoryComment/GetCategoryComments  Message: " + errorMessage);
                    }
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog/GetBlogList?commentType=" + commentType,
                success: function (blogCommentsContainer) {
                    $('#blogLoadingGif').hide();
                    if (blogCommentsContainer.Success === "ok") {
                        $('#blogArticleJogContainer').html("");
                        $.each(blogCommentsContainer.blogComments, function (idx, blogComment) {

                            //if (commentType == "PRO")
                            //    alert("categoryComment.Link: " + categoryComment.Link);
                            if (blogComment.Link === undefined) {
                                blogComment.Link = "http://boobs.ogglebooble.com/images/redballon.png";
                            }

                            $('#blogArticleJogContainer').append(`
                            <div class="blogArticleJog"> 
                                <div class="flexContainer">
                                    <div class="floatLeft">
                                        <img class="blogArticleJogImage" src="`+ blogComment.Link + `" onclick="showBlogPage('` + blogComment.Id + `','` + commentType + `')" />
                                    </div>
                                    <div class="blogArticleJogBody">
                                        <div class="blogArticleTitle">`+ blogComment.CommentTitle + `</div>
                                        <div class="blogArticleText">`+ blogComment.CommentText + `</div>
                                        <div class="blogArticleBottomRow">
                                            <span class="clickable" onclick="createStaticBlogPage(`+ blogComment.Id + `)">...</span>
                                            <div class="blogEditButton" onclick="editArticle('`+ blogComment.Id + `','` + commentType + `')">edit</div>  
                                        </div>
                                    </div>
                                </div>
                            </div>`);
                        });
                        resizeBlogPage();
                    }
                    else {
                        $('#blogLoadingGif').hide();
                        sendEmailToYourself("jquery fail in Blog.js loadBlogArticles", "display Blog: " + blogCommentsContainer.Success);
                        //alert("display Blog: " + blogCommentsContainer.Success);
                    }
                },
                error: function (jqXHR) {
                    $('#blogLoadingGif').hide();
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadBlogArticles")) {
                        sendEmailToYourself("XHR ERROR in Blog.js loadBlogArticles", "/api/OggleBlog/GetBlogList?commentType=" + commentType+"  Message: " + errorMessage);
                    }
                }
            });
        }
    } catch (e) {
        $('#blogLoadingGif').hide();
        sendEmailToYourself("catch in Blog.js loadBlogArticles", "display Blog: CATCH " + e);
        //alert("display Blog: CATCH " + e);
    }
    $('#blogListArea').show();
    $('#blogPageArea').hide();
    $('#blogEditArea').hide();
}

function editArticle(blogId, commentType) {
    $('#leftColumnEditorNew').hide();
    $('#leftColumnEditor').hide();
    $('#blogPageArea').hide();
    $('#leftColumnShowBlog').show();
    $('#blogListArea').fadeOut();
    loadBlogList(commentType);
    loadBlogEntry(blogId, commentType);
    $('#blogEditArea').fadeIn();
}

function loadBlogList(commentType) {
    try {
        if (commentType === "FLD") {
            $('#blogLoadingGif').show();
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment",
                success: function (categoryCommentContainer) {
                    $('#blogList').html("");
                    if (categoryCommentContainer.Success === "ok") {
                        if (categoryCommentContainer.CategoryComments.length === 0) {
                            $('#blogList').html("<div class='blogListItem'>--- ---</div>");
                        }
                        else {
                            $.each(categoryCommentContainer.CategoryComments, function (idx, categoryComment) {
                                $('#blogList').append("<div class='blogListItem' " +
                                    "onclick=loadBlogEntry('" + categoryComment.FolderId + "','" + commentType + "') >" +
                                    categoryComment.FolderName + "</div>");
                            });
                        }
                        $('#blogLoadingGif').hide();
                    }
                    else {
                        $('#blogLoadingGif').hide();
                        sendEmailToYourself("jquery fail in Blog.js loadBlogArticles", "load BlogList: " + categoryCommentContainer.Success);
                        //alert("load BlogList: " + categoryCommentContainer.Success);
                    }
                    resizeBlogPage();
                },
                error: function (jqXHR) {
                    $('#blogLoadingGif').hide();
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadBlogList")) {
                        sendEmailToYourself("XHR ERROR in Blog.js loadBlogList", "/api/CategoryComment  Message: " + errorMessage);
                    }
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog/GetBlogList?commentType=" + commentType,
                success: function (blogCommentModelContainer) {
                    $('#blogList').html("");
                    if (blogCommentModelContainer.Success === "ok") {
                        if (blogCommentModelContainer.blogComments.length === 0) {
                            $('#blogList').html("<div class='blogListItem'>--- ---</div>");
                        }
                        else {
                            $.each(blogCommentModelContainer.blogComments, function (idx, blogComment) {
                                $('#blogList').append("<div class='blogListItem' " +
                                    "onclick=loadBlogEntry('" + blogComment.Id + "','" + commentType + "') >" +
                                    blogComment.CommentTitle + "</div>");
                            });
                        }
                    }
                    else {
                        sendEmailToYourself("jquery fail in Blog.js loadBlogArticles", "load BlogList: " + blogCommentModelContainer.Success);
                        //alert("load BlogList: " + blogCommentModelContainer.Success);
                    }
                    resizeBlogPage();
                },
                error: function (jqXHR) {
                    $('#blogLoadingGif').hide();
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadBlogList")) {
                        sendEmailToYourself("XHR ERROR in Blog.js loadBlogList", "/api/OggleBlog/GetBlogList?commentType=" + commentType + " Message: " + errorMessage);
                    }
                }
            });
        }
    } catch (e) {
        sendEmailToYourself("catch in Blog.js loadBlogList", "load BlogList catch: " + e);
        //alert("load BlogList catch: " + e);
    }
}

function loadBlogEntry(blogId, commentType) {
    try {
        if (commentType === "FLD") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment/Get?folderId=" + blogId,
                success: function (categoryCommentModel) {
                    if (categoryCommentModel.Success === "ok") {
                        blogObject.Id = categoryCommentModel.FolderId;
                        $('#txtCommentTitle').val(categoryCommentModel.FolderName);
                        $('#selBlogEditCommentType').val(commentType);
                        $('#txtLink').val(categoryCommentModel.Link);
                        $('#blogEditor').summernote('code', categoryCommentModel.CommentText);
                        $('#imgBlogLink').attr("src", categoryCommentModel.Link);

                        $('#btnAddEdit').html("Save");
                        $('#btnNewCancel').show();
                    }
                    else {
                        sendEmailToYourself("jquery fail in Blog.js loadBlogEntry", "displayBlogEntry: " + categoryCommentModel.Success);
                        //alert("displayBlogEntry: " + categoryCommentModel.Success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadBlogList")) {
                        sendEmailToYourself("XHR ERROR in Blog.js loadBlogEntry", "/api/CategoryComment/Get?folderId=" + blogId + " Message: " + errorMessage);
                    }
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog?blogId=" + blogId,
                success: function (model) {
                    if (model.Success === "ok") {
                        blogObject.Id = model.Id;
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#selBlogEditCommentType').val(model.CommentType);
                        $('#txtLink').val(model.Link);
                        $('#blogEditor').summernote('code', model.CommentText);
                        $('#imgBlogLink').attr("src", model.Link);

                        $('#btnAddEdit').html("Save");
                        $('#btnNewCancel').show();
                    }
                    else {
                        sendEmailToYourself("jquery fail in Blog.js displayBlogEntry", model.Success);
                        //alert("displayBlogEntry: " + model.Success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadBlogEntry")) {
                        sendEmailToYourself("XHR ERROR in Blog.js loadBlogEntry", "/api/CategoryComment/Get?folderId=" + blogId + " Message: " + errorMessage);
                    }
                }
            });
        }
    } catch (e) {
        sendEmailToYourself("Catch ERROR in Blog.js loadBlogEntry", e);
        //alert("display BlogEntry catch: " + e);
    }
}

function NewCancel() {
    $('#btnNewCancel').hide();
    $('#btnAddEdit').html("Add");
    clearGets();
}

function clearGets() {
    $('#txtCommentTitle').val("");
    $('#txtLink').val("");
    $('#blogEditor').summernote('code', "");
    $('#imgBlogLink').attr("src", "http://boobs.ogglebooble.com/images/redballon.png");
    blogObject.Id = "";
}

function saveBlogEntry() {
    try {
        // EditFolderCategory(int folderId, string commentText)
        if ($('#selBlogEditCommentType').val() === "FLD") {
            $.ajax({
                type: "PUT",
                url: settingsArray.ApiServer + "api/CategoryComment/EditFolderCategory?folderId=" + blogObject.Id + "&commentText=" + $('#blogEditor').summernote('code'),
                success: function (success) {
                    if (success === "ok") {
                        displayStatusMessage("ok", "Entry Saved");
                        $('#btnAddEdit').html("Save");
                        $('#btnNewCancel').show();
                        loadBlogList("FLD");
                    }
                    else {
                        sendEmailToYourself("jQuery fail in Blog.js saveBlogEntry", success);
                        //alert("saveBlogEntry: " + success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "saveBlogEntry")) {
                        sendEmailToYourself("XHR ERROR in Blog.js saveBlogEntry", "api/CategoryComment/EditFolderCategory?folderId=" + blogObject.Id + "&commentText=" + $('#blogEditor').summernote('code')
                            + " Message: " + errorMessage);
                    }
                }
            });
        }
        else {
            blogObject.CommentTitle = $('#txtCommentTitle').val();
            blogObject.CommentType = $('#selBlogEditCommentType').val();
            blogObject.Link = $('#txtLink').val();
            blogObject.CommentText = $('#blogEditor').summernote('code');

            if ($('#btnAddEdit').html() === "Add") {
                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "/api/OggleBlog",
                    data: blogObject,
                    success: function (successModel) {
                        if (successModel.Success === "ok") {
                            displayStatusMessage("ok", "Entry Saved");
                            $('#btnAddEdit').html("Save");
                            $('#btnNewCancel').show();
                            loadBlogList(blogObject.CommentType);
                            blogObject.Id = successModel.ReturnValue;
                        }
                        else {
                            sendEmailToYourself("jQuery fail in Blog.js saveBlogEntry", "saveBlogEntry: " + successModel.Success);
                            //alert("saveBlogEntry: " + successModel.Success);
                        }
                    },
                    error: function (jqXHR) {
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "loadBlogEntry")) {
                            sendEmailToYourself("XHR ERROR in Blog.js saveBlogEntry", "/api/OggleBlog Message: " + errorMessage);
                        }
                    }
                });
            }
            else {
                $.ajax({
                    type: "PUT",
                    url: settingsArray.ApiServer + "/api/OggleBlog",
                    data: blogObject,
                    success: function (success) {
                        if (success === "ok") {
                            displayStatusMessage("ok", "Entry Updated");
                            loadBlogList(blogObject, blogObject.CommentType);
                        }
                        else {
                            sendEmailToYourself("jQuery fail in Blog.js saveBlogEntry", "update blogEntry: " + success);
                            //alert("update blogEntry: " + success);
                        }
                    },
                    error: function (jqXHR) {
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "putBlogEntry")) {
                            sendEmailToYourself("XHR ERROR in Blog.js putBlogEntry", "/api/OggleBlog Message: " + errorMessage);
                        }
                    }
                });
            }
        }
    } catch (e) {
        sendEmailToYourself("catch error in Blog.js putBlogEntry", "saveBlogEntry catch: " + e);
        //alert("saveBlogEntry catch: " + e);
    }
}

function resizeBlogPage() {
    resizePage();
    $('.note-editable').height($('#middleColumn').height() - 300);
    $('.note-editable').width($('#middleColumn').width() - $('#blogList').width());
    $('.singleBlogEntryContainer').height($('#middleColumn').height() - 145);
    $('.blogArticleJogContainer').height($('#middleColumn').height() - 145);
    $('#blogList').css("max-height", $('#middleColumn').height() - 24);    


    

    //$('#rightColumn').width($('#leftColumn').width());
    //$('#blogList').height($('#middleColumn').height() - headerClearance);

    //$('.note-editable').height($('#middleColumn').height() - 400);

    //$('.blogItemContainer').height($('.blogEditArea').height());

    //$('#footerMessage').html("$('#middleColumn').height(): " + $('#middleColumn').height());
    //$('#footerMessage').append("   $('#note-editable').width(): " + $('.note-editable').width());


    //$('.note-editor').width($('#middleColumn').width() - $('#blogList').width() - 30);
    //$('#footerMessage').html("$('#middleColumn').width(): " + $('#middleColumn').width());
    //$('#footerMessage').append("   $('#blogList').width(): " + $('#blogList').width());
    //$('#footerMessage').append("   $('note-editor').width(): " + $('.note-editor').width());
}

