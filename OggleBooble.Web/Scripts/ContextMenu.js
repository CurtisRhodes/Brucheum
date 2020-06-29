var pImgSrc,
    pLinkId,
    pFolderId,
    pFolderName,
    pFolderType,
    pModelFolderId,
    pMenuType;
let pos = {};


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

    //"<div id='contextMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
    //"   <div id='contextMenuContent' class='modalContentStyle'></div>\n" +
    //"</div>\n" +

    //positionContextMenu();

    $('#contextMenuContainer').css("top", pos.y);
    $('#contextMenuContainer').css("left", pos.x);
    $('#contextMenuContent').html("<img class='loadingGif' src='Images/loader.gif'/>");
    $('#contextMenuContainer').fadeIn();
    $('#ctxModelName').html(folderName);

    if (menuType !== "Folder")
        getImageDetails();

    $('.adminLink').hide();
    //if (isInRole("Oggle admin")) $('.adminLink').show();
}

$('.contextMenuContent').mouseover(function (e) {
    e.stopPropagation();
    alert("this: " + $(this));
    $(this).addClass('ogItemHover');
}).mouseout(function () {
    $(this).removeClass('ogItemHover');
});
    
function contextMenuHtml() {
    let contextMenuItems =
        "<div id='ctxModelName' onclick='contextMenuAction(\"showDialog\")'>model name</div>\n" +
        "<div id='ctxSeeMore' onclick='contextMenuAction(\"see more\")'>see more of her</div>\n" +
        "<div id='ctxNewTab' onclick='contextMenuAction(\"openInNewTab\")'>Open in new tab</div>\n" +
        "<div id='ctxComment' onclick='contextMenuAction(\"comment\")'>Comment</div>\n" +
        "<div id='ctxExplode' onclick='contextMenuAction(\"explode\")'>explode</div>\n" +
        "<div id='ctxShowLinks' onclick='contextMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "<div id='linkInfoContainer' class='innerContextMenuContainer'>\n" +
        "</div>\n" +
        "<div id='ctxInfo' onclick='imageCtxMenuAction(\"imageInfo\")'>Show Image info</div>\n" +
        "<div id='imageInfoContainer' class='contextMenuInnerContainer'>\n" +
        "   <label>file name</label><div id='imageInfoExternalLink' class='ctxInfoValue'></div>\n" +
        "   <label>folder path</label><div id='imageInfoExternalLink' class='ctxInfoValue'></div>\n" +
        "   <label>weight</label><div id='imageInfoHeight' class='ctxInfoValue'></div>\n" +
        "   <label>width</label><div id='imageInfoWidth' class='ctxInfoValue'></div>\n" +
        "   <label>last modified</label><div id='imageInfoLastModified' class='ctxInfoValue'></div>\n" +
        "   <label>external link</label><div id='imageInfoExternalLink' class='ctxInfoValue'></div>\n" +
        "   <label>folder path</label><div id='imageInfoExternalLink' class='ctxInfoValue'></div>\n" +
        "</div>\n" +
        "<div id='ctxTags' onclick='carouselContextMenuAction(\"image tags\")'>image tags</div>\n" +
        "<div id='ctxDownLoad' onclick='contextMenuAction(\"download\")'>download folder</div>\n" +

        "<div class='adminLink' onclick='contextMenuAction(\"archive\")'>Archive</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"copy\")'>Copy Link</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"move\")'>Move Image</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"remove\")'>Remove Link</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"setF\")'>Set as Folder Image</div>\n" +
        "<div class='adminLink' onclick='contextMenuAction(\"setC\")'>Set as Category Image</div>\n";
    return contextMenuItems;
}

function positionContextMenu() {
    if (viewerShowing) {
        $('#imageContextMenu').css("top", event.clientY + 5);
        $('#imageContextMenu').css("left", event.clientX);
    }
    else {
        var thisImageDiv = $('#' + linkId + '');
        var picpos = thisImageDiv.offset();
        var picLeft = Math.max(0, picpos.left + thisImageDiv.width() - $('#imageContextMenu').width() - 50);
        $('#imageContextMenu').css("top", picpos.top + 5);
        $('#imageContextMenu').css("left", picLeft);

        $('#contextMenuContainer').css("top", picpos.top + thisImageDiv.height());
        $('#contextMenuContainer').css("left", picLeft);

    }
}

function getImageDetails() {
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
                $('#contextMenuContent').html(contextMenuHtml()).hide();
                switch (pMenuType) {
                    case "Slideshow":
                        break;
                    case "Carousel":
                        break;
                    case "Image":
                        $('#ctxNewTab').hide();
                        $('#ctxDownLoad').hide();
                        break;
                    case "Folder":
                        $('#ctxInfo').html("folder details");
                        $('#ctxTags').html("folder tags");
                        $('#ctxSeeMore').hide();
                        break;
                }
                $('#contextMenuContent').fadeIn();

                $('#aboveImageContainerMessageArea').html("FolderType: " + pFolderType);

                if (Number(imageInfo.ModelFolderId) !== Number(pFolderId)) {
                    $('#ctxModelName').html(imageInfo.ModelFolderName);
                }
                else {                    
                    if (imageInfo.FolderType.indexOf("singleModel") > -1) {
                        $('#ctxModelName').html(imageInfo.FolderName);
                    }
                    if (imageInfo.FolderType.indexOf("assorterd") > -1) {
                        $('#ctxModelName').html("unknown model");
                        $('#ctxSeeMore').hide();
                    }
                }



                $('#imageInfoLinkId').html(imageInfo.LinkId);
                $('#imageInfoInternalLink').html(imageInfo.Link);
                $('#imageInfoFolderLocation').html(imageInfo.FolderLocation);
                //api/Image/GetImageDetail
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

function contextMenuAction(action) {
    switch (action) {
        case "showDialog":
            $("#contextMenuContainer").fadeOut();
            //if (pMenuType === "Folder")
            //showModelInfoDialog(pFolderId, pFolderId, pImgSrc);
            //else
            showFolderInfoDialog(pModelFolderId, "img ctx");
            break;
        case "openInNewTab":
            // rtpe(eventCode, calledFrom, eventDetail, pageId)
            rtpe("ONT", "context menu", pFolderName, pFolderId);
            break;
        case "see more":
            rtpe("SEE", pFolderId, pFolderName, pModelFolderId);
            break;
        case "comment":
            $("#contextMenuContainer").fadeOut();
            if (pMenuType === "Folder")
                showImageCommentDialog(pImgSrc, pLinkId, pFolderId, pFolderName, "ImageContextMenu");
            else
                showFolderCommentDialog(albumFolderId);
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
            $('#imageCtxMenuInfo').toggle();
            break;
        case "showFolderLinks":
            break;
        case "showLinks":
            showLinks(pLinkId);
            reportEvent("SHL", "show Image links", pFolderName, pFolderId)
            $('#linkInfoContainer').toggle();
            break;
        case "archive":
            showMoveCopyDialog("Archive", pLinkId, pFolderId);
            break;
        case "copy":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", pLinkId, albumFolderId);
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

function showLinks(pLinkId) {


}

