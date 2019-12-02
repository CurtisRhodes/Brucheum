var viewerShowing = false;
var currentAlbumFolderId;
var currentAlbumJSfolderName;
var currentFolderRoot;
var modelFolderId;
var selectedImage;
var selectedImageLinkId;

function directToStaticPage(folderId) {
    currentAlbumFolderId = folderId;
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "api/AlbumPage/GetStaticPage?folderId=" + folderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.location.href = successModel.ReturnValue;
            }
            else {
                //alert("directToStaticPage " + successModel.Success);
                sendEmailToYourself("jQuery fail in Album.js: directToStaticPage", "folderId: " + folderId + " Message: " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "directToStaticPage")) {
                sendEmailToYourself("XHR ERROR IN ALBUM.JS  ", "api/AlbumPage/GetStaticPage?folderId=" + folderId +
                    "Message: " + errorMessage + "SENDING THEM BACK TO DYNAMIC PAGE");
            }
        }
    });
}

function setAlbumPageHeader(folderId) {
    $.ajax({
        type: "PATCH",
        async: true,
        url: settingsArray.ApiServer + "api/AlbumPage/GetRootFolder?folderId=" + folderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                setOggleHeader(successModel.ReturnValue, folderId);
                setOggleFooter(successModel.ReturnValue);
            }
            else {
                sendEmailToYourself("setAlbumPageHeader FAILURE", "api/AlbumPage/GetRootFolder?folderId=" + folderId +
                    "<br>Message : " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (checkFor404(errorMessage, "setAlbumPageHeader")) {
                //alert("continuing on in setAlbumPageHeader");                
                sendEmailToYourself("continuing on in setAlbumPageHeader", "folderId: " + folderId + ", ipAddress: " + ipAddress + ", set AlbumPageHeader");
                setOggleHeader("boobs", folderId);
                setOggleFooter("boobs");
            }
            else
                sendEmailToYourself("XHR ERROR IN ALBUM.JS setAlbumPageHeader", "api/AlbumPage/GetRootFolder?folderId=" + folderId +
                    " Message" + errorMessage);
        }
    });
}

function getBreadCrumbs(folderId) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/BreadCrumbs/Get?folderId=" + folderId,
        async: true,
        success: function (breadCrumbModel) {
            if (breadCrumbModel.Success === "ok") {
                if (currentFolderRoot === "porn")
                    $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:reportThenPerformEvent(\"HBX\"," + 3909 + ")'>home</a>");
                else
                    $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:reportThenPerformEvent(\"HBX\"," + 3908 + ")'>home</a>");
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
                                "href='javascript:reportThenPerformEvent(\"BCC\"," + breadCrumbModel.BreadCrumbs[i].FolderId + ")'>" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                    }
                }
                staticPageFolderId = folderId;
                currentAlbumJSfolderName = breadCrumbModel.FolderName;
                document.title = currentAlbumJSfolderName + " : OggleBooble";
            }
            else {
                //alert("getBreadCrumbs " + breadCrumbModel.Success);
                sendEmailToYourself("jQuery fail in Album.js getBreadCrumbs ", breadCrumbModel.Success);
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getBreadCrumbs")) {
                sendEmailToYourself("XHR ERROR IN ALBUM.JS getBreadCrumbs", "/api/BreadCrumbs/Get?folderId=" + folderId + " Message: " + errorMessage);
            }
        }
    });
}

