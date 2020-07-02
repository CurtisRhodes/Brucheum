let exploderInterval,
    slideShowSpeed = 5000,
    viewerH = 50,
    viewerW = 50,
    viewerT = 0,
    viewerL = 0,
    windowW = $(window).width(),
    windowH = $(window).height(),
    Xincrimentor = 15,
    Yincrimentor = 10,
    exploderSpeed = 18,
    imageViewerFolderId,
    imageViewerArray = {},
    imageViewerIndex = 1,
    imageViewerIntervalTimer,
    imageViewerFolderName,
    albumFolderId,
    spSlideShowRunning,
    spSessionCount = 0,
    slideShowButtonsActive = false,
    spIncludeSubFolders;

function launchViewer(folderId, startItem, includeSubFolders) {
    spSlideShowRunning = false;
    imageViewerFolderId = folderId;
    if (isNullorUndefined(includeSubFolders)) includeSubFolders = false;
    spIncludeSubFolders = includeSubFolders;
    spSessionCount = 0;

    if (typeof staticPageFolderName === 'string') {
        isStaticPage = "true";
        alert("get image array from DOM");
        // get image array from DOM
        //var imageArray = new Array();
        //$('#imageContainer').children().each(function () {
        //    imageArray.push({
        //        Id: $(this).attr("id"),
        //        Link: $(this).find("img").attr("src")
        //    });
        //});
        //launchViewer(folderId, linkId, false);
        //$('#fileCount').hide();
    }
    getSlideshowItems(folderId, startItem);
    slideShowButtonsActive = true;
    settingsImgRepo = settingsArray.ImageRepo;

    window.addEventListener("resize", resizeViewer);
}

function resizeViewer() {
    $('#leftClickArea').css('left', 0);
    $('#rightClickArea').css('left', $(window).width() / 2);
    $('#viewerImage').height($(window).height() - 30);
    $('.slideshowNavgArrows img').height($(window).height() - 30);
    $('#slideShowContainer').css('width', "100%");

    //if ($('#viewerButtonsRow').width() > $(window).width())
    //alert("$('#viewerButtonsRow').width(): " + $('#viewerButtonsRow').width() + "  window.width: " + $(window).width());
}

function getSlideshowItems(folderId, startItem) {
    try {
        $('#imagePageLoadingGif').fadeIn();
        albumFolderId = folderId;
        var start = Date.now();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/GalleryPage/GetSlideShowItems?folderId=" + folderId + "&includeSubFolders=" + spIncludeSubFolders,
            success: function (slideshowItemModel) {
                $('#imagePageLoadingGif').hide();
                if (slideshowItemModel.Success === "ok") {
                    imageViewerFolderName = slideshowItemModel.FolderName;

                    imageViewerArray = slideshowItemModel.SlideshowItems;

                    $('#imageContainer').fadeOut();
                    $('#imagePageLoadingGif').hide();
                    $('#slideShowContainer').html(slideshowHtml()).show();
                    $('#imageViewerHeaderTitle').html(slideshowItemModel.FolderName);
                    $('#rightClickArea').dblclick(function () {
                        event.preventDefault();
                        window.event.returnValue = false;
                        runSlideShow("start");
                    });

                    if (!spIncludeSubFolders) {
                        for (var i = 0; i < imageViewerArray.length; i++) {
                            if (imageViewerArray[i].LinkId === startItem) {
                                imageViewerIndex = i;
                                break;
                            }
                        };
                    }
                    //$('#imageViewerHeaderTitle').html(slideshowItemModel.RootFolder + "/" + slideshowItemModel.FolderName + "/" + slideshowItemModel.ImageFolderName);
                    viewerShowing = true;
                    resizePage();
                    resizeViewer();
                    explodeViewer();
                    $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + folderId + " took: " + delta.toFixed(3));
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    if (document.domain === "localhost") alert("getSlideshowItems: " + slideshowItemModel.Success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BUG",
                            Severity: 1,
                            ErrorMessage: slideshowItemModel.Success,
                            CalledFrom: "getSlideshowItems"
                        });
                    //sendEmailToYourself("jQuery fail in Album.js: getAlbumImages", imageLinksModel.Success);
                }
            },
            error: function (jqXHR) {
                $('#imagePageLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getAlbumImages")) {
                    if (document.domain === "localhost") alert("getSlideshowItems: " + errorMessage);
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "getSlideshowItems"
                    });
                    //sendEmailToYourself("XHR ERROR in Album.js GetImageLinks ",
                }
            }
        });
    } catch (e) {
        $('#imagePageLoadingGif').hide();
        if (document.domain === "localhost") alert("getSlideshowItems CATCH: " + e);
        else
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CAT",
                Severity: 1,
                ErrorMessage: e,
                CalledFrom: "Album.js getAlbumImages"
            });
        //sendEmailToYourself("Catch in Album.js getAlbumImages", e);
    }
}

