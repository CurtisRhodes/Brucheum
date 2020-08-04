var objFolderInfo = {}, allowDialogClose = true;

function showFolderInfoDialog(folderId, calledFrom) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog
    // 5/30/2020  removing use of jquery dialog for my own. 
    // how to determine folder type : if a category folder or a model album
    // if rootfolder = boobs show just the CommentText 
    // 7/24/2020
    // added a new field called FolderType

    if (typeof pause === 'function') pause();
    //alert("showFolderInfoDialog(folderId: " + folderId + ", calledFrom: " + calledFrom + ")");
    showBasicFolderInfoDialog();

    try {  // GetQuickFolderInfo
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/FolderDetail/GetQuickFolderInfo?folderId=" + folderId,
            success: function (folderInfo) {
                $('#imagePageLoadingGif').hide();
                if (folderInfo.Success === "ok") {
                    objFolderInfo.FolderId = folderId;
                    $("#centeredDialogTitle").html(folderInfo.FolderName);
                    $("#summernoteContainer").summernote("code", folderInfo.FolderComments);

                    //$('#aboveImageContainerMessageArea').html("aFolderType: " + rtnFolderInfo.FolderType);
                    //multiModel	488
                    //multiFolder	394
                    switch (folderInfo.FolderType) {
                        case "singleModel":
                        case "singleParent":
                            showFullModelDetails(folderId);
                            break;
                        case "singleChild":
                            showFullModelDetails(folderInfo.Parent);
                            break;
                    }

                    logEvent("SMD", folderId, calledFrom, "folder type: " + folderInfo.FolderType);
                }
                else logError("AJX", folderId, folderInfo.Success, "GetQuickFolderInfo");
            },
            error: function (jqXHR) {
                if (!checkFor404("getFolderDetails")) logError("XHR", folderId, getXHRErrorDetails(jqXHR), "GetQuickFolderInfo");
            }
        });
    }
    catch (e) {
        $('#imagePageLoadingGif').hide();
        logError("CAT", folderId, e, "showFolderInfoDialog");
    }
}

function showBasicFolderInfoDialog() {
    $("#centeredDialogTitle").html("loading");
    $("#centeredDialogContents").html(
        "<div>\n" +
        "    <div id='modelInfoDetails' class='flexContainer'>\n" +
        "    </div>\n" +
        "    <div class='modelInfoCommentArea'>\n" +
        "       <textarea id='summernoteContainer'></textarea>\n" +
        "    </div>\n" +
        "    <div id='folderInfoDialogFooter' class='folderDialogFooter'>\n" +
        "        <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "        <div id='btnCatDlgDone' class='folderCategoryDialogButton' onclick='doneEditing()'>Done</div>\n" +
        "        <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n" +
        "    </div>\n" +
        "    <div id='trackBackDialog' class='floatingDialogBox'></div>\n" +
        "</div>\n");

    //$(".note-editable").css('font-size', '16px');
    //$('#centeredDialogContainer').css("top", 111);
    //$('#centeredDialogContainer').css("left", -350);
    $("#btnCatDlgDone").hide();
    $("#btnCatDlgLinks").hide();
    $('#summernoteContainer').summernote({
        toolbar: "none",
    //    min-height: "200px"
    });
    $('#summernoteContainer').summernote('disable');
    $(".note-editable").css('font-size', '16px');
    $(".note-editable").css('min-height', '186px');
    if (!isLoggedIn()) {
        ///showMyAlert("you must be logged in to edit folder comments");
        $("#btnCatDlgEdit").hide();
    }
    $('#centeredDialogContainer').mouseleave(function () {
        if (allowDialogClose) dragableDialogClose();
    });
    $('#centeredDialogContainer').draggable().fadeIn();
}

