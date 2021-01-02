let freePageHitsAllowed = 500, freeImageHitsAllowed = 2500;

function logImageHit(linkId, folderId, isInitialHit) {
    try {
        if (isNullorUndefined(folderId)) {
            logError("IHF", folderId, "linkId: " + linkId, "logImageHit");
            return;
        }
        let visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            //verifiyVisitor("logImageHit", folderId);
            setTimeout(function () { logError("IHE", folderId, "linkId: " + linkId, "logImageHit") }, 200);
            getIpInfo(folderId, "IHE");            
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
                        if (document.domain == 'localhost') alert(imageHitSuccessModel.Success);
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
    logActivity("LV0", folderId,"logVisit");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
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
                    logActivity("LV3", folderId, "logVisit");  // return visitor
                    // getIpInfo(folderId, "LGV");
                }
                else {
                    logActivity("LV4", folderId, "logVisit");  // Log Visit fail
                    logError("AJX", folderId, logVisitSuccessModel.Success, "logVisit");
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function addNonIpVisitor(folderId, visitorId) {
    logActivity("NV0", folderId, "add NonIp Visitor"); // calling add NonIp Visitor
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
        success: function (successModel) {
            if (successModel.Success == "ok") { //alert("visitorId found");
                logError("EIF", folderId, successModel.Success, "addNonIpVisitor/" + calledFrom);
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
                        let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                        if (!checkFor404(errMsg, folderId, functionName))
                            logError("XHR", folderId, errMsg, functionName);
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

function getIpForExistingVisitorId(folderId, visitorId) {
    try {
        logActivity("EX0", folderId, "gIp4ExistingVisitorId"); // calling ipInfo For Existing VisitorId
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
            success: function (successModel) {
                if (successModel.Success == "not found") {
                    let iPSuccess = false;
                    $.ajax({
                        type: "GET",
                        url: "https://ipinfo.io?token=ac5da086206dc4",
                        success: function (ipResponse) {
                            iPSuccess = true;
                            logActivity("EX1", folderId, "gIp4ExistingVisitorId"); // ipInfo Success For Existing VisitorId
                            tryAddVisitor({
                                CalledFrom: "getIpForExistingVisitorId",
                                VisitorId: visitorId,
                                IpAddress: ipResponse.ip,
                                FolderId: folderId,
                                City: ipResponse.city,
                                Country: ipResponse.country,
                                Region: ipResponse.region,
                                GeoCode: ipResponse.loc
                            }, "exv");
                        },
                        error: function (jqXHR) {
                            logActivity("EX3", folderId, "gIp4ExistingVisitorId"); // ipInfo jqXHR
                            tryIfy(folderId, visitorId, "getIpExistingVisId");
                            // logError("XEX", folderId, jqXHR.status + " " + jqXHR.statusText, "getIpInfo");
                        }
                    });
                    setTimeout(function () {
                        if (!iPSuccess) {
                            logActivity("EX4", folderId, "gIp4ExistingVisitorId"); // ipInfo failed to respond
                            //logError("IPF", folderId, "", "getIpInfo/" + calledFrom);
                            tryIfy(folderId, visitorId, "getIpExistingVisId");
                        }
                    }, 777);
                }
                else {
                    if (successModel.Success == "ok") { //alert("visitorId found");
                        if (getCookieValue("VisitorId") != visitorId) { // Cookie test failed
                            logError("CTF", folderId, getCookieValue("VisitorId") + " != " + visitorId, "gIp4ExistingVisitorId");
                        }
                        if (!navigator.cookieEnabled) {  // user does not accept cookies
                            logError("UNC", folderId, "CTF", "gIp4ExistingVisitorId");
                        }

                        logActivity("EX8", folderId, "gIp4ExistingVisitorId"); // VisitorId found in Visitor table
                        logError("LGV", folderId, avSuccess, "gIp4ExistingVisitorId");
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

function getIpInfo(folderId, calledFrom) {
    try {
        logActivity("AA0", folderId, "getIpInfo/" + calledFrom);

        if (!isNullorUndefined(getCookieValue("VisitorId"))) {
            getIpForExistingVisitorId(folderId, getCookieValue("VisitorId"), calledFrom);
            return;
        }

        let newVisitorId = create_UUID();
        setCookieValue("VisitorId", newVisitorId);

        if (getCookieValue("VisitorId") != newVisitorId) {
            logError("CTF", folderId, getCookieValue("VisitorId") + " != " + newVisitorId, "getIpInfo/" + calledFrom);
            //wipMessage += "<br/>Unable to store a cookie";
            if (!navigator.cookieEnabled) {  // user does not accept cookies
                logError("UNC", folderId, "CTF 1", "getIpInfo/CTF/" + calledFrom);
            }
            else {
                logError("NNK", folderId, "??", "getIpInfo/" + calledFrom);
            }
            return;
        }
        if (!navigator.cookieEnabled) {  // user does not accept cookies
            logError("UNC", folderId, "cookie test passed", "getIpInfo/" + calledFrom);

            //return;
            //wipMessage += "<br/>This site requires cookies enabled";
            //wipMessage += "<br/>You may be asked to login on every page until you leave.";
        }


        try {
            //alert("AA1 IP info call null visitorId")
            logActivity("AA1", folderId, "getIpInfo/" + calledFrom);
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
                        logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + newVisitorId, "getIpInfo/" + calledFrom);
                    }

                    tryAddVisitor({
                        VisitorId: newVisitorId,
                        IpAddress: ipResponse.ip,
                        FolderId: folderId,
                        CalledFrom: "getIpInfo/" + calledFrom,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc
                    }, "ipi");
                },
                error: function (jqXHR) {
                    logActivity("AA3", folderId, "getIpInfo/" + calledFrom);
                    tryIfy(folderId, "getIpInfo/" + calledFrom, newVisitorId);
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

function tryAddVisitor(visitorData, calledFrom) {
    logActivity("AV0", visitorData.FolderId, calledFrom + "/" + visitorData.CalledFrom); // calling AddVisitor 
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/AddVisitor",
        data: visitorData,
        success: function (avSuccess) {
            logActivity("AV1", visitorData.FolderId, visitorData.CalledFrom); // add visit success
            switch (avSuccess) {
                case "ok":
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                    logActivity("AV3", visitorData.FolderId, visitorData.CalledFrom); // new visitor added
                    if (visitorData.CalledFrom.EndsWith("logStatic PageHit"))
                        logStaticPageHit(visitorData.FolderId, "add visitor");
                    break;
                case "existing Ip":
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                    logActivity("AV4", visitorData.FolderId, visitorData.CalledFrom);  // new visitor added with existing IP"
                    if (visitorData.CalledFrom.EndsWith("logStatic PageHit"))
                        logStaticPageHit(visitorData.FolderId, "add visitor");
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

function tryIfy(folderId, newVisitorId, calledFrom) {
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
                    tryAddVisitor({
                        VisitorId: newVisitorId,
                        IpAddress: ipResponse.ip,
                        FolderId: folderId,
                        CalledFrom: "tryIfy/" + calledFrom,
                        City: geoResponse.location.city,
                        Country: geoResponse.location.country,
                        Region: geoResponse.location.region,
                        GeoCode: "00"
                    }, "try");
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

function checkForLooping(folderId, visitorId, calledFrom, errorCode) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/GetErrorDetails?errorCode=" + errorCode + "&visitorId=" + visitorId,
            success: function (errorDetails) {
                if (errorDetails.Success == "ok") {
                    if (errorDetails.Results.length > 0) {
                        //if ((cookieTest == addVisitorSuccess.VisitorId) && (window.localStorage[VisitorId] = cookieTest)) {
                        //let wipTitle = "data tracking error";
                        //let wipMessage = "problem storing your IpAddress";
                        if (getCookieValue("VisitorId") != visitorId) {
                            logError("CTF", folderId, getCookieValue("VisitorId") + " != " + visitorId, "checkForLooping/" + calledFrom);
                            //wipMessage += "<br/>Unable to store a cookie";
                        }
                        if (!navigator.cookieEnabled) {   // user does not accept cookies
                            //wipMessage += "<br/>This site requires cookies enabled";
                            //wipMessage += "<br/>You may be asked to login on every page until you leave.";
                            logError("UNC", folderId, "4", "checkForLooping/" + calledFrom);
                        }
                        //wipMessage += "<br/>you must <a href=''>Register</a> or <a href=''>login</a> to continue";
                        //wipMessage += "<div class='robotWarning'><input type='checkbox'/> I am not a robot.</div>";
                        //showMyAlert(wipTitle, wipMessage);
                        logError("DFV", folderId, errorCode + " Ip calls: " + errorDetails.Results.length, "checkForLooping/" + calledFrom);
                    }
                }
                else
                    logError("AJX", folderId, errorDetails.Success, "checkForLooping/" + calledFrom);
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "checkForLooping/" + calledFrom);
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
                    logActivity("IPH", folderId, "logIpHit");
                else
                    logError("AJX", folderId, success, "logIpHit");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "logIpHit");
    }
}

function logStaticPageHit(folderId, calledFrom) {
    if (calledFrom == "Album.html") {
        if (isNullorUndefined(getCookieValue("VisitorId"))) {
            logActivity("SP3", folderId, calledFrom); // static page hit no VisitorId
            getIpInfo(folderId, "logStatic PageHit");
        }
    }
    else {
        if (isNullorUndefined(getCookieValue("VisitorId"))) {
            logActivity("SP5", folderId, calledFrom); // no VisitorId loop
            logError("SPH", folderId, "looping? getIpInfo failed", "logStatic PageHit");
            return;
        }
        else {
            logActivity("SP4", folderId, calledFrom); // success return to static page hit
        }
    }
    logActivity("SP0", folderId, calledFrom); // calling static page hit
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + getCookieValue("VisitorId") +
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
            logActivity("SP6", folderId, calledFrom); // static page hit XHR error
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
    //logEvent("SDS", folderId, "logStatic PageHit/" + calledFrom, "");
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

function testgetIp() {
    //getIpForExistingVisitorId(1234, create_UUID());
    //getIpForExistingVisitorId(1234, "a950b00f-46d2-45d5-b165-8846bf96130e");
    //getIpForExistingVisitorId(1234, null);
    //getIpInfo(1234, "curtis");
    //addNonIpVisitor(9999, "8b626a77-f854-46bc-aa29-2eda20b5e773");
    tryIfy(9999, "a950b00f-46d2-45d5-b165-8846bf96130e", "testgetIp");

}
