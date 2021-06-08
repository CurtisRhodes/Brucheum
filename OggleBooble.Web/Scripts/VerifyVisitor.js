
function verifyVisitor(folderId) {
    try {

        let visitorId = getCookieValue("VisitorId");

        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {
            logActivity("VV0", folderId, "verify Visitor"); // new session started
            $('#headerMessage').html("new session started");
            sessionStorage["VisitorVerified"] = true;

            if (visitorId == "not found") {
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
                                loadUserProfile("verify Visitor");
                                logVisit(folderId, "verify visitor");
                            }

                            if (successModel.Success == "not found in Visitor table") {
                                checkForRepeatBadVisitorId(folderId, visitorId);
                            }

                            if (successModel.Success == "not found") {
                                logError("BUG", folderId, "not found visitorId sent to Verify Visitor", "verify Visitor");
                                tryAddNewIP(folderId, "not found in Visitor table");
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
        if (visitorData.CalledFrom == "not found in Visitor table")
            logActivity("IPB", visitorData.InitialPage, "get IpInfo/" + calledFrom);

        //visitorData.VisitorId = create_UUID();
        logActivity("AV0", visitorData.FolderId, "addVisitor"); // entering Add Visitor 
        console.log("attempting to addVisitor");
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (avSuccessModel) {
                console.log("avSuccess.Success: " + avSuccessModel.Success);
                if (avSuccessModel.Success == "ok") {
                    setCookieValue("VisitorId", avSuccessModel.VisitorId);

                    if (avSuccessModel.RetunValue = "new visitor added") {

                        logActivity("AV2", visitorData.InitialPage, "add visitor"); // new visitor added
                        console.log("new visitor added");
                        loadUserProfile("add new visitor");

                    }
                    if (avSuccessModel.RetunValue = "existing Ip") {
                        logActivity("AV2", visitorData.InitialPage, "add Visitor");  // existing IP visitorId used
                        loadUserProfile("recall existing Ip");
                    }
                    if (visitorData.CalledFrom == "not found in Visitor table") {
                        // repair all references (would need to know bad visitorId)
                        logActivity("IPC", folderId, "trytoGetIp/" + calledFrom); // repair bad visitorId succeeded
                    }

                }
                else {
                    logActivity("AV3", visitorData.InitialPage, "addVisitor/" + visitorData.CalledFrom);

                    if (avSuccessModel.Success.indexOf("Duplicate entry") > 0) {
                        logActivity("AV9", visitorData.InitialPage, "addVisitor"); // Duplicate. Attempt to add new visitorId
                        logError("DVA", visitorData.InitialPage, avSuccessModel.Success, "addVisitor");
                    }
                    else {
                        logError("AJ7", visitorData.InitialPage, avSuccessModel.Success, "addVisitor/" + visitorData.CalledFrom);
                    }
                }
            },
            error: function (jqXHR) {
                logActivity("AV8", 555, "addVisitor"); // XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 215519, "addVisitor"))
                    logError("XHR", 999, errMsg, "addVisitor");
            }
        });
    } catch (e) {
        //alert("AddVisitor CATCH: " + e);
        logActivity("AV6", visitorData.InitialPage, "addVisitor"); // add vis catch error
        logError("CAT", visitorData.InitialPage, e, "addVisitor");
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
            if (visitorId == "not found") {
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
                        if (!checkFor404(errMsg, folderId, "load UserProfile")) logError("XHR", 0, errMsg, "load UserProfile");
                    }
                });
            }
        }
    } catch (e) {
        logError("CAT", 12440, e, "load UserProfile/" + calledFrom);
    }
}
