let verbosity = 5, freeVisitorHitsAllowed = 7500, settingsArray = {}, userRoles = [], settingsImgRepo, userProfileData = {},
    viewerShowing = false, waitingForReportThenPerformEvent = true, forgetShowingCustomMessage = true,
    debugMode = false, pSelectedTreeId, pSelectedTreeFolderPath, activeDirTree;

//if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
//<script src="https://www.google.com/recaptcha/api.js" async defer></script>
//<div class="g-recaptcha" data-sitekey="6LfaZzEUAAAAAMbgdAUmSHAHzv-dQaBAMYkR4h8L"></div>

function loadOggleSettings() {
    document.title = "loading settings : OggleBooble";
    $.ajax({
        type: "GET",
        url: "/Data/Settings.xml",
        dataType: "xml",
        success: function (settingsXml) {
            $(settingsXml).find('setting').each(function () {
                settingsArray[$(this).attr('name')] = $(this).attr('value');
            });
            //alert("settings loaded");
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 444, "loadOggleSettings")) logError("XHR", 444, errMsg, "loadOggleSettings");
        }
    });
}

function includeHTML() {
    let z, i, elmnt, file, xhttp;
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
    let params = {},
        pairs = document.URL.split('?').pop().split('&');
    for (var i = 0, p; i < pairs.length; i++) {
        p = pairs[i].split('=');
        params[p[0]] = p[1];
    }
    return params;
}

function dateString(dateObject) {
    let d = new Date(dateObject), day = d.getDate(), month = d.getMonth() + 1, year = d.getFullYear();
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    return date = month + "/" + day + "/" + year;;
};

function dateString2(dateObject) {
    let d = new Date(dateObject), day = d.getDate(), month = d.getMonth() + 1;
    if (day < 10) {
        day = "0" + day;
    }
    if (month < 10) {
        month = "0" + month;
    }
    return month + "/" + day;
};

function todayString() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();
    return mm + '/' + dd + '/' + yyyy;
}

function letemPorn(response, pornType, folderId) {
    if (response === "ok") {
        if (isNullorUndefined(pornType)) {
            logError("BUG", folderId, "isNullorUndefined(pornType)", "letemPorn");
            pornType = "UNK";
        }
        rtpe("PRN", "xx", pornType, folderId);
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
    }
}

function displayStatusMessage(msgCode, message) {

    let severityClassName;
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
    if (document.domain === 'localhost')
        alert("refreshPage");
    window.location.href = ".";
}

function getXHRErrorDetails(jqXHR) {
    let msg = '';
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
    if (val == "undefined")
        return true;
    return false;
}

function create_UUID() {
    // thank tohttps://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
    //let dt = new Date().getTime();
    //let uuid = 'xxxxxxxx-2282-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    //    let r = (dt + Math.random() * 16) % 16 | 0;
    //    dt = Math.floor(dt / 16);
    //    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    //});
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function logError(errorCode, folderId, errorMessage, calledFrom) {
    if (errorCode != "404")
        logError2(getCookieValue("VisitorId"), errorCode, folderId, errorMessage, calledFrom);
}

function logError2(visitorId, errorCode, folderId, errorMessage, calledFrom) {
    if (document.domain === 'localhost') {
        console.log(errorCode + " " + folderId + " " + errorMessage + " " + calledFrom);
        alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
    }
    else {
        try {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/Common/LogError",
                data: {
                    VisitorId: visitorId,
                    ErrorCode: errorCode,
                    FolderId: folderId,
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
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, folderId, "logError")) {
                        //logError("XHR", folderId, errMsg, functionName);
                        if (document.domain === 'localhost') alert("XHR error in logError!!: " + "logError");
                    }
                }
            });
        }
        catch (e) {
            if (document.domain === 'localhost') alert("Catch error in logError!!: " + e);
            console.error("Catch error in logError!!: " + e);
        }
    }
}

