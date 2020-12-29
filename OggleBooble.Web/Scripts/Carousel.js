const rotationSpeed = 7000, intervalSpeed = 600, carouselDebugMode = false;
let imageIndex = 0, numImages = 0, numFolders = 0, backArrowClicks = 0,
    carouselItemArray = [], imageHistory = [], absolueStartTime,
    carouselImageViews = 0, carouselImageErrors = 0, vCarouselInterval = null,
    mainImageClickId, knownModelLabelClickId, imageTopLabelClickId, footerLabelClickId,
    imgSrc, jsCarouselSettings, nextRoot = 1, arryItemsShownCount = 0, carouselRoot;

function launchCarousel(startRoot) {
    carouselRoot = startRoot;
    absolueStartTime = Date.now();
    $('#carouselContainer').html(carouselHtml());
    loadCarouselSettingsIntoLocalStorage();
    if (startRoot === "porn") nextRoot = 4;
    if (startRoot === "centerfold") nextRoot = 6;
    jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
    $('#pauseButton').html("||");
    carouselTake = 777;
    let carouselSkip = 0;
    imageIndex = 0;
    if (startRoot === "centerfold") {
        if (!isNullorUndefined(window.localStorage["centerfoldCache"])) {
            //if (document.domain == "localhost") alert("loading centerfold from centerfold cache");
            console.log("loading centerfold from centerfold cache");
            let carouselCacheArray = JSON.parse(window.localStorage["centerfoldCache"]);
            $.each(carouselCacheArray, function (idx, obj) {
                carouselItemArray.push(obj);
            });
            intervalBody();
            resizeCarousel();
            startCarousel("centefold cache");
            console.log("loaded " + carouselItemArray.length + " from centerfold cache");
        }
        else
            if (document.domain == "localhost")
                alert("starting carousel from after ajax");
    }
    if (startRoot === "boobs") {
        if (!isNullorUndefined(window.localStorage["carouselCache"])) {
            let carouselCacheArray = JSON.parse(window.localStorage["carouselCache"]);
            $.each(carouselCacheArray, function (idx, obj) {
                carouselItemArray.push(obj);
            });
            intervalBody();
            resizeCarousel();
            startCarousel("big naturals cache");
            console.log("loaded " + carouselItemArray.length + " from boobs cache");
        }
    }
    if (startRoot === "porn") {
        if (!isNullorUndefined(window.localStorage["pornCache"])) {
            console.log("loading porn from centerfold cache");
            let carouselCacheArray = JSON.parse(window.localStorage["pornCache"]);
            $.each(carouselCacheArray, function (idx, obj) {
                carouselItemArray.push(obj);
            });
            intervalBody();
            resizeCarousel();
            startCarousel("porn cache");
            console.log("loaded " + carouselItemArray.length + " from porn cache");
        }
    }
    try {
        loadImages(startRoot, carouselSkip, carouselTake, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
    } catch (e) {
        logError("CAT", 3908, e, "launchCarousel");
    }

    //$('#footerMessage2').html("initial call to loadimages");
    //console.log("initial call to loadimages");
    window.addEventListener("resize", resizeCarousel);
}

function loadImages(rootFolder, carouselSkip, carouselTake, includeLandscape, includePortrait) {
    settingsImgRepo = settingsArray.ImageRepo;
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
                            }
                        }
                        if (!isAlreadyInArray) {
                            //if (carouselItemArray.find(item => { item.Id == obj.Id }) != undefined) {
                            carouselItemArray.push({
                                Id: obj.Id,
                                FolderId: obj.FolderId,
                                RootFolder: obj.RootFolder,
                                FolderName: obj.FolderName,
                                FolderParentName: obj.FolderParentName,
                                FolderParentId: obj.FolderParentId,
                                FolderGPName: obj.FolderGPName,
                                FolderType: obj.FolderType,
                                FolderGPId: obj.FolderGPId,
                                ImageFolderId: obj.ImageFolderId,
                                ImageFolderName: obj.ImageFolderName,
                                PlayboyYear: obj.PlayboyYear,
                                ImageFolderRoot: obj.ImageFolderRoot,
                                ImageFolderParentName: obj.ImageFolderParentName,
                                ImageFolderParentId: obj.ImageFolderParentId,
                                ImageFolderGPName: obj.ImageFolderGPName,
                                ImageFolderGPId: obj.ImageFolderGPId,
                                LinkId: obj.LinkId,
                                ImageFile: obj.ImageFile
                            });
                        }
                    });

                    if (!vCarouselInterval) {
                        if (document.domain == "localhost")
                            alert("starting carousel from after ajax");

                        console.log("starting carousel from after ajax");
                        startCarousel("ajax");
                    }

                    if ((carouselItemArray.length > (carouselSkip * 2)) && (carouselItemArray.length < (carouselSkip * 3))) refreshCache(rootFolder);

                    if (carouselInfo.Links.length === carouselTake) {
                        console.log("loadImages. " + rootFolder + " take: " + carouselTake);
                        $('#footerMessage2').html("loadImages. " + rootFolder + " take: " + carouselTake);
                        carouselSkip += carouselTake;
                        //alert("carouselSkip: " + carouselSkip);
                        loadImages(rootFolder, carouselSkip, carouselTake, includeLandscape, includePortrait);
                    }
                    else {
                        addMoreRootsToCarousel(rootFolder);
                    }

                    //function loadImages(rootFolder, , , includeLandscape, includePortrait) {
                    let delta = (Date.now() - startTime) / 1000;
                    //if (carouselDebugMode) $('#badgesContainer').html(rootFolder + "skip: " + carouselSkip + " take: " + carouselTake + " took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                    console.log(rootFolder + "skip: " + carouselSkip + " take: " + carouselTake + " took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                    $('#footerMessage2').html(rootFolder + "skip: " + carouselSkip + " take: " + carouselTake + " took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                }
                else {
                    logError("AJX", 3908, carouselInfo.Success, "carousel.loadImages");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT", 3908, e, "carousel.loadImages");
    }
}

