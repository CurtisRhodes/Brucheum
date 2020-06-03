﻿var viewerShowing = false;
var currentAlbumJSfolderName;
var currentFolderRoot;
var modelFolderId;
var modelFolderName;
var selectedImage;
var selectedImageLinkId;
var albumFolderId;
var deepChildCount = 0;

function GetAllAlbumPageInfo(folderId) {
    try {
        var aapiVisitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(aapiVisitorId)) {
            logError({
                VisitorId: aapiVisitorId,
                ActivityCode: "XXX",
                Severity: 1,
                ErrorMessage: "visitorId undefined",
                CalledFrom: "GetAllAlbumPageInfo"
            });
        }
        else {
            $('.footer').hide();
            albumFolderId = folderId;
            var start = Date.now();
            $('#imagePageLoadingGif').show();
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/GalleryPage/GetAllAlbumPageInfo?visitorId=" + aapiVisitorId + "&folderId=" + folderId,
                success: function (imageLinksModel) {
                    $('#imagePageLoadingGif').hide();
                    if (imageLinksModel.Success === "ok") {

                        currentAlbumJSfolderName = imageLinksModel.FolderName;
                        document.title = currentAlbumJSfolderName + " : OggleBooble";
                        currentFolderRoot = imageLinksModel.RootFolder;

                        setOggleHeader(folderId, currentFolderRoot);
                        setOggleFooter(folderId, currentFolderRoot);

                        $('#googleSearchText').html(imageLinksModel.FolderName);

                        $.each(imageLinksModel.TrackBackItems, function (idx, trackBackItem) {
                            if (trackBackItem.Site === "Babepedia") {
                                $('#babapediaLink').html(trackBackItem.TrackBackLink);
                                $('#babapediaLink').show();
                            }
                            if (trackBackItem.Site === "Freeones") {
                                $('#freeonesLink').html(trackBackItem.TrackBackLink);
                                $('#freeonesLink').show();
                            }
                            if (trackBackItem.Site === "Indexxx") {
                                $('#indexxxLink').html(trackBackItem.TrackBackLink);
                                $('#indexxxLink').show();
                            }
                        });

                        setBreadCrumbs(imageLinksModel.BreadCrumbs, imageLinksModel.ExternalLinks);

                        processImages(imageLinksModel);

                        $('#headerMessage').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
                        $('#footerInfo1').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
                        resizeAlbumPage();

                        logPageHit(folderId, "Album.html");  // 
                        $('#folderCommentButton').fadeIn();

                        var delta = (Date.now() - start) / 1000;
                        console.log("GetAllAlbumPageInfo took: " + delta.toFixed(3));
                        $('.footer').show();
                    }
                    else {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BUG",
                            Severity: 1,
                            ErrorMessage: imageLinksModel.Success,
                            CalledFrom: "GetAllAlbumPageInfo"
                        });
                        //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                        if (document.domain === 'localhost') alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success);
                    }
                },
                error: function (jqXHR) {
                    $('#imagePageLoadingGif').hide();
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "getAlbumImages")) {
                        logError({
                            VisitorId: aapiVisitorId,
                            ActivityCode: "XHR",
                            Severity: 1,
                            ErrorMessage: errorMessage,
                            CalledFrom: "GetAllAlbumPageInfo"
                        });
                    }
                }
            });
        }
    }
    catch (e)
    {
        $('#imagePageLoadingGif').hide();
        logError({
            VisitorId: aapiVisitorId,
            ActivityCode: "CAT",
            Severity: 1,
            ErrorMessage: e,
            CalledFrom: "GetAllAlbumPageInfo"
        });
        //sendEmailToYourself("Catch in Album.js getAlbumImages", e);
        //alert("GetLinkFolders CATCH: " + e);
    }
}

