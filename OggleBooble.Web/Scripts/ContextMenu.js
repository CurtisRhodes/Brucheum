let pImgSrc, pLinkId, cxFolderId, pFolderName, pFolderType, pModelFolderId, pMenuType, pos = {};

function showContextMenu(menuType, pos, imgSrc, linkId, folderId, folderName) {
    event.preventDefault();
    window.event.returnValue = false;
    // logEvent("CXM", folderId, menuType, getCookieValue("VisitorId"));
    console.log("context menu opened: " + menuType);
    pLinkId = linkId;
    pImgSrc = imgSrc;
    cxFolderId = folderId;
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
    $('#ctxModelName').html("<img class='ctxloadingGif' src='Images/loader.gif'/>");
    $('#ctxMenuType').hide();
    $('#ctxNewTab').hide();
    $('#ctxImageShowLinks').hide();
    $('#ctxCloseSlideShow').hide();
    $('#ctxDownLoad').hide();
    $('#ctxSaveAs').hide();

    if (pMenuType === "Folder")
        ctxGetFolderDetails();
    else
        getLimitedImageDetails();

    $('.ogContextMenu').draggable();
    if (typeof pause === 'function') pause();
    if (isInRole("admin")) 
        $('.adminLink').show();
    else
        $('.adminLink').hide();
}

function getLimitedImageDetails() {
    //let start = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetLimitedImageDetail?folderId=" + cxFolderId + "&linkId=" + pLinkId,
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
                        if ((imageInfo.ModelFolderId !== 0) && (cxFolderId != imageInfo.ModelFolderId)) {
                            $('#ctxModelName').html(imageInfo.ModelFolderName);
                            $('#ctxSeeMore').show();
                        }
                        break;
                    default:
                        if (document.domain == "localhost") alert("folder type: " + folderType + " not found ");
                        logError("SWT", cxFolderId, "folder type: " + folderType, "getLimitedImageDetails");
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
                        if (document.domain == "localhost") alert("unhandled menu type: " + pMenuType);
                        logError("SWT", cxFolderId, "unhandled menu type: " + pMenuType, "getAlbumImages");
                }
                getFullImageDetails();
            }
            else {
                if (document.domain == "localhost") alert("getLimitedImageDetails: " + imageInfo.Success);
                logError("AJX", cxFolderId, imageInfo.Success, "getLimitedImageDetails");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = "getLimitedImageDetails"; //arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) {
                if (document.domain == "localhost") alert("getLimitedImageDetails: " + errMsg);
                logError("XHR", folderId, errMsg, functionName);
            }
        }
    });
}

function getFullImageDetails() {
    var start = Date.now();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Image/getFullImageDetails?folderId=" + cxFolderId + "&linkId=" + pLinkId,
            success: function (imageInfo) {
                if (imageInfo.Success === "ok") {

                    pModelFolderId = imageInfo.ModelFolderId;
                    if (imageInfo.ModelFolderId === 0) {
                        pModelFolderId = cxFolderId;
                    }

                    //pFolderType = imageInfo.FolderType;
                    // $('#aboveImageContainerMessageArea').html("pFolderType: " + pFolderType + "  IsOutsideFolderLink: " + imageInfo.IsOutsideFolderLink);

                    $('#imageInfoFileName').html(imageInfo.FileName);
                    $('#imageInfoFolderPath').html(imageInfo.FolderPath);
                    $('#imageInfoLinkId').val(imageInfo.Link);
                    $('#imageInfoHeight').html(imageInfo.Height);
                    $('#imageInfoWidth').html(imageInfo.Width);
                    $('#imageInfoSize').html(imageInfo.Size);
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
                    logError("AJX", cxFolderId, imageInfo.Success, "getFullImageDetails");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = "getFullImageDetails"; //arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) {
                    if (document.domain == "localhost") alert("getFullImageDetails: " + errMsg);
                    logError("XHR", cxFolderId, errMsg, functionName);
                }
            }
        });
    } catch (e) {
        if (document.domain == "localhost") alert("getFullImageDetails: " + e);
        logError("CAT", cxFolderId, e, getFullImageDetails);
    }
}

function ctxGetFolderDetails() {
    $('#ctxModelName').html("folder info");
    $('#ctxInfo').html("folder details");
    $('#ctxTags').html("folder tags");
    $('#ctxSeeMore').hide();
    $('#ctxNewTab').hide();
    $('#ctxImageShowLinks').hide();
    $('#ctxExplode').hide();
    $('#ctxSaveAs').hide();
}

