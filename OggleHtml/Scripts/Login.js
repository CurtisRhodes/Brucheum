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
    setCookieValue("User", "");
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

                    setCookieValue("User", $('#txtLoginUserName').val());

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

        //alert("");
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
    //alert("document.domain : " + document.domain);
    if (document.domain === 'localhost') {

        $('.loginRequired').show();
        $('.adminLevelRequired').show();
        if (typeof isPornEditor === 'boolean') 
            isPornEditor = true;        
        if (typeof permissionsSet === "boolean")
            permissionsSet = true;

        setLocalValue("User", "devl");
        $('#spnUserName').html("devl");
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').hide();
        //alert("document.domain : " + document.domain);
    }
    else
    {
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
                                }
                            }
                        });
                        //setLoginHeader(userName);
                        if (typeof permissionsSet === "boolean")
                            permissionsSet = true;
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
        }
    }
}

function isInRole(roleName) {
    var userName = getCookieValue("User");
    //alert("document.domain: " + document.domain);
    //window.localStorage()
    //if (userName !== "" || document.domain === 'localhost') {
}

function setLoginHeader(userName) {
    //alert("setLoginHeader: " + userName);

    //var xxuserName = getCookieValue("User");
    //alert("in setLoginHeader xxuserName:" + xxuserName);

    if (userName === "Unknown" || userName === "unknown" || userName === "") {
        //alert("userName unknown: " + userName);
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

function deleteCookie() {
    //alert("BEFORE delete document.cookie: " + decodeURIComponent(document.cookie));
    var expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() - 1);
    //document.cookie = "";
    //document.cookie = "VisitorIdundefined=;VisitorId=;expires=" + expiryDate.toUTCString() + ";";
    //document.cookie = "VisitorId=;expires=" + expiryDate.toUTCString() + ";";
    document.cookie = "VisitorId=;IpAddress=;User=;path=;expires=" + expiryDate.toUTCString();
    //document.cookie = "VisitorId:;IpAddress:;User:;path:;expires=" + expiryDate.toUTCString();
    //document.cookie = "expires=" + expiryDate.toUTCString() + ";";

    //alert("after delete document.cookie:\n [" + document.cookie + "]");
}

// COOKIES
function setCookieValue(elementName, elementValue) {
    //alert("setCookieValue(" + elementName + "," + elementValue + ")");
    var decodedCookie = "";
    if (document.cookie) {
        var user = "Unknown";
        var ipAddress = getCookieValue("IpAddress");
        var visitorId = getCookieValue("VisitorId");
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
    deleteCookie();
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9);

    //var cookieString = "VisitorId=" + visitorId + ";IpAddress=" + ipAddress + ";User=" + user + ";path='/;expires=" + expiryDate.toUTCString();
    var cookieString = "VisitorId:" + visitorId + ",IpAddress:" + ipAddress + ",User:" + user + ",path:'/,expires:" + expiryDate.toUTCString();

    //var cookieObject = { "VisitorId": visitorId, "IpAddress": ipAddress, "User": user, "path": '/', "expires": expiryDate.toUTCString() };
    //var jsonString = JSON.stringify(cookieObject);
    //var cookieString = "VisitorId=" + visitorId + ";IpAddress=" + ipAddress + ";User=" + user + ";path='/;expires=" + expiryDate.toUTCString(); 
    //alert("jsonString: " + jsonString);
    //document.cookie = "cookieValues=" + jsonString;

    document.cookie = cookieString;

    //if (elementName === "VisitorId" && user === "cooler")
    //{
    //    alert("should be: " + cookieString);
    //    alert("MY document.cookie: " + document.cookie);
    //}
}

function getCookieValue(itemName) {
    //var testUser = "";
    //alert("getCookieValue: " + itemName);
    var rtn = "";
    if (document.cookie) {
        var decodedCookie = decodeURIComponent(document.cookie);
        //if (itemName === "VisitorId") alert("decodedCookie: " + decodedCookie);
        var cookieElements = decodedCookie.split(',');
        var cookieItem; var cookieItemName; var cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split(':');
            cookieItemName = cookieItem[0].trim();//.substring(0, cookieElements[i].indexOf("=")).trim();
            cookieItemValue = cookieItem[1];//.substring(cookieElements[i].indexOf("=") + 1);

            //if (cookieItemName === "User") {
            //    if (testUser === "") {
            //        testUser = cookieItemValue;
            //        i = 0;
            //    }
            //}
            //if (itemName === "VisitorId") alert("cookieItem: " + cookieItem + "   cookieItemName: " + cookieItemName + " cookieItemValue: " + cookieItemValue);
            if (cookieItemName === itemName) {

                //if (itemName === "VisitorId" && testUser === "cooler")
                //    alert("FOUND itemName: " + itemName + "  value: " + cookieItemValue);


                rtn = cookieItemValue;
                break;
            }
            else {
                //if (itemName === "VisitorId" && testUser === "cooler")
                  //  alert("cookie item[" + i + "] name: {" + cookieItemName + "} value  " + cookieItemValue + "  looking for: " + itemName);
            }
        }
        //if (rtn === "" && itemName === "VisitorId") {
         //   alert("'" + itemName + "' not found  \ngetCookieValue says document.cookie:\n" + document.cookie.toString());
        //}
    }
    //else alert("no cookie found");
    return rtn;
}

