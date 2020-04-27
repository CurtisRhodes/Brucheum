var exploderInterval;
var slideShowSpeed = 5000;
var viewerH = 50;
var viewerW = 50;
var viewerT = 0;
var viewerL = 0;
var windowW = $(window).width();
var windowH = $(window).height();
var Xincrimentor = 15;
var Yincrimentor = 10;
var exploderSpeed = 18;
var imageViewerFolderId;
var imageViewerArray = {};
var imageViewerIndex = 1;
var imageViewerIntervalTimer;
var imageViewerFolderName;
var albumFolderId;
var viewerShowing = false;
var slideShowRunning = false;
//var ipAddress;
var visitorId;
var sessionCount = 0;
var slideShowButtonsActive = true;
var includeSubFolders;

function launchViewer(folderId, startItem, showAllChildren) {
    imageViewerFolderId = folderId;
    includeSubFolders = showAllChildren;
    if (isNullorUndefined(includeSubFolders))
        includeSubFolders = false;
    sessionCount = 0;
    $('#imageContainer').fadeOut();
    getFolderArray(folderId, startItem);
}

function getFolderArray(folderId, startItem) {
    try {
        albumFolderId = folderId;
        var start = Date.now();
        //$('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            async: true,
            url: settingsArray.ApiServer + "/api/Slideshow/GetSlideShowItems?folderId=" + folderId + "&includeSubFolders=" + includeSubFolders,
            success: function (slideshowItemModel) {
                //$('#imagePageLoadingGif').hide();
                if (slideshowItemModel.Success === "ok") {
                    imageViewerFolderName = slideshowItemModel.FolderName;
                    imageViewerArray = slideshowItemModel.SlideshowItems;
                    //$('#imageViewerHeaderTitle').html(slideshowItemModel.RootFolder + "/" + slideshowItemModel.FolderName + "/" + slideshowItemModel.ImageFolderName);
                    $('#imageViewerHeaderTitle').html(slideshowItemModel.FolderName);

                    if (!includeSubFolders) {
                        for (var i = 0; i < imageViewerArray.length; i++) {
                            if (imageViewerArray[i].LinkId === startItem) {
                                imageViewerIndex = i;
                                break;
                            }
                        };
                    }
                    $('#imageViewerDialog').show();
                    resizePage();
                    resizeViewer();
                    explodeViewer();

                    if (includeSubFolders)
                        runSlideShow('start');

                    //$('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + folderId + " took: " + delta.toFixed(3));
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "BUG",
                        Severity: 1,
                        ErrorMessage: successModel.Success,
                        CalledFrom: "Slideshow.js buildFolderArray"
                    });
                    //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                    //if (document.domain === 'localhost') alert("jQuery fail in Album.js: getAlbumImages\n" + imageLinksModel.Success);

                }
            },
            error: function (jqXHR) {
                //$('#imagePageLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getAlbumImages")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "Album.js getAlbumImages"
                    });
                    //sendEmailToYourself("XHR ERROR in Album.js GetImageLinks ",
                }
            }
        });
    } catch (e) {
        //$('#imagePageLoadingGif').hide();
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

function verifyUser() {
    visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        tryLogPageHit(imageViewerFolderId, "slideshow");
    }
    if (isNullorUndefined(imageViewerFolderId)) {
        if (!isNullorUndefined(folderName)) {
            getPageIdFromPageName("launchViewer");
            logError({
                VisitorId: visitorId,
                ActivityCode: "DBJ",
                Severity: 2,
                ErrorMessage: "tried to get page Id from folder Name",
                CalledFrom: "slideshow.js / launchViewer"
            });
        }
    }
}

function explodeViewer() {
    viewerH = 50;
    viewerW = 50;
    windowW = $(window).width();
    windowH = $(window).height();
    $('#imageViewerDialog').height(viewerH);
    $('#viewerImage').attr("src", imageViewerArray[imageViewerIndex].Link);
    $('#viewerImage').removeClass('redSides');
    $('#viewerButtonsRow').hide();
    exploderInterval = setInterval(function () {
        incrimentExplode();
    }, exploderSpeed);
}

