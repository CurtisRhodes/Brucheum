let latestGallerySubdomain;
function indexStartup() {
    $('#indexMiddleColumn').html(indexPageHTML());
    setOggleHeader(3908, "index");
    setOggleFooter(3908, "index");
    changeFavoriteIcon("redBallon");
    document.title = "welcome : OggleBooble";
    //launchPromoMessages();
    latestGallerySubdomain = "boobs";
    launchCarousel("boobs");
    $('.indexPageSection').show();
    loadUpdatedGalleriesBoxes(updatedGalleriesCount, "boobs");
}

function pornStartup() {
    $('#indexMiddleColumn').html(indexPageHTML());
    setOggleHeader(spaPageId, "porn");
    setOggleFooter(spaPageId, "porn");
    changeFavoriteIcon("porn");
    document.title = "OgglePorn";
    latestGallerySubdomain = "porn";
    launchCarousel("porn");
    $('.threeColumnLayout').css("background-color", "#d279a6");
    //if (subdomain == "porn")
    //    $('.threeColumnLayout').css("background-color", "var(--oggleBackgroundColor)");
    //else
    //    $('.threeColumnLayout').css("background-color", "#d279a6");

    $('#updatedGalleriesSectionLoadingGif').show();
    loadUpdatedGalleriesBoxes(updatedGalleriesCount, "porn");
    // set porn colors
}

function playboyStartup() {
    $('#indexMiddleColumn').html(playboyPageHTML());
    setOggleHeader(spaPageId, "playboyIndex");
    setOggleFooter(spaPageId, "centerfold");
    changeFavoriteIcon("centerfold");
    document.title = "Every Playboy Centerfold";
    latestGallerySubdomain = "centerfold";
    launchCarousel("centerfold");
    $('#updatedGalleriesSectionLoadingGif').show();
    loadUpdatedGalleriesBoxes(updatedGalleriesCount, "centerfold");
}

function playboyPageHTML() {
    return "<div class='playboyShell'> <div class='indexPageSection' id='topIndexPageSection'>\n" +
        "       <div class='sectionLabel'>random galleries</div>\n" +
        "           <div id='carouselContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "    <div class='indexPageSection' id='bottomSection'>\n" +
        "        <div id='updatedGalleriesSection' class='updatedGalleriesSection'>" +
        "           <img id='updatedGalleriesSectionLoadingGif' class='containerloadingGif' src='Images/loader.gif' />" +
        "       </div>\n" +
        "    </div></div>\n" +
        "    <div id='showMoreGalleriesDiv' class='clickable sectionLabel' " +
        "       onclick='showMoreGalleries()'>show more updated galleries</div>\n";

}

function indexPageHTML() {
    return " <div class='indexPageSection' id='topIndexPageSection'>\n" +
        "       <div class='sectionLabel'>random galleries</div>\n" +
        "           <div id='carouselContainer'></div>\n" +
        "    </div>\n" +
        "    <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "    <div class='indexPageSection' id='bottomSection'>\n" +
        "        <div id='updatedGalleriesSection' class='updatedGalleriesSection'>" +
        "           <img id='updatedGalleriesSectionLoadingGif' class='containerloadingGif' src='Images/loader.gif' />"+
        "       </div>\n" +
        "    </div>\n" +
        "    <div id='showMoreGalleriesDiv' class='clickable sectionLabel' " +
        "       onclick='showMoreGalleries()'>show more updated galleries</div>\n";
}

function loadUpdatedGalleriesBoxes(numItmes) {
    let settingsImgRepo = settingsArray.ImageRepo, thisItemSrc;
    $('#updatedGalleriesSectionLoadingGif').show();
    let getLatestStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/LatestUpdates/GetLatestUpdatedFolders?take=" + numItmes + "&root=" + latestGallerySubdomain,
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
                            "onclick='rtpe(\"LUP\",\"Index page\",\"" + latestGallerySubdomain + "\"," + LatestUpdate.FolderId + ")' />" +
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
            else logError("AJX", 3908, latestUpdates.Success, "loadUpdatedGalleriesBoxes");
        },
        error: function (jqXHR) {
            if (!checkFor404("loadUpdatedGalleriesBoxes")) {
                logError("XHR", 3908, getXHRErrorDetails(jqXHR), "loadUpdatedGalleriesBoxes");
            }
        }
    });
}

function latestGalleryImageError(folderId, thisItemSrc) {    
    $('#lt' + folderId).attr('src', "Images/redballon.png");
    logError("ILF", folderId, "Src: " + thisItemSrc, "get latest Galleries");
}

function launchPromoMessages() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/OggleBlog/GetBlogList?commentType=PRO",
        success: function (blogCommentsContainer) {
            if (blogCommentsContainer.Success === "ok") {
                $.each(blogCommentsContainer.blogComments, function (idx, blogComment) {
                    promoMessagesArray.push({
                        FolderId: blogComment.Id,
                        Link: blogComment.Link,
                        CommentTitle: blogComment.CommentTitle,
                        CommentText: blogComment.CommentText
                    });
                });
                showPromoMessages();
            }
            else {
                logError("XHR", 3908, blogCommentsContainer.Success, "launchPromoMessages");
            }
        },
        error: function (jqXHR) {
            $('#indexPageLoadingGif').hide();
            if (!checkFor404("launchPromoMessages")) {
                logError("XHR", 3908, getXHRErrorDetails(jqXHR), "launchPromoMessages");
            }
        }
    });
}

function showPromoMessages() {
    $('#promoContainer').fadeIn();
    var currentItem = promoMessagesArray[promoIdx];
    $('#promoContainerTitle').html(currentItem.CommentTitle);
    $('#promoContainerText').html(currentItem.CommentText);

    promoMessageRotator = setInterval(function () {

        if (promoIdx === promoMessagesArray.length) {
            promoIdx = 0;
        }
        currentItem = promoMessagesArray[promoIdx];
        $('#promoContainerTitle').html(currentItem.CommentTitle);
        $('#promoContainerText').html(currentItem.CommentText);
        promoIdx++;
    }, promoMessageRotationSpeed);
}

function killPromoMessages() {
    $('#promoContainer').fadeOut();
    clearInterval(promoMessageRotator);
    setInterval(function () { showPromoMessages() }, 30000);
}

function showMoreGalleries() {
    updatedGalleriesCount += 15;
    loadUpdatedGalleriesBoxes(updatedGalleriesCount);
}

function showHideGalleries() {
    $('#updatedGalleriesSection').toggle();
    $('#showMoreGalleriesDiv').toggle();
    resizeIndexPage();
}

function showPromoMessagesHtml() {
    $('#promoMessagesContainer').html(
        "<div id='promoContainer' class='ogglePromoContainer'>\n" +
        "    <div id='promoContainerTitle' class='ogglePromoTitle'></div>\n" +
        "    <div id='promoContainerText' class='ogglePromoText'></div>\n" +
        "    <div onclick='killPromoMessages()' class='tinyDots' onmouseover='$('#killPromoPrompt').show()' onmouseout='$('#killPromoPrompt').hide()'>...</div>\n" +
        "    <div id='killPromoPrompt' class='ogglePromoKillMessage'>had enough promo messages?</div>\n" +
        "</div>\n");
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
        //window.localStorage["IsLoggedIn"] = "true";
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