function logEvent(eventCode, folderId, calledFrom, eventDetails) {
    //if (document.domain === 'localhost')
    //    alert("logEvent. eventCode: " + eventCode + "  folderId: " + folderId + " calledFrom: " + calledFrom + "\neventDetails: " + eventDetails);
    //else
    {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogEvent",
            data: {
                VisitorId: getCookieValue("VisitorId"),
                EventCode: eventCode,
                EventDetail: eventDetails,
                CalledFrom: calledFrom,
                FolderId: folderId
            },
            success: function (success) {
                if (success !== "ok") {
                    if (success.indexOf("Duplicate entry") > 0) {
                       // logError("EVD", folderId, "eventCode: " + eventCode, calledFrom + "/logEvent");
                    }
                    else
                        logError("AJE", folderId, eventCode + ": " + success, calledFrom + "/logEvent");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "logEvent")) logError("XHR", folderId, errMsg, "logEvent");
            }
        });
    }
}

function logActivity(activityCode, folderId, calledFrom) {    
    logActivity2(getCookieValue("VisitorId"), activityCode, folderId, calledFrom);
}

function logActivity2(visitorId, activityCode, folderId, calledFrom) {
    //alert("logActivity(" + activityCode + "," + folderId + ")");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogActivity",
        data: {
            ActivityCode: activityCode,
            FolderId: folderId,
            CalledFrom: calledFrom,
            VisitorId: visitorId,
        },
        success: function (success) {
            if (success === "ok") {
                //  displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
            }
            else {
                if (success.indexOf("Duplicate entry") > 0) {
                    logActivity("DAE", folderId, "log activity/" + calledFrom);
                    //logError2(visitorId, "DUP", folderId, "Duplicate entry: " + activityCode, "log activity/" + calledFrom);
                }
                else
                    logError2(visitorId, "AJX", folderId, activityCode + ": " + success, "log activity/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();

            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "log Activity"))
                logError2(visitorId, "XHR", folderId, errMsg, "log Activity");
        }
    });
}

function logDataActivity(activityModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogDataActivity",
        data: activityModel,
        success: function (success) {
            if (success === "ok") {
                //  displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
            } 
            else
                logError("AJX", activityModel.FolderId, success, "logDataActivity");
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "logDataActivity")) logError("XHR", folderId, errMsg, "logDataActivity");
        }
    });
}

function containsRomanNumerals(strLabel) {
    let doesContain = false;
    if (strLabel.indexOf(" I") > 0)
        doesContain = true;
    if (strLabel.indexOf(" V") > 0)
        doesContain = true;
    if (strLabel.indexOf(" X") > 0)
        doesContain = true;
    return doesContain;
}

function changeFavoriteIcon(icon) {
    try {
        let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        switch (icon) {
            case "centerfold": link.href = 'https://ogglebooble.com/images/playboyballon.png'; break;
            case "porn": link.href = 'https://ogglebooble.com/images/cslips03.png'; break;
            case "soft": link.href = 'https://ogglebooble.com/images/redwoman.ico'; break;
            case "loading":
                link.href = "https://ogglebooble.com/images/loader.gif";
                link.type = 'image/gif';
                //link = "<link rel='icon' href='https://ogglebooble.com/images/loader.gif' type='image/gif' />";
                break;
            case "redBallon": link.href = 'Images/favicon.png'; break;
            default: link.href = 'Images/favicon.png'; break;
        }
        document.getElementsByTagName('head')[0].appendChild(link);
    } catch (e) {
        logError("CAT", 3992, e, "changeFavoriteIcon");
    }
}

function commonDirTreeClick(danniPath, folderId) {
    try {
        //alert("activeDirTree: "+activeDirTree);
        pSelectedTreeId = folderId;
        pSelectedTreeFolderPath = danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
        //$("#mainMenuContainer").html($('.txtLinkPath').val());
        switch (activeDirTree) {
            case "dashboard":
                $('.txtLinkPath').val(pSelectedTreeFolderPath);
                break;
            case "catListDialog":
                window.location.href = "\album.html?folder=" + folderId;
                break;
            case "linkManipulateDirTree":
                $('#dirTreeResults').html(pSelectedTreeFolderPath); break;
            case "moveFolder":
                $('#txtNewMoveDestiation').val(pSelectedTreeFolderPath); break
            case "moveMany":
                $('#txtMoveManyDestination').val(pSelectedTreeFolderPath);
                $('#mmDirTreeContainer').fadeOut();
                break;
            case "stepchild":
                $('#txtscSourceFolderName').val(pSelectedTreeFolderPath);
                $('#scDirTreeContainer').fadeOut();
                activeDirTree = "dashboard";
                break;
            default:
        }
    } catch (e) {
        logError("CAT", folderId, e, "commonDirTreeClick");
    }
}

