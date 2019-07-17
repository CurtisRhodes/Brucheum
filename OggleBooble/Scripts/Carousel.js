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
var service = "https://api.curtisrhodes.com/";
var forgetShowingCatDialog;
var initialTake = 100;

function launchCarousel(root) {
    $('#footerMessage').html("launching carousel");
    $('.carouselImage').css("height", "150px");
    loadImages(root, true, 0, initialTake);
}

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
                            alert("not found " + carouselItemArray[idx].FolderName);
                            removedFolders.push(carouselItemArray[idx].FolderName);
                        }
                    }
                    else {
                        alert("idx: " + idx + " carouselItemArray.length: " + carouselItemArray.length);
                    }
                }
                else
                    newArray.push(carouselItemArray[idx]);
            } catch (e) {
                alert("idx: " + idx + " error: " + e);
            }
        }
        carouselItemArray = newArray;

        numImages = carouselItemArray.length;
        numFolders = numFolders - removedFolders.length;
        var delta = (Date.now() - start) / 1000;
        console.log("Removing links from (" + rootFolder + ") took: " + delta.toFixed(3));
        alert("loops: " + k + " spliced: " + spliced + " carouselItemArray.length: " + carouselItemArray.length + " numFolders: " + numFolders + " numImages: " + numImages);
    }
    else {
        $('#laCarousel').show();
        $('#categoryTitle').hide();
        $.ajax({
            type: "GET",
            url: service + "/api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take,
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
                        //imageIndex = 0;
                        //$('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
                        //$('#categoryLabel').html(carouselItemArray[imageIndex].FolderPath);
                        //$('#categoryTitle').html(carouselItemArray[imageIndex].FolderName);
                        //resizeCarousel();
                        startCarousel();
                        $('#footerMessage').html("starting carousel");
                    }

                    numImages = carouselInfo.Links.length;
                    numFolders += carouselInfo.FolderCount;

                    var delta = (Date.now() - start) / 1000;

                    //setTimeout(function () {
                    if (take === initialTake) {
                        console.log("loadImages(" + rootFolder + ") take: " + initialTake + " took: " + delta.toFixed(3));
                        loadImages(rootFolder, isChecked, initialTake, 80000);
                        logVisit();

                    }
                    else
                        console.log("loadImages(" + rootFolder + ") take: " + Number(carouselInfo.Links.length - initialTake) + " took: " + delta.toFixed(3));
                    //}, 20000);

                }
                else
                    alert("loadImages: " + carouselInfo.Success);
            },
            error: function (jqXHR, exception) {
                alert("loadImages jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}
function logVisit() {

    if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    alert("ipAddress: " + ipAddress);

    $('#footerMessage').html("logging visit");

    if (userName === "") {
        userName = "unknown";
    }

    $.ajax({
        type: "POST",
        url: service + "api/HitCounter?userName=" + userName + "&appName=Ogglebooble",
        success: function (successModel) {
            if (successModel.Success === "ok") {
                $('#headerMessage').html(successModel.ReturnValue);
            }
            else
                alert(successModel.Success);
        },
        error: function (jqXHR, exception) {
            $('#blogLoadingGif').hide();
            alert("HitCounter/LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function slowlyShowFolderCategoryDialog() {

    setTimeout(function () {
        if (forgetShowingCatDialog === false) {
            pause();
            folderCategoryDialogIsOpen = true;
            showCategoryDialog(carouselItemArray[imageIndex].FolderId);
        }
    }, 1100);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        folderCategoryDialogIsOpen = false;
        resume();
    });
}

function clickViewGallery() {
    clearInterval(CarouselInterval);
    //alert("clickViewGallery");
    window.location.href = "/home/ImagePage?folder=" + carouselItemArray[imageIndex].FolderId;
}

function clickViewParentGallery() {
    window.location.href = "/home/ImagePage?folder=" + carouselItemArray[imageIndex].ParentId;
    //window.location.href = "http://pages.ogglebooble.com/" + carouselItemArray[imageIndex].FolderName + ".html";
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
            window.open('/home/ImagePage?folder=' + selectedImageArchiveFolderId, '_blank');
            break;
        case "explode":
            window.open(carouselItemArray[imageIndex].Link, "_blank");
            break;
        case "comment":
            $('#carouselContextMenu').fadeOut();
            imageCommentDialogIsOpen = true;
            pause();
            $('#carouselContextMenu').fadeOut();
            showImageCommentDialog(carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].LinkId,
                carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].FolderName);
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
            alert("invalid: " + ctxMenuAction);
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
        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
        setTimeout(function () {
            $('#categoryTitle').html(carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);
            $('#categoryLabel').html(carouselItemArray[imageIndex].FolderPath);
            $('#laCarousel').fadeIn(intervalSpeed);
        }, 400);
        resizeCarousel();
        $('#footerMessage').html("image: " + imageIndex + " of " + numImages);
    });
}


function carouselContextMenu() {
        event.preventDefault();
        window.event.returnValue = false;
        pause();
        $('#ctxModelName').html("");
        $.ajax({
            type: "GET",
            url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + carouselItemArray[imageIndex].LinkId,
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
                else
                    alert("GetModelName: " + imageDetails.Success);
            },
            error: function (xhr) {
                alert("GetNudeModelName xhr error: " + xhr.statusText);
            }
        });
        if (isPornEditor)
            $('#ctxMove').show();
        else
            $('#ctxMove').hide();
        $('#carouselContextMenu').css("top", event.clientY + 5);
        $('#carouselContextMenu').css("left", event.clientX);
        $('#carouselContextMenu').fadeIn();
}

function onImageNotLoaded() {
    alert("bk image " + carouselItemArray[imageIndex].Link + " not found");
}
