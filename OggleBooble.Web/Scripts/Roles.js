var selectedRoleName = "";
var selectedUserName = "";

function loadCooseBox(column,option) {
    try {
        if (option === "all users") {
            // all users
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Roles/LoadChooseBox?option=allUsers",
                success: function (usersModel) {
                    if (usersModel.Success === "ok") {
                        $('#ddUsers').html("<option class= 'ddOption' value ='0'>-- select a user --</option >");
                        $.each(usersModel.UserNames, function (idx, userName) {
                            $('#ddUsers').append("<option class='ddOption' value='" + userName + "'>" + userName + "</option>");
                        });

                        $('#ddUsers').change(function () {
                            selectedUserName = $('#ddUsers option:selected').attr("value");
                            loadUserRoles("Available");
                            loadUserRoles("Assigned");
                        });
                    }
                    else
                        if (document.domain === 'localhost')
                            alert("roles/loadCooseBox" + usersModel.Success);
                        else
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "XHR",
                                Severity: 12,
                                ErrorMessage: usersModel.Success,
                                CalledFrom: "roles/loadCooseBox"
                            });
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404("loadUsers")) {
                        if (document.domain === 'localhost')
                            alert("roles/loadCooseBox" + errorMessage);
                        else
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "XHR",
                                Severity: 12,
                                ErrorMessage: errorMessage,
                                CalledFrom: "roles/loadCooseBox"
                            });
                        //sendEmailToYourself("XHR ERROR IN Admin.JS loadImages", "api/Login/GetUsers Message: " + errorMessage);
                    }
                }
            });
        }

        if (column === "left") {
            // all users
        }
        if (column === "right") {
            // all roles
        }

        // $('#divLoadingGif').show();
        $.ajax({
            type: "PATCH",
            url: settingsArray.ApiServer + "api/Roles/GetRoles",
            success: function (roleModel) {
                if (roleModel.Success === "ok") {
                    $('#divChooseAvailable').html("");
                    $.each(roleModel.RoleNames, function (idx, roleName) {
                        $('#divChooseAvailable').append("<div class='chooseAvailableListItem chooseBoxListItem'>" + roleName + "</div>");
                    });
                    $('.availableListBoxItem').click(function () {
                        $('.chooseBoxListItem').removeClass("highlightItem");
                        if (isNullorUndefined(selectedRoleName)) {
                            $(this).addClass('highlightItem');
                            selectedRoleType = "Available";
                            selectedRoleName = $(this).text();
                        }
                        else {
                            if (selectedRoleName === $(this).text()) {
                                selectedRoleName = "";
                                selectedRoleType = "";
                            }
                            else {
                                $(this).addClass("highlightItem");
                                selectedRoleType = "Available";
                                selectedRoleName = $(this).text();
                            }
                        }
                    });
                }
                else {
                    if (document.domain === 'localhost')
                        alert("api/Roles/GetRoles" + roleModel.Success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "AJQ",
                            Severity: 12,
                            ErrorMessage: roleModel.Success,
                            CalledFrom: "api/Roles/GetRoles"
                        });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("loadAllUserRoles")) {
                    if (document.domain === 'localhost')
                        alert("api/Roles/GetRoles" + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "api/Roles/GetRoles"
                        });
                    //sendEmailToYourself("XHR ERROR IN Admin.JS loadAllUserRoles", "api/Login/GetUsers Message: " + errorMessage);
                }
            }
        });
    } catch (e) {
        //displayStatusMessage("error", "catch ERROR: " +e);
        alert("catch: " + e);
    }
}


