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
var rootsLoaded = [];
var carouselImageViews = 0;
var carouselImageErrors = 0;
var mainImageClickId;
var knownModelLabelClickId;
var imageTopLabelClickId;
var footerLabelClickId;
let settingsImgRepo = settingsArray.ImageRepo;
let imgSrc;

function launchCarousel(startRoot) {
    //$('#footerMessage').html("launching carousel");
    $('#carouselContainer').html(carouselHtml());
    resizeCarousel();
    var jsCarouselSettings;
    if (isNullorUndefined(window.localStorage["carouselSettings"])) {
        lsCarouselSettings = {
            includeArchive: true,
            includeCenterfolds: true,
            includePorn: false,
            includeLandscape: true,
            includePortrait: false
        };
        window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);
    }
    else {
        console.log("carouselSettings found in local storage!");
        //alert("lsCarouselSettings: " + jsCarouselSettings + "\ncarouselSettings.includeLandscape: " + jsCarouselSettings.includeLandscape);
    }
    jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);

    //alert("loadImages");

    loadImages(startRoot, Date.now(), 0, 500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
    if (startRoot === "boobs") {
        if (jsCarouselSettings.includeArchive) {
            loadImages("archive", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
        }
        if (jsCarouselSettings.includeCenterfolds) {
            loadImages("centerfold", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
        }
    }
    if (startRoot === "porn") {
        //if (jsCarouselSettings.includePorn) {
            loadImages("sluts", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
        //}
    }
    window.addEventListener("resize", resizeCarousel);
}

var skip = 0;
function loadImages(rootFolder, absolueStart, skip, take, includeLandscape, includePortrait) {
    var start = Date.now();
    settingsImgRepo = settingsArray.ImageRepo;
    try {
        //$('#imageTopLabel').hide();
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
                            Id: obj.Id,
                            FolderId: obj.FolderId,
                            RootFolder: obj.RootFolder,
                            FolderName: obj.FolderName,
                            FolderParentName: obj.FolderParentName,
                            FolderParentId: obj.FolderParentId,
                            FolderGPName: obj.FolderGPName,
                            FolderGPId: obj.FolderGPId,
                            ImageFolderId: obj.ImageFolderId,
                            ImageFolderName: obj.ImageFolderName,
                            ImageFolderRoot: obj.ImageFolderRoot,
                            ImageFolderParentName: obj.ImageFolderParentName,
                            ImageFolderParentId: obj.ImageFolderParentId,
                            ImageFolderGPName: obj.ImageFolderGPName,
                            ImageFolderGPId: obj.ImageFolderGPId,
                            LinkId: obj.LinkId,
                            FileName: obj.FileName
                        });
                        //alert("carouselItemArray.push[ " + idx + " ]");
                    });

                    if (take === 500) {
                        newImageIndex = Math.floor(Math.random() * carouselItemArray.length);
                        startCarousel(newImageIndex);
                        $('#carouselFooter').show();
                        resizeCarousel();
                    }

                    var delta = (Date.now() - start) / 1000;
                    if (carouselInfo.Links.length === take) {
                        skip += take;
                        take = 2000;
                        //console.log("loadImages(" + rootFolder + ") skip: " + skip + " take  " + take + " took: " + delta.toFixed(3));
                        loadImages(rootFolder, absolueStart, skip + take, take, includeLandscape, includePortrait);
                        $('#footerMessage').html(rootFolder + " carousel items loaded: " + carouselItemArray.length + " skip: " + skip);
                    }
                    else {
                        // done

                        rootsLoaded.push(rootFolder);
                        delta = (Date.now() - absolueStart) / 1000;
                        console.log("loadImages(" + rootFolder + ") DONE!! took: " + delta.toFixed(3) + " total: " + carouselItemArray.length.toLocaleString());
                        $('#footerMessage').html("total carousel items: " + carouselItemArray.length.toLocaleString());
                    }
                }
                else {
                    if (document.domain === "localhost")
                        alert("carousel.loadImages: " + carouselInfo.Success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "CSL",
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
                if (!checkFor404(errorMessage, "loadImages")) {
                    if (document.domain === "localhost")
                        alert("Carousel loadImages:\n" + errorMessage);
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

function setLabelLinks() {
    if (carouselItemArray[imageIndex].FolderId === carouselItemArray[imageIndex].ImageFolderId) {
        if (!containsRomanNumerals(carouselItemArray[imageIndex].ImageFolderName)) {
            // noraml
            $('#knownModelLabel').html(carouselItemArray[imageIndex].FolderName);
            //$('#knownModelLabel').html("");
            $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderParentName)
            $('#carouselFooterLabel').html(carouselItemArray[imageIndex].FolderGPName);
            mainImageClickId = carouselItemArray[imageIndex].FolderId;
            imageTopLabelClickId = carouselItemArray[imageIndex].FolderParentId;
            footerLabelClickId = carouselItemArray[imageIndex].FolderGPId;
            knownModelLabelClickId = carouselItemArray[imageIndex].FolderId;
            //$('#headerMessage').html("1");

            if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderGPName);
                //$('#headerMessage').append("P");
            }

        }
        else { // roman shift
            $('#knownModelLabel').html(carouselItemArray[imageIndex].FolderParentName);
            $('#imageTopLabel').html(carouselItemArray[imageIndex].ImageFolderGPName)
            $('#carouselFooterLabel').html(carouselItemArray[imageIndex].RootFolder);
            footerLabelClickId = getRootFolderId(carouselItemArray[imageIndex].RootFolder);
            mainImageClickId = carouselItemArray[imageIndex].ImageFolderParentId;
            knownModelLabelClickId = carouselItemArray[imageIndex].FolderId;  //  the roman
            imageTopLabelClickId = carouselItemArray[imageIndex].ImageFolderGPId;
            //$('#headerMessage').html("2");

            if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderParentName);
                $('#knownModelLabel').html(carouselItemArray[imageIndex].Folder);
                //$('#headerMessage').append("P");
                imageTopLabelClickId = carouselItemArray[imageIndex].ImageFolderParentId;
                //pause();
                //setTimeout(function () { alert("roman shift " + $('#headerMessage').html() + ".  imageTopLabelClickId: " + imageTopLabelClickId); }, 600);
            }
        }
    }
    else { // we have a link
        if (!containsRomanNumerals(carouselItemArray[imageIndex].ImageFolderName)) {
            $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderName);
            $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderName)
            $('#carouselFooterLabel').html(carouselItemArray[imageIndex].ImageFolderParentName);
            mainImageClickId = carouselItemArray[imageIndex].ImageFolderId;
            knownModelLabelClickId = carouselItemArray[imageIndex].ImageFolderId;
            imageTopLabelClickId = carouselItemArray[imageIndex].FolderId;
            footerLabelClickId = getRootFolderId(carouselItemArray[imageIndex].ImageFolderParentId);
            //$('#headerMessage').html("3");
            if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderName);
                $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderParentName);                

                //$('#carouselFooterLabel').html("Playboy");
                //footerLabelClickId = 472;

                //$('#headerMessage').html(" 3P non folder member");
                //pause();
                //setTimeout(function () { alert("non folder member 3. centerfold\nroot: " + carouselItemArray[imageIndex].RootFolder) }, 600);
            }
        }
        else {  // roman numeral shift
            $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderParentName);
            $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderGPName);
            $('#carouselFooterLabel').html(carouselItemArray[imageIndex].RootFolder);
            knownModelLabelClickId = carouselItemArray[imageIndex].ImageFolderParentId;
            mainImageClickId = carouselItemArray[imageIndex].FolderParentId;
            imageTopLabelClickId = carouselItemArray[imageIndex].FolderGPId;
            footerLabelClickId = getRootFolderId(carouselItemArray[imageIndex].RootFolder);
            //$('#headerMessage').html("4");
            //pause();
            //setTimeout(function () { alert("4 Non Roman Numeral Non folder member") }, 600);
        }
    }
}

