let rankerLinksArray = [],
    countDownTimer, slotTimer,
    selectedRankerCategories,
    spinSwapSpeed = 433, spinDuration = 17,
    leftimageIndex, rightimageIndex,
    rankerItemsLoadedSoFar = 0,
    rankertakeIncriment = 40,
    rankerPageHeight, rankerImageWidth;


function rankerStartup(initialCategory) {
    setOggleHeader("ranker");
    setOggleFooter(3911, "blog", "ranker");
    selectedRankerCategories = initialCategory;
    document.title = "Hot or Not : OggleBooble";
    //document.title = "image rater : OggleBooble";
    $('#indexMiddleColumn').html(rankerHTML());
    $('#rankerCkBoxesContainer').hide();
    setCheckboxes();
    rankerPageHeight = $(window).height() - $('#oggleHeader').height() - $('#boobsRankerTitle').height() - 185;
    rankerImageWidth = ($(window).innerWidth() * .588) / 2;
    loadRankerImages();
    window.addEventListener("resize", resizeRankerPage);
    //resizeRankerPage();
}

function resizeRankerPage() {
    //alert("resizeRanker");
    // height
    rankerPageHeight = $(window).height() - $('#oggleHeader').height() - $('#boobsRankerTitle').height() - 185;
    rankerImageWidth = ($(window).innerWidth() * .588) / 2;
    $('.rankerImage').css("height", rankerPageHeight);
    // width
    $('.rankerImage').css("width", rankerImageWidth);
    //$('#divCountDown').css("width", divCountDownWidth);
    reloadRankerImages();
    //alert("rankerPageHeight: " + rankerPageHeight +
    //    "\n.rankerImage.height: " + $('.rankerImage').height() +
    //    "\n.rankerImage.width: " + $('.rankerImage').width() +
    //    "\ndivCountDownWidth: " + divCountDownWidth +
    //    "\n#divCountDown.width: " + $('#divCountDown').css("width"));
}

function loadRankerImages() {
    //alert("loadBoobsRanker: " + rankPref);
    //$('#rankerLoadingGif').show();
    settingsImgRepo = settingsArray.ImageRepo;

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Ranker/LoadRankerImages?selectedRankerCategories=" + selectedRankerCategories + "&skip=" + rankerItemsLoadedSoFar + "&take=" + rankertakeIncriment,
        success: function (container) {
            $('#rankerLoadingGif').hide();
            if (container.Success === "ok") {
                $.each(container.RankerLinks, function (idx, obj) {
                    rankerLinksArray[idx + rankerItemsLoadedSoFar] = new Array;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].Img = "<img height='" + rankerPageHeight +
                        "' width='" + rankerImageWidth + "' src='" + settingsImgRepo + "/" + obj.Link+ "' /></div>";
                    //rankerLinksArray[idx + rankerItemsLoadedSoFar].Img = settingsImgRepo + "/" + obj.Link;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].LinkId = obj.LinkId;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].ImageType = obj.ImageType;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].FolderId = obj.FolderId;
                    rankerLinksArray[idx + rankerItemsLoadedSoFar].FolderName = obj.FolderName;
                });

                if (rankerItemsLoadedSoFar === 0) {
                    setTimeout(function () { $('#rankerCkBoxesContainer').show(); }, 800);                    
                    spinTheSlots();
                }
                if (container.RankerLinks.length < rankertakeIncriment) {
                    //alert("done loading: " + selectedRankerCategories + "  " + rankerLinksArray.length);
                    $('#footerMessage').html("done loading: " + selectedRankerCategories + "  " + rankerLinksArray.length);
                }
                else {
                    rankerItemsLoadedSoFar += rankertakeIncriment;
                    rankertakeIncriment = 200;
                    loadRankerImages();
                    $('#footerMessage').html("added " + rankertakeIncriment + " items.  Array length: " + rankerLinksArray.length);
                }
            }
            else {
                $('#rankerLoadingGif').hide();
                if (document.domain == "localHost") alert("loadBoobsRanker: " + success);
                logError("AJX", 3907, container.Success, "load RankerImages");
            }
        },
        error: function (jqXHR) {
            $('#rankerLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "load RankerImages"))
                logError("XHR", 3907, errMsg, "load RankerImages");
        }
    });
}

