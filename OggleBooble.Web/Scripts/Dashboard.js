function dashboardStartup() {
    document.title = "dashboard : OggleBooble";
    changeFavoriteIcon("redBallon");
    $('#indexMiddleColumn').html(dashboardHtml());

    if (!isInRole("admin", "dashboard")) {
        alert("admin role required");
        window.location.href = "Index.html";
    }

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
    setOggleHeader("dashboard");
    setOggleFooter(3910, "dashboard", "dashboard");
    loadHeaderTabs(localStorage["UserRole"]);
    setLeftMenu(localStorage["UserRole"]);
    resizeDashboardPage();
    //loadDashboardDirTree(false);    //
    showHtmlDirTree("dashboardRightColumn");
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
        "                           <label>link</label><input id='txtImageLink' tabindex='1' class='roundedInput' onblur='previewLinkImage()'></input>\n" +
        "                       </div>\n" +
        "                       <div class='flexbox'>\n" +
        "                           <label>path</label><input class='roundedInput txtLinkPath' tabindex='-1' readonly='readonly'></input>\n" +
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
        "               <div id='moveManyTitle' class='workAreaHeaderTitle'></div>\n" +
        "               <div class='workAreaHeaderDetailRow'>\n" +
        "                   <div class='moveManyHeaderLabel'>source</div><input id='txtMoveManySource' class='roundedInput' style='width:65%' readonly='readonly'></input><br />" +
        "                   <div class='moveManyHeaderLabel'>destination</div><input id='txtMoveManyDestination' class='roundedInput' style='width:65%' readonly='readonly'></input>" +
        "                   <img class='dialogDirTreeButton' src='/Images/caretDown.png' " +
        "                      onclick='$(\"#mmDirTreeContainer\").toggle()'/>\n" +
        "                   <div class='floatRight'><input type='checkbox' id='mmCkSelectAll' onclick='mmSelectAll()'></input>  Select All</div>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "           <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png' onclick='showDefaultWorkArea()'></div>\n" +
        "       </div>\n" +
        "       <div id='mmDirTreeContainer' class='floatingDirTreeContainer moveManyDirTreeContainer'></div>\n" +
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
        "               <button onclick='saveSortOrder()'>Save</button>\n" +
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
        "           </div>\n" +
        "           <div id='reportsFooter' class='workareaFooter'></div>\n" +
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
            $('#reportsLeftMenu').html(
                "<div class='clickable' onclick='runMetricsMatrixReport()'>Update Performance Stats</div>\n" +
                "<div class='clickable' onclick='runMetricsMatrixReport()'>Performance Metrics</div>\n" +
                "<div class='clickable' onclick='runPageHitReport()'>Page Hit Report</div>\n" +
                "<div class='clickable' onclick='eventSummaryReport()'>Event Activity</div>\n" +
                "<div class='clickable' onclick='errorSummaryReport()'>Error Report</div>\n" +
                "<div class='clickable' onclick='FeedbackReport()'>Feedback</div>\n" +
                "<div class='clickable' onclick='runImpactReport()'>Impact</div>\n" +
                "<div class='clickable' onclick='showMostActiveUsersReport()'>Most Active Users</div>\n" +
                "<div class='clickable' onclick='showLatestImageHitsReport()'>Latest Image Hits</div>\n" +
                "<div class='clickable' onclick='runDailyRefferals();'>Daily Refferals</div>\n");
            break;
        case "admin":
            document.title = "dashboard : OggleBooble";
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='createHtmlDirTree(\"dashboardRightColumn\")'>ReBuild Dir Tree</div>\n" +
                "<div class='clickable' onclick='showDefaultWorkArea()'>Add Image Link</div>\n" +
                "<div class='clickable' onclick='showCreateStaticPagesDialog()'>Create Static Pages</div>\n" +
                "<div class='clickable' onclick='showRepairLinksDialog()'>Repair Links</div>\n" +
                "<div class='clickable' onclick='showSortTool()'>Sort Tool</div>\n" +
                "<div class='clickable' onclick='showCreateNewFolderDialog(" + pSelectedTreeId + ")';\">Create New Folder</div>\n" +
                "<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>\n" +
                "<div class='clickable' onclick='showAddStepChildFolderDialog()'>Add As StepChild</div>\n" +
                "<div class='clickable' onclick='showRenameFolderDialog()'>Rename Folder</div>\n" +
                "<div class='clickable' onclick='showMoveManyTool(1);'>Move Many</div>\n" +
                "<div class='clickable' onclick='showMoveManyTool(2);'>Copy Many</div>\n" +
                "<div class='clickable' onclick='showMoveManyTool(3);'>Archive Many</div>\n" +
                "<div class='clickable' onclick='showRipPdfDialog();'>Rip Pdf</div>\n"+
                "<div class='clickable' onclick='DupeCheck();'>Dupe Check</div>\n" +
                "<div class='clickable' onclick='runAfewZZvisitors(1);'>force a few</div>\n" +

                "<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>\n" +
                "<div class='clickable' onclick='showBuildFolderTreePageDialog()'>Build FolderTree Page</div>\n" +                
                        "<div class='clickable' onclick='showAutoIncrimentDialog();'>Auto Incriment</div>\n"
            );
            //"<div class='clickable' onclick='removeDupeIps();'>removeDupeIps</div>\n" RemoveDuplicateIps
            //"<div class='clickable' onclick='HardcoreFilecounts();'>HardcoreFilecounts()</div>");
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
function createHtmlDirTree(container) {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').html("rebuilding directory tree txt file").show();
    let createHtmlDirTreeStart = Date.now();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/DirTree/BuildHtmlDirTree?root=1",
        dataType: "JSON",
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                let delta = (Date.now() - createHtmlDirTreeStart);
                $('#dataifyInfo').html("directory tree rebuild took: " + (delta / 1000).toFixed(3));
                showHtmlDirTree(container);
            }
            else {
                logError("AJX", 5522, success, "create HtmlDirTree");
                alert("??" + success);
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("??" + errMsg);
            if (!checkFor404(errMsg, 444, "create HtmlDirTree")) logError("XHR", 627922, errMsg, "create HtmlDirTree");
        }
    });
}

