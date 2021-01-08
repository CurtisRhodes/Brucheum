let apFolderName, apFolderRoot, apFolderId = 0, apVisitorId, ttlFiles, ttlFolders;

function loadAlbum(folderId) {
    if (isNullorUndefined(folderId)) {
        logError("BUG", 999, "folderId not found", "loadAlbum");
        return;
    }
    qucikHeader(folderId);
    logPageHit(folderId);

    apFolderId = folderId;

    apVisitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(apVisitorId)) {
        apVisitorId = "stillOkUnknown";
    }
    settingsImgRepo = settingsArray.ImageRepo;
    getAlbumImages(folderId);
    getAlbumPageInfo(folderId);
}

function qucikHeader(folderId) {
    var infoStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetQucikHeader?folderId=" + folderId,
        success: function (albumInfo) {
            if (albumInfo.Success === "ok") {
                if (albumInfo.RootFolder == "porn")
                    document.title = albumInfo.FolderName + " : OgglePorn";
                else
                    document.title = albumInfo.FolderName + " : OggleBooble";

                setOggleHeader(folderId, albumInfo.RootFolder);
                setOggleFooter(folderId, albumInfo.RootFolder);

                var delta = (Date.now() - infoStart) / 1000;
                console.log("QucikHeader took: " + delta.toFixed(3));
            }
            else {
                logError("AJX", folderId, albumInfo.Success, "qucikHeader");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function getAlbumImages(folderId) {
    var getImagesStart = Date.now();
    const posterFolder = 'https://img.OGGLEBOOBLE.COM/posters/';
    $('#indexPageLoadingGif').show();
    $('#galleryBottomfileCount').html("?");
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumImages?folderId=" + folderId,
            success: function (albumImageInfo) {
                $('#indexPageLoadingGif').hide();
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

                            //imageFrameClass = "defaultImageFrame";
                            //let imgSrc = settingsImgRepo + "/" + obj.FileName;
                            let imageHtml = "<div class='" + imageFrameClass + "'>\n" +
                                "<img id='" + obj.LinkId + "' class='thumbImage'\n" +
                                " onerror='galleryImageError(\"" + obj.LinkId + "\",\"" + obj.SrcId + "\)'\n" +
                                " alt='" + obj.LinkId + "' titile='" + obj.DirectoryName + "' \n" +
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
                        let imgSrc;
                        $.each(albumImageInfo.Folders, function (idx, folder) {
                            if ((folder.FolderType === "singleParent") || (folder.FolderType === "multiFolder")) {
                                getDeepFolderCounts(folder.FolderId, folder.FileCount, albumImageInfo.Folders.length);
                            }

                            if (isNullorUndefined(folder.FolderImage)) {
                                imgSrc = "/Images/binaryCodeRain.gif";
                                logError("FIM", folder.FolderId, "FolderImage missing", "getAlbumImages");
                            }
                            else
                                imgSrc = settingsImgRepo + folder.FolderImage;

                            $('#imageContainer').append("<div class='" + imageFrameClass + "'\n" +
                                " oncontextmenu='albumContextMenu(\"Folder\",\"" + folder.LinkId + "\"," + folder.FolderId + ",\"" + imgSrc + "\")'\n" +
                                " onclick='folderClick(" + folder.FolderId + "," + folder.IsStepChild + ")'>\n" +
                                "<img id='" + folder.LinkId + "' class='folderImage'\n" +
                                "onerror='subFolderImgError(\"" + imgSrc + "\",\"" + folder.LinkId + "\")\n' alt='Images/redballon.png'\n src='" + imgSrc + "'/>" +
                                "<div class='" + labelClass + "'>" + folder.DirectoryName + "</div><span Id='fc" + folder.FolderId + "'>" + folder.FileCount + "</span></div>");
                        });
                    }

                    $('#imageContainer').show();
                    resizeAlbumPage();
                    //$('#footerMessage').html(": " + imagesModel.Files.length);
                    $('#folderCommentButton').fadeIn();
                    let delta = (Date.now() - getImagesStart) / 1000;
                    console.log("GetAlbumImages took: " + delta.toFixed(3));
                    $('.footer').show();
                }
                else {
                    if (albumImageInfo.Success.indexOf("connection attempt failed") > 0)
                        verifyConnection();
                    else
                        logError("AJX", folderId, albumImageInfo.Success, "getAlbumImages");
                }
            },
            error: function (jqXHR) {
                $('#indexPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT",folderId, e, "getAlbumImages");
    }
}

function getAlbumPageInfo(folderId) {
    var infoStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetAlbumPageInfo?folderId=" + folderId,
        success: function (albumInfo) {
            if (albumInfo.Success === "ok") {
                apFolderName = albumInfo.FolderName;
                setBreadCrumbs(albumInfo.BreadCrumbs);

                $('#folderCommentButton').on("click", function () {
                    showFolderCommentDialog(folderId, albumInfo.FolderName);
                });

                //function addMetaTags() {
                //jQuery("head").append('<meta property="og:url" content="' + url + '">');
                jQuery("head").append("<meta property='og:title' content='" + albumInfo.FolderName + ">");
                let aKeywords = "big naturals, naked, nude, big boobs, big tits, Every Playboy Centerfold, ";
                jQuery("head").append("<meta property='keywords' content='" + aKeywords + albumInfo.FolderName + ">");
                $('#seoPageName').html(albumInfo.FolderName);

                //<meta name="description" content="Ogglebooble is a large collection of natural big breasted girls" />
                //    <meta name="keywords" content="big naturals, naked, nude, big boobs, big tits, Every Playboy Centerfold" />
                //    <!--< meta property = 'og:title' content = '" + dbFolder.FolderName + "- Free pics, videos & biography' /> -->
                //< !--< meta property = 'og:description' content = '" + dbFolder.FolderName + " - Free pics, videos & biography' /> -->
                //< !--< meta property = "og:url" content = "https://www.Ogglebooble.com/" + dbFolder.FolderName + "'/>-->
                //    < meta property = "og:site_name" content = "OggleBooble" />

                if ((albumInfo.FolderType === "singleParent") || (albumInfo.FolderType === "multiFolder")) {
                    getDeepFolderCounts(folderId, albumInfo.FileCount, albumInfo.FolderCount);
                    $('#deepSlideshowButton').show();
                }
                else {
                    $('#galleryBottomfileCount').html(albumInfo.FileCount.toLocaleString());
                    chargeCredits(folderId, albumInfo.RootFolder, albumInfo.FolderType);
                    $('#deepSlideshowButton').hide();
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

                //$('#headerMessage').html("page hits: " + albumInfo.PageHits.toLocaleString());
                $('#footerPageHits').html("page hits: " + albumInfo.PageHits.toLocaleString());
                $('#footerFolderType').html("folder type: " + albumInfo.FolderType);
                if (!isNullorUndefined(albumInfo.StaticFile)) {
                    $('#footerStaticPage').html("<a href='" + albumInfo.StaticFile + "'>static page created: " + albumInfo.StaticFileUpdate + "</a>\n");
                }

                if ((albumInfo.FolderType === "singleParent") || (albumInfo.FolderType === "multiFolder")) {
                    $.ajax({
                        type: "GET",
                        url: settingsArray.ApiServer + "api/GalleryPage/UpdateFolderCounts?folderId=" + folderId,
                        success: function (countsModel) {
                            if (countsModel.Success === "ok") {
                                if ((albumInfo.FolderCount != countsModel.TtlFolderCount) && (albumInfo.FolderCount !== 0))
                                    $('#galleryBottomfileCount').html("((" + albumInfo.FolderCount + ") " + countsModel.TtlFolderCount.toLocaleString() + " / " + countsModel.TtlFileCount.toLocaleString());
                                else
                                    $('#galleryBottomfileCount').html(countsModel.TtlFolderCount.toLocaleString() + " / " + countsModel.TtlFileCount.toLocaleString());
                            }
                            else {
                                if (albumImageInfo.Success.indexOf("connection attempt failed") > 0)
                                    verifyConnection();
                                else
                                    logError("AJX", folderId, albumImageInfo.Success, "getAlbumImages");
                            }
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                        }
                    });
                }

                var delta = (Date.now() - infoStart) / 1000;
                console.log("GetAlbumPageInfo took: " + delta.toFixed(3));
            }
            else {
                if (albumInfo.Success.indexOf("Sequence contains no elements") > 0) {
                    logError("MIS", folderId, albumInfo.Success, "getAlbumImages");
                    window.location.href = "Index.html";
                }
                logError("AJX", folderId, albumInfo.Success, "getAlbumPageInfo");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function getDeepFolderCounts(folderId, folderFileCount, folderCount) {
    ttlFiles += folderFileCount;
    $('#fc' + folderId).html("?");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/GetSubFolderCounts?folderId=" + folderId,
        success: function (countsModel) {
            if (countsModel.Success === "ok") {
                if (countsModel.TtlFileCount > 0) {
                    $('#fc' + countsModel.FolderId).html(countsModel.TtlFileCount.toLocaleString());
                }
                if (countsModel.TtlFolderCount > 1) {
                    $('#fc' + countsModel.FolderId).html(countsModel.TtlFolderCount + "/" + countsModel.TtlFileCount.toLocaleString());
                }
                if (folderId == apFolderId) {
                    if ((folderCount != countsModel.TtlFolderCount) && (folderCount !== 0)) {
                        $('#galleryBottomfileCount').html("(" + folderCount + ") " + countsModel.TtlFolderCount.toLocaleString() + " / " + countsModel.TtlFileCount.toLocaleString());
                    }
                    else
                        $('#galleryBottomfileCount').html(countsModel.TtlFolderCount.toLocaleString() + " / " + countsModel.TtlFileCount.toLocaleString());
                }
            }
            else { logError("AJX", folderId, countsModel.Success, "getDeepFolderCounts"); }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function albumContextMenu(menuType, linkId, folderId, imgSrc) {
    //alert("$(window).scrollTop(): " + $(window).scrollTop() + " event.clientY: " + event.clientY);    
    pos.x = event.clientX;
    pos.y = event.clientY + $(window).scrollTop();
    showContextMenu(menuType, pos, imgSrc, linkId, folderId, apFolderName);
}

function setBreadCrumbs(breadCrumbModel) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)
    $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href='javascript:rtpe(\"BCC\"," + apFolderId + "\,\"root\",1)'>root  &#187</a>");
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
                    "onclick='forgetHomeFolderInfoDialog=\"true\";showFolderInfoDialog(" +
                    breadCrumbModel[i].FolderId + ",\"bc click\")'>" + breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
            }
            else {
                $('#breadcrumbContainer').append("<a class='activeBreadCrumb'" +
                    // rtpe(eventCode, calledFrom, eventDetail, pageId)
                    "href='javascript:rtpe(\"BCC\"," + apFolderId + ",\"" + breadCrumbModel[i].FolderName + "\"," + breadCrumbModel[i].FolderId + ")'>" +
                    breadCrumbModel[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + " &#187</a>");
            }
        }
    }
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
    $('#' + linkId).attr('src', "Images/redballon.png");
    logError("ILF", apFolderId, "imgSrc: " + imgSrc, "galleryImage");
    //alert("image not found LinkId: " + linkId + " imgSrc: " + imgSrc, "Album galleryImageError");
}

function subFolderImgError(imgSrc, linkId) {
    setTimeout(function () {
        if ($('#' + link).attr('src') == null) {
            logError("ILF", apFolderId, "linkId: " + linkId + " imgSrc: " + imgSrc, "subFolderImg");
        }
    }, 600);
    //alert("image not found LinkId: " + linkId + " imgSrc: " + imgSrc, "Album galleryImageError");
}

function launchDeepSlideShow()
{
    $('#indexPageLoadingGif').show();
    logEvent("DSC", apFolderId, apFolderName, "launchDeepSlideShow");
    launchViewer(apFolderId, 1, true);
    sendEmail("CurtishRhodes@hotmail.com", "DeepSlideshow@Ogglebooble.com", "deep slideshow clicked", "Visitor Id: " + apVisitorId + "<br/>Folder: " + apFolderName);
}

function checkAlbumCost() {
    if (apVisitorId === "stillOkUnknown")
        alert("You must be logged in to view this album");
}

function chargeCredits(folderId, rootFolder) {
        let activityCode = "PGV"  //  
    if (rootFolder === "centerfold")
        activityCode = "PBV";

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
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
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
    else
        window.location.href = "/album.html?folder=" + folderId;  //  open page in same window
    //" onclick='rtpe(\"SUB\",\"called from: " + folderId + "\",\"" + folder.DirectoryName + "\"," + folder.FolderId + ")'>\n" +
}

