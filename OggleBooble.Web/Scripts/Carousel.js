﻿let imageIndex = 0, numImages = 0, numFolders = 0, rotationSpeed = 7000, intervalSpeed = 600,
    carouselItemArray = [], imageHistory = [], imageHistoryArrayCount = 0, absolueStart,
    vCarouselInterval = null, carouselImageViews = 0, carouselImageErrors = 0,
    mainImageClickId, knownModelLabelClickId, imageTopLabelClickId, footerLabelClickId,
    imgSrc, jsCarouselSettings, nextRoot = 1, specialLaunchCode = 112;
let debugMode = false;

function launchCarousel(startRoot) {
    absolueStart = Date.now();
    $('#footerMessage2').html("launching carousel");

    if (isNullorUndefined(window.localStorage["carouselSettings"]))
    {
        lsCarouselSettings = {
            includeArchive: false,
            includeCenterfolds: false,
            includePorn: false,
            includeSoftcore: true,
            includeLandscape: true,
            includePortrait: false
        };
        window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);
        console.log("default carouselSettings loaded int local storage");
    }
    else {
        console.log("carouselSettings found in local storage!");
    }
    jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
    //initial call to loadimages
    console.log("calling loadImages");
    loadImages(startRoot, absolueStart, 0, specialLaunchCode, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
    window.addEventListener("resize", resizeCarousel);
}

function loadImages(rootFolder, absolueStart, carouselSkip, carouselTake, includeLandscape, includePortrait) {
    settingsImgRepo = settingsArray.ImageRepo;
    try {
        if (carouselTake === specialLaunchCode) {
            //alert("carouselTake(" + carouselTake + ") === specialLaunchCode(" + specialLaunchCode + ")");
            console.log("carouselTake === specialLaunchCode");
            if (!isNullorUndefined(window.localStorage["carouselCache"])) {
                let carouselCacheArray = JSON.parse(window.localStorage["carouselCache"]);
                $.each(carouselCacheArray, function (idx, obj) {
                    carouselItemArray.push(obj);
                });
                $('.carouselFooter').css("visibility", "hidden");
                if (vCarouselInterval)
                    alert("carousel interval already started")
                else {
                    $('#topIndexPageSection').html(carouselHtml());
                    $('#thisCarouselImage').show();

                    imgSrc = settingsImgRepo + carouselItemArray[imageIndex].FileName;
                    $('#thisCarouselImage').attr('src', imgSrc);
                    $('#carouselImageContainer').show();
                    $('#thisCarouselImage').show();
                    resizeIndexPage();
                    //resizeCarousel();

                    //alert("proper call from load carouselCache")
                    startCarousel("carouselCache: " + carouselTake);
                }
                console.log("startCarousel");
                let delta = (Date.now() - absolueStart) / 1000;
                if (debugMode) $('#hdrBtmRowSec3').html("initial launch from cache took: " + delta.toFixed(3) + " total initial items: " + carouselItemArray.length.toLocaleString());
                $('#footerMessage2').html("initial launch from cache took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                carouselSkip += 100;
            }
        }
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/IndexPage/GetCarouselImages?root=" + rootFolder + "&skip=" + carouselSkip + "&take=" + carouselTake +
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
                            FirstChild: obj.FirstChild,
                            ImageFolderRoot: obj.ImageFolderRoot,
                            ImageFolderParentName: obj.ImageFolderParentName,
                            ImageFolderParentId: obj.ImageFolderParentId,
                            ImageFolderGPName: obj.ImageFolderGPName,
                            ImageFolderGPId: obj.ImageFolderGPId,
                            LinkId: obj.LinkId,
                            FileName: obj.FileName
                        });
                    });

                    if (carouselTake === specialLaunchCode) {
                        if (isNullorUndefined(window.localStorage["carouselCache"])) {
                            console.log("isNullorUndefined(window.localStorage[carouselCache])");

                            $('#topIndexPageSection').html(carouselHtml());
                            $('.carouselFooter').css("visibility", "hidden");
                            //if (carouselItemArray.length === 0) alert("ix00");
                            startCarousel("GetCarouselImages?root=" + rootFolder);
                            delta = (Date.now() - absolueStart) / 1000;
                            $('#footerMessage2').html("initial launch took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());

                            let jsnObj = "[";  //new JSONArray();
                            for (i = 0; i < 101; i++) {
                                jsnObj += (JSON.stringify(carouselItemArray[i])) + ",";
                            }
                            window.localStorage["carouselCache"] = jsnObj.substring(0, jsnObj.length - 1) + "]";
                        }
                    }
                    if (carouselInfo.Links.length === carouselTake) {
                        carouselSkip += carouselTake;
                        carouselTake = 2000;

                        //alert("loadImages recurr.  carouselTake: " + carouselTake);
                        loadImages(rootFolder, absolueStart, carouselSkip, 2000, includeLandscape, includePortrait);
                        if (carouselTake !== specialLaunchCode)
                            $('#footerMessage2').html(carouselSkip + "  " + rootFolder + " loaded");
                    }
                    else {
                        addMoreRootsToCarousel();
                        //console.log("loadImages(" + rootFolder + ") DONE!! took: " + delta.toFixed(3) + " total: " + carouselItemArray.length.toLocaleString());
                    }
                }
                else {
                    logError("BUG", rootFolder, carouselInfo.Success, "carousel.loadImages");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("carousel.loadImages"))
                    logError("XHR", rootFolder, getXHRErrorDetails(jqXHR), "carousel.loadImages");
            }
        });
    } catch (e) {
        logError("CAT",rootFolder, e, "carousel.loadImages");
    }
}

