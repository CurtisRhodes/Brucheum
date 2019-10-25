var busy = false;
var searchString = "";
function oggleSearchKeyDown(event) {
    var ev = event.keyCode;
    $('#testtxt').text(ev);

    if (ev === 9) {
        alert("tab key pressed  Enter searchbox");
    }
    if (ev === 27) {  //  escape
        clearSearch();
        return;
    }
    if (ev === 8) {  // backspace
        searchString = searchString.substring(0, searchString.length - 1);
        $('#testtxt').text(searchString);
    }
    else {
        searchString += String.fromCharCode(ev);
    }

    if (searchString.length > 2) {
        if (!busy) {
            busy = true;
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/OggleSearch/GetSearchResults?searchString=" + searchString,
                success: function (SearchResultsModel) {
                    var kluge = "<ul>";
                    $.each(SearchResultsModel.SearchResults, function (idx, searchResult) {

                        kluge += "<li onclick='jumpToSelected(" + searchResult.FolderId + ")'>" + searchResult.FolderName + "</li>";

                    });
                    kluge += "</ul>";

                    $('#searchResultsDiv').show().html(kluge);


                    $('.loginArea').hide();

                    busy = false;
                },
                error: function (xhr) {
                    alert("createNewFolder xhr error: " + getXHRErrorDetails(xhr));
                }
            });
        }
    }
}

function clearSearch() {
    $('#searchResultsDiv').hide().html("");
    $('.loginArea').show();
    searchString = "";
    $('#txtSearch').val("");
    $('#testtxt').text("");
}

function jumpToSelected(folderId) {
    //alert("open(album.html?folder=" + folderId);
    window.open("/album.html?folder=" + folderId, "_blank");
    clearSearch();
}


