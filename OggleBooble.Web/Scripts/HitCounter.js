let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(linkId, folderId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IHE", folderId, "folderId came in Null or Undefined", "logImageHit");
            return;
        }
        let visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            verifiyVisitor("logImageHit", folderId);
            logError("IHE", folderId, "visitorId null or undefined", " linkId: " + linkId, "logImageHit");
            visitorId = "unidentified";
        }
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogImageHit",
            data: {
                VisitorId: visitorId,
                FolderId: folderId,
                LinkId: linkId,
                IsInitialHit: isInitialHit
            },
            success: function (imageHitSuccessModel) {
                if (imageHitSuccessModel.Success === "ok") {
                    userPageHits = imageHitSuccessModel.UserPageHits;
                    userImageHits = imageHitSuccessModel.UserImageHits;
                    //checkForHitLimit("images", folderId, userPageHits, userImageHits);
                }
                else {
                    logError("AJX", folderId, imageHitSuccessModel.Success, "logImageHit");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("logImageHit")) {
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "logImageHit");
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "logImageHit");
     }
}

function logPageHit(folderId) {
    if (isNullorUndefined(folderId)) {
        logError("PHF", folderId, "folderId undefined: "+ folderId, "logPageHit");
        return;
    }

    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        verifiyVisitor("logPageHit", folderId);
        visitorId = "unidentified";
    }

    if (visitorId.indexOf("-2282-")) {
        logEvent("XOM", folderId, "logPageHit", "On me");
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + visitorId + "&folderId=" + folderId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                if (visitorId === "unidentified")
                    logError("VVE", folderId, "sessionId: " + window.sessionStorage["sessionId"], "logPageHit");
                else
                    logVisit(visitorId, folderId);
                // checkForHitLimit("pages", folderId, pageHitSuccess.UserPageHits, pageHitSuccess.UserImageHits);
            }
            else {
                logError("AJX", folderId, pageHitSuccess.Success, "logPageHit");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("logPageHit")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "logPageHit");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////l

function logVisit(visitorId, folderId) {
    if (isNullorUndefined(visitorId)) {
        logError("BUG", folderId, "log visit called with no visitorId", "logVisit");
        return;
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    if (logVisitSuccessModel.IsNewVisitor) {
                        $('#headerMessage').html("Wecome new visitor!");
                    }
                    else {
                        $('#headerMessage').html("Wecome back" + logVisitSuccessModel.UserName);
                    }
                    logEvent("VIS", folderId, "is new visitor: " + logVisitSuccessModel.IsNewVisitor, "logVisit")
                }
            }
            else {
                if (logVisitSuccessModel.Success === "VisitorId not found") {
                    logError("BUG", folderId, "VisitorId: " + visitorId + " not found in Visitor table", "logVisit");
                    setCookieValue("VisitorId", "");
                    getIpInfo(folderId, "logVisit");
                }
                logError("AJX", folderId, logVisitSuccessModel.Success, "logVisit");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("logVisit")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "logVisit");
            }
        }
    });
}

function checkForHitLimit(calledFrom, folderId, userPageHits, userImageHits) {
    if (!isLoggedIn()) {
        if (calledFrom === "pages") {
            if (userPageHits > freePageHitsAllowed && userPageHits % 10 === 0) {
                if(window.localStorage["IpAddress"] !== "68.203.90.183") {
                    showCustomMessage(98, true);
                    logEvent("PAY", folderId, "UserPageHits: " + userPageHits)
                }
            }
        }
        if (calledFrom === "images") {
            if (userImageHits > freeImageHitsAllowed && userImageHits % 10 === 0) {
                logEvent("PAY", folderId, "Image Hits: " + userImageHits)
                showCustomMessage(97, true);
            }
        }
    }
    //    //alert("you have now visited " + userHits + " pages." +
    //    //    "\n It's time you Registered and logged in." +
    //    //    "\n you will be placed in manditory comment mode until you log in ");
    //}

    //if (userHits > userHitLimit) {
    //    alert("you have now visited " + pageHitSuccessModel.UserHits + " pages." +
    //        "\n It's time you Registered and logged in." +
    //        "\n you will be placed in manditory comment mode until you log in ");
    //}

    // login and I will let you see 1000 more images.
    // bookmark my site with link oog?domain=122; to get another 1,000 image views.
    // put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
    // use my product
    // Request extra privdleges 
    // pay me to do some programming for you and I'll let you in on all my source code
}

