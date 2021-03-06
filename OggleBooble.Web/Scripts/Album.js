﻿let apFolderName, apFolderRoot, apFolderId = 0, isLargeLoad = false;
const posterFolder = 'https://img.OGGLEBOOBLE.COM/posters/';
let tempDirTree = null;

function loadLargeAlbum(folderId) {
    setOggleHeader("album");
    apFolderId = folderId;
    qucikHeader(folderId);
    //logPageHit(folderId);
    settingsImgRepo = settingsArray.ImageRepo;
    getMultipleAlbumImages(folderId);
    getAlbumPageInfo(folderId, true);
}

function loadAlbum(folderId) {
    if (isNullorUndefined(folderId)) {
        logError("BUG", 999, "folderId not found", "loadAlbum");
        return;
    }
    setOggleHeader("album");
    apFolderId = folderId;
    qucikHeader(folderId);
    logPageHit(folderId);
    settingsImgRepo = settingsArray.ImageRepo;
    getAlbumImages(folderId);
    getAlbumPageInfo(folderId, false);
}

function qucikHeader(folderId) {
    var infoStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetQucikHeader?folderId=" + folderId,
        success: function (albumInfo) {
            if (albumInfo.Success === "ok") {
                resetOggleHeader(folderId, albumInfo.RootFolder);
                setOggleFooter(folderId, albumInfo.RootFolder, "qucikHeader");
                if (albumInfo.RootFolder == "porn")
                    document.title = albumInfo.FolderName + " : OgglePorn";
                else
                    document.title = albumInfo.FolderName + " : OggleBooble";

                setBreadcrumbs(folderId);
                $('#feedbackButton').on("click", function () {
                    showFeedbackDialog(folderId, albumInfo.FolderName);
                });

                let delta = (Date.now() - infoStart) / 1000;
                console.log("QucikHeader took: " + delta.toFixed(3));
            }
            else {
                logError("AJX", folderId, albumInfo.Success, "qucikHeader");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "qucikHeader")) logError("XHR", folderId, errMsg, "qucikHeader");
        }
    });
}

