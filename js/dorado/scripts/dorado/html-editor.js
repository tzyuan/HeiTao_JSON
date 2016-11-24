


(function () {
    UEDITOR_CONFIG = window.UEDITOR_CONFIG || {};
    var baidu = window.baidu || {};
    window.baidu = baidu;
    window.UE = baidu.editor = window.UE || {};
    UE.plugins = {};
    UE.commands = {};
    UE.instants = {};
    UE.I18N = {};
    UE.version = "1.3.6";
    var dom = UE.dom = {};
    var browser = UE.browser = function () {
        var agent = navigator.userAgent.toLowerCase(), opera = window.opera, browser = {ie:/(msie\s|trident.*rv:)([\w.]+)/.test(agent), opera:(!!opera && opera.version), webkit:(agent.indexOf(" applewebkit/") > -1), mac:(agent.indexOf("macintosh") > -1), quirks:(document.compatMode == "BackCompat")};
        browser.gecko = (navigator.product == "Gecko" && !browser.webkit && !browser.opera && !browser.ie);
        var version = 0;
        if (browser.ie) {
            version = (agent.match(/(msie\s|trident.*rv:)([\w.]+)/)[2] || 0) * 1;
            browser.ie11Compat = document.documentMode == 11;
            browser.ie9Compat = document.documentMode == 9;
            browser.ie8 = !!document.documentMode;
            browser.ie8Compat = document.documentMode == 8;
            browser.ie7Compat = ((version == 7 && !document.documentMode) || document.documentMode == 7);
            browser.ie6Compat = (version < 7 || browser.quirks);
            browser.ie9above = version > 8;
            browser.ie9below = version < 9;
        }
        if (browser.gecko) {
            var geckoRelease = agent.match(/rv:([\d\.]+)/);
            if (geckoRelease) {
                geckoRelease = geckoRelease[1].split(".");
                version = geckoRelease[0] * 10000 + (geckoRelease[1] || 0) * 100 + (geckoRelease[2] || 0) * 1;
            }
        }
        if (/chrome\/(\d+\.\d)/i.test(agent)) {
            browser.chrome = +RegExp["$1"];
        }
        if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(agent) && !/chrome/i.test(agent)) {
            browser.safari = +(RegExp["$1"] || RegExp["$2"]);
        }
        if (browser.opera) {
            version = parseFloat(opera.version());
        }
        if (browser.webkit) {
            version = parseFloat(agent.match(/ applewebkit\/(\d+)/)[1]);
        }
        browser.version = version;
        browser.isCompatible = !browser.mobile && ((browser.ie && version >= 6) || (browser.gecko && version >= 10801) || (browser.opera && version >= 9.5) || (browser.air && version >= 1) || (browser.webkit && version >= 522) || false);
        return browser;
    }();
    var ie = browser.ie, webkit = browser.webkit, gecko = browser.gecko, opera = browser.opera;
    var utils = UE.utils = {each:function (obj, iterator, context) {
        if (obj == null) {
            return;
        }
        if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === false) {
                    return false;
                }
            }
        } else {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (iterator.call(context, obj[key], key, obj) === false) {
                        return false;
                    }
                }
            }
        }
    }, makeInstance:function (obj) {
        var noop = new Function();
        noop.prototype = obj;
        obj = new noop;
        noop.prototype = null;
        return obj;
    }, extend:function (t, s, b) {
        if (s) {
            for (var k in s) {
                if (!b || !t.hasOwnProperty(k)) {
                    t[k] = s[k];
                }
            }
        }
        return t;
    }, extend2:function (t) {
        var a = arguments;
        for (var i = 1; i < a.length; i++) {
            var x = a[i];
            for (var k in x) {
                if (!t.hasOwnProperty(k)) {
                    t[k] = x[k];
                }
            }
        }
        return t;
    }, inherits:function (subClass, superClass) {
        var oldP = subClass.prototype, newP = utils.makeInstance(superClass.prototype);
        utils.extend(newP, oldP, true);
        subClass.prototype = newP;
        return (newP.constructor = subClass);
    }, bind:function (fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    }, defer:function (fn, delay, exclusion) {
        var timerID;
        return function () {
            if (exclusion) {
                clearTimeout(timerID);
            }
            timerID = setTimeout(fn, delay);
        };
    }, indexOf:function (array, item, start) {
        var index = -1;
        start = this.isNumber(start) ? start : 0;
        this.each(array, function (v, i) {
            if (i >= start && v === item) {
                index = i;
                return false;
            }
        });
        return index;
    }, removeItem:function (array, item) {
        for (var i = 0, l = array.length; i < l; i++) {
            if (array[i] === item) {
                array.splice(i, 1);
                i--;
            }
        }
    }, trim:function (str) {
        return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, "");
    }, listToMap:function (list) {
        if (!list) {
            return {};
        }
        list = utils.isArray(list) ? list : list.split(",");
        for (var i = 0, ci, obj = {}; ci = list[i++]; ) {
            obj[ci.toUpperCase()] = obj[ci] = 1;
        }
        return obj;
    }, unhtml:function (str, reg) {
        return str ? str.replace(reg || /[&<">'](?:(amp|lt|quot|gt|#39|nbsp);)?/g, function (a, b) {
            if (b) {
                return a;
            } else {
                return {"<":"&lt;", "&":"&amp;", "\"":"&quot;", ">":"&gt;", "'":"&#39;"}[a];
            }
        }) : "";
    }, html:function (str) {
        return str ? str.replace(/&((g|l|quo)t|amp|#39|nbsp);/g, function (m) {
            return {"&lt;":"<", "&amp;":"&", "&quot;":"\"", "&gt;":">", "&#39;":"'", "&nbsp;":" "}[m];
        }) : "";
    }, cssStyleToDomStyle:function () {
        var test = document.createElement("div").style, cache = {"float":test.cssFloat != undefined ? "cssFloat" : test.styleFloat != undefined ? "styleFloat" : "float"};
        return function (cssName) {
            return cache[cssName] || (cache[cssName] = cssName.toLowerCase().replace(/-./g, function (match) {
                return match.charAt(1).toUpperCase();
            }));
        };
    }(), loadFile:function () {
        var tmpList = [];
        function getItem(doc, obj) {
            try {
                for (var i = 0, ci; ci = tmpList[i++]; ) {
                    if (ci.doc === doc && ci.url == (obj.src || obj.href)) {
                        return ci;
                    }
                }
            }
            catch (e) {
                return null;
            }
        }
        return function (doc, obj, fn) {
            var item = getItem(doc, obj);
            if (item) {
                if (item.ready) {
                    fn && fn();
                } else {
                    item.funs.push(fn);
                }
                return;
            }
            tmpList.push({doc:doc, url:obj.src || obj.href, funs:[fn]});
            if (!doc.body) {
                var html = [];
                for (var p in obj) {
                    if (p == "tag") {
                        continue;
                    }
                    html.push(p + "=\"" + obj[p] + "\"");
                }
                doc.write("<" + obj.tag + " " + html.join(" ") + " ></" + obj.tag + ">");
                return;
            }
            if (obj.id && doc.getElementById(obj.id)) {
                return;
            }
            var element = doc.createElement(obj.tag);
            delete obj.tag;
            for (var p in obj) {
                element.setAttribute(p, obj[p]);
            }
            element.onload = element.onreadystatechange = function () {
                if (!this.readyState || /loaded|complete/.test(this.readyState)) {
                    item = getItem(doc, obj);
                    if (item.funs.length > 0) {
                        item.ready = 1;
                        for (var fi; fi = item.funs.pop(); ) {
                            fi();
                        }
                    }
                    element.onload = element.onreadystatechange = null;
                }
            };
            element.onerror = function () {
                throw Error("The load " + (obj.href || obj.src) + " fails,check the url settings of file ueditor.config.js ");
            };
            doc.getElementsByTagName("head")[0].appendChild(element);
        };
    }(), isEmptyObject:function (obj) {
        if (obj == null) {
            return true;
        }
        if (this.isArray(obj) || this.isString(obj)) {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }, fixColor:function (name, value) {
        if (/color/i.test(name) && /rgba?/.test(value)) {
            var array = value.split(",");
            if (array.length > 3) {
                return "";
            }
            value = "#";
            for (var i = 0, color; color = array[i++]; ) {
                color = parseInt(color.replace(/[^\d]/gi, ""), 10).toString(16);
                value += color.length == 1 ? "0" + color : color;
            }
            value = value.toUpperCase();
        }
        return value;
    }, optCss:function (val) {
        var padding, margin, border;
        val = val.replace(/(padding|margin|border)\-([^:]+):([^;]+);?/gi, function (str, key, name, val) {
            if (val.split(" ").length == 1) {
                switch (key) {
                  case "padding":
                    !padding && (padding = {});
                    padding[name] = val;
                    return "";
                  case "margin":
                    !margin && (margin = {});
                    margin[name] = val;
                    return "";
                  case "border":
                    return val == "initial" ? "" : str;
                }
            }
            return str;
        });
        function opt(obj, name) {
            if (!obj) {
                return "";
            }
            var t = obj.top, b = obj.bottom, l = obj.left, r = obj.right, val = "";
            if (!t || !l || !b || !r) {
                for (var p in obj) {
                    val += ";" + name + "-" + p + ":" + obj[p] + ";";
                }
            } else {
                val += ";" + name + ":" + (t == b && b == l && l == r ? t : t == b && l == r ? (t + " " + l) : l == r ? (t + " " + l + " " + b) : (t + " " + r + " " + b + " " + l)) + ";";
            }
            return val;
        }
        val += opt(padding, "padding") + opt(margin, "margin");
        return val.replace(/^[ \n\r\t;]*|[ \n\r\t]*$/, "").replace(/;([ \n\r\t]+)|\1;/g, ";").replace(/(&((l|g)t|quot|#39))?;{2,}/g, function (a, b) {
            return b ? b + ";;" : ";";
        });
    }, clone:function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (typeof tmp == "object") {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clone(source[i], target[i]);
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    }, transUnitToPx:function (val) {
        if (!/(pt|cm)/.test(val)) {
            return val;
        }
        var unit;
        val.replace(/([\d.]+)(\w+)/, function (str, v, u) {
            val = v;
            unit = u;
        });
        switch (unit) {
          case "cm":
            val = parseFloat(val) * 25;
            break;
          case "pt":
            val = Math.round(parseFloat(val) * 96 / 72);
        }
        return val + (val ? "px" : "");
    }, domReady:function () {
        var fnArr = [];
        function doReady(doc) {
            doc.isReady = true;
            for (var ci; ci = fnArr.pop(); ci()) {
            }
        }
        return function (onready, win) {
            win = win || window;
            var doc = win.document;
            onready && fnArr.push(onready);
            if (doc.readyState === "complete") {
                doReady(doc);
            } else {
                doc.isReady && doReady(doc);
                if (browser.ie && browser.version != 11) {
                    (function () {
                        if (doc.isReady) {
                            return;
                        }
                        try {
                            doc.documentElement.doScroll("left");
                        }
                        catch (error) {
                            setTimeout(arguments.callee, 0);
                            return;
                        }
                        doReady(doc);
                    })();
                    win.attachEvent("onload", function () {
                        doReady(doc);
                    });
                } else {
                    doc.addEventListener("DOMContentLoaded", function () {
                        doc.removeEventListener("DOMContentLoaded", arguments.callee, false);
                        doReady(doc);
                    }, false);
                    win.addEventListener("load", function () {
                        doReady(doc);
                    }, false);
                }
            }
        };
    }(), cssRule:browser.ie && browser.version != 11 ? function (key, style, doc) {
        var indexList, index;
        if (style === undefined || style && style.nodeType && style.nodeType == 9) {
            doc = style && style.nodeType && style.nodeType == 9 ? style : (doc || document);
            indexList = doc.indexList || (doc.indexList = {});
            index = indexList[key];
            if (index !== undefined) {
                return doc.styleSheets[index].cssText;
            }
            return undefined;
        }
        doc = doc || document;
        indexList = doc.indexList || (doc.indexList = {});
        index = indexList[key];
        if (style === "") {
            if (index !== undefined) {
                doc.styleSheets[index].cssText = "";
                delete indexList[key];
                return true;
            }
            return false;
        }
        if (index !== undefined) {
            sheetStyle = doc.styleSheets[index];
        } else {
            sheetStyle = doc.createStyleSheet("", index = doc.styleSheets.length);
            indexList[key] = index;
        }
        sheetStyle.cssText = style;
    } : function (key, style, doc) {
        var head, node;
        if (style === undefined || style && style.nodeType && style.nodeType == 9) {
            doc = style && style.nodeType && style.nodeType == 9 ? style : (doc || document);
            node = doc.getElementById(key);
            return node ? node.innerHTML : undefined;
        }
        doc = doc || document;
        node = doc.getElementById(key);
        if (style === "") {
            if (node) {
                node.parentNode.removeChild(node);
                return true;
            }
            return false;
        }
        if (node) {
            node.innerHTML = style;
        } else {
            node = doc.createElement("style");
            node.id = key;
            node.innerHTML = style;
            doc.getElementsByTagName("head")[0].appendChild(node);
        }
    }, sort:function (array, compareFn) {
        compareFn = compareFn || function (item1, item2) {
            return item1.localeCompare(item2);
        };
        for (var i = 0, len = array.length; i < len; i++) {
            for (var j = i, length = array.length; j < length; j++) {
                if (compareFn(array[i], array[j]) > 0) {
                    var t = array[i];
                    array[i] = array[j];
                    array[j] = t;
                }
            }
        }
        return array;
    }, clearEmptyAttrs:function (obj) {
        for (var p in obj) {
            if (obj[p] === "") {
                delete obj[p];
            }
        }
        return obj;
    }};
    utils.each(["String", "Function", "Array", "Number", "RegExp", "Object"], function (v) {
        UE.utils["is" + v] = function (obj) {
            return Object.prototype.toString.apply(obj) == "[object " + v + "]";
        };
    });
    var EventBase = UE.EventBase = function () {
    };
    EventBase.prototype = {addListener:function (types, listener) {
        types = utils.trim(types).split(/\s+/);
        for (var i = 0, ti; ti = types[i++]; ) {
            getListener(this, ti, true).push(listener);
        }
    }, on:function (types, listener) {
        return this.addListener(types, listener);
    }, off:function (types, listener) {
        return this.removeListener(types, listener);
    }, trigger:function () {
        return this.fireEvent.apply(this, arguments);
    }, removeListener:function (types, listener) {
        types = utils.trim(types).split(/\s+/);
        for (var i = 0, ti; ti = types[i++]; ) {
            utils.removeItem(getListener(this, ti) || [], listener);
        }
    }, fireEvent:function () {
        var types = arguments[0];
        types = utils.trim(types).split(" ");
        for (var i = 0, ti; ti = types[i++]; ) {
            var listeners = getListener(this, ti), r, t, k;
            if (listeners) {
                k = listeners.length;
                while (k--) {
                    if (!listeners[k]) {
                        continue;
                    }
                    t = listeners[k].apply(this, arguments);
                    if (t === true) {
                        return t;
                    }
                    if (t !== undefined) {
                        r = t;
                    }
                }
            }
            if (t = this["on" + ti.toLowerCase()]) {
                r = t.apply(this, arguments);
            }
        }
        return r;
    }};
    function getListener(obj, type, force) {
        var allListeners;
        type = type.toLowerCase();
        return ((allListeners = (obj.__allListeners || force && (obj.__allListeners = {}))) && (allListeners[type] || force && (allListeners[type] = [])));
    }
    var dtd = dom.dtd = (function () {
        function _(s) {
            for (var k in s) {
                s[k.toUpperCase()] = s[k];
            }
            return s;
        }
        var X = utils.extend2;
        var A = _({isindex:1, fieldset:1}), B = _({input:1, button:1, select:1, textarea:1, label:1}), C = X(_({a:1}), B), D = X({iframe:1}, C), E = _({hr:1, ul:1, menu:1, div:1, blockquote:1, noscript:1, table:1, center:1, address:1, dir:1, pre:1, h5:1, dl:1, h4:1, noframes:1, h6:1, ol:1, h1:1, h3:1, h2:1}), F = _({ins:1, del:1, script:1, style:1}), G = X(_({b:1, acronym:1, bdo:1, "var":1, "#":1, abbr:1, code:1, br:1, i:1, cite:1, kbd:1, u:1, strike:1, s:1, tt:1, strong:1, q:1, samp:1, em:1, dfn:1, span:1}), F), H = X(_({sub:1, img:1, embed:1, object:1, sup:1, basefont:1, map:1, applet:1, font:1, big:1, small:1}), G), I = X(_({p:1}), H), J = X(_({iframe:1}), H, B), K = _({img:1, embed:1, noscript:1, br:1, kbd:1, center:1, button:1, basefont:1, h5:1, h4:1, samp:1, h6:1, ol:1, h1:1, h3:1, h2:1, form:1, font:1, "#":1, select:1, menu:1, ins:1, abbr:1, label:1, code:1, table:1, script:1, cite:1, input:1, iframe:1, strong:1, textarea:1, noframes:1, big:1, small:1, span:1, hr:1, sub:1, bdo:1, "var":1, div:1, object:1, sup:1, strike:1, dir:1, map:1, dl:1, applet:1, del:1, isindex:1, fieldset:1, ul:1, b:1, acronym:1, a:1, blockquote:1, i:1, u:1, s:1, tt:1, address:1, q:1, pre:1, p:1, em:1, dfn:1}), L = X(_({a:0}), J), M = _({tr:1}), N = _({"#":1}), O = X(_({param:1}), K), P = X(_({form:1}), A, D, E, I), Q = _({li:1, ol:1, ul:1}), R = _({style:1, script:1}), S = _({base:1, link:1, meta:1, title:1}), T = X(S, R), U = _({head:1, body:1}), V = _({html:1});
        var block = _({address:1, blockquote:1, center:1, dir:1, div:1, dl:1, fieldset:1, form:1, h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, hr:1, isindex:1, menu:1, noframes:1, ol:1, p:1, pre:1, table:1, ul:1}), empty = _({area:1, base:1, basefont:1, br:1, col:1, command:1, dialog:1, embed:1, hr:1, img:1, input:1, isindex:1, keygen:1, link:1, meta:1, param:1, source:1, track:1, wbr:1});
        return _({$nonBodyContent:X(V, U, S), $block:block, $inline:L, $inlineWithA:X(_({a:1}), L), $body:X(_({script:1, style:1}), block), $cdata:_({script:1, style:1}), $empty:empty, $nonChild:_({iframe:1, textarea:1}), $listItem:_({dd:1, dt:1, li:1}), $list:_({ul:1, ol:1, dl:1}), $isNotEmpty:_({table:1, ul:1, ol:1, dl:1, iframe:1, area:1, base:1, col:1, hr:1, img:1, embed:1, input:1, link:1, meta:1, param:1, h1:1, h2:1, h3:1, h4:1, h5:1, h6:1}), $removeEmpty:_({a:1, abbr:1, acronym:1, address:1, b:1, bdo:1, big:1, cite:1, code:1, del:1, dfn:1, em:1, font:1, i:1, ins:1, label:1, kbd:1, q:1, s:1, samp:1, small:1, span:1, strike:1, strong:1, sub:1, sup:1, tt:1, u:1, "var":1}), $removeEmptyBlock:_({"p":1, "div":1}), $tableContent:_({caption:1, col:1, colgroup:1, tbody:1, td:1, tfoot:1, th:1, thead:1, tr:1, table:1}), $notTransContent:_({pre:1, script:1, style:1, textarea:1}), html:U, head:T, style:N, script:N, body:P, base:{}, link:{}, meta:{}, title:N, col:{}, tr:_({td:1, th:1}), img:{}, embed:{}, colgroup:_({thead:1, col:1, tbody:1, tr:1, tfoot:1}), noscript:P, td:P, br:{}, th:P, center:P, kbd:L, button:X(I, E), basefont:{}, h5:L, h4:L, samp:L, h6:L, ol:Q, h1:L, h3:L, option:N, h2:L, form:X(A, D, E, I), select:_({optgroup:1, option:1}), font:L, ins:L, menu:Q, abbr:L, label:L, table:_({thead:1, col:1, tbody:1, tr:1, colgroup:1, caption:1, tfoot:1}), code:L, tfoot:M, cite:L, li:P, input:{}, iframe:P, strong:L, textarea:N, noframes:P, big:L, small:L, span:_({"#":1, br:1, b:1, strong:1, u:1, i:1, em:1, sub:1, sup:1, strike:1, span:1}), hr:L, dt:L, sub:L, optgroup:_({option:1}), param:{}, bdo:L, "var":L, div:P, object:O, sup:L, dd:P, strike:L, area:{}, dir:Q, map:X(_({area:1, form:1, p:1}), A, F, E), applet:O, dl:_({dt:1, dd:1}), del:L, isindex:{}, fieldset:X(_({legend:1}), K), thead:M, ul:Q, acronym:L, b:L, a:X(_({a:1}), J), blockquote:X(_({td:1, tr:1, tbody:1, li:1}), P), caption:L, i:L, u:L, tbody:M, s:L, address:X(D, I), tt:L, legend:L, q:L, pre:X(G, C), p:X(_({"a":1}), L), em:L, dfn:L});
    })();
    function getDomNode(node, start, ltr, startFromChild, fn, guard) {
        var tmpNode = startFromChild && node[start], parent;
        !tmpNode && (tmpNode = node[ltr]);
        while (!tmpNode && (parent = (parent || node).parentNode)) {
            if (parent.tagName == "BODY" || guard && !guard(parent)) {
                return null;
            }
            tmpNode = parent[ltr];
        }
        if (tmpNode && fn && !fn(tmpNode)) {
            return getDomNode(tmpNode, start, ltr, false, fn);
        }
        return tmpNode;
    }
    var attrFix = ie && browser.version < 9 ? {tabindex:"tabIndex", readonly:"readOnly", "for":"htmlFor", "class":"className", maxlength:"maxLength", cellspacing:"cellSpacing", cellpadding:"cellPadding", rowspan:"rowSpan", colspan:"colSpan", usemap:"useMap", frameborder:"frameBorder"} : {tabindex:"tabIndex", readonly:"readOnly"}, styleBlock = utils.listToMap(["-webkit-box", "-moz-box", "block", "list-item", "table", "table-row-group", "table-header-group", "table-footer-group", "table-row", "table-column-group", "table-column", "table-cell", "table-caption"]);
    var domUtils = dom.domUtils = {NODE_ELEMENT:1, NODE_DOCUMENT:9, NODE_TEXT:3, NODE_COMMENT:8, NODE_DOCUMENT_FRAGMENT:11, POSITION_IDENTICAL:0, POSITION_DISCONNECTED:1, POSITION_FOLLOWING:2, POSITION_PRECEDING:4, POSITION_IS_CONTAINED:8, POSITION_CONTAINS:16, fillChar:ie && browser.version == "6" ? "\ufeff" : "\u200b", keys:{8:1, 46:1, 16:1, 17:1, 18:1, 37:1, 38:1, 39:1, 40:1, 13:1}, getPosition:function (nodeA, nodeB) {
        if (nodeA === nodeB) {
            return 0;
        }
        var node, parentsA = [nodeA], parentsB = [nodeB];
        node = nodeA;
        while (node = node.parentNode) {
            if (node === nodeB) {
                return 10;
            }
            parentsA.push(node);
        }
        node = nodeB;
        while (node = node.parentNode) {
            if (node === nodeA) {
                return 20;
            }
            parentsB.push(node);
        }
        parentsA.reverse();
        parentsB.reverse();
        if (parentsA[0] !== parentsB[0]) {
            return 1;
        }
        var i = -1;
        while (i++, parentsA[i] === parentsB[i]) {
        }
        nodeA = parentsA[i];
        nodeB = parentsB[i];
        while (nodeA = nodeA.nextSibling) {
            if (nodeA === nodeB) {
                return 4;
            }
        }
        return 2;
    }, getNodeIndex:function (node, ignoreTextNode) {
        var preNode = node, i = 0;
        while (preNode = preNode.previousSibling) {
            if (ignoreTextNode && preNode.nodeType == 3) {
                if (preNode.nodeType != preNode.nextSibling.nodeType) {
                    i++;
                }
                continue;
            }
            i++;
        }
        return i;
    }, inDoc:function (node, doc) {
        return domUtils.getPosition(node, doc) == 10;
    }, findParent:function (node, filterFn, includeSelf) {
        if (node && !domUtils.isBody(node)) {
            node = includeSelf ? node : node.parentNode;
            while (node) {
                if (!filterFn || filterFn(node) || domUtils.isBody(node)) {
                    return filterFn && !filterFn(node) && domUtils.isBody(node) ? null : node;
                }
                node = node.parentNode;
            }
        }
        return null;
    }, findParentByTagName:function (node, tagNames, includeSelf, excludeFn) {
        tagNames = utils.listToMap(utils.isArray(tagNames) ? tagNames : [tagNames]);
        return domUtils.findParent(node, function (node) {
            return tagNames[node.tagName] && !(excludeFn && excludeFn(node));
        }, includeSelf);
    }, findParents:function (node, includeSelf, filterFn, closerFirst) {
        var parents = includeSelf && (filterFn && filterFn(node) || !filterFn) ? [node] : [];
        while (node = domUtils.findParent(node, filterFn)) {
            parents.push(node);
        }
        return closerFirst ? parents : parents.reverse();
    }, insertAfter:function (node, newNode) {
        return node.nextSibling ? node.parentNode.insertBefore(newNode, node.nextSibling) : node.parentNode.appendChild(newNode);
    }, remove:function (node, keepChildren) {
        var parent = node.parentNode, child;
        if (parent) {
            if (keepChildren && node.hasChildNodes()) {
                while (child = node.firstChild) {
                    parent.insertBefore(child, node);
                }
            }
            parent.removeChild(node);
        }
        return node;
    }, getNextDomNode:function (node, startFromChild, filterFn, guard) {
        return getDomNode(node, "firstChild", "nextSibling", startFromChild, filterFn, guard);
    }, getPreDomNode:function (node, startFromChild, filterFn, guard) {
        return getDomNode(node, "lastChild", "previousSibling", startFromChild, filterFn, guard);
    }, isBookmarkNode:function (node) {
        return node.nodeType == 1 && node.id && /^_baidu_bookmark_/i.test(node.id);
    }, getWindow:function (node) {
        var doc = node.ownerDocument || node;
        return doc.defaultView || doc.parentWindow;
    }, getCommonAncestor:function (nodeA, nodeB) {
        if (nodeA === nodeB) {
            return nodeA;
        }
        var parentsA = [nodeA], parentsB = [nodeB], parent = nodeA, i = -1;
        while (parent = parent.parentNode) {
            if (parent === nodeB) {
                return parent;
            }
            parentsA.push(parent);
        }
        parent = nodeB;
        while (parent = parent.parentNode) {
            if (parent === nodeA) {
                return parent;
            }
            parentsB.push(parent);
        }
        parentsA.reverse();
        parentsB.reverse();
        while (i++, parentsA[i] === parentsB[i]) {
        }
        return i == 0 ? null : parentsA[i - 1];
    }, clearEmptySibling:function (node, ignoreNext, ignorePre) {
        function clear(next, dir) {
            var tmpNode;
            while (next && !domUtils.isBookmarkNode(next) && (domUtils.isEmptyInlineElement(next) || !new RegExp("[^\t\n\r" + domUtils.fillChar + "]").test(next.nodeValue))) {
                tmpNode = next[dir];
                domUtils.remove(next);
                next = tmpNode;
            }
        }
        !ignoreNext && clear(node.nextSibling, "nextSibling");
        !ignorePre && clear(node.previousSibling, "previousSibling");
    }, split:function (node, offset) {
        var doc = node.ownerDocument;
        if (browser.ie && offset == node.nodeValue.length) {
            var next = doc.createTextNode("");
            return domUtils.insertAfter(node, next);
        }
        var retval = node.splitText(offset);
        if (browser.ie8) {
            var tmpNode = doc.createTextNode("");
            domUtils.insertAfter(retval, tmpNode);
            domUtils.remove(tmpNode);
        }
        return retval;
    }, isWhitespace:function (node) {
        return !new RegExp("[^ \t\n\r" + domUtils.fillChar + "]").test(node.nodeValue);
    }, getXY:function (element) {
        var x = 0, y = 0;
        while (element.offsetParent) {
            y += element.offsetTop;
            x += element.offsetLeft;
            element = element.offsetParent;
        }
        return {"x":x, "y":y};
    }, on:function (element, type, handler) {
        var types = utils.isArray(type) ? type : utils.trim(type).split(/\s+/), k = types.length;
        if (k) {
            while (k--) {
                type = types[k];
                if (element.addEventListener) {
                    element.addEventListener(type, handler, false);
                } else {
                    if (!handler._d) {
                        handler._d = {els:[]};
                    }
                    var key = type + handler.toString(), index = utils.indexOf(handler._d.els, element);
                    if (!handler._d[key] || index == -1) {
                        if (index == -1) {
                            handler._d.els.push(element);
                        }
                        if (!handler._d[key]) {
                            handler._d[key] = function (evt) {
                                return handler.call(evt.srcElement, evt || window.event);
                            };
                        }
                        element.attachEvent("on" + type, handler._d[key]);
                    }
                }
            }
        }
        element = null;
    }, un:function (element, type, handler) {
        var types = utils.isArray(type) ? type : utils.trim(type).split(/\s+/), k = types.length;
        if (k) {
            while (k--) {
                type = types[k];
                if (element.removeEventListener) {
                    element.removeEventListener(type, handler, false);
                } else {
                    var key = type + handler.toString();
                    try {
                        element.detachEvent("on" + type, handler._d ? handler._d[key] : handler);
                    }
                    catch (e) {
                    }
                    if (handler._d && handler._d[key]) {
                        var index = utils.indexOf(handler._d.els, element);
                        if (index != -1) {
                            handler._d.els.splice(index, 1);
                        }
                        handler._d.els.length == 0 && delete handler._d[key];
                    }
                }
            }
        }
    }, isSameElement:function (nodeA, nodeB) {
        if (nodeA.tagName != nodeB.tagName) {
            return false;
        }
        var thisAttrs = nodeA.attributes, otherAttrs = nodeB.attributes;
        if (!ie && thisAttrs.length != otherAttrs.length) {
            return false;
        }
        var attrA, attrB, al = 0, bl = 0;
        for (var i = 0; attrA = thisAttrs[i++]; ) {
            if (attrA.nodeName == "style") {
                if (attrA.specified) {
                    al++;
                }
                if (domUtils.isSameStyle(nodeA, nodeB)) {
                    continue;
                } else {
                    return false;
                }
            }
            if (ie) {
                if (attrA.specified) {
                    al++;
                    attrB = otherAttrs.getNamedItem(attrA.nodeName);
                } else {
                    continue;
                }
            } else {
                attrB = nodeB.attributes[attrA.nodeName];
            }
            if (!attrB.specified || attrA.nodeValue != attrB.nodeValue) {
                return false;
            }
        }
        if (ie) {
            for (i = 0; attrB = otherAttrs[i++]; ) {
                if (attrB.specified) {
                    bl++;
                }
            }
            if (al != bl) {
                return false;
            }
        }
        return true;
    }, isSameStyle:function (nodeA, nodeB) {
        var styleA = nodeA.style.cssText.replace(/( ?; ?)/g, ";").replace(/( ?: ?)/g, ":"), styleB = nodeB.style.cssText.replace(/( ?; ?)/g, ";").replace(/( ?: ?)/g, ":");
        if (browser.opera) {
            styleA = nodeA.style;
            styleB = nodeB.style;
            if (styleA.length != styleB.length) {
                return false;
            }
            for (var p in styleA) {
                if (/^(\d+|csstext)$/i.test(p)) {
                    continue;
                }
                if (styleA[p] != styleB[p]) {
                    return false;
                }
            }
            return true;
        }
        if (!styleA || !styleB) {
            return styleA == styleB;
        }
        styleA = styleA.split(";");
        styleB = styleB.split(";");
        if (styleA.length != styleB.length) {
            return false;
        }
        for (var i = 0, ci; ci = styleA[i++]; ) {
            if (utils.indexOf(styleB, ci) == -1) {
                return false;
            }
        }
        return true;
    }, isBlockElm:function (node) {
        return node.nodeType == 1 && (dtd.$block[node.tagName] || styleBlock[domUtils.getComputedStyle(node, "display")]) && !dtd.$nonChild[node.tagName];
    }, isBody:function (node) {
        return node && node.nodeType == 1 && node.tagName.toLowerCase() == "body";
    }, breakParent:function (node, parent) {
        var tmpNode, parentClone = node, clone = node, leftNodes, rightNodes;
        do {
            parentClone = parentClone.parentNode;
            if (leftNodes) {
                tmpNode = parentClone.cloneNode(false);
                tmpNode.appendChild(leftNodes);
                leftNodes = tmpNode;
                tmpNode = parentClone.cloneNode(false);
                tmpNode.appendChild(rightNodes);
                rightNodes = tmpNode;
            } else {
                leftNodes = parentClone.cloneNode(false);
                rightNodes = leftNodes.cloneNode(false);
            }
            while (tmpNode = clone.previousSibling) {
                leftNodes.insertBefore(tmpNode, leftNodes.firstChild);
            }
            while (tmpNode = clone.nextSibling) {
                rightNodes.appendChild(tmpNode);
            }
            clone = parentClone;
        } while (parent !== parentClone);
        tmpNode = parent.parentNode;
        tmpNode.insertBefore(leftNodes, parent);
        tmpNode.insertBefore(rightNodes, parent);
        tmpNode.insertBefore(node, rightNodes);
        domUtils.remove(parent);
        return node;
    }, isEmptyInlineElement:function (node) {
        if (node.nodeType != 1 || !dtd.$removeEmpty[node.tagName]) {
            return 0;
        }
        node = node.firstChild;
        while (node) {
            if (domUtils.isBookmarkNode(node)) {
                return 0;
            }
            if (node.nodeType == 1 && !domUtils.isEmptyInlineElement(node) || node.nodeType == 3 && !domUtils.isWhitespace(node)) {
                return 0;
            }
            node = node.nextSibling;
        }
        return 1;
    }, trimWhiteTextNode:function (node) {
        function remove(dir) {
            var child;
            while ((child = node[dir]) && child.nodeType == 3 && domUtils.isWhitespace(child)) {
                node.removeChild(child);
            }
        }
        remove("firstChild");
        remove("lastChild");
    }, mergeChild:function (node, tagName, attrs) {
        var list = domUtils.getElementsByTagName(node, node.tagName.toLowerCase());
        for (var i = 0, ci; ci = list[i++]; ) {
            if (!ci.parentNode || domUtils.isBookmarkNode(ci)) {
                continue;
            }
            if (ci.tagName.toLowerCase() == "span") {
                if (node === ci.parentNode) {
                    domUtils.trimWhiteTextNode(node);
                    if (node.childNodes.length == 1) {
                        node.style.cssText = ci.style.cssText + ";" + node.style.cssText;
                        domUtils.remove(ci, true);
                        continue;
                    }
                }
                ci.style.cssText = node.style.cssText + ";" + ci.style.cssText;
                if (attrs) {
                    var style = attrs.style;
                    if (style) {
                        style = style.split(";");
                        for (var j = 0, s; s = style[j++]; ) {
                            ci.style[utils.cssStyleToDomStyle(s.split(":")[0])] = s.split(":")[1];
                        }
                    }
                }
                if (domUtils.isSameStyle(ci, node)) {
                    domUtils.remove(ci, true);
                }
                continue;
            }
            if (domUtils.isSameElement(node, ci)) {
                domUtils.remove(ci, true);
            }
        }
    }, getElementsByTagName:function (node, name, filter) {
        if (filter && utils.isString(filter)) {
            var className = filter;
            filter = function (node) {
                return domUtils.hasClass(node, className);
            };
        }
        name = utils.trim(name).replace(/[ ]{2,}/g, " ").split(" ");
        var arr = [];
        for (var n = 0, ni; ni = name[n++]; ) {
            var list = node.getElementsByTagName(ni);
            for (var i = 0, ci; ci = list[i++]; ) {
                if (!filter || filter(ci)) {
                    arr.push(ci);
                }
            }
        }
        return arr;
    }, mergeToParent:function (node) {
        var parent = node.parentNode;
        while (parent && dtd.$removeEmpty[parent.tagName]) {
            if (parent.tagName == node.tagName || parent.tagName == "A") {
                domUtils.trimWhiteTextNode(parent);
                if (parent.tagName == "SPAN" && !domUtils.isSameStyle(parent, node) || (parent.tagName == "A" && node.tagName == "SPAN")) {
                    if (parent.childNodes.length > 1 || parent !== node.parentNode) {
                        node.style.cssText = parent.style.cssText + ";" + node.style.cssText;
                        parent = parent.parentNode;
                        continue;
                    } else {
                        parent.style.cssText += ";" + node.style.cssText;
                        if (parent.tagName == "A") {
                            parent.style.textDecoration = "underline";
                        }
                    }
                }
                if (parent.tagName != "A") {
                    parent === node.parentNode && domUtils.remove(node, true);
                    break;
                }
            }
            parent = parent.parentNode;
        }
    }, mergeSibling:function (node, ignorePre, ignoreNext) {
        function merge(rtl, start, node) {
            var next;
            if ((next = node[rtl]) && !domUtils.isBookmarkNode(next) && next.nodeType == 1 && domUtils.isSameElement(node, next)) {
                while (next.firstChild) {
                    if (start == "firstChild") {
                        node.insertBefore(next.lastChild, node.firstChild);
                    } else {
                        node.appendChild(next.firstChild);
                    }
                }
                domUtils.remove(next);
            }
        }
        !ignorePre && merge("previousSibling", "firstChild", node);
        !ignoreNext && merge("nextSibling", "lastChild", node);
    }, unSelectable:ie || browser.opera ? function (node) {
        node.onselectstart = function () {
            return false;
        };
        node.onclick = node.onkeyup = node.onkeydown = function () {
            return false;
        };
        node.unselectable = "on";
        node.setAttribute("unselectable", "on");
        for (var i = 0, ci; ci = node.all[i++]; ) {
            switch (ci.tagName.toLowerCase()) {
              case "iframe":
              case "textarea":
              case "input":
              case "select":
                break;
              default:
                ci.unselectable = "on";
                node.setAttribute("unselectable", "on");
            }
        }
    } : function (node) {
        node.style.MozUserSelect = node.style.webkitUserSelect = node.style.KhtmlUserSelect = "none";
    }, removeAttributes:function (node, attrNames) {
        attrNames = utils.isArray(attrNames) ? attrNames : utils.trim(attrNames).replace(/[ ]{2,}/g, " ").split(" ");
        for (var i = 0, ci; ci = attrNames[i++]; ) {
            ci = attrFix[ci] || ci;
            switch (ci) {
              case "className":
                node[ci] = "";
                break;
              case "style":
                node.style.cssText = "";
                var val = node.getAttributeNode("style");
                !browser.ie && val && node.removeAttributeNode(val);
            }
            node.removeAttribute(ci);
        }
    }, createElement:function (doc, tag, attrs) {
        return domUtils.setAttributes(doc.createElement(tag), attrs);
    }, setAttributes:function (node, attrs) {
        for (var attr in attrs) {
            if (attrs.hasOwnProperty(attr)) {
                var value = attrs[attr];
                switch (attr) {
                  case "class":
                    node.className = value;
                    break;
                  case "style":
                    node.style.cssText = node.style.cssText + ";" + value;
                    break;
                  case "innerHTML":
                    node[attr] = value;
                    break;
                  case "value":
                    node.value = value;
                    break;
                  default:
                    node.setAttribute(attrFix[attr] || attr, value);
                }
            }
        }
        return node;
    }, getComputedStyle:function (element, styleName) {
        var pros = "width height top left";
        if (pros.indexOf(styleName) > -1) {
            return element["offset" + styleName.replace(/^\w/, function (s) {
                return s.toUpperCase();
            })] + "px";
        }
        if (element.nodeType == 3) {
            element = element.parentNode;
        }
        if (browser.ie && browser.version < 9 && styleName == "font-size" && !element.style.fontSize && !dtd.$empty[element.tagName] && !dtd.$nonChild[element.tagName]) {
            var span = element.ownerDocument.createElement("span");
            span.style.cssText = "padding:0;border:0;font-family:simsun;";
            span.innerHTML = ".";
            element.appendChild(span);
            var result = span.offsetHeight;
            element.removeChild(span);
            span = null;
            return result + "px";
        }
        try {
            var value = domUtils.getStyle(element, styleName) || (window.getComputedStyle ? domUtils.getWindow(element).getComputedStyle(element, "").getPropertyValue(styleName) : (element.currentStyle || element.style)[utils.cssStyleToDomStyle(styleName)]);
        }
        catch (e) {
            return "";
        }
        return utils.transUnitToPx(utils.fixColor(styleName, value));
    }, removeClasses:function (elm, classNames) {
        classNames = utils.isArray(classNames) ? classNames : utils.trim(classNames).replace(/[ ]{2,}/g, " ").split(" ");
        for (var i = 0, ci, cls = elm.className; ci = classNames[i++]; ) {
            cls = cls.replace(new RegExp("\\b" + ci + "\\b"), "");
        }
        cls = utils.trim(cls).replace(/[ ]{2,}/g, " ");
        if (cls) {
            elm.className = cls;
        } else {
            domUtils.removeAttributes(elm, ["class"]);
        }
    }, addClass:function (elm, classNames) {
        if (!elm) {
            return;
        }
        classNames = utils.trim(classNames).replace(/[ ]{2,}/g, " ").split(" ");
        for (var i = 0, ci, cls = elm.className; ci = classNames[i++]; ) {
            if (!new RegExp("\\b" + ci + "\\b").test(cls)) {
                cls += " " + ci;
            }
        }
        elm.className = utils.trim(cls);
    }, hasClass:function (element, className) {
        if (utils.isRegExp(className)) {
            return className.test(element.className);
        }
        className = utils.trim(className).replace(/[ ]{2,}/g, " ").split(" ");
        for (var i = 0, ci, cls = element.className; ci = className[i++]; ) {
            if (!new RegExp("\\b" + ci + "\\b", "i").test(cls)) {
                return false;
            }
        }
        return i - 1 == className.length;
    }, preventDefault:function (evt) {
        evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
    }, removeStyle:function (element, name) {
        if (browser.ie) {
            if (name == "color") {
                name = "(^|;)" + name;
            }
            element.style.cssText = element.style.cssText.replace(new RegExp(name + "[^:]*:[^;]+;?", "ig"), "");
        } else {
            if (element.style.removeProperty) {
                element.style.removeProperty(name);
            } else {
                element.style.removeAttribute(utils.cssStyleToDomStyle(name));
            }
        }
        if (!element.style.cssText) {
            domUtils.removeAttributes(element, ["style"]);
        }
    }, getStyle:function (element, name) {
        var value = element.style[utils.cssStyleToDomStyle(name)];
        return utils.fixColor(name, value);
    }, setStyle:function (element, name, value) {
        element.style[utils.cssStyleToDomStyle(name)] = value;
        if (!utils.trim(element.style.cssText)) {
            this.removeAttributes(element, "style");
        }
    }, setStyles:function (element, styles) {
        for (var name in styles) {
            if (styles.hasOwnProperty(name)) {
                domUtils.setStyle(element, name, styles[name]);
            }
        }
    }, removeDirtyAttr:function (node) {
        for (var i = 0, ci, nodes = node.getElementsByTagName("*"); ci = nodes[i++]; ) {
            ci.removeAttribute("_moz_dirty");
        }
        node.removeAttribute("_moz_dirty");
    }, getChildCount:function (node, fn) {
        var count = 0, first = node.firstChild;
        fn = fn || function () {
            return 1;
        };
        while (first) {
            if (fn(first)) {
                count++;
            }
            first = first.nextSibling;
        }
        return count;
    }, isEmptyNode:function (node) {
        return !node.firstChild || domUtils.getChildCount(node, function (node) {
            return !domUtils.isBr(node) && !domUtils.isBookmarkNode(node) && !domUtils.isWhitespace(node);
        }) == 0;
    }, clearSelectedArr:function (nodes) {
        var node;
        while (node = nodes.pop()) {
            domUtils.removeAttributes(node, ["class"]);
        }
    }, scrollToView:function (node, win, offsetTop) {
        var getViewPaneSize = function () {
            var doc = win.document, mode = doc.compatMode == "CSS1Compat";
            return {width:(mode ? doc.documentElement.clientWidth : doc.body.clientWidth) || 0, height:(mode ? doc.documentElement.clientHeight : doc.body.clientHeight) || 0};
        }, getScrollPosition = function (win) {
            if ("pageXOffset" in win) {
                return {x:win.pageXOffset || 0, y:win.pageYOffset || 0};
            } else {
                var doc = win.document;
                return {x:doc.documentElement.scrollLeft || doc.body.scrollLeft || 0, y:doc.documentElement.scrollTop || doc.body.scrollTop || 0};
            }
        };
        var winHeight = getViewPaneSize().height, offset = winHeight * -1 + offsetTop;
        offset += (node.offsetHeight || 0);
        var elementPosition = domUtils.getXY(node);
        offset += elementPosition.y;
        var currentScroll = getScrollPosition(win).y;
        if (offset > currentScroll || offset < currentScroll - winHeight) {
            win.scrollTo(0, offset + (offset < 0 ? -20 : 20));
        }
    }, isBr:function (node) {
        return node.nodeType == 1 && node.tagName == "BR";
    }, isFillChar:function (node, isInStart) {
        if (node.nodeType != 3) {
            return false;
        }
        var text = node.nodeValue;
        if (isInStart) {
            return new RegExp("^" + domUtils.fillChar).test(text);
        }
        return !text.replace(new RegExp(domUtils.fillChar, "g"), "").length;
    }, isStartInblock:function (range) {
        var tmpRange = range.cloneRange(), flag = 0, start = tmpRange.startContainer, tmp;
        if (start.nodeType == 1 && start.childNodes[tmpRange.startOffset]) {
            start = start.childNodes[tmpRange.startOffset];
            var pre = start.previousSibling;
            while (pre && domUtils.isFillChar(pre)) {
                start = pre;
                pre = pre.previousSibling;
            }
        }
        if (this.isFillChar(start, true) && tmpRange.startOffset == 1) {
            tmpRange.setStartBefore(start);
            start = tmpRange.startContainer;
        }
        while (start && domUtils.isFillChar(start)) {
            tmp = start;
            start = start.previousSibling;
        }
        if (tmp) {
            tmpRange.setStartBefore(tmp);
            start = tmpRange.startContainer;
        }
        if (start.nodeType == 1 && domUtils.isEmptyNode(start) && tmpRange.startOffset == 1) {
            tmpRange.setStart(start, 0).collapse(true);
        }
        while (!tmpRange.startOffset) {
            start = tmpRange.startContainer;
            if (domUtils.isBlockElm(start) || domUtils.isBody(start)) {
                flag = 1;
                break;
            }
            var pre = tmpRange.startContainer.previousSibling, tmpNode;
            if (!pre) {
                tmpRange.setStartBefore(tmpRange.startContainer);
            } else {
                while (pre && domUtils.isFillChar(pre)) {
                    tmpNode = pre;
                    pre = pre.previousSibling;
                }
                if (tmpNode) {
                    tmpRange.setStartBefore(tmpNode);
                } else {
                    tmpRange.setStartBefore(tmpRange.startContainer);
                }
            }
        }
        return flag && !domUtils.isBody(tmpRange.startContainer) ? 1 : 0;
    }, isEmptyBlock:function (node, reg) {
        if (node.nodeType != 1) {
            return 0;
        }
        reg = reg || new RegExp("[ \t\r\n" + domUtils.fillChar + "]", "g");
        if (node[browser.ie ? "innerText" : "textContent"].replace(reg, "").length > 0) {
            return 0;
        }
        for (var n in dtd.$isNotEmpty) {
            if (node.getElementsByTagName(n).length) {
                return 0;
            }
        }
        return 1;
    }, setViewportOffset:function (element, offset) {
        var left = parseInt(element.style.left) | 0;
        var top = parseInt(element.style.top) | 0;
        var rect = element.getBoundingClientRect();
        var offsetLeft = offset.left - rect.left;
        var offsetTop = offset.top - rect.top;
        if (offsetLeft) {
            element.style.left = left + offsetLeft + "px";
        }
        if (offsetTop) {
            element.style.top = top + offsetTop + "px";
        }
    }, fillNode:function (doc, node) {
        var tmpNode = browser.ie ? doc.createTextNode(domUtils.fillChar) : doc.createElement("br");
        node.innerHTML = "";
        node.appendChild(tmpNode);
    }, moveChild:function (src, tag, dir) {
        while (src.firstChild) {
            if (dir && tag.firstChild) {
                tag.insertBefore(src.lastChild, tag.firstChild);
            } else {
                tag.appendChild(src.firstChild);
            }
        }
    }, hasNoAttributes:function (node) {
        return browser.ie ? /^<\w+\s*?>/.test(node.outerHTML) : node.attributes.length == 0;
    }, isCustomeNode:function (node) {
        return node.nodeType == 1 && node.getAttribute("_ue_custom_node_");
    }, isTagNode:function (node, tagNames) {
        return node.nodeType == 1 && new RegExp("\\b" + node.tagName + "\\b", "i").test(tagNames);
    }, filterNodeList:function (nodelist, filter, forAll) {
        var results = [];
        if (!utils.isFunction(filter)) {
            var str = filter;
            filter = function (n) {
                return utils.indexOf(utils.isArray(str) ? str : str.split(" "), n.tagName.toLowerCase()) != -1;
            };
        }
        utils.each(nodelist, function (n) {
            filter(n) && results.push(n);
        });
        return results.length == 0 ? null : results.length == 1 || !forAll ? results[0] : results;
    }, isInNodeEndBoundary:function (rng, node) {
        var start = rng.startContainer;
        if (start.nodeType == 3 && rng.startOffset != start.nodeValue.length) {
            return 0;
        }
        if (start.nodeType == 1 && rng.startOffset != start.childNodes.length) {
            return 0;
        }
        while (start !== node) {
            if (start.nextSibling) {
                return 0;
            }
            start = start.parentNode;
        }
        return 1;
    }, isBoundaryNode:function (node, dir) {
        var tmp;
        while (!domUtils.isBody(node)) {
            tmp = node;
            node = node.parentNode;
            if (tmp !== node[dir]) {
                return false;
            }
        }
        return true;
    }};
    var fillCharReg = new RegExp(domUtils.fillChar, "g");
    (function () {
        var guid = 0, fillChar = domUtils.fillChar, fillData;
        function updateCollapse(range) {
            range.collapsed = range.startContainer && range.endContainer && range.startContainer === range.endContainer && range.startOffset == range.endOffset;
        }
        function selectOneNode(rng) {
            return !rng.collapsed && rng.startContainer.nodeType == 1 && rng.startContainer === rng.endContainer && rng.endOffset - rng.startOffset == 1;
        }
        function setEndPoint(toStart, node, offset, range) {
            if (node.nodeType == 1 && (dtd.$empty[node.tagName] || dtd.$nonChild[node.tagName])) {
                offset = domUtils.getNodeIndex(node) + (toStart ? 0 : 1);
                node = node.parentNode;
            }
            if (toStart) {
                range.startContainer = node;
                range.startOffset = offset;
                if (!range.endContainer) {
                    range.collapse(true);
                }
            } else {
                range.endContainer = node;
                range.endOffset = offset;
                if (!range.startContainer) {
                    range.collapse(false);
                }
            }
            updateCollapse(range);
            return range;
        }
        function execContentsAction(range, action) {
            var start = range.startContainer, end = range.endContainer, startOffset = range.startOffset, endOffset = range.endOffset, doc = range.document, frag = doc.createDocumentFragment(), tmpStart, tmpEnd;
            if (start.nodeType == 1) {
                start = start.childNodes[startOffset] || (tmpStart = start.appendChild(doc.createTextNode("")));
            }
            if (end.nodeType == 1) {
                end = end.childNodes[endOffset] || (tmpEnd = end.appendChild(doc.createTextNode("")));
            }
            if (start === end && start.nodeType == 3) {
                frag.appendChild(doc.createTextNode(start.substringData(startOffset, endOffset - startOffset)));
                if (action) {
                    start.deleteData(startOffset, endOffset - startOffset);
                    range.collapse(true);
                }
                return frag;
            }
            var current, currentLevel, clone = frag, startParents = domUtils.findParents(start, true), endParents = domUtils.findParents(end, true);
            for (var i = 0; startParents[i] == endParents[i]; ) {
                i++;
            }
            for (var j = i, si; si = startParents[j]; j++) {
                current = si.nextSibling;
                if (si == start) {
                    if (!tmpStart) {
                        if (range.startContainer.nodeType == 3) {
                            clone.appendChild(doc.createTextNode(start.nodeValue.slice(startOffset)));
                            if (action) {
                                start.deleteData(startOffset, start.nodeValue.length - startOffset);
                            }
                        } else {
                            clone.appendChild(!action ? start.cloneNode(true) : start);
                        }
                    }
                } else {
                    currentLevel = si.cloneNode(false);
                    clone.appendChild(currentLevel);
                }
                while (current) {
                    if (current === end || current === endParents[j]) {
                        break;
                    }
                    si = current.nextSibling;
                    clone.appendChild(!action ? current.cloneNode(true) : current);
                    current = si;
                }
                clone = currentLevel;
            }
            clone = frag;
            if (!startParents[i]) {
                clone.appendChild(startParents[i - 1].cloneNode(false));
                clone = clone.firstChild;
            }
            for (var j = i, ei; ei = endParents[j]; j++) {
                current = ei.previousSibling;
                if (ei == end) {
                    if (!tmpEnd && range.endContainer.nodeType == 3) {
                        clone.appendChild(doc.createTextNode(end.substringData(0, endOffset)));
                        if (action) {
                            end.deleteData(0, endOffset);
                        }
                    }
                } else {
                    currentLevel = ei.cloneNode(false);
                    clone.appendChild(currentLevel);
                }
                if (j != i || !startParents[i]) {
                    while (current) {
                        if (current === start) {
                            break;
                        }
                        ei = current.previousSibling;
                        clone.insertBefore(!action ? current.cloneNode(true) : current, clone.firstChild);
                        current = ei;
                    }
                }
                clone = currentLevel;
            }
            if (action) {
                range.setStartBefore(!endParents[i] ? endParents[i - 1] : !startParents[i] ? startParents[i - 1] : endParents[i]).collapse(true);
            }
            tmpStart && domUtils.remove(tmpStart);
            tmpEnd && domUtils.remove(tmpEnd);
            return frag;
        }
        var Range = dom.Range = function (document) {
            var me = this;
            me.startContainer = me.startOffset = me.endContainer = me.endOffset = null;
            me.document = document;
            me.collapsed = true;
        };
        function removeFillData(doc, excludeNode) {
            try {
                if (fillData && domUtils.inDoc(fillData, doc)) {
                    if (!fillData.nodeValue.replace(fillCharReg, "").length) {
                        var tmpNode = fillData.parentNode;
                        domUtils.remove(fillData);
                        while (tmpNode && domUtils.isEmptyInlineElement(tmpNode) && (browser.safari ? !(domUtils.getPosition(tmpNode, excludeNode) & domUtils.POSITION_CONTAINS) : !tmpNode.contains(excludeNode))) {
                            fillData = tmpNode.parentNode;
                            domUtils.remove(tmpNode);
                            tmpNode = fillData;
                        }
                    } else {
                        fillData.nodeValue = fillData.nodeValue.replace(fillCharReg, "");
                    }
                }
            }
            catch (e) {
            }
        }
        function mergeSibling(node, dir) {
            var tmpNode;
            node = node[dir];
            while (node && domUtils.isFillChar(node)) {
                tmpNode = node[dir];
                domUtils.remove(node);
                node = tmpNode;
            }
        }
        Range.prototype = {cloneContents:function () {
            return this.collapsed ? null : execContentsAction(this, 0);
        }, deleteContents:function () {
            var txt;
            if (!this.collapsed) {
                execContentsAction(this, 1);
            }
            if (browser.webkit) {
                txt = this.startContainer;
                if (txt.nodeType == 3 && !txt.nodeValue.length) {
                    this.setStartBefore(txt).collapse(true);
                    domUtils.remove(txt);
                }
            }
            return this;
        }, extractContents:function () {
            return this.collapsed ? null : execContentsAction(this, 2);
        }, setStart:function (node, offset) {
            return setEndPoint(true, node, offset, this);
        }, setEnd:function (node, offset) {
            return setEndPoint(false, node, offset, this);
        }, setStartAfter:function (node) {
            return this.setStart(node.parentNode, domUtils.getNodeIndex(node) + 1);
        }, setStartBefore:function (node) {
            return this.setStart(node.parentNode, domUtils.getNodeIndex(node));
        }, setEndAfter:function (node) {
            return this.setEnd(node.parentNode, domUtils.getNodeIndex(node) + 1);
        }, setEndBefore:function (node) {
            return this.setEnd(node.parentNode, domUtils.getNodeIndex(node));
        }, setStartAtFirst:function (node) {
            return this.setStart(node, 0);
        }, setStartAtLast:function (node) {
            return this.setStart(node, node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length);
        }, setEndAtFirst:function (node) {
            return this.setEnd(node, 0);
        }, setEndAtLast:function (node) {
            return this.setEnd(node, node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length);
        }, selectNode:function (node) {
            return this.setStartBefore(node).setEndAfter(node);
        }, selectNodeContents:function (node) {
            return this.setStart(node, 0).setEndAtLast(node);
        }, cloneRange:function () {
            var me = this;
            return new Range(me.document).setStart(me.startContainer, me.startOffset).setEnd(me.endContainer, me.endOffset);
        }, collapse:function (toStart) {
            var me = this;
            if (toStart) {
                me.endContainer = me.startContainer;
                me.endOffset = me.startOffset;
            } else {
                me.startContainer = me.endContainer;
                me.startOffset = me.endOffset;
            }
            me.collapsed = true;
            return me;
        }, shrinkBoundary:function (ignoreEnd) {
            var me = this, child, collapsed = me.collapsed;
            function check(node) {
                return node.nodeType == 1 && !domUtils.isBookmarkNode(node) && !dtd.$empty[node.tagName] && !dtd.$nonChild[node.tagName];
            }
            while (me.startContainer.nodeType == 1 && (child = me.startContainer.childNodes[me.startOffset]) && check(child)) {
                me.setStart(child, 0);
            }
            if (collapsed) {
                return me.collapse(true);
            }
            if (!ignoreEnd) {
                while (me.endContainer.nodeType == 1 && me.endOffset > 0 && (child = me.endContainer.childNodes[me.endOffset - 1]) && check(child)) {
                    me.setEnd(child, child.childNodes.length);
                }
            }
            return me;
        }, getCommonAncestor:function (includeSelf, ignoreTextNode) {
            var me = this, start = me.startContainer, end = me.endContainer;
            if (start === end) {
                if (includeSelf && selectOneNode(this)) {
                    start = start.childNodes[me.startOffset];
                    if (start.nodeType == 1) {
                        return start;
                    }
                }
                return ignoreTextNode && start.nodeType == 3 ? start.parentNode : start;
            }
            return domUtils.getCommonAncestor(start, end);
        }, trimBoundary:function (ignoreEnd) {
            this.txtToElmBoundary();
            var start = this.startContainer, offset = this.startOffset, collapsed = this.collapsed, end = this.endContainer;
            if (start.nodeType == 3) {
                if (offset == 0) {
                    this.setStartBefore(start);
                } else {
                    if (offset >= start.nodeValue.length) {
                        this.setStartAfter(start);
                    } else {
                        var textNode = domUtils.split(start, offset);
                        if (start === end) {
                            this.setEnd(textNode, this.endOffset - offset);
                        } else {
                            if (start.parentNode === end) {
                                this.endOffset += 1;
                            }
                        }
                        this.setStartBefore(textNode);
                    }
                }
                if (collapsed) {
                    return this.collapse(true);
                }
            }
            if (!ignoreEnd) {
                offset = this.endOffset;
                end = this.endContainer;
                if (end.nodeType == 3) {
                    if (offset == 0) {
                        this.setEndBefore(end);
                    } else {
                        offset < end.nodeValue.length && domUtils.split(end, offset);
                        this.setEndAfter(end);
                    }
                }
            }
            return this;
        }, txtToElmBoundary:function (ignoreCollapsed) {
            function adjust(r, c) {
                var container = r[c + "Container"], offset = r[c + "Offset"];
                if (container.nodeType == 3) {
                    if (!offset) {
                        r["set" + c.replace(/(\w)/, function (a) {
                            return a.toUpperCase();
                        }) + "Before"](container);
                    } else {
                        if (offset >= container.nodeValue.length) {
                            r["set" + c.replace(/(\w)/, function (a) {
                                return a.toUpperCase();
                            }) + "After"](container);
                        }
                    }
                }
            }
            if (ignoreCollapsed || !this.collapsed) {
                adjust(this, "start");
                adjust(this, "end");
            }
            return this;
        }, insertNode:function (node) {
            var first = node, length = 1;
            if (node.nodeType == 11) {
                first = node.firstChild;
                length = node.childNodes.length;
            }
            this.trimBoundary(true);
            var start = this.startContainer, offset = this.startOffset;
            var nextNode = start.childNodes[offset];
            if (nextNode) {
                start.insertBefore(node, nextNode);
            } else {
                start.appendChild(node);
            }
            if (first.parentNode === this.endContainer) {
                this.endOffset = this.endOffset + length;
            }
            return this.setStartBefore(first);
        }, setCursor:function (toEnd, noFillData) {
            return this.collapse(!toEnd).select(noFillData);
        }, createBookmark:function (serialize, same) {
            var endNode, startNode = this.document.createElement("span");
            startNode.style.cssText = "display:none;line-height:0px;";
            startNode.appendChild(this.document.createTextNode("\u200d"));
            startNode.id = "_baidu_bookmark_start_" + (same ? "" : guid++);
            if (!this.collapsed) {
                endNode = startNode.cloneNode(true);
                endNode.id = "_baidu_bookmark_end_" + (same ? "" : guid++);
            }
            this.insertNode(startNode);
            if (endNode) {
                this.collapse().insertNode(endNode).setEndBefore(endNode);
            }
            this.setStartAfter(startNode);
            return {start:serialize ? startNode.id : startNode, end:endNode ? serialize ? endNode.id : endNode : null, id:serialize};
        }, moveToBookmark:function (bookmark) {
            var start = bookmark.id ? this.document.getElementById(bookmark.start) : bookmark.start, end = bookmark.end && bookmark.id ? this.document.getElementById(bookmark.end) : bookmark.end;
            this.setStartBefore(start);
            domUtils.remove(start);
            if (end) {
                this.setEndBefore(end);
                domUtils.remove(end);
            } else {
                this.collapse(true);
            }
            return this;
        }, enlarge:function (toBlock, stopFn) {
            var isBody = domUtils.isBody, pre, node, tmp = this.document.createTextNode("");
            if (toBlock) {
                node = this.startContainer;
                if (node.nodeType == 1) {
                    if (node.childNodes[this.startOffset]) {
                        pre = node = node.childNodes[this.startOffset];
                    } else {
                        node.appendChild(tmp);
                        pre = node = tmp;
                    }
                } else {
                    pre = node;
                }
                while (1) {
                    if (domUtils.isBlockElm(node)) {
                        node = pre;
                        while ((pre = node.previousSibling) && !domUtils.isBlockElm(pre)) {
                            node = pre;
                        }
                        this.setStartBefore(node);
                        break;
                    }
                    pre = node;
                    node = node.parentNode;
                }
                node = this.endContainer;
                if (node.nodeType == 1) {
                    if (pre = node.childNodes[this.endOffset]) {
                        node.insertBefore(tmp, pre);
                    } else {
                        node.appendChild(tmp);
                    }
                    pre = node = tmp;
                } else {
                    pre = node;
                }
                while (1) {
                    if (domUtils.isBlockElm(node)) {
                        node = pre;
                        while ((pre = node.nextSibling) && !domUtils.isBlockElm(pre)) {
                            node = pre;
                        }
                        this.setEndAfter(node);
                        break;
                    }
                    pre = node;
                    node = node.parentNode;
                }
                if (tmp.parentNode === this.endContainer) {
                    this.endOffset--;
                }
                domUtils.remove(tmp);
            }
            if (!this.collapsed) {
                while (this.startOffset == 0) {
                    if (stopFn && stopFn(this.startContainer)) {
                        break;
                    }
                    if (isBody(this.startContainer)) {
                        break;
                    }
                    this.setStartBefore(this.startContainer);
                }
                while (this.endOffset == (this.endContainer.nodeType == 1 ? this.endContainer.childNodes.length : this.endContainer.nodeValue.length)) {
                    if (stopFn && stopFn(this.endContainer)) {
                        break;
                    }
                    if (isBody(this.endContainer)) {
                        break;
                    }
                    this.setEndAfter(this.endContainer);
                }
            }
            return this;
        }, enlargeToBlockElm:function (ignoreEnd) {
            while (!domUtils.isBlockElm(this.startContainer)) {
                this.setStartBefore(this.startContainer);
            }
            if (!ignoreEnd) {
                while (!domUtils.isBlockElm(this.endContainer)) {
                    this.setEndAfter(this.endContainer);
                }
            }
            return this;
        }, adjustmentBoundary:function () {
            if (!this.collapsed) {
                while (!domUtils.isBody(this.startContainer) && this.startOffset == this.startContainer[this.startContainer.nodeType == 3 ? "nodeValue" : "childNodes"].length && this.startContainer[this.startContainer.nodeType == 3 ? "nodeValue" : "childNodes"].length) {
                    this.setStartAfter(this.startContainer);
                }
                while (!domUtils.isBody(this.endContainer) && !this.endOffset && this.endContainer[this.endContainer.nodeType == 3 ? "nodeValue" : "childNodes"].length) {
                    this.setEndBefore(this.endContainer);
                }
            }
            return this;
        }, applyInlineStyle:function (tagName, attrs, list) {
            if (this.collapsed) {
                return this;
            }
            this.trimBoundary().enlarge(false, function (node) {
                return node.nodeType == 1 && domUtils.isBlockElm(node);
            }).adjustmentBoundary();
            var bookmark = this.createBookmark(), end = bookmark.end, filterFn = function (node) {
                return node.nodeType == 1 ? node.tagName.toLowerCase() != "br" : !domUtils.isWhitespace(node);
            }, current = domUtils.getNextDomNode(bookmark.start, false, filterFn), node, pre, range = this.cloneRange();
            while (current && (domUtils.getPosition(current, end) & domUtils.POSITION_PRECEDING)) {
                if (current.nodeType == 3 || dtd[tagName][current.tagName]) {
                    range.setStartBefore(current);
                    node = current;
                    while (node && (node.nodeType == 3 || dtd[tagName][node.tagName]) && node !== end) {
                        pre = node;
                        node = domUtils.getNextDomNode(node, node.nodeType == 1, null, function (parent) {
                            return dtd[tagName][parent.tagName];
                        });
                    }
                    var frag = range.setEndAfter(pre).extractContents(), elm;
                    if (list && list.length > 0) {
                        var level, top;
                        top = level = list[0].cloneNode(false);
                        for (var i = 1, ci; ci = list[i++]; ) {
                            level.appendChild(ci.cloneNode(false));
                            level = level.firstChild;
                        }
                        elm = level;
                    } else {
                        elm = range.document.createElement(tagName);
                    }
                    if (attrs) {
                        domUtils.setAttributes(elm, attrs);
                    }
                    elm.appendChild(frag);
                    range.insertNode(list ? top : elm);
                    var aNode;
                    if (tagName == "span" && attrs.style && /text\-decoration/.test(attrs.style) && (aNode = domUtils.findParentByTagName(elm, "a", true))) {
                        domUtils.setAttributes(aNode, attrs);
                        domUtils.remove(elm, true);
                        elm = aNode;
                    } else {
                        domUtils.mergeSibling(elm);
                        domUtils.clearEmptySibling(elm);
                    }
                    domUtils.mergeChild(elm, attrs);
                    current = domUtils.getNextDomNode(elm, false, filterFn);
                    domUtils.mergeToParent(elm);
                    if (node === end) {
                        break;
                    }
                } else {
                    current = domUtils.getNextDomNode(current, true, filterFn);
                }
            }
            return this.moveToBookmark(bookmark);
        }, removeInlineStyle:function (tagNames) {
            if (this.collapsed) {
                return this;
            }
            tagNames = utils.isArray(tagNames) ? tagNames : [tagNames];
            this.shrinkBoundary().adjustmentBoundary();
            var start = this.startContainer, end = this.endContainer;
            while (1) {
                if (start.nodeType == 1) {
                    if (utils.indexOf(tagNames, start.tagName.toLowerCase()) > -1) {
                        break;
                    }
                    if (start.tagName.toLowerCase() == "body") {
                        start = null;
                        break;
                    }
                }
                start = start.parentNode;
            }
            while (1) {
                if (end.nodeType == 1) {
                    if (utils.indexOf(tagNames, end.tagName.toLowerCase()) > -1) {
                        break;
                    }
                    if (end.tagName.toLowerCase() == "body") {
                        end = null;
                        break;
                    }
                }
                end = end.parentNode;
            }
            var bookmark = this.createBookmark(), frag, tmpRange;
            if (start) {
                tmpRange = this.cloneRange().setEndBefore(bookmark.start).setStartBefore(start);
                frag = tmpRange.extractContents();
                tmpRange.insertNode(frag);
                domUtils.clearEmptySibling(start, true);
                start.parentNode.insertBefore(bookmark.start, start);
            }
            if (end) {
                tmpRange = this.cloneRange().setStartAfter(bookmark.end).setEndAfter(end);
                frag = tmpRange.extractContents();
                tmpRange.insertNode(frag);
                domUtils.clearEmptySibling(end, false, true);
                end.parentNode.insertBefore(bookmark.end, end.nextSibling);
            }
            var current = domUtils.getNextDomNode(bookmark.start, false, function (node) {
                return node.nodeType == 1;
            }), next;
            while (current && current !== bookmark.end) {
                next = domUtils.getNextDomNode(current, true, function (node) {
                    return node.nodeType == 1;
                });
                if (utils.indexOf(tagNames, current.tagName.toLowerCase()) > -1) {
                    domUtils.remove(current, true);
                }
                current = next;
            }
            return this.moveToBookmark(bookmark);
        }, getClosedNode:function () {
            var node;
            if (!this.collapsed) {
                var range = this.cloneRange().adjustmentBoundary().shrinkBoundary();
                if (selectOneNode(range)) {
                    var child = range.startContainer.childNodes[range.startOffset];
                    if (child && child.nodeType == 1 && (dtd.$empty[child.tagName] || dtd.$nonChild[child.tagName])) {
                        node = child;
                    }
                }
            }
            return node;
        }, select:browser.ie ? function (noFillData, textRange) {
            var nativeRange;
            if (!this.collapsed) {
                this.shrinkBoundary();
            }
            var node = this.getClosedNode();
            if (node && !textRange) {
                try {
                    nativeRange = this.document.body.createControlRange();
                    nativeRange.addElement(node);
                    nativeRange.select();
                }
                catch (e) {
                }
                return this;
            }
            var bookmark = this.createBookmark(), start = bookmark.start, end;
            nativeRange = this.document.body.createTextRange();
            nativeRange.moveToElementText(start);
            nativeRange.moveStart("character", 1);
            if (!this.collapsed) {
                var nativeRangeEnd = this.document.body.createTextRange();
                end = bookmark.end;
                nativeRangeEnd.moveToElementText(end);
                nativeRange.setEndPoint("EndToEnd", nativeRangeEnd);
            } else {
                if (!noFillData && this.startContainer.nodeType != 3) {
                    var tmpText = this.document.createTextNode(fillChar), tmp = this.document.createElement("span");
                    tmp.appendChild(this.document.createTextNode(fillChar));
                    start.parentNode.insertBefore(tmp, start);
                    start.parentNode.insertBefore(tmpText, start);
                    removeFillData(this.document, tmpText);
                    fillData = tmpText;
                    mergeSibling(tmp, "previousSibling");
                    mergeSibling(start, "nextSibling");
                    nativeRange.moveStart("character", -1);
                    nativeRange.collapse(true);
                }
            }
            this.moveToBookmark(bookmark);
            tmp && domUtils.remove(tmp);
            try {
                nativeRange.select();
            }
            catch (e) {
            }
            return this;
        } : function (notInsertFillData) {
            function checkOffset(rng) {
                function check(node, offset, dir) {
                    if (node.nodeType == 3 && node.nodeValue.length < offset) {
                        rng[dir + "Offset"] = node.nodeValue.length;
                    }
                }
                check(rng.startContainer, rng.startOffset, "start");
                check(rng.endContainer, rng.endOffset, "end");
            }
            var win = domUtils.getWindow(this.document), sel = win.getSelection(), txtNode;
            browser.gecko ? this.document.body.focus() : win.focus();
            if (sel) {
                sel.removeAllRanges();
                if (this.collapsed && !notInsertFillData) {
                    var start = this.startContainer, child = start;
                    if (start.nodeType == 1) {
                        child = start.childNodes[this.startOffset];
                    }
                    if (!(start.nodeType == 3 && this.startOffset) && (child ? (!child.previousSibling || child.previousSibling.nodeType != 3) : (!start.lastChild || start.lastChild.nodeType != 3))) {
                        txtNode = this.document.createTextNode(fillChar);
                        this.insertNode(txtNode);
                        removeFillData(this.document, txtNode);
                        mergeSibling(txtNode, "previousSibling");
                        mergeSibling(txtNode, "nextSibling");
                        fillData = txtNode;
                        this.setStart(txtNode, browser.webkit ? 1 : 0).collapse(true);
                    }
                }
                var nativeRange = this.document.createRange();
                if (this.collapsed && browser.opera && this.startContainer.nodeType == 1) {
                    var child = this.startContainer.childNodes[this.startOffset];
                    if (!child) {
                        child = this.startContainer.lastChild;
                        if (child && domUtils.isBr(child)) {
                            this.setStartBefore(child).collapse(true);
                        }
                    } else {
                        while (child && domUtils.isBlockElm(child)) {
                            if (child.nodeType == 1 && child.childNodes[0]) {
                                child = child.childNodes[0];
                            } else {
                                break;
                            }
                        }
                        child && this.setStartBefore(child).collapse(true);
                    }
                }
                checkOffset(this);
                nativeRange.setStart(this.startContainer, this.startOffset);
                nativeRange.setEnd(this.endContainer, this.endOffset);
                sel.addRange(nativeRange);
            }
            return this;
        }, scrollToView:function (win, offset) {
            win = win ? window : domUtils.getWindow(this.document);
            var me = this, span = me.document.createElement("span");
            span.innerHTML = "&nbsp;";
            me.cloneRange().insertNode(span);
            domUtils.scrollToView(span, win, offset);
            domUtils.remove(span);
            return me;
        }, inFillChar:function () {
            var start = this.startContainer;
            if (this.collapsed && start.nodeType == 3 && start.nodeValue.replace(new RegExp("^" + domUtils.fillChar), "").length + 1 == start.nodeValue.length) {
                return true;
            }
            return false;
        }, createAddress:function (ignoreEnd, ignoreTxt) {
            var addr = {}, me = this;
            function getAddress(isStart) {
                var node = isStart ? me.startContainer : me.endContainer;
                var parents = domUtils.findParents(node, true, function (node) {
                    return !domUtils.isBody(node);
                }), addrs = [];
                for (var i = 0, ci; ci = parents[i++]; ) {
                    addrs.push(domUtils.getNodeIndex(ci, ignoreTxt));
                }
                var firstIndex = 0;
                if (ignoreTxt) {
                    if (node.nodeType == 3) {
                        var tmpNode = node.previousSibling;
                        while (tmpNode && tmpNode.nodeType == 3) {
                            firstIndex += tmpNode.nodeValue.replace(fillCharReg, "").length;
                            tmpNode = tmpNode.previousSibling;
                        }
                        firstIndex += (isStart ? me.startOffset : me.endOffset);
                    } else {
                        node = node.childNodes[isStart ? me.startOffset : me.endOffset];
                        if (node) {
                            firstIndex = domUtils.getNodeIndex(node, ignoreTxt);
                        } else {
                            node = isStart ? me.startContainer : me.endContainer;
                            var first = node.firstChild;
                            while (first) {
                                if (domUtils.isFillChar(first)) {
                                    first = first.nextSibling;
                                    continue;
                                }
                                firstIndex++;
                                if (first.nodeType == 3) {
                                    while (first && first.nodeType == 3) {
                                        first = first.nextSibling;
                                    }
                                } else {
                                    first = first.nextSibling;
                                }
                            }
                        }
                    }
                } else {
                    firstIndex = isStart ? domUtils.isFillChar(node) ? 0 : me.startOffset : me.endOffset;
                }
                if (firstIndex < 0) {
                    firstIndex = 0;
                }
                addrs.push(firstIndex);
                return addrs;
            }
            addr.startAddress = getAddress(true);
            if (!ignoreEnd) {
                addr.endAddress = me.collapsed ? [].concat(addr.startAddress) : getAddress();
            }
            return addr;
        }, moveToAddress:function (addr, ignoreEnd) {
            var me = this;
            function getNode(address, isStart) {
                var tmpNode = me.document.body, parentNode, offset;
                for (var i = 0, ci, l = address.length; i < l; i++) {
                    ci = address[i];
                    parentNode = tmpNode;
                    tmpNode = tmpNode.childNodes[ci];
                    if (!tmpNode) {
                        offset = ci;
                        break;
                    }
                }
                if (isStart) {
                    if (tmpNode) {
                        me.setStartBefore(tmpNode);
                    } else {
                        me.setStart(parentNode, offset);
                    }
                } else {
                    if (tmpNode) {
                        me.setEndBefore(tmpNode);
                    } else {
                        me.setEnd(parentNode, offset);
                    }
                }
            }
            getNode(addr.startAddress, true);
            !ignoreEnd && addr.endAddress && getNode(addr.endAddress);
            return me;
        }, equals:function (rng) {
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    if (this[p] !== rng[p]) {
                        return false;
                    }
                }
            }
            return true;
        }, traversal:function (doFn, filterFn) {
            if (this.collapsed) {
                return this;
            }
            var bookmark = this.createBookmark(), end = bookmark.end, current = domUtils.getNextDomNode(bookmark.start, false, filterFn);
            while (current && current !== end && (domUtils.getPosition(current, end) & domUtils.POSITION_PRECEDING)) {
                var tmpNode = domUtils.getNextDomNode(current, false, filterFn);
                doFn(current);
                current = tmpNode;
            }
            return this.moveToBookmark(bookmark);
        }};
    })();
    (function () {
        function getBoundaryInformation(range, start) {
            var getIndex = domUtils.getNodeIndex;
            range = range.duplicate();
            range.collapse(start);
            var parent = range.parentElement();
            if (!parent.hasChildNodes()) {
                return {container:parent, offset:0};
            }
            var siblings = parent.children, child, testRange = range.duplicate(), startIndex = 0, endIndex = siblings.length - 1, index = -1, distance;
            while (startIndex <= endIndex) {
                index = Math.floor((startIndex + endIndex) / 2);
                child = siblings[index];
                testRange.moveToElementText(child);
                var position = testRange.compareEndPoints("StartToStart", range);
                if (position > 0) {
                    endIndex = index - 1;
                } else {
                    if (position < 0) {
                        startIndex = index + 1;
                    } else {
                        return {container:parent, offset:getIndex(child)};
                    }
                }
            }
            if (index == -1) {
                testRange.moveToElementText(parent);
                testRange.setEndPoint("StartToStart", range);
                distance = testRange.text.replace(/(\r\n|\r)/g, "\n").length;
                siblings = parent.childNodes;
                if (!distance) {
                    child = siblings[siblings.length - 1];
                    return {container:child, offset:child.nodeValue.length};
                }
                var i = siblings.length;
                while (distance > 0) {
                    distance -= siblings[--i].nodeValue.length;
                }
                return {container:siblings[i], offset:-distance};
            }
            testRange.collapse(position > 0);
            testRange.setEndPoint(position > 0 ? "StartToStart" : "EndToStart", range);
            distance = testRange.text.replace(/(\r\n|\r)/g, "\n").length;
            if (!distance) {
                return dtd.$empty[child.tagName] || dtd.$nonChild[child.tagName] ? {container:parent, offset:getIndex(child) + (position > 0 ? 0 : 1)} : {container:child, offset:position > 0 ? 0 : child.childNodes.length};
            }
            while (distance > 0) {
                try {
                    var pre = child;
                    child = child[position > 0 ? "previousSibling" : "nextSibling"];
                    distance -= child.nodeValue.length;
                }
                catch (e) {
                    return {container:parent, offset:getIndex(pre)};
                }
            }
            return {container:child, offset:position > 0 ? -distance : child.nodeValue.length + distance};
        }
        function transformIERangeToRange(ieRange, range) {
            if (ieRange.item) {
                range.selectNode(ieRange.item(0));
            } else {
                var bi = getBoundaryInformation(ieRange, true);
                range.setStart(bi.container, bi.offset);
                if (ieRange.compareEndPoints("StartToEnd", ieRange) != 0) {
                    bi = getBoundaryInformation(ieRange, false);
                    range.setEnd(bi.container, bi.offset);
                }
            }
            return range;
        }
        function _getIERange(sel) {
            var ieRange;
            try {
                ieRange = sel.getNative().createRange();
            }
            catch (e) {
                return null;
            }
            var el = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
            if ((el.ownerDocument || el) === sel.document) {
                return ieRange;
            }
            return null;
        }
        var Selection = dom.Selection = function (doc) {
            var me = this, iframe;
            me.document = doc;
            if (browser.ie9below) {
                iframe = domUtils.getWindow(doc).frameElement;
                domUtils.on(iframe, "beforedeactivate", function () {
                    me._bakIERange = me.getIERange();
                });
                domUtils.on(iframe, "activate", function () {
                    try {
                        if (!_getIERange(me) && me._bakIERange) {
                            me._bakIERange.select();
                        }
                    }
                    catch (ex) {
                    }
                    me._bakIERange = null;
                });
            }
            iframe = doc = null;
        };
        Selection.prototype = {rangeInBody:function (rng, txtRange) {
            var node = browser.ie9below || txtRange ? rng.item ? rng.item() : rng.parentElement() : rng.startContainer;
            return node === this.document.body || domUtils.inDoc(node, this.document);
        }, getNative:function () {
            var doc = this.document;
            try {
                return !doc ? null : browser.ie9below ? doc.selection : domUtils.getWindow(doc).getSelection();
            }
            catch (e) {
                return null;
            }
        }, getIERange:function () {
            var ieRange = _getIERange(this);
            if (!ieRange) {
                if (this._bakIERange) {
                    return this._bakIERange;
                }
            }
            return ieRange;
        }, cache:function () {
            this.clear();
            this._cachedRange = this.getRange();
            this._cachedStartElement = this.getStart();
            this._cachedStartElementPath = this.getStartElementPath();
        }, getStartElementPath:function () {
            if (this._cachedStartElementPath) {
                return this._cachedStartElementPath;
            }
            var start = this.getStart();
            if (start) {
                return domUtils.findParents(start, true, null, true);
            }
            return [];
        }, clear:function () {
            this._cachedStartElementPath = this._cachedRange = this._cachedStartElement = null;
        }, isFocus:function () {
            try {
                if (browser.ie9below) {
                    var nativeRange = _getIERange(this);
                    return !!(nativeRange && this.rangeInBody(nativeRange));
                } else {
                    return !!this.getNative().rangeCount;
                }
            }
            catch (e) {
                return false;
            }
        }, getRange:function () {
            var me = this;
            function optimze(range) {
                var child = me.document.body.firstChild, collapsed = range.collapsed;
                while (child && child.firstChild) {
                    range.setStart(child, 0);
                    child = child.firstChild;
                }
                if (!range.startContainer) {
                    range.setStart(me.document.body, 0);
                }
                if (collapsed) {
                    range.collapse(true);
                }
            }
            if (me._cachedRange != null) {
                return this._cachedRange;
            }
            var range = new baidu.editor.dom.Range(me.document);
            if (browser.ie9below) {
                var nativeRange = me.getIERange();
                if (nativeRange) {
                    try {
                        transformIERangeToRange(nativeRange, range);
                    }
                    catch (e) {
                        optimze(range);
                    }
                } else {
                    optimze(range);
                }
            } else {
                var sel = me.getNative();
                if (sel && sel.rangeCount) {
                    var firstRange = sel.getRangeAt(0);
                    var lastRange = sel.getRangeAt(sel.rangeCount - 1);
                    range.setStart(firstRange.startContainer, firstRange.startOffset).setEnd(lastRange.endContainer, lastRange.endOffset);
                    if (range.collapsed && domUtils.isBody(range.startContainer) && !range.startOffset) {
                        optimze(range);
                    }
                } else {
                    if (this._bakRange && domUtils.inDoc(this._bakRange.startContainer, this.document)) {
                        return this._bakRange;
                    }
                    optimze(range);
                }
            }
            return this._bakRange = range;
        }, getStart:function () {
            if (this._cachedStartElement) {
                return this._cachedStartElement;
            }
            var range = browser.ie9below ? this.getIERange() : this.getRange(), tmpRange, start, tmp, parent;
            if (browser.ie9below) {
                if (!range) {
                    return this.document.body.firstChild;
                }
                if (range.item) {
                    return range.item(0);
                }
                tmpRange = range.duplicate();
                tmpRange.text.length > 0 && tmpRange.moveStart("character", 1);
                tmpRange.collapse(1);
                start = tmpRange.parentElement();
                parent = tmp = range.parentElement();
                while (tmp = tmp.parentNode) {
                    if (tmp == start) {
                        start = parent;
                        break;
                    }
                }
            } else {
                range.shrinkBoundary();
                start = range.startContainer;
                if (start.nodeType == 1 && start.hasChildNodes()) {
                    start = start.childNodes[Math.min(start.childNodes.length - 1, range.startOffset)];
                }
                if (start.nodeType == 3) {
                    return start.parentNode;
                }
            }
            return start;
        }, getText:function () {
            var nativeSel, nativeRange;
            if (this.isFocus() && (nativeSel = this.getNative())) {
                nativeRange = browser.ie9below ? nativeSel.createRange() : nativeSel.getRangeAt(0);
                return browser.ie9below ? nativeRange.text : nativeRange.toString();
            }
            return "";
        }, clearRange:function () {
            this.getNative()[browser.ie9below ? "empty" : "removeAllRanges"]();
        }};
    })();
    (function () {
        var uid = 0, _selectionChangeTimer;
        function setValue(form, editor) {
            var textarea;
            if (editor.textarea) {
                if (utils.isString(editor.textarea)) {
                    for (var i = 0, ti, tis = domUtils.getElementsByTagName(form, "textarea"); ti = tis[i++]; ) {
                        if (ti.id == "ueditor_textarea_" + editor.options.textarea) {
                            textarea = ti;
                            break;
                        }
                    }
                } else {
                    textarea = editor.textarea;
                }
            }
            if (!textarea) {
                form.appendChild(textarea = domUtils.createElement(document, "textarea", {"name":editor.options.textarea, "id":"ueditor_textarea_" + editor.options.textarea, "style":"display:none"}));
                editor.textarea = textarea;
            }
            textarea.value = editor.hasContents() ? (editor.options.allHtmlEnabled ? editor.getAllHtml() : editor.getContent(null, null, true)) : "";
        }
        function loadPlugins(me) {
            for (var pi in UE.plugins) {
                UE.plugins[pi].call(me);
            }
        }
        function checkCurLang(I18N) {
            for (var lang in I18N) {
                return lang;
            }
        }
        function langReadied(me) {
            me.langIsReady = true;
            me.fireEvent("langReady");
        }
        var Editor = UE.Editor = function (options) {
            var me = this;
            me.uid = uid++;
            EventBase.call(me);
            me.commands = {};
            me.options = utils.extend(utils.clone(options || {}), UEDITOR_CONFIG, true);
            me.shortcutkeys = {};
            me.inputRules = [];
            me.outputRules = [];
            me.setOpt({isShow:true, initialContent:"", initialStyle:"", autoClearinitialContent:false, iframeCssUrl:me.options.UEDITOR_HOME_URL + "themes/iframe.css", textarea:"editorValue", focus:false, focusInEnd:true, autoClearEmptyNode:true, fullscreen:false, readonly:false, zIndex:999, imagePopup:true, enterTag:"p", customDomain:false, lang:"zh-cn", langPath:me.options.UEDITOR_HOME_URL + "lang/", theme:"default", themePath:me.options.UEDITOR_HOME_URL + "themes/", allHtmlEnabled:false, scaleEnabled:false, tableNativeEditInFF:false, autoSyncData:true, fileNameFormat:"{time}{rand:6}"});
            if (!utils.isEmptyObject(UE.I18N)) {
                me.options.lang = checkCurLang(UE.I18N);
                UE.plugin.load(me);
                langReadied(me);
            } else {
                utils.loadFile(document, {src:me.options.langPath + me.options.lang + "/" + me.options.lang + ".js", tag:"script", type:"text/javascript", defer:"defer"}, function () {
                    UE.plugin.load(me);
                    langReadied(me);
                });
            }
            UE.instants["ueditorInstant" + me.uid] = me;
        };
        Editor.prototype = {ready:function (fn) {
            var me = this;
            if (fn) {
                me.isReady ? fn.apply(me) : me.addListener("ready", fn);
            }
        }, setOpt:function (key, val) {
            var obj = {};
            if (utils.isString(key)) {
                obj[key] = val;
            } else {
                obj = key;
            }
            utils.extend(this.options, obj, true);
        }, destroy:function () {
            var me = this;
            me.fireEvent("destroy");
            var container = me.container.parentNode;
            var textarea = me.textarea;
            if (!textarea) {
                textarea = document.createElement("textarea");
                container.parentNode.insertBefore(textarea, container);
            } else {
                textarea.style.display = "";
            }
            textarea.style.width = me.iframe.offsetWidth + "px";
            textarea.style.height = me.iframe.offsetHeight + "px";
            textarea.value = me.getContent();
            textarea.id = me.key;
            container.innerHTML = "";
            domUtils.remove(container);
            var key = me.key;
            for (var p in me) {
                if (me.hasOwnProperty(p)) {
                    delete this[p];
                }
            }
            UE.delEditor(key);
        }, render:function (container) {
            var me = this, options = me.options, getStyleValue = function (attr) {
                return parseInt(domUtils.getComputedStyle(container, attr));
            };
            if (utils.isString(container)) {
                container = document.getElementById(container);
            }
            if (container) {
                if (options.initialFrameWidth) {
                    options.minFrameWidth = options.initialFrameWidth;
                } else {
                    options.minFrameWidth = options.initialFrameWidth = container.offsetWidth;
                }
                if (options.initialFrameHeight) {
                    options.minFrameHeight = options.initialFrameHeight;
                } else {
                    options.initialFrameHeight = options.minFrameHeight = container.offsetHeight;
                }
                container.style.width = /%$/.test(options.initialFrameWidth) ? "100%" : options.initialFrameWidth - getStyleValue("padding-left") - getStyleValue("padding-right") + "px";
                container.style.height = /%$/.test(options.initialFrameHeight) ? "100%" : options.initialFrameHeight - getStyleValue("padding-top") - getStyleValue("padding-bottom") + "px";
                container.style.zIndex = options.zIndex;
                var html = (ie && browser.version < 9 ? "" : "<!DOCTYPE html>") + "<html xmlns='http://www.w3.org/1999/xhtml' class='view' ><head>" + "<style type='text/css'>" + ".view{padding:0;word-wrap:break-word;cursor:text;height:90%;}" + "body{margin:8px;font-family:sans-serif;font-size:16px;}" + "p{margin:5px 0;}</style>" + (options.iframeCssUrl ? "<link rel='stylesheet' type='text/css' href='" + utils.unhtml(options.iframeCssUrl) + "'/>" : "") + (options.initialStyle ? "<style>" + options.initialStyle + "</style>" : "") + "</head><body class='view' ></body>" + "<script type='text/javascript' " + (ie ? "defer='defer'" : "") + " id='_initialScript'>" + "setTimeout(function(){editor = window.parent.UE.instants['ueditorInstant" + me.uid + "'];editor._setup(document);},0);" + "var _tmpScript = document.getElementById('_initialScript');_tmpScript.parentNode.removeChild(_tmpScript);</scr";
                container.appendChild(domUtils.createElement(document, "iframe", {id:"ueditor_" + me.uid, width:"100%", height:"100%", frameborder:"0", src:"javascript:void(function(){document.open();" + (options.customDomain && document.domain != location.hostname ? "document.domain=\"" + document.domain + "\";" : "") + "document.write(\"" + html + "\");document.write(\"" + "ipt></html>" + "\");document.close();}())"}));
                container.style.overflow = "hidden";
                setTimeout(function () {
                    if (/%$/.test(options.initialFrameWidth)) {
                        options.minFrameWidth = options.initialFrameWidth = container.offsetWidth;
                    }
                    if (/%$/.test(options.initialFrameHeight)) {
                        options.minFrameHeight = options.initialFrameHeight = container.offsetHeight;
                        container.style.height = options.initialFrameHeight + "px";
                    }
                });
            }
        }, _setup:function (doc) {
            var me = this, options = me.options;
            if (ie) {
                doc.body.disabled = true;
                doc.body.contentEditable = true;
                doc.body.disabled = false;
            } else {
                doc.body.contentEditable = true;
            }
            doc.body.spellcheck = false;
            me.document = doc;
            me.window = doc.defaultView || doc.parentWindow;
            me.iframe = me.window.frameElement;
            me.body = doc.body;
            me.selection = new dom.Selection(doc);
            var geckoSel;
            if (browser.gecko && (geckoSel = this.selection.getNative())) {
                geckoSel.removeAllRanges();
            }
            this._initEvents();
            for (var form = this.iframe.parentNode; !domUtils.isBody(form); form = form.parentNode) {
                if (form.tagName == "FORM") {
                    me.form = form;
                    if (me.options.autoSyncData) {
                        domUtils.on(me.window, "blur", function () {
                            setValue(form, me);
                        });
                    } else {
                        domUtils.on(form, "submit", function () {
                            setValue(this, me);
                        });
                    }
                    break;
                }
            }
            if (options.initialContent) {
                if (options.autoClearinitialContent) {
                    var oldExecCommand = me.execCommand;
                    me.execCommand = function () {
                        me.fireEvent("firstBeforeExecCommand");
                        return oldExecCommand.apply(me, arguments);
                    };
                    this._setDefaultContent(options.initialContent);
                } else {
                    this.setContent(options.initialContent, false, true);
                }
            }
            if (domUtils.isEmptyNode(me.body)) {
                me.body.innerHTML = "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
            }
            if (options.focus) {
                setTimeout(function () {
                    me.focus(me.options.focusInEnd);
                    !me.options.autoClearinitialContent && me._selectionChange();
                }, 0);
            }
            if (!me.container) {
                me.container = this.iframe.parentNode;
            }
            if (options.fullscreen && me.ui) {
                me.ui.setFullScreen(true);
            }
            try {
                me.document.execCommand("2D-position", false, false);
            }
            catch (e) {
            }
            try {
                me.document.execCommand("enableInlineTableEditing", false, false);
            }
            catch (e) {
            }
            try {
                me.document.execCommand("enableObjectResizing", false, false);
            }
            catch (e) {
            }
            me._bindshortcutKeys();
            me.isReady = 1;
            me.fireEvent("ready");
            options.onready && options.onready.call(me);
            if (!browser.ie9below) {
                domUtils.on(me.window, ["blur", "focus"], function (e) {
                    if (e.type == "blur") {
                        me._bakRange = me.selection.getRange();
                        try {
                            me._bakNativeRange = me.selection.getNative().getRangeAt(0);
                            me.selection.getNative().removeAllRanges();
                        }
                        catch (e) {
                            me._bakNativeRange = null;
                        }
                    } else {
                        try {
                            me._bakRange && me._bakRange.select();
                        }
                        catch (e) {
                        }
                    }
                });
            }
            if (browser.gecko && browser.version <= 10902) {
                me.body.contentEditable = false;
                setTimeout(function () {
                    me.body.contentEditable = true;
                }, 100);
                setInterval(function () {
                    me.body.style.height = me.iframe.offsetHeight - 20 + "px";
                }, 100);
            }
            !options.isShow && me.setHide();
            options.readonly && me.setDisabled();
        }, sync:function (formId) {
            var me = this, form = formId ? document.getElementById(formId) : domUtils.findParent(me.iframe.parentNode, function (node) {
                return node.tagName == "FORM";
            }, true);
            form && setValue(form, me);
        }, setHeight:function (height, notSetHeight) {
            if (height !== parseInt(this.iframe.parentNode.style.height)) {
                this.iframe.parentNode.style.height = height + "px";
            }
            !notSetHeight && (this.options.minFrameHeight = this.options.initialFrameHeight = height);
            this.body.style.height = height + "px";
        }, addshortcutkey:function (cmd, keys) {
            var obj = {};
            if (keys) {
                obj[cmd] = keys;
            } else {
                obj = cmd;
            }
            utils.extend(this.shortcutkeys, obj);
        }, _bindshortcutKeys:function () {
            var me = this, shortcutkeys = this.shortcutkeys;
            me.addListener("keydown", function (type, e) {
                var keyCode = e.keyCode || e.which;
                for (var i in shortcutkeys) {
                    var tmp = shortcutkeys[i].split(",");
                    for (var t = 0, ti; ti = tmp[t++]; ) {
                        ti = ti.split(":");
                        var key = ti[0], param = ti[1];
                        if (/^(ctrl)(\+shift)?\+(\d+)$/.test(key.toLowerCase()) || /^(\d+)$/.test(key)) {
                            if (((RegExp.$1 == "ctrl" ? (e.ctrlKey || e.metaKey) : 0) && (RegExp.$2 != "" ? e[RegExp.$2.slice(1) + "Key"] : 1) && keyCode == RegExp.$3) || keyCode == RegExp.$1) {
                                if (me.queryCommandState(i, param) != -1) {
                                    me.execCommand(i, param);
                                }
                                domUtils.preventDefault(e);
                            }
                        }
                    }
                }
            });
        }, getContent:function (cmd, fn, notSetCursor, ignoreBlank, formatter) {
            var me = this;
            if (cmd && utils.isFunction(cmd)) {
                fn = cmd;
                cmd = "";
            }
            if (fn ? !fn() : !this.hasContents()) {
                return "";
            }
            me.fireEvent("beforegetcontent");
            var root = UE.htmlparser(me.body.innerHTML, ignoreBlank);
            me.filterOutputRule(root);
            me.fireEvent("aftergetcontent", cmd, root);
            return root.toHtml(formatter);
        }, getAllHtml:function () {
            var me = this, headHtml = [], html = "";
            me.fireEvent("getAllHtml", headHtml);
            if (browser.ie && browser.version > 8) {
                var headHtmlForIE9 = "";
                utils.each(me.document.styleSheets, function (si) {
                    headHtmlForIE9 += (si.href ? "<link rel=\"stylesheet\" type=\"text/css\" href=\"" + si.href + "\" />" : "<style>" + si.cssText + "</style>");
                });
                utils.each(me.document.getElementsByTagName("script"), function (si) {
                    headHtmlForIE9 += si.outerHTML;
                });
            }
            return "<html><head>" + (me.options.charset ? "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=" + me.options.charset + "\"/>" : "") + (headHtmlForIE9 || me.document.getElementsByTagName("head")[0].innerHTML) + headHtml.join("\n") + "</head>" + "<body " + (ie && browser.version < 9 ? "class=\"view\"" : "") + ">" + me.getContent(null, null, true) + "</body></html>";
        }, getPlainTxt:function () {
            var reg = new RegExp(domUtils.fillChar, "g"), html = this.body.innerHTML.replace(/[\n\r]/g, "");
            html = html.replace(/<(p|div)[^>]*>(<br\/?>|&nbsp;)<\/\1>/gi, "\n").replace(/<br\/?>/gi, "\n").replace(/<[^>/]+>/g, "").replace(/(\n)?<\/([^>]+)>/g, function (a, b, c) {
                return dtd.$block[c] ? "\n" : b ? b : "";
            });
            return html.replace(reg, "").replace(/\u00a0/g, " ").replace(/&nbsp;/g, " ");
        }, getContentTxt:function () {
            var reg = new RegExp(domUtils.fillChar, "g");
            return this.body[browser.ie ? "innerText" : "textContent"].replace(reg, "").replace(/\u00a0/g, " ");
        }, setContent:function (html, isAppendTo, notFireSelectionchange) {
            var me = this;
            me.fireEvent("beforesetcontent", html);
            var root = UE.htmlparser(html);
            me.filterInputRule(root);
            html = root.toHtml();
            me.body.innerHTML = (isAppendTo ? me.body.innerHTML : "") + html;
            function isCdataDiv(node) {
                return node.tagName == "DIV" && node.getAttribute("cdata_tag");
            }
            if (me.options.enterTag == "p") {
                var child = this.body.firstChild, tmpNode;
                if (!child || child.nodeType == 1 && (dtd.$cdata[child.tagName] || isCdataDiv(child) || domUtils.isCustomeNode(child)) && child === this.body.lastChild) {
                    this.body.innerHTML = "<p>" + (browser.ie ? "&nbsp;" : "<br/>") + "</p>" + this.body.innerHTML;
                } else {
                    var p = me.document.createElement("p");
                    while (child) {
                        while (child && (child.nodeType == 3 || child.nodeType == 1 && dtd.p[child.tagName] && !dtd.$cdata[child.tagName])) {
                            tmpNode = child.nextSibling;
                            p.appendChild(child);
                            child = tmpNode;
                        }
                        if (p.firstChild) {
                            if (!child) {
                                me.body.appendChild(p);
                                break;
                            } else {
                                child.parentNode.insertBefore(p, child);
                                p = me.document.createElement("p");
                            }
                        }
                        child = child.nextSibling;
                    }
                }
            }
            me.fireEvent("aftersetcontent");
            me.fireEvent("contentchange");
            !notFireSelectionchange && me._selectionChange();
            me._bakRange = me._bakIERange = me._bakNativeRange = null;
            var geckoSel;
            if (browser.gecko && (geckoSel = this.selection.getNative())) {
                geckoSel.removeAllRanges();
            }
            if (me.options.autoSyncData) {
                me.form && setValue(me.form, me);
            }
        }, focus:function (toEnd) {
            try {
                var me = this, rng = me.selection.getRange();
                if (toEnd) {
                    var node = me.body.lastChild;
                    if (node && node.nodeType == 1 && !dtd.$empty[node.tagName]) {
                        if (domUtils.isEmptyBlock(node)) {
                            rng.setStartAtFirst(node);
                        } else {
                            rng.setStartAtLast(node);
                        }
                        rng.collapse(true);
                    }
                    rng.setCursor(true);
                } else {
                    if (!rng.collapsed && domUtils.isBody(rng.startContainer) && rng.startOffset == 0) {
                        var node = me.body.firstChild;
                        if (node && node.nodeType == 1 && !dtd.$empty[node.tagName]) {
                            rng.setStartAtFirst(node).collapse(true);
                        }
                    }
                    rng.select(true);
                }
                this.fireEvent("focus selectionchange");
            }
            catch (e) {
            }
        }, isFocus:function () {
            return this.selection.isFocus();
        }, blur:function () {
            var sel = this.selection.getNative();
            if (sel.empty && browser.ie) {
                var nativeRng = document.body.createTextRange();
                nativeRng.moveToElementText(document.body);
                nativeRng.collapse(true);
                nativeRng.select();
                sel.empty();
            } else {
                sel.removeAllRanges();
            }
        }, _initEvents:function () {
            var me = this, doc = me.document, win = me.window;
            me._proxyDomEvent = utils.bind(me._proxyDomEvent, me);
            domUtils.on(doc, ["click", "contextmenu", "mousedown", "keydown", "keyup", "keypress", "mouseup", "mouseover", "mouseout", "selectstart"], me._proxyDomEvent);
            domUtils.on(win, ["focus", "blur"], me._proxyDomEvent);
            domUtils.on(me.body, "drop", function (e) {
                if (browser.gecko && e.stopPropagation) {
                    e.stopPropagation();
                }
                me.fireEvent("contentchange");
            });
            domUtils.on(doc, ["mouseup", "keydown"], function (evt) {
                if (evt.type == "keydown" && (evt.ctrlKey || evt.metaKey || evt.shiftKey || evt.altKey)) {
                    return;
                }
                if (evt.button == 2) {
                    return;
                }
                me._selectionChange(250, evt);
            });
        }, _proxyDomEvent:function (evt) {
            if (this.fireEvent("before" + evt.type.replace(/^on/, "").toLowerCase()) === false) {
                return false;
            }
            if (this.fireEvent(evt.type.replace(/^on/, ""), evt) === false) {
                return false;
            }
            return this.fireEvent("after" + evt.type.replace(/^on/, "").toLowerCase());
        }, _selectionChange:function (delay, evt) {
            var me = this;
            var hackForMouseUp = false;
            var mouseX, mouseY;
            if (browser.ie && browser.version < 9 && evt && evt.type == "mouseup") {
                var range = this.selection.getRange();
                if (!range.collapsed) {
                    hackForMouseUp = true;
                    mouseX = evt.clientX;
                    mouseY = evt.clientY;
                }
            }
            clearTimeout(_selectionChangeTimer);
            _selectionChangeTimer = setTimeout(function () {
                if (!me.selection || !me.selection.getNative()) {
                    return;
                }
                var ieRange;
                if (hackForMouseUp && me.selection.getNative().type == "None") {
                    ieRange = me.document.body.createTextRange();
                    try {
                        ieRange.moveToPoint(mouseX, mouseY);
                    }
                    catch (ex) {
                        ieRange = null;
                    }
                }
                var bakGetIERange;
                if (ieRange) {
                    bakGetIERange = me.selection.getIERange;
                    me.selection.getIERange = function () {
                        return ieRange;
                    };
                }
                me.selection.cache();
                if (bakGetIERange) {
                    me.selection.getIERange = bakGetIERange;
                }
                if (me.selection._cachedRange && me.selection._cachedStartElement) {
                    me.fireEvent("beforeselectionchange");
                    me.fireEvent("selectionchange", !!evt);
                    me.fireEvent("afterselectionchange");
                    me.selection.clear();
                }
            }, delay || 50);
        }, _callCmdFn:function (fnName, args) {
            var cmdName = args[0].toLowerCase(), cmd, cmdFn;
            cmd = this.commands[cmdName] || UE.commands[cmdName];
            cmdFn = cmd && cmd[fnName];
            if ((!cmd || !cmdFn) && fnName == "queryCommandState") {
                return 0;
            } else {
                if (cmdFn) {
                    return cmdFn.apply(this, args);
                }
            }
        }, execCommand:function (cmdName) {
            cmdName = cmdName.toLowerCase();
            var me = this, result, cmd = me.commands[cmdName] || UE.commands[cmdName];
            if (!cmd || !cmd.execCommand) {
                return null;
            }
            if (!cmd.notNeedUndo && !me.__hasEnterExecCommand) {
                me.__hasEnterExecCommand = true;
                if (me.queryCommandState.apply(me, arguments) != -1) {
                    me.fireEvent("saveScene");
                    me.fireEvent("beforeexeccommand", cmdName);
                    result = this._callCmdFn("execCommand", arguments);
                    (!cmd.ignoreContentChange && !me._ignoreContentChange) && me.fireEvent("contentchange");
                    me.fireEvent("afterexeccommand", cmdName);
                    me.fireEvent("saveScene");
                }
                me.__hasEnterExecCommand = false;
            } else {
                result = this._callCmdFn("execCommand", arguments);
                (!me.__hasEnterExecCommand && !cmd.ignoreContentChange && !me._ignoreContentChange) && me.fireEvent("contentchange");
            }
            (!me.__hasEnterExecCommand && !cmd.ignoreContentChange && !me._ignoreContentChange) && me._selectionChange();
            return result;
        }, queryCommandState:function (cmdName) {
            return this._callCmdFn("queryCommandState", arguments);
        }, queryCommandValue:function (cmdName) {
            return this._callCmdFn("queryCommandValue", arguments);
        }, hasContents:function (tags) {
            if (tags) {
                for (var i = 0, ci; ci = tags[i++]; ) {
                    if (this.document.getElementsByTagName(ci).length > 0) {
                        return true;
                    }
                }
            }
            if (!domUtils.isEmptyBlock(this.body)) {
                return true;
            }
            tags = ["div"];
            for (i = 0; ci = tags[i++]; ) {
                var nodes = domUtils.getElementsByTagName(this.document, ci);
                for (var n = 0, cn; cn = nodes[n++]; ) {
                    if (domUtils.isCustomeNode(cn)) {
                        return true;
                    }
                }
            }
            return false;
        }, reset:function () {
            this.fireEvent("reset");
        }, setEnabled:function () {
            var me = this, range;
            if (me.body.contentEditable == "false") {
                me.body.contentEditable = true;
                range = me.selection.getRange();
                try {
                    range.moveToBookmark(me.lastBk);
                    delete me.lastBk;
                }
                catch (e) {
                    range.setStartAtFirst(me.body).collapse(true);
                }
                range.select(true);
                if (me.bkqueryCommandState) {
                    me.queryCommandState = me.bkqueryCommandState;
                    delete me.bkqueryCommandState;
                }
                me.fireEvent("selectionchange");
            }
        }, enable:function () {
            return this.setEnabled();
        }, setDisabled:function (except) {
            var me = this;
            except = except ? utils.isArray(except) ? except : [except] : [];
            if (me.body.contentEditable == "true") {
                if (!me.lastBk) {
                    me.lastBk = me.selection.getRange().createBookmark(true);
                }
                me.body.contentEditable = false;
                me.bkqueryCommandState = me.queryCommandState;
                me.queryCommandState = function (type) {
                    if (utils.indexOf(except, type) != -1) {
                        return me.bkqueryCommandState.apply(me, arguments);
                    }
                    return -1;
                };
                me.fireEvent("selectionchange");
            }
        }, disable:function (except) {
            return this.setDisabled(except);
        }, _setDefaultContent:function () {
            function clear() {
                var me = this;
                if (me.document.getElementById("initContent")) {
                    me.body.innerHTML = "<p>" + (ie ? "" : "<br/>") + "</p>";
                    me.removeListener("firstBeforeExecCommand focus", clear);
                    setTimeout(function () {
                        me.focus();
                        me._selectionChange();
                    }, 0);
                }
            }
            return function (cont) {
                var me = this;
                me.body.innerHTML = "<p id=\"initContent\">" + cont + "</p>";
                me.addListener("firstBeforeExecCommand focus", clear);
            };
        }(), setShow:function () {
            var me = this, range = me.selection.getRange();
            if (me.container.style.display == "none") {
                try {
                    range.moveToBookmark(me.lastBk);
                    delete me.lastBk;
                }
                catch (e) {
                    range.setStartAtFirst(me.body).collapse(true);
                }
                setTimeout(function () {
                    range.select(true);
                }, 100);
                me.container.style.display = "";
            }
        }, show:function () {
            return this.setShow();
        }, setHide:function () {
            var me = this;
            if (!me.lastBk) {
                me.lastBk = me.selection.getRange().createBookmark(true);
            }
            me.container.style.display = "none";
        }, hide:function () {
            return this.setHide();
        }, getLang:function (path) {
            var lang = UE.I18N[this.options.lang];
            if (!lang) {
                throw Error("not import language file");
            }
            path = (path || "").split(".");
            for (var i = 0, ci; ci = path[i++]; ) {
                lang = lang[ci];
                if (!lang) {
                    break;
                }
            }
            return lang;
        }, getContentLength:function (ingoneHtml, tagNames) {
            var count = this.getContent(false, false, true).length;
            if (ingoneHtml) {
                tagNames = (tagNames || []).concat(["hr", "img", "iframe"]);
                count = this.getContentTxt().replace(/[\t\r\n]+/g, "").length;
                for (var i = 0, ci; ci = tagNames[i++]; ) {
                    count += this.document.getElementsByTagName(ci).length;
                }
            }
            return count;
        }, addInputRule:function (rule) {
            this.inputRules.push(rule);
        }, filterInputRule:function (root) {
            for (var i = 0, ci; ci = this.inputRules[i++]; ) {
                ci.call(this, root);
            }
        }, addOutputRule:function (rule) {
            this.outputRules.push(rule);
        }, filterOutputRule:function (root) {
            for (var i = 0, ci; ci = this.outputRules[i++]; ) {
                ci.call(this, root);
            }
        }};
        utils.inherits(Editor, EventBase);
    })();
    UE.ajax = function () {
        var fnStr = "XMLHttpRequest()";
        try {
            new ActiveXObject("Msxml2.XMLHTTP");
            fnStr = "ActiveXObject('Msxml2.XMLHTTP')";
        }
        catch (e) {
            try {
                new ActiveXObject("Microsoft.XMLHTTP");
                fnStr = "ActiveXObject('Microsoft.XMLHTTP')";
            }
            catch (e) {
            }
        }
        var creatAjaxRequest = new Function("return new " + fnStr);
        function json2str(json) {
            var strArr = [];
            for (var i in json) {
                if (i == "method" || i == "timeout" || i == "async") {
                    continue;
                }
                if (!((typeof json[i]).toLowerCase() == "function" || (typeof json[i]).toLowerCase() == "object")) {
                    strArr.push(encodeURIComponent(i) + "=" + encodeURIComponent(json[i]));
                }
            }
            return strArr.join("&");
        }
        return {request:function (url, ajaxOptions) {
            var ajaxRequest = creatAjaxRequest(), timeIsOut = false, defaultAjaxOptions = {method:"POST", timeout:5000, async:true, data:{}, onsuccess:function () {
            }, onerror:function () {
            }};
            if (typeof url === "object") {
                ajaxOptions = url;
                url = ajaxOptions.url;
            }
            if (!ajaxRequest || !url) {
                return;
            }
            var ajaxOpts = ajaxOptions ? utils.extend(defaultAjaxOptions, ajaxOptions) : defaultAjaxOptions;
            var submitStr = json2str(ajaxOpts);
            if (!utils.isEmptyObject(ajaxOpts.data)) {
                submitStr += (submitStr ? "&" : "") + json2str(ajaxOpts.data);
            }
            var timerID = setTimeout(function () {
                if (ajaxRequest.readyState != 4) {
                    timeIsOut = true;
                    ajaxRequest.abort();
                    clearTimeout(timerID);
                }
            }, ajaxOpts.timeout);
            var method = ajaxOpts.method.toUpperCase();
            var str = url + (url.indexOf("?") == -1 ? "?" : "&") + (method == "POST" ? "" : submitStr + "&noCache=" + +new Date);
            ajaxRequest.open(method, str, ajaxOpts.async);
            ajaxRequest.onreadystatechange = function () {
                if (ajaxRequest.readyState == 4) {
                    if (!timeIsOut && ajaxRequest.status == 200) {
                        ajaxOpts.onsuccess(ajaxRequest);
                    } else {
                        ajaxOpts.onerror(ajaxRequest);
                    }
                }
            };
            if (method == "POST") {
                ajaxRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                ajaxRequest.send(submitStr);
            } else {
                ajaxRequest.send(null);
            }
        }};
    }();
    var filterWord = UE.filterWord = function () {
        function isWordDocument(str) {
            return /(class="?Mso|style="[^"]*\bmso\-|w:WordDocument|<(v|o):|lang=)/ig.test(str);
        }
        function transUnit(v) {
            v = v.replace(/[\d.]+\w+/g, function (m) {
                return utils.transUnitToPx(m);
            });
            return v;
        }
        function filterPasteWord(str) {
            return str.replace(/[\t\r\n]+/g, " ").replace(/<!--[\s\S]*?-->/ig, "").replace(/<v:shape [^>]*>[\s\S]*?.<\/v:shape>/gi, function (str) {
                if (browser.opera) {
                    return "";
                }
                try {
                    if (/Bitmap/i.test(str)) {
                        return "";
                    }
                    var width = str.match(/width:([ \d.]*p[tx])/i)[1], height = str.match(/height:([ \d.]*p[tx])/i)[1], src = str.match(/src=\s*"([^"]*)"/i)[1];
                    return "<img width=\"" + transUnit(width) + "\" height=\"" + transUnit(height) + "\" src=\"" + src + "\" />";
                }
                catch (e) {
                    return "";
                }
            }).replace(/<\/?div[^>]*>/g, "").replace(/v:\w+=(["']?)[^'"]+\1/g, "").replace(/<(!|script[^>]*>.*?<\/script(?=[>\s])|\/?(\?xml(:\w+)?|xml|meta|link|style|\w+:\w+)(?=[\s\/>]))[^>]*>/gi, "").replace(/<p [^>]*class="?MsoHeading"?[^>]*>(.*?)<\/p>/gi, "<p><strong>$1</strong></p>").replace(/\s+(class|lang|align)\s*=\s*(['"]?)([\w-]+)\2/ig, function (str, name, marks, val) {
                return name == "class" && val == "MsoListParagraph" ? str : "";
            }).replace(/<(font|span)[^>]*>(\s*)<\/\1>/gi, function (a, b, c) {
                return c.replace(/[\t\r\n ]+/g, " ");
            }).replace(/(<[a-z][^>]*)\sstyle=(["'])([^\2]*?)\2/gi, function (str, tag, tmp, style) {
                var n = [], s = style.replace(/^\s+|\s+$/, "").replace(/&#39;/g, "'").replace(/&quot;/gi, "'").split(/;\s*/g);
                for (var i = 0, v; v = s[i]; i++) {
                    var name, value, parts = v.split(":");
                    if (parts.length == 2) {
                        name = parts[0].toLowerCase();
                        value = parts[1].toLowerCase();
                        if (/^(background)\w*/.test(name) && value.replace(/(initial|\s)/g, "").length == 0 || /^(margin)\w*/.test(name) && /^0\w+$/.test(value)) {
                            continue;
                        }
                        switch (name) {
                          case "mso-padding-alt":
                          case "mso-padding-top-alt":
                          case "mso-padding-right-alt":
                          case "mso-padding-bottom-alt":
                          case "mso-padding-left-alt":
                          case "mso-margin-alt":
                          case "mso-margin-top-alt":
                          case "mso-margin-right-alt":
                          case "mso-margin-bottom-alt":
                          case "mso-margin-left-alt":
                          case "mso-height":
                          case "mso-width":
                          case "mso-vertical-align-alt":
                            if (!/<table/.test(tag)) {
                                n[i] = name.replace(/^mso-|-alt$/g, "") + ":" + transUnit(value);
                            }
                            continue;
                          case "horiz-align":
                            n[i] = "text-align:" + value;
                            continue;
                          case "vert-align":
                            n[i] = "vertical-align:" + value;
                            continue;
                          case "font-color":
                          case "mso-foreground":
                            n[i] = "color:" + value;
                            continue;
                          case "mso-background":
                          case "mso-highlight":
                            n[i] = "background:" + value;
                            continue;
                          case "mso-default-height":
                            n[i] = "min-height:" + transUnit(value);
                            continue;
                          case "mso-default-width":
                            n[i] = "min-width:" + transUnit(value);
                            continue;
                          case "mso-padding-between-alt":
                            n[i] = "border-collapse:separate;border-spacing:" + transUnit(value);
                            continue;
                          case "text-line-through":
                            if ((value == "single") || (value == "double")) {
                                n[i] = "text-decoration:line-through";
                            }
                            continue;
                          case "mso-zero-height":
                            if (value == "yes") {
                                n[i] = "display:none";
                            }
                            continue;
                          case "margin":
                            if (!/[1-9]/.test(value)) {
                                continue;
                            }
                        }
                        if (/^(mso|column|font-emph|lang|layout|line-break|list-image|nav|panose|punct|row|ruby|sep|size|src|tab-|table-border|text-(?:decor|trans)|top-bar|version|vnd|word-break)/.test(name) || /text\-indent|padding|margin/.test(name) && /\-[\d.]+/.test(value)) {
                            continue;
                        }
                        n[i] = name + ":" + parts[1];
                    }
                }
                return tag + (n.length ? " style=\"" + n.join(";").replace(/;{2,}/g, ";") + "\"" : "");
            }).replace(/[\d.]+(cm|pt)/g, function (str) {
                return utils.transUnitToPx(str);
            });
        }
        return function (html) {
            return (isWordDocument(html) ? filterPasteWord(html) : html);
        };
    }();
    (function () {
        var uNode = UE.uNode = function (obj) {
            this.type = obj.type;
            this.data = obj.data;
            this.tagName = obj.tagName;
            this.parentNode = obj.parentNode;
            this.attrs = obj.attrs || {};
            this.children = obj.children;
        };
        var notTransAttrs = {"href":1, "src":1, "_src":1, "_href":1, "cdata_data":1};
        var notTransTagName = {style:1, script:1};
        var indentChar = "    ", breakChar = "\n";
        function insertLine(arr, current, begin) {
            arr.push(breakChar);
            return current + (begin ? 1 : -1);
        }
        function insertIndent(arr, current) {
            for (var i = 0; i < current; i++) {
                arr.push(indentChar);
            }
        }
        uNode.createElement = function (html) {
            if (/[<>]/.test(html)) {
                return UE.htmlparser(html).children[0];
            } else {
                return new uNode({type:"element", children:[], tagName:html});
            }
        };
        uNode.createText = function (data, noTrans) {
            return new UE.uNode({type:"text", "data":noTrans ? data : utils.unhtml(data || "")});
        };
        function nodeToHtml(node, arr, formatter, current) {
            switch (node.type) {
              case "root":
                for (var i = 0, ci; ci = node.children[i++]; ) {
                    if (formatter && ci.type == "element" && !dtd.$inlineWithA[ci.tagName] && i > 1) {
                        insertLine(arr, current, true);
                        insertIndent(arr, current);
                    }
                    nodeToHtml(ci, arr, formatter, current);
                }
                break;
              case "text":
                isText(node, arr);
                break;
              case "element":
                isElement(node, arr, formatter, current);
                break;
              case "comment":
                isComment(node, arr, formatter);
            }
            return arr;
        }
        function isText(node, arr) {
            if (node.parentNode.tagName == "pre") {
                arr.push(node.data);
            } else {
                arr.push(notTransTagName[node.parentNode.tagName] ? utils.html(node.data) : node.data.replace(/[ ]{2}/g, " &nbsp;"));
            }
        }
        function isElement(node, arr, formatter, current) {
            var attrhtml = "";
            if (node.attrs) {
                attrhtml = [];
                var attrs = node.attrs;
                for (var a in attrs) {
                    attrhtml.push(a + (attrs[a] !== undefined ? "=\"" + (notTransAttrs[a] ? utils.html(attrs[a]).replace(/["]/g, function (a) {
                        return "&quot;";
                    }) : utils.unhtml(attrs[a])) + "\"" : ""));
                }
                attrhtml = attrhtml.join(" ");
            }
            arr.push("<" + node.tagName + (attrhtml ? " " + attrhtml : "") + (dtd.$empty[node.tagName] ? "/" : "") + ">");
            if (formatter && !dtd.$inlineWithA[node.tagName] && node.tagName != "pre") {
                if (node.children && node.children.length) {
                    current = insertLine(arr, current, true);
                    insertIndent(arr, current);
                }
            }
            if (node.children && node.children.length) {
                for (var i = 0, ci; ci = node.children[i++]; ) {
                    if (formatter && ci.type == "element" && !dtd.$inlineWithA[ci.tagName] && i > 1) {
                        insertLine(arr, current);
                        insertIndent(arr, current);
                    }
                    nodeToHtml(ci, arr, formatter, current);
                }
            }
            if (!dtd.$empty[node.tagName]) {
                if (formatter && !dtd.$inlineWithA[node.tagName] && node.tagName != "pre") {
                    if (node.children && node.children.length) {
                        current = insertLine(arr, current);
                        insertIndent(arr, current);
                    }
                }
                arr.push("</" + node.tagName + ">");
            }
        }
        function isComment(node, arr) {
            arr.push("<!--" + node.data + "-->");
        }
        function getNodeById(root, id) {
            var node;
            if (root.type == "element" && root.getAttr("id") == id) {
                return root;
            }
            if (root.children && root.children.length) {
                for (var i = 0, ci; ci = root.children[i++]; ) {
                    if (node = getNodeById(ci, id)) {
                        return node;
                    }
                }
            }
        }
        function getNodesByTagName(node, tagName, arr) {
            if (node.type == "element" && node.tagName == tagName) {
                arr.push(node);
            }
            if (node.children && node.children.length) {
                for (var i = 0, ci; ci = node.children[i++]; ) {
                    getNodesByTagName(ci, tagName, arr);
                }
            }
        }
        function nodeTraversal(root, fn) {
            if (root.children && root.children.length) {
                for (var i = 0, ci; ci = root.children[i]; ) {
                    nodeTraversal(ci, fn);
                    if (ci.parentNode) {
                        if (ci.children && ci.children.length) {
                            fn(ci);
                        }
                        if (ci.parentNode) {
                            i++;
                        }
                    }
                }
            } else {
                fn(root);
            }
        }
        uNode.prototype = {toHtml:function (formatter) {
            var arr = [];
            nodeToHtml(this, arr, formatter, 0);
            return arr.join("");
        }, innerHTML:function (htmlstr) {
            if (this.type != "element" || dtd.$empty[this.tagName]) {
                return this;
            }
            if (utils.isString(htmlstr)) {
                if (this.children) {
                    for (var i = 0, ci; ci = this.children[i++]; ) {
                        ci.parentNode = null;
                    }
                }
                this.children = [];
                var tmpRoot = UE.htmlparser(htmlstr);
                for (var i = 0, ci; ci = tmpRoot.children[i++]; ) {
                    this.children.push(ci);
                    ci.parentNode = this;
                }
                return this;
            } else {
                var tmpRoot = new UE.uNode({type:"root", children:this.children});
                return tmpRoot.toHtml();
            }
        }, innerText:function (textStr, noTrans) {
            if (this.type != "element" || dtd.$empty[this.tagName]) {
                return this;
            }
            if (textStr) {
                if (this.children) {
                    for (var i = 0, ci; ci = this.children[i++]; ) {
                        ci.parentNode = null;
                    }
                }
                this.children = [];
                this.appendChild(uNode.createText(textStr, noTrans));
                return this;
            } else {
                return this.toHtml().replace(/<[^>]+>/g, "");
            }
        }, getData:function () {
            if (this.type == "element") {
                return "";
            }
            return this.data;
        }, firstChild:function () {
            return this.children ? this.children[0] : null;
        }, lastChild:function () {
            return this.children ? this.children[this.children.length - 1] : null;
        }, previousSibling:function () {
            var parent = this.parentNode;
            for (var i = 0, ci; ci = parent.children[i]; i++) {
                if (ci === this) {
                    return i == 0 ? null : parent.children[i - 1];
                }
            }
        }, nextSibling:function () {
            var parent = this.parentNode;
            for (var i = 0, ci; ci = parent.children[i++]; ) {
                if (ci === this) {
                    return parent.children[i];
                }
            }
        }, replaceChild:function (target, source) {
            if (this.children) {
                if (target.parentNode) {
                    target.parentNode.removeChild(target);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === source) {
                        this.children.splice(i, 1, target);
                        source.parentNode = null;
                        target.parentNode = this;
                        return target;
                    }
                }
            }
        }, appendChild:function (node) {
            if (this.type == "root" || (this.type == "element" && !dtd.$empty[this.tagName])) {
                if (!this.children) {
                    this.children = [];
                }
                if (node.parentNode) {
                    node.parentNode.removeChild(node);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === node) {
                        this.children.splice(i, 1);
                        break;
                    }
                }
                this.children.push(node);
                node.parentNode = this;
                return node;
            }
        }, insertBefore:function (target, source) {
            if (this.children) {
                if (target.parentNode) {
                    target.parentNode.removeChild(target);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === source) {
                        this.children.splice(i, 0, target);
                        target.parentNode = this;
                        return target;
                    }
                }
            }
        }, insertAfter:function (target, source) {
            if (this.children) {
                if (target.parentNode) {
                    target.parentNode.removeChild(target);
                }
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === source) {
                        this.children.splice(i + 1, 0, target);
                        target.parentNode = this;
                        return target;
                    }
                }
            }
        }, removeChild:function (node, keepChildren) {
            if (this.children) {
                for (var i = 0, ci; ci = this.children[i]; i++) {
                    if (ci === node) {
                        this.children.splice(i, 1);
                        ci.parentNode = null;
                        if (keepChildren && ci.children && ci.children.length) {
                            for (var j = 0, cj; cj = ci.children[j]; j++) {
                                this.children.splice(i + j, 0, cj);
                                cj.parentNode = this;
                            }
                        }
                        return ci;
                    }
                }
            }
        }, getAttr:function (attrName) {
            return this.attrs && this.attrs[attrName.toLowerCase()];
        }, setAttr:function (attrName, attrVal) {
            if (!attrName) {
                delete this.attrs;
                return;
            }
            if (!this.attrs) {
                this.attrs = {};
            }
            if (utils.isObject(attrName)) {
                for (var a in attrName) {
                    if (!attrName[a]) {
                        delete this.attrs[a];
                    } else {
                        this.attrs[a.toLowerCase()] = attrName[a];
                    }
                }
            } else {
                if (!attrVal) {
                    delete this.attrs[attrName];
                } else {
                    this.attrs[attrName.toLowerCase()] = attrVal;
                }
            }
        }, getIndex:function () {
            var parent = this.parentNode;
            for (var i = 0, ci; ci = parent.children[i]; i++) {
                if (ci === this) {
                    return i;
                }
            }
            return -1;
        }, getNodeById:function (id) {
            var node;
            if (this.children && this.children.length) {
                for (var i = 0, ci; ci = this.children[i++]; ) {
                    if (node = getNodeById(ci, id)) {
                        return node;
                    }
                }
            }
        }, getNodesByTagName:function (tagNames) {
            tagNames = utils.trim(tagNames).replace(/[ ]{2,}/g, " ").split(" ");
            var arr = [], me = this;
            utils.each(tagNames, function (tagName) {
                if (me.children && me.children.length) {
                    for (var i = 0, ci; ci = me.children[i++]; ) {
                        getNodesByTagName(ci, tagName, arr);
                    }
                }
            });
            return arr;
        }, getStyle:function (name) {
            var cssStyle = this.getAttr("style");
            if (!cssStyle) {
                return "";
            }
            var reg = new RegExp("(^|;)\\s*" + name + ":([^;]+)", "i");
            var match = cssStyle.match(reg);
            if (match && match[0]) {
                return match[2];
            }
            return "";
        }, setStyle:function (name, val) {
            function exec(name, val) {
                var reg = new RegExp("(^|;)\\s*" + name + ":([^;]+;?)", "gi");
                cssStyle = cssStyle.replace(reg, "$1");
                if (val) {
                    cssStyle = name + ":" + utils.unhtml(val) + ";" + cssStyle;
                }
            }
            var cssStyle = this.getAttr("style");
            if (!cssStyle) {
                cssStyle = "";
            }
            if (utils.isObject(name)) {
                for (var a in name) {
                    exec(a, name[a]);
                }
            } else {
                exec(name, val);
            }
            this.setAttr("style", utils.trim(cssStyle));
        }, traversal:function (fn) {
            if (this.children && this.children.length) {
                nodeTraversal(this, fn);
            }
            return this;
        }};
    })();
    var htmlparser = UE.htmlparser = function (htmlstr, ignoreBlank) {
        var re_tag = /<(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->)|(?:([^\s\/>]+)\s*((?:(?:"[^"]*")|(?:'[^']*')|[^"'<>])*)\/?>))/g, re_attr = /([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;
        var allowEmptyTags = {b:1, code:1, i:1, u:1, strike:1, s:1, tt:1, strong:1, q:1, samp:1, em:1, span:1, sub:1, img:1, sup:1, font:1, big:1, small:1, iframe:1, a:1, br:1, pre:1};
        htmlstr = htmlstr.replace(new RegExp(domUtils.fillChar, "g"), "");
        if (!ignoreBlank) {
            htmlstr = htmlstr.replace(new RegExp("[\\r\\t\\n" + (ignoreBlank ? "" : " ") + "]*</?(\\w+)\\s*(?:[^>]*)>[\\r\\t\\n" + (ignoreBlank ? "" : " ") + "]*", "g"), function (a, b) {
                if (b && allowEmptyTags[b.toLowerCase()]) {
                    return a.replace(/(^[\n\r]+)|([\n\r]+$)/g, "");
                }
                return a.replace(new RegExp("^[\\r\\n" + (ignoreBlank ? "" : " ") + "]+"), "").replace(new RegExp("[\\r\\n" + (ignoreBlank ? "" : " ") + "]+$"), "");
            });
        }
        var notTransAttrs = {"href":1, "src":1};
        var uNode = UE.uNode, needParentNode = {"td":"tr", "tr":["tbody", "thead", "tfoot"], "tbody":"table", "th":"tr", "thead":"table", "tfoot":"table", "caption":"table", "li":["ul", "ol"], "dt":"dl", "dd":"dl", "option":"select"}, needChild = {"ol":"li", "ul":"li"};
        function text(parent, data) {
            if (needChild[parent.tagName]) {
                var tmpNode = uNode.createElement(needChild[parent.tagName]);
                parent.appendChild(tmpNode);
                tmpNode.appendChild(uNode.createText(data));
                parent = tmpNode;
            } else {
                parent.appendChild(uNode.createText(data));
            }
        }
        function element(parent, tagName, htmlattr) {
            var needParentTag;
            if (needParentTag = needParentNode[tagName]) {
                var tmpParent = parent, hasParent;
                while (tmpParent.type != "root") {
                    if (utils.isArray(needParentTag) ? utils.indexOf(needParentTag, tmpParent.tagName) != -1 : needParentTag == tmpParent.tagName) {
                        parent = tmpParent;
                        hasParent = true;
                        break;
                    }
                    tmpParent = tmpParent.parentNode;
                }
                if (!hasParent) {
                    parent = element(parent, utils.isArray(needParentTag) ? needParentTag[0] : needParentTag);
                }
            }
            var elm = new uNode({parentNode:parent, type:"element", tagName:tagName.toLowerCase(), children:dtd.$empty[tagName] ? null : []});
            if (htmlattr) {
                var attrs = {}, match;
                while (match = re_attr.exec(htmlattr)) {
                    attrs[match[1].toLowerCase()] = notTransAttrs[match[1].toLowerCase()] ? (match[2] || match[3] || match[4]) : utils.unhtml(match[2] || match[3] || match[4]);
                }
                elm.attrs = attrs;
            }
            parent.children.push(elm);
            return dtd.$empty[tagName] ? parent : elm;
        }
        function comment(parent, data) {
            parent.children.push(new uNode({type:"comment", data:data, parentNode:parent}));
        }
        var match, currentIndex = 0, nextIndex = 0;
        var root = new uNode({type:"root", children:[]});
        var currentParent = root;
        while (match = re_tag.exec(htmlstr)) {
            currentIndex = match.index;
            try {
                if (currentIndex > nextIndex) {
                    text(currentParent, htmlstr.slice(nextIndex, currentIndex));
                }
                if (match[3]) {
                    if (dtd.$cdata[currentParent.tagName]) {
                        text(currentParent, match[0]);
                    } else {
                        currentParent = element(currentParent, match[3].toLowerCase(), match[4]);
                    }
                } else {
                    if (match[1]) {
                        if (currentParent.type != "root") {
                            if (dtd.$cdata[currentParent.tagName] && !dtd.$cdata[match[1]]) {
                                text(currentParent, match[0]);
                            } else {
                                var tmpParent = currentParent;
                                while (currentParent.type == "element" && currentParent.tagName != match[1].toLowerCase()) {
                                    currentParent = currentParent.parentNode;
                                    if (currentParent.type == "root") {
                                        currentParent = tmpParent;
                                        throw "break";
                                    }
                                }
                                currentParent = currentParent.parentNode;
                            }
                        }
                    } else {
                        if (match[2]) {
                            comment(currentParent, match[2]);
                        }
                    }
                }
            }
            catch (e) {
            }
            nextIndex = re_tag.lastIndex;
        }
        if (nextIndex < htmlstr.length) {
            text(currentParent, htmlstr.slice(nextIndex));
        }
        return root;
    };
    var filterNode = UE.filterNode = function () {
        function filterNode(node, rules) {
            switch (node.type) {
              case "text":
                break;
              case "element":
                var val;
                if (val = rules[node.tagName]) {
                    if (val === "-") {
                        node.parentNode.removeChild(node);
                    } else {
                        if (utils.isFunction(val)) {
                            var parentNode = node.parentNode, index = node.getIndex();
                            val(node);
                            if (node.parentNode) {
                                if (node.children) {
                                    for (var i = 0, ci; ci = node.children[i]; ) {
                                        filterNode(ci, rules);
                                        if (ci.parentNode) {
                                            i++;
                                        }
                                    }
                                }
                            } else {
                                for (var i = index, ci; ci = parentNode.children[i]; ) {
                                    filterNode(ci, rules);
                                    if (ci.parentNode) {
                                        i++;
                                    }
                                }
                            }
                        } else {
                            var attrs = val["$"];
                            if (attrs && node.attrs) {
                                var tmpAttrs = {}, tmpVal;
                                for (var a in attrs) {
                                    tmpVal = node.getAttr(a);
                                    if (a == "style" && utils.isArray(attrs[a])) {
                                        var tmpCssStyle = [];
                                        utils.each(attrs[a], function (v) {
                                            var tmp;
                                            if (tmp = node.getStyle(v)) {
                                                tmpCssStyle.push(v + ":" + tmp);
                                            }
                                        });
                                        tmpVal = tmpCssStyle.join(";");
                                    }
                                    if (tmpVal) {
                                        tmpAttrs[a] = tmpVal;
                                    }
                                }
                                node.attrs = tmpAttrs;
                            }
                            if (node.children) {
                                for (var i = 0, ci; ci = node.children[i]; ) {
                                    filterNode(ci, rules);
                                    if (ci.parentNode) {
                                        i++;
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (dtd.$cdata[node.tagName]) {
                        node.parentNode.removeChild(node);
                    } else {
                        var parentNode = node.parentNode, index = node.getIndex();
                        node.parentNode.removeChild(node, true);
                        for (var i = index, ci; ci = parentNode.children[i]; ) {
                            filterNode(ci, rules);
                            if (ci.parentNode) {
                                i++;
                            }
                        }
                    }
                }
                break;
              case "comment":
                node.parentNode.removeChild(node);
            }
        }
        return function (root, rules) {
            if (utils.isEmptyObject(rules)) {
                return root;
            }
            var val;
            if (val = rules["-"]) {
                utils.each(val.split(" "), function (k) {
                    rules[k] = "-";
                });
            }
            for (var i = 0, ci; ci = root.children[i]; ) {
                filterNode(ci, rules);
                if (ci.parentNode) {
                    i++;
                }
            }
            return root;
        };
    }();
    UE.plugin = function () {
        var _plugins = {};
        return {register:function (pluginName, fn, oldOptionName, afterDisabled) {
            if (oldOptionName && utils.isFunction(oldOptionName)) {
                afterDisabled = oldOptionName;
                oldOptionName = null;
            }
            _plugins[pluginName] = {optionName:oldOptionName || pluginName, execFn:fn, afterDisabled:afterDisabled};
        }, load:function (editor) {
            utils.each(_plugins, function (plugin) {
                var _export = plugin.execFn.call(editor);
                if (editor.options[plugin.optionName] !== false) {
                    if (_export) {
                        utils.each(_export, function (v, k) {
                            switch (k.toLowerCase()) {
                              case "shortcutkey":
                                editor.addshortcutkey(v);
                                break;
                              case "bindevents":
                                utils.each(v, function (fn, eventName) {
                                    editor.addListener(eventName, fn);
                                });
                                break;
                              case "bindmultievents":
                                utils.each(utils.isArray(v) ? v : [v], function (event) {
                                    var types = utils.trim(event.type).split(/\s+/);
                                    utils.each(types, function (eventName) {
                                        editor.addListener(eventName, event.handler);
                                    });
                                });
                                break;
                              case "commands":
                                utils.each(v, function (execFn, execName) {
                                    editor.commands[execName] = execFn;
                                });
                                break;
                              case "outputrule":
                                editor.addOutputRule(v);
                                break;
                              case "inputrule":
                                editor.addInputRule(v);
                                break;
                              case "defaultoptions":
                                editor.setOpt(v);
                            }
                        });
                    }
                } else {
                    if (plugin.afterDisabled) {
                        plugin.afterDisabled.call(editor);
                    }
                }
            });
            utils.each(UE.plugins, function (plugin) {
                plugin.call(editor);
            });
        }, run:function (plugnName, editor) {
            var plugin = _plugins[pluginName];
            if (plugin) {
                plugin.exeFn.call(editor);
            }
        }};
    }();
    UE.plugins["defaultfilter"] = function () {
        var me = this;
        me.setOpt({"allowDivTransToP":true, "disabledTableInTable":true});
        me.addInputRule(function (root) {
            var allowDivTransToP = this.options.allowDivTransToP;
            var val;
            function tdParent(node) {
                while (node && node.type == "element") {
                    if (node.tagName == "td") {
                        return true;
                    }
                    node = node.parentNode;
                }
                return false;
            }
            root.traversal(function (node) {
                if (node.type == "element") {
                    if (!dtd.$cdata[node.tagName] && me.options.autoClearEmptyNode && dtd.$inline[node.tagName] && !dtd.$empty[node.tagName] && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                        if (!node.firstChild()) {
                            node.parentNode.removeChild(node);
                        } else {
                            if (node.tagName == "span" && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                                node.parentNode.removeChild(node, true);
                            }
                        }
                        return;
                    }
                    switch (node.tagName) {
                      case "style":
                      case "script":
                        node.setAttr({cdata_tag:node.tagName, cdata_data:(node.innerHTML() || ""), "_ue_custom_node_":"true"});
                        node.tagName = "div";
                        node.innerHTML("");
                        break;
                      case "a":
                        if (val = node.getAttr("href")) {
                            node.setAttr("_href", val);
                        }
                        break;
                      case "img":
                        if (val = node.getAttr("src")) {
                            if (/^data:/.test(val)) {
                                node.parentNode.removeChild(node);
                                break;
                            }
                        }
                        node.setAttr("_src", node.getAttr("src"));
                        break;
                      case "span":
                        if (browser.webkit && (val = node.getStyle("white-space"))) {
                            if (/nowrap|normal/.test(val)) {
                                node.setStyle("white-space", "");
                                if (me.options.autoClearEmptyNode && utils.isEmptyObject(node.attrs)) {
                                    node.parentNode.removeChild(node, true);
                                }
                            }
                        }
                        break;
                      case "p":
                        if (val = node.getAttr("align")) {
                            node.setAttr("align");
                            node.setStyle("text-align", val);
                        }
                        utils.each(node.children, function (n) {
                            if (n.type == "element" && n.tagName == "p") {
                                var next = n.nextSibling();
                                node.parentNode.insertAfter(n, node);
                                var last = n;
                                while (next) {
                                    var tmp = next.nextSibling();
                                    node.parentNode.insertAfter(next, last);
                                    last = next;
                                    next = tmp;
                                }
                                return false;
                            }
                        });
                        if (!node.firstChild()) {
                            node.innerHTML(browser.ie ? "&nbsp;" : "<br/>");
                        }
                        break;
                      case "div":
                        if (node.getAttr("cdata_tag")) {
                            break;
                        }
                        val = node.getAttr("class");
                        if (val && /^line number\d+/.test(val)) {
                            break;
                        }
                        if (!allowDivTransToP) {
                            break;
                        }
                        var tmpNode, p = UE.uNode.createElement("p");
                        while (tmpNode = node.firstChild()) {
                            if (tmpNode.type == "text" || !UE.dom.dtd.$block[tmpNode.tagName]) {
                                p.appendChild(tmpNode);
                            } else {
                                if (p.firstChild()) {
                                    node.parentNode.insertBefore(p, node);
                                    p = UE.uNode.createElement("p");
                                } else {
                                    node.parentNode.insertBefore(tmpNode, node);
                                }
                            }
                        }
                        if (p.firstChild()) {
                            node.parentNode.insertBefore(p, node);
                        }
                        node.parentNode.removeChild(node);
                        break;
                      case "dl":
                        node.tagName = "ul";
                        break;
                      case "dt":
                      case "dd":
                        node.tagName = "li";
                        break;
                      case "li":
                        var className = node.getAttr("class");
                        if (!className || !/list\-/.test(className)) {
                            node.setAttr();
                        }
                        var tmpNodes = node.getNodesByTagName("ol ul");
                        UE.utils.each(tmpNodes, function (n) {
                            node.parentNode.insertAfter(n, node);
                        });
                        break;
                      case "td":
                      case "th":
                      case "caption":
                        if (!node.children || !node.children.length) {
                            node.appendChild(browser.ie ? UE.uNode.createText(" ") : UE.uNode.createElement("br"));
                        }
                        break;
                      case "table":
                        if (me.options.disabledTableInTable && tdParent(node)) {
                            node.parentNode.insertBefore(UE.uNode.createText(node.innerText()), node);
                            node.parentNode.removeChild(node);
                        }
                    }
                }
            });
        });
        me.addOutputRule(function (root) {
            var val;
            root.traversal(function (node) {
                if (node.type == "element") {
                    if (me.options.autoClearEmptyNode && dtd.$inline[node.tagName] && !dtd.$empty[node.tagName] && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                        if (!node.firstChild()) {
                            node.parentNode.removeChild(node);
                        } else {
                            if (node.tagName == "span" && (!node.attrs || utils.isEmptyObject(node.attrs))) {
                                node.parentNode.removeChild(node, true);
                            }
                        }
                        return;
                    }
                    switch (node.tagName) {
                      case "div":
                        if (val = node.getAttr("cdata_tag")) {
                            node.tagName = val;
                            node.appendChild(UE.uNode.createText(node.getAttr("cdata_data")));
                            node.setAttr({cdata_tag:"", cdata_data:"", "_ue_custom_node_":""});
                        }
                        break;
                      case "a":
                        if (val = node.getAttr("_href")) {
                            node.setAttr({"href":utils.html(val), "_href":""});
                        }
                        break;
                      case "img":
                        if (val = node.getAttr("_src")) {
                            node.setAttr({"src":node.getAttr("_src"), "_src":""});
                        }
                    }
                }
            });
        });
    };
    UE.commands["inserthtml"] = {execCommand:function (command, html, notNeedFilter) {
        var me = this, range, div;
        if (!html) {
            return;
        }
        if (me.fireEvent("beforeinserthtml", html) === true) {
            return;
        }
        range = me.selection.getRange();
        div = range.document.createElement("div");
        div.style.display = "inline";
        if (!notNeedFilter) {
            var root = UE.htmlparser(html);
            if (me.options.filterRules) {
                UE.filterNode(root, me.options.filterRules);
            }
            me.filterInputRule(root);
            html = root.toHtml();
        }
        div.innerHTML = utils.trim(html);
        if (!range.collapsed) {
            var tmpNode = range.startContainer;
            if (domUtils.isFillChar(tmpNode)) {
                range.setStartBefore(tmpNode);
            }
            tmpNode = range.endContainer;
            if (domUtils.isFillChar(tmpNode)) {
                range.setEndAfter(tmpNode);
            }
            range.txtToElmBoundary();
            if (range.endContainer && range.endContainer.nodeType == 1) {
                tmpNode = range.endContainer.childNodes[range.endOffset];
                if (tmpNode && domUtils.isBr(tmpNode)) {
                    range.setEndAfter(tmpNode);
                }
            }
            if (range.startOffset == 0) {
                tmpNode = range.startContainer;
                if (domUtils.isBoundaryNode(tmpNode, "firstChild")) {
                    tmpNode = range.endContainer;
                    if (range.endOffset == (tmpNode.nodeType == 3 ? tmpNode.nodeValue.length : tmpNode.childNodes.length) && domUtils.isBoundaryNode(tmpNode, "lastChild")) {
                        me.body.innerHTML = "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
                        range.setStart(me.body.firstChild, 0).collapse(true);
                    }
                }
            }
            !range.collapsed && range.deleteContents();
            if (range.startContainer.nodeType == 1) {
                var child = range.startContainer.childNodes[range.startOffset], pre;
                if (child && domUtils.isBlockElm(child) && (pre = child.previousSibling) && domUtils.isBlockElm(pre)) {
                    range.setEnd(pre, pre.childNodes.length).collapse();
                    while (child.firstChild) {
                        pre.appendChild(child.firstChild);
                    }
                    domUtils.remove(child);
                }
            }
        }
        var child, parent, pre, tmp, hadBreak = 0, nextNode;
        if (range.inFillChar()) {
            child = range.startContainer;
            if (domUtils.isFillChar(child)) {
                range.setStartBefore(child).collapse(true);
                domUtils.remove(child);
            } else {
                if (domUtils.isFillChar(child, true)) {
                    child.nodeValue = child.nodeValue.replace(fillCharReg, "");
                    range.startOffset--;
                    range.collapsed && range.collapse(true);
                }
            }
        }
        var li = domUtils.findParentByTagName(range.startContainer, "li", true);
        if (li) {
            var next, last;
            while (child = div.firstChild) {
                while (child && (child.nodeType == 3 || !domUtils.isBlockElm(child) || child.tagName == "HR")) {
                    next = child.nextSibling;
                    range.insertNode(child).collapse();
                    last = child;
                    child = next;
                }
                if (child) {
                    if (/^(ol|ul)$/i.test(child.tagName)) {
                        while (child.firstChild) {
                            last = child.firstChild;
                            domUtils.insertAfter(li, child.firstChild);
                            li = li.nextSibling;
                        }
                        domUtils.remove(child);
                    } else {
                        var tmpLi;
                        next = child.nextSibling;
                        tmpLi = me.document.createElement("li");
                        domUtils.insertAfter(li, tmpLi);
                        tmpLi.appendChild(child);
                        last = child;
                        child = next;
                        li = tmpLi;
                    }
                }
            }
            li = domUtils.findParentByTagName(range.startContainer, "li", true);
            if (domUtils.isEmptyBlock(li)) {
                domUtils.remove(li);
            }
            if (last) {
                range.setStartAfter(last).collapse(true).select(true);
            }
        } else {
            while (child = div.firstChild) {
                if (hadBreak) {
                    var p = me.document.createElement("p");
                    while (child && (child.nodeType == 3 || !dtd.$block[child.tagName])) {
                        nextNode = child.nextSibling;
                        p.appendChild(child);
                        child = nextNode;
                    }
                    if (p.firstChild) {
                        child = p;
                    }
                }
                range.insertNode(child);
                nextNode = child.nextSibling;
                if (!hadBreak && child.nodeType == domUtils.NODE_ELEMENT && domUtils.isBlockElm(child)) {
                    parent = domUtils.findParent(child, function (node) {
                        return domUtils.isBlockElm(node);
                    });
                    if (parent && parent.tagName.toLowerCase() != "body" && !(dtd[parent.tagName][child.nodeName] && child.parentNode === parent)) {
                        if (!dtd[parent.tagName][child.nodeName]) {
                            pre = parent;
                        } else {
                            tmp = child.parentNode;
                            while (tmp !== parent) {
                                pre = tmp;
                                tmp = tmp.parentNode;
                            }
                        }
                        domUtils.breakParent(child, pre || tmp);
                        var pre = child.previousSibling;
                        domUtils.trimWhiteTextNode(pre);
                        if (!pre.childNodes.length) {
                            domUtils.remove(pre);
                        }
                        if (!browser.ie && (next = child.nextSibling) && domUtils.isBlockElm(next) && next.lastChild && !domUtils.isBr(next.lastChild)) {
                            next.appendChild(me.document.createElement("br"));
                        }
                        hadBreak = 1;
                    }
                }
                var next = child.nextSibling;
                if (!div.firstChild && next && domUtils.isBlockElm(next)) {
                    range.setStart(next, 0).collapse(true);
                    break;
                }
                range.setEndAfter(child).collapse();
            }
            child = range.startContainer;
            if (nextNode && domUtils.isBr(nextNode)) {
                domUtils.remove(nextNode);
            }
            if (domUtils.isBlockElm(child) && domUtils.isEmptyNode(child)) {
                if (nextNode = child.nextSibling) {
                    domUtils.remove(child);
                    if (nextNode.nodeType == 1 && dtd.$block[nextNode.tagName]) {
                        range.setStart(nextNode, 0).collapse(true).shrinkBoundary();
                    }
                } else {
                    try {
                        child.innerHTML = browser.ie ? domUtils.fillChar : "<br/>";
                    }
                    catch (e) {
                        range.setStartBefore(child);
                        domUtils.remove(child);
                    }
                }
            }
            try {
                range.select(true);
            }
            catch (e) {
            }
        }
        setTimeout(function () {
            range = me.selection.getRange();
            range.scrollToView(me.autoHeightEnabled, me.autoHeightEnabled ? domUtils.getXY(me.iframe).y : 0);
            me.fireEvent("afterinserthtml");
        }, 200);
    }};
    UE.plugins["autotypeset"] = function () {
        this.setOpt({"autotypeset":{mergeEmptyline:true, removeClass:true, removeEmptyline:false, textAlign:"left", imageBlockLine:"center", pasteFilter:false, clearFontSize:false, clearFontFamily:false, removeEmptyNode:false, removeTagNames:utils.extend({div:1}, dtd.$removeEmpty), indent:false, indentValue:"2em"}});
        var me = this, opt = me.options.autotypeset, remainClass = {"selectTdClass":1, "pagebreak":1, "anchorclass":1}, remainTag = {"li":1}, tags = {div:1, p:1, blockquote:1, center:1, h1:1, h2:1, h3:1, h4:1, h5:1, h6:1, span:1}, highlightCont;
        if (!opt) {
            return;
        }
        function isLine(node, notEmpty) {
            if (!node || node.nodeType == 3) {
                return 0;
            }
            if (domUtils.isBr(node)) {
                return 1;
            }
            if (node && node.parentNode && tags[node.tagName.toLowerCase()]) {
                if (highlightCont && highlightCont.contains(node) || node.getAttribute("pagebreak")) {
                    return 0;
                }
                return notEmpty ? !domUtils.isEmptyBlock(node) : domUtils.isEmptyBlock(node, new RegExp("[\\s" + domUtils.fillChar + "]", "g"));
            }
        }
        function removeNotAttributeSpan(node) {
            if (!node.style.cssText) {
                domUtils.removeAttributes(node, ["style"]);
                if (node.tagName.toLowerCase() == "span" && domUtils.hasNoAttributes(node)) {
                    domUtils.remove(node, true);
                }
            }
        }
        function autotype(type, html) {
            var me = this, cont;
            if (html) {
                if (!opt.pasteFilter) {
                    return;
                }
                cont = me.document.createElement("div");
                cont.innerHTML = html.html;
            } else {
                cont = me.document.body;
            }
            var nodes = domUtils.getElementsByTagName(cont, "*");
            for (var i = 0, ci; ci = nodes[i++]; ) {
                if (me.fireEvent("excludeNodeinautotype", ci) === true) {
                    continue;
                }
                if (opt.clearFontSize && ci.style.fontSize) {
                    domUtils.removeStyle(ci, "font-size");
                    removeNotAttributeSpan(ci);
                }
                if (opt.clearFontFamily && ci.style.fontFamily) {
                    domUtils.removeStyle(ci, "font-family");
                    removeNotAttributeSpan(ci);
                }
                if (isLine(ci)) {
                    if (opt.mergeEmptyline) {
                        var next = ci.nextSibling, tmpNode, isBr = domUtils.isBr(ci);
                        while (isLine(next)) {
                            tmpNode = next;
                            next = tmpNode.nextSibling;
                            if (isBr && (!next || next && !domUtils.isBr(next))) {
                                break;
                            }
                            domUtils.remove(tmpNode);
                        }
                    }
                    if (opt.removeEmptyline && domUtils.inDoc(ci, cont) && !remainTag[ci.parentNode.tagName.toLowerCase()]) {
                        if (domUtils.isBr(ci)) {
                            next = ci.nextSibling;
                            if (next && !domUtils.isBr(next)) {
                                continue;
                            }
                        }
                        domUtils.remove(ci);
                        continue;
                    }
                }
                if (isLine(ci, true) && ci.tagName != "SPAN") {
                    if (opt.indent) {
                        ci.style.textIndent = opt.indentValue;
                    }
                    if (opt.textAlign) {
                        ci.style.textAlign = opt.textAlign;
                    }
                }
                if (opt.removeClass && ci.className && !remainClass[ci.className.toLowerCase()]) {
                    if (highlightCont && highlightCont.contains(ci)) {
                        continue;
                    }
                    domUtils.removeAttributes(ci, ["class"]);
                }
                if (opt.imageBlockLine && ci.tagName.toLowerCase() == "img" && !ci.getAttribute("emotion")) {
                    if (html) {
                        var img = ci;
                        switch (opt.imageBlockLine) {
                          case "left":
                          case "right":
                          case "none":
                            var pN = img.parentNode, tmpNode, pre, next;
                            while (dtd.$inline[pN.tagName] || pN.tagName == "A") {
                                pN = pN.parentNode;
                            }
                            tmpNode = pN;
                            if (tmpNode.tagName == "P" && domUtils.getStyle(tmpNode, "text-align") == "center") {
                                if (!domUtils.isBody(tmpNode) && domUtils.getChildCount(tmpNode, function (node) {
                                    return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
                                }) == 1) {
                                    pre = tmpNode.previousSibling;
                                    next = tmpNode.nextSibling;
                                    if (pre && next && pre.nodeType == 1 && next.nodeType == 1 && pre.tagName == next.tagName && domUtils.isBlockElm(pre)) {
                                        pre.appendChild(tmpNode.firstChild);
                                        while (next.firstChild) {
                                            pre.appendChild(next.firstChild);
                                        }
                                        domUtils.remove(tmpNode);
                                        domUtils.remove(next);
                                    } else {
                                        domUtils.setStyle(tmpNode, "text-align", "");
                                    }
                                }
                            }
                            domUtils.setStyle(img, "float", opt.imageBlockLine);
                            break;
                          case "center":
                            if (me.queryCommandValue("imagefloat") != "center") {
                                pN = img.parentNode;
                                domUtils.setStyle(img, "float", "none");
                                tmpNode = img;
                                while (pN && domUtils.getChildCount(pN, function (node) {
                                    return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
                                }) == 1 && (dtd.$inline[pN.tagName] || pN.tagName == "A")) {
                                    tmpNode = pN;
                                    pN = pN.parentNode;
                                }
                                var pNode = me.document.createElement("p");
                                domUtils.setAttributes(pNode, {style:"text-align:center"});
                                tmpNode.parentNode.insertBefore(pNode, tmpNode);
                                pNode.appendChild(tmpNode);
                                domUtils.setStyle(tmpNode, "float", "");
                            }
                        }
                    } else {
                        var range = me.selection.getRange();
                        range.selectNode(ci).select();
                        me.execCommand("imagefloat", opt.imageBlockLine);
                    }
                }
                if (opt.removeEmptyNode) {
                    if (opt.removeTagNames[ci.tagName.toLowerCase()] && domUtils.hasNoAttributes(ci) && domUtils.isEmptyBlock(ci)) {
                        domUtils.remove(ci);
                    }
                }
            }
            if (html) {
                html.html = cont.innerHTML;
            }
        }
        if (opt.pasteFilter) {
            me.addListener("beforepaste", autotype);
        }
        me.commands["autotypeset"] = {execCommand:function () {
            me.removeListener("beforepaste", autotype);
            if (opt.pasteFilter) {
                me.addListener("beforepaste", autotype);
            }
            autotype.call(me);
        }};
    };
    UE.plugin.register("autosubmit", function () {
        return {shortcutkey:{"autosubmit":"ctrl+13"}, commands:{"autosubmit":{execCommand:function () {
            var me = this, form = domUtils.findParentByTagName(me.iframe, "form", false);
            if (form) {
                if (me.fireEvent("beforesubmit") === false) {
                    return;
                }
                me.sync();
                form.submit();
            }
        }}}};
    });
    UE.plugin.register("background", function () {
        var me = this, cssRuleId = "editor_background", isSetColored, reg = new RegExp("body[\\s]*\\{(.+)\\}", "i");
        function stringToObj(str) {
            var obj = {}, styles = str.split(";");
            utils.each(styles, function (v) {
                var index = v.indexOf(":"), key = utils.trim(v.substr(0, index)).toLowerCase();
                key && (obj[key] = utils.trim(v.substr(index + 1) || ""));
            });
            return obj;
        }
        function setBackground(obj) {
            if (obj) {
                var styles = [];
                for (var name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        styles.push(name + ":" + obj[name] + "; ");
                    }
                }
                utils.cssRule(cssRuleId, styles.length ? ("body{" + styles.join("") + "}") : "", me.document);
            } else {
                utils.cssRule(cssRuleId, "", me.document);
            }
        }
        var orgFn = me.hasContents;
        me.hasContents = function () {
            if (me.queryCommandValue("background")) {
                return true;
            }
            return orgFn.apply(me, arguments);
        };
        return {bindEvents:{"getAllHtml":function (type, headHtml) {
            var body = this.body, su = domUtils.getComputedStyle(body, "background-image"), url = "";
            if (su.indexOf(me.options.imagePath) > 0) {
                url = su.substring(su.indexOf(me.options.imagePath), su.length - 1).replace(/"|\(|\)/ig, "");
            } else {
                url = su != "none" ? su.replace(/url\("?|"?\)/ig, "") : "";
            }
            var html = "<style type=\"text/css\">body{";
            var bgObj = {"background-color":domUtils.getComputedStyle(body, "background-color") || "#ffffff", "background-image":url ? "url(" + url + ")" : "", "background-repeat":domUtils.getComputedStyle(body, "background-repeat") || "", "background-position":browser.ie ? (domUtils.getComputedStyle(body, "background-position-x") + " " + domUtils.getComputedStyle(body, "background-position-y")) : domUtils.getComputedStyle(body, "background-position"), "height":domUtils.getComputedStyle(body, "height")};
            for (var name in bgObj) {
                if (bgObj.hasOwnProperty(name)) {
                    html += name + ":" + bgObj[name] + "; ";
                }
            }
            html += "}</style> ";
            headHtml.push(html);
        }, "aftersetcontent":function () {
            if (isSetColored == false) {
                setBackground();
            }
        }}, inputRule:function (root) {
            isSetColored = false;
            utils.each(root.getNodesByTagName("p"), function (p) {
                var styles = p.getAttr("data-background");
                if (styles) {
                    isSetColored = true;
                    setBackground(stringToObj(styles));
                    p.parentNode.removeChild(p);
                }
            });
        }, outputRule:function (root) {
            var me = this, styles = (utils.cssRule(cssRuleId, me.document) || "").replace(/[\n\r]+/g, "").match(reg);
            if (styles) {
                root.appendChild(UE.uNode.createElement("<p style=\"display:none;\" data-background=\"" + utils.trim(styles[1].replace(/"/g, "").replace(/[\s]+/g, " ")) + "\"><br/></p>"));
            }
        }, commands:{"background":{execCommand:function (cmd, obj) {
            setBackground(obj);
        }, queryCommandValue:function () {
            var me = this, styles = (utils.cssRule(cssRuleId, me.document) || "").replace(/[\n\r]+/g, "").match(reg);
            return styles ? stringToObj(styles[1]) : null;
        }, notNeedUndo:true}}};
    });
    UE.commands["imagefloat"] = {execCommand:function (cmd, align) {
        var me = this, range = me.selection.getRange();
        if (!range.collapsed) {
            var img = range.getClosedNode();
            if (img && img.tagName == "IMG") {
                switch (align) {
                  case "left":
                  case "right":
                  case "none":
                    var pN = img.parentNode, tmpNode, pre, next;
                    while (dtd.$inline[pN.tagName] || pN.tagName == "A") {
                        pN = pN.parentNode;
                    }
                    tmpNode = pN;
                    if (tmpNode.tagName == "P" && domUtils.getStyle(tmpNode, "text-align") == "center") {
                        if (!domUtils.isBody(tmpNode) && domUtils.getChildCount(tmpNode, function (node) {
                            return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
                        }) == 1) {
                            pre = tmpNode.previousSibling;
                            next = tmpNode.nextSibling;
                            if (pre && next && pre.nodeType == 1 && next.nodeType == 1 && pre.tagName == next.tagName && domUtils.isBlockElm(pre)) {
                                pre.appendChild(tmpNode.firstChild);
                                while (next.firstChild) {
                                    pre.appendChild(next.firstChild);
                                }
                                domUtils.remove(tmpNode);
                                domUtils.remove(next);
                            } else {
                                domUtils.setStyle(tmpNode, "text-align", "");
                            }
                        }
                        range.selectNode(img).select();
                    }
                    domUtils.setStyle(img, "float", align == "none" ? "" : align);
                    if (align == "none") {
                        domUtils.removeAttributes(img, "align");
                    }
                    break;
                  case "center":
                    if (me.queryCommandValue("imagefloat") != "center") {
                        pN = img.parentNode;
                        domUtils.setStyle(img, "float", "");
                        domUtils.removeAttributes(img, "align");
                        tmpNode = img;
                        while (pN && domUtils.getChildCount(pN, function (node) {
                            return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
                        }) == 1 && (dtd.$inline[pN.tagName] || pN.tagName == "A")) {
                            tmpNode = pN;
                            pN = pN.parentNode;
                        }
                        range.setStartBefore(tmpNode).setCursor(false);
                        pN = me.document.createElement("div");
                        pN.appendChild(tmpNode);
                        domUtils.setStyle(tmpNode, "float", "");
                        me.execCommand("insertHtml", "<p id=\"_img_parent_tmp\" style=\"text-align:center\">" + pN.innerHTML + "</p>");
                        tmpNode = me.document.getElementById("_img_parent_tmp");
                        tmpNode.removeAttribute("id");
                        tmpNode = tmpNode.firstChild;
                        range.selectNode(tmpNode).select();
                        next = tmpNode.parentNode.nextSibling;
                        if (next && domUtils.isEmptyNode(next)) {
                            domUtils.remove(next);
                        }
                    }
                    break;
                }
            }
        }
    }, queryCommandValue:function () {
        var range = this.selection.getRange(), startNode, floatStyle;
        if (range.collapsed) {
            return "none";
        }
        startNode = range.getClosedNode();
        if (startNode && startNode.nodeType == 1 && startNode.tagName == "IMG") {
            floatStyle = domUtils.getComputedStyle(startNode, "float") || startNode.getAttribute("align");
            if (floatStyle == "none") {
                floatStyle = domUtils.getComputedStyle(startNode.parentNode, "text-align") == "center" ? "center" : floatStyle;
            }
            return {left:1, right:1, center:1}[floatStyle] ? floatStyle : "none";
        }
        return "none";
    }, queryCommandState:function () {
        var range = this.selection.getRange(), startNode;
        if (range.collapsed) {
            return -1;
        }
        startNode = range.getClosedNode();
        if (startNode && startNode.nodeType == 1 && startNode.tagName == "IMG") {
            return 0;
        }
        return -1;
    }};
    UE.commands["insertimage"] = {execCommand:function (cmd, opt) {
        opt = utils.isArray(opt) ? opt : [opt];
        if (!opt.length) {
            return;
        }
        var me = this, range = me.selection.getRange(), img = range.getClosedNode();
        if (img && /img/i.test(img.tagName) && (img.className != "edui-faked-video" || img.className.indexOf("edui-upload-video") != -1) && !img.getAttribute("word_img")) {
            var first = opt.shift();
            var floatStyle = first["floatStyle"];
            delete first["floatStyle"];
            domUtils.setAttributes(img, first);
            me.execCommand("imagefloat", floatStyle);
            if (opt.length > 0) {
                range.setStartAfter(img).setCursor(false, true);
                me.execCommand("insertimage", opt);
            }
        } else {
            var html = [], str = "", ci;
            ci = opt[0];
            if (opt.length == 1) {
                str = "<img src=\"" + ci.src + "\" " + (ci._src ? " _src=\"" + ci._src + "\" " : "") + (ci.width ? "width=\"" + ci.width + "\" " : "") + (ci.height ? " height=\"" + ci.height + "\" " : "") + (ci["floatStyle"] == "left" || ci["floatStyle"] == "right" ? " style=\"float:" + ci["floatStyle"] + ";\"" : "") + (ci.title && ci.title != "" ? " title=\"" + ci.title + "\"" : "") + (ci.border && ci.border != "0" ? " border=\"" + ci.border + "\"" : "") + (ci.alt && ci.alt != "" ? " alt=\"" + ci.alt + "\"" : "") + (ci.hspace && ci.hspace != "0" ? " hspace = \"" + ci.hspace + "\"" : "") + (ci.vspace && ci.vspace != "0" ? " vspace = \"" + ci.vspace + "\"" : "") + "/>";
                if (ci["floatStyle"] == "center") {
                    str = "<p style=\"text-align: center\">" + str + "</p>";
                }
                html.push(str);
            } else {
                for (var i = 0; ci = opt[i++]; ) {
                    str = "<p " + (ci["floatStyle"] == "center" ? "style=\"text-align: center\" " : "") + "><img src=\"" + ci.src + "\" " + (ci.width ? "width=\"" + ci.width + "\" " : "") + (ci._src ? " _src=\"" + ci._src + "\" " : "") + (ci.height ? " height=\"" + ci.height + "\" " : "") + " style=\"" + (ci["floatStyle"] && ci["floatStyle"] != "center" ? "float:" + ci["floatStyle"] + ";" : "") + (ci.border || "") + "\" " + (ci.title ? " title=\"" + ci.title + "\"" : "") + " /></p>";
                    html.push(str);
                }
            }
            me.execCommand("insertHtml", html.join(""));
        }
    }};
    UE.plugins["justify"] = function () {
        var me = this, block = domUtils.isBlockElm, defaultValue = {left:1, right:1, center:1, justify:1}, doJustify = function (range, style) {
            var bookmark = range.createBookmark(), filterFn = function (node) {
                return node.nodeType == 1 ? node.tagName.toLowerCase() != "br" && !domUtils.isBookmarkNode(node) : !domUtils.isWhitespace(node);
            };
            range.enlarge(true);
            var bookmark2 = range.createBookmark(), current = domUtils.getNextDomNode(bookmark2.start, false, filterFn), tmpRange = range.cloneRange(), tmpNode;
            while (current && !(domUtils.getPosition(current, bookmark2.end) & domUtils.POSITION_FOLLOWING)) {
                if (current.nodeType == 3 || !block(current)) {
                    tmpRange.setStartBefore(current);
                    while (current && current !== bookmark2.end && !block(current)) {
                        tmpNode = current;
                        current = domUtils.getNextDomNode(current, false, null, function (node) {
                            return !block(node);
                        });
                    }
                    tmpRange.setEndAfter(tmpNode);
                    var common = tmpRange.getCommonAncestor();
                    if (!domUtils.isBody(common) && block(common)) {
                        domUtils.setStyles(common, utils.isString(style) ? {"text-align":style} : style);
                        current = common;
                    } else {
                        var p = range.document.createElement("p");
                        domUtils.setStyles(p, utils.isString(style) ? {"text-align":style} : style);
                        var frag = tmpRange.extractContents();
                        p.appendChild(frag);
                        tmpRange.insertNode(p);
                        current = p;
                    }
                    current = domUtils.getNextDomNode(current, false, filterFn);
                } else {
                    current = domUtils.getNextDomNode(current, true, filterFn);
                }
            }
            return range.moveToBookmark(bookmark2).moveToBookmark(bookmark);
        };
        UE.commands["justify"] = {execCommand:function (cmdName, align) {
            var range = this.selection.getRange(), txt;
            if (range.collapsed) {
                txt = this.document.createTextNode("p");
                range.insertNode(txt);
            }
            doJustify(range, align);
            if (txt) {
                range.setStartBefore(txt).collapse(true);
                domUtils.remove(txt);
            }
            range.select();
            return true;
        }, queryCommandValue:function () {
            var startNode = this.selection.getStart(), value = domUtils.getComputedStyle(startNode, "text-align");
            return defaultValue[value] ? value : "left";
        }, queryCommandState:function () {
            var start = this.selection.getStart(), cell = start && domUtils.findParentByTagName(start, ["td", "th", "caption"], true);
            return cell ? -1 : 0;
        }};
    };
    UE.plugins["font"] = function () {
        var me = this, fonts = {"forecolor":"color", "backcolor":"background-color", "fontsize":"font-size", "fontfamily":"font-family", "underline":"text-decoration", "strikethrough":"text-decoration", "fontborder":"border"}, needCmd = {"underline":1, "strikethrough":1, "fontborder":1}, needSetChild = {"forecolor":"color", "backcolor":"background-color", "fontsize":"font-size", "fontfamily":"font-family"};
        me.setOpt({"fontfamily":[{name:"songti", val:"\u5b8b\u4f53,SimSun"}, {name:"yahei", val:"\u5fae\u8f6f\u96c5\u9ed1,Microsoft YaHei"}, {name:"kaiti", val:"\u6977\u4f53,\u6977\u4f53_GB2312, SimKai"}, {name:"heiti", val:"\u9ed1\u4f53, SimHei"}, {name:"lishu", val:"\u96b6\u4e66, SimLi"}, {name:"andaleMono", val:"andale mono"}, {name:"arial", val:"arial, helvetica,sans-serif"}, {name:"arialBlack", val:"arial black,avant garde"}, {name:"comicSansMs", val:"comic sans ms"}, {name:"impact", val:"impact,chicago"}, {name:"timesNewRoman", val:"times new roman"}], "fontsize":[10, 11, 12, 14, 16, 18, 20, 24, 36]});
        function mergeWithParent(node) {
            var parent;
            while (parent = node.parentNode) {
                if (parent.tagName == "SPAN" && domUtils.getChildCount(parent, function (child) {
                    return !domUtils.isBookmarkNode(child) && !domUtils.isBr(child);
                }) == 1) {
                    parent.style.cssText += node.style.cssText;
                    domUtils.remove(node, true);
                    node = parent;
                } else {
                    break;
                }
            }
        }
        function mergeChild(rng, cmdName, value) {
            if (needSetChild[cmdName]) {
                rng.adjustmentBoundary();
                if (!rng.collapsed && rng.startContainer.nodeType == 1) {
                    var start = rng.startContainer.childNodes[rng.startOffset];
                    if (start && domUtils.isTagNode(start, "span")) {
                        var bk = rng.createBookmark();
                        utils.each(domUtils.getElementsByTagName(start, "span"), function (span) {
                            if (!span.parentNode || domUtils.isBookmarkNode(span)) {
                                return;
                            }
                            if (cmdName == "backcolor" && domUtils.getComputedStyle(span, "background-color").toLowerCase() === value) {
                                return;
                            }
                            domUtils.removeStyle(span, needSetChild[cmdName]);
                            if (span.style.cssText.replace(/^\s+$/, "").length == 0) {
                                domUtils.remove(span, true);
                            }
                        });
                        rng.moveToBookmark(bk);
                    }
                }
            }
        }
        function mergesibling(rng, cmdName, value) {
            var collapsed = rng.collapsed, bk = rng.createBookmark(), common;
            if (collapsed) {
                common = bk.start.parentNode;
                while (dtd.$inline[common.tagName]) {
                    common = common.parentNode;
                }
            } else {
                common = domUtils.getCommonAncestor(bk.start, bk.end);
            }
            utils.each(domUtils.getElementsByTagName(common, "span"), function (span) {
                if (!span.parentNode || domUtils.isBookmarkNode(span)) {
                    return;
                }
                if (/\s*border\s*:\s*none;?\s*/i.test(span.style.cssText)) {
                    if (/^\s*border\s*:\s*none;?\s*$/.test(span.style.cssText)) {
                        domUtils.remove(span, true);
                    } else {
                        domUtils.removeStyle(span, "border");
                    }
                    return;
                }
                if (/border/i.test(span.style.cssText) && span.parentNode.tagName == "SPAN" && /border/i.test(span.parentNode.style.cssText)) {
                    span.style.cssText = span.style.cssText.replace(/border[^:]*:[^;]+;?/gi, "");
                }
                if (!(cmdName == "fontborder" && value == "none")) {
                    var next = span.nextSibling;
                    while (next && next.nodeType == 1 && next.tagName == "SPAN") {
                        if (domUtils.isBookmarkNode(next) && cmdName == "fontborder") {
                            span.appendChild(next);
                            next = span.nextSibling;
                            continue;
                        }
                        if (next.style.cssText == span.style.cssText) {
                            domUtils.moveChild(next, span);
                            domUtils.remove(next);
                        }
                        if (span.nextSibling === next) {
                            break;
                        }
                        next = span.nextSibling;
                    }
                }
                mergeWithParent(span);
                if (browser.ie && browser.version > 8) {
                    var parent = domUtils.findParent(span, function (n) {
                        return n.tagName == "SPAN" && /background-color/.test(n.style.cssText);
                    });
                    if (parent && !/background-color/.test(span.style.cssText)) {
                        span.style.backgroundColor = parent.style.backgroundColor;
                    }
                }
            });
            rng.moveToBookmark(bk);
            mergeChild(rng, cmdName, value);
        }
        me.addInputRule(function (root) {
            utils.each(root.getNodesByTagName("u s del font strike"), function (node) {
                if (node.tagName == "font") {
                    var cssStyle = [];
                    for (var p in node.attrs) {
                        switch (p) {
                          case "size":
                            cssStyle.push("font-size:" + ({"1":"10", "2":"12", "3":"16", "4":"18", "5":"24", "6":"32", "7":"48"}[node.attrs[p]] || node.attrs[p]) + "px");
                            break;
                          case "color":
                            cssStyle.push("color:" + node.attrs[p]);
                            break;
                          case "face":
                            cssStyle.push("font-family:" + node.attrs[p]);
                            break;
                          case "style":
                            cssStyle.push(node.attrs[p]);
                        }
                    }
                    node.attrs = {"style":cssStyle.join(";")};
                } else {
                    var val = node.tagName == "u" ? "underline" : "line-through";
                    node.attrs = {"style":(node.getAttr("style") || "") + "text-decoration:" + val + ";"};
                }
                node.tagName = "span";
            });
        });
        for (var p in fonts) {
            (function (cmd, style) {
                UE.commands[cmd] = {execCommand:function (cmdName, value) {
                    value = value || (this.queryCommandState(cmdName) ? "none" : cmdName == "underline" ? "underline" : cmdName == "fontborder" ? "1px solid #000" : "line-through");
                    var me = this, range = this.selection.getRange(), text;
                    if (value == "default") {
                        if (range.collapsed) {
                            text = me.document.createTextNode("font");
                            range.insertNode(text).select();
                        }
                        me.execCommand("removeFormat", "span,a", style);
                        if (text) {
                            range.setStartBefore(text).collapse(true);
                            domUtils.remove(text);
                        }
                        mergesibling(range, cmdName, value);
                        range.select();
                    } else {
                        if (!range.collapsed) {
                            if (needCmd[cmd] && me.queryCommandValue(cmd)) {
                                me.execCommand("removeFormat", "span,a", style);
                            }
                            range = me.selection.getRange();
                            range.applyInlineStyle("span", {"style":style + ":" + value});
                            mergesibling(range, cmdName, value);
                            range.select();
                        } else {
                            var span = domUtils.findParentByTagName(range.startContainer, "span", true);
                            text = me.document.createTextNode("font");
                            if (span && !span.children.length && !span[browser.ie ? "innerText" : "textContent"].replace(fillCharReg, "").length) {
                                range.insertNode(text);
                                if (needCmd[cmd]) {
                                    range.selectNode(text).select();
                                    me.execCommand("removeFormat", "span,a", style, null);
                                    span = domUtils.findParentByTagName(text, "span", true);
                                    range.setStartBefore(text);
                                }
                                span && (span.style.cssText += ";" + style + ":" + value);
                                range.collapse(true).select();
                            } else {
                                range.insertNode(text);
                                range.selectNode(text).select();
                                span = range.document.createElement("span");
                                if (needCmd[cmd]) {
                                    if (domUtils.findParentByTagName(text, "a", true)) {
                                        range.setStartBefore(text).setCursor();
                                        domUtils.remove(text);
                                        return;
                                    }
                                    me.execCommand("removeFormat", "span,a", style);
                                }
                                span.style.cssText = style + ":" + value;
                                text.parentNode.insertBefore(span, text);
                                if (!browser.ie || browser.ie && browser.version == 9) {
                                    var spanParent = span.parentNode;
                                    while (!domUtils.isBlockElm(spanParent)) {
                                        if (spanParent.tagName == "SPAN") {
                                            span.style.cssText = spanParent.style.cssText + ";" + span.style.cssText;
                                        }
                                        spanParent = spanParent.parentNode;
                                    }
                                }
                                if (opera) {
                                    setTimeout(function () {
                                        range.setStart(span, 0).collapse(true);
                                        mergesibling(range, cmdName, value);
                                        range.select();
                                    });
                                } else {
                                    range.setStart(span, 0).collapse(true);
                                    mergesibling(range, cmdName, value);
                                    range.select();
                                }
                            }
                            domUtils.remove(text);
                        }
                    }
                    return true;
                }, queryCommandValue:function (cmdName) {
                    var startNode = this.selection.getStart();
                    if (cmdName == "underline" || cmdName == "strikethrough") {
                        var tmpNode = startNode, value;
                        while (tmpNode && !domUtils.isBlockElm(tmpNode) && !domUtils.isBody(tmpNode)) {
                            if (tmpNode.nodeType == 1) {
                                value = domUtils.getComputedStyle(tmpNode, style);
                                if (value != "none") {
                                    return value;
                                }
                            }
                            tmpNode = tmpNode.parentNode;
                        }
                        return "none";
                    }
                    if (cmdName == "fontborder") {
                        var tmp = startNode, val;
                        while (tmp && dtd.$inline[tmp.tagName]) {
                            if (val = domUtils.getComputedStyle(tmp, "border")) {
                                if (/1px/.test(val) && /solid/.test(val)) {
                                    return val;
                                }
                            }
                            tmp = tmp.parentNode;
                        }
                        return "";
                    }
                    if (cmdName == "FontSize") {
                        var styleVal = domUtils.getComputedStyle(startNode, style), tmp = /^([\d\.]+)(\w+)$/.exec(styleVal);
                        if (tmp) {
                            return Math.floor(tmp[1]) + tmp[2];
                        }
                        return styleVal;
                    }
                    return domUtils.getComputedStyle(startNode, style);
                }, queryCommandState:function (cmdName) {
                    if (!needCmd[cmdName]) {
                        return 0;
                    }
                    var val = this.queryCommandValue(cmdName);
                    if (cmdName == "fontborder") {
                        return /1px/.test(val) && /solid/.test(val);
                    } else {
                        return cmdName == "underline" ? /underline/.test(val) : /line\-through/.test(val);
                    }
                }};
            })(p, fonts[p]);
        }
    };
    UE.plugins["link"] = function () {
        function optimize(range) {
            var start = range.startContainer, end = range.endContainer;
            if (start = domUtils.findParentByTagName(start, "a", true)) {
                range.setStartBefore(start);
            }
            if (end = domUtils.findParentByTagName(end, "a", true)) {
                range.setEndAfter(end);
            }
        }
        UE.commands["unlink"] = {execCommand:function () {
            var range = this.selection.getRange(), bookmark;
            if (range.collapsed && !domUtils.findParentByTagName(range.startContainer, "a", true)) {
                return;
            }
            bookmark = range.createBookmark();
            optimize(range);
            range.removeInlineStyle("a").moveToBookmark(bookmark).select();
        }, queryCommandState:function () {
            return !this.highlight && this.queryCommandValue("link") ? 0 : -1;
        }};
        function doLink(range, opt, me) {
            var rngClone = range.cloneRange(), link = me.queryCommandValue("link");
            optimize(range = range.adjustmentBoundary());
            var start = range.startContainer;
            if (start.nodeType == 1 && link) {
                start = start.childNodes[range.startOffset];
                if (start && start.nodeType == 1 && start.tagName == "A" && /^(?:https?|ftp|file)\s*:\s*\/\//.test(start[browser.ie ? "innerText" : "textContent"])) {
                    start[browser.ie ? "innerText" : "textContent"] = utils.html(opt.textValue || opt.href);
                }
            }
            if (!rngClone.collapsed || link) {
                range.removeInlineStyle("a");
                rngClone = range.cloneRange();
            }
            if (rngClone.collapsed) {
                var a = range.document.createElement("a"), text = "";
                if (opt.textValue) {
                    text = utils.html(opt.textValue);
                    delete opt.textValue;
                } else {
                    text = utils.html(opt.href);
                }
                domUtils.setAttributes(a, opt);
                start = domUtils.findParentByTagName(rngClone.startContainer, "a", true);
                if (start && domUtils.isInNodeEndBoundary(rngClone, start)) {
                    range.setStartAfter(start).collapse(true);
                }
                a[browser.ie ? "innerText" : "textContent"] = text;
                range.insertNode(a).selectNode(a);
            } else {
                range.applyInlineStyle("a", opt);
            }
        }
        UE.commands["link"] = {execCommand:function (cmdName, opt) {
            var range;
            opt._href && (opt._href = utils.unhtml(opt._href, /[<">]/g));
            opt.href && (opt.href = utils.unhtml(opt.href, /[<">]/g));
            opt.textValue && (opt.textValue = utils.unhtml(opt.textValue, /[<">]/g));
            doLink(range = this.selection.getRange(), opt, this);
            range.collapse().select(true);
        }, queryCommandValue:function () {
            var range = this.selection.getRange(), node;
            if (range.collapsed) {
                node = range.startContainer;
                node = node.nodeType == 1 ? node : node.parentNode;
                if (node && (node = domUtils.findParentByTagName(node, "a", true)) && !domUtils.isInNodeEndBoundary(range, node)) {
                    return node;
                }
            } else {
                range.shrinkBoundary();
                var start = range.startContainer.nodeType == 3 || !range.startContainer.childNodes[range.startOffset] ? range.startContainer : range.startContainer.childNodes[range.startOffset], end = range.endContainer.nodeType == 3 || range.endOffset == 0 ? range.endContainer : range.endContainer.childNodes[range.endOffset - 1], common = range.getCommonAncestor();
                node = domUtils.findParentByTagName(common, "a", true);
                if (!node && common.nodeType == 1) {
                    var as = common.getElementsByTagName("a"), ps, pe;
                    for (var i = 0, ci; ci = as[i++]; ) {
                        ps = domUtils.getPosition(ci, start), pe = domUtils.getPosition(ci, end);
                        if ((ps & domUtils.POSITION_FOLLOWING || ps & domUtils.POSITION_CONTAINS) && (pe & domUtils.POSITION_PRECEDING || pe & domUtils.POSITION_CONTAINS)) {
                            node = ci;
                            break;
                        }
                    }
                }
                return node;
            }
        }, queryCommandState:function () {
            var img = this.selection.getRange().getClosedNode(), flag = img && (img.className == "edui-faked-video" || img.className.indexOf("edui-upload-video") != -1);
            return flag ? -1 : 0;
        }};
    };
    UE.plugins["insertframe"] = function () {
        var me = this;
        function deleteIframe() {
            me._iframe && delete me._iframe;
        }
        me.addListener("selectionchange", function () {
            deleteIframe();
        });
    };
    UE.commands["scrawl"] = {queryCommandState:function () {
        return (browser.ie && browser.version <= 8) ? -1 : 0;
    }};
    UE.plugins["removeformat"] = function () {
        var me = this;
        me.setOpt({"removeFormatTags":"b,big,code,del,dfn,em,font,i,ins,kbd,q,samp,small,span,strike,strong,sub,sup,tt,u,var", "removeFormatAttributes":"class,style,lang,width,height,align,hspace,valign"});
        me.commands["removeformat"] = {execCommand:function (cmdName, tags, style, attrs, notIncludeA) {
            var tagReg = new RegExp("^(?:" + (tags || this.options.removeFormatTags).replace(/,/g, "|") + ")$", "i"), removeFormatAttributes = style ? [] : (attrs || this.options.removeFormatAttributes).split(","), range = new dom.Range(this.document), bookmark, node, parent, filter = function (node) {
                return node.nodeType == 1;
            };
            function isRedundantSpan(node) {
                if (node.nodeType == 3 || node.tagName.toLowerCase() != "span") {
                    return 0;
                }
                if (browser.ie) {
                    var attrs = node.attributes;
                    if (attrs.length) {
                        for (var i = 0, l = attrs.length; i < l; i++) {
                            if (attrs[i].specified) {
                                return 0;
                            }
                        }
                        return 1;
                    }
                }
                return !node.attributes.length;
            }
            function doRemove(range) {
                var bookmark1 = range.createBookmark();
                if (range.collapsed) {
                    range.enlarge(true);
                }
                if (!notIncludeA) {
                    var aNode = domUtils.findParentByTagName(range.startContainer, "a", true);
                    if (aNode) {
                        range.setStartBefore(aNode);
                    }
                    aNode = domUtils.findParentByTagName(range.endContainer, "a", true);
                    if (aNode) {
                        range.setEndAfter(aNode);
                    }
                }
                bookmark = range.createBookmark();
                node = bookmark.start;
                while ((parent = node.parentNode) && !domUtils.isBlockElm(parent)) {
                    domUtils.breakParent(node, parent);
                    domUtils.clearEmptySibling(node);
                }
                if (bookmark.end) {
                    node = bookmark.end;
                    while ((parent = node.parentNode) && !domUtils.isBlockElm(parent)) {
                        domUtils.breakParent(node, parent);
                        domUtils.clearEmptySibling(node);
                    }
                    var current = domUtils.getNextDomNode(bookmark.start, false, filter), next;
                    while (current) {
                        if (current == bookmark.end) {
                            break;
                        }
                        next = domUtils.getNextDomNode(current, true, filter);
                        if (!dtd.$empty[current.tagName.toLowerCase()] && !domUtils.isBookmarkNode(current)) {
                            if (tagReg.test(current.tagName)) {
                                if (style) {
                                    domUtils.removeStyle(current, style);
                                    if (isRedundantSpan(current) && style != "text-decoration") {
                                        domUtils.remove(current, true);
                                    }
                                } else {
                                    domUtils.remove(current, true);
                                }
                            } else {
                                if (!dtd.$tableContent[current.tagName] && !dtd.$list[current.tagName]) {
                                    domUtils.removeAttributes(current, removeFormatAttributes);
                                    if (isRedundantSpan(current)) {
                                        domUtils.remove(current, true);
                                    }
                                }
                            }
                        }
                        current = next;
                    }
                }
                var pN = bookmark.start.parentNode;
                if (domUtils.isBlockElm(pN) && !dtd.$tableContent[pN.tagName] && !dtd.$list[pN.tagName]) {
                    domUtils.removeAttributes(pN, removeFormatAttributes);
                }
                pN = bookmark.end.parentNode;
                if (bookmark.end && domUtils.isBlockElm(pN) && !dtd.$tableContent[pN.tagName] && !dtd.$list[pN.tagName]) {
                    domUtils.removeAttributes(pN, removeFormatAttributes);
                }
                range.moveToBookmark(bookmark).moveToBookmark(bookmark1);
                var node = range.startContainer, tmp, collapsed = range.collapsed;
                while (node.nodeType == 1 && domUtils.isEmptyNode(node) && dtd.$removeEmpty[node.tagName]) {
                    tmp = node.parentNode;
                    range.setStartBefore(node);
                    if (range.startContainer === range.endContainer) {
                        range.endOffset--;
                    }
                    domUtils.remove(node);
                    node = tmp;
                }
                if (!collapsed) {
                    node = range.endContainer;
                    while (node.nodeType == 1 && domUtils.isEmptyNode(node) && dtd.$removeEmpty[node.tagName]) {
                        tmp = node.parentNode;
                        range.setEndBefore(node);
                        domUtils.remove(node);
                        node = tmp;
                    }
                }
            }
            range = this.selection.getRange();
            doRemove(range);
            range.select();
        }};
    };
    UE.plugins["blockquote"] = function () {
        var me = this;
        function getObj(editor) {
            return domUtils.filterNodeList(editor.selection.getStartElementPath(), "blockquote");
        }
        me.commands["blockquote"] = {execCommand:function (cmdName, attrs) {
            var range = this.selection.getRange(), obj = getObj(this), blockquote = dtd.blockquote, bookmark = range.createBookmark();
            if (obj) {
                var start = range.startContainer, startBlock = domUtils.isBlockElm(start) ? start : domUtils.findParent(start, function (node) {
                    return domUtils.isBlockElm(node);
                }), end = range.endContainer, endBlock = domUtils.isBlockElm(end) ? end : domUtils.findParent(end, function (node) {
                    return domUtils.isBlockElm(node);
                });
                startBlock = domUtils.findParentByTagName(startBlock, "li", true) || startBlock;
                endBlock = domUtils.findParentByTagName(endBlock, "li", true) || endBlock;
                if (startBlock.tagName == "LI" || startBlock.tagName == "TD" || startBlock === obj || domUtils.isBody(startBlock)) {
                    domUtils.remove(obj, true);
                } else {
                    domUtils.breakParent(startBlock, obj);
                }
                if (startBlock !== endBlock) {
                    obj = domUtils.findParentByTagName(endBlock, "blockquote");
                    if (obj) {
                        if (endBlock.tagName == "LI" || endBlock.tagName == "TD" || domUtils.isBody(endBlock)) {
                            obj.parentNode && domUtils.remove(obj, true);
                        } else {
                            domUtils.breakParent(endBlock, obj);
                        }
                    }
                }
                var blockquotes = domUtils.getElementsByTagName(this.document, "blockquote");
                for (var i = 0, bi; bi = blockquotes[i++]; ) {
                    if (!bi.childNodes.length) {
                        domUtils.remove(bi);
                    } else {
                        if (domUtils.getPosition(bi, startBlock) & domUtils.POSITION_FOLLOWING && domUtils.getPosition(bi, endBlock) & domUtils.POSITION_PRECEDING) {
                            domUtils.remove(bi, true);
                        }
                    }
                }
            } else {
                var tmpRange = range.cloneRange(), node = tmpRange.startContainer.nodeType == 1 ? tmpRange.startContainer : tmpRange.startContainer.parentNode, preNode = node, doEnd = 1;
                while (1) {
                    if (domUtils.isBody(node)) {
                        if (preNode !== node) {
                            if (range.collapsed) {
                                tmpRange.selectNode(preNode);
                                doEnd = 0;
                            } else {
                                tmpRange.setStartBefore(preNode);
                            }
                        } else {
                            tmpRange.setStart(node, 0);
                        }
                        break;
                    }
                    if (!blockquote[node.tagName]) {
                        if (range.collapsed) {
                            tmpRange.selectNode(preNode);
                        } else {
                            tmpRange.setStartBefore(preNode);
                        }
                        break;
                    }
                    preNode = node;
                    node = node.parentNode;
                }
                if (doEnd) {
                    preNode = node = node = tmpRange.endContainer.nodeType == 1 ? tmpRange.endContainer : tmpRange.endContainer.parentNode;
                    while (1) {
                        if (domUtils.isBody(node)) {
                            if (preNode !== node) {
                                tmpRange.setEndAfter(preNode);
                            } else {
                                tmpRange.setEnd(node, node.childNodes.length);
                            }
                            break;
                        }
                        if (!blockquote[node.tagName]) {
                            tmpRange.setEndAfter(preNode);
                            break;
                        }
                        preNode = node;
                        node = node.parentNode;
                    }
                }
                node = range.document.createElement("blockquote");
                domUtils.setAttributes(node, attrs);
                node.appendChild(tmpRange.extractContents());
                tmpRange.insertNode(node);
                var childs = domUtils.getElementsByTagName(node, "blockquote");
                for (var i = 0, ci; ci = childs[i++]; ) {
                    if (ci.parentNode) {
                        domUtils.remove(ci, true);
                    }
                }
            }
            range.moveToBookmark(bookmark).select();
        }, queryCommandState:function () {
            return getObj(this) ? 1 : 0;
        }};
    };
    UE.commands["touppercase"] = UE.commands["tolowercase"] = {execCommand:function (cmd) {
        var me = this;
        var rng = me.selection.getRange();
        if (rng.collapsed) {
            return rng;
        }
        var bk = rng.createBookmark(), bkEnd = bk.end, filterFn = function (node) {
            return !domUtils.isBr(node) && !domUtils.isWhitespace(node);
        }, curNode = domUtils.getNextDomNode(bk.start, false, filterFn);
        while (curNode && (domUtils.getPosition(curNode, bkEnd) & domUtils.POSITION_PRECEDING)) {
            if (curNode.nodeType == 3) {
                curNode.nodeValue = curNode.nodeValue[cmd == "touppercase" ? "toUpperCase" : "toLowerCase"]();
            }
            curNode = domUtils.getNextDomNode(curNode, true, filterFn);
            if (curNode === bkEnd) {
                break;
            }
        }
        rng.moveToBookmark(bk).select();
    }};
    UE.commands["indent"] = {execCommand:function () {
        var me = this, value = me.queryCommandState("indent") ? "0em" : (me.options.indentValue || "2em");
        me.execCommand("Paragraph", "p", {style:"text-indent:" + value});
    }, queryCommandState:function () {
        var pN = domUtils.filterNodeList(this.selection.getStartElementPath(), "p h1 h2 h3 h4 h5 h6");
        return pN && pN.style.textIndent && parseInt(pN.style.textIndent) ? 1 : 0;
    }};
    UE.commands["print"] = {execCommand:function () {
        this.window.print();
    }, notNeedUndo:1};
    UE.plugins["selectall"] = function () {
        var me = this;
        me.commands["selectall"] = {execCommand:function () {
            var me = this, body = me.body, range = me.selection.getRange();
            range.selectNodeContents(body);
            if (domUtils.isEmptyBlock(body)) {
                if (browser.opera && body.firstChild && body.firstChild.nodeType == 1) {
                    range.setStartAtFirst(body.firstChild);
                }
                range.collapse(true);
            }
            range.select(true);
        }, notNeedUndo:1};
        me.addshortcutkey({"selectAll":"ctrl+65"});
    };
    UE.plugins["paragraph"] = function () {
        var me = this, block = domUtils.isBlockElm, notExchange = ["TD", "LI", "PRE"], doParagraph = function (range, style, attrs, sourceCmdName) {
            var bookmark = range.createBookmark(), filterFn = function (node) {
                return node.nodeType == 1 ? node.tagName.toLowerCase() != "br" && !domUtils.isBookmarkNode(node) : !domUtils.isWhitespace(node);
            }, para;
            range.enlarge(true);
            var bookmark2 = range.createBookmark(), current = domUtils.getNextDomNode(bookmark2.start, false, filterFn), tmpRange = range.cloneRange(), tmpNode;
            while (current && !(domUtils.getPosition(current, bookmark2.end) & domUtils.POSITION_FOLLOWING)) {
                if (current.nodeType == 3 || !block(current)) {
                    tmpRange.setStartBefore(current);
                    while (current && current !== bookmark2.end && !block(current)) {
                        tmpNode = current;
                        current = domUtils.getNextDomNode(current, false, null, function (node) {
                            return !block(node);
                        });
                    }
                    tmpRange.setEndAfter(tmpNode);
                    para = range.document.createElement(style);
                    if (attrs) {
                        domUtils.setAttributes(para, attrs);
                        if (sourceCmdName && sourceCmdName == "customstyle" && attrs.style) {
                            para.style.cssText = attrs.style;
                        }
                    }
                    para.appendChild(tmpRange.extractContents());
                    if (domUtils.isEmptyNode(para)) {
                        domUtils.fillChar(range.document, para);
                    }
                    tmpRange.insertNode(para);
                    var parent = para.parentNode;
                    if (block(parent) && !domUtils.isBody(para.parentNode) && utils.indexOf(notExchange, parent.tagName) == -1) {
                        if (!(sourceCmdName && sourceCmdName == "customstyle")) {
                            parent.getAttribute("dir") && para.setAttribute("dir", parent.getAttribute("dir"));
                            parent.style.cssText && (para.style.cssText = parent.style.cssText + ";" + para.style.cssText);
                            parent.style.textAlign && !para.style.textAlign && (para.style.textAlign = parent.style.textAlign);
                            parent.style.textIndent && !para.style.textIndent && (para.style.textIndent = parent.style.textIndent);
                            parent.style.padding && !para.style.padding && (para.style.padding = parent.style.padding);
                        }
                        if (attrs && /h\d/i.test(parent.tagName) && !/h\d/i.test(para.tagName)) {
                            domUtils.setAttributes(parent, attrs);
                            if (sourceCmdName && sourceCmdName == "customstyle" && attrs.style) {
                                parent.style.cssText = attrs.style;
                            }
                            domUtils.remove(para, true);
                            para = parent;
                        } else {
                            domUtils.remove(para.parentNode, true);
                        }
                    }
                    if (utils.indexOf(notExchange, parent.tagName) != -1) {
                        current = parent;
                    } else {
                        current = para;
                    }
                    current = domUtils.getNextDomNode(current, false, filterFn);
                } else {
                    current = domUtils.getNextDomNode(current, true, filterFn);
                }
            }
            return range.moveToBookmark(bookmark2).moveToBookmark(bookmark);
        };
        me.setOpt("paragraph", {"p":"", "h1":"", "h2":"", "h3":"", "h4":"", "h5":"", "h6":""});
        me.commands["paragraph"] = {execCommand:function (cmdName, style, attrs, sourceCmdName) {
            var range = this.selection.getRange();
            if (range.collapsed) {
                var txt = this.document.createTextNode("p");
                range.insertNode(txt);
                if (browser.ie) {
                    var node = txt.previousSibling;
                    if (node && domUtils.isWhitespace(node)) {
                        domUtils.remove(node);
                    }
                    node = txt.nextSibling;
                    if (node && domUtils.isWhitespace(node)) {
                        domUtils.remove(node);
                    }
                }
            }
            range = doParagraph(range, style, attrs, sourceCmdName);
            if (txt) {
                range.setStartBefore(txt).collapse(true);
                pN = txt.parentNode;
                domUtils.remove(txt);
                if (domUtils.isBlockElm(pN) && domUtils.isEmptyNode(pN)) {
                    domUtils.fillNode(this.document, pN);
                }
            }
            if (browser.gecko && range.collapsed && range.startContainer.nodeType == 1) {
                var child = range.startContainer.childNodes[range.startOffset];
                if (child && child.nodeType == 1 && child.tagName.toLowerCase() == style) {
                    range.setStart(child, 0).collapse(true);
                }
            }
            range.select();
            return true;
        }, queryCommandValue:function () {
            var node = domUtils.filterNodeList(this.selection.getStartElementPath(), "p h1 h2 h3 h4 h5 h6");
            return node ? node.tagName.toLowerCase() : "";
        }};
    };
    (function () {
        var block = domUtils.isBlockElm, getObj = function (editor) {
            return domUtils.filterNodeList(editor.selection.getStartElementPath(), function (n) {
                return n.getAttribute("dir");
            });
        }, doDirectionality = function (range, editor, forward) {
            var bookmark, filterFn = function (node) {
                return node.nodeType == 1 ? !domUtils.isBookmarkNode(node) : !domUtils.isWhitespace(node);
            }, obj = getObj(editor);
            if (obj && range.collapsed) {
                obj.setAttribute("dir", forward);
                return range;
            }
            bookmark = range.createBookmark();
            range.enlarge(true);
            var bookmark2 = range.createBookmark(), current = domUtils.getNextDomNode(bookmark2.start, false, filterFn), tmpRange = range.cloneRange(), tmpNode;
            while (current && !(domUtils.getPosition(current, bookmark2.end) & domUtils.POSITION_FOLLOWING)) {
                if (current.nodeType == 3 || !block(current)) {
                    tmpRange.setStartBefore(current);
                    while (current && current !== bookmark2.end && !block(current)) {
                        tmpNode = current;
                        current = domUtils.getNextDomNode(current, false, null, function (node) {
                            return !block(node);
                        });
                    }
                    tmpRange.setEndAfter(tmpNode);
                    var common = tmpRange.getCommonAncestor();
                    if (!domUtils.isBody(common) && block(common)) {
                        common.setAttribute("dir", forward);
                        current = common;
                    } else {
                        var p = range.document.createElement("p");
                        p.setAttribute("dir", forward);
                        var frag = tmpRange.extractContents();
                        p.appendChild(frag);
                        tmpRange.insertNode(p);
                        current = p;
                    }
                    current = domUtils.getNextDomNode(current, false, filterFn);
                } else {
                    current = domUtils.getNextDomNode(current, true, filterFn);
                }
            }
            return range.moveToBookmark(bookmark2).moveToBookmark(bookmark);
        };
        UE.commands["directionality"] = {execCommand:function (cmdName, forward) {
            var range = this.selection.getRange();
            if (range.collapsed) {
                var txt = this.document.createTextNode("d");
                range.insertNode(txt);
            }
            doDirectionality(range, this, forward);
            if (txt) {
                range.setStartBefore(txt).collapse(true);
                domUtils.remove(txt);
            }
            range.select();
            return true;
        }, queryCommandValue:function () {
            var node = getObj(this);
            return node ? node.getAttribute("dir") : "ltr";
        }};
    })();
    UE.plugins["horizontal"] = function () {
        var me = this;
        me.commands["horizontal"] = {execCommand:function (cmdName) {
            var me = this;
            if (me.queryCommandState(cmdName) !== -1) {
                me.execCommand("insertHtml", "<hr>");
                var range = me.selection.getRange(), start = range.startContainer;
                if (start.nodeType == 1 && !start.childNodes[range.startOffset]) {
                    var tmp;
                    if (tmp = start.childNodes[range.startOffset - 1]) {
                        if (tmp.nodeType == 1 && tmp.tagName == "HR") {
                            if (me.options.enterTag == "p") {
                                tmp = me.document.createElement("p");
                                range.insertNode(tmp);
                                range.setStart(tmp, 0).setCursor();
                            } else {
                                tmp = me.document.createElement("br");
                                range.insertNode(tmp);
                                range.setStartBefore(tmp).setCursor();
                            }
                        }
                    }
                }
                return true;
            }
        }, queryCommandState:function () {
            return domUtils.filterNodeList(this.selection.getStartElementPath(), "table") ? -1 : 0;
        }};
        me.addListener("delkeydown", function (name, evt) {
            var rng = this.selection.getRange();
            rng.txtToElmBoundary(true);
            if (domUtils.isStartInblock(rng)) {
                var tmpNode = rng.startContainer;
                var pre = tmpNode.previousSibling;
                if (pre && domUtils.isTagNode(pre, "hr")) {
                    domUtils.remove(pre);
                    rng.select();
                    domUtils.preventDefault(evt);
                    return true;
                }
            }
        });
    };
    UE.commands["time"] = UE.commands["date"] = {execCommand:function (cmd, format) {
        var date = new Date;
        function formatTime(date, format) {
            var hh = ("0" + date.getHours()).slice(-2), ii = ("0" + date.getMinutes()).slice(-2), ss = ("0" + date.getSeconds()).slice(-2);
            format = format || "hh:ii:ss";
            return format.replace(/hh/ig, hh).replace(/ii/ig, ii).replace(/ss/ig, ss);
        }
        function formatDate(date, format) {
            var yyyy = ("000" + date.getFullYear()).slice(-4), yy = yyyy.slice(-2), mm = ("0" + (date.getMonth() + 1)).slice(-2), dd = ("0" + date.getDate()).slice(-2);
            format = format || "yyyy-mm-dd";
            return format.replace(/yyyy/ig, yyyy).replace(/yy/ig, yy).replace(/mm/ig, mm).replace(/dd/ig, dd);
        }
        this.execCommand("insertHtml", cmd == "time" ? formatTime(date, format) : formatDate(date, format));
    }};
    UE.plugins["rowspacing"] = function () {
        var me = this;
        me.setOpt({"rowspacingtop":["5", "10", "15", "20", "25"], "rowspacingbottom":["5", "10", "15", "20", "25"]});
        me.commands["rowspacing"] = {execCommand:function (cmdName, value, dir) {
            this.execCommand("paragraph", "p", {style:"margin-" + dir + ":" + value + "px"});
            return true;
        }, queryCommandValue:function (cmdName, dir) {
            var pN = domUtils.filterNodeList(this.selection.getStartElementPath(), function (node) {
                return domUtils.isBlockElm(node);
            }), value;
            if (pN) {
                value = domUtils.getComputedStyle(pN, "margin-" + dir).replace(/[^\d]/g, "");
                return !value ? 0 : value;
            }
            return 0;
        }};
    };
    UE.plugins["lineheight"] = function () {
        var me = this;
        me.setOpt({"lineheight":["1", "1.5", "1.75", "2", "3", "4", "5"]});
        me.commands["lineheight"] = {execCommand:function (cmdName, value) {
            this.execCommand("paragraph", "p", {style:"line-height:" + (value == "1" ? "normal" : value + "em")});
            return true;
        }, queryCommandValue:function () {
            var pN = domUtils.filterNodeList(this.selection.getStartElementPath(), function (node) {
                return domUtils.isBlockElm(node);
            });
            if (pN) {
                var value = domUtils.getComputedStyle(pN, "line-height");
                return value == "normal" ? 1 : value.replace(/[^\d.]*/ig, "");
            }
        }};
    };
    UE.plugins["insertcode"] = function () {
        var me = this;
        me.ready(function () {
            utils.cssRule("pre", "pre{margin:.5em 0;padding:.4em .6em;border-radius:8px;background:#f8f8f8;}", me.document);
        });
        me.setOpt("insertcode", {"as3":"ActionScript3", "bash":"Bash/Shell", "cpp":"C/C++", "css":"Css", "cf":"CodeFunction", "c#":"C#", "delphi":"Delphi", "diff":"Diff", "erlang":"Erlang", "groovy":"Groovy", "html":"Html", "java":"Java", "jfx":"JavaFx", "js":"Javascript", "pl":"Perl", "php":"Php", "plain":"Plain Text", "ps":"PowerShell", "python":"Python", "ruby":"Ruby", "scala":"Scala", "sql":"Sql", "vb":"Vb", "xml":"Xml"});
        me.commands["insertcode"] = {execCommand:function (cmd, lang) {
            var me = this, rng = me.selection.getRange(), pre = domUtils.findParentByTagName(rng.startContainer, "pre", true);
            if (pre) {
                pre.className = "brush:" + lang + ";toolbar:false;";
            } else {
                var code = "";
                if (rng.collapsed) {
                    code = browser.ie ? (browser.version > 8 ? "" : "&nbsp;") : "<br/>";
                } else {
                    var frag = rng.extractContents();
                    var div = me.document.createElement("div");
                    div.appendChild(frag);
                    utils.each(UE.filterNode(UE.htmlparser(div.innerHTML.replace(/[\r\t]/g, "")), me.options.filterTxtRules).children, function (node) {
                        if (browser.ie && browser.version > 8) {
                            if (node.type == "element") {
                                if (node.tagName == "br") {
                                    code += "\n";
                                } else {
                                    if (!dtd.$empty[node.tagName]) {
                                        utils.each(node.children, function (cn) {
                                            if (cn.type == "element") {
                                                if (cn.tagName == "br") {
                                                    code += "\n";
                                                } else {
                                                    if (!dtd.$empty[node.tagName]) {
                                                        code += cn.innerText();
                                                    }
                                                }
                                            } else {
                                                code += cn.data;
                                            }
                                        });
                                        if (!/\n$/.test(code)) {
                                            code += "\n";
                                        }
                                    }
                                }
                            } else {
                                code += node.data + "\n";
                            }
                            if (!node.nextSibling() && /\n$/.test(code)) {
                                code = code.replace(/\n$/, "");
                            }
                        } else {
                            if (browser.ie) {
                                if (node.type == "element") {
                                    if (node.tagName == "br") {
                                        code += "<br>";
                                    } else {
                                        if (!dtd.$empty[node.tagName]) {
                                            utils.each(node.children, function (cn) {
                                                if (cn.type == "element") {
                                                    if (cn.tagName == "br") {
                                                        code += "<br>";
                                                    } else {
                                                        if (!dtd.$empty[node.tagName]) {
                                                            code += cn.innerText();
                                                        }
                                                    }
                                                } else {
                                                    code += cn.data;
                                                }
                                            });
                                            if (!/br>$/.test(code)) {
                                                code += "<br>";
                                            }
                                        }
                                    }
                                } else {
                                    code += node.data + "<br>";
                                }
                                if (!node.nextSibling() && /<br>$/.test(code)) {
                                    code = code.replace(/<br>$/, "");
                                }
                            } else {
                                code += (node.type == "element" ? (dtd.$empty[node.tagName] ? "" : node.innerText()) : node.data);
                                if (!/br\/?\s*>$/.test(code)) {
                                    if (!node.nextSibling()) {
                                        return;
                                    }
                                    code += "<br>";
                                }
                            }
                        }
                    });
                }
                me.execCommand("inserthtml", "<pre id=\"coder\"class=\"brush:" + lang + ";toolbar:false\">" + code + "</pre>", true);
                pre = me.document.getElementById("coder");
                domUtils.removeAttributes(pre, "id");
                var tmpNode = pre.previousSibling;
                if (tmpNode && (tmpNode.nodeType == 3 && tmpNode.nodeValue.length == 1 && browser.ie && browser.version == 6 || domUtils.isEmptyBlock(tmpNode))) {
                    domUtils.remove(tmpNode);
                }
                var rng = me.selection.getRange();
                if (domUtils.isEmptyBlock(pre)) {
                    rng.setStart(pre, 0).setCursor(false, true);
                } else {
                    rng.selectNodeContents(pre).select();
                }
            }
        }, queryCommandValue:function () {
            var path = this.selection.getStartElementPath();
            var lang = "";
            utils.each(path, function (node) {
                if (node.nodeName == "PRE") {
                    var match = node.className.match(/brush:([^;]+)/);
                    lang = match && match[1] ? match[1] : "";
                    return false;
                }
            });
            return lang;
        }};
        me.addInputRule(function (root) {
            utils.each(root.getNodesByTagName("pre"), function (pre) {
                var brs = pre.getNodesByTagName("br");
                if (brs.length) {
                    browser.ie && browser.version > 8 && utils.each(brs, function (br) {
                        var txt = UE.uNode.createText("\n");
                        br.parentNode.insertBefore(txt, br);
                        br.parentNode.removeChild(br);
                    });
                    return;
                }
                if (browser.ie && browser.version > 8) {
                    return;
                }
                var code = pre.innerText().split(/\n/);
                pre.innerHTML("");
                utils.each(code, function (c) {
                    if (c.length) {
                        pre.appendChild(UE.uNode.createText(c));
                    }
                    pre.appendChild(UE.uNode.createElement("br"));
                });
            });
        });
        me.addOutputRule(function (root) {
            utils.each(root.getNodesByTagName("pre"), function (pre) {
                var code = "";
                utils.each(pre.children, function (n) {
                    if (n.type == "text") {
                        code += n.data.replace(/[ ]/g, "&nbsp;").replace(/\n$/, "");
                    } else {
                        if (n.tagName == "br") {
                            code += "\n";
                        } else {
                            code += (!dtd.$empty[n.tagName] ? "" : n.innerText());
                        }
                    }
                });
                pre.innerText(code.replace(/(&nbsp;|\n)+$/, ""));
            });
        });
        me.notNeedCodeQuery = {help:1, undo:1, redo:1, source:1, print:1, searchreplace:1, fullscreen:1, preview:1, insertparagraph:1, elementpath:1, insertcode:1, inserthtml:1, selectall:1};
        var orgQuery = me.queryCommandState;
        me.queryCommandState = function (cmd) {
            var me = this;
            if (!me.notNeedCodeQuery[cmd.toLowerCase()] && me.selection && me.queryCommandValue("insertcode")) {
                return -1;
            }
            return UE.Editor.prototype.queryCommandState.apply(this, arguments);
        };
        me.addListener("beforeenterkeydown", function () {
            var rng = me.selection.getRange();
            var pre = domUtils.findParentByTagName(rng.startContainer, "pre", true);
            if (pre) {
                me.fireEvent("saveScene");
                if (!rng.collapsed) {
                    rng.deleteContents();
                }
                if (!browser.ie || browser.ie9above) {
                    var tmpNode = me.document.createElement("br"), pre;
                    rng.insertNode(tmpNode).setStartAfter(tmpNode).collapse(true);
                    var next = tmpNode.nextSibling;
                    if (!next && (!browser.ie || browser.version > 10)) {
                        rng.insertNode(tmpNode.cloneNode(false));
                    } else {
                        rng.setStartAfter(tmpNode);
                    }
                    pre = tmpNode.previousSibling;
                    var tmp;
                    while (pre) {
                        tmp = pre;
                        pre = pre.previousSibling;
                        if (!pre || pre.nodeName == "BR") {
                            pre = tmp;
                            break;
                        }
                    }
                    if (pre) {
                        var str = "";
                        while (pre && pre.nodeName != "BR" && new RegExp("^[\\s" + domUtils.fillChar + "]*$").test(pre.nodeValue)) {
                            str += pre.nodeValue;
                            pre = pre.nextSibling;
                        }
                        if (pre.nodeName != "BR") {
                            var match = pre.nodeValue.match(new RegExp("^([\\s" + domUtils.fillChar + "]+)"));
                            if (match && match[1]) {
                                str += match[1];
                            }
                        }
                        if (str) {
                            str = me.document.createTextNode(str);
                            rng.insertNode(str).setStartAfter(str);
                        }
                    }
                    rng.collapse(true).select(true);
                } else {
                    if (browser.version > 8) {
                        var txt = me.document.createTextNode("\n");
                        var start = rng.startContainer;
                        if (rng.startOffset == 0) {
                            var preNode = start.previousSibling;
                            if (preNode) {
                                rng.insertNode(txt);
                                var fillchar = me.document.createTextNode(" ");
                                rng.setStartAfter(txt).insertNode(fillchar).setStart(fillchar, 0).collapse(true).select(true);
                            }
                        } else {
                            rng.insertNode(txt).setStartAfter(txt);
                            var fillchar = me.document.createTextNode(" ");
                            start = rng.startContainer.childNodes[rng.startOffset];
                            if (start && !/^\n/.test(start.nodeValue)) {
                                rng.setStartBefore(txt);
                            }
                            rng.insertNode(fillchar).setStart(fillchar, 0).collapse(true).select(true);
                        }
                    } else {
                        var tmpNode = me.document.createElement("br");
                        rng.insertNode(tmpNode);
                        rng.insertNode(me.document.createTextNode(domUtils.fillChar));
                        rng.setStartAfter(tmpNode);
                        pre = tmpNode.previousSibling;
                        var tmp;
                        while (pre) {
                            tmp = pre;
                            pre = pre.previousSibling;
                            if (!pre || pre.nodeName == "BR") {
                                pre = tmp;
                                break;
                            }
                        }
                        if (pre) {
                            var str = "";
                            while (pre && pre.nodeName != "BR" && new RegExp("^[ " + domUtils.fillChar + "]*$").test(pre.nodeValue)) {
                                str += pre.nodeValue;
                                pre = pre.nextSibling;
                            }
                            if (pre.nodeName != "BR") {
                                var match = pre.nodeValue.match(new RegExp("^([ " + domUtils.fillChar + "]+)"));
                                if (match && match[1]) {
                                    str += match[1];
                                }
                            }
                            str = me.document.createTextNode(str);
                            rng.insertNode(str).setStartAfter(str);
                        }
                        rng.collapse(true).select();
                    }
                }
                me.fireEvent("saveScene");
                return true;
            }
        });
        me.addListener("tabkeydown", function (cmd, evt) {
            var rng = me.selection.getRange();
            var pre = domUtils.findParentByTagName(rng.startContainer, "pre", true);
            if (pre) {
                me.fireEvent("saveScene");
                if (evt.shiftKey) {
                } else {
                    if (!rng.collapsed) {
                        var bk = rng.createBookmark();
                        var start = bk.start.previousSibling;
                        while (start) {
                            if (pre.firstChild === start && !domUtils.isBr(start)) {
                                pre.insertBefore(me.document.createTextNode("    "), start);
                                break;
                            }
                            if (domUtils.isBr(start)) {
                                pre.insertBefore(me.document.createTextNode("    "), start.nextSibling);
                                break;
                            }
                            start = start.previousSibling;
                        }
                        var end = bk.end;
                        start = bk.start.nextSibling;
                        if (pre.firstChild === bk.start) {
                            pre.insertBefore(me.document.createTextNode("    "), start.nextSibling);
                        }
                        while (start && start !== end) {
                            if (domUtils.isBr(start) && start.nextSibling) {
                                if (start.nextSibling === end) {
                                    break;
                                }
                                pre.insertBefore(me.document.createTextNode("    "), start.nextSibling);
                            }
                            start = start.nextSibling;
                        }
                        rng.moveToBookmark(bk).select();
                    } else {
                        var tmpNode = me.document.createTextNode("    ");
                        rng.insertNode(tmpNode).setStartAfter(tmpNode).collapse(true).select(true);
                    }
                }
                me.fireEvent("saveScene");
                return true;
            }
        });
        me.addListener("beforeinserthtml", function (evtName, html) {
            var me = this, rng = me.selection.getRange(), pre = domUtils.findParentByTagName(rng.startContainer, "pre", true);
            if (pre) {
                if (!rng.collapsed) {
                    rng.deleteContents();
                }
                var htmlstr = "";
                if (browser.ie && browser.version > 8) {
                    utils.each(UE.filterNode(UE.htmlparser(html), me.options.filterTxtRules).children, function (node) {
                        if (node.type == "element") {
                            if (node.tagName == "br") {
                                htmlstr += "\n";
                            } else {
                                if (!dtd.$empty[node.tagName]) {
                                    utils.each(node.children, function (cn) {
                                        if (cn.type == "element") {
                                            if (cn.tagName == "br") {
                                                htmlstr += "\n";
                                            } else {
                                                if (!dtd.$empty[node.tagName]) {
                                                    htmlstr += cn.innerText();
                                                }
                                            }
                                        } else {
                                            htmlstr += cn.data;
                                        }
                                    });
                                    if (!/\n$/.test(htmlstr)) {
                                        htmlstr += "\n";
                                    }
                                }
                            }
                        } else {
                            htmlstr += node.data + "\n";
                        }
                        if (!node.nextSibling() && /\n$/.test(htmlstr)) {
                            htmlstr = htmlstr.replace(/\n$/, "");
                        }
                    });
                    var tmpNode = me.document.createTextNode(utils.html(htmlstr.replace(/&nbsp;/g, " ")));
                    rng.insertNode(tmpNode).selectNode(tmpNode).select();
                } else {
                    var frag = me.document.createDocumentFragment();
                    utils.each(UE.filterNode(UE.htmlparser(html), me.options.filterTxtRules).children, function (node) {
                        if (node.type == "element") {
                            if (node.tagName == "br") {
                                frag.appendChild(me.document.createElement("br"));
                            } else {
                                if (!dtd.$empty[node.tagName]) {
                                    utils.each(node.children, function (cn) {
                                        if (cn.type == "element") {
                                            if (cn.tagName == "br") {
                                                frag.appendChild(me.document.createElement("br"));
                                            } else {
                                                if (!dtd.$empty[node.tagName]) {
                                                    frag.appendChild(me.document.createTextNode(utils.html(cn.innerText().replace(/&nbsp;/g, " "))));
                                                }
                                            }
                                        } else {
                                            frag.appendChild(me.document.createTextNode(utils.html(cn.data.replace(/&nbsp;/g, " "))));
                                        }
                                    });
                                    if (frag.lastChild.nodeName != "BR") {
                                        frag.appendChild(me.document.createElement("br"));
                                    }
                                }
                            }
                        } else {
                            frag.appendChild(me.document.createTextNode(utils.html(node.data.replace(/&nbsp;/g, " "))));
                        }
                        if (!node.nextSibling() && frag.lastChild.nodeName == "BR") {
                            frag.removeChild(frag.lastChild);
                        }
                    });
                    rng.insertNode(frag).select();
                }
                return true;
            }
        });
        me.addListener("keydown", function (cmd, evt) {
            var me = this, keyCode = evt.keyCode || evt.which;
            if (keyCode == 40) {
                var rng = me.selection.getRange(), pre, start = rng.startContainer;
                if (rng.collapsed && (pre = domUtils.findParentByTagName(rng.startContainer, "pre", true)) && !pre.nextSibling) {
                    var last = pre.lastChild;
                    while (last && last.nodeName == "BR") {
                        last = last.previousSibling;
                    }
                    if (last === start || rng.startContainer === pre && rng.startOffset == pre.childNodes.length) {
                        me.execCommand("insertparagraph");
                        domUtils.preventDefault(evt);
                    }
                }
            }
        });
        me.addListener("delkeydown", function (type, evt) {
            var rng = this.selection.getRange();
            rng.txtToElmBoundary(true);
            var start = rng.startContainer;
            if (domUtils.isTagNode(start, "pre") && rng.collapsed && domUtils.isStartInblock(rng)) {
                var p = me.document.createElement("p");
                domUtils.fillNode(me.document, p);
                start.parentNode.insertBefore(p, start);
                domUtils.remove(start);
                rng.setStart(p, 0).setCursor(false, true);
                domUtils.preventDefault(evt);
                return true;
            }
        });
    };
    UE.commands["cleardoc"] = {execCommand:function (cmdName) {
        var me = this, enterTag = me.options.enterTag, range = me.selection.getRange();
        if (enterTag == "br") {
            me.body.innerHTML = "<br/>";
            range.setStart(me.body, 0).setCursor();
        } else {
            me.body.innerHTML = "<p>" + (ie ? "" : "<br/>") + "</p>";
            range.setStart(me.body.firstChild, 0).setCursor(false, true);
        }
        setTimeout(function () {
            me.fireEvent("clearDoc");
        }, 0);
    }};
    UE.plugin.register("anchor", function () {
        return {bindEvents:{"ready":function () {
            utils.cssRule("anchor", ".anchorclass{background: url('" + this.options.themePath + this.options.theme + "/images/anchor.gif') no-repeat scroll left center transparent;border: 1px dotted #0000FF;cursor: auto;display: inline-block;height: 16px;width: 15px;}", this.document);
        }}, outputRule:function (root) {
            utils.each(root.getNodesByTagName("img"), function (a) {
                var val;
                if (val = a.getAttr("anchorname")) {
                    a.tagName = "a";
                    a.setAttr({anchorname:"", name:val, "class":""});
                }
            });
        }, inputRule:function (root) {
            utils.each(root.getNodesByTagName("a"), function (a) {
                var val;
                if ((val = a.getAttr("name")) && !a.getAttr("href")) {
                    a.tagName = "img";
                    a.setAttr({anchorname:a.getAttr("name"), "class":"anchorclass"});
                    a.setAttr("name");
                }
            });
        }, commands:{"anchor":{execCommand:function (cmd, name) {
            var range = this.selection.getRange(), img = range.getClosedNode();
            if (img && img.getAttribute("anchorname")) {
                if (name) {
                    img.setAttribute("anchorname", name);
                } else {
                    range.setStartBefore(img).setCursor();
                    domUtils.remove(img);
                }
            } else {
                if (name) {
                    var anchor = this.document.createElement("img");
                    range.collapse(true);
                    domUtils.setAttributes(anchor, {"anchorname":name, "class":"anchorclass"});
                    range.insertNode(anchor).setStartAfter(anchor).setCursor(false, true);
                }
            }
        }}}};
    });
    UE.plugins["wordcount"] = function () {
        var me = this;
        me.setOpt("wordCount", true);
        me.addListener("contentchange", function () {
            me.fireEvent("wordcount");
        });
        var timer;
        me.addListener("ready", function () {
            var me = this;
            domUtils.on(me.body, "keyup", function (evt) {
                var code = evt.keyCode || evt.which, ignores = {"16":1, "18":1, "20":1, "37":1, "38":1, "39":1, "40":1};
                if (code in ignores) {
                    return;
                }
                clearTimeout(timer);
                timer = setTimeout(function () {
                    me.fireEvent("wordcount");
                }, 200);
            });
        });
    };
    UE.plugins["pagebreak"] = function () {
        var me = this, notBreakTags = ["td"];
        me.setOpt("pageBreakTag", "_ueditor_page_break_tag_");
        function fillNode(node) {
            if (domUtils.isEmptyBlock(node)) {
                var firstChild = node.firstChild, tmpNode;
                while (firstChild && firstChild.nodeType == 1 && domUtils.isEmptyBlock(firstChild)) {
                    tmpNode = firstChild;
                    firstChild = firstChild.firstChild;
                }
                !tmpNode && (tmpNode = node);
                domUtils.fillNode(me.document, tmpNode);
            }
        }
        me.ready(function () {
            utils.cssRule("pagebreak", ".pagebreak{display:block;clear:both !important;cursor:default !important;width: 100% !important;margin:0;}", me.document);
        });
        function isHr(node) {
            return node && node.nodeType == 1 && node.tagName == "HR" && node.className == "pagebreak";
        }
        me.addInputRule(function (root) {
            root.traversal(function (node) {
                if (node.type == "text" && node.data == me.options.pageBreakTag) {
                    var hr = UE.uNode.createElement("<hr class=\"pagebreak\" noshade=\"noshade\" size=\"5\" style=\"-webkit-user-select: none;\">");
                    node.parentNode.insertBefore(hr, node);
                    node.parentNode.removeChild(node);
                }
            });
        });
        me.addOutputRule(function (node) {
            utils.each(node.getNodesByTagName("hr"), function (n) {
                if (n.getAttr("class") == "pagebreak") {
                    var txt = UE.uNode.createText(me.options.pageBreakTag);
                    n.parentNode.insertBefore(txt, n);
                    n.parentNode.removeChild(n);
                }
            });
        });
        me.commands["pagebreak"] = {execCommand:function () {
            var range = me.selection.getRange(), hr = me.document.createElement("hr");
            domUtils.setAttributes(hr, {"class":"pagebreak", noshade:"noshade", size:"5"});
            domUtils.unSelectable(hr);
            var node = domUtils.findParentByTagName(range.startContainer, notBreakTags, true), parents = [], pN;
            if (node) {
                switch (node.tagName) {
                  case "TD":
                    pN = node.parentNode;
                    if (!pN.previousSibling) {
                        var table = domUtils.findParentByTagName(pN, "table");
                        table.parentNode.insertBefore(hr, table);
                        parents = domUtils.findParents(hr, true);
                    } else {
                        pN.parentNode.insertBefore(hr, pN);
                        parents = domUtils.findParents(hr);
                    }
                    pN = parents[1];
                    if (hr !== pN) {
                        domUtils.breakParent(hr, pN);
                    }
                    me.fireEvent("afteradjusttable", me.document);
                }
            } else {
                if (!range.collapsed) {
                    range.deleteContents();
                    var start = range.startContainer;
                    while (!domUtils.isBody(start) && domUtils.isBlockElm(start) && domUtils.isEmptyNode(start)) {
                        range.setStartBefore(start).collapse(true);
                        domUtils.remove(start);
                        start = range.startContainer;
                    }
                }
                range.insertNode(hr);
                var pN = hr.parentNode, nextNode;
                while (!domUtils.isBody(pN)) {
                    domUtils.breakParent(hr, pN);
                    nextNode = hr.nextSibling;
                    if (nextNode && domUtils.isEmptyBlock(nextNode)) {
                        domUtils.remove(nextNode);
                    }
                    pN = hr.parentNode;
                }
                nextNode = hr.nextSibling;
                var pre = hr.previousSibling;
                if (isHr(pre)) {
                    domUtils.remove(pre);
                } else {
                    pre && fillNode(pre);
                }
                if (!nextNode) {
                    var p = me.document.createElement("p");
                    hr.parentNode.appendChild(p);
                    domUtils.fillNode(me.document, p);
                    range.setStart(p, 0).collapse(true);
                } else {
                    if (isHr(nextNode)) {
                        domUtils.remove(nextNode);
                    } else {
                        fillNode(nextNode);
                    }
                    range.setEndAfter(hr).collapse(false);
                }
                range.select(true);
            }
        }};
    };
    UE.plugin.register("wordimage", function () {
        var me = this, images = [];
        return {commands:{"wordimage":{execCommand:function () {
            var images = domUtils.getElementsByTagName(me.body, "img");
            var urlList = [];
            for (var i = 0, ci; ci = images[i++]; ) {
                var url = ci.getAttribute("word_img");
                url && urlList.push(url);
            }
            return urlList;
        }, queryCommandState:function () {
            images = domUtils.getElementsByTagName(me.body, "img");
            for (var i = 0, ci; ci = images[i++]; ) {
                if (ci.getAttribute("word_img")) {
                    return 1;
                }
            }
            return -1;
        }, notNeedUndo:true}}, inputRule:function (root) {
            utils.each(root.getNodesByTagName("img"), function (img) {
                var attrs = img.attrs, flag = parseInt(attrs.width) < 128 || parseInt(attrs.height) < 43, opt = me.options, src = opt.UEDITOR_HOME_URL + "themes/default/images/spacer.gif";
                if (attrs["src"] && /^(?:(file:\/+))/.test(attrs["src"])) {
                    img.setAttr({width:attrs.width, height:attrs.height, alt:attrs.alt, word_img:attrs.src, src:src, "style":"background:url(" + (flag ? opt.themePath + opt.theme + "/images/word.gif" : opt.langPath + opt.lang + "/images/localimage.png") + ") no-repeat center center;border:1px solid #ddd"});
                }
            });
        }};
    });
    UE.plugins["dragdrop"] = function () {
        var me = this;
        me.ready(function () {
            domUtils.on(this.body, "dragend", function () {
                var rng = me.selection.getRange();
                var node = rng.getClosedNode() || me.selection.getStart();
                if (node && node.tagName == "IMG") {
                    var pre = node.previousSibling, next;
                    while (next = node.nextSibling) {
                        if (next.nodeType == 1 && next.tagName == "SPAN" && !next.firstChild) {
                            domUtils.remove(next);
                        } else {
                            break;
                        }
                    }
                    if ((pre && pre.nodeType == 1 && !domUtils.isEmptyBlock(pre) || !pre) && (!next || next && !domUtils.isEmptyBlock(next))) {
                        if (pre && pre.tagName == "P" && !domUtils.isEmptyBlock(pre)) {
                            pre.appendChild(node);
                            domUtils.moveChild(next, pre);
                            domUtils.remove(next);
                        } else {
                            if (next && next.tagName == "P" && !domUtils.isEmptyBlock(next)) {
                                next.insertBefore(node, next.firstChild);
                            }
                        }
                        if (pre && pre.tagName == "P" && domUtils.isEmptyBlock(pre)) {
                            domUtils.remove(pre);
                        }
                        if (next && next.tagName == "P" && domUtils.isEmptyBlock(next)) {
                            domUtils.remove(next);
                        }
                        rng.selectNode(node).select();
                        me.fireEvent("saveScene");
                    }
                }
            });
        });
        me.addListener("keyup", function (type, evt) {
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 13) {
                var rng = me.selection.getRange(), node;
                if (node = domUtils.findParentByTagName(rng.startContainer, "p", true)) {
                    if (domUtils.getComputedStyle(node, "text-align") == "center") {
                        domUtils.removeStyle(node, "text-align");
                    }
                }
            }
        });
    };
    UE.plugins["undo"] = function () {
        var saveSceneTimer;
        var me = this, maxUndoCount = me.options.maxUndoCount || 20, maxInputCount = me.options.maxInputCount || 20, fillchar = new RegExp(domUtils.fillChar + "|</hr>", "gi");
        var noNeedFillCharTags = {ol:1, ul:1, table:1, tbody:1, tr:1, body:1};
        var orgState = me.options.autoClearEmptyNode;
        function compareAddr(indexA, indexB) {
            if (indexA.length != indexB.length) {
                return 0;
            }
            for (var i = 0, l = indexA.length; i < l; i++) {
                if (indexA[i] != indexB[i]) {
                    return 0;
                }
            }
            return 1;
        }
        function compareRangeAddress(rngAddrA, rngAddrB) {
            if (rngAddrA.collapsed != rngAddrB.collapsed) {
                return 0;
            }
            if (!compareAddr(rngAddrA.startAddress, rngAddrB.startAddress) || !compareAddr(rngAddrA.endAddress, rngAddrB.endAddress)) {
                return 0;
            }
            return 1;
        }
        function UndoManager() {
            this.list = [];
            this.index = 0;
            this.hasUndo = false;
            this.hasRedo = false;
            this.undo = function () {
                if (this.hasUndo) {
                    if (!this.list[this.index - 1] && this.list.length == 1) {
                        this.reset();
                        return;
                    }
                    while (this.list[this.index].content == this.list[this.index - 1].content) {
                        this.index--;
                        if (this.index == 0) {
                            return this.restore(0);
                        }
                    }
                    this.restore(--this.index);
                }
            };
            this.redo = function () {
                if (this.hasRedo) {
                    while (this.list[this.index].content == this.list[this.index + 1].content) {
                        this.index++;
                        if (this.index == this.list.length - 1) {
                            return this.restore(this.index);
                        }
                    }
                    this.restore(++this.index);
                }
            };
            this.restore = function () {
                var me = this.editor;
                var scene = this.list[this.index];
                var root = UE.htmlparser(scene.content.replace(fillchar, ""));
                me.options.autoClearEmptyNode = false;
                me.filterInputRule(root);
                me.options.autoClearEmptyNode = orgState;
                me.document.body.innerHTML = root.toHtml();
                me.fireEvent("afterscencerestore");
                if (browser.ie) {
                    utils.each(domUtils.getElementsByTagName(me.document, "td th caption p"), function (node) {
                        if (domUtils.isEmptyNode(node)) {
                            domUtils.fillNode(me.document, node);
                        }
                    });
                }
                try {
                    var rng = new dom.Range(me.document).moveToAddress(scene.address);
                    rng.select(noNeedFillCharTags[rng.startContainer.nodeName.toLowerCase()]);
                }
                catch (e) {
                }
                this.update();
                this.clearKey();
                me.fireEvent("reset", true);
            };
            this.getScene = function () {
                var me = this.editor;
                var rng = me.selection.getRange(), rngAddress = rng.createAddress(false, true);
                me.fireEvent("beforegetscene");
                var root = UE.htmlparser(me.body.innerHTML);
                me.options.autoClearEmptyNode = false;
                me.filterOutputRule(root);
                me.options.autoClearEmptyNode = orgState;
                var cont = root.toHtml();
                me.fireEvent("aftergetscene");
                return {address:rngAddress, content:cont};
            };
            this.save = function (notCompareRange, notSetCursor) {
                clearTimeout(saveSceneTimer);
                var currentScene = this.getScene(notSetCursor), lastScene = this.list[this.index];
                if (lastScene && lastScene.content == currentScene.content && (notCompareRange ? 1 : compareRangeAddress(lastScene.address, currentScene.address))) {
                    return;
                }
                this.list = this.list.slice(0, this.index + 1);
                this.list.push(currentScene);
                if (this.list.length > maxUndoCount) {
                    this.list.shift();
                }
                this.index = this.list.length - 1;
                this.clearKey();
                this.update();
            };
            this.update = function () {
                this.hasRedo = !!this.list[this.index + 1];
                this.hasUndo = !!this.list[this.index - 1];
            };
            this.reset = function () {
                this.list = [];
                this.index = 0;
                this.hasUndo = false;
                this.hasRedo = false;
                this.clearKey();
            };
            this.clearKey = function () {
                keycont = 0;
                lastKeyCode = null;
            };
        }
        me.undoManger = new UndoManager();
        me.undoManger.editor = me;
        function saveScene() {
            this.undoManger.save();
        }
        me.addListener("saveScene", function () {
            var args = Array.prototype.splice.call(arguments, 1);
            this.undoManger.save.apply(this.undoManger, args);
        });
        me.addListener("reset", function (type, exclude) {
            if (!exclude) {
                this.undoManger.reset();
            }
        });
        me.commands["redo"] = me.commands["undo"] = {execCommand:function (cmdName) {
            this.undoManger[cmdName]();
        }, queryCommandState:function (cmdName) {
            return this.undoManger["has" + (cmdName.toLowerCase() == "undo" ? "Undo" : "Redo")] ? 0 : -1;
        }, notNeedUndo:1};
        var keys = {16:1, 17:1, 18:1, 37:1, 38:1, 39:1, 40:1}, keycont = 0, lastKeyCode;
        var inputType = false;
        me.addListener("ready", function () {
            domUtils.on(this.body, "compositionstart", function () {
                inputType = true;
            });
            domUtils.on(this.body, "compositionend", function () {
                inputType = false;
            });
        });
        me.addshortcutkey({"Undo":"ctrl+90", "Redo":"ctrl+89"});
        var isCollapsed = true;
        me.addListener("keydown", function (type, evt) {
            var me = this;
            var keyCode = evt.keyCode || evt.which;
            if (!keys[keyCode] && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey) {
                if (inputType) {
                    return;
                }
                if (!me.selection.getRange().collapsed) {
                    me.undoManger.save(false, true);
                    isCollapsed = false;
                    return;
                }
                if (me.undoManger.list.length == 0) {
                    me.undoManger.save(true);
                }
                clearTimeout(saveSceneTimer);
                function save(cont) {
                    if (cont.selection.getRange().collapsed) {
                        cont.fireEvent("contentchange");
                    }
                    cont.undoManger.save(false, true);
                    cont.fireEvent("selectionchange");
                }
                saveSceneTimer = setTimeout(function () {
                    if (inputType) {
                        var interalTimer = setInterval(function () {
                            if (!inputType) {
                                save(me);
                                clearInterval(interalTimer);
                            }
                        }, 300);
                        return;
                    }
                    save(me);
                }, 200);
                lastKeyCode = keyCode;
                keycont++;
                if (keycont >= maxInputCount) {
                    save(me);
                }
            }
        });
        me.addListener("keyup", function (type, evt) {
            var keyCode = evt.keyCode || evt.which;
            if (!keys[keyCode] && !evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey) {
                if (inputType) {
                    return;
                }
                if (!isCollapsed) {
                    this.undoManger.save(false, true);
                    isCollapsed = true;
                }
            }
        });
        me.stopCmdUndo = function () {
            me.__hasEnterExecCommand = true;
        };
        me.startCmdUndo = function () {
            me.__hasEnterExecCommand = false;
        };
    };
    UE.plugins["paste"] = function () {
        function getClipboardData(callback) {
            var doc = this.document;
            if (doc.getElementById("baidu_pastebin")) {
                return;
            }
            var range = this.selection.getRange(), bk = range.createBookmark(), pastebin = doc.createElement("div");
            pastebin.id = "baidu_pastebin";
            browser.webkit && pastebin.appendChild(doc.createTextNode(domUtils.fillChar + domUtils.fillChar));
            doc.body.appendChild(pastebin);
            bk.start.style.display = "";
            pastebin.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;left:-1000px;white-space:nowrap;top:" + domUtils.getXY(bk.start).y + "px";
            range.selectNodeContents(pastebin).select(true);
            setTimeout(function () {
                if (browser.webkit) {
                    for (var i = 0, pastebins = doc.querySelectorAll("#baidu_pastebin"), pi; pi = pastebins[i++]; ) {
                        if (domUtils.isEmptyNode(pi)) {
                            domUtils.remove(pi);
                        } else {
                            pastebin = pi;
                            break;
                        }
                    }
                }
                try {
                    pastebin.parentNode.removeChild(pastebin);
                }
                catch (e) {
                }
                range.moveToBookmark(bk).select(true);
                callback(pastebin);
            }, 0);
        }
        var me = this;
        var txtContent, htmlContent, address;
        function filter(div) {
            var html;
            if (div.firstChild) {
                var nodes = domUtils.getElementsByTagName(div, "span");
                for (var i = 0, ni; ni = nodes[i++]; ) {
                    if (ni.id == "_baidu_cut_start" || ni.id == "_baidu_cut_end") {
                        domUtils.remove(ni);
                    }
                }
                if (browser.webkit) {
                    var brs = div.querySelectorAll("div br");
                    for (var i = 0, bi; bi = brs[i++]; ) {
                        var pN = bi.parentNode;
                        if (pN.tagName == "DIV" && pN.childNodes.length == 1) {
                            pN.innerHTML = "<p><br/></p>";
                            domUtils.remove(pN);
                        }
                    }
                    var divs = div.querySelectorAll("#baidu_pastebin");
                    for (var i = 0, di; di = divs[i++]; ) {
                        var tmpP = me.document.createElement("p");
                        di.parentNode.insertBefore(tmpP, di);
                        while (di.firstChild) {
                            tmpP.appendChild(di.firstChild);
                        }
                        domUtils.remove(di);
                    }
                    var metas = div.querySelectorAll("meta");
                    for (var i = 0, ci; ci = metas[i++]; ) {
                        domUtils.remove(ci);
                    }
                    var brs = div.querySelectorAll("br");
                    for (i = 0; ci = brs[i++]; ) {
                        if (/^apple-/i.test(ci.className)) {
                            domUtils.remove(ci);
                        }
                    }
                }
                if (browser.gecko) {
                    var dirtyNodes = div.querySelectorAll("[_moz_dirty]");
                    for (i = 0; ci = dirtyNodes[i++]; ) {
                        ci.removeAttribute("_moz_dirty");
                    }
                }
                if (!browser.ie) {
                    var spans = div.querySelectorAll("span.Apple-style-span");
                    for (var i = 0, ci; ci = spans[i++]; ) {
                        domUtils.remove(ci, true);
                    }
                }
                html = div.innerHTML;
                html = UE.filterWord(html);
                var root = UE.htmlparser(html);
                if (me.options.filterRules) {
                    UE.filterNode(root, me.options.filterRules);
                }
                me.filterInputRule(root);
                if (browser.webkit) {
                    var br = root.lastChild();
                    if (br && br.type == "element" && br.tagName == "br") {
                        root.removeChild(br);
                    }
                    utils.each(me.body.querySelectorAll("div"), function (node) {
                        if (domUtils.isEmptyBlock(node)) {
                            domUtils.remove(node, true);
                        }
                    });
                }
                html = {"html":root.toHtml()};
                me.fireEvent("beforepaste", html, root);
                if (!html.html) {
                    return;
                }
                root = UE.htmlparser(html.html, true);
                if (me.queryCommandState("pasteplain") === 1) {
                    me.execCommand("insertHtml", UE.filterNode(root, me.options.filterTxtRules).toHtml(), true);
                } else {
                    UE.filterNode(root, me.options.filterTxtRules);
                    txtContent = root.toHtml();
                    htmlContent = html.html;
                    address = me.selection.getRange().createAddress(true);
                    me.execCommand("insertHtml", htmlContent, true);
                }
                me.fireEvent("afterpaste", html);
            }
        }
        me.addListener("pasteTransfer", function (cmd, plainType) {
            if (address && txtContent && htmlContent && txtContent != htmlContent) {
                var range = me.selection.getRange();
                range.moveToAddress(address, true);
                if (!range.collapsed) {
                    while (!domUtils.isBody(range.startContainer)) {
                        var start = range.startContainer;
                        if (start.nodeType == 1) {
                            start = start.childNodes[range.startOffset];
                            if (!start) {
                                range.setStartBefore(range.startContainer);
                                continue;
                            }
                            var pre = start.previousSibling;
                            if (pre && pre.nodeType == 3 && new RegExp("^[\n\r\t " + domUtils.fillChar + "]*$").test(pre.nodeValue)) {
                                range.setStartBefore(pre);
                            }
                        }
                        if (range.startOffset == 0) {
                            range.setStartBefore(range.startContainer);
                        } else {
                            break;
                        }
                    }
                    while (!domUtils.isBody(range.endContainer)) {
                        var end = range.endContainer;
                        if (end.nodeType == 1) {
                            end = end.childNodes[range.endOffset];
                            if (!end) {
                                range.setEndAfter(range.endContainer);
                                continue;
                            }
                            var next = end.nextSibling;
                            if (next && next.nodeType == 3 && new RegExp("^[\n\r\t" + domUtils.fillChar + "]*$").test(next.nodeValue)) {
                                range.setEndAfter(next);
                            }
                        }
                        if (range.endOffset == range.endContainer[range.endContainer.nodeType == 3 ? "nodeValue" : "childNodes"].length) {
                            range.setEndAfter(range.endContainer);
                        } else {
                            break;
                        }
                    }
                }
                range.deleteContents();
                range.select(true);
                me.__hasEnterExecCommand = true;
                var html = htmlContent;
                if (plainType === 2) {
                    html = html.replace(/<(\/?)([\w\-]+)([^>]*)>/gi, function (a, b, tagName, attrs) {
                        tagName = tagName.toLowerCase();
                        if ({img:1}[tagName]) {
                            return a;
                        }
                        attrs = attrs.replace(/([\w\-]*?)\s*=\s*(("([^"]*)")|('([^']*)')|([^\s>]+))/gi, function (str, atr, val) {
                            if ({"src":1, "href":1, "name":1}[atr.toLowerCase()]) {
                                return atr + "=" + val + " ";
                            }
                            return "";
                        });
                        if ({"span":1, "div":1}[tagName]) {
                            return "";
                        } else {
                            return "<" + b + tagName + " " + utils.trim(attrs) + ">";
                        }
                    });
                } else {
                    if (plainType) {
                        html = txtContent;
                    }
                }
                me.execCommand("inserthtml", html, true);
                me.__hasEnterExecCommand = false;
                var rng = me.selection.getRange();
                while (!domUtils.isBody(rng.startContainer) && !rng.startOffset && rng.startContainer[rng.startContainer.nodeType == 3 ? "nodeValue" : "childNodes"].length) {
                    rng.setStartBefore(rng.startContainer);
                }
                var tmpAddress = rng.createAddress(true);
                address.endAddress = tmpAddress.startAddress;
            }
        });
        me.addListener("ready", function () {
            domUtils.on(me.body, "cut", function () {
                var range = me.selection.getRange();
                if (!range.collapsed && me.undoManger) {
                    me.undoManger.save();
                }
            });
            domUtils.on(me.body, browser.ie || browser.opera ? "keydown" : "paste", function (e) {
                if ((browser.ie || browser.opera) && ((!e.ctrlKey && !e.metaKey) || e.keyCode != "86")) {
                    return;
                }
                getClipboardData.call(me, function (div) {
                    filter(div);
                });
            });
        });
    };
    UE.plugins["list"] = function () {
        var me = this, notExchange = {"TD":1, "PRE":1, "BLOCKQUOTE":1};
        var customStyle = {"cn":"cn-1-", "cn1":"cn-2-", "cn2":"cn-3-", "num":"num-1-", "num1":"num-2-", "num2":"num-3-", "dash":"dash", "dot":"dot"};
        me.setOpt({"autoTransWordToList":false, "insertorderedlist":{"num":"", "num1":"", "num2":"", "cn":"", "cn1":"", "cn2":"", "decimal":"", "lower-alpha":"", "lower-roman":"", "upper-alpha":"", "upper-roman":""}, "insertunorderedlist":{"circle":"", "disc":"", "square":"", "dash":"", "dot":""}, listDefaultPaddingLeft:"30", listiconpath:"http://bs.baidu.com/listicon/", maxListLevel:-1});
        function listToArray(list) {
            var arr = [];
            for (var p in list) {
                arr.push(p);
            }
            return arr;
        }
        var listStyle = {"OL":listToArray(me.options.insertorderedlist), "UL":listToArray(me.options.insertunorderedlist)};
        var liiconpath = me.options.listiconpath;
        for (var s in customStyle) {
            if (!me.options.insertorderedlist.hasOwnProperty(s) && !me.options.insertunorderedlist.hasOwnProperty(s)) {
                delete customStyle[s];
            }
        }
        me.ready(function () {
            var customCss = [];
            for (var p in customStyle) {
                if (p == "dash" || p == "dot") {
                    customCss.push("li.list-" + customStyle[p] + "{background-image:url(" + liiconpath + customStyle[p] + ".gif)}");
                    customCss.push("ul.custom_" + p + "{list-style:none;}ul.custom_" + p + " li{background-position:0 3px;background-repeat:no-repeat}");
                } else {
                    for (var i = 0; i < 99; i++) {
                        customCss.push("li.list-" + customStyle[p] + i + "{background-image:url(" + liiconpath + "list-" + customStyle[p] + i + ".gif)}");
                    }
                    customCss.push("ol.custom_" + p + "{list-style:none;}ol.custom_" + p + " li{background-position:0 3px;background-repeat:no-repeat}");
                }
                switch (p) {
                  case "cn":
                    customCss.push("li.list-" + p + "-paddingleft-1{padding-left:25px}");
                    customCss.push("li.list-" + p + "-paddingleft-2{padding-left:40px}");
                    customCss.push("li.list-" + p + "-paddingleft-3{padding-left:55px}");
                    break;
                  case "cn1":
                    customCss.push("li.list-" + p + "-paddingleft-1{padding-left:30px}");
                    customCss.push("li.list-" + p + "-paddingleft-2{padding-left:40px}");
                    customCss.push("li.list-" + p + "-paddingleft-3{padding-left:55px}");
                    break;
                  case "cn2":
                    customCss.push("li.list-" + p + "-paddingleft-1{padding-left:40px}");
                    customCss.push("li.list-" + p + "-paddingleft-2{padding-left:55px}");
                    customCss.push("li.list-" + p + "-paddingleft-3{padding-left:68px}");
                    break;
                  case "num":
                  case "num1":
                    customCss.push("li.list-" + p + "-paddingleft-1{padding-left:25px}");
                    break;
                  case "num2":
                    customCss.push("li.list-" + p + "-paddingleft-1{padding-left:35px}");
                    customCss.push("li.list-" + p + "-paddingleft-2{padding-left:40px}");
                    break;
                  case "dash":
                    customCss.push("li.list-" + p + "-paddingleft{padding-left:35px}");
                    break;
                  case "dot":
                    customCss.push("li.list-" + p + "-paddingleft{padding-left:20px}");
                }
            }
            customCss.push(".list-paddingleft-1{padding-left:0}");
            customCss.push(".list-paddingleft-2{padding-left:" + me.options.listDefaultPaddingLeft + "px}");
            customCss.push(".list-paddingleft-3{padding-left:" + me.options.listDefaultPaddingLeft * 2 + "px}");
            utils.cssRule("list", "ol,ul{margin:0;pading:0;" + (browser.ie ? "" : "width:95%") + "}li{clear:both;}" + customCss.join("\n"), me.document);
        });
        me.ready(function () {
            domUtils.on(me.body, "cut", function () {
                setTimeout(function () {
                    var rng = me.selection.getRange(), li;
                    if (!rng.collapsed) {
                        if (li = domUtils.findParentByTagName(rng.startContainer, "li", true)) {
                            if (!li.nextSibling && domUtils.isEmptyBlock(li)) {
                                var pn = li.parentNode, node;
                                if (node = pn.previousSibling) {
                                    domUtils.remove(pn);
                                    rng.setStartAtLast(node).collapse(true);
                                    rng.select(true);
                                } else {
                                    if (node = pn.nextSibling) {
                                        domUtils.remove(pn);
                                        rng.setStartAtFirst(node).collapse(true);
                                        rng.select(true);
                                    } else {
                                        var tmpNode = me.document.createElement("p");
                                        domUtils.fillNode(me.document, tmpNode);
                                        pn.parentNode.insertBefore(tmpNode, pn);
                                        domUtils.remove(pn);
                                        rng.setStart(tmpNode, 0).collapse(true);
                                        rng.select(true);
                                    }
                                }
                            }
                        }
                    }
                });
            });
        });
        function getStyle(node) {
            var cls = node.className;
            if (domUtils.hasClass(node, /custom_/)) {
                return cls.match(/custom_(\w+)/)[1];
            }
            return domUtils.getStyle(node, "list-style-type");
        }
        me.addListener("beforepaste", function (type, html) {
            var me = this, rng = me.selection.getRange(), li;
            var root = UE.htmlparser(html.html, true);
            if (li = domUtils.findParentByTagName(rng.startContainer, "li", true)) {
                var list = li.parentNode, tagName = list.tagName == "OL" ? "ul" : "ol";
                utils.each(root.getNodesByTagName(tagName), function (n) {
                    n.tagName = list.tagName;
                    n.setAttr();
                    if (n.parentNode === root) {
                        type = getStyle(list) || (list.tagName == "OL" ? "decimal" : "disc");
                    } else {
                        var className = n.parentNode.getAttr("class");
                        if (className && /custom_/.test(className)) {
                            type = className.match(/custom_(\w+)/)[1];
                        } else {
                            type = n.parentNode.getStyle("list-style-type");
                        }
                        if (!type) {
                            type = list.tagName == "OL" ? "decimal" : "disc";
                        }
                    }
                    var index = utils.indexOf(listStyle[list.tagName], type);
                    if (n.parentNode !== root) {
                        index = index + 1 == listStyle[list.tagName].length ? 0 : index + 1;
                    }
                    var currentStyle = listStyle[list.tagName][index];
                    if (customStyle[currentStyle]) {
                        n.setAttr("class", "custom_" + currentStyle);
                    } else {
                        n.setStyle("list-style-type", currentStyle);
                    }
                });
            }
            html.html = root.toHtml();
        });
        me.addInputRule(function (root) {
            utils.each(root.getNodesByTagName("li"), function (li) {
                var tmpP = UE.uNode.createElement("p");
                for (var i = 0, ci; ci = li.children[i]; ) {
                    if (ci.type == "text" || dtd.p[ci.tagName]) {
                        tmpP.appendChild(ci);
                    } else {
                        if (tmpP.firstChild()) {
                            li.insertBefore(tmpP, ci);
                            tmpP = UE.uNode.createElement("p");
                            i = i + 2;
                        } else {
                            i++;
                        }
                    }
                }
                if (tmpP.firstChild() && !tmpP.parentNode || !li.firstChild()) {
                    li.appendChild(tmpP);
                }
                if (!tmpP.firstChild()) {
                    tmpP.innerHTML(browser.ie ? "&nbsp;" : "<br/>");
                }
                var p = li.firstChild();
                var lastChild = p.lastChild();
                if (lastChild && lastChild.type == "text" && /^\s*$/.test(lastChild.data)) {
                    p.removeChild(lastChild);
                }
            });
            if (me.options.autoTransWordToList) {
                var orderlisttype = {"num1":/^\d+\)/, "decimal":/^\d+\./, "lower-alpha":/^[a-z]+\)/, "upper-alpha":/^[A-Z]+\./, "cn":/^[\u4E00\u4E8C\u4E09\u56DB\u516d\u4e94\u4e03\u516b\u4e5d]+[\u3001]/, "cn2":/^\([\u4E00\u4E8C\u4E09\u56DB\u516d\u4e94\u4e03\u516b\u4e5d]+\)/}, unorderlisttype = {"square":"n"};
                function checkListType(content, container) {
                    var span = container.firstChild();
                    if (span && span.type == "element" && span.tagName == "span" && /Wingdings|Symbol/.test(span.getStyle("font-family"))) {
                        for (var p in unorderlisttype) {
                            if (unorderlisttype[p] == span.data) {
                                return p;
                            }
                        }
                        return "disc";
                    }
                    for (var p in orderlisttype) {
                        if (orderlisttype[p].test(content)) {
                            return p;
                        }
                    }
                }
                utils.each(root.getNodesByTagName("p"), function (node) {
                    if (node.getAttr("class") != "MsoListParagraph") {
                        return;
                    }
                    node.setStyle("margin", "");
                    node.setStyle("margin-left", "");
                    node.setAttr("class", "");
                    function appendLi(list, p, type) {
                        if (list.tagName == "ol") {
                            if (browser.ie) {
                                var first = p.firstChild();
                                if (first.type == "element" && first.tagName == "span" && orderlisttype[type].test(first.innerText())) {
                                    p.removeChild(first);
                                }
                            } else {
                                p.innerHTML(p.innerHTML().replace(orderlisttype[type], ""));
                            }
                        } else {
                            p.removeChild(p.firstChild());
                        }
                        var li = UE.uNode.createElement("li");
                        li.appendChild(p);
                        list.appendChild(li);
                    }
                    var tmp = node, type, cacheNode = node;
                    if (node.parentNode.tagName != "li" && (type = checkListType(node.innerText(), node))) {
                        var list = UE.uNode.createElement(me.options.insertorderedlist.hasOwnProperty(type) ? "ol" : "ul");
                        if (customStyle[type]) {
                            list.setAttr("class", "custom_" + type);
                        } else {
                            list.setStyle("list-style-type", type);
                        }
                        while (node && node.parentNode.tagName != "li" && checkListType(node.innerText(), node)) {
                            tmp = node.nextSibling();
                            if (!tmp) {
                                node.parentNode.insertBefore(list, node);
                            }
                            appendLi(list, node, type);
                            node = tmp;
                        }
                        if (!list.parentNode && node && node.parentNode) {
                            node.parentNode.insertBefore(list, node);
                        }
                    }
                    var span = cacheNode.firstChild();
                    if (span && span.type == "element" && span.tagName == "span" && /^\s*(&nbsp;)+\s*$/.test(span.innerText())) {
                        span.parentNode.removeChild(span);
                    }
                });
            }
        });
        me.addListener("contentchange", function () {
            adjustListStyle(me.document);
        });
        function adjustListStyle(doc, ignore) {
            utils.each(domUtils.getElementsByTagName(doc, "ol ul"), function (node) {
                if (!domUtils.inDoc(node, doc)) {
                    return;
                }
                var parent = node.parentNode;
                if (parent.tagName == node.tagName) {
                    var nodeStyleType = getStyle(node) || (node.tagName == "OL" ? "decimal" : "disc"), parentStyleType = getStyle(parent) || (parent.tagName == "OL" ? "decimal" : "disc");
                    if (nodeStyleType == parentStyleType) {
                        var styleIndex = utils.indexOf(listStyle[node.tagName], nodeStyleType);
                        styleIndex = styleIndex + 1 == listStyle[node.tagName].length ? 0 : styleIndex + 1;
                        setListStyle(node, listStyle[node.tagName][styleIndex]);
                    }
                }
                var index = 0, type = 2;
                if (domUtils.hasClass(node, /custom_/)) {
                    if (!(/[ou]l/i.test(parent.tagName) && domUtils.hasClass(parent, /custom_/))) {
                        type = 1;
                    }
                } else {
                    if (/[ou]l/i.test(parent.tagName) && domUtils.hasClass(parent, /custom_/)) {
                        type = 3;
                    }
                }
                var style = domUtils.getStyle(node, "list-style-type");
                style && (node.style.cssText = "list-style-type:" + style);
                node.className = utils.trim(node.className.replace(/list-paddingleft-\w+/, "")) + " list-paddingleft-" + type;
                utils.each(domUtils.getElementsByTagName(node, "li"), function (li) {
                    li.style.cssText && (li.style.cssText = "");
                    if (!li.firstChild) {
                        domUtils.remove(li);
                        return;
                    }
                    if (li.parentNode !== node) {
                        return;
                    }
                    index++;
                    if (domUtils.hasClass(node, /custom_/)) {
                        var paddingLeft = 1, currentStyle = getStyle(node);
                        if (node.tagName == "OL") {
                            if (currentStyle) {
                                switch (currentStyle) {
                                  case "cn":
                                  case "cn1":
                                  case "cn2":
                                    if (index > 10 && (index % 10 == 0 || index > 10 && index < 20)) {
                                        paddingLeft = 2;
                                    } else {
                                        if (index > 20) {
                                            paddingLeft = 3;
                                        }
                                    }
                                    break;
                                  case "num2":
                                    if (index > 9) {
                                        paddingLeft = 2;
                                    }
                                }
                            }
                            li.className = "list-" + customStyle[currentStyle] + index + " " + "list-" + currentStyle + "-paddingleft-" + paddingLeft;
                        } else {
                            li.className = "list-" + customStyle[currentStyle] + " " + "list-" + currentStyle + "-paddingleft";
                        }
                    } else {
                        li.className = li.className.replace(/list-[\w\-]+/gi, "");
                    }
                    var className = li.getAttribute("class");
                    if (className !== null && !className.replace(/\s/g, "")) {
                        domUtils.removeAttributes(li, "class");
                    }
                });
                !ignore && adjustList(node, node.tagName.toLowerCase(), getStyle(node) || domUtils.getStyle(node, "list-style-type"), true);
            });
        }
        function adjustList(list, tag, style, ignoreEmpty) {
            var nextList = list.nextSibling;
            if (nextList && nextList.nodeType == 1 && nextList.tagName.toLowerCase() == tag && (getStyle(nextList) || domUtils.getStyle(nextList, "list-style-type") || (tag == "ol" ? "decimal" : "disc")) == style) {
                domUtils.moveChild(nextList, list);
                if (nextList.childNodes.length == 0) {
                    domUtils.remove(nextList);
                }
            }
            if (nextList && domUtils.isFillChar(nextList)) {
                domUtils.remove(nextList);
            }
            var preList = list.previousSibling;
            if (preList && preList.nodeType == 1 && preList.tagName.toLowerCase() == tag && (getStyle(preList) || domUtils.getStyle(preList, "list-style-type") || (tag == "ol" ? "decimal" : "disc")) == style) {
                domUtils.moveChild(list, preList);
            }
            if (preList && domUtils.isFillChar(preList)) {
                domUtils.remove(preList);
            }
            !ignoreEmpty && domUtils.isEmptyBlock(list) && domUtils.remove(list);
            if (getStyle(list)) {
                adjustListStyle(list.ownerDocument, true);
            }
        }
        function setListStyle(list, style) {
            if (customStyle[style]) {
                list.className = "custom_" + style;
            }
            try {
                domUtils.setStyle(list, "list-style-type", style);
            }
            catch (e) {
            }
        }
        function clearEmptySibling(node) {
            var tmpNode = node.previousSibling;
            if (tmpNode && domUtils.isEmptyBlock(tmpNode)) {
                domUtils.remove(tmpNode);
            }
            tmpNode = node.nextSibling;
            if (tmpNode && domUtils.isEmptyBlock(tmpNode)) {
                domUtils.remove(tmpNode);
            }
        }
        me.addListener("keydown", function (type, evt) {
            function preventAndSave() {
                evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
                me.fireEvent("contentchange");
                me.undoManger && me.undoManger.save();
            }
            function findList(node, filterFn) {
                while (node && !domUtils.isBody(node)) {
                    if (filterFn(node)) {
                        return null;
                    }
                    if (node.nodeType == 1 && /[ou]l/i.test(node.tagName)) {
                        return node;
                    }
                    node = node.parentNode;
                }
                return null;
            }
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 13 && !evt.shiftKey) {
                var rng = me.selection.getRange(), parent = domUtils.findParent(rng.startContainer, function (node) {
                    return domUtils.isBlockElm(node);
                }, true), li = domUtils.findParentByTagName(rng.startContainer, "li", true);
                if (parent && parent.tagName != "PRE" && !li) {
                    var html = parent.innerHTML.replace(new RegExp(domUtils.fillChar, "g"), "");
                    if (/^\s*1\s*\.[^\d]/.test(html)) {
                        parent.innerHTML = html.replace(/^\s*1\s*\./, "");
                        rng.setStartAtLast(parent).collapse(true).select();
                        me.__hasEnterExecCommand = true;
                        me.execCommand("insertorderedlist");
                        me.__hasEnterExecCommand = false;
                    }
                }
                var range = me.selection.getRange(), start = findList(range.startContainer, function (node) {
                    return node.tagName == "TABLE";
                }), end = range.collapsed ? start : findList(range.endContainer, function (node) {
                    return node.tagName == "TABLE";
                });
                if (start && end && start === end) {
                    if (!range.collapsed) {
                        start = domUtils.findParentByTagName(range.startContainer, "li", true);
                        end = domUtils.findParentByTagName(range.endContainer, "li", true);
                        if (start && end && start === end) {
                            range.deleteContents();
                            li = domUtils.findParentByTagName(range.startContainer, "li", true);
                            if (li && domUtils.isEmptyBlock(li)) {
                                pre = li.previousSibling;
                                next = li.nextSibling;
                                p = me.document.createElement("p");
                                domUtils.fillNode(me.document, p);
                                parentList = li.parentNode;
                                if (pre && next) {
                                    range.setStart(next, 0).collapse(true).select(true);
                                    domUtils.remove(li);
                                } else {
                                    if (!pre && !next || !pre) {
                                        parentList.parentNode.insertBefore(p, parentList);
                                    } else {
                                        li.parentNode.parentNode.insertBefore(p, parentList.nextSibling);
                                    }
                                    domUtils.remove(li);
                                    if (!parentList.firstChild) {
                                        domUtils.remove(parentList);
                                    }
                                    range.setStart(p, 0).setCursor();
                                }
                                preventAndSave();
                                return;
                            }
                        } else {
                            var tmpRange = range.cloneRange(), bk = tmpRange.collapse(false).createBookmark();
                            range.deleteContents();
                            tmpRange.moveToBookmark(bk);
                            var li = domUtils.findParentByTagName(tmpRange.startContainer, "li", true);
                            clearEmptySibling(li);
                            tmpRange.select();
                            preventAndSave();
                            return;
                        }
                    }
                    li = domUtils.findParentByTagName(range.startContainer, "li", true);
                    if (li) {
                        if (domUtils.isEmptyBlock(li)) {
                            bk = range.createBookmark();
                            var parentList = li.parentNode;
                            if (li !== parentList.lastChild) {
                                domUtils.breakParent(li, parentList);
                                clearEmptySibling(li);
                            } else {
                                parentList.parentNode.insertBefore(li, parentList.nextSibling);
                                if (domUtils.isEmptyNode(parentList)) {
                                    domUtils.remove(parentList);
                                }
                            }
                            if (!dtd.$list[li.parentNode.tagName]) {
                                if (!domUtils.isBlockElm(li.firstChild)) {
                                    p = me.document.createElement("p");
                                    li.parentNode.insertBefore(p, li);
                                    while (li.firstChild) {
                                        p.appendChild(li.firstChild);
                                    }
                                    domUtils.remove(li);
                                } else {
                                    domUtils.remove(li, true);
                                }
                            }
                            range.moveToBookmark(bk).select();
                        } else {
                            var first = li.firstChild;
                            if (!first || !domUtils.isBlockElm(first)) {
                                var p = me.document.createElement("p");
                                !li.firstChild && domUtils.fillNode(me.document, p);
                                while (li.firstChild) {
                                    p.appendChild(li.firstChild);
                                }
                                li.appendChild(p);
                                first = p;
                            }
                            var span = me.document.createElement("span");
                            range.insertNode(span);
                            domUtils.breakParent(span, li);
                            var nextLi = span.nextSibling;
                            first = nextLi.firstChild;
                            if (!first) {
                                p = me.document.createElement("p");
                                domUtils.fillNode(me.document, p);
                                nextLi.appendChild(p);
                                first = p;
                            }
                            if (domUtils.isEmptyNode(first)) {
                                first.innerHTML = "";
                                domUtils.fillNode(me.document, first);
                            }
                            range.setStart(first, 0).collapse(true).shrinkBoundary().select();
                            domUtils.remove(span);
                            var pre = nextLi.previousSibling;
                            if (pre && domUtils.isEmptyBlock(pre)) {
                                pre.innerHTML = "<p></p>";
                                domUtils.fillNode(me.document, pre.firstChild);
                            }
                        }
                        preventAndSave();
                    }
                }
            }
            if (keyCode == 8) {
                range = me.selection.getRange();
                if (range.collapsed && domUtils.isStartInblock(range)) {
                    tmpRange = range.cloneRange().trimBoundary();
                    li = domUtils.findParentByTagName(range.startContainer, "li", true);
                    if (li && domUtils.isStartInblock(tmpRange)) {
                        start = domUtils.findParentByTagName(range.startContainer, "p", true);
                        if (start && start !== li.firstChild) {
                            var parentList = domUtils.findParentByTagName(start, ["ol", "ul"]);
                            domUtils.breakParent(start, parentList);
                            clearEmptySibling(start);
                            me.fireEvent("contentchange");
                            range.setStart(start, 0).setCursor(false, true);
                            me.fireEvent("saveScene");
                            domUtils.preventDefault(evt);
                            return;
                        }
                        if (li && (pre = li.previousSibling)) {
                            if (keyCode == 46 && li.childNodes.length) {
                                return;
                            }
                            if (dtd.$list[pre.tagName]) {
                                pre = pre.lastChild;
                            }
                            me.undoManger && me.undoManger.save();
                            first = li.firstChild;
                            if (domUtils.isBlockElm(first)) {
                                if (domUtils.isEmptyNode(first)) {
                                    pre.appendChild(first);
                                    range.setStart(first, 0).setCursor(false, true);
                                    while (li.firstChild) {
                                        pre.appendChild(li.firstChild);
                                    }
                                } else {
                                    span = me.document.createElement("span");
                                    range.insertNode(span);
                                    if (domUtils.isEmptyBlock(pre)) {
                                        pre.innerHTML = "";
                                    }
                                    domUtils.moveChild(li, pre);
                                    range.setStartBefore(span).collapse(true).select(true);
                                    domUtils.remove(span);
                                }
                            } else {
                                if (domUtils.isEmptyNode(li)) {
                                    var p = me.document.createElement("p");
                                    pre.appendChild(p);
                                    range.setStart(p, 0).setCursor();
                                } else {
                                    range.setEnd(pre, pre.childNodes.length).collapse().select(true);
                                    while (li.firstChild) {
                                        pre.appendChild(li.firstChild);
                                    }
                                }
                            }
                            domUtils.remove(li);
                            me.fireEvent("contentchange");
                            me.fireEvent("saveScene");
                            domUtils.preventDefault(evt);
                            return;
                        }
                        if (li && !li.previousSibling) {
                            var parentList = li.parentNode;
                            var bk = range.createBookmark();
                            if (domUtils.isTagNode(parentList.parentNode, "ol ul")) {
                                parentList.parentNode.insertBefore(li, parentList);
                                if (domUtils.isEmptyNode(parentList)) {
                                    domUtils.remove(parentList);
                                }
                            } else {
                                while (li.firstChild) {
                                    parentList.parentNode.insertBefore(li.firstChild, parentList);
                                }
                                domUtils.remove(li);
                                if (domUtils.isEmptyNode(parentList)) {
                                    domUtils.remove(parentList);
                                }
                            }
                            range.moveToBookmark(bk).setCursor(false, true);
                            me.fireEvent("contentchange");
                            me.fireEvent("saveScene");
                            domUtils.preventDefault(evt);
                            return;
                        }
                    }
                }
            }
        });
        me.addListener("keyup", function (type, evt) {
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 8) {
                var rng = me.selection.getRange(), list;
                if (list = domUtils.findParentByTagName(rng.startContainer, ["ol", "ul"], true)) {
                    adjustList(list, list.tagName.toLowerCase(), getStyle(list) || domUtils.getComputedStyle(list, "list-style-type"), true);
                }
            }
        });
        me.addListener("tabkeydown", function () {
            var range = me.selection.getRange();
            function checkLevel(li) {
                if (me.options.maxListLevel != -1) {
                    var level = li.parentNode, levelNum = 0;
                    while (/[ou]l/i.test(level.tagName)) {
                        levelNum++;
                        level = level.parentNode;
                    }
                    if (levelNum >= me.options.maxListLevel) {
                        return true;
                    }
                }
            }
            var li = domUtils.findParentByTagName(range.startContainer, "li", true);
            if (li) {
                var bk;
                if (range.collapsed) {
                    if (checkLevel(li)) {
                        return true;
                    }
                    var parentLi = li.parentNode, list = me.document.createElement(parentLi.tagName), index = utils.indexOf(listStyle[list.tagName], getStyle(parentLi) || domUtils.getComputedStyle(parentLi, "list-style-type"));
                    index = index + 1 == listStyle[list.tagName].length ? 0 : index + 1;
                    var currentStyle = listStyle[list.tagName][index];
                    setListStyle(list, currentStyle);
                    if (domUtils.isStartInblock(range)) {
                        me.fireEvent("saveScene");
                        bk = range.createBookmark();
                        parentLi.insertBefore(list, li);
                        list.appendChild(li);
                        adjustList(list, list.tagName.toLowerCase(), currentStyle);
                        me.fireEvent("contentchange");
                        range.moveToBookmark(bk).select(true);
                        return true;
                    }
                } else {
                    me.fireEvent("saveScene");
                    bk = range.createBookmark();
                    for (var i = 0, closeList, parents = domUtils.findParents(li), ci; ci = parents[i++]; ) {
                        if (domUtils.isTagNode(ci, "ol ul")) {
                            closeList = ci;
                            break;
                        }
                    }
                    var current = li;
                    if (bk.end) {
                        while (current && !(domUtils.getPosition(current, bk.end) & domUtils.POSITION_FOLLOWING)) {
                            if (checkLevel(current)) {
                                current = domUtils.getNextDomNode(current, false, null, function (node) {
                                    return node !== closeList;
                                });
                                continue;
                            }
                            var parentLi = current.parentNode, list = me.document.createElement(parentLi.tagName), index = utils.indexOf(listStyle[list.tagName], getStyle(parentLi) || domUtils.getComputedStyle(parentLi, "list-style-type"));
                            var currentIndex = index + 1 == listStyle[list.tagName].length ? 0 : index + 1;
                            var currentStyle = listStyle[list.tagName][currentIndex];
                            setListStyle(list, currentStyle);
                            parentLi.insertBefore(list, current);
                            while (current && !(domUtils.getPosition(current, bk.end) & domUtils.POSITION_FOLLOWING)) {
                                li = current.nextSibling;
                                list.appendChild(current);
                                if (!li || domUtils.isTagNode(li, "ol ul")) {
                                    if (li) {
                                        while (li = li.firstChild) {
                                            if (li.tagName == "LI") {
                                                break;
                                            }
                                        }
                                    } else {
                                        li = domUtils.getNextDomNode(current, false, null, function (node) {
                                            return node !== closeList;
                                        });
                                    }
                                    break;
                                }
                                current = li;
                            }
                            adjustList(list, list.tagName.toLowerCase(), currentStyle);
                            current = li;
                        }
                    }
                    me.fireEvent("contentchange");
                    range.moveToBookmark(bk).select();
                    return true;
                }
            }
        });
        function getLi(start) {
            while (start && !domUtils.isBody(start)) {
                if (start.nodeName == "TABLE") {
                    return null;
                }
                if (start.nodeName == "LI") {
                    return start;
                }
                start = start.parentNode;
            }
        }
        me.commands["insertorderedlist"] = me.commands["insertunorderedlist"] = {execCommand:function (command, style) {
            if (!style) {
                style = command.toLowerCase() == "insertorderedlist" ? "decimal" : "disc";
            }
            var me = this, range = this.selection.getRange(), filterFn = function (node) {
                return node.nodeType == 1 ? node.tagName.toLowerCase() != "br" : !domUtils.isWhitespace(node);
            }, tag = command.toLowerCase() == "insertorderedlist" ? "ol" : "ul", frag = me.document.createDocumentFragment();
            range.adjustmentBoundary().shrinkBoundary();
            var bko = range.createBookmark(true), start = getLi(me.document.getElementById(bko.start)), modifyStart = 0, end = getLi(me.document.getElementById(bko.end)), modifyEnd = 0, startParent, endParent, list, tmp;
            if (start || end) {
                start && (startParent = start.parentNode);
                if (!bko.end) {
                    end = start;
                }
                end && (endParent = end.parentNode);
                if (startParent === endParent) {
                    while (start !== end) {
                        tmp = start;
                        start = start.nextSibling;
                        if (!domUtils.isBlockElm(tmp.firstChild)) {
                            var p = me.document.createElement("p");
                            while (tmp.firstChild) {
                                p.appendChild(tmp.firstChild);
                            }
                            tmp.appendChild(p);
                        }
                        frag.appendChild(tmp);
                    }
                    tmp = me.document.createElement("span");
                    startParent.insertBefore(tmp, end);
                    if (!domUtils.isBlockElm(end.firstChild)) {
                        p = me.document.createElement("p");
                        while (end.firstChild) {
                            p.appendChild(end.firstChild);
                        }
                        end.appendChild(p);
                    }
                    frag.appendChild(end);
                    domUtils.breakParent(tmp, startParent);
                    if (domUtils.isEmptyNode(tmp.previousSibling)) {
                        domUtils.remove(tmp.previousSibling);
                    }
                    if (domUtils.isEmptyNode(tmp.nextSibling)) {
                        domUtils.remove(tmp.nextSibling);
                    }
                    var nodeStyle = getStyle(startParent) || domUtils.getComputedStyle(startParent, "list-style-type") || (command.toLowerCase() == "insertorderedlist" ? "decimal" : "disc");
                    if (startParent.tagName.toLowerCase() == tag && nodeStyle == style) {
                        for (var i = 0, ci, tmpFrag = me.document.createDocumentFragment(); ci = frag.firstChild; ) {
                            if (domUtils.isTagNode(ci, "ol ul")) {
                                tmpFrag.appendChild(ci);
                            } else {
                                while (ci.firstChild) {
                                    tmpFrag.appendChild(ci.firstChild);
                                    domUtils.remove(ci);
                                }
                            }
                        }
                        tmp.parentNode.insertBefore(tmpFrag, tmp);
                    } else {
                        list = me.document.createElement(tag);
                        setListStyle(list, style);
                        list.appendChild(frag);
                        tmp.parentNode.insertBefore(list, tmp);
                    }
                    domUtils.remove(tmp);
                    list && adjustList(list, tag, style);
                    range.moveToBookmark(bko).select();
                    return;
                }
                if (start) {
                    while (start) {
                        tmp = start.nextSibling;
                        if (domUtils.isTagNode(start, "ol ul")) {
                            frag.appendChild(start);
                        } else {
                            var tmpfrag = me.document.createDocumentFragment(), hasBlock = 0;
                            while (start.firstChild) {
                                if (domUtils.isBlockElm(start.firstChild)) {
                                    hasBlock = 1;
                                }
                                tmpfrag.appendChild(start.firstChild);
                            }
                            if (!hasBlock) {
                                var tmpP = me.document.createElement("p");
                                tmpP.appendChild(tmpfrag);
                                frag.appendChild(tmpP);
                            } else {
                                frag.appendChild(tmpfrag);
                            }
                            domUtils.remove(start);
                        }
                        start = tmp;
                    }
                    startParent.parentNode.insertBefore(frag, startParent.nextSibling);
                    if (domUtils.isEmptyNode(startParent)) {
                        range.setStartBefore(startParent);
                        domUtils.remove(startParent);
                    } else {
                        range.setStartAfter(startParent);
                    }
                    modifyStart = 1;
                }
                if (end && domUtils.inDoc(endParent, me.document)) {
                    start = endParent.firstChild;
                    while (start && start !== end) {
                        tmp = start.nextSibling;
                        if (domUtils.isTagNode(start, "ol ul")) {
                            frag.appendChild(start);
                        } else {
                            tmpfrag = me.document.createDocumentFragment();
                            hasBlock = 0;
                            while (start.firstChild) {
                                if (domUtils.isBlockElm(start.firstChild)) {
                                    hasBlock = 1;
                                }
                                tmpfrag.appendChild(start.firstChild);
                            }
                            if (!hasBlock) {
                                tmpP = me.document.createElement("p");
                                tmpP.appendChild(tmpfrag);
                                frag.appendChild(tmpP);
                            } else {
                                frag.appendChild(tmpfrag);
                            }
                            domUtils.remove(start);
                        }
                        start = tmp;
                    }
                    var tmpDiv = domUtils.createElement(me.document, "div", {"tmpDiv":1});
                    domUtils.moveChild(end, tmpDiv);
                    frag.appendChild(tmpDiv);
                    domUtils.remove(end);
                    endParent.parentNode.insertBefore(frag, endParent);
                    range.setEndBefore(endParent);
                    if (domUtils.isEmptyNode(endParent)) {
                        domUtils.remove(endParent);
                    }
                    modifyEnd = 1;
                }
            }
            if (!modifyStart) {
                range.setStartBefore(me.document.getElementById(bko.start));
            }
            if (bko.end && !modifyEnd) {
                range.setEndAfter(me.document.getElementById(bko.end));
            }
            range.enlarge(true, function (node) {
                return notExchange[node.tagName];
            });
            frag = me.document.createDocumentFragment();
            var bk = range.createBookmark(), current = domUtils.getNextDomNode(bk.start, false, filterFn), tmpRange = range.cloneRange(), tmpNode, block = domUtils.isBlockElm;
            while (current && current !== bk.end && (domUtils.getPosition(current, bk.end) & domUtils.POSITION_PRECEDING)) {
                if (current.nodeType == 3 || dtd.li[current.tagName]) {
                    if (current.nodeType == 1 && dtd.$list[current.tagName]) {
                        while (current.firstChild) {
                            frag.appendChild(current.firstChild);
                        }
                        tmpNode = domUtils.getNextDomNode(current, false, filterFn);
                        domUtils.remove(current);
                        current = tmpNode;
                        continue;
                    }
                    tmpNode = current;
                    tmpRange.setStartBefore(current);
                    while (current && current !== bk.end && (!block(current) || domUtils.isBookmarkNode(current))) {
                        tmpNode = current;
                        current = domUtils.getNextDomNode(current, false, null, function (node) {
                            return !notExchange[node.tagName];
                        });
                    }
                    if (current && block(current)) {
                        tmp = domUtils.getNextDomNode(tmpNode, false, filterFn);
                        if (tmp && domUtils.isBookmarkNode(tmp)) {
                            current = domUtils.getNextDomNode(tmp, false, filterFn);
                            tmpNode = tmp;
                        }
                    }
                    tmpRange.setEndAfter(tmpNode);
                    current = domUtils.getNextDomNode(tmpNode, false, filterFn);
                    var li = range.document.createElement("li");
                    li.appendChild(tmpRange.extractContents());
                    if (domUtils.isEmptyNode(li)) {
                        var tmpNode = range.document.createElement("p");
                        while (li.firstChild) {
                            tmpNode.appendChild(li.firstChild);
                        }
                        li.appendChild(tmpNode);
                    }
                    frag.appendChild(li);
                } else {
                    current = domUtils.getNextDomNode(current, true, filterFn);
                }
            }
            range.moveToBookmark(bk).collapse(true);
            list = me.document.createElement(tag);
            setListStyle(list, style);
            list.appendChild(frag);
            range.insertNode(list);
            adjustList(list, tag, style);
            for (var i = 0, ci, tmpDivs = domUtils.getElementsByTagName(list, "div"); ci = tmpDivs[i++]; ) {
                if (ci.getAttribute("tmpDiv")) {
                    domUtils.remove(ci, true);
                }
            }
            range.moveToBookmark(bko).select();
        }, queryCommandState:function (command) {
            var tag = command.toLowerCase() == "insertorderedlist" ? "ol" : "ul";
            var path = this.selection.getStartElementPath();
            for (var i = 0, ci; ci = path[i++]; ) {
                if (ci.nodeName == "TABLE") {
                    return 0;
                }
                if (tag == ci.nodeName.toLowerCase()) {
                    return 1;
                }
            }
            return 0;
        }, queryCommandValue:function (command) {
            var tag = command.toLowerCase() == "insertorderedlist" ? "ol" : "ul";
            var path = this.selection.getStartElementPath(), node;
            for (var i = 0, ci; ci = path[i++]; ) {
                if (ci.nodeName == "TABLE") {
                    node = null;
                    break;
                }
                if (tag == ci.nodeName.toLowerCase()) {
                    node = ci;
                    break;
                }
            }
            return node ? getStyle(node) || domUtils.getComputedStyle(node, "list-style-type") : null;
        }};
    };
    (function () {
        var sourceEditors = {textarea:function (editor, holder) {
            var textarea = holder.ownerDocument.createElement("textarea");
            textarea.style.cssText = "position:absolute;resize:none;width:100%;height:100%;border:0;padding:0;margin:0;overflow-y:auto;";
            if (browser.ie && browser.version < 8) {
                textarea.style.width = holder.offsetWidth + "px";
                textarea.style.height = holder.offsetHeight + "px";
                holder.onresize = function () {
                    textarea.style.width = holder.offsetWidth + "px";
                    textarea.style.height = holder.offsetHeight + "px";
                };
            }
            holder.appendChild(textarea);
            return {setContent:function (content) {
                textarea.value = content;
            }, getContent:function () {
                return textarea.value;
            }, select:function () {
                var range;
                if (browser.ie) {
                    range = textarea.createTextRange();
                    range.collapse(true);
                    range.select();
                } else {
                    textarea.setSelectionRange(0, 0);
                    textarea.focus();
                }
            }, dispose:function () {
                holder.removeChild(textarea);
                holder.onresize = null;
                textarea = null;
                holder = null;
            }};
        }, codemirror:function (editor, holder) {
            var codeEditor = window.CodeMirror(holder, {mode:"text/html", tabMode:"indent", lineNumbers:true, lineWrapping:true});
            var dom = codeEditor.getWrapperElement();
            dom.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;font-family:consolas,\"Courier new\",monospace;font-size:13px;";
            codeEditor.getScrollerElement().style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;";
            codeEditor.refresh();
            return {getCodeMirror:function () {
                return codeEditor;
            }, setContent:function (content) {
                codeEditor.setValue(content);
            }, getContent:function () {
                return codeEditor.getValue();
            }, select:function () {
                codeEditor.focus();
            }, dispose:function () {
                holder.removeChild(dom);
                dom = null;
                codeEditor = null;
            }};
        }};
        UE.plugins["source"] = function () {
            var me = this;
            var opt = this.options;
            var sourceMode = false;
            var sourceEditor;
            var orgSetContent;
            opt.sourceEditor = browser.ie ? "textarea" : (opt.sourceEditor || "codemirror");
            me.setOpt({sourceEditorFirst:false});
            function createSourceEditor(holder) {
                return sourceEditors[opt.sourceEditor == "codemirror" && window.CodeMirror ? "codemirror" : "textarea"](me, holder);
            }
            var bakCssText;
            var oldGetContent, bakAddress;
            me.commands["source"] = {execCommand:function () {
                sourceMode = !sourceMode;
                if (sourceMode) {
                    bakAddress = me.selection.getRange().createAddress(false, true);
                    me.undoManger && me.undoManger.save(true);
                    if (browser.gecko) {
                        me.body.contentEditable = false;
                    }
                    bakCssText = me.iframe.style.cssText;
                    me.iframe.style.cssText += "position:absolute;left:-32768px;top:-32768px;";
                    me.fireEvent("beforegetcontent");
                    var root = UE.htmlparser(me.body.innerHTML);
                    me.filterOutputRule(root);
                    root.traversal(function (node) {
                        if (node.type == "element") {
                            switch (node.tagName) {
                              case "td":
                              case "th":
                              case "caption":
                                if (node.children && node.children.length == 1) {
                                    if (node.firstChild().tagName == "br") {
                                        node.removeChild(node.firstChild());
                                    }
                                }
                                break;
                              case "pre":
                                node.innerText(node.innerText().replace(/&nbsp;/g, " "));
                            }
                        }
                    });
                    me.fireEvent("aftergetcontent");
                    var content = root.toHtml(true);
                    sourceEditor = createSourceEditor(me.iframe.parentNode);
                    sourceEditor.setContent(content);
                    orgSetContent = me.setContent;
                    me.setContent = function (html) {
                        var root = UE.htmlparser(html);
                        me.filterInputRule(root);
                        html = root.toHtml();
                        sourceEditor.setContent(html);
                    };
                    setTimeout(function () {
                        sourceEditor.select();
                        me.addListener("fullscreenchanged", function () {
                            try {
                                sourceEditor.getCodeMirror().refresh();
                            }
                            catch (e) {
                            }
                        });
                    });
                    oldGetContent = me.getContent;
                    me.getContent = function () {
                        return sourceEditor.getContent() || "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
                    };
                } else {
                    me.iframe.style.cssText = bakCssText;
                    var cont = sourceEditor.getContent() || "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
                    cont = cont.replace(new RegExp("[\\r\\t\\n ]*</?(\\w+)\\s*(?:[^>]*)>", "g"), function (a, b) {
                        if (b && !dtd.$inlineWithA[b.toLowerCase()]) {
                            return a.replace(/(^[\n\r\t ]*)|([\n\r\t ]*$)/g, "");
                        }
                        return a.replace(/(^[\n\r\t]*)|([\n\r\t]*$)/g, "");
                    });
                    me.setContent = orgSetContent;
                    me.setContent(cont);
                    sourceEditor.dispose();
                    sourceEditor = null;
                    me.getContent = oldGetContent;
                    var first = me.body.firstChild;
                    if (!first) {
                        me.body.innerHTML = "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
                        first = me.body.firstChild;
                    }
                    me.undoManger && me.undoManger.save(true);
                    if (browser.gecko) {
                        var input = document.createElement("input");
                        input.style.cssText = "position:absolute;left:0;top:-32768px";
                        document.body.appendChild(input);
                        me.body.contentEditable = false;
                        setTimeout(function () {
                            domUtils.setViewportOffset(input, {left:-32768, top:0});
                            input.focus();
                            setTimeout(function () {
                                me.body.contentEditable = true;
                                me.selection.getRange().moveToAddress(bakAddress).select(true);
                                domUtils.remove(input);
                            });
                        });
                    } else {
                        try {
                            me.selection.getRange().moveToAddress(bakAddress).select(true);
                        }
                        catch (e) {
                        }
                    }
                }
                this.fireEvent("sourcemodechanged", sourceMode);
            }, queryCommandState:function () {
                return sourceMode | 0;
            }, notNeedUndo:1};
            var oldQueryCommandState = me.queryCommandState;
            me.queryCommandState = function (cmdName) {
                cmdName = cmdName.toLowerCase();
                if (sourceMode) {
                    return cmdName in {"source":1, "fullscreen":1} ? 1 : -1;
                }
                return oldQueryCommandState.apply(this, arguments);
            };
            if (opt.sourceEditor == "codemirror") {
                me.addListener("ready", function () {
                    utils.loadFile(document, {src:opt.codeMirrorJsUrl || opt.UEDITOR_HOME_URL + "third-party/codemirror/codemirror.js", tag:"script", type:"text/javascript", defer:"defer"}, function () {
                        if (opt.sourceEditorFirst) {
                            setTimeout(function () {
                                me.execCommand("source");
                            }, 0);
                        }
                    });
                    utils.loadFile(document, {tag:"link", rel:"stylesheet", type:"text/css", href:opt.codeMirrorCssUrl || opt.UEDITOR_HOME_URL + "third-party/codemirror/codemirror.css"});
                });
            }
        };
    })();
    UE.plugins["enterkey"] = function () {
        var hTag, me = this, tag = me.options.enterTag;
        me.addListener("keyup", function (type, evt) {
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 13) {
                var range = me.selection.getRange(), start = range.startContainer, doSave;
                if (!browser.ie) {
                    if (/h\d/i.test(hTag)) {
                        if (browser.gecko) {
                            var h = domUtils.findParentByTagName(start, ["h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "caption", "table"], true);
                            if (!h) {
                                me.document.execCommand("formatBlock", false, "<p>");
                                doSave = 1;
                            }
                        } else {
                            if (start.nodeType == 1) {
                                var tmp = me.document.createTextNode(""), div;
                                range.insertNode(tmp);
                                div = domUtils.findParentByTagName(tmp, "div", true);
                                if (div) {
                                    var p = me.document.createElement("p");
                                    while (div.firstChild) {
                                        p.appendChild(div.firstChild);
                                    }
                                    div.parentNode.insertBefore(p, div);
                                    domUtils.remove(div);
                                    range.setStartBefore(tmp).setCursor();
                                    doSave = 1;
                                }
                                domUtils.remove(tmp);
                            }
                        }
                        if (me.undoManger && doSave) {
                            me.undoManger.save();
                        }
                    }
                    browser.opera && range.select();
                } else {
                    me.fireEvent("saveScene", true, true);
                }
            }
        });
        me.addListener("keydown", function (type, evt) {
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 13) {
                if (me.fireEvent("beforeenterkeydown")) {
                    domUtils.preventDefault(evt);
                    return;
                }
                me.fireEvent("saveScene", true, true);
                hTag = "";
                var range = me.selection.getRange();
                if (!range.collapsed) {
                    var start = range.startContainer, end = range.endContainer, startTd = domUtils.findParentByTagName(start, "td", true), endTd = domUtils.findParentByTagName(end, "td", true);
                    if (startTd && endTd && startTd !== endTd || !startTd && endTd || startTd && !endTd) {
                        evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
                        return;
                    }
                }
                if (tag == "p") {
                    if (!browser.ie) {
                        start = domUtils.findParentByTagName(range.startContainer, ["ol", "ul", "p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "caption"], true);
                        if (!start && !browser.opera) {
                            me.document.execCommand("formatBlock", false, "<p>");
                            if (browser.gecko) {
                                range = me.selection.getRange();
                                start = domUtils.findParentByTagName(range.startContainer, "p", true);
                                start && domUtils.removeDirtyAttr(start);
                            }
                        } else {
                            hTag = start.tagName;
                            start.tagName.toLowerCase() == "p" && browser.gecko && domUtils.removeDirtyAttr(start);
                        }
                    }
                } else {
                    evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
                    if (!range.collapsed) {
                        range.deleteContents();
                        start = range.startContainer;
                        if (start.nodeType == 1 && (start = start.childNodes[range.startOffset])) {
                            while (start.nodeType == 1) {
                                if (dtd.$empty[start.tagName]) {
                                    range.setStartBefore(start).setCursor();
                                    if (me.undoManger) {
                                        me.undoManger.save();
                                    }
                                    return false;
                                }
                                if (!start.firstChild) {
                                    var br = range.document.createElement("br");
                                    start.appendChild(br);
                                    range.setStart(start, 0).setCursor();
                                    if (me.undoManger) {
                                        me.undoManger.save();
                                    }
                                    return false;
                                }
                                start = start.firstChild;
                            }
                            if (start === range.startContainer.childNodes[range.startOffset]) {
                                br = range.document.createElement("br");
                                range.insertNode(br).setCursor();
                            } else {
                                range.setStart(start, 0).setCursor();
                            }
                        } else {
                            br = range.document.createElement("br");
                            range.insertNode(br).setStartAfter(br).setCursor();
                        }
                    } else {
                        br = range.document.createElement("br");
                        range.insertNode(br);
                        var parent = br.parentNode;
                        if (parent.lastChild === br) {
                            br.parentNode.insertBefore(br.cloneNode(true), br);
                            range.setStartBefore(br);
                        } else {
                            range.setStartAfter(br);
                        }
                        range.setCursor();
                    }
                }
            }
        });
    };
    UE.plugins["keystrokes"] = function () {
        var me = this;
        var collapsed = true;
        me.addListener("keydown", function (type, evt) {
            var keyCode = evt.keyCode || evt.which, rng = me.selection.getRange();
            if (!rng.collapsed && !(evt.ctrlKey || evt.shiftKey || evt.altKey || evt.metaKey) && (keyCode >= 65 && keyCode <= 90 || keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 111 || {13:1, 8:1, 46:1}[keyCode])) {
                var tmpNode = rng.startContainer;
                if (domUtils.isFillChar(tmpNode)) {
                    rng.setStartBefore(tmpNode);
                }
                tmpNode = rng.endContainer;
                if (domUtils.isFillChar(tmpNode)) {
                    rng.setEndAfter(tmpNode);
                }
                rng.txtToElmBoundary();
                if (rng.endContainer && rng.endContainer.nodeType == 1) {
                    tmpNode = rng.endContainer.childNodes[rng.endOffset];
                    if (tmpNode && domUtils.isBr(tmpNode)) {
                        rng.setEndAfter(tmpNode);
                    }
                }
                if (rng.startOffset == 0) {
                    tmpNode = rng.startContainer;
                    if (domUtils.isBoundaryNode(tmpNode, "firstChild")) {
                        tmpNode = rng.endContainer;
                        if (rng.endOffset == (tmpNode.nodeType == 3 ? tmpNode.nodeValue.length : tmpNode.childNodes.length) && domUtils.isBoundaryNode(tmpNode, "lastChild")) {
                            me.fireEvent("saveScene");
                            me.body.innerHTML = "<p>" + (browser.ie ? "" : "<br/>") + "</p>";
                            rng.setStart(me.body.firstChild, 0).setCursor(false, true);
                            me._selectionChange();
                            return;
                        }
                    }
                }
            }
            if (keyCode == 8) {
                rng = me.selection.getRange();
                collapsed = rng.collapsed;
                if (me.fireEvent("delkeydown", evt)) {
                    return;
                }
                var start, end;
                if (rng.collapsed && rng.inFillChar()) {
                    start = rng.startContainer;
                    if (domUtils.isFillChar(start)) {
                        rng.setStartBefore(start).shrinkBoundary(true).collapse(true);
                        domUtils.remove(start);
                    } else {
                        start.nodeValue = start.nodeValue.replace(new RegExp("^" + domUtils.fillChar), "");
                        rng.startOffset--;
                        rng.collapse(true).select(true);
                    }
                }
                if (start = rng.getClosedNode()) {
                    me.fireEvent("saveScene");
                    rng.setStartBefore(start);
                    domUtils.remove(start);
                    rng.setCursor();
                    me.fireEvent("saveScene");
                    domUtils.preventDefault(evt);
                    return;
                }
                if (!browser.ie) {
                    start = domUtils.findParentByTagName(rng.startContainer, "table", true);
                    end = domUtils.findParentByTagName(rng.endContainer, "table", true);
                    if (start && !end || !start && end || start !== end) {
                        evt.preventDefault();
                        return;
                    }
                }
            }
            if (keyCode == 9) {
                var excludeTagNameForTabKey = {"ol":1, "ul":1, "table":1};
                if (me.fireEvent("tabkeydown", evt)) {
                    domUtils.preventDefault(evt);
                    return;
                }
                var range = me.selection.getRange();
                me.fireEvent("saveScene");
                for (var i = 0, txt = "", tabSize = me.options.tabSize || 4, tabNode = me.options.tabNode || "&nbsp;"; i < tabSize; i++) {
                    txt += tabNode;
                }
                var span = me.document.createElement("span");
                span.innerHTML = txt + domUtils.fillChar;
                if (range.collapsed) {
                    range.insertNode(span.cloneNode(true).firstChild).setCursor(true);
                } else {
                    var filterFn = function (node) {
                        return domUtils.isBlockElm(node) && !excludeTagNameForTabKey[node.tagName.toLowerCase()];
                    };
                    start = domUtils.findParent(range.startContainer, filterFn, true);
                    end = domUtils.findParent(range.endContainer, filterFn, true);
                    if (start && end && start === end) {
                        range.deleteContents();
                        range.insertNode(span.cloneNode(true).firstChild).setCursor(true);
                    } else {
                        var bookmark = range.createBookmark();
                        range.enlarge(true);
                        var bookmark2 = range.createBookmark(), current = domUtils.getNextDomNode(bookmark2.start, false, filterFn);
                        while (current && !(domUtils.getPosition(current, bookmark2.end) & domUtils.POSITION_FOLLOWING)) {
                            current.insertBefore(span.cloneNode(true).firstChild, current.firstChild);
                            current = domUtils.getNextDomNode(current, false, filterFn);
                        }
                        range.moveToBookmark(bookmark2).moveToBookmark(bookmark).select();
                    }
                }
                domUtils.preventDefault(evt);
            }
            if (browser.gecko && keyCode == 46) {
                range = me.selection.getRange();
                if (range.collapsed) {
                    start = range.startContainer;
                    if (domUtils.isEmptyBlock(start)) {
                        var parent = start.parentNode;
                        while (domUtils.getChildCount(parent) == 1 && !domUtils.isBody(parent)) {
                            start = parent;
                            parent = parent.parentNode;
                        }
                        if (start === parent.lastChild) {
                            evt.preventDefault();
                        }
                        return;
                    }
                }
            }
        });
        me.addListener("keyup", function (type, evt) {
            var keyCode = evt.keyCode || evt.which, rng, me = this;
            if (keyCode == 8) {
                if (me.fireEvent("delkeyup")) {
                    return;
                }
                rng = me.selection.getRange();
                if (rng.collapsed) {
                    var tmpNode, autoClearTagName = ["h1", "h2", "h3", "h4", "h5", "h6"];
                    if (tmpNode = domUtils.findParentByTagName(rng.startContainer, autoClearTagName, true)) {
                        if (domUtils.isEmptyBlock(tmpNode)) {
                            var pre = tmpNode.previousSibling;
                            if (pre && pre.nodeName != "TABLE") {
                                domUtils.remove(tmpNode);
                                rng.setStartAtLast(pre).setCursor(false, true);
                                return;
                            } else {
                                var next = tmpNode.nextSibling;
                                if (next && next.nodeName != "TABLE") {
                                    domUtils.remove(tmpNode);
                                    rng.setStartAtFirst(next).setCursor(false, true);
                                    return;
                                }
                            }
                        }
                    }
                    if (domUtils.isBody(rng.startContainer)) {
                        var tmpNode = domUtils.createElement(me.document, "p", {"innerHTML":browser.ie ? domUtils.fillChar : "<br/>"});
                        rng.insertNode(tmpNode).setStart(tmpNode, 0).setCursor(false, true);
                    }
                }
                if (!collapsed && (rng.startContainer.nodeType == 3 || rng.startContainer.nodeType == 1 && domUtils.isEmptyBlock(rng.startContainer))) {
                    if (browser.ie) {
                        var span = rng.document.createElement("span");
                        rng.insertNode(span).setStartBefore(span).collapse(true);
                        rng.select();
                        domUtils.remove(span);
                    } else {
                        rng.select();
                    }
                }
            }
        });
    };
    UE.plugin.register("autolink", function () {
        var cont = 0;
        return !browser.ie ? {bindEvents:{"reset":function () {
            cont = 0;
        }, "keydown":function (type, evt) {
            var me = this;
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 32 || keyCode == 13) {
                var sel = me.selection.getNative(), range = sel.getRangeAt(0).cloneRange(), offset, charCode;
                var start = range.startContainer;
                while (start.nodeType == 1 && range.startOffset > 0) {
                    start = range.startContainer.childNodes[range.startOffset - 1];
                    if (!start) {
                        break;
                    }
                    range.setStart(start, start.nodeType == 1 ? start.childNodes.length : start.nodeValue.length);
                    range.collapse(true);
                    start = range.startContainer;
                }
                do {
                    if (range.startOffset == 0) {
                        start = range.startContainer.previousSibling;
                        while (start && start.nodeType == 1) {
                            start = start.lastChild;
                        }
                        if (!start || domUtils.isFillChar(start)) {
                            break;
                        }
                        offset = start.nodeValue.length;
                    } else {
                        start = range.startContainer;
                        offset = range.startOffset;
                    }
                    range.setStart(start, offset - 1);
                    charCode = range.toString().charCodeAt(0);
                } while (charCode != 160 && charCode != 32);
                if (range.toString().replace(new RegExp(domUtils.fillChar, "g"), "").match(/(?:https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.)/i)) {
                    while (range.toString().length) {
                        if (/^(?:https?:\/\/|ssh:\/\/|ftp:\/\/|file:\/|www\.)/i.test(range.toString())) {
                            break;
                        }
                        try {
                            range.setStart(range.startContainer, range.startOffset + 1);
                        }
                        catch (e) {
                            var start = range.startContainer;
                            while (!(next = start.nextSibling)) {
                                if (domUtils.isBody(start)) {
                                    return;
                                }
                                start = start.parentNode;
                            }
                            range.setStart(next, 0);
                        }
                    }
                    if (domUtils.findParentByTagName(range.startContainer, "a", true)) {
                        return;
                    }
                    var a = me.document.createElement("a"), text = me.document.createTextNode(" "), href;
                    me.undoManger && me.undoManger.save();
                    a.appendChild(range.extractContents());
                    a.href = a.innerHTML = a.innerHTML.replace(/<[^>]+>/g, "");
                    href = a.getAttribute("href").replace(new RegExp(domUtils.fillChar, "g"), "");
                    href = /^(?:https?:\/\/)/ig.test(href) ? href : "http://" + href;
                    a.setAttribute("_src", utils.html(href));
                    a.href = utils.html(href);
                    range.insertNode(a);
                    a.parentNode.insertBefore(text, a.nextSibling);
                    range.setStart(text, 0);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    me.undoManger && me.undoManger.save();
                }
            }
        }}} : {};
    }, function () {
        var keyCodes = {37:1, 38:1, 39:1, 40:1, 13:1, 32:1};
        function checkIsCludeLink(node) {
            if (node.nodeType == 3) {
                return null;
            }
            if (node.nodeName == "A") {
                return node;
            }
            var lastChild = node.lastChild;
            while (lastChild) {
                if (lastChild.nodeName == "A") {
                    return lastChild;
                }
                if (lastChild.nodeType == 3) {
                    if (domUtils.isWhitespace(lastChild)) {
                        lastChild = lastChild.previousSibling;
                        continue;
                    }
                    return null;
                }
                lastChild = lastChild.lastChild;
            }
        }
        browser.ie && this.addListener("keyup", function (cmd, evt) {
            var me = this, keyCode = evt.keyCode;
            if (keyCodes[keyCode]) {
                var rng = me.selection.getRange();
                var start = rng.startContainer;
                if (keyCode == 13) {
                    while (start && !domUtils.isBody(start) && !domUtils.isBlockElm(start)) {
                        start = start.parentNode;
                    }
                    if (start && !domUtils.isBody(start) && start.nodeName == "P") {
                        var pre = start.previousSibling;
                        if (pre && pre.nodeType == 1) {
                            var pre = checkIsCludeLink(pre);
                            if (pre && !pre.getAttribute("_href")) {
                                domUtils.remove(pre, true);
                            }
                        }
                    }
                } else {
                    if (keyCode == 32) {
                        if (start.nodeType == 3 && /^\s$/.test(start.nodeValue)) {
                            start = start.previousSibling;
                            if (start && start.nodeName == "A" && !start.getAttribute("_href")) {
                                domUtils.remove(start, true);
                            }
                        }
                    } else {
                        start = domUtils.findParentByTagName(start, "a", true);
                        if (start && !start.getAttribute("_href")) {
                            var bk = rng.createBookmark();
                            domUtils.remove(start, true);
                            rng.moveToBookmark(bk).select(true);
                        }
                    }
                }
            }
        });
    });
    UE.plugins["pasteplain"] = function () {
        var me = this;
        me.setOpt({"pasteplain":false, "filterTxtRules":function () {
            function transP(node) {
                node.tagName = "p";
                node.setStyle();
            }
            function removeNode(node) {
                node.parentNode.removeChild(node, true);
            }
            return {"-":"script style object iframe embed input select", "p":{$:{}}, "br":{$:{}}, div:function (node) {
                var tmpNode, p = UE.uNode.createElement("p");
                while (tmpNode = node.firstChild()) {
                    if (tmpNode.type == "text" || !UE.dom.dtd.$block[tmpNode.tagName]) {
                        p.appendChild(tmpNode);
                    } else {
                        if (p.firstChild()) {
                            node.parentNode.insertBefore(p, node);
                            p = UE.uNode.createElement("p");
                        } else {
                            node.parentNode.insertBefore(tmpNode, node);
                        }
                    }
                }
                if (p.firstChild()) {
                    node.parentNode.insertBefore(p, node);
                }
                node.parentNode.removeChild(node);
            }, ol:removeNode, ul:removeNode, dl:removeNode, dt:removeNode, dd:removeNode, "li":removeNode, "caption":transP, "th":transP, "tr":transP, "h1":transP, "h2":transP, "h3":transP, "h4":transP, "h5":transP, "h6":transP, "td":function (node) {
                var txt = !!node.innerText();
                if (txt) {
                    node.parentNode.insertAfter(UE.uNode.createText(" &nbsp; &nbsp;"), node);
                }
                node.parentNode.removeChild(node, node.innerText());
            }};
        }()});
        var pasteplain = me.options.pasteplain;
        me.commands["pasteplain"] = {queryCommandState:function () {
            return pasteplain ? 1 : 0;
        }, execCommand:function () {
            pasteplain = !pasteplain | 0;
        }, notNeedUndo:1};
    };
    UE.plugins["video"] = function () {
        var me = this;
        function creatInsertStr(url, width, height, id, align, classname, type) {
            var str;
            switch (type) {
              case "image":
                str = "<img " + (id ? "id=\"" + id + "\"" : "") + " width=\"" + width + "\" height=\"" + height + "\" _url=\"" + url + "\" class=\"" + classname + "\"" + " src=\"" + me.options.UEDITOR_HOME_URL + "themes/default/images/spacer.gif\" style=\"background:url(" + me.options.UEDITOR_HOME_URL + "themes/default/images/videologo.gif) no-repeat center center; border:1px solid gray;" + (align ? "float:" + align + ";" : "") + "\" />";
                break;
              case "embed":
                str = "<embed type=\"application/x-shockwave-flash\" class=\"" + classname + "\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\"" + " src=\"" + utils.html(url) + "\" width=\"" + width + "\" height=\"" + height + "\"" + (align ? " style=\"float:" + align + "\"" : "") + " wmode=\"transparent\" play=\"true\" loop=\"false\" menu=\"false\" allowscriptaccess=\"never\" allowfullscreen=\"true\" >";
                break;
              case "video":
                var ext = url.substr(url.lastIndexOf(".") + 1);
                if (ext == "ogv") {
                    ext = "ogg";
                }
                str = "<video" + (id ? " id=\"" + id + "\"" : "") + " class=\"" + classname + "\" " + (align ? " style=\"float:" + align + "\"" : "") + " controls preload=\"none\" width=\"" + width + "\" height=\"" + height + "\" src=\"" + url + "\" data-setup=\"{}\">" + "<source src=\"" + url + "\" type=\"video/" + ext + "\" /></video>";
                break;
            }
            return str;
        }
        function switchImgAndVideo(root, img2video) {
            utils.each(root.getNodesByTagName(img2video ? "img" : "embed video"), function (node) {
                var className = node.getAttr("class");
                if (className && className.indexOf("edui-faked-video") != -1) {
                    var html = creatInsertStr(img2video ? node.getAttr("_url") : node.getAttr("src"), node.getAttr("width"), node.getAttr("height"), null, node.getStyle("float") || "", className, img2video ? "embed" : "image");
                    node.parentNode.replaceChild(UE.uNode.createElement(html), node);
                }
                if (className && className.indexOf("edui-upload-video") != -1) {
                    var html = creatInsertStr(img2video ? node.getAttr("_url") : node.getAttr("src"), node.getAttr("width"), node.getAttr("height"), null, node.getStyle("float") || "", className, img2video ? "video" : "image");
                    node.parentNode.replaceChild(UE.uNode.createElement(html), node);
                }
            });
        }
        me.addOutputRule(function (root) {
            switchImgAndVideo(root, true);
        });
        me.addInputRule(function (root) {
            switchImgAndVideo(root);
        });
        me.commands["insertvideo"] = {execCommand:function (cmd, videoObjs, type) {
            videoObjs = utils.isArray(videoObjs) ? videoObjs : [videoObjs];
            var html = [], id = "tmpVedio", cl;
            for (var i = 0, vi, len = videoObjs.length; i < len; i++) {
                vi = videoObjs[i];
                cl = (type == "upload" ? "edui-upload-video video-js vjs-default-skin" : "edui-faked-video");
                html.push(creatInsertStr(vi.url, vi.width || 420, vi.height || 280, id + i, null, cl, "image"));
            }
            me.execCommand("inserthtml", html.join(""), true);
            var rng = this.selection.getRange();
            for (var i = 0, len = videoObjs.length; i < len; i++) {
                var img = this.document.getElementById("tmpVedio" + i);
                domUtils.removeAttributes(img, "id");
                rng.selectNode(img).select();
                me.execCommand("imagefloat", videoObjs[i].align);
            }
        }, queryCommandState:function () {
            var img = me.selection.getRange().getClosedNode(), flag = img && (img.className == "edui-faked-video" || img.className.indexOf("edui-upload-video") != -1);
            return flag ? 1 : 0;
        }};
    };
    (function () {
        var UETable = UE.UETable = function (table) {
            this.table = table;
            this.indexTable = [];
            this.selectedTds = [];
            this.cellsRange = {};
            this.update(table);
        };
        UETable.removeSelectedClass = function (cells) {
            utils.each(cells, function (cell) {
                domUtils.removeClasses(cell, "selectTdClass");
            });
        };
        UETable.addSelectedClass = function (cells) {
            utils.each(cells, function (cell) {
                domUtils.addClass(cell, "selectTdClass");
            });
        };
        UETable.isEmptyBlock = function (node) {
            var reg = new RegExp(domUtils.fillChar, "g");
            if (node[browser.ie ? "innerText" : "textContent"].replace(/^\s*$/, "").replace(reg, "").length > 0) {
                return 0;
            }
            for (var i in dtd.$isNotEmpty) {
                if (dtd.$isNotEmpty.hasOwnProperty(i)) {
                    if (node.getElementsByTagName(i).length) {
                        return 0;
                    }
                }
            }
            return 1;
        };
        UETable.getWidth = function (cell) {
            if (!cell) {
                return 0;
            }
            return parseInt(domUtils.getComputedStyle(cell, "width"), 10);
        };
        UETable.getTableCellAlignState = function (cells) {
            !utils.isArray(cells) && (cells = [cells]);
            var result = {}, status = ["align", "valign"], tempStatus = null, isSame = true;
            utils.each(cells, function (cellNode) {
                utils.each(status, function (currentState) {
                    tempStatus = cellNode.getAttribute(currentState);
                    if (!result[currentState] && tempStatus) {
                        result[currentState] = tempStatus;
                    } else {
                        if (!result[currentState] || (tempStatus !== result[currentState])) {
                            isSame = false;
                            return false;
                        }
                    }
                });
                return isSame;
            });
            return isSame ? result : null;
        };
        UETable.getTableItemsByRange = function (editor) {
            var start = editor.selection.getStart();
            if (start && start.id && start.id.indexOf("_baidu_bookmark_start_") === 0) {
                start = start.nextSibling;
            }
            var cell = start && domUtils.findParentByTagName(start, ["td", "th"], true), tr = cell && cell.parentNode, caption = start && domUtils.findParentByTagName(start, "caption", true), table = caption ? caption.parentNode : tr && tr.parentNode.parentNode;
            return {cell:cell, tr:tr, table:table, caption:caption};
        };
        UETable.getUETableBySelected = function (editor) {
            var table = UETable.getTableItemsByRange(editor).table;
            if (table && table.ueTable && table.ueTable.selectedTds.length) {
                return table.ueTable;
            }
            return null;
        };
        UETable.getDefaultValue = function (editor, table) {
            var borderMap = {thin:"0px", medium:"1px", thick:"2px"}, tableBorder, tdPadding, tdBorder, tmpValue;
            if (!table) {
                table = editor.document.createElement("table");
                table.insertRow(0).insertCell(0).innerHTML = "xxx";
                editor.body.appendChild(table);
                var td = table.getElementsByTagName("td")[0];
                tmpValue = domUtils.getComputedStyle(table, "border-left-width");
                tableBorder = parseInt(borderMap[tmpValue] || tmpValue, 10);
                tmpValue = domUtils.getComputedStyle(td, "padding-left");
                tdPadding = parseInt(borderMap[tmpValue] || tmpValue, 10);
                tmpValue = domUtils.getComputedStyle(td, "border-left-width");
                tdBorder = parseInt(borderMap[tmpValue] || tmpValue, 10);
                domUtils.remove(table);
                return {tableBorder:tableBorder, tdPadding:tdPadding, tdBorder:tdBorder};
            } else {
                td = table.getElementsByTagName("td")[0];
                tmpValue = domUtils.getComputedStyle(table, "border-left-width");
                tableBorder = parseInt(borderMap[tmpValue] || tmpValue, 10);
                tmpValue = domUtils.getComputedStyle(td, "padding-left");
                tdPadding = parseInt(borderMap[tmpValue] || tmpValue, 10);
                tmpValue = domUtils.getComputedStyle(td, "border-left-width");
                tdBorder = parseInt(borderMap[tmpValue] || tmpValue, 10);
                return {tableBorder:tableBorder, tdPadding:tdPadding, tdBorder:tdBorder};
            }
        };
        UETable.getUETable = function (tdOrTable) {
            var tag = tdOrTable.tagName.toLowerCase();
            tdOrTable = (tag == "td" || tag == "th" || tag == "caption") ? domUtils.findParentByTagName(tdOrTable, "table", true) : tdOrTable;
            if (!tdOrTable.ueTable) {
                tdOrTable.ueTable = new UETable(tdOrTable);
            }
            return tdOrTable.ueTable;
        };
        UETable.cloneCell = function (cell, ignoreMerge, keepPro) {
            if (!cell || utils.isString(cell)) {
                return this.table.ownerDocument.createElement(cell || "td");
            }
            var flag = domUtils.hasClass(cell, "selectTdClass");
            flag && domUtils.removeClasses(cell, "selectTdClass");
            var tmpCell = cell.cloneNode(true);
            if (ignoreMerge) {
                tmpCell.rowSpan = tmpCell.colSpan = 1;
            }
            !keepPro && domUtils.removeAttributes(tmpCell, "width height");
            !keepPro && domUtils.removeAttributes(tmpCell, "style");
            tmpCell.style.borderLeftStyle = "";
            tmpCell.style.borderTopStyle = "";
            tmpCell.style.borderLeftColor = cell.style.borderRightColor;
            tmpCell.style.borderLeftWidth = cell.style.borderRightWidth;
            tmpCell.style.borderTopColor = cell.style.borderBottomColor;
            tmpCell.style.borderTopWidth = cell.style.borderBottomWidth;
            flag && domUtils.addClass(cell, "selectTdClass");
            return tmpCell;
        };
        UETable.prototype = {getMaxRows:function () {
            var rows = this.table.rows, maxLen = 1;
            for (var i = 0, row; row = rows[i]; i++) {
                var currentMax = 1;
                for (var j = 0, cj; cj = row.cells[j++]; ) {
                    currentMax = Math.max(cj.rowSpan || 1, currentMax);
                }
                maxLen = Math.max(currentMax + i, maxLen);
            }
            return maxLen;
        }, getMaxCols:function () {
            var rows = this.table.rows, maxLen = 0, cellRows = {};
            for (var i = 0, row; row = rows[i]; i++) {
                var cellsNum = 0;
                for (var j = 0, cj; cj = row.cells[j++]; ) {
                    cellsNum += (cj.colSpan || 1);
                    if (cj.rowSpan && cj.rowSpan > 1) {
                        for (var k = 1; k < cj.rowSpan; k++) {
                            if (!cellRows["row_" + (i + k)]) {
                                cellRows["row_" + (i + k)] = (cj.colSpan || 1);
                            } else {
                                cellRows["row_" + (i + k)]++;
                            }
                        }
                    }
                }
                cellsNum += cellRows["row_" + i] || 0;
                maxLen = Math.max(cellsNum, maxLen);
            }
            return maxLen;
        }, getCellColIndex:function (cell) {
        }, getHSideCell:function (cell, right) {
            try {
                var cellInfo = this.getCellInfo(cell), previewRowIndex, previewColIndex;
                var len = this.selectedTds.length, range = this.cellsRange;
                if ((!right && (!len ? !cellInfo.colIndex : !range.beginColIndex)) || (right && (!len ? (cellInfo.colIndex == (this.colsNum - 1)) : (range.endColIndex == this.colsNum - 1)))) {
                    return null;
                }
                previewRowIndex = !len ? cellInfo.rowIndex : range.beginRowIndex;
                previewColIndex = !right ? (!len ? (cellInfo.colIndex < 1 ? 0 : (cellInfo.colIndex - 1)) : range.beginColIndex - 1) : (!len ? cellInfo.colIndex + 1 : range.endColIndex + 1);
                return this.getCell(this.indexTable[previewRowIndex][previewColIndex].rowIndex, this.indexTable[previewRowIndex][previewColIndex].cellIndex);
            }
            catch (e) {
                showError(e);
            }
        }, getTabNextCell:function (cell, preRowIndex) {
            var cellInfo = this.getCellInfo(cell), rowIndex = preRowIndex || cellInfo.rowIndex, colIndex = cellInfo.colIndex + 1 + (cellInfo.colSpan - 1), nextCell;
            try {
                nextCell = this.getCell(this.indexTable[rowIndex][colIndex].rowIndex, this.indexTable[rowIndex][colIndex].cellIndex);
            }
            catch (e) {
                try {
                    rowIndex = rowIndex * 1 + 1;
                    colIndex = 0;
                    nextCell = this.getCell(this.indexTable[rowIndex][colIndex].rowIndex, this.indexTable[rowIndex][colIndex].cellIndex);
                }
                catch (e) {
                }
            }
            return nextCell;
        }, getVSideCell:function (cell, bottom, ignoreRange) {
            try {
                var cellInfo = this.getCellInfo(cell), nextRowIndex, nextColIndex;
                var len = this.selectedTds.length && !ignoreRange, range = this.cellsRange;
                if ((!bottom && (cellInfo.rowIndex == 0)) || (bottom && (!len ? (cellInfo.rowIndex + cellInfo.rowSpan > this.rowsNum - 1) : (range.endRowIndex == this.rowsNum - 1)))) {
                    return null;
                }
                nextRowIndex = !bottom ? (!len ? cellInfo.rowIndex - 1 : range.beginRowIndex - 1) : (!len ? (cellInfo.rowIndex + cellInfo.rowSpan) : range.endRowIndex + 1);
                nextColIndex = !len ? cellInfo.colIndex : range.beginColIndex;
                return this.getCell(this.indexTable[nextRowIndex][nextColIndex].rowIndex, this.indexTable[nextRowIndex][nextColIndex].cellIndex);
            }
            catch (e) {
                showError(e);
            }
        }, getSameEndPosCells:function (cell, xOrY) {
            try {
                var flag = (xOrY.toLowerCase() === "x"), end = domUtils.getXY(cell)[flag ? "x" : "y"] + cell["offset" + (flag ? "Width" : "Height")], rows = this.table.rows, cells = null, returns = [];
                for (var i = 0; i < this.rowsNum; i++) {
                    cells = rows[i].cells;
                    for (var j = 0, tmpCell; tmpCell = cells[j++]; ) {
                        var tmpEnd = domUtils.getXY(tmpCell)[flag ? "x" : "y"] + tmpCell["offset" + (flag ? "Width" : "Height")];
                        if (tmpEnd > end && flag) {
                            break;
                        }
                        if (cell == tmpCell || end == tmpEnd) {
                            if (tmpCell[flag ? "colSpan" : "rowSpan"] == 1) {
                                returns.push(tmpCell);
                            }
                            if (flag) {
                                break;
                            }
                        }
                    }
                }
                return returns;
            }
            catch (e) {
                showError(e);
            }
        }, setCellContent:function (cell, content) {
            cell.innerHTML = content || (browser.ie ? domUtils.fillChar : "<br />");
        }, cloneCell:UETable.cloneCell, getSameStartPosXCells:function (cell) {
            try {
                var start = domUtils.getXY(cell).x + cell.offsetWidth, rows = this.table.rows, cells, returns = [];
                for (var i = 0; i < this.rowsNum; i++) {
                    cells = rows[i].cells;
                    for (var j = 0, tmpCell; tmpCell = cells[j++]; ) {
                        var tmpStart = domUtils.getXY(tmpCell).x;
                        if (tmpStart > start) {
                            break;
                        }
                        if (tmpStart == start && tmpCell.colSpan == 1) {
                            returns.push(tmpCell);
                            break;
                        }
                    }
                }
                return returns;
            }
            catch (e) {
                showError(e);
            }
        }, update:function (table) {
            this.table = table || this.table;
            this.selectedTds = [];
            this.cellsRange = {};
            this.indexTable = [];
            var rows = this.table.rows, rowsNum = this.getMaxRows(), dNum = rowsNum - rows.length, colsNum = this.getMaxCols();
            while (dNum--) {
                this.table.insertRow(rows.length);
            }
            this.rowsNum = rowsNum;
            this.colsNum = colsNum;
            for (var i = 0, len = rows.length; i < len; i++) {
                this.indexTable[i] = new Array(colsNum);
            }
            for (var rowIndex = 0, row; row = rows[rowIndex]; rowIndex++) {
                for (var cellIndex = 0, cell, cells = row.cells; cell = cells[cellIndex]; cellIndex++) {
                    if (cell.rowSpan > rowsNum) {
                        cell.rowSpan = rowsNum;
                    }
                    var colIndex = cellIndex, rowSpan = cell.rowSpan || 1, colSpan = cell.colSpan || 1;
                    while (this.indexTable[rowIndex][colIndex]) {
                        colIndex++;
                    }
                    for (var j = 0; j < rowSpan; j++) {
                        for (var k = 0; k < colSpan; k++) {
                            this.indexTable[rowIndex + j][colIndex + k] = {rowIndex:rowIndex, cellIndex:cellIndex, colIndex:colIndex, rowSpan:rowSpan, colSpan:colSpan};
                        }
                    }
                }
            }
            for (j = 0; j < rowsNum; j++) {
                for (k = 0; k < colsNum; k++) {
                    if (this.indexTable[j][k] === undefined) {
                        row = rows[j];
                        cell = row.cells[row.cells.length - 1];
                        cell = cell ? cell.cloneNode(true) : this.table.ownerDocument.createElement("td");
                        this.setCellContent(cell);
                        if (cell.colSpan !== 1) {
                            cell.colSpan = 1;
                        }
                        if (cell.rowSpan !== 1) {
                            cell.rowSpan = 1;
                        }
                        row.appendChild(cell);
                        this.indexTable[j][k] = {rowIndex:j, cellIndex:cell.cellIndex, colIndex:k, rowSpan:1, colSpan:1};
                    }
                }
            }
            var tds = domUtils.getElementsByTagName(this.table, "td"), selectTds = [];
            utils.each(tds, function (td) {
                if (domUtils.hasClass(td, "selectTdClass")) {
                    selectTds.push(td);
                }
            });
            if (selectTds.length) {
                var start = selectTds[0], end = selectTds[selectTds.length - 1], startInfo = this.getCellInfo(start), endInfo = this.getCellInfo(end);
                this.selectedTds = selectTds;
                this.cellsRange = {beginRowIndex:startInfo.rowIndex, beginColIndex:startInfo.colIndex, endRowIndex:endInfo.rowIndex + endInfo.rowSpan - 1, endColIndex:endInfo.colIndex + endInfo.colSpan - 1};
            }
            if (!domUtils.hasClass(this.table.rows[0], "firstRow")) {
                domUtils.addClass(this.table.rows[0], "firstRow");
                for (var i = 1; i < this.table.rows.length; i++) {
                    domUtils.removeClasses(this.table.rows[i], "firstRow");
                }
            }
        }, getCellInfo:function (cell) {
            if (!cell) {
                return;
            }
            var cellIndex = cell.cellIndex, rowIndex = cell.parentNode.rowIndex, rowInfo = this.indexTable[rowIndex], numCols = this.colsNum;
            for (var colIndex = cellIndex; colIndex < numCols; colIndex++) {
                var cellInfo = rowInfo[colIndex];
                if (cellInfo.rowIndex === rowIndex && cellInfo.cellIndex === cellIndex) {
                    return cellInfo;
                }
            }
        }, getCell:function (rowIndex, cellIndex) {
            return rowIndex < this.rowsNum && this.table.rows[rowIndex].cells[cellIndex] || null;
        }, deleteCell:function (cell, rowIndex) {
            rowIndex = typeof rowIndex == "number" ? rowIndex : cell.parentNode.rowIndex;
            var row = this.table.rows[rowIndex];
            row.deleteCell(cell.cellIndex);
        }, getCellsRange:function (cellA, cellB) {
            function checkRange(beginRowIndex, beginColIndex, endRowIndex, endColIndex) {
                var tmpBeginRowIndex = beginRowIndex, tmpBeginColIndex = beginColIndex, tmpEndRowIndex = endRowIndex, tmpEndColIndex = endColIndex, cellInfo, colIndex, rowIndex;
                if (beginRowIndex > 0) {
                    for (colIndex = beginColIndex; colIndex < endColIndex; colIndex++) {
                        cellInfo = me.indexTable[beginRowIndex][colIndex];
                        rowIndex = cellInfo.rowIndex;
                        if (rowIndex < beginRowIndex) {
                            tmpBeginRowIndex = Math.min(rowIndex, tmpBeginRowIndex);
                        }
                    }
                }
                if (endColIndex < me.colsNum) {
                    for (rowIndex = beginRowIndex; rowIndex < endRowIndex; rowIndex++) {
                        cellInfo = me.indexTable[rowIndex][endColIndex];
                        colIndex = cellInfo.colIndex + cellInfo.colSpan - 1;
                        if (colIndex > endColIndex) {
                            tmpEndColIndex = Math.max(colIndex, tmpEndColIndex);
                        }
                    }
                }
                if (endRowIndex < me.rowsNum) {
                    for (colIndex = beginColIndex; colIndex < endColIndex; colIndex++) {
                        cellInfo = me.indexTable[endRowIndex][colIndex];
                        rowIndex = cellInfo.rowIndex + cellInfo.rowSpan - 1;
                        if (rowIndex > endRowIndex) {
                            tmpEndRowIndex = Math.max(rowIndex, tmpEndRowIndex);
                        }
                    }
                }
                if (beginColIndex > 0) {
                    for (rowIndex = beginRowIndex; rowIndex < endRowIndex; rowIndex++) {
                        cellInfo = me.indexTable[rowIndex][beginColIndex];
                        colIndex = cellInfo.colIndex;
                        if (colIndex < beginColIndex) {
                            tmpBeginColIndex = Math.min(cellInfo.colIndex, tmpBeginColIndex);
                        }
                    }
                }
                if (tmpBeginRowIndex != beginRowIndex || tmpBeginColIndex != beginColIndex || tmpEndRowIndex != endRowIndex || tmpEndColIndex != endColIndex) {
                    return checkRange(tmpBeginRowIndex, tmpBeginColIndex, tmpEndRowIndex, tmpEndColIndex);
                } else {
                    return {beginRowIndex:beginRowIndex, beginColIndex:beginColIndex, endRowIndex:endRowIndex, endColIndex:endColIndex};
                }
            }
            try {
                var me = this, cellAInfo = me.getCellInfo(cellA);
                if (cellA === cellB) {
                    return {beginRowIndex:cellAInfo.rowIndex, beginColIndex:cellAInfo.colIndex, endRowIndex:cellAInfo.rowIndex + cellAInfo.rowSpan - 1, endColIndex:cellAInfo.colIndex + cellAInfo.colSpan - 1};
                }
                var cellBInfo = me.getCellInfo(cellB);
                var beginRowIndex = Math.min(cellAInfo.rowIndex, cellBInfo.rowIndex), beginColIndex = Math.min(cellAInfo.colIndex, cellBInfo.colIndex), endRowIndex = Math.max(cellAInfo.rowIndex + cellAInfo.rowSpan - 1, cellBInfo.rowIndex + cellBInfo.rowSpan - 1), endColIndex = Math.max(cellAInfo.colIndex + cellAInfo.colSpan - 1, cellBInfo.colIndex + cellBInfo.colSpan - 1);
                return checkRange(beginRowIndex, beginColIndex, endRowIndex, endColIndex);
            }
            catch (e) {
            }
        }, getCells:function (range) {
            this.clearSelected();
            var beginRowIndex = range.beginRowIndex, beginColIndex = range.beginColIndex, endRowIndex = range.endRowIndex, endColIndex = range.endColIndex, cellInfo, rowIndex, colIndex, tdHash = {}, returnTds = [];
            for (var i = beginRowIndex; i <= endRowIndex; i++) {
                for (var j = beginColIndex; j <= endColIndex; j++) {
                    cellInfo = this.indexTable[i][j];
                    rowIndex = cellInfo.rowIndex;
                    colIndex = cellInfo.colIndex;
                    var key = rowIndex + "|" + colIndex;
                    if (tdHash[key]) {
                        continue;
                    }
                    tdHash[key] = 1;
                    if (rowIndex < i || colIndex < j || rowIndex + cellInfo.rowSpan - 1 > endRowIndex || colIndex + cellInfo.colSpan - 1 > endColIndex) {
                        return null;
                    }
                    returnTds.push(this.getCell(rowIndex, cellInfo.cellIndex));
                }
            }
            return returnTds;
        }, clearSelected:function () {
            UETable.removeSelectedClass(this.selectedTds);
            this.selectedTds = [];
            this.cellsRange = {};
        }, setSelected:function (range) {
            var cells = this.getCells(range);
            UETable.addSelectedClass(cells);
            this.selectedTds = cells;
            this.cellsRange = range;
        }, isFullRow:function () {
            var range = this.cellsRange;
            return (range.endColIndex - range.beginColIndex + 1) == this.colsNum;
        }, isFullCol:function () {
            var range = this.cellsRange, table = this.table, ths = table.getElementsByTagName("th"), rows = range.endRowIndex - range.beginRowIndex + 1;
            return !ths.length ? rows == this.rowsNum : rows == this.rowsNum || (rows == this.rowsNum - 1);
        }, getNextCell:function (cell, bottom, ignoreRange) {
            try {
                var cellInfo = this.getCellInfo(cell), nextRowIndex, nextColIndex;
                var len = this.selectedTds.length && !ignoreRange, range = this.cellsRange;
                if ((!bottom && (cellInfo.rowIndex == 0)) || (bottom && (!len ? (cellInfo.rowIndex + cellInfo.rowSpan > this.rowsNum - 1) : (range.endRowIndex == this.rowsNum - 1)))) {
                    return null;
                }
                nextRowIndex = !bottom ? (!len ? cellInfo.rowIndex - 1 : range.beginRowIndex - 1) : (!len ? (cellInfo.rowIndex + cellInfo.rowSpan) : range.endRowIndex + 1);
                nextColIndex = !len ? cellInfo.colIndex : range.beginColIndex;
                return this.getCell(this.indexTable[nextRowIndex][nextColIndex].rowIndex, this.indexTable[nextRowIndex][nextColIndex].cellIndex);
            }
            catch (e) {
                showError(e);
            }
        }, getPreviewCell:function (cell, top) {
            try {
                var cellInfo = this.getCellInfo(cell), previewRowIndex, previewColIndex;
                var len = this.selectedTds.length, range = this.cellsRange;
                if ((!top && (!len ? !cellInfo.colIndex : !range.beginColIndex)) || (top && (!len ? (cellInfo.rowIndex > (this.colsNum - 1)) : (range.endColIndex == this.colsNum - 1)))) {
                    return null;
                }
                previewRowIndex = !top ? (!len ? cellInfo.rowIndex : range.beginRowIndex) : (!len ? (cellInfo.rowIndex < 1 ? 0 : (cellInfo.rowIndex - 1)) : range.beginRowIndex);
                previewColIndex = !top ? (!len ? (cellInfo.colIndex < 1 ? 0 : (cellInfo.colIndex - 1)) : range.beginColIndex - 1) : (!len ? cellInfo.colIndex : range.endColIndex + 1);
                return this.getCell(this.indexTable[previewRowIndex][previewColIndex].rowIndex, this.indexTable[previewRowIndex][previewColIndex].cellIndex);
            }
            catch (e) {
                showError(e);
            }
        }, moveContent:function (cellTo, cellFrom) {
            if (UETable.isEmptyBlock(cellFrom)) {
                return;
            }
            if (UETable.isEmptyBlock(cellTo)) {
                cellTo.innerHTML = cellFrom.innerHTML;
                return;
            }
            var child = cellTo.lastChild;
            if (child.nodeType == 3 || !dtd.$block[child.tagName]) {
                cellTo.appendChild(cellTo.ownerDocument.createElement("br"));
            }
            while (child = cellFrom.firstChild) {
                cellTo.appendChild(child);
            }
        }, mergeRight:function (cell) {
            var cellInfo = this.getCellInfo(cell), rightColIndex = cellInfo.colIndex + cellInfo.colSpan, rightCellInfo = this.indexTable[cellInfo.rowIndex][rightColIndex], rightCell = this.getCell(rightCellInfo.rowIndex, rightCellInfo.cellIndex);
            cell.colSpan = cellInfo.colSpan + rightCellInfo.colSpan;
            cell.removeAttribute("width");
            this.moveContent(cell, rightCell);
            this.deleteCell(rightCell, rightCellInfo.rowIndex);
            this.update();
        }, mergeDown:function (cell) {
            var cellInfo = this.getCellInfo(cell), downRowIndex = cellInfo.rowIndex + cellInfo.rowSpan, downCellInfo = this.indexTable[downRowIndex][cellInfo.colIndex], downCell = this.getCell(downCellInfo.rowIndex, downCellInfo.cellIndex);
            cell.rowSpan = cellInfo.rowSpan + downCellInfo.rowSpan;
            cell.removeAttribute("height");
            this.moveContent(cell, downCell);
            this.deleteCell(downCell, downCellInfo.rowIndex);
            this.update();
        }, mergeRange:function () {
            var range = this.cellsRange, leftTopCell = this.getCell(range.beginRowIndex, this.indexTable[range.beginRowIndex][range.beginColIndex].cellIndex);
            if (leftTopCell.tagName == "TH" && range.endRowIndex !== range.beginRowIndex) {
                var index = this.indexTable, info = this.getCellInfo(leftTopCell);
                leftTopCell = this.getCell(1, index[1][info.colIndex].cellIndex);
                range = this.getCellsRange(leftTopCell, this.getCell(index[this.rowsNum - 1][info.colIndex].rowIndex, index[this.rowsNum - 1][info.colIndex].cellIndex));
            }
            var cells = this.getCells(range);
            for (var i = 0, ci; ci = cells[i++]; ) {
                if (ci !== leftTopCell) {
                    this.moveContent(leftTopCell, ci);
                    this.deleteCell(ci);
                }
            }
            leftTopCell.rowSpan = range.endRowIndex - range.beginRowIndex + 1;
            leftTopCell.rowSpan > 1 && leftTopCell.removeAttribute("height");
            leftTopCell.colSpan = range.endColIndex - range.beginColIndex + 1;
            leftTopCell.colSpan > 1 && leftTopCell.removeAttribute("width");
            if (leftTopCell.rowSpan == this.rowsNum && leftTopCell.colSpan != 1) {
                leftTopCell.colSpan = 1;
            }
            if (leftTopCell.colSpan == this.colsNum && leftTopCell.rowSpan != 1) {
                var rowIndex = leftTopCell.parentNode.rowIndex;
                if (this.table.deleteRow) {
                    for (var i = rowIndex + 1, curIndex = rowIndex + 1, len = leftTopCell.rowSpan; i < len; i++) {
                        this.table.deleteRow(curIndex);
                    }
                } else {
                    for (var i = 0, len = leftTopCell.rowSpan - 1; i < len; i++) {
                        var row = this.table.rows[rowIndex + 1];
                        row.parentNode.removeChild(row);
                    }
                }
                leftTopCell.rowSpan = 1;
            }
            this.update();
        }, insertRow:function (rowIndex, sourceCell) {
            var numCols = this.colsNum, table = this.table, row = table.insertRow(rowIndex), cell, isInsertTitle = typeof sourceCell == "string" && sourceCell.toUpperCase() == "TH";
            function replaceTdToTh(colIndex, cell, tableRow) {
                if (colIndex == 0) {
                    var tr = tableRow.nextSibling || tableRow.previousSibling, th = tr.cells[colIndex];
                    if (th.tagName == "TH") {
                        th = cell.ownerDocument.createElement("th");
                        th.appendChild(cell.firstChild);
                        tableRow.insertBefore(th, cell);
                        domUtils.remove(cell);
                    }
                } else {
                    if (cell.tagName == "TH") {
                        var td = cell.ownerDocument.createElement("td");
                        td.appendChild(cell.firstChild);
                        tableRow.insertBefore(td, cell);
                        domUtils.remove(cell);
                    }
                }
            }
            if (rowIndex == 0 || rowIndex == this.rowsNum) {
                for (var colIndex = 0; colIndex < numCols; colIndex++) {
                    cell = this.cloneCell(sourceCell, true);
                    this.setCellContent(cell);
                    cell.getAttribute("vAlign") && cell.setAttribute("vAlign", cell.getAttribute("vAlign"));
                    row.appendChild(cell);
                    if (!isInsertTitle) {
                        replaceTdToTh(colIndex, cell, row);
                    }
                }
            } else {
                var infoRow = this.indexTable[rowIndex], cellIndex = 0;
                for (colIndex = 0; colIndex < numCols; colIndex++) {
                    var cellInfo = infoRow[colIndex];
                    if (cellInfo.rowIndex < rowIndex) {
                        cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
                        cell.rowSpan = cellInfo.rowSpan + 1;
                    } else {
                        cell = this.cloneCell(sourceCell, true);
                        this.setCellContent(cell);
                        row.appendChild(cell);
                    }
                    if (!isInsertTitle) {
                        replaceTdToTh(colIndex, cell, row);
                    }
                }
            }
            this.update();
            return row;
        }, deleteRow:function (rowIndex) {
            var row = this.table.rows[rowIndex], infoRow = this.indexTable[rowIndex], colsNum = this.colsNum, count = 0;
            for (var colIndex = 0; colIndex < colsNum; ) {
                var cellInfo = infoRow[colIndex], cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
                if (cell.rowSpan > 1) {
                    if (cellInfo.rowIndex == rowIndex) {
                        var clone = cell.cloneNode(true);
                        clone.rowSpan = cell.rowSpan - 1;
                        clone.innerHTML = "";
                        cell.rowSpan = 1;
                        var nextRowIndex = rowIndex + 1, nextRow = this.table.rows[nextRowIndex], insertCellIndex, preMerged = this.getPreviewMergedCellsNum(nextRowIndex, colIndex) - count;
                        if (preMerged < colIndex) {
                            insertCellIndex = colIndex - preMerged - 1;
                            domUtils.insertAfter(nextRow.cells[insertCellIndex], clone);
                        } else {
                            if (nextRow.cells.length) {
                                nextRow.insertBefore(clone, nextRow.cells[0]);
                            }
                        }
                        count += 1;
                    }
                }
                colIndex += cell.colSpan || 1;
            }
            var deleteTds = [], cacheMap = {};
            for (colIndex = 0; colIndex < colsNum; colIndex++) {
                var tmpRowIndex = infoRow[colIndex].rowIndex, tmpCellIndex = infoRow[colIndex].cellIndex, key = tmpRowIndex + "_" + tmpCellIndex;
                if (cacheMap[key]) {
                    continue;
                }
                cacheMap[key] = 1;
                cell = this.getCell(tmpRowIndex, tmpCellIndex);
                deleteTds.push(cell);
            }
            var mergeTds = [];
            utils.each(deleteTds, function (td) {
                if (td.rowSpan == 1) {
                    td.parentNode.removeChild(td);
                } else {
                    mergeTds.push(td);
                }
            });
            utils.each(mergeTds, function (td) {
                td.rowSpan--;
            });
            row.parentNode.removeChild(row);
            this.update();
        }, insertCol:function (colIndex, sourceCell, defaultValue) {
            var rowsNum = this.rowsNum, rowIndex = 0, tableRow, cell, backWidth = parseInt((this.table.offsetWidth - (this.colsNum + 1) * 20 - (this.colsNum + 1)) / (this.colsNum + 1), 10), isInsertTitleCol = typeof sourceCell == "string" && sourceCell.toUpperCase() == "TH";
            function replaceTdToTh(rowIndex, cell, tableRow) {
                if (rowIndex == 0) {
                    var th = cell.nextSibling || cell.previousSibling;
                    if (th.tagName == "TH") {
                        th = cell.ownerDocument.createElement("th");
                        th.appendChild(cell.firstChild);
                        tableRow.insertBefore(th, cell);
                        domUtils.remove(cell);
                    }
                } else {
                    if (cell.tagName == "TH") {
                        var td = cell.ownerDocument.createElement("td");
                        td.appendChild(cell.firstChild);
                        tableRow.insertBefore(td, cell);
                        domUtils.remove(cell);
                    }
                }
            }
            var preCell;
            if (colIndex == 0 || colIndex == this.colsNum) {
                for (; rowIndex < rowsNum; rowIndex++) {
                    tableRow = this.table.rows[rowIndex];
                    preCell = tableRow.cells[colIndex == 0 ? colIndex : tableRow.cells.length];
                    cell = this.cloneCell(sourceCell, true);
                    this.setCellContent(cell);
                    cell.setAttribute("vAlign", cell.getAttribute("vAlign"));
                    preCell && cell.setAttribute("width", preCell.getAttribute("width"));
                    if (!colIndex) {
                        tableRow.insertBefore(cell, tableRow.cells[0]);
                    } else {
                        domUtils.insertAfter(tableRow.cells[tableRow.cells.length - 1], cell);
                    }
                    if (!isInsertTitleCol) {
                        replaceTdToTh(rowIndex, cell, tableRow);
                    }
                }
            } else {
                for (; rowIndex < rowsNum; rowIndex++) {
                    var cellInfo = this.indexTable[rowIndex][colIndex];
                    if (cellInfo.colIndex < colIndex) {
                        cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
                        cell.colSpan = cellInfo.colSpan + 1;
                    } else {
                        tableRow = this.table.rows[rowIndex];
                        preCell = tableRow.cells[cellInfo.cellIndex];
                        cell = this.cloneCell(sourceCell, true);
                        this.setCellContent(cell);
                        cell.setAttribute("vAlign", cell.getAttribute("vAlign"));
                        preCell && cell.setAttribute("width", preCell.getAttribute("width"));
                        preCell ? tableRow.insertBefore(cell, preCell) : tableRow.appendChild(cell);
                    }
                    if (!isInsertTitleCol) {
                        replaceTdToTh(rowIndex, cell, tableRow);
                    }
                }
            }
            this.update();
            this.updateWidth(backWidth, defaultValue || {tdPadding:10, tdBorder:1});
        }, updateWidth:function (width, defaultValue) {
            var table = this.table, tmpWidth = UETable.getWidth(table) - defaultValue.tdPadding * 2 - defaultValue.tdBorder + width;
            if (tmpWidth < table.ownerDocument.body.offsetWidth) {
                table.setAttribute("width", tmpWidth);
                return;
            }
            var tds = domUtils.getElementsByTagName(this.table, "td th");
            utils.each(tds, function (td) {
                td.setAttribute("width", width);
            });
        }, deleteCol:function (colIndex) {
            var indexTable = this.indexTable, tableRows = this.table.rows, backTableWidth = this.table.getAttribute("width"), backTdWidth = 0, rowsNum = this.rowsNum, cacheMap = {};
            for (var rowIndex = 0; rowIndex < rowsNum; ) {
                var infoRow = indexTable[rowIndex], cellInfo = infoRow[colIndex], key = cellInfo.rowIndex + "_" + cellInfo.colIndex;
                if (cacheMap[key]) {
                    continue;
                }
                cacheMap[key] = 1;
                var cell = this.getCell(cellInfo.rowIndex, cellInfo.cellIndex);
                if (!backTdWidth) {
                    backTdWidth = cell && parseInt(cell.offsetWidth / cell.colSpan, 10).toFixed(0);
                }
                if (cell.colSpan > 1) {
                    cell.colSpan--;
                } else {
                    tableRows[rowIndex].deleteCell(cellInfo.cellIndex);
                }
                rowIndex += cellInfo.rowSpan || 1;
            }
            this.table.setAttribute("width", backTableWidth - backTdWidth);
            this.update();
        }, splitToCells:function (cell) {
            var me = this, cells = this.splitToRows(cell);
            utils.each(cells, function (cell) {
                me.splitToCols(cell);
            });
        }, splitToRows:function (cell) {
            var cellInfo = this.getCellInfo(cell), rowIndex = cellInfo.rowIndex, colIndex = cellInfo.colIndex, results = [];
            cell.rowSpan = 1;
            results.push(cell);
            for (var i = rowIndex, endRow = rowIndex + cellInfo.rowSpan; i < endRow; i++) {
                if (i == rowIndex) {
                    continue;
                }
                var tableRow = this.table.rows[i], tmpCell = tableRow.insertCell(colIndex - this.getPreviewMergedCellsNum(i, colIndex));
                tmpCell.colSpan = cellInfo.colSpan;
                this.setCellContent(tmpCell);
                tmpCell.setAttribute("vAlign", cell.getAttribute("vAlign"));
                tmpCell.setAttribute("align", cell.getAttribute("align"));
                if (cell.style.cssText) {
                    tmpCell.style.cssText = cell.style.cssText;
                }
                results.push(tmpCell);
            }
            this.update();
            return results;
        }, getPreviewMergedCellsNum:function (rowIndex, colIndex) {
            var indexRow = this.indexTable[rowIndex], num = 0;
            for (var i = 0; i < colIndex; ) {
                var colSpan = indexRow[i].colSpan, tmpRowIndex = indexRow[i].rowIndex;
                num += (colSpan - (tmpRowIndex == rowIndex ? 1 : 0));
                i += colSpan;
            }
            return num;
        }, splitToCols:function (cell) {
            var backWidth = (cell.offsetWidth / cell.colSpan - 22).toFixed(0), cellInfo = this.getCellInfo(cell), rowIndex = cellInfo.rowIndex, colIndex = cellInfo.colIndex, results = [];
            cell.colSpan = 1;
            cell.setAttribute("width", backWidth);
            results.push(cell);
            for (var j = colIndex, endCol = colIndex + cellInfo.colSpan; j < endCol; j++) {
                if (j == colIndex) {
                    continue;
                }
                var tableRow = this.table.rows[rowIndex], tmpCell = tableRow.insertCell(this.indexTable[rowIndex][j].cellIndex + 1);
                tmpCell.rowSpan = cellInfo.rowSpan;
                this.setCellContent(tmpCell);
                tmpCell.setAttribute("vAlign", cell.getAttribute("vAlign"));
                tmpCell.setAttribute("align", cell.getAttribute("align"));
                tmpCell.setAttribute("width", backWidth);
                if (cell.style.cssText) {
                    tmpCell.style.cssText = cell.style.cssText;
                }
                if (cell.tagName == "TH") {
                    var th = cell.ownerDocument.createElement("th");
                    th.appendChild(tmpCell.firstChild);
                    th.setAttribute("vAlign", cell.getAttribute("vAlign"));
                    th.rowSpan = tmpCell.rowSpan;
                    tableRow.insertBefore(th, tmpCell);
                    domUtils.remove(tmpCell);
                }
                results.push(tmpCell);
            }
            this.update();
            return results;
        }, isLastCell:function (cell, rowsNum, colsNum) {
            rowsNum = rowsNum || this.rowsNum;
            colsNum = colsNum || this.colsNum;
            var cellInfo = this.getCellInfo(cell);
            return ((cellInfo.rowIndex + cellInfo.rowSpan) == rowsNum) && ((cellInfo.colIndex + cellInfo.colSpan) == colsNum);
        }, getLastCell:function (cells) {
            cells = cells || this.table.getElementsByTagName("td");
            var firstInfo = this.getCellInfo(cells[0]);
            var me = this, last = cells[0], tr = last.parentNode, cellsNum = 0, cols = 0, rows;
            utils.each(cells, function (cell) {
                if (cell.parentNode == tr) {
                    cols += cell.colSpan || 1;
                }
                cellsNum += cell.rowSpan * cell.colSpan || 1;
            });
            rows = cellsNum / cols;
            utils.each(cells, function (cell) {
                if (me.isLastCell(cell, rows, cols)) {
                    last = cell;
                    return false;
                }
            });
            return last;
        }, selectRow:function (rowIndex) {
            var indexRow = this.indexTable[rowIndex], start = this.getCell(indexRow[0].rowIndex, indexRow[0].cellIndex), end = this.getCell(indexRow[this.colsNum - 1].rowIndex, indexRow[this.colsNum - 1].cellIndex), range = this.getCellsRange(start, end);
            this.setSelected(range);
        }, selectTable:function () {
            var tds = this.table.getElementsByTagName("td"), range = this.getCellsRange(tds[0], tds[tds.length - 1]);
            this.setSelected(range);
        }, setBackground:function (cells, value) {
            if (typeof value === "string") {
                utils.each(cells, function (cell) {
                    cell.style.backgroundColor = value;
                });
            } else {
                if (typeof value === "object") {
                    value = utils.extend({repeat:true, colorList:["#ddd", "#fff"]}, value);
                    var rowIndex = this.getCellInfo(cells[0]).rowIndex, count = 0, colors = value.colorList, getColor = function (list, index, repeat) {
                        return list[index] ? list[index] : repeat ? list[index % list.length] : "";
                    };
                    for (var i = 0, cell; cell = cells[i++]; ) {
                        var cellInfo = this.getCellInfo(cell);
                        cell.style.backgroundColor = getColor(colors, ((rowIndex + count) == cellInfo.rowIndex) ? count : ++count, value.repeat);
                    }
                }
            }
        }, removeBackground:function (cells) {
            utils.each(cells, function (cell) {
                cell.style.backgroundColor = "";
            });
        }};
        function showError(e) {
        }
    })();
    (function () {
        var UT = UE.UETable, getTableItemsByRange = function (editor) {
            return UT.getTableItemsByRange(editor);
        }, getUETableBySelected = function (editor) {
            return UT.getUETableBySelected(editor);
        }, getDefaultValue = function (editor, table) {
            return UT.getDefaultValue(editor, table);
        }, getUETable = function (tdOrTable) {
            return UT.getUETable(tdOrTable);
        };
        UE.commands["inserttable"] = {queryCommandState:function () {
            return getTableItemsByRange(this).table ? -1 : 0;
        }, execCommand:function (cmd, opt) {
            function createTable(opt, tdWidth) {
                var html = [], rowsNum = opt.numRows, colsNum = opt.numCols;
                for (var r = 0; r < rowsNum; r++) {
                    html.push("<tr>");
                    for (var c = 0; c < colsNum; c++) {
                        html.push("<td width=\"" + tdWidth + "\"  vAlign=\"" + opt.tdvalign + "\" >" + (browser.ie ? domUtils.fillChar : "<br/>") + "</td>");
                    }
                    html.push("</tr>");
                }
                return "<table><tbody>" + html.join("") + "</tbody></table>";
            }
            if (!opt) {
                opt = utils.extend({}, {numCols:this.options.defaultCols, numRows:this.options.defaultRows, tdvalign:this.options.tdvalign});
            }
            var me = this;
            var range = this.selection.getRange(), start = range.startContainer, firstParentBlock = domUtils.findParent(start, function (node) {
                return domUtils.isBlockElm(node);
            }, true) || me.body;
            var defaultValue = getDefaultValue(me), tableWidth = firstParentBlock.offsetWidth, tdWidth = Math.floor(tableWidth / opt.numCols - defaultValue.tdPadding * 2 - defaultValue.tdBorder);
            !opt.tdvalign && (opt.tdvalign = me.options.tdvalign);
            me.execCommand("inserthtml", createTable(opt, tdWidth));
        }};
        UE.commands["insertparagraphbeforetable"] = {queryCommandState:function () {
            return getTableItemsByRange(this).cell ? 0 : -1;
        }, execCommand:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                var p = this.document.createElement("p");
                p.innerHTML = browser.ie ? "&nbsp;" : "<br />";
                table.parentNode.insertBefore(p, table);
                this.selection.getRange().setStart(p, 0).setCursor();
            }
        }};
        UE.commands["deletetable"] = {queryCommandState:function () {
            var rng = this.selection.getRange();
            return domUtils.findParentByTagName(rng.startContainer, "table", true) ? 0 : -1;
        }, execCommand:function (cmd, table) {
            var rng = this.selection.getRange();
            table = table || domUtils.findParentByTagName(rng.startContainer, "table", true);
            if (table) {
                var next = table.nextSibling;
                if (!next) {
                    next = domUtils.createElement(this.document, "p", {"innerHTML":browser.ie ? domUtils.fillChar : "<br/>"});
                    table.parentNode.insertBefore(next, table);
                }
                domUtils.remove(table);
                rng = this.selection.getRange();
                if (next.nodeType == 3) {
                    rng.setStartBefore(next);
                } else {
                    rng.setStart(next, 0);
                }
                rng.setCursor(false, true);
                this.fireEvent("tablehasdeleted");
            }
        }};
        UE.commands["cellalign"] = {queryCommandState:function () {
            return getSelectedArr(this).length ? 0 : -1;
        }, execCommand:function (cmd, align) {
            var selectedTds = getSelectedArr(this);
            if (selectedTds.length) {
                for (var i = 0, ci; ci = selectedTds[i++]; ) {
                    ci.setAttribute("align", align);
                }
            }
        }};
        UE.commands["cellvalign"] = {queryCommandState:function () {
            return getSelectedArr(this).length ? 0 : -1;
        }, execCommand:function (cmd, valign) {
            var selectedTds = getSelectedArr(this);
            if (selectedTds.length) {
                for (var i = 0, ci; ci = selectedTds[i++]; ) {
                    ci.setAttribute("vAlign", valign);
                }
            }
        }};
        UE.commands["insertcaption"] = {queryCommandState:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                return table.getElementsByTagName("caption").length == 0 ? 1 : -1;
            }
            return -1;
        }, execCommand:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                var caption = this.document.createElement("caption");
                caption.innerHTML = browser.ie ? domUtils.fillChar : "<br/>";
                table.insertBefore(caption, table.firstChild);
                var range = this.selection.getRange();
                range.setStart(caption, 0).setCursor();
            }
        }};
        UE.commands["deletecaption"] = {queryCommandState:function () {
            var rng = this.selection.getRange(), table = domUtils.findParentByTagName(rng.startContainer, "table");
            if (table) {
                return table.getElementsByTagName("caption").length == 0 ? -1 : 1;
            }
            return -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), table = domUtils.findParentByTagName(rng.startContainer, "table");
            if (table) {
                domUtils.remove(table.getElementsByTagName("caption")[0]);
                var range = this.selection.getRange();
                range.setStart(table.rows[0].cells[0], 0).setCursor();
            }
        }};
        UE.commands["inserttitle"] = {queryCommandState:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                var firstRow = table.rows[0];
                return firstRow.cells[firstRow.cells.length - 1].tagName.toLowerCase() != "th" ? 0 : -1;
            }
            return -1;
        }, execCommand:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                getUETable(table).insertRow(0, "th");
            }
            var th = table.getElementsByTagName("th")[0];
            this.selection.getRange().setStart(th, 0).setCursor(false, true);
        }};
        UE.commands["deletetitle"] = {queryCommandState:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                var firstRow = table.rows[0];
                return firstRow.cells[firstRow.cells.length - 1].tagName.toLowerCase() == "th" ? 0 : -1;
            }
            return -1;
        }, execCommand:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                domUtils.remove(table.rows[0]);
            }
            var td = table.getElementsByTagName("td")[0];
            this.selection.getRange().setStart(td, 0).setCursor(false, true);
        }};
        UE.commands["inserttitlecol"] = {queryCommandState:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                var lastRow = table.rows[table.rows.length - 1];
                return lastRow.getElementsByTagName("th").length ? -1 : 0;
            }
            return -1;
        }, execCommand:function (cmd) {
            var table = getTableItemsByRange(this).table;
            if (table) {
                getUETable(table).insertCol(0, "th");
            }
            resetTdWidth(table, this);
            var th = table.getElementsByTagName("th")[0];
            this.selection.getRange().setStart(th, 0).setCursor(false, true);
        }};
        UE.commands["deletetitlecol"] = {queryCommandState:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                var lastRow = table.rows[table.rows.length - 1];
                return lastRow.getElementsByTagName("th").length ? 0 : -1;
            }
            return -1;
        }, execCommand:function () {
            var table = getTableItemsByRange(this).table;
            if (table) {
                for (var i = 0; i < table.rows.length; i++) {
                    domUtils.remove(table.rows[i].children[0]);
                }
            }
            resetTdWidth(table, this);
            var td = table.getElementsByTagName("td")[0];
            this.selection.getRange().setStart(td, 0).setCursor(false, true);
        }};
        UE.commands["mergeright"] = {queryCommandState:function (cmd) {
            var tableItems = getTableItemsByRange(this);
            if (!tableItems.cell) {
                return -1;
            }
            var ut = getUETable(tableItems.table);
            if (ut.selectedTds.length) {
                return -1;
            }
            var cellInfo = ut.getCellInfo(tableItems.cell), rightColIndex = cellInfo.colIndex + cellInfo.colSpan;
            if (rightColIndex >= ut.colsNum) {
                return -1;
            }
            var rightCellInfo = ut.indexTable[cellInfo.rowIndex][rightColIndex];
            return (rightCellInfo.rowIndex == cellInfo.rowIndex && rightCellInfo.rowSpan == cellInfo.rowSpan) ? 0 : -1;
        }, execCommand:function (cmd) {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell);
            ut.mergeRight(cell);
            rng.moveToBookmark(bk).select();
        }};
        UE.commands["mergedown"] = {queryCommandState:function (cmd) {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            if (!cell || cell.tagName == "TH") {
                return -1;
            }
            var ut = getUETable(tableItems.table);
            if (ut.selectedTds.length) {
                return -1;
            }
            var cellInfo = ut.getCellInfo(tableItems.cell), downRowIndex = cellInfo.rowIndex + cellInfo.rowSpan;
            if (downRowIndex >= ut.rowsNum) {
                return -1;
            }
            var downCellInfo = ut.indexTable[downRowIndex][cellInfo.colIndex];
            return (downCellInfo.colIndex == cellInfo.colIndex && downCellInfo.colSpan == cellInfo.colSpan) && tableItems.cell.tagName !== "TH" ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell);
            ut.mergeDown(cell);
            rng.moveToBookmark(bk).select();
        }};
        UE.commands["mergecells"] = {queryCommandState:function () {
            return getUETableBySelected(this) ? 0 : -1;
        }, execCommand:function () {
            var ut = getUETableBySelected(this);
            if (ut && ut.selectedTds.length) {
                var cell = ut.selectedTds[0];
                ut.mergeRange();
                var rng = this.selection.getRange();
                if (domUtils.isEmptyBlock(cell)) {
                    rng.setStart(cell, 0).collapse(true);
                } else {
                    rng.selectNodeContents(cell);
                }
                rng.select();
            }
        }};
        UE.commands["insertrow"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            return cell && (cell.tagName == "TD" || (cell.tagName == "TH" && tableItems.tr !== tableItems.table.rows[0])) && getUETable(tableItems.table).rowsNum < this.options.maxRowNum ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell, table = tableItems.table, ut = getUETable(table), cellInfo = ut.getCellInfo(cell);
            if (!ut.selectedTds.length) {
                ut.insertRow(cellInfo.rowIndex, cell);
            } else {
                var range = ut.cellsRange;
                for (var i = 0, len = range.endRowIndex - range.beginRowIndex + 1; i < len; i++) {
                    ut.insertRow(range.beginRowIndex, cell);
                }
            }
            rng.moveToBookmark(bk).select();
            if (table.getAttribute("interlaced") === "enabled") {
                this.fireEvent("interlacetable", table);
            }
        }};
        UE.commands["insertrownext"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            return cell && (cell.tagName == "TD") && getUETable(tableItems.table).rowsNum < this.options.maxRowNum ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell, table = tableItems.table, ut = getUETable(table), cellInfo = ut.getCellInfo(cell);
            if (!ut.selectedTds.length) {
                ut.insertRow(cellInfo.rowIndex + cellInfo.rowSpan, cell);
            } else {
                var range = ut.cellsRange;
                for (var i = 0, len = range.endRowIndex - range.beginRowIndex + 1; i < len; i++) {
                    ut.insertRow(range.endRowIndex + 1, cell);
                }
            }
            rng.moveToBookmark(bk).select();
            if (table.getAttribute("interlaced") === "enabled") {
                this.fireEvent("interlacetable", table);
            }
        }};
        UE.commands["deleterow"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this);
            if (!tableItems.cell) {
                return -1;
            }
        }, execCommand:function () {
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell), cellsRange = ut.cellsRange, cellInfo = ut.getCellInfo(cell), preCell = ut.getVSideCell(cell), nextCell = ut.getVSideCell(cell, true), rng = this.selection.getRange();
            if (utils.isEmptyObject(cellsRange)) {
                ut.deleteRow(cellInfo.rowIndex);
            } else {
                for (var i = cellsRange.beginRowIndex; i < cellsRange.endRowIndex + 1; i++) {
                    ut.deleteRow(cellsRange.beginRowIndex);
                }
            }
            var table = ut.table;
            if (!table.getElementsByTagName("td").length) {
                var nextSibling = table.nextSibling;
                domUtils.remove(table);
                if (nextSibling) {
                    rng.setStart(nextSibling, 0).setCursor(false, true);
                }
            } else {
                if (cellInfo.rowSpan == 1 || cellInfo.rowSpan == cellsRange.endRowIndex - cellsRange.beginRowIndex + 1) {
                    if (nextCell || preCell) {
                        rng.selectNodeContents(nextCell || preCell).setCursor(false, true);
                    }
                } else {
                    var newCell = ut.getCell(cellInfo.rowIndex, ut.indexTable[cellInfo.rowIndex][cellInfo.colIndex].cellIndex);
                    if (newCell) {
                        rng.selectNodeContents(newCell).setCursor(false, true);
                    }
                }
            }
            if (table.getAttribute("interlaced") === "enabled") {
                this.fireEvent("interlacetable", table);
            }
        }};
        UE.commands["insertcol"] = {queryCommandState:function (cmd) {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            return cell && (cell.tagName == "TD" || (cell.tagName == "TH" && cell !== tableItems.tr.cells[0])) && getUETable(tableItems.table).colsNum < this.options.maxColNum ? 0 : -1;
        }, execCommand:function (cmd) {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            if (this.queryCommandState(cmd) == -1) {
                return;
            }
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell), cellInfo = ut.getCellInfo(cell);
            if (!ut.selectedTds.length) {
                ut.insertCol(cellInfo.colIndex, cell);
            } else {
                var range = ut.cellsRange;
                for (var i = 0, len = range.endColIndex - range.beginColIndex + 1; i < len; i++) {
                    ut.insertCol(range.beginColIndex, cell);
                }
            }
            rng.moveToBookmark(bk).select(true);
        }};
        UE.commands["insertcolnext"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            return cell && getUETable(tableItems.table).colsNum < this.options.maxColNum ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell), cellInfo = ut.getCellInfo(cell);
            if (!ut.selectedTds.length) {
                ut.insertCol(cellInfo.colIndex + cellInfo.colSpan, cell);
            } else {
                var range = ut.cellsRange;
                for (var i = 0, len = range.endColIndex - range.beginColIndex + 1; i < len; i++) {
                    ut.insertCol(range.endColIndex + 1, cell);
                }
            }
            rng.moveToBookmark(bk).select();
        }};
        UE.commands["deletecol"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this);
            if (!tableItems.cell) {
                return -1;
            }
        }, execCommand:function () {
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell), range = ut.cellsRange, cellInfo = ut.getCellInfo(cell), preCell = ut.getHSideCell(cell), nextCell = ut.getHSideCell(cell, true);
            if (utils.isEmptyObject(range)) {
                ut.deleteCol(cellInfo.colIndex);
            } else {
                for (var i = range.beginColIndex; i < range.endColIndex + 1; i++) {
                    ut.deleteCol(range.beginColIndex);
                }
            }
            var table = ut.table, rng = this.selection.getRange();
            if (!table.getElementsByTagName("td").length) {
                var nextSibling = table.nextSibling;
                domUtils.remove(table);
                if (nextSibling) {
                    rng.setStart(nextSibling, 0).setCursor(false, true);
                }
            } else {
                if (domUtils.inDoc(cell, this.document)) {
                    rng.setStart(cell, 0).setCursor(false, true);
                } else {
                    if (nextCell && domUtils.inDoc(nextCell, this.document)) {
                        rng.selectNodeContents(nextCell).setCursor(false, true);
                    } else {
                        if (preCell && domUtils.inDoc(preCell, this.document)) {
                            rng.selectNodeContents(preCell).setCursor(true, true);
                        }
                    }
                }
            }
        }};
        UE.commands["splittocells"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            if (!cell) {
                return -1;
            }
            var ut = getUETable(tableItems.table);
            if (ut.selectedTds.length > 0) {
                return -1;
            }
            return cell && (cell.colSpan > 1 || cell.rowSpan > 1) ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell);
            ut.splitToCells(cell);
            rng.moveToBookmark(bk).select();
        }};
        UE.commands["splittorows"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            if (!cell) {
                return -1;
            }
            var ut = getUETable(tableItems.table);
            if (ut.selectedTds.length > 0) {
                return -1;
            }
            return cell && cell.rowSpan > 1 ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell);
            ut.splitToRows(cell);
            rng.moveToBookmark(bk).select();
        }};
        UE.commands["splittocols"] = {queryCommandState:function () {
            var tableItems = getTableItemsByRange(this), cell = tableItems.cell;
            if (!cell) {
                return -1;
            }
            var ut = getUETable(tableItems.table);
            if (ut.selectedTds.length > 0) {
                return -1;
            }
            return cell && cell.colSpan > 1 ? 0 : -1;
        }, execCommand:function () {
            var rng = this.selection.getRange(), bk = rng.createBookmark(true);
            var cell = getTableItemsByRange(this).cell, ut = getUETable(cell);
            ut.splitToCols(cell);
            rng.moveToBookmark(bk).select();
        }};
        UE.commands["adaptbytext"] = UE.commands["adaptbywindow"] = {queryCommandState:function () {
            return getTableItemsByRange(this).table ? 0 : -1;
        }, execCommand:function (cmd) {
            var tableItems = getTableItemsByRange(this), table = tableItems.table;
            if (table) {
                if (cmd == "adaptbywindow") {
                    resetTdWidth(table, this);
                } else {
                    var cells = domUtils.getElementsByTagName(table, "td th");
                    utils.each(cells, function (cell) {
                        cell.removeAttribute("width");
                    });
                    table.removeAttribute("width");
                }
            }
        }};
        UE.commands["averagedistributecol"] = {queryCommandState:function () {
            var ut = getUETableBySelected(this);
            if (!ut) {
                return -1;
            }
            return ut.isFullRow() || ut.isFullCol() ? 0 : -1;
        }, execCommand:function (cmd) {
            var me = this, ut = getUETableBySelected(me);
            function getAverageWidth() {
                var tb = ut.table, averageWidth, sumWidth = 0, colsNum = 0, tbAttr = getDefaultValue(me, tb);
                if (ut.isFullRow()) {
                    sumWidth = tb.offsetWidth;
                    colsNum = ut.colsNum;
                } else {
                    var begin = ut.cellsRange.beginColIndex, end = ut.cellsRange.endColIndex, node;
                    for (var i = begin; i <= end; ) {
                        node = ut.selectedTds[i];
                        sumWidth += node.offsetWidth;
                        i += node.colSpan;
                        colsNum += 1;
                    }
                }
                averageWidth = Math.ceil(sumWidth / colsNum) - tbAttr.tdBorder * 2 - tbAttr.tdPadding * 2;
                return averageWidth;
            }
            function setAverageWidth(averageWidth) {
                utils.each(domUtils.getElementsByTagName(ut.table, "th"), function (node) {
                    node.setAttribute("width", "");
                });
                var cells = ut.isFullRow() ? domUtils.getElementsByTagName(ut.table, "td") : ut.selectedTds;
                utils.each(cells, function (node) {
                    if (node.colSpan == 1) {
                        node.setAttribute("width", averageWidth);
                    }
                });
            }
            if (ut && ut.selectedTds.length) {
                setAverageWidth(getAverageWidth());
            }
        }};
        UE.commands["averagedistributerow"] = {queryCommandState:function () {
            var ut = getUETableBySelected(this);
            if (!ut) {
                return -1;
            }
            if (ut.selectedTds && /th/ig.test(ut.selectedTds[0].tagName)) {
                return -1;
            }
            return ut.isFullRow() || ut.isFullCol() ? 0 : -1;
        }, execCommand:function (cmd) {
            var me = this, ut = getUETableBySelected(me);
            function getAverageHeight() {
                var averageHeight, rowNum, sumHeight = 0, tb = ut.table, tbAttr = getDefaultValue(me, tb), tdpadding = parseInt(domUtils.getComputedStyle(tb.getElementsByTagName("td")[0], "padding-top"));
                if (ut.isFullCol()) {
                    var captionArr = domUtils.getElementsByTagName(tb, "caption"), thArr = domUtils.getElementsByTagName(tb, "th"), captionHeight, thHeight;
                    if (captionArr.length > 0) {
                        captionHeight = captionArr[0].offsetHeight;
                    }
                    if (thArr.length > 0) {
                        thHeight = thArr[0].offsetHeight;
                    }
                    sumHeight = tb.offsetHeight - (captionHeight || 0) - (thHeight || 0);
                    rowNum = thArr.length == 0 ? ut.rowsNum : (ut.rowsNum - 1);
                } else {
                    var begin = ut.cellsRange.beginRowIndex, end = ut.cellsRange.endRowIndex, count = 0, trs = domUtils.getElementsByTagName(tb, "tr");
                    for (var i = begin; i <= end; i++) {
                        sumHeight += trs[i].offsetHeight;
                        count += 1;
                    }
                    rowNum = count;
                }
                if (browser.ie && browser.version < 9) {
                    averageHeight = Math.ceil(sumHeight / rowNum);
                } else {
                    averageHeight = Math.ceil(sumHeight / rowNum) - tbAttr.tdBorder * 2 - tdpadding * 2;
                }
                return averageHeight;
            }
            function setAverageHeight(averageHeight) {
                var cells = ut.isFullCol() ? domUtils.getElementsByTagName(ut.table, "td") : ut.selectedTds;
                utils.each(cells, function (node) {
                    if (node.rowSpan == 1) {
                        node.setAttribute("height", averageHeight);
                    }
                });
            }
            if (ut && ut.selectedTds.length) {
                setAverageHeight(getAverageHeight());
            }
        }};
        UE.commands["cellalignment"] = {queryCommandState:function () {
            return getTableItemsByRange(this).table ? 0 : -1;
        }, execCommand:function (cmd, data) {
            var me = this, ut = getUETableBySelected(me);
            if (!ut) {
                var start = me.selection.getStart(), cell = start && domUtils.findParentByTagName(start, ["td", "th", "caption"], true);
                if (!/caption/ig.test(cell.tagName)) {
                    domUtils.setAttributes(cell, data);
                } else {
                    cell.style.textAlign = data.align;
                    cell.style.verticalAlign = data.vAlign;
                }
                me.selection.getRange().setCursor(true);
            } else {
                utils.each(ut.selectedTds, function (cell) {
                    domUtils.setAttributes(cell, data);
                });
            }
        }, queryCommandValue:function (cmd) {
            var activeMenuCell = getTableItemsByRange(this).cell;
            if (!activeMenuCell) {
                activeMenuCell = getSelectedArr(this)[0];
            }
            if (!activeMenuCell) {
                return null;
            } else {
                var cells = UE.UETable.getUETable(activeMenuCell).selectedTds;
                !cells.length && (cells = activeMenuCell);
                return UE.UETable.getTableCellAlignState(cells);
            }
        }};
        UE.commands["tablealignment"] = {queryCommandState:function () {
            if (browser.ie && browser.version < 8) {
                return -1;
            }
            return getTableItemsByRange(this).table ? 0 : -1;
        }, execCommand:function (cmd, value) {
            var me = this, start = me.selection.getStart(), table = start && domUtils.findParentByTagName(start, ["table"], true);
            if (table) {
                table.setAttribute("align", value);
            }
        }};
        UE.commands["edittable"] = {queryCommandState:function () {
            return getTableItemsByRange(this).table ? 0 : -1;
        }, execCommand:function (cmd, color) {
            var rng = this.selection.getRange(), table = domUtils.findParentByTagName(rng.startContainer, "table");
            if (table) {
                var arr = domUtils.getElementsByTagName(table, "td").concat(domUtils.getElementsByTagName(table, "th"), domUtils.getElementsByTagName(table, "caption"));
                utils.each(arr, function (node) {
                    node.style.borderColor = color;
                });
            }
        }};
        UE.commands["edittd"] = {queryCommandState:function () {
            return getTableItemsByRange(this).table ? 0 : -1;
        }, execCommand:function (cmd, bkColor) {
            var me = this, ut = getUETableBySelected(me);
            if (!ut) {
                var start = me.selection.getStart(), cell = start && domUtils.findParentByTagName(start, ["td", "th", "caption"], true);
                if (cell) {
                    cell.style.backgroundColor = bkColor;
                }
            } else {
                utils.each(ut.selectedTds, function (cell) {
                    cell.style.backgroundColor = bkColor;
                });
            }
        }};
        UE.commands["settablebackground"] = {queryCommandState:function () {
            return getSelectedArr(this).length > 1 ? 0 : -1;
        }, execCommand:function (cmd, value) {
            var cells, ut;
            cells = getSelectedArr(this);
            ut = getUETable(cells[0]);
            ut.setBackground(cells, value);
        }};
        UE.commands["cleartablebackground"] = {queryCommandState:function () {
            var cells = getSelectedArr(this);
            if (!cells.length) {
                return -1;
            }
            for (var i = 0, cell; cell = cells[i++]; ) {
                if (cell.style.backgroundColor !== "") {
                    return 0;
                }
            }
            return -1;
        }, execCommand:function () {
            var cells = getSelectedArr(this), ut = getUETable(cells[0]);
            ut.removeBackground(cells);
        }};
        UE.commands["interlacetable"] = UE.commands["uninterlacetable"] = {queryCommandState:function (cmd) {
            var table = getTableItemsByRange(this).table;
            if (!table) {
                return -1;
            }
            var interlaced = table.getAttribute("interlaced");
            if (cmd == "interlacetable") {
                return (interlaced === "enabled") ? -1 : 0;
            } else {
                return (!interlaced || interlaced === "disabled") ? -1 : 0;
            }
        }, execCommand:function (cmd, classList) {
            var table = getTableItemsByRange(this).table;
            if (cmd == "interlacetable") {
                table.setAttribute("interlaced", "enabled");
                this.fireEvent("interlacetable", table, classList);
            } else {
                table.setAttribute("interlaced", "disabled");
                this.fireEvent("uninterlacetable", table);
            }
        }};
        UE.commands["setbordervisible"] = {queryCommandState:function (cmd) {
            var table = getTableItemsByRange(this).table;
            if (!table) {
                return -1;
            }
            return 0;
        }, execCommand:function () {
            var table = getTableItemsByRange(this).table;
            utils.each(domUtils.getElementsByTagName(table, "td"), function (td) {
                td.style.borderWidth = "1px";
                td.style.borderStyle = "solid";
            });
        }};
        function resetTdWidth(table, editor) {
            var tds = domUtils.getElementsByTagName(table, "td th");
            utils.each(tds, function (td) {
                td.removeAttribute("width");
            });
            table.setAttribute("width", getTableWidth(editor, true, getDefaultValue(editor, table)));
            var tdsWidths = [];
            setTimeout(function () {
                utils.each(tds, function (td) {
                    (td.colSpan == 1) && tdsWidths.push(td.offsetWidth);
                });
                utils.each(tds, function (td, i) {
                    (td.colSpan == 1) && td.setAttribute("width", tdsWidths[i] + "");
                });
            }, 0);
        }
        function getTableWidth(editor, needIEHack, defaultValue) {
            var body = editor.body;
            return body.offsetWidth - (needIEHack ? parseInt(domUtils.getComputedStyle(body, "margin-left"), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (editor.options.offsetWidth || 0);
        }
        function getSelectedArr(editor) {
            var cell = getTableItemsByRange(editor).cell;
            if (cell) {
                var ut = getUETable(cell);
                return ut.selectedTds.length ? ut.selectedTds : [cell];
            } else {
                return [];
            }
        }
    })();
    UE.plugins["table"] = function () {
        var me = this, tabTimer = null, tableDragTimer = null, tableResizeTimer = null, cellMinWidth = 5, isInResizeBuffer = false, cellBorderWidth = 5, offsetOfTableCell = 10, singleClickState = 0, userActionStatus = null, dblclickTime = 360, UT = UE.UETable, getUETable = function (tdOrTable) {
            return UT.getUETable(tdOrTable);
        }, getUETableBySelected = function (editor) {
            return UT.getUETableBySelected(editor);
        }, getDefaultValue = function (editor, table) {
            return UT.getDefaultValue(editor, table);
        }, removeSelectedClass = function (cells) {
            return UT.removeSelectedClass(cells);
        };
        function showError(e) {
        }
        me.ready(function () {
            var me = this;
            var orgGetText = me.selection.getText;
            me.selection.getText = function () {
                var table = getUETableBySelected(me);
                if (table) {
                    var str = "";
                    utils.each(table.selectedTds, function (td) {
                        str += td[browser.ie ? "innerText" : "textContent"];
                    });
                    return str;
                } else {
                    return orgGetText.call(me.selection);
                }
            };
        });
        var startTd = null, currentTd = null, onDrag = "", onBorder = false, dragButton = null, dragOver = false, dragLine = null, dragTd = null;
        var mousedown = false, needIEHack = true;
        me.setOpt({"maxColNum":20, "maxRowNum":100, "defaultCols":5, "defaultRows":5, "tdvalign":"top", "cursorpath":me.options.UEDITOR_HOME_URL + "themes/default/images/cursor_", "tableDragable":false, "classList":["ue-table-interlace-color-single", "ue-table-interlace-color-double"]});
        me.getUETable = getUETable;
        var commands = {"deletetable":1, "inserttable":1, "cellvalign":1, "insertcaption":1, "deletecaption":1, "inserttitle":1, "deletetitle":1, "mergeright":1, "mergedown":1, "mergecells":1, "insertrow":1, "insertrownext":1, "deleterow":1, "insertcol":1, "insertcolnext":1, "deletecol":1, "splittocells":1, "splittorows":1, "splittocols":1, "adaptbytext":1, "adaptbywindow":1, "adaptbycustomer":1, "insertparagraph":1, "insertparagraphbeforetable":1, "averagedistributecol":1, "averagedistributerow":1};
        me.ready(function () {
            utils.cssRule("table", ".selectTdClass{background-color:#edf5fa !important}" + "table.noBorderTable td,table.noBorderTable th,table.noBorderTable caption{border:1px dashed #ddd !important}" + "table{margin-bottom:10px;border-collapse:collapse;display:table;}" + "td,th{padding: 5px 10px;border: 1px solid #DDD;}" + "caption{border:1px dashed #DDD;border-bottom:0;padding:3px;text-align:center;}" + "th{border-top:1px solid #BBB;background-color:#F7F7F7;}" + "table tr.firstRow th{border-top-width:2px;}" + ".ue-table-interlace-color-single{ background-color: #fcfcfc; } .ue-table-interlace-color-double{ background-color: #f7faff; }" + "td p{margin:0;padding:0;}", me.document);
            var tableCopyList, isFullCol, isFullRow;
            me.addListener("keydown", function (cmd, evt) {
                var me = this;
                var keyCode = evt.keyCode || evt.which;
                if (keyCode == 8) {
                    var ut = getUETableBySelected(me);
                    if (ut && ut.selectedTds.length) {
                        if (ut.isFullCol()) {
                            me.execCommand("deletecol");
                        } else {
                            if (ut.isFullRow()) {
                                me.execCommand("deleterow");
                            } else {
                                me.fireEvent("delcells");
                            }
                        }
                        domUtils.preventDefault(evt);
                    }
                    var caption = domUtils.findParentByTagName(me.selection.getStart(), "caption", true), range = me.selection.getRange();
                    if (range.collapsed && caption && isEmptyBlock(caption)) {
                        me.fireEvent("saveScene");
                        var table = caption.parentNode;
                        domUtils.remove(caption);
                        if (table) {
                            range.setStart(table.rows[0].cells[0], 0).setCursor(false, true);
                        }
                        me.fireEvent("saveScene");
                    }
                }
                if (keyCode == 46) {
                    ut = getUETableBySelected(me);
                    if (ut) {
                        me.fireEvent("saveScene");
                        for (var i = 0, ci; ci = ut.selectedTds[i++]; ) {
                            domUtils.fillNode(me.document, ci);
                        }
                        me.fireEvent("saveScene");
                        domUtils.preventDefault(evt);
                    }
                }
                if (keyCode == 13) {
                    var rng = me.selection.getRange(), caption = domUtils.findParentByTagName(rng.startContainer, "caption", true);
                    if (caption) {
                        var table = domUtils.findParentByTagName(caption, "table");
                        if (!rng.collapsed) {
                            rng.deleteContents();
                            me.fireEvent("saveScene");
                        } else {
                            if (caption) {
                                rng.setStart(table.rows[0].cells[0], 0).setCursor(false, true);
                            }
                        }
                        domUtils.preventDefault(evt);
                        return;
                    }
                    if (rng.collapsed) {
                        var table = domUtils.findParentByTagName(rng.startContainer, "table");
                        if (table) {
                            var cell = table.rows[0].cells[0], start = domUtils.findParentByTagName(me.selection.getStart(), ["td", "th"], true), preNode = table.previousSibling;
                            if (cell === start && (!preNode || preNode.nodeType == 1 && preNode.tagName == "TABLE") && domUtils.isStartInblock(rng)) {
                                var first = domUtils.findParent(me.selection.getStart(), function (n) {
                                    return domUtils.isBlockElm(n);
                                }, true);
                                if (first && (/t(h|d)/i.test(first.tagName) || first === start.firstChild)) {
                                    me.execCommand("insertparagraphbeforetable");
                                    domUtils.preventDefault(evt);
                                }
                            }
                        }
                    }
                }
                if ((evt.ctrlKey || evt.metaKey) && evt.keyCode == "67") {
                    tableCopyList = null;
                    var ut = getUETableBySelected(me);
                    if (ut) {
                        var tds = ut.selectedTds;
                        isFullCol = ut.isFullCol();
                        isFullRow = ut.isFullRow();
                        tableCopyList = [[ut.cloneCell(tds[0], null, true)]];
                        for (var i = 1, ci; ci = tds[i]; i++) {
                            if (ci.parentNode !== tds[i - 1].parentNode) {
                                tableCopyList.push([ut.cloneCell(ci, null, true)]);
                            } else {
                                tableCopyList[tableCopyList.length - 1].push(ut.cloneCell(ci, null, true));
                            }
                        }
                    }
                }
            });
            me.addListener("tablehasdeleted", function () {
                toggleDraggableState(this, false, "", null);
                if (dragButton) {
                    domUtils.remove(dragButton);
                }
            });
            me.addListener("beforepaste", function (cmd, html) {
                var me = this;
                var rng = me.selection.getRange();
                if (domUtils.findParentByTagName(rng.startContainer, "caption", true)) {
                    var div = me.document.createElement("div");
                    div.innerHTML = html.html;
                    html.html = div[browser.ie9below ? "innerText" : "textContent"];
                    return;
                }
                var table = getUETableBySelected(me);
                if (tableCopyList) {
                    me.fireEvent("saveScene");
                    var rng = me.selection.getRange();
                    var td = domUtils.findParentByTagName(rng.startContainer, ["td", "th"], true), tmpNode, preNode;
                    if (td) {
                        var ut = getUETable(td);
                        if (isFullRow) {
                            var rowIndex = ut.getCellInfo(td).rowIndex;
                            if (td.tagName == "TH") {
                                rowIndex++;
                            }
                            for (var i = 0, ci; ci = tableCopyList[i++]; ) {
                                var tr = ut.insertRow(rowIndex++, "td");
                                for (var j = 0, cj; cj = ci[j]; j++) {
                                    var cell = tr.cells[j];
                                    if (!cell) {
                                        cell = tr.insertCell(j);
                                    }
                                    cell.innerHTML = cj.innerHTML;
                                    cj.getAttribute("width") && cell.setAttribute("width", cj.getAttribute("width"));
                                    cj.getAttribute("vAlign") && cell.setAttribute("vAlign", cj.getAttribute("vAlign"));
                                    cj.getAttribute("align") && cell.setAttribute("align", cj.getAttribute("align"));
                                    cj.style.cssText && (cell.style.cssText = cj.style.cssText);
                                }
                                for (var j = 0, cj; cj = tr.cells[j]; j++) {
                                    if (!ci[j]) {
                                        break;
                                    }
                                    cj.innerHTML = ci[j].innerHTML;
                                    ci[j].getAttribute("width") && cj.setAttribute("width", ci[j].getAttribute("width"));
                                    ci[j].getAttribute("vAlign") && cj.setAttribute("vAlign", ci[j].getAttribute("vAlign"));
                                    ci[j].getAttribute("align") && cj.setAttribute("align", ci[j].getAttribute("align"));
                                    ci[j].style.cssText && (cj.style.cssText = ci[j].style.cssText);
                                }
                            }
                        } else {
                            if (isFullCol) {
                                cellInfo = ut.getCellInfo(td);
                                var maxColNum = 0;
                                for (var j = 0, ci = tableCopyList[0], cj; cj = ci[j++]; ) {
                                    maxColNum += cj.colSpan || 1;
                                }
                                me.__hasEnterExecCommand = true;
                                for (i = 0; i < maxColNum; i++) {
                                    me.execCommand("insertcol");
                                }
                                me.__hasEnterExecCommand = false;
                                td = ut.table.rows[0].cells[cellInfo.cellIndex];
                                if (td.tagName == "TH") {
                                    td = ut.table.rows[1].cells[cellInfo.cellIndex];
                                }
                            }
                            for (var i = 0, ci; ci = tableCopyList[i++]; ) {
                                tmpNode = td;
                                for (var j = 0, cj; cj = ci[j++]; ) {
                                    if (td) {
                                        td.innerHTML = cj.innerHTML;
                                        cj.getAttribute("width") && td.setAttribute("width", cj.getAttribute("width"));
                                        cj.getAttribute("vAlign") && td.setAttribute("vAlign", cj.getAttribute("vAlign"));
                                        cj.getAttribute("align") && td.setAttribute("align", cj.getAttribute("align"));
                                        cj.style.cssText && (td.style.cssText = cj.style.cssText);
                                        preNode = td;
                                        td = td.nextSibling;
                                    } else {
                                        var cloneTd = cj.cloneNode(true);
                                        domUtils.removeAttributes(cloneTd, ["class", "rowSpan", "colSpan"]);
                                        preNode.parentNode.appendChild(cloneTd);
                                    }
                                }
                                td = ut.getNextCell(tmpNode, true, true);
                                if (!tableCopyList[i]) {
                                    break;
                                }
                                if (!td) {
                                    var cellInfo = ut.getCellInfo(tmpNode);
                                    ut.table.insertRow(ut.table.rows.length);
                                    ut.update();
                                    td = ut.getVSideCell(tmpNode, true);
                                }
                            }
                        }
                        ut.update();
                    } else {
                        table = me.document.createElement("table");
                        for (var i = 0, ci; ci = tableCopyList[i++]; ) {
                            var tr = table.insertRow(table.rows.length);
                            for (var j = 0, cj; cj = ci[j++]; ) {
                                cloneTd = UT.cloneCell(cj, null, true);
                                domUtils.removeAttributes(cloneTd, ["class"]);
                                tr.appendChild(cloneTd);
                            }
                            if (j == 2 && cloneTd.rowSpan > 1) {
                                cloneTd.rowSpan = 1;
                            }
                        }
                        var defaultValue = getDefaultValue(me), width = me.body.offsetWidth - (needIEHack ? parseInt(domUtils.getComputedStyle(me.body, "margin-left"), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (me.options.offsetWidth || 0);
                        me.execCommand("insertHTML", "<table  " + (isFullCol && isFullRow ? "width=\"" + width + "\"" : "") + ">" + table.innerHTML.replace(/>\s*</g, "><").replace(/\bth\b/gi, "td") + "</table>");
                    }
                    me.fireEvent("contentchange");
                    me.fireEvent("saveScene");
                    html.html = "";
                    return true;
                } else {
                    var div = me.document.createElement("div"), tables;
                    div.innerHTML = html.html;
                    tables = div.getElementsByTagName("table");
                    if (domUtils.findParentByTagName(me.selection.getStart(), "table")) {
                        utils.each(tables, function (t) {
                            domUtils.remove(t);
                        });
                        if (domUtils.findParentByTagName(me.selection.getStart(), "caption", true)) {
                            div.innerHTML = div[browser.ie ? "innerText" : "textContent"];
                        }
                    } else {
                        utils.each(tables, function (table) {
                            removeStyleSize(table, true);
                            domUtils.removeAttributes(table, ["style", "border"]);
                            utils.each(domUtils.getElementsByTagName(table, "td"), function (td) {
                                if (isEmptyBlock(td)) {
                                    domUtils.fillNode(me.document, td);
                                }
                                removeStyleSize(td, true);
                            });
                        });
                    }
                    html.html = div.innerHTML;
                }
            });
            me.addListener("afterpaste", function () {
                utils.each(domUtils.getElementsByTagName(me.body, "table"), function (table) {
                    if (table.offsetWidth > me.body.offsetWidth) {
                        var defaultValue = getDefaultValue(me, table);
                        table.style.width = me.body.offsetWidth - (needIEHack ? parseInt(domUtils.getComputedStyle(me.body, "margin-left"), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (me.options.offsetWidth || 0) + "px";
                    }
                });
            });
            me.addListener("blur", function () {
                tableCopyList = null;
            });
            var timer;
            me.addListener("keydown", function () {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    var rng = me.selection.getRange(), cell = domUtils.findParentByTagName(rng.startContainer, ["th", "td"], true);
                    if (cell) {
                        var table = cell.parentNode.parentNode.parentNode;
                        if (table.offsetWidth > table.getAttribute("width")) {
                            cell.style.wordBreak = "break-all";
                        }
                    }
                }, 100);
            });
            me.addListener("selectionchange", function () {
                toggleDraggableState(me, false, "", null);
            });
            me.addListener("contentchange", function () {
                var me = this;
                hideDragLine(me);
                if (getUETableBySelected(me)) {
                    return;
                }
                var rng = me.selection.getRange();
                var start = rng.startContainer;
                start = domUtils.findParentByTagName(start, ["td", "th"], true);
                utils.each(domUtils.getElementsByTagName(me.document, "table"), function (table) {
                    if (me.fireEvent("excludetable", table) === true) {
                        return;
                    }
                    table.ueTable = new UT(table);
                    table.onmouseover = function () {
                        me.fireEvent("tablemouseover", table);
                    };
                    table.onmousemove = function () {
                        me.fireEvent("tablemousemove", table);
                        me.options.tableDragable && toggleDragButton(true, this, me);
                        utils.defer(function () {
                            me.fireEvent("contentchange", 50);
                        }, true);
                    };
                    table.onmouseout = function () {
                        me.fireEvent("tablemouseout", table);
                        toggleDraggableState(me, false, "", null);
                        hideDragLine(me);
                    };
                    table.onclick = function (evt) {
                        evt = me.window.event || evt;
                        var target = getParentTdOrTh(evt.target || evt.srcElement);
                        if (!target) {
                            return;
                        }
                        var ut = getUETable(target), table = ut.table, cellInfo = ut.getCellInfo(target), cellsRange, rng = me.selection.getRange();
                        if (inTableSide(table, target, evt, true)) {
                            var endTdCol = ut.getCell(ut.indexTable[ut.rowsNum - 1][cellInfo.colIndex].rowIndex, ut.indexTable[ut.rowsNum - 1][cellInfo.colIndex].cellIndex);
                            if (evt.shiftKey && ut.selectedTds.length) {
                                if (ut.selectedTds[0] !== endTdCol) {
                                    cellsRange = ut.getCellsRange(ut.selectedTds[0], endTdCol);
                                    ut.setSelected(cellsRange);
                                } else {
                                    rng && rng.selectNodeContents(endTdCol).select();
                                }
                            } else {
                                if (target !== endTdCol) {
                                    cellsRange = ut.getCellsRange(target, endTdCol);
                                    ut.setSelected(cellsRange);
                                } else {
                                    rng && rng.selectNodeContents(endTdCol).select();
                                }
                            }
                            return;
                        }
                        if (inTableSide(table, target, evt)) {
                            var endTdRow = ut.getCell(ut.indexTable[cellInfo.rowIndex][ut.colsNum - 1].rowIndex, ut.indexTable[cellInfo.rowIndex][ut.colsNum - 1].cellIndex);
                            if (evt.shiftKey && ut.selectedTds.length) {
                                if (ut.selectedTds[0] !== endTdRow) {
                                    cellsRange = ut.getCellsRange(ut.selectedTds[0], endTdRow);
                                    ut.setSelected(cellsRange);
                                } else {
                                    rng && rng.selectNodeContents(endTdRow).select();
                                }
                            } else {
                                if (target !== endTdRow) {
                                    cellsRange = ut.getCellsRange(target, endTdRow);
                                    ut.setSelected(cellsRange);
                                } else {
                                    rng && rng.selectNodeContents(endTdRow).select();
                                }
                            }
                        }
                    };
                });
                switchBorderColor(me, true);
            });
            domUtils.on(me.document, "mousemove", mouseMoveEvent);
            domUtils.on(me.document, "mouseout", function (evt) {
                var target = evt.target || evt.srcElement;
                if (target.tagName == "TABLE") {
                    toggleDraggableState(me, false, "", null);
                }
            });
            me.addListener("interlacetable", function (type, table, classList) {
                if (!table) {
                    return;
                }
                var me = this, rows = table.rows, len = rows.length, getClass = function (list, index, repeat) {
                    return list[index] ? list[index] : repeat ? list[index % list.length] : "";
                };
                for (var i = 0; i < len; i++) {
                    rows[i].className = getClass(classList || me.options.classList, i, true);
                }
            });
            me.addListener("uninterlacetable", function (type, table) {
                if (!table) {
                    return;
                }
                var me = this, rows = table.rows, classList = me.options.classList, len = rows.length;
                for (var i = 0; i < len; i++) {
                    domUtils.removeClasses(rows[i], classList);
                }
            });
            me.addListener("mousedown", mouseDownEvent);
            me.addListener("mouseup", mouseUpEvent);
            domUtils.on(me.body, "dragstart", function (evt) {
                mouseUpEvent.call(me, "dragstart", evt);
            });
            var currentRowIndex = 0;
            me.addListener("mousedown", function () {
                currentRowIndex = 0;
            });
            me.addListener("tabkeydown", function () {
                var range = this.selection.getRange(), common = range.getCommonAncestor(true, true), table = domUtils.findParentByTagName(common, "table");
                if (table) {
                    if (domUtils.findParentByTagName(common, "caption", true)) {
                        var cell = domUtils.getElementsByTagName(table, "th td");
                        if (cell && cell.length) {
                            range.setStart(cell[0], 0).setCursor(false, true);
                        }
                    } else {
                        var cell = domUtils.findParentByTagName(common, ["td", "th"], true), ua = getUETable(cell);
                        currentRowIndex = cell.rowSpan > 1 ? currentRowIndex : ua.getCellInfo(cell).rowIndex;
                        var nextCell = ua.getTabNextCell(cell, currentRowIndex);
                        if (nextCell) {
                            if (isEmptyBlock(nextCell)) {
                                range.setStart(nextCell, 0).setCursor(false, true);
                            } else {
                                range.selectNodeContents(nextCell).select();
                            }
                        } else {
                            me.fireEvent("saveScene");
                            me.__hasEnterExecCommand = true;
                            this.execCommand("insertrownext");
                            me.__hasEnterExecCommand = false;
                            range = this.selection.getRange();
                            range.setStart(table.rows[table.rows.length - 1].cells[0], 0).setCursor();
                            me.fireEvent("saveScene");
                        }
                    }
                    return true;
                }
            });
            browser.ie && me.addListener("selectionchange", function () {
                toggleDraggableState(this, false, "", null);
            });
            me.addListener("keydown", function (type, evt) {
                var me = this;
                var keyCode = evt.keyCode || evt.which;
                if (keyCode == 8 || keyCode == 46) {
                    return;
                }
                var notCtrlKey = !evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey;
                notCtrlKey && removeSelectedClass(domUtils.getElementsByTagName(me.body, "td"));
                var ut = getUETableBySelected(me);
                if (!ut) {
                    return;
                }
                notCtrlKey && ut.clearSelected();
            });
            me.addListener("beforegetcontent", function () {
                switchBorderColor(this, false);
                browser.ie && utils.each(this.document.getElementsByTagName("caption"), function (ci) {
                    if (domUtils.isEmptyNode(ci)) {
                        ci.innerHTML = "&nbsp;";
                    }
                });
            });
            me.addListener("aftergetcontent", function () {
                switchBorderColor(this, true);
            });
            me.addListener("getAllHtml", function () {
                removeSelectedClass(me.document.getElementsByTagName("td"));
            });
            me.addListener("fullscreenchanged", function (type, fullscreen) {
                if (!fullscreen) {
                    var ratio = this.body.offsetWidth / document.body.offsetWidth, tables = domUtils.getElementsByTagName(this.body, "table");
                    utils.each(tables, function (table) {
                        if (table.offsetWidth < me.body.offsetWidth) {
                            return false;
                        }
                        var tds = domUtils.getElementsByTagName(table, "td"), backWidths = [];
                        utils.each(tds, function (td) {
                            backWidths.push(td.offsetWidth);
                        });
                        for (var i = 0, td; td = tds[i]; i++) {
                            td.setAttribute("width", Math.floor(backWidths[i] * ratio));
                        }
                        table.setAttribute("width", Math.floor(getTableWidth(me, needIEHack, getDefaultValue(me))));
                    });
                }
            });
            var oldExecCommand = me.execCommand;
            me.execCommand = function (cmd, datatat) {
                var me = this, args = arguments;
                cmd = cmd.toLowerCase();
                var ut = getUETableBySelected(me), tds, range = new dom.Range(me.document), cmdFun = me.commands[cmd] || UE.commands[cmd], result;
                if (!cmdFun) {
                    return;
                }
                if (ut && !commands[cmd] && !cmdFun.notNeedUndo && !me.__hasEnterExecCommand) {
                    me.__hasEnterExecCommand = true;
                    me.fireEvent("beforeexeccommand", cmd);
                    tds = ut.selectedTds;
                    var lastState = -2, lastValue = -2, value, state;
                    for (var i = 0, td; td = tds[i]; i++) {
                        if (isEmptyBlock(td)) {
                            range.setStart(td, 0).setCursor(false, true);
                        } else {
                            range.selectNode(td).select(true);
                        }
                        state = me.queryCommandState(cmd);
                        value = me.queryCommandValue(cmd);
                        if (state != -1) {
                            if (lastState !== state || lastValue !== value) {
                                me._ignoreContentChange = true;
                                result = oldExecCommand.apply(me, arguments);
                                me._ignoreContentChange = false;
                            }
                            lastState = me.queryCommandState(cmd);
                            lastValue = me.queryCommandValue(cmd);
                            if (domUtils.isEmptyBlock(td)) {
                                domUtils.fillNode(me.document, td);
                            }
                        }
                    }
                    range.setStart(tds[0], 0).shrinkBoundary(true).setCursor(false, true);
                    me.fireEvent("contentchange");
                    me.fireEvent("afterexeccommand", cmd);
                    me.__hasEnterExecCommand = false;
                    me._selectionChange();
                } else {
                    result = oldExecCommand.apply(me, arguments);
                }
                return result;
            };
        });
        function removeStyleSize(obj, replaceToProperty) {
            removeStyle(obj, "width", true);
            removeStyle(obj, "height", true);
        }
        function removeStyle(obj, styleName, replaceToProperty) {
            if (obj.style[styleName]) {
                replaceToProperty && obj.setAttribute(styleName, parseInt(obj.style[styleName], 10));
                obj.style[styleName] = "";
            }
        }
        function getParentTdOrTh(ele) {
            if (ele.tagName == "TD" || ele.tagName == "TH") {
                return ele;
            }
            var td;
            if (td = domUtils.findParentByTagName(ele, "td", true) || domUtils.findParentByTagName(ele, "th", true)) {
                return td;
            }
            return null;
        }
        function isEmptyBlock(node) {
            var reg = new RegExp(domUtils.fillChar, "g");
            if (node[browser.ie ? "innerText" : "textContent"].replace(/^\s*$/, "").replace(reg, "").length > 0) {
                return 0;
            }
            for (var n in dtd.$isNotEmpty) {
                if (node.getElementsByTagName(n).length) {
                    return 0;
                }
            }
            return 1;
        }
        function mouseCoords(evt) {
            if (evt.pageX || evt.pageY) {
                return {x:evt.pageX, y:evt.pageY};
            }
            return {x:evt.clientX + me.document.body.scrollLeft - me.document.body.clientLeft, y:evt.clientY + me.document.body.scrollTop - me.document.body.clientTop};
        }
        function mouseMoveEvent(evt) {
            if (isEditorDisabled()) {
                return;
            }
            try {
                var target = getParentTdOrTh(evt.target || evt.srcElement), pos;
                if (isInResizeBuffer) {
                    me.body.style.webkitUserSelect = "none";
                    if (Math.abs(userActionStatus.x - evt.clientX) > offsetOfTableCell || Math.abs(userActionStatus.y - evt.clientY) > offsetOfTableCell) {
                        clearTableDragTimer();
                        isInResizeBuffer = false;
                        singleClickState = 0;
                        tableBorderDrag(evt);
                    }
                }
                if (onDrag && dragTd) {
                    singleClickState = 0;
                    me.body.style.webkitUserSelect = "none";
                    me.selection.getNative()[browser.ie9below ? "empty" : "removeAllRanges"]();
                    pos = mouseCoords(evt);
                    toggleDraggableState(me, true, onDrag, pos, target);
                    if (onDrag == "h") {
                        dragLine.style.left = getPermissionX(dragTd, evt) + "px";
                    } else {
                        if (onDrag == "v") {
                            dragLine.style.top = getPermissionY(dragTd, evt) + "px";
                        }
                    }
                    return;
                }
                if (target) {
                    if (me.fireEvent("excludetable", target) === true) {
                        return;
                    }
                    pos = mouseCoords(evt);
                    var state = getRelation(target, pos), table = domUtils.findParentByTagName(target, "table", true);
                    if (inTableSide(table, target, evt, true)) {
                        if (me.fireEvent("excludetable", table) === true) {
                            return;
                        }
                        me.body.style.cursor = "url(" + me.options.cursorpath + "h.png),pointer";
                    } else {
                        if (inTableSide(table, target, evt)) {
                            if (me.fireEvent("excludetable", table) === true) {
                                return;
                            }
                            me.body.style.cursor = "url(" + me.options.cursorpath + "v.png),pointer";
                        } else {
                            me.body.style.cursor = "text";
                            var curCell = target;
                            if (/\d/.test(state)) {
                                state = state.replace(/\d/, "");
                                target = getUETable(target).getPreviewCell(target, state == "v");
                            }
                            toggleDraggableState(me, target ? !!state : false, target ? state : "", pos, target);
                        }
                    }
                } else {
                    toggleDragButton(false, table, me);
                }
            }
            catch (e) {
                showError(e);
            }
        }
        var dragButtonTimer;
        function toggleDragButton(show, table, editor) {
            if (!show) {
                if (dragOver) {
                    return;
                }
                dragButtonTimer = setTimeout(function () {
                    !dragOver && dragButton && dragButton.parentNode && dragButton.parentNode.removeChild(dragButton);
                }, 2000);
            } else {
                createDragButton(table, editor);
            }
        }
        function createDragButton(table, editor) {
            var pos = domUtils.getXY(table), doc = table.ownerDocument;
            if (dragButton && dragButton.parentNode) {
                return dragButton;
            }
            dragButton = doc.createElement("div");
            dragButton.contentEditable = false;
            dragButton.innerHTML = "";
            dragButton.style.cssText = "width:15px;height:15px;background-image:url(" + editor.options.UEDITOR_HOME_URL + "dialogs/table/dragicon.png);position: absolute;cursor:move;top:" + (pos.y - 15) + "px;left:" + (pos.x) + "px;";
            domUtils.unSelectable(dragButton);
            dragButton.onmouseover = function (evt) {
                dragOver = true;
            };
            dragButton.onmouseout = function (evt) {
                dragOver = false;
            };
            domUtils.on(dragButton, "click", function (type, evt) {
                doClick(evt, this);
            });
            domUtils.on(dragButton, "dblclick", function (type, evt) {
                doDblClick(evt);
            });
            domUtils.on(dragButton, "dragstart", function (type, evt) {
                domUtils.preventDefault(evt);
            });
            var timer;
            function doClick(evt, button) {
                clearTimeout(timer);
                timer = setTimeout(function () {
                    editor.fireEvent("tableClicked", table, button);
                }, 300);
            }
            function doDblClick(evt) {
                clearTimeout(timer);
                var ut = getUETable(table), start = table.rows[0].cells[0], end = ut.getLastCell(), range = ut.getCellsRange(start, end);
                editor.selection.getRange().setStart(start, 0).setCursor(false, true);
                ut.setSelected(range);
            }
            doc.body.appendChild(dragButton);
        }
        function inTableSide(table, cell, evt, top) {
            var pos = mouseCoords(evt), state = getRelation(cell, pos);
            if (top) {
                var caption = table.getElementsByTagName("caption")[0], capHeight = caption ? caption.offsetHeight : 0;
                return (state == "v1") && ((pos.y - domUtils.getXY(table).y - capHeight) < 8);
            } else {
                return (state == "h1") && ((pos.x - domUtils.getXY(table).x) < 8);
            }
        }
        function getPermissionX(dragTd, evt) {
            var ut = getUETable(dragTd);
            if (ut) {
                var preTd = ut.getSameEndPosCells(dragTd, "x")[0], nextTd = ut.getSameStartPosXCells(dragTd)[0], mouseX = mouseCoords(evt).x, left = (preTd ? domUtils.getXY(preTd).x : domUtils.getXY(ut.table).x) + 20, right = nextTd ? domUtils.getXY(nextTd).x + nextTd.offsetWidth - 20 : (me.body.offsetWidth + 5 || parseInt(domUtils.getComputedStyle(me.body, "width"), 10));
                left += cellMinWidth;
                right -= cellMinWidth;
                return mouseX < left ? left : mouseX > right ? right : mouseX;
            }
        }
        function getPermissionY(dragTd, evt) {
            try {
                var top = domUtils.getXY(dragTd).y, mousePosY = mouseCoords(evt).y;
                return mousePosY < top ? top : mousePosY;
            }
            catch (e) {
                showError(e);
            }
        }
        function toggleDraggableState(editor, draggable, dir, mousePos, cell) {
            try {
                editor.body.style.cursor = dir == "h" ? "col-resize" : dir == "v" ? "row-resize" : "text";
                if (browser.ie) {
                    if (dir && !mousedown && !getUETableBySelected(editor)) {
                        getDragLine(editor, editor.document);
                        showDragLineAt(dir, cell);
                    } else {
                        hideDragLine(editor);
                    }
                }
                onBorder = draggable;
            }
            catch (e) {
                showError(e);
            }
        }
        function getResizeLineByUETable() {
            var lineId = "_UETableResizeLine", line = this.document.getElementById(lineId);
            if (!line) {
                line = this.document.createElement("div");
                line.id = lineId;
                line.contnetEditable = false;
                line.setAttribute("unselectable", "on");
                var styles = {width:2 * cellBorderWidth + 1 + "px", position:"absolute", "z-index":100000, cursor:"col-resize", background:"red", display:"none"};
                line.onmouseout = function () {
                    this.style.display = "none";
                };
                utils.extend(line.style, styles);
                this.document.body.appendChild(line);
            }
            return line;
        }
        function updateResizeLine(cell, uetable) {
            var line = getResizeLineByUETable.call(this), table = uetable.table, styles = {top:domUtils.getXY(table).y + "px", left:domUtils.getXY(cell).x + cell.offsetWidth - cellBorderWidth + "px", display:"block", height:table.offsetHeight + "px"};
            utils.extend(line.style, styles);
        }
        function showResizeLine(cell) {
            var uetable = getUETable(cell);
            updateResizeLine.call(this, cell, uetable);
        }
        function getRelation(ele, mousePos) {
            var elePos = domUtils.getXY(ele);
            if (!elePos) {
                return "";
            }
            if (elePos.x + ele.offsetWidth - mousePos.x < cellBorderWidth) {
                return "h";
            }
            if (mousePos.x - elePos.x < cellBorderWidth) {
                return "h1";
            }
            if (elePos.y + ele.offsetHeight - mousePos.y < cellBorderWidth) {
                return "v";
            }
            if (mousePos.y - elePos.y < cellBorderWidth) {
                return "v1";
            }
            return "";
        }
        function mouseDownEvent(type, evt) {
            if (isEditorDisabled()) {
                return;
            }
            userActionStatus = {x:evt.clientX, y:evt.clientY};
            if (evt.button == 2) {
                var ut = getUETableBySelected(me), flag = false;
                if (ut) {
                    var td = getTargetTd(me, evt);
                    utils.each(ut.selectedTds, function (ti) {
                        if (ti === td) {
                            flag = true;
                        }
                    });
                    if (!flag) {
                        removeSelectedClass(domUtils.getElementsByTagName(me.body, "th td"));
                        ut.clearSelected();
                    } else {
                        td = ut.selectedTds[0];
                        setTimeout(function () {
                            me.selection.getRange().setStart(td, 0).setCursor(false, true);
                        }, 0);
                    }
                }
            } else {
                tableClickHander(evt);
            }
        }
        function clearTableTimer() {
            tabTimer && clearTimeout(tabTimer);
            tabTimer = null;
        }
        function tableDbclickHandler(evt) {
            singleClickState = 0;
            evt = evt || me.window.event;
            var target = getParentTdOrTh(evt.target || evt.srcElement);
            if (target) {
                var h;
                if (h = getRelation(target, mouseCoords(evt))) {
                    hideDragLine(me);
                    if (h == "h1") {
                        h = "h";
                        if (inTableSide(domUtils.findParentByTagName(target, "table"), target, evt)) {
                            me.execCommand("adaptbywindow");
                        } else {
                            target = getUETable(target).getPreviewCell(target);
                            if (target) {
                                var rng = me.selection.getRange();
                                rng.selectNodeContents(target).setCursor(true, true);
                            }
                        }
                    }
                    if (h == "h") {
                        var ut = getUETable(target), table = ut.table, cells = getCellsByMoveBorder(target, table, true);
                        cells = extractArray(cells, "left");
                        ut.width = ut.offsetWidth;
                        var oldWidth = [], newWidth = [];
                        utils.each(cells, function (cell) {
                            oldWidth.push(cell.offsetWidth);
                        });
                        utils.each(cells, function (cell) {
                            cell.removeAttribute("width");
                        });
                        window.setTimeout(function () {
                            var changeable = true;
                            utils.each(cells, function (cell, index) {
                                var width = cell.offsetWidth;
                                if (width > oldWidth[index]) {
                                    changeable = false;
                                    return false;
                                }
                                newWidth.push(width);
                            });
                            var change = changeable ? newWidth : oldWidth;
                            utils.each(cells, function (cell, index) {
                                cell.width = change[index] - getTabcellSpace();
                            });
                        }, 0);
                    }
                }
            }
        }
        function tableClickHander(evt) {
            removeSelectedClass(domUtils.getElementsByTagName(me.body, "td th"));
            utils.each(me.document.getElementsByTagName("table"), function (t) {
                t.ueTable = null;
            });
            startTd = getTargetTd(me, evt);
            if (!startTd) {
                return;
            }
            var table = domUtils.findParentByTagName(startTd, "table", true);
            ut = getUETable(table);
            ut && ut.clearSelected();
            if (!onBorder) {
                me.document.body.style.webkitUserSelect = "";
                mousedown = true;
                me.addListener("mouseover", mouseOverEvent);
            } else {
                borderActionHandler(evt);
            }
        }
        function borderActionHandler(evt) {
            if (browser.ie) {
                evt = reconstruct(evt);
            }
            clearTableDragTimer();
            isInResizeBuffer = true;
            tableDragTimer = setTimeout(function () {
                tableBorderDrag(evt);
            }, dblclickTime);
        }
        function extractArray(originArr, key) {
            var result = [], tmp = null;
            for (var i = 0, len = originArr.length; i < len; i++) {
                tmp = originArr[i][key];
                if (tmp) {
                    result.push(tmp);
                }
            }
            return result;
        }
        function clearTableDragTimer() {
            tableDragTimer && clearTimeout(tableDragTimer);
            tableDragTimer = null;
        }
        function reconstruct(obj) {
            var attrs = ["pageX", "pageY", "clientX", "clientY", "srcElement", "target"], newObj = {};
            if (obj) {
                for (var i = 0, key, val; key = attrs[i]; i++) {
                    val = obj[key];
                    val && (newObj[key] = val);
                }
            }
            return newObj;
        }
        function tableBorderDrag(evt) {
            isInResizeBuffer = false;
            if (!startTd) {
                return;
            }
            var state = Math.abs(userActionStatus.x - evt.clientX) >= Math.abs(userActionStatus.y - evt.clientY) ? "h" : "v";
            if (/\d/.test(state)) {
                state = state.replace(/\d/, "");
                startTd = getUETable(startTd).getPreviewCell(startTd, state == "v");
            }
            hideDragLine(me);
            getDragLine(me, me.document);
            me.fireEvent("saveScene");
            showDragLineAt(state, startTd);
            mousedown = true;
            onDrag = state;
            dragTd = startTd;
        }
        function mouseUpEvent(type, evt) {
            if (isEditorDisabled()) {
                return;
            }
            clearTableDragTimer();
            isInResizeBuffer = false;
            if (onBorder) {
                singleClickState = ++singleClickState % 3;
                userActionStatus = {x:evt.clientX, y:evt.clientY};
                tableResizeTimer = setTimeout(function () {
                    singleClickState > 0 && singleClickState--;
                }, dblclickTime);
                if (singleClickState === 2) {
                    singleClickState = 0;
                    tableDbclickHandler(evt);
                    return;
                }
            }
            if (evt.button == 2) {
                return;
            }
            var me = this;
            var range = me.selection.getRange(), start = domUtils.findParentByTagName(range.startContainer, "table", true), end = domUtils.findParentByTagName(range.endContainer, "table", true);
            if (start || end) {
                if (start === end) {
                    start = domUtils.findParentByTagName(range.startContainer, ["td", "th", "caption"], true);
                    end = domUtils.findParentByTagName(range.endContainer, ["td", "th", "caption"], true);
                    if (start !== end) {
                        me.selection.clearRange();
                    }
                } else {
                    me.selection.clearRange();
                }
            }
            mousedown = false;
            me.document.body.style.webkitUserSelect = "";
            if (onDrag && dragTd) {
                me.selection.getNative()[browser.ie9below ? "empty" : "removeAllRanges"]();
                singleClickState = 0;
                dragLine = me.document.getElementById("ue_tableDragLine");
                var dragTdPos = domUtils.getXY(dragTd), dragLinePos = domUtils.getXY(dragLine);
                switch (onDrag) {
                  case "h":
                    changeColWidth(dragTd, dragLinePos.x - dragTdPos.x);
                    break;
                  case "v":
                    changeRowHeight(dragTd, dragLinePos.y - dragTdPos.y - dragTd.offsetHeight);
                    break;
                  default:
                }
                onDrag = "";
                dragTd = null;
                hideDragLine(me);
                me.fireEvent("saveScene");
                return;
            }
            if (!startTd) {
                var target = domUtils.findParentByTagName(evt.target || evt.srcElement, "td", true);
                if (!target) {
                    target = domUtils.findParentByTagName(evt.target || evt.srcElement, "th", true);
                }
                if (target && (target.tagName == "TD" || target.tagName == "TH")) {
                    if (me.fireEvent("excludetable", target) === true) {
                        return;
                    }
                    range = new dom.Range(me.document);
                    range.setStart(target, 0).setCursor(false, true);
                }
            } else {
                var ut = getUETable(startTd), cell = ut ? ut.selectedTds[0] : null;
                if (cell) {
                    range = new dom.Range(me.document);
                    if (domUtils.isEmptyBlock(cell)) {
                        range.setStart(cell, 0).setCursor(false, true);
                    } else {
                        range.selectNodeContents(cell).shrinkBoundary().setCursor(false, true);
                    }
                } else {
                    range = me.selection.getRange().shrinkBoundary();
                    if (!range.collapsed) {
                        var start = domUtils.findParentByTagName(range.startContainer, ["td", "th"], true), end = domUtils.findParentByTagName(range.endContainer, ["td", "th"], true);
                        if (start && !end || !start && end || start && end && start !== end) {
                            range.setCursor(false, true);
                        }
                    }
                }
                startTd = null;
                me.removeListener("mouseover", mouseOverEvent);
            }
            me._selectionChange(250, evt);
        }
        function mouseOverEvent(type, evt) {
            if (isEditorDisabled()) {
                return;
            }
            var me = this, tar = evt.target || evt.srcElement;
            currentTd = domUtils.findParentByTagName(tar, "td", true) || domUtils.findParentByTagName(tar, "th", true);
            if (startTd && currentTd && ((startTd.tagName == "TD" && currentTd.tagName == "TD") || (startTd.tagName == "TH" && currentTd.tagName == "TH")) && domUtils.findParentByTagName(startTd, "table") == domUtils.findParentByTagName(currentTd, "table")) {
                var ut = getUETable(currentTd);
                if (startTd != currentTd) {
                    me.document.body.style.webkitUserSelect = "none";
                    me.selection.getNative()[browser.ie9below ? "empty" : "removeAllRanges"]();
                    var range = ut.getCellsRange(startTd, currentTd);
                    ut.setSelected(range);
                } else {
                    me.document.body.style.webkitUserSelect = "";
                    ut.clearSelected();
                }
            }
            evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
        }
        function setCellHeight(cell, height, backHeight) {
            var lineHight = parseInt(domUtils.getComputedStyle(cell, "line-height"), 10), tmpHeight = backHeight + height;
            height = tmpHeight < lineHight ? lineHight : tmpHeight;
            if (cell.style.height) {
                cell.style.height = "";
            }
            cell.rowSpan == 1 ? cell.setAttribute("height", height) : (cell.removeAttribute && cell.removeAttribute("height"));
        }
        function getWidth(cell) {
            if (!cell) {
                return 0;
            }
            return parseInt(domUtils.getComputedStyle(cell, "width"), 10);
        }
        function changeColWidth(cell, changeValue) {
            var ut = getUETable(cell);
            if (ut) {
                var table = ut.table, cells = getCellsByMoveBorder(cell, table);
                table.style.width = "";
                table.removeAttribute("width");
                changeValue = correctChangeValue(changeValue, cell, cells);
                if (cell.nextSibling) {
                    var i = 0;
                    utils.each(cells, function (cellGroup) {
                        cellGroup.left.width = (+cellGroup.left.width) + changeValue;
                        cellGroup.right && (cellGroup.right.width = (+cellGroup.right.width) - changeValue);
                    });
                } else {
                    utils.each(cells, function (cellGroup) {
                        cellGroup.left.width -= -changeValue;
                    });
                }
            }
        }
        function isEditorDisabled() {
            return me.body.contentEditable === "false";
        }
        function changeRowHeight(td, changeValue) {
            if (Math.abs(changeValue) < 10) {
                return;
            }
            var ut = getUETable(td);
            if (ut) {
                var cells = ut.getSameEndPosCells(td, "y"), backHeight = cells[0] ? cells[0].offsetHeight : 0;
                for (var i = 0, cell; cell = cells[i++]; ) {
                    setCellHeight(cell, changeValue, backHeight);
                }
            }
        }
        function getCellsByMoveBorder(cell, table, isContainMergeCell) {
            if (!table) {
                table = domUtils.findParentByTagName(cell, "table");
            }
            if (!table) {
                return null;
            }
            var index = domUtils.getNodeIndex(cell), temp = cell, rows = table.rows, colIndex = 0;
            while (temp) {
                if (temp.nodeType === 1) {
                    colIndex += (temp.colSpan || 1);
                }
                temp = temp.previousSibling;
            }
            temp = null;
            var borderCells = [];
            utils.each(rows, function (tabRow) {
                var cells = tabRow.cells, currIndex = 0;
                utils.each(cells, function (tabCell) {
                    currIndex += (tabCell.colSpan || 1);
                    if (currIndex === colIndex) {
                        borderCells.push({left:tabCell, right:tabCell.nextSibling || null});
                        return false;
                    } else {
                        if (currIndex > colIndex) {
                            if (isContainMergeCell) {
                                borderCells.push({left:tabCell});
                            }
                            return false;
                        }
                    }
                });
            });
            return borderCells;
        }
        function getMinWidthByTableCells(cells) {
            var minWidth = Number.MAX_VALUE;
            for (var i = 0, curCell; curCell = cells[i]; i++) {
                minWidth = Math.min(minWidth, curCell.width || getTableCellWidth(curCell));
            }
            return minWidth;
        }
        function correctChangeValue(changeValue, relatedCell, cells) {
            changeValue -= getTabcellSpace();
            if (changeValue < 0) {
                return 0;
            }
            changeValue -= getTableCellWidth(relatedCell);
            var direction = changeValue < 0 ? "left" : "right";
            changeValue = Math.abs(changeValue);
            utils.each(cells, function (cellGroup) {
                var curCell = cellGroup[direction];
                if (curCell) {
                    changeValue = Math.min(changeValue, getTableCellWidth(curCell) - cellMinWidth);
                }
            });
            changeValue = changeValue < 0 ? 0 : changeValue;
            return direction === "left" ? -changeValue : changeValue;
        }
        function getTableCellWidth(cell) {
            var width = 0, offset = 0, width = cell.offsetWidth - getTabcellSpace();
            if (!cell.nextSibling) {
                width -= getTableCellOffset(cell);
            }
            width = width < 0 ? 0 : width;
            try {
                cell.width = width;
            }
            catch (e) {
            }
            return width;
        }
        function getTableCellOffset(cell) {
            tab = domUtils.findParentByTagName(cell, "table", false);
            if (tab.offsetVal === undefined) {
                var prev = cell.previousSibling;
                if (prev) {
                    tab.offsetVal = cell.offsetWidth - prev.offsetWidth === UT.borderWidth ? UT.borderWidth : 0;
                } else {
                    tab.offsetVal = 0;
                }
            }
            return tab.offsetVal;
        }
        function getTabcellSpace() {
            if (UT.tabcellSpace === undefined) {
                var cell = null, tab = me.document.createElement("table"), tbody = me.document.createElement("tbody"), trow = me.document.createElement("tr"), tabcell = me.document.createElement("td"), mirror = null;
                tabcell.style.cssText = "border: 0;";
                tabcell.width = 1;
                trow.appendChild(tabcell);
                trow.appendChild(mirror = tabcell.cloneNode(false));
                tbody.appendChild(trow);
                tab.appendChild(tbody);
                tab.style.cssText = "visibility: hidden;";
                me.body.appendChild(tab);
                UT.paddingSpace = tabcell.offsetWidth - 1;
                var tmpTabWidth = tab.offsetWidth;
                tabcell.style.cssText = "";
                mirror.style.cssText = "";
                UT.borderWidth = (tab.offsetWidth - tmpTabWidth) / 3;
                UT.tabcellSpace = UT.paddingSpace + UT.borderWidth;
                me.body.removeChild(tab);
            }
            getTabcellSpace = function () {
                return UT.tabcellSpace;
            };
            return UT.tabcellSpace;
        }
        function getDragLine(editor, doc) {
            if (mousedown) {
                return;
            }
            dragLine = editor.document.createElement("div");
            domUtils.setAttributes(dragLine, {id:"ue_tableDragLine", unselectable:"on", contenteditable:false, "onresizestart":"return false", "ondragstart":"return false", "onselectstart":"return false", style:"background-color:blue;position:absolute;padding:0;margin:0;background-image:none;border:0px none;opacity:0;filter:alpha(opacity=0)"});
            editor.body.appendChild(dragLine);
        }
        function hideDragLine(editor) {
            if (mousedown) {
                return;
            }
            var line;
            while (line = editor.document.getElementById("ue_tableDragLine")) {
                domUtils.remove(line);
            }
        }
        function showDragLineAt(state, cell) {
            if (!cell) {
                return;
            }
            var table = domUtils.findParentByTagName(cell, "table"), caption = table.getElementsByTagName("caption"), width = table.offsetWidth, height = table.offsetHeight - (caption.length > 0 ? caption[0].offsetHeight : 0), tablePos = domUtils.getXY(table), cellPos = domUtils.getXY(cell), css;
            switch (state) {
              case "h":
                css = "height:" + height + "px;top:" + (tablePos.y + (caption.length > 0 ? caption[0].offsetHeight : 0)) + "px;left:" + (cellPos.x + cell.offsetWidth);
                dragLine.style.cssText = css + "px;position: absolute;display:block;background-color:blue;width:1px;border:0; color:blue;opacity:.3;filter:alpha(opacity=30)";
                break;
              case "v":
                css = "width:" + width + "px;left:" + tablePos.x + "px;top:" + (cellPos.y + cell.offsetHeight);
                dragLine.style.cssText = css + "px;overflow:hidden;position: absolute;display:block;background-color:blue;height:1px;border:0;color:blue;opacity:.2;filter:alpha(opacity=20)";
                break;
              default:
            }
        }
        function switchBorderColor(editor, flag) {
            var tableArr = domUtils.getElementsByTagName(editor.body, "table"), color;
            for (var i = 0, node; node = tableArr[i++]; ) {
                var td = domUtils.getElementsByTagName(node, "td");
                if (td[0]) {
                    if (flag) {
                        color = (td[0].style.borderColor).replace(/\s/g, "");
                        if (/(#ffffff)|(rgb\(255,255,255\))/ig.test(color)) {
                            domUtils.addClass(node, "noBorderTable");
                        }
                    } else {
                        domUtils.removeClasses(node, "noBorderTable");
                    }
                }
            }
        }
        function getTableWidth(editor, needIEHack, defaultValue) {
            var body = editor.body;
            return body.offsetWidth - (needIEHack ? parseInt(domUtils.getComputedStyle(body, "margin-left"), 10) * 2 : 0) - defaultValue.tableBorder * 2 - (editor.options.offsetWidth || 0);
        }
        function getTargetTd(editor, evt) {
            var target = domUtils.findParentByTagName(evt.target || evt.srcElement, ["td", "th"], true), dir = null;
            if (!target) {
                return null;
            }
            dir = getRelation(target, mouseCoords(evt));
            if (!target) {
                return null;
            }
            if (dir === "h1" && target.previousSibling) {
                var position = domUtils.getXY(target), cellWidth = target.offsetWidth;
                if (Math.abs(position.x + cellWidth - evt.clientX) > cellWidth / 3) {
                    target = target.previousSibling;
                }
            } else {
                if (dir === "v1" && target.parentNode.previousSibling) {
                    var position = domUtils.getXY(target), cellHeight = target.offsetHeight;
                    if (Math.abs(position.y + cellHeight - evt.clientY) > cellHeight / 3) {
                        target = target.parentNode.previousSibling.firstChild;
                    }
                }
            }
            return target && !(editor.fireEvent("excludetable", target) === true) ? target : null;
        }
    };
    UE.UETable.prototype.sortTable = function (sortByCellIndex, compareFn) {
        var table = this.table, rows = table.rows, trArray = [], flag = rows[0].cells[0].tagName === "TH", lastRowIndex = 0;
        if (this.selectedTds.length) {
            var range = this.cellsRange, len = range.endRowIndex + 1;
            for (var i = range.beginRowIndex; i < len; i++) {
                trArray[i] = rows[i];
            }
            trArray.splice(0, range.beginRowIndex);
            lastRowIndex = (range.endRowIndex + 1) === this.rowsNum ? 0 : range.endRowIndex + 1;
        } else {
            for (var i = 0, len = rows.length; i < len; i++) {
                trArray[i] = rows[i];
            }
        }
        var Fn = {"reversecurrent":function (td1, td2) {
            return 1;
        }, "orderbyasc":function (td1, td2) {
            var value1 = td1.innerText || td1.textContent, value2 = td2.innerText || td2.textContent;
            return value1.localeCompare(value2);
        }, "reversebyasc":function (td1, td2) {
            var value1 = td1.innerHTML, value2 = td2.innerHTML;
            return value2.localeCompare(value1);
        }, "orderbynum":function (td1, td2) {
            var value1 = td1[browser.ie ? "innerText" : "textContent"].match(/\d+/), value2 = td2[browser.ie ? "innerText" : "textContent"].match(/\d+/);
            if (value1) {
                value1 = +value1[0];
            }
            if (value2) {
                value2 = +value2[0];
            }
            return (value1 || 0) - (value2 || 0);
        }, "reversebynum":function (td1, td2) {
            var value1 = td1[browser.ie ? "innerText" : "textContent"].match(/\d+/), value2 = td2[browser.ie ? "innerText" : "textContent"].match(/\d+/);
            if (value1) {
                value1 = +value1[0];
            }
            if (value2) {
                value2 = +value2[0];
            }
            return (value2 || 0) - (value1 || 0);
        }};
        table.setAttribute("data-sort-type", compareFn && typeof compareFn === "string" && Fn[compareFn] ? compareFn : "");
        flag && trArray.splice(0, 1);
        trArray = utils.sort(trArray, function (tr1, tr2) {
            var result;
            if (compareFn && typeof compareFn === "function") {
                result = compareFn.call(this, tr1.cells[sortByCellIndex], tr2.cells[sortByCellIndex]);
            } else {
                if (compareFn && typeof compareFn === "number") {
                    result = 1;
                } else {
                    if (compareFn && typeof compareFn === "string" && Fn[compareFn]) {
                        result = Fn[compareFn].call(this, tr1.cells[sortByCellIndex], tr2.cells[sortByCellIndex]);
                    } else {
                        result = Fn["orderbyasc"].call(this, tr1.cells[sortByCellIndex], tr2.cells[sortByCellIndex]);
                    }
                }
            }
            return result;
        });
        var fragment = table.ownerDocument.createDocumentFragment();
        for (var j = 0, len = trArray.length; j < len; j++) {
            fragment.appendChild(trArray[j]);
        }
        var tbody = table.getElementsByTagName("tbody")[0];
        if (!lastRowIndex) {
            tbody.appendChild(fragment);
        } else {
            tbody.insertBefore(fragment, rows[lastRowIndex - range.endRowIndex + range.beginRowIndex - 1]);
        }
    };
    UE.plugins["tablesort"] = function () {
        var me = this, UT = UE.UETable, getUETable = function (tdOrTable) {
            return UT.getUETable(tdOrTable);
        }, getTableItemsByRange = function (editor) {
            return UT.getTableItemsByRange(editor);
        };
        me.ready(function () {
            utils.cssRule("tablesort", "table.sortEnabled tr.firstRow th,table.sortEnabled tr.firstRow td{padding-right:20px;background-repeat: no-repeat;background-position: center right;" + "   background-image:url(" + me.options.themePath + me.options.theme + "/images/sortable.png);}", me.document);
            me.addListener("afterexeccommand", function (type, cmd) {
                if (cmd == "mergeright" || cmd == "mergedown" || cmd == "mergecells") {
                    this.execCommand("disablesort");
                }
            });
        });
        UE.commands["sorttable"] = {queryCommandState:function () {
            var me = this, tableItems = getTableItemsByRange(me);
            if (!tableItems.cell) {
                return -1;
            }
            var table = tableItems.table, cells = table.getElementsByTagName("td");
            for (var i = 0, cell; cell = cells[i++]; ) {
                if (cell.rowSpan != 1 || cell.colSpan != 1) {
                    return -1;
                }
            }
            return 0;
        }, execCommand:function (cmd, fn) {
            var me = this, range = me.selection.getRange(), bk = range.createBookmark(true), tableItems = getTableItemsByRange(me), cell = tableItems.cell, ut = getUETable(tableItems.table), cellInfo = ut.getCellInfo(cell);
            ut.sortTable(cellInfo.cellIndex, fn);
            range.moveToBookmark(bk);
            try {
                range.select();
            }
            catch (e) {
            }
        }};
        UE.commands["enablesort"] = UE.commands["disablesort"] = {queryCommandState:function (cmd) {
            var table = getTableItemsByRange(this).table;
            if (table && cmd == "enablesort") {
                var cells = domUtils.getElementsByTagName(table, "th td");
                for (var i = 0; i < cells.length; i++) {
                    if (cells[i].getAttribute("colspan") > 1 || cells[i].getAttribute("rowspan") > 1) {
                        return -1;
                    }
                }
            }
            return !table ? -1 : cmd == "enablesort" ^ table.getAttribute("data-sort") != "sortEnabled" ? -1 : 0;
        }, execCommand:function (cmd) {
            var table = getTableItemsByRange(this).table;
            table.setAttribute("data-sort", cmd == "enablesort" ? "sortEnabled" : "sortDisabled");
            cmd == "enablesort" ? domUtils.addClass(table, "sortEnabled") : domUtils.removeClasses(table, "sortEnabled");
        }};
    };
    UE.plugins["basestyle"] = function () {
        var basestyles = {"bold":["strong", "b"], "italic":["em", "i"], "subscript":["sub"], "superscript":["sup"]}, getObj = function (editor, tagNames) {
            return domUtils.filterNodeList(editor.selection.getStartElementPath(), tagNames);
        }, me = this;
        me.addshortcutkey({"Bold":"ctrl+66", "Italic":"ctrl+73", "Underline":"ctrl+85"});
        me.addInputRule(function (root) {
            utils.each(root.getNodesByTagName("b i"), function (node) {
                switch (node.tagName) {
                  case "b":
                    node.tagName = "strong";
                    break;
                  case "i":
                    node.tagName = "em";
                }
            });
        });
        for (var style in basestyles) {
            (function (cmd, tagNames) {
                me.commands[cmd] = {execCommand:function (cmdName) {
                    var range = me.selection.getRange(), obj = getObj(this, tagNames);
                    if (range.collapsed) {
                        if (obj) {
                            var tmpText = me.document.createTextNode("");
                            range.insertNode(tmpText).removeInlineStyle(tagNames);
                            range.setStartBefore(tmpText);
                            domUtils.remove(tmpText);
                        } else {
                            var tmpNode = range.document.createElement(tagNames[0]);
                            if (cmdName == "superscript" || cmdName == "subscript") {
                                tmpText = me.document.createTextNode("");
                                range.insertNode(tmpText).removeInlineStyle(["sub", "sup"]).setStartBefore(tmpText).collapse(true);
                            }
                            range.insertNode(tmpNode).setStart(tmpNode, 0);
                        }
                        range.collapse(true);
                    } else {
                        if (cmdName == "superscript" || cmdName == "subscript") {
                            if (!obj || obj.tagName.toLowerCase() != cmdName) {
                                range.removeInlineStyle(["sub", "sup"]);
                            }
                        }
                        obj ? range.removeInlineStyle(tagNames) : range.applyInlineStyle(tagNames[0]);
                    }
                    range.select();
                }, queryCommandState:function () {
                    return getObj(this, tagNames) ? 1 : 0;
                }};
            })(style, basestyles[style]);
        }
    };
    UE.plugins["elementpath"] = function () {
        var currentLevel, tagNames, me = this;
        me.setOpt("elementPathEnabled", true);
        if (!me.options.elementPathEnabled) {
            return;
        }
        me.commands["elementpath"] = {execCommand:function (cmdName, level) {
            var start = tagNames[level], range = me.selection.getRange();
            currentLevel = level * 1;
            range.selectNode(start).select();
        }, queryCommandValue:function () {
            var parents = [].concat(this.selection.getStartElementPath()).reverse(), names = [];
            tagNames = parents;
            for (var i = 0, ci; ci = parents[i]; i++) {
                if (ci.nodeType == 3) {
                    continue;
                }
                var name = ci.tagName.toLowerCase();
                if (name == "img" && ci.getAttribute("anchorname")) {
                    name = "anchor";
                }
                names[i] = name;
                if (currentLevel == i) {
                    currentLevel = -1;
                    break;
                }
            }
            return names;
        }};
    };
    UE.plugins["formatmatch"] = function () {
        var me = this, list = [], img, flag = 0;
        me.addListener("reset", function () {
            list = [];
            flag = 0;
        });
        function addList(type, evt) {
            if (browser.webkit) {
                var target = evt.target.tagName == "IMG" ? evt.target : null;
            }
            function addFormat(range) {
                if (text) {
                    range.selectNode(text);
                }
                return range.applyInlineStyle(list[list.length - 1].tagName, null, list);
            }
            me.undoManger && me.undoManger.save();
            var range = me.selection.getRange(), imgT = target || range.getClosedNode();
            if (img && imgT && imgT.tagName == "IMG") {
                imgT.style.cssText += ";float:" + (img.style.cssFloat || img.style.styleFloat || "none") + ";display:" + (img.style.display || "inline");
                img = null;
            } else {
                if (!img) {
                    var collapsed = range.collapsed;
                    if (collapsed) {
                        var text = me.document.createTextNode("match");
                        range.insertNode(text).select();
                    }
                    me.__hasEnterExecCommand = true;
                    var removeFormatAttributes = me.options.removeFormatAttributes;
                    me.options.removeFormatAttributes = "";
                    me.execCommand("removeformat");
                    me.options.removeFormatAttributes = removeFormatAttributes;
                    me.__hasEnterExecCommand = false;
                    range = me.selection.getRange();
                    if (list.length) {
                        addFormat(range);
                    }
                    if (text) {
                        range.setStartBefore(text).collapse(true);
                    }
                    range.select();
                    text && domUtils.remove(text);
                }
            }
            me.undoManger && me.undoManger.save();
            me.removeListener("mouseup", addList);
            flag = 0;
        }
        me.commands["formatmatch"] = {execCommand:function (cmdName) {
            if (flag) {
                flag = 0;
                list = [];
                me.removeListener("mouseup", addList);
                return;
            }
            var range = me.selection.getRange();
            img = range.getClosedNode();
            if (!img || img.tagName != "IMG") {
                range.collapse(true).shrinkBoundary();
                var start = range.startContainer;
                list = domUtils.findParents(start, true, function (node) {
                    return !domUtils.isBlockElm(node) && node.nodeType == 1;
                });
                for (var i = 0, ci; ci = list[i]; i++) {
                    if (ci.tagName == "A") {
                        list.splice(i, 1);
                        break;
                    }
                }
            }
            me.addListener("mouseup", addList);
            flag = 1;
        }, queryCommandState:function () {
            return flag;
        }, notNeedUndo:1};
    };
    UE.plugin.register("searchreplace", function () {
        var me = this;
        function findTextInString(textContent, opt, currentIndex) {
            var str = opt.searchStr;
            if (opt.dir == -1) {
                textContent = textContent.split("").reverse().join("");
                str = str.split("").reverse().join("");
                currentIndex = textContent.length - currentIndex;
            }
            var reg = new RegExp(str, "g" + (opt.casesensitive ? "" : "i")), match;
            while (match = reg.exec(textContent)) {
                if (match.index >= currentIndex) {
                    return opt.dir == -1 ? textContent.length - match.index - opt.searchStr.length : match.index;
                }
            }
            return -1;
        }
        function findTextBlockElm(node, currentIndex, opt) {
            var textContent, index, methodName = opt.all || opt.dir == 1 ? "getNextDomNode" : "getPreDomNode";
            if (domUtils.isBody(node)) {
                node = node.firstChild;
            }
            var first = 1;
            while (node) {
                textContent = node.nodeType == 3 ? node.nodeValue : node[browser.ie ? "innerText" : "textContent"];
                index = findTextInString(textContent, opt, currentIndex);
                first = 0;
                if (index != -1) {
                    return {"node":node, "index":index};
                }
                node = domUtils[methodName](node);
                if (node) {
                    currentIndex = opt.dir == -1 ? (node.nodeType == 3 ? node.nodeValue : node[browser.ie ? "innerText" : "textContent"]).length : 0;
                }
            }
        }
        function findNTextInBlockElm(node, index, str) {
            var currentIndex = 0, currentNode = node.firstChild, currentNodeLength = 0, result;
            while (currentNode) {
                if (currentNode.nodeType == 3) {
                    currentNodeLength = currentNode.nodeValue.replace(/(^[\t\r\n]+)|([\t\r\n]+$)/, "").length;
                    currentIndex += currentNodeLength;
                    if (currentIndex >= index) {
                        return {"node":currentNode, "index":currentNodeLength - (currentIndex - index)};
                    }
                } else {
                    if (!dtd.$empty[currentNode.tagName]) {
                        currentNodeLength = currentNode[browser.ie ? "innerText" : "textContent"].replace(/(^[\t\r\n]+)|([\t\r\n]+$)/, "").length;
                        currentIndex += currentNodeLength;
                        if (currentIndex >= index) {
                            result = findNTextInBlockElm(currentNode, currentNodeLength - (currentIndex - index), str);
                            if (result) {
                                return result;
                            }
                        }
                    }
                }
                currentNode = domUtils.getNextDomNode(currentNode);
            }
        }
        function searchReplace(me, opt) {
            var rng = me.selection.getRange(), startBlockNode, searchStr = opt.searchStr, span = me.document.createElement("span");
            span.innerHTML = "$$ueditor_searchreplace_key$$";
            if (!rng.collapsed) {
                rng.select();
                var rngText = me.selection.getText();
                if (new RegExp("^" + opt.searchStr + "$", (opt.casesensitive ? "" : "i")).test(rngText)) {
                    if (opt.replaceStr != undefined) {
                        replaceText(rng, opt.replaceStr);
                        rng.select();
                        return true;
                    } else {
                        rng.collapse(opt.dir == -1);
                    }
                }
            }
            rng.insertNode(span);
            rng.enlargeToBlockElm(true);
            startBlockNode = rng.startContainer;
            var currentIndex = startBlockNode[browser.ie ? "innerText" : "textContent"].indexOf("$$ueditor_searchreplace_key$$");
            rng.setStartBefore(span);
            domUtils.remove(span);
            var result = findTextBlockElm(startBlockNode, currentIndex, opt);
            if (result) {
                var rngStart = findNTextInBlockElm(result.node, result.index, searchStr);
                var rngEnd = findNTextInBlockElm(result.node, result.index + searchStr.length, searchStr);
                rng.setStart(rngStart.node, rngStart.index).setEnd(rngEnd.node, rngEnd.index);
                if (opt.replaceStr !== undefined) {
                    replaceText(rng, opt.replaceStr);
                }
                rng.select();
                return true;
            } else {
                rng.setCursor();
            }
        }
        function replaceText(rng, str) {
            me.fireEvent("saveScene");
            str = me.document.createTextNode(str);
            rng.deleteContents().insertNode(str);
            me.fireEvent("saveScene");
        }
        return {commands:{"searchreplace":{execCommand:function (cmdName, opt) {
            utils.extend(opt, {all:false, casesensitive:false, dir:1}, true);
            var num = 0;
            if (opt.all) {
                var rng = me.selection.getRange(), first = me.body.firstChild;
                if (first && first.nodeType == 1) {
                    rng.setStart(first, 0);
                } else {
                    if (first.nodeType == 3) {
                        rng.setStartBefore(first);
                    }
                }
                rng.collapse(true).select(true);
                while (searchReplace(this, opt)) {
                    num++;
                }
            } else {
                if (searchReplace(this, opt)) {
                    num++;
                }
            }
            return num;
        }, notNeedUndo:1}}};
    });
    UE.plugins["customstyle"] = function () {
        var me = this;
        me.setOpt({"customstyle":[{tag:"h1", name:"tc", style:"font-size:32px;font-weight:bold;border-bottom:#ccc 2px solid;padding:0 4px 0 0;text-align:center;margin:0 0 20px 0;"}, {tag:"h1", name:"tl", style:"font-size:32px;font-weight:bold;border-bottom:#ccc 2px solid;padding:0 4px 0 0;text-align:left;margin:0 0 10px 0;"}, {tag:"span", name:"im", style:"font-size:16px;font-style:italic;font-weight:bold;line-height:18px;"}, {tag:"span", name:"hi", style:"font-size:16px;font-style:italic;font-weight:bold;color:rgb(51, 153, 204);line-height:18px;"}]});
        me.commands["customstyle"] = {execCommand:function (cmdName, obj) {
            var me = this, tagName = obj.tag, node = domUtils.findParent(me.selection.getStart(), function (node) {
                return node.getAttribute("label");
            }, true), range, bk, tmpObj = {};
            for (var p in obj) {
                if (obj[p] !== undefined) {
                    tmpObj[p] = obj[p];
                }
            }
            delete tmpObj.tag;
            if (node && node.getAttribute("label") == obj.label) {
                range = this.selection.getRange();
                bk = range.createBookmark();
                if (range.collapsed) {
                    if (dtd.$block[node.tagName]) {
                        var fillNode = me.document.createElement("p");
                        domUtils.moveChild(node, fillNode);
                        node.parentNode.insertBefore(fillNode, node);
                        domUtils.remove(node);
                    } else {
                        domUtils.remove(node, true);
                    }
                } else {
                    var common = domUtils.getCommonAncestor(bk.start, bk.end), nodes = domUtils.getElementsByTagName(common, tagName);
                    if (new RegExp(tagName, "i").test(common.tagName)) {
                        nodes.push(common);
                    }
                    for (var i = 0, ni; ni = nodes[i++]; ) {
                        if (ni.getAttribute("label") == obj.label) {
                            var ps = domUtils.getPosition(ni, bk.start), pe = domUtils.getPosition(ni, bk.end);
                            if ((ps & domUtils.POSITION_FOLLOWING || ps & domUtils.POSITION_CONTAINS) && (pe & domUtils.POSITION_PRECEDING || pe & domUtils.POSITION_CONTAINS)) {
                                if (dtd.$block[tagName]) {
                                    var fillNode = me.document.createElement("p");
                                    domUtils.moveChild(ni, fillNode);
                                    ni.parentNode.insertBefore(fillNode, ni);
                                }
                            }
                            domUtils.remove(ni, true);
                        }
                    }
                    node = domUtils.findParent(common, function (node) {
                        return node.getAttribute("label") == obj.label;
                    }, true);
                    if (node) {
                        domUtils.remove(node, true);
                    }
                }
                range.moveToBookmark(bk).select();
            } else {
                if (dtd.$block[tagName]) {
                    this.execCommand("paragraph", tagName, tmpObj, "customstyle");
                    range = me.selection.getRange();
                    if (!range.collapsed) {
                        range.collapse();
                        node = domUtils.findParent(me.selection.getStart(), function (node) {
                            return node.getAttribute("label") == obj.label;
                        }, true);
                        var pNode = me.document.createElement("p");
                        domUtils.insertAfter(node, pNode);
                        domUtils.fillNode(me.document, pNode);
                        range.setStart(pNode, 0).setCursor();
                    }
                } else {
                    range = me.selection.getRange();
                    if (range.collapsed) {
                        node = me.document.createElement(tagName);
                        domUtils.setAttributes(node, tmpObj);
                        range.insertNode(node).setStart(node, 0).setCursor();
                        return;
                    }
                    bk = range.createBookmark();
                    range.applyInlineStyle(tagName, tmpObj).moveToBookmark(bk).select();
                }
            }
        }, queryCommandValue:function () {
            var parent = domUtils.filterNodeList(this.selection.getStartElementPath(), function (node) {
                return node.getAttribute("label");
            });
            return parent ? parent.getAttribute("label") : "";
        }};
        me.addListener("keyup", function (type, evt) {
            var keyCode = evt.keyCode || evt.which;
            if (keyCode == 32 || keyCode == 13) {
                var range = me.selection.getRange();
                if (range.collapsed) {
                    var node = domUtils.findParent(me.selection.getStart(), function (node) {
                        return node.getAttribute("label");
                    }, true);
                    if (node && dtd.$block[node.tagName] && domUtils.isEmptyNode(node)) {
                        var p = me.document.createElement("p");
                        domUtils.insertAfter(node, p);
                        domUtils.fillNode(me.document, p);
                        domUtils.remove(node);
                        range.setStart(p, 0).setCursor();
                    }
                }
            }
        });
    };
    UE.commands["insertparagraph"] = {execCommand:function (cmdName, front) {
        var me = this, range = me.selection.getRange(), start = range.startContainer, tmpNode;
        while (start) {
            if (domUtils.isBody(start)) {
                break;
            }
            tmpNode = start;
            start = start.parentNode;
        }
        if (tmpNode) {
            var p = me.document.createElement("p");
            if (front) {
                tmpNode.parentNode.insertBefore(p, tmpNode);
            } else {
                tmpNode.parentNode.insertBefore(p, tmpNode.nextSibling);
            }
            domUtils.fillNode(me.document, p);
            range.setStart(p, 0).setCursor(false, true);
        }
    }};
    UE.plugins["template"] = function () {
        UE.commands["template"] = {execCommand:function (cmd, obj) {
            obj.html && this.execCommand("inserthtml", obj.html);
        }};
        this.addListener("click", function (type, evt) {
            var el = evt.target || evt.srcElement, range = this.selection.getRange();
            var tnode = domUtils.findParent(el, function (node) {
                if (node.className && domUtils.hasClass(node, "ue_t")) {
                    return node;
                }
            }, true);
            tnode && range.selectNode(tnode).shrinkBoundary().select();
        });
        this.addListener("keydown", function (type, evt) {
            var range = this.selection.getRange();
            if (!range.collapsed) {
                if (!evt.ctrlKey && !evt.metaKey && !evt.shiftKey && !evt.altKey) {
                    var tnode = domUtils.findParent(range.startContainer, function (node) {
                        if (node.className && domUtils.hasClass(node, "ue_t")) {
                            return node;
                        }
                    }, true);
                    if (tnode) {
                        domUtils.removeClasses(tnode, ["ue_t"]);
                    }
                }
            }
        });
    };
    UE.plugin.register("music", function () {
        var me = this;
        function creatInsertStr(url, width, height, align, cssfloat, toEmbed) {
            return !toEmbed ? "<img " + (align && !cssfloat ? "align=\"" + align + "\"" : "") + (cssfloat ? "style=\"float:" + cssfloat + "\"" : "") + " width=\"" + width + "\" height=\"" + height + "\" _url=\"" + url + "\" class=\"edui-faked-music\"" + " src=\"" + me.options.langPath + me.options.lang + "/images/music.png\" />" : "<embed type=\"application/x-shockwave-flash\" class=\"edui-faked-music\" pluginspage=\"http://www.macromedia.com/go/getflashplayer\"" + " src=\"" + url + "\" width=\"" + width + "\" height=\"" + height + "\" " + (align && !cssfloat ? "align=\"" + align + "\"" : "") + (cssfloat ? "style=\"float:" + cssfloat + "\"" : "") + " wmode=\"transparent\" play=\"true\" loop=\"false\" menu=\"false\" allowscriptaccess=\"never\" allowfullscreen=\"true\" >";
        }
        return {outputRule:function (root) {
            utils.each(root.getNodesByTagName("img"), function (node) {
                var html;
                if (node.getAttr("class") == "edui-faked-music") {
                    var cssfloat = node.getStyle("float");
                    var align = node.getAttr("align");
                    html = creatInsertStr(node.getAttr("_url"), node.getAttr("width"), node.getAttr("height"), align, cssfloat, true);
                    var embed = UE.uNode.createElement(html);
                    node.parentNode.replaceChild(embed, node);
                }
            });
        }, inputRule:function (root) {
            utils.each(root.getNodesByTagName("embed"), function (node) {
                if (node.getAttr("class") == "edui-faked-music") {
                    var cssfloat = node.getStyle("float");
                    var align = node.getAttr("align");
                    html = creatInsertStr(node.getAttr("src"), node.getAttr("width"), node.getAttr("height"), align, cssfloat, false);
                    var img = UE.uNode.createElement(html);
                    node.parentNode.replaceChild(img, node);
                }
            });
        }, commands:{"music":{execCommand:function (cmd, musicObj) {
            var me = this, str = creatInsertStr(musicObj.url, musicObj.width || 400, musicObj.height || 95, "none", false);
            me.execCommand("inserthtml", str);
        }, queryCommandState:function () {
            var me = this, img = me.selection.getRange().getClosedNode(), flag = img && (img.className == "edui-faked-music");
            return flag ? 1 : 0;
        }}}};
    });
    UE.plugin.register("autoupload", function () {
        var me = this;
        var sendAndInsertImage = function (file, editor) {
            var fd = new FormData();
            fd.append(editor.options.imageFieldName || "upfile", file, file.name || ("blob." + file.type.substr("image/".length)));
            fd.append("type", "ajax");
            var xhr = new XMLHttpRequest();
            xhr.open("post", me.options.imageUrl, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.addEventListener("load", function (e) {
                try {
                    var json = (new Function("return " + e.target.response))(), picLink = me.options.imagePath + json.url;
                    editor.execCommand("insertimage", {src:picLink, _src:picLink});
                }
                catch (er) {
                }
            });
            xhr.send(fd);
        };
        function getPasteImage(e) {
            return e.clipboardData && e.clipboardData.items && e.clipboardData.items.length == 1 && /^image\//.test(e.clipboardData.items[0].type) ? e.clipboardData.items : null;
        }
        function getDropImage(e) {
            return e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : null;
        }
        return {bindEvents:{"ready":function (e) {
            if (window.FormData && window.FileReader) {
                domUtils.on(me.body, "paste drop", function (e) {
                    var hasImg = false, items;
                    items = e.type == "paste" ? getPasteImage(e) : getDropImage(e);
                    if (items) {
                        var len = items.length, file;
                        while (len--) {
                            file = items[len];
                            if (file.getAsFile) {
                                file = file.getAsFile();
                            }
                            if (file && file.size > 0 && /image\/\w+/i.test(file.type)) {
                                sendAndInsertImage(file, me);
                                hasImg = true;
                            }
                        }
                        hasImg && e.preventDefault();
                    }
                });
                domUtils.on(me.body, "dragover", function (e) {
                    if (e.dataTransfer.types[0] == "Files") {
                        e.preventDefault();
                    }
                });
            }
        }}};
    });
    UE.plugin.register("autosave", function () {
        var me = this, lastSaveTime = new Date(), MIN_TIME = 20, saveKey = null;
        var LocalStorage = UE.LocalStorage = (function () {
            var storage = window.localStorage || getUserData() || null, LOCAL_FILE = "localStorage";
            return {saveLocalData:function (key, data) {
                if (storage && data) {
                    storage.setItem(key, data);
                    return true;
                }
                return false;
            }, getLocalData:function (key) {
                if (storage) {
                    return storage.getItem(key);
                }
                return null;
            }, removeItem:function (key) {
                storage && storage.removeItem(key);
            }};
            function getUserData() {
                var container = document.createElement("div");
                container.style.display = "none";
                if (!container.addBehavior) {
                    return null;
                }
                container.addBehavior("#default#userdata");
                return {getItem:function (key) {
                    var result = null;
                    try {
                        document.body.appendChild(container);
                        container.load(LOCAL_FILE);
                        result = container.getAttribute(key);
                        document.body.removeChild(container);
                    }
                    catch (e) {
                    }
                    return result;
                }, setItem:function (key, value) {
                    document.body.appendChild(container);
                    container.setAttribute(key, value);
                    container.save(LOCAL_FILE);
                    document.body.removeChild(container);
                }, removeItem:function (key) {
                    document.body.appendChild(container);
                    container.removeAttribute(key);
                    container.save(LOCAL_FILE);
                    document.body.removeChild(container);
                }};
            }
        })();
        function save(editor) {
            var saveData = null;
            if (new Date() - lastSaveTime < MIN_TIME) {
                return;
            }
            if (!editor.hasContents()) {
                saveKey && LocalStorage.removeItem(saveKey);
                return;
            }
            lastSaveTime = new Date();
            editor._saveFlag = null;
            saveData = me.body.innerHTML;
            if (editor.fireEvent("beforeautosave", {content:saveData}) === false) {
                return;
            }
            LocalStorage.saveLocalData(saveKey, saveData);
            editor.fireEvent("afterautosave", {content:saveData});
        }
        return {defaultOptions:{saveInterval:500}, bindEvents:{"ready":function () {
            var _suffix = "-drafts-data", key = null;
            if (me.key) {
                key = me.key + _suffix;
            } else {
                key = (me.container.parentNode.id || "ue-common") + _suffix;
            }
            saveKey = (location.protocol + location.host + location.pathname).replace(/[.:\/]/g, "_") + key;
        }, "contentchange":function () {
            if (!saveKey) {
                return;
            }
            if (me._saveFlag) {
                window.clearTimeout(me._saveFlag);
            }
            if (me.options.saveInterval > 0) {
                me._saveFlag = window.setTimeout(function () {
                    save(me);
                }, me.options.saveInterval);
            } else {
                save(me);
            }
        }}, commands:{"clearlocaldata":{execCommand:function (cmd, name) {
            if (saveKey && LocalStorage.getLocalData(saveKey)) {
                LocalStorage.removeItem(saveKey);
            }
        }, notNeedUndo:true, ignoreContentChange:true}, "getlocaldata":{execCommand:function (cmd, name) {
            return saveKey ? LocalStorage.getLocalData(saveKey) || "" : "";
        }, notNeedUndo:true, ignoreContentChange:true}, "drafts":{execCommand:function (cmd, name) {
            if (saveKey) {
                me.body.innerHTML = LocalStorage.getLocalData(saveKey) || "<p>" + (browser.ie ? "&nbsp;" : "<br/>") + "</p>";
                me.focus(true);
            }
        }, queryCommandState:function () {
            return saveKey ? (LocalStorage.getLocalData(saveKey) === null ? -1 : 0) : -1;
        }, notNeedUndo:true, ignoreContentChange:true}}};
    });
})();
dorado.widget.ColorPicker = $extend([dorado.widget.Control, dorado.widget.FloatControl], {focusable:true, ATTRIBUTES:{className:{defaultValue:"d-color-picker"}, animateType:{defaultValue:"slide"}, focusAfterShow:{defaultValue:true}, mode:{defaultValue:"simple", setter:function (value) {
    var picker = this, dom = picker._dom;
    if (dom) {
        $fly(dom)[value == "more" ? "addClass" : "removeClass"](picker._className + "-more");
    }
    picker._mode = value;
}}, hideAfterSelect:{defaultValue:true}, hideAfterClear:{defaultValue:true}}, EVENTS:{onSelect:{}, onClear:{}}, createDom:function () {
    var picker = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:picker._className, content:[{tagName:"div", className:"clear-color", contextKey:"clearColor", content:"\u53bb\u9664\u989c\u8272"}, {tagName:"div", className:"color-preview", contextKey:"colorPreview"}, {tagName:"table", className:"simple-color-table", contextKey:"simpleColorTable", cellSpacing:0, cellPadding:0, content:[{tagName:"tbody", contextKey:"simpleColorTableBody"}]}, {tagName:"div", className:"more-color", contextKey:"moreColor", content:"\u66f4\u591a\u989c\u8272..."}, {tagName:"table", className:"more-color-table", contextKey:"moreColorTable", cellSpacing:0, cellPadding:0, content:[{tagName:"tbody", contextKey:"moreColorTableBody"}]}]}, null, doms);
    jQuery(doms.clearColor).click(function () {
        picker.fireEvent("onClear", picker, {});
        if (picker._hideAfterClear) {
            picker.hide();
        }
    }).addClassOnHover("clear-color-over");
    jQuery(doms.moreColor).click(function () {
        picker.set("mode", "more");
    }).addClassOnHover("more-color-over");
    var simpleColor = [["#000000", "#993300", "#333300", "#003300", "#003366", "#000080", "#333399", "#333333"], ["#800000", "#FF6600", "#808000", "#008000", "#008080", "#0000FF", "#666699", "#808080"], ["#FF0000", "#FF9900", "#99CC00", "#339966", "#33CCCC", "#3366FF", "#800080", "#999999"], ["#FF00FF", "#FFCC00", "#FFFF00", "#00FF00", "#00FFFF", "#00CCFF", "#993366", "#C0C0C0"], ["#FF99CC", "#FFCC99", "#FFFF99", "#CCFFCC", "#CCFFFF", "#99CCFF", "#CC99FF", "#FFFFFF"]], i, j, tr, td;
    var simpleColorTableBody = doms.simpleColorTableBody;
    for (i = 0; i < 5; i++) {
        tr = document.createElement("tr");
        for (j = 0; j < 8; j++) {
            td = document.createElement("td");
            td.bgColor = simpleColor[i][j];
            td.innerHTML = "&nbsp;";
            tr.appendChild(td);
        }
        simpleColorTableBody.appendChild(tr);
    }
    function getColor(row, column) {
        var colorArray = ["00", "33", "66", "99", "CC", "FF"];
        var result = "#";
        result += colorArray[row > 5 ? Math.floor(column / 6) + 3 : Math.floor(column / 6)];
        result += colorArray[column % 6 == 6 ? 0 : column % 6];
        result += colorArray[row <= 5 ? row : row - 6];
        return result;
    }
    var moreColorTableBody = doms.moreColorTableBody;
    for (i = 0; i < 12; i++) {
        tr = document.createElement("tr");
        for (j = 0; j < 18; j++) {
            td = document.createElement("td");
            td.bgColor = getColor(i, j);
            td.innerHTML = "&nbsp;";
            tr.appendChild(td);
        }
        moreColorTableBody.appendChild(tr);
    }
    var colorTableMouseOver = function (event) {
        var position = $DomUtils.getCellPosition(event) || {}, row = position.row, column = position.column, element = position.element;
        if (row != -1 && column != -1 && element) {
            doms.colorPreview.style.backgroundColor = element.bgColor;
        }
    };
    var colorTableClick = function (event) {
        var position = $DomUtils.getCellPosition(event) || {}, row = position.row, column = position.column, element = position.element;
        if (row != -1 && column != -1 && element) {
            picker.fireEvent("onSelect", picker, {color:element.bgColor});
            if (picker._hideAfterSelect) {
                picker.hide();
            }
        }
    };
    $fly(doms.simpleColorTable).mouseover(colorTableMouseOver).click(colorTableClick);
    $fly(doms.moreColorTable).mouseover(colorTableMouseOver).click(colorTableClick);
    $fly(dom)[picker._mode == "more" ? "addClass" : "removeClass"](picker._className + "-more");
    return dom;
}, onBlur:function () {
    if (this._visible) {
        this.hide();
    }
}});
dorado.widget.EmoticonPicker = $extend([dorado.widget.Control, dorado.widget.FloatControl], {focusable:true, ATTRIBUTES:{className:{defaultValue:"d-emoticon-picker"}, animateType:{defaultValue:"slide"}, hideAfterSelect:{defaultValue:true}}, EVENTS:{onSelect:{}}, createDom:function () {
    var picker = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:picker._className, content:[{tagName:"table", contextKey:"emoticonTable", border:0, cellSpacing:0, cellPadding:0, content:[{tagName:"tbody", contextKey:"emoticonTableBody"}]}, {tagName:"div", className:"emoticon-preview", contextKey:"emoticonPreview", style:{display:"none"}, content:[{tagName:"img"}]}]}, null, doms);
    picker._doms = doms;
    var emoticonTableBody = doms.emoticonTableBody;
    for (var i = 0; i < 7; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < 15; j++) {
            var index = i * 15 + j, source = ">skin>/html-editor/emotion/" + index + ".gif";
            var td = document.createElement("td");
            td.className = "emoticon-cell";
            td.source = $url(source);
            tr.appendChild(td);
        }
        emoticonTableBody.appendChild(tr);
    }
    $fly(doms.emoticonTable).mouseover(function (event) {
        var position = $DomUtils.getCellPosition(event) || {}, element = position.element;
        if (element) {
            if (picker.lastElement) {
                $fly(picker.lastElement).removeClass("cur-emoticon-cell");
            }
            $fly(element).addClass("cur-emoticon-cell");
            picker.lastElement = element;
            doms.emoticonPreview.style.display = "";
            doms.emoticonPreview.firstChild.src = element.source;
        }
    }).mouseout(function () {
        doms.emoticonPreview.style.display = "none";
    }).click(function (event) {
        var position = $DomUtils.getCellPosition(event) || {}, element = position.element;
        var source = element.source;
        if (source) {
            picker.fireEvent("onSelect", picker, {image:source});
            if (picker._hideAfterSelect) {
                picker.hide();
            }
        }
    });
    $fly(doms.emoticonPreview).mouseover(function () {
        if (this.style.right == "auto") {
            this.style.right = 0;
            this.style.left = "auto";
        } else {
            this.style.left = 0;
            this.style.right = "auto";
        }
    });
    return dom;
}, onBlur:function () {
    if (this._visible) {
        this.hide();
    }
}});
dorado.widget.GridPicker = $extend(dorado.widget.Control, {focusable:true, ATTRIBUTES:{className:{defaultValue:"d-grid-picker"}, animateType:{defaultValue:"slide"}, hideAfterSelect:{defaultValue:true}, column:{defaultValue:10}, elements:{}}, EVENTS:{onSelect:{}}, createDom:function () {
    var picker = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:picker._className, content:[{tagName:"table", contextKey:"gridTable", border:0, cellSpacing:0, cellPadding:0, content:[{tagName:"tbody", contextKey:"gridTableBody"}]}, {tagName:"div", className:"element-preview", contextKey:"elementPreview", style:{display:"none"}, content:[{tagName:"div"}]}]}, null, doms);
    picker._doms = doms;
    var gridTableBody = doms.gridTableBody, elements = picker._elements || [], elementsCount = elements.length, column = picker._column || 10, row = Math.ceil(elementsCount / column);
    for (var i = 0; i < row; i++) {
        var tr = document.createElement("tr");
        for (var j = 0; j < column; j++) {
            var index = i * column + j;
            var td = document.createElement("td");
            td.className = "element-cell";
            if (index < elementsCount) {
                $fly(td).html(elements[index]);
            } else {
                break;
            }
            tr.appendChild(td);
        }
        gridTableBody.appendChild(tr);
    }
    $fly(doms.gridTable).mouseover(function (event) {
        var position = $DomUtils.getCellPosition(event) || {}, element = position.element;
        if (element) {
            if (picker.lastElement) {
                $fly(picker.lastElement).removeClass("cur-element-cell");
            }
            $fly(element).addClass("cur-element-cell");
            picker.lastElement = element;
            doms.elementPreview.style.display = "";
            doms.elementPreview.firstChild.innerHTML = element.innerHTML;
        }
    }).mouseout(function () {
        doms.elementPreview.style.display = "none";
    }).click(function (event) {
        var position = $DomUtils.getCellPosition(event) || {}, element = position.element;
        var source = element.innerHTML;
        if (source) {
            picker.fireEvent("onSelect", picker, {element:source});
        }
    });
    $fly(doms.elementPreview).mouseover(function () {
        if (this.style.right == "auto") {
            this.style.right = 0;
            this.style.left = "auto";
        } else {
            this.style.left = 0;
            this.style.right = "auto";
        }
    });
    return dom;
}, onBlur:function () {
    if (this._visible) {
    }
}});
(function () {
    window.UEDITOR_CONFIG.sourceEditor = "textarea";
    dorado.htmleditor = {fullMode:["FullScreen", "Source", "|", "Undo", "Redo", "|", "Bold", "Italic", "Underline", "StrikeThrough", "Superscript", "Subscript", "RemoveFormat", "FormatMatch", "|", "BlockQuote", "|", "PastePlain", "|", "ForeColor", "BackColor", "InsertOrderedList", "InsertUnorderedList", "|", "Paragraph", "LineHeight", "FontFamily", "FontSize", "|", "DirectionalityLtr", "DirectionalityRtl", "|", "Indent", "Outdent", "|", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyJustify", "|", "Link", "Unlink", "Anchor", "Image", "Emoticon", "Flash", "|", "Horizontal", "Date", "Time", "Spechars", "Map", "GMap", "|", "InsertTable", "DeleteTable", "InsertParagraphBeforeTable", "InsertRow", "DeleteRow", "InsertCol", "DeleteCol", "MergeCells", "MergeRight", "MergeDown", "SplittoCells", "SplittoRows", "SplittoCols", "|", "SelectAll", "ClearDoc", "SearchReplace", "Print", "Preview", "Help"], simpleMode:["FullScreen", "Source", "|", "Undo", "Redo", "|", "Bold", "Italic", "Underline", "StrikeThrough", "Superscript", "Subscript", "RemoveFormat", "|", "ForeColor", "BackColor", "InsertOrderedList", "InsertUnorderedList", "|", "Paragraph", "LineHeight", "FontFamily", "FontSize", "|", "Indent", "Outdent", "|", "JustifyLeft", "JustifyCenter", "JustifyRight", "JustifyJustify", "|", "Link", "Unlink", "Horizontal", "Image", "|", "SelectAll", "ClearDoc", "SearchReplace", "Print", "Preview", "Help"], registerMode:function (name, config) {
        if (name && config) {
            dorado.htmleditor[name + "Mode"] = config;
        }
    }, defaultLabelMap:{"anchor":"\u951a\u70b9", "undo":"\u64a4\u9500", "redo":"\u91cd\u505a", "bold":"\u52a0\u7c97", "indent":"\u9996\u884c\u7f29\u8fdb", "outdent":"\u53d6\u6d88\u7f29\u8fdb", "italic":"\u659c\u4f53", "underline":"\u4e0b\u5212\u7ebf", "strikethrough":"\u5220\u9664\u7ebf", "subscript":"\u4e0b\u6807", "superscript":"\u4e0a\u6807", "formatmatch":"\u683c\u5f0f\u5237", "source":"\u6e90\u4ee3\u7801", "blockquote":"\u5f15\u7528", "pasteplain":"\u7eaf\u6587\u672c\u7c98\u8d34\u6a21\u5f0f", "selectall":"\u5168\u9009", "print":"\u6253\u5370", "preview":"\u9884\u89c8", "horizontal":"\u5206\u9694\u7ebf", "removeformat":"\u6e05\u9664\u683c\u5f0f", "time":"\u65f6\u95f4", "date":"\u65e5\u671f", "unlink":"\u795b\u9664\u94fe\u63a5", "insertrow":"\u524d\u63d2\u5165\u884c", "insertcol":"\u524d\u63d2\u5165\u5217", "mergeright":"\u53f3\u5408\u5e76\u5355\u5143\u683c", "mergedown":"\u4e0b\u5408\u5e76\u5355\u5143\u683c", "deleterow":"\u5220\u9664\u884c", "deletecol":"\u5220\u9664\u5217", "splittorows":"\u62c6\u5206\u6210\u884c", "splittocols":"\u62c6\u5206\u6210\u5217", "splittocells":"\u5b8c\u5168\u62c6\u5206\u5355\u5143\u683c", "mergecells":"\u5408\u5e76\u591a\u4e2a\u5355\u5143\u683c", "deletetable":"\u5220\u9664\u8868\u683c", "insertparagraphbeforetable":"\u8868\u683c\u524d\u63d2\u884c", "cleardoc":"\u6e05\u7a7a\u6587\u6863", "fontfamily":"\u5b57\u4f53", "fontsize":"\u5b57\u53f7", "paragraph":"\u683c\u5f0f", "image":"\u56fe\u7247", "inserttable":"\u8868\u683c", "link":"\u8d85\u94fe\u63a5", "emoticon":"\u8868\u60c5", "spechars":"\u7279\u6b8a\u5b57\u7b26", "searchreplace":"\u67e5\u8be2\u66ff\u6362", "map":"Baidu\u5730\u56fe", "gmap":"Google\u5730\u56fe", "video":"\u89c6\u9891", "help":"\u5e2e\u52a9", "justifyleft":"\u5c45\u5de6\u5bf9\u9f50", "justifyright":"\u5c45\u53f3\u5bf9\u9f50", "justifycenter":"\u5c45\u4e2d\u5bf9\u9f50", "justifyjustify":"\u4e24\u7aef\u5bf9\u9f50", "forecolor":"\u5b57\u4f53\u989c\u8272", "backcolor":"\u80cc\u666f\u8272", "insertorderedlist":"\u6709\u5e8f\u5217\u8868", "insertunorderedlist":"\u65e0\u5e8f\u5217\u8868", "fullscreen":"\u5168\u5c4f", "directionalityltr":"\u4ece\u5de6\u5411\u53f3\u8f93\u5165", "directionalityrtl":"\u4ece\u53f3\u5411\u5de6\u8f93\u5165", "lineheight":"\u884c\u8ddd", "code":"\u63d2\u5165\u4ee3\u7801"}, defaultListMap:{"fontfamily":["\u5b8b\u4f53", "\u6977\u4f53", "\u96b6\u4e66", "\u9ed1\u4f53", "andale mono", "arial", "arial black", "comic sans ms", "impact", "times new roman"], "fontsize":[10, 11, 12, 14, 16, 18, 20, 24, 36], "underline":["none", "overline", "line-through", "underline"], "paragraph":["p:Paragraph", "h1:Heading 1", "h2:Heading 2", "h3:Heading 3", "h4:Heading 4", "h5:Heading 5", "h6:Heading 6"], "rowspacing":["1.0:0", "1.5:15", "2.0:20", "2.5:25", "3.0:30"], "lineheight":["1", "1.5", "1.75", "2", "3", "4", "5"]}, FONT_MAP:{"\u5b8b\u4f53":["\u5b8b\u4f53", "SimSun"], "\u6977\u4f53":["\u6977\u4f53", "\u6977\u4f53_GB2312", "SimKai"], "\u9ed1\u4f53":["\u9ed1\u4f53", "SimHei"], "\u96b6\u4e66":["\u96b6\u4e66", "SimLi"], "andale mono":["andale mono"], "arial":["arial", "helvetica", "sans-serif"], "arial black":["arial black", "avant garde"], "comic sans ms":["comic sans ms"], "impact":["impact", "chicago"], "times new roman":["times new roman"]}};
    var initialStyle = ".selectTdClass{background-color:#3399FF !important}" + "table{clear:both;margin-bottom:10px;border-collapse:collapse;word-break:break-all;}" + ".pagebreak{display:block;clear:both !important;cursor:default !important;width: 100% !important;margin:0;}" + ".view{padding:0;word-wrap:break-word;word-break:break-all;cursor:text;height:100%;}\n" + "li{clear:both}" + "p{margin:5px 0;}";
    dorado.htmleditor.ToolBar = $extend(dorado.widget.Control, {$className:"dorado.htmleditor.ToolBar", focusable:true, ATTRIBUTES:{className:{defaultValue:"d-htmleditor-toolbar"}, items:{}}, createItem:function (config) {
        if (!config) {
            return null;
        }
        if (typeof config == "string" || config.constructor == Object.prototype.constructor) {
            var result = dorado.Toolkits.createInstance("toolbar,widget", config);
            result._parent = result._focusParent = this;
            return result;
        } else {
            config._parent = config._focusParent = this;
            return config;
        }
    }, addItem:function (item, index) {
        var toolbar = this, items = toolbar._items;
        if (!item) {
            return null;
        }
        if (!items) {
            items = toolbar._items = new dorado.util.KeyedArray(function (value) {
                return value._id;
            });
        }
        item = toolbar.createItem(item);
        if (toolbar._rendered) {
            var refDom = null, dom = toolbar._dom;
            if (typeof index == "number") {
                var refItem = items[index];
                refDom = refItem._dom;
            }
            items.insert(item, index);
            item.render(dom);
            toolbar.registerInnerControl(item);
        } else {
            items.insert(item, index);
        }
        return item;
    }, createDom:function () {
        var bar = this, dom = document.createElement("div"), items = bar._items || [];
        dom.className = bar._className;
        for (var i = 0, j = items.size; i < j; i++) {
            var item = items.get(i);
            bar.registerInnerControl(item);
            item.render(dom);
            if (item instanceof dorado.widget.TextEditor) {
                $fly(item._dom).addClass("i-text-box");
            }
        }
        return dom;
    }});
    dorado.widget.HtmlEditor = $extend(dorado.widget.AbstractDataEditor, {$className:"dorado.widget.HtmlEditor", focusable:true, ATTRIBUTES:{className:{defaultValue:"d-html-editor"}, mode:{defaultValue:"full"}, content:{getter:function () {
        var editor = this._editor;
        if (editor) {
            return editor.getContent();
        }
        return "";
    }, setter:function (value) {
        var editor = this._editor;
        if (editor) {
            editor._setContenting = true;
            var result = editor.setContent(value || "");
            editor._setContenting = false;
            return result;
        }
    }}, readOnly:{setter:function (value) {
        this._readOnly = value;
        this.doOnReadOnlyChange(value);
    }}, defaultFontSize:{defaultValue:"16px"}, defaultFontFamily:{defaultValue:"\u5b8b\u4f53"}, fileUploadPath:{defaultValue:">dorado/htmleditor/fileupload"}, flashUploadPath:{defaultValue:">dorado/htmleditor/flashupload"}, imageUploadPath:{defaultValue:">dorado/htmleditor/imageupload"}}, showToolBar:function () {
        var editor = this, doms = editor._doms;
        if (doms) {
            var toolbar = doms.toolbar;
            $fly(toolbar).css("display", "");
            editor.doOnResize();
        }
    }, hideToolBar:function () {
        var editor = this, doms = editor._doms;
        if (doms) {
            var toolbar = doms.toolbar;
            $fly(toolbar).css("display", "none");
            editor.doOnResize();
        }
    }, doOnFocus:function () {
    }, doOnBlur:function () {
        var editor = this;
        editor._lastPostValue = editor._value;
        editor._value = editor.get("content");
        editor._dirty = true;
        try {
            editor.post();
        }
        catch (e) {
            editor._value = editor._lastPostValue;
            editor._dirty = false;
            throw e;
        }
        editor.refresh();
    }, doOnReadOnlyChange:function (readOnly) {
        var htmleditor = this, editor = htmleditor._editor;
        if (readOnly === undefined) {
            readOnly = htmleditor._readOnly || htmleditor._readOnly2;
        }
        if (!editor || !editor.document) {
            return;
        }
        editor._readOnly = readOnly;
        if (readOnly) {
            editor.setDisabled();
        } else {
            editor.setEnabled();
        }
        htmleditor.checkStatus();
    }, post:function () {
        try {
            if (!this._dirty) {
                return false;
            }
            var eventArg = {processDefault:true};
            this.fireEvent("beforePost", this, eventArg);
            if (eventArg.processDefault === false) {
                return false;
            }
            this.doPost();
            this._lastPostValue = this._value;
            this._dirty = false;
            this.fireEvent("onPost", this);
            return true;
        }
        catch (e) {
            dorado.Exception.processException(e);
        }
    }, doOnAttachToDocument:function () {
        var htmleditor = this;
        $invokeSuper.call(this, arguments);
        var fontString = "body{background-color:white;margin:8px;font-family:'" + htmleditor._defaultFontFamily + "';font-size:" + htmleditor._defaultFontSize + ";}";
        var option = {UEDITOR_HOME_URL:"", initialContent:htmleditor._value, minFrameHeight:100, initialStyle:"" + fontString, iframeCssUrl:$url(">skin>/html-editor/iframe.css"), selectedTdClass:"selectTdClass", autoHeightEnabled:false, pasteplain:0, langPath:$url(">dorado/client/resources/ueditor-lang/")};
        var editor = new baidu.editor.Editor(option);
        this._editor = editor;
        editor.addListener("selectionchange", function () {
            htmleditor.checkStatus();
        });
        editor.ready(function () {
            htmleditor._editorReady = true;
            $fly(editor.iframe.contentWindow.document).bind("scroll", function () {
                if (popup._visible) {
                    htmleditor.updatePopupPosition();
                }
            });
            $fly(editor.iframe.contentWindow.document.body).focusin(function () {
                dorado.widget.setFocusedControl(htmleditor);
            });
            if (!htmleditor._dataSet) {
                htmleditor.doOnReadOnlyChange(htmleditor._readOnly);
            } else {
                htmleditor.doOnReadOnlyChange(htmleditor.doGetReadOnly());
            }
            htmleditor.refresh();
            htmleditor.checkStatus();
            htmleditor.doOnResize();
        });
        var popup = new dorado.widget.FloatContainer({exClassName:"popup", animateType:"none"});
        popup.focusable = false;
        htmleditor._popup = popup;
        jQuery.extend(popup, {_onEditButtonClick:function () {
            this.hide();
            htmleditor.executePlugin("Link");
        }, _onImgEditButtonClick:function () {
            this.hide();
            var nodeStart = editor.selection.getRange().getClosedNode();
            var img = baidu.editor.dom.domUtils.findParentByTagName(nodeStart, "img", true);
            if (img && img.className.indexOf("edui-faked-video") != -1) {
                htmleditor.executePlugin("Flash");
            } else {
                if (img && img.src.indexOf("http://api.map.baidu.com") != -1) {
                    htmleditor.executePlugin("Map");
                } else {
                    if (img && img.src.indexOf("http://maps.google.com/maps/api/staticmap") != -1) {
                        htmleditor.executePlugin("GMap");
                    } else {
                        if (img && img.getAttribute("anchorname")) {
                            htmleditor.executePlugin("Anchor");
                        } else {
                            htmleditor.executePlugin("Image");
                        }
                    }
                }
            }
        }, _onImgSetFloat:function (event, value) {
            var nodeStart = editor.selection.getRange().getClosedNode();
            var img = baidu.editor.dom.domUtils.findParentByTagName(nodeStart, "img", true);
            if (img) {
                switch (value) {
                  case -2:
                    if (!!window.ActiveXObject) {
                        img.style.removeAttribute("display");
                        img.style.styleFloat = "";
                    } else {
                        img.style.removeProperty("display");
                        img.style.cssFloat = "";
                    }
                    break;
                  case -1:
                    if (!!window.ActiveXObject) {
                        img.style.removeAttribute("display");
                        img.style.styleFloat = "left";
                    } else {
                        img.style.removeProperty("display");
                        img.style.cssFloat = "left";
                    }
                    break;
                  case 1:
                    if (!!window.ActiveXObject) {
                        img.style.removeAttribute("display");
                        img.style.styleFloat = "right";
                    } else {
                        img.style.removeProperty("display");
                        img.style.cssFloat = "right";
                    }
                    break;
                  case 2:
                    if (!!window.ActiveXObject) {
                        img.style.styleFloat = "";
                        img.style.display = "block";
                    } else {
                        img.style.cssFloat = "";
                        img.style.display = "block";
                    }
                }
                htmleditor.updatePopupPosition(img);
            }
        }, _onRemoveButtonClick:function () {
            var nodeStart = editor.selection.getRange().getClosedNode();
            var img = baidu.editor.dom.domUtils.findParentByTagName(nodeStart, "img", true);
            if (img && img.getAttribute("anchorname")) {
                editor.execCommand("anchor");
            } else {
                editor.execCommand("unlink");
            }
            this.hide();
        }});
        var popupId = htmleditor._uniqueId + "_imageLinkPopup";
        window[popupId] = popup;
        editor.addListener("sourcemodechanged", function () {
            popup.hide();
        });
        editor.addListener("selectionchange", function (t, evt) {
            try {
                dorado.widget.setFocusedControl(htmleditor);
            }
            catch (e) {
            }
            var html = "", img = editor.selection.getRange().getClosedNode(), imglink = baidu.editor.dom.domUtils.findParentByTagName(img, "a", true);
            if (imglink != null) {
                html += "<nobr>\u5c5e\u6027: <span class=\"unclickable\">\u9ed8\u8ba4</span>&nbsp;&nbsp;<span class=\"unclickable\">\u5de6\u6d6e\u52a8</span>&nbsp;&nbsp;<span class=\"unclickable\">\u53f3\u6d6e\u52a8</span>&nbsp;&nbsp;" + "<span class=\"unclickable\">\u72ec\u5360\u4e00\u884c</span>" + " <span onclick=\"$$._onImgEditButtonClick(event, this);\" class=\"clickable\">\u4fee\u6539</span></nobr>";
            } else {
                if (img != null && img.tagName.toLowerCase() == "img") {
                    if (img.getAttribute("anchorname")) {
                        html += "<nobr>\u5c5e\u6027: <span onclick=$$._onImgEditButtonClick(event) class=\"clickable\">\u4fee\u6539</span>&nbsp;&nbsp;<span onclick=$$._onRemoveButtonClick(event) class=\"clickable\">\u5220\u9664</span></nobr>";
                    } else {
                        html += "<nobr>\u5c5e\u6027: <span onclick=$$._onImgSetFloat(event,-2) class=\"clickable\">\u9ed8\u8ba4</span>&nbsp;&nbsp;<span onclick=$$._onImgSetFloat(event,-1) class=\"clickable\">\u5de6\u6d6e\u52a8</span>&nbsp;&nbsp;<span onclick=$$._onImgSetFloat(event,1) class=\"clickable\">\u53f3\u6d6e\u52a8</span>&nbsp;&nbsp;" + "<span onclick=$$._onImgSetFloat(event,2) class=\"clickable\">\u72ec\u5360\u4e00\u884c</span>" + " <span onclick=\"$$._onImgEditButtonClick(event, this);\" class=\"clickable\">\u4fee\u6539</span></nobr>";
                    }
                }
            }
            var link;
            if (editor.selection.getRange().collapsed) {
                link = editor.queryCommandValue("link");
            } else {
                link = editor.selection.getStart();
            }
            link = baidu.editor.dom.domUtils.findParentByTagName(link, "a", true);
            var url;
            if (link != null && (url = link.getAttribute("href", 2)) != null) {
                var txt = url;
                if (url.length > 30) {
                    txt = url.substring(0, 20) + "...";
                }
                if (html) {
                    html += "<div style=\"height:5px;\"></div>";
                }
                html += "<nobr>\u94fe\u63a5: <a target=\"_blank\" href=\"" + url + "\" title=\"" + url + "\" >" + txt + "</a>" + " <span class=\"clickable\" onclick=\"$$._onEditButtonClick(event, this);\">\u4fee\u6539</span>" + " <span class=\"clickable\" onclick=\"$$._onRemoveButtonClick(event, this);\"> \u6e05\u9664</span></nobr>";
            }
            if (html) {
                popup.getDom().innerHTML = html.replace(/\$\$/g, popupId);
                htmleditor.updatePopupPosition(img || link);
            } else {
                popup.hide();
            }
        });
        editor.render(this._doms.editorWrap);
    }, updatePopupPosition:function (anchorTarget) {
        var htmleditor = this, editor = htmleditor._editor, iframe = editor.iframe;
        if (!anchorTarget) {
            anchorTarget = htmleditor._lastAnchorTarget;
        }
        htmleditor._lastAnchorTarget = anchorTarget;
        var editorPosition = $fly(iframe).offset(), editorWidth = iframe.offsetWidth, editorHeight = iframe.offsetHeight;
        var targetPosition = $fly(anchorTarget).position(), targetWidth = $fly(anchorTarget).width(), targetHeight = $fly(anchorTarget).height(), scrollTop = $fly(iframe.contentWindow.document.body).scrollTop();
        var editorRect = {left:editorPosition.left, top:editorPosition.top, right:editorPosition.left + editorWidth, bottom:editorPosition.top + editorHeight, width:editorWidth, height:editorHeight};
        var targetRect = {left:editorPosition.left + targetPosition.left, top:editorPosition.top + targetPosition.top - scrollTop, right:editorPosition.left + targetPosition.left + targetWidth, bottom:editorPosition.top + targetPosition.top - scrollTop + targetHeight, width:targetWidth, height:targetHeight};
        var targetVisible = true;
        if (targetRect.top > editorRect.bottom || targetRect.bottom < editorRect.top) {
            targetVisible = false;
        }
        if (targetVisible) {
            var position = {};
            if (targetRect.bottom + 5 > editorRect.bottom) {
                position.left = targetRect.left;
                position.top = editorRect.bottom - htmleditor._popup._dom.offsetHeight;
            } else {
                position.left = targetRect.left;
                position.top = targetRect.top + targetHeight;
            }
            htmleditor._popup.show({position:position, autoAdjustPosition:false});
        } else {
            htmleditor._popup.hide();
        }
    }, createDom:function () {
        var editor = this, doms = {}, dom = $DomUtils.xCreate({tagName:"div", className:editor._className, content:[{tagName:"div", className:"toolbar-wrap", contextKey:"toolbar"}, {tagName:"div", className:"editor-wrap", contextKey:"editorWrap"}]}, null, doms);
        editor._doms = doms;
        editor.initPlugins();
        return dom;
    }, executePlugin:function (name) {
        var plugin = this._plugins[name];
        if (plugin) {
            plugin.execute();
        }
    }, initPlugins:function () {
        var editor = this, mode = editor._mode || "default", toolbarConfig = dorado.htmleditor[mode + "Mode"] || [], toolbar = new dorado.htmleditor.ToolBar();
        editor._plugins = {};
        for (var j = 0, l = toolbarConfig.length; j < l; j++) {
            var pluginName = toolbarConfig[j];
            if (pluginName == "|") {
                toolbar.addItem("-");
            } else {
                var pluginConfig = plugins[pluginName];
                pluginConfig.htmlEditor = editor;
                if (pluginConfig.iconClass == undefined && pluginConfig.command) {
                    pluginConfig.iconClass = "html-editor-icon " + pluginConfig.command;
                }
                var plugin = new dorado.htmleditor.HtmlEditorPlugIn(pluginConfig);
                if (pluginConfig.execute) {
                    plugin.execute = pluginConfig.execute;
                }
                if (pluginConfig.initToolBar) {
                    plugin.initToolBar = pluginConfig.initToolBar;
                }
                if (pluginConfig.checkStatus) {
                    plugin.checkStatus = pluginConfig.checkStatus;
                }
                if (pluginConfig.onStatusChange) {
                    plugin.onStatusChange = pluginConfig.onStatusChange;
                }
                plugin._name = pluginName;
                plugin.initToolBar(toolbar);
                editor._plugins[pluginName] = plugin;
            }
        }
        editor.registerInnerControl(toolbar);
        toolbar.render(editor._doms.toolbar);
    }, doOnResize:function () {
        var htmleditor = this, dom = htmleditor._dom, doms = htmleditor._doms;
        if (dom) {
            var toolBarHeight = doms.toolbar.offsetHeight, height = dom.clientHeight;
            if (htmleditor._editor && htmleditor._editorReady) {
                htmleditor._editor.setHeight(height - toolBarHeight > 20 ? height - toolBarHeight : 20);
            }
        }
    }, checkStatus:function () {
        var editor = this, plugins = editor._plugins;
        for (var name in plugins) {
            var plugin = plugins[name];
            if (plugin.checkStatus) {
                try {
                    plugin.checkStatus();
                }
                catch (e) {
                    if (console && console.log) {
                        console.log(e);
                    }
                }
            }
        }
    }, doGetReadOnly:function () {
        var editor = this, readOnly = editor._dataSet._readOnly;
        if (editor._property) {
            var bindingInfo = editor._bindingInfo;
            readOnly = readOnly || (bindingInfo.entity == null) || bindingInfo.propertyDef.get("readOnly");
        } else {
            readOnly = true;
        }
        return readOnly || editor._readOnly;
    }, refreshDom:function () {
        $invokeSuper.call(this, arguments);
        var editor = this;
        if (editor._dataSet) {
            var value, dirty, readOnly = editor._dataSet._readOnly;
            if (editor._property) {
                var bindingInfo = editor._bindingInfo;
                if (bindingInfo.entity instanceof dorado.Entity) {
                    value = bindingInfo.entity.get(editor._property);
                    dirty = bindingInfo.entity.isDirty(editor._property);
                }
                readOnly = readOnly || (bindingInfo.entity == null) || bindingInfo.propertyDef.get("readOnly");
                editor._readOnly2 = readOnly;
            } else {
                readOnly = true;
            }
            readOnly = editor._readOnly || readOnly;
            var oldReadOnly = editor._oldReadOnly;
            editor._oldReadOnly = !!readOnly;
            if (editor._editor && editor.get("content") != value) {
                editor._setContenting = true;
                editor._editor.setContent(value || "");
                editor._setContenting = false;
                editor._value = value;
            }
            if (oldReadOnly !== readOnly) {
                editor.doOnReadOnlyChange(!!readOnly);
            }
            editor.setDirty(dirty);
        }
    }});
    dorado.htmleditor.HtmlEditorPlugIn = $extend(dorado.AttributeSupport, {constructor:function (options) {
        if (options) {
            this.set(options, {skipUnknownAttribute:true});
        }
    }, ATTRIBUTES:{name:{}, label:{}, icon:{}, iconClass:{}, command:{}, parameter:{}, htmlEditor:{}, statusToggleable:{}, status:{setter:function (value) {
        this.onStatusChange && this.onStatusChange(value);
        this._status = value;
    }}}, onStatusChange:function (status) {
        var plugin = this, button = plugin.button;
        if (button) {
            button.set("disabled", status == "disable");
            if (status == "on") {
                button.set("toggled", true);
            } else {
                button.set("toggled", false);
            }
        }
    }, execute:function () {
        var plugin = this, htmlEditor = plugin._htmlEditor;
        if (plugin._command && htmlEditor) {
            htmlEditor._editor.execCommand(plugin._command, plugin._parameter);
        }
    }, execCommand:function (cmd, value) {
        var plugin = this, htmlEditor = plugin._htmlEditor;
        if (htmlEditor && htmlEditor._editor) {
            htmlEditor._editor.execCommand(cmd, value);
        }
    }, insertHtml:function (html) {
        this.execCommand("inserthtml", html);
    }, queryCommandValue:function (cmd) {
        var plugin = this, htmlEditor = plugin._htmlEditor;
        if (htmlEditor && htmlEditor._editor) {
            return htmlEditor._editor.queryCommandValue(cmd);
        }
    }, queryCommandState:function (cmd) {
        var plugin = this, htmlEditor = plugin._htmlEditor;
        if (htmlEditor && htmlEditor._editor) {
            return htmlEditor._editor.queryCommandState(cmd);
        }
    }, initToolBar:function (toolbar) {
        var plugin = this, labels = dorado.htmleditor.defaultLabelMap;
        plugin.button = toolbar.addItem({$type:"SimpleIconButton", icon:plugin._icon, tip:plugin.tip || labels[plugin._name.toLowerCase()], iconClass:plugin._iconClass, listener:{onClick:function () {
            plugin.onClick();
        }}});
    }, onClick:function () {
        var plugin = this;
        if (plugin._status != "disable") {
            plugin.execute.apply(this, arguments);
        }
    }, checkStatus:function () {
        var plugin = this, heditor = plugin._htmlEditor, editor = plugin._htmlEditor._editor, result;
        if (heditor._readOnly || heditor._readOnly2) {
            plugin.set("status", "disable");
            return;
        } else {
            if (!plugin._command) {
                plugin.set("status", "enable");
                return;
            }
        }
        if (plugin._statusToggleable) {
            try {
                result = editor.queryCommandState(plugin._command);
                if (result === 1 || result === true) {
                    plugin.set("status", "on");
                } else {
                    if (result === 0 || result === false) {
                        plugin.set("status", "enable");
                    } else {
                        if (result === -1) {
                            plugin.set("status", "disable");
                        }
                    }
                }
            }
            catch (e) {
            }
        } else {
            try {
                result = editor.queryCommandState(plugin._command);
                if (result === -1) {
                    plugin.set("status", "disable");
                } else {
                    plugin.set("status", "enable");
                }
            }
            catch (e) {
            }
        }
    }});
    var pcheckStatus = function () {
        var plugin = this, heditor = plugin._htmlEditor, editor = plugin._htmlEditor._editor;
        try {
            if (heditor._readOnly || heditor._readOnly2) {
                plugin.set("status", "disable");
                return;
            }
            var status = editor.queryCommandState(plugin._command);
            if (status == -1) {
                plugin.set("status", "disable");
                return;
            }
            var value = editor.queryCommandValue(plugin._command);
            if (value === plugin._parameter) {
                plugin.set("status", "on");
            } else {
                plugin.set("status", "enable");
            }
        }
        catch (e) {
        }
    };
    var plugins = dorado.htmleditor.plugins = {Source:{command:"source"}, DirectionalityLtr:{iconClass:"html-editor-icon directionalityltr", command:"directionality", parameter:"ltr", statusToggleable:true, checkStatus:pcheckStatus}, DirectionalityRtl:{iconClass:"html-editor-icon directionalityrtl", command:"directionality", parameter:"rtl", statusToggleable:true, checkStatus:pcheckStatus}, JustifyCenter:{iconClass:"html-editor-icon justifycenter", command:"justify", parameter:"center", statusToggleable:true, checkStatus:pcheckStatus}, JustifyLeft:{iconClass:"html-editor-icon justifyleft", command:"justify", parameter:"left", statusToggleable:true, checkStatus:pcheckStatus}, JustifyRight:{iconClass:"html-editor-icon justifyright", command:"justify", parameter:"right", statusToggleable:true, checkStatus:pcheckStatus}, JustifyJustify:{iconClass:"html-editor-icon justifyjustify", command:"justify", parameter:"justify", statusToggleable:true, checkStatus:pcheckStatus}, FullScreen:{iconClass:"html-editor-icon fullscreen", statusToggleable:true, execute:function () {
        var editor = this._htmlEditor;
        if (!editor._maximized) {
            editor._originalWidth = editor._width;
            editor._originalHeight = editor._height;
            editor._originalRealWidth = editor._realWidth;
            editor._originalRealHeight = editor._realHeight;
            $fly(editor._dom).fullWindow({modifySize:false, callback:function (docSize) {
                editor._maximized = true;
                editor._dirty = true;
                editor._value = editor._editor.getContent();
                editor.post();
                editor.set(docSize);
                editor.resetDimension();
                editor.refresh();
            }});
        } else {
            editor._maximized = false;
            $fly(editor._dom).unfullWindow({callback:function () {
                editor._maximized = false;
                editor._width = editor._originalWidth;
                editor._height = editor._originalHeight;
                editor._realWidth = editor._originalRealWidth;
                editor._realHeight = editor._originalRealHeight;
                editor._dirty = true;
                editor._value = editor._editor.getContent();
                editor.post();
                if (!editor._width) {
                    $fly(editor._dom).css("width", "");
                }
                editor.resetDimension();
                editor.refresh();
            }});
        }
        this.checkStatus();
    }, initToolBar:function (toolbar) {
        var plugin = this;
        plugin.button = toolbar.addItem({$type:"SimpleIconButton", exClassName:"fullscreen-button", icon:plugin._icon, iconClass:plugin._iconClass, listener:{onClick:function () {
            plugin.onClick();
        }}});
    }, checkStatus:function () {
        var editor = this._htmlEditor;
        if (editor._maximized) {
            this.set("status", "on");
        } else {
            this.set("status", "enable");
        }
    }}};
    var baseCmdMap = {Copy:true, Paste:true, Cut:true, Undo:true, Redo:true, Bold:true, Italic:true, Underline:true, StrikeThrough:true, Subscript:true, Superscript:true, BlockQuote:true, Indent:true, Outdent:true, InsertOrderedList:true, InsertUnorderedList:true, Unlink:true, SelectAll:false, RemoveFormat:false, Print:false, Preview:false, Date:false, Time:false, ClearDoc:false, Horizontal:false, DeleteTable:false, InsertParagraphBeforeTable:false, InsertRow:false, DeleteRow:false, InsertCol:false, DeleteCol:false, MergeCells:false, MergeRight:false, MergeDown:false, SplittoCells:false, SplittoRows:false, SplittoCols:false, FormatMatch:true, PastePlain:true};
    for (var prop in baseCmdMap) {
        var checkStatus = baseCmdMap[prop], object = {};
        object.command = prop.toLowerCase();
        if (checkStatus) {
            object.statusToggleable = true;
        }
        plugins[prop] = object;
    }
    plugins.Help = {iconClass:"html-editor-icon help", command:null, execute:function () {
        var plugin = this;
        if (!plugin.dialog) {
            plugin.dialog = new dorado.widget.Dialog({caption:"\u5173\u4e8e", width:300, height:200, center:true, buttons:[{caption:"\u786e\u5b9a", listener:{onClick:function () {
                plugin.dialog.hide();
            }}}], children:[{$type:"HtmlContainer", content:"<div style='text-align:center;'>Dorado Html Editor</div>"}]});
        }
        plugin.dialog.show();
    }};
})();
(function () {
    baidu.editor.plugins["flash"] = function () {
        var editor = this, lastFakedId = 0;
        function real(url, width, height, style) {
            return "<embed isfakedvideo" + " type=\"application/x-shockwave-flash\"" + " pluginspage=\"http://www.macromedia.com/go/getflashplayer\"" + " src=\"" + url + "\"" + " width=\"" + width + "\"" + " height=\"" + height + "\"" + " style=\"" + (style || "") + "\"" + " wmode=\"transparent\"" + " play=\"true\"" + " loop=\"false\"" + " menu=\"false\"" + " allowscriptaccess=\"never\"" + "/>";
        }
        function fake(url, width, height, style) {
            var fakedId = "edui_faked_video_" + (lastFakedId++);
            return "<img isfakedvideo id=\"" + fakedId + "\" width=\"" + width + "\" height=\"" + height + "\" _url=\"" + url + "\" class=\"edui-faked-video\"" + " src=\"" + $DomUtils.BLANK_IMG + "\"" + " style=\"background:url(" + $url(">skin>/html-editor/fck_videologo.gif") + ") no-repeat center center; border:1px solid gray;" + style + ";\" />";
        }
        editor.commands["insertflash"] = {execCommand:function (cmd, options) {
            var url = options.url;
            var width = options.width || 320;
            var height = options.height || 240;
            var style = options.style ? options.style : "";
            editor.execCommand("inserthtml", fake(url, width, height, style));
        }};
        function getPars(str, par) {
            var reg = new RegExp(par + ":\\s*((\\w)*)", "ig");
            var arr = reg.exec(str);
            return arr ? arr[1] : "";
        }
        editor.addListener("aftersetcontent", function () {
            var tempDiv = editor.document.createElement("div");
            var embedNodeList = editor.document.getElementsByTagName("embed");
            var embeds = [];
            var k = embedNodeList.length;
            while (k--) {
                embeds[k] = embedNodeList[k];
            }
            k = embeds.length;
            while (k--) {
                var url = embeds[k].src;
                var width = embeds[k].width || 320;
                var height = embeds[k].height || 240;
                var strcss = embeds[k].style.cssText;
                var style = getPars(strcss, "display") ? "display:" + getPars(strcss, "display") : "float:" + getPars(strcss, "float");
                tempDiv.innerHTML = fake(url, width, height, style);
                embeds[k].parentNode.replaceChild(tempDiv.firstChild, embeds[k]);
            }
        });
        var oldGetContent = editor.getContent;
        editor.getContent = function () {
            var content = oldGetContent.apply(this, []), imgReg = /<img.*?(edui_faked_video_\d+)['"\s].*?>/ig;
            return content.replace(imgReg, function (word) {
                var fakeId = RegExp.$1, img = editor.document.getElementById(fakeId);
                if (img) {
                    var width = img.width || 320, height = img.height || 240, strcss = img.style.cssText, url = img.getAttribute("_url"), style = getPars(strcss, "display") ? "display:" + getPars(strcss, "display") : "float:" + getPars(strcss, "float");
                    return real(url, width, height, style);
                }
                return word;
            });
        };
    };
})();
(function () {
    var contextMenu = [{caption:"\u5220\u9664", name:"delete"}, {caption:"\u5168\u9009", name:"selectall"}, {caption:"\u5220\u9664\u4ee3\u7801", name:"highlightcode"}, {caption:"\u6e05\u7a7a\u6587\u6863", name:"cleardoc", exec:function () {
        if (confirm("\u786e\u5b9a\u6e05\u7a7a\u6587\u6863\u5417\uff1f")) {
            this.execCommand("cleardoc");
        }
    }}, {caption:"\u53d6\u6d88\u94fe\u63a5", name:"unlink"}, {caption:"\u6bb5\u843d\u683c\u5f0f", icon:"justifyjustify", name:"justify", submenu:[{caption:"\u5c45\u5de6\u5bf9\u9f50", name:"justify", value:"left"}, {caption:"\u5c45\u53f3\u5bf9\u9f50", name:"justify", value:"right"}, {caption:"\u5c45\u4e2d\u5bf9\u9f50", name:"justify", value:"center"}, {caption:"\u4e24\u7aef\u5bf9\u9f50", name:"justify", value:"justify"}]}, {caption:"\u8868\u683c", icon:"table", name:"edittable", submenu:[{caption:"\u5220\u9664\u8868\u683c", name:"deletetable"}, {caption:"\u8868\u683c\u524d\u63d2\u884c", name:"insertparagraphbeforetable"}, {caption:"\u5220\u9664\u884c", name:"deleterow"}, {caption:"\u5220\u9664\u5217", name:"deletecol"}, {caption:"\u524d\u63d2\u5165\u884c", name:"insertrow"}, {caption:"\u524d\u63d2\u5165\u5217", name:"insertcol"}, {caption:"\u53f3\u5408\u5e76\u5355\u5143\u683c", name:"mergeright"}, {caption:"\u4e0b\u5408\u5e76\u5355\u5143\u683c", name:"mergedown"}, {caption:"\u62c6\u5206\u6210\u884c", name:"splittorows"}, {caption:"\u62c6\u5206\u6210\u5217", name:"splittocols"}, {caption:"\u5408\u5e76\u591a\u4e2a\u5355\u5143\u683c", name:"mergecells"}, {caption:"\u5b8c\u5168\u62c6\u5206\u5355\u5143\u683c", name:"splittocells"}]}];
    baidu.editor.plugins["contextmenu"] = function () {
        var me = this, menu, items = contextMenu;
        var getWindow = function (node) {
            var doc = node.ownerDocument || node;
            return doc.defaultView || doc.parentWindow;
        };
        me.addListener("contextmenu", function (type, evt) {
            var element = evt.target || evt.srcElement, iframe = getWindow(element).frameElement;
            if (me._readOnly) {
                return false;
            }
            var frameOffset = $fly(iframe).offset(), iframeBody = iframe.contentWindow.document.body;
            var offset = {left:evt.pageX + frameOffset.left - iframeBody.scrollLeft, top:evt.pageY + frameOffset.top - iframeBody.scrollTop};
            if (!menu) {
                for (var i = 0, ti, contextItems = []; ti = items[i]; i++) {
                    (function (item) {
                        if (item.submenu) {
                            for (var j = 0, submenuItem, submenu = []; submenuItem = item.submenu[j]; j++) {
                                (function (subItem) {
                                    submenu.push({caption:subItem.caption, name:subItem.name, iconClass:"html-editor-icon " + subItem.name + (subItem.value || ""), onClick:subItem.exec ? function () {
                                        subItem.exec.call(me);
                                    } : function () {
                                        me.execCommand(subItem.name, subItem.value);
                                    }});
                                })(submenuItem);
                            }
                            if (submenu.length) {
                                contextItems.push({caption:item.caption, name:item.name, iconClass:"html-editor-icon " + item.icon, submenu:{items:submenu}});
                            }
                        } else {
                            contextItems.push({caption:item.caption, name:item.name, iconClass:"html-editor-icon " + item.name + (item.value || ""), onClick:item.exec ? function () {
                                item.exec.call(me);
                            } : function () {
                                me.execCommand(item.name, item.value);
                            }});
                        }
                    })(ti);
                }
                menu = new dorado.widget.Menu({items:contextItems, showAnimateType:"none", hideAnimateType:"none"});
            }
            function filterMenuItem(item) {
                if (item._name) {
                    var visible = me.queryCommandState(item._name) != -1;
                    item.set("visible", visible);
                    if (visible) {
                        if (item.hasSubmenu()) {
                            var subitems = item.get("items");
                            subitems.each(function (subitem) {
                                filterMenuItem(subitem);
                            });
                        }
                    }
                }
            }
            var menuItems = menu.get("items");
            menuItems.each(function (item) {
                filterMenuItem(item);
            });
            menu.show({position:offset});
            evt.preventDefault ? evt.preventDefault() : (evt.returnValue = false);
        });
    };
})();
(function (plugins) {
    var htmleditor = dorado.htmleditor, count = 0;
    var formProfile = new dorado.widget.FormProfile({id:"htmleditorFormProfile", labelAlign:"left"});
    function initBrowserButton(button, id, action, pathEditor, callback) {
        var dom = button._dom, parentNode = dom.parentNode, wrapNode = document.createElement("div");
        $fly(wrapNode).addClass("browse-button-wrap");
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            hiddenFile = document.createElement("<input type='file' name='filename' class='hidden-file'/>");
        } else {
            hiddenFile = document.createElement("input");
            hiddenFile.type = "file";
            hiddenFile.name = "filename";
            hiddenFile.className = "hidden-file";
        }
        var form, hiddenFile, iframe, iframeName = id + "UploadIframe";
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            iframe = document.createElement("<iframe name='" + iframeName + "'></iframe>");
        } else {
            iframe = document.createElement("iframe");
            iframe.name = iframeName;
        }
        iframe.style.display = "none";
        if (dorado.Browser.msie && dorado.Browser.version < 9) {
            form = document.createElement("<form name ='" + id + "UploadForm' action='" + action + "' enctype='multipart/form-data' method='post' target='" + iframeName + "'></form>");
        } else {
            form = document.createElement("form");
            form.action = action;
            form.method = "post";
            form.target = iframeName;
            form.enctype = "multipart/form-data";
        }
        hiddenFile.onchange = function () {
            pathEditor.set("text", this.value);
            form.submit();
            window.uploadCallbackForHtmlEditorFn = callback;
        };
        form.appendChild(hiddenFile);
        wrapNode.appendChild(form);
        wrapNode.appendChild(iframe);
        dom.appendChild(wrapNode);
    }
    plugins.Link = {iconClass:"html-editor-icon link", command:"link", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, formId = editor._uniqueId + "_linkForm", urlObject = plugin.urlObject, filePath = editor._uniqueId + "_linkFilePath", tabControlId = editor._uniqueId + "_linkTabControl";
        if (!urlObject) {
            urlObject = plugin.urlObject = new dorado.Entity();
        }
        if (!plugin.dialog) {
            var pathEditor = new dorado.widget.TextEditor({id:filePath, required:true, readOnly:true});
            plugin.dialog = new dorado.widget.Dialog({caption:"\u63d2\u5165\u8d85\u94fe\u63a5", width:480, center:true, modal:true, modalType:"transparent", children:[{$type:"TabControl", id:tabControlId, height:150, tabs:[{$type:"Control", caption:"\u8d85\u94fe\u63a5", control:{id:formId, $type:"AutoForm", formProfile:"htmleditorFormProfile", cols:"*", entity:urlObject, elements:[{property:"url", label:"\u8d85\u94fe\u63a5", editorType:"text"}, {property:"title", label:"\u6807\u9898", editorType:"text"}, {property:"target", label:"\u662f\u5426\u5728\u65b0\u7a97\u53e3\u6253\u5f00", editorType:"CheckBox"}]}}, {$type:"Control", caption:"\u4e0a\u4f20", control:{$type:"AutoForm", cols:"*,100", formProfile:"htmleditorFormProfile", elements:[{property:"url", label:"\u6587\u4ef6", editor:pathEditor}, {$type:"Button", caption:"\u6d4f\u89c8...", onReady:function (self, arg) {
                if (self._inited) {
                    return;
                }
                self._inited = true;
                var view = this, callback = function (url) {
                    urlObject.set("url", url);
                    var autoform = view.id(formId);
                    if (autoform) {
                        autoform.refreshData();
                    }
                    var tabControl = view.id(tabControlId);
                    tabControl.set("currentTab", 0);
                    pathEditor.set("value", "");
                };
                initBrowserButton(self, editor._uniqueId + "link", $url(editor._fileUploadPath), pathEditor, callback);
            }}]}}]}], buttons:[{caption:"\u786e\u5b9a", listener:{onClick:function () {
                if (urlObject) {
                    var url = urlObject.get("url");
                    plugin.execCommand("link", {href:url, title:urlObject.get("title"), target:urlObject.get("target") === true ? "_blank" : "_self"});
                    plugin.dialog.hide();
                }
            }}}, {caption:"\u53d6\u6d88", listener:{onClick:function () {
                plugin.dialog.hide();
            }}}]});
            editor.registerInnerControl(plugin.dialog);
        }
        var link = plugin.queryCommandValue("link") || {}, autoform = editor._view.id(formId);
        urlObject.set("url", link.href);
        urlObject.set("title", link.title || "");
        urlObject.set("target", link.target == "_blank");
        if (autoform) {
            autoform.refreshData();
        }
        plugin.dialog.show();
    }};
    plugins.InsertTable = {iconClass:"html-editor-icon table", command:"inserttable", execute:function () {
        var plugin = this, tableConfig = new dorado.Entity();
        if (!plugin.dialog) {
            plugin.dialog = new dorado.widget.Dialog({caption:"\u63d2\u5165\u8868\u683c", width:480, center:true, modal:true, modalType:"transparent", children:[{$type:"AutoForm", formProfile:"htmleditorFormProfile", entity:tableConfig, elements:[{property:"row", label:"\u884c\u6570"}, {property:"column", label:"\u5217\u6570"}, {property:"width", label:"\u5bbd\u5ea6"}, {property:"height", label:"\u9ad8\u5ea6"}, {property:"border", label:"\u8fb9\u6846"}, {property:"cellborder", label:"\u5355\u5143\u683c\u8fb9\u6846"}, {property:"cellpadding", label:"\u5355\u5143\u683c\u8fb9\u8ddd"}, {property:"cellspacing", label:"\u5355\u5143\u683c\u95f4\u8ddd"}, {property:"alignment", label:"\u5bf9\u9f50\u65b9\u5f0f", editor:{$type:"TextEditor", trigger:"autoMappingDropDown1", mapping:[{key:"default", value:"\u65e0"}, {key:"left", value:"\u5de6\u5bf9\u9f50"}, {key:"center", value:"\u5c45\u4e2d"}, {key:"right", value:"\u53f3\u5bf9\u9f50"}]}}]}], buttons:[{caption:"\u786e\u5b9a", listener:{onClick:function () {
                if (tableConfig) {
                    var border = tableConfig.get("border");
                    var cellpadding = tableConfig.get("cellpadding");
                    var cellspacing = tableConfig.get("cellspacing");
                    var width = tableConfig.get("width");
                    var row = tableConfig.get("row") || 2, column = tableConfig.get("column") || 2;
                    var alignment = tableConfig.alignment, cellborder = tableConfig.cellborder;
                    plugin.execCommand("inserttable", {numRows:row, numCols:column, border:border, cellborder:cellborder, cellpadding:cellpadding, cellspacing:cellspacing, width:width, align:alignment, tdvalign:"top"});
                    plugin.dialog.hide();
                }
            }}}, {caption:"\u53d6\u6d88", listener:{onClick:function () {
                plugin.dialog.hide();
            }}}]});
        }
        plugin.dialog.show();
    }};
    window.uploadCallbackForHtmlEditorFn = null;
    window.uploadCallbackForHtmlEditor = function (path) {
        if (window.uploadCallbackForHtmlEditorFn) {
            if (path && /Exception:/.test(path)) {
                alert(path.replace("Exception:", ""));
            } else {
                window.uploadCallbackForHtmlEditorFn($url(path));
            }
            window.uploadCallbackForHtmlEditorFn = null;
        }
    };
    var alignImageMap = {left:"float: left;", right:"float: right;", block:"display: block;", "default":""};
    plugins.Image = {iconClass:"html-editor-icon image", command:"inserthtml", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, imageObject = plugin.imageObject, autoformId = editor._uniqueId + "_imageAutoform";
        if (!imageObject) {
            imageObject = plugin.imageObject = new dorado.Entity();
            imageObject.set("lockRatio", true);
        }
        var imgInfoId = editor._uniqueId + "_imageInfo", imgPreviewId = editor._uniqueId + "_imagePreview", imageAlignEditorId = editor._uniqueId + "_imageAlignEditor", imgWidthEditorId = editor._uniqueId + "_imageWidthEditor", imgHeightEditorId = editor._uniqueId + "_imageHeightEditor", imagePathEditorId = editor._uniqueId + "_imagePathEditor", imageUrlEditorId = editor._uniqueId + "_imageUrlEditor", tabControlId = editor._uniqueId + "_imageTabControl";
        var resizeImage = function (view) {
            var previewImg = plugin.previewImg;
            if (previewImg) {
                var width = view.id(imgWidthEditorId).get("text"), height = view.id(imgHeightEditorId).get("text");
                if (width) {
                    previewImg.width = width;
                } else {
                    previewImg.removeAttribute("width");
                }
                if (height) {
                    previewImg.height = height;
                } else {
                    previewImg.removeAttribute("height");
                }
            }
        };
        var refreshImage = function (view, url, width, height) {
            var imgInfo = view.id(imgInfoId).getDom(), imgPreview = view.id(imgPreviewId), preImg = imgPreview.getContentContainer();
            plugin.imageRatio = null;
            if (!url) {
                preImg.innerHTML = "";
                imgInfo.innerHTML = "";
                return false;
            } else {
                preImg.innerHTML = "";
                var image = new Image();
                plugin.previewImg = image;
                image.onload = function () {
                    imgInfo.innerHTML = "\u539f\u59cb\u5bbd\uff1a" + this.width + "px&nbsp;&nbsp;\u539f\u59cb\u9ad8\uff1a" + this.height + "px";
                    imgInfo.parentNode.parentNode.style.display = "";
                    this.sWidth = this.width;
                    this.sHeight = this.height;
                    plugin.imageRatio = this.width / this.height;
                    if (width == undefined && height == undefined) {
                        var widthEditor = view.id(imgWidthEditorId), heightEditor = view.id(imgHeightEditorId);
                        widthEditor.set("value", this.width);
                        heightEditor.set("value", this.height);
                        widthEditor.post(true);
                        heightEditor.post(true);
                    } else {
                        this.width = width;
                        this.height = height;
                    }
                    view.id(tabControlId).set("currentTab", 0);
                };
                image.onerror = function () {
                    preImg.innerHTML = "\u56fe\u7247\u4e0d\u5b58\u5728";
                };
                preImg.appendChild(image);
                image.src = url;
            }
        };
        if (!plugin.dialog) {
            var pathEditor = new dorado.widget.TextEditor({id:imagePathEditorId, required:true, entity:imageObject, property:"url", readOnly:true});
            plugin.dialog = new dorado.widget.Dialog({caption:"\u63d2\u5165\u56fe\u50cf", width:520, height:395, cols:"*", center:true, modal:true, modalType:"transparent", children:[{id:tabControlId, $type:"TabControl", tabs:[{$type:"Control", caption:"\u56fe\u50cf", control:{$type:"Panel", children:[{$type:"AutoForm", id:autoformId, formProfile:"htmleditorFormProfile", entity:imageObject, cols:"100,*", elements:[{property:"url", label:"\u56fe\u7247\u94fe\u63a5", layoutConstraint:{colSpan:2}, editor:new dorado.widget.TextEditor({id:imageUrlEditorId, required:true, entity:imageObject, property:"url", listener:{onPost:function (self) {
                var url = self.get("text"), view = this;
                refreshImage(view, url);
            }}})}, {property:"width", label:"\u5bbd\u5ea6", labelPosition:"top", editor:new dorado.widget.TextEditor({id:imgWidthEditorId, entity:imageObject, property:"width", onPost:function () {
                resizeImage(this);
            }, onTextEdit:function (self) {
                var heightEditor = this.id(imgHeightEditorId), width = parseInt(self.get("text"), 10) || 0, height;
                if (imageObject.get("lockRatio") && plugin.imageRatio) {
                    if (width == 0) {
                        height = "";
                    } else {
                        height = parseInt(width / plugin.imageRatio, 10);
                    }
                    heightEditor.set("value", height);
                    heightEditor.post(true);
                }
                resizeImage(this);
            }})}, {id:imgPreviewId, $type:"Container", layoutConstraint:{rowSpan:5, vAlign:"top"}, style:{border:"1px solid #ddd"}, height:"100%"}, {property:"height", label:"\u9ad8\u5ea6", labelPosition:"top", editor:new dorado.widget.TextEditor({id:imgHeightEditorId, entity:imageObject, property:"height", onPost:function () {
                resizeImage(this);
            }, onTextEdit:function (self) {
                var widthEditor = this.id(imgWidthEditorId), height = parseInt(self.get("text"), 10) || 0, width;
                if (imageObject.get("lockRatio") && plugin.imageRatio) {
                    if (height == 0) {
                        width = "";
                    } else {
                        width = parseInt(height * plugin.imageRatio, 10);
                    }
                    widthEditor.set("value", width);
                    widthEditor.post(true);
                }
                resizeImage(this);
            }})}, {property:"lockRadio", editorType:"CheckBox", labelPosition:"top", showLabel:false, editor:new dorado.widget.CheckBox({entity:imageObject, property:"lockRatio", caption:"\u9501\u5b9a\u6bd4\u4f8b"})}, {property:"title", label:"\u6807\u9898", labelPosition:"top"}, {property:"align", label:"\u5bf9\u9f50\u65b9\u5f0f", labelPosition:"top", editor:new dorado.widget.TextEditor({id:imageAlignEditorId, entity:imageObject, property:"align", trigger:"autoMappingDropDown1", mapping:[{key:"default", value:"\u9ed8\u8ba4"}, {key:"left", value:"\u5de6\u6d6e\u52a8"}, {key:"right", value:"\u53f3\u6d6e\u52a8"}, {key:"block", value:"\u72ec\u5360\u4e00\u884c"}]})}, {id:imgInfoId, $type:"HtmlContainer", style:{"text-align":"right"}, layoutConstraint:{colSpan:2}, content:"&nbsp;"}]}], buttons:[{caption:"\u786e\u5b9a", listener:{onClick:function () {
                var url = imageObject.get("url");
                if (url) {
                    var width = imageObject.get("width"), height = imageObject.get("height"), align = this.id(imageAlignEditorId).get("value"), title = imageObject.get("title");
                    var imgstr = "<img ";
                    var myimg = this.id(imgPreviewId).getDom().firstChild;
                    imgstr += " src=" + url;
                    if (!width) {
                        imgstr += " width=" + myimg.sWidth;
                    } else {
                        if (width && !/^[1-9]+[.]?\d*$/g.test(width)) {
                            alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u5bbd\u5ea6");
                            return false;
                        } else {
                            myimg && myimg.setAttribute("width", width);
                            imgstr += " width=" + width;
                        }
                    }
                    if (!height) {
                        imgstr += " height=" + myimg.sHeight;
                    } else {
                        if (height && !/^[1-9]+[.]?\d*$/g.test(height)) {
                            alert("\u8bf7\u8f93\u5165\u6b63\u786e\u7684\u9ad8\u5ea6");
                            return false;
                        } else {
                            myimg && myimg.setAttribute("height", height);
                            imgstr += " height=" + height;
                        }
                    }
                    if (title) {
                        myimg && myimg.setAttribute("title", title);
                        imgstr += " title=" + title;
                    }
                    if (align) {
                        var value = alignImageMap[align];
                        if (value) {
                            imgstr += " style='" + value + "'";
                        }
                    }
                    plugin.insertHtml(imgstr + " />");
                    plugin.dialog.hide();
                }
            }}}, {caption:"\u53d6\u6d88", listener:{onClick:function () {
                plugin.dialog.hide();
            }}}]}}, {$type:"Control", caption:"\u4e0a\u4f20", control:{$type:"Panel", children:[{$type:"AutoForm", formProfile:"htmleditorFormProfile", cols:"*,100", elements:[{property:"linkurl", label:"\u94fe\u63a5", layoutConstraint:{colSpan:1}, editor:pathEditor}, {$type:"Button", caption:"\u6d4f\u89c8...", onReady:function (self) {
                if (self._inited) {
                    return;
                }
                self._inited = true;
                var view = this, callback = function (url) {
                    var urlEditor = view.id(imageUrlEditorId);
                    urlEditor.set("value", url);
                    var oldEditorFocused = urlEditor._editorFocused;
                    if (oldEditorFocused !== true) {
                        urlEditor._editorFocused = true;
                    }
                    urlEditor.post(true);
                    urlEditor._editorFocused = oldEditorFocused;
                    pathEditor.set("value", "");
                };
                initBrowserButton(self, editor._uniqueId + "image", $url(editor._imageUploadPath), pathEditor, callback);
            }}]}]}}]}]});
            plugin._htmlEditor.registerInnerControl(plugin.dialog);
        }
        plugin.dialog.show();
        editor.get("view").id(imageAlignEditorId).set("readOnly", false);
        var img = editor._editor.selection.getRange().getClosedNode(), image = {};
        if (img && /img/ig.test(img.tagName) && img.className != "edui-faked-video") {
            image = img;
            var link = baidu.editor.dom.domUtils.findParentByTagName(img, "a", true);
            if (link != null) {
                editor.get("view").id(imageAlignEditorId).set("readOnly", true);
            }
            function getPars(str, par) {
                var reg = new RegExp(par + ":\\s*((\\w)*)", "ig");
                var arr = reg.exec(str);
                return arr ? arr[1] : "";
            }
            var style = image.style.cssText;
            var reg = "";
            if (/float/ig.test(style)) {
                reg = getPars(style, "float");
            } else {
                if (/display/ig.test(style)) {
                    reg = getPars(style, "display");
                }
            }
            switch (reg) {
              case "left":
              case "right":
              case "block":
                imageObject.set("align", reg);
                break;
            }
            imageObject.set("width", image.width);
            imageObject.set("height", image.height);
            imageObject.set("title", image.title);
            imageObject.set("url", image.src);
            try {
                if (image.src) {
                    refreshImage(editor.get("view"), image.src, image.width, image.height);
                }
                editor.get("view").id(autoformId).refreshData();
            }
            catch (e) {
                alert(e);
            }
        } else {
            imageObject.clearData();
            imageObject.set("lockRatio", true);
            refreshImage(editor.get("view"), "");
            editor.get("view").id(autoformId).refreshData();
        }
    }};
    plugins.SearchReplace = {iconClass:"html-editor-icon searchreplace", command:"searchreplace", execute:function () {
        var plugin = this, searchEntity = plugin.searchEntity, replaceEntity = plugin.replaceEntity;
        if (!searchEntity) {
            searchEntity = plugin.searchEntity = new dorado.Entity();
            replaceEntity = plugin.replaceEntity = new dorado.Entity();
        }
        if (!plugin.dialog) {
            plugin.dialog = new dorado.widget.Dialog({caption:"\u67e5\u627e/\u66ff\u6362", width:380, center:true, modal:true, modalType:"transparent", children:[{$type:"TabControl", height:150, tabMinWidth:80, tabs:[{$type:"Control", caption:"\u67e5\u627e", control:{$type:"Panel", children:[{$type:"AutoForm", formProfile:"htmleditorFormProfile", entity:searchEntity, cols:"*", elements:[{property:"text", label:"\u67e5\u627e"}, {property:"matchCase", label:"\u533a\u5206\u5927\u5c0f\u5199", editorType:"CheckBox"}]}], buttons:[{caption:"\u4e0a\u4e00\u4e2a", onClick:function () {
                plugin.execCommand("searchreplace", {searchStr:searchEntity.get("text"), casesensitive:searchEntity.get("matchCase"), dir:-1});
            }}, {caption:"\u4e0b\u4e00\u4e2a", onClick:function () {
                plugin.execCommand("searchreplace", {searchStr:searchEntity.get("text"), casesensitive:searchEntity.get("matchCase"), dir:1});
            }}]}}, {$type:"Control", caption:"\u66ff\u6362", control:{$type:"Panel", children:[{$type:"AutoForm", formProfile:"htmleditorFormProfile", entity:replaceEntity, cols:"*", elements:[{property:"text", label:"\u67e5\u627e"}, {property:"replaceText", label:"\u66ff\u6362"}, {property:"matchCase", label:"\u533a\u5206\u5927\u5c0f\u5199", editorType:"CheckBox"}]}], buttons:[{caption:"\u4e0a\u4e00\u4e2a", onClick:function () {
                plugin.execCommand("searchreplace", {searchStr:replaceEntity.get("text"), casesensitive:replaceEntity.get("matchCase"), dir:-1});
            }}, {caption:"\u4e0b\u4e00\u4e2a", onClick:function () {
                plugin.execCommand("searchreplace", {searchStr:replaceEntity.get("text"), casesensitive:replaceEntity.get("matchCase"), dir:1});
            }}, {caption:"\u66ff\u6362", onClick:function () {
                var searchStr = replaceEntity.get("text"), replaceStr = replaceEntity.get("replaceText");
                if (!searchStr || !replaceStr) {
                    dorado.MessageBox.alert("Please input search Text");
                    return;
                }
                plugin.execCommand("searchreplace", {searchStr:searchStr, replaceStr:replaceStr, all:false, casesensitive:replaceEntity.get("matchCase")});
            }}, {caption:"\u5168\u90e8\u66ff\u6362", onClick:function () {
                var searchStr = replaceEntity.get("text"), replaceStr = replaceEntity.get("replaceText");
                if (!searchStr || !replaceStr) {
                    dorado.MessageBox.alert("Please input search Text");
                    return;
                }
                plugin.execCommand("searchreplace", {searchStr:searchStr, replaceStr:replaceStr, all:true, casesensitive:replaceEntity.get("matchCase")});
            }}]}}]}]});
        }
        plugin.dialog.show();
    }};
    plugins.Emoticon = {iconClass:"html-editor-icon emoticon", command:"inserthtml", execute:function () {
        var plugin = this, emoticonPicker = plugin.emoticonPicker;
        if (!emoticonPicker) {
            emoticonPicker = plugin.emoticonPicker = new dorado.widget.EmoticonPicker();
        }
        function select(self, arg) {
            plugin.insertHtml("<img src='" + arg.image + "'/>");
        }
        emoticonPicker.addListener("beforeShow", function () {
            emoticonPicker.addListener("onSelect", select);
        }, {once:true});
        emoticonPicker.addListener("onHide", function () {
            emoticonPicker.removeListener("onSelect", select);
        });
        plugin.emoticonPicker.show({anchorTarget:plugin.button, vAlign:"bottom"});
    }};
    plugins.Paragraph = {icon:null, command:"paragraph", initToolBar:function (toolbar) {
        var plugin = this;
        toolbar.addItem({$type:"ToolBarLabel", text:"\u683c\u5f0f", style:{"padding-left":3, "padding-right":5}});
        var entity = new dorado.Entity();
        var formatEditor = new dorado.widget.TextEditor({width:70, editable:false, trigger:"autoMappingDropDown1", mapping:[{key:"p", value:"\u6bb5\u843d"}, {key:"h1", value:"\u6807\u9898 1"}, {key:"h2", value:"\u6807\u9898 2"}, {key:"h3", value:"\u6807\u9898 3"}, {key:"h4", value:"\u6807\u9898 4"}, {key:"h5", value:"\u6807\u9898 5"}, {key:"h6", value:"\u6807\u9898 6"}], entity:entity, property:"format", supportsDirtyFlag:false, listener:{onPost:function (self) {
            var value = self.get("value");
            plugin.execCommand("paragraph", self.get("value"));
        }}});
        plugin.formatEditor = formatEditor;
        toolbar.addItem(formatEditor);
    }, onStatusChange:function (status) {
        this.formatEditor.set("readOnly", status == "disable");
    }, statusToggleable:true, checkStatus:function () {
        var plugin = this, value = plugin.queryCommandValue("paragraph");
        var heditor = plugin._htmlEditor;
        if (heditor._readOnly || heditor._readOnly2) {
            plugin.set("status", "disable");
            return;
        }
        plugin.formatEditor.set("value", value);
        var status = plugin.queryCommandState("paragraph");
        if (status == -1) {
            plugin.set("status", "disable");
        } else {
            plugin.set("status", "enable");
        }
    }};
    var fontMap = htmleditor.FONT_MAP, fontMapString = {};
    for (var font in fontMap) {
        fontMapString[font] = fontMap[font].join(",");
    }
    plugins.FontFamily = {command:"fontfamily", initToolBar:function (toolbar) {
        var plugin = this;
        toolbar.addItem({$type:"ToolBarLabel", text:"\u5b57\u4f53", style:{"padding-left":3, "padding-right":5}});
        var dropdown = new dorado.widget.ListDropDown({items:["\u5b8b\u4f53", "\u9ed1\u4f53", "\u96b6\u4e66", "\u6977\u4f53", "Arial", "Impact", "Georgia", "Verdana", "Courier New", "Times New Roman"], listener:{onOpen:function (self) {
            setTimeout(function () {
                var rowList = self._box.get("control");
                rowList.addListener("onRenderRow", function (self, arg) {
                    arg.dom.style.fontFamily = arg.data;
                });
            }, 0);
        }}});
        var entity = new dorado.Entity();
        var fontEditor = new dorado.widget.TextEditor({width:100, trigger:dropdown, entity:entity, property:"fontname", supportsDirtyFlag:false, listener:{onPost:function (self, arg) {
            var text = self.get("text"), result = text;
            if (fontMapString[text]) {
                result = fontMapString[text];
            }
            plugin.execCommand("fontfamily", result);
        }}});
        plugin.fontEditor = fontEditor;
        toolbar.addItem(fontEditor);
    }, onStatusChange:function (status) {
        this.fontEditor.set("readOnly", status == "disable");
    }, statusToggleable:true, checkStatus:function () {
        var plugin = this, value = plugin.queryCommandValue("fontfamily");
        var heditor = plugin._htmlEditor;
        if (heditor._readOnly || heditor._readOnly2) {
            plugin.set("status", "disable");
            return;
        }
        plugin.fontEditor.set("text", value == "undefined" ? "" : value);
        var status = plugin.queryCommandState("fontfamily");
        if (status == -1) {
            plugin.set("status", "disable");
        } else {
            plugin.set("status", "enable");
        }
    }};
    plugins.LineHeight = {command:"lineheight", initToolBar:function (toolbar) {
        var plugin = this;
        toolbar.addItem({$type:"ToolBarLabel", text:"\u884c\u8ddd", style:{"padding-left":3, "padding-right":5}});
        var lineheight = htmleditor.defaultListMap.lineheight, mappingArray = [];
        for (var i = 0, j = lineheight.length; i < j; i++) {
            var temp = lineheight[i];
            mappingArray.push({key:temp, value:temp});
        }
        var entity = new dorado.Entity();
        var lineHeightEditor = new dorado.widget.TextEditor({width:50, editable:false, trigger:"autoMappingDropDown1", mapping:mappingArray, entity:entity, property:"lineheight", supportsDirtyFlag:false, listener:{onPost:function (self) {
            plugin.execCommand("lineheight", self.get("value"));
        }}});
        plugin.lineHeightEditor = lineHeightEditor;
        toolbar.addItem(lineHeightEditor);
    }, onStatusChange:function (status) {
        this.lineHeightEditor.set("readOnly", status == "disable");
    }, statusToggleable:true, checkStatus:function () {
        var plugin = this, value = plugin.queryCommandValue("lineheight");
        var heditor = plugin._htmlEditor;
        if (heditor._readOnly || heditor._readOnly2) {
            plugin.set("status", "disable");
            return;
        }
        plugin.lineHeightEditor.set("value", value);
        var status = plugin.queryCommandState("lineheight");
        if (status == -1) {
            plugin.set("status", "disable");
        } else {
            plugin.set("status", "enable");
        }
    }};
    plugins.FontSize = {command:"fontsize", initToolBar:function (toolbar) {
        var plugin = this;
        toolbar.addItem({$type:"ToolBarLabel", text:"\u5927\u5c0f", style:{"padding-left":3, "padding-right":5}});
        var fontsizeArray = htmleditor.defaultListMap.fontsize, mappingArray = [];
        for (var i = 0, j = fontsizeArray.length; i < j; i++) {
            var temp = fontsizeArray[i];
            mappingArray.push({key:"" + temp, value:temp + "px"});
        }
        var entity = new dorado.Entity();
        var fontSizeEditor = new dorado.widget.TextEditor({width:50, editable:false, trigger:"autoMappingDropDown1", mapping:mappingArray, entity:entity, property:"fontsize", supportsDirtyFlag:false, listener:{onPost:function (self) {
            plugin.execCommand("fontsize", self.get("value") + "px");
        }}});
        plugin.fontSizeEditor = fontSizeEditor;
        toolbar.addItem(fontSizeEditor);
    }, onStatusChange:function (status) {
        this.fontSizeEditor.set("readOnly", status == "disable");
    }, statusToggleable:true, checkStatus:function () {
        var plugin = this, value = plugin.queryCommandValue("fontsize");
        var heditor = plugin._htmlEditor;
        if (heditor._readOnly || heditor._readOnly2) {
            plugin.set("status", "disable");
            return;
        }
        plugin.fontSizeEditor.set("text", value);
        var status = plugin.queryCommandState("fontsize");
        if (status == -1) {
            plugin.set("status", "disable");
        } else {
            plugin.set("status", "enable");
        }
    }};
    plugins.ForeColor = {iconClass:"html-editor-icon forecolor", command:"forecolor", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, colorPicker = editor.colorPicker;
        if (!colorPicker) {
            colorPicker = editor.colorPicker = new dorado.widget.ColorPicker();
        }
        function select(self, arg) {
            plugin.execCommand("forecolor", arg.color);
        }
        function clearColor(self) {
            select(self, {color:"#000"});
        }
        colorPicker.addListener("beforeShow", function () {
            colorPicker.addListener("onSelect", select);
            colorPicker.addListener("onClear", clearColor);
        }, {once:true});
        colorPicker.addListener("onHide", function () {
            colorPicker.removeListener("onSelect", select);
            colorPicker.removeListener("onClear", clearColor);
        });
        colorPicker.show({anchorTarget:plugin.button, vAlign:"bottom"});
    }};
    plugins.BackColor = {iconClass:"html-editor-icon backcolor", command:"backcolor", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, colorPicker = editor.colorPicker;
        if (!colorPicker) {
            colorPicker = editor.colorPicker = new dorado.widget.ColorPicker();
        }
        function select(self, arg) {
            plugin.execCommand("backcolor", arg.color);
        }
        function clearColor(self) {
            select(self, "#FFF");
        }
        colorPicker.addListener("beforeShow", function () {
            colorPicker.addListener("onSelect", select);
            colorPicker.addListener("onClear", clearColor);
        }, {once:true});
        colorPicker.addListener("onHide", function () {
            colorPicker.removeListener("onSelect", select);
            colorPicker.removeListener("onClear", clearColor);
        });
        editor.colorPicker.show({anchorTarget:plugin.button, vAlign:"bottom"});
    }};
    function A(sr) {
        return sr.split(",");
    }
    var character_common = [["\u7279\u6b8a\u7b26\u53f7", A("\u3001,\u3002,\xb7,\u02c9,\u02c7,\xa8,\u3003,\u3005,\u2014,\uff5e,\u2016,\u2026,\u2018,\u2019,\u201c,\u201d,\u3014,\u3015,\u3008,\u3009,\u300a,\u300b,\u300c,\u300d,\u300e,\u300f,\u3016,\u3017,\u3010,\u3011,\xb1,\xd7,\xf7,\u2236,\u2227,\u2228,\u2211,\u220f,\u222a,\u2229,\u2208,\u2237,\u221a,\u22a5,\u2225,\u2220,\u2312,\u2299,\u222b,\u222e,\u2261,\u224c,\u2248,\u223d,\u221d,\u2260,\u226e,\u226f,\u2264,\u2265,\u221e,\u2235,\u2234,\u2642,\u2640,\xb0,\u2032,\u2033,\u2103,\uff04,\xa4,\uffe0,\uffe1,\u2030,\xa7,\u2116,\u2606,\u2605,\u25cb,\u25cf,\u25ce,\u25c7,\u25c6,\u25a1,\u25a0,\u25b3,\u25b2,\u203b,\u2192,\u2190,\u2191,\u2193,\u3013,\u3021,\u3022,\u3023,\u3024,\u3025,\u3026,\u3027,\u3028,\u3029,\u32a3,\u338e,\u338f,\u339c,\u339d,\u339e,\u33a1,\u33c4,\u33ce,\u33d1,\u33d2,\u33d5,\ufe30,\uffe2,\uffe4,\ue7e2,\u2121,\u02ca,\u02cb,\u02d9,\u2013,\u2015,\u2025,\u2035,\u2105,\u2109,\u2196,\u2197,\u2198,\u2199,\u2215,\u221f,\u2223,\u2252,\u2266,\u2267,\u22bf,\u2550,\u2551,\u2552,\u2553,\u2554,\u2555,\u2556,\u2557,\u2558,\u2559,\u255a,\u255b,\u255c,\u255d,\u255e,\u255f,\u2560,\u2561,\u2562,\u2563,\u2564,\u2565,\u2566,\u2567,\u2568,\u2569,\u256a,\u256b,\u256c,\u256d,\u256e,\u256f,\u2570,\u2571,\u2572,\u2573,\u2581,\u2582,\u2583,\u2584,\u2585,\u2586,\u2587,\ufffd\x7f,\u2588,\u2589,\u258a,\u258b,\u258c,\u258d,\u258e,\u258f,\u2593,\u2594,\u2595,\u25bc,\u25bd,\u25e2,\u25e3,\u25e4,\u25e5,\u2609,\u2295,\u3012,\u301d,\u301e")], ["\u7f57\u9a6c\u6570\u5b57", A("\u2170,\u2171,\u2172,\u2173,\u2174,\u2175,\u2176,\u2177,\u2178,\u2179,\u2160,\u2161,\u2162,\u2163,\u2164,\u2165,\u2166,\u2167,\u2168,\u2169,\u216a,\u216b")], ["\u6570\u5b57\u7b26\u53f7", A("\u2488,\u2489,\u248a,\u248b,\u248c,\u248d,\u248e,\u248f,\u2490,\u2491,\u2492,\u2493,\u2494,\u2495,\u2496,\u2497,\u2498,\u2499,\u249a,\u249b,\u2474,\u2475,\u2476,\u2477,\u2478,\u2479,\u247a,\u247b,\u247c,\u247d,\u247e,\u247f,\u2480,\u2481,\u2482,\u2483,\u2484,\u2485,\u2486,\u2487,\u2460,\u2461,\u2462,\u2463,\u2464,\u2465,\u2466,\u2467,\u2468,\u2469,\u3220,\u3221,\u3222,\u3223,\u3224,\u3225,\u3226,\u3227,\u3228,\u3229")], ["\u65e5\u6587\u7b26\u53f7", A("\u3041,\u3042,\u3043,\u3044,\u3045,\u3046,\u3047,\u3048,\u3049,\u304a,\u304b,\u304c,\u304d,\u304e,\u304f,\u3050,\u3051,\u3052,\u3053,\u3054,\u3055,\u3056,\u3057,\u3058,\u3059,\u305a,\u305b,\u305c,\u305d,\u305e,\u305f,\u3060,\u3061,\u3062,\u3063,\u3064,\u3065,\u3066,\u3067,\u3068,\u3069,\u306a,\u306b,\u306c,\u306d,\u306e,\u306f,\u3070,\u3071,\u3072,\u3073,\u3074,\u3075,\u3076,\u3077,\u3078,\u3079,\u307a,\u307b,\u307c,\u307d,\u307e,\u307f,\u3080,\u3081,\u3082,\u3083,\u3084,\u3085,\u3086,\u3087,\u3088,\u3089,\u308a,\u308b,\u308c,\u308d,\u308e,\u308f,\u3090,\u3091,\u3092,\u3093,\u30a1,\u30a2,\u30a3,\u30a4,\u30a5,\u30a6,\u30a7,\u30a8,\u30a9,\u30aa,\u30ab,\u30ac,\u30ad,\u30ae,\u30af,\u30b0,\u30b1,\u30b2,\u30b3,\u30b4,\u30b5,\u30b6,\u30b7,\u30b8,\u30b9,\u30ba,\u30bb,\u30bc,\u30bd,\u30be,\u30bf,\u30c0,\u30c1,\u30c2,\u30c3,\u30c4,\u30c5,\u30c6,\u30c7,\u30c8,\u30c9,\u30ca,\u30cb,\u30cc,\u30cd,\u30ce,\u30cf,\u30d0,\u30d1,\u30d2,\u30d3,\u30d4,\u30d5,\u30d6,\u30d7,\u30d8,\u30d9,\u30da,\u30db,\u30dc,\u30dd,\u30de,\u30df,\u30e0,\u30e1,\u30e2,\u30e3,\u30e4,\u30e5,\u30e6,\u30e7,\u30e8,\u30e9,\u30ea,\u30eb,\u30ec,\u30ed,\u30ee,\u30ef,\u30f0,\u30f1,\u30f2,\u30f3,\u30f4,\u30f5,\u30f6")], ["\u5e0c\u814a\u5b57\u6bcd", A("\u0391,\u0392,\u0393,\u0394,\u0395,\u0396,\u0397,\u0398,\u0399,\u039a,\u039b,\u039c,\u039d,\u039e,\u039f,\u03a0,\u03a1,\u03a3,\u03a4,\u03a5,\u03a6,\u03a7,\u03a8,\u03a9,\u03b1,\u03b2,\u03b3,\u03b4,\u03b5,\u03b6,\u03b7,\u03b8,\u03b9,\u03ba,\u03bb,\u03bc,\u03bd,\u03be,\u03bf,\u03c0,\u03c1,\u03c3,\u03c4,\u03c5,\u03c6,\u03c7,\u03c8,\u03c9")], ["\u4fc4\u6587\u5b57\u6bcd", A("\u0410,\u0411,\u0412,\u0413,\u0414,\u0415,\u0401,\u0416,\u0417,\u0418,\u0419,\u041a,\u041b,\u041c,\u041d,\u041e,\u041f,\u0420,\u0421,\u0422,\u0423,\u0424,\u0425,\u0426,\u0427,\u0428,\u0429,\u042a,\u042b,\u042c,\u042d,\u042e,\u042f,\u0430,\u0431,\u0432,\u0433,\u0434,\u0435,\u0451,\u0436,\u0437,\u0438,\u0439,\u043a,\u043b,\u043c,\u043d,\u043e,\u043f,\u0440,\u0441,\u0442,\u0443,\u0444,\u0445,\u0446,\u0447,\u0448,\u0449,\u044a,\u044b,\u044c,\u044d,\u044e,\u044f")], ["\u62fc\u97f3\u5b57\u6bcd", A("\u0101,\xe1,\u01ce,\xe0,\u0113,\xe9,\u011b,\xe8,\u012b,\xed,\u01d0,\xec,\u014d,\xf3,\u01d2,\xf2,\u016b,\xfa,\u01d4,\xf9,\u01d6,\u01d8,\u01da,\u01dc,\xfc")], ["\u6ce8\u97f3\u5b57\u7b26\u53ca\u5176\u4ed6", A("\u3105,\u3106,\u3107,\u3108,\u3109,\u310a,\u310b,\u310c,\u310d,\u310e,\u310f,\u3110,\u3111,\u3112,\u3113,\u3114,\u3115,\u3116,\u3117,\u3118,\u3119,\u311a,\u311b,\u311c,\u311d,\u311e,\u311f,\u3120,\u3121,\u3122,\u3123,\u3124,\u3125,\u3126,\u3127,\u3128")]];
    plugins.Spechars = {iconClass:"html-editor-icon spechars", command:"inserthtml", execute:function () {
        var plugin = this, editor = plugin._htmlEditor;
        if (!plugin.dialog) {
            var tabs = [];
            for (var i = 0, k = character_common.length; i < k; i++) {
                var tab = character_common[i], tabName = tab[0], chars = tab[1];
                tabs.push({$type:"Control", caption:tabName, control:{$type:"GridPicker", floating:false, column:15, elements:chars, listener:{onSelect:function (self, arg) {
                    plugin.execCommand("inserthtml", arg.element);
                    plugin.dialog.hide();
                }}}});
            }
            plugin.dialog = new dorado.widget.Dialog({caption:"\u7279\u6b8a\u5b57\u7b26", width:640, height:480, center:true, modal:true, modalType:"transparent", children:[{$type:"TabControl", tabs:tabs}]});
            editor.registerInnerControl(plugin.dialog);
        }
        plugin.dialog.show();
    }};
    plugins.Flash = {iconClass:"html-editor-icon video", command:"inserthtml", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, formId = editor._uniqueId + "_flashForm", flashObject = plugin.flashObject, filePath = editor._uniqueId + "_flashPath", flashAlignEditorId = editor._uniqueId + "_flashAlignEditor", tabControlId = editor._uniqueId + "_flashTabControl";
        if (!flashObject) {
            flashObject = plugin.flashObject = new dorado.Entity();
        }
        if (!plugin.dialog) {
            var pathEditor = new dorado.widget.TextEditor({id:filePath, required:true, readOnly:true});
            plugin.dialog = new dorado.widget.Dialog({caption:"\u63d2\u5165Flash", width:480, center:true, modal:true, modalType:"transparent", children:[{$type:"TabControl", id:tabControlId, height:150, tabs:[{$type:"Control", caption:"Flash", control:{id:formId, $type:"AutoForm", formProfile:"htmleditorFormProfile", cols:"*", entity:flashObject, elements:[{property:"url", label:"\u5730\u5740"}, {property:"width", label:"\u5bbd\u5ea6"}, {property:"height", label:"\u9ad8\u5ea6"}, {property:"align", label:"\u5bf9\u9f50\u65b9\u5f0f", editor:new dorado.widget.TextEditor({id:flashAlignEditorId, entity:flashObject, property:"align", trigger:"autoMappingDropDown1", mapping:[{key:"default", value:"\u9ed8\u8ba4"}, {key:"left", value:"\u5de6\u6d6e\u52a8"}, {key:"right", value:"\u53f3\u6d6e\u52a8"}, {key:"block", value:"\u72ec\u5360\u4e00\u884c"}]})}]}}, {$type:"Control", caption:"\u4e0a\u4f20", control:{$type:"AutoForm", cols:"*,100", formProfile:"htmleditorFormProfile", elements:[{property:"url", label:"\u94fe\u63a5", layoutConstraint:{colSpan:1}, editor:pathEditor}, {$type:"Button", caption:"\u6d4f\u89c8...", onReady:function (self, arg) {
                if (self._inited) {
                    return;
                }
                self._inited = true;
                var view = this, callback = function (url) {
                    flashObject.set("url", url);
                    pathEditor.set("value", "");
                    var autoform = view.id(formId), tabControl = view.id(tabControlId);
                    if (autoform) {
                        autoform.refreshData();
                    }
                    if (tabControl) {
                        tabControl.set("currentTab", 0);
                    }
                };
                initBrowserButton(self, editor._uniqueId + "flash", $url(editor._flashUploadPath), pathEditor, callback);
            }}]}}]}], buttons:[{caption:"\u786e\u5b9a", listener:{onClick:function () {
                if (flashObject) {
                    var url = flashObject.get("url");
                    plugin.execCommand("insertflash", {url:url, width:flashObject.get("width"), height:flashObject.get("height"), style:alignImageMap[flashObject.get("align")]});
                    plugin.dialog.hide();
                }
            }}}, {caption:"\u53d6\u6d88", listener:{onClick:function () {
                plugin.dialog.hide();
            }}}]});
            editor.registerInnerControl(plugin.dialog);
        }
        var autoform = editor._view.id(formId);
        var img = editor._editor.selection.getRange().getClosedNode();
        if (img && /img/ig.test(img.tagName) && img.className == "edui-faked-video") {
            function getPars(str, par) {
                var reg = new RegExp(par + ":\\s*((\\w)*)", "ig");
                var arr = reg.exec(str);
                return arr ? arr[1] : "";
            }
            var style = img.style.cssText;
            var reg = "";
            if (/float/ig.test(style)) {
                reg = getPars(style, "float");
            } else {
                if (/display/ig.test(style)) {
                    reg = getPars(style, "display");
                }
            }
            switch (reg) {
              case "left":
              case "right":
              case "block":
                flashObject.set("align", reg);
                break;
            }
            flashObject.set("width", img.width);
            flashObject.set("height", img.height);
            flashObject.set("url", img.getAttribute("_url"));
        } else {
            flashObject.clearData();
        }
        if (autoform) {
            autoform.refreshData();
        }
        plugin.dialog.show();
    }};
    plugins.Anchor = {iconClass:"html-editor-icon anchor", command:"anchor", execute:function () {
        var plugin = this, anchorObject = plugin.anchorObject, editor = plugin._htmlEditor, formId = editor._uniqueId + "anchorForm";
        if (!anchorObject) {
            anchorObject = plugin.anchorObject = new dorado.Entity();
        }
        if (!plugin.dialog) {
            plugin.dialog = new dorado.widget.Dialog({caption:"\u951a\u70b9", width:480, center:true, modal:true, modalType:"transparent", children:[{id:formId, $type:"AutoForm", formProfile:"htmleditorFormProfile", cols:"*", entity:anchorObject, elements:[{property:"name", label:"\u951a\u70b9\u540d\u5b57"}]}], buttons:[{caption:"\u786e\u5b9a", listener:{onClick:function () {
                if (anchorObject) {
                    var name = anchorObject.get("name");
                    if (name) {
                        plugin.execCommand("anchor", name);
                        plugin.dialog.hide();
                    }
                }
            }}}, {caption:"\u53d6\u6d88", listener:{onClick:function () {
                plugin.dialog.hide();
            }}}]});
            editor.registerInnerControl(plugin.dialog);
        }
        var anchor, img = editor._editor.selection.getRange().getClosedNode(), autoform = editor._view.id(formId);
        if (img && /img/ig.test(img.tagName.toLowerCase()) && img.getAttribute("anchorname")) {
            anchor = img.getAttribute("anchorname");
        }
        anchorObject.set("name", anchor || "");
        autoform.refreshData();
        plugin.dialog.show();
    }};
    plugins.Map = {iconClass:"html-editor-icon map", command:"inserthtml", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, iframeId = editor._uniqueId + "_map_iframe";
        if (!plugin.dialog) {
            plugin.dialog = new dorado.widget.Dialog({caption:"Baidu Map", width:580, height:490, resizeable:false, center:true, modal:true, modalType:"transparent", children:[{id:iframeId, $type:"IFrame", path:dorado.Setting["common.contextPath"] + "dorado/client/resources/htmleditor_map.html?" + (new Date()).getTime(), onCreateDom:function (self) {
                self._doms.iframe.editor = editor._editor;
            }}], buttons:[{caption:"OK", onClick:function (self, arg) {
                var iframe = this.id(iframeId), contentWindow = iframe.getIFrameWindow();
                contentWindow.dialog_onok();
                plugin.dialog.hide();
            }}, {caption:"Cancel", onClick:function (self, arg) {
                plugin.dialog.hide();
            }}]});
            editor.registerInnerControl(plugin.dialog);
        } else {
            var iframe = editor.get("view").id(iframeId);
            iframe.set("path", dorado.Setting["common.contextPath"] + "dorado/client/resources/htmleditor_map.html?" + (new Date()).getTime());
        }
        plugin.dialog.show();
    }};
    plugins.GMap = {iconClass:"html-editor-icon gmap", command:"inserthtml", execute:function () {
        var plugin = this, editor = plugin._htmlEditor, iframeId = editor._uniqueId + "_gmap_iframe";
        if (!plugin.dialog) {
            plugin.dialog = new dorado.widget.Dialog({caption:"Google Map", width:580, height:490, center:true, modal:true, resizeable:false, modalType:"transparent", children:[{id:iframeId, $type:"IFrame", path:dorado.Setting["common.contextPath"] + "dorado/client/resources/htmleditor_gmap.html?" + (new Date()).getTime(), onCreateDom:function (self) {
                self._doms.iframe.editor = editor._editor;
            }}], buttons:[{caption:"OK", onClick:function (self, arg) {
                var iframe = this.id(iframeId), contentWindow = iframe.getIFrameWindow();
                contentWindow.dialog_onok();
                plugin.dialog.hide();
            }}, {caption:"Cancel", onClick:function (self, arg) {
                plugin.dialog.hide();
            }}]});
            editor.registerInnerControl(plugin.dialog);
        } else {
            var iframe = editor.get("view").id(iframeId);
            iframe.set("path", dorado.Setting["common.contextPath"] + "dorado/client/resources/htmleditor_gmap.html?" + (new Date()).getTime());
        }
        plugin.dialog.show();
    }};
})(dorado.htmleditor.plugins);

