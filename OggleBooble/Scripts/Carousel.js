var numImages = 0;
var numFolders = 0;
var rotationSpeed = 5123;
var intervalSpeed = 800;
var carouselItemArray = new Array();
var imageIndex = 0;
var carouselContainerHeight;
var Carousel;
var selectedImageArchiveFolderId;

function launchCarousel(root) {
    $('#footerMessage').html("loading carousel");
    loadImages(root, true, 20);
}

function loadImages(rootFolder, isChecked, take) {
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
                        if (removedFolders.find(function () { return carouselItemArray[idx].FolderName }) === undefined) {
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
            url: service + "/api/Carousel/GetLinks?root=" + rootFolder + "&take=" + take,
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
                        showImage();
                        rotate();
                    }

                    numImages += carouselInfo.Links.length;
                    numFolders += carouselInfo.FolderCount;
                    imageIndex = Math.floor(Math.random() * numImages);

                    var delta = (Date.now() - start) / 1000;
                    console.log("loadImages(" + rootFolder + ") take: " + take + " took: " + delta.toFixed(3));
                    if (take === 20) {
                        loadImages(rootFolder, isChecked, 1500);
                    }
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


function showFolderCategoryDialog() {
    pause();
    showCategoryDialog(carouselItemArray[imageIndex].FolderId);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        resume();
    });
}

function clickViewGallery() {
    clearInterval(Carousel);
    window.location.href = "/album?folder=" + carouselItemArray[imageIndex].FolderId;
}

function clickViewParentGallery() {
    window.location.href = "/album?folder=" + carouselItemArray[imageIndex].ParentId;
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    imageIndex = Math.floor(Math.random() * numImages);
    $('.carouselImage').attr('src', carouselItemArray[imageIndex].Link);
    clearInterval(Carousel);
    rotate();
}

function showImage() {

    $('.carouselImage').fadeOut(intervalSpeed);
    setTimeout(function () {
        imageIndex = Math.floor(Math.random() * numImages);
        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
        $('#thisCarouselImage').on('load', onImageLoaded());
    }, intervalSpeed);
    // $('#carouselImage').on('error', onImageNotLoaded());


    //$('#footerMessage').html("inamge: " + (imageIndex + 1).toLocaleString() + " of " + numImages.toLocaleString() + " images in " + numFolders + " galleries  ");


}

function onImageLoaded() {

    $('#categoryLabel').html(carouselItemArray[imageIndex].FolderPath);
    $('#categoryTitle').html(carouselItemArray[imageIndex].FolderName);
    $('#thisCarouselImage').contextmenu(function () {
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
    });
    $('#thisCarouselImage').fadeIn(intervalSpeed);
    resizePage();
}

//<div id="ctxModelName" onclick="carouselContextMenuAction('showDialog')">model name</div>
//<div id="ctxSeeMore" onclick="carouselContextMenuAction('seeMore')">See More</div>
//<div onclick="carouselContextMenuAction('explode')">Explode</div>
//<div onclick="carouselContextMenuAction('comment')">Comment</div>
//<div onclick="carouselContextMenuAction('tags')">Tags</div>
//<div id="ctxMove" onclick="carouselContextMenuAction('archive')">Archive</div>

$('#folderCategoryDialog').on('dialogopen', function (event) {
    pause();
});

$('#folderCategoryDialog').on('dialogclose', function (event) {
    alert("$('#folderCategoryDialog').on('dialogclose'");
    resume();
});


$('#imageCommentDialog').on('dialogclose', function (event) {
    resume();
});

$('#metaTagDialog').on('dialogclose', function (event) {
    resume();
});


function carouselContextMenuAction(ctxMenuAction) {
    switch (ctxMenuAction) {
        case "showDialog":
            $('#carouselContextMenu').fadeOut();
            pause();
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId);
            $('#modelInfoDialog').on('dialogclose', function (event) {
                resume();
            });
            break;
        case "seeMore":
            window.open('/album?folder=' + selectedImageArchiveFolderId, '_blank');
            break;
        case "explode":
            window.open(carouselItemArray[imageIndex].Link, "_blank");
            break;
        case "comment":
            $('#carouselContextMenu').fadeOut();
            pause();
            $('#carouselContextMenu').fadeOut();
            showImageCommentDialog(carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].LinkId,
                carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].FolderName);
            break;
        case "tags":
            $('#carouselContextMenu').fadeOut();
            pause();
            openMetaTagDialog(carouselItemArray[imageIndex].FolderId);
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
    if (!$('#modelInfoDialog').dialog('isOpen')) {
        if (!$('#imageCommentDialog').dialog('isOpen')) {
            resume();
        }
    }
}

function resizeCarousel() {
    $('.carouselImage').css("max-width", $('#middleColumn').width());
    $('.carouselImage').css("max-height", $('#middleColumn').innerHeight() - 180);
}

function onImageNotLoaded() {
    alert("bk image " + carouselItemArray[imageIndex].Link + " not found")
}

function rotate() {
    Carousel = setInterval(function () {
        showImage();
    }, rotationSpeed);
}

function togglePause() {
    if ($('#pauseButton').html() === "||")
        pause();
    else
        resume();
}

function pause() {
    clearInterval(Carousel);
    $('#pauseButton').html(">");
}

function resume() {
    clearInterval(Carousel);
    startCarousel();
    $('#pauseButton').html("||");
}

function startCarousel() {
    showImage();
    rotate();
}

function writeXML() {


}


