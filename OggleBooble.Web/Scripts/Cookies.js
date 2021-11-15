
function getCookieValue(itemName, calledFrom) {
    let returnValue = "cookie not found";
    try {
        if (document.domain == "localhost" && itemName == "VisitorId") {
            return "ec6fb880-ddc2-4375-8237-021732907510";
        }
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookieElements = decodedCookie.split(";");
        let cookieItem, cookieItemName, cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split(":");
            cookieItemName = cookieItem[0].trim();
            cookieItemValue = cookieItem[1];
            if (cookieItemName === itemName) {
                if (!isNullorUndefined(cookieItemValue)) {
                    returnValue = cookieItemValue;
                    localStorage[itemName] = cookieItemValue;
                }
            }
        }
        if (returnValue == "cookie not found") {
            let storageValue = localStorage[itemName];
            if (!isNullorUndefined(storageValue)) {
                if (itemName == "VisitorId")
                    logActivity2(storageValue, "CK1", 1031122, "GET CookieValue/" + calledFrom); // local storage bypass
                else
                    logActivity2("unavailable", "CK1", 1031128, "GET CookieValue/" + calledFrom); // local storage bypass
                setCookieValue(itemName, returnValue, "GET CookieValue/" + calledFrom);
                returnValue = storageValue;
            }
            else {
                if (navigator.cookieEnabled) { // user accepts cookies
                    //returnValue = "not enabled not found";
                    if (calledFrom != "verify session")
                        logError2("unavailable", "CK2", 703245, "itemName: " + itemName + "  localStorage[itemName]: " + localStorage[itemName], "GET CookieValue/" + calledFrom); // cookies enabled. No local storage bypass
                }
                else {
                    logError2("unavailable", "CK3", 703245, "itemName: " + itemName, "GET CookieValue/" + calledFrom); // cookies NOT enabled. No local storage bypass
                }
            }
        }
    }
    catch (e) {
        if (isNullOrUndefined(e)) {
            logError2("unavailable", "CAT", 616329, e, "get CookieValue/" + calledFrom);
        }
        logError2("unavailable", "CAT", 616329, e, "get CookieValue/" + calledFrom);
    }
    return returnValue;
}

function setCookieValue(elementToSet, newValue, calledFrom) {
    try {
        if (!isNullorUndefined(newValue)) {
            localStorage[elementToSet] = newValue;
            let cookieString = elementToSet + ":" + newValue;
            document.cookie = cookieString;
        }
        else {
            logError2(create_UUID(), "BUG", 1104845, "newValue: " + newValue, "set CookieValue/" + calledFrom);
            //logError2(create_UUID(), "BUG", 1104845, "newValue NullorUndefined", "set CookieValue/" + calledFrom);
        }
    } catch (e) {
        logError2(create_UUID(), "CAT", 1105947, e, "set cookie/" + calledFrom);
    }
}

function createCookie(visitorId) {
    try {
        console.log("createCookie");
        //alert("createCookie");
        //cookies.remove("document.cookie");
        document.cookie = "expires=Thu, 01 Jan 1970 00: 00: 00 UTC; path =/;";

        alert("deleted decoded cookie: " + decodeURIComponent(document.cookie));

        expirydate = new Date();

        expirydate.setMonth(expirydate.getMonth() + 9);
        let cookiestring = ";VisitorId=" + visitorId + ";UserName=" + localStorage["UserName"] +
            "VisitorVerified=true;Isloggedin=" + localStorage["IsLoggedIn"] + ";expires=" + expirydate.toUTCString();
        document.cookie = cookiestring;


        var test1 = getCookieValue("Visitorid", "boogers");

        //alert("cookieTest1: " + test1);


        //alert("decoded cookie: " + decodeURIComponent(document.cookie));

    } catch (e) {
        console.log("createCookie CATCH " + e);
    }
}
