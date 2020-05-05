var viewerShowing = false;
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
            albumFolderId = folderId;
            var start = Date.now();
            $('#imagePageLoadingGif').show();
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/AlbumPage/GetAllAlbumPageInfo?visitorId=" + aapiVisitorId + "&folderId=" + folderId,
                success: function (imageLinksModel) {
                    $('#imagePageLoadingGif').hide();
                    if (imageLinksModel.Success === "ok") {
                        currentFolderRoot = imageLinksModel.RootFolder;
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

                        processImages(imageLinksModel);

                        $('#headerMessage').html("page hits: " + imageLinksModel.PageHits);

                        setOggleFooter(folderId, imageLinksModel.RootFolder, imageLinksModel.LastModified);

                        var delta = (Date.now() - start) / 1000;
                        console.log("GetAllAlbumPageInfo took: " + delta.toFixed(3));

                    }
                    else {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BUG",
                            Severity: 1,
                            ErrorMessage: successModel.Success,
                            CalledFrom: "GetAllAlbumPageInfo"
                        });
                        //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                        //if (document.domain === 'localhost') alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success);
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
        }
        $('#imageContainer').append("<div id='" + imageModelFile.LinkId + "' class='" + imageFrameClass + "'><img class='thumbImage' " +
            " oncontextmenu='ctxSAP(\"" + imageModelFile.LinkId + "\")' onclick='startSlideShow2(" + albumFolderId + ",\"" + imageModelFile.LinkId + "\")'" +
            " src='" + imageModelFile.Link + "'/></div>");
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
        var kludge = "<div class='" + imageFrameClass + "' onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.FolderId + "\")'>" +
            "<img class='folderImage' src='" + subDir.Link + "'/>";

        if (subDir.SubDirCount === 0)
            kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDir.FileCount + ")</div></div>";
        else {
            deepChildCount = subDir.FileCount;
            getDeepChildCount(subDir);
            if (deepChildCount === 0) // this must be just a collection of stepchildren
                kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDir.SubDirCount + ")</div></div>";
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
    resizeImageContainer();
    //$('#footerMessage').html(": " + imageLinksModel.Files.length);
    //$('#footerMessage').html(": ");
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
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 50);
    if (viewerShowing) 
        resizeViewer();
    $('#feedbackBanner').css("top", $('#middleColumn').height() - 150);
}

$(window).resize(function () {
    resizeImageContainer();
});

function startSlideShow(imageIndex) {
    if (typeof staticPageFolderName === 'string') {
        isStaticPage = "true";
        currentAlbumJSfolderName = staticPageFolderName;
        albumFolderId = staticPageFolderId;
    }
    // get image array from DOM
    var imageArray = new Array();
    $('#imageContainer').children().each(function () {
        imageArray.push({
            Id: $(this).attr("id"),
            Link: $(this).find("img").attr("src")
        });
    });

    launchViewer(albumFolderId, imageIndex, false);
    resizeViewer();
    viewerShowing = true;
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
    //alert("currentFolderId: " + currentFolderId);
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + selectedImageLinkId,
        success: function (success) {
            if (success === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: settingsArray.ApiServer + "api/FtpImageRemove/RemoveImageLink?folderId=" + currentFolderId + "&imageId=" + selectedImageLinkId,
                    success: function (success) {
                        if (success === "ok") {
                            if (viewerShowing)
                                slide("next");
                            getAlbumImages(currentFolderId);

                            var changeLogModel = {
                                PageId: currentFolderId,
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

function ctxSAP(imgId) {
    event.preventDefault();
    window.event.returnValue = false;
    var thisImageDiv = $('#' + imgId + '');
    var sstring = thisImageDiv.html();
    selectedImageLinkId = sstring.substr(sstring.lastIndexOf("_") + 1, 36);
    if (viewerShowing) {
        $('#thumbImageContextMenu').css("top", event.clientY + 5);
        $('#thumbImageContextMenu').css("left", event.clientX);
    }
    else {
        var picpos = thisImageDiv.offset();
        var picLeft = Math.max(0, picpos.left + thisImageDiv.width() - $('#thumbImageContextMenu').width() - 50);
        $('#thumbImageContextMenu').css("top", picpos.top + 5);
        $('#thumbImageContextMenu').css("left", picLeft);
    }
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "api/ImageCategoryDetail/GetModelName?linkId=" + selectedImageLinkId,
        success: function (modelDetails) {
            if (modelDetails.Success === "ok") {
                selectedImage = modelDetails.Link;
                modelFolderName = modelDetails.FolderName;
                //fullPageName = modelDetails.RootFolder + "/" + modelDetails.FolderName;
                modelFolderId = modelDetails.FolderId;

                $('#ctxModelName').html("unknown model");
                $('#ctxSeeMore').hide();
                var canSeeMore = false;

                if (typeof staticPageFolderName === 'string') {
                    currentAlbumJSfolderName = staticPageFolderName;
                }

                if (modelDetails.RootFolder === "archive" || modelDetails.RootFolder === "playboy" || modelDetails.RootFolder === "sluts") {
                    //alert("currentFolderRoot: " + currentFolderRoot + "  modelDetails.RootFolder: " + modelDetails.RootFolder);
                    $('#ctxModelName').html(modelDetails.FolderName);
                    $('#ctxSeeMore').hide();
                }

                if (modelDetails.RootFolder === "archive" && currentFolderRoot !== "archive") {
                    //alert("archive   modelDetails.RootFolder == " + modelDetails.RootFolder + " and currentFolderRoot = " + currentFolderRoot);
                    $('#ctxSeeMore').show();
                    canSeeMore = true;
                }

                //if (modelDetails.RootFolder === "playboy" && currentFolderRoot !== "playboy") {
                //    $('#ctxSeeMore').show();
                //}
                //if (modelDetails.RootFolder === "sluts" && currentFolderRoot !== "sluts") {
                //    $('#ctxSeeMore').show();
                //}

                $('.adminLink').hide();
                if (isInRole("Image Editor")) {
                    $('.adminLink').show();
                    //if (document.domain === 'localhost') alert(userName + " gets to edit images");                    
                }
            }
            else {
                if (folderDetailModel.Success.indexOf("Option not supported") > -1) {
                    if (!checkFor404(folderDetailModel.Success, "ctxSAP")) {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BGX",
                            Severity: 3,
                            ErrorMessage: modelDetails.Success,
                            CalledFrom: "Album.js ctxSAP"
                        });
                    }
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BGX",
                        Severity: 3,
                        ErrorMessage: modelDetails.Success,
                        CalledFrom: "Album.js ctxSAP"
                    });
                }
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404(errorMessage, "ctxSAP")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "ALBUM.JS ctxSAP"
                });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS ctxSAP", "api/ImageCategoryDetail/GetModelName?linkId=" + selectedImageLinkId +
                //    "<br>Message: " + errorMessage);
            }
        }
    });
    $('#thumbImageContextMenu').css('z-index', "200");
    $('#thumbImageContextMenu').fadeIn();
}

