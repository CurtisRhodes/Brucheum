﻿var userPageHits;
var freePageHitsAllowed = 500;
var freeImageHitsAllowed = 2500;
var userImageHits;

//<script src="https://www.google.com/recaptcha/api.js" async defer></script>
  //  <div class="g-recaptcha" data-sitekey="6LfaZzEUAAAAAMbgdAUmSHAHzv-dQaBAMYkR4h8L"></div>

function logImageHit(ipAddress, visitorId, link, pageId, isInitialHit) {
    //$('#footerMessage').html("logging image hit");
    //alert("logImageHit");
    if (isNullorUndefined(pageId)) {        
        logError({
            VisitorId: visitorId,
            ActivityCode: "CDE",
            Severity: 2,
            ErrorMessage: "TROUBLE in logImageHit. PageId came in Null or Undefined",
            CalledFrom: "HitCounter.js logImageHit"
        });
        sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "Set to 1 or  something");
        return;
    }
    if (isNullorUndefined(visitorId) || visitorId === "unknown") {
        logError({
            VisitorId: "",
            ActivityCode: "CDE",
            Severity: 2,
            ErrorMessage: "visitorId NOT SENT TO logImageHit. Sending to LogVisitor. PageId: " + pageId + " IpAddr: " + ipAddr,
            CalledFrom: "HitCounter.js logImageHit"
        });

        if (verbosity > 0) {
            sendEmailToYourself("visitorId NOT SENT TO logImageHit", "Sending to LogVisitor. <br/> PageId: " + pageId + "<br/>IpAddr: " + ipAddr);
        }
        logVisitor(pageId, "logImageHit-PageId");
        return;
    }
    if (isNullorUndefined(ipAddress)) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "CDE",
            Severity: 5,
            ErrorMessage: "NO ipAddress SENT TO logImageHit (not that I'm using it).   PageId: " + pageId + ".  IpAddr: " + ipAddr,
            CalledFrom: "HitCounter.js logImageHit"
        });
        //if (verbosity > 0) {
        //    sendEmailToYourself("NO ipAddress SENT TO logImageHit", "(not that I'm using it).   PageId: " + pageId + ". VisitorId: " + visitorId + ".  IpAddr: " + ipAddr);
        //}
        //logVisitor(pageId, "logImageHit-IpAddress");
        //return;
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

                userPageHits = imageHitSuccessModel.UserPageHits;
                userImageHits = imageHitSuccessModel.UserImageHits;
                checkForHitLimit("images", pageId);

                //if (verbosity > 20) {
                //    if (document.domain === 'localhost')
                //        alert("logImageHit  \npageName:" + pageId + "\nIpAddress: " + ipAddress + "\nimageHits: " + imageHitSuccessModel.ImageHits +
                //            "\nuser hits: " + imageHitSuccessModel.UserHits + "\ninitialHit: " + isInitialHit);
                //    else
                //        sendEmailToYourself("Image Hit", "PageId: " + pageId +
                //            "<br/>IpAddress: " + ipAddress +
                //            "<br/>imageHits: " + imageHitSuccessModel.ImageHits +
                //            "<br/>user hits: " + imageHitSuccessModel.UserHits +
                //            "<br/>initialHit: " + isInitialHit);
                //}
            }
            else {
                if (imageHitSuccessModel.Success.Contains("Duplicate entry")) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "CDE",
                        Severity: 2,
                        ErrorMessage: "logImageHit Duplicate entry",
                        CalledFrom: "HitCounter.js logImageHit"
                    });
                    //sendEmailToYourself("logImageHit Duplicate entry", "utcDateTime: " + imageHitSuccessModel.HitDateTime);
                    if (document.domain === 'localhost')
                        alert("logImageHit Duplicate entry\nutcDateTime: " + imageHitSuccessModel.HitDateTime);
                }
                else {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "CDE",
                        Severity: 2,
                        ErrorMessage: "Some other Ajax fail in Hitcounter.js logImageHit"+
                            " utc: " + imageHitSuccessModel.HitDateTime +
                            " isInitialHit: " + isInitialHit +
                            " PageId: " + pageId +
                            " linkId: " + linkId +
                            " ipAddr: " + ipAddr +
                            " Message: " + imageHitSuccessModel.Success,
                        CalledFrom: "HitCounter.js logImageHit"
                    });
                    //sendEmailToYourself("Some other Ajax fail in Hitcounter.js logImageHit",
                    //    "VisitorId: " + visitorId +
                    //    ".<br/>utc: " + imageHitSuccessModel.HitDateTime +
                    //    ".<br/>isInitialHit: " + isInitialHit +
                    //    ".<br/>PageId: " + pageId +
                    //    ".<br/>linkId: " + linkId +
                    //    ".<br/>ipAddr: " + ipAddr +
                    //    ".<br/>Message: " + imageHitSuccessModel.Success);
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
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "HitCounter.js logImageHit"
                });
                //if (errorMessage.includes("Requested page not found")) {
                //    sendEmailToYourself("XHR ERROR Requested page not found in logImageHit",
                //        "api/ImageHit/LogImageHit?visitorId=" + visitorId +
                //        ",<br/>pageId: " + pageId +
                //        "<br/>isInitialHit: " + isInitialHit +
                //        ",<br/> linkId=" + link +
                //        ",<br/>Message: " + errorMessage);
                //} else {
                //    if (!checkFor404(errorMessage, "logImageHit")) {
                //        sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logImageHit",
                //            "api/ImageHit/LogImageHit?visitorId=" + visitorId +
                //            ",<br/>pageId: " + pageId +
                //            "<br/>isInitialHit: " + isInitialHit +
                //            ",<br/> linkId=" + link +
                //            ",<br/>Message: " + errorMessage);
                //    }
                //}
            }
        }
    });
}

