function verifyVisitor() {
    try {

        //if (document.domain === 'localhost') setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");

        let visitorId = getCookieValue("VisitorId");

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
            console.log("verifying visitor: " + visitorId);
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + visitorId,
                success: function (success) {
                    if (success == "ok") {
                        logActivity("VV1", 22, "verify Visitor");
                        loadUserProfile("verify Visitor");
                        logVisit(222, "verify visitor");
                        console.log("visitor verified: " + visitorId);
                        sessionStorage["VisitorVerified"] = "true";
                    }
                    else {  // visitorId not found
                        logActivity("VV7", 77, "verify Visitor");
                        logError("BUG", 77, "visitorId not found: " + visitorId, "verify Visitor");
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
    try
    {
        logActivity("AV0", 215519, "addVisitor"); // entering Add Visitor 
        console.log("attempting to addVisitor");
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (avSuccess) {
                if (avSuccess.Success == "ok") {
                    setCookieValue("VisitorId", visitorData.VisitorId);
                    loadUserProfile("add new visitor");
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, 215519);
                    if (visitorData.CalledFrom.endsWith("logStatic PageHit")) {
                        logStaticPageHit(215519, "add visitor");
                    }
                    logActivity("IP1", 44556, visitorData.VisitorId)
                    logActivity("AV3", 215519, "add visitor"); // new visitor added
                    console.log("new visitor added");
                    if (visitorData.CalledFrom == "attempt Register") {
                        //logEvent("LOG", 0, "Successfull log in: " + localStorage["UserName"]);
                        //displayStatusMessage("ok", "thanks for Registering " + localStorage["UserName"]);

                        //localStorage["IsLoggedIn"] = true;
                        //$('#optionLoggedIn').show();
                        //$('#optionNotLoggedIn').hide();
                        //dragableDialogClose();
                        //displayStatusMessage("ok", "thanks for Registering" + userName);
                        //console.log("update RegisteredUser IsLoggedIn: " + localStorage["IsLoggedIn"] +
                        //    " UserName: " + localStorage["UserName"] + " UserRole: " + localStorage["UserRole"]);
                    }
                }
                if (avSuccess.Success == "existing Ip") {
                    logActivity("IP2", 33100, "getIp info"); // ip exiting used

                    console.log("NO ADD. existing Ip") 
                    setCookieValue("VisitorId", visitorData.VisitorId);
                    loadUserProfile("add existing Ip visitor");
                    console.log("wasted Ip call : " + visitorData.VisitorId);
                    console.log("existing IP assigned: " + visitorData.VisitorId);
                    logIpHit(visitorData.VisitorId, visitorData.IpAddress, 215519);
                    if (visitorData.CalledFrom.endsWith("logStatic PageHit"))
                        logStaticPageHit(215519, "add Visitor");

                    logActivity("AV5", 215519, "add Visitor");  // existing IP visitorId used
                }
                if (avSuccess.Success.indexOf("Duplicate entry") > 0) {
                    logActivity("AV9", 666, "addVisitor"); // Duplicate. Attempt to add new visitorId
                    logError("DVA", 656, avSuccess.Success, "addVisitor");
                }
                if (avSuccess.Success.indexOf("ERROR:") > -1) {
                    logActivity("AV4", 215519, avSuccess.Success);
                    logError("AJ7", 215519, avSuccess.Success, "addVisitor");
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

function loadUserProfile(calledFrom) {
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
                            $('#txtUserProfileLastName').val(visitorInfo.RegisteredUser.LastName);
                            $('#txtUserProfileEmail').val(visitorInfo.RegisteredUser.Email);
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
