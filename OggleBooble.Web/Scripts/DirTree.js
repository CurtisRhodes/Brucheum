// DIRECTORY TREE
//var tabIndent = 22;
//var tab = 0;
//var totalPics = 0;
let totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";
let dataLoadTime;

function loadDirectoryTree(startNode, container, forceRebuild) {
    totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";
    settingsImgRepo = settingsArray.ImageRepo;

    if (!forceRebuild && !isNullorUndefined(window.localStorage["dirTree"])) {
        console.log("dir tree cache bypass");

        if (container == "scDirTreeContainer") {
            //str = str.replace(/abc/g, '');
            var rawDirTree = window.localStorage["dirTree"];
            rawDirTree = rawDirTree.replaceAll("DQ33", "S");
            rawDirTree = rawDirTree.replaceAll("Q88", "SS");
            $('#' + container + '').html(rawDirTree);
        }
        else {
            $('#' + container + '').html(window.localStorage["dirTree"]);
        }
        if (typeof onDirTreeComplete === 'function') {
            onDirTreeComplete();
        }
    }
    else {
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/DirTree/BuildDirTree?root=" + startNode,
            success: function (dirTreeModel) {
                if (dirTreeModel.Success === "ok") {
                    buildDirTreeRecurr(dirTreeModel);
                    strdirTree += "<div id='dirTreeCtxMenu'></div>";
                    if (startNode === 1) {
                        window.localStorage["dirTree"] = strdirTree;
                    }
                    $('#' + container + '').html(strdirTree);

                    if (typeof onDirTreeComplete === 'function') {
                        onDirTreeComplete();
                    }
                }
                else {
                    $('#dashBoardLoadingGif').hide();
                    logError("AJX", startNode, dirTreeModel.Success, "BuildCatTree");
                }
            },
            error: function (jqXHR) {
                $('#dashBoardLoadingGif').hide();
                let errMsg = getXHRErrorDetails(jqXHR);
                let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
                if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
            }
        });
    }
}

function buildDirTreeRecurr(parentNode) {
    dirTreeTab += dirTreeTabIndent;
    let txtFileCount = "";
    let expandClass = "";
    let folderImage = "";
    $.each(parentNode.SubDirs, function (idx, thisNode) {
        let vwDir = thisNode.ThisNode;

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
        if (vwDir.SubFolderCount > 0) {
            //txtFileCount = "(" + parentNode.SubDirs.length + ")";
            if (vwDir.FileCount > 0)
                txtFileCount = "[" + vwDir.SubFolderCount.toLocaleString() + "] (" + vwDir.TotalChildFiles.toLocaleString() + ") {" + vwDir.FileCount + "}";
            else {
                if (thisNode.SubDirs.length == vwDir.SubFolderCount)
                    txtFileCount = thisNode.SubDirs.length + " (" + vwDir.TotalChildFiles.toLocaleString() + ")";
                else
                    txtFileCount = thisNode.SubDirs.length + " [" + vwDir.SubFolderCount.toLocaleString() + " / " + vwDir.TotalChildFiles.toLocaleString() + "]";
            }
        }
        else
            txtFileCount = "(" + vwDir.FileCount + ")";

        let randomId = create_UUID();

        let treeNodeClass = "treeLabelDiv";
        if (vwDir.IsStepChild == 1) {
            treeNodeClass = "redTreeLabelDiv";
        }

        if (isNullorUndefined(vwDir.FolderName)) {
            vwDir.FolderName = "unknown";
        }

        strdirTree +=
            "<div class='dirTreeNode clickable' style='text-indent:" + dirTreeTab + "px'>"
            + "<span id='DQ33" + randomId + "' onclick='toggleDirTree(\"" + randomId + "\")' >[" + expandMode + "] </span>"
            + "<div id='" + randomId + "aq' class='" + treeNodeClass + "' "
            + "onclick=commonDirTreeClick('" + thisNode.DanniPath + "'," + vwDir.Id + ") "
            + "oncontextmenu=showDirTreeContextMenu(" + vwDir.Id + ") "
            + "onmouseover=showFolderImage('" + encodeURI(folderImage) + "') onmouseout=$('.dirTreeImageContainer').hide()>"
            + vwDir.FolderName.replace(".OGGLEBOOBLE.COM", "") + "</div><span class='fileCount'>  : "
            + txtFileCount + "</span></div>" + "\n<div class='" + expandClass + "' id='Q88" + randomId + "'>";

        dirTreeTabIndent = 22;
        buildDirTreeRecurr(thisNode);
        strdirTree += "</div>";
        dirTreeTab -= dirTreeTabIndent;
    });
}

