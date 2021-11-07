
function tryAddNewIP(folderId, visitorId, calledFrom) {
    try {
        logActivity2(visitorId, "I00", folderId, "tryAddNewIP/" + calledFrom);

        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/ScreenIplookupCandidate?visitorId=" + visitorId,
            success: function (lookupCandidateModel) {
                if (lookupCandidateModel.Success == "ok") {
                    switch (lookupCandidateModel.lookupStatus) {
                        case "bad visitor Id":
                            logActivity2(visitorId, "I0B", folderId, "tryAddNewIP/" + calledFrom);
                            break;
                        case "visitorId not found":
                            logActivity2(visitorId, "I0F", folderId, "tryAddNewIP/" + calledFrom);
                            break;
                        case "already looked up today":
                            logActivity2(visitorId, "I07", folderId, "tryAddNewIP/" + calledFrom);
                            // just for today
                            getIpInfo(folderId, visitorId, "I07/" + calledFrom);
                            break;
                        case "months old InitialVisit":
                            logActivity2(visitorId, "I0L", folderId, "tryAddNewIP/" + calledFrom);
                            break;
                        case "pending months old InitialVisit":
                            logActivity2(visitorId, "I0A", folderId, "pending months old InitialVisit/" + calledFrom); // candidate screen passed
                            //logActivity2(visitorId, "I0D", folderId, "tryAddNewIP/" + calledFrom);
                            getIpInfo(folderId, visitorId, calledFrom);
                            break;
                        case "too many page hits":
                            logActivity2(visitorId, "I0I", folderId, "tryAddNewIP/" + calledFrom);
                            break;
                        case "country not ZZ":
                            logActivity2(visitorId, "I0Z", folderId, "tryAddNewIP/" + calledFrom);
                            break;
                        case "pending too many pageHits":
                            logActivity2(visitorId, "I0A", folderId, "pending too many pageHits/" + calledFrom); // candidate screen passed
                            //logActivity2(visitorId, "I0H", folderId, "tryAddNewIP/" + calledFrom);
                            getIpInfo(folderId, visitorId, calledFrom);
                            break;
                        case "passed":
                            logActivity2(visitorId, "I0A", folderId, "tryAddNewIP/" + calledFrom); // candidate screen passed
                            getIpInfo(folderId, visitorId, calledFrom);
                            break;
                        default:
                            logActivity2(visitorId, "I0S", folderId, "tryAddNewIP  missisg case: " + lookupCandidateModel.lookupStatus); // Switch Case Problem
                            logError2(visitorId, "SWT", folderId, lookupCandidateModel.lookupStatus, "lookupCandidateModel.lookupStatus");
                    }
                }
                else {
                    logActivity2(visitorId, "I0J", folderId, visitorModel.Success); // screen candidate Ajax error
                    logError2(visitorId, "AJX", folderId, visitorModel.Success, "try AddNewIP");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "try AddNewIP"))
                    logError2(create_UUID(), "XHR", folderId, errMsg, "try AddNewIP");
            }
        });
    } catch (e) {
        logError2(visitorId, "CAT", "1023823", e, "tryAddNewIP/" + calledFrom);
    }
}

