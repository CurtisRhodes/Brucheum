var FolderDetailModel = {};

// called from ModelInfoDialog.js
//             Album.js
//             Carousel.js      
//             Dashboard.js
//             Slideshow.js
//             StaticPage.js

function showModelInfoDialog(modelName, folderId, currentSrc) {

    //if (document.domain === 'localhost') alert("showModelInfoDialog(\nmodelName: " + modelName + "\nfolderId: " + folderId + "\ncurrentSrc" + currentSrc);

    FolderDetailModel.FolderId = folderId;
    $('#modelInfoDialog').dialog({
        autoOpen: false,
        show: { effect: "fade" },
        hide: { effect: "blind" },
        position: { my: 'center', at: 'top' },
        width: "615"
    });
    clearGets();

    $('#modelInfoDialog').dialog("open");
    if (modelName === "unknown model") {
        FolderDetailModel.FolderImage = currentSrc;
        $('#modelDialogThumbNailImage').attr("src", currentSrc);
        $('#modelInfoDialog').show();
        $('#modelInfoDialog').dialog('option', 'title', "unknown model");
        $('#modelInfoEditArea').hide();
        $('#modelInfoViewOnlyArea').show();
        $('#modelInfoEdit').hide();
        return;
    }
    //if (document.domain === 'localhost') alert("calling ImageCategoryDetail/Get?folderId: from showModelInfoDialog\nfolderId=" + folderId);
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/Get?folderId=" + folderId,
        success: function (folderDetails) {
            if (folderDetails.Success === "ok") {
                if (folderDetails.FolderImage === null) {
                    FolderDetailModel.FolderImage = currentSrc;
                }
                $('#modelInfoViewOnlyArea').hide();
                $('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                $('#txtFolderName').val(folderDetails.FolderName);
                $('#txtBorn').val(folderDetails.Born);
                $('#txtNationality').val(folderDetails.Nationality);
                $('#txtMeasurements').val(folderDetails.Measurements);
                $('#selBoobs').val(folderDetails.Boobs).change();

                if (isInRole("Oggle admin")) {  //  if (isNullorUndefined(userName)) {
                    $('#modelInfoViewOnlyArea').hide();
                    $("#txtBorn").datepicker();
                    $('#modelInfoDialogTrackBack').show();
                    $('#modelInfoDialogComment').summernote({
                        height: 210,
                        toolbar: [['codeview']]
                    });
                    $('#externalLinks').summernote({
                        height: 120,
                        toolbar: [['codeview']]
                    });
                    //$('#modelInfoEdit').html("Save");
                }
                else {
                    $('#modelInfoDialogTrackBack').hide();
                    $('.modelDialogInput').attr("readonly", true);
                    //$('#modelInfoEdit').html("Save");  // $('#modelInfoEdit').html("Edit");
                    $('#modelInfoEdit').html("Exit");
                    $('#modelInfoDialogComment').summernote({
                        height: 210,
                        toolbar: '[]'
                    });
                    $('#externalLinks').summernote({
                        height: 90,
                        toolbar: '[]'
                    });
                    $('#modelInfoDialogComment').summernote('disable');
                    //if (document.domain === 'localhost') alert("I WANT THE TOOLBAR GONE");
                }
                $('#modelInfoDialogComment').summernote("code", folderDetails.CommentText);
                $('#externalLinks').summernote("code", folderDetails.ExternalLinks);

                $('#modelInfoDialog').dialog('option', 'title', folderDetails.FolderName);
                $('#modelInfoEditArea').show();
            }
            else
                sendEmailToYourself("error in ModelInfoDialog.js", "Get FolderDetail model Info : " + folderDetails.Success);
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getFolderDetails")) {
                sendEmailToYourself("XHR ERROR in MOdelInfoDialog.js getFolderDetails", "/api/ImageCategoryDetail/Get?folderId=" + folderId + " Message: " + errorMessage);
            }
        }
    });
}

