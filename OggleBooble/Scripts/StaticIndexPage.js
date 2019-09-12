var service = "https://api.curtisrhodes.com/";
var carouselArray = [];
var promoMessagesArray = new Array();
var promoMessageRotator;
var allowthemtoLoadIntervar;
var totalRows = 0;
var arrayLength;
var imageIndex = 0;
var promoIdx = 0;
var promoMessageRotationSpeed = 13000;
var httpLocation = "https://ogglebooble.com/static";
var selectedImageArchiveFolderId;
var loadingImages = false;
var rotationSpeed = 5123;
var intervalSpeed = 800;
var throttleSpeed = 15200;
var throttleSize = 2500;

$(document).ready(function () {
    //loadHardCoded();
    launchPromoMessages();

    var cookie = getCookie("User");

    if (cookie !== "") {
        $('#divNotLogedIn').hide();
        $('#divLogedIn').show();
        $('#helloUser').html("hello: " + cookie);
    }
    logPageHit(staticPageFolderName, "static");
});

function loadHardCoded() {   
    var start = Date.now();
    var idx = 0;
    $('#hardcodedImagesContainer').children("img").each(function () {
        carouselArray[idx] = new Image();
        carouselArray[idx].src = $(this).attr("src");
        carouselArray[idx].ParentName = $(this).attr("parentName");
        carouselArray[idx].RootFolder = $(this).attr("rootFolder");
        carouselArray[idx].LinkId = $(this).attr("linkId");
        carouselArray[idx].FolderId = $(this).attr("folderId");
        carouselArray[idx++].FolderName = $(this).attr("folderName");
    });
    var delta = (Date.now() - start) / 1000;
    console.log("loadHardCoded took: " + delta.toFixed(3));
    arrayLength = carouselArray.length;
    startCarousel();
    throttleImages();
}

function startCarousel() {
    $('.carouselContainer').show();
    $('#laCarouselImageContainer').show();
    itnervalBody();
    CarouselInterval = setInterval(function () {
        itnervalBody();
    }, rotationSpeed);
}

function itnervalBody() {
    if (loadingImages) {
        console.log("loadingImages");
    }
    else {
        $('#categoryTitle').fadeOut(intervalSpeed);
        $('#laCarouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
            $('#laCarouselImageContainer img').attr("src", carouselArray[imageIndex].src);
            $('#laCarouselImageContainer').fadeIn(intervalSpeed);
            $('#categoryTitle').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
            $('#categoryLabel').html(carouselArray[imageIndex].ParentName);
            $('#categoryLabel').click(function () {
                window.location.href = httpLocation + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].ParentName + ".html";
            });
            $('#laCarouselImageContainer img').click(function () {
                window.location.href = httpLocation + "/" + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].FolderName + ".html";
            });
            $('#laCarouselImageContainer img').css("max-width", $('#middleColumn').width());
            $('#laCarouselImageContainer img').css("max-height", $('#middleColumn').innerHeight() - 180);
            $('#footerMessage').html("image: " + imageIndex + " of " + arrayLength);
            imageIndex = Math.floor(Math.random() * arrayLength);
            //imageIndex++;// = Math.floor(Math.random() * arrayLength);
            //if (imageIndex > carouselArray.length)
            //    imageIndex = 0;
        });
    }
}

function throttleImages() {
    allowthemtoLoadIntervar = setInterval(function () {
        console.log("getMoreImages(" + arrayLength + "," + throttleSize + ")");
        getMoreImages(arrayLength, throttleSize);
    }, throttleSpeed);
}

