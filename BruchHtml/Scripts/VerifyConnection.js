let connectionVerified = false, canIgetaConnectionMessageShowing = false, verifyConnectionCount = 0, connectingToServerGifShowing = false,
    verifyConnectionCountLimit = 25, verifyConnectionLoop = null, persistConnectionInterval = null;

let verifyConnectionAvailable = true;
function verifyConnectionFunction(calledFrom, folderId) {
    if (connectionVerified)
        return;

    if (verifyConnectionAvailable) {
        verifyConnectionAvailable = false;
        $.ajax({
            type: "GET",
            //headers: { 'Access-Control-Allow-Origin': 'https://ogglebooble.com/' },
            url: settingsArray.ApiServer + "api/Common/VerifyConnection",
            success: function (successModel) {
                console.log("GET VerifyConnection: " + verifyConnectionCount);
                if (successModel.Success == "ok") {
                    if (successModel.ConnectionVerified) {
                        connectionVerified = true;
                        $('#customMessage').hide();
                        canIgetaConnectionMessageShowing = false;
                        launchingServiceGifShowing = false;
                    }
                    else {
                        console.log("success but no verify: " + successModel.Success);
                        if (document.domain === "localhost") alert("proper error in verify ConnectionFunction: " + successModel.Success);
                        connectionVerified = false;
                    }
                }
                else {
                    if (successModel.Success.indexOf("Parameter name: app") > 0) {
                        connectionVerified = false;
                        //console.log("TRAPPED: " + successModel.Success);
                    }
                    else {
                        console.log("proper error in verify ConnectionFunction: " + successModel.Success);
                        logError("AJX", folderId, "proper error in verify ConnectionFunction", calledFrom);
                        if (document.domain === "localhost") alert("proper error in verify ConnectionFunction: " + successModel.Success);
                    }
                }
                verifyConnectionAvailable = true;
            },
            error: function (jqXHR) {
                verifyConnectionAvailable = false;
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = "verifyConnectionFunction"; // arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
                if (document.domain === "localhost") alert("verifyConnection XHR: " + errMsg);
                connectionVerified = false;
            }
        });
    }
}
