var viewerShowing = false;
var currentAlbumJSfolderName;
var currentFolderRoot;
var modelFolderId;
var modelFolderName;
var selectedImage;
var selectedImageLinkId;
var albumFolderId;
var deepChildCount = 0;
let settingsImgRepo = settingsArray.ImageRepo;

function loadAlbum(folderId) {
    try {
        settingsImgRepo = settingsArray.ImageRepo;
        var aapiVisitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(aapiVisitorId)) {
            if (document.domain === 'localhost')
                alert("visitorId undefined, CalledFrom: loadAlbum");
            else
                logError({ VisitorId: aapiVisitorId, ActivityCode: "XXX", Severity: 1, ErrorMessage: "visitorId undefined, CalledFrom: loadAlbum" });
        }
        else {
            $('.footer').hide();
            albumFolderId = folderId;
            var getImagesStart = Date.now();
            $('#imagePageLoadingGif').show();
            //GetAlbumImages
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" + folderId,
                success: function (albumImageInfo) {
                    $('#imagePageLoadingGif').hide();
                    if (albumImageInfo.Success === "ok") {
                        processImages(albumImageInfo);
                        $('#folderCommentButton').fadeIn();

                        setCounts(albumImageInfo, folderId);

                        let delta = (Date.now() - getImagesStart) / 1000;
                        console.log("GetAlbumImages took: " + delta.toFixed(3));
                        $('.footer').show();
                    }
                    else {
                        $('#imagePageLoadingGif').hide();
                        if (document.domain === 'localhost')
                            setTimeout(function () { alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success) }, 800);
                        else
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "BUG",
                                Severity: 1,
                                ErrorMessage: imageLinksModel.Success,
                                CalledFrom: "loadAlbum"
                            });
                        //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                    }
                },
                error: function (jqXHR) {
                    $('#imagePageLoadingGif').hide();
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "getAlbumImages")) {
                        if (document.domain === 'localhost')
                            alert("XHR fail in Album.js: getAlbumImages\n" + errorMessage);
                        else
                            logError({
                                VisitorId: aapiVisitorId,
                                ActivityCode: "XHR",
                                Severity: 1,
                                ErrorMessage: errorMessage,
                                CalledFrom: "loadAlbum"
                            });
                    }
                }
            });
            var infoStart = Date.now();
            // GetAlbumPageInfo
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumPageInfo?visitorId=" + aapiVisitorId + "&folderId=" + folderId,
                success: function (imageLinksModel) {
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

                        setBreadCrumbs(imageLinksModel.BreadCrumbs);

                        setBadges(imageLinksModel.ExternalLinks);

                        //$('#headerMessage').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
                        $('#footerInfo1').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
                        logPageHit(folderId, "Album.html");
                        $('#folderCommentButton').fadeIn();
                        var delta = (Date.now() - infoStart) / 1000;
                        console.log("GetAlbumPageInfo took: " + delta.toFixed(3));
                    }
                    else {
                        $('#imagePageLoadingGif').hide();
                        if (document.domain === 'localhost')
                            setTimeout(function () { alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success) }, 800);
                        else
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "BUG",
                                Severity: 1,
                                ErrorMessage: imageLinksModel.Success,
                                CalledFrom: "loadAlbum"
                            });
                        //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                    }
                },
                error: function (jqXHR) {
                    $('#imagePageLoadingGif').hide();
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404( "getAlbumImages")) {
                        if (document.domain === 'localhost')
                            alert("XHR fail in Album.js: getAlbumImages\n" + errorMessage);
                        else
                            logError({
                                VisitorId: aapiVisitorId,
                                ActivityCode: "XHR",
                                Severity: 1,
                                ErrorMessage: errorMessage,
                                CalledFrom: "loadAlbum"
                            });
                    }
                }
            });
        }
    }
    catch (e) {
        $('#imagePageLoadingGif').hide();
        if (document.domain === 'localhost')
            alert("XHR fail in Album.js: getAlbumImages\n" + errorMessage);
        else
            logError({
                VisitorId: aapiVisitorId,
                ActivityCode: "CAT",
                Severity: 1,
                ErrorMessage: e,
                CalledFrom: "loadAlbum"
            });
        //sendEmailToYourself("Catch in Album.js getAlbumImages", e);
        //alert("GetLinkFolders CATCH: " + e);
    }
}

