var dashboardMainSelectedTreeId = 0;
var dashboardMainSelectedPath = "";

// MENU FUNCTIONS
function setLeftMenu(viewId) {
    $('#headerSubTitle').html(viewId);
    switch (viewId) {
        case "Add Images":
            $('.workAreaContainer').hide();
            $('#divAddImages').show();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='buildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showUpLoadFileDialog()'>Upload a file</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddImageLinkDialog()'>Add Image Link</div>");
            break;
        case "Manage Folders":
            $('.workAreaContainer').hide();
            $('#divAddImages').show();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='buildDirectoryTree()'>ReBuild Dir Tree</div>");

            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#createNewFolderDialog').dialog('open');\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCopyFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#renameFolderCrud').dialog('open');\">Rename Folder</div>");
            break;
        case "Manage Roles":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='showAssignRolesDialog()'>Assign User Roles</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddRolesDialog()'>Edit Roles</div>");
            break;
        case "Reports":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='showPerfMetrics()'>Performance Metrics</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='pageHitReport()'>Page Hit Report</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showEventActivityReport()'>Event Activity</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMostActiveUsersReport()'>Most Active Users</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showLatestImageHitsReport()'>Latest Image Hits</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='FeedbackReport()'>Feedback</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='errorLogReport()'>Error Log</div>");
            break;
        case "Admin":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='buildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddImageLinkDialog()'>Add Image Link</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCreateStaticPagesDialog()'>Create Static Pages</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showRepairLinksDialog()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>");

            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCreateNewFolderDialog()';\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCopyFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showRenameFolderDialog()'>Rename Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveManyTool();'>Move Many</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddVideoLink();\">Add Video Link</div>");
            
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='testAddVisitor()'>test AddVisitor</div>");
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='addFileDates();'>Add File Dates</div>");
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='emergencyFolderLocationFix()'>emergencyFolderLocationFix</div>");
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='MoveManyCleanup()'>MoveManyCleanup</div>");

            break;
        default:
            alert("view not undestood: " + viewId);
    }
    resizeDashboardPage();
}

