let rankerLinksArray = [],
    countDownTimer, slotTimer,
    selectedRankerCategories,
    spinRate = 8, spinSwapSpeed = 133, spinCount = 0,
    leftimageIndex, rightimageIndex,
    rankerItemsLoadedSoFar = 0,
    rankertakeIncriment = 40;


function rankerStartup(rankPref) {

    //alert("rankPref: " + rankPref);

    if (isNullorUndefined(rankPref))
        selectedRankerCategories = "10000";


    //document.title = "Hot or Not : OggleBooble";
    document.title = "image rater : OggleBooble";
    $('#indexMiddleColumn').html(rankerHTML());
    setInitialCheckbox();
    loadBoobsRanker();
    changeFavoriteIcon("redBallon");
    setOggleHeader(spaPageId, "dashboard");
    setOggleFooter(spaPageId, "blog");
    setRankerBreadcrumbMessage();
    //userName = getCookieValue("UserName");
    window.addEventListener("resize", resizeRankerPage);
    resizeRankerPage();
}

function resizeRankerPage() {
    // height
    let winHeight = $(window).height() - $('#oggleHeader').height() - $('#boobsRankerTitle').height() - 15;
    rankerImageHeight = 800;
    $('.rankerImageSlotBox').css("height", rankerImageHeight);
    $('.rankerImage').css("height", rankerImageHeight);

    //rankerImageFloatBox

    // width

    $('.rankerImage').css("width", rankerImageWidth);
    $('.rankerImage').css("height", rankerImageHeight);

    let divCountDownWidth = 200;
    $('.divCountDown').css("width", divCountDownWidth);
    rankerImageWidth = ($('.rankerImageContainer').width() / 2) - divCountDownWidth;
    rankerImageWidth = 500;
    $('.rankerImageSlotBox').css("width", rankerImageWidth);
    $('.rankerImage').css("width", rankerImageWidth);
}

function loadBoobsRanker() {
    //alert("loadBoobsRanker: " + rankPref);
    $('#rankerLoadingGif').show();
    settingsImgRepo = settingsArray.ImageRepo;

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Ranker/LoadRankerImages?rootFolder=" + selectedRankerCategories + "&rankerItemsLoadedSoFar=" + rankerItemsLoadedSoFar + "&take=" + rankertakeIncriment,
        success: function (container) {
            $('#rankerLoadingGif').hide();
            if (container.Success === "ok") {
                $.each(container.RankerLinks, function (idx, obj) {
                    rankerLinksArray[idx + rankerItemsLoadedSoFar] = new Array;
                    //rankerLinksArray[idx + rankerItemsLoadedSoFar] = new Image();
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].Img = "<img class='rankerImage' src='" + settingsImgRepo + "/" + obj.Link + "'>";
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].LinkId = obj.LinkId;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].ImageType = obj.RootFolder;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].FolderId = obj.FolderId;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].FolderName = obj.FolderName;
                });

                if (rankerItemsLoadedSoFar === 0) {
                    spinTheSlots();
                }
                if (container.RankerLinks.length < rankertakeIncriment) {
                    alert("done loading: " + selectedRankerCategories + "  " + rankerLinksArray.length);
                    $('#footerMessage').html("done loading: " + selectedRankerCategories + "  " + rankerLinksArray.length);
                }
                else {
                    rankerItemsLoadedSoFar += rankertakeIncriment;
                    rankertakeIncriment = 200;
                    loadBoobsRanker();
                    $('#footerMessage').html("added " + rankertakeIncriment + " items.  Array length: " + rankerLinksArray.length);
                }
            }
            else {
                if (document.domain == "localHost") alert("loadBoobsRanker: " + success);
                logError("AJX", 3907, container.Success, "loadBoobsRanker");
            }
        },
        error: function (jqXHR) {
            $('#rankerLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3907, errMsg, functionName);
        }
    });
}

function setCheckboxes() {
    let breadcrumbMessage = "";
    $('#breadcrumbContainer').html(breadcrumbMessage);
    if (selectedRankerCategories.substring(0, 1) == "1") {
        $('#ckBoxBoobs').prop('checked', true);
        breadcrumbMessage = "big naturals";
    }
    if (selectedRankerCategories.substring(1, 1) == "1") {
        $('#ckBoxPlayboy').prop('checked', true);
        if (breadcrumbMessage !== "") breadcrumbMessage += ", ";
        breadcrumbMessage += "Playboy centerfolds";
    }
    if (selectedRankerCategories.substring(2, 1) == "1") {
        $('#ckBoxPorn').prop('checked', true);
        if (breadcrumbMessage !== "") breadcrumbMessage += ", ";
        breadcrumbMessage += "porn";
    }
    if (selectedRankerCategories.substring(3, 1) == "1") {
        $('#ckBoxSluts').prop('checked', true);
        if (breadcrumbMessage !== "") breadcrumbMessage += ", ";
        breadcrumbMessage += "porn stars";
    }
    if (selectedRankerCategories.substring(4, 1) == "1") {
        $('#ckBoxSoft').prop('checked', true);
        if (breadcrumbMessage !== "") breadcrumbMessage += ", ";
        breadcrumbMessage += "softcore";
    }
    $('#breadcrumbContainer').html(breadcrumbMessage);
}

function unloadBoobsRanker(rankPref) {
    //alert("UNloadBoobsRanker: " + rankPref);
    $('#footerMessage').html("starting to unload " + rankPref);
    $('#rankerLoadingGif').show();
    clearInterval(countDownTimer);
    rankerLinksArray = [];
    rankerItemsLoadedSoFar = 0;
}

