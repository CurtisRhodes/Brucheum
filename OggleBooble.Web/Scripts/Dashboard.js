let pSelectedTreeId, pSelectedTreeFolderPath;
let dshBrdSubDirTreeId;

function dashboardStartup() {
    document.title = "dashboard : OggleBooble";
    changeFavoriteIcon("redBallon");
    $('#indexMiddleColumn').html(dashboardHtml());
    $('#dashboardDialog').draggable();
    $('#dashboardDialog').css("top", 250);
    $('#dashboardDialog').css("left", 450);
    $('.txtLinkPath').val('');
    setOggleHeader(3910, "dashboard");
    setOggleFooter(3910, "dashboard");
    showDefaultWorkArea();
    $('#divAddImages').show();

    //if (isInRole("oggle admin"))
    role = "ADM";
    loadHeaderTabs(role);
    setLeftMenu(role);
    loadDashboardDirTree();
    window.addEventListener("resize", resizeDashboardPage);
}

function showDefaultWorkArea() {
    $('#dashboardContainer').html(
        "   <div id='defaultSection' class='fullScreenSection flexbox'>\n" +
        "      <div id='dashboardLeftColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='dashboardLeftMenu' class='oggleVerticalMenu' ></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardMiddleColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='workAreaContainer' class='workAreaContainer'></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardRightColumn' class='dashboardContainerColumn'></div>\n" +
        "   </div>\n");
    $('.dashboardContainerColumn').show();
    loadDirectoryTree(1, "dashboardRightColumn", "dashBoardDirTreeClick", false);
}

function dashboardHtml() {
    return "<img id='dashBoardLoadingGif' class='loadingGif' src='Images/loader.gif'/>\n" +
        "   <div id='dashboardContainer' class='fullScreenContainer'>\n" +
        "   </div>\n" +
        "      <div id='dataifyInfo' class='infoLine' onclick='$(\"#dataifyInfo\").hide()'></div>\n" +
        "   <div id='dashboardDialog' class='oggleDialogContainer displayHidden'>\n" +
        "      <div class='oggleDialogHeader'>" +
        "          <div id='dashboardDialogTitle' class='oggleDialogTitle'></div>" +
        "          <div class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='$(\"#dashboardDialog\").hide()'/></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardDialogContents' class='oggleDialogContents'></div>\n" +
        "   </div>\n";
}  

function resizeDashboardPage() {
    let widthFF = -39;
    // width
    let winW = $(window).width(), lcW = $('.leftColumn').width(), rcW = $('.rightColumn').width();
    $('#dashboardContainer').css("width", winW - lcW - rcW);
    let middleColumnW = $('#dashboardContainer').width() - $('#dashboardRightColumn').width() - $('#dashboardLeftColumn').width();
    $('#dashboardMiddleColumn').css("width", middleColumnW);

    //height
    let winH = $(window).height();
    let headerH = $('#oggleHeader').height();
    //$('.threeColumnLayout').css("height", winH - headerH);
    //let adjH = $('.threeColumnLayout').height() - $('header').height();
    $('#dashboardContainer').css("height", winH - headerH + widthFF);

    //$('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyFooter').height());
    //alert("dashboardContainer height: " + adjH + " middleColumnW: " + middleColumnW);
}

function rebuildDirectoryTree() {
    loadDirectoryTree(1, "dashboardRightColumn", "dashBoardDirTreeClick", true);
}