function incrimentExplode() {
    if (viewerT !== 0) {
        viewerT -= Yincrimentor;
        if (viewerT < 0) viewerT = 0;
    }
    if (viewerL !== 0) {
        viewerL -= Xincrimentor;
        if (viewerL < 0) viewerL = 0;
    }
    if (viewerH !== windowH) {
        viewerH += Yincrimentor;
        if (viewerH > windowH) { viewerH = windowH; }
    }
    if (viewerW !== windowW) {
        viewerW += Xincrimentor * 2;
        if (viewerW > windowW) { viewerW = windowW; }
    }
    $('#imageViewerDialog').css('top', viewerT);
    $('#imageViewerDialog').css('left', viewerL);
    $('#imageViewerDialog').height(viewerH);
    $('#imageViewerDialog').width(viewerW);
    $('#viewerImageContainer').height(viewerH);
    $('#viewerImageContainer').css('left', ($('#imageViewerDialog').width() - $('#viewerImage').width()) / 2);
    //   alert("dlgW: " + $('#imageViewerDialog').width() + "imgW: " + $('#viewerImage').width());
    if ((viewerT === 0) && (viewerL === 0) && (viewerH === windowH) && (viewerW === windowW)) {
        if (imageViewerFolderName === undefined) {
            if (typeof staticPageFolderName === 'string') {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "IS1",
                    Severity: 4,
                    ErrorMessage: "Issue in SlideShow. StaticPageFolderName: " + staticPageFolderName,
                    CalledFrom: "slideshow.js explodeViewer"
                });
                //sendEmailToYourself("Issue in SlideShow", "staticPageFolderName: " + staticPageFolderName);
                if (document.domain === 'localhost') alert("Issue in SlideShow. StaticPageFolderName: " + staticPageFolderName);
                currentfolderName = staticPageFolderName;
            }
            else {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "IS2",
                    Severity: 4,
                    ErrorMessage: "Issue in SlideShow  typeof staticPageFolderName",
                    CalledFrom: "slideshow.js explodeViewer"
                });
                //sendEmailToYourself("Issue in SlideShow", "staticPageFolderName: " + staticPageFolderName);
                if (document.domain === 'localhost') alert("Issue in SlideShow  typeof staticPageFolderName");
            }
        }

        $('#viewerButtonsRow').show();
        clearInterval(exploderInterval);
        $('#imageViewerDialog').css('top', 0);
        $('#imageViewerDialog').css('left', 0);

        $('#leftClickArea').css('left', 0);
        $('#rightClickArea').css('left', viewerW / 2);

        $('#imageViewerDialog').width(viewerW);
        $('#imageViewerDialog').height(viewerH);
        if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId)
            $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
    }
}

function getPageIdFromPageName(calledFrom) {
    if (!isNullorUndefined(imageViewerFolderName)) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/HitCounter/GeFolderIdFromtPageName?folderName=" + imageViewerFolderName,
            success: function (getInfoModel) {
                if (getInfoModel.Success === "ok") {
                    imageViewerFolderId = getInfoModel.PageId;
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "WER",
                        Severity: 2,
                        ErrorMessage: "had to get imageViewerFolderId from folderName: " + imageViewerFolderName,
                        CalledFrom: calledFrom
                    });
                }
                else {
                    if (getInfoModel.Success === "page not found") {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "P2F",
                            Severity: 2,
                            ErrorMessage: "unable to get pageId from folderName: " + imageViewerFolderName,
                            CalledFrom: calledFrom
                        });
                    }
                    else {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "P3F",
                            Severity: 2,
                            ErrorMessage: getInfoModel.Success,
                            CalledFrom: calledFrom
                        });
                    }
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "launchViewer")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "SlideShow.js GeFolderIdFromtPageName"
                    });
                }
            }
        });
    }
    else {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "WER",
            Severity: 2,
            ErrorMessage: "no imageViewerFolderId AND no imageViewerFolderName",
            CalledFrom: "SlideShow.js getPageIdFromPageName / "+calledFrom
        });
    }
}

function slideClick(direction) {
    if (slideShowRunning) {
        $('#txtStartSlideShow').html("start slideshow");
        clearInterval(imageViewerIntervalTimer);
        if (direction === 'next') {
            runSlideShow('start');
        }
        else
            slideShowRunning = false;
    }
    else {
        slide(direction);
        sessionCount++;

        //if (document.domain === 'localhost') alert("sessionCount: " + sessionCount);
        //if (isNullorUndefined(imageViewerFolderId)) {
        //    getPageIdFromPageName("slideClick");
        //}
        //else {
            logImageHit(visitorId, imageViewerArray[imageViewerIndex].Link, imageViewerFolderId, false);
        //}
    }
}

