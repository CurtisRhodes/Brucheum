
$('#feedbackBanner').click(showFeedbackDialog).fadeIn();

function showFeedbackDialog() {
    $('#feedbackDialog').dialog({
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'center', at: 'top' },
        width: "560"
    });
    $('#feedbackDialogSummerNoteTextArea').summernote({
        height: 300,
        toolbar: [['codeview']]
    });
    //$('#feedbackDialog').dialog("show");
    //alert("showFeedbackDialog2");
}
function saveFeedbackDialog(pageId) {

    //alert("radio: " + $('#feedbackDialog input[type=\'radio\']:checked').val());
    var feedBackModel = {
        VisitorId: getCookieValue("VisitorId"),
        PageId: pageId,
        FeedBackComment: $('#feedbackDialogSummerNoteTextArea').summernote('code'),
        FeedBackType: $('#feedbackDialog input[type=\'radio\']:checked').val(),
        Email: $('#txtFeedbackEmail').val()
    };

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/FeedBack",
        data: feedBackModel,
        success: function (success) {
            if (success === "ok") {
                logEventActivity({
                    VisitorId: visitorId,
                    EventCode: "FBS",
                    EventDetail: "Hooraaaayyy !!",
                    PageId: pageId,
                    CalledFrom: "OggleHeader saveFeedbackDialog"
                });
                //sendEmailToYourself("FeedBack", "ip: " + getCookieValue("IpAddress") + "<br/>"
                //    + $('#feedbackDialogSummerNoteTextArea').summernote('code'));
                //console.log("is email working?");
                $('#feedbackDialog').dialog("close");
                alert("Thank you for your feedback");
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
                //if (document.domain === 'localhost')
                //    alert("EditFolderCategory: " + success);
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
function closeFeedbackDialog() {
    $("#feedbackDialog").dialog('close');
}
