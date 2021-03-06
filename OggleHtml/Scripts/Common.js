﻿var verbosity = 5;
var freeVisitorHitsAllowed = 7500;
var settingsArray = {};
var userRoles = [];
var waitingForReportThenPerformEvent = true;
var forgetShowingCustomMessage = true;
//if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
//<script src="https://www.google.com/recaptcha/api.js" async defer></script>
//<div class="g-recaptcha" data-sitekey="6LfaZzEUAAAAAMbgdAUmSHAHzv-dQaBAMYkR4h8L"></div>

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
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadSettings")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
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

$.date = function (dateObject) {
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

function resizePage() {
    //This page uses the non standard property “zoom”. Consider using calc() in the relevant property values, or using “transform” along with “transform-origin: 0 0”. album.html

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

function sendEmailToYourself(subject, message) {
    //alert("sendEmailToYourself(subject: " + subject + ", message: " + message + ")");
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
    if (isNullorUndefined(logErrorModel.VisitorId))
        logErrorModel.VisitorId = "00";

    if (document.domain === "localhost")
        alert("logError: " + logErrorModel.ErrorMessage);

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/ErrorLog/ErrorLog",
        data: logErrorModel,
        //success: function (success) {
        //    if (success === "ok")
        //        // displayStatusMessage("ok", "error message logged");
        //    else {
        //        //alert("ChangeLog: " + success);
        //        //sendEmailToYourself("error in common/logActivity", success);
        //    }
        //},
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (document.domain === "localhost")
                alert("logError: " + errorMessage);


            if (!checkFor404(errorMessage, "logActivity")) {

                //alert("XHR error " + ErrorMessage);
                //sendEmailToYourself("xhr error in common.js logActivity", "/api  ChangeLog  Message: " + errorMessage);

            }
        }
    });
}

//  ACTIVITY LOG
function logActivity(changeLogModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/ChangeLog",
        data: changeLogModel,
        success: function (success) {
            if (success === "ok")
                displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
            else {
                //alert("ChangeLog: " + success);
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
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "showLinks")) {
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "showLinks(" + linkId + ")"
                });
                //sendEmailToYourself("xhr error in common.js showLinks", "api/ImagePage?linkId=" + linkId + " Message: " + errorMessage);
            }
        }
    });
}

function openLink(folderId) {
    window.open("/album.html?folder=" + folderId, "_blank");
}

function setFolderImage(linkId, folderId, level) {
    //if (document.domain === 'localhost') alert("setFolderImage. \nlinkId: " + linkId + "\nfolderId=" + folderId + "\nlevel=" + level);
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/UpdateFolderImage?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", level + " image set");
                $('#thumbImageContextMenu').fadeOut();
            }
            else {
                alert("setFolderImage: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "setFolderImage")) {
                logError({
                    VisitorId: getCookieValue("VisiorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "common.js setFolderImage"
                });
                //sendEmailToYourself("xhr error in common.js setFolderImage", "/api/ImageCategoryDetail/?linkId=" + linkId +
                //    "&folderId=" + folderId + "&level=" + level + " Message: " + errorMessage);
            }
        }
    });
}

// GET BUILD INFO
function getFileDate() {
     


}

