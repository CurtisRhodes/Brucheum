
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
            logActivity2(visitorId, "IPF", folderId, "tryAddNewIP/" + calledFrom); // calling GetVisitorInfo
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/ScreenIplookupCandidate?visitorId=" + visitorId,
                success: function (lookupCandidateModel) {
                    if (lookupCandidateModel.Success == "ok") {
                        switch (lookupCandidateModel.lookupStatus) {
                            case "bad visitor Id":
                                let oldVisitorId = visitorId;
                                visitorId = create_UUID();
                                setCookieValue("visitorId", visitorId);
                                logActivity2(visitorId, "IP0", folderId, "bvId: " + oldVisitorId);
                                break;
                            case "already processed":
                            case "country not ZZ":
                            case "alreadyBurnedVisitor":
                            case "fail two":
                                logActivity2(visitorId, "IP0", folderId, lookupCandidateModel.lookupStatus);
                                break;
                            case "passed":
                                getIpInfo(folderId, visitorId, calledFrom);
                                break;
                            default:
                                logError2(visitorId, "SWT", folderId, lookupCandidateModel.lookupStatus, "lookupCandidateModel.lookupStatus");
                        }
                        //logActivity2(visitorId, "IPF", folderId, "tryAddNewIP/" + calledFrom); // calling GetVisitorInfo
                    }
                    else {
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
                    success: function (updateVisitorSuccessModel) {
                        if (updateVisitorSuccessModel.Success == "ok") {
                            switch (updateVisitorSuccessModel.Message1) {
                                case "VisitorId not found":
                                    logActivity("IPB", folderId, "get IpInfo/" + calledFrom); // ip lookup VisitorId not found. 
                                    addVisitor({
                                        visitorId: visitorId,
                                        IpAddress: ipResponse.ip,
                                        City: ipResponse.city,
                                        Country: ipResponse.country,
                                        Region: ipResponse.region,
                                        GeoCode: ipResponse.loc
                                    }, "get IpInfo/" + calledFrom);
                                    break;
                                case "New Ip Visitor Updated":
                                    switch (updateVisitorSuccessModel.Message2) {
                                        case "ZZ Visitor Updated":
                                            logActivity("IP9", folderId, "get IpInfo/" + calledFrom); // ZZ Visitor Updated. 
                                            break;
                                        case "no ZZ Visitor Updated":
                                            logActivity("IPA", folderId, "get IpInfo/" + calledFrom); // Visitor Ip found. VisitorId reset. 
                                            break;
                                        default:
                                            logActivity("IPS", folderId, "get IpInfo/" + calledFrom); // Switch Case Problem. 
                                            logError("SWT", folderId, updateVisitorSuccessModel.Message2, "updateVisitorSuccessModel 1");
                                    }
                                    break;
                                case "Existing IP":
                                    setCookieValue("VisitorId", updateVisitorSuccessModel.VisitorId);
                                    switch (updateVisitorSuccessModel.Message2) {
                                        case "Existing Ip found. ZZ removed":
                                            logActivity2(visitorId, "IP7", folderId, "UpdateVisitor " + ipResponse.ip); // Existing Ip found ZZ removed. 
                                            break;
                                        case "Existing Ip Cookie Problem":
                                            logActivity("IPG", folderId, "get IpInfo/" + calledFrom); // Existing Ip Cookie Problem. 
                                            tagVisitor(visitorId, folderId, "get IpInfo/" + calledFrom, "Existing Ip Cookie Problem");
                                            break;
                                        case "Existing Ip new GeoCode":
                                            logActivity("IPE", folderId, "get IpInfo/" + calledFrom); // Visitor Ip found. VisitorId reset. 
                                            break;
                                        default:
                                            logActivity("IPS", folderId, "get IpInfo/" + calledFrom); // Switch Case Problem. 
                                            logError("SWT", folderId, updateVisitorSuccessModel.Message2, "updateVisitorSuccessModel.Message2");
                                    }
                                    break;
                            }
                            logVisit(visitorId, folderId, "UpdateVisitor/get IpInfo/" + calledFrom);
                        }
                        else {
                            logActivity2(visitorId, "IPC", folderId, updateVisitorSuccessModel.Success); // update failed. ajax error
                            logError2(visitorId, "AJX", folderId, updateVisitorSuccessModel.Success, "get IpInfo/" + calledFrom);
                        }
                    },
                    error: function (jqXHR) {
                        logActivity2(create_UUID(), "IPE", 555, "add Visitor"); // AddVisitor XHR error
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errMsg, 555, "add Visitor"))
                            logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
                    }
                });
                ip0Busy = false;
                //logActivity2(visitorId, "IP0", folderId, "get IpInfo/" + calledFrom); // well it worked
            },
            error: function (jqXHR) {
                ipCall0Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);
                if (errMsg.indexOf("Not connect.") > -1) {
                    logActivity2(visitorId, "IP6", folderId, "XHR:" + errMsg); // connection problem
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
                if (!isNullorUndefined(ipResponse.ip)) {
                    logActivity2(create_UUID(), "IP9", 621237, "folderId: " + folderId + " visitorId: " + visitorId); // ipInfo failed to respond
                    tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
                }
                else {
                    logActivity2(create_UUID(), "IP8", 621239, "timeout but info"); // timeout but info
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
                        success: function (updateVisitorSuccessModel) {
                            if (updateVisitorSuccessModel.Success == "ok") {
                                logActivity2(visitorId, "IPA", folderId, "timeout"); // visitor successfully updated
                                logVisit(visitorId, folderId, "timeout Update Visitor");
                            }
                            else {
                                if (updateVisitorSuccessModel.Success == "VisitorId not found") {
                                    logActivity2(visitorId, "IPB", folderId, "timeout"); // update failed. VisitorId not found
                                } else {
                                    logActivity2(visitorId, "IPC", folderId, updateVisitorSuccessModel.Success); // update failed. ajax error
                                    logError2(visitorId, "AJX", folderId, updateVisitorSuccessModel.Success, "timeout");
                                }
                            }
                        },
                        error: function (jqXHR) {
                            logActivity2(create_UUID(), "AV8", 555, "Update Visitor"); // AddVisitor XHR error
                            let errMsg = getXHRErrorDetails(jqXHR);
                            if (!checkFor404(errMsg, folderId, "add Visitor"))
                                logError2(create_UUID(), "XHR", folderId, errMsg, "Update Visitor");
                        }
                    });

                    logError2(create_UUID(), "200", folderId, JSON.stringify(ipResponse, null, 2), "ip info timeout"); // Json response code
                }
            }
            ip0Busy = false;
        }, 4000);
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
                            success: function (updateVisitorSuccessModel) {
                                if (updateVisitorSuccessModel.Success == "ok") {
                                    if (updateVisitorSuccessModel.Message1 == "VisitorId not found") {
                                        logActivity("IPB", folderId, "apiDbIpFree/" + calledFrom); // ip lookup VisitorId not found. 
                                        addVisitor({
                                            visitorId: visitorId,
                                            IpAddress: ipResponse.ip,
                                            City: ipResponse.city,
                                            Country: ipResponse.country,
                                            Region: ipResponse.region,
                                            GeoCode: ipResponse.loc
                                        }, "apiDbIpFree/" + calledFrom);
                                    }
                                    if (updateVisitorSuccessModel.Message1 == "New Ip Visitor Updated") {
                                        if (updateVisitorSuccessModel.Message2 == "ZZ Visitor Updated")
                                            logActivity("IP9", folderId, "apiDbIpFree/" + calledFrom); // ZZ Visitor Updated. 
                                        if (updateVisitorSuccessModel.Message2 == "no ZZ Visitor Updated")
                                            logActivity("IPA", folderId, "apiDbIpFree/" + calledFrom); // Visitor Ip found. VisitorId reset. 

                                    }
                                    if (updateVisitorSuccessModel.Message1 == "Existing IP") {
                                        setCookieValue("VisitorId", updateVisitorSuccessModel.VisitorId);
                                        if (updateVisitorSuccessModel.Message2 == "Existing Ip found. ZZ removed")
                                            logActivity("IP7", folderId, "apiDbIpFree/" + calledFrom); // Existing Ip found ZZ removed. 
                                        else
                                            logActivity("IPD", folderId, updateVisitorSuccessModel.Message2); // Existing Ip new GeoCode?
                                    }
                                    logVisit(visitorId, folderId, "apiDbIpFree/" + calledFrom);
                                }
                                else {
                                    if (updateVisitorSuccessModel.Message1 == "VisitorId not found") {
                                        logActivity2(visitorId, "IPB", folderId, "apiDbIpFree/update Visitor"); // update failed. VisitorId not found
                                    } else {
                                        logActivity2(visitorId, "IPC", folderId, "apiDbIpFree/update Visitor"); // update failed. ajax error
                                        logError2(visitorId, "AJX", folderId, updateVisitorSuccessModel.Success, "apiDbIpFree/update Visitor");
                                    }
                                }
                            },
                            error: function (jqXHR) {
                                logActivity2(create_UUID(), "AV8", 555, "apiDbIpFree/update Visitor"); // AddVisitor XHR error
                                let errMsg = getXHRErrorDetails(jqXHR);
                                if (!checkFor404(errMsg, 555, "apiDbIpFree/update Visitor"))
                                    logError2(create_UUID(), "XHR", 55, errMsg, "apiDbIpFree/update Visitor");
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
                    logActivity2(visitorId, "IPG", folderId, "apiDbIpFree");
                    tryCloudflareTrace(folderId, visitorId, calledFrom); // try something else
                }
                ip2Busy = false;
            }, 2000);
        }
    } catch (e) {
        ip2Busy = false;
        logError2(visitorId, "CAT", folderId, e, "apiDbIpFree");
        logActivity2(visitorId, "IPK", folderId, "apiDbIpFree");
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
                            success: function (updateVisitorSuccessModel) {
                                if (updateVisitorSuccessModel.Success == "ok") {
                                    if (updateVisitorSuccessModel.Message1 == "VisitorId not found") {
                                        logActivity("IPB", folderId, "cloudflare/" + calledFrom); // ip lookup VisitorId not found. 
                                        addVisitor({
                                            visitorId: visitorId,
                                            IpAddress: ipResponse.ip,
                                            City: ipResponse.city,
                                            Country: ipResponse.country,
                                            Region: ipResponse.region,
                                            GeoCode: ipResponse.loc
                                        }, "cloudflare/" + calledFrom);
                                    }
                                    if (updateVisitorSuccessModel.Message1 == "New Ip Visitor Updated") {
                                        if (updateVisitorSuccessModel.Message2 == "ZZ Visitor Updated")
                                            logActivity("IP9", folderId, "cloudflare/" + calledFrom); // ZZ Visitor Updated. 
                                        if (updateVisitorSuccessModel.Message2 == "no ZZ Visitor Updated")
                                            logActivity("IPA", folderId, "cloudflare/" + calledFrom); // Visitor Ip found. VisitorId reset. 

                                    }
                                    if (updateVisitorSuccessModel.Message1 == "Existing IP") {
                                        setCookieValue("VisitorId", updateVisitorSuccessModel.VisitorId);
                                        if (updateVisitorSuccessModel.Message2 == "Existing Ip found. ZZ removed")
                                            logActivity("IP7", folderId, "cloudflare/" + calledFrom); // Existing Ip found ZZ removed. 
                                        else
                                            logActivity("IPD", folderId, updateVisitorSuccessModel.Message2); // Existing Ip new GeoCode?
                                        //logActivity2(visitorId, "IPD", folderId, "curr" + updateVisitorSuccessModel.CurrGeoCode + " new: " + ipResponse.loc); // Existing Ip new GeoCode
                                    }
                                    logVisit(visitorId, folderId, "cloudflare/" + calledFrom);
                                }
                                else {
                                    if (updateVisitorSuccessModel.Message1 == "VisitorId not found") {
                                        logActivity2(visitorId, "IPB", folderId, "cloudflare/update Visitor"); // update failed. VisitorId not found
                                    } else {
                                        logActivity2(visitorId, "IPC", folderId, "cloudflare/update Visitor"); // update failed. ajax error
                                        logError2(visitorId, "AJX", folderId, updateVisitorSuccessModel.Success, "cloudflare/update Visitor");
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
                            success: function (updateVisitorSuccessModel) {
                                if (updateVisitorSuccessModel.Success == "ok") {
                                    logActivity2(visitorId, "IPA", folderId, "update Visitor"); // visitor successfully updated
                                    logVisit(visitorId, folderId, "CloudflareTrace/add Visitor");
                                }
                                else {
                                    if (success == "VisitorId not found") {
                                        logActivity2(visitorId, "IPB", folderId, "CloudflareTrace/update Visitor"); // update failed. VisitorId not found
                                    } else {
                                        logActivity2(visitorId, "IPC", folderId, "CloudflareTrace/update Visitor"); // update failed. ajax error
                                        logError2(visitorId, "AJX", folderId, updateVisitorSuccessModel.Success, "CloudflareTrace/update Visitor");
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
                    logActivity2(visitorId, "IPG", folderId, "cloudflareTrace");
                    tagVisitor(visitorId, folderId, "cloudflareTrace/" + calledFrom, "time out");
                }
                ip3Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "cloudflareTrace");
        logActivity2(visitorId, "IPK", folderId, "cloudflareTrace");
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
            logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 555, "add Visitor"))
                logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
        }
    });
}