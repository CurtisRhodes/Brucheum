var numImages = 0;
var numFolders = 0;
var rotationSpeed = 7000;
var intervalSpeed = 600;
var carouselItemArray = new Array();
var imageIndex = 0;
var carouselContainerHeight;
var CarouselInterval;
var selectedImageArchiveFolderId;
var metaTagDialogIsOpen = false;
var imageCommentDialogIsOpen = false;
var folderCategoryDialogIsOpen = false;
var forgetShowingCatDialog;
var imageHistory = [];
var carouselImageViews = 0;
var mainImageClickId;
var knownModelLabelClickId;
var imageTopLabelClickId;
var footerLabelClickId;

function launchCarousel() {
    //$('#footerMessage').html("launching carousel");
    $('#carouselContainer').html(carouselHtml());
    $("#carouselContextMenuContainer").html(carouselContextMenuHtml());

    if (isNullorUndefined(window.localStorage["carouselSettings"])) {

        var carouselSettings = {
            includeArchive: true,
            includeCenterfolds: true,
            includePorn: false,
            includeLandscape: true,
            includePortrait: false
        };
        window.localStorage["carouselSettings"] = JSON.stringify(carouselSettings);
    }
    else
        console.log("carouselSettings found in local storage!");
    let lsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);

    loadImages("boobs", Date.now(), 0, 366, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
    let initialTake = 500;

    if (lsCarouselSettings.includeArchive) {
        loadImages("archive", Date.now(), 0, initialTake, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
    }
    if (lsCarouselSettings.includeCenterfolds) {
        loadImages("centerfold", Date.now(), 0, initialTake, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
    }
    if (lsCarouselSettings.includePorn) {
        loadImages("porn", Date.now(), 0, initialTake, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
    }
    window.addEventListener("resize", resizeCarousel);
}

function carouselContextMenuHtml() {
    return "<div id='carouselContextMenu' class='ogContextMenu' onmouseleave='considerHidingContextMenu()'>\n" +
        "    <div id='ctxModelName' onclick='carouselContextMenuAction(\"showDialog\")'>model name</div>\n" +
        "    <div onclick='carouselContextMenuAction(\"explode\")'>Explode</div>\n" +
        "    <div onclick='carouselContextMenuAction(\"comment\")'>Comment</div>\n" +
        //"    <div onclick='carouselContextMenuAction(\"tags\")'>Tags</div>\n" +
        "</div>\n";
}

function carouselHtml() {
    return "<div id='carouselImageContainer' class='carouselImageContainer'>\n" +
        "    <img class='assuranceArrows' onclick='assuranceArrowClick(\"back\")' src='/Images/leftArrowOpaque02.png' />\n" +
        "    <div id='knownModelLabel' class='knownModelLabel' onclick='clickViewGallery(3)'></div>\n" +
        "    <div id='imageTopLabel' class='categoryTitleLabel' onclick='clickViewGallery(2)'></div>\n" +
        "    <img id='thisCarouselImage' oncontextmenu='carouselContextMenuClick()' class='carouselImage' src='/Images/ingranaggi3.gif' onclick='clickViewGallery(1)' />\n" +
        "    <img class='assuranceArrows' onclick='assuranceArrowClick(\"foward\")' src='/Images/rightArrowOpaque02.png' />\n" +
        "</div>\n" +
        "<div id='carouselFooter' class='carouselFooter'>\n" +
        "    <img class='speedButton floatLeft' src='Images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
        "    <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
        "    <div id='categoryLabel' class='carouselCategoryLabel' onclick='clickViewGallery(4)'></div>\n" +
        "    <img class='speedButton floatRight' src='Images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
        "    <img class='speedButton floatRight' src='Images/Settings-icon.png' title='carousel settings' onclick='showCarouelSettingsDialog()' />\n" +
        "</div>\n";
}

function loadImages(rootFolder, absolueStart, skip, take, includeLandscape, includePortrait) {
    var start = Date.now();
    try {
        $('#imageTopLabel').hide();
        //$('#footerMessage').html("loading carousel");
        //alert("loading carousel");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/IndexPage/GetCarouselImages?root=" + rootFolder + "&skip=" + skip + "&take=" + take +
                "&includeLandscape=" + includeLandscape + "&includePortrait=" + includePortrait,
            success: function (carouselInfo) {
                if (carouselInfo.Success === "ok") {
                    $.each(carouselInfo.Links, function (idx, obj) {
                        carouselItemArray.push({
                            RootFolder: obj.RootFolder,
                            FolderId: obj.FolderId,
                            FolderParent: obj.FolderParent,
                            FolderName: obj.FolderName,
                            FolderParentId: obj.FolderParentId,
                            FolderGP: obj.FolderGP,
                            FolderGPId: obj.FolderGPId,
                            ImageFolderId: obj.ImageFolderId,
                            ImageFolder: obj.ImageFolder,
                            ImageFolderParent: obj.ImageFolderParent,
                            ImageFolderParentId: obj.ImageFolderParentId,
                            ImageFolderGP: obj.ImageFolderGP,
                            ImageFolderGPId: obj.ImageFolderGPId,
                            LinkId: obj.LinkId,
                            Link: obj.Link
                        });
                        //alert("carouselItemArray.push[ " + idx + " ]");
                    });

                    if (take === 366) {
                        newImageIndex = Math.floor(Math.random() * carouselItemArray.length);
                        startCarousel(newImageIndex);
                        resizeCarousel();
                    }

                    var delta = (Date.now() - start) / 1000;
                    if (carouselInfo.Links.length === take) {
                        skip += take;
                        take = 2000;
                        //console.log("loadImages(" + rootFolder + ") skip: " + skip + " take  " + take + " took: " + delta.toFixed(3));
                        loadImages(rootFolder, absolueStart, skip + take, take, includeLandscape, includePortrait);
                        $('#footerMessage').html("carousel items loaded: " + carouselItemArray.length);
                    }
                    else {
                        // done
                        delta = (Date.now() - absolueStart) / 1000;
                        console.log("loadImages(" + rootFolder + ") DONE!! took: " + delta.toFixed(3) + " total: " + carouselItemArray.length.toLocaleString());
                        $('#footerMessage').html("total carousel items: " + carouselItemArray.length.toLocaleString());
                    }
                }
                else {
                    if (document.domain === "localHost")
                        alert("JQA error in loadImages: " + carouselInfo.Success)
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "JQA",
                            Severity: 1,
                            ErrorMessage: carouselInfo.Success,
                            PageId: homePageId,
                            CalledFrom: "loadImages"
                        });
                    //if (document.domain === 'localhost') alert("loadImages: " + carouselInfo.Success);
                    //--sendEmailToYourself("Error in Caraousel/loadImages", carouselInfo.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404()) {
                    if (document.domain === "localHost")
                        alert("XHR error in loadImages: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 1,
                            ErrorMessage: errorMessage,
                            PageId: homePageId,
                            CalledFrom: "loadImages"
                        });
                    //sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take + "  Message: " + errorMessage);
                }
            }
        });
    } catch (e) {
        alert(e);
    }
}

