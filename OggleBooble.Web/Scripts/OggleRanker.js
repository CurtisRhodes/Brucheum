let spinSpeed = 200,
    rankerLinksArray = [],
    countDownTimer, slotTimer, spinRate = 8,
    spinSwapSpeed = 133, spinCount = 0,
    leftimageIndex, rightimageIndex,
    skip = 0, take = 40,
    throttleBoobs = false,
    throttlePlayboy = false,
    throttleArchive = false,
    throttlePorn = false,
    throttleSluts = false,
    userName;

function rankerStartup(rankPref) {

    //alert("rankPref: " + rankPref);

    if (isNullorUndefined(rankPref))
        rankPref = "boobs";

    if (rankPref === "big naturals")
        rankPref = "archive";
    //else
    //    alert("rankPref: " + rankPref);


    document.title = "Hot or Not : OggleBooble";
    $('#indexMiddleColumn').html(rankerHTML());
    setInitialCheckbox(rankPref);
    loadBoobsRanker(rankPref);
    setOggleHeader(spaPageId, "dashboard");
    setOggleFooter(spaPageId, "blog");

    setRankerBreadcrumbMessage();
    //userName = getCookieValue("UserName");
}

function loadBoobsRanker(rankPref) {
    //alert("loadBoobsRanker: " + rankPref);
    //$('#boobsRankerLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/BoobsRanker?rootFolder=" + rankPref + "&skip=" + skip + "&take=" + take,
        success: function (container) {
            $('#boobsRankerLoadingGif').hide();
            if (container.Success === "ok") {
                $.each(container.RankerLinks, function (idx, obj) {
                    rankerLinksArray[idx + skip] = new Image();
                    rankerLinksArray[idx + skip].src = obj.Link;
                    rankerLinksArray[idx + skip].Id = obj.LinkId;
                    rankerLinksArray[idx + skip].rankPref = rankPref;
                    rankerLinksArray[idx + skip].FolderId = obj.FolderId;
                    rankerLinksArray[idx + skip].FolderName = obj.FolderName;
                });

                if (container.RankerLinks.length < take) {
                    killTimer(rankPref);
                    $('#footerMessage').html("done loading: " + rankPref + "  " + rankerLinksArray.length);
                }
                else {
                    addMore(rankPref);
                    $('#footerMessage').html("added " + take + " " + rankPref + " items.  Array length: " + rankerLinksArray.length);
                }

                if (skip === 0) {
                    spinTheSlots();
                }

            }
            else {
                if (document.domain === 'localhost')
                    alert("jQuery fail in Album.js: getAlbumImages\n" + albumImageInfo.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "CDE",
                        Severity: 2,
                        ErrorMessage: " unknown rankPref: " + container.Success,
                        CalledFrom: "Ranker.Html loadBoobsRanker"
                    });
                //sendEmailToYourself("jQuery Fail in Ranker.Html loadBoobsRanker", " unknown rankPref: " + container.Success);
                //alert("BoobsRanker: " + container.Success);
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("loadBoobsRankers")) {
                if (document.domain === 'localhost')
                    alert("loadBoobsRanker: " + albumImageInfo.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "CDE", Severity: 2,
                        ErrorMessage: "loadBoobsRanker: " + errorMessage,
                        CalledFrom: "loadBoobsRanker"
                    });
                //sendEmailToYourself("XHR ERROR in Ranker.html loadBoobsRanker", "api/BoobsRanker?rootFolder=" + rankPref + "&skip=" + skip + "&take=" + take +
                //    "Called from: " + getCookieValue("IpAddress") + " Message: " + errorMessage);
            }
        }
    });
}

function setRankerBreadcrumbMessage() {
    var breadcrumbMessage = "";
    if ($('#ckBoxBoobs').is(':checked'))
        breadcrumbMessage = "poses and shapes";
    if ($('#ckBoxPlayboy').is(':checked')) {
        if (breadcrumbMessage !== "")
            breadcrumbMessage += ", ";
        breadcrumbMessage += "Playboy playmates";
    }
    if ($('#ckBoxArchive').is(':checked')) {
        if (breadcrumbMessage !== "")
            breadcrumbMessage += ", ";
        breadcrumbMessage += "Archive";
    }
    if ($('#ckBoxPorn').is(':checked')) {
        if (breadcrumbMessage !== "")
            breadcrumbMessage += ", ";
        breadcrumbMessage += "Porn";
    }
    if ($('#ckBoxSluts').is(':checked')) {
        if (breadcrumbMessage !== "")
            breadcrumbMessage += ", ";
        breadcrumbMessage += "Sluts";
    }
    $('#breadcrumbContainer').html(breadcrumbMessage);
}