function loadUserRoles(whichType) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Roles/GetUserRoles?userName=" + selectedUserName + "&whichType=" + whichType,
            success: function (roleModel) {
                if (roleModel.Success === "ok") {
                    if (whichType === "Available") {
                        $('#divChooseAvailable').html("");
                        $.each(roleModel.RoleNames, function (idx, roleName) {
                            $('#divChooseAvailable').append("<div class='chooseAvailableListItem'>" + roleName + "</div>");
                        });
                        $('.chooseAvailableListItem').click(function () {
                            if (selectedRoleName === $(this).text()) {
                                $(this).removeClass('highlightItem');
                                selectedRoleName = "";
                            }
                            else {
                                $('.chooseAvailableListItem').removeClass("highlightItem");
                                $('.chooseAssignedListItem').removeClass("highlightItem");
                                $(this).addClass('highlightItem');
                                selectedRoleName = $(this).text();
                            }
                        });
                    }

                    if (whichType === "Assigned") {
                        $('#divChooseAssigned').html("");
                        $.each(roleModel.RoleNames, function (idx, roleName) {
                            $('#divChooseAssigned').append("<div class='chooseAssignedListItem'>" + roleName + "</div>");
                        });
                        $('.chooseAssignedListItem').click(function () {
                            if (selectedRoleName === $(this).text()) {
                                $(this).removeClass('highlightItem');
                                selectedRoleName = "";
                            }
                            else {
                                $('.chooseAvailableListItem').removeClass("highlightItem");
                                $('.chooseAssignedListItem').removeClass("highlightItem");
                                $(this).addClass('highlightItem');
                                selectedRoleName = $(this).text();
                            }
                        });
                    }
                    //// thanks to hereswhatidid.com/2011/02/using-jquery-to-find-elements-that-contain-a-specific-text-string/
                    //var pickedRoleId = $("#divChooseAvailable div:contains(" + roleName + ")").filter(function ()
                    //{
                    //    return $(this).html() == roleName;
                    //}).attr('Id');
                    //$('div').remove("#" + pickedRoleId);

                }
                else {
                    if (document.domain === 'localhost')
                        alert("api/Roles/loadUserRoles" + roleModel.Success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: roleModel.Success,
                            CalledFrom: "api/Roles/loadUserRoles"
                        });
                    //sendEmailToYourself("ERROR in loadUserRoles", "roleModel.Success: " + roleModel.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("loadUserRoles")) {
                    if (document.domain === 'localhost')
                        alert("api/Roles/loadUserRoles" + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "api/Roles/loadUserRoles"
                        });
                    //sendEmailToYourself("XHR ERROR IN loadUserRoles", "api/Roles/GetUserRoles?userName=" + selectedUserName + "&whichType=" + whichType + " Message: " + errorMessage);
                }
            }
        });
    } catch (e) {
        if (document.domain === 'localhost')
            alert("CAT api/Roles/loadUserRoles" + e);
        else
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CAT",
                Severity: 12,
                ErrorMessage: e,
                CalledFrom: "api/Roles/loadUserRoles"
            });
    }
}

function addUserRole() {
    if (selectedRoleName === "")
        displayStatusMessage("warning", "please select a user");
    else {
        try {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/Roles/AddUserRole?userName=" + selectedUserName + "&roleName=" + selectedRoleName,
                success: function (success) {
                    if (success === "ok") {
                        loadUserRoles("Available");
                        loadUserRoles("Assigned");
                        displayStatusMessage("ok", "User Role [" + selectedRoleName + "] added");
                    }
                    else {
                        //displayStatusMessage("error", "ERROR: " + success);
                        alert("addUserRole: " + success);
                    }
                },
                error: function (xhr) {
                    //displayStatusMessage("error", "error: " + xhr.statusText);
                    alert("addUserRole xhr error: " + xhr.statusText);
                }
            });
        }
        catch (e) {
            alert("addUserRole CATCH error: " + e);
        }
    }
}

function removeUserRole() {
    try {
        $.ajax({
            type: "DELETE",
            url: settingsArray.ApiServer + "api/Roles/RemoveUserRole?userName=" + selectedUserName + "&roleName=" + selectedRoleName,
            success: function (success) {
                if (success === "ok") {
                    loadUserRoles("Available");
                    loadUserRoles("Assigned");
                    displayStatusMessage("ok", "User Role [" + selectedRoleName + "] removed");
                }
                else {
                    alert("Remove UserRole: " + success);
                }
            },
            error: function (xhr) {
                alert("Remove UserRole xhr error: " + xhr.statusText);
            }
        });
    }
    catch (e) {
        alert("Remove UserRole CATCH error: " + e);
    }
}

