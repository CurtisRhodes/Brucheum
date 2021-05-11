function getCookieValue(itemName, calledFrom) {
    let returnValue = "not found"; // window.localStorage[itemName];
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieElements = decodedCookie.split(";");
    let cookieItem, cookieItemName, cookieItemValue;

    //alert("cookieElements: " + cookieElements);

    for (var i = 0; i < cookieElements.length; i++) {
        cookieItem = cookieElements[i].split(":");
        cookieItemName = cookieItem[0].trim();//.substring(0, cookieElements[i].indexOf("=")).trim();
        cookieItemValue = cookieItem[1];//.substring(cookieElements[i].indexOf("=") + 1);

        alert("cookieItemName: " + cookieItemName);

        if (cookieItemName === itemName) {
            alert("cookie value FOUND. " + itemName + " = " + cookieItemValue);
            returnValue = cookieItemValue;
            break;
        }
    }
    if (returnValue == "not found") {
        //alert("get CookieValue called from: " + calledFrom + "\nitemName: " + itemName + "  returnValue: " + returnValue);
        returnValue = "cookie not found";
    }
    return returnValue;
}

function setCookieValue(elementToSet, newValue) {
    alert("calling setCookieValue.  set:" + elementToSet + " to: " + newValue);
    try {
        //let returnValue = window.localStorage[itemName];
        //window.localStorage[elementName] = elementValue;
        if (document.cookie) {
            let decodedCookie = decodeURIComponent(document.cookie);
            let cookieElements = decodedCookie.split(",");

            //alert("cookieElements: " + cookieElements);

            let elementFound = false;
            let cookieItem, cookieItemName, reconstitutedCookie = "?";
            for (var i = 0; i < cookieElements.length; i++) {
                cookieItem = cookieElements[i];
                cookieItemName = cookieItem.substring(0, cookieItem.indexOf("="));
                cookieItemValue = cookieItem.substring(cookieItem.indexOf("=") + 1);

                if (elementToSet == cookieItemName) {
                    elementFound = true;
                    if (cookieItemName != newValue) {
                        //expiryDate = new Date();
                        //expiryDate.setMonth(expiryDate.getMonth() + 9);
                        //decodedCookie = decodedCookie.substring(decodedCookie.indexOf("expires")+22,)
                        reconstitutedCookie = decodedCookie.replace(cookieItem, elementToSet + "=" + newValue);
                        alert("setCookieValue success: " + reconstitutedCookie);
                    }
                    else
                        alert("existing value for: " + elementToSet + "already: " + newValue);
                    break
                }
            }
            if (!elementFound) {
                //alert("setCookieValue  " + elementToSet + "not found in cookie");
                expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 9);
                let winStorageVisId = window.localStorage["VisitorId"];
                let cookieString = "VisitorId:" + winStorageVisId + ",expires:" + expiryDate.toUTCString();
                //let cookieString = "VisitorId:" + winStorageVisId + ",UserName:" + userName + ",IsLoggedIn:" + isLoggedIn + ",path:'/,expires:" + expiryDate.toUTCString();

                document.cookie = cookieString;

                //decodedCookie = decodeURIComponent(document.cookie);
                //cookieElements = decodedCookie.split(",");
                //alert("New cookieElements: " + cookieElements);
            }



            if (reconstitutedCookie != "?") {
                //deleteCookie();
                document.cookie = "";

                expiryDate = new Date();
                expiryDate.setMonth(expiryDate.getMonth() + 9);
                let cookieString = "VisitorId:" + visitorId + ",UserName:" + userName + ",IsLoggedIn:" + isLoggedIn + ",path:'/,expires:" + expiryDate.toUTCString();

                alert("reconstructed cookieString:\n" + cookieString);
                document.cookie = cookieString;
                //alert("setCookieValue(" + elementName + "," + elementValue + ")\ncookie:\n" + document.cookie);
            }
        }
        else {
            alert("no cookie found");
        }
        //    createCookie();

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

