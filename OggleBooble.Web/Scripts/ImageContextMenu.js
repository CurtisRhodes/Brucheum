var selectedImage, imgSrc, linkId, folderId, folderName, modelFolderId;

function showImageContextMenu(pImgSrc, pLinkId, pFolderId, currentAlbumJSfolderName) {
    //alert("image context menu");
    event.preventDefault();
    window.event.returnValue = false;

    folderName = currentAlbumJSfolderName;
    linkId = pLinkId;
    imgSrc = pImgSrc;
    folderId = pFolderId;
    getImageDetails();

    $('#imageContextMenuContainer').html(imageContextMenuHtml());
    var thisImageDiv = $('#' + linkId + '');
    if (viewerShowing) {
        $('#imageContextMenu').css("top", event.clientY + 5);
        $('#imageContextMenu').css("left", event.clientX);
    }
    else {
        var picpos = thisImageDiv.offset();
        var picLeft = Math.max(0, picpos.left + thisImageDiv.width() - $('#imageContextMenu').width() - 50);
        $('#imageContextMenu').css("top", picpos.top + 5);
        $('#imageContextMenu').css("left", picLeft);
    }

    $('.adminLink').hide();
    if (isInRole("Oggle admin"))
        $('.adminLink').show();
    $('#imageContextMenu').fadeIn();
}

function getImageDetails() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetImageDetail?folderId=" + folderId + "&linkId=" + linkId,
        success: function (imageInfo) {
            if (imageInfo.Success === "ok") {
                selectedImage = imageInfo.Link;
                //alert("selectedImage: " + selectedImage);
                if (Number(imageInfo.ModelFolderId) !== Number(folderId)) {
                    $('#ctxModelName').html("n: " + imageInfo.ModelFolderName);
                    modelFolderId = imageInfo.ModelFolderId;
                    $('#ctxSeeMore').show();
                    //alert("ModelFolderId: " + imageInfo.ModelFolderId + " !== folderId: " + folderId);
                }
                else {
                    //alert("folderType: " + imageInfo.FolderType);
                    $('#ctxSeeMore').hide();
                    $('#ctxModelName').html("f1: " + imageInfo.FolderType);
                    if (imageInfo.FolderType.indexOf("singleModel") > -1) {
                        $('#ctxModelName').html("s: " + imageInfo.FolderName);
                    }
                    if (imageInfo.FolderType.indexOf("assorterd") > -1) {
                        $('#ctxModelName').html("f2: " + imageInfo.FolderType);
                        //$('#ctxModelName').html("unknown model");
                    }
                }
                $('#imageInfoLinkId').html(imageInfo.LinkId);
                $('#imageInfoInternalLink').html(imageInfo.Link);
                $('#imageInfoFolderLocation').html(imageInfo.FolderLocation);
                $('#imageInfoHeight').html(imageInfo.Height);
                $('#imageInfoWidth').html(imageInfo.Width);
                $('#imageInfoLastModified').html(imageInfo.LastModified);

                //alert("jQuery.isEmptyObject: " + jQuery.isEmptyObject(imageInfo.InternalLinks));
                if (jQuery.isEmptyObject(imageInfo.InternalLinks)) {
                    $('#ctxShowImageLinks').hide();
                    //$('#ctxShowImageLinks').html("no links");
                }
                else {
                    $('#otherLinksContainer').html("");
                    $.each(imageInfo.InternalLinks, function (idx, obj) {
                        //alert("<div><a href='/album.html?folder=" + idx + " target=\"_blank\"'>" + obj + "</a></div>");
                        $('#otherLinksContainer').append("<div><a href='/album.html?folder=" + idx + "' target='_blank'>" + obj + "</a></div>");
                    });
                }
            }
            else {
                if (document.domain === "localhost") alert("imageInfo.Success: " + imageInfo.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 3,
                        ErrorMessage: imageInfo.Success,
                        CalledFrom: "imageCtx"
                    });
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404()) {
                if (document.domain === "localhost")
                    alert("getImageDetails XHR: " + errorMessage);
                else
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

function imageCtxMenuAction(action) {
    switch (action) {
        case "show":
            $("#imageContextMenu").fadeOut();
            if ($('#ctxModelName').html() === "unknown model")
                showUnknownModelInfoDialog(folderId);
            else
                showFolderInfoDialog(folderId, "img ctx");
            break;
        case "see more":
            rtpe("SEE", folderId, folderName, modelFolderId);
            break;
        case "comment":
            $("#imageContextMenu").fadeOut();
            showImageCommentDialog(imgSrc, linkId, folderId, folderName, "ImageContextMenu");
            break;
        case "explode":
            if (isLoggedIn()) {
                //rtpe(eventCode, calledFrom, eventDetail, pageId)
                rtpe("EXP", folderName, imgSrc, folderId);
            }
            else {
                reportEvent("UNX", "", "", folderId);
                showMyAlert("You must be logged in to use this feature");
            }
            break;
        case "imageInfo":
            $('#imageCtxMenuInfo').toggle();
            break;
        case "showLinks":
            reportEvent("SHL","show Image links",folderName,folderId)
            $('#otherLinksContainer').toggle();
            break;
        case "archive":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", selectedImage, folderId);
            break;
        case "copy":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, folderId);
            break;
        case "move":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, folderId);
            break;
        case "remove":
            $("#imageContextMenu").fadeOut();
            removeImage();
            break;
        case "setF":
            setFolderImage(linkId, folderId, "folder");
            break;
        case "setC":
            setFolderImage(linkId, folderId, "parent");
            break;
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BUG",
                Severity: 2,
                ErrorMessage: "Unhandeled switch case option.  Action: " + action,
                CalledFrom: "Album.js contextMenuAction"
            });
    }    
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