function getMultipleAlbumImages(folderId) {
    //alert("getMultipleAlbumImages: " + folderId);
    let getImagesStart = Date.now();
    $('#albumPageLoadingGif').show();
    $('#galleryBottomfileCount').html("?");
    let imageFrameClass = "folderImageOutterFrame";
    isLargeLoad = true;
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/CatFolder/GetChildFolders?folderId=" + folderId,
            success: function (subFolders) {
                if (subFolders.Success == "ok") {
                    $('#imageContainer').show();
                    $('#imageContainer').html('');
                    $.each(subFolders.childFolders, function (idx, childFolder) {
                        console.log("loading images for " + childFolder.Id);
                        $.ajax({
                            type: "GET",
                            url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" + childFolder.Id,
                            success: function (albumImageInfo) {
                                if (albumImageInfo.Success === "ok") {
                                    $('#albumPageLoadingGif').show();
                                    $.each(albumImageInfo.ImageLinks, function (idx, obj) {
                                        let imgSrc = settingsImgRepo + "/" + obj.FileName;
                                        if (obj.FileName.endsWith("mpg") || obj.FileName.endsWith("mp4")) {
                                            $('#imageContainer').append(
                                                "<div class='" + imageFrameClass +
                                                "' oncontextmenu='albumContextMenu(\"Video\",\"" + obj.LinkId + "\"," +
                                                obj.FolderId + ",\"" + posterFolder + obj.Poster + "\")'>" +
                                                "<video id='" + obj.LinkId + "' controls='controls' class='thumbImage' " +
                                                " poster='" + posterFolder + obj.Poster + "' >" +
                                                "   <source src='" + imgSrc + "' type='video/mp4' label='label'>" +
                                                "</video></div>");
                                        }
                                        else {
                                            //  ImageLinks
                                            let imageHtml = "<div class='" + imageFrameClass + "'>\n" +
                                                "<img id='" + obj.LinkId + "' class='thumbImage'\n" +
                                                " onerror='galleryImageError(\"" + obj.LinkId + "\",\"" + obj.SrcId + "\)'\n" +
                                                " alt='" + obj.LinkId + "' titile='" + obj.DirectoryName + "' \n" +
                                                " oncontextmenu='albumContextMenu(\"Image\",\"" + obj.LinkId + "\"," + obj.FolderId + ",\"" + imgSrc + "\")'\n" +
                                                " onclick='launchViewer(" + folderId + ",\"" + obj.LinkId + "\",true)' src='" + imgSrc + "'/>\n";
                                            if (obj.FolderId !== obj.SrcId)
                                                imageHtml += "<div class='knownModelIndicator'><img src='images/foh01.png' title='" +
                                                    obj.SrcFolder + "' onclick='rtpe(\"SEE\",\"abc\",\"detail\"," + obj.SrcId + ")' /></div>\n";

                                            imageHtml += "</div>\n";
                                            $('#imageContainer').append(imageHtml);
                                        }
                                    });
                                    $('#albumPageLoadingGif').hide();
                                }
                                else {
                                    logError("AJX", folderId, albumImageInfo.Success, "getAlbumImages");
                                }
                            },
                            error: function (jqXHR) {
                                $('#albumPageLoadingGif').hide();
                                let errMsg = getXHRErrorDetails(jqXHR);
                                alert("getMultipleAlbumImages XHR: " + errMsg);
                                if (!checkFor404(errMsg, folderId, "getMultipleAlbumImages")) logError("XHR", folderId, errMsg, "getMultipleAlbumImages");
                            }
                        });
                    });
                    $('#imageContainer').show();
                    resizeAlbumPage();
                    //$('#footerMessage').html(": " + imagesModel.Files.length);
                    $('#folderCommentButton').fadeIn();
                    let delta = (Date.now() - getImagesStart) / 1000;
                    console.log("getMultipleAlbumImages took: " + delta.toFixed(3));
                    $('.footer').show();
                }
                else {
                    logError("AJX", folderId, albumImageInfo.Success, "getMultipleAlbumImages");
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "getMultipleAlbumImages")) logError("XHR", folderId, errMsg, "getMultipleAlbumImages");
            }
        });
    } catch (e) {
        alert("getAlbumImages: " + e);
        logError("CAT", folderId, e, "getAlbumImages");
    }
}

