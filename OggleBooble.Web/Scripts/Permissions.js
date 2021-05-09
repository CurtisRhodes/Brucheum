function isInRole(roleName, folderId,  calledFrom) {
    try {

        if (isNullorUndefined(localStorage["IsLoggedIn"])) {
            //logError("BUG", 22668, "localStorage[IsLoggedIn] undefined", "isInRole/" + calledFrom);
            loadUserInfoIntoLocalStorage(558, "isInRole/" + calledFrom);
            return false;
        }
        if (!localStorage["UserName"] == "unregistered") {
            return false;
        }

        if (!localStorage["IsLoggedIn"] == "false") {
            //logError("BUG", 30578, "bool false THIS WORKED  localStorage[IsLoggedIn]:" + localStorage["IsLoggedIn"], "isInRole/" + calledFrom);
            return false;
        }

        if (localStorage["UserRole"] == "admin")
            return true;

        if (window.localStorage["UserRole"] == roleName)
            return true;
    }
    catch (e) {
        logError("CAT", 39048, e, "isInRole");
        return false;
    }
}

function resetUserSettings() {
    let jstring1 = "{";
    const dfarray = ["BLG", "IME", "ADD", "ADM", "ROL", "VLV"];
    for (i = 0; i < dfarray.length; i++) {
        jstring1 += "\"" + dfarray[i] + "\": false,";
    }
    window.localStorage["userPermissons"] = jstring1;
    console.log("default user settings loaded");
}

function isLoggedIn() {
    //if (document.domain === 'localhost') return true;
    //alert("who is calling this?");
    return localStorage["IsLoggedIn"] == "true";
}

function updateUserSettings(settingName, settingJson) {
    try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/OggleUser/UpdateUserSettings?visitorId=" + globalVisitorId + "&settingName=" + settingName + "&settingJson=" + settingJson,
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (!isNullorUndefined(successModel.ReturnValue)) {
                        console.log("no user settings found");

                    }
                    else {

                        //window.localStorage["userPermissons"] = successModel.ReturnValue;
                        //displayStatusMessage("ok", "user settings updated");
                    }
                }
                else
                    logError("AJX", 3908, successModel.Success, "updateUserSettings");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "updateUserSettings")) logError("XHR", 3907, errMsg, "updateUserSettings");
            }
        });
    } catch (e) {
        logError("CAT", 3908, e, "updateUserSettings");
    }
}

function loadInitialJson() {
    let test1 = {
        CarouselSettings: {
            includeArchive: false,
            includeCenterfolds: false,
            includePorn: false,
            includeSoftcore: true,
            includeLandscape: true,
            includePortrait: false
        },
        Roles: {
            NewUser: true,
            RestrictedUser: false,
            TrustedUser: false,
            BlogEditor: false,
            ImageEditor: false,
            AddImages: true,
            CopyImages: true,
            Admin: false
        }
    };
    return test1;
}

function loadCarouselSettingsIntoLocalStorage() {
    if (!isNullorUndefined(window.localStorage)) {
        if (isNullorUndefined(window.localStorage["carouselSettings"])) {
            lsCarouselSettings = {
                includeArchive: false,
                includeCenterfolds: false,
                includePorn: false,
                includeSoftcore: true,
                includeLandscape: true,
                includePortrait: false
            };
            window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);
            console.log("default carouselSettings loaded int local storage");
        }
        else {
            console.log("carouselSettings found in local storage!");
        }
    }
    else
        alert("window.localStorage undefined");

    //jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
}

function updateCarouselSettings() {
    let visitorId = globalVisitorId;
    if (isNullorUndefined(visitorId)) {
        displayStatusMessage("warning", "You must be logged in for settings to persist");
    }
    else {
        //let currentCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
        let lsCarouselSettings = {
            includeArchive: $('#ckArchive').prop("checked"),
            includeCenterfolds: $('#ckCenterfold').prop("checked"),
            includePorn: $('#ckPorn').prop("checked"),
            includeSoftcore: $('#ckSofcore').prop("checked"),
            includeLandscape: $('#ckLandscape').prop("checked"),
            includePortrait: $('#ckPortrait').prop("checked")
        };
        window.localStorage["carouselSettings"] = JSON.stringify(lsCarouselSettings);
        console.log("carouselSettings updated in window.localStorage");

        updateUserSettings(visitorId, "CarouselSettings", lsCarouselSettings);

    }
}

