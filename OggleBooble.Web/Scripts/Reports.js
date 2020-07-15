// REPORTS
var activeReport = "";

function showPerfMetrics() {
    $('.workAreaContainer').hide();
    $('#divHitMetrics').fadeIn();
    metricsMatrixReport();
}
function metricsMatrixReport() {
    if (connectionVerified) {
        //$('#dashBoardLoadingGif').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Report/MetricMatrixReport",
            success: function (metricsMatrixResults) {
                $('#dashBoardLoadingGif').hide();
                if (metricsMatrixResults.Success === "ok") {
                    var kludge = "<table><tr><th></th><th>Today</th><th>Yesterday</th><th>-2 Days</th><th>-3 Days</th><th>-4 Days</th>" +
                        "<th>-5 Days</th><th>-6 Days</th></tr>";
                    $.each(metricsMatrixResults.MatrixRows, function (idx, row) {
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
                    if (document.domain === 'localhost')
                        alert("metricsMatrixReport" + metricsMatrixResults.Success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "AJQ",
                            Severity: 12,
                            ErrorMessage: metricsMatrixResults.Success,
                            CalledFrom: "metricsMatrixReport"
                        });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("metricsMatrixReport")) {
                    if (document.domain === 'localhost')
                        alert("metricsMatrixReport" + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 12,
                            ErrorMessage: errorMessage,
                            CalledFrom: "metricsMatrixReport"
                        });
                }
            }
        });
    }
    else
        alert("unable to run report");
}

function mostVisitedPages() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/MostVisitedPagesReport",
        success: function (popularPages) {
            $('#dashBoardLoadingGif').hide();
            if (popularPages.Success === "ok") {
                $("#mostPopularPagesReport").html("<table><tr colspan=2><th>Most Popular Pages " + todayString() + "</th></tr>");
                $.each(popularPages.Items, function (idx, obj) {
                    $("#mostPopularPagesReport").append("<tr><td><a href='/album.html?folder=" + obj.FolderId + "' target='_blank'>" + obj.PageName + "</a></td><td>" + obj.PageHits + "</td></tr>");
                });
                $("#mostPopularPagesReport").append("</table>");
                $('#popPagesContainer').css("display", "inline-block");
            }
            else {
                if (document.domain === "localhost")
                    alert("mostVisitedPages: " + popularPages.Success);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: popularPages.Success,
                    CalledFrom: "mostVisitedPages"
                });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("runPopPages")) {
                if (document.domain === "localhost")
                    alert("mostVisitedPages: " + errorMessage);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "mostVisitedPages"
                });
            }
        }
    });
}
function runMostImageHits() {
    $('#dashBoardLoadingGif').show();
    $("#mostImageHitsReport").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/MostImageHitsReport",
        success: function (mostImageHits) {
            $('#dashBoardLoadingGif').hide();
            if (mostImageHits.Success === "ok") {
                $("#mostImageHitsReport").html("<table><tr colspan=2><th>Most Image Hits" + todayString() + "</th></tr>");
                $.each(mostImageHits.Items, function (idx, obj) {
                    $("#mostImageHitsReport").append("<tr><td><a href='/album.html?folder=" + obj.FolderId + "' target='_blank'>" +
                        obj.PageName + "</a></td><td>" + obj.PageHits + "</td></tr>");
                });
                $("#mostImageHitsReport").append("</table>");
            }
            else {
                if (document.domain === 'localhost')
                    alert("runMostImageHits" + mostImageHits.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: mostImageHits.Success,
                        CalledFrom: "runMostImageHits"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("runMostImageHits")) 
                if (document.domain === 'localhost')
                    alert("runMostImageHits" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "runMostImageHits"
                    });
        }
    });
}

function showEventActivityReport() {
    //$("#divStandardReportArea").addClass("tightReport");
    activeReport = "EventActivity";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $("#reportLabel").html("Event Activity Report for " + todayString());
    runEventActivityReport();
}
function runEventActivityReport() {
    //$('#dashBoardLoadingGif').show();
    alert("runEventActivityReport");
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/ActivityReport",
        success: function (activityReport) {
            $('#dashBoardLoadingGif').hide();
            if (activityReport.Success === "ok") {
                var kludge = "<table class='noWrap' >";
                //kludge += "<tr><th>Ip Address</th><th>City</th><th>State</th><th>Country</th><th>Event</th><th>Called From</th><th>Details</th><th>hitdate</th><th>hit time</th></tr>";
                kludge += "<tr><th>Ip Address</th><th>City</th><th>Country</th><th>hit time </th><th>Event</th><th>Called From</th><th>Details</th></tr>";
                $.each(activityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.IpAddress + "</td><td>" + obj.City + "</td>";
                    //kludge += "<td>" + obj.Region + "</td>;
                    kludge += "<td>" + obj.Country + "</td>";
                    kludge += "<td>" + obj.HitTime + "  </td>";
                    kludge += "<td>  " + obj.Event + "</td><td>" + obj.CalledFrom.replace('OGGLEBOOBLE.COM', '') + "</td><td>" + obj.Detail + "</td></tr>";
                    //kludge += "<td>" + obj.HitDate + "</td><td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#divStandardReportArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + activityReport.HitCount.toLocaleString());
            }
            else {
                if (document.domain === 'localhost')
                    alert("eventActivityReport" + activityReport.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: activityReport.Success,
                        CalledFrom: "eventActivityReport"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("eventActivityReport")) {
                if (document.domain === 'localhost')
                    alert("eventActivityReport" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "eventActivityReport"
                    });
            }
        }
    });
}

