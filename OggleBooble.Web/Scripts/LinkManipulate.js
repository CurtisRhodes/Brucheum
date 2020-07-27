﻿let pDirTreeId, pDirTreeFolderName;

function linkDialogdirTreeClick(path, id) {
    //alert("linkDialogdirTreeClick path: " + path + ", id: " + id);
    pDirTreeId = id;
    pDirTreeFolderName = path;

    pDestinationId = id;
    pDestinationFolderName = path;
    $('#dirTreeResults').html(path.replace(/%20/g, " "));
}

function showDirTreeDialog(imgSrc, treeStart) {
//    alert("showDirTreeDialog(imgSrc: " + imgSrc + ", treeStart: " + treeStart);
    $('#centeredDialogContents').html(
        "   <div>" +
        "       <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
        "       <div id='dirTreeResults' class='pusedoTextBox'></div>\n" +
        "       <div class='inline'><img class='dialogDirTreeButton' src='/Images/caretDown.png' " +
        "           onclick='$(\"#linkManipulateDirTree\").toggle()'/></div>\n" +
        "       <div id='linkManipulateClick'></div>\n" +
        "       <div id='linkManipulateDirTree' class='hideableDropDown'><img class='ctxloadingGif' src='Images/loader.gif' /></div>\n" +
        "   </div>");

    loadDirectoryTree(treeStart, "linkManipulateDirTree", "linkDialogdirTreeClick");
    //var winH = $(window).height();
    //var dlgH = $('#draggableDialog').height();
    //$('#draggableDialog').css("top", (winH - dlgH) / 2);
    $('#centeredDialogContainer').fadeIn();
}

function showCopyLinkDialog(linkId, folderId, imgSrc) {
    //alert("showCopyLinkDialog(linkId: " + linkId + ", folderId: " + folderId + ", imgSrc: " + imgSrc);
    showDirTreeDialog(imgSrc, 1);
    $('#centeredDialogTitle').html("Copy Link");
    $('#linkManipulateClick').html(
        "<div class='roundendButton' onclick='perfomCopyLink(\"" + linkId + "\")'>Copy</div>");
}

function perfomCopyLink(linkId) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Links/AddLink?linkId=" + linkId + "&destinationId=" + pDirTreeId,
        success: function (success) {
            if (success === "ok") {
                $('#draggableDialog').fadeOut();
                displayStatusMessage("ok", "link copied")
                $('#centeredDialogContainer').fadeOut();
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "LKC",
                    PageId: pDirTreeId,
                    Activity: "copy: " + linkId + " to: " + pDirTreeId
                });
                awardCredits("LKC", pDirTreeId);
            }
            else {
                logError("BUG", pDirTreeId, success, "perfomCopyLink");
            }
        },
        error: function (xhr) {
            if (!checkFor404("perfomCopyLink")) {
                logError("XHR", pDirTreeId, getXHRErrorDetails(jqXHR), "perfomCopyLink");
            }
        }
    });
}

// showMoveLinkDialog(pLinkId, pFolderId, pImgSrc)
function showMoveLinkDialog(linkId, folderId, imgSrc) {
    showDirTreeDialog(imgSrc, 1);
    $('#centeredDialogTitle').html("Move Link");
    $('#linkManipulateClick').html(
        "<div class='roundendButton' onclick='moveFile(\"MOV\",\"" + linkId + "\"," + folderId + ")'>Move</div>");
}

function showArchiveLinkDialog(linkId, folderId, imgSrc) {
    showDirTreeDialog(imgSrc, 3);
    $('#centeredDialogTitle').html("Archive Image");
    $('#linkManipulateClick').html(
    "<div class='roundendButton' onclick='moveFile(\"ARK\",\"" + linkId + "\"," + folderId + ")'>Archive</div>");
}

function moveFile(request, linkId, folderId) {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/MoveLink?linkId=" + linkId + "&destinationFolderId=" + pDirTreeId + "&request=" + request,
        success: function (success) {
            if (success === "ok") {
                if (viewerShowing)
                    slide("next");
                dragableDialogClose();
                getAlbumImages(folderId);
                displayStatusMessage("ok", "image moved from: " + folderId + "  to: " + pDirTreeId);
                $('#centeredDialogContainer').fadeOut();
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: request,
                    PageId: folderId,
                    Activity: linkId
                });
            }
            else {
                logError("BUG", folderId, success, "moveFile");
            }
        },
        error: function (xhr) {
            if (!checkFor404("moveFile")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "moveFile");
            }
        }
    });
}

