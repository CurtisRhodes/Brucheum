
///////////////  Feedback  ////////////////////////////////////////////////////
{
    function showFeedbackDialog(folderId) {
        $('#centeredDialogContents').html(feedbackDialogHtml(folderId));
        $('#centeredDialogTitle').html("feedback");
        $('#smnFeedback').summernote({
            height: 200,
            focus: true
            // toolbar: [['codeview']]
        });
        $('.note-editable').trigger('focus');
        $('.note-editable').trigger('focus');
        $('.note-editable').click(function () { $(this).focus(); });


        //$("#smnFeedback").summernote('codeview.toggle');
        //setTimeout(function () { $("#smnFeedback").summernote('codeview.toggle'); }, 800);

        $('#centeredDialogContainer').css("top", $('.oggleHeader').height() + 120);
        $('#centeredDialogContainer').draggable().fadeIn();
        getUserEmail();
        $('.note-editable').focus();
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

        //if ($('#smnFeedback').summernote('code').length < 20) {
        //    $('#errFeedbackText').html("too short").show();
        //    return false;
        //}
        return true;
    }
    function saveFeedback(folderId) {
        try {
            if (validateFeedback()) {
                //alert("feedbackType: " + $('#feedbackDialog input[type=\'radio\']:checked').val());
                let feedbackType = $('#feedbackDialog input[type=\'radio\']:checked').val();
                let feedbackMessage = $('#smnFeedback').summernote('code');
                $.ajax({
                    type: "POST",
                    url: settingsArray.ApiServer + "api/Common/LogFeedback",
                    data: {
                        VisitorId: getCookieValue("VisitorId"),
                        FolderId: folderId,
                        FeedBackComment: feedbackMessage,
                        FeedBackType: feedbackType, // $('input[name="feedbackRadio"]:checked').val()
                        FeedBackEmail: $('#txtFeedbackEmail').val()  
                    },
                    success: function (success) {
                        if (success === "ok") {
                            logEvent("FBS", folderId, "Hooraaaayyy !!");

                            //sendEmail("CurtishRhodes@hotmail.com", "Feedback@Ogglebooble.com", "Wow!! FeedBack", "feedbackType: " + feedbackType + "message:" + feedbackMessage);
                            //sendEmail("CurtishRhodes@hotmail.com", "FolderComment@Ogglebooble.com", "Wow!! FolderComment", "message:" + folderCommentMessage);
                            if (document.domain !== "localhost")
                                sendEmail("CurtishRhodes@hotmail.com", "Feedback@Ogglebooble.com", "Feedback !!!", +
                                    "feedbackBackType: " + feedbackType + "<br/>" +
                                    "feedbackMessage: " + feedbackMessage + "<br/>" +
                                    "visitor: " + getCookieValue("VisitorId") + "<br/>" +
                                    "folderId: " + folderId);
                            else
                                alert("sendEmail(CurtishRhodes@hotmail.com, Feedback@Ogglebooble.com, Feedback !!!" +
                                    "\nfeedBackType: " + feedbackType +
                                    "\nfeedbackMessage: " + feedbackMessage + "\nfolderId: " + folderId);

                            //console.log("is email working?");
                            $("#centeredDialogContainer").fadeOut();
                            showMyAlert("Thank you for your " + feedbackType);
                        }
                        else {
                            logError("AJX", folderId, success, "log feedback");
                        }
                    },
                    error: function (jqXHR) {
                        if (!checkFor404("saveFeedback")) {
                            logError("XHR", folderId, getXHRErrorDetails(jqXHR), "saveFeedback");
                        }
                    }
                });
            }
        } catch (e) {
            logError("CAT", folderId, e, "saveFeedback");
        }
    }

    function feedbackDialogHtml(folderId) {
        return "<div id='feedbackDialog' class='roundedDialog' >\n" +
            "   <div id='errFeedbackRadioButtons' class='validationError'></div>\n" +
            "    <div class='feedbackRadioButtons'>\n" +
            "       <input type='radio' name='feedbackRadio' checked value='complement'><span> complement</span>\n" +
            "       <input type='radio' name='feedbackRadio' value='suggestion'><span> suggestion</span>\n" +
            "       <input type='radio' name='feedbackRadio' value='report error'><span> report error</span>\n" +
            "<div>folderId: " + folderId + "</div>\n" +
            "   </div>\n" +
            "   <div id='errFeedbackText' class='validationError'></div>\n" +
            "    <div class='modelInfoCommentArea'>\n" +
            "       <textarea id='smnFeedback'></textarea>\n" +
            "    </div>\n" +
            "   <div style='display:table; width: 100%'>\n" +
            "       <div style='display:table-cell; width:65px; text-align:right;'>email: </div>" +
            "       <div id='errFeedbackEmail' class='validationError'></div>\n" +
            "       <input id='txtFeedbackEmail' style='roundedInput; width:100%'/>\n" +
            "   </div>\n" +
            "   <div class='folderDialogFooter'>\n" +
            "       <div id='btnfeedbackDialogSave' class='roundendButton' onclick='saveFeedback(" + folderId + ")'>Send</div>\n" +
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
                        logError("AJX", folderId, registeredUser.Success, "feedback/getUserEmail");
                },
                error: function (jqXHR) {
                    if (!checkFor404("getUserEmail")) {
                        logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getUserEmail");
                    }
                }
            });
        } catch (e) {
            logError("CAT", folderId, e, "getUserEmail");
        }
    }
}


















