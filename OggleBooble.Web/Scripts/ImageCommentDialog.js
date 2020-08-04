var imageComment = {};

function showImageCommentDialog(linkId, imgSrc, folderId, calledFrom) {
    logEvent("SID", folderId, calledFrom, "LinkId: " + linkId);

    $('#centeredDialogContents').html(imageCommentDialogHtml());

    imageComment.VisitorId = getCookieValue("VisitorId");
    imageComment.ImageLinkId = linkId;
    imageComment.FolderId = folderId;

    $('#commentDialogImage').attr("src", imgSrc);
    $('#centeredDialogContainer').css("top", $('.oggleHeader').height() - 50);
    //if(calledFrom==="")
    $('#centeredDialogTitle').html("Write a fantasy about this image");

    $('#imageCommentEditor').summernote({
        height: 200,
        dialogsInBody: true,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
        ]
    });

    $(".note-editable").css('font-size', '15px');
    $(".modelDialogInput").prop('readonly', true);;

    if (typeof pause === 'function')
        pause();

    $("#centeredDialogContainer").fadeIn();

    //innocent young girl with an enormous set of knockers.She doesn't mind showing them, but it's like she's doing you a favor.
}

function loadComment() {
    /// retreive user's previous comment
     //public partial class ImageComment {
    //[Key]
    //public string Id { get; set; }
    //    public string CommentTitle { get; set; }
    //    public string CommentText { get; set; }
    //    public string ImageLinkId { get; set; }
    //    public string VisitorId { get; set; }
    //    public DateTime Posted { get; set; }
    //}
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
                logError("AJX", imageComment.FolderId, comment.Success, "addImageComment");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("loadComment")) {
                logError("XHR", imageComment.FolderId, getXHRErrorDetails(jqXHR), "loadComment");
            }
        }
    });
}

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
                awardCredits("IMC", imageComment.FolderId);

                //FCC	Fantasy comment
                //SID	show Image Comment Dialog
                //CMX	Show Model Info Dialog
                //reportEvent("FCC", calledFrom, "LinkId: " + blogComment.LinkId, blogComment.FolderId);
            }
            else {
                if (success.includes("title"))
                    alert("Please add a title");
                else {
                    logError("AJX", FolderId, success, "addImageComment");                    
                }
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("addImageComment")) {
                logError("XHR", imageComment.FolderId, getXHRErrorDetails(jqXHR), "addImageComment");
            }
        }
    });
}

function editImageComment() {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/ImageComment/Update",
        data: imageComment,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "Entry Updated");
            }
            else {
                logError("AJX", imageComment.FolderId, success, "addImageComment");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("editImageComment")) {
                logError("XHR", imageComment.FolderId, getXHRErrorDetails(jqXHR), "editImageComment");
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
