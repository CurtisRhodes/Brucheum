var service = "https://api.curtisrhodes.com/";
//var service = "http://localhost:40395/";
var httpLocation = "https://ogglebooble.com/static/";
var carouselItemArray = new Array();
var imageIndex = 0;
var carouselContainerHeight;
var CarouselInterval;
var metaTagDialogIsOpen = false;
var modelInfoDialogIsOpen = false;
var imageCommentDialogIsOpen = false;
var folderCategoryDialogIsOpen = false;
var forgetShowingCatDialog;
var isPornEditor = false;
//var imageArray = new Array();
var selectedImageLinkId;
var fullPageName;

$(document).ready(function () {
    //getHeader(staticPageRootFolder);
    $('#fileCount').html(staticPageImagesCount);
    $('footerMessage').html(staticPageFolderName);

    resizeStaticPage();
    var waiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
           //dots += ". ";
           // $('#dots').html(dots);
        }
        else {
            clearInterval(waiter);
            //alert("logPageHit(" + staticPageFolderName + ")");
            logPageHit(staticPageFolderName, "static");
        }
    }, 300);
    $(window).resize(resizeStaticPage());
});

function resizeStaticPage() {
    resizePage();
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 80);
    if (viewerShowing) {
        resizeViewer();
    }
    //console.log("resize static page");
    //$('#footerMessage').html("8");
}

function contextMenuActionShow() {
    showModelInfoDialog($('#staticPagectxModelName').html(), modelFolderId, selectedImage);
}
function contextMenuActionJump() {

    alert("fullPageName: " + fullPageName);
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
        window.location.href = "https://ogglebooble.com/static/" + currentFolderRoot + "/" + path.substring(path.lastIndexOf("/") + 1) + ".html";
        $('#staticCatTreeContainer').dialog('close');
    }
    else
        alert("dirTreeClick treeId: " + treeId);
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
