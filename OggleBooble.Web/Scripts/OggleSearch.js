var busy = false;
var searchString = "";
var itemIndex = -1;
var listboxActive = false;
var currentFolderId;


function startOggleSearch(folderId) {
    currentFolderId = folderId;
}

function oggleSearchKeyDown(event) {
    var ev = event.keyCode;
    if (!listboxActive) {

        if (ev === 9 || ev === 40) {  //  tab
            event.preventDefault();
            itemIndex = 1;
            listboxActive = true;
            $('#searchResultsDiv').find('li:first').addClass('selectedSearchItem').focus();
            return false;
        }
        if (ev === 27) {  //  escape
            clearSearch();
            return;
        }
        if (ev === 8) {  //  backspace
            if (searchString.length > 0)
                searchString = searchString.substring(0, searchString.length - 1);
            performSearch(searchString);
            return;
        }
        if (ev === 13) {  // enter

            var selectedItem = $('#searchResultsDiv').find('li:first').prop("id");

            jumpToSelected(selectedItem);
            return;
        }

        if (ev !== 46 && ev > 31 && (ev < 48 || ev > 57)) {
            searchString += String.fromCharCode(ev);
            performSearch(searchString);
        }
    }
    else {
       // $('#headerMessage').html("LBA: " + ev);
        var kludge;

        if (ev === 40) {  // down arrow
            if (itemIndex < $('#searchResultsDiv').children().length) {
                $('#searchResultsDiv').children().removeClass('selectedSearchItem');
                kludge = "li:nth-child(" + ++itemIndex + ")";
                $('#searchResultsDiv').find(kludge).addClass('selectedSearchItem').focus();
               // $('#headerMessage').html("down: " + itemIndex);
            }
        }
        if (ev === 38) {  // up arrow
            if (itemIndex > 1) {
                $('#searchResultsDiv').children().removeClass('selectedSearchItem');
                kludge = "li:nth-child(" + --itemIndex + ")";
                $('#searchResultsDiv').find(kludge).addClass('selectedSearchItem').focus();
             //   $('#headerMessage').html("up: " + itemIndex);
            }
        }
        if (ev === 13) {  // enter
            kludge = "li:nth-child(" + itemIndex + ")";
            var id = $('#searchResultsDiv').find(kludge).prop("id");
            jumpToSelected($('#searchResultsDiv').find(kludge).prop("id"));
        }
        if (ev === 27) {  //  escape
            clearSearch();
            return;
        }
    }
}

function performSearch(searchString) {
    if (searchString.length > 2) {
        if (!busy) {
            busy = true;
            $.ajax({
                type: "GET",
                url: settingsArray.ApiServer + "api/Folder/GetSearchResults?searchString=" + searchString,
                success: function (SearchResultsModel) {
                    $('#searchResultsDiv').html("<ul class='searchResultList>").show();
                    $.each(SearchResultsModel.SearchResults, function (idx, searchResult) {
                        $('#searchResultsDiv').append("<li id=" + searchResult.FolderId +
                            " onclick='jumpToSelected(" + searchResult.FolderId + ")' onkeydown='linkItemKeyDown(event)'  >" +
                            searchResult.Parent + "/" + searchResult.FolderName + "</li>");
                    });
                    $('#searchResultsDiv').append("</ul>").show();
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
    listboxActive = false;
    searchString = "";
    $('#txtSearch').val("");
    $('#searchResultsDiv').hide();
}

function jumpToSelected(selectedFolderId) {
    reportThenPerformEvent('SRC', currentFolderId, "", selectedFolderId);
    //window.open("/album.html?folder=" + selectedFolderId, "_blank");
    clearSearch();
}

function linkItemKeyDown(event) {
    alert("linkItemKeyDown");
}

