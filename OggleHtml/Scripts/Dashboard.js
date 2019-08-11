var isPornEditor = true;
var tabIndent = 22;
var tab = 0;
var totalPics = 0;
var totalFolders = 0;
var dashboardMainSelectedTreeId = 0;
var dashboardMainSelectedPath = "";
var partialViewSelectedItemId = 0;
var dashboardContextMenuFolderId = "";

function buildDirectoryTree() {
    $('#dirTreeContainer').html("");
    $('#dataifyInfo').show().html("rebuilding directory tree");

    $('#dashBoardLoadingGif').show();
    buildDirTree($('#dirTreeContainer'), "dashboardMain", 0);
}

function resizeDashboardPage() {
    resizePage();
    var workAreaHeight = $('#dashboardTop').height() + ($('#dashboardTop').height() + $('#imgLinkPreview').height() + 300);
    if (workAreaHeight > $('#middleColumn').height()) {
        $('#middleColumn').height(workAreaHeight);
        $('#footerMessage').html("middleColumn.height: " + $('#middleColumn').height()); //image height: " + $('#imgLinkPreview').height());
    }
    else
        $('#footerMessage').html("_");

    $('#divDashboardContainer').height($('#middleColumn').height() - 122);
    $('.floatingCrud').width($('.workarea').width() - 100);
}

function createStaticPages(justOne) {
    //$('#createStaticPagesCrud').dialog("close");
    //$('#createStaticPagesCrud').hide();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("creating static pages for " + dashboardMainSelectedPath);
    //$('#progressBar').show();
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/Buld?folderId=" + dashboardMainSelectedTreeId + "&recurr=" + justOne,
        success: function (success) {
            //$('#progressBar').hide();
            $('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                $('#createStaticPagesCrud').dialog("close");
                displayStatusMessage("ok", "done");
                $('#txtNewLink').val("");
                $('#progressBar').hide();
                $('#dataifyInfo').hide();
            }
            else
                alert("createStaticPages: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createStaticPages xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function xxcreateStaticIndexPages() {
    $('#dataifyInfo').show().html("Building Index page");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/StaticPage/CreateIndexPage?rootFolder=boobs&userName=xxx&pageTitle=Index&metaTagFolderId=2",
        success: function (success) {
            //$('#dashBoardLoadingGif').hide();
            if (success === "ok") {
                $('#dataifyInfo').show().html("Building porn Index page");
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/StaticPage/CreateIndexPage?rootFolder=porn&userName=xxx&pageTitle=porn&metaTagFolderId=242",
                    success: function (success) {
                        //$('#dashBoardLoadingGif').hide();
                        if (success === "ok") {
                            displayStatusMessage("ok", "done building Index pages");
                            $('#dataifyInfo').hide();
                        }
                        else
                            alert("createStaticPages: " + success);
                    },
                    error: function (xhr) {
                        $('#dashBoardLoadingGif').hide();
                        alert("createStaticPages xhr error: " + getXHRErrorDetails(xhr));
                    }
                });
            }
            else
                alert("createStaticPages: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createStaticPages xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function addVideo() {
    try {
        $('#dashBoardLoadingGif').show();
        var videoLink = {};
        videoLink.Link = $('#txtVideoLink').val();
        videoLink.Image = $('#txtVideoImage').val();
        videoLink.Title = $('#txtVideoTitle').val();
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "api/VideoLink",
            data: videoLink,
            success(success) {
                $('#dashBoardLoadingGif').hide();
                if (!success.startsWith("ERROR")) {
                    displayStatusMessage("ok", "video link added");
                }
                else
                    alert("addVideo: " + success);
            },
            error: function (xhr) {
                $('#dashBoardLoadingGif').hide();
                alert("addVideo xhr: " + getXHRErrorDetails(xhr));
            }
        });
    } catch (e) {
        alert("addVideo Catch : " + e);
    }
}

function previewLinkImage() {
    $('#imgLinkPreview').attr('src', $('#txtNewLink').val());

    $('#imgLinkPreview').one("load", function () {
        $('#footerMessage').html("image height: " + $('#imgLinkPreview').height());
        resizeDashboardPage();
    });
}

