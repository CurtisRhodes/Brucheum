function getIpInfo(folderId, calledFrom) {

    ipapico(folderId, calledFrom);
    return;

    //console.log("calling ipapi.co");
    //$.getJSON('https://ipapi.co/json/', function (data) {
    //    console.log(JSON.stringify(data, null, 2));
    //});

    //console.log("calling geoplugin.net");
    //$.getJSON('http://www.geoplugin.net/json.gp', function (data) {
    //    console.log(JSON.stringify(data, null, 2));
    //});

    //$.getJSON('http ://gd.geobytes.com/GetCityDetails?callback=?', function (data) {
    //    console.log(JSON.stringify(data, null, 2));        });

    logActivity("IP1", folderId, "getIpInfo/" + calledFrom);
    let ipInfoExited = false;
    $.ajax({
        type: "GET",
        url: "https://ipinfo.io?token=ac5da086206dc4",
        dataType: "JSON",
        //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
        success: function (ipResponse) {
            console.log(JSON.stringify(ipResponse, null, 2));
            return;
            ipInfoExited = true;
            //if (ipResponse.status="ok")
            if (isNullorUndefined(ipResponse.ip)) {
                logActivity("IP6", folderId, "getIpInfo/" + calledFrom);  // ipInfo success but came back with no ip
                logError("BUG", folderId, "ipInfo came back with no ip. Bad visitorId added: ", "getIpInfo/" + calledFrom);
            }
            else {
                logActivity("IP2", folderId, "getIpInfo/" + calledFrom)
                addVisitor(
                    {
                        VisitorId: create_UUID(),
                        IpAddress: ipResponse.ip,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: "getIpInfo", //ipResponse.loc,
                        InitialPage: folderId,
                        CalledFrom: "getIpInfo"
                    }
                );
            }
        },
        error: function (jqXHR) {
            ipInfoExited = true;
            let errMsg = getXHRErrorDetails(jqXHR);
            if (errMsg.indexOf("Rate limit exceeded") > 0) {
                //Uncaught Error. { "status": 429, "error": { "title": "Rate limit exceeded", "message": 
                //"Upgrade to increase your usage limits at https ://ipinfo.io/pricing, or contact us via https ://ipinfo.io/contact"}

                if (calledFrom == "verify visitor") {
                    if (document.domain == "localhost") alert("calling getIpInfo from log visit");
                    getIpInfo(folderId, "verify visitor");
                    logActivity("IP5", folderId, calledFrom + "/getIpInfo");
                    tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo5V");
                }
                else {
                    logActivity("IP5", folderId, calledFrom + "/getIpInfo");
                    //"verify visitor"
                    tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo5");
                }
            }
            else {
                //if (!checkFor404(errMsg, visitorData.FolderId, "getIpInfo/" + calledFrom)) {
                logActivity("IP3", folderId, "getIpInfo/" + calledFrom); // XHR error
                logError("XHR", visitorData.FolderId, errMsg, "try AddV isitor");
                tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo3");
            }
        }
    });
    setTimeout(function () {
        if (!ipInfoExited) {
            logActivity("IP4", folderId, "getIpInfo/" + calledFrom); // ipInfo failed to respond
            //logError("IP6", folderId, "", "getIpInfo/" + calledFrom);
            //tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo43");
        }
    }, 855);
}

let ipapicoBusy = false;
function ipapico(folderId, calledFrom) {
    try {
        if (ipapicoBusy) {
            // try something else
            logActivity("IP8", folderId, "ipapico/" + calledFrom);
            getIp3(folderId, calledFrom);
        }
        else {
            logActivity("IP0", folderId, "ipapico/" + calledFrom);
            ipapicoBusy = true;
            let ipapicoReturned = false;
            $.getJSON('http://ip-api.com/json', function (ipapicoData) {
                ipapicoReturned = true;
                //alert("well it worked fine.");
                if (ipApiData.status == "success") {
                    if (isNullorUndefined(ipApiData.query)) {
                        logActivity("IP9", folderId, "ipapico");
                        ipApiData.query = "undefined";
                    }
                    logActivity("IP1", folderId, "ipapico");
                    console.log("calling addVisitor from: ipapico");
                    addVisitor(
                        {
                            VisitorId: create_UUID(),
                            IpAddress: ipapicoData.ip,
                            City: ipapicoData.city,
                            Country: ipapicoData.country_code,
                            Region: ipapicoData.region,
                            GeoCode: "ipapico",
                            InitialPage: folderId,
                            CalledFrom: "ipapico"
                        }
                    );
                }
                else {
                    logError("IPF", 5466, ipApiData.status, "ipapico");
                    logActivity("IP6", 43337, "ipapico");
                    // try something else
                    getIp3(folderId, calledFrom);
                }
            });
            setTimeout(function () {
                if (!ipapicoReturned) {
                    logActivity("IP4", folderId, "ipapico");
                    // try something else
                    getIp3(folderId, calledFrom);
                }
                ipapicoBusy = false;
            }, 2000);
        }
    } catch (e) {
        logActivity("IP7", folderId, "ipapico")
        logError("CAT", folderId, e, "ipapico");
    }
}


