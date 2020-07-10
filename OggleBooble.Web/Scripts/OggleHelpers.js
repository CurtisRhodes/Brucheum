
function fireAndForget(requestType, url) {
    $.ajax({
        type: requestType,
        url: settingsArray.ApiServer + url,
        success: function (successModel) {
            if (successModel.Success === "ok") {
                window.localStorage["userPermissons"] = successModel.ReturnValue;
                displayStatusMessage("ok", "user settings updated");
            }
            else {
                if (document.domain === "localHost")
                    alert("JQA error in setUserSettings: " + success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: success,
                        PageId: 555,
                        CalledFrom: "setUserSettings"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404()) {
                if (document.domain === "localHost")
                    alert("setUserSettings XHR: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        PageId: 555,
                        CalledFrom: "setUserSettings"
                    });
                //sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take + "  Message: " + errorMessage);
            }
        }
    });
}