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
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);
                    //if (logVisitSuccessModel.IsNewVisitor) {
                    //    logActivity("NVA", folderId);
                    //}
                    //else {
                    //    logActivity("RVR", folderId);  // return visitor
                    //}
                }
            }
            else {
                if (logVisitSuccessModel.Success == "VisitorId not found") {
                    // add Visitor
                    //setTimeout(function () { logError("LGV", folderId, "calling getIpInfo", "logVisit") }, 100);
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

function getIpForExistingVisitorId(folderId) {
    try {
        logActivity("EX0", folderId);
        logEvent("EIP", folderId, "getIpInfo", getCookieValue("VisitorId"))
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/GetVisitor?visitorId=" + getCookieValue("VisitorId"),
            success: function (successModel) {
                if (successModel.Success == "not found") {
                    logEvent("EIQ", folderId, "getIpInfo", successModel.Success)
                    logActivity("EX1", folderId);
                    try {
                        $.ajax({
                            type: "GET",
                            url: "https://ipinfo.io?token=ac5da086206dc4",
                            success: function (ipResponse) {
                                logActivity("EX2", folderId);
                                $.ajax({
                                    type: "POST",
                                    url: settingsArray.ApiServer + "api/Common/AddVisitor",
                                    data: {
                                        VisitorId: getCookieValue("VisitorId"),
                                        IpAddress: ipResponse.ip,
                                        FolderId: folderId,
                                        CalledFrom: calledFrom,
                                        City: ipResponse.city,
                                        Country: ipResponse.country,
                                        Region: ipResponse.region,
                                        GeoCode: ipResponse.loc
                                    },
                                    success: function (avSuccess) {
                                        //logActivity("AVS", folderId);
                                        switch (avSuccess) {
                                            case "ok":
                                                logIpHit(newVisitorId, ipResponse.ip, folderId);
                                                logActivity("EX4", folderId);
                                                break;
                                            case "existing Ip":
                                                logIpHit(newVisitorId, ipResponse.ip, folderId);
                                                logActivity("EX5", folderId);
                                                break;
                                            default:
                                                logActivity("EX6", folderId);
                                                logError("AJX", folderId, avSuccess, "getIpForExistingVisitorId");
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
                                let errMsg = getXHRErrorDetails(jqXHR);
                                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                            }
                        });

                        //$.get("https://ipinfo.io?token=ac5da086206dc4", function (ipResponse) {
                        //}, "jsonp",
                        //    function (jqXHR) {
                        //        logActivity("EX3", folderId);
                        //        logError("XHR", folderId, getXHRErrorDetails(jqXHR), "ipInfo");
                        //    }
                        //);
                    } catch (e) {
                        logActivity("CCC", folderId);
                        logError("CAT", folderId, e, "AgetIpInfo/" + calledFrom);
                    }
                }
                else {
                    if (successModel.Success == "ok") {
                        logActivity("EX8", folderId);
                        logError("LGV", folderId, successModel.Success, "getIpForExistingVisitorId");
                    }
                    else {
                        logActivity("EX9", folderId);
                        logError("EIF", folderId, successModel.Success, "getIpForExistingVisitorId");
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
        logError("CAT", folderId, e, "getIpForExistingVisitorId");
    }
}

function getIpInfo(folderId, calledFrom) {
    try {

        if (!isNullorUndefined(getCookieValue("VisitorId"))) {
            getIpForExistingVisitorId(folderId);
            return;
        }

        let newVisitorId = create_UUID();
        setCookieValue("VisitorId", newVisitorId);

        if (getCookieValue("VisitorId") != newVisitorId) {
            logError("CTF", folderId, getCookieValue("VisitorId") + " != " + newVisitorId, "getIpInfo/" + calledFrom);
            //wipMessage += "<br/>Unable to store a cookie";
            if (!navigator.cookieEnabled) {
                logError("UNC", folderId, "??", "getIpInfo/" + calledFrom);
            }
            else {
                logError("NNK", folderId, "??", "getIpInfo/" + calledFrom);
            }
            return;
        }

        if (!navigator.cookieEnabled) {
            logError("UNC", folderId, "??", "getIpInfo/" + calledFrom);
            return;
            //wipMessage += "<br/>This site requires cookies enabled";
            //wipMessage += "<br/>You may be asked to login on every page until you leave.";
        }

        try {
            logActivity("AA1", folderId);
            $.ajax({
                type: "GET",
                url: "https://ipinfo.io?token=ac5da086206dc4",
                dataType: "JSON",
                //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                success: function (ipResponse) {
                    logActivity("AA2", folderId);
                    if (isNullorUndefined(ipResponse.ip)) {
                        logActivity("AA3", folderId);
                        logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + visitorId, "getIpInfo/" + calledFrom);
                    }
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
                            switch (avSuccess) {
                                case "ok":
                                    logIpHit(newVisitorId, ipResponse.ip, folderId);
                                    logActivity("AA6", folderId);
                                    break;
                                case "existing Ip":
                                    logIpHit(newVisitorId, ipResponse.ip, folderId);
                                    logActivity("AA5", folderId);
                                    break;
                                default:
                                    logActivity("AA7", folderId);
                                    logError("AJX", folderId, avSuccess, "getIpInfo/AddVisitor/" + calledFrom);
                            }
                        },
                        error: function (jqXHR) {
                            logActivity("AA8", folderId);
                            let errMsg = getXHRErrorDetails(jqXHR);
                            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                        }
                    });
                },
                error: function (jqXHR) {
                    logActivity("AVF", folderId);
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                }
            });
            //$.get("https://ipinfo.io?token=ac5da086206dc4", function (ipResponse) {
            //}, "jsonp")
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

//    $.ajax({
//    type: "GET",
//    url: "https://ipinfo.io?token=ac5da086206dc4",
//    dataType: "JSON",
//    //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
//    success: function (ipResponse) {
//        if (isNullorUndefined(ipResponse.ip)) {
//            logActivity("YYY", folderId);
//            logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + visitorId, "getIpInfo/" + calledFrom);
//        }
//        else {
//            logActivity("BBB", folderId);
//            $.ajax({
//                type: "POST",
//                url: settingsArray.ApiServer + "api/Common/AddVisitor",
//                data: {
//                    VisitorId: getCookieValue("VisitorId"),
//                    IpAddress: ipResponse.ip,
//                    FolderId: folderId,
//                    CalledFrom: calledFrom,
//                    City: ipResponse.city,
//                    Country: ipResponse.country,
//                    Region: ipResponse.region,
//                    GeoCode: ipResponse.loc
//                },
//                success: function (avSuccess) {
//                    logActivity("AVS", folderId);
//                    switch (avSuccess) {
//                        case "ok":
//                            logActivity("NEW", folderId);
//                            logIpHit(visitorId, ipResponse.ip, folderId);
//                            break;
//                        case "existing Ip":
//                            if (getCookieValue("VisitorId") != newVisitorId) {
//                                if (navigator.cookieEnabled) {
//                                    logError("WI2", folderId, getCookieValue("VisitorId") + " != " + visitorId, "checkForLooping/" + calledFrom);
//                                    //wipMessage += "<br/>Unable to store a cookie";
//                                }
//                                else {
//                                    //wipMessage += "<br/>This site requires cookies enabled";
//                                    //wipMessage += "<br/>You may be asked to login on every page until you leave.";
//                                    logError("UNC", folderId, "??", "getIpInfo/" + calledFrom);
//                                }
//                            }
//                            else {
//                                logActivity("NWI", folderId);
//                                logIpHit(visitorId, ipResponse.ip, folderId);
//                                //logError("WI1", folderId, calledFrom, "getIpInfo/AddVisitor");
//                            }
//                            break;
//                        case "nan":
//                            logActivity("NAX", folderId);
//                            //logIpHit(visitorId, ipResponse.ip, folderId);
//                            break;
//                        default:
//                            logActivity("DDD", folderId);
//                            logError("AJX", folderId, avSuccess, "getIpInfo/AddVisitor/" + calledFrom);
//                    }
//                },
//                error: function (jqXHR) {
//                    logActivity("AVF", folderId);
//                    let errMsg = getXHRErrorDetails(jqXHR);
//                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
//                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
//                }
//            });
//        }
//    },
//    error: function (jqXHR) {
//        logActivity("CCC", folderId);
//        let errMsg = getXHRErrorDetails(jqXHR);
//        let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
//        if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
//    }
//});