function showFullModelDetails(folderId) {
    $('#imagePageLoadingGif').show();
    $("#modelInfoDetails").html(modelInfoDetailHtml());
    $('#readonlyPoserDetails').show();
    $('#editablePoserDetails').hide();

    //$('#btnCatDlgCancel').hide();
    //$('#btnCatDlgMeta').hide();

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/FolderDetail/GetFullFolderInfo?folderId=" + folderId,
        success: function (folderInfo) {
            $('#imagePageLoadingGif').hide();
            if (folderInfo.Success === "ok") {
                objFolderInfo = folderInfo;
                $('#centeredDialogTitle').html(folderInfo.FolderName);
                $('#modelDialogThumbNailImage').attr("src", folderInfo.FolderImage);
                $('#txtFolderName').val(folderInfo.FolderName);
                $('#txtBorn').val(dateString(folderInfo.Birthday));
                $('#txtHomeCountry').val(folderInfo.HomeCountry);
                $('#txtHometown').val(folderInfo.HomeTown);
                $('#txtBoobs').val(((folderInfo.FakeBoobs) ? "fake" : "real"));
                $('#txtMeasurements').val(folderInfo.Measurements);
                setReadonlyFields();
                $("#btnCatDlgLinks").show();
                $("#summernoteContainer").summernote("code", folderInfo.FolderComments);
            }
            else {
                $('#imagePageLoadingGif').hide();
                logError("AJX", folderId, folderInfo.Success, "showFullModelDetails");
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("getFolderDetails")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "showFullModelDetails");
            }
        }
    });
}

function modelInfoDetailHtml() {

    if (isLoggedIn()) {
        $('#folderInfoDialogFooter').append(
            "        <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n");
    }
    //    "        <div id='btnCatDlgMeta' class='folderCategoryDialogButton' onclick='addMetaTags()'>add meta tags</div>\n" +

    return "<div class='poserLabels' class='floatLeft'>\n" +
        "            <div>name</div>\n" +
        "            <div>home country</div>\n" +
        "            <div>hometown</div>\n" +
        "            <div>born</div>\n" +
        "            <div>boobs</div>\n" +
        "            <div>figure</div>\n" +
        "        </div>\n" +
        "        <div id='readonlyPoserDetails' class='poserDetails floatLeft'>\n" +
        "            <div id='readOnlyFolderName'></div>\n" +
        "            <div id='readOnlyHomeCountry'></div>\n" +
        "            <div id='readOnlyHometown'></div>\n" +
        "            <div id='readOnlyBorn'></div>\n" +
        "            <div id='readOnlyBoobs'></div>\n" +
        "            <div id='readOnlyMeasurements'></div>\n" +
        "        </div>\n" +
        "        <div id='editablePoserDetails' class='editablePoserDetails floatLeft'>\n" +
        "            <input id='txtFolderName'/>\n" +
        "            <input id='txtHomeCountry'/>\n" +
        "            <input id='txtHometown'/>\n" +
        "            <input id='txtBorn'/>\n" +
        "            <select id='selBoobs' class='boobDropDown'>\n" +
        "               <option value=0>Real</option>\n" +
        "               <option value=1>Fake</option>\n" +
        "            </select>\n" +
        "            <input id='txtMeasurements'/>\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <img id='modelDialogThumbNailImage' src='/Images/redballon.png' class='modelDialogImage' />\n" +
        "        </div>\n" +
        "    </div>\n" +
        "    <div id='trackBackDialog' class='floatingDialogBox'></div>\n";
}

