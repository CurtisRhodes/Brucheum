// HITCOUNTER
var verbosity = 2;

// verbosity > 4 show new visits redirects
// verbosity > 5 visitior came back
//if ((ipAddress !== "68.203.90.183") && (ipAddress !== "50.62.160.105"))

function logImageHit(ipAddress, visitorId, link, pageId, isInitialHit) {
    //$('#footerMessage').html("logging image hit");

    if (isNullorUndefined(pageId)) {        
        sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "pageId: " + pageId + ". Set to 1");
        return;
    }
    if (isNullorUndefined(visitorId) || visitorId === "unknown") {
        if (verbosity > 4) {
            sendEmailToYourself("NOT SENT TO LOGVISITOR visitorId", "ERROR in logImageHit.  PageId: " + pageId + ". VisitorId: " + visitorId + ".  IpAddr: " + ipAddr);
        }
        //logVisitor(pageId, "logImageHit-PageId");
        return;
    }
    if (isNullorUndefined(ipAddress)) {
        if (verbosity > 4) {
            sendEmailToYourself("NO SENT TO LOGVISITOR ipAddress", "Problem in logImageHit.   PageId: " + pageId + ". VisitorId: " + visitorId + ".  IpAddr: " + ipAddr);
        }
        //logVisitor(pageId, "logImageHit-IpAddress");
        return;
    }
    //if (visitorId !== '9bd90468-e633-4ee2-af2a-8bbb8dd47ad1') 

    var linkId = link.substr(link.lastIndexOf("_") + 1, 36);
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
                //if (ipAddr !== "68.203.90.183")


                if (imageHitSuccessModel.Success.Contains("Duplicate entry")) {
                    sendEmailToYourself("logImageHit Duplicate entry", "utcDateTime: " + imageHitSuccessModel.HitDateTime);
                }
                else {
                    sendEmailToYourself("Some other Ajax fail in Hitcounter.js logImageHit",
                        "VisitorId: " + visitorId +
                        ".  utc: " + imageHitSuccessModel.HitDateTime +
                        ".  isInitialHit: " + isInitialHit +
                        ".  PageId: " + pageId +
                        "\n.  linkId: " + linkId +
                        //" imageHitSuccessModel.IpAddress: " + imageHitSuccessModel.IpAddress +
                        "\n.  ipAddr: " + ipAddr +
                        "\n.  Message: " + imageHitSuccessModel.Success);
                }
                //else {
                //    sendEmailToYourself("DOUBLE ajax fail in Hitcounter.js logImageHit", "PageId: " + pageId + " linkId: " + linkId +
                //        "\n ipAddr: " + getCookieValue("IpAddress") + " VisitorId: " + visitorId + " isInitialHit: " + isInitialHit + " Message: " + imageHitSuccessModel.Success);
                //}
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

