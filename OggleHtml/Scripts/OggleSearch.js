var busy = false;
var searchString = "";

//<div class='OggleSearchBox'>\n" +
//    <span id='notUserName'>search</span> <input class='OggleSearchBoxText' id='txtSearch' onkeydown='oggleSearchKeyDown(event)' />" +
//    <div id='searchResultsDiv' class='searchResultsDropdown'></div>\n" +
//</div>\n" +


function oggleSearchKeyDown(event) {
    var ev = event.keyCode;
    if (ev === 9) {  //  tab
        //alert("tab key pressed  Enter searchbox");
        $('#searchResultsDiv').find('li:first').addClass('selectedSearchItem').focus();
        event.preventDefault();
        window.event.returnValue = false;
    }
    if (ev === 27) {  //  escape
        clearSearch();
        return;
    }

    if (ev !== 46 && ev > 31 && (ev < 48 || ev > 57)) {

        //else {
        searchString += String.fromCharCode(ev);

        if (searchString.length > 2) {
            if (!busy) {
                busy = true;
                $.ajax({
                    type: "GET",
                    url: settingsArray.ApiServer + "api/OggleSearch/GetSearchResults?searchString=" + searchString,
                    success: function (SearchResultsModel) {
                        $('#searchResultsDiv').html("<ul class='searchResultList>");
                        $.each(SearchResultsModel.SearchResults, function (idx, searchResult) {
                            $('#searchResultsDiv').append("<li onclick='jumpToSelected(" + searchResult.FolderId + ")' onkeydown='linkItemKeyDown(event)'  >" + searchResult.Parent + "/" + searchResult.FolderName + "</li>");
                        });
                        $('#searchResultsDiv').append("</ul>").show();
                        //var kluge = "<ul class='searchResultList>";
                        ////kluge += "<li></li>";
                        //$.each(SearchResultsModel.SearchResults, function (idx, searchResult) {
                        //    kluge += "<li onclick='jumpToSelected(" + searchResult.FolderId + ")'>" + searchResult.Parent + "/" + searchResult.FolderName + "</li>";
                        //});
                        //kluge += "</ul>";
                        //alert("kluge: " + kluge);
                        //$('#searchResultsDiv').show().html(kluge);

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


function linkItemKeyDown(event) {
    var ev = event.keyCode;
    //$('#testtxt').text(ev);

    if (ev === 9) {  //  tab
        //alert("tab key pressed  Enter searchbox");
        $('#searchResultsDiv').find('li:first').addClass('selectedSearchItem').focus();
        event.preventDefault();
        window.event.returnValue = false;
    }


    if (ev === 38) {  //  down arrow
        return;
    }
}

