// DIRECTORY TREE 
var strdirTree = "";
function loadDirectoryTree(startNode, container) {
    var start = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').show().html("loading directory tree");
    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/Links/BuildCatTree?root=" + startNode,
        success: function (dirTreeModel) {
            if (dirTreeModel.Success === "ok") {
                var dataLoadTime = (Date.now() - start) / 1000;
                console.log("load dirTree data took: " + dataLoadTime.toFixed(3));
                $('#dataifyInfo').show().html("loading directory tree took: " + dataLoadTime.toFixed(3));
                start = Date.now();
                buildDirTreeRecurr(dirTreeModel);
                strdirTree += "<div class='dirTreeImageContainer floatingDirTreeImage'><img class='dirTreeImage' /></div>";

                $('#' + container + '').html(strdirTree);

                var htmlBuildTime = (Date.now() - start) / 1000;
                $('#dataifyInfo').append("   html took: " + htmlBuildTime.toFixed(3));
                console.log("build dirTree html: " + htmlBuildTime.toFixed(3));

                $('#dashBoardLoadingGif').hide();
                setOggleFooter(3910, "dashboard");
                resizeDashboardPage();
                setTimeout(function () { $('#dataifyInfo').hide() }, 20000);
            }
            else { alert(dirTreeModel.Success); }
        },
        error: function (xhr) {
            $('#dashBoardLoadingGif').hide();
            var errorMessage = getXHRErrorDetails(xhr);
            alert(errorMessage);
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
}

function buildDirTreeRecurr(parentNode) {
    dirTreeTab += dirTreeTabIndent;
    let txtFileCount = "";
    let expandClass = "";
    $.each(parentNode.SubDirs, function (idx, thisNode) {
        var vwDir = thisNode.vwDirTree;
        if (isNullorUndefined(vwDir.Link))
            vwDir.Link = "Images/redballon.png";
        expandMode = "-";
        expandClass = "";
        if (dirTreeTab / dirTreeTabIndent > expandDepth) {
            expandClass = "displayHidden";
            if (thisNode.SubDirs.length > 0)
                expandMode = "+";
        }

        txtFileCount = "(" + vwDir.FileCount + ")";
        if (vwDir.SubDirCount > 0) {
            totalFiles = 0;
            if (vwDir.FileCount > 0) {
                txtFileCount = "(" + vwDir.SubDirCount + " / " + vwDir.FileCount + " + " + (getChildFileCounts(thisNode) - vwDir.FileCount).toLocaleString() + ")";
            }
            else
                txtFileCount = "(" + vwDir.SubDirCount + " / " + getChildFileCounts(thisNode).toLocaleString() + ")";
        }
        strdirTree +=
            "<div class='clickable' style='text-indent:" + dirTreeTab + "px'>"
            + "<span id='S" + vwDir.LinkId + "' onclick=toggleDirTree('" + vwDir.LinkId + "') >[" + expandMode + "] </span>"
            + "<div id='" + vwDir.LinkId + "aq' class='treeLabelDiv' onclick='dirTreeClick(\"" + thisNode.DanniPath + "\",\"" + vwDir.Id + "\")' "
            + "oncontextmenu=showDirTreeContextMenu('" + vwDir.Id + "') "
            + "onmouseover=showFolderImage('" + encodeURI(vwDir.Link) + "') onmouseout=$('.dirTreeImageContainer').hide() >"
            + vwDir.FolderName.replace(".OGGLEBOOBLE.COM", "") + "</div><span class='fileCount'>  : "
            + txtFileCount + "</span></div>" +
            "<div class='" + expandClass + "' id=" + vwDir.LinkId + ">";

        //totalPics += vwDir.FileCount;
        buildDirTreeRecurr(thisNode);
        //$('#dashboardMain').append("</div>");
        strdirTree += "</div>";
        //dirTreeTabIndent = 22;
        dirTreeTab -= dirTreeTabIndent;
    });
}



function dirTreeClick(danniPath, folderId) {
    dashboardMainSelectedTreeId = folderId;
    dashboardMainSelectedPath = danniPath;
    $('.txtLinkPath').val(danniPath.replace(".OGGLEBOOBLE.COM", "").replace("/Root/", "").replace(/%20/g, " "));
    //alert("DanniPath: " + $('.txtLinkPath').val());
    //alert("dashboardMainSelectedTreeId: " + dashboardMainSelectedTreeId);
}

function getChildFileCounts(startNode) {
    totalFiles += startNode.vwDirTree.FileCount;
    $.each(startNode.SubDirs, function (idx, subDirObj) {
        if (!subDirObj.vwDirTree.IsStepChild)
            getChildFileCounts(subDirObj);
    });
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
    //alert("showFolderImage: " + link);
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
        "    <div onclick='window.open(\"/album.html?folder=" + folderId + "\"_blank\")'>Open Folder</div>\n" +
        "    <div onclick='showCategoryDialog(" + folderId + ")'>Show Category Info</div>\n" +
        "    <div onclick='showModelInfoDialog(" + folderId + ")'>Show Model Info</div>\n" +
        "</div>\n");

    $('#dashboardContextMenu').css("top", event.clientY + 5);
    $('#dashboardContextMenu').css("left", event.clientX);
    $('#dashboardContextMenu').fadeIn();
}
