// HITCOUNTER
var verbosity = 1;

// verbosity > 4 show new visits redirects
// verbosity > 5 visitior came back
//if ((ipAddress !== "68.203.90.183") && (ipAddress !== "50.62.160.105"))
//if (document.domain === 'localhost')

function logImageHit(ipAddress, visitorId, link, pageId, isInitialHit) {
    //$('#footerMessage').html("logging image hit");

    if (isNullorUndefined(pageId)) {        
        sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "pageId: " + pageId + ". Set to 1");
        return;
    }
    if (isNullorUndefined(visitorId) || visitorId === "unknown") {
        if (verbosity > 1) {
            sendEmailToYourself("NOT SENT TO LOGVISITOR visitorId", "ERROR in logImageHit.  PageId: " + pageId + ". VisitorId: " + visitorId + ".  IpAddr: " + ipAddr);
        }
        //logVisitor(pageId, "logImageHit-PageId");
        return;
    }
    if (isNullorUndefined(ipAddress)) {
        if (verbosity > 1) {
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

                if (verbosity > 10) {
                    sendEmailToYourself("logImageHit SUCCESS",
                        "IpAddress: " + imageHitSuccessModel.IpAddress + "<br/>imageHits: " + imageHits + "<br/>user hits: " + userHits + "<br/>initialHit: " + isInitialHit);
                    if (document.domain === 'localhost')
                        alert("logImageHit SUCCESS pageName:" + imageHitSuccessModel.Success +
                            "\nIpAddress: " + imageHitSuccessModel.IpAddress + "\nimageHits: " + imageHits + "\nuser hits: " + userHits + "\ninitialHit: " + isInitialHit);
                }
            }
            else {
                if (imageHitSuccessModel.Success.Contains("Duplicate entry")) {
                    sendEmailToYourself("logImageHit Duplicate entry", "utcDateTime: " + imageHitSuccessModel.HitDateTime);
                    if (document.domain === 'localhost')
                        alert("logImageHit Duplicate entry\nutcDateTime: " + imageHitSuccessModel.HitDateTime);
                }
                else {
                    sendEmailToYourself("Some other Ajax fail in Hitcounter.js logImageHit",
                        "VisitorId: " + visitorId +
                        ".<br/>utc: " + imageHitSuccessModel.HitDateTime +
                        ".<br/>isInitialHit: " + isInitialHit +
                        ".<br/>PageId: " + pageId +
                        "\n.<br/>linkId: " + linkId +
                        //" imageHitSuccessModel.IpAddress: " + imageHitSuccessModel.IpAddress +
                        "\n.<br/>ipAddr: " + ipAddr +
                        "\n.<br/>Message: " + imageHitSuccessModel.Success);
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

        var ipAddress = getCookieValue("IpAddress");

        if (!isNullorUndefined(ipAddress)) {
            if (!isNullorUndefined(visitorId)) {
                if (calledFrom === "reportThenPerformEvent") {
                    sendEmailToYourself("logVisitor  called from reportThenPerformEvent ", "IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId);
                    return;
                }
                if (calledFrom === "logPageHit") {
                    if (verbosity > 0)
                        sendEmailToYourself("looping back to logPageHit from logvisitor.", "IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId + "<br/>PageId: " + pageId);
                    logPageHit(pageId);
                    return;
                }
                if (calledFrom === "startSlideshow") {
                    sendEmailToYourself("logVisitor called from startSlideshow", "IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId);
                    return;
                }
            }
        }

        //if (document.domain === 'localhost') alert("vb3 LogVisitor call to IP info. IpAddress: " + ipAddress);
        if (verbosity > 10) sendEmailToYourself("LogVisitor call to IP info is happening.", " ip: " + ipAddress);
        
        $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

            if (isNullorUndefined(data.ip)) {
                sendEmailToYourself("IpInfo came back with no IpAddress.", "setting IpAddress to '68.203.90.183'  Returning");
                setCookieValue("IpAddress", "000.000");
                return;
            }

            //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
            //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")

            //var userName = getCookieValue("UserName");

            var visitorModel = {
                PageId: pageId,
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
                                visitorSuccess.PageName + " hit " +
                                "<br/>from " + data.city + "," + data.region + " " + data.country +
                                "<br/> data.ip: " + data.ip + " getCookieValue('IpAddress') " + getCookieValue("IpAddress") +
                                "<br/> visitorSuccess.VisitorId: " + visitorSuccess.VisitorId +
                                "<br/> getCookieValue('VisitorId') " + getCookieValue("VisitorId"));
                            //console.log("COOKIE FAIL.  " + getCookieValue("VisitorId") !== visitorSuccess.VisitorId);
                        }

                        if (isNullorUndefined(visitorSuccess.PageName)) {
                            sendEmailToYourself("PageName not found in LogVisitor for PageId:" + pageId, "this sucks");
                        }
                        if (verbosity > 1) {

                            if (calledFrom === "logPageHit FAIL. VisitorId") {
                                if (visitorSuccess.IsNewVisitor) {
                                    sendEmailToYourself("New Visitor called from logPageHit",
                                        "PageId: " + pageId + "  visitorSuccess.PageName: " + visitorSuccess.PageName +
                                        "<br/> hit from " + data.city + "," + data.region + " " + data.country +
                                        " Ip: " + data.ip + "<br/>getCookieValue('VisitorId'): " + getCookieValue("VisitorId"));
                                }
                                else {
                                    sendEmailToYourself("Unnsecssary IpInfo hit called from logPageHit",
                                        "PageId: " + pageId + "  visitorSuccess.PageName: " + visitorSuccess.PageName +
                                        "<br/> hit from " + data.city + "," + data.region + " " + data.country +
                                        " Ip: " + data.ip + "<br/>getCookieValue('VisitorId'): " + getCookieValue("VisitorId"));
                                }
                            }
                            else {
                                alert("called from: " + calledFrom + "\n\nIP: " + data.ip);
                                //alert("cookie fail\nIP: " + data.ip);


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

                            var userName = getCookieValue("UserName");
                            //if (calledFrom === "reportThenPerformEvent") {
                            if (document.domain === 'localhost') alert("LogVisitor calledFrom: " + calledFrom + "userName: " + userName);
                          


                            var userName = getCookieValue("UserName");
                            if (!isNullorUndefined(userName)) {
                                sendEmailToYourself("Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " + userName + " came back for another visit ",
                                    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                            }
                            else {
                                if (verbosity > 10)
                                    sendEmailToYourself("Unnsecssary IpInfo hit called from: " + calledFrom,
                                        visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country +
                                        " Ip: " + data.ip + ", VisitorId: " + getCookieValue("VisitorId"));
                            }
                        }

                        $('#footerMessage').html("");
                        if (visitorSuccess.WelcomeMessage !== "") {
                            $('#headerMessage').html(visitorSuccess.WelcomeMessage);
                        }
                        if (verbosity > 30) {
                            sendEmailToYourself("Success in logVisitor ", "Just so you know this happens too, not just the pk violation.");
                        }
                    }
                    else {
                        sendEmailToYourself("Ajax Error in logVisitor ", "PageId: " + pageId + "<br/>" + visitorSuccess.Success);
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

    } catch (e) {
        sendEmailToYourself("Error CAUGHT in Log Visistor", e);
    }
}

function logPageHit(pageId) {
    //alert("logPageHit(" + pageId + "," + visitorId + "," + calledFrom + ")");
    if (isNullorUndefined(pageId)) {
        sendEmailToYourself("PageId undefined in LogPageHit.", "visitorId: " + visitorId);
        return;
    }
    if (document.domain === 'XXlocalhost') {
        setCookieValue("IpAddress", "68.203.90.183");
        setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
        //setCookieValue("UserName", "admin");
        setCookieValue("UserName", "cooler");
        console.log("bypassing logVisitor");
        $('#spnUserName').html(getCookieValue("UserName"));
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
        return;
    }

    // TRY GETVISITOR FROM IP IF YOU HAVE IP BUT NO VISITOR ID 

    var visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId)) {
        var ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            //if (document.domain === 'localhost') alert("how is it that I know the Ip (" + getCookieValue("IpAddress") + ") and not the visitorId?");
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
                                //if (document.domain === 'localhost') alert("Saved having to call LogVisitor from logPageHit. Got visitorId from IP: " + ipAddress + ". VisitorId: " + successModel.VisitorId);
                                //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                                if (verbosity > 1) {
                                    sendEmailToYourself("Found Viisitor Id from Ip: ", "used IpAddress: " + ipAddress + " to find visitorId: " +
                                        successModel.VisitorId + ". Calling logPageHit again");
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
                        sendEmailToYourself("GetVisitorIdFromIP Fail", "ipAddress: " + ipAddress + "<br/>" + successModel.Success);
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
            //if (document.domain === 'localhost') alert("logPageHit fail.\n no VisitorId and no IpAddress. \nAre you robot");
            if (verbosity > 1)
                sendEmailToYourself("no VisitorId and no IpAddress in logPageHit", "Calling LogVisitor");
            //    if (window.confirm("I am not a robot")) {
            //        alert("Please Register or Login");
            //    }
            //    else
            //        alert("Please Register or Login");
            //    window.location.href = "/";
            logVisitor(pageId, "logPageHit");
            return;
        }
    }

    // LOGGING PROPER PAGE HIT
    var pageHitModel = {
        VisitorId: visitorId,
        PageId: pageId
    };
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/HitCounter/LogPageHit",
        data: pageHitModel,
        success: function (pageHitSuccessModel) {
            if (pageHitSuccessModel.Success === "ok") {
                // MOVE PAGE HITS TO FOOTER SOMEDAY

                // login and I will let you see 1000 more images.
                // bookmark my site with link oog?domain=122; to get another 1,000 image views.
                // put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
                // use my product
                // Request extra privdleges 
                // pay me to do some programming for you and I'll let you in on all my source code

                // ADD FREE VISITS ALLOWED CLIPPER HERE
                if (pageHitSuccessModel.UserHits > freeVisitorHitsAllowed) {
                    alert("you have now visited " + pageHitSuccessModel.UserHits + " pages." +
                        "\n It's time you Registered and logged in." +
                        "\n you will be placed in manditory comment mode until you log in ");
                }

                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits.toLocaleString());
                if (verbosity > 11) {
                    sendEmailToYourself("Just so you know; valid page hits are being recorded.",
                        "Someone visited a page other than playboy: " + pageHitSuccessModel.ParentName + "/" + pageHitSuccessModel.PageName +
                        "<br/> Called from " + calledFrom + "<br/>IpAddress: " + getCookieValue("IpAddress") + ".<br/>RootFolder: " + pageHitSuccessModel.RootFolder);
                }
                // LOG VISIT
                logVisit(visitorId);
            }
            else {
                if (pageHitSuccessModel.Success.startsWith("ERROR: Duplicate entry")) {
                    //sendEmailToYourself("logPageHit Duplicate entry", "could be a double hit" +
                    //    "<br/>IpAddress: " + getCookieValue("IpAddress") +
                    //    "<br/>pageId: " + pageId + "<br/>" + pageHitSuccessModel.Success +
                    //    "<br/>ver: 12.6");
                    //return;
                }
                else {
                    sendEmailToYourself("logPageHit error", "IpAddress: " + getCookieValue("IpAddress") +
                        "<br/>pageId: " + pageId + "<br/>" + pageHitSuccessModel.Success);
                }
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

function logVisit(visitorId) {

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Visit/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    if (verbosity > 3)
                        sendEmailToYourself("Visit Added ", "visitorId: " + visitorId);
                    if (document.domain === 'localhost') alert("Visit Added ", "visitorId: " + visitorId);
                }
            }
            else {
                sendEmailToYourself("Ajax Error in logVisit", "PageId: " + pageId + "<br/>Message: " + logVisitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logVisit")) {
                sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisit",
                    "api/HitCounter/LogVisit?visitorId=" + visitorId +
                    "<br/>" + errorMessage);
            }
        }
    });
}


