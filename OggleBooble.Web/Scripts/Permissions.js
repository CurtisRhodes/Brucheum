
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
        //if (permissonsItems[i] === "Oggle admin") {
        //    console.log("admin override");
        //    return true;
        //}
        if (permissonsItems[i] === roleName) {
            //console.log("rolename " + roleName + " FOUND!");
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

function isLoggedIn() {
    var userNameExist = true;
    if (isNullorUndefined(getCookieValue("UserName")))
        userNameExist = false;
    return userNameExist;
}





