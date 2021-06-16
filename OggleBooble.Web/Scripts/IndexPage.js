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
            setOggleFooter(3908, "index", "index");
            launchCarousel("boobs");
            $('.indexPageSection').show();
            loadUpdatedGalleriesBoxes();
            resetOggleHeader(3908, "boobs");
            //setTimeout(function () { launchPromoMessages(); }, 3000);
            
            //$('#badgesContainer').html("badgesContainer");

            break;
        case 3909: // porn
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
            loadUpdatedGalleriesBoxes();
            resetOggleHeader(3909, "porn");
            break;
        case 72: // every playboy centerfold
            spaType = "centerfold";
            $('#indexMiddleColumn').html(playboyPageHTML());
            setOggleHeader("playboyIndex");
            resetOggleHeader(72, "playboyIndex");
            setOggleFooter(spaPageId, "centerfold", "centerfold");
            launchCarousel("centerfold");
            $('#updatedGalleriesSectionLoadingGif').show();
            loadUpdatedGalleriesBoxes();
            break;
        default:
            if (document.domain === 'localhost') alert("spaPageId: " + spaPageId + " not found");
            logError("SWT", spaPageId, spaPageId, "displaySpaPage");
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

                        if (isNullorUndefined(LatestUpdate.ImageFile)) {
                            thisItemSrc = "/Images/binaryCodeRain.gif";
                            logError("FIM", folder.FolderId, "UpdatedGalleriesBox image missing", "load UpdatedGalleriesBoxes");
                        }
                        else
                            thisItemSrc = settingsImgRepo + LatestUpdate.ImageFile;

                        $('#updatedGalleriesSection').append("<div class='newsContentBox'>" +
                            "<div class='newsContentBoxLabel'>" + LatestUpdate.FolderName + "</div>" +
                            "<img id='lt" + LatestUpdate.FolderId + "' class='newsContentBoxImage' " +
                            "alt='Images/redballon.png' "+
                            "onerror='latestGalleryImageError(" + LatestUpdate.FolderId + ",\"" + thisItemSrc + "\")' src='" + thisItemSrc + "'" +
                            "onclick='rtpe(\"LUP\",\"" + spaType + "\",\"" + LatestUpdate.FolderName + "\"," + LatestUpdate.FolderId + ")' />" +
                            "<div class='newsContentBoxDateLabel'>updated: " + dateString2(LatestUpdate.Acquired) + "</span></div>" +
                            "</div>");
                    }
                });
                $('.sectionLabel').show();
                resizeIndexPage();
                setTimeout(function () { resizeIndexPage(); }, 300);
                var delta = (Date.now() - getLatestStart) / 1000;
                console.log("loaded " + latestUpdates.LatestTouchedGalleries.length + " news boxes.  Took: " + delta.toFixed(3));
            }
            else logError("AJX", 3908, latestUpdates.Success, "load Updated Galleries Boxes");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "load Updated Galleries Boxes")) logError("XHR", subdomain, errMsg, "load Updated Galleries Boxes");
        }
    });
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
        //"       <div id='testMessage1' class='indexPageHappyMessage'></div>\n" +
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
        //"       <div id='testMessage1' class='indexPageHappyMessage'></div>\n" +
        "       <div id='promoContainer' class='promoContainer' >my promo message</div>\n" +
        "       <div id='carouselContainer'></div>\n" +
        "    </div>\n" +
        //"    <div class='clickable sectionLabel' onclick='myMsgTest()'>showMyAlert test</div>\n" +
        "    <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "    <div class='indexPageSection' id='bottomSection'>\n" +
        "        <div id='updatedGalleriesSection' class='updatedGalleriesSection'>" +
        "           <img id='updatedGalleriesSectionLoadingGif' class='containerloadingGif' title='loading gif' alt='' src='Images/loader.gif' />" +
        "       </div>\n" +
        "    </div>\n" +
        "    <div id='showMoreGalleriesDiv' class='clickable sectionLabel' " +
        "       onclick='showMoreGalleries()'>show more updated galleries</div>\n";
}
