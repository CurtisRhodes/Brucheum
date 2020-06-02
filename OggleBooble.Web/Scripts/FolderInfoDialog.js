var folderInfo = {};
function showFolderInfoDialog(folderId) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog
    // 5/30/2020  removing use of jquery dialog for my own. 
    try {
        $('#imagePageLoadingGif').show();
        $('#draggableDialogContents').html(folderDialogHtml());

        $('#modelInfoDetails').hide();
        $('#btnCatDlgCancel').hide();
        $('#btnCatDlgMeta').hide();

        $('#draggableDialog').css("top", $('.oggleHeader').height() + 20);
        $('#summernoteContainer').summernote({
            toolbar: "none",
            height: "300", 
            dialogsInBody: true
        });
        $('#summernoteContainer').summernote('disable');
        // CMX	Show Model Info Dialog
        reportEvent("CMX", "called From", "detail", folderId);

        $(".note-editable").css('font-size', '19px');
        $(".modelDialogInput").prop('readonly', true);;

        if (typeof pause === 'function')
            pause();

        // 5/30 2010
        // how to determine folder type : if a category folder or a model album
        // if rootfolder = boobs show just the CommentText 
        // 
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/FolderDetail/GetFolderInfo?folderId=" + folderId,
            success: function (folderDetails) {
                if (folderDetails.Success === "ok") {
                    folderInfo = folderDetails;
                    //if (isNullorUndefined(folderDetails.CommentText)) {
                    //    folderDetails.CommentText = "In in eros sit amet nunc ultrices laoreet. Nunc eu fringilla diam. Morbi eget nunc gravida, dignissim metus et, pharetra ligula." +
                    //        " Maecenas efficitur nunc dapibus neque semper gravida. Donec eget commodo turpis, non accumsan sapien. Nunc elementum hendrerit sodales." +
                    //        " Nam pulvinar cursus mi, id feugiat quam. Curabitur interdum pretium nunc, vitae aliquam tellus pellentesque in. Nullam eleifend viverra massa, eu vulp" +
                    //        "utate nisi sagittis sit amet. Suspendisse imperdiet sem nec tempus ornare. Morbi sit amet consequat diam.";
                    //}
                    $('#draggableDialogTitle').html(folderDetails.FolderName);
                    $('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                    $('#txtFolderName').val(folderDetails.FolderName);
                    $('#txtBorn').val(folderDetails.Born);
                    $('#txtNationality').val(folderDetails.Nationality);
                    $('#txtBorn').val(folderDetails.Born);
                    $('#txtBoobs').val(folderDetails.Boobs);
                    $('#txtMeasurements').val(folderDetails.Measurements);
                    //$('#txtStatus').val(folderDetails.LinkStatus);
                    $("#summernoteContainer").summernote("code", folderInfo.CommentText);

                    determineFolderType();

                    $('#imagePageLoadingGif').hide();
                    $("#draggableDialog").fadeIn();
                }
                else {
                    $('#imagePageLoadingGif').hide();
                    showMyAlert("unable to show folder info");
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "JQE",
                        Severity: 2,
                        ErrorMessage: folderDetails.Success,
                        CalledFrom: "showCategoryDialog"
                    });
                    if (document.domain === 'localhost') alert("showCategoryDialog: " + folderDetails.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (document.domain === 'localhost') alert("showCategoryDialog: " + errorMessage);
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
        //sendEmailToYourself("javascript catch in FolderInfoDialog.js showCategoryDialog", "get NudeModelInfo catch: " + e);
        if (document.domain === 'localhost') alert("FolderCategoryDialog catch: " + e);
    }
}

function determineFolderType() {
    //    FolderId { get; set; }
    //    FolderName { get; set; }
    //    RootFolder { get; set; }
    //    Link { get; set; }
    //    Nationality { get; set; }
    //    Measurements { get; set; }
    //    ExternalLinks { get; set; }
    //    CommentText { get; set; }
    //    Born { get; set; }
    //    Boobs { get; set; }
    //    Boobepedia { get; set; }
    //    FolderImage { get; set; }
    //    LinkStatus { get; set; }
    //    IsLandscape { get; set; }
    //    Success { get; set; }

    if (folderInfo.RootFolder === "centerfold") {
        $('#modelInfoDetails').show();
        return;
    }

    if (folderInfo.RootFolder === "archive") {
        if (folderInfo.HasImages) {
            $('#modelInfoDetails').show();
            return;
        }
    }
}

function editFolderDialog() {
    if ($('#btnCatDlgEdit').html() === "Save") {
        saveFolderDialog();
        return;
    }
    if (!isLoggedIn()) {
        showMyAlert("you must be logged in to edit folder comments");
        return;
    }
    $('#btnCatDlgEdit').html("Save");
    $(".modelDialogInput").prop('readonly', false);
    $("#txtFolderName").prop('readonly', true);
    $('#summernoteContainer').summernote('enable');

    $('#summernoteContainer').summernote("destroy");
    $('#summernoteContainer').summernote({ toolbar: [['codeview']] });
    $(".note-editable").css('font-size', '19px');
   

    $('#boobsInputArea').html("<select id='selBoobs' class='modelDialogInput'>\n" +
        "    <option value='Real'>Real</option>\n" +
        "    <option value='Fake'>Fake</option>\n" +
        "</select><br />\n");
    $('#selBoobs').val(folderInfo.Boobs).change();
    $('#btnCatDlgCancel').show();
}

function saveFolderDialog() {
    $('#imagePageLoadingGif').show();
    // LOAD GETS
    folderInfo.Born = $('#txtBorn').val();
    folderInfo.Nationality = $('#txtNationality').val();
    folderInfo.Measurements = $('#txtMeasurements').val();
    folderInfo.Boobs = $('#selBoobs').val();
    folderInfo.CommentText = $('#summernoteContainer').summernote('code');
    //folderInfo.ExternalLinks = $('#externalLinks').summernote('code');
    //folderInfo.LinkStatus = $('#txtStatus').val();

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FolderDetail/Update",
        data: folderInfo,
        success: function (success) {
            $('#imagePageLoadingGif').fadeOut();
            if (success === "ok") {
                displayStatusMessage("ok", "category description updated");
                $('#btnCatDlgEdit').html("Edit");
                //$('#btnCatDlgMeta').hide();
                $('#btnCatDlgCancel').hide();
                $(".modelDialogInput").prop('readonly', true);;

                $('#summernoteContainer').summernote("destroy");
                $('#summernoteContainer').summernote({ toolbar: "none" });
                $('#summernoteContainer').summernote('disable');
            }
            else {
                //sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                if (document.domain === 'localhost') alert("EditFolderCategory: " + success);
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "JQE",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "saveFolderDialog"
                });
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "saveCategoryDialogText")) {
                logError({
                    VisitorId: getCookieValue("VisitorId"),
                    ActivityCode: "XHR",
                    Severity: 2,
                    ErrorMessage: errorMessage,
                    CalledFrom: "saveFolderDialog"
                });
                //sendEmailToYourself("XHR ERROR in FolderCategory.js saveCategoryDialogText",
                //    "/api/CategoryComment/EditFolderCategory?folderId=" + categoryFolderId + "&commentText=" +
                //    $('#catDlgSummerNoteTextArea').summernote('code') + " Message: " + errorMessage);
            }
        }
    });
}

