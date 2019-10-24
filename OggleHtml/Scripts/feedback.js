function _classCallCheck(b, a) {
    if (!(b instanceof a)) throw new TypeError("Cannot call a class as a function");
}
var Feedback = function () {
    function b(a) {
        _classCallCheck(this, b);
        this.feedbackClass = a.feedbackClass;
        this.feedbackBtnClass = a.feedbackBtnClass;
        this.closeBtnClass = a.closeBtnClass;
        this.resultClass = a.resultClass;
        this.sendBtnClass = a.sendBtnClass;
        this.typeSelectorClass = a.typeSelectorClass;
        this.emailElId = a.emailElId;
        this.messageElId = a.messageElId;
        this.scriptUrl = a.scriptUrl;
        this.url = window.location.href;
        this.currentType = "Suggestion";
        this.init = this.init.bind(this);
        this.onCloseBtnClick = this.onCloseBtnClick.bind(this);
        this.onTypeSelectorClick = this.onTypeSelectorClick.bind(this);
        this.onSendBtnClick = this.onSendBtnClick.bind(this);
        this.open = this.open.bind(this);
        this.close = this.close.bind(this);
        document.addEventListener("DOMContentLoaded", this.init);
    }
    b.prototype.init = function () {
        this.getInterfaceElements();
        this.feedbackBtn.addEventListener("click", this.open);
    };
    b.prototype.open = function () {
        this.setEvents();
        this.bodyEl.classList.add("static");
        this.feedback.style.display = "flex";
        document.body.style.overflow = "hidden";
        this.getData();
    };
    b.prototype.close = function () {
        this.removeEvents();
        this.bodyEl.classList.remove("static");
        this.feedback.style.display = "none";
        document.body.style.overflow = "auto";
        this.result.style.display = "none";
    };
    b.prototype.showMessage = function () {
        var a = this;
        setTimeout(function () {
            a.result.style.display = "block";
        }, 150);
        setTimeout(this.close, 2E3);
    };
    b.prototype.getData = function () {
        this.os = this.getOSDetails();
        this.browser = this.getBrowserDetails();
        this.cookie = this.checkCookie();
        this.ls = this.checkLocalStorage();
    };
    b.prototype.getBrowserDetails =
        function () {
            var a = navigator.userAgent,
                b = navigator.appName,
                d = "" + parseFloat(navigator.appVersion);
            parseInt(navigator.appVersion, 10);
            var e = void 0,
                c = void 0; - 1 !== (c = a.indexOf("Opera")) ? (b = "Opera", d = a.substring(c + 6), -1 !== (c = a.indexOf("Version")) &&
                    (d = a.substring(c + 8))) : -1 !== navigator.userAgent.indexOf("MSIE") ? (c = navigator.userAgent.indexOf("MSIE"),
                        b = "Microsoft Internet Explorer", d = a.substring(c + 5)) : -1 !== navigator.userAgent.indexOf("Chrome") ?
                            (c = navigator.userAgent.indexOf("Chrome"), b = "Chrome", d = a.substring(c +
                                7)) : -1 !== navigator.userAgent.indexOf("Safari") ? (c = navigator.userAgent.indexOf("Safari"),
                                    b = "Safari", d = a.substring(c + 7), -1 !== (c = a.indexOf("Version")) &&
                                    (d = a.substring(c + 8))) : -1 !== navigator.userAgent.indexOf("Firefox") ?
                                    (c = navigator.userAgent.indexOf("Firefox"), b = "Firefox", d = a.substring(c + 8)) :
                                    (e = a.lastIndexOf(" ") + 1) < (c = a.lastIndexOf("/")) &&
                                    (b = a.substring(e, c), d = a.substring(c + 1), b.toLowerCase() === b.toUpperCase() && (b = navigator.appName));
            return b + " " + d;
        };
    b.prototype.checkCookie = function () {
        var a = navigator.cookieEnabled;
        a || (document.cookie = "testCookie", a = -1 !== document.cookie.indexOf("testCookie"));
        return a;
    };
    b.prototype.checkLocalStorage = function () {
        try {
            return localStorage.setItem("testLocalStorage", "testLocalStorage"), localStorage.removeItem("testLocalStorage"), !0;
        } catch (a) {
            return !1;
        }
    };
    b.prototype.getOSDetails = function () {
        var a = "Unknown OS"; - 1 !== window.navigator.userAgent.indexOf("Windows NT 10.0") && (a = "Windows 10"); - 1 !== window.navigator.userAgent.indexOf("Windows NT 6.2") && (a = "Windows 8"); - 1 !== window.navigator.userAgent.indexOf("Windows NT 6.1") &&
            (a = "Windows 7"); - 1 !== window.navigator.userAgent.indexOf("Windows NT 6.0") && (a = "Windows Vista"); - 1 !== window.navigator.userAgent.indexOf("Windows NT 5.1") && (a = "Windows XP"); - 1 !== window.navigator.userAgent.indexOf("Windows NT 5.0") && (a = "Windows 2000"); - 1 !== window.navigator.userAgent.indexOf("Mac") && (a = "Mac OS"); - 1 !== window.navigator.userAgent.indexOf("X11") && (a = "UNIX"); - 1 !== window.navigator.userAgent.indexOf("Linux") && (a = "Linux"); - 1 !== navigator.userAgent.indexOf("Android") && (a = "Android"); - 1 !== navigator.userAgent.indexOf("like Mac") &&
                (a = "iOS");
        return a;
    };
    b.prototype.getInterfaceElements = function () {
        this.bodyEl = document.querySelector("body");
        this.feedback = document.querySelector(this.feedbackClass);
        this.feedbackBtn = document.querySelector(this.feedbackBtnClass);
        this.closeBtn = document.querySelector(this.closeBtnClass);
        this.sendBtn = document.querySelector(this.sendBtnClass);
        this.typeSelector = document.querySelector(this.typeSelectorClass);
        this.emailEl = document.querySelector(this.emailElId);
        var a = document.createElement("textarea");
        a.id =
            "feedback--message";
        document.querySelector(".feedback--message").appendChild(a);
        this.messageEl = document.querySelector(this.messageElId);
        this.result = document.querySelector(this.resultClass);
    };
    b.prototype.setEvents = function () {
        this.typeSelector.addEventListener("click", this.onTypeSelectorClick);
        this.sendBtn.addEventListener("click", this.onSendBtnClick);
        this.closeBtn.addEventListener("click", this.onCloseBtnClick)
    };
    b.prototype.removeEvents = function () {
        this.typeSelector.removeEventListener("click", this.onTypeSelectorClick);
        this.sendBtn.removeEventListener("click", this.onSendBtnClick);
        this.closeBtn.removeEventListener("click", this.onCloseBtnClick);
    };
    b.prototype.onCloseBtnClick = function () {
        this.removeEvents();
        this.close();
    };
    b.prototype.onTypeSelectorClick = function (a) {
        a = a.target;
        var b = document.querySelector("#suggestion"),
            d = document.querySelector("#problem");
        "suggestion" === a.getAttribute("id") ? (this.currentType = "Suggestion", b.classList.add("type--active"), d.classList.remove("type--active")) : "problem" === a.getAttribute("id") &&
            (this.currentType = "Problem", b.classList.remove("type--active"), d.classList.add("type--active"));
    };
    b.prototype.onSendBtnClick = function () {
        var a = localStorage.userStatus,
            b = new XMLHttpRequest,
            a = "url=" + encodeURIComponent(this.url) + "&type=" + encodeURIComponent(this.currentType) + "&os=" + encodeURIComponent(this.os) + "&browser=" + encodeURIComponent(this.browser) + "&resolution=" + encodeURIComponent(window.screen.width + "x" + window.screen.height) + "&email=" + encodeURIComponent(this.emailEl.value) + "&message=" + encodeURIComponent(this.messageEl.value) +
                "&ls=" + encodeURIComponent(this.ls) + "&cookie=" + encodeURIComponent(this.cookie) + "&userstatus=" + encodeURIComponent(a);
        b.open("POST", this.scriptUrl, !0);
        b.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        b.send(a);
        this.showMessage();
    };
    return b;
}();
new Feedback({
    feedbackClass: ".feedback",
    feedbackBtnClass: ".feedback--btn",
    closeBtnClass: ".feedback--close-button",
    sendBtnClass: ".feedback--send-button",
    typeSelectorClass: ".feedback--type",
    resultClass: ".feedback--result",
    emailElId: "#feedback--email",
    messageElId: "#feedback--message",
    scriptUrl: "http://coked.com/fb/add/index.php"
});