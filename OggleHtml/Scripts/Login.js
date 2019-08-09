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

    document.cookie = "User=; expires = Thu, 01 Jan 1970 00:00:00 GMT";


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
                    getUserPermissions();
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

function getUserPermissions() {

    var userName = getCookie();
    if (userName !== "") {
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