function startCarousel(startIndex) {
    intervalBody(startIndex);
    CarouselInterval = setInterval(function () {
        newImageIndex = Math.floor(Math.random() * carouselItemArray.length);
        intervalBody(newImageIndex);
    }, rotationSpeed);
}

function intervalBody(newImageIndex) {
    imageIndex = newImageIndex;
    $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {

        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link)
            .on('load', function () {
                //$('#headerMessage').html(carouselItemArray[imageIndex].LinkId);
                resizeCarousel();
            });


        $('#knownModelLabel').html("").hide();
        $('#categoryLabel').html("").hide();
        $('#imageTopLabel').html("").hide();
        if (carouselItemArray[imageIndex].FolderId === carouselItemArray[imageIndex].ImageFolderId) {
            //$('#knownModelLabel').hide();
            if (!containsRomanNumerals(carouselItemArray[imageIndex].ImageFolder)) {
                // noraml
                $('#knownModelLabel').html(carouselItemArray[imageIndex].FolderName);
                //$('#knownModelLabel').html("");
                $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderParent)
                $('#categoryLabel').html(carouselItemArray[imageIndex].FolderGP);
                mainImageClickId = carouselItemArray[imageIndex].FolderId;
                imageTopLabelClickId = carouselItemArray[imageIndex].FolderParentId;
                footerLabelClickId = carouselItemArray[imageIndex].FolderGPId;
                knownModelLabelClickId = carouselItemArray[imageIndex].FolderId;
                //$('#headerMessage').html("1");

                if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                    $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderGP);
                    $('#headerMessage').append("P");
                }

            }
            else { // roman shift
                $('#knownModelLabel').html(carouselItemArray[imageIndex].FolderParent);
                $('#imageTopLabel').html(carouselItemArray[imageIndex].ImageFolderGP)
                $('#categoryLabel').html(carouselItemArray[imageIndex].RootFolder);
                footerLabelClickId = getRootFolderId(carouselItemArray[imageIndex].RootFolder);
                mainImageClickId = carouselItemArray[imageIndex].ImageFolderParentId;
                knownModelLabelClickId = carouselItemArray[imageIndex].FolderId;  //  the roman
                imageTopLabelClickId = carouselItemArray[imageIndex].ImageFolderGPId;
                //$('#headerMessage').html("2");

                if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                    $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderParent);
                    $('#knownModelLabel').html(carouselItemArray[imageIndex].Folder);
                    $('#headerMessage').append("P");
                    imageTopLabelClickId = carouselItemArray[imageIndex].ImageFolderParentId;
                    //pause();
                    //setTimeout(function () { alert("roman shift " + $('#headerMessage').html() + ".  imageTopLabelClickId: " + imageTopLabelClickId); }, 600);
                }
            }
        }
        else {
            if (!containsRomanNumerals(carouselItemArray[imageIndex].FolderName)) {
                $('#imageTopLabel').html(carouselItemArray[imageIndex].ImageFolderGP)
                $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderParent);
                $('#categoryLabel').html(carouselItemArray[imageIndex].RootFolder);
                mainImageClickId = carouselItemArray[imageIndex].ImageFolderParentId;
                knownModelLabelClickId = carouselItemArray[imageIndex].ImageFolderId;
                imageTopLabelClickId = carouselItemArray[imageIndex].ImageFolderGPId;
                footerLabelClickId = getRootFolderId(carouselItemArray[imageIndex].RootFolder);
                //$('#headerMessage').html("3");
                if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                    $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolder);
                    $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderGP);
                    footerLabelClickId = 472;
                    $('#categoryLabel').html("Playboy");
                    //$('#headerMessage').html(" 3P non folder member");
                    pause();
                    setTimeout(function () { alert("non folder member 3. centerfold\nroot: " + carouselItemArray[imageIndex].RootFolder) }, 600);
                }
            }
            else {  // non roman numeral shift
                $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderGP);
                $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderParent);
                $('#categoryLabel').html(carouselItemArray[imageIndex].RootFolder);
                knownModelLabelClickId = carouselItemArray[imageIndex].ImageFolderParentId;
                mainImageClickId = carouselItemArray[imageIndex].FolderParentId;
                imageTopLabelClickId = carouselItemArray[imageIndex].FolderGPId;
                footerLabelClickId = getRootFolderId(carouselItemArray[imageIndex].RootFolder);
                //$('#headerMessage').html("4");
                pause();
                setTimeout(function () { alert("4 Non Roman Numeral Non folder member") }, 600);
            }
        }
        $('#categoryLabel').fadeIn();
        $('#imageTopLabel').fadeIn();
        $('#knownModelLabel').fadeIn();
        imageHistory.push(imageIndex);
        $('#carouselImageContainer').fadeIn();
        //$('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });

        $('#footerMessage').html("image " + imageIndex + " of " + carouselItemArray.length.toLocaleString());
        carouselImageViews++;
        //console.log("image views: " + carouselImageViews);
        //$('#headerMessage').html("carouselImageViews: " + carouselImageViews);
    });
}

