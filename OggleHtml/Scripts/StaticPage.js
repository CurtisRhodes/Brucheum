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
    var internalLink = params.h;

    var visitorId = getCookieValue("VisitorId");
    //if (isNullorUndefined(calledFrom)) {
    //    logError({
    //        VisitorId: visitorId,
    //        ActivityCode: "APF",
    //        Severity: 700,
    //        ErrorMessage: "params.folder undefined",
    //        CalledFrom: "Static Page"
    //    });
    //    window.location.href = "/Index.html";
    //}
        
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
            verifyConnection();
            var verifyConnectionWaiter = setInterval(function () {
                if (connectionVerified) {
                    clearInterval(verifyConnectionWaiter);

                    if (isNullorUndefined(visitorId)) {
                        if (!isNullorUndefined(internalLink)) {
                            logEventActivity({
                                VisitorId: "knull",
                                EventCode: "IS1",
                                EventDetail: "h but no visitorId",
                                PageId: staticPageFolderId,
                                CalledFrom: "staticPage"
                            });
                        }
                        if (isNullorUndefined(calledFrom)) {
                            calledFrom = "an old link?";
                        }
                        callIpServiceFromStaticPage(staticPageFolderId, calledFrom, "Static");                        
                    }
                    else {  // visitorId ok
                        if (isNullorUndefined(internalLink)) {
                            if (isNullorUndefined(calledFrom)) {
                                logEventActivity({
                                    VisitorId: visitorId,
                                    EventCode: "XL1",
                                    EventDetail: "an old Link?",
                                    PageId: staticPageFolderId,
                                    CalledFrom: "staticPage"
                                });
                            }
                            else {
                                logEventActivity({
                                    VisitorId: visitorId,
                                    EventCode: "XLC",
                                    EventDetail: "perfect. visitorId identified",
                                    PageId: staticPageFolderId,
                                    CalledFrom: calledFrom
                                });
                            }
                        }
                        else {
                            logEventActivity({
                                VisitorId: visitorId,
                                EventCode: "ISC",
                                EventDetail: "perfect h: " + internalLink,
                                PageId: staticPageFolderId,
                                CalledFrom: "staticPage"
                            });
                        }
                    }

                    logPageHit(staticPageFolderId, "static page");
                    getBreadCrumbs(staticPageFolderId);
                }
                else {
                    verifyConnection();
                    dots += "?. ";
                    $('#dots').html(dots);
                }
            }, 300);
        }
    }, 300);
    resizeStaticPage();
    $(window).resize(resizeStaticPage());
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
        rtpe("SUB", "static", subFolderPreClickFolderId, subFolderPreClickFolderId);
    else {
        rtpe("SSB", "static", subFolderPreClickFolderId, subFolderPreClickFolderId);
    }
}

function showEitherModelorFolderInfoDialog(index, folderName, folderId, parentId, rootFolder) {
    //alert("showEitherModelorFolderInfoDialog(index: " + index + ", folderName: " + folderName + ", folderId: " + folderId + ", parentId: " + parentId + ", rootFolder: " + rootFolder + ")");
    if (rootFolder === "centerfold" || rootFolder === "cybergirl" || rootFolder === "archive" && index > 2) {
        //if (rootFolder === "playboy" && index > 4 || parentId === cybergirls || rootFolder === "archive" && index > 2) {
        rtpe("CMX", folderId, folderName, folderId);
    }
    else {
        showCategoryDialog(folderId);
    }
}
