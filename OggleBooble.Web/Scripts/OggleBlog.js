let blogObject = {}, selectedCommentType = "BLG", selectedBlogId;

function blogStartup() {
    setOggleHeader(3911, "blog");
    setOggleFooter(3911, "blog");
    document.title = "blog : OggleBooble";
    selectedCommentType = "BLG";
    $('#indexMiddleColumn').html(blogBodyHtml());

    $('#summernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "300",
        dialogsInBody: true
    });
    $(".note-editable").css('font-size', '19px');

    //if (isNullorUndefined(selectedBlogId)) {
    //    loadArticleJogs("BLG");
    //    setBlogView("showBlogDisplay");
    //}
    //else {
    //    alert("Calling Blog for blogId: " + selectedBlogId);
    //    showBlogPage(selectedBlogId);
    //    setBlogView("showBlogPage");
    //}
    loadBlogDropDowns();

    if (isInRole("BLG")) {
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
        url: settingsArray.ApiServer + "api/EntityAttribute/GetRefs?refType=BLG",
        success: function (refs) {
            if (refs.Success === "ok") {
                $('#blogDisplayCommentTypeSelect').html("");
                $.each(refs.RefItems, function (idx, obj) {
                    $('#blogDisplayCommentTypeSelect').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    $('#selBlogEditCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                });
                $('#blogDisplayCommentTypeSelect option[value="BLG"]').attr('selected', 'selected');
                $('#blogDisplayCommentTypeSelect').change(loadArticleJogs($('#blogDisplayCommentTypeSelect').val()));
            }
            else
                logError("AJX", 3911, refs.Success, "loadBlogDropDowns");
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
        }
    });
}

function loadArticleJogs(commentType) {
    $('#blogListArea').show();
    $('#blogPageArea').hide();
    $('#blogEditArea').hide();
    if (commentType === "FLD")
        loadFolderComments();
    else
        loadBlogArticles(commentType);
}

function loadBlogArticles(commentType) {
    try {
        $('#blogLoadingGif').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleJournal/GetBlogList?commentType=" + commentType,
            success: function (blogCommentsContainer) {
                $('#blogLoadingGif').hide();
                if (blogCommentsContainer.Success === "ok") {
                    $('#blogArticleJogContainer').html("");
                    if (blogCommentsContainer.blogComments == null)
                        alert("no entries found");
                    else {
                        $.each(blogCommentsContainer.blogComments, function (idx, blogComment) {

                            //if (commentType == "PRO")
                            //    alert("categoryComment.Link: " + categoryComment.Link);
                            if (isNullorUndefined(blogComment.Link)) {
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
                    }
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

function loadFolderComments() {
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
            else
                logError("AJX", 3911, categoryCommentContainer.Success, "load FolderComments");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
        }
    });
}

function editArticle(itemId, commentType) {
    loadBlogList(commentType);
    if (commentType === "FLD")
        loadFolderComment(itemId);
    else
        loadBlogEntry(itemId);
    setBlogView("editArticle");
}

function loadBlogEntry(blogId) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleJournal/GetBlogItem?blogId=" + blogId,
            success: function (model) {
                if (model.Success === "ok") {
                    blogObject.Id = model.Id;
                    $('#txtCommentTitle').val(model.CommentTitle);
                    $('#selBlogEditCommentType').val(model.CommentType);
                    $('#txtLink').val(model.Link);
                    $('#summernoteContainer').summernote('code', model.CommentText);
                    $('#imgBlogLink').attr("src", model.Link);

                    $('#blogPageTitle').html(model.CommentTitle);
                    $('#blogPageBody').html(model.CommentText);
                    $('#blogPageImage').attr("src", model.Link);
                    $('#btnAddEdit').html("Save");
                    $('#btnNewCancel').show();
                }
                else {
                    logError("AJX", folderId, model.Success, "loadBlogEntry");
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
        logError("CAT", 3911, e, "loadBlogEntry");
    }
}

function loadFolderComment(folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Folder/GetFolderInfo?folderId=" + folderId,
        success: function (folderInfo) {
            if (folderInfo.Success === "ok") {
                blogObject.Id = folderInfo.FolderId;
                $('#txtCommentTitle').val(folderInfo.FolderName);
                $('#selBlogEditCommentType').val(commentType);
                $('#txtLink').val(folderInfo.Link);
                $('#oggleBlogSummerNote').summernote('code', folderInfo.CommentText);
                //$('#imgBlogLink').attr("src", folderInfo.Link);

                $('#blogPageTitle').html(categoryCommentModel.FolderName);
                $('#blogPageImage').attr("src", categoryCommentModel.Link);
                $('#blogPageBody').html("fls");

                if ($('#blogPageBody').height() > $('#middleColumn').height()) {
                    $('#middleColumn').height($('#blogPageBody').height() + $('#bheader').height());
                    resizeBlogPage();
                }
                $('#btnAddEdit').html("Save");
                $('#btnNewCancel').show();
            }
            else 
                logError("AJX", folderId, folderInfo.Success, "loadFolderComment");
        },
        error: function (jqXHR) {
            $('#blogLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
        }
    });
}

function setBlogView(option) {
    switch (option) {
        case "showBlogEditor":
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
            break;
        case "editArticle":
            $('#leftColumnEditorNew').hide();
            $('#leftColumnEditor').hide();
            $('#leftColumnShowBlog').show();
            $('#blogListArea').fadeOut();
            $('#blogEditArea').fadeIn();
            $('#leftColumnShowPage').show();
            $('#blogPageArea').fadeOut();
            break;
        case "showBlogDisplay":
            $('#leftColumnEditorNew').show();
            $('#leftColumnEditor').hide();
            $('#leftColumnShowBlog').hide();
            $('#leftColumnShowPage').hide();
            $('#blogPageArea').hide();
            $('#blogListArea').fadeIn();
            $('#blogEditArea').fadeOut();
            break;
        case "showBlogPage":
            $('#blogListArea').fadeOut();
            $('#blogPageArea').fadeIn();
            $('#blogEditArea').hide();
            $('#leftColumnEditor').show();
            $('#leftColumnEditorNew').hide();
            $('#leftColumnShowBlog').show();
            break;
        default:
    }
}

function showBlogPage(itemId, commentType) {
    try {
        if (commentType === "FLD")
            loadFolderComment(itemId);
        else
            loadBlogEntry(itemId);

        $('#leftColumnEditor').click(function () {
            editArticle(itemId, commentType);
        });
        setBlogView("showBlogPage");

    } catch (e) {
        alert("display BlogEntry catch: " + e);
    }
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
                        logError("AJX", 3911, success, "loadBlogList");
                        $('#blogLoadingGif').hide();
                    }
                    resizeBlogPage();
                },
                error: function (jqXHR) {
                    $('#blogLoadingGif').hide();
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
                }
            });
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/OggleJournal/GetBlogList?commentType=" + commentType,
                success: function (blogCommentModelContainer) {
                    $('#blogList').html("");
                    if (blogCommentModelContainer.Success === "ok") {
                        if (blogCommentModelContainer.blogComments == null) {
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
                        logError("AJX", folderId, blogCommentModelContainer.Success, "loadBlogList(");
                    }
                    resizeBlogPage();
                },
                error: function (jqXHR) {
                    $('#blogLoadingGif').hide();
                    if (!checkFor404()) {
                        logError("XHR", 3911, getXHRErrorDetails(jqXHR), "loadBlogList");
                    }
                }
            });
        }
    } catch (e) {
        logError("CAT", folderId, e, "loadBlogList");
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
                url: settingsArray.ApiServer + "api/Blog/Update",
                data: blogObject,
                success: function (success) {
                    if (success === "ok") {
                        displayStatusMessage("ok", "Entry Updated");
                        loadBlogList(blogObject.CommentType);
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

function resizeBlogPage() {
    // set page width
    let winW = $(window).width(), lcW = $('.leftColumn').width(), rcW = $('.rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);
    //set page height
    let winH = $(window).height();
    let headerH = $('header').height() + 70;
    $('.threeColumnLayout').css("height", winH - headerH);

    $('#blogEditor').height($('#middleColumn').height() - 100);
    $('#blogEditor').width($('#blogEditArea').width() - 300);    


    $('.note-editor').width($('#blogEditor').width());
    $('.note-editor').height($('#blogEditArea').height() * .75);
    $('.note-editable').height($('.note-editor').height() - 50);
}

function blogBodyHtml() {

    $('#leftColumnArea').append("<div id='leftColumnShowBlog' onclick='setBlogView(\"showBlogDisplay\")'>Show Blog</div>\n");
    $('#leftColumnArea').append("<div id='leftColumnEditorNew' onclick='setBlogView(\"showBlogEditor\")'>New Entry</div>\n");
    $('#leftColumnArea').append("<div id='leftColumnEditor'>Edit</div>\n");
    $('#leftColumnArea').append("<div id='leftColumnShowPage'>Show Page</div>\n");

    return " <div id='dots'></div>\n" +
        "    <div id='divStatusMessage'></div>\n" +
        "    <img id='blogLoadingGif' class='loadingGif' src='Images/loader.gif' />\n" +
        "    <div id='blogListArea' class='blogDisplayArea'>\n" +
        "        <select id='blogDisplayCommentTypeSelect' class='roundedInput blogDropdown'></select>\n"+
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
        "                                <select id='selBlogEditCommentType' class='roundedInput' onchange='loadBlogList()'>\n" +
        "                                </select>\n" +
        "                            </div>\n" +
        "                            <div class='crudRow'>\n" +
        "                                <div class='crudLabel inline'>Link</div>\n" +
        "                                <input id='txtLink' class='roundedInput' />\n" +
        "                            </div>\n" +
        "                        </div>\n" +
        "                    </div>\n" +
        "                    <div class='floatLeft'>\n" +
        "                        <img id='imgBlogLink' class='leftImage' />\n" +
        "                    </div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "            <div class='floatLeft'>\n" +
        "               <div class='modelInfoCommentArea'>\n" +
        "                   <textarea id='summernoteContainer'></textarea>\n" +
        "               </div>\n" +
        //        "                <div id='oggleBlogSummerNote' class='oggleBlogTextEditor'></div>\n" +
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
        "   </div>\n";
}
