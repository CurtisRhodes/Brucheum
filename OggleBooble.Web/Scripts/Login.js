
// login and I will let you see 1000 more images.
// bookmark my site with link oog?domain=122; to get another 1,000 image views.
// put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
// use my product
// Request extra privdleges 
// pay me to do some programming for you and I'll let you in on all my source code

function showLoginDialog() {
    $('#centeredDialogTitle').html("Log In to OggleBooble");
    $('#centeredDialogContents').html(loginDialogHtml());
    $("#txtLoginClearPassword").keyup(function (event) {
        if (event.keyCode === 13) {
            attemptLogin();
        }
    });
    $("#vailShell").fadeIn();
    $("#centeredDialogContainer").draggable().fadeIn();
    $('.validationError').hide();
    if (typeof pause === 'function')
        pause();
}

function updateIsLoggedIn(isLoggedIn) {
    try {
        let visitorId = getVisitorId(444, "updateIsLoggedIn");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/UpdateIsLoggedIn?visitorId=" + visitorId + "&isLoggedIn=" + isLoggedIn,
            success: function (successModel) {

            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 0, errMsg, functionName);
            }
        });
    } catch (e) {
        logError("CAT", 333, e, "updateIsLoggedIn");
    }
}

function attemptLogin() {
    let userName = $('#txtLoginUserName').val();
    let clearPasswod = $('#txtLoginClearPassword').val();
    if (validateLogin()) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/VerifyLogin?userName=" + userName + "&passWord=" + clearPasswod,
            success: function (registeredUserSuccess) {
                if (registeredUserSuccess.Success === "ok") {
                    localStorage["IsLoggedIn"] = "true";
                    localStorage["UserName"] = registeredUserSuccess.UserInfo.UserName;
                    $('#spnUserName').html(localStorage["UserName"]);
                    localStorage["UserRole"] = registeredUserSuccess.UserInfo.UserRole;
                    localStorage["VisitorId"] = registeredUserSuccess.UserInfo.VisitorId;

                    //loadUserProfile(calledFrom);

                    updateIsLoggedIn(true);
                    $('#optionNotLoggedIn').hide();
                    $('#optionLoggedIn').show();
                    $('#footerCol5').show();

                    //setCookieValue("UserName", userName);
                    //setCookieValue("IsLoggedIn", true);
                    //setCookieValue("VisitorId", successModel.ReturnValue);
                    logEvent("LOG", 0, "Successfull log in: " + userName);

                    $("#vailShell").hide();
                    $("#centeredDialogContainer").hide();
                    displayStatusMessage("ok", "thanks for logging in " + userName);
                    //window.location.href = ".";
                }
                else {
                    if (successModel.ReturnValue == "valid") {
                        if (successModel.Success == "user name not found") {
                            showMyAlert("user name not found", "<div>you need to <a href='#'>register</a> username before you can login<div>");
                        } else
                            if (successModel.Success == "password fail") {
                                alert("password fail");
                            } else {
                                logError("AJX", 0, successModel.Success, "attempt Login");
                            }
                    }
                    else {
                        logError("AJX", 0, successModel.Success, "attempt Login");
                        alert("validate login: " + successModel.Success);
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 0, errMsg, functionName);
            }
        });
    }
} 