function getAlbumImages(folderId) {
    var getImagesStart = Date.now();
    const posterFolder = 'https://img.OGGLEBOOBLE.COM/posters/';
    $('#albumPageLoadingGif').show();
    $('#galleryBottomfileCount').html("?");
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" + folderId,
            success: function (albumImageInfo) {
                $('#albumPageLoadingGif').hide();
                if (albumImageInfo.Success === "ok") {
                    //PROCESS IMAGES
                    let labelClass = "defaultSubFolderImage";
                    let imageFrameClass = "folderImageOutterFrame";

                    // IMAGES
                    $('#imageContainer').html('');
                    $.each(albumImageInfo.ImageLinks, function (idx, obj) {
                        let imgSrc = settingsImgRepo + "/" + obj.FileName;
                        if (obj.FileName.endsWith("mpg") || obj.FileName.endsWith("mp4")) {
                            $('#imageContainer').append(
                                "<div class='" + imageFrameClass +
                                "' oncontextmenu='albumContextMenu(\"Video\",\"" + obj.LinkId + "\"," +
                                obj.FolderId + ",\"" + posterFolder + obj.Poster + "\")'>" +
                                "<video id='" + obj.LinkId + "' controls='controls' class='thumbImage' " +
                                " poster='" + posterFolder + obj.Poster + "' >" +
                                "   <source src='" + imgSrc + "' type='video/mp4' label='label'>" +
                                "</video></div>");
                        }
                        else {
                            //  getMultipleAlbumImages
                            let imageHtml = "<div class='" + imageFrameClass + "'>\n" +
                                "<img id='" + obj.LinkId + "' class='thumbImage'\n" +
                                " onerror='galleryImageError(\"" + obj.LinkId + "\",\"" + obj.SrcId + "\)'\n" +
                                " alt='" + obj.LinkId + "' titile='" + obj.SrcFolder + "' \n" +
                                " oncontextmenu='albumContextMenu(\"Image\",\"" + obj.LinkId + "\"," + obj.FolderId + ",\"" + imgSrc + "\")'\n" +
                                " onclick='launchViewer(" + obj.FolderId + ",\"" + obj.LinkId + "\",false)' src='" + imgSrc + "'/>\n";

                            if (obj.FolderId !== obj.SrcId)
                                imageHtml += "<div class='knownModelIndicator'><img src='images/foh01.png' title='" +
                                    obj.SrcFolder + "' onclick='rtpe(\"SEE\",\"abc\",\"detail\"," + obj.SrcId + ")' /></div>\n";

                            imageHtml += "</div>\n";
                            $('#imageContainer').append(imageHtml);
                        }
                    });

                    //  SUBFOLDERS 
                    if (albumImageInfo.Folders.length > 0) {
                        //let imgSrc
                        //let folderName = folder.DirectoryName;
                        //if (folder.RootFolder == "centerfold") {
                        //}

                        $.each(albumImageInfo.Folders, function (idx, folder) {
                            let folderCounts = "(" + folder.FileCount.toLocaleString() + ")";
                            if (folder.SubDirCount > 0)
                                folderCounts = "(" + folder.SubDirCount + "/" + (folder.FileCount + folder.TotalChildFiles).toLocaleString() + ")";

                            if (isNullorUndefined(folder.FolderImage)) {
                                imgSrc = "/Images/binaryCodeRain.gif";
                                logError("FIM", folder.FolderId, "FolderImage missing", "get AlbumImages");
                            }
                            else
                                imgSrc = settingsImgRepo + folder.FolderImage;

                            $('#imageContainer').append("<div class='" + imageFrameClass + "'\n" +
                                " oncontextmenu='albumContextMenu(\"Folder\",\"" + folder.LinkId + "\"," + folder.FolderId + ",\"" + imgSrc + "\")'\n" +
                                " onclick='folderClick(" + folder.FolderId + "," + folder.IsStepChild + ")'>\n" +
                                "<img id='" + folder.LinkId + "' class='folderImage'\n" +
                                "onerror='subFolderImgError(\"" + folder.LinkId + "\",\"" + imgSrc + "\")\n' alt='Images/redballon.png'\n src='" + imgSrc + "'/>" +
                                "<div class='" + labelClass + "'>" + folder.DirectoryName + "</div>\n" +
                                "<span Id='fc" + folder.FolderId + "'>" + folderCounts + "</span></div>");
                        });
                    }

                    $('#imageContainer').show();
                    resizeAlbumPage();
                    //$('#footerMessage').html(": " + imagesModel.Files.length);
                    $('#folderCommentButton').fadeIn();
                    let delta = (Date.now() - getImagesStart) / 1000;
                    console.log("Get albumImages took: " + delta.toFixed(3));
                    $('.footer').show();
                }
                else {
                    logError("AJX", folderId, albumImageInfo.Success, "get albumImages");
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "get albumImages")) logError("XHR", folderId, errMsg, "get albumImages");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "get albumImages");
    }
}

