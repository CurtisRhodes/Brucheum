var freePageHitsAllowed = 500;
var freeImageHitsAllowed = 2500;

function logImageHit(link, pageId, isInitialHit) {
    try {
        if (isNullorUndefined(pageId)) {
            logError("IH1", pageId, "TROUBLE in logImageHit. PageId came in Null or Undefined", "HitCounter.js logImageHit");
            return;
        }
        var visitorId = getCookieValue("VisitorId");
        if (!Number.isInteger(pageId)) {
            logError("IH2", pageId, "PageId came in wrong. Link: " + link + "  pageId:  " + pageId, "HitCounter.js logImageHit");
            verifyVisitorId(visitorId, pageId);
            return;
        }
        if (isNullorUndefined(visitorId)) {
            logError("IH0", pageId, "logImageHit no VisitorId", "HitCounter.js logImageHit");
            //addVisitor(pageId, "logImageHit");
            return;
        }

        var linkId = link.substr(link.lastIndexOf("_") + 1, 36);
        var logImageHItData = {
            VisitorId: visitorId,
            PageId: pageId,
            LinkId: linkId,
            IsInitialHit: isInitialHit
        };
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogImageHit",
            data: logImageHItData,
            success: function (imageHitSuccessModel) {
                if (imageHitSuccessModel.Success === "ok") {
                    userPageHits = imageHitSuccessModel.UserPageHits;
                    userImageHits = imageHitSuccessModel.UserImageHits;
                    //checkForHitLimit("images", pageId, userPageHits, userImageHits);
                }
                else {
                    logError("BUG", pageId, imageHitSuccessModel.Success, "logImageHit");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("logImageHit")) {
                    logError("XHR", pageId, getXHRErrorDetails(jqXHR), "logImageHit");
                }
            }
        });
    } catch (e) {
        logError("CAT", pageId, e, "logImageHit");
     }
}

function logPageHit(pageId) {
    //alert("logPageHit(" + pageId );  // + "," + visitorId + "," + calledFrom + ")");
    if (isNullorUndefined(pageId)) {
        logError("BUG", pageId, "PageId undefined in LogPageHit.", "logPageHit");
        //sendEmailToYourself("PageId undefined in LogPageHit.", "visitorId: " + visitorId);
        return;
    }
    var visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        logError("BUG", pageId, "VisitorId undefined in LogPageHit.", "logPageHit");
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + visitorId + "&pageId=" + pageId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                //logVisit(visitorId, pageId);;
                // checkForHitLimit("pages", pageId, pageHitSuccess.UserPageHits, pageHitSuccess.UserImageHits);
            }
            else {
                logError("BUG", pageId, pageHitSuccess.Success, "logPageHit");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("logPageHit")) {
                logError("XHR", pageId, getXHRErrorDetails(jqXHR), "logPageHit");
            }
        }
    });
}

function logVisit(visitorId, pageId) {
    if (isNullorUndefined(visitorId)) {
        logError("BUG", pageId, "log visit called with no visitorId", "logVisit");
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
                    logEvent("VIS", pageId, "is new visitor: " + logVisitSuccessModel.IsNewVisitor, "HitCounter.js logVisit")
                }
            }
            else {
                logError("BUG", pageId, logVisitSuccessModel.Success, "logVisit");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("logVisit")) {
                logError("XHR", pageId, getXHRErrorDetails(jqXHR), "logVisit");
            }
        }
    });
}

function verifyVisitorId(visitorId, pageId, calledFrom) {
    if (isNullorUndefined(visitorId)) {
        logError("BUG", pageId, "visitorId undefined", "verifyVisitorId");
        return;
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/VisitorInfo/verifyVisitorId?visitorId=" + visitorId,
        success: function (visitorSuccessModel) {
            if (visitorSuccessModel.Success === "ok") {
                if (!visitorSuccessModel.Exists) {
                    logError("BUG", pageId, "VisitorId not found in Visitor table", "verifyVisitorId");
                }
            }
            else {
                logError("BUG", pageId, visitorSuccessModel.Success, "verifyVisitorId");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("logImageHit")) {
                logError("XHR", pageId, getXHRErrorDetails(jqXHR), "verifyVisitorId");
            }
        }
    });
}

function checkForHitLimit(calledFrom, pageId, userPageHits, userImageHits) {
    if (!isLoggedIn()) {
        if (calledFrom === "pages") {
            if (userPageHits > freePageHitsAllowed && userPageHits % 10 === 0) {
                if (getCookieValue("IpAddress") !== "68.203.90.183") {                   //if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
                    showCustomMessage(98, true);
                    logEvent("PAY", pageId, "UserPageHits: " + userPageHits)
                }
            }
        }
        if (calledFrom === "images") {
            if (userImageHits > freeImageHitsAllowed && userImageHits % 10 === 0) {
                logEvent("PAY", pageId, "Image Hits: " + userImageHits)
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


function getIpInfo(pageId, calledFrom) {
    console.log("calling iPInfo");
    try {
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
            success: function (ipResponse) {

                alert("ipResponse: " + ipResponse);
                //              if(ipResponse.)
                console.log("iPInfo success");

                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "api/Common/AddVisitor",
                    data: {
                        IpAddress: ipResponse.ip,
                        PageId: pageId,
                        CalledFrom: calledFrom,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc
                    },
                    success: function (addVisitorSuccess) {
                        if (addVisitorSuccess.Success === "ok") {
                            setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                            setCookieValue("IsLoggedIn", "true");
                            logEvent("NEW", pageId, addVisitorSuccess.EventDetail)
                        }
                        else {
                            logError("BUG",pageId, addVisitorSuccess.Success, "addVisitor");
                        }
                    },
                    error: function (jqXHR) {
                        if (!checkFor404("addVisitor")) 
                            logError("XHR", pageId, getXHRErrorDetails(jqXHR), "addVisitor");
                    }
                });
            },
            error: function (jqXHR) {
                if (!checkFor404("getIpInfo")) {
                    logError("XHR", pageId, getXHRErrorDetails(jqXHR), "getIpInfo/" + calledFrom);
                }
            }
        });
    } catch (e) {
        logError("CAT", pageId, e, "getIpInfo/" + calledFrom);
    }
}