function logVisitor(pageId, calledFrom) {
    try {
        var ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            //if (verbosity > 2) {
            //    sendEmailToYourself("calling logVisitor but I already know IP",
            //        "called from: " + calledFrom +
            //        "<br/>Ip: " + ipAddress +
            //        "<br/>vid: " + getCookieValue("VisitorId") +
            //        "<br/>Page Id: " + pageId + "<br/>return");
            //}

            var visitorId = getCookieValue("VisitorId");
            if (!isNullorUndefined(visitorId)) {
                // getvisitorId from ip
                setCookieValue("VisitorId", visitorSuccess.VisitorId);
            }
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CDE",
                Severity: 2,
                ErrorMessage: "calling logVisitor but I already know IP",
                CalledFrom: "logVisitor/" + calledFrom
            });
            return;
        }

        //if (document.domain === 'localhost') alert("vb3 LogVisitor call to IP info. IpAddress: " + ipAddress);
        if (verbosity > 10) {
            //if (document.domain === 'localhost') alert("vb3 LogVisitor call to IP info. IpAddress: " + ipAddress);
            logEventActivity({
                VisitorId: "",
                EventCode: "VIS",
                EventDetail: "LogVisitor call to IP info is happening. ip: " + ipAddress,
                CalledFrom: "HitCounter.js logVisit"
            });
            //sendEmailToYourself("LogVisitor call to IP info is happening.", " ip: " + ipAddress);
        }
        
        $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

            if (isNullorUndefined(data.ip)) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "CDE",
                    Severity: 1,
                    ErrorMessage: "IpInfo came back with no IpAddress. Ssetting IpAddress to '68.203.90.183'  Returning",
                    CalledFrom: "HitCounter.js logVisitor"
                });
                //sendEmailToYourself("IpInfo came back with no IpAddress.", "setting IpAddress to '68.203.90.183'  Returning");
                setCookieValue("IpAddress", "000.000");
                return;
            }

            //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
            //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")

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

                            logError({
                                VisitorId: visitorSuccess.VisitorId,
                                ActivityCode: "KOO",
                                Severity: 2,
                                ErrorMessage: "COOKIE FAIL",
                                CalledFrom: "HitCounter.js logVisitor"
                            });
                            //sendEmailToYourself("COOKIE FAIL",
                            //    visitorSuccess.PageName + " hit " +
                            //    "<br/>from " + data.city + "," + data.region + " " + data.country +
                            //    "<br/> data.ip: " + data.ip + " getCookieValue('IpAddress') " + getCookieValue("IpAddress") +
                            //    "<br/> visitorSuccess.VisitorId: " + visitorSuccess.VisitorId +
                            //    "<br/> getCookieValue('VisitorId') " + getCookieValue("VisitorId"));
                            //console.log("COOKIE FAIL.  " + getCookieValue("VisitorId") !== visitorSuccess.VisitorId);
                        }

                        if (isNullorUndefined(visitorSuccess.PageName)) {
                            logError({
                                VisitorId: visitorSuccess.VisitorId,
                                ActivityCode: "UNK",
                                Severity: 2,
                                ErrorMessage: "PageName not found in LogVisitor for PageId: " + pageId,
                                CalledFrom: "HitCounter.js logVisitor"
                            });
                            //sendEmailToYourself("PageName not found in LogVisitor for PageId:" + pageId, "this sucks");
                        }


                        if (calledFrom === "reportThenPerformEvent") {
                            if (verbosity > 4) {
                                logError({
                                    VisitorId: visitorSuccess.VisitorId,
                                    ActivityCode: "UNK",
                                    Severity: 2,
                                    ErrorMessage: "logVisitor called from reportThenPerformEvent IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId,
                                    CalledFrom: "HitCounter.js/reportThenPerformEvent"
                                });
                                //sendEmailToYourself("logVisitor called from reportThenPerformEvent ", "IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId);
                            }
                            return;

                        }
                        if (calledFrom === "logPageHit") {
                            //if (verbosity > 5)
                            logError({
                                VisitorId: visitorSuccess.VisitorId,
                                ActivityCode: "CDE",
                                Severity: 2,
                                ErrorMessage: "looping back to logPageHit from logvisitor. IpAddress: " + ipAddress + " PageId: " + pageId,
                                CalledFrom: "HitCounter.js/logPageHit"
                            });

                            //    sendEmailToYourself("looping back to logPageHit from logvisitor.", "IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId + "<br/>PageId: " + pageId);

                            //logPageHit(pageId);

                            return;
                        }
                        if (calledFrom === "launch viewer") {
                            //launchViewer(imageArray, imageIndex, folderId, folderName)
                            //--sendEmailToYourself("logVisitor called from startSlideshow", "IpAddress: " + ipAddress + "<br/>viditorId: " + visitorId);
                            //return;
                        }

                        //sendEmailToYourself("get IpInfo hit for " + visitorStatus,
                        //    "called from " + calledFrom +
                        //    "<br/>" + data.ip + " from " + data.city + "," + data.region + " " + data.country +
                        //    "<br/>PageId: " + pageId + "  PageName: " + visitorSuccess.PageName);

                        if (visitorSuccess.IsNewVisitor) {
                            //console.log("valid HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                            //if (verbosity > 4)
                            {
                                switch (pageId) {
                                    case 1942: // Jennifer Lyn Jackson
                                        sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 1989",
                                            " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=626';
                                        break;
                                    case 1555: // Donna Derrico
                                        sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 1995",
                                            " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=633';
                                        break;
                                    case 1516: // Henriette Allais
                                    case 1520: // Teri Peterson 
                                    case 1524: // Jeana Tomasino
                                    case 1547: // Melissa Holliday 
                                        sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 1980",
                                            " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=616';
                                        break;
                                    case 1479: // Lauren Michelle Hill
                                        sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 2001",
                                            " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=643';
                                        break;
                                    case 1374: // Regina Deutinger
                                        sendEmailToYourself("New visitor to " + visitorSuccess.PageName + " redirected to 2008",
                                            " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=650';
                                        break;
                                    case 1947: // Karin and Mirjam Van Breeschooten
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
                                        logEventActivity({
                                            VisitorId: visitorSuccess.VisitorId,
                                            EventCode: "NEW",
                                            EventDetail: "Redirecting new visitor from " + visitorSuccess.PageName + " to Biggest Breasted Centerfolds" +
                                                " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip + " VisitorId: " + getCookieValue("VisitorId"),
                                            CalledFrom: calledFrom
                                        });
                                        //sendEmailToYourself("Redirecting new visitor from " + visitorSuccess.PageName + " to Biggest Breasted Centerfolds",
                                        //    " hit from " + data.city + ", " + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=3900';
                                        break;
                                    case 1177: // Kylie Johnson
                                    case 1949: // Renee tenison
                                    case 1477: // Nichole Narin
                                    case 1519: // Ola Ray
                                    case 1919: // Julie Woodson
                                        sendEmailToYourself("New visitor from " + visitorSuccess.PageName + " redirect to Black Centerfolds",
                                            " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                        window.location.href = 'https://ogglebooble.com/album.html?folder=3822';
                                        break;
                                    default:
                                        logEventActivity({
                                            VisitorId: visitorSuccess.VisitorId,
                                            EventCode: "NEW",
                                            EventDetail: "Initial Page: " + visitorSuccess.PageName + " Ip: " + data.ip,
                                            //+ " from " + data.city + "," + data.region + " " + data.country +

                                            CalledFrom: calledFrom
                                        });
                                        //if (verbosity > 44) {
                                        //    sendEmailToYourself("Someone new visited. Initial Page: " + visitorSuccess.PageName,
                                        //        "Ip: " + data.ip + " from " + data.city + "," + data.region + " " + data.country +
                                        //        "<br/>Initial Page: " + pageId +
                                        //        "<br/>VisitorId: " + getCookieValue("VisitorId"));
                                        //}
                                }
                            }
                        }
                        else {
                            if (verbosity > 1) {
                                //console.log("Unnecessary HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                                var userName = getCookieValue("UserName");
                                if (!isNullorUndefined(userName)) {
                                    logError({
                                        VisitorId: visitorSuccess.VisitorId,
                                        ActivityCode: "LOV",
                                        Severity: 2,
                                        ErrorMessage: "Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " +
                                            "ip: " + data.ip + "  username(" + userName + ") came back for another visit " +
                                            " page: " + pageId + " " + visitorSuccess.PageName +
                                            " hit from " + data.city + "," + data.region + " " + data.country,
                                        CalledFrom: "HitCounter.js logVisitor excellent"
                                    });
                                    //sendEmailToYourself("Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " +
                                    //    "ip: " + data.ip + "  username(" + userName + ") came back for another visit ",
                                    //    "<br/>page: " + ageId + " " + visitorSuccess.PageName +
                                    //    "<br/>hit from " + data.city + "," + data.region + " " + data.country +
                                    //    "VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    //if (document.domain === 'localhost') alert("IpInfo Hit in LogVisitor \n called From: " + calledFrom + "\n userName unknown\nVisitorId: " + getCookieValue("VisitorId"));
                                    //sendEmailToYourself("Unnsecssary IpInfo hit", "called from: " + calledFrom +
                                    //    "<br/>ip: " + data.ip +
                                    //    "<br/>page: " + pageId + " " + visitorSuccess.PageName +
                                    //    "<br/>hit from " + data.city + "," + data.region + " " + data.country +
                                    //    "<br/>visitorId: " + getCookieValue("VisitorId"));
                                    logError({
                                        VisitorId: visitorSuccess.VisitorId,
                                        ActivityCode: "LOV",
                                        Severity: 2,
                                        ErrorMessage: "Unnsecssary IpInfo hit called from: " + calledFrom +
                                            " ip: " + data.ip +
                                            " page: " + pageId + " " + visitorSuccess.PageName +
                                            " hit from " + data.city + "," + data.region + " " + data.country,
                                        CalledFrom: "HitCounter.js logVisitor"
                                    });
                                }
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
                        logError({
                            VisitorId: visitorSuccess.VisitorId,
                            ActivityCode: "AAA",
                            Severity: 1,
                            ErrorMessage: "Ajax Error in logVisitor PageId: " + pageId + "<br/>" + visitorSuccess.Success,
                            CalledFrom: "HitCounter.js logVisitor"
                        });
                        //sendEmailToYourself("Ajax Error in logVisitor ", "PageId: " + pageId + "<br/>" + visitorSuccess.Success);
                    }
                }, 
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (errorMessage.includes("Requested page not found")) {
                        sendEmailToYourself("XHR ERROR Requested page not found in LogVisitor?",
                            "Ip: " + data.ip +
                            ",<br/>pageId: " + pageId +
                            ",<br/>Message: " + errorMessage);
                    } else {
                        if (!checkFor404(errorMessage, "logVisitor")) {
                            sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisitor",
                                "Ip: " + data.ip +
                                ",<br/>pageId: " + pageId +
                                ",<br/>Message: " + errorMessage);
                        }
                    }
                }
            });
        });
    } catch (e) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "AAA",
            Severity: 1,
            ErrorMessage: "Error CAUGHT in Log Visistor:" + e,
            CalledFrom: "HitCounter.js logVisitor"
        });
        //sendEmailToYourself("Error CAUGHT in Log Visistor", e);
    }
}

