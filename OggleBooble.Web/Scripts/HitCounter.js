let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(linkId, folderId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IH1", folderId, "TROUBLE in logImageHit. folderId came in Null or Undefined", "HitCounter.js logImageHit");
            return;
        }
        let visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            visitorId = create_UUID();
            setCookieValue("VisitorId", visitorId);
            logError("VIV", folderId, "Visitor undefined", "logImageHit");
            //getIpInfo(folderId, "logImageHit");
        }

        //let linkId = link.substr(link.lastIndexOf("_") + 1, 36);
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogImageHit",
            data: {
                VisitorId: visitorId,
                PageId: folderId,
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
                    logError("BUG", folderId, imageHitSuccessModel.Success, "logImageHit");
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
    //alert("logPageHit(" + folderId );  // + "," + visitorId + "," + calledFrom + ")");
    if (isNullorUndefined(folderId)) {
        logError("BUG", folderId, "folderId undefined in LogPageHit.", "logPageHit"); 0
        return;
    }



    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        visitorId = create_UUID();
        setCookieValue("VisitorId", visitorId);
        logError("VIV", folderId, "VisitorId undefined in LogPageHit.", "logPageHit");
        //getIpInfo(folderId, "logPageHit");
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
                logError("BUG", folderId, pageHitSuccess.Success, "logPageHit");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("logPageHit")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "logPageHit");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////////

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
                logError("BUG", folderId, logVisitSuccessModel.Success, "logVisit");
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
            else logError("BUG", folderId, addVisitorSuccess.Success, "addVisitor");
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
        getIpInfo(calledFrom, folderId);
    }
    else {
        console.log("visitorId found: " + visitorId);
        if (!isNullorUndefined(window.localStorage["IpAddress"]))
            getVisitorInfo(visitorId, calledFrom, folderId);
    }
}

function getVisitorInfo(visitorId, calledFrom, folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
        success: function (visitorModel) {
            if (visitorModel.Success === "ok") {
                if (isNullorUndefined(window.localStorage["IpAddress"])) {
                    //setCookieValue("IpAddress", visitorModel.IpAddress);
                    window.localStorage["IpAddress"] = visitorModel.IpAddress;
                    logError("REB", folderId, "had to look up IpAddress", calledFrom);
                }
            }
            else logError("BUG", folderId, visitorModel.Success, "getVisitorInfo");
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
    console.log("calling iPInfo");
    try {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogIpCall?sessionId",
            data: {
                SessionId: window.sessionStorage["sessionId"],
                BrowserInfo: getBrowserInfo
            },
            success: function (logIpCallSuccess) {
                if (logIpCallSuccess == "ok") {
                    $.ajax({
                        type: "GET",
                        url: "https://ipinfo.io?token=ac5da086206dc4",
                        dataType: "JSON",
                        //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                        success: function (ipResponse) {
                            //alert("ipResponse: " + ipResponse);
                            window.localStorage["IpAddress"] = ipResponse.ip;
                            console.log("iPInfo success: " + window.localStorage["IpAddress"]);

                            let visitorId = getCookieValue("VisitorId");
                            if (isNullorUndefined(visitorId)) {
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
                else logError("ERR", folderId, logIpCallSuccess, "LogIpCall/" + calledFrom);
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

