let pSelectedTreeId, pSelectedTreeFolderPath;

function dashboardStartup() {
    $('#indexMiddleColumn').html(dashboardHtml());
    $('#dashboardContainer').show();
    $('#defaultSection').show();
    $('#sortToolSection').hide();
    $('#moveManySection').hide();
    $('.txtLinkPath').val('');
    setOggleHeader(3910, "dashboard");
    setOggleFooter(3910, "dashboard");
    loadHeaderTabs();
    setLeftMenu('Add Images');
    document.title = "Dashboard : OggleBooble";
    $('.dashboardContainerColumn').show();
    setLeftMenu('Admin');
    loadDirectoryTree(1, "dashboardRightColumn", "dashBoardDirTreeClick");
    //setSignalR();
    //if (isInRole("oggle admin"))
    window.addEventListener("resize", resizeDashboardPage);
    resizeDashboardPage();
}

function dashboardHtml() {
    return "<img id='dashBoardLoadingGif' class='loadingGif' src='Images/loader.gif'/>\n" +
        "<div id='dashboardContainer' class='fullScreenContainer'>\n" +
        "   <div id='defaultSection' class='fullScreenSection flexbox'>\n" +
        "      <div id='dashboardLeftColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='dashboardLeftMenu' class='oggleVerticalMenu' ></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardMiddleColumn' class='dashboardContainerColumn'>\n" +
        "          <div id='workAreaContainer' class='workAreaContainer'></div>\n" +
        "      </div>\n" +
        "      <div id='dashboardRightColumn' class='dashboardContainerColumn'></div>\n" +
        "   </div>\n" +
        "   <div id='sortToolSection' class='fullScreenSection'>" +
        "       <div id='sortToolHeader' class='workAreaHeader'>\n" +
        "           <div id='sortTableHeader' class='workAreaHeaderTitle'></div>\n" +
        "           <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png'" +
        "           onclick='$(\"#sortToolSection\").hide();$(\"#defaultSection\").show()'></div>\n" +
        "       </div>\n" +
        "       <div>\n" +
        "           <div id='sortToolImageArea'  class='workAreaDisplayContainer'></div>\n" +
        "           <div class='workareaFooter'>\n" +
        "               <button onclick='updateSortOrder()'>ReSort</button>\n" +
        "           </div>\n" +
        "       </div>\n" +
        "   </div>\n" +
        "   <div id='moveManySection' class='fullScreenSection'>" +
        "       <div id='moveManyHeader' class='workAreaHeader'>\n" +
        "           <div class='workAreaHeaderArea'>\n" +
        "               <div class='workAreaHeaderTitle'>Move Many</div>\n" +
        "               <div class='workAreaHeaderDetailRow'>\n" +
        "                   <div class='moveManyHeaderLabel'>source</div><input id='txtMoveManySource' class='roundedInput' style='width:65%' readonly='readonly' /><br />" +
        "                   <div class='moveManyHeaderLabel'>destination</div><input id='txtMoveManyDestination' class='roundedInput' style='width:65%' readonly='readonly' />" +
        "                   <img class='dialogDirTreeButton' src='/Images/caretDown.png' " +
        "                      onclick='$(\"#mmDirTreeContainer\").toggle()'/>\n" +
        "                   <label><input type='checkbox' id='mmCkSelectAll' onclick='mmSelectAll()'>Select All</label>\n" +
        "               </div>\n" +
        "           </div>\n" +
        "           <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png' onclick='closeMoveManySection()'></div>\n" +
        "       </div>\n" +
        "       <div id='mmDirTreeContainer' class='floatingDirTreeContainer'></div>\n" +
        "       <div id='moveManyImageArea' class='workAreaDisplayContainer'></div>\n" +
        "       <div id='moveManyFooter' class='workareaFooter'>\n" +
        "           <button onclick='moveCheckedImages()'>Move</button>\n" +
        "           <div id='moveManyCountContainer' class='floatRight'></div>" +
        "       </div>\n" +
        "   </div>\n" +
        "   <div id='dataifyInfo' class='infoLine' onclick='$(\"#dataifyInfo\").hide()'></div>\n" +
        "</div>\n" +
        "<div id='dashboardDialog' class='oggleDialogContainer'>\n";
}

