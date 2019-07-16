var selectedImageArchiveFolderId;
var currentContextLinkId;
var forgetShowingCatDialog;
var page = 0;
var rootFolder = "";
var mySubDirs = new Array();
var thumbImageHeight = 200;
var viewerShowing = false;

function getBreadCrumbs() {
    $.ajax({
        type: "GET",
        url: service + "/api/BreadCrumbs/Get?folderId=" + folderId,
        success: function (breadCrumbModel) {
            if (breadCrumbModel.Success === "ok") {
                $('#breadcrumbContainer').html("");
                for (i = breadCrumbModel.BreadCrumbs.length - 1; i >= 0; i--) {
                    if (breadCrumbModel.BreadCrumbs[i] === null) {
                        breadCrumbModel.Success = "BreadCrumbs[i] == null : " + i;
                    }
                    else {
                        // title: I do not remember having been Invited)
                        if (breadCrumbModel.BreadCrumbs[i].IsInitialFolder) {
                            $('#breadcrumbContainer').append("<a class='inactiveBreadCrumb' " +
                                "onmouseover='slowlyShowCatDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + "); forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' >" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                        else {
                            // a woman commited suicide when pictures of her "came out"
                            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' " +
                                //"onmouseover='slowlyShowCatDialog(" + breadCrumbModel.BreadCrumbs[i].FolderId + ");" +
                                //"forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' " +
                                //" onclick='forgetShowingCatDialog=true;' href='/ImagePage?folder=" +
                                "href='ImagePage?folder=" + breadCrumbModel.BreadCrumbs[i].FolderId + "'>" +
                                breadCrumbModel.BreadCrumbs[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
                        }
                    }
                }
                //alert("breadCrumbModel.RootFolder: " + breadCrumbModel.RootFolder);
                setLayout(breadCrumbModel.RootFolder);
                document.title = breadCrumbModel.FolderName + " OggleBooble";
                folderName = breadCrumbModel.FolderName;

                if (ipAddress !== "68.203.90.183") {
                    if (ipAddress !== "50.62.160.105") {
                        //alert("ipAddress: " + ipAddress);
                        logPageHit();
                    }
                }
                buildDirTree($('#moveDialogDirTree'), "moveDialogDirTree", 0);

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

function logPageHit() {

    if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    
    var hitCounterModel = {
        IpAddress: ipAddress,
        AppName: "OggleBooble",
        PageName: folderName,
        Details: currentUser
    };

    $.ajax({
        type: "PUT",
        url: service + "api/HitCounter/LogPageHit",
        data: hitCounterModel,
        success: function (success) {
            if (success === "ok") {
                if (!isNullorUndefined(currentUser)) {
                    alert("currentUser: " + currentUser);
                    sendEmail(currentUser + " just visited " + folderName, currentUser + " just visited " + folderName + " gallery");
                }
                else
                    sendEmail(ipAddress + " just visited " + folderName, "unknown user just visited " + folderName + " gallery");
            }
            else
                alert("logPageHit: " + success);
        },
        error: function (jqXHR, exception) {
            alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
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
        $('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/ImagePage/GetAllImageLinks?topFolderId=" + folderId+"&showAll=true",
            success: function (imageModel) {
                processImages(imageModel, start);
            },
            error: function (jqXHR, exception) {
                $('#imagePageLoadingGif').hide();
                alert("showAllChildren jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        $('#imagePageLoadingGif').hide();
        alert("showAllChildren CATCH: " + e);
    }
}

function getImageLinks() {
    try {
        var start = Date.now();
        $('#imagePageLoadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/ImagePage/GetImageLinks?folderId=" + folderId,
            success: function (imageLinksModel) {
                if (imageLinksModel.Success === "ok") {
                    rootFolder = imageLinksModel.RootFolder;
                    if (imageLinksModel.Success === "ok") {
                        processImages(imageLinksModel, start);
                        $('#imagePageLoadingGif').hide();
                    }
                    else {
                        $('#imagePageLoadingGif').hide();
                        alert("getImageLinks: " + imageLinksModel.Success);
                    }
                }
                else
                    alert("getImageLinks: " + imageLinksModel.Success);
            },
            error: function (jqXHR, exception) {
                $('#imagePageLoadingGif').hide();
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
        $('#imageContainer').append("<div class='folderImageOutterFrame'><div class='folderImageFrame' onclick=window.location.href='ImagePage?folder=" + subDir.FolderId + "'>" +
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
            " onclick='galleryImageClick(" + fileCount + ",\"" + imageLinksModel.FolderName + "\")' idx=" + fileCount++ + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
    });

    $('.thumbImage').contextmenu(function () {
        //alert("contextmenu");
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

    var delta = (Date.now() - start) / 1000;
    console.log("/api/ImageFolder/GetLinks?folder=" + folderId + " took: " + delta.toFixed(3));
    $('#fileCount').html(imageLinksModel.Files.length + imageLinksModel.SubDirs.length);
    $('#getImagesLoadingGif').hide();

}

function galleryImageClick(imageIndex, folderName) {
    //alert("galleryImageClick  " + imageIndex + " " + folderName);
    viewerShowing = true;
    launchViewer(imageArray, imageIndex, folderId, folderName, currentUser);
}

function contextMenuAction(action) {
    switch (action) {
        case "show":
            $("#thumbImageContextMenu").fadeOut();
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId, $('#' + currentContextLinkId + '').attr("src"));
            $('#modelInfoDialog').on('dialogclose', function (event) {
                $('#modelInfoDialog').hide();
                getImageLinks();
            });
            break;
        case "jump":
            window.open("/home/ImagePage?folder=" + selectedImageArchiveFolderId, "_blank");
            break;
        case "comment":
            $("#thumbImageContextMenu").fadeOut();
            showImageCommentDialog($('#' + currentContextLinkId + '').attr("src"), currentContextLinkId, folderId, folderName, currentUser);
            break;
        case "explode":
            window.open($('#' + currentContextLinkId + '').attr("src"), "_blank");
            break;
        case "archive":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Archive", $('#' + currentContextLinkId + '').attr("src"), folderId);
            $('#moveCopyDialog').on('dialogclose', function (event) {
                if (viewerShowing)
                    slide("next");
                getImageLinks();
            });
            break;
        case "copy":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Copy", $('#' + currentContextLinkId + '').attr("src"), folderId);
            $('#moveCopyDialog').on('dialogclose', function (event) {
                if (viewerShowing)
                    slide("next");
                getImageLinks();
            });
            break;
        case "move":
            $("#thumbImageContextMenu").fadeOut();
            showMoveCopyDialog("Move", $('#' + currentContextLinkId + '').attr("src"), folderId);
            $('#moveCopyDialog').on('dialogclose', function (event) {
                if (viewerShowing)
                    slide("next");
                getImageLinks();
            });
            break;
        case "remove":
            $("#thumbImageContextMenu").fadeOut();
            removeImage(currentContextLinkId);
            break;
        case "setF":
            setFolderImage(currentContextLinkId, folderId, "folder");
            break;
        case "setC":
            setFolderImage(currentContextLinkId, folderId, "parent");
            break;
        case "showLinks":
            showLinks();
            //showProps($('#' + currentContextLinkId + '').attr("src"));
            break;
        default:
            alert("contextMenuAction action: " + action);
    }
}

function showLinks() {
    $.ajax({
        type: "PATCH",
        url: service + "api/ImagePage?linkId=" + currentContextLinkId,
        success: function (linksModel) {
            if (linksModel.Success === "ok") {
                $('#linkInfo').show();
                $('#linkInfoContainer').html("");
                $.each(linksModel.Links, function (idx, obj) {
                    $('#linkInfoContainer').append("<div id='" + obj.FolderId + "' class='linkInfoItem' onclick='openLink(\"" + obj.FolderId + "\")'>" + obj.PathName + "</div>");
                });
            }
            else
                alert("showLinks: " + linksModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("showLinks error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function openLink(folderId) {
    window.open("/home/ImagePage?folder=" + folderId, "_blank");
}

function showProps(fileName) {

    //var ftpFile = fileName.replace("http://", "ftp://50.62.160.105/");
    //$('#divTestBox').html("");
    //$('' + ftpFile + '').each(function () {
    //    $.each(this.attributes, function () {
    //        if (this.specified) {
    //            console.log(this.name, this.value);
    //            $('#divTestBox').append("div>" + this.name + ": " + this.value + "</div>");
    //        }
    //    });
    //    $('#divTestBox').show();
    //});

}

function setFolderImage(linkId, folderId, level){
    $.ajax({
        type: "PUT",
        url: service + "/api/ImageCategoryDetail/?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
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

function removeImage(currentContextLinkId) {
    //    alert("currentContextLinkId: " + currentContextLinkId);
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

$(window).resize(function () {
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 150);
    if (viewerShowing) {
        resizeViewer();
        $('#footerMessage').html("image page resize");
    }
});
