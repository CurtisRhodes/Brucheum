let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(linkId, folderId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IHF", folderId, "linkId: " + linkId, "logImageHit");
            return;
        }
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogImageHit",
            data: {
                VisitorId: getVisitorId(folderId, "logImageHit/" + calledFrom),
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
                        // ERROR: Validation failed for one or more entities. See 'EntityValidationErrors' property for more details.
                        // Entity of type "ImageHit" in state "Added" has the following validation errors: - 
                        // Property: "VisitorId", Error: "The VisitorId field is required."
                        if (document.domain == 'localhost') alert(imageHitSuccessModel.Success);
                        logError("AJX", folderId, imageHitSuccessModel.Success, "logImageHit");
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "logImageHit")) logError("XHR", folderId, errMsg, "logImageHit");
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
        
    //let visitorId = getVisitorId(folderId, "logPageHit");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + getVisitorId(folderId, "logPageHit") + "&folderId=" + folderId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                logVisit(folderId, "logPageHit");
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
}

let lastAddVisitorIdLookup;
function logVisit(folderId, calledFrom) {
    let visitorId = getVisitorId(folderId, "logVisit/" + calledFrom);
    if (visitorId == lastAddVisitorIdLookup) {
        logError("BUG", folderId, "same visitorId came in twice in a row", "logVisit/" + calledFrom);
        return;
    }
    lastAddVisitorIdLookup = visitorId;

    //logActivity("LV0", folderId,"logVisit");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {

                    $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);

                    if (logVisitSuccessModel.IsNewVisitor) {
                        logActivity("LV1", folderId, "logVisit/" + calledFrom);
                    }
                    else {
                        logActivity("LV2", folderId, "logVisit/" + calledFrom);  // Return Vist Recorded
                    }
                }
            }
            else {
                if (logVisitSuccessModel.Success == "VisitorId not found") {
                    logActivity("LV3", folderId, "logVisit");  // visitorId not found
                    logError("LV5", folderId, "visitorId: " + visitorId, "logVisit/" + calledFrom);
                    //getIpInfo(folderId, "logVisit");
                    //addVisitor()
                }
                else {
                    logActivity("LV4", folderId, "logVisit/" + calledFrom);  // Log Visit fail
                    logError("AJX", folderId, logVisitSuccessModel.Success, "logVisit/" + calledFrom);
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "logVisit/" + calledFrom)) logError("XHR", folderId, errMsg, "logVisit/" + calledFrom);
        }
    });
}

function getIpInfo(folderId, calledFrom) {
    try {
        setTimeout(function () {
            if (!isNullorUndefined(localStorage["VisitorId"])) {
                if (localStorage["VisitorId"] != 'unset') {
                    if (localStorage["VisitorId"].indexOf("failedGetIpInfo") > -1) {
                        logError("IP4", folderId, localStorage["VisitorId"], "getIpInfo/" + calledFrom);
                        //logActivity("IP4", folderId, calledFrom); // we got a looper
                        return;
                    }
                }
                //if (localStorage["VisitorId"].length() == 36) { }
            }

            let newVisitorId = create_UUID();
            logActivity("IP1", folderId, "getIpInfo/" + calledFrom);
            let ipInfoExited = false;
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io?token=ac5da086206dc4",
                dataType: "JSON",
                //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                success: function (ipResponse) {
                    ipInfoExited = true;
                    if (isNullorUndefined(ipResponse.ip)) {
                        logActivity("IP6", folderId, "getIpInfo/" + calledFrom);  // ipInfo success but came back with no ip
                        logError("BUG", folderId, "ipInfo came back with no ip. Bad visitorId added: ", "getIpInfo/" + calledFrom);
                        addBadVisitor();
                    }
                    else {
                        logActivity("IP2", folderId, "getIpInfo/" + calledFrom)
                        localStorage["VisitorId"] = newVisitorId;
                        addVisitor(
                            {
                                VisitorId: newVisitorId,
                                IpAddress: ipResponse.ip,
                                FolderId: folderId,
                                City: ipResponse.city,
                                Country: ipResponse.country,
                                Region: ipResponse.region,
                                GeoCode: ipResponse.loc,
                                CalledFrom: "getIpInfo/" + calledFrom
                            },
                            "getIpInfo"
                        );
                    }
                },
                error: function (jqXHR) {
                    ipInfoExited = true;
                    logActivity("IP3", folderId, "getIpInfo/" + calledFrom); // XHR error
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, visitorData.FolderId, "getIpInfo/" + calledFrom)) {
                        logError("IP3", visitorData.FolderId, errMsg, "try AddVisitor");
                        // Not connect.Verify Network.
                        let errMsg = getXHRErrorDetails(jqXHR);
                        //tryIfy(folderId, "getIpInfo/" + calledFrom, newVisitorId);
                    }
                }
            });
            setTimeout(function () {
                if (!ipInfoExited) {
                    logActivity("IP4", folderId, "getIpInfo/" + calledFrom); // ipInfo failed to respond
                    logError("IP6", folderId, "", "getIpInfo/" + calledFrom);
                    //tryIfy(folderId, "getIpInfo/" + calledFrom, newVisitorId);
                }
            }, 888);
        }, 889);
    } catch (e) {
        ipInfoExited = true;
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
}

