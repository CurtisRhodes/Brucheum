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
    //alert("staticPage.js");
    includeHTML();

    $('#fileCount').html(staticPageImagesCount);

    resizeStaticPage();
    loadSettings();
    var waiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
           //dots += ". ";
           // $('#dots').html(dots);
        }
        else {
            clearInterval(waiter);
            getBreadCrumbs(staticPageFolderId);
            setOggleHeader(staticPageRootFolderId);
            //alert("setOggleFooter(" + staticPageRootFolderId + ")");

            setOggleFooter(staticPageRootFolderId);
            logPageHit(staticPageFolderId);            
            checkForLink(staticPageFolderId, "babepedia");
            checkForLink(staticPageFolderId, "freeones");
            checkForLink(staticPageFolderId, "black centerfolds");

            //   $('footerMessage').html(staticPageFolderName);
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

//function contextMenuActionShow() {
//    showModelInfoDialog($('#staticPagectxModelName').html(), modelFolderId, selectedImage);
//}
//function contextMenuActionJump() {

//    alert("fullPageName: " + fullPageName);
//    window.open(httpLocation + fullPageName + ".html", "_blank");
//}
//function contextMenuActionComment() {
//    showImageCommentDialog(selectedImage, selectedImageLinkId, staticPageFolderId, staticPageFolderName);
//}
//function contextMenuActionExplode() {
//    //alert("selectedImage: " + selectedImage);
//    window.open(selectedImage, '_blank');
//}

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
        window.location.href = "https://ogglebooble.com/static/" + staticPageRootFolderId + "/" + path.substring(path.lastIndexOf("/") + 1) + ".html";
        $('#staticCatTreeContainer').dialog('close');
    }
    else
        alert("dirTreeClick treeId: " + treeId);
}

//function onLoginClick() {
//    alert("due to a path issue with static pages it's best to login from the home page.");
//    window.location.href = "/";
//    //$('#loginDialog').dialog('open');
//    //if (typeof pause === 'function')
//    //    pause();
//}

//function onRegisterClick() {
//    alert("due to a path issue with static pages it's best to Register from the home page.");
//    window.location.href = "/";
//    //$('#registerUserDialog').fadeIn();
//}

//function logoutSimple() {
//    //alert("logoutSimple");
//    document.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
//    $('#divNotLogedIn').show();
//    $('#divLogedIn').hide();
//}
