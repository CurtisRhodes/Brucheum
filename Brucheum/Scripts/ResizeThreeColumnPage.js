
//$(document).ready(function () {
//	resizePage();
//});

$(window).resize(function () {
    //alert("$(window).resize()");
	resizePage();
});

//$('#middleColumn').resize(function () {
//	resizePage();
//});

function resizePage() {

    // set page width
    var winW = $(window).width();
	var lcW = $('#leftColumn').width();
	var rcW = $('#rightColumn').width();
	$('#middleColumn').width(winW - lcW - rcW);

    //set page height
    var winH = $(window).height();
    var mcH = $('#middleColumn').height();
    var hdrH = $('#bheader').height();

    //alert("$('.Header').height(): " + hdrH);

    if (mcH + hdrH  < winH) {
        $('#middleColumn').height(winH - hdrH);
        mcH = $('#middleColumn').height();
        //$('#footerMessage').append(" (mcH + hdrH  < winH) ");
    }
}

