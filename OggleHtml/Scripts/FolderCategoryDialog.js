var categoryFolderId = "";

function showCategoryDialog(folderId) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog

    $('#folderCategoryDialog').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'center', at: 'top' },
        width: "560"
    });

    $('#folderCategoryDialog').dialog('open');
    try {
        $('#btnCatDlgMeta').hide();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/CategoryComment/Get?folderId=" + folderId,
            success: function (categoryComment) {
                if (categoryComment.Success === "ok") {
                    categoryFolderId = folderId;
                    $('#folderCategoryDialog').dialog('option', 'title', categoryComment.FolderName);
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
                    }

                    if (categoryComment.CommentText === "") {
                        if (document.domain === 'localhost') alert("categoryComment.CommentText  EMPTY: " + categoryComment.CommentText);
                    }
                    $('#catDlgSummerNoteTextArea').summernote('code', categoryComment.CommentText);
                }
                else {
                    //if (categoryComment.Success !== "not found")
                    sendEmailToYourself("jquery fail in FolderCategory.js showCategoryDialog", "get Category Comment: " + categoryComment.Success);
                    if (document.domain === 'localhost')
                        alert("FolderCategoryDialog: " + categoryComment.Success);
                    //alert("get Category Comment: " + categoryComment.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "showCategoryDialog")) {
                    sendEmailToYourself("XHR ERROR in FolderCategory.js showCategoryDialog", "api/CategoryComment/Get?folderId=" + folderId + " Message: " + errorMessage);
                }
            }
        });
    }
    catch (e) {
        sendEmailToYourself("javascript catch in FolderCategoryDialog.js showCategoryDialog", "get NudeModelInfo catch: " + e);
        if (document.domain === 'localhost')
            alert("FolderCategoryDialog catch: " + e);
    }
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

function slowlyShowFolderCategoryDialog(folderId) {
    setTimeout(function () {
        if (forgetShowingCatDialog === false) {
            if (typeof pause === 'function')
                pause();
            folderCategoryDialogIsOpen = true;
            showCategoryDialog(folderId);
        }
    }, 1100);
    $('#folderCategoryDialog').on('dialogclose', function (event) {
        folderCategoryDialogIsOpen = false;
        if (typeof resume === 'function')
            resume();
    });
}