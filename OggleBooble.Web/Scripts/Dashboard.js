function dashboardStartup() {
    document.title = "dashboard : OggleBooble";
    changeFavoriteIcon("redBallon");
    $('#indexMiddleColumn').html(dashboardHtml());

    $('#addLinkCrudArea').keydown(function (event) {
        if (event.keyCode === 13) {
            //alert("keydown 13");
            addImageLink();
        }
    });
    $('#dashboardDialog').draggable();
    $('#dashboardDialog').css("top", 250);
    $('#dashboardDialog').css("left", 450);
    showDefaultWorkArea();
    setOggleHeader(3910, "dashboard");
    setOggleFooter(3910, "dashboard");
    let userRole = getUserRole();
    if (userRole == "not registered") {
        //alert("not registered");
        window.location.href = "Index.html";
    }
    loadHeaderTabs(userRole);
    setLeftMenu(userRole);
    resizeDashboardPage();
    loadDashboardDirTree(false);
    window.addEventListener("resize", resizeDashboardPage);
}

function showDefaultWorkArea() {
    $('.fullScreenSection').hide();
    $('#defaultSection').show();
    activeDirTree = "dashboard";
}

function dashboardHtml() {
    return "<img id='dashBoardLoadingGif' class='loadingGif' title='loading gif' alt='' src='Images/loader.gif'/>\n" +
        "<div id='dashboardContainer' class='fullScreenContainer'>" +
        "   <div id='defaultSection' class='fullScreenSection flexbox'>\n" +
        "      <div id='dashboardLeftColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='dashboardLeftMenu' class='oggleVerticalMenu' ></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardMiddleColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='workAreaContainer' class='workAreaContainer'>" +
        "               <div id='addImageLinkDialog'>\n" +
        "                   <div id='addLinkCrudArea' class='addLinkCrudArea'>\n" +
        "                       <div class='flexbox'>\n" +
        "                           <label>link</label><input id='txtImageLink' tabindex='1' class='roundedInput' onblur='previewLinkImage()'/>\n" +
        "                       </div>\n" +
        "                       <div class='flexbox'>\n" +
        "                           <label>path</label><input class='roundedInput txtLinkPath' tabindex='-1' readonly='readonly' />\n" +
        "                       </div>\n" +
        "                       <div class='roundendButton' tabindex='2' onclick='addImageLink()'>Insert</div>\n" +
        "                   </div>\n" +
        "                   <img id='imgLinkPreview' class='linkImage' />\n" +
        "               </div>\n" +
        "          </div>\n" +
        "          <div id='repairErrorReport' class='errorInfobox'></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardRightColumn' class='dashboardContainerColumn'></div>\n" +
        "   </div>\n" +
        "   <div id='moveManySection' class='fullScreenSection'>" +
        "       <div id='moveManyHeader' class='workAreaHeader'>\n" +
        "           <div class='workAreaHeaderArea'>\n" +
        "               <div id='moveManyTitle' class='workAreaHeaderTitle'>Move Many</div>\n" +
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
        "           <button id='moveManyButton' onclick='moveCheckedImages(" + mmSourceFolderId + ")'>Move</button>\n" +
        "           <div id='moveManyCountContainer' class='floatRight'></div>" +
        "       </div>\n" +
        "   </div>\n" +
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
        "               <button onclick='autoIncrimentSortOrder()'>AutoIncriment</button>\n" +        
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +
        "   <div id='reportsSection' class='fullScreenSection flexbox'>\n" +
        "      <div id='reportsLeftColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='reportsLeftMenu' class='oggleVerticalMenu' ></div>\n" +
        "      </div>\n" +
        "       <div id='reportsMiddleColumn' class='dashboardContainerColumn'>\n" +
        "           <div class='workAreaContainer'>" +
        "               <div id='reportsHeader' class='workAreaHeader'>\n" +
        "                   <div class='workAreaHeaderArea'>\n" +
        "                       <div id='reportsHeaderTitle' class='workAreaHeaderTitle'>Reports</div>\n" +
        "                       <div class='reportsHeaderDetailRow'></div>\n" +
        "                   </div>\n" +
        "                   <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png' onclick='showDefaultWorkArea()'></div>\n" +
        "               </div>\n" +
        "               <div id='reportsContentArea' class='workAreaDisplayContainer'></div>\n" +
        "               <div id='reportsFooter' class='workareaFooter'></div>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +
        "   <div id='dataifyInfo' class='infoLine' onclick='$(\"#dataifyInfo\").hide()'></div>\n" +
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
    $('#dashboardMiddleColumn').css("width", middleColumnW + widthFF);

    //height
    let winH = $(window).height();
    let headerH = $('#oggleHeader').height();
    //$('.threeColumnLayout').css("height", winH - headerH);
    //let adjH = $('.threeColumnLayout').height() - $('header').height();
    $('#dashboardContainer').css("height", winH - headerH + widthFF);
    //$('#workAreaContainer').css("height", $('#dashboardContainer').height();
    //$('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyFooter').height());
    //alert("dashboardContainer height: " + adjH + " middleColumnW: " + middleColumnW);
}

