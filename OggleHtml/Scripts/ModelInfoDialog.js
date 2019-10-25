var FolderDetailModel = {};
//var isPornEditor = false;

function showModelInfoDialog(modelName, folderId, currentSrc) {

    //alert("showModelInfoDialog");

    FolderDetailModel.FolderId = folderId;

    $('#modelInfoDialog').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'center', at: 'top' },
        width: "615"
    });
    clearGets();
    getFolderDetails(modelName, folderId, currentSrc);

    //alert("isPornEditor: " + isPornEditor);
    if (isPornEditor) {
        $("#txtBorn").datepicker();
        $('#modelInfoDialogTrackBack').show();
        $('#modelInfoDialogComment').summernote({
            height: 300,
            codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
            toolbar: [['codeview']]
        });
        $('#externalLinks').summernote({
            height: 120,
            codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
            toolbar: [['codeview']]
        });
    }
    else {
        $('#modelInfoDialogComment').summernote({
            height: 300,
            toolbar: "none"
        });
        $('#modelInfoDialogTrackBack').hide();
        $('#modelInfoDialogComment').attr("readonly", "readonly");
        $('.modelDialogInput').attr("readonly", "readonly");
        $('#modelInfoEdit').html("Edit");
        $('#modelInfoEdit').hide();
    }
}

function getFolderDetails(modelName, folderId, currentSrc) {
    //alert("modelName: " + modelName + " folderId:" + folderId);
    if (modelName === "unknown model") {
        FolderDetailModel.FolderImage = currentSrc;
        $('#modelDialogThumbNailImage').attr("src", currentSrc);
        $('#modelInfoDialog').show();
        $('#modelInfoDialog').dialog('option', 'title', "unknown model");
        $('#modelInfoEditArea').hide();
        $('#modelInfoViewOnlyArea').show();
        $('#modelInfoEdit').html("Edit");
    }
    else {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/ImageCategoryDetail/Get?folderId=" + folderId,
            success: function (folderDetails) {
                if (folderDetails.Success === "ok") {
                    $('#modelInfoViewOnlyArea').hide();
                    if (folderDetails.FolderImage === null) {
                        FolderDetailModel.FolderImage = currentSrc;
                    }

                    $('#modelInfoDialogComment').summernote("code", folderDetails.CommentText);
                    if (isPornEditor) {
                        $('#externalLinks').summernote("code", folderDetails.ExternalLinks);
                    }
                    else {
                        $('#externalLinks').html(folderDetails.ExternalLinks);
                    }
                    $('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                    $('#modelInfoDialog').dialog('option', 'title', folderDetails.FolderName);
                    $('#modelInfoEditArea').show();
                    $('#modelInfoViewOnlyArea').hide();
                    $('#txtFolderName').val(folderDetails.FolderName);
                    $('#txtBorn').val(folderDetails.Born);
                    $('#txtNationality').val(folderDetails.Nationality);
                    $('#txtMeasurements').val(folderDetails.Measurements);
                    $('#txtBoobs').val(folderDetails.Boobs);
                    $('#modelInfoEdit').html("Save");
                    $('#modelInfoEditArea').show();
                }
                else {
                    sendEmailToYourself("error in ModelInfoDialog.js", "Get FolderDetail model Info : " + folderDetails.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "getFolderDetails")) {
                    sendEmailToYourself("XHR ERROR in MOdelInfoDialog.js getFolderDetails", "/api/ImageCategoryDetail/Get?folderId=" + folderId + " Message: " + errorMessage);
                }
            }
        });
    }

    $('#modelInfoDialog').dialog("open");
    //$('#modelInfoDialog').fadeIn();
}

function addHrefToExternalLinks() {

    //alert("addHrefToExternalLinks: " + $('#txtLinkHref').val());
    $('#externalLinks').summernote('pasteHTML', "<a href=" + $('#txtLinkHref').val() + " target = '_blank'>" + $('#txtLinkLabel').val() + "</a><br/>");

    //$('#externalLinks').append("<a href=" + $('#txtLinkHref').val() + ">" + $('#txtLinkLabel').val() + " target='_blank'</a><br/>");
    $('#txtLinkHref').val('');
    $('#txtLinkLabel').val('');
}

function toggleMode() {
    switch ($('#modelInfoEdit').html()) {
        case "Edit":
            $('#modelInfoEdit').html("Add");
            $('#modelInfoEditArea').show();
            $('#modelInfoViewOnlyArea').hide();
            break;
        case "Add":
            createPosersIdentifiedFolder();
            break;
        case "Save":
            updateFolderDetail();
            break;
        default:
    }
}

function clearGets() {
    $('#txtLinkHref').val('');
    $('#txtLinkLabel').val('');
    $('#txtFolderName').val('');
    $('#txtBorn').val('');
    $('#modelInfoDialogComment').html('');
    $('#txtNationality').val('');
    $('#externalLinks').html('');
}

