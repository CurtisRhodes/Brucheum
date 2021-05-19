
function rtpe(eventCode, calledFrom, eventDetail, folderId) {
    // REPORT THEN PERFORM EVENT
    try {
        //logEvent(eventCode, folderId, "(rtpe) " + calledFrom, eventDetail);
        logEvent(eventCode, folderId, calledFrom, eventDetail);
        performEvent(eventCode, eventDetail, folderId);
    }
    catch (e) {
        logError("CAT", folderId, e, eventCode + "  rtpe/" + calledFrom);
    }
}
// "<div class='clickable' onclick='rtpe(\"FLC\",\"dir tree\",\"dir tree\"," + pageId + ")'>Category List</div>\n" +

function performEvent(eventCode, eventDetail, folderId) {
    try {
        if (eventCode === "PRN") {
            //  setUserPornStatus(pornType);
        }
        switch (eventCode) {
            case "GIC": // Gallery Item Clicked
            case "CMC": // carousle context menu item clicked
            case "CXM":  // carousle context menu opened
            case "XLC":  // external link clicked
                // DO NOTHING BUT REPORT
                break;
            case "PRN":  //("Porn Option clicked");
                window.location.href = '/index.html?subdomain=porn';
                break;
            case "HBC":  //  header banner clicked
                window.location.href = '/index.html?spa=' + eventDetail;
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
            case "SEE":  // see more of her
            case "ONT":
                window.open("/album.html?folder=" + folderId, "_blank");  // open in new tab
                break;
            case 'SUB':  // 'Sub Folder Click'
            case "CIC":  // carousel image clicked
            case "CMN":  // carousel model nameclicked
            case "CPC":  // carousel ParentGallery clicked
            case "BCC":  // Breadcrumb Clicked
            case "BLC":  // banner link clicked
            case "TLM":  // top menu link clicked
            case "EPC":  // every playmate clicked
            case "PYC":  // playboy year clicked
            case "PBB":  // playboy breadcrumb click
            case "BAC":  // Babes Archive Clicked
            case "HB2":  // PgLinkButton header banner clicked
                window.location.href = "/album.html?folder=" + folderId;  //  open page in same window
                break;
            case "LUP":  // Update Box click
                if (eventDetail.lastIndexOf("_") > 0) {
                    logImageHit(eventDetail.substr(eventDetail.lastIndexOf("_") + 1, 36), folderId, true);
                }
                window.location.href = "/album.html?folder=" + folderId;  //  open page in same window
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
            case "FLC":  //  footer link clicked
                switch (eventDetail) {
                    case "about us": showCustomMessage(38); break;
                    case "dir tree": showCatListDialog(2); break;
                    case "porn dir tree": showCatListDialog(242); break;
                    case "playmate dir tree": showCatListDialog(472); break;
                    case "porn": showCustomMessage(35, false); break;
                    case "blog": window.location.href = '/index.html?subdomain=blog'; break;
                    case "ranker": window.location.href = "/Ranker.html"; break;
                    case "rejects": window.location.href = "/album.html?folder=1132"; break;
                    case "centerfolds": window.location.href = "/album.html?folder=1132"; break;
                    case "cybergirls": window.location.href = "/album.html?folder=3796"; break;
                    case "softcore": window.location.href = "/album.html?folder=5233"; break;
                    case "extras": window.location.href = "/album.html?folder=2601"; break;
                    case "sluts": window.location.href = "/album.html?folder=440"; break;
                    case "magazine covers": window.location.href = "/album.html?folder=1986"; break;
                    case "archive": window.location.href = "/album.html?folder=3"; break;
                    case "videos": window.location.href = 'video.html'; break;
                    case "mailme": window.location.href = 'mailto:curtishrhodes@hotmail.com'; break;
                    case "freedback": showFeedbackDialog(folderId); break;
                    case "slut archive": window.location.href = "/album.html?folder=440"; break;
                    default:
                        logError("SWT", folderId, "Uncaught Case: " + eventDetail, "performEvent/footer link click");
                        break;
                }
                break;
            default:
                logError("SWT", folderId, "Uncaught Case. eventCode: " + eventCode, "performEvent");
        }
    } catch (e) {
        logError("CAT", folderId, e, "perform Event");
    }
}

