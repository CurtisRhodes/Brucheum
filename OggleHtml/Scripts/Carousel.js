var numImages = 0;
var numFolders = 0;
var rotationSpeed = 7000;
var intervalSpeed = 600;
var carouselItemArray = new Array();
var imageIndex = 0;
var carouselContainerHeight;
var CarouselInterval;
var selectedImageArchiveFolderId;
var metaTagDialogIsOpen = false;
var modelInfoDialogIsOpen = false;
var imageCommentDialogIsOpen = false;
var folderCategoryDialogIsOpen = false;
var forgetShowingCatDialog;
var initialTake = 100;

function launchCarousel(root) {
    $('#footerMessage').html("launching carousel");
    $('.carouselImage').css("height", "150px");

    //getAconnection(root);
    loadImages(root, true, 0, initialTake);
}

//function getAconnection(root) {
//    $('#customMessage').html("<div class='customMessageContainer'><div class='connectionMessage'><img src='http://library.curtisrhodes.com/canigetaconnection.gif'>");
//    $('.customMessageContainer').show();
//    $.ajax({
//        type: "PATCH",
//        async: true,
//        url: settingsArray.ApiServer + "api/AlbumPage/GetRootFolder?folderId=1",
//        success: function () {
//            $('.customMessageContainer').hide();
//            loadImages(root, true, 0, initialTake);
//        },
//        error: function (jqXHR) {
//            var errorMessage = getXHRErrorDetails(jqXHR);
//            if (!checkFor404(errorMessage, "getAconnection")) {
//                sendEmailToYourself("XHR ERROR IN ALBUM.JS getAconnection", "api/AlbumPage/GetRootFolder?folderId=1" +
//                    " Message: " + errorMessage);
//            }
//        }
//    });
//}

function loadImages(rootFolder, isChecked, skip, take) {
    var start = Date.now();
    var k = 0;
    var spliced = 0;
    if (isChecked === false) {
        var removedFolders = new Array();
        var newArray = new Array();
        for (idx = 0; idx < carouselItemArray.length; idx++) {
            k++;
            try {
                if (carouselItemArray[idx].RootFolder === rootFolder) {
                    if (idx < carouselItemArray.length) {
                        if (removedFolders.find(function () { return carouselItemArray[idx].FolderName; }) === undefined) {
                            //alert("not found " + carouselItemArray[idx].FolderName);
                            sendEmailToYourself("Problem removing Carousel array items", "not found " + carouselItemArray[idx].FolderName);
                            removedFolders.push(carouselItemArray[idx].FolderName);
                        }
                    }
                    else {
                        //alert("idx: " + idx + " carouselItemArray.length: " + carouselItemArray.length);
                        sendEmailToYourself("Problem removing Carousel array items", "idx: " + idx + " carouselItemArray.length: " + carouselItemArray.length);
                    }
                }
                else
                    newArray.push(carouselItemArray[idx]);
            } catch (e) {
                sendEmailToYourself("Problem removing Carousel array items", "idx: " + idx + " error: " + e);
                //alert("idx: " + idx + " error: " + e);
            }
        }
        carouselItemArray = newArray;

        numImages = carouselItemArray.length;
        numFolders = numFolders - removedFolders.length;
        var delta = (Date.now() - start) / 1000;
        console.log("Removing links from (" + rootFolder + ") took: " + delta.toFixed(3));
        sendEmailToYourself("message from loadImages", "loops: " + k + " spliced: " + spliced + " carouselItemArray.length: " + carouselItemArray.length + " numFolders: " + numFolders + " numImages: " + numImages);
        //alert("loops: " + k + " spliced: " + spliced + " carouselItemArray.length: " + carouselItemArray.length + " numFolders: " + numFolders + " numImages: " + numImages);
    }
    else {
        $('#laCarousel').show();
        $('#categoryTitle').hide();
        $.ajax({
            type: "GET",
            async: true,
            url: settingsArray.ApiServer + "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take,
            success: function (carouselInfo) {
                if (carouselInfo.Success === "ok") {
                    $.each(carouselInfo.Links, function (idx, obj) {
                        carouselItemArray.push({
                            FolderId: obj.FolderId,
                            RootFolder: obj.RootFolder,
                            ParentId: obj.ParentId,
                            FolderName: obj.FolderName,
                            Link: obj.Link,
                            LinkId: obj.LinkId,
                            FolderPath: obj.FolderPath
                        });
                    });

                    $('#categoryTitle').show();

                    if (numImages === 0) {
                        startCarousel();
                        $('#footerMessage').html("starting carousel");
                        resizeCarousel();
                        $('.assuranceArrows').click(function () {
                            //alert("move image");
                            resume();

                            var ipAddr = getCookieValue("IpAddress");
                            if (ipAddr !== "68.203.90.199983")

                                sendEmailToYourself("click on carousel arrow", "Ip: " + ipAddr +
                                "\n  folder: " + carouselItemArray[imageIndex].FolderName + "\n link: " + carouselItemArray[imageIndex].LinkId);
                            //logActivity
                        });
                    }
                    numImages = carouselInfo.Links.length;
                    numFolders += carouselInfo.FolderCount;

                    var delta = (Date.now() - start) / 1000;
                    if (take === initialTake) {
                        console.log("loadImages(" + rootFolder + ") take: " + initialTake + " took: " + delta.toFixed(3));
                        loadImages(rootFolder, isChecked, initialTake, 80000);
                    }
                    else
                        console.log("loadImages(" + rootFolder + ") take: " +
                            Number(carouselInfo.Links.length - initialTake) + " took: " + delta.toFixed(3));
                }
                else {
                    //alert("loadImages: " + carouselInfo.Success);
                    sendEmailToYourself("ERROR in Caraousel", "loadImages: " + carouselInfo.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getAconnection")) {
                    sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take +
                        "  Message: " + errorMessage);
                }
            }
        });
    }
}

