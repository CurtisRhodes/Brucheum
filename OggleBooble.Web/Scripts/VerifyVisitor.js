function verifyVisitor() {
    try {

        if (document.domain === 'localhost') setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");

        let visitorId = getCookieValue("VisitorId");

        console.log("1 verify visitorId: " + visitorId);

        if (visitorId == "not found") {
            logActivity("VV2", 15, "verify Visitor");
            getIpInfo(15, "verify Visitor");
            return;
        }

        if (localStorage["VisitorId"] == "unset") {
            logActivity("VV3", 16, "verify Visitor");
            getIpInfo(16, "verify Visitor");
            return;
        }

        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {
            $('#headerMessage').html("new session started");
            sessionStorage["VisitorVerified"] = true;
            console.log("2 verify visitorId: " + visitorId);
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
                success: function (success) {
                    if (success == "ok") {
                        logActivity("VV1", 22, "verify Visitor");
                        loadUserProfile();
                        logVisit(222, "verify visitor");
                        console.log("visitor verified: " + visitorId);
                        sessionStorage["VisitorVerified"] = "true";
                    }
                    else {  // visitorId not found
                        logActivity("VV7", 77, "verify Visitor");
                        logError("BUG", 77, "visitorId not found: " + visitorId, "verifyVisitor");
                        console.log("visitorId not found: " + visitorId + "  calling getIpInfo");
                        getIpInfo(77, "verify Visitor");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    //if (!checkFor404(errMsg, 215519, "getIpInfo/" + calledFrom)) {
                    logActivity("VV6", 666, "verify Visitor");
                    logError("XHR", 666, errMsg, "verify Visitor");
                }
            });
        }
        else
            console.log("visitor verified: " + sessionStorage["VisitorVerified"] + " visitorId: " + visitorId);
    }
    catch (e) {
        logActivity("VV5", 255, "verify Visitor");
        logError("CAT", 255, e, "verify Visitor");
        if (document.domain === 'localhost') alert("Catch error in verifyVisitorId!!: " + e);
    }
}

function addVisitor(visitorData) {
    try {
        logActivity("AV0", 215519, "addVisitor"); // entering Add Visitor 
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (avSuccess) {
                if (avSuccess == "ok") {
                    setCookieValue("VisitorId", visitorData.VisitorId);
                    logActivity("IP1", visitorData.VisitorId)
                    logActivity("AV3", 215519, "add Visitor"); // new visitor added
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, 215519);
                    console.log("new visitor added");
                    if (visitorData.CalledFrom.endsWith("logStatic PageHit")) {
                        logStaticPageHit(215519, "add Visitor");
                    }
                    if (visitorData.CalledFrom == "attempt Register") {
                        $('#spnUserName').html(localStorage["UserName"]);
                        $('#optionNotLoggedIn').hide();
                        $('#optionLoggedIn').show();
                        $('#footerCol5').show();
                    }
                }
                else {
                    if (avSuccess == "existing Ip") {
                        logActivity("AV5", 215519, "add Visitor");  // existing IP visitorId used
                        setCookieValue("VisitorId", visitorData.VisitorId);
                        loadUserProfile();
                        console.log("wasted Ip call : " + visitorData.VisitorId);
                        console.log("existing IP assigned: " + visitorData.VisitorId);
                        logIpHit(visitorData.VisitorId, visitorData.IpAddress, 215519);
                        if (visitorData.CalledFrom.endsWith("logStatic PageHit"))
                            logStaticPageHit(215519, "add Visitor");
                    }
                    else
                    {
                        if (avSuccess.Success.indexOf("ERROR:") > -1) {
                            logActivity("AV4", 215519, avSuccess.Success);
                            logError("AJ7", 215519, avSuccess.Success, "addVisitor");
                        }
                        else {
                            if (avSuccess.indexOf("Duplicate entry") > 0) {
                                logActivity("AV9", 666, "addVisitor"); // Duplicate. Attempt to add new visitorId
                                logError("DVA", 656, avSuccess.Success, "addVisitor");
                            }
                            else {
                                logActivity("AV7", 444, "addVisitor"); // unknown success code from Add Visitor
                                logError("AJ7", 222, avSuccess.Success, "AddVisitor");
                            }
                        }
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
        logActivity("AV2", 555, "addVisitor"); // add vis catch error
        logError("CAT", 555, e, "addVisitor");
    }
}

function loadUserProfile() {
    let visitorId = getCookieValue("VisitorId");
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/GetVisitorInfo?visitorId=" + visitorId,
            success: function (visitorInfo) {
                if (visitorInfo.Success == "ok") {
                    if (visitorInfo.IsRegisteredUser) {
                        localStorage["IsLoggedIn"] = visitorInfo.RegisteredUser.IsLoggedIn;
                        localStorage["UserName"] = visitorInfo.RegisteredUser.UserName;
                        localStorage["UserRole"] = visitorInfo.RegisteredUser.UserRole;
                        
                        if (localStorage["IsLoggedIn"] == true) {
                            $('#spnUserName').html(localStorage["UserName"]);
                            $('#optionNotLoggedIn').hide();
                            $('#optionLoggedIn').show();
                            $('#footerCol5').show();
                        }

                        if (calledFrom == "show UserProfileDialog") {
                            $('#txtUserProfileName').val(visitorInfo.RegisteredUser.UserName);
                            $('#txtUserProfileFirstName').val(visitorInfo.RegisteredUser.FirstName);
                            $('#txtUserProfileLastName').val(visitorInfo.LastName);
                            $('#txtUserProfileEmail').val(visitorInfo.Email);
                        }
                    }
                    else {
                        localStorage["IsLoggedIn"] = false;
                        localStorage["UserName"] = "not registered";
                        localStorage["UserRole"] = "not registered";
                    }

                    console.log("load UserProfile  IsLoggedIn: " + localStorage["IsLoggedIn"] +
                        " UserName: " + localStorage["UserName"] +
                        " UserRole: " + localStorage["UserRole"]);
                }
                else {
                    if (visitorInfo.Success == "not found") {
                        logError("EVT", 470, "Ip:", "load UserProfile");
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
    } catch (e) {
        logError("CAT", 12440, e, "load UserProfile");
    }
}
