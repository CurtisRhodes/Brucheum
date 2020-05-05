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
    if (isNullorUndefined(folderId)) {
        sendEmailToYourself("Error in showModelInfoDialog", "isNullorUndefined(folderId)" +
            "<br/>modelName: " + modelName +
            "<br/>currentSrc: " + currentSrc);
        return;
    }
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/ImageCategoryDetail/Get?folderId=" + folderId,
        success: function (folderDetails) {
            if (folderDetails.Success === "ok") {
                //if (folderDetails.FolderImage === null) {
                //    FolderDetailModel.FolderImage = currentSrc;
                //}
                if (folderDetails.IsLandscape) {
                    $('#modelInfoDialog').dialog("option", "width", 750);
                    //alert("we have a landscape");
                }

                $('#modelInfoViewOnlyArea').hide();
                $('#modelDialogThumbNailImage').attr("src", folderDetails.FolderImage);
                $('#txtFolderName').val(folderDetails.FolderName);
                $('#txtBorn').val(folderDetails.Born);
                $('#txtNationality').val(folderDetails.Nationality);
                $('#txtMeasurements').val(folderDetails.Measurements);
                $('#txtStatus').val(folderDetails.LinkStatus);
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
                        height: 110,
                        toolbar: [['codeview']]
                    });
                    $('#externalLinks').summernote("code", folderDetails.ExternalLinks);
                    //$('#modelInfoEdit').html("Save");
                }
                else {
                    $('#externalLinks').hide();
                    $('#modelInfoDialogTrackBack').hide();
                    $('.modelDialogInput').attr("readonly", true);
                    //$('#modelInfoEdit').html("Save");  // $('#modelInfoEdit').html("Edit");
                    $('#modelInfoEdit').html("Exit");
                    $('#modelInfoDialogComment').summernote({
                        height: 250,
                        toolbar: [['codeview']]
                    });
                    $('#modelInfoDialogComment').summernote('disable');
                    //if (document.domain === 'localhost') alert("I WANT THE TOOLBAR GONE");
                }

                $('#modelInfoDialog').dialog('option', 'title', folderDetails.FolderName);
                $('#modelInfoDialogComment').summernote("code", folderDetails.CommentText);
                $('#modelInfoEditArea').show();
            }
            else
                sendEmailToYourself("error in ModelInfoDialog.js", "Get FolderDetail model Info : " + folderDetails.Success);
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errorMessage, "getFolderDetails")) {
                sendEmailToYourself("XHR ERROR in ModelInfoDialog.js getFolderDetails", "/api/ImageCategoryDetail/Get?folderId=" + folderId +
                    "<br/>Message: " + errorMessage);
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
        hLink = "<a href='" + link + "' target='_blank'>free porn</a>";
    }    
    if ($('#txtLinkHref').val().indexOf('indexxx') > -1) {
        site = "Indexxx";
        hLink = "<a href='" + link + "'>indexxx</a>";
    }
    if ($('#txtLinkHref').val().indexOf('babepedia') > -1) {
        site = "Babepedia";
        hLink = "<a href='" + link + "' target='_blank'>Babepedia</a>";
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
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 3,
                        ErrorMessage: "XHR ERROR IN updateTrackback: " + errorMessage,
                        CalledFrom: "ModelInfoDialgo updateTrackback"
                    });
                    //sendEmailToYourself("XHR ERROR IN updateTrackback", errorMessage);
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
    $('#txtStatus').val('');
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
    FolderDetailModel.LinkStatus = $('#txtStatus').val();
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

function showModelInfoDialogHtml() {
    $('#modelInforDialogContainer').html(
        "<div id='modelInfoDialog' class='oggleDialogWindow' onmouseleave='considerClosingModelInfoDialog()'>\n" +
        "    <div id='modelInfoEditArea' class='displayHidden'>\n" +
        "        <div class='flexContainer'>\n" +
        "            <div class='floatLeft'>\n" +
        "                <div class='modelInfoDialogLabel'>name</div><input id='txtFolderName' class='modelDialogInput' /><br />\n" +
        "                <div class='modelInfoDialogLabel'>from</div><input id='txtNationality' class='modelDialogInput' /><br />\n" +
        "                <div class='modelInfoDialogLabel'>born</div><input id='txtBorn' class='modelDialogInput' /><br />\n" +
        "                <div class='modelInfoDialogLabel'>boobs</div>\n" +
        "                <select id='selBoobs' class='modelDialogSelect'>\n" +
        "                    <option value='Real'>Real</option>\n" +
        "                    <option value='Fake'>Fake</option>\n" +
        "                </select><br />\n" +
        "                <div class='modelInfoDialogLabel'>figure</div><input id='txtMeasurements' class='modelDialogInput' />\n" +
        "            </div>\n" +
        "            <div class='floatLeft'>\n" +
        "                <img id='modelDialogThumbNailImage' src='/Images/redballon.png' class='modelDialogImage' />\n" +
        "            </div>\n" +
        "        </div>\n" +
        "        <div class='modelInfoDialogLabel'>comment</div>\n" +
        "        <div id='modelInfoDialogCommentContainer'>\n" +
        "            <div id='modelInfoDialogComment' class='modelInfoCommentArea'></div>\n" +
        "        </div>\n" +
        "        <div id='modelInfoDialogTrackBack'>\n" +
        "            <div class='modelInfoDialogLabel'>status</div><input id='txtStatus' class='modelDialogInput' style='width: 90%;' /><br />\n" +
        "            <div class='modelInfoDialogLabel'>trackbacks</div>\n" +
        "            <div>\n" +
        "                <div class='hrefLabel'>href</div><input id='txtLinkHref' class='modelDialogInput' />\n" +
        "                <div class='hrefLabel'>label</div><input id='txtLinkLabel' class='modelDialogInput' onblur='addHrefToExternalLinks()' />\n" +
        "                <span class='addLinkIcon' onclick='addHrefToExternalLinks()'>+</span>\n" +
        "            </div>\n" +
        "            <div id='externalLinks' class='trackbackLinksArea'></div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "    <div id='modelInfoViewOnlyArea' class='displayHidden'>\n" +
        "        <div class='viewOnlyMessage'>If you you know who this is Please 'Add Info'</div>\n" +
        "        <div class='viewOnlyMessage clickable' onclick='IamThisModel()'>Is this you?  </div>\n" +
        "        <a class='dialogEditButton' href='javascript:IdentifyPoser()'>Add Info</a>\n" +
        "    </div>\n" +
        "    <a id='modelInfoEdit' class='dialogEditButton' href='javascript:toggleMode()'>Save</a>\n" +
        "</div>\n");
}

function showReadOnlyModelInfoDialogHtml() {
    $('#modelInforDialogContainer').html(
        "<div id='folderCategoryDialog' class='oggleDialogWindow' title='' onmouseleave='considerClosingCategoryDialog()'>\n" +
        "    <div id='catDlgSummerNoteTextArea'></div>\n" +
        "    <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "    <div id='btnCatDlgMeta' class='folderCategoryDialogButton displayHidden' onclick='addMetaTags()'>add meta tags</div>\n" +
        "</div>\n");
}

