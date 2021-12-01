function callAlbumPage(visitorId, folderId, pageSouce, calledFrom) {
    try {
        if (pageSouce != "Index.html") {
            if (pageSouce != "album.html") {
                if (typeof logStaticPageHit === 'function')
                    logStaticPageHit(folderId, visitorId, calledFrom);
                else
                    logError2(visitorId, "FNF", folderId, "logStaticPageHit not a function", "call AlbumPage/" + calledFrom);
            }
            if (typeof loadAlbum === 'function')
                loadAlbum(folderId, visitorId, pageSouce, calledFrom);
            else {
                logError2(visitorId, "FNF", folderId, "loadAlbum not a function", "call AlbumPage/" + calledFrom);
                window.location.href = "Index.html";
            }
            // logActivity("VV3", folderId, "verify session"); // active session new page
        }
    } catch (e) {
        logError2(visitorId, "CAT", folderId, e, "call AlbumPage");
    }
}

function verifySession(folderId, calledFrom) {
    $(document).ready(function () {
        //console.log("verifySession(" + folderId + "," + calledFrom + ")");
        try {
            if (window.localStorage) {
                let visitorId = localStorage["VisitorId"];
                if (window.sessionStorage) {
                    if (isNullorUndefined(window.sessionStorage["SessionVerified"])) {
                        window.sessionStorage["SessionVerified"] = true;
                        if (isNullorUndefined(visitorId)) {
                            visitorId = create_UUID();
                            localStorage["VisitorId"] = visitorId;
                            addVisitor(visitorId, folderId, "new visitor");
                            logActivity("VS2", folderId, "verify session"); // VisitorId not found (new visitor?)
                        }
                        else {
                            verifyVisitor(visitorId, folderId, calledFrom);
                        }
                    }
                        callAlbumPage(visitorId, folderId, calledFrom, "normal bypass");
                }
                else { // no concept of local storage
                    visitorId = create_UUID();
                    addVisitor(visitorId, folderId, "no local storage");
                    callAlbumPage(visitorId, folderId, calledFrom, "new session started");
                    logError2(visitorId, "BUG", folderId, "no local storage", "verify session/" + calledFrom);
                }
            }
            else { //  no concept of storage
                visitorId = create_UUID();
                addVisitor(visitorId, folderId, "no session storage");
                callAlbumPage(visitorId, folderId, calledFrom, "new session started");
                logError2(visitorId, "BUG", folderId, "no local storage", "verify session/" + calledFrom);
            }
        }
        catch (e) {
            // verify session2/album.html ERRMSG: SecurityError: The operation is insecure.
            logActivity2(visitorId, "VS8", folderId, "verify session2/" + calledFrom + ". ERRMSG: " + e); // verify session CATCH error
            //logError2(visitorId, errorCode, folderId, errorMessage, calledFrom)
            logError2(visitorId, "CAT", folderId, e, "verify session2/" + calledFrom);
            callAlbumPage(visitorId, folderId, calledFrom, "verify session catch");
        }
    });
}