function RemoveUserRole(selectedUserName, selectedRoleId) {
    try {
        $.ajax({
            type: "DELETE",
            url: settingsArray.ApiServer + "api/Roles/RemoveUserRole?userName=" + selectedUserName + "&roleId=" + selectedRoleId,
            success: function (success) {
                if (success === "ok") {
                    loadRoles();
                    //displayStatusMessage("ok", "Role [" + selectedRoleName + "] Removed");
                }
                else {
                    if (document.domain === 'localhost')
                        alert("RemoveUserRole: " + success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "AJQ",
                            Severity: 12,
                            ErrorMessage: success,
                            CalledFrom: "RemoveUserRole"
                        });
  }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("RemoveUserRole")) {
                    if (document.domain === 'localhost')
                        alert("RemoveUserRole: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "RemoveUserRole"
                        });
                }
            }
        });
    }
    catch (e) {
        alert("RemoveUserRole catch ERROR: " + e);
    }
}

function loadAaddEditRoles() {
    try {
        // $('#divLoadingGif').show();
        $.ajax({
            type: "PATCH",
            url: settingsArray.ApiServer + "api/Roles/GetRoles",
            success: function (roleModel) {
                if (roleModel.Success === "ok") {
                    $('#divRoleList').html("");
                    $.each(roleModel.RoleNames, function (idx, roleName) {
                        $('#divRoleList').append("<div class='chooseBoxListItem'>" + roleName + "</div>");
                    });
                    $('.chooseBoxListItem').click(function () {
                        $('#txtRoleName').val($(this).html());
                        $('#btnAddUpdateRole').text("Edit");
                        $('#btnRoleToggle').show();
                    });
                }
                else
                    alert(roleModel.Success);
                if (document.domain === 'localhost')
                    alert("loadAaddEditRoles: " + roleModel.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: roleModel.Success,
                        CalledFrom: "loadAaddEditRoles"
                    });
},
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("loadAaddEditRoles")) {
                    if (document.domain === 'localhost')
                        alert("loadAaddEditRoles: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "loadAaddEditRoles"
                        });
                }
            }
        });
    } catch (e) {
        //displayStatusMessage("error", "catch ERROR: " +e);
        alert("getRoles catch: " + e);
    }
}

function addUpdateRole() {
    if ($('#btnAddUpdateRole').html() === "Add")
        addRole();
    else
        updateRole();
}

function toggleAddButton() {
    objClassificationRefCode = null;
    $('#btnAddUpdateRole').text("Add");
    $(this).hide();
}

function addRole() {
    try {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Roles/AddRole?roleName=" + $('#txtRoleName').val(),
            success: function (success) {
                if (success === "ok") {
                    $('#txtRoleName').val("");
                    $('#btnAddUpdateRole').text("Add");
                    displayStatusMessage("ok", "Saved");
                    loadAaddEditRoles();
                    $('#btnRoleToggle').hide();
                }
                else {
                    if (document.domain === 'localhost')
                        alert("addRole" + success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: success,
                            CalledFrom: "addRole"
                        });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("addRole")) {
                    if (document.domain === 'localhost')
                        alert("addRole" + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "addRole"
                        });
                }
            }
        });
    }
    catch (e) {
        alert("AddRole catch: " + e);
    }
}

function updateRole(newName) {
    newName = $('#txtRoleName').val();
    try {
        $.ajax({
            url: settingsArray.ApiServer + "api/Roles/UpdateRole?roleId=" + roleId + "&newName=" + newName,
            type: "PUT",
            success: function (success) {
                if (success === "ok") {
                    $('#txtRoleName').val("");
                    $('#btnAddUpdateRole').text("Add");
                    displayStatusMessage("ok", "Updated");
                    getAllRoles();
                    $('#btnRoleToggle').hide();
                }
                else {
                    //displayStatusMessage("error", "server ERROR: " + success);
                    if (document.domain === 'localhost')
                        alert("updateRole" + success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: success,
                            CalledFrom: "updateRole"
                        });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("updateRole")) {
                    if (document.domain === 'localhost')
                        alert("updateRole" + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "updateRole"
                        });
                }
            }
        });
    }
    catch (e) {
        alert("updateRole catch: " + e);
    }
}


