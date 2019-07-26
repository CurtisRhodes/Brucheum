var settingsArray = {};

$(document).ready(function () {
    loadSettings();
});

function loadSettings() {
    $.ajax({
        type: "GET",
        url: "Data/Settings.xml",
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

function inClude() {

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

$(window).resize(function () {
    resizePage();
});

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

function onLoginClick() {
    $('#loginDialog').show();
    $('#loginDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: 333
    });

    $('#loginDialog').show();
    if (typeof pause === 'function')
        pause();
}

function onLogoutClick() {
    document.cookie = "User= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    $('#optionLoggedIn').hide();
    $('#optionNotLoggedIn').show();
}

function addClaim() {
    var cookieContents = document.cookie; // = "cookiename= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    alert("cookieContents: " + cookieContents);
}

function postLogin() {

    alert("txtLoginUserName: " + $('#txtLoginUserName').val());

    expires = new Date();
    expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
    document.cookie = 'User=' + $('#txtLoginUserName').val() + '; expires=' + expires.toUTCString();

    $('#loginDialog').dialog('close');
    getCookie("User");

    // add user to a table
    $.ajax({
        type: "POST",
        url: service + "api/Hitcounter/RecordLogin",
        success: function () {
            displayStatusMessage("ok", "thanks for logging in " + getCookie());
        },
        error: function (jqXHR, exception) {
            alert("AddMoreImages XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function getCookie(cname) {
    var decodedCookie = "";
    if (document.cookie) {
        if (cname === null)
            cname = "User";
        var name = cname + "=";
        decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {

                $('#spnUserName').html(c.substring(name.length, c.length));
                $('#optionLoggedIn').show();
                $('#optionNotLoggedIn').hide();
                //alert("cookie success");
                return c.substring(name.length, c.length);
            }
        }
    }
    return decodedCookie;
}

function staticPageShowRegisterDialog() {
    $('#registerUserDialog').fadeIn();
}

function transferToRegisterPopup() {

}

