
function isInRole(roleName) {
    try {
        if (document.domain === 'localhost') return true;
        if (roleName == "not registered") return false;

        const visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
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
            if (userRole === "admin")
                return true;
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

    const visitorId = getCookieValue("VisitorId");
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
    if (document.domain === 'localhost')
        return true;
    var isLoggedIn = getCookieValue("IsLoggedIn");
    return isLoggedIn == "true";
}

function getUserInfo(valueRequested, details) {
    try {
        let visitorId = getCookieValue("VisitorId");
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
                    if (!checkFor404("getUserInfo"))
                        logError("XHR", 1, getXHRErrorDetails(jqXHR), "getUserInfo");
                }
            });
        }
    } catch (e) {
        logError("CAT", 3908, e, "getUserInfo");
    }
}

function updateUserSettings(visitorId, settingName, settingJson) {
    try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/OggleUser/UpdateUserSettings?visitorId=" + visitorId + "&settingName=" + settingName + "&settingJson=" + settingJson,
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
                if (!checkFor404("updateUserSettings"))
                    logError("XHR", 3908, getXHRErrorDetails(jqXHR), "updateUserSettings");
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
    //jsCarouselSettings = JSON.parse(window.localStorage["carouselSettings"]);
}

function updateCarouselSettings() {
    let visitorId = getCookieValue("VisitorId");
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