function setLeftMenu(role) {
    switch (role) {
        case "normal":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='loadDashboardDirTree(true)'>ReBuild Dir Tree</div>\n" +
                "<div class='clickable' onclick='showUpLoadFileDialog()'>Upload a file</div>\n" +
                "<div class='clickable' onclick='showDefaultWorkArea()'>Add Image Link</div>\n");
            $('#divAddImages').show();
            break;
        case "power user": {
            //$('.workAreaContainer').hide();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='loadDashboardDirTree(true)'>ReBuild Dir Tree</div>\n" +
                "<div class='clickable' onclick='showSortTool()'>Sort Tool</div>\n" +
                "<div class='clickable' onclick=\"$('#createNewFolderDialog').dialog('open');\">Create New Folder</div>\n" +
                "<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>\n" +
                "<div class='clickable' onclick='showAddStepChildFolderDialog()'>Copy Folder</div>\n" +
                "<div class='clickable' onclick=\"$('#renameFolderCrud').dialog('open');\">Rename Folder</div>");
            break;
        }
        case "Manage Roles":
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='showAssignRolesDialog()'>Assign User Roles</div>\n" +
                "<div class='clickable' onclick='showAddRolesDialog()'>Edit Roles</div>");
            break;
        case "reports":
            document.title = "reports : OggleBooble";
            $('#reportsLeftMenu').html("<div class='clickable' onclick='runMetricsMatrixReport()'>Performance Metrics</div>\n" +
                "<div class='clickable' onclick='runPageHitReport()'>Page Hit Report</div>\n" +
                "<div class='clickable' onclick='eventReport()'>Event Activity</div>\n" +
                "<div class='clickable' onclick='errorReport()'>Error Log</div>\n" +
                "<div class='clickable' onclick='FeedbackReport()'>Feedback</div>\n" +
                "<div class='clickable' onclick='runImpactReport()'>Impact</div>\n" +
                "<div class='clickable' onclick='showMostActiveUsersReport()'>Most Active Users</div>\n" +
                "<div class='clickable' onclick='showLatestImageHitsReport()'>Latest Image Hits</div>");
            //  <div class='clickable' onclick='buildCenterfoldLsist()'>Build Centerfold List</div>\n" +
            break;
        case "admin":
            document.title = "dashboard : OggleBooble";
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='loadDashboardDirTree(true)'>ReBuild Dir Tree</div>\n" +
                "<div class='clickable' onclick='showDefaultWorkArea()'>Add Image Link</div>\n" +
                "<div class='clickable' onclick='showCreateStaticPagesDialog()'>Create Static Pages</div>\n" +
                "<div class='clickable' onclick='showRepairLinksDialog()'>Repair Links</div>\n" +
                "<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>\n" +
                "<div class='clickable' onclick='showSortTool()'>Sort Tool</div>\n" +
                "<div class='clickable' onclick='showCreateNewFolderDialog(" + pSelectedTreeId + ")';\">Create New Folder</div>\n" +
                "<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>\n" +
                "<div class='clickable' onclick='showAddStepChildFolderDialog()'>Add As StepChild</div>\n" +
                "<div class='clickable' onclick='showRenameFolderDialog()'>Rename Folder</div>\n" +
                "<div class='clickable' onclick='showMoveManyTool(1);'>Move Many</div>\n" +
                "<div class='clickable' onclick='showMoveManyTool(2);'>Copy Many</div>\n" +
                "<div class='clickable' onclick='showRipPdfDialog();'>ripPdf</div>\n"+
                "<div class='clickable' onclick='PlayboyPlusDupeCheck();'>PlayboyPlusDupeCheck</div>\n" +
                "<div class='clickable' onclick='showAutoIncrimentDialog();'>Auto Incriment</div>\n" +
                "<div class='clickable' onclick='buildHtmlPage()'>Build Html Page</div>"
            );
            //"<div class='clickable' onclick='removeDupeIps();'>removeDupeIps</div>\n" +
            //"<div class='clickable' onclick='HardcoreFilecounts();'>HardcoreFilecounts()</div>");
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
        case "normal":
            $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('normal');\">Add Images</a>");
            break;
        case "power user":
            $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Add Images');\">Add Images</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Manage Folders');\">Manage Folders</a>");
            break;
        case "admin":
            //alert("isInRole Oggle admin")
            $('#breadcrumbContainer').html("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('normal');showDefaultWorkArea()\">Add Images</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('admin');showDefaultWorkArea()\">Admin</a>");
            $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:showReportsSection();\">Reports</a>");
            //$('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Manage Roles');\">Manage Roles</a>");
            $('#headerMessage').html("Oggle admin");
            //$('.adminLevelOption').show();
            break;
        default:
            alert("headerTabs role not undestood: " + role);
    }
}