function getVisitorIdFromIp(ipAddress) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/HitCounter/GetVisitorIdFromIP?ipAddress=" + ipAddress,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (isNullorUndefined(successModel.VisitorId)) {
                    logError({
                        VisitorId: "unknown",
                        ActivityCode: "VIP",
                        Severity: 1,
                        ErrorMessage: "Trying to get VisitorId from Ip Address failed. Forced to call logVisitor().  IpAddress: " + ipAddress + " failed to return a visitorId ",
                        CalledFrom: "HitCounter.js getVisitorIdFromIp"
                    });
                    //sendEmailToYourself("Trying to get VisitorId from Ip Address failed","Forced to call logVisitor(" + pageId + ").  IpAddress: " + ipAddress + " failed to return a visitorId ");
                    logVisitor(pageId, "failed GetVisitorIdFromIP");
                }
                else {
                    setCookieValue("VisitorId", successModel.VisitorId);
                    if (getCookieValue("VisitorId") === successModel.VisitorId) {
                        //if (document.domain === 'localhost') alert("Saved having to call LogVisitor from logPageHit. Got visitorId from IP: " + ipAddress + ". VisitorId: " + successModel.VisitorId);
                        //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                        if (verbosity > 0) {
                            logEventActivity({
                                VisitorId: visitorSuccess.VisitorId,
                                EventCode: "VIP",
                                EventDetail: "Found Viisitor Id from. Used IpAddress: " + ipAddress + " to find visitorId: " +
                                    successModel.VisitorId + ". Calling logPageHit again",
                                CalledFrom: "HitCounter.js GetVisitorIdFromIP"
                            });
                            //sendEmailToYourself("Found Viisitor Id from Ip: ", "used IpAddress: " + ipAddress + " to find visitorId: " + successModel.VisitorId + ". Calling logPageHit again");
                        }
                        //logPageHit(pageId); //, ipAddress, "inside after GetVisitorIdFromIP");
                    }
                    else {
                        if (document.domain === 'localhost') {
                            alert("GetVisitorIdFromIP in logPageHit Failed\nipAddress: " + ipAddress + "\nVisitorId: " + successModel.VisitorId + "\nCalling logVisitor");
                            //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                        }
                        else {
                            if (verbosity > 0) {
                                logError({
                                    VisitorId: "unknown",
                                    ActivityCode: "VIP",
                                    Severity: 1,
                                    ErrorMessage: "GetVisitorIdFromIP Failed. IpAddress: " + ipAddress + "<br/>VisitorId: " + successModel.VisitorId + "<br/>Calling logVisitor",
                                    CalledFrom: "HitCounter.js getVisitorIdFromIp"
                                });
                                //sendEmailToYourself("GetVisitorIdFromIP Failed", "IpAddress: " + ipAddress + "<br/>VisitorId: " + successModel.VisitorId + "<br/>Calling logVisitor");
                            }
                        }
                    }
                }
            }
            else {
                logError({
                    VisitorId: "unknown",
                    ActivityCode: "VIP",
                    Severity: 1,
                    ErrorMessage: "GetVisitorIdFromIP Failed. IpAddress: " + ipAddress + " VisitorId: " + successModel.VisitorId + " Calling logVisitor",
                    CalledFrom: "HitCounter.js getVisitorIdFromIp"
                });

                //sendEmailToYourself("GetVisitorIdFromIP Fail", "ipAddress: " + ipAddress + "<br/>" + successModel.Success);
                //console.log("GetVisitorIdFromIP: " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (document.domain === 'localhost')
                alert("XHR ERROR IN HITCOUNTER.JS logPageHit " + errorMessage);

            if (!checkFor404(errorMessage, "GetVisitorIdFromIP")) {
                logError({
                    VisitorId: "unknown",
                    ActivityCode: "SOE",
                    Severity: 1,
                    ErrorMessage: "GetVisitorIdFromIP ? ipAddress = " + ipAddress +
                        " Message: " + errorMessage,
                    CalledFrom: "HitCounter.js getVisitorIdFromIp"
                });
                //sendEmailToYourself("Some other XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress + " Message: " + errorMessage);
                if (document.domain === 'localhost')
                    alert("Some other XHR ERROR IN HITCOUNTER.JS logPageHit " + errorMessage);
            }
        }
    });
}

