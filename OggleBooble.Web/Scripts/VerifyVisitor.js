
function verifySession(folderId) {
    try {
        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {

            //if (document.domain == "localhost") {
            //    setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
            //    alert("VisitorId set to: " + getCookieValue("VisitorId"));
            //}

            logActivity("VS0", folderId, "verify session"); // new session started
            $('#headerMessage').html("new session started");
            sessionStorage["VisitorVerified"] = true;
            let returnVisit = true;

            if (!navigator.cookieEnabled) {  // user accepts cookies
                logActivity2(visitorId, "VS5", folderId, "verify session"); // user does not accept cookies


                let visitorId = sessionStorage["VisitorId"];
                if (isNullorUndefined(visitorId)) {
                    returnVisit = false;
                    //showCookiesRequiredMessage();
                    visitorId = create_UUID();
                    sessionStorage["VisitorId"] = visitorId;
                    addVisitor({
                        VisitorId: visitorId,
                        IpAddress: '00.00.00',
                        City: "cookies not enabled",
                        Country: "ZZ",
                        Region: "cookies not enabled",
                        GeoCode: "cookies not enabled"
                    });
                }
                //logError2(cookieItemValue, "CK3", 615112, "cookieItemValue == undefined", "get CookieValue");
            }

            let visitorId = getCookieValue("VisitorId");
            if (isNullorUndefined(visitorId)) {
                returnVisit = false;
                visitorId = create_UUID();
                sessionStorage["VisitorId"] = visitorId;
                logActivity2(visitorId, "VS7", folderId, "verify session"); // visitorId null or undefined
                addVisitor({
                    VisitorId: visitorId,
                    IpAddress: '00.00.00',
                    City: "undefined",
                    Country: "ZZ",
                    Region: "undefined",
                    GeoCode: "undefined"
                });
            }

            if (visitorId.indexOf("cookie not found") > -1) {
                returnVisit = false;
                visitorId = create_UUID();
                sessionStorage["VisitorId"] = visitorId;
                logActivity2(visitorId, "VS2", folderId, "verify session"); // verify visitorId not found (new user?)
                addVisitor({
                    VisitorId: visitorId,
                    IpAddress: '00.00.00',
                    City: "unknown",
                    Country: "ZZ",
                    Region: "unknown",
                    GeoCode: "unknown"
                });
            }

            if (returnVisit) {
                logActivity2(visitorId, "VS1", folderId, "verify session"); // visitor verified ok
                verifyVisitorId(folderId, "verify session");
                logVisit(visitorId, folderId, "verify session");
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

        logActivity("VV0", folderId, "verify Visitor"); // attempting to verify visitor

        let visitorId = getCookieValue("VisitorId");

        if (visitorId.indexOf("cookie not found") > -1) {
            logActivity2(create_UUID(), "VV8", "verify visitor/" + calledFrom);
            //logError2(create_UUID(), "BUG", folderId, "cookie not found made it too far", "verify visitorId");
            //tryAddNewIP(folderId, visitorId, "troubled account");
            return;
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
                success: function (successModel) {
                    if (successModel.Success == "ok") {
                        if (successModel.ReturnValue == "visitorId ok") {
                            logActivity2(visitorId, "VV1", folderId, "verify VisitorId"); // visitor verified ok
                            loadUserProfile(folderId, "verify VisitorId");
                            logVisit2(visitorId, folderId, "verify visitorId");
                        }
                        if (successModel.ReturnValue == "not found") {
                            logActivity2(visitorId, "VV3", folderId, "verify Visitor"); // visitorId came back not found
                            //logError2(visitorId, "BUG", folderId, "visitorId came back not found", "verify visitorId");
                            addVisitor({
                                VisitorId: visitorId,
                                IpAddress: '00.11.11',
                                City: "not found",
                                Country: "ZZ",
                                Region: "unknown",
                                GeoCode: "unknown"
                            });
                        }
                        if (successModel.ReturnValue == "unknown country") {
                            logActivity2(visitorId, "VV7", folderId, "verify Visitor"); // unknown country
                        }
                    }
                    else {
                        logActivity2(visitorId, "VV4", folderId, "verify Visitor"); // verify visitor AJX error
                        logError2(visitorId, "AJX", folderId, successModel.Success, "verify VisitorId");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    logActivity2(visitorId, "VV6", folderId, errMsg); // verify visitor XHR error
                    if (!checkFor404(errMsg, folderId, "verify VisitorId")) {
                        logError2(visitorId, "XHR", folderId, errMsg, "verify VisitorId");
                    }
                }
            });
        }
    }
    catch (e) {
        sessionStorage["VisitorVerified"] = true;
        logActivity2(create_UUID(), "VV5", folderId, e); // verify visitor CATCH error
        logError2(create_UUID(), "CAT", folderId, e, "verify visitorId");
    }
}

function addVisitor(visitorData) {
    try {

        if(isNullorUndefined( visitorData.VisitorId)) {
            logActivity2(visitorData.VisitorId, "AV9", 555, "add Visitor"); // VisitorId undefined
            logError(create_UUID(), "BUG", visitorData.FolderId, "visitorId came in null", "add visitor");
            return;
        }

        logActivity("AV0", visitorData.FolderId, "add Visitor"); // entering Add Visitor 
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (success) {
                if (success == "ok") {
                    logActivity("AV1", visitorData.InitialPage, "add visitor"); // new visitor added
                    setCookieValue("VisitorId", visitorData.VisitorId);
                    logVisit(visitorData.VisitorId, visitorData.InitialPage,"add Visitor");
                }
                else {
                    if (success.indexOf("Duplicate entry") > 0) {
                        logActivity2(visitorData.VisitorId, "AV3", visitorData.InitialPage, success); // duplicate key violation

                    } else {
                        logActivity2(visitorData.VisitorId, "AV7", visitorData.InitialPage, success); // ajax error from Add Visitor
                        logError2(visitorData.VisitorId, "AJ7", visitorData.InitialPage, success, "add Visitor");
                    }
                }
            },
            error: function (jqXHR) {
                logActivity2(create_UUID(), "AV8", 555, "add Visitor"); // AddVisitor XHR error
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 555, "add Visitor"))
                    logError2(create_UUID(), "XHR", 55, errMsg, "add Visitor");
            }
        });
    } catch (e) {
        logActivity2(create_UUID(), "AV6", 555, "addVisitor"); // add vis catch error
        logError2(create_UUID(), "CAT", 555, e, "addVisitor");
    }
}

function loadUserProfile(calledFrom) {
    try {
        let visitorId = getCookieValue("VisitorId");
        if (visitorId.indexOf("cookie not found") > -1) {
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
                        logError2(visitorId, "BUG", "VisitorId not found in Visitor table", "loadUserProfile/" + calledFrom);
                    }
                    else {
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
