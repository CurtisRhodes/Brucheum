// REPORTS
let activeReport = "";
function runMetricsMatrixReport() {
    if (connectionVerified) {
        $('#workAreaContainer').css("height", $('#dashboardContainer').height());
        $('#dashBoardLoadingGif').show();
        $('#reportsHeaderTitle').html("Performance Metrics  " + todayString());

        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Report/MetricMatrixReport",
            success: function (metricsMatrixResults) {
                $('#dashBoardLoadingGif').hide();
                if (metricsMatrixResults.Success === "ok") {
                    //alert("metricsMatrixResults.Success: " + metricsMatrixResults.Success);
                    //alert("metricsMatrixResults.matrixModelRows: " + metricsMatrixResults.matrixModelRows.length);
                    $('#reportsContentArea').html(
                        "<div id='doubleRowReport'>" +
                        "   <div id='mmTopRow'>" +
                        "       <div id='dailyActivityReportContainer' class='stdReportTable'></div>" +
                        "   </div>" +
                        "   <div id='mmBotRow' class='flexbox'>" +
                        "       <div id='mostPopularPagesContainer' class='subreportContainer'></div>" +
                        "       <div id='mostImageHitsContainer' class='subreportContainer'></div>" +
                        "   </div>" +
                        "</div>");

                    $("#dailyActivityReportContainer").html("<div id='fxShell' class='flexbox'>");
                    $("#fxShell").html("<div><div>&nbsp;</div><div>&nbsp;</div>" +
                        "<div>NewVisitors</div>" +
                        "<div>Visits</div>" +
                        "<div>PageHits</div>" +
                        "<div>ImageHits</div></div>");

                    let i, mLen = 8;
                    for (i = 0; i < 10; i++) { //for (i = mLen; i > -1; i--) {
                        $("#fxShell").append("<div><div class='center'>" + metricsMatrixResults.matrixModelRows[i].DayofWeek + "</div>" +
                            "<div><div class='center'>&nbsp;" + metricsMatrixResults.matrixModelRows[i].DateString + "&nbsp;</div>" +
                            "<div class='center'>" + metricsMatrixResults.matrixModelRows[i].NewVisitors.toLocaleString() + "</div>" +
                            "<div class='center'>" + metricsMatrixResults.matrixModelRows[i].Visits.toLocaleString() + "</div>" +
                            "<div class='center'>" + metricsMatrixResults.matrixModelRows[i].PageHits.toLocaleString() + "</div>" +
                            "<div class='center'>" + metricsMatrixResults.matrixModelRows[i].ImageHits.toLocaleString() + "</div></div>");
                    }
                    $("#fxShell").append("</div>")
                    $("#reportsFooter").html("<button onclick='rerun()'>reload</button>\n");

                    //$("#btnPopPages").show();
                    //$("#btnMostImageHits").show();
                    runMostVisitedPages();
                    runMostImageHits();
                }
                else {
                    logError("AJX", 3910, metricsMatrixResults.Success, "metricsMatrixReport");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("metricsMatrixReport")) {
                    logError("XHR", 3910, getXHRErrorDetails(jqXHR), "metricsMatrixReport");
                }
            }
        });
    }
    else
        alert("unable to run report");
}

function runPageHitReport() {
    activeReport = "PageHitReport";
    $('#reportsHeaderTitle').html("Page Hit Report for : " + todayString());
    $("#reportsContentArea").html("");
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/PageHitReport",
        success: function (pageHitReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (pageHitReportModel.Success === "ok") {
                let kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>ip</th><th>location</th><th>page</th><th>folder type</th><th>&nbsp;images hit</th><th>hit time</th></tr>";
                $.each(pageHitReportModel.Items, function (idx, obj) {
                    kludge += "<tr><td class='clickable' onclick='showUserDetail(\"" + obj.IpAddress + "\")'>" + obj.IpAddress + "</td>";
                    kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td>";
                    kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='_blank'>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    kludge += "<td>" + obj.RootFolder + "</td>";
                    kludge += "<td>" + obj.ImageHits + "</td>";
                    kludge += "<td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#reportsContentArea").html(kludge);

                $("#reportsFooter").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }
            else {
                logError("AJX", 3910, pageHitReportModel.Success, "pageHitsReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("pageHitsReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "pageHitsReport");
            }
        }
    });
}

