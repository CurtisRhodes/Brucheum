
function tryAddNewIP(folderId, visitorId, calledFrom) {
    try {
        try {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/ScreenIplookupCandidate?visitorId=" + visitorId,
                success: function (lookupCandidateModel) {
                    if (lookupCandidateModel.Success == "ok") {
                        switch (lookupCandidateModel.lookupStatus) {
                            case "bad visitor Id":
                                logActivity2(newVisitorId, "IP0", folderId, "bvId: " + oldVisitorId);
                                break;
                            case "visitorId not found":
                                logActivity2(visitorId, "IPB", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "already processed":
                                logActivity2(visitorId, "IP0", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "already looked up today":
                                logActivity2(visitorId, "IP7", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "months old InitialVisit":
                                logActivity2(visitorId, "IPL", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "pending months old InitialVisit":
                                logActivity2(visitorId, "IPD", folderId, lookupCandidateModel.lookupStatus);
                                getIpInfo(folderId, visitorId, calledFrom);
                                break;
                            case "too many page hits":
                                logActivity2(visitorId, "IPI", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "country not ZZ":
                                logActivity2(visitorId, "IP0", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "pending too many pageHits":
                                logActivity2(visitorId, "IPH", folderId, lookupCandidateModel.lookupStatus);
                                getIpInfo(folderId, visitorId, calledFrom);
                                break;
                            case "passed":
                                //logActivity2(visitorId, "IPP", folderId, "tryAddNewIP/" + calledFrom); // candidate screen passed
                                getIpInfo(folderId, visitorId, calledFrom);
                                break;
                            default:
                                logActivity2(visitorId, "IPS", folderId, "tryAddNewIP/" + lookupCandidateModel.lookupStatus); // Switch Case Problem
                                logError2(visitorId, "SWT", folderId, lookupCandidateModel.lookupStatus, "lookupCandidateModel.lookupStatus");
                        }
                    }
                    else {
                        logActivity2(visitorId, "IPF", folderId, visitorModel.Success); // screen candidate Ajax error
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
    } catch (e) {
        logError2(create_UUID(), "CAT", "9999", e, "tryAddNewIP");
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

        let ipCall0Returned = false;
        ip0Busy = true;
        logActivity2(visitorId, "IP1", folderId, "get IpInfo/" + calledFrom); // calling ip-lookup api
        $.ajax({
            type: "GET",
            //url: "http s://ipinfo.io?token=ac5da086206dc4", 
            url: "https://ipinfo.io?token=e66f93d609e1d8", 
            dataType: "JSON",
            statusCode: {
                429: function () {
                    logActivity2(visitorId, "IP5", folderId, "get IpInfo/" + calledFrom); // lookup limit exceeded
                    ipCall0Returned = true;
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
                });
                ip0Busy = false;
            },
            error: function (jqXHR) {
                ipCall0Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);
                if (errMsg.indexOf("Not connect.") > -1) {
                    logActivity2(visitorId, "IP6", folderId, errMsg); // connection problem
                    tryApiDbIpFree(folderId, visitorId, calledFrom); // try something else
                }
                else {
                    logActivity2(visitorId, "IPZ", folderId, calledFrom); // XHR error
                    logError2(visitorId, "XHR", folderId, errMsg, calledFrom);
                }
                if (errMsg.indexOf("Rate limit exceeded") > 0) {
                    ipCall0Returned = true;
                    logActivity2(visitorId, "IP5", folderId, "IpInfo XHR/" + calledFrom); // lookup limit exceeded
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                }
                ip0Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall0Returned) {
                logActivity2(visitorId, "IPT", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
                //logError2(create_UUID(), "200", folderId, JSON.stringify(ipResponse, null, 2), "ip info timeout"); // Json response code
            }
            ip0Busy = false;
        }, 4000);
    }
    catch (e)
    {
        logActivity2(create_UUID(), "IPC", 621240, "get IpInfo"); // IP catch error
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

                        logActivity2(visitorId, "IP9", folderId, "apiDbIpFree/" + calledFrom); // apiDbIpFree used ok

                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "apiDbIpFree",
                            InitialPage: folderId
                        });
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {
                            console.debug("tryApiDbIpFree OVER_QUERY_LIMIT");
                            logActivity2(visitorId,"IP5", folderId, "apiDbIpFree/" + calledFrom); // lookup limit exceeded
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
                        logActivity2(visitorId, "IP5", folderId, "apiDbIpFree XHR");  // lookup limit exceeded
                        tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "apiDbIpFree")) {
                            logError2(visitorId, "XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            logActivity2(visitorId, "IP6", folderId, "apiDbIpFree");
                        }
                        else {
                            logActivity2(visitorId, "IPX", folderId, "apiDbIpFree");
                            logError2(visitorId, "XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                        }
                    }
                    ip2Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall2Returned) {
                    console.debug("tryApiDbIpFree timeout");
                    logActivity2(visitorId, "IPT", folderId, "apiDbIpFree");
                    tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                }
                ip2Busy = false;
            }, 2000);
        }
    } catch (e) {
        ip2Busy = false;
        logError2(visitorId, "CAT", folderId, e, "apiDbIpFree");
        logActivity2(visitorId, "IPC", folderId, "apiDbIpFree");
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
            //logActivity2(visitorId, "IP1", folderId, "CloudflareTrace/" + calledFrom); // attempting CloudflareTrace lookup
            $.ajax({
                type: "GET",
                url: "https://www.cloudflare.com/cdn-cgi/trace",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall3Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {

                        logActivity2(visitorId, "IPA", folderId, "cloudflare/" + calledFrom); // CloudflareTrace worked

                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "cloudflare",
                            InitialPage: folderId
                        });
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {                            
                            logActivity2(visitorId, "IP5", folderId, "CloudflareTrace"); // lookup limit exceeded
                        }
                        else {
                            //console.debug("tryCloudflareTrace 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "tryCloudflareTrace/" + calledFrom); // Json response code
                            logActivity2(visitorId, "IPK", folderId, "CloudflareTrace. err: " + ipResponse.errorCode);
                            //tagVisitor(visitorId, folderId, "CloudflareTrace/" + calledFrom, "no response");
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
                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: visitorInfo.IpAddress,
                            City: "CloudflareTrace",
                            Country: visitorInfo.Country,
                            Region: "uncaught error?",
                            GeoCode: visitorInfo.GeoCode,
                            InitialPage: folderId
                        });
                        logActivity2(visitorId, "IP2", folderId, "CloudflareTrace/" + calledFrom);
                    }
                    else {
                        if (errMsg.indexOf("Rate limit exceeded") > 0) {
                            logActivity2(visitorId, "IP5", folderId, "cloudflareTrace"); // lookup limit exceeded                            
                            //tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "Rate limit exceeded")

                        }
                        else {
                            if (!checkFor404(errMsg, folderId, "tryCloudflareTrace")) {
                                logError2(visitorId, "XHR", folderId, errMsg, "cloudflareTrace/" + calledFrom);
                                logActivity2(visitorId, "IP6", folderId, "cloudflareTrace");
                            }
                            else {
                                logActivity2(visitorId, "IP3", folderId, "cloudflareTrace");
                                logError2(visitorId, "XHR", folderId, errMsg, "cloudflareTrace/" + calledFrom);
                                tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "XHR");
                            }
                        }
                    }
                    ip3Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall3Returned) {
                    logActivity2(visitorId, "IPT", folderId, "cloudflareTrace");
                    //tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "time out");
                }
                ip3Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "cloudflareTrace");
        logActivity2(visitorId, "IPC", folderId, "cloudflareTrace");
    }
} // 3 www.cloudflare.com/cdn-cgi/trace

