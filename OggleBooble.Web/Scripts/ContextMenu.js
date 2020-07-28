let pImgSrc, pLinkId, pFolderId, pFolderName, pFolderType, pModelFolderId, pMenuType, pos = {};

function showContextMenu(menuType, pos, imgSrc, linkId, folderId, folderName) {
    event.preventDefault();
    window.event.returnValue = false;
    logEvent("CXM", folderId, menuType, folderName);
    pLinkId = linkId;
    pImgSrc = imgSrc;
    pFolderId = folderId;
    pFolderName = folderName;
    pMenuType = menuType;
   
    $('#aboveImageContainerMessageArea').html("pMenuType: " + pMenuType);
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
    if (pMenuType === "Folder")
        ctxGetFolderDetails();
    else
        getLimitedImageDetails();
    $('.ogContextMenu').draggable();
    if (typeof pause === 'function') pause();
    if (isInRole("ADM")) $('.adminLink').show();
}

$('.contextMenuContent').mouseover(function (e) {
    e.stopPropagation();
    alert("mouseover: ");
    //$(this).addClass('ogItemHover');
}).mouseout(function () {
    $(this).removeClass('ogItemHover');
});

function getLimitedImageDetails() {
    //$('#ctxNewTab').hide();
    $('#ctxImageShowLinks').hide();
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

                $('#ctxModelName').html(imageInfo.FolderType);

                let folderType = imageInfo.FolderType;
                switch (folderType) {
                    case "singleModel":
                    case "singleChild":
                    case "singleParent":
                        $('#ctxModelName').html(imageInfo.ModelFolderName);
                        $('#ctxSeeMore').hide();
                        break;
                    case "multiModel":
                    case "multiFolder":
                        $('#ctxSeeMore').hide();
                        $('#ctxModelName').html("unidenitified");
                        if ((imageInfo.ModelFolderId !== 0) && (pFolderId != imageInfo.ModelFolderId)) {
                            $('#ctxModelName').html(imageInfo.ModelFolderName);
                            $('#ctxSeeMore').show();
                        }
                        break;
                    default:
                        logError("SWT", apFolderId, "folder tpe: " + albumImageInfo.FolderType, "getAlbumImages");
                }
                switch (pMenuType) {
                    case "Slideshow":
                    case "Carousel":
                    case "Image":
                    case "Folder":
                    default:
                }

                getFullImageDetails();
            }
            else {
                logError("BUG", pFolderId, imageInfo.Success, "getLimitedImageDetails");
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

                //pFolderType = imageInfo.FolderType;
                // $('#aboveImageContainerMessageArea').html("pFolderType: " + pFolderType + "  IsOutsideFolderLink: " + imageInfo.IsOutsideFolderLink);
                //switch (imageInfo.FolderType) {
                //    case "singleModelGallery":
                //    case "singleModelFolderCollection":
                //    case "singleModelCollection":
                //    case "assorterdFolderCollection":
                //    case "assorterdImagesCollection":
                //    case "assorterdImagesGallery":
                //        break;
                //}


                $('#imageInfoFileName').html(imageInfo.FileName);
                $('#imageInfoFolderPath').html(imageInfo.FolderPath);
                $('#imageInfoLinkId').html(imageInfo.Link);
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
                logError("BUG", pFolderId, imageInfo.Success, "getFullImageDetails");
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
    
                    //"<div id='folderInfoContainer' class='contextMenuInnerContainer'>\n" +
                    //"   <div><span class='ctxInfolabel'>file name</span><span id='folderInfoFileName' class='ctxInfoValue'></span></div>\n" +
                    //"   <div><span class='ctxInfolabel'>folder id</span><span id='folderInfoId' class='ctxInfoValue'></span></div>\n" +
                    //"   <div><span class='ctxInfolabel'>folder path</span><span id='folderInfoPath' class='ctxInfoValue'></span></div>\n" +
                    //"   <div><span class='ctxInfolabel'>files</span><span id='folderInfoFileCount' class='ctxInfoValue'></span></div>\n" +
                    //"   <div><span class='ctxInfolabel'>subfolders</span><span id='folderInfoSubDirsCount' class='ctxInfoValue'></span></div>\n" +
                    //"   <div><span class='ctxInfolabel'>last modified</span><span id='folderInfoLastModified' class='ctxInfoValue'></span></div>\n" +
                    //"</div>\n" +

    //alert("pMenuType: " + pMenuType);
    //$.ajax({
    //    type: "GET",
    //    url: settingsArray.ApiServer + "api/CatFolder/GetFolderInfo?folderId=" + pFolderId,
    //    success: function (folderDetails) {
    //        $('#imagePageLoadingGif').hide();
    //        if (folderDetails.Success === "ok") {
    //            folderInfo = folderDetails;
    //            $('#ctxModelName').html(pFolderName);
    //            //pModelFolderId = imageInfo.ModelFolderId;
    //            pFolderType = folderDetails.FolderType;
    //            //$('#headerMessage').html("menu type: " + pMenuType);

    //            $('#contextMenuContent').fadeIn();

    //            if (jQuery.isEmptyObject(folderDetails.InternalLinks)) {
    //                $('#ctxShowImageLinks').hide();
    //            }
    //            else {
    //                $.each(folderDetails.InternalLinks, function (idx, obj) {
    //                    $('#otherLinksContainer').append("<div><a href='/album.html?folder=" + idx + "' target='_blank'>" + obj + "</a></div>");
    //                });
    //            }
    //        }
    //        else {
    //            logError("BUG", pFolderId, folderDetails.Success, "ctxGetFolderDetails");
    //        }
    //    },
    //    error: function (xhr) {
    //        if (!checkFor404("ctxGetFolderDetails")) {
    //            logError("XHR", pFolderId, getXHRErrorDetails(jqXHR), "ctxGetFolderDetails");
    //        }
    //    }
    //});
}