// ADD EDIT FOLDER INFO
function setReadonlyFields() {
    $('#readOnlyFolderName').html(objFolderInfo.FolderName);
    $('#readOnlyBorn').html(isNullorUndefined(objFolderInfo.Birthday) ? "_ " : dateString(objFolderInfo.Birthday));
    $('#readOnlyHomeCountry').html(isNullorUndefined(objFolderInfo.HomeCountry) ? " " : objFolderInfo.HomeCountry);
    $('#readOnlyHometown').html(isNullorUndefined(objFolderInfo.HomeTown) ? " " : objFolderInfo.HomeTown);
    $('#readOnlyBoobs').html(isNullorUndefined(objFolderInfo.FakeBoobs) ? 0 : objFolderInfo.FakeBoobs ? "fake" : "real");
    $('#readOnlyMeasurements').html(isNullorUndefined(objFolderInfo.Measurements) ? " " : objFolderInfo.Measurements);
}
function editFolderDialog() {
    if ($('#btnCatDlgEdit').html() === "Save") {
        saveFolderDialog();
        return;
    }
    allowDialogClose = false;
    $('#editablePoserDetails').show();
    $('#readonlyPoserDetails').hide();
    $('#btnCatDlgEdit').html("Save");
    $('#summernoteContainer').summernote("destroy");
    $('#summernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "200"
    });
    $('#summernoteContainer').focus();
    $('#summernoteContainer').summernote('focus');
    //$(".note-editable").css('font-size', '16px');
    //alert("summernote('code'):" + $('#summernoteContainer').summernote('code'))

    $("#txtBorn").datepicker();
    //$('#selBoobs').val(objFolderInfo.FakeBoobs ? 1 : 0).change();
}
function saveFolderDialog() {
    $('#imagePageLoadingGif').show();
    // LOAD GETS
    // alternamtive folderName $('#txtFolderName').val(rtnFolderInfo.FolderName);
    objFolderInfo.Birthday = $('#txtBorn').val();
    objFolderInfo.HomeCountry = $('#txtHomeCountry').val();
    objFolderInfo.HomeTown = $('#txtHometown').val();
    objFolderInfo.Measurements = $('#txtMeasurements').val();
    objFolderInfo.FakeBoobs = $('#selBoobs').val() == 1;
    objFolderInfo.FolderComments = $('#summernoteContainer').summernote('code');
    //folderInfo.ExternalLinks = $('#externalLinks').summernote('code');
    //folderInfo.LinkStatus = $('#txtStatus').val();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FolderDetail/AddUpdate",
        data: objFolderInfo,
        success: function (success) {
            $('#imagePageLoadingGif').fadeOut();
            if (success === "ok") {
                displayStatusMessage("ok", "category description updated");
                //awardCredits("FIE", objFolderInfo.Id);
                $("#btnCatDlgDone").show();
                $('#summernoteContainer').focus();
                $('#summernoteContainer').summernote('focus');
                $('#summernoteContainer').summernote('focus');
            }
            else {
                logError("AJX", objFolderInfo.Id, success, "saveFolderDialog");
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("saveFolderDialog")) {
                logError("XHR", objFolderInfo.Id, getXHRErrorDetails(jqXHR), "saveFolderDialog");
            }
        }
    });
}
function doneEditing() {
    allowDialogClose = true;
    $("#btnCatDlgDone").hide();
    $('#btnCatDlgEdit').html("Edit");

    $('#editablePoserDetails').hide();
    $('#readonlyPoserDetails').show();
    $('#summernoteContainer').summernote("destroy");
    $('#summernoteContainer').summernote({
        toolbar: "none",
        height: "200"
    });
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
function loadGets() {
    objFolderInfo.FolderName = $('#txtFolderName').val();
    $('#modelInfoDialog').dialog('option', 'title', objFolderInfo.FolderName);
    objFolderInfo.Born = $('#txtBorn').val();
    objFolderInfo.Nationality = $('#txtNationality').val();
    objFolderInfo.Measurements = $('#txtMeasurements').val();
    objFolderInfo.Boobs = $('#selBoobs').val();
    objFolderInfo.CommentText = $('#modelInfoDialogComment').summernote('code');
    objFolderInfo.ExternalLinks = $('#externalLinks').summernote('code');
    objFolderInfo.LinkStatus = $('#txtStatus').val();
}

function updateFolderDetail() {
    loadGets();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "api/FolderDetail/AddUpdate",
        data: objFolderInfo,
        success: function (success) {
            if (success === "ok") {
                displayStatusMessage("ok", "Model info updated");
            }
            else {
                logError("AJX", objFolderInfo.Id, success, "updateFolderDetail");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("updateFolderDetail"))
                logError("XHR", objFolderInfo.Id, getXHRErrorDetails(jqXHR), "updateFolderDetail");
        }
    });
}

