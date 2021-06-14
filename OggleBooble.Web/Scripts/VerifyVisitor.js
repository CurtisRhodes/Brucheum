
function verifyVisitor(folderId) {
    try {
        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {

            if (window.domain == "localhost") {
                setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
                alert("VisitorId set to: " + getCookieValue("VisitorId"));
            }

            let visitorId = getCookieValue("VisitorId");

            logActivity("VV0", folderId, "verify Visitor"); // new session started
            $('#headerMessage').html("new session started");
            sessionStorage["VisitorVerified"] = true;

            visitorId = getCookieValue("VisitorId");

            if ((visitorId == "cookie not found") || (visitorId == "user does not accept cookies")) {
                logActivity("VV2", folderId, "verify Visitor"); // verify visitorId not found (new user?)
                //tryAddNewIP(folderId, "verify Visitor");
            }
            else
            {
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
                    success: function (successModel) {
                        if (successModel.Success == "ok") {
                            if (successModel.Success == "ok") {
                                logActivity("VV1", folderId, "verify Visitor"); // visitor verified ok
                                loadUserProfile(folderId, "verify Visitor");
                                logVisit(folderId, "verify visitor");
                            }

                            if (successModel.Success == "not found in Visitor table") {
                                checkForRepeatBadVisitorId(folderId, visitorId);
                            }
                        }
                        else {
                            logActivity("VV4", folderId, "verify Visitor"); // verify visitor AJX error
                            logError("AJX", folderId, successModel.Success, "verify Visitor");
                        }
                    },
                    error: function (jqXHR) {
                        logActivity("VV6", folderId, "verify Visitor"); // verify visitor XHR error
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errMsg, folderId, "verify Visitor")) {
                            logError("XHR", folderId, errMsg, "verify Visitor");
                        }
                    }
                });
            }
        }
    //    else {
    //        logActivity("VV3", folderId, "verify Visitor"); // active session new page
    //    }
    }
    catch (e) {
        logActivity("VV5", folderId, "verify Visitor"); // verify visitor CATCH error
        sessionStorage["VisitorVerified"] = true;
        logError("CAT", folderId, e, "verify Visitor");
    }
}

function checkForRepeatBadVisitorId(folderId, visitorId) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/CheckForRepeatBadVisitorId?visitorId=" + visitorId,
            success: function (SuccessModel) {
                if (SuccessModel.Success == "ok") {
                    if (SuccessModel.ReturnValue == "ok") {
                        logActivity("VV7", folderId, "verify Visitor"); // verify visitor VisitorId came back not found
                        tryAddNewIP(folderId, "not found in Visitor table");
                    }
                    if (SuccessModel.ReturnValue == "repeatOffender") {
                        if (!navigator.cookieEnabled) {  // user does not accept cookies
                            logError("UNC", folderId, "xx", "Check for RepeatBadVisitorId");
                        }
                        logError("RBV", folderId, "visitorId: " + visitorId, "check for RepeatBadVisitorId");
                    }
                }
                else {
                    logError("AJX", folderId, SuccessModel.Success, "check For RepeatBadVisitorId");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 215519, "RepeatBadVisitorId")) {
                    logError("XHR", folderId, errMsg, "RepeatBadVisitorId");
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "repeatBadVisitorId");
    }
}

function addVisitor(visitorData) {
    try
    {
        logActivity("AV0", visitorData.FolderId, "addVisitor"); // entering Add Visitor 
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (avSuccessModel) {
                if (avSuccessModel.Success == "ok") {

                    if (avSuccessModel.NewVisitorId.IndexOf("undefined">-1)) {
                        logActivity("AV9", visitorData.InitialPage, "add visitor"); // VisitorId undefined
                    }
                    if (avSuccessModel.RetunValue == "new visitor added") {
                        logActivity("AV1", visitorData.InitialPage, "add visitor"); // new visitor added
                        loadUserProfile("add new visitor");
                    }
                    if (avSuccessModel.RetunValue == "existing Ip") {
                        logActivity("AV2", visitorData.InitialPage, "add Visitor");  // existing IP visitorId used
                        loadUserProfile("recall existing Ip");
                    }
                    setCookieValue("VisitorId", avSuccessModel.NewVisitorId);
                    if (getCookieValue("VisitorId") == avSuccessModel.NewVisitorId) {
                        logActivity("AV4", visitorData.InitialPage, "add Visitor"); // Calling LogVisit
                        logVisit(visitorData.FolderId, "add Visitor");
                    }
                    else {
                        let avTimerLoop = setInterval(function () {
                            if (getCookieValue("VisitorId") == avSuccessModel.NewVisitorId) {
                                clearInterval(avTimerLoop);
                                logActivity("AV4", visitorData.InitialPage, "add Visitor"); // Calling LogVisit
                                logVisit(visitorData.FolderId, "add Visitor");
                            }
                            else {
                                logActivity("AV5", visitorData.InitialPage, "loop:" + avTimerLoopCount++); // Calling LogVisit
                                setCookieValue("VisitorId", avSuccessModel.VisitorId);
                                if (avTimerLoopCount > 10) {
                                    clearInterval(avTimerLoop);
                                    logError("BVI", visitorData.InitialPage,
                                        "avSuccess.VisitorId: " + avSuccessModel.VisitorId + " cookie: " + getCookieValue("VisitorId"), "add Visitor");
                                }
                            }
                        }, 800);
                    }
                }
                else
                {
                    logActivity2(create_UUID(), "AV3", 555, "add Visitor"); // AddVisitor Success not ok
                    logError2(create_UUID(), "AJ7", 555, avSuccessModel.Success, "addVisitor");
                }
            },
            error: function (jqXHR) {
                logActivity2(create_UUID(),"AV8", 555, "add Visitor"); // AddVisitor XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 555, "add Visitor"))
                    logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
            }
        });
    } catch (e) {
        //alert("AddVisitor CATCH: " + e);
        logActivity2(create_UUID(), "AV6", 555, "addVisitor"); // add vis catch error
        logError2(create_UUID(), "CAT", 555, e, "addVisitor");
    }
}

