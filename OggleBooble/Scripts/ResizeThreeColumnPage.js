﻿
$(document).ready(function () {
	resizePage();
});

$(window).resize(function () {
	resizePage();
});

$('#middleColumn').resize(function () {
	resizePage();
});

function resizePage(debug) {
    //alert("here  resizePage()");

    $('.RenderBody').css("margin-top", $('#bheader').height());
    //$('#footerMessage').html("resizePage  $('#bheader').height(): " + $('#bheader').height() + "  " + $('.RenderBody').css("margin-top"));
    //alert("resizePage  $('#bheader').height(): " + $('#bheader').height() + "  " + $('.RenderBody').css("margin-top"));


	var winW = $(window).width();
	var lcW = $('#leftColumn').width();
	var rcW = $('#rightColumn').width();
	var horzPpadding = 60;

	//$('#middleColumn').width(winW - lcW - rcW - horzPpadding);
	$('#middleColumn').width(winW - lcW - rcW);


	var winH = $(window).height() - $('#bheader').height();
    $('#middleColumn').height(winH);

    if ($('.threeColumnArray').height() < winH) {
		$('.threeColumnArray').height(winH);
	}
	var tcH = $('.threeColumnArray').height();
	var mcH = $('#middleColumn').height();

	if (tcH < mcH) {
		//alert("rz 3col: " + tcH + " mcH: " + mcH);
		$('.threeColumnArray').height(mcH);
		//alert("rz 3col: " + $('.threeColumnArray').height() + "  mcH: " + mcH);
	}
	//else {
	//	alert("rz 3col: " + $('.threeColumnArray').height() + "  mcH: " + mcH);
	//}

    if (debug !== undefined) {
        alert(debug);
    }

}

