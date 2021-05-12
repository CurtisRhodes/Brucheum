const rotationSpeed = 7000, intervalSpeed = 600, carouselDebugMode = false;
let imageIndex = 0, numImages = 0, numFolders = 0, backArrowClicks = 0,
    carouselItemArray = [], imageHistory = [], absolueStartTime,
    carouselImageViews = 0, carouselImageErrors = 0, vCarouselInterval = null,
    mainImageClickId, knownModelLabelClickId, imageTopLabelClickId, footerLabelClickId,
    imgSrc, jsCarouselSettings, arryItemsShownCount = 0, carouselRoot, cacheCount = 115;

function launchCarousel(startRoot) {
    settingsImgRepo = settingsArray.ImageRepo;
    carouselRoot = startRoot;
    absolueStartTime = Date.now();
    imgSrc = "Images/redballon.png";
    $('#carouselContainer').html(carouselHtml());
    $('#pauseButton').html("||");
    carouselTake = 777;
    let carouselSkip = 0;
    imageIndex = 0;
    let lastStep = "o";
    try
    {
        loadCarouselSettingsIntoLocalStorage();
        jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
        window.addEventListener("resize", resizeCarousel);

        switch (startRoot) {
            case "centerfold":
                lastStep = "centerfold";
                if (!isNullorUndefined(window.localStorage["centerfoldCache"])) {
                    lastStep = "loading centerfold from centerfold cache";
                    //if (document.domain == "localhost") alert("loading centerfold from centerfold cache");
                    console.log("loading centerfold from centerfold cache");
                    let carouselCacheArray = JSON.parse(window.localStorage["centerfoldCache"]);
                    $.each(carouselCacheArray, function (idx, obj) {
                        carouselItemArray.push(obj);
                    });
                    carouselSkip = carouselItemArray.length;
                    startCarousel("centefold cache");
                    console.log("loaded " + carouselItemArray.length + " from centerfold cache");
                }
                else {
                    if (document.domain == "localhost") alert("no " + startRoot + " cache found");
                    console.log("no " + startRoot + " cache found");
                }
                break;
            case "boobs":
                lastStep = "boobs";
                if (!isNullorUndefined(localStorage["carouselCache"])) {
                    //alert("localStorage[carouselCache]: " + localStorage["carouselCache"]);
                    //localStorage.removeItem("carouselCache");
                    let carouselCacheArray = JSON.parse(localStorage["carouselCache"]);
                    $.each(carouselCacheArray, function (idx, obj) {
                        carouselItemArray.push(obj);
                    });
                    carouselSkip = carouselItemArray.length;
                    carouselSkip = carouselItemArray.length;
                    startCarousel("big naturals cache");
                }
                else
                    console.log("no " + startRoot + " cache found");
                break;
            case "porn":
                lastStep = "porn";
                if (!isNullorUndefined(window.localStorage["pornCache"])) {
                    console.log("loading porn from centerfold cache");
                    let carouselCacheArray = JSON.parse(window.localStorage["pornCache"]);
                    $.each(carouselCacheArray, function (idx, obj) {
                        carouselItemArray.push(obj);
                    });
                    carouselSkip = carouselItemArray.length;
                    startCarousel("porn cache");
                    console.log("loaded " + carouselItemArray.length + " from porn cache");
                }
                else
                    console.log("no " + startRoot + " cache found");
                break;
            default:
                lastStep = "SWT";
                logError("SWT", 222, startRoot, "launchCarousel");
        }
        lastStep = "jsCarouselSettings";
        if (isNullorUndefined(jsCarouselSettings)) {
            //alert("jsCarouselSettings NullorUndefined");
            loadImages(startRoot, carouselSkip, carouselTake, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            logError("BUG", startRoot, "jsCarouselSettings", "launchCarousel");
        }
        else
            loadImages(startRoot, carouselSkip, carouselTake, true, false);

        refreshCache(startRoot);
    }
    catch (e)
    {
        if (lastStep == "porn") {
            //if (e.indexOf("Unexpected token u in JSON at position 1") > 0)
            {
                localStorage.removeItem("pornCache");
                launchCarousel("porn");
            }
        }
        // SyntaxError: Unexpected token u in JSON at position 
        if (document.domain == "localHost") alert("launchCarousel CATCH: lastStep:" + lastStep + "  e: " + e);
        logError("CAT", startRoot, "lastStep:" + lastStep + "  e: " + e, "launchCarousel");
    }
}

function loadImages(rootFolder, carouselSkip, carouselTake, includeLandscape, includePortrait) {
    let startTime = Date.now();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Carousel/GetCarouselImages?root=" + rootFolder + "&skip=" + carouselSkip + "&take=" + carouselTake +
                "&includeLandscape=" + includeLandscape + "&includePortrait=" + includePortrait,
            success: function (carouselInfo) {
                if (carouselInfo.Success === "ok") {
                    let isAlreadyInArray = false;
                    $.each(carouselInfo.Links, function (idx, obj) {
                        isAlreadyInArray = false;
                        for (i = 0; i < carouselInfo.length; i++) {
                            if (obj.Id === carouselInfo[i].Id) {
                                if (carouselDebugMode) alert(obj.Id + " already in carouselItemArray: " + carouselItemArray.find(item => { item.Id == obj.Id }));
                                console.log(obj.Id + " already in carouselItemArray");
                                isAlreadyInArray = true;
                                if (document.domain == "localhost") alert(obj.Id + " already in carouselItemArray");
                            }
                        }
                        if (!isAlreadyInArray) {
                            carouselItemArray.push(obj);
                        }
                    });

                    if (!vCarouselInterval) {
                        if (document.domain == "localhost") alert("starting carousel from after ajax");

                        console.log("starting carousel from after ajax");
                        startCarousel("ajax");
                    }

                    //if ((carouselItemArray.length > (carouselSkip * 2)) && (carouselItemArray.length < (carouselSkip * 3)))

                    if (carouselInfo.Links.length === carouselTake) {
                        //console.log("loadImages. " + rootFolder + " take: " + carouselTake);
                        //$('#footerMessage2').html("loadImages. " + rootFolder + " take: " + carouselTake);
                        carouselSkip += carouselTake;

                        $('#footerMessage2').html("skip: " + carouselSkip.toLocaleString() + "  take: " + carouselTake +
                            " total items: " + carouselItemArray.length.toLocaleString());
                        loadImages(rootFolder, carouselSkip, carouselTake, includeLandscape, includePortrait);
                    }
                    else {
                        let delta = (Date.now() - startTime) / 1000;
                        console.log(rootFolder + "done.  took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                        $('#footerMessage2').html(rootFolder + ": skip: " + carouselSkip.toLocaleString() + "  take: " + carouselTake + "  took: " + delta.toFixed(3) + "  total items: " + carouselItemArray.length.toLocaleString());
                        //if (document.domain == "localhost") alert("done: " + carouselItemArray.length);
                        //if (carouselDebugMode) $('#badgesContainer').html(rootFolder + "skip: " + carouselSkip + " take: " + carouselTake + " took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                    }
                }
                else {
                    if (document.domain == "localhost") alert("carouselInfo error " + carouselInfo.Success);
                    if (carouselInfo.Success.indexOf("connection attempt failed") > 0)
                        checkConnection(rootFolder, "loadImages");
                    else
                        logError("AJX", 3908, carouselInfo.Success, "loadImages");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, rootFolder, "loadImages")) logError("XHR", rootFolder, errMsg, "loadImages");
            }
        });
    } catch (e) {
        logError("CAT", 3908, e, "loadImages");
    }
}