function logPageHit(pageId, calledFrom) {
    //alert("logPageHit(" + pageId + ")"; // + "," + visitorId + "," + calledFrom + ")");
    if (isNullorUndefined(pageId)) {
        sendEmailToYourself("PageId undefined in LogPageHit.", "visitorId: " + visitorId);
        return;
    }
    if (document.domain === 'localhost') {
        setCookieValue("IpAddress", "68.203.90.183");
        setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
        //setCookieValue("UserName", "admin");
        setCookieValue("UserName", "cooler");
        console.log("bypassing logVisitor");
        $('#spnUserName').html(getCookieValue("UserName"));
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
        $('#dashboardMenuItem').show();

        //return;
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
                                if (verbosity > 0) {
                                    sendEmailToYourself("Found Viisitor Id from Ip: ", "used IpAddress: " + ipAddress + " to find visitorId: " +
                                        successModel.VisitorId + ". Calling logPageHit again");
                                }
                                //logPageHit(pageId); //, ipAddress, "inside after GetVisitorIdFromIP");
                            }
                            else {
                                if (document.domain === 'localhost') {
                                    alert("GetVisitorIdFromIP in logPageHit Failed\nipAddress: " + ipAddress + "\nVisitorId: " + successModel.VisitorId + "\nCalling logVisitor");
                                    //console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    if (verbosity > 0) {
                                        sendEmailToYourself("GetVisitorIdFromIP Failed", "IpAddress: " + ipAddress + "<br/>VisitorId: " + successModel.VisitorId + "<br/>Calling logVisitor");
                                    }
                                }
                                logVisitor(pageId, "logPageHit");
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
                        logError({
                            VisitorId: "", ActivityCode: "SOE", Severity: 2,
                            ErrorMessage: errorMessage,
                            CalledFrom: "HitCounter.js logPageHit"
                        });



                        //sendEmailToYourself("Some other XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress +
                        //    " Message: " + errorMessage);
                        //if (document.domain === 'localhost')
                        //    alert("Some other XHR ERROR IN HITCOUNTER.JS logPageHit " + errorMessage);
                    }
                    //sendEmailToYourself("GetVisitorIdFromIP XHR ERROR", getXHRErrorDetails(jqXHR, exception));
                    //console.log("GetVisitorIdFromIP jqXHR ERROR: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            //if (document.domain === 'localhost') alert("logPageHit fail.\n no VisitorId and no IpAddress. \nAre you robot");
            if (verbosity > 0) {
                logError({
                    VisitorId: "", ActivityCode: "GIP", Severity: 2,
                    ErrorMessage: "no VisitorId and no IpAddress in logPageHit. Calling LogVisitor",
                    CalledFrom: "HitCounter.js logPageHit"
                });
                //sendEmailToYourself("no VisitorId and no IpAddress in logPageHit", "Calling LogVisitor");
            //    if (window.confirm("I am not a robot")) {
            //        alert("Please Register or Login");
            //    }
            //    else
            //        alert("Please Register or Login");
            //    window.location.href = "/";
}




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

                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits.toLocaleString());
                userPageHits = pageHitSuccessModel.UserPageHits;
                userImageHits = pageHitSuccessModel.UserImageHits;
                checkForHitLimit("pages", pageId);

                if (verbosity > 20)
                {
                    if (document.domain === 'localhost')
                        alert("page hit: (" + pageHitSuccessModel.RootFolder + ") " + pageHitSuccessModel.ParentName + "/" + pageHitSuccessModel.PageName +
                            "\nIp: " + getCookieValue("IpAddress"));
                    else
                        logError({
                            VisitorId: visitorId,
                            ActivityCode: "PGH",
                            Severity: 2,
                            ErrorMessage: "Page hit: " + pageHitSuccessModel.PageName + " Called From: " + calledFrom,
                            CalledFrom: "HitCounter.js logPageHit"
                        });
                    //sendEmailToYourself("page hit: (" + pageHitSuccessModel.RootFolder + ") " + pageHitSuccessModel.ParentName + "/" + pageHitSuccessModel.PageName,
                    //        "PageId: " + pageId +
                    //        "<br/>VisitorId: " + visitorId +
                    //        "<br/>IpAddress: " + getCookieValue("IpAddress"));
                }
                // LOG VISIT
                logVisit(visitorId, pageHitSuccessModel.PageName);
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
            //if (errorMessage.Contains("Requested page not found")) {
            //    if (document.domain === 'localhost')
            //        alert("Requested page not found  : " + pageId);
            //}

            if (!checkFor404(errorMessage, "logPageHit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: "pageId: " + pageId + " Message: " + errorMessage,
                    CalledFrom: "HitCounter.js logPageHit"
                });
                //sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logPageHit", "api/PageHit/LogPageHit  pageId: " + pageId +
                //    " Message: " + errorMessage);
            }
            // all logging needs to be hidden from users
            //sendEmailToYourself("logPageHit error", getXHRErrorDetails(jqXHR, exception));
            //console.log("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function logVisit(visitorId, pageName) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Visit/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    if (logVisitSuccessModel.WelcomeMessage !== "ok") {
                        $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);
                    }
                    //if (verbosity > 5)
                    logEventActivity({
                        VisitorId: visitorId,
                        EventCode: "VIS",
                        EventDetail: "Visit Added visitorId: " + visitorId + " Page: " + pageName,
                        CalledFrom: "HitCounter.js logVisit"
                    });
                    //sendEmailToYourself("Visit Added ", "visitorId: " + visitorId + "<br/>Initial Page: ");
                    //if (document.domain === 'localhost') alert("Visit Added ", "visitorId: " + visitorId);
                }
            }
            else {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "ERR",
                    Severity: 2,
                    ErrorMessage: "PageId: " + pageId + " Message: " + logVisitSuccessModel.Success,
                    CalledFrom: "HitCounter.js logVisit"
                });
                //sendEmailToYourself("Ajax Error in logVisit", "PageId: " + pageId + "<br/>Message: " + logVisitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logVisit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "HitCounter.js logVisit"
                });
                //sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisit",
                //    "api/HitCounter/LogVisit?visitorId=" + visitorId +
                //    "<br/>" + errorMessage);
            }
        }
    });
}