function setBreadCrumbs(breadCrumbModel, badgesText) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)

    //alert("breadCrumbModel.length: " + breadCrumbModel.length);


    $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:rtpe(\"HBX\"," + albumFolderId + ",33,\"" + currentFolderRoot + "\")'>home  &#187</a>");
    for (i = breadCrumbModel.length - 1; i >= 0; i--) {
        if (breadCrumbModel[i] === null) {
            breadCrumbModel.Success = "BreadCrumbs[i] == null : " + i;
        }
        else {
            if (breadCrumbModel[i].IsInitialFolder) {
                $('#breadcrumbContainer').append(
                    "<a class='inactiveBreadCrumb' onmouseover='slowlyshowFolderInfoDialog(" + breadCrumbModel[i].FolderId + ")' onmouseout='forgetHomeFolderInfoDialog=true;' " +
                    "onclick='showFolderInfoDialog(" + breadCrumbModel[i].FolderId + ")'>" + breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
            }
            else {
                $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                    "href='javascript:rtpe(\"BCC\"," + albumFolderId + ",44," + breadCrumbModel[i].FolderId + ")'>" +
                    breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + " &#187</a>");
            }
        }
    }

    if (!isNullorUndefined(badgesText)) {
        if (badgesText.indexOf("Playmate Of The Year") > -1) {
            $('#pmoyLink').show();
        }
        if (badgesText.indexOf("biggest breasted centerfolds") > -1) {
            $('#breastfulPlaymatesLink').show();
        }
        if (badgesText.indexOf("black centerfolds") > -1) {
            $('#blackCenterfoldsLink').show();
        }
        if (badgesText.indexOf("Hef likes twins") > -1) {
            $('#twinsLink').show();
        }
    }
}

function directToStaticPage(folderId) {
    if (isNullorUndefined(folderId)) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "ERR",
            Severity: 1,
            ErrorMessage: "folderId undefined. Directing to folder 136",
            CalledFrom: "Album.js directToStaticPage"
        });
        //sendEmailToYourself("directToStaticPage folderId isNullorUndefined", "redirecting to poses");
    }
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "api/AlbumPage/GetStaticPage?folderId=" + folderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.location.href = successModel.ReturnValue + "?q=35";
            }
            else {
                if (successModel.Success.indexOf("Option not supported") > -1) {
                    checkFor404(successModel.Success, "directToStaticPage");
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "ERR",
                        Severity: 1,
                        ErrorMessage: successModel.Success,
                        CalledFrom: "Album.js directToStaticPage"
                    });
                }
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "directToStaticPage")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "Album.js directToStaticPage"
                });
            }
        }
    });
}

function getDeepChildCount(subDir) {
    deepChildCount += subDir.ChildFiles;
    $.each(subDir.SubDirs, function (idx, obj) {
        getDeepChildCount(obj.SubDirs);
    });
}

function processImages(imageLinksModel) {
    var imageFrameClass = "folderImageOutterFrame";
    var subDirLabel = "subDirLabel";
    var imageEditor = isInRole("Image Editor");
    $('#imageContainer').html('');

    if (imageLinksModel.RootFolder === "porn" || imageLinksModel.RootFolder === "sluts") {
        imageFrameClass = "pornFolderImageOutterFrame";
        subDirLabel = "pornSubDirLabel";
    }
    // IMAGES
    $.each(imageLinksModel.Files, function (idx, imageModelFile) {
        imageFrameClass = "imageFrame";
        if (imageEditor) {
            if (imageLinksModel.RootFolder === "archive") {
                if (imageModelFile.LinkCount > 1) {
                    imageFrameClass = "multiLinkImageFrame";
                }
            }
            else {
                if (imageModelFile.LinkCount > 1) {
                    imageFrameClass = "nonLocalImageFrame";
                }
            }// imageModelFile
        }  // startSlideShow(folderId, linkId)

        $('#imageContainer').append("<div id='" + imageModelFile.LinkId + "' class='" + imageFrameClass + "'><img class='thumbImage' " +
            " oncontextmenu='imageCtx(\"" + imageModelFile.LinkId + "\")' onclick='startSlideShow(" + imageModelFile.FolderId +
            ",\"" + imageModelFile.LinkId + "\")'" + " src='" + imageModelFile.Link + "'/></div>");
    });

    if (imageLinksModel.SubDirs.length > 1) {
        var totalChildImages = 0;
        $('#deepSlideshow').show();
        $.each(imageLinksModel.SubDirs, function (idx, obj) {
            totalChildImages += obj.FileCount;
        });
        $('#fileCount').html(imageLinksModel.SubDirs.length + "/" + totalChildImages.toLocaleString());
    }
    else {
        $('#fileCount').html(imageLinksModel.Files.length);
    }
    if (imageLinksModel.Files.length > 0 && imageLinksModel.SubDirs.length > 0) 
        $('#fileCount').html(imageLinksModel.Files.length + "  (" + imageLinksModel.SubDirs.length + ")");

    //  SUBFOLDERS
    $.each(imageLinksModel.SubDirs, function (idx, subDir) {
        if (subDir.Link === null)
            subDir.Link = "Images/redballon.png";
        var kludge = "<div id='" + subDir.LinkId + "' class='" + imageFrameClass +
            "' oncontextmenu='folderCtx(\"" + subDir.LinkId + "\")'" +
            " onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.FolderId + "\")'>" +
            "<img class='folderImage' src='" + subDir.Link + "'/>";

        if (subDir.SubDirCount === 0)
            kludge += "<div class='" + subDirLabel + "'   >" +
                subDir.DirectoryName + "  (" + subDir.FileCount + ")</div></div>";
        else {
            deepChildCount = subDir.FileCount;
            getDeepChildCount(subDir);
            if (deepChildCount === 0) { // this must be just a collection of stepchildren
                $('#fileCount').html(subDir.SubDirCount);
                // get deep count of stepchildren
                kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDir.SubDirCount + ")</div></div>";
            }
            else {
                if (subDir.SubDirCount > 1)
                    kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDir.SubDirCount + "/" + deepChildCount.toLocaleString() + ")</div></div>";
                else
                    kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + deepChildCount.toLocaleString() + ")</div></div>";
            }
        }
        $('#imageContainer').append(kludge);
    });

    $('#imagePageLoadingGif').hide();
    $('#imageContainer').show();
    resizeImageContainer();
    //$('#footerMessage').html(": " + imageLinksModel.Files.length);
}