function contextMenuAction(action) {
    switch (action) {
        case "showDialog": {
            if ($('#ctxModelName').html() === "unknown model")
                showUnknownModelDialog(pLinkId, pImgSrc);
            else
                showFolderInfoDialog(pModelFolderId, "img ctx");
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
          //rtpe(eventCode, calledFrom, eventDetail, pageId)
            //rtpe("EXP", pFolderName, pImgSrc, pFolderId);
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
            showArchiveLinkDialog(pLinkId, pFolderId, pImgSrc);
            break;
        case "copy":
            alert("contextMenuAction/copy (pLinkId: " + pLinkId + ", pFolderId: " + pFolderId + ", pImgSrc: " + pImgSrc);
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
            attemptRemoveLink(pLinkId, pFolderId, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "setF":
            setFolderImage(pLinkId, pFolderId, "folder");
            break;
        case "setC":
            setFolderImage(pLinkId, pFolderId, "parent");
            break;
        default: {
            logError("BUG", pFolderId, "Unhandeled switch Action: " + action, "contextMenuAction");
        }
    }
}

function contextMenuHtml() {
    return "<div id='ctxModelName' onclick='contextMenuAction(\"showDialog\")'>model name</div>\n" +
        "<div id='ctxSeeMore' onclick='contextMenuAction(\"see more\")'>see more of her</div>\n" +
        "<div id='ctxNewTab' onclick='contextMenuAction(\"openInNewTab\")'>Open in new tab</div>\n" +
        "<div id='ctxComment' onclick='contextMenuAction(\"comment\")'>Comment</div>\n" +
        "<div id='ctxExplode' onclick='contextMenuAction(\"explode\")'>explode</div>\n" +
        "<div id='ctxImageShowLinks' onclick='contextMenuAction(\"showLinks\")'>Show Links</div>\n" +
        " <div id='linkInfoContainer' class='contextMenuInnerContainer'></div>\n" +        
        "<div id='ctxInfo' onclick='contextMenuAction(\"info\")'>Show Image info</div>\n" +
        " <div id='imageInfoContainer' class='contextMenuInnerContainer'>\n" +
        "   <div><span class='ctxInfolabel'>file name</span><span id='imageInfoFileName' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>folder path</span><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>link id</span><span id='imageInfoLinkId' class='ctxInfoValue'></span></div>\n" +
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
        "<div id='ctxShowAdmin' class='adminLink' onclick='$(\"#linkAdminContainer\").toggle()'>Show Admin</div>\n" +
        " <div id='linkAdminContainer' class='contextMenuInnerContainer'>\n" +
        "   <div onclick='contextMenuAction(\"archive\")'>Archive</div>\n" +
        "   <div onclick='contextMenuAction(\"copy\")'>Copy Link</div>\n" +
        "   <div onclick='contextMenuAction(\"move\")'>Move Image</div>\n" +
        "   <div onclick='contextMenuAction(\"remove\")'>Remove Link</div>\n" +
        "   <div onclick='contextMenuAction(\"setF\")'>Set as Folder Image</div>\n" +
        "   <div onclick='contextMenuAction(\"setC\")'>Set as Category Image</div>" +
        " </div>\n";
}

