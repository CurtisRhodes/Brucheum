let verbosity = 5,
    freeVisitorHitsAllowed = 7500,
    settingsArray = {},
    userRoles = [],
    viewerShowing = false,
    waitingForReportThenPerformEvent = true,
    forgetShowingCustomMessage = true,
    settingsImgRepo;

//if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
//<script src="https://www.google.com/recaptcha/api.js" async defer></script>
//<div class="g-recaptcha" data-sitekey="6LfaZzEUAAAAAMbgdAUmSHAHzv-dQaBAMYkR4h8L"></div>

function loadOggleSettings() {
    $.ajax({
        type: "GET",
        url: "/Data/Settings.xml",
        dataType: "xml",
        success: function (settingsXml) {
            $(settingsXml).find('setting').each(function () {
                settingsArray[$(this).attr('name')] = $(this).attr('value');
            });
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadSettings")) {
                if (document.domain === "localhost") alert("loadSettings: " + errorMessage);
                else
                    logError({
                        VisitorId: "877",
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "common.js loadSettings"
                    });
                //sendEmailToYourself("XHR error in common.js loadSettings", "/Data/Settings.xml Message: " + errorMessage);
            }
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

function dateString(dateObject) {
    var d = new Date(dateObject);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var date = month + "/" + day + "/" + year;

    return date;
};

function dateString2(dateObject) {
    var d = new Date(dateObject);
    var day = d.getDate();
    var month = d.getMonth() + 1;
    //var year = d.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    var strDate = month + "/" + day; // + "/" + year;

    return strDate;
};

function resizePage() {
    //This page uses the non standard property “zoom”. Consider using calc() in the relevant property values, 
    // or using “transform” along with “transform - origin: 0 0”.album.html

    // set page width
    var winW = $(window).width();
    var lcW = $('.leftColumn').width();
    var rcW = $('.rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);
    //set page height
    //var winH = $(window).height();
    //var headerH = $('header').height();
    //$('.middleColumn').height(winH - headerH);
}

function letemPorn(response, pornType, pageId) {
    // if (document.domain === 'localhost') alert("letemPorn: " + pornType);
    if (response === "ok") {
        //  setUserPornStatus(pornType);
        //<div onclick="goToPorn()">Nasty Porn</div>
        //window.location.href = '/index.html?subdomain=porn';
        if (isNullorUndefined(pornType)) {
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "PRN",
                Severity: 2,
                ErrorMessage: "isNullorUndefined(pornType)",
                CalledFrom: "HitCounter.js letemPorn"
            });
            //sendEmailToYourself("letemPorn problem", "pornType missing");
            pornType = "UNK";
        }
        reportThenPerformEvent("PRN", "xx", pornType, pageId);
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
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

function refreshPage() {
    //sendEmailToYourself("refreshPage from: " + calledFrom, "ip: " + ipAddr);
    if (document.domain === 'localhost')
        alert("checkFor404() refreshPage");
    window.location.href = ".";
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
    if (val === "null")
        return true;
    if (val === null)
        return true;
    if (val === undefined)
        return true;
    if (val === "undefined")
        return true;
    return false;
}

function create_UUID() {
    // thank tohttps://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-2282-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function isValidEmail(email) {
    var emailReg = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    //alert("emailReg.test(email): " + emailReg.test(email));
    return emailReg.test(email);
}

function sendEmailToYourself(subject, message) {
    if (document.domain === "localhost") alert("sendEmailToYourself(subject: " + subject + ", message: " + message + ")");
    $.ajax({
        type: "GET",
        url: "https://api.curtisrhodes.com/api/GodaddyEmail?subject=" + subject + "&message=" + message,
        success: function (success) {
            if (success === "ok") {
                //$('#footerMessage').html("email sent");
                //displayStatusMessage("ok", "email sent");
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "SEY",
                    Severity: 2,
                    ErrorMessage: subject + " Message: " + message,
                    CalledFrom: "sendEmailToYourself"
                });
            }
            //else
            //    alert("sendEmail fail: " + success);
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "sendEmailToYourself")) {
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "common.js sendEmailToYourself"
                });
                //sendEmailToYourself("xhr error in common.js sendEmailToYourself", "/Data/Settings.xml Message: " + errorMessage);
                //alert("sendEmailToYourself xhr error: " + errorMessage);
            }
        }
    });
}

function logError(logErrorModel) {
    if (document.domain === "localhost") alert("error almost logged: " +
        "\n called from: " + logErrorModel.CalledFrom +
        "\n code: " + logErrorModel.ActivityCode +
        "\n pageId: " + logErrorModel.PageId +
        "\n message: " + logErrorModel.ErrorMessage);
    else
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogError",
            data: logErrorModel,
            success: function (success) {
                if (success === "ok") {
                    //displayStatusMessage("ok", "error message logged");
                    console.log("error message logged.  Called from: " + logErrorModel.CalledFrom + " message: " + logErrorModel.ErrorMessage);
                }
                else {
                    console.error("error in logError!!: " + success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "logActivity")) {
                    console.error("XHR error in logError!!: " + success);
                }
            }
        });
}

function logDataActivity(changeLogModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogDataActivity",
        data: changeLogModel,
        success: function (success) {
            if (success === "ok") {
              //  displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
                if (typeof resume === 'function') {
                    resume();
                }
                if (typeof doneLoggingDataActivity === 'function') {
                    doneLoggingDataActivity();
                }
            }
            else {
                if (document.domain === "localhost")
                    alert("logDataActivity: " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "OMG",
                        Severity: 1,
                        ErrorMessage: success,
                        CalledFrom: "logActivity"
                    });
                //sendEmailToYourself("error in common/logActivity", success);
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logActivity")) {
                if (document.domain === "localhost")
                    alert("logDataActivity: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "logActivity"
                    });
                //sendEmailToYourself("xhr error in common.js logActivity", "/api  ChangeLog  Message: " + errorMessage);
            }
        }
    });
}