function validate() {
    FolderDetailModel.FolderName = $('#txtFolderName').val();
    $('#modelInfoDialog').dialog('option', 'title', FolderDetailModel.FolderName);
    FolderDetailModel.Born = $('#txtBorn').val();
    FolderDetailModel.Nationality = $('#txtNationality').val();
    FolderDetailModel.Measurements = $('#txtMeasurements').val();
    FolderDetailModel.Boobs = $('#selBoobs').val();
    FolderDetailModel.CommentText = $('#modelInfoDialogComment').summernote('code');
    FolderDetailModel.ExternalLinks = $('#externalLinks').summernote('code');
    return true;
}

function createPosersIdentifiedFolder() {
    var defaultParentFolder = 917;
    if (validate()) {
    // step 1:  Create new Ftmp Folder
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/FtpDashBoard/CreateFolder?parentId=" + defaultParentFolder + "&newFolderName=" + FolderDetailModel.FolderName,
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {
                // step 2: Move Image 
                displayStatusMessage("ok", "new folder created");
                //linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                var MoveCopyImageModel = {
                    Mode: "Archive",
                    Link: FolderDetailModel.FolderImage,
                    SourceFolderId: FolderDetailModel.FolderId,
                    DestinationFolderId: successModel.ReturnValue
                };

                $.ajax({
                    type: "PUT",
                    url: settingsArray.ApiServer + "/api/MoveImage/MoveImage",
                    data: MoveCopyImageModel,
                    success: function (success) {
                        if (success === "ok") {
                            displayStatusMessage("ok", "image moved to newfolder");
                        }
                        else {
                            //alert("createPosersIdentifiedFolder " + success);
                            //displayStatusMessage("error", successModel.Success);
                            sendEmailToYourself("error in ModelInfoDialog.js", "createPosersIdentifiedFolder " + successModel.Success);
                        }
                    },
                    error: function (jqXHR) {
                        var errorMessage = getXHRErrorDetails(jqXHR);
                        if (!checkFor404(errorMessage, "createPosersIdentifiedFolder")) {
                            sendEmailToYourself("XHR ERROR in Transitions.html createPosersIdentifiedFolder", "/api/MoveImage/MoveImage Message: " + errorMessage);
                        }
                    }
                });
            }
            else {
                sendEmailToYourself("error in ModelInfo.js", "CreateVirtualFolder: " + successModel.Success);
                //alert("CreateVirtualFolder: " + successModel.Success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "createPosersIdentifiedFolder")) {
                sendEmailToYourself("XHR ERROR in Transitions.html createPosersIdentifiedFolder",
                    "/api/FtpDashBoard/CreateFolder?parentId=" + defaultParentFolder + "&newFolderName=" + FolderDetailModel.FolderName + " Message: " + errorMessage);
            }
        }
    });
}

    //// 2. actually create
    //string extension = model.FolderImage.Substring(model.FolderImage.LastIndexOf("."));
    ////string sourceOriginPath = Helpers.GetParentPath(dbParent.Id, true);
    //string linkId = model.FolderImage.Substring(model.FolderImage.LastIndexOf("_") + 1, 36);
    ////string ftpSource = "ftp://50.62.160.105/" + dbParent.RootFolder + ".ogglebooble.com/" + sourceOriginPath + "posers identified/" + model.FolderName + "_" + linkId + extension;

    //string ftpSource = model.FolderImage.Replace("http://", "ftp://50.62.160.105/");
    //string expectedFileName = model.FolderName + "_" + linkId + extension;
    //string ftpDestinationPath = "ftp://50.62.160.105/archive.ogglebooble.com/posers identified/" + model.FolderName;

    //if (!FtpUtilies.DirectoryExists(ftpDestinationPath))
    //    FtpUtilies.CreateDirectory(ftpDestinationPath);

    //success = FtpUtilies.MoveFile(ftpSource, ftpDestinationPath + "/" + expectedFileName);

    //ImageLink goDaddyrow = db.ImageLinks.Where(g => g.Id == linkId).First();
    //goDaddyrow.Link = "http://archive.ogglebooble.com/posers identified/" + model.FolderName + "/" + expectedFileName;
    //goDaddyrow.FolderLocation = newFolderId;

        //db.CategoryImageLinks.Add(new CategoryImageLink() {ImageCategoryId = newFolderId, ImageLinkId = linkId });
//db.SaveChanges();


// 2. add new category folder row and folder detail row
}

function updateFolderDetail() {
    if (validate()) {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/ImageCategoryDetail",
            data: FolderDetailModel,
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", "Model info updated");
                }
                else {
                    sendEmailToYourself("XHR ERROR in ModelInfoDialog.js updateFolderDetail", "Edit Model info: " + success);
                    //alert("Edit Model info: " + success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404(errorMessage, "updateFolderDetail")) {
                    sendEmailToYourself("XHR ERROR in ModelInfoDialog.js updateFolderDetail", "/api/ImageCategoryDetail Message: " + errorMessage);
                }
            }
        });
    }
}

function considerClosingModelInfoDialog() {
    if ($('#modelInfoEdit').html() === "Edit")
        $('#modelInfoDialog').dialog("close");
}