function toggleDirTree(id) {

    if (activeDirTree == "stepchild") {
        //alert("toggleDirTree: " + activeDirTree);
        if ($('#' + id + '').css("display") === "none")
            $('#S' + id + '').html("[-] ");
        else
            $('#S' + id + '').html("[+] ");
        $('#SS' + id + '').toggle();
    }
    else {
        if ($('#' + id + '').css("display") === "none")
            $('#DQ33' + id + '').html("[-] ");
        else
            $('#DQ33' + id + '').html("[+] ");
        $('#Q88' + id + '').toggle();
    }
}

function showFolderImage(link) {
    $('.dirTreeImageContainer').css("top", event.clientY - 100);
    $('.dirTreeImageContainer').css("left", event.clientX + 10);
    $('.dirTreeImage').attr("src", link);
    $('.dirTreeImageContainer').show();
    //$('#footerMessage').html(link);
}

function showDirTreeContextMenu(vwDirId) {
    event.preventDefault();
    window.event.returnValue = false;

    $('#dirTreeCtxMenu').html(
        "<div id='dashboardContextMenu' class='ogContextMenu' onmouseleave='$(this).fadeOut()'>\n" +
        "    <div onclick='window.open(\"/album.html?folder=" + vwDirId + "\", \"_blank\")'>Open Folder</div>\n" +
        "    <div onclick='showFolderInfoDialog(" + vwDirId + ",\"dirTree ctx\")'>Edit Folder Comment</div>\n" +
        "    <div onclick='showFolderStats(" + vwDirId + ")'>Show Folder Info</div>\n" +
        "</div>\n");
    $('#dashboardContextMenu').css("top", event.clientY + 5);
    $('#dashboardContextMenu').css("left", event.clientX);
    $('#dashboardContextMenu').fadeIn();
}

function showFolderStats(folderId) {
    alert("showFolderStats\nFolderId: " + folderId + "\npSelectedTreeId: " + pSelectedTreeId);
}

//function xxrefreshDirTree(startNode) {
//    alert("refreshDirTree");
//    $.ajax({
//        type: "GET",
//        url: settingsArray.ApiServer + "api/Links/BuildCatTree?root=" + startNode,
//        success: function (dirTreeModel) {
//            if (dirTreeModel.Success === "ok") {
//                //console.log("load dirTree data took: " + dataLoadTime.toFixed(3));
//                $('#dataifyInfo').show().html("loading directory tree took: " + dataLoadTime.toFixed(3));
//                start = Date.now();
//                buildDirTreeRecurr(dirTreeModel);
//                if (startNode === 1) {
//                    window.localStorage["dirTree"] = strdirTree;
//                }
//                //$('#' + container + '').html(strdirTree);
//                var htmlBuildTime = (Date.now() - start) / 1000;
//                $('#dataifyInfo').append("   html took: " + htmlBuildTime.toFixed(3));
//                console.log("build dirTree html: " + htmlBuildTime.toFixed(3));
//                if (typeof onDirTreeComplete === 'function') {
//                    onDirTreeComplete();
//                }
//            }
//            else {
//                logError("AJX", startNode, dirTreeModel.Success, "BuildCatTree");
//            }
//        },
//        error: function (jqXHR) {
//            $('#dashBoardLoadingGif').hide();
//            let errMsg = getXHRErrorDetails(jqXHR);
//            let functionName = arguments.callee.toString().match(/function ([^\(]+)/)[1];
//            if (!checkFor404(errMsg, folderId, functionName)) logError("XHR", folderId, errMsg, functionName);
//        }
//    });
//}

function dirTreeSuccess() {
    alert("dirTreeSuccess");
    $('#dataifyInfo').show().html("loading directory tree took: " + dataLoadTime.toFixed(3));
    start = Date.now();

    if (startNode === 1) {
        window.localStorage["dirTree"] = strdirTree;
    }
    //$('#' + container + '').html(strdirTree);

    var htmlBuildTime = (Date.now() - start) / 1000;
    $('#dataifyInfo').append("   html took: " + htmlBuildTime.toFixed(3));
    console.log("build dirTree html: " + htmlBuildTime.toFixed(3));

    if (typeof onDirTreeComplete === 'function') {
        onDirTreeComplete();
    }
}

