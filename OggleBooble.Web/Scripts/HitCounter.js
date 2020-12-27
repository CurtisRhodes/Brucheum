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
    logActivity("LV0", folderId);
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);
                    if (logVisitSuccessModel.IsNewVisitor) {
                        logActivity("LV1", folderId);
                    }
                    else {
                        logActivity("LV2", folderId);  // return visitor
                    }
                }
            }
            else {
                if (logVisitSuccessModel.Success == "VisitorId not found") {
                    // add Visitor
                    //setTimeout(function () { logError("LGV", folderId, "calling getIpInfo", "logVisit") }, 100);
                    logActivity("LV3", folderId);  // return visitor
                    getIpInfo(folderId, "LGV");
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

function testgetIp() {
    //getIpForExistingVisitorId(1234, create_UUID());
    //getIpForExistingVisitorId(1234, "a950b00f-46d2-45d5-b165-8846bf96130e");
    //getIpForExistingVisitorId(1234, null);
    //getIpInfo(1234, "curtis");

    addNonIpVisitor(9999, "8b626a77-f854-46bc-aa29-2eda20b5e773");

}

function addNonIpVisitor(folderId, visitorId) {
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
                logActivity("NVP", folderId);
            else
                logError("AJX", folderId, "avSuccess: " + avSuccess," addNonIpVisitor");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}


function getIpForExistingVisitorId(folderId, visitorId, calledFrom) {
    try {
        logActivity("EX0", folderId);
        logEvent("EIP", folderId, "getIpInfo", visitorId);
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + visitorId,
            success: function (successModel) {
                logEvent("EIQ", folderId, "getIpInfo/" + calledFrom, successModel.Success)
                if (successModel.Success == "not found") {
                    //alert("Get IpInfo");
                    //logActivity("EX1", folderId);
                    try {
                        $.ajax({
                            type: "GET",
                            url: "https://ipinfo.io?token=ac5da086206dc4",
                            success: function (ipResponse) {
                                logActivity("EX2", folderId);
                                //alert("Add Visitor");
                                $.ajax({
                                    type: "POST",
                                    url: settingsArray.ApiServer + "api/Common/AddVisitor",
                                    data: {
                                        VisitorId: visitorId,
                                        IpAddress: ipResponse.ip,
                                        FolderId: folderId,
                                        City: ipResponse.city,
                                        Country: ipResponse.country,
                                        Region: ipResponse.region,
                                        GeoCode: ipResponse.loc
                                    },
                                    success: function (avSuccess) {
                                        // add visitor Success //logActivity("AVS", folderId);
                                        switch (avSuccess) {
                                            case "ok":
                                                logIpHit(visitorId, ipResponse.ip, folderId);
                                                logActivity("EX4", folderId);
                                                break;
                                            case "existing Ip":
                                                logIpHit(visitorId, ipResponse.ip, folderId);
                                                logActivity("EX5", folderId);
                                                break;
                                            default:
                                                if (avSuccess.indexOf("Duplicate entry") > 0) {
                                                    let cookieEnabled = true;
                                                    if (!navigator.cookieEnabled) {
                                                        cookieEnabled = false;
                                                        logError("UNC", folderId, "cookieEnabled: " + cookieEnabled, "get Ip for Existing VisitorId/" + calledFrom);
                                                    }
                                                    logError("DVI", folderId, avSuccess, "get Ip for Existing VisitorId");
                                                }
                                                else
                                                    logActivity("EX6", folderId);
                                        }
                                    },
                                    error: function (jqXHR) {
                                        logActivity("EX7", folderId);
                                        let errMsg = getXHRErrorDetails(jqXHR);
                                        let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                                        if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                                    }
                                });
                            },
                            error: function (jqXHR) {
                                logActivity("EX3", folderId);
                                // add visitor with unknown ip
                                addNonIpVisitor(folderId, visitorId);
                                // logError("XEX", folderId, jqXHR.status + " " + jqXHR.statusText, "getIpInfo");
                            }
                        });
                    } catch (e) {
                        logActivity("CCC", folderId);
                        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
                    }
                }
                else {
                    if (successModel.Success == "ok") {
                        //alert("visitorId found");
                        let cookieEnabled = true;
                        if (!navigator.cookieEnabled) {
                            cookieEnabled = false;
                            logError("UNC", folderId, "CTF", "getIpInfo/" + calledFrom);
                        }
                        logActivity("EX8", folderId);
                        logError("LGV", folderId, "visitorId found. cookieEnabled: " + cookieEnabled, "getIpExistingVis/getIpInfo/" + calledFrom);
                    }
                    else {
                        logActivity("EX9", folderId);
                        logError("EIF", folderId, successModel.Success, "getIpExistingVis/getIpInfo/" + calledFrom);
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
        logError("CAT", folderId, e, "getIpExistingVis/getIpInfo/" + calledFrom);
    }
}

function getIpInfo(folderId, calledFrom) {
    try {

        if (!isNullorUndefined(getCookieValue("VisitorId"))) {
            getIpForExistingVisitorId(folderId, getCookieValue("VisitorId"), calledFrom);
            return;
        }

        let newVisitorId = create_UUID();
        setCookieValue("VisitorId", newVisitorId);

        if (getCookieValue("VisitorId") != newVisitorId) {
            logError("CTF", folderId, getCookieValue("VisitorId") + " != " + newVisitorId, "getIpInfo/" + calledFrom);
            //wipMessage += "<br/>Unable to store a cookie";
            if (!navigator.cookieEnabled) {
                logError("UNC", folderId, "CTF", "getIpInfo/" + calledFrom);
            }
            else {
                logError("NNK", folderId, "??", "getIpInfo/" + calledFrom);
            }
            return;
        }

        if (!navigator.cookieEnabled) {
            logError("UNC", folderId, "cookie test passed", "getIpInfo/" + calledFrom);
            return;
            //wipMessage += "<br/>This site requires cookies enabled";
            //wipMessage += "<br/>You may be asked to login on every page until you leave.";
        }

        try {
            //alert("AA1 IP info call null visitorId")
            logActivity("AA1", folderId);
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io?token=ac5da086206dc4",
                dataType: "JSON",
                //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                success: function (ipResponse) {
                    logActivity("AA2", folderId);
                    //alert("AA2 IP info call success");
                    if (isNullorUndefined(ipResponse.ip)) {
                        //logActivity("AA3", folderId);
                        logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + visitorId, "getIpInfo/" + calledFrom);
                    }
                    // Add Visitor
                    $.ajax({
                        type: "POST",
                        url: settingsArray.ApiServer + "api/Common/AddVisitor",
                        data: {
                            VisitorId: newVisitorId,
                            IpAddress: ipResponse.ip,
                            FolderId: folderId,
                            CalledFrom: calledFrom,
                            City: ipResponse.city,
                            Country: ipResponse.country,
                            Region: ipResponse.region,
                            GeoCode: ipResponse.loc
                        },
                        success: function (avSuccess) {
                            //logActivity("AA4", folderId);
                            //alert("AA4 Add Visitor ajax call came back  avSuccess:" + avSuccess);
                            switch (avSuccess) {
                                case "ok":
                                    logIpHit(newVisitorId, ipResponse.ip, folderId);
                                    logActivity("AA5", folderId);
                                    //alert("AA5 new visitor added");
                                    break;
                                case "existing Ip":
                                    logIpHit(newVisitorId, ipResponse.ip, folderId);
                                    logActivity("AA6", folderId);
                                    //alert("AA6 new visitor added with existing IP");
                                    break;
                                default:
                                    if (avSuccess.indexOf("Duplicate entry") > 0) {
                                        let cookieEnabled = true;
                                        if (!navigator.cookieEnabled) {
                                            cookieEnabled = false;
                                            logError("UNC", folderId, "cookieEnabled: " + cookieEnabled, "get Ip for Existing VisitorId/" + calledFrom);
                                        }
                                        logError("DVA", folderId, avSuccess, "get Ip for Existing VisitorId");
                                    }
                                    else {
                                        //alert("AA7 unknown success code from Add Visitor");
                                        logActivity("AA7", folderId);
                                        logError("AJ7", folderId, avSuccess, "getIpInfo/AddVisitor/" + calledFrom);
                                    }
                            }
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                        }
                    });
                },
                error: function (jqXHR) {
                    logActivity("AA3", folderId);
                    addNonIpVisitor(folderId, newVisitorId);
                    //logError("XAA", folderId, jqXHR.status + " " + errorThrown + " / " + statusText, "getIpInfo");
                    //logError("XAA", folderId, jqXHR.status + " " + jqXHR.errorThrown + " / " + jqXHR.statusText, "getIpInfo");
                }
            });
        } catch (e) {
            logActivity("CCC", folderId);
            logError("CAT", folderId, e, "AgetIpInfo/" + calledFrom);
        }
    }
    catch (e) {
        logActivity("CCC", folderId);
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
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
                        if (!navigator.cookieEnabled) {
                            //wipMessage += "<br/>This site requires cookies enabled";
                            //wipMessage += "<br/>You may be asked to login on every page until you leave.";
                            logError("UNC", folderId, "??", "checkForLooping/" + calledFrom);
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
                    logActivity("IPH", folderId);
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

function logStaticPageHit(folderId) {
    if (isNullorUndefined(getCookieValue("VisitorId"))) {
        getIpInfo(folderId, "logStatic PageHit");
        //logError("SPH", folderId, "visitorId: " + getCookieValue("VisitorId"), "logStatic PageHit");
    }


    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + getCookieValue("VisitorId") +
            "&folderId=" + folderId + "&calledFrom=duh",
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
