﻿var numImages = 0;
var numFolders = 0;
var rotationSpeed = 7000;
var intervalSpeed = 600;
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
var initialTake = 100;
var initialDomain;
var imageHistory = [];
var includeArchive = true;
var includeCenterfolds = true;

function launchCarousel(root) {
    //$('#footerMessage').html("launching carousel");
    initialDomain = root;
    if (initialDomain === "everything")
        root = "boobs";
    loadImages(root, Date.now(), false, 0, initialTake);
    loadCarouselHtml();
    var carouselFooterHeight = 40;
    $('#thisCarouselImage').height($('#topIndexPageSection').height() - carouselFooterHeight);
}

function loadCarouselHtml() {
    $('#carouselContainer').html(
        "<div class='centeringOuterShell'>\n" +
        "   <div id='innerCarouselContainer'  class='centeringInnerShell'>\n" +
        "      <div id='carouselImageContainer' class='carouselImageContainer flexContainer'>\n" +
        "          <img class='assuranceArrows' onclick='assuranceArrowClick(\"back\")' src='/Images/leftArrowOpaque02.png' />\n" +
        "          <div id='knownModelLabel' class='knownModelLabel' onclick='knownModelLabelClick()'></div>\n" +
        "          <div id='categoryTitle' class='categoryTitleLabel'" +
        "               onmouseover='slowlyShowFolderCategoryDialog(); forgetShowingCatDialog=false;'\n" +
        "               onmouseout='forgetShowingCatDialog=true;'>\n" +
        "          </div>\n" +
        "          <img id='thisCarouselImage' oncontextmenu='carouselContextMenuClick()' class='carouselImage' src='/Images/ingranaggi3.gif' onclick='clickViewGallery()' />\n" +
        "          <img class='assuranceArrows' onclick='assuranceArrowClick(\"foward\")' src='/Images/rightArrowOpaque02.png' />\n" +
        "      </div>\n" +
        "      <div class='carouselFooter'>\n" +
        "          <img class='speedButton floatLeft' src='Images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
        "          <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
        "          <div id='categoryLabel' class='carouselCategoryLabel' onclick='clickViewParentGallery()'></div>\n" +
        "          <img class='speedButton floatRight' src='Images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
        "          <img class='speedButton floatRight' src='Images/Settings-icon.png' title='carousel settings' onclick='showCarouelSettingsDialog()' />\n" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n");
}

function loadImages(rootFolder, absolueStart, deleteFlag, skip, take) {
    var start = Date.now();
    if (deleteFlag === true) {
        var removedFolders = new Array();
        var newArray = new Array();
        for (idx = 0; idx < carouselItemArray.length; idx++) {
            k++;
            try {
                if (carouselItemArray[idx].RootFolder === rootFolder) {
                    if (idx < carouselItemArray.length) {
                        if (removedFolders.find(function () { return carouselItemArray[idx].FolderName; }) === undefined) {
                            //alert("not found " + carouselItemArray[idx].FolderName);
                            sendEmailToYourself("Problem removing Carousel array items", "not found " + carouselItemArray[idx].FolderName);
                            removedFolders.push(carouselItemArray[idx].FolderName);
                        }
                    }
                    else {
                        //alert("idx: " + idx + " carouselItemArray.length: " + carouselItemArray.length);
                        if (document.domain === 'localhost')
                            alert("Problem removing Carousel array items  \nidx: " + idx + " carouselItemArray.length: " + carouselItemArray.length);
                        //sendEmailToYourself("Problem removing Carousel array items", "idx: " + idx + " carouselItemArray.length: " + carouselItemArray.length);
                    }
                }
                else
                    newArray.push(carouselItemArray[idx]);
            } catch (e) {
                sendEmailToYourself("Problem removing Carousel array items", "idx: " + idx + " error: " + e);
                //alert("idx: " + idx + " error: " + e);
            }
        }
        carouselItemArray = newArray;

        numImages = carouselItemArray.length;
        numFolders = numFolders - removedFolders.length;
        var delta = (Date.now() - start) / 1000;
        console.log("Removing links from (" + rootFolder + ") took: " + delta.toFixed(3));
        sendEmailToYourself("message from loadImages", "loops: " + k + " spliced: " + spliced + " carouselItemArray.length: " + carouselItemArray.length + " numFolders: " + numFolders + " numImages: " + numImages);
        //alert("loops: " + k + " spliced: " + spliced + " carouselItemArray.length: " + carouselItemArray.length + " numFolders: " + numFolders + " numImages: " + numImages);
    }
    else {
        $('#categoryTitle').hide();
        // $('#footerMessage').html("loading carousel");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Carousel/GetCarouselImages?root=" + rootFolder + "&skip=" + skip + "&take=" + take,
            success: function (carouselInfo) {
                if (carouselInfo.Success === "ok") {
                    $.each(carouselInfo.Links, function (idx, obj) {
                        carouselItemArray.push({
                            FolderId: obj.FolderId,
                            ModelFolderId: obj.ModelFolderId,
                            RootPath: obj.RootPath,
                            FolderName: obj.FolderName,
                            ModelPath: obj.ModelPath,
                            ModelName: obj.ModelName,
                            LinkId: obj.LinkId,
                            Link: obj.Link
                        });
                    });
                    if (skip === 0) {
                        startCarousel();
                        $('#footerMessage').html("starting carousel");
                    }
                    var delta = (Date.now() - start) / 1000;
                    if (carouselInfo.Links.length === take) {
                        skip += take;
                        take = 2000;
                        console.log("loadImages(" + rootFolder + ") skip: " + skip + " take  " + take + " took: " + delta.toFixed(3));
                        loadImages(rootFolder, absolueStart, deleteFlag, skip + take, take);
                    }
                    else {
                        // done
                        var done = true;
                        if (rootFolder === "boobs") {
                            if (initialDomain === "everything") {
                                loadImages("archive", absolueStart, deleteFlag, skip + take, take);
                                done = false;
                            }
                        }
                        if (rootFolder === "archive") {
                            if (initialDomain === "everything") {
                                loadImages("centerfold", absolueStart, deleteFlag, skip + take, take);
                                done = false;
                            }
                        }
                        if (done) {
                            delta = (Date.now() - absolueStart) / 1000;
                            //console.log("loadImages(" + rootFolder + ") DONE!! carouselInfo.Links.length: " + carouselInfo.Links.length + " take: " + take);
                            console.log("loadImages(" + rootFolder + ") DONE!! took: " + delta.toFixed(3) + " total: " + carouselItemArray.length);
                        }
                        //$('#footerMessage').html("loading carousel");
                    }
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "CSL",
                        Severity: 1,
                        ErrorMessage: carouselInfo.Success,
                        PageId: homePageId,
                        CalledFrom: "loadImages"
                    });
                    if (document.domain === 'localhost') alert("loadImages: " + carouselInfo.Success);
                    //--sendEmailToYourself("Error in Caraousel/loadImages", carouselInfo.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "loadImages")) {
                    sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take +
                        "  Message: " + errorMessage);
                }
            }
        });
    }
}

