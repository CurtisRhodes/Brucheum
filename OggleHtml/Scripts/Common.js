var settingsArray = {};
var userRoles = [];
var freeVisitorHitsAllowed = 1500;

$(document).ready(function () {
    loadSettings();
});

function loadSettings() {
    $.ajax({
        type: "GET",
        url: "/Data/Settings.xml",
        dataType: "xml",
        success: function (xml) {
            $(xml).find('setting').each(function () {
                settingsArray[$(this).attr('name')] = $(this).attr('value');
            });
        },
        error: function (jqXHR, exception) {
            alert("getSettings jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status === 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            };
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}

function getParams() {
    var params = {},
        pairs = document.URL.split('?').pop().split('&');
    for (var i = 0, p; i < pairs.length; i++) {
        p = pairs[i].split('=');
        params[p[0]] = p[1];
    }
    return params;
}

function resizePage() {
    // set page width
    var winW = $(window).width();
    var lcW = $('#leftColumn').width();
    var rcW = $('#rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);

    //set page height
    var winH = $(window).height();
    var headerH = $('header').height();
    $('#middleColumn').height(winH - headerH);
}

function displayStatusMessage(msgCode, message) {

    var severityClassName;
    switch (msgCode) {
        case "ok":
            severityClassName = "severityOk";
            break;
        case "warning":
            severityClassName = "severityWarning";
            break;
        case "error":
            severityClassName = "severityError";
            break;
        default:
            severityClassName = msgCode;
    }
    //.severityOk {background - color: rgba(88, 139, 108, 0.75);    }
    //.severityWarning {        background - color: #e6de3b;    }
    //.severityError {        background - color: #c64e4e;    }

    $('#divStatusMessage').removeClass();
    $('#divStatusMessage').addClass(severityClassName);
    $('#divStatusMessage').html(message);
    $('#divStatusMessage').show();

    if (msgCode === "ok") {
        setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 2500);
    }
    else {
        setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 15000);
    }
}

function getXHRErrorDetails(jqXHR) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status === 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status === 500) {
        msg = 'Internal Server Error [500].';

    } else if (jqXHR.responseText === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (jqXHR.responseText === 'timeout') {
        msg = 'Time out error.';
    } else if (jqXHR.responseText === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    return msg;
}

function isNullorUndefined(val) {
    if (val === "")
        return true;
    if (val === null)
        return true;
    if (val === undefined)
        return true;
    if (val === "undefined")
        return true;
    return false;
}

function logActivity(changeLogModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/ChangeLog",
        data: changeLogModel,
        success: function (success) {
            if (success === "ok")
                displayStatusMessage("ok", "add image logged");
            else
                alert("ChangeLog: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("ChangeLog xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function setLocalValue(localName, localValue) {
    setCookieValue(localName, localValue);
    window.localStorage[localName] = localValue;
    //alert("window.localStorage[" + localName + "] = " + localValue);
}

function getLocalValue(localName) {
    var localValue = getCookieValue(localName);
    if (isNullorUndefined(localValue)) {
        localValue = window.localStorage[localName];
        if (!isNullorUndefined(localValue)) {
            //alert("cookie didn't work but localStorage did. " + localName + ": " + localValue);
        }
    }
    //alert("window.localStorage[" + localName + "] = " + localValue);
    return localValue;
}

// HITCOUNTER
function logPageHit(pageName, appName) {
    var verbose = 0;

    $('#footerMessage').html("logging page hit");
    //alert("logging page hit");

    var ipAddress = getLocalValue("IpAddress");
    var visitorId = getLocalValue("VisitorId");
    //if (isNullorUndefined("VisitorId")) {        alert("VisitorId fail");    }

    var userName = getLocalValue("User");

    if (isNullorUndefined(visitorId) && isNullorUndefined(ipAddress)) {
        // REQUIRES A HIT TO IPINFO.IO
        logVisitor(pageName);
    }
    else {
        //alert("logging proper page hit");
        //public string VisitDate { get; set; }
        // log page hit
        var pageHitModel = {
            VisitorId: visitorId,
            UserName: userName,
            AppName: appName,
            IpAddress: ipAddress,
            PageName: pageName,
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
    if (visitorId != '9bd90468-e633-4ee2-af2a-8bbb8dd47ad1') {

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

var logging = false;
function logVisitor(pageName) {
    if (!logging) {
        logging = true;
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
}

// COMMON CONTEXTMENU FUNCTIONS
function showLinks(linkId) {
    $.ajax({
        type: "PATCH",
        url: settingsArray.ApiServer + "api/ImagePage?linkId=" + linkId,
        success: function (linksModel) {
            if (linksModel.Success === "ok") {
                $('#linkInfo').show();
                $('#linkInfoContainer').html("");
                $.each(linksModel.Links, function (idx, obj) {
                    $('#linkInfoContainer').append("<div id='" + obj.FolderId + "' class='linkInfoItem' onclick='openLink(" + obj.FolderId + ")'>" + obj.PathName + "</div>");
                });
            }
            else
                alert("showLinks: " + linksModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("showLinks error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function openLink(folderId) {
    window.open("/album.html?folder=" + folderId, "_blank");
}

function setFolderImage(linkId, folderId, level) {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", level + " image set");
                $('#thumbImageContextMenu').fadeOut();
                if (typeof viewerShowing === "boolean") {
                    if (viewerShowing)
                        slide("next");
                }
            }
            else {
                alert("setFolderImage: " + success);
            }
        },
        error: function (xhr) {
            alert("setFolderImage xhr error: " + xhr.statusText);
        }
    });
}

function checkForLink(folderId, hrefTextSubstring) {
    //alert("containsLink(" + folderId + "," + hrefTextSubstring + ")");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/HasLink?folderId=" + folderId + "&hrefTextSubstring=" + hrefTextSubstring,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (successModel.ReturnValue !== "no") {
                    var p = successModel.ReturnValue;
                    if (hrefTextSubstring === "freeones") {

                        //var zp = "<a https://www.freeones.com/html/" + p.substring(p.indexOf("https://www.freeones.com") + 38);  //, p.substring(p.indexOf("https://www.freeones.com", 39)).indexOf('>'));
                        var zp = "<a https://www.freeones.com/html/" + p.substring(p.indexOf("https://www.freeones.com") + 31);//, (p.substring(p.indexOf("https://www.freeones.com") + 38)).indexOf('>'));
                        var zp2 = zp.substring(0, zp.indexOf('>') - 1) + " target='_blank'>";
                        //alert("link: "+  zp2);

                        $('#freeonesLink').show();
                    }
                    if (hrefTextSubstring === "babepedia") {
                        $('#babapediaLink').show();
                    }
                }
            }
            else
                alert("checkForLink: " + successModel.Success);
        },
        error: function (xhr) {
            alert("containsLink xhr: " + getXHRErrorDetails(xhr));
        }
    });
}

// GET BUILD INFO
function getFileDate() {
    


}