function setLeftMenu(role) {
    switch (role) {
        case "Add Images":
            //$('.workAreaContainer').hide();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='rebuildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showUpLoadFileDialog()'>Upload a file</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddImageLinkDialog()'>Add Image Link</div>");
            $('#divAddImages').show();
            break;
        case "Manage Folders": {
            //$('.workAreaContainer').hide();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='rebuildDirectoryTree()'>ReBuild Dir Tree</div>");

            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#createNewFolderDialog').dialog('open');\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddStepChildFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#renameFolderCrud').dialog('open');\">Rename Folder</div>");
            break;
        }
        case "Manage Roles":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='showAssignRolesDialog()'>Assign User Roles</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddRolesDialog()'>Edit Roles</div>");
            break;
        //case "Reports":
        //    $('#dashboardLeftMenu').html("<div class='clickable' onclick='showPerfMetrics()'>Performance Metrics</div>");
        //    $('#dashboardLeftMenu').append("<div class='clickable' onclick='pageHitReport()'>Page Hit Report</div>");
        //    $('#dashboardLeftMenu').append("<div class='clickable' onclick='showEventActivityReport()'>Event Activity</div>");
        //    $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMostActiveUsersReport()'>Most Active Users</div>");
        //    $('#dashboardLeftMenu').append("<div class='clickable' onclick='showLatestImageHitsReport()'>Latest Image Hits</div>");
        //    $('#dashboardLeftMenu').append("<div class='clickable' onclick='FeedbackReport()'>Feedback</div>");
        //    $('#dashboardLeftMenu').append("<div class='clickable' onclick='errorLogReport()'>Error Log</div>");
        //    break;
        case "ADM":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='rebuildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddImageLinkDialog()'>Add Image Link</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCreateStaticPagesDialog()'>Create Static Pages</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showRepairLinksDialog()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>");

            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCreateNewFolderDialog(" + pSelectedTreeId + ")';\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddStepChildFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showRenameFolderDialog()'>Rename Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveManyTool();'>Move Many</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddVideoLink();\">Add Video Link</div>");

            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='testAddVisitor()'>test AddVisitor</div>");
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='addFileDates();'>Add File Dates</div>");
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='emergencyFolderLocationFix()'>emergencyFolderLocationFix</div>");
            //$('#dashboardLeftMenu').append("<div class='clickable' onclick='MoveManyCleanup()'>MoveManyCleanup</div>");

            break;
        default:
            alert("view not undestood: " + role);
    }
}

function loadHeaderTabs(role) {
    switch (role) {
        case "LOW":
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Add Images');\">Add Images</a>");
            break;
        case "PWR":
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Add Images');\">Add Images</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Manage Folders');\">Manage Folders</a>");
            break;
        case "ADM":
            //alert("isInRole Oggle admin")
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Add Images');\">Add Images</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Admin');\">Admin</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:showReportsSection();\">Reports</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Manage Roles');\">Manage Roles</a>");
            $('#headerMessage').html("Oggle admin");
            //$('.adminLevelOption').show();
            break;
        default:
    }
}

// REPAIR FUNCTIONS
function showRepairLinksDialog() {
    $('#dashboardDialogTitle').html("Repair Links");
    $('#dashboardDialogContents').html(
        "    <div><span>folder to repair</span><input id='txtFolderToRepair' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders' checked='checked' /></div>\n" +
        "    <div class='roundendButton' onclick='performRepairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n");
    $("#txtFolderToRepair").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();
}
function performRepairLinks(justOne) {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/RepairLinks/Repair?folderId=" + pSelectedTreeId + "&recurr=" + justOne,
            success: function (repairReport) {
                $('#dashBoardLoadingGif').hide();
                $("#centeredDialogContents").fadeOut();
                if (repairReport.Success === "ok") {
                    try {
                        var delta = Date.now() - start;
                        var minutes = Math.floor(delta / 60000);
                        var seconds = (delta % 60000 / 1000).toFixed(0);
                        //console.log("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                        $('#dataifyInfo').html("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                        $('#dataifyInfo').append(", Files: " + repairReport.PhyscialFilesProcessed);
                        $('#dataifyInfo').append(", Links: " + repairReport.LinkRecordsProcessed);
                        $('#dataifyInfo').append(", Image rows: " + repairReport.ImageFilesProcessed);
                        if (repairReport.OrphanCatLinkRecs.length > 0)
                            $('#dataifyInfo').append(", Orphan Links: " + repairReport.OrphanCatLinkRecs.length);
                        if (repairReport.OrphanImageFileRecs.length > 0)
                            $('#dataifyInfo').append(", Orphan Recs: " + repairReport.OrphanImageFileRecs.length);
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
                            $('#dataifyInfo').append(", Links Removed: " + repairReport.LinksRemoved);
                        if (repairReport.CatLinksAdded > 0)
                            $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);
                        if (repairReport.ImageFileAdded > 0)
                            $('#dataifyInfo').append(", ImageFiles Added: " + repairReport.ImageFileAdded);
                        if (repairReport.MissingFiles.length > 0) {

                            $('#dataifyInfo').append(", No Link Files: " + repairReport.MissingFiles.length);


                        }
                        repairReport.Errors.forEach(function (element) {
                            $('#repairLinksReport').append("<div> errors: " + element + "</div>");
                        });
                    }
                    catch (e) {
                        alert("problem displaying repair report: " + e);
                    }
                }
                else
                    logError("BUG", apFolderId, success, "performRepairLinks");
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                if (!checkFor404("performRepairLinks")) {
                    logError("XHR", apFolderId, getXHRErrorDetails(jqXHR), "performRepairLinks");
                }
            }
        });
    } catch (e) {
        logError("CAT", apFolderId, e, "performRepairLinks");
    }
}

