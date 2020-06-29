var selectedImage,
    pImgSrc,
    pLinkId,
    pFolderId,
    folderName,
    modelFolderId;

//showImageCommentDialog(, "ImageContextMenu");

function showImageContextMenu(imgSrc, linkId, folderId, folderName) {
    //alert("image context menu");
    event.preventDefault();
    window.event.returnValue = false;

    folderName = currentAlbumJSfolderName;
    pLinkId = linkId;
    pImgSrc = imgSrc;
    pFolderId = folderId;
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

function showFolderContextMenu(folderId) {
    //alert("folder context menu");
    event.preventDefault();
    window.event.returnValue = false;
    $('#imageContextMenuContainer').html(folderContextMenuHtml());
    var thisImageDiv = $('#' + imgId + '');
    var picpos = thisImageDiv.offset();
    var picLeft = Math.max(0, picpos.left + thisImageDiv.width() - $('#folderContextMenu').width() - 50);
    $('#folderContextMenu').css("top", picpos.top + thisImageDiv.height());
    $('#folderContextMenu').css("left", picLeft);
    $('#folderLinkInfo').hide();

    $('.adminLink').hide();
    //if (isInRole("Oggle admin")) {
    //    $('.adminLink').show();
    //    alert("$('.adminLink').show();" );
    //}
    $('#folderContextMenu').show();
}

function showCarouselContextMenu(folderName) {
    pause();
    event.preventDefault();
    window.event.returnValue = false;
    $('#carouselContextMenu').html(carouselContextMenuHTML());
    $('#carouselContextMenu').css("top", event.clientY + 5);
    $('#carouselContextMenu').css("left", event.clientX);
    $('#ctxModelName').html(folderName);
    $('#carouselContextMenu').fadeIn();
}

function contextMenuAction(action) {
    switch (action) {
        //sendEmailToYourself("error in album.js contextMenuAction ", "Unhandeled switch case option.  Action: " + action);
        //alert("contextMenuAction action: " + action);

        //"showDialog\")'>model name</div>\n" +
        //"openInNewTab\")'>Open in new tab</div>\n" +
        //"explode\")'>Explode</div>\n" +
        //"comment\")'>Comment</div>\n" +
        //"tags\")'>Tags</div>\n" +

        case "show":
            $("#imageContextMenu").fadeOut();
            if ($('#ctxModelName').html() === "unknown model")
                showUnknownModelInfoDialog(pFolderId);
            else
                showFolderInfoDialog(pFolderId, "img ctx");

            if ($('#ctxModelName').html() === "unknown model") {
                //showUnknownModelInfoDialog(albumFolderId);
                showFolderInfoDialog(albumFolderId, "folder ctx show");
            }
            $("#imageContextMenu").fadeOut();
            break;
        case "openInNewTab":
            // rtpe(eventCode, calledFrom, eventDetail, pageId)
            rtpe("ONT", "carousel context menu", carouselItemArray[imageIndex].ImageFolderName, mainImageClickId);
            break;
        case "tags":
            $('#carouselContextMenu').fadeOut();
            pause();
            metaTagDialogIsOpen = true;
            //alert("carouselItemArray[imageIndex].FolderId: " + carouselItemArray[imageIndex].FolderId);
            openMetaTagDialog(carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].LinkId);
            $('#metaTagDialog').on('dialogclose', function (event) {
                metaTagDialogIsOpen = false;
                resume();
            });
            break;
        case "archive":
            $('#carouselContextMenu').fadeOut();
            pause();
            $('#carouselContextMenu').fadeOut();
            showMoveCopyDialog("Archive", carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].FolderId);
            break;
        case "jump":
        case "see more":
            rtpe("SEE", pFolderId, folderName, modelFolderId);
            break;
        case "comment":
            $("#imageContextMenu").fadeOut();
            showImageCommentDialog(pImgSrc, pLinkId, pFolderId, folderName, "ImageContextMenu");
            $("#imageContextMenu").fadeOut();
            //showImageCommentDialog(selectedImage, selectedImageLinkId, albumFolderId, currentAlbumJSfolderName);
            showFolderCommentDialog(albumFolderId);
            break;
        case "explode":
            if (isLoggedIn()) {
                //rtpe(eventCode, calledFrom, eventDetail, pageId)
                rtpe("EXP", folderName, pImgSrc, pFolderId);
            }
            else {
                reportEvent("UNX", "", "", pFolderId);
                showMyAlert("You must be logged in to use this feature");
            }
            break;
        case "imageInfo":
            $('#imageCtxMenuInfo').toggle();
            break;
        case "showFolderLinks":
            break;
        case "showLinks":
            reportEvent("SHL", "show Image links", folderName, pFolderId)
            $('#otherLinksContainer').toggle();
            logEventActivity({
                VisitorId: getCookieValue("VisitorId"),
                EventCode: "SHL",
                EventDetail: "show links",
                PageId: albumFolderId,
                CalledFrom: "contextMenuAction"
            });
            showLinks(selectedImageLinkId);
            break;

        case "archive":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", selectedImage, pFolderId);
            break;
        case "copy":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, albumFolderId);
            break;
        case "move":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, pFolderId);
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
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BUG",
                Severity: 2,
                ErrorMessage: "Unhandeled switch case option.  Action: " + action,
                CalledFrom: "Album.js contextMenuAction"
            });
    }    
}

