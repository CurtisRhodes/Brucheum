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
    if (rankPref === "poses")
        rankPref = "boobs";
    if (rankPref === "big%20naturals")
        rankPref = "archive";

    document.title = "Hot or Not : OggleBooble";
    $('#indexMiddleColumn').html(rankerHTML());
    setInitialCheckbox(rankPref);
    loadBoobsRanker(rankPref);
    changeFavoriteIcon("redBallon");
    setOggleHeader(spaPageId, "dashboard");
    setOggleFooter(spaPageId, "blog");
    setRankerBreadcrumbMessage();
    //userName = getCookieValue("UserName");
}

function loadBoobsRanker(rankPref) {
    //alert("loadBoobsRanker: " + rankPref);
    //$('#boobsRankerLoadingGif').show();
    settingsImgRepo = settingsArray.ImageRepo;

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Ranker/LoadRankerImages?rootFolder=" + rankPref + "&skip=" + skip + "&take=" + take,
        success: function (container) {
            $('#boobsRankerLoadingGif').hide();
            if (container.Success === "ok") {
                $.each(container.RankerLinks, function (idx, obj) {
                    rankerLinksArray[idx + skip] = new Image();
                    rankerLinksArray[idx + skip].src = settingsImgRepo + "/" + obj.Link;
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
                logError("AJX", 3907, container.Success, "loadBoobsRanker");
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("loadBoobsRanker")) {
                logError("XHR", 3907, getXHRErrorDetails(jqXHR), "loadBoobsRanker");
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
            logError("SWT", 3907, "rankPref: " + rankPref, "setInitialCheckbox");
            break;
    }
    setRankerBreadcrumbMessage();
}

function killTimer(rankPref) {
    switch (rankPref) {
        case "poses":
            clearInterval(throttleBoobs);
            throttleBoobs = false;
            break;
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
            logError("SWT", 3907, "switch option" + rankPref, "killtimer");
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
                logError("AJX", 3907, container.Success, "unloadBoobsRanker");
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("unloadBoobsRanker")) {
                logError("XHR", 3907, getXHRErrorDetails(jqXHR), "unloadBoobsRanker");
            }
        }
    });
}

function addMore(rankPref) {
    take = 200;
    switch (rankPref) {
        case "poses":
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
            logError("SWT", 3908, "unknown switch option" + rankPref, "addMore");
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
        case "playboy":
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
            logError("SWT", 3908, "unknown switch option: " + rankPref, "setFolderNameColor");
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
            url: settingsArray.ApiServer + "api/Ranker/InsertVote",
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
                    logError("AJX", 3907, success, "imageClick");
                }
            },
            error: function (jqXHR) {
                $('#blogLoadingGif').hide();
                $('#imagePageLoadingGif').hide();
                if (!checkFor404("Ranker/imageClick")) {
                    logError("XHR", 3907, getXHRErrorDetails(jqXHR), "imageClick");
                }
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
        "                    <div id='rankerBoxLeft' class='rankerImageSlotBox' onclick='imageClick(\"Left\")'></div>\n" +
        "                    <div id='rankerLeftText' class='rankerImageName' onclick='jumpToFolder(\"left\")'></div>\n" +
        "                </div>\n" +
        "                <div id='divCountDown' class='roundCountDowner'>\n" +
        "                    <div id='countDownNumber' class='countDownNumberContainer'></div>\n" +
        "                </div>\n" +
        "                <div class='rankerImageFloatBox'>\n" +
        "                    <div id='rankerBoxRight' class='rankerImageSlotBox' onclick='imageClick(\"Right\")'></div>\n" +
        "                    <div id='rankerRightText' class='rankerImageName' onclick='jumpToFolder(\"right\")'></div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div class='domCkBox'><input id='ckBoxBoobs' onchange='checkDomain(\"boobs\", $(this).is(\":checked\"))' type='checkbox' />poses and shapes</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPlayboy' onchange='checkDomain(\"playboy\", $(this).is(\":checked\"))' type='checkbox' />Playboy playmates</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxArchive' onchange='checkDomain(\"archive\", $(this).is(\":checked\"))' type='checkbox' />archive</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPorn' onchange='checkDomain(\"porn\", $(this).is(\":checked\"))' type='checkbox' />porn</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxSluts' onchange='checkDomain(\"sluts\", $(this).is(\":checked\"))' type='checkbox' />sluts</div>\n" +
        "        </div>\n" +
        "    </div>";
}