function getMoreImages(skip, take) {
    //setTimeout(function () {
    var start = Date.now();
    loadingImages = true;
        $.ajax({
            type: "PUT",
            url: service + "api/StaticPage/AddMoreImages?rootFolder=" + staticPageRootFolder + "&skip=" + skip + "&take=" + take,
            success: function (vwLinks) {
                $.each(vwLinks, function (idx, obj) {
                    carouselArray[skip + idx] = new Image();
                    carouselArray[skip + idx].src = obj.Link;
                    carouselArray[skip + idx].LinkId = obj.LinkId;
                    carouselArray[skip + idx].ParentName = obj.ParentName;
                    carouselArray[skip + idx].RootFolder = obj.RootFolder;
                    carouselArray[skip + idx].FolderId = obj.FolderId;
                    carouselArray[skip + idx].FolderName = obj.FolderName;
                });
                arrayLength += take;
                if (arrayLength > carouselArray.length) {
                    arrayLength = carouselArray.length;
                    console.log("CLEAR INTERVAL arrayLength: " + arrayLength + "  carouselArray.length: " + carouselArray.length);
                    clearInterval(allowthemtoLoadIntervar);
                }
                var delta = (Date.now() - start) / 1000;
                console.log("getMoreImages skip: " + skip + " take: " + take + " took: " + delta.toFixed(3));
                loadingImages = false;
            },
            error: function (jqXHR, exception) {
                alert("AddMoreImages XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    //}, 10000);
}

function showContextMenu() {
    event.preventDefault();
    window.event.returnValue = false;
    //alert("carouselArray[" + imageIndex + "].LinkId: " + carouselArray[imageIndex].LinkId);
    pause();
    $('#ctxModelName').html("");
    $.ajax({
        type: "GET",
        url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + carouselArray[imageIndex].LinkId,
        success: function (imageDetails) {
            if (imageDetails.Success === "ok") {
                if (imageDetails.RootFolder !== "boobs") {
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
function carouselContextMenuAction(ctxMenuAction) {
    switch (ctxMenuAction) {
        case "showDialog":
            $('#carouselContextMenu').fadeOut();
            modelInfoDialogIsOpen = true;
            pause();
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId, carouselArray[imageIndex].Link);
            $('#modelInfoDialog').on('dialogclose', function (event) {
                modelInfoDialogIsOpen = false;
                resume();
            });
            break;
        case "seeMore":
            window.open(httpLocation + selectedImageArchiveFolderId, '_blank');
            break;
        case "explode":
            window.open(carouselArray[imageIndex].src, "_blank");
            break;
        case "comment":
            $('#carouselContextMenu').fadeOut();
            imageCommentDialogIsOpen = true;
            pause();
            $('#carouselContextMenu').fadeOut();
            showImageCommentDialog(carouselArray[imageIndex].Link, carouselArray[imageIndex].LinkId,
                carouselArray[imageIndex].FolderId, carouselArray[imageIndex].FolderName);
            $('#imageCommentDialog').on('dialogclose', function (event) {
                imageCommentDialogIsOpen = false;
                resume();
            });
            break;
        case "tags":
            $('#carouselContextMenu').fadeOut();
            pause();
            metaTagDialogIsOpen = true;
            //alert("carouselArray[imageIndex].FolderId: " + carouselArray[imageIndex].FolderId);
            openMetaTagDialog(carouselArray[imageIndex].FolderId, carouselArray[imageIndex].LinkId);
            $('#metaTagDialog').on('dialogclose', function (event) {
                metaTagDialogIsOpen = false;
                resume();
            });
            break;
        case "archive":
            $('#carouselContextMenu').fadeOut();
            pause();
            $('#carouselContextMenu').fadeOut();
            showMoveCopyDialog("Archive", carouselArray[imageIndex].Link, carouselArray[imageIndex].FolderId);
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

function clickViewParentGallery() {
    alert("clickViewParentGallery()");
    window.location.href = "/home/ImagePage?folder=" + carouselArray[imageIndex].ParentId;
    //window.location.href = "http://pages.ogglebooble.com/" + carouselArray[imageIndex].FolderName + ".html";
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

function launchPromoMessages() {
    $.ajax({
        type: "GET",
        url: service + "/api/OggleBlog/GetBlogList?commentType=PRO",
        success: function (blogCommentsContainer) {
            if (blogCommentsContainer.Success === "ok") {
                $.each(blogCommentsContainer.blogComments, function (idx, blogComment) {
                    promoMessagesArray.push({
                        FolderId: blogComment.Id,
                        Link: blogComment.Link,
                        CommentTitle: blogComment.CommentTitle,
                        CommentText: blogComment.CommentText
                    });
                });
                showPromoMessages();
            }
            else {
                $('#blogLoadingGif').hide();
                alert("loadPromoMessages: " + blogCommentsContainer.Success);
            }
        },
        error: function (jqXHR, exception) {
            $('#blogLoadingGif').hide();
            alert("loadPromoMessages jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
function showPromoMessages() {
    $('#promoContainer').fadeIn();
    var currentItem = promoMessagesArray[promoIdx];
    $('#promoContainerTitle').html(currentItem.CommentTitle);
    $('#promoContainerText').html(currentItem.CommentText);

    promoMessageRotator = setInterval(function () {

        if (promoIdx === promoMessagesArray.length) {
            promoIdx = 0;
        }
        currentItem = promoMessagesArray[promoIdx];
        $('#promoContainerTitle').html(currentItem.CommentTitle);
        $('#promoContainerText').html(currentItem.CommentText);
        promoIdx++;
    }, promoMessageRotationSpeed);
}
function killPromoMessages() {
    $('#promoContainer').fadeOut();
    clearInterval(promoMessageRotator);
    setInterval(function () { showPromoMessages(); }, 300000);
}

function letemPorn(response) {
    // record hit
    if (response === "ok") {
        window.location.href = httpLocation + "/porn.html";
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
    }
}