function refreshCache(rootFolder) {
    try {
        let startTime = Date.now();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Carousel/RefreshCache?root=" + rootFolder + "&cacheCount=" + cacheCount,
            success: function (carouselInfo) {
                if (carouselInfo.Success === "ok") {
                    let cacheArray = [];
                    let isAlreadyInArray = false;
                    $.each(carouselInfo.Links, function (idx, obj) {
                        isAlreadyInArray = false;
                        for (i = 0; i < carouselInfo.length; i++) {
                            if (obj.Id === carouselInfo[i].Id) {
                                if (carouselDebugMode) alert(obj.Id + " already in carouselItemArray: " + carouselItemArray.find(item => { item.Id == obj.Id }));
                                console.log(obj.Id + " already in carouselItemArray");
                                isAlreadyInArray = true;
                            }
                        }
                        if (!isAlreadyInArray) {
                            //if (carouselItemArray.find(item => { item.Id == obj.Id }) != undefined) {
                            cacheArray.push(obj);
                        }

                        let jsnObj = "[";  //new JSONArray();
                        for (i = 0; i < cacheArray.length; i++) {
                            let ix = Math.floor(Math.random() * carouselItemArray.length);
                            jsnObj += (JSON.stringify(carouselItemArray[ix])) + ",";
                        }
                        switch (rootFolder) {
                            case "porn":
                                window.localStorage["pornCache"] = jsnObj.substring(0, jsnObj.length - 1) + "]";
                                break;
                            case "centerfold":
                                window.localStorage["centerfoldCache"] = jsnObj.substring(0, jsnObj.length - 1) + "]";
                                break;
                            case "boobs":
                                window.localStorage.removeItem["carouselCache"];
                                window.localStorage["carouselCache"] = jsnObj.substring(0, jsnObj.length - 1) + "]";
                                break;
                            default:
                                logError("SWT", 444, "rootFolder: " + rootFolder, "Carosel refreshCache");
                        }
                    });

                    let delta = (Date.now() - startTime) / 1000;
                    console.log("refreshed " + rootFolder + " cache.  Took: " + delta.toFixed(3));
                    $('#footerMessage2').html("refreshed " + rootFolder + " cache.  Took: " + delta.toFixed(3) + "  size: " + cacheArray.length);

                    //if (document.domain == "localhost") alert("refreshed " + rootFolder + " cache");
                    //if (document.domain == "localhost") alert("refreshed " + rootFolder + " cache.  \nTook: " + delta.toFixed(3) + "  size: " + cacheArray.length);
                }
                else {
                    logError("AJX", 3908, carouselInfo.Success, "refreshCache");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "refreshCache")) logError("XHR", folderId, errMsg, "refreshCache");
            }
        });
    } catch (e) {
        logError("CAT", 3908, e, "refreshCache");
    }
}

