var viewerShowing = false;
var currentAlbumJSfolderName;
var currentFolderRoot;
var modelFolderId;
var selectedImage;
var selectedImageLinkId;

function directToStaticPage(directToStaticPageFolderId) {
    ///  12/15
    if (isNullorUndefined(directToStaticPageFolderId)) {
        sendEmailToYourself("directToStaticPage folderId isNullorUndefined", "redirecting to poses");
        directToStaticPageFolderId = 136;
    }
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "api/AlbumPage/GetStaticPage?folderId=" + directToStaticPageFolderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.location.href = successModel.ReturnValue;
            }
            else {
                if (successModel.Success.indexOf("Option not supported") > -1) {
                    checkFor404(successModel.Success, "directToStaticPage");
                    sendEmailToYourself("SERVICE DOWN", "from directToStaticPage" +
                        "<br/>folderId=" + directToStaticPageFolderId +
                        "<br/>IpAddress: " + getCookieValue("IpAddress") +
                        "<br/>" + successModel.Success);
                }
                else
                    sendEmailToYourself("jQuery fail in directToStaticPage", "folderId: " + directToStaticPageFolderId + " <br/>" + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "directToStaticPage")) {
                sendEmailToYourself("XHR ERROR IN GetStaticPage", "folderId=" + directToStaticPageFolderId +
                    "<br/>" + errorMessage + "<br/>SENDING THEM BACK TO DYNAMIC PAGE");
            }
        }
    });
}

function setAlbumPageHeader(setAlbumPageHeaderFolderId, isStaticPage) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/AlbumPage/GetFolderInfo?folderId=" + setAlbumPageHeaderFolderId,
            success: function (rootFolderModel) {
                if (rootFolderModel.Success === "ok") {
                    setOggleHeader(rootFolderModel.RootFolder, setAlbumPageHeaderFolderId, rootFolderModel.ContainsImageLinks, isStaticPage);
                    setOggleFooter(rootFolderModel.RootFolder, setAlbumPageHeaderFolderId);
                }
                else {
                    if (folderDetailModel.Success.indexOf("Option not supported") > -1) {
                        checkFor404(folderDetailModel.Success, "setAlbumPageHeader");
                        sendEmailToYourself("SERVICE DOWN", "from getBreadCrumbs<br/>folderId=" + setAlbumPageHeaderFolderId + "<br/>IpAddress: " +
                            getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
                    }
                    else
                        sendEmailToYourself("setAlbumPageHeader FAILURE", "api/AlbumPage/GetFolderInfo?folderId=" + setAlbumPageHeaderFolderId + "<br>" + successModel.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (checkFor404(errorMessage, "setAlbumPageHeader")) {

                    if (document.domain === 'localhost')
                        alert("continuing on to setAlbumPageHeader");
                    else {
                        if (isNullorUndefined(getCookieValue("IpAddress")))
                            logVisitor(setAlbumPageHeaderFolderId, "setAlbumPageHeader");
                        else {
                            sendEmailToYourself("XHR Error setAlbumPageHeader",
                                "settingsArray.ApiServer: " + settingsArray.ApiServer +
                                "<br/>folderId: " + setAlbumPageHeaderFolderId +
                                "<br/>isStaticPage: " + isStaticPage +
                                "<br/>IpAddress: " + getCookieValue("IpAddress") +
                                "<br/>" + errorMessage);
                        }
                    }
                    setOggleHeader("boobs", setAlbumPageHeaderFolderId, false);
                    setOggleFooter("boobs", setAlbumPageHeaderFolderId);
                }
                else
                    sendEmailToYourself("XHR ERROR IN ALBUM.JS setAlbumPageHeader", "api/AlbumPage/GetRootFolder?folderId=" + setAlbumPageHeaderFolderId + " <br/>" + errorMessage);
            }
        });
    } catch (e) {
        if (document.domain === 'localhost')
            alert("setAlbumPageHeader: " + e);
        else
            sendEmailToYourself("setAlbumPageHeader", e);
    }
}

