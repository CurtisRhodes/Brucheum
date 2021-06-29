// DIRECTORY TREE
let totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";

function loadDirectoryTree(startNode, container, forceRebuild) {
    totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";
    settingsImgRepo = settingsArray.ImageRepo;
    if (!forceRebuild) {
        if (!isNullorUndefined(window.localStorage["dirTree"])) {
            console.log("dir tree cache bypass");
            $('#dashBoardLoadingGif').hide();
            $('#dataifyInfo').hide();
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
            return;
        }
        else {
            $('#dataifyInfo').html("localStorage not found. Using txt file").show();
            showHtmlDirTree();
            return;
        }
    }

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/DirTree/BuildDirTree?root=" + startNode,
        success: function (dirTreeModel) {
            if (dirTreeModel.Success === "ok") {

                buildDirTreeRecurr(dirTreeModel);

                strdirTree += "<div id='dirTreeCtxMenu'></div>";
                $('#' + container + '').html(strdirTree);

                let strdirTreeLen = strdirTree.length;
                if (startNode === 1) {
                    try {
                        localStorage.removeItem("dirTree");
                        window.localStorage["dirTree"] = strdirTree;
                    } catch (e) {
                        //localStorage.clear();
                        //window.localStorage["dirTree"] = strdirTree;
                        dirTreeModel.Success = e + " len: " + strdirTreeLen.toLocaleString();
                        //alert(e);
                    }
                }

                if (typeof onDirTreeComplete === 'function') {
                    onDirTreeComplete(dirTreeModel.Success);
                }
            }
            else {
                $('#dashBoardLoadingGif').hide();
                logError("AJX", startNode, dirTreeModel.Success, "BuildCatTree");
                alert("??" + dirTreeModel.Success);
                if (typeof onDirTreeComplete === 'function') {
                    onDirTreeComplete(dirTreeModel.Success);
                }
            }
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            if (!checkFor404(errMsg, folderId, "load DirectoryTree"))
                logError("XHR", folderId, errMsg, "load DirectoryTree");

            if (typeof onDirTreeComplete === 'function') 
                onDirTreeComplete(errMsg);
            else
                alert("??" + errMsg);
        }
    });
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
            treeNodeClass = "stepchildTreeLabel";
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
        if ($('#Q88' + id + '').css("display") === "none")
            $('#DQ33' + id + '').html("[-] ");
        else
            $('#DQ33' + id + '').html("[+] ");
        $('#Q88' + id + '').toggle();
    }
}

function showFolderImage(link) {
    event.preventDefault();
    window.event.returnValue = false;
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