let ip0Busy = false;
function getIpInfo(folderId, visitorId, calledFrom) {
    try {
        if (ip0Busy) {
            console.log("getIpInfo busy");
            logActivity2(visitorId, "IA8", folderId, "get IpInfo/" + calledFrom);
            tryApiDbIpFree(folderId, visitorId, calledFrom);
            return;
        }

        let ipCall0Returned = false;
        ip0Busy = true;
        logActivity2(visitorId, "IA1", folderId, "get IpInfo/" + calledFrom); // calling ip-lookup api
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4", 
            //url: "h ttps://ipinfo.io?token=e66f93d609e1d8",
            dataType: "JSON",
            statusCode: {
                429: function () {
                    logActivity2(visitorId, "IA5", folderId, "statusCode: " + statusCode); // lookup limit exceeded
                    ipCall0Returned = true;
                    ip0Busy = false;
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                    return;
                }
            },
            success: function (ipResponse) {
                if (isNullorUndefined(ipResponse.ip)) {
                    logActivity2(visitorId, "IA3", folderId, "get IpInfo/" + calledFrom); // empty resopnse
                }
                else {
                    // logActivity2(visitorId, "IA2", folderId, "ipResponse.ip: " + ipResponse.ip); // it worked
                    ipCall0Returned = true;
                    updateVisitor({
                        VisitorId: visitorId,
                        IpAddress: ipResponse.ip,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc,
                        InitialPage: folderId
                    }, "ipinfo");
                }
                ip0Busy = false;
            },
            error: function (jqXHR) {
                ipCall0Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(visitorId, "IAE", folderId, errMsg); // XHR error

                if (errMsg.indexOf("Rate limit exceeded") > 0) {
                    logActivity2(visitorId, "IA5", folderId, "get IpInfo/" + calledFrom); // lookup limit exceeded
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                }
                else {
                    if (errMsg.toUpperCase().indexOf("NOT CONNECT") > -1) {
                        logActivity2(visitorId, "IA6", folderId, "get IpInfo/" + calledFrom); // connection problem
                        tryOtherAccessTokin(folderId, visitorId, calledFrom);
                    }
                    else {
                        logError2(visitorId, "XHR", folderId, errMsg, "get IpInfo/" + calledFrom);
                        logActivity2(visitorId, "IAX", folderId, errMsg); // XHR error
                    }
                }
                ip0Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall0Returned) {
                logActivity2(visitorId, "IAT", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
                //logError2(create_UUID(), "200", folderId, JSON.stringify(ipResponse, null, 2), "ip info timeout"); // Json response code
            }
            ip0Busy = false;
        }, 4000);
    }
    catch (e)
    {
        logActivity2(create_UUID(), "IAC", 621240, "get IpInfo"); // IP catch error
        logError2(create_UUID(), "CAT", 621241, e, "get IpInfo");
        ip0Busy = false;
    }
} // 0 ipinfo.io?token=ac5da086206dc4

let ip8Busy = false;
function tryOtherAccessTokin(folderId, visitorId, calledFrom) {
    try {
        if (ip8Busy) {
            console.log("getIpInfo busy");
            logActivity2(visitorId, "IP8", folderId, "get IpInfo/" + calledFrom);
            tryApiDbIpFree(folderId, visitorId, calledFrom);
            return;
        }

        let ipCall8Returned = false;
        ip8Busy = true;
        logActivity2(visitorId, "IP1", folderId, "get IpInfo/" + calledFrom); // calling ip-lookup api
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=e66f93d609e1d8",
            //url: "h ttps://ipinfo.io?token=ac5da086206dc4", 
            dataType: "JSON",
            statusCode: {
                429: function () {
                    logActivity2(visitorId, "IP5", folderId, "statusCode: " + statusCode); // lookup limit exceeded
                    ipCall0Returned = true;
                    ip0Busy = false;
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                    return;
                }
            },
            success: function (ipResponse) {

                ipCall0Returned = true;
                updateVisitor({
                    VisitorId: visitorId,
                    IpAddress: ipResponse.ip,
                    City: ipResponse.city,
                    Country: ipResponse.country,
                    Region: ipResponse.region,
                    GeoCode: ipResponse.loc,
                    InitialPage: folderId
                }, "ipinfo2");
                ip0Busy = false;
            },
            error: function (jqXHR) {
                ipCall8Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);
                if (errMsg.indexOf("Rate limit exceeded") > 0) {
                    logActivity2(visitorId, "IP5", folderId, "get IpInfo/" + calledFrom); // lookup limit exceeded
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                }
                else {
                    if (errMsg.toUpperCase().indexOf("NOT CONNECT") > -1) {
                        logActivity2(visitorId, "IP6", folderId, "get IpInfo/" + calledFrom); // connection problem
                        tryApiDbIpFree(folderId, visitorId, calledFrom); // try something else
                    }
                    else {
                        logError2(visitorId, "XHR", folderId, errMsg, "get IpInfo/" + calledFrom);
                        logActivity2(visitorId, "IPX", folderId, "indexOf: " + errMsg.toUpperCase().indexOf("NOT CONNECT") + " errMsg: " + errMsg); // XHR error
                    }
                }
                ip8Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall8Returned) {
                logActivity2(visitorId, "IPT", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
                //logError2(create_UUID(), "200", folderId, JSON.stringify(ipResponse, null, 2), "ip info timeout"); // Json response code
            }
            ip8Busy = false;
        }, 4000);
    }
    catch (e) {
        logActivity2(create_UUID(), "IPC", 621240, "get IpInfo"); // IP catch error
        logError2(create_UUID(), "CAT", 621241, e, "get IpInfo");
        ip0Busy = false;
    }
} //  // 8 ipinfo.io?token=e66f93d609e1d8