function isValidIpAddress() {
    if (isNullorUndefined(window.localStorage["IpAddress"]))
        return false;

    let ipTest = window.localStorage["IpAddress"];

    if (ipTest.length < 5)
        return false;
    if (ipTest.indexOf(".") > 1)
        return true;
} 

function verifiyVisitor(calledFrom, folderId) {
    let visitorId = getCookieValue("VisitorId");

    if (isNullorUndefined(visitorId)) {
        getIpInfo(folderId, calledFrom);
    }
    else {
        console.log("visitorId found: " + visitorId);
        if (!isValidIpAddress(window.localStorage["IpAddress"])) {
            getVisitorInfo(visitorId, calledFrom, folderId);
            // logError("IPI", folderId, "localStorage[IpAddress]: " + window.localStorage["IpAddress"], calledFrom);
        }
    }
}

function getVisitorFromIp(calledFrom, folderId) {
    let ipAddress = window.localStorage["IpAddress"];
    if (isNullorUndefined(ipAddress)) {
        logError("BUG", folderId, "getVisitorFromIp called with no IP", calledFrom);
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetVisitorFromIp?ipAddress=" + ipAddress,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                let visitorId = successModel.ReturnValue;
                if (isNullorUndefined(visitorId)) {
                    logError("BUG", folderId, "visitorId didnt come back", "getVisitorFromIp/" + calledFrom);
                }
                else {
                    setCookieValue("VisitorId", visitorId);
                    let cookieTest = getCookieValue("VisitorId");
                    if (isNullorUndefined(cookieTest)) {

                        logError("BUG", folderId, "visitorId didnt come back", "getVisitorFromIp/" + calledFrom);
                    }
                }
            }
            else {
                logError("AJX", folderId, successModel.Success, "getVisitorFromIp");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("getVisitorFromIp"))
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getVisitorFromIp");
        }
    });
}

function getVisitorInfo(visitorId, calledFrom, folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
        success: function (visitorModel) {
            if (visitorModel.Success === "ok") {
                window.localStorage["IpAddress"] = visitorModel.IpAddress;
                logError("REB", folderId, "had to look up IpAddress: " + window.localStorage["IpAddress"] +
                    " session: " + window.sessionStorage["sessionId"], "getVisitorInfo/" + calledFrom);
            }
            else {
                if (visitorModel.Success = "not found") {
                    // add visitor
                    if (!isValidIpAddress(window.localStorage["IpAddress"])) {
                        getIpInfo(folderId, calledFrom);
                    }
                    else {
                        logError("REB", folderId, "ip found but no visitor record.  Ip: " + window.localStorage["IpAddress"] , "getVisitorInfo");
                    }
                }
                else
                    logError("AJX", folderId, visitorModel.Success, "getVisitorInfo");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("getVisitorInfo"))
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getVisitorInfo");
        }
    });
}

function getCloudflare(calledFrom, folderId) {
    $.get('https://www.cloudflare.com/cdn-cgi/trace', function (data) {
        console.log("Cloudflare IP: " + data.ip);
        window.localStorage["IpAddress"] = data.ip;

        let visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            addVisitor({
                IpAddress: data.ip,
                FolderId: folderId,
                CalledFrom: calledFrom,
                City: data.loc,
                Country: data.loc,
                Region: data.loc,
                GeoCode: data.ts
            });
        }
        getVisitorInfo(visitorId, calledFrom, folderId);
    });
}