function subFolderPreClick(isStepChild, subFolderPreClickFolderId) {
    //function performEvent(eventCode, calledFrom, eventDetail) {
    if (isStepChild === "0")
        rtpe("SUB", albumFolderId, "", subFolderPreClickFolderId);
    else {
        rtpe("SSB", albumFolderId, "", subFolderPreClickFolderId);
    }
}

function resizeImageContainer() {
    //This page uses the non standard property “zoom”. Consider using calc() in the relevant property values, or using “transform” along with “transform-origin: 0 0”. album.html
    resizePage();
    $('#imageContainer').width($('.middleColumn').width());
    $('#imageContainer').css("max-height", $('.middleColumn').height() - 50);
    if (viewerShowing) 
        resizeViewer();
    $('#feedbackBanner').css("top", $('.middleColumn').height() - 150);
}

$(window).resize(function () {
    resizeImageContainer();
});

function startSlideShow(folderId, linkId) {

    //alert("linkId: " + linkId);

    if (typeof staticPageFolderName === 'string') {
        isStaticPage = "true";
        currentAlbumJSfolderName = staticPageFolderName;
        //albumFolderId = staticPageFolderId;
    }
    // get image array from DOM
    var imageArray = new Array();
    $('#imageContainer').children().each(function () {
        imageArray.push({
            Id: $(this).attr("id"),
            Link: $(this).find("img").attr("src")
        });
    });

    launchViewer(folderId, linkId, false);
    $('#fileCount').hide();
}

function launchDeepSlideShow()
{
    launchViewer(albumFolderId, 1, true);
}

function showDeleteDialog() {
    $('#removeLinkDialog').show();
    $('#removeLinkDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "300"
    });
}

function onRemoveImageClick(btn) {
    if (btn === "ok") {
        $.ajax({
            type: "PUT",
            async: true,
            url: settingsArray.ApiServer + "/api/FtpImageRemove/MoveReject",
            data: {
                Id: selectedImageLinkId,
                PreviousLocation: albumFolderId,
                RejectionReason: $('input[name=rdoRejectImageReasons]:checked').val(),
                ExternalLink: selectedImage
            },
            success: function (success) {
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getAlbumImages(albumFolderId);
                    logActivity({
                        PageId: albumFolderId,
                        PageName: currentAlbumJSfolderName,
                        Activity: "link removed " + selectedImageLinkId
                    });
                }
                else {
                    //alert("removeLink: " + success);
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 3,
                        ErrorMessage: success,
                        CalledFrom: "Album.js onRemoveImageClick"
                    });
                    //sendEmailToYourself("jQuery fail in album.js onRemoveImageClick", "Message: " + success);
                }
            },
            error: function (xhr) {
                var errorMessage = getXHRErrorDetails(xhr);
                if (!checkFor404(errorMessage, "onRemoveImageClick")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "Album.js onRemoveImageClick"
                    });
                }
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
            }
        });
    }
    else {
        $('#removeLinkDialog').dialog('close');
        $('#removeLinkDialog').hide();
    }
}