function imgErrorThrown(index) {
    $('#thisCarouselImage').attr('src', "Images/redballon.png");
    carouselImageViews -= 1;
    carouselImageErrors++;
    pause();
    //alert("Missig Image: " + carouselItemArray[imageIndex].FolderId + ", " + carouselItemArray[imageIndex].FolderName + "\nlinkId: " + carouselItemArray[imageIndex].LinkId);
    logDataActivity({
        PageId: carouselItemArray[imageIndex].FolderId,
        PageName: carouselItemArray[imageIndex].FolderName,
        Activity: carouselItemArray[imageIndex].LinkId
    });
}
// function doneLoggingDataActivity() { };

function intervalBody(newImageIndex) {
    //alert("intervalBody");

    imageIndex = newImageIndex;
    $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
        imgSrc = settingsImgRepo + carouselItemArray[imageIndex].FileName;
        $('#thisCarouselImage').attr('src', imgSrc);
        $('#knownModelLabel').html("").hide();
        $('#carouselFooterLabel').html("").hide();
        $('#imageTopLabel').html("").hide();

        setLabelLinks();

        $('#carouselFooterLabel').fadeIn();
        $('#imageTopLabel').fadeIn();
        $('#knownModelLabel').fadeIn();
        imageHistory.push(imageIndex);
        $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });

        $('#footerMessage').html("image " + imageIndex + " of " + carouselItemArray.length.toLocaleString());
        //console.log("image views: " + carouselImageViews);
        $('#headerMessage').html("viewed ok: " + ++carouselImageViews + " errors: " + carouselImageErrors);
        //$('#footerMessage').append(".  carousel image viewed: " + carouselImageViews);
    });
}

