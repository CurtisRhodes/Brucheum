let imageComment = {};

function showImageCommentDialog(linkId, imgSrc, folderId, calledFrom) {
    imageComment.VisitorId = getCookieValue("VisitorId", "show ImageCommentDialog");
    imageComment.ImageLinkId = linkId;
    imageComment.CalledFrom = calledFrom;
    imageComment.FolderId = folderId;

    logEvent("SID", folderId, calledFrom, "LinkId: " + linkId);

    //alert("ImageCommentDialog called from: " + calledFrom);
    if (calledFrom == "Slideshow") {
        if (typeof pause === 'function')
            pause();
        //alert("show SLIDESHOW ImageCommentDialog");
        console.log("show SLIDESHOW ImageCommentDialog");
        $('#slideShowDialogContainer').show();
        $('#slideShowDialogContents').html(imageCommentDialogHtml());
        $('#slideShowDialogTitle').html("Write a fantasy about this image");
        $('#slideShowDialogContainer').css("top", 33 + $(window).scrollTop());
        $('#slideShowDialogContainer').draggable().fadeIn();
    }
    else {
        $('#centeredDialogContents').html(imageCommentDialogHtml());
        $("#centeredDialogContainer").fadeIn();
        $('#centeredDialogContainer').css("top", $('.oggleHeader').height() + 50);
        $('#centeredDialogTitle').html("Write a fantasy about this image");
    }
    $('#commentDialogImage').attr("src", imgSrc);

    $('#imageCommentEditor').summernote({
        height: 200,
        dialogsInBody: true,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
        ]
    });
    $('#imageCommentEditor').summernote('focus');
    $('txtCommentTitle').blur(function () { console.log("txtCommentTitle blurr"); $('#imageCommentEditor').summernote('focus'); });

    //$('#imageCommentEditor').focus();
    //$("#imageCommentEditor").summernote('codeview.toggle');
    //setTimeout(function () { $("#imageCommentEditor").summernote('codeview.toggle'); }, 800);

    $(".note-editable").css('font-size', '15px');
    $(".modelDialogInput").prop('readonly', true);
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
        url: settingsArray.ApiServer + "/api/OggleBlog?linkId=" + imageComment.LinkId + "&userId=" + getCookieValue("VisitorId", "load Comment"),
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
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", imageComment.FolderId, errMsg, functionName);
        }
    });
}

function saveComment() {
    if ($('#txtCommentTitle').val() == "")
        imageComment.CommentTitle = "no comment";
    else
        imageComment.CommentTitle = $('#txtCommentTitle').val();

    imageComment.CommentText = $('#imageCommentEditor').summernote('code');
    if (imageComment.CommentText == "")
        alert("empty comment");
    else {
        if ($('#divSaveFantasy').html() === "save")
            addImageComment();
        else
            editImageComment();
    }
}

function addImageComment() {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/ImageComment/Add",
        data: imageComment,
        success: function (imageCommentSuccess) {
            if (imageCommentSuccess.Success == "ok") {
                displayStatusMessage("ok", "Entry Added");
                console.log("image comment Added");
                $('#divSaveFantasy').html("edit");
                $('#divCloseFantasy').html("done");
                awardCredits("IMC", imageComment.FolderId);

                sendEmail("CurtishRhodes@hotmail.com", "SomeoneCommented@Ogglebooble.com", "Someone Entered an Image comment !!!",
                    "<br/>VisitorInfo: " + imageComment.VisitorId + " " + imageCommentSuccess.VisitorInfo +
                    "<br/>ImageId: " + imageComment.linkId +
                    "<br/>FolderInfo: " + imageComment.FolderId + " " + imageCommentSuccess.FolderName +
                    "<br/>CommentTitle : " + imageComment.CommentTitle +
                    "<br/>comment: " + imageComment.CommentText);

                logEvent("FCC", imageComment.FolderId, imageComment.CalledFrom, imageComment.CommentText);

                //FCC	Fantasy comment
                //SID	show Image Comment Dialog
                //CMX	Show Model Info Dialog
            }
            else {
                if (success.includes("title"))
                    alert("Please add a title");
                else {
                    logError("AJX", imageComment.FolderId, success, "addImageComment");                    
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", imageComment.FolderId, errMsg, functionName);
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
                console.log("image comment Updated");
                $('#imageCommentEditor').summernote('focus');
            }
            else {
                logError("AJX", imageComment.FolderId, success, "addImageComment");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", imageComment.FolderId, errMsg, functionName);
        }
    });
}

function closeImageCommentDialog() {
    dragableDialogClose();
    $('#slideShowDialogContainer').hide();
}

function imageCommentDialogHtml() {
    return "<div class='imageCommentDialogContainer'>\n" +
        "    <div id='divStatusMessage'></div>\n" +
        "    <div class='center'><img id='commentDialogImage' class='commentDialogImage'/></div>\n" +
        "    <div><input id='txtCommentTitle' class='roundedInput commentTitleText' tabindex='1' placeholder='Give your comment a title'></input></div>\n" +
        "    <div id='imageCommentEditor' tabindex='2'></div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "    <div id='divSaveFantasy' class='roundendButton clickable commentDialogButton inline' onclick='saveComment()'>save</div>\n" +
        "    <div id='divCloseFantasy'  class='roundendButton clickable commentDialogButton inline' onclick='closeImageCommentDialog()'>cancel</div>\n" +
        //"    <div id='commentInstructions' class='commentDialogInstructions inline'>log in to view comments</div>\n" +
        "   </div>\n" +
        "</div>\n";
}
