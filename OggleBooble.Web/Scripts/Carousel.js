const rotationSpeed = 7000, intervalSpeed = 600, specialLaunchCode = 103;
let imageIndex = 0, numImages = 0, numFolders = 0, 
    carouselItemArray = [], imageHistory = [], absolueStart,
    carouselImageViews = 0, carouselImageErrors = 0, vCarouselInterval = null,
    mainImageClickId, knownModelLabelClickId, imageTopLabelClickId, footerLabelClickId,
    imgSrc, jsCarouselSettings, nextRoot = 1, arryItemsShownCount = 0;

function launchCarousel(startRoot) {
    absolueStart = Date.now();
    loadCarouselSettingsIntoLocalStorage();
    if (startRoot === "porn") nextRoot = 4;
    if (startRoot === "centerfold") nextRoot = 6;
    jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);

    $('#footerMessage2').html("initial call to loadimages");
    console.log("initial call to loadimages");
    loadImages(startRoot, absolueStart, 0, specialLaunchCode, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
    window.addEventListener("resize", resizeCarousel);
}

function loadImages(rootFolder, absolueStart, carouselSkip, carouselTake, includeLandscape, includePortrait) {
    settingsImgRepo = settingsArray.ImageRepo;
    try {
        if (carouselTake == specialLaunchCode) {
            $('#carouselContainer').html(carouselHtml());
            if (rootFolder === "boobs") {
                if (!isNullorUndefined(window.localStorage["carouselCache"])) {
                    console.log("loading boobs from cache");
                    let carouselCacheArray = JSON.parse(window.localStorage["carouselCache"]);
                    $.each(carouselCacheArray, function (idx, obj) {
                        carouselItemArray.push(obj);
                    });
                    $('#thisCarouselImage').show();
                    carouselSkip += 100;
                }
            }
            if (rootFolder === "centerfold") {
                if (!isNullorUndefined(window.localStorage["centerfoldCache"])) {
                    console.log("loading centerfold from centerfold cache");
                    let carouselCacheArray = JSON.parse(window.localStorage["centerfoldCache"]);
                    $.each(carouselCacheArray, function (idx, obj) {
                        carouselItemArray.push(obj);
                    });
                    $('#thisCarouselImage').show();
                    carouselSkip += 100;
                }
            }
            if (rootFolder === "porn") {
                if (!isNullorUndefined(window.localStorage["pornCache"])) {
                    console.log("loading porn from centerfold cache");
                    let carouselCacheArray = JSON.parse(window.localStorage["pornCache"]);
                    $.each(carouselCacheArray, function (idx, obj) {
                        carouselItemArray.push(obj);
                    });
                    $('#thisCarouselImage').show();
                    carouselSkip += 100;
                }
            }
            if (carouselItemArray.length > 10) {
                if (!vCarouselInterval) {
                    imageIndex = Math.floor(Math.random() * carouselItemArray.length);
                    imgSrc = settingsImgRepo + carouselItemArray[imageIndex].FileName;
                    mainImageClickId = carouselItemArray[imageIndex].FolderId;
                    $('#thisCarouselImage').attr('src', imgSrc).load(function () {
                        $('#carouselImageContainer').fadeIn();
                        $('.carouselFooter').width($('#thisCarouselImage').width());
                        $('.carouselFooter').css("visibility", "visible");
                        $('#carouselFooter').fadeIn();
                        resizeIndexPage();
                        resizeCarousel();
                        //$('#thisCarouselImage').height($('#topIndexPageSection').height() - 40);
                    });
                    setLabelLinks();
                    //$('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });

                    startCarousel("specialLaunchCode");
                    let delta = (Date.now() - absolueStart) / 1000;
                    if (debugMode) $('#badgesContainer').html("initial launch from cache took: " + delta.toFixed(3) + " total initial items: " + carouselItemArray.length.toLocaleString());
                    console.log("startCarousel from load carouselCache launch took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                    $('#footerMessage2').html("initial " + rootFolder + " launch from cache took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                }
            }
            loadImages(rootFolder, absolueStart, carouselSkip, 987, includeLandscape, includePortrait);
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Carousel/GetCarouselImages?root=" + rootFolder + "&skip=" + carouselSkip + "&take=" + carouselTake +
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

                            if (carouselItemArray.length === 127) {
                                refreshCache(rootFolder);
                            }
                            
                        });

                        if (!vCarouselInterval) {
                            console.log("starting carousel from after ajax");
                            imageIndex = Math.floor(Math.random() * carouselItemArray.length);
                            imgSrc = settingsImgRepo + carouselItemArray[imageIndex].FileName;
                            $('#thisCarouselImage').attr('src', imgSrc);
                            $('#carouselImageContainer').show();
                            $('#thisCarouselImage').show();
                            resizeIndexPage();
                            resizeCarousel();
                            startCarousel("ajax");
                            let delta = (Date.now() - absolueStart) / 1000;
                            if (debugMode) $('#badgesContainer').html("initial launch from cache took: " + delta.toFixed(3) + " total initial items: " + carouselItemArray.length.toLocaleString());
                            console.log("startCarousel without cache launch took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                            $('#footerMessage2').html("startCarousel without cache launch took: " + delta.toFixed(3) + " total items: " + carouselItemArray.length.toLocaleString());
                        }

                        if (carouselInfo.Links.length === carouselTake) {
                            console.log("loadImages. " + rootFolder + " take: " + carouselTake);
                            $('#footerMessage2').html("loadImages. " + rootFolder + " take: " + carouselTake);
                            carouselSkip += carouselTake;
                            loadImages(rootFolder, absolueStart, carouselSkip, 1005, includeLandscape, includePortrait);
                        }
                        else {
                            addMoreRootsToCarousel(rootFolder);
                        }
                    }
                    else {
                        logError("AJX", 3908, carouselInfo.Success, "carousel.loadImages");
                    }
                },
                error: function (jqXHR) {
                    if (!checkFor404("carousel.loadImages"))
                        logError("XHR", 3908, getXHRErrorDetails(jqXHR), "carousel.loadImages");
                }
            });
        }
    } catch (e) {
        logError("CAT", 3908, e, "carousel.loadImages");
    }
}

