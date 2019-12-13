// REPORTS
function metricsMatrixReport() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/MetricsReports/MetricsMatrixReport",
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
                $("#btnImageHitActivityReport").show();

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
        url: settingsArray.ApiServer + "/api/MetricsReports/MostVisitedPagesReport",
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
    $("#eventActivityReportHeader").html("<h3>Event Activity Report for "+ todayString() +"</h3>");


    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/MetricsReports/ActivityReport",
        success: function (activityReport) {
            $('#dashBoardLoadingGif').hide();
            if (activityReport.Success === "ok") {
                var kludge = "<table>";
                kludge += "<tr><th>Ip Address</th><th>City</th><th>State</th><th>Country</th><th>Event</th><th>Called From</th><th>Details</th><th>hitdate</th><th>hit time</th></tr>";
                $.each(activityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.Event + "</td><td>" + obj.CalledFrom.replace('OGGLEBOOBLE.COM', '') + "</td><td>" + obj.Detail + "</td>";
                    kludge += "<td>" + obj.hitDate + "</td><td>" + obj.hitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#activityReport").html(kludge);
                $("#activityReportHits").html(" Total: " + activityReport.HitCount.toLocaleString());
                $('#dashBoardLoadingGif').hide();
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
                kludge += "<tr><th>ip</th><th>City</th><th>State</th><th>Country</th><th>link</th><th>hitdate</th><th>hit time</th></tr>";
                $.each(imageHitActivityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td><img height=90 src='" + obj.Link + "'></td>";
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
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>City</th><th>State</th><th>Country</th><th>Hits</th><th>last hit</th></tr>";
                $.each(mostActiveUsersReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    kludge += "<td>" + obj.Region + "</td><td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.ImageHits.toLocaleString() + "</td>";
                    kludge += "<td>" + obj.LastHit + "</td></tr>";
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