function loadUserProfile(calledFrom) {
    try {
        if (calledFrom == "add new visitor") {
            localStorage["IsLoggedIn"] = "false";
            localStorage["UserName"] = "not registered";
            localStorage["UserRole"] = "not registered";
            $('#optionNotLoggedIn').show();
            $('#optionLoggedIn').hide();
            $('#footerCol5').hide();
        }
        else {
            let visitorId = getCookieValue("VisitorId");
            if (visitorId == "cookie not found") {
                localStorage["IsLoggedIn"] = "false";
                localStorage["UserName"] = "not registered";
                localStorage["UserRole"] = "not registered";
                $('#optionLoggedIn').hide();
                $('#optionNotLoggedIn').show();
                $('#footerCol5').hide();
            }
            else {
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/Visitor/GetVisitorInfo?visitorId=" + visitorId,
                    success: function (visitorInfo) {
                        if (visitorInfo.Success == "ok") {

                            if (visitorInfo.City == "BadIp") {
                                tryAddNewIP(610700, "BadIp");
                            }

                            if (visitorInfo.IsRegisteredUser) {

                                localStorage["IsLoggedIn"] = "true";
                                if (visitorInfo.RegisteredUser.IsLoggedIn == 0)
                                    localStorage["IsLoggedIn"] = "false";

                                localStorage["UserName"] = visitorInfo.RegisteredUser.UserName;
                                localStorage["UserRole"] = visitorInfo.RegisteredUser.UserRole;

                                if (localStorage["IsLoggedIn"] == "true") {
                                    $('#spnUserName').html(localStorage["UserName"]);
                                    $('#optionNotLoggedIn').hide();
                                    $('#optionLoggedIn').show();
                                    $('#footerCol5').show();
                                }

                                if (calledFrom == "show UserProfileDialog") {
                                    $('#txtUserProfileName').val(visitorInfo.RegisteredUser.UserName);
                                    $('#txtUserProfileFirstName').val(visitorInfo.RegisteredUser.FirstName);
                                    $('#txtUserProfileLastName').val(visitorInfo.RegisteredUser.LastName);
                                    $('#txtUserProfileEmail').val(visitorInfo.RegisteredUser.Email);
                                }
                            }
                            else {
                                localStorage["IsLoggedIn"] = "false";
                                localStorage["UserName"] = "not registered";
                                localStorage["UserRole"] = "not registered";
                                $('#spnUserName').html(localStorage["UserName"]);
                                $('#optionNotLoggedIn').show();
                                $('#optionLoggedIn').hide();
                                $('#footerCol5').hide();
                            }

                            console.log("load UserProfile  IsLoggedIn: " + localStorage["IsLoggedIn"] +
                                " UserName: " + localStorage["UserName"] +
                                " UserRole: " + localStorage["UserRole"]);
                        }
                        else {
                            if (visitorInfo.Success == "not found") {
                                //logError("EVT", 470, "Ip:", "load UserProfile");  // VisitorId not found                    
                            }
                            else {
                                logError("AJX", 0, visitorInfo.Success, "load UserProfile");
                                if (document.domain == "localhost") alert("load UserProfile: " + visitorInfo.Success);
                            }
                        }
                    },
                    error: function (jqXHR) {
                        let errMsg = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errMsg, folderId, "load UserProfile"))
                            logError2(create_UUID(), "XHR", 612270, errMsg, "load UserProfile");
                    }
                });
            }
        }
    } catch (e) {
        logError2(create_UUID(), "CAT", 12440, e, "load UserProfile/" + calledFrom);
    }
}

function moveStatsToNewVisitorId(badVisitorId, newVisitorId) {
    //$.ajax({

    //});
    logActivity("IPD", visitorData.FolderId, "add visitor"); // ToDo: move Stats To New VisitorId

}
