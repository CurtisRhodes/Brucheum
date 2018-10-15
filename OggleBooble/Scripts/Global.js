function showBreadCrumbs(folder) {
    var sc = folder.split("/");
    var xfolder = "";
    $('#divBreadCrumbs').html("");
    for (i = 0; i < sc.length; i++) {
        if (sc[i] === "boobs") {
            $('#divBreadCrumbs').append("<a class='activeBreadCrumb' href='Index'>home</a> - ");
        }
        else {
            if (i < Number(sc.length - 1)) {
                var ufolder = "<a class='activeBreadCrumb' href=/Home/Gallery?folder=" + (xfolder + "/" + sc[i]) + ">" + sc[i] + "</a> - ";
                //alert("ufolder: " + ufolder);


                $('#divBreadCrumbs').append(ufolder.toString());
                //alert("ufolder: " + ufolder + "  $('#divBreadCrumbs').html(): " + $('#divBreadCrumbs').html());
            }
            else {
                $('#divBreadCrumbs').append("<span class='inactiveBreadCrumb'>" + sc[i] + "</span>");
            }
        }
        xfolder += ("/" + sc[i]);
    }
}
