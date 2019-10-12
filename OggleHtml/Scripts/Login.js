function onRegisterClick() {
    $('#customMessage').hide();
    forgetShowingCustomMessage = true;
    $('#modalContainer').show();
    
    $('#registerUserDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" }
    });
    $('#registerUserDialog').show();

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

function attemptRegister() {
    if (validateRegister()) {
        try {
            var registeredUserModel = {};
            registeredUserModel.UserName = $('#txtRegisterUserName').val();
            registeredUserModel.Pswrd = $('#txtRegisterClearPassword').val();
            registeredUserModel.FirstName = $('#txtFirstName').val();
            registeredUserModel.LastName = $('#txtLastName').val();
            registeredUserModel.Email = $('#txtEmail').val();
            registeredUserModel.IpAddress = getCookieValue("IpAddress");
            registeredUserModel.AppName = "OggleBoogle";

            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "/api/Login/RegisterUser",
                data: registeredUserModel,
                success: function (response) {
                    if (response === "ok") {
                        $('#registerUserDialog').dialog('close');
                        alert("register happened. Attempt Login");
                        console.log("register happened. Attempt Login");
                        setCookieValue("User", registeredUserModel.UserName);
                        attemptLogin(registeredUserModel.UserName, registeredUserModel.Pswrd );
                    }
                    else {
                        alert("$('#registerValidationSummary').html(response).show();");
                        console.log("$('#registerValidationSummary').html(response).show();");


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
    $('#optionLoggedIn').hide();
    $('#optionNotLoggedIn').show();
    $('.loginRequired').hide();

    deleteCookie();

}

function onLoginClick() {
    $('#modalContainer').show();
    $('#loginDialog').show();
    $('#loginDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: 333
    });

    var ipAddress = getCookieValue("IpAddress");
    if (!isNullorUndefined(ipAddress)) {
        //alert("Logging In and already know Ip");
        console.log("Logging In and already know Ip");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    setCookieValue("User", successModel.UserName);
                    console.log("auto fill username: " + getCookieValue("User"));
                    //alert("auto fill username: " + getCookieValue("User"));
                    $('#txtLoginUserName').val(successModel.UserName);
                }
                else
                    alert("GetVisitorIdFromIP: " + successl.Success);
            },
            error: function (jqXHR, exception) {
                alert("GetVisitorIdFromIP jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }


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

function attemptLogin(userName, clearPasswod) {

    if (validateLogin()) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/VerifyLogin?userName=" + userName + "&passWord=" + clearPasswod,
            success: function (success) {
                if (success === "ok") {
                    $('#loginDialog').dialog('close');


                    //alert("attempting login");
                    // VerifyLogin?userName=" + $('#txtLoginUserName').val() + "&passWord=" + $('#txtLoginClearPassword').val(),
                    //expiryDate = new Date();
                    //expiryDate.setMonth(expiryDate.getMonth() + 9);
                    //var cookieString = "VisitorId=" + visitorId + ";IpAddress=" + ipAddress + ";User=" + user + ";path='/;expires=" + expiryDate.toUTCString();
                    //var cookieString = "VisitorId:" + visitorId + ",IpAddress:" + ipAddress + ",User:" + user + ",path:'/,expires:" + expiryDate.toUTCString();
                    //document.cookie = cookieString;


                    setCookieValue("User", $('#txtLoginUserName').val());

                    displayStatusMessage("ok", "thanks for logging in " + getCookieValue("User"));

                    //alert("thanks for logging in " + getCookieValue("User"));
                    //alert("setCookie(User: " + $('#txtLoginUserName').val());

                    setLoginHeader();
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

// COOKIES

function deleteCookie() {
    window.localStorage["User"] = null;
    window.localStorage["IpAddress"] = null;
    window.localStorage["VisitorId"] = null;
    //alert("BEFORE delete document.cookie: " + decodeURIComponent(document.cookie));
    var expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() - 1);

    //document.cookie= "VisitorId:" + visitorId + ",IpAddress:" + ipAddress + ",User:" + user + ",path:'/,expires:" + expiryDate.toUTCString();
    //document.cookie = "VisitorId:=,IpAddress=,User=,path=,expires:" + expiryDate.toUTCString();
    document.cookie = "expires:" + expiryDate.toUTCString();
    //if (document.cookie) {
    //    alert("cookie failed to delete: " + document.cookie);
    //}
    console.log("deleteCookie()  document.cookie: " + document.cookie);
    //if (getCookieValue("User") !== null)
    //    alert("After Logout User: " + getCookieValue("User"));
}

function setCookieValue(elementName, elementValue) {
    //alert("setCookieValue(" + elementName + "," + elementValue + ")");
    window.localStorage[elementName] = elementValue;
    var decodedCookie = "";
    if (document.cookie) {
        var ipAddress = getCookieValue("IpAddress");
        var visitorId = getCookieValue("VisitorId");
        var user = getCookieValue("User");
        decodedCookie = decodeURIComponent(document.cookie);
        var cookieElements = decodedCookie.split(';');
        var cookieItem; var cookieItemName; var cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i];
            cookieItemName = cookieItem.substring(0, cookieItem.indexOf("="));
            cookieItemValue = cookieItem.substring(cookieItem.indexOf("=") + 1);
            if (cookieItemName === "User") user = cookieItemValue;
            if (cookieItemName === "IpAddress") ipAddress = cookieItemValue;
            if (cookieItemName === "VisitorId") visitorId = cookieItemValue;
        }

        if (elementName === "User") user = elementValue;
        if (elementName === "IpAddress") ipAddress = elementValue;
        if (elementName === "VisitorId") visitorId = elementValue;
    }
    //deleteCookie();
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9);

    //var cookieString = "VisitorId=" + visitorId + ";IpAddress=" + ipAddress + ";User=" + user + ";path='/;expires=" + expiryDate.toUTCString();
    var cookieString = "VisitorId:" + visitorId + ",IpAddress:" + ipAddress + ",User:" + user + ",path:'/,expires:" + expiryDate.toUTCString();
    document.cookie = cookieString;


    //alert("setCookieValue(" + elementName + "," + elementValue + ")\ncookie:\n" + document.cookie);

}

function getCookieValue(itemName) {
    var returnValue = window.localStorage[itemName];

    if (returnValue !== undefined) {
        //alert(itemName + "=" + returnValue + " found in local storage");
    }
    else {
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
    if (isNullorUndefined(returnValue)) {
       // $('#footerMessage').html("getCookieValue FAIL for: " + itemName + " = " + returnValue);
        //alert("getCookieValue FAIL for: " + itemName + " = " + returnValue + "\ncookie: \n" + document.cookie);
    }
    return returnValue;
}

function setLocalValue(localName, localValue) {
    alert("setLocalStorage[" + localName + "] = " + localValue);
    window.localStorage[localName] = localValue;
}

function getLocalValue(localName) {
    var localValue = getCookieValue(localName);
    alert("getLocalValue " + localName + " = " + localValue);
    return localValue;
}

// PERMISSIONS

function setUserPermissions() {
    if (document.domain === 'localhost') {

        //alert("document.domain: " + document.domain);

        $('.loginRequired').show();
        $('.adminLevelRequired').show();


        //if (typeof permissionLevel === 'object')
        //{
        //    isPornEditor = true;        
        //}

        //NOT FOUND - The server has not found anything matching the requested URI(Uniform Resource Identifier).
        //  GET - http://localhost:56437/Styles/images/ui-icons_f5e175_256x240.png


        if (typeof isPornEditor === 'boolean')
            isPornEditor = true;

        if (typeof permissionsSet === "boolean")
            permissionsSet = true;
        else {
            alert("typeof permissionsSet: " + typeof permissionsSet);
            permissionsSet = true;
        }

        //setLocalValue("User", "devl");
        $('#spnUserName').html("devl");
        $('#optionLoggedIn').show();
        $('#optionNotLoggedIn').hide();
        //alert("document.domain : " + document.domain);
    }
    else {
        var userName = getCookieValue("User");
        if (!isNullorUndefined(userName)) {
            //alert("setUserPermissions userName: " + userName);
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
                                }
                            }
                        });

                        //setLoginHeader();
                        if (typeof permissionsSet === "boolean")
                            permissionsSet = true;
                        else {
                            alert("typeof permissionsSet: " + typeof permissionsSet);
                            permissionsSet = true;
                        }
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
            //if (typeof permissionsSet === "boolean")

            permissionsSet = true;
        }
    }
}

function isInRole(roleName) {
    var userName = getCookieValue("User");
    //alert("document.domain: " + document.domain);
    //window.localStorage()
    //if (userName !== "" || document.domain === 'localhost') {
}



