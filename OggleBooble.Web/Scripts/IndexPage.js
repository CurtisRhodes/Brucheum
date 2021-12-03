let promoMessagesArray = new Array(),
    promoIdx = 0,
    promoMessageRotator = null,
    promoMessageRotationSpeed = 15000,
    numUpdatedGalleries = 24,
    spaType = "archive";

function displaySpaPage(folderId) {
    switch (Number(folderId)) {
        case 3907:
            rankerStartup(params.bp);
            break; // ranker
        case 3911:
            blogStartup();
            break; // blog
        case 3910:
            dashboardStartup();
            break; // dashboard
        case 3908:
            //document.title = "welcome : OggleBooble";
            changeFavoriteIcon("redBallon");
            spaType = "boobs";
            $('#indexMiddleColumn').html(indexPageHTML());
            setOggleHeader("index");
            setOggleFooter(3908, "index", "index");
            launchCarousel(spaType);
            resetOggleHeader(3908, spaType);
            quickLoadLatestUpdates(spaType);
            // quickLoadloadRandomGalleries(spaType); 
            //setTimeout(function () { launchPromoMessages(); }, 3000);
            //$('#testFunctionClick').show();
            resizeIndexPage();
            break;  //index page;
        case 3909:
            spaType = "porn";
            $('#indexMiddleColumn').html(indexPageHTML());
            setOggleHeader("porn");
            setOggleFooter(folderId, "porn", "porn");
            launchCarousel("porn");
            // set porn colors
            $('.threeColumnLayout').css("background-color", "#d279a6");
            //if (subdomain == "porn")
            //    $('.threeColumnLayout').css("background-color", "var(--oggleBackgroundColor)");
            //else
            //    $('.threeColumnLayout').css("background-color", "#d279a6");
            $('#updatedGalleriesSectionLoadingGif').show();
            quickLoadLatestUpdates(spaType);
            resetOggleHeader(3909, "porn");
            break; // porn
        case 72:
            spaType = "centerfold";
            $('#indexMiddleColumn').html(playboyPageHTML());
            setOggleHeader("playboyIndex");
            resetOggleHeader(72, "playboyIndex");
            setOggleFooter(folderId, "centerfold", "centerfold");
            launchCarousel(spaType);
            $('#updatedGalleriesSectionLoadingGif').show();
            quickLoadLatestUpdates(spaType);
            break; // every playboy centerfold
        default:
            if (document.domain === 'localhost') alert("spaPageId: " + folderId + " not found");
            logError("SWT", folderId, "case: " + folderId, "displaySpaPage");
            break;
    }
}

function quickLoadLatestUpdates(spaType) {
    if (!isNullorUndefined(window.localStorage[spaType + "latestUpdatesCache"])) {
        console.log(spaType + "latest updates loaded from cache");
        loadLatestUpdateArray(JSON.parse(window.localStorage[spaType + "latestUpdatesCache"]), "quick Load");
    }
    else {
        console.log("no latest updates for: " + spaType + " cache found");
    }
    loadLatestUpdates();
}
function loadLatestUpdates() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/IndexPage/GetLatestUpdatedFolders?take=" + numUpdatedGalleries + "&root=" + spaType,
        success: function (latestUpdates) {
            if (latestUpdates.Success === "ok") {
                try {
                    window.localStorage[spaType + "latestUpdatesCache"] = null;
                    window.localStorage[spaType + "latestUpdatesCache"] = JSON.stringify(latestUpdates.LatestTouchedGalleries);
                } catch (e) {
                    logError("CAT", 3908, e, "load Updated Galleries Boxes");
                }
                loadLatestUpdateArray(latestUpdates.LatestTouchedGalleries, "ajax");
                console.log("loaded latest updated galleries for: " + spaType);
            }
            else {
                if ((latestUpdates.Success.indexOf("connection attempt failed") > 0) || (latestUpdates.Success.indexOf("Timeout in IO operation") > 0)) {
                    logError("TOE", 3909, latestUpdates.Success, "load LatestUpdates");  // timeout error
                    checkConnection(3908, "load Updated Galleries Boxes");
                }
                else
                    logError("AJX", 3908, latestUpdates.Success, "load Updated Galleries Boxes");
            }

            if (spaType == "boobs")
                quickLoadloadRandomGalleries(spaType);


        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 619845, "load Updated Galleries Boxes")) logError("XHR", 619846, errMsg, "load Updated Galleries Boxes");
        }
    });
}
function loadLatestUpdateArray(latestTouchedGalleries, calledFrom) {
    try
    {
        $('#updatedGalleriesSection').html("");
        $('#updatedGalleriesSectionLoadingGif').hide();

        $.each(latestTouchedGalleries, function (idx, touchedGallery) {
            let thisItemSrc = settingsImgRepo + touchedGallery.ImageFile;
            $('#updatedGalleriesSection').append("<div class='newsContentBox'>" +
                "<div class='newsContentBoxLabel'>" + touchedGallery.FolderName + "</div>" +
                "<img id='lt" + touchedGallery.FolderId + "' class='newsContentBoxImage' " +
                "alt='Images/redballon.png' " +
                "onerror='latestGalleryImageError(" + touchedGallery.FolderId + ",\"" + thisItemSrc + "\")' src='" + thisItemSrc + "'" +
                "onclick='rtpe(\"LUP\",\"" + spaType + "\",\"" + touchedGallery.FolderName + "\"," + touchedGallery.FolderId + ")' />" +
                "<div class='newsContentBoxDateLabel'>updated: " + dateString2(touchedGallery.Acquired) + "</span></div>" +
                "</div>"
            );
        });
        $('#lblLatestUpdates').show();
        resizeIndexPage();

    } catch (e) {
        logError("CAT", 5555, e, "load LatestUpdate Array");
    }
}

