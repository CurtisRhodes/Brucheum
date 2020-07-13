﻿let pImgSrc, pLinkId, pFolderId, pFolderName, pFolderType, pModelFolderId, pMenuType, pos = {};

function showContextMenu(menuType, pos, imgSrc, linkId, folderId, folderName) {
    event.preventDefault();
    window.event.returnValue = false;

    pLinkId = linkId;
    pImgSrc = imgSrc;
    pFolderId = folderId;
    pFolderName = folderName;
    pMenuType = menuType;
    if (typeof pause === 'function')
        pause();

    //"<div id='slideshowCtxMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
    //"   <div id='slideshowContextMenuContent'></div>\n" +
    //"</div>\n" +
    if (pMenuType === "Slideshow") {
        $('#slideshowCtxMenuContainer').css("top", pos.y);
        $('#slideshowCtxMenuContainer').css("left", pos.x);
        $('#slideshowCtxMenuContainer').fadeIn();
        $('#slideshowContextMenuContent').html(contextMenuHtml())
    }
    else {
        $('#contextMenuContainer').css("top", pos.y);
        $('#contextMenuContainer').css("left", pos.x);
        $('#contextMenuContainer').fadeIn();
        $('#contextMenuContent').html(contextMenuHtml())
    }
    $('.ogContextMenu').draggable();

    //$('#ctxSeeMore').html("menu type: " + pMenuType);
    $('#ctxModelName').html("<img class='ctxloadingGif' src='Images/loader.gif'/>");

    if (pMenuType === "Folder")
        ctxGetFolderDetails();
    else
        getLimitedImageDetails();

    //$('.adminLink').hide();
    if (isInRole("Oggle admin")) $('.adminLink').show();
}

$('.contextMenuContent').mouseover(function (e) {
    e.stopPropagation();
    alert("mouseover: ");
    //$(this).addClass('ogItemHover');
}).mouseout(function () {
    $(this).removeClass('ogItemHover');
});

