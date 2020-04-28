var freePageHitsAllowed = 500;
var freeImageHitsAllowed = 2500;

function logImageHit(visitorId, link, pageId, isInitialHit) {
    if (isNullorUndefined(pageId)) {        
        logError({
            VisitorId: visitorId,
            ActivityCode: "CDE",
            Severity: 2,
            ErrorMessage: "TROUBLE in logImageHit. PageId came in Null or Undefined",
            CalledFrom: "HitCounter.js logImageHit"
        });
        //sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "Set to 1 or  something");
        return;
    }
    if (isNullorUndefined(visitorId)) {

        visitorId = getCookieValue("VisitorId");

        if (isNullorUndefined(visitorId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "XV1",
                Severity: 2,
                ErrorMessage: "VisitorId undefined. Calling addVisitor",
                CalledFrom: "logImageHit"
            });
            addVisitor(pageId, "logImageHit");
            visitorId = "logImage fail";
        }
    }

    var linkId = link.substr(link.lastIndexOf("_") + 1, 36);
    var logImageHItData = {
        VisitorId: visitorId,
        PageId: pageId,
        LinkId: linkId,
        IsInitialHit: isInitialHit
    };
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/ImageHit/LogImageHit",  //?visitorId=" + visitorId + "&pageId=" + pageId + "&linkId=" + linkId,
        data: logImageHItData,
        success: function (imageHitSuccessModel) {
            //alert("imageHitSuccessModel.Success: " + imageHitSuccessModel.Success);
            if (imageHitSuccessModel.Success === "ok") {
                userPageHits = imageHitSuccessModel.UserPageHits;
                userImageHits = imageHitSuccessModel.UserImageHits;
                //checkForHitLimit("images", pageId, userPageHits, userImageHits);
            }
            else {

                if (document.domain === 'localhost') alert("LogImageHit: " + imageHitSuccessModel.Success);

                if (imageHitSuccessModel.Success.Contains("Duplicate entry")) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "CDE",
                        Severity: 2,
                        ErrorMessage: "logImageHit Duplicate entry",
                        CalledFrom: "HitCounter.js logImageHit"
                    });
                    //sendEmailToYourself("logImageHit Duplicate entry", "utcDateTime: " + imageHitSuccessModel.HitDateTime);
                    if (document.domain === 'localhost')
                        alert("logImageHit Duplicate entry\nutcDateTime: " + imageHitSuccessModel.HitDateTime);
                }
                else {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "CDE",
                        Severity: 2,
                        ErrorMessage: "Some other Ajax fail in Hitcounter.js logImageHit"+
                            " utc: " + imageHitSuccessModel.HitDateTime +
                            " isInitialHit: " + isInitialHit +
                            " PageId: " + pageId +
                            " linkId: " + linkId +
                            //" ipAddr: " + ipAddr +
                            " Message: " + imageHitSuccessModel.Success,
                        CalledFrom: "HitCounter.js logImageHit"
                    });
                }
                //else {
                //sendEmailToYourself("DOUBLE ajax fail in Hitcounter.js logImageHit", "PageId: " + pageId + " linkId: " + linkId +
                //        "\n ipAddr: " + getCookieValue("IpAddress") + " VisitorId: " + visitorId + " isInitialHit: " + isInitialHit + " Message: " + imageHitSuccessModel.Success);
                //}
                //alert("Ajax fail in Hitcounter.js logImageHit\nPageId: " + pageId + "\n linkId: " + linkId +
                //    "\n ipAddr: " + getCookieValue("IpAddress") + "\n VisitorId: " + visitorId + "\n isInitialHit: " + isInitialHit + " Message: " + imageHitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logImageHit")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "HitCounter.js logImageHit"
                });
                //if (errorMessage.includes("Requested page not found")) {
                //sendEmailToYourself("XHR ERROR Requested page not found in logImageHit",
                //        "api/ImageHit/LogImageHit?visitorId=" + visitorId +
                //        ",<br/>pageId: " + pageId +
                //        "<br/>isInitialHit: " + isInitialHit +
                //        ",<br/> linkId=" + link +
                //        ",<br/>Message: " + errorMessage);
                //} else {
                //    if (!checkFor404(errorMessage, "logImageHit")) {
                //        sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logImageHit",
                //            "api/ImageHit/LogImageHit?visitorId=" + visitorId +
                //            ",<br/>pageId: " + pageId +
                //            "<br/>isInitialHit: " + isInitialHit +
                //            ",<br/> linkId=" + link +
                //            ",<br/>Message: " + errorMessage);
                //    }
                //}
            }
        }
    });
}

