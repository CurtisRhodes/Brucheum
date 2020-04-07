function isInRole(roleName) {

    if (isNullorUndefined(roleName)) {
        //if (document.domain === 'localhost') alert("isInRole roleName: " + roleName);
        console.error("isInRole called with NullorUndefined roleName");
        return false;
    }

    if (!isLoggedIn()) {
        //if (document.domain === 'localhost') alert("not logged in");
        return false;
    }
    
    var userpermissons = window.localStorage["userPermissons"];
    if (!isNullorUndefined(userpermissons)) {
        // if (document.domain === 'localhost') alert("already have userPermissions in local storage");
        console.log("already have userPermissions in local storage");
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
                //if (document.domain === 'localhost') alert("set user roles for " + getCookieValue("UserName") + ". " + roleModel.RoleNames.length + " added");
                window.localStorage["userPermissons"] = userPermissons;
                return isInRoleStep2(userPermissons, roleName);
            }
            else {
                //if (document.domain === 'localhost')
                //    alert("ERROR IN Permissions.js GetUserRoles" +
                //        "\napi/Roles/GetUserRoles?userName=" + getCookieValue("UserName") + "\nwhichType=Assigned" +
                //        "\nMessage: " + roleModel.Success);
                //else {
                //    sendEmailToYourself("ERROR IN Permissions.js GetUserRoles",
                //        "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                //        " Message: " + roleModel.Success);
                //}
                return false;
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getUserPermissions()")) {
                sendEmailToYourself("XHR ERROR IN Login.js getUserPermissions()", "api/Roles/GetUserRoles?userName=" + getCookieValue("UserName") + "&whichType=Assigned" +
                    " Message: " + errorMessage);
                if (document.domain === 'localhost') alert("XHR error in getUserPermissions(): " + errorMessage);
            }
            return false;
        }
    });
}

function isInRoleStep2(userPermissons, roleName) {
    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("isInRoleStep2  \nuserpermissons: " + userPermissons + "\nroleName: " + roleName);

    if (isNullorUndefined(roleName)) {
        if (getCookieValue("IpAddress") === "68.203.90.183") alert("ERROR IN isInRoleStep2\nroleName not working");
        else {
            //sendEmailToYourself("ERROR IN isInRoleStep2", "roleName not working");
            if (document.domain === 'localhost')
                alert("roleName not working");
        }
        return false;
    }
    if (isNullorUndefined(userPermissons)) {
        if (getCookieValue("IpAddress") === "68.203.90.183") alert("ERROR IN isInRoleStep2 userPermissons: " + userPermissons);
        //else sendEmailToYourself("ERROR IN isInRoleStep2", "userpermissons[] not working");
        return false;
    }

    var permissonsItems = userPermissons.split(",");
    for (var i = 0; i < permissonsItems.length; i++) {
        //if (document.domain === 'localhost') alert("role found: " + permissonsItems[i]);
        if (permissonsItems[i] === "Oggle admin") {
            //if (getCookieValue("IpAddress") === "68.203.90.183") alert("admin override");
            return true;
        }
        if (permissonsItems[i] === roleName) {
            //if (document.domain === 'localhost') alert("rolename " + roleName + " FOUND!");
            return true;
        }
    }
    //if (getCookieValue("IpAddress") === "68.203.90.183") alert("rolename " + roleName + " not found ");
    return false;
}

function isLoggedIn() {
    var userNameExist = true;
    if (isNullorUndefined(getCookieValue("UserName")))
        userNameExist = false;
    //alert("isLoggedIn: " + userNameExist);
    return userNameExist;
}