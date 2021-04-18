let exploderInterval, slideShowSpeed = 5000, viewerH = 50, viewerW = 50, viewerT = 0, viewerL = 0, windowW = $(window).width(), windowH = $(window).height(),
    Xincrimentor = 15, Yincrimentor = 10, exploderSpeed = 18, imageViewerFolderId, imageViewerArray = {}, imageViewerIndex = 0, imageViewerIntervalTimer,
    imageViewerFolderName, albumFolderId, spSlideShowRunning, spSessionCount = 0, slideShowButtonsActive = false, spIncludeSubFolders, slideshowSpped = 570,
    slideshowImgSrc = new Image(), tempImgSrc = new Image();

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
        $('#albumPageLoadingGif').fadeIn();
        albumFolderId = folderId;
        var start = Date.now();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/GalleryPage/GetSlideShowItems?folderId=" + folderId + "&includeSubFolders=" + spIncludeSubFolders,
            success: function (slideshowItemModel) {
                $('#albumPageLoadingGif').hide();
                if (slideshowItemModel.Success === "ok") {
                    imageViewerFolderName = slideshowItemModel.FolderName;
                    imageViewerArray = slideshowItemModel.SlideshowItems;

                    $('#imageContainer').fadeOut();
                    $('#albumPageLoadingGif').hide();
                    $('#slideShowContainer').html(slideshowHtml()).show();
                    $('#rightClickArea').dblclick(function () {
                        event.preventDefault();
                        window.event.returnValue = false;
                        runSlideShow("start");
                    });

                    $('#imageViewerHeaderTitle').html(slideshowItemModel.FolderName);
                    if (!spIncludeSubFolders) {
                        for (var i = 0; i < imageViewerArray.length; i++) {
                            if (imageViewerArray[i].LinkId === startItem) {
                                imageViewerIndex = i;
                                break;
                            }
                        };
                    }
                    logImageHit(imageViewerArray[imageViewerIndex].LinkId, folderId, true);

                    viewerShowing = true;
                    resizeViewer();
                    explodeViewer();
                    $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
                    var delta = (Date.now() - start) / 1000;
                    console.log("GetImageLinks?folder=" + folderId + " took: " + delta.toFixed(3));
                }
                else {
                    $('#albumPageLoadingGif').hide();
                    logError("AJX", folderId, slideshowItemModel.Success, "getSlideshowItems");
                }
            },
            error: function (jqXHR) {
                $('#albumPageLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = "getSlideshowItems"// arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
        $('#albumPageLoadingGif').hide();
        logError("CAT", folderId, e, "getSlideshowItems");
    }
}

