
function rtpe(eventCode, calledFrom, eventDetail, pageId) {
    reportThenPerformEvent(eventCode, calledFrom, eventDetail, pageId);
}

function reportEvent(eventCode, calledFrom, eventDetail, pageId) {
    logEventActivity({
        VisitorId: getCookieValue("VisitorId"),
        EventCode: eventCode,
        EventDetail: eventDetail,
        PageId: pageId,
        CalledFrom: calledFrom
    });
}

function reportThenPerformEvent(eventCode, calledFrom, eventDetail, pageId) {
    try {
        var visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            if (document.domain === 'localhost')
                console.error("visitorId not set in reportThenPerformEvent: " + eventCode);
            else
                logError({
                    VisitorId: "undefined",
                    ActivityCode: "CA2",
                    Severity: 2,
                    ErrorMessage: "visitorId not set",
                    CalledFrom: "reportThenPerformEvent/" + calledFrom
                });
            visitorId = "unknown";
        }

        logEventActivity({
            VisitorId: visitorId,
            EventCode: eventCode,
            EventDetail: eventDetail,
            PageId: pageId,
            CalledFrom: calledFrom
        });

        performEvent(eventCode, calledFrom, eventDetail, pageId);

    }
    catch (e) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "CA2",
            Severity: 2,
            ErrorMessage: e,
            CalledFrom: "reportThenPerformEvent/" + calledFrom
        });
        if (document.domain === 'localhost') {
            alert("reportThenPerformEvent Catch Error: " + e);
        }
    }
}

function performEvent(eventCode, calledFrom, eventDetail, pageId) {
    if (eventCode === "PRN") {
        //  setUserPornStatus(pornType);
    }
    switch (eventCode) {
        case "GIC": // Gallery Item Clicked
        case "CMC": // carousle context menu item clicked
        case "CXM":  // carousle context menu opened
        case "XLC":  // external link clicked
            break;
        case "PRN":  //("Porn Option clicked");
            window.location.href = '/index.html?subdomain=porn';
            break;
        case "HBC":  //  header banner clicked
            if (eventDetail === "porn")
                window.location.href = '/index.html?subdomain=porn';
            else
                window.location.href = "/";
            break;
        case "GAX":  // can I get a connection
            alert("can I get a connection");
            //window.location.href = ".";
            break;
        case "EXP":  // Explode
            //rtpe("EXP", currentAlbumJSfolderName, selectedImage, albumFolderId);
            window.open(eventDetail, "_blank");
            break;
        case "SRC":  // Search Performed
        case "SSB":
        case "SSC":
            window.open("/album.html?folder=" + pageId, "_blank");
            break;
        case 'SUB':  // 'Sub Folder Click'
        case "CIC":  // carousel image clicked
        case "CMN":  // carousel model nameclicked
        case "SEE":  // see more of her
        case "CPC":  // carousel ParentGallery clicked
        case "BCC":  // Breadcrumb Clicked
        case "BLC":  // banner link clicked
        case "BAC":  // Babes Archive Clicked
        case "LUP":  // Update Box click
            window.location.href = "/album.html?folder=" + pageId;  //  open page in same window
            break;
        case "CMX":
            showModelInfoDialog(eventDetail, pageId, 'Images/redballon.png');
            break;
        case "HBX":  // Home breadcrumb Clicked
            if (eventDetail === "porn")
                window.location.href = '/index.html?subdomain=porn';
            else
                window.location.href = "/";
            break;
        case "RNK":  // Ranker Banner Clicked
            window.location.href = "/Ranker.html?subdomain=" + eventDetail;
            break;
        case "LMC":  // Left Menu Clicked
            switch (eventDetail) {
                case "boobTransitions": window.location.href = 'transitions.html'; break;
                case "pornTransitions": window.location.href = "transitions.html?subdomain=porn"; break;
                case "boobsRanker": window.location.href = 'ranker.html'; break;
                case "pornRanker": window.location.href = 'ranker.html?subdomain=porn'; break;
                case "dirTreeBoobs": showCatListDialog(2); break;
                case "dirTreePorn": showCatListDialog(242); break;
                case "explainBoobs": showCustomMessage(38, true); break;
                case "explainPorn": showCustomMessage(94, true); break;
                case "back": window.location.href = "/"; break;
                case "centerfolds": window.location.href = '/album.html?folder=1132'; break;
                case "video": window.location.href = 'video.html'; break;
                case "blog": window.location.href = '/Blog.html'; break;
                case "porn":
                    if (isLoggedIn())
                        window.location.href = '/index.html?subdomain=porn';
                    else
                        showCustomMessage(35, false);
                    break;
                default:
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "KLG",
                        Severity: 2,
                        ErrorMessage: "uncaught switch option Left Menu Click EventDetail: " + eventDetail,
                        CalledFrom: calledFrom
                    });
                //alert("uncaught switch option Left Menu Click\nEventDetail: " + eventDetail); break;
            }
            break;
        case "FLC":  //  footer link clicked
            //if (document.domain === 'localhost') alert("eventCode: " + eventCode + " pageId: " + pageId);
            switch (eventDetail) {
                case "about us": showCustomMessage(38); break;
                case "dir tree": showCatListDialog(2); break;
                case "porn dir tree": showCatListDialog(242); break;
                case "playmate dir tree": showCatListDialog(472); break;
                case "porn": showCustomMessage(35, false); break;
                case "blog": window.location.href = '/Blog.html'; break;
                case "ranker": window.location.href = "/Ranker.html"; break;
                case "rejects": window.location.href = "/album.html?folder=1132"; break;
                case "centerfolds": window.location.href = "/album.html?folder=1132"; break;
                case "cybergirls": window.location.href = "/album.html?folder=3796"; break;
                case "extras": window.location.href = "/album.html?folder=2601"; break;
                case "magazine covers": window.location.href = "/album.html?folder=1986"; break;
                case "archive": window.location.href = "/album.html?folder=3"; break;
                case "videos": window.location.href = 'video.html'; break;
                case "mailme": window.location.href = 'mailto:curtishrhodes@hotmail.com'; break;
                case "freedback": showFeedbackDialog(); break;
                case "slut archive": window.location.href = "/album.html?folder=440"; break;
                default:
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "KLG",
                        Severity: 2,
                        ErrorMessage: "uncaught switch option footer link clicked EventDetail: " + eventDetail,
                        CalledFrom: calledFrom
                    });
                    //alert("eventDetail: " + eventDetail);
                    break;
            }
            break;
        default:
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "KLG",
                Severity: 2,
                ErrorMessage: "Uncaught Case: " + eventDetail + "eventCode " + eventCode + "  not handled in reportThenPerformEvent",
                CalledFrom: calledFrom
            });
        //sendEmailToYourself("Uncaught Case: " + eventCode, "eventCode " + eventCode + "  not handled in reportThenPerformEvent");
    }
}
