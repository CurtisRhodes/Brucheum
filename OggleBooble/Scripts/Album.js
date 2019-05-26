
var selectedImageArchiveFolderId;
var currentContextLinkId;
var forgetShowingCatDialog;

function getBreadCrumbs() {
    $.ajax({
        type: "GET",
        url: service + "api/DashBoard/GetBreadCrumbs?folderId=" + folderId,
        success: function (parents) {
            $('#headerMessage').html("");
            for (i = parents.length - 1; i >= 0; i--) {
                $('#headerMessage').append("<a class='activeBreadCrumb' " +
                    "onmouseover='slowlyShowCatDialog(" + parents[i].FolderId + ");forgetShowingCatDialog=false;' onmouseout='forgetShowingCatDialog=true;' " +    
                    "href='/album?folder=" + parents[i].FolderId + "'>" + parents[i].FolderName.replace(".OGGLEBOOBLE.COM", "") + "</a>");
            }
            setLayout(parents[parents.length - 1].FolderName);
            document.title = parents[0].FolderName + " OggleBooble";
            folderName = parents[0].FolderName;
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
            success: function (imageModel) {  
                rootFolder = imageModel.Origin;
                if (imageModel.Success === "ok") {
                    processImages(imageModel, start);
                    $('#getImagesLoadingGif').hide();
                }
                else {
                    $('#getImagesLoadingGif').hide();
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
        $('#imageContainer').append("<div class='folderImageFrame' onclick=window.location.href='album?folder=" + subDir.FolderId + "'><img class='folderImage' src='" +
            subDir.FirstImage + "'/><div class='folderImageFrameName'>" + subDir.DirectoryName + "  (" + subDir.Length + ")</div></div>");
    });

    //$('#slideShowLink').show();

    // add files to array
    imageArray = new Array();
    $.each(imageModel.Files, function (idx, imageModelFile) {
        imageArray.push({
            Link: imageModelFile.Link.replace(/ /g, "%20"),
            LinkId: imageModelFile.LinkId,
            Local: imageModelFile.LinkCount === 1
        });
    });
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

    });

    fileCount += imageModel.SubDirs.length;
    $('#fileCount').html(fileCount);
    $('#getImagesLoadingGif').hide();

    $('.thumbImage').click(function () {
        viewerShowing = true;
        LaunchViewer(imageArray, $(this).attr("idx"), folderId, currentUser);
    });

    $('.thumbImage').contextmenu(function () {
        //alert("id: " + $(this).attr("id"));
        event.preventDefault();
        window.event.returnValue = false;
        //showContextMenu();
        currentContextLinkId = $(this).attr("id");
        var thisImage = $('#' + currentContextLinkId + '');
        var picpos = thisImage.offset();
        var picLeft = picpos.left + thisImage.width() - $('#thumbImageContextMenu').width() - 50;
        $('#thumbImageContextMenu').css("top", picpos.top + 5);
        $('#thumbImageContextMenu').css("left", picLeft);
        //}
        $.ajax({
            type: "GET",
            url: service + "api/ImageCategoryDetail/GetModelName?linkId=" + currentContextLinkId,
            success: function (folderDetails) {
                if (folderDetails.Success === "ok") {
                    selectedImageArchiveFolderId = folderDetails.FolderId;
                    if (folderDetails.FolderId == folderId) {
                        // model not found elsewhere 
                        $('#ctxSeeMore').hide();
                        if (folderDetails.RootFolder == "archive") {
                            $('#ctxModelName').html(folderDetails.FolderName);
                            $('#ctxArchive').hide();
                        }
                        else {
                            $('#ctxModelName').html("unknown model");
                            $('#ctxArchive').show();
                        }
                    }
                    else {
                        $('#ctxModelName').html(folderDetails.FolderName);
                        $('#ctxSeeMore').show();
                        if (folderDetails.RootFolder == "archive")
                            $('#ctxArchive').hide();
                        else
                            $('#ctxArchive').show();
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
            //var currentUser = '@User.Identity.Name';
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
            if (confirm("remove this link"))
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
    var badLink = {};
    badLink.ImageId = currentContextLinkId;
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