// CREATE STATIC PAGES
function showCreateStaticPagesDialog() {
    $('#dashboardDialogTitle').html("Create Static Pages");
    $('#dashboardDialogContents').html(
        "    <div><span>folders to staticify</span><input id='txtFolderToStaticify' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckStaticIncludeSubfolders' checked='checked' /></div>\n" +
        "    <div class='roundendButton' onclick='createStaticPages($(\"#ckStaticIncludeSubfolders\").is(\":checked\"))'>Build Files</div>\n");    
    $("#txtFolderToStaticify").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();    
}
function createStaticPages(justOne) {
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("creating static pages for " + pSelectedTreeFolderPath);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/Build?folderId=" + pSelectedTreeId + "&recurr=" + justOne,
        success: function (results) {
            //$('#progressBar').hide();
            $('#dashBoardLoadingGif').hide();
            if (results.Success === "ok") {
                displayStatusMessage("ok", "done");
                $('#dataifyInfo').html(" folders: " + results.FoldersProcessed + "  pages created: " + results.PagesCreated);

                //public class StaticPageResultsModel {
                //    public int FolderId { get; set; }
                //    public int PagesCreated { get; set; }
                //    public int FoldersProcessed { get; set; }
                //    public string Success { get; set; }
                //}

                //$('#txtNewLink').val("");
                //$('#progressBar').hide();
                //$('#dataifyInfo').hide();
            }
            else
                alert("createStaticPages: " + results.Success);
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
        "   <div class='flexbox'>\n" +
        "       <label>link</label><input id='txtImageLink' tabindex='1' class='roundedInput' onblur='previewLinkImage()'/>\n" +
        "   </div>\n" +
        "   <div class='flexbox'>\n" +
        "       <label>path</label><input class='roundedInput txtLinkPath' readonly='readonly' />\n" +
        "   </div>\n" +
        "    <div class='roundendButton' tabindex='2' onclick='addImageLink()'>Insert</div>\n" +
        "</div>\n" +
        "<img id='imgLinkPreview' class='linkImage' />\n").show();

    $('#addLinkCrudArea').keydown(function (event) {
        if (event.keyCode === 13) {
            //alert("keydown 13");
            addImageLink();
        }
    });
}
function addImageLink() {
    if (isNullorUndefined($('#txtImageLink').val())) {
        alert("invalid link");
        return;
    }
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a destination");
        return;
    }
    $('#dataifyInfo').show().html("Adding ImageLink");
    var newLink = {};
    newLink.Link = $('#txtImageLink').val();
    newLink.FolderId = pSelectedTreeId;
    newLink.Path = pSelectedTreeFolderPath;
    $('#dashBoardLoadingGif').fadeIn();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/OggleFile/AddImageLink",
        data: newLink,
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            $('#dataifyInfo').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "image link added");
                $('#txtImageLink').val("");
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "NIA",
                    PageId: pSelectedTreeId,
                    Activity: newLink.Link
                });
                $('#dataifyInfo').hide();
            }
            else {

                $('#dataifyInfo').show().html("successModel.Success");
                alert("addImageLink: " + successModel.Success);
            }
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("addImageLink xhr error: " + getXHRErrorDetails(xhr));
        }
    });

}
function previewLinkImage() {
    $('#imgLinkPreview').attr('src', $('#txtImageLink').val());
    $('#imgLinkPreview').one("load", function () {
        //$('#footerMessage').html("image height: " + $('#imgLinkPreview').height());
        var winH = $(window).height();
        var headerH = $('header').height();
        var uploadImageAreaH = $('#uploadArea').height();
        $('.threeColumnLayout').height(Math.max(winH, uploadImageAreaH) - headerH);
    });
}

