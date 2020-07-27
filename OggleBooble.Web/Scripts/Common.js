let verbosity = 5, freeVisitorHitsAllowed = 7500, settingsArray = {}, userRoles = [], settingsImgRepo,
    viewerShowing = false, waitingForReportThenPerformEvent = true, forgetShowingCustomMessage = true,
    debugMode = false;

//if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
//<script src="https://www.google.com/recaptcha/api.js" async defer></script>
//<div class="g-recaptcha" data-sitekey="6LfaZzEUAAAAAMbgdAUmSHAHzv-dQaBAMYkR4h8L"></div>
function setCookieValue(elementName, elementValue) {
    //alert("setCookieValue(" + elementName + "," + elementValue + ")");
    window.localStorage[elementName] = elementValue;

    var decodedCookie = "";
    if (document.cookie) {
        var ipAddress = getCookieValue("IpAddress");
        var visitorId = getCookieValue("VisitorId");
        var userName = getCookieValue("UserName");
        var isLoggedIn = getCookieValue("IsLoggedIn");
        decodedCookie = decodeURIComponent(document.cookie);
        var cookieElements = decodedCookie.split(';');
        var cookieItem; var cookieItemName; var cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i];
            cookieItemName = cookieItem.substring(0, cookieItem.indexOf("="));
            cookieItemValue = cookieItem.substring(cookieItem.indexOf("=") + 1);
            if (cookieItemName === "UserName") userName = cookieItemValue;
            if (cookieItemName === "IpAddress") ipAddress = cookieItemValue;
            if (cookieItemName === "VisitorId") visitorId = cookieItemValue;
            if (cookieItemName === "IsLoggedIn") isLoggedIn = cookieItemValue;
        }
    }

    if (elementName === "IsLoggedIn") isLoggedIn = elementValue;
    if (elementName === "UserName") userName = elementValue;
    if (elementName === "IpAddress") ipAddress = elementValue;
    if (elementName === "VisitorId") visitorId = elementValue;
    //deleteCookie();
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9);
    //var cookieString = "VisitorId=" + visitorId + ";IpAddress=" + ipAddress + ";User=" + user + ";path='/;expires=" + expiryDate.toUTCString();
    var cookieString = "VisitorId:" + visitorId + ",IpAddress:" + ipAddress + ",UserName:" + userName + ",IsLoggedIn:" + isLoggedIn + ",path:'/,expires:" + expiryDate.toUTCString();
    document.cookie = cookieString;
    //alert("setCookieValue(" + elementName + "," + elementValue + ")\ncookie:\n" + document.cookie);
}

function getCookieValue(itemName) {
    var returnValue = window.localStorage[itemName];

    if (isNullorUndefined(returnValue)) {
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookieElements = decodedCookie.split(',');
        var cookieItem; var cookieItemName; var cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split(':');
            cookieItemName = cookieItem[0].trim();//.substring(0, cookieElements[i].indexOf("=")).trim();
            cookieItemValue = cookieItem[1];//.substring(cookieElements[i].indexOf("=") + 1);
            if (cookieItemName === itemName) {
                //if (!isNullorUndefined(cookieItemValue))
                //  alert("cookeie value FOUND. " + itemName + " = " + cookieItemValue);
                returnValue = cookieItemValue;
                break;
            }
        }
    }
    return returnValue;
}

function setLocalValue(localName, localValue) {
    alert("setLocalStorage[" + localName + "] = " + localValue);
    window.localStorage[localName] = localValue;
}

function getLocalValue(localName) {
    var localValue = getCookieValue(localName);
    return localValue;
}

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
            if (!checkFor404("loadOggleSettings")) {
                logError("XHR", 3998, getXHRErrorDetails(jqXHR), "loadOggleSettings");
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
    let winW = $(window).width();
    let lcW = $('.leftColumn').width();
    let rcW = $('.rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);

    //set page height
    let winH = $(window).height();
    let headerH = $('header').height() + 50;
    $('.threeColumnLayout').css("min-height", winH - headerH);


    //var winH = $(window).height();
    //var headerH = $('header').height();
    //$('.middleColumn').height(winH - headerH);
    mediaSavyHdrResize();
}

function letemPorn(response, pornType, pageId) {
    // if (document.domain === 'localhost') alert("letemPorn: " + pornType);
    if (response === "ok") {
        //  setUserPornStatus(pornType);
        //<div onclick="goToPorn()">Nasty Porn</div>
        //window.location.href = '/index.html?subdomain=porn';
        if (isNullorUndefined(pornType)) {
            logError("BUG", pageId, "isNullorUndefined(pornType)", "letemPorn");
            pornType = "UNK";
        }
        rtpe("PRN", "xx", pornType, pageId);
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

function logError(errorCode, pageId, errorMessage, calledFrom) {
    //if (document.domain === 'localhost')
    //    alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
    //else
    {
        try {
            if (isNullorUndefined(pageId)) {
                if (document.domain === 'localhost')
                    alert("Error in logError. PageId undefined. Called from: " + calledFrom + "  ErrorMessage: " + errorMessage);
                pageId = 0;
                //logError("BUG", pageId, "Page Id undefined in LogPageHit.", "logPageHit");
            }
            let visitorId = getCookieValue("VisitorId");


            if (isNullorUndefined(visitorId)) {
                setCookieValue("VisitorId", create_UUID());
                setCookieValue("IsLoggedIn", "false");
                //logError("BUG", pageId, "VisitorId undefined in LogPageHit.", "logPageHit");
            }
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/Common/LogError",
                data: {
                    VisitorId: getCookieValue("VisitorId"),
                    ErrorCode: errorCode,
                    PageId: pageId,
                    ErrorMessage: errorMessage,
                    CalledFrom: calledFrom
                },
                success: function (success) {
                    if (success === "ok") {
                        //displayStatusMessage("ok", "error message logged");
                        console.log("error message logged.  Called from: " + calledFrom + " message: " + errorMessage);
                    }
                    else {
                        console.error("ajx error in logError!!: " + success + " called from: " + calledFrom + "\nerrorMessage: " + errorMessage);
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404("logError")) {
                        if (document.domain === 'localhost')
                            alert("XHR error in logError!!: " + errorMessage);
                        console.error("XHR error in logError!!: " + errorMessage);
                    }
                }
            });
        } catch (e) {
            if (document.domain === 'localhost')
                alert("Catch error in logError!!: " + e);
            console.error("Catch error in logError!!: " + e);
        }
    }
}

function logEvent(eventCode, pageId, calledFrom, eventDetails) {
    //if (document.domain === 'localhost')
    //    alert("logEvent. eventCode: " + eventCode + "  pageId: " + pageId + " calledFrom: " + calledFrom + "\neventDetails: " + eventDetails);
    //else
    {
        let visitorId = getCookieValue("VisiorId");
        if (isNullorUndefined(visitorId))
            visitorId = "3:20";
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogEvent",
            data: {
                VisitorId: visitorId,
                EventCode: eventCode,
                EventDetail: eventDetails,
                CalledFrom: calledFrom,
                PageId: pageId
            },
            success: function (success) {
                if (success !== "ok") {
                    logError("BUG", pageId, success, "logEvent");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("logEvent")) {
                    logError("XHR", pageId, getXHRErrorDetails(jqXHR), "logEvent");

                }
            }
        });
    }
}