function clickViewGallery(labelClick) {
    clearInterval(CarouselInterval);
    switch (labelClick) {
        case 1:  // carousel main image
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + mainImageClickId);
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolder, "main image", mainImageClickId);
            break;
        case 2: // top imageTopLabel
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + imageTopLabelClickId);
            reportThenPerformEvent("CIC", carouselItemArray[imageIndex].ImageFolder, "image top label", imageTopLabelClickId);    
            break;
        case 3: // knownModelLabel
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + knownModelLabelClickId);
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolder, "knownModelLabel", knownModelLabelClickId);
            break;
        case 4: // footer 
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + footerLabelClickId);
            reportThenPerformEvent("CPC", carouselItemArray[imageIndex].ImageFolder, "clickViewParentGallery", footerLabelClickId);
            break;
        default:
    }
}

function getRootFolderId(rootFolder) {
    var rootFolderId = 2;
    switch (rootFolder) {
        case "archive": rootFolderId = 3; break;
        case "boobs": rootFolderId = 2; break;
        case "playboy": rootFolderId = 472; break;
        case "porn": rootFolderId = 242; break;
        case "sluts": rootFolderId = 440; break;
    }
    return rootFolderId;
}

function resizeCarousel() {

    $('#carouselImageContainer').css("left", ($('#topIndexPageSection').width() - $('#carouselImageContainer').width()) / 2);
    $('#carouselFooter').width($('#thisCarouselImage').width()); 
    $('#carouselFooter').css("left", ($('#topIndexPageSection').width() - $('#carouselImageContainer').width()) / 2);

    $('#thisCarouselImage').height($(window).height() * .65);
    $('#headerMessage').html($('#thisCarouselImage').height());
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    imageIndex = Math.floor(Math.random() * numImages);
    $('.carouselImage').attr('src', carouselItemArray[imageIndex].Link);
    clearInterval(CarouselInterval);
    startCarousel(imageIndex);
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
    startCarousel(imageIndex);
    $('#pauseButton').html("||");
}

