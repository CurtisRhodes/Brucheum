let apFolderName, apFolderRoot, apFolderId = 0, apVisitorId, apFolderType,
    deepFileCount = 0, deepFolderCount = 0;

function loadAlbum(folderId) {
    apVisitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(apVisitorId)) {
        apVisitorId = "stillOkUnknown";
    }
    settingsImgRepo = settingsArray.ImageRepo;
    apFolderId = folderId;
    getAlbumImages(folderId);
    getAlbumPageInfo(folderId)
}

function getAlbumImages() {
    var getImagesStart = Date.now();
    $('#indexPageLoadingGif').show();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" +apFolderId,
            success: function (albumImageInfo) {
                $('#indexPageLoadingGif').hide();
                if (albumImageInfo.Success === "ok") {
                    apFolderRoot = albumImageInfo.RootFolder;

                    switch (albumImageInfo.FolderType) {
                        case "singleParent":
                        case "multiFolder":
                            $('#deepSlideshowButton').show();
                            break;
                        case "singleModel":
                        case "singleChild":
                        case "multiModel":
                            $('#deepSlideshowButton').hide();
                            break;
                        default:
                            logError("SWT", apFolderId, "folder tpe: " + albumImageInfo.FolderType, "getAlbumImages");
                    }

                    //PROCESS IMAGES
                    let labelClass = "defaultSubFolderImage";
                    let imageFrameClass = "folderImageOutterFrame";

                    // IMAGES
                    $('#imageContainer').html('');
                    $.each(albumImageInfo.ImageLinks, function (idx, obj) {
                        //imageFrameClass = "defaultImageFrame";
                        let imgSrc = settingsImgRepo + "/" + obj.FileName;
                        let imageHtml = "<div class='" + imageFrameClass + "'>\n" +
                            "<img id='" + obj.LinkId + "' class='thumbImage'\n" +
                            " onerror='galleryImageError(\"" + obj.LinkId + "\",\"" + obj.SrcId + "\")'\n" +
                            " alt='" + obj.LinkId + "'\n" +
                            " oncontextmenu='albumContextMenu(\"Image\",\"" + obj.LinkId + "\"," + obj.FolderId + ",\"" + imgSrc + "\")'\n" +
                            " onclick='launchViewer(" + obj.FolderId + ",\"" + obj.LinkId + "\",false)'\n" +
                            " src='" + imgSrc + "'/>\n";

                        if (obj.FolderId !== obj.SrcId)
                            imageHtml += "<div class='knownModelIndicator'><img src='images/foh01.png' title='" +
                                obj.SrcFolder + "' onclick='rtpe(\"SEE\",\"abc\",\"detail\"," + obj.SrcId + ")' /></div>\n";

                        imageHtml += "</div>\n";
                        $('#imageContainer').append(imageHtml);
                    });
                    //$('#galleryBottomfileCount').html(albumImageInfo.ImageLinks.length.toLocaleString());

                    //  SUBFOLDERS 
                    if (albumImageInfo.Folders.length > 0) {
                        //$('#galleryBottomfileCount').html("# " + albumImageInfo.ImageLinks.length.toLocaleString() + "/" + albumImageInfo.Folders.length);
                        let countStr = "?";
                        let imgSrc = "?";
                        $.each(albumImageInfo.Folders, function (idx, folder) {
                            countStr = albumImageInfo.Folders.length + "/" + folder.FileCount.toLocaleString();
                            if (isNullorUndefined(folder.FolderImage))
                                imgSrc = "/Images/binaryCodeRain.gif";
                            else
                                imgSrc = settingsImgRepo + folder.FolderImage;

                            $('#imageContainer').append("<div class='" + imageFrameClass + "'\n" +
                                " oncontextmenu='albumContextMenu(\"Folder\",\"" + folder.LinkId + "\"," + folder.FolderId + ",\"" + imgSrc + "\")'\n" +
                                " onclick='rtpe(\"SUB\"," + apFolderId + "," + folder.IsStepChild + "," + folder.FolderId + ")'>\n" +
                                "<img id='" + folder.LinkId + "' class='folderImage'\n" +
                                "onerror='subFolderImgError(\"" + imgSrc + "\")\n' alt='Images/redballon.png'\n src='" + imgSrc + "'/>" +
                                "<div class='" + labelClass + "'>" + folder.DirectoryName + "</div><span Id='fc" + folder.FolderId + "'>" + countStr + "</span></div>");

                            getDeepFolderCounts(folder, albumImageInfo.ImageLinks.length);
                        });
                    }

                    $('#imageContainer').show();
                    resizeImageContainer();
                    //$('#footerMessage').html(": " + imagesModel.Files.length);
                    $('#folderCommentButton').fadeIn();

                    let activityCode = "PGV"
                    if (albumImageInfo.RootFolder === "centerfold")
                        activityCode = "PBV";
                    chargeCredits(activityCode, apFolderId);
                    //getDeepFolderCounts(folderId);

                    let delta = (Date.now() - getImagesStart) / 1000;
                    console.log("GetAlbumImages took: " + delta.toFixed(3));
                    $('.footer').show();

                    getDeepFolderCounts(albumImageInfo, 0);
                }


                else logError("BUG", apFolderId, success, "getAlbumImages");
            },
            error: function (jqXHR) {
                $('#indexPageLoadingGif').hide();
                if (!checkFor404("getAlbumImages")) {
                    logError("XHR",apFolderId, getXHRErrorDetails(jqXHR), "getAlbumImages");
                }
            }
        });
    } catch (e) {
        logError("CAT",apFolderId, e, "getAlbumImages");
    }
}

