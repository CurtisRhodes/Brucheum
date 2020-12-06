let exploderInterval, slideShowSpeed = 5000, viewerH = 50, viewerW = 50, viewerT = 0, viewerL = 0, windowW = $(window).width(), windowH = $(window).height(),
    Xincrimentor = 15, Yincrimentor = 10, exploderSpeed = 18, imageViewerFolderId, imageViewerArray = {}, imageViewerIndex = 0, imageViewerIntervalTimer,
    imageViewerFolderName, albumFolderId, spSlideShowRunning, spSessionCount = 0, slideShowButtonsActive = false, spIncludeSubFolders, slideshowSpped = 570,
    imgSrc = new Image();

function launchViewer(folderId, startItem, includeSubFolders) {
    spSlideShowRunning = false;
    imageViewerFolderId = folderId;
    if (isNullorUndefined(includeSubFolders)) includeSubFolders = false;
    spIncludeSubFolders = includeSubFolders;
    spSessionCount = 0;

    getSlideshowItems(folderId, startItem);
    slideShowButtonsActive = true;
    settingsImgRepo = settingsArray.ImageRepo;

    window.addEventListener("resize", resizeViewer);
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

                        //if (document.domain === 'localhost') alert("logImageHit(slideshow startItem: " + startItem + "  LinkId: " + imageViewerArray[imageViewerIndex].LinkId + ", folderId: " + folderId + ", true);");
                        logImageHit(imageViewerArray[imageViewerIndex].LinkId, folderId, true);
                    }
                    //$('#imageViewerHeaderTitle').html(slideshowItemModel.RootFolder + "/" + slideshowItemModel.FolderName + "/" + slideshowItemModel.ImageFolderName);
                    viewerShowing = true;
                    resizeViewer();
                    explodeViewer();
                    $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + folderId + " took: " + delta.toFixed(3));
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    logError("AJX", folderId, success, "getSlideshowItems");
                }
            },
            error: function (jqXHR) {
                $('#imagePageLoadingGif').hide();
                if (!checkFor404("getAlbumImages")) {
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getSlideshowItems");
                }
            }
        });
    } catch (e) {
        $('#imagePageLoadingGif').hide();
        logError("CAT", folderId, e, "getSlideshowItems");
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

    setTimeout(function () { $('#imagePageLoadingGif').show() }, 500);
    let tempImgSrc = new Image();
    tempImgSrc.onload = function () {
        $('#imagePageLoadingGif').hide();
        setTimeout(function () { $('#imagePageLoadingGif').hide() }, 500);
        exploderInterval = setInterval(function () {
            incrimentExplode();
        }, exploderSpeed);
        if (spIncludeSubFolders) {
            setTimeout(function () {
                runSlideShow("start");
                console.log("runSlideShow(start)");
            }, slideShowSpeed);
        }
    };
    tempImgSrc.src = settingsImgRepo + imageViewerArray[imageViewerIndex].FileName;
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
        $('#viewerButtonsRow').show();
        clearInterval(exploderInterval);
        $('#slideShowContainer').css('top', 0);
        $('#slideShowContainer').css('left', 0);

        if (imageViewerArray[imageViewerIndex].FolderId !== imageViewerArray[imageViewerIndex].ImageFolderId) {
            $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
        }
        resizeViewer();
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
        }
    }
}

