var tabIndent = 22;
var tab = 0;
var totalPics = 0;
var totalFolders = 0;
var dashboardMainSelectedTreeId = 0;
var dashboardMainSelectedPath = "";
var partialViewSelectedItemId = 0;
var dashboardContextMenuFolderId = "";

function resizeDashboardPage() {
    resizePage();
    var mch = $('#middleColumn').height() - 50;
    $('.dashboardContainer').height(mch);
    $('#dashboardLeftMenu').height(mch);
    $('.dashboardTreeContainer').height(mch);
    $('.workAreaContainer').height(mch);

    var mw = $('.dashboardContainer').width() - $('#dashboardLeftMenu').width() - $('.dashboardTreeContainer').width() - 39;
    $('.workAreaContainer').width(mw + 'px');

    $('.workAreaDisplayContainer').height(mch - 100);   

    //$('#footerMessage').html("dashboardContainer.width: " + $('.dashboardContainer').width() +
    //    "  dashboardTreeContainer.width: " + $('.dashboardTreeContainer').width() +
    //    "  dashboardLeftMenu.width: " + $('#dashboardLeftMenu').width() +
    //    "  workAreaContainer.width: " + $('.workAreaContainer').width()) +
    //    "  mw: " + mw;
}

function setDashboardHeader(viewId) {
    $('#headerSubTitle').html(viewId);
    switch (viewId) {
        case "Add Images":
            $('.workAreaContainer').hide();
            $('#divAddImages').show();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='buildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            break;
        case "Manage Folders":
            $('.workAreaContainer').hide();
            $('#divAddImages').show();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='buildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='repairLinks()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#createNewFolderDialog').dialog('open');\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCopyFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#renameFolderCrud').dialog('open');\">Rename Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            break;
        case "Reports":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='showPerfMetrics()'>Performance Metrics</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showPageHitReport()'>Page Hit Report</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showEventActivityReport()'>Event Activity</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMostActiveUsersReport()'>Most Active Users</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showLatestImageHitsReport()'>Latest Image Hits</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='FeedbackReport()'>Feedback</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='runErrorLogReport()'>Error Log</div>");
            break;
        case "Admin":
            $('.workAreaContainer').hide();
            $('#divAddImages').show();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='buildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#createStaticPagesCrud').dialog('open');\">Create Static Pages</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#createNewFolderDialog').dialog('open');\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCopyFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#renameFolderCrud').dialog('open');\">Rename Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='repairLinks()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAssignRolesDialog()'>Assign User Roles</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddRolesDialog()'>Edit Roles</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='$('.workAreaContainer').hide();$('#divAddVideo').show();\">Add Video Link</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveManyTool();'>Move Many</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='addFileDates();'>Add File Dates</div>");

            $('#dashboardLeftMenu').append("<div class='clickable' onclick='emergencyFolderLocationFix()'>emergencyFolderLocationFix</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='MoveManyCleanup()'>MoveManyCleanup</div>");
           

            break;
        default:
            alert("view not undestood: " + viewId);
    }
    resizeDashboardPage();
}

function onDirTreeComplete() {
    //alert("onDirTreeComplete 1");


    //$('#dataifyInfo').html("rebuildCatTree took: " + delta.toFixed(3) + " total folders: " + totalFolders + " total pics: " + totalPics.toLocaleString());
    //setTimeout(function () {
    //    alert("onDirTreeComplete 3");
    //}, 5000);

    $('#dataifyInfo').hide();
    resizeDashboardPage();
    $('#dashBoardLoadingGif').hide();

    //alert("onDirTreeComplete 2");
}

function buildDirectoryTree() {
    $('#dirTreeContainer').html("");
    $('#dataifyInfo').show().html("rebuilding directory tree");
    $('#dashBoardLoadingGif').show();
    buildDirTree($('#dirTreeContainer'), "dashboardMain", 0);
}