function explodeViewer() {
    viewerH = 50;
    viewerW = 50;
    windowW = $(window).width();
    windowH = $(window).height();
    $('#slideShowContainer').height(viewerH);

    $('#viewerImage').attr("src", settingsImgRepo + imageViewerArray[imageViewerIndex].FileName);
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
        if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId)
            $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
        resizeViewer();

        //setTimeout(function () {
        //    if (spIncludeSubFolders) {
        //        if (!spSlideShowRunning) {
        //            //clearInterval(imageViewerIntervalTimer);
        //            //alert("start slideshow");
        //            //runSlideShow('start');
        //        }
        //        else alert("runnaway");
        //    }
        //}, slideShowSpeed);
    }
}

function slideClick(direction) {
    if (!event.detail || event.detail === 1) {//activate on first click only to avoid hiding again on double clicks
        if (spSlideShowRunning) {
            $('#txtStartSlideShow').html("start slideshow");
            clearInterval(imageViewerIntervalTimer);
            if (direction === 'next') {
                runSlideShow('start');
            }
            else
                spSlideShowRunning = false;
        }
        else {
            slide(direction);
            spSessionCount++;
            //logImageHit(imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, false);
        }
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
            $('#viewerImage').attr("src", settingsImgRepo + imageViewerArray[imageViewerIndex].FileName);
            $('#viewerImageContainer').css('left', ($(window).width() - $('#viewerImage').width()) / 2);
            $('#viewerImage').show();
            resizeViewer();
            spSessionCount++;
            $('#viewerImage').css("transform", "translateX(0)");
            setTimeout(function () {
                if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId) {


                    $('#imageViewerHeaderTitle').html(imageViewerArray[imageViewerIndex].ImageFolderName +
                        " / " + slideshowItemModel.FolderName);

                    $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
                }
                else
                    $('#imageViewerHeaderTitle').html(slideshowItemModel.FolderName);


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
        if ($('#txtStartSlideShow').html() === "stop slideshow") {
            spSlideShowRunning = false;
            clearInterval(imageViewerIntervalTimer);
            $('#txtStartSlideShow').html("start slideshow");
            return;
        }
        if ($('#txtStartSlideShow').html() === "start slideshow") {
            slide('next');
            $('#txtStartSlideShow').html("stop slideshow");
            imageViewerIntervalTimer = setInterval(function () {
                slide('next');
            }, slideShowSpeed);
            spSlideShowRunning = true;
        }
    }
    if (action === 'stop') {
        $('#txtStartSlideShow').html("start slideshow");
        spSlideShowRunning = false;
        return;
    }
    if (action === 'pause') {
        if (spSlideShowRunning) {
            clearInterval(imageViewerIntervalTimer);
            $('#txtStartSlideShow').html("||");
        }
    }
    if (action === 'resume') {
        if (spSlideShowRunning) {
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
    //closeViewer("CommentDialog");
    //showImageCommentDialog(linkId, imgSrc, folderId, calledFrom)
    showImageCommentDialog(imageViewerArray[imageViewerIndex].LinkId, imageViewerArray[imageViewerIndex].FileName, imageViewerFolderId, "slideshow icon");
}

function closeViewer(calledFrom) {
    event.preventDefault();
    window.event.returnValue = false;


    $('#imageContainer').fadeIn();

    //slideShowContainer
    $('#slideShowContainer').effect('blind', { mode: 'hide', direction: 'vertical' }, 500);


    viewerShowing = false;
    spSlideShowRunning = false;
    slideShowButtonsActive = false;
    clearInterval(imageViewerIntervalTimer);
    $('#txtStartSlideShow').html("start slideshow");

    if (verbosity > 2) {
        var closeMethod = "click";
        if (calledFrom !== undefined) {
            closeMethod = calledFrom;
        }
        if (spSessionCount < 2) {
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
                EventDetail: "Images Viewed: " + spSessionCount + " closed: " + closeMethod,
                CalledFrom: albumFolderId
            });
        }
        resizeImageContainer();
        //if (spSessionCount > 20) {
        //    if (document.domain === 'localhost') {
        //        alert("Close Slideshow ." + imageViewerFolderName + ".\nImages Viewed: " + spSessionCount,
        //    }
        //    else {
        //        sendEmailToYourself("slideshow: " + imageViewerFolderName + ". Images Viewed: " + spSessionCount,
        //            "Close method: " + closeMethod +
        //    }
        //}
    }
    spSessionCount = 0;
}

function slideshowImageLabelClick() {
    //alert("SSC");
    rtpe("SSC", imageViewerFolderId, "slideshowImageLabelClick", imageViewerArray[imageViewerIndex].ImageFolderId);
}

function slideshowContextMenu() {

    runSlideShow("pause");
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("Slideshow", pos,
        settingsImgRepo + imageViewerArray[imageViewerIndex].FileName,
        imageViewerArray[imageViewerIndex].LinkId,
        imageViewerArray[imageViewerIndex].ImageFolderId,
        imageViewerArray[imageViewerIndex].ImageFolderName);
}

$(document).keydown(function (event) {
    if (slideShowButtonsActive) {
        switch (event.which) {
            case 27:                        // esc
                closeViewer("escape key");
                break;
            //case 38: scrollTabStrip('foward'); break;
            //case 33: scrollTabStrip('foward'); breakapi/VisitorInfo/verifyVisitorId
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

function slideshowHtml() {
    return "<div id='viewerButtonsRow' class='imageViewerHeaderRow' > \n" +
        "  <div><img id='imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='/Images/comment.png'/></div>\n" +
        "  <div id='imageViewerHeaderTitle' class='imageViewerTitle'></div> \n" +
        "  <div class='floatRight clickable' onclick='runSlideShow(\"faster\");'><img id='fasterSlideshow' title='faster' src='/Images/speedDialFaster.png'/></div>\n" +
        "  <div id='txtStartSlideShow' class='floatRight clickable'style='padding-top:4px' " +
        "       onclick='runSlideShow(\"start\");'>start slideshow</div>\n" +
        "  <div class='floatRight clickable' onclick='runSlideShow(\"slower\");'><img id='slowerSlideShow' title='slower' src='/Images/speedDialSlower.png'/></div>\n" +
        "  <div class='floatRight clickable' onclick='blowupImage()'><img class='popoutBox' title='open image in a new window' src='/Images/expand02.png'/> </div>\n" +
        "  <div class='floatRight clickable' onclick='closeViewer(\"click\");' > <img title='you may use the {esc} key' src='/Images/close.png'/> </div>\n" +
        "</div>\n" +
        "<div id='leftClickArea'  class='hiddenClickArea' oncontextmenu='slideshowContextMenu()'  onclick='slideClick(\"prev\")' title='previous\nwill cancel slideshow'></div>\n" +
        "<div id='rightClickArea' class='hiddenClickArea' oncontextmenu='slideshowContextMenu()' onclick='slideClick(\"next\")' " +
        "title='next\ndouble click to start slideshow'></div>\n" +
        "<div class='centeringOuterShell'>\n" +
        "    <div class='centeringInnerShell'>\n" +
        "        <div id='viewerImageContainer' class='flexContainer'>\n" +
        "            <div class='slideshowNavgArrows'><img src='/Images/leftArrowOpaque02.png' /></div>\n" +
        "            <img id='viewerImage' class='slideshowImage' />\n" +
        "            <div class='slideshowNavgArrows'><img src='/Images/rightArrowOpaque02.png' /></div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div id='slideshowCtxMenuContainer' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>" +
        "   <div id='slideshowContextMenuContent'></div>\n" +
        "</div>\n" +
       "<div id='slideshowImageLabel' class='slideshowImageLabel displayHidden' onclick='slideshowImageLabelClick()'></div>\n";
}