function clickViewGallery(labelClick) {
    clearInterval(CarouselInterval);
    switch (labelClick) {
        case 1:  // carousel main image
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + mainImageClickId);
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolderName, "main image", mainImageClickId);
            break;
        case 2: // top imageTopLabel
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + imageTopLabelClickId);
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolderName, "image top label", imageTopLabelClickId);    
            break;
        case 3: // knownModelLabel
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + knownModelLabelClickId);
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolderName, "knownModelLabel", knownModelLabelClickId);
            break;
        case 4: // footer 
            //if (document.domain === 'localhost') alert("labelClick: " + labelClick + " page: " + footerLabelClickId);
            reportThenPerformEvent("CPC", carouselItemArray[imageIndex].ImageFolderName, "clickViewParentGallery", footerLabelClickId);
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
    var carouselFooterHeight = 40;
    $('#thisCarouselImage').height($('#topIndexPageSection').height() - carouselFooterHeight);
    $('.carouselFooter').width($('#thisCarouselImage').width());
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
    imageIndex = Math.floor(Math.random() * carouselItemArray.length);
    startCarousel(imageIndex);
    $('#pauseButton').html("||");
}


function showCarouelSettingsDialog() {
    $("#draggableDialogTitle").html("Carousel Settings");
    $("#draggableDialogContents").html(
        "<div class='carouselSettingsDialog'>\n"+
        "   <input class='carouselCheckbox' id='ckCenterfold' type='checkbox'/> Include Centerfolds<br/>\n" +
        "   <input class='carouselCheckbox' id='ckArchive' type='checkbox'/> Include Archive<br/>\n" +
        "   <input class='carouselCheckbox' id='ckPorn' type='checkbox'/> Include porn<br/>\n" +
        "   <input class='carouselCheckbox' id='ckLandscape' type='checkbox'/> allow landscape size<br/>\n" +
        "   <input class='carouselCheckbox' id='ckPortrait' type='checkbox'/> allow portrait size<br/>\n" +
        "</div>\n");

    $("#draggableDialog").css("width", 300);
    //$("#draggableDialogTitle").html("Carousel Settings top: [" + $("#draggableDialog").attr("top") + "]");
    $('#draggableDialog').css("top", event.clientY - 75);
    $('#customMessageContainer').css("left", event.clientX - 100);
    pause();
    $("#draggableDialog").fadeIn();

    let lsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);

    $('#ckCenterfold').prop("checked", lsCarouselSettings.includeCenterfolds);
    $('#ckArchive').prop("checked", lsCarouselSettings.includeArchive);
    $('#ckPorn').prop("checked", lsCarouselSettings.includePorn);
    $('#ckLandscape').prop("checked", lsCarouselSettings.includeLandscape);
    $('#ckPortrait').prop("checked", lsCarouselSettings.includePortrait);

    $('.carouselCheckbox').change(function () {
        alert("this." + this.id + " checked: " + this.checked);
        //window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);

        //let lsCarouselSettings = window.localStorage["carouselSettings"];

        //var lsCarouselSettings = {
        //    includeArchive: lsCarouselSettings.includeArchive,
        //    includeCenterfolds: lsCarouselSettings.includeCenterfolds,
        //    includePorn: lsCarouselSettings.includePorn,
        //    includeLandscape: lsCarouselSettings.includeLandscape,
        //    includePortrait: lsCarouselSettings.includePortrait
        //};

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
                if (this.checked)
                    loadImages("archive", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
                else
                    removeItemsFromArray("archive");
                break;
            case "ckCenterfold":
                lsCarouselSettings.includeCenterfolds = this.checked;
                if (this.checked) {
                    loadImages("centerfold", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
                    displayStatusMessage("ok", "centerfolds added to carousel");
                }
                else {
                    let numImagesRemoved = removeItemsFromArray("centerfold");
                    $('#headerMessage').html(numImagesRemoved + "centerfold images removed");
                    displayStatusMessage("ok", numImagesRemoved + "centerfold images removed");
                }
                break;
            case "ckPorn":
                lsCarouselSettings.includePorn = this.checked;
                if (this.checked) {
                    loadImages("porn", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
                }
                else {
                    let numImagesRemoved = removeItemsFromArray("porn");
                    $('#headerMessage').html(numImagesRemoved+ "porn images removed");
                    displayStatusMessage("ok", numImagesRemoved + "porn images removed");
                }
                break;
            default:
        }

        // update settings
        window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);

        let userName = getCookieValue("UserName");
        if (isNullorUndefined(userName))
            displayStatusMessage("warning", "You must be logged in for settings to persist");
        else
            updateUserSettings(userName, "CarouselSettings", lsCarouselSettings)
    });
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
    return numRemoved;
}

