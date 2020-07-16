
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
                sendEmailToYourself("FeedBack", "ip: " + getCookieValue("IpAddress") + "<br/>"
                    + $('#feedbackDialogSummerNoteTextArea').summernote('code'));
                //console.log("is email working?");
                $("#draggableDialog").fadeOut();
                showMyAlert("Thank you for your feedback");
            }
            else {
                logError("BUG", feedbackPageId, success, "saveFeedback");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("saveFeedbackDialog")) {
                logError("XHR", feedbackPageId, getXHRErrorDetails(jqXHR), "saveFeedback");
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
            if (!checkFor404("saveFeedbackDialog")) {
                logError("XHR", feedbackPageId, getXHRErrorDetails(jqXHR), "getUserEmail");
            }
        }
    });
}

