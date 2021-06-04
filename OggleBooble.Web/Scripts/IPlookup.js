
function tryAddNewIP(folderId, calledFrom) {
    let visitorId = getCookieValue("VisitorId");
    //console.log("tryAddNewIP. visitorId: " + visitorId);

    if (getCookieValue("VisitorId") == "not found") {
        logActivity("IP0", folderId, "trytoGetIp/" + calledFrom);
        uniqueVisIdlookup(folderId, calledFrom);
    }
    else
    {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + getCookieValue("VisitorId"),
            success: function (success) {
                if (success == "ok") {
                    //console.log("asked to lookup user with good visitorId cookie: " + visitorId);
                    logError("DVA", folderId, visitorId, "trytoGetIp/" + calledFrom);
                }
                else {
                    if (success = "badVisitor") {
                        if (getCookieValue("VisitorId") == "not found")
                            uniqueVisIdlookup(folderId, calledFrom);
                        else {
                            logError("IH2", folderId, "", "trytoGetIp/" + calledFrom); // bad visitor already failed
                            logActivity("IPH", folderId, "trytoGetIp/" + calledFrom);
                        }
                    }
                    else {
                        if (success == "not found") {
                            console.log("callining Ip lookup: " + visitorId);
                            uniqueVisIdlookup(folderId, calledFrom);
                        }
                        else
                            logError("AJX", folderId, success, "trytoGetIp/" + calledFrom);
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "trytoGetIp"))
                    logError("XHR", 666, errMsg, "trytoGetIp");
            }
        });
    }
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
        logActivity("IP1", folderId, "get IpInfo/" + calledFrom);
        let ipCall0Returned = false;
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            statusCode: {
                429: function () {
                    logActivity("IP5", folderId, "get IpInfo/" + calledFrom);
                    ipCall0Returned = true;
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
                    logError("200", folderId, JSON.stringify(ipResponse, null, 2), "IpInfo/" + calledFrom); // Json response code
                }
                else
                {
                    if (ipResponse.ip == "not found") {
                        logActivity("IP9", folderId, "get IpInfo/" + calledFrom);  // ipInfo success but came back with no ip
                        //tryApiDbIpFree(folderId, calledFrom);
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
                                GeoCode: ipResponse.loc,
                                InitialPage: folderId,
                                CalledFrom: "get IpInfo"
                            }
                        );
                    }
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
                        if ((visitorId == "not found") && (folderId == 15) && (errMsg = ""))
                        {
                            logActivity("IPW", errMsg.indexOf("Not connect"), errMsg);
                        }
                        else {
                            logActivity("IP3", folderId, "get IpInfo");
                        }
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
                logError("200", folderId, JSON.stringify(ipResponse, null, 2), "IpInfo/" + calledFrom); // Json response code
                tryApiDbIpFree(folderId, calledFrom);  // try something else
            }
            ip0Busy = false;
        }, 855);
    } catch (e) {
        logActivity("IP7", folderId, "get IpInfo")
        logError("CAT", folderId, e, "get IpInfo");
    }
} // 0 ipinfo.io?token=ac5da086206dc4

let ip2Busy = false;
function tryApiDbIpFree(folderId, calledFrom) {
    try {
        if (ip2Busy) {
            console.debug("tryApiDbIpFree busy");
            logActivity("IP8", folderId, "apiDbIpFree");
            tryCloudflareTrace(folderId, calledFrom);
        }
        else {
            if (getCookieValue("VisitorId") != "not found") {
                console.log("asked to RE lookup user with good visitorId cookie: " + visitorId);
                logError("DVA", folderId, visitorId, "tryApiDbIpFree/" + calledFrom);
            }
            else {
                ip2Busy = true;
                let ipCall2Returned = false;
                logActivity("IP1", folderId, "apiDbIpFree/" + calledFrom); // attempting apiDbIpFree lookup
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
                        }
                        else {
                            if (ipResponse.errorCode == "OVER_QUERY_LIMIT") {
                                console.debug("tryApiDbIpFree OVER_QUERY_LIMIT");
                                logActivity("IP5", folderId, "apiDbIpFree/" + calledFrom);
                                tryCloudflareTrace(folderId, calledFrom); // try something else
                            }
                            else {
                                console.debug("tryApiDbIpFree 6 " + JSON.stringify(ipResponse, null, 2));
                                logError("200", folderId, JSON.stringify(ipResponse, null, 2), "apiDbIpFree/" + calledFrom); // Json response code
                                logActivity("IP9", folderId, "apiDbIpFree/" + calledFrom);
                            }
                        }
                        ip2Busy = false;
                    },
                    error: function (jqXHR) {
                        ipCall2Returned = true;
                        console.debug("tryApiDbIpFree XHR");
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (errMsg.indexOf("Rate limit exceeded") > 0) {
                            logActivity("IP5", folderId, "apiDbIpFree XHR");
                            tryCloudflareTrace(folderId, calledFrom); // try something else
                        }
                        else {
                            if (!checkFor404(errMsg, folderId, "apiDbIpFree")) {
                                logError("XHR", folderId, errMsg, "apiDbIpFree/" + calledFrom);
                                logActivity("IP6", folderId, "apiDbIpFree");
                            }
                            else {
                                logActivity("IP3", folderId, "apiDbIpFree");
                                tryCloudflareTrace(folderId, calledFrom); // try something else
                            }
                        }
                        ip2Busy = false;
                    }
                });
                setTimeout(function () {
                    if (!ipCall2Returned) {
                        console.debug("tryApiDbIpFree timeout");
                        logActivity("IPG", folderId, "apiDbIpFree");
                        tryCloudflareTrace(folderId, calledFrom); // try something else
                    }
                    ip2Busy = false;
                }, 2000);
            }
        }
    } catch (e) {
        logError("CAT", folderId, e, "apiDbIpFree");
        logActivity("IP7", folderId, "apiDbIpFree");
    }
} // 2 api.db-ip.com/v2/free/self

