﻿
// login and I will let you see 1000 more images.
// bookmark my site with link oog?domain=122; to get another 1,000 image views.
// put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
// use my product
// Request extra privdleges 
// pay me to do some programming for you and I'll let you in on all my source code
var registerFromPageId;
function showRegisterDialog(pageId) {
    registerFromPageId = pageId;
    logEventActivity({
        VisitorId: getCookieValue("VisitorId"),
        EventCode: "RDO",
        EventDetail: "YESS!!!",
        PageId: registerFromPageId,
        CalledFrom: "showRegisterDialog"
    });

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
            //if (document.domain === 'localhost') alert("attempting to register");
            var registeredUserModel = {};
            registeredUserModel.VisitorId = getCookieValue("VisitorId");
            registeredUserModel.UserName = $('#txtRegisterUserName').val();
            registeredUserModel.Pswrd = $('#txtRegisterClearPassword').val();
            registeredUserModel.FirstName = $('#txtFirstName').val();
            registeredUserModel.LastName = $('#txtLastName').val();
            registeredUserModel.Email = $('#txtEmail').val();
            registeredUserModel.IpAddress = getCookieValue("IpAddress");
            registeredUserModel.Status = "NEW";           

            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "/api/Login/RegisterUser",
                data: registeredUserModel,
                success: function (success) {
                    if (success === "ok") {
                        $('#registerUserDialog').dialog('close');
                        //alert("register happened. Attempt Login");
                        console.log("register happened. Attempt Login");
                        setCookieValue("UserName", registeredUserModel.UserName);
                        attemptLogin(registeredUserModel.UserName, registeredUserModel.Pswrd);

                        //if (document.domain === 'localhost') alert("register success");
                        $('#spnUserName').html(getCookieValue("UserName"));
                        $('#optionLoggedIn').show();
                        $('#optionNotLoggedIn').hide();

                        if (document.domain !== 'localhost') {
                            logEventActivity({
                                VisitorId: getCookieValue("VisitorId"),
                                EventCode: "REG",
                                EventDetail: "User: " + registeredUserModel.UserName,
                                PageId: registerFromPageId,
                                CalledFrom: "attemptRegister"
                            });

                        }
                        //    alert("BIG TIME Someone new actually registered\nUser: " + registeredUserModel.UserName);
                        //else
                        //    sendEmailToYourself("BIG TIME Someone new actually registered", "User: " + registeredUserModel.UserName);

                        //
                        registerEmail = $('#txtEmail').val();
                        //alert("registerEmail: " + registerEmail);
                        showCustomMessage(96, false);
                        //setTimeout(function () { $('#userEmail').text($('#txtEmail').val()); }, 2000);
                        //displayStatusMessage("ok", "thanks for Registering in " + getCookieValue("UserName"));
                        // show welcom to Oggle Booble message.
                    }
                    else {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "KLG",
                            Severity: 2,
                            ErrorMessage: "attempting to register fail: " + success,
                            CalledFrom: "attemptRegister()"
                        });
                        alert("attempting to register fail: " + success);
                        //$('#registerValidationSummary').html(response).show();
                    }
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "attemptRegister")) {
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 1,
                            ErrorMessage: errorMessage,
                            CalledFrom: "attemptRegister()"
                        });
                        //alert("XHR ERROR IN Login.JS attemptRegister\n" + errorMessage);
                    }
                }
            });
        } catch (e) {
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CAT",
                Severity: 1,
                ErrorMessage: e,
                CalledFrom: "CATCH error attemptRegister() Login Post"
            });
            //alert("Login Post error: " + e);
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

    //<input id="txtFirstName" type="text" class="roundedInput"><br>
    //<input style="white-space:nowrap;" id="txtLastName" type="text" class="roundedInput"><br>
    //<input id="txtEmail" type="email" class="roundedInput" placeholder="you@example.org"><br>
    $('#errRegisterPassword').hide();
    return true;
}

function onLogoutClick() {
    //if (document.domain === 'localhost') alert("logging out");
    $('#optionLoggedIn').hide();
    $('#optionNotLoggedIn').show();
    $('.loginRequired').hide();
    setCookieValue("IsLoggedIn", "false");
    // deleteCookie();
}

var LogInFromPageId;
function showLoginDialog(pageId) {
    LogInFromPageId = pageId;
    logEventActivity({
        VisitorId: getCookieValue("VisitorId"),
        EventCode: "LDO",
        EventDetail: "YESS!!!",
        PageId: LogInFromPageId,
        CalledFrom: "showLoginDialog"
    });

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
                    setCookieValue("UserName", userName);
                    //  --setLoginHeader();
                    $('#spnUserName').html(userName);
                    $('#optionLoggedIn').show();
                    $('#optionNotLoggedIn').hide();
                    //if (getCookieValue("ipAddress") !== "68.203.90.183")// && ipAddress !== "50.62.160.105")
                    logEventActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        EventCode: "LOG",
                        EventDetail: "Successfull log in: " + getCookieValue("UserName"),
                        PageId: LogInFromPageId,
                        CalledFrom: "showLoginDialog"
                    });
                    //sendEmailToYourself("Someone Successfully logged in", "User: " + userName);
                    displayStatusMessage("ok", "thanks for logging in " + userName);
                }
                else {
                    $('#loginValidationSummary').html(success).show();
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "Q17",
                        Severity: 13,
                        ErrorMessage: "unsuccessful login attempt",
                        CalledFrom: "attemptLogin()"
                    });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "onLoginClick")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "showLoginDialog"
                    });
                    //sendEmailToYourself("XHR ERROR IN Login.JS onLoginClick", "api/Login/VerifyLogin?userName=" + userName + "&passWord=" + " Message: " + errorMessage);
                }
            }
        });
    }
} 

function validateLogin() {
    //alert("validateLogin");
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

function xxdeleteCookie() {
    window.localStorage["UserName"] = null;
    window.localStorage["IpAddress"] = null;
    window.localStorage["VisitorId"] = null;
    window.localStorage["UserName"] = null;
    window.localStorage["userPermissons"] = null;
    
    var expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() - 1);

    document.cookie = "expires:" + expiryDate.toUTCString();
    if (!isNullorUndefined(getCookieValue("UserName"))) 
    {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "JQ6",
            Severity: 2,
            ErrorMessage: "Delete Cookie Fail After Logout UserName: " + getCookieValue("UserName"),
            CalledFrom: "showLoginDialog"
        });
        //sendEmailToYourself("Delete Cookie Fail", "After Logout UserName: " + getCookieValue("UserName"));
        if (document.domain === 'localhost')  // #DEBUG
            alert("After Logout User: " + getCookieValue("UserName"));
        if (document.cookie) {
            if (document.domain === 'localhost')
                alert("cookie failed to delete: " + document.cookie);
        }
        //console.log("deleteCookie()  document.cookie: " + document.cookie);
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

    //if()

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