function runMostVisitedPages() {
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/MostVisitedPagesReport",
        success: function (popularPages) {
            $('#dashBoardLoadingGif').hide();
            $('.subreportContainer').css("height", $('#dashboardContainer').height() - $("#dailyActivityReportContainer").height() * 2.13);
            if (popularPages.Success === "ok") {
                $("#mostPopularPagesContainer").html("<div>Most Popular Pages " + todayString() + "</div>");
                $.each(popularPages.Items, function (idx, obj) {
                    $("#mostPopularPagesContainer").append("<div>" +
                        "<a href='/album.html?folder=" + obj.FolderId + "' target='_blank'>" + obj.PageName + "</a>" + obj.PageHits + "</div>");
                });
            }
            else {
                logError("AJX", 3910, popularPages.Success, "mostVisitedPages");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("mostVisitedPages")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "mostVisitedPages");
            }
        }
    });
}

function runMostImageHits() {
    $('#dashBoardLoadingGif').show();
    $("#mostImageHitsContainer").html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/MostImageHitsReport",
        success: function (mostImageHits) {
            $('#dashBoardLoadingGif').hide();
            if (mostImageHits.Success === "ok") {
                $("#mostImageHitsContainer").html("<div>Most Image Hits" + todayString() + "</div>");
                $.each(mostImageHits.Items, function (idx, obj) {
                    $("#mostImageHitsContainer").append("<div><a href='/album.html?folder=" + obj.FolderId + "' target='_blank'>" +
                        obj.PageName + "</a>" + obj.PageHits + "</div>");
                });
            }
            else {
                logError("AJX", 3910, mostImageHits.Success, "runMostImageHits");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("runMostImageHits")) 
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "runMostImageHits");
        }
    });
}

function showEventActivityReport() {
    //$("#divStandardReportArea").addClass("tightReport");
    activeReport = "EventActivity";
    $('#divStandardReport').show();
    $("#reportLabel").html("Event Activity Report for " + todayString());
    $('#reportsHeaderTitle').html("Event Activity Report for : " + todayString());
    $("#reportsContentArea").html("");
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/ActivityReport",
        success: function (activityReport) {
            $('#dashBoardLoadingGif').hide();
            if (activityReport.Success === "ok") {
                var kludge = "<table class='noWrap' >";
                //var kludge = "<table class='mostAvtiveUsersTable'>";
                //kludge += "</table>";
                kludge += "<tr><th>Event</th><th>Ip Address</th><th>City,Country</th><th>hit time </th><th>Called From</th><th>Details</th></tr>";
                $.each(activityReport.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.Event + "</td>";
                    kludge += "<td>" + obj.IpAddress + "</td>";
                    kludge += "<td>" + obj.City + " " + obj.Region + ", " + obj.Country + "</td>";
                    kludge += "<td>" + obj.HitTime + "  </td>";
                    // kludge += "<td>" + obj.CalledFrom.replace('OGGLEBOOBLE.COM', '') + "</td><td>" + obj.Detail + "</td></tr > ";
                    kludge += "<td>" + obj.CalledFrom + "</td>";
                    kludge += "<td>" + obj.Detail + "</td></tr>";
                    //kludge += "<td>" + obj.CalledFrom.replace('OGGLEBOOBLE.COM', '') + "</td><td>" + obj.Detail + "</td></tr > ";
                    //kludge += "<td>" + obj.HitDate + "</td><td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#reportsContentArea").html(kludge);
                $("#divStandardReportCount").html(" Total: " + activityReport.HitCount.toLocaleString());
            }
            else {
                logError("AJX", 3910, impactReportModel.Success, "eventActivityReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("eventActivityReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "eventActivityReport");
            }
        }
    });
}

function showLatestImageHitsReport() {
    activeReport = "LatestImageHits";
    $('#reportLabel').html("Images Viewed " + todayString());
    $('#dashBoardLoadingGif').show();
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
                logError("AJX", 3910, imageHitActivityReport.Success, "showLatestImageHitsReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("LatestImageHitsReport"))
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "showLatestImageHitsReport");
        }
    });
}

