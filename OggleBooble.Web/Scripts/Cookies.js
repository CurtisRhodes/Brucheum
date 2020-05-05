function xxdeleteCookie() {

    window.localStorage["UserName"] = null;
    window.localStorage["IpAddress"] = null;
    window.localStorage["VisitorId"] = null;
    window.localStorage["UserName"] = null;
    window.localStorage["userPermissons"] = null;

    var expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() - 1);

    document.cookie = "expires:" + expiryDate.toUTCString();
    if (!isNullorUndefined(getCookieValue("UserName"))) {
        logError({
            VisitorId: getCookieValue("VisitorId"),
            ActivityCode: "JQ6",
            Severity: 2,
            ErrorMessage: "Delete Cookie Fail After Logout UserName: " + getCookieValue("UserName"),
            CalledFrom: "showLoginDialog"
        });
        //sendEmailToYourself("Delete Cookie Fail", "After Logout UserName: " + getCookieValue("UserName"));
        if (document.domain === 'localhost')  // #DEBUG
            alert("After Logout User: " + getCookieValue("UserName"));
        if (document.cookie) {
            if (document.domain === 'localhost')
                alert("cookie failed to delete: " + document.cookie);
        }
        //console.log("deleteCookie()  document.cookie: " + document.cookie);
    }
}

function setCookieValue(elementName, elementValue) {
    //alert("setCookieValue(" + elementName + "," + elementValue + ")");
    window.localStorage[elementName] = elementValue;

    var decodedCookie = "";
    if (document.cookie) {
        var ipAddress = getCookieValue("IpAddress");
        var visitorId = getCookieValue("VisitorId");
        var userName = getCookieValue("UserName");
        var isLoggedIn = getCookieValue("IsLoggedIn");
        decodedCookie = decodeURIComponent(document.cookie);
        var cookieElements = decodedCookie.split(';');
        var cookieItem; var cookieItemName; var cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i];
            cookieItemName = cookieItem.substring(0, cookieItem.indexOf("="));
            cookieItemValue = cookieItem.substring(cookieItem.indexOf("=") + 1);
            if (cookieItemName === "UserName") userName = cookieItemValue;
            if (cookieItemName === "IpAddress") ipAddress = cookieItemValue;
            if (cookieItemName === "VisitorId") visitorId = cookieItemValue;
            if (cookieItemName === "IsLoggedIn") isLoggedIn = cookieItemValue;
        }
    }

    if (elementName === "IsLoggedIn") isLoggedIn = elementValue;
    if (elementName === "UserName") userName = elementValue;
    if (elementName === "IpAddress") ipAddress = elementValue;
    if (elementName === "VisitorId") visitorId = elementValue;
    //deleteCookie();
    expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 9);
    //var cookieString = "VisitorId=" + visitorId + ";IpAddress=" + ipAddress + ";User=" + user + ";path='/;expires=" + expiryDate.toUTCString();
    var cookieString = "VisitorId:" + visitorId + ",IpAddress:" + ipAddress + ",UserName:" + userName + ",IsLoggedIn:" + isLoggedIn + ",path:'/,expires:" + expiryDate.toUTCString();
    document.cookie = cookieString;
    //alert("setCookieValue(" + elementName + "," + elementValue + ")\ncookie:\n" + document.cookie);
}

function getCookieValue(itemName) {
    var returnValue = window.localStorage[itemName];

    if (isNullorUndefined(returnValue)) {
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookieElements = decodedCookie.split(',');
        var cookieItem; var cookieItemName; var cookieItemValue;
        for (var i = 0; i < cookieElements.length; i++) {
            cookieItem = cookieElements[i].split(':');
            cookieItemName = cookieItem[0].trim();//.substring(0, cookieElements[i].indexOf("=")).trim();
            cookieItemValue = cookieItem[1];//.substring(cookieElements[i].indexOf("=") + 1);
            if (cookieItemName === itemName) {
                //if (!isNullorUndefined(cookieItemValue))
                //  alert("cookeie value FOUND. " + itemName + " = " + cookieItemValue);
                returnValue = cookieItemValue;
                break;
            }
        }
    }
    return returnValue;
}

function setLocalValue(localName, localValue) {
    alert("setLocalStorage[" + localName + "] = " + localValue);
    window.localStorage[localName] = localValue;
}

function getLocalValue(localName) {
    var localValue = getCookieValue(localName);
    return localValue;
}




