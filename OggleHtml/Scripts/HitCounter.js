﻿// HITCOUNTER
var verbosity = 1;

// verbosity > 4 show new visits redirects
// verbosity > 5 visitior came back

function logImageHit(link, pageId, isInitialHit) {
    //$('#footerMessage').html("logging image hit");

    if (isNullorUndefined(pageId)) {
        pageId = 1;
        sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "pageId: " + pageId + ". Set to 1");

    }
    var ipAddr = getCookieValue("IpAddress");
    var visitorId = getCookieValue("VisitorId");    

    if (isNullorUndefined(ipAddr)) {
        //sendEmailToYourself("Problem in LogImageHit. IpAddress not found.", "VisitorId: " + visitorId);
        //logVisitor(pageId);
        return;
    }
    if (isNullorUndefined(visitorId) || visitorId === "unknown") {
        sendEmailToYourself("SENT TO LOGVISITOR visitorId", "ERROR in logImageHit.  VisitorId came in Null or Undefined or Unknown.  IpAddr: " + ipAddr);
        logVisitor(pageId);
        return;
    }
    //if (visitorId !== '9bd90468-e633-4ee2-af2a-8bbb8dd47ad1') 
    
    var linkId = link.substr(link.lastIndexOf("_") + 1, 36);
    //var ipAddr = getCookieValue("IpAddress");
    //if (ipAddr === "68.203.90.183") {
    //    alert("logImageHit.  PageId " + pageId);
    //}

    var logImageHItData = {
        VisitorId: visitorId,
        PageId: pageId,
        LinkId: linkId,
        IsInitialHit: isInitialHit
    };

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/ImageHit/LogImageHit",  //?visitorId=" + visitorId + "&pageId=" + pageId + "&linkId=" + linkId,
        data: logImageHItData,
        success: function (imageHitSuccessModel) {
            //alert("imageHitSuccessModel.Success: " + imageHitSuccessModel.Success);
            if (imageHitSuccessModel.Success === "ok") {
                var imageHits = imageHitSuccessModel.ImageHits;
                var userHits = imageHitSuccessModel.UserHits;
                if (imageHitSuccessModel.IpAddress !== "68.203.90.183") {
                    if (verbosity > 30) {
                        sendEmailToYourself("logImageHit SUCCESS " + imageHitSuccessModel.PageName,
                            "IpAddress: " + imageHitSuccessModel.IpAddress + " imageHits: " + imageHits + " user hits: " + userHits + "  initialHit: " + isInitialHit);
                    }
                }
                //else
                //    alert("logImageHit SUCCESS pageName:" + imageHitSuccessModel.PageName +
                //        "IpAddress: " + imageHitSuccessModel.IpAddress + " imageHits: " + imageHits + " user hits: " + userHits + "  initialHit: " + isInitialHit);
                
                //console.log(visitorId + " viewed Image imageHits: " + imageHits + " user hits: " + userHits);
            }
            else {
                //console.log("logImageHit: " + imageHitSuccessModel.Success);
                //if (imageHitSuccessModel.IpAddress !== "68.203.90.183") {
                if (ipAddr !== "68.203.90.183") {
                    sendEmailToYourself("Ajax fail in Hitcounter.js logImageHit",
                        "VisitorId: " + visitorId +
                        " utc: " + imageHitSuccessModel.HitDateTime +
                        " isInitialHit: " + isInitialHit +
                        "PageId: " + pageId +
                        "\n linkId: " + linkId +
                        //" imageHitSuccessModel.IpAddress: " + imageHitSuccessModel.IpAddress +
                        "\n ipAddr: " + ipAddr +
                        "\n Message: " + imageHitSuccessModel.Success);
                }
                else {
                    sendEmailToYourself("DOUBLE ajax fail in Hitcounter.js logImageHit", "PageId: " + pageId + " linkId: " + linkId +
                        "\n ipAddr: " + getCookieValue("IpAddress") + " VisitorId: " + visitorId + " isInitialHit: " + isInitialHit + " Message: " + imageHitSuccessModel.Success);
                }
                    //alert("Ajax fail in Hitcounter.js logImageHit\nPageId: " + pageId + "\n linkId: " + linkId +
                    //    "\n ipAddr: " + getCookieValue("IpAddress") + "\n VisitorId: " + visitorId + "\n isInitialHit: " + isInitialHit + " Message: " + imageHitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logImageHit")) {
                sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logImageHit", "api/ImageHit/LogImageHit?visitorId=" + visitorId +
                    ", pageId: " + pageId + " isInitialHit: " + isInitialHit + ", linkId=" + link + ", Message: " + errorMessage);
            }
            //sendEmailToYourself("WHAT THE  logImageHit jqXHR fail ", getXHRErrorDetails(jqXHR, exception));
            //console.log("logImageHit XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function logVisitor(pageId) {
    try {
        var ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            console.log("no need to Log Visistor I alread know ip: " + ipAddress);
            sendEmailToYourself("no need to Log Visistor", "I alread know ip: " + ipAddress);
            //$('#footerMessage').append("  no need to Log Visistor I alread know ip: " + ip);
            logPageHit(pageId);
        }
        else
        {
            //$('#footerMessage').html("A HIT TO IPINFO.IO  ip: " + ipAddress);
            //console.log("A HIT TO IPINFO.IO  ip: " + ipAddress);
            //sendEmailToYourself("logvisitor from " + calledFrom, " pageId: " + pageId);
            $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

                //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
                //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")
                var userName = getCookieValue("User");
                var visitorModel = {
                    AppName: "OggleBooble",
                    PageId: pageId,
                    UserName: userName,
                    Verbosity: verbosity,
                    City: data.city,
                    Region: data.region,
                    Country: data.country,
                    GeoCode: data.loc,
                    IpAddress: data.ip
                };

                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "api/HitCounter/LogVisitor",
                    data: visitorModel,
                    success: function (visitorSuccess) {
                        if (visitorSuccess.Success === "ok") {
                            //sendEmailToYourself("back from api/logvisitor", "IpAddress: " + data.ip + " visitorSuccess.VisitorId: " + visitorSuccess.VisitorId);

                            //console.log("setCookieValue('IpAddress'," + data.ip);
                            //console.log("setCookieValue('VisitorId'," + visitorSuccess.VisitorId + ")");
                            setCookieValue("IpAddress", data.ip);
                            setCookieValue("VisitorId", visitorSuccess.VisitorId);

                            if ((getCookieValue("IpAddress") !== data.ip) || ((getCookieValue("VisitorId") !== visitorSuccess.VisitorId))) {
                                sendEmailToYourself("COOKIE FAIL",
                                    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country +
                                    "\n data.ip: " + data.ip + " getCookieValue('IpAddress') " + getCookieValue("IpAddress") +
                                    "\n visitorSuccess.VisitorId: " + visitorSuccess.VisitorId + " getCookieValue('VisitorId') " + getCookieValue("VisitorId"));
                                console.log("COOKIE FAIL.  " + getCookieValue("VisitorId") !== visitorSuccess.VisitorId);
                            }

                            if (visitorSuccess.IsNewVisitor) {
                                console.log("valid HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                                switch (pageId) {
                                    case 1942: // Jennifer Lyn Jackson
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 1989",
                                                " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=626';
                                        break;
                                    case 1555: // Donna Derrico
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 1995",
                                            " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=633';
                                        break;
                                    case 1516: // Henriette Allais
                                    case 1520: // Teri Peterson 
                                    case 1524: // Jeana Tomasino
                                    case 1547: // Melissa Holliday 
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 1980",
                                                " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=616';
                                        break;
                                    case 1479: // Lauren Michelle Hill
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 2001",
                                                " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=643';
                                        break;
                                    case 1374: // Regina Deutinger
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 2008",
                                                " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=650';
                                        break;
                                    case 1947: // Karin and Mirjam Van Breeschooten
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to Hef Likes twins",
                                                " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        //window.location.href = 'https://ogglebooble.com/static/playboy/Hef%20likes%20twins.html';
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=3904';
                                        break;
                                    case 1115: // Karen Price
                                    case 1514: // Gig Gangel
                                    case 1522: // Lisa Welch
                                    case 1487: // Lindsey Vuolo
                                    case 1614: // Nadine Chanz
                                        if (verbosity > 4)
                                            sendEmailToYourself("Redirecting new visitor from " + visitorSuccess.PageName + " to Biggest Breasted Centerfolds",
                                                " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=3900';
                                        break;
                                    case 1177: // Kylie Johnson
                                    case 1949: // Renee tenison
                                    case 1477: // Nichole Narin
                                    case 1519: // Ola Ray
                                    case 1919: // Julie Woodson
                                        if (verbosity > 4)
                                            sendEmailToYourself("New visitor from " + visitorSuccess.PageName + " redirect to Black Centerfolds",
                                                " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=3822';
                                        break;
                                    default:
                                        if (verbosity > 5)
                                            sendEmailToYourself("Someone new visited: " + visitorSuccess.PageName,
                                                " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                                //if ((ipAddress !== "68.203.90.183") && (ipAddress !== "50.62.160.105"))
                            }
                            else {
                                console.log("Unnecessary HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                                if (!isNullorUndefined(userName)) {
                                    sendEmailToYourself("Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " + userName + " came back for another visit ",
                                        visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    if (verbosity > 5)
                                        sendEmailToYourself("A visitor came back ",
                                            visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                            }
                            $('#footerMessage').html("");
                            if (visitorSuccess.WelcomeMessage !== "") {
                                $('#headerMessage').html(visitorSuccess.WelcomeMessage);
                            }
                            //sendEmailToYourself("Success in logVisitor ", "Just so you know this happens too, not just the pk violation.");
                        }
                        else {
                            //console.log("logVisitor: " + visitorSuccess.Success);
                            sendEmailToYourself("Ajax Error in logVisitor ", "PageId: " + pageId + "  Message: " + visitorSuccess.Success);
                        }
                    },
                    error: function (jqXHR) {
                        $('#blogLoadingGif').hide();
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "logVisitor")) {
                            sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisitor", "api/HitCounter/LogVisitor" +
                                " Message: " + errorMessage);
                        }
                        //sendEmailToYourself("LogVisit jqXHR", getXHRErrorDetails(jqXHR, exception));
                        //console.log("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                    }
                });
            });
        }
    } catch (e) {
        sendEmailToYourself("Error in Log Visistor", e);
    }
}

