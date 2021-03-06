﻿var viewerShowing = false;
var currentAlbumJSfolderName;
var currentFolderRoot;
var modelFolderId;
var modelFolderName;
var selectedImage;
var selectedImageLinkId;
var albumFolderId;
var deepChildCount = 0;

function getAlbumImages(folderId) {
    try {
        albumFolderId = folderId;
        var start = Date.now();
        $('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            async: true,
            url: settingsArray.ApiServer + "/api/ImagePage/GetImageLinks?folderId=" + folderId,
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
                    getBreadCrumbs(folderId, imageLinksModel.ExternalLinks);

                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + folderId + " took: " + delta.toFixed(3));

                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJX",
                        Severity: 1,
                        ErrorMessage: imageLinksModel.Success,
                        CalledFrom: "Album.js getAlbumImages"
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
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "Album.js getAlbumImages"
                    });
                }
            }
        });
    } catch (e) {
        $('#imagePageLoadingGif').hide();
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "CAT",
            Severity: 1,
            ErrorMessage: e,
            CalledFrom: "Album.js getAlbumImages"
        });
        //sendEmailToYourself("Catch in Album.js getAlbumImages", e);
        //alert("GetLinkFolders CATCH: " + e);
    }
}

function directToStaticPage(folderId) {
    ///  12/15
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
                window.location.href = successModel.ReturnValue + "?h=2";
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

function getBreadCrumbs(folderId, badgesText) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/BreadCrumbs/Get?folderId=" + folderId,
        success: function (breadCrumbModel) {
            if (breadCrumbModel.Success === "ok") {

                setOggleHeader(folderId, breadCrumbModel.RootFolder);

                $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:rtpe(\"HBX\"," + folderId + ",33,\"" + currentFolderRoot + "\")'>home  &#187</a>");
                for (i = breadCrumbModel.BreadCrumbs.length - 1; i >= 0; i--) {
                    if (breadCrumbModel.BreadCrumbs[i] === null) {
                        breadCrumbModel.Success = "BreadCrumbs[i] == null : " + i;
                    }
                    else {
                        if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder) {
                            $('#breadcrumbContainer').append(
                                "<a class='inactiveBreadCrumb' " +
                                Number(breadCrumbModel.BreadCrumbs.length - i) + ",\"" +
                                breadCrumbModel.FolderName + "\",\"" +
                                breadCrumbModel.BreadCrumbs[i].FolderId + "\",\"" +
                                breadCrumbModel.BreadCrumbs[i].ParentId + "\",\"" +
                                breadCrumbModel.RootFolder + "\"); forgetHomeFolderInfoDialog=false;' onmouseout='forgetHomeFolderInfoDialog=true;' " +
                                "onclick='showEitherModelorFolderInfoDialog(" + Number(breadCrumbModel.BreadCrumbs.length - i) + ",\"" +
                                breadCrumbModel.FolderName + "\",\"" +
                                breadCrumbModel.BreadCrumbs[i].FolderId + "\",\"" +
                                breadCrumbModel.BreadCrumbs[i].ParentId + "\",\"" +
                                breadCrumbModel.RootFolder + "\")' >" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") +
                                "</a>");
                        }
                        else {
                            $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                                //	HBX	Home Breadcrumb Clicked
                                "href='javascript:rtpe(\"BCC\"," + folderId + ",44," + breadCrumbModel.BreadCrumbs[i].FolderId + ")'>" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + " &#187</a>");
                        }
                    }
                }
                currentAlbumJSfolderName = breadCrumbModel.FolderName;
                document.title = currentAlbumJSfolderName + " : OggleBooble";

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
                logPageHit(folderId, "Album.html");  // 

            }
            else {
                if (breadCrumbModel.Success.indexOf("Option not supported") > -1) {
                    if (!checkFor404(breadCrumbModel.Success, "getBreadCrumbs")) {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "4BB",
                            Severity: 3,
                            ErrorMessage: breadCrumbModel.Success,
                            CalledFrom: "Album.js getBreadCrumbs"
                        });
                    }
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJX",
                        Severity: 3,
                        ErrorMessage: breadCrumbModel.Success,
                        CalledFrom: "Album.js getBreadCrumbs"
                    });
                    //sendEmailToYourself("jQuery fail in Album.js getBreadCrumbs", breadCrumbModel.Success);
                }
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getBreadCrumbs")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 3,
                    ErrorMessage: errorMessage,
                    CalledFrom: "Album.js getBreadCrumbs"
                });
                //sendEmailToYourself("XHR ERROR IN ALBUM.JS getBreadCrumbs", "/api/BreadCrumbs/Get?folderId=" + getBreadCrumbsFolderId + " Message: " + errorMessage);
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
            " oncontextmenu='ctxSAP(\"" + imageModelFile.LinkId + "\")' onclick='startSlideShow2(\"" + imageModelFile.LinkId + "\",\"" + imageModelFile.LinkId + "\")'" +
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
    if (viewerShowing) {
        resizeViewer();
    }

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
    //if (albumFolderId == 0) {    }
    startSlideShow2(albumFolderId, imageIndex, currentAlbumJSfolderName);
}