function showReportsSection() {
    $('.fullScreenSection').hide();
    $('#reportsSection').show();
    setLeftMenu("reports");
    $('#reportsMiddleColumn').css("width", $('#dashboardContainer').width() - $('#reportsLeftColumn').width());
}

// RELOAD DIR TREE
let infoStart;
function loadDashboardDirTree(forceRefresh) {
    infoStart = Date.now();
    activeDirTree = "dashboard";
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("rebuilding directory tree");
    loadDirectoryTree(1, "dashboardRightColumn", forceRefresh);
}

function onDirTreeComplete() {
    $('#dashBoardLoadingGif').hide();
    resizeDashboardPage();
    let delta = (Date.now() - infoStart);
    if (delta < 1000)
        $('#dataifyInfo').hide();
    else {
        $('#dataifyInfo').html("directory tree rebuild took: " + (delta / 1000).toFixed(3));
        //$('#dataifyInfo').show().html("rebuilding directory tree took: " + delta.toFixed(3));
        //$('#dataifyInfo').show().html("rebuilding directory tree took: " + delta.toLocaleString());
        //setTimeout(function () { $('#dataifyInfo').hide() }, 4000);
    }
}

// REPAIR FUNCTIONS
function showRepairLinksDialog() {
    $('#dashboardDialogTitle').html("Repair Links");
    $('#dashboardDialogContents').html(
        "    <div><span>folder to repair</span><input id='txtFolderToRepair' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders' /></div>\n" +
        "    <div class='roundendButton' onclick='performRepairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n");
    $("#txtFolderToRepair").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();
}
function performRepairLinks(justOne) {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    $('#repairErrorReport').hide();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/RepairLinks/Repair?folderId=" + pSelectedTreeId + "&localImgRepo=" + settingsArray.LocalImgRepo + "&recurr=" + justOne,
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
                        if (repairReport.Errors.length > 0) {
                            $('#repairErrorReport').show().html("");
                            $.each(repairReport.Errors, function (idx, obj) {
                                $('#repairErrorReport').append("<div>" + obj + "</div>");
                            })
                        }

                        $('#dataifyInfo').append(", Errors: " + repairReport.Errors.length);
                        //if (repairReport.LinksEdited > 0)
                        //    $('#dataifyInfo').append(", links Edited: " + repairReport.LinksEdited);
                        //if (repairReport.ImageFilesAdded > 0)
                        //    $('#dataifyInfo').append(", ImageFilesAdded: " + repairReport.ImagesRenamed);
                        if (repairReport.PhyscialFileRenamed > 0)
                            $('#dataifyInfo').append(", Physcial File Names Renamed: " + repairReport.PhyscialFileRenamed);
                        if (repairReport.ImageFilesRenamed > 0)
                            $('#dataifyInfo').append(", Image File Names Renamed: " + repairReport.ImageFilesRenamed);
                        if (repairReport.ImagesRenamed > 0)
                            $('#dataifyInfo').append(", Image Files Renamed: " + repairReport.ImagesRenamed);
                        if (repairReport.ZeroLenFileResized > 0)
                            $('#dataifyInfo').append(", ZeroLen File Resized: " + repairReport.ZeroLenFileResized);
                        if (repairReport.ImageFilesMoved > 0)
                            $('#dataifyInfo').append(", Images Moved: " + repairReport.ImageFilesMoved);
                        if (repairReport.CatLinksRemoved > 0)
                            $('#dataifyInfo').append(", Links Removed: " + repairReport.CatLinksRemoved);
                        if (repairReport.CatLinksAdded > 0)
                            $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);
                        if (repairReport.ImageFilesAdded > 0)
                            $('#dataifyInfo').append(", ImageFiles Added: " + repairReport.ImageFilesAdded);
                        if (repairReport.ImagesDownLoaded > 0)
                            $('#dataifyInfo').append(", ImageFiles ImagesDownLoaded: " + repairReport.ImagesDownLoaded);
                        if (repairReport.ImageFilesRemoved > 0)
                            $('#dataifyInfo').append(", ImageFiles Removed: " + repairReport.ImageFilesRemoved);
                        if (repairReport.ZeroLenImageFilesRemoved > 0)
                            $('#dataifyInfo').append(", ZeroLen ImageFiles Removed: " + repairReport.ZeroLenImageFilesRemoved);
                    }
                    catch (e) {
                        alert("problem displaying repair report: " + e);
                    }
                }
                else {
                    //logError("AJX", apFolderId, repairReport.Success, "performRepairLinks");
                    alert(repairReport.Success);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = "performRepairLinks"; // arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, pSelectedTreeId, "performRepairLinks")) logError("XHR", pSelectedTreeId, errMsg, "performRepairLinks");
            }
        });
    } catch (e) {
        logError("CAT", pSelectedTreeId, e, "performRepairLinks");
    }
}