// CREATE NEW FOLDER
function showCreateNewFolderDialog() {
    $('#dashboardDialogTitle').html("Create New Folder");
    $('#dashboardDialogContents').html(
        //"       <div></div>\n" +
        "       <div><span>parent</span><input id='txtCreateFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly' /></div>\n" +
        "       <div><span>title</span><input id='txtNewFolderTitle' class='inlineInput roundedInput' /></div>\n" +
        "       <div class='roundendButton' onclick='performCreateNewFolder()'>Create Folder</div>\n");
    $('#txtNewFolderTitle').keydown(function (event) {
        if (event.keyCode === 13) {
            //alert("keydown 13");
            performCreateNewFolder();
        }
    });
    $("#txtCreateFolderParent").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();
}
function performCreateNewFolder() {
    $('#dashBoardLoadingGif').fadeIn();
    var newFolder = {};
    newFolder.FolderName = $('#txtNewFolderTitle').val();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/CatFolder/Create?parentId=" + pSelectedTreeId + "&newFolderName=" + $('#txtNewFolderTitle').val(),
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "new folder " + $('#txtNewFolderTitle').val() + " created");
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "NFC",
                    PageId: successModel.ReturnValue,
                    Activity: $('#txtNewFolderTitle').val()
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

// MOVE FOLDER
function showMoveFolderDialog() {
    $('#dashboardDialogTitle').html("Move Folder");
    $('#dashboardDialogContents').html(
        "       <div><span>folder to move</span><input id='txtMoveFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly' /></div>\n" +
        "       <div><span>destiation</span><input id='txtNewMoveDestiation' class='inlineInput roundedInput' /></div>\n" +
        "       <div class='roundendButton' onclick='performMoveFolder()'>move</div>\n" +
        "       <div id='moveFolderDirTreeContainer' class='floatingDirTreeContainer'></div>\n");

    $("#txtMoveFolderParent").val(pSelectedTreeFolderPath);
    loadDirectoryTree(1, "moveFolderDirTreeContainer", "dshBrdSubDirTreeClick", false);
    $('#dashboardDialog').fadeIn();
}
function performMoveFolder() {
    //$('#dataifyInfo').show().html("Preparing to Move Folder");
    $('#dataifyInfo').show().html("Moving Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/Folder/Move?sourceFolderId=" + pSelectedTreeId + "&destinationFolderId=" + moveFolderSelectedParentId,
        success: function (success) {
            if (success !== "ok") {
                logError("BUG", pSelectedTreeId, success, "dashboard.js movefolder");
            }
            $('#dashBoardLoadingGif').hide();
            //if (!success.startsWith("ERROR")) {
            displayStatusMessage("ok", "folder " + $('#txtMoveFolderDest').val() + " moved to " + $('.txtPartialDirTreePath').val());
            //$('#progressBar').progressbar("destroy");
            logDataActivity({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "LKM",
                PageId: pSelectedTreeId,
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
            if (!checkFor404(""))
                logError("XHR", pSelectedTreeId, getXHRErrorDetails(jqXHR), "");
        }
    });
}

// COPY FOLDER  (create stepchild)
function showAddStepChildFolderDialog() {
    $('#dashboardDialogTitle').html("Create Stepchild Folder");
    $('#dashboardDialogContents').html(
        "    <div><span>folder to copy</span><input id='txtStepParent' class='txtLinkPath roundedInput' readonly='readonly' /></div>\n" +
        "    <div><span>new name</span><input id='txtscNewFolderName' class='roundedInput' /></div>\n" +
        "    <div><span>link</span><input id='txtCustomFolderLink' class='roundedInput' /></div>\n" +
        "    <div class='roundendButton' onclick='createStaticPages($(\"#ckStaticIncludeSubfolders\").is(\":checked\"))'>Create Stepchild</div>\n" +
        "       <div id='scDirTreeContainer' class='floatingDirTreeContainer'></div>\n");
    $("#txtStepParent").val(pSelectedTreeFolderPath);
    loadDirectoryTree(1, "scDirTreeContainer", "dshBrdSubDirTreeClick", false);
    $('#dashboardDialog').fadeIn();
}
function perfomAddStepChildFolder() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/CatFolder/AddStepChild",
        data: {
            SourceFileId: dshBrdSubDirTreeId,
            DestinationId: pSelectedTreeId,
            LinkId: $('#txtCustomFolderLink').val(),
            FolderName: $('#txtscNewFolderName').val(),
            SortOrder: 1998
        },
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            $('#dataifyInfo').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " copied to " + $('.txtPartialDirTreePath').val());
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "CSF",  // Create Folder Stepchild
                    PageId: dshBrdSubDirTreeId,
                    Activity: "linkId: " + $('#txtCustomFolderLink').val() + " DestinationId: " + pSelectedTreeId
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

