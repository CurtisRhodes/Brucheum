var dirTreeTotalPics = 0;
var dirTreeTotalFolders = 0;
var dirTreeContainer = "";
var dirTreeTabIndent = 22;
var dirTreeTab = 0;

function buildDirTree(dest, treeId, startNode) {  
    try {
        var start = Date.now();
        totalPics = 0;
        totalFolders = 0;
        dirTreeTab = 0;
        dirTreeContainer = "";
        //var service = "http://localhost:40395/";
        //var service = "https://api.curtisrhodes.com/";
        $.ajax({
            type: "GET",
            url: service + "api/DashBoard/RebuildCatTree?root=" + startNode,
            success: function (categoryTreeModel) {

                if (treeId === "dashboardMain")
                    $('#dataifyInfo').show().html("rebuilding directory tree");

                recurrBuildDirTree(categoryTreeModel, treeId);
                var delta = (Date.now() - start) / 1000;
                console.log("rebuildCatTree took: " + delta.toFixed(3));

                if (treeId === "dashboardMain") 
                    $('#dataifyInfo').html("rebuildCatTree took: " + delta.toFixed(3) + " total folders: " + totalFolders + " total pics: " + totalPics);

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
    $.each(dir.SubDirs, function (idx, subDir) {
        if (isNullorUndefined(subDir.Link)) 
            imgSrc = "http://boobs.ogglebooble.com/redballon.png";        
        else
            imgSrc = subDir.Link;

        dirTreeContainer += "<div class='clickable' style='text-indent:" + dirTreeTab + "px'>"
            + "<span id=S" + subDir.LinkId + " onclick=toggleDirTree('" + subDir.LinkId + "')>[-] </span>"
            + "<span onclick=" + treeId + "Click('" + subDir.DanniPath + "','" + subDir.FolderId + "','" + treeId + "') "
            + "oncontextmenu=showDirTreeContextMenu('" + subDir.LinkId + "','" + subDir.FolderId + "') "
            + "onmouseover=showFolderImage('" + encodeURI(imgSrc) + "') onmouseout=$('#dirTreeImageContainer').hide() >"
            + subDir.DirectoryName.replace(".OGGLEBOOBLE.COM", "") + "</span><span class='fileCount'>  : " + subDir.Length + "</span></div>"
            + "<div id=" + subDir.LinkId + ">";
        totalPics += subDir.Length;
        totalFolders++;
        recurrBuildDirTree(subDir, treeId);
        dirTreeContainer += "</div>";
        dirTreeTab -= dirTreeTabIndent;
    });
}

function showFolderImage(link) {
    $('#dirTreeImageContainer').css("top", event.clientY - 100);
    $('#dirTreeImageContainer').css("left", event.clientX + 10);
    $('#dirTreeImage').attr("src", link);
    $('#dirTreeImageContainer').show();
    $('#footerMessage').html(link);
}