function quickLoadloadRandomGalleries(spaType) {
    if (!isNullorUndefined(window.localStorage[spaType + "randomGalleriesCache"])) {
        console.log("random galleries " + spaType + " cache found");
        loadRandomGalleriesArray(JSON.parse(window.localStorage[spaType + "randomGalleriesCache"]), "quick Load");
    }
    else {
        console.log("no " + spaType + "random galleries cache found");
    }
    loadRandomGalleries();
}
function loadRandomGalleries() {
    let randGalleryCount = 9;
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/IndexPage/GetRandomGalleries?take=" + randGalleryCount + "&root=" + spaType,
            success: function (randomGalleriesModel) {
                if (randomGalleriesModel.Success === "ok") {
                    window.localStorage[spaType + "randomGalleriesCache"] = null;
                    window.localStorage[spaType + "randomGalleriesCache"] = JSON.stringify(randomGalleriesModel.RandomGalleries);
                    loadRandomGalleriesArray(randomGalleriesModel.RandomGalleries, "ajax");
                    console.log("loaded random galleries");
                }
                else
                    logError("AJX", 3908, randomGalleriesModel.Success, "load Random Galleries");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                console.error("loadRandomGalleries XHR: " + errMsg);
                if (!checkFor404(errMsg, 619845, "show RandomGalleries")) logError("XHR", 619846, errMsg, "show RandomGalleries");
            }
        });
    } catch (e) {
        logError("CAT", 55555, e, "load Random Galleries");
        console.error("loadRandomGalleries: " + e);
    }
}
function loadRandomGalleriesArray(randomGalleriesArray, calledFrom) {
    try {
        //console.log("starting load Random Galleries Array: " + calledFrom);
        $('#rgSectionContainer').show().html("");
        let rndItemSrc = "/Images/binaryCodeRain.gif";
        let winWidth = $(window).width();
        let winWidthss = $('#rgSectionContainer').width();
        $.each(randomGalleriesArray, function (idx, randomGallery) {
            //if (winWidthss < winWidth)
            {
                rndItemSrc = settingsImgRepo + randomGallery.FolderPath + "/" + randomGallery.FileName;
                try {
                    $('#rgSectionContainer').append("<div id='rg" + randomGallery.FolderId + "' class='newsContentBox'>" +
                        "<div class='newsContentBoxLabel'>" + randomGallery.FolderName + "</div>" +
                        "<img id='lt" + randomGallery.FolderId + "' class='newsContentBoxImage' " +
                        "alt='Images/redballon.png' " +
                        "onerror='randomGalleriesImageError(" + randomGallery.FolderId + ",\"" + rndItemSrc + "\")' src='" + rndItemSrc + "'" +
                        "onclick='rtpe(\"RGC\",\"" + spaType + "\",\"" + randomGallery.FolderName + "\"," + randomGallery.FolderId + ")' />" +
                        "</div>");

                } catch (e) {
                    console.error("randomGalleries item: " + e);
                }
            }
            //let fff = $('#rgSectionContainer');
            winWidthss = $('#rgSectionContainer').width();
            winWidths1 = $('#randomGalleriesSection').innerWidth();
            if (winWidthss > winWidth)
                $('#rg' + randomGallery.FolderId).hide();

        });

    } catch (e) {
        console.error("load RandomGalleries Array: " + e);
    }
    $('#showRandomGalleriesLabel').show();
    resizeIndexPage();
}

