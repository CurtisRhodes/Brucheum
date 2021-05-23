let lastIpHitVisitorId;
function tryAddNewIP(folderId, calledFrom) {
    let visitorId = getCookieValue("VisitorId");
    setTimeout(function () {
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
    }, 400);
}

function uniqueVisIdlookup(folderId, calledFrom) {

    //if (visitorId == lastIpHitVisitorId) {
    //    logError("PH1", folderId, "VisitorId: " + visitorId + ", IpAddress: " + ipAddress, "log IpHit");
    //    return;
    //}
    //lastIpHitVisitorId = visitorId;


    // 1  geoplugin
    geoplugin(folderId, calledFrom);
    // 2  tryApiDbIpFree
    // 3  ipapico
}

let ip1Busy = false;
function geoplugin(folderId, calledFrom) {
    try {
        if (ip1Busy) {
            logActivity("IP8", folderId, "geoplugin");
            tryApiDbIpFree(folderId, calledFrom); // try something else
        }
        else {
            ip1Busy = true;
            logActivity("IP1", folderId, "geoplugin/" + calledFrom);
            let ipCallReturned = false;
            $.ajax({
                type: "GET",
                url: "http://www.geoplugin.net/json.gp",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCallReturned = true;
                    if (data.geoplugin_status == 200) {
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
                        logError("IPF", 5466, ipApiData.status, "geoplugin");
                        logActivity("IP6", 43337, "geoplugin");
                        tryApiDbIpFree(folderId, calledFrom); // try something else
                        ip1Busy = false;
                    }
                    ip1Busy = false;
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "geoplugin");
                    }
                    else {
                        logActivity("IF3", folderId, "geoplugin/" + calledFrom); // ipfy XHR fail
                        if (!checkFor404(errMsg, folderId, "logStaticPageHit"))
                            logError("XHR", folderId, errMsg, "geoplugin/" + calledFrom);
                    }
                    tryApiDbIpFree(folderId, calledFrom); // try something else
                    ip1Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCallReturned) {
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
            let ipCallReturned = false;
            logActivity("IP1", folderId, "apiDbIpFree/" + calledFrom); // attempting ipfy lookup
            $.ajax({
                type: "GET",
                url: "https://api.db-ip.com/v2/free/self",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCallReturned = true;
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
                        logActivity("IP9", folderId, "apiDbIpFree/" + calledFrom);
                        ipapico(folderId, calledFrom); // try something else
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "apiDbIpFree");
                    }
                    else {
                        logActivity("IP3", folderId, "apiDbIpFree/" + calledFrom); // ipfy XHR fail
                        if (!checkFor404(errMsg, folderId, "apiDbIpFree"))
                            logError("XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                    }
                    ipapico(folderId, calledFrom); // try something else
                    ip2Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCallReturned) {
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
            addBadIpVisitorId(folderId, calledFrom);
            //getIpInfo(folderId, calledFrom); // try something else
        }
        else {
            ip3Busy = true;
            logActivity("IP1", folderId, "ip-api.com/" + calledFrom);
            let ipCallReturned = false;
            $.ajax({
                type: "GET",
                url: "http://ip-api.com/json",
                dataType: "JSON",
                success: function (ipResponse) {
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
                        ip3Busy = false;
                    }
                    else {
                        //logError("IPF", folderId, ipApiData.status, "ip-api.com");
                        logActivity("IP6", folderId, "ip-api.com");
                        addBadIpVisitorId(folderId, calledFrom);
                        //getIpInfo(folderId, calledFrom); // try something else 4
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "ip-api.com/" + calledFrom);
                    }
                    else {
                        logActivity("IP3", folderId, "ip-api.com/" + calledFrom); // XHR error
                        if (!checkFor404(errMsg, folderId, "ip-api.com"))
                            logError("XHR", folderId, errMsg, "ip-api.com/" + calledFrom);
                    }
                    addBadIpVisitorId(folderId, calledFrom);
                    //getIpInfo(folderId, calledFrom); // try something else 4
                    ip3Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCallReturned) {
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

let ip4Busy = false;
function XXgetIpInfo(folderId, calledFrom) {
    try {
        if (ip4Busy) {
            logActivity("IP8", folderId, "get IpInfo/" + calledFrom);
            addBadIpVisitorId(folderId, calledFrom);
            return;
        }
        ip4Busy = true;
        let ipCallReturned = false;
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            success: function (ipResponse) {
                ipCallReturned = true;
                if (ipResponse.status=="ok") {
                    logActivity("IP6", folderId, "get IpInfo/" + calledFrom);  // ipInfo success but came back with no ip
                    logError("BUG", folderId, "ipInfo came back with no ip. Bad visitorId added: ", "get IpInfo/" + calledFrom);
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
                ip4Busy = false;
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (errMsg.indexOf("Rate limit exceeded") > 0) {
                    logActivity("IP5", folderId, "get IpInfo/" + calledFrom);
                }
                else {
                    logActivity("IP3", folderId, "get IpInfo/" + calledFrom); // XHR error
                    logError("XHR", visitorData.FolderId, errMsg, "try Add Visitor");
                }
                addBadIpVisitorId(folderId, calledFrom);
                ip4Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCallReturned) {
                logActivity("IP4", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                addBadIpVisitorId(folderId, calledFrom);
            }
            ip4Busy = false;
        }, 855);
    } catch (e) {
        logActivity("IP7", folderId, "get IpInfo")
        logError("CAT", folderId, e, "get IpInfo");
    }
} // 4 ipinfo.io?token=ac5da086206dc4

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
        logError("CAT", folderId, e, "addBadIpVisitorId");
    }
} // 5 addBadIpVisitorId

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
