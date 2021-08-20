let blogObject = {};

function blogStartup() {
    setOggleHeader("blog");
    setOggleFooter(3911, "blog", "blog");
    document.title = "blog : OggleBooble";

    //ref	CommentType	count(*)
    //CMT	Comment on an Image	126
    //PRO	Promo Messages	18
    //PBE	Public Blog Post	17
    //PGM	Programmer Notes	12
    //CON	Site Content	11


    //if (isInRole("BLG")) {
    //    //if (document.domain === 'localhost') alert("is in role blog editor");
    //    $('.adminOnly').show();
    //    $('.blogEditButton').show();
    //    $('#footerMessage').html("blog Editor");
    //}

    $('#leftColumnArea').html("<div class='blogLeftColumn'>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnShow' onclick='displayBlogList()'>Show Blog List</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnNew' onclick='newEntry()'>New Entry</div>\n" +
        "<div class='blogEditButton displayHidden' id='leftColumnEdit' onclick='editBlogEntry()'>Edit</div>\n"
        //"<div class='blogEditButton displayHidden' id='leftColumnShowPage' onclick='viewBlogEntry()'>Show Page</div>\n</div>\n"
    );
    blogObject.CommentType = "PBE";
    displayBlogList();
    window.addEventListener("resize", resizeBlogPage);
}

function displayBlogList() {
    loadCommentTypesDD();
    $('#indexMiddleColumn').html(`
        <div id='blogArticleJogListArea' class='blogDisplayArea'>\n
            <select id='ddCommentType' class='roundedInput blogDropdown'></select>\n
            <div id='blogArticleJogContainer' class='blogArticleJogContainer'></div>\n
        </div>`
    );
    $('#leftColumnNew').show();
    $('#leftColumnShow').hide();
    $('#leftColumnEdit').hide();
    displayBlogItems();
}