function validateLogin() {
    $('.validationError').hide();

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

function onLogoutClick(pageId) {
    if (confirm("log out?")) {
        //setCookieValue("IsLoggedIn", "false");
        localStorage["IsLoggedIn"] = "false";
        //alert("IsLoggedIn: " + localStorage["IsLoggedIn"]);
        updateIsLoggedIn(false);
        $('#optionLoggedIn').hide();
        $('#optionNotLoggedIn').show();
        $('#footerCol5').hide();
    }
    //window.location.href = ".";
}

function cancelLogin() {
    dragableDialogClose();
    if (typeof resume === 'function')
        resume();
}

function transferToRegisterPopup() {
    //$('#loginDialog').dialog('close');
    //$('#loginDialog').hide();
    showRegisterDialog("transfer");
}

function loginDialogHtml() {
    let loginHtml = "<div id='errLoginUserName' class='validationError'>Required</div>\n" +
        "    <label>User Name</label><br>\n" +
        "    <input id='txtLoginUserName' class='roundedInput'></input><br>\n" +
        "    <div id='errLoginPassword' class='validationError'>Required</div>\n" +
        "    <label>Password</label><br>\n" +
        "    <input id='txtLoginClearPassword' class='roundedInput' placeholder='********'></input><br>\n" +
        "    <button id='btnLoginPopupLogin' class='roundendButton' onclick='attemptLogin()'>" +
        "        <img id='btnLoginSpinnerImage' class='btnSpinnerImage' src='/images/loader.gif'>Log in</button>\n" +
        "    <div class='ckRemember'>\n" +
        "        <input id='ckRememberMe' type='checkbox' checked='checked'></input> Remember Me ?  (<span>uses a cookie</span>)\n" +
        "    </div>\n" +
        "    <div class='forgot'>\n" +
        "        <a id='forgot-pw' href='/users/account-recovery'>forgot password ?</a>\n" +
        "    </div>\n" +
        "    <div>\n" +
        "        <div onclick='transferToRegisterPopup()' class='clickable inline'>Register</div>\n" +
        "        <div onclick='cancelLogin()' class='clickable inline'>Cancel</div>\n" +
        "    </div>\n" +
        //"    <div class='center'>or</div>\n" +
        //"    <div class='externalLogin'>\n" +
        //"        <div class='fb-login-button' data-max-rows='1' data-size='medium' style='width:100px !important;'" +
        //"            data-show-faces='false' data-auto-logout-link='false' data-use-continue-as='false' " +
        //"            scope='public_profile,email' onlogin='checkFaceBookLoginState();'>\n" +
        //"        </div>\n" +
        //"        <FB:login-button scope='public_profile,email' onlogin='checkFaceBookLoginState();'>\n" +
        //"            <svg class='svg-icon iconFacebook' width='18' height='18' viewBox='0 0 18 18'>\n" +
        //"            <path d='M1.88 1C1.4 1 1 1.4 1 1.88v14.24c0 .48.4.88.88.88h7.67v-6.2H7.46V8.4h2.09V6.61c0-2.07 1.26-3.2 3.1-3.2.88 0 " +
        //"               1.64.07 1.87.1v2.16h-1.29c-1 0-1.19.48-1.19 1.18V8.4h2.39l-.31 2.42h-2.08V17h4.08c.48 0 .88-.4.88-.88V1.88c0-.48-.4-.88-.88-.88H1.88z' fill='#3C5A96'></path>\n" +
        //"           </svg>\n" +
        //"          Facebook\n" +
        //"       </FB:login-button>\n" +
        //"   </div>\n" +
        //"   <div class='externalLogin google-login' data-provider='google' data-oauthserver='https://accounts.google.com/o/oauth2/auth' data-oauthversion='2.0'>\n" +
        //"       <svg aria-hidden='true' class='svg-icon native iconGoogle' width='18' height='18' viewBox='0 0 18 18'>\n" +
        //"           <g>\n" +
        //"               <path d='M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z' fill='#4285F4'></path>\n" +
        //"               <path d='M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z' fill='#34A853'></path>\n" +
        //"               <path d='M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z' fill='#FBBC05'></path>\n" +
        //"               <path d='M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z' fill='#EA4335'></path>\n" +
        //"           </g>\n" +
        //"       </svg>\n" +
        //"       Google\n" +
        //"   </div>\n" +
        "</div>\n";
    return loginHtml;
}

function checkFaceBookLoginState() {
    alert("checkFaceBookLoginState()");
}

///////////////////////////////////////////////////////////////////////////////////////

function showRegisterDialog(calledFrom) {
    if (typeof pause === 'function') pause();
    $('#centeredDialogTitle').html("Register and Login to OggleBooble");
    $('#centeredDialogContents').html(registerDialogHtml());
    $("#vailShell").fadeIn();
    $("#centeredDialogContainer").draggable().fadeIn();
    $('.validationError').hide();
    // $("#centeredDialogContainer").css("width", "400");
    logEvent("RDO", 0, "YESS!!!");
}

function attemptRegister() {
    try {
        if (validateRegister()) {

            let visitorId = getVisitorId(3333, "attemptRegister");

            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "/api/Login/AddRegisterUser",
                data: {
                    VisitorId: visitorId,
                    UserName: $('#txtRegisterUserName').val(),
                    ClearPassword: $('#txtRegisterClearPassword').val(),
                    FirstName: $('#txtRegisterFirstName').val(),
                    LastName: $('#txtLastName').val(),
                    UserRole: "normal",
                    UserCredits: 5000,
                    Email: $('#txtRegisterEmail').val(),
                    Status: "NEW"
                },
                success: function (success) {
                    if (success === "ok") {
                        // registerHappyPath();
                        loadUserProfile("attempt register");

                        displayStatusMessage("ok", "thanks for Registering " + localStorage["UserName"]);

                        sendEmail("CurtishRhodes@hotmail.com", "SomeoneRegisterd@Ogglebooble.com", "Someone Registerd !!!",
                            "UserName: " + localStorage["UserName"] + "<br/>VisitorId: " + visitorId);

                        localStorage["IsLoggedIn"] = true;
                        $('#optionLoggedIn').show();
                        $('#optionNotLoggedIn').hide();
                        dragableDialogClose();
                        if (typeof resume === 'function')
                            resume();

                        //window.location.href = ".";
                        //showCustomMessage(96, false);
                    }
                    else {
                        if ((success == "user name already exists") ||
                            (success == "visitorId already registered"))
                            $('#errRegisterUserName').text(successModel.Success).show();
                        else {
                            logError("AJX", 0, success, "attemptcRegister");
                            $('#registerValidationSummary').html(response).show();
                        }
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                    if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 0, errMsg, functionName);
                }
            });
        }
    } catch (e) {
        logError("CAT", 0, e, "attempt Register");
    }
}