// MOVE MANY
function showMoveManyTool() {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    $('#dashboardContainer').html(
        "   <div id='moveManySection' class='fullScreenSection'>" +
        "       <div id='moveManyHeader' class='workAreaHeader'>\n" +
        "           <div class='workAreaHeaderArea'>\n" +
        "               <div class='workAreaHeaderTitle'>Move Many</div>\n" +
        "               <div class='workAreaHeaderDetailRow'>\n" +
        "                   <div class='moveManyHeaderLabel'>source</div><input id='txtMoveManySource' class='roundedInput' style='width:65%' readonly='readonly' /><br />" +
        "                   <div class='moveManyHeaderLabel'>destination</div><input id='txtMoveManyDestination' class='roundedInput' style='width:65%' readonly='readonly' />" +
        "                   <img class='dialogDirTreeButton' src='/Images/caretDown.png' " +
        "                      onclick='$(\"#mmDirTreeContainer\").toggle()'/>\n" +
        "                   <div class='floatRight'><input type='checkbox' id='mmCkSelectAll' onclick='mmSelectAll()'>  Select All</div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "           <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png' onclick='showDefaultWorkArea()'></div>\n" +
        "       </div>\n" +
        "       <div id='mmDirTreeContainer' class='floatingDirTreeContainer'></div>\n" +
        "       <div id='moveManyImageArea' class='workAreaDisplayContainer'></div>\n" +
        "       <div id='moveManyFooter' class='workareaFooter'>\n" +
        "           <button onclick='moveCheckedImages()'>Move</button>\n" +
        "           <div id='moveManyCountContainer' class='floatRight'></div>" +
        "       </div>\n" +
        "   </div>\n");


    $('#txtMoveManySource').val(pSelectedTreeFolderPath);
    // $('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyFooter').height());

    loadDirectoryTree(1, "mmDirTreeContainer", "dshBrdSubDirTreeClick", false);
    //$('#moveManyHeader').html(pSelectedTreeFolderPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));
    $('#txtMoveManyDestination').val("");
    $('#dashBoardLoadingGif').fadeIn();
    // get image links
    let imgRepo = settingsArray.ImageRepo;
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Links/GetImageLinks?folderId=" + pSelectedTreeId,
        success: function (imgLinks) {
            $('#dashBoardLoadingGif').hide();
            if (imgLinks.Success === "ok") {
                $('#moveManyImageArea').html("");
                $.each(imgLinks.Links, function (ndx, obj) {
                    $('#moveManyImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" + imgRepo + "/" + obj.FileName + "'/>" +
                        "<br/><input type='checkbox' class='loadManyCheckbox' imageId="  + obj.LinkId + "></div>");
                });
                $('#moveManyCountContainer').html(imgLinks.Links.length.toLocaleString());
            }
            else {
                alert("showMoveManyTool: " + imageLinksModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("showMoveManyTool")) 
                sendEmailToYourself("XHR ERROR in Dashboard.js showMoveManyTool", "Message: " + errorMessage);            
            alert("showMoveManyTool xhr error: " + errorMessage);
        }
    });
}
function mmSelectAll() {
    if ($('#mmCkSelectAll').is(":checked"))
        $('.loadManyCheckbox').prop("checked", true);
    else
        $('.loadManyCheckbox').prop("checked", false);
}
function moveCheckedImages() {
    if (dshBrdSubDirTreeId == 0) {
        alert("select a destination");
        return;
    }
    var checkedImages = [];
    $('#moveManyImageArea').children().each(function (ndx, obj) {
        if ($(this).find("input").is(":checked")) {
            checkedImages.push($(this).find("input").attr("imageId"));
        }
    });
    if (confirm("move " + checkedImages.length + " images to " + $('#txtMoveManyDestination').val())) {
        var moveManyModel = {
            SourceFolderId: pSelectedTreeId,
            DestinationFolderId: dshBrdSubDirTreeId,
            ImageLinkIds: checkedImages
        };
        $('#dashBoardLoadingGif').fadeIn();
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/Links/MoveMany",
            data: moveManyModel,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    //rebuildDirectoryTree();
                    showMoveManyTool();
                    $('#txtMoveManyDestination').val(selectedMMFolderPath);
                }
                else
                    alert("moveCheckedImages: " + success);
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("moveCheckedImages"))
                    sendEmailToYourself("XHR ERROR in Dashboard.js moveCheckedImages", "Message: " + errorMessage);
                alert("moveCheckedImages xhr error: " + errorMessage);
            }
        });
    }
    console.log("leaving move many");
}