function getAlbumImages(folderId) {
    try {
        currentAlbumFolderId = folderId;
        var start = Date.now();
        $('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            async: true,
            url: settingsArray.ApiServer + "/api/ImagePage/GetImageLinks?folderId=" + folderId,
            success: function (imageLinksModel) {
                currentFolderRoot = imageLinksModel.RootFolder;
                if (imageLinksModel.Success === "ok") {
                    processImages(imageLinksModel);
                    getBreadCrumbs(folderId);
                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + folderId + " took: " + delta.toFixed(3));
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                    if (document.domain === 'localhost') alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success);
                }
            },
            error: function (jqXHR) {
                $('#imagePageLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getAlbumImages")) {
                    sendEmailToYourself("XHR ERROR in Album.js GetImageLinks ",
                        "Called from: " + getCookieValue("IpAddress") + "  folderId: " + folderId + " Message: " + errorMessage);
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

        //$('#imageContainer').append("<div class='" + imageFrameClass + "' onclick=window.location.href='/album.html?folder=" + subDir.FolderId + "'>" +
        $('#imageContainer').append("<div class='" + imageFrameClass + "' onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.FolderId + "\")'>" +
            "<img class='folderImage' src='" + subDir.Link + "'/>" +
            //"<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "</div></div>");
            "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + Math.max(subDir.SubDirCount, subDir.FileCount) + ")</div></div>");
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

function subFolderPreClick(isStepChild, folderId) {
    //alert("subFolderPreClick. folderId: " + folderId + " isStepChild: " + isStepChild);
    if (isStepChild === "0")
        reportThenPerformEvent("SUB", folderId);
    else
        reportThenPerformEvent("SSB", folderId);
}

function resizeImageContainer() {
    resizePage();
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 50);
    if (viewerShowing) {
        resizeViewer();
    }
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
        currentAlbumFolderId = staticPageFolderId;

        //if (staticPageFolderName.startsWith("centerfolds"))
        {
            if (document.domain === 'localhost')
                alert("staticPageFolderName: " + staticPageFolderName);
        }


    }

    if (isNullorUndefined(ipAddress) || isNullorUndefined(visitorId) || isNullorUndefined(currentAlbumFolderId)) {

        //sendEmailToYourself("Calling LogVisitor from Album.js/startslideshow", "visitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + currentAlbumFolderId);

        if (document.domain === 'localhost')
            alert("Calling LogVisitor from Album.js/startslideshow" +
                "\nvisitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + currentAlbumFolderId);

        logVisitor(imageIndex, "start slideshow");
    }
    
    reportClickEvent("GIC", currentAlbumFolderId);

    launchViewer(imageArray, imageIndex, currentAlbumFolderId, currentAlbumJSfolderName);
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
        rejectLinkModel.PreviousLocation = currentAlbumFolderId;
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
                    getAlbumImages(currentAlbumFolderId);
                    var changeLogModel = {
                        PageId: currentAlbumFolderId,
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
    //    alert("currentContextLinkId: " + currentContextLinkId);
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + selectedImageLinkId,
        success: function (success) {
            if (success === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: settingsArray.ApiServer + "api/FtpImageRemove/RemoveImageLink?folderId=" + currentAlbumFolderId + "&imageId=" + selectedImageLinkId,
                    success: function (success) {
                        if (success === "ok") {
                            if (viewerShowing)
                                slide("next");
                            getAlbumImages(currentAlbumFolderId);

                            var changeLogModel = {
                                PageId: currentAlbumFolderId,
                                PageName: currentAlbumJSfolderName,
                                Activity: "link removed " + selectedImageLinkId
                            };
                            logActivity(changeLogModel);
                        }
                        else {
                            //alert("removeLink: " + success);
                            sendEmailToYourself("jQuery fail in album.js removeImage", "Message: " + success);
                        }
                    },
                    error: function (xhr) {
                        var errorMessage = getXHRErrorDetails(xhr);
                        if (!checkFor404(errorMessage, "removeImage")) {
                            sendEmailToYourself("XHR error in album.js setAlbumPageHeader", "RemoveImageLink?folderId=" + currentAlbumFolderId + "&imageId=" + selectedImageLinkId +
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
                }

                if (modelDetails.RootFolder === "playboy" && currentFolderRoot !== "playboy") {
                    $('#ctxSeeMore').show();
                }
                if (modelDetails.RootFolder === "sluts" && currentFolderRoot !== "sluts") {
                    $('#ctxSeeMore').show();
                }

                $('.adminLink').hide();
                if (isInRole("Image Editor")) {
                    $('.adminLink').show();
                    //if (document.domain === 'localhost') alert(userName + " gets to edit images");                    
                }
            }
            else {
                sendEmailToYourself("jQuery fail album.js ctxSAP", "modelDetails.Success: " + modelDetails.Success);
                //alert("GetModelName: " + modelDetails.Success);
            }
        },
        error: function (xhr) {
            var errorMessage = getXHRErrorDetails(xhr);
            if (!checkFor404(errorMessage, "ctxSAP")) {
                sendEmailToYourself("XHR ERROR IN ALBUM.JS ctxSAP", "api/ImageCategoryDetail/GetModelName?linkId=" + selectedImageLinkId +
                    "<br>Message: " + errorMessage);
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
            showModelInfoDialog($('#ctxModelName').html(), modelFolderId, selectedImage);// $('#' + currentContextLinkId + '').attr("src"));
            $('#modelInfoDialog').on('dialogclose', function (event) {
                viewerShowing = disableViewerKeys;
                $('#modelInfoDialog').hide();
                getAlbumImages(currentAlbumFolderId);
            });
            break;
        case "jump":
            window.open("/album.html?folder=" + modelFolderId, "_blank");
            break;
        case "comment":
            $("#thumbImageContextMenu").fadeOut();
            showImageCommentDialog(selectedImage, selectedImageLinkId, currentAlbumFolderId, currentAlbumJSfolderName);
            //showImageCommentDialog($('#' + selectedImageLinkId + '').attr("src"), selectedImageLinkId, currentAlbumFolderId, folderName);
            break;
        case "explode":
            window.open(selectedImage, "_blank");
            //window.open($('#' + selectedImageLinkId + '').attr("src"), "_blank");
            break;
        case "archive":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", selectedImage, currentAlbumFolderId);
            break;
        case "copy":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", selectedImage, currentAlbumFolderId);
            break;
        case "move":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Move", selectedImage, currentAlbumFolderId);
            break;
        case "remove":
            $("#thumbImageContextMenu").fadeOut();
            removeImage();
            break;
        case "setF":
            setFolderImage(selectedImageLinkId, currentAlbumFolderId, "folder");
            break;
        case "setC":
            setFolderImage(selectedImageLinkId, currentAlbumFolderId, "parent");
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

function slowlyHomeFolderInfoDialog(index, folderName, folderId, parentId, rootFolder) {
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

    //alert("showEitherModelorFolderInfoDialog(index: " + index + ", folderName: " + folderName + ", folderId: " + folderId + ", parentId: " + parentId + ", rootFolder: " + rootFolder + ")");
    var cybergirls = "3796";

    //alert("parentId: " + parentId + " parentId === cybergirls: " + parentId === cybergirls);

    if (rootFolder === "playboy" && index > 4 || parentId === cybergirls || rootFolder === "archive" && index > 2) {
        //alert("showEitherModelorFolderInfoDialog   rootFolder: " + rootFolder);
        showModelInfoDialog(folderName, folderId, 'Images/redballon.png');
        //reportThenPerformEvent//("CMX", folderId);
    }
    else {
        //alert("showEitherModelorFolderInfoDialog   rootFolder: " + rootFolder + "  index: " + index);
        showCategoryDialog(folderId);
    }
}