// REPAIR FUNCTIONS
function showRepairLinksDialog() {
    $('#dashboardDialogTitle').html("Repair Links");
    $('#dashboardDialogContents').html(
        "    <div><span>folder to repair</span><input id='txtFolderToRepair' class='txtLinkPath roundedInput' readonly='readonly'></input></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders'></input></div>\n" +
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

function RemoveDuplicateIps() {
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
                        $('#dataifyInfo').html("Remove Duplicate Ips took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                        
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
                    $('#dataifyInfo').hide();
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

function runAfewZZvisitors(howmany) {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Visitor/GetZZVisitors?howmany=" + howmany,
            success: function (zzVisitorsSuccess) {
                if (zzVisitorsSuccess.Success == "ok") {
                    for (i = 0; i < howmany; i++) {
                        getIpInfo3(zzVisitorsSuccess.ZZVisitors[i].VisitorId, zzVisitorsSuccess.ZZVisitors[i].IpAddress, zzVisitorsSuccess.ZZVisitors[i].IpAddress, "runAfewZZvisitors");
                    };
                }
                else
                    logError2("VisitorId", "AJX", 0, zzVisitorsSuccess.Success, "run a few");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                logActivity2(create_UUID(), "I0Y", 5555, errMsg); // update visitor XHR error
                if (!checkFor404(errMsg, 555, "run a few"))
                    logError2(create_UUID(), "XHR", 555, errMsg, "run a few");
            }
        });
    }
    catch (e) {
        logActivity2(ipData.VisitorId, "I0C", ipData.InitialPage, "run a few"); // catch error
        logError2(ipData.VisitorId, "CAT", ipData.InitialPage, e, "run a few");
    }
}


// CREATE STATIC PAGES
function showCreateStaticPagesDialog() {
    $('#dashboardDialogTitle').html("Create Static Pages");
    $('#dashboardDialogContents').html(
        "    <div><span>folders to staticify</span><input id='txtFolderToStaticify' class='txtLinkPath roundedInput' readonly='readonly'></input></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckStaticIncludeSubfolders' checked='checked'></input></div>\n" +
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
                    VisitorId: getCookieValue("VisitorId", "add ImageLink"),
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

    try {
        $('#imgLinkPreview').attr('src', $('#txtImageLink').val());
        $('#imgLinkPreview').one("load", function () {
            //$('#footerMessage').html("image height: " + $('#imgLinkPreview').height());
            var winH = $(window).height();
            var headerH = $('header').height();
            var uploadImageAreaH = $('#uploadArea').height();
            $('.threeColumnLayout').height(Math.max(winH, uploadImageAreaH) - headerH);
        });
    } catch (e) {
        $('#dataifyInfo').show().html("previewLinkImage: " + e);
        //$('#txtImageLink').val("");
        alert("previewLinkImage: " + e);
    }
}

// CREATE NEW FOLDER
function showCreateNewFolderDialog() {
    $('#dashboardDialogTitle').html("Create New Folder");
    $('#dashboardDialogContents').html(
        //"       <div></div>\n" +
        "       <div><span>parent</span><input id='txtCreateFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly'></input></div>\n" +
        "       <div><span>title</span><input id='txtNewFolderTitle' class='inlineInput roundedInput'></input></div>\n" +
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
                    VisitorId: getCookieValue("VisitorId", "perform CreateNewFolder"),
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
    let mfSorceFolderId = pSelectedTreeId;  // captured before 
    $('#dashboardDialogTitle').html("Move Folder");
    $('#dashboardDialogContents').html(
        "       <div><span>folder to move</span><input id='txtMoveFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly'></input></div>\n" +
        "       <div><span>destiation</span><input id='txtNewMoveDestiation' class='inlineInput roundedInput'></input>" +
        "           <img class='dialogDirTreeButton' src='/Images/caretDown.png' onclick='$(\"#moveFolderDirTreeContainer\").toggle()'/>\n" +
        "       </div>\n" +
        "       <div class='roundendButton' onclick='performMoveFolder(" + mfSorceFolderId + ")'>move</div>\n" +
        "       <div id='moveFolderDirTreeContainer' class='floatingDirTreeContainer'></div>\n");

    $("#txtMoveFolderParent").val(pSelectedTreeFolderPath);
    activeDirTree = "moveFolder";

    //loadDirectoryTree(1, "moveFolderDirTreeContainer", false);
    showHtmlDirTree("moveFolderDirTreeContainer");
    $('#dashboardDialog').fadeIn();
}
function performMoveFolder(mfSorceFolderId) {
    activeDirTree = "dashboard";
    $('#dataifyInfo').show().html("Moving Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/CatFolder/MoveFolder?folderId=" + mfSorceFolderId + "&newParent=" + dSelectedTreeId,
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                $('#dataifyInfo').hide();
                $('#dashboardDialog').fadeOut();

                createHtmlDirTree("dashboardRightColumn");

                logDataActivity({
                    VisitorId: getCookieValue("VisitorId", "perform MoveFolder"),
                    ActivityCode: "LKM",
                    FolderId: pSelectedTreeId,
                    //PageName: $('.txtPartialDirTreePath').val(),
                    Details: "folder moved from:" + $('#txtNewFolderParent').val() + " to: " + $('#txtMoveFolderDest').val()
                });
                displayStatusMessage("ok", "folder " + pSelectedTreeFolderPath + " moved to " + $('#txtNewMoveDestiation').val());
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
        "    <div><span>child folder</span><input id='txtStepParent' class='txtLinkPath roundedInput' readonly='readonly'></input></div>\n" +
        "    <div><span>new parent folder</span><input id='txtscSourceFolderName' class='roundedInput' readonly='readonly'></input>\n" +
        "       <img class='dialogDirTreeButton' src='/Images/caretDown.png' onclick='$(\"#scDirTreeContainer\").toggle()'/></div>\n" +
        "    <div><span>new name</span><input id='txtscNewFolderName' class='roundedInput'></input></div>\n" +
        "    <div><span>new link</span><input id='txtCustomFolderLink' class='roundedInput'></input></div>\n" +
        "    <div class='roundendButton' onclick='perfomAddStepChildFolder(" + cfSsorceFolderId + ")'>Create Stepchild</div>\n" +
        "       <div id='scDirTreeContainer' class='floatingDirTreeContainer'></div>\n");
    $("#txtStepParent").val(pSelectedTreeFolderPath);
    activeDirTree = "stepchild";
    showHtmlDirTree("scDirTreeContainer");
    //loadDirectoryTree(1, "scDirTreeContainer", false);
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
                    VisitorId: getCookieValue("VisitorId", "perfom AddStepChildFolder"),
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
    if (cx == 1) {
        $('#moveManyTitle').html("Move Many");
        $('#moveManyButton').html("Move");
    }
    if (cx == 2) {
        $('#moveManyTitle').html("Copy Many");
        $('#moveManyButton').html("Copy");
    }
    if (cx == 3) {
        $('#moveManyTitle').html("Archive Many");
        $('#moveManyButton').html("Archive");
    }
    mmSourceFolderId = pSelectedTreeId;
    mmSelectedTreeFolderPath = pSelectedTreeFolderPath;
    $('.fullScreenSection').hide();
    $('#moveManySection').show();
    $('#txtMoveManySource').val(mmSelectedTreeFolderPath);
    $('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyHeader').height());
    activeDirTree = "moveMany";
    //loadDirectoryTree(1, "mmDirTreeContainer", true);
    showHtmlDirTree("mmDirTreeContainer");
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
                        "<br/><input type='checkbox' class='loadManyCheckbox' imageId=" + obj.LinkId + "></input></div>");
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

    let mmContext;
    if ($('#moveManyTitle').html() == "Move Many")
        mmContext = "move";
    if ($('#moveManyTitle').html() == "Copy Many")
        mmContext = "copy";
    if ($('#moveManyTitle').html() == "Archive Many")
        mmContext = "archive";

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
        try {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "api/Links/MoveMany",
            data: moveManyModel,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    loadMMcheckboxes();
                }
                else {
                    //logError("AJX", mmSourceFolderId, success, "moveCheckedImages");
                    alert("MoveMany Ajax: " + success);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, pSelectedTreeId, "loadMMcheckboxes"))
                    logError("XHR", pSelectedTreeId, errMsg, "loadMMcheckboxes");

                alert("MoveMany XHR error: " + errMsg);

            }
        });
        } catch (e) {
            alert("MoveMany CATCH error: " + e);
        }
    }
}