function assuranceArrowClick(direction) {
    //reportEvent(eventCode, calledFrom, eventDetail, pageId) {
    reportEvent("CAA", carouselItemArray[imageIndex].LinkId, "direction: " + direction,  homePageId);
    if (direction === "foward") {
        resume();
    }
    else {
        pause();
        //imageHistory.pop();
        imageHistory.pop();
        intervalBody(imageHistory.pop());
    }
}

function carouselHtml() {

    return "<div class='centeringOuterShell'>\n" +
        "   <div id='innerCarouselContainer'  class='centeringInnerShell'>\n" +
        "      <div id='carouselImageContainer' class='carouselImageContainer flexContainer'>\n" +
        "          <img class='assuranceArrows' onclick='assuranceArrowClick(\"back\")' src='/Images/leftArrowOpaque02.png' />\n" +
        "          <div id='knownModelLabel' class='knownModelLabel' onclick='clickViewGallery(3)'></div>\n" +
        "          <div id='imageTopLabel' class='categoryTitleLabel' onclick='clickViewGallery(2)'></div>\n" +
        "          <img id='thisCarouselImage' onerror='imgErrorThrown(" + imageIndex + ")' oncontextmenu='carouselContextMenuClick()' class='carouselImage' src='/Images/ingranaggi3.gif' onclick='clickViewGallery(1)' />\n" +
        "          <img class='assuranceArrows' onclick='assuranceArrowClick(\"foward\")' src='/Images/rightArrowOpaque02.png' />\n" +
        "      </div>\n" +
        "      <div id='carouselFooter' class='carouselFooter'>\n" +
        "          <img class='speedButton floatLeft' src='Images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
        "          <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
        "          <div id='carouselFooterLabel' class='carouselCategoryLabel' onclick='clickViewGallery(4)'></div>\n" +
        "          <img class='speedButton floatRight' src='Images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
        "          <img class='speedButton floatRight' src='Images/Settings-icon.png' title='carousel settings' onclick='showCarouelSettingsDialog()' />\n" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n";
}