function showCatListDialog(startFolder) {
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
                $('#draggableDialogTitle').html(entry.CommentTitle);
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

function dragableDialogClose() {
    $('#draggableDialog').fadeOut();
    if (typeof resume === 'function')
        resume();
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

function getVisitorInfo() {
    var info = {

        timeOpened: new Date(),
        timezone: (new Date()).getTimezoneOffset() / 60,

        pageon() { return window.location.pathname },
        referrer() { return document.referrer },
        previousSites() { return history.length },

        browserName() { return navigator.appName },
        browserEngine() { return navigator.product },
        browserVersion1a() { return navigator.appVersion },
        browserVersion1b() { return navigator.userAgent },
        browserLanguage() { return navigator.language },
        browserOnline() { return navigator.onLine },
        browserPlatform() { return navigator.platform },
        javaEnabled() { return navigator.javaEnabled() },
        dataCookiesEnabled() { return navigator.cookieEnabled },
        dataCookies1() { return document.cookie },
        dataCookies2() { return decodeURIComponent(document.cookie.split(";")) },
        dataStorage() { return localStorage },

        sizeScreenW() { return screen.width },
        sizeScreenH() { return screen.height },
        sizeDocW() { return document.width },
        sizeDocH() { return document.height },
        sizeInW() { return innerWidth },
        sizeInH() { return innerHeight },
        sizeAvailW() { return screen.availWidth },
        sizeAvailH() { return screen.availHeight },
        scrColorDepth() { return screen.colorDepth },
        scrPixelDepth() { return screen.pixelDepth },

        latitude() { return position.coords.latitude },
        longitude() { return position.coords.longitude },
        accuracy() { return position.coords.accuracy },
        altitude() { return position.coords.altitude },
        altitudeAccuracy() { return position.coords.altitudeAccuracy },
        heading() { return position.coords.heading },
        speed() { return position.coords.speed },
        timestamp() { return position.timestamp },
    };
    return info;
}


var connectionVerified = false;
var canIgetaConnectionMessageShowing = false;
var verifyConnectionCount = 0;
var verifyConnectionCountLimit = 10;
var inCheckFor404Loop = false;
var checkFor404Loop;
function checkFor404(errorMessage, calledFrom) {    
    //sendEmailToYourself("checkFor404 called with null errorMessage from: " + calledFrom, "ip: " + ipAddr);
    connectionVerified = false;
    verifyConnection();
    setTimeout(function () {
        if (!connectionVerified) {
            verifyConnection();
        }
    }, 1000);

    if (!connectionVerified) {
        if (!inCheckFor404Loop) {
            checkFor404Loop = setInterval(function () {
                if (!connectionVerified) {
                    if (++verifyConnectionCount > 3) {
                        $('#connectingMsg').show();
                    }
                    if (verifyConnectionCount > verifyConnectionCountLimit) {
                        if (!canIgetaConnectionMessageShowing) {
                            $('#connectingMsg').hide();
                            $('#customMessage').html(
                                "<div><div class='connectionMessage'><img src='/Images/canIgetaConnection.gif'></div>\n" +
                                "     <div class='divRefreshPage' onclick='window.location.reload(true)'>Thanks GoDaddy. Refresh Page</a></div>" +
                                "</div>").show();

                            console.log("connection message showing");

                            canIgetaConnectionMessageShowing = true;
                            if (document.domain !== 'localhost') {
                                logError({
                                    VisitorId: getCookieValue("VisiorId"),
                                    ActivityCode: "404",
                                    Severity: 1,
                                    ErrorMessage: "SERVICE DOWN",
                                    CalledFrom: errorMessage + "- " + calledFrom
                                });
                            }
                        }
                    }
                    verifyConnection();
                }
            }, 1600);
            inCheckFor404Loop = true;
        }
    }
    return !connectionVerified;
}

function verifyConnection() {
    if (isNullorUndefined(settingsArray.ApiServer)) {
        console.error("verifyConnection settingsArray.ApiServer not defined");
        connectionVerified = false;
    }
    else {
        console.log("calling verifyConnection");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Carousel/VerifyConnection",
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (successModel.ConnectionVerified) {
                        clearInterval(checkFor404Loop);
                        inCheckFor404Loop = false;
                        connectionVerified = true;
                        verifyConnectionCount = 0;
                        console.log("verifyConnection: connection verified");
                        $('#connectingMsg').hide();
                        $('#customMessage').hide();
                        canIgetaConnectionMessageShowing = false;
                    }
                    else {
                        connectionVerified = false;
                    }
                }
                else {
                    connectionVerified = false;
                    //logError({
                    //    VisitorId: getCookieValue("VisiorId"),
                    //    ActivityCode: "044",
                    //    Severity: 1,
                    //    ErrorMessage: successModel.Success,
                    //    CalledFrom: "verifyConnection()"
                    //});
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (errorMessage.indexOf("Not Connect") > -1) {
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage + ". CanIgetShowing: " + canIgetaConnectionMessageShowing + ". in404Loop: " + inCheckFor404Loop,
                        CalledFrom: "verifyConnection()"
                    });
                }
                connectionVerified = false;
            }
        });
    }
}