function addMoreRootsToCarousel() {
    if (nextRoot === 1) {
        nextRoot = 2;
        if (jsCarouselSettings.includeArchive) {
            $('#footerMessage2').html("loading archive");
            console.log("loading archive");
            alert("loading archive");
            loadImages("archive", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            return;
        }
    }
    if (nextRoot === 2) {
        nextRoot = 3;
        if (jsCarouselSettings.includeCenterfolds) {
            $('#footerMessage2').html("loading centerfolds");
            console.log("loading centerfolds ");
            alert("loading centerfolds ");
            carouselSkip = 0;
            loadImages("centerfold", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            return;
        }
    }
    if (nextRoot === 3) {
        nextRoot = 4;
        if (jsCarouselSettings.includeSoftcore) {
            $('#footerMessage2').html("loading soft core");
            carouselSkip = 0;
            loadImages("soft", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            return;
        }
    }
    if (nextRoot === 4) {
        nextRoot = 5;
        if (jsCarouselSettings.includePorn) {
            if (jsCarouselSettings.includePorn) {
                $('#footerMessage2').html("loading sluts");
                carouselSkip = 0;
                loadImages("sluts", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
                return;
            }
        }
    }
    if (nextRoot === 5) {
        nextRoot = 6;
        if (jsCarouselSettings.includePorn) {
            if (jsCarouselSettings.includePorn) {
                $('#footerMessage2').html("loading porn");
                loadImages("porn", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
                return;
            }
        }
    }
    if (nextRoot === 6) {
        let delta = (Date.now() - absolueStart) / 1000;
        console.log("loadImages DONE!! took: " + delta.toFixed(3) + " total: " + carouselItemArray.length.toLocaleString());
        $('#footerMessage2').html("loadImages DONE!! took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
        setTimeout(function () { $('#footerMessage2').html("") }, 12000);
    }
}

function startCarousel(calledFrom) {
    //alert("inside startCarousel(" + calledFrom + ")");
    if (vCarouselInterval)
        alert("carousel interval already started")
    else {
        $('.assuranceArrows').show();
        //alert("starting inverval startCarousel(" + calledFrom + ")");
        vCarouselInterval = setInterval(function () {
            intervalBody();
        }, rotationSpeed);
    }
}

function alreadyInLast100(idx) {
    let idxStart = Math.max(0, carouselItemArray.length - 100);
    for (i = idxStart; i < imageHistory.length; i++) {
        if (idx === imageHistory[i]) {
            alert("Already shown try again")
            imageIndex = Math.floor(Math.random() * carouselItemArray.length);
            break;
        }
    }
}

function intervalBody() {
    imageIndex = Math.floor(Math.random() * carouselItemArray.length);
    alreadyInLast100(imageIndex);
    $('.carouselFooter').css("visibility", "hidden");
    $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
        imgSrc = settingsImgRepo + carouselItemArray[imageIndex].FileName;
        $('#thisCarouselImage').attr('src', imgSrc).load(function () {
            $('#carouselFooter').fadeIn();
            setLabelLinks();
            //imageHistory.push("'" + carouselItemArray[imageIndex].FileName + "'");
            imageHistory.push("'" + imageIndex + "'");
            $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
            //if (debugMode) $('#hdrBtmRowSec3').html(".len: " + imageHistory.length);
            //if (debugMode) $('#hdrBtmRowSec3').append("  Count: " + imageHistoryArrayCount);
            //if (debugMode) $('#hdrBtmRowSec3').append("  a[" + imageHistoryArrayCount + "]: " + imageHistory[imageHistoryArrayCount]);
            
            $('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
            imageHistoryArrayCount++;
        });
    });
}

function setLabelLinks() {
    $('#knownModelLabel').html("").hide();
    $('#carouselFooterLabel').html("").hide();
    $('#imageTopLabel').html("").hide();
    if (carouselItemArray[imageIndex].FolderId === carouselItemArray[imageIndex].ImageFolderId) {
        if (!containsRomanNumerals(carouselItemArray[imageIndex].ImageFolderName)) {
            // noraml
            mainImageClickId = carouselItemArray[imageIndex].FolderId;

            $('#knownModelLabel').html(carouselItemArray[imageIndex].FolderParentName);
            knownModelLabelClickId = carouselItemArray[imageIndex].FolderParentId;

            $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderName)
            imageTopLabelClickId = carouselItemArray[imageIndex].FolderId;

            $('#carouselFooterLabel').html(carouselItemArray[imageIndex].FolderGPName);
            footerLabelClickId = carouselItemArray[imageIndex].FolderGPId;

            if (debugMode) $('#headerMessage').html("1");

            if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].FirstChild);
                if (debugMode) $('#headerMessage').append("P");
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
            if (debugMode) $('#headerMessage').html("RNS");

            if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                $('#imageTopLabel').html("Playboy Playmate2: " + carouselItemArray[imageIndex].FirstChild);
                $('#knownModelLabel').html(carouselItemArray[imageIndex].Folder);
                if (debugMode) $('#headerMessage').append("P");
                imageTopLabelClickId = carouselItemArray[imageIndex].ImageFolderParentId;
                //pause();
                //setTimeout(function () { alert("roman shift.  imageTopLabelClickId: " + imageTopLabelClickId); }, 600);
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
            if (debugMode) $('#headerMessage').html("LN3");
            if (carouselItemArray[imageIndex].RootFolder === "centerfold") {
                $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderName);
                $('#imageTopLabel').html("Playboy Playmate: " + carouselItemArray[imageIndex].ImageFolderParentName);
                if (debugMode) $('#headerMessage').append("P");

                //$('#carouselFooterLabel').html("Playboy");
                //footerLabelClickId = 472;

                //$('#headerMessage').html(" 3P non folder member");
                //pause();
                //setTimeout(function () { alert("non folder member 3. centerfold\nroot: " + carouselItemArray[imageIndex].RootFolder) }, 600);
            }
        }
        else {  // roman numeral shift
            mainImageClickId = carouselItemArray[imageIndex].FolderId;

            $('#imageTopLabel').html(carouselItemArray[imageIndex].FolderName);
            imageTopLabelClickId = carouselItemArray[imageIndex].FolderId;
            //$('#imageTopLabel').html(carouselItemArray[imageIndex].FolderGPName);
            //imageTopLabelClickId = carouselItemArray[imageIndex].FolderGPId;
            
            $('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderName);
            knownModelLabelClickId = carouselItemArray[imageIndex].ImageId;
            //$('#knownModelLabel').html(carouselItemArray[imageIndex].ImageFolderParentName);
            //knownModelLabelClickId = carouselItemArray[imageIndex].ImageFolderParentId;

            $('#carouselFooterLabel').html(carouselItemArray[imageIndex].ImageFolderGPName);
            footerLabelClickId = carouselItemArray[imageIndex].ImageFolderGPId;;
            //$('#carouselFooterLabel').html(carouselItemArray[imageIndex].ImageFolderGPName);
            //footerLabelClickId = carouselItemArray[imageIndex].ImageFolderGPId;;

            //ImageFolderGPName
            //ImageFolderGPId
            //FolderGPName
            //FolderGPId

            if (debugMode) $('#headerMessage').html("RNS4");
            //pause();
            //setTimeout(function () { alert("4 Non Roman Numeral Non folder member") }, 600);
        }
    }
    $('#carouselFooterLabel').fadeIn();
    $('#imageTopLabel').fadeIn();
    $('#knownModelLabel').fadeIn();
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
    $('.carouselFooter').css("visibility", "visible");
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    startCarousel("clickSpeed");
}
function togglePause() {
    if ($('#pauseButton').html() === "||")
        pause();
    else {
        resume();
    }
}
function pause() {
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    $('#pauseButton').html(">");
}
function resume() {
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    startCarousel("resume");
    $('#pauseButton').html("||");
}

function showCarouelSettingsDialog() {
    $("#oggleDialogTitle").html("Carousel Settings");
    $("#draggableDialogContents").html(
        "<div class='carouselSettingsDialog'>\n"+
        "   <input type='checkbox' id='ckCenterfold'/> Include Centerfolds<br/>\n" +
        "   <input type='checkbox' id='ckArchive'/> Include Archive<br/>\n" +
        "   <input type='checkbox' id='ckSoftcore'/> Include softcore<br/>\n" +
        "   <input type='checkbox' id='ckPorn'/> Include porn<br/>\n" +
        "   <input type='checkbox' id='ckLandscape'/> allow landscape size<br/>\n" +
        "   <input type='checkbox' id='ckPortrait'/> allow portrait size<br/>\n" +
        "</div>\n");
    $("#draggableDialog").css("width", 300);
    $('#draggableDialog').css("top", event.clientY - 75);
    $('#customMessageContainer').css("left", event.clientX - 100);
    pause();
    $("#draggableDialog").fadeIn();
    let lsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);

    $('#ckCenterfold').prop("checked", lsCarouselSettings.includeCenterfolds);
    $('#ckArchive').prop("checked", lsCarouselSettings.includeArchive);
    $('#ckPorn').prop("checked", lsCarouselSettings.includePorn);
    $('#ckSofcore').prop("checked", lsCarouselSettings.includeSoftcore);
    $('#ckLandscape').prop("checked", lsCarouselSettings.includeLandscape);
    $('#ckPortrait').prop("checked", lsCarouselSettings.includePortrait);

    $("input[type='checkbox']").change(function () {
        let visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            displayStatusMessage("warning", "You must be logged in for settings to persist");
        }
        else {

            updateUserSettings(visitorId, "CarouselSettings", lsCarouselSettings)

            console.log("this." + this.id + " checked: " + this.checked);

            //window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);
            //let lsCarouselSettings = window.localStorage["carouselSettings"];

            if (this.checked)
                addItemsToArray(this.Id);
            else
                removeItemsFromArray(this.Id);

            //loadImages("archive", Date.now(), 0, 500, lsCarouselSettings.includeLandscape, lsCarouselSettings.includePortrait);
            displayStatusMessage("ok", "centerfolds added to carousel");
            let numImagesRemoved = removeItemsFromArray("centerfold");
            $('#headerMessage').html(numImagesRemoved + "centerfold images removed");
            displayStatusMessage("ok", numImagesRemoved + "centerfold images removed");

            //let lsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
            // save carousel setting to mission

            // update settings
            window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);
        }
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
    $('#footerMessage2').html("total carousel items: " + carouselItemArray.length.toLocaleString());
    return numRemoved;
}

function assuranceArrowClick(direction) {
    //reportEvent(eventCode, calledFrom, eventDetail, pageId) {
    reportEvent("CAA", carouselItemArray[imageIndex].LinkId, "direction: " + direction,  3908);
    if (direction === "foward") {
        resume();
    }
    else {
        pause();
        //alert("imageHistory.len: " + imageHistory.length);

        imageHistory.pop();
        imageHistory.pop();

        imgSrc = settingsImgRepo + carouselItemArray[imageHistory.pop()].FileName;
        $('#thisCarouselImage').attr('src', imgSrc).load(function () {
            $('#carouselFooter').fadeIn();
            setLabelLinks();
            $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
            $('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        });
        //intervalBody(imageHistory.pop());
    }
}
function clickViewGallery(labelClick) {
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    switch (labelClick) {
        case 1:  // carousel main image
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolderName, "main image", mainImageClickId);
            break;
        case 2: // top imageTopLabel
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolderName, "image top label", imageTopLabelClickId);
            break;
        case 3: // knownModelLabel
            rtpe("CIC", carouselItemArray[imageIndex].ImageFolderName, "knownModelLabel", knownModelLabelClickId);
            break;
        case 4: // footer 
            reportThenPerformEvent("CPC", carouselItemArray[imageIndex].ImageFolderName, "clickViewParentGallery", footerLabelClickId);
            break;
        default:
    }
}
function carouselContextMenu() {
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("Carousel", pos, imgSrc,
        carouselItemArray[imageIndex].LinkId,
        carouselItemArray[imageIndex].FolderId,
        carouselItemArray[imageIndex].FolderName);
}

function imgErrorThrown() {
    //" + imageIndex + "
    //carouselItemArray[imageIndex].FileName;
    $('#thisCarouselImage').attr('src', "Images/redballon.png");
    carouselImageViews -= 1;
    carouselImageErrors++;
    pause();
    logDataActivity({
        VisitorId: getCookieValue("VisitorId"),
        ActivityCode: "IME",
        PageId: carouselItemArray[imageIndex].FolderId,
        Activity: carouselItemArray[imageIndex].LinkId
    });
    console.log("image error\npage: " + carouselItemArray[imageIndex].FolderId +
        ",\nPageName: " + carouselItemArray[imageIndex].FolderName +
        ",\nActivity: " + carouselItemArray[imageIndex].LinkId);
}
function carouselHtml() {
    return "<div class='centeringOuterShell'>\n" +
        "   <div id='innerCarouselContainer'  class='centeringInnerShell'>\n" +
        "      <div id='carouselImageContainer' class='carouselImageContainer flexContainer'>\n" +
        "          <img class='assuranceArrows' onclick='assuranceArrowClick(\"back\")' src='/Images/leftArrowOpaque02.png'/>\n" +
        "          <div id='knownModelLabel' class='knownModelLabel' onclick='clickViewGallery(3)'></div>\n" +
        "          <div id='imageTopLabel' class='categoryTitleLabel' onclick='clickViewGallery(2)'></div>\n" +
        "          <img id='thisCarouselImage' class='carouselImage' src='/Images/ingranaggi3.gif' " +
        "               onerror='imgErrorThrown()'" +
        "               oncontextmenu='carouselContextMenu()'" +
        "               onclick='clickViewGallery(1)' />\n" +
        "          <img class='assuranceArrows' onclick='assuranceArrowClick(\"foward\")' src='/Images/rightArrowOpaque02.png'/>\n" +
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
