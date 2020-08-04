﻿// DIRECTORY TREE
//var tabIndent = 22;
//var tab = 0;
//var totalPics = 0;
let totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";
let dataLoadTime;

function loadDirectoryTree(startNode, container, clickEvent, forceRebuild) {
    dataLoadTime = (Date.now() - start) / 1000;
    totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";
    settingsImgRepo = settingsArray.ImageRepo;
    var start = Date.now();

    if (!forceRebuild && !isNullorUndefined(window.localStorage["dirTree"]) && (startNode === 1)) {
        console.log("dir tree cache bypass");
        $('#' + container + '').html(window.localStorage["dirTree"]);
        if (typeof onDirTreeComplete === 'function') {
            onDirTreeComplete();
        }
    }
    else {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Links/BuildCatTree?root=" + startNode,
            success: function (dirTreeModel) {
                if (dirTreeModel.Success === "ok") {
                    var dataLoadTime = (Date.now() - start) / 1000;

                    //console.log("load dirTree data took: " + dataLoadTime.toFixed(3));
                    //$('#dataifyInfo').show().html("loading directory tree took: " + dataLoadTime.toFixed(3));
                    start = Date.now();
                    buildDirTreeRecurr(dirTreeModel, clickEvent);
                    //strdirTree += "<div class='dirTreeImageContainer floatingDirTreeImage'><img class='dirTreeImage' /></div>";

                    if (startNode === 1) {
                        window.localStorage["dirTree"] = strdirTree;
                    }
                    $('#' + container + '').html(strdirTree);

                    var htmlBuildTime = (Date.now() - start) / 1000;
                    $('#dataifyInfo').append("   html took: " + htmlBuildTime.toFixed(3));
                    console.log("build dirTree html: " + htmlBuildTime.toFixed(3));

                    if (typeof onDirTreeComplete === 'function') {
                        onDirTreeComplete();
                    }
                }
                else {
                    logError("AJX", startNode, dirTreeModel.Success, "loadDirectoryTree");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                if (!checkFor404("loadDirectoryTree"))
                    logError("XHR", startNode, getXHRErrorDetails(jqXHR), "loadDirectoryTree");
            }
        });
    }
}

function buildDirTreeRecurr(parentNode, clickEvent) {
    dirTreeTab += dirTreeTabIndent;
    let txtFileCount = "";
    let expandClass = "";
    let folderImage = "";
    $.each(parentNode.SubDirs, function (idx, thisNode) {
        //if (!isNullorUndefined(thisNode.VwDirTree))
        {
            let vwDir = thisNode.VwDirTree;

            if (isNullorUndefined(vwDir.FolderImage))
                folderImage = "Images/redballon.png";
            else
                folderImage = settingsImgRepo + vwDir.FolderImage;
            expandMode = "-";
            expandClass = "";
            if (dirTreeTab / dirTreeTabIndent > expandDepth) {
                expandClass = "displayHidden";
                if (!isNullorUndefined(thisNode.SubDirs)) {
                    if (thisNode.SubDirs.length > 0)
                        expandMode = "+";
                }
            }
            txtFileCount = "(" + vwDir.FileCount + ")";

            if (!isNullorUndefined(thisNode.SubDirs)) {
                if (thisNode.SubDirs.length > 0) {
                    //txtFileCount = "(" + parentNode.SubDirs.length + ")";
                    if(vwDir.FileCount>0)
                        txtFileCount = "(" + vwDir.FileCount + " / [" + thisNode.SubDirs.length + "]";
                    else
                        txtFileCount = "[" + thisNode.SubDirs.length + "]";

                    //totalFiles = 0;
                    //if (vwDir.FileCount > 0) {
                    //    txtFileCount = "(z" + thisNode.SubDirs.length + " / " + vwDir.FileCount + " + " + (getChildFileCounts(thisNode) - vwDir.FileCount).toLocaleString() + ")";
                    //}
                    //else {
                    //    txtFileCount = "(" + thisNode.SubDirs.length + ")";
                    //}
                }
            }
            let randomId = create_UUID();
            strdirTree +=
                "<div class='dirTreeNode clickable' style='text-indent:" + dirTreeTab + "px'>"
                + "<span id='S" + randomId + "' onclick='toggleDirTree(\"" + randomId + "\")' >[" + expandMode + "] </span>"
                + "<div id='" + randomId + "aq' class='treeLabelDiv' "
                + "onclick=" + clickEvent + "('" + thisNode.DanniPath + "','" + vwDir.Id + "') "
                + "oncontextmenu=showDirTreeContextMenu('" + vwDir.Id + "') "
                + "onmouseover=showFolderImage('" + encodeURI(folderImage) + "') onmouseout=$('.dirTreeImageContainer').hide()>"
                //+ "onmouseover=showFolderImage('" + encodeURI(folderImage) + "')>"
                + vwDir.FolderName.replace(".OGGLEBOOBLE.COM", "") + "</div><span class='fileCount'>  : "
                + txtFileCount + "</span></div>" +
                "<div class='" + expandClass + "' id=" + randomId + ">";

            dirTreeTabIndent = 22;
            buildDirTreeRecurr(thisNode, clickEvent);
            strdirTree += "</div>";
            dirTreeTab -= dirTreeTabIndent;
        }
    });
}