function logPageHit(pageId) {
    var ipAddress = getCookieValue("IpAddress");
    if (isNullorUndefined(ipAddress)) {
        console.log("Unable to perform logPageHit for pageId: " + pageId);
        //sendEmailToYourself("calling logVisitor from logPageHit for pageId: " + pageId, "Ipaddress Not found");
        logVisitor(pageId, "logPageHit");
    }
    else {
        if (isNullorUndefined(getCookieValue("VisitorId"))) {
            //alert("how is it that I know the Ip (" + getCookieValue("IpAddress") + ") and not the visitorId?");
            console.log("how is it that I know the Ip (" + getCookieValue("IpAddress") + ") and not the visitorId?");
            sendEmailToYourself("Using Ip: " + ipAddress + " to try to find visitorId", "logPageHit(" + pageId + ")");
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        if (isNullorUndefined(successModel.VisitorId)) {
                            sendEmailToYourself("Trying to get VisitorId from Ip Address failed",
                                "Forced to call logVisitor(" + pageId + ").  IpAddress: " + ipAddress + " failed to return a visitorId ");
                            logVisitor(pageId, "failed GetVisitorIdFromIP");
                        }
                        else {
                            console.log("logPageHit how is it that I know the Ip and not the visitorId? (pre IpInfo) ");
                            setCookieValue("VisitorId", successModel.VisitorId);
                            if (getCookieValue("VisitorId") === successModel.VisitorId) {
                                //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                                sendEmailToYourself("Saved having to call LogVisitor from logPageHit", "Got visitorId from IP. IP: " + ipAddress + "  VisitorId: " + getCookieValue("VisitorId"));
                                logPageHit(pageId);
                            }
                        }
                    }
                    else {
                        sendEmailToYourself("GetVisitorIdFromIP ERROR", successModel.Success);
                        console.log("GetVisitorIdFromIP: " + successModel.Success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "logPageHit")) {
                        sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress +
                            " Message: " + errorMessage);
                    }
                    //sendEmailToYourself("GetVisitorIdFromIP XHR ERROR", getXHRErrorDetails(jqXHR, exception));
                    //console.log("GetVisitorIdFromIP jqXHR ERROR: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            var userName = getCookieValue("User");
            var visitorId = getCookieValue("VisitorId");
            //console.log("logging proper page hit.  ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
            //sendEmailToYourself("logging proper page hit", "ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
            console.log("logging proper page hit.  ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
            var pageHitModel = {
                VisitorId: visitorId,
                UserName: userName,
                AppName: "OggleBooble",
                IpAddress: ipAddress,
                PageId: pageId,
                Verbose: verbosity
            };

            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/PageHit/LogPageHit",
                data: pageHitModel,
                success: function (pageHitSuccessModel) {
                    //$('#footerMessage').html("");
                    if (pageHitSuccessModel.Success === "ok") {
                        if (pageHitSuccessModel.UserHits > freeVisitorHitsAllowed) {
                            alert("you hav now visited " + pageHitSuccessModel.UserHits + " pages." +
                                "\n It's time you Registered and logged in." +
                                "\n you will be placed in manditory comment mode until you log in ");
                        }

                        if (isNullorUndefined($('#headerMessage').html())) {
                            if (!isNullorUndefined(pageHitSuccessModel.WelcomeMessage)) {
                                $('#headerMessage').html(pageHitSuccessModel.WelcomeMessage);
                                console.log("headerMessage =  (pageHitSuccessModel.WelcomeMessage): " + pageHitSuccessModel.WelcomeMessage);
                            }
                            else {
                                //$('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                            }
                        }
                        else {
                            sendEmailToYourself("LogPageHit headerMessage is not empty", "$('#headerMessage').html(): " + $('#headerMessage').html());
                            console.log("headerMessage is not empty: " + $('#headerMessage').html());
                        }
                    }
                    else {
                        if (pageHitSuccessModel.Success.startsWith("ERROR: Violation of PRIMARY KEY")) {
                            sendEmailToYourself("ERROR: Violation of PRIMARY KEY: ", pageHitSuccessModel.Success);
                        }
                        else {
                            //console.log("OH MY GOD logPageHit: " + pageHitSuccessModel.Success);
                            sendEmailToYourself("OH MY GOD logPageHit error: ", pageHitSuccessModel.Success);
                        }
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage,"logPageHit")) {
                        sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/LogPageHit  pageId: " + pageId +
                            " Message: " + errorMessage);
                    }
                    // all logging needs to be hidden from users
                    //sendEmailToYourself("logPageHit error", getXHRErrorDetails(jqXHR, exception));
                    //console.log("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}