function spinTheSlots() {
    clearInterval(countDownTimer);
    $('#divCountDown').css('visibility', 'hidden');

    $('.boobsRankerTitle').html("picking random images");
    $('.rankerImageSlotBox').css('cursor', 'not-allowed');

    //leftimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
    //$('#imageLeft').html(rankerLinksArray[leftimageIndex].Img);
    //rightimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
    //$('#imageRight').attr("src", rankerLinksArray[rightimageIndex].Img);

    let spinCount = 0;
    slotTimer = setInterval(function () {
        leftimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
        $('#rankerBoxLeft').html(rankerLinksArray[leftimageIndex].Img);
        $('#rankerLeftText').html(rankerLinksArray[leftimageIndex].FolderName);
        setFolderNameColor(rankerLinksArray[leftimageIndex].ImageType, $('#rankerLeftText'));

        rightimageIndex = Math.floor(Math.random() * rankerLinksArray.length);
        $('#rankerBoxRight').html(rankerLinksArray[rightimageIndex].Img);
        $('#rankerRightText').html(rankerLinksArray[rightimageIndex].FolderName);
        setFolderNameColor(rankerLinksArray[rightimageIndex].ImageType, $('#rankerRightText'));

        if (++spinCount > spinDuration) {
            clearInterval(slotTimer);
            startCountDown();
            //$('#footerMessage').html("images: " + rankerLinksArray.length + "   spin: " + ++spinCount);
            //$('#footerMessage').html("   spin: " + ++spinCount);
        }
    }, spinSwapSpeed);
}

function setCheckboxes() {
    //alert(selectedRankerCategories + "  2,3: " + selectedRankerCategories.substring(2, 3));
    if (selectedRankerCategories.substring(0, 1) == "1") $('#ckBoxBoobs').prop('checked', true);
    if (selectedRankerCategories.substring(1, 2) == "1") $('#ckBoxArchive').prop('checked', true);
    if (selectedRankerCategories.substring(2, 3) == "1") $('#ckBoxPlayboy').prop('checked', true);
    if (selectedRankerCategories.substring(3, 4) == "1") $('#ckBoxCybergirls').prop('checked', true);
    if (selectedRankerCategories.substring(4, 5) == "1") $('#ckBoxMuses').prop('checked', true);
    if (selectedRankerCategories.substring(5, 6) == "1") $('#ckBoxPlus').prop('checked', true);
    if (selectedRankerCategories.substring(6, 7) == "1") $('#ckBoxSoft').prop('checked', true);
    if (selectedRankerCategories.substring(7, 8) == "1") $('#ckBoxPorn').prop('checked', true);
    if (selectedRankerCategories.substring(8, 9) == "1") $('#ckBoxSluts').prop('checked', true);
    ckBoxChanged();
}

function reloadRankerImages() {
    //alert("UNloadBoobsRanker: " + rankPref);
    $('#footerMessage').html("starting to unload " + rankPref);
    $('#rankerLoadingGif').show();
    rankertakeIncriment = 40;
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
        if (timeLeft < 0) {
            spinTheSlots();
        }
    }, 1050);
}

function setFolderNameColor(imageType, textObject) {
    switch (imageType) {
        case "boobs": textObject.css("color", "#446983"); break;
        case "cybergirl": textObject.css("color", "#7d7029"); break;
        case "muses": textObject.css("color", "#2e6a7a"); break;
        case "plus": textObject.css("color", "red"); break;
        case "centerfold": textObject.css("color", "#ed11ef"); break;
        case "archive": textObject.css("color", "#236d69"); break;
        case "porn": textObject.css("color", "#ff00c3"); break;
        case "sluts": textObject.css("color", "#249c40"); break;
        case "soft": textObject.css("color", "#249c40"); break;
        default:
            alert("imageType: " + imageType + " not handled in setFolderNameColor");
            logError("SWT", 3908, "unknown switch option: " + imageType, "setFolderNameColor");
            break;
    }
}