function startCarousel(calledFrom) {
    if (vCarouselInterval)
        console.log("carousel interval already started. Called from: " + calledFrom);
    else {
        if (carouselItemArray.length > 10) {
            $('#footerMessage').html("started carousel from: " + calledFrom);
            resizeCarousel();
            intervalBody();
            vCarouselInterval = setInterval(function () {
                intervalBody();
            }, rotationSpeed);
            console.log("started carousel from: " + calledFrom);
        }
        else {
            if (document.domain == "localhost") alert("failed to start carousel. carouselItemArray.length: " + carouselItemArray.length);
            $('#footerMessage').html("failed to start carousel. carouselItemArray.length: " + carouselItemArray.length);
        }
    }
}
let carouselFooterHeight = 40;
let firstTime = true;
let intervalReady = true;
function intervalBody() {
    if (intervalReady) {
        intervalReady = false;
        if ($('#pauseButton').html() == "||") {
            //$('#testMessage1').html("|");
            imageIndex = Math.floor(Math.random() * carouselItemArray.length);
            //$('#testMessage1').html("||");
            let nextImg = settingsImgRepo + carouselItemArray[imageIndex].ImageFileName;
            //$('#testMessage1').html("|||");

            $('#tempImageLoad').attr('src', nextImg).load(function () {
                //$('#testMessage1').html("||||");
                if (isNullorUndefined(nextImg)) {
                    if (document.domain == "localhost") alert("nextImg: " + nextImg);
                    //$('#testMessage1').html("nextImg: " + nextImg);
                }
                else
                {
                    if (firstTime) {
                        $('#thisCarouselImage').css('height', window.innerHeight * .62);
                        $('#thisCarouselImage').attr('src', nextImg);
                        //$('#testMessage1').html("first time in"); // + $('#thisCarouselImage').height());
                        firstTime = false;
                        intervalReady = true;
                    }
                    else {
                        imgSrc = nextImg;
                        //$('#testMessage1').html("|||||");
                        $('.carouselFooter').css("visibility", "hidden");
                        $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
                            //$('#testMessage1').html("|");
                            $('#thisCarouselImage').attr('src', imgSrc);
                            //$('#testMessage1').html("||");
                            $('#carouselFooter').fadeIn();
                            //$('#testMessage1').html("|||....");
                            setLabelLinks(imageIndex);
                            $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
                            $('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
                            intervalReady = true;
                        });
                    }
                }
            });
            imageHistory.push(imageIndex);
        }
        else {
            $('#pauseButton').html("|");
            intervalReady = true;
            setTimeout(function () { $('#pauseButton').html(">") }, 700);
        }
    }
}

