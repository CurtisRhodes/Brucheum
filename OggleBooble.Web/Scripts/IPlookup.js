
function tryAddNewIP(folderId, visitorId, calledFrom) {
    try {
        //let visitorId = getCookieValue("VisitorId");
        if (visitorId.indexOf("cookie not found") > -1) {
            visitorId = create_UUID();
            logError2(visitorId, "BUG", "cookie not found made it to tryAddNewIP", calledFrom);
        }
        if (visitorId == "user does not accept cookies") {
            visitorId = create_UUID();
            logError2(visitorId, "BUG", "user does not accept cookies made it to tryAddNewIP", calledFrom);
        }
        if (isNullorUndefined(visitorId)) {
            logActivity("IPX", folderId, "tryAddNewIP/" + calledFrom);
        }
        else {
            logActivity2(visitorId, "IP0", folderId, "tryAddNewIP/" + calledFrom);
            getIpInfo(folderId, visitorId, calledFrom);
        }
        // 1 geoplugin(folderId, calledFrom);
        // 2 tryApiDbIpFree(folderId, calledFrom);
        // 3 ipapico(folderId, calledFrom);
    } catch (e) {
        logError2(create_UUID, "CAT", "666", e, "tryAddNewIP");
    }
}

let ip0Busy = false;
function getIpInfo(folderId, visitorId, calledFrom) {
    try {
        if (ip0Busy) {
            console.log("getIpInfo busy");
            logActivity2(visitorId, "IP8", folderId, "get IpInfo/" + calledFrom);
            tryApiDbIpFree(folderId, visitorId, calledFrom);
            return;
        }
        if (visitorId.indexOf("XLX") > -1) {
            logActivity2(visitorId, "IP9", folderId, calledFrom); // blocked looping ip-lookup attempt
            return;
        }

        let ipCall0Returned = false;
        ip0Busy = true;
        logActivity2(visitorId, "IP1", folderId, "get IpInfo/" + calledFrom); // calling ip-lookup api
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            statusCode: {
                429: function () {
                    logActivity2(visitorId, "IP5", folderId, "get IpInfo/" + calledFrom); // lookup limit exceeded
                    ipCall0Returned = true;
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                }
            },
            success: function (ipResponse) {
                ipCall0Returned = true;
                //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "IpInfo/" + calledFrom); // Json response code
                logActivity2(visitorId, "IP2", folderId, "get IpInfo/" + calledFrom); // well it worked
                $.ajax({
                    type: "PUT",
                    url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
                    data: {
                        VisitorId: visitorId,
                        IpAddress: ipResponse.ip,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc
                    },
                    success: function (success) {
                        if (success == "ok") {
                            logActivity2(visitorId, "IPA", folderId, "update Visitor"); // visitor successfully updated
                            logVisit(visitorId, folderId, "add Visitor");
                        }
                        else {
                            if (success == "VisitorId not found") {
                                logActivity2(visitorId, "IPB", folderId, "update Visitor"); // update failed. VisitorId not found
                            } else {
                                logActivity2(visitorId, "IPC", folderId, success); // update failed. ajax error
                                logError2(visitorId, "AJX", folderId, success, "update Visitor");
                            }
                        }
                    },
                    error: function (jqXHR) {
                        logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errMsg, 555, "add Visitor"))
                            logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
                    }
                });
                ip0Busy = false;
            },
            error: function (jqXHR) {
                ipCall0Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(visitorId, "IP6", folderId, "XHR:" + errMsg);
                if (errMsg.indexOf("Not connect.") == -1) {
                    logError2(visitorId, "XIP", folderId, errMsg, "get IpInfo/" + calledFrom);
                    tryApiDbIpFree(folderId, visitorId, calledFrom); // try something else
                }

                if (!isNullorUndefined(ipResponse))
                    logError2(visitorId, "200", folderId, JSON.stringify(ipResponse, null, 2), "IpInfo/" + calledFrom); // Json response code

                if (errMsg.indexOf("Rate limit exceeded") > 0) {
                    logActivity2(visitorId, "IP5", folderId, "IpInfo XHR/" + calledFrom); // lookup limit exceeded
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                }
                else {
                    if (!checkFor404(errMsg, folderId, "get IpInfo")) {
                        logError2(visitorId, "XHR", folderId, errMsg, "get IpInfo/" + calledFrom);
                    }
                    else {
                        let XLXvisitorId = "XLX" + visitorId.substr(3);
                        setCookieValue("VisitorId", XLXvisitorId);
                        if (getCookieValue("VisitorId") == XLXvisitorId)
                            logActivity("IP3", folderId, "get IpInfo " + errMsg); // XHR error
                        else
                            logActivity2(visitorId, "IP7", folderId, "get IpInfo"); // juneteenth setCookie problem
                    }
                }
                ip0Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall0Returned) {
                if (isNullorUndefined(ipResponse.ip)) {
                    logActivity2(create_UUID(), "IP9", 621237, "folderId: " + folderId + " visitorId: " + visitorId); // ipInfo failed to respond
                    logActivity2(create_UUID(), "IP4", 621328, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                    tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
                }
                else {
                    logActivity2(create_UUID(), "IP7", 621239, "timeout but info"); // timeout but info
                    //logActivity2(visitorId, "IP2", folderId, "timeout"); // well it worked
                    $.ajax({
                        type: "PUT",
                        url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
                        data: {
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ip,
                            City: ipResponse.city,
                            Country: ipResponse.country,
                            Region: ipResponse.region,
                            GeoCode: ipResponse.loc
                        },
                        success: function (success) {
                            if (success == "ok") {
                                logActivity2(visitorId, "IPA", folderId, "timeout"); // visitor successfully updated
                                logVisit(visitorId, folderId, "add Visitor");
                            }
                            else {
                                if (success == "VisitorId not found") {
                                    logActivity2(visitorId, "IPB", folderId, "timeout"); // update failed. VisitorId not found
                                } else {
                                    logActivity2(visitorId, "IPC", folderId, success); // update failed. ajax error
                                    logError2(visitorId, "AJX", folderId, success, "timeout");
                                }
                            }
                        },
                        error: function (jqXHR) {
                            logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
                            let errMsg = getXHRErrorDetails(jqXHR);
                            if (!checkFor404(errMsg, 555, "add Visitor"))
                                logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
                        }
                    });

                    logError2(create_UUID(), "200", folderId, JSON.stringify(ipResponse, null, 2), "ip info timeout"); // Json response code
                }
            }
            ip0Busy = false;
        }, 1855);
    }
    catch (e)
    {
        logActivity2(create_UUID(), "IPK", 621240, "get IpInfo"); // IP catch error
        logError2(create_UUID(), "CAT", 621241, e, "get IpInfo");
        ip0Busy = false;
    }
} // 0 ipinfo.io?token=ac5da086206dc4