// SORT TOOL
function showSortTool() {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    $('#dashboardContainer').html(
        "   <div id='sortToolSection' class='fullScreenSection'>" +
        "       <div id='sortToolHeader' class='workAreaHeader'>\n" +
        "           <div id='sortTableHeader' class='workAreaHeaderTitle'></div>\n" +
        "           <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png'" +
        "           onclick='showDefaultWorkArea()'></div>\n" +
        "       </div>\n" +
        "       <div>\n" +
        "           <div id='sortToolImageArea'  class='workAreaDisplayContainer'></div>\n" +
        "           <div id='sortToolFooter' class='workareaFooter'>\n" +
        "               <button onclick='updateSortOrder()'>ReSort</button>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n");
    //$('#sortToolImageArea').css("height", $('#sortToolSection').height() - $('#sortToolHeader').height());  // - $('#sortToolFooter').height())
    $('#sortToolImageArea').css("height", $('#dashboardContainer').height() - $('#sortToolHeader').height());
    loadSortImages();
}
function updateSortOrder() {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("sorting array");
    var sortOrderArray = [];
    $('#sortToolImageArea').children().each(function () {
        sortOrderArray.push({
            pageId: pSelectedTreeId,
            itemId: $(this).find("input").attr("id"),
            inputValue: $(this).find("input").val()
        });
    });
    $('#dataifyInfo').html("saving changes");
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/UpdateSortOrder",
        contentType: 'application/json',
        data: JSON.stringify(sortOrderArray),
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                $('#dataifyInfo').html("reloading");
                loadSortImages();
            }
            else {
                alert("updateSortOrder: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("updateSortOrder")) {
                sendEmailToYourself("XHR ERROR in Dashboard.js updateSortOrder",
                    "/api/ImagePage/GetImageLinks?folderId=" + pSelectedTreeId + " Message: " + errorMessage);
            }
            alert("updateSortOrder xhr error: " + errorMessage);
        }
    });
}
function loadSortImages() {
    $('#sortTableHeader').html(pSelectedTreeFolderPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ")
        + "(" + pSelectedTreeId + ")");
    $('#dashBoardLoadingGif').fadeIn();
    $.ajax({
        url: settingsArray.ApiServer + "api/Links/GetImageLinks?folderId=" + pSelectedTreeId,
        success: function (imgLinks) {
            $('#dashBoardLoadingGif').hide();
            if (imgLinks.Success === "ok") {
                $('#sortToolImageArea').html("");
                $.each(imgLinks.Links, function (ndx, obj) {
                    $('#sortToolImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" +
                        settingsImgRepo + obj.FileName + "'/>" +
                        "<br/><input class='sortBoxInput' id=" + obj.LinkId + " value=" + obj.SortOrder + "></div>");
                });
                $('#dataifyInfo').hide();
            }
            else {
                alert("loadSortImages: " + imageLinksModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("loadSortImages")) {

                //sendEmailToYourself("XHR ERROR in Dashboard.js prepareXhamsterPage",
                //    " / api / ImagePage / GetImageLinks ? folderId =" + pSelectedTreeId + " Message: " + errorMessage);
            }
            alert("loadSortImages xhr error: " + errorMessage);
        }
    });
}

// EMERGENCY TOOLS
function addFileDates() {
    $('#dataifyInfo').show().html("adding file dates");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/RepairLinks/UpdateDates?startFolderId=" + pSelectedTreeId,
        success: function (results) {
            $('#dashBoardLoadingGif').hide();
            if (results.Success === "ok") {
                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val());
                //$('#progressBar').hide();
                //$('#progressBar').progressbar("destroy");
                alert("addFileDates : " + results.Success);
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
        url: settingsArray.ApiServer + "/api/RepairLinks/EmergencyFolderLocationFix?root=" + pSelectedTreeId,
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
            if (!checkFor404("emergencyFolderLocationFix")) {
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
        url: settingsArray.ApiServer + "/api/RepairLinks/MoveManyCleanup?root=" + pSelectedTreeId,
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
            if (!checkFor404("emergencyFolderLocationFix")) {
                alert("XHR ERROR in Dashboard.js renameFolder" + errorMessage);
            }
        }
    });
}