function addBadVisitor() {
    // insert Visitor values('failedGetIpInfo_12345678-90abcb', '00.00.00', 'xx', 'xx', 'US', '000', current_date, 122);
    let badVisitorId = "failedGetIpInfo_" + create_UUID().substr(0, 15);
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/TryAddVisitor",
        data: {
            VisitorId: badVisitorId,
            IpAddress: "00.00.00",
            City: "xx",
            Country: "US",
            Region: "xx",
            GeoCode: '000'
        },
        success: function (avSuccess) {
            if (avSuccess.Success == "ok") {
                localStorage["VisitorId"] = "failedGetIpInfo_" + newVisitorId.substr(0, 15);
                // tryIfy(folderId, "getIpInfo/" + calledFrom, newVisitorId);
            }
            else
                logError("AJX", 222, "addBadVisitor");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, visitorData.FolderId, "addBadVisitor/" + calledFrom)) {
                //logError("XHR", visitorData.FolderId, errMsg, "addVisitor/" + calledFrom);
                //logActivity("IP3", folderId + "getIpInfo/" + calledFrom);
                alert("addBadVisitor XHR: " + errMsg);
            }
        }
    });
}

let lastTryaddVisitorIdLookup;
function addVisitor(visitorData) {
    try {
        if (visitorData.VisitorId == lastTryaddVisitorIdLookup) {
            logError("BUG", 555, "last visitorId hit twice in a row", "addVisitor/" + calledFrom);
            return;
        }

        lastTryaddVisitorIdLookup = visitorData.VisitorId;
        logActivity("AV0", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom); // calling AddVisitor 
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/TryAddVisitor",
            data: visitorData,
            success: function (avSuccess) {
                switch (avSuccess.Success) {
                    case "ok":
                        //logActivity("AV1", visitorData.FolderId, visitorData.CalledFrom); // add visit success
                        logActivity("AV3", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom); // new visitor added
                        logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);

                        if (visitorData.CalledFrom.EndsWith("logStatic PageHit")) {
                            logStaticPageHit(visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);
                        }
                        break;
                    case "existing Ip":
                        logActivity("AV5", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);  // existing IP visitorId used
                        logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                        if (visitorData.CalledFrom.EndsWith("logStatic PageHit"))
                            logStaticPageHit(visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);
                        break;
                    default: {
                        if (avSuccess.indexOf("Duplicate entry") > 0) {
                            logActivity("AV9", visitorData.FolderId, visitorData.CalledFrom); // Duplicate. Attempt to add new visitorId
                            logError("DVA", visitorData.FolderId, avSuccess.Success, "addVisitor" + "/" + visitorData.CalledFrom);
                        }
                        else {
                            logActivity("AV7", visitorData.FolderId, visitorData.CalledFrom); // unknown success code from Add Visitor
                            logError("AJ7", visitorData.FolderId, avSuccess, "AddVisitor/" + visitorData.CalledFrom);
                        }
                    }
                }
            },
            error: function (jqXHR) {
                logActivity("AV8", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom); // XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom)) {
                    logError("XHR", visitorData.FolderId, errMsg, "addVisitor" + "/" + visitorData.CalledFrom);
                    logActivity("IP3", folderId, "addVisitor" + "/" + visitorData.CalledFrom);
                }
            }
        });
    } catch (e) {
        logError("CAT", visitorData.FolderId, e, "addVisitor" + "/" + visitorData.CalledFrom);
    }
}

