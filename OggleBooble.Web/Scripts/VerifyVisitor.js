function verifySession(folderId, calledFrom) {
    try {
        let visitorId = "uninitialized";
        visitorId = getCookieValue("VisitorId", "verify session");

        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {
            sessionStorage["VisitorVerified"] = true;
            $('#headerMessage').html("new session started");
            if (visitorId.indexOf("cookie not found") > -1) {
                returnVisit = false;
               let newVisitorId = create_UUID();
                sessionStorage["VisitorId"] = newVisitorId;
                logActivity2(newVisitorId, "VS2", folderId, "verify session"); // verify visitorId not found (new user?)
                addVisitor({
                    VisitorId: newVisitorId,
                    IpAddress: Math.floor(Math.random() * 10000000000).toString(),
                    City: "new visitor?",
                    Country: "ZZ",
                    Region: "VS2",
                    GeoCode: "unknown",
                    InitialPage: folderId
                }, calledFrom);
            }
            else {

                logActivity2(visitorId, "VS1", folderId, "verify session"); // visitor verified ok
                verifyVisitorId(visitorId);

                logVisit(visitorId, folderId, "verify session");

                if (calledFrom != "Index.html") {
                    if (calledFrom != "album.html")
                        logStaticPageHit(folderId, visitorId, calledFrom);
                    loadAlbum(folderId, visitorId);
                }
            }
            //if (!navigator.cookieEnabled)  // user accepts cookies
            //{
            //    let SSvisitorId = sessionStorage["VisitorId"];
            //    if (isNullorUndefined(SSvisitorId))
            //        logActivity2(visitorId, "VS5", folderId, "verify session"); // user does not accept cookies
            //    else {
            //        logActivity2(visitorId, "VS3", folderId, "verify session"); // session storage nav bypass
            //        returnVisit = false;
            //    }
            //}
            logActivity2(visitorId, "VS0", folderId, "verify session"); // new session started
        }
        else {
            if (calledFrom != "Index.html") {
                if (calledFrom != "album.html")
                    logStaticPageHit(folderId, visitorId, calledFrom);
                loadAlbum(folderId, visitorId);
                // logActivity("VV3", folderId, "verify Visitor"); // active session new page
            }
        }
    }
    catch (e) {
        sessionStorage["VisitorVerified"] = true;
        logActivity2(create_UUID(), "VS8", folderId, e); // verify session CATCH error
        logError2(create_UUID(), "CAT", folderId, e, "verify session");
    }
}

function verifyVisitorId(visitorId) {
    try {
        if (visitorId.indexOf("cookie not found") > -1) {
            logActivity2(create_UUID(), "VV8", "verify visitor"); // cookie not found made it too far
            return;
        }
        //logActivity2(visitorId, "VV0", folderId, "verify Visitor"); // attempting to verify visitor
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
            success: function (successModel) {
                if (successModel.Success == "ok") {
                    switch (successModel.ReturnValue) {
                        case "visitorId ok":
                            //logActivity2(visitorId, "VV1", 1020222, "verify VisitorId"); // visitor verified ok
                            loadUserProfile(folderId, visitorId);
                            break;
                        case "retired visitor":
                            setCookieValue("VisitorId", successModel.ComprableIpAddressVisitorId);
                            logActivity2(visitorId, "VV2", 1020222, "verify Visitor"); // retired visitorId updated
                            break;
                        case "retired visitor comparable not found":
                            logActivity2(visitorId, "VV7", 1020222, "verify Visitor"); // visitorId came back not found
                            logError("BUG", folderId, "retired visitor not found", "verify VisitorId");
                            break;
                        case "not found":
                            logActivity2(visitorId, "VV3", 1020222, "verify Visitor"); // visitorId came back not found
                            break;
                        default:
                    }
                }
                else {
                    logActivity2(visitorId, "VV4", folderId, "verify Visitor"); // verify visitor AJX error
                    logError2(visitorId, "AJX", folderId, successModel.Success, "verify VisitorId");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(visitorId, "VV6", 1020222, errMsg); // verify visitor XHR error
                if (!checkFor404(errMsg, 1020222, "verify VisitorId")) {
                    logError2(visitorId, "XHR", 1020222, errMsg, "verify VisitorId");
                }
            }
        });
    }
    catch (e) {
        sessionStorage["VisitorVerified"] = true;
        logActivity2(create_UUID(), "VV5", 1020222, e); // verify visitor CATCH error
        logError2(create_UUID(), "CAT", 1020222, e, "verify visitorId");
    }
}