let ip2Busy = false;
function tryApiDbIpFree(folderId, visitorId, calledFrom) {
    try {
        if (ip2Busy) {
            console.debug("tryApiDbIpFree busy");
            logActivity2(visitorId, "IP8", folderId, "apiDbIpFree");
            tryCloudflareTrace(folderId, visitorId, calledFrom);
        }
        else {
            //logActivity2(visitorId, "IP1", folderId, "apiDbIpFree");
            ip2Busy = true;
            let ipCall2Returned = false;
            $.ajax({
                type: "GET",
                url: "https://api.db-ip.com/v2/free/self",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall2Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {
                        logActivity2(visitorId, "IP2", folderId, "apiDbIpFree/" + calledFrom); // well it worked
                        $.ajax({
                            type: "PUT",
                            url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
                            data: {
                                VisitorId: visitorId,
                                IpAddress: ipResponse.ipAddress,
                                City: ipResponse.city,
                                Country: ipResponse.countryCode,
                                Region: ipResponse.stateProv,
                                GeoCode: "apiDbIpFree"
                            },
                            success: function (success) {
                                if (success == "ok") {
                                    logActivity2(visitorId, "IPA", folderId, "update Visitor"); // visitor successfully updated
                                    logVisit(visitorId, folderId, "add Visitor");
                                }
                                else {
                                    if (success == "VisitorId not found") {
                                        logActivity2(visitorId, "IPB", folderId, "update Visitor"); // update failed. VisitorId not found
                                    } else {
                                        logActivity2(visitorId, "IPC", folderId, success); // update failed. ajax error
                                        logError2(visitorId, "AJX", folderId, success, "update Visitor");
                                    }
                                }
                            },
                            error: function (jqXHR) {
                                logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
                                let errMsg = getXHRErrorDetails(jqXHR);
                                if (!checkFor404(errMsg, 555, "add Visitor"))
                                    logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
                            }
                        });
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {
                            console.debug("tryApiDbIpFree OVER_QUERY_LIMIT");
                            logActivity2(visitorId,"IP5", folderId, "apiDbIpFree/" + calledFrom); // lookup limit exceeded
                            tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                        }
                        else {
                            console.debug("tryApiDbIpFree 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "apiDbIpFree/" + calledFrom); // Json response code
                            logActivity2(visitorId, "IP9", folderId, "apiDbIpFree/" + calledFrom);
                        }
                    }
                    ip2Busy = false;
                },
                error: function (jqXHR) {
                    ipCall2Returned = true;
                    console.debug("tryApiDbIpFree XHR");
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity2(visitorId, "IP5", folderId, "apiDbIpFree XHR");  // lookup limit exceeded
                        tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "apiDbIpFree")) {
                            logError2(visitorId, "XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            logActivity2(visitorId, "IP6", folderId, "apiDbIpFree");
                        }
                        else {
                            logActivity2(visitorId, "IP3", folderId, "apiDbIpFree");
                            tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                        }
                    }
                    ip2Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall2Returned) {
                    console.debug("tryApiDbIpFree timeout");
                    logActivity2(visitorId, "IPG", folderId, "apiDbIpFree");
                    tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                }
                ip2Busy = false;
            }, 2000);
        }
    } catch (e) {
        ip2Busy = false;
        logError2(visitorId, "CAT", folderId, e, "apiDbIpFree");
        logActivity2(visitorId, "IP7", folderId, "apiDbIpFree");
    }
} // 2 api.db-ip.com/v2/free/self

