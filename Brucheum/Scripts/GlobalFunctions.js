function displayStatusMessage(severity, message) {
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
