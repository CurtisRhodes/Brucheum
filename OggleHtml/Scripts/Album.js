var viewerShowing = false;
var isPornEditor = true;
var folderName;
var currentFolderId;
var selectedImageArchiveFolderId;
var currentContextLinkId;
var imageArray;

function directToStaticPage(folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/AlbumPage/GetStaticPage?folderId=" + folderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.location.href = successModel.ReturnValue;
            }
            else
                alert("directToStaticPage " + successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("directToStaticPage jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function getAlbumPageHeader(folderId) {
    $.ajax({
        type: "PATCH",
        async: false,
        url: settingsArray.ApiServer + "api/AlbumPage/GetRootFolder?folderId=" + folderId,
        success: function (successModel) {
            if (successModel.Success === "ok") {

                //alert("getAlbumImages(" + params.folder + ")");
                //alert("successModel.ReturnValue: " + successModel.ReturnValue);

                getHeader(successModel.ReturnValue);

            }
            else
                alert("getAlbumPageHeader " + successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("getAlbumPageHeader jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function getBreadCrumbs(folderId) {
    // a woman commited suicide when pictures of her "came out"
    // title: I do not remember having been Invited)
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/BreadCrumbs/Get?folderId=" + folderId,
        success: function (breadCrumbModel) {
            if (breadCrumbModel.Success === "ok") {
                $('#breadcrumbContainer').html("");
                for (i = breadCrumbModel.BreadCrumbs.length - 1; i >= 0; i--) {
                    if (breadCrumbModel.BreadCrumbs[i] === null) {
                        breadCrumbModel.Success = "BreadCrumbs[i] == null : " + i;
                    }
                    else {
                        if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder) {
                            $('#breadcrumbContainer').append("<a class='inactiveBreadCrumb' " +
                                //"onmouseover='slowlyShowCatDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + "); forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' >" +
                                "onclick='showCategoryDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + ");' >" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                        else {
                            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' " +
                                "href='/album.html?folder=" + breadCrumbModel.BreadCrumbs[i].FolderId + "'>" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                    }
                }
                //alert("breadCrumbModel.RootFolder: " + breadCrumbModel.RootFolder);
                folderName = breadCrumbModel.FolderName;
                document.title = folderName + ": OggleBooble";
                logPageHit(folderName);
            }
            else
                alert("getBreadCrumbs " + breadCrumbModel.Success);
        },
        error: function (jqXHR, exception) {
            $('#imagePageLoadingGif').hide();
            alert("getBreadCrumbs jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function getAlbumImages(folderId) {
    currentFolderId = folderId;
    try {
        var start = Date.now();
        $('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/ImagePage/GetImageLinks?folderId=" + folderId,
            success: function (imageLinksModel) {
                rootFolder = imageLinksModel.RootFolder;
                if (imageLinksModel.Success === "ok") {
                    processImages(imageLinksModel);
                    getBreadCrumbs(folderId);
                    var delta = (Date.now() - start) / 1000;
                    console.log("/api/ImageFolder/GetLinks?folder=" + folderId + " took: " + delta.toFixed(3));
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    alert("getImageLinks: " + imageLinksModel.Success);
                }
            },
            error: function (jqXHR, exception) {
                $('#imagePageLoadingGif').hide();
                alert("getAlbumImages jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        $('#imagePageLoadingGif').show();
        alert("GetLinkFolders CATCH: " + e);
    }
}

function processImages(imageLinksModel) {

    var imageFrameClass = "folderImageOutterFrame";
    var subDirLabel = "subDirLabel";
    if ((imageLinksModel.RootFolder === "porn") || (imageLinksModel.RootFolder === "sluts")) {
        imageFrameClass = "pornFolderImageOutterFrame";
        subDirLabel = "pornSubDirLabel";
    }
    //  SUBFOLDERS
    $('#imageContainer').html('');
    $.each(imageLinksModel.SubDirs, function (idx, subDir) {
        $('#imageContainer').append("<div class='" + imageFrameClass + "' onclick=window.location.href='/album.html?folder=" + subDir.FolderId + "'>" +
            "<img class='folderImage' src='" + subDir.Link + "'/>" +
            "<div class='" + subDirLabel + "'>" + subDir.DirectoryName + "  (" + subDir.Length + ")</div></div>");
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

        var imageFrameClass = "imageFrame";

        if (isPornEditor) {
            if (imageLinksModel.RootFolder === "archive") {
                if (imageModelFile.LinkCount > 1) {
                    imageFrameClass = "multiLinkImageFrame";
                }
            }
            else {
                if (imageModelFile.LinkCount > 1) {
                    imageFrameClass = "nonLocalImageFrame";
                }
            }
        }

        $('#imageContainer').append("<div class='" + imageFrameClass + "'><img id=" + imageModelFile.LinkId +
            " onclick='startSlideShow(" + fileCount + ",\"" + imageLinksModel.FolderName + "\")' idx=" + fileCount++ + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");

    });

    $('.thumbImage').contextmenu(function () {
        //alert("contextmenu");
        event.preventDefault();
        window.event.returnValue = false;
        currentContextLinkId = $(this).attr("id");
        var thisImage = $('#' + currentContextLinkId + '');
        var picpos = thisImage.offset();
        var picLeft = Math.max(10, picpos.left + thisImage.width() - $('#thumbImageContextMenu').width() - 50);
        $('#thumbImageContextMenu').css("top", picpos.top + 5);
        $('#thumbImageContextMenu').css("left", picLeft);
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/ImageCategoryDetail/GetModelName?linkId=" + currentContextLinkId,
            success: function (modelDetails) {
                if (modelDetails.Success === "ok") {
                    selectedImageArchiveFolderId = modelDetails.FolderId;
                    $('#ctxModelName').html("unknown model");
                    if (modelDetails.RootFolder !== "boobs") {
                        $('#ctxModelName').html(modelDetails.FolderName);
                    }
                    $('#ctxSeeMore').hide();
                    if (modelDetails.RootFolder !== rootFolder) {
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
    });

    $('#fileCount').html(imageLinksModel.Files.length + imageLinksModel.SubDirs.length);
    $('#imagePageLoadingGif').hide();
    resizeImageContainer();
}

function resizeImageContainer() {
    resizePage();
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 50);
    if (viewerShowing) {
        resizeViewer();
    }
}

$(window).resize(function () {
    resizeImageContainer();
});

function startSlideShow(imageIndex, folderName) {
    //alert("galleryImageClick  " + imageIndex + " " + folderName);
    viewerShowing = true;
    launchViewer(imageArray, imageIndex, currentFolderId, folderName);
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
        rejectLinkModel.PreviousLocation = currentFolderId;
        rejectLinkModel.RejectionReason = $('input[name=rdoRejectImageReasons]:checked').val();
        rejectLinkModel.ExternalLink = $('#' + currentContextLinkId + '').attr("src");

        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/FtpImageRemove/MoveReject",
            data: rejectLinkModel,
            success: function (success) {
                $('#removeLinkDialog').dialog('close');
                $('#removeLinkDialog').hide();
                if (success === "ok") {
                    if (viewerShowing)
                        slide("next");
                    getAlbumImages(currentFolderId);
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

function removeImage(currentContextLinkId) {
    //    alert("currentContextLinkId: " + currentContextLinkId);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/FtpImageRemove/CheckLinkCount?imageLinkId=" + currentContextLinkId,
        success: function (success) {
            if (success === "ok") {
                $.ajax({
                    type: "DELETE",
                    url: settingsArray.ApiServer + "api/FtpImageRemove/RemoveImageLink?folderId=" + currentFolderId + "&imageId=" + currentContextLinkId,
                    success: function (success) {
                        if (success === "ok") {
                            if (viewerShowing)
                                slide("next");
                            getAlbumImages(currentFolderId);
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

function contextMenuAction(action) {
    switch (action) {
        case "show":
            $("#thumbImageContextMenu").fadeOut();
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId, $('#' + currentContextLinkId + '').attr("src"));
            $('#modelInfoDialog').on('dialogclose', function (event) {
                $('#modelInfoDialog').hide();
                getAlbumImages(currentFolderId);
            });
            break;
        case "jump":
            window.open("/album.html?folder=" + selectedImageArchiveFolderId, "_blank");
            break;
        case "comment":
            $("#thumbImageContextMenu").fadeOut();
            showImageCommentDialog($('#' + currentContextLinkId + '').attr("src"), currentContextLinkId, currentFolderId, folderName);
            break;
        case "explode":
            window.open($('#' + currentContextLinkId + '').attr("src"), "_blank");
            break;
        case "archive":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", $('#' + currentContextLinkId + '').attr("src"), currentFolderId);
            $('#moveCopyDialog').on('dialogclose', function (event) {
                if (viewerShowing)
                    slide("next");
                getAlbumImages(currentFolderId);
            });
            break;
        case "copy":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", $('#' + currentContextLinkId + '').attr("src"), currentFolderId);
            $('#moveCopyDialog').on('dialogclose', function (event) {
                if (viewerShowing)
                    slide("next");
                getAlbumImages(currentFolderId);
            });
            break;
        case "move":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Move", $('#' + currentContextLinkId + '').attr("src"), currentFolderId);
            $('#moveCopyDialog').on('dialogclose', function (event) {
                if (viewerShowing)
                    slide("next");
                getAlbumImages(currentFolderId);
            });
            break;
        case "remove":
            $("#thumbImageContextMenu").fadeOut();
            removeImage(currentContextLinkId);
            break;
        case "setF":
            setFolderImage(currentContextLinkId, currentFolderId, "folder");
            break;
        case "setC":
            setFolderImage(currentContextLinkId, currentFolderId, "parent");
            break;
        case "showLinks":
            showLinks(currentContextLinkId);
            //showProps($('#' + currentContextLinkId + '').attr("src"));
            break;
        default:
            alert("contextMenuAction action: " + action);
    }

}
