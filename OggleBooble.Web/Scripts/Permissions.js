
function isInRole(roleName) {
    try {
        if (isNullorUndefined(window.localStorage["userRole"])) {
            const visitorId = getCookieValue("VisitorId");
            if (isNullorUndefined(visitorId))
                window.localStorage["userRole"] = "no";
            else
                window.localStorage["userRole"] = "normal";
            console.log("low role added to localstorage");
        }
        let userRole = window.localStorage["userRole"];
        if (userRole === "admin")
            return true;
        if (userRole === roleName)
            return true;
    } catch (e) { logError("BUG", 3908, e, "isInRole"); }
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
    var userNameExist = true;
    if (isNullorUndefined(getCookieValue("UserName")))
        userNameExist = false;
    return userNameExist;
}

function getUserSettings(visitorId) {
    try {
        //alert("who goes here?");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/OggleUser/GetUserSettings?visitorId=" + visitorId,
            success: function (successModel) {
                if (successModel.Success === "ok") {

                    let userSettings = JSON.stringify(successModel.ReturnValue);




                    // console.log("userSettings data loaded into local storage");

                }
                else
                    logError("BUG", 3098, successModel.Success, "getUserSettings");
            },
            error: function (jqXHR) {
                if (!checkFor404("getUserSettings"))
                    logError("XHR", 3908, getXHRErrorDetails(jqXHR), "getUserSettings");
            }
        });
    } catch (e) {
        logError("BUG", 3908, e, "getUserSettings");
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
                    logError("BUG", 3908, successModel.Success, "updateUserSettings");
            },
            error: function (jqXHR) {
                if (!checkFor404("updateUserSettings"))
                    logError("XHR", 3908, getXHRErrorDetails(jqXHR), "updateUserSettings");
            }
        });
    } catch (e) {
        logError("BUG", 3908, e, "updateUserSettings");
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