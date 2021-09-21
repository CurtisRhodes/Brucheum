// REPORTS
let activeReport = "";
function runMetricsMatrixReport() {
    if (connectionVerified) {
        $('.middleColumn').width($(window).width() - 100);
        $('#workAreaContainer').css("height", $('#dashboardContainer').height());
        $('#dashBoardLoadingGif').show();
        $('#reportsHeaderTitle').html("Performance Metrics  " + todayString());

        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Report/DailyPerformance",
            // url: settingsArray.ApiServer + "api/Report/MetricMatrixReport",
            success: function (rslts) {
                $('#dashBoardLoadingGif').hide();
                if (rslts.Success === "ok") {
                    //alert("rslts.Success: " + rslts.Success);
                    //alert("rslts.mRows: " + rslts.mRows.length);
                    $('#reportsContentArea').html(
                        "<div id='doubleRowReport'>" +
                        "   <div id='mmTopRow'>" +
                        "       <div id='dailyActivityReportContainer' class='stdReportTable'></div>" +
                        "   </div>" +
                        "   <div id='mmBotRow' class='flexbox'>" +
                        "       <div id='mostPopularPagesContainer' class='subreportContainer'></div>" +
                        "       <div id='mostImageHitsContainer' class='subreportContainer'></div>" +
                        "       <div id='dailyRefferalsContainer' class='subreportContainer'></div>" +
                        "   </div>" +
                        "</div>");
                    $("#dailyActivityReportContainer").html("<div id='fxShell' class='flexbox'>");
                    $("#fxShell").html("<div><div>&nbsp;</div><div>&nbsp;</div>" +
                        "<div>new visitors</div>" +
                        "<div>return Visits</div>" +
                        "<div>page hits</div>" +
                        "<div>image hits</div></div>"
                    );

                    for (let i = 0; i < rslts.mRows.length; i++) {
                        $("#fxShell").append("<div><div class='mmDate'>" + rslts.mRows[i].DayofWeek + "</div>" +
                            "<div><div class='center'>&nbsp;" + rslts.mRows[i].DateString + "&nbsp;</div>" +
                            "<div class='center clickable underline' onclick='metrixSubReport(1,\"" + rslts.mRows[i].ReportDay +"\")'>" +
                            rslts.mRows[i].NewVisitors.toLocaleString() + "</div>" +
                            "<div class='center clickable underline' onclick='metrixSubReport(2,\"" + rslts.mRows[i].ReportDay +"\")'>" +
                            rslts.mRows[i].Visits.toLocaleString() + "</div>" +
                            "<div class='center clickable underline' onclick='metrixSubReport(3,\"" + rslts.mRows[i].ReportDay +"\")'>" +
                            rslts.mRows[i].PageHits.toLocaleString() + "</div>" +
                            "<div class='center'>" +
                            rslts.mRows[i].ImageHits.toLocaleString() + "</div></div>"
                        );
                    }
                    $("#fxShell").append("</div>")

                    runMostVisitedPages();
                    runMostImageHits();
                    //runMostActiveUsers();
                    $("#reportsFooter").html("<button onclick='rerun()'>reload</button>\n");
                }
                else {
                    logError("AJX", 3910, rslts.Success, "metricsMatrixReport");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "runMetricsMatrixReport")) logError("XHR", 3907, errMsg, "runMetricsMatrixReport");
            }
        });
    }
    else
        alert("unable to run report");
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "runMostVisitedPages")) logError("XHR", 3907, errMsg, "runMostVisitedPages");
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
                $("#mostImageHitsContainer").html("<div>Pages with Most Image Hits " + todayString() + "</div>");
                $.each(mostImageHits.Items, function (idx, obj) {
                    $("#mostImageHitsContainer").append("<div><a href='/album.html?folder=" + obj.FolderId + "' target='_blank'>" +
                        obj.PageName + "</a><span class='clickable' onclick='imgHits(" + obj.FolderId + ")'>" + obj.PageHits + "</span></div>");
                });
            }
            else {
                logError("AJX", 3910, mostImageHits.Success, "runMostImageHits");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "runMostImageHits")) logError("XHR", 3907, errMsg, "runMostImageHits");
        }
    });
}
function imgHits(folderId) {
    alert("imgHits: " + folderId);
}
function metrixSubReport(reportId, reportDay) {
    switch (reportId) {
        case 1: // NewVisitors
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Report/DailyVisitors?visitDate=" + reportDay,
                success: function (rslts) {
                    if (rslts.Success == "ok") {
                        $('#dashboardDialogTitle').html("New Visitors details for: " + dateString(reportDay));
                        let kludge = "<div class='visitorsReport'>";
                        kludge += "<table>";
                        kludge += "<tr><th>IpAddress</th><th>location</th><th>InitialPage</th></tr>";
                        $.each(rslts.Visitors, function (idx, obj) {
                            kludge += "<td>" + obj.IpAddress + "</td>";
                            kludge += "<td>" + obj.Location + "</td>";
                            //kludge += "<td>" + obj.InitialVisit + "</td>";
                            kludge += "<td>" + obj.InitialPage + ":" + obj.FolderName + "</td><tr>";
                        });
                        kludge += "</table>";
                        $('#dashboardDialogContents').html(kludge);
                        $('#dashboardDialog').fadeIn();
                    }
                    else {
                        logError("AJX", 3910, rslts.Success, "NewVisitors");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, 3907, "metrix SubReport")) logError("XHR", 3907, errMsg, "metrix SubReport");
                }
            });
            break;
        case 2: // Visits
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Report/DailyVisits?visitDate=" + reportDay,
                success: function (rslts) {
                    if (rslts.Success == "ok") {
                        $('#dashboardDialogTitle').html("Visits: " + dateString(reportDay));
                        let kludge = "<div class='visitorsReport'>";
                        kludge += "<table>";
                        kludge += "<tr><th>IpAddress</th><th>location</th><th>InitialPage</th></tr>";
                        $.each(rslts.Visitors, function (idx, obj) {
                            kludge += "<td>" + obj.IpAddress + "</td>";
                            kludge += "<td>" + obj.Location + "</td>";
                            //kludge += "<td>" + obj.InitialVisit + "</td>";
                            kludge += "<td>" + obj.InitialPage + ":" + obj.FolderName + "</td><tr>";
                        });
                        kludge += "</table>";
                        $('#dashboardDialogContents').html(kludge);
                        $('#dashboardDialog').fadeIn();
                    }
                    else {
                        logError("AJX", 3910, rslts.Success, "NewVisitors");
                    }
                },
                error: function (jqXHR) {
                    let errMsg = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errMsg, 3907, "metrix SubReport/DailyVisits")) logError("XHR", 3907, errMsg, "metrix SubReport/DailyVisits");
                }
            });
            break;
        case 3: // PageHits
            $('#dashboardDialogTitle').html("page hits duplicate: " + dateString(reportDay));
            kludge = "<div>";
            kludge += "</div>";
            $('#dashboardDialogContents').html(kludge);
            $('#dashboardDialog').fadeIn();
            break;
        case 4: // ImageHits
            break;
        default:
    }
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
                kludge += "<tr><th>time</th><th>page</th><th>page type</th><th>location</th><th>Visitor</th></tr>";
                $.each(pageHitReportModel.Items, function (idx, obj) {
                    kludge += "<td>" + obj.HitTime + "</td>";
                    kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='_blank'>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    switch (obj.RootFolder) {
                        case "boobs":
                            kludge += "<td><span style='color:#966211'>" + obj.RootFolder + "</span></td>";
                            break;
                        case "archive":
                            kludge += "<td><span style='color:#ed18ef'>" + obj.RootFolder + "</span></td>";
                            break;
                        case "porn":
                            kludge += "<td><span style='color:red'>" + obj.RootFolder + "</span></td>";
                            break;
                        default:
                            kludge += "<td>" + obj.RootFolder + "</td>";
                    }
                    kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td>";
                    kludge += "<td class='clickable' onclick='showUserDetail(\"" + obj.VisitorId + "\")'>" + obj.VisitorId.substr(9) + "</td></tr>";
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 910209, "runPageHitReport")) logError("XHR", 3907, errMsg, "runPageHitReport");
        }
    });
}

