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

// HITCOUNTER
function logPageHit(pageName, appName) {
    var verbose = false;
    $('#footerMessage').html("logging page hit");

    //setLoginHeader(getCookieValue("User"));

    var visitorId = getCookieValue("VisitorId");
    //var ipAddress = getCookieValue("IpAddress");
    if (visitorId === "" || ipAddress === "") {
        logVisitor(pageName);
    }
    else {
        //alert("logging page hit");
        //if ((data.ip === "68.203.90.183") || (data.ip === "50.62.160.105")) return "ok"; else
        {
            var hitCounterModel = {
                VisitorId: visitorId,
                AppName: appName,
                IpAddress: ipAddress,
                PageName: pageName,
                UserName: getCookieValue("User"),
                Verbose: verbose
            };
            $.ajax({
                type: "PUT",
                url: settingsArray.ApiServer + "api/HitCounter/LogPageHit",
                data: hitCounterModel,
                success: function (pageHitSuccessModel) {
                    if (pageHitSuccessModel.Success === "ok") {
                        if (pageHitSuccessModel.UserHits > freeVisitorHitsAllowed) {
                            alert("you hav now visited " + successModel.ReturnValue + " pages." +
                                "\n It's time you Registered and logged in." +
                                "\n you will be placed in manditory comment mode until you log in ");
                        }



                        //if (userName === "unknown")
                        //    $('#footerMessage').html("logPageHit: " + successModel.ReturnValue);
                        //else

                                $.ajax({
                                    type: "POST",
                                    url: settingsArray.ApiServer + "api/HitCounter/LogVisit?visitorId=" + visitorId,
                                    success: function (visitSuccess) {
                                        if (visitSuccess.Success === "ok") {
                                            if (visitSuccess.WelcomeMessage === "")
                                                $('#headerMessage').html("pagehits: " + pageHitSuccessModel.PageHits);
                                            else
                                                $('#headerMessage').html(visitSuccess.WelcomeMessage);
                                            //$('#footerMessage').html(visitSuccess.WelcomeMessage);
                                            //alert("logVisitModel.WelcomeMessage: " + visitSuccess.WelcomeMessage);
                                        }
                                        else
                                            alert("LogVisit success: " + visitSuccess.Success);
                                    },
                                    error: function (jqXHR, exception) {
                                        alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                                    }
                                });
                        //$('#footerMessage').html("");
                    }
                    else {
                        alert("logPageHit: " + successModel.Success);
                    }
                },
                error: function (jqXHR, exception) {
                    alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }

    }
}

function logVisitor(pageName) {
    $('#footerMessage').html("logging visitor");
    alert("logging visitor");

    $.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {
        //$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: " 
        //+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")
        var userName = "";  // getCookieValue("User");
        if (userName === "")
            userName = "unknown";

        var visitorModel = {
            AppName: "OggleBooble",
            PageName: pageName,
            CookieName: userName,
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

                    setCookieValue("VisitorId", visitModel.VisitorId);
                    alert("setCookieValue(IpAddress,: " + data.ip);
                    setCookieValue("IpAddress", data.ip);

                    $('#footerMessage').html("");
                    if (visitModel.WelcomeMessage !== "") {
                        $('#headerMessage').html(visitModel.WelcomeMessage);
                    }
                }
                else
                    alert(visitModel.Success);
            },
            error: function (jqXHR, exception) {
                $('#blogLoadingGif').hide();
                alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    });
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

// SET HEADER
function getHeader(subdomain) {

    //$('#replaceableMenuItems').append("<div id='babapediaLink' class='menuTabs'>\n" +
    //    "              <a href='https://www.babepedia.com' target='_blank'><img src='/Images/babepedia.png' class='freeones'></a>" +
    //    "           </div>\n");

    var headerHtml;
    if (subdomain === "boobs" || subdomain === "archive") {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
            "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
            "                <a href='/album.html?folder=2'><span class='bigTits'>BIG </span>tits</a> organized by\n" +
            "                <a href='/album.html?folder=136'> poses,</a>\n" +
            "                <a href='/album.html?folder=159'> topic,</a>\n" +
            "                <a href='/album.html?folder=199'> shapes</a> and\n" +
            "                <a href='/album.html?folder=241'>sizes</a>\n" +
            "            </div>\n" +
            "        </div>\n";
    }
    if (subdomain === "playboy" || subdomain === "playmates") {
        headerHtml =
        "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
        "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
        "           <div class='headerSubTitle' id='headerSubTitle'>Every Playboy Centerfold" +
        "            </div>\n" +
        "        </div>\n";
    }
    if (subdomain === "admin") {
        headerHtml =
            "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
            "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>Admin" +
            "            </div>\n" +
            "        </div>\n";
    }

    if (subdomain === "porn" || subdomain === "sluts") {
        $('body').addClass('pornBodyColors');
        headerHtml =
            "   <div id='divTopLeftLogo' class='pornHeaderColors bannerImageContainer'>\n" +
            "       <a href='/index.html?subdomain=porn'><img src='Images/csLips02.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='pornHeaderColors headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OgglePorn</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
            "               <a href='/album.html?folder=243'>cock suckers</a>, \n" +
            "               <a href='/album.html?folder=420'>boob suckers</a>, \n" +
            "               <a href='/album.html?folder=357'>cum shots</a>, \n" +
            "               <a href='/album.html?folder=397'>kinky</a> and \n" +
            "               <a href='/album.html?folder=411'>naughty behaviour</a>\n" +
            "           </div>\n" +
            "       </div>\n";
    }

    headerHtml+=
        "   <div class='headerBottomRow'>\n" +
        "       <div id='headerMessage' class='floatLeft'></div>\n" +
        "       <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "       <div class='menuTabs replaceableMenuItems'>\n" +
        "           <div id='freeonesLink' class='menuTabs displayHidden'>\n" +
        "              <a href='http://www.freeones.com' target='_blank'><img src='/Images/freeones.png' class='freeones'></a>" +
        "           </div>\n" +
        "           <div id='babapediaLink' class='menuTabs displayHidden'>\n" +
        "              <a href='https://www.babepedia.com' target='_blank'><img src='/Images/babepedia.png' class='freeones'></a>" +
        "           </div>\n" +
        "       </div>\n" +
        "       <div id='optionLoggedIn' class='displayHidden'>\n" +
        "           <div class='menuTab floatRight'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "           <div class='menuTab floatRight' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "       </div>\n" +
        "       <div id='optionNotLoggedIn'>\n" +
        "           <div id='btnLayoutRegister' class='menuTab floatRight'><a href='javascript:onRegisterClick()'>Register</a></div>\n" +
        "               <div id='btnLayoutLogin' class='menuTab floatRight'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
        "           </div>\n" +
        "           <div class='menuTabs' id='adminTabs'>\n" +
        "              <div id='menuTabAdmin' class='menuTab displayHidden loginRequired floatRight'><a href='/Dashboard.html'>dashboard</a></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n";

    $('header').html(headerHtml);
}


