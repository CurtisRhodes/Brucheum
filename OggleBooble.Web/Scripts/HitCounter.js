let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(linkId, folderId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IHE", folderId, "folderId came in Null or Undefined", "logImageHit");
            return;
        }
        let visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            //verifiyVisitor("logImageHit", folderId);
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
        getIpInfo(folderId, "logPageHit");
        return;
    }

    if (visitorId.indexOf("-2282-") > 0) {
        //getIpInfo(folderId, "logPageHit/-2282-");
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
                    //setCookieValue("VisitorId", "bypass");
                    logError("LGV", folderId, "VisitorId: " + visitorId + " not found in Visitor table", "logVisit");
                    //getIpInfo(folderId, "logVisit");
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

function getIpInfo(folderId, calledFrom) {
    try {
        let visitorId = getCookieValue("VisitorId");
        if (!isNullorUndefined(visitorId)) {
            logError("BUG", folderId, "attempt to getIpInfo for visitorId: " + visitorId, calledFrom);
            return;
        }
        if (isNullorUndefined(window.sessionStorage["sessionId"])) {
            window.sessionStorage["sessionId"] = "we have been here before";
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
                        success: function (addVisitorSuccess) {
                            if (addVisitorSuccess.Success == "ok") {
                                setCookieValue("VisitorId", visitorId);
                                let cookieTest = getCookieValue("VisitorId");
                                if (cookieTest === visitorId) {
                                    logEvent("NEW", folderId, calledFrom, cookieTest);
                                    if (calledFrom == "logStaticPageHit")
                                        logStaticPageHit(folderId, "getIpInfo");
                                }
                                else {
                                    logError("CTF", folderId, "getIpInfo", calledFrom);
                                }
                            }
                            else
                                if (addVisitorSuccess.Success == "existing Ip") {
                                    logError("BAD", folderId, "wasted Ip call", "getIpInfo");
                                    setCookieValue("VisitorId", addVisitorSuccess.VisitorId);

                                    let cookieTest = getCookieValue("VisitorId");
                                    if (cookieTest === addVisitorSuccess.VisitorId) {
                                        if (calledFrom == "logStaticPageHit")
                                            logStaticPageHit(folderId, "getIpInfo");
                                    }
                                    else
                                        logError("CTF", folderId, "existing Ip", "getIpInfo/" + calledFrom);
                                }
                                else
                                    logError("AJX", folderId, success, "addVisitor");
                        },
                        error: function (jqXHR) {
                            if (!checkFor404("addVisitor")) logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addVisitor");
                        }
                    });
                    logIpHit(visitorId, ipResponse.ip, folderId);
                },
                error: function (jqXHR) {
                    if (!checkFor404("getIpInfo")) {
                        logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getIpInfo/" + calledFrom);
                    }
                }
            });
        }
        else
            logError("BUG", folderId, window.sessionStorage["sessionId"], calledFrom);

    } catch (e) {
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
}

function logIpHit(visitorId, ipAddress, folderId) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogIpHit",
        data: {
            VisitorId: visitorId,
            FolderId: folderId,
            IpAddress: ipAddress
        },
        success: function (success) {
            if (success == "ok")
                logEvent("IPC", folderId, "logIpHit", visitorId);
            else
                logError("AJX", folderId, success, "logIpHit");
        },
        error: function (jqXHR) {
            if (!checkFor404("logIpHit")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "logIpHit");
            }
        }
    });
}

function logStaticPageHit(folderId, calledFrom) {
    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        if (calledFrom == "album") {
            getIpInfo(params.folder, "logStaticPageHit");
        }
        else {
            logError("BUG", folderId, "failed to catch vis", "logStaticPageHit");
        }
        return;
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + visitorId + "&folderId=" + folderId + "&calledFrom=" + calledFrom,
        success: function (success) {
            if (success == "ok")
                logEvent("SPH", folderId, "logStaticPageHit", visitorId);
            else
                logError("AJX", folderId, success, "logStaticPageHit");
        },
        error: function (jqXHR) {
            if (!checkFor404("logStaticPageHit")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "logStaticPageHit");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////l
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









