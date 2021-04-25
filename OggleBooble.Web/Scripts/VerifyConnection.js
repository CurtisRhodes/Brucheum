let connectionVerified = false, canIgetaConnectionMessageShowing = false, verifyConnectionCount = 0, connectingToServerGifShowing = false,
    verifyConnectionCountLimit = 25, verifyConnectionLoop = null, persistConnectionInterval = null;

function checkFor404(errMsg, folderId, calledFrom) {
    //if (document.domain == "localhost") alert("XHR error: " + errMsg + " caught: " + errMsg.indexOf("Verify Network") > 0);
    if (errMsg.indexOf("Verify Network") > 0) {
        logError("CKE", folderId, errMsg, calledFrom);
        checkConnection(folderId, calledFrom);
        return true;
    }
    else {
        logError("CK2", folderId, errMsg, calledFrom);
        return false;
    }
}

function checkConnection(folderId, calledFrom) {
    connectionVerified = false;
    verifyConnectionCount = 0;
    let getXMLsettingsWaiter = setInterval(function () {
        if (settingsArray.ApiServer === undefined) {
            dots += "~ ";
            $('#dots').html(dots);
        }
        else {
            clearInterval(getXMLsettingsWaiter);
            verifyConnectionFunction(calledFrom, folderId);
            setTimeout(function () {
                if (connectionVerified) {
                    $('#dots').html('');
                    tryHitStats();
                    console.log("connection verified right off");
                }
                else {
                    connectingToServerGifShowing = false;
                    document.title = "loading : OggleBooble";
                    changeFavoriteIcon("loading");
                    let verifyConnectionWaiter = setInterval(function () {
                        if (connectionVerified) {
                            clearInterval(verifyConnectionWaiter);
                            $('#dots').html('');
                        }
                        else {
                            verifyConnectionCount++;
                            dots += ". ";
                            $('#dots').html(dots);

                            //$('#headerMessage').html(verifyConnectionCount);
                            if ((verifyConnectionCount > 4) && (!connectingToServerGifShowing)) showConnectingToServerGif();
                            if ((verifyConnectionCount > verifyConnectionCountLimit) && (!canIgetaConnectionMessageShowing)) {
                                showCanIgetaConnectionMessage(calledFrom);
                                $('#dots').html('');
                            }
                            //alert("verifyConnectionCount: " + verifyConnectionCount);
                            verifyConnectionFunction("settimeout", folderId);
                        }
                    }, 850);
                }
            }, 2000);
        }
    }, 300);
}

function showConnectingToServerGif() {
    //alert("showConnectingToServerGif() " + verifyConnectionCount + "  connectingToServerGifShowing: " + connectingToServerGifShowing);
    if (!connectingToServerGifShowing) {
        
        connectingToServerGifShowing = true;
        $('#customMessage').html("<div id='launchingServiceGif' class='launchingServiceContainer'><img src='Images/tenor02.gif' height='300' /></div>\n").show();
        $('#customMessageContainer').css("top", 200);

        console.log("showing connectingToServerGif");
        //alert("showConnectingToServerGif   " + verifyConnectionCount + "  connectingToServerGifShowing: " + connectingToServerGifShowing);
    }
}

function showCanIgetaConnectionMessage(calledFrom) {
    if (!canIgetaConnectionMessageShowing) {
        canIgetaConnectionMessageShowing = true;
        console.log("SERVICE DOWN " + verifyConnectionCount);
        $('#customMessage').html(
            "<div class='shaddowBorder'>" +
            "   <img src='/Images/canIgetaConnection.gif' height='230' >\n" +
            "   <div class='divRefreshPage' onclick='window.location.reload(true)'>Thanks GoDaddy. Refresh Page</a></div>" +
            "</div>").show();
        console.log("canIgetaConnection message showing");
        logError("404", 3910, "SERVICE DOWN", calledFrom);
    }
}

let verifyConnectionAvailable = true;
function verifyConnectionFunction(calledFrom, folderId) {
    if (connectionVerified)
        return;

    if (verifyConnectionAvailable) {
        verifyConnectionAvailable = false;
        $.ajax({
            type: "GET",
            //headers: { 'Access-Control-Allow-Origin': 'https://ogglebooble.com/' },
            url: settingsArray.ApiServer + "api/Common/VerifyConnection",
            success: function (successModel) {
                console.log("GET VerifyConnection: " + verifyConnectionCount);
                if (successModel.Success == "ok") {
                    if (successModel.ConnectionVerified) {
                        connectionVerified = true;
                        $('#customMessage').hide();
                        canIgetaConnectionMessageShowing = false;
                        launchingServiceGifShowing = false;
                    }
                    else {
                        console.log("success but no verify: " + successModel.Success);
                        //if (document.domain === "localhost")
                        //    alert("proper error in verify ConnectionFunction: " + successModel.Success);
                        //logError("AJX", folderId, "proper error in verify ConnectionFunction", calledFrom);
                        connectionVerified = false;
                    }
                }
                else {
                    if (successModel.Success.indexOf("Parameter name: app") > 0) {
                        connectionVerified = false;
                        //console.log("TRAPPED: " + successModel.Success);
                    }
                    else {
                        console.log("proper error in verify ConnectionFunction: " + successModel.Success);
                        logError("AJX", folderId, "proper error in verify ConnectionFunction", calledFrom);
                        //if (document.domain === "localhost") alert("proper error in verify ConnectionFunction: " + successModel.Success);
                    }
                }
                verifyConnectionAvailable = true;
            },
            error: function (jqXHR) {
                verifyConnectionAvailable = false;
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = "verifyConnectionFunction"; // arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                if (document.domain === "localhost") alert("verifyConnection XHR: " + errMsg);
                connectionVerified = false;
            }
        });
    }
}

function tryHitStats() {
    if (document.domain == "localhost")
        console.log("hitstats bypass")
    else {
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
    }
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
