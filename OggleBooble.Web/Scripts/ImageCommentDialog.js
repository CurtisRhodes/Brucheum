var folderDetailModel = {};

function showImageCommentDialog(src, linkId, folderId, folderName) {
    folderDetailModel.LinkId = linkId;
    folderDetailModel.Link = src;
    folderDetailModel.FolderId = folderId;
    folderDetailModel.FolderName = folderName;
    folderDetailModel.UserId = getCookieValue("VisitorId");
    folderDetailModel.CommentType = "CMT";
    $('#commentDialogImage').attr("src", src);
    //$('#imageCommentEditor').summernote('code', "");
    $('#txtCommentTitle').val("");
    $('#divSaveFantasy').html("save");
    folderDetailModel.Id = 0;

    $('#imageCommentEditor').summernote({
        height: 300,
        codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
        toolbar: [
            ['codeview'],
            ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
        ]
    });

    $('#imageCommentDialog').show();
    $('#imageCommentDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "715"
    });

    $('#imageCommentDialog').dialog('option', 'title', "Write a fantasy about this image");
    loadComment();
}

function loadComment() {
    /// retreive user's previous comments
    $.ajax({
        type: "PATCH",
        url: settingsArray.ApiServer + "/api/OggleBlog?linkId=" + folderDetailModel.LinkId + "&userId=" + folderDetailModel.UserId,
        success: function (comment) {
            if (comment.Success === "ok") {
                if (comment.Id !== 0) {
                    $('#imageCommentEditor').summernote('code', comment.CommentText);
                    $('#txtCommentTitle').val(comment.CommentTitle);
                    folderDetailModel.Id = comment.Id;
                    $('#divSaveFantasy').html("edit");
                }
            }
            else {
                sendEmailToYourself("ERROR in ImageCommentDialog.js loadComment", "saveComment: " + comment.Success);
                //alert("saveComment: " + comment.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadComment")) {
                sendEmailToYourself("XHR ERROR in ImageCommentDialog.js loadComment",
                    "/api/OggleBlog?linkId=" + folderDetailModel.LinkId + "&userId=" + folderDetailModel.UserId + " Message: " + errorMessage);
            }
        }
    });
}

function saveComment() {
    folderDetailModel.CommentTitle = $('#txtCommentTitle').val();
    folderDetailModel.CommentText = $('#imageCommentEditor').summernote('code');
    if ($('#divSaveFantasy').html() === "save")
        addImageComment();
    else
        editImageComment();
}

function addImageComment() {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/OggleBlog",
        data: folderDetailModel,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "Entry Added");
                $('#divSaveFantasy').html("edit");
                folderDetailModel.Id = successModel.ReturnValue;
            }
            else {
                sendEmailToYourself("jquery fail in ImageCommentDialog.js addImageComment", "saveComment: " + successModel.Success);
                //alert("saveComment: " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "addImageComment")) {
                sendEmailToYourself("XHR ERROR in ImageCommentDialog.js addImageComment", "/api/OggleBlog Message: " + errorMessage);
            }
        }
    });
}

function editImageComment() {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/OggleBlog",
        data: folderDetailModel,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "Entry Updated");
            }
            else {
                sendEmailToYourself("jquery fail in ImageCommentDialog.js addImageComment", "editImageComment: " + success);
                alert("editImageComment: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "editImageComment")) {
                sendEmailToYourself("XHR ERROR in ImageCommentDialog.js editImageComment", "/api/OggleBlog Message: " + errorMessage);
            }
        }
    });
}
