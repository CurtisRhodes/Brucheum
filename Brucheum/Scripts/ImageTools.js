
function postImage(service, fileName) {
	try {
		fileName = fileName.substring(fileName.lastIndexOf("\\") + 1);
        var image = $('#uplImage')[0].files[0];
        //var data = "{'imageName':'" + fileName + "'image':'" + image + "'}";
		var serverImageName;
		if (image !== null) {
			//alert("url: " + service + "/api/Images");
            $.ajax({
                url: service + "/api/Images?fileName=" + fileName,
                type: "POST",
                enctype: 'multipart/form-data',
                processData: false,  // Important!
                contentType: false,
                async: false,
                cache: false,
                data: image,
                success: function (data) {
                    //displayStatusMessage("alert-success", data + " Image Uploaded");
                    //$('#bImage').attr("src", URL.createObjectURL(image));
                    //$('#hiddenImageName').val(data);
                    //alert("data: " + data);
                    serverImageName = data;
                },
                error: function (xhr) {
                    alert("PostTimage error: " + xhr.statusText);
                }
            });

		}
		else {
			alert("ERROR: image == null")
			//displayStatusMessage("alert-danger", "ERROR: not working");
		}
		return serverImageName;
	} catch (e) {
		//displayStatusMessage("alert-danger", "ERROR t: " + e);
		alert("try catch ERROR : " + e);
	}
}

function getImage(service, fileName) {
	var bytes;
	try {
		$.ajax({
            url: service + "/api/Images?fileName=" + fileName,
			type: "get",
			async: false,
			processData: false,  // Important!
			contentType: false,
			success: function (image) {
				bytes = image;
			},
			error: function (xhr, textStatus, error) {
				displayStatusMessage("alert-danger", "status: " + textStatus + " text: " + xhr.statusText + " error: " + error);
				alert("getImage: " + xhr.statusText + " imageName: " + imageName);
			}
		});
		return bytes;
	} catch (e) {
		alert("javascript error: " + e);
	}
}
