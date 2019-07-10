
var service = "https://api.curtisrhodes.com/";
var imageArray = new Array();
var selectedImageLinkId;
var selectedImage;
var staticPageFolderName;
var fullPageName;

$(document).ready(function () {
    loadImageLinks();
    window.addEventListener("resize", resizeStaticPage);
    resizeStaticPage();
    $('#staticCatTreeContainer').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: ({ my: 'left top', at: 'left top', of: $('#middleColumn') }),
        width: 400,
        height: 600
    });
});

function loadImageLinks() {
    $.ajax({
        type: "GET",
        url: service + "/api/ImagePage/GetImageLinks?folderId=" + staticPageFolderId,
        success: function (imageLinksModel) {
            if (imageLinksModel.Success === "ok") {
                if (imageLinksModel.Success === "ok") {
                    $.each(imageLinksModel.Files, function (idx, imageModelFile) {
                        imageArray.push({
                            Link: imageModelFile.Link.replace(/ /g, "%20"),
                            LinkId: imageModelFile.LinkId
                        });
                    });
                    console.log("YES imageArray[] loaded: " + imageArray.length);
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    alert("getImageLinks: " + imageLinksModel.Success);
                }
            }
            else
                alert("GetImageLinks: " + imageLinksModel.Success);
        },
        error: function (xhr) {
            alert("GetImageLinks xhr error: " + xhr.statusText);
        }
    });
}

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
    launchViewer(imageArray, imageIndex, staticPageFolderId, staticPageFolderName, staticPageCurrentUser);
}

function slowlyShowCatDialog(breadCrumbFolderId) {
    setTimeout(function () {
        if (forgetShowingCatDialog === false)
            showCategoryDialog(breadCrumbFolderId);
    }, 600);
}

function staticPageContextMenu(linkId, link) {
    //alert("staticPageContextMenu: linkId: " + linkId);
    event.preventDefault();
    window.event.returnValue = false;
    selectedImageLinkId = linkId;
    selectedImage = link;
    var thisImage = $('#' + selectedImageLinkId + '');
    var picpos = thisImage.offset();
    var picLeft = Math.max(0, picpos.left + thisImage.width() - $('#thumbImageContextMenu').width() - 50);
    $('#thumbImageContextMenu').css("top", picpos.top + 5);
    $('#thumbImageContextMenu').css("left", picLeft);
    $.ajax({
        type: "GET",
        url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + selectedImageLinkId,
        success: function (modelDetails) {
            if (modelDetails.Success === "ok") {
                fullPageName = modelDetails.RootFolder + "/" + modelDetails.FolderName;
                $('#staticPagectxModelName').html("unknown model");
                if (modelDetails.RootFolder === "archive") {
                    $('#staticPagectxModelName').html(modelDetails.FolderName);
                }
                $('#ctxSeeMore').hide();
                if (modelDetails.RootFolder !== staticPageRootFolder) {
                    if (modelDetails.RootFolder === "archive") {
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
    showModelInfoDialog($('#staticPagectxModelName').html(), staticPageFolderId, selectedImage);
}
function contextMenuActionJump() {
    window.open("http://pages.ogglebooble.com/" + fullPageName + ".html", "_blank");
    ///porn/sluts.html
}
function contextMenuActionComment() {
    showImageCommentDialog(selectedImage, selectedImageLinkId, staticPageFolderId, staticPageFolderName, staticPageCurrentUser);
}
function contextMenuActionExplode() {
    //alert("selectedImage: " + selectedImage);
    window.open(selectedImage, '_blank');
}

function showCatListDialog(root) {
    buildDirTree($('#staticCatTreeContainer'), "staticCatTreeContainer", root);
    $('#staticCatTreeContainer').dialog('open');
}

function staticCatTreeContainerClick(path, id, treeId) {
    if (treeId === "staticCatTreeContainer") {
        window.location.href = path + "html";
        $('#staticCatTreeContainer').dialog('close');
    }
    else
        alert("dirTreeClick treeId: " + treeId);
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
    //if ($('#pornWarning').html() == "")
}



