let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(
    linkId, folderId, visitorId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IHF", folderId, "linkId: " + linkId, "log ImageHit");
            return;
        }
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogImageHit",
            data: {
                //VisitorId: getCookieValue("VisitorId", "log ImageHit"),
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
                    logActivity2(visitorId, "IPH", folderId, "log IpHit");
                else
                    logError2(visitorId, "AJX", folderId, success, "log IpHit");
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