function containsRomanNumerals(strLabel) {
    var doesContain = false;
    if (strLabel.indexOf(" I") > 0)
        doesContain = true;
    if (strLabel.indexOf(" V") > 0)
        doesContain = true;
    if (strLabel.indexOf(" X") > 0)
        doesContain = true;
    return doesContain;
}

function changeFavoriteIcon(icon) {
    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    switch (icon) {
        case "porn": link.href = 'https://ogglebooble.com/images/cslips03.png'; break;
        case "loading":
            link.href = "https://ogglebooble.com/images/loader.gif";
            link.type = 'image/gif';
            break;
        case "redBallon": link.href = 'Images/favicon.png'; break;
        default: link.href = 'Images/favicon.png';
    }
    document.getElementsByTagName('head')[0].appendChild(link);
}

// GET BUILD INFO
function getFileDate() {
     


}

function XXshowCatListDialog(startFolder) {
    buildDirTree($('#indexCatTreeContainer'), "indexCatTreeContainer", startFolder);
    $('#indexCatTreeContainer').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'left top', at: 'left top', of: $('#middleColumn') },
        width: 500,
        height: 800
    });
    $('#indexCatTreeContainer').dialog('open');
    $('#indexCatTreeContainer').dialog('option', 'title', subdomain);
}

function indexCatTreeContainerClick(path, id, treeId) {
    try {
        window.location.href = "/album.html?folder=" + id;
        $('#indexCatTreeContainer').dialog('close');
    } catch (e) {
        logError({
            VisitorId: getCookieValue("VisiorId"),
            ActivityCode: "CAT",
            Severity: 1,
            ErrorMessage: e,
            CalledFrom: "common.js indexCatTreeContainerClick"
        });
        //sendEmailToYourself("jQuery fail in indexCatTreeContainerClick", "dirTreeClick path: " + path + " id: " + id + " treeId: " + treeId + "  error: " + e);
    }
}

function slowlyShowCustomMessage(blogId) {
    forgetShowingCustomMessage = false;
    setTimeout(function () {
        if (forgetShowingCustomMessage === false) {
            if (typeof pause === 'function')
                pause();
            showCustomMessage(blogId);
        }
    }, 1100);
}

function showCustomMessage(blogId, allowClickAnywhere) {
    //alert("showCustomMessage(" + blogId + ")");
    if (typeof pause === 'function') {
        pause();
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/OggleBlog/?blogId=" + blogId,
        success: function (entry) {
            if (entry.Success === "ok") {
                $('#draggableDialog').css("top", 200);

                $('#draggableDialog').draggable();
                $('#oggleDialogTitle').html(entry.CommentTitle);
                $('#draggableDialogContents').html(entry.CommentText);

                //var x = window.innerWidth * .5 - $('#draggableDialog').width() * .5;              
                //var x = (window.innerWidth - $('#draggableDialog').width()) * .5;              
                //alert("window.innerWidth: " + window.innerWidth + " Dialog.width: " + $('#draggableDialog').width() + "  Left: " + x);
                $('#draggableDialog').css("left", (window.innerWidth - $('#draggableDialog').width()) * .5);
                $('#draggableDialog').show();

                if (allowClickAnywhere) {
                    $('#draggableDialogCloseButton').prop('title', 'click anywhere on dialog to close');
                    $('#draggableDialogContents').click(function () { dragableDialogClose(); });
                }
                else {
                    $('#draggableDialogContents').prop("onclick", null).off("click");
                    $('#draggableDialogCloseButton').removeProp('title');
                }
            }
            else {
                //if (entry.Success.indexOf("Option not supported") > -1) {
                checkFor404(successModel.Success, "showCustomMessage");
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "JQR",
                    Severity: 1,
                    ErrorMessage: entry.Success,
                    CalledFrom: "common.js showCustomMessage"
                });
                //sendEmailToYourself("SERVICE DOWN", "from showCustomMessage" +
                //    "<br/>folderId=" + folderId +
                //    "<br/>IpAddress: " + getCookieValue("IpAddress") +
                //    "<br/>" + entry.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "showCustomMessage")) {
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "common.js showCustomMessage"
                });
                //sendEmailToYourself("xhr error in common.js showCustomMessage", "api/OggleBlog/?blogId=" + blogId + ", Message: " + errorMessage);
            }
        }
    });
}

var registerEmail;
var requestedPrivileges = [];
function authenticateEmail(usersEmail) {

    var privileges = "";
    $.each(requestedPrivileges, function (idx,obj) {
        privileges += obj + ", ";
    });
    logEventActivity({
        VisitorId: getCookieValue("VisiorId"),
        EventCode: "EMA" ,
        EventDetail: usersEmail + privileges,
        PageId: 1111,
        CalledFrom: "authenticateEmail"
    });
    sendEmailToYourself("Acess Requested", " user: " + getCookieValue("UserName") + " has requsted " + privileges);
    alert("Thank you for registering " + getCookieValue("UserName") + "\n please reply to the two factor authentitifcation email sent to you" +
        "\nYou will then be granted the access you requested."+"\nThe menu item 'Dashboard' will appear next to your 'Hello' message");
    dragableDialogClose();
}

function requestPrivilege(privilege) {
    requestedPrivileges.push(privilege);
    //alert("requestPrivilege: " + privilege);
}

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }
}

function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
}

function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
}

function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}

function todayString() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
}

function showMyAlert(message) {
    alert(message);
}

