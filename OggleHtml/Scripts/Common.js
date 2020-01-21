var verbosity = 5;
var freeVisitorHitsAllowed = 7500;
var settingsArray = {};
var userRoles = [];
var waitingForReportThenPerformEvent = true;
var forgetShowingCustomMessage = true;
var connectionVerified = false;
var slideShowButtonsActive = true;
//if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")

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
                sendEmailToYourself("XHR error in common.js loadSettings", "/Data/Settings.xml Message: " + errorMessage);
            }
        }
    });
}

function verifyConnection() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Carousel/VerifyConnection",
        success: function (successModel) {
            if (successModel.Success === "ok") {
                connectionVerified = true;
            }
            else {
                checkFor404("Not connect", "verifyConnection");
                //alert("Verify Connection: " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            //alert("verifyConnection: " + errorMessage);
            if (!checkFor404(errorMessage, "getAconnection")) {
                sendEmailToYourself("XHR ERROR IN  verifyConnection", "api/AlbumPage/GetRootFolder?folderId=1" +
                    " Message: " + errorMessage);
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
            /* Exit the function: */
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

function checkFor404(errorMessage, calledFrom) {
    //if (document.domain === 'localhost') alert("checkFor404 calledfrom: " + calledFrom);

    var isNotConnected = false;
    //if (document.domain === 'localhost') alert("checkFor404() \nerrorMessage: " + errorMessage + ", calledFrom:" + calledFrom);
    if (isNullorUndefined(errorMessage)) {
        var ipAddr = getCookieValue("IpAddress");
        sendEmailToYourself("checkFor404 called with null errorMessage from: " + calledFrom, "ip: " + ipAddr);
        if (document.domain === 'localhost')
            alert("checkFor404 called with null errorMessage from: " + calledFrom);

    }
    if (errorMessage.indexOf("Not connect") > -1 || errorMessage.indexOf("Option not supported") > -1) {
        isNotConnected = true;

        //if (ipAddr !== "68.203.90.199983")
        //if (ipAddr !== "68.203.90.183")
        //    sendEmailToYourself("CAN I GET A CONNECTION ", "calledFrom: " + calledFrom + "    ip: " + ipAddr);


        //"<div id='customMessage' class='displayHidden customMessageContainer'></div>\n" +

        //alert("checkFor404. errorMessage: " + errorMessage + "\ncalledFrom: " + calledFrom);

        $('#notConnectMessage').width($(window).width());
        $('#notConnectMessage').html(
            "<div class='centeredDivShell2'>\n" +
            "   <div class='centeredDivInner'>\n" +
            "       <div class='connectionMessage'><img src='/Images/canIgetaConnection.gif'>\n" +
            "       <div class='divRefreshPage'><a href='javascript:refreshPage()'>Refresh page</a></div></div>" +
            "   </div>" +
            "</div>");

        $('#notConnectMessage').show();
        console.log("checkFor404: " + calledFrom);
    }
    else {
        if (document.domain === 'localhost') {
            alert("checkFor404 called with unexpected errorMessage\n " + errorMessage + " from: " + calledFrom);
        }
        else {
            sendEmailToYourself("checkFor404 called with unexpected errorMessage", "errorMessage: " + errorMessage +
                "<br/>calledFrom from: " + calledFrom +
                "<br/>isNotConnected: " + isNotConnected);
        }
    }
    return isNotConnected;
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

function sendEmailToYourself(subject, message) {
    //alert("sendEmailToYourself(subject: " + subject + ", message: " + message + ")");
    $.ajax({
        type: "GET",
        url: "https://api.curtisrhodes.com/api/GodaddyEmail?subject=" + subject + "&message=" + message,
        success: function (success) {
            if (success === "ok") {
               // $('#footerMessage').html("email sent");
               // displayStatusMessage("ok", "email sent");
            }
            else
                alert("sendEmail fail: " + success);
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "sendEmailToYourself")) {
                sendEmailToYourself("xhr error in common.js sendEmailToYourself", "/Data/Settings.xml Message: " + errorMessage);
                //alert("xhr error: " + errorMessage);
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
                displayStatusMessage("ok", "add image logged");
            else {
                //alert("ChangeLog: " + success);
                sendEmailToYourself("error in common/logActivity", success);
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logActivity")) {
                sendEmailToYourself("xhr error in common.js logActivity", "/api  ChangeLog  Message: " + errorMessage);
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
                sendEmailToYourself("xhr error in common.js showLinks", "api/ImagePage?linkId=" + linkId + " Message: " + errorMessage);
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
                if (typeof viewerShowing === "boolean") {
                    if (viewerShowing)
                        slide("next");
                }
            }
            else {
                alert("setFolderImage: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "setFolderImage")) {
                sendEmailToYourself("xhr error in common.js setFolderImage", "/api/ImageCategoryDetail/?linkId=" + linkId +
                    "&folderId=" + folderId + "&level=" + level + " Message: " + errorMessage);
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
        sendEmailToYourself("jQuery fail in indexCatTreeContainerClick", "dirTreeClick path: " + path + " id: " + id + " treeId: " + treeId + "  error: " + e);
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
                sendEmailToYourself("showCustomMessage", entry.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "showCustomMessage")) {
                sendEmailToYourself("xhr error in common.js showCustomMessage", "api/OggleBlog/?blogId=" + blogId + ", Message: " + errorMessage);
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
    sendEmailToYourself("Acess Requested", " user: " + getCookieValue("UserName") + " has requsted " + privileges);

    alert("Thank you for registering " + getCookieValue("UserName") + "\please reply to the two factor authentitifcation email sent to you" +
        "\nYou will then be granted the access you requested."+"\nThe menu item 'Dashboard' will appear next to your 'Hello' message");
    dragableDialogClose();

    //alert("authenticateEmail: " + usersEmail + " Privileges: " + test);

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
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
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