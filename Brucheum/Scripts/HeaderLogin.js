
//$(document).ready(function () {
//    $('.headerBody').width($('.Header').width() - $('#bannerImage').width() - 200);
//});
//$(window).resize(function () {
//    $('.headerBody').width($('.Header').width() - $('#bannerImage').width() - 200);
//});


function callRegisterPopup() {
    //$('.tabRegister').click(function () {
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
}
function callLoginPopup() {
    //alert("tabLogIn");
    try {
        $.ajax({
            type: "POST",
            url: "/Login/LoginPopup",
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
}
function callProfilePopup() {
    //$('#tabProfile').click(function () {
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
}
function callLogout() {
    try {
        $.ajax({
            type: "get",
            url: "/login/Logout",
            success: function (success) {
                if (success === "ok")
                    location.reload(true);
                else
                    alert("callLogout: " + success);
            },
            error: function (xhr) {
                alert("callLogout XHR error: " + xhr.statusText);
            }
        });
    } catch (e) {
        alert("callLogout catch: " + e);
    }
}