function updateVisitor(ipData) {
    try {
        // logActivity2(ipData.VisitorId, "IPQ", folderId, "IPInfo"); // entering update visitor
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
            data: ipData,
            success: function (updateVisitorSuccessModel) {
                if (updateVisitorSuccessModel.Success == "ok") {
                    switch (updateVisitorSuccessModel.ReturnValue) {
                        case "VisitorId not found":
                            logActivity(create_UUID(), "IPB", ipData.InitialPage, "UpdateVisitor"); // ip lookup VisitorId not found. 
                            break;  // 1
                        case "New Ip Visitor Updated":
                            logActivity2(ipData.VisitorId, "IP2", ipData.InitialPage, "UpdateVisitor"); // New Ip Visitor Updated
                            break;  // 2
                        case "Duplicate Ip":
                            logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IP3", ipData.InitialPage, ipData.VisitorId); // Duplicate Ip 
                            setCookieValue("VisitorId", updateVisitorSuccessModel.ComprableIpAddressVisitorId);
                            break;  // 3
                        case "bad duplicate Ip":
                            logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IP4", ipData.InitialPage, ipData.VisitorId); // Duplicate IP Bad Info
                            setCookieValue("VisitorId", updateVisitorSuccessModel.ComprableIpAddressVisitorId);
                            break;  // 4
                        default:
                            logActivity2(ipData.VisitorId, "IPS", ipData.InitialPage, "update visitor"); // Switch Case Problem
                            logError2(ipData.VisitorId, "SWT", ipData.InitialPage, updateVisitorSuccessModel.ReturnValue, "update visitor");
                            break;
                    }
                }
                else {
                    logActivity2(ipData.VisitorId, "IPJ", ipData.InitialPage, updateVisitorSuccessModel.Success, "update visitor");
                    logError2(ipData.VisitorId, "AJX", ipData.InitialPage, updateVisitorSuccessModel.Success, "update visitor");
                }
            },
            error: function (jqXHR) {
                logActivity2(create_UUID(), "IPE", 555, "add Visitor"); // Add Visitor XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 555, "add Visitor"))
                    logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
            }
        });
    }
    catch (e) {
        logActivity2(create_UUID(), "IPC", 1022842, "Update Visitor"); // catch error
        logError2(create_UUID(), "CAT", 621241, e, "Update Visitor");
    }
}
