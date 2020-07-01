var MoveCopyImageModel = {};


function onDirTreeComplete() {
    $('#mcaLoagingGif').hide();
}

function loadMoveCopyArchiveDialog(mode, link, sourceFolderId) {
    MoveCopyImageModel.Mode = mode;
    MoveCopyImageModel.Link = link;
    MoveCopyImageModel.SourceFolderId = sourceFolderId;
    showMoveCopyArchiveDialog(link, mode)
    var startNode = 0;
    if (mode === "Archive")
        startNode = 3822;
    if ($('#moveDialogDirTree').children().length < 1) {
        $('#mcaLoagingGif').hide();
        buildDirTree($('#moveDialogDirTree'), "moveCopyArchiveDialogDirTreeClick", startNode);
    }
    $('#moveCopyDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'right top', at: 'right top', of: $('#middleColumn') },
        width: "650"
    });
    $('#moveCopyDialog').dialog("open");
    $('#moveCopyDialog').dialog('option', 'title', mode + " Image Link");
    $('#moveCopyDialog').on('dialogclose', function (event) {
        if (typeof getAlbumImages === 'function') {
            loadAlbum(sourceFolderId);
            if (viewerShowing)
                slide("next");
        }
    });
}

function moveCopyArchive() {
    //alert("MoveCopyImageModel.DestinationFolderId: " + MoveCopyImageModel.DestinationFolderId);
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/OggleFile/MoveCopyArchive",
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

function moveCopyArchiveDialogDirTreeClick(path, id, treeId) {
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

function showMoveCopyArchiveDialogHtml(link, mode) {
    $('#modalContent').html(
        "<div id='moveCopyDialog' class='oggleDialogWindow' title=''>\n" +
        "    <div class='inline'><img id='copyDialogImage' class='copyDialogImage' src='" + link + "' /></div>\n" +
        "    <div id='dirTreeResults' class='pusedoTextBox'></div>\n" +
        "    <div class='inline'><img class='moveDialogDirTreeButton' src='/Images/caretDown.png' onclick='$('#moveDialogDirTree').show()' /></div>\n" +
        "    <img id='mcaLoagingGif' class='tinyloadingGif' src='Images/loader.gif'/>\n" +
        "    <br />\n" +
        "    <div id='moveDialogDirTree' class='hideableDropDown'></div>\n" +
        "    <div id='btnGo' class='roundendButton' onclick='moveCopyArchive()'>" + mode + "</div>\n" +
        "</div>\n");
}

function showRemoveImageDialogHtml() {
    $('#modalContent').html(
        "<div id='removeLinkDialog' class='oggleDialogWindow' title='Remove Image'>\n" +
        "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked' />  duplicate</div>\n" +
        "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons' />  bad link</div>\n" +
        "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons' />  low quality</div>\n" +
        "    <div>\n" +
        "        <span class='roundendButton' onclick='onRemoveImageClick('ok')'>ok</span>\n" +
        "        <span class='roundendButton' onclick='onRemoveImageClick('cancel')'>cancel</span>\n" +
        "    </div>\n" +
        "</div>\n");
}