function setLabelLinks(llIdx) {
    $('#knownModelLabel').html("").hide();
    $('#carouselFooterLabel').html("").hide();
    $('#imageTopLabel').html("").hide();
    let carouselItem = carouselItemArray[llIdx];
    if (carouselItem.RootFolder == "centerfold") {
        if (carouselItem.RealRoot == "centerfold")
            $('#imageTopLabel').html("Playboy Playmate: " + carouselItem.PlayboyYear);
        else {
            if (carouselItem.RealRoot == "playboy")
                //$('#imageTopLabel').html("rootfolder: " + carouselItem.RootFolder + "  realroot: " + carouselItem.RealRoot + ": " + carouselItem.FolderName);
                $('#imageTopLabel').html(carouselItem.FolderParentName + ": " + carouselItem.FolderName);
            else {
                $('#imageTopLabel').html(carouselItem.RealRoot + ": " + carouselItem.FolderName);
                //pause();
            }
        }

        if (carouselItem.FolderType == 'singleChild') {
            $('#knownModelLabel').html(carouselItem.FolderParentName);
            $('#carouselFooterLabel').html(carouselItem.FolderGPName);
            mainImageClickId = carouselItem.FolderParentId;
            imageTopLabelClickId = carouselItem.FolderGPId;
            knownModelLabelClickId = carouselItem.FolderId;
            footerLabelClickId = carouselItem.FolderGPId;
        }
        else {
            $('#knownModelLabel').html(carouselItem.FolderName);
            $('#carouselFooterLabel').html(carouselItem.FolderParentName);
            mainImageClickId = carouselItem.FolderId;
            imageTopLabelClickId = carouselItem.FolderParentId;
            knownModelLabelClickId = carouselItem.FolderId;
            footerLabelClickId = carouselItem.FolderParentId;
        }
    }
    else {
        if (carouselItem.FolderId != carouselItem.ImageFolderId) {
            // we have a link from archive
            if (carouselItem.FolderType == 'singleChild') {
                $('#imageTopLabel').html("clink " + carouselItem.FolderParentName);
                $('#knownModelLabel').html(carouselItem.FolderName);

                $('#carouselFooterLabel').html(carouselItem.FolderGPName);
                mainImageClickId = carouselItem.FolderParentId;
                imageTopLabelClickId = carouselItem.FolderGPId;
                knownModelLabelClickId = carouselItem.ImageFolderId;
                footerLabelClickId = carouselItem.FolderGPId;
            }
            else {
                $('#imageTopLabel').html(carouselItem.FolderName);
                $('#knownModelLabel').html(carouselItem.ImageFolderName);
                $('#carouselFooterLabel').html(carouselItem.FolderParentName);
                knownModelLabelClickId = carouselItem.ImageFolderId;
                footerLabelClickId = carouselItem.FolderParentId;
                mainImageClickId = carouselItem.FolderId;
                imageTopLabelClickId = carouselItem.FolderId;
            }
        }
        else {
            // not a link
            if (carouselItem.FolderType == 'singleChild') {
                $('#imageTopLabel').html(carouselItem.FolderParentName);
                $('#knownModelLabel').html(carouselItem.FolderName);
                $('#carouselFooterLabel').html(carouselItem.FolderGPName);

                mainImageClickId = carouselItem.FolderParentId;
                imageTopLabelClickId = carouselItem.FolderParentId;
                knownModelLabelClickId = carouselItem.FolderId;
                footerLabelClickId = carouselItem.FolderGPId;
            }
            else {
                $('#imageTopLabel').html(carouselItem.FolderName);
                $('#knownModelLabel').html(carouselItem.FolderParentName);
                $('#carouselFooterLabel').html(carouselItem.FolderGPName);

                mainImageClickId = carouselItem.FolderId;
                imageTopLabelClickId = carouselItem.FolderId;
                knownModelLabelClickId = carouselItem.FolderParentId;
                footerLabelClickId = carouselItem.FolderGPId;;
            }
        }
    }
    $('#carouselFooterLabel').fadeIn();
    $('#imageTopLabel').fadeIn();
    $('#knownModelLabel').fadeIn();
}

