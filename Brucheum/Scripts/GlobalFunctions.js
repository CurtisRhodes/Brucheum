function displayStatusMessage(severity, message) {
	$('#divStatusMessage').removeClass();
	$('#divStatusMessage').addClass(severity);
	$('#divStatusMessage').html(message);
	$('#divStatusMessage').show();

    if (severity === "severityOk") {
		setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 2500);
	}
	else {
		$('#divStatusMessage').css("color", "#fff");
		setTimeout(function () { $('#divStatusMessage').hide("slow"); }, 15000);
	}
}

function clearModal() {
	$('#modalContainer').hide();
	$('#modalContent').html();
	$('.ql-editor p').show();
}

function PublicAlert(message) {
//var messHtml="

}

function beautify(stankyString) {
    if (stankyString === undefined)
        return stankyString;
	return stankyString.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/\n/g, "");
}

function formatDate(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    //var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear(); // + "  " + strTime;
}

function getXHRErrorDetails(jqXHR, exception) {
    var msg = '';
    if (jqXHR.status === 0) {
        msg = 'Not connect.\n Verify Network.';
    } else if (jqXHR.status === 404) {
        msg = 'Requested page not found. [404]';
    } else if (jqXHR.status === 500) {
        msg = 'Internal Server Error [500].';
    } else if (exception === 'parsererror') {
        msg = 'Requested JSON parse failed.';
    } else if (exception === 'timeout') {
        msg = 'Time out error.';
    } else if (exception === 'abort') {
        msg = 'Ajax request aborted.';
    } else {
        msg = 'Uncaught Error.\n' + jqXHR.responseText;
    }
    return msg;
}
