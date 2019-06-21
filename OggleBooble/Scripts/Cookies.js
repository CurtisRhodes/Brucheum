
function ckeckCookie(userName) {
    var documentCookie = document.cookie;
    if (documentCookie === null) {
        var expires = new Date();
        expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
        document.cookie = 'User=' + userName + ';expires=' + expires.toUTCString();
        $('#footerMessage').html("new cookie set for: " + userName);
    }
    else {
        var cc = getCookie("User");
        if (cc === "") {
            expires = new Date();
            expires.setTime(expires.getTime() + (1 * 24 * 60 * 60 * 1000));
            document.cookie = 'User=' + userName + ';expires=' + expires.toUTCString();
            $('#footerMessage').html("cookie RESET for: " + userName);
        }
        else {
            $('#footerMessage').html("cookie found for: " + userName);
        }
    }
}

function getCookie(cname) {
    if (cname === null)
        cname = "User";
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return decodedCookie;
}
