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
    //logEvent("FID", folderId, calledFrom,"");
    try {  // GetQuickFolderInfo
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/FolderDetail/GetQuickFolderInfo?folderId=" + folderId,
            success: function (folderInfo) {
                $('#albumPageLoadingGif').hide();
                if (folderInfo.Success === "ok") {
                    objFolderInfo.FolderId = folderId;
                    objFolderInfo.FolderName = folderInfo.FolderName;
                    objFolderInfo.FolderType = folderInfo.FolderType;

                    $('#txtEdtFolderName').val(folderInfo.FolderName);
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
                        //case "singleChild":
                        //    showFullModelDetails(folderInfo.Parent);
                        //    break;
                    }

                    logEvent("SMD", folderId, calledFrom, "folder type: " + folderInfo.FolderType);
                }
                else logError("AJX", folderId, folderInfo.Success, "GetQuickFolderInfo");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    }
    catch (e) {
        $('#albumPageLoadingGif').hide();
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
        "       <div id='divEdtFolderName' class='displayHidden'>folder name: <input id='txtEdtFolderName'></input></div>\n" +
        "       <textarea id='summernoteContainer'></textarea>\n" +
        "    </div>\n" +
        "    <div id='folderInfoDialogFooter' class='folderDialogFooter'>\n" +
        "        <div id='btnCatDlgEdit' class='folderCategoryDialogButton' onclick='editFolderDialog()'>Edit</div>\n" +
        "        <div id='btnCatDlgDone' class='folderCategoryDialogButton' onclick='doneEditing()'>Done</div>\n" +
        "        <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n" +
        "    </div>\n" +
        "</div>\n" +
        "<div id='trackBackDialog' class='floatingDialogBox'></div>\n");

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
        $("#btnCatDlgLinks").hide();
    }
    $('#centeredDialogContainer').mouseleave(function () {
        if (allowDialogClose) dragableDialogClose();
    });

    $('#centeredDialogContainer').css("top", 33 + $(window).scrollTop());
    //alert("top " + $('#centeredDialogContainer').offset.top);
    $('#centeredDialogContainer').draggable().fadeIn();
}

function showFullModelDetails(folderId) {
    $('#albumPageLoadingGif').show();
    $("#modelInfoDetails").html(modelInfoDetailHtml());
    $('#readonlyPoserDetails').show();
    $('#editablePoserDetails').hide();

    //$('#btnCatDlgCancel').hide();
    //$('#btnCatDlgMeta').hide();

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/FolderDetail/GetFullFolderInfo?folderId=" + folderId,
        success: function (folderInfo) {
            $('#albumPageLoadingGif').hide();
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
                $('#albumPageLoadingGif').hide();
                logError("AJX", folderId, folderInfo.Success, "show FullModelDetails");
            }
        },
        error: function (jqXHR) {
            $('#albumPageLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "show FullModelDetails")) logError("XHR", folderId, errMsg, "show FullModelDetails");
        }
    });
}

function modelInfoDetailHtml() {

    //if (isLoggedIn()) {
    //    $('#folderInfoDialogFooter').append(
    //        "        <div id='btnCatDlgLinks' class='folderCategoryDialogButton' onclick='showTrackbackDialog()'>Trackback Links</div>\n");
    //}
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
        "            <input id='txtFolderName'></input>\n" +
        "            <input id='txtHomeCountry'></input>\n" +
        "            <input id='txtHometown'></input>\n" +
        "            <input id='txtBorn'></input>\n" +
        "            <select id='selBoobs' class='boobDropDown'>\n" +
        "               <option value=0>Real</option>\n" +
        "               <option value=1>Fake</option>\n" +
        "            </select>\n" +
        "            <input id='txtMeasurements'></input>\n" +
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

    //objFolderInfo.FolderType = folderInfo.FolderType;
    $('#divEdtFolderName').show();

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
    $('#albumPageLoadingGif').show();
    // LOAD GETS
    // alternamtive folderName $('#txtFolderName').val(rtnFolderInfo.FolderName);
    objFolderInfo.FolderName = $('#txtEdtFolderName ').val(); 
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
            $('#albumPageLoadingGif').fadeOut();
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
            $('#albumPageLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
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
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
        }
    });
}