function eventSummaryReport() {
    //$("#divStandardReportArea").addClass("tightReport");
    activeReport = "EventActivity";
    $('#reportsHeaderTitle').html("Event Report for : " + todayString());
    $("#reportsContentArea").html("");
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/EventSummary",
        success: function (eventSummary) {
            $('#dashBoardLoadingGif').hide();
            if (eventSummary.Success === "ok") {
                let kludge = "";
                $.each(eventSummary.Items, function (idx, obj) {
                    kludge += "<div id='ev" + obj.EventCode + "' class='evtDetailRow' onclick='eventDetailReport(\"" + obj.EventCode + "\")'>" +
                        "<div style='width:400px'>" + obj.EventName + "</div>" +
                        "   <div>" + obj.Count.toLocaleString() + "</div>" +
                        "</div>";
                    kludge += "<div class='evtDetailContainer' id='evd" + obj.EventCode + "'></div>";
                });
                //kludge += "<td colspan='2'>Total</td><td colspan='4'>" + eventDetails.Total.toLocaleString() + "<td></tr>";
                kludge += "<div class='evtDetailRow'><div style='width:400px'>Total</div><div>" + eventSummary.Total.toLocaleString() + "</div></div>";
                $("#reportsContentArea").html(kludge);
                //$("#divStandardReportCount").html(" Total: " + eventSummary.Items.Count().toLocaleString());
            }
            else {
                logError("AJX", 3910, activityReport.Success, "eventActivityReport");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "eventSummaryReport")) logError("XHR", 3907, errMsg, "eventSummaryReport");
        }
    });
}
function eventDetailReport(eventCode) {
    if ($('#evd' + eventCode + '').is(":visible")) {
        $('#evd' + eventCode + '').slideUp('slow');
        return;
    }
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/EventDetails?eventCode=" + eventCode,
        success: function (eventDetails) {
            $('#dashBoardLoadingGif').hide();
            if (eventDetails.Success === "ok") {
                var kludge = "<table class='noWrap'>";
                kludge += "<tr><th>Id</th><th>Folder Name</th><th>Called From</th><th>Occured</th><th>IpAddress</th><th>Loction</th></tr>";
                $.each(eventDetails.Items, function (idx, obj) {
                    kludge += "<tr><td>" + obj.FolderId + "</td>";
                    kludge += "<td>" + obj.FolderName + "</td>";
                    kludge += "<td>" + obj.CalledFrom + "</td>";
                    kludge += "<td>" + obj.Occured + "</td>";
                    kludge += "<td>" + obj.IpAddress + "</td>";
                    kludge += "<td>" + obj.Location + "</td></tr>";
                });
                kludge += "</table>";
                $('#evd' + eventCode + '').html(kludge).slideDown('slow');
                //$("#divStandardReportCount").html(" Total: " + eventSummary.Total.toLocaleString());
            }
            else {
                logError("AJX", 3910, activityReport.Success, "eventActivityReport");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "eventDetailReport")) logError("XHR", 3907, errMsg, "eventDetailReport");
        }
    });
}