function galleryImageError(objImageLink) {
    alert("galleryImageError");
    // $(this).attr('src', "Images/redballon.png");
    //$('#' + objImageLink.LinkId).attr('src', "Images/redballon.png"); 

    //alert("albumImg Error PageId: " + objImageLink.FolderId + ",\nPageName: " + objImageLink.FolderName + ",\nActivity: " + objImageLink.LinkId);
    //logDataActivity({
    //    PageId: objImageLink.FolderId,
    //    PageName: objImageLink.FolderName,
    //    Activity: objImageLink.LinkId
    //});
}
function subFolderImgError(objSubDir) {
    // $('#' + objSubDir.LinkId).attr('src', "Images/redballon.png");

    alert("subDirImg Error PageId: " + objSubDir.FolderId + ",\nDirectoryName: " + objSubDir.DirectoryName + ",\nActivity: " + objSubDir.LinkId);
    logDataActivity({
        PageId: objSubDir.FolderId,
        PageName: objSubDir.DirectoryName,
        Activity: objSubDir.LinkId
    });
}

function processImages(albumImageInfo) {
    let labelClass = "defaultSubFolderImage";  
    let imageFrameClass = "folderImageOutterFrame";
    //let imageEditor = isInRole("Image Editor");
    //if (albumImageInfo.RootFolder === "porn" || albumImageInfo.RootFolder === "sluts") {
    //    imageFrameClass = "pornFolderImageOutterFrame";
    //}
    //if (imageEditor) {
    //    if (albumImageInfo.RootFolder === "archive") {
    //        if (albumImageInfo.dirTree.SubDirs.length > 1) {
    //            imageFrameClass = "multiLinkImageFrame";
    //        }
    //    }
    //    else {
    //        if (imagesModel.dirTree.SubDirs.length > 1) {
    //            imageFrameClass = "nonLocalImageFrame";
    //        }
    //    }// imageModelFile
    //}  // startSlideShow(folderId, linkId)

    $('#imageContainer').html('');
    // FILES
    $.each(albumImageInfo.ImageLinks, function (idx, obj) {
        //imageFrameClass = "defaultImageFrame";
        let imgSrc = settingsImgRepo + "/" + obj.FileName;
        let imageFrameHtml = "<div class='" + imageFrameClass + "'>" +
            "<img id='" + obj.LinkId + "' class='thumbImage'" +
            " oneeror='galleryImageError(\"" + obj.LinkId + "\")' alt='" + imgSrc + "' " +
            " oncontextmenu='imageCtx(\"" + imgSrc + "\",\"" + obj.LinkId + "\")'" +
            " onclick='startSlideShow(" + obj.Id + ",\"" + obj.LinkId + "\")'" + " src='" + imgSrc + "'/>";


        if (obj.Id !== obj.SrcId)
            imageFrameHtml += "<div class='knownModelIndicator'><img src='images/foh01.png' title='" +
                obj.SrcFolder + "' onclick='rtpe(\"SEE\",\"abc\",\"detail" + obj.SrcId + "\")' /></div>";
        imageFrameHtml += "</div>";
        $('#imageContainer').append(imageFrameHtml);
    });

    //  SUBFOLDERS 
    $.each(albumImageInfo.SubDirs, function (idx, subDir) {
        imgSrc = settingsImgRepo + subDir.FolderImage;
        $('#imageContainer').append("<div class='" + imageFrameClass +
            "' oncontextmenu='folderCtx(\"" + subDir.LinkId + "\")'" +
            " onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.FolderId + "\")'>" +
            "<img id='" + subDir.LinkId + "' class='folderImage' onerror='subFolderImgError(" + subDir + ")' alt='Images/redballon.png' src='" + imgSrc + "'/>" +
            "<div class='" + labelClass + "'>" + subDir.DirectoryName + "</div><span Id='fc" + subDir.FolderId + "'> ...</span></div>");
    });

    // $('#aboveImageContainerMessageArea').html(folde
    $('#imagePageLoadingGif').hide();
    $('#imageContainer').show();
    resizeImageContainer();
    //$('#footerMessage').html(": " + imagesModel.Files.length);
}

