﻿function onRegisterClick() {
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

    //alert("onLogoutClick: " + document.cookie);

    //document.cookie = "OggleUser=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "User=; path=; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "User=; expires = Thu, 01 Jan 1970 00:00:00 GMT";
    //document.cookie = "expires = Thu, 01 Jan 1970 00:00:00 GMT";
    //document.cookie = null;

    if (document.cookie)
        alert("after logout document.cookie: " + document.cookie);

    $('#optionLoggedIn').hide();
    $('#optionNotLoggedIn').show();
    $('.loginRequired').hide();
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

                    //alert("setCookie($('#txtLoginUserName').val()); " + $('#txtLoginUserName').val());

                    setCookie($('#txtLoginUserName').val());

                    displayStatusMessage("ok", "thanks for logging in " + getCookieValue("User"));

                    setLoginHeader($('#txtLoginUserName').val());
                    setUserPermissions();
                }
                else

                    $('#loginValidationSummary').html(success).show();
            },
            error: function (jqXHR, exception) {
                alert("validateLogin XHR error: " + settingsArray.ApiServer + "api/Login/VerifyLogin?userName" + $('#txtLoginUserName').val() + "&passWord=" + $('#txtLoginClearPassword').val() + "  " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
    else {

        alert("");
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

function profilePease() {
    alert("profilePease");
}

function setUserPermissions() {
    if (document.domain === 'localhost') {
        $('.loginRequired').show();
        $('.adminLevelRequired').show();
        if (typeof isPornEditor === 'boolean') 
            isPornEditor = true;        
        if (typeof permissionsSet === "boolean")
            permissionsSet = true;
        $('#spnUserName').html("devl");
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').hide();
        //alert("document.domain : " + document.domain);
    }
    else
    {
        //alert("zentering setUserPermissions");
        var userName = getCookieValue("User");
        if (userName !== "") {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned",
                success: function (roleModel) {
                    if (roleModel.Success === "ok") {
                        $.each(roleModel.RoleNames, function (idx, roleName) {
                            //alert("roleModel.RoleName: " + roleName);
                            if (roleName === "Oggle Add Images") {
                                $('.loginRequired').show();
                            }
                            if (roleName === "Oggle admin") {
                                $('.loginRequired').show();
                                $('.adminLevelRequired').show();


                                if (typeof isPornEditor === 'boolean') {
                                    isPornEditor = true;
                                    //alert("setUserPermissions isPornEditor: " + isPornEditor);

                                }
                            }
                        });
                        if (typeof permissionsSet === "boolean")
                            permissionsSet = true;

                        //alert("leaving2 setUserPermissions");

                    }
                    else
                        alert("loadUserRoles: " + roleModel.Success);
                },
                error: function (jqXHR, exception) {
                    alert("loadUserRoles XHR error: " + getXHRErrorDetails(jqXHR, exception));
                }
            });
        }
        else {
            if (typeof permissionsSet === "boolean")
                permissionsSet = true;
            //alert("leaving setUserPermissions");
        }
    }
}

function isInRole(roleName) {
    var userName = getCookieValue("User");
    //alert("document.domain: " + document.domain);
    //window.localStorage()
    //if (userName !== "" || document.domain === 'localhost') {
}

// COOKIES
function setLoginHeader(userName) {
    if (userName === "unknown" || userName === "") {
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
        //$('.loginRequired').hide();
    }
    else {
        $('#spnUserName').html(userName);
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
    }
}

function setCookie(userName) {
    var expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9);
    document.cookie = 'User=' + userName + '; expires=' + expiryDate.toUTCString() + 'path=https://ogglebooble.com/';

    //alert("document.cookie:" + document.cookie);
    alert("expires: " + expiryDate.toUTCString());
}

function getCookieValue(valueName) {
    var decodedCookie = "";
    if (document.cookie) {
        var cName = valueName + "=";

        decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(cName) === 0) {
                var cookieValue = c.substring(cName.length, c.length);
                //alert("cookie success: " + c.substring(name.length, c.length));

                return cookieValue;
            }
            else {
                alert("document.cookie: " + document.cookie);
                alert("cookie value " + valueName + " not found");
            }
        }
    }
    //else alert("no cookie found");
    return decodedCookie;
}

