
// login and I will let you see 1000 more images.
// bookmark my site with link oog?domain=122; to get another 1,000 image views.
// put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
// use my product
// Request extra privdleges 
// pay me to do some programming for you and I'll let you in on all my source code

var loginFromPageId;
function showLoginDialog() {
    $('#centeredDialogTitle').html("Log In to OggleBooble");
 +   $('#centeredDialogContents').html(loginDialogHtml());

    // $("#centeredDialogContainer").css("width", "400");

    $("#vailShell").fadeIn();
    $("#centeredDialogContainer").fadeIn();
    $('.validationError').hide();

    if (typeof pause === 'function')
        pause();
}

function attemptLogin() {
    var userName = $('#txtLoginUserName').val();
    var clearPasswod = $('#txtLoginClearPassword').val();
    if (validateLogin()) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/VerifyLogin?userName=" + userName + "&passWord=" + clearPasswod,
            success: function (success) {
                if (success === "ok") {
                    setCookieValue("UserName", userName);
                    setCookieValue("IsLoggedIn", true);
                    logEvent("LOG", loginFromPageId, "Successfull log in: " + getCookieValue("UserName"));
                    displayStatusMessage("ok", "thanks for logging in " + userName);
                    window.location.href = ".";
                }
                else {
                    $('#loginValidationSummary').html(success).show();
                    logError("AJX", loginFromPageId, success, "attemptLogin");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("attemptLogin")) 
                    logError("XHR", loginFromPageId, getXHRErrorDetails(jqXHR), "attemptLogin");
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
    setCookieValue("IsLoggedIn", "false");
    window.location.href = ".";
}

function profilePease() {
    alert("profilePease");
}

function cancelLogin() {
    $('#modalContainer').hide();
    //$('#loginDialog').hide();
    if (typeof resume === 'function')
        resume();
}
function transferToRegisterPopup() {
    //$('#loginDialog').dialog('close');
    $('#modalContainer').hide();
    //$('#loginDialog').hide();
    onRegisterClick();
}

function loginDialogHtml() {
    return  "<div id='errLoginUserName' class='validationError'>Required</div>\n" +
        "    <label>User Name</label><br>\n" +
        "    <input id='txtLoginUserName' class='roundedInput'><br>\n" +
        "    <div id='errLoginPassword' class='validationError'>Required</div>\n" +
        "    <label>Password</label><br>\n" +
        "    <input id='txtLoginClearPassword' class='roundedInput' placeholder='********'><br>\n" +
        "    <button id='btnLoginPopupLogin' class='roundendButton' onclick='attemptLogin()'>" +
        "        <img id='btnLoginSpinnerImage' class='btnSpinnerImage' src='/images/loader.gif'>Log in</button>\n" +
        "    <div class='ckRemember'>\n" +
        "        <input id='ckRememberMe' type='checkbox' checked='checked' />  Remember Me ?  (<span>uses a cookie</span>)\n" +
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
}

$("#txtLoginClearPassword").keyup(function (event) {
    if (event.keyCode === 13) {
        alert("$(#txtLoginClearPassword).keyup");
        attemptLogin();
    }
});

function checkFaceBookLoginState() {
    alert("checkFaceBookLoginState()");
}

function showRegisterDialogHtml() {
    $('#registerDialogContainer').html(
        "<div id='registerUserDialog' class='modalDialog' title='Register'>\n" +
        "   <div id='registerValidationSummary' class='validationError'></div>\n" +
        "   <div id='errRegisterUserName' class='validationError'>Required</div>\n" +
        "   <label style='white-space:nowrap;'>user name</label><span class='requiredField' title='required'>  *</span><br>\n" +
        "   <input id='txtRegisterUserName' type='text' class='roundedInput' placeholder='your go by name'><br>\n" +
        "   <div id='errRegisterPassword' class='validationError'>Password Required</div>\n" +
        "   <label>password</label><span class='requiredField' title='required'>  *</span><br>\n" +
        "   <input id='txtRegisterClearPassword' class='roundedInput' placeholder='********'><br>\n" +
        "   <label style='white-space:nowrap;'>retype password</label><span class='requiredField' title='retype Password required'>  *</span><br>\n" +
        "   <input id='txtRegisterClearPasswordRetype' class='roundedInput' autocomplete='off' placeholder='********'><br>\n" +
        "   <div class='rememberMe'>\n" +
        "       <input id='ckRememberMe' type='checkbox' checked='checked' />  Remember Me ?  (<span>uses a cookie</span>)\n" +
        "   </div>\n" +
        "   <label style='white-space:nowrap;'>First Name</label>\n" +
        "   <input id='txtFirstName' type='text' class='roundedInput'><br>\n" +
        "   <label style='white-space:nowrap;'>Last Name</label>\n" +
        "   <input style='white-space:nowrap;' id='txtLastName' type='text' class='roundedInput'><br>\n" +
        "   <label>Email</label>\n" +
        "   <input id='txtEmail' type='email' class='roundedInput' placeholder='you@example.org'><br>\n" +
        "   <button class='roundendButton submitButton' onclick='attemptRegister()'>Submit</button>\n" +
        "</div>\n");
}

function showRegisterDialog(pageId) {
    logEvent("RDO", pageId, "YESS!!!");
    $('#customMessage').hide();
    forgetShowingCustomMessage = true;
    $('#modalContainer').show();
    $('#registerUserDialog').show();
    if (typeof pause === 'function')
        pause();
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
            registeredUserModel.IpAddress = window.localStorage["IpAddress"];
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

                        logEvent("REG", loginFromPageId, "User: " + registeredUserModel.UserName);

                        //registerEmail = $('#txtEmail').val();
                        //alert("registerEmail: " + registerEmail);
                        showCustomMessage(96, false);
                        //setTimeout(function () { $('#userEmail').text($('#txtEmail').val()); }, 2000);
                        //displayStatusMessage("ok", "thanks for Registering in " + getCookieValue("UserName"));
                        // show welcom to Oggle Booble message.
                    }
                    else {
                        logError("AJX", loginFromPageId, success, "attemptRegister");
                        $('#registerValidationSummary').html(response).show();
                    }
                },
                error: function (jqXHR) {
                    if (!checkFor404("attemptRegister")) {
                        logError("XHR", loginFromPageId, getXHRErrorDetails(jqXHR), "attemptRegister");
                    }
                }
            });
        } catch (e) {
            logError("CAT", loginFromPageId, e, "attemptRegister");
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


var registerEmail;
var requestedPrivileges = [];
function authenticateEmail(usersEmail) {
    var privileges = "";
    $.each(requestedPrivileges, function (idx, obj) {
        privileges += obj + ", ";
    });
    logEvent("", loginFromPageId, "authenticateEmail");
    sendEmailToYourself("Acess Requested", " user: " + getCookieValue("UserName") + " has requsted " + privileges);
    alert("Thank you for registering " + getCookieValue("UserName") + "\n please reply to the two factor authentitifcation email sent to you" +
        "\nYou will then be granted the access you requested." + "\nThe menu item 'Dashboard' will appear next to your 'Hello' message");
    dragableDialogClose();
}

//DAC	IME	Image Error
//DAC	LKM	Link Moved
//DAC	ARK	Archive Image
function awardCredits(activityCode, pageId) {
    let credits;
    switch (activityCode) {
        case "PBV": credits = -20; break; // Playboy Page View
        case "PGV": credits = -10; break; // Page View
        case "INC": credits = 500; break; // Initial Credit
        case "LKC": credits = 200; break; // Link Copied
        case "IMC": credits = 200; break; // Image Comment
        case "NIA": credits = 200; break; // New Image Added
        case "FIE": credits = 100; break; // Folder Info Edited
        default: alert("unhandled awardCredits activityCode: " + activityCode);
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/User/AwardCredits",
        data: {
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: activityCode,
            PageId: pageId,
            Credits: credits
        },
        success: function (success) {
            if (success === "ok") {
                //displayStatusMessage("ok", "credits charged");
            }
            else {
                logError("XHR", pageId, success, "awardCredits");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("awardCredits")) {
                logError("XHR", pageId, getXHRErrorDetails(jqXHR), "awardCredits");
            }
        }
    });
}
