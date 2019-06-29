var dirTreeContainer = "";
var dirTreeTab, totalPics, totalFolders;
var dirTreeTabIndent = 22;
var dirDepth = 3;

function buildDirTree(dest, treeId, startNode) {  
    try {
        var start = Date.now();
        totalFolders = 0;
        totalPics = 0;
        dirTreeTab = 0;
        dirTreeContainer = "";
        $.ajax({
            type: "GET",
            url: service + "api/CatTree/Get?root=" + startNode,
            success: function (categoryTreeModel) {

                if (treeId === "dashboardMain")
                    $('#dataifyInfo').show().html("rebuilding directory tree");

                recurrBuildDirTree(categoryTreeModel, treeId);
                var delta = (Date.now() - start) / 1000;
                console.log("rebuildCatTree took: " + delta.toFixed(3));

                if (treeId === "dashboardMain") {
                    $('#dataifyInfo').html("rebuildCatTree took: " + delta.toFixed(3) + " total folders: " + totalFolders + " total pics: " + totalPics.toLocaleString());
                    $('#getDirTreeLoadingGif').hide();
                }
                dest.html(dirTreeContainer);
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
            imgSrc = "http://boobs.ogglebooble.com/redballon.png";
        else
            imgSrc = subDir.Link;

        expandMode = "-";
        expandClass = "";
        if (dirTreeTab / dirTreeTabIndent > dirDepth) {
            expandClass = "oggleHidden";
            if (subDir.SubDirs.length > 0)
                expandMode = "+";
        }


        if (subDir.SubDirCount > 0) {
            subDirtxt = " (" + subDir.SubDirCount + ")";
            totalFolders += subDir.SubDirCount;
        }
        else
            subDirtxt = "";

        dirTreeContainer += "<div class='clickable' style='text-indent:" + dirTreeTab + "px'>"
            + "<span id=S" + subDir.LinkId + " onclick=toggleDirTree('" + subDir.LinkId + "') >[" + expandMode + "] </span>"

            + "<span onclick=" + treeId + "Click('" + subDir.DanniPath + "','" + subDir.FolderId + "','" + treeId + "') "
            //+ "<span onclick=" + treeId + "Click('" + subDir.RootFolder + "/" + subDir.DirectoryName.replace(/ /g, "%20") + "','" + subDir.FolderId + "','" + treeId + "') "

            + "oncontextmenu=showDirTreeContextMenu('" + subDir.LinkId + "','" + subDir.FolderId + "') "
            + "onmouseover=showFolderImage('" + encodeURI(imgSrc) + "') onmouseout=$('#dirTreeImageContainer').hide() >"
            + subDir.DirectoryName.replace(".OGGLEBOOBLE.COM", "") + "</span><span class='fileCount'>  : " + subDir.Length.toLocaleString() + subDirtxt + "</span></div>"
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
    $('#dirTreeImageContainer').css("top", event.clientY - 100);
    $('#dirTreeImageContainer').css("left", event.clientX + 10);
    $('#dirTreeImage').attr("src", link);
    $('#dirTreeImageContainer').show();
    //$('#footerMessage').html(link);
}

