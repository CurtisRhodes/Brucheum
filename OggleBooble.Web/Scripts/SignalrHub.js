"use strict";

let signalr = new signalR.HubConnectionBuilder().withUrl("/messageHub").build();

//Disable send button until connection is established
document.getElementById("sendButton").disabled = true;

signalr.on("ReceiveMessage", function (user, message) {
    let msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    let encodedMsg = user + " says " + msg;
    //var li = document.createElement("li");
    //li.textContent = encodedMsg;
    alert(encodedMsg);
    $('#dataifyInfo').show().html(encodedMsg);

    //document.getElementById("messagesList").appendChild(li);
});

signalr.start().then(function () {
    document.getElementById("sendButton").disabled = false;
    alert("signalR start");
    console.log("signalR start");
}).catch(function (err) {
    return console.error(err.toString());
});

function sendSignalR(message) {
    signalr.invoke("SendMessage", "user", message).catch(function (err) {
        alert("fff " + err.toString());
        return console.error(err.toString());
    });
    event.preventDefault();
}

//document.getElementById("sendButton").addEventListener("click", function (event) {
//    var user = document.getElementById("userInput").value;
//    var message = document.getElementById("messageInput").value;
//    connection.invoke("SendMessage", user, message).catch(function (err) {
//        return console.error(err.toString());
//    });
//    event.preventDefault();
//});