
function tryAddNewIP(folderId, calledFrom) {
    let visitorId = getCookieValue("VisitorId");

    console.log("tryAddNewIP. visitorId: " + visitorId);

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
        success: function (success) {
            if (success == "ok") {
                console.log("asked to lookup user with good visitorId cookie: " + visitorId);
                logError("DVA", folderId, visitorId, "trytoGetIp/" + calledFrom);
            }
            else {
                if (success == "not found") {
                    console.log("callining Ip lookup: " + visitorId);
                    logActivity("IP0", folderId, "trytoGetIp/" + calledFrom);
                    uniqueVisIdlookup(folderId, calledFrom);
                }
                else
                    logError("AJX", folderId, success, "trytoGetIp/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "trytoGetIp"))
                logError("XHR", 666, errMsg, "trytoGetIp");
        }
    });
}

function uniqueVisIdlookup(folderId, calledFrom) {
    // 0 getIpInfo(folderId, calledFrom);
    // 1  
    geoplugin(folderId, calledFrom);
    // 2  tryApiDbIpFree
    // 3  ipapico
}

let ip0Busy = false;
function getIpInfo(folderId, calledFrom) {
    try {
        if (ip0Busy) {
            logActivity("IP8", folderId, "get IpInfo/" + calledFrom);
            geoplugin(folderId, calledFrom);  // try something else
            return;
        }
        ip0Busy = true;
        let ipCall0Returned = false;
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            success: function (ipResponse) {
                ipCall0Returned = true;
                if (isNullorUndefined(ipResponse.ip)) {
                    logActivity("IP6", folderId, "get IpInfo/" + calledFrom);  // ipInfo success but came back with no ip
                    geoplugin(folderId, calledFrom);  // try something else
                    //logError("BUG", folderId, "ipInfo came back with no ip. Bad visitorId added: ", "get IpInfo/" + calledFrom);
                }
                else {
                    logActivity("IP2", folderId, "get IpInfo/" + calledFrom);
                    addVisitor(
                        {
                            IpAddress: ipResponse.ip,
                            City: ipResponse.city,
                            Country: ipResponse.country,
                            Region: ipResponse.region,
                            GeoCode: "get IpInfo", //ipResponse.loc,
                            InitialPage: folderId,
                            CalledFrom: "get IpInfo"
                        }
                    );
                }
                ip0Busy = false;
            },
            error: function (jqXHR) {
                ipCall0Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);
                if (errMsg.indexOf("Rate limit exceeded") > 0) {
                    logActivity("IP5", folderId, "get IpInfo/" + calledFrom);
                }
                else {
                    if (!checkFor404(errMsg, folderId, "get IpInfo")) {
                        logError("XHR", folderId, errMsg, "get IpInfo/" + calledFrom);
                        logActivity("IP6", folderId, "get IpInfo/" + calledFrom); // XHR error
                    }
                    else {
                        logActivity("IP3", folderId, "get IpInfo/" + calledFrom); // XHR error
                        logError("IP3", folderId, errMsg, "get IpInfo/" + calledFrom);
                    }
                }
                geoplugin(folderId, calledFrom);  // try something else
                ip0Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall0Returned) {
                logActivity("IP4", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                geoplugin(folderId, calledFrom);  // try something else
            }
            ip0Busy = false;
        }, 855);
    } catch (e) {
        logActivity("IP7", folderId, "get IpInfo")
        logError("CAT", folderId, e, "get IpInfo");
    }
} // 0 ipinfo.io?token=ac5da086206dc4

