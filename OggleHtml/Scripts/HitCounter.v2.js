var freePageHitsAllowed = 500;
var freeImageHitsAllowed = 2500;

function logImageHit(link, pageId, isInitialHit) {
    try {

        if (isNullorUndefined(pageId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "IM1",
                Severity: 2,
                ErrorMessage: "TROUBLE in logImageHit. PageId came in Null or Undefined",
                CalledFrom: "HitCounter.js logImageHit"
            });
            //sendEmailToYourself("TROUBLE in logImageHit. PageId came in Null or Undefined", "Set to 1 or  something");
            return;
        }
        visitorId = getCookieValue("VisitorId");
        if (!Number.isInteger(pageId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "IH2",
                Severity: 2,
                ErrorMessage: "PageId came in wrong. Link: " + link + "  pageId:  " + pageId,
                CalledFrom: "HitCounter.js logImageHit"
            });
            verifyVisitorId(visitorId, pageId);
            return;
        }

        if (isNullorUndefined(visitorId)) {
            logError({
                VisitorId: visitorId,
                ActivityCode: "IH0",
                Severity: 27,
                ErrorMessage: "logImageHit no VisitorId",
                CalledFrom: pageId
            });
            //addVisitor(pageId, "logImageHit");
            return;
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
            url: settingsArray.ApiServer + "api/ImageHit/LogImageHit",
            data: logImageHItData,
            success: function (imageHitSuccessModel) {
                if (imageHitSuccessModel.Success === "ok") {
                    userPageHits = imageHitSuccessModel.UserPageHits;
                    userImageHits = imageHitSuccessModel.UserImageHits;
                    //checkForHitLimit("images", pageId, userPageHits, userImageHits);
                }
                else {
                    //if (imageHitSuccessModel.Success.indexOf("Duplicate entry") > 0) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "IM4",
                        Severity: 2,
                        ErrorMessage: imageHitSuccessModel.Success,
                        CalledFrom: "logImageHit"
                    });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "logImageHit")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "IM5",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "HitCounter.js logImageHit"
                    });
                }
            }
        });
    } catch (e) {
        logError({
            VisitorId: visitorId,
            ActivityCode: "IM6",
            Severity: 2,
            ErrorMessage: "CATCH ERROR: " + e,
            CalledFrom: "logImageHit"
        });
     }
}

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
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/VisitorInfo/LogPageHit?visitorId=" + visitorId + "&pageId=" + pageId,
        success: function (pageHitSuccess) {
            if (pageHitSuccess.Success === "ok") {
                logVisit(visitorId, pageId);;
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

function logVisit(visitorId, pageId) {

    if (isNullorUndefined(visitorId)) {
        return;
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
                        EventDetail: "VisitAdded: " + logVisitSuccessModel.VisitAdded,
                        PageId: pageId,
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

function verifyVisitorId(visitorId, pageId, calledFrom) {
    if (!isNullorUndefined(visitorId)) {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/VisitorInfo/verifyVisitorId?visitorId=" + visitorId,
            success: function (visitorSuccessModel) {
                if (visitorSuccessModel.Success === "ok") {
                    if (!visitorSuccessModel.Exists) {
                        logError({
                            VisitorId: visitorId,
                            ActivityCode: "VV2",
                            Severity: 72,
                            ErrorMessage: "VisitorId not found in Visitor table",
                            CalledFrom: "verifyVisitorId"
                        });
                        //addVisitor(pageId, "verifyVisitorId");
                        callIpServiceFromStaticPage(pageId, calledFrom);
                    }
                }
                else {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "VV2",
                        Severity: 2,
                        ErrorMessage: visitorSuccessModel.Success,
                        CalledFrom: "verifyVisitorId"
                    });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "logImageHit")) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "VV3",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "verifyVisitorId"
                    });
                }
            }
        });
    }
}

function letemPorn(response, pornType, pageId) {
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
        reportThenPerformEvent("PRN", "xx", pornType, pageId);
    }
    else {
        $('#customMessage').hide();
        if (typeof resume === 'function') {
            resume();
        }
    }
}

function rtpe(eventCode, calledFrom, eventDetail, pageId) {
    reportThenPerformEvent(eventCode, calledFrom, eventDetail, pageId);
}