function slide(direction) {
    try {
        $('#slideshowImageLabel').fadeOut();
        $('#thumbImageContextMenu').fadeOut();
        //$('.slideshowNavgArrows').hide();
        $('.slideshowNavgArrows').css('visibility', 'hidden');
        if (direction === 'next') {
            imageViewerIndex++;
            if (imageViewerIndex >= imageViewerArray.length)
                imageViewerIndex = 0;
            $('#viewerImage').css("-ms-transform", "translateX(1500px)");
            $('#viewerImage').css("-webkit-transform", "translateX(1500px)");
            $('#viewerImage').css("transform", "translateX(1500px)");
        }
        else // if (direction === 'prev')
        {
            imageViewerIndex--;
            if (imageViewerIndex < 0)
                imageViewerIndex = imageViewerArray.length - 1;
            $('#viewerImage').css("-ms-transform", "translateX(-1500px)");
            $('#viewerImage').css("-webkit-transform", "translateX(-1500px)");
            $('#viewerImage').css("transform", "translateX(-1500px)");
        }
        setTimeout(function () {
            $('.slideshowNavgArrows').css('visibility', 'hidden');
            //$('.slideshowNavgArrows').hide();
            $('#viewerImage').hide();
            if (direction === 'next') {
                $('#viewerImage').css("-ms-transform", "translateX(-2200px)");
                $('#viewerImage').css("-webkit-transform", "translateX(-2200px)");
                $('#viewerImage').css("transform", "translateX(-2200px)");
            }
            else {
                $('#viewerImage').css("-ms-transform", "translateX(2200px)");
                $('#viewerImage').css("-webkit-transform", "translateX(2200px)");
                $('#viewerImage').css("transform", "translateX(2200px)");
            }

            $('#viewerImage').attr("src", imageViewerArray[imageViewerIndex].Link);
            $('#viewerImageContainer').css('left', ($(window).width() - $('#viewerImage').width()) / 2);

            $('#viewerImage').show();
            if (includeSubFolders) {
                $('#imageViewerHeaderTitle').html(imageViewerArray[imageViewerIndex].ImageFolderName);

            }
            resizeViewer();
            sessionCount++;
            $('#viewerImage').css("transform", "translateX(0)");
            setTimeout(function () {

                if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId) {
                    //$('#slideshowImageLabel').html("FolderId: " + imageViewerArray[imageViewerIndex].FolderId + " imageViewerFolderId: " + imageViewerArray[imageViewerIndex].ImageFolderId).fadeIn();
                    $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
                }
                $('.slideshowNavgArrows').css('visibility', 'visible').fadeIn();
            }, 1100);
            
        }, 450);
        //$('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
    } catch (e) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "CAT",
            Severity: 4,
            ErrorMessage: e,
            CalledFrom: "slideshow.js.slide"
        });
        //sendEmailToYourself("CATCH ERROR in slideshow.js.slide " + "Error: " + e);
    }
}

