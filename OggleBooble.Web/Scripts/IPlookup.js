
function tryAddNewIP(folderId, visitorId, calledFrom) {

    //let visitorId = getCookieValue("VisitorId");
    //if (visitorId == "cookie not found") {
    logActivity2(visitorId, "IP0", folderId, calledFrom);
    getIpInfo(folderId, visitorId, calledFrom);
    // 1 geoplugin(folderId, calledFrom);
    // 2 tryApiDbIpFree(folderId, calledFrom);
    // 3 ipapico(folderId, calledFrom);
}

let ip0Busy = false;
function getIpInfo(folderId, visitorId, calledFrom) {
    try {
        if (ip0Busy) {
            console.log("getIpInfo busy");
            logActivity("IP8", folderId, "get IpInfo/" + calledFrom);
            tryApiDbIpFree(folderId, visitorId, calledFrom);
            return;
        }
        ip0Busy = true;
        //logActivity("IP1", folderId, "get IpInfo/" + calledFrom);
        let ipCall0Returned = false;
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
                if (isNullorUndefined(ipResponse)) {
                    logActivity2(visitorId, "IP9", folderId, "get IpInfo/" + calledFrom);  // ipInfo success but ipResponse null
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                }

                if ((isNullorUndefined(ipResponse.ip)) || (ipResponse.ip == 'undefined') || (ipResponse.ip == 'undefined=')) {
                    tryApiDbIpFree(folderId, visitorId, calledFrom);
                    logActivity2(visitorId, "IP9", folderId, "get IpInfo");  // ipInfo success but came back with no ip
                    //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "IpInfo/" + calledFrom); // Json response code
                }
                else {
                    logActivity2(ipResponse.ip, "IP2", folderId, "get IpInfo/" + calledFrom); // well it worked
                    addVisitor({
                        VisitorId: visitorId,
                        IpAddress: ipResponse.ip,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc,
                        InitialPage: folderId,
                        CalledFrom: calledFrom
                    });
                }
                ip0Busy = false;
            },
            error: function (jqXHR) {
                logActivity2(visitorId, "IP3", folderId, "get IpInfo/" + calledFrom); // XHR error
                ipCall0Returned = true;
                let errMsg = getXHRErrorDetails(jqXHR);

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
                }
                ip0Busy = false;
            }
        });
        setTimeout(function () {
            if (!ipCall0Returned) {
                console.debug("getIpInfo timeout");
                logActivity2(visitorId, "IP4", folderId, "get IpInfo/" + calledFrom); // ipInfo failed to respond
                if (!isNullorUndefined(ipResponse)) {
                    logError2(visitorId, "200", folderId, JSON.stringify(ipResponse, null, 2), "IpInfo/" + calledFrom); // Json response code
                }
                tryApiDbIpFree(folderId, visitorId, calledFrom);  // try something else
            }
            ip0Busy = false;
        }, 1855);
    } catch (e) {
        logActivity2(visitorId, "IP7", folderId, "get IpInfo");
        logError2(visitorId, "CAT", folderId, e, "get IpInfo");
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
            logActivity2(visitorId, "IP1", folderId, "apiDbIpFree");
            ip2Busy = true;
            let ipCall2Returned = false;
            $.ajax({
                type: "GET",
                url: "https://api.db-ip.com/v2/free/self",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall2Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {
                        if (isNullorUndefined(ipResponse.countryCode)) {
                            ipResponse.countryCode = "ZZ";
                        }
                        console.debug("tryApiDbIpFree success");
                        logActivity2(visitorId, "IP2", folderId, "apiDbIpFree/" + calledFrom);
                        console.debug("calling addVisitor from: apiDbIpFree");
                        addVisitor({
                            VisitorId: visitorId,
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
            logActivity2(visitorId, "IP1", folderId, "CloudflareTrace/" + calledFrom); // attempting CloudflareTrace lookup
            $.ajax({
                type: "GET",
                url: "https://www.cloudflare.com/cdn-cgi/trace",
                dataType: "JSON",
                success: function (ipResponse) {
                    ipCall3Returned = true;
                    if (!isNullorUndefined(ipResponse.ipAddress)) {
                        if (isNullorUndefined(ipResponse.countryCode)) {
                            ipResponse.countryCode = "ZZ";
                        }
                        logActivity2(visitorId, "IP2", folderId, "CloudflareTrace/" + calledFrom);
                        addVisitor({
                            VisitorId: visitorId,
                            IpAddress: ipResponse.ip,
                            City: "Cloudflare",
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
                            logActivity2(visitorId, "IP5", folderId, "CloudflareTrace/" + calledFrom); // lookup limit exceeded
                            addBadIpVisitorId(folderId, visitorId, calledFrom);
                        }
                        else {
                            //console.debug("tryCloudflareTrace 6 " + JSON.stringify(ipResponse, null, 2));
                            //logError("200", folderId, JSON.stringify(ipResponse, null, 2), "tryCloudflareTrace/" + calledFrom); // Json response code
                            logActivity2(visitorId, "IP9", folderId, "CloudflareTrace/" + calledFrom);
                            addBadIpVisitorId(folderId, visitorId, calledFrom);
                        }
                    }
                    ip3Busy = false;
                },
                error: function (jqXHR) {
                    ipCall3Returned = true;
                    let errMsg = getXHRErrorDetails(jqXHR);

                    if (errMsg.indexOf("Uncaught Error") > -1) {
                        logActivity2(visitorId, "IP9", folderId, "cloudflareTrace");
                        logError("200", folderId, JSON.stringify(errMsg, null, 2), "cloudflareTrace/" + calledFrom); // Json response code
                        //        Uncaught Error.
                        //            fl = 14f604
                        //        h = www.cloudflare.com
                        //        ip = 23.249.34.220
                        //        ts = 1623704044.737
                        //        visit_scheme = https
                        //        uag = Mozilla / 5.0(Windows NT 10.0; Win64; x64) AppleWebKit / 537.36(KHTML, like Gecko) Chrome / 91.0.4472.77 Safari / 537.36
                        //colo = ORD
                        //http = http / 2
                        //loc = US
                        //tls = TLSv1.3
                        //sni = plaintext
                        //warp = off
                        //gateway = off
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

function addBadIpVisitorId(folderId, visitorId, calledFrom) {
    try {
        console.debug("calling addVisitor from: addBadIp");
        logActivity2(visitorId, "IP2", folderId, "addBadIpVisitorId/" + calledFrom);
        setCookieValue("VisitorId", visitorId);
        addVisitor(
            {
                VisitorId: visitorId,
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
        logError2(visitorId, "CAT", folderId, e, "add BadIpVisitorId");
    }
} // 5 add BadIpVisitorId