function logVisitor(pageId, calledFrom) {
    try {
        //if (document.domain === 'localhost') {
        //    setCookieValue("IpAddress", "68.203.90.183");
        //    setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
        //    return;
        //}
        var ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            if (!isNullorUndefined(visitorId)) {
                if (verbosity > 1)
                    sendEmailToYourself("looping to logPageHit from logvisitor.", "IpAddress: " + ipAddress);
                if (document.domain === 'localhost') alert("xxxlooping to logPageHit from logvisitor. IpAddress: " + ipAddress);
                logPageHit(pageId);
                return;
            }
        }
        //else
        {
            if (verbosity > 10)
                sendEmailToYourself("LogVisitor call to IP info.", " ip: " + ipAddress);
            if (document.domain === 'localhost') alert("vb3 LogVisitor call to IP info. IpAddress: " + ipAddress);

            $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

                if (isNullorUndefined(data.ip)) {
                    sendEmailToYourself("IpInfo came back with no IpAddress.","setting IpAddress to '68.203.90.183'  Returning");
                    setCookieValue("IpAddress", "68.203.90.183");
                    return;
                }

                //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
                //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")
                var userName = getCookieValue("UserName");

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
                    url: settingsArray.ApiServer + "api/Visit/LogVisitor",
                    data: visitorModel,
                    success: function (visitorSuccess) {
                        if (visitorSuccess.Success === "ok") {

                            setCookieValue("IpAddress", data.ip);
                            setCookieValue("VisitorId", visitorSuccess.VisitorId);

                            if (getCookieValue("IpAddress" !== data.ip) || getCookieValue("VisitorId") !== visitorSuccess.VisitorId) {
                                sendEmailToYourself("COOKIE FAIL",
                                    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country +
                                    "\n data.ip: " + data.ip + " getCookieValue('IpAddress') " + getCookieValue("IpAddress") +
                                    "\n visitorSuccess.VisitorId: " + visitorSuccess.VisitorId + " getCookieValue('VisitorId') " + getCookieValue("VisitorId"));
                                //console.log("COOKIE FAIL.  " + getCookieValue("VisitorId") !== visitorSuccess.VisitorId);
                            }


                            //logVisitor(pageId, "reportClickEvent");


                            if (calledFrom === "reportClickEvent" ||
                                //calledFrom === "logPageHit FAIL. VisitorId" ||
                                calledFrom === "Entering slideshow" ||
                                calledFrom === "start slideshow") {

                                if (document.domain === 'localhost') {
                                    alert("LogVisitor called from [" + calledFrom + "]." +
                                        "\n Initial page: " + visitorSuccess.PageName + "  (" + pageId + ")" +
                                        ".\n ipAddress: " + data.ip +
                                        ".\n  visitorId : " + visitorSuccess.VisitorId);
                                }
                                if (verbosity > 1) {
                                    sendEmailToYourself("LogVisitor called from [" + calledFrom + "]",
                                        "IsNewVisitor: " + visitorSuccess.IsNewVisitor +
                                        ". Initial Page: [" + visitorSuccess.PageName + "] (" + pageId + ") " +
                                        ". IpAddress: " + data.ip +
                                        ". VisitorId : " + visitorSuccess.VisitorId);
                                }
                            }
                            else {
                                if (calledFrom !== "logPageHit FAIL. VisitorId") {
                                    sendEmailToYourself("LogVisit not caught ", "called from: " + calledFrom);
                                }
                            }

                            if (visitorSuccess.IsNewVisitor) {
                                //console.log("valid HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
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
                                        if (verbosity > 4)
                                            sendEmailToYourself("Someone new visited: " + visitorSuccess.PageName,
                                                " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                            }
                            else {
                                //console.log("Unnecessary HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                                if (!isNullorUndefined(userName)) {
                                    sendEmailToYourself("Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " + userName + " came back for another visit ",
                                        visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    if (verbosity > 11)
                                        sendEmailToYourself("Unnsecssary IpInfo hit called from: " + calledFrom,
                                            visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country +
                                            " Ip: " + data.ip + ", VisitorId: " + getCookieValue("VisitorId"));
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
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "logVisitor")) {
                            sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisitor", "api/HitCounter/LogVisitor" +
                                " Message: " + errorMessage);
                        }
                    }
                });
            });
        }
    } catch (e) {
        sendEmailToYourself("Error CAUGHT in Log Visistor", e);
    }
}