function runSlideShow(action) {
    console.log("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
    //alert("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
    if (action === 'start') {
        slide('next');
        if ($('#txtStartSlideShow').html() === "start slideshow") {
            imageViewerIntervalTimer = setInterval(function () {
                slide('next');
            }, slideShowSpeed);
            slideShowRunning = true;
            $('#txtStartSlideShow').html("stop slideshow");
            //$('#showSlideshow').attr("Title", "start slideshow");
        }
    }
    if (action === 'stop') {
        $('#txtStartSlideShow').html("start slideshow");
        slideShowRunning = false;
        clearInterval(imageViewerIntervalTimer);
        return;
    }
    if (action === 'pause') {
        if (slideShowRunning) {
            clearInterval(imageViewerIntervalTimer);
            $('#txtStartSlideShow').html("||");
        }
    }
    if (action === 'resume') {
        if (slideShowRunning) {
            $('#txtStartSlideShow').html("stop slideshow");
            slide('next');
            imageViewerIntervalTimer = setInterval(function () {
                slide('next');
            }, slideShowSpeed);
        }
    }
    //if (slideShowSpeed === 0) {
    //    slideShowSpeed = 5000;
    //}
    //if (action === "faster") {
    //    slideShowSpeed -= 1000;
    //}
    //if (action === "slower") {
    //    slideShowSpeed += 1000;
    //}
    //if (slideShowSpeed <= 0) {
    //    $('#showSlideshow').attr("Title", "start slideshow");
    //    slideShowRunning = false;
    //    clearInterval(imageViewerIntervalTimer);
    //}
    //$('#fasterSlideshow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
    //$('#slowerSlideShow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
}

function blowupImage() {
    window.open(imageViewerArray[imageViewerIndex].Link, "_blank");
}

function showImageViewerCommentDialog() {
    closeViewer("CommentDialog");

    showImageCommentDialog(imageViewerArray[imageViewerIndex].Link, imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, imageViewerFolderName);
    logEventActivity({
        VisitorId: getCookieValue("VisitorId"),
        EventCode: "SVC",
        EventDetail: "WOW! Someone tried to make a comment",
        CalledFrom: "Sideshow"
    });
}

function closeViewer(calledFrom) {
    event.preventDefault();
    window.event.returnValue = false;
    $('#imageContainer').fadeIn();
    $('#imageViewerDialog').effect('blind', { mode: 'hide', direction: 'vertical' }, 500);
    viewerShowing = false;
    slideShowRunning = false;
    clearInterval(imageViewerIntervalTimer);
    $('#txtStartSlideShow').html("start slideshow");

    if (verbosity > 2) {
        var closeMethod = "click";
        if (calledFrom !== undefined) {
            closeMethod = calledFrom;
        }
        logEventActivity({
            VisitorId: getCookieValue("VisitorId"),
            EventCode: "SVC",
            EventDetail: "Images Viewed: " + sessionCount + " closed: " + closeMethod,
            CalledFrom: imageViewerFolderId
        });
        resizeImageContainer();
        //if (sessionCount > 20) {
        //    if (document.domain === 'localhost') {
        //        alert("Close Slideshow ." + imageViewerFolderName + ".\nImages Viewed: " + sessionCount,
        //    }
        //    else {
        //        sendEmailToYourself("slideshow: " + imageViewerFolderName + ". Images Viewed: " + sessionCount,
        //            "Close method: " + closeMethod +
        //    }
        //}
    }
    sessionCount = 0;
}

function resizeViewer() {
    $('#leftClickArea').css('left', 0);
    $('#rightClickArea').css('left', $(window).width() / 2);

    //$('#imageViewerDialog').width($(window).width());
    //$('#imageViewerDialog').height($(window).height());

    //viewerImageContainer

    $('#viewerImage').height($(window).height() - 30);
    $('.slideshowNavgArrows img').height($(window).height() - 30);

    //alert("slideshowNavgArrows height: " + $('.slideshowNavgArrows img').height());

}

function slideshowImageLabelClick() {
    //alert("knownSlideShowImageLabelClick()");
    rtpe("SSC", imageViewerFolderId, imageViewerArray[imageViewerIndex].ImageFolderId);
}

function slideshowContexMenu() {
    //ctxSAP(imageViewerArray[imageViewerIndex].Id);
    event.preventDefault();
    window.event.returnValue = false;
    if (slideShowRunning)
        runSlideShow('pause');
    $('#slideshowIinkInfo').hide();
    $('#slideshowContextMenuSeeMore').hide();
    $('#slideshowContextMenuModelName').html("unknown");    
    if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId) {
        $('#slideshowContextMenuModelName').html(imageViewerArray[imageViewerIndex].ImageFolderName);
        $('#slideshowContextMenuSeeMore').show();
    } 
    $('#slideshowContextMenu').css("top", event.clientY + 5);
    $('#slideshowContextMenu').css("left", event.clientX);
    $('#slideshowContextMenu').css('z-index', "200");
    $('#slideshowContextMenu').fadeIn();
}

function closeSlideshowContextMenu() {
    $('#slideshowContextMenu').fadeOut();
    if (slideShowRunning)
        runSlideShow('resume');
}

