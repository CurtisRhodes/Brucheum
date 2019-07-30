var service = "https://api.curtisrhodes.com/";
//var service = "http://localhost:40395/";
var httpLocation = "https://ogglebooble.com/static/";
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
var isPornEditor = false;
var imageArray = new Array();
var selectedImageLinkId;
var selectedImage;
var modelFolderId;
var fullPageName;

$(document).ready(function () {
    var dots = "";
    var waiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
            dots += ". ";
            $('#text55').html(dots);
        }
        else {
            clearInterval(waiter);
            logPageHit();
        }
    }, 300);
    $('#fileCount').html(staticPageImagesCount);
    $('footerMessage').html(staticPageFolderName);

    resizeStaticPage();
});

function resizeStaticPage() {
    resizePage();
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 150);
    if (viewerShowing) {
        resizeViewer();
    }
    //console.log("resize static page");
    //$('#footerMessage').html("8");
}

function imgClick(imageIndex) {
    //alert("imageArray[]: " + imageArray.length + " folderId: " + staticPageFolderId + " folderName: " + staticPageFolderName);
    viewerShowing = true;
    // get image array from DOM
    $('#imageContainer').children().each(function() {
        //alert("LinkId: " + $(this).find("img").attr("id") + "  src: " + $(this).children("img").attr("src"));
        imageArray.push({
            LinkId: $(this).find("img").attr("id"),
            Link: $(this).find("img").attr("src")
        });
    });
    launchViewer(imageArray, imageIndex, staticPageFolderId, staticPageFolderName);
    resizeViewer();
}

function ctxSAP(imgId) {
    event.preventDefault();
    window.event.returnValue = false;
    var thisImageDiv = $('#' + imgId + '');   
    var sstring = thisImageDiv.html();
    selectedImageLinkId = sstring.substr(sstring.lastIndexOf("_") + 1, 36);

    //alert("selectedImageLinkId: " + selectedImageLinkId);

    var picpos = thisImageDiv.offset();
    var picLeft = Math.max(0, picpos.left + thisImageDiv.width() - $('#thumbImageContextMenu').width() - 50);
    $('#thumbImageContextMenu').css("top", picpos.top + 5);
    $('#thumbImageContextMenu').css("left", picLeft);
    $.ajax({
        type: "GET",
        url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + selectedImageLinkId,
        success: function (modelDetails) {
            if (modelDetails.Success === "ok") {
                selectedImage = modelDetails.Link;
                fullPageName = modelDetails.RootFolder + "/" + modelDetails.FolderName;
                modelFolderId = modelDetails.FolderId;
                $('#staticPagectxModelName').html("unknown model");
                if (modelDetails.RootFolder !== "boobs") {
                    $('#staticPagectxModelName').html(modelDetails.FolderName);
                }
                $('#ctxSeeMore').hide();
                if (modelDetails.RootFolder !== staticPageRootFolder) {
                    if (modelDetails.RootFolder !== "boobs") {
                        $('#ctxSeeMore').show();
                    }
                }
            }
            else
                alert("GetModelName: " + modelDetails.Success);
        },
        error: function (xhr) {
            alert("GetModelName xhr error: " + xhr.statusText);
        }
    });
    $('#thumbImageContextMenu').css('z-index', "200");
    $('#thumbImageContextMenu').fadeIn();
}

function contextMenuActionShow() {
    //showModelInfoDialog(modelName, folderId, currentSrc)
    showModelInfoDialog($('#staticPagectxModelName').html(), modelFolderId, selectedImage);
}
function contextMenuActionJump() {
    window.open(httpLocation + fullPageName + ".html", "_blank");
}
function contextMenuActionComment() {
    showImageCommentDialog(selectedImage, selectedImageLinkId, staticPageFolderId, staticPageFolderName);
}
function contextMenuActionExplode() {
    //alert("selectedImage: " + selectedImage);
    window.open(selectedImage, '_blank');
}

function showCustomMessage(blogId) {
    if (typeof pause === 'function') {
        pause();
    }
    $.ajax({
        type: "GET",
        url: service + "api/OggleBlog/?blogId=" + blogId,
        success: function (entry) {
            if (entry.Success === "ok") {
                $('#customMessage').html(entry.CommentText).show();
            }
            else
                alert(entry.Success);
        },
        error: function (xhr) {
            alert("showSiteContent xhr: " + getXHRErrorDetails(xhr));
        }
    });
}

function showCatListDialog(root) {
    buildDirTree($('#staticCatTreeContainer'), "staticCatTreeContainer", root);
    $('#staticCatTreeContainer').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'left top', at: 'left top', of: $('#middleColumn') },
        width: 400,
        height: 600
    });
}
function staticCatTreeContainerClick(path, id, treeId) {
    if (treeId === "staticCatTreeContainer") {
        window.location.href = "https://ogglebooble.com/static/" + staticPageRootFolder + "/" + path.substring(path.lastIndexOf("/") + 1) + ".html";
        $('#staticCatTreeContainer').dialog('close');
    }
    else
        alert("dirTreeClick treeId: " + treeId);
}

function slowlyShowFolderCategoryDialog() {
    setTimeout(function () {
        if (forgetShowingCatDialog === false) {
            pause();
            folderCategoryDialogIsOpen = true;
            showCategoryDialog(carouselArray[imageIndex].FolderId);
        }
    }, 1600);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        folderCategoryDialogIsOpen = false;
        resume();
    });
}
function slowlyShowCatDialog(breadCrumbFolderId) {
    setTimeout(function () {
        if (forgetShowingCatDialog === false)
            showCategoryDialog(breadCrumbFolderId);
    }, 600);
}

function showLoginDialog() {
    $('#loginDialog').dialog('open');
    if (typeof pause === 'function')
        pause();
}

function staticPageShowRegisterDialog() {
    $('#registerUserDialog').fadeIn();
}

function logoutSimple() {
    //alert("logoutSimple");
    document.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    $('#divNotLogedIn').show();
    $('#divLogedIn').hide();
}
