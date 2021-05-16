function loadUserProfile(calledFrom) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/GetUserInfo?visitorId=" + getVisitorId(22, "load UserProfile"),
            success: function (registeredUser) {
                if (registeredUser.Success == "ok") {

                    //if (calledFrom == "verify visitor") 
                    {
                        localStorage["VisitorVerified"] = "true";
                        sessionStorage["IsLoggedIn"] = registeredUser.UserInfo.IsLoggedIn ?? "true", "false";
                        //alert("IsLoggedIn: " + sessionStorage["IsLoggedIn"]);
                        localStorage["UserName"] = registeredUser.UserInfo.UserName;
                        localStorage["UserRole"] = registeredUser.UserInfo.UserRole;
                    }
                    userProfileData = {
                        VisitorId: registeredUser.VisitorId,
                        UserName: registeredUser.UserName,
                        FirstName: registeredUser.FirstName,
                        LastName: registeredUser.LastName,
                        Email: registeredUser.Email,
                        Status: registeredUser.Status,
                        UserRole: registeredUser.UserRole,
                        UserSettings: registeredUser.UserSettings,
                        UserCredits: registeredUser.UserCredits
                    };

                    if (calledFrom == "") {
                        $('#txtUserProfileName').val(registeredUser.UserName);
                        $('#txtUserProfileFirstName').val(registeredUser.FirstName);
                        $('#txtUserProfileLastName').val(registeredUser.LastName);
                        $('#txtUserProfileEmail').val(registeredUser.Email);
                    }
                }
                else {
                    if (registeredUser.Success == "not registered") {
                        localStorage["UserName"] = "not registered";
                        localStorage["UserRole"] = "not registered";
                    }
                    else {
                        logError("AJX", 0, registeredUser.Success, "load UserProfile");
                        if (document.domain == "localhost") alert("load UserProfile: " + registeredUser.Success);
                    }
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "load UserProfile")) logError("XHR", 0, errMsg, "load UserProfile");
            }
        });
    } catch (e) {
        logError("CAT", 0, e, "load UserProfile");
    }
}

function isInRole(roleName, folderId, calledFrom) {
    try {

        if (isNullorUndefined(localStorage["IsLoggedIn"])) {
            //let visitorId = getVisitorId(folderId, "isInRole/" + calledFrom);
            //logError("BUG", 22668, "localStorage[IsLoggedIn] undefined", "isInRole/" + calledFrom);
            //loadUserProfile("is in role");
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
            url: settingsArray.ApiServer + "api/OggleUser/UpdateUserSettings?visitorId=" + localStorage["VisitorId"] + "&settingName=" + settingName + "&settingJson=" + settingJson,
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
    let visitorId = localStorage["VisitorId"];
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