function slideshowCtxMnuAction(action) {
    $("#thumbImageContextMenu").fadeOut();
    switch (action) {
        case "showLinks":
            $('#slideshowIinkInfo').show();
            $('#linkInfoContainer').html("");
            slideshowCtxMnuShowLinks(imageViewerArray[imageViewerIndex].LinkId);
            //slideshowLinkInfoContainer
            break;
        case "showModelInfo":            
            slideShowButtonsActive = false;
            $("#thumbImageContextMenu").fadeOut();
            if (slideShowRunning)
                runSlideShow('pause');
            showModelInfoDialog($('#ctxModelName').html(), imageViewerArray[imageViewerIndex].ImageFolderId, imageViewerArray[imageViewerIndex].Link);// $('#' + currentContextLinkId + '').attr("src"));
            $('#modelInfoDialog').on('dialogclose', function (event) {
                slideShowButtonsActive = true;
                $('#modelInfoDialog').hide();
                if (slideShowRunning)
                    runSlideShow('resume');
            });
            break;
        case "see more of her":
            rtpe("SEE", albumFolderId, imageViewerArray[imageViewerIndex].ImageFolderId);
            //calledFrom = imageViewerArray[imageViewerIndex].ImageFolderId;
            break;
        case "showImageCommentDialog":
            if (slideShowRunning) {
                //alert("pause here");
                runSlideShow('pause');
            }
            slideShowButtonsActive = false;
            logEventActivity({
                VisitorId: getCookieValue("VisitorId"),
                EventCode: "FCC",
                EventDetail: "Image: " + imageViewerArray[imageViewerIndex].Link,
                CalledFrom: albumFolderId
            });
            showImageCommentDialog(imageViewerArray[imageViewerIndex].Link, imageViewerArray[imageViewerIndex].LinkId, albumFolderId, currentAlbumJSfolderName);
            $('#imageCommentDialog').on('dialogclose', function (event) {
                slideShowButtonsActive = true;
                if (slideShowRunning)
                    runSlideShow('resume');
            });
            break;
        case "explode":
            if (!isLoggedIn()) {
                alert("You must be logged in to use this feature");
            }
            else
                rtpe("EXP", albumFolderId, imageViewerArray[imageViewerIndex].Link);
            break;
        case "Archive":
        case "Copy":
        case "Move":
            showMoveCopyDialog(action, imageViewerArray[imageViewerIndex].Link, albumFolderId);
            break;
        case "remove":
            removeImage();
            break;
        case "setF":
            setFolderImage(imageViewerArray[imageViewerIndex].LinkId, albumFolderId, "folder");
            //if (viewerShowing) slide("next");
            break;
        case "setC":
            setFolderImage(imageViewerArray[imageViewerIndex].LinkId, albumFolderId, "parent");
            //if (viewerShowing) slide("next");
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

    //logEventActivity({
    //    VisitorId: getCookieValue("VisitorId"),
    //    EventCode: "CMC",
    //    EventDetail: action,
    //    CalledFrom: calledFrom
    //});
}

function slideshowCtxMnuShowLinks(linkId) {
    $.ajax({
        type: "PATCH",
        url: settingsArray.ApiServer + "api/ImagePage?linkId=" + linkId,
        success: function (linksModel) {
            if (linksModel.Success === "ok") {
                $('#slideshowLinkInfoContainer').html("");
                $.each(linksModel.Links, function (idx, obj) {
                    $('#slideshowLinkInfoContainer').append("<div id='" + obj.FolderId + "' class='linkInfoItem' onclick='openLink(" + obj.FolderId + ")'>" + obj.PathName + "</div>");
                });
                $('#slideshowIinkInfo').show();
            }
            else {
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "BUG",
                    Severity: 1,
                    ErrorMessage: linksModel.Success,
                    CalledFrom: "slideshowCtxMnuShowLinks"
                });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "slideshowCtxMnuShowLinks")) {
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "slideshowCtxMnuShowLinks"
                });
                //sendEmailToYourself("xhr error in common.js showLinks", "api/ImagePage?linkId=" + linkId + " Message: " + errorMessage);
            }
        }
    });
}

$(document).keydown(function (event) {
    if (slideShowButtonsActive) {
        switch (event.which) {
            case 27:                        // esc
                closeViewer("escape key");
                break;
            //case 38: scrollTabStrip('foward'); break;
            //case 33: scrollTabStrip('foward'); break;
            case 34:                        // pg down
            case 40:                        // dowm arrow
            case 37:                        // left arrow
                slideClick('prev');
                break;
            case 13:                        // enter
            case 38:                        // up arrow
            case 39:                        // right arrow
                event.preventDefault();
                window.event.returnValue = false;
                slideClick('next');
                break;
            //case 122:                       // F11
            //    $('#standardHeader').hide();
            //    break;
            //default:
            //  $('#expandoBannerText').html("event.which: " + event.which)
            //  alert("event.which: " + event.which)
        }
    }
});



