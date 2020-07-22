var objFolderInfo = {};

function showFolderInfoDialog(folderId, calledFrom) {
    // 11:11 2/25/19
    // 2:20 4/10/2019
    // create a new table (or row)
    // --alter table OggleBooble.ImageFolder add CatergoryDescription nvarchar(max)
    // 4/30/2019  --first use of jQuery dialog
    // 5/30/2020  removing use of jquery dialog for my own. 
    try {
        // 5/30 2010
        // how to determine folder type : if a category folder or a model album
        // if rootfolder = boobs show just the CommentText 
        // 
        //alert("getFolderDetails: " + folderId);
        getFolderInfo(folderId);

        objFolderInfo.Id = folderId;
        $('#imagePageLoadingGif').show();
        $('#draggableDialogContents').html(folderDialogHtml());
        $('#modelInfoDetails').hide();
        $('#btnCatDlgCancel').hide();
        $('#btnCatDlgMeta').hide();
        $('#draggableDialog').css("min-width", 680);
        $('#draggableDialog').mouseleave(function () {
            if ($('#btnCatDlgEdit').html() === "Edit") {
                dragableDialogClose();
            }
        });
        //.ogContextMenu
        $('#draggableDialog').css("top", $('.oggleHeader').height() - 50);
        $('#draggableDialog').css("left", -350);
        $('#summernoteContainer').summernote({
            toolbar: "none",
            height: "200px", 
            dialogsInBody: true
        });
        $('#summernoteContainer').summernote('disable');
        $(".note-editable").css('font-size', '16px');
        $('#editablePoserDetails').hide();
        if (typeof pause === 'function')
            pause();
        reportEvent("SMD", calledFrom, "detail", folderId);
    }
    catch (e) {
        $('#imagePageLoadingGif').hide();
        logError("CAT", folderId, e, "showFolderInfoDialog");
    }
}

function setReadonlyFields() {
    $('#readOnlyFolderName').html(objFolderInfo.FolderName);
    $('#readOnlyBorn').html(isNullorUndefined(objFolderInfo.Birthday) ? "_ " : dateString(objFolderInfo.Birthday));
    $('#readOnlyHomeCountry').html(isNullorUndefined(objFolderInfo.HomeCountry) ? " " : objFolderInfo.HomeCountry);
    $('#readOnlyHometown').html(isNullorUndefined(objFolderInfo.HomeTown) ? " " : objFolderInfo.HomeTown);
    $('#readOnlyBoobs').html(isNullorUndefined(objFolderInfo.FakeBoobs) ? 0 : objFolderInfo.FakeBoobs ? "fake" : "real");
    $('#readOnlyMeasurements').html(isNullorUndefined(objFolderInfo.Measurements) ? " " : objFolderInfo.Measurements);
}

