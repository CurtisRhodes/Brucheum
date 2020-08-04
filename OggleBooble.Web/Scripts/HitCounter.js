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
            visitorId = create_UUID();
            logError("IHE", folderId, "visitorId assigned: " + visitorId + " linkId: " + linkId, "logImageHit");
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
        logError("PHF", folderId, "folderId undefined in LogPageHit.", "logPageHit"); 0
        return;
    }

    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        verifiyVisitor("logPageHit", folderId);
        visitorId = create_UUID();
        logError("PHF", folderId, "visitorId assigned: " + visitorId + " linkId: " + linkId, "logPageHit");
    }

    if (visitorId.indexOf("-2282-")) {
        logEvent("XOM", folderId, "logPageHit", "On me");
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + visitorId + "&folderId=" + folderId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                if (visitorId !== "unidentified")
                    logVisit(visitorId, folderId);;
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
                    logEvent("VIS", folderId, "is new visitor: " + logVisitSuccessModel.IsNewVisitor, "HitCounter.js logVisit")
                }
            }
            else {
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
    
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/AddVisitor",
        data: visitorData,
        success: function (addVisitorSuccess) {
            if (addVisitorSuccess.Success === "ok") {
                setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                //setCookieValue("IsLoggedIn", "true");
                logEvent("NEW", folderId, addVisitorSuccess.EventDetail)
            }
            else logError("AJX", folderId, addVisitorSuccess.Success, "addVisitor");
        },
        error: function (jqXHR) {
            if (!checkFor404("addVisitor")) logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addVisitor");
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

function verifiyVisitor(calledFrom, folderId) {
    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        if (isNullorUndefined(window.localStorage["IpAddress"])) {
            if (getBrowserInfo().dataCookiesEnabled())
                getIpInfo(folderId, calledFrom);
            else {
                logError("VVE", folderId, "capta needed here. cookies not enabled", calledFrom);
            }
        }
        else {
            //  Ip found in local storage but not visitor Id
            logError("VVE", folderId, "capta needed here", calledFrom);
        }
    }
    else {
        console.log("visitorId found: " + visitorId);
        if (isNullorUndefined(window.localStorage["IpAddress"])) {
            getVisitorInfo(visitorId, calledFrom, folderId);
        }
    }
}

function getVisitorInfo(visitorId, calledFrom, folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
        success: function (visitorModel) {
            if (visitorModel.Success === "ok") {
                if (isNullorUndefined(window.localStorage["IpAddress"])) {
                    window.localStorage["IpAddress"] = visitorModel.IpAddress;
                    logError("REB", folderId, "had to look up IpAddress", calledFrom);
                }
            }
            else {
                if (visitorModel.Success = "not found") {
                    // add visitor
                    if (isNullorUndefined(window.localStorage["IpAddress"])) {
                        getIpInfo(folderId, calledFrom);
                    }
                    else {

                        logError("REB", folderId, "ip found but no visitor record.  Ip: " + window.localStorage["IpAddress"] , "getVisitorInfo");

                        //addVisitor({
                        //    IpAddress: data.ip,
                        //    FolderId: folderId,
                        //    CalledFrom: calledFrom,
                        //    City: data.loc,
                        //    Country: data.loc,
                        //    Region: data.loc,
                        //    GeoCode: data.ts
                        //});
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
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogIpCall?sessionId",
            data: {
                SessionId: sessionId,
                BrowserInfo: getBrowserInfo().browserPlatform()
            },
            success: function (logIpCallSuccess) {
                if (logIpCallSuccess == "ok") {
                    $.ajax({
                        type: "GET",
                        url: "https://ipinfo.io?token=ac5da086206dc4",
                        dataType: "JSON",
                        //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                        success: function (ipResponse) {
                            window.localStorage["IpAddress"] = ipResponse.ip;
                            console.log("iPInfo success: " + window.localStorage["IpAddress"]);
                            let visitorId = getCookieValue("VisitorId");

                            if (visitorId.indexOf("-2282-")) {
                                logEvent("XOM", folderId, "logPageHit", "On me");

                            }

                            if ((isNullorUndefined(visitorId)) || (visitorId.indexOf("-2282-"))) {
                                addVisitor({
                                    IpAddress: ipResponse.ip,
                                    FolderId: folderId,
                                    CalledFrom: calledFrom,
                                    City: ipResponse.city,
                                    Country: ipResponse.country,
                                    Region: ipResponse.region,
                                    GeoCode: ipResponse.loc
                                });
                            }
                            else {
                                getVisitorInfo(visitorId, calledFrom, folderId);
                            }

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
                    if (logIpCallSuccess.indexOf("Duplicate Entry") > 0) {
                        logError("IPI", folderId, "attempt to getIp multiple times for Session", "LogIpCall/" + calledFrom);
                    }
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