function startCountDown() {
    let timeLeft = 6;
    $('#divCountDown').css('visibility', 'visible');
    $('.boobsRankerTitle').html("Pick Which One is Hotter");
    $('.rankerImageSlotBox').css('cursor', 'pointer');
    $('#countDownNumber').html(timeLeft);
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
    $('#rankerBoxLeft').html(rankerLinksArray[leftimageIndex].Img);
    rightimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
    $('#rankerBoxRight').html(rankerLinksArray[rightimageIndex].Img);

    let i = 0;
    slotTimer = setInterval(function () {
        leftimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
        $('#rankerBoxLeft').html(rankerLinksArray[leftimageIndex].Img);
        $('#rankerLeftText').html(rankerLinksArray[leftimageIndex].FolderName);

        rightimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
        $('#rankerBoxRight').html(rankerLinksArray[rightimageIndex].Img);

        //if(rankerLinksArray[rightimageIndex].rankPref)
        $('#rankerRightText').html(rankerLinksArray[rightimageIndex].FolderName);

        setFolderNameColor(rankerLinksArray[rightimageIndex].ImageType, $('#rankerRightText'));
        setFolderNameColor(rankerLinksArray[leftimageIndex].ImageType, $('#rankerLeftText'));

        if (i > spinRate) {
            clearInterval(slotTimer);
            startCountDown();
            //$('#footerMessage').html("images: " + rankerLinksArray.length + "   spin: " + ++spinCount);
            //$('#footerMessage').html("   spin: " + ++spinCount);
        }
        $('#testMessage').html(i++);
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

    // <div class='domCkBox'><input id='ckBoxBoobs' onchange='checkDomain(\"boobs\", $(this).is(\":checked\"))' type='checkbox' />poses and shapes</div>\n" +
    // <div class='domCkBox'><input id='ckBoxPlayboy' onchange='checkDomain(\"playboy\", $(this).is(\":checked\"))' type='checkbox' />Playboy playmates</div>\n" +
    // <div class='domCkBox'><input id='ckBoxArchive' onchange='checkDomain(\"archive\", $(this).is(\":checked\"))' type='checkbox' />big naturals</div>\n" +
    // <div class='domCkBox'><input id='ckBoxPorn' onchange='checkDomain(\"porn\", $(this).is(\":checked\"))' type='checkbox' />porn</div>\n" +
    // <div class='domCkBox'><input id='ckBoxSluts' onchange='checkDomain(\"sluts\", $(this).is(\":checked\"))' type='checkbox' />sluts</div>\n" +

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

        var winnerLinkId = rankerLinksArray[leftimageIndex].LinkId;
        var looserLinkId = rankerLinksArray[rightimageIndex].LinkId;
        if (selectedSide === "right") {
            winnerLinkId = rankerLinksArray[rightimageIndex].LinkId;
            looserLinkId = rankerLinksArray[leftimageIndex].LinkId;
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
                    if (document.domain == "localHost") alert("InsertVote: " + success);                    
                    logError("AJX", 3907, success, "imageClick");
                }
            },
            error: function (jqXHR) {
                $('#rankerLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 3907, errMsg, functionName);
            }
        });
    }
}

function jumpToFolder(selectedSide) {
    var folderId = rankerLinksArray[leftimageIndex].FolderId;
    if (selectedSide === "right") {
        folderId = rankerLinksArray[rightimageIndex].FolderId;
    }
    location.href = "/album.html?folder=" + folderId;
    //window.open("/album.html?folder=" + folderId, "_blank");
}

function pauseCountdown() {
    clearInterval(countDownTimer);
    $('#countDownNumber').html("||");
}

function rankerHTML() {
    return "<div class='rankerOuterContainer'>\n" +
        "       <img id='rankerLoadingGif' class='loadingGif' title='loading gif' alt='' src='Images/loader.gif' />\n" +
        "        <div class='floatLeft'>\n" +
        "            <div class='boobsRankerTitle'>Boobs Ranker</div>\n" +
        "            <div class='rankerImageContainer'>\n" +
        "                <div class='rankerImageFloatBox'>\n" +
        "                    <div id='rankerBoxLeft' class='rankerImageSlotBox' onclick='imageClick(\"Left\")'></div>\n" +
        "                    <div id='rankerLeftText' class='rankerImageName' onclick='jumpToFolder(\"left\")'></div>\n" +
        "                </div>\n" +
        "                <div id='divCountDown' class='roundCountDowner'>\n" +
        "                    <div id='countDownNumber' class='countDownNumberContainer' onclick='pauseCountdown()'  ></div>\n" +
        "                </div>\n" +
        "                <div class='rankerImageFloatBox'>\n" +
        "                    <div id='rankerBoxRight' class='rankerImageSlotBox' onclick='imageClick(\"Right\")'></div>\n" +
        "                    <div id='rankerRightText' class='rankerImageName' onclick='jumpToFolder(\"right\")'></div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class='floatRight'>\n" +
        "           <div class='rankerCkBoxesContainer'>\n" +
        "            <div class='domCkBox'><input id='ckBoxBoobs' onchange='checkDomain(\"boobs\", $(this).is(\":checked\"))' type='checkbox' />poses and shapes</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPlayboy' onchange='checkDomain(\"playboy\", $(this).is(\":checked\"))' type='checkbox' />Playboy playmates</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxArchive' onchange='checkDomain(\"archive\", $(this).is(\":checked\"))' type='checkbox' />big naturals</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPorn' onchange='checkDomain(\"porn\", $(this).is(\":checked\"))' type='checkbox' />porn</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxSluts' onchange='checkDomain(\"sluts\", $(this).is(\":checked\"))' type='checkbox' />sluts</div>\n" +
        "           </div>\n" +
        "        </div>\n" +
        "    </div>";
}