
function showDirTreeDialog(imgSrc, pMenuType, title) {
    let dirTreeDialogHtml =
        "   <div>" +
        "       <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
        "       <div id='dirTreeResults' class='pusedoTextBox'></div>\n" +
        "       <div class='inline'><img class='dialogDirTreeButton' src='/Images/caretDown.png' " +
        "           onclick='$(\"#linkManipulateDirTree\").toggle()'/></div>\n" +
        "       <div id='linkManipulateClick'></div>\n" +
        "       <div id='linkManipulateDirTree' class='hideableDropDown'><img class='ctxloadingGif' src='Images/loader.gif' /></div>\n" +
        "   </div>";
    if (pMenuType == "Slideshow") {
        // console.log("")
        $('#slideShowDialogContents').html(dirTreeDialogHtml);
        $('#slideShowDialogTitle').html(title);
        $('#slideShowDialogContainer').css("top", 33 + $(window).scrollTop());
        $('#slideShowDialogContainer').draggable().fadeIn();
    }
    else {
        $('#centeredDialogContents').html(dirTreeDialogHtml);
        $('#centeredDialogTitle').html(title);
        $('#centeredDialogContainer').css("top", 33 + $(window).scrollTop());
        $('#centeredDialogContainer').draggable().fadeIn();
    }

    activeDirTree = "linkManipulateDirTree";
    if (isNullorUndefined($('#linkManipulateDirTree').val())) {
        loadDirectoryTree(1, "linkManipulateDirTree", false);
    }
    //var winH = $(window).height();
    //var dlgH = $('#centeredDialog').height();
}
    
function showCopyLinkDialog(linkId, pMenuType, imgSrc) {
    showDirTreeDialog(imgSrc, pMenuType, "Copy Link");
    $('#linkManipulateClick').html("<div class='roundendButton' onclick='perfomCopyLink(\"" + linkId + "\")'>Copy</div>");
}

function perfomCopyLink(linkId) {
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Links/AddLink?linkId=" + linkId + "&destinationId=" + pSelectedTreeId,
        success: function (success) {
            $('#imagePageLoadingGif').hide();
            dragableDialogClose();
            slideShowDialogClose();
            if (success === "ok") {
                displayStatusMessage("ok", "link copied")
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "LKC",
                    PageId: pSelectedTreeId,
                    Activity: "copy: " + linkId + " to: " + pSelectedTreeFolderPath
                });
                //awardCredits("LKC", pSelectedTreeId);
            }
            else {
                displayStatusMessage("warning", success);
                logError("AJX", pSelectedTreeId, success, "perfomCopyLink");
            }
        },
        error: function (xhr) {
            if (!checkFor404("perfomCopyLink")) {
                logError("XHR", pSelectedTreeId, getXHRErrorDetails(jqXHR), "perfomCopyLink");
            }
        }
    });
}

function showMoveLinkDialog(linkId, folderId, pMenuType, imgSrc) {
    showDirTreeDialog(imgSrc, pMenuType, "Move Link");
    $('#linkManipulateClick').html("<div class='roundendButton' onclick='moveFile(\"MOV\",\"" + linkId + "\"," + folderId + ")'>Move</div>");
}

function showArchiveLinkDialog(linkId, folderId, imgSrc, pMenuType) {
    showDirTreeDialog(imgSrc, pMenuType, "Archive Image");
    $('#linkManipulateClick').html("<div class='roundendButton' onclick='moveFile(\"ARK\",\"" + linkId + "\"," + folderId + ")'>Archive</div>");
}

function moveFile(request, linkId, folderId) {
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/MoveLink?linkId=" + linkId + "&destinationFolderId=" + pSelectedTreeId + "&request=" + request,
        success: function (success) {
            $('#imagePageLoadingGif').hide();
            if (success === "ok") {
                if (viewerShowing)
                    slide("next");
                dragableDialogClose();
                slideShowDialogClose();
                getAlbumImages(folderId);
                displayStatusMessage("ok", "image moved from: " + folderId + "  to: " + pSelectedTreeFolderPath);
                $('#centeredDialogContainer').fadeOut();
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: request,
                    PageId: folderId,
                    Activity: linkId
                });
            }
            else {
                logError("AJX", folderId, success, "moveFile");
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
            //alert("attemptRemoveLink   success: " + success);
            if ((success == "single link") || (success == "home folder Link")) {
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
                    logError("AJX", folderId, success, "attemptRemoveLink");
                }
            }
        },
        error: function (jqXHR) {
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
            "    <div class='roundendButton' onclick='performDeleteImage(\"" + linkId + "\")'>ok</div>\n");
    }
    if (errMsg === "home folder Link") {
        $('#centeredDialogTitle').html("Remove Home Folder Link");
        $('#centeredDialogContents').html("<div class='oggleDialogWindow'>\n" +
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div>Are you sure you want to remove the home folder Link</div>\n" +
            "    <div class='roundendButton' onclick='performRemoveHomeFolderLink(\"" + linkId + "\")'>confirm</div>\n" +
            "</div>\n");
    }
    $('#centeredDialogContainer').fadeIn();
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
                    logError("AJX", 3908, success, "performDeleteImage");
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
    $("#centeredDialog").fadeIn();


}
function performRenameFolder(folderId, newFolderName) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Links/RenameFolder?folderId=" + folderId + "&newFolderName=" + newFolderName,
        success: function (success) {
            if (success === "ok") {
                $('#centeredDialog').fadeOut();

                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "LKM",
                    PageId: pSelectedTreeId,
                    Activity: linkId + ' renamed to ' + newFolderName
                });
            }
            else {
                logError("AJX", folderId, success, "performRenameFolder");
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
                logError("AJX", folderId, success, "setFolderImage");
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
                logError("AJX", MoveCopyImageModel.SourceFolderId, success, "nonFtpMoveCopy");
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


