var selectedRoleName = "";
var selectedUserName = "";

function loadUsers() {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/GetUsers",
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
                    alert("loadUsers: " + usersModel.Success);
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "loadUsers")) {
                    sendEmailToYourself("XHR ERROR IN Admin.JS loadImages", "api/Login/GetUsers Message: " + errorMessage);
                }
            }
        });
    } catch (e) { alert("catch: " + e); }
}

function loadAllUserRoles() {
    try {
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
                    sendEmailToYourself("XHR ERROR IN Admin.JS loadAllUserRoles", "api/Roles/GetRoles Message: " + roleModel.Success);
                    //alert("loadAllUserRoles: " + roleModel.Success);
}
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "loadAllUserRoles")) {
                    sendEmailToYourself("XHR ERROR IN Admin.JS loadAllUserRoles", "api/Login/GetUsers Message: " + errorMessage);
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
                    sendEmailToYourself("ERROR in loadUserRoles", "roleModel.Success: " + roleModel.Success);
                    if (document.domain === 'localhost')
                        alert("ERROR in loadUserRoles: " + roleModel.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "loadUserRoles")) {
                    sendEmailToYourself("XHR ERROR IN loadUserRoles", "api/Roles/GetUserRoles?userName=" + selectedUserName + "&whichType=" + whichType + " Message: " + errorMessage);
                }
            }
        });
    } catch (e) {
        //displayStatusMessage("error", "catch ERROR: " +e);
        sendEmailToYourself("Catch ERROR IN Admin.JS loadUserRoles", "api/Roles/GetUserRoles?userName=" + selectedUserName + "&whichType=" + whichType + " Message: " + e);
        alert("catch: " + e);
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
                    alert("remove: " + success);
                    //displayStatusMessage("error", "ERROR: " + success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "RemoveUserRole")) {
                    sendEmailToYourself("XHR ERROR IN Admin.JS loadAllUserRoles", "api/Login/GetUsers Message: " + errorMessage);
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
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "loadAaddEditRoles")) {
                    sendEmailToYourself("XHR ERROR IN Admin.JS loadAaddEditRoles", "api/Roles/GetRoles Message: " + errorMessage);
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
                    alert("addRole :" + success);
                    //displayStatusMessage("error", "xhr ERROR: " + success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "addRole")) {
                    sendEmailToYourself("XHR ERROR IN Admin.JS addRole", "api/Roles/AddRole?roleName=" + $('#txtRoleName').val() + " Message: " + errorMessage);
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
                else
                    displayStatusMessage("error", "server ERROR: " + success);
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "updateRole")) {
                    sendEmailToYourself("XHR ERROR IN Admin.JS updateRole", "api/Roles/UpdateRole?roleId=" + roleId + "&newName=" + newName + " Message: " + errorMessage);
                }
            }
        });
    }
    catch (e) {
        alert("updateRole catch: " + e);
    }
}

function repairLinks() {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    $('#repairLinksReport').html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/RepairLinks/RepairLinks/?startFolderId=" + dashboardMainSelectedTreeId + "&drive=XX",
        success: function (repairReport) {
            $('#dashBoardLoadingGif').hide();
            if (repairReport.Success === "ok") {
                try {
                    var delta = Date.now() - start;
                    var minutes = Math.floor(delta / 60000);
                    var seconds = (delta % 60000 / 1000).toFixed(0);
                    //console.log("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                    $('#dataifyInfo').html("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                    $('#dataifyInfo').append(", Rows Processed: " + repairReport.RowsProcessed);
                    if (repairReport.ImagesDownLoaded > 0)
                        $('#dataifyInfo').append(", Images DownLoaded: " + repairReport.ImagesDownLoaded);
                    if (repairReport.LinksEdited > 0)
                        $('#dataifyInfo').append(", links Edited: " + repairReport.LinksEdited);
                    if (repairReport.ImagesRenamed > 0)
                        $('#dataifyInfo').append(", Images Renamed: " + repairReport.ImagesRenamed);
                    if (repairReport.NewLinksAdded > 0)
                        $('#dataifyInfo').append(", New Links Added: " + repairReport.NewLinksAdded);
                    if (repairReport.ImagesMoved > 0)
                        $('#dataifyInfo').append(", Images Moved: " + repairReport.ImagesMoved);
                    if (repairReport.LinksRemoved > 0)
                        $('#dataifyInfo').append(", CatLinks Added: " + repairReport.LinksRemoved);
                    if (repairReport.CatLinksAdded > 0)
                        $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);


                    //$('#dataifyInfo').append(", directory errors: " + repairReport.DirNotFound);
                    //$('#dataifyInfo').append(", bad file names: " + repairReport.BadFileNames);

                    //$('#dataifyInfo').append(", links fixed: " + repairReport.LinksRemoved);
                    //repairReport.MissingImages.forEach(function (element) {
                    //    /// add new link
                    //    $('#repairReport').append("<div> missing image: " + element.Name + "</div>");
                    //});

                    repairReport.Errors.forEach(function (element) {
                        $('#repairLinksReport').append("<div> errors: " + element + "</div>");
                    });

                    //repairReport.BadLinks.forEach(function (element) {
                    //    $('#repairReport').append("<div> bad link: " + element.id + "</div>");
                    //});
                }
                catch (e) {
                    alert("problem displaying repair report: " + e);
                }
            }
            else
                alert("repairLinks: " + repairReport.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("downloadLinks xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