function errorSummaryReport() {
    //$("#divStandardReportArea").addClass("tightReport");
    activeReport = "ErrorSummary";
    $('#reportsHeaderTitle').html("Error Report for : " + todayString());
    $("#reportsContentArea").html("");
    $("#reportsFooter").html("");
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/Report/ErrorSummary",
        success: function (errorSummary) {
            $('#dashBoardLoadingGif').hide();
            if (errorSummary.Success === "ok") {
                let kludge = "";
                $.each(errorSummary.ErrorRows, function (idx, obj) {
                    kludge += "<div id='er" + obj.ErrorCode + "' class='evtDetailRow' onclick='errorDetailReport(\"" + obj.ErrorCode + "\")'>" +
                        "<div style='width:400px'>" + obj.RefDescription + "</div>" +
                        "   <div>" + obj.ErrorCount.toLocaleString() + "</div>" +
                        "</div>";
                    kludge += "<div class='evtDetailContainer' id='erd" + obj.ErrorCode + "'></div>";
                });
                //kludge += "<td colspan='2'>Total</td><td colspan='4'>" + eventDetails.Total.toLocaleString() + "<td></tr>";
                //kludge += "<div class='evtDetailRow'><div style='width:400px'>Total</div><div>" + errorSummary.Total.toLocaleString() + "</div></div>";
                $("#reportsContentArea").html(kludge);
                //$("#divStandardReportCount").html(" Total: " + eventSummary.Items.Count().toLocaleString());
            }
            else {
                logError("AJX", 3910, errorSummary.Success, "eventActivityReport");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "eventSummaryReport")) logError("XHR", 3907, errMsg, "eventSummaryReport");
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
                    kludge += "<td>" + obj.Occured + "</td>";
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "FeedbackReport")) logError("XHR", 3907, errMsg, "FeedbackReport");
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "runImpactReport")) logError("XHR", 3907, errMsg, "runImpactReport");
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "showMostActiveUsersReport")) logError("XHR", 3907, errMsg, "showMostActiveUsersReport");
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "showLatestImageHitsReport")) logError("XHR", 3907, errMsg, "showLatestImageHitsReport");
        }
    });
}

