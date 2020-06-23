﻿var viewerShowing = false;
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
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" + folderId,
                success: function (imagesModel) {
                    $('#imagePageLoadingGif').hide();
                    if (imagesModel.Success === "ok") {
                        processImages(imagesModel);
                        $('#folderCommentButton').fadeIn();
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

                        $('#headerMessage').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
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

function processImages(imagesModel) {
    var imageFrameClass = "folderImageOutterFrame";
    var subDirLabel = "subDirLabel";
    var imageEditor = isInRole("Image Editor");
    $('#imageContainer').html('');

    if (imagesModel.RootFolder === "porn" || imagesModel.RootFolder === "sluts") {
        imageFrameClass = "pornFolderImageOutterFrame";
        subDirLabel = "pornSubDirLabel";
    }
    // IMAGES

    //string LinkId { get; set; }
    //int Id { get; set; }
    //int SrcId { get; set; }
    //string FileName { get; set; }
    //string SrcFolder { get; set; }
    //string Orientation { get; set; }
    //bool Islink { get; set; }
    //int SortOrder { get; set; }
    if (imageEditor) {
        if (imagesModel.RootFolder === "archive") {
            if (imagesModel.LinkCount > 1) {
                imageFrameClass = "multiLinkImageFrame";
            }
        }
        else {
            if (imagesModel.LinkCount > 1) {
                imageFrameClass = "nonLocalImageFrame";
            }
        }// imageModelFile
    }  // startSlideShow(folderId, linkId)

    if (imagesModel.SubDirs.length > 1) {
        var totalChildImages = 0;
        $('#deepSlideshow').show();
        $.each(imagesModel.SubDirs, function (idx, obj) {
            totalChildImages += obj.FileCount;
        });
        $('#fileCount').html(imagesModel.SubDirs.length + "/" + totalChildImages.toLocaleString());
    }
    else {
        $('#fileCount').html(imagesModel.Files.length);
    }
    if (imagesModel.Files.length > 0 && imagesModel.SubDirs.length > 0)
        $('#fileCount').html(imagesModel.Files.length + "  (" + imagesModel.SubDirs.length + ")");

    // FILES
    $.each(imagesModel.Files, function (idx, imageModelFile) {
        imageFrameClass = "imageFrame";
        let imgSrc = settingsImgRepo + "/" + imageModelFile.FileName;

        let appendKluge = "<div id='" + imageModelFile.LinkId + "' class='" + imageFrameClass + "'>" +
            // "<img class='thumbImage' onerror='albumImgError(" + imgSrc + ")' alt='" + imgSrc + "' " +
            "<img class='thumbImage' alt='" + imgSrc + "' " +
            " oncontextmenu='imageCtx(\"" + imgSrc + "\",\"" + imageModelFile.LinkId + "\")'" +
            " onclick='startSlideShow(" + imageModelFile.Id + ",\"" + imageModelFile.LinkId + "\")'" + " src='" + imgSrc + "'/>";
        if (imageModelFile.Id !== imageModelFile.SrcId)
            appendKluge += "<div class='knownModelIndicator'><img src='images/foh01.png' title='" +
                imageModelFile.SrcFolder + "' onclick='rtpe(\"SEE\",\"abc\",\"detail" + imageModelFile.SrcId + "\")' /></div>";
        appendKluge += "</div>";
        $('#imageContainer').append(appendKluge);
    });

    //  SUBFOLDERS 
    $.each(imagesModel.SubDirs, function (idx, subDir) {

        imgSrc = settingsImgRepo + subDir.FolderImage;
        var kludge = "<div id='" + subDir.LinkId + "' class='" + imageFrameClass +
            "' oncontextmenu='folderCtx(\"" + subDir.LinkId + "\")'" +
            " onclick='subFolderPreClick(\"" + subDir.IsStepChild + "\",\"" + subDir.FolderId + "\")'>" +
            "<img class='folderImage' albumImgError(" + imgSrc + ")' alt='" + imgSrc + "' src='" + imgSrc + "'/>";

        let subDirCount = subDir.SubDirs.length;

        if (subDir.FolderId === 10)
            alert("subDirCount: " + subDirCount);


        if (subDirCount === 0)
            kludge += "<div class='" + subDirLabel + "'   >" +
                subDir.DirectoryName + "  (" + subDir.FileCount + ")</div></div>";
        else {
            deepChildCount = 0;
            getDeepChildCount(subDir);
            if (deepChildCount === 0) { // this must be just a collection of stepchildren
                $('#fileCount').html(subDirCount);
                // get deep count of stepchildren
                kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDir.SubDirCount + ")</div></div>";
            }
            else {
                if (subDirCount > 1)
                    kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDirCount + "/" + deepChildCount.toLocaleString() + ")</div></div>";
                else
                    kludge += "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + deepChildCount.toLocaleString() + ")</div></div>";
            }
        }
        $('#imageContainer').append(kludge);
    });

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

function albumImgError(fileName) {
    alert("albumImgError:" + fileName);
    //subDir.Link = "Images/redballon.png";
    $(this).attr('src', "Images/redballon.png");
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