function folderDialogHtml() {
    return "<div class='folderDialogContainer' onmouseout='considerClosingModelInfoDialog()' >\n" +
        "   <div id='modelInfoDetails' class='flexContainer displayHidden'>\n" +
        "       <div class='modelInfoDetailsArea'>\n" +
        "          <div><div class='modelInfoDialogLabel'>name</div><div class='modelInfoValue'><input id='txtFolderName' class='modelDialogInput'/></div></div>\n" +
        "           <div><div class='modelInfoDialogLabel'>from</div><div class='modelInfoValue'><input id='txtNationality' class='modelDialogInput'/></div></div>\n" +
        "           <div><div class='modelInfoDialogLabel'>born</div><div class='modelInfoValue'><input id='txtBorn' class='modelDialogInput'/></div></div>\n" +
        "           <div><div class='modelInfoDialogLabel'>boobs</div><div id='boobsInputArea'><div class='modelInfoValue'><input id='txtBoobs' class='modelDialogInput'/></div></div></div>\n" +
        "           <div><div class='modelInfoDialogLabel'>figure</div><div class='modelInfoValue'><input id='txtMeasurements' class='modelDialogInput'/></div></div>\n" +
        "       </div>\n" +
        "       <div class='floatLeft'>\n" +
        "           <img id='modelDialogThumbNailImage' src='/Images/redballon.png' class='modelDialogImage' />\n" +
        "       </div>\n" +
        "   </div>\n" +
        "   <div class='modelInfoCommentArea'>\n" +
        "       <textarea id='summernoteContainer'></textarea>\n" +
        "   </div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "       <div id='btnCatDlgCancel' class='folderCategoryDialogButton displayHidden' onclick='cancelEdit()'>Cancel</div>\n" +
        "       <div id='btnCatDlgMeta' class='folderCategoryDialogButton' onclick='addMetaTags()'>add meta tags</div>\n" +
        "   </div>\n" +
        "</div>\n"
}

function cancelEdit() {
    $('#btnCatDlgEdit').html("Edit");
    $('#btnCatDlgCancel').hide();

    $('#summernoteContainer').summernote("destroy"); // needed to reset toolbar
    $('#summernoteContainer').summernote({ toolbar: "none" });
    $('#summernoteContainer').summernote('disable');
    $("#summernoteContainer").summernote("code", folderInfo.CommentText); // reload unedited to cancel changes
}

function addMetaTags() {

    //openMetaTagDialog(categoryFolderId);
}

function considerClosingModelInfoDialog() {
    if ($('#btnCatDlgEdit').html() === "Edit") {
        dragableDialogClose();
    }
}

function showReadOnlyModelInfoDialogHtml() {
    $('#modelInforDialogContainer').html(
        "<div id='folderCategoryDialog' class='oggleDialogWindow' title='' onmouseleave='considerClosingCategoryDialog()'>\n" +
        "    <div id='catDlgSummerNoteTextArea'></div>\n" +
        "    <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "    <div id='btnCatDlgMeta' class='folderCategoryDialogButton displayHidden' onclick='addMetaTags()'>add meta tags</div>\n" +
        "</div>\n");
}