function showMostActiveUsersReport() {
    activeReport = "MostActiveUsers";
    $('#reportsHeaderTitle').html("Most Active Users " + todayString());
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/MostActiveUsersReport",
        success: function (mostActiveUsersReport) {
            $('#dashBoardLoadingGif').hide();
            if (mostActiveUsersReport.Success === "ok") {
                let kludge = "<table class='mostAvtiveUsersTable'>";
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
                $("#reportsContentArea").html(kludge);
                //$("#reportsFooter").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }
            else {
                logError("AJX", 3910, mostActiveUsersReport.Success, "mostActiveUsersReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("mostActiveUsersReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "mostActiveUsersReport");
            }
        }
    });
}

function errorLogReport() {
    activeReport = "ErrorLog";
    $('#reportsHeaderTitle').html("Errors for " + todayString());
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/ErrorLogReport",
        success: function (errorLogReport) {
            $('#dashBoardLoadingGif').hide();
            if (errorLogReport.Success === "ok")
            {
                let kludge = "<div><table class='errorLogTable'>";
                kludge += "<tr><th>error</th><th>called from</th><th colspan=2>occured</th><th>page</th><th>user</th></tr>";
                $.each(errorLogReport.ErrorRows, function (idx, obj) {
                    kludge += "<tr><td>" + obj.ErrorCode + ": " + obj.Error + "</td>";
                    kludge += "<td>" + obj.CalledFrom + "</td>";
                    kludge += "<td>" + obj.Occured + "</td>";
                    kludge += "<td>" + obj.Time + "</td>";
                    kludge += "<td>" + obj.FolderId + ": " + obj.FolderName + "</td>";
                    //kludge += "<td>" + obj.City + " " + obj.Region + " " + obj.Country + "</td>";
                    kludge += "<td class='clickable' onclick='showUserErrorDetail(\"" + obj.IpAddress + "\")'>" + obj.IpAddress + "</td>";
                    kludge += "</tr>";

                    //kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='\_blank\''>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    //html += "<td colspan='6'>" + obj.ErrorMessage + "</td></tr>";
                    //html += "<td>" + obj.City + "," + obj.Country + "</td>";
                    //html += "</tr><tr><td colspan='6'>" + obj.ErrorMessage + "</td></tr></tr>";
                });
                kludge += "</table></div>";
                $("#reportsContentArea").html(kludge);
          }
            else {
                logError("AJX", 3910, errorLogReport.Success, "errorLogReport");
                alert("PageHitsReport: " + errorLogReport.Success);
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("errorLogReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "errorLogReport");
            }
        }
    });
}

function showUserDetail(ipAddress) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/UserDetails?ipAddress=" + ipAddress,
        success: function (userReportSuccessModel) {
            $('#dashBoardLoadingGif').hide();
            if (userReportSuccessModel.Success === "ok") {
                let obj = userReportSuccessModel.UserReport;
                $('#dashboardDialogTitle').html("user details for: " + ipAddress);
                let kludge = "<div>";
                kludge += "<div>from: " + obj.City + ", " + obj.Region + ", " + obj.Country + "</div>";
                kludge += "<div>initial visit: " + obj.InitialVisit + "</div>";
                kludge += "<div>visits: " + obj.Visits + "</div>";
                kludge += "<div>page hits:  " + obj.PageHits + "</div>";
                kludge += "<div>image hits: " + obj.ImageHits + "</div>";
                kludge += "<div>user name:  " + obj.UserName + "</div>";
                kludge += "</div>";
                $('#dashboardDialogContents').html(kludge);
                $('#dashboardDialog').fadeIn();
            }
            else {
                logError("AJX", 3910, pageHitReportModel.Success, "pageHitsReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("pageHitsReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "pageHitsReport");
            }
        }
    });
}

