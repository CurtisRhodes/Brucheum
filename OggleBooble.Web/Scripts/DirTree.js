var dirTreeContainer = "";
var dirTreeTab, totalPics, totalFolders;
var dirTreeTabIndent = 22;
var dirDepth = 3;
var totalFiles = 0;
var categoryTreeModel = null;
var dirTreeComplete = false;

function buildDirTree(dest, treeId, startNode, forceRebuild) {
    try {
        if (!forceRebuild) {
            if (window.localStorage[treeId] !== null) {
                dest.html(window.localStorage[treeId]);
                return;
            }
        }
        var start = Date.now();
        totalFolders = 0;
        totalPics = 0;
        dirTreeTab = 0;
        dirTreeContainer = "";

        if (treeId === "dashboardMain")
            $('#dashBoardLoadingGif').show();

        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/Links/BuildCatTree?root=" + startNode,
            success: function (results) {

                categoryTreeModel = results;
                recurrBuildDirTree(categoryTreeModel, treeId);

                dest.html(dirTreeContainer);

                window.localStorage[treeId] = dirTreeContainer;

                if (typeof onDirTreeComplete === "function") {
                    onDirTreeComplete();
                }

                if (treeId === "dashboardMain")
                    $('#dashBoardLoadingGif').hide();


                var delta = (Date.now() - start) / 1000;
                console.log("rebuildCatTree took: " + delta.toFixed(3));


            },
            error: function (xhr) {
                $('#dashBoardLoadingGif').hide();
                var errorMessage = getXHRErrorDetails(xhr);
                if (!checkFor404(errorMessage, "getDirTree")) {
                    logError({
                        VisitorId: getCookieValue("VisitorId"),
                        ActivityCode: "XHR",
                        Severity: 3,
                        ErrorMessage: errorMessage,
                        CalledFrom: "getDirTree"
                    });
                }
                //dest.html("buildCatTree xhr error: " + getXHRErrorDetails(xhr));
            }
        });
    } catch (e) {
        dest.html("buildCatTree catch: " + e);
    }
}

function recurrBuildDirTree(dir, treeId) {
    dirTreeTab += dirTreeTabIndent;
    var imgSrc = "";
    var txtFileCount = "";
    var expandClass = "";
    $.each(dir.SubDirs, function (idx, subDir) {
        if (isNullorUndefined(subDir.Link))
            imgSrc = "Images/redballon.png";
        else
            imgSrc = subDir.Link;
        expandMode = "-";
        expandClass = "";
        if (dirTreeTab / dirTreeTabIndent > dirDepth) {
            expandClass = "displayHidden";
            if (subDir.SubDirs.length > 0)
                expandMode = "+";
        }

        if (subDir.FolderId === 56) {
            cv = 2;
        }

        totalFiles = 0;
        if (subDir.SubDirCount > 0) {            
            txtFileCount = subDir.SubDirCount.toLocaleString() + "/" + getAllChildFileCounts(subDir).toLocaleString();
        }
        else
            txtFileCount = getAllChildFileCounts(subDir).toLocaleString();


        dirTreeContainer += "<div class='clickable' style='text-indent:" + dirTreeTab + "px'>"
            + "<span id='S" + subDir.LinkId + "' onclick=toggleDirTree('" + subDir.LinkId + "') >[" + expandMode + "] </span>"
            + "<div id='" + subDir.linkId + "aq' class='treeLabelDiv' onclick=" + treeId + "Click('" + subDir.DanniPath + "','" + subDir.FolderId + "','" + subDir.LinkId + "aq') "
            + "oncontextmenu=showDirTreeContextMenu('" + subDir.LinkId + "','" + subDir.FolderId + "') "
            + "onmouseover=showFolderImage('" + encodeURI(imgSrc) + "') onmouseout=$('.dirTreeImageContainer').hide() >"
            + subDir.DirectoryName.replace(".OGGLEBOOBLE.COM", "") + "</div>       <span class='fileCount'>  : "
            + txtFileCount + "</span></div>" + "<div class='" + expandClass + "' id=" + subDir.LinkId + ">";

        totalPics += subDir.FileCount;
        recurrBuildDirTree(subDir, treeId);
        dirTreeContainer += "</div>";
        dirTreeTab -= dirTreeTabIndent;
    });
}

function getAllChildFileCounts(thisFolder) {    
    totalFiles += thisFolder.FileCount;
    
    $.each(thisFolder.SubDirs, function (idx, subDirObj) {
        if (!subDirObj.IsStepChild)
            getAllChildFileCounts(subDirObj);
    });
    return totalFiles;
}

function showFolderImage(link) {
    //alert("showFolderImage: " + link);
    $('.dirTreeImageContainer').css("top", event.clientY - 100);
    $('.dirTreeImageContainer').css("left", event.clientX + 10);
    $('.dirTreeImage').attr("src", link);
    $('.dirTreeImageContainer').show();
    //$('#footerMessage').html(link);
}

function showDirTreeContextMenu(linkId, folderId) {
    //alert("showDirTreeContextMenu");

    dashboardContextMenuFolderId = folderId;
    event.preventDefault();
    window.event.returnValue = false;
    $('#dashboardContextMenu').css("top", event.clientY + 5);
    $('#dashboardContextMenu').css("left", event.clientX);
    $('#dashboardContextMenu').fadeIn();
}

function toggleDirTree(id) {
    if ($('#' + id + '').css("display") === "none")
        $('#S' + id + '').html("[-] ");
    else
        $('#S' + id + '').html("[+] ");
    $('#' + id + '').toggle();
}
