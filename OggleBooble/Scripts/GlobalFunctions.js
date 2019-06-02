﻿/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
  }
}

function showSiteContent(dest, blogId) {
    try {
        pause();
        $.ajax({
            type: "GET",
            url: service + "api/OggleBlog/?blogId=" + blogId,
            success: function (entry) {
                if (entry.Success == "ok") {
                    dest.html(entry.CommentText);
                }
                else
                    dest.html(entry.Success);
            },
            error: function (xhr) {
                alert("showSiteContent xhr: " + getXHRErrorDetails(xhr));
            }
        });
    } catch (e) {
        alert("showSiteContent: " + e);
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

function clearModal() {
    $('#modalContainer').hide();
    $('#modalContent').html();
}

function toggleDirTree(id) {
    if ($('#' + id + '').css("display") === "none")
        $('#S' + id + '').html("[-] ");
    else
        $('#S' + id + '').html("[+] ");
    $('#' + id + '').toggle();
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

function sendEmailFromJS(subject, messsage) {
    var rtn = "";
    try {
        $.ajax({
            type: "GET",
            url: "/Email/SendEmail?subject=" + subject + "&message=" + messsage,
            success: function (emailSuccess) {
                if (emailSuccess === "ok") {
                    displayStatusMessage("ok", "email sent");
                }
                else {
                    console.log("Email Fail: " + emailSuccess);
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
