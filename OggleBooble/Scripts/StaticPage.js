var service = "https://api.curtisrhodes.com/";
//var service = "http://localhost:40395/";
var httpLocation = "https://ogglebooble.com/static/";
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
var isPornEditor = false;
var imageArray = new Array();
var selectedImageLinkId;
var selectedImage;
var modelFolderId;
var fullPageName;

$(document).ready(function () {

    var cookie = getCookie("User");

    if (cookie !== "") {
        $('#divNotLogedIn').hide();
        $('#divLogedIn').show();
        $('#helloUser').html("hello: " + cookie);
    }

    logPageHit(cookie);

});

function logPageHit(cookie) {

    if (typeof staticPageFolderName !== "undefined") {

        $('#footerMessage').html("logging page hit");
        $.ajax({
            type: "GET",
            url: service + "api/StaticPage/StaticPageGetIPAddress",
            success: function (ipAddress) {

                if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";

                if (cookie === "")
                    cookie = "unknown";

                var hitCounterModel = {
                    IpAddress: ipAddress,
                    AppName: "static OggleBooble",
                    PageName: staticPageFolderName,
                    Details: cookie
                };

                $.ajax({
                    type: "PUT",
                    url: service + "api/HitCounter/LogPageHit",
                    data: hitCounterModel,
                    success: function (success) {
                        if (success === "ok") {
                            if (!isNullorUndefined(cookie)) {
                                //alert("currentUser: " + cookie);
                                sendEmail(cookie + " just visited " + staticPageFolderName, cookie + " just visited " + staticPageFolderName + " gallery");
                            }
                            else
                                sendEmail(ipAddress + " just visited " + staticPageFolderName, "unknown user just visited " + staticPageFolderName + " gallery");
                        }
                        else
                            alert("logPageHit: " + success);

                        $('#footerMessage').html(staticPageFolderName);
                    },
                    error: function (jqXHR, exception) {
                        alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                    }
                });

            },
            error: function (jqXHR, exception) {
                alert("StaticPageGetIPAddress XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}

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
                modelFolderId = modelDetails.FolderId;
                $('#staticPagectxModelName').html("unknown model");
                if (modelDetails.RootFolder !== "boobs") {
                    $('#staticPagectxModelName').html(modelDetails.FolderName);
                }
                $('#ctxSeeMore').hide();
                if (modelDetails.RootFolder !== staticPageRootFolder) {
                    if (modelDetails.RootFolder !== "boobs") {
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
    showModelInfoDialog($('#staticPagectxModelName').html(), modelFolderId, selectedImage);
}
function contextMenuActionJump() {
    window.open(httpLocation + fullPageName + ".html", "_blank");
}
function contextMenuActionComment() {
    showImageCommentDialog(selectedImage, selectedImageLinkId, staticPageFolderId, staticPageFolderName, staticPageCurrentUser);
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
        window.location.href = "https://ogglebooble.com/static/" + staticPageRootFolder + "/" + path.substring(path.lastIndexOf("/") + 1) + ".html";
        $('#staticCatTreeContainer').dialog('close');
    }
    else
        alert("dirTreeClick treeId: " + treeId);
}

function slowlyShowFolderCategoryDialog() {
    setTimeout(function () {
        if (forgetShowingCatDialog === false) {
            pause();
            folderCategoryDialogIsOpen = true;
            showCategoryDialog(carouselArray[imageIndex].FolderId);
        }
    }, 1600);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        folderCategoryDialogIsOpen = false;
        resume();
    });
}
function slowlyShowCatDialog(breadCrumbFolderId) {
    setTimeout(function () {
        if (forgetShowingCatDialog === false)
            showCategoryDialog(breadCrumbFolderId);
    }, 600);
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

    document.cookie = 'User=' + $('#txtUserName').val() + ';expires=' + expires.toUTCString();
    $('#registerUserDialog').fadeOut();

    // add user to a table


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
}
function logoutSimple() {
    document.cookie = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
}








