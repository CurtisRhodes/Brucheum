
function loadUpdatedGalleriesBoxes(numItmes) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/LatestUpdates/GetLatestUpdatedFolders?itemLimit=" + numItmes,
        success: function (latestUpdates) {
            if (latestUpdates.Success === "ok") {
                $('.sectionLabel').show();
                $('#updatedGalleriesSection').html("");

                $.each(latestUpdates.LatestUpdates, function (idx, LatestUpdate) {
                    $('#updatedGalleriesSection').append("<div class='newsContentBox'>" +
                        "<div class='newsContentBoxLabel'>" + LatestUpdate.FolderName + "</div>" +
                        "<img class='newsContentBoxImage' src='" + LatestUpdate.FolderImage + "'" +
                        "onclick='rtpe(\"LUP\",\"home page\",10," + LatestUpdate.FolderId + ")'/>" +
                        "<div class='newsContentBoxDateLabel'>updated: " + $.date(LatestUpdate.LastModified) + "</span></div>" +
                        "</div>");
                });
                console.log("loaded " + latestUpdates.LatestUpdates.length + " news boxes");
                resizeIndexPage();
            }
            else {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "ERR",
                    Severity: 12,
                    ErrorMessage: latestUpdates.Success,
                    CalledFrom: "loadUpdatedGalleriesBoxes"
                });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadImages")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "loadUpdatedGalleriesBoxes"
                });
                //sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take +
                //    "  Message: " + errorMessage);
            }
        }
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