function clickViewGallery() {
    clearInterval(CarouselInterval);
    alert("calling reportClickEvent");
    reportClickEvent("CIC", carouselItemArray[imageIndex].FolderId);
    window.location.href = "/album.html?folder=" + carouselItemArray[imageIndex].FolderId;
}

function clickViewParentGallery() {
    window.location.href = "/album.html??folder=" + carouselItemArray[imageIndex].ParentId;
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    imageIndex = Math.floor(Math.random() * numImages);
    $('.carouselImage').attr('src', carouselItemArray[imageIndex].Link);
    clearInterval(CarouselInterval);
    startCarousel();
}

function carouselContextMenuAction(ctxMenuAction) {
    switch (ctxMenuAction) {
        case "showDialog":
            $('#carouselContextMenu').fadeOut();
            modelInfoDialogIsOpen = true;
            pause();
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId, carouselItemArray[imageIndex].Link);
            $('#modelInfoDialog').on('dialogclose', function (event) {
                modelInfoDialogIsOpen = false;
                resume();
            });
            break;
        case "seeMore":
            window.open('/album.html?folder=' + selectedImageArchiveFolderId, '_blank');
            break;
        case "explode":
            window.open(carouselItemArray[imageIndex].Link, "_blank");
            break;
        case "comment":
            $('#carouselContextMenu').fadeOut();
            imageCommentDialogIsOpen = true;
            pause();
            $('#carouselContextMenu').fadeOut();
            showImageCommentDialog(carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].LinkId, carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].FolderName);
            $('#imageCommentDialog').on('dialogclose', function (event) {
                imageCommentDialogIsOpen = false;
                resume();
            });
            break;
        case "tags":
            $('#carouselContextMenu').fadeOut();
            pause();
            metaTagDialogIsOpen = true;
            //alert("carouselItemArray[imageIndex].FolderId: " + carouselItemArray[imageIndex].FolderId);
            openMetaTagDialog(carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].LinkId);
            $('#metaTagDialog').on('dialogclose', function (event) {
                metaTagDialogIsOpen = false;
                resume();
            });
            break;
        case "archive":
            $('#carouselContextMenu').fadeOut();
            pause();
            $('#carouselContextMenu').fadeOut();
            showMoveCopyDialog("Archive", carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].FolderId);
            break;
        default:
            sendEmailToYourself("Invalid context menu action", "invalid: " + ctxMenuAction);
            //alert("invalid: " + ctxMenuAction);
    }
}