function letemPorn(response, pornType) {
    // if (document.domain === 'localhost') alert("letemPorn: " + pornType);
    if (response === "ok") {
        //  setUserPornStatus(pornType);
        //<div onclick="goToPorn()">Nasty Porn</div>
        //window.location.href = '/index.html?subdomain=porn';
        if (isNullorUndefined(pornType)) {
            sendEmailToYourself("letemPorn problem", "pornType missing");
            pornType = "UNK";
        }
        reportThenPerformEvent("PRN", 136, pornType);
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
    }
}

function reportThenPerformEvent(eventCode, calledFrom, eventDetail) {
    //alert("reportThenPerformEvent(eventCode: " + eventCode + ", calledFrom: " + calledFrom + ", eventDetail: " + eventDetail);
    try {
        var visitorId = getCookieValue("VisitorId");
        //if (isNullorUndefined(ipAddress)) alert("who are you");
        if (isNullorUndefined(visitorId)) {
            if (document.domain === 'localhost') {
                alert("Who Are You? \nVisitorId: " + visitorId + " Ip: " + getCookieValue("IpAddress"), "Calling LogVisitor.  Event: " + eventCode + " calledFrom: " + calledFrom);
            }
            //if (verbosity > 5) 
            {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "KLG",
                    Severity: 2,
                    ErrorMessage: "Calling LogVisitor from reportThenPerformEvent Event: " + eventCode + " EventDetail: " + eventDetail,
                    CalledFrom: calledFrom
                });
                //sendEmailToYourself("Calling LogVisitor from reportThenPerformEvent",
                //    "VisitorId: " + visitorId +
                //    "<br/> Ip: " + getCookieValue("IpAddress") +
                //    "<br/>Event: " + eventCode + 
                //    "<br/>EventDetail: " + eventDetail +
                //    "<br/>calledFrom: " + calledFrom);
            }
            logVisitor(calledFrom, "reportThenPerformEvent");
            return;
        }
        logEventActivity({
            VisitorId: visitorId,
            EventCode: eventCode,
            EventDetail: eventDetail,
            CalledFrom: calledFrom
        });
        performEvent(eventCode, calledFrom, eventDetail);

    } catch (e) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "CER",
            Severity: 2,
            ErrorMessage: "Catch Error in reportThenPerformEvent. eventCode: " + eventCode + "eventDetail: " + eventDetail + "Message: " + e,
            CalledFrom: calledFrom
        });
        //sendEmailToYourself("Catch Error in OggleEvenLog()", "eventCode: " + eventCode +
        //    "<br/>called from pageId: " + calledFrom +
        //    "<br/>eventDetail: " + eventDetail +
        //    "<br/>VisitorId: " + visitorId +
        //    "<br/>Message: " + e);
        if (document.domain === 'localhost') {
            alert("reportThenPerformEvent Catch Error: " + e);
        }
    }
}