//$.getJSON("https://ipinfo.io?token=ac5da086206dc4", function (data) {
//    if (isNullorUndefined(data.ip)) {
//        logError({
//            VisitorId: getCookieValue("VisitorId"),
//            ActivityCode: "CDE",
//            Severity: 1,
//            ErrorMessage: "IpInfo came back with no IpAddress. Ssetting IpAddress to '68.203.90.183'  Returning",
//            CalledFrom: "HitCounter.js"
//        });
//        //sendEmailToYourself("IpInfo came back with no IpAddress.", "setting IpAddress to '68.203.90.183'  Returning");
//        setCookieValue("IpAddress", "000.000");
//        return;
//    }
//});
//$("#info").html("City: " + data.city + " ,County: " + data.country + " ,IP: " + data.ip + " ,Location: " + data.loc + " ,Organisation: "
//+ data.org + " ,Postal Code: " + data.postal + " ,Region: " + data.region + "")

function logPageHit(pageId, calledFrom) {
    //alert("logPageHit(" + pageId );  // + "," + visitorId + "," + calledFrom + ")");
    if (isNullorUndefined(pageId)) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "AAA",
            Severity: 1,
            ErrorMessage: "PageId undefined in LogPageHit.",
            CalledFrom: "HitCounter.js logPageHit"
        });
        //sendEmailToYourself("PageId undefined in LogPageHit.", "visitorId: " + visitorId);
        return;
    }

    var visitorId = getCookieValue("VisitorId");

    if (isNullorUndefined(visitorId)) {
        addVisitor(pageId,"logPageHit");
    }
    else {
        tryLogPageHit(pageId, visitorId);
    }
    // LOGGING PROPER PAGE HIT
    // MOVE PAGE HITS TO FOOTER SOMEDAY
}

function addVisitor(pageId, calledFrom) {
    //alert("debug 1");
    try {
        visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId))
        {
            $.ajax({
                type: "GET",
                url: "http://api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
                success: function (ipStackResponse) {
                    $.ajax({
                        type: "POST",
                        url: settingsArray.ApiServer + "api/VisitorInfo/AddVisitor",
                        data: {
                            IpAddress: ipStackResponse.ip,
                            PageId: pageId,
                            CalledFrom: calledFrom,
                            City: ipStackResponse.city,
                            Country: ipStackResponse.country_code,
                            Region: ipStackResponse.region_code,
                            GeoCode: "g333" // ipStackResponse.location.geoname_id
                            //Referrer: getVisitorInfo().referrer,
                            //Browser: getVisitorInfo().browserName,
                            //Latitude: getVisitorInfo().latitude,
                            //Longitude: getVisitorInfo().longitude,
                            //ScreenWidth: getVisitorInfo().sizeScreenW
                        },
                        success: function (addVisitorSuccess) {
                            if (addVisitorSuccess.Success === "ok") {
                                setCookieValue("VisitorId", addVisitorSuccess.VisitorId);
                                logEventActivity({
                                    VisitorId: addVisitorSuccess.VisitorId,
                                    EventCode: "NEW",
                                    EventDetail: "NEW VISITOR added: " + ipStackResponse.ip,
                                    CalledFrom: calledFrom
                                });

                                //if (calledFrom === "static") {
                                //    logEventActivity({
                                //        VisitorId: addVisitorSuccess.VisitorId,
                                //        EventCode: "XLC",
                                //        EventDetail: addVisitorSuccess.PageName,
                                //        CalledFrom: "addVisitor"
                                //    });
                                //}
                                if (calledFrom === "dashboard") {

                                    $('#dataifyInfo').show().html("test ok");
                                    setTimeout(function () { $('#dataifyInfo').show(); }, 2000);

                                }
                                tryLogPageHit(pageId, addVisitorSuccess.VisitorId);
                            }
                            else {
                                if (document.domain === 'localhost') {
                                    alert("addVisitor ajax Error: " + addVisitorSuccess.Success );
                                }
                                logError({
                                    VisitorId: "--",
                                    ActivityCode: "B07",
                                    Severity: 2,
                                    ErrorMessage: addVisitorSuccess.Success,
                                    CalledFrom: "ipStacTest"
                                });
                            }
                        },
                        error: function (jqXHR) {
                            var errorMessage = getXHRErrorDetails(jqXHR);
                            if (!checkFor404(errorMessage, "ipStacTest")) {
                                logError({
                                    VisitorId: visitorId,
                                    ActivityCode: "XHR",
                                    Severity: 1,
                                    ErrorMessage: errorMessage + " called from: " + calledFrom,
                                    CalledFrom: "ipStacTest"
                                });
                            }
                        }
                    });
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (document.domain === 'localhost') {
                        alert("addVisitor XHR Error: " + errorMessage);
                    }

                    if (!checkFor404(errorMessage, "logPageHit")) {
                        logError({
                            VisitorId: visitorId,
                            ActivityCode: "XHR",
                            Severity: 1,
                            ErrorMessage: errorMessage + " called from: " + calledFrom,
                            CalledFrom: "addVisitor"
                        });
                    }
                }
            });
        }
    } catch (e) {
        if (document.domain === 'localhost') {
            alert("addVisitor Catch Error: " + e);
        }
        logError({
            VisitorId: "--",
            ActivityCode: "C07",
            Severity: 200,
            ErrorMessage: e,
            CalledFrom: "ipStacTest"
        });
    }
}

