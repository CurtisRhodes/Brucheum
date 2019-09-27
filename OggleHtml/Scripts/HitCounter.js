// HITCOUNTER
var verbose = 9;

function logPageHit(pageId) {

    $('#footerMessage').html("logging page hit");
    //alert("logging page hit");

    var ipAddress = getLocalValue("IpAddress");
    var visitorId = getLocalValue("VisitorId");
    var userName = getLocalValue("User");

    if (isNullorUndefined(visitorId) && isNullorUndefined(ipAddress)) {
        // REQUIRES A HIT TO IPINFO.IO
        logVisitor(pageName);
    }
    else {
        //alert("logging proper page hit. UserName: "+userName)
        //public string VisitDate { get; set; }
        // log page hit
        var pageHitModel = {
            VisitorId: visitorId,
            UserName: userName,
            AppName: appName,
            IpAddress: ipAddress,
            PageId: pageName,
            Verbose: verbose
        };
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/HitCounter/LogPageHit",
            data: pageHitModel,
            success: function (pageHitSuccessModel) {
                if (pageHitSuccessModel.Success === "ok") {
                    //setLoginHeader(getCookieValue("User"));
                    if (pageHitSuccessModel.UserHits > freeVisitorHitsAllowed) {
                        alert("you hav now visited " + pageHitSuccessModel.UserHits + " pages." +
                            "\n It's time you Registered and logged in." +
                            "\n you will be placed in manditory comment mode until you log in ");
                    }
                    if (pageHitSuccessModel.WelcomeMessage !== null) {
                        alert("pageHitSuccessModel.WelcomeMessage: " + pageHitSuccessModel.WelcomeMessage);
                        $('#headerMessage').html(pageHitSuccessModel.WelcomeMessage);
                    }
                    else
                        $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
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

function logImageHit(link) {
    var visitorId = getLocalValue("VisitorId");
    if (visitorId !== '9bd90468-e633-4ee2-af2a-8bbb8dd47ad1') {

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/HitCounter/LogImageHit?visitorId=" + visitorId + "&linkId=" + link,
            success: function () {
            },
            error: function (jqXHR, exception) {
                alert("logImageHit error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}

function logVisitor(pageName) {
    $('#footerMessage').html("logging visitor");
    //alert("Hitting ip info");
    $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {

        //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
        //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")
        //var userName = getCookieValue("User");
        //if (userName === "cooler")
        //    alert("logging visitor");

        var visitorModel = {
            AppName: "OggleBooble",
            PageName: pageName,
            //UserName: userName,
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
            success: function (visitModel) {
                if (visitModel.Success === "ok") {
                    //if (userName === "cooler")
                    //alert("VisitorId: " + visitModel.VisitorId);


                    setLocalValue("VisitorId", visitModel.VisitorId);
                    setLocalValue("IpAddress", data.ip);

                    //if (userName === "cooler")
                    //alert("logoging page hit from Log Visitor. \nvisitModel.VisitorId: " + visitModel.VisitorId + "\ndocument.cookie: " + document.cookie);

                    logPageHit(pageName, "unkown visitor");

                    //var xxipAddress = getCookieValue("IpAddress");
                    //var xxvisitorId = getCookieValue("VisitorId");
                    //alert("ipAddress: " + xxipAddress + " visitorId: " + xxvisitorId);
                    //alert("MY document.cookie: " + document.cookie);

                    $('#footerMessage').html("");
                    if (visitModel.WelcomeMessage !== "") {
                        $('#headerMessage').html(visitModel.WelcomeMessage);
                    }
                    logging = false;
                }
                else
                    alert("ERROR: " + visitModel.Success);
            },
            error: function (jqXHR, exception) {
                $('#blogLoadingGif').hide();
                alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    });
}

function logSpecialPageHit() {


}
