
function setUserPermissions() {

    var userpermissons = window.localStorage["userPermissons"];
    if (isNullorUndefined(userpermissons)) {
        if (document.domain === 'localhost')  // #DEBUG
            alert("setUserPermissions().  Userpermissons isNullorUndefined");
        userpermissons = [];
        if (isNullorUndefined(getCookieValue("UserName")))
        {
            if (document.domain === 'localhost')  // #DEBUG
                alert("userpermissons   userpermissons.push('not logged in')");

            userpermissons.push("not logged in");
        }
        window.localStorage["userPermissons"] = userpermissons;
        permissionsSet = true;
        return;
    }
    var userName = getCookieValue("UserName");
    if (isNullorUndefined(userName)) {
        if (isNullorUndefined(userpermissons)) {
            //alert("userName isNullorUndefined even after");
            userpermissons = [];
            if (isNullorUndefined(getCookieValue("UserName"))) {

                if (document.domain === 'localhost')  // #DEBUG
                    alert("userName  userpermissons.push('not logged in')");
                userpermissons.push("not logged in");
            }
            window.localStorage["userPermissons"] = userpermissons;
            permissionsSet = true;
            return;
        }
    }

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned",
        success: function (roleModel) {
            if (roleModel.Success === "ok") {

                if (document.domain === 'localhost')  // #DEBUG
                    alert("successfull loaded user permissions for " + userName);

                var userpermissons = [];
                $.each(roleModel.RoleNames, function (idx, roleName) {
                    userpermissons.push(roleName);
                    //if (roleName === "Oggle Add Images") {
                    //    $('.loginRequired').show();
                    //}
                    //if (roleName === "Oggle admin") {
                    //    $('.loginRequired').show();
                    //    $('.adminLevelRequired').show();
                    //}
                });
                window.localStorage["userpermissons"] = userpermissons;
                permissionsSet = true;
            }
            else {
                sendEmailToYourself("ERROR IN Permissions.js GetUserRoles", "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                    " Message: " + errorMessage);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "setUserPermissions()")) {
                sendEmailToYourself("XHR ERROR IN Login.js setUserPermissions()", "api/Roles/GetUserRoles?userName=" + userName + "&whichType=Assigned" +
                    " Message: " + errorMessage);
            }
            if (document.domain === 'localhost')  // #DEBUG
                alert("loadUserRoles XHR error: " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}


function isInRole(roleName) {

    var userpermissons = window.localStorage["userPermissons"];
    //userpermissons.each()
    if (isNullorUndefined(userpermissons)) {
        if (document.domain === 'localhost') {  // #DEBUG
            alert("userpermissons not FOUND! Calling setUserPermissions()");
        }
        setUserPermissions();
        if (roleName === "not logged in")
            return true;
        return false;

    }
    var userName = getCookieValue("UserName");
    if (isNullorUndefined(userName)) {
        if (roleName === "not logged in")
            return true;
        else {
            //if (document.domain === 'localhost') {  // #DEBUG
            //    alert("username undefined. Role: " + roleName + ". Returning false");
            //}
            return false;
        }
    }

    for (var i = 0; i < userpermissons.length; i++) {
        if (userpermissons === roleName) {
            if (document.domain === 'localhost')  // #DEBUG
                alert("rolename " + roleName + " FOUND! for: " + getCookieValue("UserName"));
            return true;
        }
    }

    if (document.domain === 'localhost')  // #DEBUG
        alert("rolename " + roleName + " not found for: " + getCookieValue("UserName"));



    return false;
}