function getAlbumPageInfo(folderId, isLargeLoad) {
    var infoStart = Date.now();

    let visitorId = getCookieValue("VisitorId");

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumPageInfo?folderId=" + folderId + "&visitorId=" +visitorId,
        success: function (albumInfo) {
            if (albumInfo.Success === "ok") {
                apFolderName = albumInfo.FolderName;
                $('#folderCommentButton').on("click", function () {
                    showFolderCommentDialog(folderId, albumInfo.FolderName);
                });

                ////function addMetaTags() {
                //jQuery("head").append("<meta property='og:title' content='" + albumInfo.FolderName + ">");
                //let aKeywords = "big naturals, naked, nude, big boobs, big tits, Every Playboy Centerfold, ";
                //jQuery("head").append("<meta property='keywords' content='" + aKeywords + albumInfo.FolderName + ">");
                $('#seoPageName').html(albumInfo.FolderName);

                $('#deepSlideshowButton').hide();
                $('#largeLoadButton').hide();
                if (isLargeLoad) {
                    $('#galleryBottomfileCount').html(albumInfo.TotalChildFiles.toLocaleString());
                    logEvent("LAP", folderId, apFolderName, "SubFolders: " + albumInfo.TotalSubFolders);
                }
                else {
                    if ((albumInfo.FolderType === "singleChild") || (albumInfo.FolderType === "singleModel") || (albumInfo.FolderType === "multiModel")) {
                        $('#galleryBottomfileCount').html(albumInfo.FileCount.toLocaleString());
                    }
                    else {
                        if (albumInfo.FolderType === "multiFolder") {
                            if (albumInfo.TotalSubFolders > albumInfo.FolderCount) {
                                $('#galleryBottomfileCount').html("<span id='spanDeepCount' class='clickable' onclick='getDeepFolderCounts(" + folderId + ")' >.</span>" +
                                    albumInfo.FolderCount.toLocaleString() + " / " + albumInfo.TotalChildFiles.toLocaleString());
                            }
                            else
                                $('#galleryBottomfileCount').html("<span id='spanDeepCount' class='clickable' onclick='getDeepFolderCounts(" + folderId + ")' >.</span>" +
                                    + albumInfo.TotalSubFolders.toLocaleString() + " / " + albumInfo.TotalChildFiles.toLocaleString());
                        }
                        else {
                            $('#galleryBottomfileCount').html("<span id='spanDeepCount' class='clickable' onclick='getDeepFolderCounts(" + folderId + ")' >.</span>" +
                                albumInfo.FolderCount + " / " + albumInfo.TotalChildFiles.toLocaleString());
                        }
                        $('#deepSlideshowButton').show();
                        $('#largeLoadButton').show();
                    }
                }
                if (debugMode) $('#aboveImageContainerMessageArea').html("aFolderType: " + albumInfo.FolderType);

                if ((albumInfo.TrackBackItems.length > 0)) {
                    $('#trackbackContainer').css("display", "inline-block");
                    $.each(albumInfo.TrackBackItems, function (idx, obj) {
                        switch (obj.SiteCode) {
                            case "FRE":
                                //alert("ss for " + obj.LinkStatus);
                                if (obj.LinkStatus == "ok")
                                    $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">" + albumInfo.FolderName + " Free Porn</a></div>");
                                break;
                            case "BAB":
                                $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">Babepedia</a></div>");
                                break;
                            case "IND":
                                $('#trackbackLinkArea').append("<div class='trackBackLink'><a href='" + obj.Href + "' target=\"_blank\">Indexx</a></div>");
                                break;
                            default:
                                logError("SWT", folderId, "site code: " + obj.SiteCode, "getAlbumPageInfo/TrackBackItems");
                        }
                    });
                }

                $('#folderCommentButton').fadeIn();

                setBadges(albumInfo.FolderComments);

                $('#footerPageHits').html("page hits: " + albumInfo.PageHits.toLocaleString());
                $('#footerFolderType').html("folder type: " + albumInfo.FolderType);
                if (!isNullorUndefined(albumInfo.StaticFile)) {
                    $('#footerStaticPage').html("<a href='" + albumInfo.StaticFile + "'>static page created: " + albumInfo.StaticFileUpdate + "</a>\n");
                }
                var delta = (Date.now() - infoStart) / 1000;
                console.log("GetAlbumPageInfo took: " + delta.toFixed(3));
                checkRegistrationStatus(folderId, visitorId, albumInfo);
            }
            else {
                if (albumInfo.Success.indexOf("Sequence contains no elements") > 0) {
                    logError("MIS", folderId, albumInfo.Success, "get albumImages");
                    window.location.href = "Index.html";
                }
                logError("AJX", folderId, albumInfo.Success, "get albumImages");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "getAlbumPageInfo")) logError("XHR", folderId, errMsg, "getAlbumPageInfo");
        }
    });
}

