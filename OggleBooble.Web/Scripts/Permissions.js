
function isInRole(roleName) {
    let visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId))
        return false;

    if (getCookieValue("IsLoggedIn") === "false") {
        console.log("not logged in");
        return false;
    }

    let userRoles = window.localStorage["userRoles"];
    if (isNullorUndefined(userRoles)) {
        // try to load from database
        return getUserSettingsAndContinue("isInRole")
        //console.log("loping from isInRole to loadRolesIntoLocalStorage");
        //loadRolesIntoLocalStorage("isInRole", roleName);
        //return false;
    }
    else {
        // pull roll out of local storage
        alert("userPermissons: " + userRoles);
    }
}

function isLoggedIn() {
    var userNameExist = true;
    if (isNullorUndefined(getCookieValue("UserName")))
        userNameExist = false;
    return userNameExist;
}

function getUserSettingsAndContinue(calledFrom) {
    visitorId = getCookieValue("VisitorId");
    if (isNullorUndefined(visitorId))
        return false;

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/UserSettings/Get?visitorId=" + getCookieValue("VisitorId"),
        success: function (successModel) {
            if (successModel.Success === "ok") {

                // alert("TODO load user settings into local storage");

                //var userPermissons = [];
                //$.each(roleModel.RoleNames, function (idx, roleName) {
                //    userPermissons.push(roleName);
                //});
                ////if (document.domain === 'localhost') alert("set user roles for " + getCookieValue("UserName") + ". " + roleModel.RoleNames.length + " added");
                //window.localStorage["userPermissons"] = userPermissons;


                if (calledFrom === "isInRole") {

                    let roleSettings = jsonResults.First()["UserRoles"];

                    if (isNullorUndefined(roleSettings))
                        return false;
                }
                if (calledFrom === "carousel") {
                    let roleSettings = jsonResults.First()["CarouselSettings"];
                    alert("carouselSettings: " + JSON.stringify(carouselSettings));
                    if (isNullorUndefined(roleSettings))
                        return false;
                }

                //window.localStorage["carouselSettings"] = JSON.stringify(carouselSettings);
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

function loadUserSettingsIntoLocalStorage(usersetting) {


    //if (!isNullorUndefined(window.localStorage["userPermissons"])) {
    //    if (calledFrom === "isInRole") {
    //        console.error("userPermissons already in local storage");
    //        return;
    //    }
    //}

    //permissonsItems = userPermissons.split(",");
    //for (var i = 0; i < permissonsItems.length; i++) {
    //    if (permissonsItems[i] === "Oggle admin") {
    //        //console.log("admin override");
    //        return true;
    //    }
    //    if (permissonsItems[i] === roleName) {
    //        console.log("rolename " + roleName + " FOUND!");
    //        //if (document.domain === 'localhost') alert("rolename " + roleName + " FOUND!");
    //        return true;
    //    }
    //    //else
    //    //    console.log("rolename " + roleName + " not found ");
    //}
    //logError({
    //    VisitorId: getCookieValue("VisiorId"),
    //    ActivityCode: "017",
    //    Severity: 1,
    //    ErrorMessage: "cookieFail userName",
    //    CalledFrom: "isInRole()"
    //});
    //return false;
}
function updateUserSettings(visitorId, settingName, settingJson) {
    // merge json string (in api);
    //alert("updateUserSettings(userName: " + userName + ", settingName: " + settingName + "\n settingJson: " + settingJson);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/UserSettings/GetUserSettings?visitorId=" + visitorId,
        success: function (successModel) {
            if (successModel.Success === "ok") {

                let savedSettings = successModel.ReturnValue

                if (!isNullorUndefined(savedSettings)) {
                    savedSettings = JSON.stringify(savedSettings);

                }

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



    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/EntityAttribute/Update?visitorId=" + visitorId + "&settingName=" + settingName + "&settingJson=" + settingJson,
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
