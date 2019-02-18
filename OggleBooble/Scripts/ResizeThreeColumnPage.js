
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
   // $('.renderBody').css("margin-top", $('#oggleBoobleHeader').height());

    $('#footerMessage').html("header: " + $('#oggleBoobleHeader').height());

    // adjust width
    var winW = $(window).width();
    var lcW = $('#leftColumn').width();
    var rcW = $('#rightColumn').width();
    $('#middleColumn').width(winW - lcW - rcW);

    var headerHeight = $('footer').height();
    var footerHeight = $('footer').height();
    var winH = $(window).height();
    var docH = $(Document).height();
    //$('#middleColumn').height(winH + footerHeight);


    ////set page height
    //var winH = $(window).height();
    var mcH = $('#middleColumn').height();
    var hdrH = $('#bheader').height();

    //alert("$('.Header').height(): " + hdrH);

    //if (mcH + hdrH < winH)
    {
        $('#middleColumn').height(winH - hdrH);
        //mcH = $('#middleColumn').height();
        //$('#footerMessage').append(" (mcH + hdrH  < winH) ");
    }


    //$('.threeColumnArray').height(docH);
    //$('#middleColumn').height(docH - headerHeight);

    //if()
    //- $('#bheader').height();
    //$('#middleColumn').height(winH-headerHeight);

    //if ($('.threeColumnArray').height() < winH) {
    //	$('.threeColumnArray').height(winH);
    //}
    //var tcH = $('.threeColumnArray').height();
    //var mcH = $('#middleColumn').height();

    //if (tcH < mcH) {
    //	//alert("rz 3col: " + tcH + " mcH: " + mcH);
    //	$('.threeColumnArray').height(mcH);
    //	//alert("rz 3col: " + $('.threeColumnArray').height() + "  mcH: " + mcH);
    //}
    //else {
    //	alert("rz 3col: " + $('.threeColumnArray').height() + "  mcH: " + mcH);
    //}

    if (debug !== undefined) {
        $('#footerMessage').html(debug);
    }
}