function slide(direction) {
    try {
        let showLoadingGif = true;
        setTimeout(function () {
            if (showLoadingGif)
                $('#imagePageLoadingGif').show()
        }, 500);
        let tempImgSrc = new Image();
        tempImgSrc.onload = function () {
            showLoadingGif = false;
            $('#imagePageLoadingGif').hide();
            //setTimeout(function () { $('#imagePageLoadingGif').hide() }, 502);
            //let startLoadTime = Date.now();
            //imgSrc.onload = function () {

            $('#viewerImage').css("transform", "translateX(0)");
            // SLIDE OUT OF VIEW
            if (direction === 'next') {  // LEFT TO RIGHT OUT THE RIGHT SIDE
                $('#viewerImage').css("transform", "translateX(1500px)", slideShowSpeed);
            }
            else { // 'prev'        
                $('#viewerImage').css("transform", "translateX(-1500px)", slideShowSpeed);
            }
            $('.slideshowNavgArrows').css('visibility', 'hidden');
            $('#slideshowImageLabel').fadeOut();
            $('#thumbImageContextMenu').fadeOut();

            setTimeout(function () {
                $('#viewerImage').hide();
                if (direction === 'next') {
                    $('#viewerImage').css("transform", "translateX(-3200px)");
                }
                else {
                    $('#viewerImage').css("transform", "translateX(3200px)");
                }
                setTimeout(function () {
                    imgSrc.src = tempImgSrc.src;
                    $('#viewerImage').attr("src", imgSrc.src);
                    $('#viewerImage').show();
                    $('#viewerImage').css("transform", "translateX(0)", slideShowSpeed);
                    setTimeout(function () {
                        $('.slideshowNavgArrows').css('visibility', 'visible').fadeIn();
                    }, 600);

                    if (spIncludeSubFolders)
                        $('#imageViewerHeaderTitle').html(imageViewerFolderName + "/" + imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
                    else {
                        if (albumFolderId !== imageViewerArray[imageViewerIndex].ImageFolderId) {
                            $('#slideshowImageLabel').html(imageViewerArray[imageViewerIndex].ImageFolderName).fadeIn();
                        }
                    }
                }, 400);
            }, 300);
            //resizeViewer();
        };

        if (direction === 'next') { 
            if (++imageViewerIndex >= imageViewerArray.length)
                imageViewerIndex = 0;
        }
        else {
            if (--imageViewerIndex < 0)
                imageViewerIndex = imageViewerArray.length - 1;
        }
        tempImgSrc.src = settingsImgRepo + imageViewerArray[imageViewerIndex].FileName;
        spSessionCount++;
        $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
        logImageHit(imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, false);

    } catch (e) {
        logError("CAT", 3910, e, "slide");
    }
}

function resizeViewer() {
    //alert("$('#viewerImageContainer').css('left'): " + $('#viewerImageContainer').css('left'));
   
    $('#viewerImage').css('left', ($(window).width() - $('#viewerImage').width()) / 2);
    $('#leftClickArea').css('left', 0);
    $('#rightClickArea').css('left', $(window).width() / 2);
    $('#viewerImage').height($(window).height() - 30);
    $('.slideshowNavgArrows img').height($(window).height() - 30);
    $('#slideShowContainer').css('width', "100%");
    $(window).scrollTop(0);
    //if ($('#viewerButtonsRow').width() >  $(window).width())
    //alert("$('#viewerButtonsRow').width(): " + $('#viewerButtonsRow').width() + "  window.width: " + $(window).width());
}

function runSlideShow(action) {
    //console.log("run slideShow action: " + action + "  txtStartSlideShow: " + $('#txtStartSlideShow').html());
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
            logEvent("SVC", albumFolderId, "calledFrom", "Single Image Viewed. closeMethod: " + closeMethod);
        }
        else {
            logEvent("SVC", albumFolderId, "calledFrom", "Images Viewed: " + spSessionCount + " closed: " + closeMethod);
        }
        // resizeImageContainer();
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
            //case 33: scrollTabStrip('foward'); breaks api/VisitorInfo/verifyVisitorId
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
        "<div id='leftClickArea' class='hiddenClickArea' oncontextmenu='slideshowContextMenu()' onclick='slideClick(\"prev\")'></div>\n" +
        "<div id='slideshowCtxMenuContainer' class='ogContextMenu' style='z-index: 35;'  onmouseleave='$(this).fadeOut()'>" +
        "   <div id='slideshowContextMenuContent'></div>\n" +
        "</div>\n" +
        "<div id='divStatusMessage'></div>\n" +
        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='slideShowDialogContainer' class='oggleDialogContainer'>\n" +    // draggableDialog
        "           <div class='oggleDialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>" +
        "               <div id='slideShowDialogTitle' class='oggleDialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='oggleDialogCloseButton'>" +
        "               <img src='/images/poweroffRed01.png' onclick='slideShowDialogClose()'/></div>\n" +
        "           </div>\n" +
        "           <div id='slideShowDialogContents' class='oggleDialogContents'></div>\n" +
        "      </div>\n" +
        "   </div>\n" +
        "</div>\n" +
        "<div id='rightClickArea' class='hiddenClickArea' oncontextmenu='slideshowContextMenu()' onclick='slideClick(\"next\")'></div>\n" +
        "<div class='centeringOuterShell'>\n" +
        "    <div class='centeringInnerShell'>\n" +
        "        <div id='viewerImageContainer' class='flexContainer'>\n" +
        "            <div class='slideshowNavgArrows'><img src='/Images/leftArrowOpaque02.png' /></div>\n" +
        "            <img id='viewerImage' class='slideshowImage' />\n" +
        "            <div class='slideshowNavgArrows'><img src='/Images/rightArrowOpaque02.png' /></div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div id='slideshowImageLabel' class='slideshowImageLabel displayHidden' onclick='slideshowImageLabelClick()'></div>\n";
}

function slideShowDialogClose() {
    //alert("slideShowDialogClose()");
    $('#slideShowDialogContainer').fadeOut();
}



