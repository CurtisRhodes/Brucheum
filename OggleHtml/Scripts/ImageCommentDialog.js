var folderDetailModel = {};

function showImageCommentDialog(src, linkId, folderId, folderName) {
    folderDetailModel.LinkId = linkId;
    folderDetailModel.Link = src;
    folderDetailModel.FolderId = folderId;
    folderDetailModel.FolderName = folderName;


    folderDetailModel.UserId = getCookie("User");



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
            else
                alert("saveComment: " + comment.Success);
        },
        error: function (jqXHR, exception) {
            alert("loadComment XHR : " + getXHRErrorDetails(jqXHR, exception));
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
            else
                alert("saveComment: " + successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("saveComment XHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    })
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
            else
                alert("editImageComment: " + success);
        },
        error: function (jqXHR, exception) {
            alert("editImageComment XHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    })
}