// AUTO INCRIMENT
function showAutoIncrimentDialog() {
    $('#dashboardDialogTitle').html("AutoIncriment Folder");
    $('#dashboardDialogContents').html(
        "<div><span>folder to move</span><input id='txtAutoIncrimentParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly'></input></div>\n" +
        "<div><span>include all subfolders </span><input type='checkbox' id='ckAutoIncrimentIncludeSubfolders' checked='checked'></input></div>\n" +
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
let sortOrderArray = [];
function showSortTool() {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    $('.fullScreenSection').hide();
    $('#sortToolSection').show();
    $('#sortToolImageArea').css("height", $('#dashboardContainer').height() - $('#sortToolHeader').height());
    $('#sortTableHeader').html(pSelectedTreeFolderPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ")
        + "(" + pSelectedTreeId + ")");
    $('#dashBoardLoadingGif').fadeIn();
    var daInfoMessage = $('#dataifyInfo').html();
    $('#dataifyInfo').append("loading sorted images");
    let settingsImgRepo = settingsArray.ImageRepo;
    $.ajax({
        url: settingsArray.ApiServer + "api/Links/GetImageLinks?folderId=" + pSelectedTreeId,
        success: function (imgLinks) {
            $('#dashBoardLoadingGif').hide();
            if (imgLinks.Success === "ok") {
                $('#sortToolImageArea').html("");
                sortOrderArray = [];
                $.each(imgLinks.Links, function (ndx, obj) {
                    $('#sortToolImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" +
                        settingsImgRepo + obj.FileName + "'/>" +
                        "<br/><input class='sortBoxInput' id=" + obj.LinkId + " value=" + obj.SortOrder + "></input></div>");
                    sortOrderArray.push({
                        FolderId: pSelectedTreeId,
                        ItemId: obj.LinkId,
                        ImageSrc: settingsImgRepo + obj.FileName,
                        SortOrder: obj.SortOrder
                    });
                });
                $('#dashBoardLoadingGif').hide();
                $('#dataifyInfo').html(daInfoMessage + " done");
            }
            else { logError("AJX", pSelectedTreeId, imgLinks.Success, "load SortImages"); }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, pSelectedTreeId, "load SortImages")) logError("XHR", pSelectedTreeId, errMsg, "load SortImages");
        }
    });
}
function updateSortOrder() {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("sorting array");
    sortOrderArray = [];
    $('#sortToolImageArea').children().each(function () {
        sortOrderArray.push({
            FolderId: pSelectedTreeId,
            ItemId: $(this).find("input").attr("id"),
            ImageSrc: $(this).find("img").attr("src"),
            SortOrder: $(this).find("input").val()
        });
    });
    sortOrderArray = sortOrderArray.sort(SortImageArray);
    reloadSortTool();
    //saveSortChanges(sortOrderArray, "sort");
}
function SortImageArray(a, b) {
    var aSortOrder = Number(a.SortOrder);
    var bSortOrder = Number(b.SortOrder);
    return ((aSortOrder < bSortOrder) ? -1 : ((aSortOrder > bSortOrder) ? 1 : 0));
}
function autoIncrimentSortOrder() {
    //if (confirm("reset all sort orders")) {
        $('#dashBoardLoadingGif').show();
        $('#dataifyInfo').show().html("auto incrimenting array");
        sortOrderArray = [];
        let autoI = 0;
        $('#sortToolImageArea').children().each(function () {
            sortOrderArray.push({
                FolderId: pSelectedTreeId,
                ItemId: $(this).find("input").attr("id"),
                ImageSrc: $(this).find("img").attr("src"),
                SortOrder: autoI += 2
            });
        });
        reloadSortTool();
        //saveSortChanges(sortOrderArray, "incrimenting");
    //}
}
function reloadSortTool() {
    $('#sortToolImageArea').html("");
    $.each(sortOrderArray, function (idx, obj) {
        $('#sortToolImageArea').append("<div class='sortBox'><img class='sortBoxImage' src='" + obj.ImageSrc + "'/>" +
            "<br/><input class='sortBoxInput' id=" + obj.ItemId + " value=" + obj.SortOrder + "></input></div>");
    });
    $('#dashBoardLoadingGif').hide();
    $('#dataifyInfo').hide();
}
function saveSortOrder() {
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("saving changes");
    let sStart = Date.now();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/Links/UpdateSortOrder",
        contentType: 'application/json',
        data: JSON.stringify(sortOrderArray),
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                let delta = (Date.now() - sStart);
                if (delta < 1500)
                    $('#dataifyInfo').hide();
                else
                    $('#dataifyInfo').html("saving changes took: " + (delta / 1000).toFixed(3));

                //loadSortImages();
            }
            else {
                $('#dashBoardLoadingGif').hide();
                alert(success);
                logError("AJX", mmSourceFolderId, success, "UpdateSortOrder");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("XHR: " + errMsg);
            if (!checkFor404(errMsg, pSelectedTreeId, "save SortChanges")) logError("XHR", pSelectedTreeId, errMsg, "save SortChanges");
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

// FACEBOOK PAGE
function showBuildFolderTreePageDialog() {
    $('#dashboardDialogTitle').html("Build Facebook Page");
    $('#dashboardDialogContents').html(
        "<div><span>Start Node</span><input id='txtStartNode' class='txtLinkPath roundedInput' readonly='readonly'></input></div>\n" +
        "<div><span>Html File Name</span><input id='txtHtmlFileName' class='txtLinkPath roundedInput'></input></div>\n" +
        "<div class='roundendButton' onclick='buildFolderTreePage()'>Build</div>\n"
    );
    $("#txtStartNode").val(pSelectedTreeFolderPath);
    $("#txtHtmlFileName").val(pSelectedTreeFolderPath.substr(pSelectedTreeFolderPath.lastIndexOf("/") + 1));
    $('#dashboardDialog').fadeIn();
}
function buildFolderTreePage() {
    let start = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("building Html Page");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/HtmlPage/BuildFolderTreePage?startNode=" + pSelectedTreeId + "&fileName=" + $('#txtHtmlFileName').val(),
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success == "ok") {
                let delta = Date.now() - start;
                let minutes = Math.floor(delta / 60000);
                let seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("build Centerfold List took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                //clearInterval(pollingLoop);
                $('#dataifyInfo').html("build Html Page " + $('#txtHtmlFileName').val() + " took: " + minutes + ":" + seconds);
                $('#dashboardDialog').fadeOut();
            }
            else {
                $('#dataifyInfo').html(success);
                alert("build List Page: " + success);
                logError("AJX", 3910, success, "build List Page");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("build HtmlPage: " + errMsg);
            if (!checkFor404(errMsg, pSelectedTreeId, "build HtmlPage"))
                logError("XHR", 3907, errMsg, "build HtmlPage");
        }
    });
}

// RIP PDF
function showRipPdfDialog() {

    $('#dashboardDialogTitle').html("Rip pdf");
    $('#dashboardDialogContents').html(
        "<div><span>pdf file</span><input id='txtPdfFile' class='inlineInput roundedInput'></input></div>\n" +
        "<div><span>dest folder</span><input id='txtDestFolder' class='inlineInput roundedInput'></input></div>\n" +
        "<div><span>start page</span><input id='txtStartPage'></input><span>end page</span><input id='txtEndPage'></input></div>\n" +
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
                    VisitorId: getCookieValue("VisitorId", "perform RenameFolder"),
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