function setBreadCrumbs(breadCrumbModel) {
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
                    "<a class='inactiveBreadCrumb' " +
                    "onmouseover = 'slowlyShowFolderInfoDialog(" + breadCrumbModel[i].FolderId + ")' " +
                    "onmouseout = 'forgetHomeFolderInfoDialog=true;' " +
                    "onclick='showFolderInfoDialog(" + breadCrumbModel[i].FolderId + ",\"bc click\")'>" + breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
            }
            else {
                $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                    "href='javascript:rtpe(\"BCC\"," + albumFolderId + ",44," + breadCrumbModel[i].FolderId + ")'>" +
                    breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + " &#187</a>");
            }
        }
    }
}

function setBadges(badgesText) {
    if (!isNullorUndefined(badgesText)) {
        if (badgesText.indexOf("Playmate Of The Year") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=4013'><img src='/Images/pmoy.png' title='Playmate of the year' class='badgeImage'></a>");
        }
        if (badgesText.indexOf("biggest breasted centerfolds") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='badgeImage'></a>");
        }
        if (badgesText.indexOf("black centerfolds") > -1) {
            $('#badgesContainer').append("<div class='blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>");
        }
        if (badgesText.indexOf("Hef likes twins") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=3904'><img src='/Images/gemini03.png' title='Hef likes twins' class='badgeImage'></a>");
        }
    }
}

function setCounts(dirTree, folderId) {
    let subFolderSpan = "unhandled";
    let strBottomCount = "999";
    let nBottomCount = 0;

    if (dirTree.SubDirs.length === 0) {
        $('#deepSlideshowButton').hide();
        $('#galleryBottomfileCount').html(dirTree.ImageLinks.length);
        return;
    }
    if (dirTree.SubDirs.length === 1 && dirTree.RootFolder === "centerfold") {
        $('#deepSlideshowButton').hide();
        //alert("centerfold detected: " + dirTree.RootFolder);
        $('#galleryBottomfileCount').html(dirTree.ImageLinks.length);
        $('#fc' + dirTree.SubDirs[0].FolderId).html("(" + dirTree.SubDirs[0].FileCount + ")");
        return;
    }

    var getSubFolderCountsStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetSubFolderCounts?folderId=" + folderId,
        success: function (subFolderCounts) {
            if (subFolderCounts.Success === "ok") {
                $('#deepSlideshowButton').show();

                $.each(subFolderCounts.SubFolderCountItems, function (idx, obj) {

                    if (subFolderCounts.TotalChildFiles === 0) { // this must be just a collection of stepchildren
                        //strBottomCount = "fstp: " + dirTree.SubDirs.length;
                        subFolderSpan = "(ssp " + dirTree.ImageLinks.length + ")";
                    }

                    if ((dirTree.ImageLinks.length === 0) && (dirTree.SubDirs.length > 0)) {  // normal subfolder gallery
                        //strBottomCount = "(" + dirTree.SubDirs.length + " / " + obj.TotalChildFiles.toLocaleString() + ")";
                        if (obj.SubFolderCount > 0)
                            subFolderSpan = " (" + obj.SubFolderCount + "/" + obj.TotalChildFiles + ")";
                        else
                            subFolderSpan = " (" + obj.FileCount + ")";
                    }

                    if ((dirTree.ImageLinks.length > 0) && (dirTree.SubDirs.length > 0)) {  // mixed gallery
                        if (dirTree.SubDirs.length === 1) {// && dirTree.RootFolder === "centerfold") {
                            $('#aboveImageContainerMessageArea').html("root: " + dirTree.RootFolder);
                            subFolderSpan = " (" + obj.FileCount + ")";
                        }
                        //strBottomCount = "fmess:" + dirTree.FileCount + "  (" + dirTree.SubDirs.length +
                        //    "/" + obj.TotalChildFiles.toLocaleString() + ")";
                        subFolderSpan = " (" + dirTree.SubDirs.length + "/" + obj.FileCount + ")";
                    }

                    $('#fc' + obj.SubFolderId).html(subFolderSpan);
                    nBottomCount += obj.TotalChildFiles;
                });

                if ((dirTree.ImageLinks.length === 0) && (dirTree.SubDirs.length > 0)) {  // normal subfolder gallery
                    strBottomCount = "(" + dirTree.SubDirs.length + "/" + nBottomCount.toLocaleString() + ")";
                }
                if ((dirTree.ImageLinks.length > 0) && (dirTree.SubDirs.length > 0)) {  // mixed gallery
                    strBottomCount = "[" + dirTree.ImageLinks.length + "]  (" + dirTree.SubDirs.length + "/" + nBottomCount.toLocaleString() + ")";
                }
                $('#galleryBottomfileCount').html(strBottomCount);
                let delta = (Date.now() - getSubFolderCountsStart) / 1000;
                console.log("GetSubFolderCounts took: " + delta.toFixed(3));
            }
            else {
                $('#imagePageLoadingGif').hide();
                if (document.domain === 'localhost')
                    setTimeout(function () { alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success) }, 800);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 1,
                        ErrorMessage: imageLinksModel.Success,
                        CalledFrom: "loadAlbum"
                    });
                //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getAlbumImages")) {
                if (document.domain === 'localhost')
                    alert("XHR fail in Album.js: getAlbumImages\n" + errorMessage);
                else
                    logError({
                        VisitorId: aapiVisitorId,
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "loadAlbum"
                    });
            }
        }
    }); 
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
    $('#imagePageLoadingGif').show();
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

