var FolderDetailModel = {};
var isPornEditor = false;

function showModelInfoDialog(modelName, folderId, currentSrc) {
    FolderDetailModel.FolderId = folderId;
    isPornEditor = false;

    if (isPornEditor) {
        $("#txtBorn").datepicker();
        $('#modelInfoDialogTrackBack').show();
        $('#txaModelComment').summernote({
            height: 300,
            codemirror: { lineWrapping: true, mode: "htmlmixed", theme: "cobalt" },
            toolbar: [['codeview'],]
        });
    }
    else {
        $('#modelInfoDialogTrackBack').hide();
        $('#txaModelComment').attr("readonly", "readonly");
        $('.modelDialogInput').attr("readonly", "readonly");        
        $('#modelInfoEdit').html("Edit");
        $('#modelInfoEdit').hide();
    }

    $('#modelInfoDialog').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: ({ my: 'center', at: 'top', of: $('#middleColumn') }),
        width: "615"
    });
    clearGets();
    getFolderDetails(modelName, folderId, currentSrc);
}

function getFolderDetails(modelName, folderId, currentSrc) {
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
                    //if (folderDetails.FolderName === "Unknown") {
                    //    FolderDetailModel.FolderImage = currentSrc;
                    //    $('#modelDialogThumbNailImage').attr("src", currentSrc);
                    //    $('#modelInfoDialog').dialog('option', 'title', "unknown model");
                    //    $('#unknownModelLinks').append(folderDetails.ExternalLinks);
                    //    $('#modelInfoEditArea').hide();
                    //    $('#modelInfoViewOnlyArea').show();
                    //    $('#modelInfoEdit').html("Edit");
                    //}
                    //else {
                    $('#modelInfoViewOnlyArea').hide();
                    if (folderDetails.FolderImage === null) {
                        FolderDetailModel.FolderImage = currentSrc;
                    }
                    if (isPornEditor) {
                        $('#txaModelComment').summernote("code", folderDetails.CommentText);
                    }
                    else
                        $('#txaModelComment').val(folderDetails.CommentText);

                    $('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                    $('#modelInfoDialog').dialog('option', 'title', folderDetails.FolderName);
                    $('#modelInfoEditArea').show();
                    $('#modelInfoViewOnlyArea').hide();
                    $('#txtFolderName').val(folderDetails.FolderName);
                    $('#txtBorn').val(folderDetails.Born);
                    $('#txtNationality').val(folderDetails.Nationality);
                    $('#txtMeasurements').val(folderDetails.Measurements);
                    $('#txtBoobs').val(folderDetails.Boobs);

                    $('#externalLinks').html(folderDetails.ExternalLinks);
                    $('#modelInfoEdit').html("Save");
                    $('#modelInfoEditArea').show();

                }
                else
                    alert("Get FolderDetail model Info : " + folderDetails.Success);
            },
            error: function (jqXHR, exception) {
                alert("Get Model Info jqXHR : " + getXHRErrorDetails(jqXHR, exception));
            }
        });
    }

    $('#modelInfoDialog').dialog("open");
    //$('#modelInfoDialog').fadeIn();
}

function addHrefToExternalLinks() {
    $('#externalLinks').append("<a href=" + $('#txtLinkHref').val() + ">" + $('#txtLinkLabel').val() + "</a><br/>");
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
    $('#txaModelComment').val('');
    $('#txtNationality').val('');
    $('#externalLinks').html('');
}

function validate() {
    FolderDetailModel.FolderName = $('#txtFolderName').val();
    $('#modelInfoDialog').dialog('option', 'title', FolderDetailModel.FolderName);
    FolderDetailModel.Born = $('#txtBorn').val();
    FolderDetailModel.Nationality = $('#txtNationality').val();
    FolderDetailModel.Measurements = $('#txtMeasurements').val();
    FolderDetailModel.CommentText = $('#txaModelComment').val();
    FolderDetailModel.ExternalLinks = $('#externalLinks').html();
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
            if (successModel.Success == "ok") {
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
                            alert("ftp Move " + success);
                        }
                    },
                    error: function (xhr) {
                        $('#moveCopyDialogLoadingGif').hide();
                        alert("ftp Move xhr error: " + xhr.statusText);
                    }
                });
            }
            else
                alert("CreateVirtualFolder: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("CreateVirtualFolder xhr error: " + getXHRErrorDetails(xhr));
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
            else
                alert("Edit Model info: " + success);
        },
        error: function (jqXHR, exception) {
            alert("Edit ModelInfo jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    })
}
}


function considerClosingModelInfoDialog() {
    if ($('#modelInfoEdit').html() === "Edit")
        $('#modelInfoDialog').dialog("close");
}

