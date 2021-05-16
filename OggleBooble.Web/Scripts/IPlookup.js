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
                //    if (localStorage["VisitorId"].length == 36) {
                //        logError("IP2", folderId, "visitorId: " + localStorage["VisitorId"]);
                //        verifyVisitorId(folderId, calledFrom);
                //    }
            }

            // logActivity("IP1", folderId, "getIpInfo/" + calledFrom);
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
                    }
                    else {
                        logActivity("IP2", folderId, "getIpInfo/" + calledFrom)
                        addVisitor(
                            {
                                IpAddress: ipResponse.ip,
                                City: ipResponse.city,
                                Country: ipResponse.country,
                                Region: ipResponse.region,
                                GeoCode: ipResponse.loc,
                                FolderId: folderId,
                                CalledFrom: "getIpInfo/" + calledFrom
                            }
                        );
                    }
                },
                error: function (jqXHR) {
                    ipInfoExited = true;
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        //Uncaught Error. { "status": 429, "error": { "title": "Rate limit exceeded", "message": 
                        //"Upgrade to increase your usage limits at https ://ipinfo.io/pricing, or contact us via https ://ipinfo.io/contact"}

                        if (calledFrom == "verify visitor") {
                            if (document.domain == "localhost") alert("calling getIpInfo from log visit");
                            getIpInfo(folderId, "verify visitor");
                            logActivity("IP5", folderId, calledFrom + "/getIpInfo");
                            tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo5");
                        }
                        else
                            logActivity("IP5", folderId, calledFrom + "/getIpInfo");


                        "verify visitor"
                        tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo5");
                    }
                    else {
                        //if (!checkFor404(errMsg, visitorData.FolderId, "getIpInfo/" + calledFrom)) {
                        logActivity("IP3", folderId, "getIpInfo/" + calledFrom); // XHR error
                        logError("XHR", visitorData.FolderId, errMsg, "try AddVisitor");
                        tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo3");
                    }
                }
            });
            setTimeout(function () {
                if (!ipInfoExited) {
                    logActivity("IP4", folderId, "getIpInfo/" + calledFrom); // ipInfo failed to respond
                    //logError("IP6", folderId, "", "getIpInfo/" + calledFrom);
                    tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo43");
                }
            }, 855);
        }, 889);
    } catch (e) {
        ipInfoExited = true;
        logError("CAT", folderId, e, "getIpInfo/" + calledFrom);
    }
}

function tryAlt_IpLookup(folderId, calledFrom) {
    try {
        //url: "http ://api.ipstack.com/2603:8080:a703:4e4d:8eb:74a:df9b:8b7a?access_key=6ce14ea4abcc6bc7023cfd74c5fc29a4",
        logActivity("IF0", folderId, "altIpLookup/" + calledFrom); // attempting ipfy lookup
        $.ajax({
            type: "GET",
            url: "https://api.db-ip.com/v2/free/self",
            dataType: "JSON",
            success: function (ipResponse) {
                if (!isNullorUndefined(ipResponse.ipAddress)) {
                    logActivity("IF1", folderId, "api.db-ip.com/v2/free/self/" + calledFrom); // ipfy lookup success
                    console.log("api.db-ip.com success");
                    addVisitor(
                        {
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.continentName,
                            GeoCode: "00",
                            FolderId: folderId,
                            CalledFrom: "altIpLookup/" + calledFrom
                        }
                    );
                }
                else {
                    logActivity("IF2", folderId, "altIpLookup/" + calledFrom); // ipfy lookup also failed
                    addBadVisitor(folderId, "altIpLookup/" + calledFrom);
                }
            },
            error: function (jqXHR) {
                logActivity("IF3", folderId, "altIpLookup/" + calledFrom); // ipfy XHR fail
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "logStaticPageHit")) {
                    logError("XHR", folderId, errMsg, "altIpLookup/" + calledFrom);
                    addBadVisitor(folderId, "altIpLookupXHR/" + calledFrom);
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "altIpLookup");
        logActivity("IF4", 444, "altIpLookup");
        addBadVisitor(folderId, "altIpLookupCAT/" + calledFrom);
    }
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
            //if (!checkFor404(errMsg, folderId, "logStaticPageHit"))
            logError("XHR", folderId, errMsg, "logStaticPageHit");
        }
    });
    //logEvent("SDS", folderId, "logStatic PageHit/" + calledFrom, "");
}