function logPageHit(pageId, visitorId, calledFrom) {

    if (isNullorUndefined(visitorId)) {
        var ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            if (document.domain === 'localhost') alert("how is it that I know the Ip (" + getCookieValue("IpAddress") + ") and not the visitorId?");
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/HitCounter/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        if (isNullorUndefined(successModel.VisitorId)) {
                            sendEmailToYourself("Trying to get VisitorId from Ip Address failed",
                                "Forced to call logVisitor(" + pageId + ").  IpAddress: " + ipAddress + " failed to return a visitorId ");
                            logVisitor(pageId, "failed GetVisitorIdFromIP");
                        }
                        else {
                            setCookieValue("VisitorId", successModel.VisitorId);
                            if (getCookieValue("VisitorId") === successModel.VisitorId) {
                                if (document.domain === 'localhost') {
                                    alert("Saved having to call LogVisitor from logPageHit. Got visitorId from IP: " + ipAddress + ". VisitorId: " + successModel.VisitorId);
                                    //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    if (verbosity > 1) {
                                        sendEmailToYourself("Found Viisitor Id from Ip: ", "used IpAddress: " + ipAddress + " to find visitorId: " +
                                            successModel.VisitorId + ". Calling logPageHit again");
                                    }
                                }
                                logPageHit(pageId, ipAddress, "inside after GetVisitorIdFromIP");
                            }
                            else {
                                if (document.domain === 'localhost') {
                                    alert("GetVisitorIdFromIP Failed" + ipAddress + ". VisitorId: " + successModel.VisitorId);
                                    //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    if (verbosity > 1) {
                                        sendEmailToYourself("GetVisitorIdFromIP Failed", "IpAddress: " + ipAddress + ". VisitorId: " + successModel.VisitorId);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        sendEmailToYourself("GetVisitorIdFromIP ERROR", successModel.Success);
                        //console.log("GetVisitorIdFromIP: " + successModel.Success);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (isNullorUndefined(errorMessage)) {
                        if (document.domain === 'localhost')
                            alert("getXHRErrorDetails(jqXHR) returned empty error message");
                        return;
                    }
                    if (document.domain === 'localhost')
                        alert("XHR ERROR IN HITCOUNTER.JS logPageHit " + errorMessage);

                    if (!checkFor404(errorMessage, "GetVisitorIdFromIP")) {
                        sendEmailToYourself("Some other XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress +
                            " Message: " + errorMessage);
                        if (document.domain === 'localhost')
                            alert("Some other XHR ERROR IN HITCOUNTER.JS logPageHit " + errorMessage);
                    }
                    //sendEmailToYourself("GetVisitorIdFromIP XHR ERROR", getXHRErrorDetails(jqXHR, exception));
                    //console.log("GetVisitorIdFromIP jqXHR ERROR: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            if (document.domain === 'localhost') alert("logPageHit fail. no VisitorId. \nlooping to log visitor");
            logVisitor(pageId, "logPageHit FAIL. VisitorId");
        }
        return;
    }

    //sendEmailToYourself("logging proper page hit", "ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
    var pageHitModel = {
        VisitorId: visitorId,
        AppName: "OggleBooble",
        PageId: pageId
    };
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/HitCounter/LogPageHit",
        data: pageHitModel,
        success: function (pageHitSuccessModel) {
            if (pageHitSuccessModel.Success === "ok") {
                if (pageHitSuccessModel.UserHits > freeVisitorHitsAllowed) {
                    alert("you have now visited " + pageHitSuccessModel.UserHits + " pages." +
                        "\n It's time you Registered and logged in." +
                        "\n you will be placed in manditory comment mode until you log in ");
                }

                if (!isNullorUndefined(pageHitSuccessModel.WelcomeMessage)) 
                    $('#headerMessage').html(pageHitSuccessModel.WelcomeMessage);                
                else
                    $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
            
                if (verbosity > 11) {
                    if (pageHitSuccessModel.RootFolder !== "playboy") {
                        var ipAddress = getCookieValue("IpAddress");
                        sendEmailToYourself(pageHitSuccessModel.PageName + " visited",
                            "Someone visited a page other than playboy: " + pageHitSuccessModel.ParentName + "/" + pageHitSuccessModel.PageName +
                            " Called from " + calledFrom + " IpAddress: " + ipAddress + ". RootFolder: " + pageHitSuccessModel.RootFolder);
                    }
                }
            }
            else {
                if (pageHitSuccessModel.Success.startsWith("ERROR: Violation of PRIMARY KEY")) {
                    sendEmailToYourself("logPageHit error: Violation of PRIMARY KEY: ", pageHitSuccessModel.Success);
                    return;
                }
                if (pageHitSuccessModel.Success.Contains("VisitorId fail")) {
                    sendEmailToYourself("logPageHit error: VisitorId fail: ","VisitorId: "+ pageHitSuccessModel.Success);
                    return;
                }
                sendEmailToYourself("logPageHit error: ", "Message: " + pageHitSuccessModel.Success);

                alert("logPageHit" + pageHitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (errorMessage.Contains("Requested page not found")) {
                if (document.domain === 'localhost')
                    alert("Requested page not found  : " + pageId);
            }

            if (!checkFor404(errorMessage, "logPageHit")) {
                sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/LogPageHit  pageId: " + pageId +
                    " Message: " + errorMessage);
            }
            // all logging needs to be hidden from users
            //sendEmailToYourself("logPageHit error", getXHRErrorDetails(jqXHR, exception));
            //console.log("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}


