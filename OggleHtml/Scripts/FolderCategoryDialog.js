var categoryFolderId = "";
var isPornEditor = true;

function showCategoryDialog(folderId) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog

    if (isPornEditor) {
        $('#catDlgDescription').summernote({
            height: 300,
            codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
            toolbar: [
                ['codeview'],
                ['font style', ['fontname', 'fontsize', 'color', 'bold', 'italic', 'underline']]
            ]
        });
    }

    $('#folderCategoryDialog').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        width: "500px"
    });

    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/CategoryComment/Get?folderId=" + folderId,
            success: function (categoryComment) {

//<a id="btnCatDlgEdit" class="folderCategoryDialogButton" href="javascript:toggleEditCatDialog()">Edit</a>
//<a id="btnCatDlgMeta" class="folderCategoryDialogButton" href="javascript:addMetaTags()">add meta tags</a>

                if (categoryComment.Success === "ok") {
                    categoryFolderId = folderId;
                    if (isPornEditor) {
                        $('#catDlgDescription').summernote('code', categoryComment.CommentText);
                        $('.folderCategoryDialogButton').show();
}
                    else {
                        $('#catDlgDescription').val(categoryComment.CommentText);
                        $('#catDlgDescription').prop("readonly", true);
                        $('.folderCategoryDialogButton').hide();
                    }

                    $('#folderCategoryDialog').dialog('option', 'title', categoryComment.FolderName);
                    $('#folderCategoryDialog').show();
                    $('#folderCategoryDialog').dialog("open");
                }
                else {
                    if (categoryComment.Success !== "not found")
                        alert("get Category Comment: " + categoryComment.Success);
                }
            },
            error: function (jqXHR, exception) {
                alert("get Category Comment XHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
    catch (e) {
        alert("get NudeModelInfo catch: " + e);
    }
}

function toggleEditCatDialog() {
    if ($("#btnCatDlgEdit").html() === "Edit") {
        $('#catDlgDescription').prop("readonly", false);
        $("#btnCatDlgEdit").html("Save");
    }
    else {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" + $('#catDlgDescription').summernote('code'),
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", "category description updated");
                    $('#btnCatDlgEdit').html("Edit");
                    $('#catDlgDescription').prop("readonly", true);
                }
                else
                    alert("EditFolderCategory: " + success);
            },
            error: function (jqXHR, exception) {
                alert("EditFolderCategory XHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }
}

function addMetaTags() {
    openMetaTagDialog(categoryFolderId);
}

function considerClosingCategoryDialog() {
    if ($('#catDlgDescription').prop("readonly")) {
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