let ip1Busy = false;
function geoplugin(folderId, calledFrom) {
    try {
        if (ip1Busy) {
            logActivity("IP8", folderId, "geoplugin");
            tryApiDbIpFree(folderId, calledFrom); // try something else
        }
        else {
            console.log("getIpInfo  1");
            ip1Busy = true;
            logActivity("IP1", folderId, "geoplugin/" + calledFrom);
            let ipCall1Returned = false;
            $.ajax({
                type: "GET",
                url: "http://www.geoplugin.net/json.gp",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall1Returned = true;
                    console.log("getIpInfo  data.geoplugin_status: " + ipResponse.geoplugin_status);

                    if (ipResponse.geoplugin_status == 200) {
                        logActivity("IP2", folderId, "geoplugin");
                        console.log("calling addVisitor from: geoplugin");
                        addVisitor(
                            {
                                IpAddress: ipResponse.geoplugin_request,
                                City: ipResponse.geoplugin_city,
                                Country: ipResponse.geoplugin_countryCode,
                                Region: ipResponse.geoplugin_region,
                                GeoCode: "geoplugin",
                                InitialPage: folderId,
                                CalledFrom: "geoplugin"
                            }
                        );
                    }
                    else {
                        logError("IPF", folderId, ipApiData.status, "geoplugin");
                        logActivity("IP9", folderId, "geoplugin");
                        tryApiDbIpFree(folderId, calledFrom); // try something else
                        ip1Busy = false;
                    }
                    ip1Busy = false;
                },
                error: function (jqXHR) {
                    ipCall1Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "geoplugin");
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "geoplugin"))
                            logError("XHR", folderId, errMsg, "geoplugin/" + calledFrom);
                        else {
                            logActivity("IP3", folderId, "geoplugin/" + calledFrom); // ipfy XHR fail
                            logError("IP3", folderId, JSON.stringify(ipResponse, null, 2), "geoplugin/" + calledFrom);
                        }
                    }
                    tryApiDbIpFree(folderId, calledFrom); // try something else
                    ip1Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall1Returned) {
                    logActivity("IP4", folderId, "geoplugin");
                    tryApiDbIpFree(folderId, calledFrom); // try something else
                }
                ip1Busy = false;
            }, 2000);
        }
    } catch (e) {
        logActivity("IP7", folderId, "geoplugin")
        logError("CAT", folderId, e, "geoplugin");
    }
} // 1 www.geoplugin.net/json.gp

let ip2Busy = false;
function tryApiDbIpFree(folderId, calledFrom) {
    try {
        if (ip2Busy) {
            logActivity("IP8", folderId, "apiDbIpFree");
            ipapico(folderId, calledFrom); // try something else
        }
        else {
            ip2Busy = true;
            let ipCall2Returned = false;
            logActivity("IP1", folderId, "apiDbIpFree/" + calledFrom); // attempting ipfy lookup
            $.ajax({
                type: "GET",
                url: "https://api.db-ip.com/v2/free/self",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall2Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {
                        if (isNullorUndefined(ipResponse.countryCode)) {
                            ipResponse.countryCode = "GG";
                        }
                        logActivity("IP2", folderId, "apiDbIpFree/" + calledFrom);
                        console.log("calling addVisitor from: apiDbIpFree");
                        addVisitor({
                            IpAddress: ipResponse.ipAddress,
                            City: ipResponse.city,
                            Country: ipResponse.countryCode,
                            Region: ipResponse.stateProv,
                            GeoCode: "apiDbIpFree",
                            InitialPage: folderId,
                            CalledFrom: "apiDbIpFree/" + calledFrom
                        });
                        ip2Busy = false;
                    }
                    else {
                        if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {
                            logActivity("IP5", folderId, "apiDbIpFree/" + calledFrom);
                        }
                        else {
                            logError("IPF", folderId, JSON.stringify(ipResponse, null, 2), "apiDbIpFree/" + calledFrom);
                            logActivity("IP9", folderId, "apiDbIpFree/" + calledFrom);
                        }
                        ipapico(folderId, calledFrom); // try something else
                    }
                },
                error: function (jqXHR) {
                    ipCall2Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "apiDbIpFree");
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "apiDbIpFree")) {
                            logError("XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            logActivity("IP6", folderId, "apiDbIpFree/" + calledFrom); // ipfy XHR fail
                        }
                        else {
                            logActivity("IP3", folderId, "apiDbIpFree/" + calledFrom); // ipfy XHR fail
                            logError("IP3", folderId, errMsg, "apiDbIpFree/" + calledFrom); // ipfy XHR fail
                        }
                    }
                    ipapico(folderId, calledFrom); // try something else
                    ip2Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall2Returned) {
                    logActivity("IP4", folderId, "apiDbIpFree");
                    ipapico(folderId, calledFrom); // try something else
                }
                ip2Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError("CAT", folderId, e, "apiDbIpFree");
        logActivity("IP7", folderId, "apiDbIpFree");
    }
} // 2 api.db-ip.com/v2/free/self