function addImageLink() {
    if (isNullorUndefined($('#txtNewLink').val()))
        alert("invalid link");
    else {
        $('#dataifyInfo').hide();
        var newLink = {};
        newLink.Link = $('#txtNewLink').val();
        newLink.FolderId = dashboardMainSelectedTreeId;
        newLink.Path = dashboardMainSelectedPath;
        $('#dashBoardLoadingGif').fadeIn();
        $.ajax({
            type: "POST",
            url: settingsArray.ApiServer + "/api/FtpDashBoard",
            data: newLink,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    displayStatusMessage("ok", "image link added");
                    $('#txtNewLink').val("");
                    resizeDashboardPage();

                    if (successModel.ReturnValue === "0") {
                        //var linkId = MoveCopyImageModel.Link.substr(MoveCopyImageModel.Link.lastIndexOf("_") + 1, 36);
                        //alert("set folder image: " + linkId + "," + MoveCopyImageModel.SourceFolderId);
                        //setFolderImage(linkId, MoveCopyImageModel.DestinationFolderId, "folder");

                    }
                }
                else
                    alert("addImageLink: " + success);
            },
            error: function (xhr) {
                $('#dashBoardLoadingGif').hide();
                alert("addImageLink xhr error: " + getXHRErrorDetails(xhr));
            }
        });
    }
}