function createStaticPages(justOne) {
    //$('#createStaticPagesCrud').dialog("close");
    //$('#createStaticPagesCrud').hide();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("creating static pages for " + dashboardMainSelectedPath);
    //$('#progressBar').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/Buld?folderId=" + dashboardMainSelectedTreeId + "&recurr=" + justOne,
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

function xxcreateStaticIndexPages() {
    $('#dataifyInfo').show().html("Building Index page");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/CreateIndexPage?rootFolder=boobs&userName=xxx&pageTitle=Index&metaTagFolderId=2",
        success: function (success) {
            //$('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                $('#dataifyInfo').show().html("Building porn Index page");
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/StaticPage/CreateIndexPage?rootFolder=porn&userName=xxx&pageTitle=porn&metaTagFolderId=242",
                    success: function (success) {
                        //$('#dashBoardLoadingGif').hide();
                        if (success === "ok") {
                            displayStatusMessage("ok", "done building Index pages");
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
            else
                alert("createStaticPages: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createStaticPages xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function addVideoLink() {
    try {
        $('#dashBoardLoadingGif').show();

         var ImageId= $('#txtVideoImage').val();

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

function previewLinkImage() {
    $('#imgLinkPreview').attr('src', $('#txtNewLink').val());
    $('#imgLinkPreview').one("load", function () {
        $('#footerMessage').html("image height: " + $('#imgLinkPreview').height());
        resizeDashboardPage();
    });
}

function addImageLink() {
    if (isNullorUndefined($('#txtNewLink').val()))
        alert("invalid link");
    else {
        $('#dataifyInfo').hide();
        var newLink = {};
        newLink.Link = $('#txtNewLink').val();
        newLink.FolderId = dashboardMainSelectedTreeId;
        newLink.Path = dashboardMainSelectedPath;
        $('#dashBoardLoadingGif').fadeIn();
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/FtpDashBoard",
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
                    logActivity({
                        PageId: dashboardMainSelectedTreeId,
                        PageName: $('.txtLinkPath').val(),
                        Activity: "new image added "
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

function xxloadProperties() {
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

function collapseChildFolder() {
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

// TREE CONTEXT MENU FUNCTIONS
function dashboardMainClick(path, id, linkId) {
    dashboardMainSelectedTreeId = id;
    dashboardMainSelectedPath = path;
    $('.txtLinkPath').val(path.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));
}
function dashboardContextMenuOpenFolder() {
    window.open("/album.html?folder=" + dashboardContextMenuFolderId, "_blank");
}
function dashboardContextMenuShowCategoryDetails() {
    showCategoryDialog(dashboardContextMenuFolderId);
}
function dashboardContextMenuShowInfoDialog() {
    showModelInfoDialog($('.txtLinkPath').val(), dashboardContextMenuFolderId, "http://boobs.ogglebooble.com/redballon.png");
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
    $('#moveManyHeader').html(dashboardMainSelectedPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));
    $('#txtMoveManyDestination').val("");
    $('#dashBoardLoadingGif').fadeIn();

    $('#moveManyDestinationDirTree').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: ({ my: 'top', at: 'left', of: $('#moveManyToggleButton') }),
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

//  CREATE NEW FOLDER
function createNewFolder() {
    $('#dashBoardLoadingGif').fadeIn();
    var newFolder = {};
    newFolder.FolderName = $('#txtNewFolderTitle').val();
    newFolder.Parent = dashboardMainSelectedTreeId;
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/FtpDashBoard/CreateFolder?parentId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtNewFolderTitle').val(),
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
                alert("CreateVirtualFolder: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createNewFolder xhr error: " + getXHRErrorDetails(xhr));
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
        position: ({ my: 'right', at: 'left', of: $('#moveFolderCrud') }),
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
        url: settingsArray.ApiServer + "/api/Folder/MoveFolder?sourceFolderId=" + dashboardMainSelectedTreeId + "&destinationFolderId=" + moveFolderSelectedParentId,
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
    //$('#moveFolderCrud').on('dialogclose', function (event) {
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
        position: ({ my: 'right', at: 'left', of: $('#copyFolderCrud') }),
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

// RENAME FOLDER
function renameFolder() {
    var start = Date.now();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("renaming folder " + $('.txtLinkPath').val() + " to " + $('#txtReName').val());
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FtpDashboard/RenameFolder?folderId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtReName').val(),
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
                buildDirectoryTree();
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

function postImage() {
    try {
        //fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
        //var data = "{'imageName':'" + fileName + "'image':'" + image + "'}";
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