function removeImage() {
    //alert("albumFolderId: " + albumFolderId);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + selectedImageLinkId,
        success: function (success) {
            if (success === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: settingsArray.ApiServer + "api/FtpImageRemove/RemoveImageLink?folderId=" + albumFolderId + "&imageId=" + selectedImageLinkId,
                    success: function (success) {
                        if (success === "ok") {
                            if (viewerShowing)
                                slide("next");
                            getAlbumImages(albumFolderId);

                            var changeLogModel = {
                                PageId: albumFolderId,
                                PageName: currentAlbumJSfolderName,
                                Activity: "link removed " + selectedImageLinkId
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
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS remove image", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + selectedImageLinkId + " Message: " + errorMessage);
            }
        }
    });
}

function imageContextMenuHtml() {
    return "<div id='imageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div id='ctxModelName' onclick='imageCtxMenuAction(\"show\")'>model name</div>\n" +
        "    <div id='ctxSeeMore' onclick='imageCtxMenuAction(\"jump\")'>see more of her</div>\n" +
        "    <div onclick='imageCtxMenuAction(\"comment\")'>Comment</div>\n" +
        "    <div onclick='imageCtxMenuAction(\"explode\")'>explode</div>\n" +
        "    <div onclick='imageCtxMenuAction(\"showLinks\")'>Show Links</div>\n" +
        "    <div id='linkInfo' class='innerContextMenuContainer'>\n" +
        "        <div id='linkInfoContainer'></div>\n" +
        "    </div>\n" +
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
function imageCtx(imgId) {
    //alert("image context menu");
    event.preventDefault();
    window.event.returnValue = false;
    $('#imageContextMenuContainer').html(imageContextMenuHtml());
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Image/GetImageDetail?folderId=" + albumFolderId + "&linkId=" + imgId,
        success: function (imageInfo) {
            if (imageInfo.Success === "ok") {
                if (imageInfo.ModelFolderId != albumFolderId) {
                    alert(imageInfo.ModelFolderId + " != " + albumFolderId);
                    $('#ctxModelName').html(imageInfo.ModelFolderName);
                    $('#ctxSeeMore').show();
                }
                else {
                    $('#ctxSeeMore').hide();
                    $('#ctxModelName').html(imageInfo.FolderType);
                    //  return "singleModelCollection";
                    //  return "singleModelGallery";
                    //  return "assorterdImagesCollection";
                    //  return "assorterdImagesGallery";
                    if (imageInfo.FolderType.indexOf("singleModel") > -1) {
                        $('#ctxModelName').html(imageInfo.FolderName);
                    }
                    if (imageInfo.FolderType.indexOf("assorterd") > -1) {
                        $('#ctxModelName').html("unknown model");
                    }
                }

                $('#imageInfoLinkId').html(imageInfo.LinkId);
                $('#imageInfoInternalLink').html(imageInfo.Link);
                $('#imageInfoFolderLocation').html(imageInfo.FolderLocation);
                $('#imageInfoHeight').html(imageInfo.Height);
                $('#imageInfoWidth').html(imageInfo.Width);
                $('#imageInfoLastModified').html(imageInfo.LastModified);
                $('#imageInfoExternalLink').html(imageInfo.ExternalLink);
                selectedImage = imageInfo.Link;
            }
            else {
                if (document.domain === "localhost") alert("imageInfo.Success: " + imageInfo.Success);

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
            if (!checkFor404(errorMessage, "removeImage")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "Album.js removeImage"
                });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS remove image", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + selectedImageLinkId + " Message: " + errorMessage);
            }
        }
    });
    var thisImageDiv = $('#' + imgId + '');
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
    if(isInRole("Oggle admin"))
        $('.adminLink').show();

    $('#imageContextMenu').fadeIn();
}
function imageCtxMenuAction(action) {
    switch (action) {
        case "show":
            if ($('#ctxModelName').html() === "unknown model") {
                showUnknownModelInfoDialog(albumFolderId);
                showFolderInfoDialog(albumFolderId);
            }
            $("#imageContextMenu").fadeOut();
            break;
        case "jump":
            rtpe("SEE", albumFolderId, modelFolderId, modelFolderId);
            break;
        case "comment":
            $("#imageContextMenu").fadeOut();
            //showImageCommentDialog(selectedImage, selectedImageLinkId, albumFolderId, currentAlbumJSfolderName);
            showImageCommentDialog(selectedImage);
            break;
        case "explode":
            if (isLoggedIn()) {

                //alert("rtpe EXP currentAlbumJSfolderName: " + currentAlbumJSfolderName + " selectedImage: " + selectedImage + " albumFolderId: " + albumFolderId);
                rtpe("EXP", currentAlbumJSfolderName, selectedImage, albumFolderId);
            }
            else {
                logEventActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    EventCode: "UNX",
                    EventDetail: "image: " + selectedImageLinkId,
                    PageId: albumFolderId,
                    CalledFrom: "contextMenuAction"
                });
                alert("You must be logged in to use this feature");
            }
            break;
        case "imageInfo":
            $('#imageCtxMenuInfo').toggle();
            break;
        case "showLinks":
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
            showMoveCopyDialog("Archive", selectedImage, albumFolderId);
            break;
        case "copy":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, albumFolderId);
            break;
        case "move":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, albumFolderId);
            break;
        case "remove":
            $("#imageContextMenu").fadeOut();
            removeImage();
            break;
        case "setF":
            setFolderImage(selectedImageLinkId, albumFolderId, "folder");
            break;
        case "setC":
            setFolderImage(selectedImageLinkId, albumFolderId, "parent");
            break;
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BUG",
                Severity: 2,
                ErrorMessage: "Unhandeled switch case option.  Action: " + action,
                CalledFrom: "Album.js contextMenuAction"
            });
        //sendEmailToYourself("error in album.js contextMenuAction ", "Unhandeled switch case option.  Action: " + action);
        //alert("contextMenuAction action: " + action);
    }

}

