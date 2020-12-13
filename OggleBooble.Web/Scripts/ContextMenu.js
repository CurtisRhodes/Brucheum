let pImgSrc, pLinkId, pFolderId, pFolderName, pFolderType, pModelFolderId, pMenuType, pos = {};

function showContextMenu(menuType, pos, imgSrc, linkId, folderId, folderName) {
    event.preventDefault();
    window.event.returnValue = false;
    // logEvent("CXM", folderId, menuType, getCookieValue("VisitorId"));
    console.log("context menu opened: " + menuType);
    pLinkId = linkId;
    pImgSrc = imgSrc;
    pFolderId = folderId;
    pFolderName = folderName;
    pMenuType = menuType;
    if (pMenuType === "Slideshow") {
        $('#slideshowCtxMenuContainer').css("top", pos.y);
        $('#slideshowCtxMenuContainer').css("left", pos.x);
        $('#slideshowCtxMenuContainer').fadeIn();
        $('#slideshowContextMenuContent').html(contextMenuHtml())
    }
    else {
        let y = pos.y - $(window).scrollTop();
        $('#contextMenuContainer').css("top", y);
        $('#contextMenuContainer').css("left", pos.x);
        $('#contextMenuContainer').fadeIn();
        $('#contextMenuContent').html(contextMenuHtml())
    }

    if (pMenuType === "Folder")
        ctxGetFolderDetails();
    else
        getLimitedImageDetails();

    $('.ogContextMenu').draggable();
    if (typeof pause === 'function') pause();
    if (isInRole("admin")) $('.adminLink').show();
}

function getLimitedImageDetails() {
    $('#ctxMenuType').hide();
    $('#ctxNewTab').hide();
    $('#ctxImageShowLinks').hide();
    $('#ctxCloseSlideShow').hide();
    $('#ctxDownLoad').hide();
    $('#ctxModelName').html("<img class='ctxloadingGif' src='Images/loader.gif'/>");
    //let start = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetLimitedImageDetail?folderId=" + pFolderId + "&linkId=" + pLinkId,
        success: function (imageInfo) {

            //var delta = Date.now() - start;
            //var minutes = Math.floor(delta / 60000);
            //var seconds = (delta % 60000 / 1000).toFixed(0);
            //console.log("getLimitedImageDetails: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);

            if (imageInfo.Success === "ok") {
                let folderType = imageInfo.FolderType;
                switch (folderType) {
                    case "singleModel":
                    case "singleChild":
                    case "singleParent":
                        $('#ctxModelName').html(imageInfo.FolderName);
                        $('#ctxSeeMore').hide();
                        break;
                    case "multiModel":
                    case "multiFolder":
                        $('#ctxSeeMore').hide();
                        $('#ctxModelName').html("unknown model");
                        if ((imageInfo.ModelFolderId !== 0) && (pFolderId != imageInfo.ModelFolderId)) {
                            $('#ctxModelName').html(imageInfo.ModelFolderName);
                            $('#ctxSeeMore').show();
                        }
                        break;
                    default:
                        logError("SWT", apFolderId, "folder type: " + albumImageInfo.FolderType, "getAlbumImages");
                }

                //$('#ctxMenuType').html(pMenuType).show();
                //$('#ctxModelName').html(imageInfo.FolderType);
                switch (pMenuType) {
                    case "Slideshow":
                        //$('#ctxMenuType').html(pMenuType).show();
                        $('#ctxCloseSlideShow').show();
                        break;
                    case "Carousel":
                        $('#ctxNewTab').show();
                        break;
                    case "Image":
                        //$('#ctxModelName').html(imageInfo.FolderName);
                        break;
                    case "Video":
                        break;
                    default:
                        logError("SWT", apFolderId, "unhandled menu type: " + pMenuType, "getAlbumImages");
                }
                getFullImageDetails();
            }
            else {
                logError("AJX", pFolderId, imageInfo.Success, "getLimitedImageDetails");
            }
        },
        error: function (xhr) {
            if (!checkFor404("getLimitedImageDetails")) logError("XHR", pFolderId, getXHRErrorDetails(jqXHR), "getLimitedImageDetails");
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

                pModelFolderId = imageInfo.ModelFolderId;
                if (imageInfo.ModelFolderId === 0) {
                    pModelFolderId = pFolderId;
                }

                //pFolderType = imageInfo.FolderType;
                // $('#aboveImageContainerMessageArea').html("pFolderType: " + pFolderType + "  IsOutsideFolderLink: " + imageInfo.IsOutsideFolderLink);

                $('#imageInfoFileName').html(imageInfo.FileName);
                $('#imageInfoFolderPath').html(imageInfo.FolderPath);
                $('#imageInfoLinkId').val(imageInfo.Link);
                $('#imageInfoHeight').html(imageInfo.Height);
                $('#imageInfoWidth').html(imageInfo.Width);
                $('#imageInfoLastModified').html(imageInfo.LastModified);
                $('#imageInfoExternalLink').html(imageInfo.ExternalLink);

                if (!jQuery.isEmptyObject(imageInfo.InternalLinks)) {
                    $('#ctxImageShowLinks').show();
                    $.each(imageInfo.InternalLinks, function (idx, obj) {
                        $('#linkInfoContainer').append("<div><a href='/album.html?folder=" + idx + "' target='_blank'>" + obj + "</a></div>");
                    });
                }

                var delta = Date.now() - start;
                var minutes = Math.floor(delta / 60000);
                var seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("getFullImageDetails: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
            }
            else {
                logError("AJX", pFolderId, imageInfo.Success, "getFullImageDetails");
            }
        },
        error: function (xhr) {
            if (!checkFor404("getFullImageDetails")) {
                logError("XHR", pFolderId, getXHRErrorDetails(jqXHR), "getFullImageDetails");
            }
        }
    });
}