function imageContextMenuHtml() {
    return "<div id='imageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div id='ctxModelName' onclick='imageCtxMenuAction(\"show\")'>model name</div>\n" +
        "    <div id='ctxSeeMore' onclick='imageCtxMenuAction(\"see more\")'>see more of her</div>\n" +
        "    <div onclick='imageCtxMenuAction(\"comment\")'>Comment</div>\n" +
        "    <div onclick='imageCtxMenuAction(\"explode\")'>explode</div>\n" +
        "    <div id='ctxShowImageLinks' onclick='imageCtxMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "    <div id='otherLinksContainer' class='innerContextMenuContainer'></div>\n" +
        "    <div onclick='imageCtxMenuAction(\"imageInfo\")'>Show Image info</div>\n" +
        "    <div id='imageCtxMenuInfo' class='innerContextMenuContainer'>\n" +
        "        <div><div class='ctxInfoLabel'>LinkId</div><div id='imageInfoLinkId' class='ctxInfoValue'></div></div>\n" +
        //"        <div><div class='ctxInfoLabel'>internal link</div><div id='imageInfoInternalLink' class='ctxInfoValue'></div></div>\n" +
        //"        <div><div class='ctxInfoLabel'>FolderLocation</div><div id='imageInfoFolderLocation' class='ctxInfoValue'></div></div>\n" +
        "        <div><div class='ctxInfoLabel'>Height</div><div id='imageInfoHeight' class='ctxInfoValue'></div></div>\n" +
        "        <div><div class='ctxInfoLabel'>Width</div><div id='imageInfoWidth' class='ctxInfoValue'></div></div>\n" +
        "        <div><div class='ctxInfoLabel'>LastModified</div><div id='imageInfoLastModified' class='ctxInfoValue'></div></div>\n" +
        //"        <div><div class='ctxInfoLabel'>ExternalLink</div><div id='imageInfoExternalLink' class='ctxInfoValue'></div></div>\n" +
        "    </div>\n" +



        "    <div id='ctxArchive' class='adminLink' onclick='contextMenuAction(\"archive\")'>Archive</div>\n" +
        "    <div class='adminLink' onclick='imageCtxMenuAction(\"copy\")'>Copy Link</div>\n" +
        "    <div class='adminLink' onclick='imageCtxMenuAction(\"move\")'>Move Image</div>\n" +
        "    <div class='adminLink' onclick='imageCtxMenuAction(\"remove\")'>Remove Link</div>\n" +
        "    <div class='adminLink' onclick='imageCtxMenuAction(\"setF\")'>Set as Folder Image</div>\n" +
        "    <div class='adminLink' onclick='imageCtxMenuAction(\"setC\")'>Set as Category Image</div>\n" +
        "</div>\n";
}
