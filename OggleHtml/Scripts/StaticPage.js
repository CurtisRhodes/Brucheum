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
var selectedImageLinkId;
var fullPageName;

$(document).ready(function () {
    //alert("staticPage.js");
    includeHTML();
    //$('#fileCount').html(staticPageImagesCount);
    params = getParams();
    var calledFrom = params.calledFrom;
    //setOggleHeader(params.folder, "blank");
    var dots = "";
    loadSettings();

    $('#adminLink').hide();

    var loadSettingsWaiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
            dots += "?. ";
            $('#dots').html(dots);
        }
        else {
            clearInterval(loadSettingsWaiter);
            $('#dots').html('');

            if (!isNullorUndefined(calledFrom)) {
                var visitorId = getCookieValue("VisitorId");
                if (isNullorUndefined(visitorId)) {
                    addVisitor(staticPageFolderId, "static");
                    visitorId = "new visitor";
                }
                logEventActivity({
                    VisitorId: visitorId,
                    EventCode: "XLC",
                    EventDetail: calledFrom,
                    CalledFrom: staticPageFolderId
                });
            }
            else {
                logEventActivity({
                    VisitorId: visitorId,
                    EventCode: "AL1",
                    EventDetail: calledFrom,
                    CalledFrom: staticPageFolderId
                });
             }
            resizeStaticPage();
            $(window).resize(resizeStaticPage());
            logPageHit(staticPageFolderId, "static page");
            getBreadCrumbs(staticPageFolderId);
        }
    }, 300);
});

//function getBreadCrumbs(staticPageFolderId) {
//    setOggleFooter(staticPageFolderId, currentFolderRoot);
//}

function resizeStaticPage() {
    resizePage();
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 80);
    if (viewerShowing) {
        resizeViewer();
    }
    $('#feedbackBanner').css("top", $('#middleColumn').height() - 150);
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

function subFolderPreClick(isStepChild, subFolderPreClickFolderId) {
    if (isStepChild === "0")
        rtpe("SUB", albumFolderId, subFolderPreClickFolderId);
    else {
        rtpe("SSB", albumFolderId, subFolderPreClickFolderId);
    }
}

function showEitherModelorFolderInfoDialog(index, folderName, showEitherModelorFolderInfoDialogFolderId, parentId, rootFolder) {
    //alert("showEitherModelorFolderInfoDialog(index: " + index + ", folderName: " + folderName + ", folderId: " + folderId + ", parentId: " + parentId + ", rootFolder: " + rootFolder + ")");
    var cybergirls = "3796";
    if (rootFolder === "playboy" && index > 4 || parentId === cybergirls || rootFolder === "archive" && index > 2) {
        rtpe("CMX", showEitherModelorFolderInfoDialogFolderId, folderName);
    }
    else {
        showCategoryDialog(showEitherModelorFolderInfoDialogFolderId);
    }
}