function verifyVisitor(visitorId, folderId, calledFrom) {
    try {
        if (visitorId == "cookie not found") {
            //logActivity2(visitorId, "VV8", "verify visitor/" + calledFrom); // cookie not found made it too far
            logError2(visitorId, "VNF", folderId, "should not make it this far", "verify visitor/" + calledFrom);
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

                            // today only
                            tryAddNewIP(folderId, visitorId, "verify visitor/" + calledFrom);

                            logActivity2(visitorId, "VV2", folderId, "verify visitor/" + calledFrom); // incoming visitor Country=ZZ
                        }
                        else {
                            if (successModel.IsRegisteredUser) {
                                logActivity2(visitorId, "VV3", folderId, "verify visitor/" + calledFrom); // VV3	registered user verified
                                loadUserProfile(visitorId, folderId, "verify visitor/" + calledFrom);
                            }
                            else
                                logActivity2(visitorId, "VV1", folderId, "verify visitor/" + calledFrom); // VV3	unregistered user verified
                        }
                        logVisit(visitorId, folderId, "verify visitor");
                    }
                    else {
                        logActivity2(visitorId, "VV4", folderId, "verify visitor/" + calledFrom); // visitor not exists
                        addVisitor(visitorId, folderId, "verify Visitor");
                        //logError2(visitorId, "VNF", folderId, "adding visitor", "verify visitor/" + calledFrom);
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

function addVisitor(visitorId, folderId, calledFrom) {
    try {
        $.ajax({
            type: "GET",
            url: "https://api.ipify.org",
            success: function (ipifyRtrnTxt) {
                if (!isNullorUndefined(ipifyRtrnTxt)) {
                    //logActivity2(failureVisitorId, "AV0", folderId, "add visitor/" + calledFrom); // entering Add Visitor 
                    //logActivity2(visitorId, "I01", folderId, ipifyRtrnTxt); // ipify ok
                    addVisitorIfIpUnique(visitorId, ipifyRtrnTxt, folderId, calledFrom);
                }
                else {
                    logActivity2(failureVisitorId, "AV5", folderId, errMsg); //  ipify fail
                    logError2(visitorId, "AJX", folderId, "ipify null", "add visitor/" + calledFrom);
                    callAlbumPage(failureVisitorId, folderId, calledFrom, "add visitor success");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(failureVisitorId, "AVX", folderId, errMsg); //  get IpIfyIpInfo XHR error
                if (!checkFor404(errMsg, folderId, "get IpIfyIpInfo/" + calledFrom))
                    logError2(failureVisitorId, "XHR", folderId, errMsg, "get IpIfyIpInfo/" + calledFrom);

                callAlbumPage(failureVisitorId, folderId, calledFrom, "add visitor error");
            }
        });
    } catch (e) {
        logActivity2(failureVisitorId, "AV6", folderId, e); // add vis catch error
        logError2(failureVisitorId, "CAT", folderId, e, "add Visitor");
        callAlbumPage(failureVisitorId, folderId, calledFrom, "add visitor catch error");
    }
}

function addVisitorIfIpUnique(visitorId, ipAddress, folderId, calledFrom) {
    try {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddUniqueIpVisitor?visitorId=" + visitorId + "&ipAddress=" + ipAddress + "&calledFrom=" + calledFrom + "&initialPage=" + folderId,
            success: function (addVisitorSuccess) {

                //logActivity2(failureVisitorId, "AV4", folderId, "addVisitorSuccess.Success:" + addVisitorSuccess.Success); // new add visitor happened

                if (addVisitorSuccess.Success == "ok") {
                    if (addVisitorSuccess.ErrorMessage == "ok") {
                        logActivity2(addVisitorSuccess.VisitorId, "AV1", folderId, "add Visitor/" + calledFrom); // new visitor added
                    }
                    if (addVisitorSuccess.ErrorMessage == "existing Ip") {
                        localStorage["VisitorId"] = addVisitorSuccess.ExistingVisitorId;
                        rebuildCookie();
                        visitorId = addVisitorSuccess.ExistingVisitorId;
                        logActivity2(visitorId, "AV2", folderId, "add Visitor/" + calledFrom); // existing IP used
                    }
                    logVisit(visitorId, folderId, "add Visitor");
                }
                else {
                    logActivity2(addVisitorSuccess.VisitorId, "AV7", folderId, success); // ajax error from Add Visitor
                    logError2(addVisitorSuccess.VisitorId, "AJ7", folderId, success, "add visitor/" + calledFrom);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "addVisitor If IpUnique"))
                    logError2("unavailable", "XHR", 55, errMsg, "addVisitor If IpUnique/" + calledFrom);
                else {
                    // logError2("unavailable", "AV8", folderId, errMsg, "addVisitor If IpUnique"); // Add Visitor XHR error
                    logActivity2("unavailable", "AV8", folderId, "errMsg: " + errMsg); // Add Visitor XHR error
                }
            }
        });
    } catch (e) {
        logActivity2(failureVisitorId, "AV6", folderId, e); // add vis catch error
        logError2(failureVisitorId, "CAT", folderId, e, "addVisitor If IpUnique ");
        callAlbumPage(failureVisitorId, folderId, calledFrom, "addVisitor If IpUnique catch error");
    }
}

function loadUserProfile(visitorId, folderId, calledFrom) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/GetVisitorInfo?visitorId=" + visitorId,
            success: function (visitorInfo) {
                if (visitorInfo.Success == "ok") {
                    if (visitorInfo.IsRegisteredUser) {
                        if (visitorInfo.RegisteredUser.IsLoggedIn == 0)
                            localStorage["IsLoggedIn"] = "false";
                        else
                            localStorage["IsLoggedIn"] = "true";
                        localStorage["UserName"] = visitorInfo.RegisteredUser.UserName;
                        localStorage["UserRole"] = visitorInfo.RegisteredUser.UserRole;
                        $('#spnUserName').html(visitorInfo.RegisteredUser.UserName);
                        $('#optionNotLoggedIn').hide();
                        $('#optionLoggedIn').show();
                        $('#footerCol5').show();
                    }
                    else {
                        if (!visitorInfo.VisitorFound) {
                            logActivity2(visitorId, "VS3", folderId, "load UserProfile"); // visitorId cookie exists but not found
                            logError2(visitorId, "VNF", folderId, "visitorId cookie exists but not found", "loadUserProfile");
                            addVisitor(visitorId, folderId, "load UserProfile");
                        }
                        localStorage["IsLoggedIn"] = "false";
                        localStorage["UserName"] = "not registered";
                        localStorage["UserRole"] = "not registered";
                        $('#optionLoggedIn').hide();
                        $('#optionNotLoggedIn').show();
                        $('#footerCol5').hide
                    }
                    rebuildCookie();
                }
                else {
                    logError("AJX", folderId, visitorInfo.Success, "load UserProfile");
                    //if (document.domain == "localhost") alert("load UserProfile: " + visitorInfo.Success);
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
            logError2(visitorId, "VNF", folderId, " ", "log visit"); // visitorId came back cookie not found
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
                        if (localStorage["IsLoggedIn"] == "true")
                            $('#headerMessage').html("Welcome back " + getCookieValue("UserName", "log visit"));
                        else
                            $('#headerMessage').html("Welcome back. Please log in");
                    }
                    //if (successModel.ReturnValue == "no visit recorded")
                    //    logActivity2(visitorId, "LV5", folderId, "log visit/" + calledFrom); // no visit recorded

                    if (successModel.ReturnValue == "VisitorId not found") {
                        logActivity2(visitorId, "LV3", folderId, "log visit/" + calledFrom);  // visitorId not found
                        logError2(visitorId, "VNF", folderId, "visitorId not found", "log visit/" + calledFrom);
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

