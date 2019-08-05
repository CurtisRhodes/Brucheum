var MoveCopyImageModel = {};

function showMoveCopyDialog(mode, link, folderId) {
    MoveCopyImageModel.Mode = mode;
    MoveCopyImageModel.Link = link;
    MoveCopyImageModel.SourceFolderId = folderId;
    $('#btnGo').html(mode);
    $('#copyDialogImage').attr("src", link);

    if ($('#moveDialogDirTree').children().length < 1) {
        //alert("$('#moveDialogDirTree').children().length: " + $('#moveDialogDirTree').children().length);
        buildDirTree($('#moveDialogDirTree'), "moveDialogDirTree", 0);
        $('#moveCopyDialog').dialog({
            show: { effect: "fade" },
            hide: { effect: "blind" },
            position: { my: 'right top', at: 'right top', of: $('#middleColumn') },
            width: "650"
        });
    }
    //else alert("$('#moveDialogDirTree').children().length: " + $('#moveDialogDirTree').children().length);

    $('#moveCopyDialog').dialog("open");
    $('#moveCopyDialogContainer').show();
    $('#moveCopyDialog').dialog('option', 'title', mode + " Image Link");
    $('#moveCopyDialog').on('dialogclose', function (event) {
        if (typeof getAlbumImages === 'function') {
            getAlbumImages(folderId);
            if (viewerShowing)
                slide("next");
        }
    });
}


function ftpMoveCopy() {
   // alert("MoveCopyImageModel.DestinationFolderId: " + MoveCopyImageModel.DestinationFolderId);
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/MoveImage/MoveImage",
        data: MoveCopyImageModel,
        success: function (successModel) {
            $('#imagePageLoadingGif').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "link " + MoveCopyImageModel.Mode + "ed to " + $('#dirTreeResults').html());
                $('#moveCopyDialog').dialog("close");

                //alert("successModel.ReturnValue: " + successModel.ReturnValue);

                if (successModel.ReturnValue === "0") {
                    var linkId = MoveCopyImageModel.Link.substr(MoveCopyImageModel.Link.lastIndexOf("_") + 1, 36);
                    //alert("set folder image: " + linkId + "," + MoveCopyImageModel.SourceFolderId);
                    setFolderImage(linkId, MoveCopyImageModel.DestinationFolderId, "folder");

                }
            }
            else {
                alert("ftp Move " + successModel.Success);
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