// REPAIR FUNCTIONS
function showRepairLinksDialog() {
    $('#draggableDialogTitle').html("Repair Links");
    $('#draggableDialogContents').html("<div id='createStaticPagesCrud'>\n" +
        //"    <div><span>folders to staticify</span>" + dashboardMainSelectedPath + "</div>\n" +
        "    <div><span>folder to repair</span><input id='txtFolderToRepair' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders' checked='checked' /></div>\n" +
        "    <div class='roundendButton' onclick='repairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n" +
        //"    <div id='renameFolderReport' class='repairReport'></div>\n" +
        "</div>\n");
    $("#draggableDialog").fadeIn();
    $("#txtFolderToRepair").val(dashboardMainSelectedPath);
    $('#draggableDialog').css("top", ($(window).height() - $('#draggableDialog').height()) / 2);

    //$('#draggableDialog').css("left", ($(window).width() - $('#draggableDialog').width()) / 2.142);

    $("#subheaderContent").html("len: " + dashboardMainSelectedPath.length);

    //$("#draggableDialog").css("min-width", 500);

    //$("#draggableDialog").width(dashboardMainSelectedPath.length + 100);
}
function repairLinks(justOne) {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    //$('#repairLinksReport').html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Links/RepairLinks?folderId=" + dashboardMainSelectedTreeId + "&recurr=" + justOne,
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

                    //setTimeout(function () { $('#dataifyInfo').hide(); }, 3000);

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

// CREATE STATIC PAGES
function showCreateStaticPagesDialog() {
    $('#draggableDialogTitle').html("Create Static Pages");
    $('#draggableDialogContents').html("<div id='createStaticPagesCrud'>\n" +
        //"    <div><span>folders to staticify</span>" + dashboardMainSelectedPath + "</div>\n" +
        "    <div><span>folders to staticify</span><input id='txtFolderToStaticify' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckStaticIncludeSubfolders' checked='checked' /></div>\n" +
        "    <div class='roundendButton' onclick='createStaticPages($(\"#ckStaticIncludeSubfolders\").is(\":checked\"))'>Build Files</div>\n" +
        //"    <div id='renameFolderReport' class='repairReport'></div>\n" +
        "</div>\n");
    
    $("#txtFolderToStaticify").val(dashboardMainSelectedPath);

    $("#draggableDialog").fadeIn();
    var winH = $(window).height();
    var dlgH = $('#draggableDialog').height();
    $('#draggableDialog').css("top", ($(window).height() - $('#draggableDialog').height()) / 2);
    $('#draggableDialog').css("left", ($(window).width() - $('#draggableDialog').width) / 2);

    //$("#subheaderContent").html(".txtLinkPath : " + $('.txtLinkPath').val());

}
function createStaticPages(justOne) {
    //$('#createStaticPagesCrud').dialog("close");
    //$('#createStaticPagesCrud').hide();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("creating static pages for " + dashboardMainSelectedPath);
    //$('#progressBar').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/Build?folderId=" + dashboardMainSelectedTreeId + "&recurr=" + justOne,
        success: function (success) {
            //$('#progressBar').hide();
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                $('#createStaticPagesCrud').dialog("close");
                displayStatusMessage("ok", "done");
                $('#txtNewLink').val("");
                $('#progressBar').hide();
                $('#dataifyInfo').hide();
            }
            else
                alert("createStaticPages: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createStaticPages xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

// ADD IMAGE LINK
function showAddImageLinkDialog() {
    $('#workAreaContainer').html(
        "<div id='addLinkCrudArea' class='addLinkCrudArea'>\n" +
        "    <div>link&nbsp;&nbsp;<input id='txtNewLink' tabindex='1' class='roundedInput' onblur='previewLinkImage()' /></div>\n" +
        "    <div>path&nbsp;<input class='roundedInput txtLinkPath' readonly='readonly' /></div>\n" +
        "    <div class='roundendButton' tabindex='2' onclick='addImageLink()'>Insert</div>\n" +
        "</div>\n" +
        "<img id='imgLinkPreview' class='linkImage' />\n").show();
        //<div id="progressBar" class="dashboardProgessBar"></div>

    $('#addLinkCrudArea').keydown(function (event) {
        if (event.keyCode === 13) {
            addImageLink();
        }
    });
}
function addImageLink() {
    if (isNullorUndefined($('#txtNewLink').val()))
        alert("invalid link");
    else {
        $('#dataifyInfo').show().html("calling AddImageLink");
        var newLink = {};
        newLink.Link = $('#txtNewLink').val();
        newLink.FolderId = dashboardMainSelectedTreeId;
        newLink.Path = dashboardMainSelectedPath;
        $('#dashBoardLoadingGif').fadeIn();
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/OggleFile/AddImageLink",
            data: newLink,
            success: function (successModel) {
                $('#dashBoardLoadingGif').hide();
                if (successModel.Success === "ok") {
                    //displayStatusMessage("ok", "image link added");
                    $('#txtNewLink').val("");
                    resizeDashboardPage();

                    if (successModel.ReturnValue !== "0") {
                        alert("set image: " + successModel.ReturnValue + " as folder image for " + dashboardMainSelectedTreeId);
                        setFolderImage(successModel.ReturnValue, dashboardMainSelectedTreeId, "folder");
                    }
                    logDataActivity({
                        PageId: dashboardMainSelectedTreeId,
                        PageName: $('.txtLinkPath').val(),
                        Activity: "new image added"
                    });
                }
                else
                    alert("addImageLink: " + successModel.Success);
            },
            error: function (xhr) {
                $('#dashBoardLoadingGif').hide();
                alert("addImageLink xhr error: " + getXHRErrorDetails(xhr));
            }
        });
    }
}
function previewLinkImage() {
    $('#imgLinkPreview').attr('src', $('#txtNewLink').val());
    $('#imgLinkPreview').one("load", function () {
        //$('#footerMessage').html("image height: " + $('#imgLinkPreview').height());
        var winH = $(window).height();
        var headerH = $('header').height();
        var uploadImageAreaH = $('#uploadArea').height();
        $('.threeColumnLayout').height(Math.max(winH, uploadImageAreaH) - headerH);
    });
}























//  CREATE NEW FOLDER
function showCreateNewFolderDialog() {
    $('#draggableDialogTitle').html("Create New Folder");
    $('#draggableDialogContents').html(
        "<div><span>title</span><input id='txtNewFolderTitle' class='roundedInput' /></div>\n" +
        "<div><span>parent</span><input class='txtLinkPath roundedInput' readonly='readonly' /></div>\n" +
        "<div class='roundendButton' onclick='createNewFolder()'>Create Folder</div>\n");
    $("#draggableDialog").fadeIn();
    var winH = $(window).height();
    var dlgH = $('#customMessage').height();
    $('#customMessageContainer').css("top", (winH - dlgH) / 2);
}
function createNewFolder() {
    $('#dashBoardLoadingGif').fadeIn();
    var newFolder = {};
    newFolder.FolderName = $('#txtNewFolderTitle').val();
    newFolder.Parent = dashboardMainSelectedTreeId;
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/Folder/Create?parentId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtNewFolderTitle').val(),
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "new folder " + $('#txtNewFolderTitle').val() + " created");
                logActivity({
                    PageId: dashboardMainSelectedTreeId,
                    PageName: $('.txtLinkPath').val(),
                    Activity: "new folder created: " + $('#txtNewFolderTitle').val()
                });
                $('#txtNewFolderTitle').val('');
                //$('#createNewFolderDialog').dialog('close');
            }
            else
                alert("CreateNewFolder: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createNewFolder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}










function showUpLoadFileDialog() {
    $('.workAreaContainer').hide();
    $('#divAddFile').show();

}
function showAddVideoLink() {
    $('.workAreaContainer').hide();
    $('#divAddFile').show();
}

// RENAME A FOLDER
function showRenameFolderDialog() {
    $('#draggableDialogTitle').html("Rename Folder");
    $('#draggableDialogContents').html(
        "<div><span>folder to rename</span><input id='txtFolderToRename' class='txtLinkPath roundedInput' readonly='readonly' /></div>\n" +
        "<div><span>new name</span><input id='txtReName' class='roundedInput' /></div>\n" +
        "<div class='roundendButton' onclick='renameFolder()'>Rename Folder</div>\n" +
        "<div id='renameFolderReport' class='repairReport'></div>\n");
    $("#draggableDialog").fadeIn();
    var winH = $(window).height();
    var dlgH = $('#customMessage').height();
    $('#customMessageContainer').css("top", (winH - dlgH) / 2);
}
function renameFolder() {
    var start = Date.now();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("renaming folder " + $('.txtLinkPath').val() + " to " + $('#txtReName').val());
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Folder/Rename?folderId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtReName').val(),
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            //$('#renameFolderCrud').dialog("close");
            //$('#renameFolderCrud').hide();
            if (success === "ok") {
                var delta = Date.now() - start;
                var minutes = Math.floor(delta / 60000);
                var seconds = (delta % 60000 / 1000).toFixed(0);
                displayStatusMessage("ok", "folder " + $('.txtLinkPath').val() + " renamed to " + $('#txtReName').val());
                console.log("Rename Folder took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);

                $('.txtLinkPath').val('');
                $('#renameFolderCrud').dialog("close");
                logActivity({
                    PageId: dashboardMainSelectedTreeId,
                    PageName: $('.txtLinkPath').val(),
                    Activity: "folder renamed from: " + $('.txtLinkPath').val() + " to " + $('#txtReName').val()
                });
                //$('#dataifyInfo').hide();
            }
            else {
                alert("renameFolder: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "renameFolder")) {
                sendEmailToYourself("XHR ERROR in Dashboard.js renameFolder",
                    "/api/FtpDashboard/RenameFolder?folderId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtReName').val() + " Message: " + errorMessage);
            }
        }
    });
}


function SaveFileAs() {
    try {
        //fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
        //var data = "{'imageName':'" + fileName + "'image':'" + image + "'}";

        //try {
        //    fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
        //    var image = $('#uplImage')[0].files[0];
        //    //var data = "{'imageName':'" + fileName + "'image':'" + image + "'}";
        //    if (image !== null) {
        //        //alert("url: " + service + "/api/Images");
        //        $.ajax({
        //            type: "POST",
        //            url: settingsArray.ApiServer + "/api/Images?oFileName=" + fileName,
        //            enctype: 'multipart/form-data',
        //            processData: false,  // Important!
        //            contentType: false,
        //            async: false,
        //            cache: false,
        //            data: image,
        //            success: function (success) {
        //                if (success !== "ok")
        //                    alert("postImage: " + success);
        //            },
        //            error: function (xhr) {
        //                alert("PostTimage error: " + xhr.statusText);
        //            }
        //        });
        //    }
        //    else {
        //        alert("ERROR: image == null")
        //        //displayStatusMessage("alert-danger", "ERROR: not working");
        //    }
        //    return fileName;
        //} catch (e) {
        //    //displayStatusMessage("alert-danger", "ERROR t: " + e);
        //    alert("try catch ERROR : " + e);
        //}





        var image = $('#uplImage')[0].files[0];
        if (image !== null) {
            $('#dashBoardLoadingGif').fadeIn();
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "/api/FtpDashBoard/SaveFileAs?imageName=" + $('#uplImage').val() + "&destinationPath=" + dashboardMainSelectedPath,
                enctype: 'multipart/form-data',
                processData: false,  // Important!
                contentType: "image/jpeg",
                async: false,
                cache: false,
                data: image,
                success: function (successModel) {
                    $('#dashBoardLoadingGif').hide();
                    if (successModel.Success === "ok") {
                        displayStatusMessage("ok", "image link added");
                        $('#txtNewLink').val("");
                        resizeDashboardPage();
                        logActivity({
                            PageId: dashboardMainSelectedTreeId,
                            PageName: $('.txtLinkPath').val(),
                            Activity: "new image added "
                        });
                    }
                    else
                        alert("postImage: " + success);
                },
                error: function (xhr) {
                    $('#dashBoardLoadingGif').hide();
                    alert("Postimage error: " + xhr.statusText);
                }
            });
        }
        else {
            alert("ERROR: image == null");
        }
    } catch (e) {
        //displayStatusMessage("alert-danger", "ERROR t: " + e);
        alert("try catch ERROR : " + e);
    }
}