function reportThenPerformEvent(eventCode, calledFrom, eventDetail) {
    try {
        //alert("reportThenPerformEvent(eventCode: " + eventCode + ", calledFrom: " + calledFrom + ", eventDetail: " + eventDetail);
        var visitorId = getCookieValue("VisitorId");
        var ipAddress = getCookieValue("IpAddress");

        //if (isNullorUndefined(ipAddress)) alert("who ate you");
        if (isNullorUndefined(visitorId)) {
            if (document.domain === 'localhost') {
                alert("Who Are You? \nVisitorId: " + visitorId + " Ip: " + ipAddress, "Calling LogVisitor.  Event: " + eventCode + " calledFrom: " + calledFrom);
            }
            else
                sendEmailToYourself("In reportThenPerformEvent VisitorId: " + visitorId + " Ip: " + ipAddress,
                    "Calling LogVisitor.  Event: " + eventCode + " calledFrom: " + calledFrom);

            logVisitor(calledFrom, "reportThenPerformEvent");
        }


        var logEventModel = {
            VisitorId: visitorId,
            EventCode: eventCode,
            EventDetail: eventDetail,
            CalledFrom: calledFrom
        };

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/EventLog/LogEventActivity",
            data: logEventModel,
            success: function (logEventActivitySuccess) {
                if (logEventActivitySuccess.Success === "ok") {

                    if (eventCode === "PRN") {
                        //  setUserPornStatus(pornType);
                    }
                    if (ipAddress !== "68.203.90.183") {
                        if (eventCode !== "CIC"     // Carousel Item Clicked 
                            //&& eventCode !== "FLC"  // Footer Link Clicked 
                            && eventCode !== "BAC"  // Archive Clicked
                            && eventCode !== "SUB"  // Subfolder Clicked
                            && eventCode !== "BCC"  // Breadcrumb Clicked 
                            && eventCode !== "BLC"  // Banner Link Clicked 
                            && eventCode !== "LMC"  // Left Menu Item Clicked
                            && eventCode !== "HBX"  // Home Breadcrumb clicked
                            && eventCode !== "CAA"  // Carousel Arrow Clicked
                            && eventCode !== "HBC") // Home Icon Clicked
                        {

                            if (document.domain === 'localhost') {
                                alert(logEventActivitySuccess.EventName + " {" + eventCode + "}" +
                                    "\ncalledFrom: {" + calledFrom + "} : " + logEventActivitySuccess.CalledFrom +
                                    "\neventDetail: {" + eventDetail + "} : " + logEventActivitySuccess.PageBeingCalled +
                                    "\nIp: " + ipAddress + ", from " + logEventActivitySuccess.VisitorDetails);
                            }
                            else {
                                sendEmailToYourself(logEventActivitySuccess.EventName + " {" + eventCode + "}",
                                    "calledFrom: {" + calledFrom + "} : " + logEventActivitySuccess.CalledFrom +
                                    "<br/>eventDetail: {" + eventDetail + "} : " + logEventActivitySuccess.PageBeingCalled +
                                    "<br/>from: " + ipAddress + ", " + logEventActivitySuccess.VisitorDetails);
                            }
                        }
                    }
                    // NOW PERFORM EVENT
                    switch (eventCode) {



                        case "PRN":  //("Porn Option clicked");
                            window.location.href = '/index.html?subdomain=porn';
                            break;
                        case "HBC":  //  Red ballon clicked
                            if (eventDetail === 3909) {
                                //alert("cocksucker lips clicked");
                                window.location.href = '/index.html?subdomain=porn';
                            }
                            else {

                                window.location.href = "/";
                            }
                            break;
                        case "GAX":  // can I get a connection
                            alert("can I get a connection");
                            //window.location.href = ".";
                            break;
                        case "GIC": // Gallery Item Clicked

                            break;
                        case "CMC": // carousle context menu item clicked
                            break;
                        case "CAA": // carousle context menu item clicked
                            if (direction === "foward")
                                resume();
                            else {
                                // pop
                                imageHistory.pop();
                                imageIndex = imageHistory.pop();
                                if (imageIndex > 0) {
                                    $('#categoryTitle').fadeOut(intervalSpeed);
                                    $('#laCarousel').fadeOut(intervalSpeed, "linear", function () {
                                        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
                                        $('#categoryTitle').html(carouselItemArray[imageIndex].FolderPath + ": " + carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);
                                        $('#laCarousel').fadeIn(intervalSpeed);
                                        resizeCarousel();
                                    });
                                }
                                else
                                    alert("imageIndex: " + imageIndex);
                            }
                            break;
                        case "CXM":  // carousle context menu opened
                            break;
                        case "EXP":
                            window.open(eventDetail, "_blank");
                            break;
                        case "SSB":  //  Stepchild Subfolder Clicked
                            window.open("/album.html?folder=" + eventDetail, "_blank");
                            break;
                        case "CPC":
                        case 'SUB': // 'Sub Folder Click'
                        case "CIC":  // carousel image clicked
                        case "BCC":  // Breadcrumb Clicked
                        case "BLC":  // banner link clicked
                        case "SEE":  // see more of her
                        case "BAC":  // Babes Archive Clicked
                            window.location.href = "/album.html?folder=" + eventDetail;
                            break;
                        case "CMX":
                            showModelInfoDialog(eventDetail, calledFrom, 'Images/redballon.png');
                            //reportThenPerformEvent("CMX", folderId, folderName);
                            break;
                        case "HBX":  // Home breadcrumb Clicked
                            if (eventDetail === "porn")
                                window.location.href = '/index.html?subdomain=porn';
                            else
                                window.location.href = "/";
                            break;
                        case "RNK":  // Ranker Banner Clicked
                            window.location.href = "/Ranker.html?subdomain=" + eventDetail;
                            break;
                        case "LMC":  // Left Menu Clicked
                            switch (eventDetail) {
                                case "transitions":
                                    window.location.href = 'transitions.html';
                                    break;
                                case "ranker":
                                    window.location.href = 'ranker.html';
                                    break;
                                case "dirTreeBoobs": //  Category List
                                    showCatListDialog(2);
                                    break;
                                case "explain": // Let me Explain
                                    showCustomMessage(38);
                                    break;
                                case "centerfolds":  // Playboy Centerfolds
                                    window.location.href = '/album.html?folder=1132';
                                    break;
                                case "video":  // Video
                                    window.location.href = 'video.html';
                                    break;
                                case "blog":
                                    window.location.href = '/Blog.html';
                                    break;
                                default:
                                    alert("uncaught switch option Left Menu Click: " + eventDetail);
                                    break;
                            }
                            break;

                        case "FLC":  //  footer link clicked
                            //if (document.domain === 'localhost') alert("eventCode: " + eventCode + " pageId: " + pageId);
                            switch (eventDetail) {
                                case "about us": showCustomMessage(38); break;
                                case "dir tree": showCatListDialog(2); break;
                                case "porn dir tree": showCatListDialog(242); break;
                                case "playmate dir tree": showCatListDialog(472); break;
                                case "porn": window.location.href = '/index.html?subdomain=porn'; break;
                                case "blog": window.location.href = '/Blog.html'; break;
                                case "ranker": window.location.href = "/Ranker.html"; break;
                                case "rejects": window.location.href = "/album.html?folder=1132"; break;
                                case "centerfolds": window.location.href = "/album.html?folder=1132"; break;
                                case "cybergirls": window.location.href = "/album.html?folder=3796"; break;
                                case "extras": window.location.href = "/album.html?folder=2601"; break;
                                case "magazine covers": window.location.href = "/album.html?folder=1986"; break;
                                case "archive": window.location.href = "/album.html?folder=3"; break;
                                case "videos": window.location.href = 'video.html'; break;
                                case "mailme": window.location.href = 'mailto:curtishrhodes@hotmail.com'; break;
                                case "freedback": showFeedbackDialog(); break;
                                case "slut archive": window.location.href = "/album.html?folder=440"; break;
                                default: alert("eventDetail: " + eventDetail); break;
                            }
                            break;
                        default:
                            alert("eventCode " + eventCode + "  not handled in reportThenPerformEvent");
                    }
                }
                else {
                    sendEmailToYourself("LogEventActivity fail", "Called from PageId: " + calledFrom +
                        "<br/>EventCode: " + eventCode +
                        "<br/>eventDetail: " + eventDetail +
                        "<br/>VisitorId: " + visitorId +
                        "<br/>Message: " + logEventActivitySuccess.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                //               alert("xhr error in common.js logActivity : " + errorMessage);
                if (!checkFor404(errorMessage, "reportThenPerformEvent")) {
                    var ipAddr = getCookieValue("IpAddress");
                    if (ipAddr === "68.203.90.183") {
                        alert("xhr error in reportThenPerformEvent\n url:/api/ChangeLog/LogEventActivity?eventCode=" + eventCode +
                            "\ncalled from pageId=" + calledFrom + "\nIp: " + ipAddr + "\nMessage: " + errorMessage);
                    }
                    else {
                        sendEmailToYourself("xhr error in reportThenPerformEvent", "url:/api/ChangeLog/LogEventActivity?eventCode=" + eventCode +
                            "<br/>called from pageId: " + calledFrom +
                            "<br/>Ip: " + ipAddr +
                            "<br/>Message: " + errorMessage);
                    }
                }
            }
        });
    } catch (e) {
        sendEmailToYourself("Catch Error in OggleEvenLog()", "eventCode: " + eventCode +
            "<br/>called from pageId: " + calledFrom +
            "<br/>eventDetail: " + eventDetail +
            "<br/>VisitorId: " + visitorId +
            "<br/>Message: " + e);
        if (document.domain === 'localhost') {
            alert("reportThenPerformEvent Catch Error: " + e);
        }
    }
}