///////////////// TRACKBACK DIALOG  ////////////
function showTrackbackDialog() {
    $('#btnCatDlgEdit').html("pause");
    allowDialogClose = false;
    $("#trackBackDialog").html(
        "<div>\n" +
        "   <div id='bb'class='oggleDialogHeader'>" +
        "       <div id='cc' class='oggleDialogTitle'>Trackback Links</div>" +
        "       <div id='ddd' class='oggleDialogCloseButton'><img src='/images/poweroffRed01.png' onclick='$(\"#trackBackDialog\").hide()'/></div>\n" +
        "   </div>\n" +
        "   <div>link <input id='txtTrackBackLink'  class='roundedInput' style='width:85%'></input></div>" +
        "   <div>site <select id='selTrackBackLinkSite' class='roundedInput'>\n" +
        "          <option value='BAB'>babepedia</option>\n" +
        "          <option value='BOB'>boobpedia</option>\n" +
        "          <option value='IND'>Indexx</option>\n" +
        "          <option value='FRE'>freeones</option>\n" +
        "       </select></div>\n" +
        "   <div>status<input id='txtTrackBackStatus' class='roundedInput'></input></div>" +
        "   <div class='tbResultsContainer'>" +
        "       <ul id='ulExistingLinks'></ul>" +
        "   </div>\n" +
        "   <div class='folderDialogFooter'>\n" +
        "       <div id='btnTbDlgAddEdit' class='folderCategoryDialogButton' onclick='tbAddEdit()'>add</div>\n" +
        //"       <div id='btnTbDlgDelete' class='folderCategoryDialogButton displayHidden' onclick='tbDelete()'>delete</div>\n" +
        "       <div id='btnTbAddCancel' class='folderCategoryDialogButton' onclick='btnTbAddCancel()'>Cancel</div>\n" +
        "   </div>\n" +
        "</div>");

    $("#trackBackDialog").css("top", 150);
    $("#trackBackDialog").css("left", -550);
    $('#selTrackBackLinkSite').val("").attr('disabled', 'disabled');
    $('#txtTrackBackStatus').val("").attr('disabled', 'disabled');
    $('#txtTrackBackLink').val("").attr('disabled', 'disabled');
    $('#btnTbAddCancel').hide();
    $("#trackBackDialog").draggable().show();
    loadTrackBackItems();
}
function loadTrackBackItems() {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/FolderDetail/GetTrackBackLinks?folderId=" + objFolderInfo.FolderId,
        success: function (trackbackModel) {
            if (trackbackModel.Success === "ok") {
                $('#ulExistingLinks').html("");
                objFolderInfo.TrackBackItems = trackbackModel.TrackBackItems;
                $.each(trackbackModel.TrackBackItems, function (idx, obj) {
                    $('#ulExistingLinks').append("<li class='clickable' onclick='loadTbForEdit(" + idx + ")' >" + obj.SiteCode + " - " + obj.LinkStatus + "</li>");

                });
            }
            else {
                logError("AJX", objFolderInfo.FolderId, trackbackModel.Success, "loadTrackBackItems");
            }
        },
        error: function (jqXHR) {
            let errMsg = getXHRErrorDetails(jqXHR);
            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
        }
    })
}
function btnTbAddCancel() {
    if ($('#btnTbAddCancel').html() === "cancel") {
        $('#btnTbAddCancel').hide();
        $('#selTrackBackLinkSite').val("").attr('disabled', 'disabled');
        $('#txtTrackBackStatus').val("").attr('disabled', 'disabled');
        $('#txtTrackBackLink').val("").attr('disabled', 'disabled');
        $('#btntbdlgaddedit').html("add");
    }
}
function loadTbForEdit(idx) {
    let selectedLink = objFolderInfo.TrackBackItems[idx];
    $('#selTrackBackLinkSite').val(selectedLink.SiteCode).attr('disabled', 'disabled');
    $('#txtTrackBackStatus').val(selectedLink.LinkStatus).attr('disabled', 'disabled');
    $('#txtTrackBackLink').val(selectedLink.Href).attr('disabled', 'disabled');
    $('#btnTbDlgAddEdit').html("edit");
}
function tbAddEdit() {
    if ($('#btnTbDlgAddEdit').html() === "add") {
        $('#selTrackBackLinkSite').val("").removeAttr('disabled');
        $('#txtTrackBackStatus').val("").removeAttr('disabled');
        $('#txtTrackBackLink').val("").removeAttr('disabled');
        $('#btnTbDlgAddEdit').html("save");
        $("#btnTbAddCancel").html("cancel").show();
        return;
    }
    if ($('#btnTbDlgAddEdit').html() === "edit") {
        $('#selTrackBackLinkSite').removeAttr('disabled');
        $('#txtTrackBackStatus').removeAttr('disabled');
        $('#txtTrackBackLink').removeAttr('disabled');
        $('#btnTbDlgAddEdit').html("save");
        $("#btnTbAddCancel").html("cancel").show();
        return;
    }
    if ($('#btnTbDlgAddEdit').html() === "save") {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/FolderDetail/AddEditTrackBackLink",
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

                    loadTrackBackItems();

                    $('#btnTbDlgAddEdit').html("add");
                    $('#selTrackBackLinkSite').val("");
                    $('#txtTrackBackStatus').val("");
                    $('#txtTrackBackLink').val("");
                    $('#btnTbDlgDelete').hide();
                }
                else logError("AJX", folderId, successModel.Success, "addTrackback");                
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", objFolderInfo.Id, errMsg, functionName);
            }
        });
    }
}
function tbDelete() { }

