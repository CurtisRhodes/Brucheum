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

function launchViewer(imageArray, imageIndex, folderId, folderName) {
    imageViewerFolderId = folderId;

    if (isNullorUndefined(imageViewerFolderId)) {
        imageViewerFolderId = 1;
        sendEmailToYourself("PROBLEMO in slideshow.js", "imageViewerFolderId: " + imageViewerFolderId + "  folderName: " + folderName +
            "  ipAddr: " + getCookieValue("IpAddress") + "  user directed to home page");
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

    $('.assuranceArrows').click(function () {
        alert("move image");
        //sendEmailToYourself("click on carousel arrow", "who");
    });

    //alert("logImageHit true ");
    //console.log("logImageHit from launchViewer: " + imageViewerArray[imageViewerIndex].Link);
    logImageHit(imageViewerArray[imageViewerIndex].Link, folderId, true);

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
                alert("staticPageFolderName: " + staticPageFolderName);
                currentfolderName = staticPageFolderName;
            }
            else
                alert("fked");

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
    else 
        slide(direction);
}

function slide(direction) {
    try {

        $('.assuranceArrows').hide();
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

        //console.log("logImageHit from slide: " + imageViewerArray[imageViewerIndex].Link);
        if (isNullorUndefined(imageViewerFolderId)) {
            sendEmailToYourself("PROBLEMO 1 in slideshow.js.slide.  ImageViewerFolderId isNullorUndefined " + "IP: " + getCookieValue("IpAddress"));
        }
        else
            logImageHit(imageViewerArray[imageViewerIndex].Link, imageViewerFolderId, false);

        setTimeout(function () {
            $('.assuranceArrows').hide();
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
            setTimeout(function () { $('.assuranceArrows').fadeIn(); }, 1100);
        }, 450);
        resizeViewer();
        $('#footerMessage').html("image: " + imageViewerIndex + " of: " + imageViewerArray.length);
    } catch (e) {
        sendEmailToYourself("CATCH ERROR in slideshow.js.slide " + "Error: " + e);
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
    closeViewer();
    showImageCommentDialog(imageViewerArray[imageViewerIndex].Link, imageViewerArray[imageViewerIndex].LinkId, imageViewerFolderId, imageViewerFolderName);
}

function slideshowContexMenu() {
    ctxSAP(imageViewerArray[imageViewerIndex].Id);
}

function imageViewerContextMenuAction(action) {
    switch (action) {
        case "show":
            showModelInfoDialog($('#ctxImageViewerModelName').html(), imageViewerSelectedImageArchiveFolderId, imageViewerArray[imageViewerIndex].Link);
            closeViewer();
            break;
        case "jump":
            window.open("/album.html?folder=" + imageViewerSelectedImageArchiveFolderId, "_blank");
            break;
        case "comment":
            showImageCommentDialog(imageViewerArray[imageViewerIndex].Link, imageViewerArray[imageViewerIndex].LinkId, imageViewerSelectedImageArchiveFolderId, imageViewerFolderNamecurrentFolderId);
            closeViewer();
            break;
        case "explode":
            window.open(imageViewerArray[imageViewerIndex].Link, "_blank");
            break;
        case "archive":
            $('#imageViewerContextMenu').fadeOut();
            showMoveCopyDialog("Archive", imageViewerArray[imageViewerIndex].Link, imageViewerFolderId);
            closeViewer();
            break;
        case "copy":
            $('#imageViewerContextMenu').fadeOut();
            showMoveCopyDialog("Copy", imageViewerArray[imageViewerIndex].Link, imageViewerFolderId);
            closeViewer();
            break;
        case "move":
            $('#imageViewerContextMenu').fadeOut();
            showMoveCopyDialog("Move", imageViewerArray[imageViewerIndex].Link, imageViewerFolderId);
            closeViewer();
            break;
        case "showLinks":
            showLinks(imageViewerArray[imageViewerIndex].LinkId);
            break;
        case "remove":
            removeImage(imageViewerArray[imageViewerIndex].LinkId);
            closeViewer();
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

function closeViewer() {
    $('#imageViewerDialog').effect('blind', { mode: 'hide', direction: 'vertical' }, 500);
    viewerShowing = false;
    slideShowRunning = false;
    clearInterval(imageViewerIntervalTimer);
    $('#txtStartSlideShow').html("start slideshow");
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
    if (viewerShowing) {
        switch (event.which) {
            case 27:                        // esc
                closeViewer();
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
