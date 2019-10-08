// HITCOUNTER
var verbose = 1;

function logPageHit(pageId) {
    //alert("logging page hit: " + pageId);
    var ipAddress = getCookieValue("IpAddress");
    //if (isNullorUndefined(visitorId) && isNullorUndefined(ipAddress)) {
    if (isNullorUndefined(ipAddress)) {
        // REQUIRES A HIT TO IPINFO.IO
        alert("A HIT TO IPINFO.IO  ip: " + ipAddress);
        $('#footerMessage').html("A HIT TO IPINFO.IO  ip: " + ipAddress);
        logVisitor(pageId);
    }
    else {
        //alert("logging proper page hit. UserName: " + userName + "] ip : " + ipAddress);
        $('#footerMessage').html("logging proper page hit.UserName: " + userName);
        var userName = getCookieValue("User");

        //if ((ipAddress !== "68.203.90.183") && (ipAddress !== "50.62.160.105"))
        {
            var visitorId = getCookieValue("VisitorId");
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
    
    //alert("logging visitor  userName: " + userName);
    //alert("logging visitor  pageId: " + pageId);
    var ip = getCookieValue("IpAddress");
    if (!isNullorUndefined(ip)) {
        //  alert("no need to Log Visistor I alread know ip: " + ip);
        $('#footerMessage').append("  no need to Log Visistor I alread know ip: " + ip);
    }
    else {
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

                        //alert("setCookieValue('VisitorId'," + visitorSuccess.VisitorId);
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

    $('#footerMessage').html("logging special page hit");

    //var ipAddress = getCookieValue("IpAddress");
    //if (ipAddress === undefined) {
    //    alert("logSpecialPageHit  ipAddress: " + ipAddress);
    //}

    //if (ipAddress !== "68.203.90.183" && ipAddress !== "50.62.160.105")
    {
        var visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {

//alert("logSpecialPageHit FAIL: visitorId: " + visitorId);


            logVisitor(1);
        }
        else {
            //alert("logging special page hit  pagename: " + pageName + "   visitorId: " + visitorId);

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