// ROLES FUNCTION
function showAssignRolesDialog() {
    $('#rolesChooseBoxDialog').dialog('open');
    $('#divChooseAssigned').html("");
    loadUsers();
    loadAllUserRoles();
}
function showAddRolesDialog() {
    $('#addEditRolesDialog').dialog('open');
    loadAaddEditRoles();
}
function showAddEditRoles() {


}




function prepareXhamsterPage() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/xHampster?folderId=" + dashboardMainSelectedTreeId,
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "Xhamster Page created");
            }
            else {
                alert("prepareXhamsterPage: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "prepareXhamsterPage")) {
                sendEmailToYourself("XHR ERROR in Dashboard.js prepareXhamsterPage",
                    "/api/xHampster?folderId=" + dashboardMainSelectedTreeId + " Message: " + errorMessage);
            }
            alert("prepareXhamsterPage xhr error: " + errorMessage);
        }
    });
}

// MOVE MANY
function showMoveManyTool() {

    if (isNullorUndefined(dashboardMainSelectedPath)) {
        alert("select a folder");
        return;
    }
    $('.workAreaContainer').hide();
    $('#divMoveManyTool').show();

    $('#btnSelectAll').click(function () {
        $('.loadManyCheckbox').prop('checked', true);
    });

    $('#moveManyHeader').html(dashboardMainSelectedPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));
    $('#txtMoveManyDestination').val("");
    $('#dashBoardLoadingGif').fadeIn();

    $('#moveManyDestinationDirTree').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'top', at: 'left', of: $('#moveManyToggleButton') },
        width: "400",
        height: "550"
    });
    buildDirTree($('#moveManyDestinationDirTree'), 'moveManyFolderTree', 0);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/ImagePage/GetImageLinks?folderId=" + dashboardMainSelectedTreeId,
        success: function (imageLinksModel) {
            $('#dashBoardLoadingGif').hide();
            if (imageLinksModel.Success === "ok") {
                $('#moveManyToolContainer').html("");
                $.each(imageLinksModel.Files, function (ndx, obj) {
                    $('#moveManyToolContainer').append("<div class='sortBox'><img class='sortBoxImage' src='" + obj.Link + "'/>" +
                        "<br/><input type='checkbox' class='loadManyCheckbox' imageId=" + obj.LinkId + "></div>");
                });
                //resizePage();
            }
            else {
                alert("showMoveManyTool: " + imageLinksModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "showMoveManyTool")) 
                sendEmailToYourself("XHR ERROR in Dashboard.js showMoveManyTool", "Message: " + errorMessage);            
            alert("showMoveManyTool xhr error: " + errorMessage);
        }
    });
}
var moveManyDestinationFolderId = 0;
function moveManyFolderTreeClick(path, id) {
    var displayPath = "";
    if (path.length > path.indexOf(".COM") + 4) {
        displayPath = path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " ");
    }
    else {
        displayPath = path;
    }
    moveManyDestinationFolderId = id;
    $('#txtMoveManyDestination').val(displayPath);
    $('#moveManyDestinationDirTree').dialog("close");
}
function moveCheckedImages() {
    //alert("entering move many");    
    console.log("entering move many");
    if (moveManyDestinationFolderId === 0) {
        alert("select a destination");
        return;
    }
    var checkedImages = [];
    $('#moveManyToolContainer').children().each(function (ndx, obj) {
        if ($(this).find("input").is(":checked")) {
            checkedImages.push($(this).find("input").attr("imageId"));
        }
    });
    var moveManyModel = {
        SourceFolderId: dashboardMainSelectedTreeId,
        DestinationFolderId: moveManyDestinationFolderId,
        ImageLinkIds: checkedImages
    };
    if (confirm("move " + checkedImages.length + " images to " + $('#txtMoveManyDestination').val())) {
        $('#dashBoardLoadingGif').fadeIn();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/MoveImage/MoveMany",
            data: moveManyModel,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    //buildDirectoryTree();
                    showMoveManyTool();
                }
                else
                    alert("moveCheckedImages: " + success);
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "moveCheckedImages"))
                    sendEmailToYourself("XHR ERROR in Dashboard.js moveCheckedImages", "Message: " + errorMessage);
                alert("moveCheckedImages xhr error: " + errorMessage);
            }
        });
    }
    console.log("leaving move many");
}

