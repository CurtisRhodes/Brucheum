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
    loadBlogArticles($('#blogDisplayCommentTypeSelect').val());
}

function showBlogPage(blogId, commentType) {
    try {
        if (commentType == "FLD") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment/Get?folderId=" + blogId,
                success: function (categoryCommentModel) {
                    if (categoryCommentModel.Success == "ok") {
                        blogObject.Id = categoryCommentModel.FolderId;
                        $('#blogPageTitle').html(categoryCommentModel.FolderName);
                        $('#blogPageImage').attr("src", categoryCommentModel.Link);
                        $('#blogPageBody').html("fls");

                        if ($('#blogPageBody').height() > $('#middleColumn').height()) {
                            $('#middleColumn').height($('#blogPageBody').height() + $('#bheader').height());
                            resizePage();
                        }
                    }
                    else
                        alert("showBlogPage FLD: " + categoryCommentModel.Success)
                },
                error: function (jqXHR, exception) {
                    alert("showBlogPage FLD jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog?blogId=" + blogId,
                success: function (model) {
                    if (model.Success == "ok") {
                        blogObject.Id = model.Id;
                        $('#blogPageTitle').html(model.CommentTitle);
                        $('#blogPageBody').html(model.CommentText);
                        $('#blogPageImage').attr("src", model.Link);

                        if ($('#blogPageBody').height() > $('#middleColumn').height()) {
                            $('#middleColumn').height($('#blogPageBody').height() + $('#bheader').height());
                            resizePage();
                        }
                    }
                    else
                        alert("displayBlogEntry: " + model.Success)
                },
                error: function (jqXHR, exception) {
                    alert("loadBlogEntry jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }

        $('#leftColumnEditor').click(function () {
            editArticle(blogId, commentType)
        });

        $('#blogListArea').fadeOut();
        $('#blogPageArea').fadeIn();
        $('#blogEditArea').hide();
        $('#leftColumnEditor').show();
        $('#leftColumnEditorNew').hide();
        $('#leftColumnShowBlog').show();

    } catch (e) {
        alert("display BlogEntry catch: " + e);
    }
}

function loadBlogArticles(commentType) {
    try {
        $('#blogLoadingGif').show();
        if (commentType == "FLD") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment/GetCategoryComments",
                success: function (categoryCommentContainer) {
                    $('#blogLoadingGif').hide();
                    if (categoryCommentContainer.Success == "ok") {
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
                    else
                        alert("display Blog: " + BlogCommentContainer.Success)
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("showBlogDisplay jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog/GetBlogList?commentType=" + commentType,
                success: function (blogCommentsContainer) {
                    $('#blogLoadingGif').hide();
                    if (blogCommentsContainer.Success == "ok") {
                        $('#blogArticleJogContainer').html("");
                        $.each(blogCommentsContainer.blogComments, function (idx, blogComment) {

                            //if (commentType == "PRO")
                            //    alert("categoryComment.Link: " + categoryComment.Link);
                            if (blogComment.Link == undefined) {
                                blogComment.Link = "http://boobs.ogglebooble.com/redballon.png";
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
                                            <div class="floatRight clickable" onclick="editArticle('`+ blogComment.Id + `','` + commentType + `')">edit</div>  
                                        </div>
                                    </div>
                                </div>
                            </div>`);
                        });
                        resizeBlogPage();
                    }
                    else {
                        $('#blogLoadingGif').hide();
                        alert("display Blog: " + blogCommentsContainer.Success)
                    }
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("showBlogDisplay jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    } catch (e) {
        $('#blogLoadingGif').hide();
        alert("display Blog: CATCH " + e);
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
        if (commentType == "FLD") {
            $('#blogLoadingGif').show();
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment",
                success: function (categoryCommentContainer) {
                    $('#blogList').html("");
                    if (categoryCommentContainer.Success == "ok") {
                        if (categoryCommentContainer.CategoryComments.length == 0) {
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
                        alert("load BlogList: " + categoryCommentContainer.Success);
                    }
                    resizeBlogPage();
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("loadBlogList jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog/GetBlogList?commentType=" + commentType,
                success: function (blogCommentModelContainer) {
                    $('#blogList').html("");
                    if (blogCommentModelContainer.Success == "ok") {
                        if (blogCommentModelContainer.blogComments.length == 0) {
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
                    else
                        alert("load BlogList: " + blogCommentModelContainer.Success)
                    resizeBlogPage();
                },
                error: function (jqXHR, exception) {
                    alert("loadBlogList jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    } catch (e) {
        alert("load BlogList catch: " + e);
    }
}

function loadBlogEntry(blogId, commentType) {
    try {
        if (commentType == "FLD") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/CategoryComment/Get?folderId=" + blogId,
                success: function (categoryCommentModel) {
                    if (categoryCommentModel.Success == "ok") {
                        blogObject.Id = categoryCommentModel.FolderId;
                        $('#txtCommentTitle').val(categoryCommentModel.FolderName);
                        $('#selBlogEditCommentType').val(commentType);
                        $('#txtLink').val(categoryCommentModel.Link);
                        $('#blogEditor').summernote('code', categoryCommentModel.CommentText);
                        $('#imgBlogLink').attr("src", categoryCommentModel.Link);

                        $('#btnAddEdit').html("Save");
                        $('#btnNewCancel').show();
                    }
                    else
                        alert("displayBlogEntry: " + categoryCommentModel.Success)
                },
                error: function (jqXHR, exception) {
                    alert("loadBlogEntry jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "/api/OggleBlog?blogId=" + blogId,
                success: function (model) {
                    if (model.Success == "ok") {
                        blogObject.Id = model.Id;
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#selBlogEditCommentType').val(model.CommentType);
                        $('#txtLink').val(model.Link);
                        $('#blogEditor').summernote('code', model.CommentText);
                        $('#imgBlogLink').attr("src", model.Link);

                        $('#btnAddEdit').html("Save");
                        $('#btnNewCancel').show();
                    }
                    else
                        alert("displayBlogEntry: " + model.Success)
                },
                error: function (jqXHR, exception) {
                    alert("loadBlogEntry jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    } catch (e) {
        alert("display BlogEntry catch: " + e);
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
    $('#imgBlogLink').attr("src", "http://boobs.ogglebooble.com/redballon.png");
    blogObject.Id = "";
}

function saveBlogEntry() {
    try {
        // EditFolderCategory(int folderId, string commentText)
        if ($('#selBlogEditCommentType').val() == "FLD") {
            $.ajax({
                type: "PUT",
                url: settingsArray.ApiServer + "api/CategoryComment/EditFolderCategory?folderId=" + blogObject.Id + "&commentText=" + $('#blogEditor').summernote('code'),
                success: function (success) {
                    if (success == "ok") {
                        displayStatusMessage("ok", "Entry Saved")
                        $('#btnAddEdit').html("Save")
                        $('#btnNewCancel').show();
                        loadBlogList("FLD");
                    }
                    else
                        alert("saveBlogEntry: " + success)
                },
                error: function (jqXHR, exception) {
                    alert("saveBlogEntry FLD jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            blogObject.CommentTitle = $('#txtCommentTitle').val();
            blogObject.CommentType = $('#selBlogEditCommentType').val();
            blogObject.Link = $('#txtLink').val();
            blogObject.CommentText = $('#blogEditor').summernote('code');

            if ($('#btnAddEdit').html() == "Add") {
                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "/api/OggleBlog",
                    data: blogObject,
                    success: function (successModel) {
                        if (successModel.Success == "ok") {
                            displayStatusMessage("ok", "Entry Saved")
                            $('#btnAddEdit').html("Save")
                            $('#btnNewCancel').show();
                            loadBlogList(blogObject.CommentType);
                            blogObject.Id = successModel.ReturnValue;
                        }
                        else
                            alert("saveBlogEntry: " + successModel.Success)
                    },
                    error: function (jqXHR, exception) {
                        alert("insertBlogEntry jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                    }
                });
            }
            else {
                $.ajax({
                    type: "PUT",
                    url: settingsArray.ApiServer + "/api/OggleBlog",
                    data: blogObject,
                    success: function (success) {
                        if (success == "ok") {
                            displayStatusMessage("ok", "Entry Updated");
                            loadBlogList(blogObject, blogObject.CommentType);
                        }
                        else
                            alert("update blogEntry: " + success);
                    },
                    error: function (jqXHR, exception) {
                        alert("putBlogEntry jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                    }
                });
            }
        }
    } catch (e) {
        alert("saveBlogEntry catch: " + e);
    }
}

function resizeBlogPage() {
    resizePage();
    $('#blogArticleJogContainer').height($('#middleColumn').height() - 94);



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

