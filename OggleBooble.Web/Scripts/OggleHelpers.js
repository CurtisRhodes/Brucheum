//let loginDebugMode = false;

function fireAndForget(requestType, url) {
    $.ajax({
        type: requestType,
        url: settingsArray.ApiServer + url,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.localStorage["userPermissons"] = successModel.ReturnValue;
                displayStatusMessage("ok", "user settings updated");
            }
            else {
                if (document.domain === "localHost")
                    alert("error " +url+" : " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: success,
                        PageId: 555,
                        CalledFrom: url
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404()) {
                if (document.domain === "localHost")
                    alert(url + " XHR: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        PageId: 555,
                        CalledFrom: url
                    });
                //sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take + "  Message: " + errorMessage);
            }
        }
    });
}

function localhostBypass() {
    if (document.domain === 'localhost') {
        setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
        setCookieValue("UserName", "developer");
        var userPermissons = [];
        userPermissons.push("Oggle admin");
        userPermissons.push("access dashboard");
        userPermissons.push("view dynamic");
        window.localStorage["userPermissons"] = userPermissons;
        //window.localStorage["IsLoggedIn"] = "true";
        console.log("local host kludge");
    }
}

function handleUnidentifiedVisitor() {
    console.log("Unidentified Visitor");
    // try to uniquely identify unknown user
    let fakeId = createFakeGUID();
    setCookieValue("VisitorId", fakeId);
    //alert("getVisitorInfo().referrer(): " + getVisitorInfo().referrer());
    //console.log("latitude: " + getVisitorInfo().latitude());
    //console.log("longitude: " + getVisitorInfo().longitude());
    //console.log("accuracy: " + getVisitorInfo().accuracy());
    //console.log("altitude: " + getVisitorInfo().altitude());
    //console.log("altitudeAccuracy: " + getVisitorInfo().altitudeAccuracy());
    console.log("heading: " + getVisitorInfo().heading());
    console.log("speed: " + getVisitorInfo().speed());
    console.log("timestamp: " + getVisitorInfo().timestamp());
}

function createFakeGUID() {
    // thank tohttps://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
    var dt = new Date().getTime();
    var uuid = 'Zxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
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

        latitude() { return position.coords.latitude },
        longitude() { return position.coords.longitude },
        accuracy() { return position.coords.accuracy },
        altitude() { return position.coords.altitude },
        altitudeAccuracy() { return position.coords.altitudeAccuracy },
        heading() { return position.coords.heading },
        speed() { return position.coords.speed },
        timestamp() { return position.timestamp },
    };
    return info;
}

function logEventActivity(logEventModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogActivity",
        data: logEventModel,
        success: function (success) {
            if (success !== "ok") {
                if (document.domain === "localhost") alert("LogEventActivity error: " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "ER2",
                        Severity: 2,
                        ErrorMessage: success,
                        CalledFrom: "LogEventActivity"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "LogEventActivity")) {
                if (document.domain === "localhost") alert("LogEventActivity error: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "LogEventActivity"
                    });
            }
        }
    });
}

