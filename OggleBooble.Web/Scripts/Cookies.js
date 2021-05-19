
function getCookieValue(itemName) {
    let returnValue = "not found"; 
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
        }
    }
    return returnValue;
}

function setCookieValue(elementToSet, newValue) {
    //alert("calling setCookieValue.  set:" + elementToSet + " to: " + newValue);
    try {

        let cookieString = elementToSet + ": " + newValue;
        //let cookieString = "VisitorId:" + winStorageVisId + ",UserName:" + userName + ",IsLoggedIn:" + isLoggedIn + ",path:'/,expires:" + expiryDate.toUTCString();
        document.cookie = cookieString;

        return;

        //let curCookieValue = getCookieValue(elementToSet);
        //if (newValue == curCookieValue) {
        //    logActivity("CC3", 225519, "setCookieValue"); // attempt to set cookie to its existing value
        //    return;
        //}
        //if (localStorage[elementToSet] != newValue) {
        //    console.log("localStorage[" + elementToSet + "] set from: " + localStorage[elementToSet] + "  to: " + newValue);
        //    localStorage[elementToSet] = newValue;
        //}

        //let spValue = window.localStorage[itemName];
        //if (document.cookie) {
        //    let decodedCookie = decodeURIComponent(document.cookie);
        //    let cookieElements = decodedCookie.split(",");

        //    //alert("cookieElements: " + cookieElements);
        //    let elementFound = false;
        //    let cookieItem, cookieItemName;
        //    for (var i = 0; i < cookieElements.length; i++) {
        //        cookieItem = cookieElements[i];
        //        cookieItemName = cookieItem.substring(0, cookieItem.indexOf("="));
        //        cookieItemValue = cookieItem.substring(cookieItem.indexOf("=") + 1);
        //        if (elementToSet == cookieItemName) {
        //            elementFound = true;
        //        }
        //    }
        //    if (elementFound) {
        //        expiryDate = new Date();
        //        expiryDate.setMonth(expiryDate.getMonth() + 9);
        //        let cookieString = elementToSet + ":" + newValue + ", expires: " + expiryDate.toUTCString();
        //        //let cookieString = "VisitorId:" + winStorageVisId + ",UserName:" + userName + ",IsLoggedIn:" + isLoggedIn + ",path:'/,expires:" + expiryDate.toUTCString();
        //        document.cookie = cookieString;
        //        //decodedCookie = decodeURIComponent(document.cookie);
        //        //cookieElements = decodedCookie.split(",");
        //        //alert("New cookieElements: " + cookieElements);
        //    }
        //    else {
        //        logError("CTF", 4455438, "elementToSet: " + elementToSet, "setCookieValue");
        //    }



        //    }
        //    else {
        //        alert("no cookie found");
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