let ip3Busy = false;
function tryCloudflareTrace(folderId, visitorId, calledFrom) {
    try {
        if (ip3Busy) {
            console.debug("CloudflareTrace busy");
            logActivity2(visitorId, "IP8", folderId, "CloudflareTrace");
            addBadIpVisitorId(folderId, visitorId, calledFrom);
        }
        else {
            ip3Busy = true;
            let ipCall3Returned = false;
            //logActivity2(visitorId, "IP1", folderId, "CloudflareTrace/" + calledFrom); // attempting CloudflareTrace lookup
            $.ajax({
                type: "GET",
                url: "https://www.cloudflare.com/cdn-cgi/trace",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall3Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {
                        logActivity2(visitorId, "IP2", folderId, "cloudflare/" + calledFrom); // well it worked
                        $.ajax({
                            type: "PUT",
                            url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
                            data: {
                                VisitorId: visitorId,
                                IpAddress: ipResponse.ipAddress,
                                City: ipResponse.city,
                                Country: ipResponse.countryCode,
                                Region: ipResponse.stateProv,
                                GeoCode: "cloudflare"
                            },
                            success: function (success) {
                                if (success == "ok") {
                                    logActivity2(visitorId, "IPA", folderId, "update Visitor"); // visitor successfully updated
                                    logVisit(visitorId, folderId, "add Visitor");
                                }
                                else {
                                    if (success == "VisitorId not found") {
                                        logActivity2(visitorId, "IPB", folderId, "update Visitor"); // update failed. VisitorId not found
                                    } else {
                                        logActivity2(visitorId, "IPC", folderId, success); // update failed. ajax error
                                        logError2(visitorId, "AJX", folderId, success, "update Visitor");
                                    }
                                }
                            },
                            error: function (jqXHR) {
                                logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
                                let errMsg = getXHRErrorDetails(jqXHR);
                                if (!checkFor404(errMsg, 555, "add Visitor"))
                                    logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
                            }
                        });

                        //fl = 15f393
                        //h = www.cloudflare.com

                        //ip = 2603: 8080: a703: 4e4d: 21a3: c672: f581: 5168


                        //ts = 1622811185.625
                        //visit_scheme = https
                        //uag = Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 91.0.4472.77 Safari / 537.36
                        //colo = DFW
                        //http = http / 2
                        //loc = US
                        //tls = TLSv1.3
                        //sni = plaintext
                        //warp = off
                        //gateway = off

                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {
                            console.debug("tryApiDbIpFree OVER_QUERY_LIMIT");
                            logActivity2(visitorId, "IP5", folderId, "CloudflareTrace/" + calledFrom); // lookup limit exceeded
                            //addBadIpVisitorId(folderId, visitorId, calledFrom);
                        }
                        else {
                            //console.debug("tryCloudflareTrace 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "tryCloudflareTrace/" + calledFrom); // Json response code
                            logActivity2(visitorId, "IP9", folderId, "CloudflareTrace/" + calledFrom);
                            //addBadIpVisitorId(folderId, visitorId, calledFrom);
                        }
                    }
                    ip3Busy = false;
                },
                error: function (jqXHR) {
                    ipCall3Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);

                    if (errMsg.indexOf("Uncaught Error") > -1) {

                        let visitorInfo = {
                            VisitorId: visitorId,
                            City: "Cloudflare",
                            InitialPage: folderId,
                            CalledFrom: "cloudflare/" + calledFrom
                        };

                        let item, itemName, itemValue;
                        for (var i = 0; i < errMsg.length; i++) {
                            item = cookieElements2[i].split("\n");
                            itemName = cookieItem[0].trim();
                            itemValue = cookieItem[1];
                            if (itemName === "ip") {
                                visitorInfo.IpAddress = itemValue;
                            }
                            if (itemName === "ts") {
                                visitorInfo.GeoCode = itemValue;
                            }
                            if (itemName === "loc") {
                                visitorInfo.Country = itemValue;
                            }
                        }
                        logActivity2(visitorId, "IP2", folderId, "CloudflareTrace/" + calledFrom);
                        $.ajax({
                            type: "PUT",
                            url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
                            data: {
                                VisitorId: visitorId,
                                IpAddress: visitorInfo.IpAddress,
                                City: "CloudflareTrace",
                                Country: visitorInfo.Country,
                                Region: "CloudflareTrace",
                                GeoCode: visitorInfo.GeoCode
                            },
                            success: function (success) {
                                if (success == "ok") {
                                    logActivity2(visitorId, "IPA", folderId, "update Visitor"); // visitor successfully updated
                                    logVisit(visitorId, folderId, "add Visitor");
                                }
                                else {
                                    if (success == "VisitorId not found") {
                                        logActivity2(visitorId, "IPB", folderId, "update Visitor"); // update failed. VisitorId not found
                                    } else {
                                        logActivity2(visitorId, "IPC", folderId, success); // update failed. ajax error
                                        logError2(visitorId, "AJX", folderId, success, "update Visitor");
                                    }
                                }
                            },
                            error: function (jqXHR) {
                                logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
                                let errMsg = getXHRErrorDetails(jqXHR);
                                if (!checkFor404(errMsg, 555, "add Visitor"))
                                    logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
                            }
                        });
                    }
                    else {
                        if (errMsg.indexOf("Rate limit exceeded") > 0) {
                            logActivity2(visitorId, "IP5", folderId, "cloudflareTrace"); // lookup limit exceeded
                            addBadIpVisitorId(folderId, visitorId, calledFrom);
                        }
                        else {
                            if (!checkFor404(errMsg, folderId, "tryCloudflareTrace")) {
                                logError2(visitorId, "XHR", folderId, errMsg, "cloudflareTrace/" + calledFrom);
                                logActivity2(visitorId, "IP6", folderId, "cloudflareTrace");
                                addBadIpVisitorId(folderId, visitorId, calledFrom);
                            }
                            else {
                                logActivity2(visitorId, "IP3", folderId, "cloudflareTrace");
                            }
                        }
                    }
                    ip3Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall3Returned) {
                    logActivity2(visitorId, "IPG", folderId, "cloudflareTrace");
                    addBadIpVisitorId(folderId, visitorId, calledFrom);
                }
                ip3Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "cloudflareTrace");
        logActivity2(visitorId, "IP7", folderId, "cloudflareTrace");
    }
} // 3 www.cloudflare.com/cdn-cgi/trace
