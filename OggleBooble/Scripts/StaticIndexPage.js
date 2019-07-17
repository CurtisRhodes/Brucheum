var carouselArray = [];
var totalRows = 0;
var arrayLength;
var imageIndex;
var service = "https://api.curtisrhodes.com/";
var promoIdx = 0;
var promoMessagesArray = new Array();
var promoMessageRotator;
var promoMessageRotationSpeed = 13000;
var httpLocation = "https://ogglebooble.com/static";
var selectedImageArchiveFolderId;

$(document).ready(function () {
    loadHardCoded();
    launchPromoMessages();

    var cookie = getCookie("User");

    if (cookie !== "") {
        $('#divNotLogedIn').hide();
        $('#divLogedIn').show();
        $('#helloUser').html("hello: " + cookie);
    }
    logVisit(cookie);
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
    $('.carouselContainer').show();
    imageIndex = Math.floor(Math.random() * arrayLength);
    $('#laCarouselImageContainer').html(carouselArray[imageIndex]).fadeIn(3000);
    $('#categoryLabel').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
    $('#categoryTitle').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
    $('#categoryLabel').html(carouselArray[imageIndex].ParentName);
    $('#laCarouselImageContainer img').css("max-width", $('#middleColumn').width());
    $('#laCarouselImageContainer img').css("max-height", $('#middleColumn').innerHeight() - 180);
    $('#laCarouselImageContainer img').click(function () {
        window.location.href = httpLocation + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].FolderName + ".html";
    });

    CarouselInterval = setInterval(function () {
        setTimeout(function () {
            $('#categoryTitle').fadeOut(intervalSpeed).hide();
            $('#laCarouselImageContainer').fadeOut(500, "linear", function () {
                imageIndex = Math.floor(Math.random() * arrayLength);

                $('#laCarouselImageContainer').html(carouselArray[imageIndex]).fadeIn(3000);
                $('#categoryTitle').html(carouselArray[imageIndex].FolderName).fadeIn(intervalSpeed);
                $('#categoryLabel').html(carouselArray[imageIndex].ParentName);
                $('#categoryLabel').click(function () {
                    window.location.href = httpLocation + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].ParentName + ".html";
                });

                $('#laCarouselImageContainer img').css("max-width", $('#middleColumn').width());
                $('#laCarouselImageContainer img').css("max-height", $('#middleColumn').innerHeight() - 180);
                $('#laCarouselImageContainer img').click(function () {
                    window.location.href = httpLocation + carouselArray[imageIndex].RootFolder + "/" + carouselArray[imageIndex].FolderName + ".html";
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
                    carouselArray[skip + idx].LinkId = obj.LinkId;
                    carouselArray[skip + idx].ParentName = obj.ParentName;
                    carouselArray[skip + idx].RootFolder = obj.RootFolder;
                    carouselArray[skip + idx].FolderId = obj.FolderId;
                    carouselArray[skip + idx].FolderName = obj.FolderName;
                });

                var delta = (Date.now() - start) / 1000;
                console.log("getMoreImages took: " + delta.toFixed(3));
            },
            error: function (jqXHR, exception) {
                alert("AddMoreImages XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }, 10000);

    var allowthemtoLoadIntervar = setInterval(function () {
        arrayLength += 250;
        arrayLength = Math.min(arrayLength, carouselArray.length);
        if (arrayLength === carouselArray.length)
            clearInterval(allowthemtoLoadIntervar);
    }, 30000);
}

function carouselContextMenu() {
    event.preventDefault();
    window.event.returnValue = false;
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
            window.open(carouselArray[imageIndex].Link, "_blank");
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

function clickViewParentGallery() {
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

function logVisit(userName) {
    $('#footerMessage').html("logging visit");
    $.ajax({
        type: "GET",
        url: service + "api/StaticPage/StaticPageGetIPAddress",
        success: function (ipaddress) {

            if (ipaddress === "68.203.90.183" || ipaddress === "50.62.160.105") return "ok";

            alert("ipAddress: " + ipAddress);

            $.ajax({
                type: "POST",
                url: service + "api/HitCounter?userName=" + userName + "&appName=Static OggleBooble",
                data: { UserName: userName, IpAddress: ipaddress, AppName: "static OggleBooble" },
                //data: visitModel,
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        $('#headerMessage').html(successModel.ReturnValue);
                    }
                    else
                        alert(successModel.Success);
                },
                error: function (jqXHR, exception) {
                    alert("HitCounter/LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        },
        error: function (jqXHR, exception) {
            alert("StaticPageGetIPAddress XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function letemPorn(response) {
    // record hit
    //alert("letemPorn: " + response);
    if (response === "ok") {
        window.location.href = 'http://pages.ogglebooble.com/sluts/sluts.html';
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
    }
}