//////////////// Identify Poser ////////////////

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
                            let errMsg = getXHRErrorDetails(jqXHR);
                            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", defaultParentFolder, errMsg, functionName);
                        }
                    });
                }
                else
                    logError("AJX", defaultParentFolder, successModel.Success, "createPosersIdentifiedFolder");
            },
            error: function (jqXHR) {
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", defaultParentFolder, errMsg, functionName);
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

function showUnknownModelDialog(menuType, imgSrc, linkId, folderId) {
    let unknownModelDialogHtml =
        "<div class='flexContainer'>" +
        "   <div class='floatLeft'>" +
        "          <div class='inline'><img id='linkManipulateImage' class='copyDialogImage' src='" + imgSrc + "'/></div>\n" +
        "   </div>" +

        "   <div id='unknownPoserDialog' class='floatLeft'>" +
        "       <div>If you you know who this is<br/>please <a class='dialogEditButton' href='javascript:showIdentifyPoserDialog()'>identify poser</a></div>\n" +
        "       <br/>" +
        "       <a class='dialogEditButton' href='javascript:IamThisModel()'>I am in this image</a>\n" +
        "   </div>" +

        "   <div id='identifyPoserDialog' class='floatLeft displayHidden' style='width:400px'>\n" +
        "       <span>I think this poser&apos;s name is</span><input id='txtPoserIdentified' class='roundedInput'></input>\n" +
        "       <div>comment</div>" +
        "       <div class='modelInfoCommentArea'>\n" +
        "          <textarea id='poserSummernoteContainer'></textarea>\n" +
        "       </div>\n" +
        "   </div>" +
        "</div>" +
        "<div id='poserDialogFooter' class='folderDialogFooter'>\n" +
        "   <div id='btnPoserSave' style='margin-left:114px;'  class='folderCategoryDialogButton' onclick='poserSave(\"" + linkId + "\"," + folderId + ")'>save</div>\n" +
        "   <div id='btnPoserCancel' class='folderCategoryDialogButton' onclick='dragableDialogClose()'>cancel</div>\n" +
        "</div>";



    if (menuType == "SlideShow") {
        $('#slideShowDialogTitle').html("Unknown Poser");
        $('#slideShowDialogContents').html(unknownModelDialogHtml);
        $('#slideShowDialogContainer').draggable().fadeIn();
    }
    else {
        $('#centeredDialogTitle').html("Unknown Poser");
        $('#centeredDialogContents').html(unknownModelDialogHtml);
        $('#centeredDialogContainer').css("top", 125);
        $('#centeredDialogContainer').css("left", -350);
        $('#centeredDialogContainer').draggable().fadeIn();
    }

    //$('#centeredDialogContainer').css("min-width", 470);
    //$('#centeredDialogContainer').mouseleave(function () { dragableDialogClose(); });
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
    $('#centeredDialogTitle').html("Identify Unknown Poser");
    $("#identifyPoserDialog").show();
    $("#unknownPoserDialog").hide();
    $("#btnPoserSave").show();
    $("#btnPoserCancel").show();
    allowDialogClose = false;
}

function poserSave(linkId, folderId) {
    let visitorId = getCookieValue("VisitorId");
    if (document.domain !== "localhost")
        sendEmail("CurtishRhodes@hotmail.com", "PoserIdentified@Ogglebooble.com", "poser identified !!!", +
            "suggested name: " + $('#txtPoserIdentified').val() + "<br/>" +
            "visitor: " + visitorId + "<br/>" +
            "folderId: " + folderId + "<br/>" +
            "linkId: " + linkId);
    else
        alert("sendEmail(CurtishRhodes@hotmail.com, PoserIdentified@Ogglebooble.com,\nposer identified !!!\n" +
            "suggested name: " + $('#txtPoserIdentified').val() +
            "\nvisitor: " + visitorId + "\nfolderId: " + folderId + "\nlinkId: " + linkId
        );

    showMyAlert("Thank you for your input\nYou have earned 1000 credits.");
    logEvent("FBS", folderId, "poser identified", "link: " + linkId);
    dragableDialogClose();
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

