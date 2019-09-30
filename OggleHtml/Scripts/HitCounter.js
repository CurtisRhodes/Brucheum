// HITCOUNTER
var verbose = 2;

function logPageHit(pageId) {

    $('#footerMessage').html("logging page hit");

    var ipAddress = getLocalValue("IpAddress");
    var visitorId = getLocalValue("VisitorId");
    var userName = getLocalValue("User");

    if (isNullorUndefined(visitorId) && isNullorUndefined(ipAddress)) {
        // REQUIRES A HIT TO IPINFO.IO
        logVisitor(pageId);
    }
    else {
        //alert("logging proper page hit. UserName: " + userName);

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
                    $('#footerMessage').html("");
                    if (pageHitSuccessModel.Success === "ok") {
                        if (pageHitSuccessModel.UserHits > freeVisitorHitsAllowed) {
                            alert("you hav now visited " + pageHitSuccessModel.UserHits + " pages." +
                                "\n It's time you Registered and logged in." +
                                "\n you will be placed in manditory comment mode until you log in ");
                        }

                        if ($('#headerMessage').html() === "") {

                            if (pageHitSuccessModel.WelcomeMessage !== null) {
                                alert("pageHitSuccessModel.WelcomeMessage: " + pageHitSuccessModel.WelcomeMessage);
                                $('#headerMessage').html(pageHitSuccessModel.WelcomeMessage);
                            }
                            else
                                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
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
    var visitorId = getLocalValue("VisitorId");
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
    //alert("logging visitor  pageId: " + pageId);
    $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

        //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
        //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")

        var visitorModel = {
            AppName: "OggleBooble",
            PageId: pageId,
            //UserName: getCookieValue("User"),
            City: data.city,
            Region: data.region,
            Country: data.country,
            GeoCode: data.loc,
            IpAddress: data.ip
        };

        //alert("url: " + settingsArray.ApiServer + "api/HitCounter/LogVisitor");

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/HitCounter/LogVisitor",
            data: visitorModel,
            success: function (visitModel) {
                if (visitModel.Success === "ok") {
                    setLocalValue("VisitorId", visitModel.VisitorId);
                    setLocalValue("IpAddress", data.ip);
                    $('#footerMessage').html("");
                    if (visitModel.WelcomeMessage !== "") {
                        $('#headerMessage').html(visitModel.WelcomeMessage);
                    }
                }
                else
                    alert("logVisitor: " + visitModel.Success);
            },
            error: function (jqXHR, exception) {
                $('#blogLoadingGif').hide();
                alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    });
}

function logSpecialPageHit(pageName) {
    $('#footerMessage').html("logging special page hit");

    var ipAddress = getLocalValue("IpAddress");
    if ((ipAddress !== "68.203.90.183") && (ipAddress !== "50.62.160.105"))
    {
        var visitorId = getLocalValue("VisitorId");
        if (visitorId === undefined) {
            logVisitor(1);
        }
        else {
            //alert("logging special page hit  pagename: " + pageName + "   visitorId: " + visitorId);
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/HitCounter/LogSpecialPageHit?pageName=" + pageName + "&visitorId=" + visitorId,
                success: function (visitModel) {
                    if (visitModel.Success === "ok") {
                        $('#footerMessage').html("");
                        if (visitModel.WelcomeMessage !== "") {
                            $('#headerMessage').html(visitModel.WelcomeMessage);
                        }
                    }
                    else
                        alert("logSpecialPageHit: " + visitModel.Success);
                },
                error: function (jqXHR, exception) {
                    $('#blogLoadingGif').hide();
                    alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
    }
}