function setInitialCheckbox(rankPref) {
    switch (rankPref) {
        case "boobs":
            $('#ckBoxBoobs').prop('checked', true);
            break;
        case "playboy":
        case "centerfold":
            $('#ckBoxPlayboy').prop('checked', true);
            break;
        case "porn":
            $('#ckBoxPorn').prop('checked', true);
            break;
        case "sluts":
            $('#ckBoxSluts').prop('checked', true);
            break;
        case "archive":
            $('#ckBoxArchive').prop('checked', true);
            break;
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CDE",
                Severity: 2,
                ErrorMessage: "unknown rankPref: " + rankPref,
                CalledFrom: "Ranker.Html setInitialCheckbox"
            });
            sendEmailToYourself("jQuery Fail in Ranker.Html setInitialCheckbox", " unknown rankPref: " + rankPref);
            alert("setInitialCheckbox unknown rankPref: " + rankPref);
            break;
    }
    setRankerBreadcrumbMessage();
}

function killTimer(rankPref) {
    switch (rankPref) {
        case "boobs":
            clearInterval(throttleBoobs);
            throttleBoobs = false;
            break;
        case "playboy":
        case "centerfold":
            clearInterval(throttlePlayboy);
            throttlePlayboy = false;
            break;
        case "archive":
            clearInterval(throttleArchive);
            throttleArchive = false;
            break;
        case "porn":
            clearInterval(throttlePorn);
            throttlePorn = false;
            break;
        case "sluts":
            clearInterval(throttleSluts);
            throttleSluts = false;
            break;
        default:
            if (document.domain === 'localhost')
                alert("Ranker killtimer unknown switch option" + rankPref);
            else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "JQA",
                    Severity: 12,
                    ErrorMessage: "unknown switch option" + rankPref,
                    CalledFrom: "Ranker killtimer"
                });
            //sendEmailToYourself("jQuery Fail in Ranker.Html killtimer ", " unknown rankPref: " + rankPref);
            //alert("unknown rankPref: " + rankPref);
            break;
    }
}

function unloadBoobsRanker(rankPref) {
    //alert("UNloadBoobsRanker: " + rankPref);
    $('#footerMessage').html("starting to unload " + rankPref);
    killTimer(rankPref);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/BoobsRanker?rootFolder=" + rankPref + "&skip=0&take=50000",
        success: function (container) {
            $('#boobsRankerLoadingGif').hide();
            if (container.Success === "ok") {
                var kkk = 0;
                $('#footerMessage').html("unloading " + rankPref);
                $.each(container.RankerLinks, function (idx, obj) {
                    var removeItem = rankerLinksArray.find(a => a.Id === obj.LinkId);
                    if (removeItem !== null) {
                        startLen = rankerLinksArray.length;
                        rankerLinksArray = jQuery.grep(rankerLinksArray, function (value) { return value !== removeItem; });
                        kkk++;
                    }
                });
                $('#footerMessage').html("removed " + kkk + " " + rankPref + " items");
            }
            else {
                if (document.domain === 'localhost')
                    alert("unloadBoobsRanker" + container.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "JQA",
                        Severity: 12,
                        ErrorMessage: container.Success,
                        CalledFrom: "unloadBoobsRanker"
                    });

                //sendEmailToYourself("jQuery Fail in Ranker.Html unloadBoobsRanker", container.Success);
                //alert("unloadBoobsRanker: " + container.Success);
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("loadBoobsRankers")) {
                if (document.domain === 'localhost')
                    alert("unloadBoobsRanker" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "JQA",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "unloadBoobsRanker"
                    });
                //sendEmailToYourself("XHR ERROR in Ranker.html unloadBoobsRanker", "api/BoobsRanker?rootFolder=" + rankPref + "&skip=0&take=50000  Message: " + errorMessage);
            }
        }
    });
}