function considerHidingContextMenu() {
    $('#carouselContextMenu').fadeOut();
    if (!metaTagDialogIsOpen) {
        if (!modelInfoDialogIsOpen) {
            if (!imageCommentDialogIsOpen) {
                if (!folderCategoryDialogIsOpen) {
                    resume();
                }
            }
        }
    }
}

function resizeCarousel() {
    $('.carouselImage').css("max-width", $('#middleColumn').width());
    //$('.carouselImage').css("height", $('#middleColumn').innerHeight() - 180);
    $('.carouselImage').css("height", $('#middleColumn').height() - 210);
    $('.assuranceArrows img').css("height", $('#middleColumn').height() - 210);
}

function togglePause() {
    if ($('#pauseButton').html() === "||")
        pause();
    else
        resume();
}

function pause() {
    clearInterval(CarouselInterval);
    $('#pauseButton').html(">");
}

function resume() {
    clearInterval(CarouselInterval);
    startCarousel();
    $('#pauseButton').html("||");
}

function startCarousel() {
    $('#footerMessage').html("startCarousel");
    intervalBody();
    CarouselInterval = setInterval(function () {
        //setTimeout(function () {
        intervalBody();
        //}, intervalSpeed);
    }, rotationSpeed);
}

function intervalBody() {
    $('#categoryTitle').fadeOut(intervalSpeed);
    $('#laCarousel').fadeOut(intervalSpeed, "linear", function () {
        imageIndex = Math.floor(Math.random() * numImages);
        //preloadImage = carouselItemArray[imageIndex].Link;
        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
        //$('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
        $('#categoryTitle').html(carouselItemArray[imageIndex].FolderPath + ": " + carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);

        // find links see if we know this girl.
        $('#categoryLabel').html(carouselItemArray[imageIndex].RootFolder);



        $('#laCarousel').fadeIn(intervalSpeed);
        resizeCarousel();
        //$('#footerMessage').html("image: " + imageIndex + " of " + numImages);
        //$('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link).onload = function () {        };
        //setTimeout(function () { }, 400);
    });
}

function carouselContextMenu() {

    //alert("carouselContextMenu() called");
    reportClickEvent("CMC", carouselItemArray[imageIndex].FolderId);


        event.preventDefault();
        window.event.returnValue = false;
        pause();
        $('#ctxModelName').html("");
        $.ajax({
            type: "GET",
            async: true,
            url: settingsArray.ApiServer + "api/ImageCategoryDetail/GetModelName?linkId=" + carouselItemArray[imageIndex].LinkId,
            success: function (imageDetails) {
                if (imageDetails.Success === "ok") {
                    if (imageDetails.RootFolder === "archive") {
                        // this is a known model
                        selectedImageArchiveFolderId = imageDetails.FolderId;
                        $('#ctxModelName').html(imageDetails.FolderName);
                        $('#ctxSeeMore').show();
                    }
                    else {
                        selectedImageArchiveFolderId = 0;
                        $('#ctxModelName').html("unknown model");
                        $('#ctxSeeMore').hide();
                    }
                }
                else {
                    //alert("GetModelName: " + imageDetails.Success);
                    sendEmailToYourself("GetModelName fail", imageDetails.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "carouselContextMenu")) {
                    sendEmailToYourself("XHR ERROR IN Carousel.JS carouselContextMenu", "api/ImageCategoryDetail/GetModelName?linkId=" + carouselItemArray[imageIndex].LinkId +
                        " Message : " + errorMessage);
                    //alert("containsLink xhr: " + getXHRErrorDetails(xhr));
                }
                sendEmailToYourself("GetNudeModelName xhr error: ", xhr.statusText);
                //alert("GetNudeModelName xhr error: " + xhr.statusText);
            }
        });
        $('#carouselContextMenu').css("top", event.clientY + 5);
        $('#carouselContextMenu').css("left", event.clientX);
        $('#carouselContextMenu').fadeIn();
}

function onImageNotLoaded() {
    sendEmailToYourself("onImageNotLoaded", "bk image " + carouselItemArray[imageIndex].Link + " not found");
    //alert("bk image " + carouselItemArray[imageIndex].Link + " not found");
}
