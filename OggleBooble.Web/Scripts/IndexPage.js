let promoMessagesArray = new Array(),
    promoIdx = 0,
    promoMessageRotator = null,
    promoMessageRotationSpeed = 15000,
    numUpdatedGalleries = 25,
    spaType = "archive";

function displaySpaPage(spaPageId) {
    switch (Number(spaPageId)) {
        case 3907:
            rankerStartup(params.bp);
            break;
        case 3911:
            blogStartup();
            break;
        case 3910:
            dashboardStartup();
            break;
        case 3908:  //indexStartup();
            document.title = "welcome : OggleBooble";
            changeFavoriteIcon("redBallon");
            spaType = "boobs";
            $('#indexMiddleColumn').html(indexPageHTML());
            setOggleHeader("index");
            setOggleFooter(3908, "index");
            launchCarousel("boobs");
            $('.indexPageSection').show();
            loadUpdatedGalleriesBoxes();
            resetOggleHeader(3908, "boobs");
            //setTimeout(function () { launchPromoMessages(); }, 3000);
            break;
        case 3909: // porn
            spaType = "porn";
            $('#indexMiddleColumn').html(indexPageHTML());
            setOggleHeader("porn");
            setOggleFooter(spaPageId, "porn");
            launchCarousel("porn");
            // set porn colors
            $('.threeColumnLayout').css("background-color", "#d279a6");
            //if (subdomain == "porn")
            //    $('.threeColumnLayout').css("background-color", "var(--oggleBackgroundColor)");
            //else
            //    $('.threeColumnLayout').css("background-color", "#d279a6");
            $('#updatedGalleriesSectionLoadingGif').show();
            loadUpdatedGalleriesBoxes();
            break;
        case 72: // every playboy centerfold
            spaType = "centerfold";
            $('#indexMiddleColumn').html(playboyPageHTML());
            setOggleHeader("playboyIndex");
            resetOggleHeader(72, "playboyIndex");
            setOggleFooter(spaPageId, "centerfold");
            launchCarousel("centerfold");
            $('#updatedGalleriesSectionLoadingGif').show();
            loadUpdatedGalleriesBoxes();
            break;
        default:
            alert("spaPageId: " + spaPageId + " not found");
            break;
    }
}

function loadUpdatedGalleriesBoxes() {
    let settingsImgRepo = settingsArray.ImageRepo, thisItemSrc;
    $('#updatedGalleriesSectionLoadingGif').show();
    let getLatestStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/LatestUpdates/GetLatestUpdatedFolders?take=" + numUpdatedGalleries + "&root=" + spaType,
        success: function (latestUpdates) {
            if (latestUpdates.Success === "ok") {
                //$('#updatedGalleriesSectionLoadingGif').hide();
                $('#updatedGalleriesSection').html("");
                $.each(latestUpdates.LatestTouchedGalleries, function (idx, LatestUpdate) {
                    if (!isNullorUndefined(LatestUpdate.ImageFile)) {
                        //if (idx === 0) alert("LatestUpdate.ImageFile: " + LatestUpdate.ImageFile);

                        thisItemSrc = settingsImgRepo + LatestUpdate.ImageFile;
                        //console.log(LatestUpdate.FolderName + ". src: " + src);
                        //rtpe(eventCode, calledFrom, eventDetail, folderId)

                        $('#updatedGalleriesSection').append("<div class='newsContentBox'>" +
                            "<div class='newsContentBoxLabel'>" + LatestUpdate.FolderName + "</div>" +
                            "<img id='lt" + LatestUpdate.FolderId + "' class='newsContentBoxImage' " +
                            "onerror='latestGalleryImageError(" + LatestUpdate.FolderId + ",\"" + thisItemSrc + "\")' src='" + thisItemSrc + "'" +
                            "onclick='rtpe(\"LUP\",\"" + spaType + "\",\"" + LatestUpdate.FolderName + "\"," + LatestUpdate.FolderId + ")' />" +
                            "<div class='newsContentBoxDateLabel'>updated: " + dateString2(LatestUpdate.Acquired) + "</span></div>" +
                            "</div>");
                    }
                });
                //$('.sectionLabel').show();
                resizeIndexPage();
                setTimeout(function () { resizeIndexPage(); }, 300);
                var delta = (Date.now() - getLatestStart) / 1000;
                console.log("loaded " + latestUpdates.LatestTouchedGalleries.length + " news boxes.  Took: " + delta.toFixed(3));
            }
            else logError("AJX", 3908, latestUpdates.Success, "load Updated Galleries Boxes");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = "load Updated Galleries Boxes"; //arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", subdomain, errMsg, functionName);
        }
    });
}

