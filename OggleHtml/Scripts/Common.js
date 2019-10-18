var settingsArray = {};
var userRoles = [];
var freeVisitorHitsAllowed = 1500;

//$(document).ready(function () {
//    loadSettings();
//});

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

    //alert("checkFor404() \nerrorMessage: " + errorMessage + ", calledFrom:" + calledFrom);
    var success = false;
    if (isNullorUndefined(errorMessage)) {
        alert("checkFor404 called with null errorMessage from: " + calledFrom);
        sendEmailToYourself("checkFor404 called with null errorMessage from: " + calledFrom, "ip: " + getCookieValue("IpAddress"));
        return success;
    }

    if (errorMessage.indexOf("Not connect") > -1) {
        success = true;
        //sendEmailToYourself("CAN I GET A CONNECTION " + calledFrom, "ip: " + getCookieValue("IpAddress"));
        //showCustomMessage(71);


        $('#customMessage').html("<div class='customMessageContainer'><div class='connectionMessage'><img src='http://library.curtisrhodes.com/canigetaconnection.gif'>" +
            "<br/><a href='.'>Refresh page</a></div></div>");
        //"<br/><span>Refresh page<span><br/>404 " + calledFrom + "</div></div>");
        //$('.classRefreshPage').
        $('.customMessageContainer').show();
        console.log("checkFor404: " + calledFrom);

    }
    else alert("checkFor404 errorMessage.indexOf('Not connect'): " + errorMessage.indexOf("Not connect") +"\nerrorMessage: " + errorMessage);    
    return success;
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

function logActivity(changeLogModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/ChangeLog",
        data: changeLogModel,
        success: function (success) {
            if (success === "ok")
                displayStatusMessage("ok", "add image logged");
            else
                alert("ChangeLog: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("ChangeLog xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function sendEmailToYourself(subject, message) {
    //alert("sendEmailToYourself(subject: " + subject + ", message: " + message + ")");
    $.ajax({
        type: "GET",
        url: "https://api.curtisrhodes.com/api/GodaddyEmail?subject=" + subject + "&message=" + message,
        success: function (success) {
            if (success === "ok") {
                $('#footerMessage').html("email sent");
               // displayStatusMessage("ok", "email sent");
            }
            else
                alert("sendEmailToYourself: " + success);
        },
        error: function (xhr) {
            alert("sendEmailToYourself xhr error: " + getXHRErrorDetails(xhr));
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
        error: function (jqXHR, exception) {
            alert("showLinks error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function openLink(folderId) {
    window.open("/album.html?folder=" + folderId, "_blank");
}

function setFolderImage(linkId, folderId, level) {

    //alert("setFolderImage link: " + linkId + " folderId: " + folderId + " level?: " + level);

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
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
        error: function (xhr) {
            alert("setFolderImage xhr error: " + xhr.statusText);
        }
    });
}


// GET BUILD INFO
function getFileDate() {
    


}

function showCatListDialog(startFolder) {
    buildDirTree($('#indexCatTreeContainer'), "indexCatTreeContainer", startFolder);
    $('#indexCatTreeContainer').dialog('open');
    $('#indexCatTreeContainer').dialog('option', 'title', subdomain);
}

function indexCatTreeContainerClick(path, id, treeId) {
    if (treeId === "indexCatTreeContainer") {
        window.location.href = "/album.html?folder=" + id;
        $('#indexCatTreeContainer').dialog('close')
    }
    else
        alert("dirTreeClick treeId: " + treeId);
}

function showCustomMessage(blogId) {
    //alert("showCustomMessage(" + blogId + ")");
    if (typeof pause === 'function') {
        pause();
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/OggleBlog/?blogId=" + blogId,
        success: function (entry) {
            if (entry.Success === "ok") {
                $('#customMessage').html(entry.CommentText).show();
            }
            else
                alert(entry.Success);
        },
        error: function (xhr) {
            alert("showSiteContent xhr: " + getXHRErrorDetails(xhr));
        }
    });
    //if ($('#pornWarning').html() == "")
}


