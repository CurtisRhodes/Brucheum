var metaTagModel = {};

function openMetaTagDialog(folderId, linkId) {
    // 6:12 AM 3/28/19,  5/25/19
    metaTagModel.FolderId = folderId;
    metaTagModel.LinkId = linkId;
    getMetaTags(folderId, linkId);

    //$('#metaTagDialog').show();
    //$('#metaTagDialog').dialog({
    //    show: { effect: "fade" },
    //    hide: { effect: "blind" },
    //    width: "456px"
    //});
    
    //$('#metaTagDialog').dialog("open");

}

function blurMetaTag() {
    //alert("blurMetaTag metaTagModel.TagId: " + metaTagModel.TagId);
    if (metaTagModel.TagId !== undefined)
        editMetaTag();
    else
        addMetaTag();
}

function getMetaTags(folderId, linkId) {
    var metagLevelColor, parent1, parent2;
    try {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/MetaTag/GetTags?folderId=" + folderId + "&linkId=" + linkId,
            success: function (metaTagResults) {
                if (metaTagResults.Success === "ok") {
                    $('#metaTagDialog').dialog('option', 'title', "Meta Tags for " + metaTagResults.Source);
                    $('#metaTagsAssignedList').html("");
                    $.each(metaTagResults.MetaTags, function (idx, metaTag) {

                        //alert("linkId: " + linkId);

                        if (metaTag.LinkId !== null) {
                            metagLevelColor = "metaTagLinkColor";
                        }
                        else {
                            if (metaTag.FolderId === folderId)
                                metagLevelColor = "metaTagFolderColor";
                            else {
                                //alert("metaTag.FolderId: " + metaTag.FolderId + " folderId: " + folderId);
                                if (parent1 === undefined) {
                                    parent1 = metaTag.FolderId;
                                    metagLevelColor = "metaTagParent1Color";
                                }
                                else {
                                    if (metaTag.FolderId === parent1)
                                        metagLevelColor = "metaTagParent1Color";
                                    else {
                                        if (parent2 === undefined) {
                                            parent2 = metaTag.FolderId;
                                            metagLevelColor = "metaTagParent2Color";
                                        }
                                        else {
                                            if (metaTag.FolderId === parent2)
                                                metagLevelColor = "metaTagParent2Color";
                                            else
                                                metagLevelColor = "metaTagParent3Color";
                                        }
                                    }
                                }
                            }
                        }
                        $('#metaTagsAssignedList').append("<div class='metaTagItem " + metagLevelColor +
                            "' onclick=loadMetaTagForEditing('" + metaTag.TagId + "') >" + metaTag.Tag + "</div>");
                    });
                }
                else {
                    logError("AJX", folderId, success, "getMetaTags");
                }
            },
            error: function (jqXHR) {
                if (!checkFor404("getMetaTags")) {
                    logError("XHR", folderId, getXHRErrorDetails(jqXHR), "getMetaTags");
                }
            }
        });
    }
    catch (e) {
        logError("CAT", folderId, getXHRErrorDetails(jqXHR), "getMetaTags");
    }
}

function loadMetaTagForEditing(tagId) {
    //if (metaTagModel.FolderId = folderId) {
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/MetaTag/GetOne?tagId=" + tagId,
        success: function (model) {
            if (!model.Tag.startsWith("ERROR")) {
                $('#txtMetaTag').val(model.Tag);
                metaTagModel.TagId = tagId;
            }
            else
                logError("AJX", 3908, model.Tag, "loadMetaTagForEditing");
        },
        error: function (jqXHR) {
            if (!checkFor404("loadMetaTagForEditing")) {
                logError("XHR", 3908, getXHRErrorDetails(jqXHR), "loadMetaTagForEditing");
            }
        }
    });
}

function validateMetaTag() {
    if (isNullorUndefined($('#txtMetaTag').val())) {
        metaTagModel.TagId = undefined;
        return false;
    }
    else {
        metaTagModel.Tag = $('#txtMetaTag').val();
        return true;
    }
}

function editMetaTag() {
    if (validateMetaTag()) {
        $.ajax({
            type: "PUT",
            url: settingsArray.ApiServer + "/api/MetaTag",
            data: metaTagModel,
            success: function (success) {
                if (success === "ok") {
                    metaTagModel.TagId = undefined;
                    $('#txtMetaTag').val("");
                    getMetaTags(metaTagModel.FolderId);
                }
                else
                    logError("AJX", 3908, success, "editMetaTag");
            },
            error: function (jqXHR) {
                if (!checkFor404("editMetaTag")) {
                    logError("XHR", 3908, getXHRErrorDetails(jqXHR), "editMetaTag");
                }
            }
        });
    }
}

function addMetaTag() {
    if (validateMetaTag()) {
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/MetaTag",
            data: metaTagModel,
            success: function (success) {
                if (success === "ok") {
                    metaTagModel.TagId = undefined;
                    $('#txtMetaTag').val("");
                    getMetaTags(metaTagModel.FolderId, metaTagModel.LinkId);
                }
                else
                    logError("AJX", 3908, success, "addMetaTag");
            },
            error: function (jqXHR) {
                if (!checkFor404("addMetaTag")) {
                    logError("XHR", 3908, getXHRErrorDetails(jqXHR), "addMetaTag");
                }
            }
        });
    }
}

function showMetaTagDialogHtml() {
    $('#metaTagDilogContainer').html(
        "<div id='metaTagDialog' class='oggleDialogWindow' title=''>\n" +
        "    <label>Tag</label>\n" +
        "    <input id='txtMetaTag' class='roundedInput tagInput' onblur='blurMetaTag()' />\n" +
        "    <div class='flexContainer'>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div id='metaTagsAssignedList' class='metaTagAssignedArea'></div>\n" +
        "        </div>\n" +
        "        <div class='floatLeft'>\n" +
        "            <div id='metaTagsAvailableList' class='metaTagAvailableListArea'></div>\n" +
        "        </div>\n" +
        "    </div>\n" +
        "</div>\n");
}