function clickViewGallery() {
    clearInterval(CarouselInterval);
    rtpe("CIC", "called from", "details", carouselItemArray[imageIndex].FolderId);
}

function clickViewParentGallery() {
    if (document.domain === 'localhost') {
        alert("clickViewParentGallery pageId: " + carouselItemArray[imageIndex].ParentId + "\neventDetail: " + eventDetail);
    }
    clearInterval(CarouselInterval);
    reportThenPerformEvent("CPC", "clickViewParentGallery", "details", carouselItemArray[imageIndex].ParentId);
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    imageIndex = Math.floor(Math.random() * numImages);
    $('.carouselImage').attr('src', carouselItemArray[imageIndex].Link);
    clearInterval(CarouselInterval);
    startCarousel();
}

function considerHidingContextMenu() {
    $('#carouselContextMenu').fadeOut();
    if (!metaTagDialogIsOpen) {
        if (!modelInfoDialogIsOpen) {
            if (!imageCommentDialogIsOpen) {
                if (!folderCategoryDialogIsOpen) {
                    resume();
                }
            }
        }
    }
}

function resizeCarousel() {
    $('.carouselFooter').width($('#thisCarouselImage').width());
    //$('#thisCarouselImage').height('max-height', $('#topIndexPageSection').height());

    //$('#carouselImageContainer').height($('#carouselContainer').height());

    //$('.assuranceArrows').height($('#carouselImageContainer').height());
    //$('.carouselImage').css("width", $('#middleColumn').width());
    //$('.carouselImage').css("max-width", $('#middleColumn').width());
    //$('.carouselImage').css("height", $('#middleColumn').innerHeight() - 180);
    //$('.carouselImage').css("height", $('#middleColumn').height() - 210);
    //$('.carouselImage').css("height", $('#middleColumn').height() - 210);
    //$('.assuranceArrows img').css("height", $('#middleColumn').height() - 210);
}

function togglePause() {
    if ($('#pauseButton').html() === "||")
        pause();
    else
        resume();
}

function pause() {
    clearInterval(CarouselInterval);
    $('#pauseButton').html(">");
}

function resume() {
    clearInterval(CarouselInterval);
    startCarousel();
    $('#pauseButton').html("||");
}

