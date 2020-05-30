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

    //setOggleHeader(params.folder, "blank");
    var dots = "";
    loadSettings();
    $('#adminLink').hide();
    var visitorId = getCookieValue("VisitorId");

    var loadSettingsWaiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
            dots += "?. ";
            $('#dots').html(dots);
        }
        else {
            if (isNullorUndefined(visitorId)) {
                if (isNullorUndefined(internalLink)) {
                    if (isNullorUndefined(calledFrom)) {
                        logEventActivity({
                            VisitorId: "knull",
                            EventCode: "XLC",
                            EventDetail: "no visitorId no calledFrom no h",
                            PageId: staticPageFolderId,
                            CalledFrom: "staticPage"
                        });
                    }
                    else {
                        logEventActivity({
                            VisitorId: "knull",
                            EventCode: "XLC",
                            EventDetail: "no visitorId",
                            PageId: staticPageFolderId,
                            CalledFrom: "staticPage"
                        });
                    }
                }
                else {
                    logEventActivity({
                        VisitorId: "knull",
                        EventCode: "AL1",
                        EventDetail: "h but no visitorId",
                        PageId: staticPageFolderId,
                        CalledFrom: "staticPage"
                    });
                }
                callIpServiceFromStaticPage(staticPageFolderId, calledFrom);
            }
            else {  // visitorId ok
                if (isNullorUndefined(internalLink)) {
                    if (isNullorUndefined(calledFrom)) {
                        logEventActivity({
                            VisitorId: "knull",
                            EventCode: "XLC",
                            EventDetail: "no h an no calledFrom. an old Link?",
                            PageId: staticPageFolderId,
                            CalledFrom: "staticPage"
                        });
                    }
                    else {
                        logEventActivity({
                            VisitorId: "knull",
                            EventCode: "XLC",
                            EventDetail: calledFrom,
                            PageId: staticPageFolderId,
                            CalledFrom: "staticPage"
                        });
                    }
                }
                else { 
                    logEventActivity({
                        VisitorId: visitorId,
                        EventCode: "AL1",
                        EventDetail: "perfect h: " + internalLink,
                        CalledFrom: staticPageFolderId
                    });
                }
            }
            clearInterval(loadSettingsWaiter);
            $('#dots').html('');
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
        rtpe("SUB", "static", subFolderPreClickFolderId, subFolderPreClickFolderId);
    else {
        rtpe("SSB", "static", subFolderPreClickFolderId, subFolderPreClickFolderId);
    }
}

