function logError(errorCode, folderId, errorMessage, calledFrom) {
    if (errorCode != "404")
        logError2(getCookieValue("VisitorId"), errorCode, folderId, errorMessage, calledFrom);
}

function logError2(visitorId, errorCode, folderId, errorMessage, calledFrom) {
    if (isNullorUndefined(calledFrom))
        calledFrom = "unknown";

    if (document.domain === 'localhost') {
        console.log(errorCode + " " + folderId + " " + errorMessage + " " + calledFrom);
        //alert("Error " + errorCode + " calledFrom: " + calledFrom + "\nerrorMessage : " + errorMessage);
    }
    else {
        try {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/Common/LogError",
                data: {
                    VisitorId: visitorId,
                    ErrorCode: errorCode,
                    FolderId: folderId,
                    ErrorMessage: errorMessage,
                    CalledFrom: calledFrom
                },
                success: function (success) {
                    if (success === "ok") {
                        //displayStatusMessage("ok", "error message logged");
                        console.log("error message logged.  Called from: " + calledFrom + " message: " + errorMessage);
                    }
                    else {
                        console.error("ajx error in logError!!: " + success + " called from: " + calledFrom + "\nerrorMessage: " + errorMessage);
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, folderId, "logError")) {
                        //logError("XHR", folderId, errMsg, functionName);
                        if (document.domain === 'localhost') alert("XHR error in logError!!: " + "logError");
                    }
                }
            });
        }
        catch (e) {
            if (document.domain === 'localhost') alert("Catch error in logError!!: " + e);
            console.error("Catch error in logError!!: " + e);
        }
    }
}

function logEvent(eventCode, folderId, calledFrom, eventDetails) {
    //if (document.domain === 'localhost')
    //    alert("log Event. eventCode: " + eventCode + "  folderId: " + folderId + " calledFrom: " + calledFrom + "\neventDetails: " + eventDetails);
    if (isNullorUndefined(calledFrom)) {
        if (document.domain === 'localhost')
            alert("log Event. eventCode: " + eventCode + "  folderId: " + folderId + "\neventDetails: " + eventDetails);
        logError("BUG", folderId, "calledFrom isNullorUndefined. event code: " + eventCode, "logEvent");
        calledFrom = "undefined";
    }
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogEvent",
        data: {
            VisitorId: getCookieValue("VisitorId"),
            EventCode: eventCode,
            EventDetail: eventDetails,
            CalledFrom: calledFrom,
            FolderId: folderId
        },
        success: function (success) {
            if (success !== "ok") {
                if (success.indexOf("Duplicate entry") > 0) {
                    // logError("EVD", folderId, "eventCode: " + eventCode, calledFrom + "/log Event");
                }
                else
                    logError("AJE", folderId, eventCode + ": " + success, "log Event/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "log Event")) logError("XHR", folderId, errMsg, "log Event");
        }
    });
}


function logActivity(activityCode, folderId, calledFrom) {
    logActivity2(getCookieValue("VisitorId"), activityCode, folderId, calledFrom);
}

function logActivity2(visitorId, activityCode, folderId, calledFrom) {
    //alert("logActivity(" + activityCode + "," + folderId + ")");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogActivity",
        data: {
            ActivityCode: activityCode,
            FolderId: folderId,
            CalledFrom: calledFrom,
            VisitorId: visitorId,
        },
        success: function (success) {
            if (success === "ok") {
                //  displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
            }
            else {
                if (success.indexOf("Duplicate entry") > 0) {
                    logActivity("DAE", folderId, "log activity/" + calledFrom);
                    //logError2(visitorId, "DUP", folderId, "Duplicate entry: " + activityCode, "log activity/" + calledFrom);
                }
                else
                    logError2(visitorId, "AJX", folderId, activityCode + ": " + success, "log activity/" + calledFrom);
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();

            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "log Activity"))
                logError2(visitorId, "XHR", folderId, errMsg, "log Activity");
        }
    });
}

function logDataActivity(activityModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogDataActivity",
        data: activityModel,
        success: function (success) {
            if (success === "ok") {
                //  displayStatusMessage("ok", "activity" + changeLogModel.Activity + " logged");
            }
            else
                logError("AJX", activityModel.FolderId, success, "logDataActivity");
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "logDataActivity")) logError("XHR", folderId, errMsg, "logDataActivity");
        }
    });
}
