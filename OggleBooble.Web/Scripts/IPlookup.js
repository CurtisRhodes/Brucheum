
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
    // 0 
    getIpInfo(folderId, calledFrom);
    // 1 geoplugin(folderId, calledFrom);
    // 2 tryApiDbIpFree(folderId, calledFrom);
    // 3 ipapico(folderId, calledFrom);
}

let ip0Busy = false;
function getIpInfo(folderId, calledFrom) {
    try {
        if (ip0Busy) {
            console.log("getIpInfo busy");
            logActivity("IP8", folderId, "get IpInfo/" + calledFrom);
            tryApiDbIpFree(folderId, calledFrom);
            return;
        }
        ip0Busy = true;
        let ipCall0Returned = false;
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            statusCode: {
                429: function () {
                    logActivity("IP5", folderId, "get IpInfo/" + calledFrom);
                    console.debug("getIpInfo Rate limit exceeded");
                    tryApiDbIpFree(folderId, calledFrom);
                }
            },
            success: function (ipResponse) {
                ipCall0Returned = true;
                if (isNullorUndefined(ipResponse.ip)) {
                    console.debug("getIpInfo null ip");
                    console.debug("getIpInfo ipResponse.ip: " + JSON.stringify(ipResponse, null, 2));
                    logActivity("IP6", folderId, "get IpInfo/" + calledFrom);  // ipInfo success but came back with no ip
                    //geoplugin(folderId, calledFrom);  // try something else
                    //logError("BUG", folderId, "ipInfo came back with no ip. Bad visitorId added: ", "get IpInfo/" + calledFrom);
                }
                else {
                    console.debug("getIpInfo success");
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
                    console.debug("still calling error function");
                //    alert("still calling error function");
                //    logActivity("IP5", folderId, "get IpInfo/" + calledFrom);
                //    console.debug("getIpInfo Rate limit exceeded");
                //    tryApiDbIpFree(folderId, calledFrom);
                }
                else {
                    console.debug("getIpInfo XHR: " + errMsg);
                    if (!checkFor404(errMsg, folderId, "get IpInfo")) {
                        logError("XHR", folderId, errMsg, "get IpInfo/" + calledFrom);
                        logActivity("IP6", folderId, "get IpInfo/" + calledFrom); // XHR error
                    }
                    else {
                        logActivity("IP3", folderId, "get IpInfo");
                        logError("IP3", folderId, errMsg, "get IpInfo");
                    }
                }
                //geoplugin(folderId, calledFrom);  // try something else
                ip0Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall0Returned) {
                console.debug("getIpInfo timeout");
                logActivity("IP4", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                //geoplugin(folderId, calledFrom);  // try something else
            }
            ip0Busy = false;
        }, 855);
    } catch (e) {
        logActivity("IP7", folderId, "get IpInfo")
        logError("CAT", folderId, e, "get IpInfo");
    }
} // 0 ipinfo.io?token=ac5da086206dc4