function addMoreRootsToCarousel(rootFolder) {
    if (nextRoot === 1) {
        nextRoot = 3;
        //if (jsCarouselSettings.includeArchive) {
        $('#footerMessage2').html("loading archive");
        refreshCache(rootFolder);
        console.log("loading archive");
        loadImages("archive", 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
        return;
        //}
    }
    if (nextRoot === 2) {
        refreshCache(rootFolder);
        nextRoot = 3;
        //if (jsCarouselSettings.includeCenterfolds) {
        //    $('#footerMessage2').html("loading centerfolds");
        //    console.log("loading centerfolds ");
        //    carouselSkip = 0;
        //    loadImages("centerfold", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
        //    return;
        //}
    }
    if (nextRoot === 3) {
        refreshCache(rootFolder);
        nextRoot = 6;
        //if (jsCarouselSettings.includeSoftcore) {
            $('#footerMessage2').html("loading soft core");
            carouselSkip = 0;
        loadImages("soft", 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            return;
        //}
    }
    if (nextRoot === 4) {
        nextRoot = 6;
        //if (jsCarouselSettings.includePorn) {
            if (jsCarouselSettings.includePorn) {
                $('#footerMessage2').html("loading sluts");
                carouselSkip = 0;
                loadImages("sluts", 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
                return;
            }
        //}
    }
    //if (nextRoot === 5) {
    //    nextRoot = 6;
    //    if (jsCarouselSettings.includePorn) {
    //        if (jsCarouselSettings.includePorn) {
    //            $('#footerMessage2').html("loading porn");
    //            loadImages("porn", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
    //            return;
    //        }
    //    }
    //}
    if (nextRoot === 6) {
        let delta = (Date.now() - absolueStartTime) / 1000;
        console.log("loadImages DONE!! took: " + delta.toFixed(3) + " total: " + carouselItemArray.length.toLocaleString());
        $('#footerMessage2').html("loadImages DONE!! took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
        refreshCache(rootFolder);
    }
}

function refreshCache(rootFolder) {
    let jsnObj = "[";  //new JSONArray();
    for (i = 0; i < 101; i++) {
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
        default:
            window.localStorage["carouselCache"] = jsnObj.substring(0, jsnObj.length - 1) + "]";
    }
    console.log("refreshed " + rootFolder + " cache");
    $('#footerMessage2').html("refreshed " + rootFolder + " cache");
    //if (carouselDebugMode) alert("refreshed " + rootFolder + " cache");
}

function startCarousel(calledFrom) {
    if (vCarouselInterval)
        console.log("carousel interval already started. Called from: " + calledFrom);
    else {
        $('.assuranceArrows').show();
        vCarouselInterval = setInterval(function () {
            intervalBody();
        }, rotationSpeed);
    }
}

function intervalBody() {
    if ($('#pauseButton').html() == "||") {
        imageIndex = Math.floor(Math.random() * carouselItemArray.length);
        if (carouselItemArray.length > 100) {
            while (alreadyInLast100()) {
                if (carouselDebugMode) {
                    //$('#badgesContainer').html("already in last 100 " + carouselItemArray[imageIndex].Id);
                    alert("already in last 100 " + carouselItemArray[imageIndex].Id);
                }
            }
        }
        $('.carouselFooter').css("visibility", "hidden");
        $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
            imgSrc = settingsImgRepo + carouselItemArray[imageIndex].ImageFile;
            $('#thisCarouselImage').attr('src', imgSrc).load(function () {
                $('#carouselFooter').fadeIn();
                setLabelLinks(imageIndex);
                $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
            });
        });
    }
    else {
        $('#pauseButton').html("|");
        setTimeout(function () { $('#pauseButton').html(">") }, 700);
    }
}

function setLabelLinks(llIdx) {
    $('#knownModelLabel').html("").hide();
    $('#carouselFooterLabel').html("").hide();
    $('#imageTopLabel').html("").hide();
    let carouselItem = carouselItemArray[llIdx];
    if (carouselItem.RootFolder === "centerfold") {

        $('#imageTopLabel').html("Playboy Playmate: " + carouselItem.PlayboyYear);
        if (carouselItem.FolderType == 'singleChild') {
            $('#imageTopLabel').html("Playboy Playmate: " + carouselItem.PlayboyYear);
            $('#knownModelLabel').html(carouselItem.FolderParentName);
            $('#carouselFooterLabel').html(carouselItem.FolderGPName);
            mainImageClickId = carouselItem.FolderParentId;
            imageTopLabelClickId = carouselItem.FolderGPId;
            knownModelLabelClickId = carouselItem.FolderId;
            footerLabelClickId = carouselItem.FolderGPId;
            //pause();
        }
        else {
            $('#knownModelLabel').html(carouselItem.FolderName);
            $('#carouselFooterLabel').html(carouselItem.FolderGPName);
            mainImageClickId = carouselItem.FolderId;
            imageTopLabelClickId = carouselItem.FolderParentId;
            knownModelLabelClickId = carouselItem.FolderId;
            footerLabelClickId = carouselItem.FolderGPId;
        }
    }
    else {
        if (carouselItem.FolderId != carouselItem.ImageFolderId) {
            //if (carouselItem.FolderType == 'singleChild')
            //    $('#knownModelLabel').html("sc " + carouselItem.ImageFolderParentName);
            //else
            $('#knownModelLabel').html(carouselItem.ImageFolderName);
            $('#imageTopLabel').html(carouselItem.FolderName);
            $('#carouselFooterLabel').html(carouselItem.FolderParentName);
            knownModelLabelClickId = carouselItem.ImageFolderId;
            footerLabelClickId = carouselItem.FolderParentId;
            mainImageClickId = carouselItem.FolderId;
            imageTopLabelClickId = carouselItem.FolderId;
            //pause();
        }
        else {

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
    var carouselFooterHeight = 40;
    $('#thisCarouselImage').height($('#topIndexPageSection').height() - carouselFooterHeight);
    $('.carouselFooter').width($('#thisCarouselImage').width());
    $('.carouselFooter').css("visibility", "visible");
}

function alreadyInLast100() {
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
    imageHistory.push(imageIndex);
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
    intervalBody();
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
    alert("removeItemsFromArray: " + remDom);
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
function addItemsToArray(ckId) {
    let remDom = ckId.substring(2);
    //$('#ckPorn').prop('checked', true);
    alert("addItemsToArray: " + remDom);
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

        let popimage = settingsImgRepo + carouselItemArray[popimageIndex].ImageFile;
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
    let clickFolderId = 0;
    switch (labelClick) {
        case 1: clickFolderId = mainImageClickId; break;// carousel main image
        case 2: clickFolderId = imageTopLabelClickId; break;// top imageTopLabel
        case 3: clickFolderId = knownModelLabelClickId; break;// knownModelLabel
        case 4: clickFolderId = footerLabelClickId; break;// footer 
        default: logError("SWT", 3908, "labelClick: " + labelClick, "clickViewGallery");
    }
    // rtpe(eventCode, calledFrom, eventDetail, folderId)
    rtpe("CIC", labelClick, carouselItemArray[imageIndex].ImageFolderName, clickFolderId);
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
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

            if (document.domain === 'localhost') {
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