let ip3Busy = false;
function tryCloudflareTrace(folderId, calledFrom) {
    try {
        if (ip3Busy) {
            console.debug("tryCloudflareTrace busy");
            logActivity("IP8", folderId, "tryCloudflareTrace");
            addBadIpVisitorId(folderId, calledFrom);
       }
        else {
            if (getCookieValue("VisitorId") != "not found") {
                console.log("asked to RE lookup user with good visitorId cookie: " + visitorId);
                logError("DVA", folderId, visitorId, "tryCloudflareTrace/" + calledFrom);
            }
            else {
                ip3Busy = true;
                let ipCall3Returned = false;
                logActivity("IP1", folderId, "tryCloudflareTrace/" + calledFrom); // attempting tryCloudflareTrace lookup
                $.ajax({
                    type: "GET",
                    url: "https://www.cloudflare.com/cdn-cgi/trace",
                    dataType: "JSON",
                    success: function (ipResponse) {
                        ipCall3Returned = true;
                        if (!isNullorUndefined(ipResponse.ipAddress)) {
                            if (isNullorUndefined(ipResponse.countryCode)) {
                                ipResponse.countryCode = "GG";
                            }
                            logActivity("IP2", folderId, "tryCloudflareTrace/" + calledFrom);
                            addVisitor({
                                IpAddress: ipResponse.ip,
                                City: "?",
                                Country: ipResponse.countryCode,
                                Region: ipResponse.loc,
                                GeoCode: "cloudflare",
                                InitialPage: folderId,
                                CalledFrom: "cloudflare/" + calledFrom
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
                                logActivity("IP5", folderId, "tryCloudflareTrace/" + calledFrom);
                                addBadIpVisitorId(folderId, calledFrom);
                            }
                            else {
                                console.debug("tryCloudflareTrace 6 " + JSON.stringify(ipResponse, null, 2));
                                logError("200", folderId, JSON.stringify(ipResponse, null, 2), "tryCloudflareTrace/" + calledFrom); // Json response code
                                logActivity("IP9", folderId, "tryCloudflareTrace/" + calledFrom);
                                addBadIpVisitorId(folderId, calledFrom);
                            }
                        }
                        ip3Busy = false;
                    },
                    error: function (jqXHR) {
                        ipCall3Returned = true;
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (errMsg.indexOf("Rate limit exceeded") > 0) {
                            logActivity("IP5", folderId, "tryCloudflareTrace");
                            addBadIpVisitorId(folderId, calledFrom);
                        }
                        else {
                            if (!checkFor404(errMsg, folderId, "tryCloudflareTrace")) {
                                logError("XHR", folderId, errMsg, "tryCloudflareTrace/" + calledFrom);
                                logActivity("IP6", folderId, "tryCloudflareTrace");
                            }
                            else {
                                logActivity("IP3", folderId, "tryCloudflareTrace");
                            }
                        }
                        ip3Busy = false;
                    }
                });
                setTimeout(function () {
                    if (!ipCall3Returned) {
                        logActivity("IPG", folderId, "tryCloudflareTrace");
                        addBadIpVisitorId(folderId, calledFrom);
                    }
                    ip3Busy = false;
                }, 2000);
            }
        }
    } catch (e) {
        logError("CAT", folderId, e, "tryCloudflareTrace");
        logActivity("IP7", folderId, "tryCloudflareTrace");
    }
} // 3 www.cloudflare.com/cdn-cgi/trace

function addBadIpVisitorId(folderId, calledFrom) {
    try {
        console.debug("calling addVisitor from: addBadIp");
        logActivity("IP2", folderId, "addBadIpVisitorId/" + calledFrom);
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

function repairBadIp() {
    let visitorId = getCookieValue("VisitorId");
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/GetVisitorInfo?visitorId=" + visitorId,
            success: function (visitorInfo) {
                if (visitorInfo.Success == "ok") {




                    //uniqueVisIdlookup(folderId, "repairBadIp");

                }
                else {
                    if (visitorInfo.Success == "not found") {
                        //logError("EVT", 470, "Ip:", "load UserProfile");  // VisitorId not found                    
                    }
                    else {
                        logError("AJX", 0, visitorInfo.Success, "load UserProfile");
                        if (document.domain == "localhost") alert("load UserProfile: " + visitorInfo.Success);
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "load UserProfile")) logError("XHR", 0, errMsg, "load UserProfile");
            }
        });
    } catch (e) {
        logError("CAT", 12440, e, "load UserProfile");
    }
}


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
                        }
                    }
                    ip1Busy = false;
                }
            });
            setTimeout(function () {
                if (!ipCall1Returned) {
                    console.debug("geoplugin 6 timeout");
                    logActivity("IPG", folderId, "geoplugin");
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
