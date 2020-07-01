function CopyLink() {

}
function MoveImageLocation() {

}
function RenameFile() {

}
function RenameFolder() {

}
function Archive() {

}
function onRemoveImageClick(btn) {
    if (btn === "ok") {
        $.ajax({
            type: "PUT",
            async: true,
            url: settingsArray.ApiServer + "/api/FtpImageRemove/MoveReject",
            data: {
                Id: selectedImageLinkId,
                PreviousLocation: albumFolderId,
                RejectionReason: $('input[name=rdoRejectImageReasons]:checked').val(),
                ExternalLink: selectedImage
            },
            success: function (success) {
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getAlbumImages(albumFolderId);
                    logActivity({
                        PageId: albumFolderId,
                        PageName: currentAlbumJSfolderName,
                        Activity: "link removed " + selectedImageLinkId
                    });
                }
                else {
                    //alert("removeLink: " + success);
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 3,
                        ErrorMessage: success,
                        CalledFrom: "Album.js onRemoveImageClick"
                    });
                    //sendEmailToYourself("jQuery fail in album.js onRemoveImageClick", "Message: " + success);
                }
            },
            error: function (xhr) {
                var errorMessage = getXHRErrorDetails(xhr);
                if (!checkFor404(errorMessage, "onRemoveImageClick")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "Album.js onRemoveImageClick"
                    });
                }
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
            }
        });
    }
    else {
        $('#removeLinkDialog').dialog('close');
        $('#removeLinkDialog').hide();
    }
}

function showDeleteDialog() {
    $('#removeLinkDialog').show();
    $('#removeLinkDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "300"
    });
}


var MoveCopyImageModel = {};
function showMoveCopyDialog(action, selectedImage, folderId) {
    MoveCopyImageModel.Mode = action;
    MoveCopyImageModel.Link = selectedImage;
    MoveCopyImageModel.SourceFolderId = folderId;

    $('#draggableDialog').css("top", $('.oggleHeader').height() + 20);
    $('#oggleDialogTitle').html(action + " Image Link");
    $('#draggableDialogContents').html(moveCopyArchiveHTML());


    var startNode = 0;
    if (mode === "Archive")
        startNode = 3822;
    if ($('#moveDialogDirTree').children().length < 1) {
        $('#mcaLoagingGif').hide();
        buildDirTree($('#moveDialogDirTree'), "moveCopyArchiveDialogDirTreeClick", startNode);
    }

}
 
function nonFtpMoveCopy() {
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

function setFolderImage(linkId, folderId, level) {
    //if (document.domain === 'localhost') alert("setFolderImage. \nlinkId: " + linkId + "\nfolderId=" + folderId + "\nlevel=" + level);
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/GalleryPage/UpdateFolderImage?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
        success: function (success) {
            if (success === "ok") {

                displayStatusMessage("ok", level + " image set");
                $("#imageContextMenu").fadeOut();

            }
            else {
                if (document.domain === "localhost")
                    alert("setFolderImage AJX: " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "AJX",
                        Severity: 1,
                        ErrorMessage: success,
                        CalledFrom: "common.js setFolderImage"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("setFolderImage")) {
                if (document.domain === "localhost")
                    alert("setFolderImage: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "common.js setFolderImage"
                    });
                //sendEmailToYourself("xhr error in common.js setFolderImage", "/api/ImageCategoryDetail/?linkId=" + linkId +
                //    "&folderId=" + folderId + "&level=" + level + " Message: " + errorMessage);
            }
        }
    });
}

function removeImageDialogHTML() {

    "<div id='removeLinkDialog' class='oggleDialogWindow' title='Remove Image'>\n" +
        "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked' />  duplicate</div>\n" +
        "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons' />  bad link</div>\n" +
        "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons' />  low quality</div>\n" +
        "    <div>\n" +
        "        <span class='roundendButton' onclick='onRemoveImageClick('ok')'>ok</span>\n" +
        "        <span class='roundendButton' onclick='onRemoveImageClick('cancel')'>cancel</span>\n" +
        "    </div>\n" +
        "</div>\n";

}



function moveCopyArchiveHTML() {
    return "<div id='moveCopyDialog' class='oggleDialogWindow' title=''>\n" +
        "    <div class='inline'><img id='copyDialogImage' class='copyDialogImage' /></div>\n" +
        "    <div id='dirTreeResults' class='pusedoTextBox'></div>\n" +
        "    <div class='inline'><img class='moveDialogDirTreeButton' src='/Images/caretDown.png' onclick='$('#moveDialogDirTree').show()' /></div>\n" +
        "    <br />\n" +
        "    <div id='moveDialogDirTree' class='hideableDropDown'></div>\n" +
        "    <div id='btnGo' class='roundendButton' onclick='nonFtpMoveCopy()'>Copy</div>\n" +
        "</div>";
}

function moveCopyDialogDirTreeClick(path, id, treeId) {
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

function removeImage() {
    //alert("folderId: " + folderId);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + linkId,
        success: function (success) {
            if (success === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: settingsArray.ApiServer + "api/FtpImageRemove/RemoveImageLink?folderId=" + folderId + "&imageId=" + linkId,
                    success: function (success) {
                        if (success === "ok") {
                            if (viewerShowing)
                                slide("next");
                            getAlbumImages(folderId);

                            var changeLogModel = {
                                PageId: folderId,
                                PageName: folderName,
                                Activity: "link removed " + linkId
                            };
                            logActivity(changeLogModel);
                        }
                        else {
                            alert("removeLink: " + success);
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "BUG",
                                Severity: 1,
                                ErrorMessage: success,
                                CalledFrom: "Album.js removeImage"
                            });
                            //sendEmailToYourself("jQuery fail in album.js removeImage", "Message: " + success);
                        }
                    },
                    error: function (xhr) {
                        var errorMessage = getXHRErrorDetails(xhr);
                        if (!checkFor404(errorMessage, "removeImage")) {
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "XHR",
                                Severity: 1,
                                ErrorMessage: errorMessage,
                                CalledFrom: "Album.js removeImage"
                            });
                            //sendEmailToYourself("XHR error in album.js removeImage", "RemoveImageLink?folderId=" + t
                        }
                    }
                });
            }
            else {
                if (success === "only link")
                    showDeleteDialog();
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 3,
                        ErrorMessage: success,
                        CalledFrom: "Album.js removeImage"
                    });
                    //sendEmailToYourself("jQuery fail in album.js removeImage", "Message: " + success);
                    //alert(success);
                }
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404(errorMessage, "removeImage")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "Album.js removeImage"
                });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS remove image", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + linkId + " Message: " + errorMessage);
            }
        }
    });
}