function removeDupeIps() {
    let start = Date.now();
    $('#dataifyInfo').show().html("performing one time fix");
    //$('#dashBoardLoadingGif').fadeIn();
    $('#repairErrorReport').hide();
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/RepairLinks/RemoveDuplicateIps",
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
                        
                        $('#dataifyInfo').append(", VisitorRowsRemoved: " + repairReport.VisitorRowsRemoved);

                        $('#dataifyInfo').append(", ImageHitsUpdated: " + repairReport.ImageHitsUpdated);
                        $('#dataifyInfo').append(", PageHitsUpdated: " + repairReport.PageHitsUpdated);
                        $('#dataifyInfo').append(", ActivityLogsUpdated: " + repairReport.ActivityLogsUpdated);

                        if (repairReport.Errors.length > 0) {
                            $('#repairErrorReport').show().html("");
                            $.each(repairReport.Errors, function (idx, obj) {
                                $('#repairErrorReport').append("<div>" + obj + "</div>");
                            })
                        }

                        //if (repairReport.CatLinksAdded > 0)
                        //    $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);

                        //if (repairReport.ImageFilesAdded > 0)
                        //    $('#dataifyInfo').append(", ImageFiles Added: " + repairReport.ImageFilesAdded);

                        //repairReport.Errors.forEach(function (element) {
                        //    $('#repairLinksReport').append("<div> errors: " + element + "</div>");
                        //});
                    }
                    catch (e) {
                        alert("problem displaying repair report: " + e);
                    }
                }
                else {
                    //logError("AJX", apFolderId, repairReport.Success, "performRepairLinks");
                    alert(repairReport.Success);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, 111, "removeDupeIps")) logError("XHR", pSelectedTreeId, errMsg, "removeDupeIps");
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
            }
            else {
                if (results.Errors.length > 0) {
                    $('#dashboardMiddleColumn').append("<div id='repairErrorReport' class='errorInfobox'></div>");
                    $.each(results.Errors, function (idx, obj) {
                        $('#repairErrorReport').append("<div>" + obj + "</div>");
                    })
                }
                alert(results.Success);
                $('#dataifyInfo').append(", Errors: " + results.Errors.length);
            }
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createStaticPages xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

