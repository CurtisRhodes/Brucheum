var settingsArray = {};
var userRoles = [];

$(document).ready(function () {
    loadSettings();
});

function displayTanBlueMenu() {
    $('#leftColumn').html(`
        <div id="tanBlue" class="vMenu">
            <div id="itemIntelDesgn" class="tabvMenuItem" onclick="window.location.href='index.html?spa=IntelDsgn'">
                <img src="Images/TanBlue/IntelligentDesignTan.png" onmouseover="this.src='Images/TanBlue/IntelligentDesignBlue.png'" onmouseout="this.src='Images/TanBlue/IntelligentDesignTan.png'" />
            </div>
            <div id="itemBlondJew" class="tabvMenuItem" onclick="showBook(1)">
                <img src="Images/TanBlue/BlondJewTan.png" onmouseover="this.src='Images/TanBlue/BlondJewBlue.png'" onmouseout="this.src='Images/TanBlue/BlondJewTan.png'" />
            </div>
            <div id="itemBrucheum" class="tabvMenuItem" onclick="displayOldWebsite()">
                <img src="Images/TanBlue/BrucheumTan.png" onmouseover="this.src='Images/TanBlue/BrucheumBlue.png'" onmouseout="this.src='Images/TanBlue/BrucheumTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="displayFlitter()">
                <img src="Images/TanBlue/FlitterTan.png" onmouseover="this.src='Images/TanBlue/FlitterBlue.png'" onmouseout="this.src='Images/TanBlue/FlitterTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='index.html?spa=GetaGig'">
                <img src="Images/TanBlue/GetaJobTan.png" onmouseover="this.src='Images/TanBlue/GetaJobBlue.png'" onmouseout="this.src='Images/TanBlue/GetaJobTan.png'" />
            </div>
            <div class="tabvMenuItem" onclick="window.location.href='showbook(2)">
                <img src="Images/TanBlue/TimeSquaredTan.png" onmouseover="this.src='Images/TanBlue/TimeSquaredBlue.png'" onmouseout="this.src='Images/TanBlue/TimeSquaredTan.png'" />
            </div>
            <div id="item2aT" class="tabvMenuItem" onclick="display2aT()">
                <img src="Images/TanBlue/ToATeeTan.png" onmouseover="this.src='Images/TanBlue/ToATeeBlue.png'" onmouseout="this.src='Images/TanBlue/ToATeeTan.png'" />
            </div>
        </div>`
    );
}

function resizePage() {
    // set page width
    var winW = $(window).width();
    var lcW = $('#leftColumn').width();
    var rcW = $('#rightColumn').width();
    $('#middleColumn').width(winW - lcW - rcW);

    //set page height
    var winH = $(window).height();
    var headerH = $('header').height();
    $('#middleColumn').css('height', winH - headerH - 42);
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

function loadSettings() {
    document.title = "loading settings : Brucheum";
    $.ajax({
        type: "GET",
        url: "/Data/Settings.xml",
        dataType: "xml",
        success: function (settingsXml) {
            $(settingsXml).find('setting').each(function () {
                settingsArray[$(this).attr('name')] = $(this).attr('value');
            });
            document.title = "welcome : Brucheum";
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 444, "loadOggleSettings")) logError("XHR", 444, errMsg, "loadOggleSettings");
        }
    });
}

function sendEmail(to, from, subject, message) {
    try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/Common/SendEmail",
            data: {
                To: to,
                From: from,
                Subject: subject,
                Message: message
            },
            success: function (success) {
                if (success === "ok") {
                    //$('#footerMessage').html("email sent");
                    //displayStatusMessage("ok", "email sent");
                }
                else
                    logError("EME", 3992, success, subject);
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "sendEmail")) logError("XHR", 3992, errMsg, "sendEmail");
            }
        });
    } catch (e) {
        logError("CAT", 3992, e, "sendEmail");
    }
}

changeFavoriteIcon("intelDesign");
function changeFavoriteIcon(icon) {
    try {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        switch (icon) {
            case "brucheum": link.href = 'Images/Brucheum.ico'; break;
            case "intelDesign": link.href = 'Images/intel01.jpg'; break;
            case "getaJob": link.href = 'Images/GetaJob.png'; break;
            case "loading": link.href = "Images/loader.gif"; link.type = 'image/gif'; break;
            case "redBallon": link.href = 'Images/favicon.png'; break;
            default: link.href = 'Images/Brucheum.ico'; break;
        }
        document.getElementsByTagName('head')[0].appendChild(link);
    } catch (e) {
        logError("CAT", 3992, e, "changeFavoriteIcon");
    }
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
function logVisit() {

    //var x = getCookie("path");
    //alert("cookie path: " + x);


    //if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    var logVisitUserName = getCookie("User");
    //if (logVisitUserName !== "") {    }
     //alert("logVisit UserName: " + logVisitUserName);

    $('#footerMessage').html("logging visit userName: " + logVisitUserName);
    setLoginHeader(logVisitUserName);
    if (logVisitUserName === "") logVisitUserName = "unknown";
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/HitCounter/LogVisit?userName=" + logVisitUserName + "&appName=Ogglebooble",
        success: function (successModel) {
            if (successModel.Success === "ok") {
                $('#footerMessage').html("");
                if (successModel.ReturnValue !== "") {
                    $('#headerMessage').html(successModel.ReturnValue);
                }
            }
            else
                alert(successModel.Success);
        },
        error: function (jqXHR, exception) {
            $('#blogLoadingGif').hide();
            alert("LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
function logPageHit(folderName, appName) {
    //alert("logPageHit(" + folderName + "," + appName + ")");
    logVisit();
    $('#footerMessage').html("logging page hit");
    var userName = getCookie("User");
    if (userName === "")
        userName = "unknown";
    else {
        setLoginHeader(userName);
    }
    //if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    var hitCounterModel = {
        AppId: appName,
        PageName: folderName,
        UserName: userName
    };
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/HitCounter/LogPageHit",
        data: hitCounterModel,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (userName === "unknown")
                    $('#footerMessage').html("logPageHit: " + successModel.ReturnValue);
                else
                    $('#footerMessage').html("");
            }
            else
                alert("logPageHit: " + successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
