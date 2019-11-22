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

    //EVT	LMC	Left menu item clicked

    var dots = "";
    reportClickEvent(eventCode, pageId);
    var reportEventWaiter = setInterval(function () {
        dots += "x ";
        $('#dots').html(dots);
        if (waitingForReportClickEvent === false) {
            clearInterval(reportEventWaiter);
            //alert("done waiting");
            $('#dots').html("");
            //if (document.domain === 'localhost') alert("done waiting. EventCode: " + eventCode + ". PageId: " + pageId);
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
                //case 'SUB': // 'Sub Folder Click'
                //    //alert("Sub Folder Click: " + pageId);
                //    window.location.href = "/album.html?folder=" + pageId;
                //    break;
                case "EXP":
                    window.open(pageId, "_blank");
                    break;
                case "SSB":  //  Stepchild Subfolder Clicked
                    //alert("Stepchild Subfolder Clicked.  FolderId: " + pageId);
                    window.open("/album.html?folder=" + pageId, "_blank");
                    break;
                case "BAC":  // Babes Archive Clicked
                case "BCC":  // Breadcrumb Clicked
                case "BLC":  // banner link clicked
                case "CIC":  // carousel image clicked
                case 'SUB': // 'Sub Folder Click'
                    //window.open("/album.html?folder=" + pageId); 
                    window.location.href = "/album.html?folder=" + pageId;
                    break;
                case "HBX":  // Home breadcrumb Clicked
                    if (pageId === 3909)
                        window.location.href = '/index.html?subdomain=porn';
                    else
                        window.location.href = "/";
                    break;
                case "RNK":  // Ranker Banner Clicked
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

                case "FLC":  //  footer link clicked
                    //if (document.domain === 'localhost') alert("eventCode: " + eventCode + " pageId: " + pageId);
                    switch (pageId) {
                        //case 3942:  // let me explain
                        case 3942:  // about us
                            showCustomMessage(38);
                            break;
                        case 3941:  // dir tree
                            showCatListDialog(2);
                            break;
                        case 3909: // nasty porn
                            window.location.href = '/index.html?subdomain=porn';
                            break;
                        case 3911: // blog
                            window.location.href = '/Blog.html';
                            break;
                        case 3907: // boobs ranker
                            window.location.href = "/Ranker.html";
                            break;
                        case 3: // archive
                        case 908: // rejects
                        case 1132: // Centerfolds
                            window.location.href = "/album.html?folder=" + pageId;
                            break;
                        case 3991: // videos
                            window.location.href = 'video.html';
                            break;
                        case 3992: // email site developer
                            window.location.href = 'mailto:curtishrhodes@hotmail.com';
                            break;
                        default:
                            alert(pageId);
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

                    //if (document.domain === 'localhost') alert("reportClickEvent 3\nvisitorId: " + visitorId + "\nipAddress: " + ipAddress);

                    //if (verbosity > 5)
                    //if (eventCode === "HBX" || eventCode === "CXM" || eventCode === "MBC" || eventCode === "PRN")
                    if (eventCode !== "GIC"     // Gallery Item Clicked 
                        && eventCode !== "SUB"  // Subfolder Clicked
                        && eventCode !== "BCC"  // Breadcrumb Clicked 
                        && eventCode !== "BLC"  // Banner Link Clicked 
                        && eventCode !== "CAA") // Carousel Arrow Clicked
                    {
                        if (logEventActivitySuccess.IpAddress !== "68.203.90.183")
                        {
                            sendEmailToYourself(logEventActivitySuccess.EventName,
                                "From page: " + pageId + " PageName: " + logEventActivitySuccess.PageName +
                                "<br/>ipAddress: " + ipAddress + //"<br/>visitorId: " + visitorId +
                                ",<br/>visitor details: " + logEventActivitySuccess.VisitorDetails);
                        }
                        //if (document.domain === 'localhost')
                        //    alert("Event [" + logEventActivitySuccess.EventName + "] \nPage: " + logEventActivitySuccess.PageName +
                        //        "\nIp: " + ipAddress + ", from " + logEventActivitySuccess.VisitorDetails);
                    }
                    waitingForReportClickEvent = false;
                }
                else {
                    sendEmailToYourself("jQuery 32 fail in reportClickEvent",
                        "PageId: " + pageId +
                        "<br/>EventCode: " + eventCode +
                        "<br/>VisitorId: " + visitorId +
                        "<br/>Message: " + logEventActivitySuccess.Success);
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
                            "\npageId=" + pageId + "\nvisitorId=" + visitorId + "\nMessage: " + errorMessage);
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