// context menu action
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

function removeImageDialogHTML() {

    "<div id='removeLinkDialog' class='oggleDialogWindow' title='Remove Image'>\n" +
        "    <div><input type='radio' value='DUP' name='rdoRejectImageReasons' checked='checked' />  duplicate</div>\n" +
        "    <div><input type='radio' value='BAD' name='rdoRejectImageReasons' />  bad link</div>\n" +
        "    <div><input type='radio' value='LOW' name='rdoRejectImageReasons' />  low quality</div>\n" +
        "    <div>\n" +
        "        <span class='roundendButton' onclick='onRemoveImageClick('ok')'>ok</span>\n" +
        "        <span class='roundendButton' onclick='onRemoveImageClick('cancel')'>cancel</span>\n" +
        "    </div>\n" +
        "</div>\n";

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
function showDeleteDialog() {
    $('#removeLinkDialog').show();
    $('#removeLinkDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "300"
    });
}

var MoveCopyImageModel = {};
function showMoveCopyDialog(action, selectedImage, folderId) {
    MoveCopyImageModel.Mode = action;
    MoveCopyImageModel.Link = selectedImage;
    MoveCopyImageModel.SourceFolderId = folderId;

    $('#draggableDialog').css("top", $('.oggleHeader').height() + 20);
    $('#draggableDialogTitle').html(action + " Image Link");
    $('#draggableDialogContents').html(moveCopyArchiveHTML());


    var startNode = 0;
    if (mode === "Archive")
        startNode = 3822;
    if ($('#moveDialogDirTree').children().length < 1) {
        $('#mcaLoagingGif').hide();
        buildDirTree($('#moveDialogDirTree'), "moveCopyArchiveDialogDirTreeClick", startNode);
    }

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

function moveCopyArchiveHTML() {
    return "<div id='moveCopyDialog' class='oggleDialogWindow' title=''>\n" +
        "    <div class='inline'><img id='copyDialogImage' class='copyDialogImage' /></div>\n" +
        "    <div id='dirTreeResults' class='pusedoTextBox'></div>\n" +
        "    <div class='inline'><img class='moveDialogDirTreeButton' src='/Images/caretDown.png' onclick='$('#moveDialogDirTree').show()' /></div>\n" +
        "    <br />\n" +
        "    <div id='moveDialogDirTree' class='hideableDropDown'></div>\n" +
        "    <div id='btnGo' class='roundendButton' onclick='nonFtpMoveCopy()'>Copy</div>\n" +
        "</div>";
}

function moveCopyDialogDirTreeClick(path, id, treeId) {
    //if (treeId == "moveDialogDirTree") {
    MoveCopyImageModel.DestinationFolderId = id;
    $('#moveDialogDirTree').hide();
    if (path.length > path.indexOf(".COM") + 4)
        $('#dirTreeResults').html(path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " "));
    else
        $('#dirTreeResults').html(path);
    //}
    ///else
    //    alert("moveDialogDirTreeClick treeId: " + treeId);
}

function carouselContextMenuHTML() {
    return "<div id='carouselContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div id='ctxModelName' onclick='carouselContextMenuAction(\"showDialog\")'>model name</div>\n" +
        "    <div onclick='contextMenuAction(\"openInNewTab\")'>Open in new tab</div>\n" +
        "    <div onclick='contextMenuAction(\"explode\")'>Explode</div>\n" +
        "    <div onclick='contextMenuAction(\"comment\")'>Comment</div>\n" +
        "    <div onclick='carouselContextMenuAction(\"tags\")'>Tags</div>\n" +
        "</div>\n";
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


function getImageDetails() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetImageDetail?folderId=" + pFolderId + "&linkId=" + pLinkId,
        success: function (imageInfo) {
            if (imageInfo.Success === "ok") {
                selectedImage = imageInfo.Link;
                //alert("selectedImage: " + selectedImage);
                if (Number(imageInfo.ModelFolderId) !== Number(pFolderId)) {
                    $('#ctxModelName').html(imageInfo.ModelFolderName);
                    modelFolderId = imageInfo.ModelFolderId;
                    $('#ctxSeeMore').show();
                }
                else {
                    //alert("folderType: " + imageInfo.FolderType);
                    $('#ctxSeeMore').hide();
                    $('#ctxModelName').html("f1: " + imageInfo.FolderType);
                    if (imageInfo.FolderType.indexOf("singleModel") > -1) {
                        $('#ctxModelName').html("s: " + imageInfo.FolderName);
                    }
                    if (imageInfo.FolderType.indexOf("assorterd") > -1) {
                        //$('#ctxModelName').html("f2: " + imageInfo.FolderName);
                        $('#ctxModelName').html("unknown model");
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

