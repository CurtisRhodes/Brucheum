
var feedbackPageId;
function showFeedbackDialog(pageId) {
    feedbackPageId = pageId;
    //alert("showFeedbackDialog");

    //$('#imagePageLoadingGif').show();
    $('#draggableDialogContents').html(feedbackDialogHtml());
    $('#oggleDialogTitle').html("feedback");
    $('#feedbackDialogSummerNoteTextArea').summernote({
        height: 300,
        toolbar: [['codeview']]
    });
    $('#draggableDialog').css("top", $('.oggleHeader').height() + 20);
    $("#draggableDialog").fadeIn();

    getUserEmail();
}

function saveFeedback() {
    $('.validationError').hide();
    var hasValidtionErrors = false;
    if ($('input[type=radio]:checked').length === 0) {
        $('#errFeedbackRadioButtons').html("Please select a comment type").show();
        hasValidtionErrors = true;
    }
    if ($('#txtFeedbackEmail').val().length === 0) {
        $('#errFeedbackEmail').html("email required").show();
        hasValidtionErrors = true;
    }
    else {
        if (!isValidEmail($('#txtFeedbackEmail').val())) {
            $('#errFeedbackEmail').html("invalid email").show();
            hasValidtionErrors = true;
        }
    }

    if ($('#feedbackDialogSummerNoteTextArea').summernote('code').length < 20) {
        $('#errFeedbackText').html("too short").show();
        hasValidtionErrors = true;
    }
    if (hasValidtionErrors)
        return;

    var feedBackModel = {
        VisitorId: getCookieValue("VisitorId"),
        PageId: feedbackPageId,
        FeedBackComment: $('#feedbackDialogSummerNoteTextArea').summernote('code'),
        FeedBackType: $('#feedbackDialog input[type=\'radio\']:checked').val(),
        Email: $('#txtFeedbackEmail').val()
    };
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Common/LogFeedback",
        data: feedBackModel,
        success: function (success) {
            if (success === "ok") {
                logEventActivity({
                    VisitorId: feedBackModel.VisitorId,
                    EventCode: "FBS",
                    EventDetail: "Hooraaaayyy !!",
                    PageId: feedbackPageId,
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("FeedBack", "ip: " + getCookieValue("IpAddress") + "<br/>"
                //    + $('#feedbackDialogSummerNoteTextArea').summernote('code'));
                //console.log("is email working?");
                $("#draggableDialog").fadeOut();
                showMyAlert("Thank you for your feedback");
            }
            else {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "DBL",
                    Severity: 3,
                    ErrorMessage: success,
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                if (document.domain === 'localhost') alert("EditFolderCategory: " + success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "saveFeedbackDialog")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 1,
                    ErrorMessage: errorMessage,
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("XHR ERROR in FolderCategory.js saveCategoryDialogText",
                //    "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" +
                //    $('#catDlgSummerNoteTextArea').summernote('code') + " Message: " + errorMessage);
            }
        }
    });
}

function feedbackDialogHtml() {
    return "<div id='feedbackDialog' class='oggleDialog' >\n" +
        "   <div id='errFeedbackRadioButtons' class='validationError'></div>\n"+
        "    <div class='feedbackRadioButtons'>\n" +
        "       <input type='radio' name='feedbackRadio' value='complement'><span> complement</span>\n" +
        "       <input type='radio' name='feedbackRadio' value='suggestion'><span> suggestion</span>\n" +
        "       <input type='radio' name='feedbackRadio' value='report error'><span> report error</span>\n" +
        "   </div>\n" +
        "   <div id='errFeedbackText' class='validationError'></div>\n" +
        "   <div id='feedbackDialogSummerNoteTextArea'></div>\n" +
        "   <div style='display:table; width: 100%'>\n"+
        "       <div style='display:table-cell; width:65px; text-align:right;'>email: </div>" +
        "       <div id='errFeedbackEmail' class='validationError'></div>\n" +
        "       <input id='txtFeedbackEmail'  style='display:table-cell; width:100%'/>\n" +
        "   </div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnfeedbackDialogSave' class='roundendButton' onclick='saveFeedback()'>Send</div>\n" +
        "       <div id='btnfeedbackDialogCancel' class='roundendButton' onclick='dragableDialogClose()'>Cancel</div>\n" +
        "   </div>\n" +
        "</div>\n";
}

function getUserEmail() {
    
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Login/GetUserInfo?visitorId=" + getCookieValue("VisitorId"),
        success: function (registeredUser) {
            if (!isNullorUndefined(registeredUser)) {
                //alert("registeredUser.Email: " + registeredUser.Email);
                $('#txtFeedbackEmail').val(registeredUser.Email);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (document.domain === 'localhost') {

                alert("XHR ERROR IN getUserEmail" + errorMessage);

                if (!checkFor404(errorMessage, "getUserEmail")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 3,
                        ErrorMessage: "XHR ERROR IN getUserEmail: " + errorMessage,
                        CalledFrom: "getUserEmail"
                    });
                    //sendEmailToYourself("XHR ERROR IN updateTrackback", errorMessage);
                }
            }
        }
    });
}