function ckBoxChanged() {
    let newMap = "";
    let breadcrumbMessage = "";
    if ($('#ckBoxBoobs').is(':checked')) { newMap = "1"; breadcrumbMessage += "Poses and Shapes "; } else newMap = "0";
    if ($('#ckBoxArchive').is(':checked')) { newMap += "1"; breadcrumbMessage += "Big Naturals "; } else newMap += "0";
    if ($('#ckBoxPlayboy').is(':checked')) { newMap += "1"; breadcrumbMessage += "Playboy Centerfolds "; } else newMap += "0";
    if ($('#ckBoxCybergirls').is(':checked')) { newMap += "1"; breadcrumbMessage += "Cybergirls "; } else newMap += "0";
    if ($('#ckBoxMuses').is(':checked')) { newMap += "1"; breadcrumbMessage += "Muses "; } else newMap += "0";
    if ($('#ckBoxPlus').is(':checked')) { newMap += "1"; breadcrumbMessage += "Playboy Plus "; } else newMap += "0";
    if ($('#ckBoxSoft').is(':checked')) { newMap += "1"; breadcrumbMessage += "Softcore "; } else newMap += "0";
    if ($('#ckBoxPorn').is(':checked')) { newMap += "1"; breadcrumbMessage += "Porn "; } else newMap += "0";
    if ($('#ckBoxSluts').is(':checked')) { newMap += "1"; breadcrumbMessage += "Porn Stars "; } else newMap += "0";
    
    //alert("selectedRankerCategories: " + selectedRankerCategories + " newMap: " + newMap);
    selectedRankerCategories = newMap;

    $('#breadcrumbContainer').html(breadcrumbMessage);
    //alert("breadcrumbMessage: " + breadcrumbMessage + ":  " + newMap)
}

function reloadRankerImages() {
    //alert("reloadRankerImages");
    rankerItemsLoadedSoFar = 0;
    rankerLinksArray = [];
    clearInterval(slotTimer);
    clearInterval(countDownTimer);
    loadRankerImages();
}

function imageClick(selectedSide) {
    if ($('.rankerImageSlotBox').css('cursor') !== 'not-allowed') {

        //if (!isLoggedIn()) {
        //    displayStatusMessage("warning", "please log in to record hotness");
        //}

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
    $('#rankerLoadingGif').hide();
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
        "                    <div id='rankerBoxLeft' class='rankerImageSlotBox' onclick='imageClick(\"left\")'></div>\n" +
        //"                       <img id='imageLeft' class='rankerImage' src='Images/redballon.png' />" +
        "                    <div id='rankerLeftText' class='rankerImageName' onclick='jumpToFolder(\"left\")'></div>\n" +
        "                </div>\n" +
        "                <div id='countdownSection' class='middleCountdownSection'>\n" +
        "                   <div id='divCountDown' class='roundCountDowner'>\n" +
        "                       <div id='countDownNumber' class='countDownNumberContainer' onclick='pauseCountdown()'  ></div>\n" +
        "                   </div>\n" +
        "                </div>\n" +
        "                <div class='rankerImageFloatBox'>\n" +
        "                    <div id='rankerBoxRight' class='rankerImageSlotBox' onclick='imageClick(\"right\")'></div>\n" +
        //"                       <img id='imageRight' class='rankerImage' src='Images/redballon.png' /></div>\n" +
        "                    <div id='rankerRightText' class='rankerImageName' onclick='jumpToFolder(\"right\")'></div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class='floatRight'>\n" +
        "           <div id='rankerCkBoxesContainer' class='rankerCkBoxesContainer'>\n" +
        "            <div class='domCkBox'><input id='ckBoxBoobs' onchange='ckBoxChanged()' type='checkbox'></input>poses and shapes</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxArchive' onchange='ckBoxChanged()' type='checkbox'></input>big naturals</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPlayboy' onchange='ckBoxChanged()' type='checkbox'></input>Playboy playmates</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxCybergirls' onchange='ckBoxChanged()' type='checkbox'></input>Cybergirls</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxMuses' onchange='ckBoxChanged()' type='checkbox'></input>Muses</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPlus' onchange='ckBoxChanged()' type='checkbox'></input>Playboy Plus</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxSoft' onchange='ckBoxChanged()' type='checkbox'></input>Softcore</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxPorn' onchange='ckBoxChanged()' type='checkbox'></input>Porn</div>\n" +
        "            <div class='domCkBox'><input id='ckBoxSluts' onchange='ckBoxChanged()' type='checkbox'></input>Porn Stars</div>\n" +
        "            <div class='domCkBox'><div class='roundendButton' onclick='reloadRankerImages()'>reload</div></div>\n" +
        "           </div>\n" +
        "        </div>\n" +
        "    </div>";
}