function getIpInfo(folderId, calledFrom) {
    try {
        let sessionId = window.sessionStorage["sessionId"];
        if (isNullorUndefined(sessionId)){
            logError("BUG", folderId, "sessionId null in getIpInfo", calledFrom);
            return;
        }
        let visitorId = getCookieValue("VisitorId");
        if (!isNullorUndefined(visitorId)) {

            getVisitorInfo(calledFrom, folderId);
            logError("BUG", folderId, "calling getVisitorInfo. Tried to call getIpInfo for visitorId: " + visitorId, calledFrom);

            return;
        }
        let ipAddress = window.localStorage["IpAddress"];
        if (isValidIpAddress(ipAddress)) {
            logError("BUG", folderId, "tried to call getIpInfo for IpAddress: " + ipAddress, calledFrom);
            getVisitorFromIp(calledFrom, folderId);
            return;
        }

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogIpCall",
            data: {
                SessionId: sessionId,
                BrowserInfo: getBrowserInfo().browserPlatform()
            },
            success: function (success) {
                if (success == "ok") {
                    $.ajax({
                        type: "GET",
                        url: "https://ipinfo.io?token=ac5da086206dc4",
                        dataType: "JSON",
                        //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                        success: function (ipResponse) {

                            window.localStorage["IpAddress"] = ipResponse.ip;
                            console.log("iPInfo success: " + window.localStorage["IpAddress"]);

                            logSuccessfullIpCall(folderId, calledFrom);

                            addVisitor({
                                IpAddress: ipResponse.ip,
                                FolderId: folderId,
                                CalledFrom: calledFrom,
                                City: ipResponse.city,
                                Country: ipResponse.country,
                                Region: ipResponse.region,
                                GeoCode: ipResponse.loc
                            });
                        },
                        error: function (jqXHR) {
                            if (!checkFor404("getIpInfo")) {
                                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getIpInfo/" + calledFrom);
                            }
                        }
                    });
                }
                else {
                    //'ERROR: Duplicate entry ''71ede59e-2282-9610-b246-8344b5bd6c1f-2020-08-04 08:45:18'' for key ''VisitorId'''
                    if (success.indexOf("Duplicate") > 0) {
                        logError("IPI", folderId, "attempt to getIp multiple times for Session: " + sessionId, "LogIpCall/" + calledFrom);
                        performCaptureTest(folderId, "getIpInfo/" + calledFrom);
                    }
                    else
                        logError("AJX", folderId, logIpCallSuccess, "LogIpCall/" + calledFrom);
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("LogIpCall")) {
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "LogIpCall/" + calledFrom);
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
}

function addVisitor(visitorData) {

    //visitorData = {
    //    IpAddress: ipResponse.ip,
    //    FolderId: folderId,
    //    CalledFrom: calledFrom,
    //    City: ipResponse.city,
    //    Country: ipResponse.country,
    //    Region: ipResponse.region,
    //    GeoCode: ipResponse.loc
    //};

    let visitorId = getCookieValue("VisitorId");
    if (!isNullorUndefined(visitorId)) {
        logError("BUG", folderId, "tried to call AddVisitor for visitorId: " + visitorId, "calledFrom");
        return;
    }
    if (!isNullorUndefined(visitorData.IpAddress)) {
        logError("BUG", folderId, "tried to call AddVisitor with bad IpAddress: ", "calledFrom");
        return;
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/AddVisitor",
        data: visitorData,
        success: function (addVisitorSuccess) {
            if (addVisitorSuccess.Success === "ok") {
                setCookieValue("VisitorId", addVisitorSuccess.ReturnValue);
                let cookieTest = getCookieValue("VisitorId");
                if (cookieTest === addVisitorSuccess.ReturnValue) {
                    logEvent("NEW", 11, "called", "new visitor added. VisitorId: " + cookieTest + " Ip: " + window.localStorage["IpAddress"]);
                }
                else {
                    performCaptureTest(folderId, "AddVisitor/" + calledFrom);
                    logError("BUG", 11, "Cookie test failed", "addVisitor");
                }
                //if (visitorId.indexOf("-2282-")) {
                //    logEvent("XOM", folderId, "logPageHit", "On me");
                //}

                //setCookieValue("IsLoggedIn", "true");
                //getVisitorInfo(visitorId, calledFrom, folderId);
            }
            else
                logError("AJX", folderId, addVisitorSuccess.Success, "addVisitor");
        },
        error: function (jqXHR) {
            if (!checkFor404("addVisitor")) logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addVisitor");
        }
    });
}

function performCaptureTest(folderId, calledFrom) {
    //alert
    if (!getBrowserInfo().dataCookiesEnabled()) {
        confirm("Are you a robot?\nThis app doesn't care about you, but does need to track hits.\nYou will continue to see this annoying message until you leave or allow cookies.")
    }
    logError("RBX", folderId, "Are you a robot? sessionId: " + sessionId, "performCaptureTest/" + calledFrom);
}

function logSuccessfullIpCall(folderId, calledFrom) {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Common/VerifyIpCall",
        data: {
            SessionId: sessionId,
            IpAddress: window.localStorage["IpAddress"]
        },
        success: function (success) {
            if (success !== "ok")
                logError("BUG", folderId, success, "logSuccessfullIpCall/"+calledFrom);
        },
        error: function (jqXHR) {
            if (!checkFor404("getIpInfo")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getIpInfo/" + calledFrom);
            }
        }
    });
}