function loadUserInfoIntoLocalStorage(folderId, calledFrom) {
    try {
        if (globalVisitorId == "unset") {
            logError("UI1", folderId, "globalVisitorId = unset", "loadUserInfo/" + calledFrom); // globalVisitorId == "unset"
            getIpInfo(folderId, "loadUserInfo/" + calledFrom)
            return;
        }

        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Common/GetVisitorInfo?visitorId=" + globalVisitorId,
            success: function (visitorInfo) {
                if (visitorInfo.Success == "ok") {
                    localStorage["VisitorId"] = globalVisitorId;
                    localStorage["VisitorVerified"] = true;
                    localStorage["IsLoggedIn"] = visitorInfo.IsLoggedIn;
                    localStorage["UserName"] = visitorInfo.UserName;
                    localStorage["UserRole"] = visitorInfo.UserRole;
                    $('#spnUserName').html(localStorage["UserName"]);
                    if (visitorInfo.IsLoggedIn) {
                        $('#optionLoggedIn').show();
                        $('#optionNotLoggedIn').hide();
                    }
                    else {
                        $('#optionLoggedIn').show();
                        $('#optionNotLoggedIn').hide();
                    }
                    if (isInRole("trusted", folderId, "loadUserInfo/" + calledFrom))
                        $('#footerCol5').show();
                    else
                        $('#footerCol5').hide();

                    logActivity("UI2", 4744, "loadUserInfo/" + calledFrom)
                }
                else {
                    logError("AJX", 545, visitorInfo.Success, "loadUserInfo/" + calledFrom);
                }

            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "loadUserInfo")) {
                    logError("XHR", folderId, errMsg, "loadUserInfo");
                }
            }
        });
    } catch (e) {
        logError("CAT", 3908, e, "loadUserInfo/" + calledFrom);
    }
}

function verifyVisitorId(folderId, calledFrom) {
    try {
        //if (!document.cookie) {
        //    logError("VV1", folderId, "not a real problem", "verifyVisitor"); // No document.cookie exists
        //    return;
        //}

        if (isNullorUndefined(localStorage["VisitorId"])) {
            if (globalVisitorId == "unset") {
                logError("VV2", folderId, "sent to getIpInfo", "verifyVisitor"); // visitorId found in local storage
                getIpInfo(folderId, "verifyVisitorId/" + calledFrom);
                return;
            }
            else {
                // no local storage but globalVisitorId set
                // alert("no local storage but globalVisitorId set to: " + globalVisitorId);
                localStorage["VisitorId"] = globalVisitorId;
            }
        }

        if (globalVisitorId == "unset") {
            if (!isNullorUndefined(localStorage["VisitorId"])) {
                globalVisitorId = localStorage["VisitorId"];
                //console.log("globalVisitorId set to: " + localStorage["VisitorId"]);
                //logActivity("GVS", folderId, "verifyVisitorId/" + calledFrom); //  globalVisitorId set to localStorage[VisitorId]
            }
            else {
                logError("VV3", folderId, "not a real problem", "verifyVisitor"); // globalVisitorId = unset and localStorage[VisitorId] undefined
                getIpInfo(folderId, "verifyVisitorId/" + calledFrom);
                return;
            }
        }

        if (globalVisitorId != localStorage["VisitorId"]) {  
            logError("VV4", folderId, "globalVisitorId: " + globalVisitorId + ", localStorage: " + localStorage["VisitorId"], "verifyVisitorId/" + calledFrom);
            return;
        }

        if (isNullorUndefined(localStorage["VisitorVerified"])) {
            loadUserInfoIntoLocalStorage(folderId, "verifyVisitorId/" + calledFrom);
        }
        console.log("visitor verified: " + globalVisitorId);
    }
    catch (e) {
        logError("CAT", folderId, e, "verifyVisitorId/" + calledFrom);
        if (document.domain === 'localhost') alert("Catch error in verifyVisitorId!!: " + e);
        console.error("Catch error in verifyVisitorId!!: " + e);
    }
}