function carouselContextMenuClick() {
    pause();
    event.preventDefault();
    window.event.returnValue = false;
    $('#carouselContextMenu').css("top", event.clientY + 5);
    $('#carouselContextMenu').css("left", event.clientX);
    $('#ctxModelName').html(carouselItemArray[imageIndex].FolderName);
    $('#carouselContextMenu').fadeIn();
}

function carouselContextMenuAction(ctxMenuAction) {
    switch (ctxMenuAction) {
        case "showDialog":
            $('#carouselContextMenu').fadeOut();
            showFolderInfoDialog(selectedImageArchiveFolderId, "carousel context menu");
            break;
        case "explode":
            reportThenPerformEvent("EXP", "from main carousel", carouselItemArray[imageIndex].Link, carouselItemArray[imageIndex].FolderId);
            break;
        case "comment":
            $('#carouselContextMenu').fadeOut();
            imageCommentDialogIsOpen = true;
            pause();
            $('#carouselContextMenu').fadeOut();
            showImageCommentDialog(carouselItemArray[imageIndex].Link,
                carouselItemArray[imageIndex].LinkId,
                carouselItemArray[imageIndex].FolderId,
                carouselItemArray[imageIndex].FolderName, "Carousel");

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
            if (document.domain === "localHost")
                alert("carouselContextMenuAction: Invalid context menu action");
            else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: "Invalid context menu action",
                    PageId: homePageId,
                    CalledFrom: "loadImages"
                });
            //sendEmailToYourself("Invalid context menu action", "invalid: " + ctxMenuAction);
        //alert("invalid: " + ctxMenuAction);
    }
}

function onImageNotLoaded() {
    //sendEmailToYourself("onImageNotLoaded", "bk image " + carouselItemArray[imageIndex].Link + " not found");
    if (document.domain === "localHost")
        alert("onImageNotLoaded");
    else
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "ERR",
            Severity: 1,
            ErrorMessage: "onImageNotLoaded",
            PageId: homePageId,
            CalledFrom: "onImageNotLoaded"
        });
}

