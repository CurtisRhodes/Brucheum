var blogObject = {};

function blogStartup() {
    //setOggleHeader(3911, "blog");
    //setOggleFooter(3911);
    loadBlogDropDowns();
    logPageHit(3911, "blog");

    if (isNullorUndefined(params.blogId)) {
        loadBlogArticles("BLG");
        showBlogDisplay('BLG');
    }
    else {
        //alert("Calling Blog for blogId: " + params.blogId);
        showBlogPage(params.blogId);
    }
    //alert("is this being from Index?")
    if (isInRole("Blog Editor")) {
        //if (document.domain === 'localhost') alert("is in role blog editor");
        $('.adminOnly').show();
        $('.blogEditButton').show();
        $('#footerMessage').html("blog Editor");
    }
    $('#blogControls').show();
}

function loadBlogDropDowns() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Ref/GetRefs?refType=BLG",
        success: function (refs) {
            if (refs.Success === "ok") {
                //<select id="blogDisplayCommentTypeSelect" class="roundedInput" onchange="loadBlogArticles($(this).val())">
                //    <option value="BLG">Blog Entry</option>
                //    <option value="CMT">Comment on an Image</option>
                //    <option class="adminOnly" value="PGM">Programmer Notes</option>
                //    <option class="adminOnly" value="FLD">Folder Comments</option>
                //    <option class="adminOnly" value="PRO">Promo Messages</option>
                //    <option class="adminOnly" value="CON">Site Content</option>
                //</select>
                //var isBlogEditor = isInRole("Blog Editor")

                $.each(refs.refItems, function (idx, obj) {
                    $('#blogDisplayCommentTypeSelect').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    $('#selBlogEditCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                });
            }
            else {
                alert("loadBlogDropDowns\n" + refs.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getRefValues()")) {
                sendEmailToYourself("XHR ERROR IN getRefValues", "api/Ref/Get?refType=" + refType +
                    "<br/>" + errorMessage);
                if (document.domain === 'localhost') alert("XHR error in getRefValues\n" + errorMessage);
            }
            return false;
        }
    });
}

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
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Blog/GetBlogItem?blogId=" + blogId,
            success: function (model) {
                if (model.Success === "ok") {
                    //alert("displayBlogEntry: " + model.Id);
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
                    alert("displayBlogEntry: " + model.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "showBlogPage")) {
                    sendEmailToYourself("XHR ERROR in Blog.js showBlogPage", "/api/OggleBlog?blogId=" + blogId + " Message: " + errorMessage);
                }
            }
        });

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
        //sendEmailToYourself("catch in Blog.js showBlogPage", "display BlogEntry catch: " + e);
        alert("display BlogEntry catch: " + e);

        //if (commentType === "FLD") {
        //    $.ajax({
        //        type: "GET",
        //        url: settingsArray.ApiServer + "/api/CategoryComment/Get?folderId=" + blogId,
        //        success: function (categoryCommentModel) {
        //            if (categoryCommentModel.Success === "ok") {
        //                blogObject.Id = categoryCommentModel.FolderId;
        //                $('#blogPageTitle').html(categoryCommentModel.FolderName);
        //                $('#blogPageImage').attr("src", categoryCommentModel.Link);
        //                $('#blogPageBody').html("fls");

        //                if ($('#blogPageBody').height() > $('#middleColumn').height()) {
        //                    $('#middleColumn').height($('#blogPageBody').height() + $('#bheader').height());
        //                    resizePage();
        //                }
        //            }
        //            else {
        //                sendEmailToYourself("XHR ERROR in Blog.js showBlogPage", "showBlogPage FLD: " + categoryCommentModel.Success);
        //                //alert("showBlogPage FLD: " + categoryCommentModel.Success);                        
        //            }
        //        },
        //        error: function (jqXHR) {
        //            var errorMessage = getXHRErrorDetails(jqXHR);
        //            if (!checkFor404(errorMessage, "showBlogPage")) {
        //                sendEmailToYourself("XHR ERROR in Blog.js showBlogPage", "/api/CategoryComment/Get?folderId=" + blogId + " Message: " + errorMessage);
        //            }
        //        }
        //    });
        //}
        //else {









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
                url: settingsArray.ApiServer + "api/Blog/GetBlogList?commentType=" + commentType,
                success: function (blogCommentsContainer) {
                    $('#blogLoadingGif').hide();
                    if (blogCommentsContainer.Success === "ok") {
                        $('#blogArticleJogContainer').html("");
                        $.each(blogCommentsContainer.blogComments, function (idx, blogComment) {

                            //if (commentType == "PRO")
                            //    alert("categoryComment.Link: " + categoryComment.Link);
                            if ( isNullorUndefined(blogComment.Link)) {
                                blogComment.Link = "Images/redballon.png";
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
                url: settingsArray.ApiServer + "api/Blog/GetBlogList?commentType=" + commentType,
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
                        $('#oggleBlogSummerNote').summernote('code', categoryCommentModel.CommentText);
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
                url: settingsArray.ApiServer + "api/Blog/GetBlogItem?blogId=" + blogId,
                success: function (model) {
                    if (model.Success === "ok") {
                        blogObject.Id = model.Id;
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#selBlogEditCommentType').val(model.CommentType);
                        $('#txtLink').val(model.Link);
                        $('#oggleBlogSummerNote').summernote('code', model.CommentText);
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
    $('#oggleBlogSummerNote').summernote('code', "");
    $('#imgBlogLink').attr("src", "http://boobs.ogglebooble.com/images/redballon.png");
    blogObject.Id = "";
}

function saveBlogEntry() {
    try {
        blogObject.CommentTitle = $('#txtCommentTitle').val();
        blogObject.CommentType = $('#selBlogEditCommentType').val();
        blogObject.Link = $('#txtLink').val();
        blogObject.CommentText = $('#oggleBlogSummerNote').summernote('code');

        if ($('#btnAddEdit').html() === "Add") {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/Blog/Insert",
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
                url: settingsArray.ApiServer + "api/Blog/Update",
                data: blogObject,
                success: function (success) {
                    if (success === "ok") {
                        displayStatusMessage("ok", "Entry Updated");
                        loadBlogList(blogObject.CommentType);
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

    } catch (e) {
        sendEmailToYourself("catch error in Blog.js putBlogEntry", "saveBlogEntry catch: " + e);
        //alert("saveBlogEntry catch: " + e);
    }
}

function resizeBlogPage() {
    resizePage();

    $('#blogEditor').height($('#middleColumn').height() - 100);
    //$('#blogEditor').width($('#blogEditArea').width() - $('.blogListItem').width());
    $('#blogEditor').width($('#blogEditArea').width() - 300);

    
    //$('#oggleBlogSummerNote').width($('#blogEditor').width());
    //var editorWidth = $('#blogEditor').width("-=6");
    //$('.oggleBlogEditor .note-editable').width(editorWidth);
    $('.note-editor').width($('#blogEditor').width());
    $('.note-editor').height($('#blogEditArea').height() * .75);
    $('.note-editable').height($('.note-editor').height() - 50);


    //$('.singleBlogEntryContainer').height($('#middleColumn').height() - 185);
    $('.blogArticleJogContainer').height($('#middleColumn').height() - 185);
}

function blogBodyHtml() {
    return "<div class='leftColumn'>\n" +
        "        <div id='blogControls' class='leftColumnList'>\n" +
        "            <div id='leftColumnShowBlog' onclick='showBlogDisplay()'>Show Blog</div>\n" +
        "            <div id='leftColumnEditorNew' onclick='showBlogEditor()'>New Entry</div>\n" +
        "            <div id='leftColumnEditor'>Edit</div>\n" +
        "            <div id='leftColumnShowPage'>Show Page</div>\n" +
        "        </div>\n" +
        "</div>\n" +
        "<div class='middleColumn'>\n" +
        "    <div id='dots'></div>\n" +
        "    <div id='divStatusMessage'></div>\n" +
        "    <img id='blogLoadingGif' class='loadingGif' src='Images/loader.gif' />\n" +
        "    <div id='blogListArea' class='blogDisplayArea'>\n" +
        "        <select id='blogDisplayCommentTypeSelect' class='roundedInput' onchange='loadBlogArticles($(this).val())'>\n" +
        "        </select>\n" +
        "        <div id='blogArticleJogContainer' class='blogArticleJogContainer'></div>\n" +
        "    </div>\n" +
        "    <div id='blogEditArea' class='twoColumnFrame flexContainer'>\n" +
        "        <div id='blogEditor' class='oggleBlogEditor'>\n" +
        "            <div class='floatLeft'>\n" +
        "                <div class='oggleBlogCrudArea flexContainer'>\n" +
        "                    <div class='floatLeft'>\n" +
        "                        <div style='display:block'>\n" +
        "                            <div class='crudRow'>\n" +
        "                                <div class='crudLabel inline'>Title</div>\n" +
        "                                <input id='txtCommentTitle' class='roundedInput' />\n" +
        "                            </div>\n" +
        "                            <div class='crudRow'>\n" +
        "                                <div class='crudLabel inline'>Type</div>\n" +
        "                                <select id='selBlogEditCommentType' class='roundedInput' onchange='loadBlogList($(this).val())'>\n" +
        "                                </select>\n" +
        "                            </div>\n" +
        "                            <div class='crudRow'>\n" +
        "                                <div class='crudLabel inline'>Link</div>\n" +
        "                                <input id='txtLink' class='roundedInput' onblur='$('#imgBlogLink').attr('src', $('#txtLink').val());' />\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                    <div class='floatLeft'>\n" +
        "                        <img id='imgBlogLink' class='leftImage' />\n" +
        "                    </div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "            <div class='floatLeft'>\n" +
        "                <div id='oggleBlogSummerNote' class='oggleBlogTextEditor'></div>\n" +
        "                <div class='oggleBlogFooterArea'>\n" +
        "                    <div id='btnAddEdit' class='roundendButton' onclick='saveBlogEntry()'>Add</div>\n" +
        "                    <div id='btnNewCancel' class='roundendButton' onclick='NewCancel()'>New</div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div id='blogList' class='blogItemContainer'></div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "    <div id='blogPageArea' class='singleBlogEntryContainer'>\n" +
        "        <div id='blogPageTitle' class='blogPageSubHeader'></div>\n" +
        "        <div class='blogPageImageContainer'><img id='blogPageImage' class='largeCenteredImage' /></div>\n" +
        "        <div id='blogPageBody' class='blogPageBodyText'></div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div class='rightColumn'></div>\n";
}