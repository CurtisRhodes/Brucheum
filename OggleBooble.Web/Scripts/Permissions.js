﻿
function isInRole(roleName) {
    try {
        //console.log("calling getUserInfo from isInRole")
        //if (document.domain === 'localhost') return true;

        if (!globalIsLoggedIn) {
            console.log("isInRole not logged in");
            roleName = "not registered";
        }
        if (roleName == "not registered") return false;

        if (isNullorUndefined(globalVisitorId)) {
            console.log("visitorId undefined in isInRole")
            return false;
        }

        if (isNullorUndefined(window.localStorage["userRole"])) {
            console.log("calling getUserInfo from isInRole")
            getUserInfo("isInRole", roleName);
        }
        else {
            let userRole = window.localStorage["userRole"];
            console.log("userRole from localStorage: " + userRole + " for visitorId: " + visitorId);
            if (userRole === "admin") return true;
            if (userRole === roleName)
                return true;
        }
    }
    catch (e) { logError("CAT", 3908, e, "isInRole"); }
}

function getUserRole() {

    if (document.domain === 'localhost') return "admin";

    if (!isNullorUndefined(window.localStorage["userRole"]))
        return window.localStorage["userRole"];

    const visitorId = globalVisitorId;
    if (isNullorUndefined(visitorId)) {
        window.localStorage["userRole"] = "not registered";
        return window.localStorage["userRole"];
    }
    getUserInfo("getUserRole", details);
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
    alert("who is calling this?");
    return globalIsLoggedIn;
}

function getUserInfo(valueRequested, details) {
    try {
        let visitorId = globalVisitorId;
        if (isNullorUndefined(visitorId)) {
            logError("BUG", 1, "I thought visitorId had been tested", "getUserInfo");
        }
        else {
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Login/GetUserInfo?visitorId=" + visitorId,
                success: function (userInfoModel) {
                    if (userInfoModel.Success === "ok") {
                        if (isNullorUndefined(window.localStorage["userRole"]))
                            window.localStorage["userRole"] = userInfoModel.UserRole;
                    }
                    else {
                        if (userInfoModel.Success == "not registered") {
                            window.localStorage["userRole"] = "not registered";
                        }
                        else
                            logError("AJX", 2, userInfoModel.Success + ". visitorId: " + visitorId, "getUserInfo(permissions)");
                    }
                    if (valueRequested == "isInRole") {
                        isInRole(details)
                    }
                    if (valueRequested == "getUserRole") {
                        getUserRole();
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, folderId, "getUserInfo")) logError("XHR", 3907, errMsg, "getUserInfo");
                }
            });
        }
    } catch (e) {
        logError("CAT", 3908, e, "getUserInfo");
    }
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