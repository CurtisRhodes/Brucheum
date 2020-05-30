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
var slideShowButtonsActive = false;
var includeSubFolders;

function launchViewer(folderId, startItem, showAllChildren) {
    imageViewerFolderId = folderId;
    includeSubFolders = showAllChildren;
    if (isNullorUndefined(includeSubFolders))
        includeSubFolders = false;
    sessionCount = 0;
    $('#imageContainer').fadeOut();
    getSlideshowItems(folderId, startItem);
    slideShowButtonsActive = true;
    $('#imagePageLoadingGif').fadeIn();
    $('#imageContainer').fadeOut();
    $('#slideShowContainer').html(showSlideshowHtml()).show();
}

function getSlideshowItems(folderId, startItem) {
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

                    $('#imagePageLoadingGif').hide();
                    viewerShowing = true;
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

function explodeViewer() {
    viewerH = 50;
    viewerW = 50;
    windowW = $(window).width();
    windowH = $(window).height();
    $('#slideShowContainer').height(viewerH);
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
    $('#slideShowContainer').css('top', viewerT);
    $('#slideShowContainer').css('left', viewerL);
    $('#slideShowContainer').height(viewerH);
    $('#slideShowContainer').width(viewerW);
    $('#viewerImageContainer').height(viewerH);
    $('#viewerImageContainer').css('left', ($('#slideShowContainer').width() - $('#viewerImage').width()) / 2);
    //   alert("dlgW: " + $('#slideShowContainer').width() + "imgW: " + $('#viewerImage').width());
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
        $('#slideShowContainer').css('top', 0);
        $('#slideShowContainer').css('left', 0);

        $('#leftClickArea').css('left', 0);
        $('#rightClickArea').css('left', viewerW / 2);

        $('#slideShowContainer').width(viewerW);
        $('#slideShowContainer').height(viewerH);
        if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId)
            $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
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
        logImageHit(imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, false);
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

    //slideShowContainer
    $('#slideShowContainer').effect('blind', { mode: 'hide', direction: 'vertical' }, 500);


    viewerShowing = false;
    slideShowRunning = false;
    slideShowButtonsActive = false;
    clearInterval(imageViewerIntervalTimer);
    $('#txtStartSlideShow').html("start slideshow");

    if (verbosity > 2) {
        var closeMethod = "click";
        if (calledFrom !== undefined) {
            closeMethod = calledFrom;
        }
        if (sessionCount < 2) {
            logEventActivity({
                VisitorId: getCookieValue("VisitorId"),
                EventCode: "SVC",
                EventDetail: "Single Image Viewed. closeMethod: " + closeMethod,
                CalledFrom: albumFolderId
            });
        }
        else {
            logEventActivity({
                VisitorId: getCookieValue("VisitorId"),
                EventCode: "SVC",
                EventDetail: "Images Viewed: " + sessionCount + " closed: " + closeMethod,
                CalledFrom: albumFolderId
            });
        }
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
    $('#viewerImage').height($(window).height() - 30);
    $('.slideshowNavgArrows img').height($(window).height() - 30);
}

function slideshowImageLabelClick() {
    //alert("knownSlideShowImageLabelClick()");
    rtpe("SSC", imageViewerFolderId, imageViewerArray[imageViewerIndex].ImageFolderId, imageViewerFolderId);
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
            rtpe("SEE", albumFolderId, imageViewerArray[imageViewerIndex].ImageFolderId, albumFolderId);
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
                rtpe("EXP", "slideshow", imageViewerArray[imageViewerIndex].Link, albumFolderId);
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

function showSlideshowHtml() {
    $('#slideShowContainer').html(
        " <div id='viewerButtonsRow' class='imageViewerHeaderRow'>\n" +
        "    <div class='viewerButtonsRowSection'>\n" +
        "        <img id='imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='/Images/comment.png' />\n" +
        "    </div>\n" +
        "    <span id='imageViewerHeaderTitle' class='imageViewerTitle'></span>\n" +
        "    <div class='viewerButtonsRowSection'>\n" +
        "        <div class='floatRight' style='margin-left: 44px;' onclick='closeViewer(\"click\");'><img title='you may use the {esc} key' src='/Images/close.png' /></div>\n" +
        "        <div class='floatRight' onclick='runSlideShow(\"faster\");'><img id='fasterSlideshow' title='faster' src='/Images/speedDialFaster.png' /></div>\n" +
        "        <div id='txtStartSlideShow' class='txtSlideShow floatRight' onclick='runSlideShow(\"start\");'>start slideshow</div>\n" +
        "        <div class='floatRight' onclick='runSlideShow(\"slower\");'><img id='slowerSlideShow' title='slower' src='/Images/speedDialSlower.png' /></div>\n" +
        "        <div class='floatRight' onclick='blowupImage()'><img class='popoutBox' title='open image in a new window' src='/Images/expand02.png' /></div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div id='leftClickArea' class='hiddenClickArea' oncontextmenu='slideshowContexMenu()' onclick='slideClick(\"prev\");'></div>\n" +
        "<div id='rightClickArea' class='hiddenClickArea' oncontextmenu='slideshowContexMenu()' onclick='slideClick(\"next\");'></div>\n" +
        "<div class='centeringOuterShell'>\n" +
        "    <div class='centeringInnerShell'>\n" +
        "        <div id='viewerImageContainer' class='flexContainer'>\n" +
        "            <div class='slideshowNavgArrows'><img src='/Images/leftArrowOpaque02.png' /></div>\n" +
        "            <img id='viewerImage' class='slideshowImage' />\n" +
        "            <div class='slideshowNavgArrows'><img src='/Images/rightArrowOpaque02.png' /></div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div id='slideshowImageLabel' class='slideshowImageLabel displayHidden' onclick='slideshowImageLabelClick()'></div>\n");
}

function showSlideshowContextMenuHtml() {
    $('#slideshowContextMenuContainer').html(
        "<div id='slideshowContextMenu' class='ogContextMenu' onmouseleave='closeSlideshowContextMenu()'>\n" +
        "    <div id='slideshowContextMenuModelName' onclick='slideshowCtxMnuAction('showModelInfo')'>model name</div>\n" +
        "    <div id='slideshowContextMenuSeeMore' onclick='slideshowCtxMnuAction('see more of her')'>see more of her</div>\n" +
        "    <div onclick='slideshowCtxMnuAction('showImageCommentDialog')'>Comment</div>\n" +
        "    <div onclick='slideshowCtxMnuAction('explode')'>explode</div>\n" +
        "    <div onclick='slideshowCtxMnuAction('showLinks')'>Show Links</div>\n" +
        "    <div id='slideshowIinkInfo' class='innerContextMenuInfo'>\n" +
        "        <div id='slideshowLinkInfoContainer'></div>\n" +
        "    </div>\n" +
        "    <div id='slideshowContextMenuArchive' class='adminLink' onclick='slideshowCtxMnuAction('Archive')'>Archive</div>\n" +
        "    <div class='adminLink' onclick='slideshowCtxMnuAction('Copy')'>Copy Link</div>\n" +
        "    <div class='adminLink' onclick='slideshowCtxMnuAction('Move')'>Move Image</div>\n" +
        "    <div class='adminLink' onclick='slideshowCtxMnuAction('remove')'>Remove Link</div>\n" +
        "    <div class='adminLink' onclick='slideshowCtxMnuAction('setF')'>Set as Folder Image</div>\n" +
        "    <div class='adminLink' onclick='slideshowCtxMnuAction('setC')'>Set as Category Image</div>\n" +
        "</div>\n");
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



