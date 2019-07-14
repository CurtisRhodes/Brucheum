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
        position: ({ my: 'left top', at: 'left top', of: $('#middleColumn') }),
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

function staticPageShowRegisterDialog(){
    if (!isNullorUndefined($('#btnLayoutLogin').offset())) {
        var loff = $('#btnLayoutLogin').offset().left;
        $('#btnHeaderLoginSpinner').css("left", loff + 30);
        //$('#btnHeaderLoginSpinner').show();
    }

    $('#modalContent').html($('#registerUserDialog').fadeIn());
    $('#modalContainer').show();
    $('#btnHeaderRegisterSpinner').hide();


    //$('#registerUserDialog').fadein();


    //$.ajax({
    //    type: "get",
    //    url: "/Login/Register",
    //    datatype: "json",
    //    success: function (data) {
    //        $('#modalContent').html(data);
    //        $('#modalContainer').show();
    //        $('#btnHeaderRegisterSpinner').hide();
    //    },
    //    error: function (jqXHR, exception) {
    //        alert("RegisterPopup XHR error: " + getXHRErrorDetails(jqXHR, exception));
    //    }
    //});
}

$('#btnRegister').click(function () {
    if (validate()) {
        try {
            unBind();
            $.ajax({
                type: "POST",
                url: service + "/api/Login/",
                data: user,
                datatype: "json",
                success: function (response) {
                    if (response.success === "ok") {
                        //alert("Log In Success!");
                        clearModal();
                        //var userId = response.UserId;
                        $.ajax({
                            type: "get",
                            url: "/Login/SetOggleBoobleCookie?userName=" + userName + "&userId=" + userId + "&useCookie=true",
                            datatype: "json",
                            success: function (success) {
                                if (success === "ok")
                                    //$("#divlogin").load(location.href + " #divlogin");
                                    location.reload(true);
                                //clearModal();
                                else
                                    alert("SetOggleBoobleCookie error: " + success);
                            },
                            error: function (xhr) {
                                displayStatusMessage("alert-danger", "error: " + xhr.statusText);
                                alert("SetBrucheumCookie  error: " + xhr.statusText);
                            }
                        });
                    }
                    else {
                        alert("Register post: " + response.success);
                        //displayStatusMessage("alert-danger", response, false);
                    }
                },
                error: function () {
                    alert("Login Post failed");
                }
            });
        } catch (e) {
            alert("Login Post error: " + e);
        }
    }
});



