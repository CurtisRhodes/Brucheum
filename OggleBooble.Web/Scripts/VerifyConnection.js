let connectionVerified = false, canIgetaConnectionMessageShowing = false,
    verifyConnectionCount = 0, verifyConnectionCountLimit = 17,
    inCheckFor404Loop = false, checkFor404Loop;
    //persisConnectionInterval, persisConnectionIntervalRunning = false;

function checkFor404(calledFrom) {
    //sendEmailToYourself("checkFor404 called with null errorMessage from: " + calledFrom, "ip: " + ipAddr);
    connectionVerified = false;
    verifyConnection();
    setTimeout(function () {
        if (!connectionVerified) {
            verifyConnection();
            console.log("calling verifyConnection");
        }
    }, 800);

    if (!connectionVerified) {
        if (!inCheckFor404Loop) {
            document.title = "loading : OggleBooble";
            changeFavoriteIcon("loading");
            checkFor404Loop = setInterval(function () {
                if (connectionVerified) {
                    changeFavoriteIcon("redBallon");
                }
                else {
                    if (++verifyConnectionCount === 3) {
                        $('#customMessage').html(
                            "<div id='launchingServiceGif' class='launchingServiceContainer'><img src='Images/altair04.gif' height='200' /></div>\n").show();
                        $('.launchingServiceContainer').css("top", window.innerHeight / 2 - 100);

                    }
                    if (verifyConnectionCount > verifyConnectionCountLimit) {
                        if (!canIgetaConnectionMessageShowing) {
                            $('#customMessage').html(
                                "<div class='shaddowBorder'>" +
                                "   <img src='/Images/canIgetaConnection.gif' height='230' >\n" +
                                "   <div class='divRefreshPage' onclick='window.location.reload(true)'>Thanks GoDaddy. Refresh Page</a></div>" +
                                "</div>").show();

                            console.log("canIgetaConnection message showing");
                            var visitorId = getCookieValue("VisiorId");
                            if (isNullorUndefined(visitorId))
                                visitorId = "--";
                            canIgetaConnectionMessageShowing = true;
                            if (document.domain !== 'localhost')
                                logError("404", 3910, "SERVICE DOWN", "checkFor404 /" + calledFrom);
                        }
                    }
                    verifyConnection();
                }
            }, 1600);
            inCheckFor404Loop = true;
        }
    }
    return !connectionVerified;
}

function verifyConnection() {

    if (isNullorUndefined(settingsArray.ApiServer)) {
        console.error("verifyConnection settingsArray.ApiServer not defined");
        connectionVerified = false;
        return;
    }
    else {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/VerifyConnection",
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (successModel.ConnectionVerified) {
                        clearInterval(checkFor404Loop);
                        inCheckFor404Loop = false;

                        connectionVerified = true;
                        verifyConnectionCount = 0;

                        console.log("verifyConnection: connection verified");
                        $('#customMessage').hide();
                        canIgetaConnectionMessageShowing = false;
                        //if (!persisConnectionIntervalRunning)
                        //    persistConnection();
                    }
                    else {
                        //if (document.domain === "local host") alert("verifyConnection: " + successModel.Success)
                        connectionVerified = false;
                    }
                }
                else {
                    if (document.domain === "local host") alert("verifyConnection JQA: " + successModel.Success)
                    connectionVerified = false;
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (document.domain === "local host") alert("verifyConnection XHR: " + errorMessage)
                connectionVerified = false;
            }
        });
    }
}

function xxPersistConnection() {
    persistConnectionIntervalRunning = true;
    persistConnectionInterval = setInterval(function () {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/VerifyConnection",
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (successModel.ConnectionVerified) {
                        //clearInterval(checkFor404Loop);
                        inCheckFor404Loop = false;
                        connectionVerified = true;
                        verifyConnectionCount = 0;
                        console.log("persist Connection ok");
                    }
                    else {
                        logError("ERR", 3908, successModel.Success, "persistConnection");
                    }
                }
                else {
                    logError("BUG", 3908, successModel.Success, "persistConnection");
                    connectionVerified = false;
                }
            },
            error: function (jqXHR) {
                //logError("XHR", 3980, getXHRErrorDetails(jqXHR), "persistConnection");
                connectionVerified = false;
            }
        });
    }, 145000);
}

function getVisitorInfo() {
    var info = {

        timeOpened: new Date(),
        timezone: (new Date()).getTimezoneOffset() / 60,

        pageon() { return window.location.pathname },
        referrer() { return document.referrer },
        previousSites() { return history.length },

        browserName() { return navigator.appName },
        browserEngine() { return navigator.product },
        browserVersion1a() { return navigator.appVersion },
        browserVersion1b() { return navigator.userAgent },
        browserLanguage() { return navigator.language },
        browserOnline() { return navigator.onLine },
        browserPlatform() { return navigator.platform },
        javaEnabled() { return navigator.javaEnabled() },
        dataCookiesEnabled() { return navigator.cookieEnabled },
        dataCookies1() { return document.cookie },
        dataCookies2() { return decodeURIComponent(document.cookie.split(";")) },
        dataStorage() { return localStorage },

        sizeScreenW() { return screen.width },
        sizeScreenH() { return screen.height },
        sizeDocW() { return document.width },
        sizeDocH() { return document.height },
        sizeInW() { return innerWidth },
        sizeInH() { return innerHeight },
        sizeAvailW() { return screen.availWidth },
        sizeAvailH() { return screen.availHeight },
        scrColorDepth() { return screen.colorDepth },
        scrPixelDepth() { return screen.pixelDepth },

        //latitude() { return position.coords.latitude },
        //longitude() { return position.coords.longitude },
        //accuracy() { return position.coords.accuracy },
        //altitude() { return position.coords.altitude },
        //altitudeAccuracy() { return position.coords.altitudeAccuracy },
        //heading() { return position.coords.heading },
        //speed() { return position.coords.speed },
        //timestamp() { return position.timestamp },
    };
    return info;
}
