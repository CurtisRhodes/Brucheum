let freePageHitsAllowed = 500;
let freeImageHitsAllowed = 2500;

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

function isValidVisitorId() {
    let visitorId = getCookieValue("VisitorId");
    //if (visitorId.indexOf("-2282-") > 0)
        return true;
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

function addVisitor(folderId, calledFrom) {

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/AddVisitor",
        data: {
            IpAddress: ipResponse.ip,
            FolderId: folderId,
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
                logEvent("NEW", folderId, addVisitorSuccess.EventDetail)
            }
            else {
                logError("BUG", folderId, addVisitorSuccess.Success, "addVisitor");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("addVisitor"))
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addVisitor");
        }
    });
    //if (isNullorUndefined(visitorId)) {
    //    logError("BUG", folderId, "visitorId undefined", "verifyVisitorId");
    //    return;
    //}

    //let tempVisitorId = get

    //$.ajax({
    //    type: "GET",
    //    url: settingsArray.ApiServer + "api/VisitorInfo/verifyVisitorId?visitorId=" + visitorId,
    //    success: function (visitorSuccessModel) {
    //        if (visitorSuccessModel.Success === "ok") {
    //            if (!visitorSuccessModel.Exists) {
    //                logError("BUG", folderId, "VisitorId not found in Visitor table", "verifyVisitorId");
    //            }
    //        }
    //        else {
    //            logError("BUG", folderId, visitorSuccessModel.Success, "verifyVisitorId");
    //        }
    //    },
    //    error: function (jqXHR) {
    //        if (!checkFor404("logImageHit")) {
    //            logError("XHR", folderId, getXHRErrorDetails(jqXHR), "verifyVisitorId");
    //        }
    //    }
    //});
}

function checkForHitLimit(calledFrom, folderId, userPageHits, userImageHits) {
    if (!isLoggedIn()) {
        if (calledFrom === "pages") {
            if (userPageHits > freePageHitsAllowed && userPageHits % 10 === 0) {
                if (getCookieValue("IpAddress") !== "68.203.90.183") {                   //if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
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

function getIpInfo(folderId, calledFrom) {
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