function validateRegister() {
    if ($('#txtRegisterUserName').val() === "") {
        $('#errRegisterUserName').show();
        return false;
    }
    $('#errRegisterUserName').hide();

    if ($('#txtRegisterClearPassword').val() === "") {
        $('#errRegisterPassword').text("password required").show();
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
    if ($('#txtRegisterEmail').val() === "") {
        $('#errRegisterEmail').show();
        return false;
    }
    if (!isValidEmail($('#txtRegisterEmail').val())) {
        $('#errRegisterEmail').html("invalid email").show();
        hasValidtionErrors = true;
    }
    $('#errRegisterEmail').hide();
    if ($('#txtRegisterFirstName').val() === "")
        $('#txtRegisterFirstName').val("unknown");
    return true;
}

function registerDialogHtml() {
    return "   <div id='registerValidationSummary' class='validationError'></div>\n" +
        "   <div id='errRegisterUserName' class='validationError'>Required</div>\n" +
        "   <label style='white-space:nowrap;'>user name</label><span class='requiredField' title='required'>  *</span><br>\n" +
        "   <input id='txtRegisterUserName' type='text' class='roundedInput' placeholder='your go by name'></input><br>\n" +
        "   <div id='errRegisterPassword' class='validationError'>Password Required</div>\n" +
        "   <label>password</label><span class='requiredField' title='required'> *</span><br>\n" +
        "   <input id='txtRegisterClearPassword' class='roundedInput' placeholder='********'></input><br>\n" +
        "   <label style='white-space:nowrap;'>retype password</label><span class='requiredField' title='retype Password required'>  *</span><br>\n" +
        "   <input id='txtRegisterClearPasswordRetype' class='roundedInput' autocomplete='off' placeholder='********'></input><br>\n" +
        "   <div class='rememberMe'>\n" +
        "       <input id='ckRememberMe' type='checkbox' checked='checked'></input>  Remember Me ?  (<span>uses a cookie</span>)\n" +
        "   </div>\n" +
        "   <label style='white-space:nowrap;'>First Name</label>\n" +
        "   <input id='txtRegisterFirstName' type='text' class='roundedInput'></input><br>\n" +
        "   <label style='white-space:nowrap;'>Last Name</label>\n" +
        "   <input style='white-space:nowrap;' id='txtLastName' type='text' class='roundedInput'></input><br>\n" +
        "   <div id='errRegisterEmail' class='validationError'>Email Required</div>\n" +
        "   <label>Email</label>\n" +
        "   <input id='txtRegisterEmail' type='email' class='roundedInput' placeholder='you@example.org'></input><br>\n" +
        "   <button class='roundendButton submitButton' onclick='attemptRegister()'>Submit</button>\n";
}

var registerEmail;
var requestedPrivileges = [];
function authenticateEmail(usersEmail) {
    var privileges = "";
    $.each(requestedPrivileges, function (idx, obj) {
        privileges += obj + ", ";
    });
    logEvent("", 0, "authenticateEmail");

    sendEmail("CurtishRhodes@hotmail.com", "SomeoneAuthenticated@Ogglebooble.com", "Someone Authenticated !!!", "OH MY GOD");

    alert("Thank you for registering " + localStorage["UserName"] + "\n please reply to the two factor authentitifcation email sent to you" +
        "\nYou will then be granted the access you requested." + "\nThe menu item 'Dashboard' will appear next to your 'Hello' message");
    dragableDialogClose();
}

///////////////////////////////////////////////////////////////////////////////////////

function userProfileHtml() {
    return "<div id='userProfileDialog' class='roundedDialog' >\n" +
        "   <div><label style='white-space:nowrap;'>user name</label><input id='txtUserProfileName' class='roundedInput' placeholder='your go by name'></input></div>\n" +
        "   <div><label style='white-space:nowrap;'>First Name</label><input id='txtUserProfileFirstName' class='roundedInput'></input></div>\n" +
        "   <div><label style='white-space:nowrap;'>Last Name</label><input id='txtUserProfileLastName' class='roundedInput'></input></div>\n" +
        "       <div id='errUserProfileEmail' class='validationError'></div>\n" +
        "   <div><label>Email</label><input id='txtUserProfileEmail' style='roundedInput; width:100%'></input>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnUserProfileSave' class='roundendButton' onclick='updateUserProfile()'>Save</div>\n" +
        "       <div id='btnUserProfileCancel' class='roundendButton' onclick='dragableDialogClose()'>Cancel</div>\n" +
        "   </div>\n" +
        "</div>\n";
}

function updateUserProfile() {
    let userProfileData = {
        UserName: $('#txtUserProfileName').val(),
        FirstName: $('#txtUserProfileFirstName').val(),
        LastName: $('#txtUserProfileLastName').val(),
        Email: $('#txtUserProfileEmail').val()
    };
    updateRegisteredUser(userProfileData);
}

function updateRegisteredUser(userProfileData) {
    try {
        let visitorId = getVisitorId(222, "updateRegisteredUser");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleUser/GetUserInfo?visitorId=" + visitorId,
            success: function (registeredUser) {
                if (registeredUser.Success == "ok") {
                    let currentRegisteredUser = registeredUser.UserInfo;
                    currentRegisteredUser.UserName = userProfileData.UserName;
                    currentRegisteredUser.FirstName = userProfileData.FirstName;
                    currentRegisteredUser.LastName = userProfileData.LastName;
                    currentRegisteredUser.Email = userProfileData.Email;

                    $.ajax({
                        type: "PUT",
                        url: settingsArray.ApiServer + "api/OggleUser/UpdateUser",
                        data: currentRegisteredUser,
                        success: function (success) {
                            if (success == "ok") {
                                displayStatusMessage("ok", "user profile updated");
                            }
                            else {
                                logError("AJX", 0, success, "update Registered User");
                                displayStatusMessage("error", "unable to update user profile: " + success);
                            }
                        },
                        error: function (jqXHR) {
                            let errMsg = getXHRErrorDetails(jqXHR);
                            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", 0, errMsg, functionName);
                        }
                    });
                }
                else {
                    logError("AJX", 0, success, "update Registered User");
                    displayStatusMessage("error", "unable to update user profile: " + success);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "Get UserInfo")) logError("XHR", 0, errMsg, "Get UserInfo");
            }
        });
    } catch (e) {
        logError("CAT", 0, e, "update Registered User");
    }
}