function imageCtx(imgSrc, linkId) {
    showImageContextMenu(imgSrc, linkId, albumFolderId, currentAlbumJSfolderName);
}

function folderCtx(imgId) {
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
function folderContextMenuAction(action) {
    switch (action) {
        case "show":
            if ($('#ctxModelName').html() === "unknown model") {
                //showUnknownModelInfoDialog(albumFolderId);
                showFolderInfoDialog(albumFolderId,"folder ctx show");
            }
            $("#imageContextMenu").fadeOut();
            break;
        case "jump":
            rtpe("SEE", albumFolderId, modelFolderId, modelFolderId);
            break;
        case "comment":
            $("#imageContextMenu").fadeOut();
            //showImageCommentDialog(selectedImage, selectedImageLinkId, albumFolderId, currentAlbumJSfolderName);
            showFolderCommentDialog(albumFolderId);
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
            if (typeof pause === 'function')
                pause();
            showFolderInfoDialog(folderId, "bc slowly");
        }
    }, 1800);
}

function folderContextMenuHtml() {
    return "<div id='folderContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div onclick='contextMenuAction(\"openFolder\")'>open folder</div>\n" +
        "    <div id='ctxFolderInfo' onclick='contextMenuAction(\"show\")'>show folder info</div>\n" +
        "    <div id='ctxMetaTags' onclick='contextMenuAction(\"meta\")'>show meta tags</div>\n" +
        //"    <div onclick='contextMenuAction(\"explodeFolderImage\")'>explode</div>\n" +
        "    <div onclick='contextMenuAction(\"showFolderLinks\")'>Show Links</div>\n" +
        //"    <div id='folderLinkInfo' class='innerContextMenuInfo'>\n" +
        //"        <div id='folderLinkInfoContainer'></div>\n" +
        //"    </div>\n" +
        "    <div onclick='contextMenuAction(\"showLinks\")'>Show Folder info</div>\n" +
        "</div>\n";
}

function showFolderCommentDialog() {

    var visitorId = getCookieValue("VisitorId");

    alert("showFolderCommentDialog()");

}

function loadImageListIntoLocalStorage() {



}
