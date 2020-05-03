var MoveCopyImageModel = {};

function showMoveCopyDialog(mode, link, sourceFolderId) {
    MoveCopyImageModel.Mode = mode;
    MoveCopyImageModel.Link = link;
    MoveCopyImageModel.SourceFolderId = sourceFolderId;

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
            getAlbumImages(sourceFolderId);
            if (viewerShowing)
                slide("next");
        }
    });
}

function ftpMoveCopy() {
    //alert("MoveCopyImageModel.DestinationFolderId: " + MoveCopyImageModel.DestinationFolderId);
    $('#imagePageLoadingGif').show();

        //public int SourceFolderId { get; set; }
        //public string Link { get; set; }
        //public string Mode { get; set; }

        //public int DestinationFolderId { get; set; }
        //public int SortOrder { get; set; }

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/MoveImage/MoveImage",
        data: MoveCopyImageModel,
        success: function (successModel) {
            $('#imagePageLoadingGif').hide();
            if (successModel.Success === "ok") {

                displayStatusMessage("ok", "link " + MoveCopyImageModel.Mode + "ed to " + $('#dirTreeResults').html());
                //alert("changeLogModel id: " + MoveCopyImageModel.SourceFolderId + " mode: " + MoveCopyImageModel.Mode + "  name: " + $('#dirTreeResults').html());
                var activityDesc;
                if (MoveCopyImageModel.Mode === "Copy") 
                    activityDesc = "link copied from " + MoveCopyImageModel.SourceFolderId + " to: " + MoveCopyImageModel.DestinationFolderId;
                if (MoveCopyImageModel.Mode === "Move")
                    activityDesc = "link moved from " + MoveCopyImageModel.SourceFolderId + " to: " + MoveCopyImageModel.DestinationFolderId;
                if (MoveCopyImageModel.Mode === "Archive")
                    activityDesc = "link Archived from " + MoveCopyImageModel.SourceFolderId + " to: " + MoveCopyImageModel.DestinationFolderId;
                logActivity({
                    PageId: MoveCopyImageModel.SourceFolderId,
                    PageName: $('#dirTreeResults').html(),                    
                    Activity: activityDesc
                });
                $('#moveCopyDialog').dialog("close");
                if (successModel.ReturnValue === "0") {
                    var linkId = MoveCopyImageModel.Link.substr(MoveCopyImageModel.Link.lastIndexOf("_") + 1, 36);
                    displayStatusMessage("warning", "Folder Image Set");
                    //alert("set folder image: " + linkId + "," + MoveCopyImageModel.SourceFolderId);
                    setFolderImage(linkId, MoveCopyImageModel.DestinationFolderId, "folder");
                }
            }
            else {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "BUG",
                    Severity: 2,
                    ErrorMessage: successModel.Success,
                    CalledFrom: "MoveCopyArchive.js ftpMoveCopy"
                });
                //alert("ftpMoveCopy: " + successModel.Success);
            }
        },
        error: function (xhr) {
            $('#imagePageLoadingGif').hide();
            alert("ftpMoveCopy xhr error: " + xhr.statusText);
        }
    });
}

function moveDialogDirTreeClick(path, id, treeId) {
    //if (treeId == "moveDialogDirTree") {
        MoveCopyImageModel.DestinationFolderId = id;
        $('#moveDialogDirTree').hide();
        if (path.length > path.indexOf(".COM") + 4)
            $('#dirTreeResults').html(path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " "));
        else
            $('#dirTreeResults').html(path);
    //}
    ///else
    //    alert("moveDialogDirTreeClick treeId: " + treeId);
}
