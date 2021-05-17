
function verifyVisitorId(folderId, calledFrom) {
    try {
        //logActivity("VV0", folderId, calledFrom);

        if (isNullorUndefined(localStorage["VisitorId"])) {
            logActivity("VV2", folderId, "verifyVisitorId/" + calledFrom);
            getIpInfo(folderId, "verifyVisitorId/" + calledFrom);
            return;
        }

        if (localStorage["VisitorId"] == "unset") {
            logActivity("VV3", folderId, "verifyVisitorId/" + calledFrom);
            getIpInfo(folderId, "verifyVisitorId/" + calledFrom);
            return;
        }

        if (isNullorUndefined(sessionStorage["VisitorVerified"])) {
            $('#headerMessage').html("new session started");
            if ((localStorage["VisitorId"].length == 36) || (localStorage["VisitorId"].indexOf("failedGetIpInfo") > -1)) {
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/Visitor/VerifyVisitor?visitorId=" + localStorage["VisitorId"],
                    success: function (success) {
                        if (success == "ok") {
                            sessionStorage["VisitorVerified"] = "true";
                            logActivity("VV1", folderId, calledFrom);
                            loadUserProfile("verify visitor");
                            logVisit(folderId, "verify visitor");
                            console.log("visitor verified: " + localStorage["VisitorId"]);
                        }
                        else {  // visitorId not found
                            logActivity("VV7", folderId, "verifyVisitor/" + calledFrom);
                            //logError("BUG", folderId, "visitorId not found: " + localStorage["VisitorId"], "verifyVisitor/" + calledFrom);
                            console.log("visitorId not found: " + localStorage["VisitorId"] + "  calling getIpInfo");
                            getIpInfo(folderId, "verifyVisitorId/" + calledFrom);
                        }
                    },
                    error: function (jqXHR) {
                        //if (!checkFor404(errMsg, visitorData.FolderId, "getIpInfo/" + calledFrom)) {
                        logActivity("VV6", folderId, "verifyVisitor/" + calledFrom);
                        logError("XHR", folderId, errMsg, "verifyVisitor/" + calledFrom);
                    }
                });
            }
            else {
                logActivity("VV4", folderId, "verifyVisitor/" + calledFrom);
                logError("BUG", folderId, "susspiciosus visitorId: " + localStorage["VisitorId"], "verifyVisitor/" + calledFrom);
            }
        }
    }
    catch (e) {
        logActivity("VV5", folderId, "verifyVisitor/" + calledFrom);
        logError("CAT", folderId, e, "verifyVisitor/" + calledFrom);
        if (document.domain === 'localhost') alert("Catch error in verifyVisitorId!!: " + e);
    }
}

function addVisitor(visitorData) {
    try
    {
        logActivity("AV0", visitorData.FolderId, "addVisitor/" + visitorData.CalledFrom); // calling AddVisitor 

        visitorData.VisitorId = create_UUID();
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
                            if (visitorData.CalledFrom.EndsWith("logStatic PageHit")) {
                                logStaticPageHit(visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);
                            }
                            break;
                        case "existing Ip":
                            logActivity("AV5", visitorData.FolderId, "addVisitor" + "/" + visitorData.CalledFrom);  // existing IP visitorId used
                            /// 5/14/2021
                            localStorage["VisitorId"] = visitorData.VisitorId;
                            // logIpHit(visitorData.VisitorId, visitorData.IpAddress, visitorData.FolderId);
                            if (visitorData.CalledFrom.EndsWith("logStatic PageHit"))
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