function logEventActivity(logEventModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/EventLog/LogEventActivity",
        data: logEventModel,
        success: function (logEventActivitySuccess) {
            if (logEventActivitySuccess.Success !== "ok") {
                //if (logEventActivitySuccess.Success.indexOf("Option not supported") > -1) {
                if (!checkFor404(logEventActivitySuccess.Success, "logEventActivity")) {
                    if (document.domain === 'localhost')
                        alert("LogEventActivity\nCalled from PageId: " + logEventModel.CalledFrom +
                            "\nEventCode: " + logEventModel.EventCode +
                            "\neventDetail: " + logEventModel.EventDetail +
                            "\nVisitorId: " + logEventModel.VisitorId +
                            "\nMessage: " + logEventActivitySuccess.Success);
                    else {
                        if (logEventActivitySuccess.Success.indexOf("Duplicate entry") < 0)
                            logError({
                                VisitorId: visitorId,
                                ActivityCode: "ER2",
                                Severity: 2,
                                ErrorMessage: "LogEventActivity Called from PageId: " + calledFrom +
                                    "<br/>EventCode: " + logEventModel.EventCode +
                                    "<br/>eventDetail: " + logEventModel.EventDetail +
                                    "<br/>VisitorId: " + logEventModel.VisitorId +
                                    "<br/>Message: " + logEventActivitySuccess.Success,
                                CalledFrom: "LogEventActivity"
                            });
                        //sendEmailToYourself("LogEventActivity", "Called from PageId: " + calledFrom +
                        //    "<br/>EventCode: " + logEventModel.EventCode +
                        //    "<br/>eventDetail: " + logEventModel.EventDetail +
                        //    "<br/>VisitorId: " + logEventModel.VisitorId +
                        //    "<br/>Message: " + logEventActivitySuccess.Success);
                    }
                }
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "LogEventActivity")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: "url: " + settingsArray.ApiServer + "/api/EventLog/LogEventActivity" +
                        " Ip: " + getCookieValue("IpAddress") +
                        " EventCode: " + logEventModel.EventCode +
                        " eventDetail: " + logEventModel.EventDetail +
                        "Message: " + errorMessage,
                    CalledFrom: "LogEventActivity"
                });
            }
        }
    });
}

