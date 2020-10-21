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
                logError("AJX", 3910, activityReport.Success, "eventActivityReport");
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

function showUserDetail(ipAddress) {
    alert("showUserDetail: " + ipAddress);
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

                    kludge += "<tr><td onclick='showUserDetail(\"" + obj.IpAddress + "\")'>" + obj.IpAddress + "</td>";

                    kludge += "<td>" + obj.City + ", " + obj.Region + ", " + obj.Country + "</td>";
                    kludge += "<td><a href='/album.html?folder=" + obj.PageId + "' target='_blank'>" + obj.FolderName.substring(0, 20) + "</a></td>";
                    kludge += "<td>" + obj.FolderType + "</td>";
                    kludge += "<td>" + obj.ImageHits + "</td>";
                    kludge += "<td>" + obj.HitTime + "</td></tr>";
                });
                kludge += "</table>";
                $("#reportsContentArea").html(kludge);

                $("#reportsFooter").html(" Total: " + pageHitReportModel.HitCount.toLocaleString());
            }
            else {
                logError("AJX", 3910, success, "pageHitsReport");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("pageHitsReport")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "pageHitsReport");
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

function buildCenterfoldList() {
    let start = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("building Centerfold List");
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Report/BuildCenterfoldList?rootFolder=1132",
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            if (success == "ok") {
                let delta = Date.now() - start;
                let minutes = Math.floor(delta / 60000);
                let seconds = (delta % 60000 / 1000).toFixed(0);
                console.log("build Centerfold List took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                $('#dataifyInfo').html("centerfold List took: " + minutes + ":" + seconds);
            }
            else {
                logError("AJX", 3910, success, "buildCenterfoldList");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            if (!checkFor404("buildCenterfoldList")) {
                logError("XHR", 3910, getXHRErrorDetails(jqXHR), "buildCenterfoldList");
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
