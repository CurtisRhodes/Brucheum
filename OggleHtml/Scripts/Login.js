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
                        //alert("register happened. Attempt Login");
                        console.log("register happened. Attempt Login");
                        setCookieValue("UserName", registeredUserModel.UserName);
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
    var ipAddress = getCookieValue("IpAddress");
    if (!isNullorUndefined(ipAddress)) {
        //alert("Logging In and already know Ip");
        //console.log("Logging In and already know Ip");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress,
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    sendEmailToYourself("HOLY COW. " + userName + " is trying to login", "(Had to lookup thier ip address) Ip: " + ipAddress);
                }
                else {
                    sendEmailToYourself("ERROR IN LOGIN. GetVisitorIdFromIP Fail", "Message: " + successModel.Success);
                    //alert("GetVisitorIdFromIP: " + successModel.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "onLoginClick")) {
                    sendEmailToYourself("XHR ERROR IN Login.JS onLoginClick", "api/PageHit/GetVisitorIdFromIP?ipAddress=" + ipAddress +
                        " Message: " + errorMessage);
                }
            }
        });
    }
    else
        sendEmailToYourself("HOLY COW. Someone is trying to login", "Ip: " + ipAddress);

    $('#modalContainer').show();
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

function attemptLogin(userName, clearPasswod) {
    if (validateLogin()) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/VerifyLogin?userName=" + userName + "&passWord=" + clearPasswod,
            success: function (success) {
                if (success === "ok") {
                    $('#loginDialog').dialog('close');
                    setCookieValue("UserName", $('#txtLoginUserName').val());

                    var userName = getCookieValue("UserName");
                    if (isNullorUndefined(userName)) {
                        sendEmailToYourself("LOGING FAIL", "User cookie not set");
                        if (document.domain === 'localhost')  // #DEBUG
                            alert("LOGING FAIL.  User cookie not set");
                        return;
                    }

                    setUserPermissions();
                    window.localStorage["userPermissons"].push("logged in user");

                    //setLoginHeader();
                    $('#spnUserName').html(user);
                    $('#optionLoggedIn').show();
                    $('#optionNotLoggedIn').hide();
                    sendEmailToYourself("Someone Successfully logged in", "User: " + user);


                    //alert("auto fill username: " + getCookieValue("UserName"));
                    displayStatusMessage("ok", "thanks for logging in " + getCookieValue("UserName"));
                }
                else
                    $('#loginValidationSummary').html(success).show();
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "onLoginClick")) {
                    sendEmailToYourself("XHR ERROR IN Login.JS onLoginClick", "api/Login/VerifyLogin?userName=" + userName + "&passWord=" +
                        " Message: " + errorMessage);
                }
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
    window.localStorage["UserName"] = null;
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
    if (getCookieValue("UserName") !== null) {
        sendEmailToYourself("Delete Cookie Fail", "After Logout User: " + getCookieValue("UserName"));
        if (document.domain === 'localhost')  // #DEBUG
            alert("After Logout User: " + getCookieValue("UserName"));
    }
}

function setCookieValue(elementName, elementValue) {
    //alert("setCookieValue(" + elementName + "," + elementValue + ")");
    window.localStorage[elementName] = elementValue;

    var decodedCookie = "";
    if (document.cookie) {
        var ipAddress = getCookieValue("IpAddress");
        var visitorId = getCookieValue("VisitorId");
        var userName = getCookieValue("UserName");
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
        }
    }
    if (elementName === "UserName") userName = elementValue;
    if (elementName === "IpAddress") ipAddress = elementValue;
    if (elementName === "VisitorId") visitorId = elementValue;
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