function addMoreRootsToCarousel(rootFolder) {
    if (nextRoot === 1) {
        nextRoot = 2;
        //if (jsCarouselSettings.includeArchive) {
            $('#footerMessage2').html("loading archive");
            console.log("loading archive");
            loadImages("archive", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            return;
        //}
    }
    if (nextRoot === 2) {
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
        nextRoot = 6;
        //if (jsCarouselSettings.includeSoftcore) {
            $('#footerMessage2').html("loading soft core");
            carouselSkip = 0;
            loadImages("soft", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
            return;
        //}
    }
    if (nextRoot === 4) {
        nextRoot = 6;
        //if (jsCarouselSettings.includePorn) {
            if (jsCarouselSettings.includePorn) {
                $('#footerMessage2').html("loading sluts");
                carouselSkip = 0;
                loadImages("sluts", Date.now(), 0, 1500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
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
        let delta = (Date.now() - absolueStart) / 1000;
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
    $('#footerMessage2').html("refreshed " + rootFolder + " cache");
    console.log("refreshed " + rootFolder + " cache");
    setTimeout(function () { $('#footerMessage2').html("") }, 12000);
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
    imageIndex = Math.floor(Math.random() * carouselItemArray.length);
    if (carouselItemArray.length > 1000) {
        if (alreadyInLast100()) {
            if (debugMode) $('#badgesContainer').html("already in last 100 flagged");
            imageIndex = Math.floor(Math.random() * carouselItemArray.length);
        }
    }
    imageHistory.push(imageIndex);
    $('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
    //if (debugMode) $('#badgesContainer').html("images: " + ++arryItemsShownCount);

    $('.carouselFooter').css("visibility", "hidden");
    $('#carouselImageContainer').fadeOut(intervalSpeed, "linear", function () {
        imgSrc = settingsImgRepo + carouselItemArray[imageIndex].FileName;
        $('#thisCarouselImage').attr('src', imgSrc).load(function () {
            $('#carouselFooter').fadeIn();
            setLabelLinks();
            $('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });            
            //if (window.localStorage["IpAddress"] === "68.203.90.183")
            //    $('#badgesContainer').html("imageIndex: " + imageIndex + "  imageHistory.length: " + imageHistory.length);
            //if (debugMode) $('#hdrBtmRowSec3').append(".len: " + imageHistory.length);
            //if (debugMode) $('#hdrBtmRowSec3').html("  Count: " + imageHistoryArrayCount);
            //if (debugMode) $('#hdrBtmRowSec3').append("  a[" + (imageHistory.length - 1) + "]: " + imageHistory[imageHistory.length - 1]);
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

                $('#knownModelLabel').html(carouselItemArray[imageIndex].FolderName);
                knownModelLabelClickId = carouselItemArray[imageIndex].FolderId;

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

function alreadyInLast100() {
    let idxStart = Math.max(0, carouselItemArray.length - 300);
    for (i = idxStart; i < imageHistory.length; i++) {
        if (imageIndex === imageHistory[i]) {
            if (window.localStorage["IpAddress"] === "68.203.90.183") {
                $('#badgesContainer').html("Already shown try again: " + carouselItemArray[imageIndex].LinkId);
                //alert("Already shown try again: ");
                beep();
                console.log("Already shown try again: " + carouselItemArray[imageIndex].LinkId);
            }
            logEvent("REJ", carouselItemArray[imageIndex].FolderId, "alreadyInLast100", carouselItemArray[imageIndex].LinkId);
            return true;
        }
    }
    $('#badgesContainer').html("");
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
    intervalBody();
    clearInterval(vCarouselInterval);
    vCarouselInterval = null;
    startCarousel("resume");
    $('#pauseButton').html("||");
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
    loadImages(remDom, Date.now(), 0, 500, jsCarouselSettings.includeLandscape, jsCarouselSettings.includePortrait);
}

function assuranceArrowClick(direction) {
    //logEvent("CAA", 3908, "calledFrom", "LinkId: " + carouselItemArray[imageIndex].LinkId+ "direction: " + direction)
    if (direction === "foward") {
        resume();
    }
    else {
        pause();
        let len1 = imageHistory.length;
        //let idx1 = imageIndex;
        //let linkId1 = carouselItemArray[imageIndex].LinkId;
        imageHistory.pop();
        let len2 = imageHistory.length;

        let popimageIndex = imageHistory[imageHistory.length - 1];

        //alert("imageIndex: " + imageIndex + " popimageIndex: " + popimageIndex);

        let popimage = settingsImgRepo + carouselItemArray[popimageIndex].FileName;
        $('#thisCarouselImage').attr('src', popimage);

        $('#badgesContainer').html("len1: " + len1 + " imageIndex: " + imageIndex + "  len2: " + len2 + "  new index: " + popimageIndex);


        //if (debugMode) $('#hdrBtmRowSec3').html("indx: " + indx);
        //alert("indx[" + imageHistory.length + "]: " + indx);

        //$('#thisCarouselImage').attr('src', popimage).load(function () {
        //    $('#carouselFooter').fadeIn();
        //    setLabelLinks();
        //    //$('#carouselImageContainer').fadeIn(intervalSpeed, function () { resizeCarousel(); });
        //    //$('#footerMessage').html("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        //    //alert("image " + imageIndex.toLocaleString() + " of " + carouselItemArray.length.toLocaleString());
        //});
        //alert("img1: " + img1 + "\npopimage: " + popimage);
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
            rtpe("CPC", carouselItemArray[imageIndex].ImageFolderName, "clickViewParentGallery", footerLabelClickId);
            break;
        default:
            logError("SWT", 3908, "labelClick: " + labelClick, "clickViewGallery");
    }
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
    $('#thisCarouselImage').attr('src', "Images/redballon.png");
    carouselImageViews -= 1;
    carouselImageErrors++;
    logError("ILF", carouselItemArray[imageIndex].FolderId, "linkId: " + carouselItemArray[imageIndex].LinkId + " imgSrc: " + imgSrc, "Carousel");

    if (document.domain === 'localhost') {
        pause();
        alert("image error\npage: " + carouselItemArray[imageIndex].FolderId +
            ",\nPageName: " + carouselItemArray[imageIndex].FolderName +
            ",\nActivity: " + carouselItemArray[imageIndex].LinkId);
        console.log("image error\npage: " + carouselItemArray[imageIndex].FolderId +
            ",\nPageName: " + carouselItemArray[imageIndex].FolderName +
            ",\nActivity: " + carouselItemArray[imageIndex].LinkId);
    }
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
