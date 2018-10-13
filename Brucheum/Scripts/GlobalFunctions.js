﻿function displayStatusMessage(severity, message) {
	$('#divStatusMessage').removeClass();
	$('#divStatusMessage').addClass(severity);
	$('#divStatusMessage').html(message);
	$('#divStatusMessage').show();

	if (severity === "alert-success") {
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
	return stankyString.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, "\"")
		.replace(/&#39;/g, "'")
		.replace(/&nbsp;/g, " ")
		.replace(/\n/g, "");
}

function SetBrucheumCookie(userName, userId, useCookie) {
	try {
		//alert("SetBrucheumCookie userName: " + userName + "userId: " + userId + "useCookie: " + useCookie);
		$.ajax({
			type: "get",
			url: "/Login/SetBrucheumCookie?userName=" + userName + "&userId=" + userId + "&useCookie=" + useCookie,
			datatype: "json",
			success: function (success) {
				if (success === "ok")
					$("#divlogin").load(location.href + " #divlogin");
				else
					alert("SetBrucheumCookie error: " + success);
			},
			error: function (xhr) {
				displayStatusMessage("alert-danger", "error: " + xhr.statusText);
				alert("SetBrucheumCookie  error: " + xhr.statusText);
			}
		});
	} catch (e) {
		alert("SetBrucheumCookie  catch: " + e);
	}
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
