let connectionVerified = false;

function checkFor404(errMsg, folderId, calledFrom) {
    try {
        //if (document.domain == "localhost") alert("XHR error: " + errMsg + " caught: " + errMsg.indexOf("Verify Network") > 0);
        if (errMsg.indexOf("Not connect") > -1) {
            //logError("CKE", folderId, errMsg, calledFrom);
            checkConnection(folderId, calledFrom);
            return true;
        }
        else {
            logError("CKE", folderId, errMsg, calledFrom);
            return false;
        }
    } catch (e) {
        //alert("404: " + e);
        return true;
    }
}

function checkConnection(subdomain, calledFrom) {
    //changeFavoriteIcon("loading");
    let dots = "";
    let getXMLsettingsWaiter = setInterval(function () {
        //document.title = "loading settings : Brucheum";
        if (settingsArray.ApiServer === undefined) {
            dots += "~ ";
            $('#dots').html(dots);
        }
        else {
            clearInterval(getXMLsettingsWaiter);
            let verifyConnectionCount = 0, verifyConnectionAvailable = true;
            let connectingToServerImgShowing = false, canIgetaConnectionImgShowing = false;
            //document.title = "connecting : Brucheum";
            connectionVerified = false;
            let verifyConnectionWaiter = setInterval(function () {
                if (connectionVerified) {
                    changeFavoriteIcon("default");
                    //document.title = "welcome : Brucheum";
                    clearInterval(verifyConnectionWaiter);
                    $('#dots').html('');
                    console.log("connection verified after: " + verifyConnectionCount);
                    $('#headerMessage').html("");
                }
                else {
                    dots += ". ";
                    $('#dots').html(dots);
                    $('#headerMessage').html(++verifyConnectionCount);
                    //if (verifyConnectionAvailable)
                    {
                        verifyConnectionAvailable = false;
                        if (!connectingToServerImgShowing && verifyConnectionCount > 8) {
                            $('#customMessage').html("<div id='launchingServiceGif' class='launchingServiceContainer'>" +
                                "<img src='Images/tenor02.gif' height='300' /></div>\n").show();
                            $('#customMessageContainer').css("top", 200).css("left", 500).show();
                            console.log("showing connectingToServerGif");
                            connectingToServerImgShowing = true;
                        }
                        if (!canIgetaConnectionImgShowing && verifyConnectionCount > 22) {
                            $('#customMessage').html(
                                "<div class='shaddowBorder'>" +
                                "   <img src='/Images/canIgetaConnection.gif' height='230' >\n" +
                                "   <div class='divRefreshPage' onclick='window.location.reload(true)'>Thanks GoDaddy. Refresh Page</a></div>" +
                                "</div>").show();
                            console.log("canIgetaConnection message showing");
                            logError("404", 3910, "SERVICE DOWN", calledFrom);
                            canIgetaConnectionImgShowing = true;
                        }
                        $.ajax({
                            type: "GET",
                            url: settingsArray.ApiServer + "api/Common/VerifyConnection",
                            success: function (success) {
                                console.log("GET VerifyConnection: " + verifyConnectionCount);
                                if (success == "ok") {
                                    connectionVerified = true;
                                    $('#customMessage').hide();
                                    canIgetaConnectionMessageShowing = false;
                                    launchingServiceGifShowing = false;
                                    verifyConnectionAvailable = true;
                                }
                                else {
                                    $('#dots').html('');
                                    clearInterval(verifyConnectionWaiter);
                                    console.log("proper error in verify ConnectionFunction: " + successModel.Success);
                                    logError("AJX", folderId, "proper error in verify ConnectionFunction", calledFrom);
                                    if (document.domain === "localhost") alert("proper error in verify ConnectionFunction: " + successModel.Success);
                                }
                            },
                            error: function (jqXHR) {
                                clearInterval(verifyConnectionWaiter);
                                let errMsg = getXHRErrorDetails(jqXHR);
                                if (document.domain === "localhost") alert("verifyConnection XHR: " + errMsg);
                            }
                        });
                    }
                }
            }, 550);
        }
    }, 300);
}
