var settingsArray = {};
var userRoles = [];

$(document).ready(function () {
    loadSettings();
});

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
    if (typeof resizeStaticPage === 'function')
        resizeStaticPage();
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

// HITCOUNTER
function logVisit() {
    //if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    //alert("ipAddress: " + ipAddress);
    var userName = getCookie("User");
    //alert("userName: " + userName);
    $('#footerMessage').html("logging visit userName: " + userName);
    setLoginHeader(userName);
    if (userName === "") userName = "unknown";
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/HitCounter/LogVisit?userName=" + userName + "&appName=Ogglebooble",
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (successModel.ReturnValue !== "") {
                    $('#headerMessage').html(successModel.ReturnValue);
                    if (userName !== "unknown")
                        getUserPermissions(userName);
                }
            }
            else
                alert(successModel.Success);
        },
        error: function (jqXHR, exception) {
            $('#blogLoadingGif').hide();
            alert("HitCounter/LogVisit jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}
function logPageHit(folderName) {
    $('#footerMessage').html("logging page hit");
    var userName = getCookie("User");
    if (userName === "")
        userName = "unknown";
    else {
        setLoginHeader(userName);
        getUserPermissions(userName);
    }
    //if ((ipAddress === "68.203.90.183") || (ipAddress === "50.62.160.105")) return "ok";
    var hitCounterModel = {
        AppId: "OBH",
        PageName: folderName,
        UserName: userName
    };
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer  + "api/HitCounter/LogPageHit",
        data: hitCounterModel,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                if (userName === "unknown")
                    $('#footerMessage').html("logPageHit: " + successModel.ReturnValue);
            }
            else
                alert("logPageHit: " + successModel.Success);
        },
        error: function (jqXHR, exception) {
            alert("logPageHit error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

// LOGIN
function onRegisterClick() {
    $('#modalContainer').show();
    $('#registerUserDialog').show();
    $('#registerUserDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" }
    });
    if (typeof pause === 'function')
        pause();
    $('#registerUserDialog').on('dialogclose', function (event) {
        $('#modalContainer').hide();
        $('#registerUserDialog').hide();
        //$('#loginDialog').hide();
        if (typeof resume === 'function')
            resume();
    });
}
function postRegister() {
    if (validateRegister()) {
        try {
            var registeredUserModel = {};
            registeredUserModel.UserName = $('#txtRegisterUserName').val();
            registeredUserModel.Pswrd = $('#txtRegisterClearPassword').val();
            registeredUserModel.FirstName = $('#txtFirstName').val();
            registeredUserModel.LastName = $('#txtLastName').val();
            registeredUserModel.Email = $('#ddCategory').val();
            registeredUserModel.IpAddress = $('#txtPhone').val();
            registeredUserModel.AppName = "OggleBoogle";

            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "/api/Login/RegisterUser",
                data: registeredUserModel,
                success: function (response) {
                    if (response === "ok") {
                        $('#registerUserDialog').dialog('close');
                        setCookie($('#txtRegisterUserName').val());
                        setLoginHeader($('#txtRegisterUserName').val());
                    }
                    else {
                        $('#registerValidationSummary').html(response).show();
                    }
                },
                error: function () {
                    alert("Login Post failed");
                }
            });
        } catch (e) {
            alert("Login Post error: " + e);
        }
    }
}
function validateRegister() {
    if ($('#txtRegisterUserName').val() === "") {
        $('#errUserName').show();
        return false;
    }
    $('#errUserName').hide();

    if ($('#txtRegisterClearPassword').val() === "") {
        $('#errRegisterPassword').show();
        return false;
    }

    if ($('#txtRegisterClearPassword').val().length < 4) {
        $('#errRegisterPassword').text("password must be at least 4 characters").show();
        return false;
    }
    if ($('#txtRegisterClearPassword').val() !== $('#txtRegisterClearPasswordRetype').val()) {
        $('#errRegisterPassword').text("password retype does not match").show();
        return false;
    }
    $('#errRegisterPassword').hide();
    return true;
}

function onLogoutClick() {
    document.cookie = "OggleUser=''; User=''; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    $('#optionLoggedIn').hide();
    $('#optionNotLoggedIn').show();
}

