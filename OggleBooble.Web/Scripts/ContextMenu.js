let pImgSrc, pLinkId, pFolderId, pFolderName, pFolderType, pModelFolderId, pMenuType, pos = {};

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
    if (menuType === "Slideshow") {
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

    $('#ctxSeeMore').hide();
    $('#ctxModelName').html("<img class='ctxloadingGif' src='Images/loader.gif'/>");
    $('.ogContextMenu').draggable();

    if (pMenuType === "Folder")
        ctxGetFolderDetails();
    else
        getImageDetails();

    $('.adminLink').hide();
    if (isInRole("Oggle admin")) $('.adminLink').show();
}

$('.contextMenuContent').mouseover(function (e) {
    e.stopPropagation();
    alert("this: " + $(this));
    $(this).addClass('ogItemHover');
}).mouseout(function () {
    $(this).removeClass('ogItemHover');
});

function getImageDetails() {
    $('#ctxNewTab').hide();
    $('#ctxDownLoad').hide();

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetImageDetail?folderId=" + pFolderId + "&linkId=" + pLinkId,
        success: function (imageInfo) {
            if (imageInfo.Success === "ok") {
                pFolderLinkId = imageInfo.Link;
                pFolderName = imageInfo.FolderName;
                pModelFolderId = imageInfo.ModelFolderId;
                pFolderType = imageInfo.FolderType;
                $('#headerMessage').html("menu type: " + pMenuType);

                $('#aboveImageContainerMessageArea').html("FolderType: " + pFolderType);
                //if (pMenuType === "Slideshow") {
                //    alert("SS folderName: " + pFolderName +
                //        "\nModelFolderName: " + imageInfo.ModelFolderName +
                //        "\nFolderType: " + imageInfo.FolderType +
                //        "\nModelFolderId: " + imageInfo.ModelFolderId);
                //}
                $('#ctxModelName').html("unhandled");
                //alert("bug 1");
                if (Number(pModelFolderId) !== Number(pFolderId)) {
                    $('#ctxModelName').html(imageInfo.ModelFolderName);
                    $('#ctxSeeMore').show();
                }
                else {                    
                    if (pFolderType.indexOf("singleModel") > -1) {
                        $('#ctxModelName').html(pFolderName);
                        $('#ctxSeeMore').hide();
                    }
                    if (pFolderType.indexOf("assorterd") > -1) {
                        $('#ctxModelName').html("unknown model");
                        $('#ctxSeeMore').hide();
                    }
                }

                "   <label>file name</label><div id='imageInfoFileName' class='ctxInfoValue'></div>\n" +
                "   <label>folder path</label><div id='imageInfoFolderPath' class='ctxInfoValue'></div>\n" +
                "   <label>link id</label><div id='imageInfoLinkId' class='ctxInfoValue'></div>\n" +
                "   <label>height</label><div id='imageInfoHeight' class='ctxInfoValue'></div>\n" +
                "   <label>width</label><div id='imageInfoWidth' class='ctxInfoValue'></div>\n" +
                "   <label>last modified</label><div id='imageInfoLastModified' class='ctxInfoValue'></div>\n" +
                "   <label>external link</label><div id='imageInfoExternalLink' class='ctxInfoValue'></div>\n" +

                $('#imageInfoFileName').html(imageInfo.FileName);
                $('#imageInfoFolderPath').html(imageInfo.FolderPath);
                $('#imageInfoLinkId').html(imageInfo.LinkId);
                $('#imageInfoHeight').html(imageInfo.Height);
                $('#imageInfoWidth').html(imageInfo.Width);
                $('#imageInfoLastModified').html(imageInfo.LastModified);
                $('#imageInfoExternalLink').html(imageInfo.ExternalLink);
                if (jQuery.isEmptyObject(imageInfo.InternalLinks)) {
                    $('#ctxShowLinks').hide();
                }
                else {
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
    switch (action) {
        case "showDialog":
            if ($('#ctxModelName').html() === "unknown model") {
                showUnknownModelDialog(pLinkId);
            }
            else 
                if (pMenuType === "Folder")
                    ctxgetFolderDetails();
                else
                    showFolderInfoDialog(pModelFolderId, "img ctx");
            $("#contextMenuContainer").fadeOut();
            break;
        case "openInNewTab":
            // rtpe(eventCode, calledFrom, eventDetail, pageId)
            rtpe("ONT", "context menu", pFolderName, pFolderId);
            break;
        case "see more":
            rtpe("SEE", pFolderId, pFolderName, pModelFolderId);
            break;
        case "comment":
            if (pFolderType.indexOf("singleModel") > -1) {
                showImageCommentDialog(pLinkId, pImgSrc, pFolderId, "ImageContextMenu");
            }
            if (pFolderType.indexOf("assorterd") > -1) {
                showFolderCommentDialog(pFolderId);
            }
            $("#contextMenuContainer").fadeOut();
            break;
        case "explode":
            if (isLoggedIn()) {
                //rtpe(eventCode, calledFrom, eventDetail, pageId)
                rtpe("EXP", pFolderName, pImgSrc, pFolderId);
            }
            else {
                reportEvent("UNX", "", "", pFolderId);
                showMyAlert("You must be logged in to use this feature");
            }
            break;
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
            showMoveCopyDialog("Archive", pLinkId, pFolderId);
            break;
        case "copy":
            showCopyLinkDialog(pLinkId, pFolderId);
            $("#imageContextMenu").fadeOut();
            break;
        case "move":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Move", pLinkId, pFolderId);
            break;
        case "remove":
            $("#imageContextMenu").fadeOut();
            removeImage();
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

function showFolderCommentDialog() {

    var visitorId = getCookieValue("VisitorId");

    alert("showFolderCommentDialog()");

}

//function showLinks(pLinkId) {
//    reportEvent("SHL", "show Image links", pFolderName, pFolderId)
//}

function contextMenuHtml() {
    //"<div id='contextMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
    //"   <div id='contextMenuContent'></div>\n" +
    //"</div>\n" +
    return "<div id='ctxModelName' onclick='contextMenuAction(\"showDialog\")'>model name</div>\n" +
        "<div id='ctxSeeMore' onclick='contextMenuAction(\"see more\")'>see more of her</div>\n" +
        "<div id='ctxNewTab' onclick='contextMenuAction(\"openInNewTab\")'>Open in new tab</div>\n" +
        "<div id='ctxComment' onclick='contextMenuAction(\"comment\")'>Comment</div>\n" +
        "<div id='ctxExplode' onclick='contextMenuAction(\"explode\")'>explode</div>\n" +
        "<div id='ctxShowLinks' onclick='contextMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "   <div id='linkInfoContainer' class='innerContextMenuContainer'></div>\n" +
        "<div id='ctxInfo' onclick='contextMenuAction(\"imageInfo\")'>Show Image info</div>\n" +
        "<div id='imageInfoContainer' class='contextMenuInnerContainer'>\n" +
        "   <label>file name</label><div id='imageInfoFileName' class='ctxInfoValue'></div><br/>\n" +
        "   <label>folder path</label><div id='imageInfoFolderPath' class='ctxInfoValue'></div><br/>\n" +
        "   <label>link id</label><div id='imageInfoLinkId' class='ctxInfoValue'></div><br/>\n" +
        "   <label>height</label><div id='imageInfoHeight' class='ctxInfoValue'></div><br/>\n" +
        "   <label>width</label><div id='imageInfoWidth' class='ctxInfoValue'></div><br/>\n" +
        "   <label>last modified</label><div id='imageInfoLastModified' class='ctxInfoValue'></div><br/>\n" +
        "   <label>external link</label><div id='imageInfoExternalLink' class='ctxInfoValue'></div><br/>\n" +
        "</div>\n" +
        "<div id='ctxTags' onclick='contextMenuAction(\"image tags\")'>image tags</div>\n" +
        "<div id='ctxDownLoad' onclick='contextMenuAction(\"download\")'>download folder</div>\n" +

        "<div class='adminLink' onclick='contextMenuAction(\"archive\")'>Archive</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"copy\")'>Copy Link</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"move\")'>Move Image</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"remove\")'>Remove Link</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"setF\")'>Set as Folder Image</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"setC\")'>Set as Category Image</div>\n";
}