function tryLogPageHit(pageId, visitorId) {
    //alert("tryLogPageHit PageId:" + pageId + ", visitorId: " + visitorId);
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/VisitorInfo/LogPageHit?visitorId=" + visitorId + "&pageId=" + pageId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                logVisit(visitorId);
               // checkForHitLimit("pages", pageId, pageHitSuccess.UserPageHits, pageHitSuccess.UserImageHits);
            }
            else {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "B01",
                    Severity: 4,
                    ErrorMessage: pageHitSuccess.Success,
                    CalledFrom: "tryLogPageHit"
                });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logPageHit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: "pageId: " + pageId + " Message: " + errorMessage,
                    CalledFrom: "HitCounter.js logPageHit"
                });
            }
        }
    });
}

function logVisit(visitorId, pageName) {
    if (isNullorUndefined(visitorId)) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "X23",
            Severity: 2,
            ErrorMessage: "VisitorId undefined",
            CalledFrom: "logVisit"
        });
        addVisitor(pageId, "logVisit");
    }

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/VisitorInfo/LogVisit?visitorId=" + visitorId,
        success: function (logVisitSuccessModel) {
            if (logVisitSuccessModel.Success === "ok") {
                if (logVisitSuccessModel.VisitAdded) {
                    if (logVisitSuccessModel.WelcomeMessage !== "ok") {
                        $('#headerMessage').html(logVisitSuccessModel.WelcomeMessage);
                    }
                    //if (verbosity > 5)
                    logEventActivity({
                        VisitorId: visitorId,
                        EventCode: "VIS",
                        EventDetail: "Page: " + pageName,
                        CalledFrom: "HitCounter.js logVisit"
                    });
                    //sendEmailToYourself("Visit Added ", "visitorId: " + visitorId + "<br/>Initial Page: ");
                    //if (document.domain === 'localhost') alert("Visit Added ", "visitorId: " + visitorId);
                }
            }
            else {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "ERR",
                    Severity: 2,
                    ErrorMessage: "PageId: " + pageId + " Message: " + logVisitSuccessModel.Success,
                    CalledFrom: "HitCounter.js logVisit"
                });
                //sendEmailToYourself("Ajax Error in logVisit", "PageId: " + pageId + "<br/>Message: " + logVisitSuccessModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "logVisit")) {
                logError({
                    VisitorId: visitorId,
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "HitCounter.js logVisit"
                });
                //sendEmailToYourself("XHR ERROR IN HITCOUNTER.JS logVisit",
                //    "api/HitCounter/LogVisit?visitorId=" + visitorId +
                //    "<br/>" + errorMessage);
            }
        }
    });
}

function letemPorn(response, pornType) {
    // if (document.domain === 'localhost') alert("letemPorn: " + pornType);
    if (response === "ok") {
        //  setUserPornStatus(pornType);
        //<div onclick="goToPorn()">Nasty Porn</div>
        //window.location.href = '/index.html?subdomain=porn';
        if (isNullorUndefined(pornType)) {
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "PRN",
                Severity: 2,
                ErrorMessage: "isNullorUndefined(pornType)",
                CalledFrom: "HitCounter.js letemPorn"
            });
            //sendEmailToYourself("letemPorn problem", "pornType missing");
            pornType = "UNK";
        }
        reportThenPerformEvent("PRN", 136, pornType);
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
    }
}

function rtpe(eventCode, calledFrom, eventDetail) {
    reportThenPerformEvent(eventCode, calledFrom, eventDetail);
}