function createNewFolder() {
    $('#dashBoardLoadingGif').fadeIn();
    var newFolder = {};
    newFolder.FolderName = $('#txtNewFolderTitle').val();
    newFolder.Parent = dashboardMainSelectedTreeId;
    $.ajax({
        type: "POST",
        url: settingsArray.ApiServer + "/api/FtpDashBoard/CreateFolder?parentId=" + dashboardMainSelectedTreeId + "&newFolderName=" + $('#txtNewFolderTitle').val(),
        success: function (successModel) {
            $('#dashBoardLoadingGif').hide();
            if (successModel.Success === "ok") {
                displayStatusMessage("ok", "new folder " + newFolder.FolderName + " created");
                //buildDirectoryTree();
                //$('#newFolderCrud').dialog("close");
                $('#txtNewFolderTitle').val('');
                $('#txtNewFolderTitle').text('');

            }
            else
                alert("CreateVirtualFolder: " + successModel.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("createNewFolder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function loadProperties() {
    $('#dataifyInfo').show().html("adding size info");
    $.ajax({
        type: "PATCH",
        url: settingsArray.ApiServer + "api/FtpDashBoard/GetFileProps?folderId=" + dashboardMainSelectedTreeId,
        success: function (success) {
            $('#imagePageLoadingGif').hide();
            if (success === "ok") {
                displayStatusMessage("ok", "done");
                $('#dataifyInfo').hide();
            }
            else
                alert("GetFileProps: " + success);
        },
        error: function (jqXHR, exception) {
            $('#imagePageLoadingGif').hide();
            alert("GetFileProps jqXHR : " + getXHRErrorDetails(jqXHR, exception));
        }
    });
}

function collapseChildFolder() {
    if (confirm("collapse " + $('.txtLinkPath').val())) {
        $('#dashBoardLoadingGif').fadeIn();
        $('#dataifyInfo').show().html("collapse Child Folder");
        //$('#progressBar').progressbar("enable");
        $('#progressBar').show();
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "/api/MoveImage/CollapseFolder?folderId=" + dashboardMainSelectedTreeId,
            success: function (success) {
                $('#dashBoardLoadingGif').hide();
                if (success === "ok") {
                    displayStatusMessage("ok", "collapse succeded");
                    buildDirectoryTree();
                    $('#progressBar').hide();
                    //$('#progressBar').progressbar("destroy");
                }
                else
                    alert("collapseChildFolder: " + success);
            },
            error: function (xhr) {
                $('#dashBoardLoadingGif').hide();
                alert("collapseChildFolder xhr error: " + getXHRErrorDetails(xhr));
            }
        });
    }
}

function showMoveFolderDialog() {

    $('#moveFolderCrud').dialog('open');
    buildDirTree($('#folderToMoveTreeContainer'), 'moveFolderTree', 0);

}

function moveFolder() {
    //$('#dataifyInfo').show().html("Preparing to Move Folder");
    //$('#progressBar').show();
    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FtpDashboard/MoveFolder?sourceFolderId=" + dashboardMainSelectedTreeId + "&destinationFolderId=" + partialViewSelectedItemId,
        success: function (success) {
            //$('#dashBoardLoadingGif').hide();
            //$('#moveFolderCrud').hide();
            //$('#moveFolderCrud').dialog("close");
            if (!success.startsWith("ERROR")) {
                displayStatusMessage("ok", "folder " + $('#txtNewFolderParent').val() + " moved to " + $('.txtPartialDirTreePath').val());
                //$('#progressBar').hide();
                //$('#progressBar').progressbar("destroy");
            }
            else
                alert("Move Folder: " + success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("Move Folder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
    //$('#moveFolderCrud').on('dialogclose', function (event) {
                //buildDirectoryTree();
    //});
}

function renameFolder() {
    var start = Date.now();
    $('#dashBoardLoadingGif').fadeIn();
    $('#dataifyInfo').show().html("renaming folder " + $('.txtLinkPath').val() + " to " + $('#txtReName').val());
    //$('#renameFolderReport').html("");
    //setTimeout(function () {
    //    $('#dataifyInfo').html("Rename took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);

    //    $('#dataifyInfo').append(", Rows Processed: " + repairReport.RowsProcessed);
    //    $('#dataifyInfo').append(", links Edited: " + repairReport.LinksEdited);
    //    $('#dataifyInfo').append(", Images Renamed: " + repairReport.ImagesRenamed);
    //    $('#dataifyInfo').append(", Folders Renamed: " + repairReport.NewLinksAdded);

    //    repairReport.Errors.forEach(function (element) {
    //        $('#renameFolderReport').append("<div> errors: " + element + "</div>");
    //    });
    //    //$('#renameFolderCrud').fadeOut();
    //}, 1200);

    $.ajax({
        type: "PUT",
        url: settingsArray.ApiServer + "/api/FtpDashboard/RenameFolder?folderId=" + dashboardMainSelectedTreeId + "&currentF=x&newFolderName=" + $('#txtReName').val(),
        success: function (success) {
            $('#dashBoardLoadingGif').hide();
            $('#renameFolderCrud').dialog("close");
            $('#renameFolderCrud').hide();
            if (success === "ok") {
                var delta = (Date.now() - start);
                var minutes = Math.floor(delta / 60000);
                var seconds = ((delta % 60000) / 1000).toFixed(0);
                displayStatusMessage("ok", "folder " + $('.txtLinkPath').val() + " renamed to " + $('#txtReName').val());
                console.log("Rename Folder took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                buildDirectoryTree();
                $('#dataifyInfo').hide();
            }
            else {
                alert("renameFolder: " + repairReport.Success);
            }
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("renameFolder xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function repairLinks() {
    var start = Date.now();
    $('#dataifyInfo').show().html("checking and repairing links");
    $('#dashBoardLoadingGif').fadeIn();
    $('#repairLinksReport').html("");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "/api/RepairLinks/RepairLinks/?startFolderId=" + dashboardMainSelectedTreeId + "&drive=XX",
        success: function (repairReport) {
            $('#dashBoardLoadingGif').hide();
            if (repairReport.Success === "ok") {
                try {
                    var delta = (Date.now() - start);
                    var minutes = Math.floor(delta / 60000);
                    var seconds = ((delta % 60000) / 1000).toFixed(0);
                    //console.log("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                    $('#dataifyInfo').html("repair links took: " + minutes + ":" + (seconds < 10 ? '0' : '') + seconds);
                    $('#dataifyInfo').append(", Rows Processed: " + repairReport.RowsProcessed);
                    if (repairReport.ImagesDownLoaded > 0)
                        $('#dataifyInfo').append(", Images DownLoaded: " + repairReport.ImagesDownLoaded);
                    if (repairReport.LinksEdited > 0)
                        $('#dataifyInfo').append(", links Edited: " + repairReport.LinksEdited);
                    if (repairReport.ImagesRenamed > 0)
                        $('#dataifyInfo').append(", Images Renamed: " + repairReport.ImagesRenamed);
                    if (repairReport.NewLinksAdded > 0)
                        $('#dataifyInfo').append(", New Links Added: " + repairReport.NewLinksAdded);
                    if (repairReport.ImagesMoved > 0)
                        $('#dataifyInfo').append(", Images Moved: " + repairReport.ImagesMoved);
                    if (repairReport.LinksRemoved > 0)
                        $('#dataifyInfo').append(", CatLinks Added: " + repairReport.LinksRemoved);
                    if (repairReport.CatLinksAdded > 0)
                        $('#dataifyInfo').append(", CatLinks Added: " + repairReport.CatLinksAdded);


                    //$('#dataifyInfo').append(", directory errors: " + repairReport.DirNotFound);
                    //$('#dataifyInfo').append(", bad file names: " + repairReport.BadFileNames);

                    //$('#dataifyInfo').append(", links fixed: " + repairReport.LinksRemoved);
                    //repairReport.MissingImages.forEach(function (element) {
                    //    /// add new link
                    //    $('#repairReport').append("<div> missing image: " + element.Name + "</div>");
                    //});

                    repairReport.Errors.forEach(function (element) {
                        $('#repairLinksReport').append("<div> errors: " + element + "</div>");
                    });

                    //repairReport.BadLinks.forEach(function (element) {
                    //    $('#repairReport').append("<div> bad link: " + element.id + "</div>");
                    //});
                }
                catch (e) {
                    alert("problem displaying repair report: " + e);
                }
            }
            else
                alert("repairLinks: " + repairReport.Success);
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            alert("downloadLinks xhr error: " + getXHRErrorDetails(xhr));
        }
    });
}

function moveFolderTreeClick(path, id, treeId) {
    var displayPath = "";
    if (path.length > path.indexOf(".COM") + 4) {
        displayPath = path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " ");
    }
    else {
        displayPath = path;
    }
    partialViewSelectedItemId = id;
    $('.txtPartialDirTreePath').val(displayPath);
    $('#partialViewTreeContainer').dialog("close");
}

function dashboardMainClick(path, id, treeId) {

    dashboardMainSelectedTreeId = id;
    dashboardMainSelectedPath = path;
    $('.txtLinkPath').val(path.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));

    //if (path.length > Number(path.indexOf(".COM"))) {
    //    if (Number(path.indexOf(".COM")) > 0) {
    //        dashboardMainSelectedPath = path.substring(6).replace(/%20/g, " ");
    //        displayPath = path.substring(path.indexOf(".COM") + 5).replace(/%20/g, " ");
    //    }
    //    else {
    //        dashboardMainSelectedPath = path.substring(6).replace(/%20/g, " ");
    //        displayPath = path.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "");
    //    }
    //}
    //else {
    //    displayPath = path.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "");
    //    dashboardMainSelectedPath = "/";
    //}
    //if (path == "/Root") {
    //    displayPath = "root";
    //}
}

function showDirTreeContextMenu(linkId, folderId) {
    dashboardContextMenuFolderId = folderId;
    event.preventDefault();
    window.event.returnValue = false;
    $('#dashboardContextMenu').css("top", event.clientY + 5);
    $('#dashboardContextMenu').css("left", event.clientX);
    $('#dashboardContextMenu').fadeIn();
}
function dashboardContextMenuOpenFolder() {
    window.open("/album.html?folder=" + dashboardContextMenuFolderId, "_blank");
}
function dashboardContextMenuShowCategoryDetails() {
    showCategoryDialog(dashboardContextMenuFolderId);
}
function dashboardContextMenuShowInfoDialog() {
    showModelInfoDialog($('.txtLinkPath').val(), dashboardContextMenuFolderId, "http://boobs.ogglebooble.com/redballon.png");
}



