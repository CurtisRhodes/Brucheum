// HITCOUNTER
var verbose = 1;

function logImageHit(link, initialHit) {
    //$('#footerMessage').html("logging image hit");
    var visitorId = getCookieValue("VisitorId");    
    //if (visitorId !== '9bd90468-e633-4ee2-af2a-8bbb8dd47ad1') 
    {
        $.ajax({
            type: "POST",            
            url: "https://api.curtisrhodes.com/api/ImageHit/LogImageHit?visitorId=" + visitorId + "&linkId=" + link,
            //url: settingsArray.ApiServer + "api/ImageHit/LogImageHit?visitorId=" + visitorId + "&linkId=" + link,
            success: function (imageHitSuccessModel) {
                if (imageHitSuccessModel.Success === "ok") {
                    var imageHits = imageHitSuccessModel.ImageHits;
                    var userHits = imageHitSuccessModel.UserHits;
                    console.log(visitorId + " viewed Image imageHits: " + imageHits + " user hits: " + userHits);
                }
                else {
                    console.log("logImageHit: " + imageHitSuccessModel.Success);
                    sendEmailToYourself("WHAT THE  logImageHit fail ", imageHitSuccessModel.Success);
                }
            },
            error: function (jqXHR, exception) {
                sendEmailToYourself("WHAT THE  logImageHit jqXHR fail ", getXHRErrorDetails(jqXHR, exception));
                console.log("logImageHit XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}

function logVisitor(pageId, calledFrom) {
    try {
        var ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            console.log("no need to Log Visistor I alread know ip: " + ipAddress);
            sendEmailToYourself("no need to Log Visistor", "I alread know ip: " + ipAddress);
            //$('#footerMessage').append("  no need to Log Visistor I alread know ip: " + ip);
            logPageHit(pageId);
        }
        else {
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
                    Verbosity: verbose,
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
                                sendEmailToYourself(" Someone new visited " + visitorSuccess.PageName,
                                    " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                            }
                            else {
                                console.log("Unnecessary HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                                if (!isNullorUndefined(userName)) {
                                    sendEmailToYourself("Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " + userName + " came back for another visit ",
                                        visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                                else {
                                    sendEmailToYourself("logvisitor from " + calledFrom,
                                        visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                                }
                            }
                            $('#footerMessage').html("");
                            if (visitorSuccess.WelcomeMessage !== "") {
                                $('#headerMessage').html(visitorSuccess.WelcomeMessage);
                            }
                        }
                        else {
                            console.log("logVisitor: " + visitorSuccess.Success);
                            sendEmailToYourself("DAMN Error in logVisitor ", visitorSuccess.Success);
                        }
                    },
                    error: function (jqXHR, exception) {
                        $('#blogLoadingGif').hide();
                        sendEmailToYourself("LogVisit jqXHR", getXHRErrorDetails(jqXHR, exception));
                        console.log("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                    }
                });
            });
        }

    } catch (e) {
        sendEmailToYourself("Error in Log Visistor", e);
    }
}

function logSpecialPageHit(pageId) {
    if (document.domain === 'localhost')
        return;

    if (ipAddress !== "68.203.90.183" && ipAddress !== "50.62.160.105") {
        //console.log("logging special page hit " + pageId);
        var SpecialPageName = "";
        switch (pageId) {
            case 1:
                SpecialPageName = "Transitions";
                break;
            case 2:
                SpecialPageName = "Index";
                break;
            case 3:
                SpecialPageName = "Blog";
                break;
            case 4:
                SpecialPageName = "Dashboard";
                break;
            case 5:
                SpecialPageName = "Ranker";
                break;
            case 245:
                SpecialPageName = "Porn";
                break;
            default:
                sendEmailToYourself("logSpecialPageHit pageId: " + SpecialPageName + " not recognized");
        }

        //$('#footerMessage').html("logging special page hit");
        var visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            var ipAddress = getCookieValue("IpAddress");
            //console.log("ipAddress: " + ipAddress);
            if (!isNullorUndefined(ipAddress)) {
                //console.log("logSpecialPageHit  How is it that I know the Ip and not the visitorId? log (pre IpInfo)");
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                    success: function (successModel) {
                        if (successModel.Success === "ok") {
                            setCookieValue("VisitorId", successModel.VisitorId);

                            if (getCookieValue("VisitorId") === successModel.VisitorId) {
                                console.log("trying logSpecialPageHit again with visitorId  (pre IpInfo): " + getCookieValue("VisitorId"));
                                sendEmailToYourself("trying logSpecialPageHit again", "trying logSpecialPageHit again with visitorId(pre IpInfo): " + getCookieValue("VisitorId"));
                                logSpecialPageHit(pageId);
                            }
                            else {
                                console.log("logSpecialPageHit GetVisitorIdFromIP FAIL visitorId:  " + successModel.VisitorId);
                                sendEmailToYourself("logSpecialPageHit GetVisitorIdFromIP FAIL", "visitorId:  " + successModel.VisitorId);
                            }
                        }
                        else {
                            console.log("logSpecialPageHit: " + pageHitSuccessl.Success);
                            sendEmailToYourself("logSpecialPageHit Error: ", pageHitSuccessl.Success);
                        }
                    },
                    error: function (jqXHR, exception) {
                        $('#blogLoadingGif').hide();
                        console.log("GetVisitorIdFromIP jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                        sendEmailToYourself("GetVisitorIdFromIP jqXHR Error", getXHRErrorDetails(jqXHR, exception));
                    }
                });
            }
            else {
                console.log("forced to hit IPINFO from log special page hit");
                sendEmailToYourself("forced to hit IPINFO from log special page hit", "");
                logVisitor(pageId, "logSpecialPageHit");
            }
        }
        else {
            console.log("logging proper special page hit  pageId: " + SpecialPageName + "   visitorId: " + visitorId);
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/HitCounter/LogSpecialPageHit?pageId=" + pageId + "&visitorId=" + visitorId,
                success: function (pageHitSuccess) {
                    if (pageHitSuccess.Success === "ok") {
                        $('#footerMessage').html("");
                        if (!isNullorUndefined(pageHitSuccess.WelcomeMessage)) {
                            $('#headerMessage').html(pageHitSuccess.WelcomeMessage);
                        }

                        sendEmailToYourself("Someone visited: " + SpecialPageName, "visitorId: " + visitorId);

                        //if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                        //{
                        //    Visitor visitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        //    using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        //    {
                        //        godaddyEmail.SendEmail("ALRIGHT!. Somebody Visited " + pageId, visitor.IpAddress +
                        //            " from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " visited: " + pageId);
                        //    }
                        //}

                    }
                    else {
                        console.log("logSpecialPageHit: " + pageHitSuccess.Success);
                        sendEmailToYourself("FA logSpecialPageHit error", pageHitSuccess.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    console.log("logSpecialPageHit jqXHR Error : " + getXHRErrorDetails(jqXHR, exception));
                    sendEmailToYourself("logSpecialPageHit jqXHR error", getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}

function logPageHit(pageId) {
    //$('#footerMessage').html("logging proper page hit.UserName: " + userName);
    //console.log("logging page hit: " + pageId);

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
                            logVisitor(pageId,"failed GetVisitorIdFromIP");
                        }
                        else {
                            console.log("logPageHit how is it that I know the Ip and not the visitorId? (pre IpInfo) ");
                            setCookieValue("VisitorId", successModel.VisitorId);
                            if (getCookieValue("VisitorId") === successModel.VisitorId) {

                                console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                                sendEmailToYourself("looping in logPageHit", " GetVisitorIdFromIP.VisitorId: " + getCookieValue("VisitorId"));

                                logPageHit(pageId);
                            }
                        }
                    }
                    else {
                        sendEmailToYourself("GetVisitorIdFromIP ERROR", successModel.Success);
                        console.log("GetVisitorIdFromIP: " + successModel.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    sendEmailToYourself("GetVisitorIdFromIP XHR ERROR", getXHRErrorDetails(jqXHR, exception));
                    console.log("GetVisitorIdFromIP jqXHR ERROR: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            var userName = getCookieValue("User");
            var visitorId = getCookieValue("VisitorId");
            //console.log("logging proper page hit.  ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
            //sendEmailToYourself("logging proper page hit", "ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
            console.log("sending email and logging proper page hit.  ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
            //if ((ipAddress !== "68.203.90.183") && (ipAddress !== "50.62.160.105"))
            {
                var pageHitModel = {
                    VisitorId: visitorId,
                    UserName: userName,
                    AppName: "OggleBooble",
                    IpAddress: ipAddress,
                    PageId: pageId,
                    Verbose: verbose
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
                            console.log("OH MY GOD logPageHit: " + pageHitSuccessModel.Success);
                            sendEmailToYourself("OH MY GOD logPageHit error: ", pageHitSuccessModel.Success);
                        }
                    },
                    error: function (jqXHR, exception) {
                        // all logging needs to be hidden from users
                        sendEmailToYourself("logPageHit error", getXHRErrorDetails(jqXHR, exception));
                        console.log("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                    }
                });
            }
        }
    }
}
