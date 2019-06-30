
var service = "https://api.curtisrhodes.com/";
var imageArray = new Array();
var staticPageLinkId;
var staticPageLink;

$(document).ready(function () {
    doubleLoad();

    window.addEventListener("resize", resizeStaticPage);
    resizeStaticPage();
});

function doubleLoad() {
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
                    $('#getImagesLoadingGif').hide();
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
    console.log("resize static page");
    $('#footerMessage').html("8");
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
    staticPageLinkId = linkId;
    staticPageLink = link;
    var thisImage = $('#' + staticPageLinkId + '');
    var picpos = thisImage.offset();
    var picLeft = picpos.left + thisImage.width() - $('#thumbImageContextMenu').width() - 50;
    $('#thumbImageContextMenu').css("top", picpos.top + 5);
    $('#thumbImageContextMenu').css("left", picLeft);
    $.ajax({
        type: "GET",
        url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + staticPageLinkId,
        success: function (folderDetails) {
            if (folderDetails.Success === "ok") {
                selectedImageArchiveFolderId = folderDetails.FolderId;
                if (folderDetails.RootFolder === "archive") {
                    $('#staticPagectxModelName').html(folderDetails.FolderName);
                    $('#ctxSeeMore').show();
                    $('#ctxArchive').hide();
                }
                else {
                    $('#staticPagectxModelName').html("unknown model");
                    $('#ctxSeeMore').hide();
                    $('#ctxArchive').hide();
                }
            }
            else
                alert("GetModelName: " + folderDetails.Success);
        },
        error: function (xhr) {
            alert("GetModelName xhr error: " + xhr.statusText);
        }
    });
    $('#thumbImageContextMenu').css('z-index', "200");
    $('#thumbImageContextMenu').fadeIn();
}

    function contextMenuActionShow() {
        alert("contextMenuActionShow");
    }

function contextMenuActionJump() {
    alert("Jump");
}
function contextMenuActionComment() {
    
    showImageCommentDialog(staticPageLink, staticPageLinkId, staticPageFolderId, staticPageFolderName, staticPageCurrentUser);

}



function contextMenuActionExplode() {
    alert("Explode");
}
