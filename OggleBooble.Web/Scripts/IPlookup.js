/*
    IP0	already processed               97
    IP1	calling ip-lookup api           964
    IP2	New Ip Visitor Updated          531
    IP3	Duplicate Ip                    394
    IP4	timeout failed to respond       21
    IP5	lookup limit exceeded           24
    IP6	connection problem              47
    IP7	already looked up today         441
    IP8	IpInfo busy                     1
    IP9	months old InitialVisit         X
    IPA	apiDbIpFree XHR error           10
    IPB	ip lookup VisitorId not found   X
    IPC	Catch Error
    IPD	pending months old InitialVisit X
    IPE	update visitor XHR Error        1
    IPF	screen candidate Ajax error     9
    IPG	tryApiDbIpFree timeout          10
    IPH	pending too many pageHits       x
    IPI	too many pageHits               x
    IPJ	update visitor AJAX error
    country not ZZ
    IPK	IP catch error
    IPP	candidate screen passed
    IPS	Switch Case Problem
    IPT	Visitor Tagged                  11
    IPX Xhr error
    IPZ	IpInfo ZZ fail
*/

function tryAddNewIP(folderId, visitorId, calledFrom) {
    try {
        //let visitorId = getCookieValue("VisitorId");
        if (visitorId.indexOf("cookie not found") > -1) {
            logError2(visitorId, "BUG", "cookie not found made it to tryAddNewIP", calledFrom);
            return;
        }
        if (isNullorUndefined(visitorId)) {
            logActivity("IPX", folderId, "tryAddNewIP/" + calledFrom);
            return;
        }
        if (visitorId.length != 36) {
            let newVisitorId = create_UUID();

            logError2(newVisitorId, "BUG", folderId, "Bad VisitorId: " + visitorId, "tryAddNewIP");
            let visitorId = newVisitorId;
            setCookieValue("VisitorId", newVisitorId);
            return;
        }
        else {            
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
                                logActivity2(visitorId, "IP9", folderId, lookupCandidateModel.lookupStatus);
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
            //url: "https://ipinfo.io?token=ac5da086206dc4", 
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
                    GeoCode: ipResponse.loc
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
                logActivity2(visitorId, "IP4", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
                logError2(create_UUID(), "200", folderId, JSON.stringify(ipResponse, null, 2), "ip info timeout"); // Json response code
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
                        logActivity2(visitorId, "IP2", folderId, "apiDbIpFree/" + calledFrom); // well it worked
                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "apiDbIpFree"
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
                    logActivity2(visitorId, "IP4", folderId, "apiDbIpFree");
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
            console.debug("CloudflareTrace busy");
            logActivity2(visitorId, "IP8", folderId, "CloudflareTrace");
            tagVisitor(visitorId, folderId, "CloudflareTrace/" + calledFrom, "CloudflareTrace busy");            
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
                        updateVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "cloudflare"
                        });
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {                            
                            logActivity2(visitorId, "IP5", folderId, "CloudflareTrace/" + calledFrom); // lookup limit exceeded
                            tagVisitor(visitorId, folderId, "CloudflareTrace/" + calledFrom, "CloudflareTrace OVER_QUERY_LIMIT");

                        }
                        else {
                            //console.debug("tryCloudflareTrace 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "tryCloudflareTrace/" + calledFrom); // Json response code
                            logActivity2(visitorId, "IP9", folderId, "CloudflareTrace/" + calledFrom);
                            tagVisitor(visitorId, folderId, "CloudflareTrace/" + calledFrom, "no response");
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
                            GeoCode: visitorInfo.GeoCode
                        });
                        logActivity2(visitorId, "IP2", folderId, "CloudflareTrace/" + calledFrom);
                    }
                    else {
                        if (errMsg.indexOf("Rate limit exceeded") > 0) {
                            logActivity2(visitorId, "IP5", folderId, "cloudflareTrace"); // lookup limit exceeded                            
                            tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "Rate limit exceeded")

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
                    logActivity2(visitorId, "IP4", folderId, "cloudflareTrace");
                    tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "time out");
                }
                ip3Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "cloudflareTrace");
        logActivity2(visitorId, "IPC", folderId, "cloudflareTrace");
    }
} // 3 www.cloudflare.com/cdn-cgi/trace

function tagVisitor(visitorId, folderId, calledFrom, tagValue)
{    
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Visitor/TagVisitor?visitorId=" + visitorId + "&tagValue=" + tagValue,
        success: function (success) {
            if (success == "ok") {
                logActivity2(visitorId, "IPT", folderId, "tag Visitor/" + calledFrom); // Visitor Tagged
            }
            else {
                logError2(visitorId, "AJX", folderId, success, "tag Visitor/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // Add Visitor XHR error
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 555, "add Visitor"))
                logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
        }
    });
}

function updateVisitor(ipData) {
        $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Visitor/UpdateVisitor",
        data: ipData,
        success: function (updateVisitorSuccessModel) {
            try {
                if (updateVisitorSuccessModel.Success == "ok") {
                    switch (updateVisitorSuccessModel.ReturnValue) {
                        case "New Ip Visitor Updated":
                            logActivity2(ipData.VisitorId, "IP2", folderId, "UpdateVisitor"); // New Ip Visitor Updated
                            break;
                        case "Duplicate Ip":
                            setCookieValue("VisitorId", updateVisitorSuccessModel.ComprableIpAddressVisitorId);
                            logActivity2(updateVisitorSuccessModel.ComprableIpAddressVisitorId, "IP3", folderId, "UpdateVisitor"); // Duplicate Ip 





                            break;
                        case "VisitorId not found":
                            logActivity(create_UUID(), "IPB", folderId, "UpdateVisitor"); // ip lookup VisitorId not found. 
                        default:
                            logActivity2(ipData.VisitorId, "IPS", folderId, "update visitor"); // Switch Case Problem
                            logError2(ipData.VisitorId, "SWT", folderId, updateVisitorSuccessModel.ReturnValue, "update visitor");
                            break;
                    }
                }
                else {
                    logActivity2(ipData.VisitorId, "IPJ", folderId, updateVisitorSuccessModel.Success, "update visitor");
                    logError2(ipData.VisitorId, "AJX", folderId, updateVisitorSuccessModel.Success, "update visitor");
                }
            }
            catch (e) {
                logActivity2(ipData.VisitorId, "IPC", folderId, updateVisitorSuccessModel.ReturnValue); // catch error
                logError2(ipData.VisitorId, "CAT", 621241, e, "Update Visitor");
            }
        },
        error: function (jqXHR) {
            logActivity2(ipData.VisitorId, "IPE", 555, "add Visitor"); // Add Visitor XHR error
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 555, "add Visitor"))
                logError2(ipData.VisitorId, "XHR", 55, errMsg, "add Visitor");
        }
    });
}
