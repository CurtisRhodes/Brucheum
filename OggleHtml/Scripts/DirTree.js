var dirTreeContainer = "";
var dirTreeTab, totalPics, totalFolders;
var dirTreeTabIndent = 22;
var dirDepth = 3;

function buildDirTree(dest, treeId, startNode, endNode) {  

    //alert("buildDirTree");

    try {
        var start = Date.now();
        totalFolders = 0;
        totalPics = 0;
        dirTreeTab = 0;
        dirTreeContainer = "";
        $.ajax({
            type: "GET",
            url: settingsArray.ApiServer + "api/DirTree/Get?root=" + startNode,
            success: function (categoryTreeModel) {
                recurrBuildDirTree(categoryTreeModel, treeId);
                dest.html(dirTreeContainer);
                var delta = (Date.now() - start) / 1000;
                console.log("rebuildCatTree took: " + delta.toFixed(3));
                if (treeId === "dashboardMain") {
                    $('#dataifyInfo').html("rebuildCatTree took: " + delta.toFixed(3) + " total folders: " + totalFolders + " total pics: " + totalPics.toLocaleString());
                    $('#dashBoardLoadingGif').hide();
                    setTimeout(function () { $('#dataifyInfo').hide(); }, 5000);
                }
            },
            error: function (xhr) {
                dest.html("buildCatTree xhr error: " + getXHRErrorDetails(xhr));
            }
        });
    } catch (e) {
        dest.html("buildCatTree catch: " + e);
    }
}

function recurrBuildDirTree(dir, treeId) {
    dirTreeTab += dirTreeTabIndent;
    var imgSrc = "";
    var subDirtxt = "";
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

        if (subDir.SubDirCount > 0) {
            subDirtxt = " (" + subDir.SubDirCount + ")";
            totalFolders += subDir.SubDirCount;
        }
        else
            subDirtxt = "";

        //if (subDir.FolderId === 1205) {
        //    alert("treeId: " + treeId +"  subDir.FolderId: "+ subDir.FolderId + "  subDir.DirectoryName: " + subDir.DirectoryName);
        //}

        dirTreeContainer += "<div class='clickable' style='text-indent:" + dirTreeTab + "px'>"
            + "<span id='S" + subDir.LinkId + "' onclick=toggleDirTree('" + subDir.LinkId + "') >[" + expandMode + "] </span>"
            + "<div id='" + subDir.linkId + "aq' class='treeLabelDiv' onclick=" + treeId + "Click('" + subDir.DanniPath + "','" + subDir.FolderId + "','" + subDir.LinkId + "aq') "
            + "oncontextmenu=showDirTreeContextMenu('" + subDir.LinkId + "','" + subDir.FolderId + "') "
            + "onmouseover=showFolderImage('" + encodeURI(imgSrc) + "') onmouseout=$('.dirTreeImageContainer').hide() >"
            + subDir.DirectoryName.replace(".OGGLEBOOBLE.COM", "") + "</div>       <span class='fileCount'>  : "
            + subDir.Length.toLocaleString() + subDirtxt + "</span></div>"
            + "<div class='" + expandClass + "' id=" + subDir.LinkId + ">";

        totalPics += subDir.Length;
        //totalFolders++;
        recurrBuildDirTree(subDir, treeId);
        dirTreeContainer += "</div>";
        dirTreeTab -= dirTreeTabIndent;
    });
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

function showDirTreeContextMenu(linkId, folderId) {
    //alert("showDirTreeContextMenu");

    dashboardContextMenuFolderId = folderId;
    event.preventDefault();
    window.event.returnValue = false;
    $('#dashboardContextMenu').css("top", event.clientY + 5);
    $('#dashboardContextMenu').css("left", event.clientX);
    $('#dashboardContextMenu').fadeIn();
}
