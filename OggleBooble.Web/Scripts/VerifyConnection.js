let connectionVerified = false, canIgetaConnectionMessageShowing = false, verifyConnectionCount = 0,
    verifyConnectionCountLimit = 17, verifyConnectionLoop = null, persistConnectionInterval = null;

function checkFor404(calledFrom) {
    connectionVerified = false;
    let xmlSettingsLoop = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
        }
        else {
            clearInterval(xmlSettingsLoop);
            verifyConnectionFunction();
            setTimeout(function () {
                if (connectionVerified) {
                    console.log("connection verified right off");
                    tryHitStats();
                    return true;
                }
                else {
                    if (verifyConnectionCount === 0) {
                        verifyConnectionLoop = setInterval(verifyConnectionFunction, 1600);
                        document.title = "loading : OggleBooble";
                        changeFavoriteIcon("loading");
                        console.log("calling verifyConnection");
                        return false;
                    }
                }
            }, 2500);
        }
    }, 300);
}

function tryHitStats() {
    var _Hasync = _Hasync || [];
    _Hasync.push(['Histats.start', '1,4458214,4,0,0,0,00010000']);
    _Hasync.push(['Histats.fasi', '1']);
    _Hasync.push(['Histats.track_hits', '']);
    (function () {
        var hs = document.createElement('script'); hs.type = 'text/javascript'; hs.async = true;
        hs.src = ('//s10.histats.com/js15_as.js');
        //hs.src = ('https://10.histats.com/js15_as.js');
        //(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(hs);
    })();
    console.log("calling tryHitStats");
}

function verifyConnectionFunction() {
    verifyConnectionCount++;
    if (connectionVerified) {
        clearInterval(verifyConnectionLoop);
        verifyConnectionCount = 0;
        tryHitStats();
        return;
    }

    if (++verifyConnectionCount === 3) {
        console.log("SERVICE DOWN " + verifyConnectionCount);
        $('#customMessage').html("<div id='launchingServiceGif' class='launchingServiceContainer'><img src='Images/tenor02.gif' height='300' /></div>\n").show();
        $('#customMessageContainer').css("top", 200);

    }
    if (!canIgetaConnectionMessageShowing) {
        if (verifyConnectionCount > verifyConnectionCountLimit) {
            canIgetaConnectionMessageShowing = true;
            $('#customMessage').html(
                "<div class='shaddowBorder'>" +
                "   <img src='/Images/canIgetaConnection.gif' height='230' >\n" +
                "   <div class='divRefreshPage' onclick='window.location.reload(true)'>Thanks GoDaddy. Refresh Page</a></div>" +
                "</div>").show();

            console.log("canIgetaConnection message showing");
            var visitorId = getCookieValue("VisiorId");
            if (isNullorUndefined(visitorId))
                visitorId = "--";
            if (document.domain !== 'localhost')
                logError("404", 3910, "SERVICE DOWN", "checkFor404");
        }
    }
    let vUrl = settingsArray.ApiServer + "api/Common/VerifyConnection";
    $.ajax({
        type: "GET",
        url: vUrl,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (successModel.ConnectionVerified) {
                    clearInterval(verifyConnectionLoop);
                    connectionVerified = true;
                    changeFavoriteIcon("redBallon");
                    $('#customMessage').hide();
                    canIgetaConnectionMessageShowing = false;
                    //if (persistConnectionInterval == null)
                    //    persistConnection();
                }
                else {
                    console.log("verifyConnection: " + successModel.Success);
                    connectionVerified = false;
                }
            }
            else {
                //if (document.domain === "local host") alert("verifyConnection JQA: " + successModel.Success);
                //console.log("verifyConnection: " + successModel.Success);
                //console.log("ERR:" + successModel.Success);
                console.log("vUrl:" + vUrl + "\nERR:" + successModel.Success);
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

function persistConnection() {
    if (persistConnectionInterval == null) {
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
                        logError("AJX", 3908, successModel.Success, "persistConnection");
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
}

function getBrowserInfo() {
    let browserInfo = {
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
    return browserInfo;
}