// ADD IMAGE LINK
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
    var newLink = {
        Link: $('#txtImageLink').val(),
        FolderId: pSelectedTreeId,
        Path: pSelectedTreeFolderPath
    };
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
                    FolderId: pSelectedTreeId,
                    Details: pSelectedTreeFolderPath
                });
            }
            else {
                $('#dataifyInfo').show().html(successModel.Success);
                //$('#txtImageLink').val("");
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
        "       <div><span>type</span><select id='ddNewFolderType' class='inlineInput roundedInput'>\n" +
        "              <option value='singleChild'>singleChild</option>\n" +
        "              <option value='singleModel'>singleModel</option>\n" +
        "              <option value='singleParent'>singleParent</option>\n" +
        "              <option value='multiModel'>multiModel</option>\n" +
        "              <option value='multiFolder'>multiFolder</option>\n" +
        "          </select></div>\n" +
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
        url: settingsArray.ApiServer + "/api/CatFolder/Create?parentId=" + pSelectedTreeId +
            "&newFolderName=" + $('#txtNewFolderTitle').val() + "&folderType=" + $('#ddNewFolderType').val(),
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "new folder " + $('#txtNewFolderTitle').val() + " created");
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "NFC",
                    PageId: successModel.ReturnValue,
                    Details: $('#txtNewFolderTitle').val()
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
        "       <div><span>destiation</span><input id='txtNewMoveDestiation' class='inlineInput roundedInput' />" +
        "           <img class='dialogDirTreeButton' src='/Images/caretDown.png' onclick='$(\"#moveFolderDirTreeContainer\").toggle()'/>\n" +
        "       </div>\n" +
        "       <div class='roundendButton' onclick='performMoveFolder()'>move</div>\n" +
        "       <div id='moveFolderDirTreeContainer' class='floatingDirTreeContainer'></div>\n");

    $("#txtMoveFolderParent").val(pSelectedTreeFolderPath);
    activeDirTree = "moveFolder";
    loadDirectoryTree(1, "moveFolderDirTreeContainer", false);
    $('#dashboardDialog').fadeIn();
}
function performMoveFolder() {
    //$('#dataifyInfo').show().html("Preparing to Move Folder");
    $('#dataifyInfo').show().html("Moving Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/CatFolder/Move?folderId=" + pSelectedTreeId + "&newParent=" + pSelectedTreeId,
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "folder " + pSelectedTreeFolderPath + " moved to " + $('#txtNewMoveDestiation').val());
                loadDashboardDirTree(true);
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "LKM",
                    FolderId: pSelectedTreeId,
                    //PageName: $('.txtPartialDirTreePath').val(),
                    Details: "folder moved from:" + $('#txtNewFolderParent').val() + " to: " + $('#txtMoveFolderDest').val()
                });
            }
            else
                logError("AJX", pSelectedTreeId, success, "dashboard.js movefolder");
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            //let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, pSelectedTreeId, "performMoveFolder")) logError("XHR", pSelectedTreeId, errMsg, "performMoveFolder");
        }
    });
}