function latestGalleryImageError(folderId, thisItemSrc) {    
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
                showPromoMessages(promoMessagesArray);
            }
            else {
                alert("launchPromoMessages: " + blogCommentsContainer.Success);
                logError("XHR", 3908, blogCommentsContainer.Success, "launchPromoMessages");
            }
        },
        error: function (jqXHR) {
            $('#indexPageLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = "launchPromoMessages"; // arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR",3908, errMsg, functionName);
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
    $('#updatedGalleriesSection').toggle();
    $('#showMoreGalleriesDiv').toggle();
    resizeIndexPage();
}

function goToPorn() {

    //if(hasPorn)
    //if (document.domain === 'localhost') alert("goToPorn()");

    // if user porn status not already set
    showCustomMessage(35);
}

function localhostBypass() {
    if (document.domain === 'localhost') {
        setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");

        let visitorId = getCookieValue("VisitorId");
        console.log("localhostBypass visitorId: " + visitorId);
        setCookieValue("UserName", "developer");
        window.localStorage["IsLoggedIn"] = "true";
    }
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
        "       <div id='testMessage1' class='indexPageHappyMessage' >start</div>\n" +
        "           <div id='carouselContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "    <div class='indexPageSection' id='bottomSection'>\n" +
        "        <div id='updatedGalleriesSection' class='updatedGalleriesSection'>" +
        "           <img id='updatedGalleriesSectionLoadingGif' class='containerloadingGif' title='loading gif' alt='' src='Images/loader.gif' />" +
        "       </div>\n" +
        "    </div></div>\n" +
        "    <div id='showMoreGalleriesDiv' class='clickable sectionLabel' " +
        "       onclick='showMoreGalleries()'>show more updated galleries</div>\n";
}

function indexPageHTML() {
    return " <div class='indexPageSection' id='topIndexPageSection'>\n" +
        "       <div class='sectionLabel'>random galleries</div>\n" +
        "       <div id='testMessage1' class='indexPageHappyMessage' >00</div>\n" +
        "       <div id='promoContainer' class='promoContainer' >my promo message</div>\n" +
        "       <div id='carouselContainer'></div>\n" +
        "    </div>\n" +
        //"    <div class='clickable sectionLabel' onclick='cureWIPproblem(211,\"018d1162-61a6-4987-bd90-add6fac518c6\",\"WIP\")'>cure WIP problem</div>\n" +
        //"    <div class='clickable sectionLabel' onclick='myMsgTest()'>showMyAlert test</div>\n" +
        //"    <div class='clickable sectionLabel' onclick='testgetIp()'>tryIpx</div><br/>\n" +
        //"    <div class='clickable sectionLabel' onclick='testgetIp()'>addNonIpVisitor</div>\n" +
        "    <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "    <div class='indexPageSection' id='bottomSection'>\n" +
        "        <div id='updatedGalleriesSection' class='updatedGalleriesSection'>" +
        "           <img id='updatedGalleriesSectionLoadingGif' class='containerloadingGif' title='loading gif' alt='' src='Images/loader.gif' />" +
        "       </div>\n" +
        "    </div>\n" +
        "    <div id='showMoreGalleriesDiv' class='clickable sectionLabel' " +
        "       onclick='showMoreGalleries()'>show more updated galleries</div>\n";
}
