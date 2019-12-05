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

    $('#footerMessage').html("dashboardContainer.width: " + $('.dashboardContainer').width() +
        "  dashboardTreeContainer.width: " + $('.dashboardTreeContainer').width() +
        "  dashboardLeftMenu.width: " + $('#dashboardLeftMenu').width() +
        "  workAreaContainer.width: " + $('.workAreaContainer').width()) +
        "  mw: " + mw;
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
            $('#dashboardLeftMenu').html("<div class='clickable' onclick='runPageActivityReport()'>Daily Activity</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showPerfMetrics()'>Performance Metrics</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='runImageHitActivityReport()'>Latest Image Hits</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMostActiveUsersReport()'>Most Active Users</div>");
            break;
        case "Admin":
            $('.workAreaContainer').hide();
            $('#divAddImages').show();
            $('#dashboardLeftMenu').html("<div class='clickable' onclick=\"$('#createStaticPagesCrud').dialog('open');\">Create Static Pages</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showSortTool()'>Sort Tool</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='repairLinks()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#createNewFolderDialog').dialog('open');\">Create New Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showMoveFolderDialog()'>Move Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showCopyFolderDialog()'>Copy Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick=\"$('#renameFolderCrud').dialog('open');\">Rename Folder</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='prepareXhamsterPage()'>Prepare xHamster Page</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='repairLinks()'>Repair Links</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAssignRolesDialog()'>Assign User Roles</div>");
            $('#dashboardLeftMenu').append("<div class='clickable' onclick='showAddRolesDialog()'>Edit Roles</div>");
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
    //$('.dirTreeSpan').mouseover()
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

function addVideo() {
    try {
        $('#dashBoardLoadingGif').show();
        var videoLink = {};
        videoLink.Link = $('#txtVideoLink').val();
        videoLink.Image = $('#txtVideoImage').val();
        videoLink.Title = $('#txtVideoTitle').val();
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
                    displayStatusMessage("ok", "image link added");
                    $('#txtNewLink').val("");
                    resizeDashboardPage();

                    if (successModel.ReturnValue === "0") {
                        alert("set folder image: " + successModel.ReturnValue + "," + dashboardMainSelectedTreeId);

                        setFolderImage(successModel.ReturnValue, dashboardMainSelectedTreeId, "folder");
                    }

                    var changeLogModel = {
                        PageId: dashboardMainSelectedTreeId,
                        PageName: $('.txtLinkPath').val(),
                        Activity: "new image added " + successModel.ReturnValue
                    };
                    logActivity(changeLogModel);
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

// WORK AREAS
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

// REPORTS
function showPerfMetrics() {
    $('.workAreaContainer').hide();
    $('#divHitMetrics').fadeIn();
    runPageHitsReport();
}
function runPageHitsReport() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/MetricsReports",
        success: function (pageHitModel) {
            $('#dashBoardLoadingGif').hide();
            if (pageHitModel.Success === "ok") {
                //$.each(pageHitModel)
                //alert("pageHitModel.Success: " + pageHitModel.Success);

                // login and I will let you see 1000 more images.
                // bookmark my site with link oog?domain=122; to get another 1,000 image views.
                // put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
                // use my product
                // Request extra privdleges 
                // pay me to do some programming for you and I'll let you in on all my source code

                var kludge = "<table><tr><th></th><th>Today</th><th>Yesterday</th><th>-2 Days</th><th>-3 Days</th><th>-4 Days</th>" +
                    "<th>-5 Days</th><th>-6 Days</th></tr>";
                kludge +=  "<tr><td>page Hits</td> ";
                kludge += "<td>" + pageHitModel.PageHits.Today.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.PageHits.Yesterday.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.PageHits.Two_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.PageHits.Three_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.PageHits.Four_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.PageHits.Five_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.PageHits.Six_Days_ago.toLocaleString() + "</td>";
                kludge += "</tr><tr><td>image Hits</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Today.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Yesterday.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Two_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Three_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Four_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Five_Days_ago.toLocaleString() + "</td>";
                kludge += "<td>" + pageHitModel.ImageHits.Six_Days_ago.toLocaleString() + "</td>";
                kludge += "</tr></table>";
                $("#pageHitReport").html(kludge);
                $("#refreshPageHits").show();
                $("#btnPopPages").show();                
                $("#btnMostImageHits").show();
                $("#btnImageHitActivityReport").show();

                runPopPages();
                runMostImageHits();
            }
            else {
                alert("renameFolder: " + repairReport.Success);
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
function runPopPages() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/MetricsReports/MostVisitedPagesReport",
        success: function (popularPages) {
            $('#dashBoardLoadingGif').hide();
            if (popularPages.Success === "ok") {
                $("#mostPopularPagesReport").html("<table><tr colspan=2><th>Most Popular Pages</th></tr>");
                $.each(popularPages.Items, function (idx, obj) {
                    $("#mostPopularPagesReport").append("<tr><td>" + obj.PageName + "</td><td>" + obj.PageHits + "</td></tr>");
                });
                $("#mostPopularPagesReport").append("</table>");
                $('#popPagesContainer').css("display", "inline-block");
            }
            else {
                alert("runPopPages: " + popularPages.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "runPopPages")) {
                alert("runPopPages: " + errorMessage);
                sendEmailToYourself("XHR ERROR in Dashboard.js runPopPages", "Message: " + errorMessage);
            }
        }
    });
}
function runMostImageHits() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/MetricsReports/MostImageHitsReport",
        success: function (mostImageHits) {
            $('#dashBoardLoadingGif').hide();
            if (mostImageHits.Success === "ok") {
                $("#mostImageHitsReport").html("<table><tr colspan=2><th>Most Image Hits</th></tr>");                
                $.each(mostImageHits.Items, function (idx, obj) {
                    $("#mostImageHitsReport").append("<tr><td>" + obj.PageName + "</td><td>" + obj.PageHits + "</td></tr>");
                });
                $("#mostImageHitsReport").append("</table>");
            }
            else {
                alert("runMostImageHits: " + mostImageHits.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "runMostImageHits")) {
                alert("runMostImageHits: " + errorMessage);
                sendEmailToYourself("XHR ERROR in Dashboard.js runMostImageHits", "Message: " + errorMessage);
            }
        }
    });
}