function reportThenPerformEvent(eventCode, calledFrom, eventDetail) {
    //alert("reportThenPerformEvent(eventCode: " + eventCode + ", calledFrom: " + calledFrom + ", eventDetail: " + eventDetail);
    try {
        var visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            var pageId = 2282;
            if (Number.isInteger(eventDetail))
                pageId = eventDetail;
            addVisitor(pageId, "reportThenPerformEvent");

            //visitorId = create_UUID();
            //setCookieValue("VisitorId", visitorId);
            logError({
                VisitorId: visitorId,
                ActivityCode: "X22",
                Severity: 2,
                ErrorMessage: "unknown visitorId",
                CalledFrom: "reportThenPerformEvent/" + calledFrom
            });
            visitorId = "gloria";
        }


        logEventActivity({
            VisitorId: visitorId,
            EventCode: eventCode,
            EventDetail: eventDetail,
            CalledFrom: calledFrom
        });
        performEvent(eventCode, calledFrom, eventDetail);

    } catch (e) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "CA2",
            Severity: 2,
            ErrorMessage: "Catch Error in reportThenPerformEvent. EventCode: " + eventCode + ". EventDetail: " + eventDetail + " Message: " + e,
            CalledFrom: calledFrom
        });
        //sendEmailToYourself("Catch Error in OggleEvenLog()", "eventCode: " + eventCode +
        //    "<br/>called from pageId: " + calledFrom +
        //    "<br/>eventDetail: " + eventDetail +
        //    "<br/>VisitorId: " + visitorId +
        //    "<br/>Message: " + e);
        if (document.domain === 'localhost') {
            alert("reportThenPerformEvent Catch Error: " + e);
        }
    }
}

function logEventActivity(logEventModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/EventLog/LogEventActivity",
        data: logEventModel,
        success: function (logEventActivitySuccess) {
            if (logEventActivitySuccess.Success !== "ok") {
                if (logEventActivitySuccess.Success.indexOf("Duplicate Entry") === 0) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "ER2",
                        Severity: 2,
                        ErrorMessage: logEventActivitySuccess.Success,
                        CalledFrom: "LogEventActivity"
                    });
                }
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "LogEventActivity")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "LogEventActivity"
                });
            }
        }
    });
}

function performEvent(eventCode, calledFrom, eventDetail) {
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
        case "CAA": // carousle context menu item clicked
            if (eventDetail === "foward") {
                //alert("reportThenPerformEvent eventCode: " + eventCode + " eventDetail: " + eventDetail);
                resume();
            }
            else {
                // pop
                imageHistory.pop();
                imageIndex = imageHistory.pop();
                if (imageIndex > 0) {
                    $('#thisCarouselImage').attr('src', carouselItemArray[imageIndex].Link);
                    $('#categoryTitle').html(carouselItemArray[imageIndex].FolderPath + ": " + carouselItemArray[imageIndex].FolderName).fadeIn(intervalSpeed);
                    resizeCarousel();
                }
                else
                    alert("imageIndex: " + imageIndex);
            }
            break;
        case "EXP":  // Explode
            window.open(eventDetail, "_blank");
            break;
        case "SRC":  // Search Performed
        case "SSB":
        case "SSC":
            window.open("/album.html?folder=" + eventDetail, "_blank");            
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
            window.location.href = "/album.html?folder=" + eventDetail;  //  open page in same window
            break;
        case "CMX":
            showModelInfoDialog(eventDetail, calledFrom, 'Images/redballon.png');
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

function checkForHitLimit(calledFrom, pageId, userPageHits, userImageHits) {
    if (!isLoggedIn()) {
        if (calledFrom === "pages") {
            if (userPageHits > freePageHitsAllowed && userPageHits % 10 === 0) {
                if (getCookieValue("IpAddress") !== "68.203.90.183") {                   //if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
                    showCustomMessage(98, true);
                    logEventActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        EventCode: "PAY",
                        EventDetail: "Page Hit Message Displayed. UserPageHits: " + userPageHits,
                        CalledFrom: pageId
                    });
                }
            }
        }
        if (calledFrom === "images") {
            if (userImageHits > freeImageHitsAllowed && userImageHits % 10 === 0) {
                logEventActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    EventCode: "PAY",
                    EventDetail: "Image Hit Limit Message Displayed userImageHits: " + userImageHits,
                    CalledFrom: pageId
                });
                showCustomMessage(97, true);
            }
        }
    }
    //    //alert("you have now visited " + userHits + " pages." +
    //    //    "\n It's time you Registered and logged in." +
    //    //    "\n you will be placed in manditory comment mode until you log in ");
    //}

    //if (userHits > userHitLimit) {
    //    alert("you have now visited " + pageHitSuccessModel.UserHits + " pages." +
    //        "\n It's time you Registered and logged in." +
    //        "\n you will be placed in manditory comment mode until you log in ");
    //}

    // login and I will let you see 1000 more images.
    // bookmark my site with link oog?domain=122; to get another 1,000 image views.
    // put a link to my site on your site or your blog or your  whatever editor publish site and I'll cut you in to the 
    // use my product
    // Request extra privdleges 
    // pay me to do some programming for you and I'll let you in on all my source code
}