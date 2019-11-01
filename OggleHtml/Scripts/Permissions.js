
function setUserPermissions() {

    var userName = getCookieValue("UserName");
    if (isNullorUndefined(userName)) {
        permissionsSet = true;
        //if (document.domain === 'localhost') alert("unable to set User Permissions.   UserName isNullorUndefined");
        return;
    }

    var userPermissons = window.localStorage["userPermissons"];
    //if (!isNullorUndefined(userPermissons)) { if (document.domain === 'localhost') alert("setUserPermissions(). Userpermissons[] found"); }

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned",
        success: function (roleModel) {
            if (roleModel.Success === "ok") {
                userPermissons = [];
                $.each(roleModel.RoleNames, function (idx, roleName) {
                    userPermissons.push(roleName);
                });
                //if (document.domain === 'localhost') alert("set user roles for " + userName + ". " + roleModel.RoleNames.length + " added");
                window.localStorage["userPermissons"] = userPermissons;
                permissionsSet = true;
            }
            else {
                sendEmailToYourself("ERROR IN Permissions.js GetUserRoles",
                    "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                    " Message: " + errorMessage);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "setUserPermissions()")) {
                sendEmailToYourself("XHR ERROR IN Login.js setUserPermissions()", "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                    " Message: " + errorMessage);
            }
            if (document.domain === 'localhost') alert("loadUserRoles XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function isInRole(roleName) {

    var userName = getCookieValue("UserName");
    if (isNullorUndefined(userName)) {
        return false;
    }
    var userpermissons = window.localStorage["userPermissons"];
    if (isNullorUndefined(userpermissons)) {
        //if (document.domain === 'localhost') alert("userpermissons not FOUND! Calling setUserPermissions()");
        setUserPermissions(roleName);
    }
    //if (document.domain === 'localhost') alert("userName: [" + userName + "] having role: [" + roleName + "] searched for");
    var permissonsItems = userpermissons.split(",");
    for (var i = 0; i < permissonsItems.length; i++) {
        if (permissonsItems[i] === roleName) {
            //if (document.domain === 'localhost') alert("rolename " + roleName + " FOUND! for: " + userName);
            return true;
        }
    }
    if (document.domain === 'localhost') alert("rolename " + roleName + " not found for: " + userName);
    return false;
}
