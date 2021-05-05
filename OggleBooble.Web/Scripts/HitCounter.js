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
                VisitorId: globalVisitorId,
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
        
    //    logError("VIV", folderId, "log visit called with no visitorId", "logVisit");
    //    getIpInfo(folderId, "logPageHit");
    //    return;
    //}

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogPageHit?visitorId=" + globalVisitorId + "&folderId=" + folderId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                logVisit(globalVisitorId, folderId);
            }
            else {
                if (pageHitSuccess.Success == "VisitorId not found") {
                    logError("VIV", folderId, "log visit called with no visitorId", "logVisit");
                    getIpInfo(folderId, "logPageHit");
                    //logError("XOM", folderId, "-2282-", "logPageHit");
                }
                else
                    logError("AJX", folderId, pageHitSuccess.Success, "visitorId: " + globalVisitorId, "logPageHit");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "logPageHit")) logError("XHR", folderId, errMsg, "logPageHit");
        }
    });
}

let lastAddVisitorIdLookup;
function logVisit(folderId) {

    if (globalVisitorId == lastAddVisitorIdLookup)
        return;
    lastAddVisitorIdLookup = globalVisitorId;

    //logActivity("LV0", folderId,"logVisit");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + globalVisitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);
                    if (logVisitSuccessModel.IsNewVisitor) {
                        logActivity("LV1", folderId, "logVisit");
                    }
                    else {
                        logActivity("LV2", folderId, "logVisit");  // Return Vist Recorded
                    }
                }
            }
            else {
                if (logVisitSuccessModel.Success == "VisitorId not found") {
                    //logActivity("LV3", folderId, "logVisit");  // return visitor
                    getIpInfo(folderId, "LGV");
                }
                else {
                    logActivity("LV4", folderId, "logVisit");  // Log Visit fail
                    logError("AJX", folderId, logVisitSuccessModel.Success, "logVisit");
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "logVisit")) logError("XHR", folderId, errMsg, "logVisit");
        }
    });
}

let lastAddNonIdVisitorIdLookup;
function addNonIpVisitor(folderId, visitorId) {
    if (visitorId == lastAddNonIdVisitorIdLookup)
        return;
    lastAddNonIdVisitorIdLookup = visitorId;
    logActivity("NV0", folderId, "add NonIp Visitor"); // calling add NonIp Visitor
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
        success: function (successModel) {
            if (successModel.Success == "ok") { //alert("visitorId found");
                logError("EIF", folderId, successModel.Success, "add NonIpVisitor/" + calledFrom);
            }
            else {
                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "api/Common/AddVisitor",
                    data: {
                        VisitorId: visitorId,
                        IpAddress: '00.00.00.00',
                        FolderId: folderId,
                        Country: "UK",
                        GeoCode: "00"
                    },
                    success: function (avSuccess) {
                        if ((avSuccess == "ok") || (avSuccess == "existing Ip"))
                            logActivity("NV1", folderId, "add NonIp Visitor"); // add NonIp Visitor Success
                        else {
                            logActivity("NV2", folderId, avSuccess); // add NonIp Visitor AJX error
                            logError("AJX", folderId, "avSuccess: " + avSuccess, "add NonIp Visitor");
                        }
                    },
                    error: function (jqXHR) {
                        logActivity("NV3", folderId, "add NonIp Visitor"); // add NonIp Visitor XHR error
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errMsg, folderId, "add NonIpVisitor")) logError("XHR", folderId, errMsg, "add NonIpVisitor");
                    }
                });
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "GetVisitor"))
                logError("XHR", folderId, errMsg, "GetVisitor");
        }
    });
}