function explodeViewer() {
    viewerH = 50;
    viewerW = 50;
    windowW = $(window).width();
    windowH = $(window).height();
    $('#copycatDiv').hide();
    $('#slideShowContainer').height(viewerH);

    $('#viewerImage').attr("src", settingsImgRepo + imageViewerArray[imageViewerIndex].FileName);
    $('#viewerImage').removeClass('redSides');
    $('#viewerButtonsRow').hide();

    setTimeout(function () { $('#albumPageLoadingGif').show() }, 500);
    tempImgSrc.onload = function () {
        $('#albumPageLoadingGif').hide();
        setTimeout(function () { $('#albumPageLoadingGif').hide() }, 500);
        exploderInterval = setInterval(function () {
            incrimentExplode();
        }, exploderSpeed);
        $('#ssHeaderCount').html(imageViewerIndex + " / " + imageViewerArray.length);
    };
    tempImgSrc.src = settingsImgRepo + imageViewerArray[imageViewerIndex].FileName;
    if (spIncludeSubFolders) {
        runSlideShow("start");
        console.log("runSlideShow(start)");
    }
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
        // TypeError: undefined is not an object(evaluating 'imageViewerArray[imageViewerIndex].FileName')
        // TypeError: Cannot read property 'FileName' of undefined
        if (isNullorUndefined(imageViewerArray[imageViewerIndex]))
            logError("SLA", albumFolderId, direction, "slideshow.slide");
        else {
            $('#copycatDiv').hide();
            let showLoadingGif = true;
            setTimeout(function () {
                if (showLoadingGif)
                    $('#albumPageLoadingGif').show()
            }, 500);
            tempImgSrc.onload = function () {
                showLoadingGif = false;
                $('#albumPageLoadingGif').hide();
                //setTimeout(function () { $('#albumPageLoadingGif').hide() }, 502);
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
                        slideshowImgSrc.src = tempImgSrc.src;
                        $('#viewerImage').attr("src", slideshowImgSrc.src);
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
                            else {
                                $.ajax({
                                    type: "GET",
                                    url: settingsArray.ApiServer + "api/Links/GetLinkCount?imageLinkId=" + imageViewerArray[imageViewerIndex].LinkId,
                                    success: function (linkCount) {
                                        if (linkCount < 2)
                                            $('#copycatDiv').fadeIn();
                                    },
                                    error: function (jqXHR) {
                                        $('#albumPageLoadingGif').hide();
                                        let errMsg = getXHRErrorDetails(jqXHR);
                                        let functionName = "getSlideshowItems"// arguments.callee.toString().match(/function ([^\(]+)/)[1];
                                        if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                                    }
                                });
                            }
                        }
                        $('#ssHeaderCount').html(imageViewerIndex + " / " + imageViewerArray.length);
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
            //$('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
            logImageHit(imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, false);
        }        
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

    //"   <img id='ssLeftwa'  class='slideshowLeftWingArrow' src='/Images/next_left_arrow.png'/> \n" +
    //"   <img id='ssRightwa' class='slideshowRightWingArrow' src='/Images/next_right_arrow.png'/> \n" +

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
            if (spSlideShowRunning)
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
    replaceFullPage(settingsImgRepo + imageViewerArray[imageViewerIndex].FileName);
}

function showImageViewerCommentDialog() {
    showImageCommentDialog(imageViewerArray[imageViewerIndex].LinkId, settingsImgRepo + imageViewerArray[imageViewerIndex].FileName, imageViewerFolderId, "Slideshow");
}

function closeViewer(calledFrom) {
    if (spSessionCount < 2) {
        logEvent("SIV", albumFolderId, "closeMethod: " + calledFrom, imageViewerArray[imageViewerIndex].LinkId);
        //alert("You should try clicking left or right in the slideshow." +
        //    "\n                 (to avoid this message)" +
        //    "\n\nThe entire page is divided in half." +
        //    "\nClick anywhere on the right side of screen to move next." +
        //    "\nClick on the left half of the screen to move previous." +
        //    "\nThe left and arrow keys also work." +
        //    "\nDouble click on right half to start slide show." +
        //    "\nWhile slide show is running click on left half of screen to stop lideshow.");
        //spSessionCount++;
    }
    //else
    {
        event.preventDefault();
        window.event.returnValue = false;
        $('#imageContainer').fadeIn();
        $('#slideShowContainer').effect('blind', { mode: 'hide', direction: 'vertical' }, 500);
        viewerShowing = false;
        spSlideShowRunning = false;
        slideShowButtonsActive = false;
        clearInterval(imageViewerIntervalTimer);
        $('#txtStartSlideShow').html("start slideshow");
        logEvent("SVC", albumFolderId, "closeMethod: " + calledFrom, "Images Viewed: " + spSessionCount);
        spSessionCount = 0;
    }
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
        imageViewerArray[imageViewerIndex].FolderId,
        imageViewerArray[imageViewerIndex].FolderName);
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

function copyCatClick() {
    showCopyLinkDialog(imageViewerArray[imageViewerIndex].LinkId, "Slideshow", settingsImgRepo + imageViewerArray[imageViewerIndex].FileName);
    $('#copycatDiv').hide();
}