function checkRegistrationStatus(folderId, visitorId, albumInfo) {
    try {
        if (!isLoggedIn()) {
            if (albumInfo.FolderType == "singleChild") {
                if ((albumInfo.RootFolder == "centerfold") || (albumInfo.RootFolder == "muses")
                    || (albumInfo.RootFolder == "cybergirl") || (albumInfo.RootFolder == "playboy"))
                {
                    if (albumInfo.UserPageHits > 100) {
                        let visitorId = getCookieValue("VisitorId");
                        if ((visitorId == "cookie not found") || (visitorId == "user does not accept cookies")) {
                            if (visitorId == "user does not accept cookies") {
                                showCustomMessage('25aada3a-84ac-45a9-b85f-199876b297be');
                                $('#customMessageContainer').css("top", 250);
                                $('#customMessageContainer').css("left", 400);
                                logActivity2(visitorId, "LG2", folderId, "check registration status"); // cookies required
                            }
                        }
                        else {
                            showCustomMessage('0783d756-04bb-4339-9029-75c9a2f93d8b', false);
                            $('#customMessageContainer').css("top", 255);
                            $('#customMessageContainer').css("left", 522);
                            logActivity2(visitorId, "LG1", folderId, "check registration status"); // asked please to login
                        }
                    }
                }
            }
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "check registration status");
    }
}

function getDeepFolderCounts(folderId) { 
    $('#spanDeepCount').html("?");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/PageCount/GetDeepFolderCounts?folderId=" + folderId,
        success: function (countsModel) {
            if (countsModel.Success === "ok") {
                if (countsModel.FolderCount > 0)
                    $('#galleryBottomfileCount').html(countsModel.FolderCount.toLocaleString() + " / " + countsModel.TtlFileCount.toLocaleString());
                else
                    $('#galleryBottomfileCount').html(countsModel.FileCount.toLocaleString());
            }
            else {
                logError("AJX", folderId, countsModel.Success, "get DeepFolderCounts");
                $('#galleryBottomfileCount').html = countsModel.Success;
            }
            console.log("deep file count from: " + folderId + " count took: " + countsModel.TimeTook + " changes made: " + countsModel.Changes);
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "getDeepFolderCounts")) logError("XHR", folderId, errMsg, "getDeepFolderCounts");
        }
    });
}

function albumContextMenu(menuType, linkId, folderId, imgSrc) {
    //alert("$(window).scrollTop(): " + $(window).scrollTop() + " event.clientY: " + event.clientY);    
    pos.x = event.clientX;
    pos.y = event.clientY + $(window).scrollTop();
    showContextMenu(menuType, pos, imgSrc, linkId, folderId, apFolderName);
}

function setBreadcrumbs(folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetBreadcrumbs?folderId=" + folderId,
        success: function (breadCrumbSuccess) {
            // a woman commited suicide when pictures of her "came out"
            // title: I do not remember having been Invited)
            if (breadCrumbSuccess.Success == "ok") {
                $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:rtpe(\"BCC\"," + apFolderId + "\,\"root\",1)'>root  &#187</a>");
                for (i = breadCrumbSuccess.BreadCrumbs.length - 1; i >= 0; i--) {
                    if (breadCrumbSuccess.BreadCrumbs[i] === null) {
                        breadCrumbSuccess.Success = "BreadCrumbs[i] == null : " + i;
                        $('#breadcrumbContainer').html("BreadCrumbs[i] == null : " + i);
                    }
                    else {
                        if (breadCrumbSuccess.BreadCrumbs[i].IsInitialFolder) {
                            if (isLargeLoad) {
                                $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                                    "href='javascript:rtpe(\"BCC\"," + apFolderId + ",\"" +
                                    breadCrumbSuccess.BreadCrumbs[i].FolderName + "\"," + breadCrumbSuccess.BreadCrumbs[i].FolderId + ")'>" +
                                    "return to " + breadCrumbSuccess.BreadCrumbs[i].FolderName + "</a>"
                                );
                            }
                            else {
                                $('#breadcrumbContainer').append(
                                    "<a class='inactiveBreadCrumb' " +
                                    "onmouseover = 'slowlyShowFolderInfoDialog(" + breadCrumbSuccess.BreadCrumbs[i].FolderId + ")' " +
                                    "onmouseout = 'forgetHomeFolderInfoDialog=true;' " +
                                    "onclick='forgetHomeFolderInfoDialog=\"true\";showFolderInfoDialog(" +
                                    breadCrumbSuccess.BreadCrumbs[i].FolderId + ",\"bc click\")'>" +
                                    breadCrumbSuccess.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>"
                                );
                            }
                        }
                        else {
                            $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                                "href='javascript:rtpe(\"BCC\"," + apFolderId + ",\"" +
                                breadCrumbSuccess.BreadCrumbs[i].FolderName + "\"," + breadCrumbSuccess.BreadCrumbs[i].FolderId + ")'>" +
                                breadCrumbSuccess.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + " &#187</a>"
                            );
                        }
                    }
                }
            }
            else {
                $('#breadcrumbContainer').html("set Breadcrumbs: " + breadCrumbSuccess.Success);
                logError("AJX", folderId, albumInfo.Success, "set Breadcrumbs");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "set Breadcrumbs")) logError("XHR", folderId, errMsg, "set Breadcrumbs");
        }
    });
}

