function getIpInfo(folderId, calledFrom) {

    getIp3(folderId, calledFrom);
    return;

    //tryAlt_IpLookup(folderId, calledFrom + "/getIpInfo43");
    //return;

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
                        GeoCode: ipResponse.loc,
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
                logError("XHR", visitorData.FolderId, errMsg, "try AddVisitor");
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


let ip3Busy = false;
function getIp3(folderId, calledFrom) {
    try {
        if (ip3Busy) {
            // try something else
        }
        else {
            // create_UUID()
            logActivity("IP0", 33100, "ip-api.com");
            ip3Busy = true;
            let ip3returned = false;
            $.getJSON('http://ip-api.com/json', function (ipApiData) {
                ip3returned = true;
                if (ipApiData.status == "success") {
                    setCookieValue("VisitorId",)
                    addVisitor(
                        {
                            VisitorId: create_UUID(),
                            IpAddress: ipApiData.query,
                            City: ipApiData.city,
                            Country: ipApiData.countryCode,
                            Region: ipApiData.regionName,
                            GeoCode: ipApiData.lat + ipApiData.Ion,
                            InitialPage: 33100,
                            CalledFrom: "ip-api.com"
                        }
                    );
                    console.log("ip-api.com success: " + ipApiData.query);
                    logActivity("IP1", 33100, "ip-api.com");
                }
                else {
                    logError("IPF", 5466, ipApiData.status, "ip-api.com");
                    logActivity("IP6", 43337, "ip-api.com");

                }
            });
            setTimeout(function () {
                if (!ip3returned) {
                    logActivity("IP4", 43337, "ip-api.com");
                    // try something else
                }
                ip3Busy = false;
            }, 2000);
        }


        //alert("getIp3  calledFrom: " + calledFrom);
        console.log("calling ip-api.com");

    } catch (e) {
        logActivity("IP7", 3777, "ip-api.com")
        logError("CAT", 33773, e, "ip-api.com");
    }
}

function tryApiDbIpFree() {
    try {
        logActivity("IP1", 4555, "tryApiDbioFree"); // attempting ipfy lookup
        $.ajax({
            type: "GET",
            url: "https://api.db-ip.com/v2/free/self",
            dataType: "JSON",
            success: function (ipResponse) {
                if (!isNullorUndefined(ipResponse.ipAddress)) {

                    $.ajax({
                        type: "GET",
                        url: settingsArray.ApiServer + "/api/Visitor/GetVisitorFromIp?ipAddress=" + ipApiData.query,
                        success: function (successModel) {
                            if (successModel.Success == "ok") {
                                if (successModel.ReturnValue == "not found") {
                                    addVisitor(
                                        {
                                            VisitorId: create_UUID(),
                                            IpAddress: ipResponse.ipAddress,
                                            City: ipResponse.city,
                                            Country: ipResponse.countryCode,
                                            Region: ipResponse.countryName,
                                            GeoCode: create_UUID(),
                                            InitialPage: 3000,
                                            CalledFrom: "tryApiDbioFree"
                                        }
                                    );
                                }
                                else {

                                }
                            }
                            else {

                            }
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            logActivity("IP3", 6588, "GetVisitorFromIp");
                            logError("XHR", 6588, errMsg, "GetVisitorFromIp");
                        }
                    });
                }
                else {
                    console.log("api.db-ip.com response: " + ipResponse);
                    logActivity("IF2", folderId, "altIpLookup/" + calledFrom); // ipfy lookup also failed
                    addVisitor({
                        VisitorId: "failedGetIpInfo_" + create_UUID().substr(0, 20),
                        IpAddress: "00.00.00",
                        City: "xx",
                        Country: "US",
                        Region: "xx",
                        GeoCode: create_UUID(),
                        InitialPage: 333,
                        CalledFrom: "failedGetIpInfo"
                    });
                }
            },
            error: function (jqXHR) {
                logActivity("IF3", folderId, "altIpLookup/" + calledFrom); // ipfy XHR fail
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "logStaticPageHit"))
                    logError("XHR", folderId, errMsg, "altIpLookup/" + calledFrom);
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "altIpLookup");
        logActivity("IF4", 444, "altIpLookup");
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
                if (!checkFor404(errMsg, folderId, "log IpHit")) logError("XHR", folderId, errMsg, "log IpHit");
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
