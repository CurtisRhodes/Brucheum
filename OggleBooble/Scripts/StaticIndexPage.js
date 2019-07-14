var carouselArray = [];
var totalRows = 0;
var arrayLength;
var imageIndex;
var service = "http://localhost:40395/";

$(document).ready(function () {
    loadHardCoded();
    //loadMoreImages();
});

function loadHardCoded() {   
    //sb.Append("<img id='image" + i + "' folderName='" + vwLinks[i].FolderName + "'  linkId='" + vwLinks[i].LinkId + "' src='" + vwLinks[i].Link + "'/>\n");
    var start = Date.now();
    var idx = 0;
    $('#carouselImageContainer').children("img").each(function () {
        carouselArray[idx] = new Image();
        carouselArray[idx].src = $(this).attr("src");
        carouselArray[idx].ParentName = $(this).attr("parentName");
        carouselArray[idx].RootFolder = $(this).attr("rootFolder");
        carouselArray[idx].FolderId = $(this).attr("folderId");
        carouselArray[idx++].FolderName = $(this).attr("folderName");

    });
    var delta = (Date.now() - start) / 1000;
    console.log("loadHardCoded took: " + delta.toFixed(3));
    arrayLength = carouselArray.length;
    startCarousel();
    getMoreImages(arrayLength, 10000);
}

function startCarousel() {

    imageIndex = Math.floor(Math.random() * arrayLength);
    $('#laCarouselImageContainer').html(carouselArray[imageIndex]).fadeIn(3000);
    $('#categoryLabel').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
    $('#categoryTitle').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
    $('#categoryLabel').html(carouselArray[imageIndex].ParentName);
    $('#laCarouselImageContainer img').css("max-width", $('#middleColumn').width());
    $('#laCarouselImageContainer img').css("max-height", $('#middleColumn').innerHeight() - 180);
    $('#laCarouselImageContainer img').click(function () {
        window.location.href = "http://pages.ogglebooble.com/" + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].FolderName + ".html";
    });

    CarouselInterval = setInterval(function () {
        setTimeout(function () {
            $('#categoryTitle').fadeOut(intervalSpeed).hide();
            $('#laCarouselImageContainer').fadeOut(500, "linear", function () {
                imageIndex = Math.floor(Math.random() * arrayLength);

                $('#laCarouselImageContainer').html(carouselArray[imageIndex]).fadeIn(3000);
                $('#categoryTitle').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
                $('#categoryLabel').html(carouselArray[imageIndex].ParentName);

                $('#laCarouselImageContainer img').css("max-width", $('#middleColumn').width());
                $('#laCarouselImageContainer img').css("max-height", $('#middleColumn').innerHeight() - 180);
                $('#laCarouselImageContainer img').click(function () {
                    //alert("" + carouselArray[imageIndex].Id);
                    window.location.href = "http://pages.ogglebooble.com/" + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].FolderName + ".html";
                });
                $('#footerMessage').html("image: " + imageIndex + " of " + arrayLength);
            });
        }, intervalSpeed);
    }, rotationSpeed);
}

function getMoreImages(skip, take) {

    setTimeout(function () {
        var start = Date.now();
        $.ajax({
            type: "PUT",
            url: service + "api/StaticPage/AddMoreImages?rootFolder=" + staticPageRootFolder + "&skip=" + skip + "&take=" + take,
            success: function (vwLinks) {
                $.each(vwLinks, function (idx, obj) {
                    carouselArray[skip + idx] = new Image();
                    carouselArray[skip + idx].src = obj.Link;
                    carouselArray[skip + idx].ParentName = obj.ParentName;
                    carouselArray[skip + idx].RootFolder = obj.RootFolder;
                    carouselArray[skip + idx].FolderId = obj.FolderId;
                    carouselArray[skip + idx].FolderName = obj.FolderName;
                });

                var delta = (Date.now() - start) / 1000;
                console.log("getMoreImages took: " + delta.toFixed(3));
            },
            error: function (jqXHR, exception) {
                alert("LoginPopup XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }, 10000);

    var allowthemtoLoadIntervar = setInterval(function () {
        arrayLength += 500;
        arrayLength = Math.min(arrayLength, carouselArray.length);
        if (arrayLength === carouselArray.length)
            clearInterval(allowthemtoLoadIntervar);
    }, 30000);
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

function slowlyShowFolderCategoryDialog() {

    setTimeout(function () {

        if (forgetShowingCatDialog === false) {
            pause();

            //alert("FolderId: " + carouselArray[imageIndex].FolderId);

            folderCategoryDialogIsOpen = true;
            showCategoryDialog(carouselArray[imageIndex].FolderId);
        }
    }, 600);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        folderCategoryDialogIsOpen = false;
        resume();
    });
}

function clickViewGallery() {
    clearInterval(CarouselInterval);
    //alert("clickViewGallery");
    window.location.href = "/home/ImagePage?folder=" + carouselItemArray[imageIndex].FolderId;
    //window.location.href = "http://pages.ogglebooble.com/" + carouselItemArray[imageIndex].RootFolder + "/" + carouselItemArray[imageIndex].FolderName + ".html";
}

function clickViewParentGallery() {
    window.location.href = "/home/ImagePage?folder=" + carouselItemArray[imageIndex].ParentId;
    //window.location.href = "http://pages.ogglebooble.com/" + carouselItemArray[imageIndex].FolderName + ".html";
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
