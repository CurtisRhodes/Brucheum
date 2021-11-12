var isSessionVerified = false;
let failureVisitorId = "00000880-0000-0000-0000-UNKNOWN";

function callAlbumPage(visitorId, folderId, calledFrom) {
    try {
        if (calledFrom != "Index.html") {
            if (calledFrom != "album.html") {
                if (typeof logStaticPageHit === 'function')
                    logStaticPageHit(folderId, visitorId, calledFrom);
                else
                    logError2(visitorId, "FNF", folderId, "logStaticPageHit not a function", "call AlbumPage");
            }

            //tryIpify(folderId, visitorId, calledFrom);

            loadAlbum(folderId, visitorId, calledFrom);
            // logActivity("VV3", folderId, "verify session"); // active session new page
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "call AlbumPage");
    }
}


function verifySession(folderId, calledFrom) {
    console.log("verifySession(" + folderId + "," + calledFrom + ")");
    let visitorId = "uninitialized";
    try {
        if (typeof getCookieValue != 'function') {
            logError2(visitorId, "bug", folderId, "getCookieValue not a function", "verify session/" + calledFrom);
            return;
        }
        visitorId = getCookieValue("VisitorId", "verify session");
        let localSessionIsVerified;
        try {
            let storagek = window.sessionStorage || {};
            localSessionIsVerified = window.sessionStorage["SessionVerified"];
            // logActivity2(visitorId, "VS4", folderId, "verify session"); // session storage ok
        } catch (e) {
            localSessionIsVerified = isSessionVerified;
            logActivity2(visitorId, "VS6", folderId, e); // session storage fail
        }
        if (localSessionIsVerified) {
            //logActivity("VS9", folderId, "verify session"); // session verified
            callAlbumPage(visitorId, folderId, calledFrom);
        }
        else {
            $('#headerMessage').html("new session started");
            logActivity2(visitorId, "VS0", folderId, "verify session"); // new session started
            if (visitorId.indexOf("cookie not found") > -1) {
                addVisitor(folderId, "new session started");
            }
            else {
                verifyVisitor(visitorId, folderId, calledFrom);
                callAlbumPage(visitorId, folderId, calledFrom);
            }
            try {
                let storagek = window.sessionStorage || {};
                window.sessionStorage["SessionVerified"] = true;
            } catch (e) {
                logActivity2(visitorId, "VS6", folderId, "isSessionVerified set to true"); // session storage fail
                isSessionVerified = true;
            }
        }
    }
    catch (e) {
        logActivity2(visitorId, "VS8", folderId, "verify session2/" + calledFrom + " ERRMSG: " + e); // verify session CATCH error
        logError2(visitorId, "CAT", folderId, e, "verify session2/" + calledFrom);
        callAlbumPage(visitorId, folderId, calledFrom);
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
                if (successModel.Success == "ok") {
                    if (successModel.VisitorIdExists) {
                        //logActivity2(visitorId, "VV1", 1020222, "verify VisitorId"); // visitor verified ok
                        if (successModel.Country == "ZZ") {


                            tryAddNewIP(folderId, visitorId, "verify visitor/" + calledFrom);


                            logActivity2(visitorId, "VV2", folderId, "verify VisitorId"); // incoming visitor Country=ZZ
                        }
                        if (successModel.IsRegisteredUser) {
                            logActivity2(visitorId, "VV3", folderId, "verify visitor/" + calledFrom); // VV3	incoming registered user
                            loadUserProfile(folderId, visitorId);
                        }
                        logVisit(visitorId, folderId, "verify visitor");
                    }
                    else {
                        logActivity2(visitorId, "VV4", folderId, "verify visitor/" + calledFrom); // visitorId not found
                        addVisitor(folderId, "verify Visitor");
                        //logError2(visitorId, "BUG", folderId, "visitorId came back not found", "verify visitor/" + calledFrom);
                    }
                }
                else {
                    logActivity2(visitorId, "VV5", folderId, "verify Visitor"); // verify visitor AJX error
                    logError2(visitorId, "AJX", folderId, successModel.Success, "verify visitor/" + calledFrom);
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
        logError2(visitorId, "CAT", folderId, e, "verify visitor/" + calledFrom);
        logActivity2(visitorId, "VV7", folderId, e); // verify visitor CATCH error
    }
}

function addVisitor(folderId, calledFrom) {
    try {
        $.ajax({
            type: "GET",
            url: "https://api.ipify.org",
            success: function (ipifyRtrnTxt) {
                if (!isNullorUndefined(ipifyRtrnTxt)) {
                    logActivity2(failureVisitorId, "AV0", folderId, "add visitor/" + calledFrom); // entering Add Visitor 
                    //logActivity2(visitorId, "I01", folderId, ipifyRtrnTxt); // ipify ok
                    addVisitorIfIpUnique(ipifyRtrnTxt, folderId, calledFrom);
                }
                else {
                    logActivity2(failureVisitorId, "AV5", folderId, errMsg); //  ipify fail
                    logError2(visitorId, "AJX", folderId, "ipify null", "add visitor/" + calledFrom);
                    callAlbumPage(failureVisitorId, folderId, calledFrom);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(failureVisitorId, "I0X", folderId, errMsg); //  get IpIfyIpInfo XHR error
                if (!checkFor404(errMsg, folderId, "get IpIfyIpInfo/" + calledFrom))
                    logError2(failureVisitorId, "XHR", folderId, errMsg, "get IpIfyIpInfo/" + calledFrom);

                callAlbumPage(failureVisitorId, folderId, calledFrom);
            }
        });
    } catch (e) {
        logActivity2(failureVisitorId, "AV6", folderId, e); // add vis catch error
        logError2(failureVisitorId, "CAT", folderId, e, "add Visitor");
        callAlbumPage(failureVisitorId, folderId, calledFrom);
    }
}

function addVisitorIfIpUnique(ipAddress, folderId, calledFrom) {
    try {
        logActivity2(failureVisitorId, "AV3", folderId, "ip:" + ipAddress); // entering addVisitorIfIpUnique

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddUniqueIpVisitor&ipAddress=" + ipAddress + "&calledFrom=" + calledFrom,
            success: function (addVisitorSuccess) {

                logActivity2(failureVisitorId, "AV4", folderId, "addVisitorSuccess.Success:" + addVisitorSuccess.Success); // new add visitor happened

                if (addVisitorSuccess.Success == "ok") {
                    setCookieValue("VisitorId", addVisitorSuccess.VisitorId, "add Visitor/" + calledFrom);
                    logVisit(addVisitorSuccess.VisitorId, folderId, "add Visitor");
                    callAlbumPage(addVisitorSuccess.VisitorId, folderId, calledFrom);

                    if (addVisitorSuccess.ErrorMessage == "ok")
                        logActivity2(addVisitorSuccess.VisitorId, "AV1", folderId, "add Visitor/" + calledFrom); // new visitor added
                    else
                        logActivity2(addVisitorSuccess.VisitorId, "AV2", folderId, "add Visitor/" + calledFrom); // new visitor added
                }
                else {
                    logActivity2(failureVisitorId, "AV7", folderId, success); // ajax error from Add Visitor
                    logError2(failureVisitorId, "AJ7", folderId, success, "add visitor/" + calledFrom);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "add Visitor"))
                    logError2(create_UUID(), "XHR", 55, errMsg, "add visitor/" + calledFrom);
                else
                    logActivity2(failureVisitorId, "AV8", folderId, errMsg); // Add Visitor XHR error
            }
        });
    } catch (e) {
        logActivity2(failureVisitorId, "AV6", folderId, e); // add vis catch error
        logError2(failureVisitorId, "CAT", folderId, e, "add Visitor");
        callAlbumPage(failureVisitorId, folderId, calledFrom);
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
                            addVisitor(folderId, "load UserProfile");
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