function reportThenPerformEvent(eventCode, calledFrom, eventDetail, pageId) {
    try {
        var visitorId = getCookieValue("VisitorId");
        if (isNullorUndefined(visitorId)) {
            visitorId = "00";
            //visitorId = create_UUID();
            //logError({
            //    VisitorId: visitorId,
            //    ActivityCode: "X22",
            //    Severity: 2,
            //    ErrorMessage: "unknown visitorId",
            //    CalledFrom: "reportThenPerformEvent/" + calledFrom
            //});
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
            //`ErrorMessage: "Catch Error in reportThenPerformEvent. EventCode: " + eventCode + ". EventDetail: " + eventDetail + " Message: " + e,
            ErrorMessage: e,
            CalledFrom: "reportThenPerformEvent/" + calledFrom
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
        case "CAA": // carousle context menu item clicked
            if (eventDetail === "foward") {
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

function checkForHitLimit(calledFrom, pageId, userPageHits, userImageHits) {
    if (!isLoggedIn()) {
        if (calledFrom === "pages") {
            if (userPageHits > freePageHitsAllowed && userPageHits % 10 === 0) {
                if (getCookieValue("IpAddress") !== "68.203.90.183") {                   //if (ipAddr !== "68.203.90.183" && ipAddr !== "50.62.160.105")
                    showCustomMessage(98, true);
                    logEventActivity({
                        VisitorId: getCookieValue("VisitorId"),
                        EventCode: "PAY",
                        EventDetail: "UserPageHits: " + userPageHits,
                        PageId: pageId,
                        CalledFrom: calledFrom
                    });
                }
            }
        }
        if (calledFrom === "images") {
            if (userImageHits > freeImageHitsAllowed && userImageHits % 10 === 0) {
                logEventActivity({
                    VisitorId: getCookieValue("VisitorId"),
                    EventCode: "PAY",
                    EventDetail: "Image Hits: " + userImageHits,
                    PageId: pageId,
                    CalledFrom: calledFrom
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

function logEventActivity(logEventModel) {
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/EventLog/LogEventActivity",
        data: logEventModel,
        success: function (logEventActivitySuccess) {
            if (logEventActivitySuccess.Success !== "ok") {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "ER2",
                    Severity: 2,
                    ErrorMessage: logEventActivitySuccess.Success,
                    CalledFrom: "LogEventActivity"
                });
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

function callIpServiceFromStaticPage(pageId, externalSource) {
    try {
        logEventActivity({
            VisitorId: "kmm",
            EventCode: "IPC",
            EventDetail: "externalSource" + externalSource,
            PageId: pageId,
            CalledFrom: "callIpServiceFromStaticPage"
        });
        $.ajax({
            type: "GET",
            url: "https://ipinfo.io?token=ac5da086206dc4",
            dataType: "JSON",
            //url: "http//api.ipstack.com/check?access_key=5de5cc8e1f751bc1456a6fbf1babf557",
            success: function (ipResponse) {
                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "api/VisitorInfo/AddVisitor",
                    data: {
                        IpAddress: ipResponse.ip,
                        PageId: pageId,
                        CalledFrom: externalSource,
                        City: ipResponse.city,
                        Country: ipResponse.country,
                        Region: ipResponse.region,
                        GeoCode: ipResponse.loc
                    },
                    success: function (addVisitorSuccess) {
                        if (addVisitorSuccess.Success === "ok") {
                            setCookieValue("VisitorId", addVisitorSuccess.VisitorId);

                            logEventActivity({
                                VisitorId: getCookieValue("VisitorId"),
                                EventCode: "XLC",
                                EventDetail: externalSource,
                                PageId: pageId,
                                CalledFrom: "callIpService"
                            });

                            logEventActivity({
                                VisitorId: getCookieValue("VisitorId"),
                                EventCode: "NEW",
                                EventDetail: "Ip: " + ipStackResponse.ip,
                                PageId: pageId,
                                CalledFrom: "callIpService"
                            });
                        }
                        else {
                            logError({
                                VisitorId: addVisitorSuccess.VisitorId,
                                ActivityCode: "AV1",
                                Severity: 277,
                                ErrorMessage: addVisitorSuccess.Success,
                                CalledFrom: "addVisitor/" + calledFrom
                            });
                        }
                    },
                    error: function (jqXHR) {
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "addVisitor")) {
                            logError({
                                VisitorId: visitorId,
                                ActivityCode: "AV3",
                                Severity: 1,
                                ErrorMessage: errorMessage + " called from: " + calledFrom,
                                CalledFrom: "addVisitor/" + calledFrom
                            });
                        }
                    }
                });
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "addVisitor")) {
                    logError({
                        VisitorId: visitorId,
                        ActivityCode: "IP3",
                        Severity: 133,
                        ErrorMessage: errorMessage + " called from: " + calledFrom,
                        CalledFrom: "addVisitor/" + calledFrom
                    });
                }
            }
        });
    } catch (e) {
        logError({
            VisitorId: "--",
            ActivityCode: "AV4",
            Severity: 200,
            ErrorMessage: "Catch error: " + e,
            CalledFrom: "addToVisitorTable"
        });
    }
}

