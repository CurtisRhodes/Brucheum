let blogObject = {},
    selectedCommentType,
    selectedBlogId;

function blogStartup() {
    setOggleHeader(3911, "blog");
    setOggleFooter(3911, "blog");
    document.title = "blog : OggleBooble";

    loadBlogHtmlBody();
    loadCommentTypesDD();
    selectedCommentType = "BLG";
    showArticleJogs();
    
    //if (isInRole("BLG")) {
    //    //if (document.domain === 'localhost') alert("is in role blog editor");
    //    $('.adminOnly').show();
    //    $('.blogEditButton').show();
    //    $('#footerMessage').html("blog Editor");
    //}
}

    //    Show Blog   leftColumnShowBlog
    //    New Entry   leftColumnNew
    //    Edit        leftColumnEdit
    //    Show Page   leftColumnShowPage

function newEntry() {
    $('.blogArea').fadeOut();
    $('#blogEditArea').show();

    $('.blogEditButton').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnShowPage').show();
}

function showArticleJogs() {
    $('.blogArea').fadeOut();
    $('#blogListArea').show();

    $('.blogEditButton').hide();
    $('#leftColumnNew').show();
    loadBlogArticles(selectedCommentType);
}
function editArticle(blogId, commentType) {
    selectedBlogId = blogId;
    selectedCommentType = commentType;
    editBlogComment();
    // '` + blogComment.PkId + `','` + commentType + `'); ">edit</div>  
}

function editBlogComment() {
    loadSingleBlogEntry(selectedBlogId, "edit");
    //loadBlogList($('#ddCommentType').val());
    //loadBlogList(selectedCommentType);

    $('.blogEditButton').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnShowPage').show();

    $('.blogArea').fadeOut();
    $('#blogEditArea').fadeIn();

    $('#btnAddEdit').html("Add");
    $('#btnNewCancel').hide();
    clearGets();
    loadSingleBlogEntry(selectedBlogId);
}

function showReadOnlyView(blogId) {
    selectedBlogId = blogId;
    loadSingleBlogEntry(blogId, "readOnly");

    $('.blogEditButton').hide();
    $('#leftColumnShowBlog').show();
    $('#leftColumnShowPage').show();

    $('.blogArea').fadeOut();
    $('#blogPageArea').fadeIn();
}



