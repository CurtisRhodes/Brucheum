﻿var categoryFolderId = "";

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
        width: 500
    });

    if (isInRole("not logged in")) {
        $('#btnCatDlgMeta').hide();
        $('#catDlgSummerNoteContainer').hide();
        $('#btnCatDlgEdit').hide();
        $('#catDlgReadOnlyTextArea').show();
    }
    else {
        $('#btnCatDlgEdit').hide();
        $('#catDlgReadOnlyTextArea').hide();
        $("#btnCatDlgEdit").show().html("Edit");
        $('#catDlgSummerNoteContainer').show();
        $('#catDlgSummerNoteTextArea').summernote({
            height: 300,
            width: 500,
            codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
            toolbar: [
                ['codeview']
                //['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
            ]
        });
    }
    $('#folderCategoryDialog').dialog('open');
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/CategoryComment/Get?folderId=" + folderId,
            success: function (categoryComment) {
                if (categoryComment.Success === "ok") {
                    categoryFolderId = folderId;
                    //alert("categoryComment.CommentText: " + categoryComment.CommentText);
                    //$('#catDlgReadOnlyTextArea').html('');
                    $('#catDlgReadOnlyTextArea').html(categoryComment.CommentText);
                    $('#folderCategoryDialog').dialog('option', 'title', categoryComment.FolderName);
                    //$('#folderCategoryDialog').show();
                    //$('#folderCategoryDialog').dialog("open");
                }
                else {
                    if (categoryComment.Success !== "not found")
                        sendEmailToYourself("jquery fail in FolderCategory.js showCategoryDialog", "get Category Comment: " + categoryComment.Success);
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
        alert("FolderCategoryDialog catch: " + e);
    }
}

function toggleEditCatDialog() {
    if ($("#btnCatDlgEdit").html() === "Edit") {

        $("#btnCatDlgEdit").html("Save");
        $('#btnCatDlgMeta').show();
        $('#catDlgReadOnlyTextArea').hide();
        $('#catDlgSummerNoteContainer').show();
        $('#catDlgSummerNoteTextArea').summernote('code', $('#catDlgReadOnlyTextArea').html());

    }
    else {
        saveCategoryDialogText();
    }
    //The server has not found anything matching the requested URI(Uniform Resource Identifier).        GET - http://localhost:56437/Styles/images/ui-icons_f5e175_256x240.png
}

function saveCategoryDialogText() {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" + $('#catDlgSummerNoteTextArea').summernote('code'),
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "category description updated");
                $('#btnCatDlgEdit').html("Edit");
            }
            else {
                sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                //alert("EditFolderCategory: " + success);
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

function addMetaTags() {
    openMetaTagDialog(categoryFolderId);
}

function considerClosingCategoryDialog() {
    if (isInRole("not logged in")) {
        $('#folderCategoryDialog').dialog("close");
        return;
    }
    if ($("#btnCatDlgEdit").html() === "Edit") {
        //if ($('#catDlgDescription').prop("readonly")) {
        //$('#folderCategoryDialog').dialog("close");
        //$('#catDlgSummerNoteTextArea').summernote('destroy');
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