// SORT TOOL
function showSortTool() {
    //alert("dashboardMainSelectedPath: " + dashboardMainSelectedPath);
    if (isNullorUndefined(dashboardMainSelectedPath)) {
        alert("select a folder");
        return;
    }
    $('.workAreaContainer').hide();
    $('#divSortTool').fadeIn();
    loadSortImages();
}
function loadSortImages()
{
    $('#sortTableHeader').html(dashboardMainSelectedPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));
    $('#dashBoardLoadingGif').fadeIn();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/ImagePage/GetImageLinks?folderId=" + dashboardMainSelectedTreeId,
        success: function (imageLinksModel) {
            $('#dashBoardLoadingGif').hide();
            if (imageLinksModel.Success === "ok") {
                $('#sortToolContainer').html("");
                $.each(imageLinksModel.Files, function (ndx, obj) {
                    $('#sortToolContainer').append("<div class='sortBox'><img class='sortBoxImage' src='" + obj.Link + "'/>" +
                        "<br/><input class='sortBoxInput' id=" + obj.LinkId + " value=" + obj.SortOrder + "></div>");
                });
                //resizePage();
            }
            else {
                alert("loadSortImages: " + imageLinksModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "prepareXhamsterPage")) {
                sendEmailToYourself("XHR ERROR in Dashboard.js prepareXhamsterPage",
                    " / api / ImagePage / GetImageLinks ? folderId =" + dashboardMainSelectedTreeId + " Message: " + errorMessage);
            }
            alert("loadSortImages xhr error: " + errorMessage);
        }
    });
}
function updateSortOrder() {
        var sortOrderArray = [];
        $('#sortToolContainer').children().each(function () {
            sortOrderArray.push({
                pageId: dashboardMainSelectedTreeId,
                itemId: $(this).find("input").attr("id"),
                inputValue: $(this).find("input").val()
            });
        });

        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/ImagePage/UpdateSortOrder",
            contentType: 'application/json',
            data: JSON.stringify(sortOrderArray),
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    $('#dashBoardLoadingGif').hide();
                    loadSortImages();
                }
                else {
                    alert("updateSortOrder: " + success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "updateSortOrder")) {
                    sendEmailToYourself("XHR ERROR in Dashboard.js updateSortOrder",
                        "/api/ImagePage/GetImageLinks?folderId=" + dashboardMainSelectedTreeId + " Message: " + errorMessage);
                }
                alert("updateSortOrder xhr error: " + errorMessage);
            }
        });
    }