// TRACKBACK DIALOG
function showTrackbackDialog() {
    $('#btnCatDlgEdit').html("pause");
    allowDialogClose = false;
    $("#trackBackDialog").html(
        "<div>\n" +
        "   <div id='bb'class='oggleDialogHeader'>" +
        "       <div id='cc' class='oggleDialogTitle'>Trackbacks</div>" +
        "       <div id='ddd' class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='$(\"#trackBackDialog\").hide()'/></div>\n" +
        "   </div>\n" +
        "   <div>link <input id='txtTrackBackLink'  class='roundedInput' style='width:85%' /></div>" +
        "   <div>site <select id='selTrackBackLinkSite' class='roundedInput'>\n" +
        "          <option value='BAB'>babepedia</option>\n" +
        "          <option value='FRE'>freeones</option>\n" +
        "       </select></div>\n" +
        "   <div>status<input id='txtTrackBackStatus' class='roundedInput' /></div>" +
        "   <div class='tbResultsContainer'>" +
        "       <ul id='ulExistingLinks'></ul>" +
        "   </div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnTbDlgAddEdit' class='folderCategoryDialogButton' onclick='tbAddEdit()'>add</div>\n" +
        "       <div id='btnTbDlgDelete' class='folderCategoryDialogButton displayHidden' onclick='tbDelete()'>delete</div>\n" +
        "       <div class='folderCategoryDialogButton' onclick='$(\"#trackBackDialog\").hide()'>Cancel</div>\n" +
        "   </div>\n" +
        "</div>");

    $("#trackBackDialog").css("top", 150);
    $("#trackBackDialog").css("left", -250);
    $("#trackBackDialog").show();
    loadTrackBackItems();
}
function loadTrackBackItems() {
    $("#trackBackDialog").draggable();  //.resizable();
    $.each(objFolderInfo.TrackBackItems, function (idx, obj) {
        $('#ulExistingLinks').append("<li class='clickable' onclick='loadTbForEdit(" + idx + ")' >" + obj.SiteCode + " - " + obj.LinkStatus + "</li>");
    });
}

function loadTbForEdit(idx) {
    let selectedLink = objFolderInfo.TrackBackItems[idx];
    $('#selTrackBackLinkSite').val(selectedLink.SiteCode);
    $('#txtTrackBackStatus').val(selectedLink.LinkStatus);
    $('#txtTrackBackLink').val(selectedLink.Href);
    $('#btnTbDlgAddEdit').html("edit");
    $('#btnTbDlgDelete').show();
}
function tbAddEdit() {
    if ($('#btnTbDlgAddEdit').html() === "edit") {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/Links/AddEditTrackBackLink",
            data: {
                PageId: objFolderInfo.FolderId,
                SiteCode: $('#selTrackBackLinkSite').val(),
                Href: $('#txtTrackBackLink').val(),
                LinkStatus: $('#txtTrackBackStatus').val()
            },
            success: function (successModel) {
                if (successModel.Success === "ok") {
                    if (successModel.ReturnValue==="Insert")
                        displayStatusMessage("ok", "trackback link added");
                    else
                        displayStatusMessage("ok", "trackback link updated");

                    $('#ulExistingLinks').html("");
                    $.each(successModel.TrackBackItems, function (idx, obj) {
                        $('#ulExistingLinks').append("<li class='clickable' onclick='loadTbForEdit(" + idx + ")' >" + obj.SiteCode + " - " + obj.LinkStatus + "</li>");
                    });

                    $('#btnTbDlgAddEdit').html("add");
                    $('#selTrackBackLinkSite').val("");
                    $('#txtTrackBackStatus').val("");
                    $('#txtTrackBackLink').val("");
                    $('#btnTbDlgDelete').hide();

                }
                else logError("AJX, folderId, successModel.Success, "addTrackback");                
            },
            error: function (jqXHR) {
                if (!checkFor404("addTrackback"))
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addTrackback");
            }
        });
    }
    if ($('#btnTbDlgAddEdit').html() === "add") {
        $('#selTrackBackLinkSite').val("");
        $('#txtTrackBackStatus').val("");
        $('#txtTrackBackLink').val("");
        $('#btnTbDlgAddEdit').html("edit");
    }
}
function tbDelete() { }

////////////////////////////////

