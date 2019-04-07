﻿var viewAreaTop;
var viewAreaLeft;
var viewAreaWidth;
var viewAreaRight;
var newLink = {};

$(window).resize(function () {
    $('#imageContainer').width($('#middleColumn').width());
    $('#imageContainer').css("max-height", $('#middleColumn').height() - 150);
    if (viewerShowing) {
        $('#customViewer').height($('#middleColumn').height() - 150);
        $('#customViewer').height($('#imageContainer').height());
        $('#customViewer').width($('#imageContainer').width());
        explodeViewer();
        $('#footerMessage').html("explodeViewer");
    }
    else
        $('#footerMessage').html("resize viewer not showing");
});

function getBreadCrumbs() {
    $.ajax({
        type: "GET",
        url: service + "api/DashBoard/GetBreadCrumbs?folderId=" + folderId,
        success: function (parents) {
            $('#headerMessage').html("");
            for (i = parents.length - 1; i >= 0; i--) {
                $('#headerMessage').append("<a class='activeBreadCrumb' href='/Home/imagePage?folder=" + parents[i].FolderId + "'>" + parents[i].FolderName + "</a>");
            }
            setLayout(parents[parents.length - 1].FolderName);
            document.title = parents[0].FolderName + " OggleBooble";
            $('#expandoBannerText').html(parents[0].FolderName);
        },
        error: function (jqXHR, exception) {
            $('#getImagesLoadingGif').hide();
            alert("getBreadCrumbs jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function showAllChildren() {
    try {
        var start = Date.now();
        $('#getImagesLoadingGif').show();
        $.ajax({
            type: "GET",
            url: service + "/api/ImagePage/GetAllImageLinks?topFolderId=" + folderId+"&showAll=true",
            success: function (imageModel) {
                loadImages2(imageModel, start);
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
            success: function (imageModel, start) {                
                if (imageModel.Success === "ok") {
                    loadImages2(imageModel);
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

function loadImages2(imageModel, start) {
    rootFolder = imageModel.RootFolder;
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
    var nonLocal = false;
    var pageName = $('#expandoBannerText').html();

    $.each(imageModel.Files, function (idx, vwLink) {
        if (rootFolder === "archive") {
            if (vwLink.LinkCount === 1) {
                nonLocal = false;
                $('#imageContainer').append("<div class='noLinksImageFrame'><img id=" + vwLink.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + vwLink.Link + "'/></div>");
            }
            else {
                nonLocal = true;
                $('#imageContainer').append("<div class='mmultiLinkImageFrame'><img id=" + vwLink.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + vwLink.Link + "'/></div>");
            }
        }
        else {

            if (vwLink.Link.indexOf(pageName) > 0) {
                nonLocal = false;
                $('#imageContainer').append("<div class='imageFrame'><img id=" + vwLink.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + vwLink.Link + "'/></div>");
            }
            else {
                nonLocal = true;
                $('#imageContainer').append("<div class='nonLocalImageFrame'><img id=" + vwLink.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + vwLink.Link + "'/></div>");
            }
        }
        fileCount++;

        imageArray.push({
            NonLocal: nonLocal,
            Link: vwLink.Link.replace(/ /g, "%20"),
            ImageId: vwLink.LinkId,
            LinkCount: vwLink.LinkCount
        });
    });

    $('.thumbImage').click(function () {
        showViewer($(this).attr("id"));
    });

    $('.thumbImage').contextmenu(function () {
        //alert("id: " + $(this).attr("id"));
        event.preventDefault();
        window.event.returnValue = false;
        showContextMenu($(this).attr("id"));
    });

    fileCount += imageModel.SubDirs.length;
    $('#fileCount').html(fileCount);
    $('#getImagesLoadingGif').hide();
    if (ipAddress !== "68.203.92.166") {
        var emailSubject = currentUser + " just viewed " + folderId;
        sendEmailFromJS(emailSubject, "someday it will be someone other than " + ipAddress);
    }

}

function showContextMenu(imageId) {
    currentContextImageId = imageId;
    var thisImage = $('#' + imageId + '');

    if (viewerShowing) {
        $('#thumbImageContextMenu').css("top", event.clientY + 5);
        $('#thumbImageContextMenu').css("left", event.clientX);
    }
    else {
        var picpos = thisImage.offset();
        var picLeft = picpos.left + thisImage.width() - $('.ogContextMenu').width() - 50;
        $('#thumbImageContextMenu').css("top", picpos.top + 5);
        $('#thumbImageContextMenu').css("left", picLeft);
    }
    $('#thumbImageContextMenu').fadeIn();
}

function slide(direction) {
    if (direction === 'next') {
        imageArrayIndex++;
        if (imageArrayIndex >= imageArray.length)
            imageArrayIndex = 0;

        $('#viewerImage').css("transform", "translateX(1100px)");
        setTimeout(function () {
            $('#viewerImage').hide();
            $('#viewerImage').css("transform", "translateX(-2200px)");
            $('#viewerImage').show();
            $('#viewerImage').attr("src", imageArray[imageArrayIndex].Link);
            if (imageArray[imageArrayIndex].NonLocal) {
                $('#viewerImage').addClass("nonLocalIndicator");
                //$('#viewerImage').width($('#viewerImage').width() - 5);
            }
            else {
                $('#viewerImage').removeClass("nonLocalIndicator");
                //$('#viewerImage').width($('#viewerImage').width() + 5);
            }
            $('#viewerImage').css("transform", "translateX(0)");
        }, 450);

    }
    else // if (direction === 'prev') 
    {
        imageArrayIndex--;
        if (imageArrayIndex < 0) {
            imageArrayIndex = imageArray.length - 1;
        }
        $('#viewerImage').css("transform", "translateX(-1100px)");
        setTimeout(function () {
            $('#viewerImage').hide();
            $('#viewerImage').css("transform", "translateX(2200px)");
            $('#viewerImage').show();
            $('#viewerImage').attr("src", imageArray[imageArrayIndex].Link);
            $('#viewerImage').css("transform", "translateX(0)");
        }, 450);
    }
    $('#footerMessage').html("image: " + imageArrayIndex + " of: " + imageArray.length);
}

function showViewer(imageId) {
    var thisImage = $('#' + imageId + '');
    imageArrayIndex = thisImage.attr("idx");
    viewerShowing = true;

    if (isNullorUndefined(imageId)) {

        //alert("isNullorUndefined(imageId)")
    }

    var picpos = thisImage.offset();
    $('#customViewer').css("top", picpos.top - 100);
    $('#customViewer').css("left", picpos.left);
    $('#customViewer').width(100);
    $('#customViewer').height(150);
    $('#customViewer').show();
    $('#viewerImage').attr("src", thisImage.attr("src"));

    viewAreaTop = Number($('#middleColumn').position().top + 10);
    viewAreaLeft = Number($('#middleColumn').position().left);
    viewAreaWidth = Number($('#middleColumn').width());
    viewAreaRight = viewAreaWidth + viewAreaLeft;

    $('.hiddeClickArea').contextmenu(function () {
        event.preventDefault();
        window.event.returnValue = false;
        showContextMenu(imageArray[imageArrayIndex].ImageId);
    });

    exploderInterval = setInterval(function () {
        explodeViewer();
    }, 8);
}

function explodeViewer() {
    var Xincrimentor = 15;
    var Yincrimentor = 10;

    var viewAreaHeight = $('#middleColumn').height() - 150;
    viewAreaTop = Number($('#imageContainer').position().top);
    viewAreaLeft = Number($('#imageContainer').position().left);
    viewAreaWidth = Number($('#imageContainer').width());
    viewAreaRight = viewAreaWidth + viewAreaLeft;

    if ((Number($('#customViewer').width()) >= viewAreaWidth) &&
        (Number($('#customViewer').height()) >= viewAreaHeight)) {
        clearInterval(exploderInterval);
        $('#customViewer').css("top", viewAreaTop + "px");
        $('#customViewer').css("left", " " + viewAreaLeft + "px");
        $('#viewerImage').height($('#customViewer').height() - 50);
        $('#viewerImage').width($('#customViewer').width());
        //$('#magnifyingGlass').show();
        //alert("done");
    }

    if ($('#customViewer').height() < viewAreaHeight) {
        $('#customViewer').height($('#customViewer').height() + Yincrimentor);
    }
    if ($('#customViewer').height() > viewAreaHeight) {
        $('#customViewer').height(viewAreaHeight);
    }
    if ($('#customViewer').width() < viewAreaWidth) {
        $('#customViewer').width($('#customViewer').width() + (Xincrimentor * 2));
    }
    if ($('#customViewer').width() > viewAreaWidth) {
        $('#customViewer').width(viewAreaWidth)
    }
    if ($('#customViewer').position().top > viewAreaTop) {
        $('#customViewer').css("top", $('#customViewer').position().top - Yincrimentor);
    }


    var imageRight = Number($('#customViewer').width() + $('#customViewer').position().left);
    if (imageRight > viewAreaRight) {
        //alert("imageRight(" + imageRight + ") > viewAreaRight (" + viewAreaRight + ")  delta: " + (imageRight - viewAreaRight));
        $('#customViewer').css("left", $('#customViewer').position().left - (imageRight - viewAreaRight));
    }

    $('#viewerImage').height($('#customViewer').height() - 50);
    $('#viewerImage').width($('#customViewer').width());
}

$('.ogContextMenu div').click(function () {
    var action = $(this).html();
    switch (action) {
        case "Copy Link":
            $('#btnMoveImage').hide();
            $('#btnCopyLink').show();
            $('#btnMoveLink').hide();
            $('#dialogBannerText').html("Copy Image Link");
            $('#copyDialogImage').attr("src", $('#' + currentContextImageId + '').attr("src"));
            $('#moveCopyDialog').show();
            break;
        case "Move Image":
            $('#btnCopyLink').hide();
            $('#btnMoveLink').hide();
            $('#btnMoveImage').show();
            $('#dialogBannerText').html("Move Image File");
            $('#copyDialogImage').attr("src", $('#' + currentContextImageId + '').attr("src"));
            $('#moveCopyDialog').show();
            break;
        //case "Move Link":
        //    $('#btnMoveImage').hide();
        //    $('#btnCopyLink').hide();
        //    $('#btnMoveLink').show();
        //    $('#dialogBannerText').html("Move Image Link");
        //    $('#copyDialogImage').attr("src", $('#' + currentContextImageId + '').attr("src"));
        //    $('#moveCopyDialog').show();
        //    break;
        case "Remove Link":
            if (confirm("remove this link")) {
                removeLink();
            }
            break;
        case "Comment":
            showCommentDialog();
            break;
        case "About":
            aboutThisImage();
            break;
        default:
            alert(action);
    }
});

function removeLink() {
    var badLink = {};
    badLink.ImageId = currentContextImageId;
    badLink.FolderId = folderId;
    $.ajax({
        type: "DELETE",
        url: service + "/api/ImagePage",
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

function moveImage() {
    var moveImageModel = new Object();
    moveImageModel.SourceFolderId = folderId;
    moveImageModel.DestinationFolderId = newLink.CopyToFolderId;
    moveImageModel.ImageName = imageArray[imageArrayIndex].Link;

    $.ajax({
        type: "PUT",
        url: service + "/api/FtpImagePage/MoveImage",
        data: moveImageModel,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "image moved to " + $('#dirTreeDropDown option:selected').text());
                //if(currentContextImageId!=newLink.)
                //removeLink();
                $('#moveCopyDialog').hide();
                if (viewerShowing)
                    slide("next");
            }
            else
                alert(success);
        },
        error: function (xhr) {
            alert("moveImage xhr error: " + xhr.statusText);
        }
    });
}

function copyLink() {
    newLink.ImageId = currentContextImageId;
    $.ajax({
        type: "PUT",
        url: service + "/api/ImagePage",
        data: newLink,
        success: function (success) {
            if (success === "ok") {
                $('#moveCopyDialog').hide();
                //alert("copy destination folder: " + $('#dirTreeDropDown option:selected').text());
                displayStatusMessage("ok", "link coppyed to " + $('#dirTreeResults').html());
                //if (andRemove) {
                //    var badLink = {};
                //    badLink.ImageId = newLink.ImageId;
                //    badLink.FolderId = folderId;
                //    $.ajax({
                //        type: "DELETE",
                //        url: service + "/api/ImagePage",
                //        data: badLink,
                //        success: function (success) {
                //            if (success === "ok") {
                //                getImageLinks();
                //                if (viewerShowing)
                //                    slide("next");
                //            }
                //            else {
                //                alert("copyLink(andRemove): " + success);
                //            }
                //        },
                //        error: function (xhr) {
                //            alert("delete xhr error: " + xhr.statusText);
                //        }
                //    });
                //}
                //else
                //    getImageLinks();
            }
            else {
                alert("copyLink: " + success);
            }
        },
        error: function (xhr) {
            alert("copyLink(andRemove) xhr error: " + xhr.statusText);
        }
    });
}

function blowupImage() {
    //alert("blowupImage: " + imageArray[imageArrayIndex].Link);
    window.open(imageArray[imageArrayIndex].Link, "_blank");
}

function toggleDirTree(id) {
    if ($('#' + id + '').css("display") == "none")
        $('#S' + id + '').html("[-] ");
    else
        $('#S' + id + '').html("[+] ");
    $('#' + id + '').toggle();
}

function onDirTreeClick(path, id) {
    newLink.CopyToFolderId = id.substring(2);
    //alert("newLink.CopyToFolderId: " + newLink.CopyToFolderId);
    $('#dirTreeResults').show();
    $('#dirTreeResults').html(path.replace(/%20/g, " "));
    $('#dirTreeDropDown').hide();
}

$(document).keydown(function (event) {
    //  8  back

    //  34 pg down
    //  38 up arrow
    //  40 down arrow
    switch (event.which) {
        //case 38: scrollTabStrip('foward'); break;
        //case 33: scrollTabStrip('foward'); break;
        case 34:                        // pg down
        case 40:                        // dowm arrow
        case 37:                        // left arrow
            slide('prev');
            break;
        case 13:                        // enter
        case 38:                        // up arrow
        case 39:                        // right arrow
            slide('next');
            break;
        case 122: $('#standardHeader').hide(); break; // F11
        //default:
        //  $('#expandoBannerText').html("event.which: " + event.which)
        //  alert("event.which: " + event.which)
    }
});

function runSlideShow(action) {
    //alert("slideShow action: " + action)

    if (action === 'start') {
        if ($('#showSlideshow').attr("Title") === "start slideshow") {
            $('#showSlideshow').attr("Title", "stop slideshow");
        }
        else {
            $('#showSlideshow').attr("Title", "start slideshow");
            $('#fasterSlideshow').attr("Title", "faster slideshow");
            $('#slowerSlideShow').attr("Title", "slower slideshow");
            clearInterval(slideShow);
            return;
        }
    }
    if (slideShowSpeed === 0) {
        slideShowSpeed = 5000;
    }
    if (action === "faster") {
        slideShowSpeed -= 1000;
    }
    if (action === "slower") {
        slideShowSpeed += 1000;
    }
    if (slideShowSpeed <= 0) {
        $('#showSlideshow').attr("Title", "start slideshow");
        $('#fasterSlideshow').attr("Title", "faster slideshow");
        $('#slowerSlideShow').attr("Title", "slower slideshow");
        clearInterval(slideShow);
    }
    else {
        slide('next');
        $('#fasterSlideshow').attr("Title", "slideshow " + (10 - (slideShowSpeed / 1000)) + "x");
        $('#slowerSlideShow').attr("Title", "slideshow " + (10 - (slideShowSpeed / 1000)) + "x");
        clearInterval(slideShow);
        slideShow = setInterval(function () {
            slide('next');
        }, slideShowSpeed);
    }
}

function addComment() {
    /// show a blog data entry 
    /// show a comment tree with way to say something.
    /// write an entire fantasy 
    /// describe the fantasy this image evokes
    


}