function getAlbumPageInfo(folderId) {
    var infoStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumPageInfo?visitorId=" + apVisitorId + "&folderId=" +apFolderId,
        success: function (imageLinksModel) {
            if (imageLinksModel.Success === "ok") {

                apFolderName = imageLinksModel.FolderName;
                apFolderType = imageLinksModel.FolderType;

                if (debugMode) $('#aboveImageContainerMessageArea').html("aFolderType: " + imageLinksModel.FolderType);

                document.title = apFolderName + " : OggleBooble";
                $('#seoPageName').html(imageLinksModel.FolderName);

                if ((imageLinksModel.TrackBackItems.length > 0)) {
                    $('#trackbackContainer').css("display", "inline-block");
                    $.each(imageLinksModel.TrackBackItems, function (idx, obj) {
                        switch (obj.SiteCode) {
                            case "FRE":
                                $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">" + imageLinksModel.FolderName + " Free Porn</a></div>");
                                break;
                            case "BAB":
                                $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">Babepedia</a></div>");
                                break;
                            default:
                                logError("SWT", pageId, "site code: " + obj.SiteCode, "getAlbumPageInfo/TrackBackItems");
                        }
                    });
                }
                setBadges(imageLinksModel.ExternalLinks);

                //$('#headerMessage').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
                $('#footerPageHits').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
                logPageHit(folderId);
                $('#folderCommentButton').fadeIn();
                setOggleHeader(folderId, imageLinksModel.RootFolder);
                setOggleFooter(folderId, imageLinksModel.RootFolder);
                $('#footerFolderType').html("folder type: " + imageLinksModel.FolderType);
                setBreadCrumbs(imageLinksModel.BreadCrumbs);
                var delta = (Date.now() - infoStart) / 1000;
                console.log("GetAlbumPageInfo took: " + delta.toFixed(3));
            }
            else logError("BUG",apFolderId, imageLinksModel.Success, "getAlbumPageInfo");
        },
        error: function (jqXHR) {
            if (!checkFor404("getAlbumPageInfo")) logError("XHR",apFolderId, getXHRErrorDetails(jqXHR), "getAlbumPageInfo");
        }
    });
}