function showCatListDialog(root) {
    $('#indexCatTreeContainer').html(
        "      <div id='dtDialogContainer' class='oggleDialogContainer catDirTreeDialog'>\n" +    // draggableDialog
        "           <div id='dtDialogHeader'class='oggleDialogHeader' onmousedown='centeredDialogEnterDragMode()' onmouseup='centeredDialogCancelDragMode()'>" +
        "               <div id='dtDialogTitle' class='oggleDialogTitle'></div>" +
        "               <div id='dtDialogCloseButton' class='oggleDialogCloseButton'>" +
        "               <img src='/images/poweroffRed01.png' onclick='$(\"#indexCatTreeContainer\").hide()'/></div>\n" +
        "           </div>\n" +
        "           <div id='dtDialogContents' class='oggleDialogContents'></div>\n" +
        "      </div>\n");
    activeDirTree = "catListDialog";
    loadDirectoryTree(root, "dtDialogContents", false);

    switch (root) {
        case 2: $('#dtDialogTitle').html("boob categories"); break;
        case 3: $('#dtDialogTitle').html("big naturals"); break;
        case 242: $('#dtDialogTitle').html("porn pages"); break;
        case 440: $('#dtDialogTitle').html("porn stars"); break;
    }

    $('#indexCatTreeContainer').show();
    $('#dtDialogContainer').draggable().show();    
    //alert("showCatListDialog: " + root);
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
        url: settingsArray.ApiServer + "api/OggleBlog/GetBlogItem?blogId=" + blogId,
        success: function (entry) {
            if (entry.Success === "ok") {

                $("#vailShell").fadeIn();
                $('#customMessage').html(entry.CommentText).show();
                $("#customMessageContainer").draggable().fadeIn();


                //top: 255;
                //left: 522;
                //    if (allowClickAnywhere) {
                //        $('#centeredDialogCloseButton').prop('title', 'click anywhere on dialog to close');
                //        $('#centeredDialogContents').click(function () { dragableDialogClose(); });
                //    }
                //    else {
                //        $('#centeredDialogContents').prop("onclick", null).off("click");
                //        $('#centeredDialogCloseButton').removeProp('title');
                //    }
            }
            else {
                logError("AJX", 3111, "error: " + entry.Success, "showCustomMessage");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 999, "showCustomMessage")) logError("XHR", 311, errMsg, "showCustomMessage");
        }
    });
}

