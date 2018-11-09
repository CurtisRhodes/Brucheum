
$(document).ready(function () {
	resizePage();
});

$(window).resize(function () {
	resizePage();
});

$('#middleColumn').resize(function () {
	resizePage();
});

function resizePage() {

    // set page width
    var winW = $(window).width();
	var lcW = $('#leftColumn').width();
	var rcW = $('#rightColumn').width();
	$('#middleColumn').width(winW - lcW - rcW);

    //set page height
    var winH = $(window).height();
    var mcH = $('#middleColumn').height();
    var hdrH = $('.Header').height();

    if (mcH + hdrH  < winH) {
        $('#middleColumn').height(winH - hdrH);
        mcH = $('#middleColumn').height();
        $('#footerMessage').append(" (mcH + hdrH  < winH) ");
    }
}