function showLatestImageHitsReport() {
    activeReport = "LatestImageHits";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $('#reportLabel').html("Images Viewed " + todayString());
    runLatestImageHitsReport();
}
function runLatestImageHitsReport() {
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/LatestImageHits",
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
                if (document.domain === 'localhost')
                    alert("LatestImageHitsReport" + imageHitActivityReport.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: imageHitActivityReport.Success,
                        CalledFrom: "LatestImageHitsReport"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("LatestImageHitsReport"))
                if (document.domain === 'localhost')
                    alert("LatestImageHitsReport" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "LatestImageHitsReport"
                    });
        }
    });
}

function showMostActiveUsersReport() {
    activeReport = "MostActiveUsers";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $('#reportLabel').html("Most Active Users " + todayString());
    runMostActiveUsersReport();
}
function runMostActiveUsersReport() {
    $("#divStandardReportCount").html("");
    $("#divStandardReportArea").removeClass("tightReport");
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/MostActiveUsersReport",
        success: function (mostActiveUsersReport) {
            $('#dashBoardLoadingGif').hide();
            if (mostActiveUsersReport.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>City</th><th>image hits today</th><th>total image hits</th><th>page hits today</th>" +
                    "<th>total page hits</th><th>last hit</th><th>initial visit</th><th>user name</th></tr>";
                var lastIp = "";
                $.each(mostActiveUsersReport.Items, function (idx, obj) {
                    if (obj.IpAddress === lastIp) {
                        kludge += "<tr><td></td><td></td>";
                    }
                    else {
                        kludge += "<tr><td>" + obj.IpAddress + "</td>";
                        kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td>";
                        lastIp = obj.IpAddress;
                    }
                    kludge += "<td>" + obj.ImageHitsToday.toLocaleString() + "</td>";
                    kludge += "<td>" + obj.TotalImageHits.toLocaleString() + "</td>";
                    kludge += "<td>" + obj.PageHitsToday.toLocaleString() + "</td>";
                    kludge += "<td>" + obj.TotalPageHits.toLocaleString() + "</td>";
                    kludge += "<td>" + obj.LastHit + "</td>";
                    kludge += "<td>" + obj.InitialVisit + "</td>";
                    kludge += "<td>" + obj.UserName + "</td></tr>";
                });
                kludge += "</table>";

                $("#divStandardReportArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + mostActiveUsersReport.HitCount.toLocaleString());
            }
            else {
                if (document.domain === 'localhost')
                    alert("mostActiveUsersReport" + mostActiveUsersReport.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: mostActiveUsersReport.Success,
                        CalledFrom: "mostActiveUsersReport"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("mostActiveUsersReport")) {
                if (document.domain === 'localhost')
                    alert("mostActiveUsersReport" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "mostActiveUsersReport"
                    });
            }
        }
    });
}