function setBadges(folderComments) {
    if (!isNullorUndefined(folderComments)) {
        if (folderComments.toUpperCase().indexOf("PLAYMATE OF THE YEAR") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=4013'><img src='/Images/pmoy.png' title='Playmate of the year' class='badgeImage'></a>");
        }
        if (folderComments.toUpperCase().indexOf("BIGGEST BREASTED CENTERFOLDS") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=3900'><img src='/Images/biggestBreasts.png' title='biggest breasted centerfolds' class='badgeImage'></a>");
        }
        if (folderComments.toUpperCase().indexOf("BLACK CENTERFOLD") > -1) {
            $('#badgesContainer').append("<div class='badgeImage blackCenterfoldsBanner'>\n<a href='/album.html?folder=3822'>black centerfolds</a></div>");
        }
        if (folderComments.toUpperCase().indexOf("HEF LIKES TWINS") > -1) {
            $('#badgesContainer').append("<a href='/album.html?folder=3904'><img src='/Images/gemini03.png' title='Hef likes twins' class='badgeImage'></a>");
        }
    }
}

function galleryImageError(linkId, imgSrc) {
    setTimeout(function () {
        if ($('#' + linkId).attr('src') == null) {
            $('#' + linkId).attr('src', "Images/redballon.png");
            logError("ILF", apFolderId, "linkId: " + linkId + " imgSrc: " + imgSrc, "galleryImageError");
        }
    }, 600);
}

function subFolderImgError(linkId, imgSrc) {
    setTimeout(function () {
        if ($('#' + linkId).attr('src') == null) {
            $('#' + linkId).attr('src', "Images/redballon.png");
            logError("ILF", apFolderId, "linkId: " + linkId + " imgSrc: " + imgSrc, "subFolderImg");
        }
    }, 600);
}

function launchLargeLoad() {
    //alert("launch Large Load: " + apFolderId);
    logEvent("LLL", apFolderId, "album.js", apFolderName);
    window.location.href = "/album.html?parentfolder=" + apFolderId;  //  open page in same window
}

function launchDeepSlideShow() {
    $('#albumPageLoadingGif').show();
    logEvent("DSC", apFolderId, apFolderName, "launchDeepSlideShow");
    launchViewer(apFolderId, 1, true);
    //    let visitorId = getCookieValue("VisitorId");
    //    sendEmail("CurtishRhodes@hotmail.com", "DeepSlideshow@Ogglebooble.com",
    //        "deep slideshow clicked", "Visitor Id: " + visitorId + "<br/>Folder: " + apFolderName);
}

function checkAlbumCost() {
    //alert("You must be logged in to view this album");
}

function chargeCredits(folderId, rootFolder) {
        let activityCode = "PGV"  //  
    if (rootFolder === "centerfold")
        activityCode = "PBV";
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
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: activityCode,
            PageId: folderId,
            Credits: credits
        },
        success: function (success) {
            if (success === "ok") {
                //displayStatusMessage("ok", "credits charged");
            }
            else logError("AJX", folderId, success, "awardCredits");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "chargeCredits")) logError("XHR", folderId, errMsg, "chargeCredits");
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

function folderClick(folderId, isStepChild) {
    if (isStepChild == 1)
        window.open("/album.html?folder=" + folderId, "_blank");  // open in new tab
    else {

        // report event pare hit

        window.location.href = "/album.html?folder=" + folderId;  //  open page in same window
    }
    //" onclick='rtpe(\"SUB\",\"called from: " + folderId + "\",\"" + folder.DirectoryName + "\"," + folder.FolderId + ")'>\n" +
}