function startCarousel() {
   // alert("startCarousel");
   // $('#footerMessage').html("startCarousel");
    intervalBody();
    CarouselInterval = setInterval(function () {
        intervalBody();
    }, rotationSpeed);
}

function assuranceArrowClick(direction) {
    reportThenPerformEvent("CAA", "direction: " + direction, direction, homePageId);
}

function intervalBody() {

//FolderId: obj.FolderId,
//ModelFolderId: obj.ModelFolderId,
//RootPath: obj.RootPath,
//FolderName: obj.FolderName,
//ModelPath: obj.ModelPath,
//ModelName: obj.ModelName,
//LinkId: obj.LinkId,
//Link: obj.Link


    $('#categoryTitle').fadeOut(intervalSpeed);
    $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
        imageIndex = Math.floor(Math.random() * carouselItemArray.length);
        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
        $('#categoryTitle').html(carouselItemArray[imageIndex].RootPath + "/" + carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);
        $('#knownModelLabel').hide();
        if (carouselItemArray[imageIndex].ModelFolderId !== carouselItemArray[imageIndex].FolderId) {

            //if (carouselItemArray[imageIndex].ModelPath.indexOf(carouselItemArray[imageIndex].ModelName > -1))
            //    $('#knownModelLabel').html(carouselItemArray[imageIndex].ModelPath).fadeIn(intervalSpeed);
            //else
                $('#knownModelLabel').html(carouselItemArray[imageIndex].ModelName).fadeIn(intervalSpeed);

        }
        $('#categoryLabel').html(carouselItemArray[imageIndex].RootFolder);

        imageHistory.push(imageIndex);

        $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
        //$('#footerMessage').html("image: " + imageIndex + " of " + numImages);
        //$('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link).onload = function () {        };
        //setTimeout(function () { }, 400);
        //$('#footerMessage').html("image " + imageIndex + " of " + numImages);
    });
}

function knownModelLabelClick() {
    //alert("knownModelLabelClick(" + carouselItemArray[imageIndex].ModelFolderId + ")");
    rtpe("CMN", "index", carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].ModelFolderId);
}

function carouselContextMenuClick() {
    pause();

    event.preventDefault();
    window.event.returnValue = false;
    $('#carouselContextMenu').css("top", event.clientY + 5);
    $('#carouselContextMenu').css("left", event.clientX);
    //function carouselContextMenuShow() {
    $('#ctxModelName').html("");
    $.ajax({
        type: "GET",
        async: true,
        url: settingsArray.ApiServer + "api/ImageCategoryDetail/GetModelName?linkId=" + carouselItemArray[imageIndex].LinkId,
        success: function (imageDetails) {
            if (imageDetails.Success === "ok") {
                if (imageDetails.RootFolder === "archive") {
                    // this is a known model
                    selectedImageArchiveFolderId = imageDetails.FolderId;
                    $('#ctxModelName').html(imageDetails.FolderName);
                    $('#ctxSeeMore').show();
                }
                else {
                    selectedImageArchiveFolderId = 0;
                    $('#ctxModelName').html("unknown model");
                    $('#ctxSeeMore').hide();
                }
            }
            else {
                //alert("GetModelName: " + imageDetails.Success);
                sendEmailToYourself("GetModelName fail", imageDetails.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "carouselContextMenu")) {
                sendEmailToYourself("XHR ERROR IN Carousel.JS carouselContextMenu", "api/ImageCategoryDetail/GetModelName?linkId=" + carouselItemArray[imageIndex].LinkId +
                    " Message : " + errorMessage);
                //alert("containsLink xhr: " + getXHRErrorDetails(xhr));
            }
            sendEmailToYourself("GetNudeModelName xhr error: ", xhr.statusText);
            //alert("GetNudeModelName xhr error: " + xhr.statusText);
        }
    });
    $('#carouselContextMenu').fadeIn();
}

