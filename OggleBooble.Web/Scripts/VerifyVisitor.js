function verifyVisitor() {
    try {

        //if (document.domain === 'localhost') setCookieValue("VisitorId", "ec6fb880-ddc2-4375-8237-021732907510");
        //if (document.domain === 'localhost') 

        let visitorId = getCookieValue("VisitorId");
        // setTimeout(function () {  //  maybe a pause is needed for cookie to come back

        if (isNullorUndefined(visitorId)) {
            logActivity("VV2", 13, "undefined verify Visitor");
            tryAddNewIP(13, "verify Visitor");
            return;
        }
        if (visitorId == "not found") {
            logActivity("VV2", 15, "not found verify Visitor");
            tryAddNewIP(15, "verify Visitor");
            return;
        }
        //if (localStorage["VisitorId"] == "unset") {
        //    logActivity("VV2", 16, "unset verify Visitor");
        //    tryAddNewIP(16, "verify Visitor");
        //    return;
        //}

        console.log("entering verifyVisitor. visitorId: " + visitorId);
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
                        //logError("BUG", 77, "visitorId not found: " + visitorId, "verify Visitor");
                        console.log("visitorId not found: " + visitorId + "  calling getIpInfo");
                        if (document.domain == "localhost") alert("visitorId not found: " + visitorId + "  calling getIpInfo");
                        tryAddNewIP(17, "verify Visitor");
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
        // }, 2500);
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
                    logIpHit(avSuccess.VisitorId, visitorData.IpAddress, visitorData.InitialPage);

                    if (visitorData.CalledFrom.endsWith("logStatic PageHit")) {
                        logStaticPageHit(visitorData.InitialPage, "add visitor");
                    }                   

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
                    logActivity("AV5", 215519, "add Visitor");  // existing IP visitorId used
                    console.log("wasted Ip call : " + avSuccess.VisitorId);
                    setCookieValue("VisitorId", avSuccess.VisitorId);
                    logIpHit(avSuccess.VisitorId, visitorData.IpAddress, visitorData.InitialPage);
                    logVisit(visitorData.InitialPage, "add Visitor");
                    loadUserProfile("recall existing Ip");

                    if (visitorData.CalledFrom.endsWith("logStatic PageHit"))
                        logStaticPageHit(visitorData.InitialPage, "add Visitor");

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
    } catch (e) {
        logError("CAT", 12440, e, "load UserProfile");
    }
}