function getFolderInfo(folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/CatFolder/GetFolderInfo?folderId=" + folderId,
        success: function (rtnFolderInfo) {
            $('#imagePageLoadingGif').hide();
            if (rtnFolderInfo.Success === "ok") {
                objFolderInfo = rtnFolderInfo;
                $('#oggleDialogTitle').html(rtnFolderInfo.FolderName);
                $('#modelDialogThumbNailImage').attr("src", rtnFolderInfo.FolderImage);
                $('#txtFolderName').val(rtnFolderInfo.FolderName);
                $('#txtBorn').val(dateString(rtnFolderInfo.Birthday));
                $('#txtHomeCountry').val(rtnFolderInfo.HomeCountry);
                $('#txtHometown').val(rtnFolderInfo.HomeTown);
                $('#txtBoobs').val(((rtnFolderInfo.FakeBoobs) ? "fake" : "real"));
                $('#txtMeasurements').val(rtnFolderInfo.Measurements);
                setReadonlyFields();
                //$('#txtStatus').val(rtnFolderInfo.LinkStatus);
                $("#summernoteContainer").summernote("code", rtnFolderInfo.FolderComments);
                $('#imagePageLoadingGif').hide();
                $("#draggableDialog").fadeIn();

                //determine view
                //alert("rtnFolderInfo.FolderType: " + rtnFolderInfo.FolderType);
                //$('#aboveImageContainerMessageArea').html("aFolderType: " + rtnFolderInfo.FolderType);

                switch (rtnFolderInfo.FolderType) {
                    case "singleModelGallery":
                    case "singleModelFolderCollection":
                    case "singleModelCollection":
                        $('#modelInfoDetails').show();
                        break;
                    case "assorterdFolderCollection":
                    case "assorterdImagesCollection":
                    case "assorterdImagesGallery":
                        $('#modelInfoDetails').hide();
                        break;
                }
            }
            else {
                $('#imagePageLoadingGif').hide();
                //showMyAlert("unable to show folder info");
                logError("BUG", folderId, rtnFolderInfo.Success, "getFolderDetails");
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            if (!checkFor404("getFolderDetails")) {
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getFolderDetails");
            }
        }
    });
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
    //$('#txtBoobs').val(((rtnFolderInfo.FakeBoobs) ? "fake" : "real"));
    //"            <select id='selBoobs' class='boobDropDown'>\n" +
    //"               <option value=0>Real</option>\n" +
    //"               <option value=1>Fake</option>\n" +

    $('#editablePoserDetails').show();
    $('#readonlyPoserDetails').hide();

    $('#btnCatDlgEdit').html("Save");
    $('#summernoteContainer').summernote('enable');
    $('#summernoteContainer').summernote("destroy");
    $('#summernoteContainer').summernote({
        toolbar: [['codeview']],
        height: "200"
    });

    //$('#summernoteContainer').summernote({ toolbar: [['codeview']] });
    $(".note-editable").css('font-size', '16px');

    $("#txtBorn").datepicker();
    //$('#selBoobs').val(objFolderInfo.FakeBoobs ? 1 : 0).change();

    $('#btnCatDlgCancel').show();
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
                awardCredits("FIE", objFolderInfo.Id);
                //$('#btnCatDlgMeta').hide();
                $('#btnCatDlgCancel').hide();
                setReadonlyFields();
                $('#summernoteContainer').summernote("destroy");
                $('#summernoteContainer').summernote('disable');
                $(".note-editable").css('font-size', '16px');
                $('#summernoteContainer').summernote({
                    toolbar: "none",
                    height: "200"
                });
                $('#editablePoserDetails').hide();
                $('#readonlyPoserDetails').show();
                setTimeout(function () { $('#btnCatDlgEdit').html("Edit") }, 400);
            }
            else {
                logError("BUG", objFolderInfo.Id, success, "saveFolderDialog");
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

function cancelEdit() {
    $('#btnCatDlgEdit').html("Edit");
    $('#btnCatDlgCancel').hide();
    $('#editablePoserDetails').hide();
    $('#readonlyPoserDetails').show();

    $('#summernoteContainer').summernote("destroy"); // needed to reset toolbar
    $('#summernoteContainer').summernote('disable');
    $("#summernoteContainer").summernote("code", objFolderInfo.CommentText); // reload unedited to cancel changes
    $(".note-editable").css('font-size', '16px');
    $(".modelDialogInput").prop('readonly', true);;
    $('#summernoteContainer').summernote({
        toolbar: "none",
        height: "200"
    });

}

function addMetaTags() {

    //openMetaTagDialog(categoryFolderId);
}

/////////////////////////////////////////////////////////////////////////////////

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
    objFolderInfo.FolderName = $('#txtFolderName').val();
    $('#modelInfoDialog').dialog('option', 'title', objFolderInfo.FolderName);
    objFolderInfo.Born = $('#txtBorn').val();
    objFolderInfo.Nationality = $('#txtNationality').val();
    objFolderInfo.Measurements = $('#txtMeasurements').val();
    objFolderInfo.Boobs = $('#selBoobs').val();
    objFolderInfo.CommentText = $('#modelInfoDialogComment').summernote('code');
    objFolderInfo.ExternalLinks = $('#externalLinks').summernote('code');
    objFolderInfo.LinkStatus = $('#txtStatus').val();
    return true;
}

