var nudeModelFolderId;

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

    //[Table("OggleBooble.vwLinks")]
    //public partial class VwLink {
    //    public string LinkId { get; set; }
    //    public int FolderId { get; set; }
    //    public string Link { get; set; }
    //    public int LinkCount { get; set; }
    //    public int NoLink { get; set; }
    //}

    // add files
    imageArray = new Array();
    $('#slideShowLink').show();
    var fileCount = 0;
    $.each(imageModel.Files, function (idx, imageModelFile) {
        $('#footerMessage').html("fileCount: " + fileCount);
        if (rootFolder === "archive") {
            if (vwLink.LinkCount === 1) {
                $('#imageContainer').append("<div class='imageFrame'><img id=" + imageModelFile.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
            }
            else {
                $('#imageContainer').append("<div class='multiLinkImageFrame'><img id=" + vwLink.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
            }
        }
        else {
            if (imageModelFile.NoLink > 0) {
                $('#imageContainer').append("<div class='imageFrame'><img id=" + imageModelFile.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
            }
            else {
                $('#imageContainer').append("<div class='multiLinkImageFrame'><img id=" + imageModelFile.LinkId +
                    " idx=" + fileCount + " class='thumbImage' src='" + imageModelFile.Link + "'/></div>");
            }
        }
        fileCount++;

        imageArray.push({
            Link: imageModelFile.Link.replace(/ /g, "%20"),
            ImageId: imageModelFile.LinkId,
            Local: imageModelFile.NoLink > 0
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
        showContextMenu($(this).attr("id"));

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

function showContextMenu(imageId) {
    currentContextImageId = imageId;
    var thisImage = $('#' + imageId + '');
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
        url: service + "api/NudeModelInfo?linkId=" + imageId,
        success: function (nudeModelInfo) {
            $('#ctxModelName').html(nudeModelInfo.ModelName);
            if ($('#ctxModelName').html() === "unknown model")
                $('#ctxSeeMore').hide();
            else {
                nudeModelFolderId = nudeModelInfo.FolderId;
                if (nudeModelInfo.RootFolder === "archive")
                    $('#ctxSeeMore').hide();
                else
                    $('#ctxSeeMore').show();
            }
        },
        error: function (xhr) {
            alert("GetNudeModelName xhr error: " + xhr.statusText);
        }
    });

    $('#thumbImageContextMenu').fadeIn();
}

function slide(direction) {
    if (direction === 'next')
    {
        imageArrayIndex++;
        if (imageArrayIndex >= imageArray.length)
            imageArrayIndex = 0;

        $('#viewerImage').css("transform", "translateX(1100px)");
        setTimeout(function () {
            $('#viewerImage').hide();
            $('#viewerImage').css("transform", "translateX(-2200px)");
            $('#viewerImage').show();
            $('#viewerImage').attr("src", imageArray[imageArrayIndex].Link);
            if (imageArray[imageArrayIndex].Local) 
                $('#redBar').show();
            else 
                $('#redBar').hide();
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
            if (imageArray[imageArrayIndex].Local)
                $('#redBar').show();
            else 
                $('#redBar').hide();
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
    //thisImage.height($('#middleColumn').height() - 150);
    $('#viewerImage').height($('#customViewer').height());

    $('.hiddeClickArea').contextmenu(function () {
        event.preventDefault();
        window.event.returnValue = false;
        showContextMenu(imageArray[imageArrayIndex].ImageId);
    });

    $('#redBar').hide();
    var Xincrimentor = 15;
    var Yincrimentor = 10;
    resizePage();
    $('#customViewer').width(10);
    //$('#viewerImage').attr("left", thisImage.attr("left"));

    exploderInterval = setInterval(function () {        
        explodeViewer(Xincrimentor, Yincrimentor);
    }, 8);
}

function explodeViewer(Xincrimentor, Yincrimentor) {
    var viewAreaHeight = $('#middleColumn').height() - 150;
    $('#viewerImage').height($('#customViewer').height() - 50);
    $('#viewerImage').width($('#customViewer').width());
    $('#viewerImage').css("top", Number($('#customViewer').position().top + 50) + "px");

    if (Number($('#customViewer').width()) >= Number($('#middleColumn').width())) {             //&& Number($('#customViewer').height()) >= viewAreaHeight) {    
        if (Number($('#customViewer').height()) >= viewAreaHeight) {
            //if ($('#viewerImage').height() >= $('#customViewer').height() - 50) {
            //alert("clearInterval");
            //clearInterval(exploderInterval);
            $('#customViewer').css("top", Number($('#middleColumn').position().top + 15) + "px");
            $('#viewerImage').height($('#customViewer').height() - 50);
            $('#viewerImage').width($('#customViewer').width());
            $('#viewerImage').css("left", $('#middleColumn').position().left);
        }
    }


    if ($('#customViewer').height() < viewAreaHeight) {
        $('#customViewer').height($('#customViewer').height() + Yincrimentor);
    }
    if ($('#customViewer').height() > viewAreaHeight) {
        $('#customViewer').height(viewAreaHeight);
    }

    if ($('#customViewer').width() < Number($('#middleColumn').width())) {
        $('#customViewer').width($('#customViewer').width() + (Xincrimentor * 2));
        if (Number($('#customViewer').width() + $('#customViewer').position().left) > Number($('#middleColumn').width())) {
            $('#customViewer').css("left", " " + Number($('#middleColumn').width() - $('#customViewer').width()) + "px");
        }
        if ($('#customViewer').position().left < $('#middleColumn').position().left) {
            $('#customViewer').css("left", $('#middleColumn').position().left);
        } 
    }

    if ($('#customViewer').position().top + 15 > Number($('#middleColumn').position().top)) {
        $('#customViewer').css("top", $('#customViewer').position().top - Yincrimentor);
    }
    else {
        $('#customViewer').css("top", Number($('#middleColumn').position().top + 15) + "px");
        //alert("ss" + $('#customViewer').position().top + 35);
    }


    //$('#viewerImage').height($('#customViewer').height() - 50);
    //$('#viewerImage').width($('#customViewer').width());
    //$('#viewerImage').css("top", Number($('#customViewer').position().top + 50) + "px");

    //$('#viewerImage').css('left', Number($('#imageContainer').width()/2 - ($('#customViewer').width() / 2));
}

$('#thumbImageContextMenu div').click(function () {
    var action = $(this).html();
    switch (action) {
        case "see more of her":
            window.open("/home/ImagePage?folder=" + nudeModelFolderId, "_blank");
            break;
        case "Copy Link":
            if (viewerShowing)
                showMoveCopyDialog("Copy", imageArray[imageArrayIndex].ImageId, folderId, $('#' + currentContextImageId + '').attr("src"));
            else
                showMoveCopyDialog("Copy", currentContextImageId, folderId, $('#' + currentContextImageId + '').attr("src"));
            break;
        case "Move Link":
            if (viewerShowing)
                showMoveCopyDialog("Move", imageArray[imageArrayIndex].Link, folderId, $('#' + currentContextImageId + '').attr("src"));
            else
                showMoveCopyDialog("Move", $('#' + currentContextImageId + '').attr("src"), folderId, $('#' + currentContextImageId + '').attr("src"));
            break;
        case "Archive":
            if (viewerShowing)
                showMoveCopyDialog("Archive", imageArray[imageArrayIndex].Link, folderId, $('#' + currentContextImageId + '').attr("src"));
            else
                showMoveCopyDialog("Archive", $('#' + currentContextImageId + '').attr("src"), folderId, $('#' + currentContextImageId + '').attr("src"));
            break;
        case "Remove Link":
            if (confirm("remove this link")) 
                removeImage();            
            break;
        case "Set as Folder Image":
            if (viewerShowing)
                setFolderImage(imageArray[imageArrayIndex].ImageId, folderId, "folder");
            else
                setFolderImage(currentContextImageId, folderId, "folder");
            break;
        case "Set as Category Image":
            if (viewerShowing)
                setFolderImage(imageArray[imageArrayIndex].ImageId, folderId, "parent");
            else
                setFolderImage(currentContextImageId, folderId, "parent");
            break;
        case "Explode":
            if (viewerShowing)
                window.open(imageArray[imageArrayIndex].Link, "_blank");
            else
                window.open($('#' + currentContextImageId + '').attr("src"), "_blank");
            break;
        case "Comment":
            if (viewerShowing)
                showImageCommentDialog(imageArray[imageArrayIndex].Link, imageArray[imageArrayIndex].ImageId, folderId, folderName);
            else
                showImageCommentDialog($('#' + currentContextImageId + '').attr("src"), currentContextImageId, folderId, folderName);
            break;
        default:
            if (viewerShowing) 
                showModelInfoDialog(imageArray[imageArrayIndex].Link, imageArray[imageArrayIndex].ImageId, folderId);            
            else
                showModelInfoDialog($('#' + currentContextImageId + '').attr("src"), currentContextImageId, folderId);
            break;
    }
});

$('#moveCopyDialog').on('dialogclose', function (event) {
    if (viewerShowing)
        slide("next");
    getImageLinks();
});

function showCommentDialog() {
}

function setFolderImage(linkId, folderId, level){
    $.ajax({
        type: "PUT",
        url: service + "/api/CategoryFolder/?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
        success: function (success) {
            if (success === "ok") {
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
    //alert("blowupImage: " + imageArray[imageArrayIndex].Link);
    window.open(imageArray[imageArrayIndex].Link, "_blank");
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
        $('#fasterSlideshow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
        $('#slowerSlideShow').attr("Title", "slideshow " + 10 - (slideShowSpeed / 1000) + "x");
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