/////////////     Folder Comment Dialog  //////////////////////////////////////

function showFolderCommentDialog(folderId,folderName) {
    // <div id = "folderCommentContainer"></div >
    $('#centeredDialogContents').html(folderCommentDialogHtml(folderId));
    $('#centeredDialogTitle').html("folder comment: " + folderName);
    $('#smnFolderComment').summernote({
        height: 100,
        toolbar: [['codeview']]
    });
    $("#smnFolderComment").summernote('codeview.toggle');
    setTimeout(function () { $("#smnFolderComment").summernote('codeview.toggle'); }, 500);

    $('#centeredDialogContainer').css("top",135);
    $('#centeredDialogContainer').css("left", -700);
    $('#centeredDialogContainer').draggable().fadeIn();
}

function folderCommentDialogHtml(folderId) {
    return "<div id='folderCommentDialog' class='roundedDialog' >\n" +
        "    <div class='folderCommentCommentArea'>\n" +
        "       <textarea id='smnFolderComment'></textarea>\n" +
        "    </div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnfolderCommentSave' class='roundendButton' onclick='saveFolderComment(" + folderId + ")'>Post</div>\n" +
        "       <div class='roundendButton' onclick='dragableDialogClose()'>Cancel</div>\n" +
        "   </div>\n" +
        "   <div Id='folderCommentsContainer'>\n" +
        "   </div>\n" +
        "</div>\n";
}

function saveFolderComment(folderId) {
    //[Route("api/FolderComment/AddFolderComment")]
    //public string AddEditTrackBackLink(FolderCommentModel folderCommentModel)
    let folderCommentMessage = $('#smnFolderComment').summernote('code');
    try {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/FolderComment/AddFolderComment",
            data: {
                VisitorId: getCookieValue("VisitorId"),
                FolderId: folderId,
            },
            success: function (success) {
                if (success === "ok") {
                    logEvent("FBS", folderId, "folderCommentMessage !!");

                    //sendEmail("CurtishRhodes@hotmail.com", "FolderComment@Ogglebooble.com", "Wow!! FolderComment", "message:" + folderCommentMessage);
                    if (document.domain !== "localhost")
                        sendEmail("CurtishRhodes@hotmail.com", "FolderComment@Ogglebooble.com", "Folder Comment !!!", +
                            "folderCommentMessage: " + folderCommentMessage + "<br/>" +
                            "visitor: " + getCookieValue("VisitorId") + "<br/>" +
                            "folderId: " + folderId);
                    else
                        alert("sendEmail(CurtishRhodes@hotmail.com, FolderComment@Ogglebooble.com,FolderComment !!!\n" +
                            "folderCommentMessage: " + folderCommentMessage + "\nfolderId: " + folderId);

                    $("#centeredDialogContainer").fadeOut();
                    showMyAlert("Thank you for your comment");
                }
                else {
                    logError("AJX", folderId, success, "saveFolderComment");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("saveFolderComment")) {
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "saveFolderComment");
                }
            }
        });
    } catch (e) {
        logError("CAT", folderId, e, "saveFolderComment");
    }
}