let lastTryIfyVisitorIdLookup;
function tryIfy(folderId, newVisitorId, calledFrom) {
    if (newVisitorId == lastTryIfyVisitorIdLookup)
        return;
    lastTryIfyVisitorIdLookup = newVisitorId;
    logActivity("IF0", folderId, "tryIfy/" + calledFrom); // attempting ipfy lookup
    $.ajax({
        type: "GET",
        url: "https://ipinfo.io?token=ac5da086206dc4",
        //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
        dataType: "JSON",
        success: function (ipResponse) {
            if (ipResponse.Success == "ok") {
                logActivity("IF2", folderId, "tryIfy/" + calledFrom); // ipfy XHR fail
                console.log("api.ipstack.com success");
            }
        },
        error: function (jqXHR) {
            logActivity("IF3", folderId, "tryIfy/" + calledFrom); // ipfy XHR fail
            let errMsg = getXHRErrorDetails(jqXHR);
            logActivity("SP6", folderId, calledFrom); // static page hit XHR error
            if (!checkFor404(errMsg, folderId, "logStaticPageHit")) logError("XHR", folderId, errMsg, "tryIfy/" + calledFrom);
            //addNonIpVisitor(folderId, newVisitorId);
        }
    });
}

 function myMsgTest() {
    let wipTitle = "data tracking error";
    let wipMessage = "problem storing your IpAddress";
    wipMessage += "<br/>Unable to store a cookie";
    wipMessage += "<br/>This site requires cookies enabled";
    wipMessage += "<br/>You may be asked to login on every page until you leave.";
    wipMessage += "<br/>you must <a href=''>Register</a> or <a href=''>login</a> to continue";
    wipMessage += "<div class='robotWarning'><input type='checkbox'/> I am not a robot.</div>";

    showMyAlert(wipTitle, wipMessage);
}

let lastIpHitVisitorId;
function logIpHit(visitorId, ipAddress, folderId) {
    try {
        if (visitorId == lastIpHitVisitorId) {
            logError("PH1", folderId, "VisitorId: " + visitorId + ", IpAddress: " + ipAddress, "logIpHit");
            return;
        }
        lastIpHitVisitorId = visitorId;

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
                    logActivity("IPH", folderId, "logIpHit");
                else
                    logError("AJX", folderId, success, "logIpHit");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "logIpHit")) logError("XHR", folderId, errMsg, "logIpHit");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "logIpHit");
    }
}

function logStaticPageHit(folderId, calledFrom) {

    logActivity("SP0", folderId, calledFrom); // calling static page hit
    let visitorId = getVisitorId(folderId, "logStaticPageHit/" + calledFrom);
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + visitorId +
            "&folderId=" + folderId + "&calledFrom=" + calledFrom,
        success: function (success) {
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
            if (!checkFor404(errMsg, folderId, "logStaticPageHit")) logError("XHR", folderId, errMsg, "logStaticPageHit");
        }
    });
    //logEvent("SDS", folderId, "logStatic PageHit/" + calledFrom, "");
}