function showAddVideoLink() {
    $('.workAreaContainer').hide();
    $('#divAddFile').show();
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
                url: settingsArray.ApiServer + "/api/FtpDashBoard/SaveFileAs?imageName=" + $('#uplImage').val() + "&destinationPath=" + pSelectedTreeFolderPath,
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
function prepareXhamsterPage() {
    $('#dashBoardLoadingGif').show();
    try {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/xHampster?folderId=" + pSelectedTreeId,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    displayStatusMessage("ok", "Xhamster Page created");
                }
                else logError("BUG", apFolderId, success, "prepareXhamsterPage");
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                if (!checkFor404("prepareXhamsterPage")) {
                    logError("XHR", apFolderId, getXHRErrorDetails(jqXHR), "prepareXhamsterPage");
                }
            }
        });
    } catch (e) {
        logError("CAT", apFolderId, e, "prepareXhamsterPage");
    }
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
        videoLink.FolderId = pSelectedTreeId;

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
        url: settingsArray.ApiServer + "api/FtpDashBoard/GetFileProps?folderId=" + pSelectedTreeId,
        success: function (success) {
            $('#indexPageLoadingGif').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "done");
                $('#dataifyInfo').hide();
            }
            else
                alert("GetFileProps: " + success);
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("loadProperties")) {
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
            url: settingsArray.ApiServer + "/api/MoveImage/CollapseFolder?folderId=" + pSelectedTreeId,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    displayStatusMessage("ok", "collapse succeded");
                    rebuildDirectoryTree();
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
                if (!checkFor404("collapseChildFolder")) {
                    sendEmailToYourself("XHR ERROR in Dashboard.js collapseChildFolder", "/api/MoveImage/CollapseFolder?folderId=" + pSelectedTreeId + " Message: " + errorMessage);
                }
            }
        });
    }
}

function XXtestAddVisitor() {
    $('#dataifyInfo').show().html("sending test addVisitor");
    addVisitor(3309, "dashboard");
}

function dshBrdSubDirTreeClick(danniPath, folderId) {
    dshBrdSubDirTreeId = folderId;
    let selectedMMFolderPath = danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
    $('#txtMoveManyDestination').val(selectedMMFolderPath);
    $('#txtscNewFolderName').val(selectedMMFolderPath);
    $('#txtNewMoveDestiation').val(selectedMMFolderPath);
    $('#mmDirTreeContainer').fadeOut();
}



function loadDashboardDirTree() {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("loading directory tree");
    loadDirectoryTree(1, "dashboardRightColumn", "dashBoardDirTreeClick", false);
}

function onDirTreeComplete() {
    $('#dashBoardLoadingGif').hide();
    showAddImageLinkDialog();
    resizeDashboardPage();
    setTimeout(function () { $('#dataifyInfo').hide() }, 2500);
}



function dashBoardDirTreeClick(danniPath, folderId) {
    pSelectedTreeId = folderId;
    pSelectedTreeFolderPath = danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
    $('.txtLinkPath').val(pSelectedTreeFolderPath);
    //$("#mainMenuContainer").html($('.txtLinkPath').val());
}