function addHrefToExternalLinks() {
    //alert("addHrefToExternalLinks: " + $('#txtLinkHref').val());
    $('#externalLinks').summernote('pasteHTML', "<a href=" + $('#txtLinkHref').val() + " target = '_blank'>" + $('#txtLinkLabel').val() + "</a><br/>");    
    addTrackback($('#txtLinkHref').val());
    $('#txtLinkHref').val('');
    $('#txtLinkLabel').val('');
}

function addTrackback(link) {
    var site = "";
    var hLink = "";
    if ($('#txtLinkHref').val().indexOf('freeones') > -1) {
        site = "Freeones";
        hLink = "<a href='" + link + "'>free porn</a>";
    }    
    if ($('#txtLinkHref').val().indexOf('indexxx') > -1) {
        site = "Indexxx";
        hLink = "<a href='" + link + "'>indexxx</a>";
    }
    if ($('#txtLinkHref').val().indexOf('babepedia') > -1) {
        site = "Babepedia";
        hLink = "<a href='" + link + "'>Babepedia</a>";
    }

    if (site !== "") {

        alert("addTrackback  site: " + site + "  link: " + hLink);

        var trackBackItem = {
            PageId: FolderDetailModel.FolderId,
            Site: site,
            TrackBackLink: hLink,
            LinkStatus: "unknown"
        };
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/TrackbackLink/Insert",
            data: trackBackItem,
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", "trackback link added");
                }
                else {
                    if (success.indexOf("Violation of PRIMARY KEY") > -1) {
                        updateTrackback(trackBackItem);
                    }
                    else {
                        if (document.domain === 'localhost')
                            alert("setTrackbackLinks: " + success);
                        else
                            sendEmailToYourself("setTrackbackLinks", success);
                    }
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (document.domain === 'localhost') {
                    alert("XHR ERROR IN addTrackback\nfolderId=" + folderId +
                        "\nurl: " + settingsArray.ApiServer + "api/TrackbackLink/Insert" + "\nMessage : " + errorMessage);
                }
                else {
                    if (!checkFor404(errorMessage, "addTrackback")) {
                        sendEmailToYourself("XHR ERROR IN addTrackback",
                            "folderId=" + folderId + "<br/>Message : " + errorMessage);
                    }
                }
            }
        });
    }
}

function updateTrackback(trackBackItem) {
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/TrackbackLink/Update",
        data: trackBackItem,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "trackback link updated");
            }
            else {
                if (document.domain === 'localhost')
                    alert("updateTrackback: " + success);
                else
                    sendEmailToYourself("updateTrackback", success);
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (document.domain === 'localhost') {
                alert("XHR ERROR IN updateTrackback" + 
                    "\nurl: " + settingsArray.ApiServer + "api/TrackbackLink/Insert" + "\nMessage : " + errorMessage);
            }
            else {
                if (!checkFor404(errorMessage, "updateTrackback")) {
                    sendEmailToYourself("XHR ERROR IN updateTrackback", errorMessage);
                }
            }
        }
    });
}

function IdentifyPoser() {
    $('#modelInfoEdit').show().html("Add");
    $('#modelInfoEditArea').show();
    $('#modelInfoViewOnlyArea').hide();
}

function toggleMode() {
    switch ($('#modelInfoEdit').html()) {
        case "Add":
            createPosersIdentifiedFolder();
            break;
        case "Save":
            updateFolderDetail();
            break;
        case "Exit":
            $('#modelInfoDialog').dialog("close");
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
                    success: function (moveImageSuccessModel) {
                        if (moveImageSuccessModel.Success === "ok") {
                            displayStatusMessage("ok", "image moved to newfolder");
                        }
                        else {
                            //alert("createPosersIdentifiedFolder " + success);
                            //displayStatusMessage("error", successModel.Success);
                            sendEmailToYourself("error in ModelInfoDialog.js", "createPosersIdentifiedFolder " + moveImageSuccessModel.Success);
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
    //if ($('#modelInfoEdit').html() === "Edit")
    if (!isInRole("Oggle admin")) {
        $('#modelInfoDialog').dialog("close");
    }
}

function IamThisModel() {
    alert("IamThisModel clicked");

}