function pageHitReport() {
    activeReport = "PageHitReport";
    var html = stdReportHeader("Page Hit Report for " + todayString());
}
function runPageHitReport() {
    $("#divStandardReportArea").removeClass("tightReport");
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/PageHitReport",
        success: function (pageHitReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (pageHitReportModel.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>City</th><th>Page</th><th>Pages Visited </th><th>&nbsp;  Images Hit</th><th>Hit</th></tr>";
                var lastIp = "";
                $.each(pageHitReportModel.Items, function (idx, obj) {
                    //if (obj.IpAddress === lastIp) {
                    //    kludge += "<tr><td></td><td></td>";
                    //}
                    //else {
                    kludge += "<tr><td>" + obj.IpAddress + "</td>";
                    kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td>";
                    //}
                    if (isNullorUndefined(obj.FolderName))
                        kludge += "<td>null</a></td>";
                    else
                        kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='_blank'>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    if (obj.IpAddress === lastIp) {
                        kludge += "<td></td><td></td>";
                    } else {
                        kludge += "<td>" + obj.PageHits + "</td>";
                        kludge += "<td>" + obj.ImageHits + "</td>";
                        lastIp = obj.IpAddress;
                    }
                    kludge += "<td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#divStandardReportArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }
            else {
                if (document.domain === 'localhost')
                    alert("pageHitsReport" + pageHitReportModel.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: pageHitReportModel.Success,
                        CalledFrom: "pageHitsReport"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("pageHitsReport")) {
                if (document.domain === 'localhost')
                    alert("pageHitsReport" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "pageHitsReport"
                    });
            }
        }
    });
}

function playmateChecklist() {
    

}

function stdReportHeader(title) {
    return "<div class='workAreaHeader'>\n" +
        "    <div class='workAreaHeaderLabel'><h3>" + title + "</h3></div>\n" +
        "    <div class='workAreaCloseButton'><img style='height:25px' src='/images/poweroffRed01.png' onclick='closeReport()'></div>\n" +
        "</div>";
}

function errorLogReport() {
    //    [Route("api/Reports/")]
    activeReport = "ErrorLog";

    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $('#reportLabel').html("Error Log");
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $('#dashBoardLoadingGif').show();
    
    var html = stdReportHeader("Error Report for " + todayString());

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/ErrorLogReport",
        success: function (errorLogReport) {
            $('#dashBoardLoadingGif').hide();
            if (errorLogReport.Success === "ok")
            {
                html += "<div class='overflowContainer'>";

                html += "<table class='mostAvtiveUsersTable'>";
                html += "<tr><th>ip</th><th>Location</th><th>Called From</th><th>Actity</th><th>Severity</th><th>Occured</th></tr>";

                $.each(errorLogReport.ErrorRows, function (idx, obj) {
                    html += "<tr><td>" + obj.IpAddress + "</td>";
                    html += "<td>" + obj.City + "," + obj.Country + "</td>";
                    //kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='\_blank\''>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    html += "<td class='smallColumn'>" + obj.CalledFrom + "</td>";
                    html += "<td>" + obj.ActivityCode + "</td>";
                    html += "<td>" + obj.Severity + "</td>";
                    //html += "<td>" + obj.At + ":" + obj.On + "</td>";
                    html += "<td>" + obj.At + "</td>";
                    //html += "<td colspan='6'>" + obj.ErrorMessage + "</td></tr>";
                    html += "</tr><tr><td colspan='6'>" + obj.ErrorMessage + "</td></tr></tr>";
                });
                html += "</table>";
                html += "</div>";
                //$("#divStandardReportArea").html(kludge);
                //$("#divStandardReportCount").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
                $('#dashboardMiddleColumn').html(html);
            }
            else {
                alert("PageHitsReport: " + errorLogReport.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("errorLogReport")) {
                if (document.domain === 'localhost')
                    alert("errorLogReport" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "errorLogReport"
                    });
            }
        }
    });
}

function FeedbackReport() {
    activeReport = "Feedback";
    $('.workAreaContainer').hide();
    $('#divStandardReport').show();
    $('#reportLabel').html("Feedback Report");
    $('#dashBoardLoadingGif').show();
    $("#divStandardReportArea").html("");
    $("#divStandardReportCount").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/FeedbackReport",
        success: function (feedbackReport) {
            $('#dashBoardLoadingGif').hide();
            if (feedbackReport.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>Page</th><th>Type</th><th>Occured</th><th>User</th><th>Email</th><th>Comment</th></tr>";

                $.each(feedbackReport.FeedbackRows, function (idx, obj) {

                    kludge += "<tr><td>" + obj.IpAddress + "</td>";
                    kludge += "<td>" + obj.Parent + "/" + obj.Folder + "</td>";
                    //kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='\_blank\''>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    kludge += "<td>" + obj.FeedBackType  + "</td>";
                    kludge += "<td>" + obj.Occured+ "</td>";
                    kludge += "<td>" + obj.UserName + "</td>";
                    kludge += "<td>" + obj.Email + "</td></tr>";
                    kludge += "<tr><td colspan=6>" + obj.FeedBackComment + "</td></tr>";
                });
                kludge += "</table>";
                $("#divStandardReportArea").html(kludge);
                //$("#divStandardReportCount").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }
            else {
                if (document.domain === 'localhost')
                    alert("FeedbackReport" + feedbackReport.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 12,
                        ErrorMessage: feedbackReport.Success,
                        CalledFrom: "FeedbackReport"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("FeedbackReport")) {
                if (document.domain === 'localhost')
                    alert("FeedbackReport" + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 12,
                        ErrorMessage: errorMessage,
                        CalledFrom: "FeedbackReport"
                    });
                //sendEmailToYourself("XHR ERROR in Dashboard.js FeedbackReport"                    + errorMessage);
            }
        }
    });
}