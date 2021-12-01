﻿
function getCookieValue(itemName, calledFrom) {
    let returnValue = "cookie not found";
    try {
        //if (document.domain == "localhost" && itemName == "VisitorId") return "ec6fb880-ddc2-4375-8237-021732907510";
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookieElements = decodedCookie.split(";");
        let cookieItem, cookieItemName, cookieItemValue;
        try {

            for (var i = 0; i < cookieElements.length; i++) {
                cookieItem = cookieElements[i].split("=");
                cookieItemName = cookieItem[0].trim();
                cookieItemValue = cookieItem[1];
                if (cookieItemName === itemName) {
                    if (!isNullorUndefined(cookieItemValue)) {
                        returnValue = cookieItemValue;
                        localStorage[itemName] = cookieItemValue;
                        //logActivity2(localStorage["VisitorId"], "CK0", 1031122, "GET CookieValue/" + calledFrom); // cookie actually worked
                        break;
                    }
                }
            }
        } catch (e) {
            logError2("unavailable", "CAT", 1130222, e, "get Cookie for loop/" + calledFrom);

        }

        if (returnValue == "cookie not found") {

            if (!isNullorUndefined(localStorage[itemName])) {
                try {
                    returnValue = localStorage[itemName];
                    rebuildCookie();
                    //    if (itemName == "VisitorId")
                    //        logActivity2(localStorage["VisitorId"], "CK1", 1031122, "GET CookieValue/" + calledFrom); // local storage bypass
                    //    else
                    //        logActivity2("unavailable", "CK1", 1031128, "itemName: " + itemName + ". calledFrom: " + calledFrom); // local storage bypass
                } catch (e) {
                    logError2("lamieer", "CAT", 1130111, e, "get Cookie happy path" + calledFrom);
                }
            }
            else {
                if (itemName == "VisitorId") {
                    if (calledFrom != "verify session") {
                        try {
                            let newVisId = create_UUID();
                            localStorage["VisitorId"] = newVisId;
                            //rebuildCookie();
                            addVisitor(newVisId, 1111, "cookie not found");
                            returnValue = newVisId;
                            logError2(newVisId, "CK2", 703245, "calledFrom: " + calledFrom + ". navigator.cookieEnabled: " + navigator.cookieEnabled); // visitor added from get cookie
                        } catch (e) {
                            logError2("wlf", "CAT", 1130111, e, "get Cookie add visitor" + calledFrom);
                        }
                    }
                }
                else {
                    if (itemName == "IsLoggedIn") {
                        localStorage["IsLoggedIn"] = "false";
                        returnValue = "false";
                        //rebuildCookie();
                    }
                    else {
                        logError2("unavailable", "CK3", 703245, "itemName: " + itemName + ". navigator.cookieEnabled: " + navigator.cookieEnabled + "calledFrom:" + calledFrom); // No local storage bypass
                    }
                }
            }
        }
        //else logActivity2(returnValue, "CK0", 11151150, "navigator.cookieEnabled: " + navigator.cookieEnabled); // cookie test ok
    }
    catch (ex) {
        logError2("unavailable", "CAT", 1130123, "returnValue: " + returnValue + ". ex: " + ex, "get Cookie outer fail/" + calledFrom);
    }
    finally {
        return returnValue;
    }
}

function rebuildCookie() {
    try {
        //console.log("createCookie");

        //expirydate = new Date();
        //expirydate.setMonth(expirydate.getMonth() + 9);
        //document.cookie = "expires=" + expirydate.toUTCString();

        //let browser = window.navigator.appName;
        //if (browser == "chrome") {
        document.cookie = "VisitorId=" + localStorage["VisitorId"];
        document.cookie = "UserName=" + localStorage["UserName"];
        //}
        //else {
        //let cookiestring = "VisitorId=" + localStorage["VisitorId"] +
        //    ";UserName=" + localStorage["UserName"] +
        //    ";VisitorVerified=true" +
        //    ";IsloggedIn=" + localStorage["IsLoggedIn"] +
        //    ";expires=" + expirydate.toUTCString() + "path=/";
        //document.cookie = cookiestring;
        //}

    } catch (e) {
        logError2(localStorage["VisitorId"], "CAT", 333, e, "rebuild Cookie");
    }
}
