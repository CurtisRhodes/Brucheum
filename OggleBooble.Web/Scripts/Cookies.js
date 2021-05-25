
function getCookieValue(itemName) {
    let returnValue = "not found";
    try {
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookieElements = decodedCookie.split(";");
        let cookieItem, cookieItemName, cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split(":");
            cookieItemName = cookieItem[0].trim();
            cookieItemValue = cookieItem[1];
            if (cookieItemName === itemName) {
                //alert("cookie value FOUND. " + itemName + " = " + cookieItemValue);
                localStorage[itemName] = cookieItemValue;
                returnValue = cookieItemValue;
                break;
            }
        }
        if (returnValue == "not found") {
            if (!isNullorUndefined(localStorage[itemName])) {
                console.log("localStorage[" + itemName + "] set to: " + localStorage[itemName] + " and cookie not found");
                setCookieValue(itemName, localStorage[itemName]);
                returnValue = localStorage[itemName];
            }
        }
    } catch (e) {

    }
    return returnValue;
}

function setCookieValue(elementToSet, newValue) {
    try
    {
        localStorage[elementToSet] = newValue;
        let cookieString = elementToSet + ":" + newValue;
        document.cookie = cookieString;
        console.log("calling setCookieValue.  set:" + elementToSet + " to: " + newValue);
    } catch (e) {
        alert("setcookie CATCH Error: " + e);
        logError("CAT", 111, e, "setCookieValue");
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