function getBreadCrumbs(getBreadCrumbsFolderId) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/BreadCrumbs/Get?folderId=" + getBreadCrumbsFolderId,
        async: true,
        success: function (breadCrumbModel) {
            if (breadCrumbModel.Success === "ok") {
                $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:reportThenPerformEvent(\"HBX\"," + getBreadCrumbsFolderId + ",\"" + currentFolderRoot + "\")'>home</a>");
                for (i = breadCrumbModel.BreadCrumbs.length - 1; i >= 0; i--) {
                    if (breadCrumbModel.BreadCrumbs[i] === null) {
                        breadCrumbModel.Success = "BreadCrumbs[i] == null : " + i;
                    }
                    else {
                        if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder) {
                            $('#breadcrumbContainer').append("<a class='inactiveBreadCrumb' " +// "onmouseover='slowlyHomeFolderInfoDialog(" +
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
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                        else {
                            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' " +
                                //	HBX	Home Breadcrumb Clicked
                                "href='javascript:reportThenPerformEvent(\"BCC\"," + getBreadCrumbsFolderId + "," + breadCrumbModel.BreadCrumbs[i].FolderId + ")'>" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                    }
                }
                staticPageFolderId = getBreadCrumbsFolderId;
                currentAlbumJSfolderName = breadCrumbModel.FolderName;
                document.title = currentAlbumJSfolderName + " : OggleBooble";
            }
            else {
                if (breadCrumbModel.Success.indexOf("Option not supported") > -1) {
                    checkFor404(breadCrumbModel.Success, "getBreadCrumbs");
                    sendEmailToYourself("SERVICE DOWN", "from getBreadCrumbs<br/>folderId=" + getBreadCrumbsFolderId + "<br/>IpAddress: " +
                        getCookieValue("IpAddress") + "<br/> " + breadCrumbModel.Success);
                }
                else
                    sendEmailToYourself("jQuery fail in Album.js getBreadCrumbs", breadCrumbModel.Success);
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getBreadCrumbs")) {
                sendEmailToYourself("XHR ERROR IN ALBUM.JS getBreadCrumbs", "/api/BreadCrumbs/Get?folderId=" + getBreadCrumbsFolderId + " Message: " + errorMessage);
            }
        }
    });
}

function getAlbumImages(getAlbumImagesFolderId) {
    try {
        var start = Date.now();
        $('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            async: true,
            url: settingsArray.ApiServer + "/api/ImagePage/GetImageLinks?folderId=" + getAlbumImagesFolderId,
            success: function (imageLinksModel) {
                currentFolderRoot = imageLinksModel.RootFolder;
                if (imageLinksModel.Success === "ok") {
                    processImages(imageLinksModel);
                    getBreadCrumbs(getAlbumImagesFolderId);
                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + getAlbumImagesFolderId + " took: " + delta.toFixed(3));
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    if (successModel.Success.indexOf("Option not supported") > -1) {
                        checkFor404(successModel.Success, "getAlbumImages");
                        sendEmailToYourself("SERVICE DOWN", "from getAlbumImages" +
                            "<br/>folderId=" + getAlbumImagesFolderId +
                            "<br/>IpAddress: " + getCookieValue("IpAddress") +
                            "<br/>" + successModel.Success);
                    }
                    else {
                        sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                        if (document.domain === 'localhost') alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success);
                    }
                }
            },
            error: function (jqXHR) {
                $('#imagePageLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getAlbumImages")) {
                    sendEmailToYourself("XHR ERROR in Album.js GetImageLinks ",
                        "Called from: " + getCookieValue("IpAddress") + "  folderId: " + getAlbumImagesFolderId + " Message: " + errorMessage);
                }
            }
        });
    } catch (e) {
        $('#imagePageLoadingGif').hide();
        sendEmailToYourself("Catch in Album.js getAlbumImages", e);
        //alert("GetLinkFolders CATCH: " + e);
    }
}

