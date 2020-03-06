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

    if (isNullorUndefined(folderId)) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "BAD",
            Severity: 2,
            ErrorMessage: "PROBLEMO isNullorUndefined(imageViewerFolderId):  folderName: " + folderName +
                "  ipAddr: " + getCookieValue("IpAddress") + "  user directed to home page",
            CalledFrom: "SlideShow.js launchViewer"
        });
        //sendEmailToYourself("PROBLEMO in slideshow.js", "imageViewerFolderId: " + imageViewerFolderId + "  folderName: " + folderName +
        //    "  ipAddr: " + getCookieValue("IpAddress") + "  user directed to home page");
        window.location.href = "/";
    }

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

    //alert("logImageHit true ");
    //console.log("logImageHit from launchViewer: " + imageViewerArray[imageViewerIndex].Link);

    if (isNullorUndefined(imageViewerFolderId)) {
        //sendEmailToYourself("830 PROBLEMO 1 in slideshow.js.slide.", "  visitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + imageViewerFolderId);
        if (document.domain === 'localhost')
            alert("830 PROBLEMO 1 in slideshow.js.slide.\nvisitorId: " + visitorId + "\nIpAddress: " + ipAddress + "\nfolderId: " + imageViewerFolderId);
        logError({
            VisitorId: visitorId,
            ActivityCode: "SLD",
            Severity: 4,
            ErrorMessage: "imageViewerFolderId isNullorUndefined(). Do Not Call LogVisitor",
            CalledFrom: "slideshow.js.slide"
        });
        //logVisitor(folderId, "launch viewer");
    }

    //if (isNullorUndefined(ipAddress) || isNullorUndefined(visitorId) || isNullorUndefined(folderId)) {
    ipAddress = getCookieValue("IpAddress");
    if (isNullorUndefined(ipAddress)) {
        visitorId = getCookieValue("VisitorId");
        if (document.domain === 'localhost')
            alert("830 PROBLEMO 1 in slideshow.js.slide.\nvisitorId: " + visitorId + "\nIpAddress: " + ipAddress + "\nfolderId: " + imageViewerFolderId);
        logError({
            VisitorId: visitorId,
            ActivityCode: "SIP",
            Severity: 4,
            ErrorMessage: "ipAddress isNullorUndefined(). Calling LogVisitor",
            CalledFrom: "slideshow.js.slide"
        });
        //sendEmailToYourself("830 PROBLEMO 1 in slideshow.js.slide.", "  visitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + imageViewerFolderId);
        logVisitor(folderId, "launch viewer");
    }
    visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        //sendEmailToYourself("830 PROBLEMO 1 in slideshow.js.slide.", "  visitorId: " + visitorId + "  IpAddress: " + ipAddress + "  folderId: " + imageViewerFolderId);
        if (document.domain === 'localhost')
            alert("830 PROBLEMO 1 in slideshow.js.slide.\nvisitorId: " + visitorId + "\nIpAddress: " + ipAddress + "\nfolderId: " + imageViewerFolderId);
        if (!isNullorUndefined(ipAddress)) {
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "SVD",
                Severity: 4,
                ErrorMessage: "visitorId isNullorUndefined().Calling LogVisitor",
                CalledFrom: "slideshow.js.slide"
            });
            logVisitor(folderId, "launch viewer");
        }
        //logVisitor(folderId, "launch viewer");  next time
    }
    //if (document.domain === 'localhost') alert("Proper logImageHit of Initial \nslideshow.js.slide.\nvisitorId: " + visitorId + "\nIpAddress: " + ipAddress + "\nfolderId: " + imageViewerFolderId);
    sessionCount++;
    logImageHit(ipAddress, visitorId, imageViewerArray[imageViewerIndex].Link, folderId, true);
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
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "SVD",
                Severity: 4,
                ErrorMessage: "PROBLEMO 2 in slideshow.js.slide.  ImageViewerFolderId isNullorUndefined " + "IP: " + ipAddress,
                CalledFrom: "slideshow.js.slideClick"
            });
            //sendEmailToYourself("PROBLEMO 2 in slideshow.js.slide.  ImageViewerFolderId isNullorUndefined " + "IP: " + ipAddress);
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
    logEventActivity({
        VisitorId: getCookieValue("VisitorId"),
        EventCode: "SVC",
        EventDetail: "slideshowContexMenu clicked item: " + imageViewerArray[imageViewerIndex].Id,
        CalledFrom: "Sideshow"
    });
}

function XXXimageViewerContextMenuAction(action) {   
    switch (action) {
        case "show":
            //reportThenPerformEvent("SMD", imageViewerFolderId, $('#ctxImageViewerModelName').html());  // do nothing but report
            showModelInfoDialog($('#ctxImageViewerModelName').html(), imageViewerSelectedImageArchiveFolderId, imageViewerArray[imageViewerIndex].Link);
            closeViewer("showModelInfoDialog");
            break;
        case "jump":
            window.open("/album.html?folder=" + imageViewerSelectedImageArchiveFolderId, "_blank");
            break;
        case "comment":
            showImageCommentDialog(imageViewerArray[imageViewerIndex].Link, imageViewerArray[imageViewerIndex].LinkId, imageViewerSelectedImageArchiveFolderId, imageViewerFolderNamecurrentFolderId);
            closeViewer("showImageCommentDialog");
            break;
        case "explode":
            window.open(imageViewerArray[imageViewerIndex].Link, "_blank");
            break;
        case "archive":
            $('#imageViewerContextMenu').fadeOut();
            showMoveCopyDialog("Archive", imageViewerArray[imageViewerIndex].Link, imageViewerFolderId);
            closeViewer("showMoveCopyDialog");
            break;
        case "copy":
            $('#imageViewerContextMenu').fadeOut();
            showMoveCopyDialog("Copy", imageViewerArray[imageViewerIndex].Link, imageViewerFolderId);
            closeViewer("showMoveCopyDialog");
            break;
        case "move":
            $('#imageViewerContextMenu').fadeOut();
            showMoveCopyDialog("Move", imageViewerArray[imageViewerIndex].Link, imageViewerFolderId);
            closeViewer("showMoveCopyDialog");
            break;
        case "showLinks":
            showLinks(imageViewerArray[imageViewerIndex].LinkId);
            break;
        case "remove":
            removeImage(imageViewerArray[imageViewerIndex].LinkId);
            closeViewer("removeImage");
            break;
        case "setF":
            setFolderImage(imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, "folder");
            break;
        case "setC":
            setFolderImage(imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, "parent");
            break;
        default:
            alert(action);
    }
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