// ADD STEPCHILD
function showAddStepChildFolderDialog() {
    let cfSsorceFolderId = pSelectedTreeId;  // captured before 
    $('#dashboardDialogTitle').html("Create Stepchild Folder");
    $('#dashboardDialogContents').html(
        "    <div><span>parent folder</span><input id='txtStepParent' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>child folder</span><input id='txtscSourceFolderName' class='roundedInput' readonly='readonly'/>\n" +
        "       <img class='dialogDirTreeButton' src='/Images/caretDown.png' onclick='$(\"#scDirTreeContainer\").toggle()'/></div>\n" +
        "    <div><span>new name</span><input id='txtscNewFolderName' class='roundedInput' /></div>\n" +
        "    <div><span>new link</span><input id='txtCustomFolderLink' class='roundedInput' /></div>\n" +
        "    <div class='roundendButton' onclick='perfomAddStepChildFolder(" + cfSsorceFolderId + ")'>Create Stepchild</div>\n" +
        "       <div id='scDirTreeContainer' class='floatingDirTreeContainer'></div>\n");
    $("#txtStepParent").val(pSelectedTreeFolderPath);
    activeDirTree = "stepchild";
    loadDirectoryTree(1, "scDirTreeContainer", false);
    $('#dashboardDialog').fadeIn();
}
function perfomAddStepChildFolder(cfSsorceFolderId) {
    //alert("sorceFolderId: " + cfSsorceFolderId + "  DestinationId: " + pSelectedTreeId);
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/CatFolder/AddStepChild",
        data: {
            SourceFileId: cfSsorceFolderId,
            DestinationId: pSelectedTreeId,
            LinkId: $('#txtCustomFolderLink').val(),
            FolderName: $('#txtscNewFolderName').val(),
            SortOrder: 1998
        },
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            $('#dataifyInfo').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "folder " + $('#txtscSourceFolderName').val() + " added as stepchild to " + $('#txtStepParent').val());
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "CSF",  // Create Folder Stepchild
                    FolderId: pSelectedTreeId,
                    Details: "linkId: " + $('#txtCustomFolderLink').val() + " DestinationId: " + pSelectedTreeId
                });

                $('#txtNewFolderParent').val('');
                $('.txtPartialDirTreePath').val('');
                //$('#moveFolderCrud').dialog("close");
            }
            else
                alert("add stepchild: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("add stepchild xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

// MOVE MANY
let mmSourceFolderId, mmSelectedTreeFolderPath;
function showMoveManyTool(cx) {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    if (cx == 2) {
        $('#moveManyTitle').html("Copy Many");
        $('#moveManyButton').html("Copy");
    }
    else {
        $('#moveManyTitle').html("Move Many");
        $('#moveManyButton').html("Move");
    }
    mmSourceFolderId = pSelectedTreeId;
    mmSelectedTreeFolderPath = pSelectedTreeFolderPath;
    $('.fullScreenSection').hide();
    $('#moveManySection').show();
    $('#txtMoveManySource').val(mmSelectedTreeFolderPath);
    $('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyHeader').height());
    activeDirTree = "moveMany";
    loadDirectoryTree(1, "mmDirTreeContainer", true);
    loadMMcheckboxes();
}
function loadMMcheckboxes() {
    $('#dashBoardLoadingGif').fadeIn();
    let imgRepo = settingsArray.ImageRepo;
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Links/GetMoveableImageLinks?folderId=" + mmSourceFolderId,
        success: function (imgLinks) {
            $('#dashBoardLoadingGif').hide();
            if (imgLinks.Success === "ok") {
                $('#moveManyImageArea').html("");
                $.each(imgLinks.Links, function (ndx, obj) {
                    $('#moveManyImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" + imgRepo + "/" + obj.FileName + "'/>" +
                        "<br/><input type='checkbox' class='loadManyCheckbox' imageId=" + obj.LinkId + "></div>");
                });
                $('#moveManyCountContainer').html(imgLinks.Links.length.toLocaleString());
            }
            else { logError("AJX", mmSourceFolderId, imgLinks.Success, "getDeepFolderCounts"); }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, mmSourceFolderId, "loadMMcheckboxes")) logError("XHR", mmSourceFolderId, errMsg, "loadMMcheckboxes");
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
    if (mmSourceFolderId == pSelectedTreeId) {
        alert("select a destination");
        return;
    }
    var checkedImages = [];
    $('#moveManyImageArea').children().each(function (ndx, obj) {
        if ($(this).find("input").is(":checked")) {
            checkedImages.push($(this).find("input").attr("imageId"));
        }
    });

    let mmContext = "move";
    if ($('#moveManyTitle').html() == "Copy Many")
        mmContext = "copy";

    //let lblMoveManyDestination = $('#txtMoveManyDestination').val().replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
    let lblMoveManyDestination = $('#txtMoveManyDestination').val().replace(/%20/g, " ");
    if (confirm(mmContext + " " + checkedImages.length + " images to " + lblMoveManyDestination)) {
        let moveManyModel = {
            Context: mmContext,
            SourceFolderId: mmSourceFolderId,
            DestinationFolderId: pSelectedTreeId,
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
                    loadMMcheckboxes();
                }
                else { logError("AJX", mmSourceFolderId, success, "moveCheckedImages"); }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, pSelectedTreeId, "loadMMcheckboxes")) logError("XHR", pSelectedTreeId, errMsg, "loadMMcheckboxes");
            }
        });
    }
}

