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

function showUnknowModelDialogHtml() {
    $('#modalContent').html(
        "<div id='modelInfoDialog' class='oggleDialogWindow' onmouseleave='considerClosingModelInfoDialog()'>\n" +
        "    <div id='modelInfoViewOnlyArea' class='displayHidden'>\n" +
        "        <div class='viewOnlyMessage'>If you you know who this is Please 'Add Info'</div>\n" +
        "        <div class='viewOnlyMessage clickable' onclick='IamThisModel()'>Is this you?  </div>\n" +
        "        <a class='dialogEditButton' href='javascript:IdentifyPoser()'>Add Info</a>\n" +
        "    </div>\n" +
        "    <a id='modelInfoEdit' class='dialogEditButton' href='javascript:toggleMode()'>Save</a>\n" +
        "</div>\n");
}

function showModelInfoEditDialog() {
    $('#modalContent').html(
        "<div id='modelInfoEditArea' class='displayHidden'>\n" +
        "    <div class='flexContainer'>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div class='modelInfoDialogLabel'>name</div><input id='txtFolderName' class='modelDialogInput' /><br />\n" +
        "            <div class='modelInfoDialogLabel'>from</div><input id='txtNationality' class='modelDialogInput' /><br />\n" +
        "            <div class='modelInfoDialogLabel'>born</div><input id='txtBorn' class='modelDialogInput' /><br />\n" +
        "            <div class='modelInfoDialogLabel'>boobs</div>\n" +
        "            <select id='selBoobs' class='modelDialogSelect'>\n" +
        "                <option value='Real'>Real</option>\n" +
        "                <option value='Fake'>Fake</option>\n" +
        "            </select><br />\n" +
        "            <div class='modelInfoDialogLabel'>figure</div><input id='txtMeasurements' class='modelDialogInput' />\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <img id='modelDialogThumbNailImage' src='/Images/redballon.png' class='modelDialogImage' />\n" +
        "        </div>\n" +
        "    </div>\n" +
        "    <div class='modelInfoDialogLabel'>comment</div>\n" +
        "    <div id='modelInfoDialogCommentContainer'>\n" +
        "        <div id='modelInfoDialogComment' class='modelInfoCommentArea'></div>\n" +
        "    </div>\n" +
        "    <div id='modelInfoDialogTrackBack'>\n" +
        "        <div class='modelInfoDialogLabel'>status</div><input id='txtStatus' class='modelDialogInput' style='width: 90%;' /><br />\n" +
        "        <div class='modelInfoDialogLabel'>trackbacks</div>\n" +
        "        <div>\n" +
        "            <div class='hrefLabel'>href</div><input id='txtLinkHref' class='modelDialogInput' />\n" +
        "            <div class='hrefLabel'>label</div><input id='txtLinkLabel' class='modelDialogInput' onblur='addHrefToExternalLinks()' />\n" +
        "            <span class='addLinkIcon' onclick='addHrefToExternalLinks()'>+</span>\n" +
        "        </div>\n" +
        "        <div id='externalLinks' class='trackbackLinksArea'></div>\n" +
        "    </div>\n" +
        "</div>\n");
}