/////////////////////////////////////////////////////////////////////////////////////////

//DAC	IME	Image Error
//DAC	LKM	Link Moved
//DAC	ARK	Archive Image
function awardCredits(activityCode, folderId) {
    let visitorId = getVisitorId(3333, "awardCredits");
    let credits;
    switch (activityCode) {
        case "PBV": credits = -20; break; // Playboy Page View
        case "PGV": credits = -10; break; // Page View
        case "INC": credits = 500; break; // Initial Credit
        case "LKC": credits = 200; break; // Link Copied
        case "IMC": credits = 200; break; // Image Comment
        case "NIA": credits = 200; break; // New Image Added
        case "FIE": credits = 100; break; // Folder Info Edited
        default:
            logError("SWT", folderId, "activityCode: " + activityCode, "awardCredits");
            credits = -10;
            //alert("unhandled awardCredits activityCode: " + activityCode);
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/User/AwardCredits",
        data: {
            VisitorId: visitorId,
            ActivityCode: activityCode,
            PageId: folderId,
            Credits: credits
        },
        success: function (success) {
            if (success === "ok") {
                //displayStatusMessage("ok", "credits charged");
            }
            else {
                logError("AJX", folderId, success, "awardCredits");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "awardCredits")) logError("XHR", folderId, errMsg, "awardCredits");
        }
    });
}
