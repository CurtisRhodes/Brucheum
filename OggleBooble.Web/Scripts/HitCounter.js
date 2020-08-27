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
                    if (imageHitSuccessModel.Success.indexOf("Duplicate entry") > 0) {
                        //logError("AJX", folderId, imageHitSuccessModel.Success, "logImageHit");
                    }
                    else
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
        //if(window.s)
        getIpInfo(folderId, "logPageHit");
        return;
    }

    if (visitorId.indexOf("-2282-")) {
        getIpInfo(folderId, "logPageHit/-2282-");
        logEvent("XOM", folderId, "logPageHit", "-2282-");
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + visitorId + "&folderId=" + folderId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                logVisit(visitorId, folderId);
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
                    setCookieValue("VisitorId", "bypass");
                    logError("LGV", folderId, "VisitorId: " + visitorId + " not found in Visitor table", "logVisit");
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
                // if (window.localStorage["IpAddress"] !== "68.203.90.183")
                {
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

function addVisit(staticPageId) {
    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        getIpInfo(staticPageId, "staticPage:" + staticPageId);
    }
    logVisit(visitorId, staticPageId);
}

function getIpInfo(folderId, calledFrom) {
    try {
        //let visitorId = getCookieValue("VisitorId");
        //if (isNullorUndefined(visitorId))
        //else {
        //    logError("BUG", folderId, "attempt to getIpInfo for visitorId: " + visitorId, calledFrom);
        //    return;
        //}
        visitorId = create_UUID();
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
            success: function (ipResponse) {
                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "api/Common/AddVisitor",
                    data: {
                        VisitorId: visitorId,
                        IpAddress: ipResponse.ip,
                        FolderId: folderId,
                        CalledFrom: calledFrom,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc
                    },
                    success: function (success) {
                        if (success == "ok") {
                            setCookieValue("VisitorId", visitorId);

                            let cookieTest = getCookieValue("VisitorId");
                            if (cookieTest === visitorId)
                                logEvent("NEW", 11, "called", "new visitor added. VisitorId: " + cookieTest); // + " Ip: " + window.localStorage["IpAddress"]);
                            else
                                logError("BUG", 11, "Cookie test failed", "addVisitor");



                        }
                        else
                            logError("AJX", folderId, addVisitorSuccess.Success, "addVisitor");
                    },
                    error: function (jqXHR) {
                        if (!checkFor404("addVisitor")) logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addVisitor");
                    }
                });
                logIpCall(ipResponse.ip, folderId, calledFrom);
            },
            error: function (jqXHR) {
                if (!checkFor404("getIpInfo")) {
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getIpInfo/" + calledFrom);
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
}

function logIpCall(ipAddress, folderId, calledFrom) {

    //[Route("api/Common/LogIpCall")]
    //public string LogIpCall(IpInfoCall callData)

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogIpCall",
        data: {
            SessionId: visitorId,
            BrowserInfo: folderId,
            IpAddress: ipAddress
        },
        success: function (success) {
            if (success == "ok")
                logEvent("IPC", folderId, calledFrom, "log Ip Call");
            else
                logError("BUG", folderId, success, "logSuccessfullIpCall/" + calledFrom);
        },
        error: function (jqXHR) {
            if (!checkFor404("getIpInfo")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getIpInfo/" + calledFrom);
            }
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
        //getVisitorInfo(visitorId, calledFrom, folderId);
    });
}