function processImages(imageLinksModel) {
    var imageFrameClass = "folderImageOutterFrame";
    var subDirLabel = "subDirLabel";
    if (imageLinksModel.RootFolder === "porn" || imageLinksModel.RootFolder === "sluts") {
        imageFrameClass = "pornFolderImageOutterFrame";
        subDirLabel = "pornSubDirLabel";
    }
    $('#imageContainer').html('');
    // IMAGES

    //if (document.domain === 'localhost')  // #DEBUG
    //    alert("isInRole('logged in user'): " + isInRole("logged in user"));

    var imageEditor = isInRole("Image Editor");
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
            }
        }
        $('#imageContainer').append("<div id='img" + idx + "' class='" + imageFrameClass + "'><img class='thumbImage' " +
            " oncontextmenu='ctxSAP(\"img" + idx + "\")' onclick='startSlideShow(" + idx + ")'" +
            " src='" + imageModelFile.Link + "'/></div>");
    });

    //  SUBFOLDERS
    $.each(imageLinksModel.SubDirs, function (idx, subDir) {
        if (subDir.Link === null) {
            //alert("subDir: " + subDir.DirectoryName + "  Link==null");
            subDir.Link = "Images/redballon.png";
        }
        //$('#fileCount').html(getAlbumChildFileCounts(subDir).toLocaleString());
        //$('#imageContainer').append("<div class='" + imageFrameClass + "' onclick=window.location.href='/album.html?folder=" + subDir.FolderId + "'>" +
        $('#imageContainer').append("<div class='" + imageFrameClass + "' onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.FolderId + "\")'>" +
            "<img class='folderImage' src='" + subDir.Link + "'/>" +
            //"<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + childFiles.toLocaleString() + ")</div></div>");
            //"<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "</div></div>");
            //"<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + Math.max(subDir.SubDirCount, subDir.FileCount) + ")</div></div>");
            "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + Math.max(subDir.SubDirCount, Math.max(subDir.FileCount, subDir.ChildFiles)) + ")</div></div>");
    });

    if (imageLinksModel.SubDirs.length > 0) {
        $('#fileCount').html(imageLinksModel.SubDirs.length);
        //$('#footerMessage').html(": ");
    }
    else {
        $('#fileCount').html(imageLinksModel.Files.length);
        //$('#footerMessage').html(": " + imageLinksModel.Files.length);
    }
    if (imageLinksModel.Files.length > 0 && imageLinksModel.SubDirs.length > 0) 
        $('#fileCount').html(imageLinksModel.Files.length + "  (" + imageLinksModel.SubDirs.length + ")");

    $('#imagePageLoadingGif').hide();
    resizeImageContainer();
}

function subFolderPreClick(isStepChild, subFolderPreClickFolderId) {
    //function performEvent(eventCode, calledFrom, eventDetail) {
    //alert("subFolderPreClick.\nfolderId(callledFrom): " + subFolderPreClickFolderId + "\ncurrentFolderId(eventDetail): " + this.currentFolderId + "\nisStepChild: " + isStepChild);
    if (isStepChild === "0")
        reportThenPerformEvent("SUB", this.currentFolderId, subFolderPreClickFolderId);
    else {
        reportThenPerformEvent("SSB", this.currentFolderId, subFolderPreClickFolderId);
    }
}