function slowlyShowFolderCategoryDialog() {
    setTimeout(function () {
        if (forgetShowingCatDialog === false) {
            if (typeof pause === 'function')
                pause();
            folderCategoryDialogIsOpen = true;
            showFolderInfoDialog(carouselItemArray[imageIndex].FolderId, "carousel slowly");
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
        "   <input class='carouselCheckbox' id='ckCenterfold' type='checkbox'/> Include Centerfolds<br/>\n" +
        "   <input class='carouselCheckbox' id='ckArchive' type='checkbox'/> Include Archive<br/>\n" +
        "   <input class='carouselCheckbox' id='ckPorn' type='checkbox'/> Include porn<br/>\n" +
        "   <input class='carouselCheckbox' id='ckLandscape' type='checkbox'/> allow landscape size<br/>\n" +
        "   <input class='carouselCheckbox' id='ckPortrait' type='checkbox'/> allow portrait size<br/>\n" +
        "</div>\n");

    let lsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);

    $('#ckCenterfold').prop("checked", lsCarouselSettings.includeCenterfolds);
    $('#ckArchive').prop("checked", lsCarouselSettings.includeArchive);
    $('#ckPorn').prop("checked", lsCarouselSettings.includePorn);
    $('#ckLandscape').prop("checked", lsCarouselSettings.includeLandscape);
    $('#ckPortrait').prop("checked", lsCarouselSettings.includePortrait);
    $("#draggableDialog").css("width", 500);
    $("#draggableDialogTitle").html("Carousel Settings top: [" + $("#draggableDialog").attr("top") + "]");

    $('.carouselCheckbox').change(function () {
        //alert("this." + this.id + " checked: " + this.checked);

        setUserSettings("{porn:girl,ckCenterfold:no,ckArchive:yes,ckPorn:no,ckLandscape:yes,ckPortrait:no}");

        // update settings
        switch (this.id) {
            case "ckPortrait":
                lsCarouselSettings.includePortrait = this.checked;
                reloadAll();
                break;
            case "ckLandscape":
                lsCarouselSettings.includeLandscape = this.checked;
                reloadAll();
                break;
            case "ckArchive":
                lsCarouselSettings.includeArchive = this.checked;
                if(this.checked)
                    loadImages("archive", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
                else
                    removeItemsFromArray("archive");
                break;
            case "ckCenterfold":
                lsCarouselSettings.includeCenterfolds = this.checked;
                if (this.checked)
                    loadImages("centerfold", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
                else
                    removeItemsFromArray("centerfold");
                break;
            case "ckPorn":
                lsCarouselSettings.includePorn = this.checked;
                if (this.checked)
                    loadImages("porn", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
                else
                    removeItemsFromArray("porn");
                break;
            default:
        }

        var newCarouselSettings = {
            includeArchive: lsCarouselSettings.includeArchive,
            includeCenterfolds: lsCarouselSettings.includeCenterfolds,
            includePorn: lsCarouselSettings.includePorn,
            includeLandscape: lsCarouselSettings.includeLandscape,
            includePortrait: lsCarouselSettings.includePortrait
        };
        window.localStorage["carouselSettings"] = JSON.stringify(newCarouselSettings);

        function reloadAll() {
            if (lsCarouselSettings.includeArchive) {
                removeItemsFromArray("archive");
                loadImages("archive", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
            }
            if (lsCarouselSettings.includeCenterfolds) {
                removeItemsFromArray("centerfold");
                loadImages("centerfold", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
            }
            if (lsCarouselSettings.includePorn) {
                removeItemsFromArray("porn");
                loadImages("porn", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
            }
        }
    });

    //pause();
    $('#draggableDialog').css("top", event.clientY - 75);
    $('#customMessageContainer').css("left", event.clientX - 100);
    $("#draggableDialog").fadeIn();
}

function removeItemsFromArray(rootFolder) {
    var numRemoved = 0;
    for (idx = 0; idx < carouselItemArray.length; idx++) {
        if (carouselItemArray[idx].RootFolder === rootFolder) {
            carouselItemArray.splice(idx, 1);
            numRemoved++;
        }
    }
    console.log("Removed " + numRemoved + " links of type: " + rootFolder);
    $('#footerMessage').html("total carousel items: " + carouselItemArray.length.toLocaleString());
}

function assuranceArrowClick(direction) {
    //reportEvent(eventCode, calledFrom, eventDetail, pageId) {
    reportEvent("CAA", carouselItemArray[imageIndex].LinkId, "direction: " + direction,  homePageId);
    if (direction === "foward") {
        newImageIndex = Math.floor(Math.random() * carouselItemArray.length);
        intervalBody(newImageIndex);
        resume();
    }
    else {
        pause();
        //imageHistory.pop();
        imageHistory.pop();
        intervalBody(imageHistory.pop());
    }
}

//public class vwCarouselItem {
//    public string RootFolder { get; set; }
//    public int FolderId { get; set; }
//    public string FolderName { get; set; }
//    public string FolderParent { get; set; }
//    public int FolderParentId { get; set; }
//    public string FolderGP { get; set; }
//    public int FolderGPId { get; set; }
//    public int ImageFolderId { get; set; }
//    public string ImageFolder { get; set; }
//    public string ImageFolderParent { get; set; }
//    public int ImageFolderParentId { get; set; }
//    public string ImageFolderGP { get; set; }
//    public int ImageFolderGPId { get; set; }
//    public string LinkId { get; set; }
//    public string Link { get; set; }
//    public int Width { get; set; }
//    public int Height { get; set; }
//}
