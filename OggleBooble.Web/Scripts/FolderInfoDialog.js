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
        getFolderDetails(folderId);

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
        if (document.domain === 'localhost')
            alert("showFolderInfoDialog catch: " + e);
        else
            logError({
                VisitorId: getCookieValue("VisitorId"),
                ActivityCode: "CAT",
                Severity: 12,
                ErrorMessage: "showFolderInfoDialog catch: " + e,
                CalledFrom: "showFolderInfoDialog"
            });
        //sendEmailToYourself("javascript catch in FolderInfoDialog.js showCategoryDialog", "get NudeModelInfo catch: " + e);
    }
}

function setReadonlyFields() {
    $('#readOnlyFolderName').html(isNullorUndefined(objFolderInfo.FolderName) ? " " : objFolderInfo.FolderName);
    $('#readOnlyBorn').html(isNullorUndefined(objFolderInfo.Birthday) ? "_ " : dateString(objFolderInfo.Birthday));
    $('#readOnlyHomeCountry').html(isNullorUndefined(objFolderInfo.HomeCountry) ? "x " : objFolderInfo.HomeCountry);
    $('#readOnlyHometown').html(isNullorUndefined(objFolderInfo.HomeTown) ? "x " : objFolderInfo.HomeTown);
    $('#readOnlyBoobs').html(isNullorUndefined(objFolderInfo.FakeBoobs) ? "x " : objFolderInfo.FakeBoobs ? "fake" : "real");
    $('#readOnlyMeasurements').html(isNullorUndefined(objFolderInfo.Measurements) ? "x " : objFolderInfo.Measurements);
}

function getFolderDetails(folderId) {
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
                $('#aboveImageContainerMessageArea').html("aFolderType: " + rtnFolderInfo.FolderType);

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
                showMyAlert("unable to show folder info");
                if (document.domain === 'localhost')
                    alert("getFolderDetails: " + rtnFolderInfo.Success);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "AJQ",
                        Severity: 2,
                        ErrorMessage: rtnFolderInfo.Success,
                        CalledFrom: "getFolderDetails"
                    });
            }
        },
        error: function (jqXHR) {
            $('#imagePageLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("getFolderDetails")) {
                if (document.domain === 'localhost')
                    alert("getFolderDetails: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "getFolderDetails"
                    });
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
    $('#selBoobs').val(objFolderInfo.FakeBoobs ? 1 : 0).change();

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
    objFolderInfo.FakeBoobs = $('#selBoobs').val();
    objFolderInfo.FolderComments = $('#summernoteContainer').summernote('code');
    //folderInfo.ExternalLinks = $('#externalLinks').summernote('code');
    //folderInfo.LinkStatus = $('#txtStatus').val();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FolderDetail/Update",
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
                //sendEmailToYourself("jquery fail in FolderCategory.js saveCategoryDialogText", success);
                if (document.domain === 'localhost')
                    alert("saveFolderDialog: " + success);
                else
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
            if (!checkFor404("saveFolderDialog")) {
                if (document.domain === 'localhost')
                    alert("saveFolderDialog: " + errorMessage);
                else
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
                                if (document.domain === 'localhost')
                                    alert("createPosersIdentifiedFolder/MoveImage: " + moveImageSuccessModel.Success);
                                else
                                    logError({
                                        VisitorId: getCookieValue("VisitorId"),
                                        ActivityCode: "AJQ",
                                        Severity: 2,
                                        ErrorMessage: moveImageSuccessModel.Success,
                                        CalledFrom: "createPosersIdentifiedFolder/MoveImage"
                                    });
                            }
                        },
                        error: function (jqXHR) {
                            var errorMessage = getXHRErrorDetails(jqXHR);
                            if (!checkFor404("createPosersIdentifiedFolder/MoveImage")) {
                                if (document.domain === 'localhost')
                                    alert("createPosersIdentifiedFolder/MoveImage: " + errorMessage);
                                else
                                    logError({
                                        VisitorId: getCookieValue("VisitorId"),
                                        ActivityCode: "XHR",
                                        Severity: 2,
                                        ErrorMessage: errorMessage,
                                        CalledFrom: "createPosersIdentifiedFolder/MoveImage"
                                    });
                                //sendEmailToYourself("XHR ERROR in Transitions.html createPosersIdentifiedFolder", "/api/MoveImage/MoveImage Message: " + errorMessage);
                            }
                        }
                    });
                }
                else {
                    if (document.domain === 'localhost')
                        alert("getrtnFolderInfo: " + successModel.Success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "AJQ",
                            Severity: 2,
                            ErrorMessage: successModel.Success,
                            CalledFrom: "createPosersIdentifiedFolder"
                        });
                    //sendEmailToYourself("error in ModelInfo.js", "CreateVirtualFolder: " + successModel.Success);
                    //alert("CreateVirtualFolder: " + successModel.Success);
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("createPosersIdentifiedFolder")) {
                    if (document.domain === 'localhost')
                        alert("createPosersIdentifiedFolder: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 2,
                            ErrorMessage: errorMessage,
                            CalledFrom: "createPosersIdentifiedFolder"
                        });
                    //sendEmailToYourself("XHR ERROR in Transitions.html createPosersIdentifiedFolder",
                      //  "/api/FtpDashBoard/CreateFolder?parentId=" + defaultParentFolder + "&newFolderName=" + FolderDetailModel.FolderName + " Message: " + errorMessage);
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
                    if (document.domain === 'localhost')
                        alert("createPosersIdentifiedFolder: " + success);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "AJQ",
                            Severity: 2,
                            ErrorMessage: success,
                            CalledFrom: "updateFolderDetail"
                        });
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("updateFolderDetail")) {
                    if (document.domain === 'localhost')
                        alert("updateFolderDetail: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 2,
                            ErrorMessage: errorMessage,
                            CalledFrom: "updateFolderDetail"
                        });
                    //sendEmailToYourself("XHR ERROR in ModelInfoDialog.js updateFolderDetail", "/api/ImageCategoryDetail Message: " + errorMessage);
                }
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