function onLoginClick() {
    $('#modalContainer').show();
    $('#loginDialog').show();
    $('#loginDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: 333
    });
    $('#loginDialog').show();
    if (typeof pause === 'function')
        pause();
    $('#loginDialog').on('dialogclose', function (event) {
        $('#modalContainer').hide();
        $('#loginDialog').hide();
        if (typeof resume === 'function')
            resume();
    });
}
function postLogin() {
    if (validateLogin()) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/VerifyLogin?userName=" + $('#txtLoginUserName').val() + "&passWord=" + $('#txtLoginClearPassword').val(),
            success: function (success) {
                if (success === "ok") {
                    $('#loginDialog').dialog('close');
                    displayStatusMessage("ok", "thanks for logging in " + getCookie());
                    setCookie($('#txtLoginUserName').val());
                    setLoginHeader($('#txtLoginUserName').val());
                    getUserPermissions($('#txtLoginUserName').val());
                }
                else
                    $('#loginValidationSummary').html(response).show();                    
            },
            error: function (jqXHR, exception) {
                alert("validateLogin XHR error: " + settingsArray.ApiServer + "api/Login/VerifyLogin?userName" + $('#txtLoginUserName').val() + "&passWord=" + $('#txtLoginClearPassword').val() + "  " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}
function validateLogin() {
    if ($('#txtLoginUserName').val() === "") {
        $('#errLoginUserName').show();
        return false;
    }
    $('#errLoginUserName').hide();

    if ($('#txtLoginClearPassword').val() === "") {
        $('#errLoginPassword').show();
        return false;
    }
    $('#errLoginPassword').hide();
    return true;
}
function transferToRegisterPopup() {
    $('#loginDialog').dialog('close');
    onRegisterClick();
}

function getUserPermissions(userName) {

    if (userName !== "unknown") {
        $('.loginRequired').show();

    }

    //$.ajax({
    //    type: "GET",
    //    url: settingsArray.ApiServer + "api/Login/UserPermissions?userName=" + userName,
    //    success: function (userRoles) {
    //        $.each(userRoles,function (idx,obj) {
    //            userRoles.push(obj.RoleName);
    //        });
    //    },
    //    error: function (jqXHR, exception) {
    //        alert("getUserPermissions jqXHR : " + getXHRErrorDetails(jqXHR, exception));
    //    }
    //});
}

// COOKIES
function setLoginHeader(userName) {
    if (userName === "") {
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
    }
    else {
        $('#spnUserName').html(userName);
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
    }
}
function setCookie(userName) {
    expires = new Date();
    expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
    document.cookie = 'User=' + userName + '; expires=' + expires.toUTCString();
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
                var userName = c.substring(name.length, c.length);
                //alert("cookie success: " + c.substring(name.length, c.length));
                return userName;
            }
        }
    }
    //else alert("no cookie found");
    return decodedCookie;
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
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/?linkId=" + linkId + "&folderId=" + folderId + "&level=" + level,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", level + " image set");
                $('#thumbImageContextMenu').fadeOut();
                if (viewerShowing)
                    slide("next");
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


function getHeader(subdomain) {
    var headerHtml;
    if (subdomain === "boobs" || subdomain === "archive") {
        headerHtml =
        "   <div id='divTopLeftLogo' class='bannerImageContainer'>\n" +
        "       <a href='/'><img src='Images/redballon.png' class='bannerImage' /></a>\n" +
        "   </div>\n" +
        "   <div class='headerBodyContainer'>\n" +
        "       <div class='headerTopRow'>\n" +
        "           <div class='headerTitle' id='bannerTitle'>OggleBooble</div>\n" +
        "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
        "                <a href='/album.html?folder=2'>tits</a> and\n" +
        "                <a href='/album.html?folder=996'>ass</a> organized by\n" +
        "                <a href='/album.html?folder=136'> poses</a>.\n" +
        "                <a href='/album.html?folder=199'> shapes</a> and\n" +
        "                <a href='/album.html?folder=241'>sizes</a>\n" +
        "            </div>\n" +
        "        </div>\n";
    }

    if (subdomain === "porn" || subdomain === "sluts") {
        $('body').addClass('pornBodyColors');
        headerHtml =
            "   <div id='divTopLeftLogo' class='pornHeaderColors bannerImageContainer'>\n" +
            "       <a href='/index.html?subdomain=porn'><img src='Images/csLips02.png' class='bannerImage' /></a>\n" +
            "   </div>\n" +
            "   <div class='pornHeaderColors headerBodyContainer'>\n" +
            "       <div class='headerTopRow'>\n" +
            "           <div class='headerTitle' id='bannerTitle'>OgglePorn</div>\n" +
            "           <div class='headerSubTitle' id='headerSubTitle'>\n" +
            "               <a href='/album.html?folder=243'>cock suckers</a>, \n" +
            "               <a href='/album.html?folder=420'>boob suckers</a>, \n" +
            "               <a href='/album.html?folder=357'>cum shots</a>, \n" +
            "               <a href='/album.html?folder=397'>kinky</a> and \n" +
            "               <a href='/album.html?folder=411'>naughty behaviour</a>\n" +
            "           </div>\n" +
            "      </div>\n";
    }

    headerHtml+=
        "            <div class='headerBottomRow'>\n" +
        "                <div id='headerMessage' class='floatLeft'></div>\n" +
        "                <div id='breadcrumbContainer' class='breadCrumbArea'></div>\n" +
        "                <div class='menuTabs replaceableMenuItems'>\n" +
        "                    <!--<div class='menuTab floatLeft'><a href='~/Admin'>every playboy centerfold</a></div>-->\n" +
        "                <div id='menuTabUpload' class='menuTab displayHidden loginRequired floatLeft'><a href='/Upload.html'>Upload</a></div>\n" +
        "                    <div id='menuTabAdmin' class='menuTab  displayHidden loginRequired floatLeft'><a href='/Admin.html'>Admin</a></div>\n" +
        "                </div>\n" +
        "                <div id='optionLoggedIn' class='displayHidden'>\n" +
        "                    <div class='menuTab floatRight'><a href='javascript:onLogoutClick()'>Log Out</a></div>\n" +
        "                    <div class='menuTab floatRight' title='modify profile'><a href='javascript:profilePease()'>Hello <span id='spnUserName'></span></a></div>\n" +
        "                </div>\n" +
        "                <div id='optionNotLoggedIn'>\n" +
        "                    <div id='btnLayoutRegister' class='menuTab floatRight'><a href='javascript:onRegisterClick()'>Register</a></div>\n" +
        "                    <div id='btnLayoutLogin' class='menuTab floatRight'><a href='javascript:onLoginClick()'>Log In</a></div>\n" +
        "                </div>\n" +
        "                <div class='menuTabs displayHidden' id='adminTabs'>\n" +
        "                    <div id='addImageDashboardAccess' class='ogg menuTab floatRight'><a href='~/Admin'>Admin</a></div>\n" +
        "                </div>\n" +
        "            </div>\n" +
        "        </div>\n";

    $('header').html(headerHtml);
}