let ip3Busy = false;
function getIp3(folderId, calledFrom) {
    try {
        if (ip3Busy) {
            // try something else
            logActivity("IP8", folderId, "ip-api.com/" + calledFrom);
            tryApiDbIpFree(folderId, calledFrom);
            // addBadIpVisitorId(folderId, calledFrom);
        }
        else {
            logActivity("IP0", folderId, "ip-api.com/" + calledFrom);
            ip3Busy = true;
            let ip3returned = false;
            $.getJSON('http://ip-api.com/json', function (ipApiData) {
                ip3returned = true;
                if (ipApiData.status == "success") {

                    if (isNullorUndefined(ipApiData.query)) {
                        logActivity("IP9", folderId, "ip-api.com");
                        ipApiData.query = create_UUID();
                    }

                    logActivity("IP1", folderId, "ip-api.com");
                    console.log("calling addVisitor from: ip-api.com");
                    addVisitor(
                        {
                            VisitorId: create_UUID(),
                            IpAddress: ipApiData.query,
                            City: ipApiData.city,
                            Country: ipApiData.countryCode,
                            Region: ipApiData.regionName,
                            GeoCode: "ip-api.com",
                            InitialPage: folderId,
                            CalledFrom: "ip-api.com"
                        }
                    );
                    console.log("ip-api.com success: " + ipApiData.query);
                    logActivity("IP1", folderId, "ip-api.com");
                }
                else {
                    logError("IPF", 5466, ipApiData.status, "ip-api.com");
                    logActivity("IP6", 43337, "ip-api.com");

                }
            });
            setTimeout(function () {
                if (!ip3returned) {
                    logActivity("IP4", 43337, "ip-api.com");
                    //alert("ip3 failed to respond returned")
                    // try something else
                    tryApiDbIpFree(folderId, calledFrom);
                }
                ip3Busy = false;
            }, 2000);
        }
    } catch (e) {
        logActivity("IP7", 3777, "ip-api.com")
        logError("CAT", 33773, e, "ip-api.com");
    }
}

let apiDbIpFreeBusy = false;
function tryApiDbIpFree(folderId, calledFrom) {
    try {
        if (apiDbIpFreeBusy) {
            logActivity("IP8", folderId, "ip-api.com/" + calledFrom);
            // try something else
            addBadIpVisitorId(folderId, calledFrom);
        }
        else
        {
            apiDbIpFreeBusy = true;
            let apiDbIpFreereturned = false;
            logActivity("IP0", folderId, "apiDbIpFree/" + calledFrom); // attempting ipfy lookup
            $.ajax({
                type: "GET",
                url: "https://api.db-ip.com/v2/free/self",
                dataType: "JSON",
                success: function (ipResponse) {
                    apiDbIpFreereturned = true;
                    if (isNullorUndefined(ipResponse.ipAddress)) {
                        logActivity("IP9", folderId, "apiDbIpFree/" + calledFrom);
                        ipResponse.ipAddress = create_UUID();
                    }
                    if (isNullorUndefined(ipResponse.countryCode)) {
                        ipResponse.countryCode = "ZZ";
                    }

                    logActivity("IP1", folderId, "apiDbIpFree/" + calledFrom);
                    console.log("calling addVisitor from: apiDbIpFree");
                    addVisitor({
                        VisitorId: create_UUID(),
                        IpAddress: ipResponse.ipAddress,
                        City: ipResponse.city,
                        Country: ipResponse.countryCode,
                        Region: ipResponse.stateProv,
                        GeoCode: "apiDbIpFree",
                        InitialPage: folderId,
                        CalledFrom: "apiDbIpFree/" + calledFrom
                    });
                },
                error: function (jqXHR) {
                    logActivity("IF3", folderId, "altIpLookup/" + calledFrom); // ipfy XHR fail
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, folderId, "logStaticPageHit"))
                        logError("XHR", folderId, errMsg, "altIpLookup/" + calledFrom);
                }
            });
            setTimeout(function () {
                if (!apiDbIpFreereturned) {
                    logActivity("IP4", 43337, "ip-api.com");
                    // try something else
                    addBadIpVisitorId(folderId, calledFrom);
                }
                apiDbIpFreeBusy = false;
            }, 2000);
        }
    } catch (e) {
        logError("CAT", folderId, e, "altIpLookup");
        logActivity("IP7", folderId, "altIpLookup");
    }
}

function addBadIpVisitorId(folderId, calledFrom) {
    try {
        console.log("calling addVisitor from: addBadIp");
        addVisitor(
            {
                VisitorId: create_UUID(),
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
}

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

let lastIpHitVisitorId;
function logIpHit(visitorId, ipAddress, folderId) {
    try {
        if (visitorId == lastIpHitVisitorId) {
            logError("PH1", folderId, "VisitorId: " + visitorId + ", IpAddress: " + ipAddress, "log IpHit");
            return;
        }
        lastIpHitVisitorId = visitorId;

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogIpHit",
            data: {
                VisitorId: visitorId,
                FolderId: folderId,
                IpAddress: ipAddress
            },
            success: function (success) {
                if (success == "ok")
                    logActivity("IPH", folderId, "log IpHit");
                else
                    logError("AJX", folderId, success, "log IpHit");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "log IpHit"))
                    logError("XHR", folderId, errMsg, "log IpHit");
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "log IpHit");
    }
}

function logStaticPageHit(folderId, calledFrom) {

    logActivity("SP0", folderId, calledFrom); // calling static page hit
    let visitorId = getCookieValue("VisitorId");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + visitorId +
            "&folderId=" + folderId + "&calledFrom=" + calledFrom,
        success: function (success) {
            logActivity("SP4", folderId, success); // static page hit return
            if (success == "ok") {
                logActivity("SP1", folderId, calledFrom); // static page hit success
                logEvent("SPH", folderId, "logStatic PageHit/" + calledFrom, "");
            }
            else {
                logActivity("SP2", folderId, calledFrom); // static page hit ajax error
                logError("AJX", folderId, success, "logStatic PageHit/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            logActivity("SP6", folderId, calledFrom); // static page hit XHR error
            if (!checkFor404(errMsg, folderId, "log StaticPageHit"))
                logError("XHR", folderId, errMsg, "log StaticPageHit");
        }
    });
    //logEvent("SDS", folderId, "logStatic PageHit/" + calledFrom, "");
}