let ip2Busy = false;
function tryApiDbIpFree(folderId, visitorId, calledFrom) {
    try {
        if (ip2Busy) {
            console.debug("tryApiDbIpFree busy");
            logActivity2(visitorId, "ID8", folderId, "apiDbIpFree");
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

                        logActivity2(visitorId, "ID2", folderId, "apiDbIpFree/" + calledFrom); // apiDbIpFree used ok

                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "apiDbIpFree",
                            InitialPage: folderId
                        }, "apiDbIpFree");
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {
                            console.debug("tryApiDbIpFree OVER_QUERY_LIMIT");
                            logActivity2(visitorId,"ID5", folderId, "apiDbIpFree/" + calledFrom); // lookup limit exceeded
                            tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                        }
                        else {
                            //console.debug("tryApiDbIpFree 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "apiDbIpFree/" + calledFrom); // Json response code
                        }
                    }
                    ip2Busy = false;
                },
                error: function (jqXHR) {
                    ipCall2Returned = true;
                    console.debug("tryApiDbIpFree XHR");
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity2(visitorId, "ID5", folderId, "apiDbIpFree XHR");  // lookup limit exceeded
                        tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "apiDbIpFree")) {
                            //logError2(visitorId, "XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            logActivity2(visitorId, "ID6", folderId, "apiDbIpFree");
                        }
                        else {
                            logActivity2(visitorId, "IDX", folderId, errMsg);
                            // logError2(visitorId, "XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                        }
                    }
                    ip2Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall2Returned) {
                    console.debug("tryApiDbIpFree timeout");
                    logActivity2(visitorId, "IDT", folderId, "apiDbIpFree");
                    tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                }
                ip2Busy = false;
            }, 2000);
        }
    } catch (e) {
        ip2Busy = false;
        logError2(visitorId, "CAT", folderId, e, "apiDbIpFree");
        logActivity2(visitorId, "IDC", folderId, "apiDbIpFree");
    }
} // 2 api.db-ip.com/v2/free/self

let ip3Busy = false;
function tryCloudflareTrace(folderId, visitorId, calledFrom) {
    try {
        if (ip3Busy) {
            //console.debug("CloudflareTrace busy");
            logActivity2(visitorId, "IP8", folderId, "CloudflareTrace");
        }
        else {
            ip3Busy = true;
            let ipCall3Returned = false;
            logActivity2(visitorId, "IC1", folderId, "CloudflareTrace/" + calledFrom); // attempting CloudflareTrace lookup
            $.ajax({
                type: "GET",
                url: "https://www.cloudflare.com/cdn-cgi/trace",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall3Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {

                        logActivity2(visitorId, "IC2", folderId, "cloudflare/" + calledFrom); // CloudflareTrace worked

                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "cloudflare",
                            InitialPage: folderId
                        }, "cloudflare");
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {                            
                            logActivity2(visitorId, "IC5", folderId, "CloudflareTrace"); // lookup limit exceeded
                        }
                        else {
                            //console.debug("tryCloudflareTrace 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "tryCloudflareTrace/" + calledFrom); // Json response code
                            logActivity2(visitorId, "IC3", folderId, ipResponse.errorCode);
                            //tagVisitor(visitorId, folderId, "CloudflareTrace/" + calledFrom, "no response");
                        }
                    }
                    ip3Busy = false;
                },
                error: function (jqXHR) {
                    ipCall3Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);

                    if (errMsg.indexOf("Uncaught Error") > -1) {
                        logActivity2(visitorId, "IC4", folderId, errMsg); // attempting err xhr kludge

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
                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: visitorInfo.IpAddress,
                            City: "CloudflareTrace",
                            Country: visitorInfo.Country,
                            Region: "uncaught error?",
                            GeoCode: visitorInfo.GeoCode,
                            InitialPage: folderId
                        }, "CloudflareTrace2");
                        logActivity2(visitorId, "IC0", folderId, "CloudflareTrace/" + calledFrom); // Cloudflare kludge worked
                    }
                    else {
                        if (errMsg.indexOf("Rate limit exceeded") > 0) {
                            logActivity2(visitorId, "IC5", folderId, "cloudflareTrace"); // lookup limit exceeded                            
                            //tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "Rate limit exceeded")

                        }
                        else {
                            if (!checkFor404(errMsg, folderId, "tryCloudflareTrace")) {
                                //logError2(visitorId, "XHR", folderId, errMsg, "cloudflareTrace/" + calledFrom);
                                logActivity2(visitorId, "IC6", folderId, errMsg);
                            }
                            else {
                                logActivity2(visitorId, "ICX", folderId, errMsg);
                            }
                        }
                    }
                    ip3Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall3Returned) {
                    logActivity2(visitorId, "ICT", folderId, "cloudflareTrace");
                }
                ip3Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "cloudflareTrace");
        logActivity2(visitorId, "ICC", folderId, "cloudflareTrace");
    }
} // 3 www.cloudflare.com/cdn-cgi/trace