////////////////////////////////////
function loadSingleBlogEntry(blogId, editMode) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleJournal/GetBlogItem?blogId=" + blogId,
            success: function (model) {
                if (model.Success === "ok") {
                    blogObject.Id = model.Id;

                    if (editMode == "edit") {
                        $('#txtCommentTitle').val(model.CommentTitle);
                        $('#txtLink').val(model.Link);
                        $('#summernoteContainer').summernote('code', model.CommentText);
                        $('#imgBlogLink').attr("src", model.Link);
                        $('#btnAddEdit').html("Save");
                        $('#btnNewCancel').show();
                    }
                    if (editMode == "readOnly") {
                        $('#blogPageTitle').html(model.BlogComments[0].CommentTitle);
                        $('#blogPageBody').html(model.BlogComments[0].CommentText);
                        $('#blogPageImage').attr("src", model.BlogComments[0].Link);

                        //"    <div id='blogPageArea' class='singleBlogEntryContainer'>\n" +
                        //    "        <div id='blogPageTitle' class='blogPageSubHeader'></div>\n" +
                        //    "        <div class='blogPageImageContainer'>\n" +
                        //    "           <img id='blogPageImage' class='largeCenteredImage' />\n" +
                        //    "           <div id='blogPageBody' class='blogPageBodyText'></div>\n" +
                        //    "        </div>\n" +
                        //    "   </div>\n");


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
function loadBlogArticles(commentType) {
    try {
        selectedCommentType = commentType;
        $('#blogLoadingGif').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleJournal/GetBlogList?commentType=" + commentType,
            success: function (blogCommentsModel) {
                $('#blogLoadingGif').hide();
                if (blogCommentsModel.Success === "ok") {
                    $('#blogArticleJogContainer').html("");
                    if (blogCommentsModel.BlogComments.length == 0)
                        alert("no entries found " + blogCommentsModel.BlogComments.length + " commentType: " + commentType);
                    else {
                        settingsImgRepo = settingsArray.ImageRepo;
                        $.each(blogCommentsModel.BlogComments, function (idx, blogComment) {
                            $('#blogArticleJogContainer').append(`
                            <div class="blogArticleJog"> 
                                <div class="flexContainer">
                                    <div class='floatleft'>
                                        <img class="blogArticleJogImage" src="`+ settingsImgRepo + blogComment.ImgSrc + `" onclick="editArticle('` + blogComment.PkId + `','` + commentType + `');"/>
                                    </div>
                                    <div class='floatleft'>
                                        <div class="blogArticleTitle">`+ blogComment.CommentTitle + `</div>
                                        <div class="blogArticleText">`+ blogComment.CommentText + `</div>
                                        <div class="clickable" onclick="showReadOnlyView('`+ blogComment.PkId + `');">...</div>
                                    </div>
                                </div>
                                <div class="blogArticleBottomRow flexContainer">
                                    <div class="blogEditButton floatright" onclick="editArticle('` + blogComment.PkId + `','` + commentType + `');">edit</div>  
                                    
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
function loadCommentTypesDD() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/EntityAttribute/GetRefs?refType=BLG",
        success: function (refs) {
            if (refs.Success === "ok") {
                $('#ddCommentType').html("");
                $.each(refs.RefItems, function (idx, obj) {
                    $('#ddCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    //$('#selBlogEditCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                });
                $('#ddCommentType option[value="BLG"]').attr('selected', 'selected');

                $('#ddCommentType').change(ddCommentTypeChange());
            }
            else
                logError("AJX", 3911, refs.Success, "loadCommentTypes");
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
        }
    });
}
function ddCommentTypeChange() {
    alert("ddCommentTypeChange(" + $('#ddCommentType option:selected').val() + ")");
}
function createStaticBlogPage() { }


function loadFolderComment(folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Folder/GetFolderInfo?folderId=" + folderId,
        success: function (folderInfo) {
            if (folderInfo.Success === "ok") {
                blogObject.Id = folderInfo.FolderId;
                $('#txtCommentTitle').val(folderInfo.FolderName);
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
                                    "onclick=loadSingleBlogEntry('" + categoryComment.FolderId + "','" + commentType + "') >" +
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
                                    "onclick=loadSingleBlogEntry('" + blogComment.PkId + "','" + commentType + "') >" +
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
    let headerH = $('#oggleHeader').height();
    $('.threeColumnLayout').css("height", $('#middleColumn').height() - headerH);
    $('.threeColumnLayout').css("min-height", winH - headerH);
}

function loadBlogHtmlBody() {
    //function $('#indexMiddleColumn').html(blogBodyHtml());

    $('#leftColumnArea').append("<div class='blogLeftColumnBlog'>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnShowBlog' onclick='showArticleJogs()'>Show Blog</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnNew' onclick='newEntry()'>New Entry</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnEdit' onclick='editBlogComment()'>Edit</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnShowPage' onclick='editBlogComment()'>Show Page</div>\n</div>\n"
    );

    //$('#leftColumnEdit').click(function () {
    //    editArticle(itemId, commentType);
    //});

    $('#indexMiddleColumn').html(
        "    <div id='blogListArea' class='blogArea blogDisplayArea'>\n" +
        "        <select id='ddCommentType' class='roundedInput blogDropdown'></select>\n" +
        "        <div id='blogArticleJogContainer' class='blogArticleJogContainer'></div>\n" +
        "    </div>\n" +
        "    <div id='blogEditArea' class='blogArea twoColumnFrame flexContainer'>\n" +
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
        //"                                <select id='selBlogEditCommentType' class='roundedInput' onchange='loadBlogList()'>\n" +
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
        "    <div id='blogPageArea' class='blogArea singleBlogEntryContainer'>\n" +
        "        <div id='blogPageTitle' class='blogPageSubHeader'></div>\n" +
        "        <div class='blogPageImageContainer'>\n" +
        "           <img id='blogPageImage' class='largeCenteredImage' />\n" +
        "           <div id='blogPageBody' class='blogPageBodyText'></div>\n" +
        "        </div>\n" +
        "   </div>\n");

    $('#summernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "300",
        dialogsInBody: true
    });
    $(".note-editable").css('font-size', '19px');
}

//function loadFolderComments() {
//    $.ajax({
//        type: "GET",
//        url: settingsArray.ApiServer + "/api/CategoryComment/GetCategoryComments",
//        success: function (categoryCommentContainer) {
//            $('#blogLoadingGif').hide();
//            if (categoryCommentContainer.Success === "ok") {
//                $('#blogArticleJogContainer').html("");
//                $.each(categoryCommentContainer.CategoryComments, function (idx, categoryComment) {
//                    $('#blogArticleJogContainer').append(`
//                                <div class="blogArticleJog"> 
//                                    <div class="flexContainer">
//                                        <div class="floatLeft">
//                                            <img class="blogArticleJogImage" src="`+ categoryComment.Link +
//                        `" onclick="editBlogComment('` + categoryComment.FolderId + `','FLD')" />
//                                        </div>
//                                        <div class="blogArticleJogBody">
//                                            <div class="blogArticleTitle">`+ categoryComment.FolderName + `</div>
//                                            <div class="blogArticleText">`+ categoryComment.CommentText + `</div>
//                                            <div class="blogArticleBottomRow">
//                                                <span class="clickable" onclick="createStaticBlogPage(`+ categoryComment.FolderId + `)">...</span>
//                                                <div class="blogEditButton" onclick="editArticle('` + categoryComment.FolderId + `','FLD')">edit</div>  
//                                                <div class="floatRight clickable" onclick="editArticle('` + categoryComment.FolderId + `,'FLD')">edit</div>  
//                                            </div>
//                                        </div>
//                                    </div>
//                                </div>`);
//                });
//                resizeBlogPage();
//            }
//            else
//                logError("AJX", 3911, categoryCommentContainer.Success, "load FolderComments");
//        },
//        error: function (jqXHR) {
//            let errMsg = getXHRErrorDetails(jqXHR);
//            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
//            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3911, errMsg, functionName);
//        }
//    });
//}
