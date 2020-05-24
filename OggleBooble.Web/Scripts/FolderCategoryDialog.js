var categoryFolderId = "";

function showCategoryDialog(folderId) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog
 
    try {
        $('#draggableDialogContents').html(folderInfoPopUpHtml());

        var winH = $(window).height();
        var dlgH = $('#customMessage').height();
        $('#customMessageContainer').css("top", (winH - dlgH) / 2);

        if (typeof pause === 'function')
            pause();




        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/FolderDetail/GetFolderInfo?folderId=" + folderId,
            success: function (folderDetails) {
                if (folderDetails.Success === "ok") {
                    categoryFolderId = folderId;

                    $('#draggableDialogTitle').html(folderDetails.FolderName);
                    $("#draggableDialog").fadeIn();
                    console.log("calling isInRole from showCategoryDialog");
                    if (isInRole("Oggle admin")) {
                        $('#catDlgSummerNoteTextArea').summernote({
                            height: 300,
                            toolbar: [['codeview']]
                        });
                        $('#catDlgSummerNoteContainer').show();
                    }
                    else {
                        $('#btnCatDlgEdit').hide();
                        $('#catDlgSummerNoteTextArea').summernote({
                            height: 500,
                            toolbar: '[]'
                        });
                        $('#catDlgSummerNoteTextArea').summernote('disable');
                        $('#btnCatDlgMeta').hide();
                    }

                    if (categoryComment.CommentText === "") {
                        if (document.domain === 'localhost') alert("categoryComment.CommentText  EMPTY: " + folderDetails.CommentText);
                    }
                    $('#catDlgSummerNoteTextArea').summernote('code', categoryComment.CommentText);
                }
                else {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "JQE",
                        Severity: 2,
                        ErrorMessage: folderDetails.Success,
                        CalledFrom: "showCategoryDialog"
                    });

                    //if (categoryComment.Success !== "not found")
                    //sendEmailToYourself("jquery fail in FolderCategory.js showCategoryDialog", "get Category Comment: " + folderDetails.Success);
                    if (document.domain === 'localhost')
                        alert("FolderCategoryDialog: " + categoryComment.Success);
                    //alert("get Category Comment: " + categoryComment.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "showCategoryDialog")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "showCategoryDialog"
                    });
                }
            }
        });
    }
    catch (e) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "ERR",
            Severity: 12,
            ErrorMessage: "get NudeModelInfo catch: " + e,
            CalledFrom: "showCategoryDialog"
        });
        //sendEmailToYourself("javascript catch in FolderCategoryDialog.js showCategoryDialog", "get NudeModelInfo catch: " + e);
        if (document.domain === 'localhost') alert("FolderCategoryDialog catch: " + e);
    }
}

function folderInfoPopUpHtml() {
    return "<div id='folderCategoryDialog' class='oggleDialogWindow' title='' onmouseleave='considerClosingCategoryDialog()'>\n" +
        "    <div id='catDlgSummerNoteTextArea'></div>\n" +
        "    <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "    <div id='btnCatDlgMeta' class='folderCategoryDialogButton displayHidden' onclick='addMetaTags()'>add meta tags</div>\n" +
        "</div>\n";
}


function editFolderDialog() {
    if ($('#btnCatDlgEdit').html() === "Save") {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" + $('#catDlgSummerNoteTextArea').summernote('code'),
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", "category description updated");
                    $('#btnCatDlgEdit').html("Edit");
                    $('#btnCatDlgMeta').hide();
                }
                else {
                    sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                    if (document.domain === 'localhost')
                        alert("EditFolderCategory: " + success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "saveCategoryDialogText")) {
                    sendEmailToYourself("XHR ERROR in FolderCategory.js saveCategoryDialogText",
                        "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" +
                        $('#catDlgSummerNoteTextArea').summernote('code') + " Message: " + errorMessage);
                }
            }
        });
    }
    if ($('#btnCatDlgEdit').html() === "Edit") {
        $('#btnCatDlgEdit').html("Save");
        $('#btnCatDlgMeta').show();
    }
}

function addMetaTags() {
    openMetaTagDialog(categoryFolderId);
}

function considerClosingCategoryDialog() {
    if (!isInRole("Oggle admin") || $('#btnCatDlgEdit').html() === "Edit") {
        $('#folderCategoryDialog').dialog("close");
    }
}