// MOVE FOLDER
function showMoveFolderDialog() {
    $('#moveFolderCrud').dialog({
        autoOpen: true,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "400"
    });
    $('#moveFolderCrud').on('dialogclose', function (event) {
        $('.txtLinkPath').val("");
        buildDirectoryTree();
    });
    $('#moveFolderDestDirTree').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'right', at: 'left', of: $('#moveFolderCrud') },
        width: "400",
        height: "550"
    });
    buildDirTree($('#moveFolderDestDirTree'), 'moveFolderTree', 0);
}
var moveFolderSelectedParentId = 0;
function moveFolderTreeClick(path, id) {
    var displayPath = "";
    if (path.length > path.indexOf(".COM") + 4) {
        displayPath = path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " ");
    }
    else {
        displayPath = path;
    }
    moveFolderSelectedParentId = id;
    $('#txtMoveFolderDest').val(displayPath);
    $('#moveFolderDestDirTree').dialog("close");
}
function moveFolder() {
    //$('#dataifyInfo').show().html("Preparing to Move Folder");
    $('#dataifyInfo').show().html("Moving Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/Folder/Move?sourceFolderId=" + dashboardMainSelectedTreeId + "&destinationFolderId=" + moveFolderSelectedParentId,
        success: function (success) {
            if (success !== "ok") {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "MYQ",
                    Severity: 1,
                    ErrorMessage: success,
                    CalledFrom: "dashboard.js movefolder"
                });
            }
            $('#dashBoardLoadingGif').hide();
            //if (!success.startsWith("ERROR")) {
                displayStatusMessage("ok", "folder " + $('#txtMoveFolderDest').val() + " moved to " + $('.txtPartialDirTreePath').val());
                //$('#progressBar').progressbar("destroy");
                logActivity({
                    PageId: dashboardMainSelectedTreeId,
                    PageName: $('.txtPartialDirTreePath').val(),
                    Activity: "folder moved from:" + $('#txtNewFolderParent').val() + " to: " + $('#txtMoveFolderDest').val()
                });
                $('#txtMoveFolderDest').val('');
                $('#dataifyInfo').hide();
            //}
            //else
            //    alert("Move Folder: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("Move Folder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

// COPY FOLDER
function showCopyFolderDialog() {
    $('#copyFolderCrud').dialog({
        autoOpen: true,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "600"
    });
    $('#copyFolderCrud').on('dialogclose', function (event) {
        buildDirectoryTree();
        //$('#copyFolderCrud').hide();
    });
    $('#copyFolderParentDirTree').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'right', at: 'left', of: $('#copyFolderCrud') },
        width: "400",
        height: "550"
    });
    buildDirTree($('#copyFolderParentDirTree'), 'copyFolderParent', 0);
}
var copyFolderSelectedParentId = 0;
function copyFolderParentClick(path, id) {
    var displayPath = "";
    if (path.length > path.indexOf(".COM") + 4) {
        displayPath = path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " ");
    }
    else {
        displayPath = path;
    }
    copyFolderSelectedParentId = id;
    $('#txtCopyFolderParent').val(displayPath);
    $('#copyFolderParentDirTree').dialog("close");
}
function copyFolder() {
    $('#dataifyInfo').show().html("Copying Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    var stepchildModel = {
        Parent: copyFolderSelectedParentId,
        Child: dashboardMainSelectedTreeId,
        Link: $('#txtNewLink').val(),
        FolderName: $('#txtNewFolderName').val(),
        SortOrder: 998
    };
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Folder",
        data: stepchildModel,
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            $('#dataifyInfo').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " copied to " + $('.txtPartialDirTreePath').val());
                logActivity({
                    PageId: dashboardMainSelectedTreeId,
                    PageName: $('.txtPartialDirTreePath').val(),
                    Activity: "copied folder " + $('#txtNewFolderParent').val() + " to " + $('.txtPartialDirTreePath').val()
                });
                $('#txtNewFolderParent').val('');
                $('.txtPartialDirTreePath').val('');
                //$('#moveFolderCrud').dialog("close");
            }
            else
                alert("copy stepchild: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("Move Folder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}