function slideshowHtml() {
    return "<div id='divStatusMessage'></div>\n" +
        "   <div id='viewerButtonsRow' class='imageViewerHeaderRow' > \n" +
        "       <div><img id='imgGoHome' class='imgCommentButton' title='home' onclick='window.location.href=\"Index.html\"' src='/Images/redballon.png'/></div>\n" +
        "       <div id='ssHeaderCount' class='ssHeaderCount'></div>\n" +
        "       <div><img id='imgComment' class='imgCommentButton' title='comment' onclick='showImageViewerCommentDialog()' src='/Images/comment.png'/></div>\n" +
        "       <div id='imageViewerHeaderTitle' class='imageViewerTitle'></div> \n" +
        "       <div class='floatRight clickable' onclick='runSlideShow(\"faster\");'><img id='fasterSlideshow' title='faster' src='/Images/speedDialFaster.png'/></div>\n" +
        "       <div id='txtStartSlideShow' class='floatRight clickable'style='padding-top:4px' onclick='runSlideShow(\"start\");'>start slideshow</div>\n" +
        "       <div class='floatRight clickable' onclick='runSlideShow(\"slower\");'><img id='slowerSlideShow' title='slower' src='/Images/speedDialSlower.png'/></div>\n" +
        "       <div class='floatRight clickable' onclick='blowupImage()'><img class='popoutBox' title='open image in a new window' src='/Images/expand02.png'/> </div>\n" +
        "       <div class='floatRight clickable' onclick='closeViewer(\"click\");' > <img title='you may use the {esc} key' src='/Images/close.png'/> </div>\n" +
        "   </div>\n" +

        "   <div id='leftClickArea' class='hiddenClickArea' oncontextmenu='slideshowContextMenu()' onclick='slideClick(\"prev\")'></div>\n" +
        "   <div id='rightClickArea' class='hiddenClickArea' oncontextmenu='slideshowContextMenu()' onclick='slideClick(\"next\")'></div>\n" +

        "   <img id='ssLeftwa' class='slideshowLeftWingArrow' src='/Images/next_left_arrow.png'/> \n" +
        "   <img id='ssRightwa' class='slideshowRightWingArrow' src='/Images/next_right_arrow.png'/> \n" +
        "<div class='centeringOuterShell'>\n" +
        "   <div class='centeringInnerShell'>\n" +
        "      <div id='slideShowDialogContainer' class='oggleDialogContainer'>\n" +    // draggableDialog
        "           <div class='oggleDialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>" +
        "               <div id='slideShowDialogTitle' class='oggleDialogTitle'></div>" +
        "               <div id='centeredDialogCloseButton' class='oggleDialogCloseButton'>" +
        "                    <img src='/images/poweroffRed01.png' onclick='slideShowDialogClose()'/>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "           <div id='slideShowDialogContents' class='oggleDialogContents'></div>\n" +
        "      </div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "   <div class='centeringOuterShell'>\n" +
        "       <div class='centeringInnerShell'>\n" +
        "           <div id='viewerImageContainer' class='flexContainer'>\n" +
        "               <div class='slideshowNavgArrows'><img src='/Images/leftArrowOpaque02.png' /></div>\n" +
        "               <img id='viewerImage' class='slideshowImage' />\n" +
        "               <div class='slideshowNavgArrows'><img src='/Images/rightArrowOpaque02.png' /></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +
        "<div id='slideShowInstructions' class='slideShowVail'></div>\n" +
        "<div id='slideshowCtxMenuContainer' class='ogContextMenu' style='z-index: 35;'  onmouseleave='$(this).fadeOut()'>" +
        "   <div id='slideshowContextMenuContent'></div>\n" +
        "</div>\n" +
        "<div id='copycatDiv' class='copycatMsg' onclick='copyCatClick()' >categorize</div>" +
        "<div id='slideshowImageLabel' class='slideshowImageLabel displayHidden' onclick='slideshowImageLabelClick()'></div>\n";
}

function slideShowDialogClose() {
    //alert("slideShowDialogClose()");
    $('#slideShowDialogContainer').fadeOut();
}

function slideShowInstructions() {

}
