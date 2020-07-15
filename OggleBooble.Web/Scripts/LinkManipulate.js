let pDirTreeId, pDirTreeFolderName;

function linkDialogdirTreeClick(path, id) {
    //alert("linkDialogdirTreeClick path: " + path + ", id: " + id);
    pDirTreeId = id;
    pDirTreeFolderName = path;

    pDestinationId = id;
    pDestinationFolderName = path;
    $('#dirTreeResults').html(path.replace(/%20/g, " "));
}
function showDirTreeDialog(imgSrc, treeStart) {
    $('#draggableDialogContents').html(
        "   <div>" +
        "       <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
        "       <div id='dirTreeResults' class='pusedoTextBox'></div>\n" +
        "       <div class='inline'><img class='moveDialogDirTreeButton' src='/Images/caretDown.png' " +
        "           onclick='$(\"#linkManipulateDirTree\").toggle()'/></div>\n" +
        "       <div id='linkManipulateClick'></div>\n" +
        "       <div id='linkManipulateDirTree' class='hideableDropDown'><img class='ctxloadingGif' src='Images/loader.gif' /></div>\n" +
        "   </div>");


    loadDirectoryTree(treeStart, "linkManipulateDirTree", "linkDialogdirTreeClick");
    //var winH = $(window).height();
    //var dlgH = $('#draggableDialog').height();
    //$('#draggableDialog').css("top", (winH - dlgH) / 2);
    $('#draggableDialog').fadeIn();
}

function showCopyLinkDialog(linkId, folderId, imgSrc) {
    showDirTreeDialog(imgSrc, 1);
    $('#oggleDialogTitle').html("Copy Link");
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
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "LKC",
                    PageId: pDirTreeId,
                    Activity: "copy: " + linkId + " to: " + pDirTreeId
                });
                awardCredits("LKC", pDirTreeId);
            }
            else {
                if (document.domain === "localhost")
                    alert("perfomCopyLink AJQ: " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 1,
                        ErrorMessage: success,
                        CalledFrom: "perfomCopyLink"
                    });
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404("perfomCopyLink")) {
                if (document.domain === "localhost")
                    alert("perfomCopyLink: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "perfomCopyLink"
                    });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS remove image", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + linkId + " Message: " + errorMessage);
            }
        }
    });
}

// showMoveLinkDialog(pLinkId, pFolderId, pImgSrc)
function showMoveLinkDialog(linkId, folderId, imgSrc) {
    showDirTreeDialog(imgSrc, 1);
    $('#oggleDialogTitle').html("Move Link");
    $('#linkManipulateClick').html(
        "<div class='roundendButton' onclick='moveFile(\"MOV\",\"" + linkId + "\"," + folderId + ")'>Move</div>");
}

function showArchiveLinkDialog(linkId, folderId, imgSrc) {
    showDirTreeDialog(imgSrc, 3);
    $('#oggleDialogTitle').html("Archive Image");
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

                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: request,
                    PageId: folderId,
                    Activity: linkId
                });
            }
            else {
                if (document.domain === "localhost")
                    alert("performArchiveImage: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 3,
                        ErrorMessage: success,
                        CalledFrom: "moveFile"
                    });
                //sendEmailToYourself("jQuery fail in album.js onRemoveImageClick", "Message: " + success);
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404("onRemoveImageClick")) {
                if (document.domain === "localhost")
                    alert("performArchiveImage: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "performArchiveImage"
                    });
            }
        }
    });

}

function attemptRemoveLink(linkId, folderId, imgSrc) {
    // 1. if just a link delete it and you're done.
    $.ajax({
        type: "DELETE",
        url: settingsArray.ApiServer + "api/Links/RemoveLink?linkId=" + linkId + "&folderId=" + folderId,
        success: function (success) {
            if (success === "single link" || success === "home folder Link") {
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
                }
                else {
                    if (document.domain === "localhost")
                        alert("attemptRemoveLink: " + success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BUG",
                            Severity: 3,
                            ErrorMessage: success,
                            CalledFrom: "attemptRemoveLink"
                        });
                    //sendEmailToYourself("jQuery fail in album.js onRemoveImageClick", "Message: " + success);
                }
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404("attemptRemoveLink")) {
                if (document.domain === "localhost")
                    alert("attemptRemoveLink: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "Album.js onRemoveImageClick"
                    });
            }
        }
    });
}
function showConfirmDeteteImageDialog(linkId, imgSrc, errMsg) {
    //showDirTreeDialog(imgSrc, 1);
    if (errMsg === "single link") {
        $('#oggleDialogTitle').html("Delete Image");
        $('#draggableDialogContents').html(
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked' />  duplicate</div>\n" +
            "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons' />  bad link</div>\n" +
            "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons' />  low quality</div>\n" +
            "    <div class='roundendButton' onclick='perFormDeleteImage(" + linkId + ")'>ok</div>\n");
    }
    if (errMsg === "home folder Link") {
        $('#oggleDialogTitle').html("Remove Home Folder Link");
        $('#draggableDialogContents').html("<div class='oggleDialogWindow'>\n" +
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div>Are you sure you want to remove the home folder Link</div>\n" +
            "    <div class='roundendButton' onclick='performRemoveHomeFolderLink(" + linkId + ")'>confirm</div>\n" +
            "</div>\n");
    }
    $('#draggableDialog').fadeIn();
}
function perFormDeleteImage(linkId) {
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
                    logActivity({
                        PageId: albumFolderId,
                        PageName: currentAlbumJSfolderName,
                        Activity: "link removed " + selectedImageLinkId
                    });
                }
                else {
                    if (document.domain === "localhost")
                        alert("perFormDeleteImage: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BUG",
                            Severity: 3,
                            ErrorMessage: success,
                            CalledFrom: "perFormDeleteImage"
                        });
                    //sendEmailToYourself("jQuery fail in album.js onRemoveImageClick", "Message: " + success);
                }
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404("perFormDeleteImage")) {
                if (document.domain === "localhost")
                    alert("perFormDeleteImage: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "perFormDeleteImage"
                    });
            }
        }
    });
}
function performRemoveHomeFolderLink() {
    alert("todo: performRemoveHomeFolderLink");
}

function showRenameFolderDialog(folderId, folderName) {
    showLinkDialog();
    $('#oggleDialogTitle').html("Rename Folder: " + folderName);
    //$('#draggableDialogContents').html(
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
                if (document.domain === "localhost")
                    alert("performRenameFolder: " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 1,
                        ErrorMessage: success,
                        CalledFrom: "performRenameFolder"
                    });
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404("performRenameFolder")) {
                if (document.domain === "localhost")
                    alert("performRenameFolder: " + errorMessage);
                else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "performRenameFolder"
                });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS remove image", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + linkId + " Message: " + errorMessage);
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

