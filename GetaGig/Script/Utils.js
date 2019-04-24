function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}

$(window).resize(function () {
    resizePage();
});

function resizePage() {

    // set page width
    var winW = $(window).width();
    var lcW = $('.leftColumn').width();
    var rcW = $('.rightColumn').width();
    $('.middleColumn').width(winW - lcW - rcW);

    //set page height
    var winH = $(window).height();
    var mcH = $('.middleColumn').height();
    var hdrH = $('#bheader').height();

    //alert("$('.Header').height(): " + hdrH);

    if (mcH + hdrH < winH) {
        $('.middleColumn').height(winH - hdrH);
        mcH = $('.middleColumn').height();
        $('#footerMessage').html(" mcH: (" + mcH + ") hdrH(" + hdrH + " < winH (" + winH + ")");
    }
    else {
        $('#footerMessage').html("winH: " + winH + "  mcH: " + mcH);
    }
}

function getXHRErrorDetails(jqXHR) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status === 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status === 500) {
        msg = 'Internal Server Error [500].';

    } else if (jqXHR.responseText === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (jqXHR.responseText === 'timeout') {
        msg = 'Time out error.';
    } else if (jqXHR.responseText === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    return msg;
}

function isNullorUndefined(val) {
    if (val === "")
        return true;
    if (val === null)
        return true;
    if (val === undefined)
        return true;
    return false;
}