function updateVisitor(ipData, calledFrom) {
    try {
        //logActivity2(ipData.VisitorId, "IPQ", ipData.InitialPage, calledFrom); // entering update visitor
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
            data: ipData,
            success: function (updateVisitorSuccess) {
                if (updateVisitorSuccess.Success == "ok") {
                    if (updateVisitorSuccess.VisitorIdExits) {
                        "Existing Ip Visitor Updated"
                        switch (updateVisitorSuccessModel.ReturnValue) {
                            case "New Ip Visitor Updated":
                                if (calledFrom == "ipinfo")
                                    logActivity2(ipData.VisitorId, "IA2", ipData.InitialPage, calledFrom); // New Ip Visitor Updated
                                else
                                    logActivity2(ipData.VisitorId, "IP2", ipData.InitialPage, calledFrom); // New Ip Visitor Updated
                                break;  // 2
                            case "Existing Ip Visitor Updated":
                                if (calledFrom == "ipinfo")
                                    logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IA3", ipData.InitialPage, ipData.VisitorId); // Duplicate Ip 
                                else
                                    logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IP3", ipData.InitialPage, ipData.VisitorId); // Duplicate Ip 

                                setCookieValue("VisitorId", updateVisitorSuccessModel.ComprableIpAddressVisitorId, "update visitor");
                                break;  // 3
                            case "Existing Ip Used":
                                if (calledFrom == "ipinfo")
                                    logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IA4", ipData.InitialPage, ipData.VisitorId); // Duplicate Ip 
                                else
                                    logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IP4", ipData.InitialPage, ipData.VisitorId); // Duplicate Ip 
                                setCookieValue("VisitorId", updateVisitorSuccessModel.ComprableIpAddressVisitorId, "update visitor");
                                break;  // 4
                            default:
                                logActivity2(ipData.VisitorId, "IPS", ipData.InitialPage, "update visitor"); // Switch Case Problem
                                logError2(ipData.VisitorId, "SWT", ipData.InitialPage, updateVisitorSuccessModel.ReturnValue, "update visitor");
                                break;
                        }
                    }
                    else {
                        logActivity2(ipData.VisitorId, "IPB", ipData.InitialPage, calledFrom); // ip lookup VisitorId not found.
                        logError2(ipData.VisitorId, "BUG", ipData.InitialPage, "ip lookup VisitorId not found.", "update visitor");
                    }
                }
                else {
                    logActivity2(ipData.VisitorId, "IPJ", ipData.InitialPage, updateVisitorSuccessModel.Success, "update visitor");
                    logError2(ipData.VisitorId, "AJX", ipData.InitialPage, updateVisitorSuccessModel.Success, "update visitor");
                }
            },
            error: function (jqXHR) {
                logActivity2(create_UUID(), "IPE", 555, "update visitor/" + calledFrom); // Add Visitor XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 555, "update visitor/" + calledFrom))
                    logError2(create_UUID(), "XHR", ipData.InitialPage, errMsg, "update visitor/" + calledFrom);
            }
        });
    }
    catch (e) {
        logActivity2(ipData.VisitorId, "IUC", ipData.InitialPage, "Update Visitor/" + calledFrom); // catch error
        logError2(ipData.VisitorId, "CAT", ipData.InitialPage, e, "Update Visitor/" + calledFrom);
    }
}
