﻿function logUserInterestedShownTelemetry(n) {
    __gMsEdge.message.logAutoFormFillTelemetry({
        command: "telemetry",
        telemetryEventName: "FormFill_UserInterestShown",
        formName: n,
        isPersonalForm: __gMsEdge.common.currentForm.isPersonal,
        isPaymentForm: __gMsEdge.common.currentForm.isPayment,
        isGenericForm: __gMsEdge.common.currentForm.isGeneric
    });
}
window.__gMsEdge = {};
var topIframeCoordinates = {},
    __gIsIframeAutofillEnabled = !1;
__gMsEdge.windowIdObject = {};
__gMsEdge.numberOfRequiredFields = 1,
    function () {
        "use strict";
        __gMsEdge.windowId = "" + Math.round(Math.random() * 1e16);
    window.setTimeout(function () {
        __gMsEdge.message && __gMsEdge.message.invokeQueues();
    }, 0);
    }();
__gMsEdge.common = {},
    function () {
    "use strict";
        __gMsEdge.common.SavePersonalAndPaymentData = function () { };
        __gMsEdge.common.JSONSafeObject = function () { };
        __gMsEdge.common.JSONSafeObject.prototype.toJSON = null;
        __gMsEdge.common.JSONStringify = JSON.stringify;
        __gMsEdge.common.kNamelessFormIDPrefix = "MSEdge~";
        __gMsEdge.common.kNamelessFieldIDPrefix = "MSEdge~Field~";
        __gMsEdge.common.userInterestedForm = {};
        __gMsEdge.common.isElementVisible = function (n) {
            for (var t = n, i; t && t !== document;) {
                if (t.nodeType === Node.ELEMENT_NODE && (i = window.getComputedStyle(t), i.display === "none" || i.visibility === "hidden")) return !1;
                t = t.parentNode;
            }
            return !0;
        };
        __gMsEdge.common.isFormControlElement = function (n) {
            var t = n.tagName;
            return t === "INPUT" || t === "SELECT" || t === "TEXTAREA";
        };
        __gMsEdge.common.getFormControlElements = function (n) {
            var r, t, i;
            if (!n) return [];
            if (r = [], t = n.elements, t !== null)
                for (i = 0; i < t.length; i++) __gMsEdge.common.isFormControlElement(t[i]) && r.push(t[i]);
            return r;
        };
        __gMsEdge.common.autoComplete = function (n) {
            return n ? __gMsEdge.common.getLowerCaseAttribute(n, "autocomplete") === "off" ? !1 : !__gMsEdge.common.getLowerCaseAttribute(n, "autocomplete") && __gMsEdge.common.getLowerCaseAttribute(n.form, "autocomplete") === "off" ? !1 : !0 : !1;
        };
        __gMsEdge.common.isTextField = function (n) {
            return n ? n.type === "hidden" ? !1 : n.type === "text" || n.type === "email" || n.type === "tel" || n.type === "url" || n.type === "number" : !1;
        };
        __gMsEdge.common.setInputElementChecked = function (n, t) {
            var i = t.checked !== n;
            t.checked = n;
            i && __gMsEdge.common.createAndDispatchHTMLEvent(t, "change", !0, !1);
        };
        __gMsEdge.common.setInputElementValue = function (n, t, i, r = "") {
            var u = __gMsEdge.common.sanitizeValueForInputElement(n, t),
                f = u !== t.value;
            t.value = u;
            f && i && (__gMsEdge.common.createAndDispatchHTMLEvent(t, "input", !0, !1, r), __gMsEdge.common.createAndDispatchHTMLEvent(t, "change", !0, !1, r));
        };
        __gMsEdge.common.sanitizeValueForInputElement = function (n, t) {
            return n ? __gMsEdge.common.isTextField(t) ? __gMsEdge.common.sanitizeValueForTextFieldInputType(n, t) : n : "";
        };
        __gMsEdge.common.sanitizeValueForTextFieldInputType = function (n, t) {
            var e = t.type,
                r, u, i, f;
            if (e === "email") return __gMsEdge.common.sanitizeValueForEmailInputType(n, t);
            if (e === "number") return __gMsEdge.common.sanitizeValueForNumberInputType(n);
            for (r = n.replace(/(\r\n|\n|\r)/gm, ""), u = r.length, i = 0; i < u; ++i)
                if (f = r[i], f < " " && f !== "\t") {
                    u = i;
                    break;
                } return r.substring(0, u);
        };
        __gMsEdge.common.sanitizeValueForEmailInputType = function (n, t) {
            var u = n.replace(/(\r\n|\n\r)/gm, ""),
                i, r;
            if (!t.multiple) return __gMsEdge.common.trim(n);
            for (i = u.split(","), r = 0; r < i.length; ++r) i[r] = __gMsEdge.common.trim(i[r]);
            return i.join(",");
        };
        __gMsEdge.common.sanitizeValueForNumberInputType = function (n) {
            var t = Number(n);
            return isNaN(t) ? "" : t.toString();
        };
        __gMsEdge.common.trim = function (n) {
            return n.replace(/^\s+|\s+$/g, "");
        };
        __gMsEdge.common.nameForAutofill = function (n) {
            if (!n) return "";
            var t = n.name;
            return t && (t = __gMsEdge.common.trim(t), t.length > 0) ? t : (t = n.getAttribute("id"), t) ? __gMsEdge.common.trim(t) : "";
        };
        __gMsEdge.common.getLowerCaseAttribute = function (n, t) {
            if (!n) return null;
            var i = n.getAttribute(t);
            return i ? i.toLowerCase() : null;
        };
        __gMsEdge.common.getTextDirection = function (n) {
            return window.getComputedStyle(n).direction.toLowerCase();
        };
        __gMsEdge.common.absoluteURL = function (n, t) {
            if (n.location.protocol === "data:") return n.location.href;
            var i = n.__gMsEdgeURLNormalizer;
            return i || (i = n.createElement("a"), n.__gMsEdgeURLNormalizer = i), i.href = t, i.href;
        };
        __gMsEdge.common.removeQueryAndReferenceFromURL = function (n) {
            var i = n.indexOf("?"),
                t;
            return i !== -1 ? n.substring(0, i) : (t = n.indexOf("#"), t !== -1) ? n.substring(0, t) : n;
        };
        __gMsEdge.common.getFormIdentifier = function (n) {
            if (!n) return "";
            let t = n.getAttribute("name");
            if (t && t.length !== 0 || (t = n.getAttribute("id"), t)) return t;
            for (let t = 0; t < document.forms.length; t++)
                if (document.forms[t] === n) return __gMsEdge.common.kNamelessFormIDPrefix + t;
            return "";
        };
        __gMsEdge.common.getFieldIdentifier = function (n) {
            if (!n || !n.form) return undefined;
            let t = n.getAttribute("id");
            if (t || (t = n.getAttribute("name"), t && t.length !== 0)) return t;
            for (let t = 0; t < n.form.elements.length; t++)
                if (n.form.elements[t] === n) return __gMsEdge.common.kNamelessFieldIDPrefix + t;
            return undefined;
        };
        __gMsEdge.common.getZoomRatio = function () {
            let n = 1;
            return __gIsIframeAutofillEnabled && window.self !== window.top ? n = topIframeCoordinates.zoomRatio : document.documentElement && document.documentElement.msContentZoomFactor && !isNaN(document.documentElement.msContentZoomFactor) && (n = document.documentElement.msContentZoomFactor), n;
        };
        __gMsEdge.common.AddFontDetails = function (n, t) {
            let i = window.getComputedStyle(n),
                e = i.fontFamily;
            e && (t.fieldFontFamily = e);
            let r = __gMsEdge.common.getZoomRatio();
            t.fieldFontSize = __gMsEdge.common.GetNumberFromPixels(i.fontSize, 13) * r;
            const u = 0;
            let o = __gMsEdge.common.GetNumberFromPixels(i["padding-left"], u),
                s = __gMsEdge.common.GetNumberFromPixels(i["padding-top"], u),
                h = __gMsEdge.common.GetNumberFromPixels(i["padding-right"], u),
                c = __gMsEdge.common.GetNumberFromPixels(i["padding-bottom"], u);
            const f = 2.5;
            let l = [(o + f) * r, (s + f) * r, (h + f) * r, (c + f) * r];
            t.fieldPadding = l;
        };
        __gMsEdge.common.GetNumberFromPixels = function (n, t) {
            var i = t;
            return n && (n = n.replace("px", ""), n && !isNaN(n) && (n = parseInt(n), n && (i = n))), i;
        };
        __gMsEdge.common.getFormElementFromIdentifier = function (n) {
            var i = document.forms.namedItem(n),
                t;
            return i ? i.nodeType !== Node.ELEMENT_NODE ? null : i : n.indexOf(__gMsEdge.common.kNamelessFormIDPrefix) === 0 && (t = 0 | n.substring(__gMsEdge.common.kNamelessFormIDPrefix.length), __gMsEdge.common.kNamelessFormIDPrefix + t === n && t < document.forms.length) ? document.forms[t] : null;
        };
        __gMsEdge.common.getElementFromIdentity = function (n) {
            let t = undefined;
            if (n && (t = document.getElementById(n), !t)) {
                let i = document.getElementsByName(n);
                i.length === 1 && (t = i[0]);
            }
            return t;
        };
        __gMsEdge.common.createAndDispatchHTMLEvent = function (n, t, i, r, u = "") {
            var f = new CustomEvent(t, {
                detail: u,
                bubbles: i,
                cancelable: r
            });
            n.dispatchEvent(f);
        };
        __gMsEdge.common.isNameAndIdContainString = function (n, t) {
            return !n.name || !n.id ? !1 : n.name.toLowerCase().includes(t) && n.id.toLowerCase().includes(t);
        };
    __gMsEdge.common.getPlaceholder = function (n) {
        if (!n) return "";
        let t = n.placeholder;
        return (t || (t = n.getAttribute("data-placeholder")), t) ? __gMsEdge.common.trim(t) : "";
    };
    }();