function getIpInfo(folderId, calledFrom) {
    try {
        //logActivity("AA0", folderId, "getIpInfo/" + calledFrom);

        //if (calledFrom == "LGV") {
        //    logError("BUG", folderId, "this should a been picked up", "getIpInfo");
        //    return;
        //}

        //if (!navigator.cookieEnabled) {  // user does not accept cookies
        //    logError("UNC", folderId, "cookie test passed", "getIpInfo/" + calledFrom);

        //    //return;
        //    //wipMessage += "<br/>This site requires cookies enabled";
        //    //wipMessage += "<br/>You may be asked to login on every page until you leave.";
        //}


        try {
            //alert("AA1 IP info call null visitorId")
            let newVisitorId = create_UUID();
            //logActivity("AA1", folderId, "getIpInfo/" + calledFrom);
            let ipInfoSuccess = false;
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io?token=ac5da086206dc4",
                dataType: "JSON",
                //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                success: function (ipResponse) {
                    logActivity("AA2", folderId, "getIpInfo/" + calledFrom);
                    ipInfoSuccess = true;
                    //alert("AA2 IP info call success");
                    if (isNullorUndefined(ipResponse.ip)) {
                        //logActivity("AA3", folderId);
                        alert("ipInfo success but came back with no ip")
                        //logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + newVisitorId, "getIpInfo/" + calledFrom);
                    }
                    else {
                        globalVisitorId = newVisitorId;
                        addVisitor(
                            {
                                VisitorId: newVisitorId,
                                IpAddress: ipResponse.ip,
                                FolderId: folderId,
                                CalledFrom: "getIpInfo/" + calledFrom,
                                City: ipResponse.city,
                                Country: ipResponse.country,
                                Region: ipResponse.region,
                                GeoCode: ipResponse.loc
                            },
                            "getIpInfo"
                        );
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    alert("XHR in getIpInfo: " + errMsg);
                    //logActivity("AA3", folderId, "getIpInfo/" + calledFrom);
                    //tryIfy(folderId, "getIpInfo/" + calledFrom, newVisitorId);
                }
            });



            setTimeout(function () {
                if (!ipInfoSuccess) {
                    logActivity("AA5", folderId, "getIpInfo/" + calledFrom); // ipInfo failed to respond
                    //logError("IPF", folderId, "", "getIpInfo/" + calledFrom);
                    tryIfy(folderId, "getIpInfo/" + calledFrom, newVisitorId);
                }
            }, 771);

        } catch (e) {
            logActivity("CCC", folderId);
            logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
        }
    }
    catch (e) {
        logActivity("CCC", folderId);
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
}

function getIpForExistingVisitorId(folderId, calledFrom) {
    try {
        if (!navigator.cookieEnabled) {  // user does not accept cookies
            logError("UNC", folderId, "CTF", "gIp4ExistingVisitorId");
            weDemandCookies();
        }
        logActivity("EX0", folderId, "gIp4ExistingVisitorId"); // calling ipInfo For Existing VisitorId
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + globalVisitorId,
            success: function (successModel) {
                if (successModel.Success == "ok") { //alert("visitorId found");
                    //logError("CTF", folderId, globalVisitorId + " != " + visitorId, "gIp4ExistingVisitorId");
                    logActivity("EX8", folderId, "gIp4ExistingVisitorId"); // VisitorId found in Visitor table
                    logError("LGV", folderId, avSuccess, "gIp4ExistingVisitorId");
                }
                else {
                    if (successModel.Success == "not found") {
                        $.ajax({
                            type: "GET",
                            url: "https://ipinfo.io?token=ac5da086206dc4",
                            success: function (ipResponse) {
                                if (isNullorUndefined(ipResponse.ip)) {
                                    logError("IPF", folderId, "", "getIpInfo/" + calledFrom);
                                }
                                else {
                                    logActivity("EX1", folderId, "gIp4ExistingVisitorId"); // ipInfo Success For Existing VisitorId
                                    addVisitor({
                                        CalledFrom: "getIpForExistingVisitorId",
                                        VisitorId: visitorId,
                                        IpAddress: ipResponse.ip,
                                        FolderId: folderId,
                                        City: ipResponse.city,
                                        Country: ipResponse.country,
                                        Region: ipResponse.region,
                                        GeoCode: ipResponse.loc
                                    }, "exv");
                                }
                            },
                            error: function (jqXHR) {
                                logActivity("EX3", folderId, "gIp4ExistingVisitorId"); // ipInfo jqXHR
                                tryIfy(folderId, visitorId, "getIpExistingVisId");
                                // logError("XEX", folderId, jqXHR.status + " " + jqXHR.statusText, "getIpInfo");
                            }
                        });
                    }
                    else {
                        logActivity("EX9", folderId, "gIp4ExistingVisitorId"); // unknown success code from Get Visitor
                        logError("EIF", folderId, successModel.Success, "gIp4ExistingVisitorId");
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "gIp4ExistingVisitorId"))
                    logError("XHR", folderId, errMsg, "gIp4ExistingVisitorId");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "gIp4ExistingVisitorId");
    }
}

