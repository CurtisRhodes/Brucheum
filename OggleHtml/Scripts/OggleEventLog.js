//	BAC	Babes Archive Clicked
//	BCC	Breadcrumb Clicked
//	BLC	Banner link Clicked
//	CAA	Carousel Arrow Clicked
//	CIC	Carousel Item clicked
//	CMC	Context menu item clicked
//	CXM	Context Menu Opened
//	EXP	Explode Image
//	FCC	Fantasy comment
//	FLC	Footer link clicked
//	GAX	Get a connection
//	GIC	Gallery item clicked
//	HBC	Home Banner Clicked
//	HBX	Home Breadcrumb Clicked
//	LMC	Left menu item clicked
//	MBC	modelInfo banner clicked
//	PRN	Porn checkBox clicked
//	RNK	Ranker banner clicked
//	SBC	Slideshow button clicked
//	SSB	Stepchild Subfolder Clicked
//	SUB	Sub Folder Click

function reportThenPerformEvent(eventCode, calledFrom, eventDetail) {
    try {
        //alert("reportThenPerformEvent(eventCode: " + eventCode + ", calledFrom: " + calledFrom + ", eventDetail: " + eventDetail);
        var visitorId = getCookieValue("VisitorId");
        var ipAddress = getCookieValue("IpAddress");

        if (isNullorUndefined(ipAddress) || isNullorUndefined(visitorId)) {
            sendEmailToYourself("In reportThenPerformEvent VisitorId: " + visitorId + " Ip: " + ipAddress,
                "Calling LogVisitor.  Event: " + eventCode + " calledFrom: " + calledFrom);
            if (document.domain === 'localhost') {
                alert("Who Are You? \nVisitorId: " + visitorId + " Ip: " + ipAddress, "Calling LogVisitor.  Event: " + eventCode + " calledFrom: " + calledFrom);
            }
            logVisitor(calledFrom, "reportThenPerformEvent");
            return;
        }
        var eventClickDdata = {
            PageId: calledFrom,
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

                    if (eventCode === "PRN") {
                        //  setUserPornStatus(pornType);
                    }

                    if (eventCode !== "CIC"     // Carousel Item Clicked 
                        && eventCode !== "FLC"  // Footer Link Clicked 
                        && eventCode !== "BAC"  // Archive Clicked
                        && eventCode !== "SUB"  // Subfolder Clicked
                        && eventCode !== "BCC"  // Breadcrumb Clicked 
                        && eventCode !== "BLC"  // Banner Link Clicked 
                        && eventCode !== "LMC"  // Left Menu Item Clicked
                        && eventCode !== "HBX"  // Home Breadcrumb clicked
                        && eventCode !== "CAA"  // Carousel Arrow Clicked
                        && eventCode !== "HBC") // Home Icon Clicked
                    {
                        if (document.domain === 'localhost') {
                            alert(logEventActivitySuccess.EventName + " {" + eventCode + "}" +
                                "\ncalledFrom: {" + calledFrom + "} : " + logEventActivitySuccess.PageName +
                                "\neventDetail: " + eventDetail +
                                "\nIp: " + ipAddress + ", from " + logEventActivitySuccess.VisitorDetails);
                        }
                        else {
                            sendEmailToYourself(logEventActivitySuccess.EventName + " {" + eventCode + "}",
                                "called From: {" + calledFrom + "}: " + logEventActivitySuccess.PageName +
                                "<br>event detail: " + eventDetail +
                                "<br/>ipAddress: " + ipAddress +
                                "<br/>visitor: " + logEventActivitySuccess.VisitorDetails);
                        }
                    }

                    // NOW PERFORM EVENT
                    switch (eventCode) {
                        case "PRN":  //("Porn Option clicked");
                            window.location.href = '/index.html?subdomain=porn';
                            break;
                        case "HBC":  //  Red ballon clicked
                            if (eventDetail === 3909) {
                                //alert("cocksucker lips clicked");
                                window.location.href = '/index.html?subdomain=porn';
                            }
                            else {

                                window.location.href = "/";
                            }
                            break;
                        case "GAX":  // can I get a connection
                            alert("can I get a connection");
                            //window.location.href = ".";
                            break;
                        case "GIC": // Gallery Item Clicked

                            break;
                        case "CMC": // carousle context menu item clicked
                            break;
                        case "CAA": // carousle context menu item clicked
                            if (direction === "foward")
                                resume();
                            else {
                                // pop
                                imageHistory.pop();
                                imageIndex = imageHistory.pop();
                                if (imageIndex > 0) {
                                    $('#categoryTitle').fadeOut(intervalSpeed);
                                    $('#laCarousel').fadeOut(intervalSpeed, "linear", function () {
                                        $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
                                        $('#categoryTitle').html(carouselItemArray[imageIndex].FolderPath + ": " + carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);
                                        $('#laCarousel').fadeIn(intervalSpeed);
                                        resizeCarousel();
                                    });
                                }
                                else
                                    alert("imageIndex: " + imageIndex);
                            }
                            break;
                        case "CXM":  // carousle context menu opened
                            break;
                        case "EXP":
                            window.open(eventDetail, "_blank");
                            break;
                        case "SSB":  //  Stepchild Subfolder Clicked
                            window.open("/album.html?folder=" + eventDetail, "_blank");
                            break;
                        case "CPC":
                        case 'SUB': // 'Sub Folder Click'
                        case "CIC":  // carousel image clicked
                        case "BCC":  // Breadcrumb Clicked
                        case "BLC":  // banner link clicked
                            window.location.href = "/album.html?folder=" + eventDetail;
                            break;
                        case "CMX":
                            showModelInfoDialog(eventDetail, calledFrom, 'Images/redballon.png');
                            //reportThenPerformEvent("CMX", folderId, folderName);
                            break;
                        case "BAC":  // Babes Archive Clicked
                            //window.open("/album.html?folder=" + pageId); 
                            window.location.href = "/album.html?folder=3";
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
                                case "transitions":
                                    window.location.href = 'transitions.html';
                                    break;
                                case "ranker":
                                    window.location.href = 'ranker.html';
                                    break;
                                case "dirTreeBoobs": //  Category List
                                    showCatListDialog(2);
                                    break;
                                case "explain": // Let me Explain
                                    showCustomMessage(38);
                                    break;
                                case "centerfolds":  // Playboy Centerfolds
                                    window.location.href = '/album.html?folder=1132';
                                    break;
                                case "video":  // Video
                                    window.location.href = 'video.html';
                                    break;
                                case "blog":
                                    window.location.href = '/Blog.html';
                                    break;
                                default:
                                    alert("uncaught switch option Left Menu Click: " + eventDetail);
                                    break;
                            }
                            break;

                        case "FLC":  //  footer link clicked
                            //if (document.domain === 'localhost') alert("eventCode: " + eventCode + " pageId: " + pageId);
                            switch (eventDetail) {
                                case "about us": showCustomMessage(38); break;
                                case "dir tree": showCatListDialog(2); break;
                                case "porn dir tree": showCatListDialog(242); break;                                    
                                case "playmate dir tree": showCatListDialog(472); break;
                                case "porn": window.location.href = '/index.html?subdomain=porn'; break;
                                case "blog": window.location.href = '/Blog.html'; break;
                                case "ranker": window.location.href = "/Ranker.html"; break;
                                case "rejects": window.location.href = "/album.html?folder=1132"; break;
                                case "centerfolds": window.location.href = "/album.html?folder=1132"; break;
                                case "archive": window.location.href = "/album.html?folder=3"; break;
                                case "videos": window.location.href = 'video.html'; break;
                                case "mailme": window.location.href = 'mailto:curtishrhodes@hotmail.com'; break;
                                case "freedback": showFeedbackDialog(); break;
                                default: alert("eventDetail: " + eventDetail); break;
                            }
                            break;
                        default:
                            alert("eventCode " + eventCode + "  not handled in reportThenPerformEvent");
                    }
                }
                else {
                    sendEmailToYourself("LogEventActivity fail", "Called from PageId: " + calledFrom +
                        "<br/>EventCode: " + eventCode +
                        "<br/>eventDetail: " + eventDetail +
                        "<br/>VisitorId: " + visitorId +
                        "<br/>Message: " + logEventActivitySuccess.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                //               alert("xhr error in common.js logActivity : " + errorMessage);
                if (!checkFor404(errorMessage, "reportThenPerformEvent")) {
                    var ipAddr = getCookieValue("IpAddress");
                    if (ipAddr === "68.203.90.183") {
                        alert("xhr error in reportThenPerformEvent\n url:/api/ChangeLog/LogEventActivity?eventCode=" + eventCode +
                            "\ncalled from pageId=" + calledFrom + "\nIp: " + ipAddr + "\nMessage: " + errorMessage);
                    }
                    else {
                        sendEmailToYourself("xhr error in reportThenPerformEvent", "url:/api/ChangeLog/LogEventActivity?eventCode=" + eventCode +
                            "<br/>called from pageId=" + calledFrom + "<br/>nIp:" + ipAddr + "<br/>Message: " + errorMessage);
                    }
                }
            }
        });
    } catch (e) {
        sendEmailToYourself("Catch Error in reportThenPerformEvent()", e);
        if (document.domain === 'localhost') {
            alert("reportThenPerformEvent Catch Error: " + e);
        }        
    }
}