function createPosersIdentifiedFolder() {
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
                                logError("BUG", defaultParentFolder, moveImageSuccessModel.Success, "createPosersIdentifiedFolder/MoveImage");
                        },
                        error: function (jqXHR) {
                            var errorMessage = getXHRErrorDetails(jqXHR);
                            if (!checkFor404("createPosersIdentifiedFolder/MoveImage")) 
                                logError("XHR", defaultParentFolder, getXHRErrorDetails(jqXHR), "createPosersIdentifiedFolder/MoveImage");
                        }
                    });
                }
                else 
                    logError("BUG", defaultParentFolder, successModel.Success, "createPosersIdentifiedFolder");
            },
            error: function (jqXHR) {
                if (!checkFor404("createPosersIdentifiedFolder")) 
                    logError("XHR", defaultParentFolder , getXHRErrorDetails(jqXHR), "createPosersIdentifiedFolder");
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
            url: settingsArray.ApiServer + "api/FolderDetail/AddUpdate",
            data: objFolderInfo,
            success: function (success) {
                if (success === "ok") {
                    displayStatusMessage("ok", "Model info updated");
                }
                else {
                    logError("BUG", objFolderInfo.Id, success, "updateFolderDetail");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("updateFolderDetail")) 
                    logError("XHR", objFolderInfo.Id, getXHRErrorDetails(jqXHR), "updateFolderDetail");
            }
        });
    }
}

function IamThisModel() {
    alert("IamThisModel clicked");

}

function oldModelInfoDialogHtml() {
        //"        <div class='modelInfoDialogLabel'>comment</div>\n" +
        //"        <div id='modelInfoDialogCommentContainer'>\n" +
        //"            <div id='modelInfoDialogComment' class='modelInfoCommentArea'></div>\n" +
        //"        </div>\n" +
        //"        <div id='modelInfoDialogTrackBack'>\n" +
        //"            <div class='modelInfoDialogLabel'>status</div><input id='txtStatus' class='modelDialogInput' style='width: 90%;' /><br />\n" +
        //"            <div class='modelInfoDialogLabel'>trackbacks</div>\n" +
        //"            <div>\n" +
        //"                <div class='hrefLabel'>href</div><input id='txtLinkHref' class='modelDialogInput' />\n" +
        //"                <div class='hrefLabel'>label</div><input id='txtLinkLabel' class='modelDialogInput' onblur='addHrefToExternalLinks()' />\n" +
        //"                <span class='addLinkIcon' onclick='addHrefToExternalLinks()'>+</span>\n" +
        //"            </div>\n" +
        //"            <div id='externalLinks' class='trackbackLinksArea'></div>\n" +
        //"        </div>\n" +
        //"    </div>\n" +
        //"    <a id='modelInfoEdit' class='dialogEditButton' href='javascript:toggleMode()'>Save</a>\n" +
        //"</div>\n"
}

function showUnknownModelDialog(pLinkId, imgSrc) {
    $('#oggleDialogTitle').html("Unknown Poser");
    $('#draggableDialogContents').html(
        "<div class='flexContainer'>" +
        "   <div class='floatRight'>" +
        "          <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
        "   </div>" +
        "   <div class='floatLeft'>" +
        "       <div>If you you know who this is<br/>please <a class='dialogEditButton' href='javascript:IamThisModel()'>identify poser</a></div>\n" +
        "       <br/>" +
        "       <a class='dialogEditButton' href='javascript:IamThisModel()'>I am in this image</a>\n" +
        "   </div>" +
        "</div>").show();

    $('#draggableDialog').css("top", $('.oggleHeader').height() - 50);
    $('#draggableDialog').css("left", -350);
    $('#draggableDialog').css("min-width", 470);
    $('#draggableDialog').fadeIn();
    $('#draggableDialog').mouseleave(function () { dragableDialogClose(); });
}