function runPageActivityReport() {
    $('.workAreaContainer').hide();
    $('#divDailyActivityReport').show();
    $('#dashBoardLoadingGif').show();
    $("#activityReport").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/MetricsReports/ActivityReport",
        success: function (activityReport) {
            $('#dashBoardLoadingGif').hide();
            if (activityReport.Success === "ok") {
                var kludge = "<table>";
                kludge += "<tr><th>Ip Address</th><th>City</th><th>State</th><th>Country</th><th>Event</th></th><th>Page</th><th>hitdate</th><th>hit time</th></tr>";
                $.each(activityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.RefDescription + "</td><td>" + obj.FolderName + "</td>";
                    kludge += "<td>" + obj.hitDate + "</td><td>" + obj.hitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#activityReport").html(kludge);
                $("#activityReportHits").html(" Total: " + activityReport.HitCount.toLocaleString());
                $('#dashBoardLoadingGif').hide();
            }
            else {
                alert("runMostImageHits: " + mostImageHits.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "ActivityReport")) {
                sendEmailToYourself("XHR ERROR in Dashboard.js ActivityReport",
                    "/api/FtpDashboard/RenameFolder?folderId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtReName').val() + " Message: " + errorMessage);
            }
        }
    });
}

function runImageHitActivityReport() {
    $('.workAreaContainer').hide();
    $('#divImageHitActivityReport').show();
    $('#dashBoardLoadingGif').show();
    $("#activityReport").html("");
    $("#imageHitActivityHits").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/MetricsReports/ImageHitActivityReport",
        success: function (imageHitActivityReport) {
            $('#dashBoardLoadingGif').hide();
            if (imageHitActivityReport.Success === "ok") {
                var kludge = "<table>";
                kludge += "<tr><th>ip</th><th>City</th><th>State</th><th>Country</th><th>hitdate</th><th>hit time</th></tr>";
                $.each(imageHitActivityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.hitDate + "</td><td>" + obj.hitTime + "</td></tr>";
                });
                kludge += "</table>";

                $("#imageHitActivityReport").html(kludge);
                $("#imageHitActivityHits").html(" Total: " + imageHitActivityReport.HitCount.toLocaleString());
            }
            else {
                alert("runMostImageHits: " + mostImageHits.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "runMostImageHits")) {
                alert("runMostImageHits: " + errorMessage);
                sendEmailToYourself("XHR ERROR in Dashboard.js runMostImageHits", "Message: " + errorMessage);
            }
        }
    });
}

function showMostActiveUsersReport() {
    $('.workAreaContainer').hide();
    $('#divMostAvtiveUsersReport').show();
    runMostActiveUsersReport();
}

