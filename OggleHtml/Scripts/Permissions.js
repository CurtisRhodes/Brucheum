function isInRole(roleName) {

    if (isNullorUndefined(roleName)) {
        alert("isInRole called with NullorUndefined roleName");
        //alert("isInRole roleName: " + roleName);
        console.error("isInRole called with NullorUndefined roleName");
        return false;
    }

    if (!isLoggedIn()) {
       // alert("not logged in");
        return false;
    }
    
    var userpermissons = window.localStorage["userPermissons"];
    if (!isNullorUndefined(userpermissons)) {


        //alert("!isNullorUndefined(userpermissons)");
        return isInRoleStep2(userpermissons, roleName);
    }


    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Roles/GetUserRoles?userName=" + getCookieValue("UserName") + "&whichType=Assigned",
        success: function (roleModel) {
            if (roleModel.Success === "ok") {
                var userPermissons = [];
                $.each(roleModel.RoleNames, function (idx, roleName) {
                    userPermissons.push(roleName);
                });
                //if (document.domain === 'localhost') alert("set user roles for " + userName + ". " + roleModel.RoleNames.length + " added");
                window.localStorage["userPermissons"] = userPermissons;
                return isInRoleStep2(userpermissons, roleName);
            }
            else {
                if (document.domain === 'localhost') alert("ERROR IN Permissions.js GetUserRoles" +
                    "\napi/Roles/GetUserRoles?userName=" + userName + "\nwhichType=Assigned" +
                    "\nMessage: " + roleModel.Success);
                else {
                    sendEmailToYourself("ERROR IN Permissions.js GetUserRoles",
                        "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                        " Message: " + roleModel.Success);
                }
                return false;
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getUserPermissions()")) {
                sendEmailToYourself("XHR ERROR IN Login.js getUserPermissions()", "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                    " Message: " + errorMessage);
                if (document.domain === 'localhost') alert("XHR error in getUserPermissions(): " + errorMessage);
            }
            return false;
        }
    });
}

function isInRoleStep2(userPermissons, roleName) {
    //alert("isInRoleStep2  \nuserpermissons: " + userPermissons + "\nroleName: " + roleName);
    if (isNullorUndefined(roleName)) {
        if (document.domain === 'localhost') alert("ERROR IN isInRoleStep2\nroleName not working");
        else {
            //sendEmailToYourself("ERROR IN isInRoleStep2", "roleName not working");
            alert("roleName not working");
        }
        return false;
    }
    if (isNullorUndefined(userPermissons)) {
        if (document.domain === 'localhost') alert("ERROR IN isInRoleStep2\nuserpermissons[] not working");
        //else sendEmailToYourself("ERROR IN isInRoleStep2", "userpermissons[] not working");
        return false;
    }

    var permissonsItems = userPermissons.split(",");
    for (var i = 0; i < permissonsItems.length; i++) {
        //if (document.domain === 'localhost') alert("role found: " + permissonsItems[i]);
        if (permissonsItems[i] === "Oggle admin") {
            //if (document.domain === 'localhost') alert("admin override");
            return true;
        }
        if (permissonsItems[i] === roleName) {
            //if (document.domain === 'localhost') alert("rolename " + roleName + " FOUND!");
            return true;
        }
    }
    if (document.domain === 'localhost') alert("rolename " + roleName + " not found ");
    return false;
}

function isLoggedIn() {
    var userNameExist = true;
    if (isNullorUndefined(getCookieValue("UserName")))
        userNameExist = false;
    //alert("isLoggedIn: " + userNameExist);
    return userNameExist;
}