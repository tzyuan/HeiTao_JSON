


if (!document.createElement("canvas").getContext) {
    (function () {
        var m = Math;
        var mr = m.round;
        var ms = m.sin;
        var mc = m.cos;
        var abs = m.abs;
        var sqrt = m.sqrt;
        var Z = 10;
        var Z2 = Z / 2;
        var IE_VERSION = +navigator.userAgent.match(/MSIE ([\d.]+)?/)[1];
        function getContext() {
            return this.context_ || (this.context_ = new CanvasRenderingContext2D_(this));
        }
        var slice = Array.prototype.slice;
        function bind(f, obj, var_args) {
            var a = slice.call(arguments, 2);
            return function () {
                return f.apply(obj, a.concat(slice.call(arguments)));
            };
        }
        function encodeHtmlAttribute(s) {
            return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
        }
        function addNamespace(doc, prefix, urn) {
            if (!doc.namespaces[prefix]) {
                doc.namespaces.add(prefix, urn, "#default#VML");
            }
        }
        function addNamespacesAndStylesheet(doc) {
            addNamespace(doc, "g_vml_", "urn:schemas-microsoft-com:vml");
            addNamespace(doc, "g_o_", "urn:schemas-microsoft-com:office:office");
            if (!doc.styleSheets["ex_canvas_"]) {
                var ss = doc.createStyleSheet();
                ss.owningElement.id = "ex_canvas_";
                ss.cssText = "canvas{display:inline-block;overflow:hidden;" + "text-align:left;width:300px;height:150px}";
            }
        }
        addNamespacesAndStylesheet(document);
        var G_vmlCanvasManager_ = {init:function (opt_doc) {
            var doc = opt_doc || document;
            doc.createElement("canvas");
            doc.attachEvent("onreadystatechange", bind(this.init_, this, doc));
        }, init_:function (doc) {
            var els = doc.getElementsByTagName("canvas");
            for (var i = 0; i < els.length; i++) {
                this.initElement(els[i]);
            }
        }, initElement:function (el) {
            if (!el.getContext) {
                el.getContext = getContext;
                addNamespacesAndStylesheet(el.ownerDocument);
                el.innerHTML = "";
                el.attachEvent("onpropertychange", onPropertyChange);
                el.attachEvent("onresize", onResize);
                var attrs = el.attributes;
                if (attrs.width && attrs.width.specified) {
                    el.style.width = attrs.width.nodeValue + "px";
                } else {
                    el.width = el.clientWidth;
                }
                if (attrs.height && attrs.height.specified) {
                    el.style.height = attrs.height.nodeValue + "px";
                } else {
                    el.height = el.clientHeight;
                }
            }
            return el;
        }};
        function onPropertyChange(e) {
            var el = e.srcElement;
            switch (e.propertyName) {
              case "width":
                el.getContext().clearRect();
                el.style.width = el.attributes.width.nodeValue + "px";
                el.firstChild.style.width = el.clientWidth + "px";
                break;
              case "height":
                el.getContext().clearRect();
                el.style.height = el.attributes.height.nodeValue + "px";
                el.firstChild.style.height = el.clientHeight + "px";
                break;
            }
        }
        function onResize(e) {
            var el = e.srcElement;
            if (el.firstChild) {
                el.firstChild.style.width = el.clientWidth + "px";
                el.firstChild.style.height = el.clientHeight + "px";
            }
        }
        G_vmlCanvasManager_.init();
        var decToHex = [];
        for (var i = 0; i < 16; i++) {
            for (var j = 0; j < 16; j++) {
                decToHex[i * 16 + j] = i.toString(16) + j.toString(16);
            }
        }
        function createMatrixIdentity() {
            return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
        }
        function matrixMultiply(m1, m2) {
            var result = createMatrixIdentity();
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    var sum = 0;
                    for (var z = 0; z < 3; z++) {
                        sum += m1[x][z] * m2[z][y];
                    }
                    result[x][y] = sum;
                }
            }
            return result;
        }
        function copyState(o1, o2) {
            o2.fillStyle = o1.fillStyle;
            o2.lineCap = o1.lineCap;
            o2.lineJoin = o1.lineJoin;
            o2.lineWidth = o1.lineWidth;
            o2.miterLimit = o1.miterLimit;
            o2.shadowBlur = o1.shadowBlur;
            o2.shadowColor = o1.shadowColor;
            o2.shadowOffsetX = o1.shadowOffsetX;
            o2.shadowOffsetY = o1.shadowOffsetY;
            o2.strokeStyle = o1.strokeStyle;
            o2.globalAlpha = o1.globalAlpha;
            o2.font = o1.font;
            o2.textAlign = o1.textAlign;
            o2.textBaseline = o1.textBaseline;
            o2.arcScaleX_ = o1.arcScaleX_;
            o2.arcScaleY_ = o1.arcScaleY_;
            o2.lineScale_ = o1.lineScale_;
        }
        var colorData = {aliceblue:"#F0F8FF", antiquewhite:"#FAEBD7", aquamarine:"#7FFFD4", azure:"#F0FFFF", beige:"#F5F5DC", bisque:"#FFE4C4", black:"#000000", blanchedalmond:"#FFEBCD", blueviolet:"#8A2BE2", brown:"#A52A2A", burlywood:"#DEB887", cadetblue:"#5F9EA0", chartreuse:"#7FFF00", chocolate:"#D2691E", coral:"#FF7F50", cornflowerblue:"#6495ED", cornsilk:"#FFF8DC", crimson:"#DC143C", cyan:"#00FFFF", darkblue:"#00008B", darkcyan:"#008B8B", darkgoldenrod:"#B8860B", darkgray:"#A9A9A9", darkgreen:"#006400", darkgrey:"#A9A9A9", darkkhaki:"#BDB76B", darkmagenta:"#8B008B", darkolivegreen:"#556B2F", darkorange:"#FF8C00", darkorchid:"#9932CC", darkred:"#8B0000", darksalmon:"#E9967A", darkseagreen:"#8FBC8F", darkslateblue:"#483D8B", darkslategray:"#2F4F4F", darkslategrey:"#2F4F4F", darkturquoise:"#00CED1", darkviolet:"#9400D3", deeppink:"#FF1493", deepskyblue:"#00BFFF", dimgray:"#696969", dimgrey:"#696969", dodgerblue:"#1E90FF", firebrick:"#B22222", floralwhite:"#FFFAF0", forestgreen:"#228B22", gainsboro:"#DCDCDC", ghostwhite:"#F8F8FF", gold:"#FFD700", goldenrod:"#DAA520", grey:"#808080", greenyellow:"#ADFF2F", honeydew:"#F0FFF0", hotpink:"#FF69B4", indianred:"#CD5C5C", indigo:"#4B0082", ivory:"#FFFFF0", khaki:"#F0E68C", lavender:"#E6E6FA", lavenderblush:"#FFF0F5", lawngreen:"#7CFC00", lemonchiffon:"#FFFACD", lightblue:"#ADD8E6", lightcoral:"#F08080", lightcyan:"#E0FFFF", lightgoldenrodyellow:"#FAFAD2", lightgreen:"#90EE90", lightgrey:"#D3D3D3", lightpink:"#FFB6C1", lightsalmon:"#FFA07A", lightseagreen:"#20B2AA", lightskyblue:"#87CEFA", lightslategray:"#778899", lightslategrey:"#778899", lightsteelblue:"#B0C4DE", lightyellow:"#FFFFE0", limegreen:"#32CD32", linen:"#FAF0E6", magenta:"#FF00FF", mediumaquamarine:"#66CDAA", mediumblue:"#0000CD", mediumorchid:"#BA55D3", mediumpurple:"#9370DB", mediumseagreen:"#3CB371", mediumslateblue:"#7B68EE", mediumspringgreen:"#00FA9A", mediumturquoise:"#48D1CC", mediumvioletred:"#C71585", midnightblue:"#191970", mintcream:"#F5FFFA", mistyrose:"#FFE4E1", moccasin:"#FFE4B5", navajowhite:"#FFDEAD", oldlace:"#FDF5E6", olivedrab:"#6B8E23", orange:"#FFA500", orangered:"#FF4500", orchid:"#DA70D6", palegoldenrod:"#EEE8AA", palegreen:"#98FB98", paleturquoise:"#AFEEEE", palevioletred:"#DB7093", papayawhip:"#FFEFD5", peachpuff:"#FFDAB9", peru:"#CD853F", pink:"#FFC0CB", plum:"#DDA0DD", powderblue:"#B0E0E6", rosybrown:"#BC8F8F", royalblue:"#4169E1", saddlebrown:"#8B4513", salmon:"#FA8072", sandybrown:"#F4A460", seagreen:"#2E8B57", seashell:"#FFF5EE", sienna:"#A0522D", skyblue:"#87CEEB", slateblue:"#6A5ACD", slategray:"#708090", slategrey:"#708090", snow:"#FFFAFA", springgreen:"#00FF7F", steelblue:"#4682B4", tan:"#D2B48C", thistle:"#D8BFD8", tomato:"#FF6347", turquoise:"#40E0D0", violet:"#EE82EE", wheat:"#F5DEB3", whitesmoke:"#F5F5F5", yellowgreen:"#9ACD32"};
        function getRgbHslContent(styleString) {
            var start = styleString.indexOf("(", 3);
            var end = styleString.indexOf(")", start + 1);
            var parts = styleString.substring(start + 1, end).split(",");
            if (parts.length != 4 || styleString.charAt(3) != "a") {
                parts[3] = 1;
            }
            return parts;
        }
        function percent(s) {
            return parseFloat(s) / 100;
        }
        function clamp(v, min, max) {
            return Math.min(max, Math.max(min, v));
        }
        function hslToRgb(parts) {
            var r, g, b, h, s, l;
            h = parseFloat(parts[0]) / 360 % 360;
            if (h < 0) {
                h++;
            }
            s = clamp(percent(parts[1]), 0, 1);
            l = clamp(percent(parts[2]), 0, 1);
            if (s == 0) {
                r = g = b = l;
            } else {
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hueToRgb(p, q, h + 1 / 3);
                g = hueToRgb(p, q, h);
                b = hueToRgb(p, q, h - 1 / 3);
            }
            return "#" + decToHex[~~(r * 255)] + decToHex[~~(g * 255)] + decToHex[~~(b * 255)];
        }
        function hueToRgb(m1, m2, h) {
            if (h < 0) {
                h++;
            }
            if (h > 1) {
                h--;
            }
            if (6 * h < 1) {
                return m1 + (m2 - m1) * 6 * h;
            } else {
                if (2 * h < 1) {
                    return m2;
                } else {
                    if (3 * h < 2) {
                        return m1 + (m2 - m1) * (2 / 3 - h) * 6;
                    } else {
                        return m1;
                    }
                }
            }
        }
        var processStyleCache = {};
        function processStyle(styleString) {
            if (styleString in processStyleCache) {
                return processStyleCache[styleString];
            }
            var str, alpha = 1;
            styleString = String(styleString);
            if (styleString.charAt(0) == "#") {
                str = styleString;
            } else {
                if (/^rgb/.test(styleString)) {
                    var parts = getRgbHslContent(styleString);
                    var str = "#", n;
                    for (var i = 0; i < 3; i++) {
                        if (parts[i].indexOf("%") != -1) {
                            n = ~~(percent(parts[i]) * 255);
                        } else {
                            n = +parts[i];
                        }
                        str += decToHex[clamp(n, 0, 255)];
                    }
                    alpha = +parts[3];
                } else {
                    if (/^hsl/.test(styleString)) {
                        var parts = getRgbHslContent(styleString);
                        str = hslToRgb(parts);
                        alpha = parts[3];
                    } else {
                        str = colorData[styleString] || styleString;
                    }
                }
            }
            return processStyleCache[styleString] = {color:str, alpha:alpha};
        }
        var DEFAULT_STYLE = {style:"normal", variant:"normal", weight:"normal", size:10, family:"sans-serif"};
        var fontStyleCache = {};
        function processFontStyle(styleString) {
            if (fontStyleCache[styleString]) {
                return fontStyleCache[styleString];
            }
            var el = document.createElement("div");
            var style = el.style;
            try {
                style.font = styleString;
            }
            catch (ex) {
            }
            return fontStyleCache[styleString] = {style:style.fontStyle || DEFAULT_STYLE.style, variant:style.fontVariant || DEFAULT_STYLE.variant, weight:style.fontWeight || DEFAULT_STYLE.weight, size:style.fontSize || DEFAULT_STYLE.size, family:style.fontFamily || DEFAULT_STYLE.family};
        }
        function getComputedStyle(style, element) {
            var computedStyle = {};
            for (var p in style) {
                computedStyle[p] = style[p];
            }
            var canvasFontSize = parseFloat(element.currentStyle.fontSize), fontSize = parseFloat(style.size);
            if (typeof style.size == "number") {
                computedStyle.size = style.size;
            } else {
                if (style.size.indexOf("px") != -1) {
                    computedStyle.size = fontSize;
                } else {
                    if (style.size.indexOf("em") != -1) {
                        computedStyle.size = canvasFontSize * fontSize;
                    } else {
                        if (style.size.indexOf("%") != -1) {
                            computedStyle.size = (canvasFontSize / 100) * fontSize;
                        } else {
                            if (style.size.indexOf("pt") != -1) {
                                computedStyle.size = fontSize / 0.75;
                            } else {
                                computedStyle.size = canvasFontSize;
                            }
                        }
                    }
                }
            }
            computedStyle.size *= 0.981;
            return computedStyle;
        }
        function buildStyle(style) {
            return style.style + " " + style.variant + " " + style.weight + " " + style.size + "px " + style.family;
        }
        var lineCapMap = {"butt":"flat", "round":"round"};
        function processLineCap(lineCap) {
            return lineCapMap[lineCap] || "square";
        }
        function CanvasRenderingContext2D_(canvasElement) {
            this.m_ = createMatrixIdentity();
            this.mStack_ = [];
            this.aStack_ = [];
            this.currentPath_ = [];
            this.strokeStyle = "#000";
            this.fillStyle = "#000";
            this.lineWidth = 1;
            this.lineJoin = "miter";
            this.lineCap = "butt";
            this.miterLimit = Z * 1;
            this.globalAlpha = 1;
            this.font = "10px sans-serif";
            this.textAlign = "left";
            this.textBaseline = "alphabetic";
            this.canvas = canvasElement;
            var cssText = "width:" + canvasElement.clientWidth + "px;height:" + canvasElement.clientHeight + "px;overflow:hidden;position:absolute";
            var el = canvasElement.ownerDocument.createElement("div");
            el.style.cssText = cssText;
            canvasElement.appendChild(el);
            var overlayEl = el.cloneNode(false);
            overlayEl.style.backgroundColor = "red";
            overlayEl.style.filter = "alpha(opacity=0)";
            canvasElement.appendChild(overlayEl);
            this.element_ = el;
            this.arcScaleX_ = 1;
            this.arcScaleY_ = 1;
            this.lineScale_ = 1;
        }
        var contextPrototype = CanvasRenderingContext2D_.prototype;
        contextPrototype.clearRect = function () {
            if (this.textMeasureEl_) {
                this.textMeasureEl_.removeNode(true);
                this.textMeasureEl_ = null;
            }
            this.element_.innerHTML = "";
        };
        contextPrototype.beginPath = function () {
            this.currentPath_ = [];
        };
        contextPrototype.moveTo = function (aX, aY) {
            var p = getCoords(this, aX, aY);
            this.currentPath_.push({type:"moveTo", x:p.x, y:p.y});
            this.currentX_ = p.x;
            this.currentY_ = p.y;
        };
        contextPrototype.lineTo = function (aX, aY) {
            var p = getCoords(this, aX, aY);
            this.currentPath_.push({type:"lineTo", x:p.x, y:p.y});
            this.currentX_ = p.x;
            this.currentY_ = p.y;
        };
        contextPrototype.bezierCurveTo = function (aCP1x, aCP1y, aCP2x, aCP2y, aX, aY) {
            var p = getCoords(this, aX, aY);
            var cp1 = getCoords(this, aCP1x, aCP1y);
            var cp2 = getCoords(this, aCP2x, aCP2y);
            bezierCurveTo(this, cp1, cp2, p);
        };
        function bezierCurveTo(self, cp1, cp2, p) {
            self.currentPath_.push({type:"bezierCurveTo", cp1x:cp1.x, cp1y:cp1.y, cp2x:cp2.x, cp2y:cp2.y, x:p.x, y:p.y});
            self.currentX_ = p.x;
            self.currentY_ = p.y;
        }
        contextPrototype.quadraticCurveTo = function (aCPx, aCPy, aX, aY) {
            var cp = getCoords(this, aCPx, aCPy);
            var p = getCoords(this, aX, aY);
            var cp1 = {x:this.currentX_ + 2 / 3 * (cp.x - this.currentX_), y:this.currentY_ + 2 / 3 * (cp.y - this.currentY_)};
            var cp2 = {x:cp1.x + (p.x - this.currentX_) / 3, y:cp1.y + (p.y - this.currentY_) / 3};
            bezierCurveTo(this, cp1, cp2, p);
        };
        contextPrototype.arc = function (aX, aY, aRadius, aStartAngle, aEndAngle, aClockwise) {
            aRadius *= Z;
            var arcType = aClockwise ? "at" : "wa";
            var xStart = aX + mc(aStartAngle) * aRadius - Z2;
            var yStart = aY + ms(aStartAngle) * aRadius - Z2;
            var xEnd = aX + mc(aEndAngle) * aRadius - Z2;
            var yEnd = aY + ms(aEndAngle) * aRadius - Z2;
            if (xStart == xEnd && !aClockwise) {
                xStart += 0.125;
            }
            var p = getCoords(this, aX, aY);
            var pStart = getCoords(this, xStart, yStart);
            var pEnd = getCoords(this, xEnd, yEnd);
            this.currentPath_.push({type:arcType, x:p.x, y:p.y, radius:aRadius, xStart:pStart.x, yStart:pStart.y, xEnd:pEnd.x, yEnd:pEnd.y});
        };
        contextPrototype.rect = function (aX, aY, aWidth, aHeight) {
            this.moveTo(aX, aY);
            this.lineTo(aX + aWidth, aY);
            this.lineTo(aX + aWidth, aY + aHeight);
            this.lineTo(aX, aY + aHeight);
            this.closePath();
        };
        contextPrototype.strokeRect = function (aX, aY, aWidth, aHeight) {
            var oldPath = this.currentPath_;
            this.beginPath();
            this.moveTo(aX, aY);
            this.lineTo(aX + aWidth, aY);
            this.lineTo(aX + aWidth, aY + aHeight);
            this.lineTo(aX, aY + aHeight);
            this.closePath();
            this.stroke();
            this.currentPath_ = oldPath;
        };
        contextPrototype.fillRect = function (aX, aY, aWidth, aHeight) {
            var oldPath = this.currentPath_;
            this.beginPath();
            this.moveTo(aX, aY);
            this.lineTo(aX + aWidth, aY);
            this.lineTo(aX + aWidth, aY + aHeight);
            this.lineTo(aX, aY + aHeight);
            this.closePath();
            this.fill();
            this.currentPath_ = oldPath;
        };
        contextPrototype.createLinearGradient = function (aX0, aY0, aX1, aY1) {
            var gradient = new CanvasGradient_("gradient");
            gradient.x0_ = aX0;
            gradient.y0_ = aY0;
            gradient.x1_ = aX1;
            gradient.y1_ = aY1;
            return gradient;
        };
        contextPrototype.createRadialGradient = function (aX0, aY0, aR0, aX1, aY1, aR1) {
            var gradient = new CanvasGradient_("gradientradial");
            gradient.x0_ = aX0;
            gradient.y0_ = aY0;
            gradient.r0_ = aR0;
            gradient.x1_ = aX1;
            gradient.y1_ = aY1;
            gradient.r1_ = aR1;
            return gradient;
        };
        contextPrototype.drawImage = function (image, var_args) {
            var dx, dy, dw, dh, sx, sy, sw, sh;
            var oldRuntimeWidth = image.runtimeStyle.width;
            var oldRuntimeHeight = image.runtimeStyle.height;
            image.runtimeStyle.width = "auto";
            image.runtimeStyle.height = "auto";
            var w = image.width;
            var h = image.height;
            image.runtimeStyle.width = oldRuntimeWidth;
            image.runtimeStyle.height = oldRuntimeHeight;
            if (arguments.length == 3) {
                dx = arguments[1];
                dy = arguments[2];
                sx = sy = 0;
                sw = dw = w;
                sh = dh = h;
            } else {
                if (arguments.length == 5) {
                    dx = arguments[1];
                    dy = arguments[2];
                    dw = arguments[3];
                    dh = arguments[4];
                    sx = sy = 0;
                    sw = w;
                    sh = h;
                } else {
                    if (arguments.length == 9) {
                        sx = arguments[1];
                        sy = arguments[2];
                        sw = arguments[3];
                        sh = arguments[4];
                        dx = arguments[5];
                        dy = arguments[6];
                        dw = arguments[7];
                        dh = arguments[8];
                    } else {
                        throw Error("Invalid number of arguments");
                    }
                }
            }
            var d = getCoords(this, dx, dy);
            var w2 = sw / 2;
            var h2 = sh / 2;
            var vmlStr = [];
            var W = 10;
            var H = 10;
            vmlStr.push(" <g_vml_:group", " coordsize=\"", Z * W, ",", Z * H, "\"", " coordorigin=\"0,0\"", " style=\"width:", W, "px;height:", H, "px;position:absolute;");
            if (this.m_[0][0] != 1 || this.m_[0][1] || this.m_[1][1] != 1 || this.m_[1][0]) {
                var filter = [];
                filter.push("M11=", this.m_[0][0], ",", "M12=", this.m_[1][0], ",", "M21=", this.m_[0][1], ",", "M22=", this.m_[1][1], ",", "Dx=", mr(d.x / Z), ",", "Dy=", mr(d.y / Z), "");
                var max = d;
                var c2 = getCoords(this, dx + dw, dy);
                var c3 = getCoords(this, dx, dy + dh);
                var c4 = getCoords(this, dx + dw, dy + dh);
                max.x = m.max(max.x, c2.x, c3.x, c4.x);
                max.y = m.max(max.y, c2.y, c3.y, c4.y);
                vmlStr.push("padding:0 ", mr(max.x / Z), "px ", mr(max.y / Z), "px 0;filter:progid:DXImageTransform.Microsoft.Matrix(", filter.join(""), ", sizingmethod='clip');");
            } else {
                vmlStr.push("top:", mr(d.y / Z), "px;left:", mr(d.x / Z), "px;");
            }
            vmlStr.push(" \">", "<g_vml_:image src=\"", image.src, "\"", " style=\"width:", Z * dw, "px;", " height:", Z * dh, "px\"", " cropleft=\"", sx / w, "\"", " croptop=\"", sy / h, "\"", " cropright=\"", (w - sx - sw) / w, "\"", " cropbottom=\"", (h - sy - sh) / h, "\"", " />", "</g_vml_:group>");
            this.element_.insertAdjacentHTML("BeforeEnd", vmlStr.join(""));
        };
        contextPrototype.stroke = function (aFill) {
            var lineStr = [];
            var lineOpen = false;
            var W = 10;
            var H = 10;
            lineStr.push("<g_vml_:shape", " filled=\"", !!aFill, "\"", " style=\"position:absolute;width:", W, "px;height:", H, "px;\"", " coordorigin=\"0,0\"", " coordsize=\"", Z * W, ",", Z * H, "\"", " stroked=\"", !aFill, "\"", " path=\"");
            var newSeq = false;
            var min = {x:null, y:null};
            var max = {x:null, y:null};
            for (var i = 0; i < this.currentPath_.length; i++) {
                var p = this.currentPath_[i];
                var c;
                switch (p.type) {
                  case "moveTo":
                    c = p;
                    lineStr.push(" m ", mr(p.x), ",", mr(p.y));
                    break;
                  case "lineTo":
                    lineStr.push(" l ", mr(p.x), ",", mr(p.y));
                    break;
                  case "close":
                    lineStr.push(" x ");
                    p = null;
                    break;
                  case "bezierCurveTo":
                    lineStr.push(" c ", mr(p.cp1x), ",", mr(p.cp1y), ",", mr(p.cp2x), ",", mr(p.cp2y), ",", mr(p.x), ",", mr(p.y));
                    break;
                  case "at":
                  case "wa":
                    lineStr.push(" ", p.type, " ", mr(p.x - this.arcScaleX_ * p.radius), ",", mr(p.y - this.arcScaleY_ * p.radius), " ", mr(p.x + this.arcScaleX_ * p.radius), ",", mr(p.y + this.arcScaleY_ * p.radius), " ", mr(p.xStart), ",", mr(p.yStart), " ", mr(p.xEnd), ",", mr(p.yEnd));
                    break;
                }
                if (p) {
                    if (min.x == null || p.x < min.x) {
                        min.x = p.x;
                    }
                    if (max.x == null || p.x > max.x) {
                        max.x = p.x;
                    }
                    if (min.y == null || p.y < min.y) {
                        min.y = p.y;
                    }
                    if (max.y == null || p.y > max.y) {
                        max.y = p.y;
                    }
                }
            }
            lineStr.push(" \">");
            if (!aFill) {
                appendStroke(this, lineStr);
            } else {
                appendFill(this, lineStr, min, max);
            }
            lineStr.push("</g_vml_:shape>");
            this.element_.insertAdjacentHTML("beforeEnd", lineStr.join(""));
        };
        function appendStroke(ctx, lineStr) {
            var a = processStyle(ctx.strokeStyle);
            var color = a.color;
            var opacity = a.alpha * ctx.globalAlpha;
            var lineWidth = ctx.lineScale_ * ctx.lineWidth;
            if (lineWidth < 1) {
                opacity *= lineWidth;
            }
            lineStr.push("<g_vml_:stroke", " opacity=\"", opacity, "\"", " joinstyle=\"", ctx.lineJoin, "\"", " miterlimit=\"", ctx.miterLimit, "\"", " endcap=\"", processLineCap(ctx.lineCap), "\"", " weight=\"", lineWidth, "px\"", " color=\"", color, "\" />");
        }
        function appendFill(ctx, lineStr, min, max) {
            var fillStyle = ctx.fillStyle;
            var arcScaleX = ctx.arcScaleX_;
            var arcScaleY = ctx.arcScaleY_;
            var width = max.x - min.x;
            var height = max.y - min.y;
            if (fillStyle instanceof CanvasGradient_) {
                var angle = 0;
                var focus = {x:0, y:0};
                var shift = 0;
                var expansion = 1;
                if (fillStyle.type_ == "gradient") {
                    var x0 = fillStyle.x0_ / arcScaleX;
                    var y0 = fillStyle.y0_ / arcScaleY;
                    var x1 = fillStyle.x1_ / arcScaleX;
                    var y1 = fillStyle.y1_ / arcScaleY;
                    var p0 = getCoords(ctx, x0, y0);
                    var p1 = getCoords(ctx, x1, y1);
                    var dx = p1.x - p0.x;
                    var dy = p1.y - p0.y;
                    angle = Math.atan2(dx, dy) * 180 / Math.PI;
                    if (angle < 0) {
                        angle += 360;
                    }
                    if (angle < 0.000001) {
                        angle = 0;
                    }
                } else {
                    var p0 = getCoords(ctx, fillStyle.x0_, fillStyle.y0_);
                    focus = {x:(p0.x - min.x) / width, y:(p0.y - min.y) / height};
                    width /= arcScaleX * Z;
                    height /= arcScaleY * Z;
                    var dimension = m.max(width, height);
                    shift = 2 * fillStyle.r0_ / dimension;
                    expansion = 2 * fillStyle.r1_ / dimension - shift;
                }
                var stops = fillStyle.colors_;
                stops.sort(function (cs1, cs2) {
                    return cs1.offset - cs2.offset;
                });
                var length = stops.length;
                var color1 = stops[0].color;
                var color2 = stops[length - 1].color;
                var opacity1 = stops[0].alpha * ctx.globalAlpha;
                var opacity2 = stops[length - 1].alpha * ctx.globalAlpha;
                var colors = [];
                for (var i = 0; i < length; i++) {
                    var stop = stops[i];
                    colors.push(stop.offset * expansion + shift + " " + stop.color);
                }
                lineStr.push("<g_vml_:fill type=\"", fillStyle.type_, "\"", " method=\"none\" focus=\"100%\"", " color=\"", color1, "\"", " color2=\"", color2, "\"", " colors=\"", colors.join(","), "\"", " opacity=\"", opacity2, "\"", " g_o_:opacity2=\"", opacity1, "\"", " angle=\"", angle, "\"", " focusposition=\"", focus.x, ",", focus.y, "\" />");
            } else {
                if (fillStyle instanceof CanvasPattern_) {
                    if (width && height) {
                        var deltaLeft = -min.x;
                        var deltaTop = -min.y;
                        lineStr.push("<g_vml_:fill", " position=\"", deltaLeft / width * arcScaleX * arcScaleX, ",", deltaTop / height * arcScaleY * arcScaleY, "\"", " type=\"tile\"", " src=\"", fillStyle.src_, "\" />");
                    }
                } else {
                    var a = processStyle(ctx.fillStyle);
                    var color = a.color;
                    var opacity = a.alpha * ctx.globalAlpha;
                    lineStr.push("<g_vml_:fill color=\"", color, "\" opacity=\"", opacity, "\" />");
                }
            }
        }
        contextPrototype.fill = function () {
            this.stroke(true);
        };
        contextPrototype.closePath = function () {
            this.currentPath_.push({type:"close"});
        };
        function getCoords(ctx, aX, aY) {
            var m = ctx.m_;
            return {x:Z * (aX * m[0][0] + aY * m[1][0] + m[2][0]) - Z2, y:Z * (aX * m[0][1] + aY * m[1][1] + m[2][1]) - Z2};
        }
        contextPrototype.save = function () {
            var o = {};
            copyState(this, o);
            this.aStack_.push(o);
            this.mStack_.push(this.m_);
            this.m_ = matrixMultiply(createMatrixIdentity(), this.m_);
        };
        contextPrototype.restore = function () {
            if (this.aStack_.length) {
                copyState(this.aStack_.pop(), this);
                this.m_ = this.mStack_.pop();
            }
        };
        function matrixIsFinite(m) {
            return isFinite(m[0][0]) && isFinite(m[0][1]) && isFinite(m[1][0]) && isFinite(m[1][1]) && isFinite(m[2][0]) && isFinite(m[2][1]);
        }
        function setM(ctx, m, updateLineScale) {
            if (!matrixIsFinite(m)) {
                return;
            }
            ctx.m_ = m;
            if (updateLineScale) {
                var det = m[0][0] * m[1][1] - m[0][1] * m[1][0];
                ctx.lineScale_ = sqrt(abs(det));
            }
        }
        contextPrototype.translate = function (aX, aY) {
            var m1 = [[1, 0, 0], [0, 1, 0], [aX, aY, 1]];
            setM(this, matrixMultiply(m1, this.m_), false);
        };
        contextPrototype.rotate = function (aRot) {
            var c = mc(aRot);
            var s = ms(aRot);
            var m1 = [[c, s, 0], [-s, c, 0], [0, 0, 1]];
            setM(this, matrixMultiply(m1, this.m_), false);
        };
        contextPrototype.scale = function (aX, aY) {
            this.arcScaleX_ *= aX;
            this.arcScaleY_ *= aY;
            var m1 = [[aX, 0, 0], [0, aY, 0], [0, 0, 1]];
            setM(this, matrixMultiply(m1, this.m_), true);
        };
        contextPrototype.transform = function (m11, m12, m21, m22, dx, dy) {
            var m1 = [[m11, m12, 0], [m21, m22, 0], [dx, dy, 1]];
            setM(this, matrixMultiply(m1, this.m_), true);
        };
        contextPrototype.setTransform = function (m11, m12, m21, m22, dx, dy) {
            var m = [[m11, m12, 0], [m21, m22, 0], [dx, dy, 1]];
            setM(this, m, true);
        };
        contextPrototype.drawText_ = function (text, x, y, maxWidth, stroke) {
            var m = this.m_, delta = 1000, left = 0, right = delta, offset = {x:0, y:0}, lineStr = [];
            var fontStyle = getComputedStyle(processFontStyle(this.font), this.element_);
            var fontStyleString = buildStyle(fontStyle);
            var elementStyle = this.element_.currentStyle;
            var textAlign = this.textAlign.toLowerCase();
            switch (textAlign) {
              case "left":
              case "center":
              case "right":
                break;
              case "end":
                textAlign = elementStyle.direction == "ltr" ? "right" : "left";
                break;
              case "start":
                textAlign = elementStyle.direction == "rtl" ? "right" : "left";
                break;
              default:
                textAlign = "left";
            }
            switch (this.textBaseline) {
              case "hanging":
              case "top":
                offset.y = fontStyle.size / 1.75;
                break;
              case "middle":
                break;
              default:
              case null:
              case "alphabetic":
              case "ideographic":
              case "bottom":
                offset.y = -fontStyle.size / 2.25;
                break;
            }
            switch (textAlign) {
              case "right":
                left = delta;
                right = 0.05;
                break;
              case "center":
                left = right = delta / 2;
                break;
            }
            var d = getCoords(this, x + offset.x, y + offset.y);
            lineStr.push("<g_vml_:line from=\"", -left, " 0\" to=\"", right, " 0.05\" ", " coordsize=\"100 100\" coordorigin=\"0 0\"", " filled=\"", !stroke, "\" stroked=\"", !!stroke, "\" style=\"position:absolute;width:1px;height:1px;\">");
            if (stroke) {
                appendStroke(this, lineStr);
            } else {
                appendFill(this, lineStr, {x:-left, y:0}, {x:right, y:fontStyle.size});
            }
            var skewM = m[0][0].toFixed(3) + "," + m[1][0].toFixed(3) + "," + m[0][1].toFixed(3) + "," + m[1][1].toFixed(3) + ",0,0";
            var skewOffset = mr(d.x / Z) + "," + mr(d.y / Z);
            lineStr.push("<g_vml_:skew on=\"t\" matrix=\"", skewM, "\" ", " offset=\"", skewOffset, "\" origin=\"", left, " 0\" />", "<g_vml_:path textpathok=\"true\" />", "<g_vml_:textpath on=\"true\" string=\"", encodeHtmlAttribute(text), "\" style=\"v-text-align:", textAlign, ";font:", encodeHtmlAttribute(fontStyleString), "\" /></g_vml_:line>");
            this.element_.insertAdjacentHTML("beforeEnd", lineStr.join(""));
        };
        contextPrototype.fillText = function (text, x, y, maxWidth) {
            this.drawText_(text, x, y, maxWidth, false);
        };
        contextPrototype.strokeText = function (text, x, y, maxWidth) {
            this.drawText_(text, x, y, maxWidth, true);
        };
        contextPrototype.measureText = function (text) {
            if (!this.textMeasureEl_) {
                var s = "<span style=\"position:absolute;" + "top:-20000px;left:0;padding:0;margin:0;border:none;" + "white-space:pre;\"></span>";
                this.element_.insertAdjacentHTML("beforeEnd", s);
                this.textMeasureEl_ = this.element_.lastChild;
            }
            var doc = this.element_.ownerDocument;
            this.textMeasureEl_.innerHTML = "";
            this.textMeasureEl_.style.font = this.font;
            this.textMeasureEl_.appendChild(doc.createTextNode(text));
            return {width:this.textMeasureEl_.offsetWidth};
        };
        contextPrototype.clip = function () {
        };
        contextPrototype.arcTo = function () {
        };
        contextPrototype.createPattern = function (image, repetition) {
            return new CanvasPattern_(image, repetition);
        };
        function CanvasGradient_(aType) {
            this.type_ = aType;
            this.x0_ = 0;
            this.y0_ = 0;
            this.r0_ = 0;
            this.x1_ = 0;
            this.y1_ = 0;
            this.r1_ = 0;
            this.colors_ = [];
        }
        CanvasGradient_.prototype.addColorStop = function (aOffset, aColor) {
            aColor = processStyle(aColor);
            this.colors_.push({offset:aOffset, color:aColor.color, alpha:aColor.alpha});
        };
        function CanvasPattern_(image, repetition) {
            assertImageIsValid(image);
            switch (repetition) {
              case "repeat":
              case null:
              case "":
                this.repetition_ = "repeat";
                break;
              case "repeat-x":
              case "repeat-y":
              case "no-repeat":
                this.repetition_ = repetition;
                break;
              default:
                throwException("SYNTAX_ERR");
            }
            this.src_ = image.src;
            this.width_ = image.width;
            this.height_ = image.height;
        }
        function throwException(s) {
            throw new DOMException_(s);
        }
        function assertImageIsValid(img) {
            if (!img || img.nodeType != 1 || img.tagName != "IMG") {
                throwException("TYPE_MISMATCH_ERR");
            }
            if (img.readyState != "complete") {
                throwException("INVALID_STATE_ERR");
            }
        }
        function DOMException_(s) {
            this.code = this[s];
            this.message = s + ": DOM Exception " + this.code;
        }
        var p = DOMException_.prototype = new Error;
        p.INDEX_SIZE_ERR = 1;
        p.DOMSTRING_SIZE_ERR = 2;
        p.HIERARCHY_REQUEST_ERR = 3;
        p.WRONG_DOCUMENT_ERR = 4;
        p.INVALID_CHARACTER_ERR = 5;
        p.NO_DATA_ALLOWED_ERR = 6;
        p.NO_MODIFICATION_ALLOWED_ERR = 7;
        p.NOT_FOUND_ERR = 8;
        p.NOT_SUPPORTED_ERR = 9;
        p.INUSE_ATTRIBUTE_ERR = 10;
        p.INVALID_STATE_ERR = 11;
        p.SYNTAX_ERR = 12;
        p.INVALID_MODIFICATION_ERR = 13;
        p.NAMESPACE_ERR = 14;
        p.INVALID_ACCESS_ERR = 15;
        p.VALIDATION_ERR = 16;
        p.TYPE_MISMATCH_ERR = 17;
        G_vmlCanvasManager = G_vmlCanvasManager_;
        CanvasRenderingContext2D = CanvasRenderingContext2D_;
        CanvasGradient = CanvasGradient_;
        CanvasPattern = CanvasPattern_;
        DOMException = DOMException_;
    })();
}
var fabric = fabric || {version:"1.3.7"};
if (typeof exports !== "undefined") {
    exports.fabric = fabric;
}
if (typeof document !== "undefined" && typeof window !== "undefined") {
    fabric.document = document;
    fabric.window = window;
} else {
    fabric.document = require("jsdom").jsdom("<!DOCTYPE html><html><head></head><body></body></html>");
    fabric.window = fabric.document.createWindow();
}
fabric.isTouchSupported = "ontouchstart" in fabric.document.documentElement;
fabric.isLikelyNode = typeof Buffer !== "undefined" && typeof window === "undefined";
var Cufon = (function () {
    var api = function () {
        return api.replace.apply(null, arguments);
    };
    var DOM = api.DOM = {ready:(function () {
        var complete = false, readyStatus = {loaded:1, complete:1};
        var queue = [], perform = function () {
            if (complete) {
                return;
            }
            complete = true;
            for (var fn; fn = queue.shift(); fn()) {
            }
        };
        if (fabric.document.addEventListener) {
            fabric.document.addEventListener("DOMContentLoaded", perform, false);
            fabric.window.addEventListener("pageshow", perform, false);
        }
        if (!fabric.window.opera && fabric.document.readyState) {
            (function () {
                readyStatus[fabric.document.readyState] ? perform() : setTimeout(arguments.callee, 10);
            })();
        }
        if (fabric.document.readyState && fabric.document.createStyleSheet) {
            (function () {
                try {
                    fabric.document.body.doScroll("left");
                    perform();
                }
                catch (e) {
                    setTimeout(arguments.callee, 1);
                }
            })();
        }
        addEvent(fabric.window, "load", perform);
        return function (listener) {
            if (!arguments.length) {
                perform();
            } else {
                complete ? listener() : queue.push(listener);
            }
        };
    })()};
    var CSS = api.CSS = {Size:function (value, base) {
        this.value = parseFloat(value);
        this.unit = String(value).match(/[a-z%]*$/)[0] || "px";
        this.convert = function (value) {
            return value / base * this.value;
        };
        this.convertFrom = function (value) {
            return value / this.value * base;
        };
        this.toString = function () {
            return this.value + this.unit;
        };
    }, getStyle:function (el) {
        return new Style(el.style);
    }, quotedList:cached(function (value) {
        var list = [], re = /\s*((["'])([\s\S]*?[^\\])\2|[^,]+)\s*/g, match;
        while (match = re.exec(value)) {
            list.push(match[3] || match[1]);
        }
        return list;
    }), ready:(function () {
        var complete = false;
        var queue = [], perform = function () {
            complete = true;
            for (var fn; fn = queue.shift(); fn()) {
            }
        };
        var styleElements = Object.prototype.propertyIsEnumerable ? elementsByTagName("style") : {length:0};
        var linkElements = elementsByTagName("link");
        DOM.ready(function () {
            var linkStyles = 0, link;
            for (var i = 0, l = linkElements.length; link = linkElements[i], i < l; ++i) {
                if (!link.disabled && link.rel.toLowerCase() == "stylesheet") {
                    ++linkStyles;
                }
            }
            if (fabric.document.styleSheets.length >= styleElements.length + linkStyles) {
                perform();
            } else {
                setTimeout(arguments.callee, 10);
            }
        });
        return function (listener) {
            if (complete) {
                listener();
            } else {
                queue.push(listener);
            }
        };
    })(), supports:function (property, value) {
        var checker = fabric.document.createElement("span").style;
        if (checker[property] === undefined) {
            return false;
        }
        checker[property] = value;
        return checker[property] === value;
    }, textAlign:function (word, style, position, wordCount) {
        if (style.get("textAlign") == "right") {
            if (position > 0) {
                word = " " + word;
            }
        } else {
            if (position < wordCount - 1) {
                word += " ";
            }
        }
        return word;
    }, textDecoration:function (el, style) {
        if (!style) {
            style = this.getStyle(el);
        }
        var types = {underline:null, overline:null, "line-through":null};
        for (var search = el; search.parentNode && search.parentNode.nodeType == 1; ) {
            var foundAll = true;
            for (var type in types) {
                if (types[type]) {
                    continue;
                }
                if (style.get("textDecoration").indexOf(type) != -1) {
                    types[type] = style.get("color");
                }
                foundAll = false;
            }
            if (foundAll) {
                break;
            }
            style = this.getStyle(search = search.parentNode);
        }
        return types;
    }, textShadow:cached(function (value) {
        if (value == "none") {
            return null;
        }
        var shadows = [], currentShadow = {}, result, offCount = 0;
        var re = /(#[a-f0-9]+|[a-z]+\(.*?\)|[a-z]+)|(-?[\d.]+[a-z%]*)|,/ig;
        while (result = re.exec(value)) {
            if (result[0] == ",") {
                shadows.push(currentShadow);
                currentShadow = {}, offCount = 0;
            } else {
                if (result[1]) {
                    currentShadow.color = result[1];
                } else {
                    currentShadow[["offX", "offY", "blur"][offCount++]] = result[2];
                }
            }
        }
        shadows.push(currentShadow);
        return shadows;
    }), color:cached(function (value) {
        var parsed = {};
        parsed.color = value.replace(/^rgba\((.*?),\s*([\d.]+)\)/, function ($0, $1, $2) {
            parsed.opacity = parseFloat($2);
            return "rgb(" + $1 + ")";
        });
        return parsed;
    }), textTransform:function (text, style) {
        return text[{uppercase:"toUpperCase", lowercase:"toLowerCase"}[style.get("textTransform")] || "toString"]();
    }};
    function Font(data) {
        var face = this.face = data.face;
        this.glyphs = data.glyphs;
        this.w = data.w;
        this.baseSize = parseInt(face["units-per-em"], 10);
        this.family = face["font-family"].toLowerCase();
        this.weight = face["font-weight"];
        this.style = face["font-style"] || "normal";
        this.viewBox = (function () {
            var parts = face.bbox.split(/\s+/);
            var box = {minX:parseInt(parts[0], 10), minY:parseInt(parts[1], 10), maxX:parseInt(parts[2], 10), maxY:parseInt(parts[3], 10)};
            box.width = box.maxX - box.minX, box.height = box.maxY - box.minY;
            box.toString = function () {
                return [this.minX, this.minY, this.width, this.height].join(" ");
            };
            return box;
        })();
        this.ascent = -parseInt(face.ascent, 10);
        this.descent = -parseInt(face.descent, 10);
        this.height = -this.ascent + this.descent;
    }
    function FontFamily() {
        var styles = {}, mapping = {oblique:"italic", italic:"oblique"};
        this.add = function (font) {
            (styles[font.style] || (styles[font.style] = {}))[font.weight] = font;
        };
        this.get = function (style, weight) {
            var weights = styles[style] || styles[mapping[style]] || styles.normal || styles.italic || styles.oblique;
            if (!weights) {
                return null;
            }
            weight = {normal:400, bold:700}[weight] || parseInt(weight, 10);
            if (weights[weight]) {
                return weights[weight];
            }
            var up = {1:1, 99:0}[weight % 100], alts = [], min, max;
            if (up === undefined) {
                up = weight > 400;
            }
            if (weight == 500) {
                weight = 400;
            }
            for (var alt in weights) {
                alt = parseInt(alt, 10);
                if (!min || alt < min) {
                    min = alt;
                }
                if (!max || alt > max) {
                    max = alt;
                }
                alts.push(alt);
            }
            if (weight < min) {
                weight = min;
            }
            if (weight > max) {
                weight = max;
            }
            alts.sort(function (a, b) {
                return (up ? (a > weight && b > weight) ? a < b : a > b : (a < weight && b < weight) ? a > b : a < b) ? -1 : 1;
            });
            return weights[alts[0]];
        };
    }
    function HoverHandler() {
        function contains(node, anotherNode) {
            if (node.contains) {
                return node.contains(anotherNode);
            }
            return node.compareDocumentPosition(anotherNode) & 16;
        }
        function onOverOut(e) {
            var related = e.relatedTarget;
            if (!related || contains(this, related)) {
                return;
            }
            trigger(this);
        }
        function onEnterLeave(e) {
            trigger(this);
        }
        function trigger(el) {
            setTimeout(function () {
                api.replace(el, sharedStorage.get(el).options, true);
            }, 10);
        }
        this.attach = function (el) {
            if (el.onmouseenter === undefined) {
                addEvent(el, "mouseover", onOverOut);
                addEvent(el, "mouseout", onOverOut);
            } else {
                addEvent(el, "mouseenter", onEnterLeave);
                addEvent(el, "mouseleave", onEnterLeave);
            }
        };
    }
    function Storage() {
        var map = {}, at = 0;
        function identify(el) {
            return el.cufid || (el.cufid = ++at);
        }
        this.get = function (el) {
            var id = identify(el);
            return map[id] || (map[id] = {});
        };
    }
    function Style(style) {
        var custom = {}, sizes = {};
        this.get = function (property) {
            return custom[property] != undefined ? custom[property] : style[property];
        };
        this.getSize = function (property, base) {
            return sizes[property] || (sizes[property] = new CSS.Size(this.get(property), base));
        };
        this.extend = function (styles) {
            for (var property in styles) {
                custom[property] = styles[property];
            }
            return this;
        };
    }
    function addEvent(el, type, listener) {
        if (el.addEventListener) {
            el.addEventListener(type, listener, false);
        } else {
            if (el.attachEvent) {
                el.attachEvent("on" + type, function () {
                    return listener.call(el, fabric.window.event);
                });
            }
        }
    }
    function attach(el, options) {
        var storage = sharedStorage.get(el);
        if (storage.options) {
            return el;
        }
        if (options.hover && options.hoverables[el.nodeName.toLowerCase()]) {
            hoverHandler.attach(el);
        }
        storage.options = options;
        return el;
    }
    function cached(fun) {
        var cache = {};
        return function (key) {
            if (!cache.hasOwnProperty(key)) {
                cache[key] = fun.apply(null, arguments);
            }
            return cache[key];
        };
    }
    function getFont(el, style) {
        if (!style) {
            style = CSS.getStyle(el);
        }
        var families = CSS.quotedList(style.get("fontFamily").toLowerCase()), family;
        for (var i = 0, l = families.length; i < l; ++i) {
            family = families[i];
            if (fonts[family]) {
                return fonts[family].get(style.get("fontStyle"), style.get("fontWeight"));
            }
        }
        return null;
    }
    function elementsByTagName(query) {
        return fabric.document.getElementsByTagName(query);
    }
    function merge() {
        var merged = {}, key;
        for (var i = 0, l = arguments.length; i < l; ++i) {
            for (key in arguments[i]) {
                merged[key] = arguments[i][key];
            }
        }
        return merged;
    }
    function process(font, text, style, options, node, el) {
        var separate = options.separate;
        if (separate == "none") {
            return engines[options.engine].apply(null, arguments);
        }
        var fragment = fabric.document.createDocumentFragment(), processed;
        var parts = text.split(separators[separate]), needsAligning = (separate == "words");
        if (needsAligning && HAS_BROKEN_REGEXP) {
            if (/^\s/.test(text)) {
                parts.unshift("");
            }
            if (/\s$/.test(text)) {
                parts.push("");
            }
        }
        for (var i = 0, l = parts.length; i < l; ++i) {
            processed = engines[options.engine](font, needsAligning ? CSS.textAlign(parts[i], style, i, l) : parts[i], style, options, node, el, i < l - 1);
            if (processed) {
                fragment.appendChild(processed);
            }
        }
        return fragment;
    }
    function replaceElement(el, options) {
        var font, style, nextNode, redraw;
        for (var node = attach(el, options).firstChild; node; node = nextNode) {
            nextNode = node.nextSibling;
            redraw = false;
            if (node.nodeType == 1) {
                if (!node.firstChild) {
                    continue;
                }
                if (!/cufon/.test(node.className)) {
                    arguments.callee(node, options);
                    continue;
                } else {
                    redraw = true;
                }
            }
            if (!style) {
                style = CSS.getStyle(el).extend(options);
            }
            if (!font) {
                font = getFont(el, style);
            }
            if (!font) {
                continue;
            }
            if (redraw) {
                engines[options.engine](font, null, style, options, node, el);
                continue;
            }
            var text = node.data;
            if (typeof G_vmlCanvasManager != "undefined") {
                text = text.replace(/\r/g, "\n");
            }
            if (text === "") {
                continue;
            }
            var processed = process(font, text, style, options, node, el);
            if (processed) {
                node.parentNode.replaceChild(processed, node);
            } else {
                node.parentNode.removeChild(node);
            }
        }
    }
    var HAS_BROKEN_REGEXP = " ".split(/\s+/).length == 0;
    var sharedStorage = new Storage();
    var hoverHandler = new HoverHandler();
    var replaceHistory = [];
    var engines = {}, fonts = {}, defaultOptions = {engine:null, hover:false, hoverables:{a:true}, printable:true, selector:(fabric.window.Sizzle || (fabric.window.jQuery && function (query) {
        return jQuery(query);
    }) || (fabric.window.dojo && dojo.query) || (fabric.window.$$ && function (query) {
        return $$(query);
    }) || (fabric.window.$ && function (query) {
        return $(query);
    }) || (fabric.document.querySelectorAll && function (query) {
        return fabric.document.querySelectorAll(query);
    }) || elementsByTagName), separate:"words", textShadow:"none"};
    var separators = {words:/\s+/, characters:""};
    api.now = function () {
        DOM.ready();
        return api;
    };
    api.refresh = function () {
        var currentHistory = replaceHistory.splice(0, replaceHistory.length);
        for (var i = 0, l = currentHistory.length; i < l; ++i) {
            api.replace.apply(null, currentHistory[i]);
        }
        return api;
    };
    api.registerEngine = function (id, engine) {
        if (!engine) {
            return api;
        }
        engines[id] = engine;
        return api.set("engine", id);
    };
    api.registerFont = function (data) {
        var font = new Font(data), family = font.family;
        if (!fonts[family]) {
            fonts[family] = new FontFamily();
        }
        fonts[family].add(font);
        return api.set("fontFamily", "\"" + family + "\"");
    };
    api.replace = function (elements, options, ignoreHistory) {
        options = merge(defaultOptions, options);
        if (!options.engine) {
            return api;
        }
        if (typeof options.textShadow == "string" && options.textShadow) {
            options.textShadow = CSS.textShadow(options.textShadow);
        }
        if (!ignoreHistory) {
            replaceHistory.push(arguments);
        }
        if (elements.nodeType || typeof elements == "string") {
            elements = [elements];
        }
        CSS.ready(function () {
            for (var i = 0, l = elements.length; i < l; ++i) {
                var el = elements[i];
                if (typeof el == "string") {
                    api.replace(options.selector(el), options, true);
                } else {
                    replaceElement(el, options);
                }
            }
        });
        return api;
    };
    api.replaceElement = function (el, options) {
        options = merge(defaultOptions, options);
        if (typeof options.textShadow == "string" && options.textShadow) {
            options.textShadow = CSS.textShadow(options.textShadow);
        }
        return replaceElement(el, options);
    };
    api.engines = engines;
    api.fonts = fonts;
    api.getOptions = function () {
        return merge(defaultOptions);
    };
    api.set = function (option, value) {
        defaultOptions[option] = value;
        return api;
    };
    return api;
})();
Cufon.registerEngine("canvas", (function () {
    var HAS_INLINE_BLOCK = Cufon.CSS.supports("display", "inline-block");
    var HAS_BROKEN_LINEHEIGHT = !HAS_INLINE_BLOCK && (fabric.document.compatMode == "BackCompat" || /frameset|transitional/i.test(fabric.document.doctype.publicId));
    var styleSheet = fabric.document.createElement("style");
    styleSheet.type = "text/css";
    var textNode = fabric.document.createTextNode(".cufon-canvas{text-indent:0}" + "@media screen,projection{" + ".cufon-canvas{display:inline;display:inline-block;position:relative;vertical-align:middle" + (HAS_BROKEN_LINEHEIGHT ? "" : ";font-size:1px;line-height:1px") + "}.cufon-canvas .cufon-alt{display:-moz-inline-box;display:inline-block;width:0;height:0;overflow:hidden}" + (HAS_INLINE_BLOCK ? ".cufon-canvas canvas{position:relative}" : ".cufon-canvas canvas{position:absolute}") + "}" + "@media print{" + ".cufon-canvas{padding:0 !important}" + ".cufon-canvas canvas{display:none}" + ".cufon-canvas .cufon-alt{display:inline}" + "}");
    try {
        styleSheet.appendChild(textNode);
    }
    catch (e) {
        styleSheet.setAttribute("type", "text/css");
        styleSheet.styleSheet.cssText = textNode.data;
    }
    fabric.document.getElementsByTagName("head")[0].appendChild(styleSheet);
    function generateFromVML(path, context) {
        var atX = 0, atY = 0;
        var code = [], re = /([mrvxe])([^a-z]*)/g, match;
    generate:
        for (var i = 0; match = re.exec(path); ++i) {
            var c = match[2].split(",");
            switch (match[1]) {
              case "v":
                code[i] = {m:"bezierCurveTo", a:[atX + ~~c[0], atY + ~~c[1], atX + ~~c[2], atY + ~~c[3], atX += ~~c[4], atY += ~~c[5]]};
                break;
              case "r":
                code[i] = {m:"lineTo", a:[atX += ~~c[0], atY += ~~c[1]]};
                break;
              case "m":
                code[i] = {m:"moveTo", a:[atX = ~~c[0], atY = ~~c[1]]};
                break;
              case "x":
                code[i] = {m:"closePath", a:[]};
                break;
              case "e":
                break generate;
            }
            context[code[i].m].apply(context, code[i].a);
        }
        return code;
    }
    function interpret(code, context) {
        for (var i = 0, l = code.length; i < l; ++i) {
            var line = code[i];
            context[line.m].apply(context, line.a);
        }
    }
    return function (font, text, style, options, node, el) {
        var redraw = (text === null);
        var viewBox = font.viewBox;
        var size = style.getSize("fontSize", font.baseSize);
        var letterSpacing = style.get("letterSpacing");
        letterSpacing = (letterSpacing == "normal") ? 0 : size.convertFrom(parseInt(letterSpacing, 10));
        var expandTop = 0, expandRight = 0, expandBottom = 0, expandLeft = 0;
        var shadows = options.textShadow, shadowOffsets = [];
        Cufon.textOptions.shadowOffsets = [];
        Cufon.textOptions.shadows = null;
        if (shadows) {
            Cufon.textOptions.shadows = shadows;
            for (var i = 0, l = shadows.length; i < l; ++i) {
                var shadow = shadows[i];
                var x = size.convertFrom(parseFloat(shadow.offX));
                var y = size.convertFrom(parseFloat(shadow.offY));
                shadowOffsets[i] = [x, y];
            }
        }
        var chars = Cufon.CSS.textTransform(redraw ? node.alt : text, style).split("");
        var width = 0, lastWidth = null;
        var maxWidth = 0, lines = 1, lineWidths = [];
        for (var i = 0, l = chars.length; i < l; ++i) {
            if (chars[i] === "\n") {
                lines++;
                if (width > maxWidth) {
                    maxWidth = width;
                }
                lineWidths.push(width);
                width = 0;
                continue;
            }
            var glyph = font.glyphs[chars[i]] || font.missingGlyph;
            if (!glyph) {
                continue;
            }
            width += lastWidth = Number(glyph.w || font.w) + letterSpacing;
        }
        lineWidths.push(width);
        width = Math.max(maxWidth, width);
        var lineOffsets = [];
        for (var i = lineWidths.length; i--; ) {
            lineOffsets[i] = width - lineWidths[i];
        }
        if (lastWidth === null) {
            return null;
        }
        expandRight += (viewBox.width - lastWidth);
        expandLeft += viewBox.minX;
        var wrapper, canvas;
        if (redraw) {
            wrapper = node;
            canvas = node.firstChild;
        } else {
            wrapper = fabric.document.createElement("span");
            wrapper.className = "cufon cufon-canvas";
            wrapper.alt = text;
            canvas = fabric.document.createElement("canvas");
            wrapper.appendChild(canvas);
            if (options.printable) {
                var print = fabric.document.createElement("span");
                print.className = "cufon-alt";
                print.appendChild(fabric.document.createTextNode(text));
                wrapper.appendChild(print);
            }
        }
        var wStyle = wrapper.style;
        var cStyle = canvas.style || {};
        var height = size.convert(viewBox.height - expandTop + expandBottom);
        var roundedHeight = Math.ceil(height);
        var roundingFactor = roundedHeight / height;
        canvas.width = Math.ceil(size.convert(width + expandRight - expandLeft) * roundingFactor);
        canvas.height = roundedHeight;
        expandTop += viewBox.minY;
        cStyle.top = Math.round(size.convert(expandTop - font.ascent)) + "px";
        cStyle.left = Math.round(size.convert(expandLeft)) + "px";
        var _width = Math.ceil(size.convert(width * roundingFactor));
        var wrapperWidth = _width + "px";
        var _height = size.convert(font.height);
        var totalLineHeight = (options.lineHeight - 1) * size.convert(-font.ascent / 5) * (lines - 1);
        Cufon.textOptions.width = _width;
        Cufon.textOptions.height = (_height * lines) + totalLineHeight;
        Cufon.textOptions.lines = lines;
        Cufon.textOptions.totalLineHeight = totalLineHeight;
        if (HAS_INLINE_BLOCK) {
            wStyle.width = wrapperWidth;
            wStyle.height = _height + "px";
        } else {
            wStyle.paddingLeft = wrapperWidth;
            wStyle.paddingBottom = (_height - 1) + "px";
        }
        var g = Cufon.textOptions.context || canvas.getContext("2d"), scale = roundedHeight / viewBox.height;
        Cufon.textOptions.fontAscent = font.ascent * scale;
        Cufon.textOptions.boundaries = null;
        for (var offsets = Cufon.textOptions.shadowOffsets, i = shadowOffsets.length; i--; ) {
            offsets[i] = [shadowOffsets[i][0] * scale, shadowOffsets[i][1] * scale];
        }
        g.save();
        g.scale(scale, scale);
        g.translate(-expandLeft - ((1 / scale * canvas.width) / 2) + (Cufon.fonts[font.family].offsetLeft || 0), -expandTop - ((Cufon.textOptions.height / scale) / 2) + (Cufon.fonts[font.family].offsetTop || 0));
        g.lineWidth = font.face["underline-thickness"];
        g.save();
        function line(y, color) {
            g.strokeStyle = color;
            g.beginPath();
            g.moveTo(0, y);
            g.lineTo(width, y);
            g.stroke();
        }
        var textDecoration = Cufon.getTextDecoration(options), isItalic = options.fontStyle === "italic";
        function renderBackground() {
            g.save();
            var left = 0, lineNum = 0, boundaries = [{left:0}];
            if (options.backgroundColor) {
                g.save();
                g.fillStyle = options.backgroundColor;
                g.translate(0, font.ascent);
                g.fillRect(0, 0, width + 10, (-font.ascent + font.descent) * lines);
                g.restore();
            }
            if (options.textAlign === "right") {
                g.translate(lineOffsets[lineNum], 0);
                boundaries[0].left = lineOffsets[lineNum] * scale;
            } else {
                if (options.textAlign === "center") {
                    g.translate(lineOffsets[lineNum] / 2, 0);
                    boundaries[0].left = lineOffsets[lineNum] / 2 * scale;
                }
            }
            for (var i = 0, l = chars.length; i < l; ++i) {
                if (chars[i] === "\n") {
                    lineNum++;
                    var topOffset = -font.ascent - ((font.ascent / 5) * options.lineHeight);
                    var boundary = boundaries[boundaries.length - 1];
                    var nextBoundary = {left:0};
                    boundary.width = left * scale;
                    boundary.height = (-font.ascent + font.descent) * scale;
                    if (options.textAlign === "right") {
                        g.translate(-width, topOffset);
                        g.translate(lineOffsets[lineNum], 0);
                        nextBoundary.left = lineOffsets[lineNum] * scale;
                    } else {
                        if (options.textAlign === "center") {
                            g.translate(-left - (lineOffsets[lineNum - 1] / 2), topOffset);
                            g.translate(lineOffsets[lineNum] / 2, 0);
                            nextBoundary.left = lineOffsets[lineNum] / 2 * scale;
                        } else {
                            g.translate(-left, topOffset);
                        }
                    }
                    boundaries.push(nextBoundary);
                    left = 0;
                    continue;
                }
                var glyph = font.glyphs[chars[i]] || font.missingGlyph;
                if (!glyph) {
                    continue;
                }
                var charWidth = Number(glyph.w || font.w) + letterSpacing;
                if (options.textBackgroundColor) {
                    g.save();
                    g.fillStyle = options.textBackgroundColor;
                    g.translate(0, font.ascent);
                    g.fillRect(0, 0, charWidth + 10, -font.ascent + font.descent);
                    g.restore();
                }
                g.translate(charWidth, 0);
                left += charWidth;
                if (i == l - 1) {
                    boundaries[boundaries.length - 1].width = left * scale;
                    boundaries[boundaries.length - 1].height = (-font.ascent + font.descent) * scale;
                }
            }
            g.restore();
            Cufon.textOptions.boundaries = boundaries;
        }
        function renderText(color) {
            g.fillStyle = color || Cufon.textOptions.color || style.get("color");
            var left = 0, lineNum = 0;
            if (options.textAlign === "right") {
                g.translate(lineOffsets[lineNum], 0);
            } else {
                if (options.textAlign === "center") {
                    g.translate(lineOffsets[lineNum] / 2, 0);
                }
            }
            for (var i = 0, l = chars.length; i < l; ++i) {
                if (chars[i] === "\n") {
                    lineNum++;
                    var topOffset = -font.ascent - ((font.ascent / 5) * options.lineHeight);
                    if (options.textAlign === "right") {
                        g.translate(-width, topOffset);
                        g.translate(lineOffsets[lineNum], 0);
                    } else {
                        if (options.textAlign === "center") {
                            g.translate(-left - (lineOffsets[lineNum - 1] / 2), topOffset);
                            g.translate(lineOffsets[lineNum] / 2, 0);
                        } else {
                            g.translate(-left, topOffset);
                        }
                    }
                    left = 0;
                    continue;
                }
                var glyph = font.glyphs[chars[i]] || font.missingGlyph;
                if (!glyph) {
                    continue;
                }
                var charWidth = Number(glyph.w || font.w) + letterSpacing;
                if (textDecoration) {
                    g.save();
                    g.strokeStyle = g.fillStyle;
                    g.lineWidth += g.lineWidth;
                    g.beginPath();
                    if (textDecoration.underline) {
                        g.moveTo(0, -font.face["underline-position"] + 0.5);
                        g.lineTo(charWidth, -font.face["underline-position"] + 0.5);
                    }
                    if (textDecoration.overline) {
                        g.moveTo(0, font.ascent + 0.5);
                        g.lineTo(charWidth, font.ascent + 0.5);
                    }
                    if (textDecoration["line-through"]) {
                        g.moveTo(0, -font.descent + 0.5);
                        g.lineTo(charWidth, -font.descent + 0.5);
                    }
                    g.stroke();
                    g.restore();
                }
                if (isItalic) {
                    g.save();
                    g.transform(1, 0, -0.25, 1, 0, 0);
                }
                g.beginPath();
                if (glyph.d) {
                    if (glyph.code) {
                        interpret(glyph.code, g);
                    } else {
                        glyph.code = generateFromVML("m" + glyph.d, g);
                    }
                }
                g.fill();
                if (options.strokeStyle) {
                    g.closePath();
                    g.save();
                    g.lineWidth = options.strokeWidth;
                    g.strokeStyle = options.strokeStyle;
                    g.stroke();
                    g.restore();
                }
                if (isItalic) {
                    g.restore();
                }
                g.translate(charWidth, 0);
                left += charWidth;
            }
        }
        g.save();
        renderBackground();
        if (shadows) {
            for (var i = 0, l = shadows.length; i < l; ++i) {
                var shadow = shadows[i];
                g.save();
                g.translate.apply(g, shadowOffsets[i]);
                renderText(shadow.color);
                g.restore();
            }
        }
        renderText();
        g.restore();
        g.restore();
        g.restore();
        return wrapper;
    };
})());
Cufon.registerEngine("vml", (function () {
    if (!fabric.document.namespaces) {
        return;
    }
    var canvasEl = fabric.document.createElement("canvas");
    if (canvasEl && canvasEl.getContext && canvasEl.getContext.apply) {
        return;
    }
    if (fabric.document.namespaces.cvml == null) {
        fabric.document.namespaces.add("cvml", "urn:schemas-microsoft-com:vml");
    }
    var check = fabric.document.createElement("cvml:shape");
    check.style.behavior = "url(#default#VML)";
    if (!check.coordsize) {
        return;
    }
    check = null;
    fabric.document.write("<style type=\"text/css\">" + ".cufon-vml-canvas{text-indent:0}" + "@media screen{" + "cvml\\:shape,cvml\\:shadow{behavior:url(#default#VML);display:block;antialias:true;position:absolute}" + ".cufon-vml-canvas{position:absolute;text-align:left}" + ".cufon-vml{display:inline-block;position:relative;vertical-align:middle}" + ".cufon-vml .cufon-alt{position:absolute;left:-10000in;font-size:1px}" + "a .cufon-vml{cursor:pointer}" + "}" + "@media print{" + ".cufon-vml *{display:none}" + ".cufon-vml .cufon-alt{display:inline}" + "}" + "</style>");
    function getFontSizeInPixels(el, value) {
        return getSizeInPixels(el, /(?:em|ex|%)$/i.test(value) ? "1em" : value);
    }
    function getSizeInPixels(el, value) {
        if (/px$/i.test(value)) {
            return parseFloat(value);
        }
        var style = el.style.left, runtimeStyle = el.runtimeStyle.left;
        el.runtimeStyle.left = el.currentStyle.left;
        el.style.left = value;
        var result = el.style.pixelLeft;
        el.style.left = style;
        el.runtimeStyle.left = runtimeStyle;
        return result;
    }
    return function (font, text, style, options, node, el, hasNext) {
        var redraw = (text === null);
        if (redraw) {
            text = node.alt;
        }
        var viewBox = font.viewBox;
        var size = style.computedFontSize || (style.computedFontSize = new Cufon.CSS.Size(getFontSizeInPixels(el, style.get("fontSize")) + "px", font.baseSize));
        var letterSpacing = style.computedLSpacing;
        if (letterSpacing == undefined) {
            letterSpacing = style.get("letterSpacing");
            style.computedLSpacing = letterSpacing = (letterSpacing == "normal") ? 0 : ~~size.convertFrom(getSizeInPixels(el, letterSpacing));
        }
        var wrapper, canvas;
        if (redraw) {
            wrapper = node;
            canvas = node.firstChild;
        } else {
            wrapper = fabric.document.createElement("span");
            wrapper.className = "cufon cufon-vml";
            wrapper.alt = text;
            canvas = fabric.document.createElement("span");
            canvas.className = "cufon-vml-canvas";
            wrapper.appendChild(canvas);
            if (options.printable) {
                var print = fabric.document.createElement("span");
                print.className = "cufon-alt";
                print.appendChild(fabric.document.createTextNode(text));
                wrapper.appendChild(print);
            }
            if (!hasNext) {
                wrapper.appendChild(fabric.document.createElement("cvml:shape"));
            }
        }
        var wStyle = wrapper.style;
        var cStyle = canvas.style;
        var height = size.convert(viewBox.height), roundedHeight = Math.ceil(height);
        var roundingFactor = roundedHeight / height;
        var minX = viewBox.minX, minY = viewBox.minY;
        cStyle.height = roundedHeight;
        cStyle.top = Math.round(size.convert(minY - font.ascent));
        cStyle.left = Math.round(size.convert(minX));
        wStyle.height = size.convert(font.height) + "px";
        var textDecoration = Cufon.getTextDecoration(options);
        var color = style.get("color");
        var chars = Cufon.CSS.textTransform(text, style).split("");
        var width = 0, offsetX = 0, advance = null;
        var glyph, shape, shadows = options.textShadow;
        for (var i = 0, k = 0, l = chars.length; i < l; ++i) {
            glyph = font.glyphs[chars[i]] || font.missingGlyph;
            if (glyph) {
                width += advance = ~~(glyph.w || font.w) + letterSpacing;
            }
        }
        if (advance === null) {
            return null;
        }
        var fullWidth = -minX + width + (viewBox.width - advance);
        var shapeWidth = size.convert(fullWidth * roundingFactor), roundedShapeWidth = Math.round(shapeWidth);
        var coordSize = fullWidth + "," + viewBox.height, coordOrigin;
        var stretch = "r" + coordSize + "nsnf";
        for (i = 0; i < l; ++i) {
            glyph = font.glyphs[chars[i]] || font.missingGlyph;
            if (!glyph) {
                continue;
            }
            if (redraw) {
                shape = canvas.childNodes[k];
                if (shape.firstChild) {
                    shape.removeChild(shape.firstChild);
                }
            } else {
                shape = fabric.document.createElement("cvml:shape");
                canvas.appendChild(shape);
            }
            shape.stroked = "f";
            shape.coordsize = coordSize;
            shape.coordorigin = coordOrigin = (minX - offsetX) + "," + minY;
            shape.path = (glyph.d ? "m" + glyph.d + "xe" : "") + "m" + coordOrigin + stretch;
            shape.fillcolor = color;
            var sStyle = shape.style;
            sStyle.width = roundedShapeWidth;
            sStyle.height = roundedHeight;
            if (shadows) {
                var shadow1 = shadows[0], shadow2 = shadows[1];
                var color1 = Cufon.CSS.color(shadow1.color), color2;
                var shadow = fabric.document.createElement("cvml:shadow");
                shadow.on = "t";
                shadow.color = color1.color;
                shadow.offset = shadow1.offX + "," + shadow1.offY;
                if (shadow2) {
                    color2 = Cufon.CSS.color(shadow2.color);
                    shadow.type = "double";
                    shadow.color2 = color2.color;
                    shadow.offset2 = shadow2.offX + "," + shadow2.offY;
                }
                shadow.opacity = color1.opacity || (color2 && color2.opacity) || 1;
                shape.appendChild(shadow);
            }
            offsetX += ~~(glyph.w || font.w) + letterSpacing;
            ++k;
        }
        wStyle.width = Math.max(Math.ceil(size.convert(width * roundingFactor)), 0);
        return wrapper;
    };
})());
Cufon.getTextDecoration = function (options) {
    return {underline:options.textDecoration === "underline", overline:options.textDecoration === "overline", "line-through":options.textDecoration === "line-through"};
};
if (typeof exports != "undefined") {
    exports.Cufon = Cufon;
}
var JSON;
if (!JSON) {
    JSON = {};
}
(function () {
    "use strict";
    function f(n) {
        return n < 10 ? "0" + n : n;
    }
    if (typeof Date.prototype.toJSON !== "function") {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null;
        };
        String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }
    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta = {"\b":"\\b", "\t":"\\t", "\n":"\\n", "\f":"\\f", "\r":"\\r", "\"":"\\\"", "\\":"\\\\"}, rep;
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? "\"" + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === "string" ? c : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }) + "\"" : "\"" + string + "\"";
    }
    function str(key, holder) {
        var i, k, v, length, mind = gap, partial, value = holder[key];
        if (value && typeof value === "object" && typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }
        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }
        switch (typeof value) {
          case "string":
            return quote(value);
          case "number":
            return isFinite(value) ? String(value) : "null";
          case "boolean":
          case "null":
            return String(value);
          case "object":
            if (!value) {
                return "null";
            }
            gap += indent;
            partial = [];
            if (Object.prototype.toString.apply(value) === "[object Array]") {
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }
                v = partial.length === 0 ? "[]" : gap ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]" : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }
            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            } else {
                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ": " : ":") + v);
                        }
                    }
                }
            }
            v = partial.length === 0 ? "{}" : gap ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}" : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }
    if (typeof JSON.stringify !== "function") {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = "";
            indent = "";
            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }
            } else {
                if (typeof space === "string") {
                    indent = space;
                }
            }
            rep = replacer;
            if (replacer && typeof replacer !== "function" && (typeof replacer !== "object" || typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }
            return str("", {"":value});
        };
    }
    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }
            if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
                j = eval("(" + text + ")");
                return typeof reviver === "function" ? walk({"":j}, "") : j;
            }
            throw new SyntaxError("JSON.parse");
        };
    }
}());
fabric.log = function () {
};
fabric.warn = function () {
};
if (typeof console !== "undefined") {
    if (typeof console.log !== "undefined" && console.log.apply) {
        fabric.log = function () {
            return console.log.apply(console, arguments);
        };
    }
    if (typeof console.warn !== "undefined" && console.warn.apply) {
        fabric.warn = function () {
            return console.warn.apply(console, arguments);
        };
    }
}
(function () {
    function _removeEventListener(eventName, handler) {
        if (!this.__eventListeners[eventName]) {
            return;
        }
        if (handler) {
            fabric.util.removeFromArray(this.__eventListeners[eventName], handler);
        } else {
            this.__eventListeners[eventName].length = 0;
        }
    }
    function observe(eventName, handler) {
        if (!this.__eventListeners) {
            this.__eventListeners = {};
        }
        if (arguments.length === 1) {
            for (var prop in eventName) {
                this.on(prop, eventName[prop]);
            }
        } else {
            if (!this.__eventListeners[eventName]) {
                this.__eventListeners[eventName] = [];
            }
            this.__eventListeners[eventName].push(handler);
        }
        return this;
    }
    function stopObserving(eventName, handler) {
        if (!this.__eventListeners) {
            return;
        }
        if (arguments.length === 1 && typeof arguments[0] === "object") {
            for (var prop in eventName) {
                _removeEventListener.call(this, prop, eventName[prop]);
            }
        } else {
            _removeEventListener.call(this, eventName, handler);
        }
        return this;
    }
    function fire(eventName, options) {
        if (!this.__eventListeners) {
            return;
        }
        var listenersForEvent = this.__eventListeners[eventName];
        if (!listenersForEvent) {
            return;
        }
        for (var i = 0, len = listenersForEvent.length; i < len; i++) {
            listenersForEvent[i].call(this, options || {});
        }
        return this;
    }
    fabric.Observable = {observe:observe, stopObserving:stopObserving, fire:fire, on:observe, off:stopObserving, trigger:fire};
})();
fabric.Collection = {add:function () {
    this._objects.push.apply(this._objects, arguments);
    for (var i = arguments.length; i--; ) {
        this._onObjectAdded(arguments[i]);
    }
    this.renderOnAddRemove && this.renderAll();
    return this;
}, insertAt:function (object, index, nonSplicing) {
    var objects = this.getObjects();
    if (nonSplicing) {
        objects[index] = object;
    } else {
        objects.splice(index, 0, object);
    }
    this._onObjectAdded(object);
    this.renderOnAddRemove && this.renderAll();
    return this;
}, remove:function (object) {
    var objects = this.getObjects(), index = objects.indexOf(object);
    if (index !== -1) {
        objects.splice(index, 1);
        this._onObjectRemoved(object);
    }
    this.renderOnAddRemove && this.renderAll();
    return object;
}, forEachObject:function (callback, context) {
    var objects = this.getObjects(), i = objects.length;
    while (i--) {
        callback.call(context, objects[i], i, objects);
    }
    return this;
}, item:function (index) {
    return this.getObjects()[index];
}, isEmpty:function () {
    return this.getObjects().length === 0;
}, size:function () {
    return this.getObjects().length;
}, contains:function (object) {
    return this.getObjects().indexOf(object) > -1;
}, complexity:function () {
    return this.getObjects().reduce(function (memo, current) {
        memo += current.complexity ? current.complexity() : 0;
        return memo;
    }, 0);
}};
(function (global) {
    var sqrt = Math.sqrt, atan2 = Math.atan2;
    fabric.util = {};
    function removeFromArray(array, value) {
        var idx = array.indexOf(value);
        if (idx !== -1) {
            array.splice(idx, 1);
        }
        return array;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    var PiBy180 = Math.PI / 180;
    function degreesToRadians(degrees) {
        return degrees * PiBy180;
    }
    function radiansToDegrees(radians) {
        return radians / PiBy180;
    }
    function rotatePoint(point, origin, radians) {
        var sin = Math.sin(radians), cos = Math.cos(radians);
        point.subtractEquals(origin);
        var rx = point.x * cos - point.y * sin;
        var ry = point.x * sin + point.y * cos;
        return new fabric.Point(rx, ry).addEquals(origin);
    }
    function toFixed(number, fractionDigits) {
        return parseFloat(Number(number).toFixed(fractionDigits));
    }
    function falseFunction() {
        return false;
    }
    function getKlass(type, namespace) {
        type = fabric.util.string.camelize(type.charAt(0).toUpperCase() + type.slice(1));
        return resolveNamespace(namespace)[type];
    }
    function resolveNamespace(namespace) {
        if (!namespace) {
            return fabric;
        }
        var parts = namespace.split("."), len = parts.length, obj = global || fabric.window;
        for (var i = 0; i < len; ++i) {
            obj = obj[parts[i]];
        }
        return obj;
    }
    function loadImage(url, callback, context) {
        if (url) {
            var img = fabric.util.createImage();
            img.onload = function () {
                callback && callback.call(context, img);
                img = img.onload = null;
            };
            img.src = url;
        } else {
            callback && callback.call(context, url);
        }
    }
    function enlivenObjects(objects, callback, namespace, reviver) {
        function onLoaded() {
            if (++numLoadedObjects === numTotalObjects) {
                if (callback) {
                    callback(enlivenedObjects);
                }
            }
        }
        var enlivenedObjects = [], numLoadedObjects = 0, numTotalObjects = objects.length;
        objects.forEach(function (o, index) {
            if (!o || !o.type) {
                onLoaded();
                return;
            }
            var klass = fabric.util.getKlass(o.type, namespace);
            if (klass.async) {
                klass.fromObject(o, function (obj, error) {
                    if (!error) {
                        enlivenedObjects[index] = obj;
                        reviver && reviver(o, enlivenedObjects[index]);
                    }
                    onLoaded();
                });
            } else {
                enlivenedObjects[index] = klass.fromObject(o);
                reviver && reviver(o, enlivenedObjects[index]);
                onLoaded();
            }
        });
    }
    function groupSVGElements(elements, options, path) {
        var object;
        if (elements.length > 1) {
            object = new fabric.PathGroup(elements, options);
        } else {
            object = elements[0];
        }
        if (typeof path !== "undefined") {
            object.setSourcePath(path);
        }
        return object;
    }
    function populateWithProperties(source, destination, properties) {
        if (properties && Object.prototype.toString.call(properties) === "[object Array]") {
            for (var i = 0, len = properties.length; i < len; i++) {
                if (properties[i] in source) {
                    destination[properties[i]] = source[properties[i]];
                }
            }
        }
    }
    function drawDashedLine(ctx, x, y, x2, y2, da) {
        var dx = x2 - x, dy = y2 - y, len = sqrt(dx * dx + dy * dy), rot = atan2(dy, dx), dc = da.length, di = 0, draw = true;
        ctx.save();
        ctx.translate(x, y);
        ctx.moveTo(0, 0);
        ctx.rotate(rot);
        x = 0;
        while (len > x) {
            x += da[di++ % dc];
            if (x > len) {
                x = len;
            }
            ctx[draw ? "lineTo" : "moveTo"](x, 0);
            draw = !draw;
        }
        ctx.restore();
    }
    function createCanvasElement(canvasEl) {
        canvasEl || (canvasEl = fabric.document.createElement("canvas"));
        if (!canvasEl.getContext && typeof G_vmlCanvasManager !== "undefined") {
            G_vmlCanvasManager.initElement(canvasEl);
        }
        return canvasEl;
    }
    function createImage() {
        return fabric.isLikelyNode ? new (require("canvas").Image)() : fabric.document.createElement("img");
    }
    function createAccessors(klass) {
        var proto = klass.prototype;
        for (var i = proto.stateProperties.length; i--; ) {
            var propName = proto.stateProperties[i], capitalizedPropName = propName.charAt(0).toUpperCase() + propName.slice(1), setterName = "set" + capitalizedPropName, getterName = "get" + capitalizedPropName;
            if (!proto[getterName]) {
                proto[getterName] = (function (property) {
                    return new Function("return this.get(\"" + property + "\")");
                })(propName);
            }
            if (!proto[setterName]) {
                proto[setterName] = (function (property) {
                    return new Function("value", "return this.set(\"" + property + "\", value)");
                })(propName);
            }
        }
    }
    function clipContext(receiver, ctx) {
        ctx.save();
        ctx.beginPath();
        receiver.clipTo(ctx);
        ctx.clip();
    }
    function multiplyTransformMatrices(matrixA, matrixB) {
        var a = [[matrixA[0], matrixA[2], matrixA[4]], [matrixA[1], matrixA[3], matrixA[5]], [0, 0, 1]];
        var b = [[matrixB[0], matrixB[2], matrixB[4]], [matrixB[1], matrixB[3], matrixB[5]], [0, 0, 1]];
        var result = [];
        for (var r = 0; r < 3; r++) {
            result[r] = [];
            for (var c = 0; c < 3; c++) {
                var sum = 0;
                for (var k = 0; k < 3; k++) {
                    sum += a[r][k] * b[k][c];
                }
                result[r][c] = sum;
            }
        }
        return [result[0][0], result[1][0], result[0][1], result[1][1], result[0][2], result[1][2]];
    }
    function getFunctionBody(fn) {
        return (String(fn).match(/function[^{]*\{([\s\S]*)\}/) || {})[1];
    }
    function drawArc(ctx, x, y, coords) {
        var rx = coords[0];
        var ry = coords[1];
        var rot = coords[2];
        var large = coords[3];
        var sweep = coords[4];
        var ex = coords[5];
        var ey = coords[6];
        var segs = arcToSegments(ex, ey, rx, ry, large, sweep, rot, x, y);
        for (var i = 0; i < segs.length; i++) {
            var bez = segmentToBezier.apply(this, segs[i]);
            ctx.bezierCurveTo.apply(ctx, bez);
        }
    }
    var arcToSegmentsCache = {}, segmentToBezierCache = {}, _join = Array.prototype.join, argsString;
    function arcToSegments(x, y, rx, ry, large, sweep, rotateX, ox, oy) {
        argsString = _join.call(arguments);
        if (arcToSegmentsCache[argsString]) {
            return arcToSegmentsCache[argsString];
        }
        var th = rotateX * (Math.PI / 180);
        var sin_th = Math.sin(th);
        var cos_th = Math.cos(th);
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        var px = cos_th * (ox - x) * 0.5 + sin_th * (oy - y) * 0.5;
        var py = cos_th * (oy - y) * 0.5 - sin_th * (ox - x) * 0.5;
        var pl = (px * px) / (rx * rx) + (py * py) / (ry * ry);
        if (pl > 1) {
            pl = Math.sqrt(pl);
            rx *= pl;
            ry *= pl;
        }
        var a00 = cos_th / rx;
        var a01 = sin_th / rx;
        var a10 = (-sin_th) / ry;
        var a11 = (cos_th) / ry;
        var x0 = a00 * ox + a01 * oy;
        var y0 = a10 * ox + a11 * oy;
        var x1 = a00 * x + a01 * y;
        var y1 = a10 * x + a11 * y;
        var d = (x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0);
        var sfactor_sq = 1 / d - 0.25;
        if (sfactor_sq < 0) {
            sfactor_sq = 0;
        }
        var sfactor = Math.sqrt(sfactor_sq);
        if (sweep === large) {
            sfactor = -sfactor;
        }
        var xc = 0.5 * (x0 + x1) - sfactor * (y1 - y0);
        var yc = 0.5 * (y0 + y1) + sfactor * (x1 - x0);
        var th0 = Math.atan2(y0 - yc, x0 - xc);
        var th1 = Math.atan2(y1 - yc, x1 - xc);
        var th_arc = th1 - th0;
        if (th_arc < 0 && sweep === 1) {
            th_arc += 2 * Math.PI;
        } else {
            if (th_arc > 0 && sweep === 0) {
                th_arc -= 2 * Math.PI;
            }
        }
        var segments = Math.ceil(Math.abs(th_arc / (Math.PI * 0.5 + 0.001)));
        var result = [];
        for (var i = 0; i < segments; i++) {
            var th2 = th0 + i * th_arc / segments;
            var th3 = th0 + (i + 1) * th_arc / segments;
            result[i] = [xc, yc, th2, th3, rx, ry, sin_th, cos_th];
        }
        arcToSegmentsCache[argsString] = result;
        return result;
    }
    function segmentToBezier(cx, cy, th0, th1, rx, ry, sin_th, cos_th) {
        argsString = _join.call(arguments);
        if (segmentToBezierCache[argsString]) {
            return segmentToBezierCache[argsString];
        }
        var a00 = cos_th * rx;
        var a01 = -sin_th * ry;
        var a10 = sin_th * rx;
        var a11 = cos_th * ry;
        var th_half = 0.5 * (th1 - th0);
        var t = (8 / 3) * Math.sin(th_half * 0.5) * Math.sin(th_half * 0.5) / Math.sin(th_half);
        var x1 = cx + Math.cos(th0) - t * Math.sin(th0);
        var y1 = cy + Math.sin(th0) + t * Math.cos(th0);
        var x3 = cx + Math.cos(th1);
        var y3 = cy + Math.sin(th1);
        var x2 = x3 + t * Math.sin(th1);
        var y2 = y3 - t * Math.cos(th1);
        segmentToBezierCache[argsString] = [a00 * x1 + a01 * y1, a10 * x1 + a11 * y1, a00 * x2 + a01 * y2, a10 * x2 + a11 * y2, a00 * x3 + a01 * y3, a10 * x3 + a11 * y3];
        return segmentToBezierCache[argsString];
    }
    fabric.util.removeFromArray = removeFromArray;
    fabric.util.degreesToRadians = degreesToRadians;
    fabric.util.radiansToDegrees = radiansToDegrees;
    fabric.util.rotatePoint = rotatePoint;
    fabric.util.toFixed = toFixed;
    fabric.util.getRandomInt = getRandomInt;
    fabric.util.falseFunction = falseFunction;
    fabric.util.getKlass = getKlass;
    fabric.util.resolveNamespace = resolveNamespace;
    fabric.util.loadImage = loadImage;
    fabric.util.enlivenObjects = enlivenObjects;
    fabric.util.groupSVGElements = groupSVGElements;
    fabric.util.populateWithProperties = populateWithProperties;
    fabric.util.drawDashedLine = drawDashedLine;
    fabric.util.createCanvasElement = createCanvasElement;
    fabric.util.createImage = createImage;
    fabric.util.createAccessors = createAccessors;
    fabric.util.clipContext = clipContext;
    fabric.util.multiplyTransformMatrices = multiplyTransformMatrices;
    fabric.util.getFunctionBody = getFunctionBody;
    fabric.util.drawArc = drawArc;
})(typeof exports !== "undefined" ? exports : this);
(function () {
    var slice = Array.prototype.slice;
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (searchElement) {
            if (this === void 0 || this === null) {
                throw new TypeError();
            }
            var t = Object(this), len = t.length >>> 0;
            if (len === 0) {
                return -1;
            }
            var n = 0;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n !== n) {
                    n = 0;
                } else {
                    if (n !== 0 && n !== Number.POSITIVE_INFINITY && n !== Number.NEGATIVE_INFINITY) {
                        n = (n > 0 || -1) * Math.floor(Math.abs(n));
                    }
                }
            }
            if (n >= len) {
                return -1;
            }
            var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
            for (; k < len; k++) {
                if (k in t && t[k] === searchElement) {
                    return k;
                }
            }
            return -1;
        };
    }
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (fn, context) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this) {
                    fn.call(context, this[i], i, this);
                }
            }
        };
    }
    if (!Array.prototype.map) {
        Array.prototype.map = function (fn, context) {
            var result = [];
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this) {
                    result[i] = fn.call(context, this[i], i, this);
                }
            }
            return result;
        };
    }
    if (!Array.prototype.every) {
        Array.prototype.every = function (fn, context) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this && !fn.call(context, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }
    if (!Array.prototype.some) {
        Array.prototype.some = function (fn, context) {
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this && fn.call(context, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (fn, context) {
            var result = [], val;
            for (var i = 0, len = this.length >>> 0; i < len; i++) {
                if (i in this) {
                    val = this[i];
                    if (fn.call(context, val, i, this)) {
                        result.push(val);
                    }
                }
            }
            return result;
        };
    }
    if (!Array.prototype.reduce) {
        Array.prototype.reduce = function (fn) {
            var len = this.length >>> 0, i = 0, rv;
            if (arguments.length > 1) {
                rv = arguments[1];
            } else {
                do {
                    if (i in this) {
                        rv = this[i++];
                        break;
                    }
                    if (++i >= len) {
                        throw new TypeError();
                    }
                } while (true);
            }
            for (; i < len; i++) {
                if (i in this) {
                    rv = fn.call(null, rv, this[i], i, this);
                }
            }
            return rv;
        };
    }
    function invoke(array, method) {
        var args = slice.call(arguments, 2), result = [];
        for (var i = 0, len = array.length; i < len; i++) {
            result[i] = args.length ? array[i][method].apply(array[i], args) : array[i][method].call(array[i]);
        }
        return result;
    }
    function max(array, byProperty) {
        if (!array || array.length === 0) {
            return undefined;
        }
        var i = array.length - 1, result = byProperty ? array[i][byProperty] : array[i];
        if (byProperty) {
            while (i--) {
                if (array[i][byProperty] >= result) {
                    result = array[i][byProperty];
                }
            }
        } else {
            while (i--) {
                if (array[i] >= result) {
                    result = array[i];
                }
            }
        }
        return result;
    }
    function min(array, byProperty) {
        if (!array || array.length === 0) {
            return undefined;
        }
        var i = array.length - 1, result = byProperty ? array[i][byProperty] : array[i];
        if (byProperty) {
            while (i--) {
                if (array[i][byProperty] < result) {
                    result = array[i][byProperty];
                }
            }
        } else {
            while (i--) {
                if (array[i] < result) {
                    result = array[i];
                }
            }
        }
        return result;
    }
    fabric.util.array = {invoke:invoke, min:min, max:max};
})();
(function () {
    function extend(destination, source) {
        for (var property in source) {
            destination[property] = source[property];
        }
        return destination;
    }
    function clone(object) {
        return extend({}, object);
    }
    fabric.util.object = {extend:extend, clone:clone};
})();
(function () {
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "");
        };
    }
    function camelize(string) {
        return string.replace(/-+(.)?/g, function (match, character) {
            return character ? character.toUpperCase() : "";
        });
    }
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
    function escapeXml(string) {
        return string.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    fabric.util.string = {camelize:camelize, capitalize:capitalize, escapeXml:escapeXml};
}());
(function () {
    var slice = Array.prototype.slice, apply = Function.prototype.apply, Dummy = function () {
    };
    if (!Function.prototype.bind) {
        Function.prototype.bind = function (thisArg) {
            var fn = this, args = slice.call(arguments, 1), bound;
            if (args.length) {
                bound = function () {
                    return apply.call(fn, this instanceof Dummy ? this : thisArg, args.concat(slice.call(arguments)));
                };
            } else {
                bound = function () {
                    return apply.call(fn, this instanceof Dummy ? this : thisArg, arguments);
                };
            }
            Dummy.prototype = this.prototype;
            bound.prototype = new Dummy();
            return bound;
        };
    }
})();
(function () {
    var slice = Array.prototype.slice, emptyFunction = function () {
    };
    var IS_DONTENUM_BUGGY = (function () {
        for (var p in {toString:1}) {
            if (p === "toString") {
                return false;
            }
        }
        return true;
    })();
    var addMethods = function (klass, source, parent) {
        for (var property in source) {
            if (property in klass.prototype && typeof klass.prototype[property] === "function" && (source[property] + "").indexOf("callSuper") > -1) {
                klass.prototype[property] = (function (property) {
                    return function () {
                        var superclass = this.constructor.superclass;
                        this.constructor.superclass = parent;
                        var returnValue = source[property].apply(this, arguments);
                        this.constructor.superclass = superclass;
                        if (property !== "initialize") {
                            return returnValue;
                        }
                    };
                })(property);
            } else {
                klass.prototype[property] = source[property];
            }
            if (IS_DONTENUM_BUGGY) {
                if (source.toString !== Object.prototype.toString) {
                    klass.prototype.toString = source.toString;
                }
                if (source.valueOf !== Object.prototype.valueOf) {
                    klass.prototype.valueOf = source.valueOf;
                }
            }
        }
    };
    function Subclass() {
    }
    function callSuper(methodName) {
        var fn = this.constructor.superclass.prototype[methodName];
        return (arguments.length > 1) ? fn.apply(this, slice.call(arguments, 1)) : fn.call(this);
    }
    function createClass() {
        var parent = null, properties = slice.call(arguments, 0);
        if (typeof properties[0] === "function") {
            parent = properties.shift();
        }
        function klass() {
            this.initialize.apply(this, arguments);
        }
        klass.superclass = parent;
        klass.subclasses = [];
        if (parent) {
            Subclass.prototype = parent.prototype;
            klass.prototype = new Subclass();
            parent.subclasses.push(klass);
        }
        for (var i = 0, length = properties.length; i < length; i++) {
            addMethods(klass, properties[i], parent);
        }
        if (!klass.prototype.initialize) {
            klass.prototype.initialize = emptyFunction;
        }
        klass.prototype.constructor = klass;
        klass.prototype.callSuper = callSuper;
        return klass;
    }
    fabric.util.createClass = createClass;
})();
(function () {
    function areHostMethods(object) {
        var methodNames = Array.prototype.slice.call(arguments, 1), t, i, len = methodNames.length;
        for (i = 0; i < len; i++) {
            t = typeof object[methodNames[i]];
            if (!(/^(?:function|object|unknown)$/).test(t)) {
                return false;
            }
        }
        return true;
    }
    var getUniqueId = (function () {
        var uid = 0;
        return function (element) {
            return element.__uniqueID || (element.__uniqueID = "uniqueID__" + uid++);
        };
    })();
    var getElement, setElement;
    (function () {
        var elements = {};
        getElement = function (uid) {
            return elements[uid];
        };
        setElement = function (uid, element) {
            elements[uid] = element;
        };
    })();
    function createListener(uid, handler) {
        return {handler:handler, wrappedHandler:createWrappedHandler(uid, handler)};
    }
    function createWrappedHandler(uid, handler) {
        return function (e) {
            handler.call(getElement(uid), e || fabric.window.event);
        };
    }
    function createDispatcher(uid, eventName) {
        return function (e) {
            if (handlers[uid] && handlers[uid][eventName]) {
                var handlersForEvent = handlers[uid][eventName];
                for (var i = 0, len = handlersForEvent.length; i < len; i++) {
                    handlersForEvent[i].call(this, e || fabric.window.event);
                }
            }
        };
    }
    var shouldUseAddListenerRemoveListener = (areHostMethods(fabric.document.documentElement, "addEventListener", "removeEventListener") && areHostMethods(fabric.window, "addEventListener", "removeEventListener")), shouldUseAttachEventDetachEvent = (areHostMethods(fabric.document.documentElement, "attachEvent", "detachEvent") && areHostMethods(fabric.window, "attachEvent", "detachEvent")), listeners = {}, handlers = {}, addListener, removeListener;
    if (shouldUseAddListenerRemoveListener) {
        addListener = function (element, eventName, handler) {
            element.addEventListener(eventName, handler, false);
        };
        removeListener = function (element, eventName, handler) {
            element.removeEventListener(eventName, handler, false);
        };
    } else {
        if (shouldUseAttachEventDetachEvent) {
            addListener = function (element, eventName, handler) {
                var uid = getUniqueId(element);
                setElement(uid, element);
                if (!listeners[uid]) {
                    listeners[uid] = {};
                }
                if (!listeners[uid][eventName]) {
                    listeners[uid][eventName] = [];
                }
                var listener = createListener(uid, handler);
                listeners[uid][eventName].push(listener);
                element.attachEvent("on" + eventName, listener.wrappedHandler);
            };
            removeListener = function (element, eventName, handler) {
                var uid = getUniqueId(element), listener;
                if (listeners[uid] && listeners[uid][eventName]) {
                    for (var i = 0, len = listeners[uid][eventName].length; i < len; i++) {
                        listener = listeners[uid][eventName][i];
                        if (listener && listener.handler === handler) {
                            element.detachEvent("on" + eventName, listener.wrappedHandler);
                            listeners[uid][eventName][i] = null;
                        }
                    }
                }
            };
        } else {
            addListener = function (element, eventName, handler) {
                var uid = getUniqueId(element);
                if (!handlers[uid]) {
                    handlers[uid] = {};
                }
                if (!handlers[uid][eventName]) {
                    handlers[uid][eventName] = [];
                    var existingHandler = element["on" + eventName];
                    if (existingHandler) {
                        handlers[uid][eventName].push(existingHandler);
                    }
                    element["on" + eventName] = createDispatcher(uid, eventName);
                }
                handlers[uid][eventName].push(handler);
            };
            removeListener = function (element, eventName, handler) {
                var uid = getUniqueId(element);
                if (handlers[uid] && handlers[uid][eventName]) {
                    var handlersForEvent = handlers[uid][eventName];
                    for (var i = 0, len = handlersForEvent.length; i < len; i++) {
                        if (handlersForEvent[i] === handler) {
                            handlersForEvent.splice(i, 1);
                        }
                    }
                }
            };
        }
    }
    fabric.util.addListener = addListener;
    fabric.util.removeListener = removeListener;
    function getPointer(event, upperCanvasEl) {
        event || (event = fabric.window.event);
        var element = event.target || (typeof event.srcElement !== "unknown" ? event.srcElement : null), body = fabric.document.body || {scrollLeft:0, scrollTop:0}, docElement = fabric.document.documentElement, orgElement = element, scrollLeft = 0, scrollTop = 0, firstFixedAncestor;
        while (element && element.parentNode && !firstFixedAncestor) {
            element = element.parentNode;
            if (element !== fabric.document && fabric.util.getElementStyle(element, "position") === "fixed") {
                firstFixedAncestor = element;
            }
            if (element !== fabric.document && orgElement !== upperCanvasEl && fabric.util.getElementStyle(element, "position") === "absolute") {
                scrollLeft = 0;
                scrollTop = 0;
            } else {
                if (element === fabric.document) {
                    scrollLeft = body.scrollLeft || docElement.scrollLeft || 0;
                    scrollTop = body.scrollTop || docElement.scrollTop || 0;
                } else {
                    scrollLeft += element.scrollLeft || 0;
                    scrollTop += element.scrollTop || 0;
                }
            }
        }
        return {x:pointerX(event) + scrollLeft, y:pointerY(event) + scrollTop};
    }
    var pointerX = function (event) {
        return (typeof event.clientX !== "unknown" ? event.clientX : 0);
    };
    var pointerY = function (event) {
        return (typeof event.clientY !== "unknown" ? event.clientY : 0);
    };
    if (fabric.isTouchSupported) {
        pointerX = function (event) {
            if (event.type !== "touchend") {
                return (event.touches && event.touches[0] ? (event.touches[0].pageX - (event.touches[0].pageX - event.touches[0].clientX)) || event.clientX : event.clientX);
            }
            return (event.changedTouches && event.changedTouches[0] ? (event.changedTouches[0].pageX - (event.changedTouches[0].pageX - event.changedTouches[0].clientX)) || event.clientX : event.clientX);
        };
        pointerY = function (event) {
            if (event.type !== "touchend") {
                return (event.touches && event.touches[0] ? (event.touches[0].pageY - (event.touches[0].pageY - event.touches[0].clientY)) || event.clientY : event.clientY);
            }
            return (event.changedTouches && event.changedTouches[0] ? (event.changedTouches[0].pageY - (event.changedTouches[0].pageY - event.changedTouches[0].clientY)) || event.clientY : event.clientY);
        };
    }
    fabric.util.getPointer = getPointer;
    fabric.util.object.extend(fabric.util, fabric.Observable);
})();
(function () {
    function setStyle(element, styles) {
        var elementStyle = element.style;
        if (!elementStyle) {
            return element;
        }
        if (typeof styles === "string") {
            element.style.cssText += ";" + styles;
            return styles.indexOf("opacity") > -1 ? setOpacity(element, styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element;
        }
        for (var property in styles) {
            if (property === "opacity") {
                setOpacity(element, styles[property]);
            } else {
                var normalizedProperty = (property === "float" || property === "cssFloat") ? (typeof elementStyle.styleFloat === "undefined" ? "cssFloat" : "styleFloat") : property;
                elementStyle[normalizedProperty] = styles[property];
            }
        }
        return element;
    }
    var parseEl = fabric.document.createElement("div"), supportsOpacity = typeof parseEl.style.opacity === "string", supportsFilters = typeof parseEl.style.filter === "string", reOpacity = /alpha\s*\(\s*opacity\s*=\s*([^\)]+)\)/, setOpacity = function (element) {
        return element;
    };
    if (supportsOpacity) {
        setOpacity = function (element, value) {
            element.style.opacity = value;
            return element;
        };
    } else {
        if (supportsFilters) {
            setOpacity = function (element, value) {
                var es = element.style;
                if (element.currentStyle && !element.currentStyle.hasLayout) {
                    es.zoom = 1;
                }
                if (reOpacity.test(es.filter)) {
                    value = value >= 0.9999 ? "" : ("alpha(opacity=" + (value * 100) + ")");
                    es.filter = es.filter.replace(reOpacity, value);
                } else {
                    es.filter += " alpha(opacity=" + (value * 100) + ")";
                }
                return element;
            };
        }
    }
    fabric.util.setStyle = setStyle;
})();
(function () {
    var _slice = Array.prototype.slice;
    function getById(id) {
        return typeof id === "string" ? fabric.document.getElementById(id) : id;
    }
    var toArray = function (arrayLike) {
        return _slice.call(arrayLike, 0);
    };
    var sliceCanConvertNodelists;
    try {
        sliceCanConvertNodelists = toArray(fabric.document.childNodes) instanceof Array;
    }
    catch (err) {
    }
    if (!sliceCanConvertNodelists) {
        toArray = function (arrayLike) {
            var arr = new Array(arrayLike.length), i = arrayLike.length;
            while (i--) {
                arr[i] = arrayLike[i];
            }
            return arr;
        };
    }
    function makeElement(tagName, attributes) {
        var el = fabric.document.createElement(tagName);
        for (var prop in attributes) {
            if (prop === "class") {
                el.className = attributes[prop];
            } else {
                if (prop === "for") {
                    el.htmlFor = attributes[prop];
                } else {
                    el.setAttribute(prop, attributes[prop]);
                }
            }
        }
        return el;
    }
    function addClass(element, className) {
        if ((" " + element.className + " ").indexOf(" " + className + " ") === -1) {
            element.className += (element.className ? " " : "") + className;
        }
    }
    function wrapElement(element, wrapper, attributes) {
        if (typeof wrapper === "string") {
            wrapper = makeElement(wrapper, attributes);
        }
        if (element.parentNode) {
            element.parentNode.replaceChild(wrapper, element);
        }
        wrapper.appendChild(element);
        return wrapper;
    }
    function getElementOffset(element) {
        var docElem, win, box = {left:0, top:0}, doc = element && element.ownerDocument, offset = {left:0, top:0}, offsetAttributes = {"borderLeftWidth":"left", "borderTopWidth":"top", "paddingLeft":"left", "paddingTop":"top"};
        if (!doc) {
            return {left:0, top:0};
        }
        for (var attr in offsetAttributes) {
            offset[offsetAttributes[attr]] += parseInt(getElementStyle(element, attr), 10) || 0;
        }
        docElem = doc.documentElement;
        if (typeof element.getBoundingClientRect !== "undefined") {
            box = element.getBoundingClientRect();
        }
        if (doc != null && doc === doc.window) {
            win = doc;
        } else {
            win = doc.nodeType === 9 && (doc.defaultView || doc.parentWindow);
        }
        return {left:box.left + (win.pageXOffset || docElem.scrollLeft) - (docElem.clientLeft || 0) + offset.left, top:box.top + (win.pageYOffset || docElem.scrollTop) - (docElem.clientTop || 0) + offset.top};
    }
    function getElementStyle(element, attr) {
        if (!element.style) {
            element.style = {};
        }
        if (fabric.document.defaultView && fabric.document.defaultView.getComputedStyle) {
            return fabric.document.defaultView.getComputedStyle(element, null)[attr];
        } else {
            var value = element.style[attr];
            if (!value && element.currentStyle) {
                value = element.currentStyle[attr];
            }
            return value;
        }
    }
    (function () {
        var style = fabric.document.documentElement.style;
        var selectProp = "userSelect" in style ? "userSelect" : "MozUserSelect" in style ? "MozUserSelect" : "WebkitUserSelect" in style ? "WebkitUserSelect" : "KhtmlUserSelect" in style ? "KhtmlUserSelect" : "";
        function makeElementUnselectable(element) {
            if (typeof element.onselectstart !== "undefined") {
                element.onselectstart = fabric.util.falseFunction;
            }
            if (selectProp) {
                element.style[selectProp] = "none";
            } else {
                if (typeof element.unselectable === "string") {
                    element.unselectable = "on";
                }
            }
            return element;
        }
        function makeElementSelectable(element) {
            if (typeof element.onselectstart !== "undefined") {
                element.onselectstart = null;
            }
            if (selectProp) {
                element.style[selectProp] = "";
            } else {
                if (typeof element.unselectable === "string") {
                    element.unselectable = "";
                }
            }
            return element;
        }
        fabric.util.makeElementUnselectable = makeElementUnselectable;
        fabric.util.makeElementSelectable = makeElementSelectable;
    })();
    (function () {
        function getScript(url, callback) {
            var headEl = fabric.document.getElementsByTagName("head")[0], scriptEl = fabric.document.createElement("script"), loading = true;
            scriptEl.onload = scriptEl.onreadystatechange = function (e) {
                if (loading) {
                    if (typeof this.readyState === "string" && this.readyState !== "loaded" && this.readyState !== "complete") {
                        return;
                    }
                    loading = false;
                    callback(e || fabric.window.event);
                    scriptEl = scriptEl.onload = scriptEl.onreadystatechange = null;
                }
            };
            scriptEl.src = url;
            headEl.appendChild(scriptEl);
        }
        fabric.util.getScript = getScript;
    })();
    fabric.util.getById = getById;
    fabric.util.toArray = toArray;
    fabric.util.makeElement = makeElement;
    fabric.util.addClass = addClass;
    fabric.util.wrapElement = wrapElement;
    fabric.util.getElementOffset = getElementOffset;
    fabric.util.getElementStyle = getElementStyle;
})();
(function () {
    function addParamToUrl(url, param) {
        return url + (/\?/.test(url) ? "&" : "?") + param;
    }
    var makeXHR = (function () {
        var factories = [function () {
            return new ActiveXObject("Microsoft.XMLHTTP");
        }, function () {
            return new ActiveXObject("Msxml2.XMLHTTP");
        }, function () {
            return new ActiveXObject("Msxml2.XMLHTTP.3.0");
        }, function () {
            return new XMLHttpRequest();
        }];
        for (var i = factories.length; i--; ) {
            try {
                var req = factories[i]();
                if (req) {
                    return factories[i];
                }
            }
            catch (err) {
            }
        }
    })();
    function emptyFn() {
    }
    function request(url, options) {
        options || (options = {});
        var method = options.method ? options.method.toUpperCase() : "GET", onComplete = options.onComplete || function () {
        }, xhr = makeXHR(), body;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                onComplete(xhr);
                xhr.onreadystatechange = emptyFn;
            }
        };
        if (method === "GET") {
            body = null;
            if (typeof options.parameters === "string") {
                url = addParamToUrl(url, options.parameters);
            }
        }
        xhr.open(method, url, true);
        if (method === "POST" || method === "PUT") {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        }
        xhr.send(body);
        return xhr;
    }
    fabric.util.request = request;
})();
(function () {
    function animate(options) {
        options || (options = {});
        var start = +new Date(), duration = options.duration || 500, finish = start + duration, time, onChange = options.onChange || function () {
        }, abort = options.abort || function () {
            return false;
        }, easing = options.easing || function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        }, startValue = "startValue" in options ? options.startValue : 0, endValue = "endValue" in options ? options.endValue : 100, byValue = options.byValue || endValue - startValue;
        options.onStart && options.onStart();
        (function tick() {
            time = +new Date();
            var currentTime = time > finish ? duration : (time - start);
            if (abort()) {
                options.onComplete && options.onComplete();
                return;
            }
            onChange(easing(currentTime, startValue, byValue, duration));
            if (time > finish) {
                options.onComplete && options.onComplete();
                return;
            }
            requestAnimFrame(tick);
        })();
    }
    var _requestAnimFrame = fabric.window.requestAnimationFrame || fabric.window.webkitRequestAnimationFrame || fabric.window.mozRequestAnimationFrame || fabric.window.oRequestAnimationFrame || fabric.window.msRequestAnimationFrame || function (callback) {
        fabric.window.setTimeout(callback, 1000 / 60);
    };
    var requestAnimFrame = function () {
        return _requestAnimFrame.apply(fabric.window, arguments);
    };
    fabric.util.animate = animate;
    fabric.util.requestAnimFrame = requestAnimFrame;
})();
(function () {
    function easeInQuad(t, b, c, d) {
        return c * (t /= d) * t + b;
    }
    function easeOutQuad(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    }
    function easeInOutQuad(t, b, c, d) {
        t /= (d / 2);
        if (t < 1) {
            return c / 2 * t * t + b;
        }
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    }
    function easeInCubic(t, b, c, d) {
        return c * (t /= d) * t * t + b;
    }
    function easeOutCubic(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    }
    function easeInOutCubic(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    }
    function easeInQuart(t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    }
    function easeOutQuart(t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    }
    function easeInOutQuart(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t * t * t + b;
        }
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    }
    function easeInQuint(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    }
    function easeOutQuint(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    }
    function easeInOutQuint(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    }
    function easeInSine(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    }
    function easeOutSine(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    }
    function easeInOutSine(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    }
    function easeInExpo(t, b, c, d) {
        return (t === 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    }
    function easeOutExpo(t, b, c, d) {
        return (t === d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    }
    function easeInOutExpo(t, b, c, d) {
        if (t === 0) {
            return b;
        }
        if (t === d) {
            return b + c;
        }
        t /= d / 2;
        if (t < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        }
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
    function easeInCirc(t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    }
    function easeOutCirc(t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    }
    function easeInOutCirc(t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    }
    function easeInElastic(t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t === 0) {
            return b;
        }
        t /= d;
        if (t === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    }
    function easeOutElastic(t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t === 0) {
            return b;
        }
        t /= d;
        if (t === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    }
    function easeInOutElastic(t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t === 0) {
            return b;
        }
        t /= d / 2;
        if (t === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        if (t < 1) {
            return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        }
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
    }
    function easeInBack(t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    }
    function easeOutBack(t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    }
    function easeInOutBack(t, b, c, d, s) {
        if (s === undefined) {
            s = 1.70158;
        }
        t /= d / 2;
        if (t < 1) {
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        }
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }
    function easeInBounce(t, b, c, d) {
        return c - easeOutBounce(d - t, 0, c, d) + b;
    }
    function easeOutBounce(t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else {
            if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            } else {
                if (t < (2.5 / 2.75)) {
                    return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
                } else {
                    return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
                }
            }
        }
    }
    function easeInOutBounce(t, b, c, d) {
        if (t < d / 2) {
            return easeInBounce(t * 2, 0, c, d) * 0.5 + b;
        }
        return easeOutBounce(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
    }
    fabric.util.ease = {easeInQuad:easeInQuad, easeOutQuad:easeOutQuad, easeInOutQuad:easeInOutQuad, easeInCubic:easeInCubic, easeOutCubic:easeOutCubic, easeInOutCubic:easeInOutCubic, easeInQuart:easeInQuart, easeOutQuart:easeOutQuart, easeInOutQuart:easeInOutQuart, easeInQuint:easeInQuint, easeOutQuint:easeOutQuint, easeInOutQuint:easeInOutQuint, easeInSine:easeInSine, easeOutSine:easeOutSine, easeInOutSine:easeInOutSine, easeInExpo:easeInExpo, easeOutExpo:easeOutExpo, easeInOutExpo:easeInOutExpo, easeInCirc:easeInCirc, easeOutCirc:easeOutCirc, easeInOutCirc:easeInOutCirc, easeInElastic:easeInElastic, easeOutElastic:easeOutElastic, easeInOutElastic:easeInOutElastic, easeInBack:easeInBack, easeOutBack:easeOutBack, easeInOutBack:easeInOutBack, easeInBounce:easeInBounce, easeOutBounce:easeOutBounce, easeInOutBounce:easeInOutBounce};
}());
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, capitalize = fabric.util.string.capitalize, clone = fabric.util.object.clone, toFixed = fabric.util.toFixed, multiplyTransformMatrices = fabric.util.multiplyTransformMatrices;
    fabric.SHARED_ATTRIBUTES = ["transform", "fill", "fill-opacity", "fill-rule", "opacity", "stroke", "stroke-dasharray", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity", "stroke-width"];
    var attributesMap = {"fill-opacity":"fillOpacity", "fill-rule":"fillRule", "font-family":"fontFamily", "font-size":"fontSize", "font-style":"fontStyle", "font-weight":"fontWeight", "cx":"left", "x":"left", "r":"radius", "stroke-dasharray":"strokeDashArray", "stroke-linecap":"strokeLineCap", "stroke-linejoin":"strokeLineJoin", "stroke-miterlimit":"strokeMiterLimit", "stroke-opacity":"strokeOpacity", "stroke-width":"strokeWidth", "text-decoration":"textDecoration", "cy":"top", "y":"top", "transform":"transformMatrix"};
    var colorAttributes = {"stroke":"strokeOpacity", "fill":"fillOpacity"};
    function normalizeAttr(attr) {
        if (attr in attributesMap) {
            return attributesMap[attr];
        }
        return attr;
    }
    function normalizeValue(attr, value, parentAttributes) {
        var isArray;
        if ((attr === "fill" || attr === "stroke") && value === "none") {
            value = "";
        } else {
            if (attr === "fillRule") {
                value = (value === "evenodd") ? "destination-over" : value;
            } else {
                if (attr === "strokeDashArray") {
                    value = value.replace(/,/g, " ").split(/\s+/);
                } else {
                    if (attr === "transformMatrix") {
                        if (parentAttributes && parentAttributes.transformMatrix) {
                            value = multiplyTransformMatrices(parentAttributes.transformMatrix, fabric.parseTransformAttribute(value));
                        } else {
                            value = fabric.parseTransformAttribute(value);
                        }
                    }
                }
            }
        }
        isArray = Object.prototype.toString.call(value) === "[object Array]";
        var parsed = isArray ? value.map(parseFloat) : parseFloat(value);
        return (!isArray && isNaN(parsed) ? value : parsed);
    }
    function _setStrokeFillOpacity(attributes) {
        for (var attr in colorAttributes) {
            if (!attributes[attr] || typeof attributes[colorAttributes[attr]] === "undefined") {
                continue;
            }
            if (attributes[attr].indexOf("url(") === 0) {
                continue;
            }
            var color = new fabric.Color(attributes[attr]);
            attributes[attr] = color.setAlpha(toFixed(color.getAlpha() * attributes[colorAttributes[attr]], 2)).toRgba();
            delete attributes[colorAttributes[attr]];
        }
        return attributes;
    }
    function parseAttributes(element, attributes) {
        if (!element) {
            return;
        }
        var value, parentAttributes = {};
        if (element.parentNode && /^g$/i.test(element.parentNode.nodeName)) {
            parentAttributes = fabric.parseAttributes(element.parentNode, attributes);
        }
        var ownAttributes = attributes.reduce(function (memo, attr) {
            value = element.getAttribute(attr);
            if (value) {
                attr = normalizeAttr(attr);
                value = normalizeValue(attr, value, parentAttributes);
                memo[attr] = value;
            }
            return memo;
        }, {});
        ownAttributes = extend(ownAttributes, extend(getGlobalStylesForElement(element), fabric.parseStyleAttribute(element)));
        return _setStrokeFillOpacity(extend(parentAttributes, ownAttributes));
    }
    fabric.parseTransformAttribute = (function () {
        function rotateMatrix(matrix, args) {
            var angle = args[0];
            matrix[0] = Math.cos(angle);
            matrix[1] = Math.sin(angle);
            matrix[2] = -Math.sin(angle);
            matrix[3] = Math.cos(angle);
        }
        function scaleMatrix(matrix, args) {
            var multiplierX = args[0], multiplierY = (args.length === 2) ? args[1] : args[0];
            matrix[0] = multiplierX;
            matrix[3] = multiplierY;
        }
        function skewXMatrix(matrix, args) {
            matrix[2] = args[0];
        }
        function skewYMatrix(matrix, args) {
            matrix[1] = args[0];
        }
        function translateMatrix(matrix, args) {
            matrix[4] = args[0];
            if (args.length === 2) {
                matrix[5] = args[1];
            }
        }
        var iMatrix = [1, 0, 0, 1, 0, 0], number = "(?:[-+]?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)", comma_wsp = "(?:\\s+,?\\s*|,\\s*)", skewX = "(?:(skewX)\\s*\\(\\s*(" + number + ")\\s*\\))", skewY = "(?:(skewY)\\s*\\(\\s*(" + number + ")\\s*\\))", rotate = "(?:(rotate)\\s*\\(\\s*(" + number + ")(?:" + comma_wsp + "(" + number + ")" + comma_wsp + "(" + number + "))?\\s*\\))", scale = "(?:(scale)\\s*\\(\\s*(" + number + ")(?:" + comma_wsp + "(" + number + "))?\\s*\\))", translate = "(?:(translate)\\s*\\(\\s*(" + number + ")(?:" + comma_wsp + "(" + number + "))?\\s*\\))", matrix = "(?:(matrix)\\s*\\(\\s*" + "(" + number + ")" + comma_wsp + "(" + number + ")" + comma_wsp + "(" + number + ")" + comma_wsp + "(" + number + ")" + comma_wsp + "(" + number + ")" + comma_wsp + "(" + number + ")" + "\\s*\\))", transform = "(?:" + matrix + "|" + translate + "|" + scale + "|" + rotate + "|" + skewX + "|" + skewY + ")", transforms = "(?:" + transform + "(?:" + comma_wsp + transform + ")*" + ")", transform_list = "^\\s*(?:" + transforms + "?)\\s*$", reTransformList = new RegExp(transform_list), reTransform = new RegExp(transform, "g");
        return function (attributeValue) {
            var matrix = iMatrix.concat();
            var matrices = [];
            if (!attributeValue || (attributeValue && !reTransformList.test(attributeValue))) {
                return matrix;
            }
            attributeValue.replace(reTransform, function (match) {
                var m = new RegExp(transform).exec(match).filter(function (match) {
                    return (match !== "" && match != null);
                }), operation = m[1], args = m.slice(2).map(parseFloat);
                switch (operation) {
                  case "translate":
                    translateMatrix(matrix, args);
                    break;
                  case "rotate":
                    rotateMatrix(matrix, args);
                    break;
                  case "scale":
                    scaleMatrix(matrix, args);
                    break;
                  case "skewX":
                    skewXMatrix(matrix, args);
                    break;
                  case "skewY":
                    skewYMatrix(matrix, args);
                    break;
                  case "matrix":
                    matrix = args;
                    break;
                }
                matrices.push(matrix.concat());
                matrix = iMatrix.concat();
            });
            var combinedMatrix = matrices[0];
            while (matrices.length > 1) {
                matrices.shift();
                combinedMatrix = fabric.util.multiplyTransformMatrices(combinedMatrix, matrices[0]);
            }
            return combinedMatrix;
        };
    })();
    function parsePointsAttribute(points) {
        if (!points) {
            return null;
        }
        points = points.trim();
        var asPairs = points.indexOf(",") > -1;
        points = points.split(/\s+/);
        var parsedPoints = [], i, len;
        if (asPairs) {
            i = 0;
            len = points.length;
            for (; i < len; i++) {
                var pair = points[i].split(",");
                parsedPoints.push({x:parseFloat(pair[0]), y:parseFloat(pair[1])});
            }
        } else {
            i = 0;
            len = points.length;
            for (; i < len; i += 2) {
                parsedPoints.push({x:parseFloat(points[i]), y:parseFloat(points[i + 1])});
            }
        }
        if (parsedPoints.length % 2 !== 0) {
        }
        return parsedPoints;
    }
    function parseFontDeclaration(value, oStyle) {
        var match = value.match(/(normal|italic)?\s*(normal|small-caps)?\s*(normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)?\s*(\d+)px(?:\/(normal|[\d\.]+))?\s+(.*)/);
        if (!match) {
            return;
        }
        var fontStyle = match[1];
        var fontWeight = match[3];
        var fontSize = match[4];
        var lineHeight = match[5];
        var fontFamily = match[6];
        if (fontStyle) {
            oStyle.fontStyle = fontStyle;
        }
        if (fontWeight) {
            oStyle.fontSize = isNaN(parseFloat(fontWeight)) ? fontWeight : parseFloat(fontWeight);
        }
        if (fontSize) {
            oStyle.fontSize = parseFloat(fontSize);
        }
        if (fontFamily) {
            oStyle.fontFamily = fontFamily;
        }
        if (lineHeight) {
            oStyle.lineHeight = lineHeight === "normal" ? 1 : lineHeight;
        }
    }
    function parseStyleAttribute(element) {
        var oStyle = {}, style = element.getAttribute("style"), attr, value;
        if (!style) {
            return oStyle;
        }
        if (typeof style === "string") {
            style.replace(/;$/, "").split(";").forEach(function (chunk) {
                var pair = chunk.split(":");
                attr = normalizeAttr(pair[0].trim().toLowerCase());
                value = normalizeValue(attr, pair[1].trim());
                if (attr === "font") {
                    parseFontDeclaration(value, oStyle);
                } else {
                    oStyle[attr] = value;
                }
            });
        } else {
            for (var prop in style) {
                if (typeof style[prop] === "undefined") {
                    continue;
                }
                attr = normalizeAttr(prop.toLowerCase());
                value = normalizeValue(attr, style[prop]);
                if (attr === "font") {
                    parseFontDeclaration(value, oStyle);
                } else {
                    oStyle[attr] = value;
                }
            }
        }
        return oStyle;
    }
    function resolveGradients(instances) {
        for (var i = instances.length; i--; ) {
            var instanceFillValue = instances[i].get("fill");
            if (/^url\(/.test(instanceFillValue)) {
                var gradientId = instanceFillValue.slice(5, instanceFillValue.length - 1);
                if (fabric.gradientDefs[gradientId]) {
                    instances[i].set("fill", fabric.Gradient.fromElement(fabric.gradientDefs[gradientId], instances[i]));
                }
            }
        }
    }
    function parseElements(elements, callback, options, reviver) {
        var instances = new Array(elements.length), i = elements.length;
        function checkIfDone() {
            if (--i === 0) {
                instances = instances.filter(function (el) {
                    return el != null;
                });
                resolveGradients(instances);
                callback(instances);
            }
        }
        for (var index = 0, el, len = elements.length; index < len; index++) {
            el = elements[index];
            var klass = fabric[capitalize(el.tagName)];
            if (klass && klass.fromElement) {
                try {
                    if (klass.async) {
                        klass.fromElement(el, (function (index, el) {
                            return function (obj) {
                                reviver && reviver(el, obj);
                                instances.splice(index, 0, obj);
                                checkIfDone();
                            };
                        })(index, el), options);
                    } else {
                        var obj = klass.fromElement(el, options);
                        reviver && reviver(el, obj);
                        instances.splice(index, 0, obj);
                        checkIfDone();
                    }
                }
                catch (err) {
                    fabric.log(err);
                }
            } else {
                checkIfDone();
            }
        }
    }
    function getCSSRules(doc) {
        var styles = doc.getElementsByTagName("style"), allRules = {}, rules;
        for (var i = 0, len = styles.length; i < len; i++) {
            var styleContents = styles[0].textContent;
            styleContents = styleContents.replace(/\/\*[\s\S]*?\*\//g, "");
            rules = styleContents.match(/[^{]*\{[\s\S]*?\}/g);
            rules = rules.map(function (rule) {
                return rule.trim();
            });
            rules.forEach(function (rule) {
                var match = rule.match(/([\s\S]*?)\s*\{([^}]*)\}/);
                rule = match[1];
                var declaration = match[2].trim(), propertyValuePairs = declaration.replace(/;$/, "").split(/\s*;\s*/);
                if (!allRules[rule]) {
                    allRules[rule] = {};
                }
                for (var i = 0, len = propertyValuePairs.length; i < len; i++) {
                    var pair = propertyValuePairs[i].split(/\s*:\s*/), property = pair[0], value = pair[1];
                    allRules[rule][property] = value;
                }
            });
        }
        return allRules;
    }
    function getGlobalStylesForElement(element) {
        var nodeName = element.nodeName, className = element.getAttribute("class"), id = element.getAttribute("id"), styles = {};
        for (var rule in fabric.cssRules) {
            var ruleMatchesElement = (className && new RegExp("^\\." + className).test(rule)) || (id && new RegExp("^#" + id).test(rule)) || (new RegExp("^" + nodeName).test(rule));
            if (ruleMatchesElement) {
                for (var property in fabric.cssRules[rule]) {
                    styles[property] = fabric.cssRules[rule][property];
                }
            }
        }
        return styles;
    }
    fabric.parseSVGDocument = (function () {
        var reAllowedSVGTagNames = /^(path|circle|polygon|polyline|ellipse|rect|line|image|text)$/;
        var reNum = "(?:[-+]?\\d+(?:\\.\\d+)?(?:e[-+]?\\d+)?)";
        var reViewBoxAttrValue = new RegExp("^" + "\\s*(" + reNum + "+)\\s*,?" + "\\s*(" + reNum + "+)\\s*,?" + "\\s*(" + reNum + "+)\\s*,?" + "\\s*(" + reNum + "+)\\s*" + "$");
        function hasAncestorWithNodeName(element, nodeName) {
            while (element && (element = element.parentNode)) {
                if (nodeName.test(element.nodeName)) {
                    return true;
                }
            }
            return false;
        }
        return function (doc, callback, reviver) {
            if (!doc) {
                return;
            }
            var startTime = new Date(), descendants = fabric.util.toArray(doc.getElementsByTagName("*"));
            if (descendants.length === 0) {
                descendants = doc.selectNodes("//*[name(.)!='svg']");
                var arr = [];
                for (var i = 0, len = descendants.length; i < len; i++) {
                    arr[i] = descendants[i];
                }
                descendants = arr;
            }
            var elements = descendants.filter(function (el) {
                return reAllowedSVGTagNames.test(el.tagName) && !hasAncestorWithNodeName(el, /^(?:pattern|defs)$/);
            });
            if (!elements || (elements && !elements.length)) {
                return;
            }
            var viewBoxAttr = doc.getAttribute("viewBox"), widthAttr = doc.getAttribute("width"), heightAttr = doc.getAttribute("height"), width = null, height = null, minX, minY;
            if (viewBoxAttr && (viewBoxAttr = viewBoxAttr.match(reViewBoxAttrValue))) {
                minX = parseInt(viewBoxAttr[1], 10);
                minY = parseInt(viewBoxAttr[2], 10);
                width = parseInt(viewBoxAttr[3], 10);
                height = parseInt(viewBoxAttr[4], 10);
            }
            width = widthAttr ? parseFloat(widthAttr) : width;
            height = heightAttr ? parseFloat(heightAttr) : height;
            var options = {width:width, height:height};
            fabric.gradientDefs = fabric.getGradientDefs(doc);
            fabric.cssRules = getCSSRules(doc);
            fabric.parseElements(elements, function (instances) {
                fabric.documentParsingTime = new Date() - startTime;
                if (callback) {
                    callback(instances, options);
                }
            }, clone(options), reviver);
        };
    })();
    var svgCache = {has:function (name, callback) {
        callback(false);
    }, get:function () {
    }, set:function () {
    }};
    function loadSVGFromURL(url, callback, reviver) {
        url = url.replace(/^\n\s*/, "").trim();
        svgCache.has(url, function (hasUrl) {
            if (hasUrl) {
                svgCache.get(url, function (value) {
                    var enlivedRecord = _enlivenCachedObject(value);
                    callback(enlivedRecord.objects, enlivedRecord.options);
                });
            } else {
                new fabric.util.request(url, {method:"get", onComplete:onComplete});
            }
        });
        function onComplete(r) {
            var xml = r.responseXML;
            if (!xml.documentElement && fabric.window.ActiveXObject && r.responseText) {
                xml = new ActiveXObject("Microsoft.XMLDOM");
                xml.async = "false";
                xml.loadXML(r.responseText.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*\])*?>/i, ""));
            }
            if (!xml.documentElement) {
                return;
            }
            fabric.parseSVGDocument(xml.documentElement, function (results, options) {
                svgCache.set(url, {objects:fabric.util.array.invoke(results, "toObject"), options:options});
                callback(results, options);
            }, reviver);
        }
    }
    function _enlivenCachedObject(cachedObject) {
        var objects = cachedObject.objects, options = cachedObject.options;
        objects = objects.map(function (o) {
            return fabric[capitalize(o.type)].fromObject(o);
        });
        return ({objects:objects, options:options});
    }
    function loadSVGFromString(string, callback, reviver) {
        string = string.trim();
        var doc;
        if (typeof DOMParser !== "undefined") {
            var parser = new DOMParser();
            if (parser && parser.parseFromString) {
                doc = parser.parseFromString(string, "text/xml");
            }
        } else {
            if (fabric.window.ActiveXObject) {
                doc = new ActiveXObject("Microsoft.XMLDOM");
                doc.async = "false";
                doc.loadXML(string.replace(/<!DOCTYPE[\s\S]*?(\[[\s\S]*\])*?>/i, ""));
            }
        }
        fabric.parseSVGDocument(doc.documentElement, function (results, options) {
            callback(results, options);
        }, reviver);
    }
    function createSVGFontFacesMarkup(objects) {
        var markup = "";
        for (var i = 0, len = objects.length; i < len; i++) {
            if (objects[i].type !== "text" || !objects[i].path) {
                continue;
            }
            markup += ["@font-face {", "font-family: ", objects[i].fontFamily, "; ", "src: url('", objects[i].path, "')", "}"].join("");
        }
        if (markup) {
            markup = ["<style type=\"text/css\">", "<![CDATA[", markup, "]]>", "</style>"].join("");
        }
        return markup;
    }
    function createSVGRefElementsMarkup(canvas) {
        var markup = "";
        if (canvas.backgroundColor && canvas.backgroundColor.source) {
            markup = ["<pattern x=\"0\" y=\"0\" id=\"backgroundColorPattern\" ", "width=\"", canvas.backgroundColor.source.width, "\" height=\"", canvas.backgroundColor.source.height, "\" patternUnits=\"userSpaceOnUse\">", "<image x=\"0\" y=\"0\" ", "width=\"", canvas.backgroundColor.source.width, "\" height=\"", canvas.backgroundColor.source.height, "\" xlink:href=\"", canvas.backgroundColor.source.src, "\"></image></pattern>"].join("");
        }
        return markup;
    }
    function getGradientDefs(doc) {
        var linearGradientEls = doc.getElementsByTagName("linearGradient"), radialGradientEls = doc.getElementsByTagName("radialGradient"), el, i, gradientDefs = {};
        i = linearGradientEls.length;
        for (; i--; ) {
            el = linearGradientEls[i];
            gradientDefs[el.getAttribute("id")] = el;
        }
        i = radialGradientEls.length;
        for (; i--; ) {
            el = radialGradientEls[i];
            gradientDefs[el.getAttribute("id")] = el;
        }
        return gradientDefs;
    }
    extend(fabric, {parseAttributes:parseAttributes, parseElements:parseElements, parseStyleAttribute:parseStyleAttribute, parsePointsAttribute:parsePointsAttribute, getCSSRules:getCSSRules, loadSVGFromURL:loadSVGFromURL, loadSVGFromString:loadSVGFromString, createSVGFontFacesMarkup:createSVGFontFacesMarkup, createSVGRefElementsMarkup:createSVGRefElementsMarkup, getGradientDefs:getGradientDefs});
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    if (fabric.Point) {
        fabric.warn("fabric.Point is already defined");
        return;
    }
    fabric.Point = Point;
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype = {constructor:Point, add:function (that) {
        return new Point(this.x + that.x, this.y + that.y);
    }, addEquals:function (that) {
        this.x += that.x;
        this.y += that.y;
        return this;
    }, scalarAdd:function (scalar) {
        return new Point(this.x + scalar, this.y + scalar);
    }, scalarAddEquals:function (scalar) {
        this.x += scalar;
        this.y += scalar;
        return this;
    }, subtract:function (that) {
        return new Point(this.x - that.x, this.y - that.y);
    }, subtractEquals:function (that) {
        this.x -= that.x;
        this.y -= that.y;
        return this;
    }, scalarSubtract:function (scalar) {
        return new Point(this.x - scalar, this.y - scalar);
    }, scalarSubtractEquals:function (scalar) {
        this.x -= scalar;
        this.y -= scalar;
        return this;
    }, multiply:function (scalar) {
        return new Point(this.x * scalar, this.y * scalar);
    }, multiplyEquals:function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }, divide:function (scalar) {
        return new Point(this.x / scalar, this.y / scalar);
    }, divideEquals:function (scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    }, eq:function (that) {
        return (this.x === that.x && this.y === that.y);
    }, lt:function (that) {
        return (this.x < that.x && this.y < that.y);
    }, lte:function (that) {
        return (this.x <= that.x && this.y <= that.y);
    }, gt:function (that) {
        return (this.x > that.x && this.y > that.y);
    }, gte:function (that) {
        return (this.x >= that.x && this.y >= that.y);
    }, lerp:function (that, t) {
        return new Point(this.x + (that.x - this.x) * t, this.y + (that.y - this.y) * t);
    }, distanceFrom:function (that) {
        var dx = this.x - that.x, dy = this.y - that.y;
        return Math.sqrt(dx * dx + dy * dy);
    }, midPointFrom:function (that) {
        return new Point(this.x + (that.x - this.x) / 2, this.y + (that.y - this.y) / 2);
    }, min:function (that) {
        return new Point(Math.min(this.x, that.x), Math.min(this.y, that.y));
    }, max:function (that) {
        return new Point(Math.max(this.x, that.x), Math.max(this.y, that.y));
    }, toString:function () {
        return this.x + "," + this.y;
    }, setXY:function (x, y) {
        this.x = x;
        this.y = y;
    }, setFromPoint:function (that) {
        this.x = that.x;
        this.y = that.y;
    }, swap:function (that) {
        var x = this.x, y = this.y;
        this.x = that.x;
        this.y = that.y;
        that.x = x;
        that.y = y;
    }};
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    if (fabric.Intersection) {
        fabric.warn("fabric.Intersection is already defined");
        return;
    }
    function Intersection(status) {
        this.status = status;
        this.points = [];
    }
    fabric.Intersection = Intersection;
    fabric.Intersection.prototype = {appendPoint:function (point) {
        this.points.push(point);
    }, appendPoints:function (points) {
        this.points = this.points.concat(points);
    }};
    fabric.Intersection.intersectLineLine = function (a1, a2, b1, b2) {
        var result, ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x), ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x), u_b = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);
        if (u_b !== 0) {
            var ua = ua_t / u_b, ub = ub_t / u_b;
            if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
                result = new Intersection("Intersection");
                result.points.push(new fabric.Point(a1.x + ua * (a2.x - a1.x), a1.y + ua * (a2.y - a1.y)));
            } else {
                result = new Intersection();
            }
        } else {
            if (ua_t === 0 || ub_t === 0) {
                result = new Intersection("Coincident");
            } else {
                result = new Intersection("Parallel");
            }
        }
        return result;
    };
    fabric.Intersection.intersectLinePolygon = function (a1, a2, points) {
        var result = new Intersection(), length = points.length;
        for (var i = 0; i < length; i++) {
            var b1 = points[i], b2 = points[(i + 1) % length], inter = Intersection.intersectLineLine(a1, a2, b1, b2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    };
    fabric.Intersection.intersectPolygonPolygon = function (points1, points2) {
        var result = new Intersection(), length = points1.length;
        for (var i = 0; i < length; i++) {
            var a1 = points1[i], a2 = points1[(i + 1) % length], inter = Intersection.intersectLinePolygon(a1, a2, points2);
            result.appendPoints(inter.points);
        }
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    };
    fabric.Intersection.intersectPolygonRectangle = function (points, r1, r2) {
        var min = r1.min(r2), max = r1.max(r2), topRight = new fabric.Point(max.x, min.y), bottomLeft = new fabric.Point(min.x, max.y), inter1 = Intersection.intersectLinePolygon(min, topRight, points), inter2 = Intersection.intersectLinePolygon(topRight, max, points), inter3 = Intersection.intersectLinePolygon(max, bottomLeft, points), inter4 = Intersection.intersectLinePolygon(bottomLeft, min, points), result = new Intersection();
        result.appendPoints(inter1.points);
        result.appendPoints(inter2.points);
        result.appendPoints(inter3.points);
        result.appendPoints(inter4.points);
        if (result.points.length > 0) {
            result.status = "Intersection";
        }
        return result;
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    if (fabric.Color) {
        fabric.warn("fabric.Color is already defined.");
        return;
    }
    function Color(color) {
        if (!color) {
            this.setSource([0, 0, 0, 1]);
        } else {
            this._tryParsingColor(color);
        }
    }
    fabric.Color = Color;
    fabric.Color.prototype = {_tryParsingColor:function (color) {
        var source;
        if (color in Color.colorNameMap) {
            color = Color.colorNameMap[color];
        }
        source = Color.sourceFromHex(color);
        if (!source) {
            source = Color.sourceFromRgb(color);
        }
        if (!source) {
            source = Color.sourceFromHsl(color);
        }
        if (source) {
            this.setSource(source);
        }
    }, _rgbToHsl:function (r, g, b) {
        r /= 255, g /= 255, b /= 255;
        var h, s, l, max = fabric.util.array.max([r, g, b]), min = fabric.util.array.min([r, g, b]);
        l = (max + min) / 2;
        if (max === min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }, getSource:function () {
        return this._source;
    }, setSource:function (source) {
        this._source = source;
    }, toRgb:function () {
        var source = this.getSource();
        return "rgb(" + source[0] + "," + source[1] + "," + source[2] + ")";
    }, toRgba:function () {
        var source = this.getSource();
        return "rgba(" + source[0] + "," + source[1] + "," + source[2] + "," + source[3] + ")";
    }, toHsl:function () {
        var source = this.getSource(), hsl = this._rgbToHsl(source[0], source[1], source[2]);
        return "hsl(" + hsl[0] + "," + hsl[1] + "%," + hsl[2] + "%)";
    }, toHsla:function () {
        var source = this.getSource(), hsl = this._rgbToHsl(source[0], source[1], source[2]);
        return "hsla(" + hsl[0] + "," + hsl[1] + "%," + hsl[2] + "%," + source[3] + ")";
    }, toHex:function () {
        var source = this.getSource();
        var r = source[0].toString(16);
        r = (r.length === 1) ? ("0" + r) : r;
        var g = source[1].toString(16);
        g = (g.length === 1) ? ("0" + g) : g;
        var b = source[2].toString(16);
        b = (b.length === 1) ? ("0" + b) : b;
        return r.toUpperCase() + g.toUpperCase() + b.toUpperCase();
    }, getAlpha:function () {
        return this.getSource()[3];
    }, setAlpha:function (alpha) {
        var source = this.getSource();
        source[3] = alpha;
        this.setSource(source);
        return this;
    }, toGrayscale:function () {
        var source = this.getSource(), average = parseInt((source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0), 10), currentAlpha = source[3];
        this.setSource([average, average, average, currentAlpha]);
        return this;
    }, toBlackWhite:function (threshold) {
        var source = this.getSource(), average = (source[0] * 0.3 + source[1] * 0.59 + source[2] * 0.11).toFixed(0), currentAlpha = source[3];
        threshold = threshold || 127;
        average = (Number(average) < Number(threshold)) ? 0 : 255;
        this.setSource([average, average, average, currentAlpha]);
        return this;
    }, overlayWith:function (otherColor) {
        if (!(otherColor instanceof Color)) {
            otherColor = new Color(otherColor);
        }
        var result = [], alpha = this.getAlpha(), otherAlpha = 0.5, source = this.getSource(), otherSource = otherColor.getSource();
        for (var i = 0; i < 3; i++) {
            result.push(Math.round((source[i] * (1 - otherAlpha)) + (otherSource[i] * otherAlpha)));
        }
        result[3] = alpha;
        this.setSource(result);
        return this;
    }};
    fabric.Color.reRGBa = /^rgba?\(\s*(\d{1,3}\%?)\s*,\s*(\d{1,3}\%?)\s*,\s*(\d{1,3}\%?)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/;
    fabric.Color.reHSLa = /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3}\%)\s*,\s*(\d{1,3}\%)\s*(?:\s*,\s*(\d+(?:\.\d+)?)\s*)?\)$/;
    fabric.Color.reHex = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;
    fabric.Color.colorNameMap = {"aqua":"#00FFFF", "black":"#000000", "blue":"#0000FF", "fuchsia":"#FF00FF", "gray":"#808080", "green":"#008000", "lime":"#00FF00", "maroon":"#800000", "navy":"#000080", "olive":"#808000", "orange":"#FFA500", "purple":"#800080", "red":"#FF0000", "silver":"#C0C0C0", "teal":"#008080", "white":"#FFFFFF", "yellow":"#FFFF00"};
    function hue2rgb(p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    }
    fabric.Color.fromRgb = function (color) {
        return Color.fromSource(Color.sourceFromRgb(color));
    };
    fabric.Color.sourceFromRgb = function (color) {
        var match = color.match(Color.reRGBa);
        if (match) {
            var r = parseInt(match[1], 10) / (/%$/.test(match[1]) ? 100 : 1) * (/%$/.test(match[1]) ? 255 : 1), g = parseInt(match[2], 10) / (/%$/.test(match[2]) ? 100 : 1) * (/%$/.test(match[2]) ? 255 : 1), b = parseInt(match[3], 10) / (/%$/.test(match[3]) ? 100 : 1) * (/%$/.test(match[3]) ? 255 : 1);
            return [parseInt(r, 10), parseInt(g, 10), parseInt(b, 10), match[4] ? parseFloat(match[4]) : 1];
        }
    };
    fabric.Color.fromRgba = Color.fromRgb;
    fabric.Color.fromHsl = function (color) {
        return Color.fromSource(Color.sourceFromHsl(color));
    };
    fabric.Color.sourceFromHsl = function (color) {
        var match = color.match(Color.reHSLa);
        if (!match) {
            return;
        }
        var h = (((parseFloat(match[1]) % 360) + 360) % 360) / 360, s = parseFloat(match[2]) / (/%$/.test(match[2]) ? 100 : 1), l = parseFloat(match[3]) / (/%$/.test(match[3]) ? 100 : 1), r, g, b;
        if (s === 0) {
            r = g = b = l;
        } else {
            var q = l <= 0.5 ? l * (s + 1) : l + s - l * s;
            var p = l * 2 - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255), match[4] ? parseFloat(match[4]) : 1];
    };
    fabric.Color.fromHsla = Color.fromHsl;
    fabric.Color.fromHex = function (color) {
        return Color.fromSource(Color.sourceFromHex(color));
    };
    fabric.Color.sourceFromHex = function (color) {
        if (color.match(Color.reHex)) {
            var value = color.slice(color.indexOf("#") + 1), isShortNotation = (value.length === 3), r = isShortNotation ? (value.charAt(0) + value.charAt(0)) : value.substring(0, 2), g = isShortNotation ? (value.charAt(1) + value.charAt(1)) : value.substring(2, 4), b = isShortNotation ? (value.charAt(2) + value.charAt(2)) : value.substring(4, 6);
            return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1];
        }
    };
    fabric.Color.fromSource = function (source) {
        var oColor = new Color();
        oColor.setSource(source);
        return oColor;
    };
})(typeof exports !== "undefined" ? exports : this);
(function () {
    function getColorStop(el) {
        var style = el.getAttribute("style"), offset = el.getAttribute("offset"), color, opacity;
        offset = parseFloat(offset) / (/%$/.test(offset) ? 100 : 1);
        if (style) {
            var keyValuePairs = style.split(/\s*;\s*/);
            if (keyValuePairs[keyValuePairs.length - 1] === "") {
                keyValuePairs.pop();
            }
            for (var i = keyValuePairs.length; i--; ) {
                var split = keyValuePairs[i].split(/\s*:\s*/), key = split[0].trim(), value = split[1].trim();
                if (key === "stop-color") {
                    color = value;
                } else {
                    if (key === "stop-opacity") {
                        opacity = value;
                    }
                }
            }
        }
        if (!color) {
            color = el.getAttribute("stop-color") || "rgb(0,0,0)";
        }
        if (!opacity) {
            opacity = el.getAttribute("stop-opacity");
        }
        color = new fabric.Color(color).toRgb();
        return {offset:offset, color:color, opacity:isNaN(parseFloat(opacity)) ? 1 : parseFloat(opacity)};
    }
    fabric.Gradient = fabric.util.createClass({initialize:function (options) {
        options || (options = {});
        var coords = {};
        this.id = fabric.Object.__uid++;
        this.type = options.type || "linear";
        coords = {x1:options.coords.x1 || 0, y1:options.coords.y1 || 0, x2:options.coords.x2 || 0, y2:options.coords.y2 || 0};
        if (this.type === "radial") {
            coords.r1 = options.coords.r1 || 0;
            coords.r2 = options.coords.r2 || 0;
        }
        this.coords = coords;
        this.gradientUnits = options.gradientUnits || "objectBoundingBox";
        this.colorStops = options.colorStops.slice();
    }, addColorStop:function (colorStop) {
        for (var position in colorStop) {
            var color = new fabric.Color(colorStop[position]);
            this.colorStops.push({offset:position, color:color.toRgb(), opacity:color.getAlpha()});
        }
        return this;
    }, toObject:function () {
        return {type:this.type, coords:this.coords, gradientUnits:this.gradientUnits, colorStops:this.colorStops};
    }, toSVG:function (object, normalize) {
        var coords = fabric.util.object.clone(this.coords), markup;
        this.colorStops.sort(function (a, b) {
            return a.offset - b.offset;
        });
        if (normalize && this.gradientUnits === "userSpaceOnUse") {
            coords.x1 += object.width / 2;
            coords.y1 += object.height / 2;
            coords.x2 += object.width / 2;
            coords.y2 += object.height / 2;
        } else {
            if (this.gradientUnits === "objectBoundingBox") {
                _convertValuesToPercentUnits(object, coords);
            }
        }
        if (this.type === "linear") {
            markup = ["<linearGradient ", "id=\"SVGID_", this.id, "\" gradientUnits=\"", this.gradientUnits, "\" x1=\"", coords.x1, "\" y1=\"", coords.y1, "\" x2=\"", coords.x2, "\" y2=\"", coords.y2, "\">"];
        } else {
            if (this.type === "radial") {
                markup = ["<radialGradient ", "id=\"SVGID_", this.id, "\" gradientUnits=\"", this.gradientUnits, "\" cx=\"", coords.x2, "\" cy=\"", coords.y2, "\" r=\"", coords.r2, "\" fx=\"", coords.x1, "\" fy=\"", coords.y1, "\">"];
            }
        }
        for (var i = 0; i < this.colorStops.length; i++) {
            markup.push("<stop ", "offset=\"", (this.colorStops[i].offset * 100) + "%", "\" style=\"stop-color:", this.colorStops[i].color, (this.colorStops[i].opacity ? ";stop-opacity: " + this.colorStops[i].opacity : ";"), "\"/>");
        }
        markup.push((this.type === "linear" ? "</linearGradient>" : "</radialGradient>"));
        return markup.join("");
    }, toLive:function (ctx) {
        var gradient;
        if (!this.type) {
            return;
        }
        if (this.type === "linear") {
            gradient = ctx.createLinearGradient(this.coords.x1, this.coords.y1, this.coords.x2, this.coords.y2);
        } else {
            if (this.type === "radial") {
                gradient = ctx.createRadialGradient(this.coords.x1, this.coords.y1, this.coords.r1, this.coords.x2, this.coords.y2, this.coords.r2);
            }
        }
        for (var i = 0, len = this.colorStops.length; i < len; i++) {
            var color = this.colorStops[i].color, opacity = this.colorStops[i].opacity, offset = this.colorStops[i].offset;
            if (typeof opacity !== "undefined") {
                color = new fabric.Color(color).setAlpha(opacity).toRgba();
            }
            gradient.addColorStop(parseFloat(offset), color);
        }
        return gradient;
    }});
    fabric.util.object.extend(fabric.Gradient, {fromElement:function (el, instance) {
        var colorStopEls = el.getElementsByTagName("stop"), type = (el.nodeName === "linearGradient" ? "linear" : "radial"), gradientUnits = el.getAttribute("gradientUnits") || "objectBoundingBox", colorStops = [], coords = {};
        if (type === "linear") {
            coords = {x1:el.getAttribute("x1") || 0, y1:el.getAttribute("y1") || 0, x2:el.getAttribute("x2") || "100%", y2:el.getAttribute("y2") || 0};
        } else {
            if (type === "radial") {
                coords = {x1:el.getAttribute("fx") || el.getAttribute("cx") || "50%", y1:el.getAttribute("fy") || el.getAttribute("cy") || "50%", r1:0, x2:el.getAttribute("cx") || "50%", y2:el.getAttribute("cy") || "50%", r2:el.getAttribute("r") || "50%"};
            }
        }
        for (var i = colorStopEls.length; i--; ) {
            colorStops.push(getColorStop(colorStopEls[i]));
        }
        _convertPercentUnitsToValues(instance, coords);
        return new fabric.Gradient({type:type, coords:coords, gradientUnits:gradientUnits, colorStops:colorStops});
    }, forObject:function (obj, options) {
        options || (options = {});
        _convertPercentUnitsToValues(obj, options);
        return new fabric.Gradient(options);
    }});
    function _convertPercentUnitsToValues(object, options) {
        for (var prop in options) {
            if (typeof options[prop] === "string" && /^\d+%$/.test(options[prop])) {
                var percents = parseFloat(options[prop], 10);
                if (prop === "x1" || prop === "x2" || prop === "r2") {
                    options[prop] = fabric.util.toFixed(object.width * percents / 100, 2);
                } else {
                    if (prop === "y1" || prop === "y2") {
                        options[prop] = fabric.util.toFixed(object.height * percents / 100, 2);
                    }
                }
            }
            if (prop === "x1" || prop === "x2") {
                options[prop] -= fabric.util.toFixed(object.width / 2, 2);
            } else {
                if (prop === "y1" || prop === "y2") {
                    options[prop] -= fabric.util.toFixed(object.height / 2, 2);
                }
            }
        }
    }
    function _convertValuesToPercentUnits(object, options) {
        for (var prop in options) {
            if (prop === "x1" || prop === "x2") {
                options[prop] += fabric.util.toFixed(object.width / 2, 2);
            } else {
                if (prop === "y1" || prop === "y2") {
                    options[prop] += fabric.util.toFixed(object.height / 2, 2);
                }
            }
            if (prop === "x1" || prop === "x2" || prop === "r2") {
                options[prop] = fabric.util.toFixed(options[prop] / object.width * 100, 2) + "%";
            } else {
                if (prop === "y1" || prop === "y2") {
                    options[prop] = fabric.util.toFixed(options[prop] / object.height * 100, 2) + "%";
                }
            }
        }
    }
})();
fabric.Pattern = fabric.util.createClass({repeat:"repeat", offsetX:0, offsetY:0, initialize:function (options) {
    options || (options = {});
    this.id = fabric.Object.__uid++;
    if (options.source) {
        if (typeof options.source === "string") {
            if (typeof fabric.util.getFunctionBody(options.source) !== "undefined") {
                this.source = new Function(fabric.util.getFunctionBody(options.source));
            } else {
                var _this = this;
                this.source = fabric.util.createImage();
                fabric.util.loadImage(options.source, function (img) {
                    _this.source = img;
                });
            }
        } else {
            this.source = options.source;
        }
    }
    if (options.repeat) {
        this.repeat = options.repeat;
    }
    if (options.offsetX) {
        this.offsetX = options.offsetX;
    }
    if (options.offsetY) {
        this.offsetY = options.offsetY;
    }
}, toObject:function () {
    var source;
    if (typeof this.source === "function") {
        source = String(this.source);
    } else {
        if (typeof this.source.src === "string") {
            source = this.source.src;
        }
    }
    return {source:source, repeat:this.repeat, offsetX:this.offsetX, offsetY:this.offsetY};
}, toSVG:function (object) {
    var patternSource = typeof this.source === "function" ? this.source() : this.source;
    var patternWidth = patternSource.width / object.getWidth();
    var patternHeight = patternSource.height / object.getHeight();
    var patternImgSrc = "";
    if (patternSource.src) {
        patternImgSrc = patternSource.src;
    } else {
        if (patternSource.toDataURL) {
            patternImgSrc = patternSource.toDataURL();
        }
    }
    return "<pattern id=\"SVGID_" + this.id + "\" x=\"" + this.offsetX + "\" y=\"" + this.offsetY + "\" width=\"" + patternWidth + "\" height=\"" + patternHeight + "\">" + "<image x=\"0\" y=\"0\"" + " width=\"" + patternSource.width + "\" height=\"" + patternSource.height + "\" xlink:href=\"" + patternImgSrc + "\"></image>" + "</pattern>";
}, toLive:function (ctx) {
    var source = typeof this.source === "function" ? this.source() : this.source;
    return ctx.createPattern(source, this.repeat);
}});
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    if (fabric.Shadow) {
        fabric.warn("fabric.Shadow is already defined.");
        return;
    }
    fabric.Shadow = fabric.util.createClass({color:"rgb(0,0,0)", blur:0, offsetX:0, offsetY:0, affectStroke:false, initialize:function (options) {
        if (typeof options === "string") {
            options = this._parseShadow(options);
        }
        for (var prop in options) {
            this[prop] = options[prop];
        }
        this.id = fabric.Object.__uid++;
    }, _parseShadow:function (shadow) {
        var shadowStr = shadow.trim();
        var offsetsAndBlur = fabric.Shadow.reOffsetsAndBlur.exec(shadowStr) || [], color = shadowStr.replace(fabric.Shadow.reOffsetsAndBlur, "") || "rgb(0,0,0)";
        return {color:color.trim(), offsetX:parseInt(offsetsAndBlur[1], 10) || 0, offsetY:parseInt(offsetsAndBlur[2], 10) || 0, blur:parseInt(offsetsAndBlur[3], 10) || 0};
    }, toString:function () {
        return [this.offsetX, this.offsetY, this.blur, this.color].join("px ");
    }, toSVG:function (object) {
        var mode = "SourceAlpha";
        if (object && (object.fill === this.color || object.stroke === this.color)) {
            mode = "SourceGraphic";
        }
        return ("<filter id=\"SVGID_" + this.id + "\" y=\"-40%\" height=\"180%\">" + "<feGaussianBlur in=\"" + mode + "\" stdDeviation=\"" + (this.blur ? this.blur / 3 : 0) + "\"></feGaussianBlur>" + "<feOffset dx=\"" + this.offsetX + "\" dy=\"" + this.offsetY + "\"></feOffset>" + "<feMerge>" + "<feMergeNode></feMergeNode>" + "<feMergeNode in=\"SourceGraphic\"></feMergeNode>" + "</feMerge>" + "</filter>");
    }, toObject:function () {
        return {color:this.color, blur:this.blur, offsetX:this.offsetX, offsetY:this.offsetY};
    }});
    fabric.Shadow.reOffsetsAndBlur = /(?:\s|^)(-?\d+(?:px)?(?:\s?|$))?(-?\d+(?:px)?(?:\s?|$))?(\d+(?:px)?)?(?:\s?|$)(?:$|\s)/;
})(typeof exports !== "undefined" ? exports : this);
(function () {
    "use strict";
    if (fabric.StaticCanvas) {
        fabric.warn("fabric.StaticCanvas is already defined.");
        return;
    }
    var extend = fabric.util.object.extend, getElementOffset = fabric.util.getElementOffset, removeFromArray = fabric.util.removeFromArray, removeListener = fabric.util.removeListener, CANVAS_INIT_ERROR = new Error("Could not initialize `canvas` element");
    fabric.StaticCanvas = fabric.util.createClass({initialize:function (el, options) {
        options || (options = {});
        this._initStatic(el, options);
        fabric.StaticCanvas.activeInstance = this;
    }, backgroundColor:"", backgroundImage:"", backgroundImageOpacity:1, backgroundImageStretch:true, overlayImage:"", overlayImageLeft:0, overlayImageTop:0, includeDefaultValues:true, stateful:true, renderOnAddRemove:true, clipTo:null, controlsAboveOverlay:false, allowTouchScrolling:false, onBeforeScaleRotate:function () {
    }, _initStatic:function (el, options) {
        this._objects = [];
        this._createLowerCanvas(el);
        this._initOptions(options);
        if (options.overlayImage) {
            this.setOverlayImage(options.overlayImage, this.renderAll.bind(this));
        }
        if (options.backgroundImage) {
            this.setBackgroundImage(options.backgroundImage, this.renderAll.bind(this));
        }
        if (options.backgroundColor) {
            this.setBackgroundColor(options.backgroundColor, this.renderAll.bind(this));
        }
        this.calcOffset();
    }, calcOffset:function () {
        this._offset = getElementOffset(this.lowerCanvasEl);
        return this;
    }, setOverlayImage:function (url, callback, options) {
        fabric.util.loadImage(url, function (img) {
            this.overlayImage = img;
            if (options && ("overlayImageLeft" in options)) {
                this.overlayImageLeft = options.overlayImageLeft;
            }
            if (options && ("overlayImageTop" in options)) {
                this.overlayImageTop = options.overlayImageTop;
            }
            callback && callback();
        }, this);
        return this;
    }, setBackgroundImage:function (url, callback, options) {
        fabric.util.loadImage(url, function (img) {
            this.backgroundImage = img;
            if (options && ("backgroundImageOpacity" in options)) {
                this.backgroundImageOpacity = options.backgroundImageOpacity;
            }
            if (options && ("backgroundImageStretch" in options)) {
                this.backgroundImageStretch = options.backgroundImageStretch;
            }
            callback && callback();
        }, this);
        return this;
    }, setBackgroundColor:function (backgroundColor, callback) {
        if (backgroundColor.source) {
            var _this = this;
            fabric.util.loadImage(backgroundColor.source, function (img) {
                _this.backgroundColor = new fabric.Pattern({source:img, repeat:backgroundColor.repeat});
                callback && callback();
            });
        } else {
            this.backgroundColor = backgroundColor;
            callback && callback();
        }
        return this;
    }, _createCanvasElement:function () {
        var element = fabric.document.createElement("canvas");
        if (!element.style) {
            element.style = {};
        }
        if (!element) {
            throw CANVAS_INIT_ERROR;
        }
        this._initCanvasElement(element);
        return element;
    }, _initCanvasElement:function (element) {
        fabric.util.createCanvasElement(element);
        if (typeof element.getContext === "undefined") {
            throw CANVAS_INIT_ERROR;
        }
    }, _initOptions:function (options) {
        for (var prop in options) {
            this[prop] = options[prop];
        }
        this.width = parseInt(this.lowerCanvasEl.width, 10) || 0;
        this.height = parseInt(this.lowerCanvasEl.height, 10) || 0;
        if (!this.lowerCanvasEl.style) {
            return;
        }
        this.lowerCanvasEl.style.width = this.width + "px";
        this.lowerCanvasEl.style.height = this.height + "px";
    }, _createLowerCanvas:function (canvasEl) {
        this.lowerCanvasEl = fabric.util.getById(canvasEl) || this._createCanvasElement();
        this._initCanvasElement(this.lowerCanvasEl);
        fabric.util.addClass(this.lowerCanvasEl, "lower-canvas");
        if (this.interactive) {
            this._applyCanvasStyle(this.lowerCanvasEl);
        }
        this.contextContainer = this.lowerCanvasEl.getContext("2d");
    }, getWidth:function () {
        return this.width;
    }, getHeight:function () {
        return this.height;
    }, setWidth:function (value) {
        return this._setDimension("width", value);
    }, setHeight:function (value) {
        return this._setDimension("height", value);
    }, setDimensions:function (dimensions) {
        for (var prop in dimensions) {
            this._setDimension(prop, dimensions[prop]);
        }
        return this;
    }, _setDimension:function (prop, value) {
        this.lowerCanvasEl[prop] = value;
        this.lowerCanvasEl.style[prop] = value + "px";
        if (this.upperCanvasEl) {
            this.upperCanvasEl[prop] = value;
            this.upperCanvasEl.style[prop] = value + "px";
        }
        if (this.cacheCanvasEl) {
            this.cacheCanvasEl[prop] = value;
        }
        if (this.wrapperEl) {
            this.wrapperEl.style[prop] = value + "px";
        }
        this[prop] = value;
        this.calcOffset();
        this.renderAll();
        return this;
    }, getElement:function () {
        return this.lowerCanvasEl;
    }, getActiveObject:function () {
        return null;
    }, getActiveGroup:function () {
        return null;
    }, _draw:function (ctx, object) {
        if (!object) {
            return;
        }
        if (this.controlsAboveOverlay) {
            var hasBorders = object.hasBorders, hasControls = object.hasControls;
            object.hasBorders = object.hasControls = false;
            object.render(ctx);
            object.hasBorders = hasBorders;
            object.hasControls = hasControls;
        } else {
            object.render(ctx);
        }
    }, _onObjectAdded:function (obj) {
        this.stateful && obj.setupState();
        obj.setCoords();
        obj.canvas = this;
        this.fire("object:added", {target:obj});
        obj.fire("added");
    }, _onObjectRemoved:function (obj) {
        this.fire("object:removed", {target:obj});
        obj.fire("removed");
    }, getObjects:function () {
        return this._objects;
    }, clearContext:function (ctx) {
        ctx.clearRect(0, 0, this.width, this.height);
        return this;
    }, getContext:function () {
        return this.contextContainer;
    }, clear:function () {
        this._objects.length = 0;
        if (this.discardActiveGroup) {
            this.discardActiveGroup();
        }
        if (this.discardActiveObject) {
            this.discardActiveObject();
        }
        this.clearContext(this.contextContainer);
        if (this.contextTop) {
            this.clearContext(this.contextTop);
        }
        this.fire("canvas:cleared");
        this.renderAll();
        return this;
    }, renderAll:function (allOnTop) {
        var canvasToDrawOn = this[(allOnTop === true && this.interactive) ? "contextTop" : "contextContainer"];
        if (this.contextTop && this.selection && !this._groupSelector) {
            this.clearContext(this.contextTop);
        }
        if (!allOnTop) {
            this.clearContext(canvasToDrawOn);
        }
        this.fire("before:render");
        if (this.clipTo) {
            fabric.util.clipContext(this, canvasToDrawOn);
        }
        if (this.backgroundColor) {
            canvasToDrawOn.fillStyle = this.backgroundColor.toLive ? this.backgroundColor.toLive(canvasToDrawOn) : this.backgroundColor;
            canvasToDrawOn.fillRect(this.backgroundColor.offsetX || 0, this.backgroundColor.offsetY || 0, this.width, this.height);
        }
        if (typeof this.backgroundImage === "object") {
            this._drawBackroundImage(canvasToDrawOn);
        }
        var activeGroup = this.getActiveGroup();
        for (var i = 0, length = this._objects.length; i < length; ++i) {
            if (!activeGroup || (activeGroup && this._objects[i] && !activeGroup.contains(this._objects[i]))) {
                this._draw(canvasToDrawOn, this._objects[i]);
            }
        }
        if (activeGroup) {
            var sortedObjects = [];
            this.forEachObject(function (object) {
                if (activeGroup.contains(object)) {
                    sortedObjects.push(object);
                }
            });
            activeGroup._set("objects", sortedObjects);
            this._draw(canvasToDrawOn, activeGroup);
        }
        if (this.clipTo) {
            canvasToDrawOn.restore();
        }
        if (this.overlayImage) {
            canvasToDrawOn.drawImage(this.overlayImage, this.overlayImageLeft, this.overlayImageTop);
        }
        if (this.controlsAboveOverlay && this.interactive) {
            this.drawControls(canvasToDrawOn);
        }
        this.fire("after:render");
        return this;
    }, _drawBackroundImage:function (canvasToDrawOn) {
        canvasToDrawOn.save();
        canvasToDrawOn.globalAlpha = this.backgroundImageOpacity;
        if (this.backgroundImageStretch) {
            canvasToDrawOn.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        } else {
            canvasToDrawOn.drawImage(this.backgroundImage, 0, 0);
        }
        canvasToDrawOn.restore();
    }, renderTop:function () {
        var ctx = this.contextTop || this.contextContainer;
        this.clearContext(ctx);
        if (this.selection && this._groupSelector) {
            this._drawSelection();
        }
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            activeGroup.render(ctx);
        }
        if (this.overlayImage) {
            ctx.drawImage(this.overlayImage, this.overlayImageLeft, this.overlayImageTop);
        }
        this.fire("after:render");
        return this;
    }, getCenter:function () {
        return {top:this.getHeight() / 2, left:this.getWidth() / 2};
    }, centerObjectH:function (object) {
        object.set("left", this.getCenter().left);
        this.renderAll();
        return this;
    }, centerObjectV:function (object) {
        object.set("top", this.getCenter().top);
        this.renderAll();
        return this;
    }, centerObject:function (object) {
        return this.centerObjectH(object).centerObjectV(object);
    }, toDatalessJSON:function (propertiesToInclude) {
        return this.toDatalessObject(propertiesToInclude);
    }, toObject:function (propertiesToInclude) {
        return this._toObjectMethod("toObject", propertiesToInclude);
    }, toDatalessObject:function (propertiesToInclude) {
        return this._toObjectMethod("toDatalessObject", propertiesToInclude);
    }, _toObjectMethod:function (methodName, propertiesToInclude) {
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            this.discardActiveGroup();
        }
        var data = {objects:this.getObjects().map(function (instance) {
            var originalValue;
            if (!this.includeDefaultValues) {
                originalValue = instance.includeDefaultValues;
                instance.includeDefaultValues = false;
            }
            var object = instance[methodName](propertiesToInclude);
            if (!this.includeDefaultValues) {
                instance.includeDefaultValues = originalValue;
            }
            return object;
        }, this), background:(this.backgroundColor && this.backgroundColor.toObject) ? this.backgroundColor.toObject() : this.backgroundColor};
        if (this.backgroundImage) {
            data.backgroundImage = this.backgroundImage.src;
            data.backgroundImageOpacity = this.backgroundImageOpacity;
            data.backgroundImageStretch = this.backgroundImageStretch;
        }
        if (this.overlayImage) {
            data.overlayImage = this.overlayImage.src;
            data.overlayImageLeft = this.overlayImageLeft;
            data.overlayImageTop = this.overlayImageTop;
        }
        fabric.util.populateWithProperties(this, data, propertiesToInclude);
        if (activeGroup) {
            this.setActiveGroup(new fabric.Group(activeGroup.getObjects()));
            activeGroup.forEachObject(function (o) {
                o.set("active", true);
            });
        }
        return data;
    }, toSVG:function (options, reviver) {
        options || (options = {});
        var markup = [];
        if (!options.suppressPreamble) {
            markup.push("<?xml version=\"1.0\" encoding=\"", (options.encoding || "UTF-8"), "\" standalone=\"no\" ?>", "<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" ", "\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\">\n");
        }
        markup.push("<svg ", "xmlns=\"http://www.w3.org/2000/svg\" ", "xmlns:xlink=\"http://www.w3.org/1999/xlink\" ", "version=\"1.1\" ", "width=\"", (options.viewBox ? options.viewBox.width : this.width), "\" ", "height=\"", (options.viewBox ? options.viewBox.height : this.height), "\" ", (this.backgroundColor && !this.backgroundColor.source ? "style=\"background-color: " + this.backgroundColor + "\" " : null), (options.viewBox ? "viewBox=\"" + options.viewBox.x + " " + options.viewBox.y + " " + options.viewBox.width + " " + options.viewBox.height + "\" " : null), "xml:space=\"preserve\">", "<desc>Created with Fabric.js ", fabric.version, "</desc>", "<defs>", fabric.createSVGFontFacesMarkup(this.getObjects()), fabric.createSVGRefElementsMarkup(this), "</defs>");
        if (this.backgroundColor && this.backgroundColor.source) {
            markup.push("<rect x=\"0\" y=\"0\" ", "width=\"", (this.backgroundColor.repeat === "repeat-y" || this.backgroundColor.repeat === "no-repeat" ? this.backgroundColor.source.width : this.width), "\" height=\"", (this.backgroundColor.repeat === "repeat-x" || this.backgroundColor.repeat === "no-repeat" ? this.backgroundColor.source.height : this.height), "\" fill=\"url(#backgroundColorPattern)\"", "></rect>");
        }
        if (this.backgroundImage) {
            markup.push("<image x=\"0\" y=\"0\" ", "width=\"", (this.backgroundImageStretch ? this.width : this.backgroundImage.width), "\" height=\"", (this.backgroundImageStretch ? this.height : this.backgroundImage.height), "\" preserveAspectRatio=\"", (this.backgroundImageStretch ? "none" : "defer"), "\" xlink:href=\"", this.backgroundImage.src, "\" style=\"opacity:", this.backgroundImageOpacity, "\"></image>");
        }
        if (this.overlayImage) {
            markup.push("<image x=\"", this.overlayImageLeft, "\" y=\"", this.overlayImageTop, "\" width=\"", this.overlayImage.width, "\" height=\"", this.overlayImage.height, "\" xlink:href=\"", this.overlayImage.src, "\"></image>");
        }
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            this.discardActiveGroup();
        }
        for (var i = 0, objects = this.getObjects(), len = objects.length; i < len; i++) {
            markup.push(objects[i].toSVG(reviver));
        }
        if (activeGroup) {
            this.setActiveGroup(new fabric.Group(activeGroup.getObjects()));
            activeGroup.forEachObject(function (o) {
                o.set("active", true);
            });
        }
        markup.push("</svg>");
        return markup.join("");
    }, remove:function (object) {
        if (this.getActiveObject() === object) {
            this.fire("before:selection:cleared", {target:object});
            this.discardActiveObject();
            this.fire("selection:cleared");
        }
        return fabric.Collection.remove.call(this, object);
    }, sendToBack:function (object) {
        removeFromArray(this._objects, object);
        this._objects.unshift(object);
        return this.renderAll && this.renderAll();
    }, bringToFront:function (object) {
        removeFromArray(this._objects, object);
        this._objects.push(object);
        return this.renderAll && this.renderAll();
    }, sendBackwards:function (object, intersecting) {
        var idx = this._objects.indexOf(object);
        if (idx !== 0) {
            var newIdx;
            if (intersecting) {
                newIdx = idx;
                for (var i = idx - 1; i >= 0; --i) {
                    var isIntersecting = object.intersectsWithObject(this._objects[i]) || object.isContainedWithinObject(this._objects[i]) || this._objects[i].isContainedWithinObject(object);
                    if (isIntersecting) {
                        newIdx = i;
                        break;
                    }
                }
            } else {
                newIdx = idx - 1;
            }
            removeFromArray(this._objects, object);
            this._objects.splice(newIdx, 0, object);
            this.renderAll && this.renderAll();
        }
        return this;
    }, bringForward:function (object, intersecting) {
        var idx = this._objects.indexOf(object);
        if (idx !== this._objects.length - 1) {
            var newIdx;
            if (intersecting) {
                newIdx = idx;
                for (var i = idx + 1; i < this._objects.length; ++i) {
                    var isIntersecting = object.intersectsWithObject(this._objects[i]) || object.isContainedWithinObject(this._objects[i]) || this._objects[i].isContainedWithinObject(object);
                    if (isIntersecting) {
                        newIdx = i;
                        break;
                    }
                }
            } else {
                newIdx = idx + 1;
            }
            removeFromArray(this._objects, object);
            this._objects.splice(newIdx, 0, object);
            this.renderAll && this.renderAll();
        }
        return this;
    }, moveTo:function (object, index) {
        removeFromArray(this._objects, object);
        this._objects.splice(index, 0, object);
        return this.renderAll && this.renderAll();
    }, dispose:function () {
        this.clear();
        if (!this.interactive) {
            return this;
        }
        if (fabric.isTouchSupported) {
            removeListener(this.upperCanvasEl, "touchstart", this._onMouseDown);
            removeListener(this.upperCanvasEl, "touchmove", this._onMouseMove);
            if (typeof Event !== "undefined" && "remove" in Event) {
                Event.remove(this.upperCanvasEl, "gesture", this._onGesture);
            }
        } else {
            removeListener(this.upperCanvasEl, "mousedown", this._onMouseDown);
            removeListener(this.upperCanvasEl, "mousemove", this._onMouseMove);
            removeListener(fabric.window, "resize", this._onResize);
        }
        return this;
    }, toString:function () {
        return "#<fabric.Canvas (" + this.complexity() + "): " + "{ objects: " + this.getObjects().length + " }>";
    }});
    extend(fabric.StaticCanvas.prototype, fabric.Observable);
    extend(fabric.StaticCanvas.prototype, fabric.Collection);
    extend(fabric.StaticCanvas.prototype, fabric.DataURLExporter);
    extend(fabric.StaticCanvas, {EMPTY_JSON:"{\"objects\": [], \"background\": \"white\"}", supports:function (methodName) {
        var el = fabric.util.createCanvasElement();
        if (!el || !el.getContext) {
            return null;
        }
        var ctx = el.getContext("2d");
        if (!ctx) {
            return null;
        }
        switch (methodName) {
          case "getImageData":
            return typeof ctx.getImageData !== "undefined";
          case "setLineDash":
            return typeof ctx.setLineDash !== "undefined";
          case "toDataURL":
            return typeof el.toDataURL !== "undefined";
          case "toDataURLWithQuality":
            try {
                el.toDataURL("image/jpeg", 0);
                return true;
            }
            catch (e) {
            }
            return false;
          default:
            return null;
        }
    }});
    fabric.StaticCanvas.prototype.toJSON = fabric.StaticCanvas.prototype.toObject;
})();
fabric.BaseBrush = fabric.util.createClass({color:"rgb(0, 0, 0)", width:1, shadow:null, strokeLineCap:"round", strokeLineJoin:"round", setShadow:function (options) {
    this.shadow = new fabric.Shadow(options);
    return this;
}, _setBrushStyles:function () {
    var ctx = this.canvas.contextTop;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.width;
    ctx.lineCap = this.strokeLineCap;
    ctx.lineJoin = this.strokeLineJoin;
}, _setShadow:function () {
    if (!this.shadow) {
        return;
    }
    var ctx = this.canvas.contextTop;
    ctx.shadowColor = this.shadow.color;
    ctx.shadowBlur = this.shadow.blur;
    ctx.shadowOffsetX = this.shadow.offsetX;
    ctx.shadowOffsetY = this.shadow.offsetY;
}, _resetShadow:function () {
    var ctx = this.canvas.contextTop;
    ctx.shadowColor = "";
    ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
}});
(function () {
    var utilMin = fabric.util.array.min, utilMax = fabric.util.array.max;
    fabric.PencilBrush = fabric.util.createClass(fabric.BaseBrush, {initialize:function (canvas) {
        this.canvas = canvas;
        this._points = [];
    }, onMouseDown:function (pointer) {
        this._prepareForDrawing(pointer);
        this._captureDrawingPath(pointer);
        this._render();
    }, onMouseMove:function (pointer) {
        this._captureDrawingPath(pointer);
        this.canvas.clearContext(this.canvas.contextTop);
        this._render();
    }, onMouseUp:function () {
        this._finalizeAndAddPath();
    }, _prepareForDrawing:function (pointer) {
        var p = new fabric.Point(pointer.x, pointer.y);
        this._reset();
        this._addPoint(p);
        this.canvas.contextTop.moveTo(p.x, p.y);
    }, _addPoint:function (point) {
        this._points.push(point);
    }, _reset:function () {
        this._points.length = 0;
        this._setBrushStyles();
        this._setShadow();
    }, _captureDrawingPath:function (pointer) {
        var pointerPoint = new fabric.Point(pointer.x, pointer.y);
        this._addPoint(pointerPoint);
    }, _render:function () {
        var ctx = this.canvas.contextTop;
        ctx.beginPath();
        var p1 = this._points[0];
        var p2 = this._points[1];
        if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
            p1.x -= 0.5;
            p2.x += 0.5;
        }
        ctx.moveTo(p1.x, p1.y);
        for (var i = 1, len = this._points.length; i < len; i++) {
            var midPoint = p1.midPointFrom(p2);
            ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
            p1 = this._points[i];
            p2 = this._points[i + 1];
        }
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
    }, _getSVGPathData:function () {
        this.box = this.getPathBoundingBox(this._points);
        return this.convertPointsToSVGPath(this._points, this.box.minx, this.box.maxx, this.box.miny, this.box.maxy);
    }, getPathBoundingBox:function (points) {
        var xBounds = [], yBounds = [], p1 = points[0], p2 = points[1], startPoint = p1;
        for (var i = 1, len = points.length; i < len; i++) {
            var midPoint = p1.midPointFrom(p2);
            xBounds.push(startPoint.x);
            xBounds.push(midPoint.x);
            yBounds.push(startPoint.y);
            yBounds.push(midPoint.y);
            p1 = points[i];
            p2 = points[i + 1];
            startPoint = midPoint;
        }
        xBounds.push(p1.x);
        yBounds.push(p1.y);
        return {minx:utilMin(xBounds), miny:utilMin(yBounds), maxx:utilMax(xBounds), maxy:utilMax(yBounds)};
    }, convertPointsToSVGPath:function (points, minX, maxX, minY) {
        var path = [];
        var p1 = new fabric.Point(points[0].x - minX, points[0].y - minY);
        var p2 = new fabric.Point(points[1].x - minX, points[1].y - minY);
        path.push("M ", points[0].x - minX, " ", points[0].y - minY, " ");
        for (var i = 1, len = points.length; i < len; i++) {
            var midPoint = p1.midPointFrom(p2);
            path.push("Q ", p1.x, " ", p1.y, " ", midPoint.x, " ", midPoint.y, " ");
            p1 = new fabric.Point(points[i].x - minX, points[i].y - minY);
            if ((i + 1) < points.length) {
                p2 = new fabric.Point(points[i + 1].x - minX, points[i + 1].y - minY);
            }
        }
        path.push("L ", p1.x, " ", p1.y, " ");
        return path;
    }, createPath:function (pathData) {
        var path = new fabric.Path(pathData);
        path.fill = null;
        path.stroke = this.color;
        path.strokeWidth = this.width;
        path.strokeLineCap = this.strokeLineCap;
        path.strokeLineJoin = this.strokeLineJoin;
        if (this.shadow) {
            this.shadow.affectStroke = true;
            path.setShadow(this.shadow);
        }
        return path;
    }, _finalizeAndAddPath:function () {
        var ctx = this.canvas.contextTop;
        ctx.closePath();
        var pathData = this._getSVGPathData().join("");
        if (pathData === "M 0 0 Q 0 0 0 0 L 0 0") {
            this.canvas.renderAll();
            return;
        }
        var originLeft = this.box.minx + (this.box.maxx - this.box.minx) / 2;
        var originTop = this.box.miny + (this.box.maxy - this.box.miny) / 2;
        this.canvas.contextTop.arc(originLeft, originTop, 3, 0, Math.PI * 2, false);
        var path = this.createPath(pathData);
        path.set({left:originLeft, top:originTop});
        this.canvas.add(path);
        path.setCoords();
        this.canvas.clearContext(this.canvas.contextTop);
        this._resetShadow();
        this.canvas.renderAll();
        this.canvas.fire("path:created", {path:path});
    }});
})();
fabric.CircleBrush = fabric.util.createClass(fabric.BaseBrush, {width:10, initialize:function (canvas) {
    this.canvas = canvas;
    this.points = [];
}, drawDot:function (pointer) {
    var point = this.addPoint(pointer);
    var ctx = this.canvas.contextTop;
    ctx.fillStyle = point.fill;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}, onMouseDown:function (pointer) {
    this.points.length = 0;
    this.canvas.clearContext(this.canvas.contextTop);
    this._setShadow();
    this.drawDot(pointer);
}, onMouseMove:function (pointer) {
    this.drawDot(pointer);
}, onMouseUp:function () {
    var originalRenderOnAddRemove = this.canvas.renderOnAddRemove;
    this.canvas.renderOnAddRemove = false;
    var circles = [];
    for (var i = 0, len = this.points.length; i < len; i++) {
        var point = this.points[i];
        var circle = new fabric.Circle({radius:point.radius, left:point.x, top:point.y, fill:point.fill});
        this.shadow && circle.setShadow(this.shadow);
        circles.push(circle);
    }
    var group = new fabric.Group(circles);
    this.canvas.add(group);
    this.canvas.fire("path:created", {path:group});
    this.canvas.clearContext(this.canvas.contextTop);
    this._resetShadow();
    this.canvas.renderOnAddRemove = originalRenderOnAddRemove;
    this.canvas.renderAll();
}, addPoint:function (pointer) {
    var pointerPoint = new fabric.Point(pointer.x, pointer.y);
    var circleRadius = fabric.util.getRandomInt(Math.max(0, this.width - 20), this.width + 20) / 2;
    var circleColor = new fabric.Color(this.color).setAlpha(fabric.util.getRandomInt(0, 100) / 100).toRgba();
    pointerPoint.radius = circleRadius;
    pointerPoint.fill = circleColor;
    this.points.push(pointerPoint);
    return pointerPoint;
}});
fabric.SprayBrush = fabric.util.createClass(fabric.BaseBrush, {width:10, density:20, dotWidth:1, dotWidthVariance:1, randomOpacity:false, optimizeOverlapping:true, initialize:function (canvas) {
    this.canvas = canvas;
    this.sprayChunks = [];
}, onMouseDown:function (pointer) {
    this.sprayChunks.length = 0;
    this.canvas.clearContext(this.canvas.contextTop);
    this._setShadow();
    this.addSprayChunk(pointer);
    this.render();
}, onMouseMove:function (pointer) {
    this.addSprayChunk(pointer);
    this.render();
}, onMouseUp:function () {
    var originalRenderOnAddRemove = this.canvas.renderOnAddRemove;
    this.canvas.renderOnAddRemove = false;
    var rects = [];
    for (var i = 0, ilen = this.sprayChunks.length; i < ilen; i++) {
        var sprayChunk = this.sprayChunks[i];
        for (var j = 0, jlen = sprayChunk.length; j < jlen; j++) {
            var rect = new fabric.Rect({width:sprayChunk[j].width, height:sprayChunk[j].width, left:sprayChunk[j].x + 1, top:sprayChunk[j].y + 1, fill:this.color});
            this.shadow && rect.setShadow(this.shadow);
            rects.push(rect);
        }
    }
    if (this.optimizeOverlapping) {
        rects = this._getOptimizedRects(rects);
    }
    var group = new fabric.Group(rects);
    this.canvas.add(group);
    this.canvas.fire("path:created", {path:group});
    this.canvas.clearContext(this.canvas.contextTop);
    this._resetShadow();
    this.canvas.renderOnAddRemove = originalRenderOnAddRemove;
    this.canvas.renderAll();
}, _getOptimizedRects:function (rects) {
    var uniqueRects = {}, key;
    for (var i = 0, len = rects.length; i < len; i++) {
        key = rects[i].left + "" + rects[i].top;
        if (!uniqueRects[key]) {
            uniqueRects[key] = rects[i];
        }
    }
    var uniqueRectsArray = [];
    for (key in uniqueRects) {
        uniqueRectsArray.push(uniqueRects[key]);
    }
    return uniqueRectsArray;
}, render:function () {
    var ctx = this.canvas.contextTop;
    ctx.fillStyle = this.color;
    ctx.save();
    for (var i = 0, len = this.sprayChunkPoints.length; i < len; i++) {
        var point = this.sprayChunkPoints[i];
        if (typeof point.opacity !== "undefined") {
            ctx.globalAlpha = point.opacity;
        }
        ctx.fillRect(point.x, point.y, point.width, point.width);
    }
    ctx.restore();
}, addSprayChunk:function (pointer) {
    this.sprayChunkPoints = [];
    var x, y, width, radius = this.width / 2;
    for (var i = 0; i < this.density; i++) {
        x = fabric.util.getRandomInt(pointer.x - radius, pointer.x + radius);
        y = fabric.util.getRandomInt(pointer.y - radius, pointer.y + radius);
        if (this.dotWidthVariance) {
            width = fabric.util.getRandomInt(Math.max(1, this.dotWidth - this.dotWidthVariance), this.dotWidth + this.dotWidthVariance);
        } else {
            width = this.dotWidth;
        }
        var point = {x:x, y:y, width:width};
        if (this.randomOpacity) {
            point.opacity = fabric.util.getRandomInt(0, 100) / 100;
        }
        this.sprayChunkPoints.push(point);
    }
    this.sprayChunks.push(this.sprayChunkPoints);
}});
fabric.PatternBrush = fabric.util.createClass(fabric.PencilBrush, {getPatternSrc:function () {
    var dotWidth = 20, dotDistance = 5, patternCanvas = fabric.document.createElement("canvas"), patternCtx = patternCanvas.getContext("2d");
    patternCanvas.width = patternCanvas.height = dotWidth + dotDistance;
    patternCtx.fillStyle = this.color;
    patternCtx.beginPath();
    patternCtx.arc(dotWidth / 2, dotWidth / 2, dotWidth / 2, 0, Math.PI * 2, false);
    patternCtx.closePath();
    patternCtx.fill();
    return patternCanvas;
}, getPatternSrcFunction:function () {
    return String(this.getPatternSrc).replace("this.color", "\"" + this.color + "\"");
}, getPattern:function () {
    return this.canvas.contextTop.createPattern(this.source || this.getPatternSrc(), "repeat");
}, _setBrushStyles:function () {
    this.callSuper("_setBrushStyles");
    this.canvas.contextTop.strokeStyle = this.getPattern();
}, createPath:function (pathData) {
    var path = this.callSuper("createPath", pathData);
    path.stroke = new fabric.Pattern({source:this.source || this.getPatternSrcFunction()});
    return path;
}});
(function () {
    var getPointer = fabric.util.getPointer, degreesToRadians = fabric.util.degreesToRadians, radiansToDegrees = fabric.util.radiansToDegrees, atan2 = Math.atan2, abs = Math.abs, min = Math.min, max = Math.max, STROKE_OFFSET = 0.5;
    fabric.Canvas = fabric.util.createClass(fabric.StaticCanvas, {initialize:function (el, options) {
        options || (options = {});
        this._initStatic(el, options);
        this._initInteractive();
        this._createCacheCanvas();
        fabric.Canvas.activeInstance = this;
    }, uniScaleTransform:false, centeredScaling:false, centeredRotation:false, interactive:true, selection:true, selectionColor:"rgba(100, 100, 255, 0.3)", selectionDashArray:[], selectionBorderColor:"rgba(255, 255, 255, 0.3)", selectionLineWidth:1, hoverCursor:"move", moveCursor:"move", defaultCursor:"default", freeDrawingCursor:"crosshair", rotationCursor:"crosshair", containerClass:"canvas-container", perPixelTargetFind:false, targetFindTolerance:0, skipTargetFind:false, _initInteractive:function () {
        this._currentTransform = null;
        this._groupSelector = null;
        this._initWrapperElement();
        this._createUpperCanvas();
        this._initEvents();
        this.freeDrawingBrush = fabric.PencilBrush && new fabric.PencilBrush(this);
        this.calcOffset();
    }, _resetCurrentTransform:function (e) {
        var t = this._currentTransform;
        t.target.set({"scaleX":t.original.scaleX, "scaleY":t.original.scaleY, "left":t.original.left, "top":t.original.top});
        if (this._shouldCenterTransform(e, t.target)) {
            if (t.action === "rotate") {
                this._setOriginToCenter(t.target);
            } else {
                if (t.originX !== "center") {
                    if (t.originX === "right") {
                        t.mouseXSign = -1;
                    } else {
                        t.mouseXSign = 1;
                    }
                }
                if (t.originY !== "center") {
                    if (t.originY === "bottom") {
                        t.mouseYSign = -1;
                    } else {
                        t.mouseYSign = 1;
                    }
                }
                t.originX = "center";
                t.originY = "center";
            }
        } else {
            t.originX = t.original.originX;
            t.originY = t.original.originY;
        }
    }, containsPoint:function (e, target) {
        var pointer = this.getPointer(e), xy = this._normalizePointer(target, pointer);
        return (target.containsPoint(xy) || target._findTargetCorner(e, this._offset));
    }, _normalizePointer:function (object, pointer) {
        var activeGroup = this.getActiveGroup(), x = pointer.x, y = pointer.y;
        var isObjectInGroup = (activeGroup && object.type !== "group" && activeGroup.contains(object));
        if (isObjectInGroup) {
            x -= activeGroup.left;
            y -= activeGroup.top;
        }
        return {x:x, y:y};
    }, isTargetTransparent:function (target, x, y) {
        var cacheContext = this.contextCache;
        var hasBorders = target.hasBorders, transparentCorners = target.transparentCorners;
        target.hasBorders = target.transparentCorners = false;
        this._draw(cacheContext, target);
        target.hasBorders = hasBorders;
        target.transparentCorners = transparentCorners;
        if (this.targetFindTolerance > 0) {
            if (x > this.targetFindTolerance) {
                x -= this.targetFindTolerance;
            } else {
                x = 0;
            }
            if (y > this.targetFindTolerance) {
                y -= this.targetFindTolerance;
            } else {
                y = 0;
            }
        }
        var isTransparent = true;
        var imageData = cacheContext.getImageData(x, y, (this.targetFindTolerance * 2) || 1, (this.targetFindTolerance * 2) || 1);
        for (var i = 3, l = imageData.data.length; i < l; i += 4) {
            var temp = imageData.data[i];
            isTransparent = temp <= 0;
            if (isTransparent === false) {
                break;
            }
        }
        imageData = null;
        this.clearContext(cacheContext);
        return isTransparent;
    }, _shouldClearSelection:function (e, target) {
        var activeGroup = this.getActiveGroup();
        return (!target || (target && activeGroup && !activeGroup.contains(target) && activeGroup !== target && !e.shiftKey) || (target && (!target.evented || !target.selectable)));
    }, _shouldCenterTransform:function (e, target) {
        if (!target) {
            return;
        }
        var t = this._currentTransform, centerTransform;
        if (t.action === "scale" || t.action === "scaleX" || t.action === "scaleY") {
            centerTransform = this.centeredScaling || target.centeredScaling;
        } else {
            if (t.action === "rotate") {
                centerTransform = this.centeredRotation || target.centeredRotation;
            }
        }
        return centerTransform ? !e.altKey : e.altKey;
    }, _setupCurrentTransform:function (e, target) {
        if (!target) {
            return;
        }
        var action = "drag", corner, pointer = getPointer(e, target.canvas.upperCanvasEl);
        corner = target._findTargetCorner(e, this._offset);
        if (corner) {
            action = (corner === "ml" || corner === "mr") ? "scaleX" : (corner === "mt" || corner === "mb") ? "scaleY" : corner === "mtr" ? "rotate" : "scale";
        }
        var originX = target.originX, originY = target.originY;
        if (corner === "ml" || corner === "tl" || corner === "bl") {
            originX = "right";
        } else {
            if (corner === "mr" || corner === "tr" || corner === "br") {
                originX = "left";
            }
        }
        if (corner === "tl" || corner === "mt" || corner === "tr") {
            originY = "bottom";
        } else {
            if (corner === "bl" || corner === "mb" || corner === "br") {
                originY = "top";
            }
        }
        this._currentTransform = {target:target, action:action, scaleX:target.scaleX, scaleY:target.scaleY, offsetX:pointer.x - target.left, offsetY:pointer.y - target.top, originX:originX, originY:originY, ex:pointer.x, ey:pointer.y, left:target.left, top:target.top, theta:degreesToRadians(target.angle), width:target.width * target.scaleX, mouseXSign:1, mouseYSign:1};
        this._currentTransform.original = {left:target.left, top:target.top, scaleX:target.scaleX, scaleY:target.scaleY, originX:originX, originY:originY};
        this._resetCurrentTransform(e);
    }, _shouldHandleGroupLogic:function (e, target) {
        var activeObject = this.getActiveObject();
        return e.shiftKey && (this.getActiveGroup() || (activeObject && activeObject !== target)) && this.selection;
    }, _handleGroupLogic:function (e, target) {
        if (target === this.getActiveGroup()) {
            target = this.findTarget(e, true);
            if (!target || target.isType("group")) {
                return;
            }
        }
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            if (activeGroup.contains(target)) {
                activeGroup.removeWithUpdate(target);
                this._resetObjectTransform(activeGroup);
                target.set("active", false);
                if (activeGroup.size() === 1) {
                    this.discardActiveGroup();
                }
            } else {
                activeGroup.addWithUpdate(target);
                this._resetObjectTransform(activeGroup);
            }
            this.fire("selection:created", {target:activeGroup, e:e});
            activeGroup.set("active", true);
        } else {
            if (this._activeObject) {
                if (target !== this._activeObject) {
                    var objects = this.getObjects();
                    var isActiveLower = objects.indexOf(this._activeObject) < objects.indexOf(target);
                    var group = new fabric.Group(isActiveLower ? [target, this._activeObject] : [this._activeObject, target]);
                    this.setActiveGroup(group);
                    this._activeObject = null;
                    activeGroup = this.getActiveGroup();
                    this.fire("selection:created", {target:activeGroup, e:e});
                }
            }
            target.set("active", true);
        }
        if (activeGroup) {
            activeGroup.saveCoords();
        }
    }, _translateObject:function (x, y) {
        var target = this._currentTransform.target;
        if (!target.get("lockMovementX")) {
            target.set("left", x - this._currentTransform.offsetX);
        }
        if (!target.get("lockMovementY")) {
            target.set("top", y - this._currentTransform.offsetY);
        }
    }, _scaleObject:function (x, y, by) {
        var t = this._currentTransform, offset = this._offset, target = t.target;
        var lockScalingX = target.get("lockScalingX"), lockScalingY = target.get("lockScalingY");
        if (lockScalingX && lockScalingY) {
            return;
        }
        var constraintPosition = target.translateToOriginPoint(target.getCenterPoint(), t.originX, t.originY);
        var localMouse = target.toLocalPoint(new fabric.Point(x - offset.left, y - offset.top), t.originX, t.originY);
        if (t.originX === "right") {
            localMouse.x *= -1;
        } else {
            if (t.originX === "center") {
                localMouse.x *= t.mouseXSign * 2;
                if (localMouse.x < 0) {
                    t.mouseXSign = -t.mouseXSign;
                }
            }
        }
        if (t.originY === "bottom") {
            localMouse.y *= -1;
        } else {
            if (t.originY === "center") {
                localMouse.y *= t.mouseYSign * 2;
                if (localMouse.y < 0) {
                    t.mouseYSign = -t.mouseYSign;
                }
            }
        }
        if (abs(localMouse.x) > target.padding) {
            if (localMouse.x < 0) {
                localMouse.x += target.padding;
            } else {
                localMouse.x -= target.padding;
            }
        } else {
            localMouse.x = 0;
        }
        if (abs(localMouse.y) > target.padding) {
            if (localMouse.y < 0) {
                localMouse.y += target.padding;
            } else {
                localMouse.y -= target.padding;
            }
        } else {
            localMouse.y = 0;
        }
        var newScaleX = target.scaleX, newScaleY = target.scaleY;
        if (by === "equally" && !lockScalingX && !lockScalingY) {
            var dist = localMouse.y + localMouse.x;
            var lastDist = (target.height + (target.strokeWidth)) * t.original.scaleY + (target.width + (target.strokeWidth)) * t.original.scaleX;
            newScaleX = t.original.scaleX * dist / lastDist;
            newScaleY = t.original.scaleY * dist / lastDist;
            target.set("scaleX", newScaleX);
            target.set("scaleY", newScaleY);
        } else {
            if (!by) {
                newScaleX = localMouse.x / (target.width + target.strokeWidth);
                newScaleY = localMouse.y / (target.height + target.strokeWidth);
                lockScalingX || target.set("scaleX", newScaleX);
                lockScalingY || target.set("scaleY", newScaleY);
            } else {
                if (by === "x" && !target.get("lockUniScaling")) {
                    newScaleX = localMouse.x / (target.width + target.strokeWidth);
                    lockScalingX || target.set("scaleX", newScaleX);
                } else {
                    if (by === "y" && !target.get("lockUniScaling")) {
                        newScaleY = localMouse.y / (target.height + target.strokeWidth);
                        lockScalingY || target.set("scaleY", newScaleY);
                    }
                }
            }
        }
        if (newScaleX < 0) {
            if (t.originX === "left") {
                t.originX = "right";
            } else {
                if (t.originX === "right") {
                    t.originX = "left";
                }
            }
        }
        if (newScaleY < 0) {
            if (t.originY === "top") {
                t.originY = "bottom";
            } else {
                if (t.originY === "bottom") {
                    t.originY = "top";
                }
            }
        }
        target.setPositionByOrigin(constraintPosition, t.originX, t.originY);
    }, _rotateObject:function (x, y) {
        var t = this._currentTransform, o = this._offset;
        if (t.target.get("lockRotation")) {
            return;
        }
        var lastAngle = atan2(t.ey - t.top - o.top, t.ex - t.left - o.left), curAngle = atan2(y - t.top - o.top, x - t.left - o.left), angle = radiansToDegrees(curAngle - lastAngle + t.theta);
        if (angle < 0) {
            angle = 360 + angle;
        }
        t.target.angle = angle;
    }, _setCursor:function (value) {
        this.upperCanvasEl.style.cursor = value;
    }, _resetObjectTransform:function (target) {
        target.scaleX = 1;
        target.scaleY = 1;
        target.setAngle(0);
    }, _drawSelection:function () {
        var ctx = this.contextTop, groupSelector = this._groupSelector, left = groupSelector.left, top = groupSelector.top, aleft = abs(left), atop = abs(top);
        ctx.fillStyle = this.selectionColor;
        ctx.fillRect(groupSelector.ex - ((left > 0) ? 0 : -left), groupSelector.ey - ((top > 0) ? 0 : -top), aleft, atop);
        ctx.lineWidth = this.selectionLineWidth;
        ctx.strokeStyle = this.selectionBorderColor;
        if (this.selectionDashArray.length > 1) {
            var px = groupSelector.ex + STROKE_OFFSET - ((left > 0) ? 0 : aleft);
            var py = groupSelector.ey + STROKE_OFFSET - ((top > 0) ? 0 : atop);
            ctx.beginPath();
            fabric.util.drawDashedLine(ctx, px, py, px + aleft, py, this.selectionDashArray);
            fabric.util.drawDashedLine(ctx, px, py + atop - 1, px + aleft, py + atop - 1, this.selectionDashArray);
            fabric.util.drawDashedLine(ctx, px, py, px, py + atop, this.selectionDashArray);
            fabric.util.drawDashedLine(ctx, px + aleft - 1, py, px + aleft - 1, py + atop, this.selectionDashArray);
            ctx.closePath();
            ctx.stroke();
        } else {
            ctx.strokeRect(groupSelector.ex + STROKE_OFFSET - ((left > 0) ? 0 : aleft), groupSelector.ey + STROKE_OFFSET - ((top > 0) ? 0 : atop), aleft, atop);
        }
    }, _findSelectedObjects:function (e) {
        var group = [], x1 = this._groupSelector.ex, y1 = this._groupSelector.ey, x2 = x1 + this._groupSelector.left, y2 = y1 + this._groupSelector.top, currentObject, selectionX1Y1 = new fabric.Point(min(x1, x2), min(y1, y2)), selectionX2Y2 = new fabric.Point(max(x1, x2), max(y1, y2)), isClick = x1 === x2 && y1 === y2;
        for (var i = this._objects.length; i--; ) {
            currentObject = this._objects[i];
            if (!currentObject) {
                continue;
            }
            if (currentObject.intersectsWithRect(selectionX1Y1, selectionX2Y2) || currentObject.isContainedWithinRect(selectionX1Y1, selectionX2Y2) || currentObject.containsPoint(selectionX1Y1) || currentObject.containsPoint(selectionX2Y2)) {
                if (this.selection && currentObject.selectable) {
                    currentObject.set("active", true);
                    group.push(currentObject);
                    if (isClick) {
                        break;
                    }
                }
            }
        }
        if (group.length === 1) {
            this.setActiveObject(group[0], e);
        } else {
            if (group.length > 1) {
                group = new fabric.Group(group.reverse());
                this.setActiveGroup(group);
                group.saveCoords();
                this.fire("selection:created", {target:group});
                this.renderAll();
            }
        }
    }, findTarget:function (e, skipGroup) {
        if (this.skipTargetFind) {
            return;
        }
        var target, pointer = this.getPointer(e);
        if (this.controlsAboveOverlay && this.lastRenderedObjectWithControlsAboveOverlay && this.lastRenderedObjectWithControlsAboveOverlay.visible && this.containsPoint(e, this.lastRenderedObjectWithControlsAboveOverlay) && this.lastRenderedObjectWithControlsAboveOverlay._findTargetCorner(e, this._offset)) {
            target = this.lastRenderedObjectWithControlsAboveOverlay;
            return target;
        }
        var activeGroup = this.getActiveGroup();
        if (activeGroup && !skipGroup && this.containsPoint(e, activeGroup)) {
            target = activeGroup;
            return target;
        }
        var possibleTargets = [];
        for (var i = this._objects.length; i--; ) {
            if (this._objects[i] && this._objects[i].visible && this._objects[i].evented && this.containsPoint(e, this._objects[i])) {
                if (this.perPixelTargetFind || this._objects[i].perPixelTargetFind) {
                    possibleTargets[possibleTargets.length] = this._objects[i];
                } else {
                    target = this._objects[i];
                    this.relatedTarget = target;
                    break;
                }
            }
        }
        for (var j = 0, len = possibleTargets.length; j < len; j++) {
            pointer = this.getPointer(e);
            var isTransparent = this.isTargetTransparent(possibleTargets[j], pointer.x, pointer.y);
            if (!isTransparent) {
                target = possibleTargets[j];
                this.relatedTarget = target;
                break;
            }
        }
        return target;
    }, getPointer:function (e) {
        var pointer = getPointer(e, this.upperCanvasEl);
        return {x:pointer.x - this._offset.left, y:pointer.y - this._offset.top};
    }, _createUpperCanvas:function () {
        var lowerCanvasClass = this.lowerCanvasEl.className.replace(/\s*lower-canvas\s*/, "");
        this.upperCanvasEl = this._createCanvasElement();
        fabric.util.addClass(this.upperCanvasEl, "upper-canvas " + lowerCanvasClass);
        this.wrapperEl.appendChild(this.upperCanvasEl);
        this._copyCanvasStyle(this.lowerCanvasEl, this.upperCanvasEl);
        this._applyCanvasStyle(this.upperCanvasEl);
        this.contextTop = this.upperCanvasEl.getContext("2d");
    }, _createCacheCanvas:function () {
        this.cacheCanvasEl = this._createCanvasElement();
        this.cacheCanvasEl.setAttribute("width", this.width);
        this.cacheCanvasEl.setAttribute("height", this.height);
        this.contextCache = this.cacheCanvasEl.getContext("2d");
    }, _initWrapperElement:function () {
        this.wrapperEl = fabric.util.wrapElement(this.lowerCanvasEl, "div", {"class":this.containerClass});
        fabric.util.setStyle(this.wrapperEl, {width:this.getWidth() + "px", height:this.getHeight() + "px", position:"relative"});
        fabric.util.makeElementUnselectable(this.wrapperEl);
    }, _applyCanvasStyle:function (element) {
        var width = this.getWidth() || element.width, height = this.getHeight() || element.height;
        fabric.util.setStyle(element, {position:"absolute", width:width + "px", height:height + "px", left:0, top:0});
        element.width = width;
        element.height = height;
        fabric.util.makeElementUnselectable(element);
    }, _copyCanvasStyle:function (fromEl, toEl) {
        toEl.style.cssText = fromEl.style.cssText;
    }, getSelectionContext:function () {
        return this.contextTop;
    }, getSelectionElement:function () {
        return this.upperCanvasEl;
    }, setActiveObject:function (object, e) {
        if (this._activeObject) {
            this._activeObject.set("active", false);
        }
        this._activeObject = object;
        object.set("active", true);
        this.renderAll();
        this.fire("object:selected", {target:object, e:e});
        object.fire("selected", {e:e});
        return this;
    }, getActiveObject:function () {
        return this._activeObject;
    }, discardActiveObject:function () {
        if (this._activeObject) {
            this._activeObject.set("active", false);
        }
        this._activeObject = null;
        return this;
    }, setActiveGroup:function (group) {
        this._activeGroup = group;
        if (group) {
            group.canvas = this;
            group.set("active", true);
        }
        return this;
    }, getActiveGroup:function () {
        return this._activeGroup;
    }, discardActiveGroup:function () {
        var g = this.getActiveGroup();
        if (g) {
            g.destroy();
        }
        return this.setActiveGroup(null);
    }, deactivateAll:function () {
        var allObjects = this.getObjects(), i = 0, len = allObjects.length;
        for (; i < len; i++) {
            allObjects[i].set("active", false);
        }
        this.discardActiveGroup();
        this.discardActiveObject();
        return this;
    }, deactivateAllWithDispatch:function () {
        var activeObject = this.getActiveGroup() || this.getActiveObject();
        if (activeObject) {
            this.fire("before:selection:cleared", {target:activeObject});
        }
        this.deactivateAll();
        if (activeObject) {
            this.fire("selection:cleared");
        }
        return this;
    }, drawControls:function (ctx) {
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            ctx.save();
            fabric.Group.prototype.transform.call(activeGroup, ctx);
            activeGroup.drawBorders(ctx).drawControls(ctx);
            ctx.restore();
        } else {
            for (var i = 0, len = this._objects.length; i < len; ++i) {
                if (!this._objects[i] || !this._objects[i].active) {
                    continue;
                }
                ctx.save();
                fabric.Object.prototype.transform.call(this._objects[i], ctx);
                this._objects[i].drawBorders(ctx).drawControls(ctx);
                ctx.restore();
                this.lastRenderedObjectWithControlsAboveOverlay = this._objects[i];
            }
        }
    }});
    for (var prop in fabric.StaticCanvas) {
        if (prop !== "prototype") {
            fabric.Canvas[prop] = fabric.StaticCanvas[prop];
        }
    }
    if (fabric.isTouchSupported) {
        fabric.Canvas.prototype._setCursorFromEvent = function () {
        };
    }
    fabric.Element = fabric.Canvas;
})();
(function () {
    var cursorMap = ["n-resize", "ne-resize", "e-resize", "se-resize", "s-resize", "sw-resize", "w-resize", "nw-resize"], cursorOffset = {"mt":0, "tr":1, "mr":2, "br":3, "mb":4, "bl":5, "ml":6, "tl":7}, addListener = fabric.util.addListener, removeListener = fabric.util.removeListener, getPointer = fabric.util.getPointer;
    fabric.util.object.extend(fabric.Canvas.prototype, {_initEvents:function () {
        var _this = this;
        this._onMouseDown = this._onMouseDown.bind(this);
        this._onMouseMove = this._onMouseMove.bind(this);
        this._onMouseUp = this._onMouseUp.bind(this);
        this._onResize = this._onResize.bind(this);
        this._onGesture = function (e, s) {
            _this.__onTransformGesture(e, s);
        };
        addListener(fabric.window, "resize", this._onResize);
        if (fabric.isTouchSupported) {
            addListener(this.upperCanvasEl, "touchstart", this._onMouseDown);
            addListener(this.upperCanvasEl, "touchmove", this._onMouseMove);
            if (typeof Event !== "undefined" && "add" in Event) {
                Event.add(this.upperCanvasEl, "gesture", this._onGesture);
            }
        } else {
            addListener(this.upperCanvasEl, "mousedown", this._onMouseDown);
            addListener(this.upperCanvasEl, "mousemove", this._onMouseMove);
        }
    }, _onMouseDown:function (e) {
        this.__onMouseDown(e);
        !fabric.isTouchSupported && addListener(fabric.document, "mouseup", this._onMouseUp);
        fabric.isTouchSupported && addListener(fabric.document, "touchend", this._onMouseUp);
        !fabric.isTouchSupported && addListener(fabric.document, "mousemove", this._onMouseMove);
        fabric.isTouchSupported && addListener(fabric.document, "touchmove", this._onMouseMove);
        !fabric.isTouchSupported && removeListener(this.upperCanvasEl, "mousemove", this._onMouseMove);
        fabric.isTouchSupported && removeListener(this.upperCanvasEl, "touchmove", this._onMouseMove);
    }, _onMouseUp:function (e) {
        this.__onMouseUp(e);
        !fabric.isTouchSupported && removeListener(fabric.document, "mouseup", this._onMouseUp);
        fabric.isTouchSupported && removeListener(fabric.document, "touchend", this._onMouseUp);
        !fabric.isTouchSupported && removeListener(fabric.document, "mousemove", this._onMouseMove);
        fabric.isTouchSupported && removeListener(fabric.document, "touchmove", this._onMouseMove);
        !fabric.isTouchSupported && addListener(this.upperCanvasEl, "mousemove", this._onMouseMove);
        fabric.isTouchSupported && addListener(this.upperCanvasEl, "touchmove", this._onMouseMove);
    }, _onMouseMove:function (e) {
        !this.allowTouchScrolling && e.preventDefault && e.preventDefault();
        this.__onMouseMove(e);
    }, _onResize:function () {
        this.calcOffset();
    }, _shouldRender:function (target, pointer) {
        var activeObject = this.getActiveGroup() || this.getActiveObject();
        return ((target && (target.isMoving || target !== activeObject)) || (!target && activeObject) || (pointer && this._previousPointer && this.selection && (pointer.x !== this._previousPointer.x || pointer.y !== this._previousPointer.y)));
    }, __onMouseUp:function (e) {
        var target, pointer, render;
        if (this.isDrawingMode && this._isCurrentlyDrawing) {
            this._isCurrentlyDrawing = false;
            if (this.clipTo) {
                this.contextTop.restore();
            }
            this.freeDrawingBrush.onMouseUp();
            this.fire("mouse:up", {e:e});
            return;
        }
        if (this._currentTransform) {
            var transform = this._currentTransform;
            target = transform.target;
            if (target._scaling) {
                target._scaling = false;
            }
            target.setCoords();
            if (this.stateful && target.hasStateChanged()) {
                this.fire("object:modified", {target:target});
                target.fire("modified");
            }
            if (this._previousOriginX && this._previousOriginY) {
                var originPoint = target.translateToOriginPoint(target.getCenterPoint(), this._previousOriginX, this._previousOriginY);
                target.originX = this._previousOriginX;
                target.originY = this._previousOriginY;
                target.left = originPoint.x;
                target.top = originPoint.y;
                this._previousOriginX = null;
                this._previousOriginY = null;
            }
        } else {
            pointer = this.getPointer(e);
        }
        render = this._shouldRender(target, pointer);
        if (this.selection && this._groupSelector) {
            this._findSelectedObjects(e);
        }
        var activeGroup = this.getActiveGroup();
        if (activeGroup) {
            activeGroup.setObjectsCoords();
            activeGroup.isMoving = false;
            this._setCursor(this.defaultCursor);
        }
        this._groupSelector = null;
        this._currentTransform = null;
        if (target) {
            target.isMoving = false;
        }
        render && this.renderAll();
        this._setCursorFromEvent(e, target);
        var _this = this;
        setTimeout(function () {
            _this._setCursorFromEvent(e, target);
        }, 50);
        this.fire("mouse:up", {target:target, e:e});
        target && target.fire("mouseup", {e:e});
    }, _onMouseDownInDrawingMode:function (e) {
        this._isCurrentlyDrawing = true;
        this.discardActiveObject().renderAll();
        if (this.clipTo) {
            fabric.util.clipContext(this, this.contextTop);
        }
        this.freeDrawingBrush.onMouseDown(this.getPointer(e));
        this.fire("mouse:down", {e:e});
    }, __onMouseDown:function (e) {
        var isLeftClick = "which" in e ? e.which === 1 : e.button === 1;
        if (!isLeftClick && !fabric.isTouchSupported) {
            return;
        }
        if (this.isDrawingMode) {
            this._onMouseDownInDrawingMode(e);
            return;
        }
        if (this._currentTransform) {
            return;
        }
        var target = this.findTarget(e), pointer = this.getPointer(e), corner, render;
        this._previousPointer = pointer;
        render = this._shouldRender(target, pointer);
        if (this._shouldClearSelection(e, target)) {
            if (this.selection) {
                this._groupSelector = {ex:pointer.x, ey:pointer.y, top:0, left:0};
            }
            this.deactivateAllWithDispatch();
            target && target.selectable && this.setActiveObject(target, e);
        } else {
            if (this._shouldHandleGroupLogic(e, target)) {
                this._handleGroupLogic(e, target);
                target = this.getActiveGroup();
            } else {
                this.stateful && target.saveState();
                if ((corner = target._findTargetCorner(e, this._offset))) {
                    this.onBeforeScaleRotate(target);
                }
                if (target !== this.getActiveGroup() && target !== this.getActiveObject()) {
                    this.deactivateAll();
                    this.setActiveObject(target, e);
                }
                this._setupCurrentTransform(e, target);
            }
        }
        render && this.renderAll();
        this.fire("mouse:down", {target:target, e:e});
        target && target.fire("mousedown", {e:e});
    }, _setOriginToCenter:function (target) {
        this._previousOriginX = this._currentTransform.target.originX;
        this._previousOriginY = this._currentTransform.target.originY;
        var center = target.getCenterPoint();
        target.originX = "center";
        target.originY = "center";
        target.left = center.x;
        target.top = center.y;
        this._currentTransform.left = target.left;
        this._currentTransform.top = target.top;
    }, _setCenterToOrigin:function (target) {
        var originPoint = target.translateToOriginPoint(target.getCenterPoint(), this._previousOriginX, this._previousOriginY);
        target.originX = this._previousOriginX;
        target.originY = this._previousOriginY;
        target.left = originPoint.x;
        target.top = originPoint.y;
        this._previousOriginX = null;
        this._previousOriginY = null;
    }, __onMouseMove:function (e) {
        var target, pointer;
        if (this.isDrawingMode) {
            if (this._isCurrentlyDrawing) {
                pointer = this.getPointer(e);
                this.freeDrawingBrush.onMouseMove(pointer);
            }
            this.upperCanvasEl.style.cursor = this.freeDrawingCursor;
            this.fire("mouse:move", {e:e});
            return;
        }
        var groupSelector = this._groupSelector;
        if (groupSelector) {
            pointer = getPointer(e, this.upperCanvasEl);
            groupSelector.left = pointer.x - this._offset.left - groupSelector.ex;
            groupSelector.top = pointer.y - this._offset.top - groupSelector.ey;
            this.renderTop();
        } else {
            if (!this._currentTransform) {
                var style = this.upperCanvasEl.style;
                target = this.findTarget(e);
                if (!target || target && !target.selectable) {
                    style.cursor = this.defaultCursor;
                } else {
                    this._setCursorFromEvent(e, target);
                }
            } else {
                pointer = getPointer(e, this.upperCanvasEl);
                var x = pointer.x, y = pointer.y, reset = false, centerTransform, transform = this._currentTransform;
                target = transform.target;
                target.isMoving = true;
                if (transform.action === "scale" || transform.action === "scaleX" || transform.action === "scaleY") {
                    centerTransform = this._shouldCenterTransform(e, target);
                    if ((centerTransform && (transform.originX !== "center" || transform.originY !== "center")) || (!centerTransform && transform.originX === "center" && transform.originY === "center")) {
                        this._resetCurrentTransform(e);
                        reset = true;
                    }
                }
                if (transform.action === "rotate") {
                    this._rotateObject(x, y);
                    this.fire("object:rotating", {target:target, e:e});
                    target.fire("rotating", {e:e});
                } else {
                    if (transform.action === "scale") {
                        if ((e.shiftKey || this.uniScaleTransform) && !target.get("lockUniScaling")) {
                            transform.currentAction = "scale";
                            this._scaleObject(x, y);
                        } else {
                            if (!reset && transform.currentAction === "scale") {
                                this._resetCurrentTransform(e, target);
                            }
                            transform.currentAction = "scaleEqually";
                            this._scaleObject(x, y, "equally");
                        }
                        this.fire("object:scaling", {target:target, e:e});
                        target.fire("scaling", {e:e});
                    } else {
                        if (transform.action === "scaleX") {
                            this._scaleObject(x, y, "x");
                            this.fire("object:scaling", {target:target, e:e});
                            target.fire("scaling", {e:e});
                        } else {
                            if (transform.action === "scaleY") {
                                this._scaleObject(x, y, "y");
                                this.fire("object:scaling", {target:target, e:e});
                                target.fire("scaling", {e:e});
                            } else {
                                this._translateObject(x, y);
                                this.fire("object:moving", {target:target, e:e});
                                target.fire("moving", {e:e});
                                this._setCursor(this.moveCursor);
                            }
                        }
                    }
                }
                this.renderAll();
            }
        }
        this.fire("mouse:move", {target:target, e:e});
        target && target.fire("mousemove", {e:e});
    }, _setCursorFromEvent:function (e, target) {
        var s = this.upperCanvasEl.style;
        if (!target) {
            s.cursor = this.defaultCursor;
            return false;
        } else {
            var activeGroup = this.getActiveGroup();
            var corner = target._findTargetCorner && (!activeGroup || !activeGroup.contains(target)) && target._findTargetCorner(e, this._offset);
            if (!corner) {
                s.cursor = target.hoverCursor || this.hoverCursor;
            } else {
                if (corner in cursorOffset) {
                    var n = Math.round((target.getAngle() % 360) / 45);
                    if (n < 0) {
                        n += 8;
                    }
                    n += cursorOffset[corner];
                    n %= 8;
                    s.cursor = cursorMap[n];
                } else {
                    if (corner === "mtr" && target.hasRotatingPoint) {
                        s.cursor = this.rotationCursor;
                    } else {
                        s.cursor = this.defaultCursor;
                        return false;
                    }
                }
            }
        }
        return true;
    }});
})();
fabric.util.object.extend(fabric.StaticCanvas.prototype, {toDataURL:function (options) {
    options || (options = {});
    var format = options.format || "png", quality = options.quality || 1, multiplier = options.multiplier || 1, cropping = {left:options.left, top:options.top, width:options.width, height:options.height};
    if (multiplier !== 1) {
        return this.__toDataURLWithMultiplier(format, quality, cropping, multiplier);
    } else {
        return this.__toDataURL(format, quality, cropping);
    }
}, __toDataURL:function (format, quality, cropping) {
    this.renderAll(true);
    var canvasEl = this.upperCanvasEl || this.lowerCanvasEl;
    var croppedCanvasEl = this.__getCroppedCanvas(canvasEl, cropping);
    if (format === "jpg") {
        format = "jpeg";
    }
    var data = (fabric.StaticCanvas.supports("toDataURLWithQuality")) ? (croppedCanvasEl || canvasEl).toDataURL("image/" + format, quality) : (croppedCanvasEl || canvasEl).toDataURL("image/" + format);
    this.contextTop && this.clearContext(this.contextTop);
    this.renderAll();
    if (croppedCanvasEl) {
        croppedCanvasEl = null;
    }
    return data;
}, __getCroppedCanvas:function (canvasEl, cropping) {
    var croppedCanvasEl, croppedCtx;
    var shouldCrop = "left" in cropping || "top" in cropping || "width" in cropping || "height" in cropping;
    if (shouldCrop) {
        croppedCanvasEl = fabric.util.createCanvasElement();
        croppedCtx = croppedCanvasEl.getContext("2d");
        croppedCanvasEl.width = cropping.width || this.width;
        croppedCanvasEl.height = cropping.height || this.height;
        croppedCtx.drawImage(canvasEl, -cropping.left || 0, -cropping.top || 0);
    }
    return croppedCanvasEl;
}, __toDataURLWithMultiplier:function (format, quality, cropping, multiplier) {
    var origWidth = this.getWidth(), origHeight = this.getHeight(), scaledWidth = origWidth * multiplier, scaledHeight = origHeight * multiplier, activeObject = this.getActiveObject(), activeGroup = this.getActiveGroup(), ctx = this.contextTop || this.contextContainer;
    this.setWidth(scaledWidth).setHeight(scaledHeight);
    ctx.scale(multiplier, multiplier);
    if (cropping.left) {
        cropping.left *= multiplier;
    }
    if (cropping.top) {
        cropping.top *= multiplier;
    }
    if (cropping.width) {
        cropping.width *= multiplier;
    }
    if (cropping.height) {
        cropping.height *= multiplier;
    }
    if (activeGroup) {
        this._tempRemoveBordersControlsFromGroup(activeGroup);
    } else {
        if (activeObject && this.deactivateAll) {
            this.deactivateAll();
        }
    }
    this.width = origWidth;
    this.height = origHeight;
    this.renderAll(true);
    var data = this.__toDataURL(format, quality, cropping);
    ctx.scale(1 / multiplier, 1 / multiplier);
    this.setWidth(origWidth).setHeight(origHeight);
    if (activeGroup) {
        this._restoreBordersControlsOnGroup(activeGroup);
    } else {
        if (activeObject && this.setActiveObject) {
            this.setActiveObject(activeObject);
        }
    }
    this.contextTop && this.clearContext(this.contextTop);
    this.renderAll();
    return data;
}, toDataURLWithMultiplier:function (format, multiplier, quality) {
    return this.toDataURL({format:format, multiplier:multiplier, quality:quality});
}, _tempRemoveBordersControlsFromGroup:function (group) {
    group.origHasControls = group.hasControls;
    group.origBorderColor = group.borderColor;
    group.hasControls = true;
    group.borderColor = "rgba(0,0,0,0)";
    group.forEachObject(function (o) {
        o.origBorderColor = o.borderColor;
        o.borderColor = "rgba(0,0,0,0)";
    });
}, _restoreBordersControlsOnGroup:function (group) {
    group.hideControls = group.origHideControls;
    group.borderColor = group.origBorderColor;
    group.forEachObject(function (o) {
        o.borderColor = o.origBorderColor;
        delete o.origBorderColor;
    });
}});
fabric.util.object.extend(fabric.StaticCanvas.prototype, {loadFromDatalessJSON:function (json, callback, reviver) {
    return this.loadFromJSON(json, callback, reviver);
}, loadFromJSON:function (json, callback, reviver) {
    if (!json) {
        return;
    }
    var serialized = (typeof json === "string") ? JSON.parse(json) : json;
    this.clear();
    var _this = this;
    this._enlivenObjects(serialized.objects, function () {
        _this._setBgOverlayImages(serialized, callback);
    }, reviver);
    return this;
}, _setBgOverlayImages:function (serialized, callback) {
    var _this = this, backgroundPatternLoaded, backgroundImageLoaded, overlayImageLoaded;
    var cbIfLoaded = function () {
        callback && backgroundImageLoaded && overlayImageLoaded && backgroundPatternLoaded && callback();
    };
    if (serialized.backgroundImage) {
        this.setBackgroundImage(serialized.backgroundImage, function () {
            _this.backgroundImageOpacity = serialized.backgroundImageOpacity;
            _this.backgroundImageStretch = serialized.backgroundImageStretch;
            _this.renderAll();
            backgroundImageLoaded = true;
            cbIfLoaded();
        });
    } else {
        backgroundImageLoaded = true;
    }
    if (serialized.overlayImage) {
        this.setOverlayImage(serialized.overlayImage, function () {
            _this.overlayImageLeft = serialized.overlayImageLeft || 0;
            _this.overlayImageTop = serialized.overlayImageTop || 0;
            _this.renderAll();
            overlayImageLoaded = true;
            cbIfLoaded();
        });
    } else {
        overlayImageLoaded = true;
    }
    if (serialized.background) {
        this.setBackgroundColor(serialized.background, function () {
            _this.renderAll();
            backgroundPatternLoaded = true;
            cbIfLoaded();
        });
    } else {
        backgroundPatternLoaded = true;
    }
    if (!serialized.backgroundImage && !serialized.overlayImage && !serialized.background) {
        callback && callback();
    }
}, _enlivenObjects:function (objects, callback, reviver) {
    var _this = this;
    if (objects.length === 0) {
        callback && callback();
    }
    var renderOnAddRemove = this.renderOnAddRemove;
    this.renderOnAddRemove = false;
    fabric.util.enlivenObjects(objects, function (enlivenedObjects) {
        enlivenedObjects.forEach(function (obj, index) {
            _this.insertAt(obj, index, true);
        });
        _this.renderOnAddRemove = renderOnAddRemove;
        callback && callback();
    }, null, reviver);
}, _toDataURL:function (format, callback) {
    this.clone(function (clone) {
        callback(clone.toDataURL(format));
    });
}, _toDataURLWithMultiplier:function (format, multiplier, callback) {
    this.clone(function (clone) {
        callback(clone.toDataURLWithMultiplier(format, multiplier));
    });
}, clone:function (callback) {
    var data = JSON.stringify(this);
    this.cloneWithoutData(function (clone) {
        clone.loadFromJSON(data, function () {
            callback && callback(clone);
        });
    });
}, cloneWithoutData:function (callback) {
    var el = fabric.document.createElement("canvas");
    el.width = this.getWidth();
    el.height = this.getHeight();
    var clone = new fabric.Canvas(el);
    clone.clipTo = this.clipTo;
    if (this.backgroundImage) {
        clone.setBackgroundImage(this.backgroundImage.src, function () {
            clone.renderAll();
            callback && callback(clone);
        });
        clone.backgroundImageOpacity = this.backgroundImageOpacity;
        clone.backgroundImageStretch = this.backgroundImageStretch;
    } else {
        callback && callback(clone);
    }
}});
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, toFixed = fabric.util.toFixed, capitalize = fabric.util.string.capitalize, degreesToRadians = fabric.util.degreesToRadians, supportsLineDash = fabric.StaticCanvas.supports("setLineDash");
    if (fabric.Object) {
        return;
    }
    fabric.Object = fabric.util.createClass({type:"object", originX:"center", originY:"center", top:0, left:0, width:0, height:0, scaleX:1, scaleY:1, flipX:false, flipY:false, opacity:1, angle:0, cornerSize:12, transparentCorners:true, hoverCursor:null, padding:0, borderColor:"rgba(102,153,255,0.75)", cornerColor:"rgba(102,153,255,0.5)", centeredScaling:false, centeredRotation:false, fill:"rgb(0,0,0)", fillRule:"source-over", backgroundColor:"", stroke:null, strokeWidth:1, strokeDashArray:null, strokeLineCap:"butt", strokeLineJoin:"miter", strokeMiterLimit:10, shadow:null, borderOpacityWhenMoving:0.4, borderScaleFactor:1, transformMatrix:null, minScaleLimit:0.01, selectable:true, evented:true, visible:true, hasControls:true, hasBorders:true, hasRotatingPoint:true, rotatingPointOffset:40, perPixelTargetFind:false, includeDefaultValues:true, clipTo:null, lockMovementX:false, lockMovementY:false, lockRotation:false, lockScalingX:false, lockScalingY:false, lockUniScaling:false, stateProperties:("top left width height scaleX scaleY flipX flipY originX originY transformMatrix " + "stroke strokeWidth strokeDashArray strokeLineCap strokeLineJoin strokeMiterLimit " + "angle opacity fill fillRule shadow clipTo visible backgroundColor").split(" "), initialize:function (options) {
        if (options) {
            this.setOptions(options);
        }
    }, _initGradient:function (options) {
        if (options.fill && options.fill.colorStops && !(options.fill instanceof fabric.Gradient)) {
            this.set("fill", new fabric.Gradient(options.fill));
        }
    }, _initPattern:function (options) {
        if (options.fill && options.fill.source && !(options.fill instanceof fabric.Pattern)) {
            this.set("fill", new fabric.Pattern(options.fill));
        }
        if (options.stroke && options.stroke.source && !(options.stroke instanceof fabric.Pattern)) {
            this.set("stroke", new fabric.Pattern(options.stroke));
        }
    }, _initClipping:function (options) {
        if (!options.clipTo || typeof options.clipTo !== "string") {
            return;
        }
        var functionBody = fabric.util.getFunctionBody(options.clipTo);
        if (typeof functionBody !== "undefined") {
            this.clipTo = new Function("ctx", functionBody);
        }
    }, setOptions:function (options) {
        for (var prop in options) {
            this.set(prop, options[prop]);
        }
        this._initGradient(options);
        this._initPattern(options);
        this._initClipping(options);
    }, transform:function (ctx, fromLeft) {
        ctx.globalAlpha = this.opacity;
        var center = fromLeft ? this._getLeftTopCoords() : this.getCenterPoint();
        ctx.translate(center.x, center.y);
        ctx.rotate(degreesToRadians(this.angle));
        ctx.scale(this.scaleX * (this.flipX ? -1 : 1), this.scaleY * (this.flipY ? -1 : 1));
    }, toObject:function (propertiesToInclude) {
        var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;
        var object = {type:this.type, originX:this.originX, originY:this.originY, left:toFixed(this.left, NUM_FRACTION_DIGITS), top:toFixed(this.top, NUM_FRACTION_DIGITS), width:toFixed(this.width, NUM_FRACTION_DIGITS), height:toFixed(this.height, NUM_FRACTION_DIGITS), fill:(this.fill && this.fill.toObject) ? this.fill.toObject() : this.fill, stroke:(this.stroke && this.stroke.toObject) ? this.stroke.toObject() : this.stroke, strokeWidth:toFixed(this.strokeWidth, NUM_FRACTION_DIGITS), strokeDashArray:this.strokeDashArray, strokeLineCap:this.strokeLineCap, strokeLineJoin:this.strokeLineJoin, strokeMiterLimit:toFixed(this.strokeMiterLimit, NUM_FRACTION_DIGITS), scaleX:toFixed(this.scaleX, NUM_FRACTION_DIGITS), scaleY:toFixed(this.scaleY, NUM_FRACTION_DIGITS), angle:toFixed(this.getAngle(), NUM_FRACTION_DIGITS), flipX:this.flipX, flipY:this.flipY, opacity:toFixed(this.opacity, NUM_FRACTION_DIGITS), shadow:(this.shadow && this.shadow.toObject) ? this.shadow.toObject() : this.shadow, visible:this.visible, clipTo:this.clipTo && String(this.clipTo), backgroundColor:this.backgroundColor};
        if (!this.includeDefaultValues) {
            object = this._removeDefaultValues(object);
        }
        fabric.util.populateWithProperties(this, object, propertiesToInclude);
        return object;
    }, toDatalessObject:function (propertiesToInclude) {
        return this.toObject(propertiesToInclude);
    }, getSvgStyles:function () {
        var fill = this.fill ? (this.fill.toLive ? "url(#SVGID_" + this.fill.id + ")" : this.fill) : "none";
        var stroke = this.stroke ? (this.stroke.toLive ? "url(#SVGID_" + this.stroke.id + ")" : this.stroke) : "none";
        var strokeWidth = this.strokeWidth ? this.strokeWidth : "0";
        var strokeDashArray = this.strokeDashArray ? this.strokeDashArray.join(" ") : "";
        var strokeLineCap = this.strokeLineCap ? this.strokeLineCap : "butt";
        var strokeLineJoin = this.strokeLineJoin ? this.strokeLineJoin : "miter";
        var strokeMiterLimit = this.strokeMiterLimit ? this.strokeMiterLimit : "4";
        var opacity = typeof this.opacity !== "undefined" ? this.opacity : "1";
        var visibility = this.visible ? "" : " visibility: hidden;";
        var filter = this.shadow && this.type !== "text" ? "filter: url(#SVGID_" + this.shadow.id + ");" : "";
        return ["stroke: ", stroke, "; ", "stroke-width: ", strokeWidth, "; ", "stroke-dasharray: ", strokeDashArray, "; ", "stroke-linecap: ", strokeLineCap, "; ", "stroke-linejoin: ", strokeLineJoin, "; ", "stroke-miterlimit: ", strokeMiterLimit, "; ", "fill: ", fill, "; ", "opacity: ", opacity, ";", filter, visibility].join("");
    }, getSvgTransform:function () {
        var angle = this.getAngle();
        var center = this.getCenterPoint();
        var NUM_FRACTION_DIGITS = fabric.Object.NUM_FRACTION_DIGITS;
        var translatePart = "translate(" + toFixed(center.x, NUM_FRACTION_DIGITS) + " " + toFixed(center.y, NUM_FRACTION_DIGITS) + ")";
        var anglePart = angle !== 0 ? (" rotate(" + toFixed(angle, NUM_FRACTION_DIGITS) + ")") : "";
        var scalePart = (this.scaleX === 1 && this.scaleY === 1) ? "" : (" scale(" + toFixed(this.scaleX, NUM_FRACTION_DIGITS) + " " + toFixed(this.scaleY, NUM_FRACTION_DIGITS) + ")");
        var flipXPart = this.flipX ? "matrix(-1 0 0 1 0 0) " : "";
        var flipYPart = this.flipY ? "matrix(1 0 0 -1 0 0)" : "";
        return [translatePart, anglePart, scalePart, flipXPart, flipYPart].join("");
    }, _createBaseSVGMarkup:function () {
        var markup = [];
        if (this.fill && this.fill.toLive) {
            markup.push(this.fill.toSVG(this, false));
        }
        if (this.stroke && this.stroke.toLive) {
            markup.push(this.stroke.toSVG(this, false));
        }
        if (this.shadow) {
            markup.push(this.shadow.toSVG(this));
        }
        return markup;
    }, _removeDefaultValues:function (object) {
        var prototype = fabric.util.getKlass(object.type).prototype;
        var stateProperties = prototype.stateProperties;
        stateProperties.forEach(function (prop) {
            if (object[prop] === prototype[prop]) {
                delete object[prop];
            }
        });
        return object;
    }, toString:function () {
        return "#<fabric." + capitalize(this.type) + ">";
    }, get:function (property) {
        return this[property];
    }, set:function (key, value) {
        if (typeof key === "object") {
            for (var prop in key) {
                this._set(prop, key[prop]);
            }
        } else {
            if (typeof value === "function" && key !== "clipTo") {
                this._set(key, value(this.get(key)));
            } else {
                this._set(key, value);
            }
        }
        return this;
    }, _set:function (key, value) {
        var shouldConstrainValue = (key === "scaleX" || key === "scaleY");
        if (shouldConstrainValue) {
            value = this._constrainScale(value);
        }
        if (key === "scaleX" && value < 0) {
            this.flipX = !this.flipX;
            value *= -1;
        } else {
            if (key === "scaleY" && value < 0) {
                this.flipY = !this.flipY;
                value *= -1;
            } else {
                if (key === "width" || key === "height") {
                    this.minScaleLimit = toFixed(Math.min(0.1, 1 / Math.max(this.width, this.height)), 2);
                } else {
                    if (key === "shadow" && value && !(value instanceof fabric.Shadow)) {
                        value = new fabric.Shadow(value);
                    }
                }
            }
        }
        this[key] = value;
        return this;
    }, toggle:function (property) {
        var value = this.get(property);
        if (typeof value === "boolean") {
            this.set(property, !value);
        }
        return this;
    }, setSourcePath:function (value) {
        this.sourcePath = value;
        return this;
    }, render:function (ctx, noTransform) {
        if (this.width === 0 || this.height === 0 || !this.visible) {
            return;
        }
        ctx.save();
        var m = this.transformMatrix;
        if (m && !this.group) {
            ctx.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        if (!noTransform) {
            this.transform(ctx);
        }
        if (this.stroke) {
            ctx.lineWidth = this.strokeWidth;
            ctx.lineCap = this.strokeLineCap;
            ctx.lineJoin = this.strokeLineJoin;
            ctx.miterLimit = this.strokeMiterLimit;
            ctx.strokeStyle = this.stroke.toLive ? this.stroke.toLive(ctx) : this.stroke;
        }
        if (this.fill) {
            ctx.fillStyle = this.fill.toLive ? this.fill.toLive(ctx) : this.fill;
        }
        if (m && this.group) {
            ctx.translate(-this.group.width / 2, -this.group.height / 2);
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        this._setShadow(ctx);
        this.clipTo && fabric.util.clipContext(this, ctx);
        this._render(ctx, noTransform);
        this.clipTo && ctx.restore();
        this._removeShadow(ctx);
        if (this.active && !noTransform) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
    }, _setShadow:function (ctx) {
        if (!this.shadow) {
            return;
        }
        ctx.shadowColor = this.shadow.color;
        ctx.shadowBlur = this.shadow.blur;
        ctx.shadowOffsetX = this.shadow.offsetX;
        ctx.shadowOffsetY = this.shadow.offsetY;
    }, _removeShadow:function (ctx) {
        ctx.shadowColor = "";
        ctx.shadowBlur = ctx.shadowOffsetX = ctx.shadowOffsetY = 0;
    }, _renderFill:function (ctx) {
        if (!this.fill) {
            return;
        }
        if (this.fill.toLive) {
            ctx.save();
            ctx.translate(-this.width / 2 + this.fill.offsetX || 0, -this.height / 2 + this.fill.offsetY || 0);
        }
        ctx.fill();
        if (this.fill.toLive) {
            ctx.restore();
        }
        if (this.shadow && !this.shadow.affectStroke) {
            this._removeShadow(ctx);
        }
    }, _renderStroke:function (ctx) {
        if (!this.stroke) {
            return;
        }
        ctx.save();
        if (this.strokeDashArray) {
            if (1 & this.strokeDashArray.length) {
                this.strokeDashArray.push.apply(this.strokeDashArray, this.strokeDashArray);
            }
            if (supportsLineDash) {
                ctx.setLineDash(this.strokeDashArray);
                this._stroke && this._stroke(ctx);
            } else {
                this._renderDashedStroke && this._renderDashedStroke(ctx);
            }
            ctx.stroke();
        } else {
            this._stroke ? this._stroke(ctx) : ctx.stroke();
        }
        this._removeShadow(ctx);
        ctx.restore();
    }, clone:function (callback, propertiesToInclude) {
        if (this.constructor.fromObject) {
            return this.constructor.fromObject(this.toObject(propertiesToInclude), callback);
        }
        return new fabric.Object(this.toObject(propertiesToInclude));
    }, cloneAsImage:function (callback) {
        var dataUrl = this.toDataURL();
        fabric.util.loadImage(dataUrl, function (img) {
            if (callback) {
                callback(new fabric.Image(img));
            }
        });
        return this;
    }, toDataURL:function (options) {
        options || (options = {});
        var el = fabric.util.createCanvasElement(), boundingRect = this.getBoundingRect();
        el.width = boundingRect.width;
        el.height = boundingRect.height;
        fabric.util.wrapElement(el, "div");
        var canvas = new fabric.Canvas(el);
        if (options.format === "jpg") {
            options.format = "jpeg";
        }
        if (options.format === "jpeg") {
            canvas.backgroundColor = "#fff";
        }
        var origParams = {active:this.get("active"), left:this.getLeft(), top:this.getTop()};
        this.set("active", false);
        this.setPositionByOrigin(new fabric.Point(el.width / 2, el.height / 2), "center", "center");
        canvas.add(this);
        var data = canvas.toDataURL(options);
        this.set(origParams).setCoords();
        canvas.dispose();
        canvas = null;
        return data;
    }, isType:function (type) {
        return this.type === type;
    }, complexity:function () {
        return 0;
    }, toJSON:function (propertiesToInclude) {
        return this.toObject(propertiesToInclude);
    }, setGradient:function (property, options) {
        options || (options = {});
        var gradient = {colorStops:[]};
        gradient.type = options.type || (options.r1 || options.r2 ? "radial" : "linear");
        gradient.coords = {x1:options.x1, y1:options.y1, x2:options.x2, y2:options.y2};
        if (options.r1 || options.r2) {
            gradient.coords.r1 = options.r1;
            gradient.coords.r2 = options.r2;
        }
        for (var position in options.colorStops) {
            var color = new fabric.Color(options.colorStops[position]);
            gradient.colorStops.push({offset:position, color:color.toRgb(), opacity:color.getAlpha()});
        }
        return this.set(property, fabric.Gradient.forObject(this, gradient));
    }, setPatternFill:function (options) {
        return this.set("fill", new fabric.Pattern(options));
    }, setShadow:function (options) {
        return this.set("shadow", new fabric.Shadow(options));
    }, setColor:function (color) {
        this.set("fill", color);
        return this;
    }, centerH:function () {
        this.canvas.centerObjectH(this);
        return this;
    }, centerV:function () {
        this.canvas.centerObjectV(this);
        return this;
    }, center:function () {
        return this.centerH().centerV();
    }, remove:function () {
        return this.canvas.remove(this);
    }, sendToBack:function () {
        if (this.group) {
            fabric.StaticCanvas.prototype.sendToBack.call(this.group, this);
        } else {
            this.canvas.sendToBack(this);
        }
        return this;
    }, bringToFront:function () {
        if (this.group) {
            fabric.StaticCanvas.prototype.bringToFront.call(this.group, this);
        } else {
            this.canvas.bringToFront(this);
        }
        return this;
    }, sendBackwards:function (intersecting) {
        if (this.group) {
            fabric.StaticCanvas.prototype.sendBackwards.call(this.group, this, intersecting);
        } else {
            this.canvas.sendBackwards(this, intersecting);
        }
        return this;
    }, bringForward:function (intersecting) {
        if (this.group) {
            fabric.StaticCanvas.prototype.bringForward.call(this.group, this, intersecting);
        } else {
            this.canvas.bringForward(this, intersecting);
        }
        return this;
    }, moveTo:function (index) {
        if (this.group) {
            fabric.StaticCanvas.prototype.moveTo.call(this.group, this, index);
        } else {
            this.canvas.moveTo(this, index);
        }
        return this;
    }});
    fabric.util.createAccessors(fabric.Object);
    fabric.Object.prototype.rotate = fabric.Object.prototype.setAngle;
    extend(fabric.Object.prototype, fabric.Observable);
    fabric.Object.NUM_FRACTION_DIGITS = 2;
    fabric.Object.__uid = 0;
})(typeof exports !== "undefined" ? exports : this);
(function () {
    var degreesToRadians = fabric.util.degreesToRadians;
    fabric.util.object.extend(fabric.Object.prototype, {translateToCenterPoint:function (point, originX, originY) {
        var cx = point.x, cy = point.y;
        if (originX === "left") {
            cx = point.x + (this.getWidth() + (this.strokeWidth * this.scaleX)) / 2;
        } else {
            if (originX === "right") {
                cx = point.x - (this.getWidth() + (this.strokeWidth * this.scaleX)) / 2;
            }
        }
        if (originY === "top") {
            cy = point.y + (this.getHeight() + (this.strokeWidth * this.scaleY)) / 2;
        } else {
            if (originY === "bottom") {
                cy = point.y - (this.getHeight() + (this.strokeWidth * this.scaleY)) / 2;
            }
        }
        return fabric.util.rotatePoint(new fabric.Point(cx, cy), point, degreesToRadians(this.angle));
    }, translateToOriginPoint:function (center, originX, originY) {
        var x = center.x, y = center.y;
        if (originX === "left") {
            x = center.x - (this.getWidth() + (this.strokeWidth * this.scaleX)) / 2;
        } else {
            if (originX === "right") {
                x = center.x + (this.getWidth() + (this.strokeWidth * this.scaleX)) / 2;
            }
        }
        if (originY === "top") {
            y = center.y - (this.getHeight() + (this.strokeWidth * this.scaleY)) / 2;
        } else {
            if (originY === "bottom") {
                y = center.y + (this.getHeight() + (this.strokeWidth * this.scaleY)) / 2;
            }
        }
        return fabric.util.rotatePoint(new fabric.Point(x, y), center, degreesToRadians(this.angle));
    }, getCenterPoint:function () {
        var leftTop = new fabric.Point(this.left, this.top);
        return this.translateToCenterPoint(leftTop, this.originX, this.originY);
    }, getPointByOrigin:function (originX, originY) {
        var center = this.getCenterPoint();
        return this.translateToOriginPoint(center, originX, originY);
    }, toLocalPoint:function (point, originX, originY) {
        var center = this.getCenterPoint();
        var x, y;
        if (originX !== undefined && originY !== undefined) {
            if (originX === "left") {
                x = center.x - (this.getWidth() + this.strokeWidth * this.scaleX) / 2;
            } else {
                if (originX === "right") {
                    x = center.x + (this.getWidth() + this.strokeWidth * this.scaleX) / 2;
                } else {
                    x = center.x;
                }
            }
            if (originY === "top") {
                y = center.y - (this.getHeight() + this.strokeWidth * this.scaleY) / 2;
            } else {
                if (originY === "bottom") {
                    y = center.y + (this.getHeight() + this.strokeWidth * this.scaleY) / 2;
                } else {
                    y = center.y;
                }
            }
        } else {
            x = this.left;
            y = this.top;
        }
        return fabric.util.rotatePoint(new fabric.Point(point.x, point.y), center, -degreesToRadians(this.angle)).subtractEquals(new fabric.Point(x, y));
    }, setPositionByOrigin:function (pos, originX, originY) {
        var center = this.translateToCenterPoint(pos, originX, originY);
        var position = this.translateToOriginPoint(center, this.originX, this.originY);
        this.set("left", position.x);
        this.set("top", position.y);
    }, adjustPosition:function (to) {
        var angle = degreesToRadians(this.angle);
        var hypotHalf = this.getWidth() / 2;
        var xHalf = Math.cos(angle) * hypotHalf;
        var yHalf = Math.sin(angle) * hypotHalf;
        var hypotFull = this.getWidth();
        var xFull = Math.cos(angle) * hypotFull;
        var yFull = Math.sin(angle) * hypotFull;
        if (this.originX === "center" && to === "left" || this.originX === "right" && to === "center") {
            this.left -= xHalf;
            this.top -= yHalf;
        } else {
            if (this.originX === "left" && to === "center" || this.originX === "center" && to === "right") {
                this.left += xHalf;
                this.top += yHalf;
            } else {
                if (this.originX === "left" && to === "right") {
                    this.left += xFull;
                    this.top += yFull;
                } else {
                    if (this.originX === "right" && to === "left") {
                        this.left -= xFull;
                        this.top -= yFull;
                    }
                }
            }
        }
        this.setCoords();
        this.originX = to;
    }, _getLeftTopCoords:function () {
        return this.translateToOriginPoint(this.getCenterPoint(), "left", "center");
    }});
})();
(function () {
    var degreesToRadians = fabric.util.degreesToRadians;
    fabric.util.object.extend(fabric.Object.prototype, {oCoords:null, intersectsWithRect:function (pointTL, pointBR) {
        var oCoords = this.oCoords, tl = new fabric.Point(oCoords.tl.x, oCoords.tl.y), tr = new fabric.Point(oCoords.tr.x, oCoords.tr.y), bl = new fabric.Point(oCoords.bl.x, oCoords.bl.y), br = new fabric.Point(oCoords.br.x, oCoords.br.y);
        var intersection = fabric.Intersection.intersectPolygonRectangle([tl, tr, br, bl], pointTL, pointBR);
        return intersection.status === "Intersection";
    }, intersectsWithObject:function (other) {
        function getCoords(oCoords) {
            return {tl:new fabric.Point(oCoords.tl.x, oCoords.tl.y), tr:new fabric.Point(oCoords.tr.x, oCoords.tr.y), bl:new fabric.Point(oCoords.bl.x, oCoords.bl.y), br:new fabric.Point(oCoords.br.x, oCoords.br.y)};
        }
        var thisCoords = getCoords(this.oCoords), otherCoords = getCoords(other.oCoords);
        var intersection = fabric.Intersection.intersectPolygonPolygon([thisCoords.tl, thisCoords.tr, thisCoords.br, thisCoords.bl], [otherCoords.tl, otherCoords.tr, otherCoords.br, otherCoords.bl]);
        return intersection.status === "Intersection";
    }, isContainedWithinObject:function (other) {
        var boundingRect = other.getBoundingRect(), point1 = new fabric.Point(boundingRect.left, boundingRect.top), point2 = new fabric.Point(boundingRect.left + boundingRect.width, boundingRect.top + boundingRect.height);
        return this.isContainedWithinRect(point1, point2);
    }, isContainedWithinRect:function (pointTL, pointBR) {
        var boundingRect = this.getBoundingRect();
        return (boundingRect.left > pointTL.x && boundingRect.left + boundingRect.width < pointBR.x && boundingRect.top > pointTL.y && boundingRect.top + boundingRect.height < pointBR.y);
    }, containsPoint:function (point) {
        var lines = this._getImageLines(this.oCoords), xPoints = this._findCrossPoints(point, lines);
        return (xPoints !== 0 && xPoints % 2 === 1);
    }, _getImageLines:function (oCoords) {
        return {topline:{o:oCoords.tl, d:oCoords.tr}, rightline:{o:oCoords.tr, d:oCoords.br}, bottomline:{o:oCoords.br, d:oCoords.bl}, leftline:{o:oCoords.bl, d:oCoords.tl}};
    }, _findCrossPoints:function (point, oCoords) {
        var b1, b2, a1, a2, xi, yi, xcount = 0, iLine;
        for (var lineKey in oCoords) {
            iLine = oCoords[lineKey];
            if ((iLine.o.y < point.y) && (iLine.d.y < point.y)) {
                continue;
            }
            if ((iLine.o.y >= point.y) && (iLine.d.y >= point.y)) {
                continue;
            }
            if ((iLine.o.x === iLine.d.x) && (iLine.o.x >= point.x)) {
                xi = iLine.o.x;
                yi = point.y;
            } else {
                b1 = 0;
                b2 = (iLine.d.y - iLine.o.y) / (iLine.d.x - iLine.o.x);
                a1 = point.y - b1 * point.x;
                a2 = iLine.o.y - b2 * iLine.o.x;
                xi = -(a1 - a2) / (b1 - b2);
                yi = a1 + b1 * xi;
            }
            if (xi >= point.x) {
                xcount += 1;
            }
            if (xcount === 2) {
                break;
            }
        }
        return xcount;
    }, getBoundingRectWidth:function () {
        return this.getBoundingRect().width;
    }, getBoundingRectHeight:function () {
        return this.getBoundingRect().height;
    }, getBoundingRect:function () {
        this.oCoords || this.setCoords();
        var xCoords = [this.oCoords.tl.x, this.oCoords.tr.x, this.oCoords.br.x, this.oCoords.bl.x];
        var minX = fabric.util.array.min(xCoords);
        var maxX = fabric.util.array.max(xCoords);
        var width = Math.abs(minX - maxX);
        var yCoords = [this.oCoords.tl.y, this.oCoords.tr.y, this.oCoords.br.y, this.oCoords.bl.y];
        var minY = fabric.util.array.min(yCoords);
        var maxY = fabric.util.array.max(yCoords);
        var height = Math.abs(minY - maxY);
        return {left:minX, top:minY, width:width, height:height};
    }, getWidth:function () {
        return this.width * this.scaleX;
    }, getHeight:function () {
        return this.height * this.scaleY;
    }, _constrainScale:function (value) {
        if (Math.abs(value) < this.minScaleLimit) {
            if (value < 0) {
                return -this.minScaleLimit;
            } else {
                return this.minScaleLimit;
            }
        }
        return value;
    }, scale:function (value) {
        value = this._constrainScale(value);
        if (value < 0) {
            this.flipX = !this.flipX;
            this.flipY = !this.flipY;
            value *= -1;
        }
        this.scaleX = value;
        this.scaleY = value;
        this.setCoords();
        return this;
    }, scaleToWidth:function (value) {
        var boundingRectFactor = this.getBoundingRectWidth() / this.getWidth();
        return this.scale(value / this.width / boundingRectFactor);
    }, scaleToHeight:function (value) {
        var boundingRectFactor = this.getBoundingRectHeight() / this.getHeight();
        return this.scale(value / this.height / boundingRectFactor);
    }, setCoords:function () {
        var strokeWidth = this.strokeWidth > 1 ? this.strokeWidth : 0, padding = this.padding, theta = degreesToRadians(this.angle);
        this.currentWidth = (this.width + strokeWidth) * this.scaleX + padding * 2;
        this.currentHeight = (this.height + strokeWidth) * this.scaleY + padding * 2;
        if (this.currentWidth < 0) {
            this.currentWidth = Math.abs(this.currentWidth);
        }
        var _hypotenuse = Math.sqrt(Math.pow(this.currentWidth / 2, 2) + Math.pow(this.currentHeight / 2, 2));
        var _angle = Math.atan(isFinite(this.currentHeight / this.currentWidth) ? this.currentHeight / this.currentWidth : 0);
        var offsetX = Math.cos(_angle + theta) * _hypotenuse, offsetY = Math.sin(_angle + theta) * _hypotenuse, sinTh = Math.sin(theta), cosTh = Math.cos(theta);
        var coords = this.getCenterPoint();
        var tl = {x:coords.x - offsetX, y:coords.y - offsetY};
        var tr = {x:tl.x + (this.currentWidth * cosTh), y:tl.y + (this.currentWidth * sinTh)};
        var br = {x:tr.x - (this.currentHeight * sinTh), y:tr.y + (this.currentHeight * cosTh)};
        var bl = {x:tl.x - (this.currentHeight * sinTh), y:tl.y + (this.currentHeight * cosTh)};
        var ml = {x:tl.x - (this.currentHeight / 2 * sinTh), y:tl.y + (this.currentHeight / 2 * cosTh)};
        var mt = {x:tl.x + (this.currentWidth / 2 * cosTh), y:tl.y + (this.currentWidth / 2 * sinTh)};
        var mr = {x:tr.x - (this.currentHeight / 2 * sinTh), y:tr.y + (this.currentHeight / 2 * cosTh)};
        var mb = {x:bl.x + (this.currentWidth / 2 * cosTh), y:bl.y + (this.currentWidth / 2 * sinTh)};
        var mtr = {x:mt.x, y:mt.y};
        this.oCoords = {tl:tl, tr:tr, br:br, bl:bl, ml:ml, mt:mt, mr:mr, mb:mb, mtr:mtr};
        this._setCornerCoords && this._setCornerCoords();
        return this;
    }});
})();
fabric.util.object.extend(fabric.Object.prototype, {hasStateChanged:function () {
    return this.stateProperties.some(function (prop) {
        return this.get(prop) !== this.originalState[prop];
    }, this);
}, saveState:function (options) {
    this.stateProperties.forEach(function (prop) {
        this.originalState[prop] = this.get(prop);
    }, this);
    if (options && options.stateProperties) {
        options.stateProperties.forEach(function (prop) {
            this.originalState[prop] = this.get(prop);
        }, this);
    }
    return this;
}, setupState:function () {
    this.originalState = {};
    this.saveState();
    return this;
}});
(function () {
    var getPointer = fabric.util.getPointer, degreesToRadians = fabric.util.degreesToRadians;
    fabric.util.object.extend(fabric.Object.prototype, {_findTargetCorner:function (e, offset) {
        if (!this.hasControls || !this.active) {
            return false;
        }
        var pointer = getPointer(e, this.canvas.upperCanvasEl), ex = pointer.x - offset.left, ey = pointer.y - offset.top, xPoints, lines;
        for (var i in this.oCoords) {
            if (i === "mtr" && !this.hasRotatingPoint) {
                continue;
            }
            if (this.get("lockUniScaling") && (i === "mt" || i === "mr" || i === "mb" || i === "ml")) {
                continue;
            }
            lines = this._getImageLines(this.oCoords[i].corner);
            xPoints = this._findCrossPoints({x:ex, y:ey}, lines);
            if (xPoints !== 0 && xPoints % 2 === 1) {
                this.__corner = i;
                return i;
            }
        }
        return false;
    }, _setCornerCoords:function () {
        var coords = this.oCoords, theta = degreesToRadians(this.angle), newTheta = degreesToRadians(45 - this.angle), cornerHypotenuse = Math.sqrt(2 * Math.pow(this.cornerSize, 2)) / 2, cosHalfOffset = cornerHypotenuse * Math.cos(newTheta), sinHalfOffset = cornerHypotenuse * Math.sin(newTheta), sinTh = Math.sin(theta), cosTh = Math.cos(theta);
        coords.tl.corner = {tl:{x:coords.tl.x - sinHalfOffset, y:coords.tl.y - cosHalfOffset}, tr:{x:coords.tl.x + cosHalfOffset, y:coords.tl.y - sinHalfOffset}, bl:{x:coords.tl.x - cosHalfOffset, y:coords.tl.y + sinHalfOffset}, br:{x:coords.tl.x + sinHalfOffset, y:coords.tl.y + cosHalfOffset}};
        coords.tr.corner = {tl:{x:coords.tr.x - sinHalfOffset, y:coords.tr.y - cosHalfOffset}, tr:{x:coords.tr.x + cosHalfOffset, y:coords.tr.y - sinHalfOffset}, br:{x:coords.tr.x + sinHalfOffset, y:coords.tr.y + cosHalfOffset}, bl:{x:coords.tr.x - cosHalfOffset, y:coords.tr.y + sinHalfOffset}};
        coords.bl.corner = {tl:{x:coords.bl.x - sinHalfOffset, y:coords.bl.y - cosHalfOffset}, bl:{x:coords.bl.x - cosHalfOffset, y:coords.bl.y + sinHalfOffset}, br:{x:coords.bl.x + sinHalfOffset, y:coords.bl.y + cosHalfOffset}, tr:{x:coords.bl.x + cosHalfOffset, y:coords.bl.y - sinHalfOffset}};
        coords.br.corner = {tr:{x:coords.br.x + cosHalfOffset, y:coords.br.y - sinHalfOffset}, bl:{x:coords.br.x - cosHalfOffset, y:coords.br.y + sinHalfOffset}, br:{x:coords.br.x + sinHalfOffset, y:coords.br.y + cosHalfOffset}, tl:{x:coords.br.x - sinHalfOffset, y:coords.br.y - cosHalfOffset}};
        coords.ml.corner = {tl:{x:coords.ml.x - sinHalfOffset, y:coords.ml.y - cosHalfOffset}, tr:{x:coords.ml.x + cosHalfOffset, y:coords.ml.y - sinHalfOffset}, bl:{x:coords.ml.x - cosHalfOffset, y:coords.ml.y + sinHalfOffset}, br:{x:coords.ml.x + sinHalfOffset, y:coords.ml.y + cosHalfOffset}};
        coords.mt.corner = {tl:{x:coords.mt.x - sinHalfOffset, y:coords.mt.y - cosHalfOffset}, tr:{x:coords.mt.x + cosHalfOffset, y:coords.mt.y - sinHalfOffset}, bl:{x:coords.mt.x - cosHalfOffset, y:coords.mt.y + sinHalfOffset}, br:{x:coords.mt.x + sinHalfOffset, y:coords.mt.y + cosHalfOffset}};
        coords.mr.corner = {tl:{x:coords.mr.x - sinHalfOffset, y:coords.mr.y - cosHalfOffset}, tr:{x:coords.mr.x + cosHalfOffset, y:coords.mr.y - sinHalfOffset}, bl:{x:coords.mr.x - cosHalfOffset, y:coords.mr.y + sinHalfOffset}, br:{x:coords.mr.x + sinHalfOffset, y:coords.mr.y + cosHalfOffset}};
        coords.mb.corner = {tl:{x:coords.mb.x - sinHalfOffset, y:coords.mb.y - cosHalfOffset}, tr:{x:coords.mb.x + cosHalfOffset, y:coords.mb.y - sinHalfOffset}, bl:{x:coords.mb.x - cosHalfOffset, y:coords.mb.y + sinHalfOffset}, br:{x:coords.mb.x + sinHalfOffset, y:coords.mb.y + cosHalfOffset}};
        coords.mtr.corner = {tl:{x:coords.mtr.x - sinHalfOffset + (sinTh * this.rotatingPointOffset), y:coords.mtr.y - cosHalfOffset - (cosTh * this.rotatingPointOffset)}, tr:{x:coords.mtr.x + cosHalfOffset + (sinTh * this.rotatingPointOffset), y:coords.mtr.y - sinHalfOffset - (cosTh * this.rotatingPointOffset)}, bl:{x:coords.mtr.x - cosHalfOffset + (sinTh * this.rotatingPointOffset), y:coords.mtr.y + sinHalfOffset - (cosTh * this.rotatingPointOffset)}, br:{x:coords.mtr.x + sinHalfOffset + (sinTh * this.rotatingPointOffset), y:coords.mtr.y + cosHalfOffset - (cosTh * this.rotatingPointOffset)}};
    }, drawBorders:function (ctx) {
        if (!this.hasBorders) {
            return this;
        }
        var padding = this.padding, padding2 = padding * 2, strokeWidth = ~~(this.strokeWidth / 2) * 2;
        ctx.save();
        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = this.borderColor;
        var scaleX = 1 / this._constrainScale(this.scaleX), scaleY = 1 / this._constrainScale(this.scaleY);
        ctx.lineWidth = 1 / this.borderScaleFactor;
        ctx.scale(scaleX, scaleY);
        var w = this.getWidth(), h = this.getHeight();
        ctx.strokeRect(~~(-(w / 2) - padding - strokeWidth / 2 * this.scaleX) - 0.5, ~~(-(h / 2) - padding - strokeWidth / 2 * this.scaleY) - 0.5, ~~(w + padding2 + strokeWidth * this.scaleX) + 1, ~~(h + padding2 + strokeWidth * this.scaleY) + 1);
        if (this.hasRotatingPoint && !this.get("lockRotation") && this.hasControls) {
            var rotateHeight = (this.flipY ? h + (strokeWidth * this.scaleY) + (padding * 2) : -h - (strokeWidth * this.scaleY) - (padding * 2)) / 2;
            ctx.beginPath();
            ctx.moveTo(0, rotateHeight);
            ctx.lineTo(0, rotateHeight + (this.flipY ? this.rotatingPointOffset : -this.rotatingPointOffset));
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
        return this;
    }, drawControls:function (ctx) {
        if (!this.hasControls) {
            return this;
        }
        var size = this.cornerSize, size2 = size / 2, strokeWidth2 = ~~(this.strokeWidth / 2), left = -(this.width / 2), top = -(this.height / 2), _left, _top, sizeX = size / this.scaleX, sizeY = size / this.scaleY, paddingX = this.padding / this.scaleX, paddingY = this.padding / this.scaleY, scaleOffsetY = size2 / this.scaleY, scaleOffsetX = size2 / this.scaleX, scaleOffsetSizeX = (size2 - size) / this.scaleX, scaleOffsetSizeY = (size2 - size) / this.scaleY, height = this.height, width = this.width, methodName = this.transparentCorners ? "strokeRect" : "fillRect", transparent = this.transparentCorners, isVML = typeof G_vmlCanvasManager !== "undefined";
        ctx.save();
        ctx.lineWidth = 1 / Math.max(this.scaleX, this.scaleY);
        ctx.globalAlpha = this.isMoving ? this.borderOpacityWhenMoving : 1;
        ctx.strokeStyle = ctx.fillStyle = this.cornerColor;
        _left = left - scaleOffsetX - strokeWidth2 - paddingX;
        _top = top - scaleOffsetY - strokeWidth2 - paddingY;
        isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);
        _left = left + width - scaleOffsetX + strokeWidth2 + paddingX;
        _top = top - scaleOffsetY - strokeWidth2 - paddingY;
        isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);
        _left = left - scaleOffsetX - strokeWidth2 - paddingX;
        _top = top + height + scaleOffsetSizeY + strokeWidth2 + paddingY;
        isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);
        _left = left + width + scaleOffsetSizeX + strokeWidth2 + paddingX;
        _top = top + height + scaleOffsetSizeY + strokeWidth2 + paddingY;
        isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
        ctx[methodName](_left, _top, sizeX, sizeY);
        if (!this.get("lockUniScaling")) {
            _left = left + width / 2 - scaleOffsetX;
            _top = top - scaleOffsetY - strokeWidth2 - paddingY;
            isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
            ctx[methodName](_left, _top, sizeX, sizeY);
            _left = left + width / 2 - scaleOffsetX;
            _top = top + height + scaleOffsetSizeY + strokeWidth2 + paddingY;
            isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
            ctx[methodName](_left, _top, sizeX, sizeY);
            _left = left + width + scaleOffsetSizeX + strokeWidth2 + paddingX;
            _top = top + height / 2 - scaleOffsetY;
            isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
            ctx[methodName](_left, _top, sizeX, sizeY);
            _left = left - scaleOffsetX - strokeWidth2 - paddingX;
            _top = top + height / 2 - scaleOffsetY;
            isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
            ctx[methodName](_left, _top, sizeX, sizeY);
        }
        if (this.hasRotatingPoint) {
            _left = left + width / 2 - scaleOffsetX;
            _top = this.flipY ? (top + height + (this.rotatingPointOffset / this.scaleY) - sizeY / 2 + strokeWidth2 + paddingY) : (top - (this.rotatingPointOffset / this.scaleY) - sizeY / 2 - strokeWidth2 - paddingY);
            isVML || transparent || ctx.clearRect(_left, _top, sizeX, sizeY);
            ctx[methodName](_left, _top, sizeX, sizeY);
        }
        ctx.restore();
        return this;
    }});
})();
fabric.util.object.extend(fabric.StaticCanvas.prototype, {FX_DURATION:500, fxCenterObjectH:function (object, callbacks) {
    callbacks = callbacks || {};
    var empty = function () {
    }, onComplete = callbacks.onComplete || empty, onChange = callbacks.onChange || empty, _this = this;
    fabric.util.animate({startValue:object.get("left"), endValue:this.getCenter().left, duration:this.FX_DURATION, onChange:function (value) {
        object.set("left", value);
        _this.renderAll();
        onChange();
    }, onComplete:function () {
        object.setCoords();
        onComplete();
    }});
    return this;
}, fxCenterObjectV:function (object, callbacks) {
    callbacks = callbacks || {};
    var empty = function () {
    }, onComplete = callbacks.onComplete || empty, onChange = callbacks.onChange || empty, _this = this;
    fabric.util.animate({startValue:object.get("top"), endValue:this.getCenter().top, duration:this.FX_DURATION, onChange:function (value) {
        object.set("top", value);
        _this.renderAll();
        onChange();
    }, onComplete:function () {
        object.setCoords();
        onComplete();
    }});
    return this;
}, fxRemove:function (object, callbacks) {
    callbacks = callbacks || {};
    var empty = function () {
    }, onComplete = callbacks.onComplete || empty, onChange = callbacks.onChange || empty, _this = this;
    fabric.util.animate({startValue:object.get("opacity"), endValue:0, duration:this.FX_DURATION, onStart:function () {
        object.set("active", false);
    }, onChange:function (value) {
        object.set("opacity", value);
        _this.renderAll();
        onChange();
    }, onComplete:function () {
        _this.remove(object);
        onComplete();
    }});
    return this;
}});
fabric.util.object.extend(fabric.Object.prototype, {animate:function () {
    if (arguments[0] && typeof arguments[0] === "object") {
        var propsToAnimate = [], prop, skipCallbacks;
        for (prop in arguments[0]) {
            propsToAnimate.push(prop);
        }
        for (var i = 0, len = propsToAnimate.length; i < len; i++) {
            prop = propsToAnimate[i];
            skipCallbacks = i !== len - 1;
            this._animate(prop, arguments[0][prop], arguments[1], skipCallbacks);
        }
    } else {
        this._animate.apply(this, arguments);
    }
    return this;
}, _animate:function (property, to, options, skipCallbacks) {
    var obj = this, propPair;
    to = to.toString();
    if (!options) {
        options = {};
    } else {
        options = fabric.util.object.clone(options);
    }
    if (~property.indexOf(".")) {
        propPair = property.split(".");
    }
    var currentValue = propPair ? this.get(propPair[0])[propPair[1]] : this.get(property);
    if (!("from" in options)) {
        options.from = currentValue;
    }
    if (~to.indexOf("=")) {
        to = currentValue + parseFloat(to.replace("=", ""));
    } else {
        to = parseFloat(to);
    }
    fabric.util.animate({startValue:options.from, endValue:to, byValue:options.by, easing:options.easing, duration:options.duration, abort:options.abort && function () {
        return options.abort.call(obj);
    }, onChange:function (value) {
        if (propPair) {
            obj[propPair[0]][propPair[1]] = value;
        } else {
            obj.set(property, value);
        }
        if (skipCallbacks) {
            return;
        }
        options.onChange && options.onChange();
    }, onComplete:function () {
        if (skipCallbacks) {
            return;
        }
        obj.setCoords();
        options.onComplete && options.onComplete();
    }});
}});
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, coordProps = {"x1":1, "x2":1, "y1":1, "y2":1}, supportsLineDash = fabric.StaticCanvas.supports("setLineDash");
    if (fabric.Line) {
        fabric.warn("fabric.Line is already defined");
        return;
    }
    fabric.Line = fabric.util.createClass(fabric.Object, {type:"line", initialize:function (points, options) {
        options = options || {};
        if (!points) {
            points = [0, 0, 0, 0];
        }
        this.callSuper("initialize", options);
        this.set("x1", points[0]);
        this.set("y1", points[1]);
        this.set("x2", points[2]);
        this.set("y2", points[3]);
        this._setWidthHeight(options);
    }, _setWidthHeight:function (options) {
        options || (options = {});
        this.set("width", Math.abs(this.x2 - this.x1) || 1);
        this.set("height", Math.abs(this.y2 - this.y1) || 1);
        this.set("left", "left" in options ? options.left : (Math.min(this.x1, this.x2) + this.width / 2));
        this.set("top", "top" in options ? options.top : (Math.min(this.y1, this.y2) + this.height / 2));
    }, _set:function (key, value) {
        this[key] = value;
        if (key in coordProps) {
            this._setWidthHeight();
        }
        return this;
    }, _render:function (ctx) {
        ctx.beginPath();
        var isInPathGroup = this.group && this.group.type !== "group";
        if (isInPathGroup && !this.transformMatrix) {
            ctx.translate(-this.group.width / 2 + this.left, -this.group.height / 2 + this.top);
        }
        if (!this.strokeDashArray || this.strokeDashArray && supportsLineDash) {
            var xMult = this.x1 <= this.x2 ? -1 : 1;
            var yMult = this.y1 <= this.y2 ? -1 : 1;
            ctx.moveTo(this.width === 1 ? 0 : (xMult * this.width / 2), this.height === 1 ? 0 : (yMult * this.height / 2));
            ctx.lineTo(this.width === 1 ? 0 : (xMult * -1 * this.width / 2), this.height === 1 ? 0 : (yMult * -1 * this.height / 2));
        }
        ctx.lineWidth = this.strokeWidth;
        var origStrokeStyle = ctx.strokeStyle;
        ctx.strokeStyle = this.stroke || ctx.fillStyle;
        this._renderStroke(ctx);
        ctx.strokeStyle = origStrokeStyle;
    }, _renderDashedStroke:function (ctx) {
        var xMult = this.x1 <= this.x2 ? -1 : 1, yMult = this.y1 <= this.y2 ? -1 : 1, x = this.width === 1 ? 0 : xMult * this.width / 2, y = this.height === 1 ? 0 : yMult * this.height / 2;
        ctx.beginPath();
        fabric.util.drawDashedLine(ctx, x, y, -x, -y, this.strokeDashArray);
        ctx.closePath();
    }, toObject:function (propertiesToInclude) {
        return extend(this.callSuper("toObject", propertiesToInclude), {x1:this.get("x1"), y1:this.get("y1"), x2:this.get("x2"), y2:this.get("y2")});
    }, toSVG:function (reviver) {
        var markup = this._createBaseSVGMarkup();
        markup.push("<line ", "x1=\"", this.get("x1"), "\" y1=\"", this.get("y1"), "\" x2=\"", this.get("x2"), "\" y2=\"", this.get("y2"), "\" style=\"", this.getSvgStyles(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, complexity:function () {
        return 1;
    }});
    fabric.Line.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat("x1 y1 x2 y2".split(" "));
    fabric.Line.fromElement = function (element, options) {
        var parsedAttributes = fabric.parseAttributes(element, fabric.Line.ATTRIBUTE_NAMES);
        var points = [parsedAttributes.x1 || 0, parsedAttributes.y1 || 0, parsedAttributes.x2 || 0, parsedAttributes.y2 || 0];
        return new fabric.Line(points, extend(parsedAttributes, options));
    };
    fabric.Line.fromObject = function (object) {
        var points = [object.x1, object.y1, object.x2, object.y2];
        return new fabric.Line(points, object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), piBy2 = Math.PI * 2, extend = fabric.util.object.extend;
    if (fabric.Circle) {
        fabric.warn("fabric.Circle is already defined.");
        return;
    }
    fabric.Circle = fabric.util.createClass(fabric.Object, {type:"circle", initialize:function (options) {
        options = options || {};
        this.set("radius", options.radius || 0);
        this.callSuper("initialize", options);
    }, _set:function (key, value) {
        this.callSuper("_set", key, value);
        if (key === "radius") {
            this.setRadius(value);
        }
        return this;
    }, toObject:function (propertiesToInclude) {
        return extend(this.callSuper("toObject", propertiesToInclude), {radius:this.get("radius")});
    }, toSVG:function (reviver) {
        var markup = this._createBaseSVGMarkup();
        markup.push("<circle ", "cx=\"0\" cy=\"0\" ", "r=\"", this.radius, "\" style=\"", this.getSvgStyles(), "\" transform=\"", this.getSvgTransform(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, _render:function (ctx, noTransform) {
        ctx.beginPath();
        ctx.globalAlpha = this.group ? (ctx.globalAlpha * this.opacity) : this.opacity;
        ctx.arc(noTransform ? this.left : 0, noTransform ? this.top : 0, this.radius, 0, piBy2, false);
        ctx.closePath();
        this._renderFill(ctx);
        this._renderStroke(ctx);
    }, getRadiusX:function () {
        return this.get("radius") * this.get("scaleX");
    }, getRadiusY:function () {
        return this.get("radius") * this.get("scaleY");
    }, setRadius:function (value) {
        this.radius = value;
        this.set("width", value * 2).set("height", value * 2);
    }, complexity:function () {
        return 1;
    }});
    fabric.Circle.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat("cx cy r".split(" "));
    fabric.Circle.fromElement = function (element, options) {
        options || (options = {});
        var parsedAttributes = fabric.parseAttributes(element, fabric.Circle.ATTRIBUTE_NAMES);
        if (!isValidRadius(parsedAttributes)) {
            throw new Error("value of `r` attribute is required and can not be negative");
        }
        if ("left" in parsedAttributes) {
            parsedAttributes.left -= (options.width / 2) || 0;
        }
        if ("top" in parsedAttributes) {
            parsedAttributes.top -= (options.height / 2) || 0;
        }
        var obj = new fabric.Circle(extend(parsedAttributes, options));
        obj.cx = parseFloat(element.getAttribute("cx")) || 0;
        obj.cy = parseFloat(element.getAttribute("cy")) || 0;
        return obj;
    };
    function isValidRadius(attributes) {
        return (("radius" in attributes) && (attributes.radius > 0));
    }
    fabric.Circle.fromObject = function (object) {
        return new fabric.Circle(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    if (fabric.Triangle) {
        fabric.warn("fabric.Triangle is already defined");
        return;
    }
    fabric.Triangle = fabric.util.createClass(fabric.Object, {type:"triangle", initialize:function (options) {
        options = options || {};
        this.callSuper("initialize", options);
        this.set("width", options.width || 100).set("height", options.height || 100);
    }, _render:function (ctx) {
        var widthBy2 = this.width / 2, heightBy2 = this.height / 2;
        ctx.beginPath();
        ctx.moveTo(-widthBy2, heightBy2);
        ctx.lineTo(0, -heightBy2);
        ctx.lineTo(widthBy2, heightBy2);
        ctx.closePath();
        this._renderFill(ctx);
        this._renderStroke(ctx);
    }, _renderDashedStroke:function (ctx) {
        var widthBy2 = this.width / 2, heightBy2 = this.height / 2;
        ctx.beginPath();
        fabric.util.drawDashedLine(ctx, -widthBy2, heightBy2, 0, -heightBy2, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, 0, -heightBy2, widthBy2, heightBy2, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, widthBy2, heightBy2, -widthBy2, heightBy2, this.strokeDashArray);
        ctx.closePath();
    }, toSVG:function (reviver) {
        var markup = this._createBaseSVGMarkup(), widthBy2 = this.width / 2, heightBy2 = this.height / 2;
        var points = [-widthBy2 + " " + heightBy2, "0 " + -heightBy2, widthBy2 + " " + heightBy2].join(",");
        markup.push("<polygon ", "points=\"", points, "\" style=\"", this.getSvgStyles(), "\" transform=\"", this.getSvgTransform(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, complexity:function () {
        return 1;
    }});
    fabric.Triangle.fromObject = function (object) {
        return new fabric.Triangle(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), piBy2 = Math.PI * 2, extend = fabric.util.object.extend;
    if (fabric.Ellipse) {
        fabric.warn("fabric.Ellipse is already defined.");
        return;
    }
    fabric.Ellipse = fabric.util.createClass(fabric.Object, {type:"ellipse", rx:0, ry:0, initialize:function (options) {
        options = options || {};
        this.callSuper("initialize", options);
        this.set("rx", options.rx || 0);
        this.set("ry", options.ry || 0);
        this.set("width", this.get("rx") * 2);
        this.set("height", this.get("ry") * 2);
    }, toObject:function (propertiesToInclude) {
        return extend(this.callSuper("toObject", propertiesToInclude), {rx:this.get("rx"), ry:this.get("ry")});
    }, toSVG:function (reviver) {
        var markup = this._createBaseSVGMarkup();
        markup.push("<ellipse ", "rx=\"", this.get("rx"), "\" ry=\"", this.get("ry"), "\" style=\"", this.getSvgStyles(), "\" transform=\"", this.getSvgTransform(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, render:function (ctx, noTransform) {
        if (this.rx === 0 || this.ry === 0) {
            return;
        }
        return this.callSuper("render", ctx, noTransform);
    }, _render:function (ctx, noTransform) {
        ctx.beginPath();
        ctx.save();
        ctx.globalAlpha = this.group ? (ctx.globalAlpha * this.opacity) : this.opacity;
        if (this.transformMatrix && this.group) {
            ctx.translate(this.cx, this.cy);
        }
        ctx.transform(1, 0, 0, this.ry / this.rx, 0, 0);
        ctx.arc(noTransform ? this.left : 0, noTransform ? this.top : 0, this.rx, 0, piBy2, false);
        this._renderFill(ctx);
        this._renderStroke(ctx);
        ctx.restore();
    }, complexity:function () {
        return 1;
    }});
    fabric.Ellipse.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat("cx cy rx ry".split(" "));
    fabric.Ellipse.fromElement = function (element, options) {
        options || (options = {});
        var parsedAttributes = fabric.parseAttributes(element, fabric.Ellipse.ATTRIBUTE_NAMES);
        var cx = parsedAttributes.left;
        var cy = parsedAttributes.top;
        if ("left" in parsedAttributes) {
            parsedAttributes.left -= (options.width / 2) || 0;
        }
        if ("top" in parsedAttributes) {
            parsedAttributes.top -= (options.height / 2) || 0;
        }
        var ellipse = new fabric.Ellipse(extend(parsedAttributes, options));
        ellipse.cx = cx || 0;
        ellipse.cy = cy || 0;
        return ellipse;
    };
    fabric.Ellipse.fromObject = function (object) {
        return new fabric.Ellipse(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    if (fabric.Rect) {
        console.warn("fabric.Rect is already defined");
        return;
    }
    var stateProperties = fabric.Object.prototype.stateProperties.concat();
    stateProperties.push("rx", "ry", "x", "y");
    fabric.Rect = fabric.util.createClass(fabric.Object, {stateProperties:stateProperties, type:"rect", rx:0, ry:0, x:0, y:0, strokeDashArray:null, initialize:function (options) {
        options = options || {};
        this.callSuper("initialize", options);
        this._initRxRy();
        this.x = options.x || 0;
        this.y = options.y || 0;
    }, _initRxRy:function () {
        if (this.rx && !this.ry) {
            this.ry = this.rx;
        } else {
            if (this.ry && !this.rx) {
                this.rx = this.ry;
            }
        }
    }, _render:function (ctx) {
        var rx = this.rx || 0, ry = this.ry || 0, x = -this.width / 2, y = -this.height / 2, w = this.width, h = this.height, isInPathGroup = this.group && this.group.type !== "group";
        ctx.beginPath();
        ctx.globalAlpha = isInPathGroup ? (ctx.globalAlpha * this.opacity) : this.opacity;
        if (this.transformMatrix && isInPathGroup) {
            ctx.translate(this.width / 2 + this.x, this.height / 2 + this.y);
        }
        if (!this.transformMatrix && isInPathGroup) {
            ctx.translate(-this.group.width / 2 + this.width / 2 + this.x, -this.group.height / 2 + this.height / 2 + this.y);
        }
        var isRounded = rx !== 0 || ry !== 0;
        ctx.moveTo(x + rx, y);
        ctx.lineTo(x + w - rx, y);
        isRounded && ctx.quadraticCurveTo(x + w, y, x + w, y + ry, x + w, y + ry);
        ctx.lineTo(x + w, y + h - ry);
        isRounded && ctx.quadraticCurveTo(x + w, y + h, x + w - rx, y + h, x + w - rx, y + h);
        ctx.lineTo(x + rx, y + h);
        isRounded && ctx.quadraticCurveTo(x, y + h, x, y + h - ry, x, y + h - ry);
        ctx.lineTo(x, y + ry);
        isRounded && ctx.quadraticCurveTo(x, y, x + rx, y, x + rx, y);
        ctx.closePath();
        this._renderFill(ctx);
        this._renderStroke(ctx);
    }, _renderDashedStroke:function (ctx) {
        var x = -this.width / 2, y = -this.height / 2, w = this.width, h = this.height;
        ctx.beginPath();
        fabric.util.drawDashedLine(ctx, x, y, x + w, y, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, x + w, y, x + w, y + h, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, x + w, y + h, x, y + h, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, x, y + h, x, y, this.strokeDashArray);
        ctx.closePath();
    }, _normalizeLeftTopProperties:function (parsedAttributes) {
        if ("left" in parsedAttributes) {
            this.set("left", parsedAttributes.left + this.getWidth() / 2);
        }
        this.set("x", parsedAttributes.left || 0);
        if ("top" in parsedAttributes) {
            this.set("top", parsedAttributes.top + this.getHeight() / 2);
        }
        this.set("y", parsedAttributes.top || 0);
        return this;
    }, toObject:function (propertiesToInclude) {
        var object = extend(this.callSuper("toObject", propertiesToInclude), {rx:this.get("rx") || 0, ry:this.get("ry") || 0, x:this.get("x"), y:this.get("y")});
        if (!this.includeDefaultValues) {
            this._removeDefaultValues(object);
        }
        return object;
    }, toSVG:function (reviver) {
        var markup = this._createBaseSVGMarkup();
        markup.push("<rect ", "x=\"", (-1 * this.width / 2), "\" y=\"", (-1 * this.height / 2), "\" rx=\"", this.get("rx"), "\" ry=\"", this.get("ry"), "\" width=\"", this.width, "\" height=\"", this.height, "\" style=\"", this.getSvgStyles(), "\" transform=\"", this.getSvgTransform(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, complexity:function () {
        return 1;
    }});
    fabric.Rect.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat("x y rx ry width height".split(" "));
    function _setDefaultLeftTopValues(attributes) {
        attributes.left = attributes.left || 0;
        attributes.top = attributes.top || 0;
        return attributes;
    }
    fabric.Rect.fromElement = function (element, options) {
        if (!element) {
            return null;
        }
        var parsedAttributes = fabric.parseAttributes(element, fabric.Rect.ATTRIBUTE_NAMES);
        parsedAttributes = _setDefaultLeftTopValues(parsedAttributes);
        var rect = new fabric.Rect(extend((options ? fabric.util.object.clone(options) : {}), parsedAttributes));
        rect._normalizeLeftTopProperties(parsedAttributes);
        return rect;
    };
    fabric.Rect.fromObject = function (object) {
        return new fabric.Rect(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), toFixed = fabric.util.toFixed, min = fabric.util.array.min;
    if (fabric.Polyline) {
        fabric.warn("fabric.Polyline is already defined");
        return;
    }
    fabric.Polyline = fabric.util.createClass(fabric.Object, {type:"polyline", initialize:function (points, options, skipOffset) {
        options = options || {};
        this.set("points", points);
        this.callSuper("initialize", options);
        this._calcDimensions(skipOffset);
    }, _calcDimensions:function (skipOffset) {
        return fabric.Polygon.prototype._calcDimensions.call(this, skipOffset);
    }, toObject:function (propertiesToInclude) {
        return fabric.Polygon.prototype.toObject.call(this, propertiesToInclude);
    }, toSVG:function (reviver) {
        var points = [], markup = this._createBaseSVGMarkup();
        for (var i = 0, len = this.points.length; i < len; i++) {
            points.push(toFixed(this.points[i].x, 2), ",", toFixed(this.points[i].y, 2), " ");
        }
        markup.push("<polyline ", "points=\"", points.join(""), "\" style=\"", this.getSvgStyles(), "\" transform=\"", this.getSvgTransform(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, _render:function (ctx) {
        var point;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0, len = this.points.length; i < len; i++) {
            point = this.points[i];
            ctx.lineTo(point.x, point.y);
        }
        this._renderFill(ctx);
        this._renderStroke(ctx);
    }, _renderDashedStroke:function (ctx) {
        var p1, p2;
        ctx.beginPath();
        for (var i = 0, len = this.points.length; i < len; i++) {
            p1 = this.points[i];
            p2 = this.points[i + 1] || p1;
            fabric.util.drawDashedLine(ctx, p1.x, p1.y, p2.x, p2.y, this.strokeDashArray);
        }
    }, complexity:function () {
        return this.get("points").length;
    }});
    fabric.Polyline.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat();
    fabric.Polyline.fromElement = function (element, options) {
        if (!element) {
            return null;
        }
        options || (options = {});
        var points = fabric.parsePointsAttribute(element.getAttribute("points")), parsedAttributes = fabric.parseAttributes(element, fabric.Polyline.ATTRIBUTE_NAMES), minX = min(points, "x"), minY = min(points, "y");
        minX = minX < 0 ? minX : 0;
        minY = minX < 0 ? minY : 0;
        for (var i = 0, len = points.length; i < len; i++) {
            points[i].x -= (options.width / 2 + minX) || 0;
            points[i].y -= (options.height / 2 + minY) || 0;
        }
        return new fabric.Polyline(points, fabric.util.object.extend(parsedAttributes, options), true);
    };
    fabric.Polyline.fromObject = function (object) {
        var points = object.points;
        return new fabric.Polyline(points, object, true);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, min = fabric.util.array.min, max = fabric.util.array.max, toFixed = fabric.util.toFixed;
    if (fabric.Polygon) {
        fabric.warn("fabric.Polygon is already defined");
        return;
    }
    fabric.Polygon = fabric.util.createClass(fabric.Object, {type:"polygon", initialize:function (points, options, skipOffset) {
        options = options || {};
        this.points = points;
        this.callSuper("initialize", options);
        this._calcDimensions(skipOffset);
    }, _calcDimensions:function (skipOffset) {
        var points = this.points, minX = min(points, "x"), minY = min(points, "y"), maxX = max(points, "x"), maxY = max(points, "y");
        this.width = (maxX - minX) || 1;
        this.height = (maxY - minY) || 1;
        this.minX = minX;
        this.minY = minY;
        if (skipOffset) {
            return;
        }
        var halfWidth = this.width / 2 + this.minX, halfHeight = this.height / 2 + this.minY;
        this.points.forEach(function (p) {
            p.x -= halfWidth;
            p.y -= halfHeight;
        }, this);
    }, toObject:function (propertiesToInclude) {
        return extend(this.callSuper("toObject", propertiesToInclude), {points:this.points.concat()});
    }, toSVG:function (reviver) {
        var points = [], markup = this._createBaseSVGMarkup();
        for (var i = 0, len = this.points.length; i < len; i++) {
            points.push(toFixed(this.points[i].x, 2), ",", toFixed(this.points[i].y, 2), " ");
        }
        markup.push("<polygon ", "points=\"", points.join(""), "\" style=\"", this.getSvgStyles(), "\" transform=\"", this.getSvgTransform(), "\"/>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, _render:function (ctx) {
        var point;
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (var i = 0, len = this.points.length; i < len; i++) {
            point = this.points[i];
            ctx.lineTo(point.x, point.y);
        }
        this._renderFill(ctx);
        if (this.stroke || this.strokeDashArray) {
            ctx.closePath();
            this._renderStroke(ctx);
        }
    }, _renderDashedStroke:function (ctx) {
        var p1, p2;
        ctx.beginPath();
        for (var i = 0, len = this.points.length; i < len; i++) {
            p1 = this.points[i];
            p2 = this.points[i + 1] || this.points[0];
            fabric.util.drawDashedLine(ctx, p1.x, p1.y, p2.x, p2.y, this.strokeDashArray);
        }
        ctx.closePath();
    }, complexity:function () {
        return this.points.length;
    }});
    fabric.Polygon.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat();
    fabric.Polygon.fromElement = function (element, options) {
        if (!element) {
            return null;
        }
        options || (options = {});
        var points = fabric.parsePointsAttribute(element.getAttribute("points")), parsedAttributes = fabric.parseAttributes(element, fabric.Polygon.ATTRIBUTE_NAMES), minX = min(points, "x"), minY = min(points, "y");
        minX = minX < 0 ? minX : 0;
        minY = minX < 0 ? minY : 0;
        for (var i = 0, len = points.length; i < len; i++) {
            points[i].x -= (options.width / 2 + minX) || 0;
            points[i].y -= (options.height / 2 + minY) || 0;
        }
        return new fabric.Polygon(points, extend(parsedAttributes, options), true);
    };
    fabric.Polygon.fromObject = function (object) {
        return new fabric.Polygon(object.points, object, true);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    var commandLengths = {m:2, l:2, h:1, v:1, c:6, s:4, q:4, t:2, a:7};
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), min = fabric.util.array.min, max = fabric.util.array.max, extend = fabric.util.object.extend, _toString = Object.prototype.toString, drawArc = fabric.util.drawArc;
    if (fabric.Path) {
        fabric.warn("fabric.Path is already defined");
        return;
    }
    function getX(item) {
        if (item[0] === "H") {
            return item[1];
        }
        return item[item.length - 2];
    }
    function getY(item) {
        if (item[0] === "V") {
            return item[1];
        }
        return item[item.length - 1];
    }
    fabric.Path = fabric.util.createClass(fabric.Object, {type:"path", initialize:function (path, options) {
        options = options || {};
        this.setOptions(options);
        if (!path) {
            throw new Error("`path` argument is required");
        }
        var fromArray = _toString.call(path) === "[object Array]";
        this.path = fromArray ? path : path.match && path.match(/[mzlhvcsqta][^mzlhvcsqta]*/gi);
        if (!this.path) {
            return;
        }
        if (!fromArray) {
            this.path = this._parsePath();
        }
        this._initializePath(options);
        if (options.sourcePath) {
            this.setSourcePath(options.sourcePath);
        }
    }, _initializePath:function (options) {
        var isWidthSet = "width" in options && options.width != null, isHeightSet = "height" in options && options.width != null, isLeftSet = "left" in options, isTopSet = "top" in options, origLeft = isLeftSet ? this.left : 0, origTop = isTopSet ? this.top : 0;
        if (!isWidthSet || !isHeightSet) {
            extend(this, this._parseDimensions());
            if (isWidthSet) {
                this.width = options.width;
            }
            if (isHeightSet) {
                this.height = options.height;
            }
        } else {
            if (!isTopSet) {
                this.top = this.height / 2;
            }
            if (!isLeftSet) {
                this.left = this.width / 2;
            }
        }
        this.pathOffset = this.pathOffset || this._calculatePathOffset(origLeft, origTop);
    }, _calculatePathOffset:function (origLeft, origTop) {
        return {x:this.left - origLeft - (this.width / 2), y:this.top - origTop - (this.height / 2)};
    }, _render:function (ctx) {
        var current, previous = null, x = 0, y = 0, controlX = 0, controlY = 0, tempX, tempY, tempControlX, tempControlY, l = -((this.width / 2) + this.pathOffset.x), t = -((this.height / 2) + this.pathOffset.y);
        for (var i = 0, len = this.path.length; i < len; ++i) {
            current = this.path[i];
            switch (current[0]) {
              case "l":
                x += current[1];
                y += current[2];
                ctx.lineTo(x + l, y + t);
                break;
              case "L":
                x = current[1];
                y = current[2];
                ctx.lineTo(x + l, y + t);
                break;
              case "h":
                x += current[1];
                ctx.lineTo(x + l, y + t);
                break;
              case "H":
                x = current[1];
                ctx.lineTo(x + l, y + t);
                break;
              case "v":
                y += current[1];
                ctx.lineTo(x + l, y + t);
                break;
              case "V":
                y = current[1];
                ctx.lineTo(x + l, y + t);
                break;
              case "m":
                x += current[1];
                y += current[2];
                ctx[(previous && (previous[0] === "m" || previous[0] === "M")) ? "lineTo" : "moveTo"](x + l, y + t);
                break;
              case "M":
                x = current[1];
                y = current[2];
                ctx[(previous && (previous[0] === "m" || previous[0] === "M")) ? "lineTo" : "moveTo"](x + l, y + t);
                break;
              case "c":
                tempX = x + current[5];
                tempY = y + current[6];
                controlX = x + current[3];
                controlY = y + current[4];
                ctx.bezierCurveTo(x + current[1] + l, y + current[2] + t, controlX + l, controlY + t, tempX + l, tempY + t);
                x = tempX;
                y = tempY;
                break;
              case "C":
                x = current[5];
                y = current[6];
                controlX = current[3];
                controlY = current[4];
                ctx.bezierCurveTo(current[1] + l, current[2] + t, controlX + l, controlY + t, x + l, y + t);
                break;
              case "s":
                tempX = x + current[3];
                tempY = y + current[4];
                controlX = controlX ? (2 * x - controlX) : x;
                controlY = controlY ? (2 * y - controlY) : y;
                ctx.bezierCurveTo(controlX + l, controlY + t, x + current[1] + l, y + current[2] + t, tempX + l, tempY + t);
                controlX = x + current[1];
                controlY = y + current[2];
                x = tempX;
                y = tempY;
                break;
              case "S":
                tempX = current[3];
                tempY = current[4];
                controlX = 2 * x - controlX;
                controlY = 2 * y - controlY;
                ctx.bezierCurveTo(controlX + l, controlY + t, current[1] + l, current[2] + t, tempX + l, tempY + t);
                x = tempX;
                y = tempY;
                controlX = current[1];
                controlY = current[2];
                break;
              case "q":
                tempX = x + current[3];
                tempY = y + current[4];
                controlX = x + current[1];
                controlY = y + current[2];
                ctx.quadraticCurveTo(controlX + l, controlY + t, tempX + l, tempY + t);
                x = tempX;
                y = tempY;
                break;
              case "Q":
                tempX = current[3];
                tempY = current[4];
                ctx.quadraticCurveTo(current[1] + l, current[2] + t, tempX + l, tempY + t);
                x = tempX;
                y = tempY;
                controlX = current[1];
                controlY = current[2];
                break;
              case "t":
                tempX = x + current[1];
                tempY = y + current[2];
                if (previous[0].match(/[QqTt]/) === null) {
                    controlX = x;
                    controlY = y;
                } else {
                    if (previous[0] === "t") {
                        controlX = 2 * x - tempControlX;
                        controlY = 2 * y - tempControlY;
                    } else {
                        if (previous[0] === "q") {
                            controlX = 2 * x - controlX;
                            controlY = 2 * y - controlY;
                        }
                    }
                }
                tempControlX = controlX;
                tempControlY = controlY;
                ctx.quadraticCurveTo(controlX + l, controlY + t, tempX + l, tempY + t);
                x = tempX;
                y = tempY;
                controlX = x + current[1];
                controlY = y + current[2];
                break;
              case "T":
                tempX = current[1];
                tempY = current[2];
                controlX = 2 * x - controlX;
                controlY = 2 * y - controlY;
                ctx.quadraticCurveTo(controlX + l, controlY + t, tempX + l, tempY + t);
                x = tempX;
                y = tempY;
                break;
              case "a":
                drawArc(ctx, x + l, y + t, [current[1], current[2], current[3], current[4], current[5], current[6] + x + l, current[7] + y + t]);
                x += current[6];
                y += current[7];
                break;
              case "A":
                drawArc(ctx, x + l, y + t, [current[1], current[2], current[3], current[4], current[5], current[6] + l, current[7] + t]);
                x = current[6];
                y = current[7];
                break;
              case "z":
              case "Z":
                ctx.closePath();
                break;
            }
            previous = current;
        }
    }, render:function (ctx, noTransform) {
        if (!this.visible) {
            return;
        }
        ctx.save();
        var m = this.transformMatrix;
        if (m) {
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        if (!noTransform) {
            this.transform(ctx);
        }
        if (this.fill) {
            ctx.fillStyle = this.fill.toLive ? this.fill.toLive(ctx) : this.fill;
        }
        if (this.stroke) {
            ctx.lineWidth = this.strokeWidth;
            ctx.lineCap = this.strokeLineCap;
            ctx.lineJoin = this.strokeLineJoin;
            ctx.miterLimit = this.strokeMiterLimit;
            ctx.strokeStyle = this.stroke.toLive ? this.stroke.toLive(ctx) : this.stroke;
        }
        this._setShadow(ctx);
        this.clipTo && fabric.util.clipContext(this, ctx);
        ctx.beginPath();
        this._render(ctx);
        this._renderFill(ctx);
        this._renderStroke(ctx);
        this.clipTo && ctx.restore();
        this._removeShadow(ctx);
        if (!noTransform && this.active) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
    }, toString:function () {
        return "#<fabric.Path (" + this.complexity() + "): { \"top\": " + this.top + ", \"left\": " + this.left + " }>";
    }, toObject:function (propertiesToInclude) {
        var o = extend(this.callSuper("toObject", propertiesToInclude), {path:this.path, pathOffset:this.pathOffset});
        if (this.sourcePath) {
            o.sourcePath = this.sourcePath;
        }
        if (this.transformMatrix) {
            o.transformMatrix = this.transformMatrix;
        }
        return o;
    }, toDatalessObject:function (propertiesToInclude) {
        var o = this.toObject(propertiesToInclude);
        if (this.sourcePath) {
            o.path = this.sourcePath;
        }
        delete o.sourcePath;
        return o;
    }, toSVG:function (reviver) {
        var chunks = [], markup = this._createBaseSVGMarkup();
        for (var i = 0, len = this.path.length; i < len; i++) {
            chunks.push(this.path[i].join(" "));
        }
        var path = chunks.join(" ");
        markup.push("<g transform=\"", (this.group ? "" : this.getSvgTransform()), "\">", "<path ", "d=\"", path, "\" style=\"", this.getSvgStyles(), "\" transform=\"translate(", (-this.width / 2), " ", (-this.height / 2), ")", "\" stroke-linecap=\"round\" ", "/>", "</g>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, complexity:function () {
        return this.path.length;
    }, _parsePath:function () {
        var result = [], coords = [], currentPath, parsed, re = /(-?\.\d+)|(-?\d+(\.\d+)?)/g, match, coordsStr;
        for (var i = 0, coordsParsed, len = this.path.length; i < len; i++) {
            currentPath = this.path[i];
            coordsStr = currentPath.slice(1).trim();
            coords.length = 0;
            while ((match = re.exec(coordsStr))) {
                coords.push(match[0]);
            }
            coordsParsed = [currentPath.charAt(0)];
            for (var j = 0, jlen = coords.length; j < jlen; j++) {
                parsed = parseFloat(coords[j]);
                if (!isNaN(parsed)) {
                    coordsParsed.push(parsed);
                }
            }
            var command = coordsParsed[0].toLowerCase(), commandLength = commandLengths[command];
            if (coordsParsed.length - 1 > commandLength) {
                for (var k = 1, klen = coordsParsed.length; k < klen; k += commandLength) {
                    result.push([coordsParsed[0]].concat(coordsParsed.slice(k, k + commandLength)));
                }
            } else {
                result.push(coordsParsed);
            }
        }
        return result;
    }, _parseDimensions:function () {
        var aX = [], aY = [], previousX, previousY, isLowerCase = false, x, y;
        this.path.forEach(function (item, i) {
            if (item[0] !== "H") {
                previousX = (i === 0) ? getX(item) : getX(this.path[i - 1]);
            }
            if (item[0] !== "V") {
                previousY = (i === 0) ? getY(item) : getY(this.path[i - 1]);
            }
            if (item[0] === item[0].toLowerCase()) {
                isLowerCase = true;
            }
            x = isLowerCase ? previousX + getX(item) : item[0] === "V" ? previousX : getX(item);
            y = isLowerCase ? previousY + getY(item) : item[0] === "H" ? previousY : getY(item);
            var val = parseInt(x, 10);
            if (!isNaN(val)) {
                aX.push(val);
            }
            val = parseInt(y, 10);
            if (!isNaN(val)) {
                aY.push(val);
            }
        }, this);
        var minX = min(aX), minY = min(aY), maxX = max(aX), maxY = max(aY), deltaX = maxX - minX, deltaY = maxY - minY;
        var o = {left:this.left + (minX + deltaX / 2), top:this.top + (minY + deltaY / 2), width:deltaX, height:deltaY};
        return o;
    }});
    fabric.Path.fromObject = function (object, callback) {
        if (typeof object.path === "string") {
            fabric.loadSVGFromURL(object.path, function (elements) {
                var path = elements[0];
                var pathUrl = object.path;
                delete object.path;
                fabric.util.object.extend(path, object);
                path.setSourcePath(pathUrl);
                callback(path);
            });
        } else {
            callback(new fabric.Path(object.path, object));
        }
    };
    fabric.Path.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat(["d"]);
    fabric.Path.fromElement = function (element, callback, options) {
        var parsedAttributes = fabric.parseAttributes(element, fabric.Path.ATTRIBUTE_NAMES);
        callback && callback(new fabric.Path(parsedAttributes.d, extend(parsedAttributes, options)));
    };
    fabric.Path.async = true;
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, invoke = fabric.util.array.invoke, parentToObject = fabric.Object.prototype.toObject;
    if (fabric.PathGroup) {
        fabric.warn("fabric.PathGroup is already defined");
        return;
    }
    fabric.PathGroup = fabric.util.createClass(fabric.Path, {type:"path-group", fill:"", initialize:function (paths, options) {
        options = options || {};
        this.paths = paths || [];
        for (var i = this.paths.length; i--; ) {
            this.paths[i].group = this;
        }
        this.setOptions(options);
        this.setCoords();
        if (options.sourcePath) {
            this.setSourcePath(options.sourcePath);
        }
    }, render:function (ctx) {
        if (!this.visible) {
            return;
        }
        ctx.save();
        var m = this.transformMatrix;
        if (m) {
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        this.transform(ctx);
        this._setShadow(ctx);
        this.clipTo && fabric.util.clipContext(this, ctx);
        for (var i = 0, l = this.paths.length; i < l; ++i) {
            this.paths[i].render(ctx, true);
        }
        this.clipTo && ctx.restore();
        this._removeShadow(ctx);
        if (this.active) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
    }, _set:function (prop, value) {
        if (prop === "fill" && value && this.isSameColor()) {
            var i = this.paths.length;
            while (i--) {
                this.paths[i]._set(prop, value);
            }
        }
        return this.callSuper("_set", prop, value);
    }, toObject:function (propertiesToInclude) {
        var o = extend(parentToObject.call(this, propertiesToInclude), {paths:invoke(this.getObjects(), "toObject", propertiesToInclude)});
        if (this.sourcePath) {
            o.sourcePath = this.sourcePath;
        }
        return o;
    }, toDatalessObject:function (propertiesToInclude) {
        var o = this.toObject(propertiesToInclude);
        if (this.sourcePath) {
            o.paths = this.sourcePath;
        }
        return o;
    }, toSVG:function (reviver) {
        var objects = this.getObjects();
        var markup = ["<g ", "style=\"", this.getSvgStyles(), "\" ", "transform=\"", this.getSvgTransform(), "\" ", ">"];
        for (var i = 0, len = objects.length; i < len; i++) {
            markup.push(objects[i].toSVG(reviver));
        }
        markup.push("</g>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, toString:function () {
        return "#<fabric.PathGroup (" + this.complexity() + "): { top: " + this.top + ", left: " + this.left + " }>";
    }, isSameColor:function () {
        var firstPathFill = this.getObjects()[0].get("fill");
        return this.getObjects().every(function (path) {
            return path.get("fill") === firstPathFill;
        });
    }, complexity:function () {
        return this.paths.reduce(function (total, path) {
            return total + ((path && path.complexity) ? path.complexity() : 0);
        }, 0);
    }, getObjects:function () {
        return this.paths;
    }});
    fabric.PathGroup.fromObject = function (object, callback) {
        if (typeof object.paths === "string") {
            fabric.loadSVGFromURL(object.paths, function (elements) {
                var pathUrl = object.paths;
                delete object.paths;
                var pathGroup = fabric.util.groupSVGElements(elements, object, pathUrl);
                callback(pathGroup);
            });
        } else {
            fabric.util.enlivenObjects(object.paths, function (enlivenedObjects) {
                delete object.paths;
                callback(new fabric.PathGroup(enlivenedObjects, object));
            });
        }
    };
    fabric.PathGroup.async = true;
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, min = fabric.util.array.min, max = fabric.util.array.max, invoke = fabric.util.array.invoke;
    if (fabric.Group) {
        return;
    }
    var _lockProperties = {lockMovementX:true, lockMovementY:true, lockRotation:true, lockScalingX:true, lockScalingY:true, lockUniScaling:true};
    fabric.Group = fabric.util.createClass(fabric.Object, fabric.Collection, {type:"group", initialize:function (objects, options) {
        options = options || {};
        this._objects = objects || [];
        for (var i = this._objects.length; i--; ) {
            this._objects[i].group = this;
        }
        this.originalState = {};
        this.callSuper("initialize");
        this._calcBounds();
        this._updateObjectsCoords();
        if (options) {
            extend(this, options);
        }
        this._setOpacityIfSame();
        this.setCoords(true);
        this.saveCoords();
    }, _updateObjectsCoords:function () {
        var groupDeltaX = this.left, groupDeltaY = this.top;
        this.forEachObject(function (object) {
            var objectLeft = object.get("left"), objectTop = object.get("top");
            object.set("originalLeft", objectLeft);
            object.set("originalTop", objectTop);
            object.set("left", objectLeft - groupDeltaX);
            object.set("top", objectTop - groupDeltaY);
            object.setCoords();
            object.__origHasControls = object.hasControls;
            object.hasControls = false;
        }, this);
    }, toString:function () {
        return "#<fabric.Group: (" + this.complexity() + ")>";
    }, getObjects:function () {
        return this._objects;
    }, addWithUpdate:function (object) {
        this._restoreObjectsState();
        this._objects.push(object);
        object.group = this;
        this.forEachObject(function (o) {
            o.set("active", true);
            o.group = this;
        }, this);
        this._calcBounds();
        this._updateObjectsCoords();
        return this;
    }, removeWithUpdate:function (object) {
        this._moveFlippedObject(object);
        this._restoreObjectsState();
        this.forEachObject(function (o) {
            o.set("active", true);
            o.group = this;
        }, this);
        this.remove(object);
        this._calcBounds();
        this._updateObjectsCoords();
        return this;
    }, _onObjectAdded:function (object) {
        object.group = this;
    }, _onObjectRemoved:function (object) {
        delete object.group;
        object.set("active", false);
    }, delegatedProperties:{fill:true, opacity:true, fontFamily:true, fontWeight:true, fontSize:true, fontStyle:true, lineHeight:true, textDecoration:true, textAlign:true, backgroundColor:true}, _set:function (key, value) {
        if (key in this.delegatedProperties) {
            var i = this._objects.length;
            this[key] = value;
            while (i--) {
                this._objects[i].set(key, value);
            }
        } else {
            this[key] = value;
        }
    }, toObject:function (propertiesToInclude) {
        return extend(this.callSuper("toObject", propertiesToInclude), {objects:invoke(this._objects, "toObject", propertiesToInclude)});
    }, render:function (ctx, noTransform) {
        if (!this.visible) {
            return;
        }
        ctx.save();
        this.transform(ctx);
        var groupScaleFactor = Math.max(this.scaleX, this.scaleY);
        this.clipTo && fabric.util.clipContext(this, ctx);
        for (var i = 0, len = this._objects.length; i < len; i++) {
            var object = this._objects[i], originalScaleFactor = object.borderScaleFactor, originalHasRotatingPoint = object.hasRotatingPoint;
            if (!object.visible) {
                continue;
            }
            object.borderScaleFactor = groupScaleFactor;
            object.hasRotatingPoint = false;
            object.render(ctx);
            object.borderScaleFactor = originalScaleFactor;
            object.hasRotatingPoint = originalHasRotatingPoint;
        }
        this.clipTo && ctx.restore();
        if (!noTransform && this.active) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
        this.setCoords();
    }, _restoreObjectsState:function () {
        this._objects.forEach(this._restoreObjectState, this);
        return this;
    }, _moveFlippedObject:function (object) {
        var oldOriginX = object.get("originX");
        var oldOriginY = object.get("originY");
        var center = object.getCenterPoint();
        object.set({originX:"center", originY:"center", left:center.x, top:center.y});
        if (this.flipX) {
            object.toggle("flipX");
            object.set("left", -object.get("left"));
            object.setAngle(-object.getAngle());
        }
        if (this.flipY) {
            object.toggle("flipY");
            object.set("top", -object.get("top"));
            object.setAngle(-object.getAngle());
        }
        var newOrigin = object.getPointByOrigin(oldOriginX, oldOriginY);
        object.set({originX:oldOriginX, originY:oldOriginY, left:newOrigin.x, top:newOrigin.y});
        return this;
    }, _restoreObjectState:function (object) {
        var groupLeft = this.get("left"), groupTop = this.get("top"), groupAngle = this.getAngle() * (Math.PI / 180), rotatedTop = Math.cos(groupAngle) * object.get("top") * this.get("scaleY") + Math.sin(groupAngle) * object.get("left") * this.get("scaleX"), rotatedLeft = -Math.sin(groupAngle) * object.get("top") * this.get("scaleY") + Math.cos(groupAngle) * object.get("left") * this.get("scaleX");
        object.setAngle(object.getAngle() + this.getAngle());
        object.set("left", groupLeft + rotatedLeft);
        object.set("top", groupTop + rotatedTop);
        object.set("scaleX", object.get("scaleX") * this.get("scaleX"));
        object.set("scaleY", object.get("scaleY") * this.get("scaleY"));
        object.setCoords();
        object.hasControls = object.__origHasControls;
        delete object.__origHasControls;
        object.set("active", false);
        object.setCoords();
        delete object.group;
        return this;
    }, destroy:function () {
        this._objects.forEach(this._moveFlippedObject, this);
        return this._restoreObjectsState();
    }, saveCoords:function () {
        this._originalLeft = this.get("left");
        this._originalTop = this.get("top");
        return this;
    }, hasMoved:function () {
        return this._originalLeft !== this.get("left") || this._originalTop !== this.get("top");
    }, setObjectsCoords:function () {
        this.forEachObject(function (object) {
            object.setCoords();
        });
        return this;
    }, _setOpacityIfSame:function () {
        var objects = this.getObjects(), firstValue = objects[0] ? objects[0].get("opacity") : 1;
        var isSameOpacity = objects.every(function (o) {
            return o.get("opacity") === firstValue;
        });
        if (isSameOpacity) {
            this.opacity = firstValue;
        }
    }, _calcBounds:function () {
        var aX = [], aY = [], minX, minY, maxX, maxY, o, width, height, i = 0, len = this._objects.length;
        for (; i < len; ++i) {
            o = this._objects[i];
            o.setCoords();
            for (var prop in o.oCoords) {
                aX.push(o.oCoords[prop].x);
                aY.push(o.oCoords[prop].y);
            }
        }
        minX = min(aX);
        maxX = max(aX);
        minY = min(aY);
        maxY = max(aY);
        width = (maxX - minX) || 0;
        height = (maxY - minY) || 0;
        this.width = width;
        this.height = height;
        this.left = (minX + width / 2) || 0;
        this.top = (minY + height / 2) || 0;
    }, toSVG:function (reviver) {
        var markup = ["<g ", "transform=\"", this.getSvgTransform(), "\">"];
        for (var i = 0, len = this._objects.length; i < len; i++) {
            markup.push(this._objects[i].toSVG(reviver));
        }
        markup.push("</g>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, get:function (prop) {
        if (prop in _lockProperties) {
            if (this[prop]) {
                return this[prop];
            } else {
                for (var i = 0, len = this._objects.length; i < len; i++) {
                    if (this._objects[i][prop]) {
                        return true;
                    }
                }
                return false;
            }
        } else {
            if (prop in this.delegatedProperties) {
                return this._objects[0] && this._objects[0].get(prop);
            }
            return this[prop];
        }
    }});
    fabric.Group.fromObject = function (object, callback) {
        fabric.util.enlivenObjects(object.objects, function (enlivenedObjects) {
            delete object.objects;
            callback && callback(new fabric.Group(enlivenedObjects, object));
        });
    };
    fabric.Group.async = true;
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var extend = fabric.util.object.extend;
    if (!global.fabric) {
        global.fabric = {};
    }
    if (global.fabric.Image) {
        fabric.warn("fabric.Image is already defined.");
        return;
    }
    fabric.Image = fabric.util.createClass(fabric.Object, {type:"image", initialize:function (element, options) {
        options || (options = {});
        this.filters = [];
        this.callSuper("initialize", options);
        this._initElement(element);
        this._initConfig(options);
        if (options.filters) {
            this.filters = options.filters;
            this.applyFilters();
        }
    }, getElement:function () {
        return this._element;
    }, setElement:function (element, callback) {
        this._element = element;
        this._originalElement = element;
        this._initConfig();
        if (this.filters.length !== 0) {
            this.applyFilters(callback);
        }
        return this;
    }, getOriginalSize:function () {
        var element = this.getElement();
        return {width:element.width, height:element.height};
    }, render:function (ctx, noTransform) {
        if (!this.visible) {
            return;
        }
        ctx.save();
        var m = this.transformMatrix;
        var isInPathGroup = this.group && this.group.type !== "group";
        if (isInPathGroup) {
            ctx.translate(-this.group.width / 2 + this.width / 2, -this.group.height / 2 + this.height / 2);
        }
        if (m) {
            ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
        }
        if (!noTransform) {
            this.transform(ctx);
        }
        ctx.save();
        this._setShadow(ctx);
        this.clipTo && fabric.util.clipContext(this, ctx);
        this._render(ctx);
        if (this.shadow && !this.shadow.affectStroke) {
            this._removeShadow(ctx);
        }
        this._renderStroke(ctx);
        this.clipTo && ctx.restore();
        ctx.restore();
        if (this.active && !noTransform) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
    }, _stroke:function (ctx) {
        ctx.save();
        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = this.strokeLineCap;
        ctx.lineJoin = this.strokeLineJoin;
        ctx.miterLimit = this.strokeMiterLimit;
        ctx.strokeStyle = this.stroke.toLive ? this.stroke.toLive(ctx) : this.stroke;
        ctx.beginPath();
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.closePath();
        ctx.restore();
    }, _renderDashedStroke:function (ctx) {
        var x = -this.width / 2, y = -this.height / 2, w = this.width, h = this.height;
        ctx.save();
        ctx.lineWidth = this.strokeWidth;
        ctx.lineCap = this.strokeLineCap;
        ctx.lineJoin = this.strokeLineJoin;
        ctx.miterLimit = this.strokeMiterLimit;
        ctx.strokeStyle = this.stroke.toLive ? this.stroke.toLive(ctx) : this.stroke;
        ctx.beginPath();
        fabric.util.drawDashedLine(ctx, x, y, x + w, y, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, x + w, y, x + w, y + h, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, x + w, y + h, x, y + h, this.strokeDashArray);
        fabric.util.drawDashedLine(ctx, x, y + h, x, y, this.strokeDashArray);
        ctx.closePath();
        ctx.restore();
    }, toObject:function (propertiesToInclude) {
        return extend(this.callSuper("toObject", propertiesToInclude), {src:this._originalElement.src || this._originalElement._src, filters:this.filters.map(function (filterObj) {
            return filterObj && filterObj.toObject();
        })});
    }, toSVG:function (reviver) {
        var markup = [];
        markup.push("<g transform=\"", this.getSvgTransform(), "\">", "<image xlink:href=\"", this.getSvgSrc(), "\" style=\"", this.getSvgStyles(), "\" transform=\"translate(" + (-this.width / 2) + " " + (-this.height / 2) + ")", "\" width=\"", this.width, "\" height=\"", this.height, "\"></image>");
        if (this.stroke || this.strokeDashArray) {
            var origFill = this.fill;
            this.fill = null;
            markup.push("<rect ", "x=\"", (-1 * this.width / 2), "\" y=\"", (-1 * this.height / 2), "\" width=\"", this.width, "\" height=\"", this.height, "\" style=\"", this.getSvgStyles(), "\"/>");
            this.fill = origFill;
        }
        markup.push("</g>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, getSrc:function () {
        return this.getElement().src || this.getElement()._src;
    }, toString:function () {
        return "#<fabric.Image: { src: \"" + this.getSrc() + "\" }>";
    }, clone:function (callback, propertiesToInclude) {
        this.constructor.fromObject(this.toObject(propertiesToInclude), callback);
    }, applyFilters:function (callback) {
        if (this.filters.length === 0) {
            this._element = this._originalElement;
            callback && callback();
            return;
        }
        var imgEl = this._originalElement, canvasEl = fabric.util.createCanvasElement(), replacement = fabric.util.createImage(), _this = this;
        canvasEl.width = imgEl.width;
        canvasEl.height = imgEl.height;
        canvasEl.getContext("2d").drawImage(imgEl, 0, 0, imgEl.width, imgEl.height);
        this.filters.forEach(function (filter) {
            filter && filter.applyTo(canvasEl);
        });
        replacement.width = imgEl.width;
        replacement.height = imgEl.height;
        if (fabric.isLikelyNode) {
            replacement.src = canvasEl.toBuffer(undefined, fabric.Image.pngCompression);
            _this._element = replacement;
            callback && callback();
        } else {
            replacement.onload = function () {
                _this._element = replacement;
                callback && callback();
                replacement.onload = canvasEl = imgEl = null;
            };
            replacement.src = canvasEl.toDataURL("image/png");
        }
        return this;
    }, _render:function (ctx) {
        ctx.drawImage(this._element, -this.width / 2, -this.height / 2, this.width, this.height);
    }, _resetWidthHeight:function () {
        var element = this.getElement();
        this.set("width", element.width);
        this.set("height", element.height);
    }, _initElement:function (element) {
        this.setElement(fabric.util.getById(element));
        fabric.util.addClass(this.getElement(), fabric.Image.CSS_CANVAS);
    }, _initConfig:function (options) {
        options || (options = {});
        this.setOptions(options);
        this._setWidthHeight(options);
    }, _initFilters:function (object, callback) {
        if (object.filters && object.filters.length) {
            fabric.util.enlivenObjects(object.filters, function (enlivenedObjects) {
                callback && callback(enlivenedObjects);
            }, "fabric.Image.filters");
        } else {
            callback && callback();
        }
    }, _setWidthHeight:function (options) {
        this.width = "width" in options ? options.width : (this.getElement().width || 0);
        this.height = "height" in options ? options.height : (this.getElement().height || 0);
    }, complexity:function () {
        return 1;
    }});
    fabric.Image.CSS_CANVAS = "canvas-img";
    fabric.Image.prototype.getSvgSrc = fabric.Image.prototype.getSrc;
    fabric.Image.fromObject = function (object, callback) {
        var img = fabric.document.createElement("img"), src = object.src;
        img.onload = function () {
            fabric.Image.prototype._initFilters.call(object, object, function (filters) {
                object.filters = filters || [];
                var instance = new fabric.Image(img, object);
                callback && callback(instance);
                img = img.onload = img.onerror = null;
            });
        };
        img.onerror = function () {
            fabric.log("Error loading " + img.src);
            callback && callback(null, true);
            img = img.onload = img.onerror = null;
        };
        img.src = src;
    };
    fabric.Image.fromURL = function (url, callback, imgOptions) {
        fabric.util.loadImage(url, function (img) {
            callback(new fabric.Image(img, imgOptions));
        });
    };
    fabric.Image.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat("x y width height xlink:href".split(" "));
    fabric.Image.fromElement = function (element, callback, options) {
        var parsedAttributes = fabric.parseAttributes(element, fabric.Image.ATTRIBUTE_NAMES);
        fabric.Image.fromURL(parsedAttributes["xlink:href"], callback, extend((options ? fabric.util.object.clone(options) : {}), parsedAttributes));
    };
    fabric.Image.async = true;
    fabric.Image.pngCompression = 1;
})(typeof exports !== "undefined" ? exports : this);
fabric.util.object.extend(fabric.Object.prototype, {_getAngleValueForStraighten:function () {
    var angle = this.getAngle() % 360;
    if (angle > 0) {
        return Math.round((angle - 1) / 90) * 90;
    }
    return Math.round(angle / 90) * 90;
}, straighten:function () {
    this.setAngle(this._getAngleValueForStraighten());
    return this;
}, fxStraighten:function (callbacks) {
    callbacks = callbacks || {};
    var empty = function () {
    }, onComplete = callbacks.onComplete || empty, onChange = callbacks.onChange || empty, _this = this;
    fabric.util.animate({startValue:this.get("angle"), endValue:this._getAngleValueForStraighten(), duration:this.FX_DURATION, onChange:function (value) {
        _this.setAngle(value);
        onChange();
    }, onComplete:function () {
        _this.setCoords();
        onComplete();
    }, onStart:function () {
        _this.set("active", false);
    }});
    return this;
}});
fabric.util.object.extend(fabric.StaticCanvas.prototype, {straightenObject:function (object) {
    object.straighten();
    this.renderAll();
    return this;
}, fxStraightenObject:function (object) {
    object.fxStraighten({onChange:this.renderAll.bind(this)});
    return this;
}});
fabric.Image.filters = fabric.Image.filters || {};
fabric.Image.filters.BaseFilter = fabric.util.createClass({type:"BaseFilter", toObject:function () {
    return {type:this.type};
}, toJSON:function () {
    return this.toObject();
}});
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.Brightness = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Brightness", initialize:function (options) {
        options = options || {};
        this.brightness = options.brightness || 100;
    }, applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, brightness = this.brightness;
        for (var i = 0, len = data.length; i < len; i += 4) {
            data[i] += brightness;
            data[i + 1] += brightness;
            data[i + 2] += brightness;
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {brightness:this.brightness});
    }});
    fabric.Image.filters.Brightness.fromObject = function (object) {
        return new fabric.Image.filters.Brightness(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.Convolute = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Convolute", initialize:function (options) {
        options = options || {};
        this.opaque = options.opaque;
        this.matrix = options.matrix || [0, 0, 0, 0, 1, 0, 0, 0, 0];
        var canvasEl = fabric.util.createCanvasElement();
        this.tmpCtx = canvasEl.getContext("2d");
    }, _createImageData:function (w, h) {
        return this.tmpCtx.createImageData(w, h);
    }, applyTo:function (canvasEl) {
        var weights = this.matrix;
        var context = canvasEl.getContext("2d");
        var pixels = context.getImageData(0, 0, canvasEl.width, canvasEl.height);
        var side = Math.round(Math.sqrt(weights.length));
        var halfSide = Math.floor(side / 2);
        var src = pixels.data;
        var sw = pixels.width;
        var sh = pixels.height;
        var w = sw;
        var h = sh;
        var output = this._createImageData(w, h);
        var dst = output.data;
        var alphaFac = this.opaque ? 1 : 0;
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var sy = y;
                var sx = x;
                var dstOff = (y * w + x) * 4;
                var r = 0, g = 0, b = 0, a = 0;
                for (var cy = 0; cy < side; cy++) {
                    for (var cx = 0; cx < side; cx++) {
                        var scy = sy + cy - halfSide;
                        var scx = sx + cx - halfSide;
                        if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                            var srcOff = (scy * sw + scx) * 4;
                            var wt = weights[cy * side + cx];
                            r += src[srcOff] * wt;
                            g += src[srcOff + 1] * wt;
                            b += src[srcOff + 2] * wt;
                            a += src[srcOff + 3] * wt;
                        }
                    }
                }
                dst[dstOff] = r;
                dst[dstOff + 1] = g;
                dst[dstOff + 2] = b;
                dst[dstOff + 3] = a + alphaFac * (255 - a);
            }
        }
        context.putImageData(output, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {opaque:this.opaque, matrix:this.matrix});
    }});
    fabric.Image.filters.Convolute.fromObject = function (object) {
        return new fabric.Image.filters.Convolute(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.GradientTransparency = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"GradientTransparency", initialize:function (options) {
        options = options || {};
        this.threshold = options.threshold || 100;
    }, applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, threshold = this.threshold, total = data.length;
        for (var i = 0, len = data.length; i < len; i += 4) {
            data[i + 3] = threshold + 255 * (total - i) / total;
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {threshold:this.threshold});
    }});
    fabric.Image.filters.GradientTransparency.fromObject = function (object) {
        return new fabric.Image.filters.GradientTransparency(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    fabric.Image.filters.Grayscale = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Grayscale", applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, len = imageData.width * imageData.height * 4, index = 0, average;
        while (index < len) {
            average = (data[index] + data[index + 1] + data[index + 2]) / 3;
            data[index] = average;
            data[index + 1] = average;
            data[index + 2] = average;
            index += 4;
        }
        context.putImageData(imageData, 0, 0);
    }});
    fabric.Image.filters.Grayscale.fromObject = function () {
        return new fabric.Image.filters.Grayscale();
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    fabric.Image.filters.Invert = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Invert", applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, iLen = data.length, i;
        for (i = 0; i < iLen; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
        context.putImageData(imageData, 0, 0);
    }});
    fabric.Image.filters.Invert.fromObject = function () {
        return new fabric.Image.filters.Invert();
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.Mask = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Mask", initialize:function (options) {
        options = options || {};
        this.mask = options.mask;
        this.channel = [0, 1, 2, 3].indexOf(options.channel) > -1 ? options.channel : 0;
    }, applyTo:function (canvasEl) {
        if (!this.mask) {
            return;
        }
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, maskEl = this.mask.getElement(), maskCanvasEl = fabric.util.createCanvasElement(), channel = this.channel, i, iLen = imageData.width * imageData.height * 4;
        maskCanvasEl.width = maskEl.width;
        maskCanvasEl.height = maskEl.height;
        maskCanvasEl.getContext("2d").drawImage(maskEl, 0, 0, maskEl.width, maskEl.height);
        var maskImageData = maskCanvasEl.getContext("2d").getImageData(0, 0, maskEl.width, maskEl.height), maskData = maskImageData.data;
        for (i = 0; i < iLen; i += 4) {
            data[i + 3] = maskData[i + channel];
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {mask:this.mask.toObject(), channel:this.channel});
    }});
    fabric.Image.filters.Mask.fromObject = function (object, callback) {
        var img = fabric.document.createElement("img"), src = object.mask.src;
        img.onload = function () {
            object.mask = new fabric.Image(img, object.mask);
            callback && callback(new fabric.Image.filters.Mask(object));
            img = img.onload = img.onerror = null;
        };
        img.onerror = function () {
            fabric.log("Error loading " + img.src);
            callback && callback(null, true);
            img = img.onload = img.onerror = null;
        };
        img.src = src;
    };
    fabric.Image.filters.Mask.async = true;
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.Noise = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Noise", initialize:function (options) {
        options = options || {};
        this.noise = options.noise || 100;
    }, applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, noise = this.noise, rand;
        for (var i = 0, len = data.length; i < len; i += 4) {
            rand = (0.5 - Math.random()) * noise;
            data[i] += rand;
            data[i + 1] += rand;
            data[i + 2] += rand;
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {noise:this.noise});
    }});
    fabric.Image.filters.Noise.fromObject = function (object) {
        return new fabric.Image.filters.Noise(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.Pixelate = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Pixelate", initialize:function (options) {
        options = options || {};
        this.blocksize = options.blocksize || 4;
    }, applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, iLen = imageData.height, jLen = imageData.width, index, i, j, r, g, b, a;
        for (i = 0; i < iLen; i += this.blocksize) {
            for (j = 0; j < jLen; j += this.blocksize) {
                index = (i * 4) * jLen + (j * 4);
                r = data[index];
                g = data[index + 1];
                b = data[index + 2];
                a = data[index + 3];
                for (var _i = i, _ilen = i + this.blocksize; _i < _ilen; _i++) {
                    for (var _j = j, _jlen = j + this.blocksize; _j < _jlen; _j++) {
                        index = (_i * 4) * jLen + (_j * 4);
                        data[index] = r;
                        data[index + 1] = g;
                        data[index + 2] = b;
                        data[index + 3] = a;
                    }
                }
            }
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {blocksize:this.blocksize});
    }});
    fabric.Image.filters.Pixelate.fromObject = function (object) {
        return new fabric.Image.filters.Pixelate(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.RemoveWhite = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"RemoveWhite", initialize:function (options) {
        options = options || {};
        this.threshold = options.threshold || 30;
        this.distance = options.distance || 20;
    }, applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, threshold = this.threshold, distance = this.distance, limit = 255 - threshold, abs = Math.abs, r, g, b;
        for (var i = 0, len = data.length; i < len; i += 4) {
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            if (r > limit && g > limit && b > limit && abs(r - g) < distance && abs(r - b) < distance && abs(g - b) < distance) {
                data[i + 3] = 1;
            }
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {threshold:this.threshold, distance:this.distance});
    }});
    fabric.Image.filters.RemoveWhite.fromObject = function (object) {
        return new fabric.Image.filters.RemoveWhite(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    fabric.Image.filters.Sepia = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Sepia", applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, iLen = data.length, i, avg;
        for (i = 0; i < iLen; i += 4) {
            avg = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
            data[i] = avg + 100;
            data[i + 1] = avg + 50;
            data[i + 2] = avg + 255;
        }
        context.putImageData(imageData, 0, 0);
    }});
    fabric.Image.filters.Sepia.fromObject = function () {
        return new fabric.Image.filters.Sepia();
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {});
    fabric.Image.filters.Sepia2 = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Sepia2", applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, iLen = data.length, i, r, g, b;
        for (i = 0; i < iLen; i += 4) {
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            data[i] = (r * 0.393 + g * 0.769 + b * 0.189) / 1.351;
            data[i + 1] = (r * 0.349 + g * 0.686 + b * 0.168) / 1.203;
            data[i + 2] = (r * 0.272 + g * 0.534 + b * 0.131) / 2.14;
        }
        context.putImageData(imageData, 0, 0);
    }});
    fabric.Image.filters.Sepia2.fromObject = function () {
        return new fabric.Image.filters.Sepia2();
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend;
    fabric.Image.filters.Tint = fabric.util.createClass(fabric.Image.filters.BaseFilter, {type:"Tint", initialize:function (options) {
        options = options || {};
        this.color = options.color || "#000000";
        this.opacity = typeof options.opacity !== "undefined" ? options.opacity : new fabric.Color(this.color).getAlpha();
    }, applyTo:function (canvasEl) {
        var context = canvasEl.getContext("2d"), imageData = context.getImageData(0, 0, canvasEl.width, canvasEl.height), data = imageData.data, iLen = data.length, i, tintR, tintG, tintB, r, g, b, alpha1, source;
        source = new fabric.Color(this.color).getSource();
        tintR = source[0] * this.opacity;
        tintG = source[1] * this.opacity;
        tintB = source[2] * this.opacity;
        alpha1 = 1 - this.opacity;
        for (i = 0; i < iLen; i += 4) {
            r = data[i];
            g = data[i + 1];
            b = data[i + 2];
            data[i] = tintR + r * alpha1;
            data[i + 1] = tintG + g * alpha1;
            data[i + 2] = tintB + b * alpha1;
        }
        context.putImageData(imageData, 0, 0);
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {color:this.color, opacity:this.opacity});
    }});
    fabric.Image.filters.Tint.fromObject = function (object) {
        return new fabric.Image.filters.Tint(object);
    };
})(typeof exports !== "undefined" ? exports : this);
(function (global) {
    "use strict";
    var fabric = global.fabric || (global.fabric = {}), extend = fabric.util.object.extend, clone = fabric.util.object.clone, toFixed = fabric.util.toFixed, supportsLineDash = fabric.StaticCanvas.supports("setLineDash");
    if (fabric.Text) {
        fabric.warn("fabric.Text is already defined");
        return;
    }
    var stateProperties = fabric.Object.prototype.stateProperties.concat();
    stateProperties.push("fontFamily", "fontWeight", "fontSize", "text", "textDecoration", "textAlign", "fontStyle", "lineHeight", "textBackgroundColor", "useNative", "path");
    fabric.Text = fabric.util.createClass(fabric.Object, {_dimensionAffectingProps:{fontSize:true, fontWeight:true, fontFamily:true, textDecoration:true, fontStyle:true, lineHeight:true, stroke:true, strokeWidth:true, text:true}, type:"text", fontSize:40, fontWeight:"normal", fontFamily:"Times New Roman", textDecoration:"", textAlign:"left", fontStyle:"", lineHeight:1.3, textBackgroundColor:"", path:null, useNative:true, stateProperties:stateProperties, stroke:null, shadow:null, initialize:function (text, options) {
        options = options || {};
        this.text = text;
        this.__skipDimension = true;
        this.setOptions(options);
        this.__skipDimension = false;
        this._initDimensions();
        this.setCoords();
    }, _initDimensions:function () {
        if (this.__skipDimension) {
            return;
        }
        var canvasEl = fabric.util.createCanvasElement();
        this._render(canvasEl.getContext("2d"));
    }, toString:function () {
        return "#<fabric.Text (" + this.complexity() + "): { \"text\": \"" + this.text + "\", \"fontFamily\": \"" + this.fontFamily + "\" }>";
    }, _render:function (ctx) {
        var isInPathGroup = this.group && this.group.type !== "group";
        if (isInPathGroup && !this.transformMatrix) {
            ctx.translate(-this.group.width / 2 + this.left, -this.group.height / 2 + this.top);
        } else {
            if (isInPathGroup && this.transformMatrix) {
                ctx.translate(-this.group.width / 2, -this.group.height / 2);
            }
        }
        if (typeof Cufon === "undefined" || this.useNative === true) {
            this._renderViaNative(ctx);
        } else {
            this._renderViaCufon(ctx);
        }
    }, _renderViaNative:function (ctx) {
        this.transform(ctx, fabric.isLikelyNode);
        this._setTextStyles(ctx);
        var textLines = this.text.split(/\r?\n/);
        this.width = this._getTextWidth(ctx, textLines);
        this.height = this._getTextHeight(ctx, textLines);
        this.clipTo && fabric.util.clipContext(this, ctx);
        this._renderTextBackground(ctx, textLines);
        if (this.textAlign !== "left" && this.textAlign !== "justify") {
            ctx.save();
            ctx.translate(this.textAlign === "center" ? (this.width / 2) : this.width, 0);
        }
        ctx.save();
        this._setShadow(ctx);
        this._renderTextFill(ctx, textLines);
        this._renderTextStroke(ctx, textLines);
        this._removeShadow(ctx);
        ctx.restore();
        if (this.textAlign !== "left" && this.textAlign !== "justify") {
            ctx.restore();
        }
        this._renderTextDecoration(ctx, textLines);
        this.clipTo && ctx.restore();
        this._setBoundaries(ctx, textLines);
        this._totalLineHeight = 0;
    }, _setBoundaries:function (ctx, textLines) {
        this._boundaries = [];
        for (var i = 0, len = textLines.length; i < len; i++) {
            var lineWidth = this._getLineWidth(ctx, textLines[i]);
            var lineLeftOffset = this._getLineLeftOffset(lineWidth);
            this._boundaries.push({height:this.fontSize * this.lineHeight, width:lineWidth, left:lineLeftOffset});
        }
    }, _setTextStyles:function (ctx) {
        if (this.fill) {
            ctx.fillStyle = this.fill.toLive ? this.fill.toLive(ctx) : this.fill;
        }
        if (this.stroke) {
            ctx.lineWidth = this.strokeWidth;
            ctx.lineCap = this.strokeLineCap;
            ctx.lineJoin = this.strokeLineJoin;
            ctx.miterLimit = this.strokeMiterLimit;
            ctx.strokeStyle = this.stroke.toLive ? this.stroke.toLive(ctx) : this.stroke;
        }
        ctx.textBaseline = "alphabetic";
        ctx.textAlign = this.textAlign;
        ctx.font = this._getFontDeclaration();
    }, _getTextHeight:function (ctx, textLines) {
        return this.fontSize * textLines.length * this.lineHeight;
    }, _getTextWidth:function (ctx, textLines) {
        var maxWidth = ctx.measureText(textLines[0]).width;
        for (var i = 1, len = textLines.length; i < len; i++) {
            var currentLineWidth = ctx.measureText(textLines[i]).width;
            if (currentLineWidth > maxWidth) {
                maxWidth = currentLineWidth;
            }
        }
        return maxWidth;
    }, _drawChars:function (method, ctx, chars, left, top) {
        ctx[method](chars, left, top);
    }, _drawTextLine:function (method, ctx, line, left, top, lineIndex) {
        top -= this.fontSize / 4;
        if (this.textAlign !== "justify") {
            this._drawChars(method, ctx, line, left, top, lineIndex);
            return;
        }
        var lineWidth = ctx.measureText(line).width;
        var totalWidth = this.width;
        if (totalWidth > lineWidth) {
            var words = line.split(/\s+/);
            var wordsWidth = ctx.measureText(line.replace(/\s+/g, "")).width;
            var widthDiff = totalWidth - wordsWidth;
            var numSpaces = words.length - 1;
            var spaceWidth = widthDiff / numSpaces;
            var leftOffset = 0;
            for (var i = 0, len = words.length; i < len; i++) {
                this._drawChars(method, ctx, words[i], left + leftOffset, top, lineIndex);
                leftOffset += ctx.measureText(words[i]).width + spaceWidth;
            }
        } else {
            this._drawChars(method, ctx, line, left, top, lineIndex);
        }
    }, _getLeftOffset:function () {
        if (fabric.isLikelyNode) {
            return 0;
        }
        return -this.width / 2;
    }, _getTopOffset:function () {
        return -this.height / 2;
    }, _renderTextFill:function (ctx, textLines) {
        if (!this.fill && !this.skipFillStrokeCheck) {
            return;
        }
        this._boundaries = [];
        var lineHeights = 0;
        for (var i = 0, len = textLines.length; i < len; i++) {
            var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
            lineHeights += heightOfLine;
            this._drawTextLine("fillText", ctx, textLines[i], this._getLeftOffset(), this._getTopOffset() + lineHeights, i);
        }
    }, _renderTextStroke:function (ctx, textLines) {
        if (!this.stroke && !this.skipFillStrokeCheck) {
            return;
        }
        var lineHeights = 0;
        ctx.save();
        if (this.strokeDashArray) {
            if (1 & this.strokeDashArray.length) {
                this.strokeDashArray.push.apply(this.strokeDashArray, this.strokeDashArray);
            }
            supportsLineDash && ctx.setLineDash(this.strokeDashArray);
        }
        ctx.beginPath();
        for (var i = 0, len = textLines.length; i < len; i++) {
            var heightOfLine = this._getHeightOfLine(ctx, i, textLines);
            lineHeights += heightOfLine;
            this._drawTextLine("strokeText", ctx, textLines[i], this._getLeftOffset(), this._getTopOffset() + lineHeights, i);
        }
        ctx.closePath();
        ctx.restore();
    }, _getHeightOfLine:function () {
        return this.fontSize * this.lineHeight;
    }, _renderTextBackground:function (ctx, textLines) {
        this._renderTextBoxBackground(ctx);
        this._renderTextLinesBackground(ctx, textLines);
    }, _renderTextBoxBackground:function (ctx) {
        if (!this.backgroundColor) {
            return;
        }
        ctx.save();
        ctx.fillStyle = this.backgroundColor;
        ctx.fillRect(this._getLeftOffset(), this._getTopOffset(), this.width, this.height);
        ctx.restore();
    }, _renderTextLinesBackground:function (ctx, textLines) {
        if (!this.textBackgroundColor) {
            return;
        }
        ctx.save();
        ctx.fillStyle = this.textBackgroundColor;
        for (var i = 0, len = textLines.length; i < len; i++) {
            if (textLines[i] !== "") {
                var lineWidth = this._getLineWidth(ctx, textLines[i]);
                var lineLeftOffset = this._getLineLeftOffset(lineWidth);
                ctx.fillRect(this._getLeftOffset() + lineLeftOffset, this._getTopOffset() + (i * this.fontSize * this.lineHeight), lineWidth, this.fontSize * this.lineHeight);
            }
        }
        ctx.restore();
    }, _getLineLeftOffset:function (lineWidth) {
        if (this.textAlign === "center") {
            return (this.width - lineWidth) / 2;
        }
        if (this.textAlign === "right") {
            return this.width - lineWidth;
        }
        return 0;
    }, _getLineWidth:function (ctx, line) {
        return this.textAlign === "justify" ? this.width : ctx.measureText(line).width;
    }, _renderTextDecoration:function (ctx, textLines) {
        if (!this.textDecoration) {
            return;
        }
        var halfOfVerticalBox = this._getTextHeight(ctx, textLines) / 2;
        var _this = this;
        function renderLinesAtOffset(offset) {
            for (var i = 0, len = textLines.length; i < len; i++) {
                var lineWidth = _this._getLineWidth(ctx, textLines[i]);
                var lineLeftOffset = _this._getLineLeftOffset(lineWidth);
                ctx.fillRect(_this._getLeftOffset() + lineLeftOffset, ~~((offset + (i * _this._getHeightOfLine(ctx, i, textLines))) - halfOfVerticalBox), lineWidth, 1);
            }
        }
        if (this.textDecoration.indexOf("underline") > -1) {
            renderLinesAtOffset(this.fontSize * this.lineHeight);
        }
        if (this.textDecoration.indexOf("line-through") > -1) {
            renderLinesAtOffset(this.fontSize * this.lineHeight - this.fontSize / 2);
        }
        if (this.textDecoration.indexOf("overline") > -1) {
            renderLinesAtOffset(this.fontSize * this.lineHeight - this.fontSize);
        }
    }, _getFontDeclaration:function () {
        return [(fabric.isLikelyNode ? this.fontWeight : this.fontStyle), (fabric.isLikelyNode ? this.fontStyle : this.fontWeight), this.fontSize + "px", (fabric.isLikelyNode ? ("\"" + this.fontFamily + "\"") : this.fontFamily)].join(" ");
    }, render:function (ctx, noTransform) {
        if (!this.visible) {
            return;
        }
        ctx.save();
        this._render(ctx);
        if (!noTransform && this.active) {
            this.drawBorders(ctx);
            this.drawControls(ctx);
        }
        ctx.restore();
    }, toObject:function (propertiesToInclude) {
        var object = extend(this.callSuper("toObject", propertiesToInclude), {text:this.text, fontSize:this.fontSize, fontWeight:this.fontWeight, fontFamily:this.fontFamily, fontStyle:this.fontStyle, lineHeight:this.lineHeight, textDecoration:this.textDecoration, textAlign:this.textAlign, path:this.path, textBackgroundColor:this.textBackgroundColor, useNative:this.useNative});
        if (!this.includeDefaultValues) {
            this._removeDefaultValues(object);
        }
        return object;
    }, toSVG:function (reviver) {
        var markup = [], textLines = this.text.split(/\r?\n/), lineTopOffset = this.useNative ? this.fontSize * this.lineHeight : (-this._fontAscent - ((this._fontAscent / 5) * this.lineHeight)), textLeftOffset = -(this.width / 2), textTopOffset = this.useNative ? this.fontSize - 1 : (this.height / 2) - (textLines.length * this.fontSize) - this._totalLineHeight, textAndBg = this._getSVGTextAndBg(lineTopOffset, textLeftOffset, textLines), shadowSpans = this._getSVGShadows(lineTopOffset, textLines);
        textTopOffset += (this._fontAscent ? ((this._fontAscent / 5) * this.lineHeight) : 0);
        markup.push("<g transform=\"", this.getSvgTransform(), "\">", textAndBg.textBgRects.join(""), "<text ", (this.fontFamily ? "font-family=\"" + this.fontFamily.replace(/"/g, "'") + "\" " : ""), (this.fontSize ? "font-size=\"" + this.fontSize + "\" " : ""), (this.fontStyle ? "font-style=\"" + this.fontStyle + "\" " : ""), (this.fontWeight ? "font-weight=\"" + this.fontWeight + "\" " : ""), (this.textDecoration ? "text-decoration=\"" + this.textDecoration + "\" " : ""), "style=\"", this.getSvgStyles(), "\" ", "transform=\"translate(", toFixed(textLeftOffset, 2), " ", toFixed(textTopOffset, 2), ")\">", shadowSpans.join(""), textAndBg.textSpans.join(""), "</text>", "</g>");
        return reviver ? reviver(markup.join("")) : markup.join("");
    }, _getSVGShadows:function (lineTopOffset, textLines) {
        var shadowSpans = [], i, len, lineTopOffsetMultiplier = 1;
        if (!this.shadow || !this._boundaries) {
            return shadowSpans;
        }
        for (i = 0, len = textLines.length; i < len; i++) {
            if (textLines[i] !== "") {
                var lineLeftOffset = (this._boundaries && this._boundaries[i]) ? this._boundaries[i].left : 0;
                shadowSpans.push("<tspan x=\"", toFixed((lineLeftOffset + lineTopOffsetMultiplier) + this.shadow.offsetX, 2), ((i === 0 || this.useNative) ? "\" y" : "\" dy"), "=\"", toFixed(this.useNative ? ((lineTopOffset * i) - this.height / 2 + this.shadow.offsetY) : (lineTopOffset + (i === 0 ? this.shadow.offsetY : 0)), 2), "\" ", this._getFillAttributes(this.shadow.color), ">", fabric.util.string.escapeXml(textLines[i]), "</tspan>");
                lineTopOffsetMultiplier = 1;
            } else {
                lineTopOffsetMultiplier++;
            }
        }
        return shadowSpans;
    }, _getSVGTextAndBg:function (lineTopOffset, textLeftOffset, textLines) {
        var textSpans = [], textBgRects = [], i, lineLeftOffset, len, lineTopOffsetMultiplier = 1;
        if (this.backgroundColor && this._boundaries) {
            textBgRects.push("<rect ", this._getFillAttributes(this.backgroundColor), " x=\"", toFixed(-this.width / 2, 2), "\" y=\"", toFixed(-this.height / 2, 2), "\" width=\"", toFixed(this.width, 2), "\" height=\"", toFixed(this.height, 2), "\"></rect>");
        }
        for (i = 0, len = textLines.length; i < len; i++) {
            if (textLines[i] !== "") {
                lineLeftOffset = (this._boundaries && this._boundaries[i]) ? toFixed(this._boundaries[i].left, 2) : 0;
                textSpans.push("<tspan x=\"", lineLeftOffset, "\" ", (i === 0 || this.useNative ? "y" : "dy"), "=\"", toFixed(this.useNative ? ((lineTopOffset * i) - this.height / 2) : (lineTopOffset * lineTopOffsetMultiplier), 2), "\" ", this._getFillAttributes(this.fill), ">", fabric.util.string.escapeXml(textLines[i]), "</tspan>");
                lineTopOffsetMultiplier = 1;
            } else {
                lineTopOffsetMultiplier++;
            }
            if (!this.textBackgroundColor || !this._boundaries) {
                continue;
            }
            textBgRects.push("<rect ", this._getFillAttributes(this.textBackgroundColor), " x=\"", toFixed(textLeftOffset + this._boundaries[i].left, 2), "\" y=\"", toFixed((lineTopOffset * i) - this.height / 2, 2), "\" width=\"", toFixed(this._boundaries[i].width, 2), "\" height=\"", toFixed(this._boundaries[i].height, 2), "\"></rect>");
        }
        return {textSpans:textSpans, textBgRects:textBgRects};
    }, _getFillAttributes:function (value) {
        var fillColor = (value && typeof value === "string") ? new fabric.Color(value) : "";
        if (!fillColor || !fillColor.getSource() || fillColor.getAlpha() === 1) {
            return "fill=\"" + value + "\"";
        }
        return "opacity=\"" + fillColor.getAlpha() + "\" fill=\"" + fillColor.setAlpha(1).toRgb() + "\"";
    }, _set:function (key, value) {
        if (key === "fontFamily" && this.path) {
            this.path = this.path.replace(/(.*?)([^\/]*)(\.font\.js)/, "$1" + value + "$3");
        }
        this.callSuper("_set", key, value);
        if (key in this._dimensionAffectingProps) {
            this._initDimensions();
            this.setCoords();
        }
    }, complexity:function () {
        return 1;
    }});
    fabric.Text.ATTRIBUTE_NAMES = fabric.SHARED_ATTRIBUTES.concat("x y font-family font-style font-weight font-size text-decoration".split(" "));
    fabric.Text.fromElement = function (element, options) {
        if (!element) {
            return null;
        }
        var parsedAttributes = fabric.parseAttributes(element, fabric.Text.ATTRIBUTE_NAMES);
        options = fabric.util.object.extend((options ? fabric.util.object.clone(options) : {}), parsedAttributes);
        var text = new fabric.Text(element.textContent, options);
        text.set({left:text.getLeft() + text.getWidth() / 2, top:text.getTop() - text.getHeight() / 2});
        return text;
    };
    fabric.Text.fromObject = function (object) {
        return new fabric.Text(object.text, clone(object));
    };
    fabric.util.createAccessors(fabric.Text);
})(typeof exports !== "undefined" ? exports : this);
fabric.util.object.extend(fabric.Text.prototype, {_renderViaCufon:function (ctx) {
    var o = Cufon.textOptions || (Cufon.textOptions = {});
    o.left = this.left;
    o.top = this.top;
    o.context = ctx;
    o.color = this.fill;
    var el = this._initDummyElementForCufon();
    this.transform(ctx);
    Cufon.replaceElement(el, {engine:"canvas", separate:"none", fontFamily:this.fontFamily, fontWeight:this.fontWeight, textDecoration:this.textDecoration, textShadow:this.shadow && this.shadow.toString(), textAlign:this.textAlign, fontStyle:this.fontStyle, lineHeight:this.lineHeight, stroke:this.stroke, strokeWidth:this.strokeWidth, backgroundColor:this.backgroundColor, textBackgroundColor:this.textBackgroundColor});
    this.width = o.width;
    this.height = o.height;
    this._totalLineHeight = o.totalLineHeight;
    this._fontAscent = o.fontAscent;
    this._boundaries = o.boundaries;
    el = null;
    this.setCoords();
}, _initDummyElementForCufon:function () {
    var el = fabric.document.createElement("pre"), container = fabric.document.createElement("div");
    container.appendChild(el);
    if (typeof G_vmlCanvasManager === "undefined") {
        el.innerHTML = this.text;
    } else {
        el.innerText = this.text.replace(/\r?\n/gi, "\r");
    }
    el.style.fontSize = this.fontSize + "px";
    el.style.letterSpacing = "normal";
    return el;
}});
(function () {
    if (typeof document !== "undefined" && typeof window !== "undefined") {
        return;
    }
    var DOMParser = new require("xmldom").DOMParser, URL = require("url"), HTTP = require("http"), HTTPS = require("https"), Canvas = require("canvas"), Image = require("canvas").Image;
    function request(url, encoding, callback) {
        var oURL = URL.parse(url);
        if (!oURL.port) {
            oURL.port = (oURL.protocol.indexOf("https:") === 0) ? 443 : 80;
        }
        var reqHandler = (oURL.port === 443) ? HTTPS : HTTP;
        var req = reqHandler.request({hostname:oURL.hostname, port:oURL.port, path:oURL.path, method:"GET"}, function (response) {
            var body = "";
            if (encoding) {
                response.setEncoding(encoding);
            }
            response.on("end", function () {
                callback(body);
            });
            response.on("data", function (chunk) {
                if (response.statusCode === 200) {
                    body += chunk;
                }
            });
        });
        req.on("error", function (err) {
            if (err.errno === process.ECONNREFUSED) {
                fabric.log("ECONNREFUSED: connection refused to " + oURL.hostname + ":" + oURL.port);
            } else {
                fabric.log(err.message);
            }
        });
        req.end();
    }
    function request_fs(path, callback) {
        var fs = require("fs");
        fs.readFile(path, function (err, data) {
            if (err) {
                fabric.log(err);
                throw err;
            } else {
                callback(data);
            }
        });
    }
    fabric.util.loadImage = function (url, callback, context) {
        var createImageAndCallBack = function (data) {
            img.src = new Buffer(data, "binary");
            img._src = url;
            callback && callback.call(context, img);
        };
        var img = new Image();
        if (url && (url instanceof Buffer || url.indexOf("data") === 0)) {
            img.src = img._src = url;
            callback && callback.call(context, img);
        } else {
            if (url && url.indexOf("http") !== 0) {
                request_fs(url, createImageAndCallBack);
            } else {
                if (url) {
                    request(url, "binary", createImageAndCallBack);
                }
            }
        }
    };
    fabric.loadSVGFromURL = function (url, callback, reviver) {
        url = url.replace(/^\n\s*/, "").replace(/\?.*$/, "").trim();
        if (url.indexOf("http") !== 0) {
            request_fs(url, function (body) {
                fabric.loadSVGFromString(body, callback, reviver);
            });
        } else {
            request(url, "", function (body) {
                fabric.loadSVGFromString(body, callback, reviver);
            });
        }
    };
    fabric.loadSVGFromString = function (string, callback, reviver) {
        var doc = new DOMParser().parseFromString(string);
        fabric.parseSVGDocument(doc.documentElement, function (results, options) {
            callback && callback(results, options);
        }, reviver);
    };
    fabric.util.getScript = function (url, callback) {
        request(url, "", function (body) {
            eval(body);
            callback && callback();
        });
    };
    fabric.Image.fromObject = function (object, callback) {
        fabric.util.loadImage(object.src, function (img) {
            var oImg = new fabric.Image(img);
            oImg._initConfig(object);
            oImg._initFilters(object, function (filters) {
                oImg.filters = filters || [];
                callback && callback(oImg);
            });
        });
    };
    fabric.createCanvasForNode = function (width, height) {
        var canvasEl = fabric.document.createElement("canvas"), nodeCanvas = new Canvas(width || 600, height || 600);
        canvasEl.style = {};
        canvasEl.width = nodeCanvas.width;
        canvasEl.height = nodeCanvas.height;
        var FabricCanvas = fabric.Canvas || fabric.StaticCanvas;
        var fabricCanvas = new FabricCanvas(canvasEl);
        fabricCanvas.contextContainer = nodeCanvas.getContext("2d");
        fabricCanvas.nodeCanvas = nodeCanvas;
        fabricCanvas.Font = Canvas.Font;
        return fabricCanvas;
    };
    fabric.StaticCanvas.prototype.createPNGStream = function () {
        return this.nodeCanvas.createPNGStream();
    };
    fabric.StaticCanvas.prototype.createJPEGStream = function (opts) {
        return this.nodeCanvas.createJPEGStream(opts);
    };
    var origSetWidth = fabric.StaticCanvas.prototype.setWidth;
    fabric.StaticCanvas.prototype.setWidth = function (width) {
        origSetWidth.call(this, width);
        this.nodeCanvas.width = width;
        return this;
    };
    if (fabric.Canvas) {
        fabric.Canvas.prototype.setWidth = fabric.StaticCanvas.prototype.setWidth;
    }
    var origSetHeight = fabric.StaticCanvas.prototype.setHeight;
    fabric.StaticCanvas.prototype.setHeight = function (height) {
        origSetHeight.call(this, height);
        this.nodeCanvas.height = height;
        return this;
    };
    if (fabric.Canvas) {
        fabric.Canvas.prototype.setHeight = fabric.StaticCanvas.prototype.setHeight;
    }
})();
(function (root) {
    var trimLeft = /^[\s,#]+/, trimRight = /\s+$/, tinyCounter = 0, math = Math, mathRound = math.round, mathMin = math.min, mathMax = math.max, mathRandom = math.random;
    function tinycolor(color, opts) {
        if (typeof color == "object" && color.hasOwnProperty("_tc_id")) {
            return color;
        }
        var rgb = inputToRGB(color);
        var r = rgb.r, g = rgb.g, b = rgb.b, a = parseFloat(rgb.a), roundA = mathRound(100 * a) / 100, format = rgb.format;
        if (r < 1) {
            r = mathRound(r);
        }
        if (g < 1) {
            g = mathRound(g);
        }
        if (b < 1) {
            b = mathRound(b);
        }
        return {ok:rgb.ok, format:format, _tc_id:tinyCounter++, alpha:a, toHsv:function () {
            var hsv = rgbToHsv(r, g, b);
            return {h:hsv.h * 360, s:hsv.s, v:hsv.v, a:a};
        }, toHsvString:function () {
            var hsv = rgbToHsv(r, g, b);
            var h = mathRound(hsv.h * 360), s = mathRound(hsv.s * 100), v = mathRound(hsv.v * 100);
            return (a == 1) ? "hsv(" + h + ", " + s + "%, " + v + "%)" : "hsva(" + h + ", " + s + "%, " + v + "%, " + roundA + ")";
        }, toHsl:function () {
            var hsl = rgbToHsl(r, g, b);
            return {h:hsl.h * 360, s:hsl.s, l:hsl.l, a:a};
        }, toHslString:function () {
            var hsl = rgbToHsl(r, g, b);
            var h = mathRound(hsl.h * 360), s = mathRound(hsl.s * 100), l = mathRound(hsl.l * 100);
            return (a == 1) ? "hsl(" + h + ", " + s + "%, " + l + "%)" : "hsla(" + h + ", " + s + "%, " + l + "%, " + roundA + ")";
        }, toHex:function () {
            return rgbToHex(r, g, b);
        }, toHexString:function () {
            return "#" + rgbToHex(r, g, b);
        }, toRgb:function () {
            return {r:mathRound(r), g:mathRound(g), b:mathRound(b), a:a};
        }, toRgbString:function () {
            return (a == 1) ? "rgb(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ")" : "rgba(" + mathRound(r) + ", " + mathRound(g) + ", " + mathRound(b) + ", " + roundA + ")";
        }, toName:function () {
            return hexNames[rgbToHex(r, g, b)] || false;
        }, toFilter:function () {
            var hex = rgbToHex(r, g, b);
            var alphaHex = Math.round(parseFloat(a) * 255).toString(16);
            return "progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + alphaHex + hex + ",endColorstr=#" + alphaHex + hex + ")";
        }, toString:function (format) {
            format = format || this.format;
            var formattedString = false;
            if (format === "rgb") {
                formattedString = this.toRgbString();
            }
            if (format === "hex") {
                formattedString = this.toHexString();
            }
            if (format === "name") {
                formattedString = this.toName();
            }
            if (format === "hsl") {
                formattedString = this.toHslString();
            }
            if (format === "hsv") {
                formattedString = this.toHsvString();
            }
            return formattedString || this.toHexString();
        }};
    }
    tinycolor.fromRatio = function (color) {
        if (typeof color == "object") {
            var newColor = {};
            for (var i in color) {
                newColor[i] = convertToPercentage(color[i]);
            }
            color = newColor;
        }
        return tinycolor(color);
    };
    function inputToRGB(color) {
        var rgb = {r:255, g:255, b:255};
        var a = 1;
        var ok = false;
        var format = false;
        if (typeof color == "string") {
            color = stringInputToObject(color);
        }
        if (typeof color == "object") {
            if (color.hasOwnProperty("r") && color.hasOwnProperty("g") && color.hasOwnProperty("b")) {
                rgb = rgbToRgb(color.r, color.g, color.b);
                ok = true;
                format = "rgb";
            } else {
                if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("v")) {
                    color.s = convertToPercentage(color.s);
                    color.v = convertToPercentage(color.v);
                    rgb = hsvToRgb(color.h, color.s, color.v);
                    ok = true;
                    format = "hsv";
                } else {
                    if (color.hasOwnProperty("h") && color.hasOwnProperty("s") && color.hasOwnProperty("l")) {
                        color.s = convertToPercentage(color.s);
                        color.l = convertToPercentage(color.l);
                        var rgb = hslToRgb(color.h, color.s, color.l);
                        ok = true;
                        format = "hsl";
                    }
                }
            }
            if (color.hasOwnProperty("a")) {
                a = color.a;
            }
        }
        return {ok:ok, format:color.format || format, r:mathMin(255, mathMax(rgb.r, 0)), g:mathMin(255, mathMax(rgb.g, 0)), b:mathMin(255, mathMax(rgb.b, 0)), a:a};
    }
    function rgbToRgb(r, g, b) {
        return {r:bound01(r, 255) * 255, g:bound01(g, 255) * 255, b:bound01(b, 255) * 255};
    }
    function rgbToHsl(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }
        return {h:h, s:s, l:l};
    }
    function hslToRgb(h, s, l) {
        var r, g, b;
        h = bound01(h, 360);
        s = bound01(s, 100);
        l = bound01(l, 100);
        function hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        }
        if (s == 0) {
            r = g = b = l;
        } else {
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        return {r:r * 255, g:g * 255, b:b * 255};
    }
    function rgbToHsv(r, g, b) {
        r = bound01(r, 255);
        g = bound01(g, 255);
        b = bound01(b, 255);
        var max = mathMax(r, g, b), min = mathMin(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max == 0 ? 0 : d / max;
        if (max == min) {
            h = 0;
        } else {
            switch (max) {
              case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
              case g:
                h = (b - r) / d + 2;
                break;
              case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }
        return {h:h, s:s, v:v};
    }
    function hsvToRgb(h, s, v) {
        var r, g, b;
        h = bound01(h, 360) * 6;
        s = bound01(s, 100);
        v = bound01(v, 100);
        var i = math.floor(h), f = h - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s), mod = i % 6, r = [v, q, p, p, t, v][mod], g = [t, v, v, q, p, p][mod], b = [p, p, t, v, v, q][mod];
        return {r:r * 255, g:g * 255, b:b * 255};
    }
    function rgbToHex(r, g, b) {
        function pad(c) {
            return c.length == 1 ? "0" + c : "" + c;
        }
        var hex = [pad(mathRound(r).toString(16)), pad(mathRound(g).toString(16)), pad(mathRound(b).toString(16))];
        if (hex[0][0] == hex[0][1] && hex[1][0] == hex[1][1] && hex[2][0] == hex[2][1]) {
            return hex[0][0] + hex[1][0] + hex[2][0];
        }
        return hex.join("");
    }
    tinycolor.equals = function (color1, color2) {
        if (!color1 || !color2) {
            return false;
        }
        return tinycolor(color1).toHex() == tinycolor(color2).toHex();
    };
    tinycolor.random = function () {
        return tinycolor.fromRatio({r:mathRandom(), g:mathRandom(), b:mathRandom()});
    };
    tinycolor.desaturate = function (color, amount) {
        var hsl = tinycolor(color).toHsl();
        hsl.s -= ((amount || 10) / 100);
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    };
    tinycolor.saturate = function (color, amount) {
        var hsl = tinycolor(color).toHsl();
        hsl.s += ((amount || 10) / 100);
        hsl.s = clamp01(hsl.s);
        return tinycolor(hsl);
    };
    tinycolor.greyscale = function (color) {
        return tinycolor.desaturate(color, 100);
    };
    tinycolor.lighten = function (color, amount) {
        var hsl = tinycolor(color).toHsl();
        hsl.l += ((amount || 10) / 100);
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    };
    tinycolor.darken = function (color, amount) {
        var hsl = tinycolor(color).toHsl();
        hsl.l -= ((amount || 10) / 100);
        hsl.l = clamp01(hsl.l);
        return tinycolor(hsl);
    };
    tinycolor.complement = function (color) {
        var hsl = tinycolor(color).toHsl();
        hsl.h = (hsl.h + 180) % 360;
        return tinycolor(hsl);
    };
    tinycolor.triad = function (color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({h:(h + 120) % 360, s:hsl.s, l:hsl.l}), tinycolor({h:(h + 240) % 360, s:hsl.s, l:hsl.l})];
    };
    tinycolor.tetrad = function (color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({h:(h + 90) % 360, s:hsl.s, l:hsl.l}), tinycolor({h:(h + 180) % 360, s:hsl.s, l:hsl.l}), tinycolor({h:(h + 270) % 360, s:hsl.s, l:hsl.l})];
    };
    tinycolor.splitcomplement = function (color) {
        var hsl = tinycolor(color).toHsl();
        var h = hsl.h;
        return [tinycolor(color), tinycolor({h:(h + 72) % 360, s:hsl.s, l:hsl.l}), tinycolor({h:(h + 216) % 360, s:hsl.s, l:hsl.l})];
    };
    tinycolor.analogous = function (color, results, slices) {
        results = results || 6;
        slices = slices || 30;
        var hsl = tinycolor(color).toHsl();
        var part = 360 / slices;
        var ret = [tinycolor(color)];
        for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
            hsl.h = (hsl.h + part) % 360;
            ret.push(tinycolor(hsl));
        }
        return ret;
    };
    tinycolor.monochromatic = function (color, results) {
        results = results || 6;
        var hsv = tinycolor(color).toHsv();
        var h = hsv.h, s = hsv.s, v = hsv.v;
        var ret = [];
        var modification = 1 / results;
        while (results--) {
            ret.push(tinycolor({h:h, s:s, v:v}));
            v = (v + modification) % 1;
        }
        return ret;
    };
    tinycolor.readable = function (color1, color2) {
        var a = tinycolor(color1).toRgb(), b = tinycolor(color2).toRgb();
        return ((b.r - a.r) * (b.r - a.r) + (b.g - a.g) * (b.g - a.g) + (b.b - a.b) * (b.b - a.b)) > 10404;
    };
    var names = tinycolor.names = {aliceblue:"f0f8ff", antiquewhite:"faebd7", aqua:"0ff", aquamarine:"7fffd4", azure:"f0ffff", beige:"f5f5dc", bisque:"ffe4c4", black:"000", blanchedalmond:"ffebcd", blue:"00f", blueviolet:"8a2be2", brown:"a52a2a", burlywood:"deb887", burntsienna:"ea7e5d", cadetblue:"5f9ea0", chartreuse:"7fff00", chocolate:"d2691e", coral:"ff7f50", cornflowerblue:"6495ed", cornsilk:"fff8dc", crimson:"dc143c", cyan:"0ff", darkblue:"00008b", darkcyan:"008b8b", darkgoldenrod:"b8860b", darkgray:"a9a9a9", darkgreen:"006400", darkgrey:"a9a9a9", darkkhaki:"bdb76b", darkmagenta:"8b008b", darkolivegreen:"556b2f", darkorange:"ff8c00", darkorchid:"9932cc", darkred:"8b0000", darksalmon:"e9967a", darkseagreen:"8fbc8f", darkslateblue:"483d8b", darkslategray:"2f4f4f", darkslategrey:"2f4f4f", darkturquoise:"00ced1", darkviolet:"9400d3", deeppink:"ff1493", deepskyblue:"00bfff", dimgray:"696969", dimgrey:"696969", dodgerblue:"1e90ff", firebrick:"b22222", floralwhite:"fffaf0", forestgreen:"228b22", fuchsia:"f0f", gainsboro:"dcdcdc", ghostwhite:"f8f8ff", gold:"ffd700", goldenrod:"daa520", gray:"808080", green:"008000", greenyellow:"adff2f", grey:"808080", honeydew:"f0fff0", hotpink:"ff69b4", indianred:"cd5c5c", indigo:"4b0082", ivory:"fffff0", khaki:"f0e68c", lavender:"e6e6fa", lavenderblush:"fff0f5", lawngreen:"7cfc00", lemonchiffon:"fffacd", lightblue:"add8e6", lightcoral:"f08080", lightcyan:"e0ffff", lightgoldenrodyellow:"fafad2", lightgray:"d3d3d3", lightgreen:"90ee90", lightgrey:"d3d3d3", lightpink:"ffb6c1", lightsalmon:"ffa07a", lightseagreen:"20b2aa", lightskyblue:"87cefa", lightslategray:"789", lightslategrey:"789", lightsteelblue:"b0c4de", lightyellow:"ffffe0", lime:"0f0", limegreen:"32cd32", linen:"faf0e6", magenta:"f0f", maroon:"800000", mediumaquamarine:"66cdaa", mediumblue:"0000cd", mediumorchid:"ba55d3", mediumpurple:"9370db", mediumseagreen:"3cb371", mediumslateblue:"7b68ee", mediumspringgreen:"00fa9a", mediumturquoise:"48d1cc", mediumvioletred:"c71585", midnightblue:"191970", mintcream:"f5fffa", mistyrose:"ffe4e1", moccasin:"ffe4b5", navajowhite:"ffdead", navy:"000080", oldlace:"fdf5e6", olive:"808000", olivedrab:"6b8e23", orange:"ffa500", orangered:"ff4500", orchid:"da70d6", palegoldenrod:"eee8aa", palegreen:"98fb98", paleturquoise:"afeeee", palevioletred:"db7093", papayawhip:"ffefd5", peachpuff:"ffdab9", peru:"cd853f", pink:"ffc0cb", plum:"dda0dd", powderblue:"b0e0e6", purple:"800080", red:"f00", rosybrown:"bc8f8f", royalblue:"4169e1", saddlebrown:"8b4513", salmon:"fa8072", sandybrown:"f4a460", seagreen:"2e8b57", seashell:"fff5ee", sienna:"a0522d", silver:"c0c0c0", skyblue:"87ceeb", slateblue:"6a5acd", slategray:"708090", slategrey:"708090", snow:"fffafa", springgreen:"00ff7f", steelblue:"4682b4", tan:"d2b48c", teal:"008080", thistle:"d8bfd8", tomato:"ff6347", turquoise:"40e0d0", violet:"ee82ee", wheat:"f5deb3", white:"fff", whitesmoke:"f5f5f5", yellow:"ff0", yellowgreen:"9acd32"};
    var hexNames = tinycolor.hexNames = flip(names);
    function flip(o) {
        var flipped = {};
        for (var i in o) {
            if (o.hasOwnProperty(i)) {
                flipped[o[i]] = i;
            }
        }
        return flipped;
    }
    function bound01(n, max) {
        if (isOnePointZero(n)) {
            n = "100%";
        }
        var processPercent = isPercentage(n);
        n = mathMin(max, mathMax(0, parseFloat(n)));
        if (processPercent) {
            n = parseInt(n * max) / 100;
        }
        if ((math.abs(n - max) < 0.000001)) {
            return 1;
        }
        return (n % max) / parseFloat(max);
    }
    function clamp01(val) {
        return mathMin(1, mathMax(0, val));
    }
    function parseHex(val) {
        return parseInt(val, 16);
    }
    function isOnePointZero(n) {
        return typeof n == "string" && n.indexOf(".") != -1 && parseFloat(n) === 1;
    }
    function isPercentage(n) {
        return typeof n === "string" && n.indexOf("%") != -1;
    }
    function convertToPercentage(n) {
        if (n <= 1) {
            n = (n * 100) + "%";
        }
        return n;
    }
    var matchers = (function () {
        var CSS_INTEGER = "[-\\+]?\\d+%?";
        var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
        var CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")";
        var PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        var PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";
        return {rgb:new RegExp("rgb" + PERMISSIVE_MATCH3), rgba:new RegExp("rgba" + PERMISSIVE_MATCH4), hsl:new RegExp("hsl" + PERMISSIVE_MATCH3), hsla:new RegExp("hsla" + PERMISSIVE_MATCH4), hsv:new RegExp("hsv" + PERMISSIVE_MATCH3), hex3:/^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/, hex6:/^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/};
    })();
    function stringInputToObject(color) {
        color = color.replace(trimLeft, "").replace(trimRight, "").toLowerCase();
        var named = false;
        if (names[color]) {
            color = names[color];
            named = true;
        } else {
            if (color == "transparent") {
                return {r:0, g:0, b:0, a:0};
            }
        }
        var match;
        if ((match = matchers.rgb.exec(color))) {
            return {r:match[1], g:match[2], b:match[3]};
        }
        if ((match = matchers.rgba.exec(color))) {
            return {r:match[1], g:match[2], b:match[3], a:match[4]};
        }
        if ((match = matchers.hsl.exec(color))) {
            return {h:match[1], s:match[2], l:match[3]};
        }
        if ((match = matchers.hsla.exec(color))) {
            return {h:match[1], s:match[2], l:match[3], a:match[4]};
        }
        if ((match = matchers.hsv.exec(color))) {
            return {h:match[1], s:match[2], v:match[3]};
        }
        if ((match = matchers.hex6.exec(color))) {
            return {r:parseHex(match[1]), g:parseHex(match[2]), b:parseHex(match[3]), format:named ? "name" : "hex"};
        }
        if ((match = matchers.hex3.exec(color))) {
            return {r:parseHex(match[1] + "" + match[1]), g:parseHex(match[2] + "" + match[2]), b:parseHex(match[3] + "" + match[3]), format:named ? "name" : "hex"};
        }
        return false;
    }
    if (typeof module !== "undefined" && module.exports) {
        module.exports = tinycolor;
    } else {
        root.tinycolor = tinycolor;
    }
})(this);
(function () {
    var root = this;
    var previousUnderscore = root._;
    var breaker = {};
    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;
    var push = ArrayProto.push, slice = ArrayProto.slice, concat = ArrayProto.concat, toString = ObjProto.toString, hasOwnProperty = ObjProto.hasOwnProperty;
    var nativeForEach = ArrayProto.forEach, nativeMap = ArrayProto.map, nativeReduce = ArrayProto.reduce, nativeReduceRight = ArrayProto.reduceRight, nativeFilter = ArrayProto.filter, nativeEvery = ArrayProto.every, nativeSome = ArrayProto.some, nativeIndexOf = ArrayProto.indexOf, nativeLastIndexOf = ArrayProto.lastIndexOf, nativeIsArray = Array.isArray, nativeKeys = Object.keys, nativeBind = FuncProto.bind;
    var _ = function (obj) {
        if (obj instanceof _) {
            return obj;
        }
        if (!(this instanceof _)) {
            return new _(obj);
        }
        this._wrapped = obj;
    };
    if (typeof exports !== "undefined") {
        if (typeof module !== "undefined" && module.exports) {
            exports = module.exports = _;
        }
        exports._ = _;
    } else {
        root._ = _;
    }
    _.VERSION = "1.4.3";
    var each = _.each = _.forEach = function (obj, iterator, context) {
        if (obj == null) {
            return;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else {
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === breaker) {
                        return;
                    }
                }
            } else {
                for (var key in obj) {
                    if (_.has(obj, key)) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) {
                            return;
                        }
                    }
                }
            }
        }
    };
    _.map = _.collect = function (obj, iterator, context) {
        var results = [];
        if (obj == null) {
            return results;
        }
        if (nativeMap && obj.map === nativeMap) {
            return obj.map(iterator, context);
        }
        each(obj, function (value, index, list) {
            results[results.length] = iterator.call(context, value, index, list);
        });
        return results;
    };
    var reduceError = "Reduce of empty array with no initial value";
    _.reduce = _.foldl = _.inject = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) {
            obj = [];
        }
        if (nativeReduce && obj.reduce === nativeReduce) {
            if (context) {
                iterator = _.bind(iterator, context);
            }
            return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
        }
        each(obj, function (value, index, list) {
            if (!initial) {
                memo = value;
                initial = true;
            } else {
                memo = iterator.call(context, memo, value, index, list);
            }
        });
        if (!initial) {
            throw new TypeError(reduceError);
        }
        return memo;
    };
    _.reduceRight = _.foldr = function (obj, iterator, memo, context) {
        var initial = arguments.length > 2;
        if (obj == null) {
            obj = [];
        }
        if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
            if (context) {
                iterator = _.bind(iterator, context);
            }
            return initial ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
        }
        var length = obj.length;
        if (length !== +length) {
            var keys = _.keys(obj);
            length = keys.length;
        }
        each(obj, function (value, index, list) {
            index = keys ? keys[--length] : --length;
            if (!initial) {
                memo = obj[index];
                initial = true;
            } else {
                memo = iterator.call(context, memo, obj[index], index, list);
            }
        });
        if (!initial) {
            throw new TypeError(reduceError);
        }
        return memo;
    };
    _.find = _.detect = function (obj, iterator, context) {
        var result;
        any(obj, function (value, index, list) {
            if (iterator.call(context, value, index, list)) {
                result = value;
                return true;
            }
        });
        return result;
    };
    _.filter = _.select = function (obj, iterator, context) {
        var results = [];
        if (obj == null) {
            return results;
        }
        if (nativeFilter && obj.filter === nativeFilter) {
            return obj.filter(iterator, context);
        }
        each(obj, function (value, index, list) {
            if (iterator.call(context, value, index, list)) {
                results[results.length] = value;
            }
        });
        return results;
    };
    _.reject = function (obj, iterator, context) {
        return _.filter(obj, function (value, index, list) {
            return !iterator.call(context, value, index, list);
        }, context);
    };
    _.every = _.all = function (obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = true;
        if (obj == null) {
            return result;
        }
        if (nativeEvery && obj.every === nativeEvery) {
            return obj.every(iterator, context);
        }
        each(obj, function (value, index, list) {
            if (!(result = result && iterator.call(context, value, index, list))) {
                return breaker;
            }
        });
        return !!result;
    };
    var any = _.some = _.any = function (obj, iterator, context) {
        iterator || (iterator = _.identity);
        var result = false;
        if (obj == null) {
            return result;
        }
        if (nativeSome && obj.some === nativeSome) {
            return obj.some(iterator, context);
        }
        each(obj, function (value, index, list) {
            if (result || (result = iterator.call(context, value, index, list))) {
                return breaker;
            }
        });
        return !!result;
    };
    _.contains = _.include = function (obj, target) {
        if (obj == null) {
            return false;
        }
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
            return obj.indexOf(target) != -1;
        }
        return any(obj, function (value) {
            return value === target;
        });
    };
    _.invoke = function (obj, method) {
        var args = slice.call(arguments, 2);
        return _.map(obj, function (value) {
            return (_.isFunction(method) ? method : value[method]).apply(value, args);
        });
    };
    _.pluck = function (obj, key) {
        return _.map(obj, function (value) {
            return value[key];
        });
    };
    _.where = function (obj, attrs) {
        if (_.isEmpty(attrs)) {
            return [];
        }
        return _.filter(obj, function (value) {
            for (var key in attrs) {
                if (attrs[key] !== value[key]) {
                    return false;
                }
            }
            return true;
        });
    };
    _.max = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.max.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) {
            return -Infinity;
        }
        var result = {computed:-Infinity, value:-Infinity};
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed >= result.computed && (result = {value:value, computed:computed});
        });
        return result.value;
    };
    _.min = function (obj, iterator, context) {
        if (!iterator && _.isArray(obj) && obj[0] === +obj[0] && obj.length < 65535) {
            return Math.min.apply(Math, obj);
        }
        if (!iterator && _.isEmpty(obj)) {
            return Infinity;
        }
        var result = {computed:Infinity, value:Infinity};
        each(obj, function (value, index, list) {
            var computed = iterator ? iterator.call(context, value, index, list) : value;
            computed < result.computed && (result = {value:value, computed:computed});
        });
        return result.value;
    };
    _.shuffle = function (obj) {
        var rand;
        var index = 0;
        var shuffled = [];
        each(obj, function (value) {
            rand = _.random(index++);
            shuffled[index - 1] = shuffled[rand];
            shuffled[rand] = value;
        });
        return shuffled;
    };
    var lookupIterator = function (value) {
        return _.isFunction(value) ? value : function (obj) {
            return obj[value];
        };
    };
    _.sortBy = function (obj, value, context) {
        var iterator = lookupIterator(value);
        return _.pluck(_.map(obj, function (value, index, list) {
            return {value:value, index:index, criteria:iterator.call(context, value, index, list)};
        }).sort(function (left, right) {
            var a = left.criteria;
            var b = right.criteria;
            if (a !== b) {
                if (a > b || a === void 0) {
                    return 1;
                }
                if (a < b || b === void 0) {
                    return -1;
                }
            }
            return left.index < right.index ? -1 : 1;
        }), "value");
    };
    var group = function (obj, value, context, behavior) {
        var result = {};
        var iterator = lookupIterator(value || _.identity);
        each(obj, function (value, index) {
            var key = iterator.call(context, value, index, obj);
            behavior(result, key, value);
        });
        return result;
    };
    _.groupBy = function (obj, value, context) {
        return group(obj, value, context, function (result, key, value) {
            (_.has(result, key) ? result[key] : (result[key] = [])).push(value);
        });
    };
    _.countBy = function (obj, value, context) {
        return group(obj, value, context, function (result, key) {
            if (!_.has(result, key)) {
                result[key] = 0;
            }
            result[key]++;
        });
    };
    _.sortedIndex = function (array, obj, iterator, context) {
        iterator = iterator == null ? _.identity : lookupIterator(iterator);
        var value = iterator.call(context, obj);
        var low = 0, high = array.length;
        while (low < high) {
            var mid = (low + high) >>> 1;
            iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
        }
        return low;
    };
    _.toArray = function (obj) {
        if (!obj) {
            return [];
        }
        if (_.isArray(obj)) {
            return slice.call(obj);
        }
        if (obj.length === +obj.length) {
            return _.map(obj, _.identity);
        }
        return _.values(obj);
    };
    _.size = function (obj) {
        if (obj == null) {
            return 0;
        }
        return (obj.length === +obj.length) ? obj.length : _.keys(obj).length;
    };
    _.first = _.head = _.take = function (array, n, guard) {
        if (array == null) {
            return void 0;
        }
        return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
    };
    _.initial = function (array, n, guard) {
        return slice.call(array, 0, array.length - ((n == null) || guard ? 1 : n));
    };
    _.last = function (array, n, guard) {
        if (array == null) {
            return void 0;
        }
        if ((n != null) && !guard) {
            return slice.call(array, Math.max(array.length - n, 0));
        } else {
            return array[array.length - 1];
        }
    };
    _.rest = _.tail = _.drop = function (array, n, guard) {
        return slice.call(array, (n == null) || guard ? 1 : n);
    };
    _.compact = function (array) {
        return _.filter(array, _.identity);
    };
    var flatten = function (input, shallow, output) {
        each(input, function (value) {
            if (_.isArray(value)) {
                shallow ? push.apply(output, value) : flatten(value, shallow, output);
            } else {
                output.push(value);
            }
        });
        return output;
    };
    _.flatten = function (array, shallow) {
        return flatten(array, shallow, []);
    };
    _.without = function (array) {
        return _.difference(array, slice.call(arguments, 1));
    };
    _.uniq = _.unique = function (array, isSorted, iterator, context) {
        if (_.isFunction(isSorted)) {
            context = iterator;
            iterator = isSorted;
            isSorted = false;
        }
        var initial = iterator ? _.map(array, iterator, context) : array;
        var results = [];
        var seen = [];
        each(initial, function (value, index) {
            if (isSorted ? (!index || seen[seen.length - 1] !== value) : !_.contains(seen, value)) {
                seen.push(value);
                results.push(array[index]);
            }
        });
        return results;
    };
    _.union = function () {
        return _.uniq(concat.apply(ArrayProto, arguments));
    };
    _.intersection = function (array) {
        var rest = slice.call(arguments, 1);
        return _.filter(_.uniq(array), function (item) {
            return _.every(rest, function (other) {
                return _.indexOf(other, item) >= 0;
            });
        });
    };
    _.difference = function (array) {
        var rest = concat.apply(ArrayProto, slice.call(arguments, 1));
        return _.filter(array, function (value) {
            return !_.contains(rest, value);
        });
    };
    _.zip = function () {
        var args = slice.call(arguments);
        var length = _.max(_.pluck(args, "length"));
        var results = new Array(length);
        for (var i = 0; i < length; i++) {
            results[i] = _.pluck(args, "" + i);
        }
        return results;
    };
    _.object = function (list, values) {
        if (list == null) {
            return {};
        }
        var result = {};
        for (var i = 0, l = list.length; i < l; i++) {
            if (values) {
                result[list[i]] = values[i];
            } else {
                result[list[i][0]] = list[i][1];
            }
        }
        return result;
    };
    _.indexOf = function (array, item, isSorted) {
        if (array == null) {
            return -1;
        }
        var i = 0, l = array.length;
        if (isSorted) {
            if (typeof isSorted == "number") {
                i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
            } else {
                i = _.sortedIndex(array, item);
                return array[i] === item ? i : -1;
            }
        }
        if (nativeIndexOf && array.indexOf === nativeIndexOf) {
            return array.indexOf(item, isSorted);
        }
        for (; i < l; i++) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    };
    _.lastIndexOf = function (array, item, from) {
        if (array == null) {
            return -1;
        }
        var hasIndex = from != null;
        if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) {
            return hasIndex ? array.lastIndexOf(item, from) : array.lastIndexOf(item);
        }
        var i = (hasIndex ? from : array.length);
        while (i--) {
            if (array[i] === item) {
                return i;
            }
        }
        return -1;
    };
    _.range = function (start, stop, step) {
        if (arguments.length <= 1) {
            stop = start || 0;
            start = 0;
        }
        step = arguments[2] || 1;
        var len = Math.max(Math.ceil((stop - start) / step), 0);
        var idx = 0;
        var range = new Array(len);
        while (idx < len) {
            range[idx++] = start;
            start += step;
        }
        return range;
    };
    var ctor = function () {
    };
    _.bind = function (func, context) {
        var args, bound;
        if (func.bind === nativeBind && nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        if (!_.isFunction(func)) {
            throw new TypeError;
        }
        args = slice.call(arguments, 2);
        return bound = function () {
            if (!(this instanceof bound)) {
                return func.apply(context, args.concat(slice.call(arguments)));
            }
            ctor.prototype = func.prototype;
            var self = new ctor;
            ctor.prototype = null;
            var result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) {
                return result;
            }
            return self;
        };
    };
    _.bindAll = function (obj) {
        var funcs = slice.call(arguments, 1);
        if (funcs.length == 0) {
            funcs = _.functions(obj);
        }
        each(funcs, function (f) {
            obj[f] = _.bind(obj[f], obj);
        });
        return obj;
    };
    _.memoize = function (func, hasher) {
        var memo = {};
        hasher || (hasher = _.identity);
        return function () {
            var key = hasher.apply(this, arguments);
            return _.has(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
        };
    };
    _.delay = function (func, wait) {
        var args = slice.call(arguments, 2);
        return setTimeout(function () {
            return func.apply(null, args);
        }, wait);
    };
    _.defer = function (func) {
        return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
    };
    _.throttle = function (func, wait) {
        var context, args, timeout, result;
        var previous = 0;
        var later = function () {
            previous = new Date;
            timeout = null;
            result = func.apply(context, args);
        };
        return function () {
            var now = new Date;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0) {
                clearTimeout(timeout);
                timeout = null;
                previous = now;
                result = func.apply(context, args);
            } else {
                if (!timeout) {
                    timeout = setTimeout(later, remaining);
                }
            }
            return result;
        };
    };
    _.debounce = function (func, wait, immediate) {
        var timeout, result;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
            }
            return result;
        };
    };
    _.once = function (func) {
        var ran = false, memo;
        return function () {
            if (ran) {
                return memo;
            }
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };
    _.wrap = function (func, wrapper) {
        return function () {
            var args = [func];
            push.apply(args, arguments);
            return wrapper.apply(this, args);
        };
    };
    _.compose = function () {
        var funcs = arguments;
        return function () {
            var args = arguments;
            for (var i = funcs.length - 1; i >= 0; i--) {
                args = [funcs[i].apply(this, args)];
            }
            return args[0];
        };
    };
    _.after = function (times, func) {
        if (times <= 0) {
            return func();
        }
        return function () {
            if (--times < 1) {
                return func.apply(this, arguments);
            }
        };
    };
    _.keys = nativeKeys || function (obj) {
        if (obj !== Object(obj)) {
            throw new TypeError("Invalid object");
        }
        var keys = [];
        for (var key in obj) {
            if (_.has(obj, key)) {
                keys[keys.length] = key;
            }
        }
        return keys;
    };
    _.values = function (obj) {
        var values = [];
        for (var key in obj) {
            if (_.has(obj, key)) {
                values.push(obj[key]);
            }
        }
        return values;
    };
    _.pairs = function (obj) {
        var pairs = [];
        for (var key in obj) {
            if (_.has(obj, key)) {
                pairs.push([key, obj[key]]);
            }
        }
        return pairs;
    };
    _.invert = function (obj) {
        var result = {};
        for (var key in obj) {
            if (_.has(obj, key)) {
                result[obj[key]] = key;
            }
        }
        return result;
    };
    _.functions = _.methods = function (obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) {
                names.push(key);
            }
        }
        return names.sort();
    };
    _.extend = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };
    _.pick = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        each(keys, function (key) {
            if (key in obj) {
                copy[key] = obj[key];
            }
        });
        return copy;
    };
    _.omit = function (obj) {
        var copy = {};
        var keys = concat.apply(ArrayProto, slice.call(arguments, 1));
        for (var key in obj) {
            if (!_.contains(keys, key)) {
                copy[key] = obj[key];
            }
        }
        return copy;
    };
    _.defaults = function (obj) {
        each(slice.call(arguments, 1), function (source) {
            if (source) {
                for (var prop in source) {
                    if (obj[prop] == null) {
                        obj[prop] = source[prop];
                    }
                }
            }
        });
        return obj;
    };
    _.clone = function (obj) {
        if (!_.isObject(obj)) {
            return obj;
        }
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };
    _.tap = function (obj, interceptor) {
        interceptor(obj);
        return obj;
    };
    var eq = function (a, b, aStack, bStack) {
        if (a === b) {
            return a !== 0 || 1 / a == 1 / b;
        }
        if (a == null || b == null) {
            return a === b;
        }
        if (a instanceof _) {
            a = a._wrapped;
        }
        if (b instanceof _) {
            b = b._wrapped;
        }
        var className = toString.call(a);
        if (className != toString.call(b)) {
            return false;
        }
        switch (className) {
          case "[object String]":
            return a == String(b);
          case "[object Number]":
            return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
          case "[object Date]":
          case "[object Boolean]":
            return +a == +b;
          case "[object RegExp]":
            return a.source == b.source && a.global == b.global && a.multiline == b.multiline && a.ignoreCase == b.ignoreCase;
        }
        if (typeof a != "object" || typeof b != "object") {
            return false;
        }
        var length = aStack.length;
        while (length--) {
            if (aStack[length] == a) {
                return bStack[length] == b;
            }
        }
        aStack.push(a);
        bStack.push(b);
        var size = 0, result = true;
        if (className == "[object Array]") {
            size = a.length;
            result = size == b.length;
            if (result) {
                while (size--) {
                    if (!(result = eq(a[size], b[size], aStack, bStack))) {
                        break;
                    }
                }
            }
        } else {
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && (aCtor instanceof aCtor) && _.isFunction(bCtor) && (bCtor instanceof bCtor))) {
                return false;
            }
            for (var key in a) {
                if (_.has(a, key)) {
                    size++;
                    if (!(result = _.has(b, key) && eq(a[key], b[key], aStack, bStack))) {
                        break;
                    }
                }
            }
            if (result) {
                for (key in b) {
                    if (_.has(b, key) && !(size--)) {
                        break;
                    }
                }
                result = !size;
            }
        }
        aStack.pop();
        bStack.pop();
        return result;
    };
    _.isEqual = function (a, b) {
        return eq(a, b, [], []);
    };
    _.isEmpty = function (obj) {
        if (obj == null) {
            return true;
        }
        if (_.isArray(obj) || _.isString(obj)) {
            return obj.length === 0;
        }
        for (var key in obj) {
            if (_.has(obj, key)) {
                return false;
            }
        }
        return true;
    };
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) == "[object Array]";
    };
    _.isObject = function (obj) {
        return obj === Object(obj);
    };
    each(["Arguments", "Function", "String", "Number", "Date", "RegExp"], function (name) {
        _["is" + name] = function (obj) {
            return toString.call(obj) == "[object " + name + "]";
        };
    });
    if (!_.isArguments(arguments)) {
        _.isArguments = function (obj) {
            return !!(obj && _.has(obj, "callee"));
        };
    }
    if (typeof (/./) !== "function") {
        _.isFunction = function (obj) {
            return typeof obj === "function";
        };
    }
    _.isFinite = function (obj) {
        return isFinite(obj) && !isNaN(parseFloat(obj));
    };
    _.isNaN = function (obj) {
        return _.isNumber(obj) && obj != +obj;
    };
    _.isBoolean = function (obj) {
        return obj === true || obj === false || toString.call(obj) == "[object Boolean]";
    };
    _.isNull = function (obj) {
        return obj === null;
    };
    _.isUndefined = function (obj) {
        return obj === void 0;
    };
    _.has = function (obj, key) {
        return hasOwnProperty.call(obj, key);
    };
    _.noConflict = function () {
        root._ = previousUnderscore;
        return this;
    };
    _.identity = function (value) {
        return value;
    };
    _.times = function (n, iterator, context) {
        var accum = Array(n);
        for (var i = 0; i < n; i++) {
            accum[i] = iterator.call(context, i);
        }
        return accum;
    };
    _.random = function (min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        return min + (0 | Math.random() * (max - min + 1));
    };
    var entityMap = {escape:{"&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;", "'":"&#x27;", "/":"&#x2F;"}};
    entityMap.unescape = _.invert(entityMap.escape);
    var entityRegexes = {escape:new RegExp("[" + _.keys(entityMap.escape).join("") + "]", "g"), unescape:new RegExp("(" + _.keys(entityMap.unescape).join("|") + ")", "g")};
    _.each(["escape", "unescape"], function (method) {
        _[method] = function (string) {
            if (string == null) {
                return "";
            }
            return ("" + string).replace(entityRegexes[method], function (match) {
                return entityMap[method][match];
            });
        };
    });
    _.result = function (object, property) {
        if (object == null) {
            return null;
        }
        var value = object[property];
        return _.isFunction(value) ? value.call(object) : value;
    };
    _.mixin = function (obj) {
        each(_.functions(obj), function (name) {
            var func = _[name] = obj[name];
            _.prototype[name] = function () {
                var args = [this._wrapped];
                push.apply(args, arguments);
                return result.call(this, func.apply(_, args));
            };
        });
    };
    var idCounter = 0;
    _.uniqueId = function (prefix) {
        var id = "" + ++idCounter;
        return prefix ? prefix + id : id;
    };
    _.templateSettings = {evaluate:/<%([\s\S]+?)%>/g, interpolate:/<%=([\s\S]+?)%>/g, escape:/<%-([\s\S]+?)%>/g};
    var noMatch = /(.)^/;
    var escapes = {"'":"'", "\\":"\\", "\r":"r", "\n":"n", "\t":"t", "\u2028":"u2028", "\u2029":"u2029"};
    var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
    _.template = function (text, data, settings) {
        settings = _.defaults({}, settings, _.templateSettings);
        var matcher = new RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join("|") + "|$", "g");
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
            source += text.slice(index, offset).replace(escaper, function (match) {
                return "\\" + escapes[match];
            });
            if (escape) {
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            }
            if (interpolate) {
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            }
            if (evaluate) {
                source += "';\n" + evaluate + "\n__p+='";
            }
            index = offset + match.length;
            return match;
        });
        source += "';\n";
        if (!settings.variable) {
            source = "with(obj||{}){\n" + source + "}\n";
        }
        source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";
        try {
            var render = new Function(settings.variable || "obj", "_", source);
        }
        catch (e) {
            e.source = source;
            throw e;
        }
        if (data) {
            return render(data, _);
        }
        var template = function (data) {
            return render.call(this, data, _);
        };
        template.source = "function(" + (settings.variable || "obj") + "){\n" + source + "}";
        return template;
    };
    _.chain = function (obj) {
        return _(obj).chain();
    };
    var result = function (obj) {
        return this._chain ? _(obj).chain() : obj;
    };
    _.mixin(_);
    each(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name == "shift" || name == "splice") && obj.length === 0) {
                delete obj[0];
            }
            return result.call(this, obj);
        };
    });
    each(["concat", "join", "slice"], function (name) {
        var method = ArrayProto[name];
        _.prototype[name] = function () {
            return result.call(this, method.apply(this._wrapped, arguments));
        };
    });
    _.extend(_.prototype, {chain:function () {
        this._chain = true;
        return this;
    }, value:function () {
        return this._wrapped;
    }});
}).call(this);
(function () {
    var Events, Log, Module, Themeable, isArray, isBlank, makeArray, moduleKeywords, xchart, _ref, __slice = [].slice, __indexOf = [].indexOf || function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (i in this && this[i] === item) {
                return i;
            }
        }
        return -1;
    }, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Events = {bind:function (ev, callback) {
        var calls, evs, name, _i, _len;
        evs = ev.split(" ");
        calls = this.hasOwnProperty("_callbacks") && this._callbacks || (this._callbacks = {});
        for (_i = 0, _len = evs.length; _i < _len; _i++) {
            name = evs[_i];
            calls[name] || (calls[name] = []);
            calls[name].push(callback);
        }
        return this;
    }, one:function (ev, callback) {
        return this.bind(ev, function () {
            this.unbind(ev, arguments.callee);
            return callback.apply(this, arguments);
        });
    }, trigger:function () {
        var args, callback, ev, list, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        ev = args.shift();
        list = this.hasOwnProperty("_callbacks") && ((_ref = this._callbacks) != null ? _ref[ev] : void 0);
        if (!list) {
            return;
        }
        for (_i = 0, _len = list.length; _i < _len; _i++) {
            callback = list[_i];
            if (callback.apply(this, args) === false) {
                break;
            }
        }
        return true;
    }, unbind:function (ev, callback) {
        var cb, i, list, _i, _len, _ref;
        if (!ev) {
            this._callbacks = {};
            return this;
        }
        list = (_ref = this._callbacks) != null ? _ref[ev] : void 0;
        if (!list) {
            return this;
        }
        if (!callback) {
            delete this._callbacks[ev];
            return this;
        }
        for (i = _i = 0, _len = list.length; _i < _len; i = ++_i) {
            cb = list[i];
            if (!(cb === callback)) {
                continue;
            }
            list = list.slice();
            list.splice(i, 1);
            this._callbacks[ev] = list;
            break;
        }
        return this;
    }};
    Log = {trace:true, logPrefix:"(App)", log:function () {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if (!this.trace) {
            return;
        }
        if (this.logPrefix) {
            args.unshift(this.logPrefix);
        }
        if (typeof console !== "undefined" && console !== null) {
            if (typeof console.log === "function") {
                console.log.apply(console, args);
            }
        }
        return this;
    }};
    moduleKeywords = ["included", "extended"];
    Module = (function () {
        Module.prototype.uninheritProperties = [];
        Module.include = function (obj) {
            var key, value, _ref;
            if (!obj) {
                throw "include(obj) requires obj";
            }
            for (key in obj) {
                value = obj[key];
                if (__indexOf.call(moduleKeywords, key) < 0) {
                    this.prototype[key] = value;
                }
            }
            if ((_ref = obj.included) != null) {
                _ref.apply(this);
            }
            return this;
        };
        Module.extend = function (obj) {
            var key, value, _ref;
            if (!obj) {
                throw "extend(obj) requires obj";
            }
            for (key in obj) {
                value = obj[key];
                if (__indexOf.call(moduleKeywords, key) < 0) {
                    this[key] = value;
                }
            }
            if ((_ref = obj.extended) != null) {
                _ref.apply(this);
            }
            return this;
        };
        Module.proxy = function (func) {
            var _this = this;
            return function () {
                return func.apply(_this, arguments);
            };
        };
        Module.prototype.proxy = function (func) {
            var _this = this;
            return function () {
                return func.apply(_this, arguments);
            };
        };
        function Module(options) {
            this.props = {};
            if (typeof this.init === "function") {
                this.init.apply(this, arguments);
            }
            if (options) {
                this.set(options);
            }
        }
        Module.prototype.get = function (prop) {
            var key, result, target, value;
            if (this.uninheritProperties.indexOf(prop) !== -1) {
                return this[prop];
            }
            result = this.props[prop] || this[prop];
            if (typeof result === "object" && this[prop] !== void 0) {
                target = {};
                for (key in result) {
                    value = result[key];
                    target[key] = value;
                }
                result = xchart.merge(this[prop], target);
            }
            return result;
        };
        Module.prototype.set = function (prop, value) {
            var key, _results;
            if (typeof prop === "object") {
                _results = [];
                for (key in prop) {
                    value = prop[key];
                    if (this.uninheritProperties.indexOf(key) !== -1) {
                        _results.push(this[key] = value);
                    } else {
                        _results.push(this.props[key] = value);
                    }
                }
                return _results;
            } else {
                if (this.uninheritProperties.indexOf(prop) !== -1) {
                    return this[prop] = value;
                } else {
                    return this.props[prop] = value;
                }
            }
        };
        return Module;
    })();
    Themeable = (function (_super) {
        __extends(Themeable, _super);
        function Themeable() {
            _ref = Themeable.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Themeable.prototype.enableRedrawDelay = true;
        Themeable.prototype.themePath = "";
        Themeable.prototype.set = function (prop, value) {
            Themeable.__super__.set.apply(this, arguments);
            if (this.enableRedrawDelay && this.chart && this.chart.rendered && !this.chart.redrawing) {
                return this.chart.redrawDelay();
            }
        };
        Themeable.prototype.get = function (prop) {
            var key, result, target, theme, themeConfig, value;
            if (this.uninheritProperties.indexOf(prop) !== -1) {
                return this[prop];
            }
            result = this.props[prop];
            if (this.chart && this.themePath) {
                theme = this.chart.getThemeConfig();
                themeConfig = theme[this.themePath][prop];
                if (result === void 0) {
                    result = themeConfig || this[prop];
                } else {
                    if (typeof result === "object" && themeConfig !== void 0) {
                        target = {};
                        for (key in result) {
                            value = result[key];
                            target[key] = value;
                        }
                        result = xchart.merge(themeConfig, target);
                    }
                }
            }
            return result;
        };
        return Themeable;
    })(Module);
    isArray = function (value) {
        return Object.prototype.toString.call(value) === "[object Array]";
    };
    isBlank = function (value) {
        var key;
        if (!value) {
            return true;
        }
        for (key in value) {
            return false;
        }
        return true;
    };
    makeArray = function (args) {
        return Array.prototype.slice.call(args, 0);
    };
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function (item) {
            var value, _i, _len;
            for (_i = 0, _len = this.length; _i < _len; _i++) {
                value = this[_i];
                if (value === item) {
                    return i;
                }
            }
            return -1;
        };
    }
    xchart = this.xchart = {};
    xchart.merge = function (source, target) {
        var prop, value;
        if (source && target) {
            for (prop in source) {
                value = source[prop];
                if (target[prop] === void 0) {
                    target[prop] = value;
                }
            }
        }
        return target;
    };
    xchart.isArray = isArray;
    xchart.isBlank = isBlank;
    xchart.Events = Events;
    xchart.Log = Log;
    xchart.Module = Module;
    xchart.Themeable = Themeable;
}).call(this);
(function () {
    var InteractiveMethods, ProtoProxy, addListener, extend, getPointer, isValidRadius, map, polarToCartesian, prop, removeListener, requestAnimFrame, toRadians, _ref, _requestAnimFrame, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    ProtoProxy = function () {
    };
    extend = fabric.util.object.extend;
    getPointer = fabric.util.getPointer;
    addListener = fabric.util.addListener;
    removeListener = fabric.util.removeListener;
    fabric.Canvas = function (el, options) {
        options || (options = {});
        this.el = el;
        this._initStatic(el, options);
        this._initInteractive();
        this._createCacheCanvas();
        return fabric.Canvas.activeInstance = this;
    };
    ProtoProxy.prototype = fabric.StaticCanvas.prototype;
    fabric.Canvas.prototype = new ProtoProxy();
    InteractiveMethods = {interactive:true, containerClass:"canvas-container", perPixelTargetFind:false, targetFindTolerance:0, _initInteractive:function () {
        this._initWrapperElement();
        this._createUpperCanvas();
        this._initEvents();
        return this.calcOffset();
    }, _initEvents:function () {
        var _this;
        _this = this;
        this._onMouseDown = function (e) {
            _this.__onMouseDown(e);
            addListener(fabric.document, "mouseup", _this._onMouseUp);
            fabric.isTouchSupported && addListener(fabric.document, "touchend", _this._onMouseUp);
            addListener(fabric.document, "mousemove", _this._onMouseMove);
            fabric.isTouchSupported && addListener(fabric.document, "touchmove", _this._onMouseMove);
            removeListener(_this.upperCanvasEl, "mousemove", _this._onMouseMove);
            return fabric.isTouchSupported && removeListener(_this.upperCanvasEl, "touchmove", _this._onMouseMove);
        };
        this._onMouseUp = function (e) {
            _this.__onMouseUp(e);
            removeListener(fabric.document, "mouseup", _this._onMouseUp);
            fabric.isTouchSupported && removeListener(fabric.document, "touchend", _this._onMouseUp);
            removeListener(fabric.document, "mousemove", _this._onMouseMove);
            fabric.isTouchSupported && removeListener(fabric.document, "touchmove", _this._onMouseMove);
            addListener(_this.upperCanvasEl, "mousemove", _this._onMouseMove);
            return fabric.isTouchSupported && addListener(_this.upperCanvasEl, "touchmove", _this._onMouseMove);
        };
        this._onMouseMove = function (e) {
            e.preventDefault && e.preventDefault();
            return _this.__onMouseMove(e);
        };
        this._onResize = function () {
            return _this.calcOffset();
        };
        addListener(fabric.window, "resize", this._onResize);
        if (fabric.isTouchSupported) {
            addListener(this.upperCanvasEl, "touchstart", this._onMouseDown);
            return addListener(this.upperCanvasEl, "touchmove", this._onMouseMove);
        } else {
            addListener(this.upperCanvasEl, "mousedown", this._onMouseDown);
            return addListener(this.upperCanvasEl, "mousemove", this._onMouseMove);
        }
    }, __onMouseUp:function (e) {
        var target, targetAtMouse;
        this.fixEvent(e);
        target = this._mouseTarget;
        if (target) {
            target.fire("mouseup", e);
        }
        targetAtMouse = this.findTarget(e);
        if (targetAtMouse && targetAtMouse === target) {
            return target.fire("click", e);
        }
    }, __onMouseDown:function (e) {
        var isLeftClick, target;
        this.fixEvent(e);
        isLeftClick = ("which" in e ? e.which === 1 : e.button === 1);
        if (!isLeftClick && !fabric.isTouchSupported) {
            return;
        }
        target = this.findTarget(e);
        if (target) {
            this._mouseTarget = target;
            return target.fire("mousedown", e);
        }
    }, getMousePosition:function () {
        return this.mousePosition;
    }, fixEvent:function (event) {
        var canvasPosition, touchPoint;
        if (event.pageX === void 0) {
            event.pageX = event.clientX + document.body.scrollTop;
            event.pageY = event.clientY + document.body.scrollLeft;
        }
        canvasPosition = fabric.util.getElementOffset(this.lowerCanvasEl);
        if (event.touches && event.changedTouches) {
            touchPoint = event.touches[0] || event.changedTouches[0];
            if (touchPoint) {
                event.left = touchPoint.pageX - canvasPosition.left;
                return event.top = touchPoint.pageY - canvasPosition.top;
            }
        } else {
            event.left = event.pageX - canvasPosition.left;
            return event.top = event.pageY - canvasPosition.top;
        }
    }, __onMouseMove:function (e) {
        var target;
        this.fixEvent(e);
        target = this.findTarget(e);
        this.mousePosition = {left:e.pageX, top:e.pageY};
        if (target) {
            if (this._hoveredTarget !== target) {
                if (this._hoveredTarget) {
                    this._hoveredTarget.fire("mouseleave", e);
                }
                target.fire("mouseenter", e);
                this._hoveredTarget = target;
            }
            return target && target.fire("mousemove", e);
        } else {
            if (this._hoveredTarget) {
                this._hoveredTarget.fire("mouseleave", e);
                return this._hoveredTarget = null;
            }
        }
    }, containsPoint:function (e, target) {
        var pointer, xy;
        pointer = this.getPointer(e);
        xy = this._normalizePointer(target, pointer);
        return target.containsPoint(xy) || target._findTargetCorner(e, this._offset);
    }, _normalizePointer:function (object, pointer) {
        var activeGroup, isObjectInGroup, x, y;
        activeGroup = this.getActiveGroup();
        x = pointer.x;
        y = pointer.y;
        isObjectInGroup = activeGroup && object.type !== "group" && activeGroup.contains(object);
        if (isObjectInGroup) {
            x -= activeGroup.left;
            y -= activeGroup.top;
        }
        return {x:x, y:y};
    }, _isTargetTransparent:function (target, x, y) {
        var cacheContext, hasBorders, i, imageData, isTransparent, temp, transparentCorners;
        cacheContext = this.contextCache;
        hasBorders = target.hasBorders;
        transparentCorners = target.transparentCorners;
        target.hasBorders = target.transparentCorners = false;
        this._draw(cacheContext, target);
        target.hasBorders = hasBorders;
        target.transparentCorners = transparentCorners;
        if (this.targetFindTolerance > 0) {
            if (x > this.targetFindTolerance) {
                x -= this.targetFindTolerance;
            } else {
                x = 0;
            }
            if (y > this.targetFindTolerance) {
                y -= this.targetFindTolerance;
            } else {
                y = 0;
            }
        }
        isTransparent = true;
        imageData = cacheContext.getImageData(x, y, (this.targetFindTolerance * 2) || 1, (this.targetFindTolerance * 2) || 1);
        i = 3;
        while (i < imageData.data.length) {
            temp = imageData.data[i];
            isTransparent = temp <= 0;
            if (isTransparent === false) {
                break;
            }
            i += 4;
        }
        imageData = null;
        this.clearContext(cacheContext);
        return isTransparent;
    }, _setCursor:function (value) {
        return this.upperCanvasEl.style.cursor = value;
    }, _drawSelection:function () {
    }, findTarget:function (e, skipGroup) {
        var i, isTransparent, j, len, object, pointer, possibleTargets, target;
        i = void 0;
        isTransparent = void 0;
        j = void 0;
        len = void 0;
        object = void 0;
        pointer = void 0;
        possibleTargets = void 0;
        target = void 0;
        target = void 0;
        pointer = this.getPointer(e);
        if (this.controlsAboveOverlay && this.lastRenderedObjectWithControlsAboveOverlay && this.containsPoint(e, this.lastRenderedObjectWithControlsAboveOverlay)) {
            target = this.lastRenderedObjectWithControlsAboveOverlay;
            return target;
        }
        possibleTargets = [];
        i = this._objects.length;
        while (i--) {
            object = this._objects[i];
            if (object && this.containsPoint(e, object)) {
                if (this.perPixelTargetFind || object.perPixelTargetFind) {
                    possibleTargets[possibleTargets.length] = object;
                } else {
                    target = object;
                    this.relatedTarget = target;
                    break;
                }
            }
        }
        j = 0;
        len = possibleTargets.length;
        while (j < len) {
            pointer = this.getPointer(e);
            isTransparent = this._isTargetTransparent(possibleTargets[j], pointer.x, pointer.y);
            if (!isTransparent) {
                target = possibleTargets[j];
                this.relatedTarget = target;
                break;
            }
            j++;
        }
        if (target && target.selectable) {
            return target;
        }
    }, getPointer:function (e) {
        var pointer;
        pointer = getPointer(e, this.upperCanvasEl);
        this._offset = fabric.util.getElementOffset(this.lowerCanvasEl);
        return {x:pointer.x - this._offset.left, y:pointer.y - this._offset.top};
    }, _createUpperCanvas:function () {
        this.upperCanvasEl = this._createCanvasElement();
        this.upperCanvasEl.className = "upper-canvas";
        this.wrapperEl.appendChild(this.upperCanvasEl);
        this._applyCanvasStyle(this.upperCanvasEl);
        return this.contextTop = this.upperCanvasEl.getContext("2d");
    }, _createCacheCanvas:function () {
        this.cacheCanvasEl = this._createCanvasElement();
        this.cacheCanvasEl.setAttribute("width", this.width);
        this.cacheCanvasEl.setAttribute("height", this.height);
        return this.contextCache = this.cacheCanvasEl.getContext("2d");
    }, _initWrapperElement:function () {
        this.wrapperEl = fabric.util.wrapElement(this.lowerCanvasEl, "div", {"class":this.containerClass});
        fabric.util.setStyle(this.wrapperEl, {width:this.width + "px", height:this.height + "px", position:"relative"});
        return fabric.util.makeElementUnselectable(this.wrapperEl);
    }, _initOptions:function (options) {
        var prop;
        for (prop in options) {
            this[prop] = options[prop];
        }
        this.width = parseInt(this.lowerCanvasEl.style.width, 10) || 0;
        this.height = parseInt(this.lowerCanvasEl.style.height, 10) || 0;
        if (!this.lowerCanvasEl.style) {
            return;
        }
        this.lowerCanvasEl.style.width = this.width + "px";
        return this.lowerCanvasEl.style.height = this.height + "px";
    }, _setDimension:function (prop, value) {
        var scale, _ref;
        scale = (_ref = window.devicePixelRatio) != null ? _ref : 1;
        this.lowerCanvasEl[prop] = value * scale;
        this.lowerCanvasEl.getContext("2d").scale(scale, scale);
        this.lowerCanvasEl.style[prop] = value + "px";
        if (this.upperCanvasEl) {
            this.upperCanvasEl[prop] = value * scale;
            this.upperCanvasEl.getContext("2d").scale(scale, scale);
            this.upperCanvasEl.style[prop] = value + "px";
        }
        if (this.cacheCanvasEl) {
            this.cacheCanvasEl[prop] = value * scale;
            this.cacheCanvasEl.getContext("2d").scale(scale, scale);
        }
        if (this.wrapperEl) {
            this.wrapperEl.style[prop] = value + "px";
        }
        this[prop] = value;
        this.calcOffset();
        this.renderAll();
        return this;
    }, _applyCanvasStyle:function (element) {
        var height, scale, width, _ref, _ref1, _ref2, _ref3, _ref4;
        width = (_ref = (_ref1 = this.getWidth()) != null ? _ref1 : element.setWidth) != null ? _ref : element.width;
        height = (_ref2 = (_ref3 = this.getHeight()) != null ? _ref3 : element.setHeight) != null ? _ref2 : element.height;
        fabric.util.setStyle(element, {position:"absolute", width:width + "px", height:height + "px", left:0, top:0});
        scale = (_ref4 = window.devicePixelRatio) != null ? _ref4 : 1;
        element.setWidth = width;
        element.setHeight = height;
        element.width = width * scale;
        element.height = height * scale;
        element.getContext("2d").scale(scale, scale);
        return fabric.util.makeElementUnselectable(element);
    }};
    fabric.Canvas.prototype.toString = fabric.StaticCanvas.prototype.toString;
    extend(fabric.Canvas.prototype, InteractiveMethods);
    for (prop in fabric.StaticCanvas) {
        if (prop !== "prototype") {
            fabric.Canvas[prop] = fabric.StaticCanvas[prop];
        }
    }
    if (fabric.isTouchSupported) {
        fabric.Canvas.prototype._setCursorFromEvent = function () {
        };
    }
    fabric.Object.prototype.fire = function (eventName, options) {
        var listener, listeners, _i, _len, _results;
        if (this.__eventListeners == null) {
            this.__eventListeners = {};
        }
        listeners = this.__eventListeners[eventName];
        if (!listeners) {
            return;
        }
        _results = [];
        for (_i = 0, _len = listeners.length; _i < _len; _i++) {
            listener = listeners[_i];
            _results.push(listener.call(this, options || {}));
        }
        return _results;
    };
    _requestAnimFrame = fabric.window.requestAnimationFrame || fabric.window.webkitRequestAnimationFrame || fabric.window.mozRequestAnimationFrame || fabric.window.oRequestAnimationFrame || fabric.window.msRequestAnimationFrame || function (callback) {
        return fabric.window.setTimeout(callback, 1000 / 60);
    };
    requestAnimFrame = function () {
        return _requestAnimFrame.apply(fabric.window, arguments);
    };
    fabric.util.anim = function (props, options) {
        var abort, duration, easing, finish, onChange, start, tick, time;
        options || (options = {});
        start = +new Date();
        duration = options.duration || 500;
        finish = start + duration;
        time = void 0;
        onChange = options.onChange || function () {
        };
        abort = options.abort || function () {
            return false;
        };
        easing = options.easing || function (t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        };
        options.onStart && options.onStart();
        return (tick = function () {
            var byValue, changes, currentTime, endValue, startValue, value;
            time = +new Date();
            currentTime = (time > finish ? duration : time - start);
            changes = {};
            for (prop in props) {
                value = props[prop];
                startValue = ("from" in value ? value.from : 0);
                endValue = ("to" in value ? value.to : 100);
                byValue = value.by || endValue - startValue;
                changes[prop] = easing(currentTime, startValue, byValue, duration);
            }
            onChange(changes);
            if (time > finish || abort()) {
                options.onComplete && options.onComplete();
                return;
            }
            return requestAnimFrame(tick);
        })();
    };
    fabric.Object.prototype.anim = function (props, options) {
        var obj, targets, to, value, _ref;
        obj = this;
        options || (options = {});
        targets = {};
        for (prop in props) {
            value = props[prop];
            if (typeof value === "number") {
                value = {to:value};
            }
            to = /[+\-]/.test((value + "").charAt(0)) ? this.get(prop) + parseFloat(value) : value.to;
            targets[prop] = {from:(_ref = value.from) != null ? _ref : this.get(prop), to:to, by:value.by};
            if (xchart.excanvas) {
                this.set(prop, to);
            }
        }
        if (xchart.excanvas) {
            return;
        }
        fabric.util.anim(targets, {easing:options.easing, duration:options.duration, onChange:function (props) {
            for (prop in props) {
                value = props[prop];
                obj.set(prop, value);
            }
            return options.onChange && options.onChange();
        }, onComplete:function () {
            obj.setCoords();
            return options.onComplete && options.onComplete();
        }});
        return this;
    };
    fabric.Text.prototype._renderViaNative = function (ctx) {
        var textLines;
        this.transform(ctx, fabric.isLikelyNode);
        this._setTextStyles(ctx);
        textLines = this.text ? ("" + this.text).split(/\r?\n/) : [];
        this.width = this._getTextWidth(ctx, textLines);
        this.height = this._getTextHeight(ctx, textLines);
        this.clipTo && fabric.util.clipContext(this, ctx);
        this._renderTextBackground(ctx, textLines);
        if (this.textAlign !== "left" && this.textAlign !== "justify") {
            ctx.save();
            ctx.translate((this.textAlign === "center" ? this.width / 2 : this.width), 0);
        }
        ctx.save();
        this._setShadow(ctx);
        this._renderTextFill(ctx, textLines);
        this._renderTextStroke(ctx, textLines);
        this._removeShadow(ctx);
        ctx.restore();
        if (this.textAlign !== "left" && this.textAlign !== "justify") {
            ctx.restore();
        }
        this._renderTextDecoration(ctx, textLines);
        this.clipTo && ctx.restore();
        this._setBoundaries(ctx, textLines);
        return this._totalLineHeight = 0;
    };
    xchart.Rect = (function (_super) {
        __extends(Rect, _super);
        function Rect() {
            _ref = Rect.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Rect.prototype._stroke = function (ctx) {
            var height, strokeWidth, width;
            ctx.save();
            if (this.hasBorders) {
                width = this.getWidth();
                height = this.getHeight();
                strokeWidth = this.strokeWidth > 1 ? this.strokeWidth : 0;
                ctx.strokeRect(~~(-(width / 2) - this.padding - strokeWidth / 2), ~~(-(height / 2) - this.padding - strokeWidth / 2), ~~(width + this.padding * 2 + strokeWidth), ~~(height + this.padding * 2 + strokeWidth));
            }
            return ctx.restore();
        };
        return Rect;
    })(fabric.Rect);
    map = {moveTo:"M", lineTo:"L", arcTo:"a", arc:"A", closePath:"Z", quadraticCurveTo:"Q", bezierCurveTo:"C"};
    xchart.Path = (function () {
        function Path(options) {
            this.path = [];
            for (prop in options) {
                this[prop] = options[prop];
            }
        }
        Path.prototype.toFabricPath = function (options) {
            return new fabric.Path(this.path, options);
        };
        Path.prototype.addCommand = function (func, params) {
            this.path.push([map[func]].concat(params));
            return this;
        };
        Path.prototype.appendPath = function (params) {
            var path;
            path = this.path;
            if (!path) {
                path = this.path = [];
            }
            if (params instanceof xchart.Path) {
                return this.path = path.concat(params.path);
            } else {
                return this.path = path.concat(params);
            }
        };
        Path.prototype.moveTo = function (x, y) {
            this.addCommand("moveTo", [x, y]);
            return this;
        };
        Path.prototype.lineTo = function (x, y) {
            this.addCommand("lineTo", [x, y]);
            return this;
        };
        Path.prototype.arcTo = function (x1, y1, x2, y2, radius) {
            this.addCommand("arcTo", [x1, y1, x2, y2, radius]);
            return this;
        };
        Path.prototype.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
            this.addCommand("arc", [x, y, radius, startAngle, endAngle, anticlockwise]);
            return this;
        };
        Path.prototype.quadraticCurveTo = function (cpx, cpy, x, y) {
            this.addCommand("quadraticCurveTo", [cpx, cpy, x, y]);
            return this;
        };
        Path.prototype.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
            this.addCommand("bezierCurveTo", [cp1x, cp1y, cp2x, cp2y, x, y]);
            return this;
        };
        Path.prototype.closePath = function () {
            this.addCommand("closePath", []);
            return this;
        };
        Path.prototype.reverse = function () {
            var path;
            path = this.path.concat().reverse();
            return new xchart.Path({path:path});
        };
        Path.prototype.clear = function () {
            this.path = [];
            return this;
        };
        return Path;
    })();
    isValidRadius = function (attributes) {
        return ("radius" in attributes) && (attributes.radius > 0);
    };
    extend = fabric.util.object.extend;
    toRadians = xchart.toRadians = function (angdeg) {
        return angdeg / 180 * Math.PI;
    };
    polarToCartesian = function (centerX, centerY, radius, angleInDegrees) {
        var angleInRadians;
        angleInRadians = (angleInDegrees - 90) * Math.PI / 180;
        return {x:centerX + (radius * Math.cos(angleInRadians)), y:centerY + (radius * Math.sin(angleInRadians))};
    };
    xchart.getArcPath = function (x, y, radius, startAngle, endAngle, innerSize) {
        var arcSweep, d, end, innerEnd, innerRadius, innerStart, start;
        if (Math.round(endAngle - startAngle) === 360) {
            endAngle = endAngle - 1e-9;
        }
        start = polarToCartesian(x, y, radius, startAngle);
        end = polarToCartesian(x, y, radius, endAngle);
        arcSweep = (endAngle - startAngle <= 180 ? 0 : 1);
        if (typeof innerSize === "number") {
            innerRadius = radius * innerSize;
            innerStart = polarToCartesian(x, y, innerRadius, startAngle);
            innerEnd = polarToCartesian(x, y, innerRadius, endAngle);
            d = [["M", innerStart.x, innerStart.y], ["L", start.x, start.y], ["A", radius, radius, 0, arcSweep, 1, end.x, end.y], ["L", innerEnd.x, innerEnd.y], ["A", innerRadius, innerRadius, 0, arcSweep, 0, innerStart.x, innerStart.y]];
            return d;
        } else {
            d = [["M", x, y], ["L", start.x, start.y], ["A", radius, radius, 0, arcSweep, 1, end.x, end.y]];
            return d;
        }
    };
    fabric.Arc = fabric.util.createClass(fabric.Path, {type:"arc", innerSize:null, initialize:function (options) {
        var offset, path;
        options = options || {};
        this.set("angleStart", options.angleStart || 0);
        this.set("angleExtent", options.angleExtent || 0);
        if (options.offset) {
            offset = this.getOffset(options, options.offset);
            path = xchart.getArcPath(options.centerX + offset.left, options.centerY + offset.top, options.radius, options.angleStart, options.angleStart + options.angleExtent, options.innerSize);
        } else {
            path = xchart.getArcPath(options.centerX, options.centerY, options.radius, options.angleStart, options.angleStart + options.angleExtent, options.innerSize);
        }
        return this.callSuper("initialize", path, options);
    }, resetPath:function () {
        var offset, path;
        if (this.offset) {
            offset = this.getOffset(this, this.offset);
            path = xchart.getArcPath(this.centerX + offset.left, this.centerY + offset.top, this.radius, this.angleStart, this.angleStart + this.angleExtent, this.innerSize);
        } else {
            path = xchart.getArcPath(this.centerX, this.centerY, this.radius, this.angleStart, this.angleStart + this.angleExtent, this.innerSize);
        }
        return this.path = path;
    }, setOffset:function (offset) {
        this.offset = offset;
        return this.resetPath();
    }, getOffset:function (arc, offset) {
        var angleCenter, angleCenterRadians, angleMin, angleMinRadians, factorLeft, factorTop, offsetLeft, offsetTop, oneThreeQuarter;
        angleCenter = arc.angleStart + 270 + arc.angleExtent / 2;
        angleCenterRadians = xchart.toRadians(angleCenter);
        angleMin = angleCenter % 90;
        angleMinRadians = xchart.toRadians(angleMin);
        factorLeft = Math.cos(angleCenterRadians) >= 0 ? 1 : -1;
        factorTop = Math.sin(angleCenterRadians) >= 0 ? 1 : -1;
        oneThreeQuarter = Math.tan(angleCenterRadians) >= 0;
        if (oneThreeQuarter) {
            offsetLeft = offset * factorLeft * Math.cos(angleMinRadians);
            offsetTop = offset * factorTop * Math.sin(angleMinRadians);
        } else {
            offsetLeft = offset * factorLeft * Math.sin(angleMinRadians);
            offsetTop = offset * factorTop * Math.cos(angleMinRadians);
        }
        return {left:offsetLeft, top:offsetTop};
    }, _set:function (key, value) {
        this.callSuper("_set", key, value);
        if (key === "angleStart" || key === "angleExtent" || key === "radius" || key === "innerSize" || key === "centerX" || key === "centerY") {
            if (this.angleStart && this.angleExtent && this.radius && this.centerX && this.centerY) {
                return this.resetPath();
            }
        }
    }, toObject:function () {
        return extend(this.callSuper("toObject"), {angleStart:this.get("angleStart"), angleExtent:this.get("angleExtent"), centerX:this.get("centerX"), centerY:this.get("centerY"), radius:this.get("radius"), innerSize:this.get("innerSize")});
    }});
}).call(this);
(function () {
    var Legend, _ref, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Legend = (function (_super) {
        __extends(Legend, _super);
        function Legend() {
            _ref = Legend.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Legend.include(xchart.Events);
        Legend.prototype.themePath = "legend";
        Legend.prototype.align = "middle";
        Legend.prototype.position = "bottom";
        Legend.prototype.layout = "horizontal";
        Legend.prototype.style = null;
        Legend.prototype.render = function (layer) {
            var borderWidth, color, fontFamily, fontSize, i, itemPadding, label, labelPadding, labels, layout, left, legend, legendSize, padding, position, rectHeight, rectWidth, size, startX, startY, style, symbolBorder, symbolWidth, text, textGroup, top, _i, _len, _ref1, _ref2;
            legend = this;
            top = this.top;
            left = this.left ? this.left : 0;
            style = this.get("style");
            padding = style.padding;
            legendSize = this.getSize();
            rectWidth = legendSize.width;
            rectHeight = legendSize.height;
            position = this.get("position");
            textGroup = new fabric.Group;
            labels = this.labels || [];
            startX = left + padding;
            borderWidth = style.borderWidth;
            symbolWidth = style.symbolWidth;
            labelPadding = style.labelPadding || 2;
            startY = top;
            layout = this.get("layout");
            itemPadding = style.itemPadding;
            fontSize = (_ref1 = style.fontSize) != null ? _ref1 : 12;
            fontFamily = (_ref2 = style.fontFamliy) != null ? _ref2 : "Arial";
            for (i = _i = 0, _len = labels.length; _i < _len; i = ++_i) {
                label = labels[i];
                size = xchart.TextMetrics.measure({text:label.label, fontSize:fontSize, fontFamily:fontFamily});
                text = new fabric.Text(label.label, {left:layout === "vertical" ? left + padding + symbolWidth + labelPadding + size.width / 2 : startX + symbolWidth + labelPadding + itemPadding * i + size.width / 2, top:layout === "vertical" ? startY + borderWidth + padding + itemPadding * i + size.height / 2 : top + this.height / 2, fontSize:fontSize, fontFamily:fontFamily, lineHeight:1.1, padding:0, fill:this.get("itemStyle").color, opacity:label.series && !label.series.isLegendVisible(label.index) ? 0.2 : 1});
                text.labelIndex = i;
                text.on("mouseenter", function () {
                    if (!xchart.excanvas) {
                        this.set("fill", legend.get("itemHoverStyle").color);
                        legend.chart.layer.renderAll();
                    }
                    return document.body.style.cursor = "pointer";
                });
                text.on("mouseleave", function () {
                    if (!xchart.excanvas) {
                        this.set("fill", legend.get("itemStyle").color);
                        legend.chart.layer.renderAll();
                    }
                    return document.body.style.cursor = "default";
                });
                text.on("click", function () {
                    var series;
                    if (this.labelIndex !== void 0) {
                        series = legend.labels[this.labelIndex].series;
                        if (series) {
                            return series.doOnLegendClick(legend.labels[this.labelIndex].index);
                        }
                    }
                });
                layer.add(text);
                color = label.series.getLegendColor(label.index);
                symbolBorder = 0;
                textGroup.add(new fabric.Rect({left:layout === "vertical" ? left + padding + size.height / 2 : startX + itemPadding * i + size.height / 2, top:layout === "vertical" ? startY + padding + itemPadding * i + size.height / 2 : top + padding + size.height / 2, width:symbolWidth - symbolBorder * 2, height:symbolWidth - symbolBorder * 2, fill:color, hasBorders:!!symbolBorder, stroke:xchart.darken(color, 20), strokeWidth:symbolBorder}));
                startX += size.width + symbolWidth + labelPadding;
                startY += size.height;
            }
            textGroup.add(new xchart.Rect({rx:3, ry:3, left:Math.floor(left + (rectWidth - borderWidth * 2) / 2) + 0.5, top:Math.floor(top + (rectHeight - borderWidth * 2) / 2) + 0.5, width:rectWidth - borderWidth * 2, height:rectHeight - borderWidth * 2, stroke:style.borderColor, strokeWidth:borderWidth, hasBorders:!!borderWidth, fill:""}));
            return layer.add(textGroup);
        };
        Legend.prototype.getSize = function () {
            var borderWidth, height, itemPadding, label, labelPadding, labels, layout, maxWidth, padding, rHeight, rWidth, size, style, symbolWidth, width, _i, _len, _ref1, _ref2;
            labels = this.labels || [];
            width = 0;
            height = 0;
            style = this.get("style");
            symbolWidth = style.symbolWidth;
            labelPadding = style.labelPadding;
            maxWidth = 0;
            itemPadding = style.itemPadding;
            padding = style.padding;
            borderWidth = style.borderWidth;
            layout = this.get("layout");
            for (_i = 0, _len = labels.length; _i < _len; _i++) {
                label = labels[_i];
                size = xchart.TextMetrics.measure({text:label.label, fontSize:(_ref1 = style.fontSize) != null ? _ref1 : 12, fontFamily:(_ref2 = style.fontFamliy) != null ? _ref2 : "Arial"});
                if (layout === "vertical") {
                    width = size.width + symbolWidth + labelPadding;
                    if (width > maxWidth) {
                        maxWidth = width;
                    }
                    height += size.height;
                } else {
                    width += size.width + symbolWidth + labelPadding;
                    height = size.height;
                }
            }
            rWidth = layout === "vertical" ? maxWidth : width;
            if (layout === "vertical") {
                rWidth += padding * 2 + borderWidth * 2;
                rHeight = height + padding * 2 + borderWidth * 2 + (labels.length - 1) * itemPadding;
            } else {
                rWidth += padding * 2 + borderWidth * 2 + (labels.length - 1) * itemPadding;
                rHeight = height + padding * 2 + borderWidth * 2;
            }
            this.width = rWidth;
            this.height = rHeight;
            return {width:rWidth, height:rHeight};
        };
        return Legend;
    })(xchart.Themeable);
    xchart.Legend = Legend;
}).call(this);
(function () {
    var Chart, Events, Log, canvasEl, stackableTypeMap, toRadians, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    xchart.themes = {};
    xchart.template = function (text) {
        return _.template(text, null, {interpolate:/\{(.+?)\}/g});
    };
    if (typeof fabric !== "undefined" && fabric !== null) {
        canvasEl = fabric.document.createElement("canvas");
        xchart.excanvas = !canvasEl.getContext;
    }
    Events = xchart.Events;
    Log = xchart.Log;
    toRadians = xchart.toRadians;
    stackableTypeMap = {area:true, bar:true, column:true};
    Chart = (function (_super) {
        __extends(Chart, _super);
        Chart.include(Events);
        Chart.include(Log);
        Chart.prototype.uninheritProperties = ["animate", "axes", "series", "legend", "theme", "width", "height", "title", "seriesScrollable"];
        Chart.prototype.themePath = "chart";
        Chart.prototype.animate = true;
        Chart.prototype.axes = null;
        Chart.prototype.legend = null;
        Chart.prototype.series = null;
        Chart.prototype.theme = "default";
        Chart.prototype.width = 800;
        Chart.prototype.height = 600;
        Chart.prototype.scrollLeft = 0;
        Chart.prototype.scrollTop = 0;
        Chart.prototype.seriesScrollable = false;
        Chart.prototype.style = {};
        Chart.prototype.tooltip = {};
        Chart.prototype.titleStyle = {};
        Chart.prototype.showGrid = "xaxis";
        Chart.prototype.gridStyle = null;
        Chart.prototype.showMinorGrid = "none";
        Chart.prototype.minorGridStyle = null;
        Chart.prototype.gridHorizontalAxis = "left";
        Chart.prototype.gridVerticalAxis = "bottom";
        Chart.prototype.seriesOptions = null;
        function Chart(options) {
            this.createdDate = new Date;
            this.options = options;
            this.chart = this;
            Chart.__super__.constructor.apply(this, arguments);
            this.texts = [];
            this.scrollTexts = [];
        }
        Chart.prototype.set = function (prop, value) {
            var initObject, key;
            initObject = function (prop, value) {
                var axis, clazz, index, series, _i, _j, _len, _len1, _ref, _ref1;
                if (prop === "legend") {
                    if (!(value instanceof xchart.Legend)) {
                        value = new xchart.Legend(value);
                    }
                    value.chart = this;
                    return value;
                } else {
                    if (prop === "series") {
                        for (index = _i = 0, _len = value.length; _i < _len; index = ++_i) {
                            series = value[index];
                            if (series && series.$type) {
                                clazz = eval(series.$type);
                                if (!(series instanceof xchart.Series)) {
                                    value[index] = new clazz(series);
                                }
                            }
                            if ((_ref = value[index]) != null) {
                                _ref.chart = this;
                            }
                        }
                        return value;
                    } else {
                        if (prop === "axes") {
                            for (index = _j = 0, _len1 = value.length; _j < _len1; index = ++_j) {
                                axis = value[index];
                                if (axis && axis.$type) {
                                    clazz = eval(axis.$type);
                                    if (!(axis instanceof xchart.Axis)) {
                                        value[index] = new clazz(axis);
                                    }
                                }
                                if ((_ref1 = value[index]) != null) {
                                    _ref1.chart = this;
                                }
                            }
                            return value;
                        }
                    }
                }
            };
            if (typeof prop === "object") {
                for (key in prop) {
                    value = prop[key];
                    if (key === "legend" || key === "series" || key === "axes") {
                        prop[key] = initObject.call(this, key, value);
                    }
                }
            } else {
                if (prop === "legend" || prop === "series" || prop === "axes") {
                    value = initObject.call(this, prop, value);
                }
            }
            return Chart.__super__.set.apply(this, arguments);
        };
        Chart.prototype.addText = function (text) {
            if (!text) {
                return;
            }
            if (!(text instanceof xchart.Text)) {
                text = new xchart.Text(text);
            }
            return this.texts.push(text);
        };
        Chart.prototype.addTextForScrollLayer = function (text) {
            if (!text) {
                return;
            }
            if (!(text instanceof xchart.Text)) {
                text = new xchart.Text(text);
            }
            return this.scrollTexts.push(text);
        };
        Chart.prototype.destroyText = function () {
            var text, _i, _j, _len, _len1, _ref, _ref1;
            _ref = this.texts;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                text = _ref[_i];
                text && text.destroy();
            }
            _ref1 = this.scrollTexts;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                text = _ref1[_j];
                text && text.destroy();
            }
            this.texts = [];
            return this.scrollTexts = [];
        };
        Chart.prototype.renderText = function () {
            var text, _i, _j, _len, _len1, _ref, _ref1, _results;
            _ref = this.texts;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                text = _ref[_i];
                text.render(this.el.firstChild);
            }
            if (this.scrollLayer) {
                _ref1 = this.scrollTexts;
                _results = [];
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    text = _ref1[_j];
                    _results.push(text.render(this.scrollLayer.wrapperEl));
                }
                return _results;
            }
        };
        Chart.prototype.clearPoints = function () {
            return this.points = [];
        };
        Chart.prototype.exportPoint = function (point) {
            if (!this.points) {
                this.points = [];
            }
            return this.points.push(point);
        };
        Chart.prototype.getThemeConfig = function () {
            return xchart.themes[this.theme || "default"] || xchart.themes["default"];
        };
        Chart.prototype.getThemeFor = function (part) {
            var theme;
            theme = xchart.themes[this.theme || "default"] || xchart.themes["default"];
            return theme[part];
        };
        Chart.prototype.getSeries = function (index) {
            var series, _i, _len, _ref;
            if (this.series === null || index === void 0) {
                return null;
            }
            if (typeof index === "number") {
                return this.series[index];
            } else {
                if (typeof index === "string") {
                    _ref = this.series;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        series = _ref[_i];
                        if (series.name === index) {
                            return series;
                        }
                    }
                    return null;
                }
            }
        };
        Chart.prototype.addSeries = function (series, index) {
            var clazz;
            if (series === void 0) {
                return;
            }
            if (!this.series) {
                this.series = [];
            }
            if (series && series.$type) {
                clazz = eval(series.$type);
                if (!(series instanceof xchart.Series)) {
                    series = new clazz(series);
                }
            }
            if (typeof index === "number") {
                this.series.splice(index, 0, series);
            } else {
                this.series.push(series);
            }
            this.redraw();
            return series;
        };
        Chart.prototype.removeSeries = function (series) {
            if (!(series instanceof xchart.Series)) {
                series = this.getSeries(series);
            }
            if (!series) {
                return;
            }
            this.series.splice(this.series.indexOf(series), 1);
            this.redraw();
            return series;
        };
        Chart.prototype.clearSeries = function () {
            this.series = [];
            return this.redraw();
        };
        Chart.prototype.initTip = function () {
            var tooltip;
            tooltip = this.get("tooltip");
            if (!this.tooltipDom) {
                this.tooltipDom = document.createElement("div");
                document.body.appendChild(this.tooltipDom);
            }
            this.tooltipDom.style.position = "absolute";
            this.tooltipDom.style.pointerEvents = "none";
            this.tooltipDom.style.display = "none";
            this.tooltipDom.style.zIndex = 100000;
            this.tooltipDom.style.fontSize = tooltip.fontSize + "px";
            this.tooltipDom.style.padding = tooltip.padding + "px";
            this.tooltipDom.style.color = tooltip.color;
            this.tooltipDom.style.backgroundColor = tooltip.backgroundColor;
            this.tooltipDom.style.border = tooltip.borderWidth + "px solid " + tooltip.borderColor;
            this.tooltipDom.style.opacity = tooltip.opacity;
            return this.tooltipDom.style.borderRadius = tooltip.borderRadius + "px";
        };
        Chart.prototype.updateTipPosition = function () {
            var mousePos, pos;
            mousePos = this.mousePosition;
            pos = {left:mousePos.left + 5, top:mousePos.top + 5};
            this.tooltipDom.style.left = pos.left + "px";
            return this.tooltipDom.style.top = pos.top + "px";
        };
        Chart.prototype.showTip = function (text, point) {
            var chart, chartPosition, middleAngle, mousePos, pos, position, scrollLayerPosition, startLeft, startTop;
            chart = this;
            if (text === void 0 && point === void 0) {
                return;
            }
            if (point && this.lastShowTipPoint === point) {
                return;
            }
            if (this.lastShowTipPoint && this.lastShowTipPoint !== point) {
                this.lastShowTipPoint.series.unhighlightPoint(this.lastShowTipPoint);
            }
            if (point) {
                this.lastShowTipPoint = point;
                point.series.highlightPoint(point);
            }
            this.tooltipDom.innerHTML = text;
            this.tooltipDom.style.visibility = "hidden";
            this.tooltipDom.style.display = "";
            pos = void 0;
            chartPosition = jQuery(this.el).offset();
            if (this.seriesScrollableReal) {
                scrollLayerPosition = jQuery(chart.scrollLayer.wrapperEl).offset();
                startLeft = scrollLayerPosition.left;
                startTop = scrollLayerPosition.top;
            } else {
                startLeft = chartPosition.left;
                startTop = chartPosition.top;
            }
            if (point instanceof fabric.Arc) {
                middleAngle = point.angleStart - 90 + point.angleExtent / 2;
                pos = {left:startLeft + point.centerX + point.radius * Math.cos(xchart.toRadians(middleAngle)) + this.tooltipDom.offsetWidth * (middleAngle > 90 && middleAngle < 270 ? -1 : 0), top:startTop + point.centerY + point.radius * Math.sin(xchart.toRadians(middleAngle))};
            } else {
                position = this.get("tooltip").position;
                if (!point) {
                    position = "mouse";
                }
                switch (position) {
                  case "top":
                    pos = {left:startLeft + point.left - this.tooltipDom.offsetWidth / 2 - this.scrollLeft, top:startTop + point.top - point.height / 2 - this.tooltipDom.offsetHeight - 10 - this.scrollTop};
                    break;
                  case "bottom":
                    pos = {left:startLeft + point.left - this.tooltipDom.offsetWidth / 2 - this.scrollLeft, top:startTop + point.top + point.height / 2 + 10 - this.scrollTop};
                    break;
                  case "mouse":
                    mousePos = this.mousePosition;
                    pos = {left:mousePos.left + 5, top:mousePos.top + 5};
                }
            }
            this.tooltipDom.style.left = pos.left + "px";
            this.tooltipDom.style.top = pos.top + "px";
            return this.tooltipDom.style.visibility = "";
        };
        Chart.prototype.hideTip = function () {
            if (this.lastShowTipPoint) {
                if (!xchart.excanvas) {
                    this.lastShowTipPoint.series.unhighlightPoint(this.lastShowTipPoint);
                }
                this.lastShowTipPoint = null;
            }
            return this.tooltipDom.style.display = "none";
        };
        Chart.prototype.getScrollableAxes = function () {
            var axis, result, _i, _len, _ref;
            result = [];
            if (this.axes) {
                _ref = this.axes;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    axis = _ref[_i];
                    if (axis instanceof xchart.CategoryAxis) {
                        result.push(axis);
                    }
                }
            }
            return result;
        };
        Chart.prototype.render = function (el) {
            var axis, chart, contentSize, mousedown, render, scrollableAxes, scroller, series, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _this = this;
            this.rendering = true;
            this.el = el = typeof el === "string" ? document.getElementById(el) : el;
            this.rendered = true;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            el.appendChild(this.canvas);
            this.layer = new fabric.Canvas(this.canvas);
            this.layer.renderOnAddition = false;
            this.doInitSeries();
            this.layout(this.layer);
            ((_ref = this.legend) != null ? _ref.get("visible") : void 0) && ((_ref1 = this.legend) != null ? _ref1.render(this.layer) : void 0);
            scrollableAxes = this.getScrollableAxes();
            if (this.seriesScrollable && scrollableAxes.length > 0) {
                this.seriesScrollableReal = true;
                if (this.reversed) {
                    contentSize = this.axesMap["left"].getContentHeight();
                } else {
                    contentSize = this.axesMap["bottom"].getContentWidth();
                }
                this.scrollCanvas = document.createElement("canvas");
                if (this.reversed) {
                    this.scrollCanvas.height = contentSize;
                    this.scrollCanvas.width = this.width;
                } else {
                    this.scrollCanvas.width = contentSize;
                    this.scrollCanvas.height = this.height;
                }
                this.layer.el.parentNode.appendChild(this.scrollCanvas);
                this.scrollLayer = new fabric.Canvas(this.scrollCanvas);
                this.scrollLayer.renderOnAddition = false;
                this.scrollLayer.wrapperEl.style.position = "absolute";
                this.scrollLayer.wrapperEl.style.overflow = "hidden";
                if (this.reversed) {
                    this.scrollLayer.wrapperEl.style.left = this.axesArea.left + "px";
                    this.scrollLayer.wrapperEl.style.top = this.axesArea.top + "px";
                    this.scrollLayer.wrapperEl.style.width = this.axesArea.width + "px";
                    this.scrollLayer.wrapperEl.style.height = this.seriesArea.height + "px";
                } else {
                    this.scrollLayer.wrapperEl.style.left = this.seriesArea.left + "px";
                    this.scrollLayer.wrapperEl.style.top = this.axesArea.top + "px";
                    this.scrollLayer.wrapperEl.style.width = this.seriesArea.width + "px";
                    this.scrollLayer.wrapperEl.style.height = this.axesArea.height + "px";
                }
                chart = this;
                render = function (left, top, zoom) {
                    chart.scrollLeft = left;
                    chart.scrollTop = top;
                    chart.scrollLayer.wrapperEl.scrollLeft = left;
                    return chart.scrollLayer.wrapperEl.scrollTop = top;
                };
                scroller = this.scroller = new Scroller(render, {bouncing:false});
                this.scroller.setPosition(this.seriesArea.left, this.seriesArea.top);
                if (this.reversed) {
                    this.scroller.setDimensions(this.seriesArea.width, this.seriesArea.height, this.seriesArea.width, contentSize);
                } else {
                    this.scroller.setDimensions(this.seriesArea.width, this.seriesArea.height, contentSize, this.seriesArea.height);
                }
                mousedown = false;
                jQuery(el).bind("mousedown", function (event) {
                    scroller.doTouchStart([{pageX:event.pageX, pageY:event.pageY}], event.timeStamp || new Date());
                    return mousedown = true;
                });
                jQuery(document).bind("mousemove", function (event) {
                    if (!mousedown) {
                        return;
                    }
                    scroller.doTouchMove([{pageX:event.pageX, pageY:event.pageY}], event.timeStamp || new Date());
                    return mousedown = true;
                });
                jQuery(document).bind("mouseup", function (event) {
                    if (!mousedown) {
                        return;
                    }
                    scroller.doTouchEnd(event.timeStamp || new Date());
                    return mousedown = false;
                });
            } else {
                this.seriesScrollableReal = false;
            }
            if (this.axes) {
                _ref2 = this.axes;
                for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                    axis = _ref2[_i];
                    if (this.seriesScrollableReal && ((this.reversed && axis.position !== "bottom") || (!this.reversed && axis.position === "bottom"))) {
                        axis.renderToScrollLayer = true;
                        axis.render(this.scrollLayer, this.axesArea);
                    } else {
                        axis.renderToScrollLayer = false;
                        axis.render(this.layer, this.axesArea);
                    }
                }
            }
            this.drawSeries();
            this.initTip();
            this.layer.on("after:render", function () {
            });
            this.renderText();
            if (!xchart.excanvas) {
                _ref3 = this.series;
                for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                    series = _ref3[_j];
                    series.visible && series.showAnimate && series.showAnimate();
                }
            }
            this.layer.renderAll();
            return this.rendering = false;
        };
        Chart.prototype.drawSeries = function () {
            var barGroupPadding, barPadding, barWidth, categoryWidth, chart, clearHightlight, columnGroupPadding, columnPadding, columnWidth, firstSeries, getFirstSeries, group, groupCount, groupIndex, groupsMap, index, layer, series, seriesOptions, stack, type, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _results;
            chart = this;
            if (!this.reversed) {
                if (chart.axesMap["bottom"] instanceof xchart.CategoryAxis) {
                    chart.axesMap["bottom"].clearPoints();
                }
            } else {
                if (chart.axesMap["left"] instanceof xchart.CategoryAxis) {
                    chart.axesMap["left"].clearPoints();
                }
            }
            clearHightlight = function () {
                var categoryAxis, oldPoint, oldPoints, _i, _len, _ref;
                categoryAxis = chart.reversed ? chart.axesMap["left"] : chart.axesMap["bottom"];
                if (categoryAxis && chart.highlightCategoryIndex !== null) {
                    oldPoints = categoryAxis.points[chart.highlightCategoryIndex] || [];
                    for (_i = 0, _len = oldPoints.length; _i < _len; _i++) {
                        oldPoint = oldPoints[_i];
                        oldPoint.series.unhighlightPoint(oldPoint);
                    }
                }
                chart.highlightCategoryIndex = null;
                if ((_ref = chart.highlightPoint) != null) {
                    _ref.series.unhighlightPoint(chart.highlightPoint);
                }
                chart.highlightPoint = null;
                return chart.hideTip();
            };
            if (!this.elMouseEventBinded) {
                jQuery(this.el).bind("mousemove", function (event) {
                    var categoryAxis, categoryIndex, left, oldCategoryIndex, oldPoint, oldPoints, point, points, position, rect, seriesArea, tipString, tooltip, top, _i, _j, _len, _len1, _ref;
                    chart.mousePosition = {left:event.pageX, top:event.pageY};
                    position = jQuery(chart.el).offset();
                    seriesArea = chart.seriesArea;
                    rect = {left:seriesArea.left + position.left, top:seriesArea.top + position.top, right:seriesArea.left + seriesArea.width + position.left, bottom:seriesArea.top + seriesArea.height + position.top};
                    categoryAxis = chart.reversed ? chart.axesMap["left"] : chart.axesMap["bottom"];
                    if (event.pageX < rect.left || event.pageX > rect.right || event.pageY < rect.top || event.pageY > rect.bottom) {
                        return clearHightlight();
                    } else {
                        tooltip = chart.get("tooltip");
                        if (!tooltip.shared) {
                            left = event.pageX - position.left + chart.scrollLeft;
                            top = event.pageY - position.top + chart.scrollTop;
                            point = (_ref = chart.axesMap["bottom"]) != null ? _ref.getNearestPoint(left, top) : void 0;
                            if (point && point.series) {
                                oldPoint = chart.highlightPoint;
                                if (oldPoint !== point) {
                                    chart.showTip(point.series.getTooltipForPoint(point.dataIndex), point);
                                    point.series.highlightPoint(point);
                                    if (oldPoint != null) {
                                        oldPoint.series.unhighlightPoint(oldPoint);
                                    }
                                    return chart.highlightPoint = point;
                                }
                            }
                        } else {
                            if (!categoryAxis) {
                                return;
                            }
                            left = event.pageX - position.left + chart.scrollLeft;
                            top = event.pageY - position.top + chart.scrollTop;
                            categoryIndex = categoryAxis.getCategoryIndexByPosition(left, top);
                            points = categoryAxis.points[categoryIndex] || [];
                            oldCategoryIndex = chart.highlightCategoryIndex;
                            if (oldCategoryIndex !== categoryIndex && categoryIndex !== -1) {
                                tipString = "<span style='font-weight: bold;'>" + categoryAxis.categories[categoryIndex] + "</span><br/>" || "";
                                if (oldCategoryIndex !== null && oldCategoryIndex !== void 0) {
                                    oldPoints = categoryAxis.points[oldCategoryIndex] || [];
                                    for (_i = 0, _len = oldPoints.length; _i < _len; _i++) {
                                        oldPoint = oldPoints[_i];
                                        oldPoint.series.unhighlightPoint(oldPoint);
                                    }
                                }
                                for (_j = 0, _len1 = points.length; _j < _len1; _j++) {
                                    point = points[_j];
                                    point.series.highlightPoint(point);
                                    tipString += point.series.getTooltipForPoint(point.dataIndex);
                                }
                                chart.highlightCategoryIndex = categoryIndex;
                                return chart.showTip(tipString);
                            } else {
                                return chart.updateTipPosition();
                            }
                        }
                    }
                });
                jQuery(this.el).bind("mouseleave", function () {
                    return clearHightlight();
                });
                this.elMouseEventBinded = true;
            }
            if (this.seriesScrollableReal) {
                layer = this.scrollLayer;
            } else {
                layer = this.layer;
            }
            _ref = this.series;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                series = _ref[_i];
                if (!(series.type in stackableTypeMap)) {
                    series.visible && series.render(layer, this.seriesArea);
                }
            }
            groupsMap = this.groupsMap;
            getFirstSeries = function (group) {
                var item, result, stack, _j, _k, _len1, _len2;
                result = null;
                for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
                    stack = group[_j];
                    if (result) {
                        return result;
                    }
                    if (stack instanceof Array) {
                        for (_k = 0, _len2 = stack.length; _k < _len2; _k++) {
                            item = stack[_k];
                            result = item;
                            break;
                        }
                    } else {
                        return stack;
                    }
                }
                if (result) {
                    return result;
                }
            };
            if (groupsMap) {
                seriesOptions = (_ref1 = this.get("seriesOptions")) != null ? _ref1 : {};
                _results = [];
                for (type in groupsMap) {
                    group = groupsMap[type];
                    if (type === "column") {
                        firstSeries = getFirstSeries(group);
                        categoryWidth = firstSeries.xAxis.getUnitWidth();
                        groupCount = group.length;
                        columnPadding = (_ref2 = seriesOptions.columnPadding) != null ? _ref2 : 0.1;
                        columnGroupPadding = (_ref3 = seriesOptions.columnGroupPadding) != null ? _ref3 : 1;
                        columnWidth = categoryWidth / (groupCount + columnGroupPadding + (groupCount - 1) * columnPadding);
                        this.columnWidth = columnWidth;
                        this.columnPaddingValue = columnWidth * columnPadding;
                        this.columnGroupPaddingValue = columnWidth * columnGroupPadding;
                        _results.push((function () {
                            var _j, _len1, _results1;
                            _results1 = [];
                            for (groupIndex = _j = 0, _len1 = group.length; _j < _len1; groupIndex = ++_j) {
                                series = group[groupIndex];
                                if (series instanceof Array) {
                                    stack = series;
                                    _results1.push((function () {
                                        var _k, _len2, _results2;
                                        _results2 = [];
                                        for (_k = 0, _len2 = stack.length; _k < _len2; _k++) {
                                            series = stack[_k];
                                            series.groupIndex = groupIndex;
                                            _results2.push(series.visible && series.render(layer, this.seriesArea));
                                        }
                                        return _results2;
                                    }).call(this));
                                } else {
                                    series.groupIndex = groupIndex;
                                    _results1.push(series.visible && series.render(layer, this.seriesArea));
                                }
                            }
                            return _results1;
                        }).call(this));
                    } else {
                        if (type === "bar") {
                            firstSeries = getFirstSeries(group);
                            categoryWidth = firstSeries.yAxis.getUnitWidth();
                            groupCount = group.length;
                            barPadding = (_ref4 = seriesOptions.barPadding) != null ? _ref4 : 0.1;
                            barGroupPadding = (_ref5 = seriesOptions.barGroupPadding) != null ? _ref5 : 1;
                            barWidth = categoryWidth / (groupCount + barGroupPadding + (groupCount - 1) * barPadding);
                            this.barWidth = barWidth;
                            this.barPaddingValue = barWidth * barPadding;
                            this.barGroupPaddingValue = barWidth * barGroupPadding;
                            _results.push((function () {
                                var _j, _len1, _results1;
                                _results1 = [];
                                for (groupIndex = _j = 0, _len1 = group.length; _j < _len1; groupIndex = ++_j) {
                                    series = group[groupIndex];
                                    if (series instanceof Array) {
                                        stack = series;
                                        _results1.push((function () {
                                            var _k, _len2, _results2;
                                            _results2 = [];
                                            for (_k = 0, _len2 = stack.length; _k < _len2; _k++) {
                                                series = stack[_k];
                                                series.groupIndex = groupIndex;
                                                _results2.push(series.visible && series.render(layer, this.seriesArea));
                                            }
                                            return _results2;
                                        }).call(this));
                                    } else {
                                        series.groupIndex = groupIndex;
                                        _results1.push(series.visible && series.render(layer, this.seriesArea));
                                    }
                                }
                                return _results1;
                            }).call(this));
                        } else {
                            if (type === "area") {
                                _results.push((function () {
                                    var _j, _len1, _results1;
                                    _results1 = [];
                                    for (groupIndex = _j = 0, _len1 = group.length; _j < _len1; groupIndex = ++_j) {
                                        series = group[groupIndex];
                                        if (series instanceof Array) {
                                            stack = series;
                                            _results1.push((function () {
                                                var _k, _len2, _results2;
                                                _results2 = [];
                                                for (index = _k = 0, _len2 = stack.length; _k < _len2; index = ++_k) {
                                                    series = stack[index];
                                                    series.groupIndex = groupIndex;
                                                    if (index !== 0) {
                                                        series.lastSeries = stack[index - 1];
                                                    }
                                                    _results2.push(series.visible && series.render(layer, this.seriesArea));
                                                }
                                                return _results2;
                                            }).call(this));
                                        } else {
                                            series.groupIndex = groupIndex;
                                            _results1.push(series.visible && series.render(layer, this.seriesArea));
                                        }
                                    }
                                    return _results1;
                                }).call(this));
                            } else {
                                _results.push((function () {
                                    var _j, _len1, _results1;
                                    _results1 = [];
                                    for (_j = 0, _len1 = group.length; _j < _len1; _j++) {
                                        series = group[_j];
                                        _results1.push(series.visible && series.render(layer, this.seriesArea));
                                    }
                                    return _results1;
                                }).call(this));
                            }
                        }
                    }
                }
                return _results;
            }
        };
        Chart.prototype.doInitSeries = function () {
            var aggData, anonymousLegendCount, axis, axisInited, colors, colorsCountMap, colorsIndex, colorsMap, colorsType, colorsTypeMap, columnColors, count, countMap, dataItem, group, groupType, groupsMap, i, index, item, itemColors, j, k, legendLabels, lineColors, needHandleStack, newArray, pieColors, position, series, seriesCount, showAxes, showGrid, stack, stackIndex, style, tempData, tempGroup, type, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _results;
            if (this.series == null) {
                this.series = [];
            }
            showAxes = false;
            legendLabels = [];
            anonymousLegendCount = 0;
            if (!this.groupsMap) {
                this.groupsMap = {};
            }
            needHandleStack = false;
            axisInited = false;
            this.axesMap = {};
            countMap = {};
            style = (_ref = this.get("style")) != null ? _ref : {};
            colors = (_ref1 = style.colors) != null ? _ref1 : [];
            columnColors = (_ref2 = style.columnColors) != null ? _ref2 : colors;
            lineColors = (_ref3 = style.lineColors) != null ? _ref3 : colors;
            pieColors = (_ref4 = style.pieColors) != null ? _ref4 : colors;
            colorsMap = {"null":colors, "undefined":colors, "":colors, "default":colors, column:columnColors, line:lineColors, pie:pieColors};
            colorsCountMap = {};
            colorsTypeMap = {line:"default", area:"default", bubble:"default", scatter:"default", column:"default", bar:"default", pie:"default"};
            if (style.lineColors) {
                colorsTypeMap.line = colorsTypeMap.area = colorsTypeMap.bubble = colorsTypeMap.scatter = "line";
            }
            if (style.columnColors) {
                colorsTypeMap.column = colorsTypeMap.bar = "column";
            }
            if (style.pieColors) {
                colorsTypeMap.pie = "pie";
            }
            this.syncSizeAxes = [];
            _ref5 = this.series;
            for (index = _i = 0, _len = _ref5.length; _i < _len; index = ++_i) {
                item = _ref5[index];
                item.chart = this;
                if (item.type === "bar") {
                    this.reversed = true;
                }
                if (item instanceof xchart.Cartesian) {
                    if (!axisInited) {
                        if (this.axes && this.axes.length === 2) {
                            _ref6 = this.axes;
                            for (_j = 0, _len1 = _ref6.length; _j < _len1; _j++) {
                                axis = _ref6[_j];
                                if (axis.userSetPosition) {
                                    continue;
                                }
                                if (axis instanceof xchart.CategoryAxis) {
                                    axis.set("position", item.xAxisName);
                                } else {
                                    if (axis instanceof xchart.NumbericAxis) {
                                        axis.set("position", item.yAxisName);
                                    }
                                }
                            }
                        }
                        if (this.axes) {
                            _ref7 = this.axes;
                            for (_k = 0, _len2 = _ref7.length; _k < _len2; _k++) {
                                axis = _ref7[_k];
                                axis.chart = this;
                                position = axis.get("position");
                                if (this.reversed && position === "left") {
                                    this.syncSizeAxes.push(axis);
                                } else {
                                    if (!this.reversed && position === "bottom") {
                                        this.syncSizeAxes.push(axis);
                                    }
                                }
                                if (countMap[position] === void 0) {
                                    this.axesMap[position] = this.axesMap[position + "1"] = axis;
                                    countMap[position] = 1;
                                } else {
                                    if (position === "left") {
                                        this.axesMap[position] = axis;
                                    }
                                    this.axesMap[position + ++countMap[position]] = axis;
                                }
                                if (axis.name) {
                                    this.axesMap[axis.name] = axis;
                                }
                            }
                        }
                        axisInited = true;
                    }
                }
                if (item.type === "pie") {
                    item.colors = pieColors;
                    if (item.get("showInLegend")) {
                        _ref8 = item.getData();
                        for (i = _l = 0, _len3 = _ref8.length; _l < _len3; i = ++_l) {
                            dataItem = _ref8[i];
                            item.color = (_ref9 = item.color) != null ? _ref9 : pieColors[i % pieColors.length];
                            legendLabels.push({label:dataItem.label || dataItem.value + "", series:item, index:i});
                        }
                    }
                } else {
                    if (!item.title) {
                        item.title = "Series " + ++anonymousLegendCount;
                    }
                    if (item.get("showInLegend")) {
                        legendLabels.push({label:item.title, series:item, index:legendLabels.length});
                    }
                    if (!item.color) {
                        colorsType = colorsTypeMap[item.type];
                        if (colorsCountMap[colorsType] === void 0) {
                            colorsCountMap[colorsType] = 1;
                            colorsIndex = 0;
                        } else {
                            colorsIndex = ++colorsCountMap[colorsType];
                        }
                        itemColors = colorsMap[colorsType];
                        item.color = itemColors[colorsIndex % itemColors.length];
                    }
                }
                if (item.showAxes) {
                    showAxes = true;
                }
                if (typeof item.initAxis === "function") {
                    item.initAxis();
                }
                if (stackableTypeMap[item.type]) {
                    item.startData = void 0;
                    if (item.visible) {
                        group = this.groupsMap[item.type];
                        if (!group) {
                            this.groupsMap[item.type] = group = [];
                        }
                        group.push(item);
                        if (item.stack !== void 0) {
                            needHandleStack = true;
                        }
                    }
                }
            }
            showGrid = this.get("showGrid");
            if (showGrid === "xaxis" || showGrid === "both") {
                if (this.reversed) {
                    if (!((_ref10 = this.axesMap["left"]) != null ? _ref10.userSetShowGrid : void 0)) {
                        if ((_ref11 = this.axesMap["left"]) != null) {
                            _ref11.showGrid = true;
                        }
                    }
                } else {
                    if (!((_ref12 = this.axesMap["bottom"]) != null ? _ref12.userSetShowGrid : void 0)) {
                        if ((_ref13 = this.axesMap["bottom"]) != null) {
                            _ref13.showGrid = true;
                        }
                    }
                }
            }
            if (showGrid === "yaxis" || showGrid === "both") {
                if (this.reversed) {
                    if (!((_ref14 = this.axesMap["bottom"]) != null ? _ref14.userSetShowGrid : void 0)) {
                        if ((_ref15 = this.axesMap["bottom"]) != null) {
                            _ref15.showGrid = true;
                        }
                    }
                } else {
                    if (!((_ref16 = this.axesMap["left"]) != null ? _ref16.userSetShowGrid : void 0)) {
                        if ((_ref17 = this.axesMap["left"]) != null) {
                            _ref17.showGrid = true;
                        }
                    }
                }
            }
            if (this.legend === null && legendLabels.length > 1) {
                this.legend = new xchart.Legend;
            }
            if (this.legend) {
                this.legend.labels = legendLabels;
            }
            if (needHandleStack) {
                groupsMap = this.groupsMap;
                for (groupType in groupsMap) {
                    tempGroup = groupsMap[groupType];
                    seriesCount = tempGroup.length;
                    i = 0;
                    while (i < seriesCount) {
                        series = tempGroup[i];
                        stack = series.stack;
                        if (stack !== void 0) {
                            newArray = [series];
                            j = i + 1;
                            while (j < seriesCount) {
                                if (tempGroup[j].stack === stack) {
                                    newArray.push(tempGroup[j]);
                                    seriesCount--;
                                    tempGroup.splice(j, 1);
                                } else {
                                    j++;
                                }
                            }
                            if (newArray.length > 1) {
                                tempGroup[i] = newArray;
                            }
                        }
                        i++;
                    }
                }
                _results = [];
                for (type in groupsMap) {
                    group = groupsMap[type];
                    if (type === "column" || type === "bar" || type === "area") {
                        _results.push((function () {
                            var _len4, _m, _results1;
                            _results1 = [];
                            for (_m = 0, _len4 = group.length; _m < _len4; _m++) {
                                series = group[_m];
                                if (series instanceof Array) {
                                    stack = series;
                                    aggData = void 0;
                                    _results1.push((function () {
                                        var _len5, _n, _results2;
                                        _results2 = [];
                                        for (stackIndex = _n = 0, _len5 = stack.length; _n < _len5; stackIndex = ++_n) {
                                            series = stack[stackIndex];
                                            if (stackIndex === 0) {
                                                series.endData = series.getData();
                                                _results2.push(aggData = series.getData().concat());
                                            } else {
                                                series.startData = aggData.concat();
                                                tempData = series.getData();
                                                if (tempData) {
                                                    count = (aggData.length >= tempData.length ? aggData.length : tempData.length);
                                                    k = 0;
                                                    while (k < count) {
                                                        aggData[k] += tempData[k] || 0;
                                                        k++;
                                                    }
                                                }
                                                _results2.push(series.endData = aggData.concat());
                                            }
                                        }
                                        return _results2;
                                    })());
                                } else {
                                    _results1.push(series.endData = series.getData());
                                }
                            }
                            return _results1;
                        })());
                    } else {
                        _results.push((function () {
                            var _len4, _m, _results1;
                            _results1 = [];
                            for (_m = 0, _len4 = group.length; _m < _len4; _m++) {
                                series = group[_m];
                                _results1.push(series.visible && series.draw(this.graph, this.seriesArea));
                            }
                            return _results1;
                        }).call(this));
                    }
                }
                return _results;
            }
        };
        Chart.prototype.redrawDelay = function (delay) {
            var chart, func;
            chart = this;
            if (this._redrawTimer !== null) {
                clearTimeout(this._redrawTimer);
                this._redrawTimer = null;
            }
            func = function () {
                chart.redraw();
                return chart._redrawTimer = null;
            };
            return this._redrawTimer = setTimeout(func, delay || 50);
        };
        Chart.prototype.redraw = function (animate) {
            var axis, series, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
            if (!this.rendered) {
                return;
            }
            if (this.rendering) {
                return;
            }
            this.redrawing = true;
            this.layer.setDimensions({width:this.width, height:this.height});
            this.layer.clear();
            if ((_ref = this.scrollLayer) != null) {
                _ref.clear();
            }
            this.destroyText();
            this.groupsMap = {};
            this.doInitSeries();
            this.layout(this.layer);
            ((_ref1 = this.legend) != null ? _ref1.get("visible") : void 0) && ((_ref2 = this.legend) != null ? _ref2.render(this.layer) : void 0);
            if (this.axes) {
                _ref3 = this.axes;
                for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
                    axis = _ref3[_i];
                    if (this.seriesScrollableReal && ((this.reversed && axis.position !== "bottom") || (!this.reversed && axis.position === "bottom"))) {
                        axis.renderToScrollLayer = true;
                        axis.render(this.scrollLayer, this.axesArea);
                    } else {
                        axis.renderToScrollLayer = false;
                        axis.render(this.layer, this.axesArea);
                    }
                }
            }
            this.drawSeries();
            this.initTip();
            this.layer.renderAll();
            if ((_ref4 = this.scrollLayer) != null) {
                _ref4.renderAll();
            }
            this.renderText();
            if (!xchart.excanvas && animate !== false) {
                _ref5 = this.series;
                for (_j = 0, _len1 = _ref5.length; _j < _len1; _j++) {
                    series = _ref5[_j];
                    series.visible && series.showAnimate && series.showAnimate();
                }
            }
            return this.redrawing = false;
        };
        Chart.prototype.save = function () {
        };
        Chart.prototype.layout = function (layer) {
            var align, axesHeight, axesLeft, axesTop, axesWidth, axis, borderWidth, bottomAxes, bottomHeight, height, leftAxes, leftStart, leftWidth, legend, legendHeight, legendSize, legendWidth, margin, maxSize, position, rightAxes, rightWidth, seriesArea, size, style, titleHeight, titleSize, titleStyle, titleWidth, topStart, width, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _ref, _ref1, _ref2, _ref3, _results;
            width = this.width;
            height = this.height;
            titleWidth = 0;
            titleHeight = 0;
            legendWidth = 0;
            legendHeight = 0;
            style = this.get("style") || {};
            borderWidth = (_ref = style.borderWidth) != null ? _ref : 0;
            axesLeft = style.paddingLeft + borderWidth;
            axesTop = style.paddingTop + borderWidth;
            axesWidth = width - style.paddingLeft - style.paddingRight - borderWidth * 2;
            axesHeight = height - style.paddingTop - style.paddingBottom - borderWidth * 2;
            layer.add(new xchart.Rect({left:width / 2, top:height / 2, fill:style.backgroundColor, stroke:style.borderColor, strokeWidth:borderWidth, hasBorders:borderWidth !== 0, width:width - borderWidth * 2, height:height - borderWidth * 2}));
            if (this.title) {
                titleStyle = this.get("titleStyle");
                titleSize = xchart.TextMetrics.measure({text:this.title, fontSize:titleStyle.fontSize});
                titleWidth = titleSize.width;
                titleHeight = titleSize.height;
                this.addText({text:this.title, left:borderWidth, top:style.paddingTop + borderWidth, fontSize:titleStyle.fontSize, fill:titleStyle.color, width:this.width - borderWidth * 2, textAlign:titleStyle.align});
                axesHeight -= titleHeight + titleStyle.paddingBottom;
                axesTop += titleHeight + titleStyle.paddingBottom;
            }
            legend = this.legend;
            if (legend != null) {
                legend.chart = this;
            }
            if (legend && (legend != null ? legend.get("visible") : void 0)) {
                margin = legend.get("style").margin || 0;
                align = legend.get("align");
                position = legend.get("position");
                legendSize = legend.getSize();
                legendWidth = legendSize.width;
                legendHeight = legendSize.height;
                if (position === "top" || position === "bottom") {
                    if (align === "start") {
                        legend.left = axesLeft;
                    } else {
                        if (align === "end") {
                            legend.left = axesLeft + axesWidth - legendWidth;
                        } else {
                            legend.left = axesLeft + (axesWidth - legendWidth) / 2;
                        }
                    }
                } else {
                    if (align === "start") {
                        legend.top = axesTop;
                    } else {
                        if (align === "end") {
                            legend.top = axesTop + axesHeight - legendHeight;
                        } else {
                            legend.top = axesTop + (axesHeight - legendHeight) / 2;
                        }
                    }
                }
                switch (position) {
                  case "left":
                    this.legend.left = axesLeft;
                    axesWidth -= legendWidth + margin;
                    axesLeft += legendWidth + margin;
                    break;
                  case "right":
                    this.legend.left = axesLeft + axesWidth - legendWidth;
                    axesWidth -= legendWidth + margin;
                    break;
                  case "top":
                    this.legend.top = axesTop;
                    axesHeight -= legendHeight + margin;
                    axesTop += legendHeight + margin;
                    break;
                  case "bottom":
                    axesHeight -= legendHeight + margin;
                    this.legend.top = axesTop + axesHeight + margin;
                }
            }
            this.axesArea = {top:axesTop, left:axesLeft, width:axesWidth, height:axesHeight};
            leftAxes = [];
            rightAxes = [];
            bottomAxes = [];
            bottomHeight = 0;
            leftWidth = 0;
            rightWidth = 0;
            if (this.axes) {
                _ref1 = this.axes;
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    axis = _ref1[_i];
                    if (axis instanceof xchart.GaugeAxis || axis instanceof xchart.RadarAxis) {
                        continue;
                    }
                    position = axis.get("position");
                    switch (position) {
                      case "left":
                        leftAxes.push(axis);
                        leftWidth += axis.getWidth();
                        break;
                      case "right":
                        rightAxes.push(axis);
                        rightWidth += axis.getWidth();
                        break;
                      case "bottom":
                        bottomAxes.push(axis);
                        bottomHeight += axis.getHeight();
                    }
                }
            }
            leftWidth += leftAxes.length > 0 ? (leftAxes.length - 1) * 5 : 0;
            rightWidth += rightAxes.length > 0 ? (rightAxes.length - 1) * 5 : 0;
            bottomHeight += bottomAxes.length > 0 ? (bottomAxes.length - 1) * 5 : 0;
            leftStart = 0;
            for (_j = 0, _len1 = leftAxes.length; _j < _len1; _j++) {
                axis = leftAxes[_j];
                axis.left = leftStart + this.axesArea.left;
                axis.top = this.axesArea.top;
                axis.height = this.axesArea.height - bottomHeight;
                leftStart += axis.width + 5;
            }
            leftStart = 0;
            for (_k = 0, _len2 = rightAxes.length; _k < _len2; _k++) {
                axis = rightAxes[_k];
                axis.left = leftStart + this.axesArea.left + this.axesArea.width - rightWidth;
                axis.top = this.axesArea.top;
                axis.height = this.axesArea.height - bottomHeight;
                leftStart += axis.width + 5;
            }
            topStart = 0;
            for (_l = 0, _len3 = bottomAxes.length; _l < _len3; _l++) {
                axis = bottomAxes[_l];
                axis.left = this.axesArea.left + leftWidth;
                axis.top = topStart + this.axesArea.top + this.axesArea.height - bottomHeight;
                axis.width = this.axesArea.width - leftWidth - rightWidth;
                topStart += axis.height + 5;
            }
            seriesArea = {};
            seriesArea.top = this.axesArea.top;
            seriesArea.left = this.axesArea.left + leftWidth;
            seriesArea.width = this.axesArea.width - leftWidth - rightWidth;
            seriesArea.height = this.axesArea.height - bottomHeight;
            this.seriesArea = seriesArea;
            maxSize = 0;
            _ref2 = this.syncSizeAxes;
            for (_m = 0, _len4 = _ref2.length; _m < _len4; _m++) {
                axis = _ref2[_m];
                size = this.reversed ? axis.getContentHeight() : axis.getContentWidth();
                if (size > maxSize) {
                    maxSize = size;
                }
            }
            if (maxSize > 0) {
                _ref3 = this.syncSizeAxes;
                _results = [];
                for (_n = 0, _len5 = _ref3.length; _n < _len5; _n++) {
                    axis = _ref3[_n];
                    if (this.reversed) {
                        _results.push(axis.contentHeight = maxSize);
                    } else {
                        _results.push(axis.contentWidth = maxSize);
                    }
                }
                return _results;
            }
        };
        return Chart;
    })(xchart.Themeable);
    xchart.Chart = Chart;
}).call(this);
(function () {
    var getRotateLoc, oldIE, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    oldIE = xchart.excanvas;
    xchart.TextPool = {texts:[], count:0, borrowText:function () {
        if (this.texts.length > 0) {
            return this.texts.pop();
        } else {
            this.count++;
            return document.createElement("span");
        }
    }, returnText:function (text) {
        text.style.display = "none";
        return this.texts.push(text);
    }};
    getRotateLoc = function (rotation, left, top, width, height) {
        var centerX, centerY, newX, newY, point2x, point2y, x;
        x = rotation / 180 * Math.PI;
        centerX = left + width / 2;
        centerY = top + height / 2;
        point2x = left;
        point2y = top;
        newX = centerX + (point2x - centerX) * Math.cos(x) - (point2y - centerY) * Math.sin(x);
        newY = centerY + (point2x - centerX) * Math.sin(x) + (point2y - centerY) * Math.cos(x);
        return {left:newX, top:newY};
    };
    xchart.Text = (function (_super) {
        __extends(Text, _super);
        Text.include(xchart.Events);
        Text.include(xchart.Log);
        Text.prototype.angle = null;
        Text.prototype.fontSize = 12;
        Text.prototype.lineHeight = 12;
        Text.prototype.textAlign = "left";
        Text.prototype.verticalAlign = "middle";
        Text.prototype.left = null;
        Text.prototype.top = null;
        Text.prototype.width = null;
        Text.prototype.fill = null;
        Text.prototype.text = "";
        Text.prototype.dom = null;
        function Text(options) {
            var key, value, _ref;
            this.options = options;
            _ref = this.options;
            for (key in _ref) {
                value = _ref[key];
                this[key] = value;
            }
        }
        Text.prototype.destroy = function () {
            if (this.dom) {
                return xchart.TextPool.returnText(this.dom);
            }
        };
        Text.prototype.render = function (parent) {
            var costheta, deg, deg2radians, degr, dom, height, left, m11, m12, m21, m22, matrixValues, rad, sintheta, top, transformOrigin, width, _ref;
            if (this.width === 0 || isNaN(this.top) || isNaN(this.left)) {
                return;
            }
            dom = this.dom = xchart.TextPool.borrowText();
            parent.appendChild(dom);
            deg = this.rotation;
            if (deg) {
                deg2radians = Math.PI * 2 / 360;
                rad = deg * deg2radians;
                costheta = Math.cos(rad);
                sintheta = Math.sin(rad);
                m11 = costheta;
                m12 = -sintheta;
                m21 = sintheta;
                m22 = costheta;
                matrixValues = "M11=" + m11 + ", M12=" + m12 + ", M21=" + m21 + ", M22=" + m22;
                transformOrigin = null;
                if (this.width && this.textAlign) {
                    transformOrigin = "50% 50%";
                } else {
                    if (this.height && this.verticalAlign) {
                        transformOrigin = "50% 50%";
                    } else {
                        if (deg < 90) {
                            transformOrigin = "0 0";
                        } else {
                            if (deg < 180) {
                                transformOrigin = "0 100%";
                            } else {
                                if (deg < 270) {
                                    transformOrigin = "100% 100%";
                                } else {
                                    transformOrigin = "100% 0";
                                }
                            }
                        }
                    }
                }
                if (!oldIE) {
                    jQuery(dom).css({"-webkit-transform":"rotate(" + deg + "deg) translate3d( 0, 0, 0)", "-moz-transform":"rotate(" + deg + "deg)", "-ms-transform":"rotate(" + deg + "deg)", "transform":"rotate(" + deg + "deg)", "-moz-transform-origin":"0 0", "-webkit-transform-origin":transformOrigin, "-ms-transform-origin":transformOrigin, "transform-origin":transformOrigin});
                } else {
                    jQuery(dom).css({"filter":"progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand'," + matrixValues + ")", "-ms-filter":"progid:DXImageTransform.Microsoft.Matrix(SizingMethod='auto expand'," + matrixValues + ")"});
                }
            } else {
                if (!oldIE) {
                    jQuery(dom).css({"-webkit-transform":"", "-moz-transform":"", "-ms-transform":"", "transform":"", "filter":"", "-ms-filter":""});
                } else {
                    jQuery(dom).css({"filter":"", "-ms-filter":""});
                }
            }
            left = this.left;
            top = this.top;
            dom.style.display = "";
            dom.style.position = "absolute";
            dom.style.display = "inline-block";
            dom.style.overflow = "visible";
            dom.style.whiteSpace = "nowrap";
            dom.style.color = (_ref = this.fill) != null ? _ref : "";
            if (oldIE) {
                dom.style.fontFamily = "SimSun, Verdana, Arial, Helvetica, sans-serif";
            }
            dom.style.fontSize = this.fontSize + "px";
            dom.style.lineHeight = (this.fontSize > this.lineHeight ? this.fontSize : this.lineHeight) + "px";
            dom.style.zIndex = 10;
            dom.innerHTML = this.text;
            dom.style.width = "";
            width = dom.offsetWidth;
            height = dom.offsetHeight;
            if (deg) {
                degr = xchart.toRadians(deg);
            }
            if (this.width && this.textAlign) {
                if (this.textAlign === "center") {
                    left += (this.width - width) / 2;
                    if (deg && !oldIE) {
                        top += ((Math.abs(Math.cos(degr)) * height + width * Math.abs(Math.sin(degr))) - height) / 2;
                    }
                } else {
                    if (this.textAlign === "right") {
                        left += this.width - width;
                        if (deg && !oldIE) {
                            left -= ((Math.abs(Math.sin(degr)) * height + width * Math.abs(Math.cos(degr))) - width) / 2;
                        }
                    } else {
                        if (this.textAlign = "left") {
                            if (deg && !oldIE) {
                                left += ((Math.abs(Math.sin(degr)) * height + width * Math.abs(Math.cos(degr))) - width) / 2;
                            }
                        }
                    }
                }
            } else {
                if (this.height && this.verticalAlign) {
                    if (this.verticalAlign === "middle") {
                        top += (this.height - height) / 2;
                        if (deg && !oldIE) {
                            left += ((Math.abs(Math.sin(degr)) * height + width * Math.abs(Math.cos(degr))) - width) / 2;
                        }
                    } else {
                        if (this.verticalAlign === "bottom") {
                            top += this.height - height;
                        }
                    }
                } else {
                    if (deg) {
                        if (deg < 90) {
                        } else {
                            if (deg < 180) {
                                top -= height;
                            } else {
                                if (deg < 270) {
                                    top -= height;
                                    left -= width;
                                } else {
                                    left -= width;
                                }
                            }
                        }
                    }
                }
            }
            dom.style.left = left + "px";
            return dom.style.top = top + "px";
        };
        return Text;
    })(xchart.Module);
    xchart.TextMetrics = (function () {
        var shared;
        shared = null;
        return {measure:function (options) {
            var text, width;
            options = options ? options : {};
            width = options.width;
            text = options.text;
            if (!shared) {
                shared = xchart.TextMetrics.Instance(options);
            }
            shared.bind(options);
            shared.setFixedWidth(width || "auto");
            return shared.getSize(text, options);
        }};
    })();
    xchart.TextMetrics.Instance = function (options) {
        var el, fixedWidth, instance, target;
        target = options.target;
        fixedWidth = options.width;
        el = document.createElement("div");
        document.body.appendChild(el);
        jQuery(el).css({padding:"0", position:"absolute", left:-1000, top:-1000, visibility:"hidden"});
        if (fixedWidth) {
            jQuery(el).width(fixedWidth);
        }
        instance = {getSize:function (text, options) {
            var height, result, width;
            jQuery(el).text(text);
            result = {width:el.offsetWidth, height:el.offsetHeight};
            if (options && options.rotation) {
                width = result.width;
                height = result.height;
                result.width = width * Math.abs(Math.cos(xchart.toRadians(options.rotation))) + height * Math.abs(Math.sin(xchart.toRadians(options.rotation)));
                result.height = height * Math.abs(Math.cos(xchart.toRadians(options.rotation))) + width * Math.abs(Math.sin(xchart.toRadians(options.rotation)));
            }
            jQuery(el).text("");
            return result;
        }, bind:function (target) {
            target = target || {};
            if (target.fontSize === void 0) {
                target.fontSize = "";
            } else {
                if (/^\d+$/ig.test(target.fontSize)) {
                    target.fontSize += "px";
                }
            }
            if (target.fontStyle === void 0) {
                target.fontStyle = "";
            }
            if (target.fontWeight === void 0) {
                target.fontWeight = "";
            }
            if (target.fontFamily === void 0) {
                target.fontFamily = "";
            }
            if (target.nodeType) {
                return jQuery(el).css({"fontSize":jQuery(target).css("font-size"), "fontStyle":jQuery(target).css("font-style"), "fontWeight":jQuery(target).css("font-weight"), "fontFamily":jQuery(target).css("font-family")});
            } else {
                return jQuery(el).css(target);
            }
        }, setFixedWidth:function (width) {
            return jQuery(el).width(width);
        }, getWidth:function (text) {
            el.style.width = "auto";
            return this.getSize(text).width;
        }, getHeight:function (text) {
            return this.getSize(text).height;
        }};
        instance.bind(target);
        return instance;
    };
}).call(this);
(function () {
    var initOptions, symbolSizeMap;
    initOptions = function (options) {
        if (options.backgroundColor) {
            options.fill = options.backgroundColor;
            delete options.backgroundColor;
        }
        if (options.borderColor) {
            options.stroke = options.borderColor;
            delete options.borderColor;
        }
        if (options.borderWidth) {
            return options.strokeWidth = options.borderWidth;
        }
    };
    xchart.symbols = {diamond:function (options) {
        options = options || {};
        initOptions(options);
        options.angle = 45;
        if (options.size) {
            options.width = options.height = ~~(options.size / 1.414);
            delete options.size;
        }
        return new fabric.Rect(options);
    }, triangle:function (options) {
        options = options || {};
        initOptions(options);
        if (options.size) {
            options.width = options.height = options.size;
            delete options.size;
        }
        return new fabric.Triangle(options);
    }, circle:function (options) {
        options = options || {};
        initOptions(options);
        if (options.size) {
            options.radius = options.size / 2;
            delete options.size;
        }
        return new fabric.Circle(options);
    }, rect:function (options) {
        options = options || {};
        initOptions(options);
        if (options.size) {
            options.width = options.height = options.size;
            delete options.size;
        }
        return new fabric.Rect(options);
    }};
    xchart.createSymbol = function (type, options) {
        var builder;
        builder = xchart.symbols[type];
        if (!builder) {
            throw new Error("");
        }
        return builder(options);
    };
    symbolSizeMap = {diamond:"width,height", circle:"radius", triangle:"width,height", rect:"width,height"};
    xchart.setSymbolSize = function (type, symbol, size) {
        var prop, properties, property, _i, _len, _ref, _results;
        if (!(type || symbol)) {
            return;
        }
        size = size != null ? size : 0;
        property = (_ref = symbolSizeMap[type || "circle"]) != null ? _ref : "";
        properties = property.split(",");
        _results = [];
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
            prop = properties[_i];
            _results.push(symbol.set(prop, type === "circle" ? size / 2 : size));
        }
        return _results;
    };
    xchart.getSymbolAnimObject = function (type, size) {
        var prop, properties, property, result, _i, _len, _ref;
        size = size != null ? size : 0;
        property = (_ref = symbolSizeMap[type || "circle"]) != null ? _ref : "";
        properties = property.split(",");
        result = {};
        for (_i = 0, _len = properties.length; _i < _len; _i++) {
            prop = properties[_i];
            result[prop] = type === "circle" ? size / 2 : size;
        }
        return result;
    };
}).call(this);
(function () {
    var Axis, CategoryAxis, Events, GaugeAxis, Log, NumbericAxis, TimeAxis, axisSet, titleAlignMap, titleAlignMap2, _ref, _ref1, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Events = xchart.Events;
    Log = xchart.Log;
    xchart.makeTick = function (left, top, tickPosition, axisPosition, tickStyle) {
        var length;
        length = tickStyle.tickLength;
        switch (tickPosition) {
          case "inside":
            switch (axisPosition) {
              case "right":
                left -= length;
                break;
              case "bottom":
                top -= length;
            }
            break;
          case "outside":
            switch (axisPosition) {
              case "left":
                left -= length;
            }
            break;
          case "between":
            switch (axisPosition) {
              case "left":
              case "right":
                left -= length / 2;
                break;
              case "bottom":
                top -= length / 2;
            }
        }
        switch (axisPosition) {
          case "left":
          case "right":
            return new fabric.Line([Math.round(left), Math.round(top), Math.round(left + length), Math.round(top)], {stroke:tickStyle.tickColor, strokeWidth:tickStyle.tickWidth});
          case "bottom":
            return new fabric.Line([Math.round(left), Math.round(top), Math.round(left), Math.round(top + length)], {stroke:tickStyle.tickColor, strokeWidth:tickStyle.tickWidth});
        }
    };
    xchart.normalizeSteps = function (steps, multiples, axis) {
        var i, magnitude, normalized, _i, _len;
        normalized = void 0;
        magnitude = (multiples ? 1 : Math.pow(10, Math.floor(Math.log(steps) / Math.LN10)));
        normalized = steps / magnitude;
        if (!multiples) {
            multiples = [1, 2, 2.5, 5, 10];
            if (!axis.allowDecimals) {
                if (magnitude === 1) {
                    multiples = [1, 2, 5, 10];
                } else {
                    if (magnitude <= 0.1) {
                        multiples = [1 / magnitude];
                    }
                }
            }
        }
        for (i = _i = 0, _len = multiples.length; _i < _len; i = ++_i) {
            steps = multiples[i];
            if (normalized <= (multiples[i] + (multiples[i + 1] || multiples[i])) / 2) {
                break;
            }
        }
        steps *= magnitude;
        return steps;
    };
    titleAlignMap = {middle:"center", center:"center", start:"left", end:"right"};
    titleAlignMap2 = {middle:"middle", center:"middle", start:"top", end:"bottom"};
    Axis = (function (_super) {
        __extends(Axis, _super);
        function Axis() {
            _ref = Axis.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Axis.include(Events);
        Axis.include(Log);
        Axis.prototype.uninheritProperties = ["name", "title", "format", "formatter", "categories", "labelProperty", "properties", "position", "min", "max", "steps", "allowDecimals", "showGrid", "showMinorGrid", "width", "height"];
        Axis.prototype.tickLength = 5;
        Axis.prototype.tickPosition = "outside";
        Axis.prototype.position = "bottom";
        Axis.prototype.title = null;
        Axis.prototype.titleStyle = {};
        Axis.prototype.width = null;
        Axis.prototype.name = null;
        Axis.prototype.format = null;
        Axis.prototype.formatter = null;
        Axis.prototype.getContentWidth = function () {
            return this.width;
        };
        Axis.prototype.getContentHeight = function () {
            return this.height;
        };
        Axis.prototype.set = function (prop, value) {
            var key;
            if (typeof prop === "object") {
                for (key in prop) {
                    value = prop[key];
                    if (key === "position") {
                        this.userSetPosition = true;
                    }
                }
            } else {
                if (prop === "position") {
                    this.userSetPosition = true;
                }
            }
            return Axis.__super__.set.apply(this, arguments);
        };
        Axis.prototype.render = function (layer, axesArea) {
            var align, titleColor, titleSize, titleStyle, titleX, titleY, _ref1, _ref2, _ref3;
            if (this.title) {
                titleStyle = this.get("titleStyle") || {};
                titleColor = (_ref1 = titleStyle.color) != null ? _ref1 : "black";
                align = (_ref2 = titleStyle.align) != null ? _ref2 : "middle";
                titleSize = xchart.TextMetrics.measure({text:this.title, fontSize:(_ref3 = titleStyle.fontSize) != null ? _ref3 : 16});
                titleX = 0;
                titleY = 0;
                switch (this.position) {
                  case "top":
                    return titleX = 0;
                  case "bottom":
                    titleY = this.top + this.height;
                    return this.chart.addText({text:this.title, left:this.left, top:titleY - titleSize.height, fontSize:titleStyle.fontSize, width:this.width, fill:titleColor, textAlign:titleAlignMap[align]});
                  case "left":
                    if (align === "start") {
                        return this.chart.addText({text:this.title, left:this.left, top:axesArea.top, fontSize:titleStyle.fontSize, fill:titleColor, rotation:270});
                    } else {
                        if (align === "end") {
                            return this.chart.addText({text:this.title, left:this.left, top:axesArea.top + this.height - titleSize.width, fontSize:titleStyle.fontSize, fill:titleColor, rotation:270});
                        } else {
                            return this.chart.addText({text:this.title, left:this.left + titleStyle.margin / 2, top:axesArea.top, fontSize:titleStyle.fontSize, fill:titleColor, height:this.height, rotation:270, verticalAlign:"middle"});
                        }
                    }
                    break;
                  case "right":
                    if (align === "start") {
                        return this.chart.addText({text:this.title, left:this.left + this.width - titleSize.height - titleStyle.margin / 2, top:axesArea.top, fontSize:titleStyle.fontSize, fill:titleColor, rotation:90});
                    } else {
                        if (align === "end") {
                            return this.chart.addText({text:this.title, left:this.left + this.width - titleSize.height - titleStyle.margin / 2, top:axesArea.top + this.height - titleSize.width, fontSize:titleStyle.fontSize, fill:titleColor, rotation:90});
                        } else {
                            return this.chart.addText({text:this.title, left:this.left + this.width - titleSize.height - titleStyle.margin / 2, top:axesArea.top, fontSize:titleStyle.fontSize, fill:titleColor, height:this.height, rotation:90, verticalAlign:titleAlignMap2[align]});
                        }
                    }
                }
            }
        };
        Axis.prototype.bindSeries = function (newSeries) {
            var oldAxis;
            switch (this.position) {
              case "bottom":
                this.seriesProperty = "xAxis";
                break;
              case "left":
              case "right":
                this.seriesProperty = "yAxis";
            }
            if (!newSeries) {
                return;
            }
            if (this.series == null) {
                this.series = [];
            }
            oldAxis = newSeries[this.seriesProperty];
            if (oldAxis && oldAxis !== this) {
                oldAxis.unbindSeries(newSeries);
            }
            this.series.push(newSeries);
            return newSeries[this.seriesProperty] = this;
        };
        Axis.prototype.unbindSeries = function (series) {
            if (!series) {
                return;
            }
            series = this.series;
            if (series) {
                series.splice(this.series.indexOf(series), 1);
                return series[this.seriesProperty] = null;
            }
        };
        Axis.prototype.unbindAllSeries = function () {
            var series, _i, _len, _ref1;
            _ref1 = this.series != null;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                series = _ref1[_i];
                series[this.seriesProperty] = null;
            }
            return this.series = [];
        };
        Axis.prototype.getNearestPoint = function () {
        };
        Axis.prototype.clearPoints = function () {
            return this.points = [];
        };
        Axis.prototype.registerPoint = function (point, index) {
            if (!this.points) {
                this.points = [];
            }
            if (!this.points[index]) {
                this.points[index] = [];
            }
            return this.points[index].push(point);
        };
        Axis.prototype.getUnitWidth = function () {
        };
        Axis.prototype.makeTick = function (left, top, fillMinorTick) {
            var i, minorTickStyle, tick, tickCount, tickLeft, tickPosition, tickStyle, tickTop, unitWidth;
            switch (this.position) {
              case "left":
              case "right":
                this.tickPositions.push(Math.round(top));
                break;
              case "bottom":
                this.tickPositions.push(Math.round(left));
            }
            if (this instanceof xchart.NumbericAxis && this.minorTickPosition && this.minorTickPosition !== "none") {
                minorTickStyle = this.get("minorTickStyle") || {};
                tickCount = minorTickStyle.tickCount || 2;
                unitWidth = this.getUnitWidth();
                i = fillMinorTick ? -1 * tickCount : 0;
                while (i < tickCount) {
                    if (i !== 0) {
                        switch (this.position) {
                          case "left":
                          case "right":
                            tickTop = top - i * this.steps * unitWidth / tickCount;
                            if (tickTop > this.top && tickTop < this.top + this.height) {
                                this.minorTickPositions.push(tickTop);
                                tick = xchart.makeTick(left, tickTop, this.minorTickPosition, this.position, minorTickStyle);
                                this.axisGroup.add(tick);
                            }
                            break;
                          case "bottom":
                            tickLeft = left + i * this.steps * unitWidth / tickCount;
                            if (tickLeft > this.left && tickLeft < this.left + this.width) {
                                this.minorTickPositions.push(tickLeft);
                                tick = xchart.makeTick(tickLeft, top, this.minorTickPosition, this.position, minorTickStyle);
                                this.axisGroup.add(tick);
                            }
                        }
                    }
                    i++;
                }
            }
            tickPosition = this.get("tickPosition");
            if (tickPosition === "none") {
            } else {
                tickStyle = this.get("tickStyle") || {};
                return this.axisGroup.add(xchart.makeTick(left, top, tickPosition, this.position, tickStyle));
            }
        };
        return Axis;
    })(xchart.Themeable);
    CategoryAxis = (function (_super) {
        __extends(CategoryAxis, _super);
        CategoryAxis.prototype.themePath = "categoryAxis";
        CategoryAxis.prototype.tickmarkPlacement = "between";
        CategoryAxis.prototype.tickPixelInterval = 72;
        CategoryAxis.prototype.seriesProperty = null;
        CategoryAxis.prototype.showGrid = null;
        CategoryAxis.prototype.showMinorGrid = null;
        CategoryAxis.prototype.gridStyle = null;
        CategoryAxis.prototype.minorGridStyle = null;
        CategoryAxis.prototype.getLabel = function (index) {
            var categories;
            categories = this.get("categories") || [];
            return categories[index];
        };
        CategoryAxis.prototype.doGetCategories = function () {
            return this.get("categories") || [1];
        };
        CategoryAxis.prototype.getCategories = function () {
            var categories, category, format, formatter, index, labels, result, template, _i, _j, _len, _len1, _ref1, _ref2;
            categories = this.doGetCategories();
            labels = (_ref1 = this.get("labels")) != null ? _ref1 : {};
            format = labels.format;
            formatter = labels.formatter;
            if (format || formatter) {
                result = [];
                if (typeof formatter === "function") {
                    for (index = _i = 0, _len = categories.length; _i < _len; index = ++_i) {
                        category = categories[index];
                        result.push("" + ((_ref2 = formatter.apply(null, [category, index])) != null ? _ref2 : ""));
                    }
                } else {
                    if (format) {
                        template = xchart.template(format);
                        for (index = _j = 0, _len1 = categories.length; _j < _len1; index = ++_j) {
                            category = categories[index];
                            result.push(template({value:category, index:index}));
                        }
                    }
                }
                return result;
            } else {
                return categories;
            }
        };
        CategoryAxis.prototype.getUnitWidth = function () {
            var length;
            if (this.renderToScrollLayer) {
                length = this.position === "bottom" ? this.contentWidth : this.contentHeight;
            } else {
                length = this.position === "bottom" ? this.width : this.height;
            }
            return length / this.getCategories().length;
        };
        function CategoryAxis(options) {
            CategoryAxis.__super__.constructor.apply(this, arguments);
        }
        CategoryAxis.prototype.clearPoints = function () {
            return this.points = [];
        };
        CategoryAxis.prototype.registerPoint = function (point, index) {
            if (!this.points) {
                this.points = [];
            }
            if (!this.points[index]) {
                this.points[index] = [];
            }
            return this.points[index].push(point);
        };
        CategoryAxis.prototype.getCategoryIndexByPosition = function (x, y) {
            var axesArea, categoryIndex, chart, index, reversed, seriesArea, startLeft, startTop, tickPosition, tickPositions, _i, _j, _len, _len1;
            tickPositions = this.tickPositions;
            categoryIndex = null;
            chart = this.chart;
            seriesArea = chart.seriesArea;
            axesArea = chart.axesArea;
            reversed = chart.reversed;
            if (this.renderToScrollLayer) {
                if (reversed) {
                    startTop = axesArea.top;
                } else {
                    startLeft = seriesArea.left;
                }
            } else {
                if (reversed) {
                    startTop = 0;
                } else {
                    startLeft = 0;
                }
            }
            if (this.position === "bottom") {
                for (index = _i = 0, _len = tickPositions.length; _i < _len; index = ++_i) {
                    tickPosition = tickPositions[index];
                    if (x < tickPosition + startLeft) {
                        categoryIndex = index - 1;
                        break;
                    }
                }
            } else {
                for (index = _j = 0, _len1 = tickPositions.length; _j < _len1; index = ++_j) {
                    tickPosition = tickPositions[index];
                    if (y < tickPosition + startTop) {
                        categoryIndex = index - 1;
                        break;
                    }
                }
            }
            return categoryIndex;
        };
        CategoryAxis.prototype.getNearestPoint = function (x, y) {
            var categoryIndex, dis, distance, index, minDistance, point, points, result, seriesArea, startLeft, startTop, startValue, tickPosition, tickPositions, _i, _j, _len, _len1;
            tickPositions = this.tickPositions;
            categoryIndex = null;
            seriesArea = this.chart.seriesArea;
            if (this.renderToScrollLayer) {
                if (this.chart.reversed) {
                    startLeft = this.chart.axesArea.left;
                    startTop = seriesArea.top;
                } else {
                    startLeft = seriesArea.left;
                    startTop = seriesArea.top;
                }
            } else {
                startLeft = 0;
                startTop = 0;
            }
            distance = function (point) {
                return Math.sqrt(Math.pow(x - startLeft - point.left, 2) + Math.pow(y - startTop - point.top, 2));
            };
            startValue = this.position === "bottom" ? startLeft : startTop;
            for (index = _i = 0, _len = tickPositions.length; _i < _len; index = ++_i) {
                tickPosition = tickPositions[index];
                if (x < tickPosition + startValue) {
                    categoryIndex = index - 1;
                    break;
                }
            }
            result = null;
            if (categoryIndex !== null) {
                points = this.points[categoryIndex];
                if (points) {
                    minDistance = 10000000;
                    for (index = _j = 0, _len1 = points.length; _j < _len1; index = ++_j) {
                        point = points[index];
                        dis = distance(point);
                        if (dis < minDistance) {
                            minDistance = dis;
                            result = point;
                        }
                    }
                }
            }
            return result;
        };
        CategoryAxis.prototype.render = function (layer, axesArea) {
            var addText, axisGroup, categories, category, index, labelColor, labelPadding, labels, renderToScrollLayer, reversed, scrollLeft, startLeft, startTop, style, textY, tickLength, tickLengthValue, tickPosition, tickStyle, tickmarkPlacement, unitHeight, unitWidth, _i, _j, _k, _len, _len1, _len2, _ref1, _ref2;
            CategoryAxis.__super__.render.apply(this, arguments);
            axisGroup = this.axisGroup = new fabric.Group;
            labels = this.get("labels") || {};
            labelColor = (_ref1 = labels.color) != null ? _ref1 : "black";
            labelPadding = labels.labelPadding || 4;
            tickmarkPlacement = this.get("tickmarkPlacement");
            style = this.get("style") || {};
            tickPosition = this.get("tickPosition");
            tickStyle = this.get("tickStyle") || {};
            tickLength = (_ref2 = tickStyle.tickLength) != null ? _ref2 : 0;
            tickLengthValue = tickLength;
            renderToScrollLayer = this.renderToScrollLayer;
            reversed = this.chart.reversed;
            if (renderToScrollLayer) {
                if (reversed) {
                    startLeft = this.left - axesArea.left;
                    startTop = this.top - axesArea.top;
                } else {
                    startLeft = this.left - this.chart.seriesArea.left;
                    startTop = this.top - axesArea.top;
                }
            } else {
                startLeft = this.left;
                startTop = this.top;
            }
            if (tickPosition === "between") {
                tickLengthValue = Math.round(tickLength / 2);
            } else {
                if (tickPosition === "none" || tickPosition === "inside") {
                    tickLengthValue = 0;
                }
            }
            this.tickPositions = [];
            scrollLeft = this.chart.scrollLeft || 0;
            if (this.position === "bottom") {
                axisGroup.add(new fabric.Line([startLeft, startTop, startLeft + this.width, startTop], {stroke:style.lineColor, strokeWidth:style.lineWidth}));
                categories = this.getCategories();
                unitWidth = this.getUnitWidth();
                if (tickmarkPlacement === "between") {
                    this.makeTick(startLeft, startTop);
                }
                for (index = _i = 0, _len = categories.length; _i < _len; index = ++_i) {
                    category = categories[index];
                    if (renderToScrollLayer) {
                        addText = this.chart.addTextForScrollLayer;
                    } else {
                        addText = this.chart.addText;
                    }
                    addText.call(this.chart, {text:category, rotation:labels.rotation, fontSize:labels.fontSize, left:startLeft + unitWidth * index - scrollLeft, top:startTop + labelPadding + tickLengthValue, width:unitWidth, textAlign:"center", fill:labelColor});
                    if (tickmarkPlacement === "between") {
                        this.makeTick(startLeft + unitWidth * (index + 1) - scrollLeft, startTop);
                    } else {
                        this.makeTick(startLeft + unitWidth * (index + 0.5) - scrollLeft, startTop);
                    }
                }
            } else {
                if (this.position === "left") {
                    axisGroup.add(new fabric.Line([startLeft + this.width, startTop, startLeft + this.width, startTop + this.height], {stroke:style.lineColor, strokeWidth:style.lineWidth}));
                    categories = this.getCategories();
                    unitHeight = this.getUnitWidth();
                    if (tickmarkPlacement === "between") {
                        this.makeTick(startLeft + this.width, startTop);
                    }
                    for (index = _j = 0, _len1 = categories.length; _j < _len1; index = ++_j) {
                        category = categories[index];
                        textY = this.translateLabel(index);
                        if (renderToScrollLayer) {
                            addText = this.chart.addTextForScrollLayer;
                        } else {
                            addText = this.chart.addText;
                        }
                        addText.call(this.chart, {text:category, rotation:labels.rotation, fontSize:labels.fontSize, textAlign:"right", verticalAlign:"middle", left:startLeft - tickLengthValue, top:textY + unitHeight * 0.5 - 4, width:this.width, fill:labelColor});
                        if (tickmarkPlacement === "between") {
                            this.makeTick(startLeft + this.width, textY + unitHeight);
                        } else {
                            this.makeTick(startLeft + this.width, textY + unitHeight / 2);
                        }
                    }
                } else {
                    if (this.position === "right") {
                        axisGroup.add(new fabric.Line([startLeft, startTop, startLeft, startTop + this.height], {stroke:style.lineColor, strokeWidth:style.lineWidth}));
                        categories = this.getCategories();
                        unitHeight = this.getUnitWidth();
                        if (tickmarkPlacement === "between") {
                            this.makeTick(startLeft, startTop);
                        }
                        for (index = _k = 0, _len2 = categories.length; _k < _len2; index = ++_k) {
                            category = categories[index];
                            textY = this.translateLabel(index);
                            if (renderToScrollLayer) {
                                addText = this.chart.addTextForScrollLayer;
                            } else {
                                addText = this.chart.addText;
                            }
                            addText.call(this.chart, {text:category, rotation:labels.rotation, fontSize:labels.fontSize, textAlign:"left", verticalAlign:"middle", left:startLeft + labelPadding + tickLengthValue, top:textY + unitHeight * 0.5 - 4, width:this.width, fill:labelColor});
                            if (tickmarkPlacement === "between") {
                                this.makeTick(startLeft, textY + unitHeight);
                            } else {
                                this.makeTick(startLeft, textY + unitHeight / 2);
                            }
                        }
                    }
                }
            }
            layer.add(axisGroup);
            return this.drawGrid(layer);
        };
        CategoryAxis.prototype.getContentWidth = function () {
            var minWidth;
            minWidth = this.get("tickPixelInterval") * (this.categories || []).length;
            if (this.width < minWidth) {
                return minWidth;
            } else {
                return this.width;
            }
        };
        CategoryAxis.prototype.getContentHeight = function () {
            var categories, minHeight;
            categories = this.categories || [];
            minHeight = this.get("tickPixelInterval") * categories.length;
            if (this.height < minHeight) {
                return minHeight;
            } else {
                return this.height;
            }
        };
        CategoryAxis.prototype.getWidth = function () {
            var labelPadding, labels, maxLengthString, tickLength, tickLengthValue, tickPosition, tickStyle, titleStyle, width, _ref1, _ref2, _ref3;
            width = 0;
            labels = this.get("labels") || {};
            labelPadding = labels.labelPadding || 4;
            maxLengthString = _.max(this.getCategories(), function (string) {
                return string.length;
            });
            width = xchart.TextMetrics.measure({text:maxLengthString, fontSize:(_ref1 = labels.fontSize) != null ? _ref1 : 12}).width;
            tickPosition = this.get("tickPosition");
            tickStyle = this.get("tickStyle") || {};
            tickLength = (_ref2 = tickStyle.tickLength) != null ? _ref2 : 0;
            tickLengthValue = tickLength;
            if (tickPosition === "between") {
                tickLengthValue = Math.round(tickLength / 2);
            } else {
                if (tickPosition === "none" || tickPosition === "inside") {
                    tickLengthValue = 0;
                }
            }
            this.width = width + tickLengthValue + labelPadding;
            if (this.title) {
                titleStyle = this.get("titleStyle") || {};
                this.width += xchart.TextMetrics.measure({text:this.title, fontSize:(_ref3 = titleStyle.fontSize) != null ? _ref3 : 16}).height + this.get("titleStyle").margin;
            }
            return this.width;
        };
        CategoryAxis.prototype.getHeight = function () {
            var categories, height, labels, maxLengthString, tickLength, tickLengthValue, tickPosition, tickStyle, titleStyle, _ref1, _ref2;
            categories = this.getCategories();
            labels = this.get("labels") || {};
            tickStyle = this.get("tickStyle") || {};
            maxLengthString = _.max(categories, function (string) {
                return string.length;
            });
            height = xchart.TextMetrics.measure({text:maxLengthString, fontSize:labels.fontSize, rotation:labels.rotation}).height;
            height += labels.labelPadding || 4;
            tickPosition = this.get("tickPosition");
            tickStyle = this.get("tickStyle") || {};
            tickLength = (_ref1 = tickStyle.tickLength) != null ? _ref1 : 0;
            tickLengthValue = tickLength;
            if (tickPosition === "between") {
                tickLengthValue = Math.round(tickLength / 2);
            } else {
                if (tickPosition === "none" || tickPosition === "inside") {
                    tickLengthValue = 0;
                }
            }
            height += tickLengthValue;
            if (this.title) {
                titleStyle = this.get("titleStyle") || {};
                height += xchart.TextMetrics.measure({text:this.title, fontSize:(_ref2 = titleStyle.fontSize) != null ? _ref2 : 16}).height + titleStyle.margin;
            }
            this.height = height;
            return this.height;
        };
        CategoryAxis.prototype.drawGrid = function (layer) {
            var axesArea, gridStyle, line, minorGridStyle, position, reversed, seriesArea, showGrid, showMinorGrid, startLeft, startTop, temp, _i, _j, _len, _len1, _ref1, _ref2, _results;
            showGrid = this.get("showGrid");
            showMinorGrid = this.get("showMinorGrid");
            if (!showGrid) {
                return;
            }
            gridStyle = this.get("gridStyle") || {};
            minorGridStyle = this.get("minorGridStyle") || {};
            seriesArea = this.chart.seriesArea;
            axesArea = this.chart.axesArea;
            reversed = this.chart.reversed;
            if (this.renderToScrollLayer) {
                if (reversed) {
                    startLeft = -1 * axesArea.left;
                    startTop = -1 * axesArea.top;
                } else {
                    startLeft = -1 * seriesArea.left;
                    startTop = -1 * axesArea.top;
                }
            } else {
                startLeft = 0;
                startTop = 0;
            }
            _ref1 = this.tickPositions;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                position = _ref1[_i];
                if (this.position === "bottom") {
                    temp = [position, Math.round(startTop + seriesArea.top), position, Math.round(startTop + seriesArea.top + seriesArea.height)];
                } else {
                    temp = [Math.round(startLeft + seriesArea.left), position, Math.round(startLeft + seriesArea.left + seriesArea.width), position];
                }
                line = new fabric.Line(temp, {stroke:gridStyle.lineColor, strokeWidth:gridStyle.lineWidth, lineCap:"round", lineJoin:"round"});
                layer.add(line);
            }
            if (this.minorTickPositions) {
                _ref2 = this.minorTickPositions;
                _results = [];
                for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
                    position = _ref2[_j];
                    if (this.position === "bottom") {
                        temp = [position, Math.round(startTop + seriesArea.top), position, Math.round(startTop + seriesArea.top + seriesArea.height)];
                    } else {
                        temp = [Math.round(startLeft + seriesArea.left), position, Math.round(startLeft + seriesArea.left + seriesArea.width), position];
                    }
                    line = new fabric.Line(temp, {stroke:minorGridStyle.lineColor, strokeWidth:minorGridStyle.lineWidth, lineCap:"round", lineJoin:"round"});
                    _results.push(layer.add(line));
                }
                return _results;
            }
        };
        CategoryAxis.prototype.translateLabel = function (value) {
            var seriesArea, startLeft, startTop, unitWidth;
            seriesArea = this.chart.seriesArea;
            if (this.renderToScrollLayer) {
                startLeft = this.left - seriesArea.left;
                startTop = this.top - seriesArea.top;
            } else {
                startLeft = this.left;
                startTop = this.top;
            }
            if (this.position === "left" || this.position === "right") {
                unitWidth = this.getUnitWidth();
                value = parseInt(value, 10);
                return startTop + unitWidth * value;
            } else {
                unitWidth = this.getUnitWidth();
                if (value == null) {
                    value = 0;
                }
                if (this.get("tickmarkPlacement") === "between") {
                    return startLeft + unitWidth * (value + 0.5);
                } else {
                    return startLeft + unitWidth * 0.5 + unitWidth * value;
                }
            }
        };
        return CategoryAxis;
    })(Axis);
    axisSet = Axis.prototype.set;
    NumbericAxis = (function (_super) {
        __extends(NumbericAxis, _super);
        function NumbericAxis() {
            _ref1 = NumbericAxis.__super__.constructor.apply(this, arguments);
            return _ref1;
        }
        NumbericAxis.prototype.position = "left";
        NumbericAxis.prototype.themePath = "numbericAxis";
        NumbericAxis.prototype.startOnTick = true;
        NumbericAxis.prototype.endOnTick = true;
        NumbericAxis.prototype.minPadding = 0.05;
        NumbericAxis.prototype.maxPadding = 0.05;
        NumbericAxis.prototype.allowDecimals = false;
        NumbericAxis.prototype.labelDecimals = null;
        NumbericAxis.prototype.tickPixelInterval = 100;
        NumbericAxis.prototype.seriesProperty = null;
        NumbericAxis.prototype.min = 0;
        NumbericAxis.prototype.max = 10;
        NumbericAxis.prototype.filterSet = function (prop, value) {
            if (prop === "min" && value !== void 0) {
                return this.userSetMin = true;
            } else {
                if (prop === "max" && value !== void 0) {
                    return this.userSetMax = true;
                } else {
                    if (prop === "steps" && value !== void 0) {
                        return this.userSetSteps = true;
                    } else {
                        if (prop === "showGrid" && value !== void 0) {
                            return this.userSetShowGrid = true;
                        } else {
                            if (prop === "showMinorGrid" && value !== void 0) {
                                return this.userSetShowMinorGrid = true;
                            }
                        }
                    }
                }
            }
        };
        NumbericAxis.prototype.set = function (prop, value) {
            var key;
            if (typeof prop === "object") {
                for (key in prop) {
                    value = prop[key];
                    this.filterSet(key, value);
                }
            } else {
                this.filterSet(prop, value);
            }
            return axisSet.apply(this, arguments);
        };
        NumbericAxis.prototype.getLabel = function (index) {
            return this.innerLabels[index];
        };
        NumbericAxis.prototype.getUnitWidth = function () {
            var length;
            if (this.renderToScrollLayer) {
                length = this.position === "bottom" ? this.contentWidth : this.contentHeight;
            } else {
                length = this.position === "bottom" ? this.width : this.height;
            }
            return length / (this.max - this.min);
        };
        NumbericAxis.prototype.init = function () {
            this.initRange();
            return this.initLabels();
        };
        NumbericAxis.prototype.serieDataChanged = function () {
            return this.init();
        };
        NumbericAxis.prototype.initRange = function () {
            var dataRange, max, maxPadding, min, minPadding, range, series, _i, _len, _ref2;
            if (!this.series) {
                return {min:0, max:10};
            }
            _ref2 = this.series;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                series = _ref2[_i];
                if (!series.visible) {
                    continue;
                }
                if (this.position === "left" || this.position === "right") {
                    dataRange = series.getMinMaxYValues();
                } else {
                    dataRange = series.getMinMaxXValues();
                }
                if (dataRange) {
                    if (min === void 0 && max === void 0) {
                        min = dataRange.min;
                        max = dataRange.max;
                    }
                    if (dataRange.min < min) {
                        min = dataRange.min;
                    }
                    if (dataRange.max > max) {
                        max = dataRange.max;
                    }
                }
            }
            if (min === void 0 || max === void 0) {
                if (min === void 0) {
                    min = 0;
                }
                if (max === void 0) {
                    max = 10;
                }
            } else {
                maxPadding = this.get("maxPadding");
                minPadding = this.get("minPadding");
                range = max - min;
                max = max + range * maxPadding;
                min = min - range * minPadding;
                if (!this.allowDecimals) {
                    max = Math.ceil(max);
                    min = Math.floor(min);
                }
            }
            if (!this.userSetMax) {
                this.max = max;
            }
            if (!this.userSetMin) {
                this.min = min;
            }
            return this.dataRange = {min:this.min, max:this.max};
        };
        NumbericAxis.prototype.initLabels = function () {
            var axisLength, endOnTick, format, formatter, i, index, label, labelDecimals, labels, max, min, range, startOnTick, steps, template, _i, _j, _len, _len1, _ref2, _ref3, _ref4, _ref5, _ref6, _results, _results1;
            if (this.position === "left" || this.position === "right") {
                axisLength = (_ref2 = this.height) != null ? _ref2 : 600;
            } else {
                axisLength = (_ref3 = this.width) != null ? _ref3 : 800;
            }
            this.innerLabels = [];
            this.innerValues = [];
            range = this.max - this.min;
            if (isNaN(range) || range < 0) {
                return;
            }
            if (!this.userSetSteps) {
                steps = range * this.tickPixelInterval / axisLength;
                this.steps = xchart.normalizeSteps(steps, null, this);
            }
            startOnTick = this.get("startOnTick");
            endOnTick = this.get("endOnTick");
            if (startOnTick && !this.userSetMin) {
                this.min = Math.floor(this.min / this.steps) * this.steps;
            }
            if (endOnTick && !this.userSetMax) {
                this.max = Math.ceil(this.max / this.steps) * this.steps;
            }
            min = this.min || 0;
            max = this.max || 10;
            steps = this.steps;
            if (startOnTick) {
                i = min;
            } else {
                i = Math.floor(min / this.steps) * this.steps;
            }
            labelDecimals = this.get("labelDecimals");
            while (i < max) {
                if (i >= min) {
                    if (labelDecimals !== void 0) {
                        label = "" + i.toFixed(labelDecimals);
                    } else {
                        label = "" + i;
                    }
                    this.innerLabels.push(label);
                    this.innerValues.push(i);
                }
                i += steps;
            }
            if (!this.userSetSteps && endOnTick) {
                if (labelDecimals !== void 0) {
                    this.innerLabels.push("" + i.toFixed(labelDecimals));
                } else {
                    this.innerLabels.push("" + i);
                }
                this.innerValues.push(i);
                this.dataRange = {min:min, max:i};
            } else {
                this.dataRange = {min:min, max:max};
            }
            labels = (_ref4 = this.get("labels")) != null ? _ref4 : {};
            format = labels.format;
            formatter = labels.formatter;
            if (format || formatter) {
                if (typeof formatter === "function") {
                    _ref5 = this.innerLabels;
                    _results = [];
                    for (index = _i = 0, _len = _ref5.length; _i < _len; index = ++_i) {
                        label = _ref5[index];
                        _results.push(this.innerLabels[index] = "" + ((formatter.apply(null, [label, index])) || ""));
                    }
                    return _results;
                } else {
                    if (format) {
                        template = xchart.template(format);
                        _ref6 = this.innerLabels;
                        _results1 = [];
                        for (index = _j = 0, _len1 = _ref6.length; _j < _len1; index = ++_j) {
                            label = _ref6[index];
                            _results1.push(this.innerLabels[index] = template({value:label, index:index}));
                        }
                        return _results1;
                    }
                }
            }
        };
        NumbericAxis.prototype.getWidth = function () {
            var labelPadding, labels, maxLengthString, tickLength, tickLengthValue, tickPosition, tickStyle, titleStyle, _ref2, _ref3, _ref4;
            this.init();
            maxLengthString = _.max(this.innerLabels, function (string) {
                var _ref2;
                return ((_ref2 = "" + string) != null ? _ref2 : "").length;
            });
            labels = this.get("labels") || {};
            labelPadding = labels.labelPadding || 4;
            this.width = xchart.TextMetrics.measure({text:maxLengthString, fontSize:(_ref2 = labels.fontSize) != null ? _ref2 : 12, rotation:labels.rotation}).width;
            tickPosition = this.get("tickPosition");
            tickStyle = this.get("tickStyle") || {};
            tickLength = (_ref3 = tickStyle.tickLength) != null ? _ref3 : 0;
            tickLengthValue = tickLength;
            if (tickPosition === "between") {
                tickLengthValue = Math.round(tickLength / 2);
            } else {
                if (tickPosition === "none" || tickPosition === "inside") {
                    tickLengthValue = 0;
                }
            }
            this.width += tickLengthValue;
            this.width += labelPadding;
            if (this.title) {
                titleStyle = this.get("titleStyle");
                this.width += xchart.TextMetrics.measure({text:this.title, fontSize:(_ref4 = titleStyle.fontSize) != null ? _ref4 : 16}).height + titleStyle.margin;
            }
            return this.width;
        };
        NumbericAxis.prototype.getHeight = function () {
            var height, labels, tickLength, tickLengthValue, tickPosition, tickStyle, titleStyle, _ref2, _ref3, _ref4;
            labels = this.get("labels") || {};
            height = xchart.TextMetrics.measure({text:"" + this.max, fontSize:(_ref2 = labels.fontSize) != null ? _ref2 : 12, rotation:labels.rotation}).height;
            height += labels.labelPadding || 4;
            tickPosition = this.get("tickPosition");
            tickStyle = this.get("tickStyle") || {};
            tickLength = (_ref3 = tickStyle.tickLength) != null ? _ref3 : 0;
            tickLengthValue = tickLength;
            if (tickPosition === "between") {
                tickLengthValue = Math.round(tickLength / 2);
            } else {
                if (tickPosition === "none" || tickPosition === "inside") {
                    tickLengthValue = 0;
                }
            }
            height += tickLengthValue;
            if (this.title) {
                titleStyle = this.get("titleStyle");
                height += xchart.TextMetrics.measure({text:this.title, fontSize:(_ref4 = titleStyle.fontSize) != null ? _ref4 : 16}).height + titleStyle.margin;
            }
            this.height = height;
            return this.height;
        };
        NumbericAxis.prototype.translate = function (value) {
            var dataRange, seriesArea, startLeft, startTop, unitLength;
            seriesArea = this.chart.seriesArea;
            dataRange = this.dataRange;
            if (this.position === "left" || this.position === "right") {
                if (this.chart.seriesScrollableReal) {
                    startTop = this.top - seriesArea.top;
                } else {
                    startTop = this.top;
                }
                unitLength = this.height / (dataRange.max - dataRange.min);
                return (dataRange.max - value) * unitLength + startTop;
            } else {
                if (this.chart.seriesScrollableReal) {
                    startLeft = this.left - this.chart.axesArea.left;
                } else {
                    startLeft = this.left;
                }
                unitLength = this.width / (dataRange.max - dataRange.min);
                return (value - dataRange.min) * unitLength + startLeft;
            }
        };
        NumbericAxis.prototype.translateTick = function (value) {
            var dataRange, unitLength;
            dataRange = this.dataRange;
            if (this.position === "left" || this.position === "right") {
                unitLength = this.height / (dataRange.max - dataRange.min);
                return (dataRange.max - value) * unitLength + this.top;
            } else {
                unitLength = this.width / (dataRange.max - dataRange.min);
                return (value - dataRange.min) * unitLength + this.left;
            }
        };
        NumbericAxis.prototype.drawGrid = function (layer) {
            var endOnTick, gridStyle, line, minorGridStyle, position, seriesArea, showGrid, showMinorGrid, temp, _i, _j, _len, _len1, _ref2, _ref3;
            showGrid = this.get("showGrid");
            showMinorGrid = this.get("showMinorGrid");
            if (!showGrid) {
                return;
            }
            gridStyle = this.get("gridStyle") || {};
            minorGridStyle = this.get("minorGridStyle") || {};
            seriesArea = this.chart.seriesArea;
            _ref2 = this.tickPositions;
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                position = _ref2[_i];
                if (this.position !== "bottom") {
                    temp = [Math.round(seriesArea.left), position, Math.round(seriesArea.left + seriesArea.width), position];
                } else {
                    temp = [position, Math.round(seriesArea.top), position, Math.round(seriesArea.top + seriesArea.height)];
                }
                line = new fabric.Line(temp, {stroke:gridStyle.lineColor, strokeWidth:gridStyle.lineWidth, lineCap:"round", lineJoin:"round"});
                layer.add(line);
            }
            if (this.minorTickPositions) {
                _ref3 = this.minorTickPositions;
                for (_j = 0, _len1 = _ref3.length; _j < _len1; _j++) {
                    position = _ref3[_j];
                    line = new fabric.Line([position, Math.round(seriesArea.top), position, Math.round(seriesArea.top + seriesArea.height)], {stroke:minorGridStyle.lineColor, strokeWidth:minorGridStyle.lineWidth, lineCap:"round", lineJoin:"round"});
                    layer.add(line);
                }
            }
            endOnTick = this.get("endOnTick");
            if (!endOnTick) {
                if (this.position !== "bottom") {
                    temp = [Math.round(seriesArea.left), Math.round(seriesArea.top), Math.round(seriesArea.left + seriesArea.width), Math.round(seriesArea.top)];
                } else {
                    temp = [Math.round(seriesArea.left + seriesArea.width), Math.round(seriesArea.top), Math.round(seriesArea.left + seriesArea.width), Math.round(seriesArea.top + seriesArea.height + 1)];
                }
                line = new fabric.Line(temp, {stroke:gridStyle.lineColor, strokeWidth:gridStyle.lineWidth, lineCap:"round", lineJoin:"round"});
                return layer.add(line);
            }
        };
        NumbericAxis.prototype.render = function (layer, axesArea) {
            var addText, axisGroup, cellWidth, index, label, labelColor, labelPadding, labels, left, minorTickPosition, needFillMinorTick, renderToScrollLayer, reversed, startLeft, startOnTick, startTop, style, textGroup, textY, tickLength, tickLengthValue, tickPosition, tickStyle, _i, _j, _k, _len, _len1, _len2, _ref2, _ref3, _ref4, _ref5, _ref6;
            NumbericAxis.__super__.render.apply(this, arguments);
            this.init();
            this.tickPositions = [];
            this.minorTickPositions = [];
            textGroup = new fabric.Group();
            axisGroup = this.axisGroup = new fabric.Group();
            labels = this.get("labels") || {};
            labelColor = (_ref2 = labels.color) != null ? _ref2 : "black";
            labelPadding = labels.labelPadding || 4;
            startOnTick = this.get("startOnTick");
            style = this.get("style") || {};
            tickPosition = this.get("tickPosition");
            minorTickPosition = this.get("minorTickPosition");
            if (startOnTick === false && minorTickPosition && minorTickPosition !== "none") {
                needFillMinorTick = true;
            }
            tickStyle = this.get("tickStyle") || {};
            tickLength = (_ref3 = tickStyle.tickLength) != null ? _ref3 : 0;
            tickLengthValue = tickLength;
            renderToScrollLayer = this.renderToScrollLayer;
            reversed = this.chart.reversed;
            if (renderToScrollLayer) {
                if (reversed) {
                    startLeft = this.left - axesArea.left;
                    startTop = this.top - axesArea.top;
                } else {
                    startLeft = this.left - this.chart.seriesArea.left;
                    startTop = this.top - axesArea.top;
                }
            } else {
                startLeft = this.left;
                startTop = this.top;
            }
            if (tickPosition === "between") {
                tickLengthValue = Math.round(tickLength / 2);
            } else {
                if (tickPosition === "none" || tickPosition === "inside") {
                    tickLengthValue = 0;
                }
            }
            if (this.position === "left") {
                if (style.lineWidth > 0) {
                    axisGroup.add(new fabric.Line([startLeft + this.width, startTop, startLeft + this.width, startTop + this.height], {stroke:style.lineColor, strokeWidth:style.lineWidth}));
                }
                _ref4 = this.innerLabels;
                for (index = _i = 0, _len = _ref4.length; _i < _len; index = ++_i) {
                    label = _ref4[index];
                    textY = this.translateTick(this.innerValues[index]);
                    this.chart.addText({text:"" + label, rotation:labels.rotation, fontSize:labels.fontSize, textAlign:"right", left:startLeft - labelPadding - tickLengthValue, top:textY - 6, width:this.width, fill:labelColor});
                    this.makeTick(startLeft + this.width, textY, index === 0 ? needFillMinorTick : false);
                }
            } else {
                if (this.position === "right") {
                    if (style.lineWidth > 0) {
                        axisGroup.add(new fabric.Line([startLeft, startTop, startLeft, startTop + this.height], {stroke:style.lineColor, strokeWidth:style.lineWidth}));
                    }
                    _ref5 = this.innerLabels;
                    for (index = _j = 0, _len1 = _ref5.length; _j < _len1; index = ++_j) {
                        label = _ref5[index];
                        textY = this.translateTick(this.innerValues[index]);
                        this.chart.addText({text:"" + label, fontSize:labels.fontSize, textAlign:"left", rotation:labels.rotation, verticalAlign:"middle", left:startLeft + labelPadding + tickLengthValue, top:textY - 6, width:this.width, fill:labelColor});
                        this.makeTick(startLeft, textY, index === 0 ? needFillMinorTick : false);
                    }
                } else {
                    if (this.position === "bottom") {
                        if (style.lineWidth > 0) {
                            axisGroup.add(new fabric.Line([startLeft, startTop, startLeft + this.width, startTop], {stroke:style.lineColor, strokeWidth:style.lineWidth}));
                        }
                        cellWidth = this.getUnitWidth() * this.steps;
                        _ref6 = this.innerLabels;
                        for (index = _k = 0, _len2 = _ref6.length; _k < _len2; index = ++_k) {
                            label = _ref6[index];
                            left = this.translateTick(this.innerValues[index]);
                            if (renderToScrollLayer) {
                                addText = this.chart.addTextForScrollLayer;
                            } else {
                                addText = this.chart.addText;
                            }
                            addText.call(this.chart, {text:"" + label, rotation:labels.rotation, fontSize:labels.fontSize, left:left - cellWidth / 2, top:startTop + labelPadding + tickLengthValue, textAlign:"center", width:cellWidth, fill:labelColor});
                            this.makeTick(left, startTop, index === 0 ? needFillMinorTick : false);
                        }
                    }
                }
            }
            layer.add(textGroup);
            layer.add(axisGroup);
            return this.drawGrid(layer);
        };
        return NumbericAxis;
    })(Axis);
    TimeAxis = (function (_super) {
        __extends(TimeAxis, _super);
        TimeAxis.prototype.constrain = true;
        TimeAxis.prototype.dateFormat = null;
        TimeAxis.prototype.fromDate = null;
        TimeAxis.prototype.step = null;
        TimeAxis.prototype.toDate = null;
        function TimeAxis(options) {
            TimeAxis.__super__.constructor.apply(this, arguments);
        }
        return TimeAxis;
    })(Axis);
    GaugeAxis = (function (_super) {
        __extends(GaugeAxis, _super);
        GaugeAxis.prototype.maximum = null;
        GaugeAxis.prototype.minimum = null;
        GaugeAxis.prototype.steps = null;
        GaugeAxis.prototype.margin = null;
        GaugeAxis.prototype.title = null;
        function GaugeAxis(options) {
            GaugeAxis.__super__.constructor.apply(this, arguments);
        }
        return GaugeAxis;
    })(Axis);
    xchart.Axis = Axis;
    xchart.CategoryAxis = CategoryAxis;
    xchart.NumbericAxis = NumbericAxis;
    xchart.TimeAxis = TimeAxis;
    xchart.GaugeAxis = GaugeAxis;
}).call(this);
(function () {
    var RadarAxis, axisSet, _ref, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    axisSet = xchart.Axis.prototype.set;
    RadarAxis = (function (_super) {
        __extends(RadarAxis, _super);
        function RadarAxis() {
            _ref = RadarAxis.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        RadarAxis.prototype.categories = null;
        RadarAxis.prototype.labelProperty = null;
        RadarAxis.prototype.themePath = "radarAxis";
        RadarAxis.prototype.size = 0.8;
        RadarAxis.prototype.min = null;
        RadarAxis.prototype.max = null;
        RadarAxis.prototype.steps = null;
        RadarAxis.prototype.tickPixelInterval = 100;
        RadarAxis.prototype.allowDecimals = false;
        RadarAxis.prototype.filterSet = function (prop, value) {
            if (prop === "min" && value !== void 0) {
                return this.userSetMin = true;
            } else {
                if (prop === "max" && value !== void 0) {
                    return this.userSetMax = true;
                } else {
                    if (prop === "steps" && value !== void 0) {
                        return this.userSetSteps = true;
                    }
                }
            }
        };
        RadarAxis.prototype.set = function (prop, value) {
            var key;
            if (typeof prop === "object") {
                for (key in prop) {
                    value = prop[key];
                    this.filterSet(key, value);
                }
            } else {
                this.filterSet(prop, value);
            }
            return axisSet.apply(this, arguments);
        };
        RadarAxis.prototype.doGetCategories = function () {
            return this.get("categories") || [1];
        };
        RadarAxis.prototype.getCategories = function () {
            var categories, category, index, labelFormat, labelFormatter, labels, result, template, _i, _j, _len, _len1, _ref1, _ref2;
            categories = this.doGetCategories();
            labels = (_ref1 = this.get("labels")) != null ? _ref1 : {};
            labelFormat = labels.labelFormat;
            labelFormatter = labels.labelFormatter;
            if (labelFormat || labelFormatter) {
                result = [];
                if (typeof labelFormatter === "function") {
                    for (index = _i = 0, _len = categories.length; _i < _len; index = ++_i) {
                        category = categories[index];
                        result.push("" + ((_ref2 = labelFormatter.apply(null, [category, index])) != null ? _ref2 : ""));
                    }
                } else {
                    if (labelFormat) {
                        template = xchart.template(labelFormat);
                        for (index = _j = 0, _len1 = categories.length; _j < _len1; index = ++_j) {
                            category = categories[index];
                            result.push(template({value:category, index:index}));
                        }
                    }
                }
                return result;
            } else {
                return categories;
            }
        };
        RadarAxis.prototype.bindSeries = function (newSeries) {
            var oldAxis;
            if (!newSeries) {
                return;
            }
            if (this.series == null) {
                this.series = [];
            }
            oldAxis = newSeries["xAxis"] || newSeries["yAxis"];
            if (oldAxis && oldAxis !== this) {
                oldAxis.unbindSeries(newSeries);
            }
            this.series.push(newSeries);
            newSeries.xAxis = this;
            return newSeries.yAxis = this;
        };
        RadarAxis.prototype.initRange = function () {
            var dataRange, max, maxPadding, min, minPadding, range, series, _i, _len, _ref1;
            if (!this.series) {
                return {min:0, max:10};
            }
            _ref1 = this.series;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                series = _ref1[_i];
                if (!series.visible) {
                    continue;
                }
                dataRange = series.getMinMaxYValues();
                if (dataRange) {
                    if (min === void 0 && max === void 0) {
                        min = dataRange.min;
                        max = dataRange.max;
                    }
                    if (dataRange.min < min) {
                        min = dataRange.min;
                    }
                    if (dataRange.max > max) {
                        max = dataRange.max;
                    }
                }
            }
            if (min === void 0 || max === void 0) {
                if (min === void 0) {
                    min = 0;
                }
                if (max === void 0) {
                    max = 10;
                }
            } else {
                maxPadding = this.get("maxPadding");
                minPadding = this.get("minPadding");
                range = max - min;
                max = max + range * maxPadding;
                min = min - range * minPadding;
                if (!this.allowDecimals) {
                    max = Math.ceil(max);
                    min = Math.floor(min);
                }
            }
            if (!this.userSetMax) {
                this.max = max;
            }
            if (!this.userSetMin) {
                this.min = min;
            }
            return this.dataRange = {min:this.min, max:this.max};
        };
        RadarAxis.prototype.initLabels = function () {
            var axisLength, i, index, label, labels, max, min, range, steps, template, valueFormat, valueFormatter, _i, _j, _len, _len1, _ref1, _ref2, _ref3, _ref4, _results, _results1;
            axisLength = (_ref1 = this.radarSize) != null ? _ref1 : 300;
            this.innerLabels = [];
            this.innerValues = [];
            range = this.max - this.min;
            if (isNaN(range) || range < 0) {
                return;
            }
            if (!this.userSetSteps) {
                steps = range * this.tickPixelInterval / axisLength;
                this.steps = xchart.normalizeSteps(steps, null, this);
            }
            if (!this.userSetMin) {
                this.min = Math.floor(this.min / this.steps) * this.steps;
            }
            if (!this.userSetMax) {
                this.max = Math.ceil(this.max / this.steps) * this.steps;
            }
            min = this.min || 0;
            max = this.max || 10;
            steps = this.steps;
            i = min;
            while (i < max) {
                if (i >= min) {
                    this.innerLabels.push("" + i);
                    this.innerValues.push(i);
                }
                i += steps;
            }
            this.innerLabels.push("" + i);
            this.innerValues.push(i);
            this.dataRange = {min:min, max:i};
            labels = (_ref2 = this.get("labels")) != null ? _ref2 : {};
            valueFormat = labels.valueFormat;
            valueFormatter = labels.valueFormatter;
            if (valueFormat || valueFormatter) {
                if (typeof valueFormatter === "function") {
                    _ref3 = this.innerLabels;
                    _results = [];
                    for (index = _i = 0, _len = _ref3.length; _i < _len; index = ++_i) {
                        label = _ref3[index];
                        _results.push(this.innerLabels[index] = "" + ((valueFormatter.apply(null, [label, index])) || ""));
                    }
                    return _results;
                } else {
                    if (this.valueFormat) {
                        template = xchart.template(valueFormat);
                        _ref4 = this.innerLabels;
                        _results1 = [];
                        for (index = _j = 0, _len1 = _ref4.length; _j < _len1; index = ++_j) {
                            label = _ref4[index];
                            _results1.push(this.innerLabels[index] = template({value:label, index:index}));
                        }
                        return _results1;
                    }
                }
            }
        };
        RadarAxis.prototype.getLabel = function (index) {
            var categories;
            categories = this.getCategories();
            return categories[index];
        };
        RadarAxis.prototype.translateLabel = function (index) {
        };
        RadarAxis.prototype.translateArc = function (index, startValue, endValue, color) {
            var arc, categories, categoriesCount, centerLeft, centerTop, innerSize, labelAngle, max, min, pointRadarSize, radarSize, startAngle, unitAngle;
            categories = this.getCategories();
            categoriesCount = categories.length;
            centerLeft = this.centerLeft;
            centerTop = this.centerTop;
            startAngle = 270;
            unitAngle = 360 / categoriesCount;
            radarSize = this.radarSize;
            labelAngle = startAngle + index * unitAngle;
            min = this.min;
            max = this.max;
            innerSize = null;
            pointRadarSize = (endValue - min) / (max - min) * radarSize;
            if (startValue !== null && startValue !== void 0) {
                innerSize = (startValue - min) / (max - min) * radarSize / pointRadarSize;
            }
            arc = new fabric.Arc({centerX:centerLeft, centerY:centerTop, radius:pointRadarSize, angleStart:labelAngle, angleExtent:unitAngle, fill:color, opacity:0.9, innerSize:innerSize});
            return arc;
        };
        RadarAxis.prototype.translate = function (index, value) {
            var categories, categoriesCount, centerLeft, centerTop, labelAngle, labelLeft, labelTop, max, min, pointRadarSize, radarSize, startAngle, unitAngle;
            categories = this.getCategories();
            categoriesCount = categories.length;
            centerLeft = this.centerLeft;
            centerTop = this.centerTop;
            startAngle = 270;
            unitAngle = 360 / categoriesCount;
            radarSize = this.radarSize;
            labelAngle = startAngle + index * unitAngle;
            min = this.min;
            max = this.max;
            pointRadarSize = (value - min) / (max - min) * radarSize;
            labelLeft = centerLeft + pointRadarSize * Math.cos(xchart.toRadians(labelAngle));
            labelTop = centerTop + pointRadarSize * Math.sin(xchart.toRadians(labelAngle));
            return {left:labelLeft, top:labelTop};
        };
        RadarAxis.prototype.getNearestPoint = function (x, y) {
            var dis, distance, minDistance, point, result, _i, _len, _ref1;
            distance = function (point) {
                return Math.sqrt(Math.pow(point.left - x, 2) + Math.pow(point.top - y, 2));
            };
            result = null;
            if (this.points) {
                minDistance = 10000000;
                _ref1 = this.points;
                for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                    point = _ref1[_i];
                    dis = distance(point);
                    if (dis < minDistance) {
                        minDistance = dis;
                        result = point;
                    }
                }
            }
            return result;
        };
        RadarAxis.prototype.registerPoint = function (point) {
            if (!this.points) {
                this.points = [];
            }
            return this.points.push(point);
        };
        RadarAxis.prototype.render = function (layer, axesArea) {
            var categories, categoriesCount, category, centerLeft, centerTop, drawGrid, index, labelAngle, labelLeft, labelPadding, labelTop, maxSize, pointRadarSize, radarSize, range, startAngle, textLeft, textSize, textTop, unitAngle, value, _i, _j, _len, _len1, _ref1, _results;
            categories = this.getCategories();
            categoriesCount = categories.length;
            if (categoriesCount === 0) {
                return;
            }
            maxSize = axesArea.width > axesArea.height ? axesArea.height : axesArea.width;
            radarSize = this.radarSize = maxSize * 0.8 / 2;
            centerLeft = this.centerLeft = axesArea.left + axesArea.width / 2;
            centerTop = this.centerTop = axesArea.top + axesArea.height / 2;
            startAngle = 270;
            unitAngle = 360 / categoriesCount;
            this.initRange();
            this.initLabels();
            labelPadding = 10;
            for (index = _i = 0, _len = categories.length; _i < _len; index = ++_i) {
                category = categories[index];
                labelAngle = (startAngle + index * unitAngle) % 360;
                textSize = xchart.TextMetrics.measure({text:category, fontSize:12});
                labelLeft = centerLeft + radarSize * Math.cos(xchart.toRadians(labelAngle));
                labelTop = centerTop + radarSize * Math.sin(xchart.toRadians(labelAngle));
                if (labelAngle > 180) {
                    textLeft = labelLeft - (360 - labelAngle) / 180 * textSize.width;
                } else {
                    textLeft = labelLeft - labelAngle / 180 * textSize.width;
                }
                if (labelAngle >= 90 && labelAngle <= 270) {
                    textTop = labelTop - (labelAngle - 90) / 180 * (textSize.height + 4);
                } else {
                    if (labelAngle < 90) {
                        textTop = labelTop - (90 - labelAngle) / 180 * (textSize.height + 4);
                    } else {
                        textTop = labelTop - (450 - labelAngle) / 180 * textSize.height;
                    }
                }
                this.chart.addText({text:category, left:textLeft, top:textTop, fontSize:12});
            }
            range = this.max - this.min;
            drawGrid = function (pointRadarSize) {
                var path, _j, _len1;
                path = [];
                for (index = _j = 0, _len1 = categories.length; _j < _len1; index = ++_j) {
                    category = categories[index];
                    labelAngle = startAngle + index * unitAngle;
                    labelLeft = centerLeft + pointRadarSize * Math.cos(xchart.toRadians(labelAngle));
                    labelTop = centerTop + pointRadarSize * Math.sin(xchart.toRadians(labelAngle));
                    if (index === 0) {
                        path.push(["M", labelLeft, labelTop]);
                    } else {
                        path.push(["L", labelLeft, labelTop]);
                    }
                    layer.add(new fabric.Line([labelLeft, labelTop, centerLeft, centerTop], {stroke:"#C0C0C0", strokeWidth:1}));
                }
                path.push(["z"]);
                return layer.add(new fabric.Path(path, {fill:"transparent", stroke:"#C0C0C0", strokeWidth:1}));
            };
            _ref1 = this.innerValues;
            _results = [];
            for (index = _j = 0, _len1 = _ref1.length; _j < _len1; index = ++_j) {
                value = _ref1[index];
                pointRadarSize = (value - this.min) / range * radarSize;
                labelLeft = centerLeft + pointRadarSize * Math.cos(xchart.toRadians(startAngle));
                labelTop = centerTop + pointRadarSize * Math.sin(xchart.toRadians(startAngle));
                this.chart.addText({text:this.innerLabels[index], left:labelLeft, top:labelTop});
                if (index !== 0) {
                    _results.push(drawGrid(pointRadarSize));
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };
        return RadarAxis;
    })(xchart.Axis);
    xchart.RadarAxis = RadarAxis;
}).call(this);
(function () {
    var Cartesian, Events, Log, Series, darken, lighten, _ref, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Events = xchart.Events;
    Log = xchart.Log;
    darken = xchart.darken = function (color, value) {
        return tinycolor.darken(new tinycolor(color), value).toHexString();
    };
    lighten = xchart.lighten = function (color, value) {
        return tinycolor.lighten(new tinycolor(color), value).toHexString();
    };
    xchart.formatPointValue = function (value, tooltip) {
        var valueDecimals, valuePrefix, valueSuffix;
        if (!tooltip) {
            tooltip = {};
        }
        valuePrefix = tooltip.valuePrefix || "";
        valueSuffix = tooltip.valueSuffix || "";
        valueDecimals = tooltip.valueDecimals || 0;
        if (!isNaN(value)) {
            return valuePrefix + value.toFixed(valueDecimals) + valueSuffix;
        } else {
            return valuePrefix + "" + valueSuffix;
        }
    };
    Series = (function (_super) {
        __extends(Series, _super);
        Series.include(Events);
        Series.include(Log);
        Series.prototype.uninheritProperties = ["name", "title", "type", "data", "visible", "renderer", "bindingConfig", "axis", "categoryAxis", "stack", "color", "xAxisName", "yAxisName", "bubbleMinRadius", "bubbleMaxRadius"];
        Series.prototype.dataLabels = {align:"center", verticalAlign:"bottom", color:"", rotation:0, enabled:true};
        Series.prototype.type = null;
        Series.prototype.showInLegend = true;
        Series.prototype.visible = true;
        Series.prototype.title = null;
        Series.prototype.colors = ["#E5E5E5", "#C0D5E0", "#BDC3CE", "#D9DE8F", "#FDA53C", "#ED7120", "#B9B8A3", "#5BC9E2", "#A66492", "#697285"];
        Series.prototype.tooltip = {};
        Series.prototype.data = [];
        Series.prototype.bindingConfig = null;
        function Series(options) {
            this.options = options;
            if (options && typeof options.data === "string") {
                options.data = JSON.parse(options.data);
            }
            Series.__super__.constructor.apply(this, arguments);
        }
        Series.prototype.getTooltip = function () {
            var result;
            if (this.chart) {
                result = {};
                xchart.merge(this.get("tooltip"), result);
                xchart.merge(this.chart.get("tooltip"), result);
                return result;
            } else {
                return this.get("tooltip");
            }
        };
        Series.prototype.render = function (stage) {
        };
        Series.prototype.eachRecord = function (fn, scope) {
        };
        Series.prototype.getLegendColor = function (index) {
            return this.color;
        };
        Series.prototype.isLegendVisible = function (index) {
            return this.visible;
        };
        Series.prototype.getData = function () {
            return this.doGetData();
        };
        Series.prototype.doGetData = function () {
            return this.data || [];
        };
        Series.prototype.getItemForPoint = function (x, y) {
        };
        Series.prototype.gerRecordCount = function () {
        };
        Series.prototype.hideAll = function () {
        };
        Series.prototype.isExluded = function (index) {
        };
        Series.prototype.setTitle = function (index, title) {
        };
        Series.prototype.showAll = function () {
        };
        Series.prototype.getMinMaxYValues = function () {
            var data, firstItem, index, item, max, min, _i, _j, _len, _len1;
            data = this.getData();
            if (data.length === 0) {
                return {min:0, max:10};
            }
            firstItem = parseFloat(data[0]);
            if (isNaN(firstItem)) {
                firstItem = 0;
            }
            min = firstItem;
            max = firstItem;
            if (this.startData && this.startData.length > 0) {
                for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                    item = data[index];
                    item = parseFloat(item);
                    if (isNaN(item)) {
                        item = 0;
                    }
                    if (item + this.startData[index] > max) {
                        max = item + this.startData[index];
                    }
                    if (item < min) {
                        min = item;
                    }
                }
            } else {
                for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
                    item = data[_j];
                    item = parseFloat(item);
                    if (isNaN(item)) {
                        item = 0;
                    }
                    if (item > max) {
                        max = item;
                    }
                    if (item < min) {
                        min = item;
                    }
                }
            }
            return {min:min, max:max};
        };
        Series.prototype.doOnLegendClick = function (index) {
            this.visible = !this.visible;
            this.chart.redraw();
        };
        Series.prototype.exportPoint = function (point) {
            var _ref;
            point.series = this;
            return (_ref = this.chart) != null ? _ref.exportPoint(point) : void 0;
        };
        Series.prototype.fireEvent = function () {
        };
        Series.prototype.fireClickEvent = function (index) {
            var arg, data;
            arg = {index:index};
            if (this.getBindingData) {
                if (index !== void 0) {
                    data = this.getBindingData();
                    if (data instanceof dorado.Entity) {
                        if (index === 0) {
                            arg.entity = data;
                        }
                    } else {
                        if (data instanceof dorado.EntityList) {
                            arg.entity = data.toArray()[index];
                        }
                    }
                }
            }
            this.fireEvent("onClick", this, arg);
        };
        return Series;
    })(xchart.Themeable);
    Cartesian = (function (_super) {
        __extends(Cartesian, _super);
        function Cartesian() {
            _ref = Cartesian.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Cartesian.prototype.yAxisName = "left";
        Cartesian.prototype.xAxisName = "bottom";
        Cartesian.prototype.axisInited = false;
        Cartesian.prototype.highlightPoint = function (point) {
            var _ref1;
            if (!xchart.excanvas) {
                if (point.initialOpacity === void 0) {
                    point.initialOpacity = point.opacity;
                }
                point.set("opacity", point.initialOpacity - 0.3);
                this.chart.layer.renderAll();
                return (_ref1 = this.chart.scrollLayer) != null ? _ref1.renderAll() : void 0;
            }
        };
        Cartesian.prototype.unhighlightPoint = function (point) {
            var _ref1;
            if (!xchart.excanvas) {
                point.set("opacity", point.initialOpacity);
                this.chart.layer.renderAll();
                return (_ref1 = this.chart.scrollLayer) != null ? _ref1.renderAll() : void 0;
            }
        };
        Cartesian.prototype.highlightMarker = function (marker) {
            var markerEnabled, markerHoverEnabled, markerHoverStyle, markerStyle, symbolType, _ref1, _ref2;
            markerStyle = this.get("markerStyle") || {};
            markerHoverStyle = this.get("markerHoverStyle") || {};
            markerHoverEnabled = (_ref1 = markerHoverStyle.enabled) != null ? _ref1 : true;
            markerEnabled = (_ref2 = markerStyle.enabled) != null ? _ref2 : true;
            symbolType = markerStyle.symbolType;
            return xchart.highlightMarker(marker, markerEnabled, markerHoverEnabled, symbolType, markerHoverStyle, this.chart, this);
        };
        Cartesian.prototype.unhighlightMarker = function (marker) {
            var markerEnabled, markerHoverEnabled, markerHoverStyle, markerStyle, symbolType, _ref1, _ref2;
            markerStyle = this.get("markerStyle") || {};
            markerHoverStyle = this.get("markerHoverStyle") || {};
            markerHoverEnabled = (_ref1 = markerHoverStyle.enabled) != null ? _ref1 : true;
            markerEnabled = (_ref2 = markerStyle.enabled) != null ? _ref2 : true;
            symbolType = markerStyle.symbolType;
            return xchart.unhighlightMarker(marker, markerEnabled, markerHoverEnabled, symbolType, markerStyle, this.chart, this);
        };
        Cartesian.prototype.exportPoint = function (point, index) {
            point.series = this;
            return this.xAxis.registerPoint(point, index);
        };
        Cartesian.prototype.getData = function () {
            var bindingConfig, data, index, item, itemValue, result, _i, _j, _len, _len1;
            bindingConfig = this.bindingConfig || this._bindingConfig;
            data = this.doGetData() || [];
            if (bindingConfig && bindingConfig.yProperty) {
                result = [];
                for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                    item = data[index];
                    itemValue = item[bindingConfig.yProperty];
                    if (isNaN(itemValue)) {
                        itemValue = 0;
                    }
                    result[index] = itemValue;
                }
                return result;
            } else {
                result = [];
                for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
                    item = data[index];
                    itemValue = parseFloat(item);
                    if (isNaN(itemValue)) {
                        itemValue = 0;
                    }
                    result[index] = itemValue;
                }
                return result;
            }
        };
        Cartesian.prototype.initAxis = function () {
            var chart, xAxis, yAxis, _base;
            if (this.axisInited) {
                return;
            }
            chart = this.chart;
            this.axisInited = true;
            if ((_base = this.chart).axes == null) {
                _base.axes = [];
            }
            if (this.yAxisName) {
                yAxis = chart.axesMap[this.yAxisName];
                if (yAxis != null) {
                    yAxis.bindSeries(this);
                }
            }
            if (this.xAxisName) {
                xAxis = chart.axesMap[this.xAxisName];
                return xAxis != null ? xAxis.bindSeries(this) : void 0;
            }
        };
        Cartesian.prototype.getMinMaxXValues = function () {
            var data;
            data = this.getData();
            return {min:0, max:data.length - 1};
        };
        Cartesian.prototype.getValueForPoint = function (index, tooltip) {
            var data;
            data = this.getData();
            return {x:this.xAxis.getLabel(index), y:xchart.formatPointValue(data[index], tooltip)};
        };
        Cartesian.prototype.getTooltipForPoint = function (index) {
            var pointFormat, template, tooltip, value;
            if (index === void 0) {
                return;
            }
            tooltip = this.getTooltip();
            value = this.getValueForPoint(index, tooltip);
            pointFormat = tooltip.pointFormat;
            template = xchart.template(pointFormat);
            return template({series:{title:this.title, color:this.color}, label:value.x, value:value.y});
        };
        return Cartesian;
    })(Series);
    xchart.Series = Series;
    xchart.Cartesian = Cartesian;
}).call(this);
(function () {
    var Area, Line, disableMarkerStyle, getAnchors, _ref, _ref1, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    xchart.createDataLabelForSymbol = function (dataLabels, text, symbolRect) {
        var left, textSize, top, _ref;
        left = symbolRect.left;
        top = symbolRect.top;
        textSize = xchart.TextMetrics.measure({text:text, fontFamily:dataLabels.fontFamily, fontSize:(_ref = dataLabels.fontSize) != null ? _ref : 12});
        switch (dataLabels.align) {
          case "left":
            left -= textSize.width / 2;
            break;
          case "center":
            left += symbolRect.width / 2;
            break;
          case "right":
            left += symbolRect.width + textSize.width / 2;
        }
        switch (dataLabels.verticalAlign) {
          case "top":
            top -= textSize.height / 2;
            break;
          case "bottom":
            top += symbolRect.height + textSize.height / 2;
            break;
          case "middle":
            top += symbolRect.height / 2;
        }
        return new fabric.Text(text, {fontSize:dataLabels.fontSize, angle:dataLabels.rotation || 0, left:left, top:top, fontFamily:dataLabels.fontFamily, fill:dataLabels.color});
    };
    disableMarkerStyle = {fill:"", stroke:"transparent", strokeWidth:0, hasBorders:false};
    xchart.createMarker = function (markerStyle, markerEnabled, markerFill, markerStroke, markerStrokeWidth, symbolType, markerHoverStyle, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, left, top, dataIndex, chart, series, bindMouse) {
        var symbol;
        if (markerEnabled) {
            symbol = xchart.createSymbol(symbolType != null ? symbolType : "circle", {fill:markerFill, stroke:markerStroke, strokeWidth:markerStrokeWidth, size:markerStyle.size, left:left, top:top});
        } else {
            symbol = xchart.createSymbol(symbolType != null ? symbolType : "circle", {fill:"", stroke:"transparent", strokeWidth:0, size:markerStyle.size + markerStyle.borderWidth * 2, left:left, top:top});
        }
        symbol.dataIndex = dataIndex;
        if (bindMouse) {
            symbol.series = series;
            symbol.on("mouseenter", function () {
                return xchart.highlightMarker(this, markerEnabled, markerHoverEnabled, symbolType, markerHoverStyle, chart, series, bindMouse);
            });
            symbol.on("mouseleave", function () {
                return xchart.unhighlightMarker(this, markerEnabled, markerHoverEnabled, symbolType, markerStyle, chart, series, bindMouse);
            });
        } else {
            series.exportPoint(symbol, dataIndex);
        }
        symbol.on("click", function () {
            return series.fireClickEvent(this.dataIndex);
        });
        return symbol;
    };
    xchart.highlightMarker = function (symbol, markerEnabled, markerHoverEnabled, symbolType, markerHoverStyle, chart, series, bindMouse) {
        var markerHoverFill, markerHoverStroke, markerHoverStrokeWidth;
        markerHoverFill = markerHoverStyle.backgroundColor || series.color;
        markerHoverStroke = markerHoverStyle.borderColor || xchart.darken(markerHoverFill || series.color, 20);
        markerHoverStrokeWidth = markerHoverStyle.borderWidth;
        if (!markerEnabled && markerHoverEnabled) {
            xchart.setSymbolSize(symbolType, symbol, 0);
        }
        if (markerHoverEnabled) {
            symbol.set({fill:markerHoverFill, stroke:markerHoverStroke, strokeWidth:markerHoverStrokeWidth});
            symbol.anim(xchart.getSymbolAnimObject(symbolType, markerHoverStyle.size), {duration:300, onChange:function () {
                if (chart.seriesScrollableReal) {
                    return chart.scrollLayer.renderAll();
                } else {
                    return chart.layer.renderAll();
                }
            }});
        } else {
            if (!markerHoverEnabled && markerEnabled) {
                symbol.set(disableMarkerStyle);
            }
        }
        if (bindMouse) {
            return chart.showTip(symbol.series.getTooltipForPoint(symbol.dataIndex), symbol);
        }
    };
    xchart.unhighlightMarker = function (symbol, markerEnabled, markerHoverEnabled, symbolType, markerStyle, chart, series, bindMouse) {
        var animSize, markerFill, markerStroke, markerStrokeWidth;
        markerFill = markerStyle.backgroundColor || series.color;
        markerStroke = markerStyle.borderColor || xchart.darken(markerFill || series.color, 20);
        markerStrokeWidth = markerStyle.borderWidth;
        if (markerHoverEnabled) {
            if (!markerEnabled) {
                animSize = 0;
            } else {
                animSize = markerStyle.size;
                symbol.set({fill:markerFill, stroke:markerStroke, strokeWidth:markerStrokeWidth});
            }
            symbol.anim(xchart.getSymbolAnimObject(symbolType, animSize), {duration:300, onChange:function () {
                return chart.layer.renderAll();
            }, onComplete:function () {
                if (!markerEnabled) {
                    symbol.set(disableMarkerStyle);
                    xchart.setSymbolSize(symbolType, symbol, markerStyle.size + markerStyle.borderWidth * 2);
                    symbol.setCoords();
                    return chart.layer.renderAll();
                }
            }});
        } else {
            if (!markerHoverEnabled && markerEnabled) {
                symbol.set({fill:markerFill, stroke:markerStroke, strokeWidth:markerStrokeWidth});
            }
        }
        if (bindMouse) {
            return chart.hideTip();
        }
    };
    getAnchors = function (p1x, p1y, p2x, p2y, p3x, p3y) {
        var a, alpha, b, dx1, dx2, dy1, dy2, l1, l2;
        l1 = (p2x - p1x) / 2;
        l2 = (p3x - p2x) / 2;
        a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y));
        b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
        a = (p1y < p2y ? Math.PI - a : a);
        b = (p3y < p2y ? Math.PI - b : b);
        alpha = Math.PI / 2 - (a + b) % (Math.PI * 2) / 2;
        dx1 = l1 * Math.sin(alpha + a);
        dy1 = l1 * Math.cos(alpha + a);
        dx2 = l2 * Math.sin(alpha + b);
        dy2 = l2 * Math.cos(alpha + b);
        return {x1:p2x - dx1, y1:p2y + dy1, x2:p2x + dx2, y2:p2y + dy2};
    };
    Line = (function (_super) {
        __extends(Line, _super);
        function Line() {
            _ref = Line.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Line.prototype.themePath = "line";
        Line.prototype.smooth = false;
        Line.prototype.type = "line";
        Line.prototype.style = null;
        Line.prototype.highlightPoint = function (point) {
            return this.highlightMarker(point);
        };
        Line.prototype.unhighlightPoint = function (point) {
            return this.unhighlightMarker(point);
        };
        Line.prototype.showAnimate = function () {
            var chart;
            chart = this.chart;
            this.linePath.set("opacity", 0);
            return this.linePath.anim({opacity:1}, {duration:500, onChange:function () {
                if (chart.seriesScrollableReal) {
                    return chart.scrollLayer.renderAll();
                } else {
                    return chart.layer.renderAll();
                }
            }});
        };
        Line.prototype.createDataLabel = function (text, index, symbolRect) {
            var dataLabels;
            dataLabels = this.get("dataLabels");
            return xchart.createDataLabelForSymbol(dataLabels, text, symbolRect);
        };
        Line.prototype.render = function (layer, seriesArea) {
            var X0, X2, Y0, Y2, anchor, chart, data, dataLabelGroup, dataLabels, dataLength, dotContainer, firstPoint, index, isRadar, item, left, lineCurveArg, linePath, marker, markerEnabled, markerFill, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, markerHoverStyle, markerStroke, markerStrokeWidth, markerStyle, point, series, style, symbolType, template, text, top, _i, _j, _len, _len1, _ref1, _ref2;
            chart = this.chart;
            series = this;
            linePath = new xchart.Path;
            dotContainer = new fabric.Group();
            layer.add(dotContainer);
            dataLabelGroup = new fabric.Group();
            data = this.getData();
            markerStyle = this.get("markerStyle") || {};
            markerHoverStyle = this.get("markerHoverStyle") || {};
            dataLabels = this.get("dataLabels");
            template = xchart.template(dataLabels.format || "{value}");
            markerEnabled = (_ref1 = markerStyle.enabled) != null ? _ref1 : true;
            markerFill = markerStyle.backgroundColor || this.color;
            markerStroke = markerStyle.borderColor || xchart.darken(markerFill, 20);
            markerStrokeWidth = markerStyle.borderWidth;
            symbolType = markerStyle.symbolType;
            markerHoverEnabled = (_ref2 = markerHoverStyle.enabled) != null ? _ref2 : true;
            markerHoverFill = markerHoverStyle.backgroundColor || this.color;
            markerHoverStroke = markerHoverStyle.borderColor || xchart.darken(markerHoverFill || this.color, 20);
            markerHoverStrokeWidth = markerHoverStyle.borderWidth;
            isRadar = this.xAxis instanceof xchart.RadarAxis;
            if (!this.get("smooth")) {
                dataLength = data.length;
                firstPoint = null;
                for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                    item = data[index];
                    if (isRadar) {
                        point = this.xAxis.translate(index, item || 0);
                        left = point.left;
                        top = point.top;
                    } else {
                        left = this.xAxis.translateLabel(index);
                        top = this.yAxis.translate(item || 0);
                    }
                    if (index === 0) {
                        linePath.moveTo(left, top);
                        firstPoint = {left:left, top:top};
                    } else {
                        if (isRadar && index === dataLength - 1) {
                            linePath.lineTo(left, top);
                            linePath.lineTo(firstPoint.left, firstPoint.top);
                        } else {
                            linePath.lineTo(left, top);
                        }
                    }
                    text = template({label:this.xAxis.getLabel(index), value:item, series:{title:this.title, color:this.color}});
                    if (dataLabels.enabled) {
                        dataLabelGroup.add(this.createDataLabel(text, index, {left:left - 5, top:top - 5, width:10, height:10}));
                    }
                    marker = xchart.createMarker(markerStyle, markerEnabled, markerFill, markerStroke, markerStrokeWidth, symbolType, markerHoverStyle, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, left, top, index, chart, series);
                    layer.add(marker);
                }
            } else {
                lineCurveArg = [];
                for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
                    item = data[index];
                    left = this.xAxis.translateLabel(index);
                    top = this.yAxis.translate(item || 0);
                    if (!index) {
                        linePath.moveTo(left, top);
                        lineCurveArg = [left, top];
                    }
                    if (index && index < data.length - 1) {
                        Y0 = this.yAxis.translate(data[index - 1]);
                        X0 = this.xAxis.translateLabel(index - 1);
                        Y2 = this.yAxis.translate(data[index + 1]);
                        X2 = this.xAxis.translateLabel(index + 1);
                        anchor = getAnchors(X0, Y0, left, top, X2, Y2);
                        lineCurveArg.push(anchor.x1, anchor.y1, left, top);
                        linePath.bezierCurveTo.apply(linePath, lineCurveArg);
                        lineCurveArg = [anchor.x2, anchor.y2];
                    }
                    text = template({label:this.xAxis.getLabel(index), value:item, series:{title:this.title, color:this.color}});
                    if (dataLabels.enabled) {
                        dataLabelGroup.add(this.createDataLabel(text, index, {left:left - 5, top:top - 5, width:10, height:10}));
                    }
                    marker = xchart.createMarker(markerStyle, markerEnabled, markerFill, markerStroke, markerStrokeWidth, symbolType, markerHoverStyle, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, left, top, index, chart, series);
                    layer.add(marker);
                }
                if (lineCurveArg != null) {
                    lineCurveArg.push(left, top, left, top);
                }
                linePath.bezierCurveTo.apply(linePath, lineCurveArg);
            }
            style = this.get("style") || {};
            this.linePath = linePath.toFabricPath({stroke:this.color, strokeWidth:style.lineWidth || 2, fill:""});
            dotContainer.add(this.linePath);
            return layer.add(dataLabelGroup);
        };
        return Line;
    })(xchart.Cartesian);
    Area = (function (_super) {
        __extends(Area, _super);
        function Area() {
            _ref1 = Area.__super__.constructor.apply(this, arguments);
            return _ref1;
        }
        Area.prototype.themePath = "area";
        Area.prototype.type = "area";
        Area.prototype.smooth = false;
        Area.prototype.style = null;
        Area.prototype.threshold = 0;
        Area.prototype.highlightPoint = function (point) {
            return this.highlightMarker(point);
        };
        Area.prototype.unhighlightPoint = function (point) {
            return this.unhighlightMarker(point);
        };
        Area.prototype.createDataLabel = function (text, index, symbolRect) {
            var dataLabels;
            dataLabels = this.get("dataLabels");
            return xchart.createDataLabelForSymbol(dataLabels, text, symbolRect);
        };
        Area.prototype.showAnimate = function () {
            var chart;
            chart = this.chart;
            this.linePath.set("opacity", 0);
            this.linePath.anim({opacity:1}, {duration:500, onChange:function () {
                if (chart.seriesScrollableReal) {
                    return chart.scrollLayer.renderAll();
                } else {
                    return chart.layer.renderAll();
                }
            }});
            this.areaPath.set("opacity", 0);
            return this.areaPath.anim({opacity:0.5}, {duration:500, onChange:function () {
                if (chart.seriesScrollableReal) {
                    return chart.scrollLayer.renderAll();
                } else {
                    return chart.layer.renderAll();
                }
            }});
        };
        Area.prototype.getCeilPath = function () {
            var X0, X2, Y0, Y2, anchor, apoint, categoryIndex, data, dataLength, index, isRadar, item, left, lineCurveArg, linePath, point, top, _i, _j, _len, _len1;
            isRadar = this.xAxis instanceof xchart.RadarAxis;
            if (!this.get("smooth")) {
                linePath = new xchart.Path;
                data = this.endData.concat().reverse();
                dataLength = data.length;
                for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                    item = data[index];
                    categoryIndex = dataLength - index - 1;
                    if (isRadar) {
                        point = this.xAxis.translate(categoryIndex, item || 0);
                        left = point.left;
                        top = point.top;
                    } else {
                        left = this.xAxis.translateLabel(categoryIndex);
                        top = this.yAxis.translate(item || 0);
                    }
                    if (index === 0) {
                        if (isRadar) {
                            apoint = this.xAxis.translate(0, data[dataLength - 1] || 0);
                            linePath.lineTo(apoint.left, apoint.top);
                        }
                        linePath.lineTo(left, top);
                    } else {
                        linePath.lineTo(left, top);
                    }
                }
                return linePath;
            } else {
                linePath = new xchart.Path;
                lineCurveArg = [];
                data = this.endData.concat().reverse();
                dataLength = data.length;
                for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
                    item = data[index];
                    categoryIndex = dataLength - index - 1;
                    left = this.xAxis.translateLabel(categoryIndex);
                    top = this.yAxis.translate(item || 0);
                    if (!index) {
                        linePath.lineTo(left, top);
                        lineCurveArg = [left, top];
                    }
                    if (index && index < dataLength - 1) {
                        Y0 = this.yAxis.translate(data[index + 1]);
                        X0 = this.xAxis.translateLabel(categoryIndex - 1);
                        Y2 = this.yAxis.translate(data[index - 1]);
                        X2 = this.xAxis.translateLabel(categoryIndex + 1);
                        anchor = getAnchors(X0, Y0, left, top, X2, Y2);
                        lineCurveArg.push(anchor.x2, anchor.y2, left, top);
                        linePath.bezierCurveTo.apply(linePath, lineCurveArg);
                        lineCurveArg = [anchor.x1, anchor.y1];
                    }
                }
                if (lineCurveArg != null) {
                    lineCurveArg.push(left, top, left, top);
                }
                linePath.bezierCurveTo.apply(linePath, lineCurveArg);
                return linePath;
            }
        };
        Area.prototype.render = function (layer, seriesArea) {
            var X0, X2, Y0, Y2, anchor, areaCurveArg, areaPath, bottom, chart, data, dataLabelGroup, dataLabels, dataLength, dotContainer, enableThreshold, endData, firstX, firstY, haveStartData, index, item, left, lineCurveArg, linePath, marker, markerEnabled, markerFill, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, markerHoverStyle, markerStroke, markerStrokeWidth, markerStyle, point, series, startData, style, symbolType, template, text, threshold, top, _i, _j, _len, _len1, _ref2, _ref3;
            chart = this.chart;
            series = this;
            linePath = new xchart.Path;
            areaPath = new xchart.Path;
            dotContainer = new fabric.Group();
            layer.add(dotContainer);
            dataLabelGroup = new fabric.Group();
            data = this.getData();
            startData = this.startData;
            endData = this.endData || data;
            haveStartData = !!startData;
            threshold = this.get("threshold");
            enableThreshold = typeof threshold === "number" && this.stack === void 0 && threshold >= this.yAxis.min;
            markerStyle = this.get("markerStyle") || {};
            markerHoverStyle = this.get("markerHoverStyle") || {};
            dataLabels = this.get("dataLabels");
            template = xchart.template(dataLabels.format || "{value}");
            markerEnabled = (_ref2 = markerStyle.enabled) != null ? _ref2 : true;
            markerFill = markerStyle.backgroundColor || this.color;
            markerStroke = markerStyle.borderColor || xchart.darken(markerFill, 20);
            markerStrokeWidth = markerStyle.borderWidth;
            symbolType = markerStyle.symbolType;
            markerHoverEnabled = (_ref3 = markerHoverStyle.enabled) != null ? _ref3 : true;
            markerHoverFill = markerHoverStyle.backgroundColor || this.color;
            markerHoverStroke = markerHoverStyle.borderColor || xchart.darken(markerHoverFill || this.color, 20);
            markerHoverStrokeWidth = markerHoverStyle.borderWidth;
            disableMarkerStyle = {fill:"", stroke:"transparent", strokeWidth:0, hasBorders:false};
            if (this.chart.seriesScrollableReal) {
                bottom = enableThreshold ? this.yAxis.translate(threshold) : seriesArea.height;
            } else {
                bottom = enableThreshold ? this.yAxis.translate(threshold) : seriesArea.top + seriesArea.height;
            }
            if (!this.get("smooth")) {
                firstX = null;
                firstY = null;
                dataLength = endData.length;
                for (index = _i = 0, _len = endData.length; _i < _len; index = ++_i) {
                    item = endData[index];
                    if (this.xAxis instanceof xchart.RadarAxis) {
                        point = this.xAxis.translate(index, item || 0);
                        left = point.left;
                        top = point.top;
                    } else {
                        left = this.xAxis.translateLabel(index);
                        top = this.yAxis.translate(item || 0);
                    }
                    if (index === 0) {
                        linePath.moveTo(left, top);
                        areaPath.moveTo(left, bottom).lineTo(left, top);
                        firstX = left;
                        firstY = top;
                    } else {
                        if (index === dataLength - 1 && this.xAxis instanceof xchart.RadarAxis) {
                            linePath.lineTo(left, top);
                            linePath.lineTo(firstX, firstY);
                            areaPath.lineTo(left, top);
                            areaPath.lineTo(firstX, firstY);
                        } else {
                            linePath.lineTo(left, top);
                            areaPath.lineTo(left, top);
                        }
                    }
                    text = template({label:this.xAxis.getLabel(index), value:item, series:{title:this.title, color:this.color}});
                    if (dataLabels.enabled) {
                        dataLabelGroup.add(this.createDataLabel(text, index, {left:left - 5, top:top - 5, width:10, height:10}));
                    }
                    marker = xchart.createMarker(markerStyle, markerEnabled, markerFill, markerStroke, markerStrokeWidth, symbolType, markerHoverStyle, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, left, top, index, chart, series);
                    layer.add(marker);
                }
                if (haveStartData) {
                    areaPath.appendPath(this.lastSeries.getCeilPath());
                    areaPath.closePath();
                } else {
                    if (!(this.xAxis instanceof xchart.RadarAxis)) {
                        areaPath.lineTo(left, bottom);
                    }
                    areaPath.closePath();
                }
            } else {
                lineCurveArg = [];
                areaCurveArg = [];
                for (index = _j = 0, _len1 = endData.length; _j < _len1; index = ++_j) {
                    item = endData[index];
                    left = this.xAxis.translateLabel(index);
                    top = this.yAxis.translate(item || 0);
                    if (!index) {
                        linePath.moveTo(left, top);
                        lineCurveArg = [left, top];
                        areaPath.moveTo(left, bottom).lineTo(left, top);
                        areaCurveArg = [left, top];
                    }
                    if (index && index < data.length - 1) {
                        X0 = this.xAxis.translateLabel(index - 1);
                        Y0 = this.yAxis.translate(endData[index - 1]);
                        X2 = this.xAxis.translateLabel(index + 1);
                        Y2 = this.yAxis.translate(endData[index + 1]);
                        anchor = getAnchors(X0, Y0, left, top, X2, Y2);
                        lineCurveArg.push(anchor.x1, anchor.y1, left, top);
                        linePath.bezierCurveTo.apply(linePath, lineCurveArg);
                        lineCurveArg = [anchor.x2, anchor.y2];
                        areaCurveArg.push(anchor.x1, anchor.y1, left, top);
                        areaPath.bezierCurveTo.apply(areaPath, areaCurveArg);
                        areaCurveArg = [anchor.x2, anchor.y2];
                    }
                    text = template({label:this.xAxis.getLabel(index), value:data[index], series:{title:this.title, color:this.color}});
                    if (dataLabels.enabled) {
                        dataLabelGroup.add(this.createDataLabel(text, index, {left:left - 5, top:top - 5, width:10, height:10}));
                    }
                    marker = xchart.createMarker(markerStyle, markerEnabled, markerFill, markerStroke, markerStrokeWidth, symbolType, markerHoverStyle, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, left, top, index, chart, series);
                    layer.add(marker);
                }
                if (lineCurveArg != null) {
                    lineCurveArg.push(left, top, left, top);
                }
                linePath.bezierCurveTo.apply(linePath, lineCurveArg);
                if (areaCurveArg != null) {
                    areaCurveArg.push(left, top, left, top);
                }
                areaPath.bezierCurveTo.apply(areaPath, areaCurveArg);
                if (haveStartData) {
                    areaPath.appendPath(this.lastSeries.getCeilPath());
                    areaPath.closePath();
                } else {
                    areaPath.lineTo(left, bottom);
                    areaPath.closePath();
                }
            }
            style = this.get("style") || {};
            this.linePath = linePath.toFabricPath({stroke:style.lineColor || this.color, strokeWidth:style.lineWidth || 2, fill:""});
            this.areaPath = areaPath.toFabricPath({fill:this.color, opacity:0.5});
            dotContainer.add(this.linePath);
            dotContainer.add(this.areaPath);
            return layer.add(dataLabelGroup);
        };
        return Area;
    })(xchart.Cartesian);
    xchart.Line = Line;
    xchart.Area = Area;
}).call(this);
(function () {
    var Bar, Column, _ref, _ref1, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    xchart.createDataLabelForBar = function (group, dataLabels, text, barRect) {
        var labelPadding, left, textSize, top, _ref;
        left = barRect.left;
        top = barRect.top + barRect.height / 2;
        labelPadding = dataLabels.labelPadding || 0;
        textSize = xchart.TextMetrics.measure({text:text, fontFamily:dataLabels.fontFamily, fontSize:(_ref = dataLabels.fontSize) != null ? _ref : 12});
        if (textSize.width > barRect.width && dataLabels.hideOnOverflow) {
            return;
        }
        switch (dataLabels.align) {
          case "innerleft":
            left += textSize.width / 2 + labelPadding;
            break;
          case "innerright":
            left += barRect.width - textSize.width / 2 - labelPadding;
            break;
          case "right":
            left += barRect.width + textSize.width / 2 + labelPadding;
            break;
          case "center":
            left += barRect.width / 2;
        }
        return group.add(new fabric.Text(text, {fontSize:dataLabels.fontSize, angle:dataLabels.rotation || 0, left:left, top:top, fontFamily:dataLabels.fontFamily, fill:dataLabels.color}));
    };
    xchart.createDataLabelForColumn = function (group, dataLabels, text, columnRect) {
        var height, labelPadding, left, rotation, textSize, top, _ref;
        left = columnRect.left + columnRect.width / 2;
        top = columnRect.top;
        labelPadding = dataLabels.labelPadding || 0;
        textSize = xchart.TextMetrics.measure({text:text, fontFamily:dataLabels.fontFamily, fontSize:(_ref = dataLabels.fontSize) != null ? _ref : 12});
        if (textSize.width > columnRect.width && dataLabels.hideOnOverflow) {
            return;
        }
        rotation = dataLabels.rotation || 0;
        if (dataLabels.rotation) {
            height = Math.abs(Math.cos(xchart.toRadians(rotation))) * textSize.height + textSize.width * Math.abs(Math.sin(xchart.toRadians(rotation)));
        } else {
            height = textSize.height;
        }
        switch (dataLabels.verticalAlign) {
          case "top":
            top -= height / 2 + labelPadding;
            break;
          case "innertop":
            top += height / 2 + labelPadding;
            break;
          case "innerbottom":
            top += columnRect.height - height / 2 - labelPadding;
            break;
          case "middle":
            top += columnRect.height / 2;
        }
        return group.add(new fabric.Text(text, {fontSize:dataLabels.fontSize, angle:dataLabels.rotation || 0, left:left, top:top, fontFamily:dataLabels.fontFamily, fill:dataLabels.color}));
    };
    Bar = (function (_super) {
        __extends(Bar, _super);
        function Bar() {
            _ref = Bar.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Bar.prototype.themePath = "bar";
        Bar.prototype.type = "bar";
        Bar.prototype.column = false;
        Bar.prototype.yAxisName = "bottom";
        Bar.prototype.xAxisName = "left";
        Bar.prototype.threshold = 0;
        Bar.prototype.style = null;
        Bar.prototype.exportPoint = function (point, index) {
            point.series = this;
            return this.yAxis.registerPoint(point, index);
        };
        Bar.prototype.createDataLabel = function (group, text, symbolRect) {
            var dataLabels;
            dataLabels = this.get("dataLabels");
            return xchart.createDataLabelForBar(group, dataLabels, text, symbolRect);
        };
        Bar.prototype.showAnimate = function () {
            var chart, enableThreshold, index, left, minLeft, rect, threshold, width, _i, _len, _ref1, _results;
            chart = this.chart;
            minLeft = chart.seriesArea.left;
            threshold = this.get("threshold");
            enableThreshold = typeof threshold === "number" && this.stack === void 0 && threshold >= this.xAxis.min;
            if (enableThreshold) {
                minLeft = this.xAxis.translate(threshold);
            }
            _ref1 = this.rects;
            _results = [];
            for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
                rect = _ref1[index];
                rect.dataIndex = index;
                left = rect.left;
                width = rect.width;
                rect.set("width", 0);
                rect.set("left", minLeft);
                if (index === this.rects.length - 1) {
                    _results.push(rect.anim({left:left, width:width}, {duration:500, onChange:function () {
                        if (chart.seriesScrollableReal) {
                            return chart.scrollLayer.renderAll();
                        } else {
                            return chart.layer.renderAll();
                        }
                    }}));
                } else {
                    _results.push(rect.anim({left:left, width:width}, {duration:500}));
                }
            }
            return _results;
        };
        Bar.prototype.getMinMaxXValues = function () {
            var data, index, item, max, min, _i, _j, _len, _len1;
            data = this.getData();
            if (data.length === 0) {
                return {min:0, max:10};
            }
            min = data[0];
            max = data[0];
            if (this.startData && this.startData.length > 0) {
                for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                    item = data[index];
                    if (item + this.startData[index] > max) {
                        max = item + this.startData[index];
                    }
                    if (item < min) {
                        min = item;
                    }
                }
            } else {
                for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
                    item = data[_j];
                    if (item > max) {
                        max = item;
                    }
                    if (item < min) {
                        min = item;
                    }
                }
            }
            return {min:min, max:max};
        };
        Bar.prototype.getValueForPoint = function (index, tooltip) {
            var data;
            data = this.getData();
            return {x:this.yAxis.getLabel(index), y:xchart.formatPointValue(data[index], tooltip)};
        };
        Bar.prototype.render = function (stage, seriesArea) {
            var barGroup, barGroupPadding, barHeight, barPadding, borderColor, borderWidth, chart, color, data, dataLabelGroup, dataLabels, enableThreshold, endData, groupIndex, haveStartData, index, item, left, rect, renderToScrollLayer, right, series, startData, startTop, style, template, text, threshold, thresholdLeft, tooltip, width, yUnitHeight, _i, _len, _ref1;
            barGroup = new fabric.Group();
            data = this.getData();
            series = this;
            this.rects = [];
            dataLabelGroup = new fabric.Group();
            yUnitHeight = this.yAxis.getUnitWidth();
            barHeight = this.chart.barWidth;
            barPadding = this.chart.barPaddingValue;
            barGroupPadding = this.chart.barGroupPaddingValue;
            groupIndex = this.groupIndex || 0;
            startData = this.startData;
            endData = this.endData || data;
            haveStartData = startData !== void 0;
            chart = this.chart;
            dataLabels = this.get("dataLabels");
            style = this.get("style");
            borderWidth = (_ref1 = style.borderWidth) != null ? _ref1 : 0;
            borderColor = style.borderColor;
            template = xchart.template(dataLabels.format || "{value}");
            threshold = this.get("threshold");
            enableThreshold = typeof threshold === "number" && this.stack === void 0 && threshold >= this.xAxis.min;
            if (enableThreshold) {
                thresholdLeft = this.xAxis.translate(threshold);
            }
            series = this;
            tooltip = chart.get("tooltip");
            renderToScrollLayer = this.chart.seriesScrollableReal;
            if (renderToScrollLayer) {
                startTop = 0;
            } else {
                startTop = seriesArea.top;
            }
            for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                item = data[index];
                right = this.xAxis.translate(endData[index]);
                if (haveStartData) {
                    left = this.xAxis.translate(startData[index]);
                    width = right - left;
                    if (width < 0) {
                        width = 0;
                    }
                } else {
                    left = enableThreshold ? thresholdLeft : this.xAxis.translate(this.xAxis.min);
                    width = enableThreshold && item < threshold ? left - right : right - left;
                    if (width < 0) {
                        width = 0;
                    }
                }
                color = this.color;
                rect = new fabric.Rect({left:enableThreshold && item < threshold ? left - width / 2 : left + width / 2, top:startTop + yUnitHeight * index + barGroupPadding / 2 + groupIndex * (barPadding + barHeight) + barHeight / 2, width:width - borderWidth, height:barHeight - borderWidth, stroke:borderWidth !== 0 ? borderColor : null, strokeWidth:borderWidth, hasBorders:borderWidth !== 0, fill:color});
                this.rects.push(rect);
                rect.dataIndex = index;
                if (!tooltip.shared) {
                    rect.series = series;
                    rect.on("mouseenter", function () {
                        return chart.showTip(series.getTooltipForPoint(this.dataIndex), this);
                    });
                    rect.on("mouseleave1", function () {
                        return chart.hideTip();
                    });
                } else {
                    this.exportPoint(rect, index);
                }
                rect.on("click", function () {
                    return series.fireClickEvent(this.dataIndex);
                });
                stage.add(rect);
                text = template({label:this.xAxis.getLabel(index), value:item, series:{title:this.title, color:this.color}});
                if (dataLabels.enabled) {
                    this.createDataLabel(dataLabelGroup, text, {left:rect.left - rect.width / 2, top:rect.top - rect.height / 2, width:rect.width, height:rect.height});
                }
            }
            stage.add(barGroup);
            return stage.add(dataLabelGroup);
        };
        return Bar;
    })(xchart.Cartesian);
    Column = (function (_super) {
        __extends(Column, _super);
        function Column() {
            _ref1 = Column.__super__.constructor.apply(this, arguments);
            return _ref1;
        }
        Column.prototype.themePath = "column";
        Column.prototype.type = "column";
        Column.prototype.yAxisName = "left";
        Column.prototype.xAxisName = "bottom";
        Column.prototype.threshold = 0;
        Column.prototype.createDataLabel = function (group, text, symbolRect) {
            var dataLabels;
            dataLabels = this.get("dataLabels");
            return xchart.createDataLabelForColumn(group, dataLabels, text, symbolRect);
        };
        Column.prototype.showAnimate = function () {
            var chart, enableThreshold, height, index, minTop, rect, threshold, top, _i, _len, _ref2, _results;
            chart = this.chart;
            minTop = this.chart.seriesArea.top + this.chart.seriesArea.height;
            threshold = this.get("threshold");
            enableThreshold = typeof threshold === "number" && this.stack === void 0 && threshold >= this.yAxis.min;
            if (enableThreshold) {
                minTop = this.yAxis.translate(threshold);
            }
            _ref2 = this.rects;
            _results = [];
            for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
                rect = _ref2[index];
                rect.dataIndex = index;
                top = rect.top;
                height = rect.height;
                rect.set("height", 0);
                rect.set("top", minTop);
                if (index === this.rects.length - 1) {
                    _results.push(rect.anim({top:top, height:height}, {duration:500, onChange:function () {
                        if (chart.seriesScrollableReal) {
                            return chart.scrollLayer.renderAll();
                        } else {
                            return chart.layer.renderAll();
                        }
                    }}));
                } else {
                    _results.push(rect.anim({top:top, height:height}, {duration:500}));
                }
            }
            return _results;
        };
        Column.prototype.getValueForPoint = function (index, tooltip) {
            var data;
            data = this.getData();
            return {x:this.xAxis.getLabel(index), y:xchart.formatPointValue(data[index], tooltip)};
        };
        Column.prototype.render = function (layer, seriesArea) {
            var arc, borderColor, borderWidth, bottom, chart, color, columnGroup, columnGroupPadding, columnPadding, columnWidth, data, dataLabelGroup, dataLabels, enableThreshold, endData, groupIndex, haveStartData, height, index, isRadar, item, rect, renderToScrollLayer, scrollLeft, series, startData, startLeft, startValue, style, template, text, threshold, thresholdTop, tooltip, top, xUnitWidth, _i, _len, _ref2;
            columnGroup = new fabric.Group();
            chart = this.chart;
            series = this;
            data = this.getData();
            this.rects = [];
            dataLabelGroup = new fabric.Group();
            xUnitWidth = this.xAxis.getUnitWidth();
            chart = this.chart;
            columnWidth = chart.columnWidth;
            columnPadding = chart.columnPaddingValue;
            columnGroupPadding = chart.columnGroupPaddingValue;
            groupIndex = this.groupIndex || 0;
            startData = this.startData;
            endData = this.endData || data;
            haveStartData = startData !== void 0;
            dataLabels = this.get("dataLabels");
            template = xchart.template(dataLabels.format || "{value}");
            threshold = this.get("threshold");
            enableThreshold = typeof threshold === "number" && this.stack === void 0 && threshold >= this.yAxis.min;
            if (enableThreshold) {
                thresholdTop = this.yAxis.translate(threshold);
            }
            style = this.get("style");
            borderWidth = (_ref2 = style.borderWidth) != null ? _ref2 : 0;
            borderColor = style.borderColor;
            isRadar = this.xAxis instanceof xchart.RadarAxis;
            tooltip = chart.get("tooltip");
            scrollLeft = this.chart.scrollLeft || 0;
            renderToScrollLayer = this.chart.seriesScrollableReal;
            if (renderToScrollLayer) {
                startLeft = 0;
            } else {
                startLeft = seriesArea.left;
            }
            for (index = _i = 0, _len = endData.length; _i < _len; index = ++_i) {
                item = endData[index];
                top = this.yAxis.translate(item);
                height = void 0;
                color = this.color;
                if (!isRadar) {
                    if (haveStartData) {
                        bottom = this.yAxis.translate(startData[index]);
                        height = bottom - top;
                        if (height < 0) {
                            height = 0;
                        }
                    } else {
                        bottom = enableThreshold ? thresholdTop : this.yAxis.translate(this.yAxis.min);
                        height = enableThreshold && item < threshold ? top - bottom : bottom - top;
                        if (height < 0) {
                            height = 0;
                        }
                    }
                    rect = new fabric.Rect({left:startLeft - scrollLeft + xUnitWidth * index + columnGroupPadding / 2 + groupIndex * (columnPadding + columnWidth) + columnWidth / 2, top:enableThreshold && item < threshold ? top - height / 2 : top + height / 2, width:columnWidth - borderWidth, height:height - borderWidth, stroke:borderWidth !== 0 ? borderColor : null, strokeWidth:borderWidth, hasBorders:borderWidth !== 0, fill:color});
                    this.rects.push(rect);
                    rect.dataIndex = index;
                    if (!tooltip.shared) {
                        rect.series = series;
                        rect.on("mouseenter", function () {
                            return chart.showTip(series.getTooltipForPoint(this.dataIndex), this);
                        });
                        rect.on("mouseleave1", function () {
                            return chart.hideTip();
                        });
                    } else {
                        this.exportPoint(rect, index);
                    }
                    rect.on("click", function () {
                        return series.fireClickEvent(this.dataIndex);
                    });
                    layer.add(rect);
                    text = template({label:this.xAxis.getLabel(index), value:item, series:{title:this.title, color:this.color}});
                    if (dataLabels.enabled) {
                        this.createDataLabel(dataLabelGroup, text, {left:rect.left - rect.width / 2, top:rect.top - rect.height / 2, width:rect.width, height:rect.height});
                    }
                } else {
                    if (haveStartData) {
                        startValue = startData[index];
                        arc = this.xAxis.translateArc(index, startValue, item, color);
                    } else {
                        arc = this.xAxis.translateArc(index, null, item, color);
                    }
                    arc.dataIndex = index;
                    arc.on("mouseenter", function () {
                        return chart.showTip(series.getTooltipForPoint(this.dataIndex), this);
                    });
                    arc.on("mouseleave1", function () {
                        return chart.hideTip();
                    });
                    arc.on("click", function () {
                        return series.fireClickEvent(this.dataIndex);
                    });
                    layer.add(arc);
                }
            }
            layer.add(columnGroup);
            return layer.add(dataLabelGroup);
        };
        return Column;
    })(xchart.Cartesian);
    xchart.Bar = Bar;
    xchart.Column = Column;
}).call(this);
(function () {
    var Scatter, _ref, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Scatter = (function (_super) {
        __extends(Scatter, _super);
        function Scatter() {
            _ref = Scatter.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Scatter.prototype.themePath = "scatter";
        Scatter.prototype.markerStyle = null;
        Scatter.prototype.markerHoverStyle = null;
        Scatter.prototype.lineWidth = 0;
        Scatter.prototype.highlightPoint = function (point) {
            return this.highlightMarker(point);
        };
        Scatter.prototype.unhighlightPoint = function (point) {
            return this.unhighlightMarker(point);
        };
        Scatter.prototype.createDataLabel = function (text, symbolRect) {
            var dataLabels;
            dataLabels = this.get("dataLabels");
            return xchart.createDataLabelForSymbol(dataLabels, text, symbolRect);
        };
        Scatter.prototype.getData = function () {
            var bindingConfig, data, index, item, itemValue, result, _i, _j, _len, _len1;
            bindingConfig = this.bindingConfig || this._bindingConfig;
            data = this.doGetData() || [];
            if (bindingConfig && bindingConfig.yProperty && bindingConfig.xProperty) {
                result = [];
                for (_i = 0, _len = data.length; _i < _len; _i++) {
                    item = data[_i];
                    itemValue = parseFloat(item[bindingConfig.yProperty]);
                    if (isNaN(itemValue)) {
                        itemValue = 0;
                    }
                    result.push({x:item[bindingConfig.xProperty], y:itemValue});
                }
                return result;
            } else {
                result = [];
                for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
                    item = data[index];
                    itemValue = parseFloat(item.y);
                    if (isNaN(itemValue)) {
                        itemValue = 0;
                    }
                    result[index] = {x:item.x, y:itemValue};
                }
                return result;
            }
        };
        Scatter.prototype.getMinMaxYValues = function () {
            var data, firstItem, item, itemValue, max, min, _i, _len;
            data = this.getData();
            if (data.length === 0) {
                return {min:0, max:10};
            }
            firstItem = parseFloat(data[0].y);
            if (isNaN(firstItem)) {
                firstItem = 0;
            }
            min = firstItem;
            max = firstItem;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                item = data[_i];
                itemValue = parseFloat(item.y);
                if (isNaN(itemValue)) {
                    itemValue = 0;
                }
                if (itemValue > max) {
                    max = itemValue;
                }
                if (itemValue < min) {
                    min = itemValue;
                }
            }
            return {min:min, max:max};
        };
        Scatter.prototype.getMinMaxXValues = function () {
            var data, firstItem, item, itemValue, max, min, _i, _len;
            data = this.getData();
            if (data.length === 0) {
                return {min:0, max:1};
            }
            firstItem = parseFloat(data[0].x);
            if (isNaN(firstItem)) {
                firstItem = 0;
            }
            min = firstItem;
            max = firstItem;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                item = data[_i];
                itemValue = parseFloat(item.x);
                if (isNaN(itemValue)) {
                    itemValue = 0;
                }
                if (itemValue > max) {
                    max = itemValue;
                }
                if (itemValue < min) {
                    min = itemValue;
                }
            }
            return {min:min, max:max};
        };
        Scatter.prototype.getValueForPoint = function (index, tooltip) {
            var data;
            data = this.getData();
            return {x:data[index].x, y:xchart.formatPointValue(data[index].y, tooltip)};
        };
        Scatter.prototype.render = function (layer, seriesArea) {
            var chart, data, dataLabelGroup, dataLabels, index, item, left, linePath, lineWidth, marker, markerEnabled, markerFill, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, markerHoverStyle, markerStroke, markerStrokeWidth, markerStyle, markers, needDrawLine, series, style, symbolType, template, text, top, _i, _j, _len, _len1, _ref1, _ref2;
            chart = this.chart;
            series = this;
            dataLabelGroup = new fabric.Group();
            data = this.getData();
            style = this.get("style") || {};
            lineWidth = style.lineWidth;
            needDrawLine = typeof lineWidth === "number" && lineWidth !== 0;
            markerStyle = this.get("markerStyle") || {};
            markerHoverStyle = this.get("markerHoverStyle") || {};
            dataLabels = this.get("dataLabels");
            template = xchart.template(dataLabels.format || "{x}: {value}");
            if (needDrawLine) {
                linePath = new xchart.Path;
            }
            markerEnabled = (_ref1 = markerStyle.enabled) != null ? _ref1 : true;
            markerFill = markerStyle.backgroundColor || this.color;
            markerStroke = markerStyle.borderColor || xchart.darken(markerFill, 20);
            markerStrokeWidth = markerStyle.borderWidth;
            symbolType = markerStyle.symbolType;
            markerHoverEnabled = (_ref2 = markerHoverStyle.enabled) != null ? _ref2 : true;
            markerHoverFill = markerHoverStyle.backgroundColor || this.color;
            markerHoverStroke = markerHoverStyle.borderColor || xchart.darken(markerHoverFill || this.color, 20);
            markerHoverStrokeWidth = markerHoverStyle.borderWidth;
            markers = [];
            for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                item = data[index];
                left = this.xAxis.translate(item.x);
                top = this.yAxis.translate(item.y || 0);
                if (needDrawLine) {
                    if (index === 0) {
                        linePath.moveTo(left, top);
                    } else {
                        linePath.lineTo(left, top);
                    }
                }
                text = template({value:item.y, x:item.x, series:{title:this.title, color:this.color}});
                if (dataLabels.enabled) {
                    dataLabelGroup.add(this.createDataLabel(text, {left:left - 5, top:top - 5, width:10, height:10}));
                }
                marker = xchart.createMarker(markerStyle, markerEnabled, markerFill, markerStroke, markerStrokeWidth, symbolType, markerHoverStyle, markerHoverEnabled, markerHoverFill, markerHoverStroke, markerHoverStrokeWidth, left, top, index, chart, series, true);
                markers.push(marker);
            }
            if (needDrawLine) {
                layer.add(linePath.toFabricPath({stroke:this.color, strokeWidth:lineWidth || 1, fill:""}));
            }
            for (_j = 0, _len1 = markers.length; _j < _len1; _j++) {
                marker = markers[_j];
                layer.add(marker);
            }
            return layer.add(dataLabelGroup);
        };
        return Scatter;
    })(xchart.Cartesian);
    xchart.Scatter = Scatter;
}).call(this);
(function () {
    var Bubble, _ref, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    Bubble = (function (_super) {
        __extends(Bubble, _super);
        function Bubble() {
            _ref = Bubble.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Bubble.prototype.themePath = "bubble";
        Bubble.prototype.style = null;
        Bubble.prototype.bubbleMinRadius = 4;
        Bubble.prototype.bubbleMaxRadius = "auto";
        Bubble.prototype.createDataLabel = function (text, symbolRect) {
            var dataLabels;
            dataLabels = this.get("dataLabels");
            return xchart.createDataLabelForSymbol(dataLabels, text, symbolRect);
        };
        Bubble.prototype.getData = function () {
            var bindingConfig, data, index, item, itemValue, result, value, _i, _j, _len, _len1;
            bindingConfig = this.bindingConfig || this._bindingConfig;
            data = this.doGetData() || [];
            result = [];
            if (bindingConfig && bindingConfig.yProperty && bindingConfig.xProperty && bindingConfig.valueProperty) {
                for (_i = 0, _len = data.length; _i < _len; _i++) {
                    item = data[_i];
                    itemValue = parseFloat(item[bindingConfig.yProperty]);
                    if (isNaN(itemValue)) {
                        itemValue = 0;
                    }
                    value = parseFloat(item[bindingConfig.valueProperty]);
                    if (isNaN(value)) {
                        value = 0;
                    }
                    result.push({x:item[bindingConfig.xProperty], y:itemValue, value:value});
                }
                return result;
            } else {
                for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
                    item = data[index];
                    itemValue = parseFloat(item.y);
                    if (isNaN(itemValue)) {
                        itemValue = 0;
                    }
                    value = parseFloat(item.value);
                    if (isNaN(value)) {
                        value = 0;
                    }
                    result[index] = {x:item.x, y:itemValue, value:value};
                }
                return result;
            }
        };
        Bubble.prototype.getMinMaxYValues = function () {
            var data, firstItem, item, itemValue, max, min, _i, _len;
            data = this.getData();
            if (data.length === 0) {
                return {min:0, max:10};
            }
            firstItem = parseFloat(data[0].y);
            if (isNaN(firstItem)) {
                firstItem = 0;
            }
            min = firstItem;
            max = firstItem;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                item = data[_i];
                itemValue = parseFloat(item.y);
                if (isNaN(itemValue)) {
                    itemValue = 0;
                }
                if (itemValue > max) {
                    max = itemValue;
                }
                if (itemValue < min) {
                    min = itemValue;
                }
            }
            return {min:min, max:max};
        };
        Bubble.prototype.getMinMaxXValues = function () {
            var data, firstItem, item, itemValue, max, min, _i, _len;
            data = this.getData();
            if (data.length === 0) {
                return {min:0, max:1};
            }
            firstItem = parseFloat(data[0].x);
            if (isNaN(firstItem)) {
                firstItem = 0;
            }
            min = firstItem;
            max = firstItem;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
                item = data[_i];
                itemValue = parseFloat(item.x);
                if (isNaN(itemValue)) {
                    itemValue = 0;
                }
                if (itemValue > max) {
                    max = itemValue;
                }
                if (itemValue < min) {
                    min = itemValue;
                }
            }
            return {min:min, max:max};
        };
        Bubble.prototype.getValueForPoint = function (index, tooltip) {
            var data;
            data = this.getData();
            return {x:data[index].x, y:xchart.formatPointValue(data[index].y, tooltip), value:data[index].value};
        };
        Bubble.prototype.render = function (layer, seriesArea) {
            var bottom, bottomInsideRadius, bubbleSize, chart, data, dataCount, dataLabelGroup, dataLabels, index, item, leftInsideRadius, maxRadius, maxValue, minRadius, pointLeft, pointRadius, pointTop, right, rightInsideRadius, series, style, symbol, template, text, topInsideRadius, unitValue, x, y, _i, _j, _len, _len1;
            chart = this.chart;
            series = this;
            dataLabelGroup = new fabric.Group();
            data = this.getData();
            style = this.get("style") || {};
            dataLabels = this.get("dataLabels");
            template = xchart.template(dataLabels.format || "{x}: {value}");
            minRadius = this.bubbleMinRadius;
            maxRadius = this.bubbleMaxRadius;
            maxValue = _.max(data, function (value) {
                return value.value;
            });
            if (maxRadius === "auto") {
                bottom = seriesArea.top + seriesArea.height;
                right = seriesArea.left + seriesArea.width;
                dataCount = data.length;
                maxRadius = Math.floor(seriesArea.height / dataCount / 2);
                for (_i = 0, _len = data.length; _i < _len; _i++) {
                    item = data[_i];
                    pointTop = this.yAxis.translate(item.y);
                    pointLeft = this.xAxis.translate(item.x);
                    pointRadius = item.value * maxRadius / maxValue.value;
                    topInsideRadius = pointTop - pointRadius;
                    bottomInsideRadius = bottom - pointTop;
                    if (topInsideRadius < pointRadius) {
                        maxRadius = topInsideRadius / item.value * maxValue.value;
                    }
                    if (bottomInsideRadius < pointRadius) {
                        maxRadius = bottomInsideRadius / item.value * maxValue.value;
                    }
                    leftInsideRadius = pointLeft - pointRadius;
                    rightInsideRadius = right - pointLeft;
                    if (leftInsideRadius < pointRadius) {
                        maxRadius = leftInsideRadius / item.value * maxValue.value;
                    }
                    if (rightInsideRadius < pointRadius) {
                        maxRadius = rightInsideRadius / item.value * maxValue.value;
                    }
                }
            }
            unitValue = maxRadius / maxValue.value;
            for (index = _j = 0, _len1 = data.length; _j < _len1; index = ++_j) {
                item = data[index];
                x = this.xAxis.translate(item.x);
                y = this.yAxis.translate(item.y || 0);
                bubbleSize = unitValue * item.value + style.borderWidth;
                if (bubbleSize < minRadius) {
                    bubbleSize = minRadius;
                }
                text = template({value:item.y, x:item.x, series:{title:this.title, color:this.color}});
                if (dataLabels.enabled) {
                    dataLabelGroup.add(this.createDataLabel(text, {left:x - 5, top:y + 8, width:10, height:10}));
                }
                symbol = xchart.createSymbol("circle", {fill:this.color, stroke:style.borderColor || xchart.darken(this.color, 20), strokeWidth:style.borderWidth, size:bubbleSize, left:x, top:y});
                symbol.dataIndex = index;
                symbol.on("mouseenter", function () {
                    return chart.showTip(series.getTooltipForPoint(this.dataIndex), this);
                });
                symbol.on("mouseleave", function () {
                    return chart.hideTip();
                });
                symbol.on("click", function () {
                    return series.fireClickEvent(this.dataIndex);
                });
                layer.add(symbol);
            }
            return layer.add(dataLabelGroup);
        };
        return Bubble;
    })(xchart.Cartesian);
    xchart.Bubble = Bubble;
}).call(this);
(function () {
    var Pie, _ref, __hasProp = {}.hasOwnProperty, __extends = function (child, parent) {
        for (var key in parent) {
            if (__hasProp.call(parent, key)) {
                child[key] = parent[key];
            }
        }
        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    };
    xchart.isNumber = function (str) {
        return typeof str === "number" || /^-?[0-9,\.]+$/g.test(str != null ? str : "");
    };
    xchart.createDataLabelForSlice = function (group, seriesArea, dataLabels, text, slice) {
        var angleExtent, angleStart, endPoint, labelPadding, middleAngle, points, sliceMiddleHeight, startPoint, textLeft, textSize, textTop, _ref;
        textSize = xchart.TextMetrics.measure({text:text, fontFamily:dataLabels.fontFamily, fontSize:(_ref = dataLabels.fontSize) != null ? _ref : 12});
        labelPadding = dataLabels.labelPadding || 4;
        angleStart = slice.angleStart - 90;
        angleExtent = slice.angleExtent;
        middleAngle = (angleStart + angleExtent / 2 + 360) % 360;
        sliceMiddleHeight = slice.radius * slice.angleExtent / 360 * 2;
        if (dataLabels.hideOnOverflow && (textSize.height > sliceMiddleHeight || textSize.width > slice.radius)) {
            return;
        }
        startPoint = {x:Math.floor(slice.centerX + Math.cos(xchart.toRadians(middleAngle)) * (slice.radius + 2)) + 0.5, y:Math.floor(slice.centerY + Math.sin(xchart.toRadians(middleAngle)) * (slice.radius + 2)) + 0.5};
        endPoint = {x:Math.floor(slice.centerX + Math.cos(xchart.toRadians(middleAngle)) * (slice.radius + 2 + 15)) + 0.5, y:Math.floor(slice.centerY + Math.sin(xchart.toRadians(middleAngle)) * (slice.radius + 2 + 15)) + 0.5};
        points = [startPoint, endPoint];
        textLeft = void 0;
        textTop = endPoint.y;
        if (middleAngle > 90 && middleAngle < 270) {
            points.push({x:endPoint.x - 20, y:endPoint.y});
            textLeft = endPoint.x - 20 - textSize.width / 2 - labelPadding;
        } else {
            points.push({x:endPoint.x + 20, y:endPoint.y});
            textLeft = endPoint.x + 20 + textSize.width / 2 + labelPadding;
        }
        if (dataLabels.hideOnOverflow) {
            if (textLeft - textSize.width / 2 < seriesArea.left || textLeft - textSize.width / 2 + textSize.width > seriesArea.left + seriesArea.width) {
                return;
            }
            if (textTop < seriesArea.top || textTop > seriesArea.top + seriesArea.height) {
                return;
            }
        }
        group.add(new fabric.Polyline(points, {stroke:"#000000", strokeWidth:1, fill:""}, true));
        return group.add(new fabric.Text(text, {fontSize:dataLabels.fontSize, angle:dataLabels.rotation || 0, left:textLeft, top:textTop, fontFamily:dataLabels.fontFamily, fill:dataLabels.color}));
    };
    Pie = (function (_super) {
        __extends(Pie, _super);
        function Pie() {
            _ref = Pie.__super__.constructor.apply(this, arguments);
            return _ref;
        }
        Pie.prototype.themePath = "pie";
        Pie.prototype.type = "pie";
        Pie.prototype.showInLegend = false;
        Pie.prototype.percentageDecimals = 1;
        Pie.prototype.donut = false;
        Pie.prototype.colors = null;
        Pie.prototype.style = null;
        Pie.prototype.createDataLabel = function (group, seriesArea, text, slice) {
            return xchart.createDataLabelForSlice(group, seriesArea, this.get("dataLabels"), text, slice);
        };
        Pie.prototype.getData = function () {
            var bindingConfig, cacheData, data, index, item, label, result, total, value, _i, _j, _k, _l, _len, _len1, _len2, _len3;
            bindingConfig = this.bindingConfig || this._bindingConfig;
            data = this.doGetData() || [];
            this.dataVisible = this.dataVisible || [];
            total = 0;
            cacheData = null;
            if (bindingConfig && bindingConfig.valueProperty && bindingConfig.labelProperty) {
                result = [];
                for (index = _i = 0, _len = data.length; _i < _len; index = ++_i) {
                    item = data[index];
                    value = item[bindingConfig.valueProperty];
                    label = item[bindingConfig.labelProperty];
                    result.push({value:value, label:label});
                    if (this.dataVisible[index] !== false) {
                        total = total + value;
                    }
                }
                for (_j = 0, _len1 = result.length; _j < _len1; _j++) {
                    item = result[_j];
                    if (this.dataVisible[index] !== false) {
                        item.percentage = (item.value / total * 100).toFixed(this.get("percentageDecimals") || 1);
                    }
                    item.series = {title:this.title, color:this.color};
                }
                cacheData = result;
            } else {
                for (index = _k = 0, _len2 = data.length; _k < _len2; index = ++_k) {
                    item = data[index];
                    if (this.dataVisible[index] !== false) {
                        total = total + item.value;
                    }
                }
                for (_l = 0, _len3 = data.length; _l < _len3; _l++) {
                    item = data[_l];
                    item.percentage = (item.value / total * 100).toFixed(this.get("percentageDecimals") || 1);
                    item.series = {title:this.title, color:this.color};
                }
                cacheData = data;
            }
            this.cacheData = cacheData;
            return cacheData;
        };
        Pie.prototype.getLegendColor = function (index) {
            return this.colors[index % this.colors.length];
        };
        Pie.prototype.isLegendVisible = function (index) {
            if (this.dataVisible) {
                return this.dataVisible[index] !== false;
            } else {
                return true;
            }
        };
        Pie.prototype.doOnLegendClick = function (index) {
            this.dataVisible[index] = this.dataVisible[index] === void 0 ? false : !this.dataVisible[index];
            return this.chart.redraw();
        };
        Pie.prototype.showAnimate = function () {
            var angleExtent, angleStart, arc, chart, index, _i, _len, _ref1, _results;
            chart = this.chart;
            _ref1 = this.arcs;
            _results = [];
            for (index = _i = 0, _len = _ref1.length; _i < _len; index = ++_i) {
                arc = _ref1[index];
                this.cacheData[arc.dataIndex].arcIndex = index;
                angleStart = arc.angleStart;
                angleExtent = arc.angleExtent;
                arc.set({"angleStart":0, "angleExtent":0});
                if (index === this.arcs.length - 1) {
                    _results.push(arc.anim({angleStart:angleStart, angleExtent:angleExtent}, {duration:500, onChange:function () {
                        return chart.layer.renderAll();
                    }}));
                } else {
                    _results.push(arc.anim({angleStart:angleStart, angleExtent:angleExtent}, {duration:500}));
                }
            }
            return _results;
        };
        Pie.prototype.getValueForPoint = function (index, tooltip) {
            var data;
            data = this.cacheData;
            return {x:data[index].label, y:xchart.formatPointValue(data[index].value, tooltip), percentage:data[index].percentage + "%"};
        };
        Pie.prototype.getTooltipForPoint = function (index) {
            var pointFormat, template, tooltip, value;
            if (index === void 0) {
                return;
            }
            tooltip = this.getTooltip();
            value = this.getValueForPoint(index, tooltip);
            pointFormat = tooltip.pointFormat;
            template = xchart.template(pointFormat);
            return template({series:{title:this.title, color:this.color}, color:this.arcs[this.cacheData[index].arcIndex].fill, label:value.x, value:value.y, percentage:value.percentage});
        };
        Pie.prototype.getSliceOfAngle = function (angle) {
            var arc, _i, _len, _ref1;
            if (angle === void 0) {
                return null;
            }
            _ref1 = this.arcs;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                arc = _ref1[_i];
                if (arc.angleStart < angle && arc.angleStart + arc.angleExtent > angle) {
                    return arc;
                }
            }
            return null;
        };
        Pie.prototype.setActiveSlice = function (arc, offset) {
            var defaultOffset, style, _ref1;
            style = this.get("style");
            defaultOffset = (_ref1 = style.defaultOffset) != null ? _ref1 : 2;
            if (this.activeSlice) {
                this.activeSlice.setOffset(defaultOffset);
                if (this.activeSlice === arc) {
                    this.chart.layer.renderAll();
                    this.activeSlice = null;
                    return;
                }
                this.activeSlice = null;
            }
            arc.setOffset(offset);
            this.activeSlice = arc;
            return this.chart.layer.renderAll();
        };
        Pie.prototype.highlightPoint = function () {
        };
        Pie.prototype.unhighlightPoint = function () {
        };
        Pie.prototype.render = function (layer, seriesArea) {
            var angleExtent, arc, borderWidth, centerX, centerY, chart, color, colors, data, dataLabels, defaultOffset, getQuadrant, group, height, i, innerSize, item, lastAngle, left, maskRect, series, setCenter, setSize, showInLegend, size, slicedOffset, style, template, top, width, _i, _len, _ref1, _ref2, _ref3;
            left = seriesArea.left;
            top = seriesArea.top;
            width = seriesArea.width;
            height = seriesArea.height;
            chart = this.chart;
            colors = this.colors;
            series = this;
            style = this.get("style");
            dataLabels = this.get("dataLabels");
            showInLegend = this.get("showInLegend");
            data = showInLegend ? this.cacheData : this.getData();
            group = new fabric.Group;
            template = xchart.template(dataLabels.format || "{label}: {percentage}%");
            lastAngle = 0;
            setSize = style.size;
            defaultOffset = (_ref1 = style.defaultOffset) != null ? _ref1 : 2;
            slicedOffset = (_ref2 = style.slicedOffset) != null ? _ref2 : 6;
            borderWidth = (_ref3 = style.borderWidth) != null ? _ref3 : 0;
            size = width > height ? height : width;
            if (typeof setSize === "string" && setSize.indexOf("%") !== -1) {
                size = size * parseInt(setSize, 10) / 100;
            } else {
                if (xchart.isNumber(setSize)) {
                    setSize = parseFloat(setSize);
                    if (setSize < 1) {
                        size = size * setSize;
                    } else {
                        size = setSize;
                    }
                }
            }
            innerSize = style.innerSize;
            if (typeof innerSize === "string" && innerSize.indexOf("%") !== -1) {
                innerSize = innerSize * parseInt(innerSize, 10) / 100;
            } else {
                if (xchart.isNumber(innerSize)) {
                    innerSize = parseFloat(innerSize);
                    if (innerSize > 1 || innerSize < 0) {
                        innerSize = null;
                    }
                } else {
                    innerSize = null;
                }
            }
            setCenter = (style.center || "").replace(/\s/g, "").split(",");
            if (!setCenter[0]) {
                setCenter[0] = "50%";
            }
            if (!setCenter[1]) {
                setCenter[1] = "50%";
            }
            if (typeof setCenter[0] === "string" && setCenter[0].indexOf("%") !== -1) {
                centerX = ~~(left + width * parseInt(setCenter[0], 10) / 100);
            } else {
                if (xchart.isNumber(setCenter[0])) {
                    centerX = ~~(parseFloat(setCenter[0]));
                } else {
                    centerX = ~~(left + width / 2);
                }
            }
            if (typeof setCenter[1] === "string" && setCenter[1].indexOf("%") !== -1) {
                centerY = ~~(top + height * parseInt(setCenter[1], 10) / 100);
            } else {
                if (xchart.isNumber(setCenter[1])) {
                    centerY = ~~(parseFloat(setCenter[1]));
                } else {
                    centerY = ~~(top + height / 2);
                }
            }
            this.arcs = [];
            for (i = _i = 0, _len = data.length; _i < _len; i = ++_i) {
                item = data[i];
                if (this.dataVisible[i] === false) {
                    continue;
                }
                angleExtent = item.percentage / 100 * 360;
                color = colors[i % colors.length];
                arc = new fabric.Arc({centerX:centerX, centerY:centerY, offset:defaultOffset, radius:size / 2, angleStart:lastAngle, angleExtent:angleExtent, innerSize:innerSize, stroke:"", strokeWidth:borderWidth, hasBorders:borderWidth !== 0, fill:color});
                arc.on("mouseenter1", function () {
                    return chart.showTip(series.getTooltipForPoint(this.dataIndex), this);
                });
                arc.on("mouseleave1", function () {
                    return chart.hideTip();
                });
                arc.on("click1", function () {
                    series.setActiveSlice(this, slicedOffset);
                    return series.fireClickEvent(this.dataIndex);
                });
                arc.dataIndex = i;
                arc.series = this;
                layer.add(arc);
                this.arcs.push(arc);
                if (dataLabels.enabled) {
                    this.createDataLabel(group, seriesArea, template(item), {angleStart:lastAngle, angleExtent:angleExtent, radius:size / 2, centerX:centerX, centerY:centerY});
                }
                lastAngle += angleExtent;
            }
            maskRect = new fabric.Circle({left:centerX, top:centerY, radius:size / 2 + 2, fill:"transparent", stroke:"", opacity:0.1});
            getQuadrant = function (point) {
                var result;
                result = void 0;
                if ((point.left - centerX + size / 2) > size / 2) {
                    if (point.top - centerY + size / 2 > size / 2) {
                        result = 1;
                    } else {
                        result = 4;
                    }
                } else {
                    if (point.top - centerY + size / 2 > size / 2) {
                        result = 2;
                    } else {
                        result = 3;
                    }
                }
                return result;
            };
            maskRect.on("click", function (event) {
                var angle, point, quadrant;
                quadrant = getQuadrant(event);
                angle = void 0;
                switch (quadrant) {
                  case 1:
                  case 3:
                    angle = Math.atan(Math.abs((event.top - centerY) / (event.left - centerX))) * 180 / Math.PI + (quadrant - 1) * 90;
                    break;
                  case 2:
                  case 4:
                    angle = Math.atan(Math.abs((event.left - centerX) / (event.top - centerY))) * 180 / Math.PI + (quadrant - 1) * 90;
                }
                point = series.getSliceOfAngle((angle + 90) % 360);
                series.setActiveSlice(point, slicedOffset);
                return series.fireClickEvent(point.dataIndex);
            });
            maskRect.on("mousemove", function (event) {
                var angle, point, quadrant;
                quadrant = getQuadrant(event);
                angle = void 0;
                switch (quadrant) {
                  case 1:
                  case 3:
                    angle = Math.atan(Math.abs((event.top - centerY) / (event.left - centerX))) * 180 / Math.PI + (quadrant - 1) * 90;
                    break;
                  case 2:
                  case 4:
                    angle = Math.atan(Math.abs((event.left - centerX) / (event.top - centerY))) * 180 / Math.PI + (quadrant - 1) * 90;
                }
                point = series.getSliceOfAngle((angle + 90) % 360);
                if (point) {
                    return chart.showTip(series.getTooltipForPoint(point.dataIndex), point);
                }
            });
            maskRect.on("mouseleave", function (event) {
                return chart.hideTip();
            });
            layer.add(maskRect);
            layer.add(group);
        };
        return Pie;
    })(xchart.Series);
    xchart.Pie = Pie;
}).call(this);
(function () {
    var defaultAxis, defaultLabelOptions, merge, theme;
    merge = xchart.merge;
    theme = {symbols:["circle", "diamond", "square", "triangle", "triangle-down"], chart:{style:{colors:["#3366CC", "#DC3913", "#FF9901", "#109618", "#990099", "#0099C6", "#DD4477", "#66AA01", "#B82E2D", "#316395", "#22AA99"], columnColors:null, lineColors:null, pieColors:null, paddingTop:10, paddingRight:10, paddingBottom:10, paddingLeft:10, backgroundColor:"#FFFFFF", borderColor:"#4572A7", borderWidth:0}, showGrid:"yaxis", showMinorGrid:"none", gridStyle:{lineColor:"#CCCCCC", lineWidth:1}, minorGridStyle:{lineColor:"#E0E0E0", lineWidth:1}, gridHorizontalAxis:"left", gridVerticalAxis:"bottom", tooltip:{backgroundColor:"#FFFFFF", opacity:0.95, borderColor:"#C0C0C0", borderWidth:1, borderRadius:5, color:"#333333", fontSize:12, padding:5, position:"top", enabled:true, snap:25, valueDecimals:0, valuePrefix:"", valueSuffix:"", shared:false, pointFormat:"<span style=\"\">{series.title}</span>: {value}<br/>", headerFormat:"", footerFormat:""}, titleStyle:{align:"center", color:"#000000", fontSize:30, paddingBottom:5}, subtitleStyle:{align:"center", color:"#6D869F", fontSize:12}, seriesOptions:{columnPadding:0.2, columnGroupPadding:1.6, barPadding:0.2, barGroupPadding:1.6}}, legend:{visible:true, align:"start", layout:"vertical", position:"right", style:{borderWidth:0, borderColor:"#909090", borderRadius:5, padding:5, itemPadding:10, labelPadding:4, margin:5, symbolWidth:16, fontSize:14, fontFamliy:"Verdana, Arial, Helvetica, sans-serif", symbolPadding:5}, itemStyle:{cursor:"pointer", color:"#3E576F"}, itemHoverStyle:{cursor:"pointer", color:"#000000"}, itemHiddenStyle:{color:"#C0C0C0"}}};
    defaultLabelOptions = {enabled:true, align:"center", verticalAlign:"bottom", labelPadding:4, color:"#222222", fontSize:12, fontFamily:"Verdana, Arial, Helvetica, sans-serif", lineHeight:"14px"};
    defaultAxis = {dateTimeLabelFormats:{second:"%H:%M:%S", minute:"%H:%M", hour:"%H:%M", day:"%e. %b", week:"%e. %b", month:"%b '%y", year:"%Y"}, startOfWeek:1, labels:defaultLabelOptions, tickmarkPlacement:"between", tickPixelInterval:100, titleStyle:{margin:4, align:"middle", color:"#222222", fontSize:16, fontWeight:"bold"}};
    theme.categoryAxis = merge(defaultAxis, {tickPosition:"outside", showGrid:null, gridStyle:{lineColor:"#CCCCCC", lineWidth:1}, showMinorGrid:null, minorGridStyle:{lineColor:"#E0E0E0", lineWidth:1}, style:{lineColor:"#C0C0C0", lineWidth:1}, tickStyle:{tickColor:"#CCCCCC", tickLength:5, tickWidth:1}});
    theme.numbericAxis = merge(defaultAxis, {style:{lineColor:"#C0C0C0", lineWidth:0}, startOnTick:false, endOnTick:false, minPadding:0.05, maxPadding:0.05, showGrid:null, gridStyle:{lineColor:"#CCCCCC", lineWidth:1}, showMinorGrid:null, minorGridStyle:{lineColor:"#E0E0E0", lineWidth:1}, minorTickPosition:"none", minorTickStyle:{tickCount:5, tickColor:"#E0E0E0", tickLength:2, tickWidth:1}, tickPosition:"outside", tickStyle:{tickColor:"#CCCCCC", tickLength:4, tickWidth:1}});
    theme.radarAxis = {style:{lineColor:"#C0C0C0", lineWidth:0}, minPadding:0.1, maxPadding:0.2, tickPosition:"outside", tickStyle:{tickColor:"#CCCCCC", tickLength:4, tickWidth:1}};
    theme.line = {animation:{duration:1000}, style:{lineWidth:2}, showInLegend:true, markerStyle:{enabled:false, symbolType:"circle", backgroundColor:null, borderColor:"#FFF", borderWidth:2, size:10}, markerHoverStyle:{enabled:true, backgroundColor:null, borderColor:"#FFF", borderWidth:0, size:12}, dataLabels:merge(defaultLabelOptions, {verticalAlign:"top", enabled:false, format:"{value}"})};
    theme.area = merge(theme.line, {dataLabels:merge(defaultLabelOptions, {verticalAlign:"top", enabled:false, format:"{value}"})});
    theme.scatter = merge(theme.line, {style:{lineWidth:0}, markerStyle:{enabled:true, symbolType:"circle", backgroundColor:null, borderColor:"#FFF", borderWidth:2, size:10}, markerHoverStyle:{enabled:true, backgroundColor:null, borderColor:"#FFF", borderWidth:2, size:14}, dataLabels:merge(defaultLabelOptions, {verticalAlign:"top", enabled:false, format:"{value}"})});
    theme.bubble = merge(theme.line, {style:{backgroundColor:null, borderColor:"#FFF", borderWidth:2, size:4}, dataLabels:merge(defaultLabelOptions, {verticalAlign:"top", enabled:false, format:"{value}"})});
    theme.bar = merge(theme.line, {symbol:null, style:{borderColor:"#FFF", borderWidth:0, borderRadius:0}, groupPadding:0.2, barPadding:0.1, dataLabels:merge(defaultLabelOptions, {hideOnOverflow:true, align:"innerright", enabled:false, format:"{value}", color:"#FFF"})});
    theme.column = merge(theme.line, {symbol:null, style:{borderColor:"#FFF", borderWidth:0, borderRadius:0}, groupPadding:0.2, columnPadding:0.1, dataLabels:merge(defaultLabelOptions, {hideOnOverflow:true, verticalAlign:"innertop", enabled:false, format:"{value}", color:"#FFF"})});
    theme.pie = merge(theme.line, {style:{center:"50%,50%", borderWidth:0, size:0.8, innerSize:null, defaultOffset:2, slicedOffset:6, borderColor:"#FFFFFF"}, dataLabels:{distance:30, format:"{label}: {percentage}%", hideOnOverflow:true, enabled:true, color:"#222222", borderWidth:1, borderColor:"transparent", fontSize:12, fontFamily:"Arial", lineHeight:"14px"}, tooltip:{pointFormat:"<span style=\"\">{label}</span>: <b>{percentage}</b><br/>"}, percentageDecimals:1, legendType:"point", symbol:null, showInLegend:false});
    xchart.themes["default"] = theme;
}).call(this);
(function () {
    var axisConstr, chartGetter, chartSetter, getComponentReference, newAxisDoSet, newDoGet, newDoSet, oldAxisSet, oldDoGet, oldDoSet, oldGet, oldNumbericAxisSet, oldRadarAxisSet, oldSet, radarAxisConstr, seriesContr, styleGetter, styleSetter;
    dorado.widget.xchart = xchart;
    seriesContr = xchart.Series.prototype.constructor;
    oldGet = xchart.Series.prototype.get;
    oldSet = xchart.Series.prototype.set;
    oldDoGet = dorado.AttributeSupport.prototype.doGet;
    oldDoSet = dorado.AttributeSupport.prototype.doSet;
    getComponentReference = dorado.widget.Component.getComponentReference;
    if (!getComponentReference) {
        getComponentReference = dorado.widget.ViewElement.getComponentReference;
    }
    newDoGet = function (attr) {
        if (this.ATTRIBUTES[attr] === void 0) {
            return oldGet.apply(this, arguments);
        } else {
            return oldDoGet.apply(this, arguments);
        }
    };
    newDoSet = function (attr, value) {
        if (this.ATTRIBUTES[attr] === void 0) {
            return oldSet.apply(this, arguments);
        } else {
            return oldDoSet.apply(this, arguments);
        }
    };
    dorado.Object.override(xchart.Series, new dorado.AttributeSupport());
    dorado.Object.override(xchart.Series, new dorado.EventSupport());
    dorado.Object.override(xchart.Series, new dorado.widget.DataControl());
    dorado.Object.override(xchart.Series, {ATTRIBUTES:{dataSet:{setter:function (dataSet) {
        if (this._dataSet) {
            this._dataSet.removeObserver(this);
        }
        dataSet = getComponentReference(this, "dataSet", dataSet);
        if (dataSet instanceof dorado.widget.DataSet) {
            this._dataSet = dataSet;
            return this._dataSet.addObserver(this);
        }
    }}, bindingConfig:{}}, EVENTS:{onClick:{}, onGetBindingData:{}, onGetBindingDataType:{}}, doGet:newDoGet, doSet:newDoSet});
    xchart.Series.prototype.constructor = function (options) {
        var bindingConfig, entityDataType, i, pd, properties, property, title;
        seriesContr.apply(this, arguments || []);
        $invokeSuper.call(this, arguments);
        bindingConfig = this.get("bindingConfig");
        title = this.get("title");
        if (!title) {
            if (bindingConfig && bindingConfig.yProperty) {
                property = bindingConfig.yProperty;
                entityDataType = this.getBindingDataType();
                pd = void 0;
                if (entityDataType) {
                    properties = property.split(".");
                    i = 0;
                    while (entityDataType) {
                        pd = entityDataType.getPropertyDef(properties[i]);
                        if (pd) {
                            if (i === properties.length - 1) {
                                break;
                            } else {
                                entityDataType = pd.getDataType();
                                if (!entityDataType || (entityDataType instanceof dorado.EntityDataType)) {
                                    pd = null;
                                    break;
                                }
                            }
                        } else {
                            break;
                        }
                        i++;
                    }
                    if (pd) {
                        return this.set("title", pd.get("label"));
                    }
                }
            }
        }
    };
    xchart.Series.include({diggData:function (bindingConfig, data) {
        var result, series;
        result = [];
        series = this;
        if (data instanceof dorado.Entity) {
            result.push(this.diggEntity(bindingConfig, data));
        } else {
            if (data instanceof dorado.EntityList) {
                data.each(function (entity) {
                    return result.push(series.diggEntity(bindingConfig, entity));
                });
            } else {
                if (data instanceof Array) {
                    data.each(function (record) {
                        if (record instanceof dorado.Entity) {
                            return result.push(this.diggEntity(bindingConfig, record));
                        } else {
                            if (record instanceof dorado.EntityList) {
                                return record.each(function (entity) {
                                    return result.push(series.diggEntity(bindingConfig, entity));
                                });
                            }
                        }
                    });
                }
            }
        }
        return result;
    }, diggEntity:function (bindingConfig, entity) {
        var binding, bindingMap, property, result;
        bindingMap = bindingConfig;
        result = {};
        for (binding in bindingMap) {
            property = bindingMap[binding];
            result[property] = entity.get(property);
        }
        return result;
    }, doGetData:function () {
        var bindingConfig, data;
        data = this.getBindingData({firstResultOnly:false});
        bindingConfig = this._bindingConfig;
        if (bindingConfig && data) {
            this.values = this.diggData(bindingConfig, data);
        }
        return this.values || [];
    }, processDataSetMessage:function (messageCode, arg, data) {
        switch (messageCode) {
          case dorado.widget.DataSet.MESSAGE_REFRESH:
            return this.chart.redrawDelay(30);
          case dorado.widget.DataSet.MESSAGE_DATA_CHANGED:
          case dorado.widget.DataSet.MESSAGE_REFRESH_ENTITY:
          case dorado.widget.DataSet.MESSAGE_DELETED:
          case dorado.widget.DataSet.MESSAGE_INSERTED:
          case dorado.widget.DataSet.MESSAGE_CURRENT_CHANGED:
            return this.chart.redrawDelay(30);
        }
    }});
    oldAxisSet = xchart.Axis.prototype.set;
    oldNumbericAxisSet = xchart.NumbericAxis.prototype.set;
    oldRadarAxisSet = xchart.RadarAxis.prototype.set;
    newAxisDoSet = function (attr, value) {
        if (this.ATTRIBUTES[attr] === void 0) {
            if (this instanceof xchart.NumbericAxis) {
                return oldNumbericAxisSet.apply(this, arguments);
            }
            if (this instanceof xchart.RadarAxis) {
                return oldRadarAxisSet.apply(this, arguments);
            }
            return oldAxisSet.apply(this, arguments);
        } else {
            return oldDoSet.apply(this, arguments);
        }
    };
    axisConstr = xchart.CategoryAxis.prototype.constructor;
    dorado.Object.override(xchart.CategoryAxis, new dorado.AttributeSupport());
    dorado.Object.override(xchart.CategoryAxis, new dorado.EventSupport());
    dorado.Object.override(xchart.CategoryAxis, new dorado.widget.DataControl());
    dorado.Object.override(xchart.CategoryAxis, {ATTRIBUTES:{dataSet:{setter:function (dataSet) {
        if (this._dataSet) {
            this._dataSet.removeObserver(this);
        }
        dataSet = getComponentReference(this, "dataSet", dataSet);
        if (dataSet instanceof dorado.widget.DataSet) {
            this._dataSet = dataSet;
            return this._dataSet.addObserver(this);
        }
    }}, properties:{path:"labelProperty"}, labelProperty:{}}, EVENTS:{onGetBindingData:{}, onGetBindingDataType:{}}, doGet:newDoGet, doSet:newAxisDoSet});
    xchart.CategoryAxis.prototype.constructor = function (options) {
        axisConstr.apply(this, arguments || []);
        return $invokeSuper.call(this, arguments);
    };
    xchart.CategoryAxis.include({diggData:function (property, data) {
        var result;
        result = [];
        if (data instanceof dorado.Entity) {
            result.push(data.get(property));
        } else {
            if (data instanceof dorado.EntityList) {
                data.each(function (entity) {
                    return result.push(entity.get(property));
                });
            } else {
                if (data instanceof Array) {
                    data.each(function (record) {
                        if (record instanceof dorado.Entity) {
                            return result.push(record.get(property));
                        } else {
                            if (record instanceof dorado.EntityList) {
                                return record.each(function (entity) {
                                    return result.push(entity.get(property));
                                });
                            }
                        }
                    });
                }
            }
        }
        return result;
    }, doGetCategories:function () {
        var data, labelProperty;
        data = this.getBindingData({firstResultOnly:false});
        labelProperty = this.labelProperty || this._labelProperty;
        if (labelProperty && data) {
            this.categories = this.diggData(labelProperty, data);
        }
        return this.categories || [1];
    }});
    radarAxisConstr = xchart.RadarAxis.prototype.constructor;
    dorado.Object.override(xchart.RadarAxis, new dorado.AttributeSupport());
    dorado.Object.override(xchart.RadarAxis, new dorado.EventSupport());
    dorado.Object.override(xchart.RadarAxis, new dorado.widget.DataControl());
    dorado.Object.override(xchart.RadarAxis, {ATTRIBUTES:{dataSet:{setter:function (dataSet) {
        if (this._dataSet) {
            this._dataSet.removeObserver(this);
        }
        dataSet = getComponentReference(this, "dataSet", dataSet);
        if (dataSet instanceof dorado.widget.DataSet) {
            this._dataSet = dataSet;
            return this._dataSet.addObserver(this);
        }
    }}, properties:{path:"labelProperty"}, labelProperty:{}}, EVENTS:{onGetBindingData:{}, onGetBindingDataType:{}}, doGet:newDoGet, doSet:newAxisDoSet});
    xchart.RadarAxis.prototype.constructor = function (options) {
        radarAxisConstr.apply(this, arguments || []);
        return $invokeSuper.call(this, arguments);
    };
    xchart.RadarAxis.include({diggData:function (property, data) {
        var result;
        result = [];
        if (data instanceof dorado.Entity) {
            result.push(data.get(property));
        } else {
            if (data instanceof dorado.EntityList) {
                data.each(function (entity) {
                    return result.push(entity.get(property));
                });
            } else {
                if (data instanceof Array) {
                    data.each(function (record) {
                        if (record instanceof dorado.Entity) {
                            return result.push(record.get(property));
                        } else {
                            if (record instanceof dorado.EntityList) {
                                return record.each(function (entity) {
                                    return result.push(entity.get(property));
                                });
                            }
                        }
                    });
                }
            }
        }
        return result;
    }, doGetCategories:function () {
        var data, labelProperty;
        data = this.getBindingData({firstResultOnly:false});
        labelProperty = this.labelProperty || this._labelProperty;
        if (labelProperty && data) {
            this.categories = this.diggData(labelProperty, data);
        }
        return this.categories || [1];
    }});
    chartGetter = function (attr, value) {
        return this.chart.get(attr);
    };
    chartSetter = function (value, attr) {
        return this.chart.set(attr, value);
    };
    styleGetter = function (attr, value) {
        return this.chart.get("style");
    };
    styleSetter = function (value, attr) {
        return this.chart.set("style", value);
    };
    dorado.widget.xchart.XChart = $extend(dorado.widget.Control, {ATTRIBUTES:{chart:{}, axes:{setter:chartSetter, getter:chartGetter}, series:{setter:chartSetter, getter:chartGetter}, title:{setter:chartSetter, getter:chartGetter}, legend:{setter:chartSetter, getter:chartGetter}, seriesOptions:{setter:chartSetter, getter:chartGetter}, chartStyle:{setter:styleSetter, getter:styleGetter}, tooltip:{setter:chartSetter, getter:chartGetter}, titleStyle:{setter:chartSetter, getter:chartGetter}}, constructor:function () {
        this.chart = new xchart.Chart;
        this.chart.enableRedrawDelay = false;
        return $invokeSuper.call(this, arguments);
    }, doOnResize:function () {
        var _ref, _ref1, _ref2, _ref3;
        if ((_ref = this.chart) != null) {
            _ref.width = this.getRealWidth();
        }
        if ((_ref1 = this.chart) != null) {
            _ref1.height = this.getRealHeight();
        }
        if (((_ref2 = this.chart) != null ? _ref2.height : void 0) > 30) {
            return (_ref3 = this.chart) != null ? _ref3.redraw() : void 0;
        }
    }, refreshDom:function () {
        var _ref;
        $invokeSuper.call(this, arguments);
        return (_ref = this.chart) != null ? _ref.redraw() : void 0;
    }, doOnAttachToDocument:function () {
        $invokeSuper.call(this, arguments);
        this.chart.set({width:this.getRealWidth(), height:this.getRealHeight()});
        return this.chart.render(this._dom);
    }, getSeries:function (index) {
        return this.chart.getSeries(index);
    }, addSeries:function (series, index) {
        return this.chart.addSeries(series, index);
    }, removeSeries:function (index) {
        return this.chart.removeSeries(index);
    }, clearSeries:function () {
        return this.chart.clearSeries();
    }});
}).call(this);

