﻿let connectionVerified = false;

function checkFor404(errMsg, folderId, calledFrom) {
    try {
        //if (document.domain == "localhost") alert("XHR error: " + errMsg + " caught: " + errMsg.indexOf("Verify Network") > 0);
        if (errMsg.indexOf("Not connect") > -1) {
            //logError("CKE", folderId, errMsg, calledFrom);
            checkConnection(folderId, calledFrom);
            return true;
        }
        else {
            logError("CKE", folderId, errMsg, calledFrom);
            return false;
        }
    } catch (e) {
        //alert("404: " + e);
        return true;
    }
}

function checkConnection(folderId, calledFrom) {
    changeFavoriteIcon("loading");
    let dots = "";
    let getXMLsettingsWaiter = setInterval(function () {
        document.title = "loading settings : OggleBooble";
        if (settingsArray.ApiServer === undefined) {
            dots += "~ ";
            $('#dots').html(dots);
        }
        else {
            clearInterval(getXMLsettingsWaiter);
            let verifyConnectionCount = 0, verifyConnectionAvailable = true;
            let connectingToServerImgShowing = false, canIgetaConnectionImgShowing = false;
            document.title = "connecting : OggleBooble";
            connectionVerified = false;
            let verifyConnectionWaiter = setInterval(function () {
                if (connectionVerified) {
                    clearInterval(verifyConnectionWaiter);
                    $('#dots').html('');
                    console.log("connection verified after: " + verifyConnectionCount);
                    $('#headerMessage').html("");
                }
                else {
                    dots += ". ";
                    $('#dots').html(dots);
                    $('#headerMessage').html(++verifyConnectionCount);
                    //if (verifyConnectionAvailable)
                    {
                        verifyConnectionAvailable = false;
                        if (!connectingToServerImgShowing && verifyConnectionCount > 8) {
                            $('#customMessage').html("<div id='launchingServiceGif' class='launchingServiceContainer'><img src='Images/tenor02.gif' height='300' /></div>\n").show();
                            $('#customMessageContainer').css("top", 200).css("left", 500).show();
                            console.log("showing connectingToServerGif");
                            connectingToServerImgShowing = true;
                        }
                        if (!canIgetaConnectionImgShowing && verifyConnectionCount > 22) {
                            $('#customMessage').html(
                                "<div class='shaddowBorder'>" +
                                "   <img src='/Images/canIgetaConnection.gif' height='230' >\n" +
                                "   <div class='divRefreshPage' onclick='window.location.reload(true)'>Thanks GoDaddy. Refresh Page</a></div>" +
                                "</div>").show();
                            console.log("canIgetaConnection message showing");
                            logError("404", 3910, "SERVICE DOWN", calledFrom);
                            canIgetaConnectionImgShowing = true;
                        }
                        $.ajax({
                            type: "GET",
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
                                        if (document.domain === "localhost") alert("success but no verify: " + successModel.Success);
                                    }
                                }
                                else {
                                    if (successModel.Success.indexOf("Parameter name: app") > -1) {
                                        //console.log("TRAPPED: " + successModel.Success);
                                    }
                                    if (successModel.Success.indexOf("A socket operation was attempted to an unreachable network") > -1) {
                                        $('#dots').html('');
                                        clearInterval(verifyConnectionWaiter);
                                        alert("no network connection");
                                    }
                                    //   console.log("proper error in verify ConnectionFunction: " + successModel.Success);
                                    //   logError("AJX", folderId, "proper error in verify ConnectionFunction", calledFrom);
                                    //if (document.domain === "localhost") alert("proper error in verify ConnectionFunction: " + successModel.Success);
                                }
                                verifyConnectionAvailable = true;
                            },
                            error: function (jqXHR) {
                                clearInterval(verifyConnectionWaiter);
                                let errMsg = getXHRErrorDetails(jqXHR);
                                if (document.domain === "localhost") alert("verifyConnection XHR: " + errMsg);
                            }
                        });
                    }
                }
            }, 550);
        }
    }, 300);
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