function xxcreatePosersIdentifiedFolder() {
    var defaultParentFolder = 917;
    if (validate()) {
        // step 1:  Create new Ftmp Folder
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/FtpDashBoard/CreateFolder?parentId=" + defaultParentFolder + "&newFolderName=" + objFolderInfo.FolderName,
            success: function (successModel) {
                $('#dashBoardLoadingGif').hide();
                if (successModel.Success === "ok") {
                    // step 2: Move Image 
                    displayStatusMessage("ok", "new folder created");
                    //linkId = fileName.Substring(fileName.LastIndexOf("_") + 1, 36);
                    var MoveCopyImageModel = {
                        Mode: "Archive",
                        Link: successModel.FolderImage,
                        SourceFolderId: successModel.FolderId,
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
                            else
                                logError("AJX", defaultParentFolder, moveImageSuccessModel.Success, "createPosersIdentifiedFolder/MoveImage");
                        },
                        error: function (jqXHR) {
                            var errorMessage = getXHRErrorDetails(jqXHR);
                            if (!checkFor404("createPosersIdentifiedFolder/MoveImage"))
                                logError("XHR", defaultParentFolder, getXHRErrorDetails(jqXHR), "createPosersIdentifiedFolder/MoveImage");
                        }
                    });
                }
                else
                    logError("AJX", defaultParentFolder, successModel.Success, "createPosersIdentifiedFolder");
            },
            error: function (jqXHR) {
                if (!checkFor404("createPosersIdentifiedFolder"))
                    logError("XHR", defaultParentFolder, getXHRErrorDetails(jqXHR), "createPosersIdentifiedFolder");
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

function showUnknownModelDialog(imgSrc) {
    $('#centeredDialogTitle').html("Unknown Poser");
    $('#centeredDialogContents').html(
        "<div class='flexContainer'>" +
        "   <div class='floatRight'>" +
        "          <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
        "   </div>" +

        "   <div id='unknownPoserDialog' class='floatLeft'>" +
        "       <div>If you you know who this is<br/>please <a class='dialogEditButton' href='javascript:showIdentifyPoserDialog()'>identify poser</a></div>\n" +
        "       <br/>" +
        "       <a class='dialogEditButton' href='javascript:IamThisModel()'>I am in this image</a>\n" +
        "   </div>" +

        "   <div id='identifyPoserDialog' class='floatLeft displayHidden'>\n" +
        "       <span>name</span><input id='txtPoserIdentifier class='roundedInput'/>\n" +
        "       <span>comment</span>"+
        "       <div class='modelInfoCommentArea'>\n" +
        "          <textarea id='poserSummernoteContainer'></textarea>\n" +
        "       </div>\n" +
        "   </div>" +
        "</div>" +
        "<div id='poserDialogFooter' class='folderDialogFooter'>\n" +
        "   <div id='btnPoserSave'   class='folderCategoryDialogButton' onclick='poserSave()'>save</div>\n" +
        "   <div id='btnPoserCancel' class='folderCategoryDialogButton' onclick='dragableDialogClose()'>cancel</div>\n" +
        "</div>").show();

    //$('#centeredDialogContainer').css("top", 250);
    $('#centeredDialogContainer').css("left", -350);
    $('#centeredDialogContainer').css("min-width", 470);
    $('#centeredDialogContainer').fadeIn();
    $('#centeredDialogContainer').mouseleave(function () { dragableDialogClose(); });
    $('#poserSummernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "100"
    });
    $("#btnPoserSave").hide();
    $("#btnPoserCancel").hide();
    allowDialogClose = true;
}
function IamThisModel() {
    alert("IamThisModel clicked");

}
function showIdentifyPoserDialog() {
    $("#identifyPoserDialog").show();
    $("#unknownPoserDialog").hide();
    $("#btnPoserSave").show();
    $("#btnPoserCancel").show();
    allowDialogClose = false;
}
function poserSave() {
    sendEmailToYourself("poser identified !!!", "OH MY GOD");
    showMyAlert("Thank you for your input\nYou have earned 1000 credits.");
}

function addHrefToExternalLinks() {
    alert("addHrefToExternalLinks: " + $('#txtLinkHref').val());
    $('#externalLinks').summernote('pasteHTML', "<a href=" + $('#txtLinkHref').val() + " target = '_blank'>" + $('#txtLinkLabel').val() + "</a><br/>");
    addTrackback($('#txtLinkHref').val());
    $('#txtLinkHref').val('');
    $('#txtLinkLabel').val('');
}
function addMetaTags() {

    //openMetaTagDialog(categoryFolderId);
}