function performEvent(eventCode, calledFrom, eventDetail) {
    //var ipAddress = getCookieValue("IpAddress");

    if (eventCode === "PRN") {
        //  setUserPornStatus(pornType);
    }
    //if (ipAddress !== "68.203.90.183")
    {
        if (eventCode !== "CIC"     // Carousel Item Clicked 
            && eventCode !== "FLC"  // Footer Link Clicked 
            && eventCode !== "BAC"  // Archive Clicked
            && eventCode !== "CMX"  // Show Model Info Dialog
            && eventCode !== "SUB"  // Subfolder Clicked
            && eventCode !== "BCC"  // Breadcrumb Clicked 
            && eventCode !== "BLC"  // Banner Link Clicked 
            && eventCode !== "LMC"  // Left Menu Item Clicked
            && eventCode !== "HBC"  // Header Banner Clicked
            && eventCode !== "HBX"  // Home Breadcrumb Clicked
            && eventCode !== "RNK"  // Ranker Banner Clicked
            && eventCode !== "CAA"  // Carousel Arrow Clicked
            && eventCode !== "CPC") // Carousel ParentGallery clicked
        {

            if (document.domain === 'localhost') {
                alert("Monitored Event\neventcode: " + eventCode +
                    "\ncalledFrom: " + calledFrom +
                    "\neventDetail: " + eventDetail);
            }
        }
    }
    // NOW PERFORM EVENT
    switch (eventCode) {
        case "GIC": // Gallery Item Clicked
        case "CMC": // carousle context menu item clicked
        case "CXM":  // carousle context menu opened
        case "XLC":  // external link clicked
            break;
        case "PRN":  //("Porn Option clicked");
            window.location.href = '/index.html?subdomain=porn';
            break;
        case "HBC":  //  header banner clicked
            if (eventDetail === "porn")
                window.location.href = '/index.html?subdomain=porn';
            else
                window.location.href = "/";
            break;
        case "GAX":  // can I get a connection
            alert("can I get a connection");
            //window.location.href = ".";
            break;
        case "CAA": // carousle context menu item clicked
            if (eventDetail === "foward") {
                //alert("reportThenPerformEvent eventCode: " + eventCode + " eventDetail: " + eventDetail);
                resume();
            }
            else {
                // pop
                imageHistory.pop();
                imageIndex = imageHistory.pop();
                if (imageIndex > 0) {
                    //$('#categoryTitle').fadeOut(intervalSpeed);
                    //$('#laCarousel').fadeOut(intervalSpeed, "linear", function () {
                    $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
                    $('#categoryTitle').html(carouselItemArray[imageIndex].FolderPath + ": " + carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);
                    //$('#laCarousel').fadeIn(intervalSpeed);
                    resizeCarousel();
                    //});
                }
                else
                    alert("imageIndex: " + imageIndex);
            }
            break;
        case "EXP":  // explode
            window.open(eventDetail, "_blank");
            break;
        case "SRC":  // Search Performed
        case "SSB":
            window.open("/album.html?folder=" + eventDetail, "_blank");            
            break;
        case 'SUB':  // 'Sub Folder Click'
        case "CIC":  // carousel image clicked
        case "SEE":  // see more of her
        case "CPC":  // carousel ParentGallery clicked
        case "BCC":  // Breadcrumb Clicked
        case "BLC":  // banner link clicked
        case "BAC":  // Babes Archive Clicked
            window.location.href = "/album.html?folder=" + eventDetail;  //  open page in same window
            break;
        case "CMX":
            showModelInfoDialog(eventDetail, calledFrom, 'Images/redballon.png');
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
                case "boobTransitions": window.location.href = 'transitions.html'; break;
                case "pornTransitions": window.location.href = "transitions.html?subdomain=porn"; break;
                case "boobsRanker": window.location.href = 'ranker.html'; break;
                case "pornRanker": window.location.href = 'ranker.html?subdomain=porn'; break;
                case "dirTreeBoobs": showCatListDialog(2); break;
                case "dirTreePorn": showCatListDialog(242); break;
                case "explainBoobs": showCustomMessage(38, true); break;
                case "explainPorn": showCustomMessage(94, true); break;
                case "back": window.location.href = "/"; break;
                case "centerfolds": window.location.href = '/album.html?folder=1132'; break;
                case "video": window.location.href = 'video.html'; break;
                case "blog": window.location.href = '/Blog.html'; break;
                case "porn":
                    if (isLoggedIn())
                        window.location.href = '/index.html?subdomain=porn';
                    else
                        showCustomMessage(35, false);
                    break;
                default:
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "KLG",
                        Severity: 2,
                        ErrorMessage: "uncaught switch option Left Menu Click EventDetail: " + eventDetail,
                        CalledFrom: calledFrom
                    });
                    //alert("uncaught switch option Left Menu Click\nEventDetail: " + eventDetail); break;
            }
            break;
        case "FLC":  //  footer link clicked
            //if (document.domain === 'localhost') alert("eventCode: " + eventCode + " pageId: " + pageId);
            switch (eventDetail) {
                case "about us": showCustomMessage(38); break;
                case "dir tree": showCatListDialog(2); break;
                case "porn dir tree": showCatListDialog(242); break;
                case "playmate dir tree": showCatListDialog(472); break;
                case "porn": showCustomMessage(35, false); break;
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
                default:
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "KLG",
                        Severity: 2,
                        ErrorMessage: "uncaught switch option footer link clicked EventDetail: " + eventDetail,
                        CalledFrom: calledFrom
                    });
                    //alert("eventDetail: " + eventDetail);
                    break;
            }
            break;
        default:
            logError({
                VisitorId: visitorId,
                ActivityCode: "KLG",
                Severity: 2,
                ErrorMessage: "Uncaught Case: " + eventDetail + "eventCode " + eventCode + "  not handled in reportThenPerformEvent",
                CalledFrom: calledFrom
            });
            //sendEmailToYourself("Uncaught Case: " + eventCode, "eventCode " + eventCode + "  not handled in reportThenPerformEvent");
    }
}