function resizeCarousel() {
    $('#thisCarouselImage').height($('#topIndexPageSection').height() - carouselFooterHeight);
    $('.carouselFooter').width($('#thisCarouselImage').width());
    $('.carouselFooter').css("visibility", "visible");
}

function alreadyInLast100() {
    if (carouselItemArray.length > 100) {
        while (alreadyInLast100()) {
            if (carouselDebugMode) {
                //$('#badgesContainer').html("already in last 100 " + carouselItemArray[imageIndex].Id);
                alert("already in last 100 " + carouselItemArray[imageIndex].Id);
            }
        }
    }
    let idxStart = Math.max(0, carouselItemArray.length - 300);
    for (i = idxStart; i < imageHistory.length; i++) {
        if (imageIndex === imageHistory[i]) {
            imageIndex = Math.floor(Math.random() * carouselItemArray.length);
            //console.log("Already shown try again: " + carouselItemArray[imageIndex].LinkId);
            //logEvent("REJ", carouselItemArray[imageIndex].FolderId, carouselRoot, carouselItemArray[imageIndex].LinkId);
            //logActivity("", carouselItemArray[imageIndex].FolderId;
            return true;
        }
    }
    return false;
}

function clickSpeed(speed) {
    if (speed === "faster")
        rotationSpeed = Math.max(rotationSpeed - 800, 800);
    if (speed === 'slower')
        rotationSpeed += 800;
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    startCarousel("speed");
}
function togglePause() {
    if ($('#pauseButton').html() == "||")
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
    $('#pauseButton').html("||");
    backArrowClicks = 0;
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    startCarousel("resume");
}

