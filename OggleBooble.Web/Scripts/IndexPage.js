let promoMessagesArray = new Array(),
    promoIdx = 0,
    promoMessageRotator = null,
    promoMessageRotationSpeed = 15000,
    numUpdatedGalleries = 24,
    spaType = "archive";

function displaySpaPage(spaPageId) {
    switch (Number(spaPageId)) {
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
            launchCarousel("boobs");
            resetOggleHeader(3908, "boobs");
            //setTimeout(function () { loadLatestUpdates(); }, 3000);
            loadLatestUpdates();
            loadRandomGalleries();
            //setTimeout(function () { launchPromoMessages(); }, 3000);
            //$('#testFunctionClick').show();
            resizeIndexPage();
            break;  //index page;
        case 3909:
            spaType = "porn";
            $('#indexMiddleColumn').html(indexPageHTML());
            setOggleHeader("porn");
            setOggleFooter(spaPageId, "porn", "porn");
            launchCarousel("porn");
            // set porn colors
            $('.threeColumnLayout').css("background-color", "#d279a6");
            //if (subdomain == "porn")
            //    $('.threeColumnLayout').css("background-color", "var(--oggleBackgroundColor)");
            //else
            //    $('.threeColumnLayout').css("background-color", "#d279a6");
            $('#updatedGalleriesSectionLoadingGif').show();
            loadLatestUpdates();
            resetOggleHeader(3909, "porn");
            break; // porn
        case 72: 
            spaType = "centerfold";
            $('#indexMiddleColumn').html(playboyPageHTML());
            setOggleHeader("playboyIndex");
            resetOggleHeader(72, "playboyIndex");
            setOggleFooter(spaPageId, "centerfold", "centerfold");
            launchCarousel("centerfold");
            $('#updatedGalleriesSectionLoadingGif').show();
            loadLatestUpdates();
            break; // every playboy centerfold
        default:
            if (document.domain === 'localhost') alert("spaPageId: " + spaPageId + " not found");
            logError("SWT", spaPageId, spaPageId, "displaySpaPage");
            break;
    }
}

function loadLatestUpdates() {
    if (isNullorUndefined(window.localStorage[spaType + "latestUpdatesCache"])) {
        console.log("no " + spaType + "latestUpdatesCache found.");
    }
    else {
        console.log("latestUpdates " + spaType + "latestUpdatesCache loaded from cache.");
        loadLatestUpdateArray(JSON.parse(window.localStorage[spaType + "latestUpdatesCache"]), "cache");
    }
    //$('#updatedGalleriesSectionLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/IndexPage/GetLatestUpdatedFolders?take=" + numUpdatedGalleries + "&root=" + spaType,
        success: function (latestUpdates) {
            if (latestUpdates.Success === "ok") {
                window.localStorage[spaType + "latestUpdatesCache"] = JSON.stringify(latestUpdates.LatestTouchedGalleries);
                loadLatestUpdateArray(latestUpdates.LatestTouchedGalleries, "ajax");
            }
            else logError("AJX", 3908, latestUpdates.Success, "load LatestUpdates");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 619845, "load Updated Galleries Boxes")) logError("XHR", 619846, errMsg, "load Updated Galleries Boxes");
        }
    });
}

function loadLatestUpdateArray(latestTouchedGalleries, calledFrom) {
    console.log("loadLatestUpdateArray: " + calledFrom);
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
}

function loadRandomGalleries() {
    if (isNullorUndefined(window.localStorage[spaType + "randomGalleriesCache"])) {
        console.log("no " + spaType + " cache found");
    }
    else {
        console.log("loading " + spaType + " random galleries from cache");
        loadRandomGalleriesArray(JSON.parse(window.localStorage[spaType + "randomGalleriesCache"], "cache"));
    }
    //$('#randomGalleriesSectionLoadingGif').hide();
    let randGalleryCount = 9;
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/IndexPage/GetRandomGalleries?take=" + randGalleryCount + "&root=" + spaType,
        success: function (randomGalleriesModel) {
            if (randomGalleriesModel.Success === "ok") {
                window.localStorage[spaType + "latestUpdatesCache"] = JSON.stringify(randomGalleriesModel.RandomGalleries);
                loadRandomGalleriesArray(randomGalleriesModel.RandomGalleries, "ajax");
            }
            else logError("AJX", 3908, randomGalleriesModel.Success, "show RandomGalleries");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 619845, "show RandomGalleries")) logError("XHR", 619846, errMsg, "show RandomGalleries");
        }
    });
}

function loadRandomGalleriesArray(randomGalleriesArray,calledFrom) {
    console.log("loadRandomGalleriesArray: " + calledFrom);
    $('#rgSectionContainer').show().html("");
    let rndItemSrc = "/Images/binaryCodeRain.gif";
    let winWidth = $(window).width();
    let winWidthss = $('#rgSectionContainer').width();
    $.each(randomGalleriesArray, function (idx, randomGallery) {
        //if (winWidthss < winWidth)
        {
            rndItemSrc = settingsImgRepo + randomGallery.FolderPath + "/" + randomGallery.FileName;
            $('#rgSectionContainer').append("<div id='rg" + randomGallery.FolderId + "' class='newsContentBox'>" +
                "<div class='newsContentBoxLabel'>" + randomGallery.FolderName + "</div>" +
                "<img id='lt" + randomGallery.FolderId + "' class='newsContentBoxImage' " +
                "alt='Images/redballon.png' " +
                "onerror='randomGalleriesImageError(" + randomGallery.FolderId + ",\"" + rndItemSrc + "\")' src='" + rndItemSrc + "'" +
                "onclick='rtpe(\"RGC\",\"" + spaType + "\",\"" + randomGallery.FolderName + "\"," + randomGallery.FolderId + ")' />" +
                "</div>");
        }
        //let fff = $('#rgSectionContainer');
        winWidthss = $('#rgSectionContainer').width();
        winWidths1 = $('#randomGalleriesSection').innerWidth();
        if (winWidthss > winWidth)
            $('#rg' + randomGallery.FolderId).hide();

    });
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
                pause();
                alert("image error\npage: " + folderId + ",\nLink: " + thisItemSrc);
                console.log("image error\npage: " + folderId + ",\nLink: " + thisItemSrc);
            }
        }
    }, 600);
}

function testFunction() {

    // time to log in
    showCustomMessage('09b40acd-083e-44fe-970d-0a57d1a61360', false);
    //$('#customMessageContainer').css("top", 255);
    $('#customMessageContainer').css("left", 260);
    $('#customMessageContainer').css("width", 1200);


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
    loadRandomGalleries();
}

function randomGalleriesImageError(folderId, imgSrc) {
    $('#rg' + folderId).hide();
    alert("randomGalleriesImageError\nfolderId: " + folderId + " imgSrc: " + imgSrc);
    logError("DRV", folderId, imgSrc, "load randomGalleries");
    //" + randomGallery.FolderId + ", \"" + rndItemSrc + "\")'
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
    $('#topIndexPageSection').height((winH - headerH - 100));
    $('#topIndexPageSection').height((winH - headerH) * .65);
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
