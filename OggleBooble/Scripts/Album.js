var selectedImageArchiveFolderId;
var currentContextLinkId;
var forgetShowingCatDialog;
var page = 0;
var rootFolder = "";
var mySubDirs = new Array();
var thumbImageHeight = 200;
var viewerShowing = false;
var slideShow;

function getBreadCrumbs() {
    $.ajax({
        type: "GET",
        url: service + "api/DashBoard/GetBreadCrumbs?folderId=" + folderId,
        success: function (breadCrumbModel) {
            if (breadCrumbModel.Success === "ok") {
                $('#headerMessage').html("");
                for (i = breadCrumbModel.BreadCrumbs.length - 1; i >= 0; i--) {
                    if (breadCrumbModel.BreadCrumbs[i] === null) {
                        breadCrumbModel.Success = "BreadCrumbs[i] == null : " + i;
                    }
                    else {
                        // title: I do not remember having been Invited)
                        if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder) {
                            $('#headerMessage').append("<a class='inactiveBreadCrumb' " +
                                "onmouseover='slowlyShowCatDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + "); forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' >" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                        else {
                            // a woman commited suicide when pictures of her "came out"
                            $('#headerMessage').append("<a class='activeBreadCrumb' " +
                                //"onmouseover='slowlyShowCatDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + ");" +
                                //"forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' " +
                                //" onclick='forgetShowingCatDialog=true;' href='/album?folder=" +
                                "href='/album?folder=" + breadCrumbModel.BreadCrumbs[i].FolderId + "'>" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                    }
                }
                //alert("breadCrumbModel.RootFolder: " + breadCrumbModel.RootFolder);
                setLayout(breadCrumbModel.RootFolder);
                document.title = breadCrumbModel.FolderName + " OggleBooble";
                folderName = breadCrumbModel.FolderName;
            }
            else
                alert("getBreadCrumbs " + breadCrumbModel.Success);
        },
        error: function (jqXHR, exception) {
            $('#getImagesLoadingGif').hide();
            alert("getBreadCrumbs jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function slowlyShowCatDialog(breadCrumbFolderId) {
    setTimeout(function () {
        if (forgetShowingCatDialog === false)
            showCategoryDialog(breadCrumbFolderId);
    }, 600);
}

function showAllChildren() {
    try {
        var start = Date.now();
        $('#getImagesLoadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/ImagePage/GetAllImageLinks?topFolderId=" + folderId+"&showAll=true",
            success: function (imageModel) {
                processImages(imageModel, start);
            },
            error: function (jqXHR, exception) {
                $('#getImagesLoadingGif').hide();
                alert("showAllChildren jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        $('#getImagesLoadingGif').hide();
        alert("showAllChildren CATCH: " + e);
    }
}

function getImageLinks() {
    try {
        var start = Date.now();
        $('#getImagesLoadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/ImagePage/GetImageLinks?folderId=" + folderId,
            success: function (imageLinksModel) {
                if (imageLinksModel.Success === "ok") {
                    rootFolder = imageLinksModel.Origin;
                    if (imageLinksModel.Success === "ok") {
                        processImages(imageLinksModel, start);
                        $('#getImagesLoadingGif').hide();
                    }
                    else {
                        $('#getImagesLoadingGif').hide();
                        alert("getImageLinks: " + imageLinksModel.Success);
                    }
                }
                else
                    alert("getImageLinks: " + imageLinksModel.Success);
            },
            error: function (jqXHR, exception) {
                $('#getImagesLoadingGif').hide();
                alert("getImageLinks jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        $('#getImagesLoadingGif').hide();
        alert("GetLinkFolders CATCH: " + e);
    }
}

function processImages(imageLinksModel, start) {

    //  SUBFOLDERS
    $('#imageContainer').html('');
    $.each(imageLinksModel.SubDirs, function (idx, subDir) {
        $('#imageContainer').append("<div class='folderImageOutterFrame'><div class='folderImageFrame' onclick=window.location.href='album?folder=" + subDir.FolderId + "'>" +
            "<img class='folderImage' src='" + subDir.Link + "'/>" +
            "<div class='folderImageFrameName'>" + subDir.DirectoryName + "  (" + subDir.Length + ")</div></div></div>");
    });

    // IMAGES 
    imageArray = new Array();
    var fileCount = 0;
    $.each(imageLinksModel.Files, function (idx, imageModelFile) {
        // add files to array
        imageArray.push({
            Link: imageModelFile.Link.replace(/ /g, "%20"),
            LinkId: imageModelFile.LinkId,
            Local: imageModelFile.LinkCount === 1
        });

        if (isPornEditor) {
            if (imageLinksModel.Origin === "archive") {
                if (imageModelFile.LinkCount === 1) {
                    $('#imageContainer').append("<div class='imageFrame'><img id=" + imageModelFile.LinkId +
                        " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
                }
                else {
                    $('#imageContainer').append("<div class='multiLinkImageFrame'><img id=" + imageModelFile.LinkId +
                        " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
                }
            }
            else {
                if (imageModelFile.LinkCount > 1) {
                    $('#imageContainer').append("<div class='nonLocalImageFrame'><img id=" + imageModelFile.LinkId +
                        " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
                }
                else {
                    $('#imageContainer').append("<div class='imageFrame'><img id=" + imageModelFile.LinkId +
                        " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
                }
            }
        }
        else {
            $('#imageContainer').append("<div class='imageFrame'><img id=" + imageModelFile.LinkId +
                " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
        }

        $('#footerMessage').html("fileCount: " + fileCount++);

        $('.thumbImage').click(function () {
            viewerShowing = true;
            LaunchViewer(imageArray, $(this).attr("idx"), folderId, currentUser);
        });

        $('.thumbImage').contextmenu(function () {
            event.preventDefault();
            window.event.returnValue = false;
            currentContextLinkId = $(this).attr("id");
            var thisImage = $('#' + currentContextLinkId + '');
            var picpos = thisImage.offset();
            var picLeft = picpos.left + thisImage.width() - $('#thumbImageContextMenu').width() - 50;
            $('#thumbImageContextMenu').css("top", picpos.top + 5);
            $('#thumbImageContextMenu').css("left", picLeft);

            $.ajax({
                type: "GET",
                url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + currentContextLinkId,
                success: function (folderDetails) {
                    if (folderDetails.Success === "ok") {
                        if (folderDetails.RootFolder === "archive") {
                            selectedImageArchiveFolderId = folderDetails.FolderId;
                            $('#ctxModelName').html(folderDetails.FolderName);
                            $('#ctxArchive').hide();
                            $('#ctxSeeMore').show();
                        }
                        else {
                            selectedImageArchiveFolderId = 0;
                            $('#ctxModelName').html("unknown model");
                            $('#ctxArchive').show();
                            $('#ctxSeeMore').hide();
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
        });
    });

    var delta = (Date.now() - start) / 1000;
    console.log("/api/ImageFolder/GetLinks?folder=" + folderId + " took: " + delta.toFixed(3));
    $('#fileCount').html(imageLinksModel.Files.length + imageLinksModel.SubDirs.length);
    $('#getImagesLoadingGif').hide();

    //if (document.domain !== 'localhost') {
    //if (ipAddress !== "68.203.92.166") {
    //var emailSubject = currentUser + " just viewed " + folderId;
    //sendEmailFromJS(emailSubject, "someday it will be someone other than " + ipAddress);
    //}
}

function contextMenuAction(action) {
    switch (action) {
        case "show":
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId);
            break;
        case "jump":
            window.open("/album?folder=" + selectedImageArchiveFolderId, "_blank");
            break;
        case "comment":
            showImageCommentDialog($('#' + currentContextLinkId + '').attr("src"), currentContextLinkId, folderId, folderName, currentUser);
            break;
        case "explode":
            window.open($('#' + currentContextLinkId + '').attr("src"), "_blank");
            break;
        case "archive":
            showMoveCopyDialog("Archive", $('#' + currentContextLinkId + '').attr("src"), folderId);
            break;
        case "copy":
            showMoveCopyDialog("Copy", $('#' + currentContextLinkId + '').attr("src"), folderId);
            break;
        case "move":
            showMoveCopyDialog("Move", $('#' + currentContextLinkId + '').attr("src"), folderId);
            break;
        case "remove":
            removeImage();
            break;
        case "setF":
            setFolderImage(currentContextLinkId, folderId, "folder");
            break;
        case "setC":
            setFolderImage(currentContextLinkId, folderId, "parent");
            break;
        default:
            alert(action);
    }
}

$('#moveCopyDialog').on('dialogclose', function (event) {
    if (viewerShowing)
        slide("next");
    getImageLinks();
});
$('#modelInfoDialog').on('dialogclose', function (event) {
    if (viewerShowing)
        slide("next");
    getImageLinks();
});

function setFolderImage(linkId, folderId, level){
    $.ajax({
        type: "PUT",
        url: service + "/api/CategoryFolder/?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", level + " image set");
                $('#thumbImageContextMenu').fadeOut();
                if (viewerShowing)
                    slide("next");
            }
            else {
                alert("setFolderImage: " + success);
            }
        },
        error: function (xhr) {
            alert("setFolderImage xhr error: " + xhr.statusText);
        }
    });
}

function removeImage() {
    $.ajax({
        type: "GET",
        url: service + "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + currentContextLinkId,
        success: function (success) {
            if (success === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: service + "api/FtpImageRemove/RemoveImageLink?folderId=" + folderId + "&imageId=" + currentContextLinkId,
                    success: function (success) {
                        if (success === "ok") {
                            if (viewerShowing)
                                slide("next");
                            getImageLinks();
                        }
                        else
                            alert("removeLink: " + success);
                    },
                    error: function (xhr) {
                        alert("delete xhr error: " + xhr.statusText);
                    }
                });
            }
            else {
                if (success === "only link")
                    showDeleteDialog();
                else
                    alert(success);
            }
        },
        error: function (xhr) {
            alert("delete xhr error: " + xhr.statusText);
        }
    });
}

function showDeleteDialog() {
    $('#removeLinkDialog').show();
    $('#removeLinkDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "300"
    });
}

function onRemoveImageClick(btn) {
    if (btn === "ok") {
        var rejectLinkModel = {};
        rejectLinkModel.Id = currentContextLinkId;
        rejectLinkModel.PreviousLocation = folderId;
        rejectLinkModel.RejectionReason = $('input[name=rdoRejectImageReasons]:checked').val();
        rejectLinkModel.ExternalLink = $('#' + currentContextLinkId + '').attr("src");

        $.ajax({
            type: "PUT",
            url: service + "/api/FtpImageRemove/MoveReject",
            data: rejectLinkModel,
            success: function (success) {
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getImageLinks();
                }
                else
                    alert("removeLink: " + success);
            },
            error: function (xhr) {
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
                alert("delete xhr error: " + xhr.statusText);
            }
        });
    }
    else {
        $('#removeLinkDialog').dialog('close');
        $('#removeLinkDialog').hide();
    }
}

function openImageInNewWindow() {
    window.open($('#' + currentContextLinkId + '').attr("src"), "_blank");
}

function addComment() {
    /// show a blog data entry 
    /// show a comment tree with way to say something.
    /// write an entire fantasy 
    /// describe the fantasy this image evokes
}

$(window).resize(function () {
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 150);
    if (viewerShowing) {
        resizeViewer();
        $('#footerMessage').html("image page resize");
    }
});
