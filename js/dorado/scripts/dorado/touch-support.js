


(function () {
    var startTag = /^<(\w+)((?:\s+[\w,-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/, endTag = /^<\/(\w+)[^>]*>/, attr = /([\w,-]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;
    var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");
    var block = makeMap("address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul");
    var inline = makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");
    var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");
    var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");
    var special = makeMap("script,style");
    var htmlParser = this.htmlParser = function (html, handler) {
        var index, chars, match, stack = [], last = html;
        stack.last = function () {
            return this[this.length - 1];
        };
        while (html) {
            chars = true;
            if (!stack.last() || !special[stack.last()]) {
                if (html.indexOf("<!--") == 0) {
                    index = html.indexOf("-->");
                    if (index >= 0) {
                        if (handler.comment) {
                            handler.comment(html.substring(4, index));
                        }
                        html = html.substring(index + 3);
                        chars = false;
                    }
                } else {
                    if (html.indexOf("</") == 0) {
                        match = html.match(endTag);
                        if (match) {
                            html = html.substring(match[0].length);
                            match[0].replace(endTag, parseEndTag);
                            chars = false;
                        }
                    } else {
                        if (html.indexOf("<") == 0) {
                            match = html.match(startTag);
                            if (match) {
                                html = html.substring(match[0].length);
                                match[0].replace(startTag, parseStartTag);
                                chars = false;
                            }
                        }
                    }
                }
                if (chars) {
                    index = html.indexOf("<");
                    var text = index < 0 ? html : html.substring(0, index);
                    html = index < 0 ? "" : html.substring(index);
                    if (handler.chars) {
                        handler.chars(text);
                    }
                }
            } else {
                html = html.replace(new RegExp("(.*)</" + stack.last() + "[^>]*>"), function (all, text) {
                    text = text.replace(/<!--(.*?)-->/g, "$1").replace(/<!\[CDATA\[(.*?)]]>/g, "$1");
                    if (handler.chars) {
                        handler.chars(text);
                    }
                    return "";
                });
                parseEndTag("", stack.last());
            }
            if (html == last) {
                throw "Parse Error: " + html;
            }
            last = html;
        }
        parseEndTag();
        function parseStartTag(tag, tagName, rest, unary) {
            if (block[tagName]) {
                while (stack.last() && inline[stack.last()]) {
                    parseEndTag("", stack.last());
                }
            }
            if (closeSelf[tagName] && stack.last() == tagName) {
                parseEndTag("", tagName);
            }
            unary = empty[tagName] || !!unary;
            if (!unary) {
                stack.push(tagName);
            }
            if (handler.start) {
                var attrs = [];
                rest.replace(attr, function (match, name) {
                    var value = arguments[2] ? arguments[2] : arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : fillAttrs[name] ? name : "";
                    attrs.push({name:name, value:value, escaped:value.replace(/(^|[^\\])"/g, "$1\\\"")});
                });
                if (handler.start) {
                    handler.start(tagName, attrs, unary);
                }
            }
        }
        function parseEndTag(tag, tagName) {
            if (!tagName) {
                var pos = 0;
            } else {
                for (var pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos] == tagName) {
                        break;
                    }
                }
            }
            if (pos >= 0) {
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (handler.end) {
                        handler.end(stack[i]);
                    }
                }
                stack.length = pos;
            }
        }
    };
    this.HTMLtoXML = function (html) {
        var results = "";
        htmlParser(html, {start:function (tag, attrs, unary) {
            results += "<" + tag;
            for (var i = 0; i < attrs.length; i++) {
                results += " " + attrs[i].name + "=\"" + attrs[i].escaped + "\"";
            }
            results += (unary ? "/" : "") + ">";
        }, end:function (tag) {
            results += "</" + tag + ">";
        }, chars:function (text) {
            results += text;
        }, comment:function (text) {
            results += "<!--" + text + "-->";
        }});
        return results;
    };
    this.HTMLtoDOM = function (html, doc) {
        var one = makeMap("html,head,body,title");
        var structure = {link:"head", base:"head"};
        if (!doc) {
            if (typeof DOMDocument != "undefined") {
                doc = new DOMDocument();
            } else {
                if (typeof document != "undefined" && document.implementation && document.implementation.createDocument) {
                    doc = document.implementation.createDocument("", "", null);
                } else {
                    if (typeof ActiveX != "undefined") {
                        doc = new ActiveXObject("Msxml.DOMDocument");
                    }
                }
            }
        } else {
            doc = doc.ownerDocument || doc.getOwnerDocument && doc.getOwnerDocument() || doc;
        }
        var elems = [], documentElement = doc.documentElement || doc.getDocumentElement && doc.getDocumentElement();
        if (!documentElement && doc.createElement) {
            (function () {
                var html = doc.createElement("html");
                var head = doc.createElement("head");
                head.appendChild(doc.createElement("title"));
                html.appendChild(head);
                html.appendChild(doc.createElement("body"));
                doc.appendChild(html);
            })();
        }
        if (doc.getElementsByTagName) {
            for (var i in one) {
                one[i] = doc.getElementsByTagName(i)[0];
            }
        }
        var curParentNode = one.body;
        htmlParser(html, {start:function (tagName, attrs, unary) {
            if (one[tagName]) {
                curParentNode = one[tagName];
                return;
            }
            var elem = doc.createElement(tagName);
            for (var attr in attrs) {
                elem.setAttribute(attrs[attr].name, attrs[attr].value);
            }
            if (structure[tagName] && typeof one[structure[tagName]] != "boolean") {
                one[structure[tagName]].appendChild(elem);
            } else {
                if (curParentNode && curParentNode.appendChild) {
                    curParentNode.appendChild(elem);
                }
            }
            if (!unary) {
                elems.push(elem);
                curParentNode = elem;
            }
        }, end:function (tag) {
            elems.length -= 1;
            curParentNode = elems[elems.length - 1];
        }, chars:function (text) {
            curParentNode.appendChild(doc.createTextNode(text));
        }, comment:function (text) {
        }});
        return doc;
    };
    function makeMap(str) {
        var obj = {}, items = str.split(",");
        for (var i = 0; i < items.length; i++) {
            obj[items[i]] = true;
        }
        return obj;
    }
})();
function Swipe(container, options) {
    options = options || {};
    var noop = function () {
    };
    var offloadFn = function (fn) {
        setTimeout(fn || noop, 0);
    };
    var browser = {addEventListener:!!window.addEventListener, touch:("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch, transitions:(function (temp) {
        var props = ["transformProperty", "WebkitTransform", "MozTransform", "OTransform", "msTransform"];
        for (var i in props) {
            if (temp.style[props[i]] !== undefined) {
                return true;
            }
        }
        return false;
    })(document.createElement("swipe"))};
    if (!container) {
        return;
    }
    var element = container.children[0], slides, slidePos, width, height, vertical = options.vertical, index = parseInt(options.startSlide, 10) || 0, speed = options.speed || 300;
    function setup() {
        slides = element.children;
        slidePos = new Array(slides.length);
        if (vertical) {
            height = container.getBoundingClientRect().height || container.offsetHeight;
            element.style.height = (slides.length * height) + "px";
        } else {
            width = container.getBoundingClientRect().width || container.offsetWidth;
            element.style.width = (slides.length * width) + "px";
        }
        var pos = slides.length;
        while (pos--) {
            var slide = slides[pos];
            if (vertical) {
                slide.style.height = height + "px";
                if (browser.transitions) {
                    slide.style.top = (pos * -height) + "px";
                    moveY(pos, index > pos ? -height : (index < pos ? height : 0), 0);
                }
            } else {
                slide.style.width = width + "px";
                if (browser.transitions) {
                    slide.style.left = (pos * -width) + "px";
                    move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
                }
            }
            slide.setAttribute("data-index", pos);
        }
        if (!browser.transitions) {
            if (vertical) {
                element.style.top = (index * -height) + "px";
            } else {
                element.style.left = (index * -width) + "px";
            }
        }
        container.style.visibility = "visible";
    }
    function prev() {
        if (index) {
            slide(index - 1);
        } else {
            if (options.continuous) {
                slide(slides.length - 1);
            }
        }
    }
    function next() {
        if (index < slides.length - 1) {
            slide(index + 1);
        } else {
            if (options.continuous) {
                slide(0);
            }
        }
    }
    function slide(to, slideSpeed) {
        if (index == to) {
            return;
        }
        if (browser.transitions) {
            var diff = Math.abs(index - to) - 1;
            var direction = Math.abs(index - to) / (index - to);
            while (diff--) {
                move((to > index ? to : index) - diff - 1, width * direction, 0);
            }
            move(index, width * direction, slideSpeed || speed);
            move(to, 0, slideSpeed || speed);
        } else {
            animate(index * -width, to * -width, slideSpeed || speed);
        }
        index = to;
        offloadFn(options.callback && options.callback(index, slides[index]));
    }
    function move(index, dist, speed) {
        translate(index, dist, speed);
        slidePos[index] = dist;
    }
    function translate(index, dist, speed) {
        var slide = slides[index], style = slide && slide.style;
        if (!style) {
            return;
        }
        style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.transitionDuration = speed + "ms";
        style.webkitTransform = "translate(" + dist + "px,0)" + "translateZ(0)";
        style.msTransform = style.MozTransform = "translateX(" + dist + "px)";
    }
    function moveY(index, dist, speed) {
        translateY(index, dist, speed);
        slidePos[index] = dist;
    }
    function translateY(index, dist, speed) {
        var slide = slides[index], style = slide && slide.style;
        if (!style) {
            return;
        }
        style.webkitTransitionDuration = style.MozTransitionDuration = style.msTransitionDuration = style.transitionDuration = speed + "ms";
        style.webkitTransform = "translate(0," + dist + "px)" + "translateZ(0)";
        style.msTransform = style.MozTransform = "translateY(" + dist + "px)";
    }
    var start = {}, delta = {}, isScrolling;
    var events = {handleEvent:function (event) {
        switch (event.type) {
          case "touchstart":
          case "mousedown":
            this.start(event);
            break;
          case "touchmove":
          case "mousemove":
            this.move(event);
            break;
          case "touchend":
          case "mouseup":
            offloadFn(this.end(event));
            break;
          case "webkitTransitionEnd":
          case "msTransitionEnd":
          case "oTransitionEnd":
          case "otransitionend":
          case "transitionend":
            offloadFn(this.transitionEnd(event));
            break;
          case "resize":
            offloadFn(setup.call());
            break;
        }
        if (options.stopPropagation) {
            event.stopPropagation();
        }
    }, start:function (event) {
        var touches = browser.touch ? event.touches[0] : event;
        start = {x:touches.pageX, y:touches.pageY, time:+new Date};
        isScrolling = undefined;
        delta = {};
        if (browser.touch) {
            element.addEventListener("touchmove", this, false);
            element.addEventListener("touchend", this, false);
        } else {
            document.addEventListener("mousemove", this, false);
            document.addEventListener("mouseup", this, false);
        }
    }, move:function (event) {
        if (browser.touch && ((event.touches.length > 1) || (event.scale && event.scale !== 1))) {
            return;
        }
        if (options.disableScroll) {
            event.preventDefault();
        }
        var touches = browser.touch ? event.touches[0] : event;
        delta = {x:touches.pageX - start.x, y:touches.pageY - start.y};
        if (typeof isScrolling == "undefined") {
            if (vertical) {
                isScrolling = !!(isScrolling || Math.abs(delta.x) > Math.abs(delta.y));
            } else {
                isScrolling = !!(isScrolling || Math.abs(delta.x) < Math.abs(delta.y));
            }
        }
        if (!isScrolling) {
            event.preventDefault();
            if (!vertical) {
                delta.x = delta.x / ((!index && delta.x > 0 || index == slides.length - 1 && delta.x < 0) ? (Math.abs(delta.x) / width + 1) : 1);
                translate(index - 1, delta.x + slidePos[index - 1], 0);
                translate(index, delta.x + slidePos[index], 0);
                translate(index + 1, delta.x + slidePos[index + 1], 0);
            } else {
                delta.y = delta.y / ((!index && delta.y > 0 || index == slides.length - 1 && delta.y < 0) ? (Math.abs(delta.y) / height + 1) : 1);
                translateY(index - 1, delta.y + slidePos[index - 1], 0);
                translateY(index, delta.y + slidePos[index], 0);
                translateY(index + 1, delta.y + slidePos[index + 1], 0);
            }
        }
    }, end:function (event) {
        var duration = +new Date - start.time, isValidSlide, isPastBounds, direction;
        if (!vertical) {
            isValidSlide = Number(duration) < 250 && Math.abs(delta.x) > 20 || Math.abs(delta.x) > width / 2;
            isPastBounds = !index && delta.x > 0 || index == slides.length - 1 && delta.x < 0;
            direction = delta.x < 0;
            if (!isScrolling) {
                if (isValidSlide && !isPastBounds) {
                    if (direction) {
                        move(index - 1, -width, 0);
                        move(index, slidePos[index] - width, speed);
                        move(index + 1, slidePos[index + 1] - width, speed);
                        index += 1;
                    } else {
                        move(index + 1, width, 0);
                        move(index, slidePos[index] + width, speed);
                        move(index - 1, slidePos[index - 1] + width, speed);
                        index += -1;
                    }
                    options.callback && options.callback(index, slides[index]);
                } else {
                    move(index - 1, -width, speed);
                    move(index, 0, speed);
                    move(index + 1, width, speed);
                }
            }
        } else {
            isValidSlide = Number(duration) < 250 && Math.abs(delta.y) > 20 || Math.abs(delta.y) > height / 2;
            isPastBounds = !index && delta.y > 0 || index == slides.length - 1 && delta.y < 0;
            direction = delta.y < 0;
            if (!isScrolling) {
                if (isValidSlide && !isPastBounds) {
                    if (direction) {
                        moveY(index - 1, -height, 0);
                        moveY(index, slidePos[index] - height, speed);
                        moveY(index + 1, slidePos[index + 1] - height, speed);
                        index += 1;
                    } else {
                        moveY(index + 1, height, 0);
                        moveY(index, slidePos[index] + height, speed);
                        moveY(index - 1, slidePos[index - 1] + height, speed);
                        index += -1;
                    }
                    options.callback && options.callback(index, slides[index]);
                } else {
                    moveY(index - 1, -height, speed);
                    moveY(index, 0, speed);
                    moveY(index + 1, height, speed);
                }
            }
        }
        if (browser.touch) {
            element.removeEventListener("touchmove", events, false);
            element.removeEventListener("touchend", events, false);
        } else {
            document.removeEventListener("mousemove", events, false);
            document.removeEventListener("mouseup", events, false);
        }
    }, transitionEnd:function (event) {
        if (parseInt(event.target.getAttribute("data-index"), 10) == index) {
            options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);
        }
    }};
    setup();
    if (browser.addEventListener) {
        if (browser.touch) {
            element.addEventListener("touchstart", events, false);
        } else {
            element.addEventListener("mousedown", events, false);
        }
        if (browser.transitions) {
            element.addEventListener("webkitTransitionEnd", events, false);
            element.addEventListener("msTransitionEnd", events, false);
            element.addEventListener("oTransitionEnd", events, false);
            element.addEventListener("otransitionend", events, false);
            element.addEventListener("transitionend", events, false);
        }
        window.addEventListener("resize", events, false);
    }
    return {setup:function () {
        setup();
    }, refresh:function () {
        setup();
    }, getPos:function () {
        return index;
    }, setPos:function (pos) {
        index = pos;
        setup();
    }, prev:function () {
        prev();
    }, next:function () {
        next();
    }, kill:function () {
        element.style.width = "auto";
        element.style.left = 0;
        var pos = slides.length;
        while (pos--) {
            var slide = slides[pos];
            if (!vertical) {
                slide.style.width = "100%";
                slide.style.left = 0;
            } else {
                slide.style.height = "100%";
                slide.style.top = 0;
            }
            if (browser.transitions) {
                translate(pos, 0, 0);
            }
        }
        if (browser.addEventListener) {
            element.removeEventListener("touchstart", events, false);
            element.removeEventListener("webkitTransitionEnd", events, false);
            element.removeEventListener("msTransitionEnd", events, false);
            element.removeEventListener("oTransitionEnd", events, false);
            element.removeEventListener("otransitionend", events, false);
            element.removeEventListener("transitionend", events, false);
            window.removeEventListener("resize", events, false);
        } else {
            window.onresize = null;
        }
    }};
}
(function (window, undefined) {
    "use strict";
    var Hammer = function Hammer(element, options) {
        return new Hammer.Instance(element, options || {});
    };
    Hammer.VERSION = "1.1.3";
    Hammer.defaults = {behavior:{userSelect:"none", touchAction:"pan-y", touchCallout:"none", contentZooming:"none", userDrag:"none", tapHighlightColor:"rgba(0,0,0,0)"}};
    Hammer.DOCUMENT = document;
    Hammer.HAS_POINTEREVENTS = navigator.pointerEnabled || navigator.msPointerEnabled;
    Hammer.HAS_TOUCHEVENTS = ("ontouchstart" in window);
    Hammer.IS_MOBILE = /mobile|tablet|ip(ad|hone|od)|android|silk/i.test(navigator.userAgent);
    Hammer.NO_MOUSEEVENTS = (Hammer.HAS_TOUCHEVENTS && Hammer.IS_MOBILE) || Hammer.HAS_POINTEREVENTS;
    Hammer.CALCULATE_INTERVAL = 25;
    var EVENT_TYPES = {};
    var DIRECTION_DOWN = Hammer.DIRECTION_DOWN = "down";
    var DIRECTION_LEFT = Hammer.DIRECTION_LEFT = "left";
    var DIRECTION_UP = Hammer.DIRECTION_UP = "up";
    var DIRECTION_RIGHT = Hammer.DIRECTION_RIGHT = "right";
    var POINTER_MOUSE = Hammer.POINTER_MOUSE = "mouse";
    var POINTER_TOUCH = Hammer.POINTER_TOUCH = "touch";
    var POINTER_PEN = Hammer.POINTER_PEN = "pen";
    var EVENT_START = Hammer.EVENT_START = "start";
    var EVENT_MOVE = Hammer.EVENT_MOVE = "move";
    var EVENT_END = Hammer.EVENT_END = "end";
    var EVENT_RELEASE = Hammer.EVENT_RELEASE = "release";
    var EVENT_TOUCH = Hammer.EVENT_TOUCH = "touch";
    Hammer.READY = false;
    Hammer.plugins = Hammer.plugins || {};
    Hammer.gestures = Hammer.gestures || {};
    function setup() {
        if (Hammer.READY) {
            return;
        }
        Event.determineEventTypes();
        Utils.each(Hammer.gestures, function (gesture) {
            Detection.register(gesture);
        });
        Event.onTouch(Hammer.DOCUMENT, EVENT_MOVE, Detection.detect);
        Event.onTouch(Hammer.DOCUMENT, EVENT_END, Detection.detect);
        Hammer.READY = true;
    }
    var Utils = Hammer.utils = {extend:function extend(dest, src, merge) {
        for (var key in src) {
            if (!src.hasOwnProperty(key) || (dest[key] !== undefined && merge)) {
                continue;
            }
            dest[key] = src[key];
        }
        return dest;
    }, on:function on(element, type, handler) {
        element.addEventListener(type, handler, false);
    }, off:function off(element, type, handler) {
        element.removeEventListener(type, handler, false);
    }, each:function each(obj, iterator, context) {
        var i, len;
        if ("forEach" in obj) {
            obj.forEach(iterator, context);
        } else {
            if (obj.length !== undefined) {
                for (i = 0, len = obj.length; i < len; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false) {
                        return;
                    }
                }
            } else {
                for (i in obj) {
                    if (obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj) === false) {
                        return;
                    }
                }
            }
        }
    }, inStr:function inStr(src, find) {
        return src.indexOf(find) > -1;
    }, inArray:function inArray(src, find) {
        if (src.indexOf) {
            var index = src.indexOf(find);
            return (index === -1) ? false : index;
        } else {
            for (var i = 0, len = src.length; i < len; i++) {
                if (src[i] === find) {
                    return i;
                }
            }
            return false;
        }
    }, toArray:function toArray(obj) {
        return Array.prototype.slice.call(obj, 0);
    }, hasParent:function hasParent(node, parent) {
        while (node) {
            if (node == parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    }, getCenter:function getCenter(touches) {
        var pageX = [], pageY = [], clientX = [], clientY = [], min = Math.min, max = Math.max;
        if (touches.length === 1) {
            return {pageX:touches[0].pageX, pageY:touches[0].pageY, clientX:touches[0].clientX, clientY:touches[0].clientY};
        }
        Utils.each(touches, function (touch) {
            pageX.push(touch.pageX);
            pageY.push(touch.pageY);
            clientX.push(touch.clientX);
            clientY.push(touch.clientY);
        });
        return {pageX:(min.apply(Math, pageX) + max.apply(Math, pageX)) / 2, pageY:(min.apply(Math, pageY) + max.apply(Math, pageY)) / 2, clientX:(min.apply(Math, clientX) + max.apply(Math, clientX)) / 2, clientY:(min.apply(Math, clientY) + max.apply(Math, clientY)) / 2};
    }, getVelocity:function getVelocity(deltaTime, deltaX, deltaY) {
        return {x:Math.abs(deltaX / deltaTime) || 0, y:Math.abs(deltaY / deltaTime) || 0};
    }, getAngle:function getAngle(touch1, touch2) {
        var x = touch2.clientX - touch1.clientX, y = touch2.clientY - touch1.clientY;
        return Math.atan2(y, x) * 180 / Math.PI;
    }, getDirection:function getDirection(touch1, touch2) {
        var x = Math.abs(touch1.clientX - touch2.clientX), y = Math.abs(touch1.clientY - touch2.clientY);
        if (x >= y) {
            return touch1.clientX - touch2.clientX > 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
        }
        return touch1.clientY - touch2.clientY > 0 ? DIRECTION_UP : DIRECTION_DOWN;
    }, getDistance:function getDistance(touch1, touch2) {
        var x = touch2.clientX - touch1.clientX, y = touch2.clientY - touch1.clientY;
        return Math.sqrt((x * x) + (y * y));
    }, getScale:function getScale(start, end) {
        if (start.length >= 2 && end.length >= 2) {
            return this.getDistance(end[0], end[1]) / this.getDistance(start[0], start[1]);
        }
        return 1;
    }, getRotation:function getRotation(start, end) {
        if (start.length >= 2 && end.length >= 2) {
            return this.getAngle(end[1], end[0]) - this.getAngle(start[1], start[0]);
        }
        return 0;
    }, isVertical:function isVertical(direction) {
        return direction == DIRECTION_UP || direction == DIRECTION_DOWN;
    }, setPrefixedCss:function setPrefixedCss(element, prop, value, toggle) {
        var prefixes = ["", "Webkit", "Moz", "O", "ms"];
        prop = Utils.toCamelCase(prop);
        for (var i = 0; i < prefixes.length; i++) {
            var p = prop;
            if (prefixes[i]) {
                p = prefixes[i] + p.slice(0, 1).toUpperCase() + p.slice(1);
            }
            if (p in element.style) {
                element.style[p] = (toggle == null || toggle) && value || "";
                break;
            }
        }
    }, toggleBehavior:function toggleBehavior(element, props, toggle) {
        if (!props || !element || !element.style) {
            return;
        }
        Utils.each(props, function (value, prop) {
            Utils.setPrefixedCss(element, prop, value, toggle);
        });
        var falseFn = toggle && function () {
            return false;
        };
        if (props.userSelect == "none") {
            element.onselectstart = falseFn;
        }
        if (props.userDrag == "none") {
            element.ondragstart = falseFn;
        }
    }, toCamelCase:function toCamelCase(str) {
        return str.replace(/[_-]([a-z])/g, function (s) {
            return s[1].toUpperCase();
        });
    }};
    var Event = Hammer.event = {preventMouseEvents:false, started:false, shouldDetect:false, on:function on(element, type, handler, hook) {
        var types = type.split(" ");
        Utils.each(types, function (type) {
            Utils.on(element, type, handler);
            hook && hook(type);
        });
    }, off:function off(element, type, handler, hook) {
        var types = type.split(" ");
        Utils.each(types, function (type) {
            Utils.off(element, type, handler);
            hook && hook(type);
        });
    }, onTouch:function onTouch(element, eventType, handler) {
        var self = this;
        var onTouchHandler = function onTouchHandler(ev) {
            var srcType = ev.type.toLowerCase(), isPointer = Hammer.HAS_POINTEREVENTS, isMouse = Utils.inStr(srcType, "mouse"), triggerType;
            if (isMouse && self.preventMouseEvents) {
                return;
            } else {
                if (isMouse && eventType == EVENT_START && ev.button === 0) {
                    self.preventMouseEvents = false;
                    self.shouldDetect = true;
                } else {
                    if (isPointer && eventType == EVENT_START) {
                        self.shouldDetect = (ev.buttons === 1 || PointerEvent.matchType(POINTER_TOUCH, ev));
                    } else {
                        if (!isMouse && eventType == EVENT_START) {
                            self.preventMouseEvents = true;
                            self.shouldDetect = true;
                        }
                    }
                }
            }
            if (isPointer && eventType != EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
            }
            if (self.shouldDetect) {
                triggerType = self.doDetect.call(self, ev, eventType, element, handler);
            }
            if (triggerType == EVENT_END) {
                self.preventMouseEvents = false;
                self.shouldDetect = false;
                PointerEvent.reset();
            }
            if (isPointer && eventType == EVENT_END) {
                PointerEvent.updatePointer(eventType, ev);
            }
        };
        this.on(element, EVENT_TYPES[eventType], onTouchHandler);
        return onTouchHandler;
    }, doDetect:function doDetect(ev, eventType, element, handler) {
        var touchList = this.getTouchList(ev, eventType);
        var touchListLength = touchList.length;
        var triggerType = eventType;
        var triggerChange = touchList.trigger;
        var changedLength = touchListLength;
        if (eventType == EVENT_START) {
            triggerChange = EVENT_TOUCH;
        } else {
            if (eventType == EVENT_END) {
                triggerChange = EVENT_RELEASE;
                changedLength = touchList.length - ((ev.changedTouches) ? ev.changedTouches.length : 1);
            }
        }
        if (changedLength > 0 && this.started) {
            triggerType = EVENT_MOVE;
        }
        this.started = true;
        var evData = this.collectEventData(element, triggerType, touchList, ev);
        if (eventType != EVENT_END) {
            handler.call(Detection, evData);
        }
        if (triggerChange) {
            evData.changedLength = changedLength;
            evData.eventType = triggerChange;
            handler.call(Detection, evData);
            evData.eventType = triggerType;
            delete evData.changedLength;
        }
        if (triggerType == EVENT_END) {
            handler.call(Detection, evData);
            this.started = false;
        }
        return triggerType;
    }, determineEventTypes:function determineEventTypes() {
        var types;
        if (Hammer.HAS_POINTEREVENTS) {
            if (window.PointerEvent) {
                types = ["pointerdown", "pointermove", "pointerup pointercancel lostpointercapture"];
            } else {
                types = ["MSPointerDown", "MSPointerMove", "MSPointerUp MSPointerCancel MSLostPointerCapture"];
            }
        } else {
            if (Hammer.NO_MOUSEEVENTS) {
                types = ["touchstart", "touchmove", "touchend touchcancel"];
            } else {
                types = ["touchstart mousedown", "touchmove mousemove", "touchend touchcancel mouseup"];
            }
        }
        EVENT_TYPES[EVENT_START] = types[0];
        EVENT_TYPES[EVENT_MOVE] = types[1];
        EVENT_TYPES[EVENT_END] = types[2];
        return EVENT_TYPES;
    }, getTouchList:function getTouchList(ev, eventType) {
        if (Hammer.HAS_POINTEREVENTS) {
            return PointerEvent.getTouchList();
        }
        if (ev.touches) {
            if (eventType == EVENT_MOVE) {
                return ev.touches;
            }
            var identifiers = [];
            var concat = [].concat(Utils.toArray(ev.touches), Utils.toArray(ev.changedTouches));
            var touchList = [];
            Utils.each(concat, function (touch) {
                if (Utils.inArray(identifiers, touch.identifier) === false) {
                    touchList.push(touch);
                }
                identifiers.push(touch.identifier);
            });
            return touchList;
        }
        ev.identifier = 1;
        return [ev];
    }, collectEventData:function collectEventData(element, eventType, touches, ev) {
        var pointerType = POINTER_TOUCH;
        if (Utils.inStr(ev.type, "mouse") || PointerEvent.matchType(POINTER_MOUSE, ev)) {
            pointerType = POINTER_MOUSE;
        } else {
            if (PointerEvent.matchType(POINTER_PEN, ev)) {
                pointerType = POINTER_PEN;
            }
        }
        return {center:Utils.getCenter(touches), timeStamp:Date.now(), target:ev.target, touches:touches, eventType:eventType, pointerType:pointerType, srcEvent:ev, preventDefault:function () {
            var srcEvent = this.srcEvent;
            srcEvent.preventManipulation && srcEvent.preventManipulation();
            srcEvent.preventDefault && srcEvent.preventDefault();
        }, stopPropagation:function () {
            this.srcEvent.stopPropagation();
        }, stopDetect:function () {
            return Detection.stopDetect();
        }};
    }};
    var PointerEvent = Hammer.PointerEvent = {pointers:{}, getTouchList:function getTouchList() {
        var touchlist = [];
        Utils.each(this.pointers, function (pointer) {
            touchlist.push(pointer);
        });
        return touchlist;
    }, updatePointer:function updatePointer(eventType, pointerEvent) {
        if (eventType == EVENT_END || (eventType != EVENT_END && pointerEvent.buttons !== 1)) {
            delete this.pointers[pointerEvent.pointerId];
        } else {
            pointerEvent.identifier = pointerEvent.pointerId;
            this.pointers[pointerEvent.pointerId] = pointerEvent;
        }
    }, matchType:function matchType(pointerType, ev) {
        if (!ev.pointerType) {
            return false;
        }
        var pt = ev.pointerType, types = {};
        types[POINTER_MOUSE] = (pt === (ev.MSPOINTER_TYPE_MOUSE || POINTER_MOUSE));
        types[POINTER_TOUCH] = (pt === (ev.MSPOINTER_TYPE_TOUCH || POINTER_TOUCH));
        types[POINTER_PEN] = (pt === (ev.MSPOINTER_TYPE_PEN || POINTER_PEN));
        return types[pointerType];
    }, reset:function resetList() {
        this.pointers = {};
    }};
    var Detection = Hammer.detection = {gestures:[], current:null, previous:null, stopped:false, startDetect:function startDetect(inst, eventData) {
        if (this.current) {
            return;
        }
        this.stopped = false;
        this.current = {inst:inst, startEvent:Utils.extend({}, eventData), lastEvent:false, lastCalcEvent:false, futureCalcEvent:false, lastCalcData:{}, name:""};
        this.detect(eventData);
    }, detect:function detect(eventData) {
        if (!this.current || this.stopped) {
            return;
        }
        eventData = this.extendEventData(eventData);
        var inst = this.current.inst, instOptions = inst.options;
        Utils.each(this.gestures, function triggerGesture(gesture) {
            if (!this.stopped && inst.enabled && instOptions[gesture.name]) {
                gesture.handler.call(gesture, eventData, inst);
            }
        }, this);
        if (this.current) {
            this.current.lastEvent = eventData;
        }
        if (eventData.eventType == EVENT_END) {
            this.stopDetect();
        }
        return eventData;
    }, stopDetect:function stopDetect() {
        this.previous = Utils.extend({}, this.current);
        this.current = null;
        this.stopped = true;
    }, getCalculatedData:function getCalculatedData(ev, center, deltaTime, deltaX, deltaY) {
        var cur = this.current, recalc = false, calcEv = cur.lastCalcEvent, calcData = cur.lastCalcData;
        if (calcEv && ev.timeStamp - calcEv.timeStamp > Hammer.CALCULATE_INTERVAL) {
            center = calcEv.center;
            deltaTime = ev.timeStamp - calcEv.timeStamp;
            deltaX = ev.center.clientX - calcEv.center.clientX;
            deltaY = ev.center.clientY - calcEv.center.clientY;
            recalc = true;
        }
        if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
            cur.futureCalcEvent = ev;
        }
        if (!cur.lastCalcEvent || recalc) {
            calcData.velocity = Utils.getVelocity(deltaTime, deltaX, deltaY);
            calcData.angle = Utils.getAngle(center, ev.center);
            calcData.direction = Utils.getDirection(center, ev.center);
            cur.lastCalcEvent = cur.futureCalcEvent || ev;
            cur.futureCalcEvent = ev;
        }
        ev.velocityX = calcData.velocity.x;
        ev.velocityY = calcData.velocity.y;
        ev.interimAngle = calcData.angle;
        ev.interimDirection = calcData.direction;
    }, extendEventData:function extendEventData(ev) {
        var cur = this.current, startEv = cur.startEvent, lastEv = cur.lastEvent || startEv;
        if (ev.eventType == EVENT_TOUCH || ev.eventType == EVENT_RELEASE) {
            startEv.touches = [];
            Utils.each(ev.touches, function (touch) {
                startEv.touches.push({clientX:touch.clientX, clientY:touch.clientY});
            });
        }
        var deltaTime = ev.timeStamp - startEv.timeStamp, deltaX = ev.center.clientX - startEv.center.clientX, deltaY = ev.center.clientY - startEv.center.clientY;
        this.getCalculatedData(ev, lastEv.center, deltaTime, deltaX, deltaY);
        Utils.extend(ev, {startEvent:startEv, deltaTime:deltaTime, deltaX:deltaX, deltaY:deltaY, distance:Utils.getDistance(startEv.center, ev.center), angle:Utils.getAngle(startEv.center, ev.center), direction:Utils.getDirection(startEv.center, ev.center), scale:Utils.getScale(startEv.touches, ev.touches), rotation:Utils.getRotation(startEv.touches, ev.touches)});
        return ev;
    }, register:function register(gesture) {
        var options = gesture.defaults || {};
        if (options[gesture.name] === undefined) {
            options[gesture.name] = true;
        }
        Utils.extend(Hammer.defaults, options, true);
        gesture.index = gesture.index || 1000;
        this.gestures.push(gesture);
        this.gestures.sort(function (a, b) {
            if (a.index < b.index) {
                return -1;
            }
            if (a.index > b.index) {
                return 1;
            }
            return 0;
        });
        return this.gestures;
    }};
    Hammer.Instance = function (element, options) {
        var self = this;
        setup();
        this.element = element;
        this.enabled = true;
        Utils.each(options, function (value, name) {
            delete options[name];
            options[Utils.toCamelCase(name)] = value;
        });
        this.options = Utils.extend(Utils.extend({}, Hammer.defaults), options || {});
        if (this.options.behavior) {
            Utils.toggleBehavior(this.element, this.options.behavior, true);
        }
        this.eventStartHandler = Event.onTouch(element, EVENT_START, function (ev) {
            if (self.enabled && ev.eventType == EVENT_START) {
                Detection.startDetect(self, ev);
            } else {
                if (ev.eventType == EVENT_TOUCH) {
                    Detection.detect(ev);
                }
            }
        });
        this.eventHandlers = [];
    };
    Hammer.Instance.prototype = {on:function onEvent(gestures, handler) {
        var self = this;
        Event.on(self.element, gestures, handler, function (type) {
            self.eventHandlers.push({gesture:type, handler:handler});
        });
        return self;
    }, off:function offEvent(gestures, handler) {
        var self = this;
        Event.off(self.element, gestures, handler, function (type) {
            var index = Utils.inArray({gesture:type, handler:handler});
            if (index !== false) {
                self.eventHandlers.splice(index, 1);
            }
        });
        return self;
    }, trigger:function triggerEvent(gesture, eventData) {
        if (!eventData) {
            eventData = {};
        }
        var event = Hammer.DOCUMENT.createEvent("Event");
        event.initEvent(gesture, true, true);
        event.gesture = eventData;
        var element = this.element;
        if (Utils.hasParent(eventData.target, element)) {
            element = eventData.target;
        }
        element.dispatchEvent(event);
        return this;
    }, enable:function enable(state) {
        this.enabled = state;
        return this;
    }, dispose:function dispose() {
        var i, eh;
        Utils.toggleBehavior(this.element, this.options.behavior, false);
        for (i = -1; (eh = this.eventHandlers[++i]); ) {
            Utils.off(this.element, eh.gesture, eh.handler);
        }
        this.eventHandlers = [];
        Event.off(this.element, EVENT_TYPES[EVENT_START], this.eventStartHandler);
        return null;
    }};
    (function (name) {
        var triggered = false;
        function dragGesture(ev, inst) {
            var cur = Detection.current;
            if (inst.options.dragMaxTouches > 0 && ev.touches.length > inst.options.dragMaxTouches) {
                return;
            }
            switch (ev.eventType) {
              case EVENT_START:
                triggered = false;
                break;
              case EVENT_MOVE:
                if (ev.distance < inst.options.dragMinDistance && cur.name != name) {
                    return;
                }
                var startCenter = cur.startEvent.center;
                if (cur.name != name) {
                    cur.name = name;
                    if (inst.options.dragDistanceCorrection && ev.distance > 0) {
                        var factor = Math.abs(inst.options.dragMinDistance / ev.distance);
                        startCenter.pageX += ev.deltaX * factor;
                        startCenter.pageY += ev.deltaY * factor;
                        startCenter.clientX += ev.deltaX * factor;
                        startCenter.clientY += ev.deltaY * factor;
                        ev = Detection.extendEventData(ev);
                    }
                }
                if (cur.lastEvent.dragLockToAxis || (inst.options.dragLockToAxis && inst.options.dragLockMinDistance <= ev.distance)) {
                    ev.dragLockToAxis = true;
                }
                var lastDirection = cur.lastEvent.direction;
                if (ev.dragLockToAxis && lastDirection !== ev.direction) {
                    if (Utils.isVertical(lastDirection)) {
                        ev.direction = (ev.deltaY < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                    } else {
                        ev.direction = (ev.deltaX < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                    }
                }
                if (!triggered) {
                    inst.trigger(name + "start", ev);
                    triggered = true;
                }
                inst.trigger(name, ev);
                inst.trigger(name + ev.direction, ev);
                var isVertical = Utils.isVertical(ev.direction);
                if ((inst.options.dragBlockVertical && isVertical) || (inst.options.dragBlockHorizontal && !isVertical)) {
                    ev.preventDefault();
                }
                break;
              case EVENT_RELEASE:
                if (triggered && ev.changedLength <= inst.options.dragMaxTouches) {
                    inst.trigger(name + "end", ev);
                    triggered = false;
                }
                break;
              case EVENT_END:
                triggered = false;
                break;
            }
        }
        Hammer.gestures.Drag = {name:name, index:50, handler:dragGesture, defaults:{dragMinDistance:10, dragDistanceCorrection:true, dragMaxTouches:1, dragBlockHorizontal:false, dragBlockVertical:false, dragLockToAxis:false, dragLockMinDistance:25}};
    })("drag");
    Hammer.gestures.Gesture = {name:"gesture", index:1337, handler:function releaseGesture(ev, inst) {
        inst.trigger(this.name, ev);
    }};
    (function (name) {
        var timer;
        function holdGesture(ev, inst) {
            var options = inst.options, current = Detection.current;
            switch (ev.eventType) {
              case EVENT_START:
                clearTimeout(timer);
                current.name = name;
                timer = setTimeout(function () {
                    if (current && current.name == name) {
                        inst.trigger(name, ev);
                    }
                }, options.holdTimeout);
                break;
              case EVENT_MOVE:
                if (ev.distance > options.holdThreshold) {
                    clearTimeout(timer);
                }
                break;
              case EVENT_RELEASE:
                clearTimeout(timer);
                break;
            }
        }
        Hammer.gestures.Hold = {name:name, index:10, defaults:{holdTimeout:500, holdThreshold:2}, handler:holdGesture};
    })("hold");
    Hammer.gestures.Release = {name:"release", index:Infinity, handler:function releaseGesture(ev, inst) {
        if (ev.eventType == EVENT_RELEASE) {
            inst.trigger(this.name, ev);
        }
    }};
    Hammer.gestures.Swipe = {name:"swipe", index:40, defaults:{swipeMinTouches:1, swipeMaxTouches:1, swipeVelocityX:0.6, swipeVelocityY:0.6}, handler:function swipeGesture(ev, inst) {
        if (ev.eventType == EVENT_RELEASE) {
            var touches = ev.touches.length, options = inst.options;
            if (touches < options.swipeMinTouches || touches > options.swipeMaxTouches) {
                return;
            }
            if (ev.velocityX > options.swipeVelocityX || ev.velocityY > options.swipeVelocityY) {
                inst.trigger(this.name, ev);
                inst.trigger(this.name + ev.direction, ev);
            }
        }
    }};
    (function (name) {
        var hasMoved = false;
        function tapGesture(ev, inst) {
            var options = inst.options, current = Detection.current, prev = Detection.previous, sincePrev, didDoubleTap;
            switch (ev.eventType) {
              case EVENT_START:
                hasMoved = false;
                break;
              case EVENT_MOVE:
                hasMoved = hasMoved || (ev.distance > options.tapMaxDistance);
                break;
              case EVENT_END:
                if (!Utils.inStr(ev.srcEvent.type, "cancel") && ev.deltaTime < options.tapMaxTime && !hasMoved) {
                    sincePrev = prev && prev.lastEvent && ev.timeStamp - prev.lastEvent.timeStamp;
                    didDoubleTap = false;
                    if (prev && prev.name == name && (sincePrev && sincePrev < options.doubleTapInterval) && ev.distance < options.doubleTapDistance) {
                        inst.trigger("doubletap", ev);
                        didDoubleTap = true;
                    }
                    if (!didDoubleTap || options.tapAlways) {
                        current.name = name;
                        inst.trigger(current.name, ev);
                    }
                }
                break;
            }
        }
        Hammer.gestures.Tap = {name:name, index:100, handler:tapGesture, defaults:{tapMaxTime:250, tapMaxDistance:10, tapAlways:true, doubleTapDistance:20, doubleTapInterval:300}};
    })("tap");
    Hammer.gestures.Touch = {name:"touch", index:-Infinity, defaults:{preventDefault:false, preventMouse:false}, handler:function touchGesture(ev, inst) {
        if (inst.options.preventMouse && ev.pointerType == POINTER_MOUSE) {
            ev.stopDetect();
            return;
        }
        if (inst.options.preventDefault) {
            ev.preventDefault();
        }
        if (ev.eventType == EVENT_TOUCH) {
            inst.trigger("touch", ev);
        }
    }};
    (function (name) {
        var triggered = false;
        function transformGesture(ev, inst) {
            switch (ev.eventType) {
              case EVENT_START:
                triggered = false;
                break;
              case EVENT_MOVE:
                if (ev.touches.length < 2) {
                    return;
                }
                var scaleThreshold = Math.abs(1 - ev.scale);
                var rotationThreshold = Math.abs(ev.rotation);
                if (scaleThreshold < inst.options.transformMinScale && rotationThreshold < inst.options.transformMinRotation) {
                    return;
                }
                Detection.current.name = name;
                if (!triggered) {
                    inst.trigger(name + "start", ev);
                    triggered = true;
                }
                inst.trigger(name, ev);
                if (rotationThreshold > inst.options.transformMinRotation) {
                    inst.trigger("rotate", ev);
                }
                if (scaleThreshold > inst.options.transformMinScale) {
                    inst.trigger("pinch", ev);
                    inst.trigger("pinch" + (ev.scale < 1 ? "in" : "out"), ev);
                }
                break;
              case EVENT_RELEASE:
                if (triggered && ev.changedLength < 2) {
                    inst.trigger(name + "end", ev);
                    triggered = false;
                }
                break;
            }
        }
        Hammer.gestures.Transform = {name:name, index:45, defaults:{transformMinScale:0.01, transformMinRotation:1}, handler:transformGesture};
    })("transform");
    if (typeof define == "function" && define.amd) {
        define(function () {
            return Hammer;
        });
    } else {
        if (typeof module !== "undefined" && module.exports) {
            module.exports = Hammer;
        } else {
            window.Hammer = Hammer;
        }
    }
})(window);
(function (window, undefined) {
    "use strict";
    function setupPlugin(Hammer, $) {
        if (!Date.now) {
            Date.now = function now() {
                return new Date().getTime();
            };
        }
        Hammer.utils.each(["on", "off"], function (method) {
            Hammer.utils[method] = function (element, type, handler) {
                $(element)[method](type, function ($ev) {
                    var data = $.extend({}, $ev.originalEvent, $ev);
                    if (data.button === undefined) {
                        data.button = $ev.which - 1;
                    }
                    handler.call(this, data);
                });
            };
        });
        Hammer.Instance.prototype.trigger = function (gesture, eventData) {
            var el = $(this.element);
            if (el.has(eventData.target).length) {
                el = $(eventData.target);
            }
            return el.trigger({type:gesture, gesture:eventData});
        };
        $.fn.hammer = function (options) {
            return this.each(function () {
                var el = $(this);
                var inst = el.data("hammer");
                if (!inst) {
                    el.data("hammer", new Hammer(this, options || {}));
                } else {
                    if (inst && options) {
                        Hammer.utils.extend(inst.options, options);
                    }
                }
            });
        };
    }
    if (typeof define == "function" && define.amd) {
        define(["hammerjs", "jquery"], setupPlugin);
    } else {
        setupPlugin(window.Hammer, window.jQuery || window.Zepto);
    }
})(window);
(function (global) {
    var time = Date.now || function () {
        return +new Date();
    };
    var desiredFrames = 60;
    var millisecondsPerSecond = 1000;
    var running = {};
    var counter = 1;
    if (!global.core) {
        global.core = {effect:{}};
    } else {
        if (!core.effect) {
            core.effect = {};
        }
    }
    core.effect.Animate = {requestAnimationFrame:(function () {
        var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
        var isNative = !!requestFrame;
        if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
            isNative = false;
        }
        if (isNative) {
            return function (callback, root) {
                requestFrame(callback, root);
            };
        }
        var TARGET_FPS = 30;
        var requests = {};
        var requestCount = 0;
        var rafHandle = 1;
        var intervalHandle = null;
        var lastActive = +new Date();
        return function (callback, root) {
            var callbackHandle = rafHandle++;
            requests[callbackHandle] = callback;
            requestCount++;
            if (intervalHandle === null) {
                intervalHandle = setInterval(function () {
                    var time = +new Date();
                    var currentRequests = requests;
                    requests = {};
                    requestCount = 0;
                    for (var key in currentRequests) {
                        if (currentRequests.hasOwnProperty(key)) {
                            currentRequests[key](time);
                            lastActive = time;
                        }
                    }
                    if (time - lastActive > 2500) {
                        clearInterval(intervalHandle);
                        intervalHandle = null;
                    }
                }, 1000 / TARGET_FPS);
            }
            return callbackHandle;
        };
    })(), stop:function (id) {
        var cleared = running[id] != null;
        if (cleared) {
            running[id] = null;
        }
        return cleared;
    }, isRunning:function (id) {
        return running[id] != null;
    }, start:function (stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
        var start = time();
        var lastFrame = start;
        var percent = 0;
        var dropCounter = 0;
        var id = counter++;
        if (!root) {
            root = document.body;
        }
        if (id % 20 === 0) {
            var newRunning = {};
            for (var usedId in running) {
                newRunning[usedId] = true;
            }
            running = newRunning;
        }
        var step = function (virtual) {
            var render = virtual !== true;
            var now = time();
            if (!running[id] || (verifyCallback && !verifyCallback(id))) {
                running[id] = null;
                completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);
                return;
            }
            if (render) {
                var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
                for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
                    step(true);
                    dropCounter++;
                }
            }
            if (duration) {
                percent = (now - start) / duration;
                if (percent > 1) {
                    percent = 1;
                }
            }
            var value = easingMethod ? easingMethod(percent) : percent;
            if ((stepCallback(value, now, render) === false || percent === 1) && render) {
                running[id] = null;
                completedCallback && completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration == null);
            } else {
                if (render) {
                    lastFrame = now;
                    core.effect.Animate.requestAnimationFrame(step, root);
                }
            }
        };
        running[id] = true;
        core.effect.Animate.requestAnimationFrame(step, root);
        return id;
    }};
})(this);
var Scroller;
(function () {
    var NOOP = function () {
    };
    Scroller = function (callback, options) {
        this.__callback = callback;
        this.options = {scrollingX:true, scrollingY:true, animating:true, animationDuration:250, bouncing:true, locking:true, paging:false, snapping:false, zooming:false, minZoom:0.5, maxZoom:3, speedMultiplier:2, scrollingComplete:NOOP, penetrationDeceleration:0.03, penetrationAcceleration:0.08};
        for (var key in options) {
            this.options[key] = options[key];
        }
    };
    var easeOutCubic = function (pos) {
        return (Math.pow((pos - 1), 3) + 1);
    };
    var easeInOutCubic = function (pos) {
        if ((pos /= 0.5) < 1) {
            return 0.5 * Math.pow(pos, 3);
        }
        return 0.5 * (Math.pow((pos - 2), 3) + 2);
    };
    var members = {__isSingleTouch:false, __isTracking:false, __didDecelerationComplete:false, __isGesturing:false, __isDragging:false, __isDecelerating:false, __isAnimating:false, __clientLeft:0, __clientTop:0, __clientWidth:0, __clientHeight:0, __contentWidth:0, __contentHeight:0, __snapWidth:100, __snapHeight:100, __refreshHeight:null, __refreshActive:false, __refreshActivate:null, __refreshDeactivate:null, __refreshStart:null, __zoomLevel:1, __scrollLeft:0, __scrollTop:0, __maxScrollLeft:0, __maxScrollTop:0, __scheduledLeft:0, __scheduledTop:0, __scheduledZoom:0, __lastTouchLeft:null, __lastTouchTop:null, __lastTouchMove:null, __positions:null, __minDecelerationScrollLeft:null, __minDecelerationScrollTop:null, __maxDecelerationScrollLeft:null, __maxDecelerationScrollTop:null, __decelerationVelocityX:null, __decelerationVelocityY:null, setDimensions:function (clientWidth, clientHeight, contentWidth, contentHeight) {
        var self = this;
        if (clientWidth === +clientWidth) {
            self.__clientWidth = clientWidth;
        }
        if (clientHeight === +clientHeight) {
            self.__clientHeight = clientHeight;
        }
        if (contentWidth === +contentWidth) {
            self.__contentWidth = contentWidth;
        }
        if (contentHeight === +contentHeight) {
            self.__contentHeight = contentHeight;
        }
        self.__computeScrollMax();
        self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
    }, setPosition:function (left, top) {
        var self = this;
        self.__clientLeft = left || 0;
        self.__clientTop = top || 0;
    }, setSnapSize:function (width, height) {
        var self = this;
        self.__snapWidth = width;
        self.__snapHeight = height;
    }, activatePullToRefresh:function (height, activateCallback, deactivateCallback, startCallback) {
        var self = this;
        self.__refreshHeight = height;
        self.__refreshActivate = activateCallback;
        self.__refreshDeactivate = deactivateCallback;
        self.__refreshStart = startCallback;
    }, triggerPullToRefresh:function () {
        this.__publish(this.__scrollLeft, -this.__refreshHeight, this.__zoomLevel, true);
        if (this.__refreshStart) {
            this.__refreshStart();
        }
    }, finishPullToRefresh:function () {
        var self = this;
        self.__refreshActive = false;
        if (self.__refreshDeactivate) {
            self.__refreshDeactivate();
        }
        self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
    }, getValues:function () {
        var self = this;
        return {left:self.__scrollLeft, top:self.__scrollTop, zoom:self.__zoomLevel};
    }, getScrollMax:function () {
        var self = this;
        return {left:self.__maxScrollLeft, top:self.__maxScrollTop};
    }, zoomTo:function (level, animate, originLeft, originTop, callback) {
        var self = this;
        if (!self.options.zooming) {
            throw new Error("Zooming is not enabled!");
        }
        if (callback) {
            self.__zoomComplete = callback;
        }
        if (self.__isDecelerating) {
            core.effect.Animate.stop(self.__isDecelerating);
            self.__isDecelerating = false;
        }
        var oldLevel = self.__zoomLevel;
        if (originLeft == null) {
            originLeft = self.__clientWidth / 2;
        }
        if (originTop == null) {
            originTop = self.__clientHeight / 2;
        }
        level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);
        self.__computeScrollMax(level);
        var left = ((originLeft + self.__scrollLeft) * level / oldLevel) - originLeft;
        var top = ((originTop + self.__scrollTop) * level / oldLevel) - originTop;
        if (left > self.__maxScrollLeft) {
            left = self.__maxScrollLeft;
        } else {
            if (left < 0) {
                left = 0;
            }
        }
        if (top > self.__maxScrollTop) {
            top = self.__maxScrollTop;
        } else {
            if (top < 0) {
                top = 0;
            }
        }
        self.__publish(left, top, level, animate);
    }, zoomBy:function (factor, animate, originLeft, originTop, callback) {
        var self = this;
        self.zoomTo(self.__zoomLevel * factor, animate, originLeft, originTop, callback);
    }, scrollTo:function (left, top, animate, zoom) {
        var self = this;
        if (self.__isDecelerating) {
            core.effect.Animate.stop(self.__isDecelerating);
            self.__isDecelerating = false;
        }
        if (zoom != null && zoom !== self.__zoomLevel) {
            if (!self.options.zooming) {
                throw new Error("Zooming is not enabled!");
            }
            left *= zoom;
            top *= zoom;
            self.__computeScrollMax(zoom);
        } else {
            zoom = self.__zoomLevel;
        }
        if (!self.options.scrollingX) {
            left = self.__scrollLeft;
        } else {
            if (self.options.paging) {
                left = Math.round(left / self.__clientWidth) * self.__clientWidth;
            } else {
                if (self.options.snapping) {
                    left = Math.round(left / self.__snapWidth) * self.__snapWidth;
                }
            }
        }
        if (!self.options.scrollingY) {
            top = self.__scrollTop;
        } else {
            if (self.options.paging) {
                top = Math.round(top / self.__clientHeight) * self.__clientHeight;
            } else {
                if (self.options.snapping) {
                    top = Math.round(top / self.__snapHeight) * self.__snapHeight;
                }
            }
        }
        left = Math.max(Math.min(self.__maxScrollLeft, left), 0);
        top = Math.max(Math.min(self.__maxScrollTop, top), 0);
        if (left === self.__scrollLeft && top === self.__scrollTop) {
            animate = false;
        }
        self.__publish(left, top, zoom, animate);
    }, scrollBy:function (left, top, animate) {
        var self = this;
        var startLeft = self.__isAnimating ? self.__scheduledLeft : self.__scrollLeft;
        var startTop = self.__isAnimating ? self.__scheduledTop : self.__scrollTop;
        self.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
    }, doMouseZoom:function (wheelDelta, timeStamp, pageX, pageY) {
        var self = this;
        var change = wheelDelta > 0 ? 0.97 : 1.03;
        return self.zoomTo(self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);
    }, doTouchStart:function (touches, timeStamp) {
        if (touches.length == null) {
            throw new Error("Invalid touch list: " + touches);
        }
        if (timeStamp instanceof Date) {
            timeStamp = timeStamp.valueOf();
        }
        if (typeof timeStamp !== "number") {
            throw new Error("Invalid timestamp value: " + timeStamp);
        }
        var self = this;
        self.__interruptedAnimation = true;
        if (self.__isDecelerating) {
            core.effect.Animate.stop(self.__isDecelerating);
            self.__isDecelerating = false;
            self.__interruptedAnimation = true;
        }
        if (self.__isAnimating) {
            core.effect.Animate.stop(self.__isAnimating);
            self.__isAnimating = false;
            self.__interruptedAnimation = true;
        }
        var currentTouchLeft, currentTouchTop;
        var isSingleTouch = touches.length === 1;
        if (isSingleTouch) {
            currentTouchLeft = touches[0].pageX;
            currentTouchTop = touches[0].pageY;
        } else {
            currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
            currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
        }
        self.__initialTouchLeft = currentTouchLeft;
        self.__initialTouchTop = currentTouchTop;
        self.__zoomLevelStart = self.__zoomLevel;
        self.__lastTouchLeft = currentTouchLeft;
        self.__lastTouchTop = currentTouchTop;
        self.__lastTouchMove = timeStamp;
        self.__lastScale = 1;
        self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
        self.__enableScrollY = !isSingleTouch && self.options.scrollingY;
        self.__isTracking = true;
        self.__didDecelerationComplete = false;
        self.__isDragging = !isSingleTouch;
        self.__isSingleTouch = isSingleTouch;
        self.__positions = [];
    }, doTouchMove:function (touches, timeStamp, scale) {
        if (touches.length == null) {
            throw new Error("Invalid touch list: " + touches);
        }
        if (timeStamp instanceof Date) {
            timeStamp = timeStamp.valueOf();
        }
        if (typeof timeStamp !== "number") {
            throw new Error("Invalid timestamp value: " + timeStamp);
        }
        var self = this;
        if (!self.__isTracking) {
            return;
        }
        var currentTouchLeft, currentTouchTop;
        if (touches.length === 2) {
            currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
            currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
        } else {
            currentTouchLeft = touches[0].pageX;
            currentTouchTop = touches[0].pageY;
        }
        var positions = self.__positions;
        if (self.__isDragging) {
            var moveX = currentTouchLeft - self.__lastTouchLeft;
            var moveY = currentTouchTop - self.__lastTouchTop;
            var scrollLeft = self.__scrollLeft;
            var scrollTop = self.__scrollTop;
            var level = self.__zoomLevel;
            if (scale != null && self.options.zooming) {
                var oldLevel = level;
                level = level / self.__lastScale * scale;
                level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);
                if (oldLevel !== level) {
                    var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
                    var currentTouchTopRel = currentTouchTop - self.__clientTop;
                    scrollLeft = ((currentTouchLeftRel + scrollLeft) * level / oldLevel) - currentTouchLeftRel;
                    scrollTop = ((currentTouchTopRel + scrollTop) * level / oldLevel) - currentTouchTopRel;
                    self.__computeScrollMax(level);
                }
            }
            if (self.__enableScrollX) {
                scrollLeft -= moveX * this.options.speedMultiplier;
                var maxScrollLeft = self.__maxScrollLeft;
                if (scrollLeft > maxScrollLeft || scrollLeft < 0) {
                    if (self.options.bouncing) {
                        scrollLeft += (moveX / 2 * this.options.speedMultiplier);
                        if (scrollLeft < -1 * self.__clientWidth / 2) {
                            scrollLeft = -1 * self.__clientWidth / 2;
                        } else {
                            if (scrollLeft > maxScrollLeft + self.__clientWidth / 2) {
                                scrollLeft = maxScrollLeft + self.__clientWidth / 2;
                            }
                        }
                    } else {
                        if (scrollLeft > maxScrollLeft) {
                            scrollLeft = maxScrollLeft;
                        } else {
                            scrollLeft = 0;
                        }
                    }
                }
            }
            if (self.__enableScrollY) {
                scrollTop -= moveY * this.options.speedMultiplier;
                var maxScrollTop = self.__maxScrollTop;
                if (scrollTop > maxScrollTop || scrollTop < 0) {
                    if (self.options.bouncing) {
                        scrollTop += (moveY / 2 * this.options.speedMultiplier);
                        if (scrollTop < -1 * self.__clientHeight / 2) {
                            scrollTop = -1 * self.__clientHeight / 2;
                        } else {
                            if (scrollTop > maxScrollTop + self.__clientHeight / 2) {
                                scrollTop = maxScrollTop + self.__clientHeight / 2;
                            }
                        }
                        if (!self.__enableScrollX && self.__refreshHeight != null) {
                            if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {
                                self.__refreshActive = true;
                                if (self.__refreshActivate) {
                                    self.__refreshActivate();
                                }
                            } else {
                                if (self.__refreshActive && scrollTop > -self.__refreshHeight) {
                                    self.__refreshActive = false;
                                    if (self.__refreshDeactivate) {
                                        self.__refreshDeactivate();
                                    }
                                }
                            }
                        }
                    } else {
                        if (scrollTop > maxScrollTop) {
                            scrollTop = maxScrollTop;
                        } else {
                            scrollTop = 0;
                        }
                    }
                }
            }
            if (positions.length > 60) {
                positions.splice(0, 30);
            }
            positions.push(scrollLeft, scrollTop, timeStamp);
            self.__publish(scrollLeft, scrollTop, level);
        } else {
            var minimumTrackingForScroll = self.options.locking ? 3 : 0;
            var minimumTrackingForDrag = 5;
            var distanceX = Math.abs(currentTouchLeft - self.__initialTouchLeft);
            var distanceY = Math.abs(currentTouchTop - self.__initialTouchTop);
            self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
            self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;
            positions.push(self.__scrollLeft, self.__scrollTop, timeStamp);
            self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
            if (self.__isDragging) {
                self.__interruptedAnimation = false;
            }
        }
        self.__lastTouchLeft = currentTouchLeft;
        self.__lastTouchTop = currentTouchTop;
        self.__lastTouchMove = timeStamp;
        self.__lastScale = scale;
    }, doTouchEnd:function (timeStamp) {
        if (timeStamp instanceof Date) {
            timeStamp = timeStamp.valueOf();
        }
        if (typeof timeStamp !== "number") {
            throw new Error("Invalid timestamp value: " + timeStamp);
        }
        var self = this;
        if (!self.__isTracking) {
            return;
        }
        self.__isTracking = false;
        if (self.__isDragging) {
            self.__isDragging = false;
            if (self.__isSingleTouch && self.options.animating && (timeStamp - self.__lastTouchMove) <= 100) {
                var positions = self.__positions;
                var endPos = positions.length - 1;
                var startPos = endPos;
                for (var i = endPos; i > 0 && positions[i] > (self.__lastTouchMove - 100); i -= 3) {
                    startPos = i;
                }
                if (startPos !== endPos) {
                    var timeOffset = positions[endPos] - positions[startPos];
                    var movedLeft = self.__scrollLeft - positions[startPos - 2];
                    var movedTop = self.__scrollTop - positions[startPos - 1];
                    self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
                    self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);
                    var minVelocityToStartDeceleration = self.options.paging || self.options.snapping ? 4 : 1;
                    if (Math.abs(self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs(self.__decelerationVelocityY) > minVelocityToStartDeceleration) {
                        if (!self.__refreshActive) {
                            self.__startDeceleration(timeStamp);
                        }
                    }
                } else {
                    self.options.scrollingComplete();
                }
            } else {
                if ((timeStamp - self.__lastTouchMove) > 100) {
                    self.options.scrollingComplete();
                }
            }
        }
        if (!self.__isDecelerating) {
            if (self.__refreshActive && self.__refreshStart) {
                self.__publish(self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);
                if (self.__refreshStart) {
                    self.__refreshStart();
                }
            } else {
                if (self.__interruptedAnimation || self.__isDragging) {
                    self.options.scrollingComplete();
                }
                self.scrollTo(self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel);
                if (self.__refreshActive) {
                    self.__refreshActive = false;
                    if (self.__refreshDeactivate) {
                        self.__refreshDeactivate();
                    }
                }
            }
        }
        self.__positions.length = 0;
    }, __publish:function (left, top, zoom, animate) {
        var self = this;
        var wasAnimating = self.__isAnimating;
        if (wasAnimating) {
            core.effect.Animate.stop(wasAnimating);
            self.__isAnimating = false;
        }
        if (animate && self.options.animating) {
            self.__scheduledLeft = left;
            self.__scheduledTop = top;
            self.__scheduledZoom = zoom;
            var oldLeft = self.__scrollLeft;
            var oldTop = self.__scrollTop;
            var oldZoom = self.__zoomLevel;
            var diffLeft = left - oldLeft;
            var diffTop = top - oldTop;
            var diffZoom = zoom - oldZoom;
            var step = function (percent, now, render) {
                if (render) {
                    self.__scrollLeft = oldLeft + (diffLeft * percent);
                    self.__scrollTop = oldTop + (diffTop * percent);
                    self.__zoomLevel = oldZoom + (diffZoom * percent);
                    if (self.__callback) {
                        self.__callback(self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
                    }
                }
            };
            var verify = function (id) {
                return self.__isAnimating === id;
            };
            var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
                if (animationId === self.__isAnimating) {
                    self.__isAnimating = false;
                }
                if (self.__didDecelerationComplete || wasFinished) {
                    self.options.scrollingComplete();
                }
                if (self.options.zooming) {
                    self.__computeScrollMax();
                    if (self.__zoomComplete) {
                        self.__zoomComplete();
                        self.__zoomComplete = null;
                    }
                }
            };
            self.__isAnimating = core.effect.Animate.start(step, verify, completed, self.options.animationDuration, wasAnimating ? easeOutCubic : easeInOutCubic);
        } else {
            self.__scheduledLeft = self.__scrollLeft = left;
            self.__scheduledTop = self.__scrollTop = top;
            self.__scheduledZoom = self.__zoomLevel = zoom;
            if (self.__callback) {
                self.__callback(left, top, zoom);
            }
            if (self.options.zooming) {
                self.__computeScrollMax();
                if (self.__zoomComplete) {
                    self.__zoomComplete();
                    self.__zoomComplete = null;
                }
            }
        }
    }, __computeScrollMax:function (zoomLevel) {
        var self = this;
        if (zoomLevel == null) {
            zoomLevel = self.__zoomLevel;
        }
        self.__maxScrollLeft = Math.max((self.__contentWidth * zoomLevel) - self.__clientWidth, 0);
        self.__maxScrollTop = Math.max((self.__contentHeight * zoomLevel) - self.__clientHeight, 0);
    }, __startDeceleration:function (timeStamp) {
        var self = this;
        if (self.options.paging) {
            var scrollLeft = Math.max(Math.min(self.__scrollLeft, self.__maxScrollLeft), 0);
            var scrollTop = Math.max(Math.min(self.__scrollTop, self.__maxScrollTop), 0);
            var clientWidth = self.__clientWidth;
            var clientHeight = self.__clientHeight;
            self.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
            self.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
            self.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
            self.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;
        } else {
            self.__minDecelerationScrollLeft = 0;
            self.__minDecelerationScrollTop = 0;
            self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
            self.__maxDecelerationScrollTop = self.__maxScrollTop;
        }
        var step = function (percent, now, render) {
            self.__stepThroughDeceleration(render);
        };
        var minVelocityToKeepDecelerating = self.options.snapping ? 4 : 0.1;
        var verify = function () {
            var shouldContinue = Math.abs(self.__decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
            if (!shouldContinue) {
                self.__didDecelerationComplete = true;
            }
            return shouldContinue;
        };
        var completed = function (renderedFramesPerSecond, animationId, wasFinished) {
            self.__isDecelerating = false;
            if (self.__didDecelerationComplete) {
                self.options.scrollingComplete();
            }
            self.scrollTo(self.__scrollLeft, self.__scrollTop, self.options.snapping);
        };
        self.__isDecelerating = core.effect.Animate.start(step, verify, completed);
    }, __stepThroughDeceleration:function (render) {
        var self = this;
        var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
        var scrollTop = self.__scrollTop + self.__decelerationVelocityY;
        if (!self.options.bouncing) {
            var scrollLeftFixed = Math.max(Math.min(self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft);
            if (scrollLeftFixed !== scrollLeft) {
                scrollLeft = scrollLeftFixed;
                self.__decelerationVelocityX = 0;
            }
            var scrollTopFixed = Math.max(Math.min(self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop);
            if (scrollTopFixed !== scrollTop) {
                scrollTop = scrollTopFixed;
                self.__decelerationVelocityY = 0;
            }
        } else {
            var maxScrollLeft = self.__maxScrollLeft, maxScrollTop = self.__maxScrollTop;
            if (scrollLeft < -1 * self.__clientWidth / 2) {
                scrollLeft = -1 * self.__clientWidth / 2;
            } else {
                if (scrollLeft > maxScrollLeft + self.__clientWidth / 2) {
                    scrollLeft = maxScrollLeft + self.__clientWidth / 2;
                }
            }
            if (scrollTop < -1 * self.__clientHeight / 2) {
                scrollTop = -1 * self.__clientHeight / 2;
            } else {
                if (scrollTop > maxScrollTop + self.__clientHeight / 2) {
                    scrollTop = maxScrollTop + self.__clientHeight / 2;
                }
            }
        }
        if (render) {
            self.__publish(scrollLeft, scrollTop, self.__zoomLevel);
        } else {
            self.__scrollLeft = scrollLeft;
            self.__scrollTop = scrollTop;
        }
        if (!self.options.paging) {
            var frictionFactor = 0.95;
            self.__decelerationVelocityX *= frictionFactor;
            self.__decelerationVelocityY *= frictionFactor;
        }
        if (self.options.bouncing) {
            var scrollOutsideX = 0;
            var scrollOutsideY = 0;
            var penetrationDeceleration = self.options.penetrationDeceleration;
            var penetrationAcceleration = self.options.penetrationAcceleration;
            if (scrollLeft < self.__minDecelerationScrollLeft) {
                scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
            } else {
                if (scrollLeft > self.__maxDecelerationScrollLeft) {
                    scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
                }
            }
            if (scrollTop < self.__minDecelerationScrollTop) {
                scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
            } else {
                if (scrollTop > self.__maxDecelerationScrollTop) {
                    scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
                }
            }
            if (scrollOutsideX !== 0) {
                if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
                    self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
                } else {
                    self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
                }
            }
            if (scrollOutsideY !== 0) {
                if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
                    self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
                } else {
                    self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
                }
            }
        }
    }};
    for (var key in members) {
        Scroller.prototype[key] = members[key];
    }
})();
(function () {
    $.fn.addClassOnActive = function (cls, clsOwner, fn) {
        if (!dorado.Browser.isTouch) {
            return this.addClassOnClick(cls, clsOwner, fn);
        }
        var clsOwner = clsOwner || this;
        this.bind("mousedown", function () {
            if (typeof fn == "function" && !fn.call(this)) {
                return;
            }
            clsOwner.addClass(cls);
        }).bind("mouseup", function () {
            clsOwner.removeClass(cls);
        }).bind("touchcancel", function () {
            clsOwner.removeClass(cls);
        });
        return this;
    };
    var docStyle = document.documentElement.style, engine, translate3d = false;
    if (window.opera && Object.prototype.toString.call(opera) === "[object Opera]") {
        engine = "presto";
    } else {
        if ("MozAppearance" in docStyle) {
            engine = "gecko";
        } else {
            if ("WebkitAppearance" in docStyle) {
                engine = "webkit";
            } else {
                if (typeof navigator.cpuClass === "string") {
                    engine = "trident";
                }
            }
        }
    }
    var cssPrefix = {trident:"-ms-", gecko:"-moz-", webkit:"-webkit-", presto:"-o-"}[engine];
    var vendorPrefix = {trident:"ms", gecko:"Moz", webkit:"Webkit", presto:"O"}[engine], helperElem = document.createElement("div"), perspectiveProperty = vendorPrefix + "Perspective", transformProperty = vendorPrefix + "Transform", transformStyleName = cssPrefix + "transform", transitionProperty = vendorPrefix + "Transition", transitionStyleName = cssPrefix + "transition", transitionEndProperty = vendorPrefix.toLowerCase() + "TransitionEnd";
    if (helperElem.style[perspectiveProperty] !== undefined) {
        translate3d = true;
    }
    var getRect = function (el) {
        var offset = jQuery(el).offset();
        return {width:el.offsetWidth, height:el.offsetHeight, left:offset.left, top:offset.top};
    };
    function getTranslate(element) {
        var result = {left:0, top:0};
        if (element == null || element.style == null) {
            return result;
        }
        var transform = element.style[transformProperty], matches = /translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g.exec(transform);
        if (matches) {
            result.left = +matches[1];
            result.top = +matches[3];
        }
        return result;
    }
    function translateElement(element, x, y) {
        if (x == null && y == null) {
            return;
        }
        if (element == null || element.style == null) {
            return;
        }
        if (!element.style[transformProperty] && x == 0 && y == 0) {
            return;
        }
        if (x == null || y == null) {
            var translate = getTranslate(element);
            if (x == null) {
                x = translate.left;
            }
            if (y == null) {
                y = translate.top;
            }
        }
        cancelTranslateElement(element);
        if (translate3d) {
            element.style[transformProperty] += " translate(" + (x ? (x + "px") : "0px") + "," + (y ? (y + "px") : "0px") + ") translateZ(0px)";
        } else {
            element.style[transformProperty] += " translate(" + (x ? (x + "px") : "0px") + "," + (y ? (y + "px") : "0px") + ")";
        }
    }
    function cancelTranslateElement(element) {
        if (element == null || element.style == null) {
            return;
        }
        var transformValue = element.style[transformProperty];
        if (transformValue) {
            transformValue = transformValue.replace(/translate\(\s*(-?\d+(\.?\d+?)?)px,\s*(-?\d+(\.\d+)?)px\)\s*translateZ\(0px\)/g, "");
            element.style[transformProperty] = transformValue;
        }
    }
    var getAnimConfig = function (type, direction, rect) {
        if (type == "out") {
            switch (direction) {
              case "t2b":
                return {top:[0, rect.height]};
              case "r2l":
                return {left:[0, -1 * rect.width]};
              case "b2t":
                return {top:[0, -1 * rect.height]};
              case "l2r":
                return {left:[0, rect.width]};
            }
        } else {
            switch (direction) {
              case "t2b":
                return {top:[-1 * rect.height, 0]};
              case "l2r":
                return {left:[-1 * rect.width, 0]};
              case "b2t":
                return {top:[rect.height, 0]};
              case "r2l":
                return {left:[rect.width, 0]};
            }
        }
    };
    var isFunction = function (value) {
        return ({}).toString.call(value) == "[object Function]";
    };
    jQuery.fn.anim = function (properties, duration, ease, callback) {
        var transforms = [], opacity, key, callbackCalled = false;
        for (key in properties) {
            if (key === "opacity") {
                opacity = properties[key];
            } else {
                transforms.push(key + "(" + properties[key] + ")");
            }
        }
        var invokeCallback = function () {
            if (!callbackCalled) {
                callback();
                callbackCalled = true;
            }
        };
        if (parseFloat(duration) !== 0 && isFunction(callback)) {
            this.one(transitionEndProperty, invokeCallback);
            setTimeout(invokeCallback, duration * 1000 + 50);
        } else {
            setTimeout(callback, 0);
        }
        return this.css({opacity:opacity}).css(transitionStyleName, "all " + (duration !== undefined ? duration : 0.5) + "s " + (ease || "")).css(transformStyleName, transforms.join(" "));
    };
    dorado.Fx = {transformProperty:transformProperty, transformStyleName:transformStyleName, transitionProperty:transitionProperty, transitionStyleName:transitionStyleName, getElementTranslate:getTranslate, translateElement:translateElement, cancelTranslateElement:cancelTranslateElement, show:function (type, el, options) {
        if (dorado.Fx[type + "In"]) {
            dorado.Fx[type + "In"](el, options);
        }
    }, hide:function (type, el, options) {
        if (dorado.Fx[type + "Out"]) {
            dorado.Fx[type + "Out"](el, options);
        }
    }, slide:function (type, el, options) {
        if (!el) {
            return;
        }
        options = options || {};
        var callback = function () {
            if (options.complete) {
                options.complete.apply(null, []);
            }
            $fly(el).css({"-webkit-transition":"none", "-webkit-transform":"", "moz-transform":""});
        }, direction = options.direction || "r2l";
        var rect = getRect(el), animConfig = getAnimConfig(type, direction, rect);
        if (animConfig) {
            for (var prop in animConfig) {
                var range = animConfig[prop];
                if (prop == "left") {
                    translateElement(el, range[0], null);
                } else {
                    translateElement(el, null, range[0]);
                }
                animConfig[prop] = range[1];
            }
            if ($fly(el).css("position") == "static") {
                $fly(el).css("position", "relative");
            }
            jQuery(el).bringToFront().anim({}, 0.3, "ease-out", callback);
            setTimeout(function () {
                for (var prop in animConfig) {
                    var value = animConfig[prop];
                    if (prop == "left") {
                        translateElement(el, value, null);
                    } else {
                        translateElement(el, null, value);
                    }
                }
            }, 50);
        }
    }, flip:function (type, el, options) {
        if (!el) {
            return;
        }
        options = options || {};
        var callback = function () {
            if (options.complete) {
                options.complete.apply(null, []);
            }
            $(el).css({"-webkit-transition":"none"});
        };
        $(el).parent().css({"-webkit-perspective":"1200", "-webkit-transform-style":"preserve-3d"});
        var direction = options.direction, rotateProp = "Y", fromScale = 1, toScale = 1, fromRotate = 0, toRotate = 0;
        if (type == "out") {
            toScale = 0.8;
        } else {
            fromScale = 0.8;
        }
        if (direction == "up" || direction == "down") {
            rotateProp = "X";
        }
        switch (direction) {
          case "up":
            if (type == "out") {
                toRotate = 180;
            } else {
                fromRotate = -180;
            }
            break;
          case "down":
            if (type == "out") {
                toRotate = -180;
            } else {
                fromRotate = 180;
            }
            break;
          case "left":
            if (type == "out") {
                toRotate = -180;
            } else {
                fromRotate = 180;
            }
            break;
          case "right":
            if (type == "out") {
                toRotate = 180;
            } else {
                fromRotate = -180;
            }
            break;
        }
        $(el).css({"-webkit-transform":"rotate" + rotateProp + "(" + fromRotate + "deg) scale(" + fromScale + ")", "-webkit-backface-visibility":"hidden"});
        setTimeout(function () {
            $(el).anim({}, 0.3, "ease-out", callback).css({"-webkit-transform":"rotate" + rotateProp + "(" + toRotate + "deg) scale(" + toScale + ")", "-webkit-backface-visibility":"hidden"});
        }, 5);
    }, fade:function (type, el, options) {
        if (!el) {
            return;
        }
        options = options || {};
        var callback = function () {
            if (options.complete) {
                options.complete.apply(null, []);
            }
            $(el).css({"-webkit-transition":"none"});
        };
        var fromOpacity = 1, toOpacity = 1;
        if (type == "out") {
            toOpacity = 0.01;
        } else {
            fromOpacity = 0.01;
        }
        $(el).css({"opacity":fromOpacity});
        setTimeout(function () {
            jQuery(el).anim({}, 0.3, "ease-out", callback).css({opacity:toOpacity});
        }, 5);
    }, slideIn:function (el, options) {
        dorado.Fx.slide("in", el, options);
    }, slideOut:function (el, options) {
        dorado.Fx.slide("out", el, options);
    }, fadeIn:function (el, options) {
        dorado.Fx.fade("in", el, options);
    }, fadeOut:function (el, options) {
        dorado.Fx.fade("out", el, options);
    }, flipIn:function (el, options) {
        dorado.Fx.flip("in", el, options);
    }, flipOut:function (el, options) {
        dorado.Fx.flip("out", el, options);
    }, zoomIn:function (el, options) {
        jQuery(el).modernZoomIn(options);
    }, zoomOut:function (el, options) {
        jQuery(el).modernZoomOut(options);
    }};
    var slideShow = function (options, safe) {
        var control = this, align = options.align, vAlign = options.vAlign, direction = options.direction, dom = control._dom;
        $fly(dom).css("visibility", "");
        if (!direction && (vAlign && align)) {
            if (vAlign.indexOf("inner") != -1) {
                direction = align.indexOf("right") != -1 ? "l2r" : "r2l";
            } else {
                direction = vAlign.indexOf("bottom") != -1 ? "t2b" : "b2t";
            }
        }
        direction = direction || "t2b";
        control._slideInDir = direction;
        var position = options.position || {};
        jQuery(dom).css(position).bringToFront();
        dorado.Fx.slideIn(dom, {duration:20000 || options.animateDuration || 200, easing:options.animateEasing, direction:direction, complete:function () {
            control.doAfterShow.apply(control, [options]);
            dom.style.display = "";
        }});
    };
    var slideHide = function (options, safe) {
        var control = this, dom = control._dom, direction = control._slideInDir;
        $fly(dom).css("visibility", "");
        switch (direction) {
          case "l2r":
            direction = "r2l";
            break;
          case "r2l":
            direction = "l2r";
            break;
          case "b2t":
            direction = "t2b";
            break;
          case "t2b":
            direction = "b2t";
            break;
        }
        control._slideInDir = null;
        jQuery(dom).bringToFront();
        dorado.Fx.slideOut(dom, {direction:direction, duration:options.animateDuration || 200, easing:options.animateEasing, complete:function () {
            control.doAfterHide.apply(control, arguments);
        }});
    };
    dorado.beforeInit(function () {
        dorado.widget.FloatControl.behaviors["modernSlide"] = {show:function (options) {
            slideShow.apply(this, [options]);
        }, hide:function (options) {
            slideHide.apply(this, [options]);
        }};
        dorado.widget.FloatControl.behaviors.fade = {show:function (options) {
            var control = this;
            control.doAfterShow.apply(control, [options]);
        }, hide:function (options) {
            var control = this;
            control.doAfterHide.apply(control, arguments);
        }};
    });
})();
(function () {
    var directionMap = {horizontal:{x:true, y:false}, vertical:{x:false, y:true}, both:{x:true, y:true}, none:{x:false, y:false}};
    var id_seed = 1;
    var TouchScroller = dorado.util.Dom.TouchScroller = function (container, options) {
        options = options || {};
        var self = this;
        self.container = container;
        self.id = "d_scroller_" + id_seed++;
        if ($fly(container).css("position") == "static") {
            $fly(container).css("position", "relative");
        }
        self.container.style.overflowX = "hidden";
        self.container.style.overflowY = "hidden";
        self.content = $fly(container).children(":first")[0];
        self.options = options;
        self.showHoriScrollbar = options.showHoriScrollbar != undefined ? options.showHoriScrollbar : true;
        self.showVertScrollbar = options.showVertScrollbar != undefined ? options.showVertScrollbar : true;
        self.horiScrollEnable = true;
        self.vertScrollEnable = true;
        self.updateBeforeScroll = options.updateBeforeScroll;
        if (options.scrollSize) {
            self.scrollSize = options.scrollSize;
        }
        self.direction = options.direction ? options.direction : "auto";
        self.horibar = {};
        self.vertbar = {};
        self.fadeScrollbar = true;
        if (options.render) {
            self.render = options.render;
        }
        self.snapWidth = options.snapWidth;
        self.snapHeight = options.snapHeight;
        self.defaultScrollTop = options.defaultScrollTop;
        self.defaultScrollLeft = options.defaultScrollLeft;
        self.autoHide = options.autoHide != undefined ? options.autoHide : true;
        options.scrollingX = true;
        options.scrollingY = true;
        options.penetrationAcceleration = 0.2;
        options.scrollingComplete = function () {
            var scroller = self.scroller;
            $fly(self.container).trigger("modernScrolled", {scrollLeft:scroller.__scrollLeft, scrollTop:scroller.__scrollTop, scrollWidth:scroller.__contentWidth, scrollHeight:scroller.__contentHeight, clientWidth:scroller.__clientWidth, clientHeight:scroller.__clientHeight});
            if (!self.autoHide) {
                return;
            }
            if (self._hideScrollbarTimer) {
                clearTimeout(self._hideScrollbarTimer);
            }
            self._hideScrollbarTimer = setTimeout(function () {
                self.hideScrollbar();
                self._hideScrollbarTimer = null;
            }, 500);
        };
        self.scroller = new Scroller(function (left, top, zoom) {
            self.render(left, top, zoom);
            self.updateScrollbar();
            var scroller = self.scroller;
            $fly(self.container).trigger("modernScrolling", {scrollLeft:left, scrollTop:top, scrollWidth:scroller.__contentWidth, scrollHeight:scroller.__contentHeight, clientWidth:scroller.__clientWidth, clientHeight:scroller.__clientHeight});
        }, options);
        self.bindEvents();
        if (self.content) {
            self._contentInited = true;
        }
        self.update();
    };
    var allVertScrollers = [], vertEnableMap = {}, vertInsideScroller = null, vertCurScroller = null, lastVertDirection = null, lastDeltaY = 0;
    var allHoriScrollers = [], horiEnableMap = {}, horiInsideScroller = null, horiCurScroller = null, lastHoriDirection = null, lastDeltaX = 0;
    var handleStart = function (event) {
        var self = this;
        if (event.target.tagName.match(/input|select/i)) {
            event.stopPropagation();
            return;
        }
        if (allVertScrollers.length == 0 && self.scroller.options.scrollingY) {
            allVertScrollers.push(self);
            vertEnableMap[self.id] = true;
            vertInsideScroller = self;
            self._curVertIndex = 0;
            vertCurScroller = self;
            jQuery(self.container).parents().filter(function () {
                var modernScroller = jQuery.data(this, "modernScroller");
                if (modernScroller) {
                    modernScroller._curVertIndex = allVertScrollers.length;
                    if (modernScroller.scroller.options.scrollingY) {
                        allVertScrollers.push(modernScroller);
                        vertEnableMap[modernScroller.id] = false;
                    }
                }
            });
        }
        if (allHoriScrollers.length == 0 && self.scroller.options.scrollingX) {
            allHoriScrollers.push(self);
            horiEnableMap[self.id] = true;
            horiInsideScroller = self;
            self._curHoriIndex = 0;
            horiCurScroller = self;
            jQuery(self.container).parents().filter(function () {
                var modernScroller = jQuery.data(this, "modernScroller");
                if (modernScroller) {
                    modernScroller._curHoriIndex = allHoriScrollers.length;
                    if (modernScroller.scroller.options.scrollingX) {
                        allHoriScrollers.push(modernScroller);
                        horiEnableMap[modernScroller.id] = false;
                    }
                }
            });
        }
        self.scroller.doTouchStart(event.gesture.touches, event.timeStamp);
        self._scrollStarted = true;
        if (self.updateBeforeScroll) {
            self.update();
        }
        event.preventDefault();
    };
    var changeCurVertScroller = function (scroller, event) {
        vertEnableMap[vertCurScroller.id] = false;
        vertCurScroller.hideScrollbar(false);
        vertCurScroller = scroller;
        if (horiEnableMap[vertCurScroller.id] !== true) {
            scroller.scroller.doTouchStart(event.gesture.touches, event.timeStamp);
        }
        vertEnableMap[vertCurScroller.id] = true;
    };
    var changeCurHoriScroller = function (scroller, event) {
        horiEnableMap[horiCurScroller.id] = false;
        horiCurScroller.hideScrollbar(false);
        horiCurScroller = scroller;
        if (vertEnableMap[horiCurScroller.id] !== true) {
            scroller.scroller.doTouchStart(event.gesture.touches, event.timeStamp);
        }
        horiEnableMap[horiCurScroller.id] = true;
    };
    function handleMultiHoriBars(self, event) {
        if (allHoriScrollers.length > 1 && horiInsideScroller == self) {
            var deltaX = event.gesture.deltaX, direction = deltaX > lastDeltaX ? "right" : "left", directionChange = false;
            if (lastHoriDirection != direction && deltaX != lastDeltaX) {
                directionChange = true;
            }
            lastDeltaX = deltaX;
            lastHoriDirection = direction;
            var scroller, allScrollers = allHoriScrollers, curScroller = horiCurScroller, insideScroller = horiInsideScroller;
            if (directionChange) {
                if (direction == "left") {
                    for (var i = 0, j = allScrollers.length; i < j; i++) {
                        scroller = allScrollers[i];
                        if (scroller.scroller.__scrollLeft < scroller.scroller.__maxScrollLeft) {
                            changeCurHoriScroller(scroller, event);
                            break;
                        }
                    }
                } else {
                    if (direction == "right") {
                        for (var i = 0, j = allScrollers.length; i < j; i++) {
                            scroller = allScrollers[i];
                            if (scroller.scroller.__scrollLeft > 0) {
                                changeCurHoriScroller(scroller, event);
                                break;
                            }
                        }
                    }
                }
            } else {
                var curChanged = false;
                if (direction == "left") {
                    if (curScroller.scroller.__scrollLeft > curScroller.scroller.__maxScrollLeft) {
                        for (var i = horiCurScroller._curHoriIndex + 1, j = allScrollers.length; i < j; i++) {
                            scroller = allScrollers[i];
                            if (scroller.scroller.__scrollLeft < scroller.scroller.__maxScrollLeft) {
                                changeCurHoriScroller(scroller, event);
                                curChanged = true;
                                break;
                            }
                        }
                        if (!curChanged && curScroller != insideScroller) {
                            changeCurHoriScroller(insideScroller, event);
                        }
                    }
                } else {
                    if (direction == "right") {
                        if (curScroller.scroller.__scrollLeft <= 0) {
                            for (var i = curScroller._curHoriIndex + 1, j = allScrollers.length; i < j; i++) {
                                scroller = allScrollers[i];
                                if (scroller.scroller.__scrollLeft > 0) {
                                    changeCurHoriScroller(scroller, event);
                                    curChanged = true;
                                    break;
                                }
                            }
                            if (!curChanged && curScroller != insideScroller) {
                                changeCurHoriScroller(insideScroller, event);
                            }
                        }
                    }
                }
            }
        }
    }
    function handleMultiVertBars(self, event) {
        if (allVertScrollers.length > 1 && vertInsideScroller == self) {
            var deltaY = event.gesture.deltaY, direction = deltaY > lastDeltaY ? "down" : "up", directionChange = false;
            if (lastVertDirection != direction && deltaY != lastDeltaY) {
                directionChange = true;
            }
            lastDeltaY = deltaY;
            lastVertDirection = direction;
            var scroller, allScrollers = allVertScrollers, curScroller = vertCurScroller, insideScroller = vertInsideScroller;
            if (directionChange) {
                if (direction == "up") {
                    for (var i = 0, j = allScrollers.length; i < j; i++) {
                        scroller = allScrollers[i];
                        if (scroller.scroller.__scrollTop < scroller.scroller.__maxScrollTop) {
                            changeCurVertScroller(scroller, event);
                            break;
                        }
                    }
                } else {
                    if (direction == "down") {
                        for (var i = 0, j = allScrollers.length; i < j; i++) {
                            scroller = allScrollers[i];
                            if (scroller.scroller.__scrollTop > 0) {
                                changeCurVertScroller(scroller, event);
                                break;
                            }
                        }
                    }
                }
            } else {
                var curChanged = false;
                if (direction == "up") {
                    if (vertCurScroller.scroller.__scrollTop > vertCurScroller.scroller.__maxScrollTop) {
                        for (var i = vertCurScroller._curVertIndex + 1, j = allScrollers.length; i < j; i++) {
                            scroller = allScrollers[i];
                            if (scroller.scroller.__scrollTop < scroller.scroller.__maxScrollTop) {
                                changeCurVertScroller(scroller, event);
                                curChanged = true;
                                break;
                            }
                        }
                        if (!curChanged && curScroller != insideScroller) {
                            changeCurVertScroller(insideScroller, event);
                        }
                    }
                } else {
                    if (direction == "down") {
                        if (vertCurScroller.scroller.__scrollTop <= 0) {
                            for (var i = curScroller._curVertIndex + 1, j = allScrollers.length; i < j; i++) {
                                scroller = allScrollers[i];
                                if (scroller.scroller.__scrollTop > 0) {
                                    changeCurVertScroller(scroller, event);
                                    curChanged = true;
                                    break;
                                }
                            }
                            if (!curChanged && curScroller != insideScroller) {
                                changeCurVertScroller(insideScroller, event);
                            }
                        }
                    }
                }
            }
        }
    }
    var handleMove = function (event) {
        var self = this;
        handleMultiVertBars(self, event);
        handleMultiHoriBars(self, event);
        if (vertEnableMap[self.id] || horiEnableMap[self.id]) {
            self.showScrollbar();
            self.scroller.doTouchMove(event.gesture.touches, event.timeStamp, event.gesture.scale);
        }
    };
    var handleEnd = function (event) {
        var self = this;
        self.scroller.doTouchEnd(event.timeStamp);
        self._curVertIndex = null;
        self._curHoriIndex = null;
        if (vertInsideScroller == self) {
            allVertScrollers = [];
            vertEnableMap = {};
            vertInsideScroller = null;
            vertCurScroller = null;
            lastVertDirection = null;
            lastDeltaY = 0;
        }
        if (horiInsideScroller == self) {
            allHoriScrollers = [];
            horiEnableMap = {};
            horiInsideScroller = null;
            horiCurScroller = null;
            lastHoriDirection = null;
            lastDeltaX = 0;
        }
    };
    var handleMouseWheel = function (event) {
        var self = this;
        self.showScrollbar();
        self.scroller.scrollBy(0, event.wheelDelta, true);
    };
    TouchScroller.prototype = {render:function (left, top, zoom) {
        if (this.content) {
            dorado.Fx.translateElement(this.content, -left, -top);
        }
    }, createXScrollbar:function () {
        if (this.scroller.options.scrollingX && this.showHoriScrollbar) {
            var scrollbar = document.createElement("div");
            scrollbar.className = "scroll-bar horizontal";
            var indicator = document.createElement("div");
            scrollbar.appendChild(indicator);
            this.container.appendChild(scrollbar);
            this.horibar.scrollbar = scrollbar;
            this.horibar.indicator = indicator;
        }
    }, createYScrollbar:function () {
        if (this.scroller.options.scrollingY && this.showVertScrollbar) {
            var scrollbar = document.createElement("div");
            scrollbar.className = "scroll-bar vertical";
            var indicator = document.createElement("div");
            scrollbar.appendChild(indicator);
            this.container.appendChild(scrollbar);
            this.vertbar.scrollbar = scrollbar;
            this.vertbar.indicator = indicator;
        }
    }, hideScrollbar:function (animate) {
        var self = this, vertScrollbar = self.vertbar.scrollbar, horiScrollbar = self.horibar.scrollbar;
        if (vertScrollbar) {
            if (animate === false) {
                vertScrollbar.style.display = "none";
            } else {
                jQuery(vertScrollbar).stop(true, true).fadeOut();
            }
        }
        if (horiScrollbar) {
            if (animate === false) {
                horiScrollbar.style.display = "none";
            } else {
                jQuery(horiScrollbar).stop(true, true).fadeOut();
            }
        }
    }, showScrollbar:function () {
        var self = this;
        var vertScrollbar = self.vertbar.scrollbar, horiScrollbar = self.horibar.scrollbar;
        if (vertScrollbar) {
            jQuery(vertScrollbar).stop(true, true);
            vertScrollbar.style.display = "";
        }
        if (horiScrollbar) {
            horiScrollbar.style.display = "";
        }
    }, updateScrollbar:function (force) {
        var self = this, scroller = self.scroller;
        if (!self.content) {
            return;
        }
        var scrollWidth = scroller.__contentWidth, scrollHeight = scroller.__contentHeight, scrolling = scroller.__isDragging || scroller.__isDecelerating || scroller.__isAnimating || scroller.__isTracking;
        if (!force && !scrolling) {
            return;
        }
        var vertScrollbar = self.vertbar.scrollbar, horiScrollbar = self.horibar.scrollbar;
        if (scroller.options.scrollingY && this.showVertScrollbar) {
            if (!vertScrollbar) {
                if (scrolling) {
                    this.createYScrollbar();
                } else {
                    return;
                }
            }
            var barConfig = self.vertbar, bar = barConfig.scrollbar, indicator = barConfig.indicator, barSize = bar.clientHeight, indicatorSize = Math.max(Math.round(barSize * barSize / scrollHeight), 8), maxScroll = barSize - indicatorSize, ratio = maxScroll / scroller.__maxScrollTop;
            indicator.style.height = indicatorSize + "px";
            indicator.style.webkitTransform = "translate3d(0, " + (ratio * scroller.__scrollTop) + "px,0)";
        } else {
            if (vertScrollbar) {
                vertScrollbar.style.display = "none";
            }
        }
        if (scroller.options.scrollingX && this.showHoriScrollbar) {
            if (!horiScrollbar) {
                if (scrolling) {
                    self.createXScrollbar();
                } else {
                    return;
                }
            }
            var barConfig = self.horibar, bar = barConfig.scrollbar, indicator = barConfig.indicator, barSize = bar.clientWidth, indicatorSize = Math.max(Math.round(barSize * barSize / scrollWidth), 8), maxScroll = barSize - indicatorSize, ratio = maxScroll / scroller.__maxScrollLeft;
            indicator.style.width = indicatorSize + "px";
            indicator.style.webkitTransform = "translate3d(" + (ratio * scroller.__scrollLeft) + "px,0, 0)";
        } else {
            if (horiScrollbar) {
                horiScrollbar.style.display = "none";
            }
        }
    }, scrollSize:function (dir, container, content) {
        return (dir == "h") ? Math.max(container.scrollWidth, content.clientWidth) : Math.max(container.scrollHeight, content.clientHeight);
    }, update:function () {
        var self = this, container = self.container, content = self.content, scroller = self.scroller, direction = self.direction;
        if (!self._contentInited) {
            content = self.content = container.firstChild;
            if (self.content) {
                self._contentInited = true;
            }
        }
        if (!content) {
            return;
        }
        var viewWidth = container.clientWidth, viewHeight = container.clientHeight, scrollWidth = self.scrollSize("h", container, content), scrollHeight = self.scrollSize("v", container, content);
        scroller.options.scrollingX = direction == "auto" ? viewWidth < scrollWidth : directionMap[direction].x;
        if (self._pullToRefreshEnabled) {
            scroller.options.scrollingY = true;
        } else {
            scroller.options.scrollingY = direction == "auto" ? viewHeight < scrollHeight : directionMap[direction].y;
        }
        scroller.setDimensions(viewWidth, viewHeight, scrollWidth, scrollHeight);
        if (self.snapHeight || self.snapWidth) {
            scroller.setSnapSize(self.snapWidth || 100, self.snapHeight || 100);
        }
        var scrollTop = self.defaultScrollTop, scrollLeft = self.defaultScrollLeft;
        if (scrollTop || scrollLeft) {
            scroller.scrollTo(scrollLeft, scrollTop, false);
            self.defaultScrollTop = undefined;
            self.defaultScrollLeft = undefined;
        }
        self.updateScrollbar(true);
    }, bindEvents:function () {
        var self = this;
        self.handleStart = $scopify(self, handleStart);
        self.handleMove = $scopify(self, handleMove);
        self.handleEnd = $scopify(self, handleEnd);
        self.handleMouseWheel = $scopify(self, handleMouseWheel);
        jQuery(this.container).hammer({dragMinDistance:4}).bind("touch", self.handleStart).bind("drag", self.handleMove).bind("dragend", self.handleEnd);
        self.container.addEventListener("mousewheel", self.handleMouseWheel);
    }, scrollTo:function (left, top, animate) {
        this.scroller.scrollTo(left, top, animate);
    }, scrollBy:function (left, top, animate) {
        this.scroller.scrollBy(left, top, animate);
    }, getValues:function () {
        return this.scroller.getValues();
    }, scrollToElement:function (dom) {
        var position = -1, scroller = this.scroller;
        if ((dom.offsetTop + dom.offsetHeight) > (scroller.__scrollTop + scroller.__clientHeight)) {
            position = dom.offsetTop + dom.offsetHeight;
        } else {
            if (dom.offsetTop < scroller.__scrollTop) {
                position = dom.offsetTop;
            }
        }
        if (position >= 0) {
            scroller.scrollTo(null, position, true);
        }
    }, activatePullToRefresh:function (height, activateCallback, deactivateCallback, startCallback) {
        if (this.scroller) {
            this._pullToRefreshEnabled = true;
            this.scroller.activatePullToRefresh(height, activateCallback, deactivateCallback, startCallback);
        }
    }, destroy:function () {
        var self = this, container = self.container, vertScrollbar = self.vertbar.scrollbar, horiScrollbar = self.horibar.scrollbar;
        self.destroyed = true;
        if (container) {
            jQuery(container).off("touch", self.handleStart).off("drag", self.handleMove).off("dragend", self.handleEnd);
        }
        if (horiScrollbar && horiScrollbar.parentNode) {
            horiScrollbar.parentNode.removeChild(horiScrollbar);
        }
        if (vertScrollbar && vertScrollbar.parentNode) {
            vertScrollbar.parentNode.removeChild(vertScrollbar);
        }
        self.scroller = null;
        delete self.container;
        delete self.content;
    }};
    var oldModernScroll = dorado.util.Dom.modernScroll;
    dorado.util.Dom.modernScroll = function (container, options) {
        if ((!options || !options.scrollerType) && (dorado.Browser.isTouch || $setting["common.simulateTouch"])) {
            var options = dorado.Object.apply({}, options);
            options.scrollerType = TouchScroller;
        }
        return oldModernScroll.apply(this, [container, options]);
    };
})();
(function () {
    dorado.Exception.alertException = function (e) {
        alert(dorado.Exception.getExceptionMessage(e));
    };
})();
(function () {
    var reserved = ["break", "do", "instanceof", "typeof", "case", "else", "new", "var", "catch", "finally", "return", "void", "continue", "for", "switch", "while", "debugger", "function", "this", "with", "default", "if", "throw", "delete", "in", "try", "class", "enum", "extends", "super", "const", "export", "import", "null", "true", "false", "undefined"], compileCache = {}, exprStartTag = "{{", exprFinishTag = "}}";
    var parseExpression = function (expr, options) {
        options = options || {};
        var input = options.input || [], index = 0, result = [], prev = 0, variableIndexes = [], variables = [];
        var parse = function (level, stopChar, convert, inString) {
            var curChar, nextChar, prevChar, checkVariable, variable, variableIndex;
            variable = "";
            variableIndex = -1;
            checkVariable = function () {
                var topVariable;
                if (!variable) {
                    return;
                }
                if (reserved.indexOf(variable) >= 0) {
                    return;
                }
                topVariable = variable.split(".")[0];
                if (input.indexOf(topVariable) >= 0) {
                    return;
                }
                if (variable.slice(0, 5) === "this.") {
                    return;
                }
                if (variable[0].match(/[\d\.]/)) {
                    return;
                }
                if (expr[variableIndex + variable.length] == "(") {
                    variables.push(variable);
                } else {
                    variables.push(variable);
                }
                return variableIndexes.push(variableIndex);
            };
            while (index < expr.length) {
                prevChar = curChar;
                curChar = expr[index];
                index += 1;
                nextChar = expr[index];
                if (convert) {
                    if (curChar.match(/[\d\w_\.\$]/)) {
                        if (!variable) {
                            variableIndex = index - 1;
                        }
                        variable += curChar;
                    } else {
                        if (stopChar === "}") {
                            if (expr.substring(index - 1).trim()[0] === ":") {
                                variable = "";
                            }
                        }
                        checkVariable();
                        variable = "";
                    }
                }
                if (curChar === stopChar && prevChar != "\\") {
                    return;
                }
                if (curChar === "(" && !inString) {
                    parse(level + 1, ")", convert);
                } else {
                    if (curChar === "[" && !inString) {
                        parse(level + 1, "]", convert);
                    } else {
                        if (curChar === "{" && !inString) {
                            parse(level + 1, "}", true);
                        } else {
                            if (curChar === "\"" && prevChar != "\\") {
                                parse(level + 1, "\"", false, true);
                            } else {
                                if (curChar === "'" && prevChar != "\\") {
                                    parse(level + 1, "'", false, true);
                                } else {
                                    if (curChar === "|") {
                                        if (level === 0) {
                                            if (nextChar === "|") {
                                                index += 1;
                                            } else {
                                                convert = false;
                                                result.push(expr.substring(prev, index - 1));
                                                prev = index;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (level === 0) {
                result.push(expr.substring(prev));
            }
            return checkVariable();
        };
        parse(0, null, true);
        if (variableIndexes.length) {
            var exp = result[0];
            for (var i = variableIndexes.length - 1; i >= 0; i += -1) {
                var varIndex = variableIndexes[i];
                exp = exp.slice(0, varIndex) + "this." + exp.slice(varIndex);
            }
            result[0] = exp;
        }
        return result;
    };
    var parseText = function (line) {
        var startTag = exprStartTag, finishTag = exprFinishTag, result = [], index = 0, prevIndex = 0, rexp = null;
        var getPart = function (count) {
            var result;
            count = count || 1;
            result = line.substring(prevIndex, index - count);
            prevIndex = index;
            return result;
        };
        var parse = function (level, stopChar, force) {
            var curChar = null, prevCurChar, nextChar, prevChar = "";
            if (!level) {
                rexp = {type:"expression", list:[]};
                result.push(rexp);
            }
            while (index < line.length) {
                prevChar = curChar;
                curChar = line[index];
                index += 1;
                prevCurChar = prevChar + curChar;
                nextChar = line[index];
                if (curChar === stopChar) {
                    return;
                }
                if (force) {
                    continue;
                }
                if (prevCurChar === finishTag && level === 0) {
                    rexp.list.push(getPart(2));
                    return true;
                }
                if (curChar === "(") {
                    parse(level + 1, ")");
                } else {
                    if (curChar === "{") {
                        parse(level + 1, "}");
                    } else {
                        if (curChar === "\"") {
                            parse(level + 1, "\"", true);
                        } else {
                            if (curChar === "'") {
                                parse(level + 1, "'", true);
                            } else {
                                if (curChar === "|") {
                                    if (level === 0) {
                                        if (nextChar === "|") {
                                            index += 1;
                                        } else {
                                            rexp.list.push(getPart());
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        var findExpr = function () {
            var curChar = null, prevCurChar, prevChar = "", text, part;
            while (index < line.length) {
                prevChar = curChar;
                curChar = line[index];
                index += 1;
                prevCurChar = prevChar + curChar;
                if (prevCurChar === startTag) {
                    text = getPart(2);
                    if (text) {
                        result.push({type:"text", value:text});
                    }
                    if (!parse(0)) {
                        throw "Wrong expression" + line;
                    }
                    curChar = null;
                }
            }
            part = getPart(-1);
            if (part) {
                result.push({type:"text", value:part});
            }
        };
        findExpr();
        return result;
    };
    var parsePair = function (line) {
        var inString = false, stringChar = null, level = 0, pairBeginIndex = 0, exprIndex = 0, result = [], curPair = {}, charCount = line.length, i, curChar, prevChar;
        function pushPair() {
            curPair.literal = line.slice(pairBeginIndex, i).trim();
            if (curPair.expr === undefined) {
                curPair.expr = line.slice(exprIndex, i).trim();
            }
            if (i === 0 || curPair.expr) {
                result.push(curPair);
            }
        }
        for (i = 0; i < charCount; i++) {
            prevChar = curChar;
            curChar = line.charAt(i);
            if (curChar === "\"" || curChar === "'") {
                if (!inString) {
                    inString = true;
                    stringChar = curChar;
                    level++;
                    continue;
                }
                if (inString && prevChar != "\\" && curChar === stringChar) {
                    inString = false;
                    stringChar = null;
                    level--;
                    continue;
                }
            }
            if (!inString) {
                if (curChar === "," && !level) {
                    pushPair();
                    curPair = {};
                    pairBeginIndex = exprIndex = i + 1;
                } else {
                    if (curChar === ":" && !curPair.key && !curPair.expr) {
                        var key = line.slice(pairBeginIndex, i).trim();
                        if (/^[\w\$-]+$/.test(key)) {
                            exprIndex = i + 1;
                            curPair.key = key;
                        }
                    } else {
                        if (curChar === "(" || curChar === "[" || curChar === "{") {
                            level++;
                        } else {
                            if (curChar === ")" || curChar === "]" || curChar === "}") {
                                level--;
                            }
                        }
                    }
                }
            }
        }
        if (i === 0 || pairBeginIndex !== i) {
            pushPair();
        }
        return result;
    };
    var QUOTE_RE = /"/g;
    var escapeQuote = function (value) {
        return value.indexOf("\"") > -1 ? value.replace(QUOTE_RE, "'") : value;
    };
    var inlineFilters = function (expr, filters) {
        var args;
        for (var i = 0, j = filters.length; i < j; i++) {
            var filterStr = filters[i], filterName, param, hasParams = filterStr.match(/\s*([\w\d_]+?)\s*:\s*(.*?)\s*$/);
            if (hasParams) {
                filterName = hasParams[1];
                param = hasParams[2];
            } else {
                filterName = filterStr.trim();
                param = null;
            }
            args = param ? ",\"" + param.map(escapeQuote).join("\",\"") + "\"" : "";
            expr = "this.$filter(\"" + filterName + "\").call(this," + expr + args + ")";
        }
        return expr;
    };
    var compileExpr = function (sourceExpr, options, scope) {
        if (!scope) {
            scope = this;
        }
        options = options || {};
        var compileResult = {}, postFilters;
        if (typeof sourceExpr == "object" && sourceExpr.type === "expression") {
            postFilters = sourceExpr.list.slice(1);
            sourceExpr = sourceExpr.list[0];
        }
        sourceExpr = sourceExpr.trim();
        if (sourceExpr.slice(0, 2) === "::") {
            sourceExpr = sourceExpr.slice(2);
            compileResult.once = true;
        }
        var cacheKey = sourceExpr + "#";
        cacheKey += options.noReturn ? "+" : "-";
        cacheKey += options.returnString ? "s" : "v";
        if (options.input) {
            cacheKey += options.input.join(",");
        }
        var compiledFn = compileCache[cacheKey];
        if (compiledFn) {
            compileResult.fn = function () {
                try {
                    return compiledFn.apply(scope, arguments);
                }
                catch (e) {
                    console.error(sourceExpr, e);
                }
            };
            if (options.fullObject) {
                return compileResult;
            }
            return compileResult.fn;
        }
        var noReturn = options.noReturn || false, parsedExpr = parseExpression(sourceExpr, {input:options.input}), expr = parsedExpr[0], filters = parsedExpr.slice(1), inputParams = options.input ? options.input.join(",") : "", fnString;
        if (filters.length) {
            expr = inlineFilters(expr, filters);
        }
        if (postFilters && postFilters.length) {
            expr = inlineFilters(expr, postFilters);
        }
        if (noReturn) {
            fnString = "(function(){ return (function(" + inputParams + ") { " + expr + " }); })()";
        } else {
            if (options.returnString && filters.length == 0) {
                fnString = "(function(){ return (function(" + inputParams + ") { var __ = (" + expr + "); return '' + (__ || (__ == null?'':__)) }); })()";
            } else {
                fnString = "(function(){ return (function(" + inputParams + ") { return ( " + expr + " ) }); })()";
            }
        }
        try {
            compiledFn = eval(fnString);
        }
        catch (e) {
            console.error("Wrong expression: ", sourceExpr, e);
            throw "Wrong expression: " + sourceExpr;
        }
        compileCache[cacheKey] = compiledFn;
        compileResult.fn = function () {
            try {
                return compiledFn.apply(scope, arguments);
            }
            catch (e) {
                console.error(sourceExpr, e);
            }
        };
        if (options.fullObject) {
            return compileResult;
        }
        return compileResult.fn;
    };
    dorado.smart = {compileExpression:compileExpr, parseExpression:parseExpression, parsePair:parsePair, parseText:parseText};
})();
(function () {
    var includeExprRegex = /\s*({{\s*(.+?)\s*}})\s*/gi, isExprRegex = /^\s*({{\s*(.+?)\s*}})\s*$/gi, directiveAttrNameRegex = /^d\-(.+)$/g;
    var extractExpr = function (str) {
        var match = isExprRegex.exec(str), result;
        if (match && match[2]) {
            result = match[2];
        }
        isExprRegex.lastIndex = 0;
        return result || "";
    };
    var extractDirectiveName = function (str) {
        return str.replace("d-", "");
    };
    function fnv32a(str) {
        var FNV1_32A_INIT = 2166136261, hval = FNV1_32A_INIT;
        for (var i = 0; i < str.length; ++i) {
            hval ^= str.charCodeAt(i);
            hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
        }
        return hval >>> 0;
    }
    var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var hash = function (input) {
        var hash = "", alphabetLength = alphabet.length;
        if (typeof input === "string") {
            input = fnv32a(input);
        }
        do {
            hash = alphabet[input % alphabetLength] + hash;
            input = parseInt(input / alphabetLength, 10);
        } while (input);
        return hash;
    };
    var specialTags = {}, templateCache = {}, parseText = dorado.smart.parseText, ignoreChildrenDirs = {"repeat":true}, resolveDirectiveIdSeed = 1;
    dorado.SmartParser = {partials:{}, registerPartial:function (name, partial) {
        var result = this.resolveTemplate(partial);
        this.partials[name] = result.children;
    }, resolveElement:function (tagName, attrs) {
        var normalAttrs = {}, attrBindings = [], attrDirective, directives = [], ignoreChildren = false;
        var partial;
        for (var pair in attrs) {
            if (!attrs.hasOwnProperty(pair)) {
                continue;
            }
            var attr = attrs[pair], attrName = attr.name, attrValue = attr.value;
            if (directiveAttrNameRegex.test(attrName)) {
                var name = extractDirectiveName(attrName), directive;
                if (name == "attr") {
                    if (!attrDirective) {
                        directive = attrDirective = {id:resolveDirectiveIdSeed++, name:"attr", definition:attrValue};
                        directives.push(directive);
                    }
                    attrDirective = directive;
                } else {
                    if (name == "partial") {
                        partial = attrValue;
                    } else {
                        directive = {id:resolveDirectiveIdSeed++, name:name, definition:attrValue};
                        directives.push(directive);
                    }
                }
                if (ignoreChildrenDirs[name]) {
                    ignoreChildren = true;
                }
                directiveAttrNameRegex.lastIndex = 0;
                continue;
            }
            if (attrValue && isExprRegex.test(attrValue)) {
                isExprRegex.lastIndex = 0;
                var expr = extractExpr(attrValue);
                if (expr) {
                    attrBindings.push([attrName, expr]);
                }
                continue;
            }
            normalAttrs[attrName] = attrValue;
        }
        if (attrBindings.length > 0) {
            if (!attrDirective) {
                attrDirective = {id:resolveDirectiveIdSeed++, name:"attr", pairs:attrBindings};
                directives.push(attrDirective);
            }
        }
        if (ignoreChildren) {
            return {tagName:tagName, attrs:normalAttrs, directives:directives, ignoreChildren:true, partial:partial};
        }
        return {tagName:tagName, attrs:normalAttrs, directives:directives, partial:partial};
    }, resolveSpecialTag:function (tagName, attrs) {
        var normalAttrs = {}, postAttrs = [], directives = [], attrDefinition;
        for (var attr in attrs) {
            if (!attrs.hasOwnProperty(attr)) {
                continue;
            }
            var attrName = attrs[attr].name, attrValue = attrs[attr].value;
            if (directiveAttrNameRegex.test(attrName)) {
                directiveAttrNameRegex.lastIndex = 0;
                var dirName = extractDirectiveName(attrName);
                if (dirName == "attr") {
                    attrDefinition = attrValue;
                } else {
                    directives.push({id:resolveDirectiveIdSeed++, name:dirName, definition:attrValue});
                }
                continue;
            }
            if (attrValue && isExprRegex.test(attrValue)) {
                isExprRegex.lastIndex = 0;
                var expr = extractExpr(attrValue);
                if (attrName == "onTap") {
                    var fn = compileExpr(expr, {}, context);
                    normalAttrs.onTap = fn;
                } else {
                    postAttrs.push({key:attrName, expr:expr});
                }
                continue;
            }
            normalAttrs[attrName] = attrValue;
        }
        if (postAttrs.length) {
            var directive;
            if (attrDefinition) {
                directive = {id:resolveDirectiveIdSeed++, name:"attr", definition:attrDefinition, pairs:postAttrs};
            } else {
                directive = {id:resolveDirectiveIdSeed++, name:"attr", definition:postAttrs};
            }
            if (directive) {
                directives.push(directive);
            }
        } else {
            if (attrDefinition) {
                directives.push({id:resolveDirectiveIdSeed++, name:"attr", definition:attrDefinition});
            }
        }
        return {tagName:tagName, attrs:normalAttrs, directives:directives};
    }, resolveTemplate:function (template) {
        var parser = this;
        if (templateCache[template]) {
            return templateCache[template];
        }
        var hashCode = hash(template);
        var rootLevel = {children:[], metaId:hashCode}, level = 1, levels = [], curLevelParent = rootLevel;
        htmlParser(template, {start:function (tagName, attrs, unary) {
            if (specialTags[tagName]) {
                var cache = parser.resolveSpecialTag(tagName, attrs);
                cache.level = level;
                cache.type = "special-tag";
                if (!curLevelParent.children) {
                    curLevelParent.children = [];
                }
                cache.metaId = curLevelParent.metaId + "." + curLevelParent.children.length;
                curLevelParent.children.push(cache);
                if (!unary) {
                    level++;
                    levels.push(cache);
                    curLevelParent = cache;
                }
            } else {
                var cache = parser.resolveElement(tagName, attrs);
                cache.level = level;
                cache.type = "element";
                if (!curLevelParent.children) {
                    curLevelParent.children = [];
                }
                cache.metaId = curLevelParent.metaId + "." + curLevelParent.children.length;
                curLevelParent.children.push(cache);
                if (!unary) {
                    level++;
                    levels.push(cache);
                    curLevelParent = cache;
                }
            }
        }, end:function (tag) {
            level--;
            levels.length -= 1;
            curLevelParent = levels[levels.length - 1];
            if (!curLevelParent) {
                curLevelParent = rootLevel;
            }
        }, chars:function (text) {
            if (text && includeExprRegex.test(text)) {
                includeExprRegex.lastIndex = 0;
                var result = parseText(text);
                for (var i = 0, j = result.length; i < j; i++) {
                    var term = result[i], cache = {type:term.type};
                    if (term.type == "text") {
                        cache.text = term.value;
                    } else {
                        if (term.type == "expression") {
                            cache.expr = term;
                        }
                    }
                    if (!curLevelParent.children) {
                        curLevelParent.children = [];
                    }
                    cache.metaId = curLevelParent.metaId + "." + curLevelParent.children.length;
                    curLevelParent.children.push(cache);
                }
            } else {
                if (!curLevelParent.children) {
                    curLevelParent.children = [];
                }
                var cache = {type:"text", text:text};
                cache.metaId = curLevelParent.metaId + "." + curLevelParent.children.length;
                curLevelParent.children.push(cache);
            }
        }, comment:function (text) {
        }});
        templateCache[template] = rootLevel;
        return rootLevel;
    }};
    dorado.smart.specialTags = specialTags;
    dorado.smart.registerSpecialTagResolver = function (tagName, options) {
        specialTags[tagName] = options;
    };
})();
(function () {
    var seed = 1, createDirective = function (name, element, context, definition, value, meta, id) {
        var clazz = dorado.smart.directives[name];
        if (clazz) {
            return new clazz(element, context, definition, value, meta, id);
        }
        return null;
    };
    var specialTags = dorado.smart.specialTags, compileExpr = dorado.smart.compileExpression;
    dorado.SmartBuilder = $class({constructor:function (meta, context) {
        this.meta = meta;
        this.context = context;
        this.directives = [];
    }, build:function () {
        var builder = this, context = builder.context, meta = builder.meta, directives = builder.directives;
        var fragment = document.createDocumentFragment(), control = context.control, prefix = meta.metaId + "_", startLevelStr = prefix + seed++, level = 1;
        function buildTree(nodes, parentNode, levelStr, level) {
            if (!levelStr) {
                levelStr = startLevelStr;
            }
            for (var i = 0, j = nodes.length; i < j; i++) {
                var node = nodes[i], children = node.children, elem;
                if (node.type == "element") {
                    elem = document.createElement(node.tagName);
                    elem.id = levelStr + "." + i;
                    $fly(elem).attr("data-meta-id", node.metaId);
                    parentNode.appendChild(elem);
                    builder.bindDirectiveToElement(elem, node, context, directives);
                    if (node.ignoreChildren === true) {
                        continue;
                    }
                    if (node.partial) {
                        children = dorado.SmartParser.partials[node.partial];
                    }
                    if (children && children.length > 0) {
                        buildTree(children, elem, elem.id, ++level);
                    }
                } else {
                    if (node.type == "special-tag") {
                        var subControl = builder.createSpecialTag(node, context, directives);
                        if (subControl) {
                            subControl.render(parentNode);
                            subControl._dom.id = levelStr + "." + i;
                            $fly(subControl._dom).attr("data-meta-id", node.metaId);
                            control.registerInnerControl(subControl);
                        }
                        builder.bindDirectiveToControl(subControl, node, context, directives);
                    } else {
                        if (node.type == "text") {
                            elem = document.createTextNode(node.text);
                            parentNode.appendChild(elem);
                        } else {
                            if (node.type == "expression") {
                                elem = builder.createBindingTextNode(node.expr, context, directives);
                                parentNode.appendChild(elem);
                            }
                        }
                    }
                }
            }
        }
        fragment.id = startLevelStr;
        buildTree(meta.children, fragment, 0, level);
        return fragment;
    }, createBindingTextNode:function (expr, context, directives) {
        var fn = compileExpr(expr, {}, context), value = fn(), node = document.createTextNode(value);
        var directive = createDirective("text", node, context, expr);
        if (directive) {
            directives.push(directive);
        }
        return node;
    }, bindDirectiveToElement:function (elem, config, context, directives) {
        config = config || {};
        var dirs = config.directives, attrs = config.attrs;
        if (attrs) {
            $fly(elem).attr(attrs);
        }
        if (dirs) {
            for (var i = 0, j = dirs.length; i < j; i++) {
                var dirConfig = dirs[i];
                if (config.ignoreChildren && dirConfig.name != "repeat") {
                    continue;
                }
                var directive = createDirective(dirConfig.name, elem, context, dirConfig.definition, undefined, config, dirConfig.id), pairs = dirConfig.pairs;
                if (pairs) {
                    for (var k = 0, l = pairs.length; k < l; k++) {
                        var pair = pairs[k];
                        directive.bindOne.call(directive, pair.key, pair.expr);
                    }
                }
                directives.push(directive);
            }
        }
        return elem;
    }, bindDirectiveToControl:function (control, config, context, directives) {
        var dirs = config.directives;
        if (dirs) {
            for (var i = 0, j = dirs.length; i < j; i++) {
                var dirConfig = dirs[i], directive = createDirective(dirConfig.name, control, context, dirConfig.definition, undefined, config, dirConfig.id), pairs = dirConfig.pairs;
                if (pairs) {
                    for (var k = 0, l = pairs.length; k < l; k++) {
                        var pair = pairs[k];
                        directive.bindOne.call(directive, pair.key, pair.expr);
                    }
                }
                directives.push(directive);
            }
        }
    }, createSpecialTag:function (config, context, directives) {
        config = config || {};
        var tagName = config.tagName, attrs = config.attrs, subControl;
        var specialTagConfig = specialTags[config.tagName];
        if (specialTagConfig && specialTagConfig.createControl) {
            subControl = specialTagConfig.createControl(tagName, attrs, context, directives);
        }
        return subControl;
    }});
})();
(function () {
    var filters = dorado.smart.filters = {};
    filters.uppercase = function (value) {
        return (value || value === 0) ? value.toString().toUpperCase() : "";
    };
    filters.lowercase = function (value) {
        return (value || value === 0) ? value.toString().toLowerCase() : "";
    };
    filters.number = function (value, fractionSize) {
        return (value || value === 0) ? Number(value).toFixed(fractionSize ? fractionSize : 2) : value;
    };
    filters.json = function (value) {
        return (value || value === 0) ? JSON.stringify(value) : "";
    };
    var defaultComparator = function (actual, expected) {
        return ("" + actual).toLocaleLowerCase().indexOf(("" + expected).toLocaleLowerCase()) != -1;
    };
    var defaultCompare = function (item, expected, comparator) {
        if (!item || !expected) {
            return false;
        }
        if (typeof item == "string") {
            return comparator(item, expected);
        } else {
            for (var prop in item) {
                var actual = item[prop];
                if (typeof actual == "string" && actual) {
                    if (comparator(actual, expected)) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
    var filterWithCriterion = function (item, criterion, comparator) {
        if (!item || !criterion) {
            return false;
        }
        if (typeof item == "string") {
            return false;
        } else {
            var result = true;
            for (var prop in criterion) {
                var value = item[prop], expected = criterion[prop];
                if (!comparator(value, expected)) {
                    result = false;
                    break;
                }
            }
            return result;
        }
    };
    filters.filter = function (value, expression, comparator) {
        if (value && expression) {
            var result = value;
            comparator = comparator ? comparator : defaultComparator;
            if (typeof expression == "string") {
                result = _.filter(value, function (item) {
                    return defaultCompare(item, expression, comparator);
                });
            } else {
                if (typeof expression == "object") {
                    var criterion = {}, count = 0;
                    for (var prop in expression) {
                        if (expression[prop] !== null && expression[prop] !== undefined) {
                            criterion[prop] = expression[prop];
                            count++;
                        }
                    }
                    if (criterion.$ && count == 1) {
                        result = _.filter(value, function (item) {
                            return defaultCompare(item, criterion.$, comparator);
                        });
                    } else {
                        if (count == 0) {
                            return value;
                        }
                        result = _.filter(value, function (item) {
                            return filterWithCriterion(item, criterion, comparator);
                        });
                    }
                } else {
                    if (typeof expression == "function") {
                        result = _.filter(value, expression);
                    }
                }
            }
            return result;
        }
        return value;
    };
    function sortByKey(array, key, reverse) {
        var copy = array.concat();
        copy.sort(function (x, y) {
            return reverse ? reverseCompareBy(x, y, key) : compareBy(x, y, key);
        });
        return copy;
    }
    function sortByMultiple(array, keys, reverse) {
        var copy = array.concat();
        copy.sort(function (x, y) {
            var comparison = 0;
            for (var i = 0; i < keys.length; ++i) {
                comparison = reverse ? reverseCompareBy(x, y, keys[i]) : compareBy(x, y, keys[i]);
                if (comparison !== 0) {
                    return comparison;
                }
            }
            return comparison;
        });
        return copy;
    }
    function reverseCompareBy(x, y, key) {
        if (x[key] === y[key]) {
            return 0;
        }
        return x[key] < y[key] ? 1 : -1;
    }
    function compareBy(x, y, key) {
        if (x[key] === y[key]) {
            return 0;
        }
        return x[key] > y[key] ? 1 : -1;
    }
    filters.orderBy = function (value, expression, reverse) {
        if (value && expression) {
            var result = value;
            if (typeof expression == "string") {
                result = sortByKey(value, expression, reverse);
            } else {
                if (typeof expression == "function") {
                    result = _.sortBy(value, expression);
                    if (reverse === true) {
                        result = result.reverse();
                    }
                } else {
                    if (expression instanceof Array) {
                        result = sortByMultiple(value, expression, reverse);
                    }
                }
            }
            return result;
        }
        return value;
    };
    filters.date = function (value, format) {
        if (value instanceof Date) {
            return value.formatDate(format || "Y-m-d");
        }
        return value || "";
    };
    dorado.smart.getFilter = function (filterName) {
        return filters[filterName];
    };
})();
(function () {
    var includePairRegex = /:.+,?/gi, dirPrefix = "_d_directive_", directiveIdSeed = 1, parsePair = dorado.smart.parsePair, compileExpr = dorado.smart.compileExpression;
    var maybePair = function (expr) {
        if (includePairRegex.test(expr)) {
            includePairRegex.lastIndex = 0;
            return true;
        }
        return false;
    };
    dorado.smart.Directive = $class({constructor:function (element, context, definition) {
        this.id = dirPrefix + directiveIdSeed++;
        this.element = element;
        this.context = context;
        this.definition = definition;
        this.bindings = [];
    }, bind:function () {
    }, unbind:function () {
        this.bindings = [];
    }, update:function () {
    }});
    var SingleDirective = $extend(dorado.smart.Directive, {constructor:function (element, context, definition) {
        $invokeSuper.call(this, arguments);
        this.definition = definition;
        if (element && definition && context) {
            this.bind();
        }
    }, bind:function (definition) {
        definition = definition || this.definition;
        var context = this.context, element = this.element, fn = compileExpr(definition, {}, context);
        this.bindings.push({update:fn});
        var value = fn.apply(context);
        this.updateElement(element, value);
    }, update:function () {
        var directive = this, bindings = directive.bindings, element = this.element, context = this.context;
        for (var i = 0, j = bindings.length; i < j; i++) {
            var binding = bindings[i], update = binding.update;
            if (update) {
                var value = update.apply(context);
                directive.updateElement(element, value);
            }
        }
    }});
    var TextDirective = $extend(SingleDirective, {type:"text", updateElement:function (element, value) {
        value = value === undefined ? "" : "" + value;
        if (element.nodeType == 3) {
            element.nodeValue = value;
        } else {
            $fly(element).text(value);
        }
    }});
    var HTMLDirective = $extend(SingleDirective, {type:"html", updateElement:function (element, value) {
        value = value === undefined ? "" : "" + value;
        $fly(element).html(value);
    }});
    var VisibleDirective = $extend(SingleDirective, {type:"visible", updateElement:function (element, value) {
        value = !!value;
        if (element instanceof dorado.widget.Control) {
            element.set("visible", value);
        } else {
            $fly(element).css("display", value ? "" : "none");
        }
    }});
    var getIndex = function (str) {
        var result = str.split("."), selfIndex = result[result.length - 1];
        return +selfIndex;
    };
    var findRefElement = function (elem, parentNode) {
        var id = $fly(elem).attr("data-meta-id"), index = getIndex(id) || -1;
        if (index == 0) {
            return null;
        } else {
            if (index != -1) {
                var prefix = id.substr(0, id.length - ("" + index).length - 1);
                for (var i = index - 1; i >= 0; i--) {
                    var id = prefix + "." + i;
                    var childNode = parentNode.childNodes[i];
                    if (childNode && getIndex($fly(childNode).attr("data-meta-id")) < index) {
                        return childNode;
                    }
                }
            }
        }
        return null;
    };
    dorado.smart.findRefElemnt = findRefElement;
    var IFDirective = $extend(SingleDirective, {type:"if", bind:function (definition) {
        definition = definition || this.definition;
        var context = this.context, element = this.element, fn = compileExpr(definition, {}, context);
        this.bindings.push({update:fn});
        var dom = element;
        if (dom instanceof dorado.widget.Control) {
            dom = element._dom;
        }
        this.parentNodeId = dom.parentNode.id;
        this.parentNode = dom.parentNode;
        dom.parentNode.removeChild(dom);
        var value = fn.apply(context);
        this.updateElement(element, value);
    }, updateElement:function (element, value) {
        value = !!value;
        var dom = element;
        if (dom instanceof dorado.widget.Control) {
            dom = element._dom;
        }
        if (!dom) {
            return;
        }
        var refElement = findRefElement(dom, this.parentNode || document.getElementById(this.parentNodeId));
        this.parentNode = null;
        if (value) {
            if (!dom.parentNode) {
                $fly(dom).insertAfter(refElement);
            }
        } else {
            if (dom.parentNode) {
                dom.parentNode.removeChild(dom);
            }
        }
    }});
    var PairDirective = $extend(dorado.smart.Directive, {constructor:function (element, context, definition, value) {
        $invokeSuper.call(this, arguments);
        if (value === undefined) {
            this.definition = definition;
            if (element && definition && context) {
                this.bind();
            }
        } else {
            if (definition && value) {
                this.bindOne && this.bindOne(definition, value);
            }
        }
    }, bindOne:function (key, expr) {
        var bindings = this.bindings, element = this.element, context = this.context, fn = compileExpr(expr, {}, context);
        bindings.push({key:key, update:fn});
        this.updateElement(element, key, fn.apply(context));
    }, bind:function (definition) {
        definition = definition || this.definition;
        var pairs;
        if (definition instanceof Array) {
            pairs = definition;
        } else {
            if (maybePair(definition)) {
                pairs = parsePair(definition);
            }
        }
        for (var i = 0, j = pairs.length; i < j; i++) {
            var pair = pairs[i];
            if (pair.key && pair.expr) {
                this.bindOne(pair.key, pair.expr);
            }
        }
    }, update:function () {
        var directive = this, bindings = directive.bindings, element = this.element, context = this.context;
        for (var i = 0, j = bindings.length; i < j; i++) {
            var binding = bindings[i], key = binding.key, update = binding.update;
            if (key && update) {
                var result = update.apply(context);
                directive.updateElement(element, key, result);
            }
        }
    }});
    var AttrDirective = $extend(PairDirective, {type:"attr", updateElement:function (element, key, value) {
        if (element && key) {
            value = value === undefined ? "" : value;
            if (element instanceof dorado.widget.Control) {
                element.set(key, value);
            } else {
                $fly(element).prop(key, value);
            }
        }
    }});
    var StyleDirective = $extend(PairDirective, {type:"style", updateElement:function (element, key, value) {
        if (element && key) {
            value = value === undefined ? "" : value;
            if (element instanceof dorado.widget.Control) {
                if (element._dom) {
                    $fly(element._dom).css(key, value);
                }
            } else {
                $fly(element).css(key, value);
            }
        }
    }});
    var ClassDirective = $extend(PairDirective, {type:"class", updateElement:function (element, key, value) {
        if (element && key) {
            value = value === undefined ? "" : value;
            if (element instanceof dorado.widget.Control) {
                if (element._dom) {
                    $fly(element._dom).toggleClass(key, !!value);
                }
            } else {
                $fly(element).toggleClass(key, !!value);
            }
        }
    }});
    var hammerEvents = {onTap:"tap", onDoubleTap:"doubletap", onSwipe:"swipe", onTapHold:"hold", tap:"tap", doubleTap:"doubleTap", swipe:"swipe", tapHold:"hold"}, controlEvents = {onTap:"onTap", onDoubleTap:"onDoubleTap", onSwipe:"onSwipe", onTapHold:"onTapHold", tap:"onTap", doubleTap:"onDoubleTap", swipe:"onSwipe", tapHold:"onTapHold"};
    var EventDirective = $extend(PairDirective, {type:"event", bindOne:function (key, expr) {
        var element = this.element, context = this.context, fn = compileExpr(expr, {}, context);
        if (element instanceof dorado.widget.Control) {
            key = controlEvents[key] || key;
            element.bind(key, fn);
        } else {
            if (hammerEvents[key]) {
                $fly(element).hammer({transform:true}).bind(hammerEvents[key], fn);
            } else {
                $fly(element).bind(key, fn);
            }
        }
    }});
    dorado.smart.SingleDirective = SingleDirective;
    dorado.smart.TextDirective = TextDirective;
    dorado.smart.HTMLDirective = HTMLDirective;
    dorado.smart.StyleDirective = StyleDirective;
    dorado.smart.AttrDirective = AttrDirective;
    dorado.smart.EventDirective = EventDirective;
    dorado.smart.ClassDirective = ClassDirective;
    dorado.smart.VisibleDirective = VisibleDirective;
    dorado.smart.directives = {text:TextDirective, html:HTMLDirective, visible:VisibleDirective, style:StyleDirective, attr:AttrDirective, on:EventDirective, "class":ClassDirective, "if":IFDirective};
})();
(function () {
    var repeat_seed = 1, compileExpr = dorado.smart.compileExpression;
    var findRefElement = dorado.smart.findRefElemnt;
    var RepeatDirective = $extend(dorado.smart.Directive, {type:"repeat", constructor:function (element, context, definition, value, meta, protoId) {
        $invokeSuper.call(this, arguments);
        this._itemIdProperty = "repeat" + repeat_seed++ + "_item";
        this.protoId = protoId;
        var temp = {};
        for (var prop in meta) {
            var value = meta[prop];
            if (prop == "directives") {
                if (value && value.length > 1) {
                    var dirs = value.concat();
                    for (var i = 0, j = dirs.length; i < j; i++) {
                        var item = dirs[i];
                        if (item.id === protoId) {
                            dirs.splice(i, 1);
                            temp[prop] = dirs;
                            break;
                        }
                    }
                }
                continue;
            }
            if (prop != "ignoreChildren") {
                temp[prop] = value;
            }
        }
        this.meta = temp;
        this.bind(definition);
    }, parseExpr:function (expr) {
        var nameOfKey, expression, trackExpression;
        var result = expr.match(/\s*([\d\w]+)\s+in\s+(.+)\s+track\s+by\s+(.+)/);
        if (result) {
            nameOfKey = result[1];
            expression = result[2];
            trackExpression = result[3];
        } else {
            result = expr.match(/\s*([\d\w]+)\s+in\s+(.+)/);
            if (!result) {
                throw "Wrong repeat: " + expr;
            }
            nameOfKey = result[1];
            expression = result[2];
        }
        return {key:nameOfKey, expression:expression};
    }, bind:function (definition) {
        definition = definition || this.definition;
        var context = this.context, element = this.element;
        var parsedExpr = this.parseExpr(definition);
        if (parsedExpr.key && parsedExpr.expression) {
            var fn = compileExpr(parsedExpr.expression, {}, context);
            var array = fn.apply(context);
            this.array = array;
        }
        this.childKey = parsedExpr.key;
        var dom = element;
        if (dom instanceof dorado.widget.Control) {
            dom = element._dom;
        }
        this.parentNodeId = dom.parentNode.id;
        this.parentNode = dom.parentNode;
        dom.parentNode.removeChild(dom);
        this.update();
    }, update:function () {
        var dom = this.element;
        if (dom instanceof dorado.widget.Control) {
            dom = element._dom;
        }
        if (!dom) {
            return;
        }
        var array = this.array;
        this.doRefreshList(array || []);
    }, rawUpdateDom:function (domRemoves, domInserts) {
        var container = this.parentNode || document.getElementById(this.parentNodeId);
        for (var i = 0, j = domRemoves.length; i < j; i++) {
            var toRemoveDom = domRemoves[i];
            container.removeChild(toRemoveDom.element);
        }
        for (var i = 0, j = domInserts.length; i < j; i++) {
            var insert = domInserts[i];
            if (insert.after) {
                $fly(insert.element).insertAfter(insert.after);
            } else {
                $fly(container).prepend(insert.element);
            }
        }
    }, _generateId:(function () {
        var seed = 1;
        return function () {
            return "repeat_item_" + seed++;
        };
    })(), getItemId:function (item) {
        if (item instanceof dorado.Entity) {
            return item.entityId;
        }
        return item[this._itemIdProperty];
    }, getNodeByItem:function (item) {
        var id = this.getItemId(item);
        if (id) {
            return this._itemsNodeById[id];
        }
        item[this._itemIdProperty] = this._generateId();
        return null;
    }, createChildEl:function (item) {
        var meta = this.meta, metaWrapper = {children:[meta], metaId:meta.metaId}, context = {};
        context[this.childKey] = item;
        var builder = new dorado.SmartBuilder(metaWrapper, context), dom = builder.build();
        return dom.firstChild;
    }, doRefreshList:function (data) {
        var nodes = this._itemsNode, itemsNodeById = this._itemsNodeById;
        if (!nodes) {
            nodes = this._itemsNode = [];
        }
        if (!itemsNodeById) {
            itemsNodeById = this._itemsNodeById = {};
        }
        var domInserts, domRemoves, item, lastElement, prevNodeNext, node, newNodes, prevNode;
        lastElement = findRefElement(this.element, this.parentNode || document.getElementById(this.parentNodeId));
        domInserts = [];
        domRemoves = [];
        newNodes = [];
        for (var i = 0, len = nodes.length; i < len; i++) {
            node = nodes[i];
            node.active = false;
        }
        var it;
        if (data instanceof Array) {
            it = new dorado.util.ArrayIterator(data);
        } else {
            it = data.iterator();
        }
        while (it.hasNext()) {
            item = it.next();
            node = itemsNodeById[this.getItemId(item)];
            if (node) {
                node.active = true;
            }
        }
        for (var k = 0, len2 = nodes.length; k < len2; k++) {
            node = nodes[k];
            if (node.active) {
                continue;
            }
            if (node.prev) {
                node.prev.next = node.next;
            }
            if (node.next) {
                node.next.prev = node.prev;
            }
            delete itemsNodeById[this.getItemId(node.item)];
            domRemoves.push({element:node.element});
        }
        prevNode = null;
        if (data instanceof Array) {
            it = new dorado.util.ArrayIterator(data);
        } else {
            it = data.iterator();
        }
        var l = 0;
        while (it.hasNext()) {
            item = it.next();
            item = item || {};
            l++;
            node = this.getNodeByItem(item);
            if (node) {
                if (node.prev === prevNode) {
                    prevNode = node;
                    lastElement = node.element;
                    node.active = true;
                    newNodes.push(node);
                    continue;
                }
                node.prev = prevNode;
                if (prevNode) {
                    prevNode.next = node;
                }
                domInserts.push({element:node.element, after:prevNode ? prevNode.element : null});
                lastElement = node.element;
                prevNode = node;
                node.active = true;
                newNodes.push(node);
                continue;
            }
            var element = this.createChildEl(item);
            domInserts.push({element:element, after:lastElement});
            var id = this.getItemId(item);
            node = {$id:id, element:element, prev:prevNode, next:null, active:true, item:item};
            itemsNodeById[id] = node;
            if (prevNode) {
                prevNodeNext = prevNode.next;
                prevNode.next = node;
                node.next = prevNodeNext;
                if (prevNodeNext) {
                    prevNodeNext.prev = node;
                }
            } else {
                if (l === 0 && nodes[0]) {
                    prevNodeNext = nodes[0];
                    node.next = prevNodeNext;
                    prevNodeNext.prev = node;
                }
            }
            prevNode = node;
            lastElement = element;
            newNodes.push(node);
        }
        this._itemsNode = newNodes;
        this.rawUpdateDom(domRemoves, domInserts);
    }});
    dorado.smart.directives.repeat = RepeatDirective;
})();
(function () {
    Function.prototype.computed = function (array) {
        if (array instanceof Array) {
            this._depends = array;
        } else {
            if (typeof array == "string") {
                this._depends = Array.prototype.slice.apply(arguments, arguments);
            }
        }
        return this;
    };
    var emptyArray = [];
    var EventEmitter = dorado.EventEmitter = function (context) {
        this.__context__ = context || this;
    };
    EventEmitter.prototype = {on:function (type, callback) {
        if (!type || !callback) {
            return;
        }
        var callbacks = this.__callbacks__;
        if (!callbacks) {
            callbacks = this.__callbacks__ = {};
        }
        var typeArray = callbacks[type];
        if (!typeArray) {
            typeArray = callbacks[type] = [];
        }
        typeArray.push({callback:callback});
        return this;
    }, once:function (type, callback) {
        if (!type || !callback) {
            return;
        }
        var callbacks = this.__callbacks__;
        if (!callbacks) {
            callbacks = this.__callbacks__ = {};
        }
        var typeArray = callbacks[type];
        if (!typeArray) {
            typeArray = callbacks[type] = [];
        }
        typeArray.push({once:true, callback:callback});
        return this;
    }, off:function (type, callback) {
        if (!type) {
            return;
        }
        var callbacks = this.__callbacks__;
        if (!callbacks) {
            return;
        }
        var typeArray = callbacks[type] || emptyArray;
        if (callback) {
            for (var i = 0, j = typeArray.length; i < j; i++) {
                var temp = typeArray[i];
                if (temp.callback == callback) {
                    typeArray.splice(i, 1);
                    break;
                }
            }
        } else {
            typeArray.splice(0, typeArray.length);
        }
        return this;
    }, emit:function (type, a, b, c, d) {
        if (!type) {
            return;
        }
        var callbacks = this.__callbacks__;
        if (!callbacks) {
            return;
        }
        var typeArray = callbacks[type] || emptyArray;
        for (var i = 0, j = typeArray.length; i < j; i++) {
            var option = typeArray[i], callback = option.callback;
            callback.call(this.__context__ || this, a, b, c, d);
            if (option.once) {
                typeArray.splice(i, 1);
                j--;
                i--;
            }
        }
        return this;
    }};
    EventEmitter.constructor = EventEmitter;
    var ObjectHolder = function (context) {
        this.__context__ = context || this;
    };
    ObjectHolder.prototype = new EventEmitter();
    var defineProperty = function (obj, propName, getter, setter) {
        try {
            Object.defineProperty(obj, propName, {get:getter, set:setter, enumerable:true, configurable:true});
        }
        catch (e2) {
            try {
                Object.prototype.__defineGetter__.call(obj, propName, getter);
                Object.prototype.__defineSetter__.call(obj, propName, setter);
            }
            catch (e3) {
                throw new Error("watchJS error: browser not supported :/");
            }
        }
    };
    var initHolder = function (object) {
        var __holder__ = new ObjectHolder();
        Object.defineProperty(object, "__holder__", {enumerable:false, configurable:true, value:__holder__});
    };
    var getHolderOfPath = function (obj, path) {
        if (!obj || !path) {
            return;
        }
        var paths = path.split("."), target = obj;
        for (var i = 0, j = paths.length; i < j; i++) {
            var subPath = paths[i], value = target[subPath];
            if (i == j - 1) {
                return target.__holder__;
            } else {
                if (value) {
                    target = value;
                } else {
                    return null;
                }
            }
        }
        return null;
    };
    var getPropNameOfPath = function (path) {
        if (!path) {
            return null;
        }
        var paths = path.split(".");
        if (paths) {
            return paths[path.length - 1];
        }
        return null;
    };
    var getter = function (obj, path) {
        if (!obj || !path) {
            return;
        }
        var paths = path.split("."), target = obj;
        for (var i = 0, j = paths.length; i < j; i++) {
            var subPath = paths[i];
            var value = target[subPath];
            if (i == j - 1) {
                return value;
            } else {
                if (value) {
                    target = value;
                } else {
                    return null;
                }
            }
        }
        return null;
    };
    var setter = function (obj, path, newValue) {
        if (!obj || !path) {
            return;
        }
        var paths = path.split("."), target = obj;
        for (var i = 0, j = paths.length; i < j; i++) {
            var subPath = paths[i], value = target[subPath];
            if (i == j - 1) {
                target[subPath] = newValue;
            } else {
                if (value) {
                    target = value;
                } else {
                    return;
                }
            }
        }
    };
    var catchingComputedProperty = false, computedPropertyDepends = null;
    var bdIdSeed = 1;
    function Binding(key) {
        this.id = bdIdSeed++;
        this.key = key;
        this.directives = [];
        this.subscribers = [];
        this.depends = [];
        this.value = undefined;
        this.isComputed = false;
        this.root = key.indexOf(".") == -1;
    }
    Binding.prototype = {update:function (value) {
        var directives = this.directives;
        for (var i = 0, j = directives.length; i < j; i++) {
            var dir = directives[i];
            dir.update();
        }
        var oldValue = this.value;
        this.value = value;
        var subscribers = this.subscribers;
        for (var i = 0, j = subscribers.length; i < j; i++) {
            var sub = subscribers[i];
            if (typeof sub == "function") {
                sub(value);
            } else {
                sub.update && sub.update(value);
            }
        }
    }};
    Binding.constructor = Binding;
    dorado.ViewModel = function (options) {
        options = options || {};
        var vm = this, data = options.data, methods = options.methods, computed = options.computed;
        vm.bindings = {};
        function defineComputedProperty(name, options) {
            var get, set, depends;
            if (typeof options == "object") {
                get = options.get;
                set = options.set;
                depends = options.depends;
            } else {
                if (typeof options == "function") {
                    get = options;
                    depends = get._depends;
                }
            }
            if (!depends && get) {
                catchingComputedProperty = true;
                computedPropertyDepends = [];
                get.apply(vm, []);
                depends = get._depends = computedPropertyDepends;
                catchingComputedProperty = false;
            }
            if (depends) {
                vm.connectComputed(name, depends);
            }
            if (!get) {
                return;
            }
            defineProperty(vm, name, function () {
                return get.apply(vm, []);
            }, function (value) {
                if (!set) {
                    return;
                }
                set.apply(vm, arguments);
            });
        }
        if (data) {
            watchObject(data, vm);
            vm.__holder__.on("set", function (key, val) {
                var bindings = vm.bindings;
                if (bindings[key]) {
                    bindings[key].update(val);
                }
            }).on("get", function (key) {
                if (catchingComputedProperty) {
                    computedPropertyDepends.push(key);
                }
            }).on("mutate", function (key, val) {
                var bindings = vm.bindings;
                if (bindings[key]) {
                    bindings[key].update(val);
                }
            });
        }
        if (methods) {
            for (var name in methods) {
                var method = methods[name];
                vm[name] = method;
            }
        }
        if (computed) {
            for (var name in computed) {
                defineComputedProperty(name, computed[name]);
            }
        }
    };
    function defineAccessor(object, prop, value) {
        var accessor = function (newValue) {
            if (newValue === undefined) {
                this.__holder__.emit("get", prop);
                return this.__holder__[prop];
            } else {
                var oldValue = this.__holder__[prop];
                if (typeof newValue == "object") {
                    unlinkFromParent(oldValue, prop, this.__holder__);
                    linkToParent(newValue, prop, this.__holder__);
                    this.__holder__[prop] = newValue;
                    if (newValue instanceof Array) {
                        object.__holder__.emit("set", prop + ".length", value.length);
                    }
                    object.__holder__.emit("set", prop, value);
                } else {
                    this.__holder__[prop] = newValue;
                    this.__holder__.emit("change:" + prop, newValue, oldValue);
                    this.__holder__.emit("set", prop, newValue);
                }
            }
        };
        object.__holder__[prop] = value;
        defineProperty(object, prop, accessor, accessor);
        if (typeof value == "object") {
            linkToParent(value, prop, object.__holder__);
        }
        if (value instanceof Array) {
            object.__holder__.emit("set", prop + ".length", value.length);
        }
        object.__holder__.emit("set", prop, value);
    }
    var linkToParent = function (object, prop, parent) {
        parent.proxies = parent.proxies || {};
        var path = prop + ".";
        var proxies = parent.proxies[path] = {set:function (key, val, propagate) {
            if (key) {
                parent.emit("set", path + key, val);
            }
            if (prop && propagate) {
            }
        }, get:function (key) {
            parent.emit("get", path + key);
        }, mutate:function (key, val, mutation) {
            var fullPath = key ? path + key : prop;
            parent.emit("mutate", fullPath, val, mutation);
            var method = mutation.method;
            if (method !== "sort" && method !== "reverse") {
                parent.emit("set", fullPath + ".length", val.length);
            }
        }};
        if (!object.__holder__) {
            initHolder(object);
        }
        object.__holder__.on("set", proxies.set).on("get", proxies.get).on("mutate", proxies.mutate);
        watch(object);
    };
    var unlinkFromParent = function (object, path, parent) {
        if (!object || !object.__holder__) {
            return;
        }
        path = path ? path + "." : "";
        var proxies = parent.proxies[path];
        if (!proxies) {
            return;
        }
        object.__holder__.off("set", proxies.set).off("get", proxies.get).off("mutate", proxies.mutate);
        parent.proxies[path] = null;
    };
    var watch = function (object) {
        if (object instanceof Array) {
            watchArray(object);
        } else {
            if (typeof object == "object") {
                watchObject(object);
            }
        }
    };
    var watchObject = function (source, target) {
        target = target || source;
        if (!target.__holder__) {
            initHolder(target);
        }
        for (var prop in source) {
            var value = source[prop];
            if (typeof value === "function") {
                continue;
            }
            defineAccessor(target, prop, value);
        }
    };
    var ArrayProxy = Object.create(Array.prototype), hasProto = true, slice = [].slice;
    var def = function (obj, key, val, enumerable, writable) {
        Object.defineProperty(obj, key, {value:val, enumerable:enumerable, writable:writable, configurable:true});
    };
    ["push", "pop", "shift", "unshift", "splice", "sort", "reverse"].forEach(function watchMutation(method) {
        def(ArrayProxy, method, function () {
            var args = slice.call(arguments), result = Array.prototype[method].apply(this, args), inserted, removed;
            if (method === "push" || method === "unshift") {
                inserted = args;
            } else {
                if (method === "pop" || method === "shift") {
                    removed = [result];
                } else {
                    if (method === "splice") {
                        inserted = args.slice(2);
                        removed = result;
                    }
                }
            }
            linkArrayElements(this, inserted);
            unlinkArrayElements(this, removed);
            this.__holder__.emit("mutate", "", this, {method:method, args:args, result:result, inserted:inserted, removed:removed});
            return result;
        }, !hasProto);
    });
    function linkArrayElements(arr, items) {
        if (items) {
            for (var i = 0, j = items.length; i < j; i++) {
                var item = items[i];
                if (typeof item == "object") {
                    if (!item.__holder__) {
                        watch(item);
                    }
                    var owners = item.__holder__.owners;
                    if (!owners) {
                        owners = item.__holder__.owners = [];
                    }
                    if (owners.indexOf(arr) < 0) {
                        owners.push(arr);
                    }
                }
            }
        }
    }
    function unlinkArrayElements(arr, items) {
        if (items) {
            for (var i = 0, j = items.length; i < j; i++) {
                var item = items[i];
                if (item && item.__holder__) {
                    var owners = item.__holder__.owners;
                    if (owners) {
                        owners.splice(owners.indexOf(arr), 1);
                    }
                }
            }
        }
    }
    var watchArray = function (array) {
        array.__proto__ = ArrayProxy;
        linkArrayElements(array, array);
    };
    dorado.ViewModel.prototype = {connectComputed:function (property, depends) {
        if (!property || !depends) {
            return;
        }
        var bindings = this.bindings, computedBinding = bindings[property];
        if (!computedBinding) {
            computedBinding = bindings[property] = new Binding(property);
            computedBinding.isComputed = true;
        }
        for (var i = 0, j = depends.length; i < j; i++) {
            var dependedProp = depends[i], dependedPropBinding = bindings[dependedProp];
            if (!dependedPropBinding) {
                dependedPropBinding = bindings[dependedProp] = new Binding(dependedProp);
            }
            dependedPropBinding.subscribers.push(computedBinding);
            computedBinding.depends.push(dependedPropBinding);
        }
        return computedBinding;
    }, watch:function (path, callback) {
        var bindings = this.bindings, binding = bindings[path];
        if (!binding) {
            bindings[path] = binding = new Binding(path);
        }
        binding.subscribers.push(callback);
    }, unwatch:function (attr, callback) {
        var bindings = this.bindings, binding = bindings[attr];
        if (!binding) {
            return;
        }
        var subs = binding.subscribers;
        if (!callback) {
            for (var i = 0, j = subs.length; i < j; i++) {
                var sub = subs[i];
                if (typeof sub == "function") {
                    subs.splice(i, 1);
                    i--;
                    j--;
                }
            }
        } else {
            for (var i = 0, j = subs.length; i < j; i++) {
                var sub = subs[i];
                if (typeof sub == "function" && sub == callback) {
                    subs.splice(i, 1);
                    break;
                }
            }
        }
    }, get:function (attrName) {
        return getter(this, attrName);
    }, set:function (attrName, value) {
        if (typeof attrName == "object") {
            for (var prop in attrName) {
                setter(this, prop, attrName[prop]);
            }
        } else {
            setter(this, attrName, value);
        }
    }};
    dorado.ViewModel.constructor = dorado.ViewModel;
})();
(function () {
    dorado.smart.registerSpecialTagResolver("Button", {createControl:function (tagName, attrs) {
        return new dorado.touch.Button(attrs);
    }});
    function createToggleOrCheckBox(tagName, attrs, context, directives) {
        var options = {};
        for (var attrName in attrs) {
            options[attrName] = attrs[attrName];
        }
        options.onPost = function (self) {
            var bindEntity = self._bindEntity, property = self._property;
            if (bindEntity && property) {
                bindEntity.set(property, self.get("value"));
            }
        };
        var property, entity = context.entity;
        for (var attrName in attrs) {
            var attrValue = attrs[attrName];
            if (attrName == "property") {
                property = attrValue;
                options.value = entity.get(property);
            }
        }
        var subControl = tagName == "CheckBox" ? new dorado.widget.CheckBox(options) : new dorado.touch.Toggle(options);
        subControl._bindEntity = entity;
        if (property) {
            directives.push({update:function () {
                subControl.set("value", subControl._bindEntity.get(property));
            }});
        }
        return subControl;
    }
    dorado.smart.registerSpecialTagResolver("CheckBox", {createControl:createToggleOrCheckBox});
    dorado.smart.registerSpecialTagResolver("Toggle", {createControl:createToggleOrCheckBox});
    dorado.SmartRenderer = $extend(dorado.Renderer, {$className:"dorado.SmartRenderer", constructor:function (options) {
        this.template = "";
        for (var option in options) {
            this[option] = options[option];
        }
    }, render:function (dom, context) {
        context = context || {};
        var renderer = this, item = context.data;
        if (!renderer.template) {
            return;
        }
        if (!context.dom) {
            context.dom = dom;
        }
        context.$url = $url;
        context.$resource = $resource;
        context.$filter = dorado.smart.getFilter;
        var events = renderer.listener;
        if (events) {
            for (var name in events) {
                var fn = events[name];
                if (!context[name]) {
                    context[name] = fn;
                }
            }
        }
        if (item != null) {
            if (item instanceof dorado.Entity) {
                context.entity = item;
                context.data = item.getWrapper({textMode:false, readOnly:true});
            } else {
                context.data = item;
            }
        }
        var isRendered = $fly(dom).data("smart-renderer-rendered"), directives;
        if (!isRendered) {
            $fly(dom).addClass("smart");
            var meta = dorado.SmartParser.resolveTemplate(this.template), builder = new dorado.SmartBuilder(meta, context);
            var fragment = builder.build();
            directives = builder.directives;
            dom.appendChild(fragment);
            dom.id = fragment.id;
            $fly(dom).data("smart-renderer-rendered", true);
            $fly(dom).data("smart-renderer-directives", directives);
        } else {
            directives = $fly(dom).data("smart-renderer-directives");
            if (directives) {
                for (var i = 0, j = directives.length; i < j; i++) {
                    var directive = directives[i], update = directive.update;
                    if (update) {
                        directive.update();
                    }
                }
            }
        }
    }});
})();