function addMore(rankPref) {
    take = 200;
    switch (rankPref) {
        case "boobs":
            if (!throttleBoobs) {
                throttleBoobs = setInterval(function () {
                    skip = rankerLinksArray.length;
                    loadBoobsRanker(rankPref);
                }, 15000);
            }
            break;
        case "playboy":
        case "centerfold":
            if (!throttlePlayboy) {
                throttlePlayboy = setInterval(function () {
                    skip = rankerLinksArray.length;
                    loadBoobsRanker(rankPref);
                }, 15000);
            }
            break;
        case "archive":
            if (!throttleArchive) {
                throttleArchive = setInterval(function () {
                    skip = rankerLinksArray.length;
                    loadBoobsRanker(rankPref);
                }, 15000);
            }
            break;
        case "porn":
            if (!throttlePorn) {
                throttlePorn = setInterval(function () {
                    skip = rankerLinksArray.length;
                    loadBoobsRanker(rankPref);
                }, 15000);
            }
            break;
        case "sluts":
            if (!throttleSluts) {
                throttleSluts = setInterval(function () {
                    skip = rankerLinksArray.length;
                    loadBoobsRanker(rankPref);
                }, 15000);
            }
            break;
        default:
            if (document.domain === 'localhost')
                alert("Ranker addMore unknown switch option" + rankPref);
            else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "JQA",
                    Severity: 12,
                    ErrorMessage: "unknown switch option" + rankPref,
                    CalledFrom: "Ranker addMore"
                });
            //sendEmailToYourself("jQuery Fail in Ranker.Html Addmore", " unknown rankPref: " + rankPref);
            break;
    }
}

function startCountDown() {
    var timeLeft = 6;
    $('#countDownNumber').html(5);
    $('#divCountDown').css('visibility', 'visible');
    $('.boobsRankerTitle').html("Pick Which One is Hotter");
    $('.rankerImageSlotBox').css('cursor', 'pointer');
    countDownTimer = setInterval(function () {
        $('#countDownNumber').html(--timeLeft);
        if (timeLeft === -1) {
            spinTheSlots();
        }
    }, 1100);
}

function spinTheSlots() {
    clearInterval(countDownTimer);
    $('#divCountDown').css('visibility', 'hidden');

    $('.boobsRankerTitle').html("picking random images");
    $('.rankerImageSlotBox').css('cursor', 'not-allowed');

    leftimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
    $('#rankerBoxLeft').html(rankerLinksArray[leftimageIndex]);
    rightimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
    $('#rankerBoxRight').html(rankerLinksArray[rightimageIndex]);

    var i = 0;
    slotTimer = setInterval(function () {
        leftimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
        $('#rankerBoxLeft').html(rankerLinksArray[leftimageIndex]);
        $('#rankerLeftText').html(rankerLinksArray[leftimageIndex].FolderName);

        rightimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
        $('#rankerBoxRight').html(rankerLinksArray[rightimageIndex]);

        //if(rankerLinksArray[rightimageIndex].rankPref)
        $('#rankerRightText').html(rankerLinksArray[rightimageIndex].FolderName);

        setFolderNameColor(rankerLinksArray[rightimageIndex].rankPref, $('#rankerRightText'));
        setFolderNameColor(rankerLinksArray[leftimageIndex].rankPref, $('#rankerLeftText'));

        if (i > spinRate) {
            clearInterval(slotTimer);
            startCountDown();
            //$('#footerMessage').html("images: " + rankerLinksArray.length + "   spin: " + ++spinCount);
            //$('#footerMessage').html("   spin: " + ++spinCount);
        }
        //$('#testMessage').html(i++);
        i++;
    }, spinSwapSpeed);
}

function setFolderNameColor(rankPref, textObject) {
    switch (rankPref) {
        case "boobs":
            textObject.css("color", "#446983")
            break;
        case "playmates":
        case "centerfold":
            textObject.css("color", "#ed11ef")
            break;
        case "archive":
            textObject.css("color", "#63ac44")
            break;
        case "porn":
        case "sluts":
            textObject.css("color", "#249c40")
            break;
        default:
            if (document.domain === 'localhost')
                alert("Ranker setFolderNameColor unknown switch option" + rankPref);
            else
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "JQA",
                    Severity: 12,
                    ErrorMessage: "unknown switch option" + rankPref,
                    CalledFrom: "Ranker setFolderNameColor"
                });

            //sendEmailToYourself("jQuery Fail in Ranker.Html setFolderNameColor", " unknown rankPref: " + rankPref);
            //alert("setFolderNameColor unknown rankPref: " + rankPref);
            break;
    }
}

