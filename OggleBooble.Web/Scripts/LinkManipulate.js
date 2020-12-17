
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
                    FolderId: pSelectedTreeId,
                    Details: "copy: " + linkId + " to: " + pSelectedTreeFolderPath
                });
                //awardCredits("LKC", pSelectedTreeId);
            }
            else {
                displayStatusMessage("warning", success);
                logError("AJX", pSelectedTreeId, success, "perfomCopyLink");
            }
        },
        error: function (xhr) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
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
                    FolderId: pSelectedTreeId,
                    Details: linkId + " " + request + " from " + folderId
                });
            }
            else {
                logError("AJX", folderId, success, "moveFile");
            }
        },
        error: function (xhr) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
        }
    });
}

function attemptRemoveLink(linkId, folderId, imgSrc) {
    //alert("attemptRemoveLink(linkId: " + linkId + ", folderId: " + folderId + ", imgSrc: " + imgSrc);
    $('#imagePageLoadingGif').show();
    $.ajax({
        type: "DELETE",
        url: settingsArray.ApiServer + "api/Links/AttemptRemoveLink?linkId=" + linkId + "&folderId=" + folderId,
        success: function (success) {
            //alert("attemptRemoveLink   success: " + success);
            if ((success == "single link") || (success == "home folder Link")) {
                $('#imagePageLoadingGif').hide();
                showConfirmDeteteImageDialog(linkId, folderId, imgSrc, success);
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
                        Details: "link: " + linkId
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
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
        }
    });
}

function showConfirmDeteteImageDialog(linkId, folderId, imgSrc, errMsg) {
    if (errMsg === "single link") {
        $('#centeredDialogTitle').html("Delete Image");
        $('#centeredDialogContents').html(
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked' />  duplicate</div>\n" +
            "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons' />  bad link</div>\n" +
            "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons' />  low quality</div>\n" +
            "    <div class='roundendButton' onclick='performMoveImageToRejects(\"" + linkId + "\"," + folderId + ")'>ok</div>\n");
    }

    if (errMsg === "home folder Link") {
        $('#centeredDialogTitle').html("Remove Home Folder Link");
        $('#centeredDialogContents').html("<div class='oggleDialogWindow'>\n" +
            "    <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
            "    <div>Are you sure you want to remove the home folder Link</div>\n" +
            "    <div class='roundendButton' onclick='removeHomeFolderLink(\"" + linkId + "\)'>confirm</div>\n" +
            "</div>\n");
    }
    $('#centeredDialogContainer').fadeIn();
}

function performMoveImageToRejects(linkId, folderId) {
    let rejectReason = $('input[name="rdoRejectImageReasons"]:checked').val();
    //alert("rejectReason: " + rejectReason + " link: " + linkId);

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/MoveImageToRejects?linkId=" + linkId,
        success: function (success) {
            if (success === "single link" || success === "home folder Link") {
                showConfirmDeteteImageDialog(linkId, folderId, imgSrc, success);
            }
            else {
                if (success === "ok") {
                    if (viewerShowing) {
                        // TODO: remove image from slideshow array
                        slide("next");
                    }
                    getAlbumImages(folderId);
                    dragableDialogClose();
                    slideShowDialogClose();
                    displayStatusMessage("ok", "link moved to rejects" + linkId);
                    logDataActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "REJ",
                        FolderId: folderId,
                        Details: "link moved to rejects" + linkId
                    });
                }
                else {
                    logError("AJX", 3908, success, "performDeleteImage");
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
        }
    });
}

function removeHomeFolderLink(linkId, folderId) {

    alert("removeFolderLink: " + linkId);

    $.ajax({
        type: "DELETE",
        url: settingsArray.ApiServer + "api/Links/RemoveHomeFolderLink?linkId=" + linkId,
        success: function (success) {
            if (success === "single link" || success === "home folder Link") {
                showConfirmDeteteImageDialog(linkId, folderId, imgSrc, success);
            }
            else {
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getAlbumImages(folderId);
                    logDataActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        FolderId: folderId,
                        ActivityCode: "RHL",
                        Details: "link: " + selectedImageLinkId + " removed from " + currentAlbumJSfolderName
                    });
                }
                else {
                    logError("AJX", 3908, success, "performDeleteImage");
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
        }
    });
}

function deleteLink(pLinkId, pFolderId, pImgSrc) {
    // ftp delete image file
    // remove ImageFile row
    // remove CatLink row(s)
    // delete local file
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
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", pSelectedTreeId, errMsg, functionName);
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
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", MoveCopyImageModel.SourceFolderId, errMsg, functionName);
        }
    });
}


