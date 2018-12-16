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
    var loff = $('#btnLayoutLogin').offset().left;
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
        error: function (jqXHR, exception) {
            alert("LoginPopup XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
function registerPlease() {
    var loff = $('#btnLayoutRegister').offset().left;
    $('#btnHeaderRegisterSpinner').css("left", loff + 30);
    $('#btnHeaderRegisterSpinner').show();
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

function logPageHit(service, userName, ipAddress, page, details) {
    try {
        alert("logPageHit ipAddress: " + ipAddress);
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
            error: function (jqXHR, exception) {
                alert("logPageHit XHR error: " + getXHRErrorDetails(jqXHR, exception));
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

function setLayout(layoutName) {
    //use "menuContainer" to remove logon tabs  #replaceableMenuItems to keep them
    switch (layoutName) {
        case 'Admin':
            $('#bheader').css("background-color", "#ffcccc");
            $('#bannerTitle').html("Admin");
            $('#menuContainer').html(
                `<div class="menuTab floatLeft"><a href="~/Article/ArticleList">Directory</a></div>
                 <div class="menuTab floatLeft"><a href="/GetaJob/GetaJobAdmin">GetaJob</a></div>
                 <div class="menuTab floatLeft"><a href="~/Article/ArticleList">Refs</a></div>
                 <div class="menuTab floatLeft"><a href="~/~/Article/ArticleList">Articles</a></div>
                 <div class="menuTab floatLeft"><a href="/Home/Apps">Apps</a></div>
                 <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>`);
           break;
        case 'Resume':
            $('#bannerTitle').html("Resume Builder");
            //$('#divTopLeftLogo').html("<a href='~/Home/Index'><img src='~/images/house.gif' class='bannerImage'/></a>");
            $('#divTopLeftLogo').html("<a href='/IntelDsgn/Index'><img src='~/images/intel01.jpg' class='bannerImage'/></a>");
            $('#bheader').css("background-color", "#c64e4e");
            $('#replaceableMenuItems').html(
                `<div class="menuTab floatLeft"><a href="/GetaJob/GetaJobAdmin">GetaJob</a></div>
                 <div class="menuTab floatLeft"><a href="~/Article/ArticleList">Refs</a></div>
                 <div class="menuTab floatLeft"><a href="~/~/Article/ArticleList">Articles</a></div>
                 <div class="menuTab floatLeft"><a href="/Home/Apps">Apps</a></div>
                 <div class="menuTab floatLeft"><a href="/IntelDsgn/Index">Intelligent Design</a></div>`);
            break;
        case 'Intelligent Design':
            $('#bannerTitle').html("Intelligent Design");
            $('#divTopLeftLogo').html("<a href='/IntelDsgn/Index'><img src='/images/intel01.jpg' class='bannerImage'/></a>");
            $('#bheader').css("background-color", "#d6f5f5");
            $('.headerTitle').css("color", "#333");
            //$('.menuTab a: hover').css("color", "#eee");
            //background - color: #222730; /* #273235; #486167;*/
            $('#replaceableMenuItems').html(`
               <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Index?a=2">Our Approach</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Blog/">Blog</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/Index?a=3">Contact Us</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/MyResume/">My Resume</a></div>`);
                //<div class="menuTab floatLeft"><a href="~/IntelDsgn/About/">Who We Are</a></div>
                //<div class="menuTab floatLeft"><a href="~/IntelDsgn/Portfolio">Portfolio</a></div>
                //<div class="menuTab floatLeft"><a href="~/IntelDsgn/Code">Sample Code</a></div>
                //<div class="menuTab floatLeft"><a href="~/home/journal/">Blog</a></div>
                //<div class="menuTab floatLeft"><a href="~/IntelDsgn/Articles">Articles</a></div>
                //<div class="menuTab floatLeft"><a href="~/IntelDsgn/MyResume">My Resume</a></div>
            break;
        case 'GetaJob':
            $('#divTopLeftLogo').html("<a href='/GetaJob'><img src='/images/Apps/GetaJob.png' class='bannerImage'/></a>");
            $('head title').html("Get a Gig");
            //$('#bheader').css("background-color", "#ffffe6");
            $('#bheader').css("background-color", "#fff");
            $('#bannerTitle').html("Get a Gig");
            $('#replaceableMenuItems').html(`
               <div class="menuTab floatLeft"><a href="/Home/Index/">CurtisRhodes.com</a></div>
               <div class="menuTab floatLeft"><a href="/GetaJob/GetaJobAdmin">Job Search</a></div>
               <div class="menuTab floatLeft"><a href="/GetaJob/GetaJobAdmin">Skills</a></div>
               <div class="menuTab floatLeft"><a href="/GetaJob/Agent">Reports</a></div>
               <div class="menuTab floatLeft"><a href="/Resume/ResumeAdmin">Resume Builder</a></div>
               <div class="menuTab floatLeft"><a href="/IntelDsgn/MyResume/">My Resume</a></div>`);
            break;
        default:
    }
}

function isNullorUndefined(val) {
    if (val == "")
        return true;
    if(val == null)
        return true;
    if (val == undefined)
        return true;
    return false;
}