function showUnknownModelDialog(pLinkId) {

    $('#draggableDialog').css("top", $('.oggleHeader').height() - 50);
    $('#draggableDialog').css("left", -350);
    $('#draggableDialog').css("min-width", 470);
    $('#oggleDialogTitle').html("Unknown Poser");
    $('#draggableDialogContents').html(
        "    <div>If you you know who this is Please <span class='clickable' onclick='IdentifyPoser()'Add Info</span></div>\n" +
        "    <div class='clickable' onclick='IamThisModel()'>Is this you? </div>\n" +
        "    <a class='dialogEditButton' href='javascript:IdentifyPoser()'>Add Info</a>\n").show();
    $('#draggableDialog').fadeIn();
    //$('#draggableDialog').mouseleave(function () { dragableDialogClose(); });
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
                            alert("addTrackback: " + success);
                        else
                            logError({
                                VisitorId: getCookieValue("VisitorId"),
                                ActivityCode: "AJQ",
                                Severity: 2,
                                ErrorMessage: success,
                                CalledFrom: "addTrackback"
                            });
                    }
                }
            },
            error: function (jqXHR) {
                var errorMessage = getXHRErrorDetails(jqXHR);
                if (!checkFor404("addTrackback")) {
                    if (document.domain === 'localhost')
                        alert("addTrackback: " + errorMessage);
                    else
                        logError({
                            VisitorId: getCookieValue("VisitorId"),
                            ActivityCode: "XHR",
                            Severity: 2,
                            ErrorMessage: errorMessage,
                            CalledFrom: "addTrackback"
                        });
                    //sendEmailToYourself("XHR ERROR IN addTrackback", "folderId=" + folderId + "<br/>Message : " + errorMessage);
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
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: success,
                        CalledFrom: "updateTrackback"
                    });
            }
        },
        error: function (jqXHR) {
            var errorMessage = getXHRErrorDetails(jqXHR);
            if (!checkFor404("updateTrackback")) {
                if (document.domain === 'localhost')
                    alert("updateTrackback: " + errorMessage);
                else
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 2,
                        ErrorMessage: errorMessage,
                        CalledFrom: "updateTrackback"
                    });
            };
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
        "               <option value='0'>Real</option>\n" +
        "               <option value='1'>Fake</option>\n" +
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
        "    </div>\n" +
        "</div>\n";
}
