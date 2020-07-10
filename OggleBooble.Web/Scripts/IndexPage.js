
function indexStartup(spaPageId) {
    $('#indexMiddleColumn').html(indexPageHTML());
    if (spaPageId === 3909) {
        setOggleHeader(spaPageId, "porn");
        setOggleFooter(spaPageId, "porn");
        changeFavoriteIcon("porn");
        document.title = "welcome : OgglePorn";
        launchCarousel("porn");
    }
    else {
        setOggleHeader(spaPageId, "index");
        setOggleFooter(spaPageId, "boobs");
        changeFavoriteIcon("redBallon");
        document.title = "welcome : OggleBooble";

        $('#topIndexPageSection').html(
            "<div class='centeringOuterShell'>\n" +
            "   <div class='centeringInnerShell'>\n" +
            "       <img class='loadingImage' src='/Images/ingranaggi3.gif'/>\n" +
            "   </div>\n" +
            "</div>\n");

        //launchPromoMessages();
        launchCarousel("boobs");
        loadUpdatedGalleriesBoxes(updatedGalleriesCount, subdomain);
    }
}

function indexPageHTML() {
    return " <div class='indexPageSection' id='topIndexPageSection'>\n" +
        "        <div class='flexContainer'>\n" +
        "            <div class='sectionLabel'>random galleries</div>\n" +
        "            <div id='carouselContainer'>" +
        "            </div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "    <div class='clickable sectionLabel' onclick='showHideGalleries()'>latest updates</div>\n" +
        "    <div class='indexPageSection' id='bottomSection'>\n" +
        "        <div id='updatedGalleriesSection' class='updatedGalleriesSection'></div>\n" +
        "    </div>\n" +
        "    <div id='showMoreGalleriesDiv' class='clickable sectionLabel' " +
        "       onclick='showMoreGalleries()'>show more updated galleries</div>\n";
}

function loadUpdatedGalleriesBoxes(numItmes, subdomain) {
    let settingsImgRepo = settingsArray.ImageRepo, thisItemSrc;
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/IndexPage/GetLatestUpdatedFolders?take=" + numItmes + "&rootFolder=" + subdomain,
        success: function (latestUpdates) {
            if (latestUpdates.Success === "ok") {
                $('#updatedGalleriesSection').html("");
                $.each(latestUpdates.LatestTouchedGalleries, function (idx, LatestUpdate) {
                    if (!isNullorUndefined(LatestUpdate.ImageFile)) {
                        //if (idx === 0) alert("LatestUpdate.ImageFile: " + LatestUpdate.ImageFile);

                        thisItemSrc = settingsImgRepo + LatestUpdate.ImageFile;
                        //console.log(LatestUpdate.FolderName + ". src: " + src);
                        $('#updatedGalleriesSection').append("<div class='newsContentBox'>" +
                            "<div class='newsContentBoxLabel'>" + LatestUpdate.FolderName + "</div>" +
                            "<img id='lt" + LatestUpdate.FolderId + "' class='newsContentBoxImage' " +
                            "onerror='latestGalleryImageError(" + LatestUpdate.FolderId + ",\"" + thisItemSrc + "\")' src='" + thisItemSrc + "'" +
                            "onclick='rtpe(\"LUP\",\"home page\",10," + LatestUpdate.FolderId + ")'/>" +
                            "<div class='newsContentBoxDateLabel'>updated: " + dateString2(LatestUpdate.Acquired) + "</span></div>" +
                            "</div>");
                    }
                });
                $('.indexPageSection').show();
                $('.sectionLabel').show();
                console.log("loaded " + latestUpdates.LatestTouchedGalleries.length + " news boxes");
                resizeIndexPage();
            }
            else {
                if (document.domain === 'localhost')
                    alert("JQA error in loadUpdatedGalleriesBoxes\n" + latestUpdates.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "JQA",
                        Severity: 12,
                        ErrorMessage: latestUpdates.Success,
                        CalledFrom: "loadUpdatedGalleriesBoxes"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadImages")) {
                if (document.domain === 'localhost')
                    alert("XHR error in loadUpdatedGalleriesBoxes\n" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "loadUpdatedGalleriesBoxes"
                    });
            }
        }
    });
}

function latestGalleryImageError(folderId, thisItemSrc) {    
    //alert("latestGalleryImageError: " + folderId);
    //alert("latestGallery src: " + $('#lt' + folderId).attr('src'));
    $('#lt' + folderId).attr('src', "Images/redballon.png");
    logDataActivity({
        VisitorId: getCookieValue("VisitorId"),
        ActivityCode: "IME",
        PageId: folderId,
        Activity: thisItemSrc
    });
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
                $('#blogLoadingGif').hide();
                sendEmailToYourself("FAIL in Index.Html launchPromoMessages", "/api/OggleBlog/GetBlogList?commentType=PRO" +
                    "<br/>Called from: " + getCookieValue("IpAddress") + "<br/>Message: " + blogCommentsContainer.Success);
                //alert("loadPromoMessages: " + blogCommentsContainer.Success)
            }
        },
        error: function (jqXHR) {
            $('#blogLoadingGif').hide();
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "launchPromoMessages")) {
                sendEmailToYourself("XHR ERROR in Index.Html launchPromoMessages ", "/api/OggleBlog/GetBlogList?commentType=PRO" +
                    "Called from: " + getCookieValue("IpAddress") + "  folderId: " + folderId + " Message: " + errorMessage);
            }
            //alert("launchPromoMessages jqXHR : " + getXHRErrorDetails(jqXHR, exception) + "settingsArray.ApiServer: " + settingsArray.ApiServer);
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
