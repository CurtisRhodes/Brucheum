// REPORTS
var activeReport = "";
function metricsMatrixReport() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Reports/MetricsMatrixReport",
        success: function (metricsMatrixReport) {
            $('#dashBoardLoadingGif').hide();
            if (metricsMatrixReport.Success === "ok") {

                var kludge = "<table><tr><th></th><th>Today</th><th>Yesterday</th><th>-2 Days</th><th>-3 Days</th><th>-4 Days</th>" +
                    "<th>-5 Days</th><th>-6 Days</th></tr>";
                $.each(metricsMatrixReport.MatrixRows, function (idx, row) {
                    kludge += "<tr><td>" + row.Column + "</td> ";
                    kludge += "<td>" + row.Today.toLocaleString() + "</td>";
                    kludge += "<td>" + row.Yesterday.toLocaleString() + "</td>";
                    kludge += "<td>" + row.Two_Days_ago.toLocaleString() + "</td>";
                    kludge += "<td>" + row.Three_Days_ago.toLocaleString() + "</td>";
                    kludge += "<td>" + row.Four_Days_ago.toLocaleString() + "</td>";
                    kludge += "<td>" + row.Five_Days_ago.toLocaleString() + "</td>";
                    kludge += "<td>" + row.Six_Days_ago.toLocaleString() + "</td>";
                });
                kludge += "</tr></table>";
                $("#pageHitReport").html(kludge);
                $("#refreshPageHits").show();
                $("#btnPopPages").show();
                $("#btnMostImageHits").show();

                mostVisitedPagesPages();
                runMostImageHits();
            }
            else {
                alert("PageHitsReport: " + metricsMatrixReport.Success);
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

function mostVisitedPagesPages() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Reports/MostVisitedPagesReport",
        success: function (popularPages) {
            $('#dashBoardLoadingGif').hide();
            if (popularPages.Success === "ok") {
                $("#mostPopularPagesReport").html("<table><tr colspan=2><th>Most Popular Pages " + todayString() + "</th></tr>");
                $.each(popularPages.Items, function (idx, obj) {
                    $("#mostPopularPagesReport").append("<tr><td>" + obj.PageName + "</td><td>" + obj.PageHits + "</td></tr>");
                });
                $("#mostPopularPagesReport").append("</table>");
                $('#popPagesContainer').css("display", "inline-block");
            }
            else {
                alert("mostVisitedPagesPages: " + popularPages.Success);
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
        url: settingsArray.ApiServer + "/api/Reports/MostImageHitsReport",
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


function showEventActivityReport() {
    $("#divStandardReportArea").addClass("tightReport");
    activeReport = "EventActivity";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $("#reportLabel").html("<h3>Event Activity Report for " + todayString() + "</h3>");
    runEventActivityReport();
}
function runEventActivityReport() {
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Reports/ActivityReport",
        success: function (activityReport) {
            $('#dashBoardLoadingGif').hide();
            if (activityReport.Success === "ok") {
                var kludge = "<table>";
                kludge += "<tr><th>Ip Address</th><th>City</th><th>State</th><th>Country</th><th>Event</th><th>Called From</th><th>Details</th><th>hitdate</th><th>hit time</th></tr>";
                $.each(activityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.Event + "</td><td>" + obj.CalledFrom.replace('OGGLEBOOBLE.COM', '') + "</td><td>" + obj.Detail + "</td>";
                    kludge += "<td>" + obj.HitDate + "</td><td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#divStandardReportArea").html(kludge);
                $("#activityReportHits").html(" Total: " + activityReport.HitCount.toLocaleString());
            }
            else {
                alert("activityReport: " + activityReport.Success);
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

function showLatestImageHitsReport() {
    activeReport = "LatestImageHits";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $('#reportLabel').html("<h3>Images Viewed " + todayString() + "</h3>");
    runLatestImageHitsReport();
}
function runLatestImageHitsReport() {
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Reports/LatestImageHits",
        success: function (imageHitActivityReport) {
            $('#dashBoardLoadingGif').hide();
            if (imageHitActivityReport.Success === "ok") {
                var kludge = "<table>";
                kludge += "<tr><th>ip</th><th>From</th><th>Page</th><th>link</th><th>hit</th></tr>";
                $.each(imageHitActivityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + ",<br/>" + obj.Region + "<br/>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.FolderName + "</td><td><img height=90 src='" + obj.Link + "'></td>";
                    kludge += "<td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#divStandardReportArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + imageHitActivityReport.HitCount.toLocaleString());
            }
            else {
                alert("ImageHitActivityReport: " + mostImageHits.Success);
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
    activeReport = "MostActiveUsers";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $('#reportLabel').html("<h3>Most Active Users " + todayString() + "</h3>");
    runMostActiveUsersReport();
}
function showPageHitReport() {
    activeReport = "PageHitReport";
    $("#divStandardReportArea").removeClass("tightReport");

    $('.workAreaContainer').hide();
    $('#divStandardReport').show();    
    $('#reportLabel').html("<h3>Page Hit Report for " + todayString() + "</h3>");
    runPageHitReport();
}

function runMostActiveUsersReport() {
    $("#divStandardReportCount").html("");
    $("#divStandardReportArea").removeClass("tightReport");
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Reports/MostActiveUsersReport",
        success: function (mostActiveUsersReport) {
            $('#dashBoardLoadingGif').hide();
            if (mostActiveUsersReport.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>City</th><th>State</th><th>Country</th><th>Hits</th><th>last hit</th></tr>";
                $.each(mostActiveUsersReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.ImageHits.toLocaleString() + "</td>";
                    kludge += "<td>" + obj.LastHit + "</td></tr>";
                });
                kludge += "</table>";

                $("#divStandardReportArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + mostActiveUsersReport.HitCount.toLocaleString());
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

function runPageHitReport() {
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").removeClass("tightReport");
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Reports/PageHitReport",
        success: function (pageHitReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (pageHitReportModel.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>City</th><th>State</th><th>Country</th><th>Page</th><th>Hit</th></tr>";
                $.each(pageHitReportModel.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.FolderName + "</td>";
                    kludge += "<td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#divStandardReportArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }            
            else {
                alert("PageHitsReport: " + pageHitReportModel.Success);
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

function rerunReport() {
    switch (activeReport) {
        case "PageHitReport": runPageHitReport(); break;
        case "MostActiveUsers": runMostActiveUsersReport(); break;
        case "LatestImageHits": runLatestImageHitsReport(); break;
        case "EventActivity": runEventActivityReport(); break;
        default: alert("activeReport [" + activeReport + "] not found");
    }
}