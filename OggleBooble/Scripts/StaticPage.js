var service = "https://api.curtisrhodes.com/";
var rotationSpeed = 5123;
var intervalSpeed = 1100;
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

var imageArray = new Array();
var selectedImageLinkId;
var selectedImage;
var staticPageFolderName;
var fullPageName;

$(document).ready(function () {

    var cookie = getCookie("User");

    if (cookie !== "") {
        alert("cookie: " + cookie);
        $('#divNotLogedIn').hide();
        $('#divLogedIn').show();
        $('#helloUser').html("hello: " + cookie);
    }

    logVisit(cookie);

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
                        if (staticPageRootFolder !== "archive")
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
    showModelInfoDialog($('#staticPagectxModelName').html(), selectedImageArchiveFolderId, selectedImage);
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
        window.location.href = path + "html";
        $('#staticCatTreeContainer').dialog('close');
    }
    else
        alert("dirTreeClick treeId: " + treeId);
}

function logVisit(userName) {
    $('#footerMessage').html("logging visit");
    //alert("ipAddress: " + ipAddress);
    $.ajax({
        type: "POST",
        url: service + "api/HitCounter",
        data: { UserName: userName, IpAddress: "xxx", AppName: "static OggleBooble" },
        //data: visitModel,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                $('#headerMessage').html(successModel.ReturnValue);
            }
            else
                alert(successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("HitCounter/LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
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

function staticPageShowLoginDialog() {

    if (typeof pause === 'function') 
        pause();

    $('#loginDialog').fadeIn();

    //if (!isNullorUndefined($('#btnLayoutLogin').offset())) {
    //    var loff = $('#btnLayoutLogin').offset().left;
    //    $('#btnHeaderLoginSpinner').css("left", loff + 30);
    //    $('#btnHeaderLoginSpinner').show();
    //}
    //$('#modalContent').html($('#loginDialog').fadeIn());
    //$('#modalContainer').show();
    //$('#btnHeaderRegisterSpinner').hide();
}

function postLogin() {

    expires = new Date();
    expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
    document.cookie = 'User=' + userName + ';expires=' + expires.toUTCString();

    $('#registerUserDialog').fadeOut();
}

function getCookie(cname) {
    if (cname === null)
        cname = "User";
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return decodedCookie;
}

function staticPageShowRegisterDialog() {

    $('#registerUserDialog').fadeIn();

    //if (!isNullorUndefined($('#btnLayoutLogin').offset())) {
    //    var loff = $('#btnLayoutLogin').offset().left;
    //    $('#btnHeaderLoginSpinner').css("left", loff + 30);
    //    $('#btnHeaderLoginSpinner').show();
    //}
    //$('#modalContent').html($('#registerUserDialog').fadeIn());
    //$('#modalContainer').show();
    //$('#btnHeaderRegisterSpinner').hide();
}



















