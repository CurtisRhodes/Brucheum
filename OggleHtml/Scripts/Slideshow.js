var exploderInterval;
var slideShowSpeed = 0;
var viewerH = 50;
var viewerW = 50;
var viewerT = 0;
var viewerL = 0;
var windowW = $(window).width();
var windowH = $(window).height();
var Xincrimentor = 15;
var Yincrimentor = 10;
var exploderSpeed = 18;
var imageViewerSelectedImageArchiveFolderId;
var imageViewerFolderId;
var imageViewerArray;
var imageViewerIndex;
var imageViewerIntervalTimer;
var imageViewerFolderName;
var viewerShowing = false;
var slideShowRunning = false;
var ipAddress;
var visitorId;
var sessionCount = 0;

//if(domain=="localhost")
function launchViewer(imageArray, imageIndex, folderId, folderName) {
    imageViewerFolderId = folderId;
    sessionCount = 0;
    imageViewerArray = imageArray;
    imageViewerIndex = imageIndex;
    imageViewerFolderName = folderName;
    viewerH = 50;
    viewerW = 50;
    windowW = $(window).width();
    windowH = $(window).height();

    $('#imageViewerDialog').height(viewerH);
    $('#viewerImage').attr("src", imageViewerArray[imageViewerIndex].Link);
    $('#viewerImage').removeClass('redSides');
    $('#viewerButtonsRow').hide();
    $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
    resizePage();
    resizeViewer();
    $('#imageViewerDialog').show();

    visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        if (!isNullorUndefined(ipAddress)) {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/HitCounter/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                success: function (getInfoModel) {
                    if (getInfoModel.Success === "ok") {
                        visitorId = getInfoModel.VisitorId;
                        setCookieValue("VisitorId", visitorId);
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "WER",
                            Severity: 2,
                            ErrorMessage: "had to get visitorId from ip: " + ipAddress,
                            CalledFrom: "SlideShow.js launchViewer"
                        });
                    }
                    else {
                        if (getInfoModel.Success === "not found") {
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "BAD",
                                Severity: 2,
                                ErrorMessage: "could not even find visitorId with Ip: " + ipAddress,
                                CalledFrom: "SlideShow.js launchViewer GetVisitorIdFromIP"
                            });
                        }
                        else {
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "BAD",
                                Severity: 2,
                                ErrorMessage: getInfoModel.Success,
                                CalledFrom: "SlideShow.js launchViewer GetVisitorIdFromIP"
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
                            CalledFrom: "SlideShow.js launchViewer GetVisitorIdFromIP"
                        });
                    }
                }
            });
        }
        else {
            logError({
                VisitorId: "undefined",
                ActivityCode: "SVD",
                Severity: 2,
                ErrorMessage: "No visitorId and no Ip. Calling LogVisitor",
                CalledFrom: "slideshow.js / launchViewer"
            });
            logVisitor(folderId, "launch viewer");
        }
    }


    ipAddress = getCookieValue("IpAddress");
    if (isNullorUndefined(ipAddress)) {
        if (isNullorUndefined(visitorId)) {
            getIpFromVisitorId(visitorId, "launchViewer");
        }
        else {
            logError({
                VisitorId: visitorId,
                ActivityCode: "SIP",
                Severity: 4,
                ErrorMessage: "ipAddress AND visitorid undefined",
                CalledFrom: "slideshow.js / launchViewer"
            });
        }
        //sendEmailToYourself("830 PROBLEMO 1 in slideshow.js.slide.", "  visitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + imageViewerFolderId);
        // logVisitor(imageViewerFolderId, "launch viewer");
    }
    if (isNullorUndefined(imageViewerFolderId)) {
        if (!isNullorUndefined(folderName)) {
            getPageIdFromPageName("launchViewer");
        }
        //logVisitor(folderId, "launch viewer");
    }
    sessionCount++;
    logImageHit(ipAddress, visitorId, imageViewerArray[imageViewerIndex].Link, imageViewerFolderId, true);
    //function logImageHit(ipAddress, visitorId, link, pageId, isInitialHit) {
    //if (document.domain === 'localhost') alert("sessionCount: " + sessionCount);
    exploderInterval = setInterval(function () {
        explodeViewer();
    }, exploderSpeed);
}