function contextMenuAction(action) {
    switch (action) {
        case "show":
            logEventActivity({
                VisitorId: getCookieValue("VisitorId"),
                EventCode: "SMD",
                EventDetail: "Viewer showing: " + viewerShowing,
                PageId: albumFolderId,
                CalledFrom: "contextMenuAction"
            });
            var disableViewerKeys = viewerShowing;
            viewerShowing = false;
            $("#thumbImageContextMenu").fadeOut();
            //alert("showModelInfoDialog from contextMenuAction");
            showModelInfoDialog($('#ctxModelName').html(), modelFolderId, selectedImage);// $('#' + currentContextLinkId + '').attr("src"));
            $('#modelInfoDialog').on('dialogclose', function (event) {
                viewerShowing = disableViewerKeys;
                $('#modelInfoDialog').hide();
            });
            break;
        case "jump":
            rtpe("SEE", albumFolderId, modelFolderId, modelFolderId);
            break;
        case "comment":
            $("#thumbImageContextMenu").fadeOut();
            logEventActivity({
                VisitorId: getCookieValue("VisitorId"),
                EventCode: "SID",
                EventDetail: "image: " + selectedImageLinkId,
                PageId: albumFolderId,
                CalledFrom: "contextMenuAction"
            });
            showImageCommentDialog(selectedImage, selectedImageLinkId, albumFolderId, currentAlbumJSfolderName);
            break;
        case "explode":
            if (isLoggedIn()) {
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
        case "archive":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", selectedImage, albumFolderId);
            break;
        case "copy":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, albumFolderId);
            break;
        case "move":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, albumFolderId);
            break;
        case "remove":
            $("#thumbImageContextMenu").fadeOut();
            removeImage();
            break;
        case "setF":
            setFolderImage(selectedImageLinkId, albumFolderId, "folder");
            break;
        case "setC":
            setFolderImage(selectedImageLinkId, albumFolderId, "parent");
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

function slowlyShowFolderInfoDialog(index, folderName, folderId, parentId, rootFolder) {
    forgetHomeFolderInfoDialog = false;
    setTimeout(function () {
        if (forgetHomeFolderInfoDialog === false) {
            alert("disable this");
            if (typeof pause === 'function')
                pause();
            showEitherModelorFolderInfoDialog(index, folderName, folderId, parentId, rootFolder);
        }
    }, 1100);
}

function showEitherModelorFolderInfoDialog(index, folderName, folderId, parentId, rootFolder) {
    var cybergirls = "3796";
    if (rootFolder === "playboy" && index > 4 || parentId === cybergirls || rootFolder === "archive" && index > 2) {
        rtpe("CMX", folderId, folderName, folderId);
    }
    else {
        showCategoryDialog(folderId);
    }
}

function showAlbumPageContextMenuHtml() {
    "<div id='thumbImageContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut(); $('#linkInfo').hide();'>\n" +
        "    <div id='ctxModelName' onclick='contextMenuAction('show')'>model name</div>\n" +
        "    <div id='ctxSeeMore' onclick='contextMenuAction('jump')'>see more of her</div>\n" +
        "    <div onclick='contextMenuAction('comment')'>Comment</div>\n" +
        "    <div onclick='contextMenuAction('explode')'>explode</div>\n" +
        "    <div onclick='contextMenuAction('showLinks')'>Show Links</div>\n" +
        "    <div id='linkInfo' class='innerContextMenuInfo'>\n" +
        "        <div id='linkInfoContainer'></div>\n" +
        "    </div>\n" +
        "    <div id='ctxArchive' class='adminLink' onclick='contextMenuAction('archive')'>Archive</div>\n" +
        "    <div class='adminLink' onclick='contextMenuAction('copy')'>Copy Link</div>\n" +
        "    <div class='adminLink' onclick='contextMenuAction('move')'>Move Image</div>\n" +
        "    <div class='adminLink' onclick='contextMenuAction('remove')'>Remove Link</div>\n" +
        "    <div class='adminLink' onclick='contextMenuAction('setF')'>Set as Folder Image</div>\n" +
        "    <div class='adminLink' onclick='contextMenuAction('setC')'>Set as Category Image</div>\n" +
        "</div>\n";
}