// EMAIL PROCESSES
function isValidEmail(email) {
    let emailReg = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    //alert("emailReg.test(email): " + emailReg.test(email));
    return emailReg.test(email);
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

function requestPrivilege(privilege) {
    requestedPrivileges.push(privilege);
    //alert("requestPrivilege: " + privilege);
}

function dragElement(elmnt) {
    if (document.getElementById(elmnt.id + "header")) {
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

function showMyAlert(title, message) {
    $('#centeredDialogContents').html("<div>\n<div id='myAlert'>" + message + "</div>\n</div>");
    $('#centeredDialogTitle').html(title);
    //$('#centeredDialogContainer').css("top", 33 + $(window).scrollTop());
    $('#centeredDialog').css("top", $('#oggleHeader').height() + 120);
    $('#centeredDialogContainer').draggable().fadeIn();
}

function weDemandCookies() {
    //alert("weDemandCookies");

    showCustomMessage('0783d756-04bb-4339-9029-75c9a2f93d8b', false);
    $("#vailShell").fadeIn();
    $('#customMessageContainer').css("top", 200);
    $('#customMessageContainer').css("left", -100);
}

function getCookieValue(itemName) {
    let returnValue = "cookie not found";
    try {
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookieElements = decodedCookie.split(";");
        let cookieItem, cookieItemName, cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split(":");
            cookieItemName = cookieItem[0].trim();
            cookieItemValue = cookieItem[1];
            if (cookieItemName === itemName) {

                if (isNullorUndefined(cookieItemValue)) {
                    visitorId = create_UUID();
                    if (!navigator.cookieEnabled) {  // user accepts cookies
                        localStorage[itemName] = visitorId;
                        logError2(visitorId, "CK3", 615112, "need a fix", "get CookieValue"); // undefined and cookies not enabled
                    }
                    else {
                        logError2(visitorId, "CK2", 614725, "cookieItemValue == undefined", "get CookieValue"); // cookieItemValue == undefined
                        setCookieValue("VisitorId", visitorId);
                        addVisitor({
                            VisitorId: visitorId,
                            IpAddress: '00.11.00',
                            City: "undefined",
                            Country: "ZZ",
                            Region: "undefined",
                            GeoCode: "get CookieValue"
                        });
                        returnValue = visitorId;
                    }
                }
                else {
                    returnValue = cookieItemValue;
                    if (isNullorUndefined(localStorage[itemName])) {
                        localStorage[itemName] = cookieItemValue;
                    }
                    else {
                        if (localStorage[itemName] != cookieItemValue) {
                            if (itemName == "VisitorId") {
                                if (localStorage[itemName].indexOf("=") > 0) {
                                    localStorage[itemName] = cookieItemValue.substr(36);
                                    logError2(returnValue, "CK7", 616307, "get cookie"); // localStorage ends with an =
                                }
                            }
                            else {
                                logError2(cookieItemValue, "CK1", 614737, "localStorage[itemName]: " + localStorage[itemName], "get CookieValue");
                                localStorage[itemName] = cookieItemValue;
                            }
                        }
                    }
                }
                break;
            }
        }

        if (returnValue == "cookie not found") {
            if (!isNullorUndefined(localStorage[itemName])) {
                returnValue = localStorage[itemName];
                if (navigator.cookieEnabled) {  // user accepts cookies
                    setCookieValue(itemName, returnValue);
                    logActivity2(create_UUID(), "LSB", 61723, "get cookie"); // local storage bypass
                }
                else {
                    logError2(returnValue, "CK4", 616307, "get cookie"); // localStorage bypass cookies not enabled
                }
            }
        }
    }
    catch (e) {
        logError2(create_UUID(), "CAT", 616329, e, "get CookieValue");
    }
    return returnValue;
}

function setCookieValue(elementToSet, newValue) {
    try {
        if (!navigator.cookieEnabled) {  // user accepts cookies
            //showCookiesRequiredMessage();
        }
        localStorage[elementToSet] = newValue;
        let cookieString = elementToSet + ":" + newValue;
        document.cookie = cookieString;

        //alert("document.cookie:\n\n" + JSON.stringify(document.cookie, null, 2));

        console.log("setCookieValue.  set:" + elementToSet + " to: " + newValue);
    } catch (e) {
        //alert("setcookie CATCH Error: " + e);
        logError2(create_UUID(), "CAT", 616415, e, "setCookieValue");
    }
}

function createCookie(visitorId) {
    try {
        console.log("createCookie");
        //alert("createCookie");
        //cookies.remove("document.cookie");
        document.cookie = "expires=Thu, 01 Jan 1970 00: 00: 00 UTC; path =/;";

        alert("deleted decoded cookie: " + decodeURIComponent(document.cookie));

        expirydate = new Date();

        expirydate.setMonth(expirydate.getMonth() + 9);
        let cookiestring = ";VisitorId=" + visitorId + ";UserName=" + localStorage["UserName"] +
            "VisitorVerified=true;Isloggedin=" + localStorage["IsLoggedIn"] + ";expires=" + expirydate.toUTCString();
        document.cookie = cookiestring;


        var test1 = getCookieValue("Visitorid", "boogers");

        //alert("cookieTest1: " + test1);


        //alert("decoded cookie: " + decodeURIComponent(document.cookie));

    } catch (e) {
        console.log("createCookie CATCH " + e);
    }
}

function handleTroubledAccount(calledFrom) {
    let visitorId = getCookieValue("VisitorId");


    //logActivity2(visitorId, "HT0", 614521, calledFrom);
    //let offendingUserId = localStorage[itemName];
    //showCustomMessage('0783d756-04bb-4339-9029-75c9a2f93d8b', false);
    //$('#customMessageContainer').css("top", 255);
    //$('#customMessageContainer').css("left", 522);
}