function runMostActiveUsersReport() {
//    [Route("api/MetricsReports/MostActiveUsersReport")]
    $('#dashBoardLoadingGif').show();
    $("#mostAvtiveUsersReport").html("");
    $("#mostAvtiveUsersCount").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/MetricsReports/MostActiveUsersReport",
        success: function (mostActiveUsersReport) {
            $('#dashBoardLoadingGif').hide();
            if (mostActiveUsersReport.Success === "ok") {
                var kludge = "<table>";
                kludge += "<tr><th>ip</th><th>City</th><th>State</th><th>Country</th><th>Hits</th><th>hitdate</th><th>hit time</th></tr>";
                $.each(mostActiveUsersReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.ImageHits.toLocaleString() + "</td>";                    
                    kludge += "<td>" + obj.LastHit + "</td><td>" + obj.hitTime + "</td></tr>";
                });
                kludge += "</table>";

                $("#mostAvtiveUsersReport").html(kludge);
                $("#mostAvtiveUsersCount").html(" Total: " + mostActiveUsersReport.HitCount.toLocaleString());
            }
            else {
                alert("mostActiveUsersReport: " + mostActiveUsersReport.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "mostActiveUsersReport")) {
                alert("runMostImageHits: " + errorMessage);
                sendEmailToYourself("XHR ERROR in Dashboard.js mostActiveUsersReport", "Message: " + errorMessage);
            }
        }
    });
}

//  DIALOG FUNCTIONS 
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
                displayStatusMessage("ok", "new folder " + newFolder.FolderName + " created");

                var changeLogModel = {
                    PageId: dashboardMainSelectedTreeId,
                    PageName: $('#txtNewFolderTitle').val(),
                    Activity: "new folder created"
                };
                logActivity(changeLogModel);
                $('#txtNewFolderTitle').val('');
                $('#createNewFolderDialog').dialog('close');
                buildDirectoryTree();
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

function showMoveFolderDialog() {
    $('#moveFolderCrud').dialog('open');
    buildDirTree($('#folderToMoveTreeContainer'), 'moveFolderTree', 0);
}
function moveFolder() {
    //$('#dataifyInfo').show().html("Preparing to Move Folder");
    $('#dataifyInfo').show().html("Moving Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FtpDashboard/MoveFolder?sourceFolderId=" + dashboardMainSelectedTreeId + "&destinationFolderId=" + partialViewSelectedItemId,
        success: function (success) {
            $('#txtNewFolderParent').val('');
            $('#dashBoardLoadingGif').hide();
            if (!success.startsWith("ERROR")) {
                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val());
                //$('#progressBar').hide();
                //$('#progressBar').progressbar("destroy");
                $('#dataifyInfo').hide();

                //alert("changeLogModel id: " + MoveCopyImageModel.SourceFolderId + " mode: " + MoveCopyImageModel.Mode + "  name: " + $('#dirTreeResults').html());
                var changeLogModel = {
                    PageId: dashboardMainSelectedTreeId,
                    PageName: $('.txtPartialDirTreePath').val(),
                    Activity: "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val()
                };
                logActivity(changeLogModel);

                $('.txtPartialDirTreePath').val('');
                $('#moveFolderCrud').dialog("close");
                buildDirectoryTree();
            }
            else
                alert("Move Folder: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("Move Folder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
    //$('#moveFolderCrud').on('dialogclose', function (event) {
}
function moveFolderTreeClick(path, id) {
    var displayPath = "";
    if (path.length > path.indexOf(".COM") + 4) {
        displayPath = path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " ");
    }
    else {
        displayPath = path;
    }
    partialViewSelectedItemId = id;
    $('.txtPartialDirTreePath').val(displayPath);
    $('#partialViewTreeContainer').dialog("close");
}

function showCopyFolderDialog() {
    $('#copyFolderCrud').dialog('open');
    buildDirTree($('#folderToMoveTreeContainer'), 'moveFolderTree', 0);
}
function copyFolder() {
    $('#dataifyInfo').show().html("Copying Folder");
    //$('#progressBar').show();
    $('#dashBoardLoadingGif').show();

    var stepchildModel = {
        Parent: partialViewSelectedItemId,
        Child: dashboardMainSelectedTreeId,
        Link: "",
        RootFolder: "",
        SortOrder: 99
    };

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Folder",
        data: stepchildModel,
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {

                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " copied to " + $('.txtPartialDirTreePath').val());

                $('#txtNewFolderParent').val('');
                $('#dataifyInfo').hide();

                //var changeLogModel = {
                //    PageId: dashboardMainSelectedTreeId,
                //    PageName: $('.txtPartialDirTreePath').val(),
                //    Activity: "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val()
                //};
                //logActivity(changeLogModel);

                $('.txtPartialDirTreePath').val('');
                $('#moveFolderCrud').dialog("close");
                buildDirectoryTree();
            }
            else
                alert("copy stepchild: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("Move Folder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
    //$('#moveFolderCrud').on('dialogclose', function (event) {
}

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

                //var changeLogModel = {
                //    PageId: dashboardMainSelectedTreeId,
                //    PageName: $('.txtLinkPath').val(),
                //    Activity: "folder " + $('.txtLinkPath').val() + " renamed to " + $('#txtReName').val()
                //};
                //logActivity(changeLogModel);


                $('#dataifyInfo').hide();
            }
            else {
                alert("renameFolder: " + repairReport.Success);
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

