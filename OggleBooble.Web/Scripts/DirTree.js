// DIRECTORY TREE
let totalFolders = 0, dirTreeTab = 0, dirTreeTabIndent = 2, totalFiles = 0, expandDepth = 2, strdirTree = "";

function showHtmlDirTree(container) {
    let showHtmlDirTreeStart = Date.now();
    $('#dashBoardLoadingGif').show();
    $('#dataifyInfo').append(" loading directory tree from file");

    var fileName = "ogglebooble/data/dirTree.txt";

    $.ajax({
        type: "GET",
        url: settingsArray.ApiServer + "api/DirTree/GetTextFile?fileName=" + fileName,
        success: function (data) {

            $('#' + container + '').html(data);

            let delta = (Date.now() - showHtmlDirTreeStart);
            $('#dataifyInfo').append(". len: " + data.length.toLocaleString() + ".  load directory tree from txt took: " + (delta / 1000).toFixed(3));
            $('#dashBoardLoadingGif').hide();
        },
        error: function (jqXHR) {
            $('#dashBoardLoadingGif').hide();
            let errMsg = getXHRErrorDetails(jqXHR);
            alert("??" + errMsg);
            if (!checkFor404(errMsg, 444, "show HtmlDirTree")) logError("XHR", 627922, errMsg, "show HtmlDirTree");
        }
    });
}

//        strdirTree +=
//            "<div class='dirTreeNode clickable' style='text-indent:" + dirTreeTab + "px'>"
//            + "<span id='DQ33" + randomId + "' onclick='toggleDirTree(\"" + randomId + "\")' >[" + expandMode + "] </span>"
//            + "<div id='" + randomId + "aq' class='" + treeNodeClass + "' "
//            + "onclick=commonDirTreeClick('" + thisNode.DanniPath + "'," + vwDir.Id + ") "
//            + "oncontextmenu=showDirTreeContextMenu(" + vwDir.Id + ") "
//            + "onmouseover=showFolderImage('" + encodeURI(folderImage) + "') onmouseout=$('.dirTreeImageContainer').hide()>"
//            + vwDir.FolderName.replace(".OGGLEBOOBLE.COM", "") + "</div><span class='fileCount'>  : "
//            + txtFileCount + "</span></div>" + "\n<div class='" + expandClass + "' id='Q88" + randomId + "'>";
//        dirTreeTabIndent = 22;
//        buildDirTreeRecurr(thisNode);
//        strdirTree += "</div>";
//        dirTreeTab -= dirTreeTabIndent;
//    });
//}

function hideFolderImage() {
    $('.dirTreeImageContainer').hide();
}

function toggleDirTree(id) {

    //if (activeDirTree == "stepchild") {
    //    //alert("toggleDirTree: " + activeDirTree);
    //    if ($('#' + id + '').css("display") === "none")
    //        $('#S' + id + '').html("[-] ");
    //    else
    //        $('#S' + id + '').html("[+] ");
    //    $('#SS' + id + '').toggle();
    //}
    //else {
    if ($('#Q88' + id + '').css("display") === "none")
        $('#DQ33' + id + '').html("[-] ");
    else
        $('#DQ33' + id + '').html("[+] ");
    $('#Q88' + id + '').toggle();
    //}
}

function showFolderImage(link) {
    try {
        event.preventDefault();
        window.event.returnValue = false;
        $('.dirTreeImageContainer').css("top", event.clientY - 100);
        $('.dirTreeImageContainer').css("left", event.clientX + 10);
        $('.dirTreeImage').attr("src", link);
        $('.dirTreeImageContainer').show();

    } catch (e) {
        alert(e);
    }
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

    //alert("showDirTreeContextMenu(" + vwDirId + ")");

}

function showFolderStats(folderId) {
    alert("showFolderStats\nFolderId: " + folderId + "\npSelectedTreeId: " + pSelectedTreeId);
}