// free geoplugin HTTP only
let ip1Busy = false;
function geoplugin(folderId, calledFrom) {
    try {
        //if (ip1Busy) {
        //    logActivity("IP8", folderId, "geoplugin");
        //    tryApiDbIpFree(folderId, calledFrom); // try something else
        //}
        //else
        {
            ip1Busy = true;
            let ipCall1Returned = false;
            logActivity("IP1", folderId, "geoplugin/" + calledFrom);
            console.debug("geoplugin 2");
            $.ajax({
                type: "GET",
                url: "http://geoplugin.net/json.gp",
                dataType: "JSON",
                success: function (ipResponse) {
                    console.debug("geoplugin 3");
                    ipCall1Returned = true;
                    console.debug("getIpInfo  data.geoplugin_status: " + ipResponse.geoplugin_status);

                    if (ipResponse.geoplugin_status == 200) {
                        logActivity("IP2", folderId, "geoplugin");
                        console.debug("calling addVisitor from: geoplugin");
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
                        console.debug("geoplugin 4 status");
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
                        console.debug("geoplugin Rate limit exceeded");
                        logActivity("IP5", folderId, "geoplugin");
                        tryApiDbIpFree(folderId, calledFrom); // try something else
                    }
                    else {
                        console.debug("geoplugin XHR");
                        if (!checkFor404(errMsg, folderId, "geoplugin"))
                            logError("XHR", folderId, errMsg, "geoplugin");
                        else {
                            logActivity("IP3", folderId, "geoplugin");
                            logError("IP3", folderId, errMsg, "geoplugin");
                        }
                    }
                    ip1Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall1Returned) {
                    console.debug("geoplugin 6 timeout");
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
            console.debug("tryApiDbIpFree busy");
            logActivity("IP8", folderId, "apiDbIpFree");
            //ipapico(folderId, calledFrom); // try something else
        }
        else {
            console.debug("tryApiDbIpFree 1");
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
                        console.debug("tryApiDbIpFree success");
                        logActivity("IP2", folderId, "apiDbIpFree/" + calledFrom);
                        console.debug("calling addVisitor from: apiDbIpFree");
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
                            console.debug("tryApiDbIpFree OVER_QUERY_LIMIT");
                            logActivity("IP5", folderId, "apiDbIpFree/" + calledFrom);
                            addBadIpVisitorId(folderId, calledFrom);
                        }
                        else {
                            console.debug("tryApiDbIpFree 6 " + JSON.stringify(ipResponse, null, 2));
                            logError("IPF", folderId, JSON.stringify(ipResponse, null, 2), "apiDbIpFree/" + calledFrom);
                            logActivity("IP9", folderId, "apiDbIpFree/" + calledFrom);
                        }
                    }
                },
                error: function (jqXHR) {
                    ipCall2Returned = true;
                    console.debug("tryApiDbIpFree XHR");
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        //logActivity("IP5", folderId, "apiDbIpFree");
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "apiDbIpFree")) {
                            logError("XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                            logActivity("IP6", folderId, "apiDbIpFree");
                        }
                        else {
                            logActivity("IP3", folderId, "apiDbIpFree");
                            logError("IP3", folderId, errMsg, "apiDbIpFree");
                        }
                    }
                    ip2Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall2Returned) {
                    console.debug("tryApiDbIpFree timeout");
                    logActivity("IP4", folderId, "apiDbIpFree");
                    //ipapico(folderId, calledFrom); // try something else
                }
                ip2Busy = false;
            }, 2000);
        }
    } catch (e) {
        logError("CAT", folderId, e, "apiDbIpFree");
        logActivity("IP7", folderId, "apiDbIpFree");
    }
} // 2 api.db-ip.com/v2/free/self

// free ipapico HTTP only
let ip3Busy = false;
function ipapico(folderId, calledFrom) {
    try {
        console.debug("ipapico 1");
        if (ip3Busy) {
            logActivity("IP8", folderId, "ip-api.com/" + calledFrom);
            console.debug("ipapico busy");
            //addBadIpVisitorId(folderId, calledFrom);
            //getIpInfo(folderId, calledFrom); // try something else
        }
        else {
            ip3Busy = true;
            logActivity("IP1", folderId, "ip-api.com/" + calledFrom);
            let ipCall3Returned = false;
            $.ajax({
                type: "GET",
                url: "ip-api.com/json",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall3Returned = true;
                    if (ipResponse.status == "success") {
                        console.debug("ipapico success");
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
                        console.debug("ipapico status: " + ipApiData.status);
                        //logError("IPF", folderId, ipApiData.status, "ip-api.com");
                        logActivity("IP6", folderId, "ip-api.com");
                        //addBadIpVisitorId(folderId, calledFrom);
                        //getIpInfo(folderId, calledFrom); // try something else 4
                    }
                },
                error: function (jqXHR) {
                    ipCall3Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);
                    console.debug("ipapico XHR: " + errMsg);

                    if (errMsg.indexOf("Not connect") > -1) {
                        logError("XHR", folderId, errMsg, "ip-api.com/" + calledFrom);
                        logActivity("IP6", folderId, "ip-api.com/" + calledFrom); // XHR error
                    }

                    if (errMsg.indexOf("Rate limit exceeded") > 0) {
                        logActivity("IP5", folderId, "ip-api.com/" + calledFrom);
                    }
                    else {
                        if (!checkFor404(errMsg, folderId, "ip-api.com")) {
                            logError("XHR", folderId, errMsg, "ip-api.com/" + calledFrom);
                            logActivity("IP6", folderId, "ip-api.com/" + calledFrom); // XHR error
                        }
                        else {
                            logActivity("IP3", folderId, "ip-api.com");
                            logError("IP3", folderId, errMsg, "ip-api.com");
                        }
                    }
                }
            });
            setTimeout(function () {
                if (!ipCall3Returned) {
                    console.debug("ipapico timeout addBadIpVisitorId");
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
        console.debug("calling addVisitor from: addBadIp");
        addVisitor(
            {
                IpAddress: create_UUID().replace("-","").substr(0,11),
                City: "BadIp",
                Country: "ZZ",
                Region: "unknown",
                GeoCode: "000",
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