// AUTO INCRIMENT
function showAutoIncrimentDialog() {
    $('#dashboardDialogTitle').html("AutoIncriment Folder");
    $('#dashboardDialogContents').html(
        "<div><span>folder to move</span><input id='txtAutoIncrimentParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly' /></div>\n" +
        "<div><span>include all subfolders </span><input type='checkbox' id='ckAutoIncrimentIncludeSubfolders' checked='checked' /></div>\n" +
        "<div class='roundendButton' onclick='performAutoIncriment($(\"#ckAutoIncrimentIncludeSubfolders\").is(\":checked\"))'>incriment</div>\n");
    $("#txtAutoIncrimentParent").val(pSelectedTreeFolderPath);
    $('#dashboardDialog').fadeIn();
}
function performAutoIncriment(recurr) {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').html("incrimenting").show();
    var start = Date.now();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/AutoIncriment?folderId=" + pSelectedTreeId + "&recurr=" + recurr,
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success == "ok") {
                let delta = Date.now() - start;
                let minutes = Math.floor(delta / 60000);
                let seconds = (delta % 60000 / 1000).toFixed(0);
                //console.log("build Centerfold List took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                $('#dataifyInfo').html("incrimented " + successModel.ReturnValue + " took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
            }
            else { logError("AJX", pSelectedTreeId, success, "performAutoIncriment"); }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, pSelectedTreeId, "performAutoIncriment")) logError("XHR", pSelectedTreeId, errMsg, "performAutoIncriment");
        }
    });
}

// SORT TOOL
function showSortTool() {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    $('.fullScreenSection').hide();
    $('#sortToolSection').show();
    $('#sortToolImageArea').css("height", $('#dashboardContainer').height() - $('#sortToolHeader').height());
    loadSortImages();
}
function loadSortImages() {
    $('#sortTableHeader').html(pSelectedTreeFolderPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ")
        + "(" + pSelectedTreeId + ")");
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').html("loading sorted images");
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
                $('#dashBoardLoadingGif').hide();
                $('#dataifyInfo').hide();
            }
            else { logError("AJX", pSelectedTreeId, imgLinks.Success, "loadSortImages"); }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, pSelectedTreeId, "loadSortImages")) logError("XHR", pSelectedTreeId, errMsg, "loadSortImages");
        }
    });
}
function updateSortOrder() {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("sorting array");
    var sortOrderArray = [];
    $('#sortToolImageArea').children().each(function () {
        sortOrderArray.push({
            FolderId: pSelectedTreeId,
            ItemId: $(this).find("input").attr("id"),
            SortOrder: $(this).find("input").val()
        });
    });
    saveSortChanges(sortOrderArray);
}
function autoIncrimentSortOrder() {
    if (confirm("reset all sort orders")) {
        $('#dashBoardLoadingGif').show();
        $('#dataifyInfo').show().html("sorting array");
        var sortOrderArray = [];
        let autoI = 0;

        //alert("pSelectedTreeFolderPath: " + pSelectedTreeId);

        $('#sortToolImageArea').children().each(function () {
            sortOrderArray.push({
                FolderId: pSelectedTreeId,
                ItemId: $(this).find("input").attr("id"),
                SortOrder: autoI += 2
            });
        });
        saveSortChanges(sortOrderArray);
    }
}

function saveSortChanges(sortOrderArray) {
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
                $('#dashBoardLoadingGif').hide();
                alert(success);
                logError("AJX", mmSourceFolderId, success, "moveCheckedImages");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, pSelectedTreeId, "saveSortChanges")) logError("XHR", pSelectedTreeId, errMsg, "saveSortChanges");
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, pSelectedTreeId, "emergencyFolderLocationFix")) logError("XHR", pSelectedTreeId, errMsg, "emergencyFolderLocationFix");
        }
    });
}
function MoveManyCleanup() {
    let start = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("fixing folder location " + $('.txtLinkPath').val());
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/RepairLinks/MoveManyCleanup?root=" + pSelectedTreeId,
        success: function (repairReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (repairReportModel.Success === "ok") {
                let delta = Date.now() - start;
                let minutes = Math.floor(delta / 60000);
                let seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("emergencyFolderLocationFix took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                $('#dataifyInfo').show().html("loc fix took: " + minutes + ":" + seconds + " rows processed  " + repairReportModel.RowsProcessed + " recs fixed: " + repairReportModel.LinksEdited + " Errors: " + repairReportModel.Errors.length);
            }
            else {
                alert("emergencyFolderLocationFix: " + repairReportModel.Success);
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, pSelectedTreeId, "MoveManyCleanup")) logError("XHR", pSelectedTreeId, errMsg, "MoveManyCleanup");
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

// XHAMPSTER PAGE
function prepareXhamsterPage() {
    $('#dashBoardLoadingGif').show();
    try {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/Xhampster/Create?folderId=" + pSelectedTreeId,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok")
                    displayStatusMessage("ok", "Xhamster Page created");
                else {
                    //logError("AJX", 3499, success, "prepareXhamsterPage");
                    alert(success);
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, pSelectedTreeId, "prepareXhamsterPage")) {
                    //logError("XHR", 3499, errMsg, functionName);
                    alert(errMsg);
                }
            }
        });
    } catch (e) {
        logError("CAT", 3499, e, "prepareXhamsterPage");
    }
}