function showUserErrorDetail(ipAddress) {
    // alert("showUserDetail: " + ipAddress);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/UserErrorDetails?ipAddress=" + ipAddress,
        success: function (userErrors) {
            $('#dashBoardLoadingGif').hide();
            if (userErrors.Success === "ok") {
                $('#dashboardDialogTitle').html("user error details for: " + ipAddress);
                let kludge = "<div>";
                $.each(userErrors.ErrorRows, function (idx, obj) {
                    if (idx == 0) {
                        kludge += "<div>from: " + obj.City + ", " + obj.Region + ", " + obj.Country + "</div>";
                        kludge += "<table>";
                        kludge += "<tr><th>folder</th><th>error</th><th>called from</th><th>occured</th></tr>";
                    }
                    kludge += "<tr><td>" + obj.FolderId + ": " + obj.FolderName + "</td>";
                    kludge += "<td>" + obj.ErrorCode + ": " + obj.Error + "</td>";
                    kludge += "<td>" + obj.CalledFrom + "</td>";
                    kludge += "<td>" + obj.Occured + ":" + obj.Time + "</td><tr>";
                });
                kludge += "</table>";
                $('#dashboardDialogContents').html(kludge);
                $('#dashboardDialog').fadeIn();
            }
            else {
                logError("AJX", 3910, userErrors.Success, "pageHitsReport");
            }

            //    public class VwErrorReport {
            //    public int FolderId { get; set; }
            //    public string FolderName { get; set; }
            //    public string Error { get; set; }
            //    public string CalledFrom { get; set; }
            //    public string ErrorMessage { get; set; }
            //    public string VisitorId { get; set; }
            //    public string Occured { get; set; }
            //    public string Time { get; set; }
            //    public string ErrorCode { get; set; }
            //    public string IpAddress { get; set; }
            //    public string City { get; set; }
            //    public string Region { get; set; }
            //    public string Country { get; set; }
            //}
        },
        error: function (jqXHR) {
            if (!checkFor404("errorLogReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "errorLogReport");
            }
        }
    });
}

function FeedbackReport() {
    activeReport = "Feedback";
    $('#reportsHeaderTitle').html("Feedback Report");
    $("#reportsContentArea").html("");
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/FeedbackReport",
        success: function (feedbackReport) {
            $('#dashBoardLoadingGif').hide();
            if (feedbackReport.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>Type</th><th>Page</th><th>Ip</th><th>Occured</th><th>Location</th></tr>";
                $.each(feedbackReport.FeedbackRows, function (idx, obj) {
                    kludge += "<tr><td>" + obj.FeedbackType + "</td>";
                    kludge += "<td>" + obj.FolderName + "</td>";
                    kludge += "<td>" + obj.IpAddress + "</td>";
                    //kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='\_blank\''>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    kludge += "<td>" + obj.Occured+ "</td>";
                    kludge += "<td>" + obj.Location + "</td></tr>";
                    // kludge += "<td>" + obj.Email + "</td></tr>";
                    kludge += "<tr><td colspan=5>" + obj.FeedBackComment + "</td></tr>";
                });
                kludge += "</table>";
                $("#reportsContentArea").html(kludge);
                $("#reportsFooter").html(" Total: " + feedbackReport.Total.toLocaleString());
            }
            else {
                logError("XHR", 3910, feedbackReport.Success, "FeedbackReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("FeedbackReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "FeedbackReport");
            }
        }
    });
}

function runImpactReport() {
    activeReport = "ImpactReport";
    activeReport = "PageHitReport";
    $('#reportsHeaderTitle').html("Impact Report for : " + todayString());
    $("#reportsContentArea").html("");
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/ImpactReport",
        success: function (impactReportModel) {
            $('#dashBoardLoadingGif').hide();
            if (impactReportModel.Success === "ok") {
                var kludge = "<table class='mostAvtiveUsersTable'>";
                kludge += "<tr><th>Updated</th><th>Page</th><th>Total Hits</th><th>Impact Hits</th></tr>";
                $.each(impactReportModel.ImpactRows, function (idx, obj) {
                    kludge += "<td>" + obj.DateUpdated + "</td>";
                    kludge += "<td>" + obj.Parent + " " + "<a href='/album.html?folder=" + obj.FolderId + "' target='\_blank\''>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    kludge += "<td>" + obj.Hits + "</td>";
                    kludge += "<td>" + obj.ImpactHits + "</td></tr>";
                });
                kludge += "</table>";
                $("#reportsContentArea").html(kludge);
                //$("#divStandardReportCount").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }
            else {
                logError("XHR", 3910, impactReportModel.Success, "impact report");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("impact report")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "impact report");
            }
        }
    });
}

