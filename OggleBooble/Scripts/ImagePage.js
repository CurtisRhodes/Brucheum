var folderDetailsid;

$(window).resize(function () {


    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 150);
});

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
            success: function (imageModel) {  
                rootFolder = imageModel.Origin;
                if (imageModel.Success === "ok") {
                    processImages(imageModel, start);
                }
                else {
                    $('#get ImagesLoadingGif').hide();
                    alert("getImageLinks: " + imageModel.Success);
                }
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

function processImages(imageModel, start) {
    var delta = (Date.now() - start) / 1000;
    console.log("/api/ImageFolder/GetLinks?folder=" + folderId + " took: " + delta.toFixed(3));
    // add folders to html view
    $('#imageContainer').html('');
    $.each(imageModel.SubDirs, function (idx, subDir) {
        $('#imageContainer').append("<div id='" + subDir.CategoryId + "' class='folderFirsty'><img class='thumbImage' src='" +
            subDir.FirstImage + "'/><div class='fname'>" + subDir.DirectoryName + "  (" + subDir.Length + ")</div></div>");
    });
    $('.folderFirsty').click(function () {
        window.location.href = "imagePage?folder=" + $(this).attr("id");
    });

    // add files
    imageArray = new Array();
    $('#slideShowLink').show();
    var fileCount = 0;
    $.each(imageModel.Files, function (idx, imageModelFile) {
        $('#footerMessage').html("fileCount: " + fileCount);
        if (imageModel.Origin === "archive") {
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
        fileCount++;

        imageArray.push({
            Link: imageModelFile.Link.replace(/ /g, "%20"),
            LinkId: imageModelFile.LinkId,
            Local: imageModelFile.LinkCount === 1
        });
    });


    $('.thumbImage').click(function () {
        //alert("id: " + $(this).attr("id"));
        showViewer($(this).attr("id"));
    });

    $('.thumbImage').contextmenu(function () {
        //alert("id: " + $(this).attr("id"));
        event.preventDefault();
        window.event.returnValue = false;
        showContextMenu();
        var imageLinkId = $(this).attr("id")
        var thisImage = $('#' + imageLinkId + '');
        if (viewerShowing) {
            $('#thumbImageContextMenu').css("top", event.clientY + 5);
            $('#thumbImageContextMenu').css("left", event.clientX);
        }
        else {
            var picpos = thisImage.offset();
            var picLeft = picpos.left + thisImage.width() - $('#thumbImageContextMenu').width() - 50;
            $('#thumbImageContextMenu').css("top", picpos.top + 5);
            $('#thumbImageContextMenu').css("left", picLeft);
        }
        $.ajax({
            type: "GET",
            url: service + "api/FolderDetail/GetModelName?linkId=" + imageLinkId,
            success: function (folderDetails) {
                if (folderDetails.Success === "ok") {
                    if (folderDetails.FolderId == folderId) {
                        $('#ctxModelName').html("unknown model");
                        $('#ctxSeeMore').hide();
                    }
                    else {
                        //alert("folderDetails.FolderId: " + folderDetails.FolderId + "  folderId: " + folderId);
                        folderDetailsid = folderDetails.FolderId;
                        $('#ctxModelName').html(folderDetails.FolderName);
                        if (rootFolder === "archive")
                            $('#ctxSeeMore').hide();
                        else
                            $('#ctxSeeMore').show();
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

    fileCount += imageModel.SubDirs.length;
    $('#fileCount').html(fileCount);
    $('#getImagesLoadingGif').hide();
    if (document.domain !== 'localhost') {
        //if (ipAddress !== "68.203.92.166") {
        var emailSubject = currentUser + " just viewed " + folderId;
        sendEmailFromJS(emailSubject, "someday it will be someone other than " + ipAddress);
    }
}


function contextMenuAction(action) {
    switch (action) {
        case "show":
            if (viewerShowing)
                showModelInfoDialog(imageArray[imageArrayIndex].LinkId, folderId);
            else
                showModelInfoDialog(folderId);
            break;
        case "jump":
            window.open("/home/ImagePage?folder=" + folderDetailsid, "_blank");
            break;
        case "comment":
            if (viewerShowing)
                showImageCommentDialog(imageArray[imageArrayIndex].Link, imageArray[imageArrayIndex].LinkId, folderId, folderName);
            else
                showImageCommentDialog($('#' + currentContextImageId + '').attr("src"), currentContextImageId, folderId, folderName);
            break;
        case "explode":
            if (viewerShowing)
                window.open(imageArray[imageArrayIndex].Link, "_blank");
            else
                window.open($('#' + currentContextImageId + '').attr("src"), "_blank");
            break;
        case "archive":
            if (viewerShowing)
                showMoveCopyDialog("Archive", imageArray[imageArrayIndex].Link, folderId, $('#' + currentContextImageId + '').attr("src"));
            else
                showMoveCopyDialog("Archive", $('#' + currentContextImageId + '').attr("src"), folderId, $('#' + currentContextImageId + '').attr("src"));
            break;
        case "copy":
            if (viewerShowing)
                showMoveCopyDialog("Copy", imageArray[imageArrayIndex].LinkId, folderId, $('#' + currentContextImageId + '').attr("src"));
            else
                showMoveCopyDialog("Copy", currentContextImageId, folderId, $('#' + currentContextImageId + '').attr("src"));
            break;
        case "move":
            if (viewerShowing)
                showMoveCopyDialog("Move", imageArray[imageArrayIndex].Link, folderId, $('#' + currentContextImageId + '').attr("src"));
            else
                showMoveCopyDialog("Move", $('#' + currentContextImageId + '').attr("src"), folderId, $('#' + currentContextImageId + '').attr("src"));
            break;
        case "remove":
            if (confirm("remove this link"))
                removeImage();            
            break;
        case "setF":
            if (viewerShowing)
                setFolderImage(imageArray[imageArrayIndex].LinkId, folderId, "folder");
            else
                setFolderImage(currentContextImageId, folderId, "folder");
            break;
        case "setC":
            if (viewerShowing)
                setFolderImage(imageArray[imageArrayIndex].LinkId, folderId, "parent");
            else
                setFolderImage(currentContextImageId, folderId, "parent");
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
    var badLink = {};
    badLink.ImageId = currentContextImageId;
    badLink.FolderId = folderId;
    $.ajax({
        type: "DELETE",
        url: service + "/api/FtpImagePage",
        data: badLink,
        success: function (success) {
            if (success === "ok") {
                if (viewerShowing)
                    slide("next");
                getImageLinks();
            }
            else {
                alert("removeLink: " + success);
            }
        },
        error: function (xhr) {
            alert("delete xhr error: " + xhr.statusText);
        }
    });
}

function openImageInNewWindow() {
    if (viewerShowing) 
        window.open(imageArray[imageArrayIndex].Link, "_blank");
    else
        window.open($('#' + currentContextImageId + '').attr("src"), "_blank");
}

function addComment() {
    /// show a blog data entry 
    /// show a comment tree with way to say something.
    /// write an entire fantasy 
    /// describe the fantasy this image evokes
}