function addFileDates() {
    $('#dataifyInfo').show().html("adding file dates");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/RepairLinks/UpdateDates?startFolderId=" + dashboardMainSelectedTreeId,
        success: function (results) {
            $('#dashBoardLoadingGif').hide();
            if (results.Success === "ok") {
                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val());
                //$('#progressBar').hide();
                //$('#progressBar').progressbar("destroy");
                alert("addFileDates : " + results.Success);
                //logActivity({
                //    PageId: dashboardMainSelectedTreeId,
                //    PageName: $('.txtPartialDirTreePath').val(),
                //    Activity: "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val()
                //});
            }
            else
                alert("addFileDates : " + results.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("Move Folder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function emergencyFolderLocationFix() {
    var start = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("fixing folder location " + $('.txtLinkPath').val());
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/RepairLinks/EmergencyFolderLocationFix?root=" + dashboardMainSelectedTreeId,
        success: function (repairReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (repairReportModel.Success === "ok") {
                var delta = Date.now() - start;
                var minutes = Math.floor(delta / 60000);
                var seconds = (delta % 60000 / 1000).toFixed(0);

                console.log("emergencyFolderLocationFix took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);

                $('#dataifyInfo').show().html("loc fix took: " + minutes + ":" + seconds + " rows processed  " + repairReportModel.RowsProcessed + " recs fixed: " + repairReportModel.LinksEdited + " Errors: " + repairReportModel.Errors.length);

                //
            }
            else {
                alert("emergencyFolderLocationFix: " + repairReportModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "emergencyFolderLocationFix")) {
                alert("XHR ERROR in Dashboard.js renameFolder" + errorMessage);
            }
        }
    });
}

function MoveManyCleanup() {
    var start = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("fixing folder location " + $('.txtLinkPath').val());
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/RepairLinks/MoveManyCleanup?root=" + dashboardMainSelectedTreeId,
        success: function (repairReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (repairReportModel.Success === "ok") {
                var delta = Date.now() - start;
                var minutes = Math.floor(delta / 60000);
                var seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("emergencyFolderLocationFix took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                $('#dataifyInfo').show().html("loc fix took: " + minutes + ":" + seconds + " rows processed  " + repairReportModel.RowsProcessed + " recs fixed: " + repairReportModel.LinksEdited + " Errors: " + repairReportModel.Errors.length);
            }
            else {
                alert("emergencyFolderLocationFix: " + repairReportModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "emergencyFolderLocationFix")) {
                alert("XHR ERROR in Dashboard.js renameFolder" + errorMessage);
            }
        }
    });
}