// RIP PDF
function showRipPdfDialog() {

    $('#dashboardDialogTitle').html("Rip pdf");
    $('#dashboardDialogContents').html(
        "<div><span>pdf file</span><input id='txtPdfFile' class='inlineInput roundedInput'/></div>\n" +
        "<div><span>dest folder</span><input id='txtDestFolder' class='inlineInput roundedInput'/></div>\n" +
        "<div><span>start page</span><input id='txtStartPage'/><span>end page</span><input id='txtEndPage'/></div>\n" +
        "<div class='roundendButton' onclick='performRipPdf()'>rip one</div>\n");
    $('#dashboardDialog').fadeIn();
}
function performRipPdf() {
    let sourceFile = $('#txtPdfFile').val();
    let destinationPath = $('#txtDestFolder').val();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("ripping " + sourceFile);

    if ($('#txtStartPage').val() != "") {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Pdf/RipPdfRange?sourceFile=" + sourceFile + "&destinationPath=" + destinationPath + "&startPage=" +
                $('#txtStartPage').val() + "&endPage=" + $('#txtEndPage').val(),
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    $('#dataifyInfo').show().html("done");
                }
                else {
                    alert(success);
                    logError("AJX", 2020, success, "RipPdf");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert(errMsg);
                if (!checkFor404(errMsg, destinationPath, "performRipPdf")) logError("XHR", destinationPath, errMsg, "performRipPdf");
            }
        });
    }
    else {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Pdf/RipPdf?sourceFile=" + sourceFile + "&destinationPath=" + destinationPath,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    $('#dataifyInfo').show().html("done");
                }
                else {
                    alert(success);
                    logError("AJX", 2020, success, "RipPdf");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                alert(errMsg);
                if (!checkFor404(errMsg, destinationPath, "performRipPdf")) logError("XHR", destinationPath, errMsg, "performRipPdf");
            }
        });
    }
}

// UNUSED
function showRenameFolderDialog(folderId, folderName) {
    showLinkDialog();
    $('#centeredDialogTitle').html("Rename Folder: " + folderName);
    //$('#centeredDialogContents').html(
    //    "<div><span>folder to rename</span>" + folderName + "</div>\n" +
    //    "<div><span>new name</span><input id='txtReName' class='roundedInput' /></div>\n" +
    //    "<div class='roundendButton' onclick='performRenameFolder()'>Rename Folder</div>\n" +
    //    "<div id='renameFolderReport' class='repairReport'></div>\n");
    $("#centeredDialog").fadeIn();


}
function performRenameFolder(folderId, newFolderName) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Links/RenameFolder?folderId=" + folderId + "&newFolderName=" + newFolderName,
        success: function (success) {
            if (success === "ok") {
                $('#centeredDialog').fadeOut();
                logDataActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "RNF",
                    FolderId: pSelectedTreeId,
                    Details: linkId + ' renamed to ' + newFolderName
                });
            }
            else {
                logError("AJX", folderId, success, "performRenameFolder");
            }
        },
        error: function (xhr) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "performRenameFolder")) logError("XHR", folderId, errMsg, "performRenameFolder");
        }
    });
}

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

function xxHardcoreFilecounts() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/GalleryPage/HardcoreFilecounts",
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = "xxHardcoreFilecounts"; // arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            alert(errMsg);
        }
    })
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
            else { logError("AJX", pSelectedTreeId, success, "XXloadProperties"); }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
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
                }
                else { logError("AJX", pSelectedTreeId, success, "XXloadProperties"); }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    }
}
function XXtestAddVisitor() {
    $('#dataifyInfo').show().html("sending test addVisitor");
    addVisitor(3309, "dashboard");
}
function xxshowAssignRolesDialog() {
    $('#rolesChooseBoxDialog').dialog('open');
    $('#divChooseAssigned').html("");
    loadUsers();
    loadAllUserRoles();
}
function xxshowAddRolesDialog() {
    $('#addEditRolesDialog').dialog('open');
    loadAaddEditRoles();
}
function xxshowAddEditRoles() {
}