function addVisitor(visitorData, calledFrom) {
    try {
        if (isNullorUndefined(visitorData.VisitorId)) {
            logError2(create_UUID(), "BUG", visitorData.FolderId, "visitorId came in null", "add visitor/" + calledFrom);
            return;
        }
        logActivity2(visitorData.VisitorId, "AV0", visitorData.FolderId, "add visitor/" + calledFrom); // entering Add Visitor 
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (success) {
                if (success == "ok") {
                    logActivity2(visitorData.VisitorId, "AV1", visitorData.InitialPage, "add visitor"); // new visitor added
                    setCookieValue("VisitorId", visitorData.VisitorId);
                    logVisit(visitorData.VisitorId, visitorData.InitialPage, "add Visitor");
                    if (calledFrom != "Index.html") {
                        if (isNullorUndefined(visitorData.InitialPage))
                            logError2(visitorData.VisitorId, "IHF", visitorData.InitialPage, "isNullorUndefined(visitorData.InitialPage)", "add visitor/ok/" + calledFrom);
                        else {
                            if (calledFrom != "album.html")
                                logStaticPageHit(visitorData.InitialPage, visitorData.VisitorId, calledFrom);
                            loadAlbum(visitorData.InitialPage, visitorData.VisitorId);
                        }
                    }
                }
                else {
                    if (success.indexOf("Duplicate entry") > 0) {
                        logActivity2(visitorData.VisitorId, "AV3", visitorData.InitialPage, "add visitor/" + calledFrom); // duplicate key violation
                        if (calledFrom != "album.html") {
                            if (isNullorUndefined(visitorData.InitialPage))
                                logError2(visitorData.VisitorId, "IHF", visitorData.InitialPage, "isNullorUndefined(visitorData.InitialPage)", "add visitor/dupe/" + calledFrom);
                            else {
                                if (calledFrom != "album.html")
                                    logStaticPageHit(visitorData.InitialPage, visitorData.VisitorId, calledFrom);
                                loadAlbum(visitorData.InitialPage, visitorData.VisitorId);
                            }
                        }
                    } else {
                        logActivity2(visitorData.VisitorId, "AV7", visitorData.InitialPage, success); // ajax error from Add Visitor
                        logError2(visitorData.VisitorId, "AJ7", visitorData.InitialPage, success, "add visitor/" + calledFrom);
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 555, "add Visitor"))
                    logError2(create_UUID(), "XHR", 55, errMsg, "add visitor/" + calledFrom);
                else
                    logActivity2(create_UUID(), "AV8", 555, errMsg); // Add Visitor XHR error
            }
        });
    } catch (e) {
        logActivity2(create_UUID(), "AV6", 555, "add Visitor"); // add vis catch error
        logError2(create_UUID(), "CAT", 555, e, "add Visitor");
    }
}

function loadUserProfile(folderId, visitorId) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/GetVisitorInfo?visitorId=" + visitorId,
            success: function (visitorInfo) {
                if (visitorInfo.Success == "ok") {
                    if (visitorInfo.VisitorFound) {
                        logError2(visitorId, "BUG", folderId, "VisitorId not found", "loadUserProfile");
                        return;
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
                        //doubleCheckVisitorId(visitorId, folderId);
                    }
                    else {
                        localStorage["IsLoggedIn"] = "false";
                        localStorage["UserName"] = "not registered";
                        localStorage["UserRole"] = "not registered";
                        $('#optionLoggedIn').hide();
                        $('#optionNotLoggedIn').show();
                        $('#footerCol5').hide
                    }
                }
                else {
                    logError("AJX", folderId, visitorInfo.Success, "load UserProfile");
                    if (document.domain == "localhost") alert("load UserProfile: " + visitorInfo.Success);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "load UserProfile"))
                    logError2(visitorId, "XHR", folderId, errMsg, "load UserProfile");
            }
        });
    } catch (e) {
        logError2(create_UUID(), "CAT", folderId, e, "load UserProfile/" + calledFrom);
    }
}

function logVisit(visitorId, folderId, calledFrom) {
    try {

        //logActivity2(visitorId, "LV0", folderId, calledFrom);
        if (visitorId == "cookie not found") {
            logActivity2(visitorId, "LV4", folderId, calledFrom);
            logError2(create_UUID(), "VNF", folderId, " ", "log visit"); // visitorId came back cookie not found
            return;
        }
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Common/LogVisit?visitorId=" + visitorId,
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (successModel.ReturnValue == "new visitor logged") {
                        logActivity2(visitorId, "LV1", folderId, "log visit/" + calledFrom); // new visitor visit added
                        $('#headerMessage').html("Welcome new visitor. Please log in");
                    }
                    if (successModel.ReturnValue == "return visit logged") {
                        logActivity2(visitorId, "LV2", folderId, "log visit/" + calledFrom);  // Return Vist Recorded
                        if (isLoggedIn())
                            $('#headerMessage').html("Welcome back " + localStorage["UserName"]);
                        else
                            $('#headerMessage').html("Welcome back. Please log in");
                    }
                    if (successModel.ReturnValue == "no visit recorded")
                        logActivity2(visitorId, "LV5", folderId, "log visit/" + calledFrom); // no visit recorded

                    if (successModel.ReturnValue == "VisitorId not found") {
                        logActivity2(visitorId, "LV3", folderId, "log visit/" + calledFrom);  // visitorId not found
                        logError2(visitorId, "BUG", folderId, "visitorId not found", "log visit/" + calledFrom);
                    }
                }
                else {
                    logActivity2(visitorId, "LV7", folderId, "log visit/" + calledFrom);  // 
                    logError2(visitorId, "AJX", folderId, successModel.Success, "log visit/" + calledFrom);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(visitorId, "LV6", folderId, errMsg);
                if (!checkFor404(errMsg, folderId, "log visit/" + calledFrom))
                    logError2(visitorId, "XHR", folderId, errMsg, "log visit/" + calledFrom);
            }
        });
    } catch (e) {
        //logError2(visitorId, "LV7", folderId, "visitorId: " + visitorId, "log visit/" + calledFrom);
        logError2(visitorId, "CAT", folderId, e, "log visit/" + calledFrom);
    }
}