function folderCtx(imgId) {
    alert("folder context menu");
    event.preventDefault();
    window.event.returnValue = false;
    loadFolderContextMenu();
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
function contextMenuAction(action) {
    switch (action) {
        case "show":
            if ($('#ctxModelName').html() === "unknown model") {
                showUnknownModelInfoDialog(albumFolderId);
                showFolderInfoDialog(albumFolderId);
            }
            $("#imageContextMenu").fadeOut();
            break;
        case "jump":
            rtpe("SEE", albumFolderId, modelFolderId, modelFolderId);
            break;
        case "comment":
            $("#imageContextMenu").fadeOut();
            //showImageCommentDialog(selectedImage, selectedImageLinkId, albumFolderId, currentAlbumJSfolderName);
            showImageCommentDialog(selectedImage);
            break;
        case "explode":
            if (isLoggedIn()) {

                //alert("rtpe EXP currentAlbumJSfolderName: " + currentAlbumJSfolderName + " selectedImage: " + selectedImage + " albumFolderId: " + albumFolderId);
                rtpe("EXP", currentAlbumJSfolderName, selectedImage, albumFolderId);
            }
            else {
                logEventActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    EventCode: "UNX",
                    EventDetail: "image: " + selectedImageLinkId,
                    PageId: albumFolderId,
                    CalledFrom: "contextMenuAction"
                });
                alert("You must be logged in to use this feature");
            }
            break;
        case "showFolderLinks":
            break;
        case "showLinks":
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
            showMoveCopyDialog("Archive", selectedImage, albumFolderId);
            break;
        case "copy":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, albumFolderId);
            break;
        case "move":
            $("#imageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, albumFolderId);
            break;
        case "remove":
            $("#imageContextMenu").fadeOut();
            removeImage();
            break;
        case "setF":
            setFolderImage(selectedImageLinkId, albumFolderId, "folder");
            break;
        case "setC":
            setFolderImage(selectedImageLinkId, albumFolderId, "parent");
            break;
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BUG",
                Severity: 2,
                ErrorMessage: "Unhandeled switch case option.  Action: " + action,
                CalledFrom: "Album.js contextMenuAction"
            });
            //sendEmailToYourself("error in album.js contextMenuAction ", "Unhandeled switch case option.  Action: " + action);
            //alert("contextMenuAction action: " + action);
    }
}
         
function slowlyShowFolderInfoDialog(folderId) {
    forgetHomeFolderInfoDialog = false;
    setTimeout(function () {
        if (!forgetHomeFolderInfoDialog) {
            alert("disable this");
            if (typeof pause === 'function')
                pause();
            showFolderInfoDialog(folderId);
        }
    }, 1800);
}

function loadFolderContextMenu() {
    $('#imageContextMenuContainer').html(
        "<div id='folderContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div id='ctxFolderInfo' onclick='contextMenuAction(\"show\")'>show folder info</div>\n" +
        "    <div id='ctxMetaTags' onclick='contextMenuAction(\"meta\")'>show meta tags</div>\n" +
        //"    <div onclick='contextMenuAction(\"explodeFolderImage\")'>explode</div>\n" +
        //"    <div onclick='contextMenuAction(\"showFolderLinks\")'>Show Links</div>\n" +
        //"    <div id='folderLinkInfo' class='innerContextMenuInfo'>\n" +
        //"        <div id='folderLinkInfoContainer'></div>\n" +
        //"    </div>\n" +
        //"    <div onclick='contextMenuAction(\"showLinks\")'>Show Image info</div>\n" +
        "</div>\n");
}

function showFolderCommentDialog() {

    var visitorId = getCookieValue("VisitorId");

    alert("showFolderCommentDialog()");

}
