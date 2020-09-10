
var feedbackPageId;
function showFeedbackDialog(pageId) {
    feedbackPageId = pageId;
    $('#centeredDialogContents').html(feedbackDialogHtml());
    $('#centeredDialogTitle').html("feedback");
    $('#feedbackDialogSummerNoteTextArea').summernote({
        height: 200,
        toolbar: [['codeview']]
    });
    $('#centeredDialog').css("top", $('.oggleHeader').height() + 120);
    $('#centeredDialogContainer').draggable().fadeIn();
    getUserEmail();
}

function validateFeedback() {
    $('.validationError').hide();
    if ($('input[type=radio]:checked').length === 0) {
        $('#errFeedbackRadioButtons').html("Please select a comment type").show();
        return false;
    }
    if ($('#txtFeedbackEmail').val().length === 0) {
        $('#errFeedbackEmail').html("email required").show();
        return false;
    }
        if (!isValidEmail($('#txtFeedbackEmail').val())) {
            $('#errFeedbackEmail').html("invalid email").show();
            return false;
        }

    if ($('#feedbackDialogSummerNoteTextArea').summernote('code').length < 20) {
        $('#errFeedbackText').html("too short").show();
        return false;
    }
    return true;
}

function saveFeedback() {
    try {
        if (validateFeedback()) {
            $.ajax({
                type: "POST",
                url: settingsArray.ApiServer + "api/Common/LogFeedback",
                data: {
                    VisitorId: getCookieValue("VisitorId"),
                    FolderId: feedbackPageId,
                    FeedBackComment: $('#feedbackDialogSummerNoteTextArea').summernote('code'),
                    FeedBackType: $('#feedbackDialog input[type=\'radio\']:checked').val(),
                    Email: $('#txtFeedbackEmail').val()
                },
                success: function (success) {
                    if (success === "ok") {
                        logEvent("FBS", feedbackPageId, "Hooraaaayyy !!");

                        sendEmailToYourself("FeedBack", $('#feedbackDialogSummerNoteTextArea').summernote('code'));

                        //console.log("is email working?");
                        $("#centeredDialogContainer").fadeOut();
                        showMyAlert("Thank you for your feedback");
                    }
                    else {
                        logError("AJX", feedbackPageId, success, "saveFeedback");
                    }
                },
                error: function (jqXHR) {
                    if (!checkFor404("saveFeedback")) {
                        logError("XHR", feedbackPageId, getXHRErrorDetails(jqXHR), "saveFeedback");
                    }
                }
            });
        }
    } catch (e) {
        logError("CAT", feedbackPageId, e, "saveFeedback");
    }
}

function feedbackDialogHtml() {
    return "<div id='feedbackDialog' class='roundedDialog' >\n" +
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
        "       <input id='txtFeedbackEmail' style='roundedInput; width:100%'/>\n" +
        "   </div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnfeedbackDialogSave' class='roundendButton' onclick='saveFeedback()'>Send</div>\n" +
        "       <div id='btnfeedbackDialogCancel' class='roundendButton' onclick='dragableDialogClose()'>Cancel</div>\n" +
        "   </div>\n" +
        "</div>\n";
}

function getUserEmail() {
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Login/GetUserInfo?visitorId=" + getCookieValue("VisitorId"),
            success: function (registeredUser) {
                if (registeredUser.Success == "ok") {
                    $('#txtFeedbackEmail').val(registeredUser.Email);
                }
                else
                    logError("AJX", feedbackPageId, registeredUser.Success, "feedback/getUserEmail");
            },
            error: function (jqXHR) {
                if (!checkFor404("getUserEmail")) {
                    logError("XHR", feedbackPageId, getXHRErrorDetails(jqXHR), "getUserEmail");
                }
            }
        });
    } catch (e) {
        logError("CAT", feedbackPageId, e, "getUserEmail");
    }
}

