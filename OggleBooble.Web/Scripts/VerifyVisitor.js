
function verifySession(folderId) {
    try {
        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {

            //if (document.domain == "localhost") {
            //    setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
            //    alert("VisitorId set to: " + getCookieValue("VisitorId"));
            //}

            logActivity("VV0", folderId, "verify session"); // new session started
            $('#headerMessage').html("new session started");
            sessionStorage["VisitorVerified"] = true;

            let visitorId = getCookieValue("VisitorId");

            if ((visitorId.indexOf("undefined") > -1) || (visitorId.indexOf("cookie not found") > -1)) {
                visitorId = create_UUID();
                logActivity2(visitorId, "VV2", folderId, "verify session"); // verify visitorId not found (new user?)
                tryAddNewIP(folderId, visitorId, "verify session");
            }
            else {
                verifyVisitorId(folderId, "verify session");
            }
        }
        //    else {
        //        logActivity("VV3", folderId, "verify Visitor"); // active session new page
        //    }
    }
    catch (e) {
        sessionStorage["VisitorVerified"] = true;
        logActivity("VV5", folderId, e); // verify visitor CATCH error
        logError2(visitorId, "CAT", folderId, e, "verify session");
    }
}

function verifyVisitorId(folderId, calledFrom) {
    try {

        let visitorId = getCookieValue("VisitorId");

        if (visitorId.indexOf("undefined") > -1) {
            if (visitorId.substr(0, 2) == "UDF") {
                logError2(visitorId, "RBV", folderId, "troubled account", calledFrom);
                addVisitor({
                    VisitorId: visitorId,
                    IpAddress: "11.11",
                    City: "unknown",
                    Country: "ZZ",
                    Region: "troubled account",
                    GeoCode: "unknown",
                    InitialPage: folderId
                });
            }
            else {
                visitorId = "UDF" + create_UUID().substr(3);
                tryAddNewIP(folderId, visitorId, "troubled account");
            }
        }

        if (visitorId.indexOf("cookie not found") > -1) {
            visitorId = "CNF" + create_UUID().substr(3);
            localStorage["VisitorId"] = visitorId;
            logError("BUG", folderId, "cookie not found made it too far", "verify visitor");
            //tryAddNewIP(folderId, visitorId, "troubled account");
        }

        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
                success: function (successModel) {
                    if (successModel.Success == "ok") {
                        if (successModel.ReturnValue == "visitorId ok") {
                            logActivity("VV1", folderId, "verify Visitor"); // visitor verified ok
                            loadUserProfile(folderId, "verify Visitor");
                            logVisit(folderId, "verify visitor");
                        }
                        if (successModel.ReturnValue == "not found") {
                            logActivity("AV3", folderId, "verify Visitor"); // visitorId not found
                            if (visitorId.substr(0, 2) == "BV") {
                                logError2(visitorId, "RBV", folderId, "successModel.ReturnValue == not found", "verify Visitor");
                                addVisitor({
                                    VisitorId: visitorId,
                                    IpAddress: "11.11",
                                    City: "unknown",
                                    Country: "ZZ",
                                    Region: "repeat bad visitor",
                                    GeoCode: "unknown",
                                    InitialPage: folderId
                                });
                            }
                            else {
                                visitorId = "BV" + create_UUID().substr(2);
                                tryAddNewIP(folderId, visitorId, "not found");
                            }
                        }
                        if (successModel.Success == "unknown country") {
                            logActivity("AV7", folderId, "verify Visitor"); // visitorId not found
                            if (visitorId.substr(0, 2) == "ZZ") {
                                logError2(visitorId, "RBV", folderId, "successModel.ReturnValue == unknown country", "verify Visitor");
                                addVisitor({
                                    VisitorId: visitorId,
                                    IpAddress: "11.11",
                                    City: "unknown",
                                    Country: "XX",
                                    Region: "repeat bad visitor",
                                    GeoCode: "unknown",
                                    InitialPage: folderId
                                });
                            }
                            else {
                                visitorId = "ZZ" + create_UUID().substr(2);
                                tryAddNewIP(folderId, visitorId, "unknown country");
                            }
                        }
                    }
                    else {
                        logActivity("VV4", folderId, "verify Visitor"); // verify visitor AJX error
                        logError("AJX", folderId, successModel.Success, "verify Visitor");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    logActivity("VV6", folderId, errMsg); // verify visitor XHR error
                    if (!checkFor404(errMsg, folderId, "verify Visitor")) {
                        logError("XHR", folderId, errMsg, "verify Visitor");
                    }
                }
            });
        }
    }
    catch (e) {
        sessionStorage["VisitorVerified"] = true;
        logActivity("VV5", folderId, e); // verify visitor CATCH error
        logError2(visitorId, "CAT", folderId, e, "verify visitor");
    }
}

function addVisitor(visitorData) {
    try {
        logActivity("AV0", visitorData.FolderId, "addVisitor"); // entering Add Visitor 
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (success) {
                if (success == "ok") {
                    logActivity("AV1", visitorData.InitialPage, "add visitor"); // new visitor added
                    setCookieValue("VisitorId", visitorData.VisitorId);
                    logVisit(visitorData.InitialPage, visitorData.CalledFrom);
                }
                else {
                    logActivity2(visitorData.VisitorId, "AV3", visitorData.InitialPage, success); // AddVisitor Success not ok
                    logError2(visitorData.VisitorId, "AJ7", visitorData.InitialPage, success, "addVisitor");
                }
            },
            error: function (jqXHR) {
                logActivity2(visitorData.VisitorId, "AV8", 555, "add Visitor"); // AddVisitor XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 555, "add Visitor"))
                    logError2(visitorData.VisitorId, "XHR", 55, errMsg, "add Visitor");
            }
        });
    } catch (e) {
        //alert("AddVisitor CATCH: " + e);
        logActivity2(visitorData.VisitorId, "AV6", 555, "addVisitor"); // add vis catch error
        logError2(visitorData.VisitorId, "CAT", 555, e, "addVisitor");
    }
}

function addVisitor2(visitorData) {
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
        let visitorId = getCookieValue("VisitorId");
        if ((visitorId.indexOf("cookie not found") > -1) || (visitorId.indexOf("user does not accept cookies") > -1)) {
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
                    if (visitorInfo.Success == "not found") {
                        localStorage["IsLoggedIn"] = "false";
                        localStorage["UserName"] = "not registered";
                        localStorage["UserRole"] = "not registered";
                        $('#optionLoggedIn').hide();
                        $('#optionNotLoggedIn').show();
                        $('#footerCol5').hide();
                    }
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
                    }
                    else {
                        logError("AJX", 614859, visitorInfo.Success, "load UserProfile");
                        if (document.domain == "localhost") alert("load UserProfile: " + visitorInfo.Success);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, folderId, "load UserProfile"))
                        logError2(visitorId, "XHR", 612270, errMsg, "load UserProfile");
                }
            });
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
