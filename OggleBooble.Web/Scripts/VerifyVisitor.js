
function logStaticPageHit(folderId, visitorId, calledFrom) {
    //logActivity("SP0", folderId, calledFrom); // calling static page hit
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogStaticPageHit?visitorId=" + visitorId + "&folderId=" + folderId + "&calledFrom=" + calledFrom,
        success: function (success) {
            if (success == "ok") {
                //logActivity("SP1", folderId, "logStatic PageHit/" + calledFrom); // static page hit success
            }
            else {
                if (success.toUpperCase().indexOf("DUPLICATE") > -1) {
                    //logActivity("SP3", folderId, "logStatic PageHit/" + calledFrom); // duplicate static pageHit
                }
                else {
                    logActivity2(visitorId, "SP2", folderId, "logStatic PageHit/" + calledFrom); // static page hit ajax error
                    logError2(visitorId, "AJX", folderId, success, "logStatic PageHit/" + calledFrom);
                }
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            logActivity2(visitorId, "SP6", folderId, calledFrom); // static page hit XHR error
            if (!checkFor404(errMsg, folderId, "logStatic PageHit/" + calledFrom))
                logError2(visitorId, "XHR", folderId, errMsg, "logStatic PageHit/" + calledFrom);
        }
    });
}

function verifySession(folderId, calledFrom) {
    try {
        let visitorId = "uninitialized";
        visitorId = getCookieValue("VisitorId", "verify session");

        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {
            sessionStorage["VisitorVerified"] = true;
            $('#headerMessage').html("new session started");

            if (visitorId.indexOf("cookie not found") > -1) {
                if (!navigator.cookieEnabled) {
                    setCookieValue("VisitorId", "00000880-0000-0000-0000-UNKNOWN");
                    logActivity2("00", "VS5", folderId, "verify session"); // user does not accept cookies
                }
                // user accepts cookies
                else {
                    let newVisitorId = create_UUID();
                    setCookieValue("VisitorId", newVisitorId);
                    logActivity2(newVisitorId, "VS2", folderId, "verify session"); // verify visitorId not found (new user?)
                    addVisitor({
                        VisitorId: newVisitorId,
                        IpAddress: Math.floor(Math.random() * 10000000000).toString(),
                        City: "new visitor?",
                        Country: "ZZ",
                        Region: "VS",
                        GeoCode: "unknown",
                        InitialPage: folderId
                    }, calledFrom);
                }
            }
            else {
                logActivity2(visitorId, "VS1", folderId, "verify session"); // visitor verified ok
                verifyVisitorId(visitorId, folderId, calledFrom);
            }
            logActivity2(visitorId, "VS0", folderId, "verify session"); // new session started
        }
        if (calledFrom != "Index.html") {
            if (calledFrom != "album.html") {
                if (typeof logStaticPageHit === 'function')
                    logStaticPageHit(folderId, visitorId, calledFrom);
                else
                    logError2(visitorId, "FNF", folderId, "logStaticPageHit not a function", "verify session");
            }
            loadAlbum(folderId, visitorId);
            // logActivity("VV3", folderId, "verify session"); // active session new page
        }
    }
    catch (e) {
        sessionStorage["VisitorVerified"] = true;
        logActivity2(visitorId, "VS8", folderId, "verify session/" + calledFrom); // verify session CATCH error
        logError2(visitorId, "CAT", folderId, e, "verify session/" + calledFrom);
    }
}

function verifyVisitorId(visitorId, folderId,calledFrom) {
    try {
        if (visitorId.indexOf("cookie not found") > -1) {
            logActivity2(create_UUID(), "VV8", "verify visitor"); // cookie not found made it too far
            return;
        }
        logActivity2(visitorId, "VV0", folderId, "verify Visitor"); // attempting to verify visitor
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
            success: function (successModel) {
                if (successModel.Success == "ok") {
                    switch (successModel.ReturnValue) {
                        case "visitorId ok":
                            logActivity2(visitorId, "VV1", 1020222, "verify VisitorId"); // visitor verified ok
                            loadUserProfile(folderId, visitorId);
                            logVisit(visitorId, folderId, "verify session");
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

                            addVisitor({
                                VisitorId: newVisitorId,
                                IpAddress: Math.floor(Math.random() * 10000000000).toString(),
                                City: "visitor not found",
                                Country: "ZZ",
                                Region: "VV",
                                GeoCode: "unknown",
                                InitialPage: folderId
                            }, calledFrom);

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
                    }
                    else {
                        localStorage["IsLoggedIn"] = "false";
                        localStorage["UserName"] = "not registered";
                        localStorage["UserRole"] = "not registered";
                        $('#optionLoggedIn').hide();
                        $('#optionNotLoggedIn').show();
                        $('#footerCol5').hide

                        if (!visitorInfo.VisitorFound) {
                            k1VisitorId = create_UUID();
                            setCookieValue("VisitorId", k1VisitorId);
                            addVisitor({
                                VisitorId: k1VisitorId,
                                IpAddress: Math.floor(Math.random() * 10000000000).toString(),
                                City: "loadUserProfile",
                                Country: "ZZ",
                                Region: "LP",
                                GeoCode: "unknown",
                                InitialPage: folderId
                            }, "loadUserProfile");
                            logActivity2(visitorId, "VS3", folderId, "load UserProfile"); // visitorId cookie exists but not found
                            logError2(visitorId, "BUG", folderId, "visitorId cookie exists but not found", "loadUserProfile");
                        }
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
                        //logError2(visitorId, "BUG", folderId, "visitorId not found", "log visit/" + calledFrom);
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