function resizeImageContainer() {
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
    var visitorId = getCookieValue("VisitorId");
    var ipAddress = getCookieValue("IpAddress");

    // get image array from DOM
    var imageArray = new Array();
    $('#imageContainer').children().each(function () {
        imageArray.push({
            Id: $(this).attr("id"),
            Link: $(this).find("img").attr("src")
        });
    });

    var isStaticPage = "false";
    if (typeof staticPageFolderName === 'string') {
        isStaticPage = "true";
        currentAlbumJSfolderName = staticPageFolderName;

        //if (staticPageFolderName.startsWith("centerfolds"))
        {
            if (document.domain === 'localhost')
                alert("staticPageFolderName: " + staticPageFolderName);
        }


    }

    if (isNullorUndefined(ipAddress) || isNullorUndefined(visitorId) || isNullorUndefined(this.currentFolderId)) {
        //sendEmailToYourself("Calling LogVisitor from Album.js/startslideshow", "visitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + this.currentFolderId);
        if (document.domain === 'localhost')
            alert("Calling LogVisitor from Album.js/startslideshow" +
                "\nvisitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + this.currentFolderId);
        logVisitor(imageIndex, "startSlideshow");
    }

    // Gallery Item Clicked
    //reportThenPerformEvent("GIC", folderId, this.currentFolderId);

    launchViewer(imageArray, imageIndex, this.currentFolderId, currentAlbumJSfolderName);
    resizeViewer();
    viewerShowing = true;
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
        var rejectLinkModel = {};
        rejectLinkModel.Id = selectedImageLinkId;
        rejectLinkModel.PreviousLocation = this.currentFolderId;
        rejectLinkModel.RejectionReason = $('input[name=rdoRejectImageReasons]:checked').val();
        rejectLinkModel.ExternalLink = selectedImage;// $('#' + selectedImageLinkId + '').attr("src");

        $.ajax({
            type: "PUT",
            async: true,
            url: settingsArray.ApiServer + "/api/FtpImageRemove/MoveReject",
            data: rejectLinkModel,
            success: function (success) {
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getAlbumImages(this.currentFolderId);
                    var changeLogModel = {
                        PageId: this.currentFolderId,
                        PageName: currentAlbumJSfolderName,
                        Activity: "link removed " + selectedImageLinkId
                    };
                    logActivity(changeLogModel);
                }
                else {
                    //alert("removeLink: " + success);
                    sendEmailToYourself("jQuery fail in album.js onRemoveImageClick", "Message: " + success);
                }
            },
            error: function (xhr) {
                var errorMessage = getXHRErrorDetails(xhr);
                if (!checkFor404(errorMessage, "onRemoveImageClick")) {
                    sendEmailToYourself("XHR ERROR in Album.js GetImageLinks ",
                        //"Params: " + getCookieValue("IpAddress") + "  folderId: " + folderId +
                        "Message: " + errorMessage);
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
                            sendEmailToYourself("jQuery fail in album.js removeImage", "Message: " + success);
                        }
                    },
                    error: function (xhr) {
                        var errorMessage = getXHRErrorDetails(xhr);
                        if (!checkFor404(errorMessage, "removeImage")) {
                            sendEmailToYourself("XHR error in album.js setAlbumPageHeader", "RemoveImageLink?folderId=" + this.currentFolderId + "&imageId=" + selectedImageLinkId +
                                "<br>Message: " + errorMessage);
                        }
                    }
                });
            }
            else {
                if (success === "only link")
                    showDeleteDialog();
                else {
                    sendEmailToYourself("jQuery fail in album.js removeImage", "Message: " + success);
                    //alert(success);
                }
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404(errorMessage, "removeImage")) {
                sendEmailToYourself("XHR ERROR IN ALBUM.JS setAlbumPageHeader", "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + selectedImageLinkId + " Message: " + errorMessage);
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
                fullPageName = modelDetails.RootFolder + "/" + modelDetails.FolderName;
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
                    checkFor404(folderDetailModel.Success, "ctxSAP");
                    sendEmailToYourself("SERVICE DOWN", "from album.js/ctxSAP" +
                        "<br/>currentAlbumJSfolderName=" + currentAlbumJSfolderName + "<br/>IpAddress: " + getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
                }
                else
                    sendEmailToYourself("jQuery fail album.js ctxSAP", 
                        "<br/>currentAlbumJSfolderName=" + currentAlbumJSfolderName + "<br/>IpAddress: " + getCookieValue("IpAddress") + "<br/> " + folderDetailModel.Success);
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404(errorMessage, "ctxSAP")) {

                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: "GetModelName?linkId=" + selectedImageLinkId + " Message: " + errorMessage,
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
            reportThenPerformEvent("SEE", this.currentFolderId, modelFolderId);
            //window.open("/album.html?folder=" + modelFolderId, "_blank");
            break;
        case "comment":
            $("#thumbImageContextMenu").fadeOut();
            showImageCommentDialog(selectedImage, selectedImageLinkId, this.currentFolderId, currentAlbumJSfolderName);
            break;
        case "explode":
            window.open(selectedImage, "_blank");
            //window.open($('#' + selectedImageLinkId + '').attr("src"), "_blank");
            break;
        case "archive":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", selectedImage, this.currentFolderId);
            break;
        case "copy":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, this.currentFolderId);
            break;
        case "move":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, this.currentFolderId);
            break;
        case "remove":
            $("#thumbImageContextMenu").fadeOut();
            removeImage();
            break;
        case "setF":
            setFolderImage(selectedImageLinkId, this.currentFolderId, "folder");
            break;
        case "setC":
            setFolderImage(selectedImageLinkId, this.currentFolderId, "parent");
            break;
        case "showLinks":
            showLinks(selectedImageLinkId);
            //showProps($('#' + currentContextLinkId + '').attr("src"));
            break;
        default:
            sendEmailToYourself("error in album.js contextMenuAction ", "Unhandeled switch case option.  Action: " + action);
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

function showEitherModelorFolderInfoDialog(index, folderName, showEitherModelorFolderInfoDialogFolderId, parentId, rootFolder) {

    //alert("showEitherModelorFolderInfoDialog(index: " + index + ", folderName: " + folderName + ", folderId: " + folderId + ", parentId: " + parentId + ", rootFolder: " + rootFolder + ")");
    var cybergirls = "3796";

    //alert("parentId: " + parentId + " parentId === cybergirls: " + parentId === cybergirls);

    if (rootFolder === "playboy" && index > 4 || parentId === cybergirls || rootFolder === "archive" && index > 2) {
        //alert("showEitherModelorFolderInfoDialog   rootFolder: " + rootFolder);
        //showModelInfoDialog(folderName, folderId, 'Images/redballon.png');
        reportThenPerformEvent("CMX", showEitherModelorFolderInfoDialogFolderId, folderName);
    }
    else {
        //alert("showEitherModelorFolderInfoDialog   rootFolder: " + rootFolder + "  index: " + index);
        showCategoryDialog(showEitherModelorFolderInfoDialogFolderId);
    }
}