function latestGalleryImageError(folderId, thisItemSrc) {
    //logError("ILF", folderId, thisItemSrc, "latestGalleryImage");
    setTimeout(function () {
        if ($('#lt' + folderId).attr('src') == null) {
            $('#lt' + folderId).attr('src', "Images/redballon.png");
            logError("ILF", folderId, "Src: " + thisItemSrc, "latest Galleries");

            if (document.domain === 'localhost') {
              //  pause();
                //  alert("image error\npage: " + folderId + ",\nLink: " + thisItemSrc);
                console.error("image error\npage: " + folderId + ",\nLink: " + thisItemSrc);
            }
        }
    }, 600);
}

function testFunction() {

    runAfew();
    //tryAddNewIP(4110, "c2b638e6-bd1e-499b-8099-67d5602b3c71", "test function");
    //getIpIfyIpInfo("decd8899-478c-44ee-a68b-38cbb9715785", 4110, "test function") 
    //addVisitor(748, "test function");
    //addVisitorIfIpUnique("190.209.145.178", 1111, "test function");
    //getIpInfo3("d272da49-5eb9-4aaf-9fc6-4a12d2a0bd70", "75.182.147.211", 1111, "test function")

    // time to log in
    //showCustomMessage('09b40acd-083e-44fe-970d-0a57d1a61360', false);
    ////$('#customMessageContainer').css("top", 255);
    //$('#customMessageContainer').css("left", 260);
    //$('#customMessageContainer').css("width", 1200);


    //// this site requires cookies
    //showCustomMessage('25aada3a-84ac-45a9-b85f-199876b297be');
    //$('#customMessageContainer').css("top", 250);
    //$('#customMessageContainer').css("left", 400);

    //    let wipTitle = "data tracking error";
    //    let wipMessage = "problem storing your IpAddress";
    //    wipMessage += "<br/>Unable to store a cookie";
    //    wipMessage += "<br/>This site requires cookies enabled";
    //    wipMessage += "<br/>You may be asked to login on every page until you leave.";
    //    wipMessage += "<br/>you must <a href=''>Register</a> or <a href=''>login</a> to continue";
    //    wipMessage += "<div class='robotWarning'><input type='checkbox'> I am not a robot.</input></div>";
    //    showMyAlert(wipTitle, wipMessage);
}

function launchPromoMessages() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/OggleBlog/GetBlogList?commentType=PRO",
        success: function (blogCommentsContainer) {
            if (blogCommentsContainer.Success === "ok") {
                $.each(blogCommentsContainer.BlogComments, function (idx, blogComment) {
                    promoMessagesArray.push({
                        //FolderId: blogComment.FolderId,
                        //Link: blogComment.ImageLink,
                        CommentTitle: blogComment.CommentTitle,
                        CommentText: blogComment.CommentText
                    });
                });
                //showPromoMessages(promoMessagesArray);
            }
            else {
                alert("launchPromoMessages: " + blogCommentsContainer.Success);
                logError("XHR", 3908, blogCommentsContainer.Success, "launchPromoMessages");
            }
        },
        error: function (jqXHR) {
            $('#indexPageLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "launchPromoMessages")) logError("XHR", 3908, errMsg, "launchPromoMessages");
        }
    });
}

function showPromoMessages(promoMessagesArray) {
    $('#promoContainer').html(
        "<div id='promoContainerTitle' class='ogglePromoTitle'></div>\n" +
        "<div id='promoContainerText' class='ogglePromoText'></div>\n" +
        "<div onclick='killPromoMessages()' class='tinyDots' onmouseover='$(\"#killPromoPrompt\").show()' onmouseout='$(\"#killPromoPrompt\").hide()'>...</div>\n" +
        "<div id='killPromoPrompt' class='ogglePromoKillMessage'>had enough promo messages?</div>");

    $('#promoContainer').fadeIn(800,"");
    $('#promoContainer').draggable().resizable();
    //$('#promoContainerText').resizable();
    //alert("promoMessagesArray[promoIdx].CommentTitle: " + promoMessagesArray[promoIdx].CommentTitle);
    $('#promoContainerTitle').html(promoMessagesArray[promoIdx].CommentTitle);
    $('#promoContainerText').html(promoMessagesArray[promoIdx].CommentText);

    promoMessageRotator = setInterval(function () {
        if (promoIdx === promoMessagesArray.length) promoIdx = 0;        
        currentItem = promoMessagesArray[promoIdx];
        $('#promoContainerTitle').html(promoMessagesArray[promoIdx].CommentTitle);
        $('#promoContainerText').html(promoMessagesArray[promoIdx].CommentText);
        promoIdx++;
    }, promoMessageRotationSpeed);
}