function contextMenuAction(action) {
    switch (action) {
        case "saveAs":
           // alert("window.open(" + pImgSrc + ")");
            //window.open(pImgSrc);

            // <a href="data:application/xml;charset=utf-8,your code here" download="filename.html">Save</a>

            document.execCommand("SaveAs", null, "file.csv");

            // <a href="data:application/xml;charset=utf-8,your code here" download="filename.html">Save</a>
            break;
        case "download":
            if (isLoggedIn())
                alert("still working on this feature. Send site developer an email to request folder");
            else
                alert("You must be logged in to download an album");
            break;
        case "showDialog": {
            if ($('#ctxModelName').html() === "unknown model") {
                logEvent("UKM", cxFolderId, pMenuType, "details");
                showUnknownModelDialog(pImgSrc, pLinkId, cxFolderId);
            }
            else
                if (isNullorUndefined(pModelFolderId))
                    showFolderInfoDialog(cxFolderId, "img ctx");
                else
                    showFolderInfoDialog(pModelFolderId, "img ctx");
            $("#contextMenuContainer").fadeOut();
            break;
        }
        case "closeSlideShow":
            closeViewer("context menu");
            break;
        case "openInNewTab": {            
            rtpe("ONT", "context menu", pFolderName, cxFolderId);
            break;
        }
        case "see more": {
            rtpe("SEE", cxFolderId, pFolderName, pModelFolderId);
            break;
        }
        case "comment": {
            showImageCommentDialog(pLinkId, pImgSrc, cxFolderId, pMenuType);
            $("#contextMenuContainer").fadeOut();
            break;
        }
        case "explode": {
            // logEvent("EXP", cxFolderId, pFolderName, pLinkId);
            if (pMenuType === "Slideshow") {
                slideShowButtonsActive = false;
                $("#slideshowCtxMenuContainer").hide();
                blowupImage();
            }
            else {
                $("#imageContextMenu").hide();
                $("#contextMenuContainer").hide();
                replaceFullPage(pImgSrc);
            }
            break;
        }
        case "Image tags":
        case "folder tags":
            openMetaTagDialog(cxFolderId, pLinkId);
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
            showArchiveLinkDialog(pLinkId, cxFolderId, pImgSrc, pMenuType);
            break;
        case "copy":
            //alert("contextMenuAction/copy (pLinkId: " + pLinkId + ", cxFolderId: " + cxFolderId + ", pImgSrc: " + pImgSrc);
            showCopyLinkDialog(pLinkId, pMenuType, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "move":
            showMoveLinkDialog(pLinkId, cxFolderId, pMenuType, pImgSrc);
            $("#imageContextMenu").fadeOut();
            break;
        case "remove":
            $("#imageContextMenu").fadeOut();
            attemptRemoveLink(pLinkId, cxFolderId, pImgSrc);
            break;            
        case "delete":
            $("#imageContextMenu").fadeOut();
            deleteLink(pLinkId, cxFolderId, pImgSrc);
            break;
        case "reject":
            $("#imageContextMenu").fadeOut();
            showConfirmDeteteImageDialog(pLinkId, cxFolderId, pImgSrc, "single link");
            break;
        case "setF":
            setFolderImage(pLinkId, cxFolderId, "folder");
            break;
        case "setC":
            setFolderImage(pLinkId, cxFolderId, "parent");
            break;
        default: {
            logError("SWT", cxFolderId, "action: " + action, "contextMenuAction");
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
        "<div id='ctxSaveAs' onclick='contextMenuAction(\"saveAs\")'>save as</div>\n" +
        "<div id='ctxCloseSlideShow' onclick='contextMenuAction(\"closeSlideShow\")'>close slideshow</div>\n" +
        "<div id='ctxImageShowLinks' onclick='contextMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "<div id='linkInfoContainer' class='contextMenuInnerContainer'></div>\n" +        
        "<div id='ctxInfo' class='adminLink'  onclick='contextMenuAction(\"info\")'>Show Image info</div>\n" +
        " <div id='imageInfoContainer' class='contextMenuInnerContainer'>\n" +
        "   <div><span class='ctxInfolabel'>file name</span><span id='imageInfoFileName' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>folder path</span><span id='imageInfoFolderPath' class='ctxInfoValue'></span></div>\n" +
        "   <div><span class='ctxInfolabel'>link id</span><input id='imageInfoLinkId'/></div>\n" +
        "   <div><span class='ctxInfolabel'>height</span><span id='imageInfoHeight' class='ctxInfoValue'></span>" +
        "    <span class='ctxInfolabel'>width</span><span id='imageInfoWidth' class='ctxInfoValue'></span>" +
        "    <span class='ctxInfolabel'>size</span><span id='imageInfoSize' class='ctxInfoValue'></span></div>\n" +
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
        //"<div id='ctxDownLoad' onclick='contextMenuAction(\"download\")'>download folder</div>\n" +
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