function displayBlogItems() {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleBlog/GetBlogList?commentType=" + blogObject.CommentType,
            success: function (blogCommentsModel) {
                $('#blogLoadingGif').hide();
                if (blogCommentsModel.Success === "ok") {
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
                                        <img class="blogArticleJogImage" src="`+ settingsImgRepo + blogComment.ImgSrc + `" 
                                            onclick="viewBlogEntry('` + blogComment.PkId + `');"/>
                                    </div>
                                    <div class='floatleft'>
                                        <div class="blogArticleTitle">`+ blogComment.CommentTitle + `</div>
                                        <div class="blogArticleText">`+ blogComment.CommentText + `</div>
                                        <div class="clickable" onclick="editBlogEntry('`+ blogComment.PkId + `');"> ...</div>
                                    </div>
                                </div>
                            </div>`);
                            //<div class="blogArticleBottomRow flexContainer">
                            //    <div class="blogEditButton floatright" onclick="editArticle('` + blogComment.PkId + `');">edit</div>  
                            //</div>
                        });
                    }
                    resizeBlogPage();
                }
                else
                    alert("display Blog: " + blogCommentsContainer.Success);
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

function newEntry() {
    //"    <div id='blogEditArea' class='blogArea twoColumnFrame flexContainer'>\n" +   
    displayBlogEditHtml();
    clearBlogGets();
    loadCommentTypesDD();
    $('#leftColumnNew').hide();
    $('#leftColumnShow').show();
    $('#leftColumnEdit').hide();
    $('#btnAddEdit').html("Add");
    $("#txtPosted").datepicker();
}

function editBlogEntry(blogItemId) {
    if (isNullorUndefined(blogItemId))
        blogItemId = blogObject.Id;
    else
        blogObject.Id = blogItemId;

    $('#leftColumnNew').show();
    $('#leftColumnShow').show();
    $('#leftColumnEdit').hide();
    $('#btnAddEdit').html("Update");
    //$('#btnNewCancel').hide();
    displayBlogEditHtml();
    loadCommentTypesDD();
    $('#blogCrudBox').css("width", $(window).width() * .66);
    loadSingleBlogEntry(blogItemId, "edit");
}

function viewBlogEntry(blogItemId) {
    if (isNullorUndefined(blogItemId))
        blogItemId = blogObject.Id;
    else
        blogObject.Id = blogItemId;

    $('.blogEditButton').hide();
    $('#leftColumnShow').show();
    $('#leftColumnEdit').show();

    $('#indexMiddleColumn').html(`
        <div class='singleBlogEntryContainer'>\n
            <div id='blogPageTitle' class='blogPageSubHeader'></div>\n
            <div class='blogPageImageContainer'>\n
                <img id='blogPageImage' class='largeCenteredImage' />\n
                <div id='blogPageBody' class='blogPageBodyText'></div>\n
            </div>\n
                <div class='oggleBlogFooterArea'>\n
                    <div id='btnPublish' class='roundendButton' onclick='publishBlogArticle()'>Publish</div>\n
                </div>\n
        </div>\n`
    );
    loadSingleBlogEntry(blogItemId, "view");
}

function loadSingleBlogEntry(blogItemId, editMode) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleBlog/GetBlogItem?blogId=" + blogItemId,
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

                        $('#txtBlogId').val(blogObject.Id);

                        $('#btnAddEdit').html("Update");
                        $('#btnNewCancel').html("Cancel");
                    }
                    else {
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

function loadCommentTypesDD() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/EntityAttribute/GetRefs?refType=BLG",
        success: function (refs) {
            if (refs.Success === "ok") {
                $('#ddCommentType').html("");
                $.each(refs.RefItems, function (idx, obj) {
                    $('#ddCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    if (obj.RefCode == blogObject.CommentType) 
                        $('#selBlogEditCommentType').append("<option selected='selected' value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                    else
                        $('#selBlogEditCommentType').append("<option value='" + obj.RefCode + "'>" + obj.RefDescription + "</option>");
                });

                $('#ddCommentType').change(function () {
                    blogObject.CommentType = $('#ddCommentType').val()
                    displayBlogItems();
                });

                $('#selBlogEditCommentType').change(function () {
                    //alert("selBlogEditCommentType(" + $('#selBlogEditCommentType option:selected').val() + ")");
                    blogObject.CommentType = $('#ddCommentType').val()
                    //blogObject.CommentType = $('#selBlogEditCommentType option:selected').val();
                    //loadBlogList(blogObject.CommentType);
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

function shortBolgList() {
//    success: function (blogCommentsModel) {
//        $('#blogItemList').html("");
//        if (blogCommentsModel.Success === "ok") {
//            if (blogCommentsModel.BlogComments == null) {
//                $('#blogItemList').html("<div class='blogListItem'>--- ---</div>");
//            }
//            else {
//                $.each(blogCommentsModel.BlogComments, function (idx, blogComment) {
//                    $('#blogItemList').append("<div class='blogListItem' " +
//                        "onclick=viewBlogEntry('" + blogComment.PkId + "') >" +
//                        blogComment.CommentTitle + "</div>");
//                });
//            }
//        }
//        else {
//            logError("AJX", 3910, blogCommentsModel.Success, "load BlogList(");
//        }
//        resizeBlogPage();
//    },
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
        blogObject.VisitorId = getCookieValue("VisitorId");
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
                    if (!checkFor404(errMsg, folderId, "saveBlogEntry")) logError("XHR", 3911, errMsg, "saveBlogEntry");
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

function displayBlogEditHtml() {
    $('#indexMiddleColumn').html(
        "   <div id='blogEditArea' class='blogCrudArea'>\n" +
        "       <div class='blogEditAreaColumn1'>\n" +
        "            <div class='flexContainer'>\n" +
        "                <div id='blogCrudBox' class='maxWidth'>\n" +
        "                   <div class='rightBlogEditPane' >\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Title</div>\n" +
        "                            <input id='txtCommentTitle' class='oggleInput'></input>\n" +
        "                        </div>\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Type</div>\n" +
        "                            <select id='selBlogEditCommentType' class='oggleInput'></select>\n" +
        "                        </div>\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Link</div>\n" +
        "                            <input id='txtLink' class='oggleInput' onBlur='loadImage()'></input>\n" +
        "                        </div>\n" +
        "                        <div class='crudRow'>\n" +
        "                            <div class='crudLabel inline'>Date</div>\n" +
        "                            <input id='txtPosted' class='oggleInput'></input>\n" +
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
        "               <div style='display:inline;'><input id='txtBlogId'></input></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div class='blogEditAreaColumn2'>\n" +
        "       <div id='blogItemList' class='blogItemContainer'></div>\n" +
        "       </div>\n" +
        "   </div>\n"
    );

    $('#summernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "300",
        dialogsInBody: true
    });
    $(".note-editable").css('font-size', '19px');
}

    //<img id='betaExcuse' class='floatingFlow' src='/Images/beta.png' " +
    // title='I hope you are enjoying my totally free website.\nDuring Beta you can expect continual changes." +
    // \nIf you experience problems please press Ctrl-F5 to clear your browser cache to make sure you have the most recent html and javascript." +
    // \nIf you continue to experience problems please send me feedback using the footer link.'/>" + websiteName + "</div >\n" +
