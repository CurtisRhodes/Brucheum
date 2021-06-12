let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(linkId, folderId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IHF", folderId, "linkId: " + linkId, "log ImageHit");
            return;
        }

        //let visitorId = getCookieValue("VisitorId");

        //if (visitorId == "not found") {
        //    logError2(visitorId, "IHE", folderId, "using visitorId bypass logError", "log ImageHit"); // visitorId came into logImageHit null or undefined
        //    //tryAddNewIP(folderId, "log ImageHit");
        //    //return;
        //}

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogImageHit",
            data: {
                VisitorId: getCookieValue("VisitorId"),
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
                        //logError("AJX", folderId, imageHitSuccessModel.Success, "logcImageHit");
                    }
                    else {
                        // ERROR: Validation failed for one or more entities. See 'EntityValidationErrors' property for more details.
                        // Entity of type "ImageHit" in state "Added" has the following validation errors: - 
                        // Property: "VisitorId", Error: "The VisitorId field is required."
                        if (document.domain == 'localhost') alert(imageHitSuccessModel.Success);
                        logError("AJX", folderId, imageHitSuccessModel.Success, "log ImageHit");
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "log ImageHit")) logError("XHR", folderId, errMsg, "log ImageHit");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "log ImageHit");
    }
}

let lastPageHitFolderId, lastPageHitVisitorId;
function logPageHit(folderId) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("PHF", folderId, "folderId undefined: " + folderId, "logPageHit");
            return;
        }
        let visitorId = getCookieValue("VisitorId");

        if ((lastPageHitFolderId == folderId) && (lastPageHitVisitorId == visitorId)) {
            logActivity("PHD", folderId, "log PageHit");
            return;
        }
        lastPageHitVisitorId = visitorId;
        lastPageHitFolderId = folderId;

        if (visitorId == "cookie not found") {
            //logError2(visitorId, "PHV", folderId, "visitorId bypass calling tryAddNewIP", "log PageHit"); //log page hit called with bad visitorId
            tryAddNewIP(folderId, "log PageHit");
        }

        if (visitorId == "user does not accept cookies") {
            //logError2(visitorId, "PHV", folderId, "visitorId bypass calling tryAddNewIP", "log PageHit"); //log page hit called with bad visitorId
            tryAddNewIP(folderId, "user does not accept cookies");
        }

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + visitorId + "&folderId=" + folderId,
            success: function (pageHitSuccess) {
                if (pageHitSuccess.Success === "ok") {
                    //logVisit(folderId, "logPageHit");
                }
                else {
                    logError("AJX", folderId, pageHitSuccess.Success, "logPageHit");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "logPageHit")) logError("XHR", folderId, errMsg, "logPageHit");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "logPageHIt");
    }
}

function logVisit(folderId, calledFrom) {
    try {
        let visitorId = getCookieValue("VisitorId");
        logActivity("LV0", folderId, calledFrom);

        //if (visitSuccessModel.VisitAdded) {
        //    var registeredUser = db.RegisteredUsers.Where(u => u.VisitorId == visitorId).FirstOrDefault();
        //    if (registeredUser != null) {
        //        visitSuccessModel.WelcomeMessage = "Welcome back " + registeredUser.UserName;
        //    }
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (successModel.ReturnValue == "new visitor logged") {
                        logActivity("LV1", folderId, "logVisit/" + calledFrom); // new visitor visit added
                        $('#headerMessage').html("Welcome new visitor. Please log in");
                    }
                    if (successModel.ReturnValue == "return visit logged") {
                        logActivity("LV2", folderId, "logVisit/" + calledFrom);  // Return Vist Recorded
                        if (isLoggedIn())
                            $('#headerMessage').html("Welcome back " + localStorage["UserName"]);
                        else
                            $('#headerMessage').html("Welcome back. Please log in");
                    }
                    if (successModel.ReturnValue == "no visit recorded")
                        logActivity("LV5", folderId, "logVisit/" + calledFrom); // no visit recorded

                    if (successModel.ReturnValue == "VisitorId not found")
                        logActivity2("LV3", folderId, "logVisit/" + calledFrom);  // visitorId not found

                }
                else {
                    logActivity("LV4", folderId, "logVisit/" + calledFrom);  // Log Visit fail
                    logError("AJX", folderId, successModel.Success, "logVisit/" + calledFrom);
                }
            },
            error: function (jqXHR) {
                logError("LV6", folderId, "visitorId: " + visitorId, calledFrom + "/logVisit");
                let errMsg = getXHRErrorDetails(jqXHR);
                //if (!checkFor404(errMsg, folderId, "logVisit/" + calledFrom))
                logError("XHR", folderId, errMsg, calledFrom + "/logVisit");
            }
        });
    } catch (e) {
        logError("LV7", folderId, "visitorId: " + visitorId, calledFrom + "/logVisit");
        logError("CAT", folderId, e, calledFrom);
    }
}

function logStaticPageHit(folderId, calledFrom) {

    logActivity("SP0", folderId, calledFrom); // calling static page hit
    let visitorId = getCookieValue("VisitorId");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + visitorId +
            "&folderId=" + folderId + "&calledFrom=" + calledFrom,
        success: function (success) {
            logActivity("SP4", folderId, success); // static page hit return
            if (success == "ok") {
                logActivity("SP1", folderId, calledFrom); // static page hit success
                logEvent("SPH", folderId, "logStatic PageHit/" + calledFrom, "");
            }
            else {
                logActivity("SP2", folderId, calledFrom); // static page hit ajax error
                logError("AJX", folderId, success, "logStatic PageHit/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            logActivity("SP6", folderId, calledFrom); // static page hit XHR error
            if (!checkFor404(errMsg, folderId, "log StaticPageHit"))
                logError("XHR", folderId, errMsg, "log StaticPageHit");
        }
    });
    //logEvent("SDS", folderId, "logStatic PageHit/" + calledFrom, "");
}

function logIpHit(visitorId, ipAddress, folderId) {
    try {
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
                    logActivity("IPH", folderId, "log IpHit");
                else
                    logError("AJX", folderId, success, "log IpHit");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "log IpHit"))
                    logError("XHR", folderId, errMsg, "log IpHit");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "log IpHit");
    }
}

//////////////////////////////////////////////////////////////////

function myMsgTest() {
    let wipTitle = "data tracking error";
    let wipMessage = "problem storing your IpAddress";
    wipMessage += "<br/>Unable to store a cookie";
    wipMessage += "<br/>This site requires cookies enabled";
    wipMessage += "<br/>You may be asked to login on every page until you leave.";
    wipMessage += "<br/>you must <a href=''>Register</a> or <a href=''>login</a> to continue";
    wipMessage += "<div class='robotWarning'><input type='checkbox'> I am not a robot.</input></div>";

    showMyAlert(wipTitle, wipMessage);
}

function checkForHitLimit(calledFrom, folderId, userPageHits, userImageHits) {
    if (localStorage["IsLoggedIn"] == "true") { }
    //if (!isLoggedIn())
    {
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

function testgetIp() {
    //getIpForExistingVisitorId(1234, create_UUID());
    //getIpForExistingVisitorId(1234, "a950b00f-46d2-45d5-b165-8846bf96130e");
    //getIpForExistingVisitorId(1234, null);
    //getIpInfo(1234, "curtis");
    //addNonIpVisitor(9999, "8b626a77-f854-46bc-aa29-2eda20b5e773");
    tryAlt_IpLookup(9999, "a950b00f-46d2-45d5-b165-8846bf96130e");

}
