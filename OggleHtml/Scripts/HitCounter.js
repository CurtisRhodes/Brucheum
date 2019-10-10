// HITCOUNTER
var verbose = 1;

function logPageHit(pageId) {
    //alert("logging page hit: " + pageId);
    //console.log("logging page hit: " + pageId);
    //var visitorId = getCookieValue("VisitorId");
    //var ipAddress = getCookieValue("IpAddress");

    if (isNullorUndefined(getCookieValue("IpAddress"))) {
        logVisitor(pageId);
    }

    if (isNullorUndefined(visitorId)) {
        //alert("how is it that I know the Ip and not the visitorId?");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
            success: function (successModel) {
                if (successModel.Success === "ok") {

                    if (isNullorUndefined(successModel.VisitorId)) {
                        sendEmailToYourself("Trying to get VisitorId from Ip Address failed", "ipAddress: " + ipAddress + " failed to return a visitorId");
                        logVisitor(pageId);
                    }
                    else {




                        console.log("logPageHit how is it that I know the Ip and not the visitorId? (pre IpInfo) ");
                        setCookieValue("VisitorId", successModel.VisitorId);
                        if (getCookieValue("VisitorId") === successModel.VisitorId) {
                            console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                            //alert("looping in log hit. GetVisitorIdFromIP. (pre IpInfo)  VisitorId: " + getCookieValue("VisitorId"));
                            logPageHit(pageId);
                        }
                    }
                }
                else
                    alert("GetVisitorIdFromIP: " + successl.Success);
            },
            error: function (jqXHR, exception) {
                alert("GetVisitorIdFromIP jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });

        //logVisitor(pageId);
        //console.log("forced to hit IPINFO from regular Log page hit");
        //alert("forced to hit IPINFO from regular Log page hit");
        //$.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {
        //    setCookieValue("IpAddress", data.ip);
        //    if (!isNullorUndefined(getCookieValue("IpAddress"))) {
        //        console.log("looping in log hit  (AFTER IPINFO)  IpAddress: " + getCookieValue("IpAddress"));
        //        //alert("looping in log hit IpAddress: : " + getCookieValue("IpAddress"));
        //        logPageHit(pageId);
        //    }
        //    else {
        //        console.log("getCookieValue('IpAddress') not working in logPageHit + IPINNFO burn : " + getCookieValue("IpAddress"));
        //        alert("getCookieValue('IpAddress') not working in logPageHit + IPINNFO burn : " + getCookieValue("IpAddress"));
        //    }
        //});
    }
    else {
        var userName = getCookieValue("User");
        var visitorId = getCookieValue("VisitorId");
        console.log("logging proper page hit.  ip: " + ipAddress + " visitorId: " + visitorId + " pageId: " + pageId);
        //console.log("logging proper page hit. UserName: [" + userName + "] ip : " + ipAddress + " page: " + pageId);
        //$('#footerMessage').html("logging proper page hit.UserName: " + userName);
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
                                //alert("pageHitSuccessModel.WelcomeMessage: " + pageHitSuccessModel.WelcomeMessage);
                                console.log("headerMessage =  (pageHitSuccessModel.WelcomeMessage): " + pageHitSuccessModel.WelcomeMessage);
                            }
                            else {
                                //alert("pagehits: " + pageHitSuccessModel.PageHits);
                                //$('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                                //alert("pagehits: " + pageHitSuccessModel.PageHits);
                                //setTimeout(function () {
                                //    $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                                //    //console.log("headerMessage: 'pagehits: " + pageHitSuccessModel.PageHits + "'");
                                //}, 500);

                            }
                        }
                        else {
                            alert("headerMessage is not empty: " + $('#headerMessage').html());
                        }
                    }
                    else {
                        //alert("logPageHit: " + pageHitSuccessModel.Success);
                        console.log("OH MY GOD logPageHit: " + pageHitSuccessModel.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    // all logging needs to be hidden from users
                    sendEmailToYourself("logPageHit error", getXHRErrorDetails(jqXHR, exception));
                    //alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}

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
                    //alert(visitorId + " viewed Image link: " + link + "  imageHits: " + imageHits + " user hits: " + userHits);
                    console.log(visitorId + " viewed Image imageHits: " + imageHits + " user hits: " + userHits);
                }
                else {
                    console.log("logImageHit: " + imageHitSuccessModel.Success);
                    //alert("logImageHit: " + imageHitSuccessModel.Success);
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

function logVisitor(pageId) {    
    var ipAddress = getCookieValue("IpAddress");
    if (!isNullorUndefined(ipAddress)) {
        console.log("no need to Log Visistor I alread know ip: " + ipAddress);
        //$('#footerMessage').append("  no need to Log Visistor I alread know ip: " + ip);
        //logPageHit(pageId);
    }
    else {
        //$('#footerMessage').html("A HIT TO IPINFO.IO  ip: " + ipAddress);
        //console.log("A HIT TO IPINFO.IO  ip: " + ipAddress);
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

                        //alert("setCookieValue('IpAddress'," + data.ip);
                        //alert("setCookieValue('VisitorId'," + visitorSuccess.VisitorId + ")");
                        setCookieValue("IpAddress", data.ip);
                        setCookieValue("VisitorId", visitorSuccess.VisitorId);

                        if ((getCookieValue("IpAddress") !== data.ip) || ((getCookieValue("VisitorId") !== visitorSuccess.VisitorId))) {
                            sendEmailToYourself("COOKIE FAIL",
                                visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country +
                                "\n data.ip: " + data.ip + " getCookieValue('IpAddress') " + getCookieValue("IpAddress") +
                                "\n visitorSuccess.VisitorId: " + visitorSuccess.VisitorId + " getCookieValue('VisitorId') " + getCookieValue("VisitorId"));
                            //alert("COOKIE FAIL.  " + getCookieValue("VisitorId") !== visitorSuccess.VisitorId);
                            console.log("COOKIE FAIL.  " + getCookieValue("VisitorId") !== visitorSuccess.VisitorId);
                        }

                        if (visitorSuccess.IsNewVisitor) {
                            console.log("valid HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                            sendEmailToYourself("valid hit to IPINFO.IO. Someone new visited " + visitorSuccess.PageName,
                                " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                        }
                        else {
                            console.log("Unnecessary HIT TO IPINFO.IO  ip: " + getCookieValue("IpAddress"));
                            if (!isNullorUndefined(userName)) {
                                sendEmailToYourself("Unnecessary HIT TO IPINFO.IO.  EXCELLENT! " + userName + " came back for another visit ",
                                    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                            }
                            else {
                                sendEmailToYourself("Unnecessary HIT TO IPINFO.IO. Someone came back for another visit",
                                    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                            }
                        }
                        $('#footerMessage').html("");
                        if (visitorSuccess.WelcomeMessage !== "") {
                            $('#headerMessage').html(visitorSuccess.WelcomeMessage);
                        }
                    }
                    else {
                        //alert("logVisitor: " + visitorSuccess.Success);
                        sendEmailToYourself("DAMN Error in logVisitor ", visitorSuccess.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        });
    }
}

function logSpecialPageHit(pageId) {
    //alert("logging special page hit " + pageId);
    // Transitions = 1
    // Index = 2 boobs
    // Blog = 3
    // Dashboard = 4
    // Porn = 242
    // Ranker = 5

    $('#footerMessage').html("logging special page hit");
    //if (ipAddress !== "68.203.90.183" && ipAddress !== "50.62.160.105")
    {
        var visitorId = getCookieValue("VisitorId");

        if (isNullorUndefined(visitorId)) {
            var ipAddress = getCookieValue("IpAddress");
            //alert("ipAddress: " + ipAddress);
            if (!isNullorUndefined(ipAddress)) {
                //alert("how is it that I know the Ip and not the visitorId?");
                console.log("logSpecialPageHit  How is it that I know the Ip and not the visitorId? log (pre IpInfo)");
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                    success: function (successModel) {
                        if (successModel.Success === "ok") {
                            setCookieValue("VisitorId", successModel.VisitorId);

                            if (getCookieValue("VisitorId") === successModel.VisitorId) {
                                console.log("trying logSpecialPageHit again with visitorId  (pre IpInfo): " + getCookieValue("VisitorId"));
                                logSpecialPageHit(pageId);
                            }
                            else {
                                //alert("logSpecialPageHit GetVisitorIdFromIP FAIL visitorId:  " + successModel.VisitorId);
                                console.log("logSpecialPageHit GetVisitorIdFromIP FAIL visitorId:  " + successModel.VisitorId);
                            }
                        }
                        else
                            alert("logSpecialPageHit: " + pageHitSuccessl.Success);
                    },
                    error: function (jqXHR, exception) {
                        $('#blogLoadingGif').hide();
                        alert("GetVisitorIdFromIP jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                    }
                });
            }
            else {
                logVisitor(pageId);

                //console.log("forced to hit IPINFO from log special page hit");
                ////alert("forced to hit IPINFO from log special page hit");
                //$.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

                //    setCookieValue("IpAddress", data.ip);
                //    if (!isNullorUndefined(getCookieValue("IpAddress"))) {
                //        console.log("trying logSpecialPageHit again with visitorId after IPINFOP hit.   VisitorId: " + getCookieValue("VisitorId"));
                //        logSpecialPageHit(pageId);
                //    }
                //    else {
                //        console.log("getCookieValue('IpAddress'): " + getCookieValue("IpAddress"));
                //        alert("getCookieValue('IpAddress'): " + getCookieValue("IpAddress"));
                //    }
                //    sendEmailToYourself("forced to hit IPINFO from log special page hit", "page: " + pageId + " IpAddress: " + getCookieValue("IpAddress"));
                //    //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
                //    //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")
                //});
            }
        }
        else {
            //   alert("logging proper special page hit  pageId: " + pageId + "   visitorId: " + visitorId);
            console.log("logging proper special page hit  pageId: " + pageId + "   visitorId: " + visitorId);
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/HitCounter/LogSpecialPageHit?pageId=" + pageId + "&visitorId=" + visitorId,
                success: function (pageHitSuccess) {
                    if (pageHitSuccess.Success === "ok") {
                        $('#footerMessage').html("");
                        if (!isNullorUndefined(pageHitSuccess.WelcomeMessage)) {
                            $('#headerMessage').html(pageHitSuccess.WelcomeMessage);
                        }

                        //public class PageHitSuccessModel {
                        //    public int PageHits { get; set; }
                        //    public int UserHits { get; set; }
                        //    public string WelcomeMessage { get; set; }
                        //    public string Success { get; set; }
                        //}

                        //sendEmailToYourself("Special Page Hit", pageId + " by visitorId: " + visitorId);

                        //sendEmailToYourself("Special Page Hit", pageId+ " from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " visited: " + pageId);


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
                        //alert("logSpecialPageHit: " + pageHitSuccess.Success);
                        console.log("logSpecialPageHit: " + pageHitSuccess.Success);
                        sendEmailToYourself("FA logSpecialPageHit error", pageHitSuccess.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    sendEmailToYourself("LogVisit jqXHR" + getXHRErrorDetails(jqXHR, exception));
                    //alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}
