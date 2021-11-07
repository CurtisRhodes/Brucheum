var isSessionVerified = false;

//function verifySession(folderId, calledFrom) {
//    console.log("verifySession(" + folderId + "," + calledFrom + ")");
//}
function verifySession(folderId, calledFrom) {
    console.log("verifySession(" + folderId + "," + calledFrom + ")");
    let visitorId = "uninitialized";
    try {
        //try {
        //    let storagek = window.sessionStorage || {};
        //    // logActivity2(visitorId, "VS4", folderId, "verify session"); // session storage ok
        //} catch (e) {
        //    logActivity2(visitorId, "VS6", folderId, e); // session storage fail
        //}

        visitorId = getCookieValue("VisitorId", "verify session");

        if (isSessionVerified) {
            //logActivity("VS9", folderId, "verify session"); // session verified
            callAlbumPage(folderId, visitorId, calledFrom);
        }
        else {
            $('#headerMessage').html("new session started");

            if (visitorId.indexOf("cookie not found") > -1) {
                //createNewVisitorId
                let newVisitorId = create_UUID();
                setCookieValue("VisitorId", newVisitorId, "verify session");
                let geoCode = "unknown";
                if (!navigator.cookieEnabled) {
                    logActivity2(newVisitorId, "VS5", folderId, "verify session"); // user does not accept cookies
                    logError2(newVisitorId, "UNC", folderId, "verify session");
                    geoCode = "user does not accept cookies";
                }
                logActivity2(newVisitorId, "VS2", folderId, "verify session"); // verify visitorId not found (new user?)
                addVisitor({
                    VisitorId: newVisitorId,
                    IpAddress: Math.floor(Math.random() * 10000000000).toString(),
                    City: "new visitor?",
                    Country: "ZZ",
                    Region: "VS",
                    GeoCode: geoCode,
                    InitialPage: folderId
                }, calledFrom);
            }
            else {
                verifyVisitor(visitorId, folderId, calledFrom);
                callAlbumPage(folderId, visitorId, calledFrom);
            }

        }
        //sessionStorage["VisitorVerified"] = true;
        isSessionVerified = true;
        logActivity2(visitorId, "VS0", folderId, "verify session"); // new session started

    }
    catch (e) {
        logActivity2(visitorId, "VS8", folderId, "verify session2/" + calledFrom + " ERRMSG: " + e); // verify session CATCH error
        logError2(visitorId, "CAT", folderId, e, "verify session2/" + calledFrom);
        callAlbumPage(folderId, visitorId, calledFrom);
    }
}

function callAlbumPage(folderId, visitorId, calledFrom) {
    if (calledFrom != "Index.html") {
        if (calledFrom != "album.html") {
            if (typeof logStaticPageHit === 'function')
                logStaticPageHit(folderId, visitorId, calledFrom);
            else
                logError2(visitorId, "FNF", folderId, "logStaticPageHit not a function", "verify session");
        }
        loadAlbum(folderId, visitorId, calledFrom);
        // logActivity("VV3", folderId, "verify session"); // active session new page
    }
}

function verifyVisitor(visitorId, folderId, calledFrom) {
    try {
        if (visitorId.indexOf("cookie not found") > -1) {
            logActivity2(create_UUID(), "VV8", "verify visitor/" + calledFrom); // cookie not found made it too far
            return;
        }
        //logActivity2(visitorId, "VV0", folderId, "verify Visitor"); // attempting to verify visitor
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
            success: function (successModel) {
                //ACT	VV0	attempting to verify visitor
                //ACT	VV1	verify visitor ok
                //ACT	VV2	incoming visitor Country=ZZ
                //ACT	VV3	incoming registered user
                //ACT	VV4	verify visitor AJX error
                //ACT	VV5	verify visitor CATCH error
                //ACT	VV6	verify visitor XHR error
                //ACT	VV7	retired visitor not found
                //ACT	VV8	cookie not found made it too far
                //ACT	VVa	missing VisitorId repeatOffender
                //ACT	VVb	missing VisitorId false flag
                //ACT	VVX	is valid guid false alarm
                //ACT	VVY	VisitorId not verified but is valid guid
                //ACT	VVZ	VisitorId not verified AND is valid not guid

                if (successModel.Success == "ok") {
                    if (successModel.VisitorIdExits) {
                        //logActivity2(visitorId, "VV1", 1020222, "verify VisitorId"); // visitor verified ok
                        if (successModel.Country == "ZZ") {
                            tryAddNewIP(folderId, visitorId, "verify visitor/" + calledFrom);
                            logActivity2(visitorId, "VV2", 1020222, "verify VisitorId"); // incoming visitor Country=ZZ
                        }
                        if (successModel.IsRegisteredUser) {
                            logActivity2(visitorId, "VV3", 1020222, "verify VisitorId"); // VV3	incoming registered user
                            loadUserProfile(folderId, visitorId);
                        }
                        logVisit(visitorId, folderId, "verify visitor");
                    }
                    else {
                        logError2(visitorId, "BUG", folderId, "visitorId came back not found", "verify VisitorId");
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
    catch (e) {
        logError2(visitorId, "CAT", folderId, e, "verify visitorId");
        logActivity2(visitorId, "VV5", folderId, e); // verify visitor CATCH error
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
                    logActivity2(visitorData.VisitorId, "AV1", visitorData.InitialPage, "add Visitor/" + calledFrom); // new visitor added
                    setCookieValue("VisitorId", visitorData.VisitorId, "add Visitor/" + calledFrom);
                    logVisit(visitorData.VisitorId, visitorData.InitialPage, "add Visitor");
                    callAlbumPage(visitorData.InitialPage, visitorData.VisitorId, "add Visitor/" + calledFrom);

                    // just for today
                    tryAddNewIP(visitorData.InitialPage, visitorData.VisitorId, "add Visitor/" + calledFrom);

                }
                else {
                    if (success.indexOf("Duplicate entry") > 0) {
                        logActivity2(visitorData.VisitorId, "AV3", visitorData.InitialPage, "add visitor/" + calledFrom); // duplicate key violation
                        logVisit(visitorData.VisitorId, visitorData.InitialPage, "add Visitor. Duplicate entry");
                        callAlbumPage(folderId, newVisitorId, calledFrom);
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
                            setCookieValue("VisitorId", k1VisitorId, "load UserProfile");
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
                    if (successModel.ReturnValue == "new visit logged") {
                        //logActivity2(visitorId, "LV1", folderId, "log visit/" + calledFrom); // new visitor visit added
                        $('#headerMessage').html("Welcome new visitor. Please log in");
                    }
                    if (successModel.ReturnValue == "return visit logged") {
                        logActivity2(visitorId, "LV2", folderId, "log visit/" + calledFrom);  // Return Vist Recorded
                        if (isLoggedIn())
                            $('#headerMessage').html("Welcome back " + localStorage["UserName"]);
                        else
                            $('#headerMessage').html("Welcome back. Please log in");
                    }
                    //if (successModel.ReturnValue == "no visit recorded")
                    //    logActivity2(visitorId, "LV5", folderId, "log visit/" + calledFrom); // no visit recorded

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

function isValidGuid(uuid) {
    let s = "" + uuid;

    s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');
    if (s === null) {
        return false;
    }
    return true;
}

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