function startSlideShow2(folderId2, imageIndex) {
    if (albumFolderId === 0) {
        if (folderId2 !== 0) {
            albumFolderId = folderId2;
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "LME",
                Severity: 6,
                ErrorMessage: "Lame: albumFolderId == 0 but folderId2 = " + folderId2,
                CalledFrom: "Album.js / startSlideshow"
            });
        }
        else {
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "BAD",
                Severity: 1,
                ErrorMessage: "albumFolderId == 0",
                CalledFrom: "Album.js / startSlideshow"
            });
        }
    }

    // get image array from DOM
    var imageArray = new Array();
    $('#imageContainer').children().each(function () {
        imageArray.push({
            Id: $(this).attr("id"),
            Link: $(this).find("img").attr("src")
        });
    });
    if (typeof staticPageFolderName === 'string') {
        isStaticPage = "true";
        currentAlbumJSfolderName = staticPageFolderName;
        albumFolderId = staticPageFolderId;
    }

    var visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        //addVisitor(albumFolderId, "Album.js/startSlideshow");
        //logError({
        //    VisitorId: getCookieValue("VisitorId"),
        //    ActivityCode: "BAD",
        //    Severity: 1,
        //    ErrorMessage: "isNullorUndefined(visitorId)",
        //    CalledFrom: "Album.js startSlideshow"
        //});
    }

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
                        ActivityCode: "AJX",
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
                                ActivityCode: "AJX",
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
                        ActivityCode: "AJX",
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
        url: settingsArray.ApiServer + "api/ImageCategoryDetail/GetModelName?linkId=" + selectedImageLinkId,
        success: function (modelDetails) {
            if (modelDetails.Success === "ok") {
                $('#ctxSeeMore').hide();
                if (isNullorUndefined(modelDetails.FolderName)) {
                    $('#ctxModelName').html("unknown model");
                }
                else {
                    $('#ctxModelName').html(modelDetails.FolderName);
                    if (modelDetails.RootFolder !== currentFolderRoot) {
                        $('#ctxSeeMore').show();
                    }
                }
                modelFolderId = modelDetails.FolderId;
                selectedImage = modelDetails.Link;
                modelFolderName = modelDetails.FolderName;
                //fullPageName = modelDetails.RootFolder + "/" + modelDetails.FolderName;

                if (typeof staticPageFolderName === 'string') {
                    currentAlbumJSfolderName = staticPageFolderName;

                }

                $('.adminLink').hide();
                if (isInRole("Image Editor")) {
                    $('.adminLink').show();
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
                ActivityCode: "SWT",
                Severity: 2,
                ErrorMessage: "unhandled case: " + action,
                CalledFrom: "Album.js contextMenuAction"
            });
            //sendEmailToYourself("error in album.js contextMenuAction ", "Unhandeled switch case option.  Action: " + action);
            //alert("contextMenuAction action: " + action);
    }
}

function slowlyHomeFolderInfoDialog(index, folderName, slowlyHomeFolderInfoDialogFolderId, parentId, rootFolder) {
    forgetHomeFolderInfoDialog = false;
    setTimeout(function () {
        if (forgetHomeFolderInfoDialog === false) {
            alert("disable this");
            if (typeof pause === 'function')
                pause();
            showEitherModelorFolderInfoDialog(index, folderName, slowlyHomeFolderInfoDialogFolderId, parentId, rootFolder);
        }
    }, 1100);
}

function showEitherModelorFolderInfoDialog(index, folderName, folderId, parentId, rootFolder) {
    //alert("showEitherModelorFolderInfoDialog(index: " + index + ", folderName: " + folderName + ", folderId: " + folderId + ", parentId: " + parentId + ", rootFolder: " + rootFolder + ")");
    if (rootFolder === "centerfold" || rootFolder === "cybergirl" || rootFolder === "archive" && index > 2) {
        //if (rootFolder === "playboy" && index > 4 || parentId === cybergirls || rootFolder === "archive" && index > 2) {
        rtpe("CMX", folderId, folderName, folderId);
    }
    else {
        showCategoryDialog(folderId);
    }
}