function getDeepFolderCounts(folder, currentFolderImageLinks) {
    deepFileCount += currentFolderImageLinks;
    //let deepStart = Date.now();
    $('#fc' + folder.FolderId).html("?");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetSubFolderCounts?folderId=" + folder.FolderId,
        success: function (countsModel) {
            if (countsModel.Success === "ok") {
                if (folder.FolderId !== apFolderId) {
                    if (countsModel.TtlFileCount > 0) {
                        $('#fc' + countsModel.FolderId).html(countsModel.TtlFileCount.toLocaleString());
                    }
                    if (countsModel.TtlFolderCount > 1) {
                        $('#fc' + countsModel.FolderId).html(countsModel.TtlFolderCount + "/" + countsModel.TtlFileCount.toLocaleString());
                    }
                }
                //if (apFolderRoot === "centerfold")
                //var delta = (Date.now() - deepStart) / 1000;
                //console.log("getDeepFolderCounts took: " + delta.toFixed(3));
                deepFileCount += countsModel.TtlFileCount;
                deepFolderCount += countsModel.TtlFolderCount;
                if (Number(folder.FolderId) === Number(apFolderId)) {
                    if (deepFolderCount < 2) 
                        $('#galleryBottomfileCount').html(deepFileCount.toLocaleString());                    
                    else {
                        if (apFolderRoot === "centerfold")
                            $('#galleryBottomfileCount').html("c " + deepFolderCount.toLocaleString());
                        else
                            $('#galleryBottomfileCount').html(deepFolderCount.toLocaleString() + " / " + deepFileCount.toLocaleString());
                    }
                }
                else
                    $('#galleryBottomfileCount').html(deepFileCount.toLocaleString());
            }
            else { logError("BUG", apFolderId, countsModel.Success, "getDeepFolderCounts"); }
        },
        error: function (jqXHR) {
            if (!checkFor404("getAlbumImages")) { logError("XHR", apFolderId, getXHRErrorDetails(jqXHR), "getDeepFolderCounts"); }
        }
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

        alert("badgesText: " + badgesText);

        if (badgesText.indexOf("Playmate Of The Year") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=4013'><img src='/Images/pmoy.png' title='Playmate of the year' class='badgeImage'></a>");
        }
        if (badgesText.indexOf("biggest breasted centerfolds") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='badgeImage'></a>");
        }
        if (badgesText.indexOf("black centerfolds") > -1) {
            $('#badgesContainer').append("<div class='badgeImage blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>");
        }
        if (badgesText.indexOf("Hef likes twins") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=3904'><img src='/Images/gemini03.png' title='Hef likes twins' class='badgeImage'></a>");
        }
    }
}

function directToStaticPage() {
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "api/AlbumPage/GetStaticPage?folderId=" + apFolderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.location.href = successModel.ReturnValue + "?q=35";
            }
            else
                if (!checkFor404("directToStaticPage"))
                    logError("BUG", apFolderId, successModel.Success, "directToStaticPage");
        },
        error: function (jqXHR) {
            if (!checkFor404("directToStaticPage"))
                logError("XHR", apFolderId, getXHRErrorDetails(jqXHR), "directToStaticPage");
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

function galleryImageError(linkId, imgSrc) {
    try {
        alert("subDirImg Error PageId: " + apFolderId + ",\nDirectoryName: " + apFolderRoot + ",\nimgSrc: " + imgSrc);

        $('#' + linkId).attr('src', "Images/redballon.png");
        logDataActivity({
            VisitorId: apVisitorId,
            ActivityCode: "IEG",
            PageId: apFolderId,
            Activity: imgSrc
        });
    } catch (e) {
        logError("CAT", apFolderId, e, "galleryImageError");
    }
}

function subFolderImgError(imgSrc) {
    try {
        alert("subDirImg Error. apFolderId: " + apFolderId + ",\nDirectoryName: " + apFolderRoot + ",\nimgSrc: " + imgSrc);

        logDataActivity({
            VisitorId: apVisitorId,
            ActivityCode: "IMS",
            PageId: apFolderId,
            Activity: imgSrc
        });
    } catch (e) {
        logError("CAT", apFolderId, e, "subFolderImgError");
    }
}

function launchDeepSlideShow()
{
    $('#indexPageLoadingGif').show();
    launchViewer(apFolderId, 1, true);
}

function checkAlbumCost() {
    if (apVisitorId === "stillOkUnknown")
        alert("You must be logged in to view this album");
}

function chargeCredits(activityCode, apFolderId) {
    if (apVisitorId === "stillOkUnknown")
        // at this time this bypass is not handled
        return;

    let credits;
    switch (activityCode) {
        case "PBV": credits = -20; break; // Playboy Page View
        case "PGV": credits = -10; break; // Page View
        default: alert("unhandled awardCredits activityCode: " + activityCode);
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/User/AwardCredits",
        data: {
            VisitorId: apVisitorId,
            ActivityCode: activityCode,
            PageId: apFolderId,
            Credits: credits
        },
        success: function (success) {
            if (success === "ok") {
                //displayStatusMessage("ok", "credits charged");
            }
            else logError("BUG", apFolderId, success, "awardCredits");
        },
        error: function (jqXHR) {
            if (!checkFor404("awardCredits")) logError("XHR", apFolderId, getXHRErrorDetails(jqXHR), "awardCredits");
        }
    });
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