function showCarouelSettingsDialog() {
    pause();

    $("#carouselSettingsDialog").css("width", 300);
    $('#carouselSettingsDialog').css("top", event.clientY - 75);
    $('#carouselSettingsDialog').css("left", event.clientX - 100);
    $("#carouselSettingsDialog").draggable().fadeIn();

    $('#ckCenterfold').prop("checked", jsCarouselSettings.includeCenterfolds);
    $('#ckArchive').prop("checked", jsCarouselSettings.includeArchive);
    $('#ckPorn').prop("checked", jsCarouselSettings.includePorn);
    $('#ckSofcore').prop("checked", jsCarouselSettings.includeSoftcore);
    $('#ckLandscape').prop("checked", jsCarouselSettings.includeLandscape);
    $('#ckPortrait').prop("checked", jsCarouselSettings.includePortrait);

    $("input[type='checkbox']").change(function () {
        //$('input.' + $(this).prop('class')).prop('checked', true);
        //alert("$(input[type = 'checkbox']).change  $(this).prop(checked): " + $(this).prop("checked"));
        if ($(this).prop("checked"))
            addItemsToArray($(this).attr("id"));
        else
            removeItemsFromArray($(this).attr("id"));

        updateCarouselSettings()
    });
}
function removeItemsFromArray(ckId) {
    let remDom = ckId.substring(2);
    if (document.domain == "localhost") alert("removeItemsFromArray: " + remDom);
    var numRemoved = 0;
    for (idx = 0; idx < carouselItemArray.length; idx++) {
        if (carouselItemArray[idx].RootFolder === rootFolder) {
            carouselItemArray.splice(idx, 1);
            numRemoved++;
        }
    }
    console.log("Removed " + numRemoved + " links of type: " + rootFolder);
    $('#footerMessage').html("Removed " + numRemoved + " links of type: " + rootFolder + " total carousel items: " + carouselItemArray.length.toLocaleString());
    return numRemoved;
}
function addItemsToArray(ckId) {
    let remDom = ckId.substring(2);
    //$('#ckPorn').prop('checked', true);
    if (document.domain == "localhost") alert("addItemsToArray: " + remDom);
    loadImages(remDom, 0, 500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
}

function assuranceArrowClick(direction) {
    logEvent("CAA", 3908, carouselRoot, "LinkId: " + carouselItemArray[imageIndex].LinkId + "direction: " + direction);
    if (direction === "foward") {
        resume();
    }
    else {
        pause();
        let popimageIndex = imageHistory[imageHistory.length - ++backArrowClicks];
        //imageHistory.pop());
        //alert("imageIndex: " + imageIndex + " popimageIndex: " + popimageIndex);

        let popimage = settingsImgRepo + carouselItemArray[popimageIndex].ImageFileName;
        $('#thisCarouselImage').attr('src', popimage);
        setLabelLinks(popimageIndex);

        //$('#badgesContainer').html("len1: " + len1 + " imageIndex: " + imageIndex + "  len2: " + len2 + "  new index: " + popimageIndex);
        //if (carouselDebugMode) $('#hdrBtmRowSec3').html("indx: " + indx);
        //alert("indx[" + imageHistory.length + "]: " + indx);

        //$('#thisCarouselImage').attr('src', popimage).load(function () {
        //    $('#carouselFooter').fadeIn();
        //    //$('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
        //    //$('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        //    //alert("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        //});
        //alert("img1: " + img1 + "\npopimage: " + popimage);
    }
}

function clickViewGallery(labelClick) {

    event.preventDefault();
    window.event.returnValue = false;

    let clickFolderId = 0, carouselButtonClicked;
    switch (labelClick) {
        case 1: clickFolderId = mainImageClickId; carouselButtonClicked = "main image"; break;// carousel main image
        case 2: clickFolderId = imageTopLabelClickId; carouselButtonClicked = "top Label"; break;// top imageTopLabel
        case 3: clickFolderId = knownModelLabelClickId; carouselButtonClicked = "knownModelLabel"; break;// knownModelLabel
        case 4: clickFolderId = footerLabelClickId; carouselButtonClicked = "footerLabel"; break;// footer 
        default: logError("SWT", 3908, "labelClick: " + labelClick, "clickViewGallery");
    }

    // rtpe(eventCode, calledFrom, eventDetail, folderId)
    // rtpe("CIC", labelClick, carouselItemArray[imageIndex].ImageFolderName, clickFolderId);
    // logEvent(eventCode, folderId, calledFrom, eventDetails)
    logEvent("CIC", clickFolderId, carouselButtonClicked, carouselItemArray[imageIndex].LinkId);

    //sendEmail("CurtishRhodes@hotmail.com", "SlideshowClick@Ogglebooble.com", "carousel image clicked",
    //    "carousel: " + carouselRoot +
    //    "<br/>button: " + carouselButtonClicked +
    //    "<br/>folder: " + carouselItemArray[imageIndex].ImageFolderName + " : " + clickFolderId +
    //    "<br/>image: " + carouselItemArray[imageIndex].LinkId +
    //    "<br/>visitorId: " + gVisitorId
    //);
    //console.log("clickViewGallery email sent");

    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    window.location.href = "/album.html?folder=" + clickFolderId;  //  open page in same window
} 

function carouselContextMenu() {
    pause();
    pos.x = event.clientX;
    pos.y = event.clientY;
    showContextMenu("Carousel", pos, imgSrc,
        carouselItemArray[imageIndex].LinkId,
        carouselItemArray[imageIndex].FolderId,
        carouselItemArray[imageIndex].FolderName);
}

function imgErrorThrown() {
    setTimeout(function () {
        if ($('#thisCarouselImage').attr('src') == null) {
            $('#thisCarouselImage').attr('src', "Images/redballon.png");
            carouselImageViews -= 1;
            carouselImageErrors++;
            logError("ILF", carouselItemArray[imageIndex].FolderId, "linkId: " + carouselItemArray[imageIndex].LinkId + " imgSrc: " + imgSrc, "Carousel");

            if (document.domain == 'localhost') {
                pause();
                alert("image error\npage: " + carouselItemArray[imageIndex].FolderId +
                    ",\nPageName: " + carouselItemArray[imageIndex].FolderName +
                    ",\nLink: " + carouselItemArray[imageIndex].LinkId);

                console.log("image error\npage: " + carouselItemArray[imageIndex].FolderId +
                    ",\nPageName: " + carouselItemArray[imageIndex].FolderName +
                    ",\nActivity: " + carouselItemArray[imageIndex].LinkId);
            }
        }
    }, 600);
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
        "       <img id='tempImageLoad' style='position:absolute; visibility:hidden'/>\n" +
        "      </div>\n" +
        "      <div id='carouselFooter' class='carouselFooter'>\n" +
        "          <img class='speedButton floatLeft' src='Images/speedDialSlower.png' title='slower' onclick='clickSpeed(\"slower\")' />\n" +
        "          <div id='pauseButton' class='pauseButton' onclick='togglePause()'>||</div>\n" +
        "          <div id='carouselFooterLabel' class='carouselCategoryLabel' onclick='clickViewGallery(4)'></div>\n" +
        "          <img class='speedButton floatRight' src='Images/speedDialFaster.png' title='faster' onclick='clickSpeed(\"faster\")' />\n" +
        //"          <img class='speedButton floatRight' src='Images/Settings-icon.png' title='carousel settings' onclick='showCarouelSettingsDialog()' />\n" +
        "       </div>\n" +
        "   </div>\n" +
        "</div>\n" +

        "<div id='carouselSettingsDialog' class='oggleDialogContainer'>\n" +
        "   <div class='oggleDialogHeader'>" +
        "       <div class='oggleDialogTitle'>Carousel Settings</div>" +
        "       <div class='oggleDialogCloseButton'>" +
        "       <img src='/images/poweroffRed01.png' onclick='resume(); $(\"#carouselSettingsDialog\").hide();'/></div>\n" +
        "   </div>\n" +
        "   <div class='oggleDialogContents'>\n" +
        "       <input type='checkbox' id='ckCenterfold'/> Include Centerfolds<br/>\n" +
        "       <input type='checkbox' id='ckArchive'/> Include Big Naturals Archive<br/>\n" +
        "       <input type='checkbox' id='ckSoftcore'/> Include softcore<br/>\n" +
        "       <input type='checkbox' id='ckPorn'/> Include porn<br/>\n" +
        "       <input type='checkbox' id='ckLandscape'/> allow landscape size<br/>\n" +
        "       <input type='checkbox' id='ckPortrait'/> allow portrait size<br/>\n" +
        "   </div>\n" +
        "</div>\n";
}