function runDailyRefferals() {
    try {
        $('#dashBoardLoadingGif').show();
        $("#dailyRefferalsContainer").html("");
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/Report/ReferralsReport",
            success: function (referrals) {
                $('#dashBoardLoadingGif').hide();
                if (referrals.Success === "ok") {
                    let kludge = "<table class='referralsTable'>";
                    kludge += "<tr><th>occured</th><th>source</th><th>type</th><th>naked lady</th><th>visitor</th><th>location</th></tr>";
                    $.each(referrals.VwStaticPageReferrals, function (idx, obj) {
                        kludge += "<tr><td>" + obj.On + " : " + obj.At + "</td>";
                        switch (obj.CalledFrom) {
                            case "static page":
                                kludge += "<td><span style='color:#966211'>" + obj.CalledFrom + "</span></td>";
                                break;
                            case "boobpedia":
                                kludge += "<td><span style='color:#ed18ef'>" + obj.CalledFrom + "</span></td>";
                                break;
                            default:
                                kludge += "<td>" + obj.CalledFrom + "</td>";
                        }
                        kludge += "<td>" + obj.RootFolder + "</td>";
                        kludge += "<td><a href='/album.html?folder=" + obj.Id + "' target='_blank'>" + obj.FolderName + "</a></td>";
                        kludge += "<td class='clickable' onclick='showUserDetail(\"" + obj.Visitor + "\")'>" + obj.Visitor + "</td>";
                        kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td></tr>";
                    });
                    kludge += "</table>";
                    $("#reportsContentArea").html(kludge);
                    $("#reportsFooter").html(" Total: " + referrals.VwStaticPageReferrals.length.toLocaleString());
                }
                else {
                    alert("Daily Refferals Ajax " + referrals.Success);
                    logError("AJX", 3910, referrals.Success, "Daily Refferals Report");
                    if (document.domain == "localhost") alert("run DailyRefferals: " + referrals.Success);
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                alert("Daily Refferals XHR " + errMsg);
                if (!checkFor404(errMsg, 910208, "Daily Refferals Report"))
                    logError("XHR", 3907, errMsg, "Daily Refferals Report");
            }
        });
    } catch (e) {
        alert("run DailyRefferals Catch: " + e);
    }
}
function showUserDetail(visitorId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/UserDetails?visitorId=" + visitorId,
        success: function (userReportSuccessModel) {
            $('#dashBoardLoadingGif').hide();
            if (userReportSuccessModel.Success === "ok") {
                let obj = userReportSuccessModel.UserReport;
                $('#dashboardDialogTitle').html("user details for: " + visitorId);
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "showUserDetail")) logError("XHR", 3907, errMsg, "showUserDetail");
        }
    });
}

///////////////////////////////////////////////////////////////////////////

function buildCategoryPage(folderId) { }

function DupeCheck() {
    let start = Date.now();
    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/DupeCheck/PlusDupeCheck",
        success: function (dupeCheckModel) {
            $('#dashBoardLoadingGif').hide();
            //alert("dupeCheckModel.Success: " + dupeCheckModel.Success);
            if (dupeCheckModel.Success == "ok") {
                let delta = Date.now() - start;
                let minutes = Math.floor(delta / 60000);
                let seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("PlayboyPlusDupeCheck took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                $('#dataifyInfo').show().html("PlayboyPlusDupeCheck took: " + minutes + ":" + seconds +
                    " Groups Processed: " + dupeCheckModel.GroupsProcessed);
                if (dupeCheckModel.ServerFilesMoved > 0)
                    $('#dataifyInfo').append(" ServerFilesMoved: " + dupeCheckModel.ServerFilesMoved);
                if (dupeCheckModel.ServerFilesDeleted > 0)
                    $('#dataifyInfo').append(" Server Files Deleted: " + dupeCheckModel.ServerFilesDeleted);
                if (dupeCheckModel.LocalFilesDeleted > 0)
                    $('#dataifyInfo').append(" Local Files Deleted: " + dupeCheckModel.LocalFilesDeleted);
                if (dupeCheckModel.LocalFilesMoved > 0)
                    $('#dataifyInfo').append(" Local Files Moved: " + dupeCheckModel.LocalFilesMoved);
                if (dupeCheckModel.LinksRemoved > 0)
                    $('#dataifyInfo').append(" Links Removed: " + dupeCheckModel.LinksRemoved);
                if (dupeCheckModel.LinksAdded > 0)
                    $('#dataifyInfo').append(" Links Added: " + dupeCheckModel.LinksAdded);
            }
            else {
                alert("PlayboyPlusDupeCheck: " + dupeCheckModel.Success);
                logError("AJX", 3910, dupeCheckModel.Success, "PlayboyPlusDupeCheck");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, 3363, "PlayboyPlusDupeCheck")) logError("XHR", 3907, errMsg, "PlayboyPlusDupeCheck");
            alert("PlayboyPlusDupeCheck XHR: " + errMsg);
        }
    });
}

