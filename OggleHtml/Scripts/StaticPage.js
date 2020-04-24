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
    var loadSettingsWaiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
            dots += "?. ";
            $('#dots').html(dots);
        }
        else {
            clearInterval(loadSettingsWaiter);
            $('#dots').html('');
            if (!isNullorUndefined(calledFrom)) {
                var logEventModel = {
                    VisitorId: getCookieValue("VisitorId"),
                    EventCode: "XLC",
                    EventDetail: calledFrom,
                    CalledFrom: staticPageFolderId
                };
                logEventActivity(logEventModel);
            }
            getBreadCrumbs(staticPageFolderId);
            logPageHit(staticPageFolderId, "static page");
            resizeStaticPage();
            $(window).resize(resizeStaticPage());
            $('#feedbackBanner').click(showFeedbackDialog()).fadeIn();
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
    //console.log("resize static page");
    //$('#footerMessage').html("8");
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