function checkDomain(rankPref, isChecked) {
    if (isChecked)
        loadBoobsRanker(rankPref);
    else
        unloadBoobsRanker(rankPref);
    setRankerBreadcrumbMessage();
}

function imageClick(selectedSide) {
    if ($('.rankerImageSlotBox').css('cursor') !== 'not-allowed') {

        if (!isLoggedIn()) {
            displayStatusMessage("warning", "please log in to record hotness");
        }

        // score it
        clearInterval(slotTimer);
        clearInterval(countDownTimer);

        $('#divCountDown').css('visibility', 'hidden');
        $('#rankerBox' + selectedSide).addClass("bigRedBorder");

        var winnerLinkId = rankerLinksArray[leftimageIndex].Id;
        var looserLinkId = rankerLinksArray[rightimageIndex].Id;
        if (selectedSide === "right") {
            winnerLinkId = rankerLinksArray[rightimageIndex].Id;
            looserLinkId = rankerLinksArray[leftimageIndex].Id;
        }
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Ranker",
            data: {
                Winner: winnerLinkId,
                Looser: looserLinkId,
                VisitorId: getCookieValue("VisitorId")
            },
            success: function (success) {
                if (success === "ok") {
                    spinTheSlots();
                    $('#rankerBox' + selectedSide).removeClass("bigRedBorder");
                }
                else {
                    if (document.domain === 'localhost')
                        alert("Ranker/imageClick" + success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "JQA",
                            Severity: 12,
                            ErrorMessage: success,
                            CalledFrom: "Ranker/imageClick"
                        });
                    //sendEmailToYourself("jQuery Fail in Ranker.Html imageClick", "BoobsRanker POST: " + container.Success);
                    //alert("BoobsRanker POST: " + container.Success);
                }
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                $('#imagePageLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("Ranker/imageClick")) {
                    if (document.domain === 'localhost')
                        alert("Ranker/imageClick" + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "Ranker/imageClick"
                        });
                    
                    //sendEmailToYourself("XHR ERROR in Ranker.Html imageClick", "api/BoobsRanker.  Message: " + errorMessage);
                }
                //alert("launchPromoMessages jqXHR : " + getXHRErrorDetails(jqXHR, exception) + "settingsArray.ApiServer: " + settingsArray.ApiServer);
            }
        });
    }
}

function jumpToFolder(selectedSide) {
    var folderId = rankerLinksArray[leftimageIndex].FolderId;
    if (selectedSide === "right") {
        folderId = rankerLinksArray[rightimageIndex].FolderId;
    }
    window.open("/album.html?folder=" + folderId, "_blank");
}

function rankerHTML() {
    return "    <div class='titleContainer'>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div class='boobsRankerTitle'>Boobs Ranker</div>\n" +
        "            <div class='rankerImageContainer'>\n" +
        "                <div class='rankerImageFloatBox'>\n" +
        "                    <div id='rankerBoxLeft' class='rankerImageSlotBox' onclick='imageClick('Left')'></div>\n" +
        "                    <div id='rankerLeftText' class='rankerImageName' onclick='jumpToFolder('left')'></div>\n" +
        "                </div>\n" +
        "                <div id='divCountDown' class='roundCountDowner'>\n" +
        "                    <div id='countDownNumber' class='countDownNumberContainer'></div>\n" +
        "                </div>\n" +
        "                <div class='rankerImageFloatBox'>\n" +
        "                    <div id='rankerBoxRight' class='rankerImageSlotBox' onclick='imageClick('Right')'></div>\n" +
        "                    <div id='rankerRightText' class='rankerImageName' onclick='jumpToFolder('right')'></div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div class='domCkBox'><input id='ckBoxBoobs' onchange='checkDomain('boobs', $(this).is(':checked'))' type='checkbox' />poses and shapes</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPlayboy' onchange='checkDomain('playboy', $(this).is(':checked'))' type='checkbox' />Playboy playmates</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxArchive' onchange='checkDomain('archive', $(this).is(':checked'))' type='checkbox' />archive</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPorn' onchange='checkDomain('porn', $(this).is(':checked'))' type='checkbox' />porn</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxSluts' onchange='checkDomain('sluts', $(this).is(':checked'))' type='checkbox' />sluts</div>\n" +
        "        </div>\n" +
        "    </div>";
}