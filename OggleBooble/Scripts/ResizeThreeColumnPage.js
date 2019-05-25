
$(document).ready(function () {
   // alert("resize from documant ready");
    resizePage("resize from documant ready");
});

$(window).resize(function () {
    //alert("resize from windowResize");
	resizePage("resize from windowResize");
});

$('#middleColumn').resize(function () {
    alert("$('#middleColumn').resize");
	resizePage("resize from middle column resize");
});

function resizePage(debug) {
    // adjust width
    var winW = $(window).width();
    var lcW = $('#leftColumn').width();
    var rcW = $('#rightColumn').width();
    $('#middleColumn').width(winW - lcW - rcW);

    ////set page height
    var hdrH = $('#bheader').height();
    var winH = $(window).height() - 10;

    //alert("winH: " + winH);

    $('#middleColumn').height(winH - hdrH);

    //if (debug !== undefined) {
    //    $('#footerMessage').append("resize debug: " + debug);
    //}
}