function int2Month(nMonth) {
    switch (nMonth) {
        case 1: return "January";
        case 2: return "February";
        case 3: return "March";
        case 4: return "April";
        case 5: return "May";
        case 6: return "June";
        case 7: return "July";
        case 8: return "August";
        case 9: return "September";
        case 10: return "October";
        case 11: return "November";
        case 12: return "December";
        default: return nMonth;
    }
}

function poll() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/Poll",
        success: function (processStatus) {
            $('#dataifyInfo').html("building centerfold page: " + processStatus);
        },
        error: function (jqXHR) {
            if (!checkFor404("poll")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "poll");
            }
        }
    });
}

function buildListPage(startFolder) {
    let start = Date.now();
    //let pollingLoop = setInterval(function () { pollBuildCenterfoldHtmlPage() }, 5000);
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("building Centerfold List");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Report/BuildListPage?rootFolder=" + startFolder,
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success == "ok") {
                let delta = Date.now() - start;
                let minutes = Math.floor(delta / 60000);
                let seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("build Centerfold List took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                //clearInterval(pollingLoop);
                $('#dataifyInfo').html("html List took: " + minutes + ":" + seconds);
            }
            else {
                logError("AJX", 3910, success, "build List Page");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            if (!checkFor404("build List Page")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "build List Page");
            }
        }
    });
}

function runPlayboyListReport() {
    if (connectionVerified) {
        $('#dashBoardLoadingGif').show();
        $('#reportsHeaderTitle').html("Playboy List");
        $('#workAreaContainer').css("height", $('#dashboardContainer').height());
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Report/PlayboyList",
            success: function (folderReport) {
                if (folderReport.Success == "ok") {
                    $('#reportsContentArea').html("<div></div>");
                    let pbDecade = "", pbYear = "";
                    $.each(folderReport.PlayboyReportItems, function (idx, folderReport) {
                        if (folderReport.FolderDecade != pbDecade) {
                            $('#reportsContentArea').append("<div class='pbDecade'>" + folderReport.FolderDecade + "</div>");
                            pbDecade = folderReport.FolderDecade;
                        }
                        if (folderReport.FolderYear != pbYear) {
                            $('#reportsContentArea').append("<div class='pbYear'>" + folderReport.FolderYear + "</div>");
                            pbYear = folderReport.FolderYear;
                        }
                        $('#reportsContentArea').append("<div>" +
                            "<div class='pbRow' style='width:66px;'>" + int2Month(folderReport.FolderMonth) + "</div>" +
                            "<div class='pbRow' " +
                            "onmouseover=showCenterfoldImage('" + encodeURI(folderReport.ImageSrc) + "') onmouseout=$('.dirTreeImageContainer').hide()>" +
                            "<a href='" + folderReport.StaticFile + "' target=\"_blank\">" + folderReport.FolderName + " </a></div ></div > ");
                    });
                    $('#dashBoardLoadingGif').hide();

                    //string writeToDiskSuccess = WriteFileToDisk(staticContent.ToString(), dbFolder.FolderName, folderId, db);
                    //if (writeToDiskSuccess != "ok") {
                    //    resultsModel.Errors.Add(writeToDiskSuccess + "  " + dbFolder.FolderName);
                    //    resultsModel.Success = writeToDiskSuccess + "  " + dbFolder.FolderName;
                    //}
                    //else
                    //    resultsModel.PagesCreated++;
                }
                else {
                    $('#dashBoardLoadingGif').hide();
                    logError("AJX", 3910, folderReport.Success, "runPlayboyListReport");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("runPlayboyListReport")) {
                    logError("XHR", 3910, getXHRErrorDetails(jqXHR), "runPlayboyListReport");
                }
            }
        });
    } 
    else
        alert("unable to run report");
}

function showCenterfoldImage(link) {
    $('.dirTreeImageContainer').css("top", event.clientY - 100);
    $('.dirTreeImageContainer').css("left", event.clientX + 10);
    $('.dirTreeImage').attr("src", link);
    $('.dirTreeImageContainer').show();
    //$('#footerMessage').html(link);
}
