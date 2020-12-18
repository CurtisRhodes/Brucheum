﻿let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

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
                if (imageHitSuccessModel.Success == "ok") {
                    userPageHits = imageHitSuccessModel.UserPageHits;
                    userImageHits = imageHitSuccessModel.UserImageHits;
                    //checkForHitLimit("images", folderId, userPageHits, userImageHits);
                }
                else {
                    if (imageHitSuccessModel.Success.indexOf("Duplicate entry") > 0) {
                        //logError("AJX", folderId, imageHitSuccessModel.Success, "logImageHit");
                    }
                    else {
                        if (document.domain == 'localhost') {
                            //alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
                            alert(imageHitSuccessModel.Success);
                        } else
                            logError("AJX", folderId, imageHitSuccessModel.Success, "logImageHit");
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
        if (document.domain === 'localhost') {
            //alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
            alert(e);
        } else
            logError("CAT", folderId, e, "logImageHit");
    }
}

function logPageHit(folderId) {
    if (isNullorUndefined(folderId)) {
        logError("PHF", folderId, "folderId undefined: "+ folderId, "logPageHit");
        return;
    }

    if (isNullorUndefined(getCookieValue("VisitorId"))) {
        logError("VIV", folderId, "log visit called with no visitorId", "logVisit");
        getIpInfo(folderId, "logPageHit");
        return;
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + getCookieValue("VisitorId") + "&folderId=" + folderId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                logVisit(getCookieValue("VisitorId"), folderId);
            }
            else {
                if (pageHitSuccess.Success == "VisitorId not found") {
                    // logError("VIV", folderId, "log visit called with no visitorId", "logVisit");
                    getIpInfo(folderId, "logPageHit");
                    //logError("XOM", folderId, "-2282-", "logPageHit");
                }
                else
                    logError("AJX", folderId, pageHitSuccess.Success, "visitorId: " + getCookieValue("VisitorId"), "logPageHit");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function logVisit(visitorId, folderId) {
    if (isNullorUndefined(visitorId)) {
        if (isNullorUndefined(getCookieValue("VisitorId"))) {
            logError("BUG", folderId, "log visit called with no visitorId", "logVisit");
            getIpInfo(folderId, "logVisit");
            return;
        }
        else {
            logError("BUG", folderId, "log visit visitorId param came in empty", "logVisit");

        }
    }
    //if (visitorId == "bypass") {
    //    getIpInfo(folderId, "logVisit");
    //    return;
    //}

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);
                    if (logVisitSuccessModel.IsNewVisitor) {
                        logActivity("NVA", folderId);
                    }
                    else {
                        logActivity("RVR", folderId);  // return visitor
                    }
                }
            }
            else {
                if (logVisitSuccessModel.Success == "VisitorId not found") {
                    // add Visitor
                    logError("LGV", folderId, "VisitorId: " + visitorId + " not found in Visitor table", "logVisit");
                    getIpInfo(folderId, "not found in Visitor table");
                }
                else
                    logError("AJX", folderId, logVisitSuccessModel.Success, "logVisit");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function getIpInfo(folderId, calledFrom) {
    try {
        let visitorId = create_UUID();
        if (!isNullorUndefined(getCookieValue("VisitorId"))) {
            if (calledFrom == "not found in Visitor table") {
                visitorId = getCookieValue("VisitorId");
                if (!navigator.cookieEnabled) {
                    logError("UNC", folderId, "visitorId: " + visitorId, "getIpInfo/" + calledFrom);
                }
            }
            else {
                logError("XIP", folderId, "visitorId: " + visitorId, "getIpInfo/" + calledFrom);
                return;
            }
        }

        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
            success: function (ipResponse) {
                if (isNullorUndefined(ipResponse.ip)) {
                    logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + visitorId, "getIpInfo/" + calledFrom);
                }
                else {
                    setCookieValue("VisitorId", visitorId);
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
                                    logIpHit(visitorId, ipResponse.ip, folderId);
                                    //if (calledFrom == "logStaticPageHit")
                                    //    logStaticPageHit(folderId, "getIpInfo");
                                }
                                else {
                                    logError("CTF", folderId, "getIpInfo", calledFrom);
                                }
                            }
                            else {
                                if (addVisitorSuccess.Success == "existing Ip") {
                                    setCookieValue("VisitorId", addVisitorSuccess.VisitorId);

                                    if (!navigator.cookieEnabled) {
                                        logError("UNC", folderId, "visitorId: " + addVisitorSuccess.VisitorId, "getIpInfo/" + calledFrom);
                                    }
                                    else {
                                        setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                                        let cookieTest = getCookieValue("VisitorId");
                                        if ((cookieTest == addVisitorSuccess.VisitorId) && (window.localStorage[VisitorId] = cookieTest)) {
                                            logError("WIP", folderId, "visitorId: " + addVisitorSuccess.VisitorId, "getIpInfo/" + calledFrom);
                                        }
                                        else {
                                            if (!navigator.cookieEnabled) {
                                                logError("UNC", folderId, "visitorId: " + addVisitorSuccess.VisitorId, "getIpInfo/" + calledFrom);
                                            }
                                            else {
                                                logError("DVF", folderId, "visitorId: " + addVisitorSuccess.VisitorId, "getIpInfo/" + calledFrom);
                                            }
                                        }
                                    }
                                }
                                else
                                    logError("AJX", folderId, success, "addVisitor");
                            }
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                        }
                    });
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
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
                logActivity("IPA", folderId);
            else
                logError("AJX", folderId, success, "logIpHit");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function logStaticPageHit(folderId) {
    if (isNullorUndefined(getCookieValue("VisitorId"))) {
        getIpInfo(folderId, "logStatic PageHit");
        //logError("SPH", folderId, "visitorId: " + getCookieValue("VisitorId"), "logStatic PageHit");
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStatic PageHit?visitorId=" + visitorId + "&folderId=" + folderId + "&calledFrom=" + calledFrom,
        success: function (success) {
            if (success == "ok")
                logEvent("SPH", folderId, "logStatic PageHit", visitorId);
            else
                logError("AJX", folderId, success, "logStatic PageHit");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

//////////////////////////////////////////////////////////////////

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
