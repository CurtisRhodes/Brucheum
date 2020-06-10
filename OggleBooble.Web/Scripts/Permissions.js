
function isInRole(roleName) {
    if (isNullorUndefined(settingsArray.ApiServer)) {
        //console.log("isInRole settingsArray.ApiServer not defined. Looking for: " + roleName);
        //alert("isInRole settingsArray.ApiServer not defined. Looking for: " + roleName);
        return false;
    }
    if (isNullorUndefined(roleName)) {
        //if (document.domain === 'localhost') alert("isInRole roleName: " + roleName);
        console.error("isInRole called with NullorUndefined roleName");
        return false;
    }

    if (getCookieValue("IsLoggedIn") === "false") {
        //if (document.domain === 'localhost') alert("not logged in");
        console.log("isInRole say not logged in");
        return false;
    }

    var userPermissons = window.localStorage["userPermissons"];
    if (isNullorUndefined(userPermissons)) {
        console.log("loping from isInRole to loadRolesIntoLocalStorage");
        loadRolesIntoLocalStorage("isInRole", roleName);
        return false;
    }
    permissonsItems = userPermissons.split(",");
    for (var i = 0; i < permissonsItems.length; i++) {
        if (permissonsItems[i] === "Oggle admin") {
            //console.log("admin override");
            return true;
        }
        if (permissonsItems[i] === roleName) {
            console.log("rolename " + roleName + " FOUND!");
            //if (document.domain === 'localhost') alert("rolename " + roleName + " FOUND!");
            return true;
        }
        //else
        //    console.log("rolename " + roleName + " not found ");
    }

    var userName = getCookieValue("UserName");

    if (isNullorUndefined(userName)) {
        logError({
            VisitorId: getCookieValue("VisiorId"),
            ActivityCode: "017",
            Severity: 1,
            ErrorMessage: "cookieFail userName",
            CalledFrom: "isInRole()"
        });
        return false;
    }

}
function loadRolesIntoLocalStorage(calledFrom, roleName) {
    if (!isNullorUndefined(window.localStorage["userPermissons"])) {
        if (calledFrom === "isInRole") {
            console.error("userPermissons already in local storage");
            return;
        }
    }
    var userName = getCookieValue("UserName");
    if (!isNullorUndefined(userName)) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Roles/GetUserRoles?userName=" + userName + "&roleType=Assigned",
            success: function (roleModel) {
                if (roleModel.Success === "ok") {
                    var userPermissons = [];
                    $.each(roleModel.RoleNames, function (idx, roleName) {
                        userPermissons.push(roleName);
                    });
                    //if (document.domain === 'localhost') alert("set user roles for " + getCookieValue("UserName") + ". " + roleModel.RoleNames.length + " added");
                    window.localStorage["userPermissons"] = userPermissons;

                    if (calledFrom === "")
                        return isInRole(roleName);
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "ERR",
                        Severity: 1,
                        ErrorMessage: roleModel.Success,
                        CalledFrom: "loadRolesIntoLocalStorage"
                    });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getUserPermissions()")) {
                    logError({
                        VisitorId: getCookieValue("VisiorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        CalledFrom: "loadRolesIntoLocalStorage"
                    });
                    if (document.domain === 'localhost') alert("XHR error in getUserPermissions(): " + errorMessage);
                }
                return false;
            }
        });
    }
}

function isLoggedIn() {
    var userNameExist = true;
    if (isNullorUndefined(getCookieValue("UserName")))
        userNameExist = false;
    return userNameExist;
}

function getUserSettings() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/UserSettings/Get?visitorId=" + getCookieValue("VisitorId"),
        success: function (successModel) {
            if (successModel.Success === "ok") {


                //let jsonResults = successModel.ReturnValue.Children();


                let carouselSettings = jsonResults.First()["CarouselSettings"];

                alert("carouselSettings: " + JSON.stringify(carouselSettings));

                window.localStorage["carouselSettings"] = JSON.stringify(carouselSettings);
                //var settingsJson = json.pa successModel.ReturnValue
                //window.localStorage["userPreferences"] = successModel.ReturnValue;
                //let jsonstring = JSON.parse(successModel);
            }
            else {                
                if (document.domain === "localHost") 
                    alert("JQA error in getUserSettings: " + successModel.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: successModel.Success,
                        PageId: 555,
                        CalledFrom: "getUserSettings"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404()) {
                if (document.domain === "localHost")
                    alert("getUserSettings: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 1,
                        ErrorMessage: errorMessage,
                        PageId: 555,
                        CalledFrom: "getUserSettings"
                    });
                //sendEmailToYourself("XHR ERROR IN Carousel.JS loadImages", "api/Carousel/GetLinks?root=" + rootFolder + "&skip=" + skip + "&take=" + take + "  Message: " + errorMessage);
            }
        }
    });
}

function updateUserSettings(userName, settingName, settingJson) {
    // merge json string (in api);

    alert("updateUserSettings(userName: " + userName + ", settingName: " + settingName + "\n settingJson: " + settingJson);

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/EntityAttribute/Update?userName=" + userName + "&settingName=" + settingName + "&settingJson=" + settingJson,
        success: function (successModel) {
            if (successModel.Success  === "ok") {
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
