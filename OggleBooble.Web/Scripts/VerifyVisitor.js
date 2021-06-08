
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
                    success: function (success) {
                        if (success == "ok") {
                            logActivity("VV1", folderId, "verify Visitor"); // visitor verified ok
                            loadUserProfile("verify Visitor");
                            logVisit(folderId, "verify visitor");
                        }
                        else {  // visitorId not found
                            checkForRepeatBadVisitorId(folderId, visitorId);
                        }
                    },
                    error: function (jqXHR) {
                        logActivity("VV6", folderId, "verify Visitor"); // visitor verified ok
                        let errMsg = getXHRErrorDetails(jqXHR);
                        //if (!checkFor404(errMsg, 215519, "getIpInfo/" + calledFrom)) {
                        logError("XHR", folderId, errMsg, "verify Visitor");
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
            url: settingsArray.ApiServer + "api/Visitor/CheckForRepeatBadVisitorId?visitorId=" + getCookieValue("VisitorId"),
            success: function (SuccessModel) {
                if (SuccessModel.Success == "ok") {
                    if (SuccessModel.ReturnValue == "ok") {
                        logActivity("VV7", folderId, "verify Visitor"); // verify visitor VisitorId came back not found
                        tryAddNewIP(folderId, "verify Visitor");
                    }
                    else {
                        if (!navigator.cookieEnabled) {  // user does not accept cookies
                            logError("UNC", folderId, "xx", "CheckForRepeatBadVisitorId");
                        }
                        logError("RBV", folderId, "visitorId: " + visitorId, "checkForRepeatBadVisitorId");
                    }
                }
                else {
                    logError("AJX", folderId, SuccessModel.Success, "checkForRepeatBadVisitorId");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 215519, "checkForRepeatBadVisitorId")) {
                    logError("XHR", folderId, errMsg, "checkForRepeatBadVisitorId");
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "checkForRepeatBadVisitorId");
    }
}

function addVisitor(visitorData) {
    try
    {
        if (visitorData.CalledFrom == "verify Visitor")
            logActivity("IPB", folderId, "get IpInfo/" + calledFrom);

        //visitorData.VisitorId = create_UUID();
        logActivity("AV0", visitorData.FolderId, "addVisitor"); // entering Add Visitor 
        console.log("attempting to addVisitor");
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (avSuccess) {
                console.log("avSuccess.Success: " + avSuccess.Success);
                if (avSuccess.Success == "ok") {
                    setCookieValue("VisitorId", avSuccess.VisitorId);
                    logActivity("AV3", visitorData.InitialPage, "add visitor"); // new visitor added
                    console.log("new visitor added");
                    loadUserProfile("add new visitor");
                    //logIpHit(avSuccess.VisitorId, visitorData.IpAddress, visitorData.InitialPage);
                    //logVisit(visitorData.InitialPage, "add Visitor");
                    if (visitorData.CalledFrom == "verify Visitor") {
                        // repair all references (would need to know bad visitorId)
                        logActivity("IPC", folderId, "trytoGetIp/" + calledFrom); // repair bad visitorId succeeded
                    }
                }
                if (avSuccess.Success == "existing Ip") {
                    if (visitorData.CalledFrom == "verify Visitor") {
                        logActivity("IPC", folderId, "trytoGetIp/" + calledFrom); // repair bad visitorId succeeded
                    }

                    if (avSuccess.VisitorId == "not found") {
                        logActivity("AV6", visitorData.InitialPage, "add Visitor");  // tried to ass Not Found to WIP
                    }
                    else {
                        setCookieValue("VisitorId", avSuccess.VisitorId);
                        logActivity("AV5", visitorData.InitialPage, "add Visitor");  // existing IP visitorId used
                        loadUserProfile("recall existing Ip");
                        //logIpHit(avSuccess.VisitorId, visitorData.IpAddress, visitorData.InitialPage);
                        //logVisit(visitorData.InitialPage, "add Visitor");
                    }
                }
                if (avSuccess.Success.indexOf("Duplicate entry") > 0) {
                    logActivity("AV9", visitorData.InitialPage, "addVisitor"); // Duplicate. Attempt to add new visitorId
                    logError("DVA", visitorData.InitialPage, avSuccess.Success, "addVisitor");
                }
                if (avSuccess.Success.indexOf("ERROR:") > -1) {
                    logActivity("AV4", visitorData.InitialPage, "addVisitor/" + visitorData.CalledFrom);
                    logError("AJ7", visitorData.InitialPage, avSuccess.Success, "addVisitor/" + visitorData.CalledFrom);
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
        logActivity("AV2", 555, "addVisitor"); // add vis catch error
        logError2("CAT", 555, e, "addVisitor");
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