function addHrefToExternalLinks() {
    alert("addHrefToExternalLinks: " + $('#txtLinkHref').val());
    $('#externalLinks').summernote('pasteHTML', "<a href=" + $('#txtLinkHref').val() + " target = '_blank'>" + $('#txtLinkLabel').val() + "</a><br/>");
    addTrackback($('#txtLinkHref').val());
    $('#txtLinkHref').val('');
    $('#txtLinkLabel').val('');
}

function showTrackbackDialog() {
    $('#btnCatDlgEdit').html("pause");

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
        "       <div id='btnTbDlgDelete' class='folderCategoryDialogButton displayHidden' onclick='tbAddEdit()'>delete</div>\n" +
        "       <div class='folderCategoryDialogButton' onclick='$('#trackBackDialog').hide()'>Cancel</div>\n" +
        "   </div>\n" +
        "</div>");

    $("#trackBackDialog").css("top", 105);
    $("#trackBackDialog").draggable().resizable();

    $.each(objFolderInfo.TrackBackItems, function (idx, obj) {
        $('#ulExistingLinks').append("<li class='clickable' onclick='loadTbForEdit(" + idx + ")' >" + obj.SiteCode + " - " + obj.LinkStatus + "</li>");
    });
    $("#trackBackDialog").show();
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

    var trackBackItem = {
        PageId: objFolderInfo.FolderId,
        SiteCode: $('#selTrackBackLinkSite').val(),
        Href: $('#txtTrackBackLink').val(),
        LinkStatus: $('#txtTrackBackStatus').val()
    };

    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "api/Links/AddEditTrackBackLink",
        data: trackBackItem,
        success: function (success) {
            if (success === "ok") {
               if(status=== "submitted")
                    displayStatusMessage("ok", "trackback link added");
                else
                    displayStatusMessage("ok", "trackback link updated");
                $('#ulExistingLinks').html("");
                //$.each(objFolderInfo.TrackBackItems, function (idx, obj) {
                //    $('#ulExistingLinks').append("<li class='clickable' onclick='loadTbForEdit(" + idx + ")' >" + obj.SiteCode + " - " + obj.LinkStatus + "</li>");
                //});

                //$('#btnTbDlgAddEdit').html("add");
                //$('#btnTbDlgDelete').hide();
                $('#selTrackBackLinkSite').val("");
                $('#txtTrackBackStatus').val("");
                $('#txtTrackBackLink').val("");
            }
            else {
                logError("BUG", folderId, success, "addTrackback");
            }
        },
        error: function (jqXHR) {
            if (!checkFor404("addTrackback"))
                logError("XHR", folderId, getXHRErrorDetails(jqXHR), "addTrackback");
        }
    });
}

function IdentifyPoser() {
    $('#modelInfoEdit').show().html("Add");
    $('#modelInfoEditArea').show();
    $('#modelInfoViewOnlyArea').hide();
}

function folderDialogHtml() {
    return "<div>\n" +
        "    <div id='modelInfoDetails' class='flexContainer'>\n" +
        "        <div class='poserLabels' class='floatLeft'>\n" +
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
        "            </select>\n"+
        "            <input id='txtMeasurements'/>\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <img id='modelDialogThumbNailImage' src='/Images/redballon.png' class='modelDialogImage' />\n" +
        "        </div>\n" +
        "    </div>\n" +
        "    <div class='modelInfoCommentArea'>\n" +
        "       <textarea id='summernoteContainer'></textarea>\n" +
        "    </div>\n" +
        "    <div class='folderDialogFooter'>\n" +
        "        <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "        <div id='btnCatDlgCancel' class='folderCategoryDialogButton displayHidden' onclick='cancelEdit()'>Cancel</div>\n" +
        "        <div id='btnCatDlgMeta' class='folderCategoryDialogButton' onclick='addMetaTags()'>add meta tags</div>\n" +
        "        <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n" +
        "    </div>\n" +
        "    <div id='trackBackDialog' class='floatingDialogBox'></div>\n" +
        "</div>\n";
}
