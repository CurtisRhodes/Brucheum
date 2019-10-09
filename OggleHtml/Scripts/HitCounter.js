// HITCOUNTER
var verbose = 1;

function logPageHit(pageId) {
    //alert("logging page hit: " + pageId);
    var visitorId = getCookieValue("VisitorId");
    var ipAddress = getCookieValue("IpAddress");

    if (isNullorUndefined(visitorId)) {
        ipAddress = getCookieValue("IpAddress");
        if (!isNullorUndefined(ipAddress)) {
            //alert("how is it that I know the Ip and not the visitorId?");
            console.log("how is it that I know the Ip and not the visitorId?");
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                success: function (successModel) {
                    if (successModel.Success === "ok") {
                        setCookieValue("VisitorId", successModel.ReturnValue);
                        console.log("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                        alert("looping in log hit. GetVisitorIdFromIP. VisitorId: " + getCookieValue("VisitorId"));
                        logPageHit(pageId);
                    }
                    else
                        alert("GetVisitorIdFromIP: " + successl.Success);
                },
                error: function (jqXHR, exception) {
                    alert("GetVisitorIdFromIP jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {
                setCookieValue("IpAddress", data.ip);
                if (!isNullorUndefined(getCookieValue("IpAddress"))) {
                    logPageHit(pageId);
                    console.log("looping in log hit IpAddress: : " + getCookieValue("IpAddress"));
                    alert("looping in log hit IpAddress: : " + getCookieValue("IpAddress"));
                }
                else {
                    console.log("getCookieValue('IpAddress') not working in logPageHit + IPINNFO burn : " + getCookieValue("IpAddress"));
                    alert("getCookieValue('IpAddress') not working in logPageHit + IPINNFO burn : " + getCookieValue("IpAddress"));
                }
            });
        }
    }
    else {
        console.log("logging proper page hit. UserName: [" + userName + "] ip : " + ipAddress);
        $('#footerMessage').html("logging proper page hit.UserName: " + userName);
        var userName = getCookieValue("User");

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

                        if ($('#headerMessage').html() === "") {
                            if (pageHitSuccessModel.WelcomeMessage !== null) {
                                //alert("pageHitSuccessModel.WelcomeMessage: " + pageHitSuccessModel.WelcomeMessage);
                                $('#headerMessage').html(pageHitSuccessModel.WelcomeMessage);
                            }
                            else {
                                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                                //alert("pagehits: " + pageHitSuccessModel.PageHits);
                            }
                        }
                        else
                            alert("headerMessage is not empty: " + $('#headerMessage').html());
                    }
                    else {
                        alert("logPageHit: " + pageHitSuccessModel.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}


function logImageHit(link) {
    $('#footerMessage').html("logging image hit");
    var visitorId = getCookieValue("VisitorId");
    //alert("logImageHit() visitorId: " + visitorId);

    if (visitorId !== '9bd90468-e633-4ee2-af2a-8bbb8dd47ad1') 
    {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/HitCounter/LogImageHit?visitorId=" + visitorId + "&linkId=" + link,
            success: function (imageHitSuccessModel) {
                if (imageHitSuccessModel.Success === "ok") {
                    var imageHits = imageHitSuccessModel.ImageHits;
                    var userHits = imageHitSuccessModel.UserHits;
                }
                //else
                //    alert("logImageHit: " + imageHitSuccessModel.Success);
            },
            error: function (jqXHR, exception) {
                alert("logImageHit error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}

function logVisitor(pageId) {    
    var ipAddress = getCookieValue("IpAddress");
    if (!isNullorUndefined(ip)) {
        console.log("no need to Log Visistor I alread know ip: " + ipAddress);
        //$('#footerMessage').append("  no need to Log Visistor I alread know ip: " + ip);
    }
    else {
        $('#footerMessage').html("A HIT TO IPINFO.IO  ip: " + ipAddress);
        console.log("A HIT TO IPINFO.IO  ip: " + ipAddress);

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
                        setCookieValue("IpAddress", data.ip);

                        alert("setCookieValue('VisitorId'," + visitorSuccess.VisitorId);
                        setCookieValue("VisitorId", visitorSuccess.VisitorId);

                        if (visitorSuccess.IsNewVisitor) {
                            //sendEmailToYourself("THIS IS GETTING OLD: someone new just visited your site",
                            //    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                        }
                        else {
                            if (!isNullorUndefined(userName)) {
                                sendEmailToYourself("EXCELLENT! " + userName + " came back for another visit ",
                                    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                            }
                            else {
                                //sendEmailToYourself("lOCAL Someone came back for another visit",
                                //    visitorSuccess.PageName + " hit from " + data.city + "," + data.region + " " + data.country + " Ip: " + data.ip, "VisitorId: " + getCookieValue("VisitorId"));
                            }
                        }

                        $('#footerMessage').html("");
                        if (visitorSuccess.WelcomeMessage !== "") {
                            $('#headerMessage').html(visitorSuccess.WelcomeMessage);
                        }
                    }
                    else
                        alert("logVisitor: " + visitorSuccess.Success);
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        });
    }
}

function logSpecialPageHit(pageName) {
    //alert("logging special page hit " + pageName);
    $('#footerMessage').html("logging special page hit");
    //if (ipAddress !== "68.203.90.183" && ipAddress !== "50.62.160.105")
    {
        var visitorId = getCookieValue("VisitorId");

        if (isNullorUndefined(visitorId)) {
            var ipAddress = getCookieValue("IpAddress");
            //alert("ipAddress: " + ipAddress);
            if (!isNullorUndefined(ipAddress)) {
                //alert("how is it that I know the Ip and not the visitorId?");
                console.log("how is it that I know the Ip and not the visitorId?");
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
                    success: function (successModel) {
                        if (successModel.Success === "ok") {
                            setCookieValue("VisitorId", successModel.ReturnValue);
                            logSpecialPageHit(pageName);
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
                console.log("forced to hit IPINFO from log special page hit");
                alert("forced to hit IPINFO from log special page hit");
                $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

                    setCookieValue("IpAddress", data.ip);
                    if (!isNullorUndefined(getCookieValue("IpAddress"))) {
                        logSpecialPageHit(pageName);
                    }
                    else {
                        console.log("getCookieValue('IpAddress'): " + getCookieValue("IpAddress"));
                        alert("getCookieValue('IpAddress'): " + getCookieValue("IpAddress"));
                    }
                    //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
                    //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")
                });
            }
        }
        else {
         //   alert("logging proper special page hit  pagename: " + pageName + "   visitorId: " + visitorId);
            console.log("logging proper special page hit  pagename: " + pageName + "   visitorId: " + visitorId);
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/HitCounter/LogSpecialPageHit?pageName=" + pageName + "&visitorId=" + visitorId,
                success: function (pageHitSuccess) {
                    if (pageHitSuccess.Success === "ok") {
                        $('#footerMessage').html("");
                        if (pageHitSuccess.WelcomeMessage !== "") {
                            $('#headerMessage').html(pageHitSuccess.WelcomeMessage);
                        }

                        //public class PageHitSuccessModel {
                        //    public int PageHits { get; set; }
                        //    public int UserHits { get; set; }
                        //    public string WelcomeMessage { get; set; }
                        //    public string Success { get; set; }
                        //}

                        sendEmailToYourself("Special Page Hit", pageName + " by visitorId: " + visitorId);

                        //sendEmailToYourself("Special Page Hit", pageName+ " from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " visited: " + pageName);


                        //if (AppDomain.CurrentDomain.BaseDirectory != "F:\\Devl\\WebApi\\")
                        //{
                        //    Visitor visitor = db.Visitors.Where(v => v.VisitorId == visitorId).FirstOrDefault();
                        //    using (GodaddyEmailController godaddyEmail = new GodaddyEmailController())
                        //    {
                        //        godaddyEmail.SendEmail("ALRIGHT!. Somebody Visited " + pageName, visitor.IpAddress +
                        //            " from " + visitor.City + "," + visitor.Region + " " + visitor.Country + " visited: " + pageName);
                        //    }
                        //}

                    }
                    else
                        alert("logSpecialPageHit: " + pageHitSuccessl.Success);
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}
