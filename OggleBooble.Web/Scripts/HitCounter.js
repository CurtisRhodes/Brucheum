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
                        if (document.domain == 'localhost') {
                            //alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
                            alert(imageHitSuccessModel.Success);
                        } else
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
                    if (logVisitSuccessModel.IsNewVisitor) {
                        logActivity("NVA", folderId);
                    }
                    else {
                        logActivity("RVR", folderId);  // return visitor
                    }
                }
            }
            else {
                if (logVisitSuccessModel.Success == "VisitorId not found") {
                    // add Visitor
                    setTimeout(function () { logError("LGV", folderId, "calling getIpInfo", "logVisit") }, 100);
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

function getIpInfo(folderId, calledFrom) {
    try {
        let lgvVisitorId;
        if (calledFrom == "LGV")
            if (isNullorUndefined(getCookieValue("VisitorId"))) {
                setCookieValue("VisitorId", create_UUID());
                setTimeout(function () { logError("LG2", folderId, getCookieValue("VisitorId"), "getIpInfo/" + calledFrom) }, 50);
            }
            else {
                lgvVisitorId = getCookieValue("VisitorId");
                setTimeout(function () { logError("LG1", folderId, lgvVisitorId, "getIpInfo/" + calledFrom) }, 50);
            }
        else {
            if (!isNullorUndefined(getCookieValue("VisitorId"))) {
                logError("XIP", folderId, "visitorId: " + getCookieValue("VisitorId"), "getIpInfo/" + calledFrom);
                return;
            }            
            setCookieValue("VisitorId", create_UUID());
        }

        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
            success: function (ipResponse) {
                if (isNullorUndefined(ipResponse.ip)) {
                    logError("BUG", folderId, "ipInfo came back with no ip. VisitorId: " + visitorId, "getIpInfo/" + calledFrom);
                }
                else {
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
                        success: function (addVisitorSuccess) {
                            if (addVisitorSuccess.Success == "ok") {
                                setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                                if (calledFrom == "LGV") {
                                    logError("LG3", folderId, "lgvVisitorId: " + lgvVisitorId, "getIpInfo/" + calledFrom);
                                }
                                if (calledFrom == "IHE") {
                                    logError("IH1", folderId, "lgvVisitorId: " + lgvVisitorId, "getIpInfo/" + calledFrom);
                                }
                                if (addVisitorSuccess.VisitorId == getCookieValue("VisitorId")) {
                                    logEvent("NEW", folderId, "addVisitorSuccess.VisitorId: " + addVisitorSuccess.VisitorId, "getIpInfo/AddVisitor" + calledFrom);
                                    logIpHit(visitorId, ipResponse.ip, folderId);
                                }
                                else {
                                    logError("CTF", folderId, "cookie fail on new visitor", "getIpInfo/AddVisitor" + calledFrom);
                                    //cureWIPproblem(folderId, addVisitorSuccess.VisitorId, "NEW");
                                }
                            }
                            else {
                                if (addVisitorSuccess.Success == "existing Ip") {
                                    if (calledFrom == "LGV") {
                                        setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                                        if (getCookieValue("VisitorId") == addVisitorSuccess.VisitorId)
                                            logError("LG6", folderId, "", "getIpInfo/AddVisitor/" + calledFrom);
                                        else {
                                            logError("LG4", folderId,
                                                getCookieValue(VisitorId) + " addVisitorSuccess.VisitorId: " + addVisitorSuccess.VisitorId + "calling cureWIPproblem()",
                                                "getIpInfo/AddVisitor/" + calledFrom);
                                            checkForLooping(folderId, "getCookieValue(VisitorId): ", "LGV");
                                        }
                                    }
                                    else {
                                        if (calledFrom == "IHE") {
                                            setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                                            if (getCookieValue("VisitorId") == addVisitorSuccess.VisitorId)
                                                logError("IH1", folderId, "", "getIpInfo/AddVisitor/" + calledFrom);
                                            else {
                                                logError("LG4", folderId,
                                                    getCookieValue(VisitorId) + " addVisitorSuccess.VisitorId: " + addVisitorSuccess.VisitorId + "calling cureWIPproblem()",
                                                    "getIpInfo/AddVisitor/" + calledFrom);
                                                checkForLooping(folderId, "getCookieValue(VisitorId): ", "IHE");
                                            }
                                        }
                                        else {
                                            setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                                            if (getCookieValue("VisitorId") == addVisitorSuccess.VisitorId)
                                                logError("WI1", folderId, "", "getIpInfo/AddVisitor/" + calledFrom);
                                            else {
                                                logError("WI2", folderId,
                                                    getCookieValue(VisitorId) + " addVisitorSuccess.VisitorId: " + addVisitorSuccess.VisitorId + "calling cureWIPproblem()",
                                                    "getIpInfo/AddVisitor/" + calledFrom);
                                                checkForLooping(folderId, "getCookieValue(VisitorId): ", "WI2");
                                            }
                                            //logError("WIP", folderId, "non LGV?", "getIpInfo/AddVisitor/" + calledFrom);
                                        }
                                        //cureWIPproblem(folderId, addVisitorSuccess.VisitorId, "WIP");
                                    }
                                }
                                else {
                                    if (calledFrom == "LGV") 
                                        logError("LG5", folderId, addVisitorSuccess.Success, "getIpInfo/AddVisitor/" + calledFrom);
                                    else
                                        logError("AJX", folderId, addVisitorSuccess.Success, "getIpInfo/AddVisitor/" + calledFrom);
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
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    } catch (e) {
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

function checkForLooping(folderId, visitorId, calledFrom) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Common/GetErrorDetails?errorCode=" + calledFrom + "&visitorId=" + visitorId,
        success: function (errorDetails) {
            if (errorDetails.Success == "ok") {
                if (errorDetails.Results.length == 0) {
                    logError("WIP", folderId, "could be one I deleted", "checkForLooping/" + calledFrom);
                }
                else {
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
                    logError("DFV", folderId, calledFrom + " Ip calls: " + errorDetails.Results.Count(), "checkForLooping/" + calledFrom);
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
}

function logIpHit(visitorId, ipAddress, folderId) {
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
                logActivity("IPC", folderId);
            else
                logError("AJX", folderId, success, "logIpHit");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
        }
    });
}

function logStaticPageHit(folderId) {
    if (isNullorUndefined(getCookieValue("VisitorId"))) {
        getIpInfo(folderId, "logStatic PageHit");
        //logError("SPH", folderId, "visitorId: " + getCookieValue("VisitorId"), "logStatic PageHit");
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStatic PageHit?visitorId=" + getCookieValue("VisitorId") +
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