// UNUSED
function addVideoLink() {
    try {
        $('#dashBoardLoadingGif').show();

        var ImageId = $('#txtVideoImage').val();

        var videoLink = {};
        videoLink.Link = $('#txtVideoLink').val();
        videoLink.ImageId = ImageId;
        videoLink.Title = $('#txtVideoTitle').val();
        videoLink.FolderId = dashboardMainSelectedTreeId;

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/VideoLink",
            data: videoLink,
            success(success) {
                $('#dashBoardLoadingGif').hide();
                if (!success.startsWith("ERROR")) {
                    displayStatusMessage("ok", "video link added");
                }
                else
                    alert("addVideo: " + success);
            },
            error: function (xhr) {
                $('#dashBoardLoadingGif').hide();
                alert("addVideo xhr: " + getXHRErrorDetails(xhr));
            }
        });
    } catch (e) {
        alert("addVideo Catch : " + e);
    }
}

function XXloadProperties() {
    $('#dataifyInfo').show().html("adding size info");
    $.ajax({
        type: "PATCH",
        url: settingsArray.ApiServer + "api/FtpDashBoard/GetFileProps?folderId=" + dashboardMainSelectedTreeId,
        success: function (success) {
            $('#imagePageLoadingGif').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "done");
                $('#dataifyInfo').hide();
            }
            else
                alert("GetFileProps: " + success);
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "loadProperties")) {
                sendEmailToYourself("XHR ERROR in Blog.js putBlogEntry", "/api/OggleBlog Message: " + errorMessage);
            }
        }
    });
}