function checkForHitLimit(calledFrom, pageId) {
    //showCustomMessage(97, true);
    //alert("checkForHitLimit userPageHits: " + userPageHits);
    //userPageHits = 501;

    if (!isLoggedIn()) {
        if (calledFrom === "pages") {
            if (userPageHits > freePageHitsAllowed) {
                showCustomMessage(98, true);
            }
            if (userPageHits > freePageHitsAllowed && userPageHits % 10 === 0) {
                logEventActivity({
                    VisitorId: visitorSuccess.VisitorId,
                    EventCode: "PAY",
                    EventDetail: "Page Hit Message Displayed. UserPageHits: " + userPageHits + " pageId: " + pageId,
                    CalledFrom: calledFrom
                });
                //sendEmailToYourself("Page Hit Message Displayed", "userPageHits: " + userPageHits + "<br>pageId: " + pageId + "<br>Ip: " + getCookieValue("IpAddress"));
            }

        }
        if (calledFrom === "images") {
            if (userImageHits > freeImageHitsAllowed)
                showCustomMessage(97, true);
            if (userImageHits > freeImageHitsAllowed && userImageHits % 10 === 0 && userImageHits < 3000) {
                logEventActivity({
                    VisitorId: visitorSuccess.VisitorId,
                    EventCode: "PAY",
                    EventDetail: "Image Hit Limit Message Displayed userImageHits: " + userImageHits + " pageId: " + pageId,
                    CalledFrom: calledFrom
                });
                //sendEmailToYourself("Image Hit Limit Message Displayed", "userImageHits: " + userImageHits + "<br>pageId: " + pageId + "<br>Ip: " + getCookieValue("IpAddress"));
            }
        }
    }

    //if (isLoggedIn()) {
    //    freeVisitorHitsAllowed += 1000;
    //}

    //if (userPageHits > freeVisitorHitsAllowed) {
    //    showCustomMessage(97, true);
    //    //alert("you have now visited " + userHits + " pages." +
    //    //    "\n It's time you Registered and logged in." +
    //    //    "\n you will be placed in manditory comment mode until you log in ");
    //}

    //if (userHits > userHitLimit) {
    //    alert("you have now visited " + pageHitSuccessModel.UserHits + " pages." +
    //        "\n It's time you Registered and logged in." +
    //        "\n you will be placed in manditory comment mode until you log in ");
    //}

    // login and I will let you see 1000 more images.
    // bookmark my site with link oog?domain=122; to get another 1,000 image views.
    // put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
    // use my product
    // Request extra privdleges 
    // pay me to do some programming for you and I'll let you in on all my source code

}