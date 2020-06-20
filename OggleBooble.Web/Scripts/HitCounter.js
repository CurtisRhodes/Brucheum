var freePageHitsAllowed = 500;
var freeImageHitsAllowed = 2500;

function logImageHit(link, pageId, isInitialHit) {
    try {
        if (isNullorUndefined(pageId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "IM1",
                Severity: 2,
                ErrorMessage: "TROUBLE in logImageHit. PageId came in Null or Undefined",
                CalledFrom: "HitCounter.js logImageHit"
            });
            //sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "Set to 1 or  something");
            return;
        }
        var visitorId = getCookieValue("VisitorId");
        if (!Number.isInteger(pageId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "IH2",
                Severity: 2,
                ErrorMessage: "PageId came in wrong. Link: " + link + "  pageId:  " + pageId,
                CalledFrom: "HitCounter.js logImageHit"
            });
            verifyVisitorId(visitorId, pageId);
            return;
        }
        if (isNullorUndefined(visitorId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "IH0",
                Severity: 27,
                ErrorMessage: "logImageHit no VisitorId",
                CalledFrom: pageId
            });
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
            url: settingsArray.ApiServer + "api/ImageHit/LogImageHit",
            data: logImageHItData,
            success: function (imageHitSuccessModel) {
                if (imageHitSuccessModel.Success === "ok") {
                    userPageHits = imageHitSuccessModel.UserPageHits;
                    userImageHits = imageHitSuccessModel.UserImageHits;
                    //checkForHitLimit("images", pageId, userPageHits, userImageHits);
                }
                else {
                    //if (imageHitSuccessModel.Success.indexOf("Duplicate entry") > 0) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "IM4",
                        Severity: 2,
                        ErrorMessage: imageHitSuccessModel.Success,
                        CalledFrom: "logImageHit"
                    });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "logImageHit")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "IM5",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "HitCounter.js logImageHit"
                    });
                }
            }
        });
    } catch (e) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "IM6",
            Severity: 2,
            ErrorMessage: "CATCH ERROR: " + e,
            CalledFrom: "logImageHit"
        });
     }
}

function logPageHit(pageId) {
    //alert("logPageHit(" + pageId );  // + "," + visitorId + "," + calledFrom + ")");
    if (isNullorUndefined(pageId)) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "AAA",
            Severity: 1,
            ErrorMessage: "PageId undefined in LogPageHit.",
            CalledFrom: "HitCounter.js logPageHit"
        });
        //sendEmailToYourself("PageId undefined in LogPageHit.", "visitorId: " + visitorId);
        return;
    }
    var visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "AA2",
            Severity: 1,
            ErrorMessage: "visitorId undefined in LogPageHit.",
            CalledFrom: "HitCounter.js logPageHit"
        });
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
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "B01",
                    Severity: 4,
                    ErrorMessage: pageHitSuccess.Success,
                    CalledFrom: "logPageHit"
                });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logPageHit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: "pageId: " + pageId + " Message: " + errorMessage,
                    CalledFrom: "HitCounter.js logPageHit"
                });
            }
        }
    });
}

function logVisit(visitorId, pageId) {
    if (isNullorUndefined(visitorId)) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "ERR",
            Severity: 256,
            ErrorMessage: "log visit called with no visitorId",
            PageId: pageId,
            CalledFrom: "HitCounter.js logVisit"
        });
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
                    logEventActivity({
                        VisitorId: visitorId,
                        EventCode: "VIS",
                        EventDetail: "VisitAdded. new visitor: " + logVisitSuccessModel.IsNewVisitor,
                        PageId: pageId,
                        CalledFrom: "HitCounter.js logVisit"
                    });
                    //sendEmailToYourself("Visit Added ", "visitorId: " + visitorId + "<br/>Initial Page: ");
                    //if (document.domain === 'localhost') alert("Visit Added ", "visitorId: " + visitorId);
                }                
            }
            else {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "ERR",
                    Severity: 2,
                    ErrorMessage: "PageId: " + pageId + " Message: " + logVisitSuccessModel.Success,
                    CalledFrom: "HitCounter.js logVisit"
                });
                //sendEmailToYourself("Ajax Error in logVisit", "PageId: " + pageId + "<br/>Message: " + logVisitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logVisit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "HitCounter.js logVisit"
                });
                //sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisit",
                //    "api/HitCounter/LogVisit?visitorId=" + visitorId +
                //    "<br/>" + errorMessage);
            }
        }
    });
}

function verifyVisitorId(visitorId, pageId, calledFrom) {
    if (isNullorUndefined(visitorId)) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "VV0",
            Severity: 2,
            ErrorMessage: "visitorId undefined",
            PageId: pageId,
            CalledFrom: "verifyVisitorId"
        });
        return;
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/VisitorInfo/verifyVisitorId?visitorId=" + visitorId,
        success: function (visitorSuccessModel) {
            if (visitorSuccessModel.Success === "ok") {
                if (!visitorSuccessModel.Exists) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "VV1",
                        Severity: 72,
                        ErrorMessage: "VisitorId not found in Visitor table",
                        PageId: pageId,
                        CalledFrom: "verifyVisitorId"
                    });
                    //addVisitor(pageId, "verifyVisitorId");
                    //callIpServiceFromStaticPage(pageId, calledFrom);
                }
            }
            else {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "VV2",
                    Severity: 2,
                    ErrorMessage: visitorSuccessModel.Success,
                    PageId: pageId,
                    CalledFrom: "verifyVisitorId"
                });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logImageHit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "VV3",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "verifyVisitorId"
                });
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
                    logEventActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        EventCode: "PAY",
                        EventDetail: "UserPageHits: " + userPageHits,
                        PageId: pageId,
                        CalledFrom: calledFrom
                    });
                }
            }
        }
        if (calledFrom === "images") {
            if (userImageHits > freeImageHitsAllowed && userImageHits % 10 === 0) {
                logEventActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    EventCode: "PAY",
                    EventDetail: "Image Hits: " + userImageHits,
                    PageId: pageId,
                    CalledFrom: calledFrom
                });
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

function getIpInfo(pageId,calledFrom) {
    console.log("calling iPInfo");
    try {
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
            success: function (ipResponse) {
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

                            logEventActivity({
                                VisitorId: getCookieValue("VisitorId"),
                                EventCode: "NEW",
                                EventDetail: addVisitorSuccess.EventDetail,
                                PageId: pageId,
                                CalledFrom: "callIpService/" + calledFrom
                            });
                        }
                        else {
                            logError({
                                VisitorId: addVisitorSuccess.VisitorId,
                                ActivityCode: "AV1",
                                Severity: 277,
                                ErrorMessage: addVisitorSuccess.Success,
                                PageId: pageId,
                                CalledFrom: "addVisitor/" + calledFrom
                            });
                        }
                    },
                    error: function (jqXHR) {
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "addVisitor")) {
                            logError({
                                VisitorId: visitorId,
                                ActivityCode: "AV3",
                                Severity: 1,
                                ErrorMessage: errorMessage + " called from: " + calledFrom,
                                PageId: pageId,
                                CalledFrom: "addVisitor/" + calledFrom
                            });
                        }
                    }
                });
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "addVisitor")) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "IP3",
                        Severity: 133,
                        ErrorMessage: errorMessage + " called from: " + calledFrom,
                        CalledFrom: "addVisitor/" + calledFrom
                    });
                }
            }
        });
    } catch (e) {
        logError({
            VisitorId: "--",
            ActivityCode: "AV4",
            Severity: 200,
            ErrorMessage: "Catch error: " + e,
            PageId: pageId,
            CalledFrom: "addVisitor/" + calledFrom
        });
    }
}