function logDataActivity(activityModel) {
    //activityModel{
    //    VisitorId: getCookieValue("VisitorId"),
    //    ActivityCode: "LKC",
    //    PageId: pDirTreeId,
    //    Activity: "copy: " + linkId + " to: " + pDirTreeId
    //};
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogDataActivity",
        data: activityModel,
        success: function (success) {
            if (success === "ok") {
                //  displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
                if (typeof doneLoggingDataActivity === 'function') {
                    //alert("doneLoggingDataActivity()");
                    doneLoggingDataActivity();
                }
            }
            else
                logError("BUG", activityModel.PageId, success, "logDataActivity");
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("logDataActivity"))
                logError("XHR", activityModel.PageId, errorMessage, "logDataActivity");
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
        case "soft": link.href = 'https://ogglebooble.com/images/redwoman.ico'; break;
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

function indexCatTreeContainerClick(path, pageId, treeId) {
    try {
        window.location.href = "/album.html?folder=" + pageId;
        $('#indexCatTreeContainer').dialog('close');
    } catch (e) {
        logError("CAT", pageId, e, "indexCatTreeContainerClick");
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
    alert("showCustomMessage(" + blogId + ")");
    if (typeof pause === 'function') {
        pause();
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/OggleBlog/?blogId=" + blogId,
        success: function (entry) {
            if (entry.Success === "ok") {
                $('#centeredDialogContainer').css("top", 200);
                $('#centeredDialogTitle').html(entry.CommentTitle);
                $('#centeredDialogContents').html(entry.CommentText);

                $('#centeredDialogContainer').css("left", (window.innerWidth - $('#centeredDialog').width()) * .5);
                $('#centeredDialogContainer').show();

                if (allowClickAnywhere) {
                    $('#centeredDialogCloseButton').prop('title', 'click anywhere on dialog to close');
                    $('#centeredDialogContents').click(function () { dragableDialogClose(); });
                }
                else {
                    $('#centeredDialogContents').prop("onclick", null).off("click");
                    $('#centeredDialogCloseButton').removeProp('title');
                }
            }
            else {
                //if (entry.Success.indexOf("Option not supported") > -1) {
                if (!checkFor404("showCustomMessage"))
                    logError("BUG", 3111, entry.Success, "showCustomMessage");
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("showCustomMessage")) {
                logError("XHR", 3911, errorMessage, "showCustomMessage");
            }
        }
    });
}

// EMAIL PROCESSES
function isValidEmail(email) {
    var emailReg = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    //alert("emailReg.test(email): " + emailReg.test(email));
    return emailReg.test(email);
}

function sendEmail(to, from, subject, message) {
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
                logError("BUG", 3992, success, "sendEmail");
        },
        error: function (jqXHR) {
            if (!checkFor404("sendEmailToYourself"))
                logError("XHR", 3992, getXHRErrorDetails(jqXHR), "sendEmail");
        }
    });
}

function sendEmailToYourself(subject, message) {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Common/SendEmail",
        data: {
            To: "CurtishRhodes@hotmail.com",
            From: "info@api.Ogglebooble.com",
            Subject: subject,
            Message: message
        },
        success: function (success) {
            if (success === "ok") {
                //$('#footerMessage').html("email sent");
                //displayStatusMessage("ok", "email sent");
            }
            else
                logError("BUG", 3992, success, "sendEmailToYourself");
        },
        error: function (jqXHR) {
            if (!checkFor404("sendEmailToYourself"))
                logError("XHR", 3992, getXHRErrorDetails(jqXHR), "sendEmail");
        }
    });
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

