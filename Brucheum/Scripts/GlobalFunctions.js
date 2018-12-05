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
		$('#divStatusMessage').css("color", "#fff");
		setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 15000);
	}
}

function showCustomMessage(title, message) {
    $('#customMessage').show();
    $('#customMessageTitle').html(title);
    $('#customMessageText').html(message);
}

function clearModal() {
	$('#modalContainer').hide();
	$('#modalContent').html();
}

function loginPlease() {
    var loff = $('#btnLayLogin').offset().left;
    $('#btnHeaderLoginSpinner').css("left", loff + 30);
    $('#btnHeaderLoginSpinner').show();
    $.ajax({
        type: "get",
        url: "/Login/LoginPopup",
        datatype: "json",
        success: function (data) {
            $('#modalContent').html(data);
            $('#modalContainer').show();
            $('#btnHeaderLoginSpinner').hide();
        },
        error: function (xhr) {
            alert("RegisterPopup error: " + xhr.statusText);
        }
    });
}
function registerPlease() {
    $.ajax({
        type: "get",
        url: "/Login/Register",
        datatype: "json",
        success: function (data) {
            $('#modalContent').html(data);
            $('#modalContainer').show();
        },
        error: function (xhr) {
            alert("RegisterPopup error: " + xhr.statusText);
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
            error: function (xhr) {
                alert("ProfilePopup error: " + xhr.statusText);
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
            error: function (xhr) {
                alert("callLogout XHR error: " + xhr.statusText);
            }
        });
    } catch (e) {
        alert("callLogout catch: " + e);
    }
}

function sendEmailFromJS(msg, body) {

    //alert("sendEmailFromJS 1");

    try {
        var sendObj = new Object();
        sendObj.Subject = msg;
        sendObj.Body = body;

        var rtn = "async";
        //alert("sendEmailFromJS msg: " + msg + " body: " + body);
        $.ajax({
            type: "POST",
            url: "https://api.curtisrhodes.com/api/Email/",
            //url: "http://localhost:40395/Api/Email/Send",
            data: sendObj,
            async: false,
            success: function (emailSuccess) {
                if (emailSuccess === "ok") {
                    displayStatusMessage("ok", "email sent");
                    //alert("Email says: " + sendObj.Subject);
                }
                else
                    alert("Email Fail: " + emailSuccess);
                rtn = emailSuccess;
            },
            error: function (xhr) {
                rtn = xhr.statusText;
                //displayStatusMessage("error", "error: " + xhr.statusText);
                alert("sendEmailFromJS XHR error: " + rtn);
            }
        });
    } catch (e) {
        rtn = e;
        alert("sendEmailFromJS CATCH: " + rtn);
    }
    return rtn;
}

function logPageHit(service, userName, ipAddress, page, details) {
    try {

    $.ajax({
        type: "GET",
        url: service + "/api/HitCounter/AddPageHit?ipAddress=" + ipAddress + "&app=Brucheum&page=" + page + "&details=" + details,
        success: function (success) {
            if (!success.startsWith("ERROR")) {
                //sendEmailFromJS("Page Hit", ipAddress + " visited " + page + " " + details);
                displayStatusMessage("ok", "email sent");
            }
            else
                alert("logPageHit Fail: " + success);
        },
        error: function (xhr) {
            //displayStatusMessage("error", "error: " + xhr.statusText);
            alert("Page Hit XHR error: " + xhr.statusText);
        }
    });
    } catch (e) {
        alert("logPageHit CATCH error: " + e);

    }
}

function beautify(stankyString) {
    if (stankyString === undefined)
        return stankyString;
    return stankyString.replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/%20/g, "_")
        .replace(/\n/g, "");
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
