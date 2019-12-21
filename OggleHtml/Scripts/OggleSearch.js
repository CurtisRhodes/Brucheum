var busy = false;
var searchString = "";


function oggleSearchKeyDown(event) {
    var ev = event.keyCode;
    $('#testtxt').text(ev);

    if (ev === 9) {  //  tab
        alert("tab key pressed  Enter searchbox");

        $('#searchResultsDiv > ul > li:first-child').addClass('selectedSearchItem');


    }
    if (ev === 27) {  //  escape
        clearSearch();
        return;
    }
    if (ev === 38) {  //  down arrow
        
        return;
    }
    if (ev === 8) {  // backspace
        searchString = searchString.substring(0, searchString.length - 1);
        $('#testtxt').text(searchString);
    }
    else {
        searchString += String.fromCharCode(ev);
    }

        //<div class='OggleSearchBox'>\n" +
        //    <span id='notUserName'>search</span> <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
        //    <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
        //</div>\n" +

    if (searchString.length > 2) {
        if (!busy) {
            busy = true;
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/OggleSearch/GetSearchResults?searchString=" + searchString,
                success: function (SearchResultsModel) {
                    var kluge = "<ul class='searchResultList>";
                    $.each(SearchResultsModel.SearchResults, function (idx, searchResult) {
                        kluge += "<li onclick='jumpToSelected(" + searchResult.FolderId + ")'>" + searchResult.Parent + "/" + searchResult.FolderName + "</li>";
                    });
                    kluge += "</ul>";
                    $('#searchResultsDiv').show().html(kluge);
                    $('.loginArea').hide();

                    busy = false;
                },
                error: function (jqXHR) {
                    var errorMessage = getXHRErrorDetails(jqXHR);
                    if (!checkFor404(errorMessage, "loadSettings")) {
                        sendEmailToYourself("XHR error in oggleSearchKeyDown", "/Data/Settings.xml Message: " + errorMessage);
                        if (document.domain === 'localhost')
                            alert("oggleSearchKeyDown xhr error: " + getXHRErrorDetails(xhr));
     }
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


