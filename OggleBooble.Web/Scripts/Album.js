let apFolderName, apFolderRoot, apFolderId, deepChildCount = 0, aapiVisitorId, apFolderType;

function loadAlbum(folderId) {
    aapiVisitorId = getCookieValue("VisitorId");
    try {
        settingsImgRepo = settingsArray.ImageRepo;
        if (isNullorUndefined(aapiVisitorId)) {
            if (document.domain === 'localhost')
                alert("visitorId undefined, CalledFrom: loadAlbum");
            else
                logError({ VisitorId: aapiVisitorId, ActivityCode: "XXX", Severity: 1, ErrorMessage: "visitorId undefined, CalledFrom: loadAlbum" });
        }
        else {
            apFolderId = folderId;
            getAlbumImages(folderId);
            getAlbumPageInfo(folderId)
        }
    }
    catch (e) {
        $('#imagePageLoadingGif').hide();
        if (document.domain === 'localhost')
            alert("Catch Error in Album.js: loadAlbum\n" + e);
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

function getAlbumImages(folderId) {
    var getImagesStart = Date.now();
    $('#imagePageLoadingGif').show();
    $('.footer').hide();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" + folderId,
        success: function (albumImageInfo) {
            $('#imagePageLoadingGif').hide();
            if (albumImageInfo.Success === "ok") {
                processImages(albumImageInfo);
                $('#folderCommentButton').fadeIn();
                setCounts(albumImageInfo, folderId);
                if (albumImageInfo.RootFolder === "centerfold")
                    awardCredits("PBV", folderId);
                else
                    awardCredits("PGV", folderId);
                let delta = (Date.now() - getImagesStart) / 1000;
                console.log("GetAlbumImages took: " + delta.toFixed(3));
                $('.footer').show();
            }
            else {
                $('#imagePageLoadingGif').hide();
                if (document.domain === 'localhost')
                    alert("jQuery fail in Album.js: getAlbumImages\n" + albumImageInfo.Success);
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
function getAlbumPageInfo(folderId) {
    var infoStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumPageInfo?visitorId=" + aapiVisitorId + "&folderId=" + folderId,
        success: function (imageLinksModel) {
            if (imageLinksModel.Success === "ok") {

                apFolderName = imageLinksModel.FolderName;
                apFolderType = imageLinksModel.FolderType;
                document.title = apFolderName + " : OggleBooble";

                apFolderRoot = imageLinksModel.RootFolder;

                if (isNullorUndefined(apFolderRoot))
                    alert("apFolderRoot");

                setOggleHeader(folderId, apFolderRoot);
                setOggleFooter(folderId, apFolderRoot);
                //setAlbumPageCSS(imageLinksModel.FolderType);

                //$('#aboveImageContainerMessageArea').html("FolderType: " + imageLinksModel.FolderType);
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
                    alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success);
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
            if (!checkFor404("getAlbumImages")) {
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

function processImages(albumImageInfo) {
    let labelClass = "defaultSubFolderImage";  
    let imageFrameClass = "folderImageOutterFrame";

    $('#imageContainer').html('');
    // IMAGES
    $.each(albumImageInfo.ImageLinks, function (idx, obj) {
        //imageFrameClass = "defaultImageFrame";
        let imgSrc = settingsImgRepo + "/" + obj.FileName;
        let imageHtml = "<div class='" + imageFrameClass + "'>\n" +
            "<img id='" + obj.LinkId + "' class='thumbImage'\n" +
            " onerror='galleryImageError(\"" + obj.LinkId + "\",\"" + obj.SrcId + "\")'\n" +
            " alt='" + obj.LinkId + "'\n" +
            " oncontextmenu='albumContextMenu(\"Image\",\"" + obj.LinkId + "\"," + apFolderId + ",\"" + imgSrc + "\")'\n" +
            " onclick='launchViewer(" + obj.Id + ",\"" + obj.LinkId + "\",false)'\n" +
            " src='" + imgSrc + "'/>\n";
        if (obj.Id !== obj.SrcId)
            imageHtml += "<div class='knownModelIndicator'><img src='images/foh01.png' title='" +
                obj.SrcFolder + "' onclick='rtpe(\"SEE\",\"abc\",\"detail\"," + obj.SrcId + "\")' /></div>\n";
        imageHtml += "</div>\n";
        $('#imageContainer').append(imageHtml);
    });

    //  SUBFOLDERS 
    $.each(albumImageInfo.SubDirs, function (idx, subDir) {
        let imgSrc = settingsImgRepo + subDir.FolderImage;
        $('#imageContainer').append("<div class='" + imageFrameClass + "'\n" +
            " oncontextmenu='albumContextMenu(\"Folder\",\"" + subDir.LinkId + "\"," + subDir.FolderId + ",\"" + imgSrc + "\")'\n" +
            " onclick='rtpe(\"SUB\"," + apFolderId + "," + subDir.IsStepChild + "," + subDir.FolderId + ")'>\n" +
            "<img id='" + subDir.LinkId + "' class='folderImage'\n" +
            "onerror='subFolderImgError(\"" + subDir.FolderId + "\"," + imgSrc + ")\n' alt='Images/redballon.png'\n src='" + imgSrc + "'/>" +
            "<div class='" + labelClass + "'>" + subDir.DirectoryName + "</div><span Id='fc" + subDir.FolderId + "'> ...</span></div>");

        //rtpe('SUB',"\"+ apFolderId+"\",\"", subFolderPreClickFolderId);
        //rtpe("SUB", albumFolderId, "ISSTEPCHILD", subFolderPreClickFolderId);

    });
    // $('#aboveImageContainerMessageArea').html(folde
    $('#imagePageLoadingGif').hide();
    $('#imageContainer').show();
    resizeImageContainer();
    //$('#footerMessage').html(": " + imagesModel.Files.length);
}

function galleryImageError(linkId, imgSrc) {
    //alert("galleryImageError: " + linkId);
    //$(this).attr('src', "Images/redballon.png");
    $('#' + linkId).attr('src', "Images/redballon.png");
    logDataActivity({
        VisitorId: getCookieValue("VisitorId"),
        ActivityCode: "IEG",
        PageId: apFolderId,
        Activity: imgSrc
    });
}

function subFolderImgError(folderId, imgSrc) {
    // $('#' + objSubDir.LinkId).attr('src', "Images/redballon.png");

    // get error info
    alert("subDirImg Error PageId: " + folderId + ",\nDirectoryName: " + apFolderRoot + ",\nimgSrc: " + imgSrc);
    logDataActivity({
        VisitorId: getCookieValue("VisitorId"),
        ActivityCode: "IMS",
        PageId: folderId,
        Activity: imgSrc
    });
}

function albumContextMenu(menuType, linkId, folderId, imgSrc) {
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu(menuType, pos, imgSrc, linkId, folderId, apFolderName);
}

function setAlbumPageCSS() {

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
}

function setBreadCrumbs(breadCrumbModel) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)
    $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:rtpe(\"BCC\"," +
        apFolderId + ",33,1)'>root  &#187</a>");
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
                    "onclick='forgetHomeFolderInfoDialog=\"true\";showFolderInfoDialog(" + breadCrumbModel[i].FolderId + ",\"bc click\")'>" + breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
            }
            else {
                $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                    "href='javascript:rtpe(\"BCC\"," + apFolderId + ",44," + breadCrumbModel[i].FolderId + ")'>" +
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

function launchDeepSlideShow()
{
    $('#imagePageLoadingGif').show();
    launchViewer(apFolderId, 1, true);
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

function loadImageListIntoLocalStorage() {



}
