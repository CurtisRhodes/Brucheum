function logActivity(changeLogModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/ChangeLog",
        data: changeLogModel,
        success: function (success) {
            if (success === "ok")
                displayStatusMessage("ok", "add image logged");
            else {
                //alert("ChangeLog: " + success);
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logActivity")) {
                sendEmailToYourself("xhr error in common.js logActivity", "/api  ChangeLog  Message: " + errorMessage);
            }
        }
    });
}

function reportThenPerformEvent(eventCode, pageId) {
    //alert("reportThenPerformEvent(eventCode: " + eventCode + ", pageId: " + pageId + ")");
    var dots = "";
    reportClickEvent(eventCode, pageId);
    var reportEventWaiter = setInterval(function () {
        dots += "x ";
        $('#dots').html(dots);
        if (waitingForReportClickEvent === false) {
            clearInterval(reportEventWaiter);
            //alert("done waiting");
            $('#dots').html("");
            switch (eventCode) {
                case "PRN":  //("Porn Option clicked");
                    window.location.href = '/index.html?subdomain=porn';
                    break;
                case "HBC":  //  Red ballon clicked
                    if (pageId === 3909) {
                        //alert("cocksucker lips clicked");
                        window.location.href = '/index.html?subdomain=porn';
                    }
                    else
                        window.location.href = "/";
                    break;
                case "GAX":  // can I get a connection

                    alert("can I get a connection");
                    //window.location.href = ".";


                    break;
                case "CMC": // carousle context menu item clicked
                    break;
                case "CXM":  // carousle context menu opened
                    carouselContextMenuShow();
                    break;
                case 'SUB': // 'Sub Folder Click'
                    //alert("Sub Folder Click: " + pageId);
                    window.location.href = "/album.html?folder=" + pageId;
                    break;
                case "BCC":  // Breadcrumb Clicked
                case "BLC":  // banner link clicked
                case "CIC":  // carousel image clicked
                    window.location.href = "/album.html?folder=" + pageId;
                    break;
                case "HBX":  // Home breadcrumb Clicked
                    if (pageId === 3909)
                        window.location.href = '/index.html?subdomain=porn';
                    else
                        window.location.href = "/";
                    break;
                case "RNK":
                    switch (pageId) {
                        case 3909:
                            window.location.href = "/Ranker.html?subdomain=porn";
                            break;
                        case 3907:
                            window.location.href = "/Ranker.html?subdomain=playmates";
                            break;
                        default:
                            window.location.href = "/Ranker.html";
                            break;
                    }
                    break;
                default:
                    alert("eventCode " + eventCode + "  not handled in reportThenPerformEvent");
            }
        }
    }, 300);
}

function reportClickEvent(eventCode, pageId) {
    try {
        var visitorId = getCookieValue("VisitorId");
        var ipAddress = getCookieValue("IpAddress");
        if (isNullorUndefined(ipAddress) || isNullorUndefined(visitorId)) {
            //sendEmailToYourself("In reportClickEvent VisitorId: " + visitorId + " Ip: " + ipAddress, "Calling LogVisitor.  Event: " + eventCode + " pageId: " + pageId);
            logVisitor(pageId, "reportClickEvent");
            return;
        }

        var eventClickDdata = {
            PageId: pageId,
            EvenCode: eventCode,
            VisitorId: visitorId
        };

        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/EventLog/LogEventActivity",
            data: eventClickDdata,
            success: function (logEventActivitySuccess) {
                var ipAddr = getCookieValue("IpAddress");
                if (logEventActivitySuccess.Success === "ok") {

                    //if (verbosity > 5)
                    //if (eventCode === "HBX" || eventCode === "CXM" || eventCode === "MBC" || eventCode === "PRN")
                    if (eventCode !== "GIC" && eventCode !== "SUB" && eventCode !== "BCC") {
                        sendEmailToYourself("filtered Click Event [" + logEventActivitySuccess.EventName + "] Page: " + logEventActivitySuccess.PageName,
                            "ipAddress: " + ipAddress + ", visitorId " + visitorId +
                            "logEventActivitySuccess.IpAddress: " + logEventActivitySuccess.IpAddress +
                            ", logEventActivitySuccess.VisitorDetails " + logEventActivitySuccess.VisitorDetails);

                        if (document.domain === 'localhost')
                            alert("Event [" + logEventActivitySuccess.EventName + "] \nPage: " + logEventActivitySuccess.PageName +
                                "\nIp: " + logEventActivitySuccess.IpAddress + ", from " + logEventActivitySuccess.VisitorDetails);
                    }
                    waitingForReportClickEvent = false;
                }
                else {
                    if (ipAddr === "68.203.90.183") {
                        //   alert("Error returned from reportClickEvent.LogEventActivity " + logEventActivitySuccess.Success);
                        sendEmailToYourself("DOUBLE FAIL jQuery 32 fail in reportClickEvent",
                            "PageId: " + pageId +
                            "  EventCode: " + eventCode +
                            "  VisitorId: " + visitorId +
                            "  Message: " + logEventActivitySuccess.Success);

                        alert("DOUBLE FAIL jQuery 32 fail in reportClickEvent" +
                            "PageId: " + pageId +
                            "\n  EventCode: " + eventCode +
                            "\n  VisitorId: " + visitorId +
                            "\n  Message: " + logEventActivitySuccess.Success);
                    }
                    else {
                        sendEmailToYourself("jQuery 32 fail in reportClickEvent",
                            "PageId: " + pageId +
                            "  EventCode: " + eventCode +
                            "  VisitorId: " + visitorId +
                            "  Message: " + logEventActivitySuccess.Success);
                    }
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                //               alert("xhr error in common.js logActivity : " + errorMessage);
                if (!checkFor404(errorMessage, "reportClickEvent")) {
                    var ipAddr = getCookieValue("IpAddress");
                    if (ipAddr === "68.203.90.183") {
                        alert("xhr error in common.js reportClickEvent   /api/ChangeLog/LogEventActivity?eventCode=" + eventCode +
                            "pageId=" + pageId + "&visitorId=" + visitorId + " Message: " + errorMessage);
                    }
                    else {
                        sendEmailToYourself("xhr error in OggleEventLog reportClickEvent", "/api/ChangeLog/LogEventActivity?eventCode=" + eventCode +
                            "pageId=" + pageId + "&visitorId=" + visitorId + " Message: " + errorMessage);
                    }
                }
            }
        });
    } catch (e) {
        waitingForReportClickEvent = false;
        sendEmailToYourself("Catch Error in reportClickEvent()", e);
        //alert("reportClickEvent Catch Error: " + e);
    }
}

