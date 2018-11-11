
$(document).ready(function () {
    $('.headerBody').width($('.Header').width() - $('#bannerImage').width() - 200);
});
$(window).resize(function () {
    $('.headerBody').width($('.Header').width() - $('#bannerImage').width() - 200);
});

$('.tabRegister').click(function () {
    $.ajax({
        type: "get",
        url: "/Login/Register",
        datatype: "json",
        success: function (data) {
            $('#modalContent').html(data);
            $('#modalContainer').show();
        },
        error: function (xhr) {
            alert("RegisterPopup error: " + xhr.statusText);
        }
    });
});

$('.tabLogIn').click(function () {
    alert("tabLogIn");
    try {
        $.ajax({
            type: "get",
            url: "/Login/Login",
            datatype: "json",
            success: function (data) {
                $('#modalContent').html(data);
                $('#modalContainer').show();
            },
            error: function (xhr) {
                alert("LoginPopup error: " + xhr.statusText);
            }
        });

    } catch (e) {
        alert("tabLogIn :" + e);
    }
});

$('#tabProfile').click(function () {
    try {
        $.ajax({
            type: "get",
            url: "/Login/ProfilePopup",
            datatype: "json",
            success: function (data) {
                $('#modalContent').html(data);
                $('#modalContainer').show();
            },
            error: function (xhr) {
                alert("ProfilePopup error: " + xhr.statusText);
            }
        });
    } catch (e) {
        alert("tabProfile catch: " + e);
    }
});

$('#tabLogout').click(function () {
    $.ajax({
        type: "get",
        url: "/Login/Logout",
        success: function (success) {
            if (success === "ok")
                //$("#divlogin").load(location.href + " #divlogin");
                location.reload(true);
            else
                alert("LogOUT: " + success);
        },
        error: function (xhr) {
            displayStatusMessage("severityError", "error: " + xhr.statusText);
            alert("tabLogout error: " + xhr.statusText);
        }
    });
});
