﻿var service = "https://api.curtisrhodes.com/";
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
    let visitorId = getCookieValue("VisitorId");

    let loadSettingsWaiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
            dots += "?. ";
            $('#dots').html(dots);
        }
        else {
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

            clearInterval(loadSettingsWaiter);
            $('#dots').html('');
            resizeStaticPage();
            $(window).resize(resizeStaticPage());
            //logPageHit(staticPageFolderId, "static page");
            logActivity2(visitorId, "PH2", folderId, "log pageHit");  // page hit success
            getBreadCrumbs(staticPageFolderId);
        }
    }, 300);
});

function resizeStaticPage() {
    resizePage();
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 80);
    if (viewerShowing) {
        resizeViewer();
    }
    $('#feedbackBanner').css("top", $('#middleColumn').height() - 150);
}

function xxshowCatListDialog(root) {
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