function killPromoMessages() {
    $('#promoContainer').fadeOut();
    clearInterval(promoMessageRotator);
    setInterval(function () { showPromoMessages() }, 30000);
}

function showMoreGalleries() {
    numUpdatedGalleries += 25;
    loadUpdatedGalleriesBoxes();
}

function showHideGalleries() {
    $('#bottomSection').toggle();
    //$('#updatedGalleriesSection').toggle();
    $('#showMoreGalleriesDiv').toggle();
    // make slideshow area bigger
    resizeIndexPage();
}

function refreshRandomGalleries() {
    //let visitorId = getCookieValue("VisitorId", "refresh RandomGalleries")
    loadRandomGalleries();
    logActivity("RRG", 555, "index page");
    //sendEmail("CurtishRhodes@hotmail.com", "button_click7775@Ogglebooble.com", "Random Galleries Refreshed", "<br/>visitor: " + visitorId);
}

function randomGalleriesImageError(folderId, imgSrc) {
    try {
        console.error("randomGalleriesImageError: " + imgSrc);
        $('#rg' + folderId).hide();
        //alert("randomGalleriesImageError\nfolderId: " + folderId + " imgSrc: " + imgSrc);
        //logError("BUG", folderId, imgSrc, "load randomGalleries");

    } catch (e) {
        console.error("randomGalleriesImageError CAT: " + e);
        //logError("CAT", folderId, e, "load randomGalleries");
    }
}

function goToPorn() {
    //if(hasPorn)
    //if (document.domain === 'localhost') alert("goToPorn()");
    // if user porn status not already set
    showCustomMessage(35);
}

function resizeIndexPage() {
    // set page width
    let winW = $(window).width(), lcW = $('.leftColumn').width(), rcW = $('.rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);
    //set page height
    let winH = $(window).height();
    let headerH = $('#oggleHeader').height();
    $('.threeColumnLayout').css("min-height", winH - headerH);
//    alert("winH: " + winH + " headerH: " + headerH + "= " + $('.threeColumnLayout').height());

    // height
    //$('#topIndexPageSection').height((winH - headerH - 100));
    //$('#topIndexPageSection').height((winH - headerH) * .65);
    $('#topIndexPageSection').css("height", (winH - headerH - 100));
    $('#topIndexPageSection').css("height", (winH - headerH) * .65);
    // width

    $('section').css("background-color", "#d5d1ba");
    if (winW < 1500) {
        $('section').css("background-color", "red");
    }
}

function playboyPageHTML() {
    return "<div class='playboyShell'> <div class='indexPageSection' id='topIndexPageSection'>\n" +
        "       <div class='sectionLabel'>random galleries</div>\n" +
        "           <div id='carouselContainer'></div>\n" +
        "   </div>\n" +
        "   <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "   <div class='indexPageSection' id='bottomSection'>\n" +
        "   <div id='updatedGalleriesSection' class='updatedGalleriesSection'></div>\n" +
        "   <div id='showMoreGalleriesDiv' class='clickable sectionLabel' onclick='showMoreGalleries()'>show more updated galleries</div>\n";
}

function indexPageHTML() {
    return "" +
        "<div class='indexPageSection' id='topIndexPageSection'>\n" +
        "   <div class='sectionLabel'>random galleries</div>\n" +
        "   <div id='promoContainer' class='promoContainer' >my promo message</div>\n" +
        "   <div id='carouselContainer'></div>\n" +
        "</div>\n" +

        "<div id='testFunctionClick' class='testFunctionLabel' onclick='testFunction()'>reformat hard drive</div>\n" +
        "<div class='indexPageSection' id='bottomSection'>\n" +
        "   <div id='showRandomGalleriesLabel' class='displayHidden clickable sectionLabel' onclick='refreshRandomGalleries()' title='refresh random galleries'>random galleries" +
        "      <img src='images/refresh02.png' height='22' />" +
        "   </div>\n" +
        "   <div id='rgSectionContainer' class='randomGalleriesSectionContainer'></div>\n" +
        "   <div id='lblLatestUpdates' class='clickable sectionLabel' onclick='showHideGalleries()' title='show hide'>latest updates</div>\n" +
        "   <div id='updatedGalleriesSection' class='updatedGalleriesSection'></div>\n" +
        "   <div id='showMoreGalleriesDiv' class='clickable sectionLabel' onclick='showMoreGalleries()'>show more updated galleries</div>\n" +
        "</div>\n";
}
