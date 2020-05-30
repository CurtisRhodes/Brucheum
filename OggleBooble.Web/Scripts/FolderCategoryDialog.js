var folderInfo = {};
    //<script src = "https://stackpath.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js" ></script>
function showCategoryDialog(folderId) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog
    try {
        $('#draggableDialogContents').html(folderDialogHtml());
       
        //$('#draggableDialog').css("top", ($(window).height() - $('#draggableDialog').height()) / 2);
        $('#draggableDialog').css("top", $('.oggleHeader').height() + 20);
        //$('.centeringOuterShell').css("left", $('.centeringInnerShell').offset().left - $('#draggableDialog').width() / 2);
        //$('#btnCatDlgCancel').hide();
        //$('#draggableDialog').css("top", $('#header').height() + 108);

        $('#summernoteContainer').summernote({ toolbar: "none" });
        $('#summernoteContainer').summernote({ height: "300" });
        //$('#summernoteContainer').summernote({ toolbar: "none" });
        $("#draggableDialog").show();

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
                    if (isNullorUndefined(folderDetails.CommentText)) {
                        folderDetails.CommentText = "In in eros sit amet nunc ultrices laoreet. Nunc eu fringilla diam. Morbi eget nunc gravida, dignissim metus et, pharetra ligula." +
                            " Maecenas efficitur nunc dapibus neque semper gravida. Donec eget commodo turpis, non accumsan sapien. Nunc elementum hendrerit sodales." +
                            " Nam pulvinar cursus mi, id feugiat quam. Curabitur interdum pretium nunc, vitae aliquam tellus pellentesque in. Nullam eleifend viverra massa, eu vulp" +
                            "utate nisi sagittis sit amet. Suspendisse imperdiet sem nec tempus ornare. Morbi sit amet consequat diam.";
                    }
                    $('#draggableDialogTitle').html(folderDetails.FolderName);
                    $('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                    $('#txtFolderName').val(folderDetails.FolderName);
                    $('#txtBorn').val(folderDetails.Born);
                    $('#txtNationality').val(folderDetails.Nationality);
                    $('#txtBorn').val(folderDetails.Born);
                    $('#txtBoobs').val(folderDetails.Measurements);
                    //$('#txtStatus').val(folderDetails.LinkStatus);
                    $("#summernoteContainer").summernote("code", folderInfo.CommentText);
                }
                else {
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
        //sendEmailToYourself("javascript catch in FolderCategoryDialog.js showCategoryDialog", "get NudeModelInfo catch: " + e);
        if (document.domain === 'localhost') alert("FolderCategoryDialog catch: " + e);
    }
}

function editFolderDialog() {
    if ($('#btnCatDlgEdit').html() === "Save") {
        saveFolderDialog();
        $('#btnCatDlgEdit').html("Edit");
        return;
    }
    if (!isLoggedIn()) {
        alert("you must be logged in to edit folder comments");
        return;
    }
    if ($('#btnCatDlgEdit').html() === "Edit") {
        //$('#headerMessage').html("page hits: " + imageLinksModel.PageHits.toLocaleString());
        $('#summernoteContainer').summernote("destroy");
        $('#summernoteContainer').summernote({ toolbar: [['codeview']] });
        $("#summernoteContainer").summernote("code", folderInfo.CommentText);
        $('#summernoteContainer').summernote({ focus: true });

        $('#boobsInputArea').html("<select id='selBoobs' class='modelDialogSelect'>\n" +
            "    <option value='Real'>Real</option>\n" +
            "    <option value='Fake'>Fake</option>\n" +
            "</select><br />\n");
        $('#selBoobs').val(folderDetails.Boobs).change();

        $('#btnCatDlgEdit').html("Save");
        $('#btnCatDlgCancel').show();
    }
}

function saveFolderDialog() {
    folderDetailModel = {};

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

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FolderDetail/Update",

        //EditFolderCategory?folderId=" + categoryFolderId + " & commentText=" + $('#catDlgSummerNoteTextArea').summernote('code'),
            success: function(success) {
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

function folderDialogHtml() {
    return "<div class='folderDialogContainer'>\n" +
        "   <div class='modelInfoDetailsArea'>\n" +
        "       <div class='flexContainer'>\n" +
        "           <div class='floatLeft'>\n" +
        "               <div class='modelInfoDialogLabel'>name</div><input id='txtFolderName' class='modelDialogInput'/>\n" +
        "               <div class='modelInfoDialogLabel'>from</div><input id='txtNationality' class='modelDialogInput'/>\n" +
        "               <div class='modelInfoDialogLabel'>born</div><input id='txtBorn' class='modelDialogInput'/>\n" +
        "               <div id=''boobsInputArea' class='modelInfoDialogLabel'>boobs</div><input id='txtBoobs' class='modelDialogInput'/>\n" +
        "               <div class='modelInfoDialogLabel'>figure</div><input id='txtMeasurements' class='modelDialogInput'/>\n" +
        "           </div>\n" +
        "           <div class='floatLeft'>\n" +
        "               <img id='modelDialogThumbNailImage' src='/Images/redballon.png' class='modelDialogImage' />\n" +
        "           </div>\n" +
        "       </div>\n" +
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
    $('#summernoteContainer').summernote("destroy");
    $('#summernoteContainer').summernote({ toolbar: "none" });
    $("#summernoteContainer").summernote("code", folderInfo.CommentText);
    $('#summernoteContainer').summernote({ focus: false });
}

function addMetaTags() {
    openMetaTagDialog(categoryFolderId);
}

function considerClosingCategoryDialog() {
    if (!isInRole("Oggle admin") || $('#btnCatDlgEdit').html() === "Edit") {
        $('#folderCategoryDialog').dialog("close");
    }
}