function XXmergeFolders() {
    if (confirm("collapse " + $('.txtLinkPath').val())) {
        $('#dashBoardLoadingGif').fadeIn();
        $('#dataifyInfo').show().html("collapse Child Folder");
        //$('#progressBar').progressbar("enable");
        $('#progressBar').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/MoveImage/CollapseFolder?folderId=" + dashboardMainSelectedTreeId,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    displayStatusMessage("ok", "collapse succeded");
                    buildDirectoryTree();
                    $('#progressBar').hide();
                    //$('#progressBar').progressbar("destroy");
                }
                else {
                    sendEmailToYourself("jquery fail in FolderCategory.js collapseChildFolder", success);
                    //alert("collapseChildFolder: " + success);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "collapseChildFolder")) {
                    sendEmailToYourself("XHR ERROR in Dashboard.js collapseChildFolder", "/api/MoveImage/CollapseFolder?folderId=" + dashboardMainSelectedTreeId + " Message: " + errorMessage);
                }
            }
        });
    }
}

function XXtestAddVisitor() {
    $('#dataifyInfo').show().html("sending test addVisitor");
    addVisitor(3309, "dashboard");
}

//var partialViewSelectedItemId = 0;
//var dashboardContextMenuFolderId = "";
function dirTreeClick(danniPath, folderId) {
    dashboardMainSelectedTreeId = folderId;
    dashboardMainSelectedPath = danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
    $('.txtLinkPath').val(dashboardMainSelectedPath);
    $("#subheaderContent").html($('.txtLinkPath').val());
    //alert("DanniPath: " + $('.txtLinkPath').val());
    //alert("dashboardMainSelectedTreeId: " + dashboardMainSelectedTreeId);
}
