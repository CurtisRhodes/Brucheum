var MoveCopyImageModel = {};

$(function () {
});

function showMoveCopyDialog(mode, link, folderId) {
    MoveCopyImageModel.Mode = mode;
    MoveCopyImageModel.Link = link;
    MoveCopyImageModel.SourceFolderId = folderId;
    $('#btnGo').html(mode);
    $('#copyDialogImage').attr("src", link);
    if ($('#moveDialogDirTree').children().length < 10) {
        buildDirTree($('#moveDialogDirTree'), "moveDialogDirTree", 0);
    }
    //else alert("$('#moveDialogDirTree').children().length: " + $('#moveDialogDirTree').children().length);
    $('#moveCopyDialogContainer').show();
    $('#moveCopyDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'right top', at: 'right top', of: $('#middleColumn') },
        width: "650"
    });
    $('#moveCopyDialog').dialog('option', 'title', mode + " Image Link");
}

function ftpMoveCopy() {
   // alert("MoveCopyImageModel.DestinationFolderId: " + MoveCopyImageModel.DestinationFolderId);
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/MoveImage/MoveImage",
        data: MoveCopyImageModel,
        success: function (success) {
            $('#imagePageLoadingGif').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "image moved to " + $('#dirTreeResults').html());
                displayStatusMessage("ok", "link coppyed to " + $('#dirTreeResults').html());
                $('#moveCopyDialog').dialog("close");

                if (typeof getImageLinks === 'function') {
                    getImageLinks();
                }
            }
            else {
                alert("ftp Move " + success);
            }
        },
        error: function (xhr) {
            $('#imagePageLoadingGif').hide();
            alert("ftp Move xhr error: " + xhr.statusText);
        }
    });
}

function moveDialogDirTreeClick(path, id, treeId) {
    if (treeId == "moveDialogDirTree") {
        MoveCopyImageModel.DestinationFolderId = id;
        $('#moveDialogDirTree').hide();
        if (path.length > path.indexOf(".COM") + 4)
            $('#dirTreeResults').html(path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " "));
        else
            $('#dirTreeResults').html(path);
    }
    else
        alert("moveDialogDirTreeClick treeId: " + treeId);
}