function xxerrorReport() {
    activeReport = "PageHitReport";
    $('#reportsHeaderTitle').html("Errors for " + todayString());
    $("#reportsContentArea").html("");
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
                kludge += "<tr><th>error</th><th>called from</th><th>occured</th><th>page</th><th>IpAddress</th><th>ErrorMessage</th></tr>";
                $.each(errorLogReport.ErrorRows, function (idx, obj) {
                    if (obj != null) {
                        kludge += "<tr><td>" + obj.ErrorCode + ": " + obj.Error + "</td>";
                        kludge += "<td>" + obj.CalledFrom.substring(0, 15) + "</td>";
                        kludge += "<td>" + obj.Time + "</td>";
                        kludge += "<td>" + obj.FolderId + ": " + obj.FolderName + "</td>";
                        //kludge += "<td>" + obj.City + " " + obj.Region + " " + obj.Country + "</td>";
                        kludge += "<td class='clickable underline' onclick='showUserErrorDetail(\"" + obj.IpAddress + "\")'>" + obj.IpAddress + "</td>";
                        //if(isNullorUndefined())
                        //kludge += "<td>" + obj.ErrorMessage.substring(0, 40) + "</td>";
                        kludge += "<td>" + obj.ErrorMessage + "</td>";
                        kludge += "</tr>";
                    }
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
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "error Report")) logError("XHR", 3907, errMsg, "error Report");
        }
    });
}
function xxerrorDetailReport(errorCode) {
    if ($('#erd' + errorCode + '').is(":visible")) {
        $('#erd' + errorCode + '').slideUp('slow');
        return;
    }

        //public string ErrorCode { get; set; }
        //public string Time { get; set; }
        //public string UserName { get; set; }
        //public string CalledFrom { get; set; }
        //public string ErrorMessage { get; set; }
        //public string FolderId { get; set; }
        //public string FolderName { get; set; }
        //public string City { get; set; }
        //public string Region { get; set; }
        //public string Country { get; set; }
        //public string VisitorId { get; set; }


    $('#dashBoardLoadingGif').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Report/ErrorDetails?errorCode=" + errorCode,
        success: function (errorDetails) {
            $('#dashBoardLoadingGif').hide();
            if (errorDetails.Success === "ok") {
                $('#dashboardDialogTitle').html("user error details for: " + errorCode);
                let kludge = "<div>";
                $.each(errorDetails.ErrorDetailRows, function (idx, obj) {
                    if (idx == 0) {
                        kludge += "<table>";
                        kludge += "<tr><th>folder</th><th>error</th><th>called from</th><th>calls</th><th>occured</th><th>visitor from</th></tr>";
                    }
                    kludge += "<tr><td>" + obj.FolderId + ": " + obj.FolderName + "</td>";
                    kludge += "<td>" + obj.ErrorMessage + "</td>";
                    kludge += "<td>" + obj.CalledFrom + "</td>";
                    kludge += "<td>" + obj.RepeatCalls + "</td>";
                    kludge += "<td>" + obj.Occured + "</td>";
                    kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td></tr>";
                });
                kludge += "</table>";
                $('#erd' + errorCode+ '').html(kludge).slideDown('slow');
                //$('#dashboardDialog').fadeIn();
            }
            else {
                logError("AJX", 3910, userErrors.Success, "error detail report");
            }

        //    Occured	varchar(20)	YES
        //    ErrorCode	varchar(3)	NO
        //    repeatCalls	bigint(21)	NO		0
        //    UserName	varchar(50)	YES
        //    CalledFrom	varchar(50)	NO
        //    ErrorMessage	varchar(2000)	YES
        //    FolderId	int(4)	NO
        //    FolderName	varchar(150)	YES
        //    City	varchar(50)	YES
        //    Region	varchar(100)	YES
        //    Country	varchar(150)	YES
        //    VisitorId	varchar(36)	NO
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "error detail report")) logError("XHR", 3907, errMsg, "error detail report");
        }
    });
}
function xxrunPlayboyListReport() {
    // can't remember or figure out what this report does.
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
                    logError("AJX", 3910, folderReport.Success, "run PlayboyListReport");
                }
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errMsg, folderId, "run PlayboyListReport")) logError("XHR", 3907, errMsg, "run PlayboyListReport");
            }
        });
    } 
    else
        alert("unable to run report");
}
function xxint2Month(nMonth) {
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
function xxshowCenterfoldImage(link) {
    $('.dirTreeImageContainer').css("top", event.clientY - 100);
    $('.dirTreeImageContainer').css("left", event.clientX + 10);
    $('.dirTreeImage').attr("src", link);
    $('.dirTreeImageContainer').show();
    //$('#footerMessage').html(link);
}