function explodeViewer() {

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
                    ActivityCode: "BAD",
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
                    ActivityCode: "BAD",
                    Severity: 4,
                    ErrorMessage: "Issue in SlideShow  typeof staticPageFolderName",
                    CalledFrom: "slideshow.js explodeViewer"
                });
                //sendEmailToYourself("Issue in SlideShow", "staticPageFolderName: " + staticPageFolderName);
                if (document.domain === 'localhost') alert("Issue in SlideShow  typeof staticPageFolderName");
            }
        }

        $('#imageViewerHeaderTitle').html(imageViewerFolderName);
        $('#viewerButtonsRow').show();
        if (imageViewerArray[imageViewerIndex].Local)
            $('#viewerImage').addClass('redSides');
        clearInterval(exploderInterval);
        $('#imageViewerDialog').css('top', 0);
        $('#imageViewerDialog').css('left', 0);

        $('#leftClickArea').css('left', 0);
        $('#rightClickArea').css('left', viewerW / 2);

        $('#imageViewerDialog').width(viewerW);
        $('#imageViewerDialog').height(viewerH);

        setTimeout(function () {
            //alert("done here start slideshow");
            runSlideShow("start");
        }, 2000);
        

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
                            ActivityCode: "BAD",
                            Severity: 2,
                            ErrorMessage: "unable to get pageId from folderName: " + imageViewerFolderName,
                            CalledFrom: calledFrom
                        });
                    }
                    else {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "BAD",
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
        if (isNullorUndefined(imageViewerFolderId)) {
            getPageIdFromPageName("slideClick");
        }
        else {
            logImageHit(ipAddress, visitorId, imageViewerArray[imageViewerIndex].Link, imageViewerFolderId, false);
        }
    }
}

function slide(direction) {
    try {
        $('#thumbImageContextMenu').fadeOut();
        //$('.assuranceArrows').hide();
        $('.assuranceArrows').css('visibility', 'hidden');
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
            $('.assuranceArrows').css('visibility', 'hidden');
            //$('.assuranceArrows').hide();
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
            if (imageViewerArray[imageViewerIndex].Local)
                $('#viewerImage').addClass('redSides');
            else
                $('#viewerImage').removeClass('redSides');

            $('#viewerImage').show();
            $('#viewerImage').css("transform", "translateX(0)");
            setTimeout(function () { $('.assuranceArrows').css('visibility', 'visible').fadeIn(); }, 1100);
            
        }, 450);
        resizeViewer();
        sessionCount++;
        $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
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
    //alert("slideShow action: " + action);

    if (action === 'start') {
        if ($('#txtStartSlideShow').html() === "start slideshow") {
            slideShowRunning = true;
            $('#txtStartSlideShow').html("stop slideshow");
            //$('#txtStartSlideShow').attr("Title", "stop slideshow");
        }
        else {
            $('#txtStartSlideShow').html("start slideshow");
            slideShowRunning = false;
            clearInterval(imageViewerIntervalTimer);
            return;
        }
    }

    if (slideShowSpeed === 0) {
        slideShowSpeed = 5000;
    }
    if (action === "faster") {
        slideShowSpeed -= 1000;
    }
    if (action === "slower") {
        slideShowSpeed += 1000;
    }
    if (slideShowSpeed <= 0) {
        $('#showSlideshow').attr("Title", "start slideshow");
        $('#fasterSlideshow').attr("Title", "faster slideshow");
        $('#slowerSlideShow').attr("Title", "slower slideshow");
        clearInterval(imageViewerIntervalTimer);
    }
    else {
        //alert("slide('next');");
        slide('next');
        $('#fasterSlideshow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
        $('#slowerSlideShow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
        clearInterval(imageViewerIntervalTimer);
        imageViewerIntervalTimer = setInterval(function () {

            //alert("imageViewerIntervalTimer");

            slide('next');
        }, slideShowSpeed);
    }
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

function slideshowContexMenu() {
    ctxSAP(imageViewerArray[imageViewerIndex].Id);
}

function closeViewer(calledFrom) {
    event.preventDefault();
    window.event.returnValue = false;

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
        //            ". Close method: " + closeMethod + ".\nIp: " + getCookieValue("IpAddress"));
        //    }
        //    else {
        //        sendEmailToYourself("slideshow: " + imageViewerFolderName + ". Images Viewed: " + sessionCount,
        //            "Close method: " + closeMethod +
        //            ".<br/>Ip: " + getCookieValue("IpAddress"));
        //    }
        //}
    }
    sessionCount = 0;
}

function resizeViewer() {
    $('#leftClickArea').css('left', 0);
    $('#rightClickArea').css('left', $(window).width() / 2);

    $('#imageViewerDialog').width($(window).width());
    $('#imageViewerDialog').height($(window).height());
    $('#viewerImage').height($(window).height() - 30);
    $('.assuranceArrows img').height($(window).height() - 30);

    //alert("assuranceArrows height: " + $('.assuranceArrows img').height());

}

$(document).keydown(function (event) {
    if (viewerShowing && slideShowButtonsActive) {
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