function ctxGetFolderDetails() {
    $('#ctxModelName').html("folder info");
    $('#ctxInfo').html("folder details");
    $('#ctxTags').html("folder tags");
    $('#ctxSeeMore').hide();
    $('#ctxNewTab').hide();
    $('#ctxImageShowLinks').hide();
    $('#ctxExplode').hide();
}

function contextMenuAction(action) {
    switch (action) {
        case "download":
            if (isLoggedIn())
                alert("still working on this feature. Send site developer an email to request folder");
            else
                alert("You must be logged in to download an album");
            break;
        case "showDialog": {
            if ($('#ctxModelName').html() === "unknown model") {
                logEvent("UKM", pFolderId, pMenuType, "details");
                showUnknownModelDialog(pImgSrc, pLinkId, pFolderId);
            }
            else
                if (isNullorUndefined(pModelFolderId))
                    showFolderInfoDialog(pFolderId, "img ctx");
                else
                    showFolderInfoDialog(pModelFolderId, "img ctx");
            $("#contextMenuContainer").fadeOut();
            break;
        }
        case "closeSlideShow":
            closeViewer("context menu");
            break;
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
            logEvent("EXP", pFolderId, pFolderName, pLinkId);
            window.open(pImgSrc, "_blank");
            break;
        }
        case "Image tags":
        case "folder tags":
            openMetaTagDialog(pFolderId, pLinkId);
            break;
        case "info":
            if (pMenuType === "Folder")
                $('#folderInfoContainer').toggle();
            else
                $('#imageInfoContainer').toggle();
            break;
        case "showLinks":
            $('#linkInfoContainer').toggle();
            break;
        case "archive":
            showArchiveLinkDialog(pLinkId, pFolderId, pImgSrc, pMenuType);
            break;
        case "copy":
            //alert("contextMenuAction/copy (pLinkId: " + pLinkId + ", pFolderId: " + pFolderId + ", pImgSrc: " + pImgSrc);
            showCopyLinkDialog(pLinkId, pMenuType, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "move":
            showMoveLinkDialog(pLinkId, pFolderId, pMenuType, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "rename":
            $("#imageContextMenu").fadeOut();
            showRenameFolderDialog(pFolderId, pFolderName)
            break;
        case "remove":
            $("#imageContextMenu").fadeOut();
            attemptRemoveLink(pLinkId, pFolderId, pImgSrc);
            break;            
        case "delete":
            $("#imageContextMenu").fadeOut();
            deleteLink(pLinkId, pFolderId, pImgSrc);
            break;
        case "reject":
            $("#imageContextMenu").fadeOut();
            showConfirmDeteteImageDialog(pLinkId, pFolderId, pImgSrc, "single link");
            break;
        case "setF":
            setFolderImage(pLinkId, pFolderId, "folder");
            break;
        case "setC":
            setFolderImage(pLinkId, pFolderId, "parent");
            break;
        default: {
            logError("SWT", pFolderId, "action: " + action, "contextMenuAction");
        }
    }
}

function contextMenuHtml() {
    return "<div id='ctxMenuType' class='contextMenuInnerContainer'></div>\n" +        
        "<div id='ctxModelName' onclick='contextMenuAction(\"showDialog\")'>model name</div>\n" +
        "<div id='ctxSeeMore' onclick='contextMenuAction(\"see more\")'>see more of her</div>\n" +
        "<div id='ctxNewTab' onclick='contextMenuAction(\"openInNewTab\")'>Open in new tab</div>\n" +
        "<div id='ctxComment' onclick='contextMenuAction(\"comment\")'>Comment</div>\n" +
        "<div id='ctxExplode' onclick='contextMenuAction(\"explode\")'>explode</div>\n" +
        "<div id='ctxCloseSlideShow' onclick='contextMenuAction(\"closeSlideShow\")'>close slideshow</div>\n" +
        "<div id='ctxImageShowLinks' onclick='contextMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "<div id='linkInfoContainer' class='contextMenuInnerContainer'></div>\n" +        
        "<div id='ctxInfo' onclick='contextMenuAction(\"info\")'>Show Image info</div>\n" +
        " <div id='imageInfoContainer' class='contextMenuInnerContainer'>\n" +
        "   <div><span class='ctxInfolabel'>file name</span><span id='imageInfoFileName' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>folder path</span><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>link id</span><input id='imageInfoLinkId'/></div>\n" +
        "   <div><span class='ctxInfolabel'>height</span><span id='imageInfoHeight' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>width</span><span id='imageInfoWidth' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>last modified</span><span id='imageInfoLastModified' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>external link</span><span id='imageInfoExternalLink' class='ctxInfoValue'></span></div>\n"+
        " </div>\n"+
        " <div id='folderInfoContainer' class='contextMenuInnerContainer'>\n" +
        "   <div><span class='ctxInfolabel'>file name</span><span id='folderInfoFileName' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>folder id</span><span id='folderInfoId' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>folder path</span><span id='folderInfoPath' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>files</span><span id='folderInfoFileCount' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>subfolders</span><span id='folderInfoSubDirsCount' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>last modified</span><span id='folderInfoLastModified' class='ctxInfoValue'></span></div>\n" +
        " </div>\n" +
        "<div id='ctxDownLoad' onclick='contextMenuAction(\"download\")'>download folder</div>\n" +
        "<div id='ctxShowAdmin' class='adminLink' onclick='$(\"#linkAdminContainer\").toggle()'>Admin</div>\n" +
        " <div id='linkAdminContainer' class='contextMenuInnerContainer'>\n" +
        "   <div onclick='contextMenuAction(\"archive\")'>Archive</div>\n" +
        "   <div onclick='contextMenuAction(\"copy\")'>Copy Link</div>\n" +
        "   <div onclick='contextMenuAction(\"move\")'>Move Image</div>\n" +
        "   <div onclick='contextMenuAction(\"remove\")'>Remove Link</div>\n" +
        "   <div onclick='contextMenuAction(\"reject\")'>Move to Rejects</div>\n" +
        //"   <div onclick='contextMenuAction(\"delete\")'>Delete Image</div>\n" +
        "   <div onclick='contextMenuAction(\"setF\")'>Set as Folder Image</div>\n" +
        "   <div onclick='contextMenuAction(\"setC\")'>Set as Category Image</div>" +
        " </div>\n";
}

