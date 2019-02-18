

function showBreadCrumbs(folder) {
    var sc = folder.split("/");
    var bcPath = "";
    $('#headerMessage').html("");
    //$('#headerMessage').append("<a class='activeBreadCrumb' href='Index'>home</a>");
    bcPath = sc[0].replace(/ /g, "%20");
    $('#headerMessage').append("<a class='activeBreadCrumb' href='/Home/imagePage?folder=" + bcPath + "'>" + sc[0] + "</a>");
    for (i = 1; i < sc.length; i++) {
        bcPath += "/" + sc[i].replace(/ /g, "%20");
        if (i < Number(sc.length - 1)) {
            $('#headerMessage').append("<a class='activeBreadCrumb' href='/Home/imagePage?folder=" + bcPath + "'>" + sc[i] + "</a>");
        }
        else {
            $('#headerMessage').append("<span class='inactiveBreadCrumb'>" + sc[i] + "</span>");
        }
    }
    //$('#replaceableMenuItems').append("<a id='slideShowLink' class='slideShowBreadCrub' href='Viewer?folder=" + bcPath + "'>SlideShow</a>");
}

function setOBCookie(key, value) {
    var expires = new Date();
    expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
    document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getOBCookie(key, defaultValue) {
    var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
    if (keyValue == null) {
        alert("still no cookie");
        setOBCookie(key, defaultValue);
        keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
        return keyValue[2];
    }
    else
        return keyValue[2];
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

function clearModal() {
    $('#modalContainer').hide();
    $('#modalContent').html();
}

function PublicAlert(message) {
    //var messHtml="

}

function beautify(stankyString) {
    return stankyString.replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/\n/g, "");
}

function SetOggleBoobleCookie(userName, userId, useCookie) {
    try {
        alert("SetOggleBoobleCookie userName: " + userName + "userId: " + userId + "useCookie: " + useCookie);
        $.ajax({
            type: "get",
            url: "/Login/SetOggleBoobleCookie?userName=" + userName + "&userId=" + userId + "&useCookie=" + useCookie,
            datatype: "json",
            success: function (success) {
                if (success === "ok")
                    $("#divlogin").load(location.href + " #divlogin");
                else
                    alert("SetBrucheumCookie error: " + success);
            },
            error: function (xhr) {
                displayStatusMessage("alert-danger", "error: " + xhr.statusText);
                alert("SetBrucheumCookie  error: " + xhr.statusText);
            }
        });
    } catch (e) {
        alert("SetBrucheumCookie  catch: " + e);
    }
}

function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    //var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(); // + "  " + strTime;
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

function sendEmailFromJS(msg, body) {

    //alert("sendEmailFromJS 1");
    var rtn = "";
    try {
        var emailMessage = new Object();
        emailMessage.Subject = msg;
        emailMessage.Body = body;

        var service = "https://api.curtisrhodes.com/";
        //service = "http://localhost:40395/";

        //alert("url: " + service + "api/GodaddyEmail");
        $.ajax({
            type: "POST",
            url: service + "api/GodaddyEmail",
            data: emailMessage,
            success: function (emailSuccess) {
                if (emailSuccess === "ok") {
                    displayStatusMessage("ok", "email sent");
                    //alert("Email says: " + sendObj.Subject);
                }
                else {
                    alert("Email Fail: " + emailSuccess);
                }
                rtn = emailSuccess;
            },
            error: function (jqXHR, exception) {
                alert("sendEmailFromJS XHR error: " + getXHRErrorDetails(jqXHR, exception));
                rtn = getXHRErrorDetails(jqXHR, exception);
            }
        });
    } catch (e) {
        rtn = e;
        alert("sendEmailFromJS CATCH: " + rtn);
    }
    return rtn;
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

function loginPlease() {
    if (!isNullorUndefined($('#btnLayoutLogin').offset())) {
        var loff = $('#btnLayoutLogin').offset().left;
        $('#btnHeaderLoginSpinner').css("left", loff + 30);
        $('#btnHeaderLoginSpinner').show();
    }
    $.ajax({
        type: "get",
        url: "/Login/LoginPopup",
        datatype: "json",
        success: function (data) {
            $('#modalContent').html(data);
            $('#modalContainer').show();
            $('#btnHeaderLoginSpinner').hide();
        },
        error: function (jqXHR, exception) {
            alert("LoginPopup XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
function registerPlease() {
    if (!isNullorUndefined($('#btnLayoutLogin').offset())) {
        var loff = $('#btnLayoutLogin').offset().left;
        $('#btnHeaderLoginSpinner').css("left", loff + 30);
        $('#btnHeaderLoginSpinner').show();
    }
    $.ajax({
        type: "get",
        url: "/Login/Register",
        datatype: "json",
        success: function (data) {
            $('#modalContent').html(data);
            $('#modalContainer').show();
            $('#btnHeaderRegisterSpinner').hide();
        },
        error: function (jqXHR, exception) {
            alert("RegisterPopup XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
function profilePease() {
    try {
        $.ajax({
            type: "get",
            url: "/Login/ProfilePopup",
            datatype: "json",
            success: function (data) {
                $('#modalContent').html(data);
                $('#modalContainer').show();
            },
            error: function (jqXHR, exception) {
                alert("ProfilePopup XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("tabProfile catch: " + e);
    }
}
function logoutPlease() {
    try {
        $.ajax({
            type: "get",
            url: "/login/Logout",
            success: function (success) {
                if (success === "ok")
                    location.reload(true);
                else
                    alert("callLogout: " + success);
            },
            error: function (jqXHR, exception) {
                alert("logoutPlease XHR error: " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    } catch (e) {
        alert("callLogout catch: " + e);
    }
}