function getChildFileCounts(dirTree) {
    totalFiles += dirTree.FileCount;
    if (!isNullorUndefined(dirTree.SubDirs)) {
        $.each(dirTree.SubDirs, function (idx, subDirObj) {
            if (!subDirObj.IsStepChild)
                getChildFileCounts(subDirObj);
        });
    }
    return totalFiles;
}

function toggleDirTree(id) {
    if ($('#' + id + '').css("display") === "none")
        $('#S' + id + '').html("[-] ");
    else
        $('#S' + id + '').html("[+] ");
    $('#' + id + '').toggle();
}

function showFolderImage(link) {
    $('.dirTreeImageContainer').css("top", event.clientY - 100);
    $('.dirTreeImageContainer').css("left", event.clientX + 10);
    $('.dirTreeImage').attr("src", link);
    $('.dirTreeImageContainer').show();
    //$('#footerMessage').html(link);
}

function showDirTreeContextMenu(folderId) {
    event.preventDefault();
    window.event.returnValue = false;

    $('body').append(
        "<div id='dashboardContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div onclick='window.open(\"/album.html?folder=" + folderId + "\", \"_blank\")'>Open Folder</div>\n" +
        "    <div onclick='showFolderInfoDialog(" + folderId + ",\"dirTree ctx\")'>Show Folder Info</div>\n" +
        "    <div onclick='showFolderStats(" + folderId + ")'>Show Folder stats</div>\n" +
        "</div>\n");
    $('#dashboardContextMenu').css("top", event.clientY + 5);
    $('#dashboardContextMenu').css("left", event.clientX);
    $('#dashboardContextMenu').fadeIn();
}

function showFolderStats(folderId) {
    alert("showFolderStats\nFolderId: " + folderId);

}

function refreshDirTree(startNode) {
    alert("refreshDirTree");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Links/BuildCatTree?root=" + startNode,
        success: function (dirTreeModel) {
            if (dirTreeModel.Success === "ok") {

                //console.log("load dirTree data took: " + dataLoadTime.toFixed(3));
                $('#dataifyInfo').show().html("loading directory tree took: " + dataLoadTime.toFixed(3));
                start = Date.now();
                buildDirTreeRecurr(dirTreeModel, clickEvent);
                //strdirTree += "<div class='dirTreeImageContainer floatingDirTreeImage'><img class='dirTreeImage' /></div>";

                if (startNode === 1) {
                    window.localStorage["dirTree"] = strdirTree;
                }
                $('#' + container + '').html(strdirTree);

                var htmlBuildTime = (Date.now() - start) / 1000;
                $('#dataifyInfo').append("   html took: " + htmlBuildTime.toFixed(3));
                console.log("build dirTree html: " + htmlBuildTime.toFixed(3));

                if (typeof onDirTreeComplete === 'function') {
                    onDirTreeComplete();
                }
            }
            else {
                logError("AJX", startNode, dirTreeModel.Success, "loadDirectoryTree");
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            if (!checkFor404("loadDirectoryTree"))
                logError("XHR", startNode, getXHRErrorDetails(jqXHR), "loadDirectoryTree");
        }
    });
}

function dirTreeSuccess() {
    alert("dirTreeSuccess");
    $('#dataifyInfo').show().html("loading directory tree took: " + dataLoadTime.toFixed(3));
    start = Date.now();


    if (startNode === 1) {
        window.localStorage["dirTree"] = strdirTree;
    }
    $('#' + container + '').html(strdirTree);

    var htmlBuildTime = (Date.now() - start) / 1000;
    $('#dataifyInfo').append("   html took: " + htmlBuildTime.toFixed(3));
    console.log("build dirTree html: " + htmlBuildTime.toFixed(3));

    if (typeof onDirTreeComplete === 'function') {
        onDirTreeComplete();
    }
}