function resizeDashboardPage() {
    resizePage();

    // HEIGHT
    //let winH = $(window).height

    let heightFF = -85, widthFF = -50;
    let adjH = $('.threeColumnLayout').height() - $('header').height() + heightFF;
    $('#dashboardContainer').css("height", adjH);

    // WIDTH
    let middleColumnW = $('#dashboardContainer').width() - $('#dashboardRightColumn').width() - $('#dashboardLeftColumn').width();
    $('#dashboardMiddleColumn').css("width", middleColumnW + widthFF);

    //$('#mainMenuContainer').html("w: " + $('#dashboardMiddleColumn').width() + " widthFF: " + widthFF +
    //    "                            h: " + $('#dashboardContainer').height() + " heightFF: " + heightFF);
}

function rebuildDirectoryTree() {
    loadDirectoryTree(1, "dashboardRightColumn", "dashBoardDirTreeClick");
}

function setLeftMenu(viewId) {
    $('#headerSubTitle').html(viewId);
    switch (viewId) {
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
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='rebuildDirectoryTree()'>ReBuild Dir Tree</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddImageLinkDialog()'>Add Image Link</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCreateStaticPagesDialog()'>Create Static Pages</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showRepairLinksDialog()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>");

            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCreateNewFolderDialog(" + pSelectedTreeId + ")';\">Create New Folder</div>");
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

function loadHeaderTabs() {
    if (isInRole("ADD")) {
        $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Add Images');\">Add Images</a>");
        $('#divAddImages').show();
    }
    if (isInRole("ADD")) {
        $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Manage Folders');\">Manage Folders</a>");
    }
    if (isInRole("ADM")) {
        //alert("isInRole Oggle admin")
        $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Admin');\">Admin</a>");
        $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Reports');\">Reports</a>");
        $('#breadcrumbContainer').append("<a class='activeBreadCrumb' href=\"javascript:setLeftMenu('Manage Roles');\">Reports</a>");
        $('#headerMessage').html("Oggle admin");
        $('.adminLevelOption').show();
    }
}

// REPAIR FUNCTIONS
function showRepairLinksDialog() {
    $('#oggleDialogTitle').html("Repair Links");
    $('#draggableDialogContents').html("<div>\n" +
        "   <div class='flexbox'>\n" +
        "       <label>folder to repair</label><input id='txtFolderToRepair' class='txtLinkPath roundedInput' readonly='readonly'/>\n" +
        "   </div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckRepairIncludeSubfolders' checked='checked' /></div>\n" +
        "    <div class='roundendButton' onclick='repairLinks($(\"#ckRepairIncludeSubfolders\").is(\":checked\"))'>Run</div>\n" +
        "</div>\n");
    $("#draggableDialog").fadeIn();
    $("#txtFolderToRepair").val(pSelectedTreeFolderPath);
    $('#draggableDialog').css("top", ($(window).height() - $('#draggableDialog').height()) / 2);
    $('#draggableDialog').css("left", -250);

    //    $('#draggableDialog').css("left", ($(window).width() - $('#draggableDialog').width()) / 2.142);

    $("#mainMenuContainer").html("len: " + pSelectedTreeFolderPath.length);

    //$("#draggableDialog").css("min-width", 500);

    //$("#draggableDialog").width(pSelectedTreeFolderPath.length + 100);
}
function repairLinks(justOne) {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    changeFavoriteIcon("loading");
    //$('#repairLinksReport').html("");

    //alert("url: " + settingsArray.ApiServer + "api/RepairLinks/Repair?folderId=" + pSelectedTreeId + "&recurr=" + justOne);

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/RepairLinks/Repair?folderId=" + pSelectedTreeId + "&recurr=" + justOne,
        success: function (repairReport) {
            $('#dashBoardLoadingGif').hide();
            $("#draggableDialog").fadeOut();
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
                    changeFavoriteIcon("redBallon");

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
            alert("repairLinks xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

// CREATE STATIC PAGES
function showCreateStaticPagesDialog() {
    $('#oggleDialogTitle').html("Create Static Pages");
    $('#draggableDialogContents').html("<div id='createStaticPagesCrud'>\n" +
        //"    <div><span>folders to staticify</span>" + pSelectedTreeFolderPath + "</div>\n" +
        "    <div><span>folders to staticify</span><input id='txtFolderToStaticify' class='txtLinkPath roundedInput' readonly='readonly'/></div>\n" +
        "    <div><span>include all subfolders </span><input type='checkbox' id='ckStaticIncludeSubfolders' checked='checked' /></div>\n" +
        "    <div class='roundendButton' onclick='createStaticPages($(\"#ckStaticIncludeSubfolders\").is(\":checked\"))'>Build Files</div>\n" +
        //"    <div id='renameFolderReport' class='repairReport'></div>\n" +
        "</div>\n");
    
    $("#txtFolderToStaticify").val(pSelectedTreeFolderPath);

    $("#draggableDialog").fadeIn();
    var winH = $(window).height();
    var dlgH = $('#draggableDialog').height();
    $('#draggableDialog').css("top", ($(window).height() - $('#draggableDialog').height()) / 2);
    $('#draggableDialog').css("left", ($(window).width() - $('#draggableDialog').width) / 2);

    //$("#mainMenuContainer").html(".txtLinkPath : " + $('.txtLinkPath').val());

}
function createStaticPages(justOne) {
    //$('#createStaticPagesCrud').dialog("close");
    //$('#createStaticPagesCrud').hide();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("creating static pages for " + pSelectedTreeFolderPath);
    //$('#progressBar').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/Build?folderId=" + pSelectedTreeId + "&recurr=" + justOne,
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
        "   <div class='flexbox'>\n" +
        "       <label>link</label><input id='txtImageLink' tabindex='1' class='roundedInput' onblur='previewLinkImage()'/>\n" +
        "   </div>\n" +
        "   <div class='flexbox'>\n" +
        "       <label>path</label><input class='roundedInput txtLinkPath' readonly='readonly' />\n" +
        "   </div>\n" +
        "    <div class='roundendButton' tabindex='2' onclick='addImageLink()'>Insert</div>\n" +
        "</div>\n" +
        "<img id='imgLinkPreview' class='linkImage' />\n").show();
        //<div id="progressBar" class="dashboardProgessBar"></div>

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

            if (successModel.Success === "ok") {
                $('#dataifyInfo').hide();
                displayStatusMessage("ok", "image link added");
                $('#txtImageLink').val("");
                resizeDashboardPage();

                //if (successModel.ReturnValue !== "0") {
                //    alert("set image: " + successModel.ReturnValue + " as folder image for " + pSelectedTreeId);
                //    setFolderImage(successModel.ReturnValue, pSelectedTreeId, "folder");
                //}
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
                        resizeDashboardPage();
                        logActivity({
                            PageId: pSelectedTreeId,
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

// CREATE NEW FOLDER
function showCreateNewFolderDialog() {

    $('#dashboardDialog').html(
        "<div class='carouselSettingsDialog'>\n" +
        "   <div class='oggleDialogHeader'>" +
        "       <div class='oggleDialogTitle'>Create New Folder</div>" +
        "       <div class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='$(\"#dashboardDialog\").hide()'/></div>\n" +
        "   </div>\n" +
        "   <div class='oggleDialogContents'>\n" +
        "       <div><span>parent</span><input id='txtCreateFolderParent' class='txtLinkPath inlineInput roundedInput' readonly='readonly' /></div>\n" +
        "       <div><span>title</span><input id='txtNewFolderTitle' class='inlineInput roundedInput' /></div>\n" +
        "       <div class='roundendButton' onclick='performCreateNewFolder()'>Create Folder</div>\n" +
        "   </div>\n" +
        "</div>\n");

    //$("#dashboardDialog").css("width", 300);
    $('#dashboardDialog').css("top", 75);
    $('#dashboardDialog').css("left", 400);
    $("#dashboardDialog").draggable().fadeIn();

    $("#txtCreateFolderParent").val(pSelectedTreeFolderPath);
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

// COPY FOLDER
function showAddStepChildFolderDialog() {
    $('#oggleDialogTitle').html("Copy Folder");
    $('#draggableDialogContents').html(
        "<div id='copyFolderCrud' class='dashboardToggle' title='Copy Folder'>\n" +
        "    <div><span>folder to copy</span><input id='txtNewStepParent' class='txtLinkPath roundedInput' readonly='readonly' /></div>\n" +
        "    <div><span>new name</span><input id='txtNewFolderName' class='roundedInput' /></div>\n" +
        "    <div><span>link</span><input id='txtCustomFolderLink' class='roundedInput' /></div>\n" +
        "    <div>\n" +
        "        <span>new parent </span><div id='copyFolderToggleButton' onclick='$('#copyFolderParentDirTree').dialog('open');' class='toggleButton'>...</div>\n" +
        "        <div id='copyFolderParentDirTree' class='moveDirTreeContainer' title='Select Parent Folder'></div>\n" +
        "        <input id='txtCopyFolderParent' class='roundedInput' readonly='readonly' />\n" +
        "    </div>\n" +
        "    <div class='roundendButton' onclick='copyFolder()'>Copy Folder</div>\n" +
        "</div>");

    //loadDirectoryTree(1, "linkManipulateDirTree");
    //var winH = $(window).height();
    //var dlgH = $('#draggableDialog').height();
    //$('#draggableDialog').css("top", (winH - dlgH) / 2);
    $('#txtCustomFolderLink').val(pSelectedTreeFolderPath);
    // $('#txtCustomFolderLink').val(pSelectedTreeFolderPath);
    $('#draggableDialog').fadeIn();
}
function perfomAddStepChildFolder() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/CatFolder/AddStepChild",
        data: {
            SourceFileId: copyFolderSelectedParentId,
            DestinationId: pSelectedTreeId,
            LinkId: $('#txtCustomFolderLink').val(),
            FolderName: $('#txtNewFolderName').val(),
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
                    PageId: folderId,
                    Activity: "perfomCopyFolder"
                });


                logActivity({
                    PageId: pSelectedTreeId,
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
        url: settingsArray.ApiServer + "/api/xHampster?folderId=" + pSelectedTreeId,
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
            if (!checkFor404("prepareXhamsterPage")) {
                sendEmailToYourself("XHR ERROR in Dashboard.js prepareXhamsterPage",
                    "/api/xHampster?folderId=" + pSelectedTreeId + " Message: " + errorMessage);
            }
            alert("prepareXhamsterPage xhr error: " + errorMessage);
        }
    });
}

// MOVE MANY
function showMoveManyTool() {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    $('#defaultSection').hide();
    $('#moveManySection').show();
    $('#txtMoveManySource').val(pSelectedTreeFolderPath);
    $('#moveManyImageArea').css("height", $('#dashboardContainer').height() - $('#moveManyFooter').height());

    loadDirectoryTree(1, "mmDirTreeContainer", "moveManyDirTreeClick");
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
                //resizePage();
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
let selectedMMTreeId;
function moveManyDirTreeClick(danniPath, folderId) {
    selectedMMTreeId = folderId;
    let selectedMMFolderPath = danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " ");
    $('#txtMoveManyDestination').val(selectedMMFolderPath);
    $('#mmDirTreeContainer').fadeOut();    
}
function moveCheckedImages() {
    if (selectedMMTreeId == 0) {
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
            DestinationFolderId: selectedMMTreeId,
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
function closeMoveManySection() {
    $('#moveManySection').hide();
    $('#defaultSection').show();
}

// SORT TOOL
function showSortTool() {
    if (isNullorUndefined(pSelectedTreeFolderPath)) {
        alert("select a folder");
        return;
    }
    $('#defaultSection').hide();
    $('#sortToolSection').show();

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
                $('#dataifyInfo').html("done");
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

// MOVE FOLDER
function showMoveFolderDialog() {
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
                logActivity({
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
                //logActivity({
                //    PageId: pSelectedTreeId,
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