function getLimitedImageDetails() {
    $('#ctxNewTab').hide();
    $('#ctxShowLinks').hide();
    $('#ctxDownLoad').hide();
    let start = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetLimitedImageDetail?folderId=" + pFolderId + "&linkId=" + pLinkId,
        success: function (imageInfo) {
            var delta = Date.now() - start;
            var minutes = Math.floor(delta / 60000);
            var seconds = (delta % 60000 / 1000).toFixed(0);
            console.log("getLimitedImageDetails: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);

            if (imageInfo.Success === "ok") {
                if (imageInfo.OutsideFolderLink) {
                    $('#ctxModelName').html(imageInfo.ModelFolderName);
                    pModelFolderId = imageInfo.ModelFolderId;
                    $('#ctxSeeMore').show();
                }
                else {
                    $('#ctxModelName').html(imageInfo.FolderName);
                    $('#ctxSeeMore').hide();
                }
                //pModelFolderName = imageInfo.ModelFolderName;
                //$('#headerMessage').html("menu type: " + pMenuType);
                //$('#aboveImageContainerMessageArea').html("FolderType: " + pFolderType);
                //let outsideFolderLink = (Number(pModelFolderId) !== Number(pFolderId));

                getFullImageDetails();
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

function getFullImageDetails() {
    var start = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/getFullImageDetails?folderId=" + pFolderId + "&linkId=" + pLinkId,
        success: function (imageInfo) {
            if (imageInfo.Success === "ok") {
                var delta = Date.now() - start;
                var minutes = Math.floor(delta / 60000);
                var seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("getFullImageDetails: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);

                pFolderType = imageInfo.FolderType;
                $('#aboveImageContainerMessageArea').html("pFolderType: " + pFolderType +
                    "  IsOutsideFolderLink: " + imageInfo.IsOutsideFolderLink);

                switch (imageInfo.FolderType) {
                    case "singleModelGallery":
                    case "singleModelFolderCollection":
                    case "singleModelCollection":
                        //$('#modelInfoDetails').show();
                        break;
                    case "assorterdFolderCollection":
                    case "assorterdImagesCollection":
                    case "assorterdImagesGallery":
                        $('#modelInfoDetails').hide();
                        if (!imageInfo.IsOutsideFolderLink) {
                            $('#ctxModelName').html("unknown model");
                            $('#ctxSeeMore').hide();
                        }
                        break;
                }

                //"<div id='ctxInfo' onclick='contextMenuAction(\"imageInfo\")'>Show Image info</div>\n" +
                //    "   <div id='imageInfoContainer' class='contextMenuInnerContainer'></div>\n" +

                $('#imageInfoContainer').html(
                    "<div><span class='ctxInfolabel'>file name</span><span id='imageInfoFileName' class='ctxInfoValue'></span></div>\n" +
                    "<div><span class='ctxInfolabel'>folder path</span><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>\n" +
                    "<div><span class='ctxInfolabel'>link id</span><span id='imageInfoLinkId' class='ctxInfoValue'></span></div>\n" +
                    "<div><span class='ctxInfolabel'>height</span><span id='imageInfoHeight' class='ctxInfoValue'></span></div>\n" +
                    "<div><span class='ctxInfolabel'>width</span><span id='imageInfoWidth' class='ctxInfoValue'></span></div>\n" +
                    "<div><span class='ctxInfolabel'>last modified</span><span id='imageInfoLastModified' class='ctxInfoValue'></span></div>\n" +
                    "<div><span class='ctxInfolabel'>external link</span><span id='imageInfoExternalLink' class='ctxInfoValue'></span></div>\n");

                $('#imageInfoFileName').html(imageInfo.FileName);
                $('#imageInfoFolderPath').html(imageInfo.FolderPath);
                $('#imageInfoLinkId').html(imageInfo.Link);
                $('#imageInfoHeight').html(imageInfo.Height);
                $('#imageInfoWidth').html(imageInfo.Width);
                $('#imageInfoLastModified').html(imageInfo.LastModified);
                $('#imageInfoExternalLink').html(imageInfo.ExternalLink);
                if (jQuery.isEmptyObject(imageInfo.InternalLinks)) {
                    $('#ctxShowLinks').hide();
                }
                else {
                    $('#ctxShowLinks').show();
                    $.each(imageInfo.InternalLinks, function (idx, obj) {
                        $('#linkInfoContainer').append("<div><a href='/album.html?folder=" + idx + "' target='_blank'>" + obj + "</a></div>");
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

function ctxGetFolderDetails() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/CatFolder/GetFolderInfo?folderId=" + pFolderId,
        success: function (folderDetails) {
            $('#imagePageLoadingGif').hide();
            if (folderDetails.Success === "ok") {
                folderInfo = folderDetails;
                //$('#oggleDialogTitle').html(folderDetails.FolderName);
                //$('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                ////$('#txtStatus').val(folderDetails.LinkStatus);
                $("#summernoteContainer").summernote("code", folderInfo.FolderComments);
                pFolderName = folderDetails.FolderName;
                //pModelFolderId = imageInfo.ModelFolderId;
                pFolderType = folderDetails.FolderType;
                $('#headerMessage').html("menu type: " + pMenuType);
                $('#contextMenuContent').html(contextMenuHtml()).hide();

                $('#ctxInfo').html("folder details");
                $('#ctxTags').html("folder tags");
                $('#ctxSeeMore').hide();
                $('#ctxShowLinks').hide();
                $('#contextMenuContent').fadeIn();
                $('#ctxModelName').html(folderDetails.FolderName);

                //alert("FolderTypeF: " + pFolderType);
                $('#aboveImageContainerMessageArea').html("FolderTypeF: " + pFolderType);

                //$('#imageInfoLinkId').html(imageInfo.LinkId);
                //$('#imageInfoInternalLink').html(imageInfo.Link);
                //$('#imageInfoFolderLocation').html(imageInfo.FolderLocation);
                //$('#imageInfoHeight').html(imageInfo.Height);
                //$('#imageInfoWidth').html(imageInfo.Width);
                //$('#imageInfoLastModified').html(imageInfo.LastModified);

                // alert("jQuery.isEmptyObject: " + jQuery.isEmptyObject(folderDetails.InternalLinks));
                if (jQuery.isEmptyObject(folderDetails.InternalLinks)) {
                    $('#ctxShowImageLinks').hide();
                }
                else {
                    $.each(folderDetails.InternalLinks, function (idx, obj) {
                        $('#otherLinksContainer').append("<div><a href='/album.html?folder=" + idx + "' target='_blank'>" + obj + "</a></div>");
                    });
                }
            }
            else {
                if (document.domain === "localhost") alert("folderDetails.Success: " + folderDetails.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 3,
                        ErrorMessage: folderDetails.Success,
                        CalledFrom: "ctxGetFolderDetails"
                    });
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404()) {
                if (document.domain === "localhost")
                    alert("ctxGetFolderDetails XHR: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "ctxGetFolderDetails"
                    });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS remove image", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + linkId + " Message: " + errorMessage);
            }
        }
    });
}

function contextMenuAction(action) {
    if (pMenuType === "Slideshow") {
        closeViewer("showImageCommentDialog");
    }
    switch (action) {
        case "showDialog": {
            if ($('#ctxModelName').html() === "unknown model") {
                showUnknownModelDialog(pLinkId);
            }
            else {
                if (isNullorUndefined(pModelFolderId)) {
                    //alert("showFolderInfoDialog pFolderId: " + pFolderId);
                    showFolderInfoDialog(pFolderId, "img ctx");
                }
                else {
                    //alert("showFolderInfoDialog pModelFolderId: " + pModelFolderId);
                    showFolderInfoDialog(pModelFolderId, "img ctx");
                }
            }
            $("#contextMenuContainer").fadeOut();
            break;
        }
        case "openInNewTab": {
            // rtpe(eventCode, calledFrom, eventDetail, pageId)
            rtpe("ONT", "context menu", pFolderName, pFolderId);
            break;
        }
        case "see more": {
            rtpe("SEE", pFolderId, pFolderName, pModelFolderId);
            break;
        }
        case "comment": {
            showImageCommentDialog(pLinkId, pImgSrc, pFolderId, "ImageContextMenu");
            $("#contextMenuContainer").fadeOut();
            break;
        }
        case "explode": {
            if (isLoggedIn()) {
                //rtpe(eventCode, calledFrom, eventDetail, pageId)
                rtpe("EXP", pFolderName, pImgSrc, pFolderId);
            }
            else {
                reportEvent("UNX", "", "", pFolderId);
                showMyAlert("You must be logged in to use this feature");
            }
            break;
        }
        case "Image tags":
        case "folder tags":
            openMetaTagDialog(pFolderId, pLinkId);
            break;
        case "imageInfo":
            $('#imageInfoContainer').toggle();
            break;
        case "showFolderLinks":
            $('#imageInfoContainer').toggle();
            break;
        case "showLinks":
            $('#linkInfoContainer').toggle();
            //showLinks(pLinkId);
            break;
        case "archive":
            showArchiveLinkDialog(pLinkId, pImgSrc);
            break;
        case "copy":
            showCopyLinkDialog(pLinkId, pFolderId, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "move":
            showMoveLinkDialog(pLinkId, pFolderId, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "rename":
            showRenameFolderDialog(pFolderId, pFolderName)
            break;
        case "remove":
            attemptRemoveLink(pLinkId, pFolderId);
            $("#imageContextMenu").fadeOut();
            break;
        case "setF":
            setFolderImage(pLinkId, pFolderId, "folder");
            break;
        case "setC":
            setFolderImage(pLinkId, pFolderId, "parent");
            break;
        default:
            if (document.domain === "localhost")
                alert("contextMenuAction Unhandeled switch case option.  Action: " + action);
            else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "BUG",
                    Severity: 2,
                    ErrorMessage: "contextMenuAction Unhandeled switch case option.  Action: " + action,
                    CalledFrom: "Album.js contextMenuAction"
                });
    }
}

function contextMenuHtml() {
    return "<div id='ctxModelName' onclick='contextMenuAction(\"showDialog\")'>model name</div>\n" +
        "<div id='ctxSeeMore' onclick='contextMenuAction(\"see more\")'>see more of her</div>\n" +
        "<div id='ctxNewTab' onclick='contextMenuAction(\"openInNewTab\")'>Open in new tab</div>\n" +
        "<div id='ctxComment' onclick='contextMenuAction(\"comment\")'>Comment</div>\n" +
        "<div id='ctxExplode' onclick='contextMenuAction(\"explode\")'>explode</div>\n" +

        "<div id='ctxShowLinks' onclick='contextMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "   <div id='linkInfoContainer' class='contextMenuInnerContainer'></div>\n" +

        "<div id='ctxInfo' onclick='contextMenuAction(\"imageInfo\")'>Show Image info</div>\n" +
        "   <div id='imageInfoContainer' class='contextMenuInnerContainer'></div>\n" +

        //"<div id='ctxTags' onclick='contextMenuAction(\"image tags\")'>image tags</div>\n" +
        "<div id='ctxDownLoad' onclick='contextMenuAction(\"download\")'>download folder</div>\n" +

        "<div id='ctxShowAdmin' class='adminLink' onclick='$(\"#linkAdminContainer\").toggle()'>Show Admin</div>\n" +
        "   <div id='linkAdminContainer' class='contextMenuInnerContainer'>\n" +
        "       <div onclick='contextMenuAction(\"archive\")'>Archive</div>\n" +
        "       <div onclick='contextMenuAction(\"copy\")'>Copy Link</div>\n" +
        "       <div onclick='contextMenuAction(\"move\")'>Move Image</div>\n" +
        "       <div onclick='contextMenuAction(\"remove\")'>Remove Link</div>\n" +
        "       <div onclick='contextMenuAction(\"setF\")'>Set as Folder Image</div>\n" +
        "       <div onclick='contextMenuAction(\"setC\")'>Set as Category Image</div>" +
        "   </div>\n";
}