let lastTryaddVisitorIdLookup;
function addVisitor(visitorData, calledFrom) {
    if (visitorData.VisitorId == lastTryaddVisitorIdLookup)
        return;
    lastTryaddVisitorIdLookup = visitorData.VisitorId;
    //logActivity("AV0", visitorData.FolderId, calledFrom + "/" + visitorData.CalledFrom); // calling AddVisitor 
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/TryAddVisitor",
        data: visitorData,
        success: function (avSuccess) {
            logActivity("AV1", visitorData.FolderId, visitorData.CalledFrom); // add visit success
            switch (avSuccess.Success) {
                case "ok":
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                    logActivity("AV3", visitorData.FolderId, visitorData.CalledFrom); // new visitor added
                    if (visitorData.CalledFrom.EndsWith("logStatic PageHit"))
                        logStaticPageHit(visitorData.FolderId, "add visitor");
                    break;
                case "existing Ip":
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                    globalVisitorId = avSuccess.VisitorId;
                    window.localStorage["VisitorId"] = globalVisitorId;
                    alert("TryAddVisitor found existing Ip\nglobalVisitorId set to: " + globalVisitorId);
                    logActivity("AV5", visitorData.FolderId, visitorData.CalledFrom);  // existing IP visitorId used

                    //if (visitorData.CalledFrom.EndsWith("logStatic PageHit"))
                      //  logStaticPageHit(visitorData.FolderId, "add visitor");
                    break;
                default: {
                    if (avSuccess.indexOf("Duplicate entry") > 0) {
                        if (!navigator.cookieEnabled) {  // user does not accept cookies
                            logError("UNC", visitorData.FolderId, "3", "AddVisitor/" + visitorData.CalledFrom);
                        }
                        logActivity("AV9", visitorData.FolderId, visitorData.CalledFrom); // Duplicate. Attempt to add new visitorId
                        //logError("DVA", visitorData.FolderId, avSuccess, "AddVisitor/" + calledFrom);
                    }
                    else {
                        logActivity("AV7", visitorData.FolderId, visitorData.CalledFrom); // unknown success code from Add Visitor
                        logError("AJ7", visitorData.FolderId, avSuccess, "AddVisitor/" + visitorData.CalledFrom);
                    }
                }
            }
        },
        error: function (jqXHR) {
            logActivity("AV8", visitorData.FolderId, visitorData.CalledFrom); // XHR error
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, visitorData.FolderId, "try AddVisitor"))
                logError("XHR", visitorData.FolderId, errMsg, "try AddVisitor");
        }
    });
}
let lastTryIfyVisitorIdLookup;
function tryIfy(folderId, newVisitorId, calledFrom) {
    if (newVisitorId == lastTryIfyVisitorIdLookup)
        return;
    lastTryIfyVisitorIdLookup = newVisitorId;
    logActivity("IF0", folderId, "tryIfy/" + calledFrom); // attempting ipfy lookup
    $.ajax({
        type: "GET",
        url: "https://api.ipify.org?format=jsonp&callback=?",
        //url:"https://www.cloudflare.com/cdn-cgi/trace",
        //url: "https://ipinfo.io?token=ac5da086206dc4",
        //                                           5de5cc8e1f751bc1456a6fbf1babf557
        //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
        dataType: "JSON",
        success: function (ipResponse) {
            console.log("api.ipstack.com success");
            //$.getJSON()
            $.ajax({
                url: "https://geo.ipify.org/api/v1?apiKey=at_QDHGDpxlpti3hQ9WQMvjXxFX54Sgf&ipAddress=" + ipResponse.ip,
                dataType: "JSON",
                success: function (geoResponse) {
                    addVisitor({
                        VisitorId: newVisitorId,
                        IpAddress: ipResponse.ip,
                        FolderId: folderId,
                        CalledFrom: "tryIfy/" + calledFrom,
                        City: geoResponse.location.city,
                        Country: geoResponse.location.country,
                        Region: geoResponse.location.region,
                        GeoCode: "00"
                    }, "ipify");
                    logActivity("IF1", folderId, "tryIfy/" + calledFrom); // ipfy lookup success
                },
                error: function (jqXHR) {
                    logActivity("IF2", folderId, "tryIfy/" + calledFrom); // ipfy lookup also failed
                    addNonIpVisitor(folderId, newVisitorId);
                }
            });
        },
        error: function (jqXHR) {
            logActivity("AA8", folderId, "tryIfy/" + calledFrom); // ipfy XHR fail
            addNonIpVisitor(folderId, newVisitorId);
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
        if (visitorId == lastIpHitVisitorId)
            return;
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
    //if (calledFrom == "Album.html") {
    //        logActivity("SP3", folderId, calledFrom); // static page hit no VisitorId

    logActivity("SP0", folderId, calledFrom); // calling static page hit
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + globalVisitorId +
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

        let visitorId = globalVisitorId;
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

function testgetIp() {
    //getIpForExistingVisitorId(1234, create_UUID());
    //getIpForExistingVisitorId(1234, "a950b00f-46d2-45d5-b165-8846bf96130e");
    //getIpForExistingVisitorId(1234, null);
    //getIpInfo(1234, "curtis");
    //addNonIpVisitor(9999, "8b626a77-f854-46bc-aa29-2eda20b5e773");
    tryIfy(9999, "a950b00f-46d2-45d5-b165-8846bf96130e", "testgetIp");

}
