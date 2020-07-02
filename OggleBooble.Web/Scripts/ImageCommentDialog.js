var imageComment = {};

function showImageCommentDialog(linkId, imgSrc, folderId, calledFrom) {
   
    //alert("imageCommentDialog. LinkId: " + linkId + " called From: " + calledFrom);
    $('#draggableDialogContents').html(imageCommentDialogHtml());

    imageComment.VisitorId = getCookieValue("VisitorId");
    imageComment.ImageLinkId = linkId;

    $('#commentDialogImage').attr("src", imgSrc);
    $('#draggableDialog').css("top", $('.oggleHeader').height() - 50);
    $('#oggleDialogTitle').html("Write a fantasy about this image");

    $('#imageCommentEditor').summernote({
        height: 200,
        dialogsInBody: true,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
        ]
    });

    $(".note-editable").css('font-size', '19px');
    $(".modelDialogInput").prop('readonly', true);;

    if (typeof pause === 'function')
        pause();

    //loadComment();

    //FCC	Fantasy comment
    //SID	show Image Comment Dialog
    //CMX	Show Model Info Dialog
    reportEvent("SID", calledFrom, "LinkId: " + linkId, folderId);

    $("#draggableDialog").fadeIn();

    //innocent young girl with an enormous set of knockers.She doesn't mind showing them, but it's like she's doing you a favor.
}

function loadComment() {
    /// retreive user's previous comment
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/OggleBlog?linkId=" + imageComment.LinkId + "&userId=" + getCookieValue("VisitorId"),
        success: function (comment) {
            if (comment.Success === "ok") {
                if (comment.Id !== 0) {
                    $('#imageCommentEditor').summernote('code', comment.CommentText);
                    $('#txtCommentTitle').val(comment.CommentTitle);
                    imageComment.Id = comment.Id;
                    $('#divSaveFantasy').html("edit");
                }
            }
            else {
                if (document.domain === "localhost") alert("AJX addImageComment: " + comment.Success);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "AJX",
                    Severity: 1,
                    ErrorMessage: success,
                    CalledFrom: "addImageComment"
                });
                //sendEmailToYourself("ERROR in ImageCommentDialog.js loadComment", "saveComment: " + comment.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadComment")) {
                if (document.domain === "localhost") alert("XHR loadComment: " + errorMessage);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "loadComment"
                });
                //sendEmailToYourself("XHR ERROR in ImageCommentDialog.js loadComment",
                //    "/api/OggleBlog?linkId=" + blogComment.LinkId + "&userId=" + blogComment.UserId + " Message: " + errorMessage);
            }
        }
    });
}

    //public partial class ImageComment {
    //[Key]
    //public string Id { get; set; }
    //    public string CommentTitle { get; set; }
    //    public string CommentText { get; set; }
    //    public string ImageLinkId { get; set; }
    //    public string VisitorId { get; set; }
    //    public DateTime Posted { get; set; }
    //}


function saveComment() {
    imageComment.CommentTitle = $('#txtCommentTitle').val();
    imageComment.CommentText = $('#imageCommentEditor').summernote('code');

    if ($('#divSaveFantasy').html() === "save")
        addImageComment();
    else
        editImageComment();
}

function addImageComment() {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/ImageComment/Add",
        data: imageComment,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "Entry Added");
                $('#divSaveFantasy').html("edit");
                $('#divCloseantasy').html("done");
                //FCC	Fantasy comment
                //SID	show Image Comment Dialog
                //CMX	Show Model Info Dialog
                //reportEvent("FCC", calledFrom, "LinkId: " + blogComment.LinkId, blogComment.FolderId);
            }
            else {
                if (document.domain === "localhost") alert("AJX addImageComment: " + successModel.Success);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "AJX",
                    Severity: 1,
                    ErrorMessage: successModel.Success,
                    CalledFrom: "addImageComment"
                });
                //sendEmailToYourself("jquery fail in ImageCommentDialog.js addImageComment", "saveComment: " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "addImageComment")) {
                if (document.domain === "localhost") alert("XHR editImageComment: " + errorMessage);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "addImageComment"
                });
                //sendEmailToYourself("XHR ERROR in ImageCommentDialog.js addImageComment", "/api/OggleBlog Message: " + errorMessage);
            }
        }
    });
}

function editImageComment() {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/ImageComment/Update",
        data: blogComment,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "Entry Updated");
            }
            else {
                if (document.domain === "localhost") alert("AJX editImageComment: " + success);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "AJX",
                    Severity: 1,
                    ErrorMessage: success,
                    CalledFrom: "editImageComment"
                });
                //sendEmailToYourself("jquery fail in ImageCommentDialog.js addImageComment", "editImageComment: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "editImageComment")) {
                if (document.domain === "localhost") alert("XHR editImageComment: " + errorMessage);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "editImageComment"
                });
                //sendEmailToYourself("XHR ERROR in ImageCommentDialog.js editImageComment", "/api/OggleBlog Message: " + errorMessage);
            }
        }
    });
}

function imageCommentDialogHtml() {
    return "<div class='imageCommentDialogContainer'>\n" +
        "    <div id='divStatusMessage'></div>\n" +
        "    <div class='center'><img id='commentDialogImage' class='commentDialogImage'/></div>\n" +
        "    <div><input id='txtCommentTitle' class='roundedInput commentTitleText' tabindex='1' placeholder='Give your comment a title' /></div>\n" +
        "    <div id='imageCommentEditor' tabindex='2'></div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "    <div id='divSaveFantasy' class='roundendButton clickable commentDialogButton inline' onclick='saveComment()'>save</div>\n" +
        "    <div id='divCloseantasy'  class='roundendButton clickable commentDialogButton inline' onclick='dragableDialogClose()'>cancel</div>\n" +
        //"    <div id='commentInstructions' class='commentDialogInstructions inline'>log in to view comments</div>\n" +
        "   </div>\n" +
        "</div>\n";
}