function carouselContextMenuAction(ctxMenuAction) {
    switch (ctxMenuAction) {
        case "showDialog":
            $('#carouselContextMenu').fadeOut();
            modelInfoDialogIsOpen = true;
            pause();
            showModelInfoDialog($('#ctxModelName').html(), selectedImageArchiveFolderId, carouselItemArray[imageIndex].Link);
            $('#modelInfoDialog').on('dialogclose', function (event) {
                modelInfoDialogIsOpen = false;
                resume();
            });
            break;
        case "seeMore":
            window.open('/album.html?folder=' + selectedImageArchiveFolderId, '_blank');
            break;
        case "explode":
            reportThenPerformEvent("EXP", "from main carousel", carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].FolderId);
            break;
        case "comment":
            $('#carouselContextMenu').fadeOut();
            imageCommentDialogIsOpen = true;
            pause();
            $('#carouselContextMenu').fadeOut();
            showImageCommentDialog(carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].LinkId, carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].FolderName);
            $('#imageCommentDialog').on('dialogclose', function (event) {
                imageCommentDialogIsOpen = false;
                resume();
            });
            break;
        case "tags":
            $('#carouselContextMenu').fadeOut();
            pause();
            metaTagDialogIsOpen = true;
            //alert("carouselItemArray[imageIndex].FolderId: " + carouselItemArray[imageIndex].FolderId);
            openMetaTagDialog(carouselItemArray[imageIndex].FolderId, carouselItemArray[imageIndex].LinkId);
            $('#metaTagDialog').on('dialogclose', function (event) {
                metaTagDialogIsOpen = false;
                resume();
            });
            break;
        case "archive":
            $('#carouselContextMenu').fadeOut();
            pause();
            $('#carouselContextMenu').fadeOut();
            showMoveCopyDialog("Archive", carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].FolderId);
            break;
        default:
            sendEmailToYourself("Invalid context menu action", "invalid: " + ctxMenuAction);
        //alert("invalid: " + ctxMenuAction);
    }
}

function onImageNotLoaded() {
    sendEmailToYourself("onImageNotLoaded", "bk image " + carouselItemArray[imageIndex].Link + " not found");
    //alert("bk image " + carouselItemArray[imageIndex].Link + " not found");
}

function loadCarouselContextMenuHtml() {
    $("#carouselContextMenuContainer").html(
        "<div id='carouselContextMenu' class='ogContextMenu' onmouseleave='considerHidingContextMenu()'>\n" +
        "    <div id='ctxModelName' onclick='carouselContextMenuAction('showDialog')'>model name</div>\n" +
        "    <div id='ctxSeeMore' onclick='carouselContextMenuAction('seeMore')'>See More</div>\n" +
        "    <div onclick='carouselContextMenuAction('explode')'>Explode</div>\n" +
        "    <div onclick='carouselContextMenuAction('comment')'>Comment</div>\n" +
        "    <div onclick='carouselContextMenuAction('tags')'>Tags</div>\n" +
        "    <div id='ctxMove' onclick='carouselContextMenuAction('archive')'>Archive</div>\n" +
        "</div>\n");
}

function addToCarousel(root, isChecked) {
    if (root === "archive") {
        if (subdomain === "porn")
            root = "sluts";
    }
    loadImages(root, isChecked, 0, 50000);
}

function slowlyShowFolderCategoryDialog() {
    setTimeout(function () {
        if (forgetShowingCatDialog === false) {
            if (typeof pause === 'function')
                pause();
            folderCategoryDialogIsOpen = true;
            showCategoryDialog(carouselItemArray[imageIndex].FolderId);
        }
    }, 1100);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        folderCategoryDialogIsOpen = false;
        if (typeof resume === 'function')
            resume();
    });
}

function showCarouelSettingsDialog() {
    $("#draggableDialogTitle").html("Carousel Settings");

    $("#draggableDialogContents").html(
        "   <input id='ckLandscape' type='checkbox' onchange='carouelSettingsClick(\"landscape\"," + $(this).is(':checked') + ")' /> allow landscape size<br/>\n" +
        "   <input id='ckPortrait' type='checkbox' onchange='carouelSettingsClick(\"portrait\"," + $(this).is(':checked') + ")' /> allow portrait size<br/>\n" +
        "   <input id='ckCenterfold' type='checkbox' onchange='carouelSettingsClick(\"centerfold\"," + $(this).is(':checked') + ")' /> Include Centerfolds<br/>\n" +
        "   <input id='ckArchive' type='checkbox' onchange='carouelSettingsClick(\"archive\"," + $(this).is(':checked') + ")' /> Include Archive<br/>\n" +
        "   <input id='ckPorn' type='checkbox' onchange='carouelSettingsClick(\"porn\"," + $(this).is(':checked') + ")' /> Include porn<br/>\n" +
        "</div>\n");

    $('#draggableDialog').css("top", event.clientY - 175);
    $('#draggableDialog').css("left", event.clientX - 100);
    $("#draggableDialog").fadeIn();
    $('#ckCenterfold').prop("checked", includeCenterfolds);
    $('#ckArchive').prop("checked", includeArchive);
}
function carouelSettingsClick(checkBox, isChecked) {
    switch (checkBox) {
        case "centerfold":
            includeCenterfolds = isChecked;
            addToCarousel(checkBox, isChecked);
            break;
        case "archive":
            includeArchive = isChecked;
            addToCarousel(checkBox, isChecked);
            break;
        case "porn":
            addToCarousel(checkBox, isChecked);
            break;
        default:
    }
}