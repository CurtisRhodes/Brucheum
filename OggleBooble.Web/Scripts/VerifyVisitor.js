function verifyVisitor() {
    try {
        //getIpInfo(14, "verify Visitor");
        //return;

        //logActivity("VV0", 333, calledFrom);

        console.log("1 verify visitorId: " + localStorage["VisitorId"]);

        if (isNullorUndefined(localStorage["VisitorId"])) {
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
            $('#badgesContainer').html("new session started");
          if (document.domain == "localhost") alert("new session started");
            $('#headerMessage').html("new session started");
            console.log("2 verify visitorId: " + localStorage["VisitorId"]);
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + localStorage["VisitorId"],
                success: function (success) {
                    if (success == "ok") {
                        logActivity("VV1", 22, "verify Visitor");
                        loadUserProfile(localStorage["VisitorId"], "verify visitor");
                        logVisit(222, "verify visitor");
                        console.log("visitor verified: " + localStorage["VisitorId"]);
                        sessionStorage["VisitorVerified"] = "true";
                    }
                    else {  // visitorId not found
                        logActivity("VV7", 77, "verify Visitor");
                        //logError("BUG", folderId, "visitorId not found: " + localStorage["VisitorId"], "verifyVisitor/" + calledFrom);
                        console.log("visitorId not found: " + localStorage["VisitorId"] + "  calling getIpInfo");
                        getIpInfo(77, "verify Visitor");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    //if (!checkFor404(errMsg, visitorData.FolderId, "getIpInfo/" + calledFrom)) {
                    logActivity("VV6", 666, "verify Visitor");
                    logError("XHR", 666, errMsg, "verify Visitor");
                }
            });
        }
        else
            console.log("visitor verified: " + sessionStorage["VisitorVerified"] + " visitorId: " + localStorage["VisitorId"]);
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
        logActivity("AV0", visitorData.FolderId, "addVisitor/" + visitorData.CalledFrom); // entering Add Visitor 

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Visitor/AddVisitor",
            data: visitorData,
            success: function (avSuccess) {

                logActivity("AV1", visitorData.FolderId, "[" + avSuccess.Success + "]  addVisitor" + "/" + visitorData.CalledFrom); // add visit returned

                if (avSuccess.Success.indexOf("ERROR:") > -1) {
                    logActivity("AV4", visitorData.FolderId, avSuccess.Success);
                    logError("AJ7", visitorData.FolderId, avSuccess.Success, "addVisitor/" + visitorData.CalledFrom);
                }
                else {
                    switch (avSuccess.Success) {
                        case "ok":
                            localStorage["VisitorId"] = visitorData.VisitorId;
                            logActivity("AV3", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom); // new visitor added
                            logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                            console.log("new visitor added");
                            if (visitorData.CalledFrom.endsWith("logStatic PageHit")) {
                                logStaticPageHit(visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);
                            }
                            break;
                        case "existing Ip":

                            logActivity("AV5", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);  // existing IP visitorId used
                            /// 5/14/2021
                            localStorage["VisitorId"] = visitorData.VisitorId;
                            console.log("existing IP assigned: " + localStorage["VisitorId"]);
                            logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                            if (visitorData.CalledFrom.endsWith("logStatic PageHit"))
                                logStaticPageHit(visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);
                            break;
                        default: {
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
                //if (!checkFor404(errMsg, visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom)) {
                logError("XHR", 999, errMsg, "addVisitor");
            }
        });
    } catch (e) {
        logActivity("AV2", 555, "addVisitor"); // add vis catch error
        logError("CAT", 555, e, "addVisitor");
    }
}

function loadUserProfile(visitorId, calledFrom) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/GetVisitorInfo?visitorId=" + visitorId,
            success: function (visitorInfo) {
                if (visitorInfo.Success == "ok") {
                    localStorage["VisitorVerified"] = true;
                    if (visitorInfo.IsRegisteredUser) {
                        localStorage["IsLoggedIn"] = visitorInfo.RegisteredUser.IsLoggedIn;
                        localStorage["UserName"] = visitorInfo.RegisteredUser.UserName;
                        localStorage["UserRole"] = visitorInfo.RegisteredUser.UserRole;

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

                    console.log("loadUserProfile  IsLoggedIn: " + localStorage["IsLoggedIn"] +
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

function getVisitorId(folderId, calledFrom) {
    try {
        if (isNullorUndefined(localStorage["VisitorId"])) {
            //if (document.domain == "localhost") alert("VisitorId undefined");
            //getIpInfo(folderId, calledFrom + "/getVisitorId");
            return "unset";
        }
        if (localStorage["VisitorId"] == "unset") {
            if (document.domain == "localhost") alert("VisitorId unset");
            //getIpInfo(folderId, calledFrom + "/getVisitorId");
            return "unset";
        }
        else
            return localStorage["VisitorId"];

    } catch (e) {
        localStorage["VisitorId"] = "unset";
        logError("CAT", folderId, e, calledFrom + "/getVisitorId");
        if (document.domain == "localhost") alert("Catch error in getVisitorId: " + e);
        return "unset";
    }
}