let ip3Busy = false;
function ipapico(folderId, calledFrom) {
    try {
        if (ip3Busy) {
            logActivity("IP8", folderId, "ip-api.com/" + calledFrom);
            //addBadIpVisitorId(folderId, calledFrom);
            //getIpInfo(folderId, calledFrom); // try something else
        }
        else {
            ip3Busy = true;
            logActivity("IP1", folderId, "ip-api.com/" + calledFrom);
            let ipCall3Returned = false;
            $.ajax({
                type: "GET",
                url: "http://ip-api.com/json",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall3Returned = true;
                    if (ipResponse.status == "success") {
                        logActivity("IP2", folderId, "ip-api.com");
                        addVisitor(
                            {
                                IpAddress: ipResponse.query,
                                City: ipResponse.city,
                                Country: ipResponse.countryCode,
                                Region: ipResponse.regionName,
                                GeoCode: "ip-api.com",
                                InitialPage: folderId,
                                CalledFrom: "ip-api.com"
                            }
                        );
                    }
                    else {
                        //logError("IPF", folderId, ipApiData.status, "ip-api.com");
                        logActivity("IP6", folderId, "ip-api.com");
                        addBadIpVisitorId(folderId, calledFrom);
                        //getIpInfo(folderId, calledFrom); // try something else 4
                    }
                },
                error: function (jqXHR) {
                    ipCall3Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "ip-api.com/" + calledFrom);
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "ip-api.com")) {
                            logError("XHR", folderId, errMsg, "ip-api.com/" + calledFrom);
                            logActivity("IP6", folderId, "ip-api.com/" + calledFrom); // XHR error
                        }
                        else {
                            logActivity("IP3", folderId, "ip-api.com/" + calledFrom); // XHR error
                            logError("IP3", folderId, errMsg, "ip-api.com/" + calledFrom);
                        }
                    }
                }
            });
            setTimeout(function () {
                if (!ipCall3Returned) {
                    logActivity("IP4", folderId, "ip-api.com");
                    addBadIpVisitorId(folderId, calledFrom);
                    //getIpInfo(folderId, calledFrom); // try something else 4
                }
                ip3Busy = false;
            }, 2000);
        }
    }
    catch (e) {
        logActivity("IP7", folderId, "ip-api.com")
        logError("CAT", folderId, e, "ip-api.com");
    }
} // 3 ip-api.com/json

function addBadIpVisitorId(folderId, calledFrom) {
    try {
        console.log("calling addVisitor from: addBadIp");
        addVisitor(
            {
                IpAddress: create_UUID(),
                City: "BadIp",
                Country: "ZZ",
                Region: "unknown",
                GeoCode: "badIp",
                InitialPage: folderId,
                CalledFrom: "badIp/" + calledFrom
            }
        );
    } catch (e) {
        logError("CAT", folderId, e, "add BadIpVisitorId");
    }
} // 5 add BadIpVisitorId

/////////////////////////////////////////////////////////////////////////////////////

//$.getJSON('https ://ipapi.co/json/', function (data) {
//    console.log(JSON.stringify(data, null, 2));
//});
//url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
//$.getJSON('http ://www.geoplugin.net/json.gp', function (data) {
//    console.log(JSON.stringify(data, null, 2));
//});
//$.getJSON('http ://gd.geobytes.com/GetCityDetails?callback=?', function (data) {
//    console.log(JSON.stringify(data, null, 2));        });


function getCloudflare(calledFrom, folderId) {
    $.get('https://www.cloudflare.com/cdn-cgi/trace', function (data) {
        console.log("Cloudflare IP: " + data.ip);
        window.localStorage["IpAddress"] = data.ip;

        let visitorId = getCookieValue("VisitorId")
        if (isNullorUndefined(visitorId)) {
            addVisitor({
                IpAddress: data.ip,
                InitialPage: folderId,
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