//////////////////////////////////////////////////////////////////

function weDemandCookies() {

    alert("weDemandCookies");
    //showCustomMessage(1233, false);

}

function getCloudflare(calledFrom, folderId) {
    $.get('https://www.cloudflare.com/cdn-cgi/trace', function (data) {
        console.log("Cloudflare IP: " + data.ip);
        window.localStorage["IpAddress"] = data.ip;

        let visitorId = getVisitorId(folderId, "getCloudflare/" + calledFrom);
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
    tryIfy(9999, "a950b00f-46d2-45d5-b165-8846bf96130e", "testgetIp");

}

//let lastAddNonIdVisitorIdLookup;
//function addNonIpVisitor(folderId, visitorId) {
//    if (visitorId == lastAddNonIdVisitorIdLookup)
//        return;
//    lastAddNonIdVisitorIdLookup = visitorId;
//    logActivity("NV0", folderId, "add NonIp Visitor"); // calling add NonIp Visitor
//    $.ajax({
//        type: "GET",
//        url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
//        success: function (successModel) {
//            if (successModel.Success == "ok") { //alert("visitorId found");
//                logError("EIF", folderId, successModel.Success, "add NonIpVisitor/" + calledFrom);
//            }
//            else {
//                $.ajax({
//                    type: "POST",
//                    url: settingsArray.ApiServer + "api/Common/AddVisitor",
//                    data: {
//                        VisitorId: visitorId,
//                        IpAddress: '00.00.00.00',
//                        FolderId: folderId,
//                        Country: "UK",
//                        GeoCode: "00"
//                    },
//                    success: function (avSuccess) {
//                        if (avSuccess == "ok")
//                            logActivity("NV1", folderId, "add NonIp Visitor"); // add NonIp Visitor Success
//                        else if (avSuccess == "existing Ip")
//                            logActivity("NV1", folderId, "add NonIp Visitor"); // add NonIp Visitor Success
//                        else
//                        {
//                            logActivity("NV2", folderId, avSuccess); // add NonIp Visitor AJX error

//                            logError("AJX", folderId, "avSuccess: " + avSuccess, "add NonIp Visitor");
//                        }
//                    },
//                    error: function (jqXHR) {
//                        logActivity("NV3", folderId, "add NonIp Visitor"); // add NonIp Visitor XHR error
//                        let errMsg = getXHRErrorDetails(jqXHR);
//                        if (!checkFor404(errMsg, folderId, "add NonIpVisitor")) logError("XHR", folderId, errMsg, "add NonIpVisitor");
//                    }
//                });
//            }
//        },
//        error: function (jqXHR) {
//            let errMsg = getXHRErrorDetails(jqXHR);
//            if (!checkFor404(errMsg, folderId, "GetVisitor"))
//                logError("XHR", folderId, errMsg, "GetVisitor");
//        }
//    });
//}


//$.ajax({
//    url: "https://geo.ipify.org/api/v1?apiKey=at_QDHGDpxlpti3hQ9WQMvjXxFX54Sgf&ipAddress=" + ipResponse.ip,
//    dataType: "JSON",
//    success: function (geoResponse) {
//        addVisitor({
//            VisitorId: newVisitorId,
//            IpAddress: ipResponse.ip,
//            FolderId: folderId,
//            CalledFrom: "tryIfy/" + calledFrom,
//            City: geoResponse.location.city,
//            Country: geoResponse.location.country,
//            Region: geoResponse.location.region,
//            GeoCode: "00"
//        }, "ipify");
//        logActivity("IF1", folderId, "tryIfy/" + calledFrom); // ipfy lookup success
//    },
//    error: function (jqXHR) {
//        logActivity("IF2", folderId, "tryIfy/" + calledFrom); // ipfy lookup also failed
//        //addNonIpVisitor(folderId, newVisitorId);
//    }
//});