function attemptRemoveLink(linkId, folderId, imgSrc) {
    // 1. if just a link delete it and you're done.
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "DELETE",
        url: settingsArray.ApiServer + "api/Links/RemoveLink?linkId=" + linkId + "&folderId=" + folderId,
        success: function (success) {
            if (success === "single link" || success === "home folder Link") {
                $('#imagePageLoadingGif').hide();
                showConfirmDeteteImageDialog(linkId, imgSrc, success);
            }
            else {
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");

                    getAlbumImages(folderId);

                    logDataActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "REM",
                        PageId: folderId,
                        Activity: linkId
                    });
                    $('#imagePageLoadingGif').hide();
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    logError("BUG", folderId, success, "attemptRemoveLink");
                }
            }
        },
        error: function (xhr) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("attemptRemoveLink")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "attemptRemoveLink");
            }
        }
    });
}

function showConfirmDeteteImageDialog(linkId, imgSrc, errMsg) {
    //showDirTreeDialog(imgSrc, 1);
    if (errMsg === "single link") {
        $('#centeredDialogTitle').html("Delete Image");
        $('#centeredDialogContents').html(
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked' />  duplicate</div>\n" +
            "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons' />  bad link</div>\n" +
            "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons' />  low quality</div>\n" +
            "    <div class='roundendButton' onclick='performDeleteImage(" + linkId + ")'>ok</div>\n");
    }
    if (errMsg === "home folder Link") {
        $('#centeredDialogTitle').html("Remove Home Folder Link");
        $('#centeredDialogContents').html("<div class='oggleDialogWindow'>\n" +
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div>Are you sure you want to remove the home folder Link</div>\n" +
            "    <div class='roundendButton' onclick='performRemoveHomeFolderLink(" + linkId + ")'>confirm</div>\n" +
            "</div>\n");
    }
    $('#draggableDialog').fadeIn();
}

function performDeleteImage(linkId) {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/MoveLinkToRejects?linkId=" + linkId,
        success: function (success) {
            if (success === "single link" || success === "home folder Link") {
                showConfirmDeteteImageDialog(linkId, imgSrc, success);
            }
            else {
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getAlbumImages(folderid);
                    logDataActivity({
                        PageId: albumFolderId,
                        PageName: currentAlbumJSfolderName,
                        Activity: "link removed " + selectedImageLinkId
                    });
                }
                else {
                    logError("BUG", 3908, success, "performDeleteImage");
                }
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("perFormDeleteImage")) {
                logError("XHR", 3908, getXHRErrorDetails(jqXHR), "perFormDeleteImage");
            }
        }
    });
}
function performRemoveHomeFolderLink() {
    alert("todo: performRemoveHomeFolderLink");
}

function showRenameFolderDialog(folderId, folderName) {
    showLinkDialog();
    $('#centeredDialogTitle').html("Rename Folder: " + folderName);
    //$('#centeredDialogContents').html(
    //    "<div><span>folder to rename</span>" + folderName + "</div>\n" +
    //    "<div><span>new name</span><input id='txtReName' class='roundedInput' /></div>\n" +
    //    "<div class='roundendButton' onclick='performRenameFolder()'>Rename Folder</div>\n" +
    //    "<div id='renameFolderReport' class='repairReport'></div>\n");
    $("#draggableDialog").fadeIn();


}
function performRenameFolder(folderId, newFolderName) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Links/RenameFolder?folderId=" + folderId + "&newFolderName=" + newFolderName,
        success: function (success) {
            if (success === "ok") {
                $('#draggableDialog').fadeOut();

                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "LKM",
                    PageId: pDestinationId,
                    Activity: linkId + ' moved to ' + pDestinationFolderName
                });
            }
            else {
                logError("BUG", folderId, success, "performRenameFolder");
            }
        },
        error: function (xhr) {
            if (!checkFor404("performRenameFolder")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "performRenameFolder");
            }
        }
    });
}

///////////////////////////////////////////////////////////////

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
                logError("BUG", folderId, success, "setFolderImage");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("setFolderImage")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "setFolderImage");
            }
        }
    });
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

                $('#moveCopyDialog').dialog("close");
                if (successModel.ReturnValue === "0") {
                    var linkId = MoveCopyImageModel.Link.substr(MoveCopyImageModel.Link.lastIndexOf("_") + 1, 36);
                    displayStatusMessage("warning", "Folder Image Set");
                    //alert("set folder image: " + linkId + "," + MoveCopyImageModel.SourceFolderId);
                    setFolderImage(linkId, MoveCopyImageModel.DestinationFolderId, "folder");
                }
            }
            else {
                logError("BUG", MoveCopyImageModel.SourceFolderId, success, "nonFtpMoveCopy");
            }
        },
        error: function (xhr) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("setFolderImage")) {
                logError("XHR", MoveCopyImageModel.SourceFolderId, getXHRErrorDetails(jqXHR), "nonFtpMoveCopy");
            }
        }
    });
}