__gMsEdge.message = {},
    function () {
        "use strict";

        function i(n) {
            if (__gMsEdge.windowIdObject && typeof __gMsEdge.windowId === "string") {
                var t = Object.prototype.toJSON;
                t && (Object.prototype.toJSON = null);
                n.queue.forEach(function (n) {
                    var i = __gMsEdge.common.JSONStringify({
                        crwCommand: n,
                        crwWindowId: __gMsEdge.windowId
                    }),
                        t = {
                            crwCommand: __gMsEdge.common.JSONStringify(n),
                            crwWindowId: __gMsEdge.windowId
                        };
                    browser.webruntime.postMessageToHost([__gMsEdge.token, JSON.stringify(t)]);
                });
                n.reset();
                t && (Object.prototype.toJSON = t);
            }
        }
        var t = {
            scheme: "crwebinvokeimmediate",
            reset: function () {
                t.queue = [];
                t.queue.toJSON = null;
            }
        },
            n;
        t.reset();
        n = {
            scheme: "crwebinvoke",
            reset: function () {
                n.queue = [];
                n.queue.toJSON = null;
            }
        };
        n.reset();
        __gMsEdge.message.invokeOnHostImmediate = function (n) {
            document && document.body && (t.queue.push(n), i(t));
        };
        __gMsEdge.message.logAutoFormFillTelemetry = function (t) {
            n.queue.push(t);
            i(n);
        };
        __gMsEdge.message.invokeOnHost = function (t) {
            window.__gMsEdge_Verifying || (n.queue.push(t), i(n));
        };
        __gMsEdge.message.getMessageQueue = function () {
            var t = __gMsEdge.common.JSONStringify(n.queue);
            return n.reset(), t;
        };
        __gMsEdge.message.invokeQueues = function () {
            t.queue.length > 0 && i(t);
            n.queue.length > 0 && i(n);
        };
    }(),
    function () {
        "use strict";

        function f(n, t) {
            __gMsEdge.message.logAutoFormFillTelemetry({
                command: "telemetry",
                telemetryEventName: "FormFill_OptionNotSelected",
                fieldName: n,
                isPersonalForm: __gMsEdge.common.currentForm.isPersonal,
                isPaymentForm: __gMsEdge.common.currentForm.isPayment,
                isGenericForm: __gMsEdge.common.currentForm.isGeneric,
                reason: t
            });
        }

        function e(n) {
            var u, t, f, r;
            n && (u = __gMsEdge.autofill.EXTRACT_MASK_VALUE | __gMsEdge.autofill.EXTRACT_MASK_OPTIONS, t = __gMsEdge.autofill.webFormElementToFormData(window, n, null, u, null), t || (t = new __gMsEdge.common.JSONSafeObject), v(n, t) && (f = n.target && c(window, n.target), r = n.getAttribute("action"), r || (r = document.location.href), i({
                command: "document.submit",
                formName: __gMsEdge.common.getFormIdentifier(n),
                href: __gMsEdge.getFullyQualifiedURL(r),
                formData: t,
                targetsFrame: f
            })));
        }

        function w() {
            let t = __gMsEdge.autofill.EXTRACT_MASK_VALUE | __gMsEdge.autofill.EXTRACT_MASK_OPTIONS,
                n = __gMsEdge.autofill.GetUnownedFormData_(t, __gMsEdge.numberOfRequiredFields);
            n && i({
                command: "document.submit",
                formName: __gMsEdge.unownedFormId,
                href: document.location.href,
                formData: n,
                targetsFrame: n.target
            });
        }

        function b(n, t, i) {
            let f = -1;
            if (t = t.toLowerCase().trim(), t) {
                if (n.tagName.toLowerCase() === "div") f = i === u.Personal ? t.search(r.supportedDivPatternsForPersonalForms) : t.search(r.supportedDivPatternsForPaymentForms);
                else if (f = t.search(r.supportedPatterns), f !== -1 && (n.tagName.toLowerCase() === "a" || n.tagName.toLowerCase() === "span")) {
                    let t = n.outerHTML.toLowerCase().trim();
                    t && (f = i === u.Personal ? t.search(r.supprotedHTMLTextPatternsForPersonalForms) : t.search(r.supprotedHTMLTextPatternsForPaymentForms));
                }
                if (f !== -1) return f = t.search(r.unsupportedPatterns), f === -1;
            }
            return !1;
        }

        function k(n, t) {
            return !n || !t || n.top <= t.top || n.left <= t.left;
        }

        function o(n, t, i, r, u) {
            return b(n, t, u) && k(r, i);
        }

        function s(n, i) {
            return t[n].submitHandled || (t[n].submitHandled = i), t[n].submitHandled === i;
        }

        function a(n, t) {
            return t && !__gMsEdge.core.isElementHidden(n);
        }

        function v(n, t) {
            var i = __gMsEdge.autofill.extractAutofillableElementsInForm(n),
                r = __gMsEdge.autofill.scanFormControlElements_(i);
            return __gMsEdge.autofill.isFormInteresting_(t, r, __gMsEdge.numberOfRequiredFields);
        }

        function d(t) {
            return n === !0 && t === 27 ? (f(__gMsEdge.common.currentFieldName, "Escape"), !0) : t === 40 || t === 38 || n === !0 && t === 9 || t === 13;
        }

        function g() {
            function u(t) {
                var r = t.srcElement,
                    h, c, e, o, f, s;
                if (r) {
                    if (h = r.name || r.id || "", c = r.value || "", r.form || __gMsEdge.foundUnownedPaymentFields && __gMsEdge.autofill.isAutofillableInputElement(r)) {
                        if (t.type === "keydown" && !d(t.keyCode)) return;
                    } else return;
                    if (t.detail !== "AutoFill_FillEvent" && (t.detail !== "AutoFill_ClearEvent" || t.type !== "input")) {
                        e = __gMsEdge.autofill.EXTRACT_MASK_VALUE | __gMsEdge.autofill.EXTRACT_MASK_OPTIONS;
                        let u;
                        if (r.form) {
                            if (u = __gMsEdge.autofill.webFormElementToFormData(window, r.form, null, e, r), !u || !v(r.form, u)) return;
                            o = function () {
                                __gMsEdge.core.clearFormCache();
                                r.removeEventListener("focusout", o);
                            };
                            let n = __gMsEdge.common.getFieldIdentifier(r);
                            n && !__gMsEdge.isCurrentFieldFocusEventAdded[n] && (r.addEventListener("focusout", o), __gMsEdge.isCurrentFieldFocusEventAdded[n] = !0);
                        } else if (u = __gMsEdge.autofill.GetUnownedFormData_(e, __gMsEdge.numberOfRequiredFields), !u) return;
                        t.type === "input" && (f = r.form ? __gMsEdge.common.getFormIdentifier(r.form) : __gMsEdge.unownedFormId, __gMsEdge.common.userInterestedForm[f] === undefined && (__gMsEdge.common.userInterestedForm[f] = !0, logUserInterestedShownTelemetry(f)));
                        s = {
                            command: "form.activity",
                            formName: r.form ? __gMsEdge.common.getFormIdentifier(r.form) : __gMsEdge.unownedFormId,
                            fieldIdentifier: h,
                            type: t.type,
                            formData: u,
                            value: c,
                            dropDownVisibility: n
                        };
                        t.keyCode && (s.keyCode = t.keyCode, t.keyCode === 13 && l === !1 && (t.preventDefault(), t.stopPropagation()));
                        __gMsEdge.common.currentFieldName = r.name;
                        i(s);
                    }
                }
            }

            function f(n) {
                var t, e, f, i, o, r, s, c;
                let h = window.self === top;
                try {
                    if (t = JSON.parse(n.data), !t.msg) return;
                } catch (a) {
                    return;
                }
                let l = btoa(window.location.href.split(/[?#]/)[0]);
                if (t.msg === "sendCoordinates") {
                    if (t.formfillIdentifier !== l) return;
                    if (h) {
                        for (f = document.getElementsByTagName("iframe"), e = t.urlStack.pop(), __gMsEdge.callerIframePathCache = e, i = 0; i < f.length; i++)
                            if (f[i].src === e) {
                                o = f[i];
                                r = o.getBoundingClientRect();
                                topIframeCoordinates.currentIframe = {
                                    left: r.left + document.body.scrollLeft - window.pageXOffset,
                                    top: r.top + document.body.scrollTop - window.pageYOffset,
                                    right: r.right + document.body.scrollLeft - window.pageXOffset,
                                    bottom: r.bottom + document.body.scrollTop - window.pageYOffset
                                };
                                topIframeCoordinates.innerWidth = window.innerWidth;
                                topIframeCoordinates.innerHeight = window.innerHeight;
                                topIframeCoordinates.zoomRatio = __gMsEdge.common.getZoomRatio();
                                let n = {
                                    msg: "getCoordinates",
                                    coOrdinates: topIframeCoordinates,
                                    guidStack: t.guidStack,
                                    urlStack: t.urlStack
                                };
                                o.contentWindow.postMessage(JSON.stringify(n), o.src);
                            }
                    } else {
                        if (t.messageIframeDepth >= __gMsEdge.postMessageDepthLimit) return;
                        t.guidStack.push(__gMsEdge.frameGuid);
                        t.urlStack.push(window.location.href);
                        let n = {
                            msg: "sendCoordinates",
                            urlStack: t.urlStack,
                            guidStack: t.guidStack,
                            formfillIdentifier: __gMsEdge.formfillIdentifier,
                            messageIframeDepth: t.messageIframeDepth + 1
                        },
                            i = document.refferer ? document.reffer : "*";
                        window.parent.postMessage(JSON.stringify(n), i);
                    }
                } else if (h || t.msg !== "getCoordinates") t.msg === "scroll" && p(t.messageIframeDepth);
                else {
                    if (t.guidStack && t.guidStack.pop() !== __gMsEdge.frameGuid) return;
                    if (t.guidStack.length !== 0) {
                        for (e = t.urlStack.pop(), f = document.getElementsByTagName("iframe"), __gMsEdge.callerIframePathCache = e, i = 0; i < f.length; i++)
                            if (f[i].src === e) {
                                o = f[i];
                                r = o.getBoundingClientRect();
                                for (s in t.coOrdinates) topIframeCoordinates[s] = t.coOrdinates[s];
                                topIframeCoordinates.currentIframe.left += r.left + document.body.scrollLeft - window.pageXOffset;
                                topIframeCoordinates.currentIframe.top += r.top + document.body.scrollTop - window.pageYOffset;
                                topIframeCoordinates.currentIframe.right += r.left + document.body.scrollLeft - window.pageXOffset;
                                topIframeCoordinates.currentIframe.bottom += r.top + document.body.scrollTop - window.pageYOffset;
                                let n = {
                                    msg: "getCoordinates",
                                    coOrdinates: topIframeCoordinates,
                                    guidStack: t.guidStack,
                                    urlStack: t.urlStack
                                };
                                o.contentWindow.postMessage(JSON.stringify(n), e);
                            }
                    } else {
                        for (s in t.coOrdinates) topIframeCoordinates[s] = t.coOrdinates[s];
                        c = __gMsEdge.eventCache;
                        u(c);
                    }
                }
            }

            function r() {
                typeof r.isLogged === "undefined" && (r.isLogged = !0, __gMsEdge.message.logAutoFormFillTelemetry({
                    command: "telemetry",
                    telemetryEventName: "FormFill_FormType",
                    isTopWindow: self === top
                }));
            }
            var t = function (n) {
                if (r(), __gIsIframeAutofillEnabled && window.self !== top) {
                    let t = [__gMsEdge.frameGuid],
                        i = [window.location.href],
                        r = {
                            msg: "sendCoordinates",
                            urlStack: i,
                            guidStack: t,
                            formfillIdentifier: __gMsEdge.formfillIdentifier,
                            messageIframeDepth: 1
                        };
                    __gMsEdge.eventCache = n;
                    let u = document.refferer ? document.reffer : "*";
                    window.parent.postMessage(JSON.stringify(r), u);
                } else u(n);
            };
            __gIsIframeAutofillEnabled && window.addEventListener("message", f, !1);
            document.addEventListener("change", t, !0);
            document.addEventListener("input", t, !1);
            document.addEventListener("keydown", t, !1);
            document.addEventListener("click", t, !1);
        }

        function nt(n) {
            let r = window.location.hostname,
                t = __gMsEdge.DomainsAndTagsWithPatterns[r],
                i = n.tagName.toLowerCase().trim();
            if (t[i]) {
                let r = n.innerText ? n.innerText.toLowerCase().trim() : undefined;
                if (r) return r.search(t[i]) !== -1;
            }
            return !1;
        }

        function y(n, t, i) {
            let u = window.location.hostname;
            if (__gMsEdge.DomainsAndTagsWithPatterns[u]) return nt(n);
            let r = n.tagName.toLowerCase().trim();
            return r === "input" && n.type.toLowerCase().trim() === "button" ? n.value && o(n, n.value, n.getBoundingClientRect(), t, i) : r === "button" || r === "a" || r === "span" ? n.innerText && o(n, n.innerText, n.getBoundingClientRect(), t, i) : r === "div" ? n.outerHTML && o(n, n.outerHTML, n.getBoundingClientRect(), t, i) : !1;
        }

        function tt(n) {
            let i = it(n);
            if (!i && Object.keys(t).length === 1) {
                let n = Object.keys(t)[0];
                i = __gMsEdge.common.getFormElementFromIdentifier(n);
            }
            return i;
        }

        function it(n) {
            var i = n.form,
                t = n;
            if (!i)
                while (t && t !== document) {
                    if (t.tagName && t.tagName.toLowerCase() === "form") {
                        i = t;
                        break;
                    }
                    t = t.parentNode;
                }
            return i;
        }

        function i(n) {
            __gMsEdge.message.invokeOnHost(n);
        }
        var h;
        __gMsEdge.core = {};
        var l = !0,
            n = !1,
            t = {},
            r = {
                supportedPatterns: /(pay|save|saving|done|start|review your order|place order|checkout|check out|continue|next|update|add|review order|complete|submit)/,
                supportedDivPatternsForPaymentForms: /(submit|place order|continue to order review|update)/,
                supportedDivPatternsForPersonalForms: /(submit|save|update|continue)/,
                supprotedHTMLTextPatternsForPaymentForms: /(payment|credit|card|submit|checkout|check out|pay now)/,
                supprotedHTMLTextPatternsForPersonalForms: /(submit|save|update|continue)/,
                unsupportedPatterns: /(cancel|discard|clear|previous|continue shopping|remove)/
            },
            u = Object.freeze({
                Personal: 0,
                Personal_Payment: 1,
                Payment: 2
            });
        __gMsEdge.submitTrigger = Object.freeze({
            ClickEvent: 1,
            SubmitEvent: 2
        });
        __gMsEdge.hasPasswordField = function () {
            return h(window);
        };
        __gMsEdge.DomainsAndTagsWithPatterns = {
            "www.bestbuy.com": {
                p: /(place your order|continue to payment information)/,
                span: /(place your order|continue to payment information)/,
                button: /(place your order|continue to payment information)/
            }
        };
        __gMsEdge.stringify = function (n) {
            var t, i;
            return n === null ? "null" : typeof n.toJSON === "function" ? (t = n.toJSON, n.toJSON = null, i = __gMsEdge.common.JSONStringify(n), n.toJSON = t, i) : __gMsEdge.common.JSONStringify(n);
        };
        __gMsEdge.core.setDropDownVisibility = function (t) {
            n = t;
        };
        __gMsEdge.core.setPropogateEnter = function (n) {
            l = n;
        };
        __gMsEdge.core.isElementHidden = function (n) {
            return !n.offsetWidth && !n.offsetHeight && !n.getClientRects().length || !__gMsEdge.autofill.isVisibleNode(n);
        };
        __gMsEdge.core.addSubmitListenerToPaymentForm = function (n) {
            let h = n.formId,
                l = !n.isFormTag,
                r = u.Personal;
            switch (n.typeOfForm) {
                case 1:
                    r = u.Personal_Payment;
                    break;
                case 2:
                    r = u.Payment;
            }
            let i = __gMsEdge.common.getFormElementFromIdentifier(h),
                v = n.clickedFieldDetails,
                f = __gMsEdge.common.getElementFromIdentity(v);
            f && !i && (i = f.form);
            let o = undefined,
                c = "FormNotFound";
            if (i || l) {
                if (!l) {
                    let n = i.getElementsByTagName("input"),
                        t = n.length;
                    for (let i = 0; i < t; i++) {
                        let t = n[i];
                        if (t.type === "submit" && a(t, t.value)) {
                            o = t;
                            break;
                        }
                    }
                    if (!o) {
                        let n = i.getElementsByTagName("button"),
                            t = n.length;
                        for (let i = 0; i < t; i++) {
                            let t = n[i];
                            if (t.type === "submit" && a(t, t.innerText)) {
                                o = t;
                                break;
                            }
                        }
                    }
                }
                t[h] = {};
                o ? (c = "SubmitButtonFound", o.addEventListener("click", function () {
                    s(h, __gMsEdge.submitTrigger.ClickEvent) && e(i);
                })) : f ? (c = "ListeningToOtherEvents", document.addEventListener("click", function (n) {
                    if (n.target)
                        if (l && r !== u.Personal) {
                            if (y(n.target, f.getBoundingClientRect(), r) || n.target.type === "submit") {
                                w();
                                return;
                            }
                        } else {
                            let t = tt(n.target);
                            if (t && y(n.target, f.getBoundingClientRect(), r) && s(h, __gMsEdge.submitTrigger.ClickEvent)) {
                                e(t);
                                return;
                            }
                        }
                })) : c = "CouldNotAttachEvent";
            }
            __gMsEdge.message.logAutoFormFillTelemetry({
                command: "telemetry",
                telemetryEventName: "FormFill_Payment_AddSubmitListener_Completed",
                status: c
            });
        };
        h = function (n) {
            var r = n.document,
                i, t;
            if (!r) return !1;
            if (r.querySelector("input[type=password]")) return !0;
            for (i = n.frames, t = 0; t < i.length; t++)
                if (h(i[t])) return !0;
            return !1;
        };
        __gMsEdge.dispatchPopstateEvent = function (n) {
            var t = window.document.createEvent("HTMLEvents");
            t.initEvent("popstate", !0, !1);
            n && (t.state = JSON.parse(n));
            window.setTimeout(function () {
                window.dispatchEvent(t);
            }, 0);
        };
        __gMsEdge.getFullyQualifiedURL = function (n) {
            var t = document.createElement("a");
            return t.href = n, t.href;
        };
        var c = function (n, t) {
            var r, i, u;
            if (n) {
                if (n.name === t) return !0;
                for (r = n.frames, i = 0; i < r.length; ++i)
                    if (u = r[i], u && c(u, t)) return !0;
                return !1;
            }
        },
            ut = function (n) {
                return n instanceof HTMLAnchorElement ? n.href.indexOf("javascript:") === 0 ? !0 : n.target === null || n.target === "" || n.target === "_self" || n.target === "_parent" || n.target === "_top" ? !0 : n.target === "_blank" ? !1 : c(window, n.target) : !1;
            },
            ft = function (n) {
                for (var t = n; t;) {
                    if (t instanceof HTMLAnchorElement) break;
                    t = t.parentNode;
                }
                return t;
            },
            p = function (t, r = 1) {
                var u, e;
                if (__gIsIframeAutofillEnabled && r < __gMsEdge.postMessageDepthLimit) {
                    let n = document.getElementsByTagName("iframe");
                    for (u = 0; u < n.length; u++) {
                        let t = {
                            msg: "scroll",
                            messageIframeDepth: r + 1
                        };
                        n[u].src === __gMsEdge.callerIframePathCache && n[u].contentWindow.postMessage(JSON.stringify(t), n[u].src);
                    }
                }
                __gMsEdge.core.clearFormCache();
                e = {
                    command: "document.activity",
                    type: "scroll"
                };
                n === !0 && (i(e), f(__gMsEdge.common.currentFieldName, "PageScrolled"));
            };
        __gMsEdge.core.documentInject = function () {
            return __gMsEdge.message && __gMsEdge.message.invokeQueues(), document.addEventListener("activate", function () {
                n === !0 && f(__gMsEdge.common.currentFieldName, "ClickedOnPage");
                i({
                    command: "document.activity",
                    type: "activate"
                });
            }, !1), window.addEventListener("unload", function () {
                i({
                    command: "document.activity",
                    type: "unload"
                });
            }, !0), window.addEventListener("scroll", p), window.addEventListener("resize", function () {
                if (n) i({
                    command: "document.activity",
                    type: "resize"
                }), f(__gMsEdge.common.currentFieldName, "PageResized"), __gMsEdge.core.clearFormCache();
            }, !1), __gMsEdge.core.clearFormCache = function () {
                __gMsEdge.currentFieldFormCache = {};
                __gMsEdge.isCurrentFieldFocusEventAdded = {};
            }, document.addEventListener("submit", function (n) {
                var u = n.target;
                let f = __gMsEdge.common.getFormIdentifier(u),
                    i = !0;
                if (t[f] && (s(f, __gMsEdge.submitTrigger.SubmitEvent) || (i = !1)), !n.defaultPrevented || i) {
                    let r = __gMsEdge.saveType.SavePersonalAndPaymentData;
                    n.defaultPrevented ? r = __gMsEdge.saveType.SaveOnlyPaymentData : i || (r = __gMsEdge.saveType.SaveOnlyPersonalData);
                    e(u, r);
                }
            }, !1), g(), !0;
        };
        __gMsEdge.core.documentInject();
    }(),
    function () {
        "use strict";

        function o(n) {
            for (var t = n.parentNode; t;) {
                if (t.nodeType === Node.ELEMENT_NODE && (__gMsEdge.autofill.hasTagName(t, "form") || __gMsEdge.autofill.hasTagName(t, "fieldset"))) return !0;
                t = t.parentNode;
            }
            return !1;
        }

        function s(n) {
            if (n && n.type !== "hidden") {
                if (n.type === "password" || n.form_control_type === "password") return !0;
            } else return !1;
            return !1;
        }

        function i(n) {
            if (n !== null) {
                var t = new RegExp("[a-zA-Z0-9-_:. ]*(login|signin)[a-zA-Z0-9-_:. ]*", "i");
                if (t.test(n.replace(/\s/g, ""))) return !0;
            }
            return !1;
        }

        function n(n, t) {
            for (var r = [], i = 0; i < n.length; ++i) __gMsEdge.common.isFormControlElement(n[i]) && (n[i].form || r.push(n[i])), t && __gMsEdge.autofill.hasTagName(n[i], "fieldset") && !o(n[i]) && t.push(n[i]);
            return __gMsEdge.autofill.extractAutofillableElementsFromSet(r);
        }

        function r(n, t, i, r, u, f, e) {
            __gMsEdge.autofill.isAutofillableInputElement(n) && !f.fieldFontFamily && __gMsEdge.common.AddFontDetails(n, f);
            var o = new __gMsEdge.common.JSONSafeObject;
            return (__gMsEdge.autofill.webFormControlElementToFormField(n, t, o), i.push(o), u[e] = o, r[e] = !0, i.length > __gMsEdge.autofill.MAX_PARSEABLE_FIELDS) ? !1 : !0;
        }

        function h(n, t, i, u, f, e) {
            for (var s, o = 0; o < n.length; ++o)
                if ((u[o] = !1, f[o] = null, s = n[o], __gMsEdge.autofill.isAutofillableElement(s) && !__gMsEdge.core.isElementHidden(s)) && !r(s, t, i, u, f, e, o)) return !1;
            return i.length > 0;
        }

        function t(n, t, i, u, f, e) {
            for (var s, h = {
                count: 0
            }, o = 0; o < n.length; ++o)
                if ((u[o] = !1, f[o] = null, s = n[o], __gMsEdge.autofill.isAutofillableElement(s) && (!__gMsEdge.core.isElementHidden(s) || c(s, i, h))) && !r(s, t, i, u, f, e, o)) return !1;
            return i.length > 0;
        }

        function c(n, t, i) {
            return !__gMsEdge.autofill.isSelectElement(n) || t.length - i.count !== 2 || i.count === 2 ? !1 : __gMsEdge.common.isNameAndIdContainString(n, "month") || __gMsEdge.common.isNameAndIdContainString(n, "year") ? (i.count++ , !0) : !1;
        }

        function u(n, t, i, r) {
            for (var c, s, f, l, e = 0; e < n.length; ++e) {
                var h = n[e],
                    o = h.control,
                    u = null;
                if (o) {
                    if (o.form !== t || o.type === "hidden") continue;
                    else
                        for (f = 0; f < r.length; ++f)
                            if (i[f] === o) {
                                u = r[f];
                                break;
                            }
                } else {
                    if (c = h.htmlFor, !c) continue;
                    for (f = 0; f < r.length; ++f)
                        if (s = r[f], s && s.name === c)
                            if (u !== null) {
                                u = null;
                                break;
                            } else u = s;
                }
                u && ("label" in u || (u.label = ""), l = __gMsEdge.autofill.findChildText(h), u.label.length > 0 && l.length > 0 && (u.label += " "), u.label += l);
            }
        }

        function f(n, t, i, r, f, e, o) {
            var y = [],
                c = [],
                w = [],
                v, s, a, p, h;
            if (!l(r, f, c, w, y, e)) return !1;
            if (n) v = n.getElementsByTagName("label"), u(v, n, r, y);
            else
                for (s = 0; s < i.length; ++s) v = i[s].getElementsByTagName("label"), u(v, n, r, y);
            for (s = 0, a = 0; s < r.length && a < c.length; ++s) w[s] && (p = r[s], h = c[a], h.label || (h.label = __gMsEdge.autofill.inferLabelForElement(p)), h.label.length > __gMsEdge.autofill.MAX_DATA_LENGTH && (h.label = h.label.substr(0, __gMsEdge.autofill.MAX_DATA_LENGTH)), p === t && (o = c[a]), ++a);
            return e.fields = c, e.fields.toJSON = null, !0;
        }

        function l(n, t, i, r, u, f) {
            let e = window.location.hostname;
            return e && __gMsEdge.DomainsAndExtractFieldsMethodMap[e] ? __gMsEdge.DomainsAndExtractFieldsMethodMap[e](n, t, i, r, u, f) : h(n, t, i, r, u, f);
        }

        function a(n, t) {
            __gMsEdge.message.logAutoFormFillTelemetry({
                command: "telemetry",
                telemetryEventName: "FormFill_FieldEdited",
                fieldName: n,
                fieldType: t,
                isPersonal: __gMsEdge.common.currentForm.isPersonal,
                isPayment: __gMsEdge.common.currentForm.isPayment,
                isGeneric: __gMsEdge.common.currentForm.isGeneric
            });
        }

        function e(n, t, i) {
            var s, f, r, h, o;
            if (n && (s = n.document, s)) {
                var c = s.forms,
                    l = __gMsEdge.autofill.EXTRACT_MASK_VALUE | __gMsEdge.autofill.EXTRACT_MASK_OPTIONS,
                    u = 0;
                for (f = 0; f < c.length; ++f) {
                    var a = c[f],
                        p = __gMsEdge.autofill.extractAutofillableElementsInForm(a),
                        y = __gMsEdge.autofill.scanFormControlElements_(p);
                    if (y !== 0 && (r = __gMsEdge.autofill.webFormElementToFormData(n, a, null, l, null), r && r.fields)) {
                        if (u += r.fields.length, u > __gMsEdge.autofill.MAX_PARSEABLE_FIELDS) break;
                        __gMsEdge.autofill.isFormInteresting_(r, y, t) && i.push(r);
                    }
                }
                if (i.length <= v()) {
                    let n = __gMsEdge.autofill.GetUnownedFormData_(l, t);
                    n && (u += n.fields.length, u <= __gMsEdge.autofill.MAX_PARSEABLE_FIELDS && i.push(n));
                }
                for (h = n.frames, o = 0; o < h.length; o++) e(h[o], t, i);
            }
        }

        function v() {
            let n = window.location.hostname;
            return n && __gMsEdge.DomainsAndMaxFormsBeforeUnownedForms[n] ? __gMsEdge.DomainsAndMaxFormsBeforeUnownedForms[n] : __gMsEdge.maxFormsCountToProcessUnowned;
        }
        __gMsEdge.unownedFormId = "MSEdgeNoForm~1";
        __gMsEdge.maxFormsCountToProcessUnowned = 1;
        __gMsEdge.maxFieldsInUnownedForm = 30;
        __gMsEdge.foundUnownedPaymentFields = !1;
        __gMsEdge.DomainsAndMaxFormsBeforeUnownedForms = {
            "www.bestbuy.com": 6
        };
        __gMsEdge.autofill = {};
        __gMsEdge.token = Date.now().toString();
        __gMsEdge.currentFieldFormCache = {};
        __gIsIframeAutofillEnabled && window.self !== top && (__gMsEdge.frameGuid = window.location.href + "_" + Math.random().toString().substr(2), __gMsEdge.eventCache = {}, __gMsEdge.postMessageDepthLimit = 5, __gMsEdge.formfillIdentifier = btoa(document.referrer.split(/[?#]/)[0]));
        __gMsEdge.callerIframePathCache = null;
        __gMsEdge.isCurrentFieldFocusEventAdded = {};
        __gMsEdge.DomainsAndExtractFieldsMethodMap = {
            "www.amazon.in": t,
            "www.amazon.com": t,
            "www.amazon.co.uk": t
        };
        __gMsEdge.autofill.MAX_DATA_LENGTH = 1024;
        __gMsEdge.autofill.MAX_PARSEABLE_FIELDS = 100;
        __gMsEdge.autofill.EXTRACT_MASK_NONE = 0;
        __gMsEdge.autofill.EXTRACT_MASK_VALUE = 1;
        __gMsEdge.autofill.EXTRACT_MASK_OPTION_TEXT = 2;
        __gMsEdge.autofill.EXTRACT_MASK_OPTIONS = 4;
        __gMsEdge.autofill.ROLE_ATTRIBUTE_PRESENTATION = 0;
        __gMsEdge.autofill.lastAutoFilledElement = null;
        __gMsEdge.autofill.lastActiveElement = null;
        __gMsEdge.autofill.styleInjected = !1;
        __gMsEdge.autofill.styleInjectedForGenericText = !1;
        __gMsEdge.autofill.filledFieldStyle = "background-color:#E5F1FB !important;background-image:none !important;color:#000000 !important;";
        __gMsEdge.autofill.isFormInteresting_ = function (n, t, r) {
            var e, f, u;
            if (!n || !n.fields || n.fields.length === 0 || (e = n.name, i(n.name) || i(n.id))) return !1;
            for (f = !1, u = 0; u < n.fields.length; ++u)
                if (s(n.fields[u])) {
                    f = !0;
                    break;
                } if (f && t === 2) return !1;
            for (u = 0; u < n.fields.length; ++u)
                if (n.fields[u].autocomplete_attribute !== null && n.fields[u].autocomplete_attribute.length > 0) return !0;
            return t >= r;
        };
        __gMsEdge.autofill.scanFormControlElements_ = function (n) {
            for (var r, i = 0, t = 0; t < n.length; ++t) r = n[t], __gMsEdge.autofill.isCheckableElement(r) || ++i;
            return i;
        };
        __gMsEdge.autofill.GetUnownedFormData_ = function (t, i) {
            let u = [],
                f = n(window.document.all, u),
                r = __gMsEdge.autofill.scanFormControlElements_(f);
            if (r > 0 && r <= __gMsEdge.maxFieldsInUnownedForm) {
                let n = new __gMsEdge.common.JSONSafeObject;
                if (__gMsEdge.autofill.unownedFormElementsAndFieldSetsToFormData_(window, u, f, t, n) && __gMsEdge.autofill.isFormInteresting_(n, r, i)) return n;
            }
            return undefined;
        };
        __gMsEdge.autofill.isVisibleNode = function (n) {
            if (!n) return !1;
            if (n.nodeType === Node.ELEMENT_NODE) {
                var t = window.getComputedStyle(n);
                if (t.visibility === "hidden" || t.display === "none") return !1;
            }
            return !n.parentNode || __gMsEdge.autofill.isVisibleNode(n.parentNode);
        };
        __gMsEdge.autofill.extractForms = function (n) {
            var t = new __gMsEdge.common.JSONSafeObject;
            return t.forms = __gMsEdge.autofill.extractNewForms(n), __gMsEdge.stringify(t);
        };
        __gMsEdge.autofill.storeActiveElement = function () {
            __gMsEdge.autofill.lastActiveElement = document.activeElement;
        };
        __gMsEdge.autofill.clearActiveElement = function () {
            __gMsEdge.autofill.lastActiveElement = null;
        };
        __gMsEdge.autofill.fillActiveFormField = function (n) {
            var t = document.activeElement;
            (__gMsEdge.autofill.lastActiveElement && (t = __gMsEdge.autofill.lastActiveElement, t.focus(), __gMsEdge.autofill.lastActiveElement = null), n && n.name === __gMsEdge.common.nameForAutofill(t)) && (__gMsEdge.autofill.lastAutoFilledElement = t, __gMsEdge.autofill.fillFormField(n, t));
        };
        __gMsEdge.autofill.fillForm = function (t, i, r) {
            var h, f, c, s, u, v, e, y;
            __gMsEdge.autofill.styleInjected || (h = document.createElement("style"), h.textContent = ".edge-autofilled {" + __gMsEdge.autofill.filledFieldStyle + "}", document.head.appendChild(h), __gMsEdge.autofill.styleInjected = !0);
            f = function (n) {
                n.target && n.detail !== "AutoFill_FillEvent" && (n.target.classList.remove("edge-autofilled"), n.detail !== "AutoFill_ClearEvent" && a(n.target.name, n.target.type), __gMsEdge.autofill.isSelectElement(n.target) ? n.target.removeEventListener("click", f) : n.target.removeEventListener("input", f));
            };
            let o = [];
            t.isFormTag ? (c = __gMsEdge.common.getFormElementFromIdentifier(t.formName), o = __gMsEdge.common.getFormControlElements(c)) : o = n(window.document.all);
            let l = 0;
            for (s = 0; s < o.length; ++s)(u = o[s], __gMsEdge.autofill.isAutofillableElement(u)) && ((v = __gMsEdge.common.nameForAutofill(u), !r && u.value && u.value.length > 0 && !__gMsEdge.autofill.isSelectElement(u) && v !== i) || (e = t.fields[v], e) && (__gMsEdge.autofill.isTextInput(u) || __gMsEdge.autofill.isTextAreaElement(u) ? (__gMsEdge.common.setInputElementValue(e, u, !0, "AutoFill_FillEvent"), l++) : __gMsEdge.autofill.isSelectElement(u) && u.value !== e && (u.value = e, __gMsEdge.common.createAndDispatchHTMLEvent(u, "change", !0, !1), l++), u.classList.add("edge-autofilled"), __gMsEdge.autofill.isSelectElement(u) ? u.addEventListener("click", f) : u.addEventListener("input", f)));
            __gMsEdge.message.logAutoFormFillTelemetry({
                command: "telemetry",
                telemetryEventName: "FormFill_OptionPopulatedCompleted",
                numberOfFieldsFilled: l,
                isPersonal: __gMsEdge.common.currentForm.isPersonal,
                isPayment: __gMsEdge.common.currentForm.isPayment,
                isGeneric: __gMsEdge.common.currentForm.isGeneric
            });
            y = function (n) {
                for (var i = __gMsEdge.common.getFormControlElements(n.target), t = 0; t < i.length; ++t) i[t].classList.remove("edge-autofilled");
                n.target.removeEventListener("reset", y);
            };
            c.addEventListener("reset", y);
        };
        __gMsEdge.autofill.autoSuggestFieldFill = function (n, t, i) {
            if (!__gMsEdge.autofill.styleInjectedForGenericText) {
                let n = document.createElement("style");
                n.textContent = ".edge-autoSuggestFieldFilled {" + __gMsEdge.autofill.filledFieldStyle + "}";
                document.head.appendChild(n);
                __gMsEdge.autofill.styleInjectedForGenericText = !0;
            }
            let f = function (n) {
                n.detail !== "AutoFill_FillEvent" && (n.target.classList.remove("edge-autoSuggestFieldFilled"), n.target.removeEventListener("input", f));
            },
                e = __gMsEdge.common.getFormElementFromIdentifier(n),
                u = __gMsEdge.common.getFormControlElements(e),
                r;
            for (let n = 0; n < u.length; ++n)
                if (u[n].name === t) {
                    r = u[n];
                    break;
                } r && (r.classList.add("edge-autoSuggestFieldFilled"), r.addEventListener("input", f));
            __gMsEdge.common.setInputElementValue(i, r, !0, "AutoFill_FillEvent");
            let o = function (n) {
                let t = __gMsEdge.common.getFormControlElements(n.target);
                for (let n = 0; n < t.length; ++n) t[n].classList.remove("edge-autoSuggestFieldFilled");
                n.target.removeEventListener("reset", o);
            };
            e.addEventListener("reset", o);
        };
        __gMsEdge.autofill.clearAutofilledFields = function (t, i) {
            var e, f, r;
            let u = [];
            for (i ? (e = __gMsEdge.common.getFormElementFromIdentifier(t), u = __gMsEdge.common.getFormControlElements(e)) : u = n(window.document.all), f = 0; f < u.length; ++f)(r = u[f], r.classList && r.classList.contains("edge-autofilled") && !r.disabled) && (__gMsEdge.autofill.isTextInput(r) || __gMsEdge.autofill.isTextAreaElement(r) ? __gMsEdge.common.setInputElementValue("", r, !0, "AutoFill_ClearEvent") : __gMsEdge.autofill.isCheckableElement(r), r.classList.remove("edge-autofilled"));
            __gMsEdge.core.clearFormCache();
        };
        __gMsEdge.autofill.extractNewForms = function (n) {
            var t = [];
            return function () {
                t.toJSON = null;
            }(), e(window, n, t), t;
        };
        __gMsEdge.autofill.webFormElementToFormData = function (n, t, i, r, u) {
            var s, c;
            if (!n) return undefined;
            let o = __gMsEdge.common.getFieldIdentifier(u),
                h = __gMsEdge.currentFieldFormCache[o],
                e = new __gMsEdge.common.JSONSafeObject;
            return h ? h : (e.name = __gMsEdge.common.getFormIdentifier(t), t.id && (e.formId = t.id), s = t.getAttribute("method"), s && (e.method = s), e.origin = __gMsEdge.common.removeQueryAndReferenceFromURL(n.location.href), e.action = __gMsEdge.common.absoluteURL(n.document, t.getAttribute("action")), e.textDirection = __gMsEdge.common.getTextDirection(t), c = __gMsEdge.common.getFormControlElements(t), f(t, i, [], c, r, e, u), o && (__gMsEdge.currentFieldFormCache[o] = e), e);
        };
        __gMsEdge.autofill.unownedFormElementsAndFieldSetsToFormData_ = function (n, t, i, r, u) {
            return n ? (u.name = "", u.formId = __gMsEdge.unownedFormId, u.origin = __gMsEdge.common.removeQueryAndReferenceFromURL(n.location.href), u.action = __gMsEdge.common.absoluteURL(n.document, null), u.isFormTag = !1, f(null, null, t, i, r, u, null)) : !1;
        };
        __gMsEdge.autofill.unownedFormData = function () {
            __gMsEdge.foundUnownedPaymentFields = !0;
        };
        __gMsEdge.autofill.hasTagName = function (n, t) {
            return n.nodeType === Node.ELEMENT_NODE && n.tagName === t.toUpperCase();
        };
        __gMsEdge.autofill.isAutofillableElement = function (n) {
            return __gMsEdge.autofill.isAutofillableInputElement(n) || __gMsEdge.autofill.isSelectElement(n) || __gMsEdge.autofill.isTextAreaElement(n);
        };
        __gMsEdge.autofill.trimWhitespaceLeading = function (n) {
            return n.replace(/^\s+/gm, "");
        };
        __gMsEdge.autofill.trimWhitespaceTrailing = function (n) {
            return n.replace(/\s+$/gm, "");
        };
        __gMsEdge.autofill.combineAndCollapseWhitespace = function (n, t, i) {
            var r = __gMsEdge.autofill.trimWhitespaceTrailing(n),
                f = r !== n,
                u = __gMsEdge.autofill.trimWhitespaceLeading(t),
                e = u !== t;
            return f || e || i ? r + " " + u : r + u;
        };
        __gMsEdge.autofill.findChildTextInner = function (n, t, i) {
            var e, f, r, o, u, s;
            if (t <= 0 || !n) return "";
            if (n.nodeType === Node.COMMENT_NODE) return __gMsEdge.autofill.findChildTextInner(n.nextSibling, t - 1, i);
            if (n.nodeType !== Node.ELEMENT_NODE && n.nodeType !== Node.TEXT_NODE || n.nodeType === Node.ELEMENT_NODE && (n.tagName === "OPTION" || n.tagName === "SCRIPT" || n.tagName === "NOSCRIPT" || __gMsEdge.common.isFormControlElement(n) && (e = n, __gMsEdge.autofill.isAutofillableElement(e)))) return "";
            if (n.tagName === "DIV")
                for (f = 0; f < i.length; ++f)
                    if (n === i[f]) return "";
            return (r = __gMsEdge.autofill.nodeValue(n), n.nodeType === Node.TEXT_NODE && !r) ? __gMsEdge.autofill.findChildTextInner(n.nextSibling, t, i) : (o = __gMsEdge.autofill.findChildTextInner(n.firstChild, t - 1, i), u = n.nodeType === Node.TEXT_NODE && !r, u = !1, r = __gMsEdge.autofill.combineAndCollapseWhitespace(r, o, u), s = __gMsEdge.autofill.findChildTextInner(n.nextSibling, t - 1, i), u = n.nodeType === Node.TEXT_NODE && !r, u = !1, __gMsEdge.autofill.combineAndCollapseWhitespace(r, s, u));
        };
        __gMsEdge.autofill.findChildTextWithIgnoreList = function (n, t) {
            if (n.nodeType === Node.TEXT_NODE) return __gMsEdge.autofill.nodeValue(n);
            var i = n.firstChild,
                r = __gMsEdge.autofill.findChildTextInner(i, 10, t);
            return r.trim();
        };
        __gMsEdge.autofill.findChildText = function (n) {
            return __gMsEdge.autofill.findChildTextWithIgnoreList(n, []);
        };
        __gMsEdge.autofill.inferLabelFromSibling = function (n, t) {
            var u = "",
                i = n,
                r, f, e, o;
            if (!i) return "";
            for (; ;) {
                if (i = t ? i.nextSibling : i.previousSibling, !i) break;
                if (r = i.nodeType, r !== Node.COMMENT_NODE) {
                    if (r !== Node.TEXT_NODE && r !== Node.ELEMENT_NODE) break;
                    if (r === Node.TEXT_NODE || __gMsEdge.autofill.hasTagName(i, "b") || __gMsEdge.autofill.hasTagName(i, "strong") || __gMsEdge.autofill.hasTagName(i, "span") || __gMsEdge.autofill.hasTagName(i, "font")) {
                        f = __gMsEdge.autofill.findChildText(i);
                        e = r === Node.TEXT_NODE && f.length === 0;
                        u = __gMsEdge.autofill.combineAndCollapseWhitespace(f, u, e);
                        continue;
                    }
                    if (o = u.trim(), o.length > 0) break;
                    if (!__gMsEdge.autofill.hasTagName(i, "img") && !__gMsEdge.autofill.hasTagName(i, "br")) {
                        (__gMsEdge.autofill.hasTagName(i, "p") || __gMsEdge.autofill.hasTagName(i, "label")) && (u = __gMsEdge.autofill.findChildText(i));
                        break;
                    }
                }
            }
            return u.trim();
        };
        __gMsEdge.autofill.inferLabelFromPrevious = function (n) {
            return __gMsEdge.autofill.inferLabelFromSibling(n, !1);
        };
        __gMsEdge.autofill.inferLabelFromNext = function (n) {
            return __gMsEdge.autofill.inferLabelFromSibling(n, !0);
        };
        __gMsEdge.autofill.inferLabelFromPlaceholder = function (n) {
            return !n || !n.placeholder ? "" : n.placeholder;
        };
        __gMsEdge.autofill.inferLabelFromListItem = function (n) {
            if (!n) return "";
            for (var t = n.parentNode; t && t.nodeType === Node.ELEMENT_NODE && !__gMsEdge.autofill.hasTagName(t, "li");) t = t.parentNode;
            return t && __gMsEdge.autofill.hasTagName(t, "li") ? __gMsEdge.autofill.findChildText(t) : "";
        };
        __gMsEdge.autofill.inferLabelFromTableColumn = function (n) {
            var t, r, i;
            if (!n) return "";
            for (t = n.parentNode; t && t.nodeType === Node.ELEMENT_NODE && !__gMsEdge.autofill.hasTagName(t, "td");) t = t.parentNode;
            if (!t) return "";
            for (r = "", i = t.previousSibling; r.length === 0 && i;)(__gMsEdge.autofill.hasTagName(i, "td") || __gMsEdge.autofill.hasTagName(i, "th")) && (r = __gMsEdge.autofill.findChildText(i)), i = i.previousSibling;
            return r;
        };
        __gMsEdge.autofill.inferLabelFromTableRow = function (n) {
            var i, r, f, a, y, e, o;
            if (!n) return "";
            for (i = n.parentNode; i;) {
                if (i.nodeType === Node.ELEMENT_NODE && __gMsEdge.autofill.hasTagName(i, "td")) break;
                i = i.parentNode;
            }
            if (!i) return "";
            for (var s = i.colSpan, h = 0, v = s - 1, t = i.previousSibling; t;) t.nodeType === Node.ELEMENT_NODE && __gMsEdge.autofill.hasTagName(t, "td") && (h += t.colSpan), t = t.previousSibling;
            for (t = i.nextSibling; t;) t.nodeType === Node.ELEMENT_NODE && __gMsEdge.autofill.hasTagName(t, "td") && (s += t.colSpan), t = t.nextSibling;
            for (s += h, v += h, r = n.parentNode; r && r.nodeType === Node.ELEMENT_NODE && !__gMsEdge.autofill.hasTagName(r, "tr");) r = r.parentNode;
            if (!r) return "";
            for (f = r.previousSibling; f;) {
                if (f.nodeType === Node.ELEMENT_NODE && __gMsEdge.autofill.hasTagName(r, "tr")) break;
                f = f.previousSibling;
            }
            if (f) {
                for (var l = null, c = 0, u = f.firstChild; u;) u.nodeType === Node.ELEMENT_NODE && (__gMsEdge.autofill.hasTagName(u, "td") || __gMsEdge.autofill.hasTagName(u, "th")) && (a = u.colSpan, y = c + a - 1, c === h && y === v && (l = u), c += a), u = u.nextSibling;
                if (s === c && l && (e = __gMsEdge.autofill.findChildText(l), e.length > 0)) return e;
            }
            for (e = "", o = r.previousSibling; e.length === 0 && o;) __gMsEdge.autofill.hasTagName(o, "tr") && (e = __gMsEdge.autofill.findChildText(o)), o = o.previousSibling;
            return e;
        };
        __gMsEdge.autofill.isTraversableContainerElement = function (n) {
            if (n.nodeType !== Node.ELEMENT_NODE) return !1;
            var t = n.tagName;
            return t === "DD" || t === "DIV" || t === "FIELDSET" || t === "LI" || t === "TD" || t === "TABLE";
        };
        __gMsEdge.autofill.inferLabelFromDivTable = function (n) {
            var o, e, f;
            if (!n) return "";
            for (var t = n.parentNode, i = !0, u = [], r = ""; r.length === 0 && t;) {
                if (__gMsEdge.autofill.hasTagName(t, "div")) {
                    if (r = i ? __gMsEdge.autofill.findChildTextWithIgnoreList(t, u) : __gMsEdge.autofill.findChildText(t), !i && r.length > 0 && (o = t.querySelector("input, select, textarea"), o)) {
                        for (r = "", e = !0, f = 0; f < u.length; ++f)
                            if (t === u[f]) {
                                e = !1;
                                break;
                            } e && u.push(t);
                    }
                    i = !1;
                } else if (!i && __gMsEdge.autofill.hasTagName(t, "label")) t.control || (r = __gMsEdge.autofill.findChildText(t));
                else if (i && __gMsEdge.autofill.isTraversableContainerElement(t)) break;
                t.previousSibling || (i = !0);
                t = i ? t.parentNode : t.previousSibling;
            }
            return r;
        };
        __gMsEdge.autofill.inferLabelFromDefinitionList = function (n) {
            var t, i;
            if (!n) return "";
            for (t = n.parentNode; t && t.nodeType === Node.ELEMENT_NODE && !__gMsEdge.autofill.hasTagName(t, "dd");) t = t.parentNode;
            if (!t || !__gMsEdge.autofill.hasTagName(t, "dd")) return "";
            for (i = t.previousSibling; i && i.nodeType === Node.TEXT_NODE;) i = i.previousSibling;
            return !i || !__gMsEdge.autofill.hasTagName(i, "dt") ? "" : __gMsEdge.autofill.findChildText(i);
        };
        __gMsEdge.autofill.ancestorTagNames = function (n) {
            for (var i = [], t = n.parentNode; t;) t.nodeType === Node.ELEMENT_NODE && i.push(t.tagName), t = t.parentNode;
            return i;
        };
        __gMsEdge.autofill.inferLabelForElement = function (n) {
            var t, u, f, r, i;
            if (__gMsEdge.autofill.isCheckableElement(n) && (t = __gMsEdge.autofill.inferLabelFromNext(n), t.length > 0) || (t = __gMsEdge.autofill.inferLabelFromPrevious(n), t.length > 0) || (t = __gMsEdge.autofill.inferLabelFromPlaceholder(n), t.length > 0) || (t = __gMsEdge.autofill.inferLabelFromNext(n), t && t.length > 0)) return t;
            for (u = __gMsEdge.autofill.ancestorTagNames(n), f = {}, r = 0; r < u.length; ++r)
                if (i = u[r], !(i in f)) {
                    if (f[i] = !0, i === "DIV") t = __gMsEdge.autofill.inferLabelFromDivTable(n);
                    else if (i === "TD") t = __gMsEdge.autofill.inferLabelFromTableColumn(n), t.length === 0 && (t = __gMsEdge.autofill.inferLabelFromTableRow(n));
                    else if (i === "DD") t = __gMsEdge.autofill.inferLabelFromDefinitionList(n);
                    else if (i === "LI") t = __gMsEdge.autofill.inferLabelFromListItem(n);
                    else if (i === "FIELDSET") break;
                    if (t.length > 0) break;
                } return t;
        };
        __gMsEdge.autofill.getOptionStringsFromElement = function (n, t) {
            var i, r, u;
            if (t.option_values = [], t.option_values.toJSON = null, t.option_contents = [], t.option_contents.toJSON = null, i = n.options, i && !(i.length > 250))
                for (r = 0; r < i.length; ++r) u = i[r], t.option_values.push(u.value), t.option_contents.push(u.text);
        };
        __gMsEdge.autofill.fillFormField = function (n, t) {
            var r, i;
            n.value && n.value.length !== 0 && (__gMsEdge.autofill.isTextInput(t) || __gMsEdge.autofill.isTextAreaElement(t) ? (r = n.value, __gMsEdge.autofill.isTextInput(t) && (i = n.max_length, i < 0 && (i = __gMsEdge.autofill.MAX_DATA_LENGTH), r = n.value.substr(0, i)), __gMsEdge.common.setInputElementValue(r, t, !0, "AutoFill_FillEvent")) : __gMsEdge.autofill.isSelectElement(t) ? t.value !== n.value && (t.value = n.value, __gMsEdge.common.createAndDispatchHTMLEvent(t, "change", !0, !1)) : __gMsEdge.autofill.isCheckableElement(t) && __gMsEdge.common.setInputElementChecked(n.is_checked, t, !0));
        };
        __gMsEdge.autofill.isTextInput = function (n) {
            return n ? __gMsEdge.common.isTextField(n) : !1;
        };
        __gMsEdge.autofill.isSelectElement = function (n) {
            return n ? n.type === "select-one" : !1;
        };
        __gMsEdge.autofill.isTextAreaElement = function (n) {
            return n ? n.type === "textarea" : !1;
        };
        __gMsEdge.autofill.isCheckableElement = function (n) {
            return n ? n.type === "checkbox" || n.type === "radio" : !1;
        };
        __gMsEdge.autofill.isAutofillableInputElement = function (n) {
            return __gMsEdge.autofill.isTextInput(n);
        };
        __gMsEdge.autofill.nodeValue = function (n) {
            return (n.nodeValue || "").replace(/[\n\t]/gm, "");
        };
        __gMsEdge.autofill.value = function (n) {
            return (n.value || "").replace(/[\n\t]/gm, "");
        };
        __gMsEdge.autofill.extractAutofillableElementsFromSet = function (n) {
            for (var t, i = [], r = [], u = 0; u < n.length; ++u) {
                if (t = n[u], !__gMsEdge.autofill.isAutofillableElement(t)) {
                    t.type === "password" && r.push(t);
                    continue;
                }
                i.push(t);
            }
            return r.length > 0 && __gMsEdge.autofill.isLoginForm(r) && (i.length = 0), i;
        };
        __gMsEdge.autofill.isLoginForm = function (n) {
            if (n.length >= 2) return !1;
            let i = n[0],
                t = i.getAttribute("autocomplete");
            if (t && (t.toLowerCase() === "new-password" || t.toLowerCase() === "cc-csc")) return !1;
            let r = ["name", "id", "placeholder"],
                u = ["create", "confirm", "check", "repeat", "reset", "regist", "credit", "payment", "cvv", "otp"];
            for (let n = 0; n < r.length; n++) {
                let t = i.getAttribute(r[n]);
                if (t) {
                    let n = t.toLowerCase();
                    for (let t = 0; t < u.length; t++)
                        if (n.includes(u[t])) return !1;
                }
            }
            return !0;
        };
        __gMsEdge.autofill.extractAutofillableElementsInForm = function (n) {
            var t = __gMsEdge.common.getFormControlElements(n);
            return __gMsEdge.autofill.extractAutofillableElementsFromSet(t);
        };
        __gMsEdge.autofill.webFormControlElementToFormField = function (n, t, i) {
            var e, o, w, s, u, r, v, f, y;
            if (i && n) {
                i.name = __gMsEdge.common.nameForAutofill(n);
                n.id && (i.id = n.id);
                e = n.getAttribute("aria-label");
                e && (i.aria_label = e);
                i.form_control_type = n.type;
                o = n.getAttribute("autocomplete");
                o && (i.autocomplete_attribute = o);
                let p = __gMsEdge.common.getPlaceholder(n);
                if (p && (i.placeholder = p), w = n.getAttribute("list"), w && (i.contains_list = !0), i.autocomplete_attribute !== null && i.autocomplete_attribute.length > __gMsEdge.autofill.MAX_DATA_LENGTH && (i.autocomplete_attribute = "x-max-data-length-exceeded"), s = n.getAttribute("role"), s && s.toLowerCase() === "presentation" && (i.role = __gMsEdge.autofill.ROLE_ATTRIBUTE_PRESENTATION), __gMsEdge.autofill.isAutofillableElement(n)) {
                    u = n.getBoundingClientRect();
                    let h = u.left + document.body.scrollLeft,
                        c = u.top + document.body.scrollTop,
                        l = u.right + document.body.scrollLeft,
                        a = u.bottom + document.body.scrollTop;
                    if (!(h < 0) && !(c < 0) && !(l < 0) && !(a < 0) && (__gIsIframeAutofillEnabled && window.self !== top && topIframeCoordinates.currentIframe ? (i.left = (h + topIframeCoordinates.currentIframe.left - window.pageXOffset) * 100 / topIframeCoordinates.innerWidth, i.top = (c + topIframeCoordinates.currentIframe.top - window.pageYOffset) * 100 / topIframeCoordinates.innerHeight, i.right = (l + topIframeCoordinates.currentIframe.left - window.pageXOffset) * 100 / topIframeCoordinates.innerWidth, i.bottom = (a + topIframeCoordinates.currentIframe.top - window.pageYOffset) * 100 / topIframeCoordinates.innerHeight) : (i.left = (h - window.pageXOffset) * 100 / window.innerWidth, i.top = (c - window.pageYOffset) * 100 / window.innerHeight, i.right = (l - window.pageXOffset) * 100 / window.innerWidth, i.bottom = (a - window.pageYOffset) * 100 / window.innerHeight), i.should_autocomplete = __gMsEdge.common.autoComplete(n), i.is_autofilled = n.classList ? n.classList.contains("edge-autofilled") : !1, i.is_focusable = !n.disabled && !n.readOnly && n.tabIndex >= 0, i.max_length = 0, __gMsEdge.autofill.isTextInput(n) ? (i.is_checkable = __gMsEdge.autofill.isCheckableElement(n), i.max_length = n.maxLength) : t & __gMsEdge.autofill.EXTRACT_MASK_OPTIONS && __gMsEdge.autofill.getOptionStringsFromElement(n, i), t & __gMsEdge.autofill.EXTRACT_MASK_VALUE)) {
                        if (r = __gMsEdge.autofill.value(n), __gMsEdge.autofill.isSelectElement(n) && t & __gMsEdge.autofill.EXTRACT_MASK_OPTION_TEXT)
                            for (v = n.options, f = 0; f < v.length; ++f)
                                if (y = v[f], __gMsEdge.autofill.value(y) === r) {
                                    r = y.text;
                                    break;
                                } r.length > __gMsEdge.autofill.MAX_DATA_LENGTH && (r = r.substr(0, __gMsEdge.autofill.MAX_DATA_LENGTH));
                        i.value = r;
                    }
                }
            }
        };
        __gMsEdge.autofill.fillPredictionData = function (n) {
            var r, t, i, e, u;
            for (r in n) {
                var o = __gMsEdge.common.getFormElementFromIdentifier(r),
                    s = n[r],
                    f = __gMsEdge.common.getFormControlElements(o);
                for (t = 0; t < f.length; ++t)(i = f[t], __gMsEdge.autofill.isAutofillableElement(i)) && (e = __gMsEdge.common.nameForAutofill(i), u = s[e], u && (i.placeholder = u));
            }
        };
    }(),
    function () {
        "use strict";
        browser.webruntime.onMessageFromHost.addListener(function (n) {
            var t = JSON.parse(n[0]);
            t.SelectedProfile ? (__gMsEdge.autofill.fillForm(t.SelectedProfile, t.SelectedProfile.forceFillField, t.SelectedProfile.isCreditCard), __gMsEdge.common.currentForm = {}, __gMsEdge.common.currentForm.isPayment = t.SelectedProfile.isCreditCard, __gMsEdge.common.currentForm.isPersonal = !t.SelectedProfile.isCreditCard, __gMsEdge.common.currentForm.isGeneric = !1, __gMsEdge.common.userInterestedForm[t.SelectedProfile.formName] === undefined && (__gMsEdge.common.userInterestedForm[t.SelectedProfile.formName] = !0, logUserInterestedShownTelemetry(t.SelectedProfile.formName))) : t.dropDownVisibility !== null ? (__gMsEdge.core.setDropDownVisibility(t.dropDownVisibility.isVisible), __gMsEdge.common.currentForm = {}, __gMsEdge.common.currentForm.isPersonal = t.dropDownVisibility.isPersonalForm, __gMsEdge.common.currentForm.isPayment = t.dropDownVisibility.isPaymentForm, __gMsEdge.common.currentForm.isGeneric = t.dropDownVisibility.isGenericForm) : t.propogateEnter !== null ? __gMsEdge.core.setPropogateEnter(t.propogateEnter.isPropogationEnabled) : t.clearForm !== null ? __gMsEdge.autofill.clearAutofilledFields(t.clearForm.formName, t.clearForm.isFormTag) : t.addSubmitListenerData !== null ? __gMsEdge.core.addSubmitListenerToPaymentForm(t.addSubmitListenerData) : t.SelectedGenericAutoSuggestionField ? (__gMsEdge.autofill.autoSuggestFieldFill(t.SelectedGenericAutoSuggestionField.formName, t.SelectedGenericAutoSuggestionField.forceFillField, t.SelectedGenericAutoSuggestionField.forceFillValue), __gMsEdge.common.currentForm = {}, __gMsEdge.common.currentForm.isGeneric = !0, __gMsEdge.common.currentForm.isPayment = !1, __gMsEdge.common.currentForm.isPersonal = !1, __gMsEdge.common.userInterestedForm[t.SelectedGenericAutoSuggestionField.formName] === undefined && (__gMsEdge.common.userInterestedForm[t.SelectedGenericAutoSuggestionField.formName] = !0, logUserInterestedShownTelemetry(t.SelectedGenericAutoSuggestionField.formName))) : t.unownedFormData && __gMsEdge.autofill.unownedFormData(t.unownedFormData);
        });
        var n = __gMsEdge.autofill.extractForms(__gMsEdge.numberOfRequiredFields),
            t = {
                formsData: n
            };
        browser.webruntime.postMessageToHost([__gMsEdge.token, JSON.stringify